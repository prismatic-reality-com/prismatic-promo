+++
title = "Red Team"
weight = 2
[extra]
color = "red"
agent_count = 4
commander = "red-commander"
role = "Adversarial Simulation"
description = "Adversarial simulation, epistemic attacks, threat modeling"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1503
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Red", "Team", "Adversarial", "teams", "Prismatic Platform", "Red Team", "Blue Team", "Tests"]
tags = ["teams", "red-team", "prismatic"]
quality_score = 90
see_also = ["agents", "capabilities", "architecture"]
image = "/images/sections/teams.png"
image_alt = "Red Team - Prismatic Platform"
+++

## Overview

The Red Team constitutes the adversarial simulation arm of the Prismatic Platform's six-team color-team security architecture. Through controlled simulation of epistemic attacks using five defined attack primitives, Red Team identifies vulnerabilities in the platform's knowledge systems, belief formation processes, and decision-making pipelines before real adversaries can exploit them. All operations are conducted within sandboxed environments using exclusively synthetic data, ensuring that adversarial capability development serves strictly defensive purposes.

The theoretical foundation of Red Team operations draws from adversarial machine learning, epistemic game theory, and red team/blue team methodologies established in military and cybersecurity domains. The Prismatic Platform extends these traditional approaches by focusing specifically on epistemic attacks — attacks that target the truthfulness, confidence, and reliability of the platform's knowledge rather than its infrastructure. This focus reflects the platform's recognition that for an intelligence and due diligence platform, the integrity of information is the primary attack surface.

Red Team maintains a comprehensive 329-entry attack scenario taxonomy organized across six categories: information manipulation, confidence attacks, source spoofing, gradual drift, attention manipulation, and multi-vector composite attacks. Each scenario is documented with formal attack trees, expected impact models, and detection signatures that feed directly into [Blue Team](/teams/blue/) defensive development and [Purple Team](/teams/purple/) synthesis operations.

## Mission and Doctrine

The Red Team mission is to systematically identify epistemic vulnerabilities through controlled adversarial simulation, providing the platform with a continuously updated understanding of its attack surface. This mission operates under strict safety constraints that prevent any transition from simulation to actual capability.

### Mission Principles

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| **Simulation Only** | All attacks are simulated with synthetic data | Sandbox isolation |
| **Defensive Purpose** | Every simulation serves defense improvement | Purple Team review |
| **Comprehensive Coverage** | All five attack primitives exercised regularly | Scenario rotation policy |
| **Measurable Impact** | Every simulation produces quantifiable vulnerability metrics | Standardized reporting |
| **Safety First** | Ethics checks every 10-15 seconds during operations | Automated enforcement |

The [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine governs Red Team operations with particular emphasis: NO MERCY demands that simulations are thorough and uncompromising in finding vulnerabilities — no attack surface is left unexplored due to convenience or comfort. NO DOUBTS requires that every vulnerability finding is evidence-based, reproducible, and documented with complete provenance.

## Team Composition

The Red Team comprises four specialized agents operating in a hierarchical command structure with clear separation of responsibilities.

| Agent | Level | Role | Primary Function | Specialization |
|-------|-------|------|------------------|----------------|
| **red-commander** | L3 | Strategic Commander | Orchestrates adversarial campaigns, prioritizes scenarios | Campaign planning, resource allocation |
| **red-epistemic-attacker** | L2 | Tactical Specialist | Truth distortion and source poisoning simulation | Primitives 1 (Truth Distortion) and 3 (Signal Poisoning) |
| **red-drift-inducer** | L2 | Tactical Specialist | Sub-threshold drift attacks, cascade propagation analysis | Primitive 4 (Drift Induction) |
| **red-scenario-generator** | L2 | Tactical Specialist | Multi-technique scenario composition from taxonomy | Primitive 5 (Salience Hijacking) and composites |

### red-commander

The Red Commander operates at L3 strategic authority, orchestrating multi-phase adversarial campaigns that combine multiple attack primitives into realistic threat scenarios. The commander maintains the 329-entry scenario taxonomy, tracks vulnerability discovery rates across campaigns, and ensures that simulation priorities align with the platform's evolving threat landscape. Communication flows from Red Commander to [Purple Team](/teams/purple/) for synthesis and to [Blue Team](/teams/blue/) for defense development.

### red-epistemic-attacker

The Epistemic Attacker specializes in the two most direct attack primitives: truth distortion (injecting false information into the platform's knowledge base) and signal poisoning (corrupting input data streams). This agent designs and executes simulations that test the platform's ability to detect and reject manipulated information, with particular focus on attacks that attempt to bypass the [NABLA Infinity](/glossary/nabla-infinity/) signal plurality requirements.

### red-drift-inducer

The Drift Inducer specializes in the most subtle and dangerous attack category: gradual, sub-threshold drift that shifts the platform's beliefs over time without triggering detection thresholds. This agent models how small, individually insignificant perturbations can accumulate into significant epistemic compromise, testing the platform's baseline comparison and drift detection capabilities maintained by [Blue Team](/teams/blue/).

### red-scenario-generator

The Scenario Generator composes multi-technique attack scenarios from the 329-entry taxonomy, creating realistic adversarial campaigns that combine multiple primitives in sequence or parallel. This agent also maintains salience hijacking capabilities — testing whether the platform can be tricked into focusing on decoy signals while actual attacks proceed undetected.

## Attack Primitives

Red Team operations are organized around five formally defined epistemic attack primitives, each targeting a different aspect of the platform's knowledge integrity.

### The Five Primitives

| # | Primitive | Target | Mechanism | NABLA Axiom Tested |
|---|-----------|--------|-----------|-------------------|
| 1 | **Truth Distortion** | Information accuracy | Inject false data that passes initial validation | Axiom 1 (Signal Plurality) |
| 2 | **Confidence Manipulation** | Certainty calibration | Inflate or deflate confidence scores artificially | Axiom 4 (Time Decay) |
| 3 | **Signal Poisoning** | Input integrity | Corrupt data streams at source or in transit | Axiom 6 (Source Independence) |
| 4 | **Drift Induction** | Belief stability | Gradual, sub-threshold shifts in platform beliefs | Axiom 2 (Contradiction Preservation) |
| 5 | **Salience Hijacking** | Attention allocation | Misdirect analytical focus to decoy targets | Axiom 3 (Absence Informative) |

### Simulation Framework

```elixir
defmodule PrismaticDark.RedTeam.SimulationEngine do
  @moduledoc """
  Sandboxed adversarial simulation engine for Red Team operations.
  All simulations use synthetic data only within isolated environments.
  """

  @type primitive :: :truth_distortion | :confidence_manipulation |
                     :signal_poisoning | :drift_induction | :salience_hijacking

  @type scenario :: %{
    id: String.t(),
    primitives: [primitive()],
    target_domain: atom(),
    synthetic_data: map(),
    success_criteria: map(),
    safety_bounds: map()
  }

  @spec execute_scenario(scenario()) :: {:ok, map()} | {:error, :safety_violation}
  def execute_scenario(%{} = scenario) do
    with :ok <- verify_sandbox_isolation(),
         :ok <- verify_synthetic_data(scenario.synthetic_data),
         :ok <- initialize_monitoring(scenario),
         {:ok, result} <- run_simulation(scenario),
         :ok <- validate_safety_bounds(result, scenario.safety_bounds) do
      report = generate_vulnerability_report(scenario, result)

      :telemetry.execute(
        [:prismatic, :red_team, :simulation, :complete],
        %{duration: result.duration_ms, vulnerabilities_found: length(report.findings)},
        %{scenario_id: scenario.id, primitives: scenario.primitives}
      )

      {:ok, report}
    end
  end

  defp verify_sandbox_isolation do
    case PrismaticDark.Sandbox.status() do
      :isolated -> :ok
      status -> {:error, {:sandbox_not_isolated, status}}
    end
  end

  defp verify_synthetic_data(data) do
    if PrismaticDark.DataClassifier.synthetic?(data),
      do: :ok,
      else: {:error, :non_synthetic_data_detected}
  end
end
```

## Scenario Taxonomy

Red Team maintains a comprehensive **329-entry attack scenario taxonomy** that catalogs known epistemic attack patterns. This taxonomy serves as both an operational playbook and a knowledge base for adversarial research.

| Category | Scenarios | Risk Level | Primary Primitives | Detection Difficulty |
|----------|-----------|------------|-------------------|---------------------|
| **Information Manipulation** | 78 | Medium-High | Truth Distortion, Signal Poisoning | Medium |
| **Confidence Attacks** | 52 | High | Confidence Manipulation | High |
| **Source Spoofing** | 61 | High | Signal Poisoning, Truth Distortion | Medium-High |
| **Gradual Drift** | 45 | Medium | Drift Induction | Very High |
| **Attention Manipulation** | 38 | Medium | Salience Hijacking | High |
| **Multi-Vector Composite** | 55 | Critical | Multiple combined | Very High |

### Scenario Lifecycle

```
Taxonomy Entry → Campaign Selection → Scenario Parameterization
        ↓                                       ↓
  Periodic Review                    Sandbox Initialization
        ↓                                       ↓
  Taxonomy Update ←── Results ←── Simulation Execution
                                                ↓
                                        Impact Analysis
                                                ↓
                                    Vulnerability Report
                                                ↓
                                Purple / Blue Team Handoff
```

## Safety Protocols

Red Team safety protocols ensure that adversarial simulation capability never transitions into actual attack capability.

### Sandbox Isolation

| Layer | Enforcement | Verification Frequency |
|-------|-------------|----------------------|
| **Network** | Zero external connectivity | Real-time |
| **Data** | Synthetic data only, no PII | Pre-simulation validation |
| **State** | Ephemeral, destroyed after each simulation | Post-simulation cleanup |
| **Logging** | Full [audit trail](/glossary/audit-trail/), immutable | Continuous |
| **Tools** | Only approved simulation tools, no offensive tooling | Pre-session inventory |

### Ethics Enforcement

Automated ethics checks execute every 10-15 seconds during active simulations:

1. **Scope boundary verification** — confirms simulation remains within approved parameters
2. **Data classification check** — verifies all data in play is classified as synthetic
3. **Impact assessment** — monitors simulation impact against safety bounds
4. **Escalation trigger evaluation** — checks if simulation results warrant immediate Blue Team notification

### Forbidden Activities

| Activity | Status | Reason | Violation Level |
|----------|--------|--------|----------------|
| Real production attacks | FORBIDDEN | Unauthorized access | L4 — Supreme Review |
| Actual data manipulation | FORBIDDEN | Data integrity | L4 — Supreme Review |
| Capability development | FORBIDDEN | Weaponization risk | L4 — Supreme Review |
| External network access | FORBIDDEN | Containment breach | L3 — Immediate halt |
| Persistent attack state | FORBIDDEN | Evidence preservation | L2 — Session cleanup |
| Unmonitored simulation | FORBIDDEN | Safety requirement | L2 — Monitoring restart |

## Technical Architecture

Red Team operations are built on the `PrismaticDark` OTP application, which provides sandboxed execution environments for all adversarial simulation activities.

### System Architecture

```
Red Commander (L3)
├── Campaign Planner
│   ├── Scenario Selector (from 329-entry taxonomy)
│   ├── Parameter Generator (synthetic data creation)
│   └── Resource Allocator
├── Simulation Engine
│   ├── Sandbox Manager
│   ├── Primitive Executors (5 types)
│   ├── Impact Analyzer
│   └── Safety Monitor (10-15s ethics checks)
└── Reporting Pipeline
    ├── Vulnerability Reporter
    ├── Purple Team Emitter
    └── Audit Logger
```

### Telemetry Events

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :red_team, :simulation, :start]` | timestamp | scenario_id, primitives |
| `[:prismatic, :red_team, :simulation, :complete]` | duration, vulnerabilities_found | scenario_id, primitives |
| `[:prismatic, :red_team, :simulation, :safety_halt]` | violation_count | scenario_id, reason |
| `[:prismatic, :red_team, :campaign, :complete]` | total_scenarios, total_findings | campaign_id |
| `[:prismatic, :red_team, :ethics, :check]` | check_duration | scenario_id, result |

## NABLA Compliance

Red Team operations both test and comply with the [NABLA Infinity](/glossary/nabla-infinity/) framework. Red simulations test the platform's adherence to NABLA axioms while the Red Team itself operates in compliance with all seven axioms.

| Axiom | Testing Role | Compliance Role |
|-------|-------------|-----------------|
| Signal Plurality | Tests if single-source attacks bypass plurality | Multiple simulation methodologies per finding |
| Contradiction Preservation | Tests if contradictions are buried under attack | Preserves contradictory findings in reports |
| Absence Informative | Tests if missing signals are noticed | Documents what was NOT vulnerable |
| Time Decay | Tests if stale beliefs resist updating | Timestamps all findings, tracks decay |
| Unknown Valid | Tests responses to novel attack patterns | Acknowledges simulation coverage gaps |
| Source Independence | Tests if correlated sources are over-trusted | Independent validation of findings |
| Provenance Mandatory | Tests if provenance chains break under attack | Complete provenance for all findings |

## Performance Metrics

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| Scenarios executed per campaign | 15-50 | Depends on campaign scope |
| Average simulation duration | 2-10 minutes | Per individual scenario |
| Vulnerability discovery rate | 3-8 per campaign | Unique vulnerabilities |
| False positive rate | < 5% | Non-reproducible findings |
| Safety halt frequency | < 1% | Ethics check triggers |
| Campaign completion time | 2-8 hours | Full campaign cycle |
| Taxonomy coverage per quarter | 40-60% | Of 329 scenarios |
| Blue Team handoff latency | < 30 minutes | From finding to defense |

## Integration Points

| Component | Direction | Content | Purpose |
|-----------|-----------|---------|---------|
| [Gray Team](/teams/gray/) | Gray → Red | Boundary exploration findings | Seeds for scenario development |
| [Blue Team](/teams/blue/) | Red → Blue | Attack scenarios, vulnerability reports | Defense development |
| [Purple Team](/teams/purple/) | Red → Purple | Findings for synthesis | Red-Blue loop closure |
| [Black Team](/teams/black/) | Black → Red (filtered) | Theoretical threat models | Scenario inspiration |
| [White Team](/teams/white/) | Red → White | Findings for formal verification | Defensive proof construction |
| Platform Telemetry | Bidirectional | Metrics and events | Monitoring and analysis |

### Signal Flow

```
Gray Team Findings ──→ Red Team ──→ Purple Team (Synthesis)
                          │
Black Team Models ────────┘    ├──→ Blue Team (Defense)
                               │
                               └──→ White Team (Verification)
```

## Outputs

| Artifact | Purpose | Frequency | Classification |
|----------|---------|-----------|----------------|
| Vulnerability Report | Detailed finding documentation | Per scenario | Internal Only |
| Attack Scenario Log | Complete simulation record | Per scenario | Internal Only |
| Defense Recommendations | Actionable improvements for Blue Team | Per campaign | Internal Only |
| Risk Assessment | Quantified impact analysis | Per campaign | Internal Only |
| Taxonomy Updates | New scenarios and pattern refinements | Monthly | Internal Only |
| Campaign Summary | Executive overview of campaign results | Per campaign | Internal Only |

## Related Resources

- [Blue Team](/teams/blue/) — Primary consumer of Red Team findings for defense development
- [Purple Team](/teams/purple/) — Synthesis hub for Red-Blue loop closure
- [Gray Team](/teams/gray/) — Boundary exploration that seeds Red Team scenarios
- [Black Team](/teams/black/) — Theoretical threat models that inspire Red simulations
- [White Team](/teams/white/) — Formal verification of defenses against Red findings
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) — Detection infrastructure tested by Red Team
- [Quality Gates](/capabilities/quality-gates/) — Quality enforcement validated against adversarial pressure

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)