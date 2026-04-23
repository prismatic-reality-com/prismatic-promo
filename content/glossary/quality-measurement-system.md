+++
title = "Quality Measurement System"
weight = 50
[extra]
tags = ["glossary", "architecture", "quality", "measurement", "metrics", "scoring", "domains", "telemetry", "monitoring", "quantification"]
description = "A Quality Measurement System is the infrastructure for quantifying software quality across multiple independent domains, producing numeric scores, trend analysis, and actionable reports that transform subjective quality perception into objective, comparable measurements"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["quality-gate", "quality-dna", "quality-floor-guardian", "telemetry", "metrics", "fitness-score", "observability", "quality-and-transparency", "quality-standard", "quality-monitoring"]
keywords = ["quality measurement", "quality metrics", "quality scoring", "quality quantification", "quality domains", "quality assessment", "quality dashboard", "quality reporting", "quality tracking", "quality analytics"]
testing_scenarios = ["verify score computation produces correct values across all domains", "validate domain weights sum to expected total", "test score persistence across sessions via Quality DNA", "confirm real-time score updates via telemetry", "ensure degradation detection triggers appropriate alerts"]
prerequisites = ["quality-gate", "telemetry", "metrics"]
learning_path = ["metrics", "quality-gate", "quality-measurement-system", "quality-dna", "quality-floor-guardian"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
word_count = 1684
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Quality Measurement System - Prismatic Platform"
+++

## Definition

A Quality Measurement System (QMS) is the infrastructure responsible for quantifying software quality across multiple independent domains, producing numeric scores that transform subjective quality perception into objective, comparable measurements. Unlike individual quality checks (which produce binary pass/fail verdicts), a QMS aggregates results from many checks into composite scores that represent the overall quality posture of a system, module, or application.

In the Prismatic Platform, the QMS operates across 13 quality domains, produces scores from 0 to 100 per domain and per application, maintains historical trends through Quality DNA, and triggers automated responses when scores cross defined thresholds. The system currently reports a PERFECT score of 100/100 across all domains with 0 violations, a state achieved through systematic quality debt elimination and the NO MERCY enforcement doctrine.

The QMS serves three primary stakeholders: developers (who need real-time feedback on their code's quality), team leads (who need trend visibility across the codebase), and the autonomous evolution system (which needs numeric inputs for its quality optimization algorithms).

## Overview

Quality measurement in software engineering has historically been imprecise. Code reviews produce subjective assessments. Bug counts reflect past failures rather than current quality. Test coverage percentages measure quantity of testing, not quality of testing. These traditional metrics provide some insight but fail to deliver the comprehensive, objective quality portrait that complex systems require.

A Quality Measurement System addresses these limitations by defining quality as a multi-dimensional property measured across independent domains. Instead of asking "is this code good?" (a subjective question), it asks "does this code have zero compilation warnings, zero type errors, zero Credo violations, full typespec coverage, and no unsafe map access patterns?" (an objective question with measurable answers). The composite answer across all dimensions produces a quality score that is meaningful, reproducible, and comparable.

The key design principles of an effective QMS are:

**Domain Independence**: Each quality domain measures a different aspect of quality. Compilation correctness is independent of code style, which is independent of type safety, which is independent of test coverage. This independence ensures that a high score in one domain cannot mask a low score in another.

**Weighted Scoring**: Not all quality domains are equally important. A compilation error (the code does not build) is more critical than a style violation (the code builds but has inconsistent formatting). The QMS assigns weights to domains that reflect their relative importance.

**Temporal Tracking**: Quality is not a snapshot but a trajectory. A score of 95 that was 100 yesterday indicates degradation; a score of 95 that was 80 last month indicates improvement. The QMS tracks quality over time through Quality DNA persistence.

**Threshold-Based Actions**: Quality scores trigger automated actions at defined thresholds. The Quality Floor Guardian monitors scores and escalates through four levels: OPTIMAL (100-99%), WARNING (98-99%), CRITICAL (95-98%), and EMERGENCY (below 95%).

**Granular and Aggregate Views**: The QMS produces scores at multiple granularity levels: per-check, per-domain, per-application, and platform-wide. This enables both detailed investigation and executive-level overview.

## Technical Details

### Multi-Domain Quality Scorer

```elixir
defmodule Prismatic.Quality.Scorer do
  @moduledoc """
  Computes quality scores across all domains for a given
  application or the entire platform. Scores are computed
  per-domain and aggregated into an overall score using
  configurable domain weights.
  """

  @type domain_score :: %{
          domain: atom(),
          score: non_neg_integer(),
          violations: non_neg_integer(),
          checks_run: non_neg_integer(),
          weight: float(),
          weighted_score: float()
        }

  @type quality_portrait :: %{
          application: atom() | :platform,
          overall_score: non_neg_integer(),
          domains: [domain_score()],
          timestamp: DateTime.t(),
          status: :perfect | :optimal | :warning | :critical | :emergency
        }

  @domain_weights %{
    dialyzer: 1.0,
    credo: 0.8,
    compilation: 1.0,
    datetime_precision: 0.6,
    guard_functions: 0.5,
    impl_coverage: 0.7,
    memory_safety: 0.9,
    performance: 0.8,
    regression_prevention: 0.9,
    timing_patterns: 0.6,
    todo_management: 0.4,
    typespec_coverage: 0.7,
    unsafe_map_access: 0.8
  }

  @spec compute(atom()) :: {:ok, quality_portrait()}
  def compute(application \\ :platform) do
    domain_scores =
      @domain_weights
      |> Enum.map(fn {domain, weight} ->
        {violations, checks} = evaluate_domain(domain, application)
        score = compute_domain_score(violations, checks)

        %{
          domain: domain,
          score: score,
          violations: violations,
          checks_run: checks,
          weight: weight,
          weighted_score: score * weight
        }
      end)

    total_weight = domain_scores |> Enum.map(& &1.weight) |> Enum.sum()
    total_weighted = domain_scores |> Enum.map(& &1.weighted_score) |> Enum.sum()
    overall = if total_weight > 0, do: round(total_weighted / total_weight), else: 0

    portrait = %{
      application: application,
      overall_score: overall,
      domains: domain_scores,
      timestamp: DateTime.utc_now(),
      status: classify_status(overall)
    }

    :telemetry.execute(
      [:prismatic, :quality, :score, :computed],
      %{overall_score: overall, domain_count: length(domain_scores)},
      %{application: application, portrait: portrait}
    )

    {:ok, portrait}
  end

  @spec compute_domain_score(non_neg_integer(), non_neg_integer()) :: non_neg_integer()
  defp compute_domain_score(0, _checks), do: 100
  defp compute_domain_score(_violations, 0), do: 0
  defp compute_domain_score(violations, checks) do
    max(0, round((1 - violations / max(checks, 1)) * 100))
  end

  defp evaluate_domain(domain, application) do
    case Prismatic.Quality.DomainRegistry.get_evaluator(domain) do
      {:ok, evaluator} -> evaluator.count_violations(application)
      {:error, _} -> {0, 0}
    end
  end

  defp classify_status(score) when score == 100, do: :perfect
  defp classify_status(score) when score >= 99, do: :optimal
  defp classify_status(score) when score >= 98, do: :warning
  defp classify_status(score) when score >= 95, do: :critical
  defp classify_status(_score), do: :emergency
end
```

### Quality Trend Analyzer

```elixir
defmodule Prismatic.Quality.TrendAnalyzer do
  @moduledoc """
  Analyzes quality score trends over time using Quality DNA
  snapshots. Detects improvement, degradation, plateau, and
  oscillation patterns across domains.
  """

  @type trend :: :improving | :degrading | :stable | :oscillating
  @type trend_analysis :: %{
          domain: atom(),
          trend: trend(),
          current_score: non_neg_integer(),
          previous_score: non_neg_integer(),
          change_rate: float(),
          data_points: non_neg_integer(),
          confidence: float()
        }

  @spec analyze(atom(), keyword()) :: {:ok, [trend_analysis()]}
  def analyze(application, opts \\ []) do
    window = Keyword.get(opts, :window_days, 30)
    snapshots = load_snapshots(application, window)

    analyses =
      snapshots
      |> Enum.group_by(& &1.domain)
      |> Enum.map(fn {domain, domain_snapshots} ->
        sorted = Enum.sort_by(domain_snapshots, & &1.timestamp)
        analyze_domain_trend(domain, sorted)
      end)

    {:ok, analyses}
  end

  @spec detect_degradation(atom()) :: {:ok, [trend_analysis()]}
  def detect_degradation(application) do
    {:ok, analyses} = analyze(application)
    degrading = Enum.filter(analyses, &(&1.trend == :degrading))
    {:ok, degrading}
  end

  defp analyze_domain_trend(domain, snapshots) when length(snapshots) < 2 do
    current = List.last(snapshots)
    %{
      domain: domain,
      trend: :stable,
      current_score: current.score,
      previous_score: current.score,
      change_rate: 0.0,
      data_points: length(snapshots),
      confidence: 0.3
    }
  end

  defp analyze_domain_trend(domain, snapshots) do
    scores = Enum.map(snapshots, & &1.score)
    current = List.last(scores)
    previous = Enum.at(scores, -2)
    deltas = compute_deltas(scores)
    avg_delta = if length(deltas) > 0, do: Enum.sum(deltas) / length(deltas), else: 0.0

    trend =
      cond do
        avg_delta > 0.5 -> :improving
        avg_delta < -0.5 -> :degrading
        has_oscillation?(deltas) -> :oscillating
        true -> :stable
      end

    %{
      domain: domain,
      trend: trend,
      current_score: current,
      previous_score: previous,
      change_rate: avg_delta,
      data_points: length(snapshots),
      confidence: min(1.0, length(snapshots) / 10)
    }
  end

  defp compute_deltas(scores) do
    scores
    |> Enum.chunk_every(2, 1, :discard)
    |> Enum.map(fn [a, b] -> b - a end)
  end

  defp has_oscillation?(deltas) do
    sign_changes =
      deltas
      |> Enum.chunk_every(2, 1, :discard)
      |> Enum.count(fn [a, b] -> a * b < 0 end)

    sign_changes >= length(deltas) * 0.4
  end

  defp load_snapshots(application, window_days) do
    cutoff = DateTime.add(DateTime.utc_now(), -window_days * 86_400, :second)

    application
    |> Prismatic.Quality.DNA.load_history()
    |> Enum.filter(&(DateTime.compare(&1.timestamp, cutoff) == :gt))
  end
end
```

### Quality Report Generator

```elixir
defmodule Prismatic.Quality.Reporter do
  @moduledoc """
  Generates human-readable and machine-readable quality reports
  from quality portraits. Supports multiple output formats
  including terminal, JSON, and HTML.
  """

  alias Prismatic.Quality.Scorer

  @spec generate(atom(), keyword()) :: {:ok, String.t()}
  def generate(application \\ :platform, opts \\ []) do
    format = Keyword.get(opts, :format, :terminal)
    {:ok, portrait} = Scorer.compute(application)

    report =
      case format do
        :terminal -> format_terminal(portrait)
        :json -> format_json(portrait)
        :markdown -> format_markdown(portrait)
      end

    {:ok, report}
  end

  defp format_terminal(portrait) do
    header = """
    Quality Report: #{portrait.application}
    Overall Score: #{portrait.overall_score}/100 [#{portrait.status}]
    Timestamp: #{portrait.timestamp}
    ===================================================
    """

    domains =
      portrait.domains
      |> Enum.sort_by(& &1.domain)
      |> Enum.map(fn d ->
        status_icon = if d.score == 100, do: "PASS", else: "FAIL"
        "  #{status_icon} #{d.domain}: #{d.score}/100 (#{d.violations} violations)"
      end)
      |> Enum.join("\n")

    header <> "\n" <> domains
  end

  defp format_json(portrait) do
    portrait
    |> Map.update!(:timestamp, &DateTime.to_iso8601/1)
    |> Map.update!(:status, &Atom.to_string/1)
    |> Map.update!(:application, &Atom.to_string/1)
    |> Map.update!(:domains, fn domains ->
      Enum.map(domains, fn d ->
        Map.update!(d, :domain, &Atom.to_string/1)
      end)
    end)
    |> Jason.encode!(pretty: true)
  end

  defp format_markdown(portrait) do
    header = """
    # Quality Report: #{portrait.application}

    **Overall Score**: #{portrait.overall_score}/100
    **Status**: #{portrait.status}
    **Timestamp**: #{portrait.timestamp}

    ## Domain Scores

    | Domain | Score | Violations | Weight |
    |--------|-------|------------|--------|
    """

    rows =
      portrait.domains
      |> Enum.sort_by(& &1.domain)
      |> Enum.map(fn d ->
        "| #{d.domain} | #{d.score}/100 | #{d.violations} | #{d.weight} |"
      end)
      |> Enum.join("\n")

    header <> rows
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform's Quality Measurement System is implemented through several interconnected components that together provide comprehensive quality quantification.

### 13 Quality Domains

The QMS measures quality across 13 independent domains. Each domain has its own evaluation logic, scoring algorithm, and threshold configuration. The domains are designed to be orthogonal: improving one domain's score does not automatically improve another's, and degrading one domain does not mask problems in others.

The current state across all 13 domains is 0 violations, producing the PERFECT 100/100 score. This state was achieved through systematic elimination of 905 Quality Debt Points (QDP) across the platform's 115 umbrella applications.

### Quality DNA Persistence

Quality DNA files (`.claude/quality-dna/current-state.json` in each application) serve as the persistence layer for the QMS. After every quality measurement, the results are written to DNA files, creating a historical record that enables trend analysis. Each DNA file contains the latest scores across all domains, the timestamp of the measurement, and metadata about the measurement context.

### Quality Floor Guardian Integration

The Quality Floor Guardian continuously monitors QMS scores and triggers automated responses at defined thresholds:

- **100-99% (OPTIMAL)**: Monitor only, no intervention
- **98-99% (WARNING)**: Alert, investigation trigger, evolution scan
- **95-98% (CRITICAL)**: Auto-evolution trigger, commit review escalation
- **Below 95% (EMERGENCY)**: Block all commits, supreme authority escalation

### Mix Task Interface

The QMS is accessible through several mix tasks:

```bash
# Full quality measurement
mix quality.gates

# Machine-readable output
mix quality.gates --format json

# Count violations only
mix quality.forbidden_patterns --count-only

# Quick check (subset of domains)
mix quality.gates.check --fast

# Domain-specific measurement
mix quality.gates --domain dialyzer
```

### Telemetry Events

The QMS emits telemetry events for every measurement, enabling real-time dashboard updates and external monitoring integration:

- `[:prismatic, :quality, :score, :computed]` -- Overall score computed
- `[:prismatic, :quality, :gate, :stop]` -- Individual gate result
- `[:prismatic, :quality, :portrait, :updated]` -- Quality portrait refreshed
- `[:prismatic, :quality, :threshold, :crossed]` -- Score crossed a threshold boundary

## Comparison with Alternative Approaches

| Aspect | Prismatic QMS | SonarQube | CodeClimate | Custom Metrics |
|---|---|---|---|---|
| **Domains** | 13 independent, Elixir-specific | Language-generic profiles | Maintainability focus | Varies |
| **Scoring model** | Weighted per-domain, 0-100 | A-E rating per quality gate | GPA-style grades | Custom |
| **Persistence** | Quality DNA (JSON per app) | Database | API + database | Varies |
| **Real-time updates** | OTP telemetry | Webhook-based | Webhook-based | Manual |
| **Trend analysis** | Built-in (TrendAnalyzer) | Historical dashboard | Built-in | Manual |
| **Automated response** | Quality Floor Guardian | Quality gate blocking | PR status checks | Manual |
| **Customization** | Full (Elixir behaviours) | Rules + profiles | Config files | Full |
| **Local execution** | Yes (pre-commit) | No (server-side) | No (API-based) | Varies |

The Prismatic QMS differs from commercial tools in its deep integration with the Elixir ecosystem. Rather than applying generic quality rules, it measures Elixir-specific properties (OTP behaviours, typespec coverage, guard function usage) that generic tools cannot assess.

## Best Practices

**1. Define domains based on real failure modes.** Quality domains should correspond to categories of real problems that have occurred or could occur in production. The Prismatic QMS's 13 domains were each created in response to actual quality failures or near-misses, not theoretical concerns.

**2. Use weighted scoring to reflect impact.** Not all quality dimensions are equally important. A type error (Dialyzer) is more likely to cause a production incident than a style violation (Credo). Weights should reflect the relative production impact of violations in each domain.

**3. Track trends, not just snapshots.** A quality score of 95 is meaningful only in context. The QMS must maintain historical data to distinguish between improvement trajectories and degradation trajectories. Quality DNA provides this historical context in the Prismatic Platform.

**4. Automate threshold responses.** Quality measurement without automated response is observability without control. The Quality Floor Guardian demonstrates that quality scores should trigger automated actions (alerts, commit blocks, evolution scans) at defined thresholds.

**5. Provide multiple output formats.** Different stakeholders need quality data in different formats. Developers need terminal output. CI/CD needs JSON. Executives need dashboards. The QMS should support all these formats through a single measurement infrastructure.

**6. Measure measurement quality.** The QMS itself should be subject to quality standards. If the measurement infrastructure has bugs, the scores it produces are unreliable. Regular validation of the QMS against known baselines ensures measurement accuracy.

## Common Pitfalls

**Goodhart's Law.** "When a measure becomes a target, it ceases to be a good measure." If developers optimize for quality scores rather than actual quality, the scores become meaningless. The Prismatic QMS mitigates this through domain independence (gaming one domain does not help others) and multiple evidence sources per domain.

**Metric overload.** Measuring too many things creates information overload that undermines the QMS's purpose. The 13 domains in the Prismatic QMS represent a carefully curated set that covers the most important quality dimensions without overwhelming developers with data.

**Score inflation.** Quality scores that only go up create false confidence. A QMS that cannot detect degradation is worse than no QMS at all. The trend analyzer specifically watches for degradation patterns and triggers alerts when detected.

**Ignoring qualitative factors.** Not all quality dimensions are easily quantifiable. Code readability, architectural clarity, and documentation quality are important but hard to score numerically. A QMS should acknowledge its blind spots rather than claiming completeness.

**Static domain definitions.** Quality domains that never change become progressively less relevant as the codebase evolves. The Prismatic QMS evolves through quality innovation, adding new domains as new classes of quality problems are identified.

## Use Cases

### Platform Health Dashboard

The QMS provides the data layer for platform health dashboards. By querying quality portraits across all applications, dashboards can display real-time quality state, highlight degrading applications, and provide drill-down views from platform-wide to individual check level.

### Release Readiness Assessment

Before releasing a new version, the QMS provides an objective assessment of release quality. A release with a perfect 100/100 score across all domains provides quantitative evidence that the release meets quality standards. A release with degraded scores provides equally quantitative evidence of risk.

### Developer Performance Metrics

While controversial, quality scores can inform developer performance discussions when used carefully. A developer who consistently produces code that passes all quality gates demonstrates technical discipline. The emphasis should be on trends and learning, not punishment.

### Quality Budget Allocation

The QMS helps organizations allocate engineering effort to quality work. Domains with consistently lower scores indicate areas that need more attention. The trend analyzer identifies which domains are improving (and thus need less investment) versus degrading (and thus need more).

### Cross-Application Comparison

In a large umbrella application like the Prismatic Platform (115 apps), the QMS enables comparison across applications. Applications with lower quality scores can be prioritized for quality improvement, and applications with consistently high scores can be studied for best practices.

## Related Concepts

The Quality Measurement System integrates with the platform's quality, monitoring, and evolution infrastructure:

- [Quality Gate](@/glossary/quality-gate.md) -- The individual checkpoints that feed data into the QMS
- [Quality DNA](@/glossary/quality-dna.md) -- The persistence layer that stores QMS scores across sessions
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- The autonomous monitor that acts on QMS scores
- [Telemetry](@/glossary/telemetry.md) -- The event infrastructure that distributes QMS data in real time
- [Metrics](@/glossary/metrics.md) -- The broader concept of quantitative measurement that the QMS specializes for quality
- [Observability](@/glossary/observability.md) -- The system property that enables external quality measurement
- [Quality and Transparency](@/glossary/quality-and-transparency.md) -- The principle that QMS data must be openly accessible
- [Quality Standard](@/glossary/quality-standard.md) -- The codified criteria that the QMS evaluates against
- [Quality Monitoring](@/glossary/quality-monitoring.md) -- The continuous observation of QMS outputs
- [Fitness Score](@/glossary/fitness-score.md) -- The platform-level health metric that incorporates QMS data

## See Also

- [Quality Evidence Truth](@/glossary/quality-evidence-truth.md) -- The epistemic framework for interpreting QMS results
- [Quality Innovation](@/glossary/quality-innovation.md) -- The process of creating new QMS domains and measurement techniques
- [Dialyzer](@/glossary/dialyzer.md) -- The tool behind one of the most important QMS domains
- [Credo](@/glossary/credo.md) -- The tool behind the code style QMS domain
- [Quality Debt](@/glossary/quality-debt.md) -- The accumulated violations that the QMS quantifies

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis)
