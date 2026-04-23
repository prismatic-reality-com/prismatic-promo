+++
title = "Erlang"
weight = 50
[extra]
description = "A functional programming language designed for building massively concurrent, distributed, fault-tolerant soft real-time systems, created at Ericsson in 1986 and running on the BEAM virtual machine that also hosts Elixir"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "advanced"
domain_category = "programming-languages"
related_concepts = ["beam", "elixir", "otp", "genserver", "fault-tolerance", "hot-code-reload", "distributed-system"]
implementation_status = "production"
authority_level = "foundational"
difficulty_rating = 6
prerequisites = ["concurrency", "fault-tolerance", "functional-programming"]
learning_path = ["erlang", "beam", "otp", "elixir", "genserver", "supervision-tree"]
interactive_demos = ["/labs/glossary/erlang"]
code_examples = ["GenServer implementation", "Supervisor tree design", "Distributed Erlang clustering"]
external_resources = ["https://www.erlang.org/", "https://learnyousomeerlang.com/", "https://erlang.org/doc/design_principles/des_princ.html"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["process isolation verification", "hot code reload safety", "distributed node communication"]
keywords = ["erlang", "beam", "otp", "concurrent programming", "fault tolerance", "distributed systems", "telecom", "ericsson", "functional programming"]
tags = ["glossary", "core", "erlang", "beam", "otp", "language", "concurrency", "distributed"]
related_terms = ["beam", "elixir", "otp", "genserver", "fault-tolerance", "hot-code-reload", "distributed-system", "supervisor", "let-it-crash", "actor-model", "concurrency", "message-passing"]
word_count = 2032
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Erlang - Prismatic Platform"
+++

## Definition

Erlang is a general-purpose, functional programming language and runtime system designed for building massively concurrent, distributed, and fault-tolerant soft real-time systems. Created by Joe Armstrong, Robert Virding, and Mike Williams at Ericsson's Computer Science Laboratory in 1986, Erlang was originally developed to solve the demanding requirements of telecommunications switching systems: systems that must handle millions of simultaneous connections, never go down, and be upgraded without interrupting service.

Erlang runs on the [BEAM](@/glossary/beam.md) virtual machine (Bogdan/Bjorn's Erlang Abstract Machine), which provides lightweight processes, preemptive scheduling, garbage collection per process, and transparent distribution across nodes. The BEAM also hosts [Elixir](@/glossary/elixir.md), the language used by the Prismatic Platform, making Erlang both the intellectual ancestor and the runtime foundation of the entire platform.

## Overview

Erlang's design emerged from a specific engineering problem: how do you build telephone switches that handle hundreds of thousands of simultaneous calls, never crash (five nines availability: 99.999% uptime, or less than 5.26 minutes of downtime per year), and can be upgraded while calls are in progress? The answers to this question produced a language with properties that proved remarkably well-suited to modern distributed computing decades later.

The language is characterized by several distinctive features that set it apart from mainstream programming languages:

**Lightweight Processes**: Erlang processes are not operating system threads. They are extremely lightweight (approximately 300 bytes of initial memory), scheduled by the BEAM VM, and a single BEAM instance can run millions of them simultaneously. This makes the [Actor Model](@/glossary/actor-model.md) practical at scale.

**Message Passing**: Processes communicate exclusively through asynchronous [Message Passing](@/glossary/message-passing.md). There is no shared memory between processes. This eliminates entire classes of concurrency bugs (race conditions, deadlocks, data corruption) by construction rather than by convention.

**Let It Crash**: Rather than defensive programming with error handling at every level, Erlang embraces the [Let It Crash](@/glossary/let-it-crash.md) philosophy. Processes that encounter errors are allowed to fail. [Supervisor](@/glossary/supervisor.md) processes detect failures and restart failed processes in a known good state. This produces systems that self-heal from transient errors.

**Hot Code Reload**: Erlang supports [Hot Code Reload](@/glossary/hot-code-reload.md) -- replacing code in a running system without stopping it. A BEAM node can run two versions of a module simultaneously, with existing processes using the old version and new requests using the new version. This enables zero-downtime deployments.

**Immutable Data**: All data in Erlang is immutable. Once a variable is bound to a value, it cannot be changed (single assignment). This eliminates mutation-related bugs and makes reasoning about concurrent systems tractable.

### Historical Timeline

| Year | Milestone |
|------|-----------|
| 1986 | Joe Armstrong begins Erlang research at Ericsson |
| 1987 | First Erlang prototype implemented in Prolog |
| 1992 | First BEAM implementation by Bogumil Hausman |
| 1998 | Erlang open-sourced (Ericsson AXD301 switch, 1M+ lines) |
| 2006 | Erlang/OTP R11 with SMP (Symmetric Multiprocessing) support |
| 2007 | "Programming Erlang" by Joe Armstrong published |
| 2012 | Elixir 1.0 released, running on BEAM |
| 2019 | Joe Armstrong passes away (1950-2019) |
| 2023 | Erlang/OTP 26 with JIT compiler improvements |
| 2025 | Erlang/OTP 27 with documentation attributes |

## Technical Details

### The BEAM Virtual Machine

The BEAM VM is the execution environment for both Erlang and Elixir. Its architecture is specifically designed for the concurrency and fault-tolerance properties that Erlang requires:

**Schedulers**: The BEAM runs one scheduler per CPU core by default. Each scheduler manages a run queue of processes, executing them in time slices (reductions). After a fixed number of reductions (approximately 4000), a process is preempted and the scheduler moves to the next process. This ensures fair scheduling even when individual processes perform long computations.

**Process Heap Isolation**: Each process has its own heap and garbage collector. When a process is garbage collected, only that process is paused -- all other processes continue executing. This eliminates the "stop the world" GC pauses that plague other virtual machines. For real-time systems, this property is critical.

**Distribution**: BEAM nodes can form clusters by connecting over TCP. Sending a message to a process on a remote node uses the same syntax as sending to a local process. The distribution layer handles serialization, network transport, and node monitoring transparently.

**Binary Handling**: The BEAM has specialized support for binary data (bitstrings). Pattern matching on binaries is highly optimized, making Erlang effective for protocol parsing, packet processing, and binary file formats.

### Process Architecture

```
+-- BEAM Node -------------------------------------------+
|                                                        |
|  Scheduler 1        Scheduler 2        Scheduler N     |
|  +----------+       +----------+       +----------+    |
|  | Process A |       | Process D |       | Process G |   |
|  | Process B |       | Process E |       | Process H |   |
|  | Process C |       | Process F |       | Process I |   |
|  +----------+       +----------+       +----------+    |
|                                                        |
|  Shared: Atom table, ETS tables, Code server           |
|  Isolated: Process heaps, mailboxes, GC                |
+--------------------------------------------------------+
```

### OTP Framework

[OTP](@/glossary/otp.md) (Open Telecom Platform) is Erlang's standard library and framework for building robust applications. Despite the telecom-specific name, OTP is a general-purpose framework used by virtually all production Erlang and Elixir applications:

**GenServer**: The generic server behavior for implementing client-server processes. Handles synchronous calls, asynchronous casts, and info messages with standardized callback interfaces.

**Supervisor**: Manages child processes with configurable restart strategies (one_for_one, one_for_all, rest_for_one). Supervisors form trees that provide hierarchical fault containment.

**Application**: The unit of deployment in OTP. An application starts its supervision tree, manages its configuration, and can be started and stopped as a unit.

**gen_statem**: A generic state machine behavior for implementing finite state machines with state-specific callbacks.

## Implementation in Prismatic Platform

The Prismatic Platform is built on Elixir, which compiles to BEAM bytecode and runs alongside Erlang on the same virtual machine. This means every Prismatic component directly benefits from Erlang's runtime properties.

### BEAM Runtime Configuration

```elixir
defmodule PrismaticRelease do
  @moduledoc """
  Release configuration leveraging BEAM VM capabilities
  inherited from Erlang's runtime system.
  """

  @spec vm_args() :: [String.t()]
  def vm_args do
    [
      # Scheduler configuration
      "+S #{System.schedulers_online()}:#{System.schedulers_online()}",

      # Process limits (Erlang default: 262144)
      "+P 1048576",

      # Port limits
      "+Q 65536",

      # Async thread pool for file I/O
      "+A 128",

      # Enable scheduler binding for NUMA
      "+sbt db",

      # Kernel polling (epoll/kqueue)
      "+K true",

      # Distribution buffer size
      "+zdbbl 32768",

      # Crash dump location
      "-env ERL_CRASH_DUMP /var/log/prismatic/erl_crash.dump"
    ]
  end
end
```

### Erlang Interoperability

```elixir
defmodule Prismatic.ErlangInterop do
  @moduledoc """
  Direct Erlang module usage from Prismatic Platform.
  Elixir can call any Erlang module directly since both
  compile to BEAM bytecode.
  """

  @spec erlang_system_info() :: map()
  def erlang_system_info do
    %{
      otp_release: :erlang.system_info(:otp_release) |> List.to_string(),
      version: :erlang.system_info(:version) |> List.to_string(),
      schedulers: :erlang.system_info(:schedulers),
      schedulers_online: :erlang.system_info(:schedulers_online),
      process_count: :erlang.system_info(:process_count),
      process_limit: :erlang.system_info(:process_limit),
      atom_count: :erlang.system_info(:atom_count),
      atom_limit: :erlang.system_info(:atom_limit),
      ets_count: :erlang.system_info(:ets_count),
      memory_total: :erlang.memory(:total),
      memory_processes: :erlang.memory(:processes),
      memory_ets: :erlang.memory(:ets),
      memory_binary: :erlang.memory(:binary),
      uptime_ms: :erlang.statistics(:wall_clock) |> elem(0)
    }
  end

  @spec erlang_distribution_info() :: map()
  def erlang_distribution_info do
    %{
      node: node(),
      connected_nodes: Node.list(),
      cookie: Node.get_cookie(),
      alive: Node.alive?(),
      net_kernel_info: :net_kernel.get_state()
    }
  end

  @doc """
  Demonstrates calling Erlang's :ets module directly.
  ETS (Erlang Term Storage) is an in-memory database
  implemented as a BEAM built-in.
  """
  @spec create_ets_table(atom(), keyword()) :: :ets.tid()
  def create_ets_table(name, opts \\ []) do
    default_opts = [:named_table, :public, read_concurrency: true]
    :ets.new(name, Keyword.merge(default_opts, opts))
  end

  @doc """
  Demonstrates Erlang's binary pattern matching for protocol parsing.
  This capability comes directly from Erlang's telecom heritage.
  """
  @spec parse_dns_header(binary()) ::
    {:ok, map()} | {:error, :invalid_header}
  def parse_dns_header(<<
    id::16,
    qr::1, opcode::4, aa::1, tc::1, rd::1,
    ra::1, _z::3, rcode::4,
    qdcount::16,
    ancount::16,
    nscount::16,
    arcount::16,
    _rest::binary
  >>) do
    {:ok, %{
      id: id,
      qr: qr,
      opcode: opcode,
      authoritative: aa == 1,
      truncated: tc == 1,
      recursion_desired: rd == 1,
      recursion_available: ra == 1,
      response_code: rcode,
      question_count: qdcount,
      answer_count: ancount,
      authority_count: nscount,
      additional_count: arcount
    }}
  end

  def parse_dns_header(_), do: {:error, :invalid_header}
end
```

### Supervisor Tree Design

The Prismatic Platform's supervision tree follows Erlang/OTP conventions, providing fault isolation across the 115-app umbrella:

```elixir
defmodule Prismatic.Application do
  @moduledoc """
  Top-level application following Erlang/OTP conventions.
  The supervision tree provides fault isolation -- a crash
  in one subsystem does not affect others.
  """

  use Application

  @impl true
  @spec start(Application.start_type(), term()) ::
    {:ok, pid()} | {:error, term()}
  def start(_type, _args) do
    children = [
      # Infrastructure layer (start first, fail fast)
      {Prismatic.Telemetry, []},
      {Prismatic.Storage.Supervisor, []},

      # Domain layer (depends on infrastructure)
      {Prismatic.Agents.Supervisor, strategy: :one_for_one},
      {Prismatic.Epistemic.Supervisor, strategy: :one_for_one},
      {Prismatic.Perimeter.Supervisor, strategy: :one_for_one},

      # Interface layer (depends on domain)
      {Prismatic.API.Supervisor, []},
      {PrismaticWeb.Endpoint, []}
    ]

    opts = [strategy: :one_for_one, name: Prismatic.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
```

## Comparison with Alternatives

### vs. Go

Go provides goroutines for concurrency and channels for communication, superficially similar to Erlang's processes and messages. Key differences: Go uses shared memory with mutexes (Erlang forbids shared memory). Go has no process isolation (a goroutine panic crashes the whole program). Go lacks supervision trees and hot code reload. Go's concurrency is simpler to learn but provides weaker fault-tolerance guarantees.

### vs. Java/JVM

The JVM provides threads (heavy, ~1MB stack each) while BEAM provides processes (lightweight, ~300 bytes each). JVM garbage collection is global (stop-the-world pauses). BEAM garbage collection is per-process (microsecond pauses). Java requires explicit synchronization for shared state. Erlang eliminates shared state by construction. The JVM has better raw throughput for CPU-bound work; the BEAM excels at I/O-bound, highly concurrent workloads.

### vs. Rust

Rust provides memory safety through ownership and borrowing, compile-time guarantees that Erlang provides at runtime through process isolation. Rust excels at systems programming with predictable latency and zero-cost abstractions. Erlang excels at distributed systems with dynamic process management and hot code reload. They are complementary rather than competing: Rust for performance-critical components, Erlang/Elixir for orchestration and coordination.

### vs. Node.js

Node.js uses a single-threaded event loop with async I/O. Erlang uses preemptive scheduling across multiple processes. A long-running computation in Node blocks all other operations; in Erlang, it only consumes its process's time slice. Node has no native process isolation, supervision, or hot code reload. Node has a larger ecosystem of npm packages; Erlang has a smaller but more battle-tested library ecosystem.

### vs. Akka (Scala/Java)

Akka implements the Actor Model on the JVM, inspired by Erlang. Key differences: Akka actors share JVM heap (no isolation). Akka requires explicit cluster management (Erlang distribution is built-in). Akka cannot do hot code reload safely. Akka's actor system can crash together; Erlang processes crash independently. Akka provides more type safety (Typed Actors); Erlang provides more runtime safety.

## Best Practices

1. **Design process architectures before writing code.** Sketch your supervision tree first. Identify which processes are stateful, which are workers, and how failures should propagate. The process architecture is the application architecture in Erlang/BEAM systems.

2. **Use OTP behaviors, never raw processes.** Always use GenServer, Supervisor, gen_statem, or similar OTP behaviors rather than bare `spawn`. OTP behaviors provide standardized debugging, introspection, and hot code upgrade support that raw processes lack.

3. **Keep process state small.** Each process has its own heap. A process with a large state causes large GC pauses for that process and consumes proportionally more memory. Offload large data to [ETS](@/glossary/ets.md) tables or external storage.

4. **Let it crash -- but design your supervision strategy.** The let-it-crash philosophy does not mean ignoring errors. It means handling errors at the right level of abstraction. Individual processes crash and restart; supervisors define how crashes propagate and how recovery occurs.

5. **Use binary pattern matching for protocol work.** Erlang's binary syntax is one of its strongest features. Parsing network protocols, file formats, and wire encodings is dramatically cleaner with binary pattern matching than with manual byte manipulation.

6. **Monitor BEAM VM metrics in production.** Track scheduler utilization, process counts, memory per category (processes, ETS, binaries, atoms), message queue lengths, and GC statistics. The BEAM provides rich introspection via `:erlang.system_info/1` and `:erlang.statistics/1`.

## Common Pitfalls

1. **Creating processes for everything.** Not everything needs its own process. Pure data transformations, stateless computations, and short-lived operations should be plain function calls. Processes are for state, concurrency boundaries, and failure isolation.

2. **Message queue overflow.** If a process receives messages faster than it can process them, its mailbox grows unboundedly, consuming memory. Monitor message queue lengths (`Process.info(pid, :message_queue_len)`) and implement backpressure mechanisms.

3. **Atom exhaustion.** Atoms are not garbage collected. Creating atoms dynamically from user input (e.g., `String.to_atom/1`) can exhaust the atom table (default limit: 1,048,576). Always use `String.to_existing_atom/1` for untrusted input.

4. **Large binaries in process state.** Binaries larger than 64 bytes are stored on the shared binary heap with reference counting. Processes holding references to large binaries can prevent garbage collection of those binaries. Be explicit about binary lifecycle.

5. **Blocking schedulers.** A NIF (Native Implemented Function) or port driver that blocks for too long reduces scheduler availability for all processes. Use dirty schedulers for long-running native operations and async thread pools for blocking I/O.

6. **Ignoring distribution overhead.** Sending messages between BEAM nodes requires serialization. Large messages between nodes consume network bandwidth and CPU for serialization. Design distributed protocols to exchange references and small messages, not large data blobs.

## Use Cases

### Telecommunications (Original Domain)

Erlang was built for telecom switches. Ericsson's AXD301 ATM switch, with over 1 million lines of Erlang code, achieved nine nines availability (99.9999999%). WhatsApp handled 2 million concurrent connections per server using Erlang. T-Mobile, Motorola, and Nokia all use Erlang in their telecommunications infrastructure.

### Messaging Systems

RabbitMQ (the most widely deployed message broker) and ejabberd (XMPP server) are written in Erlang. Discord's message routing layer uses Erlang. The BEAM's process model maps naturally to connection handling where each client connection is managed by a dedicated process.

### Database Systems

Riak (distributed key-value store), CouchDB (document database), and portions of Cassandra's coordinator use Erlang. The language's distribution primitives and fault-tolerance make it well-suited for distributed database implementation where partitions and failures are expected.

### Prismatic Platform

The Prismatic Platform runs on the BEAM through Elixir, directly inheriting Erlang's properties. The 115-app umbrella architecture maps to OTP applications with supervised process trees. The 530+ agents each run as supervised processes. [ETS](@/glossary/ets.md) provides in-memory storage for registries and caches. Distribution enables future clustering for horizontal scaling.

### Financial Systems

Goldman Sachs, IMC Trading, and Klarna use Erlang/Elixir for financial systems where reliability and low-latency concurrent processing are critical. The BEAM's soft real-time guarantees (predictable latency through per-process GC) are valued in financial trading contexts.

## Erlang's Influence on Modern Languages

Erlang's ideas have influenced numerous modern languages and frameworks:

- **Elixir**: Built directly on the BEAM, adding metaprogramming, polymorphism, and modern tooling
- **Go**: Goroutines and channels were influenced by Erlang's processes and messages
- **Rust**: Tokio's actor-like patterns draw from Erlang's model
- **Swift**: Structured concurrency in Swift actors echoes Erlang's process isolation
- **Akka (Scala/Java)**: Direct implementation of Erlang's actor model on the JVM
- **Pony**: Actor-model language with capabilities inspired by Erlang's isolation

## Related Concepts

- [BEAM](@/glossary/beam.md) - The virtual machine that executes Erlang and Elixir bytecode
- [Elixir](@/glossary/elixir.md) - Modern language running on the BEAM, used by Prismatic Platform
- [OTP](@/glossary/otp.md) - Erlang's framework for building robust applications
- [GenServer](@/glossary/genserver.md) - The generic server behavior central to OTP application design
- [Fault Tolerance](@/glossary/fault-tolerance.md) - The ability to continue operating despite component failures
- [Hot Code Reload](@/glossary/hot-code-reload.md) - Replacing code in a running system without downtime
- [Distributed System](@/glossary/distributed-system.md) - Systems spanning multiple networked nodes
- [Let It Crash](@/glossary/let-it-crash.md) - Erlang's error handling philosophy using supervised restarts
- [Supervisor](@/glossary/supervisor.md) - OTP behavior for managing child process lifecycle
- [Actor Model](@/glossary/actor-model.md) - The concurrency model that Erlang implements
- [Message Passing](@/glossary/message-passing.md) - Inter-process communication via asynchronous messages
- [Concurrency](@/glossary/concurrency.md) - Executing multiple computations simultaneously

## See Also

- [ETS](@/glossary/ets.md) - Erlang Term Storage for in-memory data
- [Pattern Matching](@/glossary/pattern-matching.md) - First-class pattern matching in function heads and case expressions
- [Supervision Tree](@/glossary/supervision-tree.md) - Hierarchical process management structure
- [Immutability](@/glossary/immutability.md) - All data in Erlang is immutable by default
- [Telemetry](@/glossary/telemetry.md) - Observability built on BEAM's introspection capabilities
- [Phoenix](@/glossary/phoenix.md) - Web framework built on Elixir/BEAM

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
