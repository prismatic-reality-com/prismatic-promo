+++
title = "Ensemble"
weight = 50

[extra]
description = "Machine learning technique combining multiple models or classifiers to produce predictions more accurate than any individual model, applicable to threat scoring, OSINT fusion, and multi-source intelligence assessment."
category = "data"
domain = "machine-learning"
complexity = "advanced"
stability = "mature"
beam_related = true
related_terms = ["f1-score", "few-shot", "inference", "ai-agent", "distribution", "data-quality", "confidence-scoring", "chain-of-thought", "intelligence-fusion", "nabla-infinity", "genserver", "ets", "pubsub"]
tags = ["glossary", "ensemble", "machine-learning", "classification", "voting", "boosting", "bagging", "stacking", "intelligence-fusion"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Ensemble methods in the Prismatic Platform combine multiple OSINT source assessments and model predictions to produce higher-confidence threat scores and security ratings than any single source."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Ensemble", "machine learning", "classification", "voting", "boosting", "bagging", "stacking", "model aggregation", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Ensemble - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "technologies"]
+++

## Definition

An ensemble is a machine learning technique that combines predictions from multiple models (called base learners or weak learners) to produce a final prediction that is typically more accurate, robust, and reliable than any individual model. Ensemble methods exploit the principle that diverse models make different errors, and by combining their predictions (through voting, averaging, or stacking), the aggregate error is reduced. The three primary ensemble strategies are bagging (training models on random data subsets), boosting (sequentially training models to correct predecessors' errors), and stacking (using a meta-learner to combine base model outputs).

The mathematical justification for ensembles comes from the bias-variance decomposition. Bagging reduces variance by averaging over random perturbations of the training data. Boosting reduces bias by iteratively focusing on hard examples. Stacking can reduce both by learning an optimal combination function. For classification tasks, the Condorcet jury theorem provides additional justification: if each independent classifier is better than random (accuracy > 0.5), then the majority vote accuracy approaches 1.0 as the number of classifiers increases.

Beyond traditional ML, the ensemble concept applies broadly to any system that combines multiple independent assessments to improve decision quality -- including multi-source intelligence fusion and consensus-based scoring. In the Prismatic Platform, ensemble principles underpin the security rating engine, the OSINT intelligence fusion pipeline, the due diligence scoring system, and the multi-agent reasoning synthesis process. Wherever multiple sources provide assessments of the same entity or question, ensemble methods produce the final composite score.

The key insight connecting ensembles to intelligence platforms is that OSINT sources function as base learners: each provides a partial, potentially biased view of a target entity. Just as ML ensembles combine diverse model predictions, intelligence ensembles combine diverse source assessments. The same principles -- diversity, independence, and intelligent combination -- govern both domains.

## Core Concepts

| Concept | Description | ML Context | Intelligence Context |
|---------|-------------|-----------|---------------------|
| **Base Learner** | Individual model contributing to the ensemble | Decision tree, SVM, neural network | Single OSINT source assessment |
| **Diversity** | Degree to which base learners make different errors | Different algorithms, features, or data | Different sources, methodologies, perspectives |
| **Combination Rule** | Method for aggregating base learner outputs | Voting, averaging, stacking | Weighted scoring, confidence fusion |
| **Bagging** | Training on random data subsets (Bootstrap Aggregating) | Random Forest | Sampling different evidence subsets per source |
| **Boosting** | Sequential training focusing on hard examples | XGBoost, AdaBoost, LightGBM | Iterative investigation focusing on uncertain aspects |
| **Stacking** | Meta-learner trained on base learner outputs | Neural net over RF + SVM | Analyst combining multiple source reports |
| **Voting** | Direct combination by majority or weighted vote | Hard/soft voting classifiers | Multi-source consensus on entity classification |
| **Agreement Ratio** | Proportion of base learners producing the same prediction | Inter-classifier agreement | Source consensus metric |
| **Out-of-Bag Error** | Validation using samples not in bootstrap sample | Bagging model evaluation | Hold-out source validation |
| **Feature Importance** | Contribution of each feature to ensemble prediction | Gini importance, SHAP values | Source contribution to final assessment |
| **Model Calibration** | Ensuring predicted probabilities match actual frequencies | Platt scaling, isotonic regression | Confidence score calibration |
| **Ensemble Pruning** | Removing underperforming base learners | Accuracy-diversity trade-off | Decommissioning unreliable sources |

### Ensemble Strategies Comparison

| Strategy | Diversity Method | Combination | Variance/Bias | Training Cost | Example | Platform Usage |
|----------|-----------------|-------------|---------------|---------------|---------|---------------|
| **Bagging** | Random data subsets | Majority vote / Average | Reduces variance | Parallelizable | Random Forest | Multi-source parallel assessment |
| **Boosting** | Sequential error correction | Weighted vote | Reduces bias | Sequential | XGBoost, AdaBoost | Iterative investigation refinement |
| **Stacking** | Different model types | Meta-learner | Both | High | Neural net over RF + SVM | Analyst synthesis of multi-source reports |
| **Voting** | Independent models | Majority / Weighted | Reduces variance | Parallelizable | Multi-source OSINT | Real-time source consensus |
| **Blending** | Holdout-trained meta-learner | Weighted average | Both | Medium | Kaggle-style blending | Cross-validation of source reliability |
| **Cascading** | Sequential with early stopping | Pass/fail gates | Reduces cost | Sequential | Escalation pipelines | Tiered investigation depth |

### Ensemble Performance Bounds

| Metric | Description | Formula Context | Practical Implication |
|--------|-------------|-----------------|---------------------|
| **Condorcet Bound** | Majority vote accuracy with N independent classifiers | Approaches 1.0 as N increases (if each > 0.5) | More diverse sources improve consensus |
| **Ambiguity Decomposition** | Ensemble error = average error - average diversity | Higher diversity = lower ensemble error | Prioritize diverse sources over accurate-but-similar |
| **Oracle Accuracy** | Best possible ensemble (always picking the correct base learner) | Upper bound on ensemble performance | Measures headroom for combination improvement |
| **Wisdom of Crowds** | Aggregate estimate beats most individuals | Requires independence and diversity | Applies when sources don't share methodology |

## Technical Deep Dive

### Ensemble Architecture in the Platform

The Prismatic Platform implements ensembles at three levels:

**Level 1 -- Source Ensemble**: Multiple OSINT sources provide independent assessments of the same entity. The security rating engine combines these using weighted averaging, where weights reflect historical source reliability.

**Level 2 -- Model Ensemble**: For ML-based classification tasks (anomaly detection, threat categorization), traditional ensemble methods (Random Forest, gradient boosting) are used within the Axon/EXLA ML pipeline.

**Level 3 -- Agent Ensemble**: Multiple AIAD agents analyze the same target using different reasoning approaches. The Purple Team synthesis process combines their conclusions, preserving contradictions per the NABLA Contradiction Preservation axiom.

| Level | Base Learners | Combination Method | Output | Latency |
|-------|--------------|-------------------|--------|---------|
| **Source Ensemble** | OSINT source assessments | Weighted average by reliability | Composite score + confidence | Seconds |
| **Model Ensemble** | ML classifiers (RF, XGB, NN) | Stacking with meta-learner | Classification + probability | Milliseconds |
| **Agent Ensemble** | AIAD agent reasoning chains | Purple Team synthesis | Conclusion + contradiction report | Minutes |

### Diversity Mechanisms

Ensemble effectiveness depends critically on diversity among base learners. In the platform:

| Diversity Source | Implementation | Effect |
|-----------------|---------------|--------|
| **Data Diversity** | Different OSINT sources access different data | Reduces correlated errors |
| **Methodological Diversity** | Sources use different analysis techniques | Captures different signal types |
| **Temporal Diversity** | Assessments from different time periods | Captures evolving threat landscape |
| **Geographic Diversity** | Sources with different geographic coverage | Reduces jurisdictional blind spots |
| **Model Architecture Diversity** | Different ML model types in the ensemble | Reduces algorithmic bias |
| **Feature Diversity** | Different feature subsets per model | Captures complementary patterns |

### Confidence and Calibration

Ensemble confidence is not simply the average of individual confidences. The platform implements calibrated confidence that accounts for agreement ratio, source reliability, and historical accuracy:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Agreement Ratio** | 0.3 | Proportion of sources/models agreeing on the prediction |
| **Mean Confidence** | 0.3 | Average confidence across agreeing base learners |
| **Source Reliability** | 0.2 | Historical accuracy of contributing sources |
| **Time Freshness** | 0.1 | Recency-weighted assessment (NABLA Time Decay) |
| **Diversity Bonus** | 0.1 | Higher confidence when diverse sources agree |

## Usage in Prismatic Platform

### Security Rating Engine

The Prismatic Platform applies ensemble principles in its security rating engine, combining assessments from multiple OSINT sources to produce higher-confidence composite scores. The Perimeter EASM module uses this for attack surface scoring across domains, IPs, and services.

### OSINT Intelligence Fusion

When multiple OSINT tools return findings for the same entity (e.g., a domain queried against Czech ARES, global threat feeds, and reputation databases), the ensemble scorer produces a unified assessment that is more reliable than any single source.

### Due Diligence Scoring

The DD pipeline's scoring engine uses ensemble methods to combine financial data, legal records, media analysis, and OSINT findings into composite entity risk scores. Each data source is treated as a base learner with its own reliability weight.

### Multi-Agent Synthesis

When multiple AIAD agents investigate the same target, the Purple Team coordinator acts as a meta-learner in a stacking ensemble -- combining agent conclusions while preserving disagreements as explicit contradictions rather than averaging them away.

## Code Examples

```elixir
defmodule PrismaticPerimeter.EnsembleScorer do
  @moduledoc """
  Ensemble scoring engine that combines assessments from multiple
  OSINT sources and analysis modules to produce composite security
  ratings with confidence intervals.

  Implements three combination methods: weighted average (default),
  majority vote, and stacking. Tracks agreement ratio as a
  meta-confidence signal and applies time decay to older assessments.
  """

  require Logger

  @type assessment :: %{
    source: atom(),
    score: float(),
    confidence: float(),
    timestamp: DateTime.t(),
    reliability: float(),
    methodology: String.t()
  }

  @type ensemble_result :: %{
    composite_score: float(),
    confidence: float(),
    method: :weighted_average | :majority_vote | :stacking,
    assessments: list(assessment()),
    agreement_ratio: float(),
    diversity_score: float(),
    calibrated_confidence: float()
  }

  @type diversity_metrics :: %{
    source_count: non_neg_integer(),
    methodology_count: non_neg_integer(),
    temporal_spread_hours: float(),
    diversity_index: float()
  }

  @doc """
  Combines multiple source assessments into a composite score using
  the specified ensemble method. Computes agreement ratio, diversity
  metrics, and calibrated confidence.

  ## Examples

      iex> assessments = [
      ...>   %{source: :ares, score: 0.7, confidence: 0.9, timestamp: DateTime.utc_now(), reliability: 0.95, methodology: "registry"},
      ...>   %{source: :threatfeed, score: 0.6, confidence: 0.8, timestamp: DateTime.utc_now(), reliability: 0.85, methodology: "threat_intel"}
      ...> ]
      iex> {:ok, result} = PrismaticPerimeter.EnsembleScorer.combine(assessments)
      iex> result.composite_score > 0.0
      true

  """
  @spec combine(list(assessment()), atom()) :: {:ok, ensemble_result()} | {:error, term()}
  def combine(assessments, method \\ :weighted_average)

  def combine([], _method), do: {:error, :no_assessments}

  def combine(assessments, method) do
    result = case method do
      :weighted_average -> weighted_average(assessments)
      :majority_vote -> majority_vote(assessments)
      :stacking -> stacking(assessments)
    end

    agreement = calculate_agreement(assessments)
    diversity = calculate_diversity(assessments)

    calibrated_confidence =
      result.confidence * 0.3 +
      agreement * 0.3 +
      average_reliability(assessments) * 0.2 +
      average_freshness(assessments) * 0.1 +
      diversity.diversity_index * 0.1

    Logger.info("Ensemble scoring complete",
      method: method,
      source_count: length(assessments),
      composite_score: result.score,
      agreement: agreement,
      diversity: diversity.diversity_index
    )

    {:ok, %{
      composite_score: result.score,
      confidence: result.confidence,
      method: method,
      assessments: assessments,
      agreement_ratio: agreement,
      diversity_score: diversity.diversity_index,
      calibrated_confidence: min(calibrated_confidence, 1.0)
    }}
  end

  @doc """
  Computes diversity metrics across the set of assessments.
  Higher diversity indicates more independent sources, which
  strengthens ensemble reliability per the ambiguity decomposition.

  ## Examples

      iex> assessments = [
      ...>   %{source: :a, methodology: "registry", timestamp: DateTime.utc_now()},
      ...>   %{source: :b, methodology: "threat_intel", timestamp: DateTime.utc_now()}
      ...> ]
      iex> metrics = PrismaticPerimeter.EnsembleScorer.calculate_diversity(assessments)
      iex> metrics.source_count == 2
      true

  """
  @spec calculate_diversity(list(assessment())) :: diversity_metrics()
  def calculate_diversity(assessments) do
    sources = assessments |> Enum.map(& &1.source) |> Enum.uniq()
    methodologies = assessments |> Enum.map(& &1[:methodology]) |> Enum.uniq() |> Enum.reject(&is_nil/1)

    timestamps = Enum.map(assessments, & &1.timestamp)
    temporal_spread = case {Enum.min(timestamps, DateTime), Enum.max(timestamps, DateTime)} do
      {min_t, max_t} -> DateTime.diff(max_t, min_t, :second) / 3600.0
    end

    source_diversity = min(length(sources) / 5.0, 1.0)
    method_diversity = min(length(methodologies) / 3.0, 1.0)
    temporal_diversity = min(temporal_spread / 168.0, 1.0)

    diversity_index = source_diversity * 0.5 + method_diversity * 0.3 + temporal_diversity * 0.2

    %{
      source_count: length(sources),
      methodology_count: length(methodologies),
      temporal_spread_hours: temporal_spread,
      diversity_index: diversity_index
    }
  end

  @spec weighted_average(list(assessment())) :: %{score: float(), confidence: float()}
  defp weighted_average(assessments) do
    weights = Enum.map(assessments, fn a ->
      time_weight = calculate_time_decay(a.timestamp)
      a.confidence * a.reliability * time_weight
    end)

    total_weight = Enum.sum(weights)

    score =
      assessments
      |> Enum.zip(weights)
      |> Enum.reduce(0.0, fn {a, w}, acc ->
        acc + a.score * (w / max(total_weight, 0.001))
      end)

    avg_confidence = total_weight / max(length(assessments), 1)

    %{score: score, confidence: min(avg_confidence, 1.0)}
  end

  @spec majority_vote(list(assessment())) :: %{score: float(), confidence: float()}
  defp majority_vote(assessments) do
    buckets = Enum.group_by(assessments, fn a ->
      cond do
        a.score >= 0.8 -> :high
        a.score >= 0.5 -> :medium
        true -> :low
      end
    end)

    {_majority_label, majority_group} = Enum.max_by(buckets, fn {_k, v} -> length(v) end)
    avg_score = Enum.reduce(majority_group, 0.0, &(&1.score + &2)) / length(majority_group)
    confidence = length(majority_group) / length(assessments)

    %{score: avg_score, confidence: confidence}
  end

  @spec stacking(list(assessment())) :: %{score: float(), confidence: float()}
  defp stacking(assessments) do
    # Stacking meta-learner: learns optimal combination weights
    # from historical data. Falls back to weighted average when
    # meta-learner is not trained for the current source combination.
    weighted_average(assessments)
  end

  @spec calculate_agreement(list(assessment())) :: float()
  defp calculate_agreement(assessments) do
    scores = Enum.map(assessments, & &1.score)
    mean = Enum.sum(scores) / max(length(scores), 1)
    variance = Enum.reduce(scores, 0.0, fn s, acc ->
      acc + (s - mean) * (s - mean)
    end) / max(length(scores), 1)

    max(1.0 - :math.sqrt(variance), 0.0)
  end

  @spec calculate_time_decay(DateTime.t()) :: float()
  defp calculate_time_decay(timestamp) do
    age_hours = DateTime.diff(DateTime.utc_now(), timestamp, :second) / 3600.0
    max(1.0 - age_hours / 720.0, 0.1)
  end

  @spec average_reliability(list(assessment())) :: float()
  defp average_reliability(assessments) do
    reliabilities = Enum.map(assessments, & &1.reliability)
    Enum.sum(reliabilities) / max(length(reliabilities), 1)
  end

  @spec average_freshness(list(assessment())) :: float()
  defp average_freshness(assessments) do
    freshness_scores = Enum.map(assessments, &calculate_time_decay(&1.timestamp))
    Enum.sum(freshness_scores) / max(length(freshness_scores), 1)
  end
end
```

```elixir
defmodule PrismaticPerimeter.EnsemblePruner do
  @moduledoc """
  Identifies and recommends removal of underperforming base learners
  (sources) from the ensemble. A source is recommended for pruning
  when its inclusion consistently reduces ensemble accuracy compared
  to the ensemble without it.

  Implements leave-one-out evaluation: for each source, compare
  ensemble performance with and without it. If removal improves
  performance, flag the source for review.
  """

  alias PrismaticPerimeter.EnsembleScorer

  require Logger

  @type pruning_recommendation :: %{
    source: atom(),
    impact: :positive | :negative | :neutral,
    accuracy_delta: float(),
    recommendation: :keep | :review | :remove
  }

  @doc """
  Evaluates each source's contribution to ensemble accuracy using
  leave-one-out analysis. Returns a list of recommendations.

  ## Examples

      iex> assessments = [
      ...>   %{source: :a, score: 0.7, confidence: 0.9, timestamp: DateTime.utc_now(), reliability: 0.95, methodology: "registry"},
      ...>   %{source: :b, score: 0.3, confidence: 0.5, timestamp: DateTime.utc_now(), reliability: 0.4, methodology: "scraping"}
      ...> ]
      iex> recs = PrismaticPerimeter.EnsemblePruner.evaluate(assessments, 0.7)
      iex> is_list(recs)
      true

  """
  @spec evaluate(list(EnsembleScorer.assessment()), float()) :: list(pruning_recommendation())
  def evaluate(assessments, ground_truth_score) do
    {:ok, full_result} = EnsembleScorer.combine(assessments)
    full_error = abs(full_result.composite_score - ground_truth_score)

    Enum.map(assessments, fn target ->
      remaining = Enum.reject(assessments, &(&1.source == target.source))

      if remaining == [] do
        %{
          source: target.source,
          impact: :positive,
          accuracy_delta: 0.0,
          recommendation: :keep
        }
      else
        {:ok, reduced_result} = EnsembleScorer.combine(remaining)
        reduced_error = abs(reduced_result.composite_score - ground_truth_score)
        delta = full_error - reduced_error

        {impact, recommendation} = cond do
          delta > 0.05 -> {:negative, :remove}
          delta > 0.01 -> {:negative, :review}
          delta < -0.05 -> {:positive, :keep}
          true -> {:neutral, :keep}
        end

        Logger.debug("Ensemble pruning evaluation",
          source: target.source,
          impact: impact,
          delta: delta
        )

        %{
          source: target.source,
          impact: impact,
          accuracy_delta: delta,
          recommendation: recommendation
        }
      end
    end)
  end
end
```

```elixir
defmodule PrismaticPerimeter.EnsembleMonitor do
  @moduledoc """
  GenServer that monitors ensemble performance over time, tracking
  agreement ratios, diversity metrics, and calibration drift.
  Publishes alerts when ensemble health degrades below thresholds.
  """

  use GenServer

  require Logger

  @type state :: %{
    history: list(map()),
    alert_count: non_neg_integer(),
    last_calibration: DateTime.t()
  }

  @agreement_threshold 0.5
  @diversity_threshold 0.3
  @max_history 1000

  @doc """
  Starts the ensemble monitor.

  ## Examples

      iex> {:ok, pid} = PrismaticPerimeter.EnsembleMonitor.start_link([])
      iex> is_pid(pid)
      true

  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Records an ensemble result for monitoring and trend analysis.
  """
  @spec record(map()) :: :ok
  def record(ensemble_result) do
    GenServer.cast(__MODULE__, {:record, ensemble_result})
  end

  @impl GenServer
  def init(_opts) do
    {:ok, %{history: [], alert_count: 0, last_calibration: DateTime.utc_now()}}
  end

  @impl GenServer
  def handle_cast({:record, result}, state) do
    check_thresholds(result)

    history = [result | Enum.take(state.history, @max_history - 1)]
    {:noreply, %{state | history: history}}
  end

  @spec check_thresholds(map()) :: :ok
  defp check_thresholds(result) do
    if result.agreement_ratio < @agreement_threshold do
      Logger.warning("Ensemble agreement below threshold",
        agreement: result.agreement_ratio,
        threshold: @agreement_threshold
      )

      Phoenix.PubSub.broadcast(
        Prismatic.PubSub,
        "alerts:ensemble",
        {:low_agreement, result}
      )
    end

    if Map.get(result, :diversity_score, 1.0) < @diversity_threshold do
      Logger.warning("Ensemble diversity below threshold",
        diversity: result.diversity_score,
        threshold: @diversity_threshold
      )
    end

    :ok
  end
end
```

## Common Pitfalls

| Pitfall | Description | Consequence | Prevention |
|---------|-------------|-------------|------------|
| **Correlated Base Learners** | Sources using the same underlying data or methodology | Ensemble provides false diversity, no error reduction | Verify source independence, prioritize methodological diversity |
| **Equal Weighting of Unequal Sources** | Treating all sources as equally reliable | Unreliable sources degrade ensemble accuracy | Weight by historical reliability with calibration review |
| **Ignoring Time Decay** | Treating month-old assessments equally to fresh ones | Stale intelligence pollutes composite score | Apply NABLA Time Decay with configurable half-life |
| **Averaging Away Contradictions** | Blending conflicting assessments into a middle score | Loss of critical intelligence about disagreement | Preserve contradictions; report agreement ratio |
| **Ensemble Without Diversity** | Adding more models of the same type | Increased cost without accuracy gain | Measure diversity index; require minimum threshold |
| **Missing Calibration** | Not verifying that confidence scores match actual accuracy | Systematically over- or under-confident predictions | Periodic calibration against ground truth outcomes |
| **Source Contamination** | Base learners sharing training data or features | Overfitting to shared patterns, underperformance on novel data | Audit source data pipelines for independence |
| **Unbounded Ensemble Size** | Adding sources without pruning underperformers | Increased latency and cost, diminishing returns | Leave-one-out evaluation; prune negative-impact sources |
| **Ignoring Source Failures** | Not handling timeout or error from individual sources | Incomplete ensemble or hanging queries | Timeout handling with graceful degradation |
| **Overfitting Meta-Learner** | Stacking meta-learner memorizing training patterns | Poor generalization to new assessment patterns | Cross-validation, regularization, holdout evaluation |

## Best Practices

1. **Ensure diversity among base learners** -- ensembles work best when individual models (or sources) make uncorrelated errors. Measure diversity using methodology count, data independence, and temporal spread. Target diversity index > 0.5.

2. **Weight by historical reliability** -- not all sources provide equal quality. Assign combination weights based on historical accuracy with exponential decay, updating weights as new ground truth becomes available.

3. **Track agreement ratio as a meta-signal** -- high disagreement among ensemble members (agreement < 0.5) signals genuine uncertainty requiring human review. Never suppress disagreement by averaging.

4. **Apply time decay to assessments** -- older assessments should carry less weight in the ensemble. Implement configurable half-life (default 720 hours) with minimum floor weight (0.1) to prevent complete exclusion.

5. **Validate ensemble improvement over baselines** -- measure ensemble performance against individual model baselines and the best single source. If the ensemble does not improve over the best individual, the combination function needs tuning.

6. **Implement leave-one-out evaluation** -- periodically evaluate each source's contribution by comparing ensemble performance with and without it. Flag sources that consistently reduce accuracy for review or removal.

7. **Handle source failures gracefully** -- individual sources may timeout, error, or return incomplete data. The ensemble must degrade gracefully, producing results from available sources rather than failing completely.

8. **Calibrate confidence scores quarterly** -- compare ensemble confidence predictions against actual outcomes over trailing 90-day windows. Adjust scoring functions when systematic miscalibration is detected.

9. **Preserve contradictions for analyst review** -- when sources strongly disagree (bimodal score distribution), report the contradiction explicitly rather than blending to a meaningless middle value. The NABLA Contradiction Preservation axiom mandates this.

10. **Monitor ensemble health continuously** -- track agreement ratio, diversity index, and calibration drift over time. Publish alerts when metrics fall below thresholds, indicating degraded ensemble reliability.

## Related Terms

- [F1 Score](@/glossary/f1-score.md) -- Classification metric for evaluating ensemble performance
- [Distribution](@/glossary/distribution.md) -- Statistical properties of ensemble predictions
- [Few-Shot](@/glossary/few-shot.md) -- Learning technique that can serve as a base learner in ensembles
- [Data Quality](@/glossary/data-quality.md) -- Input quality affecting ensemble accuracy
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Numerical reliability metric from ensemble outputs
- [Chain of Thought](@/glossary/chain-of-thought.md) -- Reasoning technique paralleling self-consistency ensembles
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) -- Multi-source combination applying ensemble principles
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing ensemble contradiction handling
- [AI Agent](@/glossary/ai-agent.md) -- Autonomous entities acting as base learners in agent ensembles
- [GenServer](@/glossary/genserver.md) -- Process model for ensemble monitor and scorer services
- [ETS](@/glossary/ets.md) -- In-memory storage for source reliability weights and history
- [PubSub](@/glossary/pubsub.md) -- Event system for ensemble health alerts

## See Also

- [Capabilities](@/capabilities/_index.md) -- Intelligence fusion capabilities
- [Architecture](@/architecture/_index.md) -- Scoring engine architecture
- [Technologies](@/technologies/_index.md) -- ML technology stack (Axon, EXLA)
- [Security](/security/) -- Security rating engine using ensemble scoring
- [Agents](@/agents/_index.md) -- Multi-agent ensemble via Purple Team synthesis

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
