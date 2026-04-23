+++
title = "/ma-dashboard"
weight = 770
[extra]
category = "M&A Operations"
description = "M&A deal pipeline dashboard with real-time status tracking"
syntax = "/ma-dashboard [options]"
authority = "L2+"
agent = "ma-report-generator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1340
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ma-dashboard", "pipeline", "dashboard", "real-time", "status", "tracking", "commands", "M&A Operations", "Prismatic Platform", "Deal"]
tags = ["commands", "m&a-operations", "ma-dashboard", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ma-dashboard - Prismatic Platform"
+++

## Overview

**/ma-dashboard** is a production command in the **M&A Operations** category of the Prismatic Platform that provides a comprehensive, real-time dashboard view of the entire M&A deal pipeline. The dashboard aggregates deal status, financial summaries, timeline progress, intelligence collection status, and risk indicators across all active deals into a unified visual interface that gives M&A operators immediate situational awareness of the complete deal portfolio.

This command operates under the **L2+** authority level and is executed by the `ma-report-generator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L2+ authority level allows broad access to pipeline visibility while restricting sensitive deal details to operators with appropriate clearance.

The M&A dashboard integrates data from every component of the M&A operations suite. Deals created through [/ma-create](@/commands/ma-create.md) appear in the pipeline immediately. Analysis progress from [/ma-analyze](@/commands/ma-analyze.md) is reflected in real-time. Compliance status from [/ma-enforce](@/commands/ma-enforce.md) is surfaced as warning indicators. Intelligence collection status from [/investigate](@/commands/investigate.md) and related OSINT commands is tracked per-deal. The result is a single command that provides complete M&A portfolio visibility without requiring operators to query individual deal records.

The dashboard is built on Phoenix [LiveView](@/glossary/liveview.md) and renders as a real-time web interface when accessed through the platform's web layer, or as a formatted terminal report when invoked from the command line. LiveView's server-side rendering ensures that dashboard updates are pushed to all connected clients in real time as deal states change, analyses complete, or enforcement actions fire.

## Architecture

The dashboard system aggregates data from multiple M&A subsystems and renders it through configurable view components.

### Dashboard Architecture

```
/ma-dashboard -> Data Aggregator -> View Renderer -> Output Handler
                      |                  |                |
                      v                  v                v
                Deal Registry       Pipeline View     LiveView (web)
                Analysis Status     Kanban Board      Terminal (CLI)
                Intel Tracker       Timeline View     JSON (API)
                Enforce Status      Financial Summary  PDF (export)
                Telemetry Data      Risk Matrix
```

### Dashboard Components

| Component | Data Source | Refresh Rate | Description |
|-----------|------------|--------------|-------------|
| **Pipeline Overview** | Deal Registry | Real-time | Deal count by state, conversion funnel |
| **Kanban Board** | Deal States | Real-time | Visual deal cards organized by lifecycle stage |
| **Financial Summary** | Analysis Results | On update | Aggregate deal values, investment required |
| **Timeline Tracker** | Deal Milestones | Hourly | Deadline proximity, overdue alerts |
| **Intelligence Status** | OSINT Results | On completion | Collection progress per deal |
| **Risk Matrix** | Analysis Confidence | On update | Deal risk vs. strategic value scatter |
| **Compliance Monitor** | Enforcement Status | Real-time | Compliance violations and warnings |
| **Activity Feed** | Telemetry Events | Real-time | Recent actions across all deals |

### View Modes

| Mode | Description | Best For |
|------|-------------|----------|
| **Pipeline** | Horizontal funnel showing deal progression | Executive overview |
| **Kanban** | Card-based board with drag-and-drop state transitions | Deal management |
| **Timeline** | Gantt-style view with milestones and deadlines | Schedule management |
| **Financial** | Valuation ranges, investment totals, ROI projections | Financial review |
| **Risk** | Risk-value matrix with confidence indicators | Risk assessment |
| **Detail** | Single-deal deep dive with all associated data | Deal analysis |

## Usage

```bash
# Open the default pipeline dashboard
/ma-dashboard

# Open specific view mode
/ma-dashboard --view=kanban
/ma-dashboard --view=timeline
/ma-dashboard --view=financial
/ma-dashboard --view=risk

# Filter by deal state
/ma-dashboard --state=active
/ma-dashboard --state="active,negotiation"

# Filter by priority
/ma-dashboard --priority=critical

# Filter by industry
/ma-dashboard --industry="Enterprise SaaS"

# View specific deal detail
/ma-dashboard --deal=DEAL-2026-001

# Export dashboard snapshot
/ma-dashboard --export=pdf --output=pipeline-snapshot.pdf
/ma-dashboard --export=json --output=pipeline-data.json

# Set auto-refresh interval
/ma-dashboard --refresh=30

# Show historical pipeline state
/ma-dashboard --as-of="2026-01-15"

# Compare pipeline state over time
/ma-dashboard --compare="2026-01-01,2026-02-01"

# Terminal-only compact view
/ma-dashboard --compact
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--view` | string | pipeline | View mode: pipeline, kanban, timeline, financial, risk, detail |
| `--state` | string | all | Filter by deal state (comma-separated) |
| `--priority` | string | all | Filter by priority: low, normal, high, critical |
| `--industry` | string | all | Filter by industry classification |
| `--deal` | string | none | Show detail view for specific deal |
| `--export` | string | none | Export format: pdf, json, markdown, csv |
| `--output` | string | auto | Export output file path |
| `--refresh` | integer | 5 | Auto-refresh interval in seconds (LiveView) |
| `--as-of` | string | now | Historical pipeline state timestamp |
| `--compare` | string | none | Comma-separated dates for comparison view |
| `--compact` | flag | false | Compact terminal output |
| `--sort` | string | priority | Sort order: priority, value, deadline, confidence, created |
| `--group-by` | string | state | Grouping: state, industry, geography, priority, team |
| `--show-intel` | flag | true | Show intelligence collection status |
| `--show-compliance` | flag | true | Show compliance status indicators |

## Execution Flow

1. **Data Collection**: The dashboard aggregates data from the deal registry, analysis results store, enforcement tracker, intelligence collection status, and telemetry event stream. All data sources are queried in parallel to minimize dashboard load time.

2. **Filter Application**: If filters are specified (state, priority, industry), the dataset is filtered before rendering. Filters are applied server-side to minimize data transfer.

3. **Metric Computation**: Aggregate metrics are computed from the filtered dataset: total deals by state, total estimated value, average deal age, conversion rates between stages, overdue deadline count, and average confidence score.

4. **View Rendering**: The appropriate view component is selected based on the `--view` parameter. Each view component receives the filtered, computed dataset and renders it according to its visual paradigm (pipeline funnel, kanban cards, Gantt timeline, etc.).

5. **LiveView Connection**: If accessed through the web interface, a LiveView WebSocket connection is established for real-time updates. Deal state changes, analysis completions, and enforcement events are pushed to all connected dashboard clients via PubSub.

6. **Activity Feed Population**: The activity feed is populated from the telemetry event stream, filtered to show only M&A-relevant events. Events are ordered by recency and include deal state transitions, analysis completions, intel collection results, and enforcement actions.

7. **Export Generation**: If `--export` is specified, the current dashboard state is rendered into the requested format and written to the output path. PDF exports include charts and visualizations; JSON exports include the full structured dataset.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `ma-report-generator` | Dashboard rendering and data aggregation |
| [/ma-create](@/commands/ma-create.md) | Deal source | New deals appear in pipeline view |
| [/ma-analyze](@/commands/ma-analyze.md) | Analysis status | Analysis progress and results displayed |
| [/ma-status](@/commands/ma-status.md) | Status data | Detailed status feeds dashboard metrics |
| [/ma-enforce](@/commands/ma-enforce.md) | Compliance status | Enforcement warnings surfaced in dashboard |
| [/ma-report](@/commands/ma-report.md) | Report generation | Dashboard data feeds report generation |
| [/investigate](@/commands/investigate.md) | Intel status | OSINT collection progress per deal |
| [LiveView](@/glossary/liveview.md) | Web rendering | Real-time dashboard updates via WebSocket |
| [Telemetry](@/glossary/telemetry.md) | Activity feed | Event stream for activity tracking |
| [Quality Gates](@/glossary/quality-gates.md) | Data quality | Dashboard data completeness validation |

## Best Practices

**Start each day with the pipeline view.** The pipeline overview provides immediate awareness of deal portfolio health -- how many deals are in each stage, which are approaching deadlines, and which require attention. Make it the first thing you check.

**Use the kanban board for daily deal management.** The kanban view provides the most actionable interface for managing deal flow. Cards can be visually assessed for status, and the grouped layout makes it easy to identify bottlenecks in the deal process.

**Monitor the compliance indicators.** Compliance warnings from [/ma-enforce](@/commands/ma-enforce.md) appear as visual indicators on deal cards. Unaddressed compliance issues escalate over time, so address warnings promptly to prevent deal delays.

**Export weekly snapshots for stakeholder reporting.** Use `--export=pdf` to generate presentation-ready pipeline snapshots for stakeholder meetings. The export includes charts, metrics, and deal summaries appropriate for executive audiences.

**Use historical comparison for trend analysis.** The `--compare` flag allows side-by-side comparison of pipeline state across dates. This reveals trends in deal velocity, conversion rates, and portfolio composition that are invisible in point-in-time views.

**Configure appropriate refresh intervals.** The default 5-second refresh is appropriate for active monitoring sessions. For background monitoring, increase to 30-60 seconds to reduce resource consumption.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `no_active_deals` | Pipeline contains no deals matching filters | Adjust filters or create new deals with `/ma-create` |
| `deal_not_found` | Specified deal ID does not exist | Verify deal ID with `/ma-status` |
| `export_failed` | Cannot generate export in requested format | Check output path permissions and disk space |
| `liveview_connection_lost` | WebSocket connection dropped | Refresh the browser page to reconnect |
| `data_aggregation_timeout` | Data sources took too long to respond | Retry, check system health with `/emergency` |
| `historical_data_unavailable` | Requested as-of date predates deal records | Use a more recent date or check data retention settings |

## Advanced Usage

### Custom Dashboard Layouts

Create saved dashboard configurations for different audiences.

```bash
# Save a custom layout for executive reviews
/ma-dashboard --view=pipeline --show-intel=false --group-by=priority --save-layout=exec-review

# Load saved layout
/ma-dashboard --load-layout=exec-review

# List saved layouts
/ma-dashboard --list-layouts
```

### Multi-Pipeline Views

View deals across different organizational boundaries.

```bash
# View deals by geographic region
/ma-dashboard --group-by=geography --view=financial

# View deals by acquiring entity
/ma-dashboard --group-by=acquirer --view=pipeline

# Cross-team deal comparison
/ma-dashboard --group-by=team --view=risk
```

### Automated Reporting

Schedule recurring dashboard reports.

```bash
# Weekly pipeline report
/ma-dashboard --export=pdf --output=weekly-pipeline.pdf --schedule=weekly

# Daily critical deal alerts
/ma-dashboard --priority=critical --export=json --schedule=daily --notify=team
```

### API Integration

Access dashboard data programmatically for external integrations.

```bash
# Get pipeline metrics as JSON
curl /api/v1/ma/dashboard?format=json

# Get specific deal detail
curl /api/v1/ma/dashboard/DEAL-2026-001

# Stream real-time updates
curl -N /api/v1/ma/dashboard/stream
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The dashboard renders all available data or reports exactly which data sources are unavailable. No silent data gaps are permitted -- missing information is explicitly surfaced.
- **NO DOUBTS**: Full investigation before action, evidence-based results. All metrics displayed on the dashboard are computed from verified data sources with clear provenance. Confidence scores are displayed alongside valuations to prevent false certainty.

## Related Commands

- [/ma-create](@/commands/ma-create.md) - Create new M&A deal with target profiling and initial assessment
- [/ma-analyze](@/commands/ma-analyze.md) - Comprehensive M&A analysis including financial, legal and operational review
- [/ma-report](@/commands/ma-report.md) - Generate detailed M&A analysis report with visualizations
- [/ma-status](@/commands/ma-status.md) - M&A deal pipeline status overview and progress tracking
- [/ma-enforce](@/commands/ma-enforce.md) - M&A enforcement actions for deal compliance and deadline tracking
- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)