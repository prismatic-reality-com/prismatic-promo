+++
title = "Blue Team"
weight = 3
[extra]
color = "blue"
agent_count = 4
commander = "blue-commander"
role = "Epistemic Defense"
description = "Defensive posture, signal aggregation, drift detection"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1206
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Blue", "Team", "Defensive", "teams", "Prismatic Platform", "Blue Team", "HARD", "Purple", "Red Team"]
tags = ["teams", "blue-team", "prismatic"]
quality_score = 80
see_also = ["agents", "capabilities", "architecture"]
image = "/images/sections/teams.png"
image_alt = "Blue Team - Prismatic Platform"
+++

## Overview

The Blue Team serves as the defensive backbone of the Prismatic Platform's six-team color-team security architecture. Through continuous monitoring, multi-domain signal aggregation, and four-type drift detection, Blue Team maintains the epistemic integrity of the platform's knowledge systems against both external adversarial pressure and internal degradation. While [Red Team](@/teams/red.md) probes for vulnerabilities through offensive simulation, Blue Team builds and operates the defensive infrastructure that detects, contains, and responds to threats in real time.

The Blue Team's approach to defense is fundamentally evidence-based, grounded in the [NABLA Infinity](@/glossary/nabla-infinity.md) framework's requirement for signal plurality and contradiction preservation. Rather than operating on binary alert/no-alert logic, Blue produces structured defensive posture assessments that quantify confidence levels, track signal provenance, and preserve contradictory indicators for [Purple Team](@/teams/purple.md) synthesis. This evidence-centric approach distinguishes the platform's defensive posture from traditional SIEM-based security operations, which often reduce complex signal landscapes to binary classifications.

The defensive posture maintained by Blue Team spans four detection domains — behavioral drift, configuration drift, dependency drift, and performance drift — each with dedicated detection pipelines, baseline management, and response protocols. These four domains provide comprehensive coverage of the attack surface that [Red Team](@/teams/red.md) tests through its five epistemic attack primitives, creating the adversarial-defensive feedback loop that Purple Team synthesizes into continuous improvement.

## Mission and Doctrine

The Blue Team mission is to maintain a continuously accurate defensive posture assessment for the Prismatic Platform's epistemic systems, detecting and characterizing threats before they compromise knowledge integrity. This mission operates under the principle that defense is not a static state but a continuous process of observation, analysis, and adaptation.

### Mission Principles

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| **Evidence Over Alerts** | Produce structured evidence, not binary alerts | NABLA Signal Plurality |
| **Continuous Assessment** | Defensive posture updated in real-time | Telemetry pipeline |
| **Plurality Required** | Minimum 2 independent signals for any assessment | HARD enforcement |
| **Contradiction Preserved** | Conflicting signals documented, not suppressed | NABLA Axiom 2 |
| **Provenance Mandatory** | Every defensive finding traceable to source data | Complete audit trail |

The [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine applies to Blue Team operations with emphasis on NO DOUBTS: every defensive assessment must be evidence-based, every signal must be traceable, and every conclusion must be supported by multiple independent sources. NO MERCY manifests in the zero-tolerance approach to detection gaps — if a Red Team simulation reveals a blind spot, Blue Team addresses it immediately.

## Team Composition

The Blue Team comprises four specialized agents organized around the defensive lifecycle: command and synthesis, authentication monitoring, drift detection, and signal aggregation.

| Agent | Level | Role | Primary Function | Detection Domain |
|-------|-------|------|------------------|-----------------|
| **blue-commander** | L3 | Strategic Commander | Synthesizes evidence into unified defensive posture | All domains |
| **blue-auth-sentinel** | L2 | Operational Specialist | Authentication boundary monitoring, privilege escalation detection | Access control |
| **blue-drift-detector** | L2 | Operational Specialist | Four-type drift detection across behavioral, config, dependency, performance | All drift types |
| **blue-signal-aggregator** | L2 | Operational Specialist | Cross-domain signal correlation with NABLA plurality enforcement | Signal fusion |

### blue-commander

The Blue Commander operates at L3 strategic authority, synthesizing evidence streams from all three specialist agents into unified defensive posture assessments. The commander maintains the master posture state, coordinates response priorities, and manages the handoff of defensive findings to [Purple Team](@/teams/purple.md) for Red-Blue loop closure. The commander also manages detection threshold calibration, ensuring that sensitivity levels balance detection capability against false positive rates.

### blue-auth-sentinel

The Auth Sentinel monitors authentication boundaries — the points where identity, authorization, and access control decisions are made. This agent detects anomalous authentication patterns including unusual login locations, abnormal session durations, privilege escalation attempts, and credential reuse indicators. The sentinel maintains behavioral baselines per user, per service, and per role, enabling detection of deviations that may indicate compromised credentials or insider threats.

### blue-drift-detector

The Drift Detector operates across all four drift detection domains, maintaining baselines and detecting deviations that may indicate degradation, compromise, or unintended change. This is the broadest-scope specialist, responsible for the continuous comparison of current system state against established baselines with configurable drift thresholds per domain and metric type.

### blue-signal-aggregator

The Signal Aggregator performs cross-domain correlation, combining signals from authentication events, drift detections, platform [telemetry](@/capabilities/telemetry-integration.md), external threat feeds, and agent reports into correlated intelligence products. The aggregator enforces NABLA signal plurality requirements, refusing to elevate any assessment that depends on a single signal source.

## Defensive Domains

### Four Drift Detection Types

| Drift Type | Indicators | Baseline Source | Response | Detection Threshold |
|------------|------------|-----------------|----------|-------------------|
| **Behavioral** | Output pattern changes, API call frequency shifts | Historical behavioral profiles | Alert + investigation | 5% deviation |
| **Configuration** | Settings deviation, environment changes | Configuration snapshots | Auto-revert option | Any unauthorized change |
| **Dependency** | Version changes, API compatibility shifts | Lockfile baselines | Compatibility check | Any version change |
| **Performance** | Latency shifts, throughput degradation, error rate changes | Performance baselines (P50/P95/P99) | Optimization trigger | 10% degradation |

### Detection Architecture

```elixir
defmodule PrismaticDark.BlueTeam.DriftDetector do
  @moduledoc """
  Four-domain drift detection with configurable thresholds.
  Maintains baselines and detects deviations across behavioral,
  configuration, dependency, and performance domains.
  """
  use GenServer

  @type drift_type :: :behavioral | :configuration | :dependency | :performance
  @type detection :: %{
    type: drift_type(),
    source: String.t(),
    baseline: term(),
    current: term(),
    deviation: float(),
    risk: :low | :medium | :high | :critical
  }

  @spec assess_drift(drift_type(), keyword()) :: {:ok, [detection()]}
  def assess_drift(domain, opts \\ []) do
    threshold = Keyword.get(opts, :threshold, default_threshold(domain))
    baseline = load_baseline(domain)
    current = sample_current(domain)

    detections =
      compare(baseline, current)
      |> Enum.filter(fn {_key, deviation} -> deviation > threshold end)
      |> Enum.map(&build_detection(domain, &1, baseline, current))

    :telemetry.execute(
      [:prismatic, :blue_team, :drift, :assessed],
      %{detection_count: length(detections), domain: domain},
      %{threshold: threshold}
    )

    {:ok, detections}
  end
end
```

### Signal Aggregation Pipeline

```
Signal Sources
├── Application Logs (structured, JSON)
├── Metrics (Telemetry events)
├── Security Events (auth, access, privilege)
├── External Feeds (threat intelligence)
├── Agent Reports (Red findings, Gray boundaries)
└── Drift Detections (4 domains)
          ↓
   Correlation Engine
   ├── Temporal correlation (co-occurring events)
   ├── Spatial correlation (same component/module)
   ├── Causal correlation (event chains)
   └── NABLA plurality enforcement (min 2 sources)
          ↓
   Defensive Posture Assessment
   ├── Overall health score
   ├── Per-domain risk levels
   ├── Confidence scores (with provenance)
   └── Contradiction register
          ↓
   Purple Team Handoff
```

## Technical Architecture

Blue Team operations are implemented as an OTP application within the PrismaticDark umbrella, with dedicated GenServer processes for each detection domain and a supervisor managing the detection lifecycle.

### System Architecture

```
Blue Commander (L3)
├── Posture Synthesizer
│   ├── Evidence Aggregator
│   ├── Confidence Calculator
│   └── Contradiction Register
├── Detection Pipeline
│   ├── Auth Sentinel
│   │   ├── Login Pattern Analyzer
│   │   ├── Privilege Monitor
│   │   └── Session Tracker
│   ├── Drift Detector
│   │   ├── Behavioral Baseline Manager
│   │   ├── Config Snapshot Comparator
│   │   ├── Dependency Version Tracker
│   │   └── Performance Baseline Monitor
│   └── Signal Aggregator
│       ├── Temporal Correlator
│       ├── Spatial Correlator
│       ├── Causal Chain Builder
│       └── Plurality Enforcer
└── Response Coordinator
    ├── Alert Router
    ├── Auto-Remediation Engine
    └── Purple Team Emitter
```

### Authentication Boundary Monitoring

```elixir
defmodule PrismaticDark.BlueTeam.AuthSentinel do
  @moduledoc """
  Authentication boundary monitoring with behavioral baselines.
  Detects anomalous patterns in login, session, and privilege events.
  """
  use GenServer

  @anomaly_types [:unusual_location, :abnormal_time, :rapid_succession,
                  :privilege_escalation, :credential_reuse, :session_hijack]

  @spec analyze_auth_event(map()) :: {:ok, :normal} | {:alert, map()}
  def analyze_auth_event(event) do
    baseline = get_user_baseline(event.user_id)

    anomalies =
      @anomaly_types
      |> Enum.map(&check_anomaly(&1, event, baseline))
      |> Enum.reject(&is_nil/1)

    case anomalies do
      [] -> {:ok, :normal}
      findings ->
        :telemetry.execute(
          [:prismatic, :blue_team, :auth, :anomaly],
          %{anomaly_count: length(findings)},
          %{user_id: event.user_id, types: Enum.map(findings, & &1.type)}
        )
        {:alert, %{anomalies: findings, event: event, baseline: baseline}}
    end
  end
end
```

### Telemetry Events

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:prismatic, :blue_team, :posture, :assessed]` | health_score, domain_count | assessment_id |
| `[:prismatic, :blue_team, :drift, :assessed]` | detection_count, domain | threshold |
| `[:prismatic, :blue_team, :drift, :detected]` | deviation, risk_level | type, source |
| `[:prismatic, :blue_team, :auth, :anomaly]` | anomaly_count | user_id, types |
| `[:prismatic, :blue_team, :signal, :correlated]` | signal_count, confidence | correlation_type |
| `[:prismatic, :blue_team, :purple, :handoff]` | finding_count | severity |

## NABLA Compliance

Blue Team is the primary enforcement arm for NABLA axioms in the defensive domain. The Signal Aggregator explicitly enforces signal plurality, and the Posture Synthesizer preserves contradictions rather than resolving them.

| Axiom | Blue Team Application | Enforcement Level |
|-------|----------------------|------------------|
| Signal Plurality | Minimum 2 independent signals for any posture assessment | HARD — enforced in aggregator |
| Contradiction Preservation | Conflicting signals preserved in Contradiction Register | HARD — both sides forwarded to Purple |
| Absence Informative | Missing expected signals treated as anomaly indicators | HARD — absence detection pipeline |
| Time Decay | Signal confidence decays over time, baselines updated | HARD — configurable decay rates |
| Unknown Valid | "Insufficient data" is a legitimate posture state | HARD — no forced classification |
| Source Independence | Independent sources weighted higher in correlation | SOFT — weighting algorithm |
| Provenance Mandatory | Every signal traces to source event with timestamp | HARD — immutable provenance chain |

### Plurality Enforcement Example

```elixir
defmodule PrismaticDark.BlueTeam.PluralityEnforcer do
  @moduledoc """
  Enforces NABLA Axiom 1: minimum 2 independent signals for any belief.
  """

  @spec validate_assessment(map()) :: {:ok, map()} | {:error, :insufficient_plurality}
  def validate_assessment(%{signals: signals} = assessment) do
    independent_sources =
      signals
      |> Enum.map(& &1.source)
      |> Enum.uniq()
      |> length()

    if independent_sources >= 2 do
      {:ok, Map.put(assessment, :plurality_verified, true)}
    else
      {:error, :insufficient_plurality}
    end
  end
end
```

## Performance Metrics

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| Posture assessment latency | < 500ms | End-to-end from signal to assessment |
| Drift detection cycle time | 30 seconds | Per domain scan interval |
| Auth event processing | < 10ms | Per individual event |
| Signal correlation window | 5 minutes | Temporal correlation lookback |
| False positive rate | < 3% | Across all detection domains |
| Detection coverage | > 95% | Of Red Team attack primitives |
| Baseline update frequency | Hourly | Rolling baseline window |
| Mean time to detect | < 2 minutes | From event to posture change |

## Integration Points

| Component | Direction | Content | Purpose |
|-----------|-----------|---------|---------|
| [Red Team](@/teams/red.md) | Red → Blue | Attack scenarios, vulnerability reports | Defense development |
| [Purple Team](@/teams/purple.md) | Blue → Purple | Defensive posture, evidence | Red-Blue loop closure |
| [Gray Team](@/teams/gray.md) | Gray → Blue | Boundary findings, spec gaps | Defensive gap awareness |
| [White Team](@/teams/white.md) | Blue ↔ White | Defense specifications for formal verification | Proof of defense correctness |
| Platform [Telemetry](@/capabilities/telemetry-integration.md) | Platform → Blue | Raw telemetry events | Signal source |
| [Quality Gates](@/capabilities/quality-gates.md) | Blue → Quality | Security posture status | Deployment gate input |

### Signal Flow

```
              ┌─── Gray Team Findings (boundary seeds)
              │
              ├─── Red Team Attack Results (vulnerability data)
              │
Blue Team ◄───┼─── Platform Telemetry (runtime events)
              │
              ├─── External Threat Feeds (intelligence data)
              │
              └─── Agent Reports (cross-team signals)

         ↓

Purple Team (Synthesis & Closure)
```

## Outputs

| Artifact | Purpose | Frequency | Consumers |
|----------|---------|-----------|-----------|
| Defensive Posture Report | System health assessment with confidence levels | Real-time | Purple, Platform |
| Drift Analysis | Change tracking across 4 domains | Continuous | Purple, Architecture |
| Signal Correlation | Multi-source threat intelligence products | Real-time | Purple, Security |
| Auth Anomaly Report | Authentication boundary incidents | On detection | Purple, Security |
| Defense Recommendations | Improvement proposals for Purple handoff | As needed | Purple Team |
| Baseline Update Log | Baseline evolution tracking | Hourly | Audit, Architecture |

## Related Resources

- [Red Team](@/teams/red.md) — Adversarial simulation that drives Blue defensive development
- [Purple Team](@/teams/purple.md) — Synthesis hub that closes the Red-Blue feedback loop
- [Gray Team](@/teams/gray.md) — Boundary exploration that surfaces defensive gaps
- [White Team](@/teams/white.md) — Formal verification of Blue defensive implementations
- [Black Team](@/teams/black.md) — Theoretical threat models informing defensive strategy
- [Telemetry Integration](@/capabilities/telemetry-integration.md) — Foundational signal source for all detection
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) — Monitoring infrastructure Blue Team operates within
- [Quality Gates](@/capabilities/quality-gates.md) — Deployment gates incorporating Blue posture assessments

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)