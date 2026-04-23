+++
title = "Systematic Self-Analysis"
weight = 50
[extra]
tags = ["glossary", "architecture", "quality", "evolution", "introspection", "self-improvement", "autoevolve", "analysis", "autonomous-systems"]
description = "Systematic self-analysis is the disciplined practice of automated and structured introspection applied to software systems, enabling platforms to continuously evaluate their own quality, architecture, performance, and evolutionary fitness through measurable, repeatable assessment methodologies"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
related_terms = ["autoevolve", "autoheal", "quality-dna", "quality-floor-guardian", "introspection", "autonomous-evolution", "continuous-validation", "quality-gates", "static-analysis", "telemetry", "metrics", "quality-measurement-system", "quality-monitoring"]
learning_outcomes = ["Understand the principles of systematic self-analysis in software platforms", "Implement automated introspection using Elixir/OTP patterns", "Design multi-dimensional quality assessment frameworks", "Apply self-analysis to drive autonomous evolution cycles", "Build telemetry-driven feedback loops for continuous improvement"]
prerequisites = ["autoevolve", "quality-gates", "telemetry", "genserver", "otp"]
see_also = ["autonomous-quality", "quality-standard", "quality-debt", "continuous-evolution", "measure-continuously"]
acronyms = ["SSA = Systematic Self-Analysis", "QDP = Quality Debt Point", "QFG = Quality Floor Guardian"]
platforms = ["Prismatic Platform", "BEAM/OTP", "Elixir Ecosystem"]
use_cases = ["Platform quality monitoring", "Autonomous evolution triggering", "Regression detection", "Architecture health assessment", "Technical debt quantification"]
key_metrics = ["Quality score (0-100)", "QDP count", "Domain compliance (13/13)", "Evolution fitness (0.0-1.0)", "Warning count"]
word_count = 1760
date_modified = "2026-02-23"
keywords = ["Systematic", "Self-Analysis", "glossary", "architecture", "Prismatic Platform", "BEAM"]
image = "/images/sections/glossary.png"
image_alt = "Systematic Self-Analysis - Prismatic Platform"
+++

## Definition

Systematic self-analysis is a disciplined engineering practice in which a software platform applies structured, automated introspection to evaluate its own quality, architecture, performance, and evolutionary fitness. Unlike ad-hoc debugging or manual code review, systematic self-analysis operates continuously through formalized assessment pipelines that produce quantifiable metrics, actionable diagnostics, and autonomous improvement recommendations. Within the Prismatic Platform, this concept is elevated from a development best practice to a core architectural principle, implemented through dedicated OTP processes, quality gates, and evolution agents that collectively ensure the platform maintains awareness of its own state at all times.

The practice draws from control theory, where feedback loops enable systems to self-correct, and from the broader field of reflective software architecture, where systems maintain explicit models of their own structure and behavior. In the Prismatic Platform context, systematic self-analysis encompasses thirteen distinct quality domains, each with its own measurement methodology, threshold definitions, and enforcement mechanisms.

## Historical Context and Motivation

The need for systematic self-analysis emerged from a fundamental observation in large-scale software development: as systems grow beyond a certain complexity threshold, human review alone becomes insufficient to maintain quality. The Prismatic Platform, with its 115 umbrella applications and approximately 2.8 million lines of code, reached this threshold early in its evolution. Manual quality assurance methods that worked for 10 applications became untenable at 50, and entirely impossible at 100+.

Traditional approaches to software quality rely on external tooling applied after the fact -- linters run in CI, test suites executed before merge, code review conducted by humans. These approaches share a common limitation: they are reactive rather than proactive, and they operate on snapshots rather than continuous streams. Systematic self-analysis inverts this model by embedding quality awareness directly into the platform's runtime, making introspection a first-class architectural concern rather than an afterthought.

The evolution from Generation 1 to Generation 19 of the Prismatic Platform traces the progressive deepening of this self-analytical capability, from simple compilation checks to the current 13-layer [quality gate](/glossary/quality-gates/) system with autonomous healing and evolution.

## Core Principles

### Continuous Measurement

Self-analysis must operate continuously, not periodically. The Prismatic Platform achieves this through [telemetry](/glossary/telemetry/) events emitted at every significant operation boundary, processed by dedicated monitoring processes that maintain rolling windows of quality metrics. This continuous measurement ensures that quality degradation is detected within seconds of introduction, not hours or days later.

### Multi-Dimensional Assessment

A single quality metric is inherently insufficient. The platform evaluates quality across thirteen distinct domains simultaneously: Dialyzer compliance, Credo analysis, compilation warnings, DateTime precision, guard functions, `@impl` coverage, memory safety, performance patterns, regression prevention, timing patterns, TODO management, typespec coverage, and unsafe map access. Each domain contributes independently to the overall quality score, and a failure in any single domain blocks progression.

### Automated Remediation

Measurement without action is observation, not analysis. True systematic self-analysis includes automated remediation pathways. When the platform detects a quality degradation, the [AutoHeal](/glossary/autoheal/) system engages to diagnose the root cause, propose fixes, and in many cases apply corrections autonomously. This closes the feedback loop from detection to resolution without human intervention.

### Evolutionary Fitness Tracking

Beyond immediate quality metrics, systematic self-analysis tracks evolutionary fitness -- a composite measure of how well the platform adapts to changing requirements over time. The current fitness score of 0.9995 represents near-optimal adaptability, achieved through 19 generations of progressive refinement guided by self-analytical feedback.

## Architecture of Self-Analysis in Prismatic

The self-analysis architecture follows a layered design that mirrors the platform's supervision tree structure:

```
Layer 4: Strategic Analysis (AutoEvolve, Generation Planning)
    |
Layer 3: Quality Synthesis (Quality Floor Guardian, Quality DNA)
    |
Layer 2: Domain Analysis (13 Quality Domains, Static Analysis)
    |
Layer 1: Data Collection (Telemetry, Compilation, Test Results)
    |
Layer 0: Runtime Introspection (BEAM VM, Module Info, Process State)
```

Each layer builds upon the one below it, transforming raw data into progressively higher-level insights. Layer 0 provides the raw introspection capabilities inherent in the BEAM virtual machine. Layer 1 collects and structures this data. Layer 2 applies domain-specific analysis rules. Layer 3 synthesizes cross-domain quality assessments. Layer 4 makes strategic decisions about the platform's evolutionary direction.

## Implementation Patterns in Elixir/OTP

### The Self-Analysis GenServer

At the heart of systematic self-analysis lies a dedicated [GenServer](/glossary/genserver/) process that orchestrates assessment cycles. This process maintains the current quality state, schedules periodic assessments, and coordinates with domain-specific analyzers.

```elixir
defmodule Prismatic.SelfAnalysis.Coordinator do
  @moduledoc """
  Coordinates systematic self-analysis across all quality domains.

  This GenServer maintains the platform's self-assessment state and
  orchestrates periodic analysis cycles. It collects results from
  13 domain-specific analyzers and synthesizes them into a unified
  quality score.

  ## Architecture

  The coordinator follows a hub-and-spoke pattern where each quality
  domain has its own analyzer process. The coordinator polls these
  analyzers on a configurable schedule and aggregates results into
  the platform's Quality DNA state.

  ## Quality Domains

  - Dialyzer compliance (type safety)
  - Credo analysis (code consistency)
  - Compilation warnings (zero tolerance)
  - DateTime precision (microsecond enforcement)
  - Guard functions (proper guard usage)
  - @impl coverage (callback documentation)
  - Memory safety (resource leak prevention)
  - Performance patterns (anti-pattern detection)
  - Regression prevention (test coverage for fixes)
  - Timing patterns (Process.sleep detection)
  - TODO management (tracked elimination)
  - Typespec coverage (function specification)
  - Unsafe map access (Map.fetch! prevention)
  """

  use GenServer

  alias Prismatic.SelfAnalysis.{DomainAnalyzer, QualityState, Report}

  @type quality_domain :: :dialyzer | :credo | :compilation | :datetime_precision
    | :guard_functions | :impl_coverage | :memory_safety | :performance
    | :regression_prevention | :timing_patterns | :todo_management
    | :typespec_coverage | :unsafe_map_access

  @type analysis_result :: %{
    domain: quality_domain(),
    score: non_neg_integer(),
    violations: [violation()],
    timestamp: DateTime.t()
  }

  @type violation :: %{
    file: String.t(),
    line: non_neg_integer(),
    message: String.t(),
    severity: :warning | :error | :critical
  }

  @analysis_interval :timer.minutes(5)
  @quality_domains ~w(
    dialyzer credo compilation datetime_precision guard_functions
    impl_coverage memory_safety performance regression_prevention
    timing_patterns todo_management typespec_coverage unsafe_map_access
  )a

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec current_quality() :: {:ok, QualityState.t()} | {:error, term()}
  def current_quality do
    GenServer.call(__MODULE__, :current_quality)
  end

  @spec run_analysis() :: {:ok, Report.t()} | {:error, term()}
  def run_analysis do
    GenServer.call(__MODULE__, :run_analysis, :timer.minutes(2))
  end

  @spec domain_score(quality_domain()) :: {:ok, non_neg_integer()} | {:error, :unknown_domain}
  def domain_score(domain) when domain in @quality_domains do
    GenServer.call(__MODULE__, {:domain_score, domain})
  end

  def domain_score(_domain), do: {:error, :unknown_domain}

  @impl GenServer
  def init(opts) do
    interval = Keyword.get(opts, :interval, @analysis_interval)
    schedule_analysis(interval)

    {:ok, %{
      quality_state: QualityState.new(),
      last_analysis: nil,
      interval: interval,
      domain_results: %{}
    }}
  end

  @impl GenServer
  def handle_call(:current_quality, _from, state) do
    {:reply, {:ok, state.quality_state}, state}
  end

  @impl GenServer
  def handle_call(:run_analysis, _from, state) do
    case execute_full_analysis(state) do
      {:ok, report, new_state} ->
        emit_telemetry(report)
        {:reply, {:ok, report}, new_state}

      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  @impl GenServer
  def handle_call({:domain_score, domain}, _from, state) do
    score = Map.get(state.domain_results, domain, %{score: 0})
    {:reply, {:ok, score.score}, state}
  end

  @impl GenServer
  def handle_info(:scheduled_analysis, state) do
    case execute_full_analysis(state) do
      {:ok, report, new_state} ->
        emit_telemetry(report)
        schedule_analysis(state.interval)
        {:noreply, new_state}

      {:error, _reason} ->
        schedule_analysis(state.interval)
        {:noreply, state}
    end
  end

  defp execute_full_analysis(state) do
    results =
      @quality_domains
      |> Task.async_stream(&DomainAnalyzer.analyze/1, timeout: :timer.seconds(30))
      |> Enum.reduce(%{}, fn
        {:ok, {:ok, result}}, acc -> Map.put(acc, result.domain, result)
        _, acc -> acc
      end)

    quality_state = QualityState.from_domain_results(results)
    report = Report.generate(quality_state, results)

    {:ok, report, %{state |
      quality_state: quality_state,
      last_analysis: DateTime.utc_now(),
      domain_results: results
    }}
  end

  defp schedule_analysis(interval) do
    Process.send_after(self(), :scheduled_analysis, interval)
  end

  defp emit_telemetry(report) do
    :telemetry.execute(
      [:prismatic, :self_analysis, :complete],
      %{score: report.overall_score, duration_ms: report.duration_ms},
      %{domains_checked: report.domains_checked, violations: report.total_violations}
    )
  end
end
```

### Domain-Specific Analyzers

Each quality domain has a dedicated analyzer module that implements a common behaviour. This separation of concerns ensures that adding new quality domains requires no changes to the coordination logic.

```elixir
defmodule Prismatic.SelfAnalysis.DomainAnalyzer do
  @moduledoc """
  Behaviour and dispatcher for domain-specific quality analyzers.

  Each quality domain implements the `Prismatic.SelfAnalysis.Analyzer`
  behaviour, providing domain-specific analysis logic while conforming
  to a unified interface for result reporting.
  """

  @callback analyze(keyword()) :: {:ok, map()} | {:error, term()}
  @callback domain_name() :: atom()
  @callback max_score() :: non_neg_integer()

  @spec analyze(atom()) :: {:ok, map()} | {:error, term()}
  def analyze(domain) do
    module = analyzer_module(domain)
    module.analyze([])
  end

  defp analyzer_module(:dialyzer), do: Prismatic.SelfAnalysis.Analyzers.Dialyzer
  defp analyzer_module(:credo), do: Prismatic.SelfAnalysis.Analyzers.Credo
  defp analyzer_module(:compilation), do: Prismatic.SelfAnalysis.Analyzers.Compilation
  defp analyzer_module(:typespec_coverage), do: Prismatic.SelfAnalysis.Analyzers.TypespecCoverage
  defp analyzer_module(domain), do: Prismatic.SelfAnalysis.Analyzers.Generic.for(domain)
end
```

### Quality DNA Persistence

Analysis results are not ephemeral -- they are persisted as [Quality DNA](/glossary/quality-dna/), providing cross-session continuity and historical trend analysis. This persistence enables the platform to track quality trajectories over time and detect slow degradation patterns that would be invisible in point-in-time assessments.

```elixir
defmodule Prismatic.SelfAnalysis.QualityDNA do
  @moduledoc """
  Persists quality analysis results as Quality DNA state files.

  Quality DNA provides cross-session continuity for self-analysis
  results, enabling historical trend analysis and regression detection
  across platform evolution generations.
  """

  @spec persist(map()) :: :ok | {:error, term()}
  def persist(quality_state) do
    path = quality_dna_path()
    content = Jason.encode!(quality_state, pretty: true)
    File.write(path, content)
  end

  @spec load() :: {:ok, map()} | {:error, :not_found}
  def load do
    case File.read(quality_dna_path()) do
      {:ok, content} -> {:ok, Jason.decode!(content)}
      {:error, :enoent} -> {:error, :not_found}
    end
  end

  @spec trend(non_neg_integer()) :: {:ok, [map()]} | {:error, term()}
  def trend(generations \\ 5) do
    history_path()
    |> File.ls!()
    |> Enum.sort(:desc)
    |> Enum.take(generations)
    |> Enum.map(&load_generation/1)
    |> then(&{:ok, &1})
  end

  defp quality_dna_path, do: ".claude/quality-dna/current-state.json"
  defp history_path, do: ".claude/quality-dna/history/"
  defp load_generation(file), do: File.read!(Path.join(history_path(), file)) |> Jason.decode!()
end
```

## The Thirteen Quality Domains

Systematic self-analysis in the Prismatic Platform evaluates code across thirteen orthogonal quality domains. Each domain has zero-tolerance enforcement -- a single violation blocks deployment.

| Domain | What It Measures | Tool/Method |
|--------|-----------------|-------------|
| [Dialyzer](/glossary/dialyzer/) | Type safety and success typing | `mix dialyzer` |
| [Credo](/glossary/credo/) | Code consistency and style | `mix credo --strict` |
| [Compilation](/glossary/compilation/) | Warning-free compilation | `--warnings-as-errors` |
| DateTime Precision | Microsecond timestamp usage | AST analysis |
| Guard Functions | Proper guard clause usage | Pattern matching |
| @impl Coverage | Callback documentation completeness | Module introspection |
| Memory Safety | Resource leak prevention | Static analysis |
| [Performance](/glossary/performance/) | Anti-pattern detection | Pattern matching |
| [Regression Prevention](/glossary/regression-testing/) | Bug fix test coverage | Pre-commit hooks |
| Timing Patterns | Process.sleep detection | AST scanning |
| TODO Management | Tracked elimination of TODOs | Comment scanning |
| [Typespec](/glossary/typespec/) Coverage | Function specification completeness | Module introspection |
| Unsafe Map Access | Map.fetch! prevention | AST analysis |

## AutoEvolve Integration

Systematic self-analysis feeds directly into the [AutoEvolve](/glossary/autoevolve/) system, which uses analysis results to plan and execute platform evolution cycles. When self-analysis detects patterns of degradation or identifies improvement opportunities, AutoEvolve generates evolution proposals that undergo Trinity Gate validation before application.

The feedback loop operates as follows:

1. Self-analysis produces quality metrics and identifies patterns
2. AutoEvolve interprets patterns as evolution opportunities
3. Evolution proposals are generated with specific, measurable objectives
4. Trinity Gate validates proposals against structural, logical, and formal consistency
5. Approved proposals execute through the platform's autonomous evolution pipeline
6. Post-evolution self-analysis verifies improvement was achieved

This closed-loop architecture ensures that the platform's self-knowledge directly drives its self-improvement, creating a virtuous cycle of ever-increasing quality.

## Quality Floor Guardian

The [Quality Floor Guardian](/glossary/quality-floor-guardian/) is the enforcement mechanism for systematic self-analysis. It maintains minimum quality thresholds and takes autonomous action when those thresholds are threatened.

| Score Range | Status | Action |
|-------------|--------|--------|
| 100-99% | OPTIMAL | Monitor only |
| 98-99% | WARNING | Alert + investigation |
| 95-98% | CRITICAL | Auto-evolution trigger |
| <95% | EMERGENCY | Block commits + escalate |

The Guardian operates as a dedicated OTP process that subscribes to telemetry events from the self-analysis coordinator. When quality metrics cross threshold boundaries, the Guardian initiates the appropriate response protocol, from logging a warning to blocking all commits platform-wide.

## Introspection Capabilities of the BEAM VM

Systematic self-analysis in the Prismatic Platform leverages the BEAM virtual machine's exceptional [introspection](/glossary/introspection/) capabilities. Unlike platforms built on less reflective runtimes, BEAM-based systems can inspect module definitions, function clauses, type specifications, process states, and supervision tree structures at runtime.

Key introspection facilities used by the self-analysis system:

- `Module.__info__/1` -- Retrieves module attributes, function lists, and compilation metadata
- `Code.fetch_docs/1` -- Accesses `@moduledoc` and `@doc` documentation at runtime
- `Code.Typespec.fetch_specs/1` -- Retrieves `@spec` annotations for type analysis
- `Process.info/2` -- Inspects process state, message queue length, and memory usage
- `:sys.get_state/1` -- Retrieves GenServer state for health verification
- `:observer` integration -- Connects to the BEAM's built-in system observer

These capabilities make BEAM-based platforms uniquely suited to systematic self-analysis, as the runtime itself provides the introspection primitives needed for deep self-assessment without external tooling.

## Metrics and Measurement

Systematic self-analysis produces a rich set of metrics that quantify platform health across multiple dimensions:

**Composite Quality Score**: A weighted aggregate of all 13 domain scores, normalized to a 0-100 scale. The Prismatic Platform currently maintains a perfect 100/100 score.

**Quality Debt Points (QDP)**: A quantification of outstanding quality issues, where each violation type carries a weighted severity score. The platform has achieved complete QDP elimination (0 remaining).

**Evolutionary Fitness**: A composite measure of the platform's adaptability, currently at 0.9995 on a 0.0-1.0 scale. This metric incorporates quality score trends, adaptation speed, and architectural resilience.

**Domain Compliance**: The count of fully compliant quality domains out of 13 total. Full compliance (13/13) is the platform's current state.

**Warning Count**: The total number of compilation, analysis, and runtime warnings. Zero is the only acceptable value under the NO MERCY doctrine.

## Relationship to NO MERCY, NO DOUBTS

Systematic self-analysis is the technical implementation of the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine's verification requirements. The NO DOUBTS principle demands that every claim be backed by evidence -- self-analysis provides that evidence. The NO MERCY principle demands zero tolerance for quality violations -- self-analysis detects those violations.

Without systematic self-analysis, the NO MERCY, NO DOUBTS doctrine would be aspirational rather than enforceable. It is the measurement infrastructure that transforms philosophical principles into engineering constraints.

## Anti-Patterns in Self-Analysis

Several anti-patterns undermine the effectiveness of systematic self-analysis:

**Metric Gaming**: Optimizing for metrics rather than actual quality. The platform guards against this through multi-dimensional assessment -- gaming one metric while maintaining all others is exceedingly difficult.

**Analysis Paralysis**: Over-analyzing without acting on results. The AutoEvolve integration ensures that analysis results automatically trigger improvement actions.

**Threshold Complacency**: Setting thresholds too low and celebrating mediocrity. The platform's zero-tolerance approach (100/100, 0 warnings, 0 QDP) eliminates this risk by setting the threshold at perfection.

**Stale Baselines**: Using outdated quality baselines that no longer reflect current requirements. Quality DNA persistence and trend analysis ensure baselines evolve with the platform.

## Practical Application Guide

To implement systematic self-analysis in your own Elixir/OTP project:

1. **Define quality domains** relevant to your project's needs
2. **Implement domain analyzers** using a common behaviour for consistency
3. **Create a coordination process** (GenServer) to orchestrate analysis cycles
4. **Connect to telemetry** for real-time metric emission
5. **Persist results** for trend analysis and cross-session continuity
6. **Set enforceable thresholds** with automated response protocols
7. **Close the loop** by connecting analysis results to improvement actions

## Industry Context

Systematic self-analysis aligns with and extends several industry practices:

- **Continuous Inspection** (SonarQube model) -- Extended to 13 domains with runtime introspection
- **Observability** (Three Pillars: Logs, Metrics, Traces) -- Extended with self-assessment intelligence
- **Site Reliability Engineering** (SRE) -- Applied to code quality in addition to operational health
- **DevOps Metrics** (DORA Four Keys) -- Complemented with quality-specific measurement

The Prismatic Platform's approach goes beyond these industry practices by embedding analysis intelligence into the platform itself, rather than relying on external tooling and human interpretation.

## Related Concepts

- [AutoEvolve](/glossary/autoevolve/) -- The autonomous evolution system driven by self-analysis results
- [AutoHeal](/glossary/autoheal/) -- Automated remediation triggered by self-analysis findings
- [Quality DNA](/glossary/quality-dna/) -- Persistent quality state that enables trend analysis
- [Quality Floor Guardian](/glossary/quality-floor-guardian/) -- Threshold enforcement for quality metrics
- [Quality Gates](/glossary/quality-gates/) -- The gate system that blocks non-compliant code
- [Static Analysis](/glossary/static-analysis/) -- One of the primary tools used in self-analysis
- [Telemetry](/glossary/telemetry/) -- The event system that carries analysis metrics
- [Introspection](/glossary/introspection/) -- The BEAM capability that enables deep self-analysis
- [Metrics](/glossary/metrics/) -- The quantitative outputs of self-analysis
- [Continuous Validation](/glossary/continuous-validation/) -- Ongoing verification powered by self-analysis

See the Glossary index for the complete taxonomy of Prismatic Platform concepts.

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
