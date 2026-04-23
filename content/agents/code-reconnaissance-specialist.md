+++
title = "code-reconnaissance-specialist"
weight = 85
[extra]
domain = "primary"
level = "L2"
description = "Specialized agent for codebase reconnaissance, dependency analysis, architecture mapping, and structural intelligence gathering across the 90-application umbrella, providing the foundational intelligence that informs code quality, consolidation, and evolution decisions."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "no-mercy", "liveview", "umbrella-application", "genserver", "ets"]
domain_normalized = "primary"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 92
keywords = ["codebase reconnaissance", "dependency analysis", "architecture mapping", "structural intelligence", "git trees", "pattern recognition"]
tags = ["prismatic", "agent", "code-analysis", "primary-domain", "reconnaissance"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "code-reconnaissance-specialist - Prismatic Platform"
+++

## Executive Summary

The Code Reconnaissance Specialist operates as an L2 tactical operations agent within the Primary domain of the Prismatic Platform. This agent specializes in codebase reconnaissance, dependency analysis, and architecture mapping across the platform's 90-application [umbrella architecture](@/glossary/umbrella-application.md). In a codebase exceeding 2.8 million lines of code with 6,652 Elixir source files, understanding the structural landscape is a prerequisite for every other code-related operation: quality enforcement, consolidation, refactoring, and evolution all depend on accurate, current intelligence about the codebase's structure, dependencies, and patterns.

The reconnaissance function operates through the platform's optimized Git Trees infrastructure (`mix git_trees` and `./scripts/git-trees.sh`), which provides approximately 100x faster codebase exploration compared to filesystem traversal. This performance advantage enables the specialist to maintain near-real-time awareness of codebase structure changes, dependency shifts, and pattern evolution without the latency that would make continuous reconnaissance impractical.

## Architecture

The Code Reconnaissance Specialist implements a three-layer intelligence architecture spanning collection, analysis, and dissemination.

```
+----------------------------------------------------------------------+
|         Code Reconnaissance Specialist (L2)                          |
+----------------------------------------------------------------------+
|  Collection Layer                                                     |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Git Trees Scanner  |  | AST Analyzer       |  | Dep. Graph Build | |
|  | (File structure)   |  | (Module analysis)  |  | (mix.exs parse)  | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Analysis Engine                                      |  |
|  |  +--------------+  +------------------+  +-------------------+   |  |
|  |  | Pattern Recog|  | Coupling Scorer  |  | Complexity Mapper |   |  |
|  |  +--------------+  +------------------+  +-------------------+   |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Dissemination Layer       |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Intel Reports      |  | Agent Briefings    |  | Dashboard Data   | |
|  | (Structured output) |  | (Consumer-spec.)  |  | (LiveView feed)  | |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Collection Layer gathers raw data about codebase structure through Git Trees scanning, AST analysis of Elixir source files, and dependency graph construction from `mix.exs` configurations. The Analysis Engine processes collected data into actionable intelligence: pattern recognition, coupling analysis, and complexity mapping. The Dissemination Layer delivers intelligence to consuming agents and dashboards in formats optimized for each consumer's needs.

## Operational Domain

The Primary domain covers core platform functionality with direct operational impact. Code reconnaissance serves this domain by providing the foundational intelligence that enables informed decisions about code quality enforcement, consolidation targets, refactoring priorities, and architectural evolution. Without accurate codebase intelligence, these operations would be based on assumptions rather than evidence.

The reconnaissance domain operates at multiple granularity levels. At the macro level, it maps the overall application architecture: which applications exist, how they relate to each other, what their relative sizes and complexity profiles are. At the micro level, it examines individual modules: their public interfaces, internal complexity, coupling characteristics, and test coverage. At the trend level, it tracks how these metrics change over time, identifying structural drift and emerging architectural concerns.

## Core Capabilities

**Structural Mapping** generates comprehensive maps of the codebase's application hierarchy, module relationships, and file organization. The mapping process uses Git Trees for fast file enumeration and AST analysis for module-level intelligence. Output includes application dependency graphs, module coupling matrices, and file organization statistics that inform architectural decisions.

**Dependency Analysis** constructs and maintains the complete dependency graph across all 90 umbrella applications. The analysis identifies direct dependencies (declared in `mix.exs`), runtime dependencies (modules referenced but not declared), and transitive dependency chains. Circular dependency detection flags architectural violations that would cause compilation issues or indicate design problems.

**Complexity Profiling** measures code complexity across multiple dimensions: cyclomatic complexity per function, module-level coupling scores, application-level dependency fan-in/fan-out, and test-to-code ratios. Complexity profiles are maintained over time, enabling trend analysis that detects gradual complexity increases before they reach problematic levels.

**Pattern Recognition** identifies recurring code patterns across the codebase, distinguishing between intentional patterns (OTP design patterns, platform conventions) and emergent patterns (potential consolidation targets, anti-patterns). Pattern frequency and distribution data informs both the Code Consolidation Specialist and the Code Quality Commander.

**Change Impact Prediction** uses the dependency graph and module coupling data to predict the impact scope of proposed changes. Before a developer modifies a foundational module, the reconnaissance specialist can identify all dependent modules, estimate the testing scope required, and flag high-risk change cascades.

**Architecture Drift Detection** monitors the codebase structure for deviations from the intended architecture. When new dependencies are introduced that violate architectural boundaries, or when module organization drifts from established conventions, the drift detector generates alerts for architectural review.

## Implementation

```elixir
defmodule PrismaticCode.ReconnaissanceSpecialist do
  @moduledoc """
  L2 Tactical Operations agent providing codebase
  reconnaissance and structural intelligence.
  """

  use GenServer

  alias PrismaticCode.{GitTreesAdapter, ASTAnalyzer, DependencyGraphBuilder}
  alias PrismaticCode.{PatternRecognizer, ComplexityProfiler, DriftDetector}

  defstruct [
    :structure_cache,
    :dependency_graph,
    :complexity_profiles,
    :pattern_registry,
    :last_scan_timestamp
  ]

  @spec scan(keyword()) :: {:ok, map()} | {:error, term()}
  def scan(opts \\ []) do
    GenServer.call(__MODULE__, {:scan, opts}, :timer.minutes(2))
  end

  @spec dependency_graph() :: {:ok, map()} | {:error, term()}
  def dependency_graph do
    GenServer.call(__MODULE__, :dep_graph)
  end

  @impl true
  def handle_call({:scan, opts}, _from, state) do
    scope = Keyword.get(opts, :scope, :incremental)

    with {:ok, structure} <- GitTreesAdapter.scan(scope),
         {:ok, ast_data} <- ASTAnalyzer.analyze(structure.changed_files),
         {:ok, graph} <- DependencyGraphBuilder.update(state.dependency_graph, ast_data),
         {:ok, patterns} <- PatternRecognizer.detect(ast_data) do
      updated = %{state |
        structure_cache: structure,
        dependency_graph: graph,
        pattern_registry: patterns,
        last_scan_timestamp: DateTime.utc_now()
      }
      {:reply, {:ok, summarize(updated)}, updated}
    else
      {:error, _reason} = error -> {:reply, error, state}
    end
  end
end
```

## Authority Level

**L2** -- Tactical Operations -- Domain-specific tactical execution with cross-domain coordination capabilities. The specialist provides intelligence to higher-authority agents who make strategic decisions based on the reconnaissance data.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [code-quality-commander](@/agents/code-quality-commander.md) | Intelligence Consumer | Receives codebase structure data for quality assessment targeting |
| [code-consolidation-specialist-agent](@/agents/code-consolidation-specialist-agent.md) | Intelligence Consumer | Receives duplication and pattern data for consolidation planning |
| [code-specialist](@/agents/code-specialist.md) | Implementation Partner | Provides structural context for code generation decisions |
| [code-review-specialist-agent-v20](@/agents/code-review-specialist-agent-v20.md) | Review Context | Supplies architectural context for code review assessments |

## Operational Workflow

**Phase 1 -- Collection**: Git Trees scanning enumerates the current file structure. AST analysis processes changed Elixir files for module-level intelligence. Dependency graph is updated from mix.exs changes.

**Phase 2 -- Analysis**: Collected data undergoes pattern recognition, complexity profiling, coupling analysis, and drift detection. Results are compared against previous scans to identify changes and trends.

**Phase 3 -- Intelligence Production**: Analysis results are formatted into intelligence products: structural reports for quality agents, duplication maps for consolidation agents, complexity profiles for review agents, and dashboard data for developer visibility.

**Phase 4 -- Dissemination**: Intelligence products are distributed to consuming agents through the platform's message bus and made available through direct GenServer queries.

**Phase 5 -- Continuous Update**: The reconnaissance cycle repeats on configurable intervals and is triggered by detected file changes, maintaining near-real-time codebase awareness.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Full scan latency | < 30s | 15s |
| Incremental scan latency | < 5s | 2.1s |
| Dependency graph accuracy | 100% | 100% |
| Pattern detection recall | > 90% | 93% |
| Change impact prediction accuracy | > 85% | 88% |
| Architecture drift detection | > 95% | 97% |

## NABLA Compliance

**Signal Plurality**: Structural intelligence draws from multiple independent sources: Git Trees file data, AST analysis, mix.exs dependency declarations, and runtime module references. Cross-source validation ensures accuracy.

**Provenance Mandatory**: Every intelligence product carries provenance including the scan timestamp, scope, source data versions, and analysis algorithms applied.

**Time Decay**: Reconnaissance data carries freshness timestamps. Stale structural data (older than configured thresholds) is flagged and triggers re-scanning before use in decision-making.

## Enforcement

Code reconnaissance operates under [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. All structural claims are evidence-based, derived from actual codebase analysis rather than assumptions. Dependency graph accuracy is verified through compilation validation. Pattern recognition results undergo false-positive filtering before dissemination.

## Related Resources

- [code-quality-commander](@/agents/code-quality-commander.md) -- Quality enforcement
- [code-consolidation-specialist-agent](@/agents/code-consolidation-specialist-agent.md) -- Code consolidation
- [code-specialist](@/agents/code-specialist.md) -- Code generation
- [SEADF](@/glossary/seadf.md) -- Ecosystem evolution
- [AIAD Standard](@/glossary/aiad.md) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)