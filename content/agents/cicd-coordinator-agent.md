+++
title = "CI/CD Coordinator Agent"
weight = 79
[extra]
domain = "cicd-orchestration"
level = "L3"
description = "Strategic coordinator for CI/CD pipeline orchestration across the Prismatic Platform, managing pipeline composition, stage sequencing, resource allocation, and cross-application build coordination for the 90-application umbrella architecture."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "lean4", "gitlab-ci", "umbrella-application", "genserver", "ets", "quality-gates"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["CICD", "Coordinator", "Agent", "Strategic", "Prismatic", "Platform", "90-application", "agents", "Prismatic Platform", "Pipeline"]
tags = ["agents", "agent", "ci-cd-coordinator-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "CI/CD Coordinator Agent - Prismatic Platform"
+++

## Executive Summary

The CI/CD Coordinator Agent operates as an L3 [strategic command](/glossary/strategic-command/) agent within the CI/CD Orchestration domain of the Prismatic Platform. This agent manages the full lifecycle of continuous integration and continuous deployment pipelines, coordinating pipeline composition, stage sequencing, resource allocation, and cross-application build coordination across the platform's 90-application [umbrella architecture](/glossary/umbrella-application/). In an ecosystem where a single commit can affect multiple applications with complex inter-dependencies, intelligent pipeline orchestration is essential for maintaining fast developer feedback loops while ensuring comprehensive quality validation.

The platform's CI/CD infrastructure processes hundreds of pipeline runs daily, each potentially spanning compilation, static analysis ([Credo](/glossary/credo/), [Dialyzer](/glossary/dialyzer/)), test execution, quality gate validation, and deployment staging. The CI/CD Coordinator Agent determines which pipeline stages are necessary for a given change set (avoiding full-platform builds for localized changes), parallelizes independent stages for throughput, and sequences dependent stages to ensure correct build order. This intelligent orchestration reduces average pipeline execution time while maintaining the platform's zero-compromise quality standards.

## Architecture

The CI/CD Coordinator implements a three-layer architecture spanning change analysis, pipeline composition, and execution monitoring.

```
+----------------------------------------------------------------------+
|         CI/CD Coordinator Agent (L3)                                 |
+----------------------------------------------------------------------+
|  Analysis Layer                                                       |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Change Detector    |  | Impact Analyzer    |  | Dependency Graph | |
|  | (Git diff parsing) |  | (App scope detect) |  | (Build order)    | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Pipeline Composer                                    |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  |  | Stage Builder |  | Parallel Planner |  | Resource Alloc.   |  |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Execution Monitor                                                    |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Stage Tracker      |  | Failure Analyzer   |  | Report Generator | |
|  | (Real-time status) |  | (Root cause detect)|  | (Summary output) | |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Analysis Layer examines incoming changes to determine their scope and impact across the umbrella application, builds a dependency graph for affected applications, and identifies the minimal build set required for comprehensive validation. The Pipeline Composer constructs optimized pipeline configurations with parallel stage groups and appropriate resource allocation. The Execution Monitor tracks pipeline progress in real-time, analyzes failures, and generates reports.

## Operational Domain

The CI/CD Orchestration domain manages the automated build, test, and deployment infrastructure for the Prismatic Platform. This domain intersects with code quality enforcement, deployment management, and developer experience. The CI/CD Coordinator serves as the central intelligence hub that translates code changes into appropriate pipeline configurations.

Pipeline orchestration in a 90-application umbrella requires sophisticated change impact analysis. A change to `prismatic_storage_core` (a foundational library) may require rebuilding and retesting 50+ dependent applications, while a change to a leaf application like `prismatic_visitor_intelligence` only requires local validation. The coordinator maintains a dependency graph derived from `mix.exs` configurations and uses it to compute minimal affected application sets for each change.

The domain also manages [GitLab CI](/glossary/gitlab-ci/) pipeline configuration generation, ensuring that generated configurations comply with the platform's strict YAML standards (10-level nesting limit, dash-prefixed commands, no heredocs) validated by the CI YAML Validator Agent.

## Core Capabilities

**Change Impact Analysis** examines Git diffs to determine which applications in the umbrella are affected by a change set. The analysis considers direct file changes, transitive dependency impacts through the application dependency graph, and configuration changes that may affect the build environment. The output is a minimal affected application set that determines pipeline scope.

**Pipeline Composition** constructs optimized CI pipeline configurations from the affected application set. Compilation stages for independent applications execute in parallel, while dependent applications are sequenced according to the dependency graph. Static analysis (Credo, Dialyzer) and test execution stages are parallelized within each application. The composer produces YAML-compliant pipeline configurations that pass all platform validation rules.

**Resource Allocation** assigns CI runner resources to pipeline stages based on their computational requirements and priority. Compilation and Dialyzer stages receive higher resource allocations due to their CPU-intensive nature, while test stages receive allocations scaled to their expected parallelism level. The allocator considers current runner capacity and queued pipeline load when making allocation decisions.

**Cross-Application Build Coordination** manages the build order for inter-dependent applications in the umbrella. When changes affect foundational libraries, the coordinator ensures that dependent applications rebuild against the updated library version, preventing stale compilation artifacts from masking compatibility issues.

**Pipeline Failure Analysis** examines failed pipeline stages to identify root causes, distinguishing between genuine code failures, infrastructure issues (runner availability, network failures), and flaky test behavior. Failure categorization enables appropriate retry strategies: infrastructure failures trigger automatic retry, while genuine failures require developer attention.

**Developer Feedback Optimization** minimizes the time between commit and quality feedback. The coordinator prioritizes fast-feedback stages (compilation, unit tests) before slow stages (Dialyzer, integration tests), enabling developers to learn about obvious failures within minutes while comprehensive validation continues in the background.

## Implementation

```elixir
defmodule PrismaticCI.Coordinator do
  @moduledoc """
  L3 Strategic Command agent coordinating CI/CD pipeline
  orchestration across the umbrella architecture.
  """

  use GenServer

  alias PrismaticCI.{ChangeAnalyzer, PipelineComposer, ExecutionMonitor}
  alias PrismaticCI.{DependencyGraph, ResourceAllocator}

  defstruct [
    :dependency_graph,
    :active_pipelines,
    :runner_capacity,
    :pipeline_history
  ]

  @spec compose_pipeline(map()) :: {:ok, map()} | {:error, term()}
  def compose_pipeline(change_set) do
    GenServer.call(__MODULE__, {:compose, change_set})
  end

  @impl true
  def handle_call({:compose, change_set}, _from, state) do
    with {:ok, affected} <- ChangeAnalyzer.affected_apps(change_set, state.dependency_graph),
         {:ok, stages} <- PipelineComposer.build_stages(affected, state.dependency_graph),
         {:ok, allocated} <- ResourceAllocator.allocate(stages, state.runner_capacity) do
      {:reply, {:ok, allocated}, state}
    else
      {:error, _reason} = error -> {:reply, error, state}
    end
  end
end
```

## Authority Level

**L3** -- Strategic Command -- Multi-domain coordination with authority over pipeline composition, stage sequencing, and resource allocation for all CI/CD operations across the platform.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [ci-yaml-validator-agent](/agents/ci-yaml-validator-agent/) | YAML Validation | Validates generated pipeline configurations against platform YAML standards |
| [cicd-guardrails-enforcer](/agents/cicd-guardrails-enforcer/) | Guardrail Enforcement | Ensures pipeline configurations enforce all required quality gates |
| [cicd-tooling-specialist](/agents/cicd-tooling-specialist/) | Tooling Management | Manages CI tooling versions and runner configurations |
| [code-quality-commander](/agents/code-quality-commander/) | Quality Authority | Defines quality gate requirements that pipelines must enforce |

## Operational Workflow

**Phase 1 -- Change Detection**: The coordinator receives change set information (commit diff, affected files, branch context) and begins impact analysis.

**Phase 2 -- Impact Analysis**: The dependency graph is consulted to determine the full set of affected applications, including transitive dependencies. The minimal build set is computed.

**Phase 3 -- Pipeline Composition**: Stage definitions are generated for the affected application set, with parallel groups identified and dependency-ordered sequences established. Resource requirements are estimated per stage.

**Phase 4 -- Configuration Generation**: The composed pipeline is rendered as GitLab CI YAML, validated against platform standards, and submitted for execution.

**Phase 5 -- Execution Monitoring**: Pipeline execution is tracked in real-time, with failure analysis applied to any failing stages. Summary reports are generated upon pipeline completion.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Change impact analysis latency | < 2s | 0.8s |
| Pipeline composition time | < 5s | 2.3s |
| Average pipeline execution time | < 15min | 11.2min |
| Unnecessary rebuild prevention | > 60% | 68% |
| Failure root cause accuracy | > 90% | 93% |
| Developer feedback time (fast stages) | < 3min | 2.1min |

## NABLA Compliance

**Signal Plurality**: Pipeline composition decisions draw from multiple signals: change scope, dependency graph structure, historical failure patterns, runner capacity, and quality gate requirements. No single signal determines the pipeline configuration.

**Provenance Mandatory**: Every generated pipeline configuration carries provenance including the change set that triggered it, the dependency graph version used, the composition algorithm applied, and the resource allocation decisions made. This enables debugging of unexpected pipeline behavior.

**Time Decay**: Dependency graph information is refreshed from `mix.exs` configurations on every pipeline composition, ensuring that stale dependency data does not cause incorrect impact analysis.

## Enforcement

CI/CD coordination operates under [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No pipeline configuration omits required quality gates. No change bypasses impact analysis. Pipeline compositions are evidence-based, derived from actual dependency graphs rather than heuristic approximations. Failed quality gates block progression to deployment stages without exception.

## Related Resources

- [ci-yaml-validator-agent](/agents/ci-yaml-validator-agent/) -- YAML configuration validation
- [cicd-guardrails-enforcer](/agents/cicd-guardrails-enforcer/) -- Guardrail consistency enforcement
- [cicd-tooling-specialist](/agents/cicd-tooling-specialist/) -- CI tooling management
- [Quality Gates](/capabilities/quality-gates/) -- Platform quality enforcement
- [AIAD Standard](/glossary/aiad/) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)