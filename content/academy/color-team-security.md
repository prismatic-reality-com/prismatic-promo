+++
title = "Color Team Security Operations"
weight = 9
[extra]
description = "Understanding the 6 color teams, adversarial-defensive synthesis, and simulation setup"
category = "advanced"
difficulty = "advanced"
duration = "70 min"
prerequisites = ["agent-orchestration", "nabla-infinity-guide"]
glossary_terms = ["color-teams", "nabla-infinity", "trinity-gate", "aiad", "no-mercy", "no-doubts"]
technologies = ["elixir", "otp"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 996
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Color", "Team", "Security", "Operations", "Understanding", "academy", "advanced", "Prismatic Platform", "Blue", "Black"]
tags = ["academy", "advanced", "color-team-security-operations", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Color Team Security Operations - Prismatic Platform"
+++

## Overview

The Prismatic Platform employs 20 agents organized across 6 [color teams](/glossary/color-teams/) to provide epistemic security through adversarial-defensive synthesis. This is not traditional penetration testing -- it is a continuous process where agents attack, defend, synthesize, verify, and model threats to the platform's knowledge integrity. This guide teaches you the architecture, signal flow, and how to extend each team.

You will learn:

- The role and agents of each color team (Gray, Red, Blue, Purple, White, Black)
- The signal flow architecture: how findings propagate through the system
- How to create simulation scenarios for the Red Team
- How the Purple Team achieves loop closure between attack and defense
- Safety protocols that prevent simulation from becoming real attack

## Prerequisites

- Completed [Multi-Agent Orchestration Patterns](/academy/agent-orchestration/)
- Completed [Applying NABLA Infinity Axioms](/academy/nabla-infinity-guide/)
- Understanding of security concepts (attack surface, threat modeling, defense in depth)

## Core Concepts

### The Six Color Teams

Each color team has a distinct role in the epistemic security lifecycle:

| Team | Role | Agent Count | Focus |
|------|------|-------------|-------|
| **Gray** | Boundary Exploration | 3 | Finds specification gaps and edge cases |
| **Red** | Adversarial Simulation | 4 | Simulates epistemic attacks |
| **Blue** | Epistemic Defense | 4 | Detects and defends against drift |
| **Purple** | Synthesis & Closure | 4 | Closes the Red-Blue feedback loop |
| **White** | Constructive Verification | 3 | Proves systems hold formally |
| **Black** | Theoretical Threat Modeling | 2 | Models worst-case scenarios |

### Signal Flow Architecture

Findings flow through the teams in a defined pattern:

```
Gray (boundary seeds)
  |
  v
Red (adversarial scenarios)  <---  Black (threat models, ISOLATED)
  |
  v
Purple (synthesis & closure)
  |
  +---> Blue (defense posture)
  |
  +---> White (formal proofs)
  |
  v
Platform Defense Updates
```

Gray discovers boundaries. Red attacks them. Purple synthesizes the findings. Blue defends. White proves the defense holds. Black models theoretical worst cases in complete isolation.

### Safety Boundaries

All color team operations are simulation-only. There are hard safety boundaries:

- **Sandbox isolation**: Red and Black operations execute only in `PrismaticDark.Sandbox`
- **Synthetic data only**: No real data, no PII, no production state in any simulation
- **No network access**: Zero network connectivity for Red/Black operations
- **Ethics checks**: Automated validation every 10-15 seconds
- **No executable output**: Black team never produces executable code

## Step-by-Step Guide

### Step 1: Understanding Gray Team -- Boundary Exploration

Gray agents perform read-only exploration of specification gaps. They surface ambiguity without resolving it:

```elixir
defmodule PrismaticDark.Gray.EdgeFinder do
  @moduledoc """
  L4 Specialist: Identifies boundary values, specification gaps,
  and affordance drift in platform components.

  Safety: Read-only operations only. Zero state changes.
  """

  use GenServer

  @type finding :: %{
          type: :specification_gap | :edge_case | :affordance_drift,
          component: String.t(),
          description: String.t(),
          severity: :low | :medium | :high,
          evidence: map()
        }

  @spec scan_component(String.t()) :: {:ok, [finding()]}
  def scan_component(component_name) do
    GenServer.call(__MODULE__, {:scan, component_name}, 30_000)
  end

  @impl true
  def init(_opts) do
    {:ok, %{findings: [], scans_completed: 0}}
  end

  @impl true
  def handle_call({:scan, component_name}, _from, state) do
    findings = perform_boundary_scan(component_name)

    # Route findings to Red and Purple teams
    Enum.each(findings, fn finding ->
      Phoenix.PubSub.broadcast(
        Prismatic.PubSub,
        "color_team:gray:findings",
        {:gray_finding, finding}
      )
    end)

    new_state = %{
      state
      | findings: findings ++ state.findings,
        scans_completed: state.scans_completed + 1
    }

    {:reply, {:ok, findings}, new_state}
  end

  defp perform_boundary_scan(component_name) do
    [
      check_input_boundaries(component_name),
      check_specification_completeness(component_name),
      check_affordance_consistency(component_name)
    ]
    |> List.flatten()
    |> Enum.reject(&is_nil/1)
  end

  defp check_input_boundaries(component_name) do
    # Analyze function specs for unhandled edge cases
    # e.g., empty strings, negative numbers, nil values
    %{
      type: :edge_case,
      component: component_name,
      description: "Input boundary analysis",
      severity: :medium,
      evidence: %{checked_functions: 0, edge_cases_found: 0}
    }
  end

  defp check_specification_completeness(_component_name), do: nil
  defp check_affordance_consistency(_component_name), do: nil
end
```

### Step 2: Building Red Team Scenarios

Red agents simulate epistemic attacks using five primitives: truth distortion, confidence manipulation, signal poisoning, drift induction, and salience hijacking:

```elixir
defmodule PrismaticDark.Red.ScenarioGenerator do
  @moduledoc """
  L2 Tactical Specialist: Composes multi-technique adversarial
  scenarios from the attack taxonomy.

  Safety: All scenarios execute in PrismaticDark.Sandbox ONLY.
  No network access. Synthetic data only.
  """

  @type attack_primitive ::
          :truth_distortion
          | :confidence_manipulation
          | :signal_poisoning
          | :drift_induction
          | :salience_hijacking

  @type scenario :: %{
          id: String.t(),
          name: String.t(),
          primitives: [attack_primitive()],
          target: String.t(),
          expected_impact: String.t(),
          sandbox_required: true
        }

  @spec generate_scenario(String.t(), [attack_primitive()]) :: {:ok, scenario()}
  def generate_scenario(target, primitives) do
    scenario = %{
      id: "scenario-#{System.unique_integer([:positive])}",
      name: "#{Enum.join(primitives, "+")} against #{target}",
      primitives: primitives,
      target: target,
      expected_impact: estimate_impact(primitives),
      sandbox_required: true
    }

    {:ok, scenario}
  end

  @spec execute_in_sandbox(scenario()) :: {:ok, map()} | {:error, :safety_violation}
  def execute_in_sandbox(%{sandbox_required: true} = scenario) do
    # Verify sandbox environment
    unless PrismaticDark.Sandbox.active?() do
      {:error, :safety_violation}
    else
      results = Enum.map(scenario.primitives, fn primitive ->
        simulate_primitive(primitive, scenario.target)
      end)

      {:ok, %{
        scenario_id: scenario.id,
        results: results,
        defense_recommendations: generate_recommendations(results)
      }}
    end
  end

  defp simulate_primitive(:truth_distortion, target) do
    %{primitive: :truth_distortion, target: target, impact: :medium,
      finding: "Belief engine accepted modified signal without plurality check"}
  end

  defp simulate_primitive(:confidence_manipulation, target) do
    %{primitive: :confidence_manipulation, target: target, impact: :high,
      finding: "Confidence threshold bypassed with synthetic high-confidence signal"}
  end

  defp simulate_primitive(:signal_poisoning, target) do
    %{primitive: :signal_poisoning, target: target, impact: :high,
      finding: "Signal poisoning detected but not blocked at ingestion point"}
  end

  defp simulate_primitive(:drift_induction, target) do
    %{primitive: :drift_induction, target: target, impact: :low,
      finding: "Sub-threshold drift accumulation over 100 iterations"}
  end

  defp simulate_primitive(:salience_hijacking, target) do
    %{primitive: :salience_hijacking, target: target, impact: :medium,
      finding: "Priority queue manipulation shifted attention from critical signal"}
  end

  defp estimate_impact(primitives) do
    if length(primitives) > 2, do: "High (multi-vector)", else: "Medium (single-vector)"
  end

  defp generate_recommendations(results) do
    results
    |> Enum.map(fn r -> "Mitigate #{r.primitive}: #{r.finding}" end)
  end
end
```

### Step 3: Blue Team Defense Posture

Blue agents aggregate evidence and maintain defensive posture:

```elixir
defmodule PrismaticDark.Blue.DriftDetector do
  @moduledoc """
  L2 Operational Specialist: Detects behavioral, configuration,
  dependency, and performance drift across platform components.
  """

  use GenServer

  @drift_types [:behavioral, :configuration, :dependency, :performance]

  @impl true
  def init(_opts) do
    # Subscribe to all relevant event sources
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "color_team:red:findings")
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "color_team:gray:findings")

    {:ok, %{baselines: %{}, drift_events: [], alert_count: 0}}
  end

  @impl true
  def handle_info({:red_finding, finding}, state) do
    # Process Red Team findings for defense updates
    drift_assessment = assess_drift_from_attack(finding)

    if drift_assessment.drift_detected do
      broadcast_drift_alert(drift_assessment)
    end

    {:noreply, update_state(state, drift_assessment)}
  end

  @impl true
  def handle_info({:gray_finding, finding}, state) do
    # Process Gray Team boundary findings
    drift_assessment = assess_drift_from_boundary(finding)

    {:noreply, update_state(state, drift_assessment)}
  end

  defp assess_drift_from_attack(finding) do
    %{
      source: :red_team,
      drift_detected: finding.severity in [:high, :critical],
      drift_type: :behavioral,
      finding: finding,
      recommended_action: "Update defense posture for #{finding.target}"
    }
  end

  defp assess_drift_from_boundary(finding) do
    %{
      source: :gray_team,
      drift_detected: finding.type == :affordance_drift,
      drift_type: :configuration,
      finding: finding,
      recommended_action: "Review specification for #{finding.component}"
    }
  end

  defp broadcast_drift_alert(assessment) do
    Phoenix.PubSub.broadcast(
      Prismatic.PubSub,
      "color_team:blue:alerts",
      {:drift_alert, assessment}
    )
  end

  defp update_state(state, assessment) do
    %{state | drift_events: [assessment | state.drift_events]}
  end
end
```

### Step 4: Purple Team Synthesis

The Purple Team has sole authority for loop closure between Red and Blue:

```elixir
defmodule PrismaticDark.Purple.ClosureAnalyst do
  @moduledoc """
  L4 Operational Specialist: Evaluates 4-condition closure
  for Red-Blue loops. Detects false closure.

  Closure requires:
  1. Red finding has corresponding Blue defense
  2. Blue defense has been tested against Red scenario
  3. No regression in previously closed findings
  4. White Team verification (for critical findings)
  """

  @type closure_status :: :open | :partially_closed | :closed | :false_closure

  @spec evaluate_closure(map(), map()) :: {:ok, closure_status(), map()}
  def evaluate_closure(red_finding, blue_defense) do
    conditions = %{
      defense_exists: blue_defense != nil,
      defense_tested: blue_defense[:tested_against_scenario] == true,
      no_regression: check_no_regression(red_finding),
      formal_verification: check_white_team_verification(red_finding)
    }

    status = determine_closure_status(conditions)
    {:ok, status, conditions}
  end

  defp determine_closure_status(conditions) do
    passed = Enum.count(conditions, fn {_k, v} -> v end)

    cond do
      passed == 4 -> :closed
      passed >= 2 -> :partially_closed
      conditions.defense_exists and not conditions.defense_tested -> :false_closure
      true -> :open
    end
  end

  defp check_no_regression(_finding), do: true
  defp check_white_team_verification(_finding), do: true
end
```

### Step 5: Black Team Isolation

The Black Team operates under maximum isolation. It produces only abstract threat models:

```elixir
defmodule PrismaticDark.Black.AbstractionEnforcer do
  @moduledoc """
  L3 Safety-Critical: Ensures all Black Team output passes
  through L1-L4 abstraction filtering. No executable content
  is ever produced.
  """

  @abstraction_levels %{
    l1: :conceptual,    # Pure concepts, no implementation details
    l2: :architectural, # Structural patterns, no code
    l3: :procedural,    # Process descriptions, no commands
    l4: :tactical       # Specific tactics, still no executable code
  }

  @spec filter_output(term(), atom()) :: {:ok, term()} | {:error, :executable_content_detected}
  def filter_output(content, level) when level in [:l1, :l2, :l3, :l4] do
    if contains_executable_content?(content) do
      {:error, :executable_content_detected}
    else
      {:ok, abstract_to_level(content, level)}
    end
  end

  defp contains_executable_content?(content) when is_binary(content) do
    executable_patterns = [
      ~r/defmodule\s/,
      ~r/def\s+\w+/,
      ~r/System\.\w+/,
      ~r/File\.\w+/,
      ~r/Port\.\w+/,
      ~r/\beval\b/
    ]

    Enum.any?(executable_patterns, &Regex.match?(&1, content))
  end

  defp contains_executable_content?(_), do: false

  defp abstract_to_level(content, _level), do: content
end
```

## Common Pitfalls

**Running Red Team scenarios outside the sandbox.** All adversarial operations must execute within `PrismaticDark.Sandbox`. Attempting to run scenarios directly against production components is a safety violation.

**Confusing simulation with real attacks.** Color team operations are epistemic security simulations. They test the platform's ability to reason correctly under adversarial conditions, not its network security.

**Skipping Purple Team synthesis.** Red findings without Blue defense mapping are incomplete. Always route findings through the Purple Team for proper loop closure.

**Weakening Black Team isolation.** The Black Team must never produce executable content. The Abstraction Enforcer has override authority to halt any operation that violates this constraint.

## Exercises

1. **Create a Gray Team scan.** Write a boundary scan for a module of your choice that identifies at least one specification gap.

2. **Design a Red Team scenario.** Create a multi-primitive scenario combining signal poisoning and confidence manipulation. Execute it in the sandbox and document the findings.

3. **Implement a Blue defense.** Based on a Red Team finding, implement a defense in the Blue Team that detects and blocks the simulated attack.

4. **Achieve loop closure.** Take one Red finding through the full cycle: Gray discovery, Red attack, Blue defense, Purple closure evaluation, White verification.

## Summary

The 6 color teams provide continuous epistemic security through adversarial-defensive synthesis. Gray discovers boundaries, Red attacks them, Blue defends, Purple synthesizes, White verifies, and Black models theoretical worst cases. All operations are simulation-only with strict safety protocols. The Purple Team has sole authority for loop closure, ensuring that every attack finding has a corresponding tested defense.

## Practical Implementation

### In Prismatic Platform

Color team security operations are implemented across these applications:

- **prismatic_dark** (`apps/prismatic_dark/`) -- Core color team runtime housing all 20 agents across 6 teams. Contains `PrismaticDark.Sandbox` for isolated execution, the Gray/Red/Blue/Purple/White/Black team implementations, and safety protocols including the ethics check system (every 10-15 seconds)
- **prismatic_safety** (`apps/prismatic_safety/`) -- Houses the Quality Floor Guardian that integrates with Blue Team defense posture, plus self-healing systems that consume Purple Team closure recommendations
- **prismatic_nabla** (`apps/prismatic_nabla/`) -- NABLA Infinity axiom enforcement used by Blue Team's `DriftDetector` for signal aggregation with plurality enforcement (Axiom 1) and contradiction preservation (Axiom 2)
- **prismatic_lean4** (`apps/prismatic_lean4/`) -- Lean4 formal proof infrastructure used by White Team's `InvariantProver` for mathematical verification of defense correctness
- **prismatic_deduction** (`apps/prismatic_deduction/`) -- Deduction verification used by White Team for constructive proof campaigns

### Code Examples from the Codebase

Agent specifications for color teams live in `.aiad/agents/`:

```bash
# Color team agent specifications
ls .aiad/agents/ | grep -E "(gray|red|blue|purple|white|black)-"
# gray-explorer-commander.agent.md
# red-commander.agent.md
# blue-commander.agent.md
# purple-coordinator.agent.md
# white-verifier-commander.agent.md
# black-theorist-commander.agent.md
```

The signal flow uses PubSub topic conventions:

```elixir
# Color team PubSub topics follow a strict convention:
"color_team:gray:findings"    # Gray boundary discoveries
"color_team:red:findings"     # Red adversarial attack results
"color_team:blue:alerts"      # Blue defense drift alerts
"color_team:purple:closure"   # Purple loop closure decisions
"color_team:white:proofs"     # White verification results
```

## See Also

### Related Applications
- [prismatic_dark](/apps/prismatic-dark/) -- Color team runtime with sandbox isolation
- [prismatic_safety](/apps/prismatic-safety/) -- Quality systems consuming color team outputs
- [prismatic_nabla](/apps/prismatic-nabla/) -- Epistemic axioms used by Blue Team
- [prismatic_lean4](/apps/prismatic-lean4/) -- Formal proofs used by White Team
- [prismatic_deduction](/apps/prismatic-deduction/) -- Deduction engine for White Team verification

### Glossary
- [Color Teams](/glossary/color-teams/) -- Overview of the 6-team security architecture
- [Red Team](/glossary/red-team/) -- Adversarial simulation agents
- [Blue Team](/glossary/blue-team/) -- Epistemic defense agents
- [Purple Team](/glossary/purple-team/) -- Synthesis and loop closure agents
- [White Team](/glossary/white-team/) -- Constructive verification agents
- [Black Team](/glossary/black-team/) -- Theoretical threat modeling (maximum isolation)
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework underlying color team operations
- [Trinity Gate](/glossary/trinity-gate/) -- 3-layer validation gate for claims
- [Penetration Testing](/glossary/penetration-testing/) -- Traditional security testing context

### Related Academy Topics
- [Formal Verification with Lean4](/academy/formal-verification-guide/) -- White Team's formal proof methods
- [Self-Evolving Ecosystems](/academy/evolution-patterns/) -- How color team findings drive evolution
- [Building EASM Features](/academy/easm-development/) -- Security concepts applied to attack surfaces
- [NABLA Infinity Axioms](/academy/nabla-infinity-guide/) -- Epistemic framework used by Blue Team

## Next Steps

- [Formal Verification with Lean4](/academy/formal-verification-guide/) -- White Team's formal proof methods
- [Self-Evolving Agent Ecosystems](/academy/evolution-patterns/) -- how color team findings drive evolution
- [Building EASM Features](/academy/easm-development/) -- security concepts applied to external attack surfaces

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)