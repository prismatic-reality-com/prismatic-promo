+++
title = "strangler-pattern-specialist"
weight = 382
[extra]
domain = "integration"
level = "L3"
description = "Gradual legacy system replacement using strangler fig pattern"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 137
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["strangler-pattern-specialist", "Gradual", "agents", "agent", "Prismatic Platform", "GARDEN", "Specialist", "The Strangler", "Strangler Pattern"]
tags = ["agents", "agent", "strangler-pattern-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "strangler-pattern-specialist - Prismatic Platform"
+++

## Overview

The Strangler Pattern Specialist is an L3 agent operating in the **integration** domain of the Prismatic Platform. This agent manages the gradual replacement of legacy system components using the strangler fig pattern -- a software migration strategy inspired by the strangler fig tree that grows around its host, eventually replacing it entirely while maintaining system functionality throughout the transition.

In a platform with 90 umbrella applications and over 20 years of accumulated knowledge in the [GARDEN](@/glossary/garden.md) legacy repository system, systematic legacy replacement is an ongoing operational concern. The Strangler Pattern Specialist ensures that legacy components are replaced incrementally, with each replacement step maintaining full backward compatibility and zero downtime. This approach contrasts with "big bang" rewrites that carry unacceptable risk for production systems operating under the [NO MERCY](@/glossary/no-mercy.md) doctrine.

This agent is part of the platform's 434-strong autonomous agent ecosystem, operating under [AIAD](@/glossary/aiad.md) standard compliance and coordinating with the GARDEN integration infrastructure for legacy knowledge extraction.

## The Strangler Fig Pattern

The strangler fig pattern was first described by Martin Fowler and has become the industry-standard approach for safely replacing legacy systems. The pattern consists of three phases applied iteratively to each component of the legacy system.

| Phase | Activity | Risk Level | Duration |
|-------|----------|------------|----------|
| **Transform** | Create new implementation alongside legacy | Low | Days-Weeks |
| **Coexist** | Route traffic to new implementation gradually | Medium | Weeks |
| **Eliminate** | Remove legacy component once fully replaced | Low | Days |

### Pattern Lifecycle

```
Legacy System (100% traffic)
    ├── Step 1: Build new component A alongside legacy A
    ├── Step 2: Route 10% traffic to new A (canary)
    ├── Step 3: Route 50% traffic to new A (split)
    ├── Step 4: Route 100% traffic to new A (full cutover)
    ├── Step 5: Remove legacy A (elimination)
    └── Repeat for components B, C, D...
```

## Migration Tracking

The Strangler Pattern Specialist maintains a comprehensive migration registry that tracks the status of every legacy component undergoing replacement.

| Component | Legacy Location | New Location | Phase | Traffic Split | Health |
|-----------|----------------|-------------|-------|---------------|--------|
| **Entity Resolution** | GARDEN/sig | prismatic_storage_core | Eliminated | 100% new | Healthy |
| **OSINT Providers** | GARDEN/sig | prismatic_osint | Coexist | 85% new | Healthy |
| **Graph Storage** | GARDEN/kuzu-ex | prismatic_storage_kuzu | Coexist | 90% new | Healthy |
| **Blackboard System** | GARDEN/prismatic-legacy | prismatic_blackboard | Transform | 0% new | In Progress |

## Technical Implementation

```elixir
defmodule PrismaticAgents.StranglerPatternSpecialist do
  @moduledoc """
  L3 Strangler Pattern Specialist agent.
  Manages gradual legacy system replacement using strangler fig pattern.
  """

  use GenServer
  require Logger

  @migration_check_interval_ms :timer.hours(1)

  defstruct [
    :migration_registry,
    :active_migrations,
    :traffic_split_configs,
    :health_checks,
    :last_check_at,
    status: :monitoring
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    registry = load_migration_registry()
    schedule_migration_check()
    {:ok, %__MODULE__{migration_registry: registry, active_migrations: []}}
  end

  @impl true
  def handle_info(:migration_check, state) do
    health = check_all_migration_health(state.migration_registry)
    recommendations = analyze_traffic_split_readiness(state.migration_registry)

    :telemetry.execute(
      [:prismatic, :agents, :strangler, :check],
      %{active_migrations: length(state.active_migrations)},
      %{healthy: health.healthy_count, unhealthy: health.unhealthy_count}
    )

    schedule_migration_check()

    {:noreply, %{state |
      health_checks: health,
      last_check_at: DateTime.utc_now()
    }}
  end

  @spec advance_migration(String.t(), float()) :: {:ok, map()} | {:error, term()}
  def advance_migration(component_id, new_traffic_percentage) do
    GenServer.call(__MODULE__, {:advance, component_id, new_traffic_percentage})
  end

  @impl true
  def handle_call({:advance, component_id, percentage}, _from, state) do
    with {:ok, migration} <- find_migration(state.migration_registry, component_id),
         :ok <- validate_health_prerequisites(migration),
         {:ok, updated} <- update_traffic_split(migration, percentage) do
      {:reply, {:ok, updated}, update_registry(state, updated)}
    else
      {:error, reason} -> {:reply, {:error, reason}, state}
    end
  end
end
```

## Traffic Routing Strategy

The Strangler Pattern Specialist implements sophisticated traffic routing that enables gradual migration with real-time health monitoring.

| Routing Strategy | Description | Use Case |
|-----------------|-------------|----------|
| **Canary** | Route small percentage to new system | Initial validation |
| **A/B Split** | Deterministic split based on request attributes | Comparative testing |
| **Shadow** | Send copies to new system without using results | Pre-production validation |
| **Gradual Ramp** | Incrementally increase new system traffic | Controlled rollout |
| **Feature Flag** | Route based on feature flag state | Per-feature migration |

## Health Check Framework

Before any traffic split advancement, the specialist runs comprehensive health checks on both legacy and new implementations.

| Health Check | Threshold | Block Advancement |
|-------------|-----------|-------------------|
| **Error rate** | < 0.1% | Yes |
| **Latency P95** | < 2x legacy | Yes |
| **Data consistency** | 100% match | Yes |
| **Resource usage** | < 1.5x legacy | Warning |
| **Test coverage** | > 90% | Yes |

## GARDEN Integration

The Strangler Pattern Specialist coordinates closely with the [GARDEN](@/glossary/garden.md) legacy knowledge system to extract patterns, algorithms, and domain knowledge from legacy repositories before replacement. This extraction process ensures that decades of accumulated domain knowledge are preserved and migrated to the new implementations rather than being lost during component replacement.

| GARDEN Repository | Content | Files | Extraction Status | Priority |
|------------------|---------|-------|-------------------|----------|
| **sig** | 250+ OSINT providers | 1,200+ | 85% extracted | P1 |
| **prismatic-legacy** | Blackboard system, core logic | 1,302 | 60% extracted | P1 |
| **kuzu-ex** | KuzuDB Elixir SDK | 45 | 95% extracted | P2 |
| **crisstal** | Pattern matching engine | 280 | 70% extracted | P2 |
| **code-weaver** | Code generation templates | 150 | 50% extracted | P3 |
| **simple_geocoder** | Geocoding library | 35 | 100% extracted | Complete |

## Migration Risk Assessment

Before advancing any migration phase, the Strangler Pattern Specialist conducts a comprehensive risk assessment that evaluates both technical and operational risks associated with the migration step.

```elixir
defmodule PrismaticAgents.StranglerPatternSpecialist.RiskAssessment do
  @moduledoc """
  Migration risk assessment for strangler pattern phase advancement.
  Evaluates technical and operational risks before traffic split changes.
  """

  @spec assess_migration_risk(map(), float()) :: {:ok, :acceptable} | {:error, :unacceptable, map()}
  def assess_migration_risk(migration, target_percentage) do
    risks = [
      assess_data_consistency_risk(migration),
      assess_performance_risk(migration),
      assess_rollback_capability(migration),
      assess_downstream_impact(migration, target_percentage),
      assess_monitoring_coverage(migration)
    ]

    max_risk = Enum.max_by(risks, & &1.score)
    total_risk = Enum.sum(Enum.map(risks, & &1.score)) / length(risks)

    cond do
      max_risk.score > 0.8 ->
        {:error, :unacceptable, %{reason: max_risk.category, score: max_risk.score}}
      total_risk > 0.6 ->
        {:error, :unacceptable, %{reason: :aggregate_risk, score: total_risk}}
      true ->
        {:ok, :acceptable}
    end
  end

  defp assess_data_consistency_risk(migration) do
    consistency_score = compare_output_consistency(
      migration.legacy_component,
      migration.new_component,
      migration.test_inputs
    )

    %{category: :data_consistency, score: 1.0 - consistency_score}
  end
end
```

| Risk Category | Assessment Method | Acceptable Threshold | Blocking |
|--------------|-------------------|---------------------|----------|
| **Data Consistency** | Output comparison with 1,000+ test inputs | < 0.1% divergence | Yes |
| **Performance** | Benchee comparison under realistic load | < 2x legacy latency | Yes |
| **Rollback Capability** | Verified rollback procedure with test execution | Must complete < 5 min | Yes |
| **Downstream Impact** | Dependency analysis of all consumers | No breaking changes | Yes |
| **Monitoring Coverage** | Telemetry event verification | 100% of key metrics covered | Yes |

## Integration Points

- [**Quality Gates**](@/capabilities/quality-gates.md) -- Migration advancement gated by quality checks
- [**Telemetry Integration**](@/capabilities/telemetry-integration.md) -- Migration health metrics
- [**Real-time Monitoring**](@/capabilities/real-time-monitoring.md) -- Live migration dashboards
- [**AIAD Standard**](@/capabilities/aiad-standard.md) -- Full agent specification compliance

## Rollback Procedures

Every migration managed by the Strangler Pattern Specialist includes a documented and tested rollback procedure. Rollback capability is a non-negotiable prerequisite for advancing any migration phase, as the [NO MERCY](@/glossary/no-mercy.md) doctrine requires that no migration step can leave the platform in a state where reversal is impossible.

| Rollback Aspect | Requirement | Verification |
|----------------|-------------|-------------|
| **Traffic Routing** | Instant redirect back to legacy component | Tested before each advancement |
| **Data Migration** | Backward-compatible schema changes only | Schema reversibility proven |
| **Configuration** | Feature flags for instant toggle | Flag state verified in staging |
| **Dependencies** | Both legacy and new dependencies available | Dependency tree validated |
| **State Recovery** | Stateful components preserve rollback state | State snapshot before advancement |

The Strangler Pattern Specialist maintains rollback procedures as executable scripts that can be triggered manually by operators or automatically by the platform's health monitoring system. Each rollback procedure is tested quarterly to ensure it remains functional as the system evolves.

## Migration Success Criteria

Before any migration component can be declared "eliminated" (fully migrated), it must pass a comprehensive set of success criteria verified by both automated testing and manual review.

| Criterion | Measurement | Threshold | Authority |
|-----------|------------|-----------|-----------|
| **Functional Equivalence** | Output comparison against 10,000+ test cases | 100% match | Automated |
| **Performance Parity** | Benchmark comparison under production load | Within 10% of legacy | Automated |
| **Zero Downtime** | Monitoring during migration period | 0 user-visible errors | Automated |
| **Test Coverage** | New implementation test coverage | > 95% line coverage | Automated |
| **Documentation** | Migration report with architectural decisions | Complete report filed | Manual review |

## AIAD Specification Compliance

| AIAD Component | Status |
|----------------|--------|
| Agent specification file | Compliant |
| Behavioral rules | 12 rules defined |
| [Telemetry](@/glossary/telemetry.md) integration | Full coverage |
| [NM/ND doctrine](@/glossary/no-mercy.md) enforcement | Active |
| [SEADF](@/glossary/seadf.md) integration | Registered |

## Related Agents

- [**Scalability Architect**](@/agents/scalability-architect.md) -- Ensures new implementations scale properly
- [**Source Archive Specialist**](@/agents/source-archive-specialist.md) -- Archives legacy code before removal
- [**Unified Orchestrator**](@/agents/unified-orchestrator.md) -- Coordinates multi-agent migration tasks

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to manage legacy system replacement across the platform's umbrella applications.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)