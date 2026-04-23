+++
title = "epistemic-graph-specialist"
weight = 152
[extra]
domain = "primary-producer"
level = "L3"
description = "Expert in epistemic reasoning, temporal decay, and graph-based knowledge systems"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "nabla-infinity", "telemetry", "phoenix", "no-mercy"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1950
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["epistemic-graph-specialist", "Expert", "agents", "agent", "Prismatic Platform", "Specialist", "The Epistemic"]
tags = ["agents", "agent", "epistemic-graph-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "epistemic-graph-specialist - Prismatic Platform"
+++

## Overview

The Epistemic Graph Specialist operates as an L3 strategic command agent within the Primary Producer domain of the Prismatic Platform. This agent provides deep expertise in epistemic reasoning, temporal decay modeling, and graph-based knowledge representation systems. It manages the platform's belief networks -- directed acyclic graphs (DAGs) where nodes represent claims, edges represent evidential support relationships, and edge weights encode confidence levels that decay over time. This graph-based approach to knowledge management is central to the platform's [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, where every belief must be traceable to its evidential foundation.

The platform operates in an environment where intelligence findings, compliance assessments, and quality measurements are all claims about the world that may become stale, may be contradicted by new evidence, or may depend on other claims that have been invalidated. The Epistemic Graph Specialist maintains the structural integrity of the belief network that underpins all platform decisions. When an evidence source is discredited, every downstream claim that depended on it must be re-evaluated. When new evidence arrives, it must be integrated into the existing belief network without creating cycles or inconsistencies. This is graph maintenance at the epistemological level.

The agent is part of the platform's 430-strong autonomous agent ecosystem, built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. It operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine -- for epistemic graph operations, NO DOUBTS is particularly critical: every modification to the belief network must be justified by evidence, and every query against the network must reflect the current state of confidence including temporal decay effects.

## Operational Domain

The Primary Producer domain encompasses agents that provide core platform functionality. The Epistemic Graph Specialist provides the knowledge infrastructure that intelligence, compliance, and quality agents depend upon. When the Email Intelligence Specialist produces a finding, it is registered as a node in the epistemic graph with provenance edges linking it to its source data. When the Employee Screening Specialist produces a risk score, the contributing factors are represented as nodes with weighted edges reflecting their influence on the score. The graph structure makes all these relationships explicit, queryable, and auditable.

## Key Capabilities

The Epistemic Graph Specialist provides six core capabilities for managing graph-based knowledge systems.

**Belief network construction** builds DAG structures from evidence inputs, creating nodes for claims and edges for evidential relationships. Each node carries metadata including creation timestamp, source attribution, confidence level, and classification (observation, inference, or assumption). Each edge carries metadata including relationship type (supports, contradicts, depends-on), weight, and the reasoning that established the relationship. Network construction validates structural integrity: no cycles, no orphaned claims, and no claims without provenance.

**Temporal decay modeling** applies time-based confidence degradation to beliefs in the network. Intelligence findings become less reliable over time -- a company registration check performed six months ago may not reflect current ownership. The specialist implements configurable decay functions (linear, exponential, step) for different claim types, automatically reducing confidence levels as time passes since the evidence was collected. Claims that decay below configurable thresholds trigger re-verification workflows.

**Contradiction management** implements the NABLA [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom by maintaining both sides of contradictory evidence rather than discarding either. When new evidence contradicts existing beliefs, the specialist creates contradiction edges that link conflicting claims, preserving both with their respective confidence levels and provenance chains. Resolution of contradictions requires explicit investigation rather than automatic suppression of lower-confidence claims.

**Graph query optimization** provides efficient traversal and query capabilities over the belief network, enabling agents to query for belief status, evidence chains, dependency analysis, and impact assessment. The specialist maintains graph indexes that support common query patterns: "what evidence supports this claim?", "what claims depend on this evidence?", "what would be affected if this source were invalidated?", and "what is the current confidence in this claim accounting for temporal decay?".

**Provenance chain validation** verifies that every claim in the belief network has a complete, valid provenance chain tracing back to primary evidence. Provenance validation runs as a continuous background process, identifying claims that have lost their provenance (source data deleted, links broken, upstream claims invalidated) and flagging them for investigation. This enforcement implements the NABLA Provenance Mandatory axiom.

**Impact propagation analysis** calculates the downstream effects of changes to belief network nodes. When evidence is updated, invalidated, or its confidence changes, the specialist propagates these changes through the dependency graph, recalculating confidence levels for all affected downstream claims. This propagation ensures that the entire belief network reflects the current state of evidence, preventing stale high-confidence claims from persisting after their supporting evidence has been undermined.

## Graph Data Model

The epistemic graph uses a structured data model stored in [KuzuDB](@/glossary/kuzudb.md) for efficient graph operations.

| Element | Properties | Example |
|---------|-----------|---------|
| Claim Node | id, type, confidence, timestamp, source, decay_function | "Company X is registered in ARES" |
| Evidence Edge | type, weight, reasoning, timestamp | "Supports with weight 0.95" |
| Contradiction Edge | type, claim_a, claim_b, detected_at | "Contradicts: different registration dates" |
| Provenance Chain | source_node, claim_node, intermediaries | "ARES API -> extraction -> normalization -> claim" |

## Temporal Decay Configuration

Different claim types use different decay profiles reflecting their expected validity periods.

| Claim Type | Decay Function | Half-Life | Minimum Threshold |
|-----------|---------------|-----------|-------------------|
| Registry data | Linear | 90 days | 0.3 |
| Sanction list status | Step | 30 days | 0.1 |
| Social media profile | Exponential | 60 days | 0.2 |
| Court record | Linear | 180 days | 0.4 |
| Security scan result | Exponential | 7 days | 0.1 |
| Domain registration | Linear | 365 days | 0.5 |

## Authority Level

**L3** - Strategic Command - The Epistemic Graph Specialist operates at the strategic command level with authority to manage the platform's belief network structure, enforce epistemic standards, and coordinate with intelligence and compliance agents on evidence integration.

## Integration Architecture

| Component | Relationship | Purpose |
|-----------|-------------|---------|
| Prismatic Core | Central coordination | Belief network queries from platform components |
| [Prismatic Web](@/glossary/prismatic-web.md) | Visualization | Graph visualization in [LiveView](@/glossary/liveview.md) dashboards |
| AIAD Commands | Command dispatch | Belief query and evidence registration commands |
| [KuzuDB](@/glossary/kuzudb.md) | Graph storage | Persistent graph storage with efficient traversal |
| [NABLA Infinity](@/glossary/nabla-infinity.md) | Epistemic framework | Axiom compliance enforcement |
| [Trinity Gate](@/glossary/trinity-gate.md) | Validation | Structural, logical, and formal consistency checking |

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [evidence-enforcement-agent](@/agents/evidence-enforcement-agent.md) | Quality partner | Validates that evidence entering the graph meets platform standards |
| [formal-validator](@/agents/formal-validator.md) | Formal verification | Provides Lean4 proofs for critical graph properties |
| [blue-signal-aggregator](@/agents/blue-signal-aggregator.md) | Signal input | Aggregated defensive signals feed into the belief network |

## Enforcement

The Epistemic Graph Specialist operates under [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Claims without provenance chains are rejected from the belief network. Temporal decay is applied without exception -- no claim retains its original confidence indefinitely. Contradictions are preserved, never suppressed. Graph integrity violations (cycles, orphaned nodes, broken provenance) trigger immediate investigation and remediation. All graph modifications are logged with full audit trail for accountability.

## Related Agents

- [**evidence-enforcement-agent**](@/agents/evidence-enforcement-agent.md) (L3) - Evidence quality enforcement and formal validation
- [**formal-validator**](@/agents/formal-validator.md) (L3) - Formal proofs for graph structural properties
- [**blue-signal-aggregator**](@/agents/blue-signal-aggregator.md) (L2) - Cross-domain signal correlation feeding the belief network

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)