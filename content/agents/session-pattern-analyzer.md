+++
title = "session-pattern-analyzer"
weight = 372
[extra]
domain = "session-intelligence"
level = "L3"
description = "Analyzes recurring patterns across development sessions to identify improvement opportunities and systemic issues"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "kuzudb", "postgresql", "no-doubts", "seadf", "telemetry"]
domain_normalized = "intelligence"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["session-pattern-analyzer", "Analyzes", "agents", "agent", "Prismatic Platform", "SEADF", "Quality", "Pattern", "NABLA Infinity"]
tags = ["agents", "agent", "session-pattern-analyzer", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "session-pattern-analyzer - Prismatic Platform"
+++

## Overview

The session-pattern-analyzer operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's session-intelligence domain, responsible for identifying recurring patterns, systemic issues, and improvement opportunities across the platform's development session history. While individual sessions focus on specific tasks, the pattern analyzer examines the aggregate behavior across many sessions to reveal higher-order patterns that are invisible at the individual session level -- recurring bug categories, frequently modified file clusters, decision patterns, and productivity bottlenecks.

Built on the [AIAD](@/glossary/aiad.md) standard and applying [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic rigor, the pattern analyzer treats session data as an intelligence source that, when properly analyzed, yields actionable insights for platform improvement. The agent applies techniques from pattern recognition, statistical analysis, and temporal sequence analysis to extract meaningful signals from the noise of daily development activities. The [Trinity Gate](@/glossary/trinity-gate.md) ensures that identified patterns are structurally consistent, logically coherent, and formally validated before being reported as findings.

## Operational Domain

The session-intelligence domain for pattern analysis spans the complete session context archive -- every debrief document, quality metric snapshot, file modification record, and decision log generated across the platform's development history. The analyzer processes this corpus to identify patterns across multiple dimensions: temporal patterns (recurring issues at specific times), structural patterns (related changes that frequently co-occur), behavioral patterns (developer workflow characteristics), and quality patterns (recurring quality degradation categories).

The domain extends to correlating session patterns with external factors such as platform version changes, dependency updates, and infrastructure modifications. When a pattern of increased debugging sessions correlates with a specific dependency upgrade, the analyzer can identify the causal link.

## Key Capabilities

- **Temporal pattern detection** -- Identifies recurring patterns in session timing, duration, and content. For example, detecting that quality regression sessions cluster after major feature deployments or that certain types of bugs recur on specific weekly cycles
- **File co-modification analysis** -- Discovers clusters of files that are frequently modified together across sessions, revealing hidden coupling that may indicate architectural debt or missing abstractions
- **Bug pattern classification** -- Categorizes bugs encountered across sessions to identify systemic root causes. When the same category of bug recurs despite individual fixes, the analyzer flags this as a systemic issue requiring architectural intervention
- **Decision pattern tracking** -- Analyzes decision patterns across sessions to identify decision reversals, indecision cycles, and areas where decisions are frequently revisited, suggesting unclear requirements or insufficient analysis
- **Productivity bottleneck identification** -- Identifies workflow patterns that consume disproportionate session time, flagging areas where tooling improvements, documentation, or architectural changes could improve development velocity
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with triggered analysis when new session data becomes available
- **[SEADF](@/glossary/seadf.md) integration** for feeding pattern insights into evolutionary improvement cycles

## Pattern Categories

The analyzer classifies identified patterns into categories that determine their handling and response.

| Category | Description | Response | Example |
|----------|-------------|----------|---------|
| **Systemic Bug** | Same bug category recurs across multiple sessions | Architectural review | Repeated `nil` access in same module family |
| **Coupling Signal** | Files consistently modified together | Refactoring proposal | `router.ex` and `templates/` always co-change |
| **Quality Drift** | Gradual degradation in quality metric | Evolution trigger | Typespec coverage declining 0.5% per session |
| **Decision Oscillation** | Decisions repeatedly made and reversed | Requirements clarification | Feature toggle pattern changes each session |
| **Productivity Sink** | Disproportionate time spent on specific tasks | Tooling improvement | Manual test data setup consuming 30% of session time |
| **Recovery Pattern** | Sessions frequently begin by fixing previous session's issues | Process improvement | Post-deploy fix sessions recurring weekly |

## Analysis Techniques

The pattern analyzer employs several analytical techniques adapted for session data.

| Technique | Application | Output |
|-----------|-------------|--------|
| **Frequency analysis** | Count occurrences of events, changes, decisions | Hot spots, recurring issues |
| **Sequence mining** | Identify common sequences of session activities | Workflow patterns, process bottlenecks |
| **Cluster analysis** | Group similar sessions by content and outcomes | Session type taxonomy |
| **Trend detection** | Identify directional changes in metrics over time | Quality trends, velocity changes |
| **Correlation analysis** | Find relationships between session attributes | Causal hypotheses for investigation |
| **Anomaly detection** | Identify sessions that deviate from established patterns | Unusual events requiring attention |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination authority for cross-session pattern analysis with the ability to access session data from any domain and produce findings that inform platform-wide improvement strategies.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/session patterns` | Display identified patterns across recent sessions | L3+ |
| `/session patterns --scope <domain>` | Analyze patterns within a specific domain | L3+ |
| `/session hotspots` | Show frequently modified file clusters and coupling analysis | L2+ |
| `/session bugs` | Display recurring bug pattern analysis | L2+ |
| `/session productivity` | Show productivity bottleneck analysis | L2+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [session-context-coordinator](@/agents/session-context-coordinator.md) | Provides coordinated context data for pattern analysis input |
| [session-context-synthesizer](@/agents/session-context-synthesizer.md) | Synthesis and pattern analysis share analytical techniques |
| [session-debrief-specialist](@/agents/session-debrief-specialist.md) | Debriefs provide the structured data that pattern analysis consumes |
| [seadf-ecosystem-commander](@/agents/seadf-ecosystem-commander.md) | Pattern findings drive SEADF evolution priorities |
| [code-quality-commander](@/agents/code-quality-commander.md) | Quality patterns inform quality improvement strategies |

## Reporting and Visualization

Pattern analysis results are reported in formats suitable for both automated consumption (JSON for SEADF integration) and human review (structured Markdown for session context).

| Report Type | Format | Audience | Update Frequency |
|-------------|--------|----------|-----------------|
| **Pattern Summary** | Markdown | Session start context | Weekly |
| **Hot Spot Map** | Table with metrics | Architectural review | Monthly |
| **Trend Dashboard** | Metric time series | Quality monitoring | Per session |
| **Bug Taxonomy** | Classified hierarchy | Development planning | Bi-weekly |
| **SEADF Feed** | JSON | Evolution pipeline | Per session |

## Epistemic Rigor

Pattern analysis is subject to the same epistemic standards as all platform intelligence. Identified patterns must satisfy [NABLA Infinity](@/glossary/nabla-infinity.md) axioms.

| Axiom | Application to Pattern Analysis |
|-------|--------------------------------|
| **Signal Plurality** | Pattern must appear in 3+ sessions to be reported as established |
| **Contradiction Preservation** | Conflicting patterns are both reported, not selectively filtered |
| **Time Decay** | Pattern relevance decays with age; recent patterns weighted higher |
| **Source Independence** | Patterns from independent session clusters weighted higher |
| **Provenance Mandatory** | Every pattern finding cites specific source sessions |

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine requires that identified systemic patterns receive appropriate attention. Recurring bug patterns trigger mandatory architectural review. Quality drift patterns trigger SEADF healing cycles. Productivity sink patterns trigger tooling improvement proposals. No pattern finding may be dismissed without documented justification, and all pattern analysis maintains full provenance trails per [NABLA Infinity](@/glossary/nabla-infinity.md) requirements.

## Related Agents

Agents in the **session-intelligence** domain collaborate with the session-pattern-analyzer to transform raw session data into actionable intelligence. The analyzer ensures that the platform learns from its own development history, identifying systemic issues that no individual session could reveal and driving continuous improvement through evidence-based pattern recognition.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)