+++
title = "adr-specialist"
weight = 17
[extra]
domain = "primary-producer"
level = "L2"
description = "Architecture Decision Records (ADR) governance specialist responsible for creating, validating, and maintaining living decision intelligence with automated impact tracking and compliance verification"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "no-mercy", "liveview", "genserver"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 95
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["adr-specialist", "Architecture", "Decision", "Records", "agents", "agent", "Prismatic Platform", "ADRs", "ADR Specialist"]
tags = ["agents", "agent", "adr-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "adr-specialist - Prismatic Platform"
+++

## Overview

The ADR Specialist operates as an L2 [tactical execution](@/glossary/tactical-execution.md) agent within the Primary Producer domain of the Prismatic Platform. This agent governs the lifecycle of Architecture Decision Records (ADRs) -- structured documents that capture the context, rationale, and consequences of significant architectural choices. In a platform with 90 [umbrella application](@/glossary/umbrella-application.md)s, 404 autonomous agents, and a codebase exceeding 2.8 million lines, undocumented architectural decisions create compounding technical risk. The ADR Specialist ensures that every significant design choice is recorded, validated against existing decisions, and maintained as a living document that evolves with the platform.

The agent's mandate extends beyond simple documentation. Architecture Decision Records in the Prismatic Platform are living intelligence artifacts that track the downstream impact of each decision, detect when assumptions underlying a decision have changed, and trigger review workflows when dependent components evolve. A decision recorded six months ago to use [ETS](@/glossary/ets.md) for a particular cache layer carries assumptions about data volume, access patterns, and concurrency requirements. When those assumptions change -- as detected through [telemetry](@/glossary/telemetry.md) monitoring and [SEADF](@/glossary/seadf.md) scanning -- the ADR Specialist flags the decision for reassessment rather than allowing architectural drift to accumulate silently.

This approach transforms ADRs from static historical records into active governance instruments. Each ADR is linked to the components it affects, the [metrics](@/glossary/metrics.md) that validate its assumptions, and the agents responsible for the domain it governs. The [NABLA Infinity](@/glossary/nabla-infinity.md) provenance axiom is directly served by this agent: every architectural claim in the platform can be traced to a specific decision record with documented rationale, alternatives considered, and evidence evaluated.

## Architecture

The ADR Specialist is implemented as an [OTP](@/glossary/otp.md) process that maintains a decision index in memory and persists ADR artifacts to the platform's documentation layer. The agent integrates with the git history to detect architectural changes and with the SEADF Scanner to correlate decisions with code quality metrics.

The decision index is maintained in [ETS](@/glossary/ets.md) with `:set` type keyed by ADR identifier, enabling O(1) lookup by ID. Secondary indices support efficient search across the decision corpus by domain, technology, affected component, or date range. The index is rebuilt from the filesystem at startup and maintained incrementally through filesystem monitoring during runtime.

Impact tracking operates through telemetry subscriptions. When an ADR is accepted, the specialist registers telemetry event handlers for the metrics that validate the decision's assumptions. If a decision assumes that a particular ETS table will contain fewer than 100,000 entries, a telemetry handler monitors table size and triggers a review alert when the threshold approaches. This proactive monitoring transforms architectural governance from periodic review into continuous validation.

The ADR storage format uses structured YAML frontmatter with markdown body content, enabling both machine parsing for automated analysis and human readability for developer consumption. Each ADR follows a standardized structure: title, date, status, context (the forces at play), decision (the response to those forces), consequences (the resulting context after applying the decision), and metadata (affected components, monitoring metrics, review schedule).

## Core Capabilities

- **Automated ADR creation** detecting significant architectural changes through code analysis and generating structured decision records with context, alternatives considered, decision rationale, and expected consequences
- **Decision consistency validation** checking new architectural proposals against the existing decision corpus to identify contradictions, redundancies, or decisions that supersede previous ones, maintaining a coherent decision graph
- **Impact tracking and monitoring** linking ADRs to runtime telemetry metrics that validate the assumptions underlying each decision, triggering review workflows when monitored metrics deviate from expected ranges
- **Decision lifecycle governance** managing ADR states (proposed, accepted, deprecated, superseded) with mandatory review cycles and evidence requirements for state transitions
- **Cross-reference management** maintaining bidirectional links between ADRs and the source code, agent specifications, and configuration files they govern, ensuring that no architectural decision becomes orphaned from its implementation
- **Decision search and retrieval** providing query interfaces that enable agents and developers to discover relevant architectural decisions by domain, technology, date range, or affected component

## Implementation

The ADR Specialist's core implementation provides a GenServer-based interface for ADR lifecycle management with consistency validation against the existing decision corpus.

```elixir
defmodule PrismaticADR.Specialist do
  use GenServer

  @adr_states [:proposed, :accepted, :deprecated, :superseded]
  @review_cycle_days 90

  def create_adr(title, context, decision, consequences, opts \\ []) do
    GenServer.call(__MODULE__, {:create, title, context, decision, consequences, opts})
  end

  def validate_consistency(proposed_adr) do
    GenServer.call(__MODULE__, {:validate, proposed_adr})
  end

  def check_impact(adr_id) do
    GenServer.call(__MODULE__, {:check_impact, adr_id})
  end

  def search(criteria) do
    GenServer.call(__MODULE__, {:search, criteria})
  end

  @impl true
  def handle_call({:create, title, context, decision, consequences, opts}, _from, state) do
    adr = build_adr(title, context, decision, consequences, opts)
    case validate_against_existing(adr, state.decision_index) do
      {:ok, :consistent} ->
        updated_state = register_adr(adr, state)
        register_impact_monitors(adr)
        {:reply, {:ok, adr}, updated_state}
      {:conflict, conflicting_adrs} ->
        {:reply, {:conflict, conflicting_adrs}, state}
    end
  end

  @impl true
  def handle_call({:check_impact, adr_id}, _from, state) do
    case lookup_adr(adr_id, state.decision_index) do
      {:ok, adr} ->
        impact = evaluate_assumption_validity(adr)
        {:reply, {:ok, impact}, state}
      {:error, :not_found} ->
        {:reply, {:error, :adr_not_found}, state}
    end
  end

  defp register_impact_monitors(adr) do
    Enum.each(adr.monitoring_metrics, fn metric ->
      :telemetry.attach(
        "adr-#{adr.id}-#{metric.name}",
        metric.event,
        &handle_metric_event/4,
        %{adr_id: adr.id, threshold: metric.threshold}
      )
    end)
  end
end
```

The consistency validation algorithm compares proposed decisions against a semantic index of existing decisions, flagging potential contradictions where a new decision's context overlaps with an existing decision but reaches a different conclusion. Contradictions are not automatically rejected -- they are surfaced for human review, consistent with the NABLA [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom that treats contradictory evidence as informative rather than erroneous.

## Integration Points

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [architecture-decision-specialist](@/agents/architecture-decision-specialist.md) | Peer Specialist | Shares ADR management responsibilities and architectural decision expertise |
| [AIAD Template Generator Agent](@/agents/aiad-template-generator-agent.md) | Template Consumer | Consumes ADR templates for project-specific configuration generation |
| [Code Review Specialist Agent v2.0](@/agents/code-review-specialist-agent-v20.md) | Review Partner | Validates that code changes align with documented architectural decisions |
| [aiad-verification-engine](@/agents/aiad-verification-engine.md) | Verification Gate | Verifies ADR cross-references and consistency during ecosystem scans |
| [SEADF](@/glossary/seadf.md) Scanner | Quality Source | Correlates code quality metrics with ADR-documented decisions |
| [Quality DNA](@/glossary/quality-dna.md) | Persistence | Stores ADR-related quality state across sessions |

## Operational Workflow

The ADR lifecycle follows a structured workflow with defined state transitions and evidence requirements.

| Trigger | Action | Threshold |
|---------|--------|-----------|
| New umbrella app created | ADR required for core architecture choices | Mandatory |
| External dependency added | ADR required for dependency rationale | Mandatory |
| Performance metric shift > 20% | Review affected ADRs | Automatic |
| 90 days since last review | Scheduled review cycle | Automatic |
| Superseding decision proposed | Deprecate previous ADR | Requires evidence |
| Component removed from platform | Archive related ADRs | Automatic |

The operational cycle begins with detection of architectural change signals -- new application creation, dependency additions, significant refactoring patterns, or performance metric deviations. Upon detection, the specialist either creates a new ADR or triggers review of existing ADRs affected by the change. The review process requires evidence-based assessment of whether the original decision's assumptions remain valid, producing either a reaffirmation with updated evidence or a deprecation with documented rationale for the change.

Decision state transitions follow strict governance. Moving an ADR from proposed to accepted requires review by at least one domain expert and evidence that the decision addresses the documented problem statement. Moving from accepted to deprecated requires documented evidence that assumptions have changed. Moving from accepted to superseded requires a replacement ADR that explicitly references the superseded decision. These governance rules ensure that the decision corpus remains coherent and trustworthy over time.

## NABLA Compliance

The ADR Specialist directly implements several NABLA Infinity axioms as core operational principles.

**Provenance Mandatory.** Every ADR includes complete provenance information: the session that created it, the evidence evaluated, the alternatives considered, and the rationale for the chosen approach. No architectural claim exists in the platform without traceable provenance through its ADR.

**Contradiction Preservation.** When a new decision contradicts an existing one, both decisions are preserved with explicit documentation of the contradiction. The specialist does not silently supersede decisions -- it surfaces contradictions for deliberate resolution, maintaining the integrity of the decision history.

**Signal Plurality.** Decision validation requires multiple independent signals. A decision to adopt a particular storage pattern is validated not just by design analysis but also by performance benchmarks, operational metrics, and alignment with existing architectural patterns. Single-signal decisions are flagged for additional evidence gathering.

**Time Decay.** All ADRs carry timestamps and review schedules. The 90-day review cycle ensures that decisions are periodically reassessed against current evidence. Decisions whose assumptions have materially changed are flagged for review regardless of the scheduled cycle.

## Configuration

The ADR Specialist's behavior is configurable through the platform's application environment.

```elixir
config :prismatic_adr, PrismaticADR.Specialist,
  review_cycle_days: 90,
  impact_check_interval_ms: :timer.hours(1),
  consistency_check_on_create: true,
  auto_detect_architectural_changes: true,
  monitoring_metric_threshold_factor: 0.8,
  adr_storage_path: "docs/architecture/decisions/",
  telemetry_prefix: [:prismatic_adr, :specialist]
```

The AIAD specification at `.aiad/agents/adr-specialist.agent.md` defines L2 tactical authority with enforcement block requiring `no-mercy-no-doubts` doctrine compliance. The review cycle is configurable per-domain to accommodate different decision cadences -- infrastructure decisions may require more frequent review than documentation decisions.

## Performance

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **ADR creation time** | < 5min | < 10min | Time to generate a structured ADR from architectural input |
| **Consistency check** | < 2s | < 5s | Time to validate a proposed ADR against existing corpus |
| **Decision coverage** | > 85% | > 90% | Percentage of significant architectural choices with ADRs |
| **Impact detection latency** | < 1hr | < 2hr | Time from metric deviation to review alert generation |
| **Review cycle compliance** | > 90% | > 95% | Percentage of ADRs reviewed within scheduled cycle |
| **Cross-reference accuracy** | > 95% | > 98% | Percentage of ADR-to-code links that resolve correctly |

## Related Resources

- [Architecture Overview](@/architecture/_index.md) -- Platform architecture informed by ADR decisions
- [AIAD Standard](@/capabilities/aiad-standard.md) -- Agent specification standard using ADR governance
- [SEADF](@/glossary/seadf.md) -- Self-Evolving Autonomous Development Framework with quality scanning
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Cross-agent coordination capabilities
- [Applications](@/apps/_index.md) -- 90+ umbrella applications governed by architectural decisions
- [Glossary](@/glossary/_index.md) -- Technical terminology including ADR concepts

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)