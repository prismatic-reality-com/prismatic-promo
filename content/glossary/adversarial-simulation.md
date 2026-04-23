+++
title = "Adversarial Simulation"
weight = 50

[extra]
description = "Controlled execution of adversarial scenarios in sandboxed environments with synthetic data to test system resilience, calibrate defenses, and validate epistemic integrity under attack conditions without risking production systems."
category = "security"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "security-testing"
related_concepts = ["red-team", "chaos-engineering", "penetration-testing", "synthetic-data", "adversarial-architecture"]
implementation_status = "production"
authority_level = "L3"
difficulty_rating = 8
prerequisites = ["adversarial-architecture", "color-teams", "red-team", "sandbox-isolation"]
learning_path = "security-operations"
interactive_demos = ["/labs/glossary/adversarial-simulation"]
code_examples = ["PrismaticDark.Simulation.execute/2", "PrismaticDark.RedTeam.Campaign.run_campaign/3"]
external_resources = ["NIST SP 800-115 Technical Guide to Information Security Testing", "PTES (Penetration Testing Execution Standard)", "MITRE ATT&CK Framework"]
version_introduced = "gen-6"
stability_level = "stable"
testing_scenarios = ["sandbox-isolation-verification", "synthetic-data-integrity", "ethics-check-compliance", "campaign-execution-validation"]
keywords = ["adversarial simulation", "security testing", "red team exercises", "sandbox execution", "epistemic attack testing", "controlled opposition"]
tags = ["security", "testing", "red-team", "simulation", "adversarial", "sandbox"]
related_terms = ["red-team", "blue-team", "purple-team", "black-team", "gray-team", "chaos-engineering", "penetration-testing", "synthetic-data", "adversarial-architecture", "adversarial-conditions", "adversarial-drift", "attack-surface", "color-teams", "sandbox-isolation"]
word_count = 1979
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Adversarial Simulation - Prismatic Platform"
+++

## Definition

Adversarial Simulation is the controlled, systematic execution of adversarial scenarios within isolated, sandboxed environments using exclusively synthetic data, designed to test system resilience, calibrate defensive mechanisms, and validate that epistemic integrity is maintained under attack conditions. Unlike penetration testing (which targets specific technical vulnerabilities in live systems), adversarial simulation encompasses the full spectrum of threat categories including epistemic attacks on reasoning processes, confidence manipulation, evidence poisoning, and gradual drift induction. The simulation framework produces structured findings that drive defensive improvements through a closed-loop process involving Red Team attack execution, Blue Team defensive assessment, and Purple Team synthesis and closure.

## Overview

### The Need for Controlled Opposition

Software systems face a fundamental validation paradox: the most important properties to verify -- resilience under hostile conditions, correctness under manipulated inputs, integrity under sustained adversarial pressure -- are precisely the properties that cannot be tested safely in production environments. Testing a system's resistance to data corruption by corrupting production data defeats the purpose. Testing epistemic resilience by poisoning real evidence streams introduces the exact harm the test is designed to prevent.

Adversarial simulation resolves this paradox through three principles:

1. **Complete Isolation**: All adversarial operations execute within sandboxed environments with zero connectivity to production systems, production data, or external networks. The sandbox is not a network segment or a virtual machine but a structural boundary enforced at the process level through the BEAM VM's isolation guarantees.

2. **Synthetic Data Exclusively**: All data used in adversarial simulations is synthetically generated. It is designed to be realistic in structure and statistical properties but contains no real entities, no Personally Identifiable Information (PII), and no production state. Using anonymized production data is explicitly forbidden because anonymization is reversible and introduces real-world consequences if the simulation produces actionable results.

3. **Structured Finding Production**: Every simulation produces structured findings with scenario identification, evidence of results, impact assessment, and actionable recommendations. Unstructured output (logs, notes, verbal reports) is insufficient because it cannot be systematically tracked through the Purple Team synthesis process.

### Evolution from Traditional Security Testing

Adversarial simulation represents a significant evolution beyond traditional security testing methodologies:

| Traditional Testing | Adversarial Simulation |
|-------------------|----------------------|
| Tests technical vulnerabilities (injection, XSS, authentication bypass) | Tests technical AND epistemic vulnerabilities (evidence manipulation, confidence corruption, reasoning subversion) |
| Point-in-time assessment (annual pentest, quarterly scan) | Continuous operation with evolving scenario taxonomy |
| Targets known vulnerability classes (OWASP Top 10) | Targets known AND novel attack patterns (329-entry taxonomy with continuous expansion) |
| Binary results (vulnerable/not vulnerable) | Graduated results (defended, partial bypass, full bypass, safety halt) |
| Findings go to engineering directly | Findings flow through Purple Team synthesis before reaching engineering |
| Tests defense existence | Tests defense effectiveness under realistic adversarial pressure |
| Individual test independence | Campaign-based testing with multi-scenario sequences |

### The Simulation-Defense Feedback Loop

Adversarial simulation does not merely identify weaknesses; it drives a continuous improvement cycle:

```
1. Gray Team explores boundaries, identifies specification gaps
       |
       v
2. Red Team generates adversarial scenarios from Gray findings + taxonomy
       |
       v
3. Red Team executes scenarios in sandbox with synthetic data
       |
       v
4. Findings (defended / partial bypass / full bypass) emitted
       |
       +---> Purple Team synthesizes findings with Blue defensive data
       |         |
       |         v
       |     Blue Team updates defensive posture based on synthesis
       |         |
       |         v
       |     White Team formally verifies updated defenses hold
       |
       v
5. Taxonomy updated with new scenarios based on findings
       |
       v
6. Cycle repeats with enriched taxonomy and updated defenses
```

Each cycle simultaneously strengthens defenses and strengthens testing. Red Team scenarios become more sophisticated as defenses improve. Defenses become more robust as Red Team scenarios evolve. This co-evolutionary dynamic produces genuine resilience rather than security theater.

## Technical Details

### Simulation Framework Architecture

The simulation framework consists of four major components: the Sandbox (isolation boundary), the Scenario Engine (scenario selection and parameterization), the Execution Runtime (controlled scenario execution), and the Finding Pipeline (structured output production).

```elixir
defmodule PrismaticDark.Simulation do
  @moduledoc """
  Core adversarial simulation framework. Manages the lifecycle of
  adversarial scenarios from selection through execution to finding
  production. All operations execute within sandbox isolation with
  synthetic data exclusively.
  """

  alias PrismaticDark.{Sandbox, ScenarioEngine, ExecutionRuntime, FindingPipeline}

  @type simulation_config :: %{
    campaign_id: String.t(),
    operator: String.t(),
    team: :red | :gray,
    scenarios: [ScenarioEngine.scenario()],
    sandbox_config: Sandbox.config(),
    max_duration: pos_integer(),
    ethics_interval: pos_integer()
  }

  @type simulation_result :: %{
    campaign_id: String.t(),
    scenarios_executed: non_neg_integer(),
    scenarios_defended: non_neg_integer(),
    scenarios_bypassed: non_neg_integer(),
    scenarios_partial: non_neg_integer(),
    scenarios_halted: non_neg_integer(),
    findings: [FindingPipeline.finding()],
    duration_ms: non_neg_integer(),
    audit_log: [map()]
  }

  @spec execute(simulation_config(), keyword()) ::
    {:ok, simulation_result()} | {:error, :safety_violation, String.t()}
  def execute(config, opts \\ []) do
    with :ok <- validate_config(config),
         {:ok, sandbox} <- Sandbox.create(config.sandbox_config),
         :ok <- verify_synthetic_data_only(sandbox),
         :ok <- verify_network_isolation(sandbox) do

      start_time = System.monotonic_time(:millisecond)
      ethics_timer = start_ethics_checks(config.ethics_interval)

      findings =
        config.scenarios
        |> maybe_shuffle(opts)
        |> Enum.map(fn scenario ->
          execute_scenario(sandbox, scenario, config)
        end)

      stop_ethics_checks(ethics_timer)
      duration = System.monotonic_time(:millisecond) - start_time

      result = compile_result(config.campaign_id, findings, duration, sandbox.audit_log)
      emit_findings_to_purple(result)

      {:ok, result}
    end
  end

  defp execute_scenario(sandbox, scenario, config) do
    case Sandbox.execute(sandbox, fn ctx ->
      ExecutionRuntime.run(ctx, scenario, timeout: config.max_duration)
    end) do
      {:ok, outcome, audit_entries} ->
        FindingPipeline.build_finding(scenario, outcome, audit_entries)

      {:error, :safety_violation, reason} ->
        FindingPipeline.build_safety_halt(scenario, reason)

      {:error, :timeout} ->
        FindingPipeline.build_timeout(scenario, config.max_duration)
    end
  end

  defp validate_config(config) do
    cond do
      config.team not in [:red, :gray] ->
        {:error, :safety_violation, "Only Red and Gray teams may execute adversarial simulations"}

      config.max_duration > :timer.hours(4) ->
        {:error, :safety_violation, "Maximum simulation duration is 4 hours"}

      config.ethics_interval > 15_000 ->
        {:error, :safety_violation, "Ethics check interval must not exceed 15 seconds"}

      Enum.empty?(config.scenarios) ->
        {:error, :safety_violation, "Simulation must include at least one scenario"}

      true ->
        :ok
    end
  end

  defp verify_synthetic_data_only(%{data_source: :synthetic_only}), do: :ok
  defp verify_synthetic_data_only(_) do
    {:error, :safety_violation, "All simulation data must be synthetic"}
  end

  defp verify_network_isolation(%{network_access: false}), do: :ok
  defp verify_network_isolation(_) do
    {:error, :safety_violation, "Simulations require zero network access"}
  end

  defp compile_result(campaign_id, findings, duration, audit_log) do
    %{
      campaign_id: campaign_id,
      scenarios_executed: length(findings),
      scenarios_defended: Enum.count(findings, &(&1.result == :defended)),
      scenarios_bypassed: Enum.count(findings, &(&1.result == :full_bypass)),
      scenarios_partial: Enum.count(findings, &(&1.result == :partial_bypass)),
      scenarios_halted: Enum.count(findings, &(&1.result == :safety_halt)),
      findings: findings,
      duration_ms: duration,
      audit_log: audit_log
    }
  end

  defp emit_findings_to_purple(result) do
    :telemetry.execute(
      [:prismatic_dark, :simulation, :campaign_complete],
      %{
        scenarios: result.scenarios_executed,
        bypassed: result.scenarios_bypassed,
        duration_ms: result.duration_ms
      },
      %{campaign_id: result.campaign_id, findings: result.findings}
    )
  end

  defp start_ethics_checks(interval) do
    {:ok, timer} = :timer.send_interval(interval, self(), :ethics_check)
    timer
  end

  defp stop_ethics_checks(timer), do: :timer.cancel(timer)

  defp maybe_shuffle(scenarios, opts) do
    if Keyword.get(opts, :randomize_order, true) do
      Enum.shuffle(scenarios)
    else
      scenarios
    end
  end
end
```

### Scenario Taxonomy and Selection

The simulation framework draws from a comprehensive 329-entry scenario taxonomy organized by attack primitive, target subsystem, and complexity level:

| Primitive | Scenario Count | Complexity Distribution | Target Subsystems |
|-----------|---------------|------------------------|-------------------|
| **Truth Distortion** | 72 | 20 basic, 25 intermediate, 18 advanced, 9 composite | Evidence pipeline, data ingestion, source adapters |
| **Confidence Manipulation** | 58 | 15 basic, 20 intermediate, 15 advanced, 8 composite | Scoring engine, belief graph, decision thresholds |
| **Signal Poisoning** | 65 | 18 basic, 22 intermediate, 16 advanced, 9 composite | Signal aggregation, source validation, plurality checks |
| **Drift Induction** | 71 | 22 basic, 24 intermediate, 17 advanced, 8 composite | Configuration, baselines, monitoring thresholds |
| **Salience Hijacking** | 63 | 16 basic, 21 intermediate, 17 advanced, 9 composite | Prioritization, alerting, attention allocation |

Scenarios are selected for campaigns based on several criteria:

```elixir
defmodule PrismaticDark.ScenarioEngine do
  @moduledoc """
  Selects and parameterizes adversarial scenarios for simulation
  campaigns. Supports targeted selection (specific primitive or
  subsystem), coverage-based selection (maximize attack surface
  coverage), and regression selection (previously bypassed scenarios).
  """

  @type scenario :: %{
    id: String.t(),
    primitive: atom(),
    target_subsystem: String.t(),
    complexity: :basic | :intermediate | :advanced | :composite,
    description: String.t(),
    preconditions: [String.t()],
    expected_impact: atom(),
    detection_difficulty: float(),
    last_executed: DateTime.t() | nil,
    last_result: atom() | nil
  }

  @type selection_strategy ::
    :targeted | :coverage | :regression | :graduated | :random

  @spec select_scenarios(selection_strategy(), keyword()) :: [scenario()]
  def select_scenarios(:targeted, opts) do
    primitive = Keyword.get(opts, :primitive)
    subsystem = Keyword.get(opts, :subsystem)
    limit = Keyword.get(opts, :limit, 20)

    taxonomy()
    |> filter_by_primitive(primitive)
    |> filter_by_subsystem(subsystem)
    |> Enum.take(limit)
  end

  def select_scenarios(:coverage, opts) do
    limit = Keyword.get(opts, :limit, 50)

    taxonomy()
    |> Enum.group_by(fn s -> {s.primitive, s.target_subsystem} end)
    |> Enum.flat_map(fn {_key, scenarios} ->
      Enum.sort_by(scenarios, & &1.last_executed)
      |> Enum.take(2)
    end)
    |> Enum.take(limit)
  end

  def select_scenarios(:regression, opts) do
    limit = Keyword.get(opts, :limit, 30)

    taxonomy()
    |> Enum.filter(&(&1.last_result in [:partial_bypass, :full_bypass]))
    |> Enum.sort_by(& &1.last_executed, {:desc, DateTime})
    |> Enum.take(limit)
  end

  def select_scenarios(:graduated, opts) do
    limit = Keyword.get(opts, :limit, 40)

    basic = taxonomy() |> Enum.filter(&(&1.complexity == :basic)) |> Enum.take(div(limit, 4))
    intermediate = taxonomy() |> Enum.filter(&(&1.complexity == :intermediate)) |> Enum.take(div(limit, 4))
    advanced = taxonomy() |> Enum.filter(&(&1.complexity == :advanced)) |> Enum.take(div(limit, 4))
    composite = taxonomy() |> Enum.filter(&(&1.complexity == :composite)) |> Enum.take(div(limit, 4))

    basic ++ intermediate ++ advanced ++ composite
  end

  def select_scenarios(:random, opts) do
    limit = Keyword.get(opts, :limit, 25)

    taxonomy()
    |> Enum.shuffle()
    |> Enum.take(limit)
  end

  defp taxonomy, do: []
  defp filter_by_primitive(scenarios, nil), do: scenarios
  defp filter_by_primitive(scenarios, primitive), do: Enum.filter(scenarios, &(&1.primitive == primitive))
  defp filter_by_subsystem(scenarios, nil), do: scenarios
  defp filter_by_subsystem(scenarios, subsystem), do: Enum.filter(scenarios, &(&1.target_subsystem == subsystem))
end
```

### Safety Protocols

Adversarial simulation safety is non-negotiable. The following protocols apply to every simulation without exception:

| Protocol | Enforcement | Violation Response |
|----------|-------------|-------------------|
| **Sandbox Isolation** | All operations execute in `PrismaticDark.Sandbox` only | Immediate termination, E3 HALT |
| **Synthetic Data Only** | No real data, no PII, no production state | Immediate termination, E4 investigation |
| **Zero Network Access** | No network connectivity for Red/Black operations | Immediate termination, E3 HALT |
| **Ethics Check Cadence** | Automated validation every 10-15 seconds | Simulation pause, escalation to operator |
| **Maximum Duration** | 4-hour hard limit per simulation campaign | Automatic termination, findings emitted for completed scenarios |
| **Audit Trail** | Immutable logging of every operation | Any audit gap triggers investigation |
| **Output Constraints** | Black Team produces abstract models only, never executable content | Output filtered through AbstractionFilter |
| **Escalation Guards** | Gray Escalation Guard prevents boundary exploration from becoming attack development | Operation halted, Gray-to-Red boundary reviewed |

### Finding Classification

Every simulation scenario produces a finding classified on a four-level scale:

| Classification | Definition | Implication |
|---------------|-----------|-------------|
| **Defended** | The defense successfully blocked the attack with no observable impact | Defense works for this specific vector; variations should be tested |
| **Partial Bypass** | The defense was partially circumvented; some adversarial effect observed but limited | Defense has gaps; the specific weakness should be documented and remediated |
| **Full Bypass** | The defense was completely circumvented; the adversarial objective was achieved | Critical finding; immediate defensive update required |
| **Safety Halt** | The simulation was halted by a safety protocol before completion | Safety protocols working correctly; scenario may need redesign |

## Implementation in Prismatic Platform

### Campaign Orchestration

The Red Team commander (`red-commander`) orchestrates adversarial simulation campaigns. A typical campaign follows a graduated complexity approach:

1. **Reconnaissance Phase**: Gray Team boundary exploration identifies specification gaps and edge cases in the target subsystem
2. **Basic Probing**: Basic-complexity scenarios from the taxonomy test fundamental defenses
3. **Intermediate Escalation**: If basic scenarios are defended, intermediate scenarios test defense robustness
4. **Advanced Techniques**: Advanced scenarios employ multi-step attacks with evasion techniques
5. **Composite Operations**: Composite scenarios combine multiple primitives to test defense integration
6. **Finding Compilation**: All results compiled into structured findings and emitted to Purple Team

### Integration Points

Adversarial simulation integrates with multiple platform systems:

- **[NABLA Infinity](/glossary/nabla-infinity/)**: Scenarios test axiom compliance under adversarial pressure. Signal poisoning tests Signal Plurality. Evidence manipulation tests Contradiction Preservation. Replay attacks test Time Decay.
- **[Trinity Gate](/glossary/trinity-gate/)**: Scenarios attempt to pass manipulated beliefs through all three verification layers. Success indicates a Trinity Gate weakness.
- **[Addiction Recovery](/glossary/addiction-recovery/)**: Drift induction scenarios test the Vigilance Monitor's ability to detect gradual rationalization patterns.
- **[Prismatic Perimeter](/glossary/easm/)**: Scenarios test whether security ratings can be artificially manipulated through evidence injection.
- **Quality Gates**: Simulation results feed into quality gate assessments, blocking releases that fail adversarial resilience criteria.

### Telemetry and Reporting

Every simulation emits telemetry events that feed into platform-wide monitoring:

```elixir
# Campaign-level events
[:prismatic_dark, :simulation, :campaign_start]
[:prismatic_dark, :simulation, :campaign_complete]

# Scenario-level events
[:prismatic_dark, :simulation, :scenario_start]
[:prismatic_dark, :simulation, :scenario_complete]
[:prismatic_dark, :simulation, :scenario_safety_halt]

# Finding-level events
[:prismatic_dark, :simulation, :finding_emitted]
[:prismatic_dark, :simulation, :finding_critical]
```

## Comparison with Alternatives

| Approach | Scope | Isolation | Data | Continuous | Epistemic Coverage | Structured Output |
|----------|-------|-----------|------|-----------|-------------------|-------------------|
| **Adversarial Simulation (Prismatic)** | Full spectrum (technical + epistemic) | Process-level sandbox | Synthetic only | Yes (campaign-based) | Full (5 primitives) | Yes (finding pipeline) |
| **Penetration Testing** | Technical vulnerabilities | Network segmentation | Real/staging | No (periodic) | None | Partial (reports) |
| **Bug Bounty Programs** | Application vulnerabilities | Production (controlled) | Real | Yes (crowdsourced) | None | Partial (submissions) |
| **Chaos Engineering** | Infrastructure resilience | Production (controlled) | Real | Yes | None | Partial (metrics) |
| **Tabletop Exercises** | Incident response | None (discussion-based) | None | No (periodic) | Partial (scenario discussion) | No (meeting notes) |
| **Threat Modeling (STRIDE)** | Design vulnerabilities | None (analysis-based) | None | No (design-time) | None | Yes (threat catalog) |
| **Automated Security Scanning** | Known vulnerability patterns | Tool-level | Real/staging | Yes (CI/CD) | None | Yes (scan reports) |

## Best Practices

1. **Always Execute in Full Sandbox Isolation**: Never run adversarial simulations outside the sandbox, regardless of how "safe" a specific scenario appears. The sandbox is not a precaution; it is a structural requirement.

2. **Use Graduated Complexity**: Start campaigns with basic scenarios and escalate to composite attacks. Skipping basic scenarios misses fundamental defense gaps that advanced scenarios may not test.

3. **Route All Findings Through Purple Team**: Direct Red-to-Engineering communication bypasses the synthesis that contextualizes findings, prevents duplicate work, and identifies systemic patterns across individual findings.

4. **Maintain Scenario Freshness**: Update the taxonomy continuously based on new platform features, emerging threat intelligence, and Black Team theoretical models. A static taxonomy produces diminishing returns as the platform evolves.

5. **Treat Partial Bypasses as Seriously as Full Bypasses**: A partial bypass indicates a defense that almost failed. The difference between "partial" and "full" may be a single parameter adjustment by a more sophisticated adversary.

6. **Randomize Scenario Execution Order**: Fixed execution order allows defenses to be "primed" by earlier scenarios. Randomization tests defense readiness under unpredictable conditions.

7. **Verify Ethics Check Compliance**: The 10-15 second ethics check cadence is not optional. Ethics checks prevent adversarial thinking from drifting into genuinely harmful territory during extended simulation campaigns.

## Common Pitfalls

- **Security theater simulations**: Running simulations with known-easy scenarios to produce reassuring "defended" results. The regression selection strategy specifically counteracts this by prioritizing scenarios that previously produced bypasses.

- **Sandbox leakage**: Even minor sandbox violations (reading production logs, timing side channels, DNS resolution against production resolvers) can invalidate simulation results and potentially cause harm. Sandbox integrity must be verified before every campaign.

- **Finding accumulation without remediation**: Producing findings faster than they can be addressed creates a backlog that obscures critical issues. Campaign frequency should match organizational remediation capacity.

- **Over-reliance on automated scenarios**: While automation enables coverage and consistency, the most valuable findings often come from creative, human-directed scenario design. Automated scanning catches known patterns; human creativity discovers novel ones.

- **Ignoring safety halts**: A safety halt is not a failed scenario; it is the safety system working correctly. Investigating why a scenario triggered safety controls often reveals important information about the scenario's proximity to genuinely harmful operations.

- **Treating simulation results as binary security assessments**: A simulation campaign that produces all "defended" results proves only that the specific scenarios tested were defended. It does not prove the system is secure. The absence of identified bypasses is not evidence of the absence of bypasses.

## Use Cases

### Use Case 1: Pre-Release Security Validation

Before every platform release, a coverage-based adversarial simulation campaign executes scenarios across all five primitives targeting subsystems affected by the release. The release is blocked if any scenario produces a full bypass in changed code paths.

### Use Case 2: NABLA Axiom Stress Testing

Periodic campaigns specifically target NABLA axiom enforcement. Signal poisoning scenarios test Signal Plurality. Evidence manipulation scenarios test Contradiction Preservation. Replay scenarios test Time Decay. Source fabrication scenarios test Source Independence. The results quantify NABLA's robustness under adversarial pressure.

### Use Case 3: New Feature Adversarial Assessment

When a new feature is deployed (e.g., a new OSINT adapter), targeted simulation campaigns generate scenarios specific to the feature's attack surface. This is distinct from general security testing: adversarial simulation tests not just whether the feature has technical vulnerabilities but whether it introduces epistemic vulnerabilities (new evidence paths that could be poisoned, new confidence paths that could be manipulated).

### Use Case 4: Defense Regression Monitoring

The regression selection strategy identifies scenarios that previously bypassed defenses and re-executes them after defensive updates. This validates that remediations are effective and have not introduced new weaknesses. The Purple Team's `purple-regression-guard` tracks the lifecycle of each finding from initial bypass through remediation to verified defense.

## Related Concepts

- [Red Team](/glossary/red-team/) -- Primary executor of adversarial simulations using 5 epistemic attack primitives
- [Blue Team](/glossary/blue-team/) -- Defensive team whose posture is tested and calibrated through simulations
- [Purple Team](/glossary/purple-team/) -- Synthesis hub processing simulation findings into defensive improvements
- [Black Team](/glossary/black-team/) -- Theoretical threat modeling that feeds simulation scenario design
- [Gray Team](/glossary/gray-team/) -- Boundary exploration providing seeds for simulation scenarios
- [Color Teams](/glossary/color-teams/) -- Complete color team framework overview
- [Chaos Engineering](/glossary/chaos-engineering/) -- Infrastructure resilience testing with complementary scope
- [Penetration Testing](/glossary/penetration-testing/) -- Traditional security testing subsumed by adversarial simulation
- [Attack Surface](/glossary/attack-surface/) -- The target domain assessed through simulation campaigns
- [Adversarial Architecture](/glossary/adversarial-architecture/) -- Design methodology that adversarial simulation validates
- [Adversarial Conditions](/glossary/adversarial-conditions/) -- Operating environments simulated through controlled scenarios
- [Adversarial Drift](/glossary/adversarial-drift/) -- Specific threat type tested through drift induction scenarios
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework validated through axiom stress testing
- [Trinity Gate](/glossary/trinity-gate/) -- Verification gate tested through bypass attempt scenarios

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Agents](/agents/) -- Full agent catalog including all 20 color team simulation agents

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
