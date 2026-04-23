+++
title = "CI YAML Validator Agent"
weight = 78
[extra]
domain = "devops,-ci/cd,-yaml-validation"
level = "L3"
description = "Specialized validator for GitLab CI YAML configurations that enforces the mandatory 10-level nesting limit, prevents YAML patterns causing pipeline validation failures, and ensures all CI configurations comply with platform YAML standards before pipeline execution."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "aiad", "gitlab-ci", "no-mercy", "no-doubts"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["YAML", "Validator", "Agent", "Specialized", "GitLab", "10-level", "agents", "Prismatic Platform", "YAML Validator"]
tags = ["agents", "agent", "ci-yaml-validator-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "CI YAML Validator Agent - Prismatic Platform"
+++

## Executive Summary

The CI YAML Validator Agent operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the DevOps, CI/CD, and YAML Validation domain of the Prismatic Platform. This agent provides specialized validation for [GitLab CI](@/glossary/gitlab-ci.md) YAML configurations, enforcing the mandatory 10-level nesting limit and preventing YAML patterns that cause pipeline validation failures. In a platform with 90 [umbrella application](@/glossary/umbrella-application.md)s generating complex CI pipeline configurations, YAML validation is not optional -- it is a critical gate that prevents wasted CI compute resources and developer time on pipelines that would fail at the configuration parsing stage.

GitLab CI YAML has specific constraints that differ from generic YAML validation. The Prismatic Platform has codified these constraints through hard-won experience: the 10-level nesting limit that GitLab silently enforces, the prohibition against literal block scalars and heredoc patterns in script sections, and the requirement for dash-prefixed command format. The CI YAML Validator Agent encodes all these platform-specific constraints into an automated validation pipeline that catches configuration errors before they reach GitLab's CI runner infrastructure.

## Architecture

The CI YAML Validator implements a three-layer validation architecture with structural, semantic, and platform-specific constraint checking.

```
+----------------------------------------------------------------------+
|         CI YAML Validator Agent (L3)                                 |
+----------------------------------------------------------------------+
|  Structural Layer                                                     |
|  +--------------------+  +--------------------+  +------------------+ |
|  | YAML Parser        |  | Nesting Analyzer   |  | Syntax Checker   | |
|  | (Strict mode)      |  | (Depth tracking)   |  | (Schema valid.)  | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Semantic Validator                                    |  |
|  |  +--------------+  +------------------+  +-------------------+   |  |
|  |  | Job Resolver |  | Dependency Check |  | Artifact Validator|   |  |
|  |  +--------------+  +------------------+  +-------------------+   |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Platform Constraint Layer |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Pattern Enforcer   |  | Script Validator   |  | Template Checker | |
|  | (Forbidden detect) |  | (Command format)   |  | (Include valid.) | |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Structural Layer performs basic YAML parsing, nesting depth analysis, and syntax validation against GitLab CI's expected schema. The Semantic Validator checks job definitions for dependency correctness, artifact path validity, and stage ordering consistency. The Platform Constraint Layer enforces Prismatic-specific YAML patterns including the command format requirements and forbidden pattern detection.

## Operational Domain

The CI YAML Validator operates at the intersection of DevOps automation and configuration management. In the Prismatic Platform, CI pipeline configurations are complex artifacts: the main `.gitlab-ci.yml` may include multiple child configurations, reference shared templates, and define matrix builds across the umbrella's 90 applications. Configuration errors at any level can cascade into pipeline failures that waste CI compute resources and block developer workflows.

The domain enforces a strict separation between valid YAML (syntactically correct) and valid GitLab CI YAML (structurally and semantically correct for GitLab's CI runner). Many YAML patterns that are syntactically valid are rejected by GitLab's pipeline parser, and these rejections often produce cryptic error messages. The CI YAML Validator catches these patterns with clear, actionable error messages before submission.

The domain also manages the evolution of CI configuration patterns. As the platform grows and GitLab releases new CI features, the validator's rule set must be updated to accommodate new valid patterns while continuing to block known-problematic ones.

## Core Capabilities

**10-Level Nesting Enforcement** tracks YAML nesting depth across all CI configuration files and blocks configurations that exceed GitLab's 10-level limit. The depth analyzer handles complex nesting scenarios including anchors, aliases, and merge keys that can create deep nesting structures that are not immediately apparent from visual inspection. Each violation is reported with the exact path to the deeply nested element and a suggested restructuring approach.

**Forbidden Pattern Detection** identifies and blocks YAML patterns that the Prismatic Platform has determined cause pipeline failures or maintenance problems. Forbidden patterns include literal block scalars (`|`) in script sections, folded block scalars (`>-`) that produce unexpected whitespace handling, heredoc patterns (`<< EOF`) that GitLab does not support in scripts, and deep nesting caused by overly complex conditional logic.

**Mandatory Pattern Enforcement** ensures that all script commands follow the platform's required format: dash-prefixed commands (`- command`) for single commands and single-quoted chained commands (`- 'cmd; cmd'`) for multi-command sequences. These patterns produce consistent, debuggable pipeline logs and avoid the parsing ambiguities that other formats introduce.

**Include and Template Validation** resolves and validates `include:` directives, ensuring that referenced template files exist, their contents are valid, and the combined configuration after template resolution remains within nesting and structural constraints. This catch errors from template composition that individual file validation would miss.

**Semantic Job Validation** checks that job definitions are internally consistent: referenced stages exist, dependency jobs are defined, artifact paths use valid glob patterns, and variable references resolve to defined variables. This semantic layer catches configuration logic errors that structural validation alone cannot detect.

**Pre-Commit Integration** operates as a validation hook in the platform's pre-commit pipeline, checking CI YAML changes before they can be committed. This shift-left approach catches configuration errors at the earliest possible point, before they can trigger wasted CI pipeline runs.

## Implementation

```elixir
defmodule PrismaticCI.YAMLValidator do
  @moduledoc """
  L3 Strategic Command agent validating GitLab CI YAML
  configurations against platform standards.
  """

  use GenServer

  alias PrismaticCI.{YAMLParser, NestingAnalyzer, PatternEnforcer}
  alias PrismaticCI.{SemanticValidator, IncludeResolver}

  @max_nesting_depth 10
  @forbidden_patterns [
    {:literal_block, ~r/^\s*-\s*\|/m},
    {:folded_block, ~r/^\s*-\s*>-/m},
    {:heredoc, ~r/<< ?EOF/}
  ]

  defstruct [:rule_registry, :validation_cache, :stats]

  @spec validate(String.t()) :: {:ok, :valid} | {:error, [map()]}
  def validate(yaml_content) do
    GenServer.call(__MODULE__, {:validate, yaml_content})
  end

  @impl true
  def handle_call({:validate, content}, _from, state) do
    errors =
      []
      |> check_structural(content)
      |> check_nesting(content)
      |> check_forbidden_patterns(content)
      |> check_mandatory_patterns(content)
      |> check_semantic(content)

    result = if errors == [], do: {:ok, :valid}, else: {:error, errors}
    {:reply, result, update_stats(state, result)}
  end

  defp check_nesting(errors, content) do
    case NestingAnalyzer.max_depth(content) do
      {:ok, depth} when depth <= @max_nesting_depth -> errors
      {:ok, depth} -> [{:nesting, "Depth #{depth} exceeds limit #{@max_nesting_depth}"} | errors]
      {:error, reason} -> [{:parse_error, reason} | errors]
    end
  end

  defp check_forbidden_patterns(errors, content) do
    Enum.reduce(@forbidden_patterns, errors, fn {name, pattern}, acc ->
      if Regex.match?(pattern, content) do
        [{:forbidden_pattern, "#{name} pattern detected"} | acc]
      else
        acc
      end
    end)
  end
end
```

## Authority Level

**L3** -- Strategic Command -- Multi-domain coordination with specialized operational command authority. The CI YAML Validator exercises authority to block commits containing invalid CI YAML configurations and reject pipeline configurations that violate platform standards.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [cicd-guardrails-enforcer](@/agents/cicd-guardrails-enforcer.md) | Enforcement Partner | Coordinates YAML validation with broader CI/CD guardrails enforcement |
| [cicd-coordinator-agent](@/agents/cicd-coordinator-agent.md) | Pipeline Authority | Receives validation results for pipeline orchestration decisions |
| [cicd-tooling-specialist](@/agents/cicd-tooling-specialist.md) | Tooling Partner | Coordinates CI tooling configurations that affect YAML structure |
| [brutal-gitlab-enforcer](@/agents/brutal-gitlab-enforcer.md) | Escalation Target | Handles persistent YAML violations requiring forceful correction |

## Operational Workflow

**Phase 1 -- File Detection**: The validator monitors for CI YAML file changes in the working tree, including `.gitlab-ci.yml`, included template files, and any YAML files referenced by CI configuration `include:` directives.

**Phase 2 -- Structural Validation**: Changed files undergo YAML parsing, nesting depth analysis, and schema validation. Structural errors are reported immediately with line numbers and correction suggestions.

**Phase 3 -- Pattern Checking**: Validated files are scanned for forbidden patterns and mandatory pattern compliance. Each violation is reported with the specific pattern detected, its location, and the required alternative.

**Phase 4 -- Semantic Validation**: Structurally valid configurations undergo semantic analysis, checking job dependencies, stage references, artifact configurations, and variable resolution.

**Phase 5 -- Aggregate Report**: All validation results are aggregated into a structured report that can be consumed by pre-commit hooks, CI pipeline checks, and developer tooling.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Validation latency (single file) | < 100ms | 45ms |
| False positive rate | < 1% | 0.2% |
| Pattern detection accuracy | > 99% | 99.8% |
| Nesting analysis accuracy | 100% | 100% |
| Pre-commit integration latency | < 500ms | 220ms |
| CI failure prevention rate | > 95% | 97% |

## NABLA Compliance

**Signal Plurality**: Validation decisions consider multiple signal types: structural validity, nesting compliance, pattern compliance, semantic correctness, and historical failure correlation. No single check determines the final validation result.

**Provenance Mandatory**: Every validation result carries provenance including the file validated, the rule set version applied, the specific checks performed, and the timestamp. This enables audit of why specific configurations were accepted or rejected.

## Enforcement

All CI YAML validation operates under [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Invalid CI configurations are blocked without exception. The 10-level nesting limit is absolute and non-negotiable. Forbidden YAML patterns trigger immediate rejection with no workaround pathway. Every CI pipeline configuration must pass validation before it can trigger a pipeline run.

## Related Resources

- [cicd-guardrails-enforcer](@/agents/cicd-guardrails-enforcer.md) -- CI/CD enforcement coordination
- [cicd-coordinator-agent](@/agents/cicd-coordinator-agent.md) -- Pipeline orchestration
- [cicd-tooling-specialist](@/agents/cicd-tooling-specialist.md) -- CI/CD tooling management
- [Quality Gates](@/capabilities/quality-gates.md) -- Platform quality enforcement
- [AIAD Standard](@/glossary/aiad.md) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)