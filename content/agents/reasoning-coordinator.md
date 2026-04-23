+++
title = "reasoning-coordinator"
weight = 337
[extra]
domain = "general"
level = "L3"
description = "Central orchestrator for the NABLA Reasoning System, coordinating probabilistic, logical, and formal verification reasoning across specialized agents"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "nabla-infinity", "telemetry", "trinity-gate"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2150
quality_score = 84
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["reasoning-coordinator", "Central", "NABLA", "Reasoning", "System", "agents", "agent", "Prismatic Platform", "NABLA Infinity"]
tags = ["agents", "agent", "reasoning-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "reasoning-coordinator - Prismatic Platform"
+++

## Overview

The reasoning-coordinator operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform, serving as the central orchestrator for the [NABLA Infinity](@/glossary/nabla-infinity.md) Reasoning System. This agent coordinates probabilistic, logical, and [formal verification](@/glossary/formal-verification.md) reasoning across specialized agents, implementing a multi-paradigm reasoning architecture that synthesizes diverse epistemic approaches into coherent, evidence-grounded conclusions. Rather than relying on a single reasoning methodology, the coordinator dispatches reasoning tasks to the most appropriate paradigm -- or multiple paradigms simultaneously -- and reconciles their outputs into unified assessments with quantified confidence.

The Prismatic Platform's reasoning infrastructure recognizes that different problem classes demand different reasoning approaches. Statistical correlations require probabilistic inference, rule compliance requires logical deduction, and safety-critical properties require formal proof. The reasoning-coordinator manages these paradigm boundaries, routing reasoning requests to appropriate specialists, detecting when multiple paradigms should be engaged for cross-validation, and synthesizing multi-paradigm results into actionable conclusions that carry explicit epistemic provenance.

Built on the [AIAD](@/glossary/aiad.md) standard and governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine, this agent ensures that no reasoning conclusion is accepted without adequate epistemic support. The [Trinity Gate](@/glossary/trinity-gate.md) serves as the final validation checkpoint: structural consistency (graph theory), logical consistency (rule-based), and formal necessity (modal logic) must all pass before a reasoning conclusion enters the platform's decision-support infrastructure.

## Multi-Paradigm Reasoning Architecture

The reasoning-coordinator manages three primary reasoning paradigms, each implemented by specialized agent clusters. The **probabilistic reasoning** paradigm handles uncertainty quantification, Bayesian inference, and statistical pattern recognition. When evidence is incomplete or noisy -- which is the default condition in real-world intelligence analysis -- probabilistic reasoning provides calibrated confidence assessments that accurately reflect the strength of available evidence.

The **logical reasoning** paradigm applies rule-based deduction, constraint satisfaction, and ontological inference. This paradigm excels at compliance checking, policy enforcement, and systematic analysis where clear rules govern correct conclusions. Regulatory compliance assessment, for example, maps regulatory requirements against observable controls using logical rules that produce deterministic compliance determinations.

The **formal verification** paradigm employs [Lean4](@/glossary/lean4.md) theorem proving, model checking, and mathematical proof construction. This paradigm provides the highest assurance level but applies to a narrower class of problems. Safety-critical platform properties, agent behavioral invariants, and epistemic system soundness claims undergo formal verification to achieve mathematical certainty rather than mere empirical confidence.

The coordinator's primary architectural contribution is managing the interfaces between these paradigms. When a reasoning request arrives, the coordinator classifies it, determines which paradigm or combination of paradigms should be engaged, dispatches subtasks to specialized agents, collects results, and synthesizes them into a unified response. Cross-paradigm validation -- where multiple paradigms independently analyze the same question -- provides the strongest epistemic assurance, as agreement across fundamentally different reasoning methods indicates robust conclusions.

## Key Capabilities

- **Reasoning task classification** -- Analyzes incoming reasoning requests to determine optimal paradigm assignment, considering problem structure, required assurance level, available evidence characteristics, and time constraints
- **Multi-paradigm dispatch** -- Routes reasoning subtasks to probabilistic, logical, and formal verification specialist agents, managing parallel execution and result collection across paradigm boundaries
- **Cross-paradigm synthesis** -- Reconciles outputs from multiple reasoning paradigms into unified conclusions, identifying agreements that strengthen confidence and disagreements that require investigation
- **Confidence calibration** -- Ensures that confidence scores attached to reasoning conclusions accurately reflect the epistemic support provided by the underlying evidence and reasoning methodology
- **Trinity Gate coordination** -- Manages the three-layer validation process (structural, logical, formal) that reasoning conclusions must pass before entering the platform's decision-support infrastructure
- **Reasoning provenance tracking** -- Maintains complete audit trails from raw evidence through reasoning steps to final conclusions, enabling retrospective analysis of reasoning quality and identification of systematic biases
- **Paradigm escalation management** -- Detects when initial reasoning paradigm assignment is insufficient and escalates to more rigorous paradigms, particularly formal verification for safety-critical conclusions
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed reasoning pipeline optimization and paradigm performance monitoring

## Reasoning Pipeline

The reasoning pipeline follows a structured flow from request intake through conclusion delivery. Upon receiving a reasoning request, the coordinator performs **intake classification**, analyzing the request structure, required assurance level, and available evidence to determine the appropriate reasoning approach. Requests are categorized by problem type (inference, verification, optimization, classification), assurance level (exploratory, standard, critical, safety-critical), and paradigm affinity (probabilistic, logical, formal, multi-paradigm).

During the **dispatch phase**, the coordinator creates reasoning subtasks and routes them to appropriate specialist agents. For multi-paradigm requests, subtasks are dispatched in parallel to maximize throughput. Each specialist agent operates within its paradigm's methodology, producing results with paradigm-specific confidence measures and provenance chains.

The **synthesis phase** reconciles results from all engaged paradigms. When paradigms agree, confidence is reinforced. When paradigms disagree, the coordinator applies the [NABLA Infinity](@/glossary/nabla-infinity.md) [contradiction preservation](@/glossary/contradiction-preservation.md) axiom: both conclusions are preserved with their respective reasoning chains, and the disagreement is explicitly surfaced rather than hidden behind a false consensus.

The **validation phase** subjects the synthesized conclusion to [Trinity Gate](@/glossary/trinity-gate.md) verification. All three gates -- structural consistency, logical consistency, and formal necessity -- must pass at thresholds appropriate to the request's assurance level before the conclusion is delivered.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to orchestrate reasoning operations across all paradigm specialists, set reasoning pipeline parameters, and publish validated reasoning conclusions.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/reason query` | Submit a reasoning request with specified assurance level | L3+ |
| `/reason status` | Display current reasoning pipeline status and pending operations | L3+ |
| `/reason audit` | Generate reasoning quality audit for recent conclusions | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [recursive-optimizer](@/agents/recursive-optimizer.md) | Optimizes reasoning pipeline patterns through execution trace analysis |
| [white-verifier-commander](@/agents/white-verifier-commander.md) | Formal verification paradigm is implemented by the White Team verification infrastructure |
| [purple-coordinator](@/agents/purple-coordinator.md) | Reasoning synthesis aligns with Purple Team epistemic closure methodology |
| [blue-signal-aggregator](@/agents/blue-signal-aggregator.md) | Signal aggregation feeds evidence into the probabilistic reasoning pipeline |

## Performance Characteristics

Reasoning pipeline performance varies by paradigm and request complexity. Probabilistic reasoning typically completes in milliseconds to seconds, logical reasoning in seconds to minutes, and formal verification in minutes to hours depending on proof complexity. The coordinator manages these asymmetric timelines through timeout policies and progressive delivery -- providing preliminary probabilistic results quickly while formal verification continues in the background.

Pipeline throughput scales horizontally through the BEAM's process model. Each reasoning request spawns isolated processes for paradigm-specific subtasks, and the coordinator manages concurrent request pipelines without shared mutable state. Back-pressure mechanisms prevent pipeline overload when formal verification tasks accumulate.

## Enforcement

All reasoning conclusions are held to the [NO MERCY](@/glossary/no-mercy.md) standard: incomplete reasoning chains are rejected, unsupported confidence claims are blocked, and reasoning that bypasses paradigm-appropriate validation is prohibited. The [NO DOUBTS](@/glossary/no-doubts.md) principle mandates that every conclusion carries traceable provenance from evidence through reasoning steps to final determination. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework governs the entire reasoning process, with particular emphasis on [signal plurality](@/glossary/signal-plurality.md) (no conclusion from a single evidence source), [contradiction preservation](@/glossary/contradiction-preservation.md) (disagreements are surfaced, not hidden), and [provenance mandatory](@/glossary/provenance-mandatory.md) (every step is traceable).

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)