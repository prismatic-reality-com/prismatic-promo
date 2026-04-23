+++
title = "/manipulation-dashboard"
weight = 1140
[extra]
category = "Defensive Security"
description = "Manipulation detection dashboard with threat indicators"
syntax = "/manipulation-dashboard [options]"
authority = "L2+"
agent = "manipulation-detector"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1218
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["manipulation-dashboard", "Manipulation", "commands", "Defensive Security", "Prismatic Platform", "Score", "Detection", "Real"]
tags = ["commands", "defensive-security", "manipulation-dashboard", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/manipulation-dashboard - Prismatic Platform"
+++

## Overview

**/manipulation-dashboard** is a production command in the **Defensive Security** category of the Prismatic Platform that provides a real-time monitoring dashboard for manipulation detection across the platform's epistemic systems. The dashboard aggregates threat indicators from [/manipulation-detect](/commands/manipulation-detect/), displays active protection status from [/manipulation-protect](/commands/manipulation-protect/), and visualizes the manipulation threat landscape across all monitored channels and agents.

This command operates under the **L2+** authority level and is executed by the `manipulation-detector` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L2+ authority level provides broad access to manipulation monitoring while restricting configuration changes to operators with higher clearance.

The Prismatic Platform's manipulation detection system monitors for epistemic attacks -- attempts to distort the platform's knowledge base, compromise agent decision-making, or inject false information into intelligence streams. These attacks are categorized using a comprehensive taxonomy derived from the [Color-Team](/glossary/color-teams/) security framework, where the [Red Team](/glossary/red-team/) simulates epistemic attacks and the [Blue Team](/glossary/blue-team/) develops defensive responses. The manipulation dashboard provides the Blue Team's operational view of the current threat landscape.

The dashboard tracks five primary manipulation categories: truth distortion (attempts to alter established facts), confidence manipulation (attempts to inflate or deflate certainty scores), signal poisoning (injection of false signals into intelligence streams), drift induction (gradual, sub-threshold deviation from baseline behavior), and salience hijacking (misdirection of attention to irrelevant targets). Each category has dedicated detection algorithms, and the dashboard provides per-category threat indicators alongside aggregate threat levels.

## Architecture

The dashboard system aggregates detection signals from multiple monitoring points and renders them through a unified threat visualization interface.

### Dashboard Architecture

```
/manipulation-dashboard -> Signal Aggregator -> Threat Analyzer -> View Renderer
                                |                    |                   |
                                v                    v                   v
                          Detection Events     Threat Scoring      LiveView Web
                          Agent Reports        Pattern Analysis    Terminal CLI
                          Drift Metrics        Correlation Engine  JSON API
                          Protection Status    Historical Trend    Alert Feed
```

### Threat Indicator Categories

| Category | Detection Method | Indicator Type | Severity Range |
|----------|-----------------|----------------|----------------|
| **Truth Distortion** | Fact verification against knowledge base | Contradiction rate, source deviation | LOW - CRITICAL |
| **Confidence Manipulation** | Statistical analysis of confidence distributions | Score variance, artificial clustering | LOW - HIGH |
| **Signal Poisoning** | Source validation, plurality checks | False signal ratio, source anomalies | MEDIUM - CRITICAL |
| **Drift Induction** | Baseline comparison, trend analysis | Drift velocity, deviation magnitude | LOW - HIGH |
| **Salience Hijacking** | Attention distribution analysis | Focus concentration, topic deviation | LOW - MEDIUM |

### Dashboard Components

| Component | Data Source | Refresh Rate | Description |
|-----------|------------|--------------|-------------|
| **Threat Level Indicator** | All detectors | Real-time | Aggregate threat level (GREEN/YELLOW/ORANGE/RED) |
| **Category Breakdown** | Per-category scores | 10 seconds | Individual threat level per manipulation type |
| **Active Alerts** | Detection events | Real-time | Current unresolved manipulation alerts |
| **Protection Status** | `/manipulation-protect` | 30 seconds | Active defenses and their status |
| **Agent Health Monitor** | Agent telemetry | 60 seconds | Per-agent manipulation resilience scores |
| **Historical Trend** | Event history | 5 minutes | Threat level trend over configurable period |
| **Signal Quality Index** | NABLA metrics | 60 seconds | Intelligence signal quality and plurality |
| **Technique Taxonomy** | Detection classification | On detection | Identified techniques mapped to taxonomy |

### Threat Level Definitions

| Level | Color | Threshold | Meaning | Response |
|-------|-------|-----------|---------|----------|
| **NOMINAL** | GREEN | Score < 0.2 | No detected manipulation activity | Normal operations |
| **ELEVATED** | YELLOW | Score 0.2-0.5 | Possible manipulation indicators detected | Increased monitoring |
| **HIGH** | ORANGE | Score 0.5-0.8 | Probable manipulation activity in progress | Active investigation |
| **CRITICAL** | RED | Score > 0.8 | Confirmed manipulation attack underway | Defense activation |

## Usage

```bash
# Open the manipulation dashboard
/manipulation-dashboard

# Open with specific view
/manipulation-dashboard --view=threats
/manipulation-dashboard --view=agents
/manipulation-dashboard --view=historical

# Filter by threat category
/manipulation-dashboard --category=truth-distortion
/manipulation-dashboard --category="signal-poisoning,drift-induction"

# Filter by severity
/manipulation-dashboard --severity=high
/manipulation-dashboard --severity="high,critical"

# Show specific agent monitoring
/manipulation-dashboard --agent=sig-osint-commander

# Show historical trend
/manipulation-dashboard --view=historical --period=7d

# Export threat snapshot
/manipulation-dashboard --export=json --output=threat-snapshot.json
/manipulation-dashboard --export=pdf --output=threat-report.pdf

# Set custom alert thresholds
/manipulation-dashboard --alert-threshold=0.6

# Terminal-only compact view
/manipulation-dashboard --compact

# Watch mode with audio alerts
/manipulation-dashboard --watch --alert-sound

# Correlation analysis view
/manipulation-dashboard --view=correlation --sources="all"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--view` | string | overview | View mode: overview, threats, agents, historical, correlation, protection |
| `--category` | string | all | Threat category filter (comma-separated) |
| `--severity` | string | all | Severity filter: low, medium, high, critical |
| `--agent` | string | all | Filter by specific agent |
| `--period` | string | 24h | Historical view period: 1h, 6h, 24h, 7d, 30d |
| `--export` | string | none | Export format: json, pdf, csv, markdown |
| `--output` | string | auto | Export file path |
| `--alert-threshold` | float | 0.5 | Custom alert threshold (0.0-1.0) |
| `--compact` | flag | false | Compact terminal output |
| `--watch` | flag | false | Continuous monitoring mode |
| `--alert-sound` | flag | false | Enable audio alerts for critical threats |
| `--refresh` | integer | 5 | Dashboard refresh interval in seconds |
| `--show-resolved` | flag | false | Include resolved alerts |
| `--sources` | string | all | Signal source filter |

## Execution Flow

1. **Signal Collection**: The dashboard aggregates detection signals from all monitoring points: agent behavior monitors, intelligence signal validators, confidence distribution analyzers, drift detectors, and attention pattern trackers.

2. **Threat Scoring**: Collected signals are scored against the threat model. Each signal contributes to category-specific threat scores and the aggregate threat level. Scoring uses exponential decay to weight recent signals more heavily.

3. **Pattern Analysis**: The correlation engine analyzes signal patterns to identify coordinated manipulation attempts that span multiple categories. A truth distortion combined with confidence manipulation may indicate a sophisticated attack that individual category detectors would score as low-severity.

4. **Alert Generation**: When threat scores exceed configured thresholds, alerts are generated with the detected technique classification, affected scope (agent, channel, domain), confidence level, and recommended response actions.

5. **Protection Status Integration**: Current protection status from [/manipulation-protect](/commands/manipulation-protect/) is integrated into the dashboard, showing which defenses are active, their coverage scope, and their effectiveness metrics.

6. **View Rendering**: The selected view is rendered with current data. The overview shows all components simultaneously. Specific views (threats, agents, historical) provide focused, detailed views of individual aspects.

7. **Real-Time Updates**: Through LiveView WebSocket connections, the dashboard pushes updates to all connected clients as new signals arrive, threat scores change, or alerts are generated. No polling is required.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `manipulation-detector` | Signal aggregation and visualization |
| [/manipulation-detect](/commands/manipulation-detect/) | Detection engine | Primary detection signals feed dashboard |
| [/manipulation-protect](/commands/manipulation-protect/) | Defense status | Active protection status display |
| [/manipulation-techniques](/commands/manipulation-techniques/) | Technique reference | Taxonomy for detected technique classification |
| [Color-Team](/glossary/color-teams/) | Security framework | Red/Blue team findings integrated |
| [NABLA Framework](/glossary/nabla-infinity/) | Signal quality | Epistemic health metrics from NABLA |
| [LiveView](/glossary/liveview/) | Web rendering | Real-time dashboard via WebSocket |
| [Telemetry](/glossary/telemetry/) | Event stream | Detection events and performance metrics |
| [/emergency](/commands/emergency/) | Crisis response | Critical threat triggers emergency protocol |
| [/dark-ops](/commands/dark-ops/) | Structural analysis | Deep epistemic crisis detection |

## Best Practices

**Monitor the dashboard during intelligence operations.** Active OSINT collection and analysis sessions are the highest-risk periods for manipulation attempts. Keep the dashboard visible during [/investigate](/commands/investigate/) operations.

**Investigate YELLOW threats promptly.** Elevated threat levels often precede more severe attacks. Early investigation at the YELLOW stage can prevent escalation to ORANGE or RED.

**Use correlation view for sophisticated attacks.** Simple manipulation attempts trigger single-category alerts. Sophisticated attacks spread across categories and are only visible in the correlation view.

**Review historical trends weekly.** Gradual drift is designed to evade point-in-time detection. Weekly historical trend review reveals slow-moving manipulation attempts that daily monitoring might miss.

**Configure agent-specific thresholds.** High-value agents (intelligence commanders, deal analysts) warrant lower alert thresholds than routine operational agents. Customize thresholds based on agent sensitivity.

**Export snapshots for incident response.** When a manipulation event is detected, immediately export a dashboard snapshot with `--export=json`. This preserves the complete threat state for post-incident analysis.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `no_detection_data` | Detection system not running | Verify `/manipulation-detect` is active |
| `signal_aggregation_timeout` | Signal sources not responding | Check system health, restart detectors |
| `liveview_connection_lost` | WebSocket connection dropped | Refresh browser to reconnect |
| `export_failed` | Cannot write export file | Check file path and permissions |
| `threshold_invalid` | Alert threshold outside valid range | Use value between 0.0 and 1.0 |
| `agent_not_found` | Specified agent not in monitoring scope | Verify agent name or add to monitoring |

## Advanced Usage

### Automated Alert Response

Configure automated responses to manipulation alerts.

```bash
# Auto-activate protection on HIGH threat
/manipulation-dashboard --auto-protect --threshold=high

# Auto-escalate to emergency on CRITICAL
/manipulation-dashboard --auto-escalate --threshold=critical

# Custom alert workflow
/manipulation-dashboard --alert-webhook=https://alerts.internal/manipulation
```

### Multi-System Correlation

Correlate manipulation signals with external security events.

```bash
# Correlate with SIEM data
/manipulation-dashboard --view=correlation --external-feed=siem-events.json

# Correlate with network anomalies
/manipulation-dashboard --view=correlation --network-feed=anomalies.json
```

### Custom Detection Rules

Add custom manipulation detection rules to the dashboard.

```bash
# Add custom indicator
/manipulation-dashboard --add-indicator --name="custom-drift" \
  --source="agent-telemetry" --condition="confidence_variance > 0.3"

# List custom indicators
/manipulation-dashboard --list-indicators
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The dashboard displays all available threat data or explicitly indicates which data sources are unavailable. No manipulation signal is silently dropped.
- **NO DOUBTS**: Full investigation before action, evidence-based results. All threat indicators include confidence scores and source provenance. Alert classifications reference specific taxonomy entries with evidence chains.

## Related Commands

- [/manipulation-detect](/commands/manipulation-detect/) - Detect manipulation attempts using epistemic analysis
- [/manipulation-protect](/commands/manipulation-protect/) - Activate manipulation protection defenses
- [/manipulation-techniques](/commands/manipulation-techniques/) - View manipulation technique taxonomy and counter-measures
- [/emergency](/commands/emergency/) - Emergency response and crisis management activation
- [/archer-supreme](/commands/archer-supreme/) - Supreme authority activation for platform-wide operations
- [/dark-ops](/commands/dark-ops/) - NABLA structural crisis detection and dark operations analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)