+++
title = "Strategic Command"
weight = 15
[extra]
category = "agents"
description = "L4 Multi-domain coordination agent tier for cross-cutting operations that bridge specialist teams and supreme authority"
related_terms = ["agent-tier", "tactical-execution", "supreme-commander", "aiad", "archer-supreme", "red-team", "blue-team", "purple-team", "color-teams"]
difficulty = "advanced"
importance = "high"
platform_relevance = "core"
date_created = "2025-05-01"
date_updated = "2026-02-22"
version = "2.0.0"
audience = ["platform-architects", "agent-developers", "operations-engineers", "security-engineers"]
prerequisites = ["aiad", "agent-tier", "otp"]
domain = "agent-systems"
related_patterns = ["command-hierarchy", "escalation-protocol", "multi-domain-coordination", "topological-task-execution", "delegation-pattern"]
see_also = ["architecture", "agents", "commands"]
acronyms = ["AIAD", "L1", "L2", "L3", "L4", "L5", "DAG", "SEADF"]
standards = ["AIAD-Agent-Specification-v2", "NO-MERCY-NO-DOUBTS-Doctrine"]
tools = ["mix", "telemetry", "genserver", "task-supervisor"]
platforms = ["beam", "otp", "prismatic-platform"]
keywords = ["strategic command agent", "multi-domain coordination", "agent hierarchy L4", "cross-cutting operations", "escalation protocol", "agent orchestration", "command and control", "AIAD strategic tier"]
tags = ["agents", "coordination", "architecture", "command-hierarchy", "multi-domain"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1192
date_modified = "2026-02-23"
quality_score = 80
image = "/images/sections/glossary.png"
image_alt = "Strategic Command - Prismatic Platform"
+++

## Definition and Overview

Strategic Command is the L4 agent tier responsible for multi-domain coordination and cross-cutting operational management within the Prismatic Platform's [AIAD](/glossary/aiad/) agent hierarchy. L4 agents bridge the gap between L2-L3 domain specialists who operate within focused areas and L5 Supreme agents who provide platform-wide authority. They manage complex workflows that span application boundaries, coordinate between specialist teams, and serve as the escalation gateway to Supreme authority when operations exceed their defined scope.

In military and organizational theory, strategic command sits between tactical execution (the hands-on specialists) and supreme command (the ultimate authority). This middle tier is critical because most real-world operations cross domain boundaries: a security improvement involves quality gates, code changes, testing, deployment, and monitoring -- no single specialist domain covers all these aspects. Without strategic coordination, domain specialists optimize locally but fail to deliver integrated outcomes.

The Prismatic Platform's agent hierarchy consists of five tiers, with L4 Strategic Command serving as the coordination hub that transforms high-level objectives from [Supreme Commander](/glossary/supreme-commander/) into actionable multi-phase plans executed by L2-L3 specialists:

| Tier | Level | Count | Role | Scope |
|------|-------|-------|------|-------|
| L1 | Assistant | ~50 | Basic task execution | Single function |
| L2 | Specialist | ~250 | Domain expertise | Single domain |
| L3 | Commander | ~80 | Team coordination | Single team |
| **L4** | **Strategic** | **~20** | **Multi-domain coordination** | **Cross-domain** |
| L5 | Supreme | ~4 | Platform-wide authority | Entire platform |

Strategic Command agents represent approximately 4% of the 530-agent fleet but handle the most operationally complex scenarios because they must understand multiple domains well enough to coordinate between them effectively. Each L4 agent maintains a coordination model spanning 2-4 domains and delegates single-domain tasks downward while escalating platform-wide concerns upward.

## Historical Context and Design Rationale

The L4 Strategic Command tier emerged from the Prismatic Platform's evolution through Generation 8-10, where increasing agent count (from ~100 to ~300 agents) revealed that a flat or two-tier hierarchy could not handle cross-domain operations efficiently. Early platform versions had L3 Commanders attempting to coordinate across domains, which created two failure modes:

1. **Authority gaps**: L3 agents in domain A could not direct L3 agents in domain B, leading to deadlocks when cross-domain cooperation was needed.
2. **Supreme overload**: Without a middle tier, every cross-domain operation escalated to L5, overwhelming the 4 Supreme agents with routine coordination tasks.

The introduction of L4 Strategic Command in Generation 10 resolved both issues by creating explicit multi-domain authority with clear escalation criteria. This mirrors organizational theory (James D. Thompson's "Organizations in Action") where mediating technology coordinates interdependent units -- L4 agents are the platform's mediating technology.

The NO MERCY, NO DOUBTS doctrine applies differently at L4 than at other tiers. L4 agents operate in the transition zone between the NABLA Infinity exploration phase (where uncertainty is mapped and contradictions preserved) and the decisive execution phase. They must determine when confidence threshold (0.95 for critical decisions) is met across multiple domains before committing to a coordination plan.

## L4 Agent Classification

L4 agents are classified based on their coordination scope and authority boundaries:

```elixir
defmodule PrismaticAgents.Tier.StrategicCommand do
  @moduledoc """
  L4 Strategic Command agent tier.
  Coordinates multi-domain operations and manages escalation
  between L2-L3 specialists and L5 Supreme authority.
  """

  @type l4_agent :: %{
    call_sign: String.t(),
    tier: :l4_strategic,
    coordination_domains: [atom()],
    authority_scope: authority_scope(),
    escalation_target: module(),
    subordinate_teams: [atom()],
    max_concurrent_operations: pos_integer()
  }

  @type authority_scope :: %{
    can_coordinate: [atom()],
    can_override: [atom()],
    must_escalate: [atom()],
    max_resource_allocation: non_neg_integer(),
    max_domains: pos_integer()
  }

  @spec classify_operation(map()) ::
          {:delegate, :l3_commander, atom()}
          | {:l4_strategic, map()}
          | {:escalate, :l5_supreme}
  def classify_operation(operation) do
    domains = identify_domains(operation)

    cond do
      length(domains) <= 1 ->
        {:delegate, :l3_commander, List.first(domains)}

      length(domains) <= 4 and within_authority?(operation) ->
        {:l4_strategic, %{
          domains: domains,
          coordination_plan: plan_coordination(domains),
          estimated_complexity: estimate_complexity(operation),
          estimated_duration: estimate_duration(operation)
        }}

      true ->
        {:escalate, :l5_supreme}
    end
  end

  defp within_authority?(operation) do
    not requires_platform_override?(operation) and
      not involves_critical_infrastructure?(operation) and
      estimated_impact(operation) < :high
  end
end
```

## Multi-Domain Coordination Engine

The core capability of L4 agents is orchestrating work across multiple domain-specific teams. The coordination engine decomposes high-level objectives into a directed acyclic graph (DAG) of domain-specific phases, resolves dependencies between phases, and executes them with appropriate concurrency:

```elixir
defmodule PrismaticAgents.StrategicCommand.Coordinator do
  @moduledoc """
  Orchestrates multi-domain operations by decomposing high-level
  objectives into domain-specific tasks and managing their execution.
  Implements topological sorting for dependency resolution and
  parallel execution within dependency-safe groups.
  """

  use GenServer

  @type coordination_plan :: %{
    objective: String.t(),
    domains: [atom()],
    phases: [phase()],
    dependencies: [{atom(), atom()}],
    timeout: non_neg_integer(),
    rollback_strategy: :compensate | :abort | :manual
  }

  @type phase :: %{
    name: atom(),
    domain: atom(),
    tasks: [task()],
    depends_on: [atom()],
    status: :pending | :active | :completed | :failed | :rolled_back
  }

  @type task :: %{
    id: String.t(),
    domain: atom(),
    agent: module(),
    action: atom(),
    args: map(),
    status: :pending | :running | :completed | :failed,
    result: term() | nil
  }

  @spec execute_plan(coordination_plan()) :: {:ok, map()} | {:error, term()}
  def execute_plan(plan) do
    GenServer.call(__MODULE__, {:execute, plan}, plan.timeout)
  end

  @impl true
  def handle_call({:execute, plan}, _from, state) do
    :telemetry.execute(
      [:prismatic, :agents, :strategic_command, :plan_started],
      %{phase_count: length(plan.phases)},
      %{objective: plan.objective, domains: plan.domains}
    )

    result =
      plan.phases
      |> topological_sort(plan.dependencies)
      |> execute_sorted_phases(plan)

    :telemetry.execute(
      [:prismatic, :agents, :strategic_command, :plan_completed],
      %{},
      %{objective: plan.objective, result: elem(result, 0)}
    )

    {:reply, result, state}
  end

  defp execute_sorted_phases(sorted_phases, plan) do
    Enum.reduce_while(sorted_phases, {:ok, %{}}, fn phase_group, {:ok, results} ->
      case execute_phase_group(phase_group, results) do
        {:ok, group_results} ->
          {:cont, {:ok, Map.merge(results, group_results)}}

        {:error, reason} ->
          case plan.rollback_strategy do
            :compensate -> {:halt, compensate(results, reason)}
            :abort -> {:halt, {:error, reason}}
            :manual -> {:halt, {:error, {:manual_intervention, reason, results}}}
          end
      end
    end)
  end

  defp execute_phase_group(phases, previous_results) do
    phases
    |> Task.async_stream(fn phase ->
      context = build_context(phase, previous_results)
      execute_phase(phase, context)
    end, max_concurrency: 4, timeout: 30_000)
    |> Enum.reduce({:ok, %{}}, fn
      {:ok, {:ok, {name, result}}}, {:ok, acc} -> {:ok, Map.put(acc, name, result)}
      {:ok, {:error, reason}}, _acc -> {:error, reason}
      {:exit, reason}, _acc -> {:error, {:task_exit, reason}}
    end)
  end
end
```

## Escalation Protocol

L4 agents follow a defined escalation protocol for operations exceeding their authority. The protocol is implemented as a first-class module with [telemetry](/glossary/telemetry/) instrumentation for audit trail compliance:

```elixir
defmodule PrismaticAgents.StrategicCommand.EscalationProtocol do
  @moduledoc """
  Manages escalation from L4 Strategic Command to L5 Supreme agents.
  Defines clear criteria for when operations must be escalated.
  All escalations are logged via telemetry for audit compliance.
  """

  @type escalation_reason ::
    :authority_exceeded
    | :critical_infrastructure
    | :platform_override_needed
    | :cross_cutting_impact
    | :emergency_situation
    | :confidence_below_threshold

  @escalation_criteria [
    {:authority_exceeded, "Operation requires override of more than 4 domain restrictions"},
    {:critical_infrastructure, "Operation modifies supervision trees, release config, or deployment"},
    {:platform_override_needed, "Operation requires bypassing quality gates or safety checks"},
    {:cross_cutting_impact, "Operation impacts more than 50% of umbrella applications"},
    {:emergency_situation, "Operation is triggered by EMERGENCY enforcement level"},
    {:confidence_below_threshold, "NABLA confidence < 0.95 for critical decision"}
  ]

  @spec should_escalate?(map()) :: {:escalate, escalation_reason()} | :proceed
  def should_escalate?(operation) do
    Enum.find_value(@escalation_criteria, :proceed, fn {reason, _desc} ->
      if matches_criterion?(operation, reason) do
        {:escalate, reason}
      end
    end)
  end

  @spec escalate_to_supreme(map(), escalation_reason()) :: {:ok, term()} | {:error, term()}
  def escalate_to_supreme(operation, reason) do
    :telemetry.execute(
      [:prismatic, :agents, :escalation],
      %{timestamp: System.monotonic_time()},
      %{from: :l4_strategic, to: :l5_supreme, reason: reason, operation: operation.id}
    )

    PrismaticAgents.SupremeCommander.handle_escalation(operation, reason)
  end
end
```

## Cross-Team Synthesis

L4 agents coordinate between [Color Teams](/glossary/color-teams/) when operations require input from multiple security perspectives. This is the most complex coordination pattern because it involves adversarial-cooperative dynamics:

```elixir
defmodule PrismaticAgents.StrategicCommand.CrossTeamSynthesis do
  @moduledoc """
  Coordinates cross-team operations between Color Teams.
  Ensures findings from different teams are synthesized coherently.
  Implements the Red-Blue-Purple synthesis loop.
  """

  @type audit_result :: %{
    target: String.t(),
    red_findings: [map()],
    blue_posture: map(),
    white_proofs: [map()],
    purple_synthesis: map(),
    overall_assessment: :secure | :at_risk | :compromised
  }

  @spec coordinate_security_audit(String.t()) :: {:ok, audit_result()} | {:error, term()}
  def coordinate_security_audit(target) do
    # Phase 1: Parallel assessment by Red, Blue, and White teams
    tasks = %{
      red: Task.async(fn -> PrismaticDark.Red.Commander.assess(target) end),
      blue: Task.async(fn -> PrismaticDark.Blue.Commander.assess(target) end),
      white: Task.async(fn -> PrismaticDark.White.Commander.verify(target) end)
    }

    # Collect results with timeouts
    results = Map.new(tasks, fn {team, task} ->
      {team, Task.await(task, 60_000)}
    end)

    # Phase 2: Purple Team synthesis of all findings
    case PrismaticDark.Purple.Coordinator.synthesize(%{
      red: results.red,
      blue: results.blue,
      white: results.white,
      target: target
    }) do
      {:ok, synthesis} ->
        {:ok, %{
          target: target,
          red_findings: extract_findings(results.red),
          blue_posture: extract_posture(results.blue),
          white_proofs: extract_proofs(results.white),
          purple_synthesis: synthesis,
          overall_assessment: synthesis.assessment
        }}

      {:error, reason} ->
        {:error, {:synthesis_failed, reason}}
    end
  end
end
```

## L4 Agents in the Platform

The platform includes approximately 20 L4 Strategic Command agents, each with defined domain coverage and coordination authority:

| Agent | Domain Coverage | Primary Function | Max Domains |
|-------|----------------|-----------------|-------------|
| Security Audit Coordinator | Red + Blue + White + Purple | Multi-team security assessment | 4 |
| Quality Campaign Manager | Quality + Safety + CI | Cross-domain quality improvement | 3 |
| Deployment Coordinator | CI + Release + Monitoring | Multi-stage deployment orchestration | 3 |
| EASM Orchestrator | Perimeter + Intelligence + Rating | External assessment coordination | 3 |
| Evolution Strategist | AutoEvolve + SEADF + Quality DNA | Platform evolution planning | 3 |
| Compliance Coordinator | SOC2 + NIS2 + ZKB + GDPR | Multi-framework compliance | 4 |
| OSINT Campaign Manager | Czech + Global + Sanctions | Multi-source intelligence collection | 3 |

## Command and Control Hierarchy

```
L5 Supreme Commander / Archer Supreme (4 agents)
        |
        +-- L4 Strategic Command (cross-domain coordination, ~20 agents)
        |       |
        |       +-- L3 Red Commander (red team coordination)
        |       +-- L3 Blue Commander (blue team coordination)
        |       +-- L3 Purple Coordinator (synthesis coordination)
        |       +-- L3 White Commander (verification coordination)
        |       +-- L3 Quality Gate Operator
        |       +-- L3 QDP Elimination Lead
        |
        +-- L4 Quality Campaign Manager
        |       |
        |       +-- L2 Domain Specialists (13 quality domains)
        |       +-- L2 Credo Specialists
        |       +-- L2 Dialyzer Specialists
        |
        +-- L4 EASM Orchestrator
                |
                +-- L3 Perimeter Scanner Coordinator
                +-- L2 DNS Enumeration Specialist
                +-- L2 Certificate Transparency Specialist
                +-- L2 Security Rating Calculator
```

## Authority Boundaries

| Authority | L4 Can Do | L4 Must Escalate |
|-----------|----------|-----------------|
| Coordination | Coordinate up to 4 domains | 5+ domains require L5 |
| Override | Override L2-L3 decisions within scope | Platform-wide overrides require L5 |
| Resources | Allocate within predefined budgets | Budget exceeding threshold requires L5 |
| Timeline | Manage operations up to 1 week | Multi-week operations require L5 |
| Impact | Changes affecting specific domains | Changes affecting 50%+ of platform (57+ apps) |
| Quality Gates | Enforce within coordinated domains | Bypass quality gates requires L5 |
| Agent Creation | Spawn temporary L1 agents | Create permanent agents requires L5 |

## Usage in the Prismatic Platform

### Invoking Strategic Command

```elixir
# Multi-domain security audit
{:ok, result} = PrismaticAgents.StrategicCommand.coordinate_security_audit("example.com")

# Cross-domain quality campaign
{:ok, result} = PrismaticAgents.StrategicCommand.Coordinator.execute_plan(%{
  objective: "Eliminate remaining QDP in perimeter domain",
  domains: [:quality, :perimeter, :testing],
  phases: [
    %{name: :audit, domain: :quality, tasks: [...]},
    %{name: :fix, domain: :perimeter, tasks: [...]},
    %{name: :verify, domain: :testing, tasks: [...]}
  ],
  dependencies: [{:fix, :audit}, {:verify, :fix}],
  timeout: :timer.hours(2),
  rollback_strategy: :compensate
})
```

### CLI Commands

```bash
# Activate strategic coordination
/orchestrate --scope=security --target=perimeter

# View L4 agent status
/agent-status --tier=l4

# Escalate to Supreme
/escalate --reason=critical_infrastructure

# View coordination plans
/strategic-command plans --active
```

## Best Practices

1. **Define clear authority boundaries**. L4 agents should know exactly what they can do and when they must escalate. Ambiguous boundaries lead to either paralysis (always escalating) or overreach (never escalating). The Prismatic Platform encodes boundaries as data in the agent specification rather than relying on runtime judgment.

2. **Plan coordination phases before execution**. Multi-domain operations should be planned as a directed acyclic graph of phases with explicit dependencies, not executed as ad-hoc sequences. The topological sort guarantees deadlock-free execution ordering.

3. **Monitor phase dependencies for deadlocks**. When phases depend on each other, circular dependencies can cause deadlocks. Use topological sorting to detect cycles before execution begins. The coordinator raises `{:error, :circular_dependency}` when cycles are detected.

4. **Communicate across teams through structured interfaces**. L4 agents should not reach into L2-L3 agent internals. Use the defined command interfaces for all cross-team communication, preserving encapsulation and enabling independent evolution of specialist agents.

5. **Log coordination decisions for audit**. Strategic decisions about domain coordination, resource allocation, and escalation are logged via [telemetry](/glossary/telemetry/) for post-operation review and compliance evidence.

6. **Implement rollback strategies**. Multi-domain operations can fail partway through. L4 agents must define rollback strategies (compensate, abort, or manual) for each coordination plan to maintain system consistency.

## Common Pitfalls

- **Becoming a bottleneck**: If all cross-domain communication must flow through L4, the coordination layer becomes a throughput bottleneck. Allow direct L3-to-L3 communication for routine operations that do not require strategic oversight.

- **Over-coordinating simple operations**: Not every multi-domain operation needs L4 coordination. Two-domain operations with clear boundaries can be handled at L3 level through direct delegation.

- **Escalating too aggressively**: L5 Supreme agents handle platform-wide authority. Escalating routine cross-domain operations wastes Supreme authority on tactical decisions.

- **Ignoring escalation criteria**: Failing to escalate when criteria are met is as dangerous as over-escalating. Critical infrastructure changes must always reach L5 regardless of L4 confidence level.

- **Mixing coordination with execution**: L4 agents coordinate; they do not execute domain-specific tasks directly. An L4 agent that starts performing L2 work has lost its coordination perspective.

## Related Concepts

- [Agent Tier](/glossary/agent-tier/) - Full L1-L5 classification system
- [Tactical Execution](/glossary/tactical-execution/) - L2 specialists coordinated by L4
- [Supreme Commander](/glossary/supreme-commander/) - L5 authority receiving L4 escalations
- [Archer Supreme](/glossary/archer-supreme/) - Crisis-focused L5 agent
- [AIAD](/glossary/aiad/) - Agent definition standard for all tiers
- [Purple Team](/glossary/purple-team/) - Cross-team synthesis at L3
- [Color Teams](/glossary/color-teams/) - Six-team security operations framework coordinated by L4
- [GenServer](/glossary/genserver/) - OTP process model backing agent coordination
- [Telemetry](/glossary/telemetry/) - Instrumentation for coordination monitoring

## See Also

- [Architecture](/architecture/) - Platform architecture overview
- [Agents](/agents/) - Full agent catalog
- [Commands](/commands/) - Command catalog including strategic operations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
