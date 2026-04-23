+++
title = "CI/CD"
weight = 50
[extra]
tags = ["glossary", "ci", "cd", "devops", "automation", "pipeline", "deployment", "quality", "pre-commit", "gitlab"]
description = "Continuous Integration and Continuous Deployment -- automated pipeline for building, testing, and deploying software with 11-phase pre-commit quality enforcement and Fly.io production deployment"
category = "devops"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "DevOps & Infrastructure"
related_concepts = ["continuous-integration", "continuous-deployment", "gitlab-ci", "pre-commit-hooks", "quality-gate", "clean-run", "fly-io"]
implementation_status = "production"
authority_level = "L2 Tactical"
difficulty_rating = 5
prerequisites = ["quality-gate", "compilation", "mix-task"]
learning_path = "fundamentals -> testing -> ci-cd -> deployment -> production"
interactive_demos = ["/labs/glossary/ci-cd"]
code_examples = ["elixir", "yaml", "bash"]
external_resources = ["https://docs.gitlab.com/ee/ci/", "https://fly.io/docs/elixir/", "https://hexdocs.pm/mix/Mix.html"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["pipeline-execution", "hook-enforcement", "deployment-validation", "rollback-verification"]
keywords = ["CI/CD", "continuous integration", "continuous deployment", "GitLab CI", "pre-commit hooks", "quality gates", "Fly.io", "pipeline", "automation", "11-phase"]
related_terms = ["continuous-integration", "continuous-deployment", "gitlab-ci", "pre-commit-hooks", "quality-gate", "clean-run", "fly-io", "docker", "credo", "dialyzer", "zero-tolerance-quality"]
word_count = 1464
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "CI/CD - Prismatic Platform"
+++

## Definition

**CI/CD** (Continuous Integration / Continuous Deployment) refers to the automated pipeline infrastructure that builds, tests, validates, and deploys software changes. In the Prismatic Platform, CI/CD encompasses an 11-phase local pre-commit hook system, GitLab CI/CD remote pipelines, comprehensive quality gates, and automated deployment to Fly.io staging and production environments. The system enforces the [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) doctrine by blocking any change that does not pass all quality, testing, and compliance checks -- with zero exceptions and no bypass flags permitted.

The CI/CD pipeline is the enforcement backbone of the platform's [zero tolerance](@/glossary/zero-tolerance.md) quality standard, ensuring that every commit to the repository is production-ready from the moment of creation.

## Overview

Continuous Integration is the practice of frequently merging code changes into a shared repository, where automated builds and tests verify each integration. Continuous Deployment extends this by automatically deploying verified changes to production environments. Together, they form a pipeline that transforms code changes into running production software with minimal human intervention.

The Prismatic Platform's CI/CD system is distinctive in several ways:

1. **11-Phase Local Pre-Commit**: Unlike most CI/CD systems that only run remotely, Prismatic enforces quality at the local level through an 11-phase pre-commit hook that runs before any code reaches the repository.

2. **Zero Bypass Policy**: The `--no-verify` flag is absolutely forbidden. Every commit must pass all hooks. This is a P0 absolute enforcement -- violation triggers L4 Supreme Review.

3. **Quality Gate Integration**: The CI/CD pipeline integrates with the platform's quality gate system (`mix quality.gates`), which checks compilation warnings, [Credo](@/glossary/credo.md) compliance, [Dialyzer](@/glossary/dialyzer.md) analysis, test coverage, and 13 additional quality domains.

4. **Dual-Target Deployment**: The pipeline deploys to both staging (`prismatic-staging.fly.dev`) and production (`prismatic-prod.fly.dev`) on Fly.io, with mandatory staging validation before production promotion.

5. **Immutable Audit Trail**: Every pipeline execution, gate check, and deployment decision is logged and traceable through telemetry events.

## Technical Details

### 11-Phase Pre-Commit Hook System

The local pre-commit hook (`.githooks/pre-commit`) enforces quality before code leaves the developer's machine:

| Phase | Name | Check | Enforcement |
|-------|------|-------|-------------|
| 1 | **Compilation** | `mix compile --warnings-as-errors` | BLOCK on any warning |
| 2 | **Formatting** | `mix format --check-formatted` | BLOCK on formatting violations |
| 3 | **Credo** | `mix credo --strict` | BLOCK on any Credo issue |
| 4 | **Tests** | `mix test` (affected files) | BLOCK on any test failure |
| 5 | **Dialyzer** | `mix dialyzer` (incremental) | BLOCK on type violations |
| 6 | **Forbidden Patterns** | `mix quality.forbidden_patterns` | BLOCK on mocks/stubs/placeholders |
| 7 | **Security Scan** | Secrets detection, credential scanning | BLOCK on any detection |
| 8 | **Template Validation** | `scripts/validate-promo-templates.sh` | BLOCK on invalid templates |
| 9 | **Quality Gates** | `mix quality.gates` | BLOCK on gate failure |
| 10 | **Design Consistency** | `scripts/validate-design-consistency.sh` | BLOCK on design violations |
| 11 | **QDP Verification** | Quality Debt Points check | BLOCK if quota not met |

### GitLab CI/CD Pipeline

The remote pipeline extends local checks with integration testing, deployment, and monitoring:

```yaml
# .gitlab-ci.yml (simplified structure -- actual uses script extraction pattern)
stages:
  - validate
  - build
  - test
  - quality
  - security
  - deploy_staging
  - verify_staging
  - deploy_production
  - monitor

validate:
  stage: validate
  script:
    - mix deps.get
    - mix compile --warnings-as-errors --force
    - mix format --check-formatted

build:
  stage: build
  script:
    - mix deps.compile
    - mix assets.build

test:
  stage: test
  script:
    - mix test --cover
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: cover/cobertura.xml

quality:
  stage: quality
  script:
    - mix credo --strict
    - mix dialyzer
    - mix quality.gates
    - mix quality.forbidden_patterns

deploy_staging:
  stage: deploy_staging
  script:
    - fly deploy --app prismatic-staging
  environment:
    name: staging
    url: https://prismatic-staging.fly.dev

deploy_production:
  stage: deploy_production
  script:
    - fly deploy --app prismatic-prod
  environment:
    name: production
    url: https://prismatic-prod.fly.dev
  when: manual
  only:
    - main
```

### Elixir Pipeline Orchestration

The CI/CD pipeline is also represented as an Elixir module for programmatic orchestration:

```elixir
defmodule PrismaticCI.Pipeline do
  @moduledoc """
  Orchestrates the CI/CD pipeline phases for the Prismatic Platform.
  Provides programmatic access to pipeline state, phase execution,
  and deployment coordination with full telemetry integration.
  """

  use GenServer

  alias PrismaticCI.{PhaseRunner, QualityGate, DeploymentManager}

  @type phase :: atom()
  @type phase_result :: {:ok, map()} | {:error, phase(), term()}
  @type pipeline_state :: :idle | :running | :passed | :failed | :deploying

  @phases [
    :compilation,
    :formatting,
    :credo,
    :tests,
    :dialyzer,
    :forbidden_patterns,
    :security_scan,
    :template_validation,
    :quality_gates,
    :design_consistency,
    :qdp_verification
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Executes all pipeline phases sequentially.
  Returns {:ok, results} if all phases pass, {:error, phase, reason} on first failure.
  """
  @spec run_all() :: {:ok, [phase_result()]} | {:error, phase(), term()}
  def run_all do
    GenServer.call(__MODULE__, :run_all, :infinity)
  end

  @doc """
  Executes a single pipeline phase.
  """
  @spec run_phase(phase()) :: phase_result()
  def run_phase(phase) when phase in @phases do
    GenServer.call(__MODULE__, {:run_phase, phase}, 300_000)
  end

  @doc """
  Returns the current pipeline state including phase results and timing.
  """
  @spec status() :: %{state: pipeline_state(), phases: map(), elapsed_ms: non_neg_integer()}
  def status do
    GenServer.call(__MODULE__, :status)
  end

  @impl GenServer
  def init(opts) do
    state = %{
      pipeline_state: :idle,
      phase_results: %{},
      started_at: nil,
      config: Keyword.get(opts, :config, %{})
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_call(:run_all, _from, state) do
    started_at = System.monotonic_time(:millisecond)
    updated_state = %{state | pipeline_state: :running, started_at: started_at}

    :telemetry.execute(
      [:prismatic_ci, :pipeline, :start],
      %{phase_count: length(@phases)},
      %{phases: @phases}
    )

    result = execute_phases(@phases, %{})

    final_state =
      case result do
        {:ok, results} ->
          elapsed = System.monotonic_time(:millisecond) - started_at

          :telemetry.execute(
            [:prismatic_ci, :pipeline, :complete],
            %{elapsed_ms: elapsed, phase_count: length(@phases)},
            %{results: results}
          )

          %{updated_state | pipeline_state: :passed, phase_results: results}

        {:error, phase, reason} ->
          :telemetry.execute(
            [:prismatic_ci, :pipeline, :failure],
            %{failed_phase: phase},
            %{reason: reason}
          )

          %{updated_state | pipeline_state: :failed}
      end

    {:reply, result, final_state}
  end

  @impl GenServer
  def handle_call({:run_phase, phase}, _from, state) do
    result = PhaseRunner.execute(phase, state.config)
    updated_results = Map.put(state.phase_results, phase, result)
    {:reply, result, %{state | phase_results: updated_results}}
  end

  @impl GenServer
  def handle_call(:status, _from, state) do
    elapsed =
      case state.started_at do
        nil -> 0
        started -> System.monotonic_time(:millisecond) - started
      end

    status = %{
      state: state.pipeline_state,
      phases: state.phase_results,
      elapsed_ms: elapsed
    }

    {:reply, status, state}
  end

  defp execute_phases([], results), do: {:ok, results}

  defp execute_phases([phase | remaining], results) do
    case PhaseRunner.execute(phase, %{}) do
      {:ok, phase_result} ->
        execute_phases(remaining, Map.put(results, phase, {:ok, phase_result}))

      {:error, reason} ->
        {:error, phase, reason}
    end
  end
end
```

### Deployment Architecture

The deployment flow follows a strict promotion model:

```
Local Developer Machine
    │
    ├── Pre-commit (11 phases) ──── BLOCK if any phase fails
    │
    └── git push
         │
         └── GitLab CI/CD
              │
              ├── validate ──── Compilation, formatting
              ├── build ──── Dependencies, assets
              ├── test ──── Full test suite + coverage
              ├── quality ──── Credo, Dialyzer, gates
              ├── security ──── Vulnerability scanning
              │
              ├── deploy_staging ──── prismatic-staging.fly.dev
              ├── verify_staging ──── Smoke tests, health checks
              │
              └── deploy_production ──── prismatic-prod.fly.dev (manual gate)
                   │
                   └── monitor ──── Telemetry, health, performance
```

### Performance Requirements

All CI/CD operations must meet strict performance targets:

| Operation | Hard Limit | Typical | Enforcement |
|-----------|-----------|---------|-------------|
| Pre-commit (all 11 phases) | < 120 seconds | ~45 seconds | Timeout abort |
| Full CI pipeline | < 15 minutes | ~8 minutes | Pipeline timeout |
| Staging deployment | < 5 minutes | ~2 minutes | Deployment timeout |
| Production deployment | < 5 minutes | ~2 minutes | Deployment timeout |
| Health check post-deploy | < 10ms | ~3ms | Performance gate |
| Page load post-deploy | < 250ms | ~80ms | Performance gate |

### GitLab CI YAML Constraints

The Prismatic Platform enforces specific YAML patterns to prevent GitLab CI failures:

| Pattern | Status | Reason |
|---------|--------|--------|
| `- command` | Required | Standard script format |
| `- 'cmd; cmd'` | Required | Multi-command on single line |
| `- \|` (literal block) | Forbidden | GitLab nesting depth issues |
| `- >-` (folded block) | Forbidden | Unpredictable parsing |
| `<< EOF` (heredoc) | Forbidden | Not supported in CI context |
| 10+ nesting levels | Forbidden | GitLab hard limit |

Complex logic must be extracted to shell scripts in `scripts/` rather than inlined in YAML.

## Implementation in Prismatic Platform

The CI/CD system is deeply integrated across the platform:

**Pre-Commit Infrastructure**: The `.githooks/pre-commit` script implements all 11 phases with individual timing, colored output, and clear failure messages. It is installed via `git config core.hooksPath .githooks`.

**Quality Gate Integration**: The `mix quality.gates` task aggregates results from compilation, Credo, Dialyzer, test coverage, forbidden patterns, and 13 quality domains. It produces a machine-readable exit code (0 = pass, 1 = fail) for CI integration.

**Fly.io Deployment**: Production deployment uses multi-stage Docker builds with Alpine-based images. The `fly.toml` configuration defines health checks, auto-scaling, and region distribution. Deployments are blue-green with automatic rollback on health check failure.

**Telemetry Integration**: Pipeline events are emitted through `:telemetry` for monitoring: `[:prismatic_ci, :pipeline, :start | :complete | :failure]`, `[:prismatic_ci, :phase, :start | :complete | :failure]`, `[:prismatic_ci, :deploy, :start | :complete | :rollback]`.

**Session Discipline**: The [Mandatory Session Discipline Protocol](@/glossary/clean-run.md) requires continuous commits pushed to remote during every work session. The CI/CD pipeline validates every push, ensuring no untested code accumulates.

## Comparison with Alternatives

| Platform | Local Enforcement | Quality Depth | Elixir Support | Deployment | Prismatic Fit |
|----------|------------------|---------------|----------------|------------|---------------|
| **GitLab CI/CD** (Prismatic) | 11-phase pre-commit | 13 quality domains | Native (mix tasks) | Fly.io blue-green | Native |
| **GitHub Actions** | Limited (pre-commit framework) | Configurable | Good (community actions) | Various | Alternative |
| **Jenkins** | Plugin-based | Deep but complex | Plugin required | Various | Legacy |
| **CircleCI** | None built-in | Orb-based | Community orbs | Various | Alternative |
| **Buildkite** | Agent-based | Custom pipelines | Custom | Various | Specialized |

The key differentiator for Prismatic is the 11-phase local pre-commit system. Most CI/CD platforms only provide remote pipeline execution, meaning broken code can reach the repository before being caught. Prismatic catches issues before the commit is even created.

## Best Practices

1. **Never Bypass Hooks**: The `--no-verify` flag is absolutely forbidden. If hooks are failing, fix the underlying issue rather than bypassing the check.

2. **Atomic Commits**: Each commit should represent a single logical change that passes all 11 phases independently. Do not batch unrelated changes.

3. **Fast Feedback Loop**: Keep the pre-commit phases fast by using incremental Dialyzer, targeted test execution, and cached compilation. The 120-second hard limit enforces this.

4. **Script Extraction**: Complex CI logic belongs in shell scripts (`scripts/`), not inline YAML. This improves testability, readability, and avoids GitLab nesting limits.

5. **Staging Before Production**: Always validate changes on staging before promoting to production. Automated smoke tests on staging catch integration issues that local tests miss.

6. **Monitor Post-Deploy**: Production deployments must be followed by health check verification and performance monitoring. Automated rollback triggers on health check failure.

7. **Version Pin Dependencies**: Lock dependency versions in `mix.lock` to ensure reproducible builds across local and CI environments.

## Common Pitfalls

1. **Slow Pre-Commit**: Adding expensive operations (full Dialyzer rebuild, entire test suite) to pre-commit. Use incremental and targeted approaches to keep pre-commit under 120 seconds.

2. **Environment Drift**: Local development environment diverging from CI environment. Use Docker for parity or ensure Elixir/Erlang versions match exactly.

3. **Flaky Tests**: Tests that pass locally but fail in CI (or vice versa) due to timing, ordering, or environment dependencies. Use `--seed 0` for debugging and ensure test isolation.

4. **Secret Leakage**: Accidentally committing API keys, tokens, or credentials. Phase 7 (Security Scan) catches this, but prevention through `.gitignore` and environment variables is better than detection.

5. **YAML Nesting**: Exceeding GitLab's 10-level nesting limit with complex conditional logic. Extract to scripts immediately when nesting approaches 5 levels.

6. **Missing Rollback Plan**: Deploying to production without a tested rollback procedure. Fly.io supports instant rollback to previous releases -- ensure this is documented and tested.

## Use Cases

### Feature Development Workflow

A developer creates a feature branch, implements changes, and attempts to commit. The 11-phase pre-commit runs compilation, formatting, Credo, targeted tests, incremental Dialyzer, and quality gates. If any phase fails, the commit is blocked with a clear error message. Once all phases pass locally, the push triggers the full GitLab CI pipeline for integration validation.

### Emergency Hotfix

A critical production bug requires immediate patching. The developer creates a fix branch, applies the minimal change, runs the pre-commit (which validates the fix does not introduce regressions), pushes to GitLab, and triggers an expedited pipeline that fast-tracks through staging verification to production deployment. Even in emergencies, all 11 phases must pass -- there are no shortcuts.

### Quality Debt Elimination

The platform maintains zero Quality Debt Points (QDP). When a commit introduces a new Credo issue or compilation warning, the pre-commit blocks it immediately. The developer must either fix the issue or, if it requires broader refactoring, create a GitLab issue and address it before the session ends.

### Multi-App Umbrella Changes

When a change spans multiple umbrella applications, the CI pipeline validates cross-app compilation, runs integration tests, and checks for [circular dependencies](@/glossary/circular-dependency.md). The quality gates ensure that changes in one app do not degrade quality in dependent apps.

## Related Concepts

- [Continuous Integration](@/glossary/continuous-integration.md) -- The "CI" half: frequent merging with automated validation
- [Continuous Deployment](@/glossary/continuous-deployment.md) -- The "CD" half: automated deployment to production
- [GitLab CI](@/glossary/gitlab-ci.md) -- The specific CI/CD platform used by Prismatic
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) -- Local enforcement mechanism for the 11-phase system
- [Quality Gate](@/glossary/quality-gate.md) -- Automated quality checkpoints within the pipeline
- [Clean Run](@/glossary/clean-run.md) -- Zero warnings, zero errors compilation standard
- [Fly.io](@/glossary/fly-io.md) -- Production hosting platform for deployments
- [Docker](@/glossary/docker.md) -- Container technology for reproducible builds
- [Credo](@/glossary/credo.md) -- Static analysis tool enforced in Phase 3
- [Dialyzer](@/glossary/dialyzer.md) -- Type checking tool enforced in Phase 5
- [Zero Tolerance Quality](@/glossary/zero-tolerance-quality.md) -- The quality standard that CI/CD enforces

## See Also

- [Mix Task](@/glossary/mix-task.md) -- Elixir build tool tasks used in pipeline phases
- [Compilation](@/glossary/compilation.md) -- Phase 1 of the pre-commit pipeline
- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) -- Doctrine enforced through CI/CD
- [Umbrella Application](@/glossary/umbrella-application.md) -- Architecture validated by the pipeline

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
