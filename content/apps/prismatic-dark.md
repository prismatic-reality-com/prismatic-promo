+++
title = "Prismatic Dark"
weight = 11
[extra]
icon = "moon"
color = "gray"
description = "Color team security simulation framework with sandboxed adversarial testing"
category = "Security"
files = "520"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1196
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Dark", "Color", "apps", "Security", "Prismatic Platform", "PrismaticDark", "Sandbox", "Blue"]
tags = ["apps", "security", "prismatic-dark", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Dark - Prismatic Platform"
+++

## Abstract

Prismatic Dark is the platform's security simulation framework, providing sandboxed environments for six color team operations with 20 specialized agents across adversarial simulation, defensive assessment, synthesis and closure, boundary exploration, constructive verification, and theoretical threat modeling. The framework enforces absolute isolation: no network access, no real data, no production state modification. Every operation executes within a `PrismaticDark.Sandbox` that validates isolation constraints before permitting execution. The [Red Team](@/glossary/red-team.md) operates with five epistemic attack primitives (truth distortion, confidence manipulation, signal poisoning, drift induction, salience hijacking) against synthetic datasets. The [Blue Team](@/glossary/blue-team.md) assesses defensive posture through evidence synthesis grounded in [NABLA axioms](@/capabilities/nabla-axioms.md). The [Purple Team](@/glossary/purple-team.md) manages Red-Blue loop closure with sole authority for closure state transitions. The [White Team](@/glossary/white-team.md) provides constructive verification through progressive formal proofs. The [Gray Team](@/glossary/gray-team.md) explores specification boundaries. The [Black Team](@/glossary/black-team.md) -- operating under maximum isolation -- produces abstract threat models that never include executable content.

## 1. Introduction

### 1.1 Problem Statement

Security assessment requires understanding both attack vectors and defensive capabilities. Traditional [penetration testing](@/glossary/penetration-testing.md) focuses on specific vulnerabilities but misses epistemic [attack surface](@/glossary/attack-surface.md)s: how can an adversary manipulate the confidence, accuracy, or completeness of intelligence data? Without a structured framework for adversarial simulation and defensive assessment, security posture evaluation remains incomplete.

Prismatic Dark provides this framework through six specialized teams that collaboratively explore, attack, defend, and verify the platform's security posture -- all within strictly isolated sandboxes using synthetic data.

### 1.2 Design Goals

1. **Absolute sandbox isolation** -- zero network access, zero real data, zero production state for all operations.
2. **Six-team collaboration** -- Gray (exploration), Red (adversarial), Blue (defensive), Purple (synthesis), White (verification), Black (threat modeling) with defined signal flows.
3. **Epistemic attack primitives** -- five formally defined attack types for systematic adversarial simulation.
4. **Safety protocols** -- automated ethics checks every 10-15 seconds, escalation guards, and audit logging.
5. **No executable output** -- Black Team produces abstract threat models only, never exploit code.
6. **NABLA integration** -- all assessments carry provenance and confidence per epistemic axioms.

### 1.3 Scope

Prismatic Dark provides the simulation framework and safety infrastructure. Individual team agent logic resides in [Prismatic Agents](@/apps/prismatic-agents.md). The framework is authorized for CTF challenges, defensive security research, and authorized penetration testing only.

## 2. Architecture

### 2.1 System Design

```
Signal Flow:
Gray (boundary seeds) --> Red (adversarial attacks) --> Purple (synthesis)
                                ^                           |
                                |                           v
                           Black (threat models)        Blue (defense)
                                                            |
                                                            v
                                                     White (proofs)
                                                            |
                                                            v
                                                     Platform Defense

All operations within:
+-----------------------------------------------+
| PrismaticDark.Sandbox                          |
| - NetworkGuard (zero connectivity)             |
| - DataGuard (synthetic data only)              |
| - TimeGuard (max duration enforcement)         |
| - EthicsChecker (periodic validation)          |
+-----------------------------------------------+
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticDark.Sandbox` | Isolation enforcement: network, data, time, and ethics guards |
| `PrismaticDark.Sandbox.NetworkGuard` | Zero network connectivity enforcement |
| `PrismaticDark.Sandbox.DataGuard` | Synthetic data only enforcement, PII detection |
| `PrismaticDark.Sandbox.TimeGuard` | Maximum operation duration enforcement |
| `PrismaticDark.RedTeam` | Adversarial simulation with five epistemic attack primitives |
| `PrismaticDark.RedTeam.Primitives` | Attack primitive definitions and execution |
| `PrismaticDark.RedTeam.ScenarioEngine` | 329-entry attack taxonomy and scenario composition |
| `PrismaticDark.BlueTeam` | Defensive posture assessment through evidence synthesis |
| `PrismaticDark.BlueTeam.SignalAggregator` | Cross-domain signal correlation |
| `PrismaticDark.BlueTeam.DriftDetector` | Behavioral drift detection |
| `PrismaticDark.PurpleTeam` | Red-Blue loop closure management |
| `PrismaticDark.PurpleTeam.LoopClosure` | Four-condition closure evaluation |
| `PrismaticDark.WhiteTeam` | Constructive verification with formal proofs |
| `PrismaticDark.GrayTeam` | Boundary exploration and specification gap discovery |
| `PrismaticDark.BlackTeam` | Abstract threat modeling under maximum isolation |
| `PrismaticDark.BlackTeam.AbstractionFilter` | L1-L4 output abstraction enforcement |

### 2.3 Process Topology

```
PrismaticDark.Application (Supervisor, :one_for_one)
+-- PrismaticDark.Sandbox (GenServer)
|     Isolation state management and constraint enforcement
+-- PrismaticDark.EthicsChecker (GenServer)
|     Periodic ethics validation (every 10-15 seconds)
+-- PrismaticDark.AuditLogger (GenServer)
|     Immutable audit trail for all operations
+-- Task.Supervisor
      Supervised team operation execution
```

### 2.4 Data Flow

Operations begin with sandbox allocation. The Sandbox validates isolation constraints before permitting execution. Team agents execute within the sandbox, producing findings, assessments, or models. All output passes through the appropriate safety filter (EthicsChecker for all teams, AbstractionFilter for Black Team). Findings flow through the signal pipeline: Gray seeds to Red attacks, Red findings to Purple synthesis, Purple synthesis to Blue defense, White verification of conclusions. The audit logger records every operation.

## 3. Implementation

### 3.1 Key Algorithms

**Epistemic Attack Simulation**. The Red Team's five attack primitives operate on synthetic knowledge states. Each primitive defines a transformation function that modifies the target state according to the attack type. Truth distortion alters data accuracy; confidence manipulation shifts belief scores; signal poisoning injects false data; drift induction creates sub-threshold changes; salience hijacking redirects attention.

**Loop Closure**. Purple Team evaluates four conditions for closure: (1) all Red findings have corresponding Blue defenses, (2) defense effectiveness is verified, (3) no regression from previous closure state, (4) residual risk is documented. All four conditions must pass for closure.

### 3.2 Data Structures

```elixir
defmodule PrismaticDark.Sandbox do
  @type config :: %{
    team: :red | :blue | :purple | :white | :gray | :black,
    network_access: false,
    real_data: false,
    max_duration: pos_integer(),
    synthetic_dataset: atom(),
    ethics_check_interval: pos_integer()
  }

  def execute(config, operation) do
    ensure_isolated!(config)
    result = run_in_sandbox(config, operation)
    audit_log(config, result)
    {:ok, result}
  end
end
```

### 3.3 API Surface

```elixir
# Execute Red Team scenario
@spec execute_red(String.t(), keyword()) :: {:ok, RedResult.t()}
PrismaticDark.Sandbox.execute(
  team: :red,
  scenario: "epistemic_truth_distortion",
  agent: "red-epistemic-attacker",
  config: %{max_duration: :timer.minutes(5)})

# Assess Blue Team posture
@spec assess_posture(keyword()) :: {:ok, PostureAssessment.t()}
PrismaticDark.BlueTeam.assess_posture(
  target: :platform_epistemic_state,
  signals: [:behavioral, :configuration, :dependency, :performance])

# Purple Team synthesis
@spec synthesize(keyword()) :: {:ok, Synthesis.t()}
PrismaticDark.PurpleTeam.synthesize(
  red_findings: red_results.findings,
  blue_posture: posture)
```

### 3.4 Configuration

```elixir
config :prismatic_dark,
  sandbox_mode: :strict,
  ethics_check_interval: :timer.seconds(12),
  max_operation_duration: :timer.minutes(10),
  synthetic_datasets: [:default, :financial, :infrastructure],
  audit_retention_days: 365,
  black_team_isolation: :maximum
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Agents](@/apps/prismatic-agents.md) | 20 color team agent definitions |
| [Prismatic Safety](@/apps/prismatic-safety.md) | Ethics check enforcement |
| [Prismatic Telemetry](@/apps/prismatic-telemetry.md) | Operation audit logging |
| [Prismatic Nabla](@/apps/prismatic-nabla.md) | Epistemic axiom compliance |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic Detection Engine](@/apps/prismatic-detection-engine.md) | Attack pattern feed |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Defensive posture integration |

### 4.3 Inter-Process Communication

Team operations execute as supervised tasks within the sandbox. Signal flow between teams uses in-memory data passing (no [PubSub](@/glossary/pubsub.md) for isolation). Audit events are logged synchronously.

### 4.4 External Integrations

None. All operations are sandboxed with zero external connectivity.

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Sandbox allocation | < 10ms | Configuration validation |
| Red Team scenario (simple) | 1-5s | Single primitive |
| Red Team scenario (complex) | 10-60s | Multi-technique composition |
| Blue Team posture assessment | 5-30s | Multi-signal correlation |
| Purple Team synthesis | 2-10s | Red-Blue mapping |
| Ethics check | < 1ms | Periodic validation |

### 5.2 Scalability

Team operations are independent and can execute in parallel (except where signal flow creates dependencies). The sandbox enforces resource limits per operation.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 256 MB | 1 GB (with synthetic datasets) |
| CPU | 2 cores | 4 cores |

## 6. Testing Strategy

### 6.1 Unit Tests

Sandbox tests verify isolation enforcement (network blocking, data guard, time limits). Attack primitive tests verify correct state transformations. Loop closure tests verify four-condition evaluation.

### 6.2 Integration Tests

Full team exercise tests run multi-team scenarios from Gray exploration through Purple closure, verifying the complete signal flow and safety [protocol](@/glossary/protocol.md) enforcement.

### 6.3 Property-Based Testing

StreamData generators produce random attack configurations to verify that the sandbox never permits isolation violations and that all output passes safety filters.

## 7. Security Considerations

### 7.1 Threat Model

The primary threat is sandbox escape -- operations accessing real data or network resources. Mitigations include multiple isolation layers (NetworkGuard, DataGuard, TimeGuard), periodic ethics checks, and immutable audit logging.

### 7.2 Access Control

Color team operations require explicit authorization. L5 (Supreme) agent authority required for Red and Black team activation. All operations logged to immutable [audit trail](@/glossary/audit-trail.md).

## 8. Operational Considerations

### 8.1 Deployment

Deploys as part of the umbrella [release](@/glossary/release.md). Synthetic datasets are bundled. No external services required.

### 8.2 Monitoring

Telemetry events: `[:prismatic, :dark, :sandbox_allocated]`, `[:prismatic, :dark, :operation_complete]`, `[:prismatic, :dark, :ethics_violation]`, `[:prismatic, :dark, :isolation_breach_attempt]`.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Sandbox creation failed | Invalid configuration | Verify team and dataset parameters |
| Ethics check violation | Operation exceeded bounds | Review operation scope; tighten constraints |
| Black Team output rejected | Executable content detected | Review AbstractionFilter rules |
| Operation timeout | Exceeded max_duration | Increase timeout or simplify scenario |

## 9. Future Work

Planned enhancements include automated Red-Blue exercise scheduling, historical attack effectiveness tracking, integration with external CTF platforms, and machine learning-based attack scenario generation.

## References

- [Prismatic Agents](@/apps/prismatic-agents.md) -- Color team agent definitions
- [Prismatic Safety](@/apps/prismatic-safety.md) -- Ethics enforcement
- [Prismatic Nabla](@/apps/prismatic-nabla.md) -- Epistemic axiom framework
- [MITRE ATT&CK](https://attack.mitre.org/) -- Attack technique taxonomy reference

## Related Agents

- [GitLab Security Specialist Agent](@/agents/gitlab-security-specialist-agent.md) -- Reviews sandbox isolation enforcement and safety protocol implementation for security assurance
- [Evolution Orchestrator Supreme](@/agents/evolution-orchestrator-supreme.md) -- Drives evolution of color team capabilities through autonomous scenario generation and effectiveness analysis
- [Alert Management Specialist](@/agents/alert-management-specialist.md) -- Configures alerting for sandbox isolation breach attempts, ethics violations, and operational anomalies

## Related Capabilities

- [Color Teams](@/capabilities/color-teams.md) -- The six-team adversarial-defensive framework that Prismatic Dark implements with 20 specialized agents
- [Quality Gates](@/capabilities/quality-gates.md) -- Enforces sandbox isolation verification, ethics check compliance, and audit logging completeness for all operations
- [Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md) -- Enables automatic recovery from sandbox failures and ethics check violations through circuit breaker patterns

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)