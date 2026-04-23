+++
title = "Development Workflow"
weight = 50
[extra]
tags = ["glossary", "development", "workflow", "ci-cd", "quality", "automation", "process"]
description = "A development workflow is the structured sequence of activities, tools, and automated gates that code traverses from initial conception through implementation, testing, review, and deployment to production"
category = "development-process"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "Software Development Process"
related_concepts = ["continuous integration", "continuous deployment", "code review", "quality gates", "pre-commit hooks", "test-driven development", "GitOps", "trunk-based development"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = "intermediate"
prerequisites = ["ci-cd", "testing", "code-quality", "documentation"]
learning_path = ["code-quality", "testing", "ci-cd", "pre-commit-hooks", "quality-gates", "development-workflow"]
interactive_demos = ["workflow-pipeline-visualizer", "pre-commit-hook-simulator", "quality-gate-dashboard"]
code_examples = true
external_resources = ["https://hexdocs.pm/mix/Mix.html", "https://docs.gitlab.com/ee/ci/", "https://fly.io/docs/"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["pre-commit-hook-validation", "ci-pipeline-execution", "quality-gate-enforcement", "deployment-verification", "rollback-procedure"]
keywords = ["development workflow", "CI/CD", "quality gates", "pre-commit", "code review", "deployment pipeline", "testing workflow", "automation"]
related_terms = ["ci-cd", "pre-commit-hooks", "quality-gates", "code-reviews", "testing", "continuous-integration", "continuous-deployment", "gitops", "code-quality", "static-analysis"]
word_count = 1677
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Development Workflow - Prismatic Platform"
+++

## Definition

A development workflow is the complete, structured sequence of human activities, automated processes, quality checkpoints, and tooling integrations that govern how code moves from an initial idea through implementation, validation, review, and deployment to a production environment. It encompasses not just the technical pipeline (compile, test, deploy) but the surrounding practices: how work is planned, how branches are managed, how code reviews are conducted, how quality is enforced, and how releases are coordinated.

A well-designed development workflow balances speed with safety, automation with human judgment, and individual productivity with team coordination. It should make the right thing easy and the wrong thing hard -- ideally impossible. In high-reliability systems, the development workflow itself becomes a critical system component, where workflow failures (merged untested code, skipped reviews, broken deployments) can be as damaging as application bugs.

## Overview

The evolution of development workflows tracks the evolution of software engineering itself. Early workflows were linear (waterfall): design, implement, test, release. Modern workflows are iterative, concurrent, and heavily automated: feature branches, continuous integration, automated testing, progressive deployment, feature flags, and observability-driven feedback loops.

The Prismatic Platform's development workflow represents the extreme end of the automation spectrum, enforcing the NO MERCY, NO DOUBTS doctrine through an 11-phase pre-commit hook, mandatory quality gates, zero-warning compilation, comprehensive test coverage, and session discipline protocols. Every line of code that reaches the main branch has survived a gauntlet of automated validation that would be impractical to perform manually.

### Workflow Phases

The platform's development workflow is organized into distinct phases, each with specific entry and exit criteria:

1. **Planning**: Work is scoped through GitLab issues with clear acceptance criteria
2. **Implementation**: Code is written on feature branches following the coding standards
3. **Local Validation**: The 11-phase pre-commit hook validates the code before it can be committed
4. **Commit**: Atomic commits with conventional commit messages
5. **Push**: Code is pushed to the remote repository
6. **CI Pipeline**: GitLab CI runs comprehensive validation
7. **Code Review**: Human review of architectural decisions and code clarity
8. **Merge**: Code is merged to the main branch
9. **Deployment**: Automated deployment to staging, then production
10. **Monitoring**: Production telemetry validates the deployment

## Technical Details

### The 11-Phase Pre-Commit Hook

The Prismatic Platform's pre-commit hook is the first line of defense in the development workflow. It runs locally before every commit, catching issues before they reach the CI pipeline:

```elixir
defmodule Prismatic.Workflow.PreCommitPhases do
  @moduledoc """
  Defines the 11-phase pre-commit validation pipeline.
  Each phase must pass before the commit is allowed to proceed.
  Phases run sequentially; failure at any phase aborts the commit.
  """

  @type phase :: %{
    number: pos_integer(),
    name: String.t(),
    command: String.t(),
    timeout_ms: pos_integer(),
    blocking: boolean()
  }

  @spec phases() :: [phase()]
  def phases do
    [
      %{number: 1, name: "Compilation", command: "mix compile --warnings-as-errors", timeout_ms: 60_000, blocking: true},
      %{number: 2, name: "Formatting", command: "mix format --check-formatted", timeout_ms: 30_000, blocking: true},
      %{number: 3, name: "Credo Analysis", command: "mix credo --strict", timeout_ms: 60_000, blocking: true},
      %{number: 4, name: "Dialyzer", command: "mix dialyzer", timeout_ms: 300_000, blocking: true},
      %{number: 5, name: "Test Suite", command: "mix test", timeout_ms: 180_000, blocking: true},
      %{number: 6, name: "Quality Gates", command: "mix quality.gates", timeout_ms: 120_000, blocking: true},
      %{number: 7, name: "Forbidden Patterns", command: "mix quality.forbidden_patterns", timeout_ms: 30_000, blocking: true},
      %{number: 8, name: "Template Validation", command: "scripts/validate-promo-templates.sh", timeout_ms: 30_000, blocking: true},
      %{number: 9, name: "Security Scan", command: "mix security.scan --quick", timeout_ms: 60_000, blocking: true},
      %{number: 10, name: "Design Consistency", command: "scripts/validate-design-consistency.sh", timeout_ms: 30_000, blocking: true},
      %{number: 11, name: "Documentation Coverage", command: "mix docs.coverage", timeout_ms: 60_000, blocking: true}
    ]
  end

  @spec run_all() :: :ok | {:error, phase(), String.t()}
  def run_all do
    Enum.reduce_while(phases(), :ok, fn phase, :ok ->
      case run_phase(phase) do
        :ok ->
          {:cont, :ok}

        {:error, output} ->
          {:halt, {:error, phase, output}}
      end
    end)
  end

  @spec run_phase(phase()) :: :ok | {:error, String.t()}
  defp run_phase(%{command: command, timeout_ms: timeout}) do
    case System.cmd("sh", ["-c", command], stderr_to_stdout: true, timeout: timeout) do
      {_output, 0} -> :ok
      {output, _code} -> {:error, output}
    end
  end
end
```

### Quality Gate System

The quality gates provide a comprehensive assessment of code quality across 13 domains:

```elixir
defmodule Prismatic.Workflow.QualityGates do
  @moduledoc """
  The quality gate system evaluates code across 13 independent
  quality domains. All domains must pass for the gate to open.
  A single failure in any domain blocks the pipeline.
  """

  @type gate_result :: %{
    domain: String.t(),
    status: :passed | :failed | :warning,
    violations: non_neg_integer(),
    details: [String.t()]
  }

  @type gate_report :: %{
    overall: :passed | :failed,
    score: non_neg_integer(),
    domains: [gate_result()],
    timestamp: DateTime.t()
  }

  @domains [
    :dialyzer,
    :credo,
    :compilation,
    :datetime_precision,
    :guard_functions,
    :impl_coverage,
    :memory_safety,
    :performance,
    :regression_prevention,
    :timing_patterns,
    :todo_management,
    :typespec_coverage,
    :unsafe_map_access
  ]

  @spec evaluate() :: gate_report()
  def evaluate do
    results = Enum.map(@domains, &evaluate_domain/1)

    overall =
      if Enum.all?(results, &(&1.status == :passed)),
        do: :passed,
        else: :failed

    score =
      results
      |> Enum.count(&(&1.status == :passed))
      |> Kernel.*(100)
      |> div(length(results))

    %{
      overall: overall,
      score: score,
      domains: results,
      timestamp: DateTime.utc_now()
    }
  end

  @spec evaluate_domain(atom()) :: gate_result()
  defp evaluate_domain(domain) do
    checker = domain_checker(domain)

    case checker.() do
      {:ok, 0} ->
        %{domain: Atom.to_string(domain), status: :passed, violations: 0, details: []}

      {:ok, count, details} when count > 0 ->
        %{domain: Atom.to_string(domain), status: :failed, violations: count, details: details}

      {:error, reason} ->
        %{domain: Atom.to_string(domain), status: :failed, violations: 1, details: [reason]}
    end
  end
end
```

### Session Discipline Protocol

The Prismatic Platform enforces a mandatory session discipline protocol that governs how development sessions are conducted:

```elixir
defmodule Prismatic.Workflow.SessionDiscipline do
  @moduledoc """
  Enforces the mandatory session discipline protocol.
  Every development session must follow the prescribed workflow:
  create tickets, commit frequently, push immediately, test locally,
  pass all hooks, and save session context.
  """

  @type session :: %{
    id: String.t(),
    started_at: DateTime.t(),
    gitlab_issues: [String.t()],
    commits: [String.t()],
    pushes: [DateTime.t()],
    tests_run: non_neg_integer(),
    hooks_passed: non_neg_integer(),
    context_saved: boolean()
  }

  @type violation :: %{
    type: :missing_ticket | :unpushed_commits | :hook_bypass | :untested_changes,
    severity: :warning | :blocking | :critical,
    description: String.t()
  }

  @spec validate_session(session()) :: :ok | {:violations, [violation()]}
  def validate_session(session) do
    violations =
      []
      |> check_gitlab_tracking(session)
      |> check_push_frequency(session)
      |> check_test_coverage(session)
      |> check_hook_compliance(session)

    case violations do
      [] -> :ok
      violations -> {:violations, violations}
    end
  end

  @spec check_gitlab_tracking([violation()], session()) :: [violation()]
  defp check_gitlab_tracking(violations, %{gitlab_issues: []}) do
    [%{
      type: :missing_ticket,
      severity: :blocking,
      description: "Session has no associated GitLab issues"
    } | violations]
  end

  defp check_gitlab_tracking(violations, _session), do: violations

  @spec check_push_frequency([violation()], session()) :: [violation()]
  defp check_push_frequency(violations, %{commits: commits, pushes: pushes}) do
    unpushed = length(commits) - length(pushes)

    if unpushed > 0 do
      [%{
        type: :unpushed_commits,
        severity: :blocking,
        description: "#{unpushed} commits have not been pushed to remote"
      } | violations]
    else
      violations
    end
  end
end
```

### Continuous Integration Pipeline

The GitLab CI pipeline provides the next layer of validation after local pre-commit hooks:

```elixir
defmodule Prismatic.Workflow.CIPipeline do
  @moduledoc """
  Defines the CI pipeline stages that validate code after push.
  The pipeline mirrors the local pre-commit checks but runs in
  a clean environment to catch environment-specific issues.
  """

  @type pipeline_stage :: %{
    name: String.t(),
    jobs: [String.t()],
    allow_failure: boolean(),
    dependencies: [String.t()]
  }

  @spec stages() :: [pipeline_stage()]
  def stages do
    [
      %{name: "build", jobs: ["compile", "deps-audit"], allow_failure: false, dependencies: []},
      %{name: "test", jobs: ["unit-tests", "integration-tests", "property-tests"], allow_failure: false, dependencies: ["build"]},
      %{name: "quality", jobs: ["credo", "dialyzer", "quality-gates", "coverage"], allow_failure: false, dependencies: ["build"]},
      %{name: "security", jobs: ["dependency-scan", "secret-detection", "sast"], allow_failure: false, dependencies: ["build"]},
      %{name: "deploy-staging", jobs: ["fly-deploy-staging"], allow_failure: false, dependencies: ["test", "quality", "security"]},
      %{name: "smoke-test", jobs: ["staging-health-check", "staging-performance"], allow_failure: false, dependencies: ["deploy-staging"]},
      %{name: "deploy-production", jobs: ["fly-deploy-prod"], allow_failure: false, dependencies: ["smoke-test"]}
    ]
  end
end
```

### Deployment Strategy

The platform uses a progressive deployment strategy through Fly.io:

```elixir
defmodule Prismatic.Workflow.DeploymentStrategy do
  @moduledoc """
  Manages the deployment lifecycle from staging validation
  through production rollout with automatic rollback capabilities.
  """

  @type deployment :: %{
    version: String.t(),
    target: :staging | :production,
    status: :pending | :deploying | :validating | :active | :rolled_back,
    started_at: DateTime.t(),
    health_checks: [health_check_result()]
  }

  @type health_check_result :: %{
    name: String.t(),
    status: :passed | :failed,
    response_time_ms: non_neg_integer()
  }

  @spec deploy(String.t(), :staging | :production) :: {:ok, deployment()} | {:error, String.t()}
  def deploy(version, target) do
    deployment = %{
      version: version,
      target: target,
      status: :pending,
      started_at: DateTime.utc_now(),
      health_checks: []
    }

    with {:ok, deployed} <- execute_deployment(deployment),
         {:ok, validated} <- run_health_checks(deployed),
         {:ok, active} <- mark_active_or_rollback(validated) do
      {:ok, active}
    end
  end

  @spec run_health_checks(deployment()) :: {:ok, deployment()} | {:error, String.t()}
  defp run_health_checks(deployment) do
    checks = [
      {"health_endpoint", "/api/v1/health", 10},
      {"page_load", "/", 250},
      {"liveview_mount", "/perimeter", 150}
    ]

    results =
      Enum.map(checks, fn {name, path, max_ms} ->
        {time_ms, _response} = measure_request(deployment.target, path)
        %{name: name, status: if(time_ms <= max_ms, do: :passed, else: :failed), response_time_ms: time_ms}
      end)

    updated = %{deployment | health_checks: results, status: :validating}

    if Enum.all?(results, &(&1.status == :passed)) do
      {:ok, updated}
    else
      failed = Enum.filter(results, &(&1.status == :failed))
      {:error, "Health checks failed: #{inspect(failed)}"}
    end
  end
end
```

## Implementation in Prismatic Platform

### Zero-Warning Compilation

The Prismatic Platform's development workflow mandates zero compilation warnings. The `mix compile --warnings-as-errors --force` command is the first quality gate, ensuring that no warnings accumulate over time. This is enforced at three levels: locally (pre-commit hook Phase 1), in CI (build stage), and through the quality gate system.

### Atomic Commits with Conventional Messages

Every commit follows the Conventional Commits format (`type(scope): subject`) and contains a single logical change. The session discipline protocol forbids batching multiple unrelated changes into a single commit. This practice enables precise git bisect, clean cherry-picks, and meaningful changelogs.

### Continuous Push Policy

The mandatory session discipline requires that every commit is pushed to the remote repository immediately after creation. This policy eliminates the risk of lost work, enables team visibility into work in progress, and ensures that CI pipelines run against the latest code.

### Quality DNA Tracking

Each of the 115 umbrella applications maintains a quality DNA file (`.claude/quality-dna/current-state.json`) that tracks quality metrics over time. The development workflow updates these files as part of the session lifecycle, creating a historical record of quality evolution.

### Forbidden Pattern Detection

Phase 7 of the pre-commit hook scans for forbidden patterns: mocks in production code, stubs, placeholders, TODO/FIXME comments, hardcoded credentials, and other anti-patterns. This automated detection prevents technical debt from entering the codebase.

## Comparison with Alternatives

### Trunk-Based Development vs. Feature Branch Workflow

Trunk-based development commits directly to the main branch with short-lived feature flags. Feature branch workflows (GitHub Flow, GitLab Flow) use branches for isolation. The Prismatic Platform uses feature branches with strict branch lifetime limits, combining the isolation benefits of branches with the integration frequency of trunk-based development.

### Manual Code Review vs. Automated Quality Gates

Traditional workflows rely heavily on manual code review for quality assurance. The Prismatic Platform automates 90%+ of quality checks through the 11-phase pre-commit hook and CI pipeline, freeing human reviewers to focus on architectural decisions, algorithmic correctness, and design quality -- things that automated tools cannot assess.

### Monorepo vs. Polyrepo Workflows

The Prismatic Platform's umbrella application structure is a monorepo approach where 115 applications live in a single repository. This enables atomic cross-application changes, unified CI pipelines, and consistent tooling. Polyrepo workflows distribute applications across separate repositories, providing stronger isolation but complicating cross-service changes.

### Waterfall vs. Iterative Development

The waterfall model sequences design, implementation, testing, and deployment into distinct phases. The Prismatic Platform's workflow is aggressively iterative: small changes are committed, tested, and deployed continuously. The session discipline protocol enforces this through its continuous commit and push requirements.

## Best Practices

1. **Automate Everything Automatable**: If a check can be automated, it must be automated. Human attention is a scarce resource; reserve it for decisions that require judgment, creativity, or domain expertise.

2. **Fail Fast, Fail Locally**: The 11-phase pre-commit hook catches issues before they reach CI, saving pipeline minutes and reducing feedback loop latency from minutes to seconds.

3. **Make the Pipeline a Contract**: The CI pipeline defines what "done" means. Code that does not pass all pipeline stages is not done, regardless of how "ready" it appears to the developer.

4. **Keep Commits Atomic**: Each commit should represent one logical change that can be understood, reviewed, and reverted independently. The Prismatic Platform enforces this through session discipline.

5. **Version Everything**: Not just code, but configuration, infrastructure, documentation, and quality metrics. The Prismatic Platform versions its quality DNA, session context, and agent specifications alongside the code.

6. **Monitor the Workflow Itself**: Track pre-commit hook execution time, CI pipeline duration, deployment success rate, and rollback frequency. The workflow is a system that requires its own observability.

7. **Practice Deployment**: Deploy frequently to reduce the risk per deployment. The Prismatic Platform's staging-then-production deployment strategy validates every change in a production-like environment before it reaches users.

8. **Invest in Developer Experience**: A slow, frustrating workflow reduces productivity and encourages workarounds. Optimize pre-commit hook speed, CI pipeline parallelism, and deployment automation.

## Common Pitfalls

1. **Skipping Local Validation**: Developers who bypass pre-commit hooks (--no-verify) to "save time" push broken code to CI, wasting pipeline resources and blocking other developers. The Prismatic Platform absolutely forbids --no-verify.

2. **Infrequent Integration**: Long-lived feature branches that diverge significantly from main create painful merge conflicts. The session discipline's continuous push policy prevents this.

3. **Flaky Tests**: Non-deterministic tests undermine trust in the workflow. Developers learn to ignore failures if they are sometimes spurious, leading to real failures being missed. The platform mandates deterministic tests.

4. **Manual Deployment Steps**: Any manual step in the deployment process is a step that can be forgotten, performed incorrectly, or become tribal knowledge. Automate every deployment step.

5. **Insufficient Staging Validation**: Deploying to production without adequate staging validation turns production into the testing environment. The Prismatic Platform's smoke test stage validates health, performance, and critical paths before production deployment.

6. **Quality Gate Erosion**: Quality gates that are relaxed "just this once" tend to stay relaxed permanently. The NO MERCY doctrine ensures that quality gates are never bypassed.

7. **Ignoring Workflow Metrics**: Without measuring pipeline duration, failure rates, and deployment frequency, it is impossible to identify workflow bottlenecks. Track and optimize workflow performance continuously.

## Use Cases

### Feature Development

A developer picks up a GitLab issue, creates a feature branch, implements the change with tests, commits atomically through the pre-commit hook, pushes to remote, waits for CI to pass, requests code review, and merges to main. The deployment pipeline handles the rest.

### Hotfix Workflow

A production incident requires an immediate fix. The developer creates a fix branch from main, implements the minimal fix with a regression test, commits through the pre-commit hook, pushes, and fast-tracks through CI. The fix deploys to staging for smoke testing, then to production.

### Dependency Updates

Monthly dependency updates follow the standard workflow: update mix.lock, run the full test suite to catch compatibility issues, commit the changes, and deploy through the pipeline. The CI pipeline catches breaking changes that local tests might miss due to environment differences.

### Refactoring

Large-scale refactoring is performed incrementally through a series of small, atomic commits. Each commit maintains all quality gates, ensuring that the codebase is in a valid state at every point. The development workflow's atomic commit requirement enables safe, incremental refactoring.

## Related Concepts

The development workflow integrates with many platform concepts:

- [CI/CD](/glossary/ci-cd/) -- The automation backbone that executes the development workflow's validation and deployment stages
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) -- The local validation mechanism that enforces quality before code reaches the repository
- [Quality Gates](/glossary/quality-gates/) -- The automated checkpoints that evaluate code quality across 13 independent domains
- [Code Reviews](/glossary/code-reviews/) -- The human review process that complements automated quality checks
- [Testing](/glossary/testing/) -- The verification methodology that validates correctness at unit, integration, and system levels
- [Continuous Integration](/glossary/continuous-integration/) -- The practice of frequently integrating code changes with automated validation
- [Continuous Deployment](/glossary/continuous-deployment/) -- The practice of automatically deploying validated code to production
- [GitOps](/glossary/gitops/) -- The operational model where Git is the single source of truth for infrastructure and application state
- [Code Quality](/glossary/code-quality/) -- The measurable attributes of code that the development workflow enforces
- [Static Analysis](/glossary/static-analysis/) -- The compile-time code analysis tools (Dialyzer, Credo) integrated into the workflow

## See Also

- [Clean Run](/glossary/clean-run/) -- The zero-warning compilation requirement enforced by the workflow
- [Session Discipline](/glossary/session-discipline/) -- The protocol governing development session behavior
- [Quality DNA](/glossary/quality-dna/) -- The cross-session quality tracking system maintained by the workflow
- [Credo](/glossary/credo/) -- The static analysis tool integrated into Phase 3 of the pre-commit hook
- [Dialyzer](/glossary/dialyzer/) -- The type-checking tool integrated into Phase 4 of the pre-commit hook

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
