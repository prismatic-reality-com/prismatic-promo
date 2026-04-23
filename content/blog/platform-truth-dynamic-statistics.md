+++
title = "PlatformTruth: Dynamic Statistics as the Single Source of Truth"
date = 2026-03-20
description = "How PlatformTruth eliminates hardcoded metrics through filesystem scanning, ETS caching, claim validation pipelines, and dynamic health scoring."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["platform-truth", "metrics", "ets", "validation", "health-score"]
reading_time = "9 min"
keywords = ["platform truth", "dynamic statistics", "ets caching", "claim validation", "health scoring"]
image = "/images/blog/platform-truth-dynamic-statistics.png"
word_count = 1100
date_created = "2026-03-20"
date_modified = "2026-03-20"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "PlatformTruth: Dynamic Statistics as the Single Source of Truth - Prismatic Platform"
+++

Every platform eventually suffers from stale statistics. Documentation claims "94 apps" while reality has grown to 110. README says "200 agents" but the directory contains 552. The Prismatic Platform solved this permanently with PlatformTruth: a dynamic statistics engine that scans the filesystem in real time, caches results in ETS, and validates every claim in documentation against actual counts.

## The Problem with Hardcoded Metrics

Before PlatformTruth, platform statistics were manually updated in documentation files. This created a persistent drift problem:

| Metric | Documentation Claimed | Actual Count | Drift |
|--------|----------------------|--------------|-------|
| Umbrella apps | 94 | 110 | +16 |
| AIAD agents | 285 | 552 | +267 |
| AIAD commands | 142 | 228 | +86 |
| Source files | 12,000 | 14,978 | +2,978 |
| Test files | 4,000 | 6,330 | +2,330 |

The root cause was simple: humans forget to update numbers after adding new apps, agents, or files. The solution was to eliminate human-maintained statistics entirely.

## PlatformTruth Architecture

PlatformTruth is a GenServer that performs filesystem scanning on startup and caches results in ETS for sub-millisecond access. It provides a single API for all platform metrics:

```elixir
defmodule PrismaticCore.PlatformTruth do
  @moduledoc """
  Single Source of Truth for platform statistics.

  Scans the filesystem to compute real-time platform metrics.
  Caches results in ETS with configurable TTL. All platform
  documentation and dashboards pull from this module.
  """

  use GenServer
  require Logger

  @table :platform_truth
  @refresh_interval :timer.minutes(5)

  @type metrics :: %{
    apps: non_neg_integer(),
    agents: non_neg_integer(),
    commands: non_neg_integer(),
    source_files: non_neg_integer(),
    test_files: non_neg_integer(),
    mix_tasks: non_neg_integer(),
    pre_commit_hooks: non_neg_integer(),
    workflows: non_neg_integer()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec get(atom()) :: term()
  def get(metric) do
    case :ets.lookup(@table, metric) do
      [{^metric, value, _timestamp}] -> value
      [] -> compute_and_cache(metric)
    end
  end

  @spec all_metrics() :: metrics()
  def all_metrics do
    %{
      apps: get(:apps),
      agents: get(:agents),
      commands: get(:commands),
      source_files: get(:source_files),
      test_files: get(:test_files),
      mix_tasks: get(:mix_tasks),
      pre_commit_hooks: get(:pre_commit_hooks),
      workflows: get(:workflows)
    }
  end

  @impl GenServer
  def init(_opts) do
    :ets.new(@table, [:named_table, :set, :public, read_concurrency: true])
    refresh_all()
    schedule_refresh()
    {:ok, %{last_refresh: DateTime.utc_now()}}
  end

  @impl GenServer
  def handle_info(:refresh, state) do
    refresh_all()
    schedule_refresh()
    {:noreply, %{state | last_refresh: DateTime.utc_now()}}
  end

  defp refresh_all do
    metrics = compute_all_metrics()

    for {key, value} <- metrics do
      :ets.insert(@table, {key, value, System.monotonic_time()})
    end

    Logger.debug("PlatformTruth refreshed: #{inspect(metrics)}")
  end

  defp schedule_refresh do
    Process.send_after(self(), :refresh, @refresh_interval)
  end
end
```

## Filesystem Scanning

Each metric has a dedicated scanner that walks the filesystem and counts matching paths. Scanners are designed to be fast and avoid traversing unnecessary directories:

```elixir
defmodule PrismaticCore.PlatformTruth.Scanners do
  @moduledoc """
  Filesystem scanners for platform metric computation.

  Each scanner targets a specific metric type and uses
  optimized path traversal to minimize I/O. Results are
  deterministic given the same filesystem state.
  """

  @project_root File.cwd!()

  @spec count_apps() :: non_neg_integer()
  def count_apps do
    Path.join(@project_root, "apps/*/mix.exs")
    |> Path.wildcard()
    |> length()
  end

  @spec count_agents() :: non_neg_integer()
  def count_agents do
    Path.join(@project_root, ".aiad/agents/**/*.{md,yaml,yml}")
    |> Path.wildcard()
    |> Enum.reject(&String.contains?(&1, "/backup/"))
    |> Enum.reject(&String.contains?(&1, "/archive/"))
    |> length()
  end

  @spec count_commands() :: non_neg_integer()
  def count_commands do
    aiad_commands =
      Path.join(@project_root, ".aiad/commands/**/*.{md,yaml,yml}")
      |> Path.wildcard()
      |> length()

    mix_tasks =
      Path.join(@project_root, "apps/*/lib/**/mix/tasks/**/*.ex")
      |> Path.wildcard()
      |> length()

    aiad_commands + mix_tasks
  end

  @spec count_source_files() :: non_neg_integer()
  def count_source_files do
    Path.join(@project_root, "apps/*/lib/**/*.ex")
    |> Path.wildcard()
    |> length()
  end

  @spec count_test_files() :: non_neg_integer()
  def count_test_files do
    Path.join(@project_root, "apps/*/test/**/*_test.exs")
    |> Path.wildcard()
    |> length()
  end

  @spec count_pre_commit_hooks() :: non_neg_integer()
  def count_pre_commit_hooks do
    hooks_dir = Path.join(@project_root, ".githooks/pre-commit.d/")

    if File.dir?(hooks_dir) do
      hooks_dir
      |> File.ls!()
      |> Enum.filter(&String.match?(&1, ~r/^\d+-/))
      |> length()
    else
      0
    end
  end
end
```

## Claim Validation Pipeline

The `mix truth.validate` task scans documentation files for statistical claims and validates them against PlatformTruth:

```elixir
defmodule Mix.Tasks.Truth.Validate do
  @moduledoc """
  Validates statistical claims in documentation against
  PlatformTruth computed metrics.

  Scans markdown files for patterns like "94 apps" or
  "552 agents" and verifies against live filesystem counts.
  Returns non-zero exit code if any claim is stale.
  """

  use Mix.Task

  @claim_patterns [
    {~r/(\d+)\s+(?:umbrella\s+)?apps?/i, :apps},
    {~r/(\d+)\s+(?:AIAD\s+)?agents?/i, :agents},
    {~r/(\d+)\s+(?:AIAD\s+)?commands?/i, :commands},
    {~r/(\d+)\s+source\s+files?/i, :source_files},
    {~r/(\d+)\s+test\s+files?/i, :test_files}
  ]

  @doc_files ~w(
    CLAUDE.md
    README.md
    AGENTS.md
    .claude/AGENT_REGISTRY.md
    .claude/COMMAND_REGISTRY.md
    docs/ARCHITECTURE.md
  )

  @spec run(list()) :: :ok
  def run(_args) do
    truth = PrismaticCore.PlatformTruth.all_metrics()
    violations = scan_all_files(truth)

    if violations == [] do
      Mix.shell().info("All #{count_claims()} claims validated against PlatformTruth")
    else
      Mix.shell().error("Found #{length(violations)} stale claims:")

      for v <- violations do
        Mix.shell().error("  #{v.file}:#{v.line} — claims #{v.claimed} #{v.metric}, actual: #{v.actual}")
      end

      Mix.raise("truth.validate failed: #{length(violations)} stale claims")
    end
  end

  defp scan_all_files(truth) do
    Enum.flat_map(@doc_files, fn file ->
      path = Path.join(File.cwd!(), file)

      if File.exists?(path) do
        scan_file(path, truth)
      else
        []
      end
    end)
  end

  defp scan_file(path, truth) do
    path
    |> File.read!()
    |> String.split("\n")
    |> Enum.with_index(1)
    |> Enum.flat_map(fn {line, line_number} ->
      check_line(line, line_number, path, truth)
    end)
  end

  defp check_line(line, line_number, path, truth) do
    Enum.flat_map(@claim_patterns, fn {pattern, metric} ->
      case Regex.run(pattern, line) do
        [_match, claimed_str] ->
          claimed = String.to_integer(claimed_str)
          actual = Map.get(truth, metric)

          if claimed != actual and actual != nil do
            [%{file: Path.relative_to_cwd(path), line: line_number,
               metric: metric, claimed: claimed, actual: actual}]
          else
            []
          end

        nil ->
          []
      end
    end)
  end
end
```

## Health Scoring Formula

The platform health score aggregates multiple dimensions into a single 0-100 score:

```elixir
defmodule PrismaticCore.HealthScore do
  @moduledoc """
  Computes platform health score from multiple dimensions.

  Dimensions include compilation health, test coverage,
  doctrine compliance, dependency freshness, and documentation
  completeness. Returns a weighted score from 0 to 100.
  """

  @type dimension :: %{
    name: atom(),
    weight: float(),
    score: float(),
    details: map()
  }

  @weights %{
    compilation: 0.25,
    test_coverage: 0.20,
    doctrine_compliance: 0.20,
    dependency_health: 0.15,
    documentation: 0.10,
    security: 0.10
  }

  @spec compute() :: %{score: float(), grade: String.t(), dimensions: [dimension()]}
  def compute do
    dimensions = [
      compute_compilation(),
      compute_test_coverage(),
      compute_doctrine_compliance(),
      compute_dependency_health(),
      compute_documentation(),
      compute_security()
    ]

    total = Enum.sum(Enum.map(dimensions, fn d -> d.score * @weights[d.name] end))
    grade = score_to_grade(total)

    %{score: Float.round(total, 1), grade: grade, dimensions: dimensions}
  end

  defp compute_compilation do
    {_output, code} = System.cmd("mix", ["compile", "--warnings-as-errors"],
      stderr_to_stdout: true, env: [{"MIX_ENV", "dev"}])

    score = if code == 0, do: 100.0, else: 50.0
    %{name: :compilation, weight: @weights.compilation, score: score, details: %{exit_code: code}}
  end

  defp compute_doctrine_compliance do
    results = PrismaticQuality.Doctrines.validate_all()
    total = map_size(results)
    passed = Enum.count(results, fn {_k, v} -> v.status == :pass end)
    score = if total > 0, do: passed / total * 100.0, else: 0.0

    %{name: :doctrine_compliance, weight: @weights.doctrine_compliance,
      score: score, details: %{passed: passed, total: total}}
  end

  defp score_to_grade(score) when score >= 90, do: "A"
  defp score_to_grade(score) when score >= 80, do: "B"
  defp score_to_grade(score) when score >= 70, do: "C"
  defp score_to_grade(score) when score >= 60, do: "D"
  defp score_to_grade(_score), do: "F"
end
```

| Dimension | Weight | Measurement | Target |
|-----------|--------|-------------|--------|
| Compilation | 25% | Zero warnings with --warnings-as-errors | 100% |
| Test Coverage | 20% | ExUnit coverage report | > 80% |
| Doctrine Compliance | 20% | Pillars passing / total pillars | > 85% |
| Dependency Health | 15% | No vulnerable or outdated deps | 100% |
| Documentation | 10% | @moduledoc + @doc coverage | > 90% |
| Security | 10% | SEAL pillar + dep audit | 100% |

## Mix Tasks for Dynamic Management

```elixir
# Available management commands
# mix stats --summary        → Real-time platform overview
# mix truth.validate         → Validate all claims against truth
# mix health.score           → Compute health score
# mix stats.update_docs      → Regenerate docs from live data
```

PlatformTruth ensures that the platform never lies about itself. Every number in every documentation file is either dynamically generated or validated against filesystem reality. The ETS cache provides sub-millisecond access for dashboards and API responses, while the periodic refresh keeps metrics current without constant filesystem scanning. The claim validation pipeline runs in pre-commit hooks and CI, catching stale numbers before they reach production.
