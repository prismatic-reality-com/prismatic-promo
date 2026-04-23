+++
title = "Confidence Threshold"
weight = 34
[extra]
category = "epistemic"
description = "Tau values defining required confidence for decisions (0.95 critical to 0.50 research)"
abbreviation = "tau"
related_terms = ["nabla-infinity", "trinity-gate", "signal-plurality", "nm-nd", "epistemic-pipeline", "qeve", "confidence-scoring", "belief-graph", "epistemic-robustness", "contradiction-preservation", "provenance-mandatory", "time-decay", "monte-carlo-verification", "formal-verification", "property-based-testing", "cherry-picking", "no-mercy", "no-doubts", "easm", "entity-resolution", "quality-gates", "lean4", "white-team", "purple-team", "color-teams", "agent", "fitness-score", "three-nl"]
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
word_count = 2632
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Confidence", "Threshold", "values", "defining", "required", "decisions", "critical", "glossary", "epistemic", "Prismatic Platform"]
tags = ["glossary", "epistemic", "confidence-threshold", "prismatic"]
quality_score = 97
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Confidence Threshold - Prismatic Platform"
+++

## Definition

A Confidence Threshold, denoted by the Greek letter tau, is a numeric boundary value that defines the minimum degree of evidential support required before the Prismatic Platform permits a transition from epistemic exploration to decisive execution. Thresholds are expressed as real numbers in the interval [0, 1], where 0 represents complete uncertainty and 1 represents absolute certainty. In practice, the platform never requires tau = 1.0, recognizing that absolute certainty is an epistemological impossibility in open-world domains such as security intelligence, due diligence, and OSINT.

The concept of confidence thresholds addresses a fundamental tension in any intelligence-producing system: acting too early on insufficient evidence risks catastrophic error, while waiting too long for perfect evidence risks paralysis and missed opportunity. Tau values formalize this trade-off by establishing context-sensitive decision boundaries. A security-critical determination -- such as whether a domain is actively being used for phishing -- demands a substantially higher evidential bar than a speculative research query exploring whether two entities might share a beneficial owner.

Within the Prismatic Platform, confidence thresholds are not advisory guidelines. They are structurally enforced constraints, integrated into the [epistemic pipeline](/glossary/epistemic-pipeline/) at 3NL Level 3 and validated through the [QEVE](/glossary/qeve/) verification engine. An [agent](/glossary/agent/) cannot transition to [NM/ND](/glossary/nm-nd/) execution mode until two independent conditions are satisfied: the computed confidence score meets or exceeds the applicable tau value, and the conclusion passes [Trinity Gate](/glossary/trinity-gate/) verification across all three layers. This dual-condition requirement ensures that high confidence alone -- which can arise from systematic bias or [cherry-picking](/glossary/cherry-picking/) -- is never sufficient to authorize action.

The platform currently manages over 434 agents and 89 applications, each of which operates under tau-governed decision boundaries. The thresholds are calibrated empirically against historical decision outcomes and are subject to periodic recalibration as the platform's [fitness score](/glossary/fitness-score/) evolves across [generations](/glossary/generation/).

## The Four Threshold Levels

The Prismatic Platform defines four canonical threshold levels, each corresponding to a distinct operational context. These levels form a hierarchy of evidential rigor, with the most consequential decisions demanding the highest confidence.

### Critical Decisions (tau = 0.95)

The highest threshold level governs decisions where error carries severe, potentially irreversible consequences. At tau = 0.95, the platform requires near-certainty before permitting action. Contexts operating at this level include:

- **Security assessments**: Classifying a domain, IP address, or certificate as malicious within [Prismatic Perimeter](/glossary/easm/) directly affects security ratings visible to compliance officers and auditors. A false positive at this level could damage a legitimate organization's reputation; a false negative could leave a genuine threat unaddressed.
- **Production deployments**: Decisions to deploy code to production environments, particularly those affecting the platform's own [quality gates](/glossary/quality-gates/) or [quality DNA](/glossary/quality-dna/), operate at this threshold.
- **Compliance determinations**: NIS2 and ZKB compliance assessments that will be presented as authoritative findings require the 0.95 bar, given their regulatory and legal implications.
- **Entity resolution merges**: When the [entity resolution](/glossary/entity-resolution/) system proposes merging two identity records into a single entity, an incorrect merge is extremely difficult to reverse. The 0.95 threshold ensures that only well-supported merges proceed.

At this level, [Trinity Gate](/glossary/trinity-gate/) passage is mandatory. All three gates -- structural consistency, logical consistency, and formal necessity -- must pass before the confidence score is considered actionable.

### Standard Operations (tau = 0.80)

The standard threshold governs routine operational decisions that are consequential but recoverable. Most day-to-day agent coordination, data processing pipelines, and quality enforcement actions operate at this level. Examples include:

- **Agent task routing**: Decisions about which specialist agent should handle an incoming task based on capability matching and current load.
- **Data enrichment acceptance**: Determining whether an enrichment result from an external provider (e.g., DNS records, WHOIS data, certificate transparency logs) is sufficiently reliable to incorporate into the platform's [knowledge graph](/glossary/knowledge-graph/).
- **Quality enforcement**: Automated decisions by the [Quality Floor Guardian](/glossary/quality-floor-guardian/) regarding whether a code change meets quality standards.
- **Alert generation**: Producing alerts or notifications based on observed patterns in monitored assets.

Trinity Gate passage remains mandatory at this level, though the verification may use abbreviated proof strategies (e.g., property-based testing rather than full Lean4 formal proofs) where appropriate.

### Exploratory Analysis (tau = 0.60)

The exploratory threshold applies to investigative and analytical work where the goal is to identify promising directions rather than to reach definitive conclusions. At tau = 0.60, the platform acknowledges that the available evidence is suggestive but not yet conclusive. Contexts include:

- **Hypothesis generation**: When OSINT analysis surfaces a potential connection between two entities, a confidence of 0.60 is sufficient to flag the connection for further investigation but not to report it as established fact.
- **Research investigations**: Exploratory scans of new attack surfaces, preliminary threat assessments, and initial reconnaissance activities.
- **Pattern detection**: Early-stage identification of behavioral patterns, configuration drift, or anomalous activity that warrants closer examination.

At this level, Trinity Gate passage is recommended but not strictly mandatory. The rationale is that exploratory findings are explicitly marked as provisional and are expected to undergo further validation before influencing any consequential decision.

### Research Queries (tau = 0.50)

The lowest threshold level applies to speculative analysis and early-stage investigation where even weak signals carry informational value. A confidence of 0.50 represents marginal evidence -- barely more informative than chance -- yet in research contexts, such signals can guide productive inquiry. Contexts include:

- **Speculative correlation**: Exploring whether two apparently unrelated data points might share a common cause.
- **Early-stage OSINT**: Initial sweeps across data sources before any filtering or validation has been applied.
- **Brainstorming support**: Providing agents with a broad set of loosely supported hypotheses to consider during the [NABLA Infinity](/glossary/nabla-infinity/) exploration phase.

Trinity Gate passage is optional at this level. Findings produced at tau = 0.50 are explicitly labeled as speculative and carry no decisional authority until promoted to a higher threshold through additional evidence accumulation.

## Mathematical Foundation

Confidence computation within the Prismatic Platform follows a structured aggregation model that combines evidence from multiple independent sources, applies temporal decay, and accounts for source reliability. The core computation can be expressed as follows.

Given a set of n independent evidence signals S = {s_1, s_2, ..., s_n} supporting a proposition P, the raw confidence C(P) is computed as:

```
C(P) = 1 - product(1 - w_i * r_i * d(t_i))  for i = 1 to n
```

Where:

- **w_i** is the weight assigned to signal s_i, reflecting its evidential strength (0 < w_i <= 1)
- **r_i** is the reliability score of the source producing signal s_i (0 < r_i <= 1)
- **d(t_i)** is the [time decay](/glossary/time-decay/) function applied to the signal's timestamp t_i, ensuring that older evidence contributes less to current confidence
- The product formulation ensures diminishing returns: each additional signal contributes less marginal confidence than the previous one, preventing artificial inflation from redundant sources

The [QEVE](/glossary/qeve/) verification engine (Quantified Epistemic Verification Engine) provides the formal grounding for this computation. QEVE integrates three verification methodologies:

1. **[Lean4](/glossary/lean4/) formal proofs**: For propositions amenable to formal treatment, QEVE generates and verifies Lean4 proofs that establish logical necessity.
2. **[NABLA Infinity](/glossary/nabla-infinity/) axiom compliance**: Every confidence computation is checked against the seven NABLA axioms, particularly [Signal Plurality](/glossary/signal-plurality/) (minimum two independent sources) and [Provenance Mandatory](/glossary/provenance-mandatory/) (all evidence must be traceable to its origin).
3. **[Monte Carlo verification](/glossary/monte-carlo-verification/)**: For complex multi-step reasoning chains, QEVE employs Monte Carlo sampling to estimate the probability that the conclusion holds under perturbation of input assumptions.

The final confidence score is the minimum of C(P) and the QEVE verification score, ensuring that computational confidence cannot exceed the formal verification bound.

## Threshold Calibration

The four canonical tau values (0.95, 0.80, 0.60, 0.50) were not selected arbitrarily. They were derived through an iterative calibration process that balanced three competing objectives: minimizing false positives (acting on insufficient evidence), minimizing false negatives (failing to act on sufficient evidence), and maintaining operational efficiency (avoiding excessive verification overhead).

The calibration methodology involved:

1. **Historical decision analysis**: Reviewing the outcomes of past platform decisions across security assessments, entity resolution merges, and compliance determinations to establish ground-truth accuracy rates at various confidence levels.
2. **Cost-asymmetry modeling**: For each operational context, estimating the relative cost of false positives versus false negatives. In security-critical contexts, the cost of a false negative (missing a real threat) is typically much higher than a false positive, which is why the critical threshold is set at 0.95 rather than a lower value that would reduce false negatives at the cost of more false positives.
3. **[Property-based testing](/glossary/property-based-testing/)**: Generating large volumes of synthetic scenarios with known ground truth and measuring decision accuracy at each threshold level.
4. **Cross-generation validation**: Comparing threshold effectiveness across platform [generations](/glossary/generation/), from Generation 1 through the current Generation 18, to ensure that thresholds remain appropriate as the platform's agent population and data sources evolve.

The calibration is not static. The platform's [SEADF](/glossary/seadf/) framework includes a threshold recalibration subsystem that monitors decision outcomes and recommends adjustments when empirical accuracy diverges from expected performance. However, any proposed threshold change must itself pass Trinity Gate verification at the critical level (tau = 0.95), preventing hasty recalibration based on insufficient evidence.

## Relationship to Trinity Gate

The relationship between confidence thresholds and [Trinity Gate](/glossary/trinity-gate/) is one of complementary verification. They address different failure modes in epistemic reasoning:

- **Confidence thresholds** address the *quantity* of evidence: Is there enough supporting data to justify action?
- **Trinity Gate** addresses the *quality* of reasoning: Is the conclusion structurally sound, logically consistent, and formally necessary?

A system that relies solely on confidence thresholds is vulnerable to high-confidence errors -- situations where abundant but systematically biased evidence produces a numerically impressive confidence score for a fundamentally flawed conclusion. Conversely, a system that relies solely on formal verification without confidence thresholds might prove the logical validity of conclusions that are empirically unsupported.

The Prismatic Platform requires both. The transition condition from exploration to execution is expressed as a conjunction:

```
transition_authorized = (C(P) >= tau_context) AND trinity_gate_passed(P)
```

At the critical level (tau = 0.95), all four Trinity Gate layers must pass: structural consistency (the [belief graph](/glossary/belief-graph/) forms a valid DAG), logical consistency (no contradictions in the inference chain), formal necessity (Lean4 proof or equivalent), and meta-integrity (the gate's own verification is sound). At the standard level (tau = 0.80), all four layers are still required but may use lighter-weight verification methods. At the exploratory and research levels, Trinity Gate passage becomes progressively optional.

## The NABLA-to-NM/ND Transition Protocol

Confidence thresholds serve as the quantitative trigger for the platform's most consequential state transition: the shift from [NABLA Infinity](/glossary/nabla-infinity/) epistemic exploration to [No Mercy, No Doubts](/glossary/nm-nd/) decisive execution.

During the NABLA phase, agents operate in a mode characterized by:

- Parallel hypothesis exploration, maintaining multiple competing explanations simultaneously
- Active [contradiction preservation](/glossary/contradiction-preservation/), refusing to prematurely discard inconvenient evidence
- Uncertainty quantification, tracking what is known, what is unknown, and what is unknowable
- [Signal plurality](/glossary/signal-plurality/) enforcement, requiring independent corroboration before any belief gains traction

This exploratory mode continues until the confidence score for a specific proposition crosses the applicable tau threshold. At that moment, the transition protocol activates:

1. **Threshold check**: The [confidence scoring](/glossary/confidence-scoring/) subsystem confirms that C(P) >= tau for the relevant context.
2. **Trinity Gate submission**: The proposition P, along with its full evidence chain and provenance metadata, is submitted to the [Trinity Gate](/glossary/trinity-gate/) for independent verification.
3. **Gate passage**: If all required Trinity Gate layers pass, the transition is authorized.
4. **NM/ND activation**: The platform enters [No Mercy](/glossary/no-mercy/) execution mode for this proposition: complete implementation, zero tolerance for incomplete delivery, full quality enforcement. Simultaneously, [No Doubts](/glossary/no-doubts/) applies: once the decision is made, it is executed with full commitment, no second-guessing, no hedging.
5. **[Audit trail](/glossary/audit-trail/) recording**: The transition event, including the confidence score, Trinity Gate results, and decision rationale, is recorded in the immutable audit trail.

The transition is irreversible within a single decision cycle. Once NM/ND mode is activated for a proposition, the platform commits fully. If new contradictory evidence emerges after the transition, it is handled as a new epistemic cycle rather than a rollback of the current one.

## Domain-Specific Threshold Adjustment

While the four canonical threshold levels provide a universal framework, specific operational domains within the Prismatic Platform may apply domain-specific adjustments that shift the effective tau value within the bounds of the canonical level.

### External Attack Surface Management (EASM)

[Prismatic Perimeter](/glossary/easm/) operates in a domain where the consequences of both false positives and false negatives are severe. A false positive security rating (incorrectly flagging a legitimate domain as compromised) can damage business relationships; a false negative (missing an actual compromise) can leave organizations exposed to active threats.

Perimeter applies a domain adjustment of +0.02 to all threshold levels, yielding effective thresholds of 0.97 for critical security rating determinations, 0.82 for standard asset classification, 0.62 for exploratory surface discovery, and 0.52 for speculative threat correlation. This adjustment reflects the domain's high-stakes, high-visibility operating environment.

### Due Diligence and Entity Resolution

When the [entity resolution](/glossary/entity-resolution/) system processes sanctions screening, beneficial ownership analysis, or adverse media checks, it applies a domain adjustment that varies by jurisdiction. Jurisdictions with strict data protection regulations (EU/GDPR contexts) receive a +0.03 adjustment, reflecting the elevated cost of incorrect entity merges in privacy-sensitive environments.

### OSINT Intelligence Gathering

Open-source intelligence operations apply a domain adjustment of -0.03 at the exploratory and research levels, yielding effective thresholds of 0.57 and 0.47 respectively. This reflects the nature of OSINT work, where casting a wider net during early investigation phases is more valuable than premature filtering. The critical and standard thresholds remain unadjusted, ensuring that OSINT findings promoted to actionable intelligence still meet the full evidential bar.

## Failure Modes

Confidence threshold systems exhibit two characteristic failure modes, each representing a pathological extreme. The Prismatic Platform's architecture is designed to detect and mitigate both.

### Premature Execution (tau set too low)

When effective thresholds are set below the level appropriate for a given context, the system acts on insufficient evidence. Symptoms include:

- **High false positive rates** in security assessments, leading to alert fatigue and erosion of trust in the platform's findings.
- **Incorrect entity merges** that are costly to reverse and may propagate errors through downstream systems.
- **Compliance findings** that cannot withstand audit scrutiny, exposing the organization to regulatory risk.

The platform mitigates premature execution through the Trinity Gate requirement. Even if a confidence score nominally exceeds a too-low threshold, the structural, logical, and formal verification layers provide independent checks that catch conclusions built on weak evidence. The [Purple Team](/glossary/purple-team/) specifically monitors for patterns of premature execution across the platform's decision history.

### Analysis Paralysis (tau set too high)

When effective thresholds are set above the level appropriate for a given context, the system fails to act even when evidence is sufficient. Symptoms include:

- **Missed threats** that were detectable but not acted upon because the confidence score fell marginally below an excessively high threshold.
- **Operational bottlenecks** as decisions queue up waiting for evidence that may never become available, particularly in time-sensitive security contexts.
- **Reduced [fitness score](/glossary/fitness-score/)** as the platform's overall effectiveness degrades due to systematic inaction.

The platform mitigates analysis paralysis through the [SEADF](/glossary/seadf/) monitoring subsystem, which tracks the ratio of propositions that reach near-threshold confidence but fail to cross it. A sustained increase in this ratio triggers an automatic review of whether the applicable threshold is appropriately calibrated. The [Gray Team](/glossary/gray-team/) also contributes by exploring boundary cases where thresholds may be producing suboptimal behavior.

## Confidence vs Robustness vs Threshold

Three related but distinct concepts govern the platform's epistemic quality, and conflating them is a common source of confusion.

**[Confidence scoring](/glossary/confidence-scoring/)** is the process of computing C(P) for a given proposition. It produces a numeric value reflecting the weight and reliability of available evidence. Confidence is a *measurement* -- it tells you how much evidence supports a conclusion.

**[Epistemic robustness](/glossary/epistemic-robustness/)** measures how stable a conclusion is under perturbation. A conclusion with high confidence but low robustness would collapse if any single piece of evidence were removed or discredited. The platform measures robustness through leave-one-out analysis and Monte Carlo perturbation. Robustness is a *property* -- it tells you how resilient a conclusion is to challenge.

**Confidence threshold** (tau) is the decision boundary that determines when a confidence score is sufficient to authorize action. The threshold is a *policy* -- it tells you what level of evidence is required in a given context.

All three interact in the platform's decision-making: confidence scoring produces the input value, robustness qualifies how trustworthy that value is, and the threshold determines whether the qualified value is sufficient for action. A well-functioning epistemic system requires all three to be properly calibrated and independently maintained.

## Practical Examples

### Security Rating Determination

Consider Prismatic Perimeter assessing the security posture of a target domain. Multiple evidence sources contribute signals: DNS configuration analysis, certificate transparency logs, WHOIS registration history, port scan results, and web application fingerprinting. Each source produces a weighted, reliability-adjusted, time-decayed signal.

After aggregation, the confidence in the proposition "this domain maintains adequate security controls" reaches C(P) = 0.91. The applicable threshold for security rating determinations is tau = 0.97 (critical level plus EASM domain adjustment). Since 0.91 < 0.97, the system does not yet issue a definitive rating. Instead, it flags the assessment as requiring additional evidence sources and continues the [NABLA Infinity](/glossary/nabla-infinity/) exploration phase. Only when additional signals raise C(P) above 0.97 -- and Trinity Gate confirms structural and logical consistency -- does the platform issue a final A-F security grade.

### Due Diligence Entity Resolution

An entity resolution pipeline processing Czech commercial registry data identifies two business records that may refer to the same legal entity. Name similarity, address proximity, and shared directors produce a confidence of C(P) = 0.87. The applicable threshold for entity merges in EU jurisdictions is tau = 0.98 (critical level plus the +0.03 GDPR domain adjustment). The system marks the potential merge as a high-confidence candidate but does not execute the merge automatically. A human analyst receives a structured brief including the confidence score, contributing evidence, and the specific gap between C(P) and tau, enabling informed manual review.

### OSINT Hypothesis Exploration

During an investigation into potential infrastructure sharing between two threat actor groups, an OSINT analyst requests correlation analysis across domain registration patterns. Early signals from passive DNS data and hosting provider records produce a confidence of C(P) = 0.53. The applicable threshold for OSINT exploratory analysis is tau = 0.57 (exploratory level with the -0.03 OSINT domain adjustment). Since 0.53 < 0.57, the hypothesis is logged as a research lead but not promoted to the analytical pipeline. The [belief graph](/glossary/belief-graph/) records the hypothesis and its supporting evidence, enabling future signals to automatically update the confidence score as new data becomes available.

## Related Terms

- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework defining the seven axioms that govern all belief formation and confidence computation
- [Trinity Gate](/glossary/trinity-gate/) -- Four-layer verification gate that must pass alongside threshold achievement before any transition to execution
- [NM/ND Doctrine](/glossary/nm-nd/) -- Execution mode entered when confidence exceeds threshold and Trinity Gate passes
- [No Mercy](/glossary/no-mercy/) -- Zero-tolerance execution principle activated upon threshold-authorized transition
- [No Doubts](/glossary/no-doubts/) -- Full-commitment decision principle activated upon threshold-authorized transition
- [Confidence Scoring](/glossary/confidence-scoring/) -- The computational process that produces the numeric confidence value compared against thresholds
- [Signal Plurality](/glossary/signal-plurality/) -- NABLA axiom requiring minimum two independent signals before any belief is formed
- [Contradiction Preservation](/glossary/contradiction-preservation/) -- NABLA axiom ensuring contradictory evidence is maintained rather than discarded
- [Provenance Mandatory](/glossary/provenance-mandatory/) -- NABLA axiom requiring all evidence to be traceable to its origin
- [Time Decay](/glossary/time-decay/) -- Temporal weighting function ensuring older evidence contributes less to current confidence
- [Belief Graph](/glossary/belief-graph/) -- DAG structure representing the platform's current belief state and evidence relationships
- [Epistemic Robustness](/glossary/epistemic-robustness/) -- Measure of conclusion stability under perturbation of supporting evidence
- [Epistemic Pipeline](/glossary/epistemic-pipeline/) -- 16-level processing pipeline where confidence computation and threshold checking occur
- [QEVE](/glossary/qeve/) -- Quantified Epistemic Verification Engine providing formal grounding for confidence computation
- [Monte Carlo Verification](/glossary/monte-carlo-verification/) -- Statistical verification method used for complex multi-step reasoning chains
- [Formal Verification](/glossary/formal-verification/) -- Mathematical proof-based verification methodology integrated via Lean4
- [Property-Based Testing](/glossary/property-based-testing/) -- Automated testing methodology used in threshold calibration
- [Lean4](/glossary/lean4/) -- Theorem prover used for formal necessity verification in Trinity Gate
- [Cherry-Picking](/glossary/cherry-picking/) -- Anti-pattern of selecting only supporting evidence, which thresholds alone cannot prevent
- [Entity Resolution](/glossary/entity-resolution/) -- Identity merge system operating under strict confidence thresholds
- [EASM](/glossary/easm/) -- External Attack Surface Management domain with elevated threshold adjustments
- [Quality Gates](/glossary/quality-gates/) -- Code quality verification system operating at the standard threshold level
- [Fitness Score](/glossary/fitness-score/) -- Platform-wide effectiveness metric influenced by threshold calibration quality
- [Generation](/glossary/generation/) -- Platform evolution cycle across which thresholds are recalibrated
- [SEADF](/glossary/seadf/) -- Framework providing threshold recalibration monitoring and recommendations
- [Color Teams](/glossary/color-teams/) -- Adversarial-defensive team structure that validates threshold effectiveness
- [Purple Team](/glossary/purple-team/) -- Synthesis team monitoring for premature execution patterns
- [Gray Team](/glossary/gray-team/) -- Boundary exploration team investigating threshold edge cases
- [White Team](/glossary/white-team/) -- Constructive verification team providing formal proofs for threshold-critical decisions
- [Three-NL](/glossary/three-nl/) -- Integration framework at whose Level 3 confidence thresholds are enforced
- [Agent](/glossary/agent/) -- Autonomous platform components that operate under tau-governed decision boundaries
- [Audit Trail](/glossary/audit-trail/) -- Immutable record of all threshold transitions and decision events

## See Also

- [Architecture](/architecture/) -- Platform architecture overview including epistemic subsystem design
- [Technologies](/technologies/) -- Technology stack supporting confidence computation and verification
- [AIAD](/glossary/aiad/) -- Agent standard requiring threshold compliance in all agent specifications
- [Quality DNA](/glossary/quality-dna/) -- Cross-session quality continuity system calibrated against confidence thresholds

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)