+++
title = "Color Teams"
weight = 9
[extra]
icon = "eye"
color = "pink"
description = "Adversarial-defensive synthesis through six specialized security teams implementing epistemic security across Gray, Red, Blue, Purple, White, and Black domains"
category = "security"
status = "active"
reading_time = "14 min"
author = "Tomas Korcak (korczis)"
word_count = 1533
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Color", "Teams", "Adversarial-defensive", "Gray", "Blue", "Purple", "White", "Black", "capabilities", "security"]
tags = ["capabilities", "security", "color-teams", "prismatic"]
quality_score = 90
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "Color Teams - Prismatic Platform"
+++

## Overview

Color Teams implement epistemic security through adversarial-defensive synthesis. Six specialized teams -- Gray, Red, Blue, Purple, White, and Black -- work in coordination to ensure the platform's reasoning remains sound, its defenses hold under adversarial conditions, and its conclusions withstand formal verification. This is not traditional cybersecurity with firewalls and intrusion detection. This is epistemic security: protecting the integrity of the platform's belief formation, decision-making, and intelligence synthesis processes.

The Color Team architecture is modeled on military red-team/blue-team exercises but extends the concept to cover the full spectrum of epistemic operations. Gray Team explores boundary conditions. Red Team simulates adversarial attacks. Blue Team defends and monitors. Purple Team synthesizes Red and Blue findings into closed-loop improvements. White Team provides formal constructive verification. Black Team models theoretical worst-case threats in maximum isolation. Together, these six teams create a continuous adversarial-defensive cycle that hardens the platform against both known and novel threats.

The 20 agents across all six teams operate under strict AIAD specifications with tier-appropriate authority levels, mandatory safety protocols, and full [NABLA Axioms](@/capabilities/nabla-axioms.md) compliance. Every finding, every simulation, every proof is traceable through the platform's provenance system and passes through the [Trinity Gate](@/capabilities/trinity-gate.md) verification pipeline.

## Signal Flow Architecture

The Color Teams operate in a continuous signal flow cycle where findings from one team feed into the next, creating a closed-loop security posture that evolves with each iteration.

```
Gray (boundary seeds) --> Red (adversarial scenarios) --> Purple (synthesis)
                                     ^                         |       ^
                                     |                         v       |
                                Black (threat models)    Blue (defense) |
                                                              |        |
                                                              v        |
                                                        White (proofs) +
```

This signal flow is not sequential -- teams operate concurrently with asynchronous message passing. Gray findings may trigger immediate Red scenarios while previous Red findings are still being synthesized by Purple. The architecture leverages [Elixir](@/technologies/elixir.md)/OTP's concurrency model to maintain multiple overlapping security cycles simultaneously.

## Gray Team -- Boundary Exploration

**Agents**: 3 | **Classification**: L3-L4 | **Mode**: Read-only exploration

Gray Team surfaces ambiguity without resolving it. Their mission is to identify specification gaps, edge cases, and affordance drift -- areas where the platform's behavior is undefined or ambiguous. Gray findings seed both Red Team attack scenarios and Blue Team monitoring priorities.

| Agent | Tier | Role | Key Capability |
|-------|------|------|----------------|
| `gray-explorer-commander` | L3 | Strategic Commander | Orchestrates Gray campaigns, routes findings to Red/Blue/Purple |
| `gray-edge-finder` | L4 | Specialist | Boundary value analysis, specification gap identification |
| `gray-escalation-guard` | L4 | Safety-Critical | Prevents Gray-to-Black escalation, override authority to halt any Gray operation |

### Gray Team Operations

| Focus Area | Output Type | Downstream Consumer |
|-----------|-------------|-------------------|
| Specification gaps | Boundary reports with ambiguity classification | Red Team (attack scenarios) |
| Edge cases | Stress scenarios with reproduction steps | Blue Team (monitoring rules) |
| Affordance drift | Drift alerts with temporal analysis | Purple Team (synthesis) |
| Undefined behavior | Gap analysis with coverage maps | White Team (proof obligations) |

All Gray operations enforce zero state changes. Gray agents have read-only access to platform state and cannot modify any system component. This constraint ensures that boundary exploration itself does not introduce new risks.

## Red Team -- Adversarial Simulation

**Agents**: 4 | **Classification**: L2-L3 | **Mode**: Sandboxed simulation

Red Team simulates epistemic attacks using five adversarial primitives. All execution is sandboxed with synthetic data only -- no real data, no PII, no production state access. The Red Team exists to answer the question: "If an adversary targeted our reasoning processes, what would they attack and how?"

| Agent | Tier | Role | Key Capability |
|-------|------|------|----------------|
| `red-commander` | L3 | Strategic Commander | Orchestrates adversarial scenarios, emits findings to Purple/Blue |
| `red-epistemic-attacker` | L2 | Tactical Specialist | Truth distortion and source poisoning simulation |
| `red-drift-inducer` | L2 | Tactical Specialist | Sub-threshold drift attacks, cascade propagation analysis |
| `red-scenario-generator` | L2 | Tactical Specialist | Composes multi-technique scenarios from 329-entry taxonomy |

### Five Adversarial Primitives

| Primitive | Description | Example Attack | Defense Target |
|-----------|------------|----------------|----------------|
| **Truth Distortion** | Manipulate factual claims in data sources | Inject false corporate registration data | Source validation pipeline |
| **Confidence Manipulation** | Inflate or deflate confidence scores | Spam corroborating signals from dependent sources | Signal Plurality axiom |
| **Signal Poisoning** | Corrupt data quality at collection stage | Introduce malformed data that passes schema validation | Normalization pipeline |
| **Drift Induction** | Gradually shift baseline behavior | Small daily changes that compound into significant deviation | Drift detection thresholds |
| **Salience Hijacking** | Draw attention away from important signals | Flood with high-priority false alerts | Alert prioritization logic |

### Red Team Safety Constraints

| Constraint | Enforcement | Verification |
|-----------|-------------|-------------|
| Sandbox isolation | ABSOLUTE | Process-level containment |
| Synthetic data only | ABSOLUTE | Data provenance check on every input |
| No network access | ABSOLUTE | Network namespace isolation |
| No persistent state changes | ABSOLUTE | Read-only filesystem access |
| Ethics checks every 15 seconds | MANDATORY | Automated behavioral monitoring |
| Audit logging | MANDATORY | Immutable append-only log |

## Blue Team -- Epistemic Defense

**Agents**: 4 | **Classification**: L2-L3 | **Mode**: Continuous monitoring

Blue Team maintains the platform's defensive posture through evidence synthesis, drift detection, and boundary monitoring. Blue agents produce structured evidence reports, not alerts. This distinction is critical: alerts are actionable only when contextually interpreted, while evidence reports provide the raw material for informed decision-making under the [NABLA Axioms](@/capabilities/nabla-axioms.md) framework.

| Agent | Tier | Role | Key Capability |
|-------|------|------|----------------|
| `blue-commander` | L3 | Strategic Commander | Synthesizes evidence from specialists into unified defensive posture |
| `blue-auth-sentinel` | L2 | Operational Specialist | Authentication boundary monitoring, privilege escalation detection |
| `blue-drift-detector` | L2 | Operational Specialist | Behavioral, configuration, dependency, and performance drift detection |
| `blue-signal-aggregator` | L2 | Operational Specialist | Cross-domain signal correlation with NABLA plurality enforcement |

### Blue Team Monitoring Domains

| Domain | Monitoring Target | Detection Method | Response Time |
|--------|------------------|-----------------|---------------|
| Authentication | Privilege boundaries, access patterns | Continuous audit | < 1s |
| Configuration | System parameters, thresholds, weights | Baseline comparison | < 30s |
| Dependency | Library versions, API compatibility | Version tracking | < 1 min |
| Performance | Latency, throughput, resource usage | Statistical anomaly detection | < 10s |
| Behavioral | Agent output patterns, decision distributions | Distribution drift analysis | < 1 min |

```elixir
defmodule PrismaticDark.Blue.DriftDetector do
  @moduledoc """
  Multi-domain drift detection with configurable thresholds.
  Produces structured evidence for Blue Commander synthesis.
  """
  use GenServer

  @drift_threshold 0.05
  @check_interval :timer.seconds(30)

  @impl true
  def handle_info(:check_drift, state) do
    evidence =
      state.monitored_domains
      |> Enum.map(&detect_domain_drift/1)
      |> Enum.filter(fn {_domain, drift} -> drift > @drift_threshold end)
      |> Enum.map(&build_evidence_report/1)

    case evidence do
      [] ->
        {:noreply, state}

      findings ->
        PrismaticDark.Blue.Commander.report_evidence(findings)
        :telemetry.execute(
          [:color_team, :blue, :drift_detected],
          %{count: length(findings)},
          %{domains: Enum.map(findings, & &1.domain)}
        )
        {:noreply, %{state | last_findings: findings}}
    end
  end

  defp detect_domain_drift(domain) do
    baseline = PrismaticDark.Blue.Baseline.get(domain)
    current = PrismaticDark.Blue.Sampler.sample(domain)
    drift = PrismaticDark.Blue.Statistics.kl_divergence(baseline, current)
    {domain, drift}
  end
end
```

## Purple Team -- Synthesis and Closure

**Agents**: 4 | **Classification**: L3-L4 | **Mode**: Analytical synthesis

Purple Team is the central hub for Red-Blue loop closure. It holds sole authority for closure state transitions -- the determination that a Red Team finding has been adequately addressed by Blue Team defenses. Purple's guiding principle: "Purple is the property of the system when it stops lying to itself."

| Agent | Tier | Role | Key Capability |
|-------|------|------|----------------|
| `purple-coordinator` | L3 | Strategic Commander | Synthesis hub, closure authority, anti-metric enforcement |
| `purple-mapper` | L4 | Operational Specialist | Bidirectional Red finding to Blue defense mapping |
| `purple-closure-analyst` | L4 | Operational Specialist | 4-condition closure evaluation, false closure detection |
| `purple-regression-guard` | L4 | Safety-Critical | Regression trap management, deployment gate enforcement |

### Four Closure Conditions

A Red Team finding is considered closed only when all four conditions are simultaneously satisfied.

| Condition | Description | Verification |
|-----------|-------------|-------------|
| **Detection** | Blue Team can detect the attack vector | Demonstrated detection in simulation |
| **Response** | Blue Team can respond within SLA | Timed response exercise |
| **Prevention** | Systemic fix prevents recurrence | Code-level verification |
| **Regression Guard** | Test prevents future regression | Automated regression test in CI |

False closure detection is a critical Purple Team function. If any of the four conditions fails under re-testing, the finding is reopened with escalated priority. This prevents the common security failure mode where issues are "closed" on paper but not actually resolved.

## White Team -- Constructive Verification

**Agents**: 3 | **Classification**: L3-L4 | **Mode**: Formal verification

White Team proves that systems hold through progressive verification methodology spanning five levels. White agents produce evidence artifacts, never modify targets. All output passes through the [Trinity Gate](@/capabilities/trinity-gate.md).

| Agent | Tier | Role | Key Capability |
|-------|------|------|----------------|
| `white-verifier-commander` | L3 | Strategic Commander | Orchestrates verification campaigns, composite proof construction |
| `white-contract-validator` | L4 | Operational Specialist | Interface contract testing, behavior/protocol/API validation |
| `white-invariant-prover` | L4 | Operational Specialist | Property-based testing, formal Lean4 proofs, fault injection analysis |

### Verification Levels

| Level | Method | Guarantee | Application |
|-------|--------|-----------|-------------|
| **L1** | Unit testing | Function-level correctness | Individual agent capabilities |
| **L2** | Contract testing | Interface compliance | Agent-to-agent integration |
| **L3** | Property-based testing | Invariant preservation | NABLA axiom enforcement |
| **L4** | Formal proofs (Lean4) | Mathematical certainty | Trinity Gate Layer 3 |
| **L5** | Composite verification | System-level correctness | Cross-team security properties |

## Black Team -- Theoretical Threat Modeling

**Agents**: 2 | **Classification**: L3 (MAXIMUM ISOLATION) | **Mode**: Abstract analysis only

Black Team operates in maximum isolation to model worst-case adversarial optimization. It produces abstract threat models only and never generates executable content. The Black domain answers: "What is the theoretically worst thing that could happen, and how would we know?"

| Agent | Tier | Role | Key Capability |
|-------|------|------|----------------|
| `black-theorist-commander` | L3 (ISOLATED) | Strategic Commander | Abstract threat models, malicious optimization analysis |
| `black-abstraction-enforcer` | L3 (ISOLATED) | Safety-Critical | L1-L4 output abstraction enforcement, executable content detection |

### Black Team Safety Protocols

| Protocol | Enforcement Level | Description |
|----------|------------------|-------------|
| Output abstraction filtering | L1-L4 levels | All output filtered through AbstractionFilter |
| Executable content detection | ABSOLUTE | Scanner blocks any executable patterns in output |
| No external communication | ABSOLUTE | Zero network, zero IPC outside Black domain |
| Audit trail | MANDATORY | Every analysis step logged immutably |
| Scope containment | ABSOLUTE | Only epistemic threat models, no implementation details |

## Performance and Metrics

| Metric | Current Value | Target |
|--------|--------------|--------|
| **Total Color Team agents** | 20 | 20 |
| **Red Team scenarios executed** | 329+ taxonomy entries | Growing |
| **Blue Team detection rate** | 97%+ | 99% |
| **Purple closure accuracy** | 99%+ | 100% |
| **White proof coverage** | L1-L4 complete | L5 in progress |
| **False closure rate** | < 1% | 0% |
| **Mean closure time** | < 48 hours | < 24 hours |
| **Ethics check frequency** | Every 15 seconds | Every 10 seconds |

## Commands

| Command | Purpose | Authority |
|---------|---------|-----------|
| `/color-team status` | All team status overview | L2+ |
| `/red-team scenario` | Launch adversarial simulation | L3+ |
| `/blue-team posture` | Defensive posture assessment | L2+ |
| `/purple-team closure` | Verify closure status | L3+ |
| `/white-verify` | Run formal verification campaign | L3+ |

## Integration

- Governed by [NABLA Axioms](@/capabilities/nabla-axioms.md) for all epistemic operations and belief formation
- Verified through [Trinity Gate](@/capabilities/trinity-gate.md) for all White Team proof artifacts
- Organized under [AIAD Standard](@/capabilities/aiad-standard.md) with full specification coverage for all 20 agents
- Compliance enforced by [AIAD Compliance](@/capabilities/aiad-compliance.md) with tier-appropriate authority boundaries
- Monitored by [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) for team operation metrics
- Tracked by [Telemetry Integration](@/capabilities/telemetry-integration.md) for cross-team signal flow performance
- Blue Team drift detection triggers [Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md) cycles
- Quality enforced by [NO MERCY](@/capabilities/no-mercy.md) zero-tolerance standards across all teams
- Evidence standards enforced by [NO DOUBTS](@/capabilities/no-doubts.md) for all findings and assessments
- Supports [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) security validation for OSINT pipelines
- [Quality Gates](@/capabilities/quality-gates.md) integrated into Purple Team deployment gates

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)