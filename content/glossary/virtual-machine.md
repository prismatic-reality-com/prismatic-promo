+++
title = "Virtual Machine"
weight = 50
[extra]
tags = ["glossary", "virtual-machine", "beam", "erlang", "elixir", "jvm", "runtime", "concurrency", "fault-tolerance", "process-scheduling"]
description = "An abstraction layer that executes bytecode independently of the underlying hardware, providing portability, isolation, and managed runtime services. In Prismatic: the BEAM VM as the foundational runtime for all 115 umbrella applications, enabling lightweight process concurrency, preemptive scheduling, hot code loading, and fault-tolerant supervision trees."
category = "infrastructure"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Infrastructure & Runtime"
related_concepts = ["bytecode", "process scheduling", "garbage collection", "hot code loading", "preemptive scheduling", "reduction counting", "JIT compilation", "BEAM", "Erlang", "OTP"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 8
prerequisites = ["operating-systems", "concurrency", "process-model", "memory-management"]
learning_path = ["operating-systems", "concurrency-models", "beam-vm", "virtual-machine", "otp-design-principles", "fault-tolerance"]
interactive_demos = ["/labs/glossary/virtual-machine"]
code_examples = ["ProcessScheduler", "VMIntrospection", "MemoryAnalyzer", "SchedulerUtilization", "ProcessTopology"]
external_resources = ["https://www.erlang.org/doc/efficiency_guide/advanced.html", "https://blog.stenmans.org/theBeamBook/", "https://adoptingerlang.org/", "https://learnyousomeerlang.com/"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["process spawn throughput", "scheduler utilization balance", "memory allocation patterns", "garbage collection impact", "hot code reload consistency"]
keywords = ["virtual machine", "BEAM", "Erlang VM", "JVM", "process scheduling", "preemptive scheduling", "hot code loading", "garbage collection", "fault tolerance", "bytecode"]
related_terms = ["beam-vm", "beam", "supervision-tree", "supervisor", "actor-model", "concurrency", "fault-tolerance", "process-isolation", "otp", "erlang", "elixir", "backpressure"]
learning_outcomes = ["Understand how the BEAM VM achieves soft real-time guarantees through preemptive scheduling", "Compare process-level and thread-level concurrency models", "Analyze BEAM scheduler utilization and process memory with observer tools", "Explain how per-process garbage collection eliminates stop-the-world pauses", "Evaluate trade-offs between BEAM, JVM, and V8 for different workload types"]
word_count = 1719
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Virtual Machine - Prismatic Platform"
+++

## Definition

A **Virtual Machine** (VM) is a software abstraction that emulates a computer system, providing an execution environment for programs that is independent of the underlying physical hardware. Virtual machines come in two fundamental categories: *system virtual machines* (which emulate entire hardware platforms, enabling multiple operating systems to share physical resources) and *process virtual machines* (which provide a runtime environment for executing programs compiled to an intermediate bytecode format). The Prismatic Platform runs entirely on the [BEAM](/glossary/beam/) virtual machine -- the Erlang Runtime System (ERTS) -- which is a process virtual machine purpose-built for concurrent, distributed, fault-tolerant applications. The BEAM's architectural decisions (lightweight processes, preemptive scheduling via reduction counting, per-process garbage collection, hot code loading) directly enable the platform's ability to run 115 umbrella [applications](/glossary/application/) concurrently with soft real-time guarantees and zero-downtime deployments.

## Overview

Virtual machines have been a foundational concept in computing since the 1960s, when IBM's CP/CMS (1967) introduced the idea of running multiple virtual copies of an operating system on a single mainframe. The concept evolved along two distinct paths that continue to shape modern software:

**System Virtual Machines** (Type 1 and Type 2 hypervisors) partition physical hardware into multiple isolated environments, each running its own operating system. VMware, KVM, and Xen exemplify this approach. These VMs provide strong isolation guarantees at the cost of significant overhead -- each VM carries the weight of a complete OS kernel, device drivers, and system services.

**Process Virtual Machines** provide a managed runtime for individual programs, abstracting away hardware differences and providing services like garbage collection, type checking, and security sandboxing. The Java Virtual Machine (JVM, 1995), Common Language Runtime (CLR, 2002), V8 (2008), and BEAM (1992) are the most significant examples.

The BEAM VM deserves special attention because its design philosophy diverges radically from other process VMs:

| Feature | BEAM | JVM | V8 |
|---------|------|-----|----|
| Concurrency unit | Lightweight process (~2KB) | OS thread (~512KB-1MB) | Event loop + workers |
| Scheduling | Preemptive (reduction counting) | Cooperative/OS-scheduled | Cooperative (event loop) |
| Garbage collection | Per-process (no global pauses) | Global (G1GC, ZGC) | Generational (global) |
| Hot code loading | Built-in (two versions live) | Limited (JRebel, etc.) | Not supported |
| Fault isolation | Process crash = process restart | Thread crash = potential JVM crash | Uncaught exception = crash |
| Distribution | Native (Distributed Erlang) | External (Akka, gRPC) | External (cluster modules) |
| Max concurrent units | Millions of processes | Thousands of threads | Single-threaded + workers |

The BEAM was designed by Joe Armstrong, Robert Virding, and Mike Williams at Ericsson in the late 1980s to solve the specific challenges of telecommunications switching systems: extreme concurrency (millions of simultaneous calls), fault tolerance (five nines uptime), and hot upgradability (no downtime for updates). These requirements shaped every aspect of the VM's design.

## Historical Context

### The Ericsson Origins (1986-1998)

The BEAM's history begins with Ericsson's need for a programming language suitable for telecommunications systems. Joe Armstrong's PhD thesis "Making Reliable Distributed Systems in the Presence of Software Errors" (2003, but based on work from the late 1980s) articulated the core philosophy: isolate failures, let processes crash, and recover through supervision.

The original Erlang interpreter (JAM -- Joe's Abstract Machine) was too slow for production telecommunications. The BEAM (Bogdan's Erlang Abstract Machine, named after Bogumil "Bogdan" Hausman who created it) replaced the interpreter with a bytecode compiler and register-based execution engine that achieved 20x performance improvement.

Ericsson's AXD301 ATM switch, powered by Erlang/BEAM, famously achieved nine nines of reliability (99.9999999% uptime, or about 31 milliseconds of downtime per year) -- a benchmark that demonstrated the BEAM's fault-tolerance architecture in production.

### Open Source and Elixir (1998-Present)

Ericsson open-sourced Erlang/OTP in 1998. The language found adoption in messaging systems (WhatsApp, handling 2 million connections per server), databases (CouchDB, Riak), and financial systems. Jose Valim created Elixir in 2012, adding modern syntax, metaprogramming, and tooling while leveraging the same BEAM VM. This combination of the BEAM's battle-tested runtime with Elixir's developer ergonomics is what the Prismatic Platform builds upon.

## Technical Details

### BEAM Architecture

The BEAM VM consists of several interconnected subsystems:

```elixir
defmodule Prismatic.VM.Introspection do
  @moduledoc """
  Provides introspection into the BEAM VM runtime state,
  including scheduler utilization, memory allocation,
  process statistics, and garbage collection metrics.
  Used by platform monitoring to ensure optimal VM health.
  """

  @type vm_stats :: %{
    schedulers: scheduler_stats(),
    memory: memory_stats(),
    processes: process_stats(),
    io: io_stats(),
    gc: gc_stats()
  }
  @type scheduler_stats :: %{
    online: pos_integer(),
    available: pos_integer(),
    utilization: [float()],
    run_queue_lengths: [non_neg_integer()]
  }
  @type memory_stats :: %{
    total: non_neg_integer(),
    processes: non_neg_integer(),
    ets: non_neg_integer(),
    binary: non_neg_integer(),
    atom: non_neg_integer(),
    code: non_neg_integer()
  }
  @type process_stats :: %{
    count: non_neg_integer(),
    limit: non_neg_integer(),
    run_queue: non_neg_integer(),
    message_queue_total: non_neg_integer()
  }
  @type io_stats :: %{input: non_neg_integer(), output: non_neg_integer()}
  @type gc_stats :: %{
    number_of_gcs: non_neg_integer(),
    words_reclaimed: non_neg_integer()
  }

  @spec collect_stats() :: vm_stats()
  def collect_stats do
    %{
      schedulers: collect_scheduler_stats(),
      memory: collect_memory_stats(),
      processes: collect_process_stats(),
      io: collect_io_stats(),
      gc: collect_gc_stats()
    }
  end

  @spec collect_scheduler_stats() :: scheduler_stats()
  defp collect_scheduler_stats do
    online = :erlang.system_info(:schedulers_online)
    available = :erlang.system_info(:schedulers)

    utilization =
      :scheduler.utilization(1)
      |> Enum.map(fn {_id, percent, _} -> percent end)

    run_queues =
      for i <- 1..online do
        :erlang.statistics({:run_queue_lengths, i})
      end

    %{
      online: online,
      available: available,
      utilization: utilization,
      run_queue_lengths: run_queues
    }
  end

  @spec collect_memory_stats() :: memory_stats()
  defp collect_memory_stats do
    mem = :erlang.memory()

    %{
      total: Keyword.get(mem, :total),
      processes: Keyword.get(mem, :processes),
      ets: Keyword.get(mem, :ets),
      binary: Keyword.get(mem, :binary),
      atom: Keyword.get(mem, :atom),
      code: Keyword.get(mem, :code)
    }
  end

  @spec collect_process_stats() :: process_stats()
  defp collect_process_stats do
    %{
      count: :erlang.system_info(:process_count),
      limit: :erlang.system_info(:process_limit),
      run_queue: :erlang.statistics(:run_queue),
      message_queue_total: total_message_queue_length()
    }
  end

  @spec total_message_queue_length() :: non_neg_integer()
  defp total_message_queue_length do
    Process.list()
    |> Enum.reduce(0, fn pid, acc ->
      case Process.info(pid, :message_queue_len) do
        {:message_queue_len, len} -> acc + len
        nil -> acc
      end
    end)
  end
end
```

### Preemptive Scheduling via Reductions

The BEAM's most distinctive feature is its preemptive scheduler based on reduction counting. Unlike cooperative scheduling (where tasks voluntarily yield control) or OS-level preemption (based on time slices), the BEAM counts "reductions" -- abstract units of work roughly corresponding to function calls:

```elixir
defmodule Prismatic.VM.SchedulerAnalysis do
  @moduledoc """
  Analyzes BEAM scheduler behavior including reduction counting,
  process prioritization, and run queue management. Essential for
  understanding the platform's soft real-time guarantees.

  The BEAM scheduler assigns each process a reduction budget
  (default: 4000 reductions per time slice). When a process
  exhausts its budget, it is preempted regardless of what it
  is doing, ensuring fair scheduling across millions of processes.
  """

  @type process_schedule_info :: %{
    pid: pid(),
    reductions: non_neg_integer(),
    priority: :low | :normal | :high | :max,
    status: :running | :waiting | :runnable | :suspended,
    message_queue_len: non_neg_integer(),
    current_function: {module(), atom(), arity()},
    heap_size: non_neg_integer()
  }

  @default_reduction_budget 4000

  @spec analyze_process(pid()) :: {:ok, process_schedule_info()} | {:error, :not_found}
  def analyze_process(pid) do
    case Process.info(pid, [
           :reductions,
           :priority,
           :status,
           :message_queue_len,
           :current_function,
           :heap_size
         ]) do
      nil ->
        {:error, :not_found}

      info ->
        {:ok,
         %{
           pid: pid,
           reductions: Keyword.get(info, :reductions),
           priority: Keyword.get(info, :priority),
           status: Keyword.get(info, :status),
           message_queue_len: Keyword.get(info, :message_queue_len),
           current_function: Keyword.get(info, :current_function),
           heap_size: Keyword.get(info, :heap_size)
         }}
    end
  end

  @spec find_hot_processes(non_neg_integer()) :: [process_schedule_info()]
  def find_hot_processes(top_n \\ 20) do
    Process.list()
    |> Enum.map(&analyze_process/1)
    |> Enum.filter(&match?({:ok, _}, &1))
    |> Enum.map(fn {:ok, info} -> info end)
    |> Enum.sort_by(& &1.reductions, :desc)
    |> Enum.take(top_n)
  end

  @doc """
  Calculates scheduler utilization balance. A well-balanced
  system has all schedulers within 10% of each other.
  Imbalance indicates hot processes or poor work distribution.
  """
  @spec scheduler_balance() :: %{balanced: boolean(), variance: float(), utilizations: [float()]}
  def scheduler_balance do
    utilizations =
      :scheduler.utilization(1)
      |> Enum.map(fn {_id, percent, _} -> percent end)

    mean = Enum.sum(utilizations) / length(utilizations)

    variance =
      utilizations
      |> Enum.map(fn u -> (u - mean) * (u - mean) end)
      |> Enum.sum()
      |> Kernel./(length(utilizations))

    %{
      balanced: variance < 0.01,
      variance: Float.round(variance, 4),
      utilizations: utilizations
    }
  end
end
```

### Per-Process Garbage Collection

One of the BEAM's most important architectural decisions is per-process garbage collection. Each Erlang/Elixir process has its own private heap and its own garbage collector. This means:

- **No stop-the-world pauses** -- When one process's GC runs, other processes continue executing uninterrupted
- **Predictable latency** -- GC pauses are proportional to individual process heap sizes, not total system memory
- **Natural memory reclamation** -- When a process terminates, its entire heap is freed instantly (no GC needed)
- **Soft real-time guarantees** -- Latency-sensitive processes can be designed with small heaps for minimal GC impact

This contrasts sharply with the JVM, where G1GC or ZGC must manage a shared heap that can reach tens of gigabytes, and even modern concurrent collectors introduce occasional pause-time spikes.

### Hot Code Loading

The BEAM uniquely supports hot code loading -- replacing module code in a running system without stopping processes. The VM maintains up to two versions of each module simultaneously (current and old), allowing processes executing old code to finish while new processes use the updated version:

```elixir
defmodule Prismatic.VM.CodeManager do
  @moduledoc """
  Manages hot code loading for zero-downtime deployments.
  The BEAM allows two versions of a module to exist simultaneously:
  - 'current' version (used for new calls)
  - 'old' version (used by processes still executing it)

  When a third version is loaded, processes stuck on the 'old'
  version are killed, the 'old' is purged, 'current' becomes
  'old', and the new code becomes 'current'.
  """

  @spec module_versions(module()) :: %{current: boolean(), old: boolean()}
  def module_versions(module) do
    %{
      current: :code.is_loaded(module) != false,
      old: :code.is_loaded(module) != false and :erlang.check_old_code(module)
    }
  end

  @spec reload_module(module()) :: {:ok, module()} | {:error, term()}
  def reload_module(module) do
    case :code.purge(module) do
      true -> do_reload(module)
      false -> do_reload(module)
    end
  end

  @spec do_reload(module()) :: {:ok, module()} | {:error, term()}
  defp do_reload(module) do
    case :code.load_file(module) do
      {:module, ^module} -> {:ok, module}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

## VM Comparison: BEAM vs. JVM vs. V8

### Concurrency Models

The fundamental difference between these VMs lies in their concurrency models:

**BEAM: Actor Model with Lightweight Processes.** Each concurrent entity is a process with its own memory, mailbox, and garbage collector. Processes communicate exclusively through message passing. The VM can handle millions of processes on a single node. This model maps naturally to the Prismatic Platform's architecture where each [agent](/glossary/agent/), [supervisor](/glossary/supervisor/), and service is its own process.

**JVM: Shared Memory with Threads.** Java threads are typically mapped 1:1 to OS threads, sharing a common heap. Coordination requires locks, semaphores, or concurrent data structures. Project Loom (virtual threads in Java 21+) brings lightweight threads to the JVM, but they still share memory and require synchronization. Frameworks like Akka implement actor semantics on top of the JVM.

**V8: Single-Threaded Event Loop.** JavaScript runs in a single thread with an event loop for asynchronous operations. Worker threads exist but communicate through structured cloning (copying), not shared memory. This model excels for I/O-bound web servers but struggles with CPU-bound workloads.

### Fault Tolerance

**BEAM:** Process crashes are isolated by design. A crashing process cannot corrupt other processes' memory. [Supervision trees](/glossary/supervision-tree/) automatically restart failed processes according to configurable strategies (one-for-one, one-for-all, rest-for-one). The "let it crash" philosophy embraces failure as a normal condition rather than an exceptional one.

**JVM:** Thread crashes can potentially corrupt shared state. While exception handling is mature, an OutOfMemoryError or segfault in native code can bring down the entire VM. Defensive programming (try/catch/finally) is the primary failure handling strategy.

**V8:** An uncaught exception terminates the process. Cluster modules can restart worker processes, but there is no built-in supervision hierarchy comparable to OTP.

## Platform Integration

The BEAM VM is the invisible foundation of every Prismatic Platform operation:

- **530 AIAD agents** run as BEAM processes under [supervision trees](/glossary/supervision-tree/)
- **115 umbrella applications** share the same BEAM instance via the OTP application framework
- **ETS tables** provide in-memory storage backed by the VM's native term storage
- **[Telemetry](/glossary/telemetry/) events** flow through BEAM message passing at microsecond latency
- **Hot code loading** enables zero-downtime deployments on Fly.io
- **Distribution protocols** connect multiple BEAM nodes for horizontal scaling

The platform's performance characteristics -- sub-100ms page loads, <50ms LiveView event handling, <10ms health checks -- are directly enabled by the BEAM's preemptive scheduler and lightweight process model.

## Cross-References

- [BEAM](/glossary/beam/) -- The specific virtual machine (Bogdan's Erlang Abstract Machine) underlying the platform
- [BEAM VM](/glossary/beam-vm/) -- Extended reference to the BEAM runtime system
- [Supervision Tree](/glossary/supervision-tree/) -- The hierarchical process management structure enabled by the VM
- [Supervisor](/glossary/supervisor/) -- OTP supervisor processes that manage child process lifecycles
- [Actor Model](/glossary/actor-model/) -- The concurrency model implemented by BEAM processes
- [Backpressure](/glossary/backpressure/) -- Flow control mechanisms built on VM process mailboxes
- [Concurrency](/glossary/concurrency/) -- The VM's approach to simultaneous execution
- [Fault Tolerance](/glossary/fault-tolerance/) -- Reliability guarantees provided by process isolation
- [Telemetry](/glossary/telemetry/) -- Observability infrastructure running within the VM
- [Application](/glossary/application/) -- OTP application framework managed by the VM

## Best Practices

1. **Understand your scheduler count.** Set `--erl "+S N:N"` appropriately for your hardware. One scheduler per CPU core is the default and usually optimal. Monitor utilization with `:scheduler.utilization/1`.

2. **Keep process heaps small.** Design processes to hold minimal state. Large heaps increase GC pause times for that process. If a process must handle large data, use binary references (which live on a shared binary heap) or ETS tables.

3. **Monitor run queue lengths.** Non-zero run queue lengths indicate that processes are waiting for scheduler time. Persistent run queues signal either too many processes or CPU-bound work blocking the scheduler.

4. **Use process priorities sparingly.** The BEAM supports four priority levels (low, normal, high, max). Reserve high/max for latency-critical processes like health checks. Overusing high priority defeats the purpose.

5. **Leverage hot code loading for deployments.** Structure modules to be hot-reloadable by keeping module-level state in GenServer processes rather than module attributes evaluated at compile time.

6. **Profile before optimizing.** Use `:fprof`, `:eprof`, or Flame graphs to identify actual bottlenecks. The BEAM's performance characteristics are often counterintuitive -- what seems expensive may be fast, and vice versa.

## Common Pitfalls

- **Treating processes like threads.** BEAM processes are not threads. They do not share memory. Trying to use shared mutable state patterns (ETS as a substitute for shared memory) defeats the purpose of the actor model.
- **Creating too few processes.** Under-utilizing processes leads to Java-style monolithic services. Each stateful entity, connection, and workflow should be its own process.
- **Ignoring message queue buildup.** A process that receives messages faster than it processes them will accumulate an unbounded message queue, eventually consuming all available memory.
- **Blocking the scheduler.** Long-running NIFs (Native Implemented Functions) or CPU-bound computations without yielding block the scheduler thread, affecting all processes on that scheduler.
- **Assuming JVM mental models.** Developers from JVM backgrounds often reach for synchronized access patterns, thread pools, and shared caches. These patterns are not needed and are counterproductive on the BEAM.

## Further Reading

- Armstrong, Joe. "Making Reliable Distributed Systems in the Presence of Software Errors" (PhD Thesis, 2003) -- The foundational work on Erlang's design philosophy
- Stenman, Erik. "The BEAM Book" -- Deep technical reference for BEAM internals
- Cesarini, Thompson. "Erlang Programming" (O'Reilly) -- Comprehensive guide to Erlang and the BEAM
- Valim, Jose. "Elixir in Action" -- Modern Elixir development on the BEAM

---

*Built with precision. Powered by the BEAM.*

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
