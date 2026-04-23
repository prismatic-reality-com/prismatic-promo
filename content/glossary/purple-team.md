+++
title = "Purple Team"
weight = 21
[extra]
description = "Central synthesis hub with sole authority for Red-Blue loop closure and security finding resolution"
category = "security"
related_terms = ["color-teams", "red-team", "blue-team", "trinity-gate", "regression-test", "white-team", "black-team", "gray-team"]
platform_relevance = "critical"
complexity = "advanced"
domain = "security-operations"
layer = "synthesis"
paradigm = "adversarial-defensive-synthesis"
agent_count = 4
agent_classifications = ["L3", "L4"]
closure_conditions = 4
prismatic_usage = "security-finding-lifecycle-management"
quality_impact = "high"
safety_level = "safety-critical"
documentation_required = true
testing_strategy = "closure-state-machine-verification"
commander = "purple-coordinator"
signal_flow = "red-findings -> purple-synthesis -> blue-defense"
anti_metric_enforcement = true
related_apps = ["prismatic_dark", "prismatic_agents", "prismatic_safety"]
closure_model = "4-condition-mandatory"
see_also = ["color-teams", "red-team", "blue-team", "white-team", "trinity-gate", "regression-test"]
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 2000
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Purple", "Team", "Central", "Red-Blue", "glossary", "security", "Prismatic Platform", "Purple Team", "Red Team", "Blue Team"]
tags = ["glossary", "security", "purple-team", "prismatic"]
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "Purple Team - Prismatic Platform"
+++

## Definition and Overview

The Purple Team is a specialized security operations unit that serves as the central synthesis hub between adversarial (Red) and defensive (Blue) security teams. Unlike traditional security models where Red and Blue teams operate independently, the Purple Team ensures continuous feedback loops, maps offensive findings to defensive capabilities, and holds sole authority for closure state transitions. This prevents premature dismissal of security findings and ensures that every identified vulnerability has been genuinely addressed rather than merely acknowledged.

In the broader cybersecurity industry, Purple Teaming emerged as a recognition that Red and Blue teams operating in isolation often fail to transfer knowledge effectively. Findings get lost, defenses remain untested against known attacks, and organizations develop blind spots. The Purple Team model solves this by creating a dedicated synthesis function that bridges offensive and defensive perspectives, ensuring that every attack scenario maps to a verified defense and every defense is validated against realistic threats.

The Prismatic Platform elevates the Purple Team concept beyond human-mediated workshops into a permanent, autonomous agent-driven synthesis layer. Within Prismatic, the Purple Team consists of four specialized agents operating at L3-L4 classification levels, continuously monitoring the Red-Blue loop and enforcing rigorous closure conditions that prevent false resolution of security findings. The team operates under the [NO MERCY](@/glossary/no-mercy.md) doctrine, applying zero-tolerance standards to finding closure and regression prevention.

## Historical Context and Industry Evolution

The concept of Purple Teaming has its roots in the limitations observed in traditional Red Team / Blue Team engagements. For decades, cybersecurity organizations have conducted periodic Red Team exercises where adversarial specialists attempt to breach defenses, followed by Blue Team analysis of what was missed and how to improve. The fundamental problem with this sequential model is the knowledge transfer gap: Red Teams produce reports, Blue Teams read reports, and the translation from "attack succeeded" to "defense improved" often loses critical nuance.

The term "Purple Team" gained traction around 2015-2016 in the cybersecurity community, initially referring to collaborative exercises where Red and Blue team members work side by side. Organizations like SANS Institute formalized Purple Teaming methodologies, emphasizing real-time feedback between attack execution and defense validation. However, most industry implementations treat Purple Teaming as a periodic activity -- scheduled workshops or quarterly exercises -- rather than a continuous operational function.

The Prismatic Platform's innovation is making the Purple Team a permanent, autonomous agent layer rather than a periodic human activity. Drawing from the platform's AIAD (Autonomous Intelligence Agent Doctrine) framework, the Purple Team agents operate continuously, processing Red Team findings as they arrive, maintaining live bidirectional mappings between attacks and defenses, and enforcing closure conditions that prevent the organizational inertia that typically leads to findings being filed and forgotten.

This approach was influenced by lessons from the aviation safety industry, where the concept of "closing the loop" on safety findings is rigorously enforced through regulatory frameworks like SMS (Safety Management Systems). In aviation, a safety finding cannot be closed until a corrective action has been implemented, verified, and shown to prevent recurrence. The Prismatic Purple Team applies this same rigor to cybersecurity findings through its 4-condition closure model.

## Technical Deep Dive

### Purple Team Agent Composition

The Purple Team operates with four agents, each fulfilling a distinct synthesis function.

| Agent | Classification | Role | Primary Function |
|-------|---------------|------|-----------------|
| `purple-coordinator` | L3 Strategic Commander | Synthesis Hub | Orchestrates all Purple operations, manages closure authority, anti-metric enforcement |
| `purple-mapper` | L4 Operational Specialist | Bidirectional Mapping | Maps Red findings to Blue defenses and vice versa, identifies coverage gaps |
| `purple-closure-analyst` | L4 Operational Specialist | Closure Evaluation | Evaluates 4-condition closure requirements, detects false closure patterns |
| `purple-regression-guard` | L4 Safety-Critical | Regression Prevention | Guards against regression traps across deployments, enforces deployment gates |

The `purple-coordinator` holds L3 (Strategic Commander) classification, giving it authority to orchestrate operations across the Purple Team and interact directly with Red Team and Blue Team coordinators. The `purple-regression-guard` carries the "Safety-Critical" designation, meaning its deployment gate decisions cannot be overridden by standard operational authority -- only Supreme-level intervention can bypass a regression guard block.

### The 4-Condition Closure Model

No security finding can be closed without meeting all four conditions simultaneously. This model prevents the common industry problem of premature closure where organizations mark vulnerabilities as "resolved" without adequate verification.

1. **Red Confirmation**: The [Red Team](@/glossary/red-team.md) confirms that their original attack vector has been neutralized by the proposed defense. This is not a theoretical assessment but a re-execution of the attack scenario against the patched system. If the Red Team can still achieve the attack objective through the original vector, the finding remains open regardless of Blue Team's assessment.

2. **Blue Verification**: The [Blue Team](@/glossary/blue-team.md) verifies that the defensive measure is operational, monitored, and producing the expected telemetry signals. A defense that exists but is not actively monitored provides false confidence. Blue Verification requires evidence that defensive telemetry is flowing, alert rules are configured, and the defense would trigger notification if an attack were detected.

3. **White Proof**: The [White Team](@/glossary/white-team.md) provides formal or semi-formal verification that the fix addresses the root cause rather than merely the symptom. This prevents surface-level patches that leave underlying vulnerabilities exploitable through variant techniques. White Proof may involve property-based testing, contract validation, or formal Lean4 proofs depending on the finding's criticality.

4. **Regression Lock**: The Purple Regression Guard confirms that automated regression tests exist to detect any future recurrence. Without this condition, previously-fixed vulnerabilities can silently reappear during refactoring or dependency updates. The [regression test](@/glossary/regression-test.md) must fail without the fix and pass with it, demonstrating both the test's validity and the fix's effectiveness.

### Signal Flow Architecture

The Purple Team sits at the intersection of all [color team](@/glossary/color-teams.md) signal flows.

```
Gray (boundary seeds) --> Red (adversarial scenarios) --> Purple (synthesis) --> Blue (defense)
                                    ^                          |       ^           |
                                    |                          v       |           v
                               Black (threat models)     White (proofs)    Platform Defense
```

Purple receives inputs from Red Team findings, Blue Team defensive posture assessments, White Team verification proofs, and [Gray Team](@/glossary/gray-team.md) boundary exploration reports. It produces closure decisions, regression requirements, and deployment gate enforcement actions.

The signal flow is designed to be unidirectional with feedback loops. Red Team findings flow into Purple for synthesis. Purple produces defense requirements that flow to Blue. Blue's implementation evidence flows back to Purple for verification. White Team proofs flow into Purple to satisfy the formal verification closure condition. This circular flow ensures that no finding can be "lost" in the system -- every finding has an explicit state in the closure state machine and every state transition requires evidence.

## Architecture and Implementation

### Closure State Machine

The Purple Team manages a formal state machine for each security finding. State transitions are strictly ordered and each transition requires evidence.

```elixir
defmodule PrismaticDark.Purple.ClosureStateMachine do
  @moduledoc """
  Manages the lifecycle of security finding closure.
  Findings progress through states with strict transition rules.
  No state can be skipped, and each transition requires evidence
  from the corresponding color team.
  """

  @type finding_state ::
    :open
    | :red_confirmed
    | :blue_verified
    | :white_proven
    | :regression_locked
    | :closed

  @type closure_conditions :: %{
    red_confirmation: boolean(),
    blue_verification: boolean(),
    white_proof: boolean(),
    regression_lock: boolean()
  }

  @type transition_evidence :: %{
    team: atom(),
    agent_id: String.t(),
    evidence_type: String.t(),
    evidence_data: map(),
    timestamp: DateTime.t()
  }

  @spec evaluate_closure(closure_conditions()) :: {:ok, :closed} | {:error, [atom()]}
  def evaluate_closure(conditions) do
    missing =
      conditions
      |> Enum.filter(fn {_key, value} -> value == false end)
      |> Enum.map(fn {key, _value} -> key end)

    case missing do
      [] -> {:ok, :closed}
      failed -> {:error, failed}
    end
  end

  @spec transition(finding_state(), atom(), transition_evidence()) ::
    {:ok, finding_state()} | {:error, :invalid_transition | :insufficient_evidence}
  def transition(:open, :red_confirms, evidence) when evidence.team == :red do
    {:ok, :red_confirmed}
  end
  def transition(:red_confirmed, :blue_verifies, evidence) when evidence.team == :blue do
    {:ok, :blue_verified}
  end
  def transition(:blue_verified, :white_proves, evidence) when evidence.team == :white do
    {:ok, :white_proven}
  end
  def transition(:white_proven, :regression_locks, evidence) when evidence.team == :purple do
    {:ok, :regression_locked}
  end
  def transition(:regression_locked, :close, _evidence) do
    {:ok, :closed}
  end
  def transition(_state, _event, _evidence) do
    {:error, :invalid_transition}
  end
end
```

### Bidirectional Mapping Engine

The `purple-mapper` agent maintains a bidirectional graph structure that maps every Red Team finding to its corresponding Blue Team defense and vice versa. This mapping reveals coverage gaps: findings without defenses and defenses without threat models.

```elixir
defmodule PrismaticDark.Purple.BidirectionalMapper do
  @moduledoc """
  Maps Red Team findings to Blue Team defenses bidirectionally.
  Identifies coverage gaps where findings lack defenses or
  defenses lack threat models. Maintains a live graph of the
  attack-defense relationship space.
  """

  use GenServer

  @type mapping :: %{
    finding_id: String.t(),
    defense_ids: [String.t()],
    coverage_score: float(),
    gap_analysis: [String.t()]
  }

  @type coverage_report :: %{
    total_findings: non_neg_integer(),
    mapped_findings: non_neg_integer(),
    unmapped_findings: [String.t()],
    total_defenses: non_neg_integer(),
    validated_defenses: non_neg_integer(),
    unmapped_defenses: [String.t()],
    coverage_percentage: float()
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    state = %{
      finding_to_defense: %{},
      defense_to_finding: %{},
      unmapped_findings: MapSet.new(),
      unmapped_defenses: MapSet.new()
    }
    {:ok, state}
  end

  @spec map_finding_to_defense(String.t(), String.t()) :: :ok
  def map_finding_to_defense(finding_id, defense_id) do
    GenServer.call(__MODULE__, {:map, finding_id, defense_id})
  end

  @spec coverage_gaps() :: coverage_report()
  def coverage_gaps do
    GenServer.call(__MODULE__, :coverage_gaps)
  end

  @spec coverage_score() :: float()
  def coverage_score do
    GenServer.call(__MODULE__, :coverage_score)
  end

  @impl true
  def handle_call({:map, finding_id, defense_id}, _from, state) do
    new_f2d = Map.update(state.finding_to_defense, finding_id, [defense_id], &[defense_id | &1])
    new_d2f = Map.update(state.defense_to_finding, defense_id, [finding_id], &[finding_id | &1])

    new_state = %{state |
      finding_to_defense: new_f2d,
      defense_to_finding: new_d2f,
      unmapped_findings: MapSet.delete(state.unmapped_findings, finding_id),
      unmapped_defenses: MapSet.delete(state.unmapped_defenses, defense_id)
    }

    {:reply, :ok, new_state}
  end

  @impl true
  def handle_call(:coverage_gaps, _from, state) do
    report = %{
      total_findings: map_size(state.finding_to_defense) + MapSet.size(state.unmapped_findings),
      mapped_findings: map_size(state.finding_to_defense),
      unmapped_findings: MapSet.to_list(state.unmapped_findings),
      total_defenses: map_size(state.defense_to_finding) + MapSet.size(state.unmapped_defenses),
      validated_defenses: map_size(state.defense_to_finding),
      unmapped_defenses: MapSet.to_list(state.unmapped_defenses),
      coverage_percentage: calculate_coverage(state)
    }

    {:reply, report, state}
  end

  defp calculate_coverage(state) do
    total = map_size(state.finding_to_defense) + MapSet.size(state.unmapped_findings)
    if total == 0, do: 100.0, else: map_size(state.finding_to_defense) / total * 100.0
  end
end
```

### Regression Guard Implementation

The `purple-regression-guard` operates as a safety-critical agent that prevents previously-closed findings from reappearing undetected. It maintains a registry of regression tests associated with each closed finding and verifies their continued passage before allowing deployments.

```elixir
defmodule PrismaticDark.Purple.RegressionGuard do
  @moduledoc """
  Monitors deployment gates and regression test suites to prevent
  previously-closed security findings from resurfacing. This agent
  carries Safety-Critical classification - its gate decisions cannot
  be overridden by standard operational authority.
  """

  @type regression_check :: %{
    finding_id: String.t(),
    test_file: String.t(),
    test_name: String.t(),
    last_verified: DateTime.t(),
    status: :passing | :failing | :missing
  }

  @spec verify_regression_coverage(String.t()) :: {:ok, regression_check()} | {:error, :no_test}
  def verify_regression_coverage(finding_id) do
    case lookup_regression_test(finding_id) do
      {:ok, test} -> execute_and_report(test)
      :not_found -> {:error, :no_test}
    end
  end

  @spec deployment_gate_check([String.t()]) :: :pass | {:block, [String.t()]}
  def deployment_gate_check(finding_ids) do
    results =
      finding_ids
      |> Task.async_stream(&verify_regression_coverage/1, max_concurrency: 4, timeout: 30_000)
      |> Enum.map(fn
        {:ok, result} -> result
        {:exit, reason} -> {:error, {:timeout, reason}}
      end)

    failed =
      results
      |> Enum.filter(fn
        {:error, _} -> true
        {:ok, %{status: :failing}} -> true
        {:ok, %{status: :missing}} -> true
        _ -> false
      end)

    case failed do
      [] -> :pass
      blocked -> {:block, blocked}
    end
  end

  @spec register_regression_test(String.t(), String.t(), String.t()) :: :ok
  def register_regression_test(finding_id, test_file, test_name) do
    # Store mapping from finding to its regression test
    PrismaticStorage.ETS.put({:regression_test, finding_id}, %{
      test_file: test_file,
      test_name: test_name,
      registered_at: DateTime.utc_now()
    })
    :ok
  end

  defp lookup_regression_test(finding_id) do
    case PrismaticStorage.ETS.get({:regression_test, finding_id}) do
      {:ok, test} -> {:ok, test}
      {:error, :not_found} -> :not_found
    end
  end

  defp execute_and_report(test) do
    case System.cmd("mix", ["test", test.test_file, "--only", "test:#{test.test_name}"],
           stderr_to_stdout: true) do
      {_, 0} -> {:ok, %{test | status: :passing, last_verified: DateTime.utc_now()}}
      {_, _} -> {:ok, %{test | status: :failing, last_verified: DateTime.utc_now()}}
    end
  end
end
```

## Anti-Metric Enforcement

A distinctive feature of the Purple Team is its anti-metric enforcement philosophy. The `purple-coordinator` actively resists metric-driven closure incentives. Common anti-patterns in security operations include closing findings to meet closure rate KPIs, downgrading severity to avoid blocking deployments, or accepting partial fixes to improve statistics. The Purple Team's sole authority over closure transitions prevents these organizational pressures from compromising security integrity.

### Anti-Patterns Detected and Blocked

| Anti-Pattern | Detection Method | Response |
|-------------|-----------------|----------|
| **KPI-driven closure** | Closure rate spikes without proportional fix activity | Block + investigation |
| **Severity downgrading** | Severity changes without new evidence | Require evidence for reclassification |
| **Partial fix acceptance** | Fix addresses symptom but not root cause | Keep finding open, track partial progress |
| **Time-based expiry** | Finding auto-closed after time threshold | Forbidden -- findings never expire |
| **Copy-paste closure** | Identical closure justification across findings | Flag for individual review |

The anti-metric philosophy is rooted in the observation that Goodhart's Law ("When a measure becomes a target, it ceases to be a good measure") applies particularly strongly to security metrics. Once organizations measure "finding closure rate," they optimize for closing findings rather than for improving security. The Purple Team's independence from delivery timelines and performance metrics ensures that closure decisions are based solely on evidence.

## False Closure Detection

The `purple-closure-analyst` specifically looks for patterns indicating false closure.

- **Symptom-Level Fixes**: Patches that address the specific exploit but not the underlying vulnerability class. A WAF rule blocking a specific SQLi payload while the underlying parameterization issue remains.

- **Environment-Specific Fixes**: Defenses that work in testing but not in production configurations. A security header added in test config but not in production deployment scripts.

- **Partial Coverage**: Fixes that close one attack vector while leaving related vectors exploitable. Patching one endpoint while leaving other endpoints with the same vulnerability.

- **Time-Decayed Defenses**: Defenses that were effective at closure time but have degraded due to infrastructure changes, dependency updates, or configuration drift.

```elixir
defmodule PrismaticDark.Purple.FalseClosureDetector do
  @moduledoc """
  Analyzes closure attempts for patterns indicating false resolution.
  Applies heuristics and historical pattern matching to identify
  closures that may not represent genuine security improvement.
  """

  @type analysis_result :: %{
    finding_id: String.t(),
    risk_level: :low | :medium | :high,
    indicators: [String.t()],
    recommendation: :approve | :investigate | :reject
  }

  @spec analyze_closure(String.t(), map()) :: {:ok, analysis_result()} | {:error, term()}
  def analyze_closure(finding_id, closure_evidence) do
    indicators = []

    indicators = if symptom_level_fix?(closure_evidence), do:
      ["Symptom-level fix detected" | indicators], else: indicators

    indicators = if environment_specific?(closure_evidence), do:
      ["Environment-specific fix detected" | indicators], else: indicators

    indicators = if partial_coverage?(closure_evidence), do:
      ["Partial coverage detected" | indicators], else: indicators

    risk_level = case length(indicators) do
      0 -> :low
      1 -> :medium
      _ -> :high
    end

    recommendation = case risk_level do
      :low -> :approve
      :medium -> :investigate
      :high -> :reject
    end

    {:ok, %{
      finding_id: finding_id,
      risk_level: risk_level,
      indicators: indicators,
      recommendation: recommendation
    }}
  end
end
```

## Integration Points

| System | Integration | Purpose |
|--------|------------|---------|
| [Red Team](@/glossary/red-team.md) | Finding ingestion | Receives adversarial scenarios for defense mapping |
| [Blue Team](@/glossary/blue-team.md) | Defense posture data | Receives defensive capability assessments |
| [White Team](@/glossary/white-team.md) | Verification proofs | Receives formal proofs for closure conditions |
| [Quality Gates](@/glossary/quality-gates.md) | Deployment blocking | Blocks deployments with unclosed critical findings |
| AIAD Registry | Agent coordination | Manages Purple agent lifecycle and communication |
| Telemetry | Event emission | Emits closure events for platform-wide monitoring |
| [Trinity Gate](@/glossary/trinity-gate.md) | Verification alignment | Closure proofs pass through Trinity Gate validation |

## Best Practices

1. **Never bypass the 4-condition model**. Each condition exists because historical experience showed that skipping any single condition leads to false closure. The conditions are the minimum viable verification set.

2. **Maintain bidirectional mapping continuously**. Do not treat mapping as a periodic activity. Every new Red Team finding should be mapped to defenses within hours, and every new Blue Team defense should be validated against known findings.

3. **Treat regression guard failures as P0 incidents**. A failing regression test means a previously-closed finding may have resurfaced. This warrants immediate investigation regardless of current sprint priorities.

4. **Resist closure pressure from stakeholders**. The Purple Team's value lies precisely in its independence from delivery timelines. Compromising closure standards to meet deadlines undermines the entire security operations model.

5. **Document closure reasoning extensively**. Each closure decision should include the evidence chain from all four conditions, making future audits and regression investigations traceable.

6. **Review the bidirectional map regularly**. Unmapped findings represent attack vectors without defenses. Unmapped defenses represent security investments without validated threat models. Both indicate gaps in the security posture.

7. **Never auto-close findings based on time**. Unlike project management issues, security findings do not become less relevant with age. An unpatched vulnerability is as dangerous after six months as it was when discovered.

## Common Pitfalls

- **Confusing Purple Team with joint Red-Blue exercises**: Traditional "purple team exercises" are time-bounded workshops. The Prismatic Purple Team is a permanent, autonomous synthesis layer that operates continuously.

- **Treating closure as binary**: Findings exist on a spectrum of resolution. Partial fixes may reduce risk without achieving full closure. The Purple Team tracks partial remediation as risk reduction while keeping the finding open.

- **Neglecting the regression guard**: The most common failure mode is closing findings correctly but failing to maintain regression coverage as the codebase evolves. The regression guard prevents this drift.

- **Over-relying on automated closure**: While the 4-condition model is evaluated programmatically, the conditions themselves require human-level judgment. Automated test passage does not automatically mean a finding is truly resolved.

- **Organizational resistance**: Security teams accustomed to closing findings unilaterally may resist the Purple Team's closure authority. This resistance is expected and must be addressed through education about false closure costs.

## Related Concepts

- [Red Team](@/glossary/red-team.md) -- Adversarial simulation team producing findings for Purple synthesis
- [Blue Team](@/glossary/blue-team.md) -- Defensive evidence team providing defense posture data
- [White Team](@/glossary/white-team.md) -- Verification team whose proofs feed into closure decisions
- [Black Team](@/glossary/black-team.md) -- Theoretical threat modeling informing Purple's risk assessment
- [Gray Team](@/glossary/gray-team.md) -- Boundary exploration feeding edge cases to Purple mapping
- [Color Teams](@/glossary/color-teams.md) -- Full overview of all six color team operations
- [Trinity Gate](@/glossary/trinity-gate.md) -- Verification gate complementing Purple closure requirements
- [Regression Test](@/glossary/regression-test.md) -- Code-level pattern for preventing recurrence
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing Purple Team evidence standards
- [Audit Trail](@/glossary/audit-trail.md) -- Immutable record of all closure decisions and evidence

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Agents](@/agents/_index.md) -- Full agent catalog including Purple Team agents
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Application directory

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
