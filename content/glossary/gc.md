+++
title = "GC"
description = "BEAM garbage collection -- a per-process generational copying collector that reclaims unused memory without global pauses, enabling soft real-time guarantees for Elixir applications."
weight = 50

[extra]
category = "elixir"
tags = ["gc", "garbage-collection", "beam", "memory", "performance", "generational", "process", "heap", "young-generation", "old-generation"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "advanced"
audience = ["developers", "performance-engineers", "architects", "sre"]
related_terms = ["heap", "ets-memory", "process-isolation", "beam", "memory-safety", "fullsweep-after"]
key_concepts = ["per-process-gc", "generational-collection", "copying-collector", "young-heap", "old-heap", "fullsweep"]
platforms = ["beam", "erlang", "elixir"]
prerequisites = ["memory-management-basics", "beam-architecture", "process-model"]
use_cases = ["performance-tuning", "latency-optimization", "memory-management", "real-time-systems"]
complexity = "high"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1100
date_modified = "2026-02-23"
keywords = ["GC", "garbage collection", "BEAM", "Elixir", "glossary", "Prismatic Platform"]
quality_score = 82
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "GC - Prismatic Platform"
+++

## Definition and Overview

Garbage collection (GC) on the BEAM virtual machine is a per-process, generational, copying collector that automatically reclaims memory no longer reachable by a process. Unlike garbage collectors in the JVM, .NET, or Go -- which operate on shared heaps and cause global application pauses -- BEAM's GC is scoped to individual processes. When a process's garbage collector runs, only that process is paused; all other processes continue executing without interruption. This per-process isolation is the architectural foundation of BEAM's soft real-time guarantees.

The generational hypothesis (most objects die young) guides BEAM's GC strategy. Each process maintains two heap generations: a young generation (new heap) where recently allocated data lives, and an old generation (old heap) where data that has survived multiple collections is promoted. Minor collections scan only the young generation, which is fast because most data dies quickly. Major collections (full sweeps) scan both generations, reclaiming long-lived data that has become unreachable.

The per-process GC model has profound implications for application design. A process with a 2KB heap triggers microsecond GC pauses. A process accumulating megabytes of state triggers longer pauses that only affect that process. This means BEAM applications achieve consistent latency by distributing state across many small processes rather than concentrating it in a few large ones. Understanding GC behavior is essential for building Elixir applications that meet the Prismatic Platform's sub-250ms page load requirement.

## Technical Deep Dive

### GC Algorithm Phases

| Phase | Scope | Trigger | Duration |
|-------|-------|---------|----------|
| **Minor GC** | Young heap only | Young heap full | ~10-100 us |
| **Major GC** | Young + old heap | Old heap full or fullsweep_after reached | ~100 us - 10 ms |
| **Heap growth** | Neither | Current heap too small | Heap resized (doubles) |
| **Heap shrink** | Neither | Heap utilization < 25% after GC | Heap compacted |

### Generational Collection Flow

```
Allocation:
  New data -> Young Heap (new_heap)

Minor GC (when young heap full):
  1. Scan roots (stack, registers, mailbox)
  2. Copy live young data to new young heap
  3. Promote data surviving N minor GCs to old heap
  4. Reclaim old young heap entirely

Major GC (fullsweep, when old heap full):
  1. Scan all roots
  2. Copy all live data (young + old) to new single heap
  3. Re-split into young and old generations
  4. Reclaim all old heaps
```

### Key GC Parameters

| Parameter | Default | Effect | Tuning Guidance |
|-----------|---------|--------|----------------|
| `fullsweep_after` | 65535 | Minor GCs before forced fullsweep | Lower for memory-constrained; 0 for always fullsweep |
| `min_heap_size` | 233 words | Initial process heap size | Increase for processes that immediately allocate |
| `min_bin_vheap_size` | 46422 words | Virtual binary heap size | Increase for binary-heavy processes |
| `max_heap_size` | 0 (unlimited) | Kill process if exceeded | Set to prevent runaway memory |
| `message_queue_data` | `on_heap` | Where messages are stored | `off_heap` for mailbox-heavy processes |

### BEAM GC vs Other Runtimes

| Property | BEAM | JVM (G1GC) | Go | .NET |
|----------|------|-----------|-----|------|
| **Scope** | Per-process | Global heap | Global heap | Per-generation |
| **Pause visibility** | Single process | All threads | All goroutines | All threads |
| **Max pause (P99)** | ~1ms per process | 10-200ms | 0.5-5ms | 10-100ms |
| **Global pause** | Never | Yes (though concurrent) | Yes (STW phases) | Yes (compaction) |
| **Generational** | Yes (2 gen) | Yes (young/mixed/old) | No | Yes (3 gen) |
| **Compacting** | Yes (copying) | Yes | No (non-moving) | Yes |
| **Concurrent** | No (per-process stop) | Mostly concurrent | Mostly concurrent | Mostly concurrent |

## Architecture and Implementation

BEAM's GC architecture is inseparable from its process model. Each process is allocated an initial heap (typically 233 words, ~1.8KB on 64-bit) that grows dynamically as the process allocates data. The heap consists of contiguous memory regions for the young and old generations, plus a separate area for large binaries (the binary virtual heap).

When a process allocates data and the current heap is full, a minor GC is triggered. The collector traces from the process's root set (stack frames, registers, mailbox references) through all reachable data, copying live objects to a new heap area. Because BEAM data is immutable, there are no write barriers or remembered sets needed for generational promotion -- any pointer from old generation to young generation was established at allocation time and is tracked by the promotion count.

Binary data larger than 64 bytes is allocated on a shared binary heap and reference-counted. These off-heap binaries are not subject to generational collection; instead, their reference counts are decremented during GC, and the binary is freed when the count reaches zero. This is why binary data can sometimes accumulate in BEAM applications -- if a process holds a reference to a large binary but does not trigger GC, the binary remains allocated.

## Usage in Prismatic Platform

The Prismatic Platform configures GC parameters for different process profiles to optimize latency and memory usage.

```elixir
defmodule Prismatic.GC.Tuning do
  @moduledoc """
  GC tuning utilities for different process profiles.
  Configures BEAM garbage collection parameters to
  meet the platform's performance requirements.
  """

  @type profile :: :low_latency | :high_throughput | :memory_constrained | :long_lived

  @spec apply_profile(pid(), profile()) :: :ok
  def apply_profile(pid, :low_latency) do
    Process.flag(pid, :fullsweep_after, 10)
    Process.flag(pid, :min_heap_size, 1000)
    :ok
  end

  def apply_profile(pid, :high_throughput) do
    Process.flag(pid, :fullsweep_after, 65535)
    Process.flag(pid, :min_heap_size, 10_000)
    :ok
  end

  def apply_profile(pid, :memory_constrained) do
    Process.flag(pid, :fullsweep_after, 0)
    Process.flag(pid, :max_heap_size, %{size: 1_000_000, kill: true, error_logger: true})
    :ok
  end

  def apply_profile(pid, :long_lived) do
    Process.flag(pid, :fullsweep_after, 100)
    Process.flag(pid, :message_queue_data, :off_heap)
    :ok
  end

  @spec collect_gc_stats(pid()) :: map()
  def collect_gc_stats(pid) do
    {:garbage_collection, gc_info} = Process.info(pid, :garbage_collection)
    {:memory, memory} = Process.info(pid, :memory)
    {:message_queue_len, queue_len} = Process.info(pid, :message_queue_len)

    %{
      heap_size: Keyword.get(gc_info, :heap_size, 0),
      old_heap_size: Keyword.get(gc_info, :old_heap_size, 0),
      fullsweep_after: Keyword.get(gc_info, :fullsweep_after, 0),
      minor_gcs: Keyword.get(gc_info, :minor_gcs, 0),
      memory_bytes: memory,
      message_queue: queue_len
    }
  end
end
```

LiveView processes use the `:low_latency` profile to ensure consistent render times. Agent GenServer processes use `:long_lived` with off-heap message queues to avoid GC pressure from high message throughput. The OSINT tool execution processes use `:high_throughput` to minimize GC interruptions during data processing.

## Cross-References

- **Heap** -- Process memory allocation area
- [ETS Memory](@/glossary/ets-memory.md) -- Memory management outside GC scope
- [Process Isolation](@/glossary/process-isolation.md) -- Isolation enabling per-process GC
- [BEAM](@/glossary/beam.md) -- Virtual machine implementing the GC
- [Execution Time](@/glossary/execution-time.md) -- GC impact on operation timing
- **Livebooks**: `performance_monitoring/` notebooks include GC profiling tools
- **Academy**: Topics on BEAM internals cover GC mechanics

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
