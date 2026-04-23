+++
title = "/manipulation-detect"
weight = 1110
[extra]
category = "Defensive Security"
description = "Detect manipulation attempts using epistemic analysis"
syntax = "/manipulation-detect [options]"
authority = "L3"
agent = "manipulation-detector"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1377
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["manipulation-detect", "Detect", "commands", "Defensive Security", "Prismatic Platform", "Detection", "Red Team", "Detections"]
tags = ["commands", "defensive-security", "manipulation-detect", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/manipulation-detect - Prismatic Platform"
+++

## Overview

**/manipulation-detect** is a production command in the **Defensive Security** category of the Prismatic Platform that performs active detection of manipulation attempts against the platform's epistemic systems using multi-layered analysis techniques. The command scans intelligence streams, agent behavior patterns, confidence distributions, and knowledge base integrity to identify attempts to distort truth, manipulate confidence, poison signals, induce drift, or hijack salience within the platform's decision-making infrastructure.

This command operates under the **L3** authority level and is executed by the `manipulation-detector` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the sensitive nature of manipulation detection -- the command requires access to agent behavior data, intelligence streams, and confidence scoring internals to perform effective detection.

Manipulation detection in the Prismatic Platform is grounded in the [NABLA](@/glossary/nabla-infinity.md) epistemic framework's seven non-negotiable axioms. Each axiom defines a property that must hold for the platform's knowledge to be trustworthy: signal plurality, contradiction preservation, absence informativeness, time decay, unknown validity, source independence, and provenance mandatoriness. The manipulation detection system monitors for violations of these axioms as indicators of manipulation. A sudden reduction in signal plurality may indicate source poisoning. Disappearing contradictions may indicate truth distortion. Confidence scores clustering around specific values may indicate confidence manipulation.

The detection engine uses five primary analysis techniques that correspond to the five categories of epistemic attack identified by the [Red Team](@/glossary/red-team.md): fact verification (detects truth distortion), statistical analysis (detects confidence manipulation), source validation (detects signal poisoning), baseline comparison (detects drift induction), and attention analysis (detects salience hijacking). These techniques operate continuously in the background and can also be invoked on-demand for specific scope scanning.

## Architecture

The detection system operates as a multi-technique analysis engine with continuous monitoring and on-demand scanning capabilities.

### Detection Architecture

```
/manipulation-detect -> Scan Coordinator -> Analysis Engines -> Verdict Engine
                              |                   |                   |
                              v                   v                   v
                        Scope Definition    Fact Verifier       Threat Score
                        Target Selection    Stats Analyzer      Classification
                        Baseline Loading    Source Validator     Evidence Chain
                        Signal Collection   Drift Detector      Remediation
                                            Salience Analyzer
```

### Detection Techniques

| Technique | Target Attack | Method | Indicators |
|-----------|--------------|--------|------------|
| **Fact Verification** | Truth Distortion | Compare assertions against knowledge base | Contradiction rate, source deviation |
| **Statistical Analysis** | Confidence Manipulation | Analyze confidence score distributions | Bimodal clustering, artificial plateaus |
| **Source Validation** | Signal Poisoning | Verify signal provenance and plurality | Single-source dominance, provenance gaps |
| **Baseline Comparison** | Drift Induction | Compare current behavior against established baselines | Deviation velocity, cumulative drift |
| **Attention Analysis** | Salience Hijacking | Analyze attention distribution across targets | Focus concentration, topic deviation |

### Detection Scope Levels

| Scope | Targets | Duration | Use Case |
|-------|---------|----------|----------|
| **Agent** | Single agent behavior and outputs | 1-5 minutes | Targeted investigation |
| **Channel** | Intelligence stream or data feed | 5-15 minutes | Stream integrity check |
| **Domain** | Analysis domain (financial, legal, etc.) | 10-30 minutes | Domain-wide assessment |
| **Pipeline** | Complete intelligence pipeline | 15-60 minutes | Full pipeline audit |
| **Platform** | All platform epistemic systems | 30-120 minutes | Comprehensive scan |

### Confidence Scoring for Detections

| Confidence | Threshold | Meaning | Action |
|------------|-----------|---------|--------|
| **Confirmed** | > 0.95 | Multiple independent indicators confirm manipulation | Immediate defense activation |
| **Probable** | 0.75 - 0.95 | Strong indicators across multiple techniques | Alert + investigation |
| **Possible** | 0.50 - 0.75 | Single technique indicates manipulation | Monitor + investigate |
| **Unlikely** | 0.25 - 0.50 | Weak indicators, likely false positive | Log + monitor |
| **Not Detected** | < 0.25 | No meaningful indicators | Normal operations |

## Usage

```bash
# Run platform-wide manipulation scan
/manipulation-detect --scope=platform

# Scan specific agent
/manipulation-detect --scope=agent --target=sig-osint-commander

# Scan intelligence channel
/manipulation-detect --scope=channel --target=osint-pipeline

# Scan with specific technique focus
/manipulation-detect --technique=truth-distortion --scope=domain --target=financial

# Continuous monitoring mode
/manipulation-detect --continuous --interval=60

# Quick triage scan
/manipulation-detect --scope=platform --depth=quick

# Deep analysis scan
/manipulation-detect --scope=agent --target=ma-financial-analyst --depth=exhaustive

# Scan with custom baseline
/manipulation-detect --scope=agent --target=sig-osint-commander \
  --baseline="2026-01-01:2026-02-01"

# Export detection results
/manipulation-detect --scope=platform --format=json --output=detection-results.json

# Run Red Team scenario validation
/manipulation-detect --validate-scenario=red-team-scenario-042

# Scan specific time window
/manipulation-detect --scope=platform --time-window="2026-02-14T00:00:00Z/2026-02-15T00:00:00Z"

# Detection with sensitivity adjustment
/manipulation-detect --scope=platform --sensitivity=high
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--scope` | string | platform | Detection scope: agent, channel, domain, pipeline, platform |
| `--target` | string | all | Target agent, channel, or domain name |
| `--technique` | string | all | Detection technique: truth-distortion, confidence-manipulation, signal-poisoning, drift-induction, salience-hijacking, all |
| `--depth` | string | standard | Scan depth: quick, standard, deep, exhaustive |
| `--continuous` | flag | false | Enable continuous monitoring |
| `--interval` | integer | 300 | Continuous monitoring interval in seconds |
| `--baseline` | string | auto | Baseline period for comparison (start:end dates) |
| `--sensitivity` | string | normal | Detection sensitivity: low, normal, high, maximum |
| `--format` | string | text | Output format: text, json, markdown |
| `--output` | string | stdout | Output file path |
| `--validate-scenario` | string | none | Red Team scenario ID for validation |
| `--time-window` | string | last-24h | Time window for analysis (ISO 8601 interval) |
| `--confidence-threshold` | float | 0.5 | Minimum confidence for reported detections |
| `--include-false-positives` | flag | false | Include suspected false positives in output |

## Execution Flow

1. **Scope Resolution**: The detection scope is resolved to a specific set of monitoring targets. Agent scope resolves to a single agent's behavior data. Channel scope resolves to a specific intelligence stream. Platform scope includes all monitoring points.

2. **Baseline Loading**: Behavioral baselines for all targets in scope are loaded from the baseline database. Baselines include normal confidence distributions, typical signal patterns, established fact references, and historical attention patterns.

3. **Signal Collection**: Current signals are collected from all targets in scope. This includes agent outputs, intelligence stream data, confidence scores, knowledge base state, and attention metrics for the configured time window.

4. **Parallel Analysis**: All five detection techniques execute in parallel against the collected signals. Each technique compares current observations against baselines and detection rules to identify anomalies.

5. **Anomaly Scoring**: Each detected anomaly is scored for manipulation confidence. Scoring considers anomaly magnitude, consistency across multiple indicators, duration, and correlation with known attack patterns.

6. **Cross-Technique Correlation**: Anomalies detected by individual techniques are correlated to identify coordinated attacks. A truth distortion anomaly combined with a confidence manipulation anomaly on the same target significantly increases the overall manipulation confidence score.

7. **Classification**: Confirmed detections are classified against the manipulation technique taxonomy. The classification includes the specific technique variant, estimated sophistication level, affected scope, and potential impact.

8. **Evidence Chain Construction**: For each detection, an evidence chain is constructed linking the detected anomaly to the specific signals, baseline deviations, and analysis results that support the detection. This chain provides full auditability.

9. **Alert Generation**: Detections exceeding the confidence threshold generate alerts that are sent to [/manipulation-dashboard](@/commands/manipulation-dashboard.md) and, if configured, to [/manipulation-protect](@/commands/manipulation-protect.md) for automated defense activation.

10. **Result Reporting**: Detection results are formatted and output according to the configured format and destination.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `manipulation-detector` | Detection analysis engine |
| [/manipulation-protect](@/commands/manipulation-protect.md) | Defense activation | Detections trigger protection responses |
| [/manipulation-dashboard](@/commands/manipulation-dashboard.md) | Visualization | Detection signals feed dashboard |
| [/manipulation-techniques](@/commands/manipulation-techniques.md) | Classification | Taxonomy for detection classification |
| [Color-Team](@/glossary/color-teams.md) | Red/Blue framework | Red Team validates, Blue Team defends |
| [NABLA Framework](@/glossary/nabla-infinity.md) | Axiom monitoring | Detection based on NABLA axiom violations |
| [Quality Gates](@/glossary/quality-gates.md) | Quality integration | Detection quality validation |
| [Telemetry](@/glossary/telemetry.md) | Event tracking | Detection events logged for analysis |
| [/emergency](@/commands/emergency.md) | Crisis escalation | Critical detections trigger emergency protocol |

## Best Practices

**Run continuous monitoring during intelligence operations.** Active OSINT collection sessions introduce external data that may contain manipulation attempts. Continuous monitoring during these sessions provides real-time detection coverage.

**Use appropriate sensitivity for the threat environment.** Normal sensitivity is suitable for routine operations. Increase to high during active threat periods or when processing intelligence from untrusted sources.

**Validate with Red Team scenarios.** Periodically run `--validate-scenario` against Red Team attack simulations to verify that the detection system identifies known attack patterns. Detection gaps against known attacks indicate tuning needs.

**Review false positives periodically.** Use `--include-false-positives` to review near-threshold detections that were classified as unlikely. Patterns in false positives may indicate emerging attack techniques that current rules underweight.

**Establish baselines during calm periods.** Baselines established during periods of known-clean operation are more reliable than those established during uncertain periods. Use `--baseline` to specify clean reference periods.

**Investigate drift detections thoroughly.** Drift induction is specifically designed to be sub-threshold -- each individual change is small enough to avoid detection. When drift is detected, the cumulative effect is often significant and warrants thorough investigation.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `target_not_found` | Specified agent or channel does not exist | Verify target name with system inventory |
| `baseline_not_available` | No baseline data for specified period | Establish baseline first or use auto-baseline |
| `signal_collection_timeout` | Could not collect signals in time | Reduce scope or increase timeout |
| `technique_not_available` | Specified technique module not loaded | Check module availability, restart if needed |
| `scenario_not_found` | Red Team scenario ID does not exist | Verify scenario ID with Red Team inventory |
| `insufficient_data` | Not enough data for meaningful analysis | Extend time window or wait for more data |

## Advanced Usage

### Custom Detection Rules

Add organization-specific detection rules.

```bash
# Add custom confidence manipulation rule
/manipulation-detect --add-rule --name="custom-confidence-check" \
  --technique=confidence-manipulation \
  --condition="confidence_stdev < 0.05 AND sample_size > 100" \
  --severity=high

# Test custom rule against historical data
/manipulation-detect --test-rule="custom-confidence-check" --time-window="2026-01-01/2026-02-01"
```

### Forensic Analysis Mode

Deep analysis of suspected manipulation events.

```bash
# Forensic analysis of specific event
/manipulation-detect --forensic --event-id=MAN-2026-042 --depth=exhaustive

# Trace manipulation chain across agents
/manipulation-detect --trace --start-event=MAN-2026-042 --follow-propagation
```

### Integration with External Threat Intelligence

Incorporate external threat indicators into detection.

```bash
# Import threat indicators
/manipulation-detect --import-indicators=external-threats.json

# Cross-reference with known attack patterns
/manipulation-detect --scope=platform --cross-reference=threat-db
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Detection scans complete fully or report exactly which components could not be scanned. No monitoring gap is silently accepted.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every detection includes a complete evidence chain, confidence scoring, and classification against the established taxonomy. Detections without evidence are not reported.

## Related Commands

- [/manipulation-protect](@/commands/manipulation-protect.md) - Activate manipulation protection defenses
- [/manipulation-techniques](@/commands/manipulation-techniques.md) - View manipulation technique taxonomy and counter-measures
- [/manipulation-dashboard](@/commands/manipulation-dashboard.md) - Manipulation detection dashboard with threat indicators
- [/emergency](@/commands/emergency.md) - Emergency response and crisis management activation
- [/archer-supreme](@/commands/archer-supreme.md) - Supreme authority activation for platform-wide operations
- [/dark-ops](@/commands/dark-ops.md) - NABLA structural crisis detection and dark operations analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)