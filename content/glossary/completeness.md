+++
title = "Completeness"
weight = 50
[extra]
description = "A data quality dimension measuring whether all required data elements are present and populated, with no missing values in mandatory fields"
category = "data-quality"
related_terms = ["consistency", "accuracy", "completion", "data-quality", "assessment"]
complexity_level = "intermediate"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["completeness", "data quality", "missing data", "data validation", "null handling", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-quality", "validation"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Completeness - Prismatic Platform"
+++

## Definition & Overview

Completeness is a fundamental dimension of data quality that measures whether all required data elements within a dataset are present and populated. A dataset achieves completeness when every mandatory field contains a valid value for every record, no expected records are missing, and no partial records exist where required attributes are absent. Completeness is typically expressed as a percentage: the ratio of populated required fields to total required fields across all records.

Data completeness operates at multiple granularities: field-level completeness (is this specific attribute populated?), record-level completeness (does this record have all required attributes?), and dataset-level completeness (are all expected records present?). Each level requires different measurement and enforcement strategies. A dataset can be 100% field-complete but dataset-incomplete if expected records are missing entirely.

In the Prismatic Platform, completeness is critical across several subsystems. The DD (Due Diligence) pipeline measures entity completeness when loading from external sources -- Forbes data may include name and position but lack birth dates, while Parliament data includes full biographical records. The OSINT toolbox evaluates intelligence completeness when correlating signals from multiple sources. The Quality DNA system enforces codebase completeness -- every app must have CLAUDE.md documentation, quality DNA configuration, and comprehensive test coverage.

## Technical Deep Dive

### Completeness Measurement Levels

| Level | Measure | Formula | Example |
|-------|---------|---------|---------|
| **Field** | Single attribute | `populated / total_records` | 95% of entities have email |
| **Record** | All required fields | `complete_records / total_records` | 78% fully populated |
| **Dataset** | Expected record count | `actual_records / expected_records` | 92% of parliament members |
| **Temporal** | Time coverage | `periods_with_data / total_periods` | Data for 11/12 months |
| **Cross-source** | Source agreement | `sources_reporting / total_sources` | 3/5 sources confirm entity |

### Completeness Validation in DD Pipeline

```elixir
defmodule PrismaticDd.CompletenessValidator do
  @moduledoc """
  Validates data completeness for DD entity records during the
  Load phase. Produces a completeness report per source and per entity.
  """

  @type completeness_report :: %{
    source: atom(),
    total_records: non_neg_integer(),
    complete_records: non_neg_integer(),
    completeness_pct: float(),
    field_completeness: %{String.t() => float()},
    missing_critical: [String.t()]
  }

  @required_fields ~w(name entity_type source_id)a
  @important_fields ~w(description category jurisdiction date_of_birth position)a

  @spec validate_batch([map()], atom()) :: {:ok, completeness_report()}
  def validate_batch(records, source) do
    total = length(records)
    field_stats = calculate_field_completeness(records)

    complete = Enum.count(records, fn record ->
      Enum.all?(@required_fields, &Map.has_key?(record, &1))
    end)

    missing_critical = @required_fields
    |> Enum.filter(fn field ->
      Map.get(field_stats, Atom.to_string(field), 1.0) < 1.0
    end)
    |> Enum.map(&Atom.to_string/1)

    report = %{
      source: source,
      total_records: total,
      complete_records: complete,
      completeness_pct: if(total > 0, do: complete / total * 100.0, else: 0.0),
      field_completeness: field_stats,
      missing_critical: missing_critical
    }

    {:ok, report}
  end

  defp calculate_field_completeness(records) do
    total = length(records)

    (@required_fields ++ @important_fields)
    |> Enum.map(fn field ->
      populated = Enum.count(records, fn record ->
        value = Map.get(record, field)
        value != nil and value != ""
      end)

      {Atom.to_string(field), if(total > 0, do: populated / total, else: 0.0)}
    end)
    |> Map.new()
  end
end
```

### Completeness in OSINT Context

```elixir
defmodule PrismaticOsintCore.IntelligenceCompleteness do
  @moduledoc """
  Evaluates intelligence completeness across OSINT tool results.
  A complete intelligence picture requires signals from multiple
  independent sources (NABLA Signal Plurality axiom).
  """

  @minimum_sources 2
  @intelligence_dimensions ~w(identity digital_footprint financial legal social)a

  @spec evaluate(String.t(), [map()]) :: {:ok, map()} | {:incomplete, map()}
  def evaluate(target_id, results) do
    dimension_coverage = @intelligence_dimensions
    |> Enum.map(fn dim ->
      sources = Enum.filter(results, &(&1.dimension == dim))
      {dim, %{
        source_count: length(sources),
        has_plurality: length(sources) >= @minimum_sources,
        confidence: calculate_dimension_confidence(sources)
      }}
    end)
    |> Map.new()

    overall = Enum.count(dimension_coverage, fn {_dim, info} -> info.has_plurality end)
    total = length(@intelligence_dimensions)

    report = %{
      target_id: target_id,
      dimension_coverage: dimension_coverage,
      overall_completeness: overall / total * 100.0,
      meets_nabla_plurality: overall == total
    }

    if overall == total, do: {:ok, report}, else: {:incomplete, report}
  end

  defp calculate_dimension_confidence(sources) when length(sources) == 0, do: 0.0
  defp calculate_dimension_confidence(sources) do
    Enum.sum(Enum.map(sources, & &1.confidence)) / length(sources)
  end
end
```

## Architecture & Implementation

The Prismatic Platform treats completeness as a measurable, enforceable quality dimension rather than an aspirational goal. The DD pipeline's Loader phase validates completeness before persisting entities to PostgreSQL. Records failing required-field completeness checks are flagged in the `dd_load_runs` table with detailed missing-field reports, enabling operators to identify and address data quality issues at the source level.

The OSINT intelligence completeness evaluator aligns with NABLA Infinity's Signal Plurality axiom, which requires a minimum of two independent signals before establishing a belief. The completeness engine tracks which intelligence dimensions have achieved plurality and which remain incomplete, providing operators with a clear picture of investigation gaps.

For codebase completeness, the Universal App Quality Standard enforces that every umbrella app has standardized mix.exs configuration, CLAUDE.md documentation, quality DNA tracking, and comprehensive test coverage. The `mix quality.enforce_standard` command measures compliance across all 115 apps, achieving a current average of 55.5/60 points.

## Usage in Prismatic Platform

The DD pipeline dashboard at `/hub/dd/pipeline` displays completeness metrics per source using heatmap visualizations. Operators can immediately see which sources provide the most complete data and which have systematic gaps. The Scheduler prioritizes refresh operations for sources with declining completeness, ensuring the entity database remains as complete as possible.

The Perimeter module factors data completeness into its security rating confidence scores. An organization assessment based on complete data from multiple sources receives higher confidence than one based on partial data from a single source. The rating display explicitly shows the completeness level to help users interpret the grade's reliability.

## Cross-References

- **Consistency** - complementary data quality dimension
- [Accuracy](/glossary/accuracy/) - correctness of populated values
- **Completion** - learning progress metric (distinct concept)
- [Assessment](/glossary/assessment/) - evaluation process using completeness data
- **Livebooks**: `livebooks/domains/data_analysis/` - data quality analysis
- **Academy**: Data quality dimensions in analytical topics

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
