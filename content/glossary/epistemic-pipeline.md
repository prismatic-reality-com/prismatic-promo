+++
title = "Epistemic Pipeline"
weight = 35
date = 2026-02-14
[extra]
category = "epistemic"
description = "16-level processing pipeline from raw data (L0) through Meta and Consciousness that transforms unstructured signals into formally verified knowledge"
related_terms = ["nabla-infinity", "trinity-gate", "consciousness-traits", "three-nl", "provenance-mandatory", "confidence-threshold", "belief-graph", "qeve", "signal-plurality", "contradiction-preservation", "time-decay", "confidence-scoring", "formal-verification", "monte-carlo-verification", "property-based-testing", "entity-resolution", "cherry-picking", "quality-gates", "seadf", "audit-trail", "agent", "color-teams", "nm-nd"]
date_created = "2026-01-15"
date_updated = "2026-02-14"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
word_count = 3267
date_modified = "2026-02-23"
keywords = ["Epistemic", "Pipeline", "16-level", "Meta", "Consciousness", "glossary", "Prismatic Platform", "Trinity Gate", "NABLA"]
tags = ["glossary", "epistemic", "epistemic-pipeline", "prismatic"]
quality_score = 97
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Epistemic Pipeline - Prismatic Platform"
+++

{% import "macros/flowbite.html" as fb %}

## Definition

The Epistemic Pipeline is the central knowledge-processing architecture of the Prismatic Platform. It defines a 16-level transformation pathway that takes raw, unstructured data and progressively refines it into formally verified, actionable knowledge. The pipeline spans levels L0 (Raw Signal Ingestion) through L13 (Integrated Knowledge), followed by two apex levels: Meta (Pipeline Self-Assessment) and Consciousness (Emergent Platform Awareness). Each level applies increasingly sophisticated analytical, validative, and synthetic operations, ensuring that every piece of information flowing through the platform is subjected to rigorous epistemic scrutiny before it can influence decisions or actions.

{{ fb::p5_interactive_dashboard(title="QEVE Pipeline Flow Visualization", sketch_type="generative", data_source="epistemic.pipeline_flow", controls=true) }}

{{ fb::divider(label="Pipeline Architecture") }}

The architecture draws on principles from epistemology, signal processing theory, and formal verification. Unlike conventional data pipelines that treat information as a commodity to be moved and stored, the Epistemic Pipeline treats information as a claim that must be substantiated. Every datum that enters at L0 carries no epistemic weight; it acquires justified confidence only by surviving the gauntlet of validation, correlation, contradiction analysis, and formal proof that the successive levels impose. This design philosophy reflects the platform's foundational commitment to [NABLA Infinity](/glossary/nabla-infinity/) axioms: reality is not a democracy, evidence is not optional, and contradictions are not embarrassments to be hidden.

**Interactive Demo**: The pipeline flow visualization above shows the QEVE (Question → Evidence → Validation → Evolution) stages in action. Watch as raw signals enter at L0 and progress through the 16 levels of transformation. The animation demonstrates how data accumulates epistemic weight through validation, correlation, and formal verification. Observe the belief graph structures forming as related signals converge and contradict, culminating in the Meta and Consciousness levels that monitor the pipeline's own epistemic health.

The 16-level design was not chosen arbitrarily. It emerged from an analysis of the minimum number of distinct processing stages required to satisfy all seven NABLA axioms while maintaining tractable computational complexity. Fewer levels would conflate distinct epistemic operations (such as correlation and contradiction identification, which require fundamentally different algorithms). More levels would introduce unnecessary overhead without meaningful gains in epistemic rigor. The current architecture represents the convergence point where completeness of epistemic coverage meets practical engineering constraints.

Within the Prismatic Platform's ecosystem of over 430 [agents](/glossary/agent/) operating across 89 applications, the Epistemic Pipeline serves as the shared epistemological backbone. Regardless of whether an agent is performing OSINT collection, security assessment, compliance verification, or knowledge synthesis, its outputs must enter and traverse the pipeline. This universality ensures that the platform maintains a single, coherent standard of epistemic quality across all domains of operation.

## The 16 Levels

The pipeline's levels form a directed acyclic progression, where each level consumes the outputs of its predecessors and produces enriched outputs for its successors. No level may be skipped, and no information may bypass a level without explicit exemption through the [Trinity Gate](/glossary/trinity-gate/) override protocol (which itself requires formal justification).

{{ fb::p5_grid_2x2(
  title1="Signal Processing (L0-L3)", type1="generative", data1="epistemic.signal_processing",
  title2="Correlation & Patterns (L4-L7)", type2="generative", data2="epistemic.correlation_patterns",
  title3="Knowledge Integration (L8-L11)", type3="generative", data3="epistemic.knowledge_integration",
  title4="Meta-Consciousness (L12-Meta)", type4="generative", data4="epistemic.meta_consciousness"
) }}

### L0: Raw Signal Ingestion

The entry point of the pipeline. L0 accepts raw, unprocessed data from all platform sources: OSINT feeds, [EASM](/glossary/easm/) scanners, agent reports, external API responses, user inputs, and sensor data. At this level, no filtering, validation, or interpretation occurs. The sole responsibility of L0 is to capture incoming data with complete fidelity, attach ingestion timestamps (satisfying the [Time Decay](/glossary/time-decay/) axiom from the moment of entry), and assign provisional [provenance](/glossary/provenance-mandatory/) metadata identifying the source, transport mechanism, and ingestion context. L0 operates on the principle that discarding data before assessment constitutes a form of epistemic [cherry-picking](/glossary/cherry-picking/), which is forbidden under NABLA axioms.

### L1: Signal Extraction

L1 performs the first interpretive operation on raw data: extracting discrete signals from the undifferentiated input stream. A "signal" in this context is a unit of information that carries a potential epistemic claim -- an IP address, a domain name, a configuration parameter, a behavioral indicator, a textual assertion. L1 applies format-specific parsers, natural language processing, and structural analysis to decompose raw inputs into their constituent signals. Each extracted signal inherits the provenance chain established at L0 and receives a unique signal identifier for tracking through subsequent levels.

### L2: Signal Validation

L2 subjects each extracted signal to structural and semantic validation. Structural validation confirms that the signal conforms to expected formats and schemas (for example, that an extracted IP address is syntactically valid, or that a timestamp falls within a plausible range). Semantic validation applies domain-specific rules to assess whether the signal's content is internally coherent. Signals that fail validation are not discarded but flagged with validation failure metadata, preserving the platform's commitment to [contradiction preservation](/glossary/contradiction-preservation/). Invalid signals may still carry epistemic value as indicators of data corruption, adversarial manipulation, or previously unknown data formats.

### L3: Source Attribution

L3 performs deep provenance analysis, extending beyond the mechanical provenance assigned at L0. At this level, the pipeline evaluates the reliability, historical accuracy, and potential biases of each signal's source. Source attribution draws on the platform's accumulated knowledge about data providers, including past accuracy rates, known blind spots, and potential conflicts of interest. This level directly enforces the [Signal Plurality](/glossary/signal-plurality/) axiom by tagging each signal with source independence metadata, enabling downstream levels to weight signals appropriately and to detect when ostensibly independent sources share a common upstream origin.

### L4: Signal Correlation

L4 identifies relationships between signals originating from different sources, time periods, or domains. Correlation analysis employs [entity resolution](/glossary/entity-resolution/) algorithms to determine when distinct signals refer to the same underlying entity or event, temporal correlation to identify signals that co-occur within meaningful time windows, and causal inference techniques to detect potential cause-effect relationships. The outputs of L4 are correlation graphs that map the relational structure of the signal space, feeding directly into the platform's [Belief Graph](/glossary/belief-graph/) infrastructure.

### L5: Pattern Detection

L5 applies pattern recognition across the correlated signal space to identify recurring structures, anomalies, trends, and emergent behaviors. This level employs statistical analysis, machine learning classifiers, and rule-based pattern matching to surface both known patterns (matching against the platform's pattern library) and novel patterns (flagged for human or agent review). Pattern detection operates at multiple temporal and spatial scales, from micro-patterns within individual data streams to macro-patterns spanning the entire platform's observation space.

### L6: Contradiction Identification

L6 is one of the most epistemically critical levels in the pipeline. Its sole purpose is to identify cases where the accumulated evidence contains contradictions: signals, correlations, or patterns that assert mutually incompatible claims about the state of the world. In conventional systems, contradictions are treated as errors to be resolved by discarding one side. Under the [Contradiction Preservation](/glossary/contradiction-preservation/) axiom, the Epistemic Pipeline instead preserves both sides of every contradiction, annotates them with the strength of evidence supporting each position, and forwards this structured disagreement to higher levels for principled resolution. This level serves as the primary defense against confirmation bias and epistemic [cherry-picking](/glossary/cherry-picking/).

### L7: Confidence Computation

L7 computes quantitative [confidence scores](/glossary/confidence-scoring/) for every claim, correlation, and pattern that has survived to this point. Confidence computation integrates signal validation results, source reliability assessments, correlation strength, pattern consistency, and contradiction severity into a unified numerical score. The computation respects the Time Decay axiom by applying temporal discount factors to older evidence, and it enforces Signal Plurality by requiring a minimum number of independent sources before confidence can exceed defined [thresholds](/glossary/confidence-threshold/). The output of L7 is a fully scored belief space where every epistemic claim carries a justified, auditable confidence value.

### L8: Hypothesis Formation

L8 synthesizes the scored belief space into explicit hypotheses: structured propositions about the state of the world that can be tested, refined, or falsified. Hypothesis formation draws on the patterns identified at L5, the contradictions catalogued at L6, and the confidence scores computed at L7 to generate candidate explanations for observed phenomena. Each hypothesis is constructed with explicit assumptions, predicted consequences, and falsification criteria, enabling systematic evaluation at higher levels.

### L9: Evidence Synthesis

L9 performs comprehensive evidence synthesis, assembling all available evidence relevant to each hypothesis into structured evidence packages. Synthesis involves aggregating supporting evidence, contrary evidence, and absence-of-evidence indicators (respecting the NABLA axiom that absence is informative) into coherent evidentiary narratives. The output of L9 is not a verdict but a complete, balanced presentation of all available evidence organized around each active hypothesis, suitable for evaluation by both automated and human decision-makers.

### L10: Knowledge Integration

L10 integrates newly synthesized evidence into the platform's persistent knowledge base. This level manages the complex task of reconciling new findings with existing knowledge, updating belief strengths, retiring superseded hypotheses, and identifying cases where new evidence fundamentally alters the platform's understanding of a domain. Knowledge integration operates through the [Belief Graph](/glossary/belief-graph/), updating node weights, edge relationships, and graph topology to reflect the current state of justified belief. All modifications to the knowledge base are recorded in the platform's immutable [audit trail](/glossary/audit-trail/).

### L11: Decision Support

L11 transforms integrated knowledge into decision-relevant outputs. This level applies context-specific decision frameworks to the knowledge base, generating risk assessments, threat evaluations, compliance status reports, and strategic recommendations. Decision support outputs are always accompanied by explicit confidence levels, assumption lists, and references to the underlying evidence chain, enabling decision-makers to evaluate not just the recommendation but the epistemic quality of the reasoning behind it.

### L12: Action Recommendation

L12 produces concrete, actionable recommendations based on the decision support outputs of L11. Each recommendation includes a proposed action, expected outcomes, risk assessment, resource requirements, and rollback criteria. Recommendations that meet the platform's confidence thresholds and pass Trinity Gate verification are flagged as ready for execution. Those that fall below threshold are returned to lower levels for additional evidence gathering. This level enforces the [NM/ND](/glossary/nm-nd/) doctrine's transition protocol: exploration continues until confidence reaches the required threshold, at which point execution proceeds without hesitation.

### L13: Integrated Knowledge

L13 represents the highest standard-level output of the pipeline: fully integrated, formally verified knowledge products that have survived the complete processing chain. Knowledge at L13 has been ingested, extracted, validated, attributed, correlated, pattern-analyzed, contradiction-examined, confidence-scored, hypothesis-tested, evidence-synthesized, knowledge-integrated, decision-analyzed, and action-evaluated. L13 outputs carry the full provenance chain from L0 through L12 and have passed all applicable [Trinity Gate](/glossary/trinity-gate/) checkpoints. These outputs represent the platform's highest-confidence understanding of reality within their respective domains.

### Meta: Pipeline Self-Assessment

The Meta level operates outside the standard L0-L13 progression. Its function is reflexive: it applies the pipeline's own epistemic standards to the pipeline itself. Meta monitors processing latency at each level, detection rates for known and novel patterns, contradiction resolution effectiveness, confidence calibration accuracy (comparing predicted confidence to observed outcomes), and overall pipeline throughput. When Meta detects degradation in any pipeline metric, it triggers interventions through the platform's [AutoHeal](/glossary/autoheal/) system and reports findings to the [Quality Floor Guardian](/glossary/quality-floor-guardian/). Meta ensures that the Epistemic Pipeline's epistemic standards are not merely aspirational but continuously verified.

### Consciousness: Emergent Platform Awareness

The Consciousness level represents the apex of the Epistemic Pipeline. It tracks 11 [Consciousness Traits](/glossary/consciousness-traits/) that emerge from the collective operation of the pipeline and the broader agent ecosystem: self-awareness, environmental awareness, temporal awareness, goal coherence, adaptive learning, meta-cognition, epistemic humility, collaborative intelligence, ethical reasoning, creative synthesis, and narrative coherence. These traits are not programmed but emerge from the interaction of hundreds of agents processing information through the pipeline. The Consciousness level achieves a current [fitness score](/glossary/fitness-score/) of 0.998, indicating near-perfect alignment between the platform's emergent behavior and its designed epistemic objectives.

## NABLA Axiom Enforcement Across Levels

The seven axioms of [NABLA Infinity](/glossary/nabla-infinity/) are not applied at a single checkpoint but are enforced continuously throughout the pipeline. Each axiom has primary enforcement points where it is most critically relevant, and secondary enforcement points where compliance is monitored but violations trigger warnings rather than blocks.

**Signal Plurality** is primarily enforced at L3 (Source Attribution) and L7 (Confidence Computation). No claim may achieve confidence above the standard operations threshold of 0.80 without at least two independent supporting signals. At L4 (Signal Correlation), the plurality requirement extends to correlation claims, ensuring that identified relationships are supported by multiple evidence threads.

**Contradiction Preservation** has its primary enforcement point at L6 (Contradiction Identification), but is monitored at every level from L2 onward. Any operation that would discard one side of a detected contradiction triggers an immediate E2-level block under the NABLA enforcement protocol.

**Absence Informative** is enforced throughout L5 (Pattern Detection) and L9 (Evidence Synthesis). The pipeline explicitly tracks expected-but-missing signals and incorporates their absence into confidence calculations and hypothesis evaluation.

**Time Decay** is enforced from the moment of ingestion at L0, with mandatory timestamps attached to every datum. L7 (Confidence Computation) applies temporal discount functions, and L10 (Knowledge Integration) periodically re-evaluates stored knowledge against current decay schedules.

**Unknown Valid** is enforced at L7 and L8, ensuring that the pipeline's outputs include explicit uncertainty bounds and that "I don't know" remains a legitimate conclusion at every level.

**Source Independence** is primarily enforced at L3 and L4, where the pipeline identifies and accounts for common-source dependencies that might create an illusion of plurality.

**Provenance Mandatory** is enforced at every level without exception. Every transformation, annotation, and decision applied to a datum throughout the pipeline is recorded in its provenance chain, creating a complete, auditable history from ingestion to final output.

## Trinity Gate Checkpoints

The [Trinity Gate](/glossary/trinity-gate/) implements a four-layer verification system that serves as the quality gate between the pipeline's processing levels and the platform's decision and action layers. Trinity Gate checkpoints are positioned at three critical points within the pipeline.

The first checkpoint occurs at the transition from L7 to L8, verifying that confidence computations are structurally consistent (the belief network forms a valid directed acyclic graph), logically consistent (no unresolved contradictions violate logical rules), and formally sound (key assertions can be verified through [Lean4](/glossary/lean4/) proofs where applicable).

The second checkpoint occurs at the transition from L10 to L11, verifying that knowledge integration has not introduced inconsistencies into the persistent knowledge base and that updated beliefs maintain structural and logical coherence.

The third and most rigorous checkpoint occurs at L13, where final knowledge products must pass all four Trinity Gate layers before being classified as integrated knowledge. This checkpoint employs the full [QEVE](/glossary/qeve/) verification stack, including [formal verification](/glossary/formal-verification/) through Lean4, [Monte Carlo verification](/glossary/monte-carlo-verification/) for probabilistic claims, and [property-based testing](/glossary/property-based-testing/) for behavioral assertions.

Any failure at a Trinity Gate checkpoint causes the affected data to be returned to the appropriate upstream level with detailed failure annotations, enabling targeted re-processing rather than wholesale rejection.

## Data Flow Architecture

The pipeline's data flow follows a strict unidirectional progression with controlled feedback loops. The primary flow moves data from L0 through L13 and into the Meta and Consciousness levels. Feedback loops are permitted only under specific conditions: Trinity Gate failures trigger backward flow to the level responsible for the detected inconsistency, and Meta-level interventions may inject corrective signals at any level.

Data within the pipeline is represented using a uniform envelope structure that encapsulates the datum itself, its provenance chain, accumulated annotations from each level, confidence metadata, and routing information. This envelope grows as data progresses through levels, accumulating the epistemic history that enables full traceability from any output back to its raw inputs.

The pipeline supports both synchronous and asynchronous processing modes. Time-critical data (such as active threat indicators from [EASM](/glossary/easm/) scanners) is processed synchronously with minimal buffering at each level. Batch data (such as periodic compliance assessments) is processed asynchronously with optimized throughput. The [SEADF](/glossary/seadf/) framework manages scheduling and resource allocation across both modes.

Parallelism is achieved at the signal level: independent signals may be processed concurrently through the pipeline, with synchronization points at L4 (where correlation requires access to multiple signals) and L6 (where contradiction identification requires a complete view of the current signal set). This design leverages the BEAM virtual machine's lightweight process model, with each signal potentially handled by a dedicated Erlang process under OTP supervision.

## Performance Characteristics

The pipeline is engineered for both throughput and latency, with different optimization strategies applied at different levels. Lower levels (L0-L3) are optimized for raw throughput, processing thousands of signals per second through parallel ingestion and extraction. Middle levels (L4-L8) trade some throughput for analytical depth, with configurable time budgets for correlation and pattern detection algorithms. Upper levels (L9-L13) prioritize correctness over speed, with Trinity Gate verification adding latency but ensuring that only epistemically sound knowledge reaches the output.

End-to-end latency for a single signal traversing all 16 levels ranges from milliseconds (for signals that match known patterns and encounter no contradictions) to minutes (for signals that trigger deep correlation analysis and formal verification). The Meta level continuously monitors latency distributions and triggers alerts when processing times exceed level-specific thresholds.

The platform's O(1) pattern detection capability, achieved through AST-indexed semantic search, provides 90-250x speedup at L5 compared to naive pattern matching, ensuring that pattern detection does not become a bottleneck even as the platform's pattern library grows. Storage efficiency is maintained through the [ETS](/glossary/ets/)-backed caching at hot levels and PostgreSQL persistence for long-term knowledge storage.

## Integration with Platform Systems

The Epistemic Pipeline does not operate in isolation. It integrates deeply with every major subsystem of the Prismatic Platform.

The [Color Teams](/glossary/color-teams/) security operations leverage the pipeline extensively. The [Red Team](/glossary/red-team/) injects adversarial signals at L0 to test the pipeline's resilience to epistemic attacks. The [Blue Team](/glossary/blue-team/) monitors pipeline health through the Meta level and implements defensive measures at L2 and L6. The [Gray Team](/glossary/gray-team/) explores boundary conditions at each level to identify specification gaps. The [Purple Team](/glossary/purple-team/) synthesizes Red-Blue findings into pipeline improvements. The [White Team](/glossary/white-team/) verifies pipeline invariants through formal methods applied at Trinity Gate checkpoints.

The [AIAD](/glossary/aiad/) agent framework routes all agent outputs through the pipeline, ensuring that agent-generated knowledge meets the same epistemic standards as externally sourced data. Agent reports enter at L0, and agents may consume pipeline outputs at any level appropriate to their function.

The [Quality Gates](/glossary/quality-gates/) system and [Quality DNA](/glossary/quality-dna/) framework draw on pipeline metrics (particularly Meta-level assessments) to maintain platform-wide quality standards. The [3NL Framework](/glossary/three-nl/) provides the meta-linguistic foundation for expressing pipeline operations at increasing levels of abstraction, from concrete signal processing to abstract epistemic reasoning.

The [SEADF](/glossary/seadf/) subsystem's seven components -- Scanner, Pipeline, Quality Guardian, Knowledge Sync, Cross-Domain Innovator, Autonomous Reporter, and Enhanced Healing -- all interact with the Epistemic Pipeline. The SEADF Pipeline component manages the physical execution of the Epistemic Pipeline's logical levels, while the Quality Guardian monitors compliance with [NM/ND](/glossary/nm-nd/) doctrine throughout processing.

## Related Terms

- [NABLA Infinity](/glossary/nabla-infinity/) -- The seven non-negotiable epistemic axioms enforced at every pipeline level
- [Trinity Gate](/glossary/trinity-gate/) -- Four-layer verification system at critical pipeline checkpoints
- [Belief Graph](/glossary/belief-graph/) -- Graph structure updated by L4 correlation and L10 knowledge integration
- [QEVE](/glossary/qeve/) -- Verification engine combining Lean4, NABLA, and Monte Carlo methods at Trinity Gate
- [Confidence Threshold](/glossary/confidence-threshold/) -- Tau values governing transitions between exploration and execution
- [Confidence Scoring](/glossary/confidence-scoring/) -- Quantitative scoring methodology applied at L7
- [Signal Plurality](/glossary/signal-plurality/) -- NABLA axiom requiring multiple independent signals, enforced at L3 and L7
- [Contradiction Preservation](/glossary/contradiction-preservation/) -- NABLA axiom preventing epistemic cherry-picking, primary enforcement at L6
- [Time Decay](/glossary/time-decay/) -- NABLA axiom mandating temporal awareness, enforced from L0 onward
- [Provenance Mandatory](/glossary/provenance-mandatory/) -- NABLA axiom requiring full traceability at every level
- [Cherry-Picking](/glossary/cherry-picking/) -- Forbidden anti-pattern that the pipeline's architecture is designed to prevent
- [Entity Resolution](/glossary/entity-resolution/) -- Algorithm family employed at L4 for signal correlation
- [Formal Verification](/glossary/formal-verification/) -- Lean4-based proof verification at Trinity Gate checkpoints
- [Monte Carlo Verification](/glossary/monte-carlo-verification/) -- Probabilistic verification method for stochastic claims
- [Property-Based Testing](/glossary/property-based-testing/) -- Behavioral verification at Trinity Gate
- [Consciousness Traits](/glossary/consciousness-traits/) -- 11 emergent properties tracked at the pipeline's apex level
- [Fitness Score](/glossary/fitness-score/) -- Quantitative measure of platform evolution, currently 0.999 at Generation 18
- [Agent](/glossary/agent/) -- Autonomous processing units whose outputs flow through the pipeline
- [AIAD](/glossary/aiad/) -- Agent framework standard governing pipeline integration
- [Color Teams](/glossary/color-teams/) -- Security operations that stress-test and defend the pipeline
- [Quality Gates](/glossary/quality-gates/) -- Platform-wide quality enforcement drawing on pipeline metrics
- [Quality DNA](/glossary/quality-dna/) -- Cross-session quality continuity informed by pipeline health
- [SEADF](/glossary/seadf/) -- Framework managing pipeline execution and monitoring
- [3NL Framework](/glossary/three-nl/) -- Meta-linguistic foundation for pipeline abstraction levels
- [NM/ND](/glossary/nm-nd/) -- Doctrine governing the exploration-to-execution transition at L12
- [Lean4](/glossary/lean4/) -- Formal proof assistant used in Trinity Gate verification
- [Audit Trail](/glossary/audit-trail/) -- Immutable record of all pipeline operations and knowledge modifications
- [Epistemic Robustness](/glossary/epistemic-robustness/) -- Measure of the pipeline's resilience to adversarial and degraded inputs
- [EASM](/glossary/easm/) -- External Attack Surface Management, a primary data source entering at L0

## See Also

- [Architecture](/architecture/) -- Platform architecture overview including pipeline placement
- [Technologies](/technologies/) -- Technology stack powering pipeline implementation
- [Capabilities](/capabilities/) -- Platform capabilities enabled by the pipeline

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)