+++
title = "AIAD Compliance"
weight = 7
[extra]
icon = "shield-check"
color = "purple"
description = "Autonomous Intelligence Agent Design standard compliance and enforcement framework ensuring all 400+ agents meet strict specification, doctrine, and quality requirements"
category = "governance"
status = "active"
reading_time = "12 min"
author = "Tomas Korcak (korczis)"
word_count = 1349
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["AIAD", "Compliance", "Autonomous", "Intelligence", "Agent", "Design", "capabilities", "governance", "Prismatic Platform", "MANDATORY"]
tags = ["capabilities", "governance", "aiad-compliance", "prismatic"]
quality_score = 80
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "AIAD Compliance - Prismatic Platform"
+++

## Overview

Autonomous Intelligence Agent Design (AIAD) Compliance is the enforcement backbone of the Prismatic Platform's agent ecosystem. Every agent, command, pipeline, and policy artifact must conform to a rigorous specification format before it can be indexed, deployed, or invoked. With over 400 agents operating across 14 functional domains, compliance is not aspirational guidance -- it is a hard gate that blocks non-conforming components from entering the platform.

The compliance framework addresses a fundamental challenge in large-scale multi-agent systems: how to maintain coherent interoperability, auditable behavior, and verifiable quality when hundreds of autonomous components evolve independently. Without enforceable standards, agent ecosystems degrade into collections of incompatible, untestable, and unauditable tools. AIAD Compliance prevents this by binding every agent to a machine-readable contract that specifies its capabilities, authority boundaries, integration points, and doctrine obligations.

AIAD Compliance is not merely a documentation standard. It is an enforceable contract system that binds agents to behavioral guarantees. An agent that declares specific capabilities in its AIAD specification is tested against those capabilities. An agent that declares [NO MERCY](@/capabilities/no-mercy.md) compliance has its outputs verified against zero-tolerance quality requirements. This contract-based approach transforms the agent ecosystem from a collection of independent tools into a verifiable, composable, and self-auditing intelligence infrastructure integrated with the [Trinity Gate](@/capabilities/trinity-gate.md) verification pipeline.

## Core Architecture

The AIAD Compliance system operates through three interconnected layers: specification validation, runtime enforcement, and continuous auditing. Each layer addresses a different temporal scope of compliance -- definition time, execution time, and ongoing operational time.

### Specification Layer

At the specification layer, every agent is defined in a `.agent.md` file following a strict YAML-frontmatter schema. The schema enforces structural completeness before an agent can be indexed.

| Component | Requirement | Enforcement | Description |
|-----------|-------------|-------------|-------------|
| `agent-spec` header | Version, name, authority level | MANDATORY | Unique identifier and version tracking |
| `classification` | Agent tier (L1-L4) | MANDATORY | Determines authority and capability scope |
| Doctrine enforcement | NM/ND compliance block | MANDATORY | Binds agent to quality doctrine |
| Capability matrix | Defined capabilities with metrics | MANDATORY | Testable capability declarations |
| Integration points | Connection to other agents | REQUIRED | Interoperability contracts |
| Quality gates | Validation criteria | REQUIRED | Acceptance testing criteria |
| Security classification | Access and isolation level | REQUIRED | Data handling and sandbox requirements |
| Telemetry events | Emitted telemetry events | RECOMMENDED | Observability integration |

### Runtime Enforcement Layer

During execution, agents are monitored against their declared capabilities. If an agent declares a P95 latency of 200ms for a given capability, the platform's telemetry system tracks actual performance and flags violations. This moves compliance from a static check to a living contract.

### Continuous Audit Layer

The audit layer performs daily and on-demand compliance scans across the entire agent registry. Cross-reference integrity, version compatibility, and doctrine adherence are verified automatically. Results feed into the [Quality Gates](@/capabilities/quality-gates.md) pipeline and contribute to the platform's overall quality score.

## Agent Specification Format

Every AIAD agent definition follows a standardized YAML schema that enables machine parsing, automated validation, and registry indexing.

```yaml
agent-spec:
  name: "blue-drift-detector"
  version: "2.1.0"
  classification: L2-Operational-Specialist
  domain: epistemic-defense
  authority: blue-commander

capabilities:
  - name: behavioral-drift-detection
    confidence: 0.92
    latency_p95_ms: 200
    test_coverage: 100%
  - name: configuration-drift-detection
    confidence: 0.95
    latency_p95_ms: 150
    test_coverage: 100%

enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory

integration:
  reports_to: blue-commander
  receives_from: [telemetry-aggregator, config-monitor]
  emits_to: [blue-signal-aggregator, purple-coordinator]

quality_gates:
  - all_tests_pass
  - zero_compilation_warnings
  - dialyzer_clean
  - credo_strict_pass
```

The specification format is intentionally declarative. Agents declare what they can do and under what constraints, and the platform validates these declarations through automated testing. This inversion of control -- where the platform verifies agent claims rather than trusting self-reporting -- is fundamental to maintaining ecosystem integrity at scale.

## Compliance Levels

Not all agents achieve full compliance simultaneously. The platform recognizes three compliance tiers to allow progressive adoption while maintaining minimum quality standards.

| Level | Description | Requirements | Agent Count | Deployment |
|-------|-------------|--------------|-------------|------------|
| **Full** | Complete AIAD compliance | All components present and validated | 380+ | Unrestricted |
| **Partial** | Core components present | Spec header + doctrine + capabilities | 40+ | Limited scope |
| **Non-Compliant** | Missing required components | BLOCKED from deployment | 0 (enforced) | Blocked |

The enforcement model ensures zero non-compliant agents reach production. Partial compliance is permitted during development and migration phases but carries scope restrictions -- partially compliant agents cannot participate in cross-domain operations or handle security-sensitive data.

## Agent Tier System

The AIAD tier system defines escalating levels of authority, capability scope, and responsibility. Tiers are not arbitrary labels; they determine what an agent can invoke, what data it can access, and what operations it can authorize.

| Tier | Role | Authority | Capabilities | Example Agents |
|------|------|-----------|-------------|---------------|
| **L1 - Tactical** | Single-task execution | Limited to own domain | Single paradigm, no cross-agent calls | Data extractors, formatters |
| **L2 - Operational** | Multi-task coordination | Cross-agent communication | Dual paradigm, peer messaging | Blue Team specialists, OSINT collectors |
| **L3 - Strategic** | Campaign orchestration | Command authority over L1-L2 | Full multi-paradigm, delegation | Team commanders, coordinators |
| **L4 - Specialist** | Deep domain expertise | Safety-critical override | Domain-deep, override authority | Escalation guards, invariant provers |

### Tier Governance Rules

Tier governance prevents authority bypass and maintains the chain of command.

| Rule | Enforcement | Rationale |
|------|-------------|-----------|
| L1 cannot invoke L3 directly | HARD | Prevents authority bypass |
| L3 commands route through chain | HARD | Maintains command structure |
| L4 safety-critical overrides | HARD | Safety always takes precedence |
| Cross-domain requires L3+ | HARD | Domain isolation enforcement |
| Tier escalation requires review | HARD | Prevents privilege creep |

## Agent Registry

The Agent Registry maintains a live index of all AIAD-compliant agents. The registry is rebuilt automatically by the AIAD indexer and serves as the authoritative source for agent discovery, capability lookup, and compliance verification.

| Registry Field | Purpose | Query Support |
|---------------|---------|---------------|
| **Agent Name** | Unique identifier | Exact match, prefix search |
| **Domain** | Functional domain (OSINT, security, epistemic, etc.) | Domain filter |
| **Tier** | Authority level (L1-L4) | Tier filter |
| **Capabilities** | Declared capability list | Capability search |
| **Status** | Active, deprecated, experimental | Status filter |
| **Compliance** | AIAD compliance level | Compliance filter |

### Registry Operations

```bash
# Rebuild the full agent index
./.aiad/bin/aiad index

# Query agents by domain
./.aiad/bin/aiad list --domain=osint

# Verify single agent compliance
./.aiad/bin/aiad verify .aiad/agents/blue-drift-detector.agent.md

# List agents by tier
./.aiad/bin/aiad agents --tier L3

# Validate all definitions
./.aiad/bin/aiad validate
```

## Platform Integration with Elixir/OTP

AIAD Compliance integrates deeply with the platform's [Elixir](@/technologies/elixir.md) runtime through a dedicated compliance checking module that validates agent specifications programmatically.

```elixir
defmodule PrismaticAiad.ComplianceChecker do
  @moduledoc """
  Validates AIAD agent specifications against the standard schema.
  Enforces doctrine compliance, capability declarations, and
  integration contract validity.
  """

  @required_fields [:name, :version, :classification, :domain]
  @required_blocks [:enforcement, :capabilities, :quality_gates]

  @spec validate_agent(map()) :: {:ok, :compliant} | {:error, [violation()]}
  def validate_agent(agent_spec) do
    violations =
      []
      |> check_required_fields(agent_spec)
      |> check_required_blocks(agent_spec)
      |> check_doctrine_compliance(agent_spec)
      |> check_capability_metrics(agent_spec)
      |> check_integration_contracts(agent_spec)
      |> check_tier_authority(agent_spec)

    case violations do
      [] -> {:ok, :compliant}
      violations -> {:error, violations}
    end
  end

  defp check_doctrine_compliance(violations, %{enforcement: enforcement}) do
    case enforcement do
      %{doctrine: "no-mercy-no-doubts", compliance: "mandatory"} ->
        violations

      _ ->
        [{:doctrine, "NM/ND enforcement block missing or invalid"} | violations]
    end
  end

  defp check_capability_metrics(violations, %{capabilities: capabilities}) do
    Enum.reduce(capabilities, violations, fn cap, acc ->
      cond do
        not Map.has_key?(cap, :test_coverage) ->
          [{:capability, "#{cap.name}: missing test_coverage"} | acc]

        not Map.has_key?(cap, :confidence) ->
          [{:capability, "#{cap.name}: missing confidence score"} | acc]

        true ->
          acc
      end
    end)
  end
end
```

This module is invoked automatically during the AIAD indexing process, during pre-commit hooks, and as part of the CI/CD pipeline. Non-compliant agents are blocked at each stage, ensuring that violations are caught as early as possible in the development lifecycle.

## Policy Enforcement Hierarchy

AIAD compliance is enforced through a hierarchy of policies that govern different aspects of agent behavior.

### Doctrine Policies

| Policy | Scope | Enforcement |
|--------|-------|-------------|
| **No Mercy, No Doubts** | All agents | MANDATORY -- no exceptions |
| **Addiction Preservation** | Epistemic agents | MANDATORY for NABLA-integrated agents |
| **Red Team Safety** | Adversarial agents | MANDATORY -- sandbox isolation |
| **Elixir Best Practices** | All Elixir code | MANDATORY -- OTP-first patterns |
| **Page Load Performance** | Web-facing agents | MANDATORY -- 250ms limit |

### Validation Pipeline

The validation pipeline processes agent specifications through six sequential stages. Failure at any stage blocks progression to subsequent stages.

```
Agent Definition --> Schema Validation --> Doctrine Check --> Capability Verify --> Integration Test --> Deploy
       |                  |                    |                   |                    |
    .agent.md        YAML schema          NM/ND block        Metrics testable     Contract tests
                     validates             present             against spec         with peers
```

### Automated Compliance Checking

The platform performs continuous compliance verification across multiple frequencies.

| Check | Frequency | Failure Action |
|-------|-----------|----------------|
| **Schema validation** | On every agent file change | Block merge |
| **Doctrine block present** | Pre-commit hook | Block commit |
| **Capability metrics testable** | CI pipeline | Block deployment |
| **Integration contracts valid** | CI pipeline | Block deployment |
| **Cross-reference integrity** | Daily scan | Warning + auto-fix |
| **Runtime performance** | Continuous telemetry | Alert + investigation |

## Command Registry

Alongside agents, AIAD governs the platform's 210+ commands through the Command Registry. Commands follow the same specification-first, validation-enforced pattern as agents.

| Command Component | Requirement | Description |
|-------------------|-------------|-------------|
| `command-spec` header | MANDATORY | Name, version, category |
| Input parameters | MANDATORY | Typed parameter definitions |
| Output specification | MANDATORY | Expected output format |
| Authority requirement | MANDATORY | Minimum agent tier required |
| Doctrine enforcement | MANDATORY | NM/ND compliance block |

```yaml
command-spec:
  name: "/investigate"
  version: "1.5.0"
  category: intelligence
  authority: L2-Operational
  input:
    - name: target
      type: string
      required: true
    - name: depth
      type: integer
      default: 3
  output:
    format: investigation-report
    schema: investigation-report-v2

enforcement:
  doctrine: "no-mercy-no-doubts"
  compliance: mandatory
```

## Coverage Statistics

| Metric | Count | Status |
|--------|-------|--------|
| **Total Agents** | 404+ | All indexed |
| **Full AIAD Compliance** | 380+ | 94%+ |
| **Commands Registered** | 210+ | All documented |
| **Domains Covered** | 14 | Complete coverage |
| **Policies Active** | 32+ | All enforced |
| **Pipelines Defined** | 45 | All validated |
| **Integration Tests** | 5,864 | Comprehensive |

## Performance and Metrics

The compliance system itself is held to strict performance standards to avoid becoming a bottleneck in the development workflow.

| Metric | Current Value | Target |
|--------|--------------|--------|
| **Single agent validation** | < 50ms | < 30ms |
| **Full registry rebuild** | < 5s | < 3s |
| **Pre-commit compliance check** | < 2s | < 1s |
| **CI pipeline compliance stage** | < 30s | < 20s |
| **False positive rate** | < 0.1% | 0% |
| **Daily audit scan** | < 60s | < 30s |

## Integration

AIAD Compliance is a foundational capability that connects to virtually every other platform subsystem.

- [NO MERCY](@/capabilities/no-mercy.md) doctrine enforced on all agents through mandatory enforcement blocks
- [NO DOUBTS](@/capabilities/no-doubts.md) evidence requirements validated in capability declarations
- [Trinity Gate](@/capabilities/trinity-gate.md) validation required for all epistemic agent outputs
- [NABLA Axioms](@/capabilities/nabla-axioms.md) compliance mandatory for epistemic domain agents
- [Quality Gates](@/capabilities/quality-gates.md) integrated into the validation pipeline
- [Telemetry Integration](@/capabilities/telemetry-integration.md) tracks agent operation metrics against declared capabilities
- [Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md) detects and repairs compliance regressions automatically
- [Color Teams](@/capabilities/color-teams.md) organized under the AIAD tier structure with full specification coverage
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) powers the compliance dashboard for operational visibility
- [AIAD Standard](@/capabilities/aiad-standard.md) defines the underlying specification format that compliance enforces
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) agents validated for NABLA axiom adherence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)