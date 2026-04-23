+++
title = "/ma-status"
weight = 780
[extra]
category = "M&A Operations"
description = "M&A deal pipeline status overview and progress tracking"
syntax = "/ma-status [options]"
authority = "L2+"
agent = "ma-status-tracker"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1221
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ma-status", "pipeline", "status", "overview", "progress", "tracking", "commands", "M&A Operations", "Prismatic Platform", "Deal"]
tags = ["commands", "m&a-operations", "ma-status", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ma-status - Prismatic Platform"
+++

## Overview

**/ma-status** is a production command in the **M&A Operations** category of the Prismatic Platform that provides detailed pipeline status reporting, individual deal progress tracking, and operational health monitoring for the M&A operations suite. While [/ma-dashboard](/commands/ma-dashboard/) provides a visual, real-time interface optimized for interactive monitoring, the `/ma-status` command delivers structured, programmatic status output optimized for automation, scripting, and rapid command-line access.

This command operates under the **L2+** authority level and is executed by the `ma-status-tracker` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L2+ authority level provides broad read access to pipeline status while protecting sensitive deal details that require higher clearance.

The status tracker maintains a comprehensive view of every deal's position within its lifecycle, the progress of each analytical domain, the completeness of intelligence collection, the compliance posture against enforcement rules, and the overall health of the M&A pipeline. This information is derived from the deal registry, analysis engine, intelligence collection system, and enforcement monitor, aggregated into a unified status model that can be queried at multiple levels of detail.

The `/ma-status` command serves as the primary data source for automated workflows that respond to deal state changes. CI/CD pipelines can query deal status to trigger automated report generation. Monitoring systems can poll pipeline health to detect stalled deals. Integration systems can extract deal metrics for external reporting. The JSON output mode ensures that status data is immediately consumable by programmatic clients.

## Architecture

The status tracking system aggregates state from multiple M&A subsystems and presents it through a unified query interface.

### Status Architecture

```
/ma-status -> State Aggregator -> Query Engine -> Formatter -> Output
                    |                  |              |           |
                    v                  v              v           v
              Deal Registry       Deal Query      Text View    stdout
              Analysis State      Pipeline Query  JSON View    File
              Intel Tracker       Health Query    Table View   Pipe
              Enforce State       Metric Query    CSV View     API
              Telemetry Data      History Query
```

### Status Levels

| Level | Scope | Output | Use Case |
|-------|-------|--------|----------|
| **Pipeline** | All deals | Summary table, aggregate metrics | Daily overview |
| **Deal** | Single deal | Detailed progress across all domains | Deal management |
| **Domain** | Analysis domain | Domain-specific progress and findings | Analyst review |
| **Health** | System health | Component availability, performance | System monitoring |
| **Metrics** | Portfolio metrics | KPIs, conversion rates, velocity | Performance tracking |

### Pipeline Metrics

| Metric | Definition | Typical Range |
|--------|-----------|---------------|
| **Deal Count** | Total active deals in pipeline | 5-50 |
| **Pipeline Value** | Sum of estimated deal values | Variable |
| **Conversion Rate** | Screening to Active ratio | 30-60% |
| **Average Deal Age** | Mean time since creation | 30-180 days |
| **Overdue Deals** | Deals with missed deadlines | 0-5 |
| **Intelligence Coverage** | Deals with complete intel | 70-95% |
| **Analysis Completion** | Deals with full analysis | 50-80% |
| **Compliance Score** | Deals passing all rules | 80-100% |

## Usage

```bash
# Pipeline overview (default)
/ma-status

# Detailed status for specific deal
/ma-status DEAL-2026-001

# Pipeline status in JSON format
/ma-status --format=json

# Filter by deal state
/ma-status --state=active
/ma-status --state="screening,active,negotiation"

# Filter by priority
/ma-status --priority=critical

# Show domain-level progress for a deal
/ma-status DEAL-2026-001 --detail=domains

# Show intelligence collection status
/ma-status DEAL-2026-001 --detail=intel

# Show compliance status
/ma-status DEAL-2026-001 --detail=compliance

# Show enforcement warnings and blocks
/ma-status DEAL-2026-001 --detail=enforcement

# System health check
/ma-status --health

# Pipeline metrics
/ma-status --metrics --period=quarter

# Historical status snapshot
/ma-status --as-of="2026-01-15"

# Export pipeline status
/ma-status --format=csv --output=pipeline-status.csv

# Watch mode (continuous updates)
/ma-status --watch --interval=10

# Brief one-line summary per deal
/ma-status --brief

# Show deal timeline
/ma-status DEAL-2026-001 --detail=timeline
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `deal_id` | string | none | Specific deal to query (positional) |
| `--state` | string | all | Filter by deal state (comma-separated) |
| `--priority` | string | all | Filter by priority level |
| `--detail` | string | summary | Detail level: summary, domains, intel, compliance, enforcement, timeline, all |
| `--format` | string | text | Output format: text, json, csv, markdown |
| `--output` | string | stdout | Output file path |
| `--health` | flag | false | Show system health status |
| `--metrics` | flag | false | Show pipeline metrics |
| `--period` | string | month | Metrics period: week, month, quarter, year, all |
| `--as-of` | string | now | Historical status timestamp |
| `--watch` | flag | false | Continuous status updates |
| `--interval` | integer | 30 | Watch mode refresh interval in seconds |
| `--brief` | flag | false | One-line summary per deal |
| `--sort` | string | priority | Sort: priority, value, age, deadline, state, confidence |
| `--group-by` | string | none | Group by: state, priority, industry, geography, team |
| `--include-closed` | flag | false | Include completed and terminated deals |

## Execution Flow

1. **Scope Determination**: The system determines the query scope based on provided parameters. A deal ID queries a single deal. Filters narrow the pipeline view. No parameters returns the full active pipeline.

2. **State Aggregation**: Current state is aggregated from all M&A subsystems in parallel: deal registry for lifecycle state, analysis engine for domain progress, intelligence tracker for collection status, and enforcement monitor for compliance posture.

3. **Filter Application**: Filters (state, priority, industry) are applied to the aggregated dataset. Only deals matching all specified filters are included in the output.

4. **Metric Computation**: If metrics are requested, aggregate pipeline metrics are computed: deal counts, conversion rates, average deal age, pipeline value, compliance scores, and velocity indicators.

5. **Detail Expansion**: If detail level is specified (domains, intel, compliance), additional data is loaded for the matching deals. Domain detail includes per-domain analysis progress and findings summary. Intel detail includes collection status per source category. Compliance detail includes active warnings, blocks, and overrides.

6. **Sorting and Grouping**: Results are sorted according to the `--sort` parameter and grouped according to `--group-by`. Default sorting places critical/high priority deals first.

7. **Format Rendering**: Results are rendered in the requested format. Text format produces human-readable tables. JSON format produces structured data for programmatic consumption. CSV format produces importable spreadsheet data.

8. **Output Delivery**: Results are written to stdout, file, or returned through the API depending on the output configuration.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `ma-status-tracker` | State aggregation and query processing |
| [/ma-create](/commands/ma-create/) | Deal source | New deals tracked from creation |
| [/ma-analyze](/commands/ma-analyze/) | Analysis progress | Domain progress from analysis engine |
| [/ma-dashboard](/commands/ma-dashboard/) | Visual complement | Status data feeds dashboard display |
| [/ma-enforce](/commands/ma-enforce/) | Compliance status | Enforcement status included in deal view |
| [/ma-report](/commands/ma-report/) | Report triggers | Status changes can trigger reports |
| [/investigate](/commands/investigate/) | Intel status | Intelligence collection tracking |
| [Quality Gates](/glossary/quality-gates/) | Quality status | Gate pass/fail status per deal |
| [Telemetry](/glossary/telemetry/) | Activity data | Event history for deals |

## Best Practices

**Use brief mode for quick pipeline scans.** The `--brief` flag produces a compact one-line-per-deal output that can be scanned in seconds. Use this for quick daily checks before diving into specific deals.

**Use JSON format for automation.** Any workflow that programmatically responds to deal status should use `--format=json` to get structured, parseable output. Avoid parsing text format output in scripts.

**Monitor overdue deals daily.** Use `--sort=deadline` to surface deals approaching or past their deadlines. Overdue deals indicate process bottlenecks or resource constraints that need attention.

**Track metrics weekly.** Pipeline metrics (conversion rates, velocity, compliance scores) reveal trends that are invisible in individual deal status. Weekly metric reviews catch pipeline-level issues early.

**Use watch mode during active periods.** During deal negotiations or closing windows, `--watch` mode provides continuous visibility without repeated manual queries.

**Export status for stakeholder updates.** Use `--format=csv` or `--format=markdown` to generate status exports that can be directly inserted into email updates or stakeholder presentations.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `deal_not_found` | Deal ID does not exist | List all deals with `/ma-status` to find correct ID |
| `no_deals_matching` | No deals match applied filters | Broaden filters or check filter values |
| `aggregation_timeout` | State aggregation exceeded timeout | Check system health with `--health` |
| `historical_unavailable` | Requested as-of date predates records | Use more recent date |
| `watch_interrupted` | Watch mode connection lost | Restart watch mode |
| `export_failed` | Cannot write to output path | Verify directory permissions |

## Advanced Usage

### Pipeline Health Monitoring

Set up automated health checks for the M&A pipeline.

```bash
# Comprehensive health check
/ma-status --health --format=json

# Specific health domains
/ma-status --health --check="registry,analysis,intel,enforce"

# Health check with alerting thresholds
/ma-status --health --alert-if="overdue_deals > 3 OR compliance_score < 80"
```

### Custom Metric Dashboards

Build custom metric views for specific stakeholder needs.

```bash
# Financial metrics summary
/ma-status --metrics --focus="pipeline_value,avg_deal_size,conversion_rate" --period=quarter

# Team productivity metrics
/ma-status --metrics --focus="deals_per_analyst,analysis_speed,report_turnaround" --group-by=team

# Time-series comparison
/ma-status --metrics --period=month --compare="2025-Q3,2025-Q4,2026-Q1"
```

### Integration with CI/CD

Use status queries in automated pipelines.

```bash
# Check if deal is ready for next stage
/ma-status DEAL-2026-001 --format=json | jq '.ready_for_transition'

# Get list of deals needing attention
/ma-status --state=active --sort=deadline --brief --format=json | jq '.deals[] | select(.overdue)'

# Pipeline KPI extraction for reporting
/ma-status --metrics --format=json --output=kpi-data.json
```

### Historical Analysis

Analyze pipeline evolution over time.

```bash
# Monthly pipeline snapshots
for month in 01 02 03; do
  /ma-status --as-of="2026-${month}-01" --format=json --output="pipeline-2026-${month}.json"
done

# Compare pipeline state across quarters
/ma-status --metrics --compare="2025-10-01,2026-01-01" --format=markdown
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Status queries return complete, accurate data or explicitly report which data sources are unavailable. No silent data gaps are permitted.
- **NO DOUBTS**: Full investigation before action, evidence-based results. All status metrics are derived from verified data sources. Historical status is based on recorded state transitions, not reconstructions.

## Related Commands

- [/ma-create](/commands/ma-create/) - Create new M&A deal with target profiling and initial assessment
- [/ma-analyze](/commands/ma-analyze/) - Comprehensive M&A analysis including financial, legal and operational review
- [/ma-report](/commands/ma-report/) - Generate detailed M&A analysis report with visualizations
- [/ma-dashboard](/commands/ma-dashboard/) - M&A deal pipeline dashboard with real-time status tracking
- [/ma-enforce](/commands/ma-enforce/) - M&A enforcement actions for deal compliance and deadline tracking
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)