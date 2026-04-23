+++
title = "BEAM VM"
weight = 3
[extra]
category = "language"
description = "The Bogdan/Bjorn's Erlang Abstract Machine - virtual machine powering Elixir and Erlang with lightweight process concurrency"
url = "https://www.erlang.org/blog/a-brief-beam-primer/"
version = "OTP 27"
icon = "beam"
color = "red"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1200
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["BEAM", "BogdanBjorns", "Erlang", "Abstract", "Machine", "Elixir", "technologies", "language", "Prismatic Platform", "The BEAM"]
tags = ["technologies", "language", "beam-vm", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "BEAM VM - Prismatic Platform"
+++

## Overview

The BEAM (Bogdan/Bjorn's Erlang Abstract Machine) is the virtual machine that executes both Erlang and [Elixir](@/technologies/elixir.md) code. It is the critical infrastructure layer that gives the Prismatic Platform its exceptional concurrency, fault tolerance, and real-time capabilities. Unlike the JVM or V8, the BEAM was purpose-built for massive concurrency with soft real-time guarantees, originally designed at Ericsson for telecommunications systems that demanded five-nines (99.999%) availability.

The BEAM implements a preemptive scheduler that allocates CPU time fairly across all processes using reduction counting. Each BEAM process is extremely lightweight (~2KB initial heap) and fully isolated -- a crashing process cannot corrupt another process's memory. This isolation model is fundamental to the Prismatic Platform's architecture where 404+ agents operate independently, each as a supervised BEAM process that can fail and restart without affecting the rest of the system. The platform routinely runs tens of thousands of concurrent processes handling agent operations, web requests, background jobs, and real-time subscriptions simultaneously.

The BEAM's garbage collection operates per-process, meaning GC pauses affect only individual processes rather than the entire system. This property is critical for the platform's real-time intelligence processing pipelines where latency spikes are unacceptable. While a JVM application might experience stop-the-world GC pauses affecting all threads, a BEAM application's GC activity is distributed across its process population, with each process independently collecting its own heap. The result is predictable, low-latency behavior even under heavy load.

## Key Features

The BEAM provides a set of runtime capabilities that are unmatched by conventional virtual machines for building concurrent, fault-tolerant systems.

- **Per-Process GC**: Garbage collection isolated to individual processes, no global stop-the-world pauses affecting system latency
- **Preemptive Scheduling**: Reduction-based fair scheduling across all processes, preventing any single process from monopolizing CPU
- **SMP Support**: Symmetric multi-processing with one scheduler per CPU core, automatically distributing work across available hardware
- **Process Isolation**: Complete memory isolation between processes -- a crash in one process cannot corrupt another's state
- **Distribution Protocol**: Native clustering with transparent inter-node communication for horizontal scaling
- **JIT Compilation**: Just-in-time compilation (OTP 24+) for improved performance without sacrificing startup time
- **NIFs**: Native Implemented Functions for performance-critical operations with controlled integration points
- **Hot Code Loading**: Replace running code without stopping the system, enabling zero-downtime deployments
- **Port System**: Safe integration with external programs through OS-level process isolation
- **Observer**: Built-in runtime introspection tools for monitoring process counts, memory usage, and message queues

| Capability | BEAM | JVM | V8 (Node.js) | Go Runtime |
|------------|------|-----|---------------|------------|
| Process model | Lightweight actors (~2KB) | OS threads (~1MB) | Event loop (single) | Goroutines (~8KB) |
| Scheduling | Preemptive (reduction-based) | Preemptive (OS) | Cooperative | Cooperative |
| GC strategy | Per-process | Global (G1/ZGC) | Generational global | Concurrent global |
| Process isolation | Complete memory isolation | Shared memory | Shared memory | Shared memory |
| Distribution | Built-in clustering | External (Akka, etc.) | External | External |
| Hot code loading | Native | Limited (classloading) | None | None |
| Fault tolerance | Supervision trees | Try/catch | Try/catch | Panic/recover |

## Platform Integration

The BEAM's process model underpins every Prismatic agent and service. The platform leverages BEAM capabilities extensively for agent orchestration, real-time event processing, and fault-tolerant operation.

```elixir
defmodule PrismaticAgents.ProcessMetrics do
  @moduledoc """
  BEAM runtime metrics collection for platform monitoring.
  Demonstrates the introspection capabilities of the BEAM VM.
  """

  @spec platform_metrics() :: map()
  def platform_metrics do
    %{
      total_processes: :erlang.system_info(:process_count),
      process_limit: :erlang.system_info(:process_limit),
      schedulers: :erlang.system_info(:schedulers_online),
      memory_total: :erlang.memory(:total),
      memory_processes: :erlang.memory(:processes),
      memory_ets: :erlang.memory(:ets),
      memory_binary: :erlang.memory(:binary),
      run_queue: :erlang.statistics(:run_queue),
      reductions: elem(:erlang.statistics(:reductions), 0),
      atom_count: :erlang.system_info(:atom_count),
      port_count: :erlang.system_info(:port_count)
    }
  end

  @spec process_info_summary(pid()) :: map()
  def process_info_summary(pid) do
    info = Process.info(pid, [:memory, :message_queue_len, :reductions, :status])
    Map.new(info)
  end
end
```

The BEAM's scheduler is the reason the Prismatic Platform can handle thousands of concurrent WebSocket connections for [Phoenix LiveView](@/technologies/phoenix-liveview.md) dashboards while simultaneously running agent computations, database queries, and background processing -- all without explicit thread pool configuration or async/await boilerplate.

## Architecture

The BEAM's internal architecture is built around a set of cooperating schedulers, each running on its own OS thread, with a shared process table and distribution layer for clustering.

| Component | Function | Platform Impact |
|-----------|----------|-----------------|
| Schedulers | One per CPU core, preemptive execution | Automatic parallelism for all 90 apps |
| Process Table | Global registry of all BEAM processes | Agent tracking, service discovery |
| Run Queues | Per-scheduler work queues | Fair distribution of agent workload |
| Distribution | Inter-node communication protocol | Cluster support for horizontal scaling |
| Code Server | Module loading and versioning | Hot code deployment, version management |
| [ETS](@/technologies/ets.md) | Shared in-memory term storage | Agent registries, caches, metrics |
| Port Drivers | External program integration | NIF bindings, OS command execution |

The scheduler architecture ensures that no single agent or request can starve others. Each BEAM process receives a budget of 4,000 reductions (roughly equivalent to 4,000 function calls) before being preempted, guaranteeing fair scheduling even when some processes are CPU-intensive. This is fundamentally different from Node.js's cooperative event loop or Go's goroutine scheduling, where a computationally expensive task can block others.

```
BEAM Runtime Architecture:

CPU Core 0     CPU Core 1     CPU Core 2     CPU Core 3
    |              |              |              |
Scheduler 0   Scheduler 1   Scheduler 2   Scheduler 3
    |              |              |              |
Run Queue 0   Run Queue 1   Run Queue 2   Run Queue 3
    |              |              |              |
[P1][P2]...   [P5][P6]...   [P9][P10]..   [P13][P14]..
                                |
                          Migration logic
                      (work stealing between queues)
```

## Performance Characteristics

The BEAM is optimized for consistent latency and massive concurrency rather than raw throughput on single-threaded benchmarks. This trade-off is ideal for the Prismatic Platform's workload profile.

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| Process creation | ~3 microseconds | 300,000+ processes/second |
| Process memory (initial) | ~2KB | Heap grows as needed |
| Context switch | ~0.1 microseconds | 100x faster than OS threads |
| Message send (local) | ~0.3 microseconds | Including copy to target heap |
| Max processes | 1,000,000 (configured) | Platform limit in vm.args |
| GC pause (per process) | < 1ms typical | Only affects the individual process |
| Scheduler count | Matches CPU cores | Automatic SMP utilization |
| JIT compilation speedup | 10-30% over interpreted | OTP 24+ feature |

The platform configures the BEAM for its specific workload profile, increasing default limits and tuning scheduler behavior for the agent-heavy workload.

## Configuration

BEAM runtime parameters are configured through `vm.args` for release deployments and through environment configuration for development.

```elixir
# vm.args - BEAM VM configuration for Prismatic production
+P 1000000    # Max processes (default 262,144)
+Q 1000000    # Max ports (file handles, sockets)
+S 8:8        # Schedulers online : total
+stbt db      # Scheduler bind type (distribute, balance)
+sub true     # Scheduler utilization balancing
+Bi           # Break handler ignore (production)
+A 16         # Async thread pool size for NIF operations
+K true       # Enable kernel poll (epoll/kqueue)
+spp true     # Sub-process priority
```

```elixir
# Runtime BEAM tuning via application config
config :prismatic, :beam_config,
  process_limit: 1_000_000,
  port_limit: 1_000_000,
  scheduler_count: System.schedulers_online(),
  async_threads: 16
```

## Best Practices

The platform follows BEAM-specific operational practices that maximize the runtime's strengths and avoid common pitfalls.

- **Never block a scheduler** -- long-running NIF operations must yield back to the scheduler or use dirty schedulers to avoid disrupting the preemptive scheduling guarantee
- **Monitor process counts** -- unexpected process growth often indicates a resource leak; the platform tracks this via Telemetry
- **Use process isolation for fault domains** -- each agent runs in its own process so failures are contained and recoverable via supervision
- **Leverage per-process GC** -- design processes to have short-lived state when possible, enabling fast GC cycles
- **Configure process limits explicitly** -- the default 262,144 limit may be insufficient for large platforms; Prismatic sets 1,000,000
- **Enable kernel poll** -- the `+K true` flag enables epoll/kqueue for efficient I/O multiplexing on production systems
- **Profile with Observer** -- use `:observer.start()` during development to visualize process trees, message queues, and memory distribution
- **Use dirty schedulers for CPU-bound NIFs** -- prevents NIF operations from blocking normal schedulers and degrading system responsiveness

## Comparison

The BEAM was chosen as the Prismatic Platform's runtime because its design properties align precisely with the platform's requirements for concurrent agent operation, fault isolation, and real-time responsiveness.

| Requirement | BEAM Solution | Alternative (JVM/Go/Node) |
|-------------|---------------|---------------------------|
| 404+ concurrent agents | Lightweight processes (~2KB each) | Thread pools, goroutines, or event loop |
| Agent crash isolation | Per-process memory isolation | Shared memory requires manual guards |
| Real-time dashboards | Per-process GC, no global pauses | Stop-the-world GC causes latency spikes |
| Hot deployment | Native code loading | Requires restart or complex classloading |
| Cluster scaling | Built-in distribution protocol | External middleware (Kafka, gRPC, etc.) |
| Fair scheduling | Preemptive reduction counting | Cooperative scheduling risks starvation |

## Related Technologies

- [Elixir](@/technologies/elixir.md) - Primary language running on the BEAM, providing modern syntax and metaprogramming
- [Erlang/OTP](@/technologies/erlang-otp.md) - Runtime system, standard library, and OTP behaviours
- [ETS](@/technologies/ets.md) - BEAM's built-in in-memory term storage for high-speed data access
- [GenServer](@/technologies/genserver.md) - OTP process abstraction built on the BEAM's process model
- [Supervisor](@/technologies/supervisor.md) - Fault tolerance through BEAM process supervision trees

## Related Apps

- All 90 Prismatic Platform applications run on the BEAM virtual machine
- [prismatic_agents](@/apps/prismatic-agents.md) - 404+ agents running as supervised BEAM processes
- [prismatic_web](@/apps/prismatic-web.md) - Phoenix web server leveraging BEAM's concurrent connection handling
- [prismatic_safety](@/apps/prismatic-safety.md) - Quality monitoring processes using BEAM's Observer integration

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)