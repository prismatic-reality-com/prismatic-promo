+++
title = "Cross-Tabulation"
weight = 50
[extra]
description = "A statistical technique that displays the frequency distribution of two or more categorical variables in a contingency table (pivot table) format for pattern analysis"
category = "data-analysis"
related_terms = ["correlation", "covariance", "chart", "analytics", "completeness"]
complexity_level = "intermediate"
platform_integration = "reference"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cross-tabulation", "pivot table", "contingency table", "crosstab", "frequency analysis", "categorical data", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis", "statistics"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Cross-Tabulation - Prismatic Platform"
+++

## Definition & Overview

Cross-tabulation (also known as contingency table analysis, crosstab, or pivot table analysis) is a statistical technique that displays the joint frequency distribution of two or more categorical variables in a matrix format. Each cell in the cross-tabulation table shows the count (or proportion) of observations that fall into the intersection of the row and column categories. This visual and analytical technique reveals patterns, associations, and dependencies between categorical variables that may not be apparent from individual frequency distributions.

Cross-tabulation has roots in Karl Pearson's work on contingency tables in the early 1900s. The associated chi-squared test of independence determines whether the observed cell frequencies differ significantly from what would be expected if the variables were independent. Additional measures like Cramer's V quantify the strength of association between the categorical variables.

In the Prismatic Platform, cross-tabulation is used extensively in OSINT intelligence analysis (cross-referencing entity attributes across sources), security assessment (categorizing findings by severity and domain), quality analytics (violation types by app), and DD pipeline analysis (entity types by source and jurisdiction). The technique transforms raw categorical data into structured insights that support decision-making across all platform domains.

## Technical Deep Dive

### Cross-Tabulation Components

| Component | Description | Computed From |
|-----------|-------------|---------------|
| **Observed Frequencies** | Actual cell counts | Raw data |
| **Expected Frequencies** | Frequencies if independent | Row/column totals |
| **Row Percentages** | Cell / row total * 100 | Observed frequencies |
| **Column Percentages** | Cell / column total * 100 | Observed frequencies |
| **Chi-Squared Statistic** | Sum((O-E)^2/E) | Observed vs. expected |
| **Cramer's V** | sqrt(chi2 / (n * min(r-1, c-1))) | Chi-squared statistic |

### Cross-Tabulation Engine

```elixir
defmodule PrismaticAnalytics.CrossTabulation do
  @moduledoc """
  Computes cross-tabulation (contingency) tables for categorical data.
  Used by OSINT intelligence analysis, security assessment, and
  quality analytics across the Prismatic Platform.
  """

  @type crosstab :: %{
    row_variable: String.t(),
    col_variable: String.t(),
    row_labels: [String.t()],
    col_labels: [String.t()],
    frequencies: [[non_neg_integer()]],
    row_totals: [non_neg_integer()],
    col_totals: [non_neg_integer()],
    grand_total: non_neg_integer(),
    chi_squared: float(),
    cramers_v: float(),
    p_value_approx: float()
  }

  @spec compute([map()], atom(), atom()) :: {:ok, crosstab()}
  def compute(records, row_var, col_var) do
    row_values = records |> Enum.map(&Map.get(&1, row_var)) |> Enum.uniq() |> Enum.sort()
    col_values = records |> Enum.map(&Map.get(&1, col_var)) |> Enum.uniq() |> Enum.sort()

    frequencies = Enum.map(row_values, fn row ->
      Enum.map(col_values, fn col ->
        Enum.count(records, fn r ->
          Map.get(r, row_var) == row and Map.get(r, col_var) == col
        end)
      end)
    end)

    row_totals = Enum.map(frequencies, &Enum.sum/1)
    col_totals = transpose(frequencies) |> Enum.map(&Enum.sum/1)
    grand_total = Enum.sum(row_totals)

    chi_sq = chi_squared(frequencies, row_totals, col_totals, grand_total)
    v = cramers_v(chi_sq, grand_total, length(row_values), length(col_values))

    {:ok, %{
      row_variable: Atom.to_string(row_var),
      col_variable: Atom.to_string(col_var),
      row_labels: Enum.map(row_values, &to_string/1),
      col_labels: Enum.map(col_values, &to_string/1),
      frequencies: frequencies,
      row_totals: row_totals,
      col_totals: col_totals,
      grand_total: grand_total,
      chi_squared: chi_sq,
      cramers_v: v,
      p_value_approx: approximate_p_value(chi_sq, length(row_values), length(col_values))
    }}
  end

  defp chi_squared(frequencies, row_totals, col_totals, grand_total) when grand_total > 0 do
    frequencies
    |> Enum.with_index()
    |> Enum.flat_map(fn {row, i} ->
      row
      |> Enum.with_index()
      |> Enum.map(fn {observed, j} ->
        expected = Enum.at(row_totals, i) * Enum.at(col_totals, j) / grand_total
        if expected > 0, do: (observed - expected) ** 2 / expected, else: 0.0
      end)
    end)
    |> Enum.sum()
  end
  defp chi_squared(_, _, _, _), do: 0.0

  defp cramers_v(chi_sq, n, rows, cols) when n > 0 do
    k = min(rows - 1, cols - 1)
    if k > 0, do: :math.sqrt(chi_sq / (n * k)), else: 0.0
  end
  defp cramers_v(_, _, _, _), do: 0.0

  defp approximate_p_value(chi_sq, rows, cols) do
    df = (rows - 1) * (cols - 1)
    if df > 0 and chi_sq > 0, do: :math.exp(-chi_sq / (2 * df)), else: 1.0
  end

  defp transpose([[] | _]), do: []
  defp transpose(matrix) do
    [Enum.map(matrix, &hd/1) | transpose(Enum.map(matrix, &tl/1))]
  end
end
```

### Platform Cross-Tabulation Use Cases

| Analysis | Row Variable | Column Variable | Insight |
|----------|-------------|----------------|---------|
| **OSINT Coverage** | Tool category | Data dimension | Coverage gaps |
| **Security Findings** | Severity | Domain | Risk concentration |
| **Quality Metrics** | App name | Violation type | Problem areas |
| **DD Entities** | Source | Entity type | Source completeness |
| **Academy Progress** | Topic | Difficulty | Learner distribution |
| **Compliance** | Framework | Control status | Compliance gaps |

## Architecture & Implementation

The cross-tabulation engine is designed as a stateless computation module that accepts raw records and produces structured contingency tables. This functional design integrates naturally with the platform's data pipeline architecture -- records from any source (OSINT results, DD entities, quality metrics, Academy progress) can be cross-tabulated by passing them through the same engine with different variable selections.

For visualization, cross-tabulation results are rendered as heatmap charts (using the Chart.js component) where cell color intensity represents frequency. Marginal totals are displayed as bar charts along the edges. The chi-squared test result and Cramer's V statistic are shown as summary metrics, indicating whether the observed association between variables is statistically significant.

The engine handles sparse data gracefully -- zero-frequency cells are displayed with explicit zeros rather than being omitted, ensuring that the absence of data is visible. This aligns with the NABLA framework's Absence Informative axiom, which treats missing data as information rather than noise.

## Usage in Prismatic Platform

OSINT intelligence analysis uses cross-tabulation to identify coverage gaps across tool categories and data dimensions. A crosstab of "Tool Category" by "Intelligence Dimension" (identity, financial, legal, social, digital footprint) reveals which dimensions have strong multi-source coverage and which rely on single tools -- directly informing the Signal Plurality axiom's requirements.

The quality analytics dashboard cross-tabulates violation types by umbrella app, producing a matrix that shows exactly which apps have which types of quality issues. This targeted view enables focused remediation rather than broad-brush quality improvement, and has been instrumental in achieving the platform's 100/100 quality score.

The DD pipeline uses cross-tabulation to compare entity type distributions across its four registered sources (ForbesCz, Parliament, Senate, LocalGov). Differences in entity type distributions between sources highlight complementary data coverage and potential gaps that could affect entity resolution accuracy.

The Perimeter compliance engine cross-tabulates compliance control status by regulatory framework, showing at a glance which controls are compliant across all frameworks and which have framework-specific gaps. This multi-framework view is particularly valuable for organizations subject to both NIS2 and ZKB simultaneously.

## Cross-References

- [Correlation](/glossary/correlation/) - continuous variable relationship measure (complement to crosstab)
- [Covariance](/glossary/covariance/) - continuous joint variability measure
- [Chart](/glossary/chart/) - heatmap visualization of cross-tabulation results
- [Analytics](/glossary/analytics/) - data analysis encompassing cross-tabulation
- [Completeness](/glossary/completeness/) - data quality revealed by cross-tabulation gaps
- **Livebooks**: `livebooks/domains/data_analysis/` - interactive cross-tabulation analysis
- **Academy**: Statistical analysis methods and data exploration techniques

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
