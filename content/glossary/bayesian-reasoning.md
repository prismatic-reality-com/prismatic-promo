+++
title = "Bayesian Reasoning"
weight = 50
[extra]
description = "Statistical inference method that updates probability estimates as new evidence becomes available, foundational to confidence scoring and belief management in the Prismatic Platform"
category = "epistemic"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "epistemic-systems"
related_concepts = ["confidence-scoring", "confidence-threshold", "epistemic-reasoning", "nabla-infinity", "signal-plurality"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 8
prerequisites = ["epistemic-reasoning", "confidence-scoring", "signal-plurality", "nabla-infinity"]
learning_path = ["epistemic-reasoning", "confidence-scoring", "bayesian-reasoning", "nabla-infinity", "trinity-gate"]
interactive_demos = ["/labs/glossary/bayesian-reasoning"]
code_examples = ["Bayesian belief updater with prior/posterior", "multi-signal confidence aggregator", "likelihood ratio calculator"]
external_resources = ["https://en.wikipedia.org/wiki/Bayesian_inference", "https://plato.stanford.edu/entries/bayes-theorem/", "https://www.cs.ubc.ca/~murphyk/Bayes/bayesrule.html"]
version_introduced = "gen-10"
stability_level = "stable"
testing_scenarios = ["prior-posterior convergence", "multi-signal update accuracy", "edge case handling (zero priors)", "numerical stability"]
keywords = ["Bayesian reasoning", "Bayes theorem", "posterior probability", "prior probability", "likelihood ratio", "belief updating", "evidence integration", "confidence scoring Bayesian"]
tags = ["epistemic", "statistics", "bayesian", "confidence", "nabla", "reasoning"]
related_terms = ["confidence-scoring", "confidence-threshold", "epistemic-reasoning", "nabla-infinity", "signal-plurality", "belief-graph", "contradiction-preservation", "provenance-mandatory", "trinity-gate", "epistemic-robustness"]
word_count = 1649
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Bayesian Reasoning - Prismatic Platform"
+++

## Definition

**Bayesian Reasoning** is a statistical inference methodology based on Bayes' theorem that systematically updates probability estimates (beliefs) as new evidence becomes available. Given a prior probability representing the current state of belief and new evidence with a known likelihood, Bayesian reasoning computes a posterior probability that integrates both the prior knowledge and the new data. This process is iterative: each posterior becomes the prior for the next evidence update, enabling beliefs to converge toward truth as evidence accumulates.

Formally, Bayes' theorem states:

```
P(H|E) = P(E|H) * P(H) / P(E)
```

Where `P(H|E)` is the posterior probability of hypothesis H given evidence E, `P(E|H)` is the likelihood of observing E if H is true, `P(H)` is the prior probability of H, and `P(E)` is the marginal probability of E across all hypotheses.

In the [Prismatic Platform](@/glossary/nabla-infinity.md), Bayesian reasoning is the mathematical foundation for [confidence scoring](@/glossary/confidence-scoring.md) within the NABLA epistemic pipeline. Every belief in the platform's [belief graph](@/glossary/belief-graph.md) carries a confidence value that is updated through Bayesian inference as new signals arrive from OSINT sources, security scans, quality metrics, and agent analyses.

## Overview

Bayesian reasoning represents a fundamentally different approach to knowledge than classical (frequentist) statistics. Where frequentist methods treat probability as the long-run frequency of events, Bayesian methods treat probability as a degree of belief that can be assigned to any proposition, including one-time events and theoretical claims.

This distinction has profound implications for epistemic systems. A frequentist system can only assign probabilities to repeatable experiments -- it cannot meaningfully say "there is a 73% probability that this company is involved in money laundering" because this is not a repeatable experiment. A Bayesian system can, because it interprets 73% as a degree of belief warranted by the available evidence, subject to update as new evidence arrives.

For the Prismatic Platform, which must reason about unique entities (specific companies, domains, security configurations), Bayesian reasoning provides the only coherent framework for quantifying confidence. The platform's [signal plurality](@/glossary/signal-plurality.md) axiom ensures multiple independent evidence sources, and Bayesian updating aggregates these signals into a single coherent confidence score.

### Key Concepts

| Concept | Definition | Platform Usage |
|---------|-----------|----------------|
| **Prior** | Initial belief before seeing new evidence | Historical confidence from previous assessments |
| **Likelihood** | Probability of evidence given hypothesis | Signal reliability weight per source |
| **Posterior** | Updated belief after incorporating evidence | New confidence score after signal integration |
| **Evidence** | Observed data that updates beliefs | OSINT signals, security scan results, quality metrics |
| **Conjugate Prior** | Prior distribution that produces same-family posterior | Beta distribution for binary hypotheses |
| **Likelihood Ratio** | Ratio of likelihoods under competing hypotheses | Diagnostic value of each signal source |
| **Bayes Factor** | Ratio of marginal likelihoods for model comparison | Comparing alternative explanations |

## Technical Details

### Bayesian Update Engine

The core Bayesian update engine in Prismatic processes incoming signals and updates belief confidence scores:

```elixir
defmodule Prismatic.Epistemic.BayesianUpdater do
  @moduledoc """
  Bayesian belief updating engine for the NABLA epistemic pipeline.
  Updates confidence scores as new evidence signals arrive,
  maintaining numerical stability and audit trails.
  """

  @type belief_state :: %{
    hypothesis: String.t(),
    prior: float(),
    signals_processed: non_neg_integer(),
    update_history: [update_record()],
    last_updated: DateTime.t()
  }

  @type update_record :: %{
    signal_source: String.t(),
    likelihood_ratio: float(),
    prior: float(),
    posterior: float(),
    timestamp: DateTime.t()
  }

  @type signal :: %{
    source: String.t(),
    observation: :positive | :negative | :neutral,
    reliability: float(),
    timestamp: DateTime.t()
  }

  @epsilon 1.0e-10
  @max_confidence 0.9999
  @min_confidence 0.0001

  @spec update(belief_state(), signal()) :: {:ok, belief_state()} | {:error, term()}
  def update(state, signal) do
    with {:ok, lr} <- compute_likelihood_ratio(signal),
         {:ok, posterior} <- apply_bayes_rule(state.prior, lr) do
      record = %{
        signal_source: signal.source,
        likelihood_ratio: lr,
        prior: state.prior,
        posterior: posterior,
        timestamp: signal.timestamp
      }

      {:ok, %{state |
        prior: posterior,
        signals_processed: state.signals_processed + 1,
        update_history: [record | state.update_history],
        last_updated: signal.timestamp
      }}
    end
  end

  @spec update_batch(belief_state(), [signal()]) :: {:ok, belief_state()} | {:error, term()}
  def update_batch(state, signals) do
    Enum.reduce_while(signals, {:ok, state}, fn signal, {:ok, acc} ->
      case update(acc, signal) do
        {:ok, new_state} -> {:cont, {:ok, new_state}}
        {:error, reason} -> {:halt, {:error, reason}}
      end
    end)
  end

  @spec compute_likelihood_ratio(signal()) :: {:ok, float()} | {:error, term()}
  defp compute_likelihood_ratio(%{observation: :positive, reliability: r}) do
    # P(E|H) / P(E|~H) for positive evidence
    # Reliable positive signal strongly supports hypothesis
    lr = (0.5 + r * 0.5) / (0.5 - r * 0.4)
    {:ok, clamp_lr(lr)}
  end

  defp compute_likelihood_ratio(%{observation: :negative, reliability: r}) do
    # Reliable negative signal weakens hypothesis
    lr = (0.5 - r * 0.4) / (0.5 + r * 0.5)
    {:ok, clamp_lr(lr)}
  end

  defp compute_likelihood_ratio(%{observation: :neutral, reliability: _r}) do
    # Neutral evidence has likelihood ratio of 1 (no update)
    {:ok, 1.0}
  end

  @spec apply_bayes_rule(float(), float()) :: {:ok, float()} | {:error, term()}
  defp apply_bayes_rule(prior, likelihood_ratio) do
    # Using odds form: posterior_odds = likelihood_ratio * prior_odds
    prior_odds = prior / (1.0 - prior + @epsilon)
    posterior_odds = likelihood_ratio * prior_odds
    posterior = posterior_odds / (1.0 + posterior_odds)

    {:ok, clamp_confidence(posterior)}
  end

  @spec clamp_confidence(float()) :: float()
  defp clamp_confidence(value) do
    value
    |> max(@min_confidence)
    |> min(@max_confidence)
  end

  @spec clamp_lr(float()) :: float()
  defp clamp_lr(value) do
    value
    |> max(0.01)
    |> min(100.0)
  end
end
```

### Multi-Hypothesis Bayesian Reasoning

For scenarios with multiple competing hypotheses (e.g., classifying a security finding as critical, high, medium, or low), the platform uses a multi-hypothesis Bayesian framework:

```elixir
defmodule Prismatic.Epistemic.MultiHypothesisBayes do
  @moduledoc """
  Multi-hypothesis Bayesian reasoning for scenarios where multiple
  competing explanations must be evaluated simultaneously.
  Maintains a probability distribution across all hypotheses.
  """

  @type hypothesis_set :: %{String.t() => float()}

  @type evidence :: %{
    source: String.t(),
    likelihoods: %{String.t() => float()},
    timestamp: DateTime.t()
  }

  @spec update(hypothesis_set(), evidence()) :: {:ok, hypothesis_set()} | {:error, term()}
  def update(hypotheses, evidence) do
    with :ok <- validate_likelihoods(hypotheses, evidence) do
      # Compute unnormalized posteriors
      unnormalized =
        Map.new(hypotheses, fn {h, prior} ->
          likelihood = Map.get(evidence.likelihoods, h, 0.5)
          {h, prior * likelihood}
        end)

      # Normalize to ensure probabilities sum to 1.0
      total = unnormalized |> Map.values() |> Enum.sum()

      if total < 1.0e-15 do
        {:error, :numerical_underflow}
      else
        normalized = Map.new(unnormalized, fn {h, v} -> {h, v / total} end)
        {:ok, normalized}
      end
    end
  end

  @spec most_likely(hypothesis_set()) :: {String.t(), float()}
  def most_likely(hypotheses) do
    Enum.max_by(hypotheses, fn {_h, p} -> p end)
  end

  @spec entropy(hypothesis_set()) :: float()
  def entropy(hypotheses) do
    hypotheses
    |> Map.values()
    |> Enum.filter(&(&1 > 0))
    |> Enum.reduce(0.0, fn p, acc -> acc - p * :math.log2(p) end)
  end

  @spec validate_likelihoods(hypothesis_set(), evidence()) :: :ok | {:error, term()}
  defp validate_likelihoods(hypotheses, evidence) do
    missing = Map.keys(hypotheses) -- Map.keys(evidence.likelihoods)

    case missing do
      [] -> :ok
      _ -> {:error, {:missing_likelihoods, missing}}
    end
  end
end
```

### Beta-Binomial Model for Binary Hypotheses

For binary classification (true/false, safe/unsafe), the platform uses the Beta-Binomial conjugate model for computational efficiency:

```elixir
defmodule Prismatic.Epistemic.BetaBinomial do
  @moduledoc """
  Beta-Binomial conjugate model for efficient Bayesian updating
  of binary hypotheses. The Beta distribution is the conjugate prior
  for the Binomial likelihood, enabling closed-form posterior computation.
  """

  @type beta_state :: %{
    alpha: float(),
    beta: float(),
    observations: non_neg_integer()
  }

  @spec new(prior_alpha :: float(), prior_beta :: float()) :: beta_state()
  def new(prior_alpha \\ 1.0, prior_beta \\ 1.0) do
    %{alpha: prior_alpha, beta: prior_beta, observations: 0}
  end

  @spec update(beta_state(), :success | :failure) :: beta_state()
  def update(%{alpha: a, beta: b, observations: n}, :success) do
    %{alpha: a + 1.0, beta: b, observations: n + 1}
  end

  def update(%{alpha: a, beta: b, observations: n}, :failure) do
    %{alpha: a, beta: b + 1.0, observations: n + 1}
  end

  @spec update_batch(beta_state(), successes :: non_neg_integer(), failures :: non_neg_integer()) :: beta_state()
  def update_batch(%{alpha: a, beta: b, observations: n}, successes, failures) do
    %{alpha: a + successes, beta: b + failures, observations: n + successes + failures}
  end

  @spec mean(beta_state()) :: float()
  def mean(%{alpha: a, beta: b}), do: a / (a + b)

  @spec variance(beta_state()) :: float()
  def variance(%{alpha: a, beta: b}) do
    (a * b) / ((a + b) * (a + b) * (a + b + 1.0))
  end

  @spec confidence_interval(beta_state(), float()) :: {float(), float()}
  def confidence_interval(state, level \\ 0.95) do
    # Approximate using normal approximation for Beta distribution
    m = mean(state)
    sd = :math.sqrt(variance(state))
    z = z_score(level)
    {max(0.0, m - z * sd), min(1.0, m + z * sd)}
  end

  @spec z_score(float()) :: float()
  defp z_score(0.90), do: 1.645
  defp z_score(0.95), do: 1.96
  defp z_score(0.99), do: 2.576
  defp z_score(_), do: 1.96
end
```

### Signal Aggregation Pipeline

Bayesian reasoning integrates with the NABLA pipeline through a signal aggregation module that respects the [signal plurality](@/glossary/signal-plurality.md) axiom:

```elixir
defmodule Prismatic.Epistemic.SignalAggregator do
  @moduledoc """
  Aggregates multiple signals into a unified confidence score
  using Bayesian updating. Enforces signal plurality axiom and
  tracks source independence.
  """

  alias Prismatic.Epistemic.BayesianUpdater

  @spec aggregate(signals :: [map()], prior :: float()) ::
    {:ok, %{confidence: float(), signal_count: integer(), sources: [String.t()]}}
    | {:error, :insufficient_signals}
  def aggregate(signals, prior \\ 0.5) do
    unique_sources = signals |> Enum.map(& &1.source) |> Enum.uniq()

    if length(unique_sources) < 2 do
      {:error, :insufficient_signals}
    else
      # Weight signals by source independence
      weighted_signals = apply_independence_weighting(signals)

      # Sort by timestamp for temporal ordering
      sorted = Enum.sort_by(weighted_signals, & &1.timestamp, DateTime)

      # Sequential Bayesian update
      initial_state = %{
        hypothesis: "aggregated",
        prior: prior,
        signals_processed: 0,
        update_history: [],
        last_updated: DateTime.utc_now()
      }

      case BayesianUpdater.update_batch(initial_state, sorted) do
        {:ok, final_state} ->
          {:ok, %{
            confidence: final_state.prior,
            signal_count: final_state.signals_processed,
            sources: unique_sources
          }}

        {:error, reason} ->
          {:error, reason}
      end
    end
  end

  @spec apply_independence_weighting([map()]) :: [map()]
  defp apply_independence_weighting(signals) do
    source_counts = Enum.frequencies_by(signals, & &1.source)

    Enum.map(signals, fn signal ->
      count = Map.get(source_counts, signal.source, 1)
      independence_weight = 1.0 / count
      %{signal | reliability: signal.reliability * independence_weight}
    end)
  end
end
```

## Implementation in Prismatic Platform

### Confidence Scoring System

The platform's [confidence scoring](@/glossary/confidence-scoring.md) system is built entirely on Bayesian principles. Every entity assessment, security rating, and quality metric carries a confidence score computed through Bayesian updating:

- **OSINT Intelligence**: Each data source (ARES, Shodan, VirusTotal, etc.) produces signals that update entity risk confidence via Bayesian inference
- **Security Ratings**: The [Prismatic Perimeter](@/glossary/easm.md) A-F grading system uses multi-hypothesis Bayesian reasoning to classify security posture
- **Quality Metrics**: Code quality confidence is updated as new analysis results arrive from [Credo](@/glossary/credo.md), [Dialyzer](@/glossary/dialyzer.md), and test coverage

### NABLA Pipeline Integration

Bayesian reasoning is the computational engine behind several NABLA axioms:

| Axiom | Bayesian Role |
|-------|---------------|
| Signal Plurality | Multiple signals provide multiple likelihood ratios for Bayesian update |
| Source Independence | Independent sources produce higher-quality likelihood estimates |
| Time Decay | Temporal discounting reduces effective reliability of older signals |
| Contradiction Preservation | Contradictory signals produce opposing likelihood ratios, naturally increasing uncertainty |

### Confidence Thresholds

The platform uses context-dependent confidence thresholds that directly correspond to Bayesian posterior probabilities:

| Context | Threshold | Interpretation |
|---------|-----------|----------------|
| Critical Decisions | 0.95 | Posterior must exceed 95% |
| Standard Operations | 0.80 | Posterior must exceed 80% |
| Exploratory Analysis | 0.60 | Posterior must exceed 60% |
| Research Queries | 0.50 | Any evidence above even odds |

## Comparison with Alternatives

| Method | Evidence Integration | Uncertainty Handling | Prior Knowledge | Computational Cost | Platform Suitability |
|--------|---------------------|---------------------|----------------|-------------------|---------------------|
| **Bayesian Inference** | Principled, sequential | Explicit via distributions | Formally incorporated | Moderate (conjugate models: O(1)) | Excellent |
| **Frequentist Statistics** | Batch-oriented, p-values | Confidence intervals (misinterpreted) | Not incorporated | Low | Poor for unique entities |
| **Dempster-Shafer** | Belief functions | Explicit ignorance modeling | Limited | High | Good for sparse evidence |
| **Fuzzy Logic** | Membership functions | Vagueness, not probability | Domain-specific rules | Low | Fair for linguistic reasoning |
| **Neural Networks** | Learned from data | Implicit in weights | Requires training data | High (training), low (inference) | Poor for interpretability |
| **Rule-Based Systems** | If-then rules | No native uncertainty | Encoded in rules | Low | Poor for nuanced confidence |

Bayesian inference is the optimal choice for the Prismatic Platform because it provides principled evidence integration from heterogeneous sources, explicit uncertainty quantification, formal incorporation of prior knowledge, and tractable computation through conjugate models.

## Best Practices

**Use conjugate priors when possible.** Conjugate prior-likelihood pairs (Beta-Binomial, Dirichlet-Multinomial, Normal-Normal) enable closed-form posterior computation without numerical integration. This makes Bayesian updates computationally trivial -- O(1) per update.

**Calibrate source reliability empirically.** The likelihood ratios assigned to each signal source should be based on historical accuracy data, not subjective estimates. Track each source's hit rate over time and use that data to set likelihood parameters.

**Maintain numerical stability.** Work in log-space when multiplying many probabilities to avoid underflow. Clamp confidence values to avoid exact 0.0 or 1.0 (which make further updating impossible). The `@epsilon`, `@min_confidence`, and `@max_confidence` constants in the updater serve this purpose.

**Track update provenance.** Every Bayesian update should record the prior, the signal, the likelihood ratio, and the posterior. This creates an auditable trail that satisfies the [provenance mandatory](@/glossary/provenance-mandatory.md) axiom and enables debugging of unexpected confidence values.

**Use uninformative priors for genuinely new hypotheses.** When there is no prior information, start with Beta(1,1) (uniform) rather than an arbitrary informative prior. Let the evidence speak for itself. Reserve informative priors for cases where genuine prior knowledge exists.

**Separate model uncertainty from parameter uncertainty.** The Bayesian update engine handles parameter uncertainty (what is the true probability?). Model uncertainty (is this the right model?) requires a higher-level mechanism like Bayesian model comparison or the multi-hypothesis framework.

## Common Pitfalls

**Using point estimates instead of distributions.** Reducing a Beta(15, 5) posterior to its mean (0.75) discards information about certainty. A Beta(15, 5) with 20 observations is much more certain than a Beta(3, 1) with 4 observations, even though both have a mean of 0.75. Always propagate full distributional information where possible.

**Ignoring prior sensitivity.** For beliefs with few observations, the choice of prior has outsized influence on the posterior. Conduct sensitivity analysis by comparing posteriors under different reasonable priors. If conclusions change dramatically, more evidence is needed.

**Assuming signal independence.** Bayesian updating assumes signals are conditionally independent given the hypothesis. When sources are correlated (e.g., two OSINT providers using the same underlying data), naive updating overstates confidence. The independence weighting mechanism in `SignalAggregator` addresses this.

**Overconfidence from many weak signals.** A hundred weak signals can drive confidence close to 1.0 even when each individual signal is barely informative. Apply reliability weighting to prevent low-quality signals from dominating through volume.

**Forgetting to normalize in multi-hypothesis models.** When updating multiple hypotheses, the posteriors must sum to 1.0 after every update. Missing normalization causes probability mass to leak or accumulate, producing nonsensical results.

**Treating confidence as truth.** A Bayesian posterior of 0.95 means "given the evidence and model, there is a 95% probability." It does not mean "this is true." The model might be wrong, the evidence might be biased, and unknown unknowns might exist. Bayesian reasoning improves decisions but does not guarantee truth.

## Use Cases

### Entity Risk Assessment

When investigating a company for due diligence, the platform starts with an uninformative prior (Beta(1,1), 50% risk). As signals arrive -- clean commercial registry data (lowers risk), sanctions list match (raises risk), positive financial audit (lowers risk) -- Bayesian updating produces a calibrated risk confidence that reflects all available evidence.

### Security Rating Evolution

Prismatic Perimeter's security ratings use Bayesian reasoning to update grades over time. A domain initially assessed as "B" receives continuous signals from certificate monitoring, DNS enumeration, and vulnerability scanning. Each scan result updates the posterior, causing the grade to drift naturally as the security posture evolves.

### OSINT Signal Fusion

When 120 OSINT tools produce signals about the same entity, Bayesian reasoning provides a principled method for fusing these signals into a unified assessment. Source reliability weights (calibrated from historical accuracy) determine how much each signal shifts the posterior.

### Quality Metric Confidence

The platform's quality scoring system uses Beta-Binomial models to track confidence in quality metrics. Each passing test updates the "code is correct" hypothesis, each quality gate passage updates the "code meets standards" hypothesis, and the resulting confidence score determines whether the quality floor is maintained.

## Related Concepts

- [Confidence Scoring](@/glossary/confidence-scoring.md) -- The scoring system built on Bayesian updates
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- Context-dependent posterior thresholds for decisions
- [Epistemic Reasoning](@/glossary/epistemic-reasoning.md) -- Broader reasoning framework incorporating Bayesian methods
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework whose pipeline uses Bayesian computation
- [Signal Plurality](@/glossary/signal-plurality.md) -- Axiom ensuring multiple signals for Bayesian aggregation
- [Belief Graph](@/glossary/belief-graph.md) -- Graph structure storing beliefs with Bayesian confidence values
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- Contradictory evidence handled via opposing likelihood ratios
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- Audit trail requirement for every Bayesian update
- [Trinity Gate](@/glossary/trinity-gate.md) -- Validation gate using confidence thresholds from Bayesian inference
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) -- System resilience measured through Bayesian uncertainty

## See Also

- [Axiom Enforcement](@/glossary/axiom-enforcement.md) -- Enforcement of NABLA axioms that govern Bayesian operations
- [Formal Verification](@/glossary/formal-verification.md) -- Mathematical proofs complementing probabilistic reasoning
- [Cosine Similarity](@/glossary/cosine-similarity.md) -- Similarity metric used alongside Bayesian scores
- [Entity Resolution](@/glossary/entity-resolution.md) -- Bayesian methods for resolving entity identity
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- Uses Bayesian confidence for quality decisions
- [EASM](@/glossary/easm.md) -- External attack surface management using Bayesian security ratings
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Apps](@/apps/_index.md) -- Umbrella applications using Bayesian reasoning

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
