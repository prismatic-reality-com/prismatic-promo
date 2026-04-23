+++
title = "/spec-coverage"
weight = 380
[extra]
category = "Quality"
description = "Analyze @spec coverage for typespec completeness"
syntax = "/spec-coverage [options]"
authority = "L2+"
agent = "quality-unified-supreme"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1160
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["spec-coverage", "Analyze", "commands", "Quality", "Prismatic Platform", "Dialyzer", "Coverage", "Cross"]
tags = ["commands", "quality", "spec-coverage", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/spec-coverage - Prismatic Platform"
+++

## Overview

**/spec-coverage** is a production command in the **Quality** category of the Prismatic Platform that analyzes `@spec` coverage for [typespec](/glossary/typespec/) completeness across the codebase. Type specifications in Elixir serve as both documentation and verification artifacts -- they describe the expected input types and return types of functions, enabling Dialyzer to perform static type analysis and catch type-related bugs at compile time rather than in production. The `/spec-coverage` command measures how completely the codebase's public API is annotated with type specifications and identifies gaps that could allow type errors to go undetected.

In a codebase of over 6,652 `.ex` files spanning 89 umbrella applications, maintaining comprehensive typespec coverage is a significant ongoing effort. Without automated measurement and enforcement, coverage tends to erode over time as developers add new functions without corresponding specs, or modify function signatures without updating the associated type annotations. The `/spec-coverage` command provides the measurement foundation that makes the platform's 100% typespec coverage target actionable and verifiable.

This command operates under the **L2+** authority level and is executed by the `quality-unified-supreme` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The analysis integrates with the broader quality pipeline, feeding coverage metrics into the [Quality DNA](/glossary/quality-dna/) system and contributing to the platform's 100/100 quality score.

The command goes beyond simple presence/absence checking. It validates that specs are semantically meaningful (not just `@spec function(any()) :: any()`), that they accurately reflect the function's actual behavior (cross-referenced with Dialyzer), and that complex types use named type definitions rather than inline anonymous types, improving readability and reusability of type annotations.

## Architecture

The spec coverage analysis system operates through a multi-phase pipeline that combines AST analysis with Dialyzer cross-validation.

```
Source Files
       |
       v
  [AST Parser]              -- Extract module, function, and spec definitions
       |
       v
  [Coverage Calculator]      -- Match functions to specs, compute coverage %
       |
       v
  [Quality Validator]        -- Check spec semantic quality
       |
       v
  [Dialyzer Cross-Check]    -- Verify specs match actual behavior
       |
       v
  [Report Generator]        -- Coverage report with gap analysis
```

| Component | Purpose | Implementation |
|-----------|---------|----------------|
| **AST Parser** | Parses Elixir source files to extract function heads and `@spec` attributes | `Code.string_to_quoted/2` with metadata |
| **Coverage Calculator** | Matches each public function to its corresponding spec annotation | Custom module/function registry |
| **Quality Validator** | Checks that specs are semantically meaningful, not overly broad | Heuristic analysis of type expressions |
| **Dialyzer Cross-Check** | Verifies that specs agree with Dialyzer's inferred types | PLT query integration |
| **Report Generator** | Produces coverage reports with per-module and per-app breakdowns | Multi-format output engine |

## Usage

### Basic Analysis

```bash
# Analyze spec coverage across entire codebase
/spec-coverage

# Analyze a specific application
/spec-coverage --app prismatic_perimeter

# Analyze a specific module
/spec-coverage --module PrismaticPerimeter.SecurityRating

# Show only uncovered functions
/spec-coverage --uncovered-only
```

### Detailed Reports

```bash
# Generate detailed per-module breakdown
/spec-coverage --verbose

# Generate coverage report in JSON format
/spec-coverage --format json --output spec-coverage.json

# Generate trend report over time
/spec-coverage --trend --history 10

# Compare coverage between two branches
/spec-coverage --diff main..feature/new-api
```

### Quality-Focused Analysis

```bash
# Check spec quality (meaningful types, not just any())
/spec-coverage --quality-check

# Find specs that contradict Dialyzer's inferred types
/spec-coverage --dialyzer-validate

# Find functions with overly broad specs (any() -> any())
/spec-coverage --find-broad-specs

# Generate suggested specs for uncovered functions
/spec-coverage --suggest
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--app` | string | all apps | Target specific umbrella application |
| `--module` | string | all modules | Target specific module |
| `--uncovered-only` | flag | false | Show only functions without specs |
| `--verbose` | flag | false | Detailed per-module breakdown |
| `--format` | string | `text` | Output format: `text`, `json`, `markdown`, `csv` |
| `--output` | string | stdout | Write results to file |
| `--trend` | flag | false | Include historical trend analysis |
| `--history` | integer | `5` | Number of historical snapshots for trends |
| `--diff` | string | - | Compare coverage between git refs (e.g., `main..HEAD`) |
| `--quality-check` | flag | false | Validate semantic quality of existing specs |
| `--dialyzer-validate` | flag | false | Cross-validate specs against Dialyzer's inferred types |
| `--find-broad-specs` | flag | false | Find overly permissive specs (`any()` usage) |
| `--suggest` | flag | false | Generate suggested specs for uncovered functions |
| `--threshold` | float | `100.0` | Minimum coverage percentage (fails if below) |
| `--exclude` | string | - | Comma-separated modules or patterns to exclude |
| `--include-private` | flag | false | Include private functions in analysis |

## Execution Flow

1. **Module Discovery** -- Scan the target scope (entire codebase, specific app, or specific module) to identify all Elixir source files. Use `git ls-tree` for efficient file enumeration across the 6,652+ source files.

2. **AST Parsing** -- Parse each source file into an AST representation using `Code.string_to_quoted/2`. Extract all function definitions (`def`, `defp`), their arities, and any associated `@spec` attributes.

3. **Coverage Calculation** -- For each public function (or all functions if `--include-private`), check whether a corresponding `@spec` exists. Calculate coverage percentages at the function, module, and application levels.

4. **Quality Validation** -- When `--quality-check` is enabled, analyze the semantic quality of each spec. Flag specs that use overly broad types like `any()`, `term()` without justification, or that specify the same type for all parameters. Check for proper use of named types via `@type` definitions.

5. **Dialyzer Cross-Validation** -- When `--dialyzer-validate` is enabled, query the Dialyzer PLT to obtain inferred types for each function. Compare inferred types against declared specs, flagging contradictions where the spec is more permissive or more restrictive than what Dialyzer observes.

6. **Suggestion Generation** -- When `--suggest` is enabled, use Dialyzer's inferred types to generate recommended `@spec` annotations for uncovered functions. Suggestions are formatted as copy-paste-ready code blocks.

7. **Report Assembly** -- Compile all analysis results into the final report. Include summary statistics, per-module breakdowns, gap lists, and quality findings.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Dialyzer](/glossary/dialyzer/) | Cross-Validation | Verifies spec accuracy against inferred types |
| [Quality Gates](/glossary/quality-gates/) | Enforcement | Spec coverage is a quality gate checkpoint |
| [Quality DNA](/glossary/quality-dna/) | Metrics | Coverage metrics feed into Quality DNA state |
| [Credo](/glossary/credo/) | Complementary | Credo checks for missing specs; this command provides deeper analysis |
| [Telemetry](/glossary/telemetry/) | Observability | Coverage metrics emitted as telemetry events |
| [/six-sigma-psycho](/commands/six-sigma-psycho/) | PSYCHO Layer | Spec coverage is part of PSYCHO Layer 5 analysis |
| [/regression-check](/commands/regression-check/) | Regression | Coverage decreases trigger regression violations |

## Best Practices

**Spec-First Development**: Write `@spec` annotations before or immediately after implementing a function. This practice ensures specs are current and encourages thinking about types during design rather than as an afterthought.

**Named Types**: Define custom types with `@type` and `@typep` for complex or reusable type expressions. `@spec calculate_score(SecurityRating.t(), [SecurityFinding.t()]) :: {:ok, score()} | {:error, reason()}` is far more readable than inline struct definitions.

**Avoid Overly Broad Specs**: A spec of `@spec process(any()) :: any()` provides no value -- it tells Dialyzer nothing it does not already know. If a function truly accepts any input, consider whether the design can be tightened. If not, use `@spec process(term()) :: term()` with a `@doc` explaining why.

**Spec Coverage in Code Review**: Make spec coverage a code review checkpoint. New public functions without specs should be flagged during review, not discovered weeks later by automated analysis.

**Cross-Application Consistency**: When functions in one application call functions in another, ensure the spec types are compatible. The `--dialyzer-validate` flag helps catch cross-application type mismatches.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Parse error in source file | Skip file, report error, continue analysis | Fix syntax errors in the flagged file |
| Dialyzer PLT not found | Skip cross-validation, warn about incomplete analysis | Run `mix dialyzer --plt` to build PLT |
| Module not found | Report not-found error with available module suggestions | Verify module name matches actual module definition |
| Coverage below threshold | Exit with non-zero code, report gap details | Add specs to uncovered functions |
| Large codebase timeout | Process apps in batches, report partial results | Run per-app: `--app prismatic_web` |

## Advanced Usage

### CI Pipeline Integration

```bash
# Fail CI if spec coverage drops below 100%
/spec-coverage --ci --threshold 100.0

# Generate coverage badge data
/spec-coverage --format json | jq '.summary.percentage' > coverage-badge.json

# Incremental check: only verify changed files
/spec-coverage --changed-only --threshold 100.0
```

### Coverage Evolution Tracking

```bash
# Record current coverage as baseline
/spec-coverage --save-baseline

# Compare against saved baseline
/spec-coverage --compare-baseline

# Generate monthly coverage evolution report
/spec-coverage --trend --history 30 --format markdown > coverage-trend.md
```

### Automated Spec Generation

```elixir
# Example generated spec suggestion
# For function: PrismaticPerimeter.SecurityRating.calculate/2
# Suggested spec based on Dialyzer inference:
@spec calculate(domain :: String.t(), opts :: keyword()) ::
        {:ok, %{grade: atom(), score: non_neg_integer()}} | {:error, String.t()}
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: The platform mandates 100% typespec coverage on all public functions. Functions without specs are treated as quality violations subject to the same enforcement as compilation warnings or test failures. The `--quality-check` mode goes further, rejecting specs that are technically present but semantically useless.
- **NO DOUBTS**: Coverage metrics are computed from AST analysis of actual source code -- not estimates or samples. Cross-validation with Dialyzer provides independent verification that specs accurately describe function behavior. Coverage results are reproducible and auditable.

## Related Commands

- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations
- [/six-sigma-psycho](/commands/six-sigma-psycho/) - Six Sigma quality gate enforcement with PSYCHO MODE intensity
- [/verify-patterns](/commands/verify-patterns/) - Pattern matching audit for file, module or entire codebase
- [/trinity](/commands/trinity/) - Trinity system status and rigidity score verification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)