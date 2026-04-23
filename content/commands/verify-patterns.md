+++
title = "/verify-patterns"
weight = 350
[extra]
category = "Quality"
description = "Pattern matching audit for file, module or entire codebase"
syntax = "/verify-patterns [options]"
authority = "L3"
agent = "pattern-matching-auditor"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1011
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["verify-patterns", "Pattern", "commands", "Quality", "Prismatic Platform", "Anti", "Phase", "Elixir"]
tags = ["commands", "quality", "verify-patterns", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/verify-patterns - Prismatic Platform"
+++

## Overview

**/verify-patterns** is a production command in the **Quality** category of the Prismatic Platform. It performs comprehensive [pattern matching](@/glossary/pattern-matching.md) audits across files, modules, or the entire codebase, verifying that code patterns conform to platform standards, detecting anti-patterns, validating pattern completeness in case/cond expressions, and ensuring consistent pattern usage across the 90+ umbrella applications. The command leverages Elixir's AST (Abstract Syntax Tree) analysis to identify pattern-related issues that conventional static analysis tools miss.

This command operates under the **L3** authority level and is executed by the `pattern-matching-auditor` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L3 authority level grants the auditor deep AST access across the entire codebase, enabling cross-module pattern consistency checks that require visibility into both producer and consumer modules.

Pattern matching is fundamental to Elixir and is the primary mechanism for control flow, data extraction, and error handling on the Prismatic Platform. Incorrect patterns cause subtle bugs: incomplete case clauses lead to `CaseClauseError`, overly broad matches swallow errors silently, and inconsistent patterns across modules create maintenance burden. `/verify-patterns` systematically identifies these issues through six audit categories: completeness, specificity, consistency, anti-patterns, performance, and idiom compliance.

## Architecture

The pattern verification system operates as a multi-pass AST analysis pipeline.

### Verification Architecture

```
             /verify-patterns
                    |
            Pattern Orchestrator
                    |
          +--------+--------+--------+
          |        |        |        |
       Complete  Specific  Consist  Anti
       Audit     Audit     Audit    Pattern
          |        |        |        |
    +-----+--+ +--+--+ +--+--+ +---+---+
    |    |   | |  |  | |  |  | |   |   |
   Case  With Match Guard Cross Unsafe Broad
   Check Check Check Check Check Match  Match
    |    |   | |  |  | |  |  | |   |   |
    +----+---+-+--+--+-+--+--+-+---+---+
                    |
            Finding Aggregator
                    |
          +--------+--------+
          |        |        |
       Critical  Warning  Info
       Patterns  Patterns Patterns
                    |
            Pattern Report
```

### Audit Categories

| Category | Focus | Example Issues |
|----------|-------|---------------|
| **Completeness** | All pattern branches covered | Missing clause in case, unhandled {:error, _} |
| **Specificity** | Patterns are precise, not overly broad | Catch-all `_` that swallows errors |
| **Consistency** | Patterns match across modules | Producer returns {:ok, data}, consumer matches {:ok, result} |
| **Anti-Patterns** | Known problematic patterns | `length(list) > 0` instead of `list != []` |
| **Performance** | Pattern efficiency | Nested pattern matches that could be simplified |
| **Idiom Compliance** | Elixir convention adherence | Using if/else where pattern matching is idiomatic |

### Anti-Pattern Library

| Anti-Pattern | Problem | Correct Pattern | Severity |
|-------------|---------|-----------------|----------|
| `length(list) > 0` | O(n) for empty check | `list != []` or pattern match | Medium |
| Bare `rescue _` | Swallows all exceptions | `rescue e in [SpecificError]` | High |
| `Map.get(m, k)` without nil handling | Silent nil propagation | Pattern match or `Map.fetch/2` | Medium |
| `String.to_atom/1` on user input | Atom table exhaustion | `String.to_existing_atom/1` | Critical |
| `Enum.count(list) == 0` | O(n) for empty check | `list == []` or `match?([], list)` | Low |
| Nested case without with | Deep nesting | `with` clause chain | Medium |
| `Process.sleep` in production code | Blocking process | Timer/GenServer scheduling | High |

## Usage

```bash
# Verify patterns in specific file
/verify-patterns apps/prismatic_web/lib/prismatic_web/live/perimeter_live.ex

# Verify patterns in specific module
/verify-patterns --module PrismaticPerimeter.SecurityRating

# Full codebase pattern audit
/verify-patterns --all

# Focus on specific audit category
/verify-patterns --category completeness --all

# Show only anti-patterns
/verify-patterns --anti-patterns --all

# Verify patterns in specific application
/verify-patterns --app prismatic_perimeter

# Export findings as JSON
/verify-patterns --all --format json --export ./pattern-report.json

# Show verbose findings with code context
/verify-patterns --verbose --all

# Verify recently changed files only
/verify-patterns --changed

# Dry run showing audit plan
/verify-patterns --dry-run --all
```

### Practical Examples

```bash
# Pre-commit pattern verification
/verify-patterns --changed --verbose

# Focus on critical anti-patterns across codebase
/verify-patterns --anti-patterns --min-severity high --all

# Cross-module consistency check for Perimeter module
/verify-patterns --category consistency --app prismatic_perimeter --verbose

# Verify case clause completeness in all LiveView modules
/verify-patterns --category completeness --app prismatic_web --module-pattern "*Live*"

# Generate fix suggestions for all anti-patterns
/verify-patterns --anti-patterns --all --suggest-fixes --format markdown --export ./pattern-fixes.md
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--module` | `string` | none | Specific module to verify |
| `--app` | `string` | none | Specific application to verify |
| `--all` | `flag` | false | Verify entire codebase |
| `--changed` | `flag` | false | Verify only recently changed files |
| `--category` | `enum` | all | Audit category: `completeness`, `specificity`, `consistency`, `anti-patterns`, `performance`, `idiom`, `all` |
| `--anti-patterns` | `flag` | false | Show only anti-patterns |
| `--min-severity` | `enum` | `info` | Minimum severity: `info`, `low`, `medium`, `high`, `critical` |
| `--verbose` | `flag` | false | Detailed findings with code context |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown` |
| `--export` | `path` | none | Export report to file |
| `--suggest-fixes` | `flag` | false | Include fix suggestions for each finding |
| `--module-pattern` | `string` | all | Glob pattern for module name filtering |
| `--dry-run` | `flag` | false | Show audit plan without executing |
| `--auto-fix` | `flag` | false | Automatically fix safe anti-patterns |

## Execution Flow

### Phase 1: Source Enumeration

Target source files are enumerated using [Git Trees](@/glossary/git-trees.md) for performance. For `--changed`, Git diff identifies modified Elixir files. For `--app`, all .ex files within the application are selected. For `--all`, all 6,652 .ex files are included.

### Phase 2: AST Parsing

Each source file is parsed into an AST using `Code.string_to_quoted/2`. The AST is traversed to identify all pattern-bearing constructs: `case`, `cond`, `with`, function heads with pattern matching, `receive`, `try/rescue`, and `=` assignments.

### Phase 3: Pattern Analysis

Each pattern construct is analyzed through the configured audit categories. Completeness checks verify all branches are covered. Specificity checks flag overly broad matches. Consistency checks compare patterns across module boundaries. Anti-pattern checks match against the 25+ item anti-pattern library.

### Phase 4: Cross-Reference Validation

For consistency audits, the analyzer correlates function return types (from @spec and actual returns) with calling code patterns. Mismatches between what a function returns and how its callers pattern-match the result are flagged as consistency violations.

### Phase 5: Report Generation

Findings are aggregated, deduplicated, and severity-scored. The report groups findings by category and severity, includes code context for each finding (surrounding lines), and optionally includes suggested fixes. Fix suggestions show the problematic pattern and the recommended replacement.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/quality-gates](@/commands/quality-gates.md) | Enforcement | Pattern findings affect gate passage |
| [/quality-evolve](@/commands/quality-evolve.md) | Consumer | Pattern findings drive quality evolution |
| [/scan-mycelium](@/commands/scan-mycelium.md) | Upstream | Mycelium scanner feeds pattern data |
| [/regression-check](@/commands/regression-check.md) | Peer | Regression checks include pattern verification |
| [/refactor](@/commands/refactor.md) | Downstream | Pattern fixes are refactoring operations |
| [/tech-debt](@/commands/tech-debt.md) | Peer | Anti-patterns are a form of technical debt |
| [Quality DNA](@/glossary/quality-dna.md) | State | Pattern health metrics persisted |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Pattern audit execution metrics |

## Best Practices

### Pre-Commit Verification

Run `/verify-patterns --changed` as part of the pre-commit workflow. Catching anti-patterns and incomplete patterns before commit prevents them from entering the codebase and accumulating as pattern debt.

### Anti-Pattern Zero Tolerance

Maintain zero anti-patterns across the codebase. The platform's current perfect quality score of 100/100 was achieved partly through systematic anti-pattern elimination. Use `/verify-patterns --anti-patterns --all` periodically to verify this standard is maintained.

### Cross-Module Consistency Focus

Pattern consistency across module boundaries is the highest-value audit category because inconsistencies cause runtime errors that unit tests in individual modules do not catch. Prioritize `--category consistency` in regular verification cycles.

### Safe Auto-Fix

Use `--auto-fix` only for anti-patterns with known safe transformations (like replacing `length(list) > 0` with `list != []`). Never auto-fix patterns that involve business logic or control flow changes.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `AST_PARSE_ERROR` | Cannot parse source file | Check file for syntax errors |
| `MODULE_NOT_FOUND` | Specified module does not exist | Verify module name and path |
| `CROSS_REF_UNAVAILABLE` | Cannot resolve cross-module references | Ensure all apps are compiled |
| `FIX_CONFLICT` | Auto-fix would change behavior | Manual review required |
| `SCAN_TIMEOUT` | Pattern analysis exceeded time limit | Narrow scope with --app or --module |
| `PATTERN_LIBRARY_STALE` | Anti-pattern library outdated | Update pattern library |

## Advanced Usage

### Custom Anti-Pattern Rules

Add project-specific anti-patterns:

```bash
/verify-patterns --custom-patterns ./patterns/prismatic-anti-patterns.yaml --all
```

### Pattern Coverage Metrics

Generate pattern coverage metrics per module:

```bash
/verify-patterns --coverage --app prismatic_perimeter --format json --export ./pattern-coverage.json
```

### Pattern Evolution Tracking

Track pattern health over time:

```bash
/verify-patterns --trends --since 30d --format markdown --export ./pattern-trends.md
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every anti-pattern is flagged, every incomplete case clause is reported, every inconsistency is identified.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every finding includes the source location, the problematic pattern, the reason it is problematic, and a suggested alternative.

## Related Commands

- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-evolve](@/commands/quality-evolve.md) - Quality-focused evolution targeting specific quality domains
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/scan-mycelium](@/commands/scan-mycelium.md) - Mycelial pattern scanning across documentation and code
- [/tech-debt](@/commands/tech-debt.md) - Technical debt analysis and elimination planning
- [/code](@/commands/code.md) - Core coding implementation and feature development

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)