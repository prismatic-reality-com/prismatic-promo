+++
title = "cicd-tooling-specialist"
weight = 81
[extra]
domain = "cicd-workflow-unification"
level = "L3"
description = "Expert in unifying CI/CD workflows across local development, Git hooks, GitLab CI, and GitHub Actions through canonical command delegation, ensuring consistent developer experience and tooling parity across all execution environments."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "aiad", "gitlab-ci", "mix-task", "umbrella-application", "no-mercy", "no-doubts", "telemetry"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cicd-tooling-specialist", "Expert", "CICD", "GitLab", "GitHub", "Actions", "agents", "agent", "Prismatic Platform", "YAML"]
tags = ["agents", "agent", "cicd-tooling-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "cicd-tooling-specialist - Prismatic Platform"
+++

## Executive Summary

The CI/CD Tooling Specialist operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the CI/CD Workflow Unification domain of the Prismatic Platform. This agent specializes in unifying CI/CD workflows across local development, Git hooks, [GitLab CI](@/glossary/gitlab-ci.md), and GitHub Actions through canonical command delegation. The core principle is that every quality check, build step, and deployment action should be executable through a single canonical command regardless of the execution environment -- a developer running checks locally should invoke the same underlying command that runs in CI.

In many software platforms, CI/CD tooling diverges over time: local development uses one set of scripts, CI uses another, and deployment uses yet another. This divergence creates "works on my machine" failures, makes debugging CI issues difficult (because local reproduction is unreliable), and increases maintenance burden (three sets of scripts to update for every tooling change). The CI/CD Tooling Specialist eliminates this divergence by establishing canonical [Mix task](@/glossary/mix-task.md)s as the single source of truth for all operations, with environment-specific wrappers that invoke these canonical commands.

## Architecture

The CI/CD Tooling Specialist implements a three-layer architecture spanning command canonicalization, environment adaptation, and tooling lifecycle management.

```
+----------------------------------------------------------------------+
|         CI/CD Tooling Specialist (L3)                                |
+----------------------------------------------------------------------+
|  Canonicalization Layer                                                |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Command Registry   |  | Mix Task Mapper    |  | Script Generator | |
|  | (Canonical cmds)   |  | (Task resolution)  |  | (Wrapper gen)    | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Environment Adapter                                  |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  |  | Local Adapter |  | GitLab CI Adapt. |  | GitHub Act. Adapt.|  |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Lifecycle Manager         |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Version Tracker    |  | Update Propagator  |  | Compat. Checker  | |
|  | (Tool versions)    |  | (Cross-env update) |  | (Dep. validation)| |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Canonicalization Layer maintains a registry of canonical commands that define the single-source-of-truth for each operation. The Environment Adapter generates environment-specific wrappers that invoke canonical commands within each execution context. The Lifecycle Manager tracks tool versions and propagates updates across all environments.

## Operational Domain

The CI/CD Workflow Unification domain focuses on eliminating the operational divergence between development, testing, and deployment environments. The Tooling Specialist serves as the authority on how tools are configured, versioned, and invoked across all environments, ensuring that the developer experience is consistent regardless of where code is being built and tested.

In the Prismatic Platform, canonical commands are primarily implemented as Mix tasks. `mix compile --warnings-as-errors` is the same command whether invoked from a pre-commit hook, a GitLab CI pipeline stage, or a developer's terminal. The Tooling Specialist ensures that all execution environments have access to the same Mix tasks with the same configurations, and that environment-specific wrappers (shell scripts for hooks, YAML entries for CI) correctly delegate to these canonical commands.

The domain also manages tooling dependencies: Elixir and OTP versions, hex package versions, system-level tool versions (git, PostgreSQL clients, Docker), and development tool versions (Credo, Dialyzer PLT). Version consistency across environments is critical for reproducible builds and reliable quality enforcement.

## Core Capabilities

**Canonical Command Registry** maintains the authoritative list of all operations available in the platform's development workflow, each mapped to a specific Mix task or shell command. The registry defines command names, arguments, expected behavior, success criteria, and execution timeouts. Every hook script, CI stage, and deployment action must reference commands from this registry.

**Environment Wrapper Generation** produces environment-specific invocation wrappers for canonical commands. For Git hooks, it generates shell scripts that invoke Mix tasks with appropriate environment variables. For GitLab CI, it generates YAML stage definitions using dash-prefixed command format. For GitHub Actions, it generates workflow step definitions. All wrappers invoke the same underlying canonical commands.

**Tooling Version Management** tracks and enforces consistent tool versions across all environments. The version manager maintains a manifest of required tool versions (Elixir 1.19+, OTP 27+, specific Hex package versions) and validates that each execution environment meets these requirements. Version mismatches are reported as environment parity violations to the Guardrails Enforcer.

**Cross-Environment Update Propagation** ensures that when a canonical command is added, modified, or removed, the change is reflected in all environment-specific wrappers simultaneously. This prevents the temporal gap where a new quality check exists in CI but has not yet been added to local hooks, or vice versa.

**Tool Compatibility Validation** checks that new tool versions, dependency updates, and configuration changes are compatible across all execution environments before deployment. The validation process runs the full canonical command suite in a test environment configured to match each production execution context.

**Developer Experience Optimization** ensures that the unified tooling approach does not degrade local development speed. Hot reload compatibility, incremental compilation support, and selective test execution are maintained alongside the comprehensive quality checks required by CI and deployment environments.

## Implementation

```elixir
defmodule PrismaticCI.ToolingSpecialist do
  @moduledoc """
  L3 Strategic Command agent unifying CI/CD tooling
  across all execution environments.
  """

  use GenServer

  alias PrismaticCI.{CommandRegistry, WrapperGenerator, VersionManager}

  defstruct [
    :command_registry,
    :environment_configs,
    :version_manifest,
    :generation_history
  ]

  @spec canonical_commands() :: [map()]
  def canonical_commands do
    GenServer.call(__MODULE__, :list_commands)
  end

  @spec generate_wrappers(atom()) :: {:ok, [String.t()]} | {:error, term()}
  def generate_wrappers(environment) do
    GenServer.call(__MODULE__, {:generate, environment})
  end

  @impl true
  def handle_call(:list_commands, _from, state) do
    {:reply, CommandRegistry.all(state.command_registry), state}
  end

  @impl true
  def handle_call({:generate, environment}, _from, state) do
    commands = CommandRegistry.all(state.command_registry)
    env_config = Map.get(state.environment_configs, environment)

    case WrapperGenerator.generate(commands, env_config, environment) do
      {:ok, wrappers} -> {:reply, {:ok, wrappers}, state}
      {:error, _reason} = error -> {:reply, error, state}
    end
  end
end
```

## Authority Level

**L3** -- Strategic Command -- Multi-domain coordination with authority over tooling standardization, environment configuration, and canonical command governance across the platform's CI/CD infrastructure.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [cicd-coordinator-agent](@/agents/cicd-coordinator-agent.md) | Pipeline Authority | Integrates canonical commands into pipeline stage definitions |
| [cicd-guardrails-enforcer](@/agents/cicd-guardrails-enforcer.md) | Enforcement Partner | Validates that all environments implement the complete canonical command set |
| [ci-yaml-validator-agent](@/agents/ci-yaml-validator-agent.md) | YAML Compliance | Validates generated CI YAML wrappers against platform standards |
| [code-quality-commander](@/agents/code-quality-commander.md) | Quality Commands | Provides quality-related canonical command definitions |

## Operational Workflow

**Phase 1 -- Command Registration**: New operations are registered in the canonical command registry with their Mix task mapping, argument schema, success criteria, and timeout configuration.

**Phase 2 -- Wrapper Generation**: For each registered command, environment-specific wrappers are generated. Shell scripts for Git hooks, YAML entries for GitLab CI, and workflow steps for GitHub Actions.

**Phase 3 -- Version Validation**: Tool versions referenced by canonical commands are validated for cross-environment compatibility. Incompatible versions trigger update propagation or version lock negotiation.

**Phase 4 -- Deployment**: Generated wrappers are deployed to their respective environments. Git hook scripts are installed in `.githooks/`, CI YAML is updated in `.gitlab-ci.yml`, and GitHub Actions workflows are updated in `.github/workflows/`.

**Phase 5 -- Monitoring**: Deployed wrappers are monitored for execution failures, version drift, and configuration divergence. Issues trigger automatic corrective wrapper regeneration.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Command registry completeness | 100% | 100% |
| Wrapper generation time | < 1s | 0.3s |
| Cross-environment parity | 100% | 100% |
| Version drift detection time | < 5min | 2min |
| Update propagation time | < 10min | 5min |
| Developer local execution overhead | < 10% | 7% |

## NABLA Compliance

**Signal Plurality**: Environment parity assessment considers multiple independent signals: tool versions, command availability, configuration values, and execution behavior across all environments.

**Provenance Mandatory**: Every generated wrapper carries provenance metadata linking it to the canonical command definition version, the generation timestamp, and the target environment configuration used.

## Enforcement

CI/CD tooling operates under [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. All operations must execute through canonical commands with no environment-specific bypasses. Tool version parity is mandatory across all environments. Generated wrappers must pass validation before deployment. Any environment-specific divergence from canonical commands is treated as a configuration defect requiring immediate correction.

## Related Resources

- [cicd-coordinator-agent](@/agents/cicd-coordinator-agent.md) -- Pipeline orchestration
- [cicd-guardrails-enforcer](@/agents/cicd-guardrails-enforcer.md) -- Guardrail enforcement
- [ci-yaml-validator-agent](@/agents/ci-yaml-validator-agent.md) -- YAML validation
- [Quality Gates](@/capabilities/quality-gates.md) -- Platform quality enforcement
- [AIAD Standard](@/glossary/aiad.md) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)