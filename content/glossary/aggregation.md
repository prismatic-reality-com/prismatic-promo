+++
title = "Aggregation"
weight = 50
[extra]
description = "The process of collecting, combining, and summarizing data from multiple sources into consolidated datasets for analysis, reporting, or decision-making"
category = "data-analytics"
related_terms = ["correlation", "accuracy", "batch-processing", "anomaly-detection", "cross-tabulation", "completeness", "chart"]
tags = ["glossary", "aggregation", "data-processing", "analytics", "etl", "pipeline", "osint", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
difficulty = "intermediate"
quality_score = 85
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Aggregation combines data from multiple sources into unified intelligence products, critical for OSINT multi-source correlation and the DD pipeline's entity consolidation"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["data aggregation", "multi-source", "ETL", "data consolidation", "OSINT fusion", "signal aggregation", "pipeline processing", "data summarization", "entity resolution"]
image = "/images/sections/glossary.png"
image_alt = "Aggregation - Prismatic Platform"
word_count = 980
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

Aggregation is the process of collecting, combining, and summarizing data from multiple disparate sources into a unified, consolidated representation suitable for analysis, reporting, or automated decision-making. In intelligence contexts, aggregation transforms raw signals from individual sources into fused intelligence products that provide a more complete picture than any single source could. The process must balance comprehensiveness with accuracy, as naive aggregation can introduce distortions or mask important signal variations.

In the Prismatic Platform, aggregation is a core operation across the OSINT toolbox (127 adapters producing correlated intelligence), the DD pipeline (entity consolidation from Czech registries), and the Blue Team signal aggregation for epistemic defense.

## Technical Deep Dive

### Aggregation Strategies

| Strategy | Description | Use Case | Risk |
|----------|-------------|----------|------|
| **Union** | Combine all records from all sources | Complete data collection | Duplicates |
| **Merge** | Combine matching records by key | Entity resolution | Conflicts |
| **Rollup** | Summarize detail into higher levels | Reporting, dashboards | Information loss |
| **Window** | Time-bounded aggregation | Streaming analytics | Boundary effects |
| **Hierarchical** | Multi-level aggregation | Organizational data | Simpson's paradox |

### Aggregation vs. Fusion

Aggregation collects and combines data mechanically. Fusion adds analytical judgment -- resolving conflicts, weighting sources by reliability, and producing assessed intelligence. The Prismatic Platform's Blue Team signal aggregator performs fusion, not mere aggregation, by applying NABLA axiom weights to source contributions.

## Architecture and Implementation

```elixir
defmodule PrismaticOsintCore.SignalAggregator do
  @moduledoc """
  Multi-source signal aggregation for OSINT intelligence production.
  Combines results from multiple adapters while preserving source
  provenance and applying NABLA plurality requirements.
  """

  @type signal :: %{
          source: String.t(),
          data: map(),
          confidence: float(),
          timestamp: DateTime.t()
        }

  @type aggregated :: %{
          signals: [signal()],
          source_count: non_neg_integer(),
          consensus: map(),
          confidence: float(),
          aggregated_at: DateTime.t()
        }

  @spec aggregate([signal()], keyword()) :: {:ok, aggregated()} | {:error, :insufficient_sources}
  def aggregate(signals, opts \\ []) do
    min_sources = Keyword.get(opts, :min_sources, 2)

    unique_sources = signals |> Enum.map(& &1.source) |> Enum.uniq() |> length()

    if unique_sources < min_sources do
      {:error, :insufficient_sources}
    else
      consensus = compute_consensus(signals)
      overall_confidence = compute_weighted_confidence(signals)

      result = %{
        signals: signals,
        source_count: unique_sources,
        consensus: consensus,
        confidence: overall_confidence,
        aggregated_at: DateTime.utc_now()
      }

      :telemetry.execute(
        [:prismatic, :osint, :aggregation, :completed],
        %{source_count: unique_sources, confidence: overall_confidence},
        %{}
      )

      {:ok, result}
    end
  end

  @spec compute_consensus([signal()]) :: map()
  defp compute_consensus(signals) do
    signals
    |> Enum.map(& &1.data)
    |> Enum.reduce(%{}, fn data, acc ->
      Map.merge(acc, data, fn _key, v1, v2 ->
        if v1 == v2, do: v1, else: {:conflict, [v1, v2]}
      end)
    end)
  end

  @spec compute_weighted_confidence([signal()]) :: float()
  defp compute_weighted_confidence(signals) do
    total_weight = length(signals)

    if total_weight > 0 do
      sum = Enum.reduce(signals, 0.0, fn s, acc -> acc + s.confidence end)
      Float.round(sum / total_weight, 4)
    else
      0.0
    end
  end
end
```

## Usage in Prismatic Platform

- **OSINT Multi-Source Fusion**: Aggregating results from multiple OSINT adapters into unified intelligence reports
- **DD Entity Resolution**: Merging entity data from Forbes CZ, Parliament, Senate, and LocalGov sources
- **Blue Team Signal Aggregation**: The `blue-signal-aggregator` agent correlates signals across security domains
- **Dashboard Metrics**: Aggregating telemetry data for LiveView dashboard visualizations
- **Quality Metrics**: Aggregating quality scores across 115 umbrella apps for the Quality Floor Guardian

## Code Examples

### DD Pipeline Entity Aggregation

```elixir
defmodule PrismaticDd.EntityAggregator do
  @moduledoc """
  Aggregates entity records from multiple DD sources into
  unified entity profiles with full source provenance tracking.
  """

  @spec aggregate_entity(String.t(), [map()]) :: {:ok, map()}
  def aggregate_entity(entity_key, source_records) do
    merged = Enum.reduce(source_records, %{}, fn record, acc ->
      Map.merge(acc, record.attributes, fn _k, existing, new ->
        if existing == new, do: existing, else: [existing, new] |> List.flatten() |> Enum.uniq()
      end)
    end)

    entity = %{
      key: entity_key,
      attributes: merged,
      sources: Enum.map(source_records, & &1.source_slug),
      source_count: length(source_records),
      last_aggregated: DateTime.utc_now()
    }

    {:ok, entity}
  end
end
```

## Best Practices

1. **Preserve source provenance**: Every aggregated value must be traceable to its original source. This is a NABLA provenance mandatory axiom requirement.

2. **Detect and handle conflicts**: When sources disagree, preserve both values with conflict metadata rather than silently picking one.

3. **Enforce source plurality**: The NABLA framework requires minimum 2 independent sources before establishing aggregated beliefs.

4. **Apply time-decay weighting**: More recent data should carry higher weight in aggregated results.

5. **Monitor aggregation quality**: Track aggregation coverage, conflict rates, and consensus levels over time.

6. **Avoid premature summarization**: Preserve raw signals alongside aggregated views to enable re-analysis.

## Related Terms

- **Correlation** -- statistical relationships between aggregated variables
- [Batch Processing](/glossary/batch-processing/) -- processing aggregation in bulk
- [Accuracy](/glossary/accuracy/) -- quality measure of aggregated results
- **Completeness** -- coverage measure of aggregated data
- **Cross-tabulation** -- multi-dimensional aggregation analysis
- **Chart** -- visualization of aggregated data

## See Also

- [DD Pipeline Architecture](/glossary/pipeline/) -- entity aggregation pipeline
- [OSINT Toolbox](/osint/) -- multi-source intelligence aggregation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
