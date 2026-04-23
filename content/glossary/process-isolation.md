+++
title = "Process Isolation"
weight = 31
[extra]
category = "otp"
description = "BEAM property ensuring each process has its own memory heap, garbage collector, and failure boundary, preventing one process from corrupting or crashing another."
related_terms = ["beam", "fault-tolerance", "let-it-crash", "supervisor", "message-passing", "immutability", "process-isolation"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1460
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Process", "Isolation", "BEAM", "glossary", "otp", "Prismatic Platform", "Shared"]
tags = ["glossary", "otp", "process-isolation", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Process Isolation - Prismatic Platform"
+++

## Definition

Process isolation is a fundamental architectural property of the [BEAM](/glossary/beam/) virtual machine that guarantees each lightweight process operates within its own memory heap, maintains its own garbage collector, and defines its own failure boundary. Unlike operating system threads that share memory space and can corrupt each other's state through data races, BEAM processes are hermetically sealed units of computation. A crash, memory leak, out-of-memory condition, or infinite loop in one process cannot corrupt the state, interfere with the execution, or destabilize the operation of any other process running on the same virtual machine.

This isolation model is achieved through a combination of per-process heap allocation, copy-on-send message semantics, and the absence of shared mutable state between processes. When Process A sends a message to Process B, the data is deep-copied from A's heap into B's heap. There are no pointers shared between processes, no locks to coordinate, and no possibility of one process reading another's memory directly. This design was originally motivated by the telecommunications industry's requirement for systems that could tolerate hardware failures in individual components without losing calls across the entire switch, and it remains the technical foundation that makes Erlang/OTP systems among the most fault-tolerant software architectures in existence.

The philosophical consequence of process isolation is profound: it makes failure a first-class, manageable event rather than a catastrophic system-wide condition. Because one process crashing cannot damage another, the system can safely terminate a misbehaving process and restart it with a clean state -- the core mechanism behind the [let-it-crash](/glossary/let-it-crash/) philosophy and the [supervisor](/glossary/supervisor/) pattern.

## How Process Isolation Works

The BEAM virtual machine implements process isolation through several cooperating mechanisms that operate at the VM level, below the reach of application code. Understanding these mechanisms clarifies why isolation guarantees are absolute rather than best-effort.

Each BEAM process is allocated its own heap region when it is spawned. The initial heap size is small (typically 233 words on 64-bit systems) and grows as needed through a generational garbage collector that operates exclusively on that single process's heap. When a process's heap needs collection, the BEAM pauses only that process -- not the entire VM, not other processes, and not even processes in the same supervision tree. This per-process garbage collection eliminates the "stop-the-world" pauses that plague many concurrent runtimes and ensures that a process with heavy allocation patterns does not impose GC latency on unrelated processes.

Message passing between processes follows strict copy semantics. When `Process.send(pid, data)` is called, the BEAM copies the entire data structure from the sender's heap into the receiver's mailbox, which is part of the receiver's memory space. The only exception to this rule is large binaries (over 64 bytes), which are stored in a shared reference-counted binary heap and accessed through process-local references. Even in this case, the references are read-only, and the underlying binary data is immutable, preserving the isolation guarantee.

## Per-Process Heap Architecture

| Component | Behavior | Isolation Guarantee |
|-----------|----------|-------------------|
| **Young Heap** | Stores recently allocated data, collected frequently | Process-private; GC affects only this process |
| **Old Heap** | Stores data surviving multiple GC cycles | Process-private; never shared across processes |
| **Stack** | Function call frames and local variables | Process-private; separate from all other stacks |
| **Mailbox** | Incoming messages queued for processing | Process-private; writers copy data in |
| **Process Dictionary** | Mutable key-value store per process | Process-private; no external access |
| **Binary Heap** | Shared for large binaries (>64 bytes) | Reference-counted, immutable data; read-only access |

The per-process heap architecture means that BEAM processes can be garbage-collected, suspended, resumed, killed, and restarted independently. The VM scheduler treats each process as an independent unit, pre-empting it after a fixed number of reductions (function calls) to ensure fair scheduling across all processes.

## Failure Containment and Crash Isolation

The most consequential property of process isolation is failure containment. When a process encounters an unrecoverable error -- a pattern match failure, an arithmetic overflow, a timeout -- it terminates. The BEAM reclaims all of the terminated process's memory, closes any ports it owned, and sends exit signals to linked processes. Critically, no other process's heap is corrupted, no shared state is left in an inconsistent condition, and the rest of the system continues operating without interruption.

This behavior enables the construction of supervision trees where a [supervisor](/glossary/supervisor/) process monitors its children and restarts them upon failure. The supervisor itself is isolated from its children -- if a child crashes, the supervisor's state remains intact and its restart logic executes cleanly:

```elixir
# A supervisor that can safely restart children because isolation
# guarantees the supervisor's own state is never corrupted by child failures
defmodule AgentSupervisor do
  use Supervisor

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_opts) do
    children = [
      {DynamicSupervisor, name: AgentDynSup, strategy: :one_for_one}
    ]

    # max_restarts and max_seconds define the tolerance window
    # If children crash faster than this, the supervisor itself stops
    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

## Copy Semantics and Message Passing

Data exchange between isolated processes occurs exclusively through [message passing](/glossary/message-passing/), which enforces copy semantics. This design choice has several important implications for system architecture.

```elixir
# Data is COPIED from sender to receiver -- no shared references
defmodule Sensor do
  def report(collector_pid, reading) do
    # The 'reading' map is deep-copied into the collector's mailbox
    # Subsequent mutations to the sender's data (impossible in Elixir
    # due to immutability, but conceptually) cannot affect the receiver
    send(collector_pid, {:sensor_reading, reading})
  end
end

defmodule Collector do
  use GenServer

  def handle_info({:sensor_reading, reading}, state) do
    # 'reading' exists entirely on this process's heap
    # No other process can modify or invalidate it
    {:noreply, Map.update(state, :readings, [reading], &[reading | &1])}
  end
end
```

| Aspect | Copy Semantics | Shared Memory (other languages) |
|--------|---------------|--------------------------------|
| **Data Race Risk** | Impossible | Requires locks/synchronization |
| **Memory Overhead** | Higher (copies) | Lower (references) |
| **Reasoning Complexity** | Simple (local only) | Complex (global state) |
| **Failure Propagation** | Contained | Potential corruption |
| **GC Coordination** | None needed | Stop-the-world required |

## Context in Prismatic

Process isolation enables the Prismatic Platform's agent architecture to run 400+ autonomous [agents](/glossary/agent/) concurrently without fear of cascading failures. Each agent runtime is a BEAM process with its own heap -- if an agent encounters an unrecoverable error during OSINT data processing, security scanning, or quality analysis, its supervisor restarts it while all other agents continue operating uninterrupted.

The platform leverages process isolation at multiple architectural layers:

- **Agent Execution**: Each of the 434 AIAD agents runs as an isolated process. An agent performing expensive computation or encountering malformed input data cannot affect other agents.
- **Storage Adapters**: ETS, Ecto, Meilisearch, and KuzuDB adapters each operate in isolated processes. A database timeout in one adapter does not block or crash another.
- **LiveView Sessions**: Each user's [LiveView](/glossary/liveview/) connection is an isolated process. One user's session crash does not affect other users.
- **Quality Gates**: Quality gate checks run in isolated processes, ensuring that a Dialyzer analysis timeout does not block Credo or compilation checks.
- **Broadway Pipelines**: [Broadway](/glossary/broadway/) data processing stages run in isolated processes, enabling backpressure and failure recovery at the individual message level.

## Comparison with Other Isolation Models

| Model | Isolation Unit | Memory | Failure Boundary | Communication |
|-------|---------------|--------|-------------------|---------------|
| **BEAM Processes** | Lightweight process (~2KB) | Per-process heap | Process terminates; others unaffected | Message passing (copy) |
| **OS Threads** | Kernel thread | Shared heap | Segfault crashes entire process | Shared memory + locks |
| **OS Processes** | Heavy process (~MB) | Separate address space | Process terminates independently | IPC (pipes, sockets, shared memory) |
| **Java Threads** | JVM thread | Shared JVM heap | Uncaught exception may destabilize JVM | Shared objects + synchronization |
| **Go Goroutines** | Lightweight coroutine | Shared heap | Panic crashes entire program (without recover) | Channels (reference passing) |
| **Docker Containers** | Container | Namespace-isolated | Container restarts independently | Network (HTTP, gRPC) |

The BEAM's process isolation occupies a unique position: it provides the strong isolation guarantees of OS processes with the lightweight performance characteristics of threads or goroutines. This combination is what makes it possible to run millions of processes on a single BEAM instance -- each fully isolated, each independently garbage-collected, each independently restartable.

## Performance Characteristics

Process isolation introduces measurable overhead from data copying, but the BEAM optimizes this through several mechanisms:

| Optimization | Description |
|-------------|-------------|
| **Refc Binaries** | Binaries >64 bytes stored in shared heap with reference counting |
| **Sub-binaries** | Binary slices share underlying data without copying |
| **Hibernation** | Idle processes can release heap memory via `:hibernate` |
| **Heap Fragments** | Messages can be allocated in fragments to avoid premature GC |
| **Process Spawn Time** | ~3 microseconds on modern hardware for a new process |
| **Message Latency** | Sub-microsecond for small messages on same node |

For the Prismatic Platform's workloads -- agent coordination, security scanning, quality analysis -- the overhead of copy semantics is negligible compared to the I/O-bound nature of the actual operations. The platform routinely maintains 400+ concurrent agent processes with per-process memory consumption in the low kilobyte range for idle agents and low megabyte range for active processing.

## Anti-Patterns and Pitfalls

Even with strong process isolation, certain patterns can undermine system stability:

| Anti-Pattern | Problem | Mitigation |
|-------------|---------|-----------|
| **Mailbox Overflow** | Sending faster than receiving fills receiver's mailbox | Implement [backpressure](/glossary/backpressure/); monitor mailbox size |
| **Large Message Copies** | Sending multi-MB structures between processes | Use ETS for shared read access; pass references |
| **Process Dictionary Abuse** | Treating process dictionary as global state | Use GenServer state or ETS instead |
| **Too Few Processes** | Putting everything in one process defeats isolation | Follow "one process per concurrent activity" |
| **Link Storms** | Excessive process linking causes cascade exits | Use monitors instead of links where appropriate |

## Related Terms

- [BEAM](/glossary/beam/) - Virtual machine providing the process isolation runtime
- [Fault Tolerance](/glossary/fault-tolerance/) - System property enabled by process isolation
- [Let It Crash](/glossary/let-it-crash/) - Design philosophy that depends on isolation guarantees
- [Supervisor](/glossary/supervisor/) - OTP behavior for restarting isolated processes after failure
- [Message Passing](/glossary/message-passing/) - Communication mechanism between isolated processes
- [Immutability](/glossary/immutability/) - Data property that reinforces isolation semantics
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) - Runtime process management leveraging isolation
- [Circuit Breaker](/glossary/circuit-breaker/) - Pattern complementing isolation with failure detection
- [Cluster](/glossary/cluster/) - Isolation extends transparently across distributed nodes
- [Broadway](/glossary/broadway/) - Data pipeline leveraging per-stage process isolation

## See Also

- [Architecture](/architecture/) - Platform architecture built on process isolation
- [Agents](/agents/) - Agent system leveraging per-process isolation
- [Technologies](/technologies/) - BEAM runtime and OTP framework

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)