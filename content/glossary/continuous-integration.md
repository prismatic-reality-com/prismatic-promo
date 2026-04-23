+++
title = "Continuous Integration"
weight = 17
[extra]
category = "quality"
description = "Practice of automatically building and testing code on every commit to detect issues early"
related_terms = ["continuous-deployment", "gitlab-ci", "quality-gates", "pre-commit-hooks", "zero-warning-policy"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1360
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Continuous", "Integration", "Practice", "glossary", "quality", "Prismatic Platform", "GitLab", "Architecture", "Dialyzer"]
tags = ["glossary", "quality", "continuous-integration", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Continuous Integration - Prismatic Platform"
+++

## Definition and Overview

Continuous Integration (CI) is a software development practice in which developers frequently merge their code changes into a shared repository, where each integration is automatically verified by building the application and running a comprehensive suite of automated tests. The primary objective of CI is to detect integration errors, test failures, and quality regressions within minutes of a code change, thereby reducing the cost, complexity, and risk associated with software delivery. Originally articulated by Grady Booch in 1991 and later popularized by Martin Fowler and Kent Beck as part of Extreme Programming (XP), CI has become a foundational practice in modern software engineering.

The fundamental insight behind CI is that integration problems are exponentially harder to resolve the longer they go undetected. When developers work in isolation for days or weeks before integrating, merge conflicts multiply, subtle behavioral regressions compound, and the root cause of failures becomes difficult to trace. CI eliminates this accumulation of technical debt by enforcing that every commit -- no matter how small -- passes through an automated validation pipeline before being accepted into the shared codebase.

Modern CI systems extend far beyond simple compilation and unit testing. A mature CI pipeline incorporates static analysis (type checking, linting, pattern detection), security scanning (dependency vulnerabilities, secrets detection), performance benchmarking, documentation generation, and artifact publishing. The pipeline serves as an automated quality gate that enforces organizational standards consistently and objectively, removing human error and subjective judgment from the quality assurance process.

## Technical Deep Dive

At its core, a CI pipeline is a directed acyclic graph (DAG) of stages, where each stage consists of one or more jobs that execute in parallel. The pipeline is triggered by events -- most commonly a git push or merge request creation -- and progresses through stages sequentially. If any job in a stage fails, the pipeline halts and reports the failure, preventing downstream stages from executing against known-broken code.

### Pipeline Stage Architecture

A well-designed CI pipeline follows a progressive validation pattern where cheaper, faster checks run first:

| Stage | Duration | Purpose | Failure Cost |
|-------|----------|---------|--------------|
| **Lint / Format** | 5-15s | Code style, formatting consistency | Minimal -- developer fixes locally |
| **Compile** | 30-120s | Syntax errors, missing dependencies | Low -- immediate feedback |
| **Static Analysis** | 60-300s | Type errors, anti-patterns, complexity | Medium -- requires code changes |
| **Unit Tests** | 30-300s | Function-level correctness | Medium -- logic errors |
| **Integration Tests** | 60-600s | Cross-module interaction correctness | High -- architectural issues |
| **E2E Tests** | 120-900s | Full system behavior validation | Highest -- system-level failures |
| **Security Scan** | 60-300s | Vulnerability detection, secrets scanning | Critical -- security exposure |
| **Deploy** | 60-300s | Artifact creation, environment provisioning | Production impact |

The ordering ensures that the most common failures (formatting, compilation) are caught in seconds rather than waiting for a full 15-minute pipeline to complete. This fast-feedback principle is essential for maintaining developer productivity and CI adoption.

### Merge Request Validation

In merge-request-driven workflows, CI runs on the proposed merge result rather than the branch tip alone. This is critical because a branch that passes CI in isolation may fail when merged with concurrent changes to the target branch. GitLab and similar platforms compute the merge result automatically and run the pipeline against it, catching merge-induced failures before they reach the shared branch.

### Caching and Incremental Analysis

Production CI systems rely heavily on caching to avoid redundant work across pipeline runs. Common caching strategies include dependency caching (preserving `_build/` and `deps/` directories between runs), persistent lookup table (PLT) caching for [Dialyzer](/glossary/dialyzer/) analysis, and test result caching for unchanged modules. Without effective caching, CI pipeline duration grows linearly with codebase size, eventually becoming a bottleneck that discourages frequent commits.

## Architecture and Implementation

### Two-Layer Enforcement Architecture

The most effective CI implementations use a two-layer approach: local pre-commit validation and server-side pipeline enforcement.

```
Developer Workstation                    CI Server
┌─────────────────────┐                 ┌─────────────────────────┐
│  Pre-Commit Hooks   │                 │  Full Pipeline          │
│  ├─ Format check    │   git push      │  ├─ Compile (--warnings)│
│  ├─ Credo (fast)    │ ──────────────> │  ├─ Credo --strict      │
│  ├─ Compile check   │                 │  ├─ Dialyzer            │
│  └─ Quick tests     │                 │  ├─ Full test suite     │
│                     │                 │  ├─ Quality gates (13)  │
│  ~15-30 seconds     │                 │  ├─ Security scan       │
└─────────────────────┘                 │  └─ Deploy (if main)    │
                                        │                         │
                                        │  ~5-15 minutes          │
                                        └─────────────────────────┘
```

The local layer provides instant feedback (under 30 seconds), catching the most common issues before code leaves the developer's machine. The server-side layer provides comprehensive validation that would be too slow for local execution, including full test suites across all umbrella applications, complete static analysis, and deployment verification.

### Quality Gate Integration

CI pipelines enforce quality gates as pipeline stages with non-zero exit codes on violation. Each quality domain produces a pass/fail result:

```elixir
defmodule QualityGate do
  @quality_domains [
    :compilation_warnings,
    :credo_strict,
    :dialyzer,
    :test_coverage,
    :typespec_coverage,
    :impl_coverage,
    :datetime_precision,
    :guard_functions,
    :memory_safety,
    :performance_patterns,
    :timing_patterns,
    :todo_management,
    :unsafe_map_access
  ]

  def run_all_gates do
    results = Enum.map(@quality_domains, fn domain ->
      {domain, run_gate(domain)}
    end)

    failures = Enum.filter(results, fn {_domain, result} -> result != :pass end)

    case failures do
      [] -> {:ok, :all_gates_passed}
      failed -> {:error, {:gates_failed, failed}}
    end
  end

  defp run_gate(:compilation_warnings) do
    case System.cmd("mix", ["compile", "--warnings-as-errors", "--force"]) do
      {_output, 0} -> :pass
      {output, _code} -> {:fail, output}
    end
  end

  defp run_gate(:credo_strict) do
    case System.cmd("mix", ["credo", "--strict"]) do
      {_output, 0} -> :pass
      {output, _code} -> {:fail, output}
    end
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform employs one of the most rigorous CI configurations in the Elixir ecosystem, enforcing quality across 13 domains with zero tolerance for violations. Every commit to the repository triggers a comprehensive validation pipeline through [GitLab CI/CD](/glossary/gitlab-ci/).

### Pipeline Configuration

The platform's `.gitlab-ci.yml` defines a multi-stage pipeline that validates all 89 umbrella applications:

```yaml
stages:
  - compile
  - analyze
  - test
  - quality
  - deploy

compile:
  stage: compile
  script:
    - mix deps.get
    - mix compile --warnings-as-errors --force

static_analysis:
  stage: analyze
  script:
    - mix credo --strict
    - mix dialyzer

test:
  stage: test
  script:
    - mix test --cover
  coverage: '/(\d+\.\d+)%\s+\|\s+Total/'

quality_gates:
  stage: quality
  script:
    - mix quality.gates
```

### Pre-Commit Hook Pipeline

The local pre-commit enforcement runs a subset of CI checks before each commit:

```bash
#!/bin/bash
# .githooks/pre-commit (simplified)
set -e

# Phase 1: Compilation check
mix compile --warnings-as-errors

# Phase 2: Credo quick check
mix credo --strict

# Phase 3: Run tests for changed files
mix test $(git diff --cached --name-only --diff-filter=ACMR | grep "_test.exs$")

# Phase 4: Quality gate quick check
mix quality.gates.check --fast
```

### Zero-Tolerance Enforcement

The platform maintains zero violations across all 13 quality domains. The current state reflects complete elimination of quality debt:

| Domain | Current Violations | Enforcement |
|--------|-------------------|-------------|
| Compilation Warnings | 0 | `--warnings-as-errors` |
| [Credo](/glossary/credo/) | 0 | `--strict` mode |
| [Dialyzer](/glossary/dialyzer/) | 0 | Full PLT analysis |
| Test Coverage | 100% | `--cover` flag |
| Typespec Coverage | 0 gaps | `@spec` on all public functions |
| `@impl` Coverage | 709+ verified | Dialyzer validation |
| Memory Safety | 0 violations | Pattern detection |
| Performance Patterns | 0 violations | Anti-pattern scanning |

## Code Examples

### Elixir CI Task Runner

```elixir
defmodule Mix.Tasks.Ci.Run do
  @moduledoc """
  Executes the complete CI pipeline locally for pre-push validation.

  ## Usage

      mix ci.run           # Full pipeline
      mix ci.run --fast    # Quick validation only
  """
  use Mix.Task

  @shortdoc "Run CI pipeline locally"

  @impl Mix.Task
  def run(args) do
    {opts, _, _} = OptionParser.parse(args, switches: [fast: :boolean])

    stages = if opts[:fast], do: fast_stages(), else: full_stages()

    Enum.each(stages, fn {name, command, args_list} ->
      Mix.shell().info("Running #{name}...")

      case System.cmd(command, args_list, stderr_to_stdout: true) do
        {_output, 0} ->
          Mix.shell().info("#{name}: PASSED")

        {output, code} ->
          Mix.shell().error("#{name}: FAILED (exit #{code})")
          Mix.shell().error(output)
          Mix.raise("CI pipeline failed at stage: #{name}")
      end
    end)

    Mix.shell().info("All CI stages passed.")
  end

  defp fast_stages do
    [
      {"Compile", "mix", ["compile", "--warnings-as-errors"]},
      {"Credo", "mix", ["credo", "--strict"]},
      {"Tests", "mix", ["test"]}
    ]
  end

  defp full_stages do
    fast_stages() ++
      [
        {"Dialyzer", "mix", ["dialyzer"]},
        {"Coverage", "mix", ["test", "--cover"]},
        {"Quality Gates", "mix", ["quality.gates"]}
      ]
  end
end
```

### Pipeline Result Reporter

```elixir
defmodule CIReporter do
  @moduledoc """
  Generates structured CI pipeline reports for GitLab integration.
  """

  @spec generate_report(list({atom(), :pass | {:fail, String.t()}})) :: map()
  def generate_report(results) do
    %{
      timestamp: DateTime.utc_now(),
      total_stages: length(results),
      passed: Enum.count(results, fn {_, r} -> r == :pass end),
      failed: Enum.count(results, fn {_, r} -> r != :pass end),
      stages: Enum.map(results, &format_stage/1),
      overall: if(Enum.all?(results, fn {_, r} -> r == :pass end), do: :pass, else: :fail)
    }
  end

  defp format_stage({name, :pass}), do: %{name: name, status: :pass, details: nil}
  defp format_stage({name, {:fail, details}}), do: %{name: name, status: :fail, details: details}
end
```

## Best Practices

**Keep pipelines fast.** The most critical factor in CI adoption is pipeline speed. If the pipeline takes longer than 10-15 minutes, developers will stop waiting for results and stack commits, defeating the purpose. Use caching aggressively, parallelize independent stages, and invest in faster CI runners.

**Fail fast with progressive validation.** Order pipeline stages from fastest to slowest, cheapest to most expensive. Compilation failures should be reported in 30 seconds, not after a 10-minute test suite completes. This progressive approach minimizes wasted compute and developer wait time.

**Treat the pipeline as code.** CI configuration files (`.gitlab-ci.yml`, `Makefile`, hook scripts) deserve the same code review, testing, and documentation standards as application code. Pipeline regressions -- such as accidentally removing a quality gate -- can silently degrade code quality for weeks before detection.

**Enforce branch protection rules.** CI is only effective if its results are enforced. Configure branch protection to require pipeline success before merging. Without enforcement, CI becomes advisory rather than mandatory, and violations accumulate over time.

**Monitor pipeline metrics.** Track pipeline duration, failure rate, flaky test frequency, and queue wait time. These metrics reveal CI health issues before they become developer productivity problems. A pipeline that was once fast but has gradually slowed to 20 minutes indicates accumulated technical debt in the test suite or missing cache optimization.

## Common Pitfalls

**Flaky tests erode trust.** Tests that pass or fail non-deterministically train developers to ignore CI failures. Every flaky test must be fixed immediately (quarantine, then fix root cause) or the entire CI pipeline loses credibility. The Prismatic Platform's zero-tolerance policy treats flaky tests as P0 bugs.

**Insufficient local validation.** Without pre-commit hooks, developers push code that predictably fails CI, wasting pipeline compute and creating a culture of "push and pray." The two-layer enforcement architecture ensures that the most common failures never reach the CI server.

**Overly complex pipeline configuration.** CI YAML files that grow beyond a few hundred lines become maintenance burdens. Extract complex logic into tested shell scripts or Mix tasks. The Prismatic Platform enforces this by forbidding literal block scalars and heredocs in GitLab CI YAML, requiring extraction to `scripts/` directory.

**Ignoring security in CI.** CI systems have elevated access to secrets, deployment credentials, and production environments. Treat CI configuration as security-critical code. Review pipeline changes for secret exposure, use protected variables, and restrict who can modify pipeline configuration.

**Cache invalidation failures.** Stale caches can cause false CI successes where the pipeline passes due to cached artifacts that mask actual failures. Implement cache key strategies that invalidate on dependency changes (e.g., using `mix.lock` hash as cache key) and periodically run uncached pipeline validation.

## Related Concepts

- [Continuous Deployment](/glossary/continuous-deployment/) -- Automated deployment following successful CI validation
- [GitLab CI/CD](/glossary/gitlab-ci/) -- The CI/CD platform executing the Prismatic pipeline
- [Quality Gates](/glossary/quality-gates/) -- Automated checks enforced during CI pipeline stages
- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) -- Local validation forming the first layer of CI
- [Zero Warning Policy](/glossary/zero-warning-policy/) -- Compilation standard enforced through CI
- [Credo](/glossary/credo/) -- Static analysis tool integrated as a CI quality gate
- [Dialyzer](/glossary/dialyzer/) -- Type analysis tool running in the CI analyze stage
- [GitOps](/glossary/gitops/) -- Operational framework where CI drives infrastructure changes

## See Also

- [Architecture](/architecture/) -- CI/CD architecture within the platform
- [Technologies](/technologies/) -- CI tooling stack details
- [Apps](/apps/) -- Umbrella applications validated by the CI pipeline

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)