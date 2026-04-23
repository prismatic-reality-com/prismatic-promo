+++
title = "Constant Time"
weight = 50
[extra]
tags = ["glossary", "performance", "algorithms", "security", "complexity"]
description = "Constant time (O(1)) algorithms and operations execute in a fixed duration regardless of input size, providing predictable performance guarantees and security properties essential for real-time systems, cryptographic operations, and high-throughput platform architectures."
category = "performance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "performance-engineering"
related_concepts = ["algorithmic complexity", "Big-O notation", "hash tables", "ETS lookup", "timing attacks", "performance optimization", "cache-oblivious algorithms", "amortized analysis"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = "advanced"
prerequisites = ["algorithmic-consistency", "performance", "concurrency", "ets"]
learning_path = ["performance", "ets-table", "caching", "latency", "throughput"]
interactive_demos = ["constant-time-lookup-benchmark", "ets-vs-map-comparison", "timing-attack-demonstration"]
code_examples = true
external_resources = ["https://en.wikipedia.org/wiki/Time_complexity#Constant_time", "https://www.erlang.org/doc/man/ets.html", "https://hexdocs.pm/elixir/Map.html"]
version_introduced = "gen-8"
stability_level = "stable"
testing_scenarios = ["O(1) ETS lookup under load", "hash collision resistance", "constant-time comparison for secrets", "benchmark regression detection"]
keywords = ["constant time", "O(1)", "algorithmic complexity", "ETS", "hash table", "timing attack", "performance guarantee", "predictable latency", "lookup time", "amortized constant"]
related_terms = ["performance", "latency", "throughput", "ets-table", "ets", "caching", "algorithmic-consistency", "concurrency", "determinism", "scalability"]
word_count = 1579
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Constant Time - Prismatic Platform"
+++

## Definition

Constant time, denoted O(1) in Big-O notation, describes an algorithm or operation whose execution time remains fixed regardless of the size of the input data. Whether the dataset contains ten elements or ten million, a constant-time operation completes in the same bounded duration. This property is fundamental to building systems that maintain predictable performance characteristics under varying load conditions, and it carries critical implications for both performance engineering and cryptographic security.

In the context of distributed platforms and concurrent systems, constant-time guarantees translate directly into predictable latency, stable throughput, and resistance to timing-based side-channel attacks. The Prismatic Platform leverages constant-time operations extensively through ETS (Erlang Term Storage) lookups, pattern matching dispatch, and carefully designed data structures that ensure sub-millisecond response times even as the platform scales to handle millions of concurrent operations.

## Overview

The distinction between constant-time and other complexity classes represents one of the most consequential decisions in system architecture. While O(log n) or O(n) algorithms may appear fast enough for small datasets, only O(1) operations provide the ironclad guarantee that performance will not degrade as data grows. This guarantee becomes particularly important in three domains: real-time systems where latency budgets are fixed, security-critical operations where timing variations leak information, and high-throughput pipelines where per-element processing costs are multiplied by volume.

### Why Constant Time Matters

**Predictability**: In production systems handling thousands of requests per second, even small per-request overhead compounds. A lookup that takes 1 microsecond for 1,000 entries but 10 microseconds for 1,000,000 entries creates unpredictable tail latencies. Constant-time operations eliminate this class of performance surprises.

**Security**: Cryptographic operations that vary in execution time based on input values are vulnerable to timing attacks. An attacker can measure response times to deduce secret keys, passwords, or other sensitive data. Constant-time comparison functions prevent this entire attack class.

**Scalability**: Systems built on constant-time primitives scale linearly with hardware resources rather than being bottlenecked by algorithmic complexity. Adding more data does not slow down individual operations, allowing horizontal scaling to remain effective.

**SLA Compliance**: Service-level agreements typically specify percentile latency targets (P95, P99). Constant-time operations make it straightforward to meet these targets because the worst-case performance equals the average-case performance.

## Technical Details

### Complexity Classes Comparison

Understanding constant time requires context within the broader hierarchy of algorithmic complexity:

| Complexity | Name | Example | 1K items | 1M items | 1B items |
|------------|------|---------|----------|----------|----------|
| O(1) | Constant | Hash lookup | 1 unit | 1 unit | 1 unit |
| O(log n) | Logarithmic | Binary search | 10 units | 20 units | 30 units |
| O(n) | Linear | List scan | 1,000 units | 1,000,000 units | 1,000,000,000 units |
| O(n log n) | Linearithmic | Merge sort | 10,000 units | 20,000,000 units | 30,000,000,000 units |
| O(n^2) | Quadratic | Nested loops | 1,000,000 units | 10^12 units | 10^18 units |

### True O(1) vs Amortized O(1)

A critical distinction exists between true constant time and amortized constant time. True O(1) means every single operation completes in bounded time. Amortized O(1) means the average over a sequence of operations is constant, but individual operations may occasionally take longer (such as hash table resizing). For real-time systems, true O(1) is preferred; for throughput-oriented systems, amortized O(1) is often acceptable.

### ETS: The BEAM's O(1) Workhorse

Erlang Term Storage (ETS) provides constant-time read and write operations through hash-based tables. In the BEAM virtual machine, ETS tables are implemented as C-level hash tables that bypass the garbage collector, providing both O(1) access and freedom from GC pauses.

```elixir
defmodule Prismatic.ConstantTime.ETSRegistry do
  @moduledoc """
  Demonstrates O(1) constant-time operations using ETS.

  ETS provides true O(1) lookups regardless of table size,
  making it ideal for registries, caches, and configuration stores.
  """

  use GenServer

  @table_name :constant_time_registry

  # --- Client API ---

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  O(1) insertion into the registry.
  ETS :insert is constant time for :set tables.
  """
  @spec register(term(), term()) :: :ok
  def register(key, value) do
    :ets.insert(@table_name, {key, value, System.monotonic_time()})
    :ok
  end

  @doc """
  O(1) lookup from the registry.
  Returns {:ok, value} or {:error, :not_found}.
  """
  @spec lookup(term()) :: {:ok, term()} | {:error, :not_found}
  def lookup(key) do
    case :ets.lookup(@table_name, key) do
      [{^key, value, _timestamp}] -> {:ok, value}
      [] -> {:error, :not_found}
    end
  end

  @doc """
  O(1) existence check.
  Uses :ets.member/2 which avoids copying the value.
  """
  @spec exists?(term()) :: boolean()
  def exists?(key) do
    :ets.member(@table_name, key)
  end

  @doc """
  O(1) deletion from the registry.
  """
  @spec unregister(term()) :: :ok
  def unregister(key) do
    :ets.delete(@table_name, key)
    :ok
  end

  # --- Server Callbacks ---

  @impl GenServer
  def init(_opts) do
    table = :ets.new(@table_name, [
      :set,
      :named_table,
      :public,
      read_concurrency: true,
      write_concurrency: true
    ])

    {:ok, %{table: table}}
  end
end
```

### Constant-Time Security: Preventing Timing Attacks

In cryptographic contexts, constant-time operations prevent attackers from deducing secret values by measuring execution duration. The classic example is password comparison: a naive string comparison short-circuits on the first mismatched character, leaking information about how many characters are correct.

```elixir
defmodule Prismatic.ConstantTime.SecureCompare do
  @moduledoc """
  Constant-time comparison functions for security-sensitive operations.

  These functions always examine every byte of both inputs,
  preventing timing side-channel attacks.
  """

  @doc """
  Compares two binaries in constant time using XOR accumulation.

  Returns true only if both binaries are identical.
  Always processes all bytes regardless of where differences occur.
  """
  @spec secure_compare(binary(), binary()) :: boolean()
  def secure_compare(left, right) when byte_size(left) == byte_size(right) do
    left_bytes = :binary.bin_to_list(left)
    right_bytes = :binary.bin_to_list(right)

    result =
      left_bytes
      |> Enum.zip(right_bytes)
      |> Enum.reduce(0, fn {a, b}, acc ->
        Bitwise.bor(acc, Bitwise.bxor(a, b))
      end)

    result == 0
  end

  def secure_compare(_left, _right), do: false

  @doc """
  Constant-time HMAC comparison for API token validation.
  Uses Erlang's :crypto.hash/2 to normalize inputs first.
  """
  @spec secure_token_compare(binary(), binary()) :: boolean()
  def secure_token_compare(provided_token, stored_token) do
    provided_hash = :crypto.hash(:sha256, provided_token)
    stored_hash = :crypto.hash(:sha256, stored_token)
    secure_compare(provided_hash, stored_hash)
  end
end
```

### Pattern Matching as O(1) Dispatch

Elixir's pattern matching compiles to efficient jump tables in the BEAM, providing O(1) function clause dispatch regardless of the number of clauses:

```elixir
defmodule Prismatic.ConstantTime.Dispatcher do
  @moduledoc """
  Pattern matching provides O(1) dispatch through BEAM's
  compiled jump tables, avoiding sequential if/else chains.
  """

  @spec handle_event(atom(), map()) :: {:ok, map()} | {:error, term()}
  def handle_event(:agent_started, payload), do: process_start(payload)
  def handle_event(:agent_stopped, payload), do: process_stop(payload)
  def handle_event(:metric_recorded, payload), do: process_metric(payload)
  def handle_event(:alert_triggered, payload), do: process_alert(payload)
  def handle_event(:health_check, payload), do: process_health(payload)
  def handle_event(unknown_event, _payload), do: {:error, {:unknown_event, unknown_event}}

  defp process_start(payload), do: {:ok, Map.put(payload, :processed_at, DateTime.utc_now())}
  defp process_stop(payload), do: {:ok, Map.put(payload, :stopped_at, DateTime.utc_now())}
  defp process_metric(payload), do: {:ok, Map.put(payload, :recorded_at, DateTime.utc_now())}
  defp process_alert(payload), do: {:ok, Map.put(payload, :alerted_at, DateTime.utc_now())}
  defp process_health(payload), do: {:ok, Map.put(payload, :checked_at, DateTime.utc_now())}
end
```

## Implementation in Prismatic Platform

The Prismatic Platform enforces constant-time operations at multiple architectural layers:

### Agent Registry (O(1) Agent Resolution)

With 530+ AIAD agents, the platform uses ETS-backed registries to resolve agent names to module references in constant time. This ensures that orchestration overhead does not grow as the agent ecosystem expands. The `PrismaticAgents.Registry` module maintains a `:set` ETS table with `read_concurrency: true`, enabling lock-free concurrent lookups across all BEAM schedulers.

### Quality Gate Checks (O(1) Pattern Detection)

The platform's quality gates achieve 90-250x speedups through O(1) pattern detection. Rather than scanning entire files for forbidden patterns, the system maintains pre-computed indexes that allow instant pattern matching against known violation signatures. This is documented as a core platform achievement: "O(1) pattern detection (90-250x speedup)."

### Git Trees Optimization

The `mix git_trees` system provides approximately 100x faster codebase exploration by using `git ls-tree` (which reads pre-computed tree objects) rather than filesystem traversal. While not strictly O(1) in the algorithmic sense, the tree structure provides O(log n) lookups with very small constants, making it effectively constant-time for practical repository sizes.

### Configuration and Feature Flags

Platform configuration is loaded at boot time into ETS tables, ensuring that runtime configuration checks are O(1). Feature flags, authority levels, and enforcement policies are all resolved through direct ETS lookups rather than file I/O or database queries.

## Comparison with Alternatives

| Approach | Complexity | Latency (1M entries) | Memory | Use Case |
|----------|-----------|---------------------|--------|----------|
| ETS Hash Table | O(1) | ~1 microsecond | Higher (C heap) | Registries, caches |
| Elixir Map | O(log n) | ~5 microseconds | Lower (process heap) | Small datasets |
| List Scan | O(n) | ~500 microseconds | Lowest | Tiny datasets (<50) |
| Mnesia | O(1) for key lookup | ~10 microseconds | Higher (distributed) | Distributed state |
| PostgreSQL Index | O(log n) | ~100 microseconds | Disk-backed | Persistent data |
| Redis | O(1) | ~200 microseconds (network) | Separate process | Cross-node caching |

### When NOT to Use Constant Time

Constant-time data structures often trade memory for speed. ETS tables consume more memory than Elixir maps for small datasets. For collections under 50 elements, the overhead of maintaining a hash table exceeds the benefit of O(1) lookup. Elixir's built-in maps (which use Hash Array Mapped Tries) provide excellent performance for small-to-medium collections with lower memory overhead.

## Best Practices

1. **Profile before optimizing**: Use Benchee to verify that a lookup is actually a bottleneck before replacing maps with ETS tables.

2. **Use `read_concurrency: true`** for ETS tables that are read-heavy. This enables lock-free reads at the cost of slightly slower writes.

3. **Prefer `:set` over `:ordered_set`**: The `:set` type provides true O(1) operations, while `:ordered_set` uses a tree structure with O(log n) operations.

4. **Always use constant-time comparison for secrets**: Never use `==` to compare API tokens, passwords, or cryptographic hashes. Use `Plug.Crypto.secure_compare/2` or equivalent.

5. **Document complexity guarantees**: When a function relies on O(1) behavior, document it in the `@doc` attribute so future maintainers do not inadvertently change the data structure.

6. **Benchmark with realistic data sizes**: O(1) operations still have a constant factor. Measure with production-scale data to understand actual latency.

7. **Consider amortized vs worst-case**: If your system has hard real-time requirements, ensure the data structure provides worst-case O(1), not just amortized O(1).

8. **Avoid hash flooding**: When using hash-based O(1) structures with external input, ensure the hash function is resistant to adversarial collision attacks.

## Common Pitfalls

**Assuming Map operations are O(1)**: Elixir maps use HAMTs (Hash Array Mapped Tries), which provide O(log32 n) operations. This is effectively O(1) for small maps but degrades for very large maps. For guaranteed O(1), use ETS.

**Ignoring GC impact on perceived latency**: While ETS operations themselves are O(1), if surrounding code generates garbage, GC pauses can make the overall operation appear non-constant. Isolate hot paths from allocation-heavy code.

**Confusing O(1) with "fast"**: An O(1) operation with a large constant factor can be slower than an O(log n) operation for practical input sizes. Always benchmark rather than relying solely on complexity analysis.

**Leaking timing information**: Using `==` for binary comparison in security contexts short-circuits on the first differing byte, creating a timing side-channel. This is a critical vulnerability in authentication systems.

**ETS table ownership**: If the process that created an ETS table crashes, the table is destroyed. Always create ETS tables in a supervised process with appropriate restart strategies.

**Write contention on concurrent ETS**: While reads are lock-free with `read_concurrency: true`, concurrent writes to the same key can cause contention. Consider write-behind caching or sharding for write-heavy workloads.

## Use Cases

- **Agent Registry Lookup**: Resolving agent names to modules across the 530+ agent ecosystem in O(1) time
- **API Token Validation**: Constant-time comparison of bearer tokens to prevent timing attacks
- **Feature Flag Resolution**: Checking whether a feature is enabled without database roundtrips
- **Rate Limiting**: Token bucket counters stored in ETS with O(1) increment and check operations
- **Session Management**: O(1) session lookup and validation for LiveView connections
- **Routing Table Dispatch**: Pattern-matching-based request routing that does not degrade with route count
- **Quality Gate Pattern Matching**: O(1) detection of forbidden patterns in the pre-commit pipeline
- **Configuration Access**: Runtime configuration served from ETS rather than application environment

## Related Concepts

- [Performance](@/glossary/performance.md) -- the broader discipline encompassing constant-time optimization
- [ETS (Erlang Term Storage)](@/glossary/ets.md) -- the primary O(1) data structure on the BEAM
- [ETS Table](@/glossary/ets-table.md) -- specific table types and their complexity characteristics
- [Latency](@/glossary/latency.md) -- the measurable impact of constant-time vs non-constant operations
- [Throughput](@/glossary/throughput.md) -- how O(1) operations enable linear throughput scaling
- [Caching](@/glossary/caching.md) -- a common application of constant-time lookup structures
- [Algorithmic Consistency](@/glossary/algorithmic-consistency.md) -- ensuring algorithms maintain their complexity guarantees
- [Determinism](@/glossary/determinism.md) -- the predictability property that constant-time operations provide
- [Scalability](@/glossary/scalability.md) -- how constant-time primitives enable horizontal scaling
- [Concurrency](@/glossary/concurrency.md) -- concurrent access patterns for O(1) data structures

## See Also

- [BEAM VM](@/glossary/beam-vm.md) -- the virtual machine that provides ETS and pattern matching dispatch
- [Security](@/glossary/security.md) -- constant-time operations as a security requirement
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- O(1) state checks in failure handling patterns
- [Performance Testing](@/glossary/performance-testing.md) -- benchmarking constant-time guarantees

---

## Connect & Contribute

Prismatic Platform is built by [Tomas Korcak (korczis)](https://github.com/korczis) and the open-source community.

- [GitHub Repository](https://github.com/korczis/prismatic-platform) -- Source code, issues, and contributions
- [GitLab Mirror](https://gitlab.com/korczis/prismatic-platform) -- CI/CD and issue tracking
- [LinkedIn](https://linkedin.com/in/korczis) -- Professional network and updates
- [Contact](mailto:korczis@gmail.com) -- Direct communication
