+++
title = "Quality Gates"
weight = 5
[extra]
icon = "fire"
color = "orange"
description = "Automated multi-stage enforcement at every commit ensuring compilation, testing, linting, and static analysis compliance"
category = "enforcement"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 732
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Quality", "Gates", "Automated", "capabilities", "enforcement", "Prismatic Platform", "Commit", "Dialyzer", "Quality Gates", "Merge"]
tags = ["capabilities", "enforcement", "quality-gates", "prismatic"]
quality_score = 70
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "Quality Gates - Prismatic Platform"
+++

## Overview

Quality Gates are automated checkpoints that block any code change that fails to meet Prismatic Platform standards. Every commit, every pull request, and every merge must pass through a rigorous multi-stage gate pipeline before reaching the codebase. These gates are not advisory warnings or optional recommendations -- they are hard enforcement mechanisms that reject non-compliant code with zero override capability.

The Quality Gates system operates at three distinct enforcement levels: local pre-commit hooks that catch violations before they leave the developer's machine, CI pipeline gates that perform comprehensive analysis on the remote server, and merge gates that provide final validation before code enters the main branch. This defense-in-depth approach ensures that quality violations are caught at the earliest and cheapest point of correction.

Built on [Elixir](@/technologies/elixir.md) Mix tasks and integrated with [Credo](@/technologies/credo.md), [Dialyzer](@/technologies/dialyzer.md), and [ExUnit](@/technologies/exunit.md), the Quality Gates system enforces the [NO MERCY](@/capabilities/no-mercy.md) doctrine's zero-tolerance standards across all 99 umbrella applications in the platform.

## Gate Pipeline Architecture

The Quality Gates pipeline processes every code change through three sequential enforcement stages. Each stage must pass completely before the next stage begins, and failure at any stage blocks progression entirely.

```
Code Change
    |
    +---> Pre-Commit Hooks (Local, ~10-30 seconds)
    |       +-- Format check (mix format --check-formatted)
    |       +-- Compile (--warnings-as-errors)
    |       +-- Credo --strict
    |       +-- Quick tests (changed files only)
    |       +-- TODO/FIXME/HACK scan
    |       +-- Template validation (promo site)
    |       +-- Design consistency check
    |
    +---> CI Pipeline (Remote, ~3-10 minutes)
    |       +-- Full compilation (--force --warnings-as-errors)
    |       +-- Dialyzer PLT analysis
    |       +-- Full test suite with coverage
    |       +-- Coverage threshold check (>= 80%)
    |       +-- Security audit (mix_audit)
    |       +-- Performance benchmarks
    |       +-- Pattern analysis (CASCADE detection)
    |
    +---> Merge Gate (Final, ~1-2 minutes)
            +-- All CI stages green
            +-- Code review approved
            +-- Quality score >= threshold
            +-- No regression in quality domains
            +-- Conflict resolution verified
```

## Pre-Commit Gates

Pre-commit gates execute locally on the developer's machine before the commit is created. They provide the fastest feedback loop, catching common violations in seconds rather than minutes.

### Gate Configuration

| Gate | Command | Threshold | Failure Action |
|------|---------|-----------|----------------|
| **Format** | `mix format --check-formatted` | 100% formatted | Commit blocked |
| **Compile** | `mix compile --warnings-as-errors` | 0 warnings | Commit blocked |
| **Credo** | `mix credo --strict` | 0 issues | Commit blocked |
| **Quick Test** | `mix test --only quick` | 100% pass | Commit blocked |
| **TODO Scan** | Pattern regex scanner | 0 matches | Commit blocked |
| **Template** | `scripts/validate-promo-templates.sh` | 0 violations | Commit blocked |
| **Design** | `scripts/validate-design-consistency.sh` | 0 violations | Commit blocked |

### Pre-Commit Hook Implementation

The pre-commit hook executes a phased validation pipeline, organized for fast failure to minimize developer wait time:

```elixir
defmodule PrismaticSafety.PreCommitGate do
  @moduledoc """
  Pre-commit quality gate implementation.
  Executes validation phases in order, failing fast on first violation.
  Enforces NO MERCY standards before any commit reaches the repository.
  """

  @phases [
    {:format_check, "mix format --check-formatted", "Code formatting"},
    {:compile_check, "mix compile --warnings-as-errors", "Zero-warning compilation"},
    {:credo_check, "mix credo --strict", "Code quality analysis"},
    {:quick_test, "mix test --only quick", "Quick test suite"},
    {:todo_scan, :custom, "TODO/FIXME/HACK pattern scan"},
    {:template_check, "scripts/validate-promo-templates.sh", "Template validation"},
    {:design_check, "scripts/validate-design-consistency.sh", "Design consistency"}
  ]

  @spec run_all_gates() :: :ok | {:blocked, atom(), String.t()}
  def run_all_gates do
    Enum.reduce_while(@phases, :ok, fn phase, :ok ->
      case execute_phase(phase) do
        :ok -> {:cont, :ok}
        {:error, reason} -> {:halt, {:blocked, elem(phase, 0), reason}}
      end
    end)
  end

  defp execute_phase({name, :custom, _description}) do
    execute_custom_phase(name)
  end

  defp execute_phase({_name, command, _description}) do
    case System.cmd("mix", String.split(command, " ") |> tl(), stderr_to_stdout: true) do
      {_output, 0} -> :ok
      {output, _code} -> {:error, output}
    end
  end

  defp execute_custom_phase(:todo_scan) do
    staged_files = get_staged_elixir_files()

    violations =
      staged_files
      |> Enum.flat_map(&scan_for_forbidden_patterns/1)

    case violations do
      [] -> :ok
      found -> {:error, Enum.join(found, "\n")}
    end
  end

  defp scan_for_forbidden_patterns(file) do
    patterns = [~r/# TODO:/i, ~r/# FIXME:/i, ~r/# HACK:/i, ~r/:not_implemented/]

    file
    |> File.read!()
    |> String.split("\n")
    |> Enum.with_index(1)
    |> Enum.flat_map(fn {line, num} ->
      Enum.flat_map(patterns, fn pattern ->
        if Regex.match?(pattern, line), do: ["#{file}:#{num}: #{String.trim(line)}"], else: []
      end)
    end)
  end

  defp get_staged_elixir_files do
    {output, 0} = System.cmd("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"])
    output |> String.split("\n") |> Enum.filter(&String.ends_with?(&1, [".ex", ".exs"]))
  end
end
```

## CI Pipeline Gates

CI pipeline gates execute on the remote server after a push, performing comprehensive analysis that requires the full codebase and build infrastructure.

### Gate Requirements

| Gate | Command | Threshold | Duration |
|------|---------|-----------|----------|
| **Full Compile** | `mix compile --force --warnings-as-errors` | 0 warnings | ~60s |
| **Dialyzer** | `mix dialyzer` | 0 type errors | ~120s |
| **Full Tests** | `mix test --cover` | 100% pass | ~180s |
| **Coverage** | ExCoveralls report | >= 80% line coverage | Included in tests |
| **Security** | `mix_audit` | 0 known vulnerabilities | ~10s |
| **Pattern Analysis** | CASCADE detection | 0 anti-patterns | ~30s |
| **Performance** | Benchee critical paths | Within thresholds | ~60s |

### Dialyzer Integration

[Dialyzer](@/technologies/dialyzer.md) performs static type analysis across the entire codebase, catching type errors that unit tests cannot detect. The PLT (Persistent Lookup Table) is cached between runs for performance:

```elixir
# mix.exs configuration for Dialyzer
defp dialyzer do
  [
    plt_file: {:no_warn, "priv/plts/dialyzer.plt"},
    plt_add_apps: [:mix, :ex_unit],
    flags: [
      :unmatched_returns,
      :error_handling,
      :underspecs,
      :no_opaque
    ]
  ]
end
```

### Performance Gate

Critical paths must meet strict latency requirements as defined in the [page load performance standard](@/capabilities/real-time-monitoring.md):

| Metric | Hard Limit | Gate Action |
|--------|-----------|-------------|
| Total page load | < 250ms | Merge rejected if exceeded |
| Server-side render | < 100ms | Merge rejected if exceeded |
| LiveView mount | < 150ms | Merge rejected if exceeded |
| LiveView handle_event | < 50ms | Merge rejected if exceeded |
| Health check endpoint | < 10ms | Merge rejected if exceeded |

## Quality Score Calculation

The Quality Gates system computes a composite quality score that aggregates all enforcement dimensions. This score provides a single metric for platform health assessment.

### Score Formula

```
Quality Score = Compilation (25%) + Tests (25%) + Coverage (25%) + Static Analysis (25%)

Each component is binary: 100% if passing, 0% if failing.

100/100 = PERFECT     -- All domains passing, no violations
95-99   = OPTIMAL     -- Minor non-blocking issues detected
90-94   = ACCEPTABLE  -- Warning-level issues, investigation needed
< 90    = BLOCKED     -- Hard block on all commits until resolved
```

### Domain Breakdown

| Quality Domain | Score Weight | Measurement | Current |
|---------------|-------------|-------------|---------|
| Compiler warnings | 8% | Count of warnings | 0 |
| Dialyzer violations | 8% | Count of type errors | 0 |
| Credo issues | 8% | Count of strict-mode issues | 0 |
| Test pass rate | 10% | Percentage of tests passing | 100% |
| Line coverage | 8% | ExCoveralls line % | >= 80% |
| Branch coverage | 8% | ExCoveralls branch % | >= 80% |
| @impl annotations | 5% | Coverage of callback implementations | 709/709 |
| @spec annotations | 5% | Coverage of public functions | 100% |
| TODO/FIXME absence | 5% | Count of prohibited patterns | 0 |
| Memory safety | 5% | Unsafe pattern count | 0 |
| Performance compliance | 10% | Benchmarks within thresholds | 100% |
| DateTime precision | 5% | Microsecond precision usage | 100% |
| Guard function usage | 5% | Proper guard clause patterns | 100% |
| Unsafe map access | 5% | Direct map access without guard | 0 |
| **TOTAL** | **100%** | | **100/100** |

## Quality Floor Guardian

The Quality Floor Guardian is an autonomous monitoring system that continuously tracks the platform's quality score and triggers corrective action when it drops below defined thresholds.

### Guardian Enforcement Levels

| Score Range | Status | Response | Automation |
|-------------|--------|----------|------------|
| 100-99% | OPTIMAL | Monitor only | Passive observation |
| 98-99% | WARNING | Alert + investigation | Blue Team notification |
| 95-98% | CRITICAL | Auto-evolution triggered | Self-healing cycle |
| < 95% | EMERGENCY | Block all commits + escalate | Full platform halt |

```elixir
defmodule PrismaticSafety.QualityFloorGuardian do
  @moduledoc """
  Autonomous quality monitoring system.
  Continuously tracks quality score and triggers corrective action.
  """

  use GenServer

  @check_interval :timer.seconds(30)
  @warning_threshold 99
  @critical_threshold 98
  @emergency_threshold 95

  def init(state) do
    schedule_check()
    {:ok, state}
  end

  def handle_info(:check_quality, state) do
    score = compute_quality_score()

    state =
      cond do
        score >= @warning_threshold ->
          %{state | status: :optimal}

        score >= @critical_threshold ->
          Logger.warning("Quality score WARNING: #{score}/100")
          trigger_investigation(score)
          %{state | status: :warning}

        score >= @emergency_threshold ->
          Logger.error("Quality score CRITICAL: #{score}/100")
          trigger_auto_evolution(score)
          %{state | status: :critical}

        true ->
          Logger.error("Quality score EMERGENCY: #{score}/100")
          block_all_commits()
          trigger_full_escalation(score)
          %{state | status: :emergency}
      end

    schedule_check()
    {:noreply, state}
  end

  defp schedule_check do
    Process.send_after(self(), :check_quality, @check_interval)
  end

  defp compute_quality_score do
    # Aggregate all 13+ quality domains into composite score
    domains = PrismaticSafety.QualityDomains.all()
    Enum.sum(Enum.map(domains, & &1.score)) / length(domains)
  end

  defp trigger_investigation(score), do: :ok
  defp trigger_auto_evolution(score), do: :ok
  defp block_all_commits, do: :ok
  defp trigger_full_escalation(score), do: :ok
end
```

## Risk Pattern Detection

Quality Gates include proactive detection of known risk patterns that historically lead to quality degradation:

| Risk Pattern | Detection Method | Example | Gate Response |
|-------------|------------------|---------|---------------|
| `length(list) > 0` | AST analysis | Anti-pattern: use `list != []` | WARNING |
| `Process.sleep/1` | AST analysis | Non-deterministic timing | BLOCK |
| Missing `@spec` | Module introspection | Untyped public function | BLOCK |
| Unsafe `map.field` | AST analysis | Runtime crash on missing key | BLOCK |
| Dead code paths | Coverage + AST | Unreachable branches | WARNING |
| High cyclomatic complexity | Credo analysis | > 10 branches | WARNING |

## Integration with Platform Subsystems

Quality Gates serve as the central enforcement mechanism connecting multiple platform capabilities:

- **[NO MERCY](@/capabilities/no-mercy.md)**: Quality Gates are the technical implementation of NO MERCY's zero-tolerance standards
- **[NO DOUBTS](@/capabilities/no-doubts.md)**: Gates verify that evidence requirements are met before execution proceeds
- **[Trinity Gate](@/capabilities/trinity-gate.md)**: Formal verification layer for critical decisions beyond code quality
- **[Regression Tests](@/capabilities/regression-tests.md)**: Mandatory regression test protocol enforced as a gate requirement
- **[Session Discipline](@/capabilities/session-discipline.md)**: Gates enforce that commits meet session tracking requirements
- **[Telemetry Integration](@/capabilities/telemetry-integration.md)**: Gate execution emits telemetry events for monitoring
- **[Real-Time Monitoring](@/capabilities/real-time-monitoring.md)**: Quality Floor Guardian provides continuous score tracking
- **[Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md)**: Auto-healing triggered when quality score drops
- **[AIAD Standard](@/capabilities/aiad-standard.md)**: Agent operations subject to same gate requirements
- **[Color Teams](@/capabilities/color-teams.md)**: Purple Team validates gate effectiveness through adversarial testing

## Configuration

### Running Quality Gates

```bash
# Full quality gate pipeline (recommended)
mix quality.gates

# Individual gate checks
mix format --check-formatted          # Format compliance
mix compile --warnings-as-errors      # Zero-warning compilation
mix credo --strict                    # Code quality analysis
mix dialyzer                          # Static type analysis
mix test --cover                      # Test suite with coverage

# Quick check (pre-command validation)
mix quality.gates.check --fast

# CI-friendly JSON output
mix quality.enforce_standard --json

# Auto-fix mode (applies safe corrections)
mix quality.enforce_standard --fix
```

### Nuclear Cache Resolution

When stale compilation artifacts cause false Dialyzer errors, the nuclear cache fix resolves the issue:

```bash
rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt
mix compile --warnings-as-errors --force
mix dialyzer
```

## Commands

| Command | Purpose | Authority |
|---------|---------|-----------|
| `/quality-gates` | Run complete quality gate pipeline | Universal |
| `/quality-gates.check` | Quick validation (pre-command) | Universal |
| `/quality-gates.full` | Full pipeline including benchmarks | CI/CD |
| `mix quality.gates` | Mix task for quality gate execution | Development |
| `mix quality.enforce_standard` | Compliance check across all apps | System |

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)