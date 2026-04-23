+++
title = "CI/CD"
weight = 50
[extra]
description = "Continuous Integration and Continuous Deployment -- an automated software delivery practice that builds, tests, and deploys code changes through a repeatable pipeline"
category = "devops"
related_terms = ["compilation", "code-quality", "containerization", "canary-release", "compile-time"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["CI/CD", "continuous integration", "continuous deployment", "pipeline", "GitLab CI", "Fly.io", "glossary", "Prismatic Platform"]
tags = ["glossary", "devops", "automation"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "CI/CD - Prismatic Platform"
+++

## Definition & Overview

CI/CD (Continuous Integration / Continuous Deployment) is an automated software delivery methodology where code changes are continuously built, tested, and deployed through a standardized pipeline. Continuous Integration focuses on merging developer changes into a shared repository frequently, with each merge triggering automated builds and tests. Continuous Deployment extends this by automatically releasing validated changes to production without manual intervention.

The practice emerged from Extreme Programming (XP) in the late 1990s and became industry standard through tools like Jenkins, Travis CI, and later GitLab CI, GitHub Actions, and CircleCI. Modern CI/CD pipelines encompass far more than build-and-test: they include static analysis, security scanning, compliance checks, performance benchmarks, infrastructure provisioning, and progressive rollouts.

The Prismatic Platform operates one of the most rigorous CI/CD pipelines in its class, enforcing 11-phase pre-commit hooks locally and a comprehensive GitLab CI pipeline for remote validation. The pipeline enforces the NO MERCY doctrine -- zero tolerance for compilation warnings, Credo violations, Dialyzer errors, forbidden patterns, or test failures. Every commit must pass all quality gates before reaching the `main` branch, and every merge triggers automatic deployment to Fly.io staging and production environments.

## Technical Deep Dive

### Pipeline Architecture

| Phase | Local (Pre-commit) | Remote (GitLab CI) | Enforcement |
|-------|-------------------|-------------------|-------------|
| 1 | Compilation (`--warnings-as-errors`) | Full build | BLOCKING |
| 2 | Credo strict analysis | Credo + custom rules | BLOCKING |
| 3 | Dialyzer type checking | Dialyzer with PLT cache | BLOCKING |
| 4 | Forbidden patterns scan | Pattern enforcement | BLOCKING |
| 5 | Unit tests (changed files) | Full test suite | BLOCKING |
| 6 | Quality gates check | Quality score validation | BLOCKING |
| 7 | TODO management | TODO inventory audit | WARNING |
| 8 | Template validation | Promo template check | BLOCKING |
| 9 | Security scan | Dependency audit | BLOCKING |
| 10 | Design consistency | Flowbite sidebar validation | BLOCKING |
| 11 | Quality DNA update | Quality DNA persistence | INFORMATIONAL |

### GitLab CI Configuration Pattern

```yaml
# .gitlab-ci.yml (Prismatic Platform pattern)
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
  cache:
    key: deps-$CI_COMMIT_REF_SLUG
    paths:
      - deps/
      - _build/

analyze:
  stage: analyze
  script:
    - mix credo --strict
    - mix quality.forbidden_patterns
  needs:
    - compile

test:
  stage: test
  script:
    - mix test --cover
  coverage: '/(\d+\.\d+)% coverage/'
  needs:
    - compile

quality_gates:
  stage: quality
  script:
    - mix quality.gates
  needs:
    - analyze
    - test

deploy_staging:
  stage: deploy
  script:
    - flyctl deploy --app prismatic-staging
  environment:
    name: staging
    url: https://prismatic-staging.fly.dev
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  needs:
    - quality_gates
```

### Elixir-Specific CI Optimizations

```elixir
defmodule PrismaticCI.BuildOptimizer do
  @moduledoc """
  CI pipeline optimization utilities.
  Determines affected apps in umbrella for targeted testing.
  """

  @spec affected_apps(String.t(), String.t()) :: [atom()]
  def affected_apps(base_ref, head_ref) do
    {changed_files, 0} = System.cmd("git", ["diff", "--name-only", base_ref, head_ref])

    changed_files
    |> String.split("\n", trim: true)
    |> Enum.flat_map(&extract_app/1)
    |> Enum.uniq()
    |> expand_dependents()
  end

  defp extract_app("apps/" <> rest) do
    case String.split(rest, "/", parts: 2) do
      [app_name | _] -> [String.to_atom(app_name)]
      _ -> []
    end
  end

  defp extract_app(_), do: []

  defp expand_dependents(apps) do
    all_deps = build_dependency_graph()

    apps
    |> Enum.flat_map(fn app ->
      [app | Map.get(all_deps, app, [])]
    end)
    |> Enum.uniq()
  end

  defp build_dependency_graph do
    Mix.Project.apps_paths()
    |> Enum.map(fn {app, _path} ->
      deps = Mix.Project.in_project(app, "apps/#{app}", fn _ ->
        Mix.Project.config()[:deps]
        |> Enum.filter(fn dep -> elem(dep, 0) in Mix.Project.apps_paths() |> Map.keys() end)
        |> Enum.map(&elem(&1, 0))
      end)
      {app, deps || []}
    end)
    |> Map.new()
  end
end
```

## Architecture & Implementation

The Prismatic Platform's CI/CD architecture follows a defense-in-depth model with three enforcement layers. The first layer is the local pre-commit hook (`.githooks/pre-commit`), which runs 11 validation phases before allowing a commit. This catches the majority of issues at the developer's machine, providing sub-minute feedback. The second layer is the GitLab CI pipeline, which runs the full test suite and quality gates against the complete codebase. The third layer is the Fly.io deployment pipeline, which performs health checks and canary validation before promoting a release.

The pipeline is designed for the umbrella architecture's unique challenges. With 115 apps, running the full test suite on every commit would be prohibitively slow. The `affected_apps/2` function analyzes git diffs to determine which umbrella apps were modified and expands the test scope to include dependent apps, reducing typical CI time from 15+ minutes to 3-5 minutes while maintaining correctness.

Dialyzer PLT (Persistent Lookup Table) management is critical for CI performance. The PLT is cached between pipeline runs using GitLab's cache mechanism, avoiding the 5-10 minute cold build penalty. The Nuclear Cache Fix (`rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt`) is documented as an escape hatch for corrupted PLTs.

## Usage in Prismatic Platform

Every developer interaction with the platform goes through the CI/CD pipeline. The Session Discipline Protocol mandates that every session has GitLab issues, every change is locally tested before commit, every commit is pushed immediately, and all hooks must pass without bypass (`--no-verify` is absolutely forbidden).

The Quality DNA system persists CI results across sessions, enabling the Quality Floor Guardian to detect quality regressions before they reach production. If a commit would lower the quality score below the current floor, the pipeline blocks it automatically.

Deployment to Fly.io uses a two-stage approach: staging deployment happens on every merge to `main`, while production promotion requires explicit approval after staging validation. The platform runs at `prismatic-staging.fly.dev` (staging) and `prismatic-prod.fly.dev` (production), with all pages required to load under 250ms per the Page Load Performance Standard.

## Cross-References

- [Compilation](/glossary/compilation/) - build phase in CI pipeline
- [Code Quality](/glossary/code-quality/) - quality gates enforced by CI
- [Containerization](/glossary/containerization/) - Docker builds in deployment
- [Continuous Integration](/glossary/continuous-integration/) - CI component detail
- [Continuous Deployment](/glossary/continuous-deployment/) - CD component detail
- **Livebooks**: `livebooks/domains/quality_testing/` - CI quality gate experimentation
- **Academy**: DevOps security pipeline topics

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
