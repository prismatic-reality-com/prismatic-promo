+++
title = "Decision Core"
weight = 30
[extra]
category = "architecture"
description = "Closed-loop decision infrastructure with deterministic hypothesis generation, scoring, and calibration"
related_terms = ["calibration", "hypothesis", "uncertainty", "determinism"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 980
date_created = "2026-04-08"
date_modified = "2026-04-08"
quality_score = 90
difficulty = "intermediate"
tags = ["glossary", "decision-core", "architecture", "scoring"]
image = "/images/sections/glossary.png"
image_alt = "Decision Core - Prismatic Platform"
see_also = ["architecture", "developers"]
keywords = ["decision engine", "hypothesis generation", "calibration loop", "deterministic scoring"]
+++

## Definition

The **Decision Core** is Prismatic Platform's closed-loop decision infrastructure that transforms unstructured decision problems into traceable, deterministic outcomes with measurable calibration. Unlike black-box AI systems, every step in the Decision Core pipeline is explicit, inspectable, and reproducible.

The pipeline follows a strict sequence: **INPUT -> HYPOTHESIS -> EVALUATION -> DECISION -> OUTCOME -> CALIBRATION**.

## Technical Deep Dive

### Pipeline Architecture

The Decision Core operates as a six-stage pipeline:

| Stage | Module | Purpose |
|-------|--------|---------|
| Input | `PrismaticDd.Core.DecisionInput` | Captures problem statement, context, structured data, constraints |
| Hypothesis | `PrismaticDd.Core.HypothesisGenerator` | Generates 3-5 competing interpretations deterministically |
| Evaluation | `PrismaticDd.Core.Scorer` | Computes confidence, uncertainty, and risk scores per hypothesis |
| Decision | `PrismaticDd.Decisions.select_decision/4` | Deterministic selection with explicit tie-breakers |
| Outcome | `PrismaticDd.Core.Outcome` | Records real-world result after decision execution |
| Calibration | `PrismaticDd.Core.Calibrator` | Computes prediction-vs-reality delta, adjusts future scoring |

### Scoring Model

The Decision Core uses an explicit, inspectable scoring formula:

```elixir
# Confidence computation
confidence = base_support - contradiction_penalty - missing_data_penalty + calibration_adjustment

# Uncertainty computation
uncertainty = ambiguity + incompleteness + signal_conflict

# Risk computation
risk = base_risk + constraint_risk

# Final decision score
decision_score = confidence - (risk * risk_penalty) - (uncertainty * uncertainty_penalty)
```

All scoring weights are configurable via **weight profiles** (default, finance, hiring, technical, investment).

### Deterministic Fingerprinting

Every decision includes a SHA-256 fingerprint derived from the normalized input, engine version, and scoring profile. Re-running identical inputs with the same calibration state always produces the same decision.

### Calibration Loop

The calibration system uses bucket-based correction:

- Confidence scores are bucketed into 10 bins [0.0-0.1), [0.1-0.2), ..., [0.9-1.0]
- Each bucket tracks the average delta between predicted confidence and observed success
- Future confidence scores are adjusted by their bucket's mean delta
- Adjustments are bounded to [-0.15, +0.15] to prevent runaway correction

### Decision Stability Analysis

Each decision includes stability metrics computed via Gaussian CDF approximation:

- **Margin**: Distance from decision threshold
- **Flip probability**: Likelihood the decision would change under noise
- **Stability level**: very_stable, stable, marginal, unstable

## Implementation in Prismatic Platform

The Decision Core is implemented in the `prismatic_dd` app under `PrismaticDd.Core.*` namespace:

- **6 Ecto schemas** persisting all pipeline artifacts to PostgreSQL
- **3 pure functional modules** (HypothesisGenerator, Scorer, Calibrator) with zero side effects
- **1 context module** (`PrismaticDd.Decisions`) orchestrating the full pipeline
- **REST API** at `/api/v1/decisions` with OpenAPI specification
- **LiveView UI** at `/hub/decision-core` with 4 views (list, new, trace, calibration)
- **7 reusable Phoenix components** in `DecisionCoreComponents`

### Usage Example

```elixir
# Run full pipeline
{:ok, trace} = PrismaticDd.Decisions.run_pipeline(
  %{
    title: "Should we invest in Acme Corp?",
    problem_statement: "Evaluate M&A opportunity given financials",
    structured_data: %{"revenue" => 5_000_000, "employees" => 120}
  },
  profile: "finance"
)

# Later, record what actually happened
{:ok, result} = PrismaticDd.Decisions.attach_outcome(trace.decision.id, %{
  outcome_label: "success",
  success_score: 0.85,
  measured_at: DateTime.utc_now()
})
# Calibration event automatically computed and stored
```

## Best Practices

1. **Always provide structured_data** - More data fields produce more nuanced hypotheses
2. **Use domain-specific profiles** - Finance decisions need different risk weighting than hiring decisions
3. **Record outcomes consistently** - The calibration loop only improves with real-world feedback
4. **Monitor calibration health** - Use `Calibrator.health_check/1` to detect systematic bias
5. **Trust the stability metrics** - If flip_probability > 0.3, the decision is marginal and needs more data

## Related Terms

- [Calibration](/glossary/calibration/) - Probability calibration techniques
- [Uncertainty](/glossary/uncertainty/) - Epistemic vs aleatoric uncertainty
- [Determinism](@/glossary/determinism.md) - Reproducible computation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
