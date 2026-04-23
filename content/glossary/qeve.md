+++
title = "QEVE"
weight = 3
[extra]
category = "ai-ml"
acronym = "QEVE"
description = "Quantified Epistemic Verification Engine combining Lean4 theorem proving, NABLA axioms, and Monte Carlo simulation for formal verification of platform beliefs."
related_terms = ["lean4", "nabla-infinity", "trinity-gate", "color-teams", "white-team", "confidence-threshold", "signal-plurality", "provenance-mandatory", "epistemic-pipeline", "property-based-testing"]
author = "Tomas Korcak (korczis)"
reading_time = "11 min"
word_count = 2244
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["QEVE", "Quantified", "Epistemic", "Verification", "Engine", "Lean4", "NABLA", "glossary", "ai ml", "Prismatic Platform"]
tags = ["glossary", "ai-ml", "qeve", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "QEVE - Prismatic Platform"
+++

## Definition

QEVE (Quantified Epistemic Verification Engine) is the Prismatic Platform's formal verification framework that synthesizes three complementary methodologies into a unified validation pipeline: Lean4 theorem proving for mathematical certainty, NABLA axiom enforcement for epistemic rigor, and Monte Carlo simulation for probabilistic robustness testing. Unlike conventional validation approaches that rely on a single method, QEVE produces auditable, formally grounded, robustness-tested conclusions with quantified confidence, uncertainty, and stability metrics.

The engine occupies a critical position in the platform's epistemic infrastructure. Where [NABLA Infinity](@/glossary/nabla-infinity.md) governs how beliefs are formed and [Trinity Gate](@/glossary/trinity-gate.md) governs whether beliefs are accepted, QEVE provides the verification machinery that bridges the two. Every claim that passes through the epistemic pipeline undergoes QEVE validation before it can influence downstream decisions.

Most AI systems produce scores. QEVE produces conclusions that answer three questions simultaneously: **Is this logically necessary?** (formal layer), **Is this epistemically sound?** (NABLA layer), and **Is this robust under perturbation?** (Monte Carlo layer). The combination ensures that no conclusion rests on fragile assumptions, hidden contradictions, or untested edge cases.

## Architecture

QEVE operates as a five-stage pipeline where each stage builds on the outputs of the previous one. The stages are not independent checks but a progressive deepening of verification rigor.

```
Stage 1: Graph Build (NABLA Layer)
    |
    v
Stage 2: Structural Check (DAG Validity)
    |
    v
Stage 3: Logical Check (Rule Consistency)
    |
    v
Stage 4: Lean4 Formal Layer (Theorem Proving)
    |
    v
Stage 5: Monte Carlo Robustness (Stress Testing)
    |
    v
Output: VerificationResult (confidence, uncertainty, robustness, contradictions)
```

The architecture ensures that formal proofs are never applied to structurally unsound belief graphs, and that Monte Carlo simulations are never run against logically inconsistent rule sets. Each stage acts as both a validator and a filter, preventing garbage-in-garbage-out propagation.

## Pipeline Stages

### Stage 1: Graph Build (NABLA Layer)

The pipeline begins by constructing the belief graph from available evidence signals. This stage enforces the seven [NABLA Infinity](@/glossary/nabla-infinity.md) axioms directly:

- **Build the belief graph** from all available evidence, linking signals to hypotheses through weighted edges
- **Compute signal plurality** by verifying that every belief node has at least two independent supporting signals (hard enforcement)
- **Apply time decay** to evidence timestamps, reducing the weight of stale signals according to configurable decay functions
- **Identify contradictions** between signals and preserve them explicitly in the graph structure rather than resolving them prematurely
- **Verify provenance chains** ensuring every signal traces back to an identifiable, auditable source

The output is a weighted, time-decayed belief graph with contradiction annotations and provenance metadata attached to every node and edge.

### Stage 2: Structural Check

The structural check validates the topological integrity of the belief graph using graph theory:

- **DAG validity**: Confirm the belief network forms a valid directed acyclic graph with no circular dependencies between beliefs
- **Dependency cycle detection**: Identify and flag any circular reasoning patterns where Belief A supports Belief B which supports Belief A
- **Orphan signal detection**: Find evidence signals that are not connected to any hypothesis, indicating potential gaps in the analysis
- **Connectivity analysis**: Verify that the graph is sufficiently connected and that critical conclusions are not hanging from single-threaded evidence chains

A structural check failure triggers an immediate halt. No amount of logical soundness can compensate for a structurally broken belief graph.

### Stage 3: Logical Check

The logical check applies rule-based evaluation to the structurally valid belief graph:

- **Rule engine consistency**: Verify that all inference rules applied in the belief graph are internally consistent and do not produce contradictory conclusions from the same premises
- **Conflicting rule detection**: Identify cases where two or more rules produce opposing conclusions and flag them for explicit contradiction handling
- **Assumption leakage detection**: Find cases where assumptions from one domain have leaked into another without proper justification or provenance
- **Axiom compliance**: Confirm that the inference chain does not violate any of the seven NABLA axioms at any step

### Stage 4: Lean4 Formal Layer

The formal layer uses [Lean4](@/glossary/lean4.md) theorem proving to establish mathematical certainty for the core claims:

- **Theorem generation**: Translate the critical hypothesis and its supporting evidence chain into a Lean4 theorem statement
- **Proof search**: Attempt to prove the theorem using Lean4's automated and interactive proving capabilities
- **Disproof detection**: If the theorem cannot be proved, attempt to construct a counterexample that disproves it
- **Assumption audit**: Verify that the proof does not depend on hidden assumptions that are not present in the evidence graph

The formal layer distinguishes between conclusions that are **necessary** (must be true given the evidence) and those that are merely **possible** (could be true but are not forced by the evidence). This distinction is critical for high-stakes decisions where possibility is insufficient.

### Stage 5: Monte Carlo Robustness

The final stage stress-tests the conclusion against perturbation to quantify its stability:

- **Weight perturbation**: Randomly adjust evidence weights by +/-20% across 10,000 simulation runs to test sensitivity to evidence strength assumptions
- **Signal removal**: Systematically remove individual signals and signal combinations to identify which evidence is load-bearing and which is redundant
- **Failure simulation**: Inject simulated failures at various points in the evidence chain to test conclusion resilience
- **Distribution analysis**: Aggregate results across all 10,000 scenarios to produce a robustness distribution showing what percentage of perturbations preserve the original conclusion

The robustness score represents the percentage of Monte Carlo scenarios in which the conclusion survived perturbation. A score of 72% means 7,200 out of 10,000 perturbation scenarios preserved the original conclusion. Scores below 50% indicate a fragile conclusion that should not be acted upon without additional evidence.

## Use Case: Due Diligence

A concrete example illustrates QEVE's value in the `prismatic_dd` (due diligence) application.

**Scenario**: Firm X is acquiring Firm Y. The platform must assess the risk profile of the target.

**OSINT signals gathered**:
- Sanctions database hits linking Firm Y's subsidiary to a flagged entity
- Ownership structure changes in the past 18 months (3 restructurings)
- Pending lawsuit in a foreign jurisdiction
- Compliance certification renewal delayed by 6 months
- Mixed media reputation: positive industry coverage but negative local press

**QEVE validation pipeline**:

1. **Graph Build**: Constructs a belief graph with 5 primary evidence signals, checks plurality (all hypotheses have 2+ supporting signals), applies time decay (the ownership changes are 14 months old, decayed accordingly), and preserves the contradiction between positive and negative media coverage
2. **Structural Check**: DAG is valid, no circular reasoning, but flags one orphan signal (the compliance delay is not connected to any risk hypothesis -- requires analyst review)
3. **Logical Check**: Rules are consistent, but identifies a potential assumption leakage: the sanctions link applies to a subsidiary, not the parent entity. The inference chain assumes subsidiary risk propagates upward without explicit justification
4. **Lean4 Formal Layer**: Generates a theorem for "Firm Y presents elevated acquisition risk." Proof succeeds with the caveat that subsidiary-to-parent risk propagation is assumed, not proven. This assumption is flagged in the output
5. **Monte Carlo Robustness**: 10,000 perturbation runs. Conclusion survives in 72% of scenarios. Removing the sanctions signal alone drops survival to 41%, identifying it as the load-bearing evidence

**QEVE output**:
- Confidence: 0.87
- Uncertainty: 0.12
- Robustness score: 72% of perturbations preserve the conclusion
- Contradictions: 1 weak (media reputation split)
- Critical dependency: sanctions link is load-bearing (removal drops robustness below 50%)
- Flagged assumption: subsidiary-to-parent risk propagation lacks formal justification

The output tells an analyst not just **what** the risk level is, but **why** it is that level, **what would break** the conclusion, and **how stable** the conclusion is under stress. No black-box score. Full auditability.

## Data Model

QEVE operates on three core data structures that flow through the pipeline.

### Evidence

Each piece of evidence entering the system is represented as a structured signal:

| Field | Type | Description |
|-------|------|-------------|
| `signal_type` | atom | Classification of the evidence (e.g., `:sanctions_hit`, `:ownership_change`, `:lawsuit`) |
| `weight` | float | Strength of the signal (0.0 to 1.0), subject to time decay |
| `source_id` | string | Unique identifier for the originating source |
| `independence_group` | string | Grouping for source independence validation (signals from the same group are not independent) |
| `timestamp` | datetime | When the evidence was collected (used for time decay calculation) |
| `provenance` | map | Full chain of custody from raw data to processed signal |
| `raw_data_hash` | string | Cryptographic hash of the original data for integrity verification |

### Hypothesis

Each claim or conclusion under evaluation:

| Field | Type | Description |
|-------|------|-------------|
| `statement` | string | The claim being evaluated in natural language |
| `premises` | list | Evidence signals supporting this hypothesis |
| `rule_id` | string | The inference rule used to derive this hypothesis from its premises |
| `risk_level` | atom | Assessed risk level (`:low`, `:medium`, `:high`, `:critical`) |
| `threshold` | float | Minimum confidence required for this hypothesis to be accepted |

### VerificationResult

The output of a complete QEVE pipeline run:

| Field | Type | Description |
|-------|------|-------------|
| `structural_pass` | boolean | Whether Stage 2 (structural check) passed |
| `logical_pass` | boolean | Whether Stage 3 (logical check) passed |
| `formal_pass` | boolean | Whether Stage 4 (Lean4 formal layer) passed |
| `monte_carlo_distribution` | list | Full distribution of outcomes across 10,000 simulation runs |
| `confidence` | float | Final confidence score (0.0 to 1.0) |
| `uncertainty` | float | Quantified uncertainty (0.0 to 1.0) |
| `robustness_score` | float | Percentage of perturbation scenarios preserving the conclusion |
| `contradictions` | list | All identified contradictions with severity classification |

## Confidence Scoring

The final confidence score is not a simple average. It is computed using a multiplicative formula that ensures any single weak dimension drags down the overall result:

```
final_confidence = belief_strength x robustness_score x (1 - contradiction_index)
```

Where:

- **belief_strength** is the weighted sum of supporting evidence after time decay, normalized to [0, 1]
- **robustness_score** is the Monte Carlo survival rate (percentage of perturbation scenarios preserving the conclusion)
- **contradiction_index** is a measure of unresolved contradictions in the belief graph, scaled from 0 (no contradictions) to 1 (fully contradicted)

The multiplicative structure is deliberate. A conclusion with strong evidence (0.95) but poor robustness (0.40) and moderate contradictions (0.15) yields a final confidence of 0.95 x 0.40 x 0.85 = 0.323, which correctly reflects a conclusion that should not be trusted despite strong surface-level evidence. Additive scoring would mask this fragility.

## Performance Characteristics

QEVE is designed to balance verification rigor with practical performance constraints. The engine's multi-stage architecture allows for early failure detection, preventing expensive operations on fundamentally flawed inputs.

**Timing profiles** vary significantly by pipeline stage. Graph construction (Stage 1) typically completes in 50-200ms for evidence sets under 1,000 signals. Structural checks (Stage 2) are O(V + E) operations on the belief graph and scale linearly with complexity. The Lean4 formal layer (Stage 4) exhibits the most variable performance, ranging from milliseconds for simple theorems to minutes for complex proofs requiring extensive search.

**Monte Carlo simulation** (Stage 5) is embarrassingly parallel and scales with available compute resources. Standard configurations run 10,000 simulations across 4-8 CPU cores, completing in 2-5 seconds for typical use cases. The parallelization means additional cores provide near-linear speedup until memory bandwidth becomes the limiting factor.

**Memory usage** grows with evidence set size and belief graph complexity. Typical runs consume 256MB-2GB of working memory, with the Lean4 formal layer accounting for the majority of allocation due to proof search state management.

**Caching optimizations** preserve intermediate results across pipeline runs. Structural checks are cached by belief graph hash, Lean4 proofs are cached by theorem signature, and Monte Carlo distributions are cached by evidence fingerprint. Cache hits can reduce total pipeline time by 60-90% for repeated evaluations with minor evidence changes.

## Integration Patterns

QEVE integrates with the broader platform through several well-defined patterns that ensure consistency and reliability across all applications.

**Synchronous validation** is used for real-time decisions where the cost of waiting outweighs the risk of proceeding without verification. The platform provides circuit breaker protection: if QEVE latency exceeds 30 seconds, the pipeline short-circuits to a simplified validation mode that skips Monte Carlo simulation but preserves structural and logical checks.

**Asynchronous batch processing** handles large-scale verification tasks where throughput matters more than individual latency. The `prismatic_qeve_batch` application queues verification requests and processes them using configurable worker pools. Results are persisted to the graph database and trigger notifications to downstream consumers.

**Confidence-based routing** uses QEVE confidence scores to determine processing paths. High-confidence conclusions (≥0.90) flow directly to automated decision systems. Medium-confidence conclusions (0.60-0.89) require human review. Low-confidence conclusions (≤0.59) trigger additional evidence collection before re-evaluation.

**Temporal monitoring** tracks QEVE performance over time to identify degradation patterns. The platform maintains rolling statistics on pipeline latency, success rates, and confidence score distributions. Significant deviations trigger alerts and automatic failover to backup verification methods.

## Key Differentiators

QEVE distinguishes itself from conventional AI validation approaches in several critical ways:

**Auditability over opacity**. Most AI systems produce a confidence score with no explanation of how it was derived. QEVE produces a full audit trail: which evidence supported the conclusion, which rules were applied, which formal proofs succeeded or failed, and which perturbation scenarios broke the conclusion.

**Robustness over point estimates**. A single confidence number is meaningless without understanding its stability. QEVE's Monte Carlo layer quantifies how sensitive the conclusion is to changes in the underlying evidence, identifying load-bearing signals and fragile assumptions.

**Formal necessity over statistical probability**. The Lean4 formal layer distinguishes between conclusions that are **necessary** (logically forced by the evidence) and those that are merely **probable** (statistically likely but not logically required). For high-stakes decisions, this distinction determines whether a conclusion can be relied upon.

**Contradiction preservation over resolution**. QEVE does not attempt to resolve contradictions. It preserves them, quantifies their impact, and reports them to the decision-maker. Premature contradiction resolution is one of the most common failure modes in automated reasoning systems.

**Composability with the epistemic pipeline**. QEVE is not a standalone tool. Its outputs feed directly into [Trinity Gate](@/glossary/trinity-gate.md) validation, and its inputs are governed by [NABLA Infinity](@/glossary/nabla-infinity.md) axioms. This integration ensures that verification is not an afterthought but a structural component of the platform's reasoning infrastructure.

## Related Terms

- [Lean4](@/glossary/lean4.md) -- Theorem prover powering QEVE's formal verification layer
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing QEVE's belief graph construction
- [Trinity Gate](@/glossary/trinity-gate.md) -- Verification gate consuming QEVE outputs for belief acceptance
- [White Team](@/glossary/white-team.md) -- Constructive verification team that uses QEVE methods extensively
- [Signal Plurality](@/glossary/signal-plurality.md) -- NABLA axiom enforced in QEVE's graph build stage
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- Decision thresholds applied to QEVE confidence scores
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- Axiom ensuring QEVE evidence chains are fully traceable
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Complementary testing approach used alongside QEVE
- [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) -- The 16-level pipeline in which QEVE operates
- [Color Teams](@/glossary/color-teams.md) -- Security teams whose outputs are validated through QEVE

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)