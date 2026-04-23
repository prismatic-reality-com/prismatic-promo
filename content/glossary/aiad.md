+++
title = "AIAD"
weight = 11
[extra]
description = "AI-Agent Interface Definition standard governing 404+ platform agents"
category = "agents"
abbreviation = "AIAD"
related_terms = ["agent-tier", "agent-registry", "nm-nd", "archer-supreme", "ollama", "3nl", "agent", "openapi", "pvm", "rbac", "strategic-command", "supreme-commander", "tactical-execution", "three-nl"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 968
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["AIAD", "AI-Agent", "Interface", "Definition", "glossary", "agents", "Prismatic Platform", "README"]
tags = ["glossary", "agents", "aiad", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "AIAD - Prismatic Platform"
+++

## Definition and Overview

AIAD (AI-Agent Interface Definition) is the standardized specification format for defining AI agents within the Prismatic Platform. Each AIAD definition declares an agent's authority level (L1-L5), capabilities, input/output contracts, enforcement blocks (including mandatory NM/ND doctrine compliance), and operational constraints. The standard covers agents, commands, pipelines, policies, and adapters, providing a unified governance layer across all autonomous components.

The AIAD standard emerged from the need to govern an increasingly complex ecosystem of AI agents operating across security, intelligence, quality, and infrastructure domains. Without a uniform specification format, agent interoperability, discovery, and governance would degrade as the platform scaled. AIAD solves this by establishing a single, machine-readable contract format that every autonomous component must satisfy.

At its core, AIAD is an interface definition language (IDL) purpose-built for AI agent ecosystems. Where OpenAPI defines REST API contracts and Protocol Buffers define RPC interfaces, AIAD defines the behavioral contracts, authority boundaries, and doctrinal compliance requirements for autonomous agents. This positions AIAD as the governance backbone of the entire Prismatic agent ecosystem.

## Technical Deep Dive

### Specification Format

Every AIAD definition is a Markdown file with a structured YAML frontmatter block and free-form documentation body. The file extension convention is `.agent.md` for agents, `.cmd.md` for commands, `.pipeline.md` for pipelines, `.policy.md` for policies, and `.adapter.md` for adapters.

The YAML frontmatter follows a strict schema:

```yaml
# .aiad/agents/example-agent.agent.md
agent-spec:
  id: "example-agent"
  name: "Example Agent"
  version: "1.0.0"
  classification: "L2-TACTICAL"
  domain: "quality"
  authority:
    level: 2
    scope: ["quality-analysis", "code-review"]
    override: []
  capabilities:
    - "static-analysis"
    - "pattern-detection"
    - "recommendation-generation"
  inputs:
    - type: "source-code"
      format: "elixir"
    - type: "configuration"
      format: "yaml"
  outputs:
    - type: "quality-report"
      format: "json"
    - type: "recommendation-list"
      format: "markdown"
  enforcement:
    doctrine: "no-mercy-no-doubts"
    version: "2.0.0"
    compliance: mandatory
  dependencies:
    - "credo"
    - "dialyzer"
  telemetry:
    events: ["scan_started", "scan_completed", "violation_detected"]
```

### Authority Classification System

AIAD defines a five-tier authority hierarchy that governs what resources and operations each agent can access:

| Level | Classification | Authority Scope | Override Capability | Example Agents |
|-------|---------------|-----------------|--------------------|----|
| L1 | Basic | Single-domain read access | None | Data collectors, formatters |
| L2 | Tactical | Single-domain read/write | None | Analyzers, specialists |
| L3 | Strategic | Multi-domain coordination | L1-L2 agents | Team commanders, coordinators |
| L4 | Command | Cross-domain authority | L1-L3 agents | Domain architects, escalation handlers |
| L5 | Supreme | Unlimited platform access | All agents | Archer Supreme, Supreme Commander |

Each authority level inherits all capabilities of lower levels. An L3 agent can perform any operation available to L1 and L2 agents within its scope, plus coordinate across multiple domains.

### Component Types

AIAD governs five distinct component types within the platform:

| Component | File Pattern | Purpose | Count |
|-----------|-------------|---------|-------|
| Agents | `*.agent.md` | Autonomous operational units | 404+ |
| Commands | `*.cmd.md` | User-invocable operations | 210+ |
| Pipelines | `*.pipeline.md` | Multi-step processing workflows | 40+ |
| Policies | `*.policy.md` | Governance and enforcement rules | 25+ |
| Adapters | `*.adapter.md` | Integration interfaces | 15+ |

### Enforcement Block

Every AIAD component must include a mandatory enforcement block declaring compliance with the [NM/ND doctrine](/glossary/nm-nd/):

```yaml
enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory
```

Components without this block are rejected by the AIAD indexer and cannot be registered in the [Agent Registry](/glossary/agent-registry/). This ensures that every autonomous component in the platform operates under the same quality and execution standards.

## Architecture and Implementation

### Indexing System

The AIAD toolchain provides automated discovery and indexing:

```bash
# Index all AIAD components
./.aiad/bin/aiad index

# Output: Scans .aiad/ directory tree
# - Discovers all *.agent.md, *.cmd.md, *.pipeline.md, *.policy.md, *.adapter.md
# - Validates YAML frontmatter schema compliance
# - Checks enforcement block presence
# - Generates registry entries
# - Reports validation errors
```

The indexer produces a machine-readable registry consumed by the runtime agent system in `prismatic_agents`. This enables dynamic agent discovery, capability-based routing, and authority validation at runtime.

### Directory Structure

```
.aiad/
  agents/           # 404+ agent definitions
    archer-supreme.agent.md
    blue-commander.agent.md
    elixir-architect.agent.md
    ...
  commands/          # 210+ command definitions
    orchestrate.cmd.md
    investigate.cmd.md
    ...
  pipelines/         # Processing workflow definitions
    quality-gate.pipeline.md
    ...
  policies/          # Governance rules
    no-mercy-no-doubts-enforcement.policy.md
    elixir-best-practices.policy.md
    ...
  adapters/          # Integration interfaces
    ollama.adapter.md
    ...
  doctrine/          # Foundational principles
    no-mercy-no-doubts.doctrine.md
    addiction-preservation.doctrine.md
    nabla-infinity.doctrine.md
  guides/            # Integration guides
    AIAD-MASTER-GUIDE.md
    ...
  hooks/             # Lifecycle hooks
    mandatory-evolution.hook.yaml
  bin/               # Toolchain executables
    aiad              # Main CLI tool
```

### Runtime Integration

At runtime, AIAD definitions are loaded by the `PrismaticAgents` application and cached in ETS for O(1) lookup:

```elixir
defmodule PrismaticAgents.Registry do
  @moduledoc """
  Runtime registry for AIAD agent definitions.
  Provides O(1) lookup by agent ID, domain, or capability.
  """

  def lookup(agent_id) do
    case :ets.lookup(@table, agent_id) do
      [{^agent_id, definition}] -> {:ok, definition}
      [] -> {:error, :not_found}
    end
  end

  def find_by_capability(capability) do
    :ets.match_object(@table, {:_, %{capabilities: :"$1"}})
    |> Enum.filter(fn {_, def} -> capability in def.capabilities end)
  end

  def find_by_authority(min_level) do
    :ets.foldl(fn {id, def}, acc ->
      if def.authority.level >= min_level, do: [{id, def} | acc], else: acc
    end, [], @table)
  end
end
```

### Validation Pipeline

AIAD definitions pass through a multi-stage validation pipeline before registration:

1. **Schema Validation** -- YAML frontmatter matches the AIAD schema specification
2. **Authority Consistency** -- Override targets are lower-tier than the agent's own level
3. **Enforcement Presence** -- NM/ND enforcement block exists with correct version
4. **Dependency Resolution** -- All declared dependencies exist as registered components
5. **Capability Uniqueness** -- No capability conflicts with existing registered agents
6. **Documentation Completeness** -- Markdown body meets minimum documentation standards

## Usage in Prismatic Platform

The Prismatic Platform operates 404+ AIAD-compliant agents across 14 domains:

| Domain | Agent Count | Key Agents |
|--------|------------|------------|
| Quality | 45+ | quality-guardian, credo-enforcer, dialyzer-validator |
| Security | 40+ | red-commander, blue-commander, purple-coordinator |
| Intelligence | 35+ | osint-coordinator, entity-resolver, threat-analyst |
| Infrastructure | 30+ | deployment-coordinator, health-monitor, auto-healer |
| Storage | 25+ | storage-orchestrator, adapter-validator, migration-manager |
| Evolution | 20+ | auto-evolver, fitness-evaluator, consciousness-tracker |
| EASM | 15+ | perimeter-scanner, rating-calculator, compliance-assessor |
| API | 10+ | api-scanner, endpoint-validator, spec-generator |

### Agent Invocation

Agents are invoked through the command system or programmatically:

```bash
# Via command system
/archer-supreme --mission=crisis-resolution --target=quality-degradation

# Via orchestration
/orchestrate --agents=quality-guardian,credo-enforcer --task=full-audit
```

```elixir
# Programmatic invocation
{:ok, result} = PrismaticAgents.invoke("quality-guardian", %{
  task: :full_audit,
  scope: :all_apps,
  enforcement: :strict
})
```

### Creating New Agents

The AIAD standard provides a template-driven workflow for agent creation:

```bash
# Generate agent scaffold
./.aiad/bin/aiad new agent my-new-agent --domain=quality --level=2

# Generates: .aiad/agents/my-new-agent.agent.md
# - Pre-filled YAML frontmatter with schema-compliant structure
# - NM/ND enforcement block included
# - Documentation template with required sections
# - Placeholder capability declarations
```

## Code Examples

### Reading an AIAD Definition Programmatically

```elixir
defmodule PrismaticAgents.Definition do
  @moduledoc """
  Parses and validates AIAD agent definitions.
  """

  @spec parse(String.t()) :: {:ok, map()} | {:error, term()}
  def parse(file_path) do
    with {:ok, content} <- File.read(file_path),
         {:ok, frontmatter, body} <- extract_frontmatter(content),
         {:ok, spec} <- validate_schema(frontmatter),
         :ok <- validate_enforcement(spec) do
      {:ok, %{spec: spec, documentation: body, source: file_path}}
    end
  end

  defp validate_enforcement(%{"enforcement" => %{"doctrine" => "no-mercy-no-doubts"}}), do: :ok
  defp validate_enforcement(_), do: {:error, :missing_enforcement_block}
end
```

### Authority Checking

```elixir
defmodule PrismaticAgents.Authority do
  @moduledoc """
  Validates agent authority for requested operations.
  """

  @spec authorized?(map(), atom()) :: boolean()
  def authorized?(agent_def, operation) do
    required_level = operation_authority(operation)
    agent_def.authority.level >= required_level
  end

  defp operation_authority(:read), do: 1
  defp operation_authority(:write), do: 2
  defp operation_authority(:coordinate), do: 3
  defp operation_authority(:override), do: 4
  defp operation_authority(:supreme), do: 5
end
```

## Best Practices

1. **Start at the lowest authority level** -- New agents should begin at L1 or L2 and be promoted only when higher authority is demonstrably required.

2. **Declare capabilities precisely** -- Broad capability declarations lead to routing ambiguity. Be specific about what each agent can do.

3. **Document override relationships** -- When an agent can override others, explicitly document the conditions under which overrides occur.

4. **Version your definitions** -- Use semantic versioning in AIAD definitions. Breaking changes to an agent's contract require a major version bump.

5. **Test against the schema** -- Run `./aiad/bin/aiad validate` before committing new or modified definitions.

6. **Keep enforcement blocks current** -- When the NM/ND doctrine version updates, all AIAD definitions must update their enforcement blocks.

## Common Pitfalls

- **Missing enforcement blocks**: The most common AIAD validation failure. Every component requires the NM/ND enforcement block -- no exceptions.

- **Authority escalation**: Agents requesting higher authority than their classification allows. The indexer rejects L2 agents claiming L3 override capabilities.

- **Circular dependencies**: Two agents declaring dependencies on each other. The dependency resolver detects and rejects cycles.

- **Stale registrations**: Modifying an agent definition without re-running the indexer. Always run `./.aiad/bin/aiad index` after changes.

- **Capability overlap**: Multiple agents declaring identical capabilities without a clear routing priority. Use the `priority` field to disambiguate.

## Related Concepts

- [Agent Registry](/glossary/agent-registry/) -- Central catalog of all AIAD agents
- [Agent Tier](/glossary/agent-tier/) -- L1-L5 authority classification system
- [NM/ND Doctrine](/glossary/nm-nd/) -- Mandatory enforcement block in all AIAD definitions
- [Archer Supreme](/glossary/archer-supreme/) -- Example L5 AIAD agent for crisis resolution
- [Supreme Commander](/glossary/supreme-commander/) -- L5 strategic coordination agent
- [3NL Framework](/glossary/three-nl/) -- Epistemic integration framework connected through AIAD

## See Also

- [prismatic_agents](../../../apps/prismatic_agents/README.md) -- Runtime engine managing 434 AIAD-compliant agents
- [prismatic_claude](../../../apps/prismatic_claude/README.md) -- Claude integration with AIAD session lifecycle
- [prismatic_safety](../../../apps/prismatic_safety/README.md) -- Quality enforcement consuming AIAD agent telemetry
- [prismatic_core](../../../apps/prismatic_core/README.md) -- Core platform infrastructure supporting AIAD runtime
- [AIAD Standard](/architecture/) -- Complete specification reference
- [Agent Registry](/agents/) -- Full agent catalog with AIAD definitions
- [Commands](/commands/) -- AIAD command definitions

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)