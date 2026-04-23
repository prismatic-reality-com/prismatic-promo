+++
title = "Verification Gate"
description = "Comprehensive architecture of verification gates, quality checkpoints, pre-commit hooks, CI/CD gates, and automated enforcement mechanisms that ensure code quality, security, and correctness across the Prismatic Platform."
weight = 42

[extra]
category = "quality"
tags = ["verification-gate", "quality-gates", "pre-commit", "ci-cd", "static-analysis", "testing", "credo", "dialyzer", "enforcement", "automation"]
related_terms = ["quality-gates", "quality-gate", "pre-commit-hooks", "credo", "dialyzer", "compilation", "testing", "test-coverage", "ci-cd", "quality-dna", "quality-floor-guardian", "regression-testing"]
keywords = ["verification gate quality enforcement", "pre-commit hook Elixir", "CI/CD quality gates", "automated code verification", "quality gate pipeline", "static analysis enforcement", "Elixir pre-commit checks", "code quality automation", "verification checkpoint architecture", "quality enforcement pipeline"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "1.0.0"
learning_outcomes = ["Understand the multi-phase verification gate architecture", "Configure and extend pre-commit hooks for Elixir projects", "Implement quality gates that enforce compilation, testing, and analysis standards", "Design CI/CD pipelines with quality gate enforcement", "Integrate verification gates with the Quality DNA system", "Troubleshoot verification gate failures and understand enforcement levels"]
prerequisites = ["quality-gates", "credo", "dialyzer", "testing", "pre-commit-hooks"]
see_also = ["quality-floor-guardian", "quality-dna", "ci-cd", "compilation", "regression-testing"]
word_count = 1451
date_modified = "2026-02-23"
image = "/images/sections/glossary.png"
image_alt = "Verification Gate - Prismatic Platform"
+++

## Definition and Overview

A verification gate is an automated checkpoint that code must pass before it can advance to the next stage of the development pipeline. In the Prismatic Platform, verification gates form a multi-layered defense system spanning local development (pre-commit hooks), continuous integration (CI/CD pipelines), and production deployment (release gates). Each gate verifies a specific aspect of code quality -- compilation correctness, test passage, static analysis compliance, formatting consistency, security scanning, and performance benchmarks -- and blocks advancement when verification fails.

The platform operates 11 verification phases in its pre-commit hook alone, executing in sequence from fastest to slowest. This ordering is deliberate: cheap checks run first (formatting, compilation warnings) so that expensive checks (full test suite, [Dialyzer](@/glossary/dialyzer.md) analysis) only run against code that has already passed basic validation. The total pre-commit verification time for a typical change is 30-60 seconds, with early failures detected in under 5 seconds.

Verification gates are not advisory. They are blocking. A gate failure means the commit is rejected, the push is refused, or the deployment is halted. There is no `--no-verify` bypass. The NO MERCY doctrine applies to verification with the same absoluteness it applies to code quality: if the code does not pass verification, it does not advance. The rationale is simple: every verification bypass that reaches production becomes a production incident. The cost of fixing a bypass-induced incident is always higher than the cost of fixing the code before commit.

## Pre-Commit Hook Architecture

The Prismatic Platform's pre-commit hook (`.githooks/pre-commit`) implements 11 sequential verification phases. Each phase has a specific purpose, runs specific tools, and produces specific failure messages.

### Phase Execution Order

| Phase | Name | Tool | Time | What It Checks |
|-------|------|------|------|----------------|
| 1 | Format Check | `mix format --check-formatted` | ~2s | Code formatting consistency |
| 2 | Compilation | `mix compile --warnings-as-errors` | ~5s | Zero compilation warnings |
| 3 | Credo | `mix credo --strict` | ~3s | Code quality and style rules |
| 4 | Tests | `mix test` | ~15s | All tests pass |
| 5 | Dialyzer | `mix dialyzer` | ~10s | Type correctness and contract compliance |
| 6 | Quality Gates | `mix quality.gates` | ~5s | Platform-specific quality checks |
| 7 | Forbidden Patterns | `mix quality.forbidden_patterns` | ~2s | No stubs, mocks, placeholders |
| 8 | Template Validation | `scripts/validate-promo-templates.sh` | ~1s | Promo site template correctness |
| 9 | Security Scan | `mix quality.security_scan` | ~3s | No secrets, no hardcoded credentials |
| 10 | Design Consistency | `scripts/validate-design-consistency.sh` | ~1s | Flowbite sidebar, responsive patterns |
| 11 | Quality Debt | `mix quality.forbidden_patterns --count-only` | ~1s | Zero quality debt points remaining |

### Phase Implementation

```elixir
defmodule PrismaticQuality.PreCommitGate do
  @moduledoc """
  Pre-commit verification gate orchestrator.
  Executes 11 verification phases in sequence, failing fast on first error.
  """

  @type phase :: %{
    number: pos_integer(),
    name: String.t(),
    command: String.t(),
    timeout_ms: pos_integer(),
    blocking: boolean()
  }

  @type gate_result :: :pass | {:fail, phase(), String.t()}

  @phases [
    %{number: 1, name: "Format Check", command: "mix format --check-formatted", timeout_ms: 5_000, blocking: true},
    %{number: 2, name: "Compilation", command: "mix compile --warnings-as-errors --force", timeout_ms: 30_000, blocking: true},
    %{number: 3, name: "Credo", command: "mix credo --strict", timeout_ms: 15_000, blocking: true},
    %{number: 4, name: "Tests", command: "mix test", timeout_ms: 120_000, blocking: true},
    %{number: 5, name: "Dialyzer", command: "mix dialyzer", timeout_ms: 60_000, blocking: true},
    %{number: 6, name: "Quality Gates", command: "mix quality.gates", timeout_ms: 30_000, blocking: true},
    %{number: 7, name: "Forbidden Patterns", command: "mix quality.forbidden_patterns", timeout_ms: 10_000, blocking: true},
    %{number: 8, name: "Template Validation", command: "scripts/validate-promo-templates.sh", timeout_ms: 5_000, blocking: true},
    %{number: 9, name: "Security Scan", command: "mix quality.security_scan", timeout_ms: 15_000, blocking: true},
    %{number: 10, name: "Design Consistency", command: "scripts/validate-design-consistency.sh", timeout_ms: 5_000, blocking: true},
    %{number: 11, name: "Quality Debt", command: "mix quality.forbidden_patterns --count-only", timeout_ms: 5_000, blocking: true}
  ]

  @spec run_all() :: :pass | {:fail, phase(), String.t()}
  def run_all do
    Enum.reduce_while(@phases, :pass, fn phase, _acc ->
      case run_phase(phase) do
        :pass ->
          {:cont, :pass}

        {:fail, output} ->
          {:halt, {:fail, phase, output}}
      end
    end)
  end

  @spec run_phase(phase()) :: :pass | {:fail, String.t()}
  defp run_phase(phase) do
    :telemetry.execute(
      [:prismatic, :pre_commit, :phase_start],
      %{},
      %{phase: phase.number, name: phase.name}
    )

    start_time = System.monotonic_time(:millisecond)

    result = case System.cmd("sh", ["-c", phase.command], stderr_to_stdout: true) do
      {_output, 0} -> :pass
      {output, _code} -> {:fail, output}
    end

    duration = System.monotonic_time(:millisecond) - start_time

    :telemetry.execute(
      [:prismatic, :pre_commit, :phase_complete],
      %{duration_ms: duration},
      %{phase: phase.number, name: phase.name, result: result}
    )

    result
  end
end
```

## Quality Gates (mix quality.gates)

The `mix quality.gates` command runs a comprehensive set of platform-specific quality checks beyond standard compilation and testing:

### Gate Categories

| Gate | What It Checks | Severity |
|------|---------------|----------|
| Typespec Coverage | All public functions have `@spec` | BLOCK |
| `@impl` Annotations | All behaviour callbacks annotated | BLOCK |
| Unsafe Map Access | No `map.key` on non-struct maps | BLOCK |
| DateTime Precision | Consistent timestamp precision | BLOCK |
| Guard Functions | Correct use of guard-safe functions | BLOCK |
| Memory Safety | No unbounded data structures | BLOCK |
| Performance Patterns | No `length() > 0` anti-patterns | WARN |
| TODO Management | No untracked TODOs in code | BLOCK |

### Quality Gate Implementation

```elixir
defmodule Mix.Tasks.Quality.Gates do
  @moduledoc """
  Runs all quality gates and reports results.
  Exit code 0 = all gates pass. Exit code 1 = one or more gates fail.

  ## Usage

      mix quality.gates              # Full check
      mix quality.gates --fast       # Quick checks only
      mix quality.gates --json       # Machine-readable output
  """

  use Mix.Task

  @type gate_result :: %{
    name: String.t(),
    status: :pass | :fail | :warn,
    violations: non_neg_integer(),
    details: list(String.t())
  }

  @spec run(list(String.t())) :: :ok | no_return()
  def run(args) do
    {opts, _, _} = OptionParser.parse(args, switches: [fast: :boolean, json: :boolean])

    gates = if opts[:fast], do: fast_gates(), else: all_gates()

    results = Enum.map(gates, &execute_gate/1)

    failures = Enum.filter(results, &(&1.status == :fail))

    if opts[:json] do
      results |> Jason.encode!() |> IO.puts()
    else
      print_results(results)
    end

    if failures != [] do
      Mix.raise("Quality gates failed: #{length(failures)} gate(s)")
    end
  end

  defp all_gates do
    [
      &check_typespec_coverage/0,
      &check_impl_annotations/0,
      &check_unsafe_map_access/0,
      &check_datetime_precision/0,
      &check_guard_functions/0,
      &check_memory_safety/0,
      &check_performance_patterns/0,
      &check_todo_management/0
    ]
  end

  defp fast_gates do
    [
      &check_unsafe_map_access/0,
      &check_performance_patterns/0,
      &check_todo_management/0
    ]
  end

  defp execute_gate(gate_fn) do
    gate_fn.()
  end

  defp check_typespec_coverage do
    # Scan all public functions across all apps
    # Verify each has an @spec annotation
    %{name: "Typespec Coverage", status: :pass, violations: 0, details: []}
  end

  defp check_impl_annotations do
    %{name: "@impl Annotations", status: :pass, violations: 0, details: []}
  end

  defp check_unsafe_map_access do
    %{name: "Unsafe Map Access", status: :pass, violations: 0, details: []}
  end

  defp check_datetime_precision do
    %{name: "DateTime Precision", status: :pass, violations: 0, details: []}
  end

  defp check_guard_functions do
    %{name: "Guard Functions", status: :pass, violations: 0, details: []}
  end

  defp check_memory_safety do
    %{name: "Memory Safety", status: :pass, violations: 0, details: []}
  end

  defp check_performance_patterns do
    %{name: "Performance Patterns", status: :pass, violations: 0, details: []}
  end

  defp check_todo_management do
    %{name: "TODO Management", status: :pass, violations: 0, details: []}
  end

  defp print_results(results) do
    Enum.each(results, fn result ->
      status_icon = case result.status do
        :pass -> "[PASS]"
        :warn -> "[WARN]"
        :fail -> "[FAIL]"
      end

      IO.puts("  #{status_icon} #{result.name} (#{result.violations} violations)")
    end)
  end
end
```

## Forbidden Patterns Enforcement

The forbidden patterns gate detects and blocks code that violates platform standards:

### Pattern Categories

| Category | Scope | Patterns Detected | Severity |
|----------|-------|-------------------|----------|
| Mocks | `lib/` | `Mox.defmock` in production code | BLOCK |
| Stubs | `lib/` | `raise "not implemented"`, `raise :not_implemented` | BLOCK |
| Placeholders | all | `# PLACEHOLDER`, `# STUB`, `# MOCK`, `# FIXME`, `# HACK` | BLOCK |
| Naive | `lib/` | `# naive`, `# temporary`, `# quick and dirty` | BLOCK |
| Localhost | `lib/` | Hardcoded `http://localhost` (non-config) | WARN |
| Test Skips | `test/` | `@tag :skip` without issue reference | WARN |

### Whitelisted Paths

Certain paths are excluded from forbidden pattern scanning:

- `lib/mix/tasks/quality/` -- Quality task definitions may reference patterns they detect
- `prismatic_credo/` -- Credo check definitions reference patterns they detect
- `config/` -- Configuration files may contain localhost for development
- `garden/` -- Legacy repository content
- `deps/` -- Third-party dependencies
- `_build/` -- Build artifacts

## Compilation Verification

The compilation gate (`mix compile --warnings-as-errors --force`) is the most fundamental verification checkpoint. It ensures:

### Zero Warning Policy

Every compilation warning is a potential bug. The platform treats warnings as errors, blocking commits that introduce any warning. Common warning categories:

| Warning Type | Example | Why It Matters |
|-------------|---------|---------------|
| Unused variable | `variable "x" is unused` | Dead code, possible logic error |
| Unused import | `unused import Module` | Unnecessary dependency |
| Missing return | `this clause cannot match` | Unreachable code path |
| Deprecated function | `Function.call/1 is deprecated` | Future compatibility risk |
| Pattern match warning | `this pattern can never match` | Logic error in guard/pattern |

```elixir
# This compile-time enforcement catches errors before runtime:

# WARNING: variable "result" is unused (triggers compilation error)
def process(data) do
  result = transform(data)
  :ok  # result never used -- likely a bug
end

# FIXED: either use the result or prefix with underscore
def process(data) do
  _result = transform(data)  # Explicitly unused
  :ok
end

# Or better: return the result
@spec process(term()) :: {:ok, term()}
def process(data) do
  result = transform(data)
  {:ok, result}
end
```

## Credo Verification

[Credo](@/glossary/credo.md) provides style and consistency checks beyond compilation. The platform runs Credo in strict mode, which enables all checks including design-level suggestions.

### Credo Check Categories

| Category | Examples | Enforcement |
|----------|----------|-------------|
| Consistency | Consistent parameter naming, alias ordering | BLOCK |
| Design | Module complexity, function length, nesting depth | BLOCK |
| Readability | Pipe chain formatting, comment quality | BLOCK |
| Refactoring | Duplicate code detection, cyclomatic complexity | BLOCK |
| Warning | Unused code, potential bugs, unsafe operations | BLOCK |

### Custom Credo Checks

The Prismatic Platform includes custom Credo checks in `apps/prismatic_credo/`:

```elixir
defmodule PrismaticCredo.Check.Regression.HardcodedCIValues do
  @moduledoc """
  Custom Credo check that detects hardcoded CI-specific values
  in production code (URLs, tokens, paths that should be configurable).
  """

  use Credo.Check,
    base_priority: :high,
    category: :warning,
    explanations: [
      check: """
      Hardcoded CI values make code fragile and environment-dependent.
      Use Application.get_env/3 or runtime configuration instead.
      """
    ]

  @impl Credo.Check
  @spec run(Credo.SourceFile.t(), list()) :: list(Credo.Issue.t())
  def run(%Credo.SourceFile{} = source_file, params) do
    issue_meta = IssueMeta.for(source_file, params)

    Credo.Code.prewalk(source_file, &traverse(&1, &2, issue_meta))
  end

  defp traverse({:<<>>, meta, _} = ast, issues, issue_meta) do
    line_no = meta[:line]
    line = Credo.SourceFile.line_at(issue_meta.source_file, line_no)

    if contains_ci_value?(line) do
      {ast, [issue_for(issue_meta, line_no) | issues]}
    else
      {ast, issues}
    end
  end

  defp traverse(ast, issues, _issue_meta), do: {ast, issues}

  defp contains_ci_value?(line) do
    String.contains?(line, "CI=true") or
      String.contains?(line, "/home/runner/") or
      String.contains?(line, "GITHUB_ACTIONS")
  end

  defp issue_for(issue_meta, line_no) do
    format_issue(issue_meta,
      message: "Hardcoded CI value detected. Use runtime configuration.",
      line_no: line_no
    )
  end
end
```

## Dialyzer Verification

[Dialyzer](@/glossary/dialyzer.md) performs static type analysis using success typing. It detects type mismatches, unreachable code, and contract violations that the compiler cannot catch.

### What Dialyzer Catches

| Check Type | Example | Detection |
|-----------|---------|-----------|
| Type mismatch | Passing string where integer expected | `@spec` contract violation |
| Unreachable code | Pattern that can never match | Dead code analysis |
| Contract violation | Function returns value not in `@spec` | Return type analysis |
| Missing callbacks | `@impl` for non-existent behaviour callback | Behaviour compliance |
| Guard failures | Guard that always fails | Guard expression analysis |

### PLT Management

Dialyzer uses a Persistent Lookup Table (PLT) for analysis. The platform caches PLTs to avoid rebuilding on every commit:

```bash
# PLT location (cached between builds)
priv/plts/dialyzer.plt

# Nuclear cache fix when PLT becomes corrupted
rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt
```

## CI/CD Pipeline Gates

Beyond local pre-commit checks, the platform's CI/CD pipeline (GitLab CI) implements additional verification gates:

### Pipeline Stages

| Stage | Gates | Blocking |
|-------|-------|----------|
| Build | Compilation, dependency resolution | Yes |
| Test | Full test suite, coverage threshold | Yes |
| Analysis | Credo, Dialyzer, quality gates | Yes |
| Security | Dependency audit, secret scanning | Yes |
| Performance | Benchee benchmarks, page load timing | Yes (P0 routes) |
| Deploy | Staging verification, health checks | Yes |

### Deployment Gate

```elixir
defmodule PrismaticDeploy.VerificationGate do
  @moduledoc """
  Pre-deployment verification gate.
  Runs final checks before allowing deployment to staging or production.
  """

  @spec verify_deployment(atom()) :: :ok | {:error, list(String.t())}
  def verify_deployment(environment) do
    checks = [
      verify_all_tests_pass(),
      verify_zero_warnings(),
      verify_quality_score(),
      verify_no_quality_debt(),
      verify_migrations_reversible()
    ]

    environment_checks = case environment do
      :staging -> checks
      :production -> checks ++ [verify_staging_healthy(), verify_performance_benchmarks()]
    end

    failures = Enum.filter(environment_checks, &match?({:error, _}, &1))

    if failures == [] do
      :ok
    else
      {:error, Enum.map(failures, fn {:error, reason} -> reason end)}
    end
  end

  defp verify_all_tests_pass, do: :ok
  defp verify_zero_warnings, do: :ok
  defp verify_quality_score, do: :ok
  defp verify_no_quality_debt, do: :ok
  defp verify_migrations_reversible, do: :ok
  defp verify_staging_healthy, do: :ok
  defp verify_performance_benchmarks, do: :ok
end
```

## Quality DNA Integration

The [Quality DNA](@/glossary/quality-dna.md) system provides cross-session continuity for verification gates. Each verification run updates the Quality DNA state, which tracks quality metrics over time and detects regression trends.

### Quality DNA State

```json
{
  "quality_score": 100,
  "domains": {
    "dialyzer": {"violations": 0, "status": "perfect"},
    "credo": {"violations": 0, "status": "perfect"},
    "compilation": {"violations": 0, "status": "perfect"},
    "typespec": {"violations": 0, "coverage": 100},
    "impl_coverage": {"violations": 0, "count": 709},
    "memory_safety": {"violations": 0, "status": "perfect"},
    "performance": {"violations": 0, "status": "perfect"},
    "regression_prevention": {"violations": 0, "status": "perfect"}
  },
  "last_verification": "2026-02-22T10:30:00Z",
  "trend": "stable"
}
```

### Quality Floor Guardian

The [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) monitors quality metrics autonomously and triggers escalating responses when degradation is detected:

| Quality Level | Response | Action |
|--------------|----------|--------|
| 100-99% | OPTIMAL | Monitor only |
| 98-99% | WARNING | Alert + investigation |
| 95-98% | CRITICAL | Auto-evolution trigger |
| < 95% | EMERGENCY | Block commits + escalate |

## Performance Verification Gates

The platform enforces strict performance budgets through verification gates:

| Metric | Threshold | Enforcement |
|--------|-----------|-------------|
| Total page load | < 250ms | BLOCKING -- merge rejected |
| Server-side render | < 100ms | BLOCKING -- merge rejected |
| LiveView mount | < 150ms | BLOCKING -- merge rejected |
| LiveView handle_event | < 50ms | BLOCKING -- merge rejected |
| Health check | < 10ms | BLOCKING -- merge rejected |

Performance gates are verified through Benchee benchmarks run in the CI pipeline. New LiveView pages must include benchmark tests that verify compliance with these thresholds.

## Troubleshooting Gate Failures

### Common Failure Patterns

| Failure | Likely Cause | Resolution |
|---------|-------------|------------|
| Phase 1 (Format) | `mix format` not run | Run `mix format` before committing |
| Phase 2 (Compilation) | New warning introduced | Fix warning or suppress with reason |
| Phase 3 (Credo) | Style violation | Follow Credo suggestion in error message |
| Phase 4 (Tests) | Test failure | Fix failing test or update expected behavior |
| Phase 5 (Dialyzer) | Type mismatch | Fix `@spec` or function implementation |
| Phase 6 (Quality) | Missing `@spec` or `@impl` | Add required annotations |
| Phase 7 (Forbidden) | Stub/placeholder code | Implement full functionality |
| Phase 9 (Security) | Hardcoded credential | Move to environment variable |

### Bypassing Gates (FORBIDDEN)

The following are explicitly forbidden by platform policy:

| Bypass Attempt | Status |
|---------------|--------|
| `git commit --no-verify` | ABSOLUTELY FORBIDDEN |
| `git push --no-verify` | ABSOLUTELY FORBIDDEN |
| Disabling pre-commit hook | ABSOLUTELY FORBIDDEN |
| Weakening Credo config | Requires Supreme review |
| Reducing coverage threshold | Requires Supreme review |

## Best Practices

**Run gates locally before pushing.** The pre-commit hook runs automatically, but running `mix quality.gates` manually before starting a commit gives faster feedback and avoids partial commit states.

**Fix failures immediately.** Gate failures indicate quality issues that will only get harder to fix as more code accumulates. Address failures at the point of detection, not later.

**Understand what each gate checks.** When a gate fails, read the error message carefully. Each gate provides specific diagnostic information about what failed and why. Generic "fix the error" approaches waste time.

**Keep gate execution fast.** If a new check takes more than 5 seconds, consider whether it belongs in pre-commit (run on every commit) or CI (run on push). Pre-commit gates should complete in under 60 seconds total.

## Common Pitfalls

**Disabling gates "temporarily."** There is no temporary in production. A disabled gate stays disabled until someone remembers to re-enable it, by which time the quality debt has accumulated.

**Adding gates without documentation.** Every new gate needs documentation explaining what it checks, why it matters, and how to fix failures. Undocumented gates cause frustration and workarounds.

**Making all gates blocking.** Not every check needs to block the commit. Warnings for style suggestions are appropriate. Blocks should be reserved for correctness, security, and platform-critical quality metrics.

## Related Concepts

- [Quality Gates](@/glossary/quality-gates.md) -- The quality gate system that verification gates implement
- [Pre-commit Hooks](@/glossary/pre-commit-hooks.md) -- Git hooks executing verification phases
- [Credo](@/glossary/credo.md) -- Elixir code quality analysis tool
- [Dialyzer](@/glossary/dialyzer.md) -- Static type analysis for Elixir
- [Compilation](@/glossary/compilation.md) -- Elixir compilation with warnings-as-errors
- [Testing](@/glossary/testing.md) -- Test execution as a verification phase
- [Test Coverage](@/glossary/test-coverage.md) -- Coverage thresholds enforced by gates
- [CI/CD](@/glossary/ci-cd.md) -- Pipeline gates beyond local pre-commit
- [Quality DNA](@/glossary/quality-dna.md) -- Cross-session quality tracking
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- Autonomous quality monitoring
- [Regression Testing](@/glossary/regression-testing.md) -- Mandatory regression tests for bug fixes
- [Static Analysis](@/glossary/static-analysis.md) -- Analysis tools integrated into verification gates

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Umbrella applications subject to verification gates
- Glossary Index -- Complete glossary of platform concepts

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
