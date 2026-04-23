+++
title = "Prismatic Evil"
weight = 42
[extra]
category = "Security"
files = 30
description = "Adversarial red-team simulation and malicious pattern analysis"
status = "Active"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1071
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Evil", "Adversarial", "apps", "Security", "Prismatic Platform", "PrismaticEvil", "MITRE ATT"]
tags = ["apps", "security", "prismatic-evil", "prismatic"]
quality_score = 77
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Evil - Prismatic Platform"
+++

## Overview

Prismatic Evil implements adversarial red-team simulation capabilities within the Prismatic Platform, modeling malicious actor behaviors and attack patterns in a strictly sandboxed environment to identify system vulnerabilities before they can be exploited. The application operates under the platform's [Color Teams](/capabilities/color-teams/) security architecture, serving as the computational engine for Red Team scenario execution with comprehensive [audit trail](/glossary/audit-trail/) logging and evidence-based [threat intelligence](/glossary/threat-intelligence/) assessment.

All adversarial simulations execute within the Prismatic Dark sandbox, ensuring complete [process isolation](/glossary/process-isolation/) from production systems. The [OTP](/glossary/otp/) [supervision tree](/glossary/supervision-tree/) enforces strict resource boundaries, preventing any simulation from accessing network resources, production databases, or real user data. Every attack scenario produces structured findings that feed into the Purple Team synthesis loop, where adversarial discoveries are matched against Blue Team defensive capabilities to identify coverage gaps.

Prismatic Evil implements the five epistemic attack primitives defined by the platform's security taxonomy: truth distortion, confidence manipulation, signal poisoning, drift induction, and salience hijacking. Each primitive is modeled as a composable [behaviour](/glossary/behaviour/) that scenario generators combine into multi-step attack chains, enabling simulation of sophisticated adversary tactics while maintaining full auditability through the [NABLA epistemic framework](/glossary/nabla-infinity/). The platform's commitment to proactive security testing through Evil reflects a core design philosophy: defenses untested against realistic adversaries are defenses assumed -- and assumptions are the antithesis of evidence-based security.

## Architecture

```
Scenario Generator --> Attack Composer --> Sandbox Executor --> Finding Collector
       |                     |                    |                    |
  Taxonomy (329)        Primitive Chain       Dark Sandbox        Evidence Store
  Complexity Config     Multi-Step Plan      Process Isolation    MITRE Mapping
       |                     |                    |                    |
       +---------------------+--------------------+--------------------+
                                     |
                              Audit Logger --> Immutable Trail
                                     |
                              Purple Team --> Red-Blue Loop Closure
```

All simulation logic follows [pure function](/glossary/pure-function/) principles. Attack primitives are deterministic transformations that produce structured output artifacts without modifying any external state. Side effects (sandbox provisioning, audit emission) occur only at the supervision boundary.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticEvil` | Public facade: `run_scenario/2`, `generate_scenarios/1`, `list_primitives/1` |
| `PrismaticEvil.Application` | OTP application entry point with sandbox-aware supervision |
| `PrismaticEvil.ScenarioGenerator` | Generates attack scenarios from taxonomy and vulnerability data |
| `PrismaticEvil.AttackComposer` | Composes multi-step attack chains from atomic primitives |
| `PrismaticEvil.SandboxExecutor` | Isolated execution environment with resource limits |
| `PrismaticEvil.FindingCollector` | Structured finding collection with MITRE ATT&CK mapping |
| `PrismaticEvil.AuditLogger` | Immutable audit trail for all simulation activities |
| `PrismaticEvil.Primitives.TruthDistortion` | Epistemic attack primitive: truth distortion simulation |
| `PrismaticEvil.Primitives.ConfidenceManipulation` | Epistemic attack primitive: confidence manipulation |
| `PrismaticEvil.Primitives.SignalPoisoning` | Epistemic attack primitive: signal poisoning simulation |

## Key Features

### Attack Pattern Library
- Comprehensive catalog of 329 adversarial patterns including social engineering vectors, privilege escalation chains, and data exfiltration simulations
- MITRE ATT&CK framework mapping for every pattern, enabling standardized classification and reporting
- Pattern versioning with effectiveness tracking across simulation iterations
- Pattern composition rules defining valid combinations and prerequisite chains for multi-step scenarios

### Epistemic Attack Primitives

The five epistemic attack primitives form the atomic building blocks from which complex adversarial scenarios are composed. Each primitive operates on a well-defined input-output contract, enabling deterministic composition and reproducible simulation results. Unlike traditional penetration testing tools that focus on technical exploits, epistemic primitives target the intelligence pipeline itself -- testing whether the platform's analytical reasoning can be subverted through information manipulation.

| Primitive | Description | ATT&CK Mapping |
|-----------|-------------|----------------|
| Truth Distortion | Manipulates factual claims in intelligence data | T1565 (Data Manipulation) |
| Confidence Manipulation | Artificially inflates or deflates confidence scores | T1491 (Defacement) |
| Signal Poisoning | Introduces false signals into detection pipelines | T1195 (Supply Chain Compromise) |
| Drift Induction | Gradually shifts behavioral baselines below detection thresholds | T1078 (Valid Accounts) |
| Salience Hijacking | Redirects analyst attention to irrelevant findings | T1036 (Masquerading) |

```elixir
defmodule PrismaticEvil.Primitives.DriftInduction do
  @behaviour PrismaticEvil.Primitive

  @impl true
  def execute(%{target: target, drift_rate: rate, duration: duration}) do
    steps = generate_drift_steps(target, rate, duration)

    results = Enum.map(steps, fn step ->
      %{
        timestamp: step.time,
        baseline_shift: step.delta,
        detection_probability: compute_detection_probability(step),
        cumulative_drift: step.cumulative
      }
    end)

    {:ok, %{
      primitive: :drift_induction,
      steps: results,
      final_drift: List.last(results).cumulative_drift,
      detected: Enum.any?(results, & &1.detection_probability > 0.95)
    }}
  end
end
```

### Red-Team Scenario Execution
- Multi-step attack scenario composition from atomic primitives with configurable complexity and persistence levels
- Temporal attack modeling simulating slow-and-low adversary tactics that evade threshold-based detection
- Automated scenario generation from [vulnerability assessment](/glossary/vulnerability-assessment/) findings and [OSINT](/glossary/osint/) intelligence
- Campaign simulation spanning days or weeks of simulated attacker activity compressed into minutes of execution

### Scenario Generation from Vulnerability Data

The scenario generator analyzes vulnerability reports and OSINT intelligence to automatically compose realistic attack chains. Each generated scenario maps to specific MITRE ATT&CK techniques and includes expected detection probability estimates:

```elixir
defmodule PrismaticEvil.ScenarioGenerator do
  @spec generate(VulnerabilityReport.t(), keyword()) :: {:ok, list(Scenario.t())} | {:error, term()}
  def generate(vuln_report, opts \\ []) do
    complexity = Keyword.get(opts, :complexity, :moderate)
    max_scenarios = Keyword.get(opts, :max, 50)

    attack_surface = map_attack_surface(vuln_report)
    candidate_chains = enumerate_primitive_chains(attack_surface, complexity)

    scenarios = candidate_chains
    |> Enum.map(&compose_scenario/1)
    |> Enum.sort_by(& &1.estimated_impact, :desc)
    |> Enum.take(max_scenarios)

    {:ok, scenarios}
  end
end
```

### Vulnerability Discovery
- Automated mapping of discovered weaknesses to standardized vulnerability taxonomies
- [Confidence scoring](/glossary/confidence-scoring/) on findings with [Trinity Gate](/glossary/trinity-gate/) validation before reporting
- False positive reduction through multi-primitive confirmation and [property-based testing](/glossary/property-based-testing/)
- Weakness chain analysis identifying how individual low-severity vulnerabilities combine into critical attack paths

### Sandbox Enforcement
- Strict [process isolation](/glossary/process-isolation/) ensuring all adversarial simulations operate within controlled boundaries
- Resource consumption limits with [circuit breaker](/glossary/circuit-breaker/) patterns preventing runaway simulations
- Zero network access policy enforced at the [BEAM](/glossary/beam/) runtime level
- Immutable sandbox state snapshots enabling post-execution forensic analysis of simulation artifacts

### Safety Controls

The safety architecture ensures that adversarial simulation capabilities cannot be misused or accidentally escape sandbox boundaries:

| Control | Enforcement | Implementation |
|---------|-------------|----------------|
| Network isolation | Absolute | BEAM port driver restrictions block all socket creation |
| Memory cap | Per-process | OTP supervisor kills processes exceeding 512 MB |
| CPU time limit | Per-scenario | Timer-based watchdog terminates after configured maximum |
| Disk write prevention | Absolute | Read-only filesystem mount for sandbox processes |
| Ethics check | Periodic | Automated validation every 15 seconds during simulation |

## Usage

```elixir
# Execute a red-team scenario
{:ok, result} = PrismaticEvil.run_scenario(:privilege_escalation,
  target: :auth_boundary,
  complexity: :advanced,
  persistence: :multi_step
)
# => %{findings: [...], mitre_mapping: ["T1548", "T1068"], confidence: 0.91}

# Generate scenarios from vulnerability data
{:ok, scenarios} = PrismaticEvil.generate_scenarios(vulnerability_report)

# List available attack primitives
{:ok, primitives} = PrismaticEvil.list_primitives(category: :epistemic)

# Execute epistemic attack simulation
{:ok, result} = PrismaticEvil.run_scenario(:signal_poisoning,
  target: :detection_pipeline,
  poisoning_rate: 0.05,
  duration: :hours_24
)

# Get audit trail for completed simulation
{:ok, trail} = PrismaticEvil.audit_trail(scenario_id)

# Run full campaign simulation across multiple attack vectors
{:ok, campaign} = PrismaticEvil.run_campaign(
  vectors: [:epistemic, :privilege_escalation, :data_exfiltration],
  duration: :simulated_weeks_2,
  adversary_profile: :apt_group
)
# => %{total_findings: 23, critical: 3, detection_rate: 0.78}
```

## NABLA Compliance

| NABLA Axiom | Evil Enforcement | Implementation |
|-------------|-----------------|----------------|
| Provenance Mandatory | Every finding includes scenario ID, primitive chain, and execution trace | Immutable audit trail on all simulation activities |
| Signal Plurality | Findings require multi-primitive confirmation | Cross-primitive validation before high-confidence classification |
| Source Independence | Each primitive operates independently | Stateless primitives with deterministic outputs |
| Contradiction Preservation | Conflicting detection results preserved | Both detected and undetected attack paths maintained |
| Unknown Valid | Uncertain findings explicitly marked | Confidence scores on all vulnerability assessments |

## Testing

Scenario tests verify that each attack primitive produces deterministic outputs given identical inputs. Sandbox tests verify resource isolation, network access prevention, and process boundary enforcement. Finding tests verify MITRE ATT&CK mapping accuracy and deduplication logic.

Integration tests exercise multi-step scenarios from generation through execution to finding collection. Property-based tests generate random scenario configurations to verify that the sandbox never allows resource boundary violations. Campaign simulation tests verify temporal modeling accuracy and adversary behavior realism across extended attack timelines.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Dark](/apps/prismatic-dark/) | Adversarial testing sandbox providing isolated execution |
| [Prismatic Annihilation](/apps/prismatic-annihilation/) | Destructive testing patterns for system hardening |
| [Prismatic Auth](/apps/prismatic-auth/) | Authentication boundary testing and privilege escalation targets |
| [Prismatic Detection Engine](/apps/prismatic-detection-engine/) | Detection rule validation against simulated attacks |
| [Prismatic Safety](/apps/prismatic-safety/) | Safety guardrails constraining simulation boundaries |
| [Prismatic Compliance](/apps/prismatic-compliance/) | [Compliance framework](/glossary/compliance-framework/) validation of security posture |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Single primitive execution | < 100ms | Deterministic computation |
| Multi-step scenario (5 steps) | 1-5s | Sequential with audit logging |
| Scenario generation | 500ms-2s | Depends on vulnerability data volume |
| Finding collection | < 50ms | Including MITRE mapping |
| Audit trail query | < 100ms | PostgreSQL indexed |
| Campaign simulation (2 weeks) | 30-120s | Compressed temporal execution |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :evil, :scenario_started]`, `[:prismatic, :evil, :primitive_executed]`, `[:prismatic, :evil, :finding_collected]`.

## Related Resources

- [Red Commander](/agents/red-commander/) -- Orchestrates adversarial simulation campaigns
- [Penetration Testing Specialist](/agents/penetration-testing-specialist/) -- Specialized penetration testing methodology
- [Incident Response Specialist](/agents/incident-response-specialist/) -- Validates defensive response to simulated attacks
- [Color Teams](/capabilities/color-teams/) -- Red-Blue-Purple adversarial-defensive security synthesis
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Multi-source evidence fusion for attack pattern analysis
- [Quality Gates](/capabilities/quality-gates/) -- Simulation quality enforcement and finding validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)