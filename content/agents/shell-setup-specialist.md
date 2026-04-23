+++
title = "shell-setup-specialist"
weight = 374
[extra]
domain = "developer-productivity"
level = "L3"
description = "Expert agent for shell environment configuration, dotfile management, and developer productivity optimization"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 141
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["shell-setup-specialist", "Expert", "agents", "agent", "Prismatic Platform", "Specialist", "Shell Setup", "Elixir", "The Shell"]
tags = ["agents", "agent", "shell-setup-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "shell-setup-specialist - Prismatic Platform"
+++

## Overview

The Shell Setup Specialist is an L3 agent operating in the **developer-productivity** domain of the Prismatic Platform. This agent is responsible for configuring, optimizing, and maintaining shell environments, dotfile configurations, and developer tooling setups that maximize productivity across the platform's development team. From Zsh configuration and Git hooks to Elixir/[OTP](/glossary/otp/) development environment optimization, the Shell Setup Specialist ensures every developer has a consistent, high-performance workspace that enforces the platform's quality standards from the moment they open a terminal.

Shell environment consistency is a foundational requirement for a platform of this scale. With 90 umbrella applications, thousands of Mix tasks, and strict pre-commit quality gates, an improperly configured development environment can lead to silent quality degradation, inconsistent test results, or bypassed enforcement mechanisms. The Shell Setup Specialist eliminates this risk by providing deterministic, reproducible shell configurations.

This agent is part of the platform's 434-strong autonomous agent ecosystem, contributing to the self-evolving, deterministic intelligence infrastructure under the [AIAD](/glossary/aiad/) standard.

## Core Responsibilities

| Responsibility | Description | Scope |
|---------------|-------------|-------|
| **Shell Configuration** | Zsh/Bash profiles, aliases, functions, completions | All developers |
| **Git Hook Management** | Pre-commit, commit-msg, pre-push hook installation | Repository-wide |
| **Environment Variables** | Development, staging, production env management | Per-environment |
| **Tool Version Management** | asdf/mise version pinning for Elixir, Erlang, Node.js | Project-level |
| **Path Configuration** | Binary paths, library paths, compilation flags | System-level |
| **Editor Integration** | LSP configuration, formatter settings, linter configs | Per-editor |
| **Alias Library** | Platform-specific command shortcuts and workflows | Productivity |

## Shell Configuration Architecture

The Shell Setup Specialist maintains a layered configuration architecture where each layer builds on the previous one without creating conflicts.

```bash
# Layer 1: System defaults (managed by OS)
/etc/zshrc

# Layer 2: Platform base configuration
~/.prismatic/shell/base.zsh

# Layer 3: Tool-specific configurations
~/.prismatic/shell/elixir.zsh
~/.prismatic/shell/git.zsh
~/.prismatic/shell/docker.zsh

# Layer 4: Project-specific overrides
./scripts/shell-env.sh
./.envrc  # direnv integration

# Layer 5: Personal customizations (never overwritten)
~/.prismatic/shell/personal.zsh
```

### Essential Aliases and Functions

```bash
# Prismatic Platform development aliases
alias px="cd ~/dev/prismatic-platform"
alias pxtest="mix test --warnings-as-errors"
alias pxcredo="mix credo --strict"
alias pxdeps="mix deps.get && mix deps.compile"
alias pxbuild="mix compile --warnings-as-errors --force"
alias pxquality="mix quality.gates"
alias pxgt="./scripts/git-trees.sh"

# Quick navigation
alias pxweb="cd apps/prismatic_web"
alias pxapi="cd apps/prismatic_api"
alias pxagents="cd apps/prismatic_agents"

# Git workflow
alias gst="git status"
alias gco="git checkout"
alias gcm="git commit -m"
alias gpl="git pull --rebase"

# Quality gates shortcut
pxcheck() {
  echo "Running quality gates..."
  mix compile --warnings-as-errors --force && \
  mix credo --strict && \
  mix test --warnings-as-errors && \
  echo "All gates passed."
}
```

## Git Hook Configuration

The Shell Setup Specialist manages the platform's Git hook infrastructure, which enforces quality standards at every commit point.

| Hook | Purpose | Enforcement Level |
|------|---------|-------------------|
| **pre-commit** | Quality validation, format check, secret scan | Blocking |
| **commit-msg** | Conventional commit format validation | Blocking |
| **pre-push** | Full test suite, Dialyzer, Credo | Blocking |
| **post-checkout** | Dependency refresh, compilation check | Advisory |
| **post-merge** | Dependency update detection | Advisory |

```elixir
defmodule PrismaticAgents.ShellSetupSpecialist do
  @moduledoc """
  L3 Shell Setup Specialist agent.
  Manages developer environment configuration and productivity tooling.
  """

  use GenServer
  require Logger

  @config_check_interval_ms :timer.hours(1)

  defstruct [
    :last_config_check,
    :detected_issues,
    :environment_profile,
    status: :monitoring
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_config_check()
    {:ok, %__MODULE__{environment_profile: detect_environment()}}
  end

  @impl true
  def handle_info(:check_config, state) do
    issues = validate_developer_environment(state.environment_profile)

    :telemetry.execute(
      [:prismatic, :agents, :shell_setup, :config_check],
      %{issue_count: length(issues)},
      %{profile: state.environment_profile}
    )

    schedule_config_check()
    {:noreply, %{state | detected_issues: issues, last_config_check: DateTime.utc_now()}}
  end

  defp detect_environment do
    %{
      shell: System.get_env("SHELL"),
      elixir_version: System.version(),
      otp_release: :erlang.system_info(:otp_release) |> List.to_string(),
      mix_env: Mix.env(),
      git_hooks_installed: File.exists?(".githooks/pre-commit")
    }
  end
end
```

## Environment Variable Management

The Shell Setup Specialist enforces strict separation between development, staging, and production environment variables. Secrets are never stored in dotfiles and are instead managed through the platform's secrets management infrastructure.

| Variable Category | Storage | Access Method |
|------------------|---------|---------------|
| **Development** | `.envrc` (direnv) | Automatic per-directory |
| **Staging** | Fly.io secrets | `flyctl secrets` |
| **Production** | Fly.io secrets + vault | Runtime injection |
| **Build-time** | `config/` Elixir configs | Compile-time |
| **Test** | `config/test.exs` | Mix environment |

## Tool Version Pinning

Consistent tool versions across all developers prevent the "works on my machine" class of defects.

| Tool | Version Manager | Pinned Version | Configuration |
|------|----------------|----------------|---------------|
| **Elixir** | asdf/mise | 1.19.x | `.tool-versions` |
| **Erlang/OTP** | asdf/mise | 27.x | `.tool-versions` |
| **Node.js** | asdf/mise | 20.x LTS | `.tool-versions` |
| **PostgreSQL** | System | 16.x | `docker-compose.yml` |
| **Zola** | Direct install | 0.22.1 | Manual |

## IEx and Development REPL Configuration

A significant portion of Elixir development occurs within the Interactive Elixir shell (IEx). The Shell Setup Specialist configures IEx with platform-specific helpers, custom inspectors, and convenience functions that accelerate common development tasks.

```elixir
# .iex.exs (managed by Shell Setup Specialist)
import_if_available(Ecto.Query)

# Platform module shortcuts
alias PrismaticWeb.Router.Helpers, as: Routes
alias Prismatic.Repo

# Custom helpers for development
defmodule H do
  @moduledoc false

  def agents do
    PrismaticAgents.Registry.list_agents()
    |> Enum.map(& &1.name)
    |> Enum.sort()
  end

  def quality do
    Mix.Tasks.Quality.Gates.run([])
  end

  def routes do
    PrismaticWeb.Router.__routes__()
    |> Enum.map(fn r -> {r.verb, r.path, r.plug} end)
  end

  def app_count do
    Path.wildcard("apps/*/mix.exs") |> length()
  end
end

# ANSI colors for better visibility
IEx.configure(
  colors: [
    eval_result: [:cyan, :bright],
    eval_error: [:red, :bright],
    eval_info: [:yellow]
  ],
  inspect: [
    limit: 50,
    pretty: true,
    width: 100
  ]
)

IO.puts("\n  Prismatic Platform IEx - #{length(Application.started_applications())} apps loaded")
IO.puts("  Type H.agents/0, H.quality/0, H.routes/0 for helpers\n")
```

## Diagnostic and Troubleshooting Tools

The Shell Setup Specialist provides a suite of diagnostic tools that developers can use to quickly identify and resolve common development environment issues.

| Tool | Purpose | Invocation | Output |
|------|---------|------------|--------|
| **px-doctor** | Full environment health check | `px-doctor` | Pass/fail report |
| **px-deps-check** | Dependency version verification | `px-deps-check` | Version comparison |
| **px-hooks-verify** | Git hook integrity check | `px-hooks-verify` | Hook status report |
| **px-compile-stats** | Compilation time breakdown | `px-compile-stats` | Per-app timing |
| **px-env-diff** | Compare env against reference | `px-env-diff` | Divergence report |
| **px-beam-info** | BEAM/OTP system information | `px-beam-info` | System summary |

## Productivity Metrics

The Shell Setup Specialist tracks developer productivity metrics to validate that environment configurations are achieving their intended efficiency gains. These metrics are collected through [telemetry](/glossary/telemetry/) events emitted by the diagnostic tools and compiled into weekly reports for the development team.

| Metric | Baseline | Optimized | Improvement |
|--------|----------|-----------|-------------|
| **Cold compilation** | 180s | 90s | 50% faster |
| **Incremental compilation** | 15s | 5s | 67% faster |
| **Test suite (full)** | 120s | 80s | 33% faster |
| **Git hook execution** | 45s | 20s | 56% faster |
| **Environment setup (new dev)** | 4 hours | 30 min | 87% faster |
| **IEx boot time** | 12s | 6s | 50% faster |
| **Dependency resolution** | 30s | 15s | 50% faster |

## Integration Points

- [**Autonomous Self-Healing**](/capabilities/autonomous-self-healing/) -- Auto-detects and repairs broken environment configurations
- [**Telemetry Integration**](/capabilities/telemetry-integration/) -- Monitors build and test performance metrics
- [**Quality Gates**](/capabilities/quality-gates/) -- Git hooks enforce quality gates at every commit
- [**AIAD Standard**](/capabilities/aiad-standard/) -- Full compliance with agent specification

## Developer Onboarding Automation

One of the Shell Setup Specialist's highest-impact contributions is automating the developer onboarding process. New team members can go from a bare machine to a fully functional development environment in under 30 minutes by running the platform's bootstrap script, which the Shell Setup Specialist maintains and validates.

| Onboarding Step | Manual Time | Automated Time | Automation Method |
|----------------|-------------|----------------|-------------------|
| **Install asdf/mise** | 15 minutes | 2 minutes | Bootstrap script |
| **Install Elixir/Erlang** | 30 minutes | 5 minutes | `.tool-versions` + asdf |
| **Clone and setup repo** | 20 minutes | 3 minutes | `scripts/setup-dev.sh` |
| **Install dependencies** | 15 minutes | 5 minutes | `mix deps.get && mix deps.compile` |
| **Configure Git hooks** | 20 minutes | 1 minute | `scripts/install-hooks.sh` |
| **Configure shell** | 60 minutes | 2 minutes | `scripts/setup-shell.sh` |
| **Verify environment** | 30 minutes | 5 minutes | `px-doctor` diagnostic tool |
| **First compilation** | 10 minutes | 7 minutes | `mix compile --warnings-as-errors` |
| **Total** | 4+ hours | ~30 minutes | 87% time reduction |

## AIAD Specification Compliance

| AIAD Component | Status |
|----------------|--------|
| Agent specification file | Compliant |
| Behavioral rules | 10 rules defined |
| [Telemetry](/glossary/telemetry/) integration | Full coverage |
| [NM/ND doctrine](/glossary/no-mercy/) enforcement | Active |
| [SEADF](/glossary/seadf/) integration | Registered |

## Related Agents

Agents in the **developer-productivity** domain work together to ensure maximum development efficiency.

- [**UI Flowbite Specialist**](/agents/ui-flowbite-specialist/) -- Frontend development tooling and component library management
- [**Source Archive Specialist**](/agents/source-archive-specialist/) -- Code packaging and distribution optimization
- [**Type Inference Debugger**](/agents/type-inference-debugger/) -- Dialyzer integration and IDE-level type feedback

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to enforce environment standards across all development workstations.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)