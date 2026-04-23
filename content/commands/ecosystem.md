+++
title = "/ecosystem"
weight = 1970
[extra]
category = "Framework"
description = "Platform ecosystem overview and status monitoring"
syntax = "/ecosystem [options]"
authority = "L2+"
agent = "ecosystem-coordinator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1046
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ecosystem", "Platform", "commands", "Framework", "Prismatic Platform", "AIAD", "Show", "Architecture"]
tags = ["commands", "framework", "ecosystem", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ecosystem - Prismatic Platform"
+++

## Overview

**/ecosystem** is a production command in the **Framework** category of the Prismatic Platform that provides a comprehensive real-time overview of the entire platform ecosystem, including all umbrella applications, agents, commands, quality metrics, and infrastructure status. The platform consists of nearly 100 OTP applications, over 400 [AIAD](/glossary/aiad/) agents, and 216 slash commands, making a unified visibility tool essential for understanding the health and state of the system at any point in time.

This command operates under the **L2+** authority level and is executed by the `ecosystem-coordinator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the AIAD (Autonomous Intelligence Agent Design) standard. The ecosystem coordinator agent aggregates status information from multiple sources, including OTP application supervisors, the AIAD registry, the quality gate system, and the [telemetry](/glossary/telemetry/) infrastructure.

Understanding the ecosystem as a whole is critical for making informed decisions about where to invest development effort, which components are healthy, and where bottlenecks or degradation might be occurring. The `/ecosystem` command replaces the need to manually query multiple subsystems and synthesizes their outputs into a single coherent view.

## Architecture

The ecosystem monitoring system is structured as a multi-source aggregation pipeline that collects status data from every major platform subsystem and presents it through a unified interface.

### Data Collection Architecture

| Source | Method | Data Provided |
|--------|--------|--------------|
| **OTP Applications** | `Application.started_applications/0` | App list, versions, dependency tree |
| **AIAD Registry** | Registry ETS scan | Agent count, command count, status |
| **Quality Gates** | `mix quality.gates --json` | Score per domain, overall composite |
| **Telemetry** | `:telemetry` event aggregation | Request rates, error rates, latencies |
| **Git Repository** | `git ls-tree` | File counts, recent changes, LOC |
| **Supervision Trees** | `Supervisor.which_children/1` | Process health, restart counts |
| **ETS Tables** | `:ets.info/1` | Memory usage, table sizes |

### Aggregation Pipeline

```
OTP Apps ----+
AIAD Registry --+
Quality Gates ---+--> Aggregator --> Scorer --> Formatter --> Output
Telemetry ------+         |
Git Repo -------+         v
Supervision ----+    Health Engine
ETS Tables -----+    (composite score)
```

### Health Scoring Model

The ecosystem health score is a weighted composite of individual subsystem health indicators.

| Domain | Weight | Healthy Threshold | Critical Threshold |
|--------|--------|-------------------|-------------------|
| **Compilation** | 20% | 0 warnings | Any warning |
| **Test Suite** | 20% | 100% pass | < 95% pass |
| **Quality Score** | 20% | 95+ / 100 | < 80 / 100 |
| **Agent Availability** | 15% | > 98% agents responsive | < 90% agents responsive |
| **Process Health** | 15% | 0 abnormal restarts | > 5 restarts in 10 min |
| **Memory Usage** | 10% | < 80% of allocation | > 95% of allocation |

## Usage

```bash
# Full ecosystem overview
/ecosystem

# Show only application status
/ecosystem --apps

# Show only agent status
/ecosystem --agents

# Show only quality metrics
/ecosystem --quality

# Show infrastructure health
/ecosystem --infrastructure

# Generate machine-readable output
/ecosystem --format=json

# Show detailed view of a specific subsystem
/ecosystem --detail=prismatic_web

# Compare ecosystem state over time
/ecosystem --history --since="2026-01-01"

# Show dependency graph
/ecosystem --deps

# Quick health check only
/ecosystem --health
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--apps` | flag | false | Show only umbrella application status |
| `--agents` | flag | false | Show only AIAD agent status |
| `--quality` | flag | false | Show only quality gate metrics |
| `--infrastructure` | flag | false | Show infrastructure health metrics |
| `--detail` | string | none | Detailed view of a specific subsystem |
| `--deps` | flag | false | Display dependency graph |
| `--health` | flag | false | Quick composite health check |
| `--history` | flag | false | Show ecosystem metrics over time |
| `--since` | date | 30 days ago | Start date for history view |
| `--format` | string | text | Output format: text, json, markdown, table |
| `--verbose` | flag | false | Include per-component details |
| `--sort` | string | name | Sort order: name, health, size, activity |
| `--filter` | string | none | Filter components by pattern |

## Execution Flow

1. **Source Discovery**: The ecosystem coordinator identifies all available data sources by scanning OTP applications, the AIAD registry, and the infrastructure configuration.

2. **Parallel Collection**: Status data is collected from all sources in parallel using `Task.async_stream` for optimal performance. Each source has a configurable timeout (default 5 seconds) to prevent slow sources from blocking the overall report.

3. **Data Normalization**: Raw data from heterogeneous sources is normalized into a common schema with standardized health indicators (healthy, degraded, critical, unknown).

4. **Health Scoring**: The composite health score is calculated from individual subsystem scores using the weighted model described in the Architecture section.

5. **Trend Analysis**: If historical data is available, trends are computed for key metrics including quality score, test pass rate, agent availability, and compilation status.

6. **Report Generation**: The normalized data, health scores, and trend analysis are formatted into the requested output format.

7. **Telemetry Emission**: The ecosystem status itself is recorded as a telemetry event for historical tracking.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `ecosystem-coordinator` | Aggregates status from all agents |
| [AIAD Registry](/glossary/aiad/) | Agent and command inventory | Source of agent/command counts and status |
| [Quality Gates](/glossary/quality-gates/) | Quality metrics source | 13 quality domains with scores |
| [Telemetry](/glossary/telemetry/) | Metrics aggregation | Runtime performance and health metrics |
| [SEADF](/glossary/seadf/) | Evolution status | Self-evolution subsystem health |
| [Session Lifecycle](/glossary/session-discipline/) | Session tracking | Active session count and health |
| [Git Trees](/commands/git-trees/) | Codebase metrics | File counts, LOC, recent changes |
| OTP Supervision | Process health | Supervisor tree status and restart counts |

## Best Practices

**Start sessions with ecosystem check.** Running `/ecosystem --health` at the beginning of a development session provides immediate awareness of the platform state. This is especially valuable after pulling changes from other contributors.

**Monitor trends, not just snapshots.** The `--history` option reveals whether the ecosystem is improving or degrading over time. A slowly declining quality score that is still above threshold is more concerning than a momentary dip that recovers quickly.

**Use detail mode for investigation.** When the overview shows a degraded subsystem, use `--detail=subsystem_name` to drill into the specific component and identify the root cause.

**Integrate with CI/CD.** Use `/ecosystem --format=json --health` as a CI pipeline stage to automatically block deployments when the ecosystem health drops below acceptable levels.

**Track agent availability.** With over 400 agents, availability monitoring catches configuration issues, missing dependencies, and process crashes that might otherwise go unnoticed until a dependent command fails.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `source_timeout` | A data source did not respond within timeout | Source is marked as "unknown" in report; investigate the specific subsystem |
| `no_applications_running` | OTP applications not started | Ensure the Prismatic application is running (`iex -S mix`) |
| `aiad_registry_unavailable` | AIAD registry ETS table not initialized | Run `./.aiad/bin/aiad index` to rebuild the registry |
| `quality_gates_failed` | Quality gate check command returned error | Run `mix quality.gates` directly to see detailed errors |
| `insufficient_history` | Not enough historical data for trend analysis | Accumulate more data points or reduce `--since` window |
| `invalid_subsystem` | `--detail` references non-existent subsystem | Use `--apps` to list valid subsystem names |

## Advanced Usage

### Ecosystem Comparison Across Branches

Compare ecosystem health between the current branch and main to assess the impact of in-progress work.

```bash
# Snapshot current state
/ecosystem --format=json --output=branch-state.json

# Switch to main and compare
git stash && git checkout main
/ecosystem --format=json --output=main-state.json
git checkout - && git stash pop

# Compare the two snapshots
/ecosystem --compare=main-state.json,branch-state.json
```

### Custom Health Thresholds

Override default health thresholds for specific environments or quality standards.

```bash
# Stricter thresholds for production readiness
/ecosystem --health --threshold="quality:98,tests:100,warnings:0"

# Relaxed thresholds for development branches
/ecosystem --health --threshold="quality:80,tests:90"
```

### Automated Ecosystem Reports

Generate periodic ecosystem reports for stakeholder communication.

```bash
# Weekly ecosystem report
/ecosystem --format=markdown --history --since="7 days ago" --output=weekly-report.md

# Monthly comprehensive report
/ecosystem --format=html --verbose --history --since="30 days ago" --output=monthly-report.html
```

### SEADF Integration

Feed ecosystem data directly into the SEADF evolution engine for autonomous improvement targeting.

```bash
/ecosystem --format=json | mix seadf.ingest --source=ecosystem-status
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Ecosystem monitoring exposes every quality gap without hiding uncomfortable truths.
- **NO DOUBTS**: Full investigation before action, evidence-based results. All health scores are computed from verifiable data sources with full provenance.

## Related Commands

- [/seadf](/commands/seadf/) - Self-Evolving Autonomous Development Framework control and monitoring
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/git-trees](/commands/git-trees/) - Git tree-based codebase exploration at ~100x speed improvement
- [/inject](/commands/inject/) - AIAD injection coordination for pattern and agent deployment
- [/integrate](/commands/integrate/) - Cross-system integration design and implementation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)