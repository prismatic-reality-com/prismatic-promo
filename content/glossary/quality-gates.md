+++
title = "Quality Gates"
weight = 50
[extra]
description = "Automated enforcement pipeline: compile, lint, test, analyze, verify"
category = "quality"
related_terms = ["quality-floor-guardian", "credo", "dialyzer", "zero-warning-policy", "regression-test", "sparkline", "autoheal", "cascade-pattern", "clean-run", "code-coverage", "fitness-score", "git-trees", "gitlab-ci", "mix", "mix-task", "pre-commit-hooks", "quality-debt", "quality-dna", "session-discipline", "typespec", "violation-protocol"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 886
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Quality", "Gates", "Automated", "glossary", "Prismatic Platform", "Custom Checks", "Credo", "Dialyzer"]
tags = ["glossary", "quality", "quality-gates", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quality Gates - Prismatic Platform"
+++

## Definition and Overview

Quality Gates are an automated, multi-stage enforcement pipeline that every code change must pass before being accepted into the codebase. The pipeline runs a sequence of verification checks -- compilation with strict warning treatment, static analysis via Credo, type checking via Dialyzer, comprehensive test execution with coverage measurement, and custom quality domain checks -- with failure at any stage blocking the change from proceeding. Quality Gates implement the "fail fast, fail loud" principle: violations are detected as early as possible and communicated as clearly as possible.

The concept of quality gates originates from manufacturing, where physical inspection stations verify product quality at defined points in the production line. In software engineering, the analogy maps to automated verification points in the development workflow. The Prismatic Platform takes this further by embedding gates at multiple integration points -- pre-commit hooks for immediate developer feedback, CI pipeline stages for comprehensive verification, and session lifecycle hooks for context-aware enforcement. This multi-layered approach ensures that no quality violation reaches the main branch regardless of which workflow path a change follows.

Quality Gates are blocking by design. Unlike advisory tools that report issues but allow developers to proceed, gates are hard stops. A failing gate prevents the commit, the merge, or the deployment. This zero-tolerance enforcement is a direct expression of the NO MERCY doctrine: quality is non-negotiable, and the gates are the mechanism that makes this principle operational rather than aspirational.

## Technical Deep Dive

### Gate Pipeline Stages

The Quality Gates pipeline consists of seven sequential stages, each targeting a specific quality dimension:

| Stage | Tool | Purpose | Blocking |
|-------|------|---------|----------|
| 1. Compilation | `mix compile --warnings-as-errors --force` | Zero compilation warnings | Yes |
| 2. Static Analysis | `mix credo --strict` | Code style and pattern compliance | Yes |
| 3. Type Checking | `mix dialyzer` | Type correctness verification | Yes |
| 4. Unit Tests | `mix test --cover` | Functional correctness + coverage | Yes |
| 5. QDP Scan | Custom quality scanner | Domain-specific violation detection | Yes |
| 6. Custom Checks | Domain-specific analyzers | @impl, @spec, unsafe access, etc. | Yes |
| 7. Integration | Cross-app dependency checks | Inter-application contract compliance | Yes |

### Pipeline Implementation

```elixir
defmodule Prismatic.Quality.Gates do
  @moduledoc """
  Orchestrates the quality gate pipeline. All gates must pass
  for a code change to proceed. Failure at any stage blocks.
  """

  require Logger

  @type gate_result :: :pass | {:fail, String.t()}
  @type pipeline_result :: {:ok, [gate_result()]} | {:error, String.t(), [gate_result()]}

  @gates [
    {:compilation, &__MODULE__.check_compilation/1},
    {:credo, &__MODULE__.check_credo/1},
    {:dialyzer, &__MODULE__.check_dialyzer/1},
    {:tests, &__MODULE__.check_tests/1},
    {:qdp_scan, &__MODULE__.check_qdp/1},
    {:custom, &__MODULE__.check_custom_domains/1},
    {:integration, &__MODULE__.check_integration/1}
  ]

  @spec run_all(keyword()) :: pipeline_result()
  def run_all(opts \\ []) do
    fast_mode = Keyword.get(opts, :fast, false)
    gates = if fast_mode, do: fast_gates(), else: @gates

    results =
      Enum.reduce_while(gates, [], fn {name, check_fn}, acc ->
        Logger.info("Quality Gate: Running #{name}...")

        case check_fn.(opts) do
          :pass ->
            {:cont, [{name, :pass} | acc]}

          {:fail, reason} ->
            Logger.error("Quality Gate FAILED: #{name} - #{reason}")
            {:halt, [{name, {:fail, reason}} | acc]}
        end
      end)

    case List.keyfind(results, :fail, 1, nil) do
      nil -> {:ok, Enum.reverse(results)}
      {failed_gate, {:fail, reason}} ->
        {:error, "Gate #{failed_gate} failed: #{reason}", Enum.reverse(results)}
    end
  end

  @spec check_compilation(keyword()) :: gate_result()
  def check_compilation(_opts) do
    case System.cmd("mix", ["compile", "--warnings-as-errors", "--force"],
           stderr_to_stdout: true) do
      {_output, 0} -> :pass
      {output, _code} -> {:fail, "Compilation warnings: #{truncate(output)}"}
    end
  end

  @spec check_credo(keyword()) :: gate_result()
  def check_credo(_opts) do
    case System.cmd("mix", ["credo", "--strict"], stderr_to_stdout: true) do
      {_output, 0} -> :pass
      {output, _code} -> {:fail, "Credo violations: #{truncate(output)}"}
    end
  end

  @spec check_dialyzer(keyword()) :: gate_result()
  def check_dialyzer(opts) do
    if Keyword.get(opts, :fast, false) do
      :pass  # Skip in fast mode (slow)
    else
      case System.cmd("mix", ["dialyzer"], stderr_to_stdout: true) do
        {_output, 0} -> :pass
        {output, _code} -> {:fail, "Dialyzer errors: #{truncate(output)}"}
      end
    end
  end

  defp fast_gates do
    Enum.reject(@gates, fn {name, _} -> name in [:dialyzer, :integration] end)
  end

  defp truncate(output), do: String.slice(output, 0, 500)
end
```

### Pre-Commit Hook Integration

Quality Gates are the first enforcement point through pre-commit hooks:

```bash
#!/bin/bash
# .githooks/pre-commit - Quality Gate enforcement

set -e

echo "=== Quality Gates: Pre-Commit Check ==="

# Phase 1: Compilation
echo "Phase 1: Compilation (--warnings-as-errors)"
mix compile --warnings-as-errors --force 2>&1
if [ $? -ne 0 ]; then
  echo "BLOCKED: Compilation warnings detected"
  exit 1
fi

# Phase 2: Credo
echo "Phase 2: Static Analysis (Credo strict)"
mix credo --strict 2>&1
if [ $? -ne 0 ]; then
  echo "BLOCKED: Credo violations detected"
  exit 1
fi

# Phase 3: Quick QDP Scan
echo "Phase 3: Quality Debt Scan"
mix quality.gates.check --fast 2>&1
if [ $? -ne 0 ]; then
  echo "BLOCKED: Quality debt points detected"
  exit 1
fi

echo "=== Quality Gates: All checks passed ==="
```

### CI Pipeline Integration

Beyond pre-commit, Quality Gates run as CI pipeline stages for comprehensive verification:

```elixir
defmodule Prismatic.Quality.CIPipeline do
  @moduledoc """
  CI-specific quality gate pipeline with additional checks
  beyond what runs in pre-commit hooks.
  """

  @spec run_ci_gates() :: :ok | {:error, term()}
  def run_ci_gates do
    with {:ok, _} <- Prismatic.Quality.Gates.run_all(fast: false),
         {:ok, _} <- run_coverage_threshold_check(),
         {:ok, _} <- run_contract_compliance_check(),
         {:ok, _} <- run_performance_regression_check() do
      :ok
    end
  end

  defp run_coverage_threshold_check do
    case System.cmd("mix", ["test", "--cover"], stderr_to_stdout: true) do
      {output, 0} ->
        coverage = parse_coverage(output)
        if coverage >= 80.0, do: {:ok, coverage}, else: {:error, {:low_coverage, coverage}}

      {output, _code} ->
        {:error, {:test_failure, output}}
    end
  end
end
```

## Architecture and Implementation

### Multi-Point Enforcement Architecture

Quality Gates enforce at three integration points, creating defense in depth:

```
Developer Workstation          CI/CD Pipeline          Session Lifecycle
        |                           |                        |
   Pre-Commit Hook            Pipeline Stage         SessionLifecycle Hook
        |                           |                        |
   Fast Gates (3/7)           Full Gates (7/7)       Fast Gates (3/7)
   - Compilation              + Dialyzer              - Pre-Command
   - Credo                    + Integration            - Post-Command
   - Quick QDP                + Coverage               - Session boundary
        |                           |                        |
   BLOCK on failure           BLOCK on failure         BLOCK on failure
```

### 13 Quality Domains

Quality Gates check all 13 quality domains that contribute to the platform's quality score:

| Domain | Gate Stage | Current Status |
|--------|-----------|----------------|
| Dialyzer | Type Checking | 0 violations |
| Credo | Static Analysis | 0 violations |
| Compilation | Compilation | 0 warnings |
| DateTime Precision | Custom Checks | 0 violations |
| Guard Functions | Custom Checks | 0 violations |
| @impl Coverage | Custom Checks | 0 violations (709 annotations) |
| Memory Safety | Custom Checks | 0 violations |
| Performance | Integration | 0 violations |
| Regression Prevention | Tests | 0 missing |
| Timing Patterns | Custom Checks | 0 violations |
| TODO Management | QDP Scan | 0 stale TODOs |
| Typespec Coverage | Custom Checks | 0 missing |
| Unsafe Map Access | QDP Scan | 0 violations |

### Gate Failure Recovery

When a gate fails, the system provides structured remediation guidance:

```elixir
defmodule Prismatic.Quality.GateRemediation do
  @moduledoc """
  Provides remediation guidance when quality gates fail.
  Maps failures to specific fix actions.
  """

  @spec remediation_for(atom(), String.t()) :: String.t()
  def remediation_for(:compilation, reason) do
    """
    Compilation Gate Failed: #{reason}

    Remediation:
    1. Run: mix compile --warnings-as-errors 2>&1 | head -50
    2. Fix each warning (unused variables, missing clauses, etc.)
    3. For persistent phantom warnings: rm -rf _build/dev/lib/<app>/ebin
    4. Re-run: mix compile --warnings-as-errors --force
    """
  end

  def remediation_for(:credo, reason) do
    """
    Credo Gate Failed: #{reason}

    Remediation:
    1. Run: mix credo --strict --format=json
    2. Auto-fix available issues: mix credo --strict --enable-disabled-checks
    3. For module naming: ensure PascalCase modules, no Manager/Handler/Utils
    4. Re-run: mix credo --strict
    """
  end

  def remediation_for(:dialyzer, reason) do
    """
    Dialyzer Gate Failed: #{reason}

    Remediation:
    1. Run: mix dialyzer --format=dialyxir
    2. Fix @spec mismatches with actual return types
    3. If PLT corrupted: rm -rf priv/plts/dialyzer.plt && mix dialyzer --plt
    4. Re-run: mix dialyzer
    """
  end
end
```

## Usage in Prismatic Platform

### Common Commands

```bash
# Full quality gates pipeline
mix quality.gates

# Fast mode (skip Dialyzer and integration)
mix quality.gates.check --fast

# Individual gate checks
mix compile --warnings-as-errors --force
mix credo --strict
mix dialyzer
mix test --cover

# Quality enforcement standard (comprehensive)
mix quality.enforce_standard
mix quality.enforce_standard --fix --json
```

### Integration with Session Lifecycle

| Session Phase | Gate Mode | Blocking |
|--------------|-----------|----------|
| Pre-Command | Fast (3/7 gates) | Yes |
| Post-Command | Quick scan | Advisory |
| Pre-Commit | Fast (3/7 gates) | Yes |
| CI Pipeline | Full (7/7 gates) | Yes |
| Session End | Full (7/7 gates) | Yes |

## Best Practices

1. **Run fast gates frequently during development**. The fast gate mode (`--fast`) skips slow checks like Dialyzer while still catching compilation warnings and Credo violations in seconds.

2. **Never bypass gates with `--no-verify`**. The platform explicitly forbids this. Using `--no-verify` triggers L4 Supreme Review escalation.

3. **Fix gate failures immediately**. Do not accumulate failing gates intending to fix them later. Each commit must pass all active gates.

4. **Use gate remediation guidance**. When gates fail, read the structured remediation output rather than guessing at fixes. The guidance is specific to each gate type.

5. **Run full gates before pushing**. Pre-commit hooks run fast mode. Before pushing to remote, run `mix quality.gates` in full mode to catch issues that Dialyzer or integration checks would find.

## Common Pitfalls

- **Relying only on CI gates**: CI catches everything but provides slow feedback. Pre-commit gates provide immediate feedback for common issues, preventing the commit-push-wait-fail-fix cycle.

- **Ignoring gate performance degradation**: If gates start taking significantly longer to run, investigate. Slow gates encourage developers to avoid running them.

- **Not distinguishing fast and full modes**: Fast mode is for rapid iteration. Full mode is for validation before integration. Using the wrong mode at the wrong time either slows development or misses issues.

- **Treating gate passage as quality certification**: Gates verify compliance with current standards. They do not verify design quality, architecture fitness, or user experience. Gates are necessary but not sufficient for quality.

## Related Concepts

- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- Autonomous monitoring of gate results
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) -- First enforcement point invoking gates
- [Zero Warning Policy](/glossary/zero-warning-policy/) -- Compilation gate requiring zero warnings
- [Regression Test](/glossary/regression-test/) -- Testing gate requiring bug fix coverage
- [Quality Debt](/glossary/quality-debt/) -- Debt points detected and blocked by gates
- [Quality DNA](/glossary/quality-dna/) -- Historical gate result tracking
- [Credo](/glossary/credo/) -- Static analysis tool powering the Credo gate
- [Dialyzer](/glossary/dialyzer/) -- Type checker powering the Dialyzer gate
- [Session Discipline](/glossary/session-discipline/) -- Protocol mandating gate compliance

## See Also

- [prismatic_safety](../../../apps/prismatic_safety/README.md) -- Quality Floor Guardian and quality gate enforcement
- [prismatic_credo](../../../apps/prismatic_credo/README.md) -- Credo static analysis integration
- [prismatic_quality_intelligence](../../../apps/prismatic_quality_intelligence/README.md) -- Quality intelligence and trend analysis
- [prismatic_tooling](../../../apps/prismatic_tooling/README.md) -- Developer tooling for quality automation
- [prismatic](../../../apps/prismatic/README.md) -- Mix tasks: quality.gates, quality.enforce_standard
- [Architecture](/architecture/) -- Platform architecture overview
- [Commands](/commands/) -- Quality-related command catalog

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)