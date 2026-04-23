+++
title = "Recall"
weight = 50

[extra]
description = "A classification metric measuring the proportion of actual positive instances correctly identified by a model, critical for evaluating search completeness and threat detection sensitivity."
category = "data"
domain = "metrics"
complexity = "intermediate"
stability = "stable"
beam_related = false
related_terms = ["r-squared", "statistics", "statistical-detection", "threshold", "signal", "precision", "f1-score", "confusion-matrix", "roc-curve", "auc", "specificity", "accuracy"]
tags = ["recall", "metrics", "classification", "search", "sensitivity", "machine-learning", "detection", "precision-recall", "f1-score", "confusion-matrix", "sanctions-screening", "osint"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Recall measures detection completeness -- in OSINT and security contexts, high recall ensures threats are not missed, even at the cost of some false positives."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Recall", "sensitivity", "classification", "detection", "glossary", "Prismatic Platform", "precision", "F1 score", "confusion matrix", "ROC curve", "sanctions screening"]
image = "/images/sections/glossary.png"
image_alt = "Recall - Prismatic Platform"
word_count = 3300
see_also = ["capabilities", "architecture", "osint-tools", "perimeter"]
+++

## Definition

**Recall** (also called sensitivity or true positive rate) is the fraction of relevant instances that are successfully retrieved. Mathematically, recall = TP / (TP + FN), where TP is the number of true positives and FN is the number of false negatives. A recall of 1.0 means every positive instance was found; a recall of 0.0 means none were found.

In security and intelligence contexts, recall is often prioritized over precision. Missing a genuine threat (false negative) is typically more costly than investigating a false alarm (false positive). For the Prismatic Platform's OSINT tools and Perimeter security rating system, high recall in threat detection means fewer missed vulnerabilities and sanctions matches.

Recall is not a standalone metric -- it must always be interpreted alongside precision. A classifier that labels everything as positive achieves perfect recall (1.0) but zero precision (0.0). The interplay between these metrics, controlled by the classification threshold, defines the operational characteristics of any detection system.

## Core Concepts

### The Confusion Matrix

All binary classification metrics derive from the confusion matrix, a 2x2 table of outcomes:

| | **Predicted Positive** | **Predicted Negative** |
|---|---|---|
| **Actually Positive** | True Positive (TP) | False Negative (FN) -- **Type II Error** |
| **Actually Negative** | False Positive (FP) -- **Type I Error** | True Negative (TN) |

From this matrix, the fundamental metrics are derived:

| Metric | Formula | Measures | Alias |
|--------|---------|----------|-------|
| **Recall** | TP / (TP + FN) | Detection completeness | Sensitivity, TPR, Hit Rate |
| **Precision** | TP / (TP + FP) | Detection accuracy | Positive Predictive Value |
| **Specificity** | TN / (TN + FP) | Negative identification | True Negative Rate, Selectivity |
| **Accuracy** | (TP + TN) / (TP + TN + FP + FN) | Overall correctness | -- |
| **F1 Score** | 2 * (Precision * Recall) / (Precision + Recall) | Balanced measure | Harmonic mean |
| **False Positive Rate** | FP / (FP + TN) | False alarm rate | Fall-out, 1 - Specificity |
| **False Negative Rate** | FN / (FN + TP) | Miss rate | 1 - Recall |

### Precision-Recall Tradeoff

The precision-recall tradeoff is fundamental to every detection system. Moving the classification threshold controls where on this tradeoff curve the system operates:

| Threshold | Recall | Precision | Behavior |
|-----------|--------|-----------|----------|
| Very low (0.1) | Very high (~0.98) | Very low (~0.10) | Almost everything flagged; analyst overload |
| Low (0.3) | High (~0.90) | Low (~0.30) | Many false alarms but few misses |
| Medium (0.5) | Moderate (~0.75) | Moderate (~0.60) | Balanced operation |
| High (0.7) | Low (~0.50) | High (~0.85) | Few false alarms but many misses |
| Very high (0.9) | Very low (~0.20) | Very high (~0.95) | Almost nothing flagged; many threats missed |

The optimal threshold depends entirely on the cost asymmetry between false negatives and false positives in the specific domain.

### F-Beta Score Family

The F1 score weights precision and recall equally. When the costs are asymmetric, the F-beta score allows explicit weighting:

| Metric | Formula | Weighting | Use When |
|--------|---------|-----------|----------|
| **F0.5** | (1 + 0.25) * P * R / (0.25P + R) | Precision 2x recall | False positives expensive (spam detection) |
| **F1** | 2 * P * R / (P + R) | Equal weight | No cost preference |
| **F2** | (1 + 4) * P * R / (4P + R) | Recall 2x precision | False negatives expensive (threat detection) |
| **F5** | (1 + 25) * P * R / (25P + R) | Recall 5x precision | Missing anything is catastrophic (medical screening) |

For Prismatic Platform's sanctions screening, F2 is the primary metric because missing a sanctioned entity has severe regulatory consequences.

### ROC Curve vs Precision-Recall Curve

Two visualization approaches exist for evaluating classifier performance across all thresholds:

| Characteristic | ROC Curve | Precision-Recall Curve |
|---------------|-----------|----------------------|
| **X-axis** | False Positive Rate | Recall |
| **Y-axis** | True Positive Rate (Recall) | Precision |
| **Random baseline** | Diagonal line (AUC = 0.5) | Horizontal at prevalence |
| **Perfect classifier** | Top-left corner (AUC = 1.0) | Top-right corner (AUC = 1.0) |
| **Imbalanced data** | Can be misleadingly optimistic | Accurately reflects difficulty |
| **Best for** | Balanced datasets | Imbalanced datasets (rare positives) |
| **Summary metric** | AUC-ROC | AUC-PR (Average Precision) |

For security detection where positives are rare (1 sanctioned entity per 10,000 screened), the precision-recall curve is more informative than the ROC curve. A classifier with 99% ROC-AUC might have only 20% precision at 90% recall when the positive class is 0.01% of the data.

## Technical Deep Dive

### Per-Class vs Aggregated Recall

In multi-class classification, recall must be computed per class. Aggregation strategies have different properties:

**Micro-averaging**: Pools all TP and FN across classes before computing:
```
Recall_micro = sum(TP_i) / sum(TP_i + FN_i)
```
Weighted by class frequency -- dominated by the majority class.

**Macro-averaging**: Computes recall per class, then averages:
```
Recall_macro = mean(Recall_i for each class i)
```
Gives equal weight to every class regardless of frequency.

**Weighted averaging**: Like macro, but weighted by class support:
```
Recall_weighted = sum(support_i * Recall_i) / sum(support_i)
```

| Averaging | Rare Class Sensitivity | Majority Class Bias | Use When |
|-----------|----------------------|-------------------|----------|
| Micro | Low | High | Overall system performance |
| Macro | High | Low | All classes equally important |
| Weighted | Moderate | Moderate | Class importance proportional to frequency |

For sanctions screening with hundreds of sanction lists of varying sizes, macro-averaged recall ensures that recall on small lists (e.g., North Korea designations with ~50 entries) is weighted equally with large lists (e.g., EU consolidated list with ~10,000 entries).

### Threshold Tuning Strategies

Choosing the optimal classification threshold is a decision problem, not a statistical one. Several strategies exist:

1. **Cost-minimization**: Define cost_FN and cost_FP, then minimize total expected cost across the threshold range
2. **F-beta optimization**: Choose threshold that maximizes F-beta for the desired beta
3. **Recall floor**: Set minimum acceptable recall (e.g., 95%), then maximize precision subject to that constraint
4. **Youden's J statistic**: Maximize J = Sensitivity + Specificity - 1 (equivalent to maximizing distance from ROC diagonal)
5. **Operating point from PR curve**: Select the "knee" of the precision-recall curve where marginal recall gain starts requiring large precision sacrifice

### Calibration and Recall

A classifier's predicted probabilities should be calibrated -- a prediction of 0.8 should mean the item is positive 80% of the time. Poorly calibrated classifiers can have misleading recall at specific thresholds because the predicted probabilities do not reflect true probabilities. Platt scaling or isotonic regression can recalibrate predictions post-hoc.

### Recall in Information Retrieval

In search systems (Meilisearch, Elasticsearch), recall measures query completeness:

```
Recall@k = |relevant documents in top-k results| / |total relevant documents|
```

Unlike classification recall, search recall is measured at a specific cutoff (k). Recall@10 measures how many relevant documents appear in the first 10 results. Typo tolerance, stemming, and synonym expansion improve search recall by matching more query variations.

## Advanced Topics

### Recall Degradation Over Time

Model drift causes recall degradation when the data distribution shifts. Common causes in OSINT/security:

- New naming conventions for sanctioned entities
- Transliteration changes (Russian/Chinese entities in Latin script)
- Corporate restructuring creating new entity relationships
- New sanction list formats requiring parser updates

Continuous evaluation against a labeled holdout set detects recall degradation before it impacts operations. The Prismatic Platform's statistical detection system monitors per-detector recall weekly.

### Class Imbalance and Recall

Extreme class imbalance (1:10,000 positive:negative ratio) makes high recall difficult because even a tiny FN rate translates to many missed positives. Techniques to improve recall under imbalance:

| Technique | How It Helps Recall | Tradeoff |
|-----------|-------------------|----------|
| Oversampling (SMOTE) | Creates synthetic positives for training | Can cause overfitting |
| Undersampling | Reduces negatives to balance ratio | Loses information |
| Cost-sensitive learning | Penalizes FN more heavily during training | May reduce precision |
| Ensemble methods | Combines multiple weak classifiers | Increased computation |
| Threshold adjustment | Lowers decision boundary | Increases false positives |
| Feature engineering | Better features improve separability | Domain expertise required |

### Recall in Multi-Stage Pipelines

The Prismatic Platform uses multi-stage detection pipelines where recall compounds multiplicatively:

```
Pipeline_Recall = Stage1_Recall * Stage2_Recall * Stage3_Recall
```

If each stage has 90% recall, the pipeline recall is only 72.9%. This means every filtering stage must have extremely high recall, or the pipeline will miss a significant fraction of positives. The platform addresses this by making early stages high-recall / low-precision (cast a wide net) and later stages high-precision (refine the results).

## Usage in Prismatic Platform

The sanctions screening system prioritizes recall -- missing a sanctioned entity in due diligence has severe regulatory consequences. The SDN list matcher uses fuzzy matching with a low threshold to maximize recall, then ranks results by confidence for human review.

The Perimeter EASM system optimizes for recall in asset discovery: finding all exposed assets is more important than perfect classification of each asset's risk level. The statistical detection system reports recall alongside precision for each anomaly detector.

The OSINT adapter pipeline implements a three-stage architecture:
1. **Discovery stage** (target recall: 99%+): Cast wide net across all 157 adapters
2. **Correlation stage** (target recall: 95%): Cross-reference findings to confirm signals
3. **Assessment stage** (target precision: 90%): Analyst-assisted evaluation of confirmed signals

The DD pipeline's entity matching system uses recall-focused fuzzy matching for company name comparison. Czech business names often have multiple valid representations (with/without legal form suffix, abbreviated vs. full name, Czech vs. English), requiring high-recall matching that catches all variants at the cost of some false matches that human analysts resolve.

## Code Examples

### Comprehensive Classification Metrics

```elixir
defmodule PrismaticStats.ClassificationMetrics do
  @moduledoc """
  Calculates recall and related classification metrics.
  Used in OSINT detection, sanctions screening evaluation,
  and Perimeter EASM asset discovery assessment.
  Supports per-class, micro, macro, and weighted averaging.
  """

  @type confusion :: %{
    true_positives: non_neg_integer(),
    false_positives: non_neg_integer(),
    true_negatives: non_neg_integer(),
    false_negatives: non_neg_integer()
  }

  @type metrics :: %{
    recall: float(),
    precision: float(),
    f1: float(),
    f_beta: float(),
    specificity: float(),
    accuracy: float()
  }

  @doc """
  Calculates recall (sensitivity / true positive rate).

  ## Examples

      iex> cm = %{true_positives: 90, false_negatives: 10, false_positives: 20, true_negatives: 880}
      iex> ClassificationMetrics.recall(cm)
      0.9

  """
  @spec recall(confusion()) :: float()
  def recall(%{true_positives: tp, false_negatives: fn_count}) do
    denominator = tp + fn_count
    if denominator == 0, do: 0.0, else: tp / denominator
  end

  @doc """
  Calculates precision (positive predictive value).
  """
  @spec precision(confusion()) :: float()
  def precision(%{true_positives: tp, false_positives: fp}) do
    denominator = tp + fp
    if denominator == 0, do: 0.0, else: tp / denominator
  end

  @doc """
  Calculates F1 score (harmonic mean of precision and recall).
  """
  @spec f1_score(confusion()) :: float()
  def f1_score(cm) do
    f_beta_score(cm, 1.0)
  end

  @doc """
  Calculates F-beta score with configurable beta.
  Beta > 1 weights recall more; beta < 1 weights precision more.

  ## Examples

      iex> cm = %{true_positives: 90, false_negatives: 10, false_positives: 20, true_negatives: 880}
      iex> ClassificationMetrics.f_beta_score(cm, 2.0) |> Float.round(3)
      0.878

  """
  @spec f_beta_score(confusion(), float()) :: float()
  def f_beta_score(cm, beta) do
    p = precision(cm)
    r = recall(cm)
    beta_sq = beta * beta

    if p + r == 0 do
      0.0
    else
      (1 + beta_sq) * p * r / (beta_sq * p + r)
    end
  end

  @doc """
  Calculates all standard metrics from a confusion matrix.
  """
  @spec all_metrics(confusion(), float()) :: metrics()
  def all_metrics(cm, beta \\ 1.0) do
    %{
      recall: recall(cm),
      precision: precision(cm),
      f1: f1_score(cm),
      f_beta: f_beta_score(cm, beta),
      specificity: specificity(cm),
      accuracy: accuracy(cm)
    }
  end

  @doc """
  Calculates specificity (true negative rate).
  """
  @spec specificity(confusion()) :: float()
  def specificity(%{true_negatives: tn, false_positives: fp}) do
    denominator = tn + fp
    if denominator == 0, do: 0.0, else: tn / denominator
  end

  @doc """
  Calculates accuracy.
  """
  @spec accuracy(confusion()) :: float()
  def accuracy(%{true_positives: tp, true_negatives: tn, false_positives: fp, false_negatives: fn_count}) do
    total = tp + tn + fp + fn_count
    if total == 0, do: 0.0, else: (tp + tn) / total
  end

  @doc """
  Builds a confusion matrix from scored items at a given threshold.
  Items are tuples of {score, actually_positive?}.
  """
  @spec evaluate_at_threshold(list({float(), boolean()}), float()) :: confusion()
  def evaluate_at_threshold(scored_items, threshold) do
    Enum.reduce(scored_items, %{true_positives: 0, false_positives: 0, true_negatives: 0, false_negatives: 0}, fn
      {score, true}, acc when score >= threshold -> %{acc | true_positives: acc.true_positives + 1}
      {score, false}, acc when score >= threshold -> %{acc | false_positives: acc.false_positives + 1}
      {score, true}, acc when score < threshold -> %{acc | false_negatives: acc.false_negatives + 1}
      {score, false}, acc when score < threshold -> %{acc | true_negatives: acc.true_negatives + 1}
    end)
  end

  @doc """
  Computes precision-recall curve by evaluating at multiple thresholds.
  Returns list of {threshold, precision, recall} tuples.
  """
  @spec precision_recall_curve(list({float(), boolean()}), non_neg_integer()) ::
          list({float(), float(), float()})
  def precision_recall_curve(scored_items, steps \\ 100) do
    thresholds = for i <- 0..steps, do: i / steps

    Enum.map(thresholds, fn threshold ->
      cm = evaluate_at_threshold(scored_items, threshold)
      {threshold, precision(cm), recall(cm)}
    end)
  end
end
```

### Multi-Class Recall with Averaging

```elixir
defmodule PrismaticStats.MultiClassRecall do
  @moduledoc """
  Computes per-class and aggregated recall for multi-class classification.
  Supports micro, macro, and weighted averaging strategies.
  Used in entity type classification and threat categorization.
  """

  alias PrismaticStats.ClassificationMetrics

  @type per_class_results :: %{String.t() => ClassificationMetrics.confusion()}

  @doc """
  Computes macro-averaged recall (equal weight to all classes).
  """
  @spec macro_recall(per_class_results()) :: float()
  def macro_recall(per_class) do
    recalls = Enum.map(per_class, fn {_class, cm} -> ClassificationMetrics.recall(cm) end)

    case recalls do
      [] -> 0.0
      recalls -> Enum.sum(recalls) / length(recalls)
    end
  end

  @doc """
  Computes micro-averaged recall (weighted by class frequency).
  """
  @spec micro_recall(per_class_results()) :: float()
  def micro_recall(per_class) do
    totals =
      Enum.reduce(per_class, %{tp: 0, fn: 0}, fn {_class, cm}, acc ->
        %{tp: acc.tp + cm.true_positives, fn: acc.fn + cm.false_negatives}
      end)

    denominator = totals.tp + totals.fn
    if denominator == 0, do: 0.0, else: totals.tp / denominator
  end

  @doc """
  Computes weighted-average recall (weighted by class support).
  """
  @spec weighted_recall(per_class_results()) :: float()
  def weighted_recall(per_class) do
    {weighted_sum, total_support} =
      Enum.reduce(per_class, {0.0, 0}, fn {_class, cm}, {sum, total} ->
        support = cm.true_positives + cm.false_negatives
        recall = ClassificationMetrics.recall(cm)
        {sum + support * recall, total + support}
      end)

    if total_support == 0, do: 0.0, else: weighted_sum / total_support
  end
end
```

### Sanctions Screening Evaluator

```elixir
defmodule PrismaticCompliance.ScreeningEvaluator do
  @moduledoc """
  Evaluates sanctions screening recall against known test sets.
  Prioritizes recall (F2 metric) because missing a sanctioned
  entity has severe regulatory consequences.
  """

  alias PrismaticStats.ClassificationMetrics

  require Logger

  @recall_floor 0.95
  @f2_floor 0.85

  @doc """
  Evaluates screening system against a labeled test set.
  Returns metrics and compliance status.
  """
  @spec evaluate(list({String.t(), boolean()}), list({String.t(), float()})) :: map()
  def evaluate(labeled_entities, screening_results) do
    scored_items = build_scored_items(labeled_entities, screening_results)
    cm = ClassificationMetrics.evaluate_at_threshold(scored_items, 0.5)
    metrics = ClassificationMetrics.all_metrics(cm, 2.0)

    compliance = %{
      recall_compliant: metrics.recall >= @recall_floor,
      f2_compliant: metrics.f_beta >= @f2_floor,
      missed_entities: cm.false_negatives
    }

    unless compliance.recall_compliant do
      Logger.warning("Sanctions screening recall below floor: #{Float.round(metrics.recall, 3)} < #{@recall_floor}",
        recall: metrics.recall,
        missed: cm.false_negatives
      )
    end

    %{metrics: metrics, confusion_matrix: cm, compliance: compliance}
  end

  @spec build_scored_items(list({String.t(), boolean()}), list({String.t(), float()})) ::
          list({float(), boolean()})
  defp build_scored_items(labeled, results) do
    result_map = Map.new(results)

    Enum.map(labeled, fn {entity_id, is_sanctioned} ->
      score = Map.get(result_map, entity_id, 0.0)
      {score, is_sanctioned}
    end)
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Reporting recall without precision | Perfect recall is trivial (classify everything as positive) | Always report both metrics together |
| Using accuracy on imbalanced data | 99.9% accuracy possible by predicting all-negative | Use recall, precision, F-beta, or AUC-PR instead |
| Micro-averaging hiding rare class failures | 99% micro recall with 0% recall on critical rare class | Use macro-averaging or per-class reporting |
| Static threshold in shifting data | Optimal threshold changes as data distribution drifts | Re-evaluate threshold periodically on fresh labeled data |
| Ignoring pipeline recall compounding | 90% * 90% * 90% = 72.9% pipeline recall | Make early stages very high recall, refine later |
| Evaluating on training data | Overfitting gives misleadingly high recall | Always evaluate on held-out test set |
| Using ROC-AUC with extreme imbalance | ROC-AUC looks good even when PR performance is poor | Use AUC-PR for imbalanced datasets |
| Ignoring per-class recall | Aggregate recall masks poor performance on specific classes | Report per-class recall especially for critical classes |
| No temporal split in evaluation | Random train/test split leaks future information | Use temporal split (train on past, test on future) |
| Threshold tuned to test set | Optimistic recall estimate that does not generalize | Tune threshold on validation set, evaluate on separate test set |

## Best Practices

1. **Prioritize recall for security-critical detection** -- missing threats is worse than investigating false alarms. Use F2 or higher beta values for scoring.

2. **Report recall alongside precision** -- recall alone is meaningless (classifying everything as positive gives perfect recall).

3. **Use threshold tuning** -- adjust classification thresholds based on the specific cost asymmetry of false negatives vs. false positives in the operational context.

4. **Measure per-class recall** -- aggregate recall can mask poor detection of rare but important classes. Sanctions screening must report per-list recall.

5. **Track recall over time** -- model drift causes recall degradation that must be detected through continuous evaluation against labeled test sets.

6. **Use precision-recall curves, not ROC curves, for imbalanced data** -- PR curves provide a more honest assessment when positives are rare.

7. **Design pipelines for recall preservation** -- early stages should be high-recall filters; precision refinement happens in later stages.

8. **Evaluate with temporal splits** -- random splits leak future information. Train on historical data, evaluate on recent data.

9. **Set recall floors for compliance-critical systems** -- sanctions screening should have a documented minimum recall (e.g., 95%) with automated alerting when it drops below.

10. **Regularly refresh evaluation datasets** -- new entity names, transliterations, and corporate structures require updated test sets to maintain meaningful recall measurement.

## Related Terms

- [Statistical Detection](/glossary/statistical-detection/) -- anomaly detection systems where recall is critical
- [Threshold](/glossary/threshold/) -- the decision boundary that controls recall-precision tradeoff
- [Signal](/glossary/signal/) -- the raw intelligence data recall measures detection completeness for
- [R-squared](/glossary/r-squared/) -- model quality metric complementary to recall (for regression)
- [Precision](/glossary/precision/) -- the complementary metric measuring detection accuracy
- [F1 Score](/glossary/f1-score/) -- harmonic mean balancing precision and recall
- [Confusion Matrix](/glossary/confusion-matrix/) -- the fundamental table from which recall is derived
- [ROC Curve](/glossary/roc-curve/) -- visualization of classifier performance across thresholds
- [Specificity](/glossary/specificity/) -- true negative rate, the counterpart to recall
- [Accuracy](/glossary/accuracy/) -- overall correctness metric, misleading on imbalanced data
- [AUC](/glossary/auc/) -- area under ROC or PR curve, threshold-independent performance measure
- [Statistics](/glossary/statistics/) -- mathematical foundations underlying recall computation

## See Also

- [OSINT Tools](/osint/) -- intelligence tools where recall drives detection quality
- [Perimeter Security](/capabilities/) -- asset discovery optimized for recall
- [Sanctions Screening](/hub/dd/) -- compliance system with recall floor requirements
- [Statistical Detection Architecture](/architecture/) -- multi-stage detection pipeline design

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
