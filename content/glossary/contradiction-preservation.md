+++
title = "Contradiction Preservation"
weight = 205

[extra]
category = "epistemic"
description = "NABLA axiom requiring that contradictory signals be preserved rather than resolved, ensuring epistemic honesty and information integrity in the knowledge pipeline"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
technical_level = "expert"
domain_category = "Epistemic Framework"
tags = ["glossary", "epistemic", "nabla", "contradiction", "signal-preservation", "belief-graph", "paraconsistent-logic", "evidence-integrity"]
related_concepts = ["paraconsistent logic", "epistemic honesty", "signal preservation", "cognitive dissonance", "belief graph integrity", "evidence-based reasoning", "information theory"]
implementation_status = "production"
authority_level = "L2-axiom"
difficulty_rating = "advanced"
prerequisites = ["nabla-infinity", "belief-graph", "signal-plurality", "confidence-scoring"]
learning_path = ["epistemic-fundamentals", "nabla-axioms", "belief-graph-structure", "contradiction-handling", "paraconsistent-reasoning"]
interactive_demos = ["/security", "/architecture"]
code_examples = true
external_resources = ["https://plato.stanford.edu/entries/logic-paraconsistent/", "https://en.wikipedia.org/wiki/Paraconsistent_logic"]
version_introduced = "gen-5"
stability_level = "stable"
testing_scenarios = ["contradiction-detection-accuracy", "preservation-integrity-verification", "propagation-rule-validation", "burial-detection-test"]
keywords = ["contradiction preservation", "paraconsistent logic", "epistemic honesty", "signal preservation", "NABLA axiom", "belief graph", "evidence integrity", "contradiction index"]
related_terms = ["nabla-infinity", "signal-plurality", "belief-graph", "epistemic-robustness", "cherry-picking", "confidence-scoring", "qeve", "trinity-gate", "time-decay", "provenance-mandatory"]
word_count = 2555
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Contradiction Preservation - Prismatic Platform"
+++

## Definition

Contradiction Preservation is the second of seven [NABLA Infinity](@/glossary/nabla-infinity.md) axioms and one of the most counterintuitive principles in the Prismatic Platform's epistemic framework. It mandates that when contradictory evidence exists -- when Signal A supports a conclusion and Signal B opposes it -- both signals must be preserved explicitly in the [belief graph](@/glossary/belief-graph.md), with their contradiction annotated, classified, and propagated to all downstream consumers. Neither signal may be discarded, downweighted, averaged, or rationalized away. The contradiction must persist until one side is definitively disproven through new evidence, not through algorithmic resolution.

The axiom is HARD enforced at level E2, meaning violations trigger immediate BLOCK: the operation is halted and the offending action is rejected. There is no configuration option, authority level, or emergency override that permits contradiction suppression. The enforcement is non-bypassable by design, reflecting the platform's assessment that contradiction suppression is among the most dangerous epistemic failure modes -- more dangerous than missing evidence, stale data, or even single-source beliefs, because it actively destroys information that was already captured.

Contradiction Burial -- the specific anti-pattern of acknowledging a contradiction exists but structurally hiding it from downstream consumers -- receives the most severe enforcement in the entire NABLA framework: E3 HALT, requiring mandatory review at supreme authority level. This reflects the asymmetric danger of hidden contradictions: a visible contradiction is merely confusing; a hidden contradiction is deceiving.

## Why Contradictions Are Valuable

### The Information Content of Disagreement

Contradictions are not noise. They are signal. When two credible sources disagree, the disagreement itself carries information that neither source alone provides. There are precisely three possible explanations for a genuine contradiction between credible sources, and all three are valuable:

1. **The situation is genuinely ambiguous**: The reality being assessed is complex enough that different valid methodologies or perspectives produce different conclusions. This is common in due diligence (financial health depends on which accounting framework you apply) and security assessment (risk depends on which threat model you assume). The contradiction reveals genuine complexity that a single assessment would mask.

2. **One source has information the other lacks**: The contradiction identifies an information asymmetry. Source A may have access to data that Source B lacks, or vice versa. The contradiction does not tell you which source is right, but it tells you that investigating the discrepancy will reveal something important.

3. **The framing of the question is flawed**: The contradiction may indicate that the question being asked admits no clean answer because it conflates distinct concepts. "Is Firm X financially healthy?" might produce contradictory answers because "financial health" means different things in different contexts (cash flow vs. asset base vs. growth trajectory). The contradiction surfaces the need for a more precise question.

In all three cases, resolving the contradiction prematurely -- by picking a winner, computing an average, or discarding the weaker signal -- destroys the valuable information the contradiction provides. Preservation retains the information. Resolution destroys it.

### The Asymmetric Cost of Error

The economic argument for contradiction preservation rests on asymmetric cost analysis:

| Action | Cost if Contradiction is Genuine | Cost if Contradiction is Noise |
|--------|--------------------------------|-------------------------------|
| **Preserve** | Information retained, further investigation possible | One extra node in belief graph (~100 bytes) |
| **Resolve** | Critical information destroyed, false certainty produced | Minimal space saved |

The cost of preserving a spurious contradiction is trivially small (one additional node in the [belief graph](@/glossary/belief-graph.md) with negligible storage and computation cost). The cost of discarding a genuine contradiction can be catastrophic (a due diligence conclusion treated as verified when it rests on suppressed evidence). The asymmetry is extreme, making preservation the rational default regardless of the contradiction's expected genuineness.

## The Psychology of Contradiction Resolution

Contradiction Preservation exists as a hard-enforced axiom because the human impulse to resolve contradictions is nearly irresistible. Understanding these psychological drivers is essential for understanding why automated enforcement is necessary.

### Cognitive Dissonance

Leon Festinger's theory of cognitive dissonance (1957) establishes that holding contradictory beliefs produces psychological discomfort that motivates resolution. Humans are biologically disposed to resolve contradictions, and they do so through several biased mechanisms:

- **Selective attention**: Focusing on evidence that supports the preferred conclusion
- **Motivated reasoning**: Generating justifications for discounting the contradictory signal
- **Source derogation**: Questioning the credibility of the contradictory source while accepting the confirming source uncritically
- **Premature closure**: Declaring the contradiction "resolved" before genuinely new evidence is obtained

Each of these mechanisms produces a belief graph that appears cleaner and more confident than warranted -- the hallmark of [cherry picking](@/glossary/cherry-picking.md).

### Organizational Pressure

Beyond individual psychology, organizations exert structural pressure toward contradiction resolution:

- **Decision urgency**: "We need a clear answer by Friday" penalizes uncertainty and rewards false certainty
- **Authority bias**: If a senior stakeholder favors one interpretation, the contradictory evidence faces asymmetric scrutiny
- **Presentation pressure**: Reports with contradictions look "indecisive" compared to clean narratives
- **Accountability avoidance**: Preserving a contradiction means explicitly acknowledging uncertainty, which creates accountability exposure

The Prismatic Platform's automated enforcement removes these pressures from the epistemic pipeline. The system does not experience cognitive dissonance, does not feel organizational pressure, and does not benefit from presenting false certainty. It preserves contradictions because the axiom requires it, regardless of downstream preferences.

## Implementation in the Belief Graph

### Contradiction Nodes

Contradictions are represented as first-class entities in the [belief graph](@/glossary/belief-graph.md), not as edge annotations or metadata. A contradiction node explicitly connects the two contradicting nodes and carries structured metadata:

| Field | Type | Description |
|-------|------|-------------|
| `contradicting_nodes` | tuple | The pair of nodes in contradiction |
| `severity` | atom | `:weak` (statistical noise possible), `:moderate` (genuine disagreement), `:strong` (direct logical opposition) |
| `type` | atom | `:direct` (A says P, B says not-P), `:inferential` (A implies Q, B implies not-Q), `:temporal` (A was true then, B is true now) |
| `detected_at` | DateTime | When the contradiction was identified |
| `resolution_status` | atom | Always `:preserved` until definitively resolved by new evidence |
| `impact_scope` | list | Downstream hypothesis nodes affected by this contradiction |

### Contradiction Index

The contradiction index is a numeric measure [0.0, 1.0] reflecting the proportion of unresolved contradictions affecting a hypothesis. It feeds into the [confidence scoring](@/glossary/confidence-scoring.md) formula:

```
final_confidence = belief_strength * robustness_score * (1 - contradiction_index)
```

The multiplicative structure is critical. A contradiction index of 0.30 reduces final confidence by 30% regardless of how strong the supporting evidence is. This prevents the accumulation of supporting evidence from "overwhelming" contradictory evidence. No amount of confirming signals can compensate for a genuine unresolved contradiction -- only new evidence that definitively resolves the contradiction can reduce the index.

The contradiction index is computed as:

```
contradiction_index = sum(severity_weight(c) for c in contradictions) / total_signal_count
```

Where severity weights are: weak = 0.25, moderate = 0.50, strong = 1.00.

### Propagation Rules

Contradictions propagate through the belief graph according to strict rules:

1. **Upward propagation**: A contradiction at an evidence level propagates to all hypothesis nodes that depend on the contradicted evidence
2. **Scope limitation**: Contradictions do not propagate to hypotheses that do not depend on the contradicted evidence (no "guilt by association")
3. **Severity escalation**: If multiple contradictions affect the same hypothesis from independent evidence chains, the effective severity escalates
4. **Visibility guarantee**: Every downstream consumer of a hypothesis is guaranteed to see all contradictions affecting that hypothesis (no structural hiding possible)

## Technical Details

The Prismatic Platform implements contradiction preservation through dedicated Elixir modules that enforce the axiom at the data structure level:

```elixir
defmodule PrismaticEpistemic.ContradictionManager do
  @moduledoc """
  Manages contradiction detection, classification, and preservation
  within the belief graph. Enforces the NABLA Infinity Contradiction
  Preservation axiom with E2 BLOCK enforcement.
  """

  @type severity :: :weak | :moderate | :strong
  @type contradiction_type :: :direct | :inferential | :temporal

  @type contradiction :: %{
    id: String.t(),
    contradicting_nodes: {String.t(), String.t()},
    severity: severity(),
    type: contradiction_type(),
    detected_at: DateTime.t(),
    resolution_status: :preserved | :resolved,
    impact_scope: [String.t()],
    provenance: map()
  }

  @spec detect_and_preserve(map(), map(), map()) ::
          {:ok, contradiction()} | {:error, term()}
  def detect_and_preserve(signal_a, signal_b, context) do
    with {:ok, contradiction_type} <- classify_type(signal_a, signal_b),
         {:ok, severity} <- assess_severity(signal_a, signal_b, contradiction_type),
         {:ok, impact} <- compute_impact_scope(signal_a, signal_b, context) do
      contradiction = %{
        id: generate_contradiction_id(),
        contradicting_nodes: {signal_a.id, signal_b.id},
        severity: severity,
        type: contradiction_type,
        detected_at: DateTime.utc_now(),
        resolution_status: :preserved,
        impact_scope: impact,
        provenance: build_provenance(signal_a, signal_b)
      }

      {:ok, contradiction}
    end
  end

  @spec attempt_resolution(contradiction(), map()) ::
          {:ok, :resolved, map()} | {:error, :insufficient_evidence}
  def attempt_resolution(contradiction, new_evidence) do
    if definitively_resolves?(contradiction, new_evidence) do
      {:ok, :resolved, %{
        contradiction_id: contradiction.id,
        resolving_evidence: new_evidence.id,
        resolved_at: DateTime.utc_now(),
        resolution_provenance: new_evidence.provenance
      }}
    else
      {:error, :insufficient_evidence}
    end
  end

  defp definitively_resolves?(contradiction, evidence) do
    evidence.confidence >= 0.95 and
      evidence.signal_count >= 2 and
      directly_addresses?(contradiction, evidence)
  end
end
```

The key design decision is that `attempt_resolution/2` requires genuinely new evidence with high confidence and signal plurality. Analyst judgment, authority override, or majority vote cannot resolve a contradiction -- only evidence can.

## Contradiction Severity Classification

### Weak Contradictions

Weak contradictions indicate disagreement that could plausibly be statistical noise, methodological difference, or measurement imprecision. Example: one financial database shows Firm X revenue at $4.2M, another shows $4.1M. The 2.4% discrepancy may reflect different reporting dates, currency conversion timing, or rounding conventions rather than genuine disagreement about the firm's financial state.

Weak contradictions carry a severity weight of 0.25 in the contradiction index. They are preserved (the axiom applies regardless of severity) but have minimal impact on final confidence. They serve as diagnostic indicators: a hypothesis with many weak contradictions may indicate measurement noise rather than genuine epistemic conflict.

### Moderate Contradictions

Moderate contradictions indicate genuine disagreement between credible sources that cannot be attributed to noise. Example: one analyst report rates Firm X as "investment grade" while another rates it as "speculative." The disagreement reflects genuinely different assessments based on different methodologies or data access.

Moderate contradictions carry a severity weight of 0.50 in the contradiction index. They meaningfully reduce confidence and trigger investigation flags. The platform recommends that analysts examine the methodological differences between the contradicting sources to identify the root cause.

### Strong Contradictions

Strong contradictions indicate direct logical opposition. Example: Source A states "Firm X has no pending litigation" while Source B identifies "Firm X is defendant in Case No. 12345." These cannot both be true. At least one source is wrong, outdated, or referring to a different entity (an [entity resolution](@/glossary/entity-resolution.md) problem).

Strong contradictions carry a full severity weight of 1.00 in the contradiction index. They dramatically reduce confidence and typically require resolution before the conclusion can be acted upon. Resolution requires new evidence that definitively disproves one side -- not analyst judgment, not authority, not majority rule.

## Relationship to Other NABLA Axioms

Contradiction Preservation interacts with every other [NABLA Infinity](@/glossary/nabla-infinity.md) axiom:

| Axiom | Interaction with Contradiction Preservation |
|-------|---------------------------------------------|
| [Signal Plurality](@/glossary/signal-plurality.md) | Plurality increases the chance of detecting contradictions (more signals = more opportunities for disagreement) |
| Absence Informative | The absence of an expected contradiction can itself be informative (suspiciously clean evidence) |
| [Time Decay](@/glossary/time-decay.md) | Contradictions have temporal dynamics -- a contradiction between fresh and stale evidence may resolve through decay |
| Unknown Valid | When both sides of a contradiction are plausible, the correct state is "unknown" rather than forced resolution |
| Source Independence | Independent sources producing contradictions are more significant than correlated sources doing so |
| [Provenance Mandatory](@/glossary/provenance-mandatory.md) | Contradiction provenance (which sources, when detected) must be fully traceable |

## Connection to Paraconsistent Logic

Classical logic suffers from the "explosion principle" (ex contradictione quodlibet): from a contradiction (P AND not-P), any proposition can be derived. In classical logic, a single contradiction makes the entire reasoning system useless because it licenses the derivation of any conclusion, true or false.

Paraconsistent logic is a family of logical systems that abandon the explosion principle, allowing contradictions to exist without infecting the entire reasoning chain. The Prismatic Platform's approach to contradiction preservation is paraconsistent in spirit: contradictions are preserved but quarantined. They affect the confidence of hypotheses that depend on the contradicted evidence but do not propagate to unrelated hypotheses.

The contradiction index mechanism implements a quantitative form of paraconsistency: rather than a binary "consistent/inconsistent" classification, the platform computes a continuous measure of how contradicted a hypothesis is, allowing nuanced decision-making in the presence of partial contradiction.

## Anti-Patterns and Enforcement

### Contradiction Burial (E3 HALT)

Contradiction Burial is the most dangerous anti-pattern in the NABLA framework. It occurs when a contradiction is acknowledged internally but structurally hidden from downstream consumers. Unlike outright contradiction deletion (which would be caught by integrity checks), Contradiction Burial preserves the contradicting signals but removes the contradiction annotation or routes it to a dead-end path that downstream processors never traverse.

Contradiction Burial is detected through graph integrity checks that verify: for every pair of nodes with opposing signal types affecting the same hypothesis, a contradiction node must exist and must be reachable from the hypothesis. Missing contradiction nodes trigger E3 HALT -- the most severe enforcement level short of E4 (full audit).

### Contradiction Averaging

A subtler anti-pattern is "contradiction averaging": replacing two contradicting signals (weight 0.80 supporting, weight 0.70 opposing) with a single averaged signal (weight 0.05 net supporting). This preserves a nominal signal but destroys the information that two strong signals disagreed. The platform detects averaging by monitoring signal creation patterns: new signals whose weights correspond to the arithmetic mean of recently removed opposing signals trigger E2 BLOCK.

### Premature Resolution

Declaring a contradiction "resolved" without genuinely new evidence is another forbidden pattern. Resolution status can only transition from `:preserved` to `:resolved` when new evidence is ingested that definitively disproves one side. Analyst judgment alone is insufficient -- the platform requires an evidence-backed resolution with full [provenance](@/glossary/provenance-mandatory.md).

## Real-World Application

### Due Diligence Example

In a typical M&A due diligence assessment, contradiction preservation produces richer, more actionable analysis:

**Scenario**: Assessing Firm Y's compliance posture.

**Contradicting signals**:
- Signal A (regulatory database, weight 0.85): Firm Y has valid ISO 27001 certification
- Signal B (investigative report, weight 0.75): Firm Y's data center failed physical security audit 3 months ago

**Without contradiction preservation**: The system might average these into a moderate compliance score of ~0.55, masking the specific nature of the disagreement.

**With contradiction preservation**: The system preserves both signals, creates a moderate contradiction node, and reports: "Firm Y holds ISO 27001 certification but recently failed a physical security audit. These signals are in moderate contradiction (formal certification vs. operational audit). The contradiction reduces confidence in the compliance assessment by approximately 25%. Recommended action: investigate whether the certification predates the failed audit and whether corrective actions have been implemented."

The preserved contradiction tells the analyst exactly what to investigate. The averaged score tells the analyst nothing.

## Best Practices

1. **Classify contradictions immediately upon detection.** When a contradiction is identified, assign it a severity level (weak, moderate, strong) and type (direct, inferential, temporal) before propagation. Unclassified contradictions are harder to reason about and more likely to be dismissed.

2. **Annotate contradictions with investigation guidance.** Every contradiction node should include a brief annotation explaining what kind of investigation might resolve it. This transforms contradictions from confusing anomalies into actionable investigation directives.

3. **Monitor the contradiction index trend, not just its value.** A rising contradiction index indicates increasing epistemic uncertainty across the system. This trend may reveal systematic issues (a source becoming unreliable, a methodology becoming outdated) that individual contradictions cannot reveal.

4. **Distinguish temporal contradictions from logical ones.** A signal that was true last month but false today is not the same as two simultaneous signals that disagree. Temporal contradictions often resolve through [time decay](@/glossary/time-decay.md); logical contradictions require new evidence. Treating them identically leads to either premature resolution or unnecessary preservation.

5. **Use contradiction density as a quality signal.** A region of the [belief graph](@/glossary/belief-graph.md) with unusually high contradiction density may indicate that the underlying domain model is flawed, the sources are unreliable, or the framing of the question needs revision. Contradiction density is diagnostic, not merely problematic.

6. **Never optimize for contradiction reduction.** Reducing the number of contradictions is not a goal. Contradictions should resolve naturally through new evidence, not through algorithmic pressure to minimize them. Systems that optimize for fewer contradictions are systems that suppress inconvenient truths.

7. **Preserve the resolution provenance.** When a contradiction is eventually resolved through new evidence, preserve the full resolution record: what evidence resolved it, when, and which side was disproven. This history is valuable for calibrating source reliability and methodology effectiveness.

8. **Test contradiction propagation rules explicitly.** Write property-based tests that verify contradictions propagate correctly through the belief graph -- reaching all dependent hypotheses, not reaching independent ones, and escalating severity when multiple contradictions converge.

## Related Terms

- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Parent epistemic framework defining this axiom
- [Belief Graph](@/glossary/belief-graph.md) -- Data structure where contradictions are represented as first-class nodes
- [Cherry Picking](@/glossary/cherry-picking.md) -- Anti-pattern that contradiction preservation directly prevents
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Formula incorporating contradiction index as multiplicative penalty
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) -- Robustness measure that contradiction preservation supports
- [Signal Plurality](@/glossary/signal-plurality.md) -- Complementary axiom increasing contradiction detection opportunity
- [Time Decay](@/glossary/time-decay.md) -- Temporal dimension interacting with contradiction dynamics
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- Axiom requiring full traceability of contradiction provenance
- [QEVE](@/glossary/qeve.md) -- Verification engine enforcing contradiction preservation in Stage 1
- [Trinity Gate](@/glossary/trinity-gate.md) -- Verification gate checking contradiction representation integrity
- [Entity Resolution](@/glossary/entity-resolution.md) -- Process that can create or resolve contradictions through node merging
- [Formal Verification](@/glossary/formal-verification.md) -- Verification of Contradiction Visibility theorem
- [Audit Trail](@/glossary/audit-trail.md) -- Record of all contradiction events and resolutions

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Blue Team](@/glossary/blue-team.md) -- Defensive team that preserves contradictions in evidence synthesis
- [OTP](@/glossary/otp.md) -- Process model underlying contradiction detection agents

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
