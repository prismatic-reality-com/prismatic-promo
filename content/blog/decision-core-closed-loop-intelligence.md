+++
title = "Building a Closed-Loop Decision Engine: No LLM Magic, Just Math"
date = 2026-04-08
description = "How we built deterministic decision infrastructure that learns from reality without black-box AI"

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["decision-core", "architecture", "calibration", "determinism", "elixir"]
reading_time = "8 min"
word_count = 1200
date_created = "2026-04-08"
date_modified = "2026-04-08"
quality_score = 90
keywords = ["decision engine", "closed loop", "calibration", "hypothesis generation", "deterministic scoring"]
image = "/images/blog/decision-core.png"
image_alt = "Decision Core Architecture - Prismatic Platform"
see_also = ["decision-core", "evidence", "provenance", "confidence", "pipeline"]
+++

## The Problem With AI Decision-Making

Most "AI-powered decision systems" are black boxes. You feed in data, a model produces a number, and you're expected to trust it. When the decision turns out wrong, you can't trace why. When it's right, you can't reproduce it.

We built something different.

## The Decision Core: A Brainstem, Not a Cathedral

The Prismatic Decision Core is a closed-loop decision pipeline where every step is explicit, inspectable, and deterministic. No hidden reasoning. No temperature-based randomness. No "the model says so."

### The Pipeline

```
INPUT -> HYPOTHESIS -> EVALUATION -> DECISION -> OUTCOME -> CALIBRATION
```

Each stage produces a persisted artifact. Every decision can be traced back to the exact signals, weights, and calibration state that produced it.

### 1. Competing Hypotheses, Not Single Answers

When you submit a decision problem, the system doesn't produce one answer. It generates 3-5 competing hypotheses:

- **Proceed**: The favorable interpretation
- **Defer**: The "we need more data" interpretation
- **Reject**: The risk-averse interpretation
- **Conditional**: Only if specific constraints are met
- **Partial**: Act on what we know, defer the rest

Each hypothesis carries its own assumptions, supporting signals, and contradictory signals. This is structured competing analysis, not coin-flipping.

### 2. Explicit Scoring, Not Opaque Confidence

Every hypothesis is scored on three dimensions:

```
confidence = base_support - contradiction_penalty - missing_data_penalty + calibration_adjustment
uncertainty = ambiguity + incompleteness + signal_conflict
risk = base_risk + constraint_risk
```

The final decision score combines these:

```
decision_score = confidence - (risk * 0.4) - (uncertainty * 0.3)
```

These weights aren't hidden. They're configurable per domain. A financial decision uses `risk: 0.6, uncertainty: 0.2`. A hiring decision uses `risk: 0.3, uncertainty: 0.4`. The system ships with 5 built-in profiles.

### 3. Deterministic Selection With Stability Analysis

The highest-scoring hypothesis wins. Tie-breakers are explicit: lower risk, then lower uncertainty, then lower ordinal.

But we go further. Every decision includes a **stability analysis**: how close was this decision to flipping? If the margin is thin (< 0.05), we flag it as "unstable" -- meaning a small change in inputs could reverse the outcome. This uses Gaussian CDF approximation to compute flip probability.

### 4. The Calibration Loop: Learning From Reality

Here's where it gets interesting. After a decision is executed, you record what actually happened:

```elixir
Decisions.attach_outcome(decision_id, %{
  outcome_label: "success",
  success_score: 0.85,
  measured_at: DateTime.utc_now()
})
```

The system automatically computes the **calibration delta**: how far off was the predicted confidence from reality?

- `predicted_confidence: 0.7, observed_success: 0.85` -> delta: +0.15 (under-confident)
- `predicted_confidence: 0.9, observed_success: 0.4` -> delta: -0.5 (over-confident)

These deltas are bucketed by confidence range and used to adjust future scoring. If the system is consistently over-confident in the 0.8-0.9 range, it learns to subtract a correction. Bounded to [-0.15, +0.15] to prevent runaway drift.

### 5. Health Monitoring

The calibration system monitors its own health:

- **Systematic bias**: Is the system consistently over or under-confident?
- **High error**: Are predictions reliably wrong?
- **Sparse buckets**: Do we have enough data in each confidence range?

When drift is detected, the system recommends concrete weight adjustments.

## Why Not Just Use an LLM?

LLMs are powerful but opaque. You can't:
- Reproduce the same decision given the same input
- Trace exactly why one option was chosen over another
- Measure whether the system is getting better or worse over time
- Configure domain-specific risk tolerance

The Decision Core provides all of these. It's infrastructure, not intelligence. It doesn't think -- it computes, traces, and calibrates.

## The Full Stack

The implementation is a vertical slice through the entire platform:

- **6 PostgreSQL tables** with referential integrity
- **3 pure functional modules** (zero side effects, property-tested)
- **REST API** with OpenAPI specification (5 endpoints)
- **LiveView UI** with 7 reusable components
- **177 tests** including property-based invariant tests
- **Telemetry** on all pipeline stages with duration tracking

Everything is deterministic. Same input + same engine version + same calibration state = same decision. Every time.

## What's Next

The Decision Core is the brainstem. Future enhancements:
- Semantic field analysis in hypothesis generation
- Non-linear signal importance scoring
- Adaptive calibration bin widths
- Decision policy profiles for different organizational contexts

But the foundation is the closed loop. Input -> Hypothesis -> Score -> Decide -> Observe -> Calibrate -> Repeat.

That's not AI magic. That's engineering.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
