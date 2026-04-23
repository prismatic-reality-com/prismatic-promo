+++
title = "Sequential Scan"
weight = 50
[extra]
description = "PostgreSQL query execution method that reads every row in a table to find matching results"
category = "database"
related_terms = ["schema-migration", "point-in-time-recovery", "profiling", "percentile", "pivot-table"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["sequential scan", "seq scan", "PostgreSQL", "query plan", "full table scan", "index", "glossary", "Prismatic Platform"]
tags = ["glossary", "database", "postgresql", "performance"]
quality_score = 77
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Sequential Scan - Prismatic Platform"
+++

## Definition & Overview

A sequential scan (also called a full table scan or seq scan) is a PostgreSQL query execution method that reads every row in a table from beginning to end, evaluating the query predicate against each row to find matches. This is the simplest and most predictable access method -- it requires no indexes and works for any query predicate, but its cost scales linearly with table size. For a table with 1 million rows, a sequential scan reads all 1 million rows regardless of how many match the predicate.

Sequential scans are not inherently bad. When a query needs to read a large fraction of the table (typically above 5-10%), a sequential scan is often faster than an index scan because it reads pages in order, benefiting from operating system read-ahead and avoiding the random I/O pattern of index lookups. PostgreSQL's query planner considers table statistics, index availability, and estimated selectivity to choose between sequential and index scans for each query.

The Prismatic Platform monitors sequential scans through EXPLAIN ANALYZE output in its query performance tracking. Sequential scans on large tables (DD entities, OSINT results, audit logs) are flagged for review, as they often indicate missing indexes or suboptimal query patterns. The platform's sub-250ms page load requirement means that sequential scans on tables above 10,000 rows are almost always unacceptable for request-serving code paths.

## Technical Deep Dive

PostgreSQL's query planner uses cost estimation to decide between sequential and index scans. The key parameters are `seq_page_cost` (cost of reading a page sequentially, default 1.0), `random_page_cost` (cost of reading a random page, default 4.0), and the estimated selectivity of the query predicate.

```elixir
defmodule PrismaticPerformance.QueryAnalyzer do
  @moduledoc """
  Analyzes PostgreSQL query execution plans to identify
  sequential scans and other performance-relevant patterns.
  """

  @type analysis :: %{
    has_seq_scan: boolean(),
    seq_scan_tables: [String.t()],
    estimated_rows: non_neg_integer(),
    actual_time_ms: float(),
    recommendations: [String.t()]
  }

  @spec analyze(Ecto.Repo.t(), String.t(), list()) :: {:ok, analysis()}
  def analyze(repo, query, params \\ []) do
    explain_query = "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) #{query}"

    case Ecto.Adapters.SQL.query(repo, explain_query, params) do
      {:ok, %{rows: [[plan_json]]}} ->
        plan = Jason.decode!(plan_json) |> List.first()
        analysis = analyze_plan(plan)
        {:ok, analysis}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec analyze_ecto(Ecto.Repo.t(), Ecto.Queryable.t()) :: {:ok, analysis()}
  def analyze_ecto(repo, queryable) do
    {query_string, params} = Ecto.Adapters.SQL.to_sql(:all, repo, queryable)
    analyze(repo, query_string, params)
  end

  defp analyze_plan(plan) do
    nodes = flatten_plan(plan["Plan"])
    seq_scans = Enum.filter(nodes, &(&1["Node Type"] == "Seq Scan"))

    recommendations =
      seq_scans
      |> Enum.filter(fn node -> (node["Actual Rows"] || 0) > 1000 end)
      |> Enum.map(fn node ->
        table = node["Relation Name"]
        rows = node["Actual Rows"]
        filter = node["Filter"]
        "Consider adding index on #{table} for filter: #{filter} (scanned #{rows} rows)"
      end)

    %{
      has_seq_scan: length(seq_scans) > 0,
      seq_scan_tables: Enum.map(seq_scans, &(&1["Relation Name"])),
      estimated_rows: plan["Plan"]["Plan Rows"] || 0,
      actual_time_ms: plan["Plan"]["Actual Total Time"] || 0.0,
      recommendations: recommendations
    }
  end

  defp flatten_plan(nil), do: []

  defp flatten_plan(node) do
    children =
      (node["Plans"] || [])
      |> Enum.flat_map(&flatten_plan/1)

    [node | children]
  end
end
```

Monitoring sequential scans in production uses PostgreSQL's `pg_stat_user_tables` system view, which tracks sequential scan counts per table. Tables with high sequential scan counts relative to index scan counts are candidates for index optimization.

```elixir
defmodule PrismaticPerformance.SeqScanMonitor do
  @moduledoc """
  Monitors sequential scan frequency on platform tables
  and identifies tables that may benefit from additional indexes.
  """

  @spec table_scan_stats(Ecto.Repo.t()) :: {:ok, [map()]}
  def table_scan_stats(repo) do
    query = """
    SELECT
      schemaname,
      relname AS table_name,
      seq_scan,
      seq_tup_read,
      idx_scan,
      idx_tup_fetch,
      n_live_tup AS row_count,
      CASE WHEN seq_scan + idx_scan > 0
        THEN round(100.0 * seq_scan / (seq_scan + idx_scan), 2)
        ELSE 0
      END AS seq_scan_pct
    FROM pg_stat_user_tables
    WHERE seq_scan > 0
    ORDER BY seq_tup_read DESC
    LIMIT 20
    """

    case Ecto.Adapters.SQL.query(repo, query, []) do
      {:ok, %{rows: rows, columns: columns}} ->
        stats = Enum.map(rows, fn row ->
          Enum.zip(columns, row) |> Map.new()
        end)

        {:ok, stats}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec tables_needing_indexes(Ecto.Repo.t(), float()) :: {:ok, [map()]}
  def tables_needing_indexes(repo, threshold_pct \\ 80.0) do
    {:ok, stats} = table_scan_stats(repo)

    needing_indexes =
      stats
      |> Enum.filter(fn stat ->
        stat["seq_scan_pct"] > threshold_pct and
          stat["row_count"] > 1000
      end)

    {:ok, needing_indexes}
  end
end
```

## Architecture & Implementation

The sequential scan monitoring architecture integrates with the platform's performance telemetry pipeline. The SeqScanMonitor runs periodic checks against `pg_stat_user_tables` and emits telemetry events for tables exceeding configurable thresholds. These events feed into the monitoring dashboard, where they appear as index optimization recommendations.

The platform's Ecto query patterns are designed to avoid unnecessary sequential scans. All frequently-filtered columns have corresponding indexes, and the DD pipeline's query patterns use indexed lookups for entity retrieval. The schema migration system validates that new tables include appropriate indexes for their expected query patterns.

For analytical queries that legitimately require sequential scans (aggregate computations over full tables), the platform uses PostgreSQL's parallel sequential scan capability (`max_parallel_workers_per_gather`) to distribute the scan across multiple CPU cores, reducing wall-clock time for large table scans.

## Usage in Prismatic Platform

Query analysis is available through Mix tasks and the monitoring dashboard. Developers use EXPLAIN ANALYZE to verify that queries use appropriate access methods.

```elixir
# Analyze a specific query
{:ok, analysis} = PrismaticPerformance.QueryAnalyzer.analyze(
  PrismaticDd.Repo,
  "SELECT * FROM dd_entities WHERE source = $1 AND entity_type = $2",
  ["forbes_cz", "person"]
)

# Check tables needing indexes
{:ok, tables} = PrismaticPerformance.SeqScanMonitor.tables_needing_indexes(
  PrismaticDd.Repo,
  80.0
)
```

## Cross-References

- [Schema Migration](/glossary/schema-migration/) - Index creation through migrations to eliminate seq scans
- [Point-in-Time Recovery](/glossary/point-in-time-recovery/) - Database recovery that may involve sequential replay
- [Profiling](/glossary/profiling/) - Performance measurement identifying slow sequential scans
- [Percentile](/glossary/percentile/) - Query latency percentiles affected by sequential scans
- [Pivot Table](/glossary/pivot-table/) - Analytical operations that may legitimately require seq scans

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
