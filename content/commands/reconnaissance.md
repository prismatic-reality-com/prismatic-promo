+++
title = "/reconnaissance"
weight = 200
[extra]
category = "Development"
description = "Codebase reconnaissance and structure analysis"
syntax = "/reconnaissance [options]"
authority = "L2+"
agent = "elixir-core-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1119
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["reconnaissance", "Codebase", "commands", "Development", "Prismatic Platform", "Step"]
tags = ["commands", "development", "reconnaissance", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/reconnaissance - Prismatic Platform"
+++

## Overview

**/reconnaissance** is a production command in the **Development** category of the Prismatic Platform that performs comprehensive codebase reconnaissance and structural analysis. This command provides rapid situational awareness of the platform's architecture, module topology, dependency relationships, and code organization patterns. It serves as the essential first step in any development workflow, ensuring that operators have complete understanding of the terrain before making changes.

In a platform encompassing over 90 umbrella applications, 6,652 Elixir source files, and approximately 2.8 million lines of code, navigating the codebase without systematic reconnaissance is not merely inefficient but dangerous. Changes made without understanding the full dependency graph can cascade through interconnected modules, breaking functionality in distant parts of the system. The `/reconnaissance` command eliminates this risk by providing a structured, comprehensive view of the codebase's current state.

The reconnaissance engine leverages the platform's optimized [Git Trees](@/glossary/git-trees.md) infrastructure for file discovery, achieving approximately 100x faster traversal compared to conventional filesystem scanning. This performance advantage makes real-time reconnaissance practical even for the full codebase, enabling developers to obtain comprehensive structural analysis in seconds rather than minutes.

This command operates under the **L2+** authority level and is executed by the `elixir-core-specialist` agent, which brings deep expertise in Elixir/OTP architecture and the Prismatic Platform's specific organizational conventions. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The reconnaissance system operates through three interconnected analysis engines that provide complementary views of the codebase.

```
Git Tree Index
    |
    v
[Structural Analyzer]
    +---> Module Topology (supervision trees, module hierarchy)
    +---> Dependency Graph (inter-app dependencies, external deps)
    +---> File Distribution (types, sizes, modification dates)
    |
    v
[Pattern Analyzer]
    +---> OTP Pattern Detection (GenServer, Supervisor, Application)
    +---> Anti-Pattern Detection (forbidden naming, unsafe access)
    +---> Convention Compliance (naming, structure, organization)
    |
    v
[Risk Analyzer]
    +---> High-Coupling Detection (modules with many dependencies)
    +---> Change Impact Estimation (blast radius for modifications)
    +---> Staleness Detection (long-unmodified critical files)
    |
    v
Reconnaissance Report
```

The structural analyzer builds a complete model of the codebase's physical organization, mapping applications to modules to functions with their type specifications and documentation coverage. The pattern analyzer evaluates the codebase against the platform's established conventions and the Elixir Best Practices Policy. The risk analyzer identifies areas of the codebase that present elevated risk for modification due to high coupling, inadequate test coverage, or architectural complexity.

## Usage

```bash
# Full codebase reconnaissance
/reconnaissance

# Reconnaissance of a specific application
/reconnaissance --app=prismatic_perimeter

# Reconnaissance focused on dependency analysis
/reconnaissance --mode=dependencies

# Reconnaissance with risk assessment
/reconnaissance --risk-analysis

# Reconnaissance of recently modified files
/reconnaissance --recent=7d

# Reconnaissance comparing current state to a baseline
/reconnaissance --compare=main

# Quick structural overview without deep analysis
/reconnaissance --quick

# Reconnaissance with module coupling analysis
/reconnaissance --coupling --threshold=5

# Reconnaissance exporting results for external tools
/reconnaissance --format=json --export=/tmp/recon.json
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | string | all | Target specific umbrella application |
| `--mode` | enum | full | Analysis mode: `full`, `dependencies`, `structure`, `patterns` |
| `--risk-analysis` | boolean | false | Include risk assessment in output |
| `--recent` | string | - | Focus on files modified within timeframe (e.g., `7d`, `24h`) |
| `--compare` | string | - | Compare against branch or commit reference |
| `--quick` | boolean | false | Quick structural overview without deep analysis |
| `--coupling` | boolean | false | Include module coupling analysis |
| `--threshold` | integer | 3 | Coupling threshold for flagging high-coupling modules |
| `--format` | enum | text | Output format: `text`, `json`, `markdown`, `dot` |
| `--export` | string | - | Export results to specified file path |
| `--include-tests` | boolean | false | Include test files in analysis |
| `--depth` | integer | 3 | Maximum depth for dependency tree traversal |
| `--exclude` | string | - | Comma-separated list of applications to exclude |

## Execution Flow

The reconnaissance command follows a disciplined execution flow optimized for speed without sacrificing thoroughness.

**Step 1 - Index Acquisition**: The Git Tree index is loaded or refreshed, providing a complete, sorted listing of all tracked files in the repository. This step completes in approximately 80 milliseconds for the full codebase, compared to 500+ milliseconds for conventional filesystem traversal.

**Step 2 - Scope Resolution**: The target scope is determined based on provided options. When `--app` is specified, the index is filtered to that application's directory tree. When `--recent` is specified, files are filtered by their last modification timestamp.

**Step 3 - Structural Analysis**: The structural analyzer processes the scoped file set, building the module topology, dependency graph, and file distribution statistics. This phase parses module definitions, `use` and `import` declarations, and `mix.exs` dependency specifications.

**Step 4 - Pattern Analysis**: The pattern analyzer evaluates each module against the platform's convention library, identifying OTP patterns (GenServer, Supervisor, Application, Task), anti-patterns (forbidden naming like Manager/Handler/Utils), and convention deviations.

**Step 5 - Risk Assessment**: When enabled, the risk analyzer computes coupling metrics, change impact estimates, and staleness indicators. High-risk areas are flagged with recommended actions.

**Step 6 - Report Generation**: All analysis results are synthesized into a structured report formatted according to the specified output mode.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `elixir-core-specialist` | Deep Elixir/OTP architectural expertise |
| [Git Trees](@/glossary/git-trees.md) | File discovery | ~100x faster than conventional filesystem scanning |
| [Quality Gates](@/glossary/quality-gates.md) | Pattern validation | Convention compliance checked against quality standards |
| [/analyze](@/commands/analyze.md) | Complementary command | Analyze provides deeper architectural analysis |
| [/code](@/commands/code.md) | Workflow integration | Reconnaissance precedes coding operations |
| [Telemetry](@/glossary/telemetry.md) | Execution tracking | Reconnaissance operations logged for audit |
| [AIAD](@/glossary/aiad.md) Registry | Command specification | Registered as a Development category command |

## Best Practices

Always execute a reconnaissance before starting work on an unfamiliar area of the codebase. Even experienced developers benefit from a fresh structural view, as the codebase evolves continuously and assumptions from previous sessions may be outdated.

Use the `--app` flag to scope reconnaissance to the target application when working on a specific feature. Full-codebase reconnaissance is valuable for strategic planning but excessive for tactical development tasks. Scoped reconnaissance provides faster results with higher signal-to-noise ratio.

Leverage the `--compare` flag when reviewing pull requests or evaluating the impact of a feature branch. Comparing the branch state against `main` reveals all structural changes introduced by the branch, including new modules, modified dependencies, and shifted coupling patterns.

Combine reconnaissance with the [/review](@/commands/review.md) command for pre-commit validation. Running `--risk-analysis` mode highlights areas where changes might introduce unintended consequences, enabling proactive risk mitigation before code is committed.

Save reconnaissance reports from milestone boundaries using `--export` for historical comparison. These snapshots provide valuable data for tracking the platform's structural evolution over time.

## Error Handling

Reconnaissance errors fall into two categories: index errors and analysis errors. Index errors occur when the Git Tree index cannot be loaded or refreshed, typically due to repository corruption or an uninitialized git repository. The command reports these immediately and suggests running `git status` to diagnose the underlying issue.

Analysis errors occur when specific modules cannot be parsed or when dependency specifications reference non-existent applications. These are reported as warnings within the reconnaissance report rather than causing the analysis to fail, ensuring that partial results are always available.

```
RECONNAISSANCE WARNING
Module: PrismaticWeb.SomeController
Issue: Could not resolve dependency on PrismaticAuth (not found in umbrella)
Impact: Dependency graph incomplete for this module
Suggestion: Verify app exists or check mix.exs for typos
```

## Advanced Usage

Advanced reconnaissance operations support custom analysis pipelines, integration with formal verification, and automated change impact assessment.

```bash
# Reconnaissance with blast radius calculation for a specific module
/reconnaissance --blast-radius=PrismaticPerimeter.SecurityRating

# Reconnaissance generating DOT graph for visualization
/reconnaissance --mode=dependencies --format=dot | dot -Tpng -o deps.png

# Reconnaissance feeding into refactoring analysis
/reconnaissance --coupling --format=json | /refactor --analyze-from-stdin

# Cross-app dependency audit
/reconnaissance --mode=dependencies --depth=5 --exclude=prismatic_test_helpers
```

The `--blast-radius` option is particularly valuable before making changes to core modules. It traces all direct and transitive dependents of the specified module, quantifying the number of applications, modules, and test files that could be affected by a change.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Reconnaissance produces complete structural analysis for the entire scoped area. No application is silently skipped, no dependency is left unresolved, and no anti-pattern goes unreported.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The reconnaissance command is the primary embodiment of the NO DOUBTS principle in the development workflow. It ensures that every coding decision is made with complete structural awareness.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/test](@/commands/test.md) - Comprehensive test generation and verification
- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping
- [/review](@/commands/review.md) - Code review and architectural review execution
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)