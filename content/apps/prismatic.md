+++
title = "Prismatic"
weight = 23
[extra]
category = "Core"
files = 1640
description = "Main platform application with OSINT, investigations, agents, and coordination"
status = "Active"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1144
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Main", "OSINT", "apps", "Core", "Prismatic Platform", "Quality", "Cross"]
tags = ["apps", "core", "prismatic"]
quality_score = 77
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic - Prismatic Platform"
+++

## Overview

Prismatic is the core component of the Prismatic Platform's [umbrella](/glossary/umbrella-application/) architecture. As the main application with 1,640 source files, it serves as the central coordination hub for [OSINT](/glossary/osint/) operations, investigation workflows, [agent](/glossary/agent/) orchestration, and cross-domain [intelligence fusion](/glossary/intelligence-fusion/). Every other application in the 99-app umbrella either depends on Prismatic for foundational services or coordinates through its public API.

The application embodies the platform's core philosophy: [OTP](/glossary/otp/)-first design with stateful processes, [supervision trees](/glossary/supervision-tree/) for fault tolerance, and pure functions at the computational boundaries. It houses the primary Mix tasks that drive platform operations, the facade modules that external applications consume, and the coordination logic that ties the entire ecosystem together.

As the largest application in the umbrella, Prismatic bears a unique architectural responsibility. It must provide stable, well-documented public APIs that dozens of downstream applications depend on, while continuously evolving to support new intelligence capabilities and operational workflows. This tension between stability and evolution is managed through a strict facade module pattern where public APIs are versioned and backward-compatible, while internal implementation details can change freely.

## Architecture

| Component | Description |
|-----------|-------------|
| **[Supervision Tree](/glossary/supervision-tree/)** | OTP [supervisor](/glossary/supervisor/) managing investigation workers, OSINT coordinators, and agent dispatchers |
| **Public API** | Facade modules exposing core functionality with [typespec](/glossary/typespec/) contracts |
| **Configuration** | Runtime configuration via `config/runtime.exs` with environment-specific overrides |
| **Tests** | Comprehensive test suite with [property-based testing](/glossary/property-based-testing/) and contract tests |
| **Quality DNA** | `.claude/quality-dna/current-state.json` for cross-session quality tracking |

## Core Responsibilities

### OSINT Coordination

Prismatic orchestrates open-source intelligence operations across 250+ providers with priority scheduling, deduplication, and result aggregation:

| Component | Purpose | Implementation |
|-----------|---------|---------------|
| **Provider Registry** | Catalog of all OSINT sources | [ETS](/glossary/ets/)-backed with hot reload |
| **Priority Scheduler** | Query prioritization and rate management | [GenServer](/glossary/behaviour/) with configurable policies |
| **Deduplication Engine** | Prevents redundant queries across providers | Content-hash based with TTL |
| **Result Aggregator** | Merges results from parallel provider queries | [NABLA](/glossary/nabla-infinity/)-compliant confidence fusion |
| **[Rate Limiter](/glossary/rate-limiting/)** | Per-provider request throttling | Token bucket with burst allowance |

The OSINT coordination layer manages the complexity of querying hundreds of intelligence sources with varying rate limits, response formats, and reliability characteristics. The Priority Scheduler uses a weighted scoring system that considers query urgency (investigation priority), source quality (historical accuracy and relevance), and cost (API credits or rate limit budget) to determine query ordering. This ensures that high-priority investigations receive intelligence data first, while routine monitoring operates within sustainable rate limit budgets.

```elixir
# OSINT coordination through Prismatic facade
{:ok, results} = Prismatic.investigate("example.com", [
  providers: [:shodan, :censys, :certificate_transparency],
  depth: 3,
  parallel: true,
  timeout: 30_000
])
```

### Investigation Workflows

End-to-end investigation lifecycle management from initial lead through evidence collection to final reporting:

```
Lead --> Triage --> Collection --> Analysis --> Correlation --> Report --> Archive
  |         |           |            |              |             |          |
Target   Priority   Multi-source  Pattern      Cross-domain  Structured  Long-term
Input    + Scope    OSINT Queries  Matching     Entity Links  Output      Storage
```

| Workflow Phase | Prismatic Module | Output |
|---------------|-----------------|--------|
| **Lead Triage** | `Prismatic.Investigations.Triage` | Prioritized investigation plan |
| **Collection** | `Prismatic.OSINT.Coordinator` | Raw intelligence from providers |
| **Analysis** | `Prismatic.Analysis.Engine` | Pattern matches and anomalies |
| **Correlation** | `Prismatic.Correlation.CrossDomain` | Linked entity profiles |
| **Reporting** | `Prismatic.Reports.Generator` | Structured intelligence reports |

The investigation workflow engine supports both fully automated and analyst-guided investigation modes. In automated mode, the system follows pre-defined investigation templates that specify which sources to query, what analysis to perform, and how to correlate results. In guided mode, analysts make decisions at each phase while the system handles the operational complexity of source queries, data normalization, and result aggregation.

### Agent Orchestration

Multi-agent task coordination with dependency resolution, parallel execution, and result aggregation:

| Orchestration Feature | Description | Scale |
|----------------------|-------------|-------|
| **Task Decomposition** | Complex objectives split into agent-sized tasks | Unlimited depth |
| **Dependency Resolution** | DAG-based task ordering with cycle detection | Cross-domain |
| **Parallel Dispatch** | Concurrent [Task](/glossary/task-module/) execution with timeouts | Limited by system resources |
| **Result Aggregation** | Typed result merging with conflict resolution | [NABLA](/glossary/nabla-infinity/)-compliant |
| **Failure Recovery** | Retry, fallback, and graceful degradation | Per-task configurable |

### Cross-Domain Fusion

Intelligence fusion engine combining data from network, financial, legal, and social domains into unified intelligence products:

| Source Domain | Prismatic Adapter | Data Types |
|--------------|-------------------|------------|
| **Network** | `Prismatic.OSINT.Network` | DNS, certificates, ports, cloud infrastructure |
| **Financial** | `Prismatic.OSINT.Financial` | AML, sanctions, crypto, transactions |
| **Legal** | `Prismatic.OSINT.Legal` | Court records, registries, compliance |
| **Social** | `Prismatic.OSINT.Social` | Profiles, mentions, reputation |
| **Security** | `Prismatic.OSINT.Security` | Vulnerabilities, exposures, threats |

The cross-domain fusion engine is the analytical heart of the platform. It takes entity data from five independent domains and identifies connections, patterns, and anomalies that are invisible within any single domain. A domain's network infrastructure (discovered through DNS and certificate scans) is correlated with its corporate ownership (from business registries) and financial relationships (from AML databases), producing a unified entity profile that captures the full complexity of the target.

## Facade Modules

Prismatic exposes its functionality through well-defined facade modules that serve as the public API:

| Facade | Purpose | Consumer Applications |
|--------|---------|---------------------|
| **`Prismatic`** | Top-level coordination and investigation | All umbrella apps |
| **`Prismatic.OSINT`** | OSINT provider orchestration | Intelligence apps |
| **`Prismatic.Agents`** | Agent discovery and dispatch | [Prismatic Agents](/apps/prismatic-agents/) |
| **`Prismatic.Quality`** | Quality scoring and gate checking | Quality infrastructure |
| **`Prismatic.Config`** | Platform configuration access | All umbrella apps |

The [Prismatic API](/apps/prismatic-api/) auto-discovers these facade modules at boot time using [Elixir](/glossary/elixir/) introspection (`Code.fetch_docs/1`, `Module.__info__/1`) and exposes them as REST endpoints. This means that every function added to a facade module automatically becomes available through the REST API without additional configuration.

## Mix Tasks

Prismatic houses the majority of platform Mix tasks that drive development and operations:

| Task Category | Examples | Purpose |
|--------------|---------|---------|
| **Quality** | `mix quality.gates`, `mix quality.enforce_standard` | Quality enforcement |
| **Evolution** | `mix autoheal.baseline`, `mix autoevolve.mega` | Autonomous evolution |
| **OSINT** | `mix osint.query`, `mix osint.investigate` | Intelligence operations |
| **Git Trees** | `mix git_trees`, `mix git_trees find` | Codebase exploration |
| **Promo** | `mix promo.enhance` | Promo site management |
| **Infrastructure** | `mix supervisor`, `mix supervisor.discover` | Platform infrastructure |

## Testing

```bash
mix test apps/prismatic/test
mix test apps/prismatic/test --cover
```

| Test Category | Tests | What It Verifies |
|--------------|-------|------------------|
| Facade API | 20 | Public API contract stability, return type correctness |
| OSINT Coordination | 15 | Provider scheduling, deduplication, aggregation |
| Investigation Workflows | 12 | Phase transitions, data flow, error handling |
| Agent Orchestration | 10 | Task decomposition, dependency resolution, parallel dispatch |
| Cross-Domain Fusion | 8 | Entity correlation, multi-domain linking |
| Mix Tasks | 15 | Task execution, output format, error reporting |

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| **[Prismatic Storage Core](/apps/prismatic-storage-core/)** | Data persistence through the unified storage adapter layer |
| **[Prismatic Agents](/apps/prismatic-agents/)** | Agent runtime for autonomous task execution |
| **[Prismatic OSINT Core](/apps/prismatic-osint-core/)** | OSINT provider framework for intelligence gathering |
| **[Prismatic Nabla](/apps/prismatic-nabla/)** | Epistemic framework for confidence-scored intelligence |
| **[Prismatic API](/apps/prismatic-api/)** | REST gateway that auto-discovers Prismatic facade modules |
| **[Prismatic Web](/apps/prismatic-web/)** | [LiveView](/glossary/liveview/) dashboards for platform operations |

## NABLA Compliance

As the central coordination hub, Prismatic enforces NABLA compliance across all intelligence operations. The Result Aggregator implements Signal Plurality by combining intelligence from multiple independent sources with explicit confidence weights. The Deduplication Engine satisfies the Contradiction Preservation axiom by logging contradictory results from different providers rather than silently discarding one. Investigation workflows carry full provenance through every phase, recording the sources queried, the analysis performed, and the decisions made, satisfying the Provenance Mandatory axiom. Cross-domain fusion operations require Trinity Gate passage for high-confidence assertions that span multiple intelligence domains.

## Related Components

- [Prismatic Web](/apps/prismatic-web/) - [LiveView](/glossary/liveview/) dashboards and user interface
- [Prismatic API](/apps/prismatic-api/) - REST [API gateway](/glossary/api-gateway/) with auto-discovery
- [Prismatic Storage](/apps/prismatic-storage/) - Data persistence layer
- [Prismatic Claude](/apps/prismatic-claude/) - Claude AI session management
- [Prismatic Safety](/apps/prismatic-safety/) - Quality floor guardian and autoheal

## Related Agents

- [Elixir Architect](/agents/elixir-architect/) -- Ensures the core application follows OTP-first design with proper supervision topology
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Reviews cross-domain coordination architecture and facade module design
- [Consolidation Architect](/agents/consolidation-architect/) -- Data deduplication and entity resolution across OSINT provider results
- [GitLab Strategic Coordinator](/agents/gitlab-strategic-coordinator/) -- Strategic coordination of development efforts across the core application

## Related Capabilities

- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Cross-domain intelligence fusion engine combining network, financial, legal, and social data
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Confidence-scored result aggregation compliant with epistemic axioms
- [Autonomous Self-Healing](/capabilities/autonomous-self-healing/) -- Autoheal and autoevolve cycles maintaining platform health

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)