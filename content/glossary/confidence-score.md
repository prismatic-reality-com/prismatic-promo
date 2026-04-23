+++
title = "Confidence Score"
weight = 50
[extra]
description = "A numerical reliability metric assigned to OSINT signals and intelligence findings, quantifying the trustworthiness of individual data points on a 0-100 scale"
category = "osint"
related_terms = ["confidence", "confidence-scoring", "confidence-threshold", "correlation", "accuracy"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["confidence score", "OSINT reliability", "signal quality", "intelligence metric", "data trustworthiness", "glossary", "Prismatic Platform"]
tags = ["glossary", "osint", "metrics"]
quality_score = 78
see_also = ["capabilities", "osint"]
image = "/images/sections/glossary.png"
image_alt = "Confidence Score - Prismatic Platform"
+++

## Definition & Overview

A confidence score is a numerical reliability metric assigned to individual OSINT signals, intelligence findings, and data points that quantifies the trustworthiness of that specific piece of information. While epistemic confidence (see: Confidence) measures overall belief justification for a claim, a confidence score is a per-signal metric that reflects the quality, reliability, and verifiability of a single data source or finding.

Confidence scores typically incorporate multiple factors: source reliability (is this a trusted database or an unverified forum post?), data freshness (when was this information last verified?), corroboration level (do other independent sources agree?), and collection method quality (was this gathered through official APIs or scraped from uncertain sources?). The combination of these factors produces a composite score that helps analysts prioritize and weight information during intelligence synthesis.

In the Prismatic Platform, confidence scores are assigned by each of the 127 OSINT tools as part of their response envelopes. Official government databases (Czech ARES, Companies House, SEC EDGAR) produce high confidence scores (85-100), while aggregated open-source data and social media signals produce lower scores (40-70). The NABLA framework's ConfidenceEngine aggregates individual confidence scores from multiple tools into composite claim-level confidence, applying plurality requirements and time decay.

## Technical Deep Dive

### Confidence Score Factors

| Factor | Weight | Range | Description |
|--------|--------|-------|-------------|
| **Source Authority** | 30% | 0-100 | Official/government vs. crowdsourced |
| **Data Freshness** | 25% | 0-100 | Time since last verification |
| **Corroboration** | 25% | 0-100 | Independent source agreement |
| **Collection Method** | 10% | 0-100 | API vs. scraping vs. manual |
| **Historical Accuracy** | 10% | 0-100 | Source's track record |

### OSINT Tool Confidence Scoring

```elixir
defmodule PrismaticOsintCore.ConfidenceScorer do
  @moduledoc """
  Assigns confidence scores to OSINT tool results.
  Each tool category has baseline scores adjusted by
  data quality factors specific to the result.
  """

  @type scored_result :: %{
    tool_slug: String.t(),
    data: map(),
    confidence_score: non_neg_integer(),
    score_breakdown: map(),
    scoring_timestamp: DateTime.t()
  }

  @source_authority_baselines %{
    government_registry: 90,
    financial_regulator: 85,
    sanctions_list: 95,
    commercial_database: 70,
    search_engine: 50,
    social_media: 40,
    dark_web: 25,
    user_submitted: 30
  }

  @spec score(String.t(), map(), keyword()) :: {:ok, scored_result()}
  def score(tool_slug, result, opts \\ []) do
    source_type = Keyword.get(opts, :source_type, :commercial_database)
    base = Map.get(@source_authority_baselines, source_type, 50)

    freshness = calculate_freshness_score(result)
    corroboration = Keyword.get(opts, :corroboration_score, 50)
    method = Keyword.get(opts, :method_score, 70)
    history = Keyword.get(opts, :history_score, 70)

    composite = round(
      base * 0.30 +
      freshness * 0.25 +
      corroboration * 0.25 +
      method * 0.10 +
      history * 0.10
    )

    scored = %{
      tool_slug: tool_slug,
      data: result,
      confidence_score: min(composite, 100),
      score_breakdown: %{
        source_authority: base,
        freshness: freshness,
        corroboration: corroboration,
        collection_method: method,
        historical_accuracy: history
      },
      scoring_timestamp: DateTime.utc_now()
    }

    {:ok, scored}
  end

  defp calculate_freshness_score(result) do
    case Map.get(result, :last_updated) do
      nil -> 50
      timestamp ->
        age_days = DateTime.diff(DateTime.utc_now(), timestamp, :day)
        cond do
          age_days <= 1 -> 100
          age_days <= 7 -> 90
          age_days <= 30 -> 75
          age_days <= 90 -> 60
          age_days <= 365 -> 40
          true -> 20
        end
    end
  end
end
```

### Tool Category Baseline Scores

| Category | Tools | Baseline Range | Source Type |
|----------|-------|---------------|------------|
| **Czech Government** | ARES, Justice, ISIR | 85-95 | Government registry |
| **Sanctions** | EU, OFAC SDN, UN | 90-95 | Sanctions list |
| **UK/US Government** | Companies House, SEC EDGAR | 85-90 | Government registry |
| **Global Security** | Shodan, VirusTotal, Censys | 65-80 | Commercial database |
| **Email/Identity** | Hunter.io, EmailIntelligence | 55-70 | Commercial database |
| **Social Media** | Social OSINT adapters | 35-55 | Social media |

### Score Aggregation for Multi-Source Claims

```elixir
defmodule PrismaticOsintCore.ScoreAggregator do
  @moduledoc """
  Aggregates individual confidence scores from multiple OSINT
  tools into a composite claim confidence level.
  Implements NABLA Signal Plurality enforcement.
  """

  @minimum_signals 2

  @spec aggregate([map()]) :: {:ok, float()} | {:insufficient, float()}
  def aggregate(scored_results) when length(scored_results) < @minimum_signals do
    avg = average_scores(scored_results)
    {:insufficient, avg * 0.6}
  end

  def aggregate(scored_results) do
    independent_groups = group_by_source(scored_results)

    if map_size(independent_groups) >= @minimum_signals do
      weighted_avg = scored_results
      |> Enum.map(& &1.confidence_score)
      |> weighted_average()

      {:ok, weighted_avg / 100.0}
    else
      avg = average_scores(scored_results)
      {:insufficient, avg * 0.7 / 100.0}
    end
  end

  defp average_scores(results) do
    scores = Enum.map(results, & &1.confidence_score)
    if length(scores) > 0, do: Enum.sum(scores) / length(scores), else: 0.0
  end

  defp weighted_average(scores) do
    total_weight = Enum.sum(scores)
    if total_weight > 0 do
      Enum.sum(Enum.map(scores, fn s -> s * s end)) / total_weight
    else
      0.0
    end
  end

  defp group_by_source(results) do
    Enum.group_by(results, & &1.tool_slug)
  end
end
```

## Architecture & Implementation

The confidence scoring system is integrated at the OSINT tool response level. Every tool that implements the `PrismaticOsintCore.Tool` behaviour returns results wrapped in a standardized envelope that includes the confidence score. The scoring happens at two levels: the tool itself assigns an initial score based on its source type and result quality, and the ConfidenceScorer module applies cross-cutting scoring factors (freshness, corroboration, method).

When multiple tools return data about the same entity, the ScoreAggregator produces a composite confidence. Results from independent sources receive a trust bonus (reflecting the Signal Plurality axiom), while results from the same source family are weighted to avoid double-counting. The NABLA framework's minimum two-signal requirement means that single-source findings are automatically penalized with a 30-40% confidence reduction.

## Usage in Prismatic Platform

The OSINT toolbox dashboard displays confidence scores as color-coded badges on each result: green (80-100), yellow (60-79), orange (40-59), red (0-39). Analysts can filter and sort results by confidence score, focusing their attention on the most reliable information first.

The DD pipeline uses confidence scores when loading entity data from external sources. Higher-confidence records from government registries take precedence over lower-confidence data from commercial databases when resolving entity attribute conflicts. The diff detection mechanism in the Loader tracks confidence changes over time, alerting operators when a previously high-confidence data point's score degrades.

The Perimeter security rating explicitly communicates its confidence score to users alongside the A-F grade. A "B+" rating with 92% confidence is more actionable than a "B+" with 55% confidence, and the platform ensures that this distinction is visible in every assessment report.

## Cross-References

- [Confidence](/glossary/confidence/) - epistemic certainty framework
- [Confidence Scoring](/glossary/confidence-scoring/) - scoring methodology detail
- [Confidence Threshold](/glossary/confidence-threshold/) - action thresholds
- **Correlation** - statistical relationships boosting confidence
- [Accuracy](/glossary/accuracy/) - data correctness affecting scores
- **Livebooks**: `livebooks/domains/osint_intelligence/` - confidence scoring labs
- **Academy**: OSINT Signal Synthesis (GRACE framework) teaches confidence scoring

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
