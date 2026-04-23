+++
title = "agent-discovery-specialist"
weight = 18
[extra]
domain = "primary"
level = "L2"
description = "Specialized agent for discovering, cataloging, and managing the AIAD agent ecosystem with automated registry maintenance and capability indexing"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "ecto", "no-mercy", "ets", "genserver"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 95
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["agent-discovery-specialist", "Specialized", "AIAD", "agents", "agent", "Prismatic Platform", "Registry", "Time"]
tags = ["agents", "agent", "agent-discovery-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "agent-discovery-specialist - Prismatic Platform"
+++

## Overview

The Agent Discovery Specialist operates as an L2 [tactical execution](@/glossary/tactical-execution.md) agent within the Primary domain of the Prismatic Platform. This agent is responsible for discovering, cataloging, validating, and maintaining the registry of all [AIAD](@/glossary/aiad.md) agents across the platform ecosystem. With over 404 autonomous agents defined in `.aiad/agents/` specifications, the ability to programmatically discover, index, and query the agent population is a foundational infrastructure capability that enables every other coordination and orchestration function in the platform.

The discovery process is not a one-time scan. The Agent Discovery Specialist runs continuous monitoring that detects newly created agent specifications, identifies modifications to existing agents, flags deprecated or removed agents, and maintains a real-time registry index that reflects the current state of the agent ecosystem. This continuous discovery is essential because the AIAD ecosystem evolves through autonomous evolution cycles (driven by the [AIAD Auto-Evolution Supreme](@/agents/aiad-auto-evolution-supreme.md)) that can create, modify, or retire agent specifications without manual intervention.

The registry maintained by this agent serves as the authoritative source of truth for all agent-related queries. When the 3NL Coordinator needs to identify which agents can handle a specific task, when the AIAD Dashboard Commander needs to display ecosystem health, or when the [SEADF](@/glossary/seadf.md) Scanner needs to correlate code quality with agent specifications, they all query the registry maintained by this specialist. The registry is not merely a list of agent files -- it is a structured index with parsed metadata, capability mappings, authority hierarchies, domain classifications, and inter-agent dependency graphs.

## Architecture

The Agent Discovery Specialist is implemented as a [GenServer](@/glossary/genserver.md) that maintains the agent registry in [ETS](@/glossary/ets.md) for high-performance concurrent reads. The registry is rebuilt from filesystem state at startup and maintained incrementally through filesystem monitoring during runtime.

The ETS table uses `:set` type keyed by agent ID, enabling O(1) lookups by agent identifier. Secondary indices for capability-based queries, domain-based queries, and authority-level queries are maintained as additional ETS tables with bag semantics, enabling efficient multi-criteria searches across the 404-agent registry.

The periodic scan interval (default 30 seconds) balances discovery latency against filesystem I/O overhead. During active development sessions where agent specifications change frequently, the scan interval can be reduced to near-real-time. In production, where specifications are stable between deployments, the interval extends to reduce overhead.

The discovery pipeline processes specifications through three stages: parsing (YAML frontmatter extraction and validation), indexing (registration in primary and secondary ETS indices), and validation (cross-reference integrity checking against the existing registry). Each stage runs as a supervised task with timeout protection, ensuring that a malformed specification file cannot block the discovery of other agents.

## Core Capabilities

- **Filesystem-based specification discovery** scanning the `.aiad/agents/` directory for agent specification files, parsing YAML frontmatter, and extracting structured metadata including authority level, domain, capabilities, dependencies, and enforcement compliance
- **Runtime agent detection** querying the platform's [DynamicSupervisor](@/glossary/dynamic-supervisor.md) to identify which agent specifications have corresponding runtime processes, enabling health status correlation between specification and execution layers
- **Capability indexing** building and maintaining a searchable index of agent capabilities, enabling query-based agent selection where consuming systems can request agents by capability rather than by name
- **Dependency graph construction** parsing inter-agent dependency declarations and building a directed acyclic graph of agent relationships, enabling impact analysis when an agent specification changes
- **Registry consistency validation** verifying that every registered agent has a valid specification file, that every specification file is registered, and that cross-references between agents resolve correctly
- **Change detection and notification** monitoring the agent specification directory for filesystem changes and emitting [telemetry](@/glossary/telemetry.md) events that notify interested systems of agent additions, modifications, and removals

## Implementation

The discovery implementation provides a GenServer-based registry with periodic scanning and change detection.

```elixir
defmodule PrismaticAgents.Discovery do
  use GenServer

  @registry_table :aiad_agent_registry
  @capability_index :aiad_capability_index
  @domain_index :aiad_domain_index
  @scan_interval_ms 30_000

  def discover_all do
    GenServer.call(__MODULE__, :full_scan)
  end

  def find_by_capability(capability) do
    :ets.lookup(@capability_index, capability)
    |> Enum.map(fn {_cap, agent_id} -> get_agent(agent_id) end)
    |> Enum.filter(&match?({:ok, _}, &1))
    |> Enum.map(fn {:ok, spec} -> spec end)
  end

  def find_by_domain(domain) do
    :ets.lookup(@domain_index, domain)
    |> Enum.map(fn {_domain, agent_id} -> get_agent(agent_id) end)
    |> Enum.filter(&match?({:ok, _}, &1))
    |> Enum.map(fn {:ok, spec} -> spec end)
  end

  def get_agent(agent_id) do
    case :ets.lookup(@registry_table, agent_id) do
      [{^agent_id, spec}] -> {:ok, spec}
      [] -> {:error, :not_found}
    end
  end

  def get_dependency_graph do
    GenServer.call(__MODULE__, :dependency_graph)
  end

  @impl true
  def handle_info(:periodic_scan, state) do
    changes = detect_changes(state.last_scan_hash)
    updated_state = apply_changes(changes, state)
    emit_change_telemetry(changes)
    Process.send_after(self(), :periodic_scan, @scan_interval_ms)
    {:noreply, %{updated_state | last_scan_hash: compute_scan_hash()}}
  end

  defp emit_change_telemetry(%{added: added, modified: modified, removed: removed}) do
    :telemetry.execute(
      [:prismatic_agents, :discovery, :scan_complete],
      %{added: length(added), modified: length(modified), removed: length(removed)},
      %{timestamp: System.monotonic_time()}
    )
  end
end
```

The change detection algorithm computes a content hash of each specification file and compares against the stored hash from the previous scan. Only changed files trigger re-parsing and re-indexing, minimizing I/O overhead during routine scans. New files trigger full parsing and registration; removed files trigger deregistration and dependency graph updates; modified files trigger re-parsing with delta computation to identify exactly which metadata fields changed.

## Integration Points

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [AIAD Adaptation Engine Agent](@/agents/aiad-adaptation-engine-agent.md) | Specification Consumer | Consumes registry data to identify Prismatic-specific patterns for adaptation |
| [AIAD Intelligence Selector Agent](@/agents/aiad-intelligence-selector-agent.md) | Capability Query | Queries registry to match project capabilities with available agents |
| [aiad-verification-engine](@/agents/aiad-verification-engine.md) | Validation Partner | Cross-validates registry consistency with specification integrity checks |
| [aiad-dashboard-commander](@/agents/aiad-dashboard-commander.md) | Display Consumer | Consumes registry data for ecosystem health dashboard visualization |
| [aiad-auto-evolution-supreme](@/agents/aiad-auto-evolution-supreme.md) | Evolution Source | Detects specification changes from autonomous evolution cycles |
| [mycelial-network](@/glossary/mycelial-network.md) | Propagation | Announces agent capabilities across the platform network |

## Operational Workflow

The discovery operational cycle maintains continuous registry accuracy through scheduled scans and event-driven updates.

| Decision Point | Criteria | Action |
|---------------|----------|--------|
| New specification detected | Valid YAML, required fields present | Register with parsed metadata |
| Specification modified | Diff against registered version | Update registry, emit change event |
| Specification removed | File deleted, no runtime process | Deregister, emit removal event |
| Invalid specification | Parse failure or missing fields | Reject registration, emit warning |
| Circular dependency | Graph cycle detected | Block registration, report to verification engine |
| Orphaned runtime agent | Process exists without specification | Flag for investigation |

Registry consistency validation runs as part of the periodic scan. Any inconsistency between the specification filesystem and the registry state triggers an immediate reconciliation. This ensures that the registry never drifts from the authoritative specification files, even if external tools modify specifications outside the discovery agent's direct observation.

The discovery workflow interacts with the platform's session lifecycle system. At session start, a full discovery scan ensures the registry reflects any changes made between sessions. During active sessions, the periodic scan interval maintains near-real-time accuracy. At session end, a final scan captures any in-session specification changes.

## NABLA Compliance

The Agent Discovery Specialist operates under NABLA Infinity axiom compliance for all registry operations.

**Provenance Mandatory.** Every registry entry includes provenance metadata documenting the specification file path, last modification timestamp, scan cycle that registered it, and content hash. Registry entries without provenance are treated as corruption and trigger immediate investigation.

**Signal Plurality.** Agent health status in the registry combines multiple signals: specification file presence (filesystem signal), runtime process existence (supervision tree signal), and telemetry activity (execution signal). No single signal determines agent status; the registry reflects the composite of all available signals.

**Unknown Valid.** When a specification file cannot be parsed due to ambiguous YAML or incomplete metadata, the discovery specialist registers the agent with an "unknown" status rather than silently ignoring it. Unknown status agents are visible in the registry and flagged for human review, preventing silent data loss.

## Configuration

```elixir
config :prismatic_agents, PrismaticAgents.Discovery,
  scan_interval_ms: 30_000,
  specification_path: ".aiad/agents/",
  registry_table: :aiad_agent_registry,
  capability_index: :aiad_capability_index,
  domain_index: :aiad_domain_index,
  validate_cross_references: true,
  emit_change_telemetry: true,
  telemetry_prefix: [:prismatic_agents, :discovery]
```

The AIAD specification at `.aiad/agents/agent-discovery-specialist.agent.md` defines L2 tactical authority with enforcement block requiring `no-mercy-no-doubts` doctrine compliance. The scan interval is configurable per environment, defaulting to 30 seconds for development and 300 seconds for production.

## Performance

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Full scan time** | < 2s | < 5s | Time to scan and parse all 404 specification files |
| **Registry lookup** | < 1ms | < 5ms | O(1) ETS lookup by agent ID |
| **Capability search** | < 10ms | < 50ms | Time to find agents matching a capability query |
| **Change detection latency** | < 30s | < 60s | Time from specification change to registry update |
| **Registry accuracy** | 100% | 100% | Consistency between filesystem and registry state |
| **Dependency graph depth** | < 50ms | < 100ms | Time to compute transitive dependency closure |

## Related Resources

- [AIAD Standard](@/capabilities/aiad-standard.md) -- Agent specification standard defining discoverable agent formats
- [Agent Registry](@/registry/_index.md) -- Public registry of all platform agents
- [SEADF](@/glossary/seadf.md) -- Self-Evolving Autonomous Development Framework consuming discovery data
- [Mycelial Network](@/glossary/mycelial-network.md) -- Cross-domain pattern propagation using agent capability data
- [Applications](@/apps/_index.md) -- 90+ platform applications hosting agent runtime processes
- [Commands](@/commands/_index.md) -- 210+ commands that reference agent specifications

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)