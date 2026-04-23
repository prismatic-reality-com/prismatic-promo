+++
title = "Code Consolidation Specialist Agent"
weight = 83
[extra]
domain = "primary"
level = "L3"
description = "Provides codebase deduplication, shared library extraction, and module consolidation across the 90-application umbrella architecture, reducing maintenance burden and ensuring that common patterns are implemented once and shared rather than duplicated across applications."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "no-mercy", "liveview", "umbrella-application", "genserver", "ets"]
domain_normalized = "primary"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 92
keywords = ["code consolidation", "deduplication", "shared library extraction", "umbrella architecture", "code reuse", "AST analysis", "refactoring"]
tags = ["prismatic", "agent", "code-quality", "consolidation", "primary-domain"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Code Consolidation Specialist Agent - Prismatic Platform"
+++

## Overview

The Code Consolidation Specialist Agent operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Primary domain of the Prismatic Platform. This agent provides codebase deduplication, shared library extraction, and module consolidation across the platform's 90-application [umbrella architecture](@/glossary/umbrella-application.md). In an ecosystem that has grown organically through rapid feature development and evolutionary expansion, code duplication is an inevitable consequence. The Consolidation Specialist identifies duplicated logic, extracts shared abstractions, and refactors consuming applications to use consolidated implementations. Every operation adheres to the [AIAD](@/glossary/aiad.md) standard and the platform's zero-tolerance quality policies.

Code duplication in a 90-application umbrella with 2.8 million lines of code creates compounding maintenance costs. A bug fix in duplicated logic must be applied in every location where the code was copied, and missed locations become latent defects. Performance optimizations must be replicated across all copies. Documentation must be maintained in parallel. The Consolidation Specialist addresses this through systematic detection and elimination of duplication, extracting common patterns into shared libraries that provide single points of maintenance while preserving the semantic clarity of domain-specific interfaces. The agent coordinates closely with the [code-quality-commander](@/agents/code-quality-commander.md) to ensure that consolidated code meets or exceeds quality standards, and with the [code-reconnaissance-specialist](@/agents/code-reconnaissance-specialist.md) for codebase intelligence that identifies consolidation targets.

The agent's analytical pipeline leverages [NABLA Infinity](@/glossary/nabla-infinity.md) signal plurality, drawing from multiple independent detection algorithms to identify duplication. This multi-signal approach prevents false positive consolidation recommendations based on coincidental structural similarity, ensuring that only genuine duplication is targeted for extraction.

## Architecture

The Consolidation Specialist implements a three-layer architecture spanning detection, analysis, and refactoring.

```elixir
defmodule PrismaticCode.ConsolidationSpecialist do
  @moduledoc """
  L3 Strategic Command agent providing codebase deduplication
  and shared library extraction across the umbrella.

  Implements AST-level clone detection, abstraction planning,
  and automated refactoring with three-stage verification.
  """

  use GenServer

  alias PrismaticCode.{CloneDetector, AbstractionPlanner, LibraryExtractor}
  alias PrismaticCode.{ConsumerUpdater, TestMigrator, ImpactAssessor}

  defstruct [
    :clone_registry,
    :consolidation_plans,
    :extraction_history,
    :duplication_metrics
  ]

  @spec detect_clones(keyword()) :: {:ok, [map()]} | {:error, term()}
  def detect_clones(opts \\ []) do
    GenServer.call(__MODULE__, {:detect, opts}, :timer.minutes(5))
  end

  @spec consolidate(String.t()) :: {:ok, map()} | {:error, term()}
  def consolidate(clone_group_id) do
    GenServer.call(__MODULE__, {:consolidate, clone_group_id}, :timer.minutes(10))
  end

  @impl true
  def handle_call({:detect, opts}, _from, state) do
    scope = Keyword.get(opts, :scope, :incremental)

    case CloneDetector.scan(scope) do
      {:ok, clones} ->
        assessed = Enum.map(clones, &ImpactAssessor.assess/1)
        sorted = Enum.sort_by(assessed, & &1.impact_score, :desc)
        {:reply, {:ok, sorted}, %{state | clone_registry: sorted}}

      {:error, _reason} = error ->
        {:reply, error, state}
    end
  end

  @impl true
  def handle_call({:consolidate, group_id}, _from, state) do
    with {:ok, group} <- find_clone_group(state.clone_registry, group_id),
         {:ok, plan} <- AbstractionPlanner.plan(group),
         {:ok, library} <- LibraryExtractor.extract(plan),
         {:ok, _updated} <- ConsumerUpdater.update(plan.consumers, library),
         {:ok, _tests} <- TestMigrator.consolidate(plan.test_suites, library) do
      {:reply, {:ok, library}, update_history(state, library)}
    else
      {:error, _reason} = error -> {:reply, error, state}
    end
  end
end
```

The Detection Layer scans the codebase for duplicated code using AST-level comparison, structural pattern matching, and similarity scoring. The Analysis Engine evaluates detected duplications for consolidation viability, plans abstraction strategies, and assesses refactoring risk. The Refactoring Engine extracts shared libraries, updates consuming applications, and consolidates associated tests.

## Key Capabilities

- **AST-Level Clone Detection** -- Scans the entire umbrella codebase using abstract syntax tree comparison to identify code clones at multiple granularity levels: exact clones (identical code), parameterized clones (identical structure with different variable names), and near clones (similar structure with minor variations). Detection operates incrementally, analyzing only changed files and their dependency neighborhoods.

- **Shared Library Extraction** -- Transforms detected clones into shared library modules within appropriate umbrella applications. The extraction process identifies the minimal shared interface, creates a new module with proper `@spec` annotations and documentation, and generates the shared library's [supervision tree](@/glossary/supervision-tree.md) integration if the duplicated code involves stateful processes.

- **Consumer Application Refactoring** -- Updates all applications that contained duplicated code to consume the newly extracted shared library. Call site updates are performed with three-stage verification: pre-refactor snapshot, incremental transformation with intermediate test validation, and post-refactor regression testing.

- **Duplication Impact Assessment** -- Quantifies the maintenance cost of detected duplication to prioritize consolidation efforts. The assessment considers number of duplicate locations, modification frequency, historical bug correlation, and total lines of code that consolidation would eliminate.

- **Test Consolidation** -- Merges duplicated test suites that accompany duplicated implementation code. When multiple applications have independent tests for the same logic, the test consolidation engine combines them into a comprehensive shared test suite.

- **Continuous Monitoring** -- Tracks duplication metrics over time through the platform's [telemetry](@/glossary/telemetry.md) system, alerting when new duplication is introduced and tracking the effectiveness of consolidation efforts.

## Authority Level

**L3** -- Strategic Command -- Multi-domain coordination with authority over code consolidation decisions, shared library architecture, and cross-application refactoring across the umbrella. The specialist can initiate refactoring operations across any application boundary and mandate adoption of shared libraries when consolidation produces verified quality improvements.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `detect_clones/1` | Scan codebase for duplicated code with configurable scope | L3 Self |
| `consolidate/1` | Execute consolidation plan for a detected clone group | L3 Self |
| `impact_report/0` | Generate duplication impact report across all applications | L3 Self |
| `monitor_status/0` | Return current duplication metrics and trend data | Universal |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [code-quality-commander](@/agents/code-quality-commander.md) | Quality Authority -- ensures consolidated code meets quality standards and improves overall metrics |
| [code-review-specialist-agent-v20](@/agents/code-review-specialist-agent-v20.md) | Review Partner -- reviews consolidation refactoring for correctness and pattern compliance |
| [code-reconnaissance-specialist](@/agents/code-reconnaissance-specialist.md) | Discovery Partner -- provides codebase reconnaissance data that identifies consolidation targets |
| [code-specialist](@/agents/code-specialist.md) | Implementation Partner -- generates consolidated shared library implementations |

## Enforcement

Code consolidation operates under [NO MERCY, NO DOUBTS](@/glossary/no-mercy.md) doctrine with full [Trinity Gate](@/glossary/trinity-gate.md) validation. No consolidation is performed without comprehensive test coverage. No shared library is extracted without verified consumer compatibility. Consolidation refactoring must maintain or improve the platform's quality score. Any consolidation that introduces regressions is immediately reverted. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework requires that clone detection uses multiple comparison algorithms (AST comparison, structural matching, token-level similarity) to identify duplications -- no single algorithm determines consolidation decisions. Every consolidation action carries provenance linking it to the detected clone group, the analysis that determined consolidation viability, and the verification results.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)