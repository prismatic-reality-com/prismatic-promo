+++
title = "Precision"
weight = 50
[extra]
description = "Machine learning metric measuring the proportion of true positive predictions among all positive predictions"
category = "data-analysis"
related_terms = ["percentile", "accuracy", "property-test", "scatter-plot", "profiling"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["precision", "machine learning", "true positive rate", "classification", "metrics", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-analysis", "machine-learning", "metrics"]
quality_score = 77
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Precision - Prismatic Platform"
+++

## Definition & Overview

Precision is a classification metric that measures the proportion of true positive predictions among all instances predicted as positive. Formally, precision = TP / (TP + FP), where TP is the count of true positives and FP is the count of false positives. A precision of 0.95 means that 95% of instances the model classified as positive were actually positive, while 5% were false alarms.

Precision is particularly important in contexts where false positives carry high costs. In OSINT intelligence, a false positive PEP match could trigger unnecessary enhanced due diligence, wasting investigator time and potentially damaging client relationships. In security scanning, false positive vulnerability alerts create alert fatigue, causing real threats to be overlooked. In sanctions screening, a false positive could freeze legitimate transactions, causing financial harm and regulatory scrutiny.

The trade-off between precision and recall (the proportion of actual positives correctly identified) is fundamental to classification system design. High precision with low recall means the system is conservative -- it catches fewer threats but rarely raises false alarms. High recall with low precision means the system is aggressive -- it catches most threats but generates many false alarms. The Prismatic Platform calibrates this trade-off based on the operational context, with sanctions screening favoring recall (missing a sanctioned entity is worse than investigating a false match) and PEP screening favoring balanced precision-recall.

## Technical Deep Dive

Precision computation in the Prismatic Platform spans multiple subsystems: OSINT tool result quality assessment, PEP/sanctions matching accuracy, vulnerability scanner calibration, and entity resolution quality in the DD pipeline. Each subsystem maintains precision metrics that are tracked over time and used to tune detection thresholds.

```elixir
defmodule PrismaticAnalytics.ClassificationMetrics do
  @moduledoc """
  Classification metrics computation for ML models and
  rule-based classifiers across the platform.
  """

  @type confusion_matrix :: %{
    true_positives: non_neg_integer(),
    false_positives: non_neg_integer(),
    true_negatives: non_neg_integer(),
    false_negatives: non_neg_integer()
  }

  @type metrics :: %{
    precision: float(),
    recall: float(),
    f1_score: float(),
    accuracy: float(),
    specificity: float()
  }

  @spec from_predictions([{term(), term()}]) :: confusion_matrix()
  def from_predictions(prediction_pairs) do
    Enum.reduce(prediction_pairs, %{
      true_positives: 0,
      false_positives: 0,
      true_negatives: 0,
      false_negatives: 0
    }, fn {predicted, actual}, acc ->
      case {predicted, actual} do
        {true, true} -> %{acc | true_positives: acc.true_positives + 1}
        {true, false} -> %{acc | false_positives: acc.false_positives + 1}
        {false, true} -> %{acc | false_negatives: acc.false_negatives + 1}
        {false, false} -> %{acc | true_negatives: acc.true_negatives + 1}
      end
    end)
  end

  @spec compute_metrics(confusion_matrix()) :: metrics()
  def compute_metrics(cm) do
    precision = safe_divide(cm.true_positives, cm.true_positives + cm.false_positives)
    recall = safe_divide(cm.true_positives, cm.true_positives + cm.false_negatives)
    f1 = safe_divide(2 * precision * recall, precision + recall)
    accuracy = safe_divide(
      cm.true_positives + cm.true_negatives,
      cm.true_positives + cm.false_positives + cm.true_negatives + cm.false_negatives
    )
    specificity = safe_divide(cm.true_negatives, cm.true_negatives + cm.false_positives)

    %{
      precision: precision,
      recall: recall,
      f1_score: f1,
      accuracy: accuracy,
      specificity: specificity
    }
  end

  @spec precision_at_k([{float(), boolean()}], pos_integer()) :: float()
  def precision_at_k(scored_results, k) do
    top_k = scored_results
      |> Enum.sort_by(fn {score, _} -> score end, :desc)
      |> Enum.take(k)

    relevant = Enum.count(top_k, fn {_, is_relevant} -> is_relevant end)
    safe_divide(relevant, k)
  end

  defp safe_divide(_numerator, 0), do: 0.0
  defp safe_divide(numerator, denominator), do: numerator / denominator
end
```

Precision tracking over time enables trend analysis and automatic threshold adjustment. The platform stores precision measurements with timestamps, enabling detection of model drift where precision degrades as input distributions shift.

```elixir
defmodule PrismaticAnalytics.PrecisionTracker do
  @moduledoc """
  Tracks precision metrics over time for drift detection
  and automatic threshold adjustment.
  """

  use GenServer

  @ets_table :precision_metrics

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    :ets.new(@ets_table, [:named_table, :ordered_set, :public, read_concurrency: true])
    {:ok, %{}}
  end

  @spec record(atom(), float(), map()) :: :ok
  def record(classifier, precision, metadata \\ %{}) do
    timestamp = System.system_time(:millisecond)
    entry = {timestamp, classifier, precision, metadata}
    :ets.insert(@ets_table, {timestamp, entry})

    check_drift(classifier, precision)
    :ok
  end

  @spec get_trend(atom(), pos_integer()) :: {:ok, [float()]}
  def get_trend(classifier, window_ms) do
    cutoff = System.system_time(:millisecond) - window_ms

    values =
      :ets.select(@ets_table, [
        {{:"$1", {:"$1", :"$2", :"$3", :_}},
         [{:andalso, {:>=, :"$1", cutoff}, {:==, :"$2", classifier}}],
         [:"$3"]}
      ])

    {:ok, values}
  end

  defp check_drift(classifier, precision) do
    {:ok, recent} = get_trend(classifier, 3_600_000)

    if length(recent) > 10 do
      avg = Enum.sum(recent) / length(recent)

      if precision < avg * 0.9 do
        :telemetry.execute(
          [:prismatic, :precision, :drift_detected],
          %{current: precision, average: avg, degradation: (avg - precision) / avg},
          %{classifier: classifier}
        )
      end
    end
  end
end
```

## Architecture & Implementation

The precision tracking architecture integrates with the platform's telemetry and monitoring subsystems. Each classifier (PEP matcher, sanctions screener, vulnerability scanner) emits precision measurements after evaluation runs. These measurements feed into the PrecisionTracker GenServer, which maintains time-series data in ETS and checks for drift on every new measurement.

The architecture supports both online precision estimation (computed from production classifications with delayed ground truth labels) and offline precision evaluation (computed from labeled test sets during model validation). Online estimates are inherently noisier but provide real-time feedback, while offline evaluations provide authoritative benchmarks during model updates.

## Usage in Prismatic Platform

Precision metrics drive operational decisions across the platform. The OSINT toolbox displays precision ratings for each tool, helping analysts assess result reliability. The Perimeter module uses precision-weighted scoring to discount findings from low-precision scanners.

```elixir
defmodule PrismaticOsint.QualityAssessment do
  @moduledoc """
  Assesses OSINT tool result quality using precision metrics.
  Weights tool outputs by historical precision for aggregated scoring.
  """

  @spec weighted_score([{atom(), float(), float()}]) :: float()
  def weighted_score(tool_results) do
    # Each result: {tool_slug, raw_score, tool_precision}
    weighted_sum =
      Enum.reduce(tool_results, 0.0, fn {_tool, score, precision}, acc ->
        acc + score * precision
      end)

    total_precision = Enum.reduce(tool_results, 0.0, fn {_, _, p}, acc -> acc + p end)

    if total_precision > 0 do
      weighted_sum / total_precision
    else
      0.0
    end
  end
end
```

## Cross-References

- [Percentile](/glossary/percentile/) - Statistical distribution used to contextualize precision scores
- **Scatter Plot** - Visualization technique for precision-recall curves
- [Property Test](/glossary/property-test/) - Testing approach validating classifier precision bounds
- **Profiling** - Performance measurement of classification pipelines
- [PEP](/glossary/pep/) - Politically exposed person screening where precision directly impacts operations

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
