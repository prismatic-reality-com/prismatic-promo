+++
title = "Match Specification"
weight = 50

[extra]
description = "A Match Specification is an Erlang term that defines a pattern-matching and filtering program for ETS table lookups, trace operations, and message reception, compiled to efficient bytecode by the BEAM runtime for high-performance zero-copy data selection across millions of records."
category = "platform"
domain = "data-access"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["named-table", "ordered-set", "process", "memory", "profiling", "ets", "ex2ms", "pattern-matching", "guard", "trace", "select", "continuation"]
tags = ["glossary", "match-specification", "ets", "pattern-matching", "erlang", "beam", "performance", "data-selection", "trace", "bytecode", "zero-copy", "ex2ms"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 96
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Match specifications provide compiled pattern-matching programs that enable sub-millisecond filtering of millions of ETS records without copying data to the calling process, making them the performance-critical foundation for all ETS-backed registries in the Prismatic Platform."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["match specification", "match spec", "ETS select", "pattern matching", "Erlang match spec", "BEAM bytecode", "data filtering", "trace specification", "Ex2ms", "zero-copy", "guard expressions"]
image = "/images/sections/glossary.png"
image_alt = "Match Specification - Prismatic Platform"
word_count = 3600
see_also = ["capabilities", "architecture", "performance-testing"]
+++

## Definition

A **Match Specification** (match spec) is a structured Erlang term that defines a mini-program for pattern matching, guard evaluation, and result construction. Used primarily with ETS (Erlang Term Storage) tables and the Erlang trace system, match specifications are compiled to efficient bytecode by the BEAM runtime, enabling complex data selection operations to execute inside the ETS table's memory space without copying unmatched records to the calling process. This zero-copy filtering model is what makes ETS capable of handling millions of records with consistent sub-millisecond query performance -- only the matched and projected results cross the process boundary.

A match specification is a list of match clauses, each with the structure `{MatchPattern, Guards, ResultBody}` -- directly analogous to a function clause with pattern, when-guard, and return expression. The BEAM compiles this three-tuple structure into a specialized bytecode program that executes within the ETS infrastructure, avoiding the overhead of generic Erlang function calls, message passing, and the term copying that would occur with manual iteration using `:ets.foldl/3` or `:ets.tab2list/1`.

Match specifications represent one of the most powerful yet underutilized features of the BEAM platform. They enable database-query-like filtering capabilities on in-memory data structures with performance characteristics that rival purpose-built in-memory databases, while requiring zero external dependencies and integrating seamlessly with the OTP supervision model.

## Core Concepts

### Match Specification Structure

| Component | Purpose | Syntax | Example |
|-----------|---------|--------|---------|
| **Match Pattern** | Binds variables to tuple positions | Numbered variables `:'$1'`, `:'$2'` | `{:'$1', :'$2', :'$3'}` |
| **Guards** | Filter conditions on bound variables | Tuple-wrapped guard expressions | `[{:>, :'$2', 100}]` |
| **Result Body** | Projection -- what to return | List of return expressions | `[:'$1']` or `[{{:'$1', :'$2'}}]` |

### Variable Binding Reference

| Variable | Meaning | Usage |
|----------|---------|-------|
| `:'$1'`, `:'$2'`, ... | Positional bindings from match pattern | Refer to specific tuple elements |
| `:'$_'` | The entire matched object | Return full record (no projection) |
| `:'$$'` | All bound variables as a list | Return `[:'$1', :'$2', ...]` |
| Literal atoms/values | Exact match constants | `{:user, :'$1', :'$2'}` matches tuples starting with `:user` |
| `:'_'` (underscore) | Wildcard -- matches anything, no binding | Ignore a position |

### Guard Expression Operators

| Category | Operators | Example |
|----------|-----------|---------|
| **Comparison** | `:==`, `:=/=`, `:<`, `:>`, `:<=`, `:>=` | `{:>, :'$2', 100}` |
| **Boolean** | `:and`, `:or`, `:not` | `{:and, {:>, :'$2', 0}, {:<, :'$2', 100}}` |
| **Type checks** | `:is_atom`, `:is_binary`, `:is_integer`, `:is_list`, `:is_map`, `:is_tuple` | `{:is_binary, :'$1'}` |
| **Arithmetic** | `:+`, `:-`, `:*`, `:div`, `:rem` | `{:>, {:rem, :'$2', 2}, 0}` |
| **Element access** | `:element` | `{:element, 2, :'$1'}` |
| **Map access** | `:map_get` | `{:map_get, :name, :'$1'}` |
| **Size** | `:tuple_size`, `:byte_size` | `{:>, {:tuple_size, :'$1'}, 3}` |

### ETS Select Functions

| Function | Purpose | Returns | Continuation Support |
|----------|---------|---------|---------------------|
| `:ets.select/2` | Apply match spec to entire table | List of matched results | No |
| `:ets.select/3` | Apply match spec with limit | `{results, continuation}` | Yes |
| `:ets.select_count/2` | Count matches without returning data | Integer count | No |
| `:ets.select_delete/2` | Delete matching records atomically | Count of deleted records | No |
| `:ets.select_replace/2` | Replace matching records atomically | Count of replaced records | No |
| `:ets.select_reverse/2` | Select from ordered_set in reverse order | List of matched results | No |
| `:ets.match/2` | Simplified pattern matching (no guards) | List of bound variable lists | No |
| `:ets.match_object/2` | Like match but returns full objects | List of matched objects | No |

### Performance Characteristics

| Operation | Records | Match Rate | Time (match spec) | Time (foldl + filter) | Speedup |
|-----------|---------|------------|--------------------|-----------------------|---------|
| Simple equality | 100,000 | 1% | ~0.2ms | ~8ms | 40x |
| Range query | 100,000 | 10% | ~0.5ms | ~9ms | 18x |
| Complex guards | 1,000,000 | 0.1% | ~2ms | ~120ms | 60x |
| Projection (2 of 8 fields) | 100,000 | 100% | ~3ms | ~15ms | 5x |
| Count only | 1,000,000 | 50% | ~5ms | ~80ms | 16x |

## Technical Deep Dive

### Bytecode Compilation

Match specification syntax uses numbered variables (`:'$1'`, `:'$2'`, etc.) as placeholders that bind to tuple elements during matching. Guards use the same syntax as Erlang guard expressions but wrapped in tuples: `{:>, :'$2', 100}` instead of the standard guard syntax `when $2 > 100`. The result body specifies what to return for matched entries: `[:'$1']` returns the first bound variable, `[:'$_']` returns the entire matched object, and `[{{:'$1', :'$2'}}]` returns a tuple constructed from bound variables.

The BEAM compiles match specifications into a specialized internal bytecode that is distinct from the standard BEAM instruction set. This bytecode is optimized for the specific task of pattern matching and guard evaluation within ETS tables. The compilation happens once when the match spec is passed to `:ets.select/2`, and the compiled form is cached for the duration of the operation. For repeated queries, pre-compiling match specs with `:ets.match_spec_compile/1` and using `:ets.match_spec_run/2` avoids recompilation overhead.

### Zero-Copy Architecture

The critical performance advantage of match specifications is their execution context. When `:ets.select/2` is called, the match spec bytecode executes inside the ETS table's memory space, under the table's read lock. Only records that pass both the pattern match and the guard conditions are copied to the calling process's heap. Unmatched records are never touched by the calling process.

This is fundamentally different from `:ets.tab2list/1` followed by `Enum.filter/2`, which copies every record to the calling process's heap (triggering garbage collection pressure), then filters in Elixir code. For a table with 1 million records where only 1,000 match, the match spec approach copies 1,000 terms; the filter approach copies 1,000,000 terms and then discards 999,000.

The projection capability further reduces copy volume. If a record has 8 fields but the query only needs 2, the result body can construct a smaller tuple containing just those 2 fields. Only the projected result is copied across the process boundary.

### Ex2ms: Elixir-Friendly DSL

The `Ex2ms` library provides an Elixir-friendly macro that compiles Elixir syntax to match specs at compile time, eliminating the need to write raw Erlang match spec terms. The macro `fun do {key, value} when value > threshold -> key end` produces the equivalent match spec `[{{:"$1", :"$2"}, [{:>, :"$2", threshold}], [:"$1"]}]`.

Ex2ms validates correctness at compile time, catching invalid guard expressions, incorrect variable bindings, and unsupported operations before runtime. This compile-time safety eliminates an entire category of runtime errors that would otherwise manifest as cryptic `:ets.select/2` crashes.

However, Ex2ms has limitations: it cannot express all possible match spec constructs (particularly complex map access patterns and nested tuple extraction), and its error messages can be confusing when the Elixir syntax does not map cleanly to match spec semantics. For these edge cases, hand-written match specs remain necessary.

### Match Specs for Tracing

Match specs serve three distinct use cases: ETS data selection (`:ets.select/2`), trace filtering (`:erlang.trace_pattern/3`), and dbg-based debugging. In the tracing context, match specs control which function calls trigger trace events, using the same `{Pattern, Guards, Body}` structure but with function arguments instead of tuple elements.

The trace result body supports special actions: `{:message, term}` attaches a custom message to the trace event, `{:return_trace}` captures the function's return value, and `{:exception_trace}` captures any exception thrown. These actions are exclusive to trace match specs and are not available in ETS match specs.

### Continuation-Based Pagination

`:ets.select/3` accepts a limit parameter and returns a `{results, continuation}` tuple, enabling paginated iteration over large result sets. The continuation is an opaque term that encodes the table position, allowing `:ets.select/1` to resume from where the previous call left off. This is critical for processing large result sets without holding the ETS table lock for the entire operation.

## Usage in Prismatic Platform

The Prismatic Platform's ETS-backed registries (ToolRegistry, TopicRegistry, SourceRegistry) use match specifications extensively for high-performance data access. The OSINT ToolRegistry uses match specs to filter tools by category, API style, and authentication requirements in a single atomic ETS operation. Instead of fetching all 157+ tools and filtering in Elixir, a match spec query selects only matching tools inside ETS, returning minimal result sets with sub-millisecond latency even as the tool catalog grows.

The Quality Floor Guardian uses match specs to scan quality metric ETS tables for domains below threshold values -- a critical operation that runs during every pre-commit check and CI pipeline execution. The match spec approach ensures this check completes in under 1ms regardless of the number of tracked domains.

The agent pool manager uses match specs to find available agents by tier, domain, and current load, enabling efficient scheduling across 552 registered agents. The match spec's guard expressions evaluate tier eligibility and load thresholds inside ETS, returning only agents that meet all criteria.

The DD pipeline's entity cache uses continuation-based pagination to process large entity sets without blocking the ETS table for extended periods, ensuring that concurrent readers (LiveView dashboards, API endpoints) experience no latency spikes during bulk operations.

## Code Examples

```elixir
defmodule PrismaticOsintCore.ToolRegistry.Queries do
  @moduledoc """
  Match specification queries for the OSINT tool registry ETS table.

  Provides compile-time validated match specs using Ex2ms for
  common query patterns. These queries execute inside ETS memory
  space, achieving sub-millisecond filtering across the full
  tool catalog.

  ## Performance

  All queries in this module are designed to minimize copy volume
  by projecting only the required fields. A typical query against
  157 tools completes in under 0.1ms.
  """

  import Ex2ms

  @doc """
  Returns a match spec that selects tools by category.

  ## Examples

      iex> spec = Queries.tools_by_category(:czech)
      iex> :ets.select(:tool_registry, spec)
      [{:czech_ares, %{name: "ARES", ...}}, ...]
  """
  @spec tools_by_category(atom()) :: :ets.match_spec()
  def tools_by_category(category) do
    fun do
      {slug, config} when config.category == ^category ->
        {slug, config}
    end
  end

  @doc """
  Returns a match spec that selects tools requiring authentication.

  Projects only slug and name to minimize copy volume.

  ## Examples

      iex> spec = Queries.tools_requiring_auth()
      iex> :ets.select(:tool_registry, spec)
      [{:shodan, "Shodan"}, ...]
  """
  @spec tools_requiring_auth() :: :ets.match_spec()
  def tools_requiring_auth do
    fun do
      {slug, config} when config.requires_auth == true ->
        {slug, config.name}
    end
  end

  @doc """
  Returns a match spec for full-text search across tool names.

  Note: ETS match specs do not support string contains operations.
  This spec matches tools where the name starts with a given prefix
  using the `:binary_part` guard function.

  For full-text search, use Meilisearch instead of ETS match specs.
  """
  @spec tools_by_name_prefix(binary()) :: :ets.match_spec()
  def tools_by_name_prefix(prefix) do
    prefix_size = byte_size(prefix)

    [
      {
        {:"$1", :"$2"},
        [{:==, {:binary_part, {:map_get, :name, :"$2"}, 0, prefix_size}, prefix}],
        [{{:"$1", {:map_get, :name, :"$2"}}}]
      }
    ]
  end

  @doc """
  Executes a match spec query against the given ETS table.

  Wraps `:ets.select/2` with error handling for table-not-found
  scenarios, returning an empty list instead of crashing.

  ## Examples

      iex> Queries.execute_query(:tool_registry, Queries.tools_requiring_auth())
      [{:shodan, "Shodan"}, {:virustotal, "VirusTotal"}]
  """
  @spec execute_query(atom(), :ets.match_spec()) :: list()
  def execute_query(table, match_spec) do
    case :ets.info(table) do
      :undefined -> []
      _info -> :ets.select(table, match_spec)
    end
  end

  @doc """
  Counts matching records without returning data.

  More efficient than `length(execute_query(...))` because
  no data is copied to the calling process.

  ## Examples

      iex> Queries.count_matching(:tool_registry, Queries.tools_by_category(:czech))
      12
  """
  @spec count_matching(atom(), :ets.match_spec()) :: non_neg_integer()
  def count_matching(table, match_spec) do
    case :ets.info(table) do
      :undefined -> 0
      _info -> :ets.select_count(table, match_spec)
    end
  end
end
```

```elixir
defmodule PrismaticSafety.QualityFloorGuardian.Queries do
  @moduledoc """
  Low-level match specs for quality metric ETS queries.

  Uses hand-written match specs (not Ex2ms) for complex
  queries that require map access patterns not supported
  by the Ex2ms macro.

  ## Table Schema

  Quality metric ETS table stores records as:
  `{domain :: atom(), score :: non_neg_integer(), timestamp :: integer()}`
  """

  @doc """
  Match spec for domains with scores below a threshold.

  ## Examples

      iex> spec = Queries.domains_below_threshold(70)
      iex> :ets.select(:quality_metrics, spec)
      [{:osint, 65}, {:dd, 42}]
  """
  @spec domains_below_threshold(non_neg_integer()) :: :ets.match_spec()
  def domains_below_threshold(threshold) do
    [
      {
        {:"$1", :"$2", :"$3"},
        [{:<, :"$2", threshold}],
        [{{:"$1", :"$2"}}]
      }
    ]
  end

  @doc """
  Match spec for domains with scores in a given range.

  ## Examples

      iex> spec = Queries.domains_in_range(60, 80)
      iex> :ets.select(:quality_metrics, spec)
      [{:web, 75, 1711929600}]
  """
  @spec domains_in_range(non_neg_integer(), non_neg_integer()) :: :ets.match_spec()
  def domains_in_range(min_score, max_score) do
    [
      {
        {:"$1", :"$2", :"$3"},
        [{:>=, :"$2", min_score}, {:<=, :"$2", max_score}],
        [:"$_"]
      }
    ]
  end

  @doc """
  Selects domains below threshold from the given ETS table.

  ## Examples

      iex> Queries.select_below_threshold(:quality_metrics, 70)
      [{:osint, 65}]
  """
  @spec select_below_threshold(atom(), non_neg_integer()) :: list({atom(), non_neg_integer()})
  def select_below_threshold(table, threshold) do
    :ets.select(table, domains_below_threshold(threshold))
  end

  @doc """
  Counts domains meeting or exceeding a quality threshold.

  Uses `select_count/2` for zero-copy counting.

  ## Examples

      iex> Queries.count_passing(:quality_metrics, 70)
      8
  """
  @spec count_passing(atom(), non_neg_integer()) :: non_neg_integer()
  def count_passing(table, threshold) do
    spec = [
      {
        {:"$1", :"$2", :"$3"},
        [{:>=, :"$2", threshold}],
        [true]
      }
    ]

    :ets.select_count(table, spec)
  end
end
```

```elixir
defmodule PrismaticAgents.PoolManager.Queries do
  @moduledoc """
  Match specs for agent pool scheduling queries.

  Finds available agents by tier, domain, and load thresholds
  using compound guard expressions for efficient in-ETS filtering.

  ## Table Schema

  Agent pool ETS records:
  `{agent_id :: binary(), tier :: atom(), domain :: atom(), load :: float(), status :: atom()}`
  """

  @doc """
  Match spec for available agents in a given domain below load threshold.

  ## Examples

      iex> spec = Queries.available_agents(:osint, 0.8)
      iex> :ets.select(:agent_pool, spec)
      [{"agent-001", :osint, 0.35}, {"agent-042", :osint, 0.12}]
  """
  @spec available_agents(atom(), float()) :: :ets.match_spec()
  def available_agents(domain, max_load) do
    [
      {
        {:"$1", :"$2", :"$3", :"$4", :"$5"},
        [
          {:==, :"$3", domain},
          {:<, :"$4", max_load},
          {:==, :"$5", :available}
        ],
        [{{:"$1", :"$3", :"$4"}}]
      }
    ]
  end

  @doc """
  Match spec for agents across any domain, sorted by load (lowest first).

  Note: ETS match specs do not support ORDER BY. Sort the results
  in Elixir after selecting. This spec minimizes copy volume by
  projecting only the fields needed for sorting and selection.
  """
  @spec least_loaded_agents(float()) :: :ets.match_spec()
  def least_loaded_agents(max_load) do
    [
      {
        {:"$1", :"$2", :"$3", :"$4", :"$5"},
        [{:<, :"$4", max_load}, {:==, :"$5", :available}],
        [{{:"$4", :"$1", :"$3"}}]
      }
    ]
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Using `:'$_'` when only 2 fields needed | Copies entire record; wastes memory and GC pressure | Project only needed fields in result body: `[{{:'$1', :'$3'}}]` |
| Hand-writing match specs without validation | Syntax errors surface as runtime crashes in `:ets.select/2` | Use Ex2ms for compile-time validation; test match specs in IEx first |
| Using unsupported guard functions | Match spec compilation silently fails or produces wrong results | Check Erlang guard expression documentation; only BIF guards are allowed |
| Forgetting match specs lock ETS table | Long-running match spec blocks other readers/writers | Use `:ets.select/3` with limits for large result sets; keep match specs fast |
| Using `:ets.match/2` when guards are needed | Match patterns cannot express range queries or type checks | Use `:ets.select/2` with match specs for anything beyond exact matching |
| Not pre-compiling repeated match specs | Recompilation on every call adds microseconds | Use `:ets.match_spec_compile/1` for hot-path queries |
| Confusing Ex2ms `^variable` with Elixir pin | Ex2ms uses `^` to interpolate external values at compile time | Ensure pinned values are available at compile time; use raw specs for runtime values |
| Ignoring continuation for large result sets | Single `:ets.select/2` on millions of records holds lock too long | Use `:ets.select/3` with limit + continuation for paginated access |
| Match spec on `bag` table with duplicates | Unexpected duplicate results when table has multiple entries per key | Account for bag semantics; use `select_count/2` to verify expected cardinality |
| Using match specs for string search | ETS match specs have no regex or substring support | Use ETS for structured filtering; delegate text search to Meilisearch |

## Best Practices

1. **Use Ex2ms for compile-time validated match specs** -- avoid hand-writing raw Erlang terms unless the query pattern exceeds Ex2ms capabilities.

2. **Prefer `:ets.select/2` over `:ets.match/2`** -- select supports guard conditions and result body projection; match is limited to pattern-only filtering.

3. **Profile match spec queries against alternatives** -- verify the performance benefit justifies the complexity; for tables under 100 records, `Enum.filter/2` may be simpler and fast enough.

4. **Keep result bodies minimal** -- return only the fields you need rather than `:'$_'` (entire object) to reduce cross-process copy volume.

5. **Use `:ets.select_count/2` for cardinality-only queries** -- selecting and counting wastes copy bandwidth; count-only queries never copy data.

6. **Test match specs in isolation** -- run them against known test data in IEx before deploying in production query paths.

7. **Use continuation-based pagination for large tables** -- `:ets.select/3` with limits prevents long lock holds on high-traffic tables.

8. **Pre-compile match specs on hot paths** -- use `:ets.match_spec_compile/1` + `:ets.match_spec_run/2` for queries executed thousands of times per second.

9. **Document the table schema alongside match specs** -- match specs are meaningless without knowing the tuple structure they match against.

10. **Validate with `:ets.test_ms/2`** -- test match specs against sample data before using in production: `:ets.test_ms({:a, 42, :ok}, spec)`.

## Related Terms

- [ETS](/glossary/ets/) -- Erlang Term Storage, the primary execution context for match specifications
- [Named Table](/glossary/named-table/) -- ETS tables that match specs query against by atom name
- [Ordered Set](/glossary/ordered-set/) -- ETS table type supporting range queries with match specs and `select_reverse/2`
- [Process](/glossary/process/) -- BEAM processes that own ETS tables and receive match spec results
- [Memory](/glossary/memory/) -- memory efficiency achieved through match spec zero-copy filtering
- [Pattern Matching](/glossary/pattern-matching/) -- the foundational BEAM capability that match specs formalize
- [Guard](/glossary/guard/) -- guard expressions used in match spec filter conditions
- [Profiling](/glossary/profiling/) -- trace-based profiling using match specifications for selective tracing
- [Trace](/glossary/trace/) -- the BEAM trace system that uses match specs for filtering
- [GenServer](/glossary/genserver/) -- processes that commonly own and query ETS tables via match specs
- [Continuation](/glossary/continuation/) -- opaque tokens for paginated match spec iteration
- [Select](/glossary/select/) -- the ETS operation that executes match specifications

## See Also

- [Architecture](/architecture/) -- ETS and data access architecture in the Prismatic Platform
- [Capabilities](/capabilities/) -- high-performance query capabilities powered by match specs
- [Erlang Match Spec Documentation](https://www.erlang.org/doc/apps/erts/match_spec.html) -- official reference
- [Ex2ms on Hex](https://hex.pm/packages/ex2ms) -- Elixir to Match Spec compiler library
- [ETS Performance Guide](https://www.erlang.org/doc/efficiency_guide/tablesDatabases.html) -- Erlang efficiency guide for tables

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
