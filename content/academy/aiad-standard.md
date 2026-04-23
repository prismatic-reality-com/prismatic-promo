+++
title = "The AIAD Standard Explained"
weight = 14
[extra]
description = "Agent-Command-Pipeline-Policy architecture, writing compliant components, and the AIAD specification format"
category = "intermediate"
difficulty = "intermediate"
duration = "50 min"
prerequisites = ["first-agent", "quality-standards"]
glossary_terms = ["aiad", "agent", "agent-registry", "agent-tier", "no-mercy", "no-doubts", "quality-dna"]
technologies = ["elixir", "otp"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 965
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["AIAD", "Standard", "Explained", "Agent-Command-Pipeline-Policy", "academy", "intermediate", "Prismatic Platform", "YAML", "Step", "The AIAD"]
tags = ["academy", "intermediate", "the-aiad-standard-explained", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "The AIAD Standard Explained - Prismatic Platform"
+++

## Overview

[AIAD](@/glossary/aiad.md) (AI Agent Directive) is the standard that governs every autonomous component in the Prismatic Platform. It defines how agents declare their capabilities, how commands expose operations, how pipelines process data, and how policies enforce rules. With 400+ agents, 210+ commands, and 100+ workflows all following this standard, understanding AIAD is essential for any platform contributor.

You will learn:

- The four AIAD component types: Agents, Commands, Pipelines, and Policies
- The specification format (YAML frontmatter + markdown documentation)
- Classification levels and authority tiers
- How to write compliant specifications for each component type
- The AIAD registry and indexing system

## Prerequisites

- Completed [Building Your First Autonomous Agent](@/academy/first-agent.md)
- Completed [Understanding NO MERCY, NO DOUBTS](@/academy/quality-standards.md)
- Familiarity with YAML syntax

## Core Concepts

### The Four Component Types

AIAD defines four types of components, each with a specific role:

| Component | Purpose | File Pattern | Count |
|-----------|---------|-------------|-------|
| **Agent** | Autonomous entity that performs work | `.aiad/agents/*.agent.md` | 400+ |
| **Command** | User-invokable operation | `.aiad/commands/*.cmd.md` | 210+ |
| **Pipeline** | Data processing workflow | `.aiad/pipelines/*.pipeline.md` | 50+ |
| **Policy** | Enforcement rule | `.aiad/policies/*.policy.md` | 30+ |

These components are related but distinct:

- **Agents** do work autonomously
- **Commands** let users trigger specific operations
- **Pipelines** define multi-step data flows
- **Policies** constrain what agents and commands can do

### The Specification Format

Every AIAD component is a markdown file with YAML frontmatter. The frontmatter is machine-readable; the markdown body is human-readable documentation:

```markdown
---
agent-spec: "1.0"          # or command-spec, pipeline-spec, policy-spec
name: "component-name"
version: "1.0.0"
classification: L2          # Authority level
domain: "security"          # Functional domain
# ... additional fields
---

# Component Name

Human-readable documentation goes here.

## Purpose

What this component does and why.

## Usage

How to use this component.
```

### Classification Levels

All AIAD components are classified by authority:

| Level | Authority | Scope |
|-------|-----------|-------|
| L1 | Specialist | Single task, single domain |
| L2 | Tactical | Multiple tasks, single domain |
| L3 | Strategic | Full domain authority |
| L4 | Supreme | Cross-domain, platform-wide |

Higher levels can coordinate lower levels but not bypass them.

## Step-by-Step Guide

### Step 1: Writing an Agent Specification

An agent spec declares what the agent is, what it can do, and how it is constrained:

```yaml
---
agent-spec: "1.0"
name: "certificate-monitor"
version: "1.0.0"
classification: L1
domain: security
tier: specialist

description: |
  Monitors TLS certificate expiry dates for tracked domains.
  Emits alerts when certificates approach expiration.

capabilities:
  - certificate_monitoring
  - expiry_alerting
  - certificate_chain_validation

inputs:
  - domain: string
  - alert_days_before: integer
  - check_interval_ms: integer

outputs:
  - alert: "{:alert, domain, days_remaining}"
  - status: "{:ok, %{domain: string, valid: boolean, expires_at: datetime}}"

dependencies:
  - prismatic_perimeter
  - prismatic_storage_ecto

telemetry:
  - [:prismatic_perimeter, :certificate_monitor, :check]
  - [:prismatic_perimeter, :certificate_monitor, :alert]

enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory

implementation:
  module: PrismaticPerimeter.Agents.CertificateMonitor
  behaviour: GenServer
  supervision: dynamic
  restart: permanent
---

# Certificate Monitor Agent

## Purpose

The Certificate Monitor Agent continuously tracks TLS certificate
expiration for all domains in the asset inventory. It prevents
certificate-related outages by alerting before expiry.

## Behavior

The agent checks each tracked domain on a configurable interval.
When a certificate's expiry date falls within the alert window,
a telemetry event is emitted and the finding is stored.

## Configuration

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| alert_days_before | integer | 30 | Days before expiry to alert |
| check_interval_ms | integer | 3600000 | Check interval (1 hour) |
```

### Step 2: Writing a Command Specification

Commands expose operations that users can invoke:

```yaml
---
command-spec: "1.0"
name: "perimeter-scan"
version: "1.0.0"
classification: L2
domain: security

description: |
  Initiates a full perimeter scan for a given domain.
  Coordinates discovery, enumeration, and assessment agents.

syntax: "/perimeter scan <domain> [--depth=<1-3>] [--compliance=<nis2|zkb>]"

parameters:
  - name: domain
    type: string
    required: true
    description: "Target domain to scan"
  - name: depth
    type: integer
    required: false
    default: 2
    description: "Scan depth (1=surface, 2=standard, 3=deep)"
  - name: compliance
    type: string
    required: false
    description: "Compliance framework to assess against"

execution:
  agent: security-assessment-orchestrator
  timeout_ms: 300000
  requires_confirmation: false

enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory
---

# Perimeter Scan Command

Initiates a comprehensive scan of a domain's external attack surface.
```

### Step 3: Writing a Pipeline Specification

Pipelines define multi-step data processing workflows:

```yaml
---
pipeline-spec: "1.0"
name: "security-assessment-pipeline"
version: "1.0.0"
classification: L2
domain: security

description: |
  End-to-end security assessment pipeline from domain input
  to security rating output.

stages:
  - name: discovery
    agent: domain-discovery-agent
    timeout_ms: 60000
    retry: 2

  - name: enumeration
    agent: asset-enumeration-agent
    timeout_ms: 120000
    retry: 1
    depends_on: [discovery]

  - name: assessment
    agent: finding-assessment-agent
    timeout_ms: 180000
    retry: 1
    depends_on: [enumeration]

  - name: rating
    agent: rating-calculator-agent
    timeout_ms: 30000
    retry: 0
    depends_on: [assessment]

  - name: compliance
    agent: compliance-assessor-agent
    timeout_ms: 60000
    retry: 1
    depends_on: [assessment]
    optional: true

error_handling:
  strategy: fail_fast
  on_stage_failure: skip_dependents
  notification: telemetry

enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory
---
```

### Step 4: Writing a Policy Specification

Policies define enforcement rules that constrain agents and commands:

```yaml
---
policy-spec: "1.0"
name: "rate-limiting"
version: "1.0.0"
classification: L3
domain: platform

description: |
  Enforces rate limits on all external-facing operations
  to prevent abuse and ensure fair resource allocation.

rules:
  - name: api_rate_limit
    target: "prismatic_api.*"
    limit: 100
    window_seconds: 60
    action: reject_with_429

  - name: scan_rate_limit
    target: "prismatic_perimeter.discovery.*"
    limit: 10
    window_seconds: 3600
    action: queue

  - name: agent_creation_limit
    target: "prismatic_agents.dynamic.*"
    limit: 50
    window_seconds: 300
    action: reject_with_error

enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory
  violation_level: L2

monitoring:
  telemetry: true
  alerting: true
  dashboard: true
---
```

### Step 5: Registry and Indexing

After creating specifications, register them in the AIAD index:

```bash
# Rebuild the entire AIAD index
./.aiad/bin/aiad index

# The index updates:
# - .claude/AGENT_REGISTRY.md (agent listing)
# - .claude/COMMAND_REGISTRY.md (command listing)
# - Internal ETS tables at runtime
```

You can query the registry at runtime:

```elixir
# List all agents in a domain
PrismaticAgents.Registry.list_by_domain(:security)

# Get agent specification
PrismaticAgents.Registry.get_spec("certificate-monitor")

# List all commands
PrismaticAgents.CommandRegistry.list_commands()
```

## Code Examples

### Implementing an AIAD-Compliant Module

Every Elixir module that implements an AIAD component must include:

```elixir
defmodule PrismaticPerimeter.Agents.CertificateMonitor do
  @moduledoc """
  L1 Specialist Agent: Monitors TLS certificate expiry dates.

  AIAD Specification: .aiad/agents/certificate-monitor.agent.md
  Classification: L1 Specialist
  Domain: Security

  ## Telemetry Events

  - `[:prismatic_perimeter, :certificate_monitor, :check]` - on each check
  - `[:prismatic_perimeter, :certificate_monitor, :alert]` - on alert

  ## Configuration

  See agent specification for full parameter documentation.
  """

  use GenServer

  # Implementation follows the patterns from the first-agent tutorial
  # ...
end
```

### Validating Specifications

```elixir
# Validate an agent spec against the AIAD schema
{:ok, spec} = AIAD.Spec.parse("agents/certificate-monitor.agent.md")
{:ok, _} = AIAD.Spec.validate(spec)

# Check for missing required fields
case AIAD.Spec.validate(spec) do
  {:ok, _} -> IO.puts("Specification is valid")
  {:error, errors} -> IO.inspect(errors, label: "Validation errors")
end
```

## Common Pitfalls

**Missing the enforcement block.** Every AIAD specification must include the `enforcement` block with doctrine reference. Specs without it fail validation.

**Mismatched classification levels.** An L1 agent cannot coordinate other agents. If your agent needs to manage others, it must be L2 or higher. The registry enforces this.

**Specification drift.** When you change the implementation, update the specification. The AIAD index cross-references specs with implementations and flags mismatches.

**Using non-standard field names.** The AIAD schema defines specific field names for each component type. Using custom fields in the YAML frontmatter causes validation failures.

**Forgetting to re-index.** After adding or modifying a specification, run `./.aiad/bin/aiad index` to update the registry. Stale indexes cause runtime lookup failures.

## Exercises

1. **Write an agent specification.** Create a spec for a "log analyzer" L1 agent that monitors application logs for error patterns. Include all required fields.

2. **Write a command specification.** Create a spec for a "/log-analysis run" command that triggers the log analyzer agent.

3. **Write a pipeline specification.** Define a 3-stage pipeline: log collection, pattern analysis, and report generation.

4. **Validate your specifications.** Run `./.aiad/bin/aiad index` and verify your new specifications are properly indexed in the registry.

5. **Cross-reference specs and code.** Pick any existing agent and verify that its specification matches its implementation (capabilities, inputs, outputs, telemetry events).

## Summary

The AIAD standard provides a uniform structure for all autonomous components in the Prismatic Platform. Agents, Commands, Pipelines, and Policies each have specific specification formats with YAML frontmatter and markdown documentation. Classification levels (L1-L4) control authority. The enforcement block connects every component to the NO MERCY, NO DOUBTS doctrine. The AIAD registry indexes all specifications for runtime lookup and validation.

Key takeaways:

- Four component types: Agent, Command, Pipeline, Policy
- Specifications use YAML frontmatter + markdown body
- Classification levels (L1-L4) control authority and scope
- Every specification must include the enforcement block
- Re-index after changes with `./.aiad/bin/aiad index`
- Keep specifications synchronized with implementations

## Practical Implementation

### In Prismatic Platform

The AIAD standard is implemented through these applications and infrastructure:

- **prismatic_agents** (`apps/prismatic_agents/`) -- Runtime agent registry (`PrismaticAgents.Registry`) that indexes all AIAD agent specifications at startup and provides runtime lookup via `PrismaticAgents.Registry.get_spec/1` and `PrismaticAgents.Registry.list_by_domain/1`
- **prismatic** (`apps/prismatic/`) -- Houses the `mix git_trees` task and quality mix tasks that validate AIAD compliance. The root coordination app ensures all AIAD specifications are consistent with their implementations
- **prismatic_api** (`apps/prismatic_api/`) -- AIAD commands map to REST API endpoints through the auto-introspection scanner. `PrismaticApi.Registry` (ETS-backed) links discovered functions to AIAD command specifications
- **prismatic_safety** (`apps/prismatic_safety/`) -- Enforces the `enforcement` block that every AIAD component must include, connecting each component to the NO MERCY, NO DOUBTS doctrine

### Code Examples from the Codebase

AIAD specifications live in `.aiad/` with strict directory conventions:

```bash
# AIAD component directories
.aiad/agents/*.agent.md     # 400+ agent specifications
.aiad/commands/*.cmd.md      # 210+ command specifications
.aiad/pipelines/*.pipeline.md # 50+ pipeline specifications
.aiad/policies/*.policy.md   # 30+ policy specifications

# Rebuild the index after any specification change
./.aiad/bin/aiad index

# Registries are auto-generated
.claude/AGENT_REGISTRY.md    # Full agent listing
.claude/COMMAND_REGISTRY.md  # Full command listing
```

The enforcement block is mandatory in every specification:

```yaml
# Required in ALL AIAD components - NO EXCEPTIONS
enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory
```

## See Also

### Related Applications
- [prismatic_agents](@/apps/prismatic-agents.md) -- Runtime AIAD agent registry and execution
- [prismatic_api](@/apps/prismatic-api.md) -- AIAD commands exposed as REST endpoints
- [prismatic_safety](@/apps/prismatic-safety.md) -- AIAD enforcement block validation

### Glossary
- [AIAD](@/glossary/aiad.md) -- AI Agent Directive standard
- [Agent](@/glossary/agent.md) -- Autonomous entity performing work
- [Agent Registry](@/glossary/agent-registry.md) -- Runtime specification lookup
- [Agent Tier](@/glossary/agent-tier.md) -- L1-L4 authority classification
- [NO MERCY](@/glossary/no-mercy.md) -- Execution quality doctrine referenced in enforcement blocks
- [NO DOUBTS](@/glossary/no-doubts.md) -- Decision quality doctrine referenced in enforcement blocks
- [Quality DNA](@/glossary/quality-dna.md) -- Evolutionary state tracking AIAD compliance

### Related Academy Topics
- [Multi-Agent Orchestration](@/academy/agent-orchestration.md) -- Coordinating agents defined by AIAD specs
- [Self-Evolving Ecosystems](@/academy/evolution-patterns.md) -- How AIAD specs evolve over generations
- [API Integration](@/academy/api-integration.md) -- Exposing AIAD components through REST API
- [Building Your First Agent](@/academy/first-agent.md) -- Creating an AIAD-compliant agent from scratch
- [Quality Standards](@/academy/quality-standards.md) -- The enforcement doctrine AIAD references

## Next Steps

- [Multi-Agent Orchestration Patterns](@/academy/agent-orchestration.md) -- coordinate agents defined by AIAD specs
- [Self-Evolving Agent Ecosystems](@/academy/evolution-patterns.md) -- how AIAD specs evolve over generations
- [API Integration Guide](@/academy/api-integration.md) -- exposing AIAD components through the REST API

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)