+++
title = "Quality Floor"
weight = 50
[extra]
description = "Minimum acceptable quality threshold autonomously monitored and enforced across all platform code"
category = "quality"
related_terms = ["placeholder", "plt", "property-test", "provenance", "quality-floor-guardian"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["quality floor", "quality gate", "threshold", "guardian", "enforcement", "glossary", "Prismatic Platform"]
tags = ["glossary", "quality", "enforcement", "doctrine"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Quality Floor - Prismatic Platform"
+++

## Definition & Overview

A quality floor is the minimum acceptable quality level that a codebase must maintain at all times. Unlike quality targets (aspirational goals to improve toward), a quality floor is a hard lower bound -- any regression below this threshold triggers immediate remediation. The concept draws from the "ratchet" pattern in continuous improvement: quality can only go up, never down. Once a quality level is achieved, it becomes the new floor.

The Prismatic Platform implements the quality floor concept through the Quality Floor Guardian, an autonomous monitoring system that continuously tracks 13 quality domains across all 115 umbrella applications. The current quality floor is 100/100 (PERFECT), meaning zero violations across all domains: Dialyzer, Credo, compilation warnings, DateTime precision, guard functions, @impl coverage, memory safety, performance, regression prevention, timing patterns, TODO management, typespec coverage, and unsafe map access.

The quality floor enforcement operates at four levels: OPTIMAL (100-99%, monitor only), WARNING (98-99%, alert and investigate), CRITICAL (95-98%, auto-evolution trigger), and EMERGENCY (below 95%, block commits and escalate). This graduated response ensures proportionate action -- minor fluctuations trigger investigation, while significant regressions trigger immediate blocking.

## Technical Deep Dive

The Quality Floor Guardian is implemented as a GenServer that periodically scans the codebase and evaluates quality metrics against the established floor. Each quality domain has a specific measurement function, threshold, and enforcement action.

```elixir
defmodule PrismaticSafety.QualityFloorGuardian do
  @moduledoc """
  Autonomous quality monitoring that enforces minimum quality
  thresholds across 13 domains. Blocks commits and triggers
  alerts when the quality floor is breached.
  """

  use GenServer

  @quality_domains [
    {:dialyzer, 0, :block},
    {:credo, 0, :block},
    {:compilation_warnings, 0, :block},
    {:datetime_precision, 0, :block},
    {:guard_functions, 0, :block},
    {:impl_coverage, 0, :block},
    {:memory_safety, 0, :block},
    {:performance, 0, :block},
    {:regression_prevention, 0, :block},
    {:timing_patterns, 0, :block},
    {:todo_management, 0, :block},
    {:typespec_coverage, 0, :block},
    {:unsafe_map_access, 0, :block}
  ]

  @enforcement_levels %{
    optimal: {99, 100},
    warning: {98, 99},
    critical: {95, 98},
    emergency: {0, 95}
  }

  @check_interval 300_000

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_check()
    {:ok, %{last_scan: nil, scores: %{}, overall: 100}}
  end

  @impl true
  def handle_info(:check, state) do
    scores = scan_all_domains()
    overall = compute_overall_score(scores)
    level = determine_enforcement_level(overall)

    case level do
      :emergency ->
        :telemetry.execute(
          [:prismatic, :quality_floor, :emergency],
          %{score: overall},
          %{scores: scores}
        )
        block_commits()

      :critical ->
        :telemetry.execute(
          [:prismatic, :quality_floor, :critical],
          %{score: overall},
          %{scores: scores}
        )
        trigger_auto_evolution()

      :warning ->
        :telemetry.execute(
          [:prismatic, :quality_floor, :warning],
          %{score: overall},
          %{scores: scores}
        )

      :optimal ->
        :ok
    end

    schedule_check()
    {:noreply, %{state | last_scan: DateTime.utc_now(), scores: scores, overall: overall}}
  end

  defp scan_all_domains do
    Map.new(@quality_domains, fn {domain, threshold, _action} ->
      violations = measure_domain(domain)
      {domain, %{violations: violations, threshold: threshold, passed: violations <= threshold}}
    end)
  end

  defp compute_overall_score(scores) do
    total = map_size(scores)
    passed = Enum.count(scores, fn {_, %{passed: p}} -> p end)
    round(passed / total * 100)
  end

  defp determine_enforcement_level(score) do
    cond do
      score >= 99 -> :optimal
      score >= 98 -> :warning
      score >= 95 -> :critical
      true -> :emergency
    end
  end

  defp measure_domain(:dialyzer) do
    # Count Dialyzer violations
    0
  end

  defp measure_domain(:credo) do
    # Count Credo violations
    0
  end

  defp measure_domain(domain) do
    # Generic domain measurement
    0
  end

  defp block_commits do
    # Write block flag to .quality_floor_block
    File.write!(".quality_floor_block", "EMERGENCY: Quality floor breached")
  end

  defp trigger_auto_evolution do
    # Trigger autoevolve scan
    :ok
  end

  defp schedule_check, do: Process.send_after(self(), :check, @check_interval)
end
```

The Quality DNA system provides cross-session persistence for quality metrics. The current state is stored in `.claude/quality-dna/current-state.json` and loaded at session start, providing continuity between development sessions and enabling trend analysis over time.

```elixir
defmodule PrismaticQuality.DNA do
  @moduledoc """
  Cross-session quality state persistence via Quality DNA files.
  Maintains quality metrics history and trend data across
  development sessions.
  """

  @dna_path ".claude/quality-dna/current-state.json"

  @spec load() :: {:ok, map()} | {:error, term()}
  def load do
    case File.read(@dna_path) do
      {:ok, content} ->
        {:ok, Jason.decode!(content)}

      {:error, :enoent} ->
        {:ok, initial_state()}
    end
  end

  @spec save(map()) :: :ok | {:error, term()}
  def save(state) do
    content = Jason.encode!(state, pretty: true)
    File.write!(@dna_path, content)
    :ok
  end

  @spec update_score(map(), atom(), non_neg_integer()) :: map()
  def update_score(state, domain, violations) do
    history_key = "#{domain}_history"
    entry = %{
      "violations" => violations,
      "timestamp" => DateTime.to_iso8601(DateTime.utc_now())
    }

    state
    |> put_in(["domains", to_string(domain), "violations"], violations)
    |> update_in([history_key], fn
      nil -> [entry]
      history -> Enum.take([entry | history], 100)
    end)
  end

  defp initial_state do
    %{
      "version" => "1.0.0",
      "created_at" => DateTime.to_iso8601(DateTime.utc_now()),
      "domains" => %{},
      "overall_score" => 100
    }
  end
end
```

## Architecture & Implementation

The Quality Floor architecture creates a feedback loop between measurement, enforcement, and remediation. Measurement happens continuously through the Guardian GenServer. Enforcement happens at commit time through pre-commit hooks that check the Guardian's latest scan results. Remediation happens through auto-evolution triggers that attempt to fix quality regressions automatically.

The pre-commit hook integrates with the Guardian by checking the `.quality_floor_block` file. If the file exists (written by the Guardian during EMERGENCY state), all commits are blocked until the quality floor is restored. This two-layer enforcement (Guardian for detection, hooks for prevention) ensures that quality regressions cannot enter the codebase.

The ratchet mechanism ensures the floor only increases. When the quality score improves (e.g., from 98 to 100), the new score becomes the floor. Subsequent regressions below 100 trigger enforcement, even if the previous floor was 98. This progressive tightening drives continuous improvement.

## Usage in Prismatic Platform

The quality floor is checked through `mix quality.gates`, which runs all 13 domain checks and reports the overall score. This task is integrated into the pre-commit hook, CI pipeline, and session lifecycle hooks.

```elixir
# Check all quality gates
# mix quality.gates

# Check specific domain
# mix quality.gates --domain dialyzer

# Fast check (cached results)
# mix quality.gates.check --fast

# Quality DNA status
# mix quality.dna.status
```

The current platform state maintains 100/100 quality across all 13 domains, representing zero violations in the entire 2.8-million-line codebase. This achievement is maintained through the combination of the Quality Floor Guardian, pre-commit enforcement, and the NO MERCY doctrine's zero-tolerance approach to quality regression.

## Cross-References

- [Placeholder](@/glossary/placeholder.md) - Forbidden pattern that the quality floor eliminates
- [PLT](@/glossary/plt.md) - Dialyzer's type analysis contributing to the quality floor score
- [Property Test](@/glossary/property-test.md) - Testing methodology supporting quality floor maintenance
- [Provenance](@/glossary/provenance.md) - Origin tracing for quality metric measurements
- **Semver** - Versioning discipline that quality floor enforcement protects

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
