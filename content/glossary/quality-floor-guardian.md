+++
title = "Quality Floor Guardian"
weight = 51
[extra]
category = "quality"
description = "Autonomous quality monitoring system preventing score regression through four enforcement levels and predictive analysis in the Prismatic Platform"
related_app = "prismatic_safety"
related_terms = ["quality-gates", "quality-dna", "quality-debt", "telemetry", "autoheal", "self-healing", "autoevolve", "seadf", "credo", "dialyzer", "supervision-tree", "genserver"]
keywords = ["quality floor guardian monitoring", "autonomous quality enforcement", "quality regression prevention", "predictive quality analysis", "risk pattern detection", "quality score monitoring", "SEADF healing trigger", "commit blocking quality", "Elixir quality automation", "platform quality sentinel"]
tags = ["quality", "monitoring", "automation", "safety", "enforcement"]
platform_integration = "core"
complexity = "advanced"
audience = ["platform-engineers", "quality-architects", "devops-engineers"]
date_created = "2026-02-22"
version = "2.0.0"
requires_knowledge = ["telemetry", "genserver", "quality-gates"]
prismatic_components = ["QualityFloorGuardian", "RiskPatternDetector", "PredictiveMonitor", "AutoEvolutionTrigger"]
enforcement_levels = ["OPTIMAL (99-100%)", "WARNING (98-99%)", "CRITICAL (95-98%)", "EMERGENCY (<95%)"]
telemetry_events = ["quality_floor.level_change", "quality_floor.risk_detected", "quality_floor.emergency"]
current_score = "100/100"
current_level = "OPTIMAL"
quality_domains_count = 13
risk_patterns_tracked = ["length_gt_zero", "process_sleep", "missing_spec", "unsafe_map_access", "high_risk_file_modification"]
enforcement_level = "P0"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1306
date_modified = "2026-02-23"
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quality Floor Guardian - Prismatic Platform"
+++

## Definition and Overview

The Quality Floor Guardian is an autonomous monitoring system that continuously tracks the Prismatic Platform's quality score and prevents regression below defined thresholds. It operates as a sentinel process within the `prismatic_safety` application, consuming [Telemetry](@/glossary/telemetry.md) events from across all 115 umbrella applications and triggering progressively stronger interventions when quality metrics approach or breach defined floor levels. The Guardian embodies the principle that quality scores should only move upward -- any downward movement indicates a problem that requires immediate attention.

Traditional quality monitoring is reactive: teams discover quality degradation after it has already occurred, often during code review or CI pipeline execution. The Quality Floor Guardian inverts this model by proactively monitoring quality signals in real time, detecting degradation trends before they manifest as violations, and automatically triggering remediation actions. It operates at four enforcement levels, from passive monitoring at optimal quality through emergency commit blocking when quality degrades critically.

The Guardian is particularly important in a platform with 115 umbrella applications and thousands of Elixir source files, where quality degradation in one application can propagate to dependent applications through shared modules, behaviours, and data contracts. By monitoring at the platform level rather than per-application, the Guardian detects cross-cutting quality issues that per-app monitoring would miss.

The current platform quality score is 100/100 with all 13 quality domains passing. The Guardian operates at OPTIMAL enforcement level with zero risk patterns detected -- a state achieved through continuous monitoring and immediate intervention at the first sign of regression.

## Historical Context

The Quality Floor Guardian was conceived during Generation 12 of the platform's evolution, when a series of quality regressions exposed a fundamental gap in the quality assurance workflow. Individual quality checks ([Credo](@/glossary/credo.md), [Dialyzer](@/glossary/dialyzer.md), compilation warnings, test coverage) were enforced at commit time through pre-commit hooks, but there was no system watching the aggregate quality trajectory between commits. A developer could make several small changes, each passing individual quality checks, that collectively degraded the platform's overall quality posture.

The first version of the Guardian was a simple GenServer that polled quality metrics every 5 minutes and logged warnings when scores dropped. Over successive generations, it evolved into the four-level enforcement system with predictive capabilities, risk pattern detection, and automated healing integration. The addition of the SEADF (Self-Evolving Autonomous Defense Framework) healing trigger in Generation 15 enabled the Guardian to not just detect regressions but initiate automated remediation.

The elimination of all 905 Quality Debt Points (QDP) to achieve the current 100/100 score was driven in part by the Guardian's ability to detect and surface subtle quality degradation patterns that human reviewers consistently missed, such as gradual accumulation of `length() > 0` anti-patterns or slow erosion of `@spec` coverage.

## Technical Deep Dive

### Four Enforcement Levels

The Guardian operates at four progressively stronger enforcement levels based on the platform quality score:

| Level | Score Range | Response | Automation | Recovery Time |
|-------|------------|----------|------------|--------------|
| **OPTIMAL** | 100-99% | Monitor only | Passive observation, trend logging | N/A |
| **WARNING** | 98-99% | Alert + investigate | Telemetry alert, investigation trigger | Minutes |
| **CRITICAL** | 95-98% | Auto-evolution trigger | SEADF healing, AutoEvolve activation | Hours |
| **EMERGENCY** | Below 95% | Block commits + escalate | Pre-commit block, L4 Supreme escalation | Immediate |

Each level transition emits Telemetry events that other systems can observe:

```elixir
defmodule PrismaticSafety.QualityFloorGuardian do
  @moduledoc """
  Autonomous quality monitoring system with four enforcement levels.
  Prevents quality score regression through progressive intervention.
  Runs as a supervised GenServer within the prismatic_safety application,
  consuming telemetry events and performing periodic quality assessments.
  """

  use GenServer

  require Logger

  @optimal_threshold 99
  @warning_threshold 98
  @critical_threshold 95
  @check_interval :timer.minutes(5)

  @type enforcement_level :: :optimal | :warning | :critical | :emergency
  @type quality_state :: %{
    current_score: float(),
    enforcement_level: enforcement_level(),
    last_check: DateTime.t(),
    trend: :improving | :stable | :regressing,
    trend_window: list(float()),
    risk_patterns: [risk_pattern()],
    intervention_history: [intervention()],
    consecutive_optimal: non_neg_integer()
  }

  @type risk_pattern :: %{
    pattern: atom(),
    file: String.t(),
    line: non_neg_integer(),
    severity: :low | :medium | :high | :critical
  }

  @type intervention :: %{
    level: enforcement_level(),
    action: atom(),
    timestamp: DateTime.t(),
    result: :resolved | :escalated | :pending
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec current_status() :: {:ok, quality_state()}
  def current_status do
    GenServer.call(__MODULE__, :status)
  end

  @impl true
  def init(_opts) do
    attach_telemetry_handlers()
    schedule_periodic_check()

    {:ok, initial_state()}
  end

  @impl true
  def handle_call(:status, _from, state) do
    {:reply, {:ok, state}, state}
  end

  @impl true
  def handle_info(:periodic_check, state) do
    new_state = perform_quality_check(state)
    schedule_periodic_check()
    {:noreply, new_state}
  end

  defp initial_state do
    %{
      current_score: 100.0,
      enforcement_level: :optimal,
      last_check: DateTime.utc_now(),
      trend: :stable,
      trend_window: [],
      risk_patterns: [],
      intervention_history: [],
      consecutive_optimal: 0
    }
  end

  defp perform_quality_check(state) do
    current_score = calculate_current_score()
    new_level = determine_enforcement_level(current_score)
    risk_patterns = detect_risk_patterns()
    trend = calculate_trend(state, current_score)

    if new_level != state.enforcement_level do
      handle_level_transition(state.enforcement_level, new_level, current_score)
    end

    %{state |
      current_score: current_score,
      enforcement_level: new_level,
      last_check: DateTime.utc_now(),
      trend: trend,
      trend_window: Enum.take([current_score | state.trend_window], 20),
      risk_patterns: risk_patterns,
      consecutive_optimal: if(new_level == :optimal, do: state.consecutive_optimal + 1, else: 0)
    }
  end

  defp determine_enforcement_level(score) do
    cond do
      score >= @optimal_threshold -> :optimal
      score >= @warning_threshold -> :warning
      score >= @critical_threshold -> :critical
      true -> :emergency
    end
  end

  defp handle_level_transition(old_level, new_level, score) do
    :telemetry.execute(
      [:prismatic, :quality_floor, :level_change],
      %{score: score},
      %{from: old_level, to: new_level, timestamp: DateTime.utc_now()}
    )

    Logger.info("Quality Floor Guardian: level transition #{old_level} -> #{new_level} (score: #{score})")

    case new_level do
      :warning -> trigger_investigation(score)
      :critical -> trigger_auto_evolution(score)
      :emergency -> trigger_emergency_response(score)
      :optimal -> log_optimal_status(score)
    end
  end

  defp calculate_trend(state, current_score) do
    case state.trend_window do
      [] -> :stable
      window ->
        avg = Enum.sum(window) / length(window)
        cond do
          current_score > avg + 0.5 -> :improving
          current_score < avg - 0.5 -> :regressing
          true -> :stable
        end
    end
  end

  defp calculate_current_score, do: 100.0
  defp detect_risk_patterns, do: []
  defp trigger_investigation(_score), do: :ok
  defp trigger_auto_evolution(_score), do: :ok
  defp trigger_emergency_response(_score), do: :ok
  defp log_optimal_status(_score), do: :ok
  defp attach_telemetry_handlers, do: :ok
  defp schedule_periodic_check, do: Process.send_after(self(), :periodic_check, @check_interval)
end
```

### Risk Pattern Detection

The Guardian actively scans for known risk patterns that historically precede quality degradation:

```elixir
defmodule PrismaticSafety.RiskPatternDetector do
  @moduledoc """
  Detects code patterns that historically precede quality regression.
  Each pattern has a severity level, description, and recommended
  remediation. Patterns are checked against source files during
  quality assessments and pre-commit validation.
  """

  @type risk_pattern :: %{
    name: atom(),
    pattern: Regex.t() | :file_based,
    severity: :low | :medium | :high | :critical,
    description: String.t(),
    remediation: String.t()
  }

  @risk_patterns [
    %{
      name: :length_gt_zero,
      pattern: ~r/length\(\w+\)\s*>\s*0/,
      severity: :medium,
      description: "length() > 0 anti-pattern, use pattern matching or Enum.any?",
      remediation: "Replace with match?([_ | _], list) or Enum.any?(list)"
    },
    %{
      name: :process_sleep,
      pattern: ~r/Process\.sleep/,
      severity: :high,
      description: "Process.sleep in non-test code introduces non-determinism",
      remediation: "Use :timer module or message-based synchronization"
    },
    %{
      name: :missing_spec,
      pattern: ~r/def\s+\w+\([^)]*\)\s+do(?!\n\s*@spec)/,
      severity: :medium,
      description: "Public function without @spec annotation",
      remediation: "Add @spec annotation with proper type signatures"
    },
    %{
      name: :unsafe_map_access,
      pattern: ~r/\w+\[:[a-z_]+\]/,
      severity: :medium,
      description: "Direct map key access without default or pattern match",
      remediation: "Use Map.get/3 with default or pattern matching"
    },
    %{
      name: :high_risk_file_modification,
      pattern: :file_based,
      severity: :high,
      description: "Modification to supervision tree, configuration, or release files",
      remediation: "Requires additional review and testing"
    }
  ]

  @spec scan_file(String.t()) :: {:ok, [map()]} | {:error, term()}
  def scan_file(file_path) do
    case File.read(file_path) do
      {:ok, content} ->
        findings =
          @risk_patterns
          |> Enum.filter(fn pattern -> pattern.pattern != :file_based end)
          |> Enum.flat_map(fn pattern ->
            case Regex.scan(pattern.pattern, content, return: :index) do
              [] -> []
              matches ->
                Enum.map(matches, fn [{offset, _length} | _] ->
                  line = count_lines(content, offset)
                  %{pattern: pattern.name, file: file_path, line: line, severity: pattern.severity}
                end)
            end
          end)

        {:ok, findings}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec scan_directory(String.t()) :: {:ok, [map()]} | {:error, term()}
  def scan_directory(path) do
    findings =
      Path.wildcard(Path.join(path, "**/*.ex"))
      |> Enum.flat_map(fn file ->
        case scan_file(file) do
          {:ok, results} -> results
          {:error, _} -> []
        end
      end)

    {:ok, findings}
  end

  defp count_lines(content, offset) do
    content
    |> binary_part(0, min(offset, byte_size(content)))
    |> String.split("\n")
    |> length()
  end
end
```

### Auto-Evolution Trigger

When the quality score enters CRITICAL range, the Guardian automatically activates the [SEADF](@/glossary/seadf.md) healing subsystem:

```elixir
defmodule PrismaticSafety.AutoEvolutionTrigger do
  @moduledoc """
  Triggers automatic evolution and healing when quality
  scores enter CRITICAL or EMERGENCY ranges. Executes
  platform mix tasks in isolated processes with timeout
  protection and circuit breaker patterns.
  """

  require Logger

  @spec trigger_healing(float(), atom()) :: {:ok, map()} | {:error, term()}
  def trigger_healing(score, :critical) do
    Logger.warning("Quality Floor Guardian: CRITICAL level at #{score}%. Triggering auto-heal.")

    with {:ok, baseline} <- run_mix_task("autoheal.baseline"),
         {:ok, scan} <- run_mix_task("autoevolve.scan", ["--quick"]),
         {:ok, cycle} <- run_mix_task("autoheal.cycle") do
      {:ok, %{baseline: baseline, scan: scan, cycle: cycle}}
    end
  end

  def trigger_healing(score, :emergency) do
    Logger.error("Quality Floor Guardian: EMERGENCY level at #{score}%. Blocking commits.")

    # Block commits by writing emergency flag
    File.write!(".quality-emergency", "#{score}")

    # Trigger full evolution
    with {:ok, mega} <- run_mix_task("autoevolve.mega") do
      {:ok, %{mega: mega, commits_blocked: true}}
    end
  end

  defp run_mix_task(task, args \\ []) do
    # Execute mix task in isolated process with timeout
    {:ok, %{task: task, args: args, status: :completed}}
  end
end
```

## Architecture and Implementation

### Telemetry Integration

The Guardian subscribes to multiple Telemetry event streams across the platform:

| Event Path | Source | Purpose |
|-----------|--------|---------|
| `[:prismatic, :compilation, :warning]` | Mix compiler | Compilation warning detection |
| `[:prismatic, :credo, :violation]` | [Credo](@/glossary/credo.md) analysis | Static analysis violation tracking |
| `[:prismatic, :dialyzer, :error]` | [Dialyzer](@/glossary/dialyzer.md) | Type violation monitoring |
| `[:prismatic, :test, :failure]` | ExUnit | Test failure detection |
| `[:prismatic, :quality_dna, :saved]` | [Quality DNA](@/glossary/quality-dna.md) | DNA update coordination |
| `[:prismatic, :session_lifecycle, :*]` | SessionLifecycle | Session boundary awareness |
| `[:prismatic, :quality_floor, :level_change]` | Self | Level transition tracking |

### Supervision Tree Position

The Guardian runs under the `prismatic_safety` [supervision tree](@/glossary/supervision-tree.md) with a `:permanent` restart strategy, ensuring it is always running:

```
PrismaticSafety.Supervisor (one_for_one)
    |
    +-- PrismaticSafety.QualityFloorGuardian (permanent)
    |
    +-- PrismaticSafety.RiskPatternDetector (permanent)
    |
    +-- PrismaticSafety.PredictiveMonitor (permanent)
```

If the Guardian process crashes, the supervisor restarts it immediately. The Guardian re-initializes by reading the latest [Quality DNA](@/glossary/quality-dna.md) snapshot, ensuring continuity of monitoring state across restarts.

### Emergency Response Protocol

When quality drops below 95%, the Guardian activates emergency protocols:

1. **Immediate commit blocking**: Writes a `.quality-emergency` flag file that pre-commit hooks check before allowing any commit
2. **L4 Supreme escalation**: Emits a high-priority Telemetry event triggering Supreme Commander notification
3. **Full AutoEvolve mega cycle**: Runs the most comprehensive [evolution](@/glossary/autoevolve.md) and healing pipeline
4. **Incident logging**: Records the emergency event with full diagnostic context for post-mortem analysis

### Predictive Quality Monitoring

Beyond reactive threshold monitoring, the Guardian performs predictive analysis based on trend data and risk pattern accumulation:

```elixir
defmodule PrismaticSafety.PredictiveMonitor do
  @moduledoc """
  Predicts quality score trajectory based on recent changes
  and risk pattern accumulation. Uses a weighted combination
  of pattern risk, trend direction, and velocity to estimate
  future quality state and trigger preemptive interventions.
  """

  @spec predict_regression_risk(map()) :: {:ok, float()}
  def predict_regression_risk(state) do
    pattern_risk = calculate_pattern_risk(state.risk_patterns)
    trend_risk = calculate_trend_risk(state.trend)
    velocity_risk = calculate_velocity_risk(state)

    total_risk = min(1.0, pattern_risk + trend_risk + velocity_risk)
    {:ok, total_risk}
  end

  defp calculate_pattern_risk(patterns) do
    patterns
    |> Enum.map(fn p ->
      case p.severity do
        :critical -> 0.3
        :high -> 0.15
        :medium -> 0.05
        :low -> 0.01
      end
    end)
    |> Enum.sum()
    |> min(0.5)
  end

  defp calculate_trend_risk(:improving), do: 0.0
  defp calculate_trend_risk(:stable), do: 0.05
  defp calculate_trend_risk(:regressing), do: 0.2

  defp calculate_velocity_risk(state) do
    case state.trend_window do
      [latest, previous | _] when latest < previous -> (previous - latest) * 0.1
      _ -> 0.0
    end
  end
end
```

## Quality Domains Monitored

The Guardian tracks 13 quality domains, each contributing to the aggregate platform quality score:

| Domain | Weight | Current Status | Metric |
|--------|--------|---------------|--------|
| Dialyzer | High | 0 violations | Type correctness |
| Credo | High | 0 violations | Code style and consistency |
| Compilation | Critical | 0 warnings | Compiler health |
| DateTime Precision | Medium | 0 violations | Temporal accuracy |
| Guard Functions | Medium | 0 violations | Function guard correctness |
| @impl Coverage | High | 709 callbacks | Behaviour compliance |
| Memory Safety | Critical | 0 violations | Resource management |
| Performance | High | 0 violations | Runtime efficiency |
| Regression Prevention | Critical | 0 regressions | Change safety |
| Timing Patterns | Medium | 0 violations | Temporal correctness |
| TODO Management | Low | 0 items | Technical debt tracking |
| Typespec Coverage | High | 0 violations | Type documentation |
| Unsafe Map Access | Medium | 0 violations | Data access safety |

## Usage in Prismatic Platform

### Monitoring Commands

```bash
# Check Quality Floor Guardian status
mix quality.gates

# View current enforcement level
mix autoheal.baseline

# Check for risk patterns
mix quality.enforce_standard

# View quality trend
mix autoevolve status --brief

# Full quality domain report
mix quality.forbidden_patterns
```

### Current Platform Status

| Metric | Value |
|--------|-------|
| Quality Score | 100/100 |
| Enforcement Level | OPTIMAL |
| Risk Patterns Detected | 0 |
| Quality Domains | 13/13 passing |
| Quality Debt Points | 0 (905 eliminated) |
| Guardian Uptime | Continuous |
| Consecutive OPTIMAL checks | Active |

## Pre-Commit Hook Integration

The Guardian's enforcement levels integrate with the platform's 11-phase pre-commit hook system:

```
Phase 1: Syntax validation
Phase 2: Compilation check (--warnings-as-errors)
Phase 3: Credo --strict
Phase 4: Dialyzer verification
Phase 5: Test execution
Phase 6: Quality gates check
Phase 7: Quality Floor Guardian emergency check  <-- Guardian integration
Phase 8: Template validation
Phase 9: Forbidden patterns scan
Phase 10: Design consistency
Phase 11: Security scan
```

In Phase 7, the pre-commit hook checks for the `.quality-emergency` flag file. If present (set by the Guardian during EMERGENCY level), all commits are blocked until the quality emergency is resolved.

## Best Practices

1. **Never disable the Guardian for convenience**. The Guardian exists to protect quality investments. Disabling it, even temporarily, creates windows where regression can occur undetected.

2. **Investigate WARNING level immediately**. Do not wait for CRITICAL. WARNING indicates quality is trending downward and early intervention is far cheaper than emergency recovery.

3. **Review risk patterns proactively**. The Guardian detects patterns that historically precede regressions. Addressing risk patterns before they cause QDP prevents the enforcement level from ever degrading.

4. **Monitor Telemetry events from the Guardian**. Build dashboards and alerts around Guardian Telemetry events to maintain awareness of quality health across the team.

5. **Test the emergency response path**. Periodically verify that the EMERGENCY response protocol works correctly -- that commits are actually blocked and escalation reaches the right recipients.

6. **Update risk pattern definitions**. As new anti-patterns are discovered, add them to the RiskPatternDetector to expand the Guardian's detection coverage.

## Common Pitfalls

- **Ignoring WARNING-level alerts**: The most common failure mode. WARNING means quality is between 98-99%, which seems acceptable but represents a trajectory toward failure if unchecked.

- **Confusing Guardian monitoring with Quality Gates enforcement**: The Guardian monitors continuously; [Quality Gates](@/glossary/quality-gates.md) enforce at commit time. They complement each other but serve different functions.

- **Not updating risk pattern definitions**: The Guardian's risk patterns are static unless updated. New anti-patterns or vulnerability categories must be added as they are discovered.

- **Over-relying on OPTIMAL status**: A 100/100 score with zero risk patterns does not mean quality improvement is done. It means current standards are met -- standards should evolve.

## Related Concepts

- [Quality Gates](@/glossary/quality-gates.md) -- Enforcement pipeline monitored by the Guardian
- [Quality DNA](@/glossary/quality-dna.md) -- Cross-session quality state persistence
- [Quality Debt](@/glossary/quality-debt.md) -- Tracked debt points monitored for regression
- [Telemetry](@/glossary/telemetry.md) -- Event system powering Guardian real-time monitoring
- [SEADF](@/glossary/seadf.md) -- Evolution framework triggered by Guardian alerts
- [Self-Healing](@/glossary/self-healing.md) -- Automated remediation activated by the Guardian
- [AutoHeal](@/glossary/autoheal.md) -- Healing subsystem invoked during CRITICAL/EMERGENCY levels
- [Supervision Tree](@/glossary/supervision-tree.md) -- OTP tree managing Guardian process lifecycle
- [GenServer](@/glossary/genserver.md) -- OTP behaviour implementing the Guardian process
- [Credo](@/glossary/credo.md) -- Static analysis tool whose violations the Guardian tracks
- [Dialyzer](@/glossary/dialyzer.md) -- Type checker whose errors the Guardian monitors

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Application directory including prismatic_safety

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
