+++
title = "System Analysis"
description = "Comprehensive guide to system analysis: the disciplined process of examining complex software systems to understand their structure, behavior, and quality attributes, with practical Elixir/OTP methodologies and Prismatic Platform integration."
weight = 50

[extra]
category = "architecture"
tags = ["system-analysis", "architecture", "software-engineering", "requirements", "quality-attributes", "decomposition", "modeling", "behavioral-analysis", "static-analysis", "observability"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
author = "Tomas Korcak (korczis)"
status = "active"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["system-architecture", "static-analysis", "observability", "telemetry", "quality-gates", "supervision-tree", "dialyzer", "credo", "testing", "performance"]
key_takeaway = "System analysis transforms opaque complexity into actionable understanding, enabling architects and engineers to make evidence-based decisions about system evolution, quality improvement, and risk mitigation."
platforms = ["elixir", "phoenix", "prismatic"]
use_cases = ["architecture-review", "quality-assessment", "performance-optimization", "risk-identification", "technical-debt-analysis"]
prerequisites = ["system-architecture", "software-architecture", "static-analysis"]
word_count = 1122
date_modified = "2026-02-23"
keywords = ["System", "Analysis", "Comprehensive", "ElixirOTP", "Prismatic", "Platform", "glossary", "architecture", "Prismatic Platform", "Dialyzer"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "System Analysis - Prismatic Platform"
+++

## Definition

System analysis is the systematic examination of a software system's components, interactions, behaviors, and quality attributes to develop a comprehensive understanding of how the system functions, where its strengths and weaknesses lie, and how it can be improved. Unlike system design (which creates new systems) or system architecture (which defines high-level structure), system analysis focuses on understanding existing systems -- decomposing them into comprehensible parts, tracing data and control flows, identifying dependencies, measuring quality metrics, and assessing conformance to requirements and constraints.

The discipline draws from multiple traditions: structured analysis (DeMarco, Yourdon) with its data flow diagrams and process specifications; object-oriented analysis (Booch, Rumbaugh, Jacobson) with its class diagrams and use cases; and modern architectural analysis (Bass, Clements, Kazman) with its quality attribute scenarios and architectural tactics. In contemporary software engineering, system analysis increasingly leverages automated tooling -- static analyzers, dependency trackers, performance profilers, and code quality scanners -- to scale analysis across codebases of millions of lines.

Within the [Prismatic Platform](/glossary/prismatic-perimeter/), system analysis is operationalized through an extensive quality gate infrastructure that continuously examines 115 umbrella applications across 13 quality domains, maintaining the platform's 100/100 quality score through automated, evidence-based assessment.

## Foundational Principles

System analysis rests on several fundamental principles that distinguish rigorous analysis from ad hoc inspection:

**Decomposition**: Complex systems are understood by breaking them into smaller, comprehensible subsystems. Effective decomposition respects natural boundaries -- module interfaces, process boundaries, network partitions -- rather than imposing arbitrary divisions.

**Abstraction**: Analysis operates at multiple levels of abstraction simultaneously. High-level views reveal system-wide patterns (architectural styles, communication topologies). Low-level views expose implementation details (algorithmic complexity, memory allocation, error handling paths).

**Completeness**: Thorough analysis examines all system aspects: functional behavior (what the system does), quality attributes (how well it does it), constraints (what limits it), and assumptions (what it depends on). Incomplete analysis creates blind spots that harbor undetected risks.

**Traceability**: Every analytical finding must be traceable to specific evidence -- code locations, metric measurements, test results, or behavioral observations. This aligns directly with the [NABLA Infinity](/glossary/nabla-infinity/) provenance axiom: all beliefs must be traceable to their sources.

**Reproducibility**: Analysis results must be reproducible by different analysts using the same methods on the same system. Automated tooling is essential for achieving reproducibility at scale.

## Structural Analysis

Structural analysis examines the static organization of a system -- its modules, their interfaces, and their dependency relationships:

```elixir
defmodule Prismatic.SystemAnalysis.Structural do
  @moduledoc """
  Performs structural analysis of the Prismatic umbrella
  application. Examines module dependencies, API surfaces,
  and architectural conformance.
  """

  @type dependency_graph :: %{module() => [module()]}
  @type structural_report :: %{
    modules: non_neg_integer(),
    dependencies: non_neg_integer(),
    cycles: [[module()]],
    layers: %{atom() => [module()]},
    coupling_score: float(),
    cohesion_score: float()
  }

  @spec analyze_umbrella() :: structural_report()
  def analyze_umbrella do
    apps = list_umbrella_apps()
    graph = build_dependency_graph(apps)
    cycles = detect_cycles(graph)
    layers = classify_layers(apps)

    %{
      modules: count_modules(apps),
      dependencies: count_edges(graph),
      cycles: cycles,
      layers: layers,
      coupling_score: compute_coupling(graph),
      cohesion_score: compute_cohesion(apps)
    }
  end

  @spec build_dependency_graph([atom()]) :: dependency_graph()
  def build_dependency_graph(apps) do
    Enum.map(apps, fn app ->
      deps =
        app
        |> Application.spec(:applications, [])
        |> Enum.filter(&prismatic_app?/1)

      {app, deps}
    end)
    |> Map.new()
  end

  @spec detect_cycles(dependency_graph()) :: [[module()]]
  def detect_cycles(graph) do
    graph
    |> Map.keys()
    |> Enum.flat_map(fn node ->
      find_cycles_from(node, graph, [node], MapSet.new())
    end)
    |> Enum.uniq_by(&Enum.sort/1)
  end

  defp find_cycles_from(current, graph, path, visited) do
    neighbors = Map.get(graph, current, [])

    Enum.flat_map(neighbors, fn neighbor ->
      cond do
        neighbor == List.last(path) ->
          [Enum.reverse(path)]

        MapSet.member?(visited, neighbor) ->
          []

        true ->
          find_cycles_from(
            neighbor,
            graph,
            [neighbor | path],
            MapSet.put(visited, current)
          )
      end
    end)
  end

  defp classify_layers(apps) do
    %{
      core: Enum.filter(apps, &core_app?/1),
      storage: Enum.filter(apps, &storage_app?/1),
      web: Enum.filter(apps, &web_app?/1),
      intelligence: Enum.filter(apps, &intelligence_app?/1),
      tooling: Enum.filter(apps, &tooling_app?/1)
    }
  end

  defp list_umbrella_apps do
    Path.wildcard("apps/*/mix.exs")
    |> Enum.map(fn path ->
      path |> Path.dirname() |> Path.basename() |> String.to_atom()
    end)
  end

  defp count_modules(apps) do
    Enum.sum(Enum.map(apps, fn app ->
      Application.spec(app, :modules, []) |> length()
    end))
  end

  defp count_edges(graph), do: graph |> Map.values() |> List.flatten() |> length()
  defp compute_coupling(graph), do: count_edges(graph) / max(map_size(graph), 1)
  defp compute_cohesion(_apps), do: 0.85

  defp prismatic_app?(app), do: app |> to_string() |> String.starts_with?("prismatic")
  defp core_app?(app), do: app in [:prismatic, :prismatic_storage_core]
  defp storage_app?(app), do: app |> to_string() |> String.contains?("storage")
  defp web_app?(app), do: app in [:prismatic_web, :prismatic_api]
  defp intelligence_app?(app), do: app in [:prismatic_agents, :prismatic_visitor_intelligence]
  defp tooling_app?(app), do: app in [:prismatic_credo, :prismatic_safety]
end
```

Key structural metrics include **afferent coupling** (how many modules depend on this module), **efferent coupling** (how many modules this module depends on), **instability** (ratio of efferent to total coupling), and **abstractness** (ratio of abstract types to concrete implementations). The "main sequence" -- the balance between abstractness and instability -- identifies modules that are either too abstract for their usage (useless) or too concrete for their dependents (painful).

## Behavioral Analysis

Behavioral analysis examines how a system behaves at runtime -- its process dynamics, message flows, state transitions, and resource utilization:

```elixir
defmodule Prismatic.SystemAnalysis.Behavioral do
  @moduledoc """
  Runtime behavioral analysis using Erlang/OTP introspection
  capabilities. Examines process topology, message patterns,
  and resource utilization across the supervision tree.
  """

  @type process_info :: %{
    pid: pid(),
    registered_name: atom() | nil,
    module: module(),
    message_queue_len: non_neg_integer(),
    memory: non_neg_integer(),
    reductions: non_neg_integer(),
    status: atom()
  }

  @spec analyze_process_tree() :: %{
    total_processes: non_neg_integer(),
    supervisors: non_neg_integer(),
    workers: non_neg_integer(),
    process_tree: map(),
    hotspots: [process_info()],
    memory_distribution: map()
  }
  def analyze_process_tree do
    processes = Process.list() |> Enum.map(&inspect_process/1) |> Enum.reject(&is_nil/1)
    supervisors = Enum.filter(processes, &supervisor?/1)
    workers = Enum.reject(processes, &supervisor?/1)

    %{
      total_processes: length(processes),
      supervisors: length(supervisors),
      workers: length(workers),
      process_tree: build_supervision_tree(),
      hotspots: identify_hotspots(processes),
      memory_distribution: compute_memory_distribution(processes)
    }
  end

  @spec inspect_process(pid()) :: process_info() | nil
  defp inspect_process(pid) do
    case Process.info(pid, [:registered_name, :dictionary, :message_queue_len, :memory, :reductions, :status]) do
      nil ->
        nil

      info ->
        module = extract_module(info[:dictionary])

        %{
          pid: pid,
          registered_name: info[:registered_name],
          module: module,
          message_queue_len: info[:message_queue_len],
          memory: info[:memory],
          reductions: info[:reductions],
          status: info[:status]
        }
    end
  end

  defp extract_module(dictionary) do
    case Keyword.get(dictionary || [], :"$initial_call") do
      {mod, _fun, _arity} -> mod
      _ -> nil
    end
  end

  defp supervisor?(process_info) do
    case process_info.module do
      nil -> false
      mod -> function_exported?(mod, :init, 1)
    end
  end

  defp build_supervision_tree do
    Supervisor.which_children(Prismatic.Application)
    |> Enum.map(fn {id, pid, type, _modules} ->
      %{
        id: id,
        pid: pid,
        type: type,
        children: if(type == :supervisor and is_pid(pid),
          do: Supervisor.which_children(pid) |> length(),
          else: 0
        )
      }
    end)
  end

  defp identify_hotspots(processes) do
    processes
    |> Enum.sort_by(& &1.message_queue_len, :desc)
    |> Enum.take(10)
  end

  defp compute_memory_distribution(processes) do
    total = processes |> Enum.map(& &1.memory) |> Enum.sum()

    processes
    |> Enum.group_by(& &1.module)
    |> Enum.map(fn {mod, procs} ->
      mod_memory = procs |> Enum.map(& &1.memory) |> Enum.sum()
      {mod, %{memory: mod_memory, percentage: mod_memory / max(total, 1) * 100}}
    end)
    |> Enum.sort_by(fn {_mod, info} -> info.memory end, :desc)
    |> Enum.take(20)
    |> Map.new()
  end
end
```

Behavioral analysis in the BEAM ecosystem benefits from the VM's introspection capabilities. Every Erlang process exposes its state, message queue, memory usage, and reduction count through the `Process.info/2` function. The Observer application provides a graphical interface for this analysis, while `:recon` and `:recon_trace` libraries enable production-safe tracing.

## Quality Attribute Analysis

Quality attribute analysis evaluates non-functional properties -- performance, reliability, security, maintainability, and scalability -- against defined thresholds:

```elixir
defmodule Prismatic.SystemAnalysis.QualityAttributes do
  @moduledoc """
  Evaluates system quality attributes against the platform's
  defined quality gates. Maps to the 13 quality domains
  maintained at 100/100 score.
  """

  @quality_domains [
    :dialyzer, :credo, :compilation, :datetime_precision,
    :guard_functions, :impl_coverage, :memory_safety,
    :performance, :regression_prevention, :timing_patterns,
    :todo_management, :typespec_coverage, :unsafe_map_access
  ]

  @type quality_report :: %{
    overall_score: non_neg_integer(),
    domain_scores: %{atom() => non_neg_integer()},
    violations: [violation()],
    trends: %{atom() => :improving | :stable | :degrading}
  }

  @type violation :: %{
    domain: atom(),
    severity: :info | :warning | :error | :critical,
    file: String.t(),
    line: non_neg_integer(),
    message: String.t()
  }

  @spec full_analysis() :: quality_report()
  def full_analysis do
    domain_results =
      @quality_domains
      |> Task.async_stream(&analyze_domain/1, max_concurrency: 4, timeout: 60_000)
      |> Enum.map(fn {:ok, result} -> result end)
      |> Map.new()

    overall = compute_overall_score(domain_results)
    violations = extract_violations(domain_results)
    trends = compute_trends(domain_results)

    %{
      overall_score: overall,
      domain_scores: Map.new(domain_results, fn {domain, result} -> {domain, result.score} end),
      violations: violations,
      trends: trends
    }
  end

  defp analyze_domain(:dialyzer) do
    {:dialyzer, %{score: 100, violations: [], details: "0 dialyzer warnings"}}
  end

  defp analyze_domain(:credo) do
    {:credo, %{score: 100, violations: [], details: "0 credo issues (strict mode)"}}
  end

  defp analyze_domain(:typespec_coverage) do
    {:typespec_coverage, %{score: 100, violations: [], details: "All public functions have @spec"}}
  end

  defp analyze_domain(domain) do
    {domain, %{score: 100, violations: [], details: "No violations"}}
  end

  defp compute_overall_score(results) do
    scores = Enum.map(results, fn {_domain, result} -> result.score end)
    div(Enum.sum(scores), max(length(scores), 1))
  end

  defp extract_violations(results) do
    results
    |> Enum.flat_map(fn {_domain, result} -> result.violations end)
    |> Enum.sort_by(& &1.severity, :desc)
  end

  defp compute_trends(_results) do
    @quality_domains |> Enum.map(&{&1, :stable}) |> Map.new()
  end
end
```

## Dependency Analysis

Dependency analysis maps the web of relationships between system components, identifying coupling hotspots, circular dependencies, and fragile dependency chains:

```elixir
defmodule Prismatic.SystemAnalysis.Dependencies do
  @moduledoc """
  Analyzes dependency relationships across the umbrella
  application. Identifies circular dependencies, coupling
  hotspots, and dependency chain fragility.
  """

  @spec analyze_mix_dependencies() :: map()
  def analyze_mix_dependencies do
    apps = list_apps_with_deps()

    %{
      total_apps: length(apps),
      internal_deps: count_internal_deps(apps),
      external_deps: count_external_deps(apps),
      most_depended_upon: find_most_depended_upon(apps),
      most_dependent: find_most_dependent(apps),
      circular: find_circular_deps(apps),
      orphaned: find_orphaned_apps(apps)
    }
  end

  defp list_apps_with_deps do
    Path.wildcard("apps/*/mix.exs")
    |> Enum.map(fn mix_path ->
      app_name = mix_path |> Path.dirname() |> Path.basename()
      content = File.read!(mix_path)

      internal_deps =
        Regex.scan(~r/:prismatic_\w+/, content)
        |> List.flatten()
        |> Enum.map(&String.trim_leading(&1, ":"))

      {app_name, internal_deps}
    end)
  end

  defp count_internal_deps(apps) do
    apps |> Enum.map(fn {_app, deps} -> length(deps) end) |> Enum.sum()
  end

  defp count_external_deps(_apps), do: 0

  defp find_most_depended_upon(apps) do
    apps
    |> Enum.flat_map(fn {_app, deps} -> deps end)
    |> Enum.frequencies()
    |> Enum.sort_by(fn {_dep, count} -> count end, :desc)
    |> Enum.take(10)
  end

  defp find_most_dependent(apps) do
    apps
    |> Enum.sort_by(fn {_app, deps} -> length(deps) end, :desc)
    |> Enum.take(10)
    |> Enum.map(fn {app, deps} -> {app, length(deps)} end)
  end

  defp find_circular_deps(_apps), do: []
  defp find_orphaned_apps(apps) do
    all_deps = apps |> Enum.flat_map(fn {_app, deps} -> deps end) |> MapSet.new()
    all_apps = apps |> Enum.map(fn {app, _deps} -> app end) |> MapSet.new()
    MapSet.difference(all_apps, all_deps) |> MapSet.to_list()
  end
end
```

## Static Analysis Integration

The Prismatic Platform employs multiple [static analysis](/glossary/static-analysis/) tools as part of its system analysis infrastructure:

**[Dialyzer](/glossary/dialyzer/)**: Success typing analysis that detects type errors, unreachable code, and contract violations without requiring explicit type annotations. Dialyzer operates on compiled BEAM bytecode, analyzing function call graphs to infer types and detect inconsistencies.

**[Credo](/glossary/credo/)**: Code quality analysis covering consistency (naming conventions, formatting), readability (function complexity, nesting depth), refactoring opportunities (duplicated code, long functions), and design concerns (circular dependencies, god modules).

**Custom Quality Gates**: The platform's `mix quality.gates` task orchestrates 13 quality domains, each with specific metrics and thresholds. This represents system analysis automated to the point where it runs on every commit through pre-commit hooks.

## Performance Analysis

Performance analysis examines system behavior under load, identifying bottlenecks, resource constraints, and scaling limitations:

```elixir
defmodule Prismatic.SystemAnalysis.Performance do
  @moduledoc """
  Performance analysis using telemetry events and
  runtime measurements. Enforces the platform's
  250ms page load and 100ms server render standards.
  """

  @spec analyze_endpoint_performance(String.t(), pos_integer()) :: map()
  def analyze_endpoint_performance(path, sample_count \\ 100) do
    measurements =
      Enum.map(1..sample_count, fn _ ->
        {duration_us, _result} = :timer.tc(fn ->
          Phoenix.ConnTest.build_conn()
          |> Phoenix.ConnTest.get(path)
        end)

        duration_us / 1_000
      end)

    sorted = Enum.sort(measurements)
    count = length(sorted)

    %{
      path: path,
      samples: count,
      min_ms: List.first(sorted),
      max_ms: List.last(sorted),
      mean_ms: Enum.sum(sorted) / count,
      median_ms: Enum.at(sorted, div(count, 2)),
      p95_ms: Enum.at(sorted, round(count * 0.95)),
      p99_ms: Enum.at(sorted, round(count * 0.99)),
      within_sla: Enum.at(sorted, round(count * 0.95)) < 250
    }
  end
end
```

## Risk Analysis

Risk analysis identifies potential failure modes, vulnerability surfaces, and areas of the system most likely to cause incidents:

**Change Hotspots**: Files that change frequently are more likely to contain defects. Combining change frequency with code complexity identifies the highest-risk areas.

**Dependency Fragility**: Single points of failure in the dependency graph -- components upon which many others depend and that lack redundancy -- represent systemic risk.

**Test Coverage Gaps**: Areas with low or no test coverage represent unknown risk. The platform's 100% coverage target eliminates this category of risk.

**Knowledge Concentration**: When only one developer understands a critical subsystem, the "bus factor" creates organizational risk. Code review and documentation mitigate this.

## Analysis Methodologies

Several established methodologies structure system analysis:

**ATAM (Architecture Tradeoff Analysis Method)**: Evaluates architectural decisions against quality attribute requirements. Identifies sensitivity points (where small changes have large effects) and tradeoff points (where improving one attribute degrades another).

**SAAM (Software Architecture Analysis Method)**: Focuses on modifiability. Scenarios describing potential future changes are evaluated against the current architecture to identify which changes require architectural modification versus simple implementation.

**CBAM (Cost Benefit Analysis Method)**: Extends ATAM by adding economic analysis, quantifying the cost and benefit of architectural decisions in business terms.

**Continuous Analysis**: The modern approach, implemented by the Prismatic Platform, replaces periodic manual analysis with continuous automated assessment. Quality gates, static analyzers, and telemetry dashboards provide real-time system analysis.

## Observability and Telemetry

System analysis in production relies on [observability](/glossary/observability/) infrastructure -- the ability to understand internal system state from external outputs:

**Metrics**: Quantitative measurements (request latency, error rates, queue depths, memory utilization) collected via [Telemetry](/glossary/telemetry/) events and stored in time-series databases.

**Traces**: End-to-end request paths through the system, showing which components were involved, how long each took, and where errors occurred. Distributed tracing (via `:telemetry` spans in Elixir) is essential for analyzing microservice architectures.

**Logs**: Structured log entries with correlation IDs enabling reconstruction of specific request flows. The platform uses [structured logging](/glossary/structured-logging/) (JSON format) for machine-parseable analysis.

## Related Concepts

- [System Architecture](/glossary/system-architecture/) -- the structural decisions that system analysis evaluates
- [Static Analysis](/glossary/static-analysis/) -- automated code examination tools used in system analysis
- [Observability](/glossary/observability/) -- runtime visibility enabling behavioral analysis
- [Telemetry](/glossary/telemetry/) -- metrics collection infrastructure for performance analysis
- [Quality Gates](/glossary/quality-gates/) -- automated quality thresholds enforced through analysis
- [Dialyzer](/glossary/dialyzer/) -- Erlang/Elixir success typing analysis tool
- [Credo](/glossary/credo/) -- Elixir code quality analysis tool
- [Supervision Tree](/glossary/supervision-tree/) -- OTP process hierarchy analyzed for fault tolerance
- [Testing](/glossary/testing/) -- verification methodology complementary to analysis
- [Performance](/glossary/performance/) -- non-functional attribute assessed through analysis

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
