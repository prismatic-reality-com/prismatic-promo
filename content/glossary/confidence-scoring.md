+++
title = "Confidence Scoring"
weight = 207

[extra]
category = "epistemic"
description = "QEVE multiplicative formula computing final confidence from belief strength, robustness score, and contradiction index -- ensuring no single weak dimension is masked by strengths in others."
related_terms = ["qeve", "belief-graph", "epistemic-robustness", "contradiction-preservation", "signal-plurality", "nabla-infinity", "trinity-gate", "confidence-threshold", "monte-carlo-verification", "time-decay", "provenance-mandatory", "cherry-picking", "audit-trail"]
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
word_count = 2749
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Confidence", "Scoring", "QEVE", "glossary", "epistemic", "Prismatic Platform", "Example", "Component", "Conclusion"]
tags = ["glossary", "epistemic", "confidence-scoring", "prismatic"]
quality_score = 97
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Confidence Scoring - Prismatic Platform"
+++

## Definition

Confidence scoring is the Prismatic Platform's formal methodology for computing how much trust should be placed in any conclusion produced by the epistemic pipeline. The confidence score is not a simple aggregation of evidence weights but a multiplicative composition of three independent dimensions: belief strength (how strongly the evidence supports the conclusion), robustness score (how stable the conclusion is under perturbation), and contradiction index (how much unresolved contradictory evidence exists). The multiplicative structure is the defining design decision: any single weak dimension drags down the entire score, preventing strong evidence from masking fragile reasoning or unresolved contradictions.

The formula at the heart of the confidence scoring system is:

```
final_confidence = belief_strength * robustness_score * (1 - contradiction_index)
```

This formula is computed at the final stage of the [QEVE](@/glossary/qeve.md) verification pipeline, after the [belief graph](@/glossary/belief-graph.md) has been constructed, structurally validated, logically checked, formally verified, and stress-tested through [Monte Carlo verification](@/glossary/monte-carlo-verification.md). The inputs are not raw data but processed, validated, axiom-compliant values. The output is a single scalar in the range [0.0, 1.0] that captures the platform's quantified trust in the conclusion.

The confidence score is consumed by two downstream systems: the [confidence threshold](@/glossary/confidence-threshold.md) comparator (which determines whether the score meets the minimum required for the decision context) and the [Trinity Gate](@/glossary/trinity-gate.md) (which uses the score as one input to its three-layer verification). A score below the applicable threshold results in the conclusion being flagged as insufficiently supported. A score above the threshold permits the conclusion to proceed to decision-makers, accompanied by the full scoring breakdown and audit trail.

## The Case for Multiplicative Composition

### Why Not Addition?

The most intuitive approach to combining multiple quality dimensions is addition: compute a weighted sum of belief strength, robustness, and contradiction absence. This is how most scoring systems work -- credit scores, risk ratings, and performance metrics typically use additive models because they are simple, interpretable, and forgiving. In an additive model, a high score in one dimension can compensate for a low score in another.

This compensatory property is precisely why additive models are unsuitable for epistemic confidence. Consider a conclusion with:

- Belief strength: 0.95 (strong evidence)
- Robustness score: 0.20 (extremely fragile -- collapses under minor perturbation)
- Contradiction index: 0.00 (no contradictions detected)

An additive model with equal weights would produce: (0.95 + 0.20 + 1.00) / 3 = 0.72 -- a respectable score suggesting moderate-to-good confidence. But this conclusion is dangerous: it rests on strong evidence that is extremely fragile. The 0.20 robustness score means that 80% of perturbation scenarios collapse the conclusion. Acting on this conclusion with 0.72 confidence is epistemically reckless.

The multiplicative model produces: 0.95 * 0.20 * 1.00 = 0.19 -- correctly flagging this as a low-confidence conclusion that should not be acted upon without further investigation. The multiplication ensures that the fragility (0.20) dominates the score, regardless of how strong the evidence appears on the surface.

### The Veto Property

Multiplicative composition has what can be called the "veto property": any single dimension approaching zero drives the entire score toward zero. This property formalizes the epistemic principle that confidence requires strength on ALL dimensions, not strength on average.

| Dimension Approaching Zero | Epistemic Meaning |
|---------------------------|-------------------|
| Belief strength near 0 | No meaningful evidence supports the conclusion |
| Robustness score near 0 | The conclusion collapses under any perturbation |
| (1 - contradiction_index) near 0 | The conclusion is almost fully contradicted |

In each case, the appropriate response is low confidence, regardless of the other dimensions. The multiplicative formula enforces this automatically.

### Mathematical Properties

The multiplicative formula has several desirable mathematical properties beyond the veto property:

**Bounded output**: Since all three inputs are in [0, 1], the output is guaranteed to be in [0, 1]. No normalization or clipping is required.

**Monotonicity**: The output is monotonically increasing in belief strength and robustness score, and monotonically decreasing in contradiction index. Improving any dimension (without worsening others) always increases confidence. Worsening any dimension always decreases confidence. There are no paradoxical interactions.

**Sensitivity symmetry**: The partial derivatives of the formula with respect to each input are proportional to the product of the other two inputs. This means the sensitivity of the final score to changes in one dimension depends on the current values of the other dimensions. When robustness is low, changes in robustness have a large effect. When robustness is already high, the same change has a smaller absolute effect. This produces diminishing returns on each dimension individually, incentivizing balanced improvement across all three dimensions rather than extreme investment in a single dimension.

**Decomposability**: The formula can be decomposed into its three factors for diagnostic purposes. An analyst can see that confidence is 0.38 BECAUSE belief strength is 0.95 AND robustness is 0.40. This transparency is essential for actionable intelligence: the score tells you not just how confident you should be but what to improve.

## Component 1: Belief Strength

### Definition

Belief strength measures how strongly the available evidence supports the conclusion, independent of robustness or contradiction considerations. It is computed as the weighted sum of supporting evidence signals after [time decay](@/glossary/time-decay.md) application, normalized to the [0, 1] range.

### Computation

The belief strength for a hypothesis node H in the [belief graph](@/glossary/belief-graph.md) is computed through forward propagation from evidence nodes:

```
raw_strength(H) = sum(
  for each supporting edge (E_i, H):
    signal_weight(E_i) * edge_weight(E_i, H) * decay_factor(E_i, H) * independence_factor(E_i)
)

belief_strength(H) = normalize(raw_strength(H), [0, 1])
```

The normalization function maps the raw sum to [0, 1] using a sigmoid function calibrated per domain. This prevents unbounded accumulation of evidence weights from producing belief strengths greater than 1.0.

### Key Properties

**Time decay integration**: Evidence weights are decayed based on age and the configured decay function (exponential, linear, or step). A signal collected 12 months ago with a 6-month exponential half-life contributes only 25% of its original weight. This implements the [NABLA Infinity](@/glossary/nabla-infinity.md) Time Decay axiom at the scoring level.

**Independence weighting**: Signals from the same `independence_group` (same source provider, same data feed) receive reduced weight because they are not genuinely independent. This implements the Source Independence axiom. Two signals from the same provider contribute less than two signals from independent providers, even if the individual signal weights are identical.

**Plurality floor**: If a hypothesis does not meet the [Signal Plurality](@/glossary/signal-plurality.md) requirement (minimum two independent signals), belief strength is capped at 0.40 regardless of the actual evidence weight. This ensures that single-source conclusions cannot achieve high belief strength, even from a high-confidence source.

### Failure Modes

Belief strength is the most intuitive of the three components but also the most susceptible to gaming. [Cherry picking](@/glossary/cherry-picking.md) specifically targets belief strength by selectively including strong supporting signals and excluding contradicting ones. The robustness and contradiction components serve as checks on belief strength: a cherry-picked conclusion will have high belief strength but low robustness and potentially missing contradictions.

## Component 2: Robustness Score

### Definition

The robustness score quantifies how stable the conclusion is under systematic perturbation of the underlying evidence. It is produced by the [Monte Carlo verification](@/glossary/monte-carlo-verification.md) stage of the [QEVE](@/glossary/qeve.md) pipeline, representing the fraction of 10,000 perturbation scenarios in which the conclusion survived.

### Computation

The [epistemic robustness](@/glossary/epistemic-robustness.md) entry describes the five-dimensional robustness model (signal, weight, source, temporal, and structural robustness). The composite robustness score used in the confidence formula is the weighted aggregation of these dimensions:

```
robustness_score = w_s * signal_robustness
                 + w_w * weight_robustness
                 + w_src * source_robustness
                 + w_t * temporal_robustness
                 + w_str * structural_robustness
```

Default weights: signal (0.30), weight (0.20), source (0.25), temporal (0.15), structural (0.10). These weights are configurable per domain through the domain configuration system.

### Interpretation Scale

| Score Range | Classification | Interpretation |
|-------------|---------------|----------------|
| 0.90 - 1.00 | Excellent | Conclusion survives almost all perturbation scenarios |
| 0.75 - 0.89 | Good | Conclusion is well-supported with minor dependencies |
| 0.50 - 0.74 | Moderate | Conclusion has identifiable vulnerabilities but survives majority of scenarios |
| 0.25 - 0.49 | Fragile | Conclusion depends on specific evidence configuration |
| 0.00 - 0.24 | Critical | Conclusion collapses under minimal perturbation |

A robustness score below 0.50 triggers automatic investigation regardless of the final confidence score, because it indicates that the conclusion is not stable enough for reliable decision-making.

### Diagnostic Value

The robustness score's primary value is not the number itself but the diagnostic information it produces. The Monte Carlo simulation identifies:

- **Load-bearing signals**: Evidence whose removal collapses the conclusion
- **Tipping points**: Specific weight values at which the conclusion transitions from surviving to failing
- **Source dependencies**: Source groups whose loss would devastate the conclusion
- **Temporal vulnerabilities**: Evidence near its decay threshold

This diagnostic information is recorded in the [audit trail](@/glossary/audit-trail.md) and reported alongside the confidence score.

## Component 3: Contradiction Index

### Definition

The contradiction index measures the proportion of unresolved contradictory evidence affecting a hypothesis. It is computed from the [contradiction preservation](@/glossary/contradiction-preservation.md) data in the belief graph.

### Computation

```
contradiction_index(H) = sum(
  severity_weight(c)
  for c in contradictions_affecting(H)
) / total_signal_count(H)
```

Where severity weights are: weak = 0.25, moderate = 0.50, strong = 1.00.

The contradiction index ranges from 0.0 (no contradictions) to a theoretical maximum approaching 1.0 (fully contradicted). In practice, values above 0.50 are rare because they indicate that more than half of the evidential weight is contradictory -- at which point the hypothesis is typically reformulated rather than persisted.

### The (1 - contradiction_index) Term

The confidence formula uses (1 - contradiction_index) as the third multiplicative factor. This has specific mathematical significance:

**Zero contradictions**: (1 - 0.00) = 1.00. No penalty. Confidence depends entirely on belief strength and robustness.

**Moderate contradictions**: (1 - 0.30) = 0.70. A 30% penalty. Even strong, robust evidence is meaningfully reduced by unresolved contradictions.

**Severe contradictions**: (1 - 0.70) = 0.30. A 70% penalty. The conclusion is nearly overwhelmed by contradictory evidence.

The multiplicative interaction with belief strength is critical. Additional supporting evidence increases belief strength but does NOT reduce the contradiction index. Only resolving the contradiction (by definitively disproving one side with new evidence) reduces the index. This prevents the anti-pattern of "overwhelming contradictions with volume" -- accumulating supporting evidence to compensate for unresolved contradictions.

### Severity Classification

The severity classification system distinguishes between levels of contradictory evidence:

**Weak contradictions** (weight 0.25): Disagreements that could plausibly be noise, methodological differences, or measurement imprecision. Example: two financial databases reporting slightly different revenue figures.

**Moderate contradictions** (weight 0.50): Genuine disagreements between credible sources reflecting different assessments, methodologies, or data access. Example: one analyst rating a firm as investment grade while another rates it as speculative.

**Strong contradictions** (weight 1.00): Direct logical oppositions where at least one source must be wrong. Example: one source stating a firm has no pending litigation while another identifies a specific active lawsuit.

## Combined Examples

The confidence scoring formula produces dramatically different results depending on the combination of its three components. The following examples illustrate the formula's behavior across representative scenarios.

### Example 1: Strong, Robust, Clean

```
Belief strength:     0.88
Robustness score:    0.82
Contradiction index: 0.05

Final confidence = 0.88 * 0.82 * (1 - 0.05) = 0.88 * 0.82 * 0.95 = 0.685
```

A well-supported conclusion backed by diverse evidence with minimal contradictions. The final score of 0.685 reflects genuine, actionable confidence. This would pass the standard operations threshold (0.80 required) -- no. Actually, 0.685 is below 0.80. This illustrates an important point: the multiplicative formula is strict. Even good-looking components produce a final score lower than any individual component.

### Example 2: Strong Evidence, Fragile Foundation

```
Belief strength:     0.95
Robustness score:    0.30
Contradiction index: 0.00

Final confidence = 0.95 * 0.30 * 1.00 = 0.285
```

Extremely strong evidence but extremely fragile -- likely dependent on one or two specific signals. Despite zero contradictions and near-perfect belief strength, the conclusion scores 0.285. An additive model would score this around 0.75. The multiplicative model correctly identifies this as unreliable.

### Example 3: Moderate Evidence, Highly Robust

```
Belief strength:     0.65
Robustness score:    0.92
Contradiction index: 0.08

Final confidence = 0.65 * 0.92 * 0.92 = 0.550
```

Moderate evidence from a broad, diverse base with minor contradictions. The conclusion is less flashy but more reliable than Example 2. The score correctly reflects that this conclusion, while not strongly supported, rests on a solid foundation and is unlikely to collapse under new evidence.

### Example 4: Heavily Contradicted

```
Belief strength:     0.90
Robustness score:    0.75
Contradiction index: 0.45

Final confidence = 0.90 * 0.75 * 0.55 = 0.371
```

Strong evidence and reasonable robustness, but nearly half the evidence base is contradictory. The contradiction penalty reduces the score from what would be 0.675 (without contradictions) to 0.371. The formula enforces the principle that unresolved contradictions cannot be compensated by additional supporting evidence.

### Example 5: Theoretical Maximum

```
Belief strength:     1.00
Robustness score:    1.00
Contradiction index: 0.00

Final confidence = 1.00 * 1.00 * 1.00 = 1.000
```

Perfect confidence -- achievable only when all evidence is maximally strong, the conclusion survives every perturbation scenario, and no contradictions exist. In practice, scores above 0.90 are exceedingly rare in real-world intelligence assessments. A score of 1.00 has never been produced in production.

## Integration with Confidence Thresholds

The confidence score is compared against context-specific [confidence thresholds](@/glossary/confidence-threshold.md) to determine actionability:

| Context | Required Threshold | Trinity Gate |
|---------|-------------------|-------------|
| Critical decisions | 0.95 | Mandatory |
| Standard operations | 0.80 | Mandatory |
| Exploratory analysis | 0.60 | Recommended |
| Research queries | 0.50 | Optional |

A confidence score below the applicable threshold does not invalidate the conclusion -- it flags it as insufficiently supported for the decision context. The conclusion remains in the [belief graph](@/glossary/belief-graph.md) with its full scoring breakdown, available for further investigation, evidence gathering, or downgraded decision contexts.

## Auditability and the Audit Trail

Every confidence score computation is fully auditable through the [audit trail](@/glossary/audit-trail.md). The audit record includes:

| Field | Content |
|-------|---------|
| `hypothesis_id` | The hypothesis being scored |
| `timestamp` | When the score was computed (UTC, microsecond precision) |
| `belief_strength` | Component 1 value and its derivation (signal weights, decay factors, independence factors) |
| `robustness_score` | Component 2 value and its five-dimensional breakdown |
| `contradiction_index` | Component 3 value and the specific contradictions contributing |
| `final_confidence` | The multiplicative result |
| `threshold_context` | The applicable threshold and whether the score passed |
| `pipeline_version` | The QEVE pipeline version that produced the score |
| `evidence_snapshot` | Reference to the belief graph snapshot used |

This audit record enables forensic reconstruction: given a historical confidence score, an auditor can reproduce the exact computation, examine every input, and verify that the score was correctly derived from the available evidence at that point in time. The audit trail is append-only and immutable -- scores cannot be retroactively modified without creating a new audit record that references the original.

## Evolution and Calibration

### Score Calibration

The confidence scoring formula produces raw scores that must be calibrated against empirical outcomes to ensure they are meaningful predictors. A score of 0.80 should mean that approximately 80% of conclusions with that score prove correct when subsequently verified. If the platform consistently produces 0.80 scores for conclusions that prove correct only 60% of the time, the formula is overconfident and requires recalibration.

Calibration is performed through retrospective analysis: comparing historical confidence scores against subsequent outcomes (where outcomes are known). The platform maintains a calibration dataset of scored conclusions with known outcomes and periodically regresses the relationship to identify systematic biases.

### Domain-Specific Tuning

Different domains have different evidence characteristics, and the confidence scoring formula accommodates this through configurable parameters:

- **Decay functions**: Financial data uses shorter half-lives than infrastructure data
- **Robustness weights**: Security assessments weight source robustness higher; financial assessments weight temporal robustness higher
- **Contradiction severity**: Some domains tolerate weak contradictions more readily than others
- **Plurality requirements**: High-stakes domains may require three or more independent signals rather than the NABLA minimum of two

These domain-specific configurations are stored in the domain configuration system and applied automatically when the QEVE pipeline processes evidence from the corresponding domain.

## Relationship to Alternative Scoring Approaches

### Bayesian Posterior Probability

Bayesian methods compute posterior probability by combining prior beliefs with observed evidence through Bayes' theorem. The platform's confidence scoring differs from Bayesian posteriors in three key ways:

1. **No prior required**: Bayesian methods require a prior distribution, which is often subjective. Confidence scoring operates on evidence alone, with no prior assumptions.
2. **Robustness dimension**: Bayesian posteriors do not inherently measure stability under perturbation. The robustness component adds a dimension that Bayesian methods lack.
3. **Contradiction preservation**: Bayesian updating naturally resolves contradictions through posterior updating. The platform's scoring explicitly preserves contradictions through the contradiction index rather than resolving them.

### Dempster-Shafer Theory

Dempster-Shafer theory of evidence provides a framework for combining evidence from multiple sources with explicit representation of uncertainty and ignorance. The platform's confidence scoring shares Dempster-Shafer's commitment to explicit uncertainty representation but uses a simpler multiplicative structure rather than Dempster's rule of combination, which can produce counterintuitive results when evidence sources are not independent.

### Fuzzy Logic Scoring

Fuzzy logic systems compute membership degrees in fuzzy sets, producing scores in [0, 1] that represent degree of membership rather than probability. The platform's confidence score is closer to fuzzy logic than to probability in one respect: a confidence of 0.70 does not mean "70% chance of being true" but rather "the evidence supports this conclusion to degree 0.70, considering strength, robustness, and contradictions." This distinction is important for decision-makers who should not interpret confidence scores as probabilities.

## Related Terms

- [QEVE](@/glossary/qeve.md) -- Verification engine producing the inputs to the confidence scoring formula
- [Belief Graph](@/glossary/belief-graph.md) -- Data structure from which belief strength, robustness, and contradictions are derived
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) -- The robustness component of the scoring formula
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- Axiom governing the contradiction index component
- [Signal Plurality](@/glossary/signal-plurality.md) -- Axiom enforcing minimum evidence diversity that affects belief strength
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing all components of the scoring system
- [Trinity Gate](@/glossary/trinity-gate.md) -- Verification gate consuming confidence scores for belief acceptance decisions
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- Context-specific thresholds compared against confidence scores
- [Monte Carlo Verification](@/glossary/monte-carlo-verification.md) -- Methodology producing the robustness score component
- [Time Decay](@/glossary/time-decay.md) -- Temporal weighting mechanism affecting belief strength computation
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- Axiom ensuring all scoring inputs are traceable
- [Cherry Picking](@/glossary/cherry-picking.md) -- Anti-pattern detectable through scoring signature (high belief strength, low robustness)
- [Audit Trail](@/glossary/audit-trail.md) -- Immutable record of all confidence score computations and their derivations
- [Formal Verification](@/glossary/formal-verification.md) -- Verification of scoring formula properties in Lean4

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)