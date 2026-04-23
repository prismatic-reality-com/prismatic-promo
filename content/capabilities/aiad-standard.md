+++
title = "AIAD Standard"
weight = 8
[extra]
icon = "document-text"
color = "indigo"
description = "AI-Agent Interface Definition standard governing the specification, structure, and interoperability of 400+ autonomous agents, 210+ commands, and 45 pipelines"
category = "specification"
status = "active"
reading_time = "13 min"
author = "Tomas Korcak (korczis)"
word_count = 1063
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["AIAD", "Standard", "AI-Agent", "Interface", "Definition", "capabilities", "specification", "Prismatic Platform", "Schema", "AIAD Standard"]
tags = ["capabilities", "specification", "aiad-standard", "prismatic"]
quality_score = 80
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "AIAD Standard - Prismatic Platform"
+++

## Overview

The AI-Agent Interface Definition (AIAD) Standard is the foundational specification language for the Prismatic Platform's autonomous agent ecosystem. Every agent, command, pipeline, policy, and workflow in the platform is defined through AIAD-compliant specification files that enable machine-readable discovery, automated validation, and composable orchestration.

The standard emerged from a practical necessity: as the platform grew beyond 100 agents, ad-hoc agent definitions created interoperability failures, capability ambiguity, and unauditable behavior chains. AIAD solves this by imposing a uniform contract language that every component must speak. The result is an ecosystem where any agent can discover any other agent's capabilities, any command can be validated before invocation, and any pipeline can be composed from verified stages without manual integration work.

AIAD is not a documentation convention. It is a machine-enforceable interface definition language specifically designed for autonomous AI agent systems. Where traditional interface definition languages (IDL) like Protocol Buffers or OpenAPI describe data structures and API endpoints, AIAD describes agent capabilities, authority boundaries, doctrine obligations, quality requirements, and integration contracts -- the full behavioral surface area that an autonomous agent exposes to the ecosystem.

## Core Design Principles

The AIAD Standard is built on five design principles that distinguish it from general-purpose specification formats.

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| **Declarative Contracts** | Agents declare what they can do, the platform verifies claims | Automated testing against specifications |
| **Machine-First** | Specifications are designed for parsing, not just reading | YAML schema with strict validation |
| **Composability** | Any two compatible agents can be composed without custom code | Integration contracts with typed interfaces |
| **Auditability** | Every capability claim is traceable and verifiable | Mandatory provenance and test coverage |
| **Evolution Support** | Specifications version independently with compatibility tracking | Semantic versioning with migration paths |

## Standard Components

The AIAD Standard defines four primary component types, each with its own specification schema.

### Agent Specifications

Agent specifications are the most detailed component type, defining the full behavioral contract of an autonomous agent.

```yaml
# .aiad/agents/archer-supreme.agent.md
agent-spec:
  name: "archer-supreme"
  version: "2.0.0"
  tier: "L5-Supreme"
  domain: "tactical-command"
  description: "Ultimate authority for impossible missions"

  capabilities:
    - name: "multi-phase-operations"
      confidence: 0.99
      latency_p95_ms: 500
      test_coverage: 100%
    - name: "crisis-intervention"
      confidence: 0.98
      latency_p95_ms: 300
      test_coverage: 100%
    - name: "zero-error-execution"
      confidence: 0.97
      latency_p95_ms: 1000
      test_coverage: 100%

  tools:
    - Read
    - Write
    - Edit
    - Bash
    - Task
    - WebFetch

  enforcement:
    doctrine: "no-mercy-no-doubts"
    version: "2.0.0"
    compliance: mandatory

  integration:
    reports_to: null  # Supreme authority
    receives_from: [strategic-command, mission-control]
    emits_to: [all-agents]

  quality_gates:
    - all_tests_pass
    - zero_compilation_warnings
    - dialyzer_clean
    - credo_strict_pass
    - trinity_gate_verified
```

Each agent specification captures not just what the agent does, but how well it performs, what it depends on, who it reports to, and what quality standards it must meet. This comprehensive contract enables the platform to make informed decisions about agent selection, composition, and monitoring.

### Command Specifications

Commands define the interface between users (or other agents) and the platform's capabilities.

```yaml
# .aiad/commands/orchestrate.cmd.md
command-spec:
  name: "orchestrate"
  version: "3.1.0"
  trigger: "/orchestrate"
  category: "coordination"
  description: "Multi-agent task orchestration with automatic delegation"

  parameters:
    - name: "task"
      type: "string"
      required: true
      description: "Task description for orchestration"
    - name: "agents"
      type: "list[string]"
      required: false
      description: "Specific agents to involve"
    - name: "priority"
      type: "enum[low,normal,high,critical]"
      required: false
      default: "normal"

  agents:
    - strategic-command
    - tactical-execution
    - quality-validator

  output:
    format: "orchestration-report"
    schema: "orchestration-report-v3"

  enforcement:
    doctrine: "no-mercy-no-doubts"
    compliance: mandatory
    authority: "L3-Strategic"
```

### Pipeline Specifications

Pipelines define multi-stage processing workflows with quality gates between stages.

```yaml
# .aiad/pipelines/quality.pipeline.md
pipeline-spec:
  name: "quality-enforcement"
  version: "2.0.0"
  description: "Multi-stage quality enforcement pipeline"

  stages:
    - name: "compile"
      timeout_ms: 60000
      gate: "zero-warnings"
    - name: "lint"
      timeout_ms: 30000
      gate: "credo-strict"
    - name: "analyze"
      timeout_ms: 120000
      gate: "dialyzer-clean"
    - name: "test"
      timeout_ms: 300000
      gate: "full-coverage"
    - name: "verify"
      timeout_ms: 60000
      gate: "trinity-compliant"

  failure_policy: "halt-on-first-failure"
  retry_policy: "none"

  enforcement:
    doctrine: "no-mercy-no-doubts"
    compliance: mandatory
```

### Policy Specifications

Policies define enforceable rules that govern agent behavior, system configuration, and operational boundaries.

```yaml
# .aiad/policies/red-team-safety.policy.md
policy-spec:
  name: "red-team-safety"
  version: "1.3.0"
  scope: "adversarial-agents"
  enforcement: "mandatory"

  rules:
    - name: "sandbox-isolation"
      enforcement: "absolute"
      description: "All Red/Black operations execute in sandbox only"
    - name: "synthetic-data-only"
      enforcement: "absolute"
      description: "No real data, no PII, no production state"
    - name: "no-network-access"
      enforcement: "absolute"
      description: "Zero network connectivity for Red/Black operations"
    - name: "ethics-checks"
      enforcement: "mandatory"
      frequency: "every-15-seconds"
```

## Agent Tier Architecture

The AIAD Standard defines a five-tier authority hierarchy that governs agent capabilities, communication patterns, and operational scope.

| Tier | Authority | Capabilities | Communication | Example Agents |
|------|-----------|-------------|---------------|---------------|
| **L5 - Supreme** | Unlimited | All paradigms, all domains | Broadcast to all tiers | archer-supreme, supreme-coordinator |
| **L4 - Specialist** | Safety-critical override | Deep domain expertise | Override L1-L3 in safety scenarios | escalation-guard, invariant-prover |
| **L3 - Strategic** | Campaign orchestration | Multi-paradigm, delegation | Command L1-L2, report to L4-L5 | team commanders, coordinators |
| **L2 - Operational** | Multi-task coordination | Dual paradigm, peer messaging | Peer communication within domain | Blue Team specialists, OSINT collectors |
| **L1 - Tactical** | Single-task execution | Single paradigm, no delegation | Receive commands, emit results | Data extractors, formatters, validators |

The tier system is not just organizational -- it is enforced at runtime. An L1 agent attempting to invoke an L3 agent directly will have the call rejected by the platform's authority mediator. This prevents privilege escalation and maintains the chain of command across complex multi-agent operations.

## Registry System

The AIAD Registry is an automatically maintained index of all compliant components in the platform. It serves as the single source of truth for agent discovery, capability lookup, and compliance verification.

| Category | Count | Auto-Indexed | Validation |
|----------|-------|-------------|------------|
| **Agents** | 404+ | Yes | Schema + doctrine + capability |
| **Commands** | 210+ | Yes | Schema + parameters + authority |
| **Pipelines** | 45 | Yes | Schema + stages + gates |
| **Policies** | 32 | Yes | Schema + rules + scope |

### Auto-Indexing Process

The AIAD indexer scans all specification files, validates them against their respective schemas, and builds a queryable registry.

```bash
# Rebuild the full AIAD index
./.aiad/bin/aiad index

# Validate all definitions across all component types
./.aiad/bin/aiad validate

# List agents by tier
./.aiad/bin/aiad agents --tier L5

# List agents by domain
./.aiad/bin/aiad list --domain=osint

# Search by capability
./.aiad/bin/aiad search --capability=drift-detection

# Verify a single specification
./.aiad/bin/aiad verify .aiad/agents/blue-drift-detector.agent.md
```

## Platform Implementation

The AIAD Standard is implemented as an [Elixir](/technologies/elixir/) application that provides parsing, validation, registry management, and runtime enforcement capabilities.

```elixir
defmodule PrismaticAiad.Standard do
  @moduledoc """
  Core AIAD Standard implementation providing specification parsing,
  schema validation, and registry management for the agent ecosystem.
  """

  alias PrismaticAiad.{Parser, Validator, Registry}

  @spec parse_specification(Path.t()) :: {:ok, spec()} | {:error, parse_error()}
  def parse_specification(file_path) do
    with {:ok, raw} <- File.read(file_path),
         {:ok, yaml} <- Parser.extract_yaml_frontmatter(raw),
         {:ok, spec} <- Parser.normalize_spec(yaml) do
      {:ok, spec}
    end
  end

  @spec validate_spec(spec()) :: {:ok, :valid} | {:error, [violation()]}
  def validate_spec(spec) do
    spec
    |> Validator.check_schema()
    |> Validator.check_required_fields()
    |> Validator.check_doctrine_block()
    |> Validator.check_capability_metrics()
    |> Validator.check_integration_contracts()
    |> Validator.finalize()
  end

  @spec index_all() :: {:ok, registry_stats()} | {:error, term()}
  def index_all do
    agents = scan_and_validate(".aiad/agents/*.agent.md")
    commands = scan_and_validate(".aiad/commands/*.cmd.md")
    pipelines = scan_and_validate(".aiad/pipelines/*.pipeline.md")
    policies = scan_and_validate(".aiad/policies/*.policy.md")

    Registry.rebuild(%{
      agents: agents,
      commands: commands,
      pipelines: pipelines,
      policies: policies
    })
  end

  defp scan_and_validate(glob_pattern) do
    glob_pattern
    |> Path.wildcard()
    |> Enum.map(&parse_specification/1)
    |> Enum.filter(&match?({:ok, _}, &1))
    |> Enum.map(fn {:ok, spec} -> spec end)
  end
end
```

The implementation leverages [ETS](/technologies/ets/) for fast in-memory registry lookups, enabling sub-millisecond agent discovery even with 400+ registered agents. The registry is rebuilt on application startup and incrementally updated as specifications change during development.

## Version Management

AIAD specifications use semantic versioning with strict compatibility rules.

| Version Change | Trigger | Compatibility |
|---------------|---------|---------------|
| **Major** (X.0.0) | Breaking capability changes | Registry migration required |
| **Minor** (0.X.0) | New capabilities added | Backwards compatible |
| **Patch** (0.0.X) | Bug fixes, metric adjustments | Fully compatible |

Version compatibility is enforced during integration contract validation. If Agent A declares a dependency on Agent B version `^2.0.0`, the platform verifies that Agent B's current version satisfies this constraint before allowing the integration.

## Specification Quality Metrics

The AIAD Standard tracks quality metrics for the specification ecosystem itself.

| Metric | Current Value | Target |
|--------|--------------|--------|
| **Total specifications** | 691+ | Growing |
| **Schema compliance rate** | 100% | 100% |
| **Capability test coverage** | 94%+ | 100% |
| **Integration contract validity** | 98%+ | 100% |
| **Index rebuild time** | < 5s | < 3s |
| **Single spec validation** | < 50ms | < 30ms |
| **Cross-reference integrity** | 99%+ | 100% |

## Use Cases

### Agent Discovery and Composition

When a strategic agent needs to assemble a team for a complex operation, it queries the AIAD Registry to discover agents with the required capabilities, appropriate authority levels, and compatible integration contracts.

### Compliance Auditing

Auditors can query the AIAD Registry to verify that all agents in a given domain meet doctrine requirements, that capability claims are backed by test coverage, and that integration contracts form valid dependency graphs without circular dependencies.

### Automated Orchestration

The `/orchestrate` command uses AIAD specifications to automatically select, configure, and coordinate agents for complex multi-step tasks. The specification format provides all the metadata needed for intelligent agent selection and task decomposition.

### Ecosystem Evolution

When the platform evolves -- adding new capabilities, retiring deprecated agents, or upgrading policies -- AIAD version management ensures smooth transitions with explicit migration paths and compatibility tracking.

## Integration

The AIAD Standard is the connective tissue of the platform's agent ecosystem.

- [AIAD Compliance](/capabilities/aiad-compliance/) enforces the standard across all components
- [NO MERCY](/capabilities/no-mercy/) doctrine encoded as mandatory enforcement blocks
- [NO DOUBTS](/capabilities/no-doubts/) evidence requirements embedded in capability metrics
- [Trinity Gate](/capabilities/trinity-gate/) verification referenced in quality gate definitions
- [NABLA Axioms](/capabilities/nabla-axioms/) compliance required for epistemic agent specifications
- [Quality Gates](/capabilities/quality-gates/) integrated as pipeline stage definitions
- [Telemetry Integration](/capabilities/telemetry-integration/) events declared in agent specifications
- [Autonomous Self-Healing](/capabilities/autonomous-self-healing/) uses specifications to detect compliance drift
- [Color Teams](/capabilities/color-teams/) fully specified with tier-appropriate authority boundaries
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) tracks runtime metrics against declared capabilities
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) agents carry OSINT-specific capability declarations
- [Multi-Paradigm Solving](/capabilities/multi-paradigm-solving/) paradigm availability encoded in tier definitions

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)