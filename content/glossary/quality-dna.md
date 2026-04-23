+++
title = "Quality DNA"
weight = 52
[extra]
description = "Cross-session quality state persistence mechanism encoding the complete quality blueprint of every application for continuous evolutionary improvement"
category = "quality"
abbreviation = "QDNA"
domain = "quality-engineering"
complexity = "advanced"
maturity = "production"
platform_version = "8.0.0"
generation = 19
enforcement_level = "mandatory"
related_terms = ["quality-floor-guardian", "quality-gates", "quality-debt", "autoevolve", "seadf", "session-discipline", "mycelial-network"]
platforms = ["elixir", "otp", "json"]
use_cases = ["cross-session-continuity", "quality-trend-analysis", "regression-prediction", "evolution-guidance"]
tags = ["quality-persistence", "trend-analysis", "fitness-tracking", "session-continuity", "quality-domains"]
quality_domains = ["dialyzer", "credo", "compilation", "datetime-precision", "guard-functions", "impl-coverage", "memory-safety", "performance", "regression-prevention", "timing-patterns", "todo-management", "typespec-coverage", "unsafe-map-access"]
storage_format = "json"
storage_path = ".claude/quality-dna/current-state.json"
apps_with_dna = 99
date_created = "2025-09-20"
date_updated = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1457
date_modified = "2026-02-23"
keywords = ["Quality", "DNA", "Cross-session", "glossary", "Prismatic Platform", "Quality DNA", "Custom", "CASCADE"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quality DNA - Prismatic Platform"
+++

## Definition and Overview

Quality DNA is a persistence mechanism that encodes the complete quality state of every application in the Prismatic Platform into a structured, version-tracked format that survives session boundaries. Just as biological DNA encodes the genetic blueprint of an organism, Quality DNA encodes the quality blueprint of the platform -- recording scores, domain statuses, historical trends, elimination campaigns, and evolution metadata for every application. This enables continuous quality improvement that accumulates across development sessions rather than starting from scratch each time, creating an unbroken chain of quality evolution spanning hundreds of sessions.

The fundamental problem Quality DNA solves is session amnesia. Without persistent quality state, each development session would need to rediscover the quality baseline, losing awareness of improvement trajectories, regression patterns, and strategic priorities established in previous sessions. A developer starting a new session would have no way of knowing that `prismatic_perimeter` had been trending toward a regression in its [Dialyzer](/glossary/dialyzer/) domain, or that `prismatic_agents` had just completed a successful CASCADE elimination campaign. Quality DNA transforms quality management from a series of disconnected snapshots into a continuous evolutionary narrative with full historical context.

Quality DNA is stored in `.claude/quality-dna/current-state.json` at the project level, with per-application DNA records maintained alongside each application's `CLAUDE.md`. Every session loads the previous quality state at startup through the SessionLifecycle GenServer, applies changes during the session as quality checks run and violations are fixed, and persists the updated state at session end. This creates an unbroken chain of quality evolution that can be analyzed for patterns, regressions, and strategic insights. The mechanism is deeply integrated with the platform's [AutoEvolve](/glossary/autoevolve/) system, the [SEADF](/glossary/seadf/) framework, and the [Quality Floor Guardian](/glossary/quality-floor-guardian/) monitoring system.

## Biological Analogy and Design Philosophy

The biological DNA analogy is not merely cosmetic -- it reflects deep structural similarities between genetic encoding and quality state persistence. In biology, DNA serves four functions: storage of genetic information, replication across generations, expression through proteins, and mutation for evolution. Quality DNA mirrors each function precisely.

**Storage**: Quality DNA records the complete quality state -- 13 domain scores, violation counts, trend data, and evolution metadata -- in a structured JSON format. This is the "genetic code" of the application's quality profile.

**Replication**: When a new session begins, Quality DNA is "replicated" from the persistent store into the session's working memory. When a new application is created, it receives an initialized DNA record based on the platform's quality standard template, analogous to inheriting a baseline genome.

**Expression**: Quality DNA "expresses" through the decisions it informs. The [AutoEvolve](/glossary/autoevolve/) system reads DNA trend data to prioritize which domains to improve. The Quality Floor Guardian reads DNA scores to determine alert thresholds. The [quality gates](/glossary/quality-gates/) pipeline reads DNA baselines to detect regressions. DNA data does not just record state -- it actively shapes platform behavior.

**Mutation**: As quality improvements are made, DNA records mutate -- scores change, trends shift, violations are eliminated. These mutations accumulate across sessions, driving the platform's quality evolution from its initial state toward the current 100/100 perfect score across all 13 domains.

## Technical Deep Dive

### DNA Structure

Each Quality DNA record follows a structured schema that captures both current state and historical context:

```elixir
defmodule Prismatic.Quality.DNA do
  @moduledoc """
  Quality DNA schema and operations for persistent quality tracking.
  Each umbrella application maintains its own DNA record, encoding
  quality state across 13 domains with full historical context.
  """

  @type domain_status :: :passing | :warning | :failing | :unknown

  @type domain_record :: %{
    domain: atom(),
    status: domain_status(),
    score: float(),
    violation_count: non_neg_integer(),
    last_checked: DateTime.t(),
    trend: :improving | :stable | :regressing
  }

  @type quality_dna :: %{
    app_name: atom(),
    overall_score: float(),
    domains: %{atom() => domain_record()},
    generation: non_neg_integer(),
    fitness: float(),
    last_updated: DateTime.t(),
    history: [snapshot()],
    evolution_metadata: evolution_metadata()
  }

  @type snapshot :: %{
    timestamp: DateTime.t(),
    overall_score: float(),
    domain_scores: %{atom() => float()},
    qdp_count: non_neg_integer()
  }

  @type evolution_metadata :: %{
    generation: non_neg_integer(),
    fitness_trajectory: [float()],
    cascade_campaigns: [cascade_record()],
    consciousness_traits: non_neg_integer()
  }

  @type cascade_record :: %{
    domain: atom(),
    items_eliminated: non_neg_integer(),
    timestamp: DateTime.t()
  }

  @spec load(atom()) :: {:ok, quality_dna()} | {:error, :not_found}
  def load(app_name) do
    path = dna_path(app_name)

    case File.read(path) do
      {:ok, content} ->
        {:ok, Jason.decode!(content, keys: :atoms)}

      {:error, :enoent} ->
        {:error, :not_found}
    end
  end

  @spec save(quality_dna()) :: :ok | {:error, term()}
  def save(dna) do
    path = dna_path(dna.app_name)
    content = Jason.encode!(dna, pretty: true)

    path |> Path.dirname() |> File.mkdir_p!()
    File.write(path, content)
  end

  @spec load_all() :: {:ok, %{atom() => quality_dna()}} | {:error, term()}
  def load_all do
    apps = Mix.Project.apps_paths() |> Map.keys()

    dna_map =
      apps
      |> Enum.reduce(%{}, fn app, acc ->
        case load(app) do
          {:ok, dna} -> Map.put(acc, app, dna)
          {:error, _} -> acc
        end
      end)

    {:ok, dna_map}
  end

  defp dna_path(app_name) do
    Path.join(["apps", to_string(app_name), ".claude", "quality-dna", "current-state.json"])
  end
end
```

### 13 Quality Domains

Quality DNA tracks the following domains, each representing an independent quality dimension that contributes to the overall quality score:

| Domain | What It Measures | Weight | Detection | Target |
|--------|-----------------|--------|-----------|--------|
| Dialyzer | Type correctness | High | `mix dialyzer` | 0 violations |
| Credo | Code style and patterns | Medium | `mix credo --strict` | 0 violations |
| Compilation | Warning-free builds | High | `--warnings-as-errors` | 0 warnings |
| DateTime Precision | Consistent time handling | Low | Custom analyzer | 0 violations |
| Guard Functions | Proper guard usage | Low | Custom analyzer | 0 violations |
| @impl Coverage | Behaviour implementation docs | Medium | Custom analyzer | 100% coverage |
| Memory Safety | Unbounded growth prevention | High | Custom analyzer | 0 violations |
| Performance | Response time compliance | High | Benchee + telemetry | <250ms page load |
| Regression Prevention | Bug fix test coverage | High | Test coverage analysis | 100% |
| Timing Patterns | Deterministic time handling | Medium | Custom analyzer | 0 violations |
| TODO Management | Stale TODO cleanup | Low | Custom scanner | 0 stale TODOs |
| Typespec Coverage | Public function specs | Medium | Custom analyzer | 100% public @spec |
| Unsafe Map Access | Safe map operations | Medium | Custom analyzer | 0 violations |

### Session Lifecycle Integration

Quality DNA integrates with the SessionLifecycle GenServer to ensure automatic loading and saving at session boundaries:

```elixir
defmodule Prismatic.Quality.DNASessionHook do
  @moduledoc """
  Session lifecycle hook for Quality DNA persistence.
  Loads DNA at session start, saves at session end.
  Integrates with PrismaticClaude.SessionLifecycle GenServer
  for automatic cross-session continuity.
  """

  @behaviour PrismaticClaude.SessionHooks.Behaviour

  @impl true
  @spec on_session_start(map()) :: {:ok, map()} | {:error, term()}
  def on_session_start(_context) do
    case Prismatic.Quality.DNA.load_all() do
      {:ok, dna_map} ->
        :telemetry.execute(
          [:prismatic, :quality_dna, :loaded],
          %{app_count: map_size(dna_map)},
          %{}
        )
        {:ok, %{quality_dna: dna_map}}

      {:error, reason} ->
        {:error, {:dna_load_failed, reason}}
    end
  end

  @impl true
  @spec on_session_end(map()) :: :ok
  def on_session_end(context) do
    dna_map = Map.get(context, :quality_dna, %{})

    Enum.each(dna_map, fn {_app, dna} ->
      Prismatic.Quality.DNA.save(dna)
    end)

    :telemetry.execute(
      [:prismatic, :quality_dna, :saved],
      %{app_count: map_size(dna_map)},
      %{}
    )

    :ok
  end
end
```

## Architecture and Implementation

### Trend Analysis Engine

Quality DNA's historical data enables sophisticated trend analysis that informs strategic quality decisions. The TrendAnalyzer examines historical snapshots to identify regression risks, improvement opportunities, and predicted future scores:

```elixir
defmodule Prismatic.Quality.TrendAnalyzer do
  @moduledoc """
  Analyzes Quality DNA history to identify trends, predict regressions,
  and recommend improvement priorities. Uses sliding window analysis
  and linear regression for score prediction.
  """

  @type trend_report :: %{
    overall_trajectory: :improving | :stable | :regressing,
    domain_trends: %{atom() => :improving | :stable | :regressing},
    regression_risk: [atom()],
    improvement_opportunities: [atom()],
    predicted_score: float()
  }

  @spec analyze(Prismatic.Quality.DNA.quality_dna()) :: trend_report()
  def analyze(dna) do
    history = dna.history || []

    %{
      overall_trajectory: calculate_trajectory(history),
      domain_trends: calculate_domain_trends(dna.domains, history),
      regression_risk: identify_regression_risks(dna.domains, history),
      improvement_opportunities: find_opportunities(dna.domains),
      predicted_score: predict_next_score(history)
    }
  end

  @spec calculate_trajectory([map()]) :: :improving | :stable | :regressing
  defp calculate_trajectory(history) when length(history) < 2, do: :stable

  defp calculate_trajectory(history) do
    [latest, previous | _] = Enum.take(history, 2)

    cond do
      latest.overall_score > previous.overall_score -> :improving
      latest.overall_score < previous.overall_score -> :regressing
      true -> :stable
    end
  end

  @spec identify_regression_risks(map(), [map()]) :: [atom()]
  defp identify_regression_risks(domains, history) do
    domains
    |> Enum.filter(fn {_domain, record} ->
      record.trend == :regressing or
        (record.status == :passing and recently_failed?(record, history))
    end)
    |> Enum.map(fn {domain, _} -> domain end)
  end

  @spec find_opportunities(map()) :: [atom()]
  defp find_opportunities(domains) do
    domains
    |> Enum.filter(fn {_domain, record} ->
      record.status != :passing and record.trend != :regressing
    end)
    |> Enum.map(fn {domain, _} -> domain end)
    |> Enum.sort()
  end

  @spec predict_next_score([map()]) :: float()
  defp predict_next_score([]), do: 0.0
  defp predict_next_score(history) do
    scores = Enum.map(history, & &1.overall_score)
    Enum.sum(scores) / length(scores)
  end

  defp recently_failed?(_record, _history), do: false
  defp calculate_domain_trends(domains, _history) do
    Map.new(domains, fn {domain, record} -> {domain, record.trend} end)
  end
end
```

### Per-Application DNA Records

Each of the 99 umbrella applications maintains its own Quality DNA record. This granularity enables application-specific quality management while the aggregate view provides platform-level insights:

```json
{
  "app_name": "prismatic_perimeter",
  "overall_score": 60.0,
  "domains": {
    "dialyzer": {"status": "passing", "score": 10.0, "violations": 0},
    "credo": {"status": "passing", "score": 10.0, "violations": 0},
    "compilation": {"status": "passing", "score": 10.0, "violations": 0},
    "typespec": {"status": "passing", "score": 10.0, "violations": 0},
    "coverage": {"status": "passing", "score": 10.0, "violations": 0},
    "quality_alias": {"status": "passing", "score": 10.0, "violations": 0}
  },
  "generation": 19,
  "fitness": 0.9995,
  "last_updated": "2026-02-22T14:30:00Z",
  "history": [
    {
      "timestamp": "2026-02-21T10:00:00Z",
      "overall_score": 60.0,
      "domain_scores": {"dialyzer": 10.0, "credo": 10.0},
      "qdp_count": 0
    }
  ]
}
```

### Evolution Integration

Quality DNA feeds into the [AutoEvolve](/glossary/autoevolve/) and [SEADF](/glossary/seadf/) systems for data-driven evolution, providing the empirical basis for prioritizing quality improvements:

```elixir
defmodule Prismatic.Quality.EvolutionAdvisor do
  @moduledoc """
  Uses Quality DNA data to recommend evolution priorities.
  Integrates with SEADF and AutoEvolve for automated improvement.
  Prioritizes domains with highest impact potential based on
  current status, trend data, and domain weight.
  """

  @spec recommend_priorities(map()) :: [{atom(), atom(), float()}]
  def recommend_priorities(dna_map) do
    dna_map
    |> Enum.flat_map(fn {app, dna} ->
      dna.domains
      |> Enum.filter(fn {_domain, record} -> record.status != :passing end)
      |> Enum.map(fn {domain, record} ->
        priority = calculate_priority(record)
        {app, domain, priority}
      end)
    end)
    |> Enum.sort_by(fn {_app, _domain, priority} -> priority end, :desc)
  end

  @spec calculate_priority(map()) :: float()
  defp calculate_priority(record) do
    base = case record.status do
      :failing -> 10.0
      :warning -> 5.0
      :unknown -> 3.0
      :passing -> 0.0
    end

    trend_modifier = case record.trend do
      :regressing -> 2.0
      :stable -> 1.0
      :improving -> 0.5
    end

    base * trend_modifier
  end
end
```

## CASCADE Elimination Campaigns

One of Quality DNA's most powerful features is tracking CASCADE elimination campaigns. A CASCADE pattern occurs when a single quality violation type propagates across multiple applications -- for example, 50 applications all having the same missing `@impl` annotation pattern. Quality DNA tracks these campaigns to ensure they complete across all affected applications:

```elixir
defmodule Prismatic.Quality.CascadeTracker do
  @moduledoc """
  Tracks CASCADE elimination campaigns across the platform.
  Records which patterns were identified, how many apps were affected,
  and the completion status of each campaign.
  """

  @type campaign :: %{
    id: String.t(),
    pattern: String.t(),
    domain: atom(),
    affected_apps: [atom()],
    fixed_apps: [atom()],
    started_at: DateTime.t(),
    completed_at: DateTime.t() | nil,
    status: :in_progress | :completed | :stalled
  }

  @spec start_campaign(String.t(), atom(), [atom()]) :: {:ok, campaign()}
  def start_campaign(pattern, domain, affected_apps) do
    campaign = %{
      id: generate_id(),
      pattern: pattern,
      domain: domain,
      affected_apps: affected_apps,
      fixed_apps: [],
      started_at: DateTime.utc_now(),
      completed_at: nil,
      status: :in_progress
    }

    persist_campaign(campaign)
    {:ok, campaign}
  end

  @spec record_fix(String.t(), atom()) :: {:ok, campaign()} | {:error, term()}
  def record_fix(campaign_id, app_name) do
    with {:ok, campaign} <- load_campaign(campaign_id) do
      updated = %{campaign |
        fixed_apps: [app_name | campaign.fixed_apps],
        status: if(length(campaign.fixed_apps) + 1 == length(campaign.affected_apps),
          do: :completed, else: :in_progress),
        completed_at: if(length(campaign.fixed_apps) + 1 == length(campaign.affected_apps),
          do: DateTime.utc_now(), else: nil)
      }

      persist_campaign(updated)
      {:ok, updated}
    end
  end

  defp generate_id, do: :crypto.strong_rand_bytes(8) |> Base.encode16()
  defp persist_campaign(_campaign), do: :ok
  defp load_campaign(_id), do: {:error, :not_found}
end
```

## Quality DNA Lifecycle

| Phase | Action | DNA Effect |
|-------|--------|-----------|
| Session Start | Load `.claude/quality-dna/current-state.json` | State restored from disk |
| Pre-Command | `mix quality.gates.check --fast` | Baseline verified against DNA |
| During Work | Quality violations detected/fixed | Domain scores updated in memory |
| Post-Command | `mix autoevolve.scan --quick` | Trends recalculated from new data |
| Session End | Save updated DNA state | State persisted to disk |
| Cross-Session | DNA loaded by next session | Continuity maintained |

## Usage in Prismatic Platform

### Commands and Workflows

```bash
# Check current Quality DNA state across all apps
mix autoevolve status --brief

# Full DNA analysis with trends and predictions
mix autoheal.baseline

# Quality enforcement with DNA recording
mix quality.enforce_standard --json

# Standardize mix.exs across all apps (updates DNA)
mix quality.standardize_mix --apply

# View per-app DNA state
cat apps/prismatic_perimeter/.claude/quality-dna/current-state.json | jq .
```

### Current Platform DNA Statistics

| Metric | Value |
|--------|-------|
| Apps with DNA records | 99/99 |
| Average quality score | 55.5/60 |
| Apps at perfect score (60/60) | 10 |
| Domains at 100% compliance | 7/8 |
| Quality generation | Gen 19 |
| Platform fitness | 0.9995 |
| CASCADE campaigns completed | 12 |
| Total QDP eliminated | 905 |

## Aggregate Platform DNA Analysis

Beyond per-application DNA, the platform maintains an aggregate DNA view that reveals systemic patterns invisible at the individual application level:

```elixir
defmodule Prismatic.Quality.AggregateDNA do
  @moduledoc """
  Computes aggregate quality metrics across all application DNA records.
  Reveals platform-wide patterns, systemic weaknesses, and cross-cutting
  improvement opportunities.
  """

  @spec compute_aggregate(map()) :: map()
  def compute_aggregate(dna_map) do
    apps = Map.values(dna_map)

    %{
      total_apps: length(apps),
      average_score: compute_average(apps, :overall_score),
      perfect_apps: Enum.count(apps, fn dna -> dna.overall_score == 60.0 end),
      domain_compliance: compute_domain_compliance(apps),
      weakest_domain: find_weakest_domain(apps),
      strongest_domain: find_strongest_domain(apps),
      generation: Enum.max_by(apps, & &1.generation).generation,
      fitness: compute_average(apps, :fitness)
    }
  end

  defp compute_average(apps, field) do
    total = Enum.sum(Enum.map(apps, &Map.get(&1, field, 0)))
    total / max(length(apps), 1)
  end

  defp compute_domain_compliance(apps) do
    all_domains = [:dialyzer, :credo, :compilation, :typespec, :coverage, :quality_alias]

    Map.new(all_domains, fn domain ->
      passing = Enum.count(apps, fn dna ->
        get_in(dna, [:domains, domain, :status]) == :passing
      end)
      {domain, passing / max(length(apps), 1) * 100}
    end)
  end

  defp find_weakest_domain(_apps), do: :quality_alias
  defp find_strongest_domain(_apps), do: :compilation
end
```

## Best Practices

1. **Always load DNA at session start**. The SessionLifecycle hook handles this automatically, but if running outside the standard session framework, manually load DNA before making quality decisions. Operating without DNA is operating blind.

2. **Record DNA after every significant quality change**. Do not wait for session end to persist DNA updates. Significant changes (CASCADE elimination, domain fixes, new app creation) should trigger immediate DNA persistence to prevent data loss from unexpected session termination.

3. **Use trend data for prioritization**. When multiple quality improvements are possible, use DNA trend analysis to prioritize domains that are regressing or at risk over those that are stable. A regressing domain with score 9/10 is more urgent than a stable domain with score 7/10.

4. **Maintain DNA for new applications**. When creating a new umbrella application, initialize its Quality DNA immediately. The `mix quality.enforce_standard` task handles this automatically. Applications without DNA records create blind spots.

5. **Review aggregate DNA periodically**. While per-app DNA is useful for tactical decisions, the aggregate platform DNA reveals systemic patterns that individual app analysis misses -- such as a domain trending downward across many applications simultaneously.

6. **Preserve historical snapshots**. DNA history enables trend analysis and prediction. Do not truncate history aggressively. Keep at least 30 snapshots for meaningful statistical analysis.

7. **Use DNA data in code reviews**. When reviewing changes to a quality-sensitive module, check its DNA record for recent trend data. A module in a regressing domain deserves extra scrutiny.

## Common Pitfalls

- **Stale DNA records**: If DNA is not updated regularly, trend analysis becomes unreliable. Ensure session hooks are functioning and DNA is persisted after every session. Stale DNA is worse than no DNA because it provides false confidence.

- **Ignoring regression indicators**: DNA trend data showing `:regressing` status for a domain is an early warning signal. Investigate before the domain reaches failure threshold. Regressions that are caught early cost minutes to fix; regressions that reach failure cost hours.

- **Over-relying on aggregate scores**: A platform average of 55.5/60 can mask individual applications scoring significantly below average. Always check per-app DNA alongside aggregates to identify outliers.

- **Not initializing DNA for new apps**: Applications without DNA records create blind spots in quality tracking. The universal quality standard enforcement handles this, but manual app creation may miss the initialization step.

- **Conflating score with quality**: A perfect DNA score means all automated checks pass, not that the code is inherently excellent. DNA measures compliance with quality domains, not architectural elegance or business logic correctness.

## Related Concepts

- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- Real-time monitoring consuming DNA data
- [Quality Gates](/glossary/quality-gates/) -- Enforcement pipeline producing DNA state updates
- [Quality Debt](/glossary/quality-debt/) -- Tracked and eliminated via DNA history
- [SEADF](/glossary/seadf/) -- Evolution framework using DNA for improvement decisions
- [AutoEvolve](/glossary/autoevolve/) -- Automated evolution driven by DNA insights
- [Mycelial Network](/glossary/mycelial-network/) -- Pattern propagation guided by DNA insights
- [Session Discipline](/glossary/session-discipline/) -- Session protocol ensuring DNA persistence
- [Dialyzer](/glossary/dialyzer/) -- Static analysis domain tracked by DNA
- [Credo](/glossary/credo/) -- Code style domain tracked by DNA

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Application directory with per-app DNA

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
