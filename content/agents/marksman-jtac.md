+++
title = "marksman-jtac"
weight = 247
[extra]
domain = "primary-producer"
level = "L2"
description = "Precision targeting and tactical coordination specialist"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2150
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["marksman-jtac", "Precision", "agents", "agent", "Prismatic Platform", "Target", "Phase", "JTAC"]
tags = ["agents", "agent", "marksman-jtac", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "marksman-jtac - Prismatic Platform"
+++

## Overview

The marksman-jtac agent operates as an L2 Tactical Operations authority within the Prismatic Platform's primary-producer domain, functioning as the precision targeting and Joint Terminal Attack Controller (JTAC) for coordinated multi-agent operations. Drawing from military JTAC doctrine adapted for software operations, this agent specializes in directing the precise application of platform resources to high-value targets -- whether those targets are critical bugs, performance bottlenecks, security vulnerabilities, or complex refactoring objectives that require coordinated multi-agent engagement.

Built on the [AIAD](/glossary/aiad/) standard and operating within the [mycelial network](/glossary/mycelial-network/), the marksman-jtac serves as the tactical coordination layer between [strategic command](/glossary/strategic-command/) agents and specialist execution agents. The agent applies the [NO MERCY](/glossary/no-mercy/) doctrine to target engagement: once a target is designated and engagement authorized, operations proceed to complete resolution without half-measures. The [NO DOUBTS](/glossary/no-doubts/) principle governs target identification -- every target designation requires verified intelligence from at least two independent assessment sources.

The marksman-jtac addresses a fundamental challenge in multi-agent systems: the coordination problem. When multiple specialist agents must work together to resolve a complex issue, the absence of a tactical coordinator leads to duplicated effort, conflicting actions, and incomplete resolution. The JTAC role ensures that specialist capabilities are applied in the right order, to the right targets, with the right timing -- maximizing impact while minimizing collateral disruption.

## Architecture

The marksman-jtac implements a targeting cycle architecture adapted from military JTAC operations for software platform operations.

```
Intelligence Inputs            Targeting Cycle                  Engagement Outputs
+------------------+        +--------------------+           +------------------+
| Quality Scanner  |---+    | FIND               |           | Target Package   |
+------------------+   |    | (Target Discovery) |---+       | (Prioritized)    |
| Perf Profiler    |---+--->+--------------------+   |   +-->+------------------+
+------------------+   |    | FIX                |   |   |   | Engagement Plan  |
| Security Scanner |---+    | (Target Isolation) |---+---+   | (Sequenced)      |
+------------------+   |    +--------------------+   |   |   +------------------+
| Code Analyzer    |---+    | TRACK              |   |   |   | BDA Report       |
+------------------+        | (Target Monitor)   |---+   +-->| (Verification)   |
                            +--------------------+   |       +------------------+
                            | TARGET             |   |
                            | (Resource Assign)  |---+
                            +--------------------+
                            | ENGAGE             |
                            | (Execute Strike)   |---+
                            +--------------------+   |
                            | ASSESS             |   |
                            | (Verify Complete)  |---+
                            +--------------------+
```

The six-phase targeting cycle (Find, Fix, Track, Target, Engage, Assess -- F2T2EA) ensures that every engagement is intelligence-driven, precisely directed, and verified upon completion. No phase can be skipped, and the cycle must complete fully before a target is marked as resolved.

## Core Capabilities

The marksman-jtac provides tactical coordination through several specialized capability domains.

**Precision Target Designation** identifies and prioritizes high-value targets using intelligence from scanning and analysis agents. Target priority is computed from a multi-factor model incorporating impact severity (how much damage the target causes), exposure risk (how likely the target is to be triggered), remediation cost (effort required for resolution), and dependency criticality (how many other systems are affected). Targets are classified into engagement categories: immediate (must be resolved within the current cycle), planned (scheduled for near-term resolution), and deferred (acknowledged but not currently blocking).

**Multi-Agent Engagement Coordination** orchestrates concurrent operations across multiple specialist agents, managing timing dependencies, resource conflicts, and engagement sequencing for complex multi-phase operations. The coordination engine maintains a real-time operational picture showing all active engagements, agent availability, and resource utilization, enabling dynamic reallocation when priorities shift.

**Battle Damage Assessment (BDA)** verifies that targeted operations achieved their objectives through post-engagement validation. BDA includes regression test confirmation (the fix resolves the issue), quality gate re-evaluation (no new issues introduced), and performance verification (system characteristics meet targets). No target is marked as resolved until BDA confirms complete resolution.

**Terminal Guidance** provides real-time tactical direction to executing agents during complex operations. When an engagement encounters unexpected conditions (e.g., a bug fix reveals a deeper architectural issue), the marksman-jtac adjusts the approach in real-time, redirecting specialist agents or escalating to strategic command for expanded authorization.

**Engagement Sequencing** determines the optimal order of operations for multi-target engagements, accounting for dependencies between targets, resource contention between concurrent operations, and strategic priorities that may override tactical optimization.

**Situational Awareness Maintenance** continuously monitors the operational environment, tracking active engagements, emerging targets, resource availability, and environmental conditions that affect engagement planning.

## Implementation

```elixir
defmodule Prismatic.Tactical.MarksmanJTAC do
  @moduledoc """
  L2 Tactical Operations agent for precision targeting and multi-agent coordination.
  Implements F2T2EA targeting cycle for platform operations.
  """

  use GenServer
  require Logger

  alias Prismatic.Tactical.{TargetDesignator, EngagementPlanner, BattleDamageAssessor}
  alias Prismatic.Tactical.{ResourceAllocator, SituationalAwareness}

  @targeting_phases [:find, :fix, :track, :target, :engage, :assess]
  @priority_categories [:immediate, :planned, :deferred]

  defstruct [:operation_id, :targets, :engagements, :resources, :situation]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec designate_target(map()) :: {:ok, map()} | {:error, term()}
  def designate_target(target_intel) do
    GenServer.call(__MODULE__, {:designate, target_intel}, 30_000)
  end

  @spec engage(String.t()) :: {:ok, :engaged} | {:error, term()}
  def engage(target_id) do
    GenServer.call(__MODULE__, {:engage, target_id}, 300_000)
  end

  @impl true
  def handle_call({:designate, intel}, _from, state) do
    :telemetry.execute(
      [:prismatic, :tactical, :jtac, :designation],
      %{timestamp: System.monotonic_time()},
      %{target_type: intel.type}
    )

    with {:ok, target} <- TargetDesignator.validate_and_prioritize(intel),
         {:ok, plan} <- EngagementPlanner.plan(target, state.resources),
         {:ok, allocated} <- ResourceAllocator.allocate(plan) do
      {:reply, {:ok, %{target: target, plan: plan}}, add_target(state, target, plan)}
    else
      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  @impl true
  def handle_call({:engage, target_id}, _from, state) do
    with {:ok, target} <- get_target(state, target_id),
         {:ok, result} <- execute_engagement(target, state),
         {:ok, bda} <- BattleDamageAssessor.assess(target, result) do
      {:reply, {:ok, :engaged}, mark_resolved(state, target_id, bda)}
    else
      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end
end
```

## Integration Points

| Integration Target | Relationship | Data Flow |
|-------------------|-------------|-----------|
| [code-quality-commander](/agents/code-quality-commander/) | Receives target intelligence from quality scanning operations | Inbound |
| [performance-profiling-agent](/agents/performance-profiling-agent/) | Sources performance bottleneck targets for precision engagement | Inbound |
| [opportunity-analyzer](/agents/opportunity-analyzer/) | Identifies high-value improvement opportunities for targeting | Inbound |
| Specialist execution agents | Directs tactical operations during active engagements | Outbound |
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management | Infrastructure |
| Prismatic Telemetry | Engagement [metrics](/glossary/metrics/) and coordination efficiency tracking | Outbound |
| [SEADF](/glossary/seadf/) | Self-healing integration for automated target identification | Bidirectional |

## Operational Workflow

**Phase 1 -- FIND (Target Discovery)**: Collect intelligence from scanning agents, profilers, and analyzers to identify potential targets. Filter and validate targets against engagement criteria.

**Phase 2 -- FIX (Target Isolation)**: Isolate the target's exact location, scope, and characteristics. Determine engagement requirements including specialist agents needed, estimated effort, and dependency impacts.

**Phase 3 -- TRACK (Target Monitoring)**: Maintain continuous awareness of target status, monitoring for changes in severity, scope, or priority that may affect engagement planning.

**Phase 4 -- TARGET (Resource Assignment)**: Assign specialist agents and resources to the engagement. Resolve resource conflicts with concurrent operations. Produce sequenced engagement plan.

**Phase 5 -- ENGAGE (Execute Strike)**: Execute the engagement according to plan, providing terminal guidance to specialist agents. Monitor progress and adjust approach as needed.

**Phase 6 -- ASSESS (Battle Damage Assessment)**: Verify engagement success through regression tests, quality gates, and performance checks. Confirm complete resolution before marking target as closed.

## NABLA Compliance

| Axiom | JTAC Application |
|-------|------------------|
| Signal Plurality | Target designation requires intelligence from minimum two assessment sources |
| Contradiction Preservation | Conflicting severity assessments are escalated for resolution |
| Absence Informative | Missing impact data increases target priority for investigation |
| Time Decay | Target intelligence expires; stale targets require re-assessment |
| Unknown Valid | Unknown target scope triggers expanded reconnaissance before engagement |
| Source Independence | Independent scanning sources provide non-correlated target validation |
| Provenance Mandatory | Every engagement decision traces to specific intelligence sources |

## Configuration

```elixir
config :prismatic_tactical, Prismatic.Tactical.MarksmanJTAC,
  engagement_timeout_ms: 300_000,
  max_concurrent_engagements: 5,
  bda_verification_required: true,
  priority_recalculation_interval: :hourly,
  min_intelligence_sources: 2,
  telemetry_prefix: [:prismatic, :tactical, :jtac]
```

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Target designation | < 5s | 1.8s (P95) |
| Engagement planning | < 10s | 4.2s (P95) |
| Full F2T2EA cycle | < 5min | 2.5min (P95) |
| BDA verification | < 30s | 12s (P95) |
| Concurrent engagements | 5+ | 8 tested |
| Coordination overhead | < 10% | 6% measured |

## Related Resources

- [code-quality-commander](/agents/code-quality-commander/) -- Quality target intelligence provider
- [performance-profiling-agent](/agents/performance-profiling-agent/) -- Performance bottleneck targets
- [opportunity-analyzer](/agents/opportunity-analyzer/) -- Improvement opportunity identification
- [AIAD Standard](/glossary/aiad/) -- Agent specification framework
- [NO MERCY, NO DOUBTS Doctrine](/glossary/no-mercy/) -- Engagement doctrine
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework for target intelligence
- [Mycelial Network](/glossary/mycelial-network/) -- Inter-agent coordination infrastructure
- [SEADF](/glossary/seadf/) -- Self-healing target identification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)