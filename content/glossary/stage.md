+++
title = "Stage"
weight = 50
[extra]
description = "CI/CD pipeline execution phase that groups related jobs and enforces sequential ordering between build, test, and deploy operations"
category = "devops"
related_terms = ["ci-cd", "pipeline", "gitlab", "deployment", "testing", "quality-gates"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["stage", "CI/CD", "pipeline", "GitLab", "build", "deploy", "glossary", "Prismatic Platform"]
tags = ["glossary", "devops", "ci-cd"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Stage - Prismatic Platform"
+++

## Definition & Overview

A stage is a logical phase in a CI/CD pipeline that groups related jobs and enforces execution ordering. Stages run sequentially: all jobs in stage N must complete successfully before any job in stage N+1 begins. Within a single stage, jobs can run in parallel, maximizing pipeline throughput while maintaining the correctness guarantees that sequential ordering provides. Common stages include build, test, analyze, deploy-staging, and deploy-production.

Stages represent the fundamental structure of automated software delivery. They encode the invariant that code must compile before it can be tested, must pass tests before it can be analyzed for quality, and must pass quality gates before it can be deployed. Without stages, a pipeline would be either purely sequential (slow) or purely parallel (unsafe). Stages provide the middle ground: maximum parallelism within phases, guaranteed ordering between phases.

In the Prismatic Platform, stages enforce the NO MERCY quality doctrine at the CI/CD level. The pipeline's stage structure ensures that code cannot reach production without passing compilation with zero warnings, all test suites, static analysis (Dialyzer, Credo), quality gate checks, and performance benchmarks. Each stage acts as a gate: failure at any stage stops the pipeline, preventing flawed code from progressing further.

## Technical Deep Dive

### GitLab CI Stage Definition

The Prismatic Platform uses GitLab CI/CD with a multi-stage pipeline:

```yaml
# .gitlab-ci.yml (simplified)
stages:
  - build
  - test
  - analyze
  - quality
  - deploy-staging
  - deploy-production

build:compile:
  stage: build
  script:
    - mix deps.get
    - mix compile --warnings-as-errors --force
  artifacts:
    paths:
      - _build/
      - deps/

test:unit:
  stage: test
  script:
    - mix test --cover
  needs:
    - build:compile

test:integration:
  stage: test
  script:
    - mix test --only integration
  needs:
    - build:compile

analyze:dialyzer:
  stage: analyze
  script:
    - mix dialyzer
  needs:
    - build:compile

analyze:credo:
  stage: analyze
  script:
    - mix credo --strict
  needs:
    - build:compile

quality:gates:
  stage: quality
  script:
    - mix quality.gates
    - mix quality.forbidden_patterns
  needs:
    - test:unit
    - test:integration
    - analyze:dialyzer
    - analyze:credo

deploy:staging:
  stage: deploy-staging
  script:
    - fly deploy --app prismatic-staging
  needs:
    - quality:gates
  only:
    - main

deploy:production:
  stage: deploy-production
  script:
    - fly deploy --app prismatic-prod
  needs:
    - deploy:staging
  only:
    - main
  when: manual
```

### Stage Orchestration in Elixir

The platform also uses stage-like patterns internally for multi-phase operations like the DD pipeline:

```elixir
defmodule PrismaticDd.Pipeline do
  @moduledoc """
  Multi-stage DD pipeline execution.
  Each stage must complete successfully before the next begins.
  """

  @type stage :: :fetch | :normalize | :deduplicate | :load | :verify

  @stages [:fetch, :normalize, :deduplicate, :load, :verify]

  @spec execute(atom(), keyword()) :: {:ok, map()} | {:error, {stage(), term()}}
  def execute(source_group, opts \\ []) do
    initial_context = %{
      source_group: source_group,
      started_at: DateTime.utc_now(),
      stage_results: %{}
    }

    Enum.reduce_while(@stages, {:ok, initial_context}, fn stage, {:ok, context} ->
      case execute_stage(stage, context, opts) do
        {:ok, result} ->
          updated = put_in(context.stage_results[stage], result)
          {:cont, {:ok, updated}}

        {:error, reason} ->
          {:halt, {:error, {stage, reason}}}
      end
    end)
  end

  defp execute_stage(:fetch, %{source_group: group}, _opts) do
    PrismaticDd.Client.fetch_group(group)
  end

  defp execute_stage(:normalize, %{stage_results: %{fetch: records}}, _opts) do
    normalized = Enum.map(records, &PrismaticDd.Normalizer.normalize/1)
    errors = Enum.filter(normalized, &match?({:error, _}, &1))

    if Enum.empty?(errors) do
      {:ok, Enum.map(normalized, fn {:ok, r} -> r end)}
    else
      {:error, {:normalization_failures, length(errors)}}
    end
  end

  defp execute_stage(:deduplicate, %{stage_results: %{normalize: records}}, _opts) do
    PrismaticDd.Deduplicator.deduplicate(records)
  end

  defp execute_stage(:load, %{stage_results: %{deduplicate: records}}, _opts) do
    PrismaticDd.Loader.load_batch(records)
  end

  defp execute_stage(:verify, %{stage_results: %{load: load_run}}, _opts) do
    PrismaticDd.Verifier.verify_run(load_run)
  end
end
```

### Pre-Commit Hook Stages

The local pre-commit hook also follows a staged execution model:

```elixir
defmodule PrismaticQuality.PreCommitStages do
  @moduledoc """
  11-phase pre-commit pipeline. Each phase is a stage
  that must pass before the next executes.
  """

  @phases [
    {1, "Compilation", &compile_check/0},
    {2, "Warnings", &warnings_check/0},
    {3, "Dialyzer", &dialyzer_check/0},
    {4, "Credo", &credo_check/0},
    {5, "Tests", &test_check/0},
    {6, "Quality Gates", &quality_gates_check/0},
    {7, "Forbidden Patterns", &forbidden_patterns_check/0},
    {8, "Templates", &template_validation/0},
    {9, "Performance", &performance_check/0},
    {10, "Design Consistency", &design_check/0},
    {11, "Final Verification", &final_check/0}
  ]

  @spec run_all() :: :ok | {:error, {pos_integer(), String.t()}}
  def run_all do
    Enum.reduce_while(@phases, :ok, fn {phase_num, name, check_fn}, :ok ->
      case check_fn.() do
        :ok -> {:cont, :ok}
        {:error, reason} -> {:halt, {:error, {phase_num, "Phase #{phase_num} (#{name}) failed: #{reason}"}}}
      end
    end)
  end
end
```

## Architecture & Implementation

The stage concept in the Prismatic Platform operates at three levels. At the CI/CD level, GitLab CI stages enforce the build-test-analyze-deploy ordering across the entire codebase. At the application level, multi-phase pipelines (DD, OSINT batch operations) use stage patterns for sequential processing. At the development level, pre-commit hooks execute 11 phases of quality checks before allowing a commit.

Each level shares the same core property: stages are fail-fast. When a stage fails, all subsequent stages are skipped. This prevents wasted computation (no point running quality gates if compilation failed) and provides clear, actionable feedback about where the failure occurred.

The GitLab CI configuration follows mandatory YAML patterns: no multi-line scalars (no `|` or `>-`), no heredocs, maximum 10-level nesting. Complex logic is extracted to shell scripts in `scripts/`. This keeps the CI configuration maintainable and avoids GitLab's YAML parsing edge cases.

## Usage in Prismatic Platform

Stages govern every path from code change to production deployment:

```elixir
# Execute DD pipeline through all stages
{:ok, result} = PrismaticDd.Pipeline.execute(:forbes)

# Check which stage failed
{:error, {:normalize, reason}} = PrismaticDd.Pipeline.execute(:broken_source)
```

## Cross-References

- [CI/CD](@/glossary/ci-cd.md) - Continuous integration/delivery system using stages
- [Quality Gates](@/glossary/quality-gates.md) - Automated checks enforced at stage boundaries
- [Pipeline](@/glossary/pipeline.md) - Multi-stage execution flow
- [Deployment](@/glossary/deployment.md) - Final stage delivering code to production

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
