+++
title = "/estimate"
weight = 980
[extra]
category = "Operations"
description = "Task estimation with AI-powered complexity analysis"
syntax = "/estimate [options]"
authority = "L2+"
agent = "estimator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1137
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["estimate", "Task", "AI-powered", "commands", "Operations", "Prismatic Platform", "Estimation", "GitLab", "Include"]
tags = ["commands", "operations", "estimate", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/estimate - Prismatic Platform"
+++

## Overview

**/estimate** is a production command in the **Operations** category of the Prismatic Platform. It provides AI-powered task estimation with complexity analysis, enabling teams to make informed decisions about resource allocation, sprint planning, and delivery timelines. The command leverages the platform's deep understanding of the codebase architecture, historical change patterns, and dependency graphs to produce estimates that are grounded in empirical evidence rather than intuition.

Traditional software estimation suffers from systematic bias -- developers consistently underestimate complexity, particularly for tasks that involve cross-cutting concerns, unfamiliar subsystems, or cascading dependency changes. The `/estimate` command addresses this by combining static analysis of the codebase with historical data from previous similar changes, producing calibrated estimates with explicit confidence intervals.

The [estimator](@/agents/estimator.md) agent powers this command, applying multiple estimation methodologies simultaneously: function point analysis for scope quantification, dependency impact analysis for ripple-effect estimation, historical analogy matching for calibration against past deliveries, and complexity scoring based on cyclomatic and cognitive complexity metrics. The results are synthesized into a unified estimate with transparent methodology attribution.

This command operates under the **L2+** authority level and is executed by the `estimator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L2+ authority level means any operational agent or higher can invoke estimation, making it accessible across the development workflow.

## Architecture

The estimation system operates through a multi-model architecture that combines static analysis with historical learning:

```
Task Description --> Complexity Analyzer --> Dependency Mapper --> Historical Matcher
                          |                       |                      |
                    AST Analysis            Dependency Graph        Change History
                          |                       |                      |
                    Complexity Score         Impact Radius          Analogy Score
                          \                       |                      /
                           \                      |                     /
                            --> Estimation Synthesizer --> Calibrated Estimate
                                       |
                                 Confidence Interval
```

**Complexity Analyzer**: Parses the target modules using AST analysis to compute cyclomatic complexity, cognitive complexity, module coupling, and function density. For Elixir code, it evaluates pattern match depth, guard clause complexity, and GenServer callback structure.

**Dependency Mapper**: Traverses the umbrella application dependency graph to identify the blast radius of proposed changes. A change to a core module like `prismatic_storage_core` has a fundamentally different impact profile than a change to a leaf application.

**Historical Matcher**: Searches the git history for analogous changes -- similar file patterns, similar complexity profiles, similar dependency impacts -- and uses their actual durations as calibration anchors for the current estimate.

**Estimation Synthesizer**: Combines all signals using a weighted ensemble approach, producing a point estimate with P50, P80, and P95 confidence intervals.

## Usage

### Basic Estimation

```bash
# Estimate a described task
/estimate "Add rate limiting to the API gateway"

# Estimate changes to a specific module
/estimate --module=PrismaticApi.RateLimiter

# Estimate a GitLab issue
/estimate --issue=1259
```

### Detailed Analysis

```bash
# Get full complexity breakdown
/estimate "Implement NIS2 compliance checks" --verbose

# Estimate with dependency impact analysis
/estimate --module=PrismaticPerimeter.SecurityRating --include-deps

# Compare multiple estimation approaches
/estimate "Migrate ETS storage to Horde" --compare-methods
```

### Sprint Planning

```bash
# Estimate multiple tasks for sprint planning
/estimate --batch="issue:1259,issue:1260,issue:1261"

# Generate estimation report for a milestone
/estimate --milestone=M46 --format=table

# Estimate with team velocity calibration
/estimate "Build visitor intelligence dashboard" --calibrate-velocity
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--module` | string | none | Target specific Elixir module for change estimation |
| `--issue` | string | none | Estimate based on GitLab issue description |
| `--milestone` | string | none | Estimate all open issues in a milestone |
| `--batch` | string | none | Comma-separated list of estimation targets |
| `--verbose` | flag | false | Include detailed complexity and dependency breakdown |
| `--include-deps` | flag | false | Include transitive dependency impact in estimate |
| `--compare-methods` | flag | false | Show estimates from each methodology separately |
| `--calibrate-velocity` | flag | false | Adjust estimate based on historical team velocity |
| `--confidence` | string | p80 | Confidence level for estimate (p50, p80, p95) |
| `--format` | string | text | Output format (text, json, table, markdown) |
| `--risk-factors` | flag | false | Include explicit risk factor analysis |
| `--breakdown` | flag | false | Show task decomposition with sub-estimates |

## Execution Flow

The `/estimate` command follows a structured 5-phase estimation pipeline:

1. **Task Decomposition**: The input task description is decomposed into atomic work units. For module-targeted estimates, the decomposition follows the module's public API surface. For issue-based estimates, the decomposition extracts actionable requirements from the issue description.

2. **Static Analysis**: Each work unit is analyzed against the current codebase. The analyzer identifies which files would likely need modification, computes their complexity metrics, and maps their dependency relationships. This phase leverages [git trees](@/glossary/git-trees.md) for efficient codebase traversal.

3. **Impact Assessment**: The dependency mapper computes the blast radius -- how many modules, tests, and configurations would be affected by the proposed changes. Cross-application dependencies in the umbrella structure receive particular attention.

4. **Historical Calibration**: Past changes with similar profiles are retrieved from git history and used to calibrate the raw estimate. The system accounts for estimation drift by comparing previous estimates (when available) against actual durations.

5. **Synthesis & Reporting**: All signals are combined into a calibrated estimate with confidence intervals. The output includes the point estimate, confidence bounds, key risk factors, and the methodology attribution showing which estimation signals contributed most strongly.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Estimator agent performs multi-model analysis |
| [Git Trees](@/glossary/git-trees.md) | Data Source | Codebase structure and file analysis |
| GitLab API | Data Source | Issue descriptions, milestone metadata, historical velocity |
| [Quality Gates](@/glossary/quality-gates.md) | Calibration | Quality requirements inflate estimates for high-coverage areas |
| [Telemetry](@/glossary/telemetry.md) | Tracking | Estimation accuracy [metrics](@/glossary/metrics.md) and calibration data |
| AIAD Registry | Discovery | Command specification and agent binding |
| [SEADF](@/glossary/seadf.md) | Evolution | Estimation models evolve based on accuracy feedback |

## Best Practices

**Always include dependency impact for cross-cutting changes**: Changes that touch core libraries like [prismatic_storage_core](@/apps/prismatic-storage-core.md) or [prismatic](@/apps/prismatic.md) have non-obvious ripple effects. Use `--include-deps` to capture these.

**Use P80 confidence for planning, P95 for commitments**: The P50 estimate represents the optimistic scenario. Use P80 for sprint planning and P95 when making external delivery commitments.

**Calibrate against historical velocity**: First-time estimates on a new codebase area will have wide confidence intervals. Use `--calibrate-velocity` to ground estimates in actual delivery history.

**Decompose large tasks before estimating**: Estimation accuracy degrades for tasks spanning more than 3-5 days. Break large features into smaller work units and estimate each independently.

**Review risk factors**: The `--risk-factors` flag surfaces specific technical risks that could cause estimate overruns, such as unfamiliar subsystems, high coupling, or insufficient test coverage.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `MODULE_NOT_FOUND` | Target module does not exist in the codebase | Verify module name and application |
| `ISSUE_NOT_ACCESSIBLE` | GitLab issue cannot be retrieved | Check GitLab token and project configuration |
| `INSUFFICIENT_HISTORY` | Not enough historical data for calibration | Use raw estimate without calibration, note wider confidence intervals |
| `COMPLEXITY_ANALYSIS_TIMEOUT` | Module too complex for analysis within timeout | Decompose into smaller modules or increase analysis timeout |
| `DEPENDENCY_CYCLE_DETECTED` | Circular dependency prevents impact analysis | Resolve dependency cycle before estimation |

## Advanced Usage

### Custom Estimation Models

```bash
# Register a domain-specific estimation model
/estimate --register-model=security-features \
  --weight-factors="compliance:2.0,testing:1.5,documentation:1.3"

# Apply estimation model to a specific domain
/estimate "Implement ZKB compliance" --model=security-features
```

### Estimation Retrospectives

```bash
# Compare estimate vs actual for completed issues
/estimate --retrospective --milestone=M45

# Generate estimation accuracy report
/estimate --accuracy-report --period=30d --format=json
```

### Integration with Evolution

The estimation system participates in the platform's [evolution](@/commands/evolve.md) cycle. Estimation models are treated as evolvable artifacts -- accuracy feedback from completed tasks is used to automatically tune model weights and calibration factors across generations.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for unsupported estimates. Every estimate must be backed by analysis artifacts -- complexity scores, dependency maps, historical analogies. No hand-waving, no gut-feel numbers.
- **NO DOUBTS**: Full investigation before estimation. The estimator agent exhaustively analyzes the relevant codebase areas, dependency relationships, and historical patterns before producing an estimate. Confidence intervals are mandatory.

The evidence-based approach to estimation directly embodies the [NABLA Infinity](@/glossary/nabla-infinity.md) axioms: signal plurality (multiple estimation methods), provenance mandatory (methodology attribution), and unknown valid (explicit confidence intervals acknowledging uncertainty).

## Related Commands

- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/connect](@/commands/connect.md) - MCP server connection management across 14+ servers
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/focus](@/commands/focus.md) - Strategic focus management and priority coordination
- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)