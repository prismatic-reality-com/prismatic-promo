+++
title = "/archer-supreme-dx"
weight = 2100
[extra]
category = "Framework"
description = "ARCHER SUPREME Developer Experience for ultimate development workflow optimization"
syntax = "/archer-supreme-dx [options]"
authority = "SUPREME"
agent = "archer-supreme-dx-commander"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1159
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["archer-supreme-dx", "ARCHER", "SUPREME", "Developer", "Experience", "commands", "Framework", "Prismatic Platform"]
tags = ["commands", "framework", "archer-supreme-dx", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/archer-supreme-dx - Prismatic Platform"
+++

## Overview

The **/archer-supreme-dx** command is the [ARCHER SUPREME](@/glossary/archer-supreme.md) Developer Experience system -- a comprehensive development workflow optimization engine that operates at SUPREME authority level to deliver the ultimate development environment for the Prismatic Platform. In a codebase of over 2.8 million lines of code, 100+ umbrella applications, and 37,000+ files, development productivity depends critically on the quality of tooling, environment configuration, workflow automation, and integration with the platform's extensive ecosystem. The `/archer-supreme-dx` command addresses every dimension of this challenge.

The command manages five interconnected aspects of developer experience. **Environment Setup** handles shell integration, Git hooks configuration, editor integration, and MCP server initialization. **Workflow Optimization** configures command shortcuts, alias systems, auto-completion, and quick navigation across the codebase. **Productivity Tools** integrates session context management, [quality gate](@/glossary/quality-gates.md) automation, test runner integration, and documentation generation into seamless workflows. **Diagnostics** identifies and resolves development environment issues that degrade productivity. **Status Monitoring** provides a comprehensive health report of the development environment with actionable improvement recommendations.

Unlike utility commands that perform a single function, `/archer-supreme-dx` operates as a meta-command that orchestrates the entire development experience ecosystem. Executed by the `archer-supreme-dx-commander` agent, it has SUPREME authority to modify shell configurations, install Git hooks, configure MCP server connections, and optimize the development pipeline end-to-end. The SUPREME authority level ensures that DX optimizations can reach into every corner of the development environment without encountering permission barriers that would leave gaps in the optimization surface.

## Usage

```bash
/archer-supreme-dx [ACTION] [OPTIONS]
```

### Check Current DX Status and Health

```bash
/archer-supreme-dx status
```

### Full Development Environment Setup

```bash
/archer-supreme-dx setup
```

### Optimize Existing Workflows

```bash
/archer-supreme-dx optimize
```

### Enhance with Additional Productivity Tools

```bash
/archer-supreme-dx enhance
```

### Diagnose and Fix DX Issues

```bash
/archer-supreme-dx diagnose --verbose
```

## Options and Parameters

| Parameter | Position | Required | Type | Default | Description |
|-----------|----------|----------|------|---------|-------------|
| `action` | 1 | No | string | `status` | Action: `setup`, `optimize`, `enhance`, `diagnose`, `status` |
| `--profile` | -- | No | string | `default` | DX profile: `default`, `minimal`, `full` |
| `--verbose` | -- | No | boolean | `false` | Enable verbose output with detailed diagnostics |

### Action Descriptions

| Action | Purpose | Duration |
|--------|---------|----------|
| `setup` | Full environment initialization from scratch | 5-15 minutes |
| `optimize` | Tune existing configuration for maximum efficiency | 2-5 minutes |
| `enhance` | Add advanced productivity tools and integrations | 3-10 minutes |
| `diagnose` | Identify and report DX issues with remediation steps | 1-3 minutes |
| `status` | Health check and productivity score assessment | < 30 seconds |

### DX Profiles

| Profile | Description | Use Case |
|---------|-------------|----------|
| `default` | Standard development configuration with all essential tools | Most developers |
| `minimal` | Lightweight setup with core tools only | CI/CD environments, containers |
| `full` | Maximum productivity with all optional enhancements | Power users, SUPREME operators |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | SUPREME |
| **Executing Agent** | `archer-supreme-dx-commander` |
| **Status** | Production |
| **Usage Frequency** | Medium |
| **Category** | Framework / Developer Experience |
| **Model** | claude-opus-4-6 |
| **Tools** | Task, Bash, Grep, Glob, Read, Edit, Write |
| **Shell Integration** | zsh, bash |
| **Editor Support** | VS Code, Zed, Aide, Neovim |
| **MCP Servers** | 14+ server configurations |

## Technical Implementation

The DX command implements a comprehensive environment assessment and optimization pipeline. The `setup` action performs a multi-phase initialization that installs Git hooks, configures shell integrations, establishes MCP server connections, enables quality gate automation, and validates the entire configuration. Each phase reports its status and any issues encountered, ensuring complete transparency about the state of the development environment.

```elixir
defmodule PrismaticDX.Command do
  @moduledoc """
  ARCHER SUPREME Developer Experience command handler.
  Manages comprehensive development environment optimization
  with multi-phase setup, diagnostics, and health monitoring.
  """

  alias PrismaticDX.{Environment, Workflow, Productivity, Diagnostics}

  @spec execute(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def execute(action, opts \\ []) do
    profile = Keyword.get(opts, :profile, :default)
    verbose = Keyword.get(opts, :verbose, false)

    case action do
      "setup" -> setup_environment(profile, verbose)
      "optimize" -> optimize_workflows(profile, verbose)
      "enhance" -> enhance_productivity(profile, verbose)
      "diagnose" -> run_diagnostics(verbose)
      "status" -> check_status(verbose)
    end
  end

  defp setup_environment(profile, verbose) do
    phases = [
      {:shell, &Environment.configure_shell/2},
      {:git_hooks, &Environment.install_git_hooks/2},
      {:mcp_servers, &Environment.setup_mcp_servers/2},
      {:quality_gates, &Environment.enable_quality_gates/2},
      {:editor, &Environment.configure_editor/2},
      {:validation, &Environment.validate_setup/2}
    ]

    results =
      Enum.map(phases, fn {phase, func} ->
        result = func.(profile, verbose)
        {phase, result}
      end)

    {:ok, %{
      phases_completed: Enum.count(results, fn {_, r} -> match?({:ok, _}, r) end),
      total_phases: length(phases),
      details: Map.new(results)
    }}
  end

  defp check_status(verbose) do
    checks = %{
      shell: Environment.check_shell_integration(),
      git_hooks: Environment.check_git_hooks(),
      mcp_servers: Environment.check_mcp_servers(),
      quality_gates: Environment.check_quality_gates(),
      editor: Environment.check_editor_integration()
    }

    score = calculate_productivity_score(checks)

    {:ok, %{
      productivity_score: score,
      checks: checks,
      recommendations: generate_recommendations(checks),
      verbose_details: if(verbose, do: detailed_diagnostics(checks), else: nil)
    }}
  end
end
```

The `status` action computes a productivity score (0-100) based on the health of each DX component. The scoring system evaluates shell integration, Git hook installation, MCP server connectivity, quality gate configuration, and editor integration. Each component contributes to the overall score proportionally to its impact on development productivity. The `diagnose` action provides deep analysis of each component, identifying specific issues and generating targeted remediation steps.

### Status Output Structure

The status report provides a structured overview of development environment health:

```
ARCHER SUPREME DX STATUS
========================

Environment:
  Shell: zsh (integrated)
  Git hooks: Installed (pre-commit, commit-msg, pre-push)
  MCP servers: 14 active
  Quality gates: Enabled (all passing)
  Editor: Configured (VS Code + Zed)

Workflows:
  Auto-commit: Ready
  Auto-test: Ready
  Auto-doc: Ready
  Session management: Active

Productivity Score: 95/100
  - Session management: Excellent
  - Command efficiency: High
  - Integration level: Full
  - Quality automation: Complete

Recommendations:
  - Enable auto-evolution for continuous improvement
  - Configure custom aliases for frequent operations
```

## Workflow Integration

The `/archer-supreme-dx` command is typically the first command invoked when onboarding to the Prismatic Platform or when setting up a new development environment. The `setup` action provides a guided initialization that transforms a bare environment into a fully configured, optimized development workspace in minutes rather than hours.

For existing environments, the `optimize` action periodically tunes configurations based on updated platform requirements. As new MCP servers are added, new quality gates are introduced, or new Git hook phases are implemented, running `/archer-supreme-dx optimize` ensures the local environment stays aligned with the platform's evolving requirements.

The `diagnose` action is the first recourse when development environment issues arise. Rather than manually checking individual configuration files and tool installations, the diagnostic engine systematically evaluates every DX component and produces a prioritized list of issues with specific remediation steps. This eliminates the common pattern of developers spending hours debugging environment issues that a structured diagnostic could identify in seconds.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `archer-supreme-dx-commander` agent |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](@/glossary/quality-gates.md) | Configures and validates quality gate automation |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) and DX health tracking |
| Git Hooks | Installs and manages pre-commit, commit-msg, pre-push hooks |
| MCP Servers | Configures 14+ MCP server connections |
| Shell Integration | zsh/bash alias, completion, and navigation configuration |
| Editor Integration | VS Code, Zed, Aide, Neovim plugin and settings |
| [Session Context](@/glossary/session-discipline.md) | Session context management automation |
| [/agents](@/commands/agents.md) | Agent discovery integration for development workflows |
| [/aiad-dashboard](@/commands/aiad-dashboard.md) | Dashboard integration for monitoring DX metrics |

## Doctrine Compliance

All DX operations are governed by the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Development environments must be fully configured. No partial setups, no skipped phases, no optional quality gates left disabled. The `setup` action runs all phases to completion and reports failures explicitly. Missing Git hooks, disconnected MCP servers, and disabled quality gates are treated as violations, not acceptable defaults. Every developer environment must meet the same standard.
- **NO DOUBTS**: The `diagnose` action performs thorough investigation before recommending remediation. Issues are verified against actual environment state, not assumed from configuration files. The productivity score is computed from real measurements, not self-reported metrics. Recommendations are specific and actionable, with exact commands to execute for remediation.

The DX system enforces the platform's Session Discipline Protocol by ensuring that Git hooks are installed and active, preventing the use of forbidden flags like `--no-verify`, and configuring automatic session context persistence.

## Best Practices

1. **Run setup on new environments immediately**: Execute `/archer-supreme-dx setup --profile full` as the first action on any new development environment. This prevents hours of incremental configuration and ensures consistency across development environments.

2. **Check status at session start**: Run `/archer-supreme-dx status` at the beginning of each development session. Environment drift (updated tools, changed configurations, expired credentials) can silently degrade productivity. Regular status checks catch drift early.

3. **Use diagnose before manual fixes**: When encountering development environment issues, always run `/archer-supreme-dx diagnose --verbose` before attempting manual remediation. The diagnostic engine often identifies the root cause faster than manual investigation and suggests the correct fix.

4. **Keep the full profile for active development**: The `full` profile includes advanced productivity tools that significantly accelerate common operations. Reserve the `minimal` profile for CI/CD and container environments where resource constraints justify reduced tooling.

5. **Re-optimize after platform updates**: When the platform introduces new MCP servers, quality gates, or Git hook phases, run `/archer-supreme-dx optimize` to incorporate the new components into the development environment. This keeps the local environment synchronized with platform evolution.

## Related Commands

- [/archer-supreme](@/commands/archer-supreme.md) - Supreme authority activation for platform-wide operations
- [/seadf](@/commands/seadf.md) - Self-Evolving Autonomous Development Framework control and monitoring
- [/connect](@/commands/connect.md) - MCP server connection management across 14+ servers
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/commit](@/commands/commit.md) - Smart commit with quality gates and conventional format
- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping
- [/aiad-dashboard](@/commands/aiad-dashboard.md) - AIAD dashboard for intelligence and domain monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)