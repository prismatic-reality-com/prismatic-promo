+++
title = "Memory Leak"
weight = 50

[extra]
description = "A memory leak is a condition where a program progressively consumes more memory over time due to retained references to data that is no longer needed, eventually leading to performance degradation, OOM kills, or system crashes"
category = "platform"
domain = "runtime-diagnostics"
complexity = "intermediate-advanced"
stability = "stable"
beam_related = true
related_terms = ["memory", "memory-profiling", "process", "message-queue", "named-table", "profiling", "ets", "genserver", "binary", "erlang", "backpressure", "pubsub"]
tags = ["glossary", "memory-leak", "debugging", "performance", "beam", "garbage-collection", "diagnostics", "mailbox", "binary-reference", "ets-growth", "atom-exhaustion", "recon", "observer", "genserver-state", "disk-janitor", "heap-profiling"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "intermediate"
quality_score = 96
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "In BEAM systems, memory leaks typically manifest as growing process mailboxes, unbounded ETS tables, or binary reference retention rather than traditional unreachable-object leaks"
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["memory leak", "memory growth", "resource leak", "binary leak", "mailbox overflow", "ETS growth", "OOM", "memory exhaustion", "recon", "observer", "heap profiling", "atom table"]
image = "/images/sections/glossary.png"
image_alt = "Memory Leak - Prismatic Platform"
word_count = 3600
see_also = ["capabilities", "architecture", "performance-testing", "profiling"]
+++

## Definition

A memory leak occurs when a program allocates memory that is never freed, causing the program's memory consumption to grow monotonically over time. In garbage-collected languages like Elixir, memory leaks are not caused by forgetting to call `free()` (as in C/C++) but rather by retaining references to data that is no longer semantically needed -- the garbage collector sees the data as reachable and cannot reclaim it. Over hours or days, this gradual growth exhausts available memory, triggering OOM (Out of Memory) kills, swap thrashing, or cascading failures.

In BEAM systems, the per-process heap model localizes most memory issues to individual processes: a leaking process grows its own heap without affecting others. When the process is killed (by a supervisor, for example), its memory is instantly reclaimed. However, certain BEAM-specific leak patterns -- atom table growth, ETS table accumulation, and shared binary reference retention -- affect system-wide memory and are not contained to any single process.

Understanding BEAM-specific leak patterns is critical for operating the Prismatic Platform in production, where long-running GenServers (ToolRegistry, TopicRegistry, SourceRegistry, Quality Floor Guardian) must maintain stable memory profiles across weeks of uptime.

## Core Concepts

### BEAM Memory Architecture

The BEAM virtual machine organizes memory into distinct regions, each with different leak characteristics:

| Memory Region | GC Model | Leak Pattern | Detection Method |
|--------------|----------|-------------|-----------------|
| **Process heap** | Per-process generational GC | State accumulation, closure capture | `Process.info(pid, :memory)` |
| **Process mailbox** | Part of process heap | Unprocessed message accumulation | `Process.info(pid, :message_queue_len)` |
| **ETS tables** | No GC (manual delete only) | Unbounded insert without cleanup | `:ets.info(table, :memory)` |
| **Atom table** | Never collected | `String.to_atom/1` on untrusted input | `:erlang.system_info(:atom_count)` |
| **Binary heap** | Reference-counted shared heap | Sub-binary reference retention | `:recon.bin_leak(n)` |
| **Code server** | Manual purge | Repeated hot code loading | `:erlang.memory(:code)` |
| **NIF memory** | NIF-managed | Resource not freed in NIF destructor | `:erlang.memory(:system)` |

### Leak Categories by Severity

| Category | Time to Impact | Memory Growth Rate | Containment | Recovery |
|----------|---------------|-------------------|-------------|----------|
| **Process mailbox** | Minutes to hours | Fast (msg/sec * msg_size) | Single process | Kill the process |
| **GenServer state** | Hours to days | Slow (proportional to events) | Single process | Kill and restart |
| **Binary reference** | Hours to days | Moderate (binary sizes) | Per-process, but binaries shared | GC the holding process |
| **ETS table** | Days to weeks | Slow (entry accumulation) | System-wide | Delete entries or table |
| **Atom table** | Days to weeks | Slow (unique strings) | System-wide (VM crash) | Cannot recover, must restart VM |

## Technical Deep Dive

### Mailbox Accumulation

A process receives messages faster than it processes them. The mailbox grows without bound, consuming heap memory. This is especially dangerous for GenServers that handle cast operations -- since casts are fire-and-forget, the sender has no backpressure mechanism. Monitoring `:message_queue_len` is the primary detection method.

**Root causes:**
- Slow `handle_cast/2` with fast producers
- Missing `handle_info/2` clause (messages accumulate unmatched)
- Selective receive scanning in GenServer (matching only specific patterns)
- PubSub subscription to high-volume topics without adequate processing speed

**Detection:**
```elixir
# Find processes with large mailboxes
Process.list()
|> Enum.map(fn pid ->
  case Process.info(pid, [:message_queue_len, :registered_name, :memory]) do
    nil -> nil
    info -> {pid, info}
  end
end)
|> Enum.reject(&is_nil/1)
|> Enum.filter(fn {_pid, info} -> info[:message_queue_len] > 1000 end)
|> Enum.sort_by(fn {_pid, info} -> info[:message_queue_len] end, :desc)
```

### Binary Reference Retention

A process extracts a small sub-binary from a large binary (e.g., parsing the first 100 bytes of a 10MB HTTP response). The sub-binary holds a reference to the entire original binary, preventing its garbage collection. The fix is `:binary.copy/1` on the sub-binary, which creates an independent copy and releases the large binary reference.

**Why this happens on the BEAM:**

Large binaries (> 64 bytes) are stored on a shared reference-counted heap, not on process heaps. When you extract a sub-binary with `binary_part/3` or pattern matching, the result references the original binary's memory. The original cannot be freed until all references are gone.

| Operation | Creates Reference? | Fix |
|-----------|-------------------|-----|
| `binary_part(big, 0, 100)` | Yes | `:binary.copy(result)` |
| `<<prefix::binary-size(100), _rest::binary>> = big` | Yes | `:binary.copy(prefix)` |
| `String.slice(big, 0, 100)` | Yes | `:binary.copy(result)` |
| `:binary.copy(sub)` | No (independent copy) | Already safe |
| `Jason.decode!(json_binary)` | Depends on implementation | Check library docs |

### ETS Table Growth

ETS tables are not garbage collected -- entries persist until explicitly deleted. A process that inserts records without a corresponding cleanup mechanism creates unbounded ETS growth. This is especially insidious because ETS memory is shared and not attributable to any specific process in standard monitoring tools.

**Common patterns:**
- Cache without TTL expiration
- Event log without size-based rotation
- Session store without cleanup on logout/timeout
- Registry that never removes entries for dead processes

**Bounded ETS patterns:**

| Pattern | Mechanism | Prismatic Usage |
|---------|-----------|-----------------|
| **TTL expiration** | Periodic sweep deleting entries older than TTL | Cachex (built-in TTL) |
| **LRU eviction** | Track access time, evict least-recently-used when size exceeds limit | HierarchicalCache L1 |
| **Size-capped ring** | Overwrite oldest when reaching max entries | StreamLoggerBackend |
| **Process-linked** | Delete entries when owning process dies (`heir` option) | Agent registries |
| **Periodic full purge** | Delete all entries on a schedule | DiskJanitor pattern |

### Atom Table Exhaustion

Atoms are never garbage collected in the BEAM. Converting untrusted user input to atoms via `String.to_atom/1` (instead of `String.to_existing_atom/1`) can exhaust the atom table (default limit: 1,048,576 atoms), crashing the entire VM with no recovery possible.

**Dangerous patterns:**
```elixir
# BANNED: Creates atoms from user input
String.to_atom(user_params["field_name"])
Jason.decode!(json, keys: :atoms)

# SAFE: Only converts to known atoms
String.to_existing_atom(user_params["field_name"])
Jason.decode!(json, keys: :atoms!)  # raises on unknown keys
Jason.decode!(json)  # keeps string keys (safest)
```

### GenServer State Growth

Long-running GenServers that accumulate data in their state without bounds are a subtle leak pattern. The state grows with each event, but since the process is alive and the data is reachable, the GC cannot help.

**Common anti-patterns:**
- Appending to a list in state on every event
- Storing all historical values instead of aggregates
- Caching results in state without eviction
- Accumulating error logs in state

### Detection Tools

| Tool | Type | What It Shows | When to Use |
|------|------|--------------|-------------|
| `:observer` | GUI | Process list, memory, message queues | Interactive debugging |
| `:recon` | Library | `bin_leak/1`, `proc_count/2`, `info/1` | Production diagnosis |
| `:recon_trace` | Library | Function call tracing with rate limiting | Call pattern analysis |
| `:erlang.memory/0` | Built-in | Total memory by category | Baseline monitoring |
| `Process.info/2` | Built-in | Per-process memory, mailbox, state | Targeted investigation |
| `:ets.info/2` | Built-in | Table size, memory consumption | ETS leak detection |
| `:instrument` | Built-in | Memory allocation tracking | Deep allocation analysis |
| `:msacc` | Built-in | Microstate accounting | Scheduler/GC time analysis |

### Heap Profiling with :recon

The `:recon` library is the primary tool for diagnosing memory leaks in production BEAM systems:

```elixir
# Top 10 processes by memory usage
:recon.proc_count(:memory, 10)

# Top 10 processes by binary memory (detects binary leaks)
:recon.proc_count(:binary_memory, 10)

# Find processes holding references to large binaries
:recon.bin_leak(10)

# Detailed info about a specific process
:recon.info(pid, [:memory_used, :messages, :links])

# Scheduler utilization (detect GC-heavy processes)
:recon.scheduler_usage(1000)
```

## Advanced Topics

### Memory Budget Enforcement

Production systems should enforce per-process memory budgets to prevent a single leaking process from consuming all available memory:

| Enforcement Level | Mechanism | Action |
|------------------|-----------|--------|
| **Warning** | Periodic check via `:erlang.memory/0` | Log warning, emit telemetry |
| **Throttle** | Process.info check before processing | Reduce incoming work rate |
| **Kill** | GenServer with `max_heap_size` option | OTP kills the process |
| **Restart** | Supervisor restart strategy | Automatic recovery |

OTP 19+ supports `max_heap_size` as a process spawn option:
```elixir
# Kill the process if heap exceeds 50MB
spawn_opt(fn -> do_work() end, max_heap_size: %{size: 50_000_000, kill: true, error_logger: true})
```

### Binary Leak Investigation Workflow

1. **Confirm binary memory growth**: Check `:erlang.memory(:binary)` over time
2. **Identify holding processes**: Run `:recon.bin_leak(20)` to find top binary holders
3. **Inspect process state**: Use `:recon.info(pid)` to examine the suspect
4. **Check for sub-binary patterns**: Look for `binary_part`, pattern match extraction
5. **Apply `:binary.copy/1`**: Copy extracted sub-binaries to release references
6. **Force GC if needed**: `:erlang.garbage_collect(pid)` to reclaim immediately
7. **Verify**: Confirm `:erlang.memory(:binary)` stabilizes

### DiskJanitor as Cleanup Pattern

The Prismatic Platform's DiskJanitor module exemplifies the bounded cleanup pattern. It periodically scans configured directories for files exceeding age or size thresholds and removes them. This same pattern applies to in-memory cleanup:

- **Periodic sweep**: Use `Process.send_after/3` for recurring cleanup
- **Bounded accumulation**: Set hard limits on collection sizes
- **TTL-based expiry**: Tag entries with creation time, delete when expired
- **LRU eviction**: Track access order, evict least-recently-used entries

## Usage in Prismatic Platform

The Prismatic Platform's Memory Safety quality domain (0 violations) specifically targets memory leak prevention. The quality gates enforce: no `String.to_atom/1` on untrusted input, no unbounded process state growth, ETS table size monitoring, and binary reference hygiene.

For long-running GenServers (ToolRegistry, TopicRegistry, SourceRegistry, Quality Floor Guardian), the platform mandates bounded state and periodic cleanup. The DD pipeline's Scheduler GenServer uses `Process.send_after/3` for periodic operations rather than storing pending work in state, preventing accumulation.

OSINT tool execution processes are short-lived (spawned per execution, terminated on completion), making them inherently leak-resistant. This ephemeral process pattern is the strongest defense against memory leaks -- processes that do not live long enough to accumulate significant memory.

The platform's `StreamLoggerBackend` uses a size-capped ring buffer in ETS to store recent log entries for the Error Feed dashboard. When the buffer reaches its maximum size, the oldest entries are overwritten, guaranteeing bounded memory usage regardless of log volume.

The HierarchicalCache system (ETS -> Cachex -> external) implements TTL-based expiry at each level, preventing cache entries from accumulating indefinitely. Cachex provides built-in TTL support; the ETS L1 layer uses periodic sweep cleanup.

## Code Examples

```elixir
defmodule PrismaticSafety.MemoryLeakDetector do
  @moduledoc """
  Detects common memory leak patterns in running BEAM processes.

  Provides diagnostic functions for identifying:
  - Mailbox accumulation (unprocessed messages)
  - ETS table growth (unbounded inserts)
  - Binary reference retention (sub-binary leaks)
  - Process heap growth (state accumulation)

  Designed for production use with :recon integration
  and telemetry event emission.

  ## Examples

      PrismaticSafety.MemoryLeakDetector.detect_mailbox_leaks()
      # => [%{pid: #PID<0.500.0>, registered_name: :slow_worker, message_queue_len: 5432}]

      PrismaticSafety.MemoryLeakDetector.detect_ets_growth(:my_cache, 100_000)
      # => {:warning, %{table: :my_cache, current_size: 150_000, max_size: 100_000}}
  """

  require Logger

  @doc """
  Find processes with mailboxes exceeding the threshold.

  Returns a list of process info maps sorted by mailbox size,
  largest first. Each map includes pid, registered name (if any),
  memory usage, and message queue length.

  ## Parameters

    - `threshold` - Minimum message queue length to report (default: 1000)

  ## Examples

      iex> PrismaticSafety.MemoryLeakDetector.detect_mailbox_leaks(500)
      [%{pid: #PID<0.500.0>, message_queue_len: 5432, memory: 2_400_000}]
  """
  @spec detect_mailbox_leaks(pos_integer()) :: list(map())
  def detect_mailbox_leaks(threshold \\ 1000) do
    results =
      Process.list()
      |> Enum.map(fn pid ->
        case Process.info(pid, [:message_queue_len, :registered_name, :memory]) do
          nil -> nil
          info -> Map.new(info) |> Map.put(:pid, pid)
        end
      end)
      |> Enum.reject(&is_nil/1)
      |> Enum.filter(&(&1.message_queue_len > threshold))
      |> Enum.sort_by(& &1.message_queue_len, :desc)

    if results != [] do
      :telemetry.execute(
        [:prismatic, :memory, :mailbox_leak],
        %{count: length(results), max_queue: hd(results).message_queue_len},
        %{}
      )
    end

    results
  end

  @doc """
  Check if an ETS table exceeds its size budget.

  Returns `:ok` if within bounds, or `{:warning, details}` with
  current size, max size, and memory consumption in bytes.

  ## Parameters

    - `table` - ETS table name or reference
    - `max_size` - Maximum allowed entry count

  ## Examples

      iex> PrismaticSafety.MemoryLeakDetector.detect_ets_growth(:my_cache, 10_000)
      :ok
  """
  @spec detect_ets_growth(atom(), pos_integer()) :: :ok | {:warning, map()}
  def detect_ets_growth(table, max_size) do
    current_size = :ets.info(table, :size)

    if current_size > max_size do
      details = %{
        table: table,
        current_size: current_size,
        max_size: max_size,
        memory_bytes: :ets.info(table, :memory) * :erlang.system_info(:wordsize),
        overflow_pct: Float.round((current_size - max_size) / max_size * 100, 1)
      }

      Logger.warning("ETS table exceeds size budget",
        table: table,
        size: current_size,
        max: max_size
      )

      {:warning, details}
    else
      :ok
    end
  end

  @doc """
  Safe binary handling that prevents reference retention leaks.

  When extracting a portion of a large binary, the sub-binary
  retains a reference to the entire original. This function
  creates an independent copy, allowing the original to be GC'd.

  ## Parameters

    - `large_binary` - The source binary
    - `offset` - Starting byte position
    - `length` - Number of bytes to extract

  ## Examples

      iex> big = :crypto.strong_rand_bytes(10_000_000)
      iex> small = PrismaticSafety.MemoryLeakDetector.safe_binary_extract(big, 0, 100)
      iex> byte_size(small)
      100
  """
  @spec safe_binary_extract(binary(), non_neg_integer(), non_neg_integer()) :: binary()
  def safe_binary_extract(large_binary, offset, length) do
    large_binary
    |> binary_part(offset, length)
    |> :binary.copy()
  end

  @doc """
  Detect processes with excessive binary memory retention.

  Uses :recon.bin_leak to find processes holding references
  to large binaries that could be released.

  ## Parameters

    - `count` - Number of top processes to return (default: 10)

  ## Examples

      iex> PrismaticSafety.MemoryLeakDetector.detect_binary_leaks(5)
      [{#PID<0.500.0>, -2_400_000, [{:registered_name, :http_handler}]}]
  """
  @spec detect_binary_leaks(pos_integer()) :: list()
  def detect_binary_leaks(count \\ 10) do
    :recon.bin_leak(count)
  rescue
    UndefinedFunctionError ->
      Logger.warning("recon not available, skipping binary leak detection")
      []
  end

  @doc """
  Generate a comprehensive memory health report.

  Aggregates all leak detection checks into a single report
  suitable for monitoring dashboards and alerting.
  """
  @spec health_report(keyword()) :: map()
  def health_report(opts \\ []) do
    mailbox_threshold = Keyword.get(opts, :mailbox_threshold, 1000)

    system_memory = :erlang.memory()

    %{
      timestamp: DateTime.utc_now(),
      system_memory: %{
        total: system_memory[:total],
        processes: system_memory[:processes],
        ets: system_memory[:ets],
        binary: system_memory[:binary],
        atom: system_memory[:atom],
        code: system_memory[:code]
      },
      atom_count: :erlang.system_info(:atom_count),
      atom_limit: :erlang.system_info(:atom_limit),
      atom_usage_pct: Float.round(
        :erlang.system_info(:atom_count) / :erlang.system_info(:atom_limit) * 100, 2
      ),
      process_count: :erlang.system_info(:process_count),
      process_limit: :erlang.system_info(:process_limit),
      mailbox_leaks: detect_mailbox_leaks(mailbox_threshold),
      status: determine_health_status(system_memory)
    }
  end

  defp determine_health_status(memory) do
    atom_usage = :erlang.system_info(:atom_count) / :erlang.system_info(:atom_limit)

    cond do
      atom_usage > 0.8 -> :critical
      memory[:binary] > 1_000_000_000 -> :warning
      memory[:ets] > 500_000_000 -> :warning
      true -> :healthy
    end
  end
end
```

```elixir
defmodule PrismaticSafety.BoundedState do
  @moduledoc """
  Helpers for implementing bounded GenServer state patterns.

  Prevents state accumulation leaks by providing data structures
  with built-in size limits and eviction policies.

  ## Usage

  Use these helpers inside GenServer state to prevent unbounded growth:

      defmodule MyServer do
        use GenServer

        def init(_) do
          {:ok, %{events: BoundedState.new_ring(1000)}}
        end

        def handle_info({:event, data}, state) do
          events = BoundedState.ring_push(state.events, data)
          {:noreply, %{state | events: events}}
        end
      end
  """

  @doc """
  Create a new bounded ring buffer backed by a queue.

  When the buffer is full, the oldest element is discarded
  to make room for the new one.
  """
  @spec new_ring(pos_integer()) :: %{queue: :queue.queue(), max: pos_integer(), size: non_neg_integer()}
  def new_ring(max_size) when max_size > 0 do
    %{queue: :queue.new(), max: max_size, size: 0}
  end

  @doc """
  Push a value onto the ring buffer, evicting the oldest if full.
  """
  @spec ring_push(map(), term()) :: map()
  def ring_push(%{queue: queue, max: max, size: size} = ring, value) do
    if size >= max do
      {_oldest, queue} = :queue.out(queue)
      %{ring | queue: :queue.in(value, queue)}
    else
      %{ring | queue: :queue.in(value, queue), size: size + 1}
    end
  end

  @doc """
  Convert ring buffer contents to a list (oldest first).
  """
  @spec ring_to_list(map()) :: list()
  def ring_to_list(%{queue: queue}) do
    :queue.to_list(queue)
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| `String.to_atom/1` on user input | Atom table exhaustion crashes the entire VM | Use `String.to_existing_atom/1` or maintain a fixed atom allowlist |
| GenServer state grows with every event | Process heap grows monotonically, eventually OOM | Use bounded collections (ring buffer, LRU cache) in state |
| ETS inserts without cleanup | Table grows without bound, consuming system memory | Implement TTL expiry, size caps, or periodic purge |
| Sub-binary extraction without copy | Holds reference to entire large binary | Apply `:binary.copy/1` to extracted sub-binaries |
| Missing `handle_info/2` clause | Unmatched messages accumulate in mailbox | Add catch-all `handle_info` that logs and discards unknown messages |
| `GenServer.cast/2` to slow consumers | No backpressure; mailbox grows unbounded | Use `GenServer.call/3` for backpressure, or check queue length before cast |
| Caching without eviction | Cache grows to fill available memory | Use Cachex with TTL, or implement LRU with size bounds |
| `Jason.decode!(json, keys: :atoms)` | Creates atoms from JSON keys (untrusted input) | Use `keys: :atoms!` (existing only) or keep string keys |
| Long-lived process without periodic GC | Garbage accumulates across generations | Set `fullsweep_after` or call `:erlang.garbage_collect/1` periodically |
| No monitoring for memory trends | Leaks go undetected until OOM kill | Monitor `:erlang.memory/0` trends, alert on monotonic growth |

## Best Practices

1. **Monitor `:message_queue_len`** for all long-running GenServers and alert when it exceeds thresholds (1000 warning, 10000 critical).
2. **Use `:binary.copy/1`** when extracting small portions from large binaries to prevent reference retention.
3. **Set ETS table size bounds** and implement cleanup policies (TTL expiration, LRU eviction, periodic purge).
4. **Never convert untrusted strings to atoms** -- use `String.to_existing_atom/1` or maintain a fixed atom mapping.
5. **Use `:recon.bin_leak/1`** to identify processes holding references to large binaries in production.
6. **Implement periodic memory snapshots** and compare trends -- a healthy system's memory oscillates; a leaking system trends upward.
7. **Kill and restart long-running processes periodically** if leak sources cannot be eliminated immediately (supervisor with `:transient` restart).
8. **Use bounded state patterns** (ring buffers, LRU maps, capped queues) for all GenServer state that accumulates data.
9. **Set `max_heap_size`** on processes that handle untrusted input to prevent a single request from consuming all memory.
10. **Add a catch-all `handle_info/2`** to every GenServer that logs and discards unexpected messages, preventing silent mailbox accumulation.

## Related Terms

- [Memory](/glossary/memory/) -- BEAM memory architecture and allocation model
- [Memory Profiling](/glossary/memory-profiling/) -- tools and techniques for investigating memory usage
- [Process](/glossary/process/) -- BEAM processes whose heaps can leak
- [Message Queue](/glossary/message-queue/) -- mailbox accumulation as a primary leak vector
- [ETS](/glossary/ets/) -- Erlang Term Storage tables prone to unbounded growth
- [GenServer](/glossary/genserver/) -- OTP abstraction where state growth leaks manifest
- [Binary](/glossary/binary/) -- binary data type with shared-heap reference counting
- [Erlang](/glossary/erlang/) -- BEAM VM providing the memory model and GC
- [Backpressure](/glossary/backpressure/) -- flow control preventing mailbox overflow
- [PubSub](/glossary/pubsub/) -- publish-subscribe system where subscribers can leak if slow
- [Profiling](/glossary/profiling/) -- general performance profiling including memory analysis
- [Named Table](/glossary/named-table/) -- named ETS tables as a leak-prone resource

## See Also

- [Architecture](/architecture/) -- fault-tolerant architecture preventing leak impact
- [Capabilities](/capabilities/) -- memory safety and monitoring capabilities
- [Performance Standards](/architecture/) -- memory budget targets for production
- [:recon documentation](https://ferd.github.io/recon/) -- production BEAM diagnostics library

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
