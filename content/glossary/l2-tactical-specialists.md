+++
title = "L2 Tactical Specialists"
weight = 50
[extra]
tags = ["glossary", "aiad", "agent-hierarchy", "tactical", "color-teams", "orchestration", "security"]
description = "L2 Tactical Specialists are the second tier in the Prismatic Platform's AIAD agent hierarchy, responsible for domain-specific operational execution within the boundaries set by L3 Strategic Commanders, performing focused tasks such as epistemic attack simulation, drift detection, contract validation, and threat analysis."
category = "agent-hierarchy"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["agent-tier", "l1-operational-units", "l3-strategic-commanders", "l5-supreme-authority", "color-teams", "red-team", "blue-team", "agent-orchestration", "aiad", "tactical-execution"]
version = "2.0.0"
date_created = "2026-02-22"
last_updated = "2026-02-22"
domain = "agent-architecture"
platform_relevance = "critical"
elixir_specific = true
agent_count = 12
word_count = 1590
date_modified = "2026-02-23"
keywords = ["Tactical", "Specialists", "Prismatic", "Platforms", "AIAD", "Strategic", "glossary", "agent hierarchy", "Prismatic Platform", "Tactical Specialists"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "L2 Tactical Specialists - Prismatic Platform"
+++

## Definition

L2 Tactical Specialists are agents occupying the second authority tier in the Prismatic Platform's five-level AIAD (AI Agent Definition) hierarchy. They operate under the strategic direction of L3 Strategic Commanders and above L1 Operational Units, executing domain-specific tasks that require specialized expertise but not strategic decision-making authority. Each L2 agent is focused on a narrow domain -- epistemic attack simulation, drift detection, signal aggregation, contract validation, or scenario generation -- and operates within strict operational boundaries defined by its parent L3 commander.

In the Prismatic Platform's current deployment of 530+ agents, L2 Tactical Specialists form the primary execution layer for the Color-Team security architecture. They are the agents that actually perform adversarial simulations, defensive posture assessments, synthesis mappings, and constructive verification tasks. While L3 commanders orchestrate campaigns and make strategic decisions, L2 specialists execute the individual operations that comprise those campaigns.

## Overview

### The Five-Level Agent Hierarchy

The AIAD agent hierarchy defines five distinct authority levels, each with specific responsibilities, permissions, and accountability chains:

| Level | Role | Count | Decision Authority | Example |
|-------|------|-------|--------------------|---------|
| **L5** | Supreme Authority | 2 | Platform-wide, doctrine-level | archer-supreme, supreme-coordinator |
| **L4** | Safety-Critical Specialists | 8 | Safety enforcement, override authority | gray-escalation-guard, black-abstraction-enforcer |
| **L3** | Strategic Commanders | 12 | Campaign orchestration, team coordination | red-commander, blue-commander, purple-coordinator |
| **L2** | Tactical Specialists | 12 | Domain-specific task execution | red-epistemic-attacker, blue-drift-detector |
| **L1** | Operational Units | 496+ | Single-task execution | File processors, data transformers |

L2 Tactical Specialists occupy the critical middle ground: they have enough authority to make domain-specific decisions (e.g., which attack vector to simulate, which drift pattern to investigate) but not enough to change strategic direction, override safety controls, or make cross-team decisions.

### Design Philosophy

The L2 tier embodies the principle of **bounded autonomy**. Each specialist is autonomous within its domain but strictly bounded by:

1. **Strategic boundaries**: Set by the L3 commander that orchestrates the specialist
2. **Safety boundaries**: Enforced by L4 safety-critical agents that can halt any L2 operation
3. **Doctrinal boundaries**: The NO MERCY, NO DOUBTS doctrine and NABLA axioms apply unconditionally
4. **Temporal boundaries**: Each L2 operation has a defined time window and must complete or report timeout

This design prevents the common failure mode of agent systems where specialized agents accumulate too much autonomy and begin making strategic decisions outside their competence.

### L2 Agents in the Color-Team Architecture

The platform's six Color Teams each contain L2 Tactical Specialists:

**Red Team (Adversarial Simulation)**:
- `red-epistemic-attacker` -- Simulates truth distortion and source poisoning attacks
- `red-drift-inducer` -- Executes sub-threshold drift attacks and cascade propagation analysis
- `red-scenario-generator` -- Composes multi-technique scenarios from the 329-entry attack taxonomy

**Blue Team (Epistemic Defense)**:
- `blue-auth-sentinel` -- Monitors authentication boundaries and detects privilege escalation
- `blue-drift-detector` -- Detects behavioral, configuration, dependency, and performance drift
- `blue-signal-aggregator` -- Correlates cross-domain signals with NABLA plurality enforcement

**Purple Team (Synthesis and Closure)**:
- `purple-mapper` -- Creates bidirectional mappings between Red findings and Blue defenses
- `purple-closure-analyst` -- Evaluates 4-condition closure, detects false closure patterns

**White Team (Constructive Verification)**:
- `white-contract-validator` -- Tests interface contracts, validates behaviour/protocol/API compliance
- `white-invariant-prover` -- Performs property-based testing and formal Lean4 proofs

## Technical Details

### Agent Definition Structure

Every L2 Tactical Specialist is defined through an AIAD-compliant agent specification:

```elixir
defmodule Prismatic.Agents.L2.TacticalSpecialist do
  @moduledoc """
  Base module for L2 Tactical Specialist agents. Provides the
  common infrastructure for domain-specific task execution within
  strategic boundaries set by L3 commanders.
  """

  use GenServer

  alias Prismatic.Agents.{AuthorityLevel, OperationContext, TaskResult}

  @type state :: %{
          agent_id: String.t(),
          domain: atom(),
          commander_id: String.t(),
          authority: AuthorityLevel.t(),
          active_task: map() | nil,
          completed_tasks: non_neg_integer(),
          operational_since: DateTime.t(),
          config: map()
        }

  @callback domain() :: atom()
  @callback capabilities() :: [atom()]
  @callback execute_task(map(), state()) :: {:ok, TaskResult.t()} | {:error, atom()}
  @callback validate_boundaries(map(), state()) :: :ok | {:error, String.t()}

  defmacro __using__(opts) do
    quote do
      @behaviour Prismatic.Agents.L2.TacticalSpecialist

      use GenServer

      @authority_level :l2_tactical
      @domain unquote(Keyword.fetch!(opts, :domain))
      @commander unquote(Keyword.fetch!(opts, :commander))

      def start_link(opts \\ []) do
        agent_id = Keyword.get(opts, :agent_id, generate_agent_id())

        GenServer.start_link(__MODULE__, %{
          agent_id: agent_id,
          domain: @domain,
          commander_id: @commander,
          authority: %AuthorityLevel{level: :l2, permissions: permissions()},
          active_task: nil,
          completed_tasks: 0,
          operational_since: DateTime.utc_now(),
          config: Keyword.get(opts, :config, %{})
        })
      end

      @impl GenServer
      def init(state) do
        :telemetry.execute(
          [:prismatic, :agents, :l2, :started],
          %{count: 1},
          %{agent_id: state.agent_id, domain: @domain}
        )

        {:ok, state}
      end

      @impl GenServer
      def handle_call({:execute, task_spec}, _from, state) do
        with :ok <- validate_commander(task_spec, state),
             :ok <- validate_boundaries(task_spec, state),
             :ok <- check_safety_constraints(task_spec) do
          updated_state = %{state | active_task: task_spec}

          case execute_task(task_spec, updated_state) do
            {:ok, result} ->
              final_state = %{
                updated_state
                | active_task: nil,
                  completed_tasks: state.completed_tasks + 1
              }

              emit_completion_telemetry(result, final_state)
              {:reply, {:ok, result}, final_state}

            {:error, reason} ->
              emit_failure_telemetry(reason, updated_state)
              {:reply, {:error, reason}, %{updated_state | active_task: nil}}
          end
        else
          {:error, reason} ->
            {:reply, {:error, {:boundary_violation, reason}}, state}
        end
      end

      @impl GenServer
      def handle_call(:introspect, _from, state) do
        report = %{
          agent_id: state.agent_id,
          domain: @domain,
          commander: @commander,
          authority_level: :l2,
          capabilities: capabilities(),
          active_task: state.active_task != nil,
          completed_tasks: state.completed_tasks,
          uptime_seconds: DateTime.diff(DateTime.utc_now(), state.operational_since)
        }

        {:reply, {:ok, report}, state}
      end

      defp validate_commander(task_spec, state) do
        if Map.get(task_spec, :issued_by) == state.commander_id do
          :ok
        else
          {:error, "Task not issued by authorized commander #{state.commander_id}"}
        end
      end

      defp check_safety_constraints(task_spec) do
        case Prismatic.Agents.SafetyOracle.check(task_spec, :l2) do
          :cleared -> :ok
          {:blocked, reason} -> {:error, "Safety constraint: #{reason}"}
        end
      end

      defp generate_agent_id do
        "l2-#{@domain}-#{:crypto.strong_rand_bytes(8) |> Base.url_encode64(padding: false)}"
      end

      defp permissions do
        [:execute_domain_tasks, :read_shared_state, :emit_findings, :request_resources]
      end

      defp emit_completion_telemetry(result, state) do
        :telemetry.execute(
          [:prismatic, :agents, :l2, :task_completed],
          %{duration_ms: result.duration_ms, count: 1},
          %{agent_id: state.agent_id, domain: @domain, task_type: result.type}
        )
      end

      defp emit_failure_telemetry(reason, state) do
        :telemetry.execute(
          [:prismatic, :agents, :l2, :task_failed],
          %{count: 1},
          %{agent_id: state.agent_id, domain: @domain, reason: reason}
        )
      end
    end
  end
end
```

### Concrete L2 Implementation Example

Here is how a specific L2 Tactical Specialist is implemented:

```elixir
defmodule Prismatic.Agents.L2.BlueDriftDetector do
  @moduledoc """
  L2 Tactical Specialist for the Blue Team. Detects behavioral,
  configuration, dependency, and performance drift patterns across
  platform components. Reports findings to blue-commander for
  synthesis into the defensive posture assessment.
  """

  use Prismatic.Agents.L2.TacticalSpecialist,
    domain: :drift_detection,
    commander: "blue-commander"

  @drift_categories [:behavioral, :configuration, :dependency, :performance]

  @impl Prismatic.Agents.L2.TacticalSpecialist
  def domain, do: :drift_detection

  @impl Prismatic.Agents.L2.TacticalSpecialist
  def capabilities do
    [:detect_behavioral_drift, :detect_config_drift, :detect_dependency_drift,
     :detect_performance_drift, :compute_drift_velocity, :correlate_drift_signals]
  end

  @impl Prismatic.Agents.L2.TacticalSpecialist
  def validate_boundaries(task_spec, _state) do
    category = Map.get(task_spec, :drift_category)

    if category in @drift_categories do
      :ok
    else
      {:error, "Unknown drift category: #{inspect(category)}. Allowed: #{inspect(@drift_categories)}"}
    end
  end

  @impl Prismatic.Agents.L2.TacticalSpecialist
  def execute_task(%{drift_category: category, target: target}, state) do
    start_time = System.monotonic_time(:millisecond)

    result =
      case category do
        :behavioral -> detect_behavioral_drift(target)
        :configuration -> detect_configuration_drift(target)
        :dependency -> detect_dependency_drift(target)
        :performance -> detect_performance_drift(target)
      end

    duration = System.monotonic_time(:millisecond) - start_time

    case result do
      {:ok, findings} ->
        {:ok, %TaskResult{
          type: :drift_detection,
          category: category,
          findings: findings,
          agent_id: state.agent_id,
          duration_ms: duration,
          timestamp: DateTime.utc_now(),
          confidence: compute_confidence(findings)
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp detect_behavioral_drift(target) do
    # Compares current behavior patterns against established baselines
    {:ok, []}
  end

  defp detect_configuration_drift(target) do
    # Checks for unauthorized or unexpected configuration changes
    {:ok, []}
  end

  defp detect_dependency_drift(target) do
    # Monitors dependency version changes and new dependency additions
    {:ok, []}
  end

  defp detect_performance_drift(target) do
    # Tracks performance metric deviations from historical baselines
    {:ok, []}
  end

  defp compute_confidence(findings) do
    case length(findings) do
      0 -> 1.0
      n when n < 3 -> 0.7
      n when n < 10 -> 0.8
      _ -> 0.9
    end
  end
end
```

### Communication Patterns

L2 specialists communicate through well-defined channels:

```
L3 Commander ---- task assignment ----> L2 Specialist
L2 Specialist --- findings report ----> L3 Commander
L2 Specialist --- telemetry events ---> Platform Telemetry
L4 Safety ------- halt/override ------> L2 Specialist
L2 Specialist --- resource request ---> L3 Commander
L2 Specialist --- shared state read --> ETS (read-only)
```

L2 agents never communicate directly with other L2 agents. All cross-specialist coordination flows through the L3 commander. This prevents lateral communication that could bypass safety controls and strategic oversight.

## Implementation

### Supervision Strategy

L2 Tactical Specialists are supervised by their team's L3 commander through a dedicated supervisor:

```
Team Supervisor (e.g., RedTeamSupervisor)
+-- L3 Commander (red-commander)
+-- L2 Specialists Supervisor (one_for_one)
|   +-- red-epistemic-attacker
|   +-- red-drift-inducer
|   +-- red-scenario-generator
+-- Team State (ETS table for shared operational state)
```

The `one_for_one` supervision strategy means individual L2 agent failures do not affect sibling agents. The L3 commander monitors agent health and can reassign tasks if a specialist fails.

### Task Lifecycle

Every L2 task follows a strict lifecycle:

1. **Assignment**: L3 commander issues a task specification to the L2 specialist
2. **Validation**: The specialist validates that the task is within its boundaries and that safety constraints are satisfied
3. **Execution**: The specialist performs the domain-specific operation
4. **Reporting**: Results are reported back to the L3 commander with confidence scores and provenance
5. **Archival**: Completed tasks are logged for audit trail and regression analysis

## Comparison

| Aspect | L1 Operational Units | L2 Tactical Specialists | L3 Strategic Commanders |
|--------|---------------------|------------------------|------------------------|
| **Authority** | Single-task execution | Domain-specific decisions | Campaign orchestration |
| **Autonomy** | None (fully directed) | Bounded (within domain) | High (within doctrine) |
| **Communication** | Report to L2/L3 | Report to L3, request from L3 | Coordinate with peers, report to L4/L5 |
| **Safety Oversight** | Implicit (simple tasks) | L4 safety checks per task | Self-policing + L4 override |
| **Specialization** | Generic | Deep domain expertise | Broad strategic awareness |
| **Count** | 496+ | 12 | 12 |
| **State** | Stateless or minimal | Session-scoped state | Persistent campaign state |
| **Decision Making** | None | Tactical (how to execute) | Strategic (what to execute) |

## Best Practices

1. **Single responsibility per specialist**: Each L2 agent should have one clearly defined domain. The `blue-drift-detector` detects drift; it does not remediate drift (that is a different agent's responsibility).

2. **Strict boundary validation**: Every task must be validated against the specialist's defined boundaries before execution. Boundary violations must be reported to the L3 commander, never silently ignored.

3. **Immutable task results**: Once a TaskResult is produced, it must not be modified. This ensures audit trail integrity and enables reliable regression analysis.

4. **Commander-only task acceptance**: L2 specialists must only accept tasks from their designated L3 commander. Tasks from any other source must be rejected with an error.

5. **Comprehensive telemetry**: Every task execution, completion, and failure must emit telemetry events. This enables the platform's observability infrastructure to monitor L2 agent health and performance.

6. **Graceful degradation**: If a specialist cannot complete a task (resource unavailability, timeout, unexpected data), it must report the failure cleanly rather than crashing silently or returning partial results without marking them as partial.

7. **Confidence scoring**: All findings must include confidence scores. A finding without confidence is an assertion without evidence, violating NABLA axioms.

8. **No lateral communication**: L2 agents must never communicate directly with each other. All coordination flows through the L3 commander to maintain strategic coherence and safety oversight.

## Pitfalls

1. **Authority creep**: L2 agents gradually accumulating L3-level decision-making authority through ad hoc task handling. This is prevented by strict boundary validation and L4 safety oversight.

2. **Over-specialization**: Making specialists so narrow that they cannot handle reasonable variations in their domain. The drift detector should handle all drift categories, not require a separate agent for each.

3. **Ignoring the commander**: Implementing L2 agents that operate independently of their L3 commander. Even if technically possible, this breaks the hierarchical accountability model.

4. **Stateful coupling**: L2 agents sharing state through mechanisms other than the defined communication channels. This creates hidden dependencies that undermine the isolation properties of the agent hierarchy.

5. **Missing safety checks**: Skipping safety constraint validation for "known safe" operations. All L2 operations must pass through the SafetyOracle, regardless of perceived risk level.

6. **Unbounded execution**: Allowing L2 tasks to run indefinitely. Every task must have a timeout, and the L3 commander must handle timeout scenarios.

7. **Silent failures**: L2 agents that swallow errors and return empty results instead of reporting failures. Under NO MERCY doctrine, all failures must be visible and actionable.

## Use Cases

### Red Team Epistemic Attack Simulation

The `red-epistemic-attacker` L2 specialist receives a task from `red-commander` to simulate a truth distortion attack against a specific belief in the platform's belief graph. The specialist executes the attack simulation (modifying confidence scores, injecting contradictory evidence) within a sandboxed environment and reports the results -- which beliefs were affected, what cascading effects occurred, and what the blast radius would be if the attack were real.

### Blue Team Drift Detection

The `blue-drift-detector` L2 specialist periodically scans platform components for drift. It compares current configuration against baselines, monitors dependency version changes, and tracks performance metric deviations. When drift is detected, it reports findings with severity ratings and confidence scores to `blue-commander`, who synthesizes them into the overall defensive posture.

### White Team Contract Validation

The `white-contract-validator` L2 specialist receives a task to validate that a specific module's behaviour implementation matches its contract. It runs property-based tests, checks @callback implementations, and verifies that error handling follows the {:ok, _} / {:error, _} pattern. Results are reported to `white-verifier-commander` with formal evidence.

### Purple Team Finding Mapping

The `purple-mapper` L2 specialist takes Red Team findings and maps them to corresponding Blue Team defenses. For each Red finding "epistemic attack X succeeded", it identifies the Blue defense that should have caught it, assessing whether the defense exists, is properly configured, and is effective. This bidirectional mapping is the foundation of the Purple Team's synthesis function.

## Related Concepts

L2 Tactical Specialists operate within a rich ecosystem of agent hierarchy and security concepts:

- [Agent Tier](/glossary/agent-tier/) -- the hierarchical classification system that defines L2's position and authority boundaries
- [L1 Operational Units](/glossary/l1-operational-units/) -- the tier below L2, handling single-task execution under L2 direction
- [L3 Strategic Commanders](/glossary/l3-strategic-commanders/) -- the tier above L2, providing strategic direction and task assignment
- [L5 Supreme Authority](/glossary/l5-supreme-authority/) -- the highest authority tier with platform-wide doctrine-level decisions
- [Color Teams](/glossary/color-teams/) -- the organizational structure within which L2 specialists operate
- [Red Team](/glossary/red-team/) -- the adversarial simulation team containing 3 L2 specialists
- [Blue Team](/glossary/blue-team/) -- the epistemic defense team containing 3 L2 specialists
- [Agent Orchestration](/glossary/agent-orchestration/) -- the coordination mechanism by which L3 commanders direct L2 specialists
- [AIAD](/glossary/aiad/) -- the agent definition standard that specifies L2 agent structure, capabilities, and constraints
- [Tactical Execution](/glossary/tactical-execution/) -- the operational mode that defines L2 specialists' primary function

## See Also

- [Purple Team](/glossary/purple-team/) -- the synthesis team that closes the Red-Blue loop using L2 specialist findings
- [White Team](/glossary/white-team/) -- the constructive verification team with L2 specialists for contract and invariant validation
- [Gray Team](/glossary/gray-team/) -- the boundary exploration team that feeds initial findings into L2 specialist workflows
- [Supervision Tree](/glossary/supervision-tree/) -- the OTP pattern used to supervise L2 agent processes
- [Telemetry](/glossary/telemetry/) -- the observability infrastructure that monitors L2 agent performance and health

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) Glossary

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | Glossary Index
