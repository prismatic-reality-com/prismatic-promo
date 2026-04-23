+++
title = "CI/CD Pipeline Architecture for a 94-App Umbrella"
date = 2026-03-16
description = "GitLab CI/CD pipeline design for the Prismatic Platform: multi-stage compilation, doctrine validation, deploy gates, artifact management, and production deployment."

[extra]
author = "Tomas Korcak (korczis)"
category = "architecture"
tags = ["ci-cd", "gitlab", "deployment", "pipeline", "devops"]
reading_time = "9 min"
keywords = ["gitlab ci cd", "elixir ci pipeline", "doctrine validation", "deploy gates", "umbrella deployment"]
image = "/images/blog/ci-cd-pipeline-architecture.png"
word_count = 1100
date_created = "2026-03-16"
date_modified = "2026-03-16"
quality_score = 85
see_also = ["gitlab-ci", "deployment", "quality-gate", "testing", "release"]
image_alt = "CI/CD Pipeline Architecture for a 94-App Umbrella - Prismatic Platform"
+++

Running CI/CD for a 94-app Elixir umbrella requires careful pipeline design. Naive approaches either take too long (compiling everything on every push) or miss critical regressions (only testing changed apps). The Prismatic Platform's GitLab CI pipeline balances thoroughness with speed through multi-stage gates, selective compilation, and artifact caching.

## Pipeline Stages

The pipeline runs in six sequential stages. Each stage acts as a quality gate: if it fails, subsequent stages do not execute.

| Stage | Purpose | Duration | Blocking |
|-------|---------|----------|----------|
| `compile` | Compile with warnings-as-errors | 2-4 min | Yes |
| `lint` | Credo + format check + doctrine validation | 1-2 min | Yes |
| `test` | ExUnit test suite with coverage | 3-8 min | Yes |
| `security` | Dependency audit + SEAL checks | 1-2 min | Yes |
| `build` | Docker image + release artifact | 2-3 min | Yes |
| `deploy` | Fly.io deployment with health checks | 2-5 min | Manual gate |

## GitLab CI Configuration

The `.gitlab-ci.yml` defines the pipeline with shared caching and per-stage rules:

```yaml
stages:
  - compile
  - lint
  - test
  - security
  - build
  - deploy

variables:
  MIX_ENV: test
  ELIXIR_VERSION: "1.17"
  OTP_VERSION: "27"

cache:
  key: "${CI_COMMIT_REF_SLUG}-${ELIXIR_VERSION}"
  paths:
    - deps/
    - _build/
  policy: pull-push

compile:
  stage: compile
  script:
    - mix deps.get
    - mix compile --warnings-as-errors --force
  artifacts:
    paths:
      - _build/
      - deps/
    expire_in: 1 hour

lint:
  stage: lint
  needs: [compile]
  script:
    - mix format --check-formatted
    - mix credo --strict
    - mix check.doctrines
  allow_failure: false

test:
  stage: test
  needs: [compile]
  services:
    - postgres:16-alpine
    - meilisearch/meilisearch:v1.6
  variables:
    DATABASE_URL: "postgres://postgres:postgres@postgres:5432/prismatic_test"
    MEILISEARCH_URL: "http://meilisearch:7700"
  script:
    - mix ecto.create
    - mix ecto.migrate
    - mix test --cover --warnings-as-errors
  artifacts:
    reports:
      junit: _build/test/junit/*.xml
    paths:
      - cover/
```

## Compilation Stage

The compilation stage is the first gate. It uses `--warnings-as-errors` to catch deprecation warnings, unused variables, and missing function clauses. The `--force` flag ensures a clean compile:

```elixir
# mix.exs project configuration ensuring strict compilation
defmodule PrismaticPlatform.MixProject do
  @moduledoc """
  Root umbrella project configuration.
  """

  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "18.4.0",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      aliases: aliases(),
      dialyzer: [
        plt_add_apps: [:mix, :ex_unit],
        plt_core_path: "_build/#{Mix.env()}"
      ]
    ]
  end

  defp aliases do
    [
      "compile.strict": ["compile --warnings-as-errors --force"],
      quality: [
        "compile --warnings-as-errors",
        "format --check-formatted",
        "credo --strict",
        "test --cover"
      ]
    ]
  end
end
```

## Doctrine Validation in CI

The `mix check.doctrines` task validates all 17 enforceable doctrine pillars. Each pillar has its own checker module that scans the codebase:

```elixir
defmodule Mix.Tasks.Check.Doctrines do
  @moduledoc """
  Validates all doctrine pillars in the CI pipeline.

  Runs each pillar's checker and aggregates results.
  Returns exit code 1 if any blocking pillar fails.
  """

  use Mix.Task

  @blocking_pillars ~w(ZERO SEAL PERF HYGIENE NMND TACH DOCS DEPS RDME)
  @advisory_pillars ~w(FLLM M5M OTEL GITL KNOW NCLB NWB NLLB)

  @spec run(list()) :: :ok
  def run(args) do
    changed_only = "--changed" in args

    results =
      all_pillars()
      |> Enum.map(fn pillar ->
        checker = pillar_checker(pillar)
        {pillar, checker.validate(changed_only: changed_only)}
      end)

    blocking_failures =
      results
      |> Enum.filter(fn {pillar, result} ->
        pillar in @blocking_pillars and result.status == :fail
      end)

    advisory_warnings =
      results
      |> Enum.filter(fn {pillar, result} ->
        pillar in @advisory_pillars and result.status == :fail
      end)

    print_report(results)

    if advisory_warnings != [] do
      Mix.shell().info("Advisory warnings: #{length(advisory_warnings)} pillars")
    end

    if blocking_failures != [] do
      Mix.raise("Doctrine validation failed: #{Enum.map_join(blocking_failures, ", ", &elem(&1, 0))}")
    end
  end

  defp all_pillars, do: @blocking_pillars ++ @advisory_pillars

  defp pillar_checker("ZERO"), do: PrismaticQuality.Doctrines.Zero
  defp pillar_checker("SEAL"), do: PrismaticQuality.Doctrines.Seal
  defp pillar_checker("PERF"), do: PrismaticQuality.Doctrines.Perf
  defp pillar_checker("TACH"), do: PrismaticQuality.Doctrines.Tach
  defp pillar_checker("DOCS"), do: PrismaticQuality.Doctrines.Docs
  defp pillar_checker("DEPS"), do: PrismaticQuality.Doctrines.Deps
  defp pillar_checker("RDME"), do: PrismaticQuality.Doctrines.Rdme
  defp pillar_checker(other), do: PrismaticQuality.Doctrines.Generic.for(other)
end
```

## Deploy Gates

Production deployment requires manual approval and passes through a three-phase validation pipeline:

```elixir
defmodule PrismaticDeploy.Pipeline do
  @moduledoc """
  Three-phase deployment validation pipeline.

  Phase 1: Pre-deploy quality gates
  Phase 2: Deploy to target with blue/green swap
  Phase 3: Post-deploy health and functional checks
  """

  require Logger

  @spec run(String.t(), keyword()) :: :ok | {:error, term()}
  def run(target, opts \\ []) do
    with :ok <- phase1_pre_deploy(target, opts),
         :ok <- phase2_deploy(target, opts),
         :ok <- phase3_post_deploy(target, opts) do
      Logger.info("Deploy to #{target} completed successfully")
      :ok
    else
      {:error, phase, reason} ->
        Logger.error("Deploy failed at #{phase}: #{inspect(reason)}")
        maybe_rollback(target, opts)
        {:error, {phase, reason}}
    end
  end

  defp phase1_pre_deploy(target, _opts) do
    checks = [
      {"compilation", fn -> System.cmd("mix", ["compile", "--warnings-as-errors"]) end},
      {"tests", fn -> System.cmd("mix", ["test"]) end},
      {"doctrines", fn -> System.cmd("mix", ["check.doctrines"]) end},
      {"security", fn -> System.cmd("mix", ["deps.audit"]) end}
    ]

    results = Enum.map(checks, fn {name, check_fn} ->
      {name, check_fn.()}
    end)

    failures = Enum.filter(results, fn {_name, {_output, code}} -> code != 0 end)

    if failures == [] do
      :ok
    else
      {:error, :pre_deploy, "Failed checks: #{Enum.map_join(failures, ", ", &elem(&1, 0))}"}
    end
  end
end
```

## Artifact Management

Build artifacts are managed through GitLab's artifact system with Docker image layering for efficient caching:

```dockerfile
# Multi-stage Dockerfile for Elixir release
FROM elixir:1.17-otp-27-alpine AS build

RUN apk add --no-cache build-base git

WORKDIR /app
ENV MIX_ENV=prod

COPY mix.exs mix.lock ./
COPY apps/*/mix.exs apps/*/
RUN mix deps.get --only prod && mix deps.compile

COPY apps apps
COPY config config
RUN mix release prismatic_platform

# Runtime stage
FROM alpine:3.19 AS runtime

RUN apk add --no-cache libstdc++ openssl ncurses-libs

COPY --from=build /app/_build/prod/rel/prismatic_platform ./app

ENV PHX_HOST=prismatic.fly.dev
ENV PORT=4000

CMD ["/app/bin/prismatic_platform", "start"]
```

## Selective Testing

For large PRs, running the full test suite on every push is wasteful. The pipeline detects changed apps and runs only relevant tests:

```elixir
defmodule Mix.Tasks.Test.Changed do
  @moduledoc """
  Runs tests only for umbrella apps that have changed
  since the base branch. Falls back to full suite if
  changes affect shared config or the root.
  """

  use Mix.Task

  @spec run(list()) :: :ok
  def run(_args) do
    changed_files = get_changed_files()
    changed_apps = detect_changed_apps(changed_files)

    cond do
      affects_root?(changed_files) ->
        Mix.shell().info("Root changes detected, running full suite")
        Mix.Task.run("test", ["--cover"])

      changed_apps == [] ->
        Mix.shell().info("No app changes detected, skipping tests")

      true ->
        Mix.shell().info("Running tests for: #{Enum.join(changed_apps, ", ")}")
        for app <- changed_apps do
          Mix.Task.run("cmd", [
            "--app", app, "mix", "test", "--cover"
          ])
        end
    end
  end

  defp get_changed_files do
    {output, 0} = System.cmd("git", ["diff", "--name-only", "origin/main...HEAD"])
    String.split(output, "\n", trim: true)
  end

  defp detect_changed_apps(files) do
    files
    |> Enum.filter(&String.starts_with?(&1, "apps/"))
    |> Enum.map(fn path ->
      path |> String.split("/") |> Enum.at(1)
    end)
    |> Enum.uniq()
  end
end
```

| Pipeline Metric | Target | Current |
|-----------------|--------|---------|
| Full pipeline duration | < 15 min | ~12 min |
| Compilation (cold) | < 5 min | ~3.5 min |
| Compilation (cached) | < 2 min | ~1.5 min |
| Test suite | < 10 min | ~6 min |
| Docker build (cached) | < 3 min | ~2 min |
| Deploy + health check | < 5 min | ~3 min |

The pipeline is the enforcement backbone of the 18-pillar doctrine system. Every commit passes through compilation, linting, doctrine validation, testing, and security checks before it can reach production. Manual deploy gates ensure human oversight for the final step.
