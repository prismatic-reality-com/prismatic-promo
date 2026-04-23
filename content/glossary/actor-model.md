+++
title = "Actor Model"
description = "Concurrent computation model where actors are the universal primitives -- receiving messages, maintaining state, and creating new actors without shared memory."
weight = 40

[extra]
category = "elixir"
tags = ["actor-model", "concurrency", "beam", "erlang", "elixir", "process", "message-passing", "genserver", "otp", "fault-tolerance", "supervision", "mailbox", "isolation"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
difficulty = "advanced"
audience = ["developers", "architects", "systems-engineers", "distributed-systems-engineers"]
related_terms = ["beam", "process-isolation", "message-passing", "genserver", "otp", "elixir", "erlang", "supervision-tree", "concurrent-programming", "fault-tolerance", "mailbox", "pid"]
key_concepts = ["message-passing", "process-isolation", "mailbox", "supervision", "preemptive-scheduling", "location-transparency", "let-it-crash"]
platforms = ["beam", "erlang", "elixir", "akka", "orleans"]
prerequisites = ["concurrent-programming-fundamentals", "process-concepts", "functional-programming"]
use_cases = ["telecom-systems", "web-servers", "iot-platforms", "real-time-messaging", "distributed-databases", "multi-agent-systems"]
complexity = "high"
stability = "mature"
pioneer = "Carl Hewitt"
year_introduced = "1973"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1868
date_modified = "2026-02-23"
keywords = ["Actor", "Model", "Concurrent", "glossary", "elixir", "Prismatic Platform", "BEAM"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Actor Model - Prismatic Platform"
+++

{% import "macros/flowbite.html" as fb %}

## Definition and Overview

The actor model is a mathematical model of concurrent computation first proposed by Carl Hewitt, Peter Bishop, and Richard Steiger in 1973. In this model, the fundamental unit of computation is the **actor** -- an independent entity that can receive messages, make local decisions, create new actors, send messages to other actors, and determine how to respond to the next message received. Actors encapsulate both state and behavior, communicating exclusively through asynchronous message passing with no shared memory between them.

{{ fb::p5_interactive_dashboard(title="Interactive Actor Message Flow", sketch_type="agents", data_source="actor.message_flow", controls=true) }}

{{ fb::divider(label="Concept Visualization") }}

The actor model provides a natural way to reason about concurrent and distributed systems because it eliminates entire categories of concurrency bugs by design. There are no locks, no mutexes, no semaphores, and no shared mutable state. Each actor processes messages sequentially from its mailbox, maintaining internal consistency without coordination primitives. This makes actor-based systems inherently composable -- combining two correct actors always produces a correct system, a property that does not hold for lock-based concurrent programs.

**Interactive Demo**: The visualization above shows how Elixir actors (GenServer processes) communicate through message passing. Each circle represents an actor with its own mailbox queue. Watch as messages flow between actors asynchronously, demonstrating the three fundamental capabilities: **Send** (message transmission), **Create** (spawning new actors), and **Become** (state transitions).

The [BEAM](@/glossary/beam.md) virtual machine, which runs Erlang and Elixir, is the most mature and widely-deployed implementation of actor model principles in production systems. BEAM processes are lightweight actors (approximately 2KB initial memory) that communicate through message passing, are isolated from each other (one process crashing cannot corrupt another), and are managed by sophisticated schedulers that provide soft real-time guarantees. The BEAM can run millions of concurrent processes on modern hardware, making it practical to model every independent concern in a system as a separate actor.

The significance of the actor model extends beyond its technical properties. It provides a way of thinking about systems that aligns with how the physical world works: independent entities interacting through messages, without any shared global state. This mental model scales from small concurrent programs to planet-scale distributed systems, making it one of the most powerful abstractions in computer science.

## Core Actor Properties

Every actor in the model has three fundamental capabilities when processing a message. These capabilities are both necessary and sufficient to build any concurrent computation.

| Capability | Description | BEAM Implementation |
|-----------|-------------|---------------------|
| **Send** | Send messages to other actors whose addresses it knows | `send/2`, `GenServer.cast/2`, `GenServer.call/2` |
| **Create** | Create new actors (finite number) | `spawn/1`, `Task.start/1`, `DynamicSupervisor.start_child/2` |
| **Become** | Designate behavior for the next message | State updates in `handle_call/3`, `handle_cast/2` |

The "become" capability is particularly important and often misunderstood. It means an actor can change its behavior between processing messages. In practical terms, this is how actors maintain and update state: when processing a message, the actor returns a new state that determines how it will handle the next message. This is fundamentally different from mutable state in object-oriented systems because the state transition is atomic with respect to message processing -- no external entity can observe an intermediate state.

```elixir
defmodule Prismatic.Actor.Counter do
  @moduledoc """
  Demonstrates the three fundamental actor capabilities through
  a simple counter that maintains state, sends messages, and
  creates child actors.

  This GenServer embodies the actor model: it processes messages
  sequentially from its mailbox, maintains isolated state, and
  communicates with other actors only through messages.
  """

  use GenServer

  @type state :: %{
    count: non_neg_integer(),
    subscribers: list(pid()),
    history: list({DateTime.t(), non_neg_integer()})
  }

  # --- Public API (message sending) ---

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    initial_count = Keyword.get(opts, :initial, 0)
    GenServer.start_link(__MODULE__, initial_count, opts)
  end

  @spec increment(GenServer.server()) :: :ok
  def increment(counter) do
    # SEND: sends a message to the counter actor
    GenServer.cast(counter, :increment)
  end

  @spec get_count(GenServer.server()) :: {:ok, non_neg_integer()}
  def get_count(counter) do
    # SEND: sends a message and waits for response
    GenServer.call(counter, :get_count)
  end

  @spec subscribe(GenServer.server(), pid()) :: :ok
  def subscribe(counter, subscriber) do
    GenServer.cast(counter, {:subscribe, subscriber})
  end

  # --- Callbacks (message processing) ---

  @impl GenServer
  @spec init(non_neg_integer()) :: {:ok, state()}
  def init(initial_count) do
    {:ok, %{count: initial_count, subscribers: [], history: []}}
  end

  @impl GenServer
  def handle_cast(:increment, state) do
    new_count = state.count + 1
    timestamp = DateTime.utc_now()

    # SEND: notify all subscribers
    Enum.each(state.subscribers, fn pid ->
      send(pid, {:count_updated, new_count})
    end)

    # BECOME: update state for next message
    {:noreply, %{state |
      count: new_count,
      history: [{timestamp, new_count} | Enum.take(state.history, 99)]
    }}
  end

  @impl GenServer
  def handle_cast({:subscribe, pid}, state) do
    # Monitor the subscriber so we can clean up if it dies
    Process.monitor(pid)
    {:noreply, %{state | subscribers: [pid | state.subscribers]}}
  end

  @impl GenServer
  def handle_call(:get_count, _from, state) do
    {:reply, {:ok, state.count}, state}
  end

  @impl GenServer
  def handle_info({:DOWN, _ref, :process, pid, _reason}, state) do
    # Clean up dead subscribers
    {:noreply, %{state | subscribers: List.delete(state.subscribers, pid)}}
  end
end
```

## Message Passing Semantics

Actor model [message passing](@/glossary/message-passing.md) is fundamentally asynchronous. The sender does not block waiting for the receiver to process the message. This design choice has profound implications for system behavior and performance.

**Asynchronous Delivery**: The sender continues executing immediately after sending a message. This decouples sender and receiver lifetimes and prevents cascading blocking through the system.

**Buffered in Mailbox**: Messages are stored in the receiver's mailbox (a FIFO queue in BEAM) until the actor is ready to process them. The mailbox acts as a buffer that absorbs temporal mismatches between sender and receiver speeds.

**Ordered Per-Pair**: Messages from actor A to actor B arrive in send order. However, messages from actors A and C to actor B may interleave in any order. This per-pair ordering guarantee is weaker than total ordering but sufficient for most applications and much cheaper to implement in distributed systems.

**At-Most-Once Local Delivery**: In a local BEAM node, messages are delivered exactly once. In distributed systems across nodes, the guarantee weakens to at-most-once, and higher-level protocols must be built for reliable delivery when needed.

### Selective Receive

One of the most powerful features of the BEAM's actor implementation is selective receive, where an actor can pattern-match against messages in its mailbox and process them out of order. This enables actors to handle priority messages, implement request-response patterns over asynchronous channels, and manage complex protocol interactions.

```elixir
defmodule Prismatic.Actor.PriorityProcessor do
  @moduledoc """
  Demonstrates selective receive through GenServer callbacks.

  In OTP, selective receive is expressed through multiple
  handle_info/handle_cast/handle_call clauses that pattern
  match on different message types.
  """

  use GenServer

  @type priority :: :critical | :high | :normal | :low
  @type task :: %{priority: priority(), payload: term(), received_at: DateTime.t()}

  @impl GenServer
  def init(_opts) do
    {:ok, %{queue: [], processing: false}}
  end

  @impl GenServer
  def handle_cast({:task, priority, payload}, state) do
    task = %{
      priority: priority,
      payload: payload,
      received_at: DateTime.utc_now()
    }

    new_queue =
      [task | state.queue]
      |> Enum.sort_by(&priority_weight/1, :desc)

    new_state = %{state | queue: new_queue}

    if not state.processing do
      send(self(), :process_next)
    end

    {:noreply, new_state}
  end

  @impl GenServer
  def handle_info(:process_next, %{queue: []} = state) do
    {:noreply, %{state | processing: false}}
  end

  @impl GenServer
  def handle_info(:process_next, %{queue: [task | rest]} = state) do
    process_task(task)
    send(self(), :process_next)
    {:noreply, %{state | queue: rest, processing: true}}
  end

  defp priority_weight(%{priority: :critical}), do: 4
  defp priority_weight(%{priority: :high}), do: 3
  defp priority_weight(%{priority: :normal}), do: 2
  defp priority_weight(%{priority: :low}), do: 1

  defp process_task(%{priority: priority, payload: payload}) do
    IO.puts("Processing #{priority} task: #{inspect(payload)}")
  end
end
```

## Process Isolation

BEAM processes implement the strongest isolation guarantees of any mainstream actor implementation. This isolation is not merely a convention but is enforced by the virtual machine itself.

**Memory Isolation**: Each process has its own heap. Messages are copied between process heaps (not shared), meaning one process's garbage collection never affects another. This eliminates the global GC pauses that plague JVM-based actor systems.

**Failure Isolation**: A crashing process cannot corrupt another process's state. The process terminates, its memory is reclaimed, and linked/monitoring processes are notified. This is the foundation of the "let it crash" philosophy.

**Scheduling Isolation**: No process can monopolize the scheduler. BEAM uses preemptive scheduling based on reduction counting: after a process executes approximately 4,000 reductions (roughly equivalent to 4,000 function calls), it is preempted and another process gets to run. This provides soft real-time guarantees across all processes.

**I/O Isolation**: Blocking I/O in one process does not block others. The BEAM scheduler uses dirty schedulers for long-running or blocking operations, keeping the main schedulers responsive.

| Isolation Type | Guarantee | Mechanism |
|---------------|-----------|-----------|
| **Memory** | No shared heap, copy semantics | Per-process heap, message copying |
| **Failure** | No corruption propagation | Process termination + notification |
| **Scheduling** | No starvation | Preemptive reduction-based scheduling |
| **I/O** | No blocking propagation | Dirty schedulers, async I/O |
| **GC** | No global pauses | Per-process garbage collection |

## Supervision and Fault Tolerance

The actor model naturally supports fault tolerance through [supervision](@/glossary/supervision-tree.md) hierarchies. In [OTP](@/glossary/otp.md), supervisor processes monitor worker processes and restart them according to configurable strategies. This creates self-healing systems where transient failures are automatically recovered without manual intervention.

```elixir
defmodule Prismatic.Actor.AgentSupervisor do
  @moduledoc """
  Demonstrates OTP supervision as actor model fault tolerance.

  The supervisor is itself an actor that monitors child actors
  and restarts them according to a strategy. This creates a
  hierarchy of fault domains where failures are contained and
  recovered at the appropriate level.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts \\ []) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      # Each child is an actor with its own lifecycle
      {Prismatic.Actor.Counter, name: :global_counter},
      {Prismatic.Actor.PriorityProcessor, name: :task_processor},
      # DynamicSupervisor enables CREATE capability at runtime
      {DynamicSupervisor, name: Prismatic.Actor.DynamicAgents, strategy: :one_for_one}
    ]

    # one_for_one: if one child dies, only that child is restarted
    # one_for_all: if any child dies, all children are restarted
    # rest_for_one: if a child dies, it and all children after it are restarted
    Supervisor.init(children, strategy: :one_for_one)
  end

  @doc """
  Dynamically creates a new agent actor at runtime.

  This demonstrates the CREATE capability: an actor (this supervisor)
  creating new actors in response to messages.
  """
  @spec start_agent(module(), keyword()) :: DynamicSupervisor.on_start_child()
  def start_agent(module, opts) do
    DynamicSupervisor.start_child(
      Prismatic.Actor.DynamicAgents,
      {module, opts}
    )
  end
end
```

### Supervision Strategies

| Strategy | Behavior | Use Case |
|----------|----------|----------|
| **:one_for_one** | Restart only the failed child | Independent workers |
| **:one_for_all** | Restart all children if any fails | Interdependent components |
| **:rest_for_one** | Restart failed child and all after it | Sequential dependency chain |

The "let it crash" philosophy is often misunderstood as carelessness about errors. In reality, it is a sophisticated fault tolerance strategy: rather than trying to handle every possible error condition defensively (which is impossible in complex systems), you accept that failures will occur and design systems that recover automatically. Supervisors codify the recovery strategy, and the actor model's isolation guarantees ensure that failures do not propagate.

## Location Transparency

One of the actor model's most powerful properties is location transparency: the code that sends a message to an actor does not need to know whether that actor is on the same node, a different node in the same data center, or a node on a different continent. The runtime system handles message routing transparently.

In the BEAM, this property is implemented through process identifiers (PIDs) and registered names. A PID encodes the node on which the process runs, and `send/2` automatically routes messages to remote nodes when necessary. This makes it possible to write code that works identically in single-node development and multi-node production deployments.

```elixir
defmodule Prismatic.Actor.DistributedRegistry do
  @moduledoc """
  Demonstrates location transparency in actor systems.

  Actors can be addressed by name regardless of their physical
  location. The BEAM runtime routes messages transparently
  across nodes in a cluster.
  """

  @spec send_to_agent(atom(), term()) :: :ok | {:error, :not_found}
  def send_to_agent(agent_name, message) do
    # This works whether the agent is local or remote
    case :global.whereis_name(agent_name) do
      :undefined ->
        {:error, :not_found}

      pid when is_pid(pid) ->
        # send/2 handles routing to remote nodes transparently
        send(pid, message)
        :ok
    end
  end

  @spec call_agent(atom(), term(), timeout()) :: {:ok, term()} | {:error, term()}
  def call_agent(agent_name, request, timeout \\ 5_000) do
    case :global.whereis_name(agent_name) do
      :undefined ->
        {:error, :not_found}

      pid ->
        try do
          {:ok, GenServer.call(pid, request, timeout)}
        catch
          :exit, reason -> {:error, reason}
        end
    end
  end
end
```

## Actor Model vs Other Concurrency Models

Understanding how the actor model compares to other [concurrency](@/glossary/concurrent-programming.md) approaches helps in choosing the right model for a given problem.

| Property | Actor Model (BEAM) | Shared Memory (Java) | CSP (Go) | STM (Haskell) |
|----------|-------------------|---------------------|----------|---------------|
| **State** | Encapsulated per actor | Shared with locks | Encapsulated per goroutine | Shared with transactions |
| **Communication** | Async messages | Shared memory + sync | Typed channels | Transactional memory |
| **Failure Handling** | Supervision trees | try/catch/finally | Panic/recover | Exceptions |
| **Scheduling** | Preemptive | OS threads | Cooperative (goroutines) | OS threads |
| **GC Impact** | Per-process | Global stop-the-world | Global (improving) | Global |
| **Distribution** | Built-in | Manual | Manual | Manual |
| **Overhead per unit** | ~2KB per process | ~1MB per thread | ~8KB per goroutine | Thread-level |

The actor model excels in scenarios requiring high concurrency, fault tolerance, and distributed operation. Its per-process garbage collection and preemptive scheduling make it uniquely suitable for soft real-time systems where consistent latency matters more than raw throughput.

## Prismatic Platform Implementation

The Prismatic Platform uses the actor model pervasively, with every major subsystem built around independent BEAM processes communicating through messages.

| Subsystem | Actor Pattern | Process Count |
|-----------|--------------|---------------|
| **AIAD Agent System** | Each agent is a [GenServer](@/glossary/genserver.md) process | 530+ |
| **OSINT Collectors** | Each data source adapter runs in its own process | 120+ |
| **Storage Adapters** | ETS, Ecto, Meilisearch, KuzuDB adapter processes | Per-backend |
| **LiveView Sessions** | Each user session is a separate process | Per-user |
| **Telemetry Pipeline** | Event collection and aggregation process trees | Dynamic |
| **Quality Gates** | Parallel checker processes | Per-check |
| **API Endpoints** | Per-request process with timeout supervision | Per-request |

The multi-agent system is where the actor model shines most brightly. Each of the 530+ AIAD agents runs as an independent BEAM process with its own state, mailbox, and lifecycle. Agents communicate through message passing, are supervised for fault tolerance, and can be distributed across cluster nodes for scalability. The agent hierarchy (L1 Supreme through L5 Worker) maps naturally to supervision tree structures.

## Formal Properties

The actor model has well-defined formal semantics that enable mathematical reasoning about system behavior.

**Fairness**: Every message that is sent is eventually delivered (assuming the receiving actor continues to process messages). This prevents starvation and ensures progress.

**Encapsulation**: An actor's state is completely private. The only way to interact with an actor is through messages, and the actor determines how (or whether) to respond.

**Indeterminacy**: The order in which actors process messages from different senders is non-deterministic. This is not a bug but a feature -- it reflects the inherent non-determinism of concurrent and distributed systems and forces programmers to write code that is correct regardless of message ordering.

**Confluence**: Despite non-deterministic message ordering, well-designed actor systems exhibit confluence -- they reach the same final state regardless of the order in which concurrent operations complete. This property must be designed into the application; the model itself does not guarantee it.

## Historical Context

The actor model has evolved significantly since its introduction in 1973, influencing virtually every concurrent and distributed programming system.

| Year | Milestone |
|------|-----------|
| **1973** | Hewitt, Bishop, and Steiger publish the original actor model paper at MIT |
| **1977** | Hewitt and Baker develop actor model laws |
| **1986** | Gul Agha's dissertation formalizes actor semantics rigorously |
| **1986** | Ericsson begins developing Erlang, heavily influenced by actor concepts |
| **1996** | Erlang OTP framework codifies actor patterns as behaviors |
| **1998** | Erlang becomes open source, bringing actor model to broader audience |
| **2009** | Akka framework brings actor model to JVM ecosystem |
| **2012** | Jose Valim creates Elixir, modernizing the BEAM platform |
| **2014** | Microsoft Research releases Orleans (.NET virtual actor framework) |
| **2020s** | LLM-based multi-agent systems apply actor principles to AI |
| **2024-2026** | Prismatic Platform demonstrates 530+ actor multi-agent system |

## Common Anti-Patterns

Understanding what not to do is as important as understanding best practices when working with actor systems.

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **God Actor** | Single actor handling too many responsibilities | Decompose into specialized actors |
| **Synchronous Everywhere** | Using `call` when `cast` would suffice | Prefer async messages, use sync only when response needed |
| **Process Soup** | Spawning processes without supervision | Always supervise processes |
| **Shared ETS Abuse** | Using ETS tables as shared mutable state | Use ETS as cache, keep source of truth in actors |
| **Mailbox Overflow** | Sending faster than processing | Implement [backpressure](@/glossary/backpressure.md) with GenStage |
| **Missing Timeouts** | Indefinite waits on GenServer.call | Always specify timeouts |

## Related Concepts

- [BEAM](@/glossary/beam.md) -- Virtual machine implementing actor model
- [Process Isolation](@/glossary/process-isolation.md) -- Isolation guarantees in BEAM
- [Message Passing](@/glossary/message-passing.md) -- Communication mechanism between actors
- [GenServer](@/glossary/genserver.md) -- OTP behavior for generic server actors
- [Supervision Tree](@/glossary/supervision-tree.md) -- Hierarchical fault tolerance
- [Concurrent Programming](@/glossary/concurrent-programming.md) -- Broader concurrency paradigms
- [OTP](@/glossary/otp.md) -- Framework codifying actor patterns
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- System resilience through supervision
- [Multi-Agent System](@/glossary/multi-agent-system.md) -- Actor model applied to AI agents
- [Backpressure](@/glossary/backpressure.md) -- Flow control between actors

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
