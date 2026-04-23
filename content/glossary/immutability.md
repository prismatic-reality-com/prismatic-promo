+++
title = "Immutability"
weight = 27
[extra]
category = "architecture"
description = "Property where data cannot be modified after creation, ensuring referential transparency and eliminating concurrency hazards in the Prismatic Platform"
related_terms = ["pure-function", "event-sourcing", "pattern-matching", "pipe-operator", "beam", "process-isolation", "message-passing", "fault-tolerance", "ecto", "genserver", "broadway"]
keywords = ["immutable data structures", "functional programming immutability", "Elixir immutable by default", "structural sharing efficiency", "HAMT data structure", "concurrent safe data", "referential transparency", "copy-on-write semantics", "BEAM process isolation", "immutable state machines"]
tags = ["immutability", "functional-programming", "concurrency", "architecture"]
platform_integration = "core"
complexity = "intermediate"
audience = ["elixir-developers", "platform-architects", "functional-programming-practitioners"]
date_created = "2026-02-22"
version = "2.0.0"
requires_knowledge = ["elixir", "beam", "functional-programming"]
prismatic_components = ["Stack Conversation", "Quality DNA", "Event Logs", "Security Ratings", "Agent Specifications"]
data_structures = ["list", "map", "tuple", "binary", "struct", "keyword-list"]
concurrency_hazards_eliminated = ["data-race", "lost-update", "dirty-read", "deadlock", "priority-inversion", "ABA-problem"]
enforcement_level = "language-level"
beam_mechanism = "per-process heap with copy semantics"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1668
date_modified = "2026-02-23"
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Immutability - Prismatic Platform"
+++

## Definition and Overview

Immutability is the property of data structures that prevents modification after creation. Rather than changing existing data in place, operations on immutable data produce new data structures containing the desired modifications while leaving the original intact. In Elixir and other functional programming languages, all data is immutable by default -- there is no mechanism to mutate a variable's value, alter a map's key, or modify a list element in place. Every apparent "update" is actually the creation of a new data structure.

This design choice eliminates entire categories of bugs that plague systems built on mutable shared state: data races, temporal coupling, aliasing bugs, iterator invalidation, and the general difficulty of reasoning about code where any reference to data might change at any time from any thread. When data is immutable, a reference to a value is guaranteed to remain valid and unchanged for the lifetime of the reference. Functions that receive immutable data can reason about it locally without concern for concurrent modification by other threads, processes, or callbacks.

Immutability operates synergistically with [process isolation](@/glossary/process-isolation.md) in the [BEAM](@/glossary/beam.md) virtual machine. Since each process has its own heap and data is copied during [message passing](@/glossary/message-passing.md), the combination of immutable data and isolated processes means that the BEAM provides the strongest possible concurrency safety guarantees: no process can observe or cause state changes in another process's data, and no piece of data can change after being created. This double guarantee is the foundation of Erlang/OTP's legendary reliability.

In the Prismatic Platform, immutability is not merely a language feature but an architectural principle that permeates every design decision -- from the Stack Conversation system's frame immutability to the Quality DNA's append-only snapshot history.

## Historical Context

The concept of immutability in programming traces back to lambda calculus (1930s) and its realization in early functional programming languages. Lisp (1958) was the first practical language to emphasize immutable cons cells, though it also provided mutation primitives. ML (1973) and Haskell (1990) made immutability more central, with Haskell enforcing purity through its type system.

Erlang (1986) took a different approach from academic functional languages. Joe Armstrong and the Ericsson team chose immutability not for mathematical purity but for practical engineering reasons: telecommunications systems needed to handle millions of concurrent operations without data corruption. Mutable shared state would have required locking, which introduces deadlocks and performance bottlenecks. Immutable data with process isolation eliminated both problems at the language level rather than relying on programmer discipline.

Elixir (2012) inherited Erlang's immutability guarantee while providing modern syntax and a macro system. Jose Valim's experience building concurrent web applications in Ruby (where mutable shared state via threads is a constant source of bugs) directly motivated his choice to build Elixir on the BEAM. The rebinding semantics in Elixir (where `x = 1; x = 2` creates a new binding rather than mutating) are a deliberate ergonomic improvement over Erlang's single-assignment variables, providing the same safety guarantees with a more intuitive syntax for developers coming from imperative languages.

## How Immutability Works in Elixir

In Elixir, every data type -- integers, atoms, strings, lists, maps, tuples, structs -- is immutable. The `=` operator is the match operator, not an assignment operator, and rebinding a variable creates a new binding rather than modifying the old value:

```elixir
# Rebinding creates a new value -- the original is unchanged
list = [1, 2, 3]
new_list = [0 | list]
# list is still [1, 2, 3]
# new_list is [0, 1, 2, 3]

# Map "updates" create new maps
user = %{name: "Alice", role: :admin}
updated_user = %{user | role: :viewer}
# user is still %{name: "Alice", role: :admin}
# updated_user is %{name: "Alice", role: :viewer}

# Deeply nested updates via put_in/update_in create new structures at each level
config = %{
  security: %{
    tls: %{version: "1.2", cipher_suites: [:aes_256_gcm]}
  }
}
new_config = put_in(config, [:security, :tls, :version], "1.3")
# config is unchanged; new_config has the updated TLS version

# Struct updates follow the same immutable semantics
defmodule ScanResult do
  defstruct [:domain, :score, :scanned_at]
end

result = %ScanResult{domain: "example.com", score: 85}
updated_result = %{result | score: 92, scanned_at: DateTime.utc_now()}
# result is unchanged; updated_result contains the new values
```

## Structural Sharing

A naive immutability implementation would copy entire data structures on every modification, making it prohibitively expensive. Elixir (and Erlang) use structural sharing to make immutable updates efficient. When a new data structure is created from an old one, the new structure shares unchanged portions of the old structure rather than copying them:

```
Original list:  [1, 2, 3]
                 |  |  |
                 v  v  v
Memory:         [1]->[2]->[3]->[]

New list:       [0 | original]
                 |
                 v
Memory:         [0]->[1]->[2]->[3]->[]
                      ^
                      |
                      shared with original
```

For maps, the internal Hash Array Mapped Trie (HAMT) representation enables O(log32 n) updates that share the vast majority of the tree structure with the original:

| Operation | Time Complexity | Space Complexity | Structural Sharing |
|-----------|----------------|-----------------|-------------------|
| Prepend to list | O(1) | O(1) | Tail shared with original |
| Append to list | O(n) | O(n) | No sharing (new list created) |
| Map put/update | O(log n) | O(log n) | Unchanged branches shared |
| Tuple update | O(n) | O(n) | Full copy (flat structure) |
| Binary concat | O(m) | O(m) | Sub-binaries share underlying |
| Struct update | O(log n) | O(log n) | Same as map (struct = map) |

This means that updating a map with 10,000 entries only allocates memory proportional to the depth of the HAMT tree (approximately log32(10000) = 3 levels), not the size of the map. In practice, structural sharing makes immutable operations nearly as efficient as in-place mutation for most data structures.

## Immutability and Concurrency

The most significant engineering benefit of immutability is the elimination of concurrency hazards. In mutable-state systems, concurrent access to shared data requires explicit synchronization (locks, mutexes, atomic operations) that is notoriously difficult to implement correctly. Immutable data requires no synchronization because it cannot change:

| Concurrency Hazard | Mutable State | Immutable State |
|-------------------|--------------|-----------------|
| **Data Race** | Two threads modify same data simultaneously | Impossible -- data cannot be modified |
| **Lost Update** | Concurrent writes overwrite each other | Impossible -- "writes" create new values |
| **Dirty Read** | Thread reads partially-updated data | Impossible -- data is always consistent |
| **Deadlock** | Circular lock dependencies | Impossible -- no locks needed |
| **Priority Inversion** | High-priority thread blocked by low-priority lock holder | Impossible -- no locks |
| **ABA Problem** | Value changes from A to B back to A between checks | Impossible -- identity is value-based |

In the BEAM context, immutability combines with process isolation to create an even stronger guarantee: not only can data not be mutated, but each process operates on its own private copy of data. This means that reasoning about concurrency in Elixir reduces to reasoning about message ordering -- a fundamentally simpler problem than reasoning about shared mutable state.

## Immutability in the Prismatic Platform

Elixir's immutable-by-default semantics permeate the entire Prismatic Platform's architecture. All data flowing through [GenServer](@/glossary/genserver.md) processes, [Broadway](@/glossary/broadway.md) pipelines, and storage adapters is immutable. The platform leverages immutability at multiple levels:

### Stack-Based Conversation Mode

The Stack Conversation system enforces frame immutability -- once a conversation frame is created, it cannot be modified. New frames are appended; old frames remain unchanged. This provides a complete audit trail of every interaction:

```elixir
defmodule PrismaticClaude.StackConversation.Frame do
  @moduledoc """
  Immutable conversation frame. Once created, a frame's content
  cannot be modified. New information creates new frames rather
  than updating existing ones. Frame immutability is enforced
  by the StackConversation GenServer -- no update API exists.
  """

  @type t :: %__MODULE__{
    id: pos_integer(),
    user_input: String.t(),
    assistant_output: String.t(),
    assumptions: [String.t()],
    decisions: [String.t()],
    created_at: DateTime.t()
  }

  @enforce_keys [:id, :user_input, :assistant_output, :created_at]
  defstruct [:id, :user_input, :assistant_output, :assumptions, :decisions, :created_at]
end
```

### Quality DNA Snapshots

Quality metric snapshots are immutable records persisted across sessions. Each session creates new snapshots without modifying prior ones, enabling trend analysis over the platform's complete quality history:

```elixir
defmodule PrismaticSafety.QualityDNA.Snapshot do
  @moduledoc """
  Immutable quality state snapshot. Snapshots are append-only --
  new measurements create new snapshot records while historical
  snapshots remain unchanged for trend analysis and auditing.
  """

  @type t :: %__MODULE__{
    score: non_neg_integer(),
    domains: map(),
    timestamp: DateTime.t(),
    session_id: String.t()
  }

  defstruct [:score, :domains, :timestamp, :session_id]

  @spec create(non_neg_integer(), map(), String.t()) :: {:ok, t()}
  def create(score, domains, session_id) do
    snapshot = %__MODULE__{
      score: score,
      domains: domains,
      timestamp: DateTime.utc_now(),
      session_id: session_id
    }
    {:ok, snapshot}
  end
end
```

### Security Rating History

Compliance assessment results in the [Perimeter](@/glossary/easm.md) module are immutable snapshots. Historical ratings are never modified, enabling accurate trend reporting and regulatory audit trails required by [NIS2](@/glossary/nis2.md) compliance.

### Event Logs

All system events are stored as immutable records. [Quality gate](@/glossary/quality-gates.md) results, agent execution traces, and security scan findings are appended to event logs but never modified, providing tamper-evident history.

### Configuration State in GenServers

[GenServer](@/glossary/genserver.md) state in the platform's agent processes is immutable at each point in time. State transitions create new state values via callbacks, with the previous state remaining valid until garbage collection:

```elixir
defmodule PrismaticAgents.AgentProcess do
  @moduledoc """
  Agent runtime process demonstrating immutable state transitions.
  Each handle_cast/handle_call returns a NEW state map -- the
  previous state is never modified, only replaced.
  """

  use GenServer

  @type agent_state :: %{
    name: String.t(),
    status: :idle | :running | :completed | :failed,
    execution_count: non_neg_integer(),
    last_result: term(),
    started_at: DateTime.t()
  }

  @impl true
  def init(opts) do
    state = %{
      name: Keyword.fetch!(opts, :name),
      status: :idle,
      execution_count: 0,
      last_result: nil,
      started_at: DateTime.utc_now()
    }
    {:ok, state}
  end

  @impl true
  def handle_cast({:execute, command}, state) do
    # New state created -- old state is unchanged and will be GC'd
    new_state = %{state |
      status: :running,
      execution_count: state.execution_count + 1
    }
    {:noreply, new_state}
  end

  @impl true
  def handle_cast({:complete, result}, %{status: :running} = state) do
    new_state = %{state |
      status: :completed,
      last_result: result
    }
    {:noreply, new_state}
  end
end
```

## Immutability Patterns in Elixir

### Accumulator Pattern

```elixir
defmodule PrismaticSafety.QualityReport do
  @moduledoc """
  Generates quality reports through immutable accumulation.
  Each domain check adds to the accumulator without modifying
  previous results.
  """

  @spec generate(list(atom())) :: {:ok, map()}
  def generate(domains) do
    report =
      Enum.reduce(domains, %{total: 0, passed: 0, violations: []}, fn domain, acc ->
        result = check_domain(domain)
        %{
          total: acc.total + 1,
          passed: acc.passed + (if result.passed?, do: 1, else: 0),
          violations: acc.violations ++ result.violations
        }
      end)

    {:ok, report}
  end

  defp check_domain(_domain), do: %{passed?: true, violations: []}
end
```

### Transform Pipeline

```elixir
defmodule PrismaticPerimeter.AssetNormalizer do
  @moduledoc """
  Normalizes discovered assets through an immutable transformation pipeline.
  Each function returns a NEW map -- the original is never changed.
  """

  @spec normalize(map()) :: {:ok, map()} | {:error, term()}
  def normalize(raw_asset) do
    result =
      raw_asset
      |> downcase_domain()
      |> strip_trailing_dot()
      |> validate_format()
      |> enrich_metadata()
      |> tag_discovery_source()

    {:ok, result}
  end

  defp downcase_domain(%{domain: d} = asset),
    do: %{asset | domain: String.downcase(d)}

  defp strip_trailing_dot(%{domain: d} = asset),
    do: %{asset | domain: String.trim_trailing(d, ".")}

  defp validate_format(asset), do: asset
  defp enrich_metadata(asset), do: asset
  defp tag_discovery_source(asset), do: asset
end
```

### Immutable State Machine

```elixir
defmodule PrismaticPerimeter.ScanStateMachine do
  @moduledoc """
  State machine with immutable transitions. Each transition
  produces a new state value; the previous state is preserved
  for audit logging before being replaced in the GenServer.
  """

  @type scan_state :: :pending | :scanning | :analyzing | :complete | :failed

  @spec transition(scan_state(), atom()) :: {:ok, scan_state()} | {:error, :invalid_transition}
  def transition(:pending, :start), do: {:ok, :scanning}
  def transition(:scanning, :analyze), do: {:ok, :analyzing}
  def transition(:analyzing, :complete), do: {:ok, :complete}
  def transition(:scanning, :fail), do: {:ok, :failed}
  def transition(:analyzing, :fail), do: {:ok, :failed}
  def transition(_state, _event), do: {:error, :invalid_transition}
end
```

## Tradeoffs and Considerations

| Aspect | Benefit | Cost |
|--------|---------|------|
| **Memory** | Structural sharing minimizes copies | More allocations than in-place mutation |
| **GC Pressure** | Per-process GC limits blast radius | Frequent allocations increase GC frequency |
| **Reasoning** | Local reasoning, no spooky action at distance | Must learn functional update patterns |
| **Performance** | No lock overhead, parallel-safe by default | Some operations slower than in-place mutation |
| **Debugging** | Value at any point in time is stable | Cannot "watch" a variable change in debugger |
| **Persistence** | Natural fit for event sourcing and audit trails | Append-only storage grows over time |
| **Testing** | Deterministic inputs produce deterministic outputs | Need to construct full state for each test |

For the Prismatic Platform's workloads -- agent coordination, security scanning, quality analysis, OSINT processing -- immutability's benefits vastly outweigh its costs. The I/O-bound nature of most operations means that the marginal memory overhead of immutable updates is negligible compared to network and database latency.

## Performance Implications

The BEAM virtual machine is optimized for immutable data. Per-process garbage collection means that when a process terminates, all its allocated data is reclaimed instantly without a global GC pause. For short-lived processes (like those handling individual HTTP requests in [Phoenix](@/glossary/phoenix.md)), this means zero GC overhead -- the process heap is simply deallocated when the request completes.

For long-lived processes (like [GenServer](@/glossary/genserver.md) agents in the platform), the BEAM's generational GC efficiently handles immutable data because structural sharing ensures that most data pointed to by the current state is in the old generation and does not need collection. Only the recently created "new" portions of the state are candidates for collection.

```elixir
# ETS tables provide mutable-semantics escape hatch when needed
# Used for high-frequency counters and caches where immutability
# overhead would be unacceptable
:ets.update_counter(:metrics, :request_count, 1)
```

[ETS](@/glossary/ets.md) tables are the platform's controlled exception to immutability. They provide concurrent read/write access to shared data using fine-grained locking managed by the VM. The platform uses ETS for performance-critical caches and counters where the overhead of message passing and immutable state updates would be unacceptable.

## Best Practices

1. **Embrace immutability as the default**. Do not fight the language by storing mutable state in ETS or external stores unless there is a measured performance need.

2. **Use the pipe operator for transformation chains**. Immutable data flows naturally through pipes, making data transformations readable and composable.

3. **Prefer prepending to lists over appending**. Prepend is O(1) due to structural sharing; append is O(n) because the entire list must be copied.

4. **Use maps for data that changes frequently**. Maps use HAMT internally, providing O(log32 n) updates with minimal copying.

5. **Leverage per-process GC for short-lived state**. Spawn processes for request handling or task execution to benefit from instant heap reclamation on process termination.

## Related Terms

- [Pure Function](@/glossary/pure-function.md) -- Functions that depend only on immutable inputs and produce no side effects
- [Pattern Matching](@/glossary/pattern-matching.md) -- Destructuring technique working with immutable data structures
- [Pipe Operator](@/glossary/pipe-operator.md) -- Composition operator chaining immutable transformations
- [Process Isolation](@/glossary/process-isolation.md) -- BEAM isolation that complements immutability for concurrency safety
- [BEAM](@/glossary/beam.md) -- Virtual machine with immutable data as a foundational property
- [Event Sourcing](@/glossary/event-sourcing.md) -- Pattern leveraging immutable event logs for state reconstruction
- [Message Passing](@/glossary/message-passing.md) -- Communication mechanism using copy semantics over immutable data
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- System property enabled by immutable state and process isolation
- [GenServer](@/glossary/genserver.md) -- OTP process with immutable state transitions
- [Ecto](@/glossary/ecto.md) -- Database toolkit using immutable changesets

## See Also

- [Architecture](@/architecture/_index.md) -- Immutability as a core platform design principle
- [Technologies](@/technologies/_index.md) -- Elixir's functional programming foundations
- [Capabilities](@/capabilities/_index.md) -- Platform capabilities built on immutable data guarantees

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
