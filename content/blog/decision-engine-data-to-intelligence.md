+++
title = "The Decision Engine: From Data to Actionable Intelligence"
date = 2026-03-23
description = "Inside Prismatic's Decision Engine: a 6-stage pipeline that transforms raw OSINT data into scored recommendations with uncertainty estimation, hypothesis testing, and traceable reasoning."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["decision-engine", "intelligence", "scoring", "hypothesis", "pipeline", "nabla"]
reading_time = "11 min"
keywords = ["decision engine architecture", "intelligence scoring pipeline", "hypothesis-driven analysis", "uncertainty estimation", "recommendation engine", "intelligence automation"]
image = "/images/blog/decision-engine.png"
word_count = 1900
date_created = "2026-03-23"
date_modified = "2026-03-23"
quality_score = 87
see_also = ["decision-core", "intelligence", "evidence", "confidence", "nabla-infinity"]
image_alt = "The Decision Engine: From Data to Actionable Intelligence - Prismatic Platform"
+++

Data is not intelligence. Intelligence is data that has been analyzed, scored, and contextualized to support a specific decision. Prismatic's Decision Engine is the system that performs this transformation through a 6-stage pipeline.

## The Pipeline

The Decision Engine processes intelligence through six stages:

```
Raw Data → Scoring → Hypothesis → Recommendation → Uncertainty → Explanation
```

Each stage adds structure and confidence to the analysis.

### Stage 1: Data Ingestion

Raw results from OSINT adapters, document analysis, and manual inputs enter the pipeline as unstructured evidence:

```elixir
evidence = %{
  source: :ares,
  entity: "Target s.r.o.",
  finding: %{
    type: :financial,
    metric: :annual_revenue,
    value: 150_000_000,
    currency: :czk,
    period: 2025
  },
  confidence: 0.95,
  retrieved_at: ~U[2026-03-23 10:00:00Z]
}
```

### Stage 2: Scoring

The Scoring Engine evaluates each piece of evidence against configurable criteria:

```elixir
defmodule PrismaticDD.Decision.ScoringEngine do
  def score(evidence, criteria) do
    Enum.map(criteria, fn criterion ->
      weight = criterion.weight
      value = evaluate(evidence, criterion)
      %{criterion: criterion.name, score: value * weight, raw: value}
    end)
  end
end
```

Criteria are domain-specific. For M&A due diligence:
- Financial health (revenue trend, profitability, debt ratio)
- Legal standing (litigation, compliance, insolvency)
- Operational quality (employee count, asset base)
- Governance (ownership transparency, director history)

### Stage 3: Hypothesis Generation

Rather than presenting raw scores, the engine generates testable hypotheses:

```elixir
hypotheses = [
  %{
    statement: "Target company is financially healthy",
    supporting_evidence: [revenue_growth, positive_ebitda, no_debt],
    contradicting_evidence: [declining_margins],
    confidence: 0.78
  },
  %{
    statement: "Ownership structure is transparent",
    supporting_evidence: [registered_ubo, domestic_holding],
    contradicting_evidence: [offshore_intermediate],
    confidence: 0.62
  }
]
```

Each hypothesis is supported and contradicted by specific evidence. This forces the analysis to consider both sides rather than cherry-picking favorable data.

### Stage 4: Recommendation

Based on scored hypotheses, the engine produces recommendations:

```elixir
%Recommendation{
  action: :proceed_with_conditions,
  conditions: [
    "Verify offshore entity ownership chain",
    "Obtain latest audited financials",
    "Complete sanctions screening on UBO"
  ],
  risk_level: :medium,
  confidence: 0.72,
  reasoning: "Financial indicators positive but ownership complexity requires additional verification"
}
```

Recommendations are one of: `:proceed`, `:proceed_with_conditions`, `:defer`, or `:decline`. The engine never produces a binary yes/no -- every recommendation includes conditions and confidence.

### Stage 5: Uncertainty Estimation

The Uncertainty Estimator quantifies what we do not know:

```elixir
defmodule PrismaticDD.Decision.UncertaintyEstimator do
  def estimate(pipeline_state) do
    %{
      epistemic: calculate_epistemic(pipeline_state),
      aleatoric: calculate_aleatoric(pipeline_state),
      bootstrap_interval: run_bootstrap(pipeline_state, n: 1000),
      leave_one_out: run_loo_sensitivity(pipeline_state)
    }
  end
end
```

**Bootstrap analysis** -- resample the evidence 1000 times and measure score variation. High variation means the conclusion depends heavily on specific pieces of evidence.

**Leave-one-out sensitivity** -- remove each evidence source and re-score. If removing a single source changes the recommendation, that source is a critical dependency.

### Stage 6: Explanation

The Explanation module produces a traceable reasoning chain:

```elixir
%Explanation{
  summary: "Medium risk. Proceed with conditions.",
  key_factors: [
    %{factor: "Revenue growth 15% YoY", impact: :positive, weight: 0.25},
    %{factor: "Offshore intermediate in ownership", impact: :negative, weight: 0.15},
    %{factor: "No sanctions exposure", impact: :positive, weight: 0.20}
  ],
  data_gaps: [
    "Latest audited financials not available",
    "UBO verification incomplete for Cypriot entity"
  ],
  confidence_breakdown: %{
    epistemic: 0.12,
    aleatoric: 0.06
  }
}
```

Every recommendation is fully traceable: which evidence supports it, which contradicts it, what information is missing, and how confident we are.

## Reconciliation Loop

After a decision is made and outcomes are observed, the Reconciliation module feeds results back into the system:

```elixir
PrismaticDD.Decision.Reconciliation.reconcile(%{
  case_id: case.id,
  prediction: :proceed_with_conditions,
  outcome: :successful_acquisition,
  outcome_notes: "Offshore entity verified as legitimate tax structure"
})
```

This feedback improves future scoring by calibrating criteria weights. If the engine consistently overweights or underweights certain factors, reconciliation adjusts the model.

## Integration Points

The Decision Engine integrates with three Prismatic pipelines:

- **OSINT Pipeline** -- entity data, sanctions screening, web intelligence
- **DD Pipeline** -- case management, document analysis, entity profiles
- **Investigation Pipeline** -- deep investigations, evidence chains

Each pipeline can invoke `DecisionEngine.run_full_pipeline/2` with its domain-specific criteria.

## Conclusion

The Decision Engine transforms Prismatic from an intelligence collection platform into a decision support system. By combining scoring, hypothesis testing, uncertainty estimation, and traceable explanations, it provides analysts with the structured analysis they need to make confident decisions -- while being transparent about the limits of that confidence.

---

*Explore the [DD Dashboard](/hub/dd/decisions) or learn about the [Nabla Confidence Framework](/blog/nabla-infinity-epistemic-confidence/) for uncertainty quantification.*
