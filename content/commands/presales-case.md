+++
title = "/presales-case"
weight = 1890
[extra]
category = "Presales"
description = "Presales case management for status tracking and updates"
syntax = "/presales-case [options]"
authority = "L2+"
agent = "presales-coordinator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1200
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["presales-case", "Presales", "commands", "Prismatic Platform", "Case", "Proposal", "Lead"]
tags = ["commands", "presales", "presales-case", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/presales-case - Prismatic Platform"
+++

## Overview

**/presales-case** is a production command in the **Presales** category of the Prismatic Platform that provides comprehensive case management capabilities for tracking, updating, and coordinating presales activities across the entire opportunity lifecycle. The command serves as the central coordination hub for all presales operations, maintaining a structured record of opportunity intelligence, technical assessments, pricing analyses, competitive research, and proposal status for each active presales engagement.

The case management system implements a structured state machine that tracks opportunities through defined lifecycle stages: Lead, Qualified, Assessment, Proposal, Negotiation, Won, Lost, and Deferred. At each stage, the command enforces data completeness requirements and triggers appropriate downstream workflows. For example, transitioning from Qualified to Assessment automatically initiates a technical feasibility check via [/presales-assess](/commands/presales-assess/), and transitioning to Proposal verifies that pricing analysis has been completed via [/presales-price](/commands/presales-price/).

This command operates under the **L2+** authority level and is executed by the `presales-coordinator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The presales coordinator agent manages cross-command orchestration, ensuring that all presales activities for a given opportunity are properly linked, sequenced, and tracked.

The case management approach ensures that institutional knowledge about opportunities is preserved across sessions and team members. Every analysis, assessment, pricing decision, and competitive insight is stored as part of the case record, creating a comprehensive audit trail that supports decision-making, lessons-learned analysis, and win/loss reviews. This persistence is particularly valuable in long-cycle presales engagements where opportunities may span weeks or months.

## Architecture

The case management architecture implements a stateful entity model with event sourcing for full audit traceability.

```
Case Entity                Event Store               View Layer
┌──────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Case State Machine│    │ Event Log        │    │ Case Dashboard  │
│ (FSM)            │───>│ (Append-Only)    │───>│ (LiveView)      │
│                  │    │                  │    │                 │
│ Lead ──> Qualified│    │ CaseCreated      │    │ Status Overview │
│   ──> Assessment │    │ StageTransitioned│    │ Activity Feed   │
│   ──> Proposal   │    │ AnalysisAdded    │    │ Document Links  │
│   ──> Negotiation│    │ AssessmentLinked  │    │ Team Members    │
│   ──> Won/Lost   │    │ PriceCalculated  │    │ Timeline View   │
└──────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         v                       v                       v
   Workflow Engine         Storage Layer            Notification
   (Stage Triggers)       (PostgreSQL +            Engine
                           ETS Cache)              (Alerts/Email)
```

The event sourcing pattern means that the case state is derived from the complete sequence of events that have occurred. This provides several advantages: full audit trail without additional logging, the ability to reconstruct case state at any point in time, and natural support for undo operations by replaying events up to a specific point.

The Workflow Engine monitors stage transitions and triggers appropriate actions. Each stage has defined entry conditions (what must be true before entering), actions (what happens upon entry), and exit conditions (what must be complete before leaving). This ensures that the presales process follows the organization's methodology and that no critical steps are skipped.

## Usage

### Case Creation and Management

```bash
# Create new presales case
/presales-case --create --company "Acme Corp" --opportunity "EASM Platform Deployment"

# Create with initial classification
/presales-case --create --company "Acme Corp" --opportunity "Security Monitoring" \
  --value 500000 --probability 40 --stage qualified

# List all active cases
/presales-case --list

# List cases filtered by stage
/presales-case --list --stage proposal --sort-by value
```

### Case Updates

```bash
# Update case stage
/presales-case --id "CASE-2026-042" --stage assessment

# Add notes to case
/presales-case --id "CASE-2026-042" --note "Met with CTO, positive reception"

# Update opportunity value and probability
/presales-case --id "CASE-2026-042" --value 750000 --probability 65

# Add team member to case
/presales-case --id "CASE-2026-042" --add-member "jan@example.com" --role technical-lead
```

### Case Review and Reporting

```bash
# View detailed case status
/presales-case --id "CASE-2026-042" --detail

# View case history (all events)
/presales-case --id "CASE-2026-042" --history

# Generate pipeline report
/presales-case --report --type pipeline --format pdf

# Win/loss analysis
/presales-case --report --type win-loss --range 90d
```

### Case Search and Analytics

```bash
# Search cases by company
/presales-case --search --company "Acme"

# Filter by value range
/presales-case --list --min-value 100000 --max-value 1000000

# Pipeline analytics
/presales-case --analytics --by-stage --by-industry
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--create` | flag | false | Create new presales case |
| `--id` | string | none | Case identifier for operations |
| `--company` | string | none | Company name |
| `--opportunity` | string | none | Opportunity description |
| `--value` | integer | 0 | Estimated opportunity value (EUR) |
| `--probability` | integer | 0 | Win probability percentage (0-100) |
| `--stage` | enum | lead | Case stage: lead, qualified, assessment, proposal, negotiation, won, lost, deferred |
| `--note` | string | none | Add note to case |
| `--list` | flag | false | List cases |
| `--search` | flag | false | Search cases |
| `--detail` | flag | false | Show detailed case information |
| `--history` | flag | false | Show case event history |
| `--report` | flag | false | Generate report |
| `--type` | enum | summary | Report type: summary, pipeline, win-loss, forecast |
| `--analytics` | flag | false | Show pipeline analytics |
| `--by-stage` | flag | false | Group analytics by stage |
| `--by-industry` | flag | false | Group analytics by industry |
| `--add-member` | string | none | Add team member email |
| `--role` | enum | none | Member role: lead, technical-lead, sales, executive |
| `--sort-by` | enum | updated | Sort: updated, created, value, probability, stage |
| `--range` | duration | all | Time range for reports |
| `--format` | enum | table | Output: table, json, html, pdf |
| `--output` | path | stdout | Output file path |
| `--min-value` | integer | 0 | Minimum value filter |
| `--max-value` | integer | none | Maximum value filter |

## Execution Flow

The case management command operates differently depending on the action requested.

**Create Flow** (< 1 second): A new case entity is instantiated with a unique identifier (CASE-YYYY-NNN format), the provided metadata is validated, and the initial CaseCreated event is persisted. The case enters the Lead stage by default unless a different starting stage is specified. If the starting stage is beyond Lead, the system verifies that the prerequisites for that stage are met.

**Update Flow** (< 1 second): For stage transitions, the system validates that the exit conditions of the current stage are satisfied and the entry conditions of the target stage are met. If validation passes, a StageTransitioned event is recorded, and any stage-entry workflows are triggered. For metadata updates (value, probability, notes), the corresponding events are appended and the materialized view is updated.

**Query Flow** (< 500ms): List and search operations query the materialized case view in PostgreSQL with ETS caching for frequently accessed cases. Full-text search across case notes and activity logs uses the Meilisearch integration. Analytics queries aggregate pipeline data across all cases with configurable grouping dimensions.

**Report Generation Flow** (1-5 seconds): Reports aggregate case data according to the selected report type. Pipeline reports show current pipeline state with stage distribution and weighted value. Win/loss reports analyze closed cases for patterns. Forecast reports project future revenue based on pipeline probability weighting.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/presales](/commands/presales/) | Parent Command | Top-level presales orchestration |
| [/presales-analyze](/commands/presales-analyze/) | Data Source | Analysis results linked to cases |
| [/presales-assess](/commands/presales-assess/) | Workflow Trigger | Auto-triggered at Assessment stage |
| [/presales-price](/commands/presales-price/) | Workflow Trigger | Required before Proposal stage |
| [/presales-propose](/commands/presales-propose/) | Workflow Trigger | Proposal generation from case data |
| [/presales-research](/commands/presales-research/) | Data Enrichment | Competitive research linked to cases |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | `presales-coordinator` agent |
| [Prismatic Storage](/apps/prismatic-storage/) | Persistence | Case data, events, documents |
| [Telemetry](/glossary/telemetry/) | Observability | Case lifecycle metrics |

## Best Practices

**Create Cases Early**: Create a case as soon as an opportunity is identified, even before detailed analysis. This establishes the tracking record and ensures that all subsequent intelligence gathering is properly linked.

**Maintain Stage Discipline**: Follow the stage progression faithfully. Skipping stages (e.g., jumping from Lead to Proposal) bypasses important validation steps and may result in incomplete proposals or missed risks.

**Add Notes Consistently**: Use `--note` to record meeting outcomes, stakeholder reactions, and competitive insights as they occur. These notes become invaluable during proposal writing and win/loss reviews.

**Track Probability Honestly**: Update the win probability based on actual signals, not optimism. Honest probability tracking enables accurate pipeline forecasting and resource allocation decisions.

**Review Pipeline Weekly**: Run `/presales-case --report --type pipeline` weekly to identify stalled opportunities, assess pipeline health, and prioritize activities across active cases.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Case ID not found | Error with suggestion | Verify ID or use `--search` |
| Invalid stage transition | Error with valid transitions | Follow allowed stage progression |
| Missing stage prerequisites | Error with unmet requirements | Complete prerequisite activities |
| Duplicate case creation | Warning with existing case ID | Use existing case or rename |
| Storage unavailable | Queue operations for retry | Operations replayed on recovery |
| Report generation timeout | Partial report with warning | Narrow time range or scope |

## Advanced Usage

### Pipeline Forecasting

```bash
# Generate weighted pipeline forecast
/presales-case --report --type forecast --range 90d --format pdf

# Monthly revenue projection
/presales-case --analytics --forecast --monthly --format json
```

### Bulk Operations

```bash
# Update multiple cases (e.g., mark stale leads as deferred)
/presales-case --bulk-update --filter "stage=lead AND updated < 60d" \
  --stage deferred --note "Auto-deferred: no activity for 60 days"

# Export all cases for external reporting
/presales-case --export --format csv --output pipeline-export.csv
```

### Integration with OSINT

```bash
# Link investigation results to case
/presales-case --id "CASE-2026-042" --link-investigation INV-2026-015

# Run company OSINT and link to case
/investigate --company "Acme Corp" --link-case "CASE-2026-042"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Stage transitions enforce strict prerequisites -- no shortcuts. Every case must have complete data before advancing. Win/loss reviews are mandatory for closed cases to capture lessons learned.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Case stage progression requires evidence of completed activities. Probability estimates must be justified by observable signals. The [NABLA](/glossary/nabla-infinity/) axiom of Provenance Mandatory ensures every case decision is traceable through the event log.

## Related Commands

- [/presales](/commands/presales/) - Presales intelligence for company analysis and opportunity identification
- [/presales-analyze](/commands/presales-analyze/) - Text, file and URL analysis for presales opportunity assessment
- [/presales-assess](/commands/presales-assess/) - Technical assessment of opportunities and cases
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)