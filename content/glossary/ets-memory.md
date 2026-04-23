+++
title = "ETS Memory"
description = "Memory management for Erlang Term Storage tables -- understanding allocation patterns, garbage collection interactions, and optimization strategies for in-memory data on the BEAM."
weight = 50

[extra]
category = "elixir"
tags = ["ets", "memory", "beam", "erlang", "performance", "table", "allocation", "gc", "optimization", "in-memory"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "advanced"
audience = ["developers", "architects", "performance-engineers", "sre"]
related_terms = ["ets", "beam", "gc", "heap", "process-isolation", "dets", "mnesia", "memory-safety"]
key_concepts = ["separate-heap", "copy-on-read", "memory-fragmentation", "table-types", "compressed-tables", "memory-accounting"]
platforms = ["beam", "erlang", "elixir"]
prerequisites = ["ets-fundamentals", "beam-memory-model", "performance-optimization"]
use_cases = ["caching", "shared-state", "registry", "rate-limiting", "session-storage"]
complexity = "high"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1100
date_modified = "2026-02-23"
keywords = ["ETS", "memory", "BEAM", "Erlang Term Storage", "glossary", "Prismatic Platform"]
quality_score = 82
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "ETS Memory - Prismatic Platform"
+++

## Definition and Overview

ETS (Erlang Term Storage) memory management refers to the allocation, usage, and optimization patterns of memory consumed by ETS tables on the BEAM virtual machine. Unlike regular process heap memory, ETS tables allocate memory from a separate system-level allocator outside of individual process heaps. This architectural decision has profound implications for garbage collection behavior, memory visibility, and performance characteristics that every BEAM developer must understand.

ETS tables occupy memory that is not subject to per-process garbage collection. When a process inserts data into an ETS table, the data is copied from the process heap into the ETS table's own memory area. When a process reads data from an ETS table, the data is copied from the table back into the process heap. This copy-on-read, copy-on-write semantics ensures process isolation (a process cannot hold a direct pointer into ETS memory), but it also means that every ETS operation involves memory allocation and copying overhead.

The memory behavior of ETS tables differs fundamentally from process-local data structures. Process heaps are generational, compacting, and collected independently of other processes. ETS memory uses reference-counted terms and a different allocation strategy optimized for concurrent access patterns. Understanding these differences is essential for building high-performance applications that use ETS for caching, registries, rate limiting, and shared state.

## Technical Deep Dive

### ETS Memory Architecture

| Aspect | Process Heap | ETS Table |
|--------|-------------|-----------|
| **Allocator** | Per-process heap allocator | `ets_alloc` system allocator |
| **GC** | Generational, per-process | Reference counting, no compaction |
| **Sharing** | Copy on send | Copy on read/write |
| **Visibility** | Private to owning process | Accessible by all (or named) processes |
| **Fragmentation** | Compacting GC eliminates | Can accumulate over time |
| **Max Size** | Process heap limit | System memory limit |
| **Ownership** | Process lifecycle | Owner process lifecycle |

### Memory Operations

```
INSERT (ets:insert):
  1. Term from process heap is deep-copied to ETS allocator
  2. Old value (if key exists) is reference-decremented
  3. New entry linked into hash table / tree structure
  4. Process heap copy eligible for GC

LOOKUP (ets:lookup):
  1. Key matched in ETS internal structure
  2. Value deep-copied from ETS allocator to process heap
  3. Process now owns the copy (subject to process GC)
  4. ETS copy unchanged

DELETE (ets:delete):
  1. Entry unlinked from internal structure
  2. Reference count decremented
  3. Memory freed when reference count reaches zero
  4. Delayed free possible during concurrent access
```

### Table Type Memory Characteristics

| Table Type | Memory Overhead | Lookup | Ordered | Best For |
|-----------|----------------|--------|---------|----------|
| **:set** | Hash table (16 bytes/entry + data) | O(1) average | No | Key-value caches, registries |
| **:ordered_set** | AVL tree (32 bytes/entry + data) | O(log n) | Yes | Range queries, time-series |
| **:bag** | Hash table (allows duplicate keys) | O(1) + O(k) | No | Multi-value mappings |
| **:duplicate_bag** | Hash table (allows duplicate key-value) | O(1) + O(k) | No | Event logs, audit trails |

### Compression

ETS supports table-level compression that trades CPU for memory. Compressed tables store values in a compact binary format, reducing memory usage by 50-80% for typical Elixir terms at the cost of compression/decompression overhead on every read and write.

```
Memory Comparison (1M entries, {integer, string} tuples):
  Uncompressed :set    ~150 MB
  Compressed :set      ~45 MB  (70% reduction)
  Uncompressed :ordered_set  ~200 MB
  Compressed :ordered_set    ~80 MB  (60% reduction)
```

## Architecture and Implementation

ETS memory is managed by the `ets_alloc` allocator, one of several memory allocators in the BEAM runtime. This allocator uses a carrier-based strategy: large memory blocks (carriers) are requested from the operating system, and individual ETS entries are allocated within these carriers. The allocator supports multiple allocation strategies (best fit, address order best fit, good fit) configurable through BEAM emulator flags.

Memory fragmentation is the primary concern with long-lived ETS tables that experience frequent insertions and deletions. Unlike process heaps, ETS memory is not compacted. Freed memory within a carrier may not be returned to the operating system if the carrier contains other live allocations. Over time, this can lead to the ETS allocator holding significantly more memory than the live data requires.

Monitoring ETS memory requires using `:erlang.memory/0` (which reports total ETS memory) and `:ets.info/2` with the `:memory` key (which reports per-table memory in words). The difference between the sum of per-table memory and total ETS memory reflects allocator overhead and fragmentation.

## Usage in Prismatic Platform

The Prismatic Platform uses ETS extensively for caching, registries, and shared state. Memory monitoring is integrated into the platform's health check system.

```elixir
defmodule Prismatic.ETS.MemoryMonitor do
  @moduledoc """
  Monitors ETS table memory usage across the platform.
  Tracks per-table memory, total ETS allocation, and
  fragmentation ratio to detect memory issues early.
  """

  use GenServer

  @check_interval_ms 60_000
  @fragmentation_threshold 1.5

  @type table_stats :: %{
    name: atom(),
    memory_bytes: non_neg_integer(),
    size: non_neg_integer(),
    type: atom(),
    compressed: boolean()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec get_table_stats() :: list(table_stats())
  def get_table_stats do
    :ets.all()
    |> Enum.map(&collect_table_stats/1)
    |> Enum.sort_by(& &1.memory_bytes, :desc)
  end

  @spec get_total_memory() :: %{tables: non_neg_integer(), allocated: non_neg_integer(), ratio: float()}
  def get_total_memory do
    tables_memory =
      :ets.all()
      |> Enum.map(fn tid -> :ets.info(tid, :memory) * :erlang.system_info(:wordsize) end)
      |> Enum.sum()

    allocated = :erlang.memory(:ets)

    %{
      tables: tables_memory,
      allocated: allocated,
      ratio: if(tables_memory > 0, do: allocated / tables_memory, else: 1.0)
    }
  end

  @impl GenServer
  def init(_opts) do
    schedule_check()
    {:ok, %{history: []}}
  end

  @impl GenServer
  def handle_info(:check_memory, state) do
    stats = get_total_memory()

    if stats.ratio > @fragmentation_threshold do
      :telemetry.execute(
        [:prismatic, :ets, :fragmentation_warning],
        %{ratio: stats.ratio, allocated: stats.allocated},
        %{threshold: @fragmentation_threshold}
      )
    end

    schedule_check()
    {:noreply, %{state | history: [stats | Enum.take(state.history, 59)]}}
  end

  defp collect_table_stats(tid) do
    %{
      name: :ets.info(tid, :name),
      memory_bytes: :ets.info(tid, :memory) * :erlang.system_info(:wordsize),
      size: :ets.info(tid, :size),
      type: :ets.info(tid, :type),
      compressed: :ets.info(tid, :compressed)
    }
  end

  defp schedule_check do
    Process.send_after(self(), :check_memory, @check_interval_ms)
  end
end
```

The platform's self-registering systems (OSINT ToolRegistry, Academy TopicRegistry, DD SourceRegistry) all use ETS as their primary storage backend. The MemoryMonitor tracks these tables to ensure memory usage remains within operational bounds and fragmentation does not degrade performance.

## Cross-References

- [ETS](@/glossary/ets.md) -- Erlang Term Storage fundamentals
- **GC** -- BEAM garbage collection mechanics
- **Heap** -- Process memory allocation
- [Process Isolation](@/glossary/process-isolation.md) -- Memory isolation guarantees
- **Hit Rate** -- Cache effectiveness measurement
- **Livebooks**: `performance_monitoring/` notebooks include ETS memory profiling
- **Academy**: Topics covering BEAM internals reference ETS memory model

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
