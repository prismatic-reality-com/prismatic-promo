+++
title = "cicd-guardrails-enforcer"
weight = 80
[extra]
domain = "cicd-enforcement"
level = "L4"
description = "Ensures zero divergence between all layers of the unified developer workflow, from local pre-commit hooks through GitLab CI pipeline stages to production deployment gates, preventing quality gate bypass through environment inconsistency."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "aiad", "pre-commit-hooks", "gitlab-ci", "quality-gates", "no-mercy", "no-doubts"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cicd-guardrails-enforcer", "Ensures", "GitLab", "agents", "agent", "Prismatic Platform", "Phase", "Guardrails Enforcer", "YAML"]
tags = ["agents", "agent", "cicd-guardrails-enforcer", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "cicd-guardrails-enforcer - Prismatic Platform"
+++

## Executive Summary

The CI/CD Guardrails Enforcer is an L4 domain specialist operating within the CI/CD Enforcement domain of the Prismatic Platform. This agent ensures zero divergence between all layers of the unified developer workflow, from local [pre-commit hooks](@/glossary/pre-commit-hooks.md) through [GitLab CI](@/glossary/gitlab-ci.md) pipeline stages to production deployment gates. When a developer commits code locally, the guardrails enforced must be identical to those enforced in CI, ensuring that no change can bypass [quality gates](@/glossary/quality-gates.md) by exploiting differences between environments.

This agent addresses one of the most insidious failure modes in software development: environment inconsistency allowing quality bypass. If local hooks check [Credo](@/glossary/credo.md) but CI checks [Dialyzer](@/glossary/dialyzer.md), or if CI enforces stricter compilation options than local development, developers can pass local validation only to fail in CI -- or worse, pass both but fail in production. The Guardrails Enforcer maintains a canonical specification of all quality gates and validates that every enforcement point implements the complete set, eliminating gaps that could allow defective code to progress.

## Architecture

The Guardrails Enforcer implements a three-layer architecture spanning specification management, consistency validation, and enforcement action.

```
+----------------------------------------------------------------------+
|         CI/CD Guardrails Enforcer (L4)                               |
+----------------------------------------------------------------------+
|  Specification Layer                                                  |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Gate Registry      |  | Version Tracker    |  | Config Source    | |
|  | (Canonical gates)  |  | (Gate versions)    |  | (Truth source)   | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Consistency Validator                                |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  |  | Hook Checker  |  | CI YAML Checker  |  | Deploy Gate Check |  |  |
|  |  +---------------+  +------------------+  +-------------------+  |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Enforcement Layer         |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Block Deployer     |  | Divergence Alert   |  | Auto-Sync Engine | |
|  | (Pipeline halt)    |  | (Gap reporting)    |  | (Config gen)     | |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Specification Layer maintains the canonical set of quality gates that must be present at every enforcement point. The Consistency Validator checks each enforcement point against the canonical specification, identifying gaps, version mismatches, and configuration differences. The Enforcement Layer takes action on detected divergences, from blocking deployments to generating corrected configurations.

## Operational Domain

The agent operates across the boundary between developer workstations and CI infrastructure. It maintains a canonical specification of all quality gates and validates that every enforcement point -- local hooks, CI stages, deployment gates -- implements the complete set. The agent also enforces GitLab CI YAML patterns, ensuring compliance with the mandatory 10-level nesting limit and the prohibition against heredoc and folded scalar block styles.

The enforcement domain spans three distinct execution environments, each with different configuration mechanisms and update cadences. Local git hooks are configured through `.githooks/` directory files and installed via setup scripts. GitLab CI pipelines are configured through `.gitlab-ci.yml` and included template files. Deployment gates are configured through release scripts and Fly.io configurations. A quality gate added to any one environment must be reflected in all three, and the Guardrails Enforcer is the agent that detects and corrects discrepancies.

## Core Capabilities

**Hook-Pipeline Synchronization** ensures that pre-commit hooks, CI pipeline stages, and deployment gates enforce identical quality checks with no gaps or divergences. The synchronization engine maintains a mapping between each canonical quality gate and its implementations across all three enforcement environments. When a new gate is added to any environment, the engine detects the missing implementations in other environments and generates corrective configurations.

**GitLab CI YAML Validation** enforces mandatory patterns (dash-prefixed commands, single-quoted chained commands) and blocks forbidden patterns (literal blocks, heredocs, deep nesting). This validation operates both on existing pipeline configurations and on any changes proposed to CI configuration files, preventing pattern violations from entering the configuration.

**Zero-Bypass Enforcement** prevents the use of `--no-verify` flags and other hook bypass mechanisms, treating any bypass attempt as an L4 violation requiring supreme review. The enforcement system monitors for bypass indicators in commit metadata, CI logs, and deployment records. Detected bypasses trigger immediate investigation and are escalated to the platform's supreme review process.

**Pipeline Performance Optimization** analyzes CI stage execution times and parallelizes independent checks to minimize developer feedback loop latency. While maintaining comprehensive quality coverage, the optimizer identifies stages that can execute concurrently and restructures pipeline configurations to maximize parallelism without sacrificing validation completeness.

**Environment Parity Validation** confirms that [Elixir](@/glossary/elixir.md)/[OTP](@/glossary/otp.md) versions, dependency versions, and tool configurations match between local development and CI environments. Version mismatches between environments are a common source of "works on my machine" failures, and the parity validator detects these before they cause wasted pipeline runs.

**Configuration Drift Detection** continuously monitors all enforcement point configurations for unauthorized or accidental changes that would create gaps in quality coverage. Drift detection operates through periodic comparison of deployed configurations against the canonical specification, with alerts generated for any detected deviation.

## Implementation

```elixir
defmodule PrismaticCI.GuardrailsEnforcer do
  @moduledoc """
  L4 Domain Specialist ensuring zero divergence between
  local hooks, CI pipelines, and deployment gates.
  """

  use GenServer

  alias PrismaticCI.{GateRegistry, ConsistencyChecker, SyncEngine}

  defstruct [
    :canonical_gates,
    :hook_config,
    :ci_config,
    :deploy_config,
    :divergence_log
  ]

  @spec check_consistency() :: {:ok, :consistent} | {:error, [map()]}
  def check_consistency do
    GenServer.call(__MODULE__, :check_consistency)
  end

  @impl true
  def handle_call(:check_consistency, _from, state) do
    hook_gaps = ConsistencyChecker.check_hooks(state.canonical_gates, state.hook_config)
    ci_gaps = ConsistencyChecker.check_ci(state.canonical_gates, state.ci_config)
    deploy_gaps = ConsistencyChecker.check_deploy(state.canonical_gates, state.deploy_config)

    all_gaps = hook_gaps ++ ci_gaps ++ deploy_gaps

    result = if all_gaps == [], do: {:ok, :consistent}, else: {:error, all_gaps}
    {:reply, result, %{state | divergence_log: all_gaps}}
  end
end
```

## Authority Level

**L4** -- Domain Specialist -- Deep CI/CD enforcement expertise with authority to block pipelines, reject configurations, and halt deployments that violate guardrail consistency requirements. The L4 authority level reflects the critical nature of this agent's enforcement: a gap in guardrail coverage can allow defective code to reach production.

## Coordination

| Agent | Relationship | Domain |
|-------|-------------|--------|
| [cicd-coordinator-agent](@/agents/cicd-coordinator-agent.md) | Receives pipeline orchestration directives and reports enforcement status | CI/CD |
| [ci-yaml-validator-agent](@/agents/ci-yaml-validator-agent.md) | Collaborates on YAML syntax and structure validation for GitLab pipelines | CI/CD |
| [brutal-gitlab-enforcer](@/agents/brutal-gitlab-enforcer.md) | Escalation target for persistent guardrail violations requiring forceful correction | Enforcement |
| [code-quality-commander](@/agents/code-quality-commander.md) | Quality gate source providing canonical gate definitions | Quality |

## Operational Workflow

**Phase 1 -- Canonical Gate Resolution**: The enforcer loads the canonical quality gate specification from the platform's gate registry, establishing the complete set of checks that must be present at every enforcement point.

**Phase 2 -- Enforcement Point Inventory**: Each enforcement environment (local hooks, CI pipelines, deployment gates) is inventoried for its current quality gate implementations, including gate versions, configurations, and execution order.

**Phase 3 -- Consistency Analysis**: The inventory is compared against the canonical specification. Gaps (missing gates), version mismatches (outdated gate implementations), and configuration differences (differing thresholds or parameters) are identified and categorized by severity.

**Phase 4 -- Enforcement Action**: Detected divergences trigger appropriate responses: blocking actions for critical gaps, alerts for version mismatches, and auto-sync proposals for configuration differences. All actions are logged with full context for audit.

**Phase 5 -- Continuous Monitoring**: The enforcer operates continuously, re-checking consistency after any configuration change and alerting immediately when new divergences are detected.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Consistency check latency | < 5s | 2.1s |
| Divergence detection accuracy | 100% | 100% |
| Bypass attempt detection | 100% | 100% |
| Auto-sync success rate | > 95% | 97% |
| Environment parity accuracy | 100% | 100% |
| Configuration drift detection time | < 1min | 30s |

## NABLA Compliance

**Signal Plurality**: Consistency assessment draws from multiple independent configuration sources: hook files, CI YAML, deployment scripts, and runtime environment variables. No single source is assumed to be authoritative without cross-validation.

**Provenance Mandatory**: Every consistency check result carries provenance including the canonical specification version, the enforcement point configurations checked, the comparison algorithm used, and the timestamp. Enforcement actions carry provenance linking them to specific detected divergences.

**Contradiction Preservation**: When enforcement point configurations contradict each other (e.g., different Elixir versions in local and CI), both versions are documented in the divergence report rather than silently resolving to one.

## Enforcement

The CI/CD Guardrails Enforcer operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. There are no acceptable divergences between enforcement layers. Every quality gate must be present at every enforcement point. The use of `--no-verify` or any bypass mechanism is absolutely forbidden and triggers immediate L4 escalation. No exceptions.

## Related Resources

- [cicd-coordinator-agent](@/agents/cicd-coordinator-agent.md) -- Pipeline orchestration
- [ci-yaml-validator-agent](@/agents/ci-yaml-validator-agent.md) -- YAML validation
- [brutal-gitlab-enforcer](@/agents/brutal-gitlab-enforcer.md) -- Forceful enforcement
- [Quality Gates](@/capabilities/quality-gates.md) -- Quality enforcement
- [AIAD Standard](@/glossary/aiad.md) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)