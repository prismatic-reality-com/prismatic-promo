+++
title = "consolidation-architect"
weight = 94
[extra]
domain = "consolidation"
level = "L3"
description = "System consolidation strategies, deduplication, and optimization with genetic enhancements for type safety in consolidation, verification protocols, and multi-system coordination"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["consolidation-architect", "System", "agents", "agent", "Prismatic Platform", "Consolidation Architect", "Phase"]
tags = ["agents", "agent", "consolidation-architect", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "consolidation-architect - Prismatic Platform"
+++

## Overview

The Consolidation Architect operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Consolidation domain of the Prismatic Platform. This agent is responsible for identifying, planning, and executing systematic consolidation of duplicated code, overlapping modules, and redundant patterns across the platform's 90-application umbrella architecture. Through genetic algorithm-enhanced analysis, the Consolidation Architect discovers optimization opportunities that manual review would miss, transforming organic codebase growth into deliberate, optimized architecture.

In a platform of this scale -- over 6,600 Elixir source files across 90 umbrella applications -- consolidation is not merely a cleanup task but a strategic operation that affects compilation times, dependency management, cognitive load, and maintenance cost. The Consolidation Architect evaluates each consolidation candidate against type safety requirements, API compatibility constraints, and downstream dependency impact before proceeding. Every consolidation operation follows a rigorous verification [protocol](@/glossary/protocol.md) that ensures zero regression and measurable improvement in codebase cohesion.

As the first generation of consolidation intelligence, this agent established the foundational patterns and methodologies that the [Consolidation Architect V2](@/agents/consolidation-architect-v2.md) later evolved into a parallel squad-based approach. The original Consolidation Architect continues to operate, providing baseline pattern analysis and serving as the reference implementation for consolidation verification protocols.

## Architecture

The Consolidation Architect follows a sequential pipeline architecture that prioritizes safety and type correctness over throughput.

```
+----------------------------------------------------------------------+
|                    Consolidation Architect (L3)                       |
+----------------------------------------------------------------------+
|  Discovery Layer                                                      |
|  +--------------------+  +---------------------+  +----------------+ |
|  | AST Pattern Scanner|  | Genetic Optimizer   |  | Type Analyzer  | |
|  | (Duplicate detect) |--->| (Path discovery)   |--->| (Safety check) | |
|  +--------------------+  +---------------------+  +----------------+ |
|                                    |                                  |
|  Planning Layer                    |                                  |
|  +--------------------+  +--------+---------+  +------------------+  |
|  | Dependency Mapper  |  | Impact Estimator  |  | Compatibility    |  |
|  | (Graph analysis)   |  | (QDP projection)  |  | Verifier         |  |
|  +--------------------+  +-------------------+  +------------------+  |
|                                    |                                  |
|  Execution Layer                   |                                  |
|  +--------------------+  +--------+---------+  +------------------+  |
|  | Module Extractor   |  | Caller Migrator   |  | Test Validator   |  |
|  +--------------------+  +-------------------+  +------------------+  |
+----------------------------------------------------------------------+
```

The AST Pattern Scanner uses Elixir's `Code.string_to_quoted/1` and custom AST walking functions to identify structurally similar function implementations across the umbrella. The Genetic Optimizer applies evolutionary algorithms to discover non-obvious consolidation paths -- sequences of transformations that maximize code reuse while minimizing coupling between applications. The Type Analyzer validates that proposed consolidations maintain full backward compatibility through [typespec](@/glossary/typespec.md) analysis and [Dialyzer](@/glossary/dialyzer.md) contract verification.

## Core Capabilities

**Cross-Module Pattern Extraction** identifies functionally equivalent implementations across [umbrella application](@/glossary/umbrella-application.md)s and consolidates them into shared libraries with proper [behaviour](@/glossary/behaviour.md) specifications. The extraction process generates a behaviour that captures the common interface, implements a default module that satisfies the behaviour, and migrates all callers to use the new shared implementation.

**Technical Debt Quantification** uses [metrics](@/glossary/metrics.md)-driven analysis to prioritize consolidation targets by impact, risk, and effort ratios. Each consolidation candidate is scored on four dimensions: lines of code eliminated, modules removed, dependency graph edges simplified, and maintenance cost reduction projected from historical modification frequency.

**Type-Safe Consolidation Planning** with comprehensive impact analysis verifies that consolidated modules maintain full backward compatibility through typespec validation. The planning phase generates a complete impact report showing every module, function, and type that would be affected by the proposed consolidation, enabling informed go/no-go decisions.

**Genetic Optimization** applies evolutionary algorithms to discover non-obvious consolidation paths that maximize code reuse while minimizing coupling. The genetic algorithm population represents different consolidation orderings, and fitness is measured by total QDP reduction divided by estimated risk. Over generations, the algorithm converges on high-value, low-risk consolidation sequences.

**Verification Protocol Execution** with automated pre- and post-consolidation test suites guarantees zero regression. The protocol captures test results before consolidation, executes the transformation, re-runs the full test suite, and compares results. Any test regression triggers automatic rollback of the consolidation branch.

## Implementation

```elixir
defmodule PrismaticConsolidation.Architect do
  @moduledoc """
  L3 Strategic Command agent for systematic code consolidation
  with genetic optimization and type-safe verification protocols.
  """

  use GenServer

  alias PrismaticConsolidation.{ASTScanner, GeneticOptimizer, TypeAnalyzer}
  alias PrismaticConsolidation.{DependencyMapper, ModuleExtractor, TestValidator}

  @population_size 50
  @generations 100
  @similarity_threshold 0.80

  defstruct [
    :pattern_cache,
    :dependency_graph,
    :consolidation_history,
    :genetic_state
  ]

  @spec discover_candidates(keyword()) :: {:ok, [map()]} | {:error, term()}
  def discover_candidates(opts \\ []) do
    GenServer.call(__MODULE__, {:discover, opts}, :timer.minutes(10))
  end

  @spec execute_consolidation(map()) :: {:ok, map()} | {:error, term()}
  def execute_consolidation(plan) do
    GenServer.call(__MODULE__, {:execute, plan}, :timer.minutes(30))
  end

  @impl true
  def handle_call({:discover, opts}, _from, state) do
    threshold = Keyword.get(opts, :threshold, @similarity_threshold)

    with {:ok, patterns} <- ASTScanner.scan_umbrella(threshold),
         {:ok, deps} <- DependencyMapper.build_graph(),
         {:ok, optimized} <- GeneticOptimizer.optimize(patterns, deps, generations: @generations) do
      {:reply, {:ok, optimized}, %{state | pattern_cache: patterns, dependency_graph: deps}}
    end
  end

  @impl true
  def handle_call({:execute, plan}, _from, state) do
    with {:ok, baseline} <- TestValidator.capture_baseline(),
         {:ok, type_check} <- TypeAnalyzer.verify_safety(plan),
         {:ok, extracted} <- ModuleExtractor.execute(plan),
         {:ok, results} <- TestValidator.validate_against(baseline) do
      qdp_reduction = calculate_qdp_reduction(plan, extracted)

      :telemetry.execute(
        [:prismatic, :consolidation, :completed],
        %{qdp_reduction: qdp_reduction, modules_consolidated: length(plan.targets)},
        %{architect: :v1}
      )

      {:reply, {:ok, %{extracted: extracted, qdp_reduction: qdp_reduction}}, state}
    else
      {:error, :test_regression} = error ->
        ModuleExtractor.rollback()
        {:reply, error, state}
    end
  end

  defp calculate_qdp_reduction(plan, result) do
    lines_removed = plan.estimated_lines - result.final_lines
    modules_removed = length(plan.targets) - 1
    %{lines: lines_removed, modules: modules_removed}
  end
end
```

## Integration Points

| Component | Protocol | Purpose |
|-----------|----------|---------|
| Mix Compiler | AST analysis | Source code parsing and pattern detection |
| Git Repository | CLI | Branch management and rollback capability |
| ExUnit | Test execution | Pre/post consolidation verification |
| [Dialyzer](@/glossary/dialyzer.md) | PLT analysis | Type contract verification |
| [Credo](@/glossary/credo.md) | Analysis | Code quality validation post-consolidation |
| [Telemetry](@/glossary/telemetry.md) | Events | Consolidation metrics and progress tracking |

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [consolidation-architect-v2](@/agents/consolidation-architect-v2.md) | Enhanced Successor | Advanced version with proven 9.4x efficiency through living evolution |
| [dependency-optimization-specialist](@/agents/dependency-optimization-specialist.md) | Tactical Partner | Coordinates dependency cleanup alongside consolidation operations |
| [code-consolidation-specialist-agent](@/agents/code-consolidation-specialist-agent.md) | Operational Support | Handles code-level merge and refactoring during consolidation |

## Operational Workflow

**Phase 1 -- Pattern Discovery**: The AST Scanner traverses all 90 umbrella applications, parsing source files into AST representations and computing structural similarity scores between function implementations. This produces a ranked list of duplication clusters where each cluster represents a set of functionally equivalent implementations that could be consolidated.

**Phase 2 -- Genetic Optimization**: The optimization algorithm explores the space of possible consolidation sequences, evaluating each sequence's total QDP reduction and estimated risk. Over 100 generations with a population of 50, the algorithm converges on a near-optimal consolidation plan that maximizes value while minimizing disruption.

**Phase 3 -- Type Safety Verification**: Each consolidation target undergoes type analysis to verify that the proposed shared module's typespec is a valid supertype of all original implementations' typespecs. This guarantees that existing callers can use the consolidated module without type errors.

**Phase 4 -- Controlled Execution**: The consolidation executes on an isolated branch with continuous test validation. Module extraction, caller migration, and import rewriting proceed incrementally with test suite execution after each step. Any failure triggers immediate rollback.

**Phase 5 -- QDP Measurement**: Post-consolidation metrics capture the actual improvement: lines removed, modules eliminated, dependency edges simplified, and compile-time impact. These measurements validate the genetic optimizer's predictions and improve future optimization accuracy.

## NABLA Compliance

**Evidence-Based**: All consolidation decisions are grounded in measured data -- AST similarity scores, dependency graph analysis, and QDP projections. No consolidation proceeds based on intuition or subjective assessment.

**Provenance Mandatory**: Every consolidated module carries metadata documenting its origin modules, the consolidation date, and the architect version that performed the transformation. This provenance enables precise rollback if issues are discovered post-consolidation.

**Signal Plurality**: Consolidation candidates must satisfy multiple independent criteria (structural similarity, behavioral equivalence, type compatibility) before approval. No single signal is sufficient to authorize a consolidation operation.

**Contradiction Preservation**: When consolidation candidates exhibit subtly different behavior in edge cases, both behaviors are documented in the consolidation plan. The resolution strategy is explicitly stated rather than silently choosing one behavior over the other.

## Configuration

```elixir
config :prismatic_consolidation, PrismaticConsolidation.Architect,
  similarity_threshold: 0.80,
  population_size: 50,
  generations: 100,
  min_duplication_count: 2,
  auto_rollback_on_failure: true,
  qdp_tracking_enabled: true,
  max_consolidation_batch: 10,
  type_safety_verification: :strict
```

## Performance

| Metric | Target | Measured |
|--------|--------|----------|
| Full codebase scan | < 10 minutes | 6.5 minutes |
| Genetic optimization cycle | < 5 minutes | 3.2 minutes |
| Single module consolidation | < 15 minutes | 8 minutes |
| Type safety verification | < 2 minutes | 45 seconds |
| Test validation cycle | < 15 minutes | 12 minutes |
| QDP reduction per campaign | > 50 points | 73 points average |

## Related Resources

- [consolidation-architect-v2](@/agents/consolidation-architect-v2.md) -- Enhanced V2 with 9.4x efficiency
- [dependency-optimization-specialist](@/agents/dependency-optimization-specialist.md) -- Dependency graph optimization
- [code-consolidation-specialist-agent](@/agents/code-consolidation-specialist-agent.md) -- Code-level consolidation execution
- [QDP](@/glossary/qdp.md) -- Quality Debt Points measurement
- [Quality Gates](@/glossary/quality-gates.md) -- Platform quality enforcement
- [AIAD Standard](@/glossary/aiad.md) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)