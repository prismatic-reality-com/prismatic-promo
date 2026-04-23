+++
title = "/blue-team"
weight = 1170
[extra]
category = "Color Teams"
description = "Blue team epistemic defense posture assessment"
syntax = "/blue-team [options]"
authority = "L3"
agent = "blue-commander"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1215
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["blue-team", "Blue", "commands", "Color Teams", "Prismatic Platform", "The Blue", "Team", "Red Team"]
tags = ["commands", "color-teams", "blue-team", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/blue-team - Prismatic Platform"
+++

## Overview

The **/blue-team** command provides epistemic defense posture assessment for the Prismatic Platform, evaluating the system's resilience against information manipulation, knowledge corruption, and trust boundary violations. As part of the platform's six-team [Color Teams](@/glossary/color-teams.md) security architecture, the Blue Team specializes in defensive operations: monitoring authentication boundaries, detecting behavioral drift, aggregating cross-domain security signals, and synthesizing these inputs into a unified defensive posture assessment.

Epistemic security represents a paradigm shift from traditional application security. While conventional security focuses on preventing unauthorized access to systems and data, epistemic security addresses a more fundamental challenge: ensuring the integrity of the knowledge and decision-making processes that the platform relies upon. The Blue Team defends against threats such as truth distortion (where system state representations diverge from reality), confidence manipulation (where certainty levels are artificially inflated or deflated), signal poisoning (where trusted data sources are contaminated), and drift induction (where gradual, sub-threshold changes accumulate into significant deviations).

Operating at the L3 authority level and executed by the `blue-commander` agent, /blue-team is a production command in the [Color Teams](@/glossary/color-teams.md) category. The Blue Team consists of four specialized agents: the `blue-commander` who synthesizes evidence into unified defensive posture, the `blue-auth-sentinel` who monitors authentication boundaries, the `blue-drift-detector` who identifies behavioral and configuration drift, and the `blue-signal-aggregator` who correlates cross-domain signals using NABLA plurality enforcement. Together, they form the defensive layer in the Red-Blue-Purple security synthesis loop within the platform's 216-command [registry](@/glossary/registry-otp.md).

## Usage

```bash
/blue-team [subcommand] [options]
```

The command accepts subcommands that control the type of defensive assessment performed, from quick status checks to comprehensive posture evaluations.

### Examples

```bash
# Full epistemic defense posture assessment
/blue-team posture

# Quick defensive status check
/blue-team status

# Authentication boundary monitoring report
/blue-team auth-check

# Drift detection scan across all domains
/blue-team drift-scan

# Cross-domain signal correlation analysis
/blue-team signal-aggregate

# Targeted assessment of a specific domain
/blue-team posture --domain storage --depth comprehensive
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| **subcommand** | string | No | `posture` | Assessment type: `posture` (full assessment), `status` (quick check), `auth-check` (authentication boundaries), `drift-scan` (drift detection), `signal-aggregate` (cross-domain correlation) |
| **--domain** | string | No | `all` | Target domain for assessment: `storage`, `agents`, `web`, `api`, `perimeter`, `all` |
| **--depth** | string | No | `standard` | Assessment depth: `quick` (status only), `standard` (normal assessment), `comprehensive` (exhaustive analysis) |
| **--timeframe** | string | No | `24h` | Historical timeframe for drift and signal analysis: `1h`, `24h`, `7d`, `30d` |
| **--output** | string | No | `report` | Output format: `report` (markdown), `json` (structured data), `posture-card` (summary card) |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L3 - Strategic Operations |
| **Executing Agent** | `blue-commander` |
| **Status** | Production |
| **Usage Frequency** | Medium |
| **Category** | Color Teams |
| **Read Access** | Authentication logs, telemetry streams, configuration state, behavioral baselines |
| **Write Access** | Posture assessments, signal correlation reports, drift detection results |
| **Team Size** | 4 agents (commander + 3 specialists) |
| **Coordination** | Red Team (adversarial input), Purple Team (synthesis output) |

### Blue Team Agent Composition

| Agent | Role | Key Capability |
|-------|------|----------------|
| `blue-commander` | L3 Strategic Commander | Synthesizes evidence from specialists into unified defensive posture |
| `blue-auth-sentinel` | L2 Operational Specialist | Authentication boundary monitoring, privilege escalation detection |
| `blue-drift-detector` | L2 Operational Specialist | Behavioral, configuration, dependency, and performance drift detection |
| `blue-signal-aggregator` | L2 Operational Specialist | Cross-domain signal correlation with NABLA plurality enforcement |

## Technical Implementation

The /blue-team command orchestrates a multi-agent defensive assessment pipeline. The `blue-commander` coordinates the three specialist agents, aggregates their findings, and synthesizes a unified posture assessment. Each specialist operates independently on its domain, producing structured evidence that is then correlated and analyzed at the commander level.

```elixir
defmodule Prismatic.Commands.BlueTeam do
  @moduledoc """
  Blue Team epistemic defense posture assessment.
  Coordinates 4 agents across authentication, drift,
  and signal aggregation domains.
  """

  @spec execute(subcommand :: String.t(), opts :: keyword()) ::
          {:ok, PostureAssessment.t()} | {:error, term()}
  def execute(subcommand \\ "posture", opts \\ []) do
    domain = Keyword.get(opts, :domain, "all")
    depth = Keyword.get(opts, :depth, "standard")
    timeframe = Keyword.get(opts, :timeframe, "24h")

    case subcommand do
      "posture" -> assess_full_posture(domain, depth, timeframe)
      "status" -> quick_status_check()
      "auth-check" -> assess_auth_boundaries(domain, timeframe)
      "drift-scan" -> detect_drift(domain, timeframe)
      "signal-aggregate" -> aggregate_signals(domain, timeframe)
    end
  end

  defp assess_full_posture(domain, depth, timeframe) do
    with {:ok, auth_status} <- BlueAuthSentinel.assess(domain, timeframe),
         {:ok, drift_report} <- BlueDriftDetector.scan(domain, timeframe),
         {:ok, signal_correlation} <- BlueSignalAggregator.correlate(domain, timeframe),
         {:ok, posture} <- BlueCommander.synthesize(auth_status, drift_report, signal_correlation, depth) do
      {:ok, posture}
    end
  end
end
```

The defensive assessment pipeline processes three parallel streams of evidence. The authentication stream monitors trust boundaries, session integrity, and privilege escalation patterns. The drift stream tracks behavioral deviations from established baselines across configuration, dependencies, and performance characteristics. The signal stream aggregates security-relevant events from all platform domains and applies correlation analysis to detect patterns that individual signals would not reveal.

The commander synthesis phase applies the NABLA axioms to the aggregated evidence: signal plurality ensures that defensive conclusions are not based on a single data source, contradiction preservation surfaces conflicting signals rather than suppressing them, and provenance tracking maintains full traceability from posture assessment back to the individual observations that informed it.

## Workflow Integration

The /blue-team command operates within the Color Teams signal flow architecture, which follows the pattern: Gray (boundary seeds) to Red (adversarial scenarios) to Purple (synthesis) to Blue (defense). The Blue Team receives refined adversarial scenarios from the Red Team through the Purple Team's synthesis process and uses this input to strengthen defensive posture.

Common workflow patterns include:

1. **Regular Posture Assessment**: Run `/blue-team posture` on a regular cadence (daily or after significant changes) to maintain awareness of the defensive state
2. **Post-Red-Team Response**: After the [Red Team](@/glossary/red-team.md) identifies new adversarial scenarios, run `/blue-team posture --depth comprehensive` to evaluate defensive readiness against the new threats
3. **Authentication Audit**: Use `/blue-team auth-check` after changes to authentication or authorization logic to verify that trust boundaries remain intact
4. **Drift Monitoring**: Run `/blue-team drift-scan --timeframe 7d` as part of weekly security reviews to detect gradual deviations that might indicate compromise
5. **Pre-Deployment Validation**: Include `/blue-team posture --depth quick` in the deployment pipeline to catch security posture degradation before production releases
6. **Incident Response**: During security incidents, run `/blue-team signal-aggregate --timeframe 1h` for rapid correlation of recent security events

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `blue-commander` with 3 specialist agents |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution quality validation |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md), security event streams |
| [Red Team](@/glossary/red-team.md) | Adversarial scenarios that inform defensive assessment |
| [Purple Team](@/glossary/purple-team.md) | Synthesis of Red-Blue findings into closure analysis |
| Gray Team | Boundary exploration seeds for defensive evaluation |
| White Team | Constructive verification of defensive properties |
| NABLA Framework | Plurality enforcement in signal aggregation |
| Trinity Gate | Defensive posture claims verified through three-gate system |
| Authentication System | Trust boundary monitoring and session integrity |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Defensive posture assessments are exhaustive. No domain is excluded from analysis, no signal is dismissed without investigation, and no drift is tolerated without explanation. When the Blue Team identifies a defensive gap, it is reported with full severity classification and remediation guidance. There are no acceptable weaknesses in epistemic defense posture.
- **NO DOUBTS**: Every defensive assessment is grounded in observable evidence. The Blue Team produces structured evidence artifacts, not alerts. Signal correlation requires independent confirmation from multiple sources before conclusions are drawn. Drift detection is based on quantified deviation from established baselines, not subjective assessment. All findings include full provenance chains linking conclusions to their underlying observations.
- **NABLA Compliance**: The Blue Team is built on NABLA axioms. Signal plurality (minimum 2 independent signals for any belief) is enforced by the `blue-signal-aggregator`. Contradiction preservation ensures that conflicting security signals are surfaced and analyzed rather than smoothed over. Absence is treated as informative data: when expected security signals are not observed, that absence is itself a finding. Source independence weighting ensures that corroborating signals from independent sources carry more weight than echoes from correlated sources.

## Best Practices

1. **Combine with Red Team**: The Blue Team is most effective when operating in concert with the Red Team through the Purple Team synthesis loop; always check recent [/red-team](@/commands/red-team.md) findings before running posture assessments
2. **Establish baselines first**: Drift detection requires behavioral baselines; ensure baselines are current before interpreting drift reports
3. **Use appropriate timeframes**: Short timeframes (1h) for incident response, standard (24h) for daily checks, long (7d/30d) for trend analysis
4. **Read posture cards for quick checks**: Use `--output posture-card` for rapid assessment; save `--output report` for detailed analysis
5. **Monitor authentication boundaries after changes**: Any change to auth logic should trigger an immediate `/blue-team auth-check`
6. **Track posture trends over time**: Regular assessments build a historical picture of defensive posture evolution that reveals gradual degradation

## Related Commands

- [/color-team](@/commands/color-team.md) - Color team status overview across all 6 teams
- [/red-team](@/commands/red-team.md) - [Red team](@/glossary/red-team.md) adversarial simulation scenario execution
- [/purple-team](@/commands/purple-team.md) - [Purple team](@/glossary/purple-team.md) Red-Blue synthesis and closure analysis
- [/manipulation-detect](@/commands/manipulation-detect.md) - Detect manipulation attempts using epistemic analysis
- [/manipulation-protect](@/commands/manipulation-protect.md) - Activate manipulation protection defenses
- [/manipulation-techniques](@/commands/manipulation-techniques.md) - View manipulation technique taxonomy and counter-measures
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/architect](@/commands/architect.md) - Architecture design and recommendation generation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)