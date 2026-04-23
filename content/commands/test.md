+++
title = "/test"
weight = 70
[extra]
category = "Development"
description = "Comprehensive test generation and verification"
syntax = "/test [options]"
authority = "L2+"
agent = "testing-specialist"
status = "Production"
usage = "high"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1143
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["test", "Comprehensive", "commands", "Development", "Prismatic Platform", "Phase"]
tags = ["commands", "development", "test", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/test - Prismatic Platform"
+++

## Overview

**/test** is a production command in the **Development** category of the Prismatic Platform. It provides comprehensive test generation, execution, and verification across the entire umbrella codebase, covering unit tests, integration tests, property-based tests, and contract tests. The command analyzes source code to identify testable behaviors, generates ExUnit test modules with appropriate assertions, executes test suites with configurable scope, and reports results with coverage metrics. It is one of the highest-usage commands in the platform, integral to the NO MERCY doctrine requirement of 100% test coverage.

This command operates under the **L2+** authority level and is executed by the `testing-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The testing-specialist agent has deep knowledge of ExUnit conventions, property-based testing with StreamData, LiveView testing patterns, Ecto test sandboxing, and the platform's 121-test three-phase test architecture (Phase 1: Workflow/Step, Phase 2: Storage/Web/Agent, Phase 3: E2E).

The platform maintains 5,864 test files across 90+ umbrella applications. `/test` manages this test estate: generating new tests for uncovered code, running targeted test suites for modified modules, verifying test quality (assertions per test, edge case coverage, determinism), and enforcing the platform's mandatory regression test protocol. Every bug fix produced by [/fix](@/commands/fix.md) is validated through `/test`-generated regression tests.

## Architecture

The test system operates as a three-stage pipeline: analysis, generation, and execution.

### Test Architecture

```
             /test
                |
          Test Orchestrator
                |
          +-----+-----+-----+
          |     |     |     |
       Analyze Generate  Execute
       Module  Module    Module
          |     |     |
    +-----+-+ +-+-+ +-+-----+
    |   |   | | | | |   |   |
   Func Spec Edge Unit Prop Integ
   Scan  Ext  Case Gen  Gen  Gen
    |   |   | | | | |   |   |
    +---+---+-+-+-+-+---+---+
                |
          Execution Engine
                |
          +-----+-----+-----+
          |     |     |     |
       ExUnit  Cover  Report
       Runner  Tracker Generator
```

### Test Categories

| Category | Generator | Assertion Style | Coverage Target |
|----------|-----------|-----------------|-----------------|
| **Unit Tests** | Function analysis | `assert`/`refute` on return values | All public functions |
| **Property Tests** | @spec type analysis | StreamData generators, `check all` | Complex logic |
| **Integration Tests** | Module interaction | Multi-module scenarios | Module boundaries |
| **Contract Tests** | Behaviour/Protocol | Adapter contract assertions | All implementations |
| **LiveView Tests** | Route + LiveView | `render`, `live`, `element` | All LiveView pages |
| **Controller Tests** | Router analysis | `conn` pipeline assertions | All routes |
| **Regression Tests** | Bug analysis | Specific failure reproduction | All bug fixes |

### Three-Phase Test Architecture

| Phase | Test Count | Scope | Purpose |
|-------|-----------|-------|---------|
| **Phase 1** | 36 | Workflow + Step | Core pipeline correctness |
| **Phase 2** | 41 | Storage + Web + Agent | Integration layer validation |
| **Phase 3** | 44 | End-to-End | Full system verification |

## Usage

```bash
# Run all tests
/test

# Run tests for specific application
/test --app prismatic_web

# Generate tests for specific module
/test --generate PrismaticPerimeter.SecurityRating

# Run tests for recently modified files
/test --changed

# Run tests with coverage reporting
/test --coverage

# Generate property-based tests
/test --property PrismaticStorage.ETS.Adapter

# Run specific test file
/test --file apps/prismatic_web/test/prismatic_web/live/perimeter_live_test.exs

# Generate regression test for a bug
/test --regression "nil access in SecurityRating.calculate/1"

# Run tests matching a tag
/test --tag integration

# Show test statistics
/test --stats

# Run tests in watch mode
/test --watch
```

### Practical Examples

```bash
# Pre-commit test verification
/test --changed --coverage --fail-under 80

# Generate comprehensive tests for new module
/test --generate PrismaticPerimeter.AssetDiscovery --include-property --include-integration

# Run LiveView-specific tests
/test --app prismatic_web --tag liveview --verbose

# Contract test verification for all storage adapters
/test --tag contract --verbose

# Generate and run regression test for specific bug
/test --regression "empty list crash in ComplianceAssessment.assess/2" --verify

# Full platform test suite with timing analysis
/test --all --timing --slow-threshold 500ms

# CI mode with strict coverage and JUnit output
/test --all --coverage --fail-under 85 --format junit --export ./test-results/
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | `string` | all | Specific application to test |
| `--file` | `path` | none | Specific test file to run |
| `--generate` | `string` | none | Module to generate tests for |
| `--regression` | `string` | none | Bug description for regression test generation |
| `--changed` | `flag` | false | Test only recently modified files |
| `--coverage` | `flag` | false | Include coverage reporting |
| `--fail-under` | `integer` | 0 | Minimum coverage percentage (CI mode) |
| `--property` | `string` | none | Generate property-based tests for module |
| `--tag` | `string` | none | Run tests matching tag |
| `--exclude-tag` | `string` | none | Exclude tests matching tag |
| `--verbose` | `flag` | false | Detailed test output |
| `--watch` | `flag` | false | Re-run tests on file changes |
| `--timing` | `flag` | false | Show test execution timing |
| `--slow-threshold` | `duration` | `1s` | Threshold for marking tests as slow |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `junit` |
| `--export` | `path` | none | Export results to file |
| `--all` | `flag` | false | Run complete test suite across all apps |
| `--seed` | `integer` | random | ExUnit random seed for reproducibility |
| `--include-property` | `flag` | false | Include property tests in generation |
| `--include-integration` | `flag` | false | Include integration tests in generation |
| `--verify` | `flag` | false | Verify generated tests pass |
| `--stats` | `flag` | false | Show test suite statistics |

## Execution Flow

### Phase 1: Test Scope Resolution

Based on options, the test scope is determined. For `--changed`, Git diff identifies modified source files and their corresponding test files. For `--app`, all tests within the application are selected. For `--generate`, the target module is analyzed to determine what tests are needed.

### Phase 2: Test Generation (when applicable)

For `--generate` and `--regression` modes, the testing-specialist analyzes the target module. Public functions are extracted with their @spec types. Edge cases are identified from guard clauses, pattern matching, and conditional branches. Test modules are generated with appropriate setup, test cases, and assertions. Property tests use StreamData generators derived from @spec types.

### Phase 3: Test Execution

Tests are executed through ExUnit with configured options. For umbrella applications, tests run with `--warnings-as-errors` to catch runtime issues. Ecto tests use the SQL sandbox for database isolation. LiveView tests use the test endpoint configuration. Coverage tracking is enabled via `mix test --cover`.

### Phase 4: Result Analysis

Test results are analyzed for: pass/fail counts, test duration distribution, coverage metrics by module and line, slow tests exceeding threshold, and flaky test detection (when `--seed` is varied). Generated tests are validated against the target module to ensure adequate coverage.

### Phase 5: Report Generation

Results are formatted according to the requested output. The report includes: test suite summary, failure details with stack traces, coverage report with uncovered lines, timing analysis for slow tests, and recommendations for additional test coverage.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/code](@/commands/code.md) | Peer | Code implementation paired with test generation |
| [/fix](@/commands/fix.md) | Upstream | Bug fixes require regression tests from /test |
| [/svihadlo](@/commands/svihadlo.md) | Upstream | Rapid features include auto-generated tests |
| [/quality-gates](@/commands/quality-gates.md) | Enforcement | Test passage is a quality gate requirement |
| [/regression-check](@/commands/regression-check.md) | Peer | Regression checks validate test adequacy |
| [/refactor](@/commands/refactor.md) | Validation | Refactoring verified by existing tests |
| [Quality DNA](@/glossary/quality-dna.md) | State | Test metrics persisted in quality DNA |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Test execution metrics and trends |

## Best Practices

### Test-Driven Development

Use `/test --generate` before writing implementation code to establish expected behavior. Generated test skeletons define the contract that the implementation must satisfy. This approach produces cleaner interfaces and higher-quality implementations.

### Regression Test Discipline

Every bug fix must include a regression test. Use `/test --regression` to generate tests that reproduce the specific failure condition. The mandatory regression test protocol requires: test fails before fix, test passes after fix, test is committed with the fix.

### Coverage Monitoring

Run `/test --coverage --fail-under 80` in CI pipelines to prevent coverage degradation. For critical modules (security, authentication, data access), target 95%+ coverage. Use `/test --stats` to identify modules with declining coverage.

### Property-Based Testing for Complex Logic

For functions with complex input domains (parsers, validators, scoring algorithms), generate property-based tests with `/test --property`. StreamData generators explore input spaces more thoroughly than hand-written test cases, catching edge cases that example-based tests miss.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `COMPILATION_FAILURE` | Test file fails to compile | Check test file for syntax errors |
| `SANDBOX_TIMEOUT` | Ecto sandbox checkout timed out | Increase sandbox timeout or check for long-running transactions |
| `FLAKY_DETECTED` | Test produces inconsistent results | Investigate non-deterministic behavior; add `--seed` for debugging |
| `COVERAGE_BELOW_THRESHOLD` | Coverage below `--fail-under` value | Add tests for uncovered modules |
| `GENERATION_FAILURE` | Cannot generate tests for module | Check module has public functions with @spec |
| `REGRESSION_INCOMPLETE` | Regression test does not reproduce bug | Refine bug description for more precise test |
| `TEST_TIMEOUT` | Individual test exceeded timeout | Check for infinite loops or slow external calls |

## Advanced Usage

### Mutation Testing

Verify test quality through mutation testing:

```bash
/test --mutation PrismaticPerimeter.SecurityRating --verbose
```

### Test Parallelism Optimization

Optimize test execution for CI:

```bash
/test --all --max-parallel 8 --partition 1/4 --format junit --export ./results/
```

### Snapshot Testing

Generate snapshot tests for complex output:

```bash
/test --snapshot PrismaticPerimeter.ComplianceReport.generate/1 --format json
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. 100% test coverage is the standard. No untested code, no stubs, no mocks, no placeholders.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every test assertion is grounded in specification or observed behavior. Test generation is based on actual code analysis, not template guessing.

## Related Commands

- [/code](@/commands/code.md) - Core coding implementation and feature development
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/svihadlo](@/commands/svihadlo.md) - Ultra-fast visible feature implementation in 5-15 minutes
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/regression-check](@/commands/regression-check.md) - Execute 25 custom [Credo](@/glossary/credo.md) regression checks preventing 700+ violations
- [/validate](@/commands/validate.md) - Input validation and data integrity enforcement

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)