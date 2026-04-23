+++
title = "GitLab CI/CD"
weight = 68
[extra]
category = "architecture"
description = "Continuous integration and deployment pipeline for automated quality enforcement and production delivery"
related_terms = ["quality-gates", "pre-commit-hooks", "session-discipline", "docker", "fly-io", "release", "clean-run", "credo", "dialyzer"]
platform_relevance = "critical"
complexity = "intermediate"
domain = "devops"
layer = "infrastructure"
paradigm = "continuous-delivery"
pipeline_type = "declarative-yaml"
config_file = ".gitlab-ci.yml"
prismatic_usage = "primary-ci-cd-platform"
quality_impact = "foundational"
safety_level = "production"
documentation_required = true
testing_strategy = "pipeline-as-code"
deployment_targets = ["prismatic-staging.fly.dev", "prismatic-prod.fly.dev"]
runner_types = ["docker", "shell", "docker-in-docker"]
nesting_limit = 10
related_apps = ["prismatic", "prismatic_web", "prismatic_api", "prismatic_safety"]
milestones_tracked = 20
issues_tracked = "102+"
forbidden_yaml_patterns = ["literal-block", "folded-block", "heredoc"]
see_also = ["quality-gates", "clean-run", "pre-commit-hooks", "docker", "fly-io", "credo", "dialyzer"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1545
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["GitLab", "CICD", "Continuous", "glossary", "architecture", "Prismatic Platform", "YAML", "Platform"]
tags = ["glossary", "architecture", "gitlab-ci-cd", "prismatic"]
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "GitLab CI/CD - Prismatic Platform"
+++

## Definition and Overview

GitLab CI/CD is a continuous integration and continuous deployment platform integrated into GitLab that automates the testing, quality enforcement, and deployment of software through declarative pipeline configurations defined in `.gitlab-ci.yml`. Pipelines consist of stages (sequential groups of jobs), jobs (individual task executions), and runners (compute resources executing jobs). GitLab CI/CD provides built-in artifact management, caching, environment management, review apps, and deployment tracking, making it a comprehensive platform for automating the entire software delivery lifecycle from code commit to production deployment.

GitLab CI/CD distinguishes itself from standalone CI tools (Jenkins, CircleCI, GitHub Actions) through its tight integration with GitLab's version control, merge request workflow, issue tracking, and project management features. A single platform handles code hosting, code review, CI/CD execution, artifact storage, container registry, and deployment management. This integration eliminates the configuration complexity and synchronization challenges that arise when using separate tools for each function.

The pipeline is defined as code in `.gitlab-ci.yml`, stored in the repository root and versioned alongside the application code it validates. This approach ensures that pipeline configuration evolves with the codebase, enabling GitOps workflows where every aspect of the delivery process is tracked, reviewed, and auditable through git history. For the Prismatic Platform, GitLab CI serves as the authoritative enforcement layer for the [Clean Run](@/glossary/clean-run.md) standard, [quality gates](@/glossary/quality-gates.md), and production deployment.

## Historical Context and Evolution

GitLab CI was introduced as a separate project in 2012 and integrated into GitLab proper with version 8.0 in September 2015. This integration was a pivotal moment that established the "single application for the entire DevOps lifecycle" vision that differentiates GitLab from competitors. Before the integration, teams typically used Jenkins, Travis CI, or CircleCI alongside GitLab for version control, creating friction at the boundaries between tools.

The evolution of GitLab CI reflects broader industry trends. Early CI systems were imperative (Jenkins Pipelines), requiring developers to write code that described build steps. GitLab CI adopted a declarative approach (YAML configuration), where developers describe what they want (stages, jobs, conditions) rather than how to execute it. This declarative model is simpler to understand, version, and review, but introduces constraints -- particularly the YAML nesting limit that affects complex configurations.

The Prismatic Platform adopted GitLab CI as its primary CI/CD platform during the project's early stages, leveraging the platform's tight integration between issue tracking, merge requests, and pipeline execution. The choice was reinforced by the Session Discipline Protocol, which mandates GitLab issue tracking for every work session and requires continuous pipeline validation of all commits.

The platform's CI pipeline has evolved through multiple generations, from simple compile-and-test configurations to the current multi-stage pipeline that enforces zero-warning compilation, Credo static analysis, Dialyzer type checking, comprehensive test suites, quality gate validation, and staged deployment to [Fly.io](@/glossary/fly-io.md).

## Technical Deep Dive

### Pipeline Architecture

A GitLab CI pipeline is a directed acyclic graph (DAG) of stages and jobs. Jobs within a stage run in parallel; stages run sequentially. A stage begins only after all jobs in the previous stage succeed.

```
Pipeline
+-- Stage: compile
|     +-- Job: compile (mix compile --warnings-as-errors --force)
+-- Stage: analyze
|     +-- Job: credo (mix credo --strict)
|     +-- Job: dialyzer (mix dialyzer)
+-- Stage: test
|     +-- Job: test (mix test --cover)
+-- Stage: quality
|     +-- Job: quality_gates (mix quality.gates)
+-- Stage: deploy
      +-- Job: staging (fly deploy --app prismatic-staging)
      +-- Job: production (fly deploy --app prismatic-prod) [manual]
```

This structure ensures that expensive operations (testing, deployment) only run against code that has passed cheaper checks (compilation, linting). The parallel execution within the analyze stage reduces total pipeline duration by running Credo and Dialyzer concurrently.

### YAML Configuration Patterns

GitLab CI YAML has specific constraints that affect configuration design. The 10-level nesting limit is a GitLab-specific constraint that rejects configurations with deeper YAML structure.

| Pattern | Status | Rationale |
|---------|--------|-----------|
| `- command` | Required | Standard command syntax |
| `- 'cmd; cmd'` | Required | Multi-command in single line |
| `- \|` (literal block) | Forbidden | Exceeds nesting limit in complex configs |
| `- >-` (folded block) | Forbidden | Same nesting constraint |
| `<< EOF` (heredoc) | Forbidden | Not supported in YAML block context |
| Script files | Required for complex logic | `scripts/*.sh` extraction |

```yaml
# CORRECT: Simple commands in YAML, complex logic in scripts
stages:
  - compile
  - analyze
  - test
  - quality
  - deploy

variables:
  MIX_ENV: test
  POSTGRES_DB: prismatic_test
  POSTGRES_USER: postgres
  ELIXIR_VERSION: "1.19"

compile:
  stage: compile
  script:
    - mix deps.get
    - mix compile --warnings-as-errors --force
  cache:
    key: "${CI_COMMIT_REF_SLUG}-deps"
    paths:
      - deps/
      - _build/

credo:
  stage: analyze
  script:
    - mix credo --strict
  allow_failure: false

dialyzer:
  stage: analyze
  script:
    - mix dialyzer
  cache:
    key: "dialyzer-${CI_COMMIT_REF_SLUG}"
    paths:
      - priv/plts/dialyzer.plt

test:
  stage: test
  script:
    - mix test --cover
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: cover/cobertura.xml

quality_gates:
  stage: quality
  script:
    - mix quality.gates

deploy_staging:
  stage: deploy
  script:
    - scripts/deploy-staging.sh
  only:
    - main
  environment:
    name: staging
    url: https://prismatic-staging.fly.dev

deploy_production:
  stage: deploy
  script:
    - scripts/deploy-production.sh
  only:
    - main
  when: manual
  environment:
    name: production
    url: https://prismatic-prod.fly.dev
```

### Variables and Secrets

GitLab CI provides variable management for secrets and configuration. Protected variables are only available to protected branches and tags, preventing secret exposure in merge request pipelines from untrusted contributors.

```yaml
variables:
  MIX_ENV: test
  POSTGRES_DB: prismatic_test
  POSTGRES_USER: postgres

# Protected variables (set in GitLab UI, not in YAML)
# GITLAB_TOKEN: glpat-xxx (protected, masked)
# FLY_API_TOKEN: xxx (protected, masked)
# DATABASE_URL: xxx (protected, masked)
# SHODAN_API_KEY: xxx (protected, masked)
```

The Prismatic Platform follows strict security practices for CI variable management: no secrets in YAML files, all tokens as protected+masked variables, and environment-specific variables scoped to their deployment environments.

### Caching Strategy

Effective caching is critical for Elixir CI pipelines due to the compilation time of large umbrella projects. The Prismatic Platform's 115 umbrella applications would take 10+ minutes to compile from scratch without caching.

```yaml
# Global cache configuration
cache:
  key:
    files:
      - mix.lock
  paths:
    - deps/
    - _build/
    - priv/plts/

# Job-specific cache for Dialyzer PLTs
dialyzer:
  stage: analyze
  cache:
    key: "dialyzer-${CI_COMMIT_REF_SLUG}"
    paths:
      - priv/plts/dialyzer.plt
  script:
    - mix dialyzer
```

Using `mix.lock` as the cache key ensures that caches are invalidated when dependencies change, preventing stale dependency artifacts from causing mysterious build failures.

### Runner Configuration

GitLab runners execute pipeline jobs. The Prismatic Platform uses Docker-based runners for isolation and reproducibility.

| Runner Type | Use Case | Characteristics |
|-------------|----------|----------------|
| **Docker executor** | Standard CI jobs | Isolated container per job, reproducible |
| **Shell executor** | Deployment jobs | Direct host access for fly CLI, docker push |
| **Docker-in-Docker** | Container builds | Nested Docker for building release images |

## Architecture and Implementation

### Multi-Environment Deployment

```
+-----------------+     +-----------------+     +-----------------+
|    Developer     |     |    Staging       |     |   Production    |
|   Workstation    |     |                 |     |                 |
|                  |     | prismatic-      |     | prismatic-      |
| Pre-commit hooks |---->| staging.fly.dev |---->| prod.fly.dev    |
| Local validation |     |                 |     |                 |
+-----------------+     | Auto-deploy     |     | Manual trigger  |
        |                | from main       |     | after staging   |
        v                +-----------------+     +-----------------+
+-----------------+
|   GitLab CI     |
|                 |
| Full pipeline   |
| on every commit |
+-----------------+
```

### Pipeline Monitoring Implementation

```elixir
defmodule PrismaticCI.PipelineMonitor do
  @moduledoc """
  Monitors GitLab CI pipeline status and triggers quality enforcement.
  Provides programmatic access to pipeline results for quality
  floor guardian and session discipline tracking.
  """

  @gitlab_api "https://gitlab.com/api/v4"

  @spec check_pipeline_status(String.t(), integer()) :: {:ok, map()} | {:error, term()}
  def check_pipeline_status(project_id, pipeline_id) do
    url = "#{@gitlab_api}/projects/#{project_id}/pipelines/#{pipeline_id}"

    with {:ok, response} <- HTTPClient.get(url, auth_headers()),
         {:ok, data} <- Jason.decode(response.body) do
      {:ok, %{
        status: data["status"],
        duration: data["duration"],
        created_at: data["created_at"],
        stages: parse_stages(data)
      }}
    end
  end

  @spec get_failed_jobs(String.t(), integer()) :: {:ok, list(map())} | {:error, term()}
  def get_failed_jobs(project_id, pipeline_id) do
    url = "#{@gitlab_api}/projects/#{project_id}/pipelines/#{pipeline_id}/jobs"

    with {:ok, response} <- HTTPClient.get(url, auth_headers()),
         {:ok, jobs} <- Jason.decode(response.body) do
      failed = Enum.filter(jobs, &(&1["status"] == "failed"))
      {:ok, Enum.map(failed, fn job ->
        %{name: job["name"], stage: job["stage"], failure_reason: job["failure_reason"]}
      end)}
    end
  end

  @spec latest_pipeline_status(String.t()) :: {:ok, map()} | {:error, term()}
  def latest_pipeline_status(project_id) do
    url = "#{@gitlab_api}/projects/#{project_id}/pipelines?per_page=1&ref=main"

    with {:ok, response} <- HTTPClient.get(url, auth_headers()),
         {:ok, [latest | _]} <- Jason.decode(response.body) do
      check_pipeline_status(project_id, latest["id"])
    end
  end

  defp auth_headers do
    [{"PRIVATE-TOKEN", Application.get_env(:prismatic_ci, :gitlab_token)}]
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform uses GitLab CI as its primary CI/CD platform, enforcing quality across 115 umbrella applications with every commit.

### Pipeline Stages

| Stage | Jobs | Duration | Purpose |
|-------|------|----------|---------|
| **compile** | `mix compile --warnings-as-errors` | 60-120s | Zero-warning compilation ([Clean Run](@/glossary/clean-run.md)) |
| **analyze** | `mix credo --strict`, `mix dialyzer` | 120-300s | Static analysis (parallel) |
| **test** | `mix test --cover` | 60-180s | Full test suite with coverage |
| **quality** | `mix quality.gates` | 30-60s | 13-domain quality validation |
| **deploy** | `fly deploy` | 60-180s | Staging/production deployment |

### Milestone Tracking

The platform manages 20 milestones with 102+ issues through GitLab's project management.

| Milestone | Priority | Status | Key Deliverables |
|-----------|----------|--------|------------------|
| MVP Prismatic Perimeter | P0 | Complete | Security ratings, compliance |
| SPARKLINE Contract Lock | P0 | Complete | Canonicalization, contracts |
| Vision Analysis | P1 | Active | Safety-critical vision core |
| Czech Registry Autocrawler | P1 | Active | 3NL OSINT adapters |
| AI Drift MVP | P2 | Active | HR decision monitoring |

### Session Discipline Integration

GitLab CI integration is mandatory for session discipline. Every work session must create GitLab issues, commit and push continuously, ensure all CI pipelines pass, and update issues with progress.

```elixir
defmodule PrismaticSession.GitLabTracker do
  @moduledoc """
  Tracks session work through GitLab issues and pipeline monitoring.
  Enforces the mandatory session discipline protocol requiring
  continuous commits, pushes, and pipeline validation.
  """

  @spec create_session_issue(String.t(), String.t()) :: {:ok, integer()} | {:error, term()}
  def create_session_issue(title, description) do
    PrismaticCI.GitLabAPI.create_issue(%{
      title: title,
      description: description,
      labels: ["session-work", "automated"]
    })
  end

  @spec verify_pipeline_passing() :: :ok | {:error, :pipeline_failed}
  def verify_pipeline_passing do
    case PrismaticCI.PipelineMonitor.latest_pipeline_status(project_id()) do
      {:ok, %{status: "success"}} -> :ok
      {:ok, %{status: status}} -> {:error, {:pipeline_status, status}}
      error -> error
    end
  end

  @spec update_issue_progress(integer(), String.t()) :: :ok | {:error, term()}
  def update_issue_progress(issue_id, progress_note) do
    PrismaticCI.GitLabAPI.add_note(issue_id, progress_note)
  end

  defp project_id, do: Application.get_env(:prismatic_session, :gitlab_project_id)
end
```

### Artifact Management

GitLab CI artifacts preserve build outputs between jobs and after pipeline completion. The Prismatic Platform uses artifacts for test coverage reports, quality gate results, and deployment manifests.

```yaml
test:
  stage: test
  script:
    - mix test --cover
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: cover/cobertura.xml
    paths:
      - cover/
    expire_in: 30 days

quality_gates:
  stage: quality
  script:
    - mix quality.gates --json > quality-report.json
  artifacts:
    paths:
      - quality-report.json
    expire_in: 90 days
```

## Comparison with Alternatives

| Feature | GitLab CI | GitHub Actions | Jenkins | CircleCI |
|---------|-----------|----------------|---------|----------|
| **Integration** | Native (single platform) | Native (GitHub) | External | External |
| **Configuration** | YAML declarative | YAML declarative | Groovy/declarative | YAML declarative |
| **Issue tracking** | Built-in | Built-in | External | External |
| **Container registry** | Built-in | Built-in | Plugin | External |
| **Self-hosted option** | Yes (GitLab CE/EE) | Yes (Enterprise) | Yes (default) | No |
| **Pricing model** | Per-seat + minutes | Per-minute | Free (self-hosted) | Per-minute |
| **Nesting limit** | 10 levels | No explicit limit | No limit | No explicit limit |
| **DAG support** | Yes (needs) | Yes (needs) | Yes (native) | Yes |
| **Prismatic usage** | Primary | Mirror (GitHub Pages) | Not used | Not used |

## Advanced Patterns

### Conditional Pipeline Execution

```yaml
# Only run heavy analysis on merge requests and main branch
dialyzer:
  stage: analyze
  script:
    - mix dialyzer
  rules:
    - if: $CI_MERGE_REQUEST_ID
    - if: $CI_COMMIT_BRANCH == "main"
```

### Matrix Jobs

```yaml
# Test across multiple Elixir versions
test:
  stage: test
  parallel:
    matrix:
      - ELIXIR_VERSION: ["1.17", "1.18", "1.19"]
  image: "elixir:${ELIXIR_VERSION}"
  script:
    - mix test
```

### Dynamic Child Pipelines

For complex workflows that exceed the nesting limit, GitLab supports dynamic child pipelines generated at runtime.

```yaml
generate_pipeline:
  stage: prepare
  script:
    - scripts/generate-ci-config.sh > child-pipeline.yml
  artifacts:
    paths:
      - child-pipeline.yml

trigger_child:
  stage: execute
  trigger:
    include:
      - artifact: child-pipeline.yml
        job: generate_pipeline
```

## Best Practices

1. **Extract complex logic to scripts.** Keep `.gitlab-ci.yml` simple with short command lists. Move multi-step processes, conditional logic, and error handling into scripts under `scripts/`. This avoids YAML nesting limits and makes logic testable independently.

2. **Cache aggressively with smart keys.** Use `mix.lock` hash as cache key for dependency caches, and branch-specific keys for build caches. This ensures caches invalidate on dependency changes while remaining stable for repeated pushes to the same branch.

3. **Use staged deployment.** Always deploy to staging first, validate, then deploy to production. Configure production deployment as a manual trigger requiring explicit approval after staging verification.

4. **Parallelize independent jobs.** Run Credo and Dialyzer in parallel within the analyze stage rather than sequentially. This reduces total pipeline duration by running independent checks concurrently.

5. **Monitor pipeline metrics.** Track pipeline duration trends, failure rates, and flaky job frequency. A gradually slowing pipeline indicates accumulating technical debt in tests or dependencies.

6. **Never commit secrets.** Use GitLab CI variables (Settings > CI/CD > Variables) with protected and masked flags. Never place API keys, tokens, or credentials in `.gitlab-ci.yml`.

7. **Restrict deployment to protected branches.** Deployment jobs should run only from protected branches (typically `main`). Without this restriction, any branch push could trigger an unintended deployment.

## Common Pitfalls

- **YAML nesting beyond 10 levels.** GitLab silently rejects configurations exceeding the nesting limit. Complex nested conditions and includes can hit this limit. Flatten configuration with includes and extract logic to scripts.

- **Ignoring CI cache invalidation.** Stale caches cause false successes (passing with old dependencies) or mysterious failures. Ensure cache keys change when dependencies change, and periodically clear caches to verify clean builds.

- **Missing artifact configuration.** Without artifact declarations, test results, coverage reports, and build outputs are lost after job completion. Configure artifacts for anything needed by downstream jobs or developers.

- **Slow feedback loops.** A 30-minute pipeline provides feedback too late. Optimize by parallelizing independent jobs, caching aggressively, and running expensive checks (Dialyzer) only on merge requests and main.

- **Flaky tests in CI.** Tests that pass locally but fail intermittently in CI create distrust in the pipeline. Investigate and fix flaky tests immediately -- they are a quality debt that compounds over time.

## Related Concepts

- [Quality Gates](@/glossary/quality-gates.md) -- Enforcement pipeline executed within CI on every commit
- [Clean Run](@/glossary/clean-run.md) -- Zero-warning compilation standard enforced in CI pipeline
- [Credo](@/glossary/credo.md) -- Static analysis tool running in the CI analyze stage
- [Dialyzer](@/glossary/dialyzer.md) -- Type analysis tool running in the CI analyze stage
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) -- Local enforcement complementing server-side CI checks
- [Docker](@/glossary/docker.md) -- Container technology powering CI runners and deployment images
- [Fly.io](@/glossary/fly-io.md) -- Deployment target for staging and production environments
- [Continuous Integration](@/glossary/continuous-integration.md) -- Development practice that GitLab CI implements
- [GitOps](@/glossary/gitops.md) -- Operational framework using git-driven CI/CD pipelines

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Umbrella applications validated by the CI pipeline

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
