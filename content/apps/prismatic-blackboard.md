+++
title = "Prismatic Blackboard"
weight = 30
[extra]
icon = "rectangle-group"
color = "slate"
description = "Blackboard architecture for multi-agent problem solving and knowledge sharing"
category = "AI"
files = "220"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 983
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Blackboard", "apps", "Prismatic Platform", "Controller", "PrismaticBlackboard", "Knowledge"]
tags = ["apps", "ai", "prismatic-blackboard", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Blackboard - Prismatic Platform"
+++

## Overview

Prismatic [Blackboard](/glossary/blackboard/) implements the blackboard architecture pattern for multi-agent collaborative problem solving within the Prismatic Platform. The system provides a shared knowledge space backed by [ETS](/glossary/ets/) where specialized agents post partial solutions, triggering other agents to contribute their expertise through a publish-subscribe notification mechanism. A controller component manages agent scheduling, quorum-based decision making, and convergence detection.

Complex intelligence analysis tasks require integrating knowledge from multiple specialized domains. Assessing the security posture of an entity requires network intelligence (from [Shodan](/glossary/shodan/), [Censys](/glossary/censys/)), vulnerability data (from NVD, [CVE](/glossary/cve/) databases), reputation intelligence (from AbuseIPDB, [GreyNoise](/glossary/greynoise/)), business context (from ARES, Justice.cz), and compliance status (from regulatory frameworks). No single analysis module possesses all this knowledge. The blackboard architecture solves this by providing a shared workspace where partial solutions trigger further analysis, enabling emergent problem solving without rigid workflow definitions.

Knowledge entries are typed and schema-validated, with temporal versioning and provenance tracking integrated with the [Prismatic Nabla](/apps/prismatic-nabla/) epistemic framework. The architecture supports complex intelligence analysis tasks -- such as multi-source [entity resolution](/glossary/entity-resolution/), comprehensive threat assessment, and [security rating](/glossary/security-rating/) computation -- where no single agent possesses complete knowledge and the solution emerges from the collaboration of specialists. The design goals include ETS-backed high-performance shared knowledge space, trigger-based agent coordination activated by knowledge changes, configurable quorum requirements before conclusions are accepted, temporal versioning maintaining version history with timestamps, NABLA-compliant provenance tracking, and convergence detection declaring problems solved when knowledge stabilizes.

## Architecture

The architecture centers on a shared knowledge space where agents read and write entries, coordinated by a controller that manages scheduling and convergence.

```
Agent Pool (Specialized Knowledge Sources)
       |
  +----+----+----+----+
  |    |    |    |    |
  Net   Vuln  Rep  Biz  Compliance
  Intel Intel Intel Intel Assessor
       |
  Blackboard (Shared Knowledge Space, ETS)
  +-- Knowledge Entries (typed, versioned, with provenance)
  +-- Change Notifications (PubSub)
  +-- Conflict Resolution (latest-wins or quorum)
       |
  Controller
  +-- Agent Scheduling (priority-based)
  +-- Quorum Management (configurable thresholds)
  +-- Convergence Detection (stability check)
  +-- Deadlock Resolution (timeout-based)
```

The process topology uses three supervised GenServers managing the knowledge store, controller logic, and notification dispatch:

```
PrismaticBlackboard.Application (Supervisor, :one_for_one)
+-- PrismaticBlackboard.KnowledgeStore (GenServer)
|     ETS table owner, entry management, versioning
+-- PrismaticBlackboard.Controller (GenServer)
|     Agent scheduling, convergence monitoring
+-- PrismaticBlackboard.Notifier (GenServer)
      PubSub notification dispatch
```

An agent posts a knowledge entry to the blackboard. The KnowledgeStore validates the entry against its schema, stores it in ETS with version metadata, and notifies the Controller. The Controller evaluates which other agents should be activated based on the knowledge change, checks quorum status, and dispatches activation signals through the Notifier. Activated agents query the blackboard for relevant knowledge, perform their analysis, and post new knowledge entries. The cycle continues until the Controller detects convergence.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticBlackboard` | Public facade: `post/2`, `query/2`, `subscribe/2`, `converged?/1` |
| `PrismaticBlackboard.KnowledgeStore` | ETS-backed knowledge entry storage with versioning |
| `PrismaticBlackboard.Controller` | Agent scheduling, quorum management, convergence detection |
| `PrismaticBlackboard.Notifier` | [PubSub](/glossary/pubsub/)-based change notification to subscribed agents |
| `PrismaticBlackboard.ConflictResolver` | Resolution strategies for concurrent knowledge updates |
| `PrismaticBlackboard.ProvenanceTracker` | NABLA-compliant contributor attribution and confidence |
| `PrismaticBlackboard.Schema` | Knowledge entry type definitions and validation |

Convergence detection monitors the rate of knowledge contributions. When no new entries or updates are posted within a configurable stability window (default 5 seconds), the Controller declares convergence. A minimum contribution threshold ensures that convergence is not declared prematurely due to slow agents. For high-confidence conclusions, the Controller requires a configurable number of independent agent contributions agreeing on a value.

```elixir
defmodule PrismaticBlackboard.KnowledgeEntry do
  @type t :: %__MODULE__{
    topic: atom(),
    key: term(),
    value: term(),
    contributor: atom(),
    confidence: float(),
    version: pos_integer(),
    timestamp: DateTime.t(),
    provenance: Provenance.t(),
    quorum_count: non_neg_integer()
  }
end
```

## Configuration

```elixir
config :prismatic_blackboard,
  convergence_window: :timer.seconds(5),
  min_contributors: 2,
  quorum_threshold: 3,
  max_versions_per_entry: 100,
  conflict_strategy: :latest_wins,
  cleanup_interval: :timer.hours(1)
```

The convergence window defines the stability period after which the Controller declares convergence if no new contributions arrive. The minimum contributors threshold prevents premature convergence due to slow agent activation. Quorum threshold specifies how many independent agents must agree on a value before it is accepted as high-confidence. Conflict strategy determines how concurrent updates to the same entry are resolved, with options for latest-wins timestamp ordering or quorum-based resolution.

## API Reference

```elixir
# Post knowledge to blackboard
@spec post(atom(), map()) :: {:ok, KnowledgeEntry.t()}
PrismaticBlackboard.post(:entity_risk, %{
  entity: "example.com",
  risk_level: :high,
  evidence: evidence_list,
  contributor: :perimeter_agent
})

# Subscribe to knowledge changes
@spec subscribe(atom(), function()) :: :ok
PrismaticBlackboard.subscribe(:entity_risk, fn entry -> handle_update(entry) end)

# Query current knowledge
@spec query(atom(), keyword()) :: {:ok, [KnowledgeEntry.t()]}
PrismaticBlackboard.query(:entity_risk, entity: "example.com")

# Check convergence status
@spec converged?(atom()) :: boolean()
PrismaticBlackboard.converged?(:entity_risk)
```

## Testing

KnowledgeStore tests verify correct entry storage, versioning, and conflict resolution. Controller tests verify convergence detection timing and quorum management logic. Multi-agent problem solving integration tests exercise the full blackboard cycle with simulated agents posting, subscribing, and converging on solutions.

Property-based tests use StreamData generators to produce random knowledge entries, verifying that the blackboard maintains consistency under concurrent access and that convergence is always eventually detected. Temporal ordering tests verify that version history is maintained correctly under concurrent updates.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Nabla](/apps/prismatic-nabla/) | Provenance and confidence tracking for all entries |
| [Prismatic Agents](/apps/prismatic-agents/) | Agent activation and scheduling integration |
| [Prismatic OSINT Core](/apps/prismatic-osint-core/) | Multi-source [intelligence fusion](/glossary/intelligence-fusion/) |
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Multi-factor security rating computation |
| [Prismatic Detection Engine](/apps/prismatic-detection-engine/) | Collaborative threat assessment |

Knowledge updates are posted as GenServer calls. Change notifications are dispatched via Phoenix PubSub. Agent activation signals are sent through the [Prismatic Agents](/apps/prismatic-agents/) dispatcher. The blackboard operates entirely within the platform with no external service dependencies.

## NABLA Compliance

The blackboard architecture provides natural enforcement of several [NABLA](/glossary/nabla-infinity/) axioms through its multi-agent collaborative design.

| NABLA Axiom | Blackboard Enforcement | Implementation |
|-------------|----------------------|----------------|
| Signal Plurality | Quorum requires multiple independent contributors | Configurable minimum contributor count per conclusion |
| Contradiction Preservation | Conflicting entries preserved with version history | All versions retained, conflict resolution explicit |
| Provenance Mandatory | Every entry carries contributor identity and confidence | ProvenanceTracker enforces attribution on all posts |
| Time Decay | Temporal versioning with cleanup of stale entries | Timestamps on all entries with configurable retention |
| Source Independence | Independent agents contribute without coordination | Each agent operates autonomously on its own intelligence |

Malicious agents could post false knowledge to influence blackboard conclusions. The quorum requirement mitigates this by requiring independent corroboration. Provenance tracking enables audit of contributor behavior.

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Knowledge post | < 1ms | ETS write + PubSub broadcast |
| Knowledge query | < 100 microseconds | ETS read |
| Convergence check | < 1ms | Timestamp comparison |
| Full problem solving cycle | 1-10s | Depends on agent count and complexity |

ETS provides lock-free concurrent reads. The blackboard supports dozens of concurrent agents posting knowledge entries.

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 128 MB | 512 MB (with large knowledge sets) |
| CPU | 2 cores | 4 cores |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :blackboard, :post]`, `[:prismatic, :blackboard, :converged]`, `[:prismatic, :blackboard, :quorum_reached]`.

## Related Resources

- [Prismatic Agents](/apps/prismatic-agents/) -- Agent runtime and scheduling
- [Prismatic Nabla](/apps/prismatic-nabla/) -- Epistemic confidence framework
- [Prismatic OSINT Core](/apps/prismatic-osint-core/) -- Intelligence fusion consumer
- [Blackboard Pattern](https://en.wikipedia.org/wiki/Blackboard_(design_pattern)) -- Architecture pattern reference
- [Architecture Review Specialist](/agents/architecture-review-specialist/) -- Reviews the blackboard architecture for OTP compliance and convergence correctness
- [Cross-Pollination Specialist](/agents/cross-pollination-specialist/) -- Identifies cross-domain knowledge sharing opportunities between specialized agents
- [Elixir Architect](/agents/elixir-architect/) -- Ensures the ETS-backed knowledge store and PubSub notification system follow OTP best practices
- [Cross-Domain Flexibility](/capabilities/cross-domain-flexibility/) -- Enables agents from different domains to contribute partial solutions through the blackboard
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Combines partial knowledge contributions into comprehensive intelligence assessments
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Enforces signal plurality and provenance tracking for all knowledge entries

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)