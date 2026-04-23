+++
title = "Mix"
weight = 63
[extra]
category = "testing"
description = "Build tool for compiling, testing, managing dependencies, and running custom tasks in Elixir projects"
url = "https://hexdocs.pm/mix/"
version = "Built-in"
icon = "mix"
color = "purple"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 895
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Mix", "Build", "Elixir", "technologies", "testing", "Prismatic Platform", "Built"]
tags = ["technologies", "testing", "mix", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Mix - Prismatic Platform"
+++

## Overview

Mix is [Elixir](@/technologies/elixir.md)'s built-in build tool and the command-line interface through which all Prismatic Platform development operations are executed. It handles project compilation, dependency management, test execution, release building, and custom task execution -- serving as the unified entry point for the platform's entire development workflow. Every developer interaction with the platform starts with a `mix` command, making it the most frequently used tool in the development process.

The Prismatic Platform extends Mix with dozens of custom tasks that power its quality enforcement, evolution, and operational systems: `mix quality.gates`, `mix autoheal.cycle`, `mix autoevolve.mega`, `mix git_trees`, `mix promo.enhance`, and many more. These custom tasks integrate deeply with the platform's [NO MERCY](@/capabilities/no-mercy.md) quality doctrine, blocking operations that would degrade code quality. The custom task library represents a significant investment in tooling -- each task enforces a specific aspect of the platform's quality standards.

Mix's umbrella project support is essential for the platform's 90-application architecture, managing inter-application dependencies, coordinated compilation, and unified test execution across the entire umbrella. A single `mix test` command runs tests across all 90 applications, and `mix compile --warnings-as-errors` ensures zero compilation warnings across the entire codebase.

## Key Features

- **Dependency Management**: Hex package resolution with lock file and dependency tree visualization
- **Compilation**: Incremental compilation with dependency tracking, detecting when only affected modules need recompilation
- **Testing**: Parallel test execution with coverage reporting, tag-based filtering, and failure tracing
- **Release Building**: Production release assembly with runtime configuration and boot scripts
- **Custom Tasks**: Extensible task system for project-specific workflows with argument parsing and documentation
- **Umbrella Projects**: Multi-application project management with dependency ordering and selective compilation
- **Aliases**: Command composition for frequently used multi-step workflows
- **Environment Separation**: dev, test, and prod environments with independent configurations

## Platform Integration

Mix custom tasks power the platform's quality and evolution systems. The following example shows the quality gates task that enforces the NO MERCY doctrine.

```elixir
defmodule Mix.Tasks.Quality.Gates do
  @moduledoc """
  Run all quality gates: compilation, formatting, Credo, Dialyzer, and tests.
  Fails immediately if any gate does not pass.
  """
  use Mix.Task

  @shortdoc "Run all quality gates"
  def run(_args) do
    gates = [
      {"Compilation", fn -> Mix.Task.run("compile", ["--warnings-as-errors", "--force"]) end},
      {"Formatting", fn -> Mix.Task.run("format", ["--check-formatted"]) end},
      {"Credo", fn -> Mix.Task.run("credo", ["--strict"]) end},
      {"Dialyzer", fn -> Mix.Task.run("dialyzer") end},
      {"Tests", fn -> Mix.Task.run("test", ["--cover"]) end}
    ]

    results = Enum.map(gates, fn {name, gate_fn} ->
      Mix.shell().info("Running #{name}...")
      try do
        gate_fn.()
        {name, :passed}
      rescue
        _ -> {name, :failed}
      end
    end)

    failed = Enum.filter(results, fn {_, status} -> status == :failed end)

    if failed != [] do
      failed_names = Enum.map(failed, &elem(&1, 0))
      Mix.raise("Quality gates failed: #{Enum.join(failed_names, ", ")}")
    else
      Mix.shell().info("All quality gates passed.")
    end
  end
end
```

## Architecture

Mix serves as the orchestration layer for all development operations, invoking Elixir compiler, test runner, and custom tasks.

| Mix Component | Role | Platform Usage |
|--------------|------|----------------|
| Compiler | Incremental compilation with dependency tracking | `mix compile --warnings-as-errors` |
| Dependency Manager | Hex package resolution and fetching | `mix deps.get`, `mix deps.update` |
| Test Runner | Parallel execution with coverage | `mix test --cover` |
| Release Builder | Production binary creation | `mix release` |
| Task System | Custom task execution | `mix quality.gates`, `mix git_trees` |
| Umbrella Manager | Multi-app coordination | `mix cmd --app prismatic_web mix test` |
| Alias System | Workflow composition | `mix setup`, `mix quality` |

The custom task library is organized by domain within the platform's codebase.

| Task Category | Location | Key Tasks |
|--------------|----------|-----------|
| Quality | `apps/prismatic/lib/mix/tasks/quality/` | `quality.gates`, `quality.enforce_standard` |
| Evolution | `apps/prismatic/lib/mix/tasks/` | `autoheal.cycle`, `autoevolve.mega` |
| Codebase | `apps/prismatic/lib/mix/tasks/` | `git_trees`, `git_trees.find` |
| Promo | `apps/prismatic/lib/mix/tasks/` | `promo.enhance` |
| Supervisor | `apps/prismatic_supervisor/lib/mix/tasks/` | `supervisor`, `supervisor.discover` |
| API | `apps/prismatic_api/lib/mix/tasks/` | API endpoint scanning |

## Custom Task Catalog

The platform's custom Mix tasks represent the programmatic interface to its quality and operational systems.

| Task | Purpose | Usage |
|------|---------|-------|
| `mix quality.gates` | Run all quality gates | `mix quality.gates` |
| `mix quality.enforce_standard` | Check app compliance | `mix quality.enforce_standard --fix` |
| `mix quality.standardize_mix` | Standardize mix.exs files | `mix quality.standardize_mix --apply` |
| `mix autoheal.baseline` | Establish quality baseline | `mix autoheal.baseline` |
| `mix autoheal.cycle` | Run healing cycle | `mix autoheal.cycle` |
| `mix autoevolve.mega` | Full evolution sweep | `mix autoevolve.mega` |
| `mix autoevolve status` | Evolution status | `mix autoevolve status --brief` |
| `mix git_trees` | Repository statistics | `mix git_trees` |
| `mix git_trees find` | Find files by pattern | `mix git_trees find "\.ex$"` |
| `mix git_trees apps` | List apps with counts | `mix git_trees apps` |
| `mix promo.enhance` | Enhance promo content | `mix promo.enhance --section agents` |
| `mix supervisor` | Supervisor status | `mix supervisor` |
| `mix supervisor.discover` | Auto-discover apps | `mix supervisor.discover` |

## Performance Characteristics

Mix compilation and task execution performance directly impacts development velocity.

| Operation | Time | Notes |
|-----------|------|-------|
| Clean compilation (full) | ~120s | All 90 apps from scratch |
| Incremental compilation | ~5-15s | Typical change in 1-3 modules |
| `mix test` (full suite) | ~180s | All tests across umbrella |
| `mix test` (single app) | ~10-30s | Targeted app testing |
| `mix credo --strict` | ~30s | Full codebase analysis |
| `mix dialyzer` (cached PLT) | ~120s | With pre-built PLT |
| `mix dialyzer` (fresh PLT) | ~600s | First run, building PLT |
| `mix format --check-formatted` | ~10s | Full codebase format check |
| `mix deps.get` | ~15s | Dependency resolution |
| `mix quality.gates` (full) | ~480s | All gates sequential |

The platform uses Mix's incremental compilation to keep the development feedback loop under 15 seconds for typical changes. Only modules whose source files or dependencies have changed are recompiled.

## Configuration

The root `mix.exs` configures the umbrella project with shared settings, aliases, and dependencies.

```elixir
# mix.exs - Umbrella root configuration
defmodule Prismatic.MixProject do
  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "7.5.0",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      aliases: aliases(),
      preferred_cli_env: [
        "quality.gates": :test,
        "test": :test,
        dialyzer: :dev
      ],
      dialyzer: [
        plt_file: {:no_warn, "priv/plts/dialyzer.plt"},
        plt_add_apps: [:mix, :ex_unit]
      ]
    ]
  end

  defp aliases do
    [
      setup: ["deps.get", "ecto.setup"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"],
      quality: ["compile --warnings-as-errors", "format --check-formatted",
                "credo --strict", "test --cover"]
    ]
  end

  defp deps do
    [
      {:credo, "~> 1.7", only: [:dev, :test], runtime: false},
      {:dialyxir, "~> 1.4", only: [:dev], runtime: false},
      {:ex_doc, "~> 0.31", only: :dev, runtime: false}
    ]
  end
end
```

Individual app `mix.exs` files follow a standardized format enforced by `mix quality.standardize_mix`.

```elixir
# Standard app mix.exs (enforced by quality.standardize_mix)
defmodule PrismaticPerimeter.MixProject do
  use Mix.Project

  def project do
    [
      app: :prismatic_perimeter,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.19",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      test_coverage: [threshold: 80],
      dialyzer: [plt_add_apps: [:mix]]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]
end
```

## Best Practices

- **Use aliases for common workflows** -- define `mix quality` and `mix setup` aliases to standardize multi-step operations
- **Set `preferred_cli_env`** -- ensure tasks run in the correct environment; `quality.gates` and `test` should default to `:test`
- **Write custom tasks with `@shortdoc`** -- the `@shortdoc` attribute makes tasks visible in `mix help` output
- **Use `--warnings-as-errors`** on compilation -- this is mandatory in the platform; any compilation warning is a blocking error
- **Run `mix dialyzer` with cached PLT** -- cache the PLT file to avoid rebuilding on every run; the platform stores PLTs in `priv/plts/`
- **Test individual apps during development** -- use `mix cmd --app <app_name> mix test` to run tests for a single app instead of the full suite
- **Keep mix.exs standardized** -- run `mix quality.standardize_mix --apply` to ensure all 90 app configurations follow the platform standard
- **Never run `mix` in production** -- use compiled releases (`mix release`) for production deployment

## Comparison with Alternatives

| Feature | Mix | Make | npm/yarn | Cargo | Gradle |
|---------|-----|------|----------|-------|--------|
| Language | Elixir-native | Language-agnostic | JavaScript | Rust-native | JVM |
| Dependency Manager | Hex (built-in) | External | npm registry | crates.io | Maven Central |
| Test Runner | Built-in | External | External (Jest/Mocha) | Built-in | Built-in |
| Custom Tasks | First-class | Targets | npm scripts | Build scripts | Gradle tasks |
| Umbrella Support | Built-in | Manual | Workspaces | Workspaces | Multi-project |
| Incremental Builds | Yes | Timestamp-based | Partial | Yes | Yes |
| Release Building | Built-in | External | External (webpack) | Built-in | Built-in |
| Parallel Execution | Tests only | `-j` flag | Limited | Yes | Yes |

Mix is the natural and only build tool for Elixir projects. Its deep integration with the language compiler, OTP release system, and Hex package manager makes it irreplaceable in the platform's toolchain.

## Related Technologies

- [Elixir](@/technologies/elixir.md) - The language Mix is built for and ships with
- [ExUnit](@/technologies/exunit.md) - Testing framework executed through Mix
- [Dialyzer](@/technologies/dialyzer.md) - Static analysis run through Mix via dialyxir
- [Credo](@/technologies/credo.md) - Code quality analysis invoked through Mix
- [Ecto](@/technologies/ecto.md) - Database migrations managed through Mix tasks
- [Phoenix](@/technologies/phoenix.md) - Web framework with Mix tasks for routes, generators, and server management

## Related Apps

- All 90 Prismatic Platform applications are built, tested, and managed with Mix
- [prismatic_safety](@/apps/prismatic-safety.md) - Quality gate tasks implemented as Mix tasks
- [prismatic_web](@/apps/prismatic-web.md) - Phoenix-specific Mix tasks for web development

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)