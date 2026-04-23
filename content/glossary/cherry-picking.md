+++
title = "Cherry Picking"
weight = 206

[extra]
category = "epistemic"
description = "Epistemic anti-pattern of selectively presenting evidence that supports a predetermined conclusion while suppressing or downweighting contradictory signals."
related_terms = ["nabla-infinity", "contradiction-preservation", "signal-plurality", "belief-graph", "confidence-scoring", "epistemic-robustness", "qeve", "trinity-gate", "provenance-mandatory", "audit-trail", "red-team", "blue-team", "time-decay"]
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
word_count = 2830
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Cherry", "Picking", "Epistemic", "glossary", "Prismatic Platform", "Signal", "Cherry Picking"]
tags = ["glossary", "epistemic", "cherry-picking", "prismatic"]
quality_score = 97
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Cherry Picking - Prismatic Platform"
+++

## Definition

Cherry picking is the epistemic anti-pattern of selecting evidence that supports a desired conclusion while suppressing, ignoring, or systematically downweighting evidence that contradicts it. In the context of the Prismatic Platform, cherry picking is classified as one of the five forbidden anti-patterns under the [NABLA Infinity](@/glossary/nabla-infinity.md) framework and is enforced at level E2 (BLOCK) -- meaning any detected instance immediately halts the operation and rejects the offending output. The term encompasses not only deliberate selection but also structural, algorithmic, and cognitive mechanisms that produce the same selective effect, regardless of intent.

Cherry picking is particularly dangerous because it produces conclusions that appear well-supported. Unlike a conclusion based on insufficient evidence (which is visibly weak), a cherry-picked conclusion is backed by real evidence, drawn from real sources, with real provenance. The evidence is genuine -- it is the selection that is fraudulent. This makes cherry picking the most deceptive of all epistemic failures: it passes superficial inspection, withstands casual challenge, and produces high surface confidence scores that mask the fragility of the underlying evidential base.

The platform's formal definition distinguishes cherry picking from related but distinct phenomena. Cherry picking is not the same as evidence weighting (which adjusts signal strength based on source credibility and freshness) or evidence filtering (which excludes signals that fail quality thresholds). Legitimate weighting and filtering apply symmetric criteria: the same rules that might downweight a contradictory signal would also downweight a supporting signal of equivalent quality. Cherry picking applies asymmetric criteria: contradictory signals face higher scrutiny, stricter quality thresholds, or outright exclusion while supporting signals pass through with minimal validation.

## Taxonomy of Cherry Picking

### Direct Selection

Direct selection is the most straightforward form of cherry picking: explicitly choosing which evidence to include in an analysis based on whether it supports the desired conclusion. In human-driven analysis, direct selection manifests as an analyst reviewing ten intelligence reports and including only the six that support the predetermined assessment while omitting the four that contradict it.

In automated systems, direct selection is rare because it requires explicit logic that can be audited. However, it can emerge through poorly designed filtering rules. A filter that excludes "low confidence" signals with a threshold of 0.60 may appear neutral, but if contradictory signals tend to come from sources with lower confidence ratings (because they represent minority assessments or emerging intelligence), the filter acts as a selective mechanism even though it applies a formally symmetric criterion.

The platform detects direct selection through coverage analysis: comparing the set of available signals against the set of signals actually used in a hypothesis. If the used set is significantly biased toward supporting signals relative to the available set, a direct selection alert is triggered.

### Asymmetric Scrutiny

Asymmetric scrutiny applies different quality standards to supporting and contradicting evidence. Supporting evidence is accepted at face value; contradicting evidence is subjected to additional validation, source verification, or methodological criticism. The effect is equivalent to direct selection but is more subtle because each individual quality check appears reasonable in isolation.

Consider a due diligence assessment where a sanctions database hit (contradicting the "low risk" hypothesis) triggers a manual verification process requiring three independent confirmations, while a clean compliance certificate (supporting "low risk") is accepted from a single source. Each policy appears reasonable independently, but the asymmetry systematically favors the predetermined conclusion.

The platform detects asymmetric scrutiny by tracking the validation pipeline applied to each signal and comparing the average validation burden for supporting signals against contradicting signals. Statistically significant asymmetry triggers an E2 alert. The threshold for "statistically significant" is calibrated using the [Signal Plurality](@/glossary/signal-plurality.md) enforcement framework to avoid false positives from natural variation in source quality.

### Temporal Cherry Picking

Temporal cherry picking exploits the [time decay](@/glossary/time-decay.md) mechanism to selectively favor certain evidence based on its age. If recent evidence supports the desired conclusion while older evidence contradicts it, an analyst might argue that the older evidence is "stale" and should be discounted -- while simultaneously relying on other old evidence that supports the conclusion without applying the same freshness standard.

The platform detects temporal cherry picking through decay symmetry analysis: if the effective decay rate applied to contradicting signals is significantly higher than the rate applied to supporting signals (controlling for actual age differences), temporal cherry picking is flagged.

A particularly insidious variant is "snapshot cherry picking": selecting a specific point in time at which the available evidence most strongly supports the desired conclusion, rather than using the current state. This is detectable through the [audit trail](@/glossary/audit-trail.md), which records the evidence state at every analysis timestamp and can identify whether the selected snapshot is suspiciously favorable.

### Framing Cherry Picking

Framing cherry picking does not suppress evidence but rather reframes it to minimize its contradictory impact. A negative signal ("Firm X failed a security audit") is reframed as a weak positive ("Firm X is actively improving its security posture by subjecting itself to audits"). The underlying data is preserved, but its epistemic impact is neutralized through interpretive reframing.

This form is the most difficult to detect algorithmically because it operates at the semantic level rather than the structural level. The platform addresses framing cherry picking through two mechanisms:

1. **Signal type invariance**: The signal type (supporting vs. contradicting) is assigned at ingestion based on objective criteria and cannot be changed by downstream processing. Reframing the narrative does not change the signal's structural role in the [belief graph](@/glossary/belief-graph.md).

2. **[Red Team](@/glossary/red-team.md) adversarial review**: The Red Team's `red-epistemic-attacker` agent specifically tests for framing manipulation by generating alternative framings of key evidence and evaluating whether the conclusion changes under different framings.

### Aggregation Cherry Picking

Aggregation cherry picking manipulates the level of granularity at which evidence is analyzed. Disaggregating evidence that supports the conclusion (counting each supporting data point individually) while aggregating contradicting evidence (treating multiple contradictions as a single "concern") inflates the apparent signal plurality of supporting evidence relative to contradicting evidence.

The platform detects aggregation cherry picking through granularity analysis: comparing the average granularity level of supporting signals against contradicting signals. If supporting evidence is systematically more granular (more nodes with lower individual weight) than contradicting evidence (fewer nodes with higher individual weight), an aggregation asymmetry alert is triggered.

## The Psychology of Cherry Picking

### Confirmation Bias

Cherry picking is the operational expression of confirmation bias -- the well-documented cognitive tendency to seek, favor, and recall information that confirms existing beliefs while giving disproportionately less attention to information that contradicts them. Peter Wason's original selection task experiments (1960) demonstrated that humans systematically seek confirming evidence and neglect disconfirming evidence, even when disconfirming evidence would be more diagnostically valuable.

The strength of confirmation bias increases with:

- **Emotional investment**: Analysts who have publicly committed to a conclusion face greater cognitive pressure to defend it
- **Sunk cost**: Teams that have invested significant effort in an analysis are reluctant to acknowledge contradictory evidence that might invalidate their work
- **Authority alignment**: When organizational leadership favors a particular outcome, confirmation bias aligns with career incentives
- **Time pressure**: Under deadline pressure, the path of least resistance is to accept confirming evidence and defer examination of contradictions to "later review" that never occurs

The Prismatic Platform's automated enforcement removes the human from the selection loop. Signals are ingested, classified, and preserved by the system according to symmetric rules that do not distinguish between supporting and contradicting evidence. The analyst can interpret the evidence but cannot selectively exclude it.

### Motivated Reasoning

Motivated reasoning extends confirmation bias from unconscious bias to goal-directed cognition. Where confirmation bias is a passive tendency to notice confirming evidence, motivated reasoning is an active process of constructing justifications for the desired conclusion. The reasoner does not simply overlook contradicting evidence -- they actively construct arguments for why it should be discounted.

In due diligence contexts, motivated reasoning manifests as "deal fever": the acquiring company's team has strong incentives (financial, reputational, career) to conclude that the target is a good acquisition. Every piece of contradicting evidence is met with a rationalization: "That regulatory issue is from two years ago," "The negative press is from a competitor," "The compliance gap is immaterial to the acquisition thesis."

Each rationalization may be individually plausible. The problem is asymmetry: supporting evidence is not subjected to the same rationalization scrutiny. The platform's [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom directly counters motivated reasoning by preventing the system from accepting rationalizations as resolution. A contradiction can only be resolved by new evidence that definitively disproves one side, not by analyst judgment, not by rationalization, and not by organizational pressure.

### Survivorship Bias

Survivorship bias is a specific form of cherry picking that occurs when analysis is restricted to entities that have survived a selection process while ignoring entities that did not. Analyzing only successful companies to identify success factors (while ignoring failed companies with identical factors) produces conclusions that are systematically biased toward the survivor population.

In the platform's OSINT context, survivorship bias manifests when evidence sources preferentially cover active entities. A sanctions database lists currently sanctioned entities but may not retain historical entries for entities whose sanctions were lifted. An analyst querying only active sanctions data would underestimate the risk of entities with a history of sanctions -- the historical evidence has "survived" out of the dataset.

The platform mitigates survivorship bias through the "Absence Informative" NABLA axiom: the absence of expected data is tracked as an explicit signal rather than treated as absence of risk.

## Detection and Enforcement

### Structural Detection

The platform implements multiple structural detectors for cherry picking, operating on the [belief graph](@/glossary/belief-graph.md) topology:

**Coverage Ratio Analysis**: For each hypothesis node, the detector computes the ratio of available supporting signals actually used to available contradicting signals actually used. A significant asymmetry (supporting coverage > contradicting coverage by more than 2 standard deviations) triggers an alert.

**Validation Burden Analysis**: The detector tracks the average number of validation steps applied to supporting vs. contradicting signals. Asymmetric validation burden is flagged.

**Temporal Distribution Analysis**: The detector compares the age distribution of supporting vs. contradicting signals. If supporting signals are systematically fresher (not because they are actually newer, but because older supporting signals were retained while older contradicting signals were discarded), temporal cherry picking is flagged.

**Granularity Analysis**: The detector compares the average granularity (node count per claim) of supporting vs. contradicting evidence. Asymmetric granularity is flagged.

### E2 BLOCK Enforcement

When cherry picking is detected, the platform enforces E2 BLOCK:

1. The operation producing the cherry-picked output is immediately halted
2. The output is rejected and cannot propagate to downstream consumers
3. A detailed detection report is generated identifying the specific asymmetry
4. The [audit trail](@/glossary/audit-trail.md) records the detection event with full provenance
5. The analyst or system component responsible is notified with specific corrective guidance
6. A resubmission is required with the asymmetry corrected

E2 enforcement is non-negotiable. There is no override mechanism, no emergency bypass, and no authority level that can waive the requirement. This reflects the platform's assessment that cherry picking is a class of epistemic failure that cannot be safely tolerated in any context.

### Robustness as Cherry Picking Detector

The [epistemic robustness](@/glossary/epistemic-robustness.md) score serves as an indirect but powerful cherry picking detector. Cherry-picked conclusions have a characteristic robustness signature: high surface confidence (because the selected evidence is genuinely strong) but low perturbation survival (because removing the cherry-picked evidence or including the suppressed evidence collapses the conclusion).

Specifically, a conclusion with confidence > 0.85 but robustness < 0.50 is flagged for cherry picking investigation. The combination of strong evidence and weak robustness is the statistical fingerprint of selective evidence: the evidence that was included is strong, but the conclusion is fragile because it depends on the specific selection.

The [Monte Carlo verification](@/glossary/monte-carlo-verification.md) stage naturally tests for cherry picking through its perturbation scenarios. If signal removal scenarios consistently collapse the conclusion, the conclusion depends on specific signals rather than broad evidential support -- the hallmark of cherry picking.

## Relationship to NABLA Axioms

Cherry picking violates or circumvents multiple [NABLA Infinity](@/glossary/nabla-infinity.md) axioms simultaneously:

| Axiom | How Cherry Picking Violates It |
|-------|-------------------------------|
| [Signal Plurality](@/glossary/signal-plurality.md) | Selectively excluding signals reduces effective plurality below the minimum |
| [Contradiction Preservation](@/glossary/contradiction-preservation.md) | Suppressing contradictory signals eliminates contradictions rather than preserving them |
| Absence Informative | Cherry picking treats absent contradictions as confirmation rather than as missing data |
| [Time Decay](@/glossary/time-decay.md) | Temporal cherry picking applies decay asymmetrically |
| Source Independence | Aggregation cherry picking conflates independent sources to reduce apparent contradictions |
| [Provenance Mandatory](@/glossary/provenance-mandatory.md) | Cherry picking obscures the provenance of the selection decision itself |

The multi-axiom violation is why cherry picking receives E2 enforcement rather than the softer E1 warning. A single axiom violation might be an error; a multi-axiom violation pattern is a systemic failure.

## Cherry Picking in Adversarial Contexts

The [Red Team](@/glossary/red-team.md) considers cherry picking one of its primary attack primitives. The `red-epistemic-attacker` agent systematically tests whether platform conclusions can be manipulated through selective evidence injection. If injecting a set of strong supporting signals causes the platform to effectively ignore existing contradicting signals (through implicit downweighting or attention dilution), a vulnerability to cherry picking is identified.

The [Blue Team](@/glossary/blue-team.md)'s `blue-signal-aggregator` is specifically designed to resist cherry picking by enforcing symmetric aggregation rules. Signals are aggregated by type and provenance rather than by alignment with any hypothesis. The aggregator has no knowledge of which signals support or contradict which hypotheses during the aggregation phase, preventing selection bias from entering the aggregation process.

## Real-World Application: Regulatory Compliance Assessment

Consider a compliance assessment where cherry picking would distort the conclusion:

**Available evidence**:
- Signal A: Valid ISO 27001 certification (supports compliance)
- Signal B: Clean SOC 2 Type II report (supports compliance)
- Signal C: Passed last regulatory inspection (supports compliance)
- Signal D: Data breach disclosed 6 months ago (contradicts compliance)
- Signal E: Employee whistleblower complaint filed (contradicts compliance)
- Signal F: Delayed GDPR response documented (contradicts compliance)

**Cherry-picked conclusion**: "Firm holds ISO 27001, SOC 2, and passed regulatory inspection. Compliance assessment: HIGH." (Confidence: 0.88, Robustness: 0.31)

**Honest conclusion**: "Firm holds valid certifications but has recent operational failures including a data breach, whistleblower complaint, and delayed regulatory response. Certifications and operational reality are in moderate contradiction. Compliance assessment: MODERATE with high uncertainty." (Confidence: 0.54, Robustness: 0.78)

The cherry-picked conclusion has higher confidence but dramatically lower robustness. The honest conclusion has lower confidence but accurately reflects the evidential landscape. The platform's multiplicative [confidence scoring](@/glossary/confidence-scoring.md) formula produces final scores of 0.88 * 0.31 = 0.27 for the cherry-picked version and 0.54 * 0.78 = 0.42 for the honest version -- correctly ranking the honest assessment as more trustworthy despite its lower surface confidence.

## Historical Context

The term "cherry picking" originates from the literal practice of selecting only the ripest, most appealing cherries from a tree while leaving others. Its application to argumentation and evidence selection has been documented in rhetoric since at least the 18th century, though the systematic study of the phenomenon as a cognitive bias belongs to 20th-century psychology.

In the philosophy of science, Karl Popper's falsificationism (1959) can be read as a direct response to cherry picking in scientific practice. Popper argued that the scientific value of a theory lies not in how much confirming evidence it can accumulate but in how rigorously it has been tested against disconfirming evidence. A theory that has survived serious attempts at falsification is more trustworthy than one that has merely accumulated confirmations -- because confirmations can always be cherry-picked while successful falsification resistance cannot be faked.

The Prismatic Platform's epistemic framework embodies this Popperian principle: the [QEVE](@/glossary/qeve.md) pipeline does not merely count supporting evidence but actively tests conclusions through perturbation, contradiction analysis, and formal verification. A conclusion that survives this testing is trustworthy precisely because the testing was designed to find weaknesses, not to confirm strengths.

## Formal Properties

Cherry picking can be formally characterized through information-theoretic concepts. Define the full evidence set E = {e_1, e_2, ..., e_n} and the selected evidence set S, where S is a subset of E. Cherry picking occurs when the mutual information between the selection function and the hypothesis under evaluation is non-zero:

```
I(S; H) > 0  implies cherry picking
```

In other words, if knowing which hypothesis is being evaluated provides any information about which evidence will be selected, the selection is biased. A fair selection function selects evidence independently of the hypothesis it will be used to evaluate.

The platform approximates this formal condition through the structural detectors described above, which measure various proxies for the conditional dependence between selection and hypothesis alignment.

## Related Terms

- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework classifying cherry picking as a forbidden anti-pattern
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- Axiom directly preventing the suppression that cherry picking requires
- [Signal Plurality](@/glossary/signal-plurality.md) -- Axiom ensuring sufficient evidence breadth to detect cherry picking
- [Belief Graph](@/glossary/belief-graph.md) -- Data structure on which cherry picking detection operates
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Multiplicative formula that penalizes cherry-picked conclusions through low robustness
- [Epistemic Robustness](@/glossary/epistemic-robustness.md) -- Robustness score as indirect cherry picking detector
- [QEVE](@/glossary/qeve.md) -- Verification engine whose perturbation testing reveals cherry picking
- [Trinity Gate](@/glossary/trinity-gate.md) -- Verification gate blocking cherry-picked conclusions from acceptance
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- Axiom enabling audit of evidence selection decisions
- [Audit Trail](@/glossary/audit-trail.md) -- Immutable record enabling retrospective cherry picking detection
- [Red Team](@/glossary/red-team.md) -- Adversarial team testing platform resistance to cherry picking attacks
- [Blue Team](@/glossary/blue-team.md) -- Defensive team implementing symmetric aggregation against cherry picking
- [Time Decay](@/glossary/time-decay.md) -- Temporal mechanism susceptible to asymmetric application (temporal cherry picking)
- [Monte Carlo Verification](@/glossary/monte-carlo-verification.md) -- Perturbation testing revealing cherry picking through robustness signatures

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)