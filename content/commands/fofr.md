+++
title = "/fofr"
weight = 370
[extra]
category = "Quality"
description = "Code quality analysis determining fit-or-fix-or-refactor status"
syntax = "/fofr [options]"
authority = "L2+"
agent = "code-quality-commander"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1237
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["fofr", "Code", "commands", "Quality", "Prismatic Platform", "REFACTOR", "Credo"]
tags = ["commands", "quality", "fofr", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/fofr - Prismatic Platform"
+++

## Overview

**/fofr** is a production command in the **Quality** category of the Prismatic Platform. It performs code quality analysis to determine the **fit-or-fix-or-refactor** status of modules, functions, and applications -- a tripartite classification that drives the platform's quality improvement strategy. Every piece of code falls into one of three categories: fit (meets quality standards, leave as-is), fix (has identifiable bugs or violations, fix them), or refactor (structurally sound but architecturally suboptimal, restructure for improvement).

The FoFR classification is a foundational concept in the platform's quality management philosophy. Rather than treating all code as equally needing attention, the `/fofr` command performs triage -- identifying which code is already fit for purpose, which needs targeted fixes, and which requires structural refactoring. This triage prevents wasted effort on code that is already good enough while ensuring that genuinely problematic code receives appropriate treatment.

The [code-quality-commander](@/agents/code-quality-commander.md) agent executes this command, applying a multi-dimensional quality scoring model that evaluates code across the platform's 13 quality domains. The scoring model considers compilation cleanliness, type specification coverage, test coverage, cyclomatic complexity, cognitive complexity, Credo compliance, module coupling, and adherence to OTP best practices. The aggregate score determines the FoFR classification with clear threshold boundaries.

This command operates under the **L2+** authority level and is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The FoFR system implements a multi-layer quality assessment pipeline:

```
Target Code --> Quality Analyzer --> Multi-Domain Scorer --> FoFR Classifier
      |               |                     |                      |
 Module/App      13 Quality Domains    Domain Scores          Classification
 Function        Static Analysis       Weighted Sum           Fit/Fix/Refactor
      |               |                     |                      |
 Code Extraction  Metric Collection    Aggregate Score        Action Plan
      \               |                     /                      |
       --> Assessment Engine --> Recommendation Generator --> FoFR Report
                    |
              Historical Trends
              (Quality DNA)
```

**Quality Analyzer**: Performs comprehensive static analysis across all 13 quality domains. For each domain, the analyzer computes a normalized score (0-100). Domains include: compilation cleanliness, Credo compliance, Dialyzer conformance, type spec coverage, test coverage, function complexity, module coupling, guard function usage, @impl coverage, memory safety, performance patterns, timing patterns, and unsafe map access.

**Multi-Domain Scorer**: Combines individual domain scores into a weighted aggregate. Domain weights reflect the relative importance of each quality aspect to the platform's overall health. The scorer supports configurable weight profiles for different assessment contexts.

**FoFR Classifier**: Applies threshold boundaries to the aggregate score to determine classification:

| Classification | Score Range | Action |
|---------------|-------------|--------|
| **FIT** | 85-100 | No action needed; code meets quality standards |
| **FIX** | 60-84 | Targeted fixes needed for specific quality violations |
| **REFACTOR** | 0-59 | Structural refactoring required for quality improvement |

**Recommendation Generator**: For FIX and REFACTOR classifications, generates specific, actionable recommendations. FIX recommendations identify individual violations with their locations and remediation steps. REFACTOR recommendations identify structural issues and propose alternative architectures.

## Usage

### Basic Quality Analysis

```bash
# Analyze a specific module
/fofr PrismaticPerimeter.SecurityRating

# Analyze an entire application
/fofr --app=prismatic_perimeter

# Analyze a specific file
/fofr apps/prismatic_api/lib/prismatic_api/scanner.ex
```

### Targeted Analysis

```bash
# Analyze with specific domain focus
/fofr PrismaticStorage.Ecto.Repo --domains=dialyzer,typespec,complexity

# Analyze with custom thresholds
/fofr --app=prismatic_web --fit-threshold=90 --fix-threshold=70

# Analyze only recently changed modules
/fofr --changed-since=7d
```

### Reporting and Planning

```bash
# Generate FoFR report for an application
/fofr --app=prismatic_agents --report --format=table

# Show FoFR distribution across all applications
/fofr --distribution --format=table

# Generate improvement plan for FIX/REFACTOR classified code
/fofr --improvement-plan --app=prismatic_perimeter --format=markdown

# Track FoFR trends over time
/fofr --trend --period=30d --format=table
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | string | none | Target entire umbrella application |
| `--domains` | string | all | Comma-separated quality domains to evaluate |
| `--fit-threshold` | integer | 85 | Minimum score for FIT classification |
| `--fix-threshold` | integer | 60 | Minimum score for FIX classification (below = REFACTOR) |
| `--changed-since` | string | none | Analyze only modules changed within time window |
| `--report` | flag | false | Generate comprehensive FoFR report |
| `--distribution` | flag | false | Show FoFR distribution across applications |
| `--improvement-plan` | flag | false | Generate improvement plan for FIX/REFACTOR code |
| `--trend` | flag | false | Show FoFR classification trends over time |
| `--period` | string | 30d | Time period for trend analysis |
| `--format` | string | text | Output format (text, json, table, markdown) |
| `--verbose` | flag | false | Include per-domain score breakdown |
| `--weight-profile` | string | standard | Domain weight profile (standard, security, performance) |
| `--export` | flag | false | Export results for external tooling |
| `--compare` | flag | false | Compare FoFR status with previous assessment |

## Execution Flow

The `/fofr` command follows a structured 6-phase assessment pipeline:

1. **Target Resolution**: The input target is resolved to specific source files. Module names are mapped to files, application names expand to all constituent modules, and file paths are validated for existence.

2. **Metric Collection**: All 13 quality domains are measured for each target module. Metrics are collected from multiple sources: the compiler (warnings), Credo (static analysis), Dialyzer (type analysis), test results (coverage), and custom analyzers (complexity, coupling, patterns).

3. **Score Computation**: Domain metrics are normalized to 0-100 scores and combined using the configured weight profile. The standard profile weights compilation and type safety most heavily, while the security profile emphasizes input validation and error handling patterns.

4. **Classification**: The aggregate score is evaluated against the FIT/FIX/REFACTOR thresholds. Each module receives a definitive classification with the specific domains that influenced the classification.

5. **Recommendation Generation**: For FIX-classified modules, specific violation-level recommendations are generated with file locations and remediation steps. For REFACTOR-classified modules, structural recommendations identify architectural improvements.

6. **Report Synthesis**: All classifications, scores, and recommendations are synthesized into a structured report. The report includes summary statistics, per-module classifications, domain breakdowns, and actionable improvement plans.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Quality Gates](@/glossary/quality-gates.md) | Scoring | Quality gate results feed domain scores |
| [Credo](@/glossary/credo.md) | Analysis | Static analysis for code quality domain |
| [Dialyzer](@/glossary/dialyzer.md) | Analysis | Type analysis for type safety domain |
| [Quality DNA](@/glossary/quality-dna.md) | History | Historical FoFR classifications and trends |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Execution | Code-quality-commander performs assessment |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | FoFR classification [metrics](@/glossary/metrics.md) |
| [Evolution Engine](@/glossary/autoevolve.md) | Strategy | FoFR results guide evolution mutation targets |
| AIAD Registry | Discovery | Command specification and agent binding |

## Best Practices

**Run FoFR before major changes**: Before modifying a module, check its FoFR status. Working on REFACTOR-classified code presents opportunities to improve the structure during your changes. Working on FIT-classified code demands extra caution to maintain quality.

**Use FoFR to prioritize technical debt work**: The `--distribution` view reveals the overall quality distribution across the platform. Focus improvement efforts on applications with the highest concentration of FIX and REFACTOR classifications.

**Monitor FoFR trends**: Regular trend analysis (`--trend`) reveals whether the platform is improving or degrading over time. A growing proportion of REFACTOR-classified code is an early warning of architectural decay.

**Apply appropriate domain weights**: The default weight profile is balanced across all domains. For security-sensitive applications (like [Prismatic Perimeter](@/apps/prismatic-perimeter.md)), use `--weight-profile=security` to increase the influence of security-relevant quality domains.

**Act on classifications consistently**: FIT means leave it alone (unless adding features). FIX means fix the specific violations (use [/fix](@/commands/fix.md)). REFACTOR means restructure (use [/refactor](@/commands/refactor.md)). Mixing these actions wastes effort.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `MODULE_NOT_FOUND` | Target module does not exist | Verify module name; check application membership |
| `METRIC_COLLECTION_FAILED` | One or more quality domains could not be measured | Check that Credo, Dialyzer, and tests are configured for the target |
| `WEIGHT_PROFILE_UNKNOWN` | Requested weight profile does not exist | Use standard, security, or performance profiles |
| `TREND_DATA_INSUFFICIENT` | Not enough historical data for trend analysis | Accumulate more FoFR assessments over the requested period |
| `THRESHOLD_INVALID` | Fit threshold below fix threshold | Ensure fit-threshold > fix-threshold |

## Advanced Usage

### Automated Quality Campaigns

```bash
# Identify all REFACTOR-classified modules and create improvement issues
/fofr --distribution --filter=refactor --create-issues --milestone=M47

# Run FoFR as a CI/CD gate (fail if any module is REFACTOR)
/fofr --app=prismatic_api --ci-mode --fail-on=refactor

# Batch assessment across all 100+ applications
/fofr --all-apps --distribution --format=json --output=fofr-report.json
```

### Custom Weight Profiles

```bash
# Create a custom weight profile for OSINT applications
/fofr --create-profile=osint \
  --weights="compilation:1.5,security:2.0,performance:1.5,testing:1.0"

# Apply custom profile
/fofr --app=prismatic_visitor_intelligence --weight-profile=osint
```

### FoFR-Driven Evolution

The FoFR classification system directly integrates with the [/evolve](@/commands/evolve.md) command. Evolution cycles use FoFR classifications to prioritize mutation targets: REFACTOR-classified modules receive the most evolutionary attention, followed by FIX modules, while FIT modules are largely left unchanged.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for unassessed code. Every module must have a current FoFR classification. REFACTOR-classified code is flagged for mandatory improvement. FIX-classified code must have its violations addressed within a defined timeframe.
- **NO DOUBTS**: Classifications are evidence-based, computed from 13 quality domain measurements. No subjective assessment, no "looks fine to me." Every classification is backed by quantified metrics with transparent methodology.

The FoFR system operationalizes the NO MERCY doctrine's quality standards by making code quality visible, measurable, and actionable through a simple three-way classification that everyone can understand and act upon.

## Related Commands

- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/evolve](@/commands/evolve.md) - Living AIAD ecosystem evolution with 5-phase cycle
- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)