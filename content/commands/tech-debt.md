+++
title = "/tech-debt"
weight = 190
[extra]
category = "Development"
description = "Technical debt analysis and elimination planning"
syntax = "/tech-debt [options]"
authority = "L2+"
agent = "debt-hunter"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1081
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["tech-debt", "Technical", "commands", "Development", "Prismatic Platform", "Medium", "Debt", "Phase", "Architecture"]
tags = ["commands", "development", "tech-debt", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/tech-debt - Prismatic Platform"
+++

## Overview

**/tech-debt** is a production command in the **Development** category of the Prismatic Platform. It performs comprehensive technical debt analysis across the umbrella codebase, identifying, classifying, prioritizing, and planning the elimination of accumulated technical debt. The command scans for 25+ categories of technical debt including code smells, architectural violations, missing tests, outdated dependencies, documentation gaps, performance bottlenecks, and deferred maintenance items. Each debt item is scored by impact, effort, and risk to produce actionable elimination plans.

This command operates under the **L2+** authority level and is executed by the `debt-hunter` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The debt-hunter agent has read access to the entire codebase and integrates with quality metrics, test coverage data, and compilation diagnostics to provide evidence-based debt assessments.

The Prismatic Platform maintains a current quality score of 100/100 with zero [quality debt](@/glossary/quality-debt.md) points (QDP), having eliminated all 905 QDP through systematic debt reduction campaigns. `/tech-debt` was the primary analytical tool driving this achievement, providing the intelligence that guided [/quality-enforce](@/commands/quality-enforce.md) and [/quality-evolve](@/commands/quality-evolve.md) operations. Even at zero QDP, the command remains essential for preventing debt accumulation and identifying emerging debt before it compounds.

## Architecture

The tech-debt system operates as a multi-scanner analysis pipeline that examines the codebase through different debt lenses.

### Debt Analysis Architecture

```
             /tech-debt
                  |
           Debt Orchestrator
                  |
          +-------+-------+-------+
          |       |       |       |
       Code     Arch     Test    Dep
       Scanner  Scanner  Scanner Scanner
          |       |       |       |
    +-----+--+ +-+--+ +-+--+ +--+--+
    |    |   | |  |  | |  |  | |  |  |
   Smell Dup  Dead API  Gap  Cover Hex  Mix
   Check Check Code Conv Check Check Aud  Lock
    |    |   | |  |  | |  |  | |  |  |
    +----+---+-+--+--+-+--+--+-+--+--+
                  |
           Debt Classifier
                  |
          +-------+-------+
          |       |       |
       Priority  Impact   Effort
       Score     Analysis Estimate
          |       |       |
          +-------+-------+
                  |
           Elimination Planner
```

### Debt Categories

| Category | Scanner | Items Tracked | Severity Range |
|----------|---------|---------------|----------------|
| **Code Smells** | Code | Long functions, deep nesting, complex conditionals | Low-Medium |
| **Duplication** | Code | Copy-paste code, near-duplicates | Medium |
| **Dead Code** | Code | Unreachable functions, unused modules | Low |
| **API Violations** | Architecture | Broken contracts, inconsistent interfaces | High |
| **Missing Tests** | Test | Untested modules, low coverage areas | Medium-High |
| **Test Quality** | Test | Brittle tests, slow tests, flaky tests | Medium |
| **Outdated Deps** | Dependency | Packages behind latest, security patches pending | Medium-Critical |
| **Documentation Gaps** | Code | Missing @doc, @moduledoc, @spec | Low-Medium |
| **Performance Debt** | Architecture | Known bottlenecks, suboptimal algorithms | Medium-High |
| **Configuration Debt** | Architecture | Hardcoded values, missing config options | Low |

### Priority Scoring Formula

```
Priority = (Impact * 0.4) + (Risk * 0.3) + (Effort_Inverse * 0.2) + (Age * 0.1)

Where:
  Impact:        1-10 scale, business impact of the debt
  Risk:          1-10 scale, probability of debt causing failure
  Effort_Inverse: 10 - Effort(1-10), favoring quick wins
  Age:           1-10 scale, how long the debt has existed
```

## Usage

```bash
# Full technical debt analysis
/tech-debt

# Analyze specific application
/tech-debt --app prismatic_web

# Show only high-priority debt
/tech-debt --min-priority 7

# Analyze specific debt category
/tech-debt --category code-smells

# Generate elimination plan
/tech-debt --plan

# Show debt trends over time
/tech-debt --trends --since 30d

# Export debt inventory as JSON
/tech-debt --format json --export ./debt-inventory.json

# Quick summary statistics
/tech-debt --summary

# Show debt introduced since last analysis
/tech-debt --new-debt-only

# Dry run showing scan plan
/tech-debt --dry-run
```

### Practical Examples

```bash
# Pre-sprint debt assessment with elimination plan
/tech-debt --plan --max-effort 5 --format markdown --export ./sprint-debt-plan.md

# Focus on security-related technical debt
/tech-debt --category "outdated-deps,api-violations" --min-priority 6

# Application-specific deep analysis
/tech-debt --app prismatic_perimeter --verbose --plan

# Track debt reduction progress
/tech-debt --trends --since 90d --format json --export ./debt-trends.json

# Quick wins analysis (high impact, low effort)
/tech-debt --quick-wins --max-effort 3 --min-impact 7

# CI/CD integration check
/tech-debt --summary --format json --fail-on-new
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | `string` | all | Specific application to analyze |
| `--category` | `string` | all | Debt categories (comma-separated) |
| `--min-priority` | `integer` | 1 | Minimum priority score threshold (1-10) |
| `--plan` | `flag` | false | Generate elimination plan |
| `--trends` | `flag` | false | Show debt trends over time |
| `--since` | `duration` | all | Time filter for trends and new debt |
| `--summary` | `flag` | false | Show summary statistics only |
| `--quick-wins` | `flag` | false | Filter to high-impact, low-effort items |
| `--new-debt-only` | `flag` | false | Show only newly introduced debt |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--export` | `path` | none | Export results to file |
| `--verbose` | `flag` | false | Detailed debt descriptions with code locations |
| `--max-effort` | `integer` | 10 | Maximum effort score for filtering |
| `--min-impact` | `integer` | 1 | Minimum impact score for filtering |
| `--fail-on-new` | `flag` | false | Exit code 1 if new debt detected (CI mode) |
| `--dry-run` | `flag` | false | Show scan plan without executing |

## Execution Flow

### Phase 1: Baseline Assessment

The orchestrator loads the previous debt inventory (stored in `.claude/quality-dna/debt-inventory.json`) and the current quality metrics. This baseline enables delta analysis: identifying newly introduced debt versus existing items.

### Phase 2: Multi-Scanner Execution

All four scanners execute in parallel across the codebase. The code scanner analyzes ASTs for structural debt patterns. The architecture scanner checks module boundaries, API contracts, and dependency topology. The test scanner assesses coverage gaps and test quality. The dependency scanner audits Hex packages and Mix lock state.

### Phase 3: Debt Classification

Discovered debt items are classified by category, severity, and location. Each item receives priority scoring based on the formula combining impact, risk, effort, and age. Items are deduplicated against the existing inventory to prevent double-counting.

### Phase 4: Trend Analysis

When trend data is available, the system computes debt velocity: items added versus items eliminated per period. Accelerating debt accumulation triggers warnings. Consistent debt reduction confirms healthy development practices.

### Phase 5: Elimination Planning

When `--plan` is requested, the system generates prioritized elimination plans. Plans group related debt items, estimate total effort, identify dependencies between items, and suggest the optimal elimination order. Quick wins (high impact, low effort) are highlighted for immediate action.

### Phase 6: Reporting

Results are formatted for the requested output. Text format provides a readable debt inventory with priority rankings. JSON format enables integration with external tools and dashboards. Markdown format produces documents suitable for sprint planning and stakeholder communication.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/quality-enforce](@/commands/quality-enforce.md) | Consumer | Debt analysis drives enforcement priorities |
| [/quality-evolve](@/commands/quality-evolve.md) | Consumer | Evolution targets debt items |
| [/quality-gates](@/commands/quality-gates.md) | Enforcement | Debt thresholds enforce gate passage |
| [/find-lowfruit](@/commands/find-lowfruit.md) | Peer | Low-hanging fruit identification |
| [/refactor](@/commands/refactor.md) | Downstream | Refactoring eliminates structural debt |
| [/regression-check](@/commands/regression-check.md) | Peer | Regression checks prevent debt reintroduction |
| [Quality DNA](@/glossary/quality-dna.md) | State | Debt inventory persisted in quality DNA |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Debt metrics and trend data |

## Best Practices

### Continuous Debt Monitoring

Run `/tech-debt --summary` at the start of every development session. Early detection of new debt is far less costly than discovering accumulated debt during a milestone review. Integrate `--fail-on-new` in CI pipelines to prevent debt introduction.

### Sprint-Aligned Elimination

Use `/tech-debt --plan --max-effort 5` to generate sprint-sized elimination plans. Dedicating 10-20% of each sprint to debt elimination prevents accumulation while maintaining feature velocity. Quick wins provide visible progress and team motivation.

### Category Rotation

Rotate debt elimination focus across categories rather than addressing all categories simultaneously. One sprint focused on code smells, the next on test gaps, the next on outdated dependencies. This produces deeper cleanup in each category.

### Quick Wins First

Start every debt elimination campaign with `/tech-debt --quick-wins`. High-impact, low-effort items provide immediate quality improvement and build momentum for tackling more complex debt items.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `SCAN_TIMEOUT` | Scanner exceeded time limit | Narrow scope with `--app` or `--category` |
| `BASELINE_MISSING` | No previous debt inventory for comparison | First run creates baseline; trends unavailable |
| `AST_PARSE_ERROR` | Cannot parse source file for analysis | Check file for syntax errors |
| `COVERAGE_DATA_STALE` | Test coverage data older than code | Run `mix test --cover` to refresh |
| `HEX_UNAVAILABLE` | Cannot reach Hex for dependency audit | Use cached package data |
| `INVENTORY_CORRUPT` | Debt inventory file corrupted | Regenerate with full scan |

## Advanced Usage

### Custom Debt Rules

Add project-specific debt detection rules:

```bash
/tech-debt --custom-rules ./debt-rules/prismatic-debt-patterns.yaml
```

### Debt Budget Enforcement

Set maximum allowable debt per application:

```bash
/tech-debt --budget --max-items-per-app 10 --fail-on-budget-exceeded
```

### Historical Debt Archaeology

Analyze when specific debt items were introduced using git history:

```bash
/tech-debt --archaeology --item "unused_module:prismatic_legacy" --format markdown
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Technical debt is identified and tracked without exception. No debt item is dismissed as "acceptable."
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every debt item includes source location, evidence, priority scoring rationale, and recommended elimination approach.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/quality-evolve](@/commands/quality-evolve.md) - Quality-focused evolution targeting specific quality domains
- [/find-lowfruit](@/commands/find-lowfruit.md) - Identify low-hanging fruit improvements across codebase
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)