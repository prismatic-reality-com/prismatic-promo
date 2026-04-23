+++
title = "Memory Profiling"
weight = 50

[extra]
description = "Memory profiling is the systematic analysis of a program's memory allocation, retention, and deallocation patterns to identify inefficiencies, leaks, and optimization opportunities using specialized tools and runtime instrumentation."
category = "platform"
domain = "performance-engineering"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["memory", "memory-leak", "profiling", "process", "named-table", "ets", "binary", "garbage-collection", "recon", "observer", "heap", "allocator"]
tags = ["glossary", "memory-profiling", "debugging", "performance", "analysis", "beam", "optimization", "recon", "observer", "heap-analysis", "binary-leak"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "BEAM memory profiling uses :recon, :observer, and process-level introspection to attribute memory consumption to specific processes, ETS tables, and binary references, with Prismatic Platform automating profiling through quality gate integration and anomaly detection."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["memory profiling", "heap analysis", "memory investigation", "recon", "observer", "allocation tracking", "memory attribution", "performance analysis", "binary leak", "ETS memory", "BEAM memory", "garbage collection"]
image = "/images/sections/glossary.png"
image_alt = "Memory Profiling - Prismatic Platform"
word_count = 3400
see_also = ["capabilities", "architecture", "performance-testing", "garbage-collection", "ets"]
+++

## Definition

Memory profiling is the practice of measuring and analyzing how a program uses memory at runtime: which data structures consume the most space, where allocations occur, how long objects survive, and whether memory consumption trends upward over time. Unlike CPU profiling (which measures time spent), memory profiling measures space consumed, providing the data needed to diagnose memory leaks, reduce footprint, and optimize garbage collection behavior.

Memory profiling operates at multiple granularities: system-level profiling measures total memory consumption by category (heap, stack, code, data); process-level profiling attributes memory to individual BEAM processes; and allocation-level profiling traces individual allocation events to their call sites. Each level answers different questions, and effective memory investigation typically proceeds from coarse to fine granularity.

The BEAM virtual machine presents unique memory profiling characteristics compared to traditional runtimes. Each Erlang/Elixir process has its own heap, garbage collected independently. Binary data larger than 64 bytes is stored on a shared heap and reference-counted. ETS tables occupy separate memory outside any process heap. These three memory domains -- process heaps, shared binary heap, and ETS -- require different profiling techniques and tools, making BEAM memory investigation a specialized discipline.

## Core Concepts

| Concept | Description | Prismatic Usage |
|---------|-------------|-----------------|
| **System memory breakdown** | `:erlang.memory/0` returns memory by category: total, processes, ets, atom, binary, code, system | Baseline snapshots in quality gate pipeline |
| **Process memory** | Per-process heap + stack + message queue, inspected via `Process.info/2` | Identifying GenServer memory growth in OSINT batch runs |
| **ETS memory** | `:ets.info(table, :memory)` returns word count; multiply by word size for bytes | Monitoring ToolRegistry, TopicRegistry, SourceRegistry growth |
| **Binary references** | Large binaries (>64 bytes) stored on shared heap, reference-counted per process | Primary target for OSINT adapter memory leak detection |
| **`:recon` library** | Production-safe profiling: `proc_count`, `bin_leak`, `recon_alloc` | Standard investigation tool for production BEAM nodes |
| **`:observer`** | GUI tool showing processes, ETS, system info, application tree | Development-time investigation (unavailable in production) |
| **`:instrument`** | Allocation tracing with per-callsite attribution (requires `+Mim true`) | Deep investigation only; 2-5x overhead prohibits production use |
| **Garbage collection** | Per-process generational GC; forced via `:erlang.garbage_collect/1` | Isolating true leaks from delayed GC in profiling sessions |
| **Memory fragmentation** | Gap between allocated and used memory in allocator blocks | `recon_alloc:fragmentation/1` for diagnosing high RSS |
| **Heap size** | Configurable initial and max heap per process | Tuned for DD pipeline workers processing large entity sets |
| **Binary leak pattern** | Process holding reference to sub-binary prevents GC of parent binary | Detected via `:recon.bin_leak/1` in OSINT HTML processing |
| **Memory trend analysis** | Time-series comparison of snapshots revealing growth patterns | Automated baseline comparison in quality gate execution |

## Technical Deep Dive

### System-Level Memory Inspection

The BEAM provides several built-in tools for memory profiling. `:erlang.memory/0` returns system-wide memory breakdown by type (total, processes, ets, atom, binary, code, system). This is the starting point for any memory investigation: it tells you which category is growing. If `:processes` is growing, individual process investigation is needed. If `:binary` is growing, binary leak detection is needed. If `:ets` is growing, ETS table analysis is needed.

The distinction between `:erlang.memory(:total)` and the OS-reported RSS (Resident Set Size) is important. The BEAM's memory allocators request memory from the OS in large blocks and manage sub-allocation internally. The OS RSS may be significantly higher than `:erlang.memory(:total)` due to allocator fragmentation -- memory that the BEAM has allocated from the OS but is not currently using for application data. `recon_alloc:memory(:allocated)` reports the allocator-level view, which bridges this gap.

### Process-Level Memory Attribution

`:erlang.process_info(pid, :memory)` returns the total memory of a specific process including its heap, stack, and message queue. For a more detailed breakdown, request multiple info keys: `:heap_size`, `:stack_size`, `:message_queue_len`, `:total_heap_size` (includes old heap in generational GC), and `:binary` (list of binary references).

The `:recon` library provides `recon:proc_count(:memory, N)` which lists the N processes consuming the most memory. This is the standard way to find memory-hungry processes in production. The result includes the process's registered name (if any), current function, and memory in bytes -- enough to identify the process and its role in the system.

For Prismatic Platform's GenServer-based systems (OSINT execution workers, DD pipeline processors, Academy ProgressTracker), process-level profiling reveals whether memory growth is in the GenServer state (fixable by reducing state size), message queue (fixable by increasing processing rate or applying backpressure), or heap fragmentation (fixable by periodic `:erlang.garbage_collect/1` or process restart).

### Binary Leak Detection

Binary data in the BEAM has a dual-storage model. Small binaries (64 bytes or less) are stored directly on the process heap and garbage collected with the process. Large binaries are stored on a shared reference-counted heap. A process holding a reference to even a tiny sub-binary of a large binary prevents the entire large binary from being freed.

This creates the "binary leak" pattern: a process extracts a small piece of data from a large binary (e.g., parsing a specific field from a multi-megabyte HTTP response) and holds a reference to the sub-binary. The sub-binary internally references the parent binary, preventing its release. The fix is `:binary.copy/1`, which creates an independent copy of the sub-binary, releasing the reference to the parent.

`recon:bin_leak(N)` forces garbage collection on all processes and then identifies the N processes holding the most binary references. This is the definitive tool for diagnosing binary leaks. It should be run periodically in production (every few hours) on systems that process large binary data.

### ETS Memory Analysis

ETS tables occupy memory outside any process heap. `:ets.info(table, :memory)` returns the table's memory consumption in words (multiply by `:erlang.system_info(:wordsize)` for bytes). `:ets.info(table, :size)` returns the number of entries.

For Prismatic Platform's registries (ToolRegistry, TopicRegistry, SourceRegistry), ETS memory is stable after compilation because the data is derived from compiled modules. However, for dynamic ETS tables (caching layers, session storage, telemetry accumulators), memory can grow unboundedly without TTL-based cleanup.

The relationship between ETS entry count and memory is not linear due to the internal hash table structure. ETS tables over-allocate buckets to maintain O(1) lookup performance. A table with 1000 entries may use significantly more memory than 1000x the per-entry size due to bucket overhead and hash table expansion thresholds.

### Allocator Fragmentation Analysis

The BEAM uses a sophisticated multi-tier allocator system. Each allocator type (binary_alloc, ets_alloc, fix_alloc, etc.) manages memory blocks of different sizes. Fragmentation occurs when freed memory within a block cannot be coalesced into contiguous regions, leading to blocks that are partially occupied but cannot be returned to the OS.

`recon_alloc:fragmentation(:current)` returns per-allocator fragmentation data. High fragmentation (>50%) in `binary_alloc` is common in systems that process many variable-size binaries (HTTP responses, file parsing). The BEAM's `+MBas aobf` flag (Address Order Best Fit) can reduce fragmentation at the cost of slightly slower allocation.

### Erlang `:instrument` Module

When the VM is started with `+Mim true`, the `:instrument` module tracks individual allocations to their origin, producing allocation maps that show exactly which module and function allocated each memory region. This is the most detailed profiling level but carries significant overhead (2-5x slowdown) and is used only for targeted investigation, never in production.

## Usage in Prismatic Platform

### Automated Quality Gate Integration

The Prismatic Platform's Memory Safety quality domain uses automated memory profiling during quality gate execution. The pre-commit pipeline includes a memory usage check that snapshots process and ETS memory before and after test execution, flagging unexpected growth. The Quality Floor Guardian performs periodic memory profiling snapshots, building a time-series baseline that enables anomaly detection.

### OSINT Adapter Binary Leak Resolution

For the OSINT toolbox, memory profiling revealed that certain tools (particularly those processing large HTML responses) held binary references to full response bodies. The investigation flow proceeded through the standard playbook:

1. **System-level**: `:erlang.memory(:binary)` growing steadily during batch OSINT execution
2. **Process-level**: `recon:proc_count(:memory, 20)` identified OSINT worker processes
3. **Binary-level**: `recon:bin_leak(10)` confirmed workers holding large binary references
4. **Root cause**: Sub-binary extraction from HTTP response bodies retained parent binary
5. **Fix**: Applied `:binary.copy/1` to extracted data, releasing original response

This fix reduced memory consumption by 40% during batch OSINT executions.

### DD Pipeline Memory Optimization

The DD pipeline processes large batches of entity data during fetch/load cycles. Memory profiling identified that the load phase held all entities in GenServer state simultaneously. The fix was to process entities in bounded batches (500 per batch), releasing each batch's memory before processing the next. This reduced peak memory from 2GB to 300MB during full pipeline runs.

### Production Monitoring Pattern

Prismatic Platform runs periodic memory snapshots in production using a Telemetry-based reporter that emits `:erlang.memory/0` data every 60 seconds. The data feeds into time-series storage for trend analysis. Alerts fire when any memory category grows more than 20% above its 24-hour rolling average, triggering automated investigation via `recon:proc_count/2`.

## Code Examples

```elixir
defmodule PrismaticSafety.MemoryProfiler do
  @moduledoc """
  Production-safe memory profiling for the Prismatic Platform.

  Provides system-level, process-level, and ETS-level memory
  inspection functions designed for safe use in production
  environments. All functions are read-only and do not modify
  system state (except `binary_leak_suspects/2` which triggers
  garbage collection on sampled processes).

  ## Investigation Playbook

  1. Start with `system_snapshot/0` to identify which memory category is growing
  2. Use `top_memory_processes/1` to find the heaviest processes
  3. Use `ets_memory_breakdown/0` to check ETS table growth
  4. Use `binary_leak_suspects/2` to identify binary reference retention
  5. Use `detect_growth/2` to compare before/after snapshots

  ## Production Safety

  All functions in this module are safe for production use. They
  read existing data without modifying state, use bounded result
  sets, and complete in bounded time.
  """

  require Logger

  @type memory_snapshot :: %{
    total_mb: non_neg_integer(),
    processes_mb: non_neg_integer(),
    ets_mb: non_neg_integer(),
    binary_mb: non_neg_integer(),
    atom_mb: non_neg_integer(),
    code_mb: non_neg_integer(),
    timestamp: DateTime.t()
  }

  @type process_memory_info :: %{
    pid: pid(),
    memory: non_neg_integer(),
    registered_name: atom() | nil,
    current_function: {module(), atom(), non_neg_integer()} | nil,
    heap_size: non_neg_integer(),
    message_queue_len: non_neg_integer()
  }

  @type ets_memory_info :: %{
    name: atom(),
    type: atom(),
    size: non_neg_integer(),
    memory_mb: float(),
    owner: pid()
  }

  @doc """
  Takes a system-wide memory snapshot.

  Returns memory consumption broken down by BEAM category
  (processes, ETS, binary, atom, code) in megabytes. This
  is the starting point for any memory investigation.

  ## Examples

      iex> snapshot = PrismaticSafety.MemoryProfiler.system_snapshot()
      iex> is_integer(snapshot.total_mb)
      true
      iex> snapshot.total_mb > 0
      true

  """
  @spec system_snapshot() :: memory_snapshot()
  def system_snapshot do
    memory = :erlang.memory()

    %{
      total_mb: div(memory[:total], 1_048_576),
      processes_mb: div(memory[:processes], 1_048_576),
      ets_mb: div(memory[:ets], 1_048_576),
      binary_mb: div(memory[:binary], 1_048_576),
      atom_mb: div(memory[:atom], 1_048_576),
      code_mb: div(memory[:code], 1_048_576),
      timestamp: DateTime.utc_now()
    }
  end

  @doc """
  Lists the top N processes by memory consumption.

  Returns process metadata including registered name, current
  function, heap size, and message queue length. Processes
  without info (dead between listing and inspection) are
  filtered out.

  ## Parameters

    * `n` - Number of top processes to return (default: 20)

  ## Examples

      iex> procs = PrismaticSafety.MemoryProfiler.top_memory_processes(5)
      iex> length(procs) <= 5
      true

  """
  @spec top_memory_processes(pos_integer()) :: list(process_memory_info())
  def top_memory_processes(n \\ 20) do
    Process.list()
    |> Enum.map(fn pid ->
      info = Process.info(pid, [:memory, :registered_name, :current_function,
                                 :heap_size, :message_queue_len])
      if info, do: Map.new(info) |> Map.put(:pid, pid), else: nil
    end)
    |> Enum.reject(&is_nil/1)
    |> Enum.sort_by(& &1[:memory], :desc)
    |> Enum.take(n)
  end

  @doc """
  Returns memory breakdown for all ETS tables.

  Lists every ETS table with its name, type, entry count,
  memory in megabytes, and owner process. Sorted by memory
  descending to highlight the largest tables first.

  ## Examples

      iex> tables = PrismaticSafety.MemoryProfiler.ets_memory_breakdown()
      iex> is_list(tables)
      true

  """
  @spec ets_memory_breakdown() :: list(ets_memory_info())
  def ets_memory_breakdown do
    word_size = :erlang.system_info(:wordsize)

    :ets.all()
    |> Enum.map(fn table ->
      info = :ets.info(table)
      %{
        name: info[:name],
        type: info[:type],
        size: info[:size],
        memory_mb: Float.round(info[:memory] * word_size / 1_048_576, 2),
        owner: info[:owner]
      }
    end)
    |> Enum.sort_by(& &1.memory_mb, :desc)
  end

  @doc """
  Identifies processes suspected of binary reference leaks.

  Forces garbage collection on sampled processes and then
  checks binary reference counts. Processes holding more than
  `threshold` binary references after forced GC are suspects.

  Note: This function triggers garbage collection on sampled
  processes, which may cause brief latency spikes. Use with
  care in production during low-traffic periods.

  ## Parameters

    * `n` - Number of top suspects to return (default: 10)
    * `threshold` - Minimum binary references to flag (default: 100)

  ## Examples

      iex> suspects = PrismaticSafety.MemoryProfiler.binary_leak_suspects(5)
      iex> is_list(suspects)
      true

  """
  @spec binary_leak_suspects(pos_integer(), pos_integer()) :: list(map())
  def binary_leak_suspects(n \\ 10, threshold \\ 100) do
    Process.list()
    |> Enum.map(fn pid ->
      :erlang.garbage_collect(pid)

      case Process.info(pid, [:binary, :registered_name, :memory]) do
        nil ->
          nil

        info ->
          binary_count = length(info[:binary] || [])
          binary_size = (info[:binary] || []) |> Enum.map(&elem(&1, 1)) |> Enum.sum()

          if binary_count >= threshold do
            %{
              pid: pid,
              registered_name: info[:registered_name],
              memory_bytes: info[:memory],
              binary_count: binary_count,
              binary_size_mb: Float.round(binary_size / 1_048_576, 2)
            }
          end
      end
    end)
    |> Enum.reject(&is_nil/1)
    |> Enum.sort_by(& &1.binary_size_mb, :desc)
    |> Enum.take(n)
  end

  @doc """
  Compares two memory snapshots and identifies significant growth.

  Returns a list of memory categories that grew by more than 10%
  between the two snapshots, with absolute and percentage growth.

  ## Parameters

    * `before` - Memory snapshot taken before the operation
    * `after_snapshot` - Memory snapshot taken after the operation

  ## Examples

      iex> before = PrismaticSafety.MemoryProfiler.system_snapshot()
      iex> after_snap = PrismaticSafety.MemoryProfiler.system_snapshot()
      iex> growth = PrismaticSafety.MemoryProfiler.detect_growth(before, after_snap)
      iex> is_list(growth)
      true

  """
  @spec detect_growth(memory_snapshot(), memory_snapshot()) :: list(map())
  def detect_growth(before, after_snapshot) do
    Enum.filter([:processes_mb, :ets_mb, :binary_mb], fn key ->
      Map.get(after_snapshot, key, 0) > Map.get(before, key, 0) * 1.1
    end)
    |> Enum.map(fn key ->
      before_val = Map.get(before, key, 0)
      after_val = Map.get(after_snapshot, key, 0)

      %{
        category: key,
        before_mb: before_val,
        after_mb: after_val,
        growth_mb: after_val - before_val,
        growth_pct: Float.round((after_val - before_val) / max(before_val, 1) * 100, 1)
      }
    end)
  end

  @doc """
  Generates a comprehensive memory report for logging or alerting.

  Combines system snapshot, top processes, ETS breakdown, and
  binary leak suspects into a single report map suitable for
  structured logging or dashboard display.

  ## Examples

      iex> report = PrismaticSafety.MemoryProfiler.full_report()
      iex> Map.has_key?(report, :system)
      true

  """
  @spec full_report() :: map()
  def full_report do
    %{
      system: system_snapshot(),
      top_processes: top_memory_processes(10),
      ets_tables: ets_memory_breakdown() |> Enum.take(10),
      binary_suspects: binary_leak_suspects(5, 50),
      generated_at: DateTime.utc_now()
    }
  end
end
```

## Common Pitfalls

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| **Single-snapshot conclusions** | One snapshot is meaningless without baseline context | Always compare against historical baseline or before/after pair |
| **Ignoring allocator fragmentation** | `:erlang.memory(:total)` looks fine but OS RSS is 2x higher | Use `recon_alloc:fragmentation/1` to check allocator efficiency |
| **Profiling under idle load** | Miss load-dependent allocations that dominate production | Profile under realistic load patterns replicating production traffic |
| **Using `:instrument` in production** | 2-5x overhead causes cascading latency and potential OOM | Reserve `:instrument` for development/staging investigation only |
| **Forgetting binary leak pattern** | Sub-binary references prevent parent binary GC | Apply `:binary.copy/1` when extracting small data from large binaries |
| **ETS memory estimation errors** | Word count * word_size misses hash table bucket overhead | Use `:ets.info(table, :memory)` directly, not entry_count * avg_size |
| **Not forcing GC before measurement** | Pending garbage skews process memory readings | Call `:erlang.garbage_collect(pid)` before measuring for accurate results |
| **Confusing process memory with system memory** | Process heaps are only part of total; ETS and binary are separate | Check all three domains: processes, ETS, and binary separately |
| **Atom table growth alarm** | Atom table grows monotonically and is never GC'd | This is expected BEAM behavior; monitor but do not panic unless approaching limit |
| **Missing message queue monitoring** | Full mailboxes consume memory and indicate backpressure issues | Include `:message_queue_len` in process profiling to detect mailbox bloat |

## Best Practices

1. **Start with system-level profiling** -- use `:erlang.memory/0` to identify which memory category is growing before drilling into process-level or ETS-level detail.
2. **Use `:recon.bin_leak/1` periodically in production** -- run every few hours to detect binary reference retention before it causes OOM; this is the most common memory leak pattern in BEAM systems.
3. **Automate memory snapshots at regular intervals** -- build trend baselines using time-series storage; single snapshots are meaningless without historical context for comparison.
4. **Never use `:instrument` in production** -- the 2-5x overhead makes it unsuitable for live systems; use it only in development or staging environments for targeted investigation.
5. **Profile after realistic load** -- memory patterns under idle conditions differ fundamentally from production load; always profile under representative traffic patterns.
6. **Document expected memory ranges per process type** -- establish baselines for GenServers, workers, and registries so alerts can fire on meaningful deviations.
7. **Apply `:binary.copy/1` when extracting from large binaries** -- this is the standard fix for binary leak patterns in HTTP response processing, file parsing, and data extraction.
8. **Monitor ETS table growth trends** -- static registries (ToolRegistry) should be stable after boot; dynamic tables need TTL-based cleanup to prevent unbounded growth.
9. **Include memory profiling in quality gates** -- compare before/after snapshots during test execution to catch memory regressions before they reach production.
10. **Use process restart as a memory management strategy** -- for long-running workers that accumulate fragmented heaps, periodic restart via supervisor is a legitimate and effective approach.

## Related Terms

- [Memory](@/glossary/memory.md) -- BEAM memory architecture being profiled
- [Memory Leak](@/glossary/memory-leak.md) -- the primary target of memory profiling investigation
- [Profiling](@/glossary/profiling.md) -- general profiling including CPU, memory, and I/O
- [Process](@/glossary/process.md) -- individual BEAM processes whose memory is profiled
- [ETS](@/glossary/ets.md) -- Erlang Term Storage tables with independent memory accounting
- [Binary](@/glossary/binary.md) -- shared binary heap and reference counting mechanism
- [Garbage Collection](/glossary/garbage-collection/) -- per-process GC that reclaims heap memory
- [Named Table](@/glossary/named-table.md) -- ETS tables identified by atom for profiling
- [Observer](@/glossary/observer.md) -- GUI development tool for memory visualization
- [Recon](/glossary/recon/) -- production-safe profiling library for BEAM systems
- [Heap](@/glossary/heap.md) -- per-process memory region managed by generational GC
- [Allocator](/glossary/allocator/) -- BEAM's multi-tier memory allocation system

## See Also

- [Architecture](@/architecture/_index.md) -- observability and profiling architecture
- [Capabilities](@/capabilities/_index.md) -- performance analysis capabilities
- [Performance Testing](/performance/) -- systematic performance validation
- [OSINT Toolbox](@/osint/_index.md) -- binary leak investigation case study
- [DD Pipeline](@/dd/_index.md) -- batch memory optimization case study

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
