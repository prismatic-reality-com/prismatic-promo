+++
title = "/rebrief"
weight = 1510
[extra]
category = "Session"
description = "Retrospective analysis of development activity across multiple sessions"
syntax = "/rebrief [options]"
authority = "L2+"
agent = "session-context-synthesizer"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1173
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["rebrief", "Retrospective", "commands", "Session", "Prismatic Platform", "Step", "Trend", "Analysis"]
tags = ["commands", "session", "rebrief", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/rebrief - Prismatic Platform"
+++

## Overview

**/rebrief** is a production command in the **Session** category of the Prismatic Platform that performs retrospective analysis of development activity across multiple sessions. Unlike the forward-looking [/debrief](/commands/debrief/) command which summarizes a single session's work, `/rebrief` synthesizes patterns, trends, and insights from a configurable window of historical sessions, providing strategic visibility into the platform's evolution trajectory.

The rebrief command addresses a critical knowledge management challenge in long-running development efforts. When a platform spans 90+ applications and accumulates hundreds of session contexts over weeks or months, individual session summaries become insufficient for understanding the broader narrative. What features have been steadily progressing? Which areas show recurring issues? Where are quality metrics trending? The rebrief command answers these strategic questions by performing cross-session pattern analysis and trend detection.

At its core, the rebrief engine processes session context files stored in `.claude/session-context/`, extracting structured data about objectives achieved, files modified, decisions made, and quality metrics recorded. It then applies temporal analysis to identify trends, clustering algorithms to group related activities, and anomaly detection to highlight sessions that deviated significantly from established patterns.

This command operates under the **L2+** authority level and is executed by the `session-context-synthesizer` agent, which specializes in cross-session knowledge synthesis and temporal pattern recognition. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The rebrief system is built on a three-layer architecture that separates data collection, analysis, and presentation concerns.

```
Session Context Store (.claude/session-context/)
    |
    v
[Collection Layer] --> Parse, Normalize, Index
    |
    v
[Analysis Layer]
    +---> Trend Detection (quality, velocity, coverage)
    +---> Pattern Clustering (related activities, themes)
    +---> Anomaly Detection (deviation from baselines)
    +---> Decision Tracking (architectural choices, trade-offs)
    |
    v
[Presentation Layer] --> Summary, Timeline, Recommendations
    |
    v
Rebrief Report
```

The collection layer scans session context files matching the configured time window and parses them into a normalized internal representation. Each session is decomposed into its constituent elements: objectives, actions, file modifications, deliverables, decisions, quality metrics, and next steps.

The analysis layer applies multiple analytical lenses to the normalized session data. Trend detection uses linear regression and moving averages to identify directional changes in quality scores, test coverage, and development velocity. Pattern clustering groups sessions by their dominant activity type (feature development, bug fixing, refactoring, infrastructure) to reveal the allocation of development effort over time.

## Usage

```bash
# Rebrief of the last 7 sessions (default)
/rebrief

# Rebrief with specific time window
/rebrief --window=30d

# Rebrief focused on a specific area
/rebrief --focus=prismatic_perimeter

# Rebrief with quality trend analysis
/rebrief --trends=quality

# Rebrief with decision log extraction
/rebrief --decisions

# Rebrief comparing two time periods
/rebrief --compare=2026-01-01:2026-01-15,2026-01-16:2026-01-31

# Rebrief with JSON output for CI integration
/rebrief --format=json

# Comprehensive rebrief with all analyses
/rebrief --full --trends=all --decisions --anomalies
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--window` | string | 7 sessions | Time window: number of sessions or duration (e.g., `30d`, `2w`) |
| `--focus` | string | all | Focus on specific application or domain |
| `--trends` | enum | none | Trend analysis: `quality`, `velocity`, `coverage`, `all` |
| `--decisions` | boolean | false | Extract and display decision log |
| `--anomalies` | boolean | false | Highlight anomalous sessions |
| `--compare` | string | - | Compare two time periods (format: `start:end,start:end`) |
| `--format` | enum | text | Output format: `text`, `json`, `markdown` |
| `--full` | boolean | false | Enable all analysis modes |
| `--depth` | enum | summary | Analysis depth: `summary`, `detailed`, `exhaustive` |
| `--include-metrics` | boolean | true | Include quantitative metrics in output |
| `--export` | string | - | Export rebrief report to specified file path |
| `--baseline` | string | - | Custom baseline session for comparison |

## Execution Flow

The rebrief command follows a systematic execution flow designed to maximize insight extraction while maintaining reasonable execution times even across large session histories.

**Step 1 - Session Discovery**: The engine scans `.claude/session-context/` for session files matching the configured time window. Files are sorted chronologically and validated for structural integrity. Malformed or incomplete session files are flagged but do not halt the analysis.

**Step 2 - Data Extraction**: Each session file is parsed to extract structured data including objectives, completed actions, files modified (with change magnitude), quality metrics at session start and end, decisions made with their rationale, and documented next steps.

**Step 3 - Normalization**: Extracted data is normalized to enable cross-session comparison. File paths are canonicalized, quality metrics are scaled to a consistent range, and temporal references are resolved to absolute timestamps.

**Step 4 - Analysis Execution**: The configured analysis modes execute against the normalized data. Trend detection computes slopes and inflection points. Pattern clustering applies k-means or hierarchical clustering to session feature vectors. Anomaly detection identifies sessions whose metrics deviate more than two standard deviations from the rolling mean.

**Step 5 - Synthesis**: Analysis results are synthesized into a coherent narrative. The synthesis engine identifies the most significant findings, ranks them by impact, and generates actionable recommendations based on detected patterns.

**Step 6 - Report Generation**: The final report is formatted according to the specified output mode and either displayed directly or exported to the configured file path.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `session-context-synthesizer` | Specialized in cross-session knowledge synthesis |
| [/debrief](/commands/debrief/) | Complementary command | Debrief handles single sessions; rebrief handles multiple |
| [/session-compress](/commands/session-compress/) | Data source | Compressed sessions provide efficient historical access |
| [/session-track](/commands/session-track/) | GitLab integration | Session tracking data enriches rebrief analysis |
| [Quality DNA](/glossary/quality-gates/) | Quality trends | Quality DNA state files provide historical quality metrics |
| [Telemetry](/glossary/telemetry/) | Execution metrics | Rebrief execution itself is tracked via telemetry |
| [AIAD](/glossary/aiad/) Registry | Command specification | Registered as a Session category command |

## Best Practices

Run a rebrief at the start of each significant development session, particularly after breaks of more than a day. The retrospective context provided by the rebrief command is invaluable for re-establishing situational awareness and ensuring that new work builds coherently on previous efforts.

Use the `--focus` flag when working on a specific application to filter out noise from unrelated development activity. A focused rebrief on `prismatic_perimeter` before starting EASM work, for example, surfaces all relevant context without requiring manual scanning of session files.

Leverage the `--compare` mode during milestone reviews to quantify progress. Comparing the first and second halves of a milestone period reveals whether development velocity is accelerating or decelerating, whether quality is improving or degrading, and whether the team's focus is aligned with the milestone's objectives.

Export rebrief reports in JSON format for integration with external analysis tools. The structured output includes all raw metrics alongside the synthesized conclusions, enabling custom visualizations and deeper analysis beyond what the built-in presentation layer provides.

## Error Handling

The rebrief command handles errors gracefully at multiple levels. Missing or corrupted session files are skipped with a warning rather than causing the entire analysis to fail. When the configured time window contains no session files, the command reports this clearly and suggests adjusting the window parameters.

Analysis-level errors, such as insufficient data points for trend detection or clustering, are reported as limitations in the output rather than as failures. The rebrief engine operates on a best-effort basis, providing whatever analysis is possible with the available data and explicitly noting where data gaps limit the conclusions.

```
REBRIEF WARNING
Window: Last 30 days (3 sessions found)
Limitation: Insufficient data points for trend analysis (minimum 5 required)
Available analyses: Pattern clustering, Decision log, Session summaries
Suggestion: Expand window with --window=90d or use --depth=summary
```

## Advanced Usage

Advanced rebrief operations support custom analysis pipelines and integration with the platform's formal reasoning capabilities.

```bash
# Rebrief with custom analysis pipeline
/rebrief --pipeline=quality-regression-analysis --window=60d

# Rebrief feeding into reasoning command
/rebrief --format=json --export=/tmp/rebrief.json
/reasoning --evidence=@/tmp/rebrief.json --mode=abductive

# Rebrief with milestone alignment check
/rebrief --milestone=M46 --alignment-check

# Historical rebrief for post-mortem analysis
/rebrief --window=2026-01-01:2026-01-15 --depth=exhaustive --anomalies
```

The rebrief command also supports template-based report generation for standardized milestone reviews, sprint retrospectives, and progress reports. Custom templates can be defined in `.claude/templates/rebrief/` and selected with the `--template` flag.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The rebrief command processes all available sessions within the configured window. No session is silently ignored and no data point is discarded without explicit reporting.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Rebrief conclusions are grounded in quantitative metrics extracted from actual session data. Trend claims include confidence intervals and anomaly flags ensure that unusual patterns are surfaced rather than smoothed over.

## Related Commands

- [/debrief](/commands/debrief/) - Comprehensive session debrief with platform state analysis and changelog detection
- [/session-compress](/commands/session-compress/) - Advanced session context compression with multi-session pattern detection
- [/session-track](/commands/session-track/) - Session tracking actions for GitLab integration and progress monitoring
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format
- [/connect](/commands/connect/) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)