+++
title = "Decision Core Fundamentals"
weight = 8
[extra]
description = "Learn to build and use closed-loop decision infrastructure with deterministic scoring and calibration"
category = "intermediate"
difficulty = "intermediate"
duration = "45 min"
prerequisites = ["otp-fundamentals"]
glossary_terms = ["decision-core", "calibration-loop", "hypothesis-generation", "uncertainty"]
technologies = ["elixir", "ecto", "phoenix-liveview", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1100
date_created = "2026-04-08"
date_modified = "2026-04-08"
quality_score = 85
tags = ["academy", "intermediate", "decision-core", "scoring"]
image = "/images/sections/academy.png"
image_alt = "Decision Core Fundamentals - Prismatic Academy"
see_also = ["glossary", "developers"]
keywords = ["decision engine", "hypothesis generation", "calibration", "scoring profiles"]
+++

## Overview

In this course you will learn:

- How the Decision Core pipeline works end-to-end
- How to submit decision requests via API and LiveView
- How hypothesis generation creates competing interpretations
- How scoring produces explicit confidence, uncertainty, and risk scores
- How to record outcomes and build calibration history
- How to use scoring profiles for domain-specific decisions
- How to interpret stability analysis metrics

## Prerequisites

- Basic Elixir knowledge (functions, maps, pattern matching)
- Understanding of Ecto schemas and changesets
- Familiarity with Phoenix LiveView (mount, handle_event)

## Core Concepts

### 1. The Closed Loop

The Decision Core implements a strict feedback loop:

```
INPUT -> HYPOTHESIS -> EVALUATION -> DECISION -> OUTCOME -> CALIBRATION
         ^                                                      |
         |______________________________________________________|
```

Every decision feeds back into future scoring through calibration events. The system measurably improves over time.

### 2. Running a Decision Pipeline

The simplest way to use the Decision Core:

```elixir
# Submit a decision problem
{:ok, trace} = PrismaticDd.Decisions.run_pipeline(%{
  title: "Should we hire this candidate?",
  problem_statement: "Senior Elixir developer, 8 years experience, asking above budget",
  structured_data: %{
    "experience_years" => 8,
    "salary_ask" => 150_000,
    "budget" => 120_000,
    "team_size" => 5,
    "open_positions" => 2
  },
  constraints: %{
    "budget_hard_limit" => true,
    "start_date" => "2026-Q2"
  }
})

# Inspect the result
trace.hypotheses     # 4 competing interpretations
trace.evaluations    # Confidence/uncertainty/risk per hypothesis
trace.decision       # The selected hypothesis with rationale
trace.duration_us    # Pipeline execution time in microseconds
```

### 3. Understanding Hypotheses

The generator creates 3-5 hypotheses per input:

| # | Type | Example Claim |
|---|------|---------------|
| 1 | Proceed | "Hire: candidate is the correct course of action" |
| 2 | Defer | "Delay: hiring should be delayed pending more information" |
| 3 | Reject | "Pass: candidate should not be pursued" |
| 4 | Conditional | "Hire if salary negotiation succeeds" |

Each hypothesis includes assumptions, supporting signals, and contradictory signals.

### 4. Scoring Profiles

Different decisions need different risk tolerances:

```elixir
# Financial decisions: high risk penalty
{:ok, trace} = Decisions.run_pipeline(attrs, profile: "finance")

# Hiring decisions: high uncertainty penalty
{:ok, trace} = Decisions.run_pipeline(attrs, profile: "hiring")

# Available profiles
PrismaticDd.Core.Scorer.list_profiles()
# => ["default", "finance", "hiring", "technical", "investment"]
```

Profile weights:

| Profile | Risk Penalty | Uncertainty Penalty | Base Support |
|---------|-------------|-------------------|-------------|
| default | 0.4 | 0.3 | 0.4 |
| finance | 0.6 | 0.2 | 0.35 |
| hiring | 0.3 | 0.4 | 0.45 |
| technical | 0.4 | 0.5 | 0.4 |
| investment | 0.5 | 0.3 | 0.35 |

### 5. Recording Outcomes

After a decision plays out in reality:

```elixir
{:ok, result} = Decisions.attach_outcome(trace.decision.id, %{
  outcome_label: "success",     # success | failure | partial | inconclusive
  success_score: 0.85,          # 0.0 to 1.0
  notes: "Candidate accepted counter-offer within budget",
  measured_at: DateTime.utc_now()
})

# Calibration event is automatically computed
result.calibration.calibration_delta  # e.g., -0.05 (slightly over-confident)
result.calibration.bucket             # e.g., "0.7-0.8"
```

### 6. Monitoring Calibration Health

```elixir
# Get overall calibration summary
summary = Decisions.calibration_summary()
summary.total_events        # 42
summary.mean_absolute_error  # 0.12
summary.mean_delta           # -0.03 (slightly over-confident overall)
summary.buckets              # Per-bucket breakdown

# Check calibration health
events = Decisions.list_calibration_events()
:healthy = PrismaticDd.Core.Calibrator.health_check(events)

# Get weight adjustment recommendations
:no_change = PrismaticDd.Core.Calibrator.recommend_weight_adjustment(events)
```

### 7. Using the REST API

```bash
# Submit decision
curl -X POST http://localhost:4000/api/v1/decisions \
  -H "Content-Type: application/json" \
  -d '{"title": "Invest?", "problem_statement": "Evaluate opportunity"}'

# Get trace
curl http://localhost:4000/api/v1/decisions/{id}

# Attach outcome
curl -X POST http://localhost:4000/api/v1/decisions/{id}/outcomes \
  -H "Content-Type: application/json" \
  -d '{"outcome_label": "success", "success_score": 0.85}'

# Calibration summary
curl http://localhost:4000/api/v1/decisions/calibration
```

Full OpenAPI spec available at `/swaggerui`.

### 8. Interpreting Stability

Every decision includes stability metrics:

```elixir
trace.decision.reasoning_trace["stability"]
# %{
#   "level" => "stable",        # very_stable | stable | marginal | unstable
#   "margin" => 0.18,           # distance from decision threshold
#   "flip_probability" => 0.04  # chance decision would change under noise
# }
```

- **very_stable** (margin > 0.3): Strong conviction, unlikely to change
- **stable** (margin > 0.15): Solid but not overwhelming
- **marginal** (margin > 0.05): Could go either way with small changes
- **unstable** (margin <= 0.05): Essentially a coin flip - gather more data

## Exercises

1. Run a pipeline with empty structured_data vs rich structured_data. Compare hypothesis count and confidence scores.
2. Run the same decision with "default" vs "finance" profile. Observe how risk weighting changes the selection.
3. Create 5 decisions, attach outcomes, then check `calibration_summary()`. Observe bucket population.
4. Create a decision where the contrary hypothesis should win (provide only contradictory signals).

## Key Takeaways

- The Decision Core is deterministic: same input = same output
- Hypotheses are explicit and inspectable, not black-box
- Scoring is transparent: you can trace every component
- The calibration loop turns past mistakes into future accuracy
- Stability metrics tell you when to trust a decision and when to gather more data

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
