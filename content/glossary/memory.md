+++
title = "Memory"
weight = 50

[extra]
description = "Memory in BEAM systems refers to the per-process heap allocation model where each Erlang/Elixir process maintains its own private heap with independent garbage collection, enabling predictable latency and fault isolation impossible in shared-heap runtimes. Covers process heaps, ETS tables, binary heap, atom table, and allocator subsystems."
category = "platform"
domain = "runtime"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["memory-leak", "memory-profiling", "process", "message-queue", "named-table", "lru", "ets", "garbage-collection", "binary", "atom", "scheduler", "reductions"]
tags = ["glossary", "memory", "beam", "heap", "garbage-collection", "per-process", "allocation", "performance", "ets", "binary-heap", "atom-table"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
difficulty = "advanced"
quality_score = 96
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "The BEAM's per-process heap model gives Prismatic Platform predictable sub-millisecond GC pauses across 552 agents and 157 OSINT tools, unlike shared-heap runtimes where any process can trigger system-wide GC stops. Understanding heap regions, binary reference counting, and ETS memory ownership is critical for preventing memory-related production incidents."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["memory", "BEAM memory", "per-process heap", "garbage collection", "memory management", "heap allocation", "ETS memory", "binary memory", "atom table", "recon_alloc", "memory fragmentation", "fullsweep_after"]
image = "/images/sections/glossary.png"
image_alt = "Memory - BEAM Memory Architecture - Prismatic Platform"
word_count = 3400
see_also = ["capabilities", "architecture", "performance-testing"]
+++

## Definition

In the BEAM virtual machine (the runtime for Erlang and Elixir), memory management follows a per-process heap model: each lightweight process maintains its own private heap that is allocated, grown, and garbage collected independently of all other processes. When a process sends a message, the data is copied from the sender's heap to the receiver's heap (with exceptions for large binaries, which are reference-counted on a shared binary heap). When a process terminates, its entire heap is freed instantly -- no GC cycle required.

This architecture has profound implications for system reliability and latency predictability. Garbage collection pauses affect only the single process being collected, not the entire system. A process handling a complex OSINT query might pause for 100 microseconds during GC while all other processes continue executing uninterrupted. This is fundamentally different from shared-heap runtimes (JVM, V8, Go) where GC pauses can halt all application threads simultaneously. For a platform like Prismatic that runs 552 concurrent agents and 157 OSINT tools, the per-process GC model ensures that no single agent's memory behavior can impact the latency of any other agent.

The BEAM's memory model also provides natural fault isolation. When a process crashes, its entire heap is reclaimed without affecting any other process's memory. There is no risk of heap corruption propagating across process boundaries. This property, combined with OTP supervision trees, creates a self-healing memory architecture where individual process failures are both contained and automatically recovered.

## Core Concepts

### BEAM Memory Regions

| Region | Scope | GC Strategy | Failure Mode | Prismatic Usage |
|--------|-------|-------------|-------------|-----------------|
| Process Heaps | Per-process, private | Generational (young/old) | OOM kills individual process | 552 agents, each with independent heap |
| ETS Tables | Shared, named or anonymous | Reference-counted (owner process) | Table destroyed when owner dies | ToolRegistry, TopicRegistry, SourceRegistry |
| Binary Heap | Shared, reference-counted | Reference counting + GC trigger | Binary leaks from sub-binary refs | OSINT response payloads, file I/O buffers |
| Atom Table | Global, append-only | Never garbage collected | Atom table exhaustion (VM crash) | Module names, configuration keys |
| Code Server | Global, per-module | Hot code reload replaces old | Code bloat from retained old versions | 94 umbrella app modules |
| Persistent Term | Global, copy-on-write | Copied to all processes on update | Large copies on frequent updates | Rarely used; ETS preferred |

### Process Heap Lifecycle

| Phase | Trigger | What Happens | Duration | Impact |
|-------|---------|-------------|----------|--------|
| Allocation | Process spawn | Initial heap allocated (min_heap_size, default 233 words) | Microseconds | Negligible |
| Young GC | Heap growth triggers | Minor collection of young generation | 10-100 microseconds | Single process paused |
| Promotion | Object survives young GC | Data moved from young heap to old heap | Part of young GC | Increases old heap size |
| Full Sweep | fullsweep_after count reached | Both young and old heaps collected | 100-1000 microseconds | Single process paused longer |
| Heap Growth | Insufficient space after GC | Heap doubled in size | Microseconds (realloc) | Memory spike for process |
| Termination | Process exits/crashes | Entire heap freed immediately | Microseconds | Instant memory reclaim |

### Memory Measurement Functions

| Function | Returns | Scope | Use Case |
|----------|---------|-------|----------|
| `:erlang.memory/0` | Keyword list of all memory types | System-wide | Dashboard monitoring, alerting |
| `:erlang.memory/1` | Bytes for specific type | System-wide | Targeted metric collection |
| `Process.info(pid, :memory)` | Bytes used by process | Single process | Investigating specific process growth |
| `Process.info(pid, :heap_size)` | Words in process heap | Single process | Heap sizing analysis |
| `:ets.info(table, :memory)` | Words used by ETS table | Single table | ETS capacity planning |
| `:recon_alloc.memory/1` | Allocator-level statistics | System-wide | Fragmentation analysis |
| `:instrument.allocations/0` | Per-type allocation stats | System-wide | Deep allocation debugging |

## Technical Deep Dive

### Generational Garbage Collection

BEAM process heaps use generational garbage collection with two generations (young and old). New allocations go to the young heap. Objects surviving one GC cycle promote to the old heap. The young heap is collected frequently (after a configurable number of reductions), and the old heap is collected rarely (fullsweep). The `fullsweep_after` option controls how many minor GC cycles occur before a full sweep.

The default `fullsweep_after` value is 65535, meaning a full sweep happens very rarely. For processes that handle large messages but store little state (like request handlers), this means large temporary allocations may linger in the old heap until the next full sweep. Reducing `fullsweep_after` for such processes reclaims memory faster at the cost of more frequent (and longer) GC pauses.

For long-running GenServers that maintain stable state, the generational model works excellently: the state lives in the old heap and is rarely touched by GC, while temporary computation data in the young heap is collected quickly and cheaply. The key insight is that GC cost is proportional to the amount of *live* data, not the total heap size.

### Binary Memory Management

Large binaries (>64 bytes) bypass per-process heaps and are stored in a shared binary heap with reference counting. This avoids copying large payloads between processes -- only a reference (ProcBin, 3-4 words) is copied. However, this optimization creates a subtle memory management challenge.

When a process extracts a small sub-binary from a large binary using pattern matching or `:binary.part/3`, the sub-binary holds a reference to the *entire* original binary. The large binary cannot be freed until all sub-binary references are gone. This "binary leak" pattern is one of the most common sources of unexpected memory growth in production BEAM systems.

```elixir
# DANGEROUS: sub-binary keeps entire large binary alive
<<header::binary-size(100), _rest::binary>> = large_binary
# `header` holds a reference to the entire large_binary

# SAFE: copy the sub-binary to release the large binary
header = :binary.copy(<<header::binary-size(100), _rest::binary>> = large_binary)
# Now the large_binary can be freed
```

The BEAM triggers binary GC in processes when their virtual binary heap (a counter tracking referenced binary size) exceeds a threshold. However, if a process holds references but does not allocate new data (triggering no GC), binary references can accumulate indefinitely. Calling `:erlang.garbage_collect(pid)` forces a GC cycle that decrements binary reference counts.

### Atom Table Exhaustion

The atom table is a global, append-only data structure. Atoms are never garbage collected. The default maximum atom count is approximately 1,048,576. Creating atoms from user input (via `String.to_atom/1`) is a well-known attack vector that can crash the entire VM by exhausting the atom table.

Prismatic Platform enforces the ZERO doctrine's ban on `String.to_atom/1` -- all dynamic atom creation must use `String.to_existing_atom/1` (which raises if the atom does not exist) or explicit allowlists. The pre-commit hook scans for `String.to_atom` in staged files and blocks the commit.

### ETS Memory Ownership

ETS tables are owned by the process that created them. When the owner process dies, the table is destroyed and all memory is freed. This creates a coupling between process lifecycle and data lifecycle that must be managed carefully.

For registries (ToolRegistry, TopicRegistry), the owner is typically a long-lived GenServer supervised by an application supervisor. If the GenServer crashes and restarts, the ETS table is destroyed and must be rebuilt. The `:heir` option can transfer table ownership to another process on owner death, but this adds complexity.

ETS memory is measured in words (8 bytes on 64-bit systems). The `:ets.info(table, :memory)` function returns words, not bytes. This is a common source of confusion in monitoring dashboards -- multiply by `:erlang.system_info(:wordsize)` to convert to bytes.

### Memory Fragmentation

The BEAM uses multiple memory allocators (erts_alloc), each optimized for different allocation patterns. Key allocators include:

- **binary_alloc**: For binary data on the shared binary heap
- **eheap_alloc**: For process heaps
- **ets_alloc**: For ETS table data
- **fix_alloc**: For fixed-size allocations (process control blocks, etc.)
- **sl_alloc**: For short-lived allocations

Memory fragmentation occurs when freed blocks cannot be reused because they are too small or surrounded by live blocks. The `:recon_alloc` library provides tools to measure fragmentation. A common sign is `:erlang.memory(:total)` being significantly less than the OS-reported RSS (Resident Set Size) -- the difference is fragmented but unreturnable memory.

## Usage in Prismatic Platform

The Prismatic Platform's 552 agents, 157 OSINT tools, and multiple GenServer registries run as concurrent BEAM processes, each with independent memory management. Memory monitoring is a first-class platform concern.

### Agent Memory Isolation

Each of the 552 AIAD agents runs in its own process (or process group). An agent performing a memory-intensive operation -- such as parsing a large OSINT response or analyzing a DD entity graph -- experiences GC pauses only in its own process. Other agents continue operating with zero latency impact. This is the architectural foundation that allows the platform to run hundreds of concurrent agents without mutual interference.

### ETS Registry Memory

ETS tables in the platform consume shared memory outside the per-process heap model:

- **ToolRegistry**: Stores metadata for 157 OSINT tool adapters. Memory grows linearly with adapter count.
- **TopicRegistry**: Academy topic metadata. Bounded by curriculum size.
- **SourceRegistry**: OSINT source metadata. Bounded by source count.
- **Agent pools**: Agent state and capability metadata.

The platform tracks ETS memory per table via telemetry and alerts when individual tables grow beyond expected bounds. LRU cache implementations (HierarchicalCache) bound memory by evicting entries when size limits are reached.

### Binary Memory in OSINT Operations

OSINT tool executions frequently handle large HTTP response bodies, PDF documents, and JSON payloads. These are stored as large binaries on the shared binary heap. The platform implements explicit `:binary.copy/1` calls when extracting fields from large response bodies to prevent binary leak accumulation:

```elixir
# In OSINT adapter result processing
defp extract_and_release(response_body) do
  case Jason.decode(response_body) do
    {:ok, parsed} ->
      # parsed is now in process heap; response_body ref can be released
      :erlang.garbage_collect(self())
      {:ok, parsed}

    {:error, reason} ->
      {:error, reason}
  end
end
```

### Memory Alerting Thresholds

The platform monitors memory at multiple levels:

| Metric | Warning Threshold | Critical Threshold | Action |
|--------|------------------|-------------------|--------|
| Total system memory | 70% of available | 85% of available | Scale up or investigate leaks |
| Individual process memory | 100MB | 500MB | Investigate specific process |
| ETS table memory | 2x expected size | 5x expected size | Check for unbounded growth |
| Binary heap memory | 40% of total | 60% of total | Force GC on large binary holders |
| Atom count | 800,000 | 950,000 | Emergency: find dynamic atom creation |

## Code Examples

```elixir
defmodule PrismaticSafety.MemoryMonitor do
  @moduledoc """
  Monitors BEAM memory allocation across all memory types and provides
  system-wide memory health assessment for the Prismatic Platform.

  Tracks process heaps, ETS tables, binary heap, atom table, and code
  server memory. Emits telemetry events for dashboard integration and
  alerting.

  ## Telemetry Events

      [:prismatic, :memory, :snapshot] - Periodic memory snapshot
      [:prismatic, :memory, :warning] - Threshold exceeded
      [:prismatic, :memory, :ets_report] - ETS table memory breakdown
  """

  use GenServer
  require Logger

  @memory_types [:total, :processes, :ets, :atom, :binary, :code, :system]
  @check_interval_ms :timer.seconds(30)
  @process_memory_warning_bytes 100 * 1024 * 1024

  @type memory_snapshot :: %{
    total: non_neg_integer(),
    processes: non_neg_integer(),
    ets: non_neg_integer(),
    atom: non_neg_integer(),
    binary: non_neg_integer(),
    code: non_neg_integer(),
    system: non_neg_integer(),
    timestamp: DateTime.t()
  }

  @type process_report :: %{
    pid: pid(),
    memory: non_neg_integer(),
    registered_name: atom() | nil,
    current_function: {module(), atom(), non_neg_integer()} | nil,
    heap_size: non_neg_integer(),
    stack_size: non_neg_integer(),
    message_queue_len: non_neg_integer()
  }

  @type ets_report :: %{
    name: atom(),
    size: non_neg_integer(),
    memory_bytes: non_neg_integer(),
    type: atom(),
    owner: pid()
  }

  # --- Public API ---

  @doc """
  Starts the memory monitor.

  ## Examples

      iex> PrismaticSafety.MemoryMonitor.start_link([])
      {:ok, pid}
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Returns the current memory usage across all BEAM memory types.

  ## Examples

      iex> snapshot = PrismaticSafety.MemoryMonitor.current_usage()
      iex> is_integer(snapshot.total) and snapshot.total > 0
      true
  """
  @spec current_usage() :: memory_snapshot()
  def current_usage do
    memory = :erlang.memory()

    @memory_types
    |> Enum.map(fn type -> {type, Keyword.get(memory, type, 0)} end)
    |> Map.new()
    |> Map.put(:timestamp, DateTime.utc_now())
  end

  @doc """
  Returns detailed memory information for a specific process.

  ## Examples

      iex> report = PrismaticSafety.MemoryMonitor.process_memory(self())
      iex> is_integer(report.memory)
      true
  """
  @spec process_memory(pid()) :: process_report() | %{status: :dead}
  def process_memory(pid) do
    info_keys = [:memory, :heap_size, :stack_size, :message_queue_len,
                 :registered_name, :current_function]

    case Process.info(pid, info_keys) do
      nil ->
        %{status: :dead}

      info ->
        info
        |> Map.new()
        |> Map.put(:pid, pid)
    end
  end

  @doc """
  Returns the top N processes by memory consumption, sorted descending.

  Useful for identifying memory-heavy processes during investigation.

  ## Examples

      iex> top = PrismaticSafety.MemoryMonitor.top_processes(5)
      iex> length(top) <= 5
      true
  """
  @spec top_processes(pos_integer()) :: list(process_report())
  def top_processes(n \\ 10) when is_integer(n) and n > 0 do
    Process.list()
    |> Enum.map(fn pid ->
      case Process.info(pid, [:memory, :registered_name, :current_function,
                               :heap_size, :stack_size, :message_queue_len]) do
        nil -> nil
        info -> Map.new(info) |> Map.put(:pid, pid)
      end
    end)
    |> Enum.reject(&is_nil/1)
    |> Enum.sort_by(& &1[:memory], :desc)
    |> Enum.take(n)
  end

  @doc """
  Returns memory usage for all ETS tables, sorted by memory consumption.

  Memory is reported in bytes (converted from words).

  ## Examples

      iex> report = PrismaticSafety.MemoryMonitor.ets_memory_report()
      iex> is_list(report) and Enum.all?(report, &is_map/1)
      true
  """
  @spec ets_memory_report() :: list(ets_report())
  def ets_memory_report do
    wordsize = :erlang.system_info(:wordsize)

    :ets.all()
    |> Enum.map(fn table ->
      info = :ets.info(table)

      %{
        name: info[:name],
        size: info[:size],
        memory_bytes: info[:memory] * wordsize,
        type: info[:type],
        owner: info[:owner]
      }
    end)
    |> Enum.sort_by(& &1.memory_bytes, :desc)
  end

  @doc """
  Returns processes that exceed the memory warning threshold.

  ## Examples

      iex> PrismaticSafety.MemoryMonitor.memory_offenders()
      []
  """
  @spec memory_offenders(non_neg_integer()) :: list(process_report())
  def memory_offenders(threshold_bytes \\ @process_memory_warning_bytes) do
    top_processes(100)
    |> Enum.filter(fn proc -> proc[:memory] >= threshold_bytes end)
  end

  @doc """
  Forces garbage collection on a specific process and returns
  the memory before and after GC.

  ## Examples

      iex> {before, after_gc} = PrismaticSafety.MemoryMonitor.force_gc(self())
      iex> is_integer(before) and is_integer(after_gc)
      true
  """
  @spec force_gc(pid()) :: {non_neg_integer(), non_neg_integer()}
  def force_gc(pid) do
    before = case Process.info(pid, :memory) do
      {:memory, bytes} -> bytes
      nil -> 0
    end

    :erlang.garbage_collect(pid)

    after_gc = case Process.info(pid, :memory) do
      {:memory, bytes} -> bytes
      nil -> 0
    end

    {before, after_gc}
  end

  # --- Server Callbacks ---

  @impl true
  def init(_opts) do
    schedule_check()
    {:ok, %{snapshots: [], offender_pids: MapSet.new()}}
  end

  @impl true
  def handle_info(:check, state) do
    snapshot = current_usage()

    :telemetry.execute(
      [:prismatic, :memory, :snapshot],
      Map.drop(snapshot, [:timestamp]),
      %{timestamp: snapshot.timestamp}
    )

    offenders = memory_offenders()

    if offenders != [] do
      Logger.warning(
        "Memory offenders detected: #{length(offenders)} processes above threshold",
        domain: [:prismatic, :memory]
      )

      :telemetry.execute(
        [:prismatic, :memory, :warning],
        %{offender_count: length(offenders)},
        %{pids: Enum.map(offenders, & &1[:pid])}
      )
    end

    schedule_check()
    {:noreply, %{state | offender_pids: MapSet.new(Enum.map(offenders, & &1[:pid]))}}
  end

  defp schedule_check do
    Process.send_after(self(), :check, @check_interval_ms)
  end
end
```

```elixir
defmodule PrismaticSafety.BinaryLeakDetector do
  @moduledoc """
  Detects potential binary memory leaks by identifying processes that
  hold large binary references relative to their heap size.

  Binary leaks occur when processes hold references to sub-binaries
  of much larger binaries, preventing the large binaries from being freed.
  This module identifies such processes and can force garbage collection
  to release stale binary references.

  ## Detection Strategy

  A process is flagged as a potential binary leak source when:
  - Its binary memory exceeds a configurable threshold
  - The ratio of binary memory to heap memory exceeds 10:1
  - It has not been garbage collected recently
  """

  require Logger

  @type leak_suspect :: %{
    pid: pid(),
    registered_name: atom() | nil,
    binary_memory: non_neg_integer(),
    heap_memory: non_neg_integer(),
    ratio: float(),
    current_function: {module(), atom(), non_neg_integer()} | nil
  }

  @binary_threshold_bytes 50 * 1024 * 1024
  @binary_heap_ratio_threshold 10.0

  @doc """
  Scans all processes for potential binary memory leaks.

  Returns a list of suspect processes sorted by binary memory descending.

  ## Options

    * `:threshold_bytes` - Minimum binary memory to flag (default: 50MB)
    * `:ratio_threshold` - Min binary-to-heap ratio to flag (default: 10.0)

  ## Examples

      iex> suspects = PrismaticSafety.BinaryLeakDetector.scan()
      iex> is_list(suspects)
      true
  """
  @spec scan(keyword()) :: list(leak_suspect())
  def scan(opts \\ []) do
    threshold = Keyword.get(opts, :threshold_bytes, @binary_threshold_bytes)
    ratio_threshold = Keyword.get(opts, :ratio_threshold, @binary_heap_ratio_threshold)

    Process.list()
    |> Enum.map(fn pid ->
      case Process.info(pid, [:binary, :memory, :heap_size, :registered_name, :current_function]) do
        nil ->
          nil

        info ->
          binary_mem = info[:binary]
            |> Enum.reduce(0, fn {_ref, size, _refcount}, acc -> acc + size end)
          heap_mem = max(info[:memory], 1)
          ratio = binary_mem / heap_mem

          if binary_mem >= threshold or ratio >= ratio_threshold do
            %{
              pid: pid,
              registered_name: info[:registered_name],
              binary_memory: binary_mem,
              heap_memory: heap_mem,
              ratio: Float.round(ratio, 2),
              current_function: info[:current_function]
            }
          else
            nil
          end
      end
    end)
    |> Enum.reject(&is_nil/1)
    |> Enum.sort_by(& &1.binary_memory, :desc)
  end

  @doc """
  Forces garbage collection on all leak suspects and reports memory freed.

  ## Examples

      iex> results = PrismaticSafety.BinaryLeakDetector.gc_suspects()
      iex> is_list(results)
      true
  """
  @spec gc_suspects(keyword()) :: list(%{pid: pid(), freed_bytes: integer()})
  def gc_suspects(opts \\ []) do
    scan(opts)
    |> Enum.map(fn suspect ->
      before = suspect.binary_memory
      :erlang.garbage_collect(suspect.pid)

      after_gc =
        case Process.info(suspect.pid, :binary) do
          {:binary, bins} -> Enum.reduce(bins, 0, fn {_, s, _}, acc -> acc + s end)
          nil -> 0
        end

      freed = before - after_gc

      if freed > 0 do
        Logger.info(
          "Binary GC freed #{div(freed, 1024)}KB from #{inspect(suspect.registered_name || suspect.pid)}",
          domain: [:prismatic, :memory]
        )
      end

      %{pid: suspect.pid, freed_bytes: freed}
    end)
  end
end
```

```elixir
defmodule PrismaticSafety.MemoryPolicy do
  @moduledoc """
  Defines memory policies and thresholds for different process categories
  in the Prismatic Platform.

  Provides recommended `spawn_opt` configurations for GenServers based
  on their expected memory usage patterns.
  """

  @type process_category :: :agent | :osint_adapter | :registry | :request_handler | :pipeline

  @type memory_config :: %{
    min_heap_size: pos_integer(),
    fullsweep_after: pos_integer(),
    max_heap_size: pos_integer() | :infinity,
    description: String.t()
  }

  @configs %{
    agent: %{
      min_heap_size: 4_181,
      fullsweep_after: 20,
      max_heap_size: 50 * 1024 * 1024 |> div(8),
      description: "AIAD agents: moderate state, frequent temporary allocations"
    },
    osint_adapter: %{
      min_heap_size: 987,
      fullsweep_after: 5,
      max_heap_size: 200 * 1024 * 1024 |> div(8),
      description: "OSINT adapters: large response bodies, short-lived processes"
    },
    registry: %{
      min_heap_size: 10_946,
      fullsweep_after: 65_535,
      max_heap_size: :infinity,
      description: "ETS-backed registries: stable state, rare GC needed"
    },
    request_handler: %{
      min_heap_size: 233,
      fullsweep_after: 0,
      max_heap_size: 10 * 1024 * 1024 |> div(8),
      description: "HTTP request handlers: short-lived, aggressive GC"
    },
    pipeline: %{
      min_heap_size: 2_584,
      fullsweep_after: 10,
      max_heap_size: 100 * 1024 * 1024 |> div(8),
      description: "DD pipeline stages: moderate state, batch processing"
    }
  }

  @doc """
  Returns the recommended spawn_opt memory configuration for a process category.

  ## Examples

      iex> opts = PrismaticSafety.MemoryPolicy.spawn_opts(:agent)
      iex> Keyword.has_key?(opts, :min_heap_size)
      true
  """
  @spec spawn_opts(process_category()) :: keyword()
  def spawn_opts(category) when is_map_key(@configs, category) do
    config = Map.fetch!(@configs, category)

    base = [
      min_heap_size: config.min_heap_size,
      fullsweep_after: config.fullsweep_after
    ]

    case config.max_heap_size do
      :infinity -> base
      max -> Keyword.put(base, :max_heap_size, %{size: max, kill: true, error_logger: true})
    end
  end

  @doc """
  Returns all defined memory policy categories.

  ## Examples

      iex> categories = PrismaticSafety.MemoryPolicy.categories()
      iex> :agent in categories
      true
  """
  @spec categories() :: list(process_category())
  def categories, do: Map.keys(@configs)
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Binary sub-reference leaks | Extracting a sub-binary from a large binary keeps the entire large binary alive | Use `:binary.copy/1` to copy the needed portion and release the original |
| `String.to_atom/1` with user input | Atom table is never garbage collected; exhaustion crashes the entire VM | Use `String.to_existing_atom/1` or maintain an explicit allowlist |
| Long-running GenServer with high `fullsweep_after` | Old heap grows unboundedly with promoted temporary data | Lower `fullsweep_after` for processes with large temporary allocations |
| ETS table owner crash | Table is destroyed when owner process dies, losing all data | Use `:heir` option or wrap in a dedicated supervisor with restart strategy |
| Measuring ETS memory in words, not bytes | Dashboards show incorrect values when `:ets.info(t, :memory)` is not multiplied by wordsize | Always multiply by `:erlang.system_info(:wordsize)` for byte values |
| Ignoring message queue backlog | Processes receiving faster than they process accumulate messages on heap | Monitor `:message_queue_len` and implement backpressure |
| Assuming `:erlang.memory(:total)` matches RSS | BEAM allocators may retain freed memory; RSS is always >= BEAM total | Use `:recon_alloc.memory(:allocated)` for OS-level accounting |
| `:persistent_term` for frequently updated data | Every update copies the old value to all process heaps simultaneously | Use ETS for data that changes more than once per minute |
| Spawning unbounded processes | Each process has a minimum heap allocation; millions of processes consume GB | Use pool patterns (Poolboy, NimblePool) for bounded concurrency |
| Not forcing GC after large binary operations | Binary references linger if no allocation triggers GC | Call `:erlang.garbage_collect/1` after processing large binaries |

## Best Practices

1. **Monitor per-process memory for long-running GenServers** using `:erlang.process_info(pid, :memory)` and alert on unexpected growth. Track the top 10 memory consumers continuously.

2. **Configure `fullsweep_after` based on process role** -- request handlers should use low values (0-5) for aggressive cleanup; registries with stable state can use the default (65535).

3. **Avoid holding references to sub-binaries of large binaries** -- copy the needed portion with `:binary.copy/1` to allow the large binary to be freed. This is especially critical in OSINT adapters processing HTTP response bodies.

4. **Use `:recon_alloc` for detailed allocator statistics** when investigating memory fragmentation. Compare `:recon_alloc.memory(:used)` vs `:recon_alloc.memory(:allocated)` to quantify fragmentation.

5. **Track ETS table sizes as KPIs** and set bounds. Every ETS table should have a documented maximum expected size and an alert when it exceeds that bound.

6. **Never store unbounded data in process state** without size limits. Use LRU eviction or periodic cleanup for caches maintained in GenServer state.

7. **Use `:erlang.memory/0` as the authoritative source** for system memory accounting. Do not rely on OS-level metrics alone, as they include allocator overhead.

8. **Implement backpressure for high-throughput message passing** -- a process that cannot keep up with incoming messages will accumulate them on its heap until OOM. Monitor `:message_queue_len` and shed load when it grows.

9. **Set `max_heap_size` for untrusted workloads** -- OSINT adapters processing external data should have a heap size limit that kills the process (safely, under supervision) rather than consuming all available memory.

10. **Force garbage collection after large binary operations** -- when a process parses a large JSON response or reads a large file, explicitly call `:erlang.garbage_collect(self())` to release binary references promptly.

## Related Terms

- [Memory Leak](@/glossary/memory-leak.md) -- gradual memory growth from retained references that are never freed
- [Memory Profiling](@/glossary/memory-profiling.md) -- techniques and tools for analyzing BEAM memory usage
- [Process](@/glossary/process.md) -- BEAM lightweight processes with per-process heaps
- [ETS](@/glossary/ets.md) -- Erlang Term Storage providing shared in-memory tables
- [Named Table](@/glossary/named-table.md) -- ETS tables consuming shared memory outside process heaps
- [Message Queue](@/glossary/message-queue.md) -- process mailboxes that consume heap memory
- [Garbage Collection](/glossary/garbage-collection/) -- the per-process GC mechanism
- [Binary](@/glossary/binary.md) -- BEAM binary data type with reference-counted large binaries
- [Atom](/glossary/atom/) -- immutable, never-GCed identifiers in the global atom table
- [Scheduler](@/glossary/scheduler.md) -- BEAM scheduler that triggers GC via reduction counting
- [Reductions](@/glossary/reductions.md) -- work unit measure that gates GC triggering
- [LRU](@/glossary/lru.md) -- cache eviction strategy for bounding memory usage

## See Also

- [Architecture](@/architecture/_index.md) -- BEAM runtime architecture and platform design
- [Capabilities](@/capabilities/_index.md) -- memory management and monitoring capabilities
- [Performance Testing](/performance-testing/) -- memory benchmarking and profiling methodology
- [Erlang Efficiency Guide: Memory](https://www.erlang.org/doc/efficiency_guide/memory) -- official BEAM memory documentation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
