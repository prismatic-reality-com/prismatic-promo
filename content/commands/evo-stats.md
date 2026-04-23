+++
title = "/evo-stats"
weight = 2080
[extra]
category = "Framework"
description = "Evolution statistics and metrics reporting"
syntax = "/evo-stats [options]"
authority = "L2+"
agent = "evolution-orchestrator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1170
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["evo-stats", "Evolution", "commands", "Framework", "Prismatic Platform", "Quality DNA"]
tags = ["commands", "framework", "evo-stats", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/evo-stats - Prismatic Platform"
+++

## Overview

**/evo-stats** is a production command in the **Framework** category of the Prismatic Platform. It provides comprehensive evolution statistics and [metrics](/glossary/metrics/) reporting, giving operators deep visibility into the platform's autonomous evolution trajectory across all 18 generations. The command aggregates data from every evolution cycle, quality gate checkpoint, and fitness evaluation to produce actionable intelligence about the platform's evolutionary health.

The Prismatic Platform operates on a biological evolution metaphor where the codebase, agents, patterns, and quality standards undergo continuous generational improvement. Each generation represents a measurable fitness improvement across multiple dimensions: code quality, test coverage, agent capability, pattern diversity, and architectural coherence. The `/evo-stats` command is the primary observability tool for this evolutionary process, transforming raw evolution data into structured reports that inform strategic decisions.

Understanding evolution statistics is essential for maintaining the platform's upward trajectory. Without visibility into fitness trends, mutation rates, and selection pressures, the evolution system risks stagnation or regression. The `/evo-stats` command surfaces early warning signals when fitness gains plateau, when specific quality domains lag behind others, or when evolution cycles are not producing meaningful improvements.

This command operates under the **L2+** authority level and is executed by the `evolution-orchestrator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The evolution statistics system aggregates data from multiple platform subsystems into a unified reporting pipeline:

```
Evolution Engine --> Fitness Evaluator --> Metrics Aggregator --> Report Generator
      |                    |                      |                     |
 Generation DB       Quality Scores          Time Series           Visualization
      |                    |                      |                     |
 Gen 1..18 Data     13 Quality Domains      Trend Analysis        Charts/Tables
      \                    |                      /                     |
       --> Statistics Synthesizer --> Dashboard --> Output Formatter
                    |
              Anomaly Detector
```

**Fitness Evaluator**: Computes multi-dimensional fitness scores across the platform's 13 quality domains (Dialyzer, Credo, Compilation, DateTime Precision, Guard Functions, @impl Coverage, Memory Safety, Performance, Regression Prevention, Timing Patterns, TODO Management, Typespec Coverage, Unsafe Map Access). Each domain contributes a normalized score to the overall platform fitness.

**Metrics Aggregator**: Collects evolution metrics from all subsystems including the [SEADF](/glossary/seadf/) framework, [quality gates](/glossary/quality-gates/), [mycelial network](/glossary/mycelial-network/), and [Quality DNA](/glossary/quality-dna/) persistence layer. Metrics are stored as time series for trend analysis.

**Anomaly Detector**: Monitors evolution metrics for anomalous patterns -- fitness regressions, stalled evolution cycles, quality domain divergence, or unusual mutation rates. Anomalies trigger alerts that surface in the report.

**Report Generator**: Produces structured reports in multiple formats (text, JSON, table, markdown) with configurable detail levels from executive summary to full diagnostic drill-down.

## Usage

### Quick Status Check

```bash
# Display current evolution status summary
/evo-stats

# Show current generation fitness
/evo-stats --current

# Brief one-line status
/evo-stats --brief
```

### Detailed Analysis

```bash
# Full evolution history across all generations
/evo-stats --full-history

# Quality domain breakdown for current generation
/evo-stats --domains --verbose

# Fitness trend analysis over last 5 generations
/evo-stats --trend --generations=5

# Compare two specific generations
/evo-stats --compare --gen1=15 --gen2=18
```

### Reporting

```bash
# Generate JSON report for CI/CD integration
/evo-stats --format=json --output=evolution-report.json

# Weekly evolution digest
/evo-stats --digest --period=7d

# Full evolution report with anomaly detection
/evo-stats --report --include-anomalies --format=markdown
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--current` | flag | false | Show only current generation statistics |
| `--brief` | flag | false | One-line summary of evolution status |
| `--full-history` | flag | false | Complete evolution history across all generations |
| `--domains` | flag | false | Quality domain breakdown with per-domain scores |
| `--trend` | flag | false | Fitness trend analysis with trajectory projection |
| `--generations` | integer | 5 | Number of generations to include in trend analysis |
| `--compare` | flag | false | Compare two generations side-by-side |
| `--gen1` | integer | none | First generation for comparison |
| `--gen2` | integer | none | Second generation for comparison |
| `--format` | string | text | Output format (text, json, table, markdown) |
| `--output` | string | stdout | Output file path for report generation |
| `--digest` | flag | false | Generate periodic evolution digest |
| `--period` | string | 7d | Time period for digest generation |
| `--include-anomalies` | flag | false | Include anomaly detection results |
| `--report` | flag | false | Generate comprehensive evolution report |
| `--verbose` | flag | false | Include detailed metrics and diagnostics |

## Execution Flow

The `/evo-stats` command follows a structured 5-phase reporting pipeline:

1. **Data Collection**: The command queries all evolution data sources including the generation database, quality gate results, fitness evaluation history, and mutation logs. Data is collected from both the runtime system (ETS tables) and persistent storage ([Quality DNA](/glossary/quality-dna/) files).

2. **Metric Computation**: Raw data is transformed into computed metrics including fitness scores per domain, inter-generational deltas, moving averages, trend coefficients, and anomaly scores. All computations are deterministic and reproducible.

3. **Trend Analysis**: Time-series analysis is applied to fitness trajectories. The system computes linear regression coefficients for each quality domain, identifies inflection points where fitness gain rates changed, and projects future trajectories based on current momentum.

4. **Anomaly Detection**: Statistical anomaly detection identifies outliers in the evolution data. Sudden fitness drops, stalled evolution cycles, or domain-specific regressions are flagged with severity levels (INFO, WARNING, CRITICAL).

5. **Report Synthesis**: All computed metrics, trends, and anomalies are synthesized into a structured report. The report format adapts to the requested output format and detail level.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Evolution Engine](/glossary/autoevolve/) | Data Source | Generation data, mutation logs, selection results |
| [Quality Gates](/glossary/quality-gates/) | Data Source | Gate pass/fail history, domain scores |
| [Quality DNA](/glossary/quality-dna/) | Persistence | Cross-session evolution state continuity |
| [SEADF](/glossary/seadf/) | Framework | Self-evolving framework status and metrics |
| [Telemetry](/glossary/telemetry/) | Monitoring | Evolution [metrics](/glossary/metrics/) event emission |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Evolution-orchestrator agent performs analysis |
| GitLab API | Reporting | Evolution reports published to GitLab milestones |
| AIAD Registry | Discovery | Command specification and agent binding |

## Best Practices

**Monitor fitness trends, not absolute scores**: A platform at 0.999 fitness has less room for improvement than one at 0.900. Focus on whether the trend is positive and whether gains are distributed across all quality domains rather than concentrated in easy wins.

**Use domain breakdown for targeted improvement**: When overall fitness stalls, the `--domains` view reveals which specific quality domains are lagging. This enables targeted evolution campaigns focused on the weakest domains.

**Compare generations after major changes**: After significant architectural changes or new feature integrations, use `--compare` to verify that the change did not degrade fitness in unexpected domains. Cross-cutting changes often have non-obvious quality impacts.

**Enable anomaly detection in CI/CD**: Include `/evo-stats --include-anomalies --format=json` in CI/CD pipelines to automatically detect evolution regressions. Anomalies with CRITICAL severity should block deployments.

**Archive weekly digests**: Generate and archive weekly evolution digests (`--digest --period=7d`) to maintain a historical record of the platform's evolutionary trajectory. This data is invaluable for long-term trend analysis and strategic planning.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `GENERATION_DATA_MISSING` | Requested generation has no stored data | Verify generation number exists (current: Gen 18) |
| `QUALITY_DNA_UNAVAILABLE` | Quality DNA persistence layer not accessible | Check `.claude/quality-dna/current-state.json` |
| `METRIC_COMPUTATION_TIMEOUT` | Full history analysis exceeds timeout | Use `--generations` to limit analysis scope |
| `ANOMALY_DETECTOR_CALIBRATION` | Insufficient data for statistical anomaly detection | Requires minimum 3 generations of data |
| `FORMAT_UNSUPPORTED` | Requested output format not available | Use supported formats: text, json, table, markdown |

## Advanced Usage

### Custom Metric Dashboards

```bash
# Create a focused dashboard for specific domains
/evo-stats --domains=dialyzer,credo,compilation --trend --format=table

# Export evolution data for external visualization
/evo-stats --export --format=csv --include-raw-metrics

# Generate evolution heat map across all domains and generations
/evo-stats --heatmap --generations=all --format=html
```

### Evolution Forecasting

```bash
# Project fitness trajectory for next 3 generations
/evo-stats --forecast --horizon=3 --confidence=0.80

# Identify evolution bottlenecks
/evo-stats --bottleneck-analysis --verbose
```

### Integration with Autoevolve

The `/evo-stats` command is a critical input to the [autoevolve](/glossary/autoevolve/) system. Evolution statistics inform the `mix autoevolve.mega` command's strategy selection, helping it decide which quality domains to target and what mutation strategies to apply. When `/evo-stats` reports fitness stagnation in a domain, the autoevolve system increases mutation pressure in that domain.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for unmonitored evolution. Every evolution cycle must produce measurable, reported statistics. No blind evolution -- every generation must demonstrate its fitness contribution through quantified metrics.
- **NO DOUBTS**: Full investigation before declaring fitness improvements. Statistics are computed from comprehensive data sources, not sampled or approximated. All reported metrics are deterministic and reproducible.

The evolution statistics system embodies the [NABLA Infinity](/glossary/nabla-infinity/) principle of provenance mandatory -- every fitness claim is traceable to specific quality domain measurements, and every trend projection includes explicit confidence intervals and methodology attribution.

## Related Commands

- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle and GitLab [observability](/glossary/observability/)
- [/evolve-enforced](/commands/evolve-enforced/) - Evolution with mandatory QDP reduction
- [/evolve-patterns](/commands/evolve-patterns/) - Pattern evolution through meta-evolution analysis
- [/evolve-quality-gates](/commands/evolve-quality-gates/) - Quality gate evolution for warnings, tests and static analysis
- [/seadf](/commands/seadf/) - Self-Evolving Autonomous Development Framework control and monitoring
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)