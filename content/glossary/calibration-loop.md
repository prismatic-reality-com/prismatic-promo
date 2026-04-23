+++
title = "Calibration Loop"
weight = 35
[extra]
category = "intelligence"
description = "Feedback mechanism comparing predicted confidence with observed outcomes to improve future scoring"
related_terms = ["decision-core", "uncertainty", "accuracy"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 620
date_created = "2026-04-08"
date_modified = "2026-04-08"
quality_score = 85
difficulty = "intermediate"
tags = ["glossary", "calibration", "feedback-loop", "scoring"]
image = "/images/sections/glossary.png"
image_alt = "Calibration Loop - Prismatic Platform"
see_also = ["architecture", "developers"]
keywords = ["calibration", "prediction error", "bucket correction", "confidence adjustment"]
+++

## Definition

A **Calibration Loop** is a feedback mechanism that compares predicted confidence scores with observed real-world outcomes, computes the error delta, and uses that delta to adjust future predictions. In the Prismatic Decision Core, calibration operates via bucket-based correction with bounded adjustments.

## Technical Deep Dive

### How It Works

When a decision outcome is recorded, the system computes:

```elixir
calibration_delta = observed_success - predicted_confidence
absolute_error = abs(calibration_delta)
bucket = confidence_bucket(predicted_confidence)  # e.g., "0.7-0.8"
```

A **positive delta** means the system was under-confident (reality was better than predicted). A **negative delta** means over-confident (reality was worse).

### Bucket-Based Correction

Confidence scores are bucketed into 10 bins. Each bucket tracks the average delta across all historical events:

| Bucket | Events | Mean Delta | Interpretation |
|--------|--------|-----------|----------------|
| 0.3-0.4 | 8 | +0.12 | Under-confident in this range |
| 0.5-0.6 | 15 | -0.03 | Well-calibrated |
| 0.7-0.8 | 12 | -0.15 | Over-confident in this range |
| 0.8-0.9 | 5 | +0.05 | Slightly under-confident |

When scoring future hypotheses, the system applies the bucket's mean delta as an adjustment, bounded to [-0.15, +0.15].

### Health Monitoring

The `Calibrator.health_check/1` function detects calibration drift:

- **High MAE** (> 0.25) - predictions are unreliable
- **Systematic bias** (|mean_delta| > 0.1) - consistent over/under-confidence
- **Sparse buckets** (< 3 events) - insufficient data for reliable correction

### Weight Recommendations

When systematic bias is detected, `Calibrator.recommend_weight_adjustment/1` suggests concrete parameter changes to the scoring weights.

## Implementation in Prismatic Platform

```elixir
# Automatic calibration on outcome attachment
{:ok, %{outcome: outcome, calibration: cal}} =
  Decisions.attach_outcome(decision_id, %{
    outcome_label: "success",
    success_score: 0.85,
    measured_at: DateTime.utc_now()
  })

# Check calibration health
:healthy = Calibrator.health_check(events)

# Get weight recommendations
:no_change = Calibrator.recommend_weight_adjustment(events)
```

## Related Terms

- [Decision Core](/glossary/decision-core/) - The full decision pipeline
- [Uncertainty](/glossary/uncertainty/) - Epistemic and aleatoric uncertainty

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
