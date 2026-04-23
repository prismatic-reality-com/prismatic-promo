+++
title = "Tactical Execution"
weight = 16
[extra]
description = "L2 Focused domain execution agent tier for specialized operations within the Prismatic Platform's six Color Teams"
category = "agents"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "intermediate"
quality_score = 97
date_created = "2026-02-22"
date_updated = "2026-02-22"
importance = "high"
abbreviation = "L2"
related_terms = ["agent-tier", "strategic-command", "aiad", "red-team", "blue-team", "white-team", "gray-team", "purple-team", "archer-supreme", "nabla-infinity"]
keywords = ["tactical execution", "L2 agents", "domain specialists", "color team operations", "agent tier hierarchy", "AIAD specification", "epistemic agents", "security operations"]
tags = ["agents", "security", "color-teams", "architecture", "operations"]
platforms = ["elixir", "phoenix", "prismatic"]
use_cases = ["adversarial-simulation", "defensive-analysis", "formal-verification", "boundary-exploration", "drift-detection"]
prerequisites = ["aiad", "agent-tier", "color-teams"]
key_takeaway = "L2 Tactical Execution agents are domain-focused specialists forming the operational backbone of the platform, executing precise tasks within defined authority boundaries under L3 commander coordination."
word_count = 1473
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Tactical Execution - Prismatic Platform"
+++

## Definition and Overview

Tactical Execution is the L2 agent tier responsible for focused, domain-specific operations within a single application or capability area in the Prismatic Platform's agent hierarchy. L2 agents are the operational backbone of the platform -- specialists who execute concrete tasks such as epistemic attacks ([Red Team](@/glossary/red-team.md)), drift detection ([Blue Team](@/glossary/blue-team.md)), contract validation ([White Team](@/glossary/white-team.md)), and boundary exploration ([Gray Team](@/glossary/gray-team.md)) under the coordination of their L3 Team Commander. With approximately 250 agents at this tier, L2 Tactical Execution specialists represent the largest population in the platform's 530-agent fleet.

The term "tactical" distinguishes this tier from strategic coordination (L4) and supreme authority (L5). In military doctrine, tactical operations are the direct execution of specific missions within well-defined parameters, as opposed to strategic planning that coordinates across multiple theaters. Similarly, L2 agents operate with deep expertise in narrow domains, executing specialized tasks with precision rather than coordinating across domains. This focus enables each L2 agent to maintain expert-level capability within its specialization -- a red-epistemic-attacker does not need to understand defensive posture assessment, and a blue-drift-detector does not need to generate adversarial scenarios.

The L2 tier sits at the intersection of capability and coordination. L1 Assistant agents handle basic task execution within a single function scope, while L2 agents apply domain expertise to solve complex problems within their specialty. The distinction is significant: an L1 agent might format a log entry, while an L2 agent analyzes behavioral drift patterns across temporal windows to detect sub-threshold configuration changes. L2 agents report findings upward to L3 Team Commanders, who synthesize specialist reports into team-level assessments.

Within the Prismatic Platform, L2 agents are defined through the [AIAD](@/glossary/aiad.md) (AI Agent Definition) standard, which specifies each agent's capabilities, authority boundaries, communication interfaces, and safety constraints. Every L2 agent has a formal specification document in `.aiad/agents/` that defines its operational parameters, ensuring that tactical execution occurs within well-documented boundaries with traceable accountability.

## Historical Context

The L2 Tactical Execution tier was formalized during Generation 7 of the platform's evolution, when the agent population grew beyond what a flat hierarchy could manage. Early agent implementations operated without formal tier classification -- all agents were peers with varying levels of capability. This flat structure created coordination problems: agents would duplicate work, produce contradictory findings, and lack clear escalation pathways for findings that exceeded their domain authority.

The five-tier hierarchy (L1 through L5) was introduced to address these coordination problems. The L2 tier was specifically designed to capture the largest class of agents: domain specialists who needed autonomy within their expertise area but required coordination with other specialists through a command structure. The Color Team organization provided the natural grouping for L2 agents, with each team's L3 commander managing a cohort of L2 specialists.

The introduction of the AIAD standard in Generation 8 further formalized the L2 tier by requiring every agent to carry a machine-readable specification defining its capabilities, authority boundaries, and safety constraints. This standardization enabled automated compliance checking and allowed the platform to scale from dozens to hundreds of agents without losing coordination discipline.

## Technical Deep Dive

### L2 Agent Classification

L2 agents are classified by their domain specialization and operational mode:

```elixir
defmodule PrismaticAgents.Tier.TacticalExecution do
  @moduledoc """
  L2 Tactical Execution agent tier.
  Domain-specific specialists executing focused operations.
  """

  @type l2_agent :: %{
    call_sign: String.t(),
    tier: :l2_tactical,
    domain: atom(),
    team: color_team(),
    commander: module(),
    capabilities: [atom()],
    safety_constraints: [constraint()]
  }

  @type color_team :: :red | :blue | :purple | :white | :gray | :black
  @type constraint :: :read_only | :sandbox_only | :synthetic_data | :no_network

  @spec classify(module()) :: l2_agent()
  def classify(agent_module) do
    spec = agent_module.__aiad_spec__()

    %{
      call_sign: spec.call_sign,
      tier: :l2_tactical,
      domain: spec.domain,
      team: spec.team,
      commander: spec.reports_to,
      capabilities: spec.capabilities,
      safety_constraints: spec.safety_constraints
    }
  end

  @spec execute_task(l2_agent(), task()) :: {:ok, result()} | {:error, term()}
  def execute_task(agent, task) do
    with :ok <- verify_authority(agent, task),
         :ok <- verify_safety_constraints(agent, task),
         {:ok, context} <- build_execution_context(agent, task) do
      agent.commander
      |> apply(:dispatch, [agent.call_sign, task, context])
    end
  end

  defp verify_authority(agent, task) do
    if task.domain == agent.domain do
      :ok
    else
      {:error, {:authority_exceeded, "L2 agents operate within single domain"}}
    end
  end

  defp verify_safety_constraints(agent, task) do
    violations =
      agent.safety_constraints
      |> Enum.reject(fn constraint -> satisfies_constraint?(task, constraint) end)

    case violations do
      [] -> :ok
      violated -> {:error, {:safety_violation, violated}}
    end
  end
end
```

### L2 Agent Lifecycle

Each L2 agent follows a defined lifecycle from activation through result delivery:

```elixir
defmodule PrismaticAgents.TacticalExecution.Lifecycle do
  @moduledoc """
  Manages the lifecycle of L2 Tactical Execution agents.
  Handles activation, execution, and result reporting.
  """

  use GenServer

  @type lifecycle_state :: :idle | :activated | :executing | :reporting | :completed

  @type execution_record :: %{
    agent: module(),
    task_id: String.t(),
    started_at: DateTime.t(),
    completed_at: DateTime.t() | nil,
    state: lifecycle_state(),
    result: term() | nil,
    telemetry_events: non_neg_integer()
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts)
  end

  @impl true
  def init(opts) do
    agent = Keyword.fetch!(opts, :agent)

    :telemetry.execute(
      [:prismatic, :agents, :l2, :init],
      %{},
      %{agent: agent.call_sign, team: agent.team}
    )

    {:ok, %{agent: agent, state: :idle, current_task: nil, history: []}}
  end

  @impl true
  def handle_call({:activate, task}, _from, %{state: :idle} = state) do
    record = %{
      agent: state.agent,
      task_id: task.id,
      started_at: DateTime.utc_now(),
      completed_at: nil,
      state: :activated,
      result: nil,
      telemetry_events: 0
    }

    :telemetry.execute(
      [:prismatic, :agents, :l2, :activated],
      %{},
      %{agent: state.agent.call_sign, task: task.id}
    )

    {:reply, {:ok, record}, %{state | state: :activated, current_task: record}}
  end

  @impl true
  def handle_call({:execute, params}, _from, %{state: :activated} = state) do
    result = execute_specialist_operation(state.agent, state.current_task, params)

    updated_task = %{state.current_task |
      completed_at: DateTime.utc_now(),
      state: :completed,
      result: result
    }

    :telemetry.execute(
      [:prismatic, :agents, :l2, :completed],
      %{duration_ms: DateTime.diff(updated_task.completed_at, updated_task.started_at, :millisecond)},
      %{agent: state.agent.call_sign, status: elem(result, 0)}
    )

    {:reply, result, %{state | state: :completed, current_task: updated_task,
      history: [updated_task | state.history]}}
  end

  defp execute_specialist_operation(agent, task, params) do
    case agent.team do
      :red -> execute_adversarial(agent, task, params)
      :blue -> execute_defensive(agent, task, params)
      :white -> execute_verification(agent, task, params)
      :gray -> execute_exploration(agent, task, params)
      :purple -> execute_synthesis(agent, task, params)
      :black -> execute_theoretical(agent, task, params)
    end
  end
end
```

### Specialist Domain Operations

Each Color Team has distinct L2 specialist types with specific operational capabilities:

```elixir
defmodule PrismaticAgents.TacticalExecution.RedSpecialist do
  @moduledoc """
  L2 Red Team specialist for adversarial simulation.
  Executes epistemic attack scenarios in sandboxed environments.
  """

  @behaviour PrismaticAgents.TacticalExecution.Specialist

  @attack_primitives [
    :truth_distortion,
    :confidence_manipulation,
    :signal_poisoning,
    :drift_induction,
    :salience_hijacking
  ]

  @impl true
  def execute(scenario, context) do
    with :ok <- verify_sandbox_isolation(context),
         :ok <- verify_synthetic_data_only(context),
         {:ok, attack} <- compose_attack(scenario),
         {:ok, result} <- simulate_in_sandbox(attack, context) do
      {:ok, %{
        scenario: scenario.id,
        attack_primitives_used: attack.primitives,
        impact_assessment: assess_impact(result),
        defensive_recommendations: generate_recommendations(result),
        evidence: collect_evidence(result)
      }}
    end
  end

  defp compose_attack(scenario) do
    primitives =
      scenario.techniques
      |> Enum.filter(&(&1 in @attack_primitives))
      |> Enum.map(&build_primitive/1)

    {:ok, %{primitives: primitives, scenario: scenario}}
  end
end

defmodule PrismaticAgents.TacticalExecution.BlueSpecialist do
  @moduledoc """
  L2 Blue Team specialist for defensive analysis.
  Detects drift, anomalies, and defensive posture weaknesses.
  """

  @behaviour PrismaticAgents.TacticalExecution.Specialist

  @drift_categories [:behavioral, :configuration, :dependency, :performance]

  @impl true
  def execute(assessment_target, context) do
    drift_results =
      @drift_categories
      |> Task.async_stream(fn category ->
        {category, detect_drift(assessment_target, category, context)}
      end, max_concurrency: 4, timeout: 30_000)
      |> Enum.map(fn {:ok, result} -> result end)
      |> Map.new()

    {:ok, %{
      target: assessment_target,
      drift_findings: drift_results,
      overall_posture: assess_posture(drift_results),
      evidence: build_evidence_chain(drift_results),
      confidence: calculate_confidence(drift_results)
    }}
  end

  defp detect_drift(target, :behavioral, context) do
    baseline = load_behavioral_baseline(target)
    current = observe_current_behavior(target, context)
    compare_with_threshold(baseline, current, 0.05)
  end

  defp detect_drift(target, :configuration, context) do
    expected = load_expected_config(target)
    actual = read_current_config(target, context)
    diff_configurations(expected, actual)
  end
end
```

## Architecture and Implementation

### L2 Agent Population by Team

The approximately 250 L2 agents are distributed across the six Color Teams and domain-specific applications:

| Team | L2 Agents | Example Specialists | Primary Domain |
|------|-----------|--------------------|----|
| Red Team | ~40 | `red-epistemic-attacker`, `red-drift-inducer`, `red-scenario-generator` | Adversarial simulation |
| Blue Team | ~45 | `blue-auth-sentinel`, `blue-drift-detector`, `blue-signal-aggregator` | Defensive analysis |
| [Purple Team](@/glossary/purple-team.md) | ~30 | `purple-mapper`, `purple-closure-analyst`, `purple-regression-guard` | Synthesis and closure |
| White Team | ~25 | `white-contract-validator`, `white-invariant-prover` | Formal verification |
| Gray Team | ~20 | `gray-edge-finder`, `gray-escalation-guard` | Boundary exploration |
| Domain Apps | ~90 | Quality specialists, EASM workers, API handlers | Application-specific |

### Authority Boundaries

| Capability | L1 Assistant | L2 Tactical | L3 Commander |
|------------|-------------|-------------|-------------|
| Scope | Single function | Single domain | Single team |
| Decision authority | None | Within domain parameters | Team coordination |
| Resource access | Minimal | Domain resources | Team resources |
| Override capability | None | None | L1-L2 within team |
| Escalation target | L2 or L3 | L3 Commander | L4 Strategic |
| Autonomy level | Directed | Semi-autonomous | Autonomous within team |

### Communication Architecture

```
L4 Strategic Command
    |
    +-- L3 Red Commander --------+-- L2 red-epistemic-attacker
    |                            +-- L2 red-drift-inducer
    |                            +-- L2 red-scenario-generator
    |
    +-- L3 Blue Commander -------+-- L2 blue-auth-sentinel
    |                            +-- L2 blue-drift-detector
    |                            +-- L2 blue-signal-aggregator
    |
    +-- L3 White Commander ------+-- L2 white-contract-validator
    |                            +-- L2 white-invariant-prover
    |
    +-- L3 Gray Commander -------+-- L2 gray-edge-finder
                                 +-- L2 gray-escalation-guard
```

### L2 Result Reporting

L2 agents produce structured findings that flow upward through the hierarchy:

```elixir
defmodule PrismaticAgents.TacticalExecution.FindingReport do
  @moduledoc """
  Structured finding report produced by L2 tactical agents.
  Standardized format for upward reporting to L3 commanders.
  """

  @type finding :: %{
    id: String.t(),
    agent: String.t(),
    team: atom(),
    severity: :critical | :high | :medium | :low | :info,
    category: atom(),
    title: String.t(),
    description: String.t(),
    evidence: [evidence_item()],
    confidence: float(),
    timestamp: DateTime.t(),
    recommendations: [String.t()]
  }

  @type evidence_item :: %{
    type: :observation | :measurement | :log | :test_result,
    content: term(),
    source: String.t(),
    collected_at: DateTime.t()
  }

  @spec submit(finding()) :: :ok | {:error, term()}
  def submit(finding) do
    with :ok <- validate_finding(finding),
         :ok <- verify_evidence_chain(finding.evidence),
         :ok <- check_confidence_threshold(finding) do
      :telemetry.execute(
        [:prismatic, :agents, :l2, :finding],
        %{confidence: finding.confidence},
        %{agent: finding.agent, team: finding.team, severity: finding.severity}
      )

      route_to_commander(finding)
    end
  end

  defp check_confidence_threshold(finding) do
    min_confidence = case finding.severity do
      :critical -> 0.95
      :high -> 0.85
      :medium -> 0.70
      :low -> 0.50
      :info -> 0.30
    end

    if finding.confidence >= min_confidence do
      :ok
    else
      {:error, {:insufficient_confidence, finding.confidence, min_confidence}}
    end
  end
end
```

## NABLA Integration

L2 Tactical Execution agents operate under the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework, which governs how they collect evidence, form conclusions, and report findings. The key NABLA requirements for L2 agents are:

**Signal Plurality**: L2 findings must be supported by at least two independent signals. A single observation is insufficient for a finding to be submitted.

**Provenance Mandatory**: Every finding must carry a complete provenance chain from the raw signal through evidence processing to the final conclusion. The [Provenance Mandatory](@/glossary/provenance-mandatory.md) axiom is enforced structurally in the finding report schema.

**Confidence Calibration**: L2 agents must calibrate their confidence scores to reflect the actual strength of their evidence. The confidence threshold system (0.95 for critical, 0.85 for high, 0.70 for medium) prevents premature escalation of uncertain findings.

**Contradiction Preservation**: When L2 agents encounter contradictory evidence, they must preserve both signals and report the contradiction to their L3 commander rather than resolving it unilaterally. Cross-domain contradiction resolution is the responsibility of [Purple Team](@/glossary/purple-team.md) synthesis operations.

## Usage in Prismatic Platform

### Activating L2 Agents

```elixir
# Direct activation through L3 commander
{:ok, result} = PrismaticDark.Red.Commander.dispatch(
  :red_epistemic_attacker,
  %{scenario: "truth_distortion_cascade", target: "belief_network_alpha"}
)

# Batch activation for multi-specialist operations
results = PrismaticDark.Blue.Commander.fan_out([
  {:blue_drift_detector, %{target: "prismatic_perimeter", window: :timer.hours(24)}},
  {:blue_auth_sentinel, %{target: "prismatic_web", scope: :authentication}},
  {:blue_signal_aggregator, %{sources: [:telemetry, :logs, :metrics]}}
])
```

### CLI Commands

```bash
# View L2 agent status
/agent-status --tier=l2

# Activate specific L2 specialist
/red-team scenario --agent=red-epistemic-attacker --scenario=drift_cascade

# View findings from L2 agents
/agent-findings --tier=l2 --team=blue --severity=high
```

### AIAD Agent Definition

Every L2 agent has a corresponding AIAD specification:

```yaml
# .aiad/agents/red-epistemic-attacker.agent.md (frontmatter)
agent-spec:
  id: red-epistemic-attacker
  name: Red Epistemic Attacker
  tier: L2
  team: red
  commander: red-commander
  domain: adversarial_simulation
  capabilities:
    - truth_distortion_simulation
    - confidence_manipulation
    - signal_poisoning
  safety_constraints:
    - sandbox_only
    - synthetic_data
    - no_network_access
  enforcement:
    doctrine: "no-mercy-no-doubts"
    compliance: mandatory
```

## Safety and Compliance

L2 agents, particularly those in the Red and Black teams, operate under strict safety constraints that are enforced at the infrastructure level:

| Constraint | Affected Teams | Enforcement | Violation Response |
|------------|---------------|-------------|-------------------|
| Sandbox isolation | Red, Black | Process-level isolation | L4 [Violation Protocol](@/glossary/violation-protocol.md) |
| Synthetic data only | Red, Black, Gray | Data source validation | L3 rejection |
| No network access | Red, Black | Firewall rules | Infrastructure block |
| Read-only operations | Gray, White | File system permissions | Operation denied |
| Audit logging | All teams | Immutable append-only log | System enforcement |

These constraints are non-negotiable and apply equally in testing and production environments. The [NM/ND Doctrine](@/glossary/no-mercy-no-doubts.md) enforcement block in every agent's AIAD specification makes compliance mandatory.

## Best Practices

1. **Maintain deep domain focus**. L2 agents derive their value from specialization. An agent that tries to cover multiple domains produces shallow results compared to a focused specialist. If a task requires multiple domains, it belongs at L3 or L4.

2. **Produce structured, evidence-backed findings**. Every L2 finding should include evidence items with source attribution, confidence scores, and timestamps. Unsubstantiated claims violate the NABLA Infinity provenance axiom and are rejected by the reporting pipeline.

3. **Respect authority boundaries**. L2 agents execute within their defined domain and report upward. They do not coordinate with other L2 agents directly -- cross-specialist coordination is the responsibility of L3 Commanders. Lateral communication bypasses the coordination hierarchy and creates untracked dependencies.

4. **Use appropriate safety constraints**. Red Team and Black Team L2 agents operate under strict safety constraints (sandbox isolation, synthetic data only, no network access). These constraints are non-negotiable and enforced at the infrastructure level, not just by policy.

5. **Report findings with calibrated confidence**. Overconfident findings mislead L3 commanders; underconfident findings waste investigation time. Confidence scores should reflect the actual strength of evidence, with higher thresholds required for higher-severity findings.

6. **Maintain AIAD specification currency**. When an L2 agent's capabilities evolve, its AIAD specification must be updated immediately. Stale specifications create gaps between documented and actual agent behavior.

## Common Pitfalls

- **Scope creep into adjacent domains**: L2 agents that expand beyond their defined domain create coordination conflicts and untracked dependencies. If a finding has cross-domain implications, report it to the L3 commander for escalation rather than investigating directly.

- **Under-reporting low-severity findings**: Low-severity findings from individual L2 agents may reveal significant patterns when aggregated at L3. Do not self-filter -- report all findings and let the commander determine significance.

- **Ignoring safety constraints in test environments**: Safety constraints (sandbox isolation, synthetic data) apply equally in testing and production. Bypassing constraints in test environments creates muscle memory that leads to production violations.

- **Coupling L2 agents to specific implementations**: L2 agents should operate through defined interfaces (AIAD specifications, Sparkline contracts) rather than depending on internal implementation details of target systems. Implementation coupling breaks when targets evolve.

- **Treating confidence scores as binary**: Confidence is not pass/fail. A finding with 0.72 confidence is meaningfully different from one with 0.95 confidence. The confidence threshold system exists to prevent premature action on uncertain findings while still capturing valuable signals.

## Related Concepts

- [Agent Tier](@/glossary/agent-tier.md) -- Full L1-L5 classification system
- [Strategic Command](@/glossary/strategic-command.md) -- L4 coordination tier managing cross-domain operations
- [Supreme Commander](@/glossary/supreme-commander.md) -- L5 platform-wide authority
- [Red Team](@/glossary/red-team.md) -- Team with L2 adversarial simulation specialists
- [Blue Team](@/glossary/blue-team.md) -- Team with L2 defensive analysis specialists
- [White Team](@/glossary/white-team.md) -- Team with L2 formal verification specialists
- [Gray Team](@/glossary/gray-team.md) -- Team with L2 boundary exploration specialists
- [AIAD](@/glossary/aiad.md) -- Agent definition standard for all tier classifications
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing L2 agent findings
- [Violation Protocol](@/glossary/violation-protocol.md) -- Enforcement protocol for safety constraint violations

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Agents](@/agents/_index.md) -- Full agent catalog
- [Commands](@/commands/_index.md) -- Command catalog including agent operations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
