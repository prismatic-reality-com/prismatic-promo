+++
title = "Supreme Commander"
weight = 14
[extra]
description = "L5 Platform-wide strategic coordination agent with full orchestration authority"
category = "agents"
related_terms = ["agent-tier", "archer-supreme", "aiad", "strategic-command", "agent-registry"]
tier = "TIER 1"
domain = "Agent Orchestration"
platform_integration = "PrismaticAgents"
maturity = "Production"
complexity = "Expert"
audience = ["platform-architects", "agent-developers", "operations-engineers"]
key_benefits = ["parallel-orchestration", "cross-domain-coordination", "10x-efficiency", "strategic-governance"]
prerequisites = ["agent-tier", "aiad", "genserver"]
authority_level = "L5 Supreme"
scope = "Platform-wide"
activation_commands = ["/orchestrate", "/supreme-coordinator"]
override_capability = "All L1-L4 agents"
audit_requirement = "Mandatory"
escalation_target = "None (highest authority)"
process_model = "GenServer"
telemetry_namespace = "prismatic.supreme_commander"
coordination_model = "Topological layer parallelism"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1034
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Supreme", "Commander", "Platform-wide", "glossary", "agents", "Prismatic Platform", "Supreme Commander", "Archer Supreme"]
tags = ["glossary", "agents", "supreme-commander", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Supreme Commander - Prismatic Platform"
+++

## Definition and Overview

Supreme Commander is an L5 Supreme authority agent responsible for platform-wide strategic coordination and orchestration across the entire Prismatic Platform ecosystem. Operating at the highest classification level in the agent hierarchy, Supreme Commander manages cross-domain operations, coordinates multiple agent teams simultaneously, ensures strategic alignment across all 115 applications, and provides the ultimate decision-making authority for complex operations that exceed the scope of L4 Strategic Command agents.

Unlike Archer Supreme, which specializes in crisis intervention and impossible mission execution, Supreme Commander provides ongoing strategic governance for routine complex operations. Where Archer Supreme is activated for emergencies, Supreme Commander is the persistent orchestration layer that ensures the platform's 530+ runtime agents work coherently toward strategic objectives. The distinction is analogous to a standing military command structure (Supreme Commander) versus a special operations force deployed for specific crises (Archer Supreme).

The L5 classification grants Supreme Commander capabilities unavailable to lower tiers: platform-wide resource allocation, override authority for any L1-L4 agent decision, cross-domain priority management, and the ability to restructure agent coordination patterns in real time. These capabilities come with corresponding accountability -- Supreme Commander decisions are audited through the AIAD registry and subject to NABLA Infinity epistemic requirements.

Supreme Commander is activated via the `/supreme-coordinator` and `/orchestrate` commands. The 10x efficiency claim associated with `/orchestrate` stems from Supreme Commander's ability to identify parallelizable operations across domains and execute them concurrently rather than sequentially, dramatically reducing end-to-end completion time for complex multi-domain workflows.

## Agent Hierarchy and Authority Model

The L5 authority level represents the apex of the Prismatic agent hierarchy. Understanding the full hierarchy is essential for grasping the scope of Supreme Commander's authority and the constraints that govern its exercise.

### Full Hierarchy

| Level | Title | Scope | Agent Count | Example |
|-------|-------|-------|-------------|---------|
| **L5** | Supreme | Platform-wide | 2 | Supreme Commander, Archer Supreme |
| **L4** | Strategic Command | Multi-domain (up to 4) | ~10 | Evolution Strategist, Quality Director |
| **L3** | Team Commander | Single domain | ~50 | Red Commander, Blue Commander, Elixir Architect |
| **L2** | Specialist | Function-specific | ~200 | Epistemic Attacker, Drift Detector, Contract Validator |
| **L1** | Worker | Task-specific | ~270 | Individual checkers, formatters, scanners |

The authority model follows a strict hierarchy where higher-level agents can override, reassign, or terminate operations at lower levels. Supreme Commander alone can override L4 decisions, coordinate all Color Teams simultaneously, and allocate resources across the entire platform without seeking approval from any other agent.

### Authority Boundaries

Even at L5, Supreme Commander operates within defined boundaries:

```elixir
defmodule PrismaticAgents.SupremeCommander.AuthorityBoundary do
  @moduledoc "Defines the authority boundaries and constraints for L5 Supreme operations."

  @type authority :: %{
    level: :l5_supreme,
    scope: :platform_wide,
    override: :all_lower_tiers,
    resource_limit: :unlimited,
    escalation_target: :none,
    audit_requirement: :mandatory,
    nabla_compliance: :required,
    doctrine_compliance: :no_mercy_no_doubts
  }

  @type constraint :: %{
    max_concurrent_orchestrations: pos_integer(),
    safety_checks_required: boolean(),
    rollback_capability: :mandatory,
    epistemic_validation: :trinity_gate
  }

  @spec validate_authority(map()) :: {:ok, :authorized} | {:error, term()}
  def validate_authority(operation) do
    with :ok <- check_doctrine_compliance(operation),
         :ok <- check_nabla_axioms(operation),
         :ok <- check_safety_constraints(operation),
         :ok <- check_audit_trail(operation) do
      {:ok, :authorized}
    end
  end

  defp check_doctrine_compliance(%{priority: :p0_critical}), do: :ok
  defp check_doctrine_compliance(%{quality_gates_passed: true}), do: :ok
  defp check_doctrine_compliance(_), do: {:error, :doctrine_violation}

  defp check_nabla_axioms(%{evidence_sources: sources}) when length(sources) >= 2, do: :ok
  defp check_nabla_axioms(_), do: {:error, :signal_plurality_violation}

  defp check_safety_constraints(%{rollback_plan: plan}) when not is_nil(plan), do: :ok
  defp check_safety_constraints(_), do: {:error, :missing_rollback_plan}

  defp check_audit_trail(%{audit_enabled: true}), do: :ok
  defp check_audit_trail(_), do: {:error, :audit_trail_required}
end
```

## Technical Deep Dive

### L5 Authority Model

Supreme Commander operates with the highest authority level in the platform:

```elixir
defmodule PrismaticAgents.SupremeCommander do
  @moduledoc """
  L5 Supreme authority agent for platform-wide orchestration.
  Highest classification with full platform access and override.
  """

  use GenServer

  @type orchestration_request :: %{
    objective: String.t(),
    domains: [atom()],
    priority: :p0_critical | :p1_high | :p2_normal | :p3_low,
    constraints: map(),
    requestor: String.t()
  }

  @type orchestration_result :: %{
    status: :completed | :partial | :failed,
    phases_completed: non_neg_integer(),
    phases_total: non_neg_integer(),
    duration_ms: non_neg_integer(),
    domain_results: %{atom() => term()},
    efficiency_multiplier: float()
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    {:ok, %{
      active_orchestrations: %{},
      agent_registry: load_agent_registry(),
      resource_allocations: %{},
      audit_log: []
    }}
  end

  @spec orchestrate(orchestration_request()) :: {:ok, orchestration_result()} | {:error, term()}
  def orchestrate(request) do
    GenServer.call(__MODULE__, {:orchestrate, request}, :infinity)
  end

  @impl true
  def handle_call({:orchestrate, request}, _from, state) do
    :telemetry.execute(
      [:prismatic, :supreme_commander, :orchestration_start],
      %{domains: length(request.domains)},
      %{objective: request.objective, priority: request.priority}
    )

    result = execute_orchestration(request, state)

    :telemetry.execute(
      [:prismatic, :supreme_commander, :orchestration_complete],
      %{duration_ms: result.duration_ms, efficiency: result.efficiency_multiplier},
      %{objective: request.objective, status: result.status}
    )

    new_state = record_audit_entry(state, request, result)
    {:reply, {:ok, result}, new_state}
  end

  defp record_audit_entry(state, request, result) do
    entry = %{
      timestamp: DateTime.utc_now(),
      objective: request.objective,
      domains: request.domains,
      priority: request.priority,
      status: result.status,
      duration_ms: result.duration_ms,
      efficiency: result.efficiency_multiplier
    }
    %{state | audit_log: [entry | state.audit_log]}
  end
end
```

### Parallel Domain Orchestration

The 10x efficiency comes from intelligent parallelization of domain operations:

```elixir
defmodule PrismaticAgents.SupremeCommander.ParallelOrchestrator do
  @moduledoc """
  Analyzes operation dependencies and maximizes parallelism
  across domain operations for order-of-magnitude efficiency gains.
  """

  @type dependency_graph :: %{atom() => [atom()]}

  @spec build_execution_plan(orchestration_request()) :: {:ok, [[atom()]]} | {:error, term()}
  def build_execution_plan(request) do
    graph = analyze_dependencies(request.domains)

    case detect_cycles(graph) do
      :no_cycles ->
        {:ok, topological_layers(graph)}

      {:cycle, path} ->
        {:error, {:dependency_cycle, path}}
    end
  end

  @spec execute_parallel(orchestration_request()) :: orchestration_result()
  def execute_parallel(request) do
    start_time = System.monotonic_time(:millisecond)

    case build_execution_plan(request) do
      {:ok, layers} ->
        results =
          Enum.reduce(layers, %{}, fn layer, acc ->
            layer_results =
              layer
              |> Task.async_stream(fn domain ->
                context = build_domain_context(domain, acc, request)
                {domain, execute_domain(domain, context)}
              end, max_concurrency: length(layer), timeout: 120_000)
              |> Enum.map(fn {:ok, result} -> result end)
              |> Map.new()

            Map.merge(acc, layer_results)
          end)

        end_time = System.monotonic_time(:millisecond)
        duration = end_time - start_time
        sequential_estimate = estimate_sequential_time(request.domains)
        efficiency = sequential_estimate / max(duration, 1)

        %{
          status: determine_status(results),
          phases_completed: map_size(results),
          phases_total: length(request.domains),
          duration_ms: duration,
          domain_results: results,
          efficiency_multiplier: Float.round(efficiency, 1)
        }

      {:error, reason} ->
        %{
          status: :failed,
          phases_completed: 0,
          phases_total: length(request.domains),
          duration_ms: 0,
          domain_results: %{},
          efficiency_multiplier: 0.0
        }
    end
  end

  defp topological_layers(graph) do
    do_topological_layers(graph, [], MapSet.new())
  end

  defp do_topological_layers(graph, layers, processed) do
    remaining = Map.drop(graph, MapSet.to_list(processed))

    if map_size(remaining) == 0 do
      Enum.reverse(layers)
    else
      layer =
        remaining
        |> Enum.filter(fn {_domain, deps} ->
          Enum.all?(deps, &MapSet.member?(processed, &1))
        end)
        |> Enum.map(fn {domain, _deps} -> domain end)

      new_processed = MapSet.union(processed, MapSet.new(layer))
      do_topological_layers(graph, [layer | layers], new_processed)
    end
  end
end
```

## Escalation Handling

Supreme Commander receives escalations from L4 Strategic Command agents when operations exceed their scope:

```elixir
defmodule PrismaticAgents.SupremeCommander.EscalationHandler do
  @moduledoc """
  Handles escalations from L4 Strategic Command agents.
  Applies Supreme authority to resolve operations exceeding L4 scope.
  """

  require Logger

  @type escalation_type :: :authority_exceeded | :critical_infrastructure | :emergency_situation | :cross_domain_conflict

  @spec handle_escalation(map(), escalation_type()) :: {:ok, term()} | {:error, term()}
  def handle_escalation(operation, :authority_exceeded) do
    Logger.info("Supreme Commander: Handling authority escalation for #{operation.objective}")
    grant_temporary_authority(operation)
  end

  def handle_escalation(operation, :critical_infrastructure) do
    Logger.warning("Supreme Commander: Critical infrastructure operation - #{operation.objective}")
    with {:ok, _} <- verify_safety(operation),
         {:ok, _} <- create_rollback_point(operation),
         {:ok, result} <- execute_with_monitoring(operation) do
      {:ok, result}
    end
  end

  def handle_escalation(operation, :emergency_situation) do
    Logger.error("Supreme Commander: EMERGENCY escalation - #{operation.objective}")
    PrismaticAgents.ArcherSupreme.activate(operation)
  end

  def handle_escalation(operation, :cross_domain_conflict) do
    Logger.warning("Supreme Commander: Cross-domain conflict resolution - #{operation.objective}")
    with {:ok, assessment} <- assess_conflict(operation),
         {:ok, resolution} <- resolve_conflict(assessment),
         :ok <- notify_affected_agents(resolution) do
      {:ok, resolution}
    end
  end

  defp verify_safety(operation) do
    checks = [
      &check_supervision_tree_impact/1,
      &check_data_integrity_impact/1,
      &check_availability_impact/1,
      &check_security_posture_impact/1
    ]

    Enum.reduce_while(checks, {:ok, operation}, fn check, {:ok, op} ->
      case check.(op) do
        :safe -> {:cont, {:ok, op}}
        {:unsafe, reason} -> {:halt, {:error, {:safety_check_failed, reason}}}
      end
    end)
  end
end
```

## Multi-Team Coordination

Supreme Commander coordinates all Color Teams for platform-wide security operations. This capability is unique to L5 authority -- no lower tier can orchestrate all six teams simultaneously:

```elixir
defmodule PrismaticAgents.SupremeCommander.ColorTeamCoordinator do
  @moduledoc """
  Coordinates all six Color Teams for platform-wide operations.
  Only L5 Supreme authority can orchestrate all teams simultaneously.
  """

  @type team_result :: {:ok, map()} | {:error, term()}

  @spec full_security_assessment() :: {:ok, map()} | {:error, term()}
  def full_security_assessment do
    gray = Task.async(fn -> PrismaticDark.Gray.Commander.explore() end)
    red = Task.async(fn -> PrismaticDark.Red.Commander.simulate() end)
    blue = Task.async(fn -> PrismaticDark.Blue.Commander.assess() end)
    white = Task.async(fn -> PrismaticDark.White.Commander.verify() end)
    black = Task.async(fn -> PrismaticDark.Black.Commander.model() end)

    results = %{
      gray: Task.await(gray, 120_000),
      red: Task.await(red, 120_000),
      blue: Task.await(blue, 120_000),
      white: Task.await(white, 120_000),
      black: Task.await(black, 120_000)
    }

    # Purple Team synthesizes all findings
    PrismaticDark.Purple.Coordinator.full_synthesis(results)
  end

  @spec targeted_assessment(atom(), keyword()) :: {:ok, map()} | {:error, term()}
  def targeted_assessment(focus_area, opts \\ []) do
    teams = select_teams_for_focus(focus_area)
    timeout = Keyword.get(opts, :timeout, 120_000)

    tasks = Enum.map(teams, fn {team, task_fn} ->
      {team, Task.async(task_fn)}
    end)

    results = Map.new(tasks, fn {team, task} ->
      {team, Task.await(task, timeout)}
    end)

    synthesize_targeted_results(focus_area, results)
  end

  defp select_teams_for_focus(:epistemic_security), do: [
    gray: fn -> PrismaticDark.Gray.Commander.explore() end,
    red: fn -> PrismaticDark.Red.Commander.simulate() end,
    blue: fn -> PrismaticDark.Blue.Commander.assess() end
  ]

  defp select_teams_for_focus(:formal_verification), do: [
    white: fn -> PrismaticDark.White.Commander.verify() end,
    blue: fn -> PrismaticDark.Blue.Commander.assess() end
  ]

  defp select_teams_for_focus(:threat_modeling), do: [
    black: fn -> PrismaticDark.Black.Commander.model() end,
    red: fn -> PrismaticDark.Red.Commander.simulate() end
  ]
end
```

## Architecture and Implementation

### Agent Hierarchy Position

```
Supreme Commander (L5)          Archer Supreme (L5)
   |  [ongoing governance]          |  [crisis intervention]
   |                                |
   +-- L4 Strategic Command --------+
   |       |
   |       +-- L3 Team Commanders
   |       |       +-- L2 Specialists
   |       |       +-- L2 Specialists
   |       |
   |       +-- L3 Quality Leaders
   |               +-- L2 Domain Experts
   |
   +-- L4 Evolution Strategist
           +-- L3 SEADF Coordinators
                   +-- L2 Subsystem Workers
```

### Resource Allocation Authority

| Resource | L4 Budget | L5 Budget |
|----------|----------|----------|
| Concurrent agents | Up to 20 | Unlimited |
| Operation duration | Up to 1 week | Unlimited |
| Domain scope | Up to 4 domains | All 115 apps |
| Override authority | L2-L3 within scope | All tiers, platform-wide |
| Quality gate bypass | None | Emergency bypass with audit |
| Color Team access | Single team | All 6 teams simultaneously |

### Audit Trail

All Supreme Commander decisions are logged for accountability:

```elixir
defmodule PrismaticAgents.SupremeCommander.AuditLog do
  @moduledoc """
  Immutable audit trail for Supreme Commander decisions.
  Required by AIAD standard for L5 authority actions.
  """

  @type audit_entry :: %{
    id: String.t(),
    timestamp: DateTime.t(),
    action: atom(),
    objective: String.t(),
    domains_affected: [atom()],
    agents_coordinated: non_neg_integer(),
    result: atom(),
    duration_ms: non_neg_integer(),
    epistemic_compliance: boolean(),
    doctrine_compliance: boolean()
  }

  @spec log_decision(audit_entry()) :: :ok
  def log_decision(entry) do
    :telemetry.execute(
      [:prismatic, :supreme_commander, :audit],
      %{domains: length(entry.domains_affected), agents: entry.agents_coordinated},
      entry
    )

    persist_audit_entry(entry)
  end

  @spec query_audit_log(keyword()) :: {:ok, [audit_entry()]} | {:error, term()}
  def query_audit_log(filters \\ []) do
    since = Keyword.get(filters, :since, DateTime.add(DateTime.utc_now(), -7, :day))
    status = Keyword.get(filters, :status, :all)

    entries = load_audit_entries()
    |> Enum.filter(fn entry -> DateTime.compare(entry.timestamp, since) != :lt end)
    |> Enum.filter(fn entry -> status == :all or entry.result == status end)

    {:ok, entries}
  end
end
```

## Operational Patterns

### Orchestration Lifecycle

Every Supreme Commander orchestration follows a defined lifecycle:

| Phase | Duration | Activity | Failure Handling |
|-------|----------|----------|-----------------|
| **Planning** | < 1s | Dependency analysis, layer construction | Reject if cycles detected |
| **Resource Allocation** | < 1s | Reserve agent slots and compute | Queue if resources unavailable |
| **Execution** | Variable | Parallel domain operations | Per-domain retry with fallback |
| **Synthesis** | < 5s | Collect and merge results | Partial results accepted |
| **Audit** | < 100ms | Record decision and outcome | Fire-and-forget telemetry |

### Failure Recovery Patterns

Supreme Commander implements three failure recovery strategies:

| Strategy | Trigger | Action |
|----------|---------|--------|
| **Domain Retry** | Single domain failure | Retry failed domain up to 3 times |
| **Partial Completion** | Multiple domain failures | Accept successful results, report failures |
| **Full Rollback** | Critical infrastructure failure | Invoke rollback plan, escalate to Archer Supreme |

## Usage in Prismatic Platform

### Activation Commands

```bash
# Full platform orchestration
/orchestrate --objective="Deploy perimeter security improvements"

# Strategic coordination
/supreme-coordinator --scope=all-domains

# View orchestration status
/orchestrate --status

# Targeted domain orchestration
/orchestrate --objective="Quality improvement" --domains=quality,safety,testing
```

### Programmatic Usage

```elixir
# Request orchestration
{:ok, result} = PrismaticAgents.SupremeCommander.orchestrate(%{
  objective: "Platform-wide quality improvement campaign",
  domains: [:quality, :safety, :testing, :ci, :perimeter],
  priority: :p1_high,
  constraints: %{max_duration: :timer.hours(4)},
  requestor: "session-2026-02-22"
})

# Check efficiency
IO.puts("Efficiency: #{result.efficiency_multiplier}x")
IO.puts("Completed: #{result.phases_completed}/#{result.phases_total}")
```

## Best Practices

1. **Reserve Supreme Commander for genuinely cross-cutting operations**. Single-domain or two-domain operations are better handled at L3-L4 levels. Overuse of L5 authority dilutes its effectiveness and creates unnecessary audit overhead.

2. **Set explicit constraints on orchestration requests**. Unbounded operations can consume platform resources indefinitely. Always specify maximum duration and priority level.

3. **Monitor the audit trail**. Supreme Commander decisions affect the entire platform. Regular audit review ensures decisions align with strategic objectives and doctrine compliance.

4. **Use `/orchestrate` for the 10x efficiency gain**. The parallel orchestration engine provides the most value when operations span multiple independent domains that can execute concurrently.

5. **Distinguish governance from crisis response**. Supreme Commander handles ongoing governance; Archer Supreme handles crises. Using the wrong agent for the wrong situation either under-responds to emergencies or over-responds to routine operations.

6. **Leverage targeted assessments over full assessments**. The `targeted_assessment/2` function allows focusing on specific security concerns without mobilizing all six Color Teams.

## Common Pitfalls

- **Over-using Supreme authority**: If every operation is escalated to L5, the coordination hierarchy provides no value. Most operations should complete at L2-L4 levels.

- **Not specifying operation constraints**: Unconstrained orchestrations can interfere with ongoing work across the platform and consume unbounded resources.

- **Ignoring the audit trail**: Supreme Commander actions have platform-wide impact. Unreviewed audit trails can hide systematic issues in coordination decisions.

- **Confusing Supreme Commander with Archer Supreme**: They share L5 authority but serve different purposes. Using Supreme Commander for crisis response or Archer Supreme for routine governance misaligns capabilities with needs.

- **Skipping safety checks for speed**: Even under time pressure, safety verification must precede critical infrastructure operations. The rollback plan is not optional.

## Related Concepts

- [Archer Supreme](@/glossary/archer-supreme.md) -- Crisis-focused L5 agent
- [Strategic Command](@/glossary/strategic-command.md) -- L4 coordination tier
- [Agent Tier](@/glossary/agent-tier.md) -- Full L1-L5 classification system
- [AIAD](@/glossary/aiad.md) -- Agent definition standard governing Supreme Commander
- [Agent Registry](@/glossary/agent-registry.md) -- Catalog of all agents managed by Supreme Commander
- [Tactical Execution](@/glossary/tactical-execution.md) -- L2 specialists coordinated through the hierarchy
- [GenServer](@/glossary/genserver.md) -- OTP behavior implementing Supreme Commander's process
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing decision confidence
- [Trinity Gate](@/glossary/trinity-gate.md) -- Verification gate for high-stakes decisions

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Agents](@/agents/_index.md) -- Full agent catalog
- [Commands](@/commands/_index.md) -- Command catalog including `/orchestrate`

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
