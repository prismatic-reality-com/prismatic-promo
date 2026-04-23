+++
title = "/dx-brutalist-analysis"
weight = 2030
[extra]
category = "Framework"
description = "Developer experience brutalist analysis of git history and workflow patterns"
syntax = "/dx-brutalist-analysis [options]"
authority = "L2+"
agent = "dx-brutalist-analyst"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1135
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["dx-brutalist-analysis", "Developer", "commands", "Framework", "Prismatic Platform", "SEADF", "Git Trees", "HIGH"]
tags = ["commands", "framework", "dx-brutalist-analysis", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/dx-brutalist-analysis - Prismatic Platform"
+++

## Overview

**/dx-brutalist-analysis** is a production command in the **Framework** category of the Prismatic Platform that performs unflinching, data-driven analysis of developer experience through git history forensics and workflow pattern detection. The term "brutalist" is deliberate: this command strips away vanity metrics and comfortable narratives to reveal the raw truth about how development actually happens versus how teams believe it happens. It distinguishes genuine progress from mere activity, productive patterns from habitual waste, and real velocity from the illusion of movement.

This command operates under the **L2+** authority level and is executed by the `dx-brutalist-analyst` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The brutalist philosophy extends to the output format: results are presented without softening language or diplomatic hedging. If the data shows that 40% of commits are formatting-only changes that could be automated, the analysis says exactly that.

Developer experience analysis is a critical feedback loop for platform evolution. The Prismatic Platform's [SEADF](@/glossary/seadf.md) (Self-Evolving Autonomous Development Framework) uses DX analysis data to identify workflow friction points, tooling gaps, and process inefficiencies that become targets for autonomous improvement. The brutalist analysis provides the ground truth that feeds the evolution engine.

## Architecture

The analysis engine operates in three phases: data extraction from git history, pattern recognition through statistical analysis, and insight generation through comparison against known anti-patterns and productivity baselines.

### Data Extraction Layer

The extraction layer uses `git log`, `git diff-tree`, and `git shortlog` commands (via the platform's optimized [Git Trees](@/commands/git-trees.md) infrastructure) to build a comprehensive activity dataset without touching the working directory.

| Data Source | Extraction Method | Metrics |
|------------|-------------------|---------|
| **Commit history** | `git log --format` | Frequency, timing, message quality, size |
| **Diff statistics** | `git diff-tree --stat` | Lines added/removed, files changed, churn |
| **Author patterns** | `git shortlog` | Contribution distribution, activity windows |
| **Branch lifecycle** | `git branch --merged` | Branch duration, merge frequency, staleness |
| **File hotspots** | `git log --follow` | Change frequency, co-change coupling |

### Pattern Recognition Engine

The pattern recognition engine applies statistical analysis to detect workflow patterns that correlate with known productivity indicators.

```
Raw Git Data -> Statistical Analysis -> Pattern Matching -> Insight Generation
     |                |                      |                     |
     v                v                      v                     v
  Extraction     Aggregation            Classification         Reporting
  (git ops)     (time series)          (known patterns)     (brutalist output)
```

### Anti-Pattern Catalog

The engine maintains a catalog of known developer experience anti-patterns, each with detection heuristics and severity ratings.

| Anti-Pattern | Detection Signal | Severity |
|-------------|-----------------|----------|
| **Commit theater** | High commit frequency, low net change | HIGH |
| **Review avoidance** | Direct-to-main commits bypassing MR | CRITICAL |
| **Configuration churn** | Repeated changes to same config files | MEDIUM |
| **Test afterthought** | Test files committed separately from implementation | MEDIUM |
| **Big bang merge** | Merge commits with >500 lines changed | HIGH |
| **Zombie branches** | Branches older than 30 days without merge | LOW |
| **Copy-paste drift** | Near-identical changes across multiple files | HIGH |

## Usage

```bash
# Full brutalist analysis of the repository
/dx-brutalist-analysis

# Analyze a specific time period
/dx-brutalist-analysis --since="2026-01-01" --until="2026-02-01"

# Focus on a specific author's patterns
/dx-brutalist-analysis --author="developer@example.com"

# Analyze only specific directories
/dx-brutalist-analysis --path="apps/prismatic_web"

# Generate machine-readable output
/dx-brutalist-analysis --format=json --output=dx-report.json

# Compare two time periods
/dx-brutalist-analysis --compare="2025-Q4,2026-Q1"

# Focus on specific anti-patterns
/dx-brutalist-analysis --patterns="commit-theater,big-bang-merge"

# Quick summary mode
/dx-brutalist-analysis --summary
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--since` | date | 90 days ago | Start date for analysis window |
| `--until` | date | now | End date for analysis window |
| `--author` | string | all | Filter by author email |
| `--path` | string | entire repo | Restrict analysis to specific directory |
| `--format` | string | text | Output format: text, json, markdown, html |
| `--output` | string | stdout | Write results to file |
| `--compare` | string | none | Compare two periods (comma-separated) |
| `--patterns` | string | all | Specific anti-patterns to check |
| `--summary` | flag | false | Show condensed summary only |
| `--verbose` | flag | false | Include per-commit details |
| `--threshold` | float | 0.7 | Pattern detection confidence threshold |
| `--baseline` | string | auto | Baseline period for comparison |

## Execution Flow

1. **Repository Validation**: Verify the current directory is a valid git repository with sufficient history for meaningful analysis. A minimum of 50 commits is recommended.

2. **Data Extraction**: Execute git commands to extract commit history, diff statistics, branch data, and file change patterns within the specified time window. Uses [Git Trees](@/commands/git-trees.md) for optimal performance.

3. **Statistical Aggregation**: Compute time-series metrics including commit frequency distribution, change size distribution, file hotspot scores, and author activity patterns.

4. **Pattern Detection**: Apply the anti-pattern catalog against the aggregated data. Each detected pattern receives a confidence score based on how strongly the data matches the detection heuristic.

5. **Productivity Scoring**: Calculate composite productivity scores across dimensions: velocity (meaningful change rate), quality (test-to-code ratio, revert rate), consistency (commit cadence stability), and collaboration (review participation, knowledge distribution).

6. **Insight Generation**: Synthesize detected patterns and productivity scores into actionable insights. Each insight includes the evidence that supports it and specific recommendations for improvement.

7. **Report Compilation**: Format the complete analysis into the requested output format with sections for summary, detailed findings, anti-pattern alerts, and recommendations.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `dx-brutalist-analyst` | Specialized agent for DX analysis |
| [Git Trees](@/commands/git-trees.md) | Data extraction | ~100x faster than raw git commands |
| [SEADF](@/glossary/seadf.md) | Evolution feedback | Analysis data feeds autonomous improvement |
| [Quality Gates](@/glossary/quality-gates.md) | Quality correlation | Correlates DX patterns with quality outcomes |
| [Telemetry](@/glossary/telemetry.md) | Execution [metrics](@/glossary/metrics.md) | Analysis duration and coverage tracking |
| [AIAD Registry](@/glossary/aiad.md) | Command specification | Analysis command configuration |
| [/git-forensics](@/commands/git-forensics.md) | Complementary analysis | Deeper forensic investigation capability |

## Best Practices

**Run regularly, not reactively.** Schedule DX analysis at consistent intervals (weekly or bi-weekly) rather than waiting for problems to surface. Regular analysis reveals trends that point analyses miss.

**Analyze trends, not snapshots.** A single analysis provides limited value. The `--compare` option reveals whether DX patterns are improving, stable, or degrading over time. This trend data is far more actionable than absolute measurements.

**Avoid blame, focus on systems.** The brutalist output can be uncomfortable when it highlights individual patterns. Use the data to improve processes and tooling, not to evaluate individuals. Poor DX patterns are almost always symptoms of systemic issues.

**Validate anti-pattern detections.** The detection heuristics produce false positives. A high commit frequency might reflect genuine rapid iteration rather than "commit theater." Always verify flagged patterns against the actual commit content before acting on them.

**Feed results to SEADF.** The analysis output is designed to integrate with the [SEADF](@/glossary/seadf.md) evolution engine. Use the JSON format to automatically feed DX insights into the autonomous improvement pipeline.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `insufficient_history` | Repository has fewer than 50 commits | Expand analysis window or use `--threshold=0.5` |
| `invalid_date_range` | `--since` is after `--until` | Correct date parameters |
| `git_command_failed` | Git binary not available or repository corrupted | Verify git installation and repository integrity |
| `path_not_found` | `--path` does not exist in repository | Verify the directory path exists in git history |
| `comparison_period_mismatch` | Compared periods have vastly different sizes | Use periods of similar duration for meaningful comparison |
| `pattern_threshold_invalid` | `--threshold` outside 0.0-1.0 range | Use a value between 0.0 and 1.0 |

## Advanced Usage

### Custom Anti-Pattern Definitions

Define organization-specific anti-patterns that extend the built-in catalog.

```yaml
# .aiad/dx-patterns/custom-patterns.yaml
patterns:
  - name: friday-deploy
    description: "Deployments on Friday afternoons"
    detection:
      type: temporal
      condition: "deploy_commits on day_of_week == 5 AND hour >= 14"
    severity: HIGH
    recommendation: "Avoid Friday afternoon deployments"
```

### CI/CD Integration

Run DX analysis as part of the CI pipeline to track trends automatically.

```bash
# In GitLab CI
/cicd-unified trigger --var="DX_ANALYSIS=true"
/dx-brutalist-analysis --format=json --output=dx-report.json
```

### SEADF Evolution Feed

The JSON output format is designed for direct consumption by the SEADF evolution engine.

```bash
/dx-brutalist-analysis --format=json | mix seadf.ingest --source=dx-analysis
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for comfortable illusions. The analysis reports exactly what the data shows without diplomatic softening or hedging.
- **NO DOUBTS**: Full investigation before conclusions. Every insight is backed by specific data points and statistical evidence.

## Related Commands

- [/seadf](@/commands/seadf.md) - Self-Evolving Autonomous Development Framework control and monitoring
- [/git-forensics](@/commands/git-forensics.md) - Cynical git history analysis distinguishing signal from noise
- [/git-trees](@/commands/git-trees.md) - Git tree-based codebase exploration at ~100x speed improvement
- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping
- [/inject](@/commands/inject.md) - AIAD injection coordination for pattern and agent deployment
- [/integrate](@/commands/integrate.md) - Cross-system integration design and implementation
- [/rc1-orchestrate](@/commands/rc1-orchestrate.md) - Complete RC1 delivery pipeline execution with ROC optimization

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)