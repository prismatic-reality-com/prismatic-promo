+++
title = "Accuracy"
weight = 50
[extra]
description = "The degree to which a measurement, computation, or intelligence assessment correctly reflects the true state of affairs, critical for OSINT analysis and data quality validation"
category = "data-analytics"
related_terms = ["confidence-score", "anomaly-detection", "completeness", "correlation", "benchmark", "assertion", "quality-gate"]
tags = ["glossary", "accuracy", "data-quality", "osint", "analytics", "validation", "metrics", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
difficulty = "intermediate"
quality_score = 85
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Accuracy measures how closely results match ground truth, forming the foundation of reliable OSINT intelligence and data quality gates in the Prismatic Platform"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["accuracy", "data quality", "precision", "recall", "F1 score", "OSINT validation", "ground truth", "measurement error", "data integrity", "quality metrics"]
image = "/images/sections/glossary.png"
image_alt = "Accuracy - Prismatic Platform"
word_count = 1020
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

Accuracy is the degree to which a measured, computed, or assessed value conforms to the true or accepted reference value. In data science and intelligence analysis, accuracy quantifies how often a system produces correct results, encompassing both the absence of systematic bias and the minimization of random errors. It is distinct from **precision** (consistency of repeated measurements) and recall (completeness of relevant result retrieval).

In the Prismatic Platform, accuracy is a first-class quality metric applied across OSINT intelligence gathering, data pipeline validation, anomaly detection confidence thresholds, and the NABLA Infinity epistemic framework's evidence evaluation.

## Technical Deep Dive

### Accuracy in Classification Systems

For binary classification tasks common in OSINT (threat/no-threat, match/no-match):

| Metric | Formula | Prismatic Usage |
|--------|---------|-----------------|
| **Accuracy** | (TP + TN) / (TP + TN + FP + FN) | Overall correctness |
| **Precision** | TP / (TP + FP) | False positive reduction |
| **Recall** | TP / (TP + FN) | Completeness of detection |
| **F1 Score** | 2 * (P * R) / (P + R) | Balanced metric |

Where TP = True Positives, TN = True Negatives, FP = False Positives, FN = False Negatives.

### Accuracy vs. Confidence

Accuracy measures historical correctness (how often were past results right?), while **confidence** measures current certainty (how sure are we about this specific result?). The NABLA Infinity framework requires both: high accuracy in the underlying models AND high confidence in individual assessments before claims pass the Trinity Gate.

### Sources of Inaccuracy

| Source | Description | Mitigation |
|--------|-------------|------------|
| **Measurement error** | Instrument or sensor limitations | Calibration, cross-validation |
| **Sampling bias** | Non-representative data selection | Stratified sampling, source plurality |
| **Temporal decay** | Information becoming stale | Time-decay axiom (NABLA) |
| **Adversarial manipulation** | Deliberate data poisoning | Source independence axiom |
| **Aggregation distortion** | Loss of nuance in summarization | Preserve raw data alongside aggregates |

## Architecture and Implementation

### Data Quality Validation Module

```elixir
defmodule PrismaticQuality.AccuracyValidator do
  @moduledoc """
  Validates data accuracy against known ground truth datasets.
  Used in OSINT pipelines to measure and track accuracy over time.
  Emits telemetry events for quality monitoring dashboards.
  """

  @type accuracy_result :: %{
          accuracy: float(),
          precision: float(),
          recall: float(),
          f1_score: float(),
          sample_size: non_neg_integer(),
          evaluated_at: DateTime.t()
        }

  @spec evaluate(list(map()), list(map()), atom()) :: {:ok, accuracy_result()}
  def evaluate(predictions, ground_truth, key_field) do
    {tp, tn, fp, fn_count} = compute_confusion_matrix(predictions, ground_truth, key_field)
    total = tp + tn + fp + fn_count

    accuracy = if total > 0, do: (tp + tn) / total, else: 0.0
    precision = if tp + fp > 0, do: tp / (tp + fp), else: 0.0
    recall = if tp + fn_count > 0, do: tp / (tp + fn_count), else: 0.0
    f1 = if precision + recall > 0, do: 2 * (precision * recall) / (precision + recall), else: 0.0

    result = %{
      accuracy: Float.round(accuracy, 4),
      precision: Float.round(precision, 4),
      recall: Float.round(recall, 4),
      f1_score: Float.round(f1, 4),
      sample_size: total,
      evaluated_at: DateTime.utc_now()
    }

    :telemetry.execute(
      [:prismatic, :quality, :accuracy, :evaluated],
      %{accuracy: result.accuracy, f1: result.f1_score},
      %{sample_size: total}
    )

    {:ok, result}
  end

  @spec compute_confusion_matrix(list(map()), list(map()), atom()) ::
          {float(), float(), float(), float()}
  defp compute_confusion_matrix(predictions, ground_truth, key_field) do
    truth_set = MapSet.new(ground_truth, &Map.get(&1, key_field))

    Enum.reduce(predictions, {0.0, 0.0, 0.0, 0.0}, fn pred, {tp, tn, fp, fn_acc} ->
      predicted_positive = Map.get(pred, :positive, false)
      actually_positive = MapSet.member?(truth_set, Map.get(pred, key_field))

      case {predicted_positive, actually_positive} do
        {true, true} -> {tp + 1, tn, fp, fn_acc}
        {true, false} -> {tp, tn, fp + 1, fn_acc}
        {false, true} -> {tp, tn, fp, fn_acc + 1}
        {false, false} -> {tp, tn + 1, fp, fn_acc}
      end
    end)
  end
end
```

## Usage in Prismatic Platform

Accuracy measurement is integral to several platform subsystems:

- **OSINT Intelligence**: Every OSINT tool result carries an accuracy metadata field, tracked over time per adapter
- **DD Pipeline**: Entity matching accuracy between fetched records and ground truth registries
- **Anomaly Detection**: Classification accuracy of the anomaly detection models, measured via F1 score
- **Quality Gates**: The quality gate system uses accuracy thresholds to block low-quality data from propagating downstream
- **NABLA Framework**: The Trinity Gate evaluates the accuracy of claims before establishing them as beliefs

## Code Examples

### OSINT Result Accuracy Tracking

```elixir
defmodule PrismaticOsintCore.AccuracyTracker do
  @moduledoc """
  Tracks per-tool accuracy metrics over time using ETS.
  Enables degradation detection when tool accuracy drops.
  """

  use GenServer

  @table :osint_accuracy_metrics

  @spec record_result(String.t(), boolean()) :: :ok
  def record_result(tool_slug, correct?) do
    GenServer.cast(__MODULE__, {:record, tool_slug, correct?})
  end

  @spec get_accuracy(String.t()) :: {:ok, float()} | {:error, :no_data}
  def get_accuracy(tool_slug) do
    case :ets.lookup(@table, tool_slug) do
      [{^tool_slug, correct, total}] when total > 0 ->
        {:ok, Float.round(correct / total, 4)}
      _ ->
        {:error, :no_data}
    end
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(@table, [:set, :named_table, :protected, read_concurrency: true])
    {:ok, %{table: table}}
  end

  @impl GenServer
  def handle_cast({:record, tool_slug, correct?}, state) do
    increment = if correct?, do: 1, else: 0

    case :ets.lookup(@table, tool_slug) do
      [{^tool_slug, correct, total}] ->
        :ets.insert(@table, {tool_slug, correct + increment, total + 1})
      [] ->
        :ets.insert(@table, {tool_slug, increment, 1})
    end

    {:noreply, state}
  end
end
```

## Best Practices

1. **Establish ground truth first**: Before measuring accuracy, define what "correct" means for your domain. Without reliable ground truth, accuracy measurements are meaningless.

2. **Track accuracy over time**: Single-point accuracy is insufficient. Monitor accuracy trends to detect model drift or data quality degradation.

3. **Use appropriate metrics**: Raw accuracy can be misleading with imbalanced datasets. Use F1 score, precision, and recall to get a complete picture.

4. **Cross-validate with multiple sources**: The NABLA signal plurality axiom requires at least two independent sources to establish accuracy claims.

5. **Account for temporal decay**: Data accuracy degrades over time. Implement time-decay weighting for accuracy assessments on historical data.

6. **Distinguish systematic from random errors**: Systematic errors (bias) require different corrections than random noise. Profile your error sources to choose appropriate mitigation strategies.

## Related Terms

- **Confidence Score** -- certainty level for individual assessments
- [Anomaly Detection](/glossary/anomaly-detection/) -- accuracy-dependent detection of deviations
- **Completeness** -- data coverage complementing accuracy
- **Correlation** -- statistical relationship strength between variables
- [Benchmark](/glossary/benchmark/) -- reference standards for accuracy measurement
- [Assertion](/glossary/assertion/) -- programmatic accuracy verification in tests
- [Aggregation](/glossary/aggregation/) -- data combination that can affect accuracy

## See Also

- [NIST Data Quality Framework](https://www.nist.gov/data) -- federal data quality standards
- [Prismatic Quality Gates](/glossary/quality-gates/) -- platform quality enforcement mechanisms
- [Academy Data Analysis Livebook](/academy/) -- interactive accuracy analysis exercises

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
