+++
title = "Pivot Table"
weight = 50
[extra]
description = "Cross-tabulation technique that reorganizes data along multiple dimensions for aggregated analysis"
category = "data-analysis"
related_terms = ["percentile", "scatter-plot", "seasonality", "sequential-scan", "precision"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["pivot table", "cross-tabulation", "data analysis", "aggregation", "OLAP", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis", "analytics", "visualization"]
quality_score = 76
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Pivot Table - Prismatic Platform"
+++

## Definition & Overview

A pivot table is a data summarization technique that rotates (pivots) rows into columns, enabling multidimensional analysis through cross-tabulation. Given a flat dataset, a pivot table selects row dimensions, column dimensions, and aggregation functions to produce a summary matrix. This transformation converts detailed transactional data into analytical views that reveal patterns across multiple categorical dimensions simultaneously.

The concept originates from spreadsheet software but extends to database operations (PIVOT/UNPIVOT in SQL), OLAP cubes, and programmatic data transformation libraries. In analytical databases, pivot operations are implemented as specialized query plans that group by one dimension, spread values across another dimension, and apply aggregation functions (SUM, COUNT, AVG, MIN, MAX) to produce the cross-tabulated result.

The Prismatic Platform uses pivot-table concepts extensively in its analytics and reporting subsystems. Security assessment data is pivoted by risk category and severity to produce heatmaps. OSINT tool execution data is pivoted by category and time period to reveal usage patterns. Quality metrics are pivoted by application and domain to produce compliance matrices. The underlying implementation uses Elixir's Enum functions for in-memory pivots and PostgreSQL's crosstab extension for database-level pivots.

## Technical Deep Dive

Implementing pivot tables in Elixir leverages the language's powerful enumeration and grouping primitives. The `Enum.group_by/3` function combined with `Map.new/2` provides a clean functional approach to cross-tabulation without external dependencies.

```elixir
defmodule PrismaticAnalytics.PivotTable do
  @moduledoc """
  Functional pivot table implementation supporting arbitrary
  row/column dimensions and aggregation functions.
  """

  @type dimension :: atom() | String.t()
  @type aggregator :: (list() -> number())
  @type pivot_result :: %{rows: [map()], columns: [term()], totals: map()}

  @spec pivot([map()], dimension(), dimension(), dimension(), aggregator()) :: pivot_result()
  def pivot(data, row_key, col_key, value_key, aggregator \\ &Enum.sum/1) do
    grouped =
      data
      |> Enum.group_by(fn row -> {Map.get(row, row_key), Map.get(row, col_key)} end)
      |> Map.new(fn {{row, col}, entries} ->
        values = Enum.map(entries, &Map.get(&1, value_key, 0))
        {{row, col}, aggregator.(values)}
      end)

    columns =
      data
      |> Enum.map(&Map.get(&1, col_key))
      |> Enum.uniq()
      |> Enum.sort()

    row_keys =
      data
      |> Enum.map(&Map.get(&1, row_key))
      |> Enum.uniq()
      |> Enum.sort()

    rows =
      Enum.map(row_keys, fn rk ->
        values = Map.new(columns, fn col -> {col, Map.get(grouped, {rk, col}, 0)} end)
        row_total = values |> Map.values() |> Enum.sum()
        Map.merge(%{__row_key__ => rk, __total__ => row_total}, values)
      end)

    col_totals =
      Map.new(columns, fn col ->
        total =
          row_keys
          |> Enum.map(fn rk -> Map.get(grouped, {rk, col}, 0) end)
          |> Enum.sum()

        {col, total}
      end)

    %{rows: rows, columns: columns, totals: col_totals}
  end

  @spec to_table(pivot_result()) :: [[term()]]
  def to_table(%{rows: rows, columns: columns}) do
    header = ["" | columns ++ ["Total"]]

    data_rows =
      Enum.map(rows, fn row ->
        row_key = row[:__row_key__]
        values = Enum.map(columns, fn col -> Map.get(row, col, 0) end)
        [row_key | values ++ [row[:__total__]]]
      end)

    [header | data_rows]
  end
end
```

For large datasets that cannot fit in memory, the platform delegates pivot operations to PostgreSQL using the `tablefunc` extension's `crosstab()` function, which executes the pivot entirely within the database engine.

```elixir
defmodule PrismaticAnalytics.PivotTable.SQL do
  @moduledoc """
  PostgreSQL-backed pivot table using crosstab for large datasets
  that exceed in-memory processing capacity.
  """

  import Ecto.Query

  @spec crosstab(Ecto.Repo.t(), String.t(), String.t(), String.t(), String.t()) ::
          {:ok, [map()]} | {:error, term()}
  def crosstab(repo, table, row_col, pivot_col, value_col) do
    columns_query = """
    SELECT DISTINCT #{pivot_col}::text FROM #{table} ORDER BY 1
    """

    {:ok, %{rows: col_rows}} = repo.query(columns_query)
    columns = Enum.map(col_rows, fn [col] -> col end)

    col_defs =
      columns
      |> Enum.map(fn col -> ~s("#{col}" numeric) end)
      |> Enum.join(", ")

    pivot_query = """
    SELECT * FROM crosstab(
      'SELECT #{row_col}::text, #{pivot_col}::text, SUM(#{value_col}::numeric)
       FROM #{table}
       GROUP BY 1, 2
       ORDER BY 1, 2',
      '#{columns_query}'
    ) AS ct(row_name text, #{col_defs})
    """

    case repo.query(pivot_query) do
      {:ok, %{rows: rows, columns: result_columns}} ->
        maps = Enum.map(rows, fn row -> Enum.zip(result_columns, row) |> Map.new() end)
        {:ok, maps}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

## Architecture & Implementation

Pivot table generation in the Prismatic Platform follows a request-response pattern where the user specifies dimensions and aggregations through the LiveView dashboard, and the system determines whether to execute the pivot in-memory (for datasets under 100K rows) or via PostgreSQL crosstab (for larger datasets). This adaptive execution strategy ensures responsive UI while handling arbitrary data volumes.

The architecture separates pivot specification (what to pivot) from pivot execution (how to compute it). The specification is a data structure describing row dimensions, column dimensions, value fields, and aggregation functions. The execution engine selects the optimal implementation based on dataset size, available indexes, and query complexity.

Results are cached in ETS with a configurable TTL, enabling rapid re-rendering of dashboard components without recomputing identical pivots. Cache keys include the full pivot specification hash, ensuring that any parameter change triggers fresh computation.

## Usage in Prismatic Platform

The Prismatic Platform uses pivot tables across security dashboards, OSINT analytics, and quality reporting. The Perimeter module pivots vulnerability data by asset type and severity for executive risk heatmaps. The OSINT toolbox pivots tool execution counts by category and time period for usage analytics.

```elixir
defmodule PrismaticWeb.Analytics.SecurityPivotLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    pivot_data = compute_security_pivot()

    socket =
      socket
      |> assign(:pivot, pivot_data)
      |> assign(:row_dim, :asset_type)
      |> assign(:col_dim, :severity)

    {:ok, socket}
  end

  defp compute_security_pivot do
    vulnerabilities = PrismaticPerimeter.list_vulnerabilities()

    PrismaticAnalytics.PivotTable.pivot(
      vulnerabilities,
      :asset_type,
      :severity,
      :count,
      &Enum.sum/1
    )
  end
end
```

## Cross-References

- [Percentile](/glossary/percentile/) - Statistical measure often computed alongside pivot aggregations
- **Scatter Plot** - Visualization complementing pivot table summaries
- **Sequential Scan** - Database operation underlying large pivot computations
- **Seasonality** - Temporal patterns revealed through time-dimensioned pivot tables
- **Profiling** - Performance measurement of pivot computation operations

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
