+++
title = "/quality-hbfs"
weight = 330
[extra]
category = "Quality"
description = "Hottest-bug-first search for quality assessment prioritization"
syntax = "/quality-hbfs [options]"
authority = "L3"
agent = "quality-unified-supreme"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1033
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["quality-hbfs", "Hottest-bug-first", "commands", "Quality", "Prismatic Platform", "HBFS", "Phase", "Issues", "Heat"]
tags = ["commands", "quality", "quality-hbfs", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/quality-hbfs - Prismatic Platform"
+++

## Overview

**/quality-hbfs** is a production command in the **Quality** category of the Prismatic Platform. It implements a Hottest-Bug-First Search algorithm that prioritizes quality issues based on their impact, frequency, recency, and interconnectedness, ensuring that the most damaging defects receive attention first. Rather than addressing quality violations in arbitrary order or by simple severity classification, HBFS applies a multi-factor scoring model that considers how "hot" each issue is in terms of its effect on the overall platform health.

This command operates under the **L3** authority level and is executed by the `quality-unified-supreme` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level allows the command to read quality data across all platform applications and compute cross-domain priority scores.

The HBFS algorithm draws from graph-theoretic search strategies and heat-equation models. Each quality issue is modeled as a node in a dependency graph, with edges representing causal relationships (issue A causes or exacerbates issue B). The "heat" of each node combines its intrinsic severity with the propagated heat from its downstream effects, similar to how PageRank aggregates link authority. Issues that directly or indirectly affect many other parts of the system receive the highest heat scores, ensuring that root causes are addressed before symptoms.

## Architecture

The HBFS system operates as a three-phase pipeline: data collection, heat computation, and prioritized output.

### HBFS Pipeline Architecture

```
             /quality-hbfs
                   |
          Issue Collector
                   |
         +--------+--------+
         |        |        |
      Quality   Defect   Dependency
      Domains   History   Graph
         |        |        |
         +--------+--------+
                   |
           Heat Calculator
                   |
         +--------+--------+
         |        |        |
      Intrinsic  Propagated  Temporal
      Heat       Heat        Decay
         |        |        |
         +--------+--------+
                   |
          Priority Ranker
                   |
         +--------+--------+
         |        |        |
      Top-K    Category   Domain
      Report   Grouping   Filter
         |        |        |
         +--------+--------+
                   |
           Prioritized Output
```

### Heat Score Components

| Component | Weight | Calculation Method |
|-----------|--------|-------------------|
| **Intrinsic Severity** | 0.30 | Base severity from quality domain classification |
| **Impact Radius** | 0.25 | Number of files/modules directly affected |
| **Downstream Propagation** | 0.20 | Heat propagated from connected downstream issues |
| **Recency** | 0.15 | More recently introduced issues score higher |
| **Frequency** | 0.10 | Issues that recur after fixes score higher |

### Heat Propagation Model

Heat propagates through the issue dependency graph using a damped diffusion equation:

```
H(node) = intrinsic_heat(node) + damping * sum(H(child) * edge_weight(node, child))
```

The damping factor (default 0.85) prevents heat from accumulating infinitely in cyclic subgraphs. The system iterates until heat scores converge (typically 3-5 iterations).

## Usage

```bash
# Show hottest bugs across all domains
/quality-hbfs

# Show top 10 hottest issues
/quality-hbfs --top 10

# Filter to specific quality domain
/quality-hbfs --domain memory-safety

# Show heat scores for specific application
/quality-hbfs --app prismatic_web

# Output in JSON format for tooling integration
/quality-hbfs --format json

# Include heat propagation details
/quality-hbfs --verbose

# Show historical heat trends
/quality-hbfs --history 7d

# Export prioritized list for sprint planning
/quality-hbfs --export ./sprint-quality-backlog.md

# Show only issues above heat threshold
/quality-hbfs --min-heat 0.7
```

### Practical Examples

```bash
# Get the single hottest issue to fix right now
/quality-hbfs --top 1 --verbose

# Plan a quality sprint targeting memory safety
/quality-hbfs --domain memory-safety --export ./memory-safety-sprint.md

# Compare current heat map with last week
/quality-hbfs --history 7d --format json --diff

# Find root cause issues (highest downstream propagation)
/quality-hbfs --sort propagation --top 5

# Focus on recently introduced issues
/quality-hbfs --since 24h --sort recency
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--top` | `integer` | 20 | Number of top issues to display |
| `--domain` | `string` | all | Filter to specific quality domain |
| `--app` | `string` | all | Filter to specific application |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown`, `csv` |
| `--verbose` | `flag` | false | Include heat propagation details |
| `--sort` | `enum` | `heat` | Sort by: `heat`, `severity`, `recency`, `propagation`, `frequency` |
| `--min-heat` | `float` | 0.0 | Minimum heat score threshold |
| `--history` | `duration` | none | Show historical heat trends |
| `--since` | `duration` | all | Filter to issues introduced within period |
| `--export` | `path` | none | Export prioritized list to file |
| `--diff` | `flag` | false | Show changes from previous analysis |
| `--damping` | `float` | 0.85 | Heat propagation damping factor |
| `--iterations` | `integer` | 10 | Maximum heat propagation iterations |

## Execution Flow

### Phase 1: Issue Collection

The HBFS system collects all known quality issues from the 13 quality domains. Each issue is annotated with:
- Location (file, line, module)
- Domain classification
- Intrinsic severity (critical, high, medium, low)
- Introduction date (from git blame)
- Fix history (has it been fixed and reintroduced?)

### Phase 2: Dependency Graph Construction

Issues are connected based on causal relationships:
- **Code Dependency** -- Issue in module A affects all modules that depend on A
- **Pattern Correlation** -- Issues that consistently co-occur are linked
- **Domain Cascade** -- A Dialyzer violation may cascade into memory safety issues

### Phase 3: Heat Computation

The heat propagation algorithm runs iteratively:
1. Initialize each node with its intrinsic heat score
2. Propagate heat through edges using the damped diffusion equation
3. Check for convergence (maximum heat change < 0.001)
4. If not converged, iterate (up to max iterations)

### Phase 4: Priority Ranking

Issues are sorted by total heat score (intrinsic + propagated). The output displays the ranked list with heat breakdown, location, suggested fix approach, and estimated effort.

### Phase 5: Report Generation

The final output is formatted according to the requested format. Each issue includes actionable information: what it is, why it is hot, where to fix it, and what fixing it would improve.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/quality-gates](@/commands/quality-gates.md) | Data Source | Gate results feed into issue collection |
| [/quality-evolve](@/commands/quality-evolve.md) | Consumer | Evolution uses HBFS to prioritize improvement targets |
| [/quality-unified](@/commands/quality-unified.md) | Peer | Unified quality view includes HBFS rankings |
| [/quality-enforce](@/commands/quality-enforce.md) | Policy | Enforcement policies define intrinsic severity weights |
| [/tech-debt](@/commands/tech-debt.md) | Peer | Technical debt items overlap with quality issues |
| [/verify-patterns](@/commands/verify-patterns.md) | Data Source | Pattern verification results contribute to issue graph |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | HBFS computation metrics |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | HBFS scores influence gate strictness |

## Best Practices

### Regular HBFS Analysis

Run `/quality-hbfs` at the start of each development session to orient work toward the highest-impact improvements. Even a single fix targeting the hottest issue often improves multiple downstream metrics.

### Root Cause Focus

Sort by `--sort propagation` to find root cause issues. Fixing a root cause with high propagation heat often resolves multiple downstream issues simultaneously, providing outsized improvement for the effort invested.

### Sprint Planning Integration

Use `--export` to generate quality improvement backlogs for sprint planning. The heat-sorted list provides a natural priority order that maximizes quality improvement per development hour invested.

### Historical Comparison

Regular `--history` checks reveal whether the heat landscape is improving overall or if new issues are being introduced faster than old ones are fixed. A rising average heat score indicates quality degradation.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `NO_ISSUES_FOUND` | No quality issues detected (perfect quality) | Celebration is appropriate |
| `GRAPH_CYCLE_WARNING` | Cyclic dependencies in issue graph | Damping factor handles cycles; informational only |
| `CONVERGENCE_FAILURE` | Heat computation did not converge | Increase `--iterations` or adjust `--damping` |
| `DOMAIN_UNAVAILABLE` | Quality domain data not available | Run quality gates first to generate domain data |
| `HISTORY_UNAVAILABLE` | Historical data not found for requested period | Ensure quality DNA is being tracked |

## Advanced Usage

### Custom Heat Models

Override default heat weights for domain-specific prioritization:

```bash
# Prioritize performance issues heavily
/quality-hbfs --heat-weights "severity:0.1,impact:0.1,propagation:0.1,recency:0.1,performance:0.6"
```

### Issue Graph Visualization

Export the issue dependency graph for visualization:

```bash
/quality-hbfs --export-graph ./issue-graph.dot
dot -Tsvg issue-graph.dot -o issue-graph.svg
```

### Automated Fix Ordering

Pipe HBFS output into quality-evolve for automated fix prioritization:

```bash
/quality-hbfs --top 10 --format json | /quality-evolve --from-hbfs --auto-fix
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. HBFS ensures the most impactful issues are addressed first.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Heat scores are computed from objective metrics, not subjective assessment.

## Related Commands

- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-unified](@/commands/quality-unified.md) - Unified quality command with quick, full, pre-commit and CI modes
- [/quality-evolve](@/commands/quality-evolve.md) - Quality-focused evolution targeting specific quality domains
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/tech-debt](@/commands/tech-debt.md) - Technical debt analysis and elimination planning
- [/verify-patterns](@/commands/verify-patterns.md) - Pattern matching audit for file, module or entire codebase
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)