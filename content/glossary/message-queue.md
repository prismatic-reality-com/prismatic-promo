+++
title = "Message Queue"
weight = 50

[extra]
description = "A message queue (mailbox) in BEAM systems is a per-process FIFO buffer that receives messages sent by other processes, providing the fundamental communication mechanism for Erlang/Elixir's actor-based concurrency model"
category = "platform"
domain = "concurrency"
complexity = "intermediate-advanced"
stability = "stable"
beam_related = true
related_terms = ["process", "memory", "memory-leak", "pubsub", "genserver", "backpressure", "ets", "erlang", "actor-model", "binary", "latency", "profiling"]
tags = ["glossary", "message-queue", "mailbox", "beam", "concurrency", "actor-model", "ipc", "process-communication", "selective-receive", "backpressure", "genserver", "call-vs-cast", "pubsub", "message-ordering", "flow-control", "dd-pipeline"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "intermediate"
quality_score = 96
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "BEAM process mailboxes are the foundation of Prismatic Platform's concurrent architecture, enabling 552 agents and 157 OSINT tools to communicate without shared state"
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["message queue", "mailbox", "process mailbox", "message passing", "actor model", "BEAM concurrency", "asynchronous messaging", "process communication", "selective receive", "backpressure", "flow control"]
image = "/images/sections/glossary.png"
image_alt = "Message Queue - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "agents", "performance-testing"]
+++

## Definition

In the BEAM virtual machine, every process has a message queue (also called a mailbox) -- a FIFO buffer that stores messages sent to the process by other processes or by the runtime system. Message sending is asynchronous and never fails: `send(pid, message)` always returns immediately, depositing the message in the target process's queue regardless of whether the target is ready to process it. The receiving process uses `receive` blocks (or GenServer callbacks) to selectively pattern-match messages from its queue.

This message-passing architecture is the foundation of BEAM's concurrency model. Processes share no memory -- all communication occurs through explicit message passing. This eliminates race conditions, deadlocks on shared data, and the need for mutexes or locks. The trade-off is that data must be copied between processes (except for large binaries, which are reference-counted on a shared heap), adding overhead proportional to message size.

In the Prismatic Platform, message queues underpin every concurrent subsystem: the 552 AIAD agents coordinate through message passing, the DD pipeline broadcasts events via PubSub (which uses process mailboxes for delivery), OSINT tool execution results stream through GenServer callbacks, and LiveView dashboards receive real-time updates through their process mailboxes.

## Core Concepts

### Message Lifecycle

| Phase | Operation | Blocking? | Failure Mode |
|-------|-----------|-----------|-------------|
| **Send** | `send(pid, msg)` / `GenServer.cast` | Never blocks | Message lost if process dead (no error) |
| **Enqueue** | Runtime places message in target mailbox | Atomic, lock-free | Cannot fail (memory permitting) |
| **Scan** | Receiver scans mailbox for matching pattern | Can be O(n) | Slow if many unmatched messages |
| **Receive** | Pattern match removes message from queue | Blocks until match or timeout | Timeout if no match arrives |
| **Process** | Handler code executes with matched message | Application-dependent | Exception handling per OTP |

### GenServer Call vs Cast

| Aspect | `GenServer.call/3` | `GenServer.cast/2` | `send/2` |
|--------|-------------------|--------------------|----------|
| Blocking | Yes (caller waits) | No (fire-and-forget) | No |
| Return value | Reply from server | `:ok` always | Message term |
| Backpressure | Natural (caller blocked) | None | None |
| Timeout | Configurable (default 5s) | None | None |
| Error propagation | Exits caller on server crash | Silent | Silent |
| Mailbox pressure | Self-regulating | Dangerous if fast sender | Dangerous if fast sender |
| Use when | Need response or backpressure | Notification, best-effort | Low-level, non-GenServer |

### Message Ordering Guarantees

BEAM provides the following ordering guarantees:

| Guarantee | Scope | Details |
|-----------|-------|---------|
| **FIFO per sender-receiver pair** | Two specific processes | Messages from A to B arrive in send order |
| **No global ordering** | Multiple senders to one receiver | Messages from A and B to C may interleave arbitrarily |
| **No cross-process ordering** | Distributed system | Messages from A to B and A to C have independent ordering |
| **Selective receive preserves order** | Single receiver | Skipped messages remain in original order |

## Technical Deep Dive

### Mailbox Implementation (OTP 24+)

Message queue implementation in the BEAM has evolved significantly. Modern BEAM (OTP 24+) uses a fragmented message queue where incoming messages are first stored in an outer queue accessible by senders, then moved to an inner queue accessible only by the receiving process. This reduces lock contention -- senders never block on each other, and the receiver can process messages from its inner queue without holding the outer queue lock.

**Dual-queue architecture:**

```
Sender A --\                      +-----------+     +-----------+
Sender B ---+--> [Outer Queue] -> | Lock-free | --> [Inner Queue] --> receive
Sender C --/    (multiple writers) | transfer  |    (single reader)
                                  +-----------+
```

The outer queue uses a lock-free linked list for concurrent writes. The inner queue is a simple linked list with a single reader. When the receiver needs more messages, it atomically moves all messages from the outer queue to the inner queue in one operation (the "signal queue flush").

### Selective Receive Deep Dive

Selective receive -- where a process matches only specific message patterns -- has critical performance implications that every BEAM developer must understand.

**How selective receive works:**

```elixir
receive do
  {:response, ref, value} when ref == expected_ref ->
    # Only matches messages with the expected reference
    handle_response(value)
after
  5000 -> :timeout
end
```

When this `receive` executes:
1. The runtime starts scanning from the oldest message in the inner queue
2. Each message is tested against the pattern
3. Non-matching messages are skipped (remain in the queue)
4. If a match is found, that message is removed and the body executes
5. If no match is found, the process suspends until a new message arrives, then rescans

**The scan cost problem:**

For queues with N unmatched messages, each selective receive is O(N) because the runtime must skip all non-matching messages before finding the match or blocking. If a process has 10,000 queued messages and only matches one specific pattern, each receive scans 10,000 entries.

**Reference-based optimization:**

The BEAM has a special optimization for the common call-response pattern. When a process creates a reference with `make_ref()` and immediately enters a `receive` that matches on that reference, the runtime marks the queue position. When the response arrives, scanning starts from the marked position instead of the queue head, effectively making it O(1) instead of O(N).

```elixir
# This pattern triggers the reference optimization:
ref = make_ref()
send(server, {:request, self(), ref, payload})
receive do
  {:response, ^ref, result} -> result
after
  5000 -> :timeout
end
```

GenServer's `call` implementation uses this optimization internally.

### Backpressure Patterns

Since message sending never fails or blocks, a fast producer can overwhelm a slow consumer, causing unbounded queue growth that eventually exhausts memory. Several backpressure patterns exist:

| Pattern | Mechanism | Latency Impact | Complexity |
|---------|-----------|---------------|------------|
| **Synchronous call** | `GenServer.call/3` blocks sender | Adds round-trip latency | Low |
| **Queue length check** | Inspect `:message_queue_len` before send | Conditional rejection | Medium |
| **Demand-driven** | Consumer requests work (GenStage) | Optimal throughput | High |
| **Token bucket** | Rate limit sends per time window | Smooths bursts | Medium |
| **Load shedding** | Drop messages when overloaded | Loses data | Low |
| **Circuit breaker** | Stop sending after N failures | Prevents cascade | Medium |

### Flow Control with GenStage

GenStage provides demand-driven backpressure for producer-consumer pipelines:

```
Producer (emits events)
    |
    v  demand=500 (consumer requests 500 events)
Consumer (processes events, requests more)
```

The consumer controls the flow by specifying how many events it can handle. The producer only generates events when there is demand. This eliminates mailbox accumulation entirely because the producer never sends faster than the consumer can process.

### Monitoring :message_queue_len

The most important metric for mailbox health is `:message_queue_len`. The Prismatic Platform monitors this for all registered GenServers:

| Threshold | Status | Action |
|-----------|--------|--------|
| 0-100 | Healthy | Normal operation |
| 100-1,000 | Elevated | Log warning, investigate trend |
| 1,000-10,000 | Warning | Alert team, reduce incoming rate |
| 10,000-100,000 | Critical | Circuit break senders, investigate root cause |
| > 100,000 | Emergency | Consider killing the process, supervisor restart |

### Message Size Considerations

Messages are copied between process heaps (except large binaries on the shared heap). Message size directly impacts:

| Message Size | Copy Cost | Network Cost (distributed) | Recommendation |
|-------------|-----------|---------------------------|----------------|
| < 1 KB | Negligible | Negligible | Send freely |
| 1-10 KB | Measurable | Acceptable | Normal for structured data |
| 10-100 KB | Significant | Plan for it | Consider binary references |
| 100 KB - 1 MB | Expensive | Problematic | Use binary with reference |
| > 1 MB | Very expensive | Avoid | Store in ETS, send reference |

## Advanced Topics

### PubSub and Message Queues

Phoenix.PubSub uses process message queues as the delivery mechanism. When a process subscribes to a topic, PubSub stores its PID. When a message is broadcast, PubSub calls `send(subscriber_pid, message)` for each subscriber. This means:

- Each subscriber's mailbox receives a copy of the broadcast message
- Slow subscribers accumulate messages (potential memory leak)
- A broadcast to N subscribers creates N message copies
- No backpressure exists -- all subscribers get all messages regardless of processing speed

**Prismatic Platform PubSub topics:**

| Topic | Volume | Subscribers | Pattern |
|-------|--------|-------------|---------|
| `"dd:pipeline"` | Medium (pipeline events) | DD LiveView dashboards | Periodic updates |
| `"agents:results"` | High (task completions) | Agent coordinator | Bounded by task concurrency |
| `"osint:run:#{id}"` | Low-medium (per execution) | Single LiveView | Short-lived subscription |
| `"system_events"` | Low (system-level) | StreamBroadcaster | Status changes |
| `"error_patterns"` | Medium (error tracking) | PatternTracker, Error Feed | Error events |

### Distributed Message Passing

In a distributed BEAM cluster, message passing extends across nodes transparently. The syntax is the same (`send(pid, msg)`), but the message must be serialized, sent over TCP, and deserialized. This adds:

- Network latency (typically 0.1-10ms within a datacenter)
- Serialization overhead (proportional to message complexity)
- Potential message loss (network partition)
- No delivery guarantees (best-effort)

### Process Hibernation and Mailbox Compaction

Idle processes with large mailboxes consume memory unnecessarily. OTP provides `:hibernate` to compact process state and mailbox:

```elixir
# GenServer hibernation for idle processes
def handle_info(:timeout, state) do
  {:noreply, state, :hibernate}
end
```

When a process hibernates:
1. A full-sweep garbage collection runs
2. The heap is compacted to minimum size
3. The process suspends until a message arrives
4. On wakeup, the process must rebuild its execution context

This is ideal for processes with long idle periods (e.g., WebSocket connections, session GenServers).

### DD Pipeline PubSub Architecture

The DD (Due Diligence) pipeline uses PubSub extensively for real-time event streaming:

```
DD Scheduler (GenServer)
    |
    | Process.send_after/3 (periodic triggers)
    v
DD Pipeline Worker (Task)
    |
    | Phoenix.PubSub.broadcast("dd:pipeline", {:stage_complete, stage, results})
    v
DD LiveView Dashboard (subscriber)
    |
    | handle_info({:stage_complete, stage, results}, socket)
    v
Browser (WebSocket push via LiveView)
```

Each pipeline stage broadcasts completion events. The LiveView dashboard subscribes to `"dd:pipeline"` and updates its display in real-time. Because LiveView processes are short-lived (they die when the user navigates away), PubSub subscriptions are automatically cleaned up -- preventing subscriber leak.

## Usage in Prismatic Platform

The Prismatic Platform uses message queues extensively through GenServer, PubSub, and direct process communication:

**OSINT Tool Execution**: The OSINT tool execution pipeline broadcasts results via Phoenix.PubSub, which internally uses process message queues to deliver events to all subscribers. Each tool execution spawns a short-lived process that sends results back to the coordinator via `GenServer.call`, providing natural backpressure.

**Agent Coordination**: 552 AIAD agents coordinate through message passing for task delegation, result collection, and status reporting. The SessionLifecycle GenServer coordinates session hooks through call/cast patterns, with circuit breaker protection that prevents cascading failures when hook execution is slow.

**LiveView Real-Time Updates**: Every LiveView process has a mailbox that receives PubSub broadcasts, timer messages (`Process.send_after`), and inter-process updates. The LiveView framework converts these into WebSocket pushes to the browser, enabling real-time dashboards without polling.

**Error Intelligence Pipeline**: Error events flow from application code through the StreamBroadcaster, to the PatternTracker (which aggregates patterns), and finally to the ErrorFeedLive view -- all via message passing through process mailboxes.

The platform monitors message queue lengths for all registered GenServers, treating queues above 1,000 messages as a warning and above 10,000 as critical.

## Code Examples

```elixir
defmodule PrismaticAgents.TaskDispatcher do
  @moduledoc """
  Dispatches tasks to agent processes with backpressure awareness.

  Implements multiple dispatch strategies:
  - `dispatch/2` - Fire-and-forget with overload protection
  - `dispatch_with_backpressure/3` - Synchronous with timeout
  - `dispatch_batch/2` - Parallel batch with concurrency limit

  Monitors target process mailbox length before sending to
  prevent overloading slow consumers.

  ## Architecture

  The dispatcher sits between task producers (API requests,
  scheduled jobs, pipeline stages) and agent workers. It
  provides the flow control layer that prevents mailbox
  accumulation in agent processes.
  """

  use GenServer

  require Logger

  @max_queue_length 5000

  @doc """
  Dispatch a task to an agent with overload protection.

  Checks the target process mailbox length before sending.
  Returns `{:error, :overloaded}` if the target exceeds
  the maximum queue length.

  ## Parameters

    - `agent_pid` - PID of the target agent process
    - `task` - Task specification to execute

  ## Examples

      iex> {:ok, pid} = GenServer.start_link(MyAgent, [])
      iex> PrismaticAgents.TaskDispatcher.dispatch(pid, %{action: :analyze})
      :ok
  """
  @spec dispatch(pid(), term()) :: :ok | {:error, :overloaded | :process_dead}
  def dispatch(agent_pid, task) do
    case Process.info(agent_pid, :message_queue_len) do
      {:message_queue_len, len} when len > @max_queue_length ->
        Logger.warning("Agent overloaded, rejecting task",
          pid: inspect(agent_pid),
          queue_len: len,
          max: @max_queue_length
        )

        :telemetry.execute(
          [:prismatic, :agents, :dispatch_rejected],
          %{queue_len: len},
          %{reason: :overloaded}
        )

        {:error, :overloaded}

      {:message_queue_len, _len} ->
        GenServer.cast(agent_pid, {:execute, task})
        :ok

      nil ->
        {:error, :process_dead}
    end
  end

  @doc """
  Dispatch a task with backpressure via synchronous call.

  The caller blocks until the agent completes the task or
  the timeout expires. This provides natural backpressure:
  if the agent is slow, the caller is automatically throttled.

  ## Parameters

    - `agent_pid` - PID of the target agent process
    - `task` - Task specification to execute
    - `timeout` - Maximum wait time in milliseconds (default: 30s)

  ## Examples

      iex> {:ok, result} = TaskDispatcher.dispatch_with_backpressure(pid, task, 5_000)
  """
  @spec dispatch_with_backpressure(pid(), term(), timeout()) :: {:ok, term()} | {:error, term()}
  def dispatch_with_backpressure(agent_pid, task, timeout \\ 30_000) do
    GenServer.call(agent_pid, {:execute, task}, timeout)
  catch
    :exit, {:timeout, _} ->
      Logger.warning("Agent dispatch timeout",
        pid: inspect(agent_pid),
        timeout_ms: timeout
      )
      {:error, :timeout}

    :exit, {:noproc, _} ->
      {:error, :process_dead}

    :exit, {:normal, _} ->
      {:error, :process_terminated}
  end

  @doc """
  Dispatch multiple tasks in parallel with bounded concurrency.

  Uses Task.async_stream to limit the number of concurrent
  dispatches, preventing thundering herd effects.

  ## Parameters

    - `tasks` - List of `{agent_pid, task}` tuples
    - `opts` - Options including `:max_concurrency` (default: 10)
  """
  @spec dispatch_batch([{pid(), term()}], keyword()) :: [{:ok, term()} | {:error, term()}]
  def dispatch_batch(tasks, opts \\ []) do
    max_concurrency = Keyword.get(opts, :max_concurrency, 10)
    timeout = Keyword.get(opts, :timeout, 30_000)

    tasks
    |> Task.async_stream(
      fn {pid, task} -> dispatch_with_backpressure(pid, task, timeout) end,
      max_concurrency: max_concurrency,
      timeout: timeout + 1000,
      on_timeout: :kill_task
    )
    |> Enum.map(fn
      {:ok, result} -> result
      {:exit, :timeout} -> {:error, :timeout}
    end)
  end

  # -- GenServer callbacks --

  @impl GenServer
  def init(opts) do
    {:ok, %{
      dispatched: 0,
      rejected: 0,
      monitor_interval: Keyword.get(opts, :monitor_interval, 10_000)
    }}
  end

  @impl GenServer
  def handle_cast({:execute, task}, state) do
    result = execute_task(task)
    broadcast_result(task, result)
    {:noreply, %{state | dispatched: state.dispatched + 1}}
  end

  @impl GenServer
  def handle_call({:execute, task}, _from, state) do
    result = execute_task(task)
    {:reply, {:ok, result}, %{state | dispatched: state.dispatched + 1}}
  end

  @impl GenServer
  def handle_info(:monitor_queue, state) do
    queue_len = Process.info(self(), :message_queue_len)

    :telemetry.execute(
      [:prismatic, :agents, :dispatcher_queue],
      %{length: elem(queue_len, 1)},
      %{}
    )

    Process.send_after(self(), :monitor_queue, state.monitor_interval)
    {:noreply, state}
  end

  def handle_info(_unexpected, state) do
    Logger.debug("TaskDispatcher received unexpected message, discarding")
    {:noreply, state}
  end

  defp execute_task(task), do: %{status: :completed, task: task, completed_at: DateTime.utc_now()}

  defp broadcast_result(task, result) do
    Phoenix.PubSub.broadcast(Prismatic.PubSub, "agents:results", {task, result})
  end
end
```

```elixir
defmodule PrismaticSafety.MailboxMonitor do
  @moduledoc """
  Periodic monitor for BEAM process mailbox health.

  Runs as a GenServer that periodically checks registered
  processes for mailbox accumulation, emitting telemetry
  events and warnings when thresholds are exceeded.

  ## Thresholds

  - Warning: > 1,000 messages
  - Critical: > 10,000 messages
  - Emergency: > 100,000 messages (triggers alert)
  """

  use GenServer

  require Logger

  @check_interval_ms 30_000
  @warning_threshold 1_000
  @critical_threshold 10_000
  @emergency_threshold 100_000

  @doc "Start the mailbox monitor."
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(opts) do
    interval = Keyword.get(opts, :interval, @check_interval_ms)
    Process.send_after(self(), :check, interval)
    {:ok, %{interval: interval, last_check: nil, alerts: []}}
  end

  @impl GenServer
  def handle_info(:check, state) do
    alerts = check_all_registered_processes()

    Enum.each(alerts, fn alert ->
      :telemetry.execute(
        [:prismatic, :mailbox, :alert],
        %{queue_len: alert.queue_len, memory: alert.memory},
        %{name: alert.name, severity: alert.severity}
      )
    end)

    Process.send_after(self(), :check, state.interval)
    {:noreply, %{state | last_check: DateTime.utc_now(), alerts: alerts}}
  end

  def handle_info(_msg, state), do: {:noreply, state}

  defp check_all_registered_processes do
    Process.registered()
    |> Enum.flat_map(fn name ->
      case Process.whereis(name) do
        nil -> []
        pid ->
          case Process.info(pid, [:message_queue_len, :memory]) do
            nil -> []
            info ->
              queue_len = info[:message_queue_len]
              if queue_len > @warning_threshold do
                [%{
                  name: name,
                  pid: pid,
                  queue_len: queue_len,
                  memory: info[:memory],
                  severity: classify_severity(queue_len)
                }]
              else
                []
              end
          end
      end
    end)
  end

  defp classify_severity(len) when len > @emergency_threshold, do: :emergency
  defp classify_severity(len) when len > @critical_threshold, do: :critical
  defp classify_severity(_len), do: :warning
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Using `cast` for operations needing backpressure | Sender floods receiver, mailbox grows unbounded | Use `call` when sender should wait for completion |
| Selective receive on large mailboxes | O(N) scan per receive, performance degrades | Use reference-based matching or process messages in order |
| Missing catch-all `handle_info` | Unknown messages accumulate silently in GenServer mailbox | Add catch-all clause that logs and discards |
| Large messages between processes | Copy overhead proportional to message size | Send references (ETS key, binary ref) instead of data |
| No mailbox monitoring | Leaks go undetected until OOM | Monitor `:message_queue_len` with periodic checks |
| PubSub to slow subscribers | Subscribers accumulate broadcast messages | Implement per-subscriber rate limiting or demand-driven delivery |
| `Process.sleep` in GenServer handlers | Blocks all message processing for the duration | Use `Process.send_after` for delayed actions |
| Unbounded `send` in a loop | Target mailbox grows to millions of messages | Use GenStage demand-driven flow or batch with rate limiting |
| Not using `make_ref()` for call patterns | Selective receive scans entire mailbox | Use reference-based pattern for O(1) matching |
| Distributed messaging without monitoring | Network issues cause silent message loss | Use `:erlang.monitor(:process, remote_pid)` for detection |

## Best Practices

1. **Use `GenServer.call/3` instead of `cast/2`** when backpressure is needed -- calls naturally throttle the sender by blocking until the server responds.
2. **Monitor `:message_queue_len`** for all long-running processes and alert before queues reach dangerous sizes (1,000 warning, 10,000 critical).
3. **Design receive patterns to match messages in arrival order** when possible to avoid O(N) selective receive scans.
4. **Use reference-based matching** (`make_ref()`) for request-response patterns to skip irrelevant messages efficiently via BEAM's receive marker optimization.
5. **Implement load shedding** (dropping messages) for processes that cannot keep up rather than allowing unbounded growth.
6. **Set GenServer `:hibernate`** for processes with long idle periods to compact their mailbox and heap, reducing memory footprint.
7. **Add a catch-all `handle_info/2` clause** to every GenServer that logs unexpected messages and returns `{:noreply, state}`.
8. **Send references, not data** for large payloads -- store data in ETS and send the key, avoiding copy overhead.
9. **Use PubSub topics with appropriate granularity** -- subscribe to specific topics rather than broad ones to reduce irrelevant message volume.
10. **Profile message patterns with `:recon_trace`** to understand actual message flow rates and identify bottlenecks.

## Related Terms

- [Process](@/glossary/process.md) -- BEAM processes that own message queues
- [Memory](@/glossary/memory.md) -- heap memory consumed by message queue contents
- [Memory Leak](@/glossary/memory-leak.md) -- unbounded queue growth as a primary leak vector
- [PubSub](@/glossary/pubsub.md) -- publish-subscribe built on process mailboxes
- [GenServer](@/glossary/genserver.md) -- OTP abstraction providing structured message handling
- [Backpressure](@/glossary/backpressure.md) -- flow control preventing mailbox overflow
- [ETS](@/glossary/ets.md) -- shared storage alternative to passing large messages
- [Erlang](@/glossary/erlang.md) -- BEAM VM providing the mailbox implementation
- [Actor Model](@/glossary/actor-model.md) -- concurrency model that message queues implement
- [Binary](@/glossary/binary.md) -- binary data with shared-heap optimization reducing copy cost
- [Latency](@/glossary/latency.md) -- message processing latency as a key performance metric
- [Profiling](@/glossary/profiling.md) -- tools for analyzing message flow patterns

## See Also

- [Architecture](@/architecture/_index.md) -- actor-based concurrency architecture
- [Capabilities](@/capabilities/_index.md) -- distributed communication capabilities
- [DD Pipeline](/hub/dd/pipeline) -- real-time PubSub event streaming
- [Erlang receive documentation](https://www.erlang.org/doc/reference_manual/expressions#receive) -- BEAM receive semantics

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
