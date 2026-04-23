+++
title = "Time Decay"
weight = 209

[extra]
category = "epistemic"
description = "NABLA axiom enforcing mandatory timestamps on beliefs with configurable decay functions reducing signal weight over time."
related_terms = ["nabla-infinity", "belief-graph", "signal-plurality", "confidence-threshold", "provenance-mandatory", "qeve", "epistemic-robustness", "monte-carlo-verification", "confidence-scoring", "contradiction-preservation"]
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 1998
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Time", "Decay", "NABLA", "glossary", "epistemic", "Prismatic Platform", "Signal", "Time Decay", "Temporal"]
tags = ["glossary", "epistemic", "time-decay", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Time Decay - Prismatic Platform"
+++

## Definition

Time Decay is the fourth of seven [NABLA Infinity](@/glossary/nabla-infinity.md) axioms and one of five carrying HARD enforcement (E2 BLOCK on violation). It mandates two non-negotiable requirements: every evidence signal and every derived belief must carry a mandatory timestamp recording when the evidence was collected or the belief was formed, and the weight of every signal must decrease over time according to a configurable decay function. Evidence without timestamps is rejected. Evidence with timestamps but without decay applied is rejected. There is no exception, no override, and no emergency bypass.

The axiom addresses a specific and pervasive failure mode in intelligence and due diligence systems: the treatment of historical evidence as though it were current. A sanctions database entry from three years ago, a financial report from last quarter, and a real-time security scan from this morning all contribute to an assessment, but they carry fundamentally different levels of reliability. The sanctions entry may reflect a situation that has been resolved. The financial report may be outdated by a market shift. Only the real-time scan reflects the current state of affairs. Time Decay forces the platform to recognize these differences structurally, not through ad hoc analyst judgment.

Within the Prismatic Platform, Time Decay operates at the [belief graph](@/glossary/belief-graph.md) level. Every edge in the graph carries a decay function and a half-life, and edge weights are recomputed continuously as time passes. A signal that was weighted 0.85 at collection may decay to 0.42 after one half-life, 0.21 after two half-lives, and 0.11 after three. The decay is automatic, continuous, and auditable -- it does not require analyst intervention, cannot be selectively disabled, and produces a complete temporal record in the [audit trail](@/glossary/audit-trail.md).

## Temporal Epistemology

### The Freshness Problem

All knowledge is temporally bounded. A true statement can become false through external change: a company that was financially healthy last year can be insolvent this year. A network that was secure yesterday can be compromised today. A regulatory framework that was compliant last quarter can be violated this quarter. Classical logic treats truth as atemporal -- a proposition is simply true or false. Temporal epistemology recognizes that truth has a shelf life.

The freshness problem is especially acute in domains where the Prismatic Platform operates:

| Domain | Evidence Decay Rate | Typical Freshness Requirement |
|--------|-------------------|-------------------------------|
| Threat intelligence | Very fast (hours to days) | Real-time or near-real-time |
| Financial data | Fast (days to weeks) | Within current reporting period |
| Corporate structure | Moderate (weeks to months) | Within 6 months |
| Regulatory compliance | Moderate (months) | Within certification cycle |
| Legal proceedings | Slow (months to years) | Active case status |
| Geographic data | Very slow (years to decades) | Domain-specific |
| Mathematical facts | None (atemporal) | N/A |

The platform's configurable decay functions allow each signal type to decay at its domain-appropriate rate, rather than applying a single global decay rate that would be too aggressive for some domains and too lenient for others.

### The Stale Evidence Trap

The most dangerous consequence of ignoring time decay is the "stale evidence trap": building high-confidence conclusions on evidence that was accurate when collected but no longer reflects reality. The confidence formula produces a high number because the evidence was strong, but the conclusion is wrong because the evidence is outdated.

Consider a security assessment built on:
- Vulnerability scan from 14 months ago (no critical vulnerabilities found)
- SSL certificate check from 14 months ago (valid certificate, proper configuration)
- DNS analysis from 14 months ago (no suspicious records)

Without time decay, this assessment might produce high confidence in the target's security posture. With time decay (6-month half-life for security scans), the signals have decayed through approximately 2.3 half-lives, reducing their effective weights by approximately 80%. The decayed assessment correctly reflects that 14-month-old security data is largely meaningless -- the target's security posture could have changed completely in the interim.

## Decay Functions

The Prismatic Platform supports three decay functions, each appropriate for different signal characteristics.

### Exponential Decay

Exponential decay reduces signal weight by a constant proportion per unit time. It is the most common decay function and the default for most signal types.

```
weight(t) = initial_weight * e^(-lambda * t)
```

Where lambda = ln(2) / half_life, ensuring the weight halves every half-life period.

**Properties**:
- Smooth, continuous decay
- Weight approaches but never reaches zero
- Most natural model for information that degrades gradually
- Memoryless: the decay rate depends only on current weight, not history

**Appropriate for**: Financial data, corporate structure, compliance status, media reputation -- any signal that degrades gradually as the underlying reality evolves.

**Example**: A financial report with initial weight 0.90 and half-life of 90 days:
- At 90 days: weight = 0.45
- At 180 days: weight = 0.225
- At 270 days: weight = 0.1125
- At 360 days: weight = 0.0563

### Linear Decay

Linear decay reduces signal weight by a constant amount per unit time, reaching zero at a specified expiration time.

```
weight(t) = initial_weight * max(0, 1 - t / expiration_time)
```

**Properties**:
- Predictable, constant rate of decay
- Weight reaches exactly zero at expiration
- Sharp cutoff at expiration (signal becomes worthless)
- Easy to reason about and explain to stakeholders

**Appropriate for**: Signals with hard expiration dates -- certifications, licenses, contract terms, time-limited authorizations. An ISO certification expires on a specific date; after that date, the signal weight should be zero, not merely reduced.

**Example**: An SSL certificate validity check with initial weight 0.85 and expiration in 365 days:
- At 91 days: weight = 0.637
- At 182 days: weight = 0.424
- At 273 days: weight = 0.212
- At 365 days: weight = 0.000

### Step Decay

Step decay maintains full weight until a threshold time, then drops to a reduced weight (or zero) in a single step.

```
weight(t) = initial_weight       if t < threshold
          = reduced_weight       if t >= threshold
```

**Properties**:
- No gradual degradation (full value until threshold)
- Sudden transition at threshold
- Models evidence with a "reliability cliff"
- Simplest model, lowest computational cost

**Appropriate for**: Signals with clear validity windows -- a background check that is current for 12 months, then requires renewal. The information is either valid (full weight) or expired (reduced weight or zero).

**Example**: A background check with initial weight 0.80, threshold of 365 days, and reduced weight of 0.10:
- At 364 days: weight = 0.80
- At 365 days: weight = 0.10 (cliff event)
- At 730 days: weight = 0.10 (remains at reduced, never reaches zero)

## Half-Life Calibration

The half-life parameter is domain-specific and calibrated through empirical analysis and expert input. The platform maintains a default half-life table that can be overridden per assessment:

| Signal Category | Default Half-Life | Rationale |
|----------------|-------------------|-----------|
| Real-time scans (ports, DNS, SSL) | 30 days | Security posture changes frequently |
| Vulnerability assessments | 45 days | New CVEs emerge continuously |
| Financial statements | 90 days | Quarterly reporting cycle |
| Corporate ownership structure | 180 days | Restructuring less frequent |
| Legal proceedings | 180 days | Cases progress slowly |
| Regulatory certifications | 365 days | Annual renewal cycles |
| Sanctions database entries | 90 days | Lists updated quarterly |
| Media reputation signals | 60 days | News cycles are fast |
| Domain registration data | 365 days | Domains renewed annually |

### Dynamic Half-Life Adjustment

The platform can adjust half-lives dynamically based on domain volatility. If a particular sector is experiencing rapid regulatory change (e.g., new sanctions regimes, emergency legislation), the half-life for regulatory signals in that sector can be shortened to reflect the increased rate of change. This adjustment is logged in the [audit trail](@/glossary/audit-trail.md) with full justification.

## DateTime Precision

The NABLA Time Decay axiom requires microsecond-precision timestamps using the `DateTime` type (not `NaiveDateTime`), with mandatory UTC normalization. This precision serves three purposes:

1. **Ordering guarantee**: Two signals collected milliseconds apart can be correctly ordered
2. **Decay precision**: Decay calculations do not lose precision due to timestamp rounding
3. **Audit accuracy**: The [audit trail](@/glossary/audit-trail.md) can reconstruct the exact temporal sequence of signal processing

The platform enforces `DateTime` usage at compile time through Elixir typespecs and Dialyzer analysis. Any module that handles timestamps with `NaiveDateTime` (lacking timezone information) triggers a quality gate failure.

## Interaction with Confidence Scoring

Time Decay affects [confidence scoring](@/glossary/confidence-scoring.md) through two mechanisms:

### Direct Weight Reduction

Decayed evidence weights reduce the `belief_strength` component of the confidence formula:

```
belief_strength = normalized_sum(
  for each signal:
    signal.weight * decay_factor(signal.timestamp, signal.half_life)
)
```

As signals decay, belief_strength decreases, reducing final confidence. This is the primary mechanism by which time decay affects assessments.

### Indirect Plurality Impact

If a hypothesis is supported by three signals and two decay below the minimum weight threshold, the hypothesis may fall below the [Signal Plurality](@/glossary/signal-plurality.md) requirement (minimum two independent signals above threshold). This triggers a secondary confidence reduction or, in extreme cases, a plurality violation that blocks the assessment entirely.

The interaction between time decay and plurality creates a "freshness pressure" on the platform: assessments naturally degrade over time and eventually require refreshment with new evidence. This is by design -- it prevents the platform from maintaining high confidence in conclusions that have not been recently validated.

## Interaction with Monte Carlo Verification

The [Monte Carlo verification](@/glossary/monte-carlo-verification.md) stage includes temporal perturbation as one of its five perturbation categories. Temporal perturbation accelerates or decelerates decay functions by varying the half-life parameter, testing how sensitive the conclusion is to the specific decay calibration.

A conclusion with high temporal [robustness](@/glossary/epistemic-robustness.md) survives a 50% acceleration of decay (half-lives shortened by half). A conclusion with low temporal robustness collapses under modest decay acceleration, indicating that it depends on borderline-fresh evidence that is near its effective expiration.

The sensitivity report from Monte Carlo verification identifies specific signals whose decay status is critical: signals that are currently above the weight threshold but would fall below it with modest decay acceleration. These signals represent the temporal attack surface of the conclusion -- the evidence that will become insufficient soonest if not refreshed.

## TimescaleDB Integration

For temporal queries across large evidence sets, the platform leverages TimescaleDB (a PostgreSQL extension for time-series data) to efficiently answer questions like:

- "Which signals supporting Assessment X will decay below threshold within the next 30 days?"
- "What was the confidence of Assessment Y at each point in time over the last 6 months?"
- "Which assessments have the most rapidly decaying evidence profiles?"

TimescaleDB's hypertable partitioning and time-bucketing functions provide efficient temporal aggregation that would be prohibitively expensive with standard PostgreSQL queries over large evidence tables.

## Comparison with TTL-Based Caching

TTL (Time-To-Live) caching -- used in DNS, HTTP caching, and key-value stores -- is a crude form of time decay: data is fully valid until its TTL expires, then instantly becomes invalid. Time decay in the epistemic context is more nuanced:

| Dimension | TTL Caching | Epistemic Time Decay |
|-----------|-------------|---------------------|
| **Transition** | Binary (valid/expired) | Continuous (gradual weight reduction) |
| **Granularity** | Single TTL per entry | Per-signal decay function and half-life |
| **After expiry** | Data deleted or refreshed | Data preserved at reduced weight |
| **Configurability** | Fixed TTL | Domain-specific, dynamically adjustable |
| **Auditability** | Cache miss/hit logs | Full temporal weight history |

Epistemic time decay is conceptually similar to TTL but operates on a continuous spectrum rather than a binary threshold, and preserves decayed evidence (at reduced weight) rather than deleting it. Decayed evidence still contributes to the assessment -- it just contributes less. Only when weight falls below a minimum threshold is the signal excluded from active confidence calculation, and even then it is preserved in the belief graph for audit purposes.

## Temporal Contradictions

Time Decay introduces a unique category of contradiction: temporal contradictions, where evidence from different time periods produces opposing conclusions. Signal A (from 6 months ago) says "Firm X is compliant" while Signal B (from yesterday) says "Firm X failed compliance audit."

Temporal contradictions are handled through the [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom: both signals are preserved, but the time decay mechanism automatically reduces the weight of Signal A relative to Signal B. Over time, the temporal contradiction may "resolve" naturally as Signal A decays below the weight threshold, leaving Signal B as the dominant signal. However, the contradiction is never artificially resolved -- it persists in the belief graph as a historical record even after one side has decayed to negligible weight.

## Related Terms

- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Parent epistemic framework defining this axiom
- [Belief Graph](@/glossary/belief-graph.md) -- Data structure where decay functions are applied to edge weights
- [Signal Plurality](@/glossary/signal-plurality.md) -- Axiom interacting with decay through freshness pressure
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- Decision thresholds applied to time-decayed confidence scores
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- Axiom requiring traceable timestamps for all evidence
- [QEVE](@/glossary/qeve.md) -- Verification pipeline applying decay in Stage 1 (Graph Build)
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) -- Temporal dimension of robustness measurement
- [Monte Carlo Verification](@/glossary/monte-carlo-verification.md) -- Temporal perturbation testing decay sensitivity
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Formula incorporating decayed evidence weights
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- Axiom governing temporal contradictions
- [Audit Trail](@/glossary/audit-trail.md) -- Immutable record of all decay calculations and adjustments
- [EASM](@/glossary/easm.md) -- Security domain with aggressive decay rates for scan-based evidence

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)