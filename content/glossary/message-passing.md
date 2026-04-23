+++
title = "Message Passing"
weight = 32
[extra]
category = "otp"
description = "BEAM's fundamental communication mechanism where processes exchange data by sending immutable messages to each other's mailboxes, enforcing isolation and enabling distribution."
related_terms = ["beam", "genserver", "otp", "pubsub", "channel", "process-isolation", "fault-tolerance", "pattern-matching", "backpressure", "distributed-system"]
tags = ["otp", "concurrency", "beam", "communication", "distributed-systems", "fault-tolerance"]
keywords = ["message passing", "BEAM processes", "send receive", "GenServer call cast", "process mailbox", "selective receive", "distributed Erlang", "process isolation", "asynchronous messaging", "inter-process communication"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "Concurrency & Distribution"
implementation_status = "production"
authority_level = "platform-core"
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "1.0.0"
acronym = ""
difficulty_level = "intermediate"
importance = "critical"
prerequisites = ["beam", "process-isolation", "genserver"]
learning_path = ["beam", "process-isolation", "message-passing", "genserver", "pubsub", "distributed-system"]
word_count = 2093
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Message Passing - Prismatic Platform"
+++

## Definition

Message passing is the sole mechanism by which [BEAM](@/glossary/beam.md) processes communicate. Processes cannot access each other's memory directly; instead, they send messages that are deep-copied into the recipient's mailbox. The recipient process selectively matches and retrieves messages using `receive` blocks or [GenServer](@/glossary/genserver.md) callbacks. This architectural choice -- shared-nothing concurrency with asynchronous message passing -- is the foundation of Erlang/OTP's legendary reliability and the enabling mechanism for the Prismatic Platform's distributed, fault-tolerant architecture.

The message passing model eliminates entire categories of concurrency bugs that plague shared-memory systems: race conditions on mutable state, lock contention, deadlocks from lock ordering, priority inversion, and memory corruption from concurrent access. These bugs are not merely unlikely in BEAM -- they are structurally impossible because there is no shared mutable state to race on, no locks to contend for, and no memory that multiple processes can simultaneously modify. The price paid for this guarantee is the CPU cost of message copying, which the BEAM runtime minimizes through efficient memory allocation and, for large binaries, reference-counted sharing.

Message passing also enables transparent distribution: sending a message to a process on another BEAM node uses identical syntax and semantics as local messaging. The BEAM runtime handles serialization, network transport, and delivery. This transparency means that code written for a single node can be distributed across a cluster without modification -- a property the Prismatic Platform leverages for horizontal scaling of its 530-agent architecture across multiple nodes.

## Overview

The concept of message passing in concurrent systems predates the BEAM by several decades. Tony Hoare's Communicating Sequential Processes (CSP, 1978) and Carl Hewitt's Actor Model (1973) established the theoretical foundations for process-based concurrency without shared state. The Erlang language, designed at Ericsson in the late 1980s for telecommunications systems, adopted the actor model as its core concurrency primitive, and the BEAM virtual machine was purpose-built to execute millions of lightweight processes communicating exclusively through message passing.

In the Prismatic Platform, message passing is not an implementation detail but an architectural principle. Every interaction between the platform's 530+ AIAD agents, every telemetry event propagated to monitoring dashboards, every real-time UI update pushed through Phoenix LiveView, and every supervision signal flowing through the process hierarchy uses message passing as its transport. Understanding message passing is therefore prerequisite to understanding the platform's architecture at any level.

| Aspect | Description |
|--------|-------------|
| **Model** | Actor model with mailbox-based asynchronous messaging |
| **Isolation** | Complete process isolation; no shared mutable state |
| **Copying** | Deep copy semantics (except large binaries: reference-counted) |
| **Distribution** | Transparent across BEAM nodes via Distributed Erlang |
| **Ordering** | Per-pair FIFO guaranteed; no global ordering |
| **Delivery** | At-most-once by default; higher guarantees layered on top |

## Fundamental Primitives

BEAM message passing is built on three primitives: `send`, `receive`, and process identification.

### send/2

The `send/2` function (or `Kernel.send/2`) delivers a message to a process's mailbox. It is asynchronous: the sender does not wait for the recipient to process the message.

```elixir
# Send a message to a process by PID
send(pid, {:security_finding, %{ip: "192.168.1.1", severity: :high}})

# Send to a registered process by name
send(:asset_registry, {:register_asset, asset})

# Send to a process on a remote node
send({:asset_registry, :"prismatic@node2"}, {:register_asset, asset})
```

Key properties of `send/2`:

| Property | Description |
|----------|-------------|
| **Asynchronous** | Returns immediately; does not wait for delivery or processing |
| **Non-blocking** | Never blocks the sender, regardless of recipient state |
| **Copy semantics** | Message is deep-copied into recipient's heap |
| **Always succeeds** | Never raises, even if recipient process has crashed |
| **Returns message** | Return value is the sent message (useful for piping) |

### receive/1

The `receive` block pattern-matches against messages in the process mailbox, extracting and processing matching messages.

```elixir
receive do
  {:security_finding, %{severity: :critical} = finding} ->
    handle_critical_finding(finding)

  {:security_finding, %{severity: severity} = finding} when severity in [:high, :medium] ->
    queue_for_review(finding)

  {:heartbeat, timestamp} ->
    update_last_seen(timestamp)

after
  5_000 ->
    # Timeout: no matching message in 5 seconds
    handle_timeout()
end
```

### Selective Receive

BEAM's selective receive is a distinctive feature: the `receive` block scans the mailbox for the first message matching any of its patterns, skipping non-matching messages. Non-matching messages remain in the mailbox for future `receive` calls.

```
Mailbox: [msg_A, msg_B, msg_C, msg_D, msg_E]

receive do
  msg_C -> process(msg_C)    # Matches msg_C, skips msg_A and msg_B
end

Mailbox after: [msg_A, msg_B, msg_D, msg_E]    # msg_C consumed
```

This enables processes to prioritize certain message types without losing other messages. However, selective receive has a performance implication: if a process accumulates many non-matching messages, each `receive` call must scan through them. The Prismatic Platform mitigates this by ensuring processes handle all expected message types (preventing mailbox accumulation) and by using GenServer's structured callback model rather than raw `receive` blocks.

## Message Ordering Guarantees

BEAM provides specific ordering guarantees for message delivery.

| Guarantee | Scope | Description |
|-----------|-------|-------------|
| **Per-pair ordering** | Between two specific processes | Messages from process A to process B arrive in send order |
| **No global ordering** | Across all processes | Messages from A and C to B may interleave arbitrarily |
| **No delivery guarantee** | Network partitions | Messages may be lost if the network drops them |
| **At-most-once delivery** | Default semantics | Messages are never duplicated by the runtime |

```
Process A sends to B: [m1, m2, m3]  → B receives: [m1, m2, m3] (order preserved)
Process C sends to B: [m4, m5]      → B receives: [m4, m5] (order preserved)
Combined at B: [m1, m4, m2, m5, m3] (interleaved, but A's and C's relative order preserved)
```

For the Prismatic Platform, per-pair ordering is sufficient for most agent communication patterns. When global ordering is required (e.g., for event sourcing or audit logs), additional coordination mechanisms (sequence numbers, vector clocks, or ordered PubSub topics) are layered on top of raw message passing.

## Copy Semantics and Performance

When a message is sent, the BEAM runtime deep-copies it from the sender's heap into the recipient's heap. This copy is essential for process isolation: without it, the sender could modify the message after sending, violating the recipient's assumptions.

### What Gets Copied

| Data Type | Copy Behavior | Performance |
|-----------|--------------|-------------|
| **Small terms** (atoms, integers, small tuples) | Full deep copy | Microseconds |
| **Lists and maps** | Full deep copy (recursive) | Proportional to size |
| **Binaries < 64 bytes** | Full copy (heap binary) | Microseconds |
| **Binaries >= 64 bytes** | Reference copy (refc binary) | Constant time |
| **Large structs** | Full deep copy | Proportional to size |

The large binary optimization is significant: when sending a binary of 64 bytes or more, the BEAM copies only a reference (pointer) rather than the entire binary. The binary itself lives in a shared, reference-counted area outside any individual process heap. This means that broadcasting a large OSINT data payload to multiple agents incurs near-constant cost regardless of the number of recipients.

```elixir
# Small message: full copy (fast, proportional to size)
send(agent_pid, {:finding, %{ip: "10.0.0.1", port: 443}})

# Large binary: reference copy (constant time)
large_payload = File.read!("osint_results.json")  # 500KB
send(agent_pid, {:bulk_data, large_payload})  # Only copies reference
```

### Performance Guidelines

| Guideline | Rationale |
|-----------|-----------|
| Keep messages small when possible | Reduces copy overhead |
| Use binaries for large data | Triggers reference-counted sharing |
| Avoid sending large nested structures frequently | Deep copy is proportional to depth and breadth |
| Prefer PubSub for broadcasting | Single copy to PubSub, distributed to subscribers |
| Profile with `:observer` for mailbox growth | Detect processes accumulating messages |

## GenServer: Structured Message Passing

While raw `send/receive` is available, the Prismatic Platform overwhelmingly uses [GenServer](@/glossary/genserver.md) for inter-process communication. GenServer provides a structured layer over message passing with three communication patterns.

### call (Synchronous Request-Reply)

```elixir
# Client: sends message and waits for reply (default 5s timeout)
{:ok, rating} = GenServer.call(SecurityRater, {:rate_domain, "example.com"})

# Server: handles the call and replies
@impl GenServer
def handle_call({:rate_domain, domain}, _from, state) do
  rating = compute_rating(domain, state)
  {:reply, {:ok, rating}, state}
end
```

`call` is implemented as: send a tagged message, enter a `receive` block waiting for a reply with a matching tag. The tag is a unique reference that prevents reply confusion.

### cast (Asynchronous Fire-and-Forget)

```elixir
# Client: sends message and returns immediately
GenServer.cast(AssetRegistry, {:register, asset})

# Server: handles the cast (no reply)
@impl GenServer
def handle_cast({:register, asset}, state) do
  new_state = Map.put(state.assets, asset.id, asset)
  {:noreply, new_state}
end
```

### info (Process Messages)

```elixir
# Any process message (timers, monitors, PubSub, raw sends)
@impl GenServer
def handle_info({:DOWN, _ref, :process, pid, reason}, state) do
  # A monitored process has crashed
  new_state = handle_process_down(pid, reason, state)
  {:noreply, new_state}
end

@impl GenServer
def handle_info(:periodic_scan, state) do
  perform_scan(state)
  Process.send_after(self(), :periodic_scan, :timer.minutes(5))
  {:noreply, state}
end
```

### GenServer Communication Summary

| Pattern | Function | Blocking? | Reply? | Use Case |
|---------|----------|-----------|--------|----------|
| **call** | `GenServer.call/3` | Yes (with timeout) | Yes | Queries, synchronous operations |
| **cast** | `GenServer.cast/2` | No | No | Commands, fire-and-forget |
| **info** | `handle_info/2` | N/A (incoming) | No | System messages, timers, monitors |

## Mailbox Semantics

Every BEAM process has a mailbox -- an ordered queue of received messages. Understanding mailbox behavior is important for performance and correctness.

### Mailbox as a Queue

```
Arrival order: msg1, msg2, msg3, msg4, msg5

Mailbox: [msg1 | msg2 | msg3 | msg4 | msg5]
          ^
          receive scans from here

Selective receive matching msg3:
  Scans: msg1 (skip), msg2 (skip), msg3 (MATCH)
  Mailbox after: [msg1 | msg2 | msg4 | msg5]
```

### Mailbox Overflow

Mailboxes are unbounded by default. If a process receives messages faster than it processes them, the mailbox grows without limit, consuming memory until the BEAM VM runs out of memory. This is a common source of production issues in message-heavy systems.

| Symptom | Diagnosis | Solution |
|---------|-----------|----------|
| Growing memory usage | `:erlang.process_info(pid, :message_queue_len)` | Profile message processing rate |
| Slow `receive` | Large mailbox causes linear scan | Handle all message types, avoid selective receive on large mailboxes |
| OOM crash | Mailbox exceeds available memory | Add backpressure, rate limit senders |

The Prismatic Platform prevents mailbox overflow through several mechanisms:

- **GenStage/Broadway backpressure**: Consumers request only as many messages as they can process
- **PubSub with demand**: Subscribers control message flow rate
- **Process monitoring**: Telemetry tracks `message_queue_len` across all critical processes
- **Circuit breakers**: Stop sending to overloaded processes

## Process Monitors and Links

Message passing integrates with BEAM's process monitoring and linking mechanisms to enable fault-tolerant communication patterns.

### Monitors (Asymmetric)

```elixir
# Monitor a process - receive :DOWN message if it crashes
ref = Process.monitor(worker_pid)

receive do
  {:DOWN, ^ref, :process, ^worker_pid, reason} ->
    handle_worker_crash(reason)
end
```

### Links (Symmetric)

```elixir
# Link two processes - if either crashes, the other receives an exit signal
Process.link(worker_pid)

# Trap exits to handle link signals as messages
Process.flag(:trap_exit, true)

receive do
  {:EXIT, ^worker_pid, reason} ->
    handle_linked_process_exit(reason)
end
```

| Mechanism | Direction | Signal | Default Behavior | Use Case |
|-----------|-----------|--------|-----------------|----------|
| **Monitor** | One-way (watcher to target) | `:DOWN` message | Message delivered to watcher | Tracking external process health |
| **Link** | Bidirectional | Exit signal | Linked process crashes too | Supervisor-child relationships |

## Advanced Message Patterns

Beyond the fundamental primitives, the Prismatic Platform implements several advanced message passing patterns that leverage BEAM's capabilities for complex coordination scenarios.

### Request-Reply with Correlation

When multiple concurrent requests are outstanding, correlation IDs prevent reply confusion:

```elixir
defmodule Prismatic.MessagePatterns.CorrelatedRequest do
  @moduledoc """
  Request-reply pattern with explicit correlation IDs for
  disambiguating responses when multiple requests are in flight.
  """

  @spec request(pid(), term(), timeout()) :: {:ok, term()} | {:error, :timeout}
  def request(target, payload, timeout \\ 5_000) do
    correlation_id = make_ref()
    send(target, {:request, self(), correlation_id, payload})

    receive do
      {:response, ^correlation_id, result} -> {:ok, result}
    after
      timeout -> {:error, :timeout}
    end
  end

  @spec reply(pid(), reference(), term()) :: :ok
  def reply(caller, correlation_id, result) do
    send(caller, {:response, correlation_id, result})
    :ok
  end
end
```

### Scatter-Gather for Multi-Agent Coordination

When the platform needs input from multiple agents simultaneously:

```elixir
defmodule Prismatic.MessagePatterns.ScatterGather do
  @moduledoc """
  Scatter-gather pattern: broadcast a request to multiple agents
  and collect their responses within a timeout window.
  """

  @spec scatter_gather([pid()], term(), timeout()) ::
          %{responses: [term()], timeouts: [pid()]}
  def scatter_gather(agents, request, timeout \\ 10_000) do
    correlation_id = make_ref()

    Enum.each(agents, fn agent ->
      send(agent, {:scatter, self(), correlation_id, request})
    end)

    gather(agents, correlation_id, timeout, %{responses: [], timeouts: []})
  end

  defp gather([], _correlation_id, _timeout, acc), do: acc

  defp gather(remaining, correlation_id, timeout, acc) do
    start = System.monotonic_time(:millisecond)

    receive do
      {:gather, ^correlation_id, agent_pid, result} ->
        elapsed = System.monotonic_time(:millisecond) - start
        new_remaining = List.delete(remaining, agent_pid)
        new_acc = %{acc | responses: [{agent_pid, result} | acc.responses]}
        gather(new_remaining, correlation_id, max(0, timeout - elapsed), new_acc)
    after
      timeout ->
        %{acc | timeouts: remaining}
    end
  end
end
```

### Dead Letter Handling

Messages sent to crashed processes are silently lost in BEAM. The platform implements dead letter handling for critical message paths:

```elixir
defmodule Prismatic.MessagePatterns.DeadLetterHandler do
  @moduledoc """
  Captures messages that could not be delivered to their intended
  recipient and routes them to a dead letter queue for investigation.
  """

  use GenServer

  @type dead_letter :: %{
    intended_recipient: pid() | atom(),
    message: term(),
    reason: :process_not_found | :process_crashed,
    timestamp: DateTime.t()
  }

  @spec safe_send(pid() | atom(), term()) :: :ok | {:dead_letter, dead_letter()}
  def safe_send(target, message) when is_pid(target) do
    if Process.alive?(target) do
      send(target, message)
      :ok
    else
      dead_letter = %{
        intended_recipient: target,
        message: message,
        reason: :process_crashed,
        timestamp: DateTime.utc_now()
      }

      GenServer.cast(__MODULE__, {:record, dead_letter})
      {:dead_letter, dead_letter}
    end
  end

  def safe_send(name, message) when is_atom(name) do
    case Process.whereis(name) do
      nil ->
        dead_letter = %{
          intended_recipient: name,
          message: message,
          reason: :process_not_found,
          timestamp: DateTime.utc_now()
        }

        GenServer.cast(__MODULE__, {:record, dead_letter})
        {:dead_letter, dead_letter}

      pid ->
        safe_send(pid, message)
    end
  end
end
```

## Prismatic's Message-Driven Architecture

The Prismatic Platform uses message passing as the fundamental communication mechanism across all subsystems.

| Communication Pattern | Mechanism | Example |
|----------------------|-----------|---------|
| Agent coordination | GenServer call/cast | Agent requesting data from another agent |
| Telemetry propagation | PubSub broadcast | Quality metrics distributed to dashboards |
| Supervision signals | Links + monitors | Supervisor detecting child process crash |
| Pipeline flow | GenStage demand-driven | Broadway producer sending events to processor |
| Real-time UI updates | PubSub to LiveView | Security rating update pushed to dashboard |
| Color Team signals | Blackboard + PubSub | Gray findings triggering Red Team analysis |
| Inter-node communication | Distributed Erlang | Cross-node agent coordination |

### PubSub: Scalable Message Distribution

Phoenix [PubSub](@/glossary/pubsub.md) provides a higher-level abstraction over message passing for one-to-many communication.

```elixir
# Publisher: broadcast to all subscribers
Phoenix.PubSub.broadcast(
  PrismaticWeb.PubSub,
  "security:ratings",
  {:rating_updated, %{domain: "example.com", grade: :B, score: 780}}
)

# Subscriber: receive broadcasts as process messages
Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "security:ratings")

# In GenServer or LiveView
@impl true
def handle_info({:rating_updated, rating}, state) do
  {:noreply, update_dashboard(state, rating)}
end
```

PubSub is implemented on top of message passing: a PubSub server maintains a registry of topic subscriptions, and when a message is broadcast to a topic, it is sent (via `send/2`) to each subscribed process. For distributed PubSub, the broadcast is forwarded to PubSub servers on other nodes, which then deliver to their local subscribers.

## Transparent Distribution

One of BEAM's most powerful features is that message passing works identically across node boundaries.

```elixir
# Local message passing
send(local_pid, {:analyze, domain})

# Remote message passing - identical syntax
send({:analyzer, :"prismatic@node2"}, {:analyze, domain})

# GenServer call - also works remotely
GenServer.call({AssetRegistry, :"prismatic@node2"}, {:lookup, "example.com"})
```

The BEAM runtime handles serialization (using Erlang's External Term Format), TCP transport, and delivery transparently. The only difference is latency and the possibility of network failures.

| Aspect | Local | Distributed |
|--------|-------|-------------|
| Syntax | `send(pid, msg)` | `send({name, node}, msg)` |
| Latency | Microseconds | Milliseconds (network-dependent) |
| Delivery | Guaranteed (process alive) | May fail (network partition) |
| Ordering | Per-pair guaranteed | Per-pair guaranteed (within TCP) |
| Copy cost | Heap-to-heap copy | Serialization + network + deserialization |

## Message Passing Anti-Patterns

Understanding what not to do is as important as understanding the correct patterns. The following anti-patterns are actively prevented in the Prismatic Platform through code review and static analysis.

### Unbounded Message Accumulation

Sending messages without regard for the recipient's processing capacity leads to mailbox overflow. The platform enforces [backpressure](@/glossary/backpressure.md) through GenStage demand-driven pipelines.

### Synchronous Call Chains

A chain of GenServer.call invocations (A calls B, B calls C, C calls D) creates implicit synchronization points that can deadlock if any process in the chain is blocked or slow. The platform limits call chains to a maximum depth of 3 and prefers asynchronous cast with eventual consistency for deep coordination.

### Large Message Broadcasting

Broadcasting large messages to many subscribers multiplies the copy cost. The platform uses reference-based indirection: broadcast a small reference, and let each subscriber fetch the full data via a shared ETS table or process when needed.

### Process Mailbox as a Queue

Using a process mailbox as a persistent queue (sending thousands of messages with the expectation that they will be processed "eventually") is an anti-pattern. Mailboxes are designed for active communication, not storage. The platform uses Broadway and dedicated queue processes for buffering workloads.

## Comparison with Other Messaging Systems

| System | Model | Delivery Guarantee | Ordering | Latency |
|--------|-------|-------------------|----------|---------|
| **BEAM message passing** | Actor model | At-most-once | Per-pair FIFO | Microseconds (local) |
| **RabbitMQ** | Broker-based | At-least-once (with acks) | Per-queue FIFO | Milliseconds |
| **Apache Kafka** | Log-based | At-least-once | Per-partition | Milliseconds |
| **gRPC** | RPC | Exactly-once (with retries) | Per-stream | Milliseconds |
| **Go channels** | CSP | Synchronous | Per-channel FIFO | Nanoseconds |
| **Akka** | Actor model | At-most-once | Per-pair FIFO | Microseconds |

BEAM message passing trades delivery guarantees (at-most-once) for simplicity and performance. When stronger guarantees are needed, the platform layers acknowledgment protocols, persistent queues, or external message brokers on top of the native primitives.

## Best Practices

1. **Prefer GenServer over raw send/receive**: GenServer provides timeouts, monitoring integration, structured callbacks, and telemetry hooks that raw message passing does not.

2. **Handle all expected message types**: Every GenServer should have a catch-all `handle_info/2` clause that logs unexpected messages rather than letting them accumulate in the mailbox.

3. **Use PubSub for one-to-many communication**: Avoid manually broadcasting to a list of PIDs; PubSub handles subscriber management, distribution, and cleanup.

4. **Monitor message queue lengths in production**: Add telemetry reporters that track `:message_queue_len` for critical processes and alert when queues grow beyond expected bounds.

5. **Design messages for pattern matching**: Structure messages as tagged tuples (`{:event_type, payload}`) rather than opaque maps, enabling efficient selective receive and clear documentation.

6. **Keep messages immutable and self-contained**: Messages should carry all necessary context; avoid sending references to mutable state that could change between send and receive.

## Related Terms

- [BEAM](@/glossary/beam.md) - Virtual machine implementing the message passing runtime and scheduler
- [GenServer](@/glossary/genserver.md) - Structured abstraction over raw message passing with call/cast/info patterns
- [Process Isolation](@/glossary/process-isolation.md) - BEAM property that makes shared-nothing message passing necessary
- [PubSub](@/glossary/pubsub.md) - One-to-many message distribution built on process message passing
- [Channel](@/glossary/channel.md) - Phoenix Channel providing client-server message passing over WebSocket
- [Supervisor](@/glossary/supervisor.md) - Process supervision using links and exit signals
- [Backpressure](@/glossary/backpressure.md) - Flow control preventing mailbox overflow in high-throughput pipelines
- [Distributed System](@/glossary/distributed-system.md) - Architecture leveraging BEAM's transparent distribution
- [Pattern Matching](@/glossary/pattern-matching.md) - Language feature enabling selective receive and message dispatch
- [Fault Tolerance](@/glossary/fault-tolerance.md) - System property enabled by process isolation and message passing

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture and inter-process communication patterns
- [Technologies](@/technologies/_index.md) - BEAM runtime and OTP framework details
- [Agents](@/agents/_index.md) - Agent communication patterns using message passing

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
