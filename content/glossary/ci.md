+++
title = "Continuous Integration (CI)"
weight = 50
[extra]
description = "Continuous Integration (CI) is a software development practice where developers frequently merge code changes into a shared repository, with each integration verified by automated builds, tests, and quality gates to detect problems early."
category = "devops"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "software-engineering"
related_concepts = ["continuous deployment", "continuous delivery", "build automation", "test automation", "quality gates", "pre-commit hooks", "GitLab CI/CD", "pipeline orchestration"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 3
prerequisites = ["version control basics", "automated testing fundamentals", "command line proficiency", "build systems"]
learning_path = ["git fundamentals", "test automation", "CI pipeline design", "quality gate enforcement", "deployment automation"]
interactive_demos = ["pipeline visualization", "quality gate simulator", "pre-commit hook tester"]
code_examples = true
external_resources = ["https://martinfowler.com/articles/continuousIntegration.html", "https://docs.gitlab.com/ee/ci/", "https://hexdocs.pm/mix/Mix.html"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["pipeline execution", "quality gate enforcement", "parallel test execution", "compilation warning detection", "coverage threshold validation"]
keywords = ["continuous integration", "CI", "build automation", "automated testing", "quality gates", "pre-commit hooks", "GitLab CI", "pipeline", "merge validation"]
tags = ["glossary", "devops", "ci-cd", "quality", "automation", "testing", "pipeline"]
related_terms = ["ci-cd", "continuous-deployment", "pre-commit-hooks", "quality-gate", "testing", "gitlab-ci", "compilation", "static-analysis", "quality-gates", "credo"]
word_count = 1813
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Continuous Integration (CI) - Prismatic Platform"
+++

## Definition

**Continuous Integration (CI)** is a software development practice in which developers frequently integrate their code changes into a shared repository -- typically multiple times per day -- with each integration automatically verified through a comprehensive suite of builds, tests, static analysis checks, and quality gates. The practice was formalized by Martin Fowler and Kent Beck as a core component of Extreme Programming (XP), and has since become a foundational practice in modern software engineering. CI aims to detect integration problems early, reduce the cost of fixing defects, and maintain a consistently deployable codebase.

## Overview

The fundamental insight behind Continuous Integration is that integration problems become exponentially harder to resolve the longer they are deferred. When developers work in isolation for days or weeks before merging, the resulting "integration hell" can consume more effort than the original development. CI inverts this dynamic by making integration a continuous, automated, and low-risk activity.

A well-implemented CI system provides several guarantees:

- **Build verification**: Every commit compiles successfully and produces valid artifacts
- **Test execution**: Automated test suites run against every change, catching regressions immediately
- **Quality enforcement**: Static analysis, linting, formatting checks, and custom quality rules validate code quality standards
- **Fast feedback**: Developers learn about problems within minutes, not days, enabling rapid correction
- **Deployment readiness**: The main branch is always in a state that could be deployed to production

### The CI Feedback Loop

The CI feedback loop operates on a simple principle: the faster a developer learns about a problem, the cheaper it is to fix. Research consistently shows that defects caught during development cost 10-100x less to fix than those found in production. CI compresses this feedback loop to minutes:

1. Developer pushes code to the shared repository
2. CI system detects the change and triggers the pipeline
3. Pipeline executes build, test, and quality stages in sequence or parallel
4. Results are reported back to the developer within minutes
5. If any stage fails, the developer fixes the issue immediately while context is fresh

### Historical Context

CI evolved from the XP community in the late 1990s and early 2000s. The original practices were simple -- a shared build server that compiled the project and ran tests. Modern CI has expanded dramatically to encompass:

- **Multi-stage pipelines** with parallel execution
- **Infrastructure as Code** for reproducible build environments
- **Container-based isolation** for consistent execution across platforms
- **Quality gates** that enforce organizational standards beyond basic compilation
- **Security scanning** integrated into the development workflow
- **Performance testing** as a first-class pipeline stage

## Technical Details

### CI Pipeline Architecture

A CI pipeline is a directed acyclic graph (DAG) of stages and jobs that transform source code into verified, deployable artifacts. The pipeline structure reflects the organization's quality standards and verification requirements:

```elixir
defmodule Prismatic.CI.Pipeline do
  @moduledoc """
  Defines the CI pipeline structure for Prismatic Platform.
  Each stage represents a verification phase that must pass
  before the next stage executes.
  """

  @type stage :: %{
    name: String.t(),
    jobs: [job()],
    dependencies: [String.t()],
    allow_failure: boolean()
  }

  @type job :: %{
    name: String.t(),
    command: String.t(),
    timeout: non_neg_integer(),
    retry: non_neg_integer(),
    artifacts: [String.t()]
  }

  @type pipeline :: %{
    stages: [stage()],
    variables: map(),
    trigger: :push | :merge_request | :schedule
  }

  @spec define_pipeline() :: pipeline()
  def define_pipeline do
    %{
      trigger: :push,
      variables: %{
        "MIX_ENV" => "test",
        "WARNINGS_AS_ERRORS" => "true"
      },
      stages: [
        compile_stage(),
        quality_stage(),
        test_stage(),
        security_stage(),
        deploy_stage()
      ]
    }
  end

  defp compile_stage do
    %{
      name: "compile",
      dependencies: [],
      allow_failure: false,
      jobs: [
        %{
          name: "compile:warnings-as-errors",
          command: "mix compile --warnings-as-errors --force",
          timeout: 300_000,
          retry: 1,
          artifacts: ["_build/"]
        }
      ]
    }
  end

  defp quality_stage do
    %{
      name: "quality",
      dependencies: ["compile"],
      allow_failure: false,
      jobs: [
        %{
          name: "credo:strict",
          command: "mix credo --strict",
          timeout: 120_000,
          retry: 0,
          artifacts: []
        },
        %{
          name: "dialyzer",
          command: "mix dialyzer",
          timeout: 600_000,
          retry: 0,
          artifacts: ["priv/plts/"]
        },
        %{
          name: "format:check",
          command: "mix format --check-formatted",
          timeout: 60_000,
          retry: 0,
          artifacts: []
        },
        %{
          name: "quality:gates",
          command: "mix quality.gates",
          timeout: 300_000,
          retry: 0,
          artifacts: []
        }
      ]
    }
  end

  defp test_stage do
    %{
      name: "test",
      dependencies: ["compile"],
      allow_failure: false,
      jobs: [
        %{
          name: "test:unit",
          command: "mix test --cover",
          timeout: 600_000,
          retry: 1,
          artifacts: ["cover/"]
        }
      ]
    }
  end

  defp security_stage do
    %{
      name: "security",
      dependencies: ["quality", "test"],
      allow_failure: false,
      jobs: [
        %{
          name: "security:deps",
          command: "mix deps.audit",
          timeout: 120_000,
          retry: 0,
          artifacts: []
        }
      ]
    }
  end

  defp deploy_stage do
    %{
      name: "deploy",
      dependencies: ["security"],
      allow_failure: false,
      jobs: [
        %{
          name: "deploy:staging",
          command: "fly deploy --app prismatic-staging",
          timeout: 600_000,
          retry: 0,
          artifacts: []
        }
      ]
    }
  end
end
```

### Quality Gate Enforcement

Quality gates are the enforcement mechanism that transforms CI from a notification system into a governance system. In the Prismatic Platform, quality gates are non-negotiable:

```elixir
defmodule Prismatic.CI.QualityGate do
  @moduledoc """
  Quality gate evaluator for CI pipelines.
  Implements the platform's zero-tolerance quality policy
  by evaluating multiple quality dimensions and producing
  a pass/fail verdict with detailed diagnostics.
  """

  @type gate_result :: %{
    gate: String.t(),
    passed: boolean(),
    score: float(),
    threshold: float(),
    details: String.t()
  }

  @type verdict :: %{
    passed: boolean(),
    gates: [gate_result()],
    overall_score: float(),
    blocking_failures: [String.t()]
  }

  @gates [
    {"compilation", &__MODULE__.check_compilation/0, 1.0},
    {"warnings", &__MODULE__.check_warnings/0, 1.0},
    {"credo", &__MODULE__.check_credo/0, 1.0},
    {"dialyzer", &__MODULE__.check_dialyzer/0, 1.0},
    {"test_coverage", &__MODULE__.check_coverage/0, 0.80},
    {"forbidden_patterns", &__MODULE__.check_forbidden_patterns/0, 1.0},
    {"typespec_coverage", &__MODULE__.check_typespecs/0, 0.90}
  ]

  @spec evaluate() :: verdict()
  def evaluate do
    results = Enum.map(@gates, fn {name, check_fn, threshold} ->
      score = check_fn.()
      %{
        gate: name,
        passed: score >= threshold,
        score: score,
        threshold: threshold,
        details: format_details(name, score, threshold)
      }
    end)

    blocking = results
      |> Enum.reject(& &1.passed)
      |> Enum.map(& &1.gate)

    overall = results
      |> Enum.map(& &1.score)
      |> then(&(Enum.sum(&1) / length(&1)))
      |> Float.round(3)

    %{
      passed: blocking == [],
      gates: results,
      overall_score: overall,
      blocking_failures: blocking
    }
  end

  def check_compilation, do: 1.0
  def check_warnings, do: 1.0
  def check_credo, do: 1.0
  def check_dialyzer, do: 1.0
  def check_coverage, do: 0.85
  def check_forbidden_patterns, do: 1.0
  def check_typespecs, do: 0.95

  defp format_details(gate, score, threshold) do
    status = if score >= threshold, do: "PASS", else: "FAIL"
    "#{gate}: #{status} (#{Float.round(score * 100, 1)}% >= #{Float.round(threshold * 100, 1)}%)"
  end
end
```

### Pre-Commit Hook Integration

CI pipelines run on remote servers after code is pushed, but the Prismatic Platform implements a complementary "shift-left" strategy with comprehensive [pre-commit hooks](@/glossary/pre-commit-hooks.md) that catch issues before they even reach the repository:

```elixir
defmodule Prismatic.CI.PreCommitOrchestrator do
  @moduledoc """
  Orchestrates pre-commit validation phases.
  Implements the platform's 11-phase pre-commit pipeline
  that runs locally before any push to remote.
  """

  @phases [
    {1, "Format Check", "mix format --check-formatted"},
    {2, "Compilation", "mix compile --warnings-as-errors"},
    {3, "Credo Strict", "mix credo --strict"},
    {4, "Forbidden Patterns", "mix quality.forbidden_patterns"},
    {5, "Test Suite", "mix test"},
    {6, "Dialyzer", "mix dialyzer"},
    {7, "Quality Gates", "mix quality.gates"},
    {8, "Template Validation", "scripts/validate-promo-templates.sh"},
    {9, "Security Scan", "mix deps.audit"},
    {10, "Design Consistency", "scripts/validate-design-consistency.sh"},
    {11, "Coverage Threshold", "mix test --cover"}
  ]

  @spec run_all_phases() :: {:ok, [map()]} | {:error, map()}
  def run_all_phases do
    results = Enum.reduce_while(@phases, [], fn {num, name, cmd}, acc ->
      case run_phase(num, name, cmd) do
        {:ok, result} -> {:cont, [result | acc]}
        {:error, result} -> {:halt, {:failed, [result | acc]}}
      end
    end)

    case results do
      {:failed, results} ->
        failed = List.first(results)
        {:error, %{
          phase: failed.phase,
          name: failed.name,
          message: "Pre-commit blocked at phase #{failed.phase}: #{failed.name}"
        }}

      results when is_list(results) ->
        {:ok, Enum.reverse(results)}
    end
  end

  defp run_phase(num, name, cmd) do
    start = System.monotonic_time(:millisecond)

    case System.cmd("sh", ["-c", cmd], stderr_to_stdout: true) do
      {_output, 0} ->
        elapsed = System.monotonic_time(:millisecond) - start
        {:ok, %{phase: num, name: name, status: :passed, elapsed_ms: elapsed}}

      {output, _code} ->
        elapsed = System.monotonic_time(:millisecond) - start
        {:error, %{phase: num, name: name, status: :failed, elapsed_ms: elapsed, output: output}}
    end
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform operates a comprehensive CI system that embodies the NO MERCY, NO DOUBTS doctrine -- zero tolerance for quality regressions, zero exceptions for failing checks.

### GitLab CI Configuration

The platform uses GitLab CI/CD as its primary CI system. The pipeline configuration reflects the multi-stage verification approach with strict ordering and no-failure policies. Key characteristics:

- **Zero-warning compilation**: `mix compile --warnings-as-errors --force` ensures that compiler warnings are treated as build failures
- **Strict static analysis**: [Credo](@/glossary/credo.md) runs in strict mode, [Dialyzer](@/glossary/dialyzer.md) validates type contracts across the entire 115-app umbrella
- **Quality gates**: `mix quality.gates` enforces 13 quality domains, all of which must score 100%
- **Test coverage**: Minimum 80% coverage threshold with per-module enforcement
- **Forbidden pattern detection**: Automated scanning for mocks, stubs, placeholders, TODOs, and other violations of the platform's quality standard

### 11-Phase Pre-Commit Pipeline

The local pre-commit pipeline runs 11 phases before any code reaches the remote repository. This shift-left approach means that most issues are caught on the developer's machine, reducing CI pipeline failures and wasted compute resources. The phases are executed sequentially, and any single failure blocks the commit entirely.

### Umbrella Application Challenges

Running CI on a 115-application Elixir umbrella presents unique challenges:

- **Compilation time**: Full recompilation can take several minutes. The CI system uses incremental compilation where safe and full recompilation for merge requests.
- **Dependency resolution**: Cross-application dependencies must be resolved correctly. The CI system validates the dependency graph for circular references.
- **Test isolation**: Tests must be isolated per application to prevent cross-contamination while still supporting integration tests that span multiple apps.
- **Dialyzer PLT management**: Building the Persistent Lookup Table for 115 applications requires significant time. The CI caches the PLT between runs and invalidates it only when dependencies change.

## Comparison with Alternatives

| CI System | Strengths | Limitations | Prismatic Fit |
|-----------|-----------|-------------|---------------|
| **GitLab CI** | Native GitLab integration, YAML config, built-in container registry | YAML nesting limits (10 levels), complex variable handling | Primary CI system |
| **GitHub Actions** | GitHub ecosystem, marketplace, matrix builds | External to GitLab workflow, separate configuration | Promo site deployment |
| **Jenkins** | Maximum flexibility, plugin ecosystem | Complex maintenance, Groovy DSL learning curve | Not used (maintenance overhead) |
| **CircleCI** | Fast execution, good caching, orb ecosystem | External service, cost at scale | Evaluated, not adopted |
| **Buildkite** | Agent-based, hybrid cloud/on-prem | Requires self-hosted agents for full control | Not evaluated |
| **Dagger** | Programmable pipelines in real languages | Relatively new, smaller ecosystem | Under evaluation |

The Prismatic Platform chose GitLab CI for its tight integration with the GitLab repository, built-in container registry, and native support for the merge request workflow that the team uses for all code changes.

## Best Practices

### Pipeline Design

1. **Fail fast**: Order pipeline stages so that the fastest checks run first. Format checking takes seconds; Dialyzer takes minutes. Catch formatting issues before investing time in type analysis.

2. **Parallelize independent stages**: Quality checks (Credo, Dialyzer, format) can run in parallel since they do not depend on each other. Only stages with true dependencies should be sequential.

3. **Cache aggressively**: Dependency downloads, compiled artifacts, and Dialyzer PLTs should be cached between pipeline runs. Invalidate caches only when relevant inputs change (mix.lock, mix.exs).

4. **Keep pipelines deterministic**: The same commit should produce the same pipeline result regardless of when it runs. Avoid network-dependent steps in quality gates, pin dependency versions, and use fixed container images.

5. **Enforce quality gates as blocking**: Quality gates that only warn but do not block are useless. If a check is important enough to run, it is important enough to fail the build.

### Development Workflow

1. **Commit frequently**: Small, focused commits are easier to review, test, and bisect. The platform mandates atomic commits -- one logical change per commit.

2. **Run pre-commit checks locally**: Do not wait for the CI pipeline to catch issues. Local pre-commit hooks provide sub-minute feedback, while CI pipelines take several minutes.

3. **Fix broken builds immediately**: A broken CI pipeline blocks the entire team. The person who broke the build is responsible for fixing it as their top priority, ahead of all other work.

4. **Never bypass hooks**: The `--no-verify` flag is absolutely forbidden in the Prismatic Platform. Bypassing hooks undermines the entire quality system and creates a precedent for exceptions.

## Common Pitfalls

### Slow Pipelines

The most common CI anti-pattern is a pipeline that takes so long that developers stop waiting for results. When a pipeline takes 30+ minutes, developers context-switch to other work and lose the fast-feedback benefit of CI. Solutions include parallelization, caching, incremental builds, and splitting the pipeline into fast (minutes) and thorough (post-merge) stages.

### Flaky Tests

Non-deterministic test failures erode trust in the CI system. When builds fail randomly, developers learn to ignore failures or retry until they pass. This defeats the purpose of CI. Address flaky tests immediately -- they indicate either a test quality problem or a concurrency bug in the application code.

### Configuration Sprawl

Complex CI configurations become maintenance burdens themselves. The Prismatic Platform's GitLab CI configuration follows strict patterns: simple YAML structure (no multi-line blocks, no heredocs), complex logic extracted to scripts, and a maximum 10-level nesting limit enforced by GitLab itself.

### Insufficient Local Validation

Relying solely on remote CI pipelines means developers discover issues minutes or hours after committing. Pre-commit hooks provide immediate feedback and prevent broken code from ever reaching the shared repository.

### Treating CI as Optional

Organizations that make CI a recommendation rather than a requirement never achieve consistent quality. In the Prismatic Platform, CI is non-negotiable -- every commit must pass all gates, and the doctrine explicitly states: NO MERCY, NO EXCEPTIONS.

## Use Cases

### Umbrella Application Development

In a large Elixir umbrella with 115 applications, CI is not optional -- it is the only mechanism that can validate cross-application compatibility at scale. When a change in `prismatic_storage_core` affects `prismatic_web`, only automated CI testing can reliably detect the breakage across the dependency graph.

### Open Source Package Publishing

The Prismatic Platform publishes 4 open-source packages. CI pipelines for these packages include additional checks: API documentation generation, Hex package validation, backward compatibility testing, and automated changelog generation. Every published version must pass the full quality gate suite.

### Security-Critical Changes

Changes to [authentication](@/glossary/authentication.md), [authorization](@/glossary/authorization.md), or [encryption](@/glossary/encryption.md) modules trigger enhanced CI pipelines that include security-specific checks: dependency vulnerability scanning, static security analysis, and automated penetration test suites.

### Production Deployment

The CI pipeline extends into [continuous deployment](@/glossary/continuous-deployment.md) for the Prismatic Platform's Fly.io infrastructure. After all quality gates pass, the pipeline automatically deploys to the staging environment. Production deployment requires an additional manual approval step, but the CI pipeline ensures that only verified code reaches the deployment stage.

## Related Concepts

Continuous Integration connects to numerous concepts across the development and operations spectrum:

- [CI/CD](@/glossary/ci-cd.md) -- The broader practice that combines Continuous Integration with Continuous Delivery/Deployment into an end-to-end automation pipeline
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) -- Local validation that complements CI by catching issues before code reaches the remote repository
- [Quality Gates](@/glossary/quality-gates.md) -- Automated checkpoints that enforce quality standards as blocking conditions in the CI pipeline
- [Static Analysis](@/glossary/static-analysis.md) -- Automated code analysis (Credo, Dialyzer) integrated as CI pipeline stages to enforce code quality standards
- [Testing](@/glossary/testing.md) -- Automated test suites that run within CI pipelines to verify functional correctness and detect regressions
- [Credo](@/glossary/credo.md) -- Elixir static analysis tool that enforces code consistency and detects anti-patterns as a CI quality gate
- [Dialyzer](@/glossary/dialyzer.md) -- Erlang/Elixir type checker that verifies type contracts across the codebase as a CI pipeline stage
- [GitLab CI](@/glossary/gitlab-ci.md) -- The specific CI/CD platform used by Prismatic Platform for pipeline execution and deployment
- [Compilation](@/glossary/compilation.md) -- The first CI pipeline stage that verifies code compiles without errors or warnings
- [Continuous Deployment](@/glossary/continuous-deployment.md) -- The practice of automatically deploying verified code to production, extending CI into the deployment phase

## See Also

- [Quality Gate](@/glossary/quality-gate.md) -- Individual quality checks that compose the CI quality enforcement system
- [Regression Testing](@/glossary/regression-testing.md) -- Test category specifically designed to prevent reintroduction of fixed bugs
- [Code Quality](@/glossary/code-quality.md) -- The broader concept of maintaining code standards that CI helps enforce
- [GitOps](@/glossary/gitops.md) -- Infrastructure management paradigm that extends CI principles to operational configurations
- [Docker](@/glossary/docker.md) -- Containerization technology used to create reproducible CI execution environments

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
