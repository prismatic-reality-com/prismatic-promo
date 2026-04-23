+++
title = "Heap"
description = "The per-process memory allocation area in the BEAM virtual machine where Erlang/Elixir terms are stored, subject to generational garbage collection independent of other processes."
weight = 50

[extra]
category = "elixir"
tags = ["heap", "memory", "beam", "process", "allocation", "gc", "generational", "young-heap", "old-heap", "stack"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "advanced"
audience = ["developers", "performance-engineers", "architects", "sre"]
related_terms = ["gc", "ets-memory", "process-isolation", "beam", "memory-safety", "stack"]
key_concepts = ["per-process-heap", "young-generation", "old-generation", "heap-growth", "binary-heap", "message-copying"]
platforms = ["beam", "erlang", "elixir"]
prerequisites = ["memory-management", "beam-process-model", "gc-fundamentals"]
use_cases = ["performance-tuning", "memory-optimization", "latency-analysis", "process-design"]
complexity = "high"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1050
date_modified = "2026-02-23"
keywords = ["Heap", "memory", "BEAM", "process", "glossary", "Prismatic Platform"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Heap - Prismatic Platform"
+++

## Definition and Overview

In the BEAM virtual machine, the heap is the per-process memory region where Erlang and Elixir terms (data values) are allocated during execution. Every BEAM process has its own private heap that is completely isolated from all other processes' heaps. This isolation means that one process's memory allocation patterns, garbage collection pauses, and memory consumption have zero impact on other processes -- a property that is fundamental to BEAM's soft real-time guarantees and fault tolerance.

The heap is distinct from the process stack (which holds function call frames and local variables) and from ETS memory (which exists outside any process's heap). When a process creates a new term -- a list, map, tuple, binary, or any compound data structure -- memory for that term is allocated on the process's heap. When the process sends a message to another process, the message data is deep-copied from the sender's heap to the receiver's heap, maintaining strict isolation between processes.

Understanding heap behavior is essential for building high-performance BEAM applications. A process with a small, stable heap incurs negligible garbage collection overhead. A process that accumulates large amounts of data on its heap will experience longer GC pauses (though only that process is affected). The Prismatic Platform's architecture of distributing state across many small processes rather than concentrating it in a few large ones is directly motivated by heap management considerations.

## Technical Deep Dive

### Process Memory Layout

| Region | Contents | Size | GC Scope |
|--------|----------|------|----------|
| **Stack** | Call frames, local variables, return addresses | Grows downward | Scanned for roots |
| **Young Heap** | Recently allocated terms | Grows upward | Minor GC target |
| **Old Heap** | Terms surviving multiple GCs | Separate region | Major GC target |
| **Binary Heap** | References to off-heap binaries (>64 bytes) | Virtual accounting | Reference counted |
| **Mailbox** | Incoming messages (on-heap or off-heap) | Dynamic | Configurable |

### Heap Growth Strategy

```
Initial allocation: 233 words (~1.8 KB on 64-bit)

Growth triggers and strategy:
  1. Process allocates term, no space in young heap
  2. Minor GC triggered, live data copied
  3. If live data > heap size * threshold, heap doubles
  4. Growth sequence: 233 -> 466 -> 932 -> 1864 -> ...
  5. Each doubling amortizes allocation overhead

Shrink triggers:
  1. After GC, live data < 25% of heap
  2. Heap shrinks to 2x live data size
  3. Prevents long-term memory waste from temporary peaks
```

### Heap Size Impact on GC

| Heap Size | GC Pause (approx) | Process Type |
|-----------|-------------------|-------------|
| 1 KB | < 1 us | Short-lived, small state |
| 10 KB | ~10 us | Typical GenServer |
| 100 KB | ~100 us | Medium state accumulation |
| 1 MB | ~1 ms | Large state (reconsider design) |
| 10 MB | ~10 ms | Problematic (redesign required) |
| 100 MB | ~100 ms | Unacceptable (architecture issue) |

### Message Copying

```
Process A                         Process B
+-----------+                     +-----------+
| Heap A    |   send(B, msg)      | Heap B    |
|           | ==================> |           |
| [msg data]|   deep copy         | [msg copy]|
+-----------+                     +-----------+

Key properties:
  - Message is deep-copied (not shared)
  - Large binaries (>64 bytes) are reference-counted, NOT copied
  - Copy cost is proportional to message size
  - Receiver's heap may grow to accommodate message
```

## Architecture and Implementation

BEAM heap architecture uses a copying generational collector where young and old heaps occupy separate contiguous memory regions. When a minor GC is triggered, live data from the young heap is copied to either a new young heap or promoted to the old heap (if the data has survived enough collections). This copying approach automatically compacts memory, eliminating fragmentation within each generation.

The heap's relationship with the stack is carefully managed. The stack grows from high addresses downward while the heap grows from low addresses upward. A GC is triggered when the heap and stack pointers would collide, indicating that the current allocation area is exhausted.

Large binaries (>64 bytes) are not stored on the process heap. Instead, they are allocated in a shared binary area and accessed through reference-counted pointers stored on the process heap. This optimization avoids copying large binaries between processes during message passing -- only the reference (a few words) is copied, while the binary data is shared. The binary is freed when all references are dropped (detected during GC through reference count decrement).

## Usage in Prismatic Platform

The Prismatic Platform monitors process heap sizes to detect memory issues early and guide architectural decisions about state distribution.

```elixir
defmodule Prismatic.Process.HeapAnalyzer do
  @moduledoc """
  Analyzes process heap sizes across the platform to
  identify processes with excessive memory usage and
  guide optimization decisions.
  """

  @type heap_info :: %{
    pid: pid(),
    registered_name: atom() | nil,
    heap_size: non_neg_integer(),
    stack_size: non_neg_integer(),
    total_memory: non_neg_integer(),
    message_queue_len: non_neg_integer(),
    reductions: non_neg_integer()
  }

  @spec top_processes(pos_integer()) :: list(heap_info())
  def top_processes(count \\ 20) do
    Process.list()
    |> Enum.map(&collect_heap_info/1)
    |> Enum.sort_by(& &1.total_memory, :desc)
    |> Enum.take(count)
  end

  @spec analyze_heap(pid()) :: {:ok, map()} | {:error, term()}
  def analyze_heap(pid) do
    case Process.info(pid, [:garbage_collection, :memory, :heap_size, :stack_size, :message_queue_len]) do
      nil ->
        {:error, :process_not_found}

      info ->
        gc = Keyword.get(info, :garbage_collection, [])
        {:ok, %{
          heap_size_words: Keyword.get(info, :heap_size, 0),
          heap_size_bytes: Keyword.get(info, :heap_size, 0) * :erlang.system_info(:wordsize),
          old_heap_size: Keyword.get(gc, :old_heap_size, 0),
          total_memory: Keyword.get(info, :memory, 0),
          minor_gcs: Keyword.get(gc, :minor_gcs, 0),
          fullsweep_after: Keyword.get(gc, :fullsweep_after, 0),
          stack_size: Keyword.get(info, :stack_size, 0),
          message_queue: Keyword.get(info, :message_queue_len, 0)
        }}
    end
  end

  @spec detect_heap_anomalies(keyword()) :: list(heap_info())
  def detect_heap_anomalies(opts \\ []) do
    threshold = Keyword.get(opts, :threshold_bytes, 10_000_000)

    Process.list()
    |> Enum.map(&collect_heap_info/1)
    |> Enum.filter(fn info -> info.total_memory > threshold end)
    |> Enum.sort_by(& &1.total_memory, :desc)
  end

  defp collect_heap_info(pid) do
    info = Process.info(pid, [:registered_name, :heap_size, :stack_size, :memory, :message_queue_len, :reductions])

    %{
      pid: pid,
      registered_name: case Keyword.get(info || [], :registered_name) do [] -> nil; name -> name end,
      heap_size: Keyword.get(info || [], :heap_size, 0),
      stack_size: Keyword.get(info || [], :stack_size, 0),
      total_memory: Keyword.get(info || [], :memory, 0),
      message_queue_len: Keyword.get(info || [], :message_queue_len, 0),
      reductions: Keyword.get(info || [], :reductions, 0)
    }
  end
end
```

The platform's Health Monitor integrates heap analysis to detect processes that exceed configured memory thresholds. Agent GenServers, OSINT tool execution processes, and LiveView processes are monitored for heap growth anomalies. When a process heap exceeds 10MB, a telemetry event is emitted for investigation.

## Cross-References

- [GC](@/glossary/gc.md) -- Garbage collection operating on the heap
- [ETS Memory](@/glossary/ets-memory.md) -- Off-heap memory management
- [Process Isolation](@/glossary/process-isolation.md) -- Heap isolation between processes
- [BEAM](@/glossary/beam.md) -- Virtual machine managing process heaps
- [Actor Model](@/glossary/actor-model.md) -- Per-process state on individual heaps
- **Livebooks**: `performance_monitoring/` notebooks include heap profiling
- **Academy**: BEAM internals topics cover heap architecture

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
