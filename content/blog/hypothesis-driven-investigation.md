+++
title = "Hypothesis-Driven Investigation: Scientific Method for DD"
date = 2026-03-16
description = "Applying scientific methodology to due diligence: hypothesis generation, evidence evaluation, Bayesian updating, and structured analytic techniques"

[extra]
author = "Tomas Korcak (korczis)"
category = "deep-dive"
tags = ["hypothesis-testing", "bayesian", "investigation", "structured-analysis", "epistemic"]
reading_time = "12 min"
keywords = ["hypothesis driven dd", "bayesian updating", "structured analytic techniques", "evidence evaluation", "scientific investigation"]
image = "/images/blog/hypothesis-driven-investigation.png"
word_count = 1350
date_created = "2026-03-16"
date_modified = "2026-03-16"
quality_score = 88
see_also = ["architecture", "developers"]
image_alt = "Hypothesis-Driven Investigation - Prismatic Platform"
+++

Traditional due diligence follows a checklist approach: gather all available data, compile findings, and assess risk. This works for routine investigations but fails when dealing with complex, ambiguous, or deliberately obscured situations. Prismatic implements a hypothesis-driven investigation framework inspired by intelligence analysis methodology, applying Bayesian reasoning to systematically evaluate competing explanations for observed evidence.

## Why Hypotheses Matter

Consider an entity with a complex offshore ownership structure. The checklist approach would note the structure and flag it as a risk factor. But why does the structure exist? There are multiple competing explanations: legitimate tax optimization, asset protection for succession planning, money laundering, sanctions evasion, or simply legacy structure from a previous owner. Each explanation has different risk implications and requires different follow-up investigation.

A hypothesis-driven approach explicitly states these competing explanations, evaluates the evidence for and against each, and updates beliefs as new data arrives. This prevents confirmation bias, the tendency to fixate on the first plausible explanation, and ensures that alternative hypotheses receive fair consideration.

## The Hypothesis Engine

Prismatic's hypothesis engine manages the lifecycle of competing hypotheses through an investigation:

```elixir
defmodule Prismatic.DD.Hypothesis.Engine do
  @moduledoc """
  Hypothesis management engine for structured DD investigation.
  Supports generation, evaluation, and Bayesian updating.
  """

  @type hypothesis :: %{
    id: binary(),
    statement: String.t(),
    category: atom(),
    prior_probability: float(),
    current_probability: float(),
    evidence_for: [evidence_item()],
    evidence_against: [evidence_item()],
    evidence_neutral: [evidence_item()],
    status: :active | :supported | :refuted | :inconclusive,
    generated_by: :system | :analyst
  }

  @spec generate_hypotheses(entity :: map(), context :: map()) :: [hypothesis()]
  def generate_hypotheses(entity, context) do
    generators = [
      &ownership_hypotheses/2,
      &financial_hypotheses/2,
      &sanctions_hypotheses/2,
      &litigation_hypotheses/2,
      &operational_hypotheses/2
    ]

    generators
    |> Enum.flat_map(fn gen -> gen.(entity, context) end)
    |> assign_prior_probabilities(context)
    |> Enum.map(&assign_id/1)
  end

  defp ownership_hypotheses(entity, _context) do
    hypotheses = []

    hypotheses =
      if complex_ownership?(entity) do
        [
          %{statement: "Complex ownership structure serves legitimate tax optimization",
            category: :ownership, prior_probability: 0.35},
          %{statement: "Complex ownership structure obscures beneficial ownership deliberately",
            category: :ownership, prior_probability: 0.25},
          %{statement: "Complex ownership structure is legacy from previous transaction",
            category: :ownership, prior_probability: 0.30},
          %{statement: "Complex ownership structure facilitates illicit financial flows",
            category: :ownership, prior_probability: 0.10}
          | hypotheses
        ]
      else
        hypotheses
      end

    hypotheses
  end
end
```

Prior probabilities are assigned based on base rates from historical investigations. In the Czech M&A context, approximately 35% of complex ownership structures are straightforward tax optimization, 30% are legacy structures, 25% indicate deliberate opacity (which may or may not be illicit), and 10% are associated with financial crime. These base rates provide a starting point that is then updated with entity-specific evidence.

## Bayesian Updating

As evidence accumulates during the investigation, hypothesis probabilities are updated using Bayes' theorem. Each piece of evidence is evaluated for its diagnostic value: how much more likely is this evidence if hypothesis H1 is true versus hypothesis H2?

```elixir
defmodule Prismatic.DD.Hypothesis.Bayesian do
  @moduledoc """
  Bayesian probability updating for hypothesis evaluation.
  """

  @type likelihood_ratio :: %{
    hypothesis_id: binary(),
    evidence_id: binary(),
    likelihood_if_true: float(),
    likelihood_if_false: float(),
    diagnostic_value: float()
  }

  @spec update_probabilities([hypothesis()], evidence_item(), [likelihood_ratio()]) ::
    [hypothesis()]
  def update_probabilities(hypotheses, evidence, likelihood_ratios) do
    updated =
      Enum.map(hypotheses, fn hypothesis ->
        ratio = find_ratio(likelihood_ratios, hypothesis.id, evidence.id)

        new_probability =
          if ratio do
            apply_bayes(hypothesis.current_probability, ratio)
          else
            hypothesis.current_probability
          end

        evidence_bucket =
          cond do
            ratio && ratio.likelihood_if_true > ratio.likelihood_if_false -> :evidence_for
            ratio && ratio.likelihood_if_true < ratio.likelihood_if_false -> :evidence_against
            true -> :evidence_neutral
          end

        hypothesis
        |> Map.put(:current_probability, new_probability)
        |> Map.update!(evidence_bucket, fn existing -> [evidence | existing] end)
      end)

    normalize_probabilities(updated)
  end

  defp apply_bayes(prior, ratio) do
    numerator = prior * ratio.likelihood_if_true
    denominator =
      numerator + (1.0 - prior) * ratio.likelihood_if_false

    if denominator > 0.0 do
      numerator / denominator
    else
      prior
    end
  end

  defp normalize_probabilities(hypotheses) do
    total = Enum.reduce(hypotheses, 0.0, fn h, acc -> acc + h.current_probability end)

    if total > 0.0 do
      Enum.map(hypotheses, fn h ->
        %{h | current_probability: Float.round(h.current_probability / total, 4)}
      end)
    else
      hypotheses
    end
  end
end
```

The normalization step ensures that probabilities across competing hypotheses sum to 1.0 after each update. This constraint reflects the assumption that one of the stated hypotheses is correct, an assumption that should be explicitly challenged when evidence is surprising.

## Evidence Evaluation Framework

Not all evidence is equally informative. A sanctions list hit is highly diagnostic. A company being registered in Cyprus is weakly diagnostic. The evidence evaluation framework scores evidence along two dimensions: reliability (how trustworthy is the source?) and relevance (how directly does this evidence bear on the hypothesis?):

```elixir
defmodule Prismatic.DD.Hypothesis.EvidenceEvaluator do
  @moduledoc """
  Structured evidence evaluation for hypothesis testing.
  """

  @reliability_scores %{
    official_registry: 0.95,
    court_record: 0.90,
    regulatory_filing: 0.85,
    commercial_database: 0.75,
    news_media: 0.55,
    social_media: 0.30,
    anonymous_source: 0.15
  }

  @spec evaluate(evidence_item(), hypothesis()) :: evaluated_evidence()
  def evaluate(evidence, hypothesis) do
    reliability = Map.get(@reliability_scores, evidence.source_type, 0.50)

    relevance = compute_relevance(evidence, hypothesis)

    diagnostic_value = reliability * relevance

    %{
      evidence: evidence,
      hypothesis_id: hypothesis.id,
      reliability: reliability,
      relevance: relevance,
      diagnostic_value: diagnostic_value,
      direction: determine_direction(evidence, hypothesis),
      evaluated_at: DateTime.utc_now()
    }
  end

  defp determine_direction(evidence, hypothesis) do
    cond do
      supports?(evidence, hypothesis) -> :supporting
      contradicts?(evidence, hypothesis) -> :contradicting
      true -> :neutral
    end
  end
end
```

## Structured Analytic Techniques

Beyond Bayesian updating, Prismatic implements several structured analytic techniques from the intelligence analysis tradition:

**Analysis of Competing Hypotheses (ACH)** presents all hypotheses in a matrix against all evidence items, allowing analysts to see at a glance which hypotheses are most consistent with the full evidence set. The key insight of ACH is to focus on disconfirming evidence rather than confirming evidence, reducing confirmation bias.

**Devil's Advocate** automatically generates the strongest possible argument against the leading hypothesis. If the most probable hypothesis is "legitimate tax optimization," the devil's advocate function assembles all evidence that could support the alternative hypothesis of deliberate obscuring.

**Key Assumptions Check** identifies the assumptions underlying each hypothesis and evaluates their validity. For instance, the "legacy structure" hypothesis assumes that the current owners acquired the structure rather than building it. If evidence shows the current owners constructed the offshore chain, this assumption fails and the hypothesis probability drops.

## Confidence and Conclusion

When the investigation concludes, the hypothesis engine produces a structured conclusion:

```elixir
defmodule Prismatic.DD.Hypothesis.Conclusion do
  @moduledoc """
  Investigation conclusion synthesis from hypothesis analysis.
  """

  @spec conclude([hypothesis()]) :: conclusion()
  def conclude(hypotheses) do
    sorted = Enum.sort_by(hypotheses, & &1.current_probability, :desc)
    leading = hd(sorted)
    runner_up = Enum.at(sorted, 1)

    discrimination = leading.current_probability - runner_up.current_probability

    conclusion_strength =
      cond do
        discrimination > 0.40 -> :strong
        discrimination > 0.20 -> :moderate
        discrimination > 0.10 -> :weak
        true -> :inconclusive
      end

    %{
      leading_hypothesis: leading,
      runner_up: runner_up,
      discrimination: Float.round(discrimination, 4),
      conclusion_strength: conclusion_strength,
      remaining_uncertainty: 1.0 - leading.current_probability,
      all_hypotheses: sorted,
      recommendation: generate_recommendation(conclusion_strength, leading, sorted)
    }
  end
end
```

A strong conclusion (discrimination > 0.40) means the evidence clearly favors one hypothesis. An inconclusive result means additional investigation is needed, and the system recommends specific data collection that would most effectively discriminate between the remaining hypotheses.

This hypothesis-driven approach transforms DD from a passive data collection exercise into an active investigation. Analysts are not just gathering information; they are testing specific theories about the entity, which focuses their effort on the most diagnostic evidence and produces more rigorous conclusions.
