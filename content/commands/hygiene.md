+++
title = "/hygiene"
weight = 340
[extra]
category = "Quality"
description = "Ultra-fast dependency-free static analysis for code hygiene"
syntax = "/hygiene [options]"
authority = "L2+"
agent = "quality-hygiene-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1233
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["hygiene", "Ultra-fast", "commands", "Quality", "Prismatic Platform", "Credo", "Elixir"]
tags = ["commands", "quality", "hygiene", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/hygiene - Prismatic Platform"
+++

## Overview

**/hygiene** is a production command in the **Quality** category of the Prismatic Platform that performs ultra-fast, dependency-free static analysis to detect code hygiene violations across the platform's 6,600+ Elixir source files. Unlike compilation-dependent tools like Dialyzer or Credo that require the full project to be compiled, the hygiene system operates directly on source text using pattern-based analysis, enabling sub-second execution times that make it practical as a pre-commit check, real-time editor integration, and continuous background monitor.

This command operates under the **L2+** authority level and is executed by the `quality-hygiene-specialist` agent, which maintains the platform's code hygiene standards through 25+ custom pattern checks that have collectively prevented over 700 quality violations from entering the codebase. The agent detects anti-patterns specific to the Prismatic Platform's Elixir/OTP architecture, including unsafe atom creation, naive `length() > 0` checks, missing `@spec` annotations, unsafe `Map.get` without default values, `Process.sleep` usage in production code, missing `@impl` annotations on callback implementations, and dozens of other patterns that indicate code quality issues. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

The dependency-free nature of the hygiene system is a deliberate architectural choice. In a 89+ application umbrella project, compilation can take minutes, making compilation-dependent tools impractical for rapid feedback loops. The hygiene system achieves sub-second analysis of the entire codebase by operating on the raw source text, using optimized regular expressions and AST-free pattern matching to detect issues that would otherwise require full compilation to identify. This speed enables its integration into pre-commit hooks, where developers receive immediate feedback on hygiene violations before their code leaves the local development environment.

The hygiene checks complement rather than replace Credo and Dialyzer. While Credo focuses on general Elixir code style and Dialyzer focuses on type correctness, the hygiene system focuses on Prismatic Platform-specific patterns that neither tool detects. The three systems form a layered quality analysis stack: hygiene (sub-second, text-based), Credo (seconds, AST-based), and Dialyzer (minutes, type-based).

## Architecture

```
/hygiene Command
    |
    +-- Pattern Engine
    |       +-- Regex Pattern Library (25+ patterns)
    |       +-- AST-Free Analyzer
    |       +-- File Scanner (parallel)
    |       +-- Result Aggregator
    |
    +-- Check Categories
    |       +-- Anti-Pattern Detector
    |       |       +-- length() > 0 (use Enum.any?/1)
    |       |       +-- String.to_atom/1 (use String.to_existing_atom/1)
    |       |       +-- Process.sleep/1 (use Process.send_after/3)
    |       |       +-- Map access without default
    |       |       +-- Bare map access (use Map.get/3)
    |       |
    |       +-- Annotation Checker
    |       |       +-- Missing @spec
    |       |       +-- Missing @impl
    |       |       +-- Missing @moduledoc
    |       |       +-- Missing @doc
    |       |
    |       +-- Naming Convention Checker
    |       |       +-- Forbidden names (Manager, Handler, Utils)
    |       |       +-- Module naming consistency
    |       |       +-- Function naming patterns
    |       |
    |       +-- Security Pattern Checker
    |               +-- Hardcoded credentials
    |               +-- Unsafe deserialization
    |               +-- SQL injection patterns
    |               +-- XSS vulnerability patterns
    |
    +-- Performance Optimizer
    |       +-- Parallel File Processing
    |       +-- Incremental Analysis (changed files only)
    |       +-- Result Caching
    |       +-- Early Termination
    |
    +-- Reporter
            +-- Violation Formatter
            +-- Fix Suggestion Generator
            +-- Summary Statistics
            +-- Telemetry Emitter
```

The Pattern Engine processes files in parallel using Elixir's Task.async_stream for maximum throughput. Each file is analyzed against all active patterns in a single pass, minimizing I/O overhead. The result aggregator deduplicates findings and sorts them by severity and file location for clear reporting.

## Usage

### Full Hygiene Analysis

```bash
# Run complete hygiene analysis on the codebase
/hygiene

# Run with detailed violation output
/hygiene --verbose

# Run on specific umbrella application
/hygiene --app=prismatic_perimeter

# Run on specific files
/hygiene --files=apps/prismatic_web/lib/prismatic_web/live/*.ex
```

### Category-Specific Analysis

```bash
# Check anti-patterns only
/hygiene --category=anti-patterns

# Check annotation coverage
/hygiene --category=annotations

# Check naming conventions
/hygiene --category=naming

# Check security patterns
/hygiene --category=security
```

### Incremental Analysis

```bash
# Analyze only changed files (git-based)
/hygiene --changed

# Analyze files changed since a specific commit
/hygiene --since=HEAD~5

# Analyze staged files only (pre-commit mode)
/hygiene --staged
```

### Auto-Fix

```bash
# Preview auto-fixable violations
/hygiene --fix --dry-run

# Apply auto-fixes for safe patterns
/hygiene --fix

# Fix specific category only
/hygiene --fix --category=anti-patterns
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | string | all | Specific umbrella application to analyze |
| `--files` | string | all | Glob pattern for specific files to analyze |
| `--category` | string | all | Check category (anti-patterns, annotations, naming, security, all) |
| `--verbose` | flag | false | Include detailed violation context and suggestions |
| `--changed` | flag | false | Analyze only git-changed files |
| `--since` | string | none | Analyze files changed since a git reference |
| `--staged` | flag | false | Analyze only staged files (pre-commit integration) |
| `--fix` | flag | false | Apply auto-fixes for supported patterns |
| `--dry-run` | flag | false | Preview auto-fixes without applying |
| `--severity` | string | all | Minimum severity to report (info, warning, error, critical) |
| `--format` | string | text | Output format (text, json, markdown, checkstyle) |
| `--output` | string | stdout | File path for report output |
| `--parallel` | integer | auto | Number of parallel analysis workers |
| `--no-cache` | flag | false | Disable result caching |

## Execution Flow

1. **File Discovery**: Identify target files based on parameters (`--app`, `--files`, `--changed`, `--staged`). For incremental modes, use `git diff` to determine the changed file set. Apply exclusion patterns for generated files, vendor code, and test fixtures.

2. **Pattern Loading**: Load the active pattern library for the selected categories. Each pattern includes: the regex or text pattern, severity level, category, description, auto-fix capability, and suggested remediation.

3. **Parallel Analysis**: Distribute files across analysis workers using `Task.async_stream`. Each worker scans its assigned files against all active patterns, collecting violations with file path, line number, column, pattern ID, and matched text.

4. **Result Aggregation**: Collect results from all workers. Deduplicate findings where multiple patterns match the same violation. Sort by file path, then line number for logical reporting order.

5. **Auto-Fix Processing**: If `--fix` is enabled, generate fix proposals for supported patterns. For `--dry-run`, display proposed changes. For active fixing, apply changes atomically (all changes to a file are applied together or not at all).

6. **Report Generation**: Format violations according to the requested output format. Include summary statistics (total files analyzed, violations found, violations by category, violations by severity). Generate fix suggestions for non-auto-fixable violations.

7. **Telemetry Emission**: Report hygiene metrics to the [telemetry](@/glossary/telemetry.md) subsystem including files analyzed, violations found by category, analysis duration, and auto-fix counts.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent Execution | Executed by `quality-hygiene-specialist` at L2+ authority |
| [Quality Gates](@/glossary/quality-gates.md) | Direct Enforcement | Hygiene check is a mandatory quality gate component |
| [/quality-gates](@/commands/quality-gates.md) | Gate Integration | Hygiene results feed into quality gate pass/fail decisions |
| [/quality-enforce](@/commands/quality-enforce.md) | Enforcement Pipeline | Hygiene violations included in enforcement scoring |
| [/regression-check](@/commands/regression-check.md) | Regression Prevention | 25 custom Credo checks overlap with hygiene patterns |
| Pre-commit Hooks | Local Enforcement | Hygiene runs as a pre-commit phase in `.githooks/pre-commit` |
| [Telemetry](@/glossary/telemetry.md) | Metrics | Analysis metrics tracked for quality trend analysis |
| [Credo](@/glossary/credo.md) | Complementary Tool | Hygiene detects patterns Credo does not cover |
| CI/CD Pipeline | Pipeline Stage | Hygiene analysis runs as an early pipeline stage |

## Best Practices

**Pre-Commit Integration**: Configure the hygiene check in pre-commit hooks using `--staged` mode. This provides instant feedback on hygiene violations before code is committed, preventing violations from entering the repository.

**Incremental Over Full**: Use `--changed` for development feedback and full analysis for CI/CD pipelines. Incremental analysis takes milliseconds compared to sub-second full analysis, making it viable for continuous background checking.

**Fix Safely**: Always preview auto-fixes with `--dry-run` before applying them. While auto-fixes are designed to be semantically equivalent, reviewing the proposed changes ensures correctness in context-specific situations.

**Custom Pattern Development**: When new anti-patterns are identified during code reviews, add them to the hygiene pattern library. This converts one-time review findings into permanent, automated checks that prevent recurrence.

**Category Prioritization**: Focus on `security` category violations first, then `anti-patterns`, then `annotations`, then `naming`. Security patterns represent the highest risk, while naming conventions are important but lower priority.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `No files matched pattern` | Glob or filter matched zero files | Verify the `--app` or `--files` parameter |
| `Git not available` | `--changed` or `--staged` used without git | Ensure git is installed and the directory is a repository |
| `Auto-fix conflict` | Multiple patterns suggest conflicting fixes | Resolve the conflict manually; auto-fix one pattern at a time |
| `Pattern parse error` | Invalid regex in custom pattern definition | Fix the regex syntax in the pattern library |
| `Analysis timeout` | Very large file set exceeded time limit | Use `--parallel` to increase worker count or analyze by app |

## Advanced Usage

### Custom Pattern Definition

```elixir
# Define a custom hygiene pattern
%HygienePattern{
  id: :custom_unsafe_access,
  category: :anti_patterns,
  severity: :error,
  pattern: ~r/\bmap\[.*\]/,
  description: "Unsafe bracket map access; use Map.get/3",
  suggestion: "Replace map[key] with Map.get(map, key, default)",
  auto_fix: false
}
```

### Editor Integration

```bash
# Output in checkstyle format for editor integration
/hygiene --format=checkstyle --output=hygiene-report.xml

# Continuous watch mode for real-time feedback
/hygiene --watch --app=prismatic_web
```

### Quality DNA Integration

Hygiene results are stored in the Quality DNA system (`.claude/quality-dna/current-state.json`) for cross-session tracking of hygiene trends. This enables the platform to detect hygiene regression patterns and trigger automated remediation.

## Doctrine Compliance

All hygiene operations enforce the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine.

- **NO MERCY**: Zero tolerance for detected anti-patterns. Hygiene violations in pre-commit hooks block the commit. There are no severity thresholds that would allow "minor" violations to pass -- every detected pattern is reported and must be addressed.
- **NO DOUBTS**: Pattern matching is deterministic -- the same code always produces the same hygiene results. Auto-fix suggestions are verified against the pattern definition to ensure semantic equivalence. Fix previews (`--dry-run`) enable full investigation before action.

The command contributes directly to the platform's Quality Score (currently 100/100 PERFECT) by preventing the reintroduction of eliminated quality violations.

## Related Commands

- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](@/commands/quality-enforce.md) - Mandatory progressive [quality debt](@/glossary/quality-debt.md) elimination with AIAD enforcement
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/guardrails](@/commands/guardrails.md) - CI/CD guardrails enforcement for deployment safety
- [/health](@/commands/health.md) - System health check with component-level status reporting
- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)