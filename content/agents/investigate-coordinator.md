+++
title = "investigate-coordinator"
weight = 214
[extra]
domain = "intelligence"
level = "L3"
description = "Central investigation hub with intelligent subject detection and automated agent routing"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "kuzudb", "postgresql", "no-doubts", "telemetry", "ecto"]
domain_normalized = "intelligence"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["investigate-coordinator", "Central", "agents", "agent", "Prismatic Platform", "Investigation", "KuzuDB"]
tags = ["agents", "agent", "investigate-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "investigate-coordinator - Prismatic Platform"
+++

## Overview

The investigate-coordinator serves as the central orchestration hub for all intelligence investigation workflows within the Prismatic Platform. Operating at L3 [Strategic Command](@/glossary/strategic-command.md) authority, this agent receives investigation requests, analyzes the subject type through intelligent detection heuristics, and routes the investigation to the most appropriate specialist agents across the platform's intelligence domain. It functions as the single entry point for investigative operations, abstracting away the complexity of agent selection and workflow composition from the requesting user or system.

Built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard, the investigate-coordinator embodies the principle that effective intelligence operations require not just data collection but intelligent orchestration. The agent determines whether an investigation target is a person, organization, domain, email address, IP address, or other entity type, then constructs a tailored investigation pipeline drawing from the platform's 121+ [OSINT](@/glossary/osint.md) providers. Every investigation operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine, ensuring complete execution of all investigation phases without shortcuts and evidence-based conclusions grounded in the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework.

## Architectural Role

The investigate-coordinator occupies a critical position in the platform's intelligence architecture, serving as the bridge between user intent and the complex ecosystem of specialist intelligence agents. When a user issues an investigation command, the coordinator performs several essential functions before any data collection begins.

First, the coordinator applies subject detection algorithms to classify the investigation target. A string that matches email patterns triggers email-focused intelligence pipelines. Domain names activate infrastructure and DNS analysis chains. Person names invoke identity verification and social media scanning workflows. Organization names launch corporate intelligence and registry analysis operations. This classification step is essential because different subject types require fundamentally different intelligence collection strategies, provider selections, and analysis methodologies.

Second, the coordinator constructs a directed acyclic graph (DAG) of investigation tasks, respecting dependencies between intelligence collection phases. For example, domain WHOIS data must be collected before registrant-based person investigations can begin, and email address discovery must precede email intelligence operations. This dependency-aware scheduling ensures that downstream agents receive the prerequisite data they need while maximizing parallel execution of independent collection tasks.

Third, the coordinator manages the investigation lifecycle from initiation through completion, tracking progress across all delegated agents, handling timeouts and failures through retry and fallback mechanisms, and assembling the final intelligence report from individual agent contributions.

## Key Capabilities

- **Intelligent subject detection** -- Automatically classifies investigation targets into entity types (person, organization, domain, email, IP address, phone number, cryptocurrency address) using pattern matching, heuristic analysis, and contextual clues from the investigation request
- **Automated agent routing** -- Maps detected subject types to optimal specialist agent combinations, constructing investigation pipelines tailored to each target's characteristics and the requested depth of analysis
- **Multi-source intelligence correlation** -- Aggregates findings from multiple specialist agents and [OSINT](@/glossary/osint.md) providers, performing cross-reference analysis to identify corroborating evidence and contradictions across sources
- **Investigation lifecycle management** -- Tracks investigation progress through initiation, collection, analysis, and reporting phases with real-time status updates and failure recovery
- **Evidence-grade reporting** -- Produces structured intelligence reports with [confidence scoring](@/glossary/confidence-scoring.md) and full provenance tracking for every claim and data point
- **Depth-configurable investigations** -- Supports investigation depth levels from quick surface scans to comprehensive deep-dive analyses, adjusting provider selection and analysis thoroughness accordingly
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-healing capabilities for investigation pipeline recovery
- **[Platform-wide telemetry integration](@/capabilities/telemetry-integration.md)** for investigation performance monitoring and optimization

## Subject Detection Engine

The subject detection engine represents one of the coordinator's most sophisticated components. Rather than requiring users to specify the type of entity they wish to investigate, the coordinator infers this from the input itself, applying a cascade of detection strategies.

Pattern-based detection handles unambiguous cases: email addresses, IP addresses (both IPv4 and IPv6), domain names, phone numbers in international format, and cryptocurrency wallet addresses all have distinctive syntactic patterns that enable reliable classification. For these cases, detection confidence approaches 1.0 and the coordinator proceeds directly to agent routing.

For ambiguous inputs such as names and organization titles, the coordinator employs contextual analysis. It queries the platform's [KuzuDB](@/glossary/kuzudb.md) graph database to check whether the input matches known entities, examines linguistic features to distinguish person names from organization names (capitalization patterns, legal entity suffixes like "Ltd" or "s.r.o.", presence of given-name/surname structures), and considers any metadata provided alongside the investigation request. When ambiguity persists, the coordinator may launch parallel investigation tracks for multiple interpretations, converging on the correct classification as early results arrive.

The detection engine is extensible by design. New entity types can be added through the [AIAD](@/glossary/aiad.md) agent specification system, with each new type defining its detection patterns, associated specialist agents, and investigation workflow templates.

## Investigation Workflow Architecture

Investigation workflows follow a structured pipeline model with four primary phases. The intake phase receives the investigation request, applies subject detection, and validates that the requested investigation scope is authorized for the requesting user's access level. The collection phase dispatches specialist agents to gather raw intelligence from their respective source domains. The analysis phase applies cross-reference correlation, entity resolution, timeline reconstruction, and anomaly detection to the collected data. The reporting phase synthesizes findings into structured intelligence products with confidence scores and provenance metadata.

Each phase is implemented as a set of [GenStage](@/glossary/genstage.md) stages, enabling backpressure-aware processing that prevents investigation pipelines from overwhelming downstream systems during high-throughput operation. The coordinator monitors stage throughput and adjusts concurrency limits dynamically based on current system load and provider rate limits.

For complex investigations involving multiple entity types (for example, investigating an organization and all its key personnel), the coordinator constructs hierarchical workflow trees where parent investigations spawn child investigations, with results flowing upward through the tree for aggregation into the final report.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - The investigate-coordinator holds multi-domain coordination authority, enabling it to dispatch tasks to specialist agents across all intelligence subdomains. This authority level grants the coordinator permission to initiate investigations, allocate platform resources for intelligence collection, and publish intelligence products to authorized consumers. The L3 designation reflects the coordinator's role as a strategic orchestrator rather than a tactical collector.

## Integration Architecture

The investigate-coordinator integrates deeply with multiple platform subsystems to deliver comprehensive investigation capabilities.

| Component | Relationship |
|-----------|-------------|
| Prismatic OSINT | Intelligence data collection through 121+ provider integrations |
| [Prismatic Storage](@/glossary/prismatic-storage.md) | Evidence persistence via [Ecto](@/glossary/ecto.md) schemas and [PostgreSQL](@/glossary/postgresql.md) storage |
| [KuzuDB](@/glossary/kuzudb.md) | Graph-based entity storage and relationship querying |
| Report Synthesis | Intelligence report generation with structured formatting |
| [Trinity Gate](@/glossary/trinity-gate.md) | Epistemic validation of investigation conclusions |
| Prismatic Telemetry | Investigation performance metrics and pipeline monitoring |

The integration with KuzuDB is particularly significant. Investigation results are stored as graph entities with typed relationships, enabling subsequent investigations to discover connections to previously investigated entities. This cumulative intelligence model means that the platform's investigative capability improves with each completed investigation, as the knowledge graph grows richer and relationship patterns become more apparent.

## Command Interface

The coordinator exposes a streamlined command interface that abstracts investigation complexity.

| Command | Description | Authority |
|---------|-------------|-----------|
| `/investigate <subject>` | Launch auto-detected investigation on any subject | L3+ |
| `/investigate --type=person <name>` | Force person-type investigation | L3+ |
| `/investigate --type=org <name>` | Force organization-type investigation | L3+ |
| `/investigate --depth=deep <subject>` | Launch comprehensive deep-dive investigation | L3+ |
| `/investigate --status <id>` | Check investigation progress | L2+ |

## Coordination with Specialist Agents

The investigate-coordinator does not perform intelligence collection itself. Instead, it orchestrates a network of specialist agents, each optimized for specific intelligence domains.

| Agent | Relationship |
|-------|-------------|
| [**delta-force-specialist**](@/agents/delta-force-specialist.md) (L3) | Precision intelligence operations targeting specific high-value objectives with surgical data extraction |
| [**email-intelligence-specialist**](@/agents/email-intelligence-specialist.md) (L3) | Complete digital profile construction from email addresses through multi-source correlation |
| [**falcon-strike-specialist**](@/agents/falcon-strike-specialist.md) (L3) | Rapid deployment intelligence operations with real-time monitoring and aerial perspective analysis |
| [**linkedin-intelligence-specialist**](@/agents/linkedin-intelligence-specialist.md) (L3) | Professional network intelligence extraction and organizational structure mapping |
| [**reputation-risk-specialist**](@/agents/reputation-risk-specialist.md) (L3) | Reputation assessment and risk evaluation for investigated entities |

## Epistemic Framework

All investigation conclusions produced by the coordinator are subject to the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework. The signal plurality axiom requires that no investigative claim rests on a single source -- every assertion must be corroborated by at least two independent data points. The contradiction preservation axiom ensures that when different sources provide conflicting information, both perspectives are preserved in the report rather than silently discarding the minority view. The provenance mandatory axiom guarantees that every data point in an investigation report is traceable to its original source, collection timestamp, and the agent that gathered it.

Investigation reports include explicit confidence scores for each finding, calculated from source reliability, corroboration depth, temporal freshness, and internal consistency. The [Trinity Gate](@/glossary/trinity-gate.md) validation ensures that investigation conclusions satisfy structural consistency (the relationship graph forms a valid DAG), logical consistency (no contradictory claims are presented as simultaneously true), and formal necessity (critical identity assertions are verified through multiple independent channels).

## Performance and Operational Metrics

The coordinator tracks comprehensive operational metrics through the platform's telemetry system. Key performance indicators include investigation completion time (P50 and P95), agent routing accuracy (percentage of cases where initial subject detection was correct), provider success rates (per-provider collection reliability), and report quality scores (based on evidence density and confidence distributions). These metrics feed into the [SEADF](@/glossary/seadf.md) autonomous evolution framework, enabling the coordinator to optimize its routing heuristics and workflow templates based on historical performance data.

## Enforcement

The investigate-coordinator operates under strict [NO MERCY](@/glossary/no-mercy.md) enforcement. Every investigation must complete all requested phases -- partial investigations are not delivered. Provider failures trigger automatic retries with exponential backoff, and persistent failures result in fallback to alternative providers rather than omission of that intelligence dimension. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that investigation findings are never presented without confidence qualifiers, and that uncertainty is explicitly acknowledged rather than hidden behind false certainty.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)