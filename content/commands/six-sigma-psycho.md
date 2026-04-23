+++
title = "/six-sigma-psycho"
weight = 2120
[extra]
category = "Quality"
description = "Six Sigma quality gate enforcement with PSYCHO MODE intensity"
syntax = "/six-sigma-psycho [options]"
authority = "SUPREME"
agent = "quality-unified-supreme"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1341
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["six-sigma-psycho", "Sigma", "PSYCHO", "MODE", "commands", "Quality", "Prismatic Platform", "Layer", "PSYCHO MODE", "Zero"]
tags = ["commands", "quality", "six-sigma-psycho", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/six-sigma-psycho - Prismatic Platform"
+++

## Overview

**/six-sigma-psycho** is a production command in the **Quality** category of the Prismatic Platform that enforces Six Sigma quality gate standards with PSYCHO MODE intensity. This is the most aggressive quality enforcement command in the platform's arsenal, combining industrial Six Sigma methodologies (3.4 defects per million opportunities) with the platform's own zero-tolerance quality philosophy to produce an enforcement regime that goes beyond conventional static analysis into deep structural, semantic, and behavioral quality verification.

Where standard quality gates check for compilation warnings, Credo violations, and test coverage, PSYCHO MODE adds layers of analysis that most development teams never consider: function complexity scoring with mandatory refactoring thresholds, module coupling analysis with maximum dependency limits, naming convention enforcement across the entire 6,652-file codebase, performance regression detection through historical benchmarks, and even aesthetic code quality metrics like function length distribution and comment-to-code ratios.

This command operates under the **SUPREME** authority level -- the highest authority tier in the platform -- and is executed by the `quality-unified-supreme` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The SUPREME authority requirement means this command can override any other quality assessment, block any merge regardless of who authored it, and escalate violations directly to the highest review level.

The "PSYCHO" designation is not hyperbole -- it reflects a quality enforcement philosophy that treats every deviation from perfection as a defect worthy of investigation. The platform's current quality score of 100/100 across 13 domains with zero violations in every category is a direct result of PSYCHO MODE enforcement eliminating the 905 quality debt patterns (QDPs) that existed before its activation.

## Architecture

The Six Sigma PSYCHO system implements a multi-layer quality analysis pipeline that progressively escalates the depth and strictness of analysis.

```
Source Code Input
       |
       v
  [Layer 1: Compilation]     -- Zero warnings, --warnings-as-errors
       |
       v
  [Layer 2: Static Analysis]  -- Credo --strict, custom checks
       |
       v
  [Layer 3: Type Analysis]    -- Dialyzer PLT verification
       |
       v
  [Layer 4: Coverage]         -- Test coverage thresholds
       |
       v
  [Layer 5: PSYCHO Checks]   -- Deep structural analysis
       |
       v
  [Layer 6: Regression]       -- Historical quality comparison
       |
       v
  Quality Verdict: PASS / FAIL
```

| Layer | Check Category | Threshold | Enforcement |
|-------|---------------|-----------|-------------|
| **Layer 1** | Compilation | Zero warnings | BLOCKING |
| **Layer 2** | Static Analysis (Credo) | Zero violations | BLOCKING |
| **Layer 3** | Type Safety (Dialyzer) | Zero violations | BLOCKING |
| **Layer 4** | Test Coverage | 100% lines | BLOCKING |
| **Layer 5** | PSYCHO Structural | All metrics green | BLOCKING |
| **Layer 6** | Regression Prevention | No quality decrease | BLOCKING |

### PSYCHO Layer 5 Deep Checks

| Check | Metric | Threshold | Description |
|-------|--------|-----------|-------------|
| Cyclomatic Complexity | Per function | Max 10 | Functions exceeding this must be refactored |
| Module Coupling | Dependency count | Max 8 direct deps | Modules with too many dependencies must be split |
| Function Length | Lines per function | Max 30 | Long functions must be decomposed |
| Module Length | Lines per module | Max 500 | Large modules must be split |
| Naming Consistency | Pattern adherence | 100% | All names must follow platform conventions |
| Dead Code | Unreachable functions | Zero | All dead code must be removed |
| Unsafe Map Access | `map.key` usage | Zero | All map access must use `Map.get/3` or pattern matching |
| Process.sleep | Runtime usage | Zero | No `Process.sleep` in production code |
| String.to_atom | Dynamic atoms | Zero | No dynamic atom creation |
| @impl Coverage | Callback annotation | 100% | All callback implementations must be annotated |

## Usage

### Standard PSYCHO Mode

```bash
# Run full Six Sigma PSYCHO analysis on entire codebase
/six-sigma-psycho

# Run on a specific application
/six-sigma-psycho --app prismatic_perimeter

# Run on recently modified files only
/six-sigma-psycho --changed-only

# Run with detailed violation breakdown
/six-sigma-psycho --verbose
```

### Targeted Analysis

```bash
# Run only PSYCHO Layer 5 deep checks
/six-sigma-psycho --layer 5

# Run specific check categories
/six-sigma-psycho --checks complexity,coupling,naming

# Run against a specific file or directory
/six-sigma-psycho --path apps/prismatic_web/lib/

# Run with auto-fix for fixable violations
/six-sigma-psycho --fix
```

### Reporting and CI Integration

```bash
# Generate JSON report for CI pipeline consumption
/six-sigma-psycho --format json --output quality-report.json

# Generate trend report comparing against last 10 runs
/six-sigma-psycho --trend --history 10

# Run in CI mode (exit code 1 on any violation)
/six-sigma-psycho --ci --strict

# Generate quality dashboard data
/six-sigma-psycho --dashboard
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--app` | string | all apps | Target specific umbrella application |
| `--path` | string | entire codebase | Target specific file or directory |
| `--layer` | integer | all layers | Run specific layer (1-6) |
| `--checks` | string | all checks | Comma-separated specific checks to run |
| `--changed-only` | flag | false | Only analyze files changed since last commit |
| `--verbose` | flag | false | Detailed violation output with suggested fixes |
| `--fix` | flag | false | Auto-fix fixable violations (unsafe map access, naming, etc.) |
| `--format` | string | `text` | Output format: `text`, `json`, `html`, `markdown` |
| `--output` | string | stdout | Write results to file |
| `--trend` | flag | false | Include historical trend analysis |
| `--history` | integer | `5` | Number of historical runs for trend analysis |
| `--ci` | flag | false | CI mode: non-interactive, exit code reflects status |
| `--strict` | flag | true | Strict mode (default on): all layers must pass |
| `--dashboard` | flag | false | Generate dashboard-compatible metrics output |
| `--threshold` | string | `six-sigma` | Quality standard: `six-sigma` (3.4 DPMO), `five-sigma`, `four-sigma` |

## Execution Flow

1. **Environment Validation** -- Verify that the build environment is clean (`_build` not corrupted), PLT files are current, and all dependencies are compiled. If validation fails, suggest corrective actions.

2. **Layer 1: Compilation** -- Execute `mix compile --warnings-as-errors --force` across all target applications. Any warning is treated as a blocking failure. The `--force` flag ensures that stale beam files do not mask new warnings.

3. **Layer 2: Static Analysis** -- Execute `mix credo --strict` with all 25+ custom Credo checks enabled. This includes platform-specific checks for unsafe map access, Process.sleep detection, and datetime precision enforcement.

4. **Layer 3: Type Analysis** -- Verify Dialyzer PLT is current, then run Dialyzer across all target modules. Type specification violations, unknown function calls, and contract violations are all blocking failures.

5. **Layer 4: Coverage Analysis** -- Execute `mix test --cover` and verify that line coverage meets the 100% threshold. Applications with coverage below threshold are listed with specific uncovered lines.

6. **Layer 5: PSYCHO Deep Analysis** -- Execute the platform's proprietary deep structural analysis engine. This layer performs the checks listed in the Architecture section: complexity scoring, coupling analysis, naming verification, dead code detection, and unsafe pattern identification.

7. **Layer 6: Regression Check** -- Compare current quality metrics against the historical baseline. If any metric has decreased since the last analysis, flag it as a regression violation. This prevents gradual quality erosion through incremental changes.

8. **Verdict and Reporting** -- Aggregate results from all layers into a unified quality verdict. Generate the report in the requested format. In CI mode, set exit code to 0 (all pass) or 1 (any failure).

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Quality Gates](/glossary/quality-gates/) | Enforcement | Supersedes standard quality gates with PSYCHO-level strictness |
| [Pre-commit Hooks](/glossary/quality-gates/) | Prevention | Can be configured as pre-commit check (expensive, use for critical branches) |
| [Quality DNA](/glossary/quality-dna/) | Baseline | Reads and updates quality DNA state after each run |
| [Credo](/glossary/credo/) | Analysis Engine | Leverages Credo with 25+ custom checks for Layer 2 |
| [Dialyzer](/glossary/dialyzer/) | Type Checking | Dialyzer integration for Layer 3 type analysis |
| [Telemetry](/glossary/telemetry/) | Observability | Emits detailed metrics for quality dashboards |
| [GitLab CI/CD](/glossary/gitlab-ci/) | Pipeline | Integrated as CI pipeline stage for merge request validation |

## Best Practices

**Run Frequency**: PSYCHO MODE is intensive. Run it at milestone boundaries, before releases, or as a CI gate on merge requests to protected branches. For day-to-day development, standard quality gates are sufficient; save PSYCHO MODE for the critical checkpoints.

**Incremental Adoption**: If onboarding a new application or legacy code into PSYCHO MODE enforcement, start with `--threshold four-sigma` and progressively tighten to `six-sigma` as violations are eliminated. Jumping directly to Six Sigma on a low-quality codebase produces overwhelming violation counts.

**Auto-Fix with Caution**: The `--fix` flag can automatically resolve many violations (unsafe map access patterns, naming inconsistencies), but always review the changes before committing. Auto-fixes are syntactically correct but may not preserve the intended semantics in all cases.

**Layer-by-Layer Debugging**: When PSYCHO MODE produces many violations, debug one layer at a time using `--layer N`. Fix Layer 1 violations first (compilation), then Layer 2 (Credo), and so on. Each layer builds on the previous one.

## Error Handling

| Error Condition | Response | Recovery |
|----------------|----------|----------|
| Stale PLT files | Suggest PLT rebuild command | Run `rm -rf priv/plts/dialyzer.plt && mix dialyzer` |
| Compilation failure | Report errors, skip subsequent layers | Fix compilation errors first |
| Coverage data unavailable | Skip Layer 4, warn about incomplete analysis | Run `mix test --cover` manually to diagnose |
| Historical baseline missing | Run without regression check, warn | First run establishes baseline automatically |
| Out of memory (large codebase) | Run per-app: `--app prismatic_web` | Split analysis across multiple runs |

## Advanced Usage

### CASCADE Pattern Detection

PSYCHO MODE includes specialized detection for CASCADE patterns -- classes of quality violations that the platform has identified and eliminated at scale.

```bash
# Detect CASCADE patterns specifically
/six-sigma-psycho --checks cascade

# CASCADE categories:
# - Type Mismatch: Incorrect type annotations
# - Dead Code: Unreachable functions and modules
# - Empty Check: `length() > 0` anti-patterns
# - Timer Replacement: Process.sleep in production code
# - Nuclear Cache: Stale _build artifacts masking issues
```

### Quality DNA Integration

```bash
# Update Quality DNA after PSYCHO analysis
/six-sigma-psycho --update-dna

# Compare against Quality DNA baseline
/six-sigma-psycho --diff-dna

# Generate Quality DNA evolution report
/six-sigma-psycho --dna-evolution --range 30d
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: PSYCHO MODE is the ultimate expression of NO MERCY in quality enforcement. Zero violations across all six layers, zero regressions from baseline, zero tolerance for "minor" quality issues. The platform's perfect 100/100 quality score exists because PSYCHO MODE treats every defect as unacceptable.
- **NO DOUBTS**: Every violation report includes the specific file, line number, violation type, and suggested remediation. Quality verdicts are evidence-based, backed by static analysis, type checking, and test coverage metrics. There is no ambiguity in PSYCHO MODE results -- code either passes or it does not.

## Related Commands

- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations
- [/spec-coverage](/commands/spec-coverage/) - Analyze @spec coverage for typespec completeness
- [/verify-patterns](/commands/verify-patterns/) - Pattern matching audit for file, module or entire codebase
- [/code](/commands/code/) - Core coding implementation and feature development

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)