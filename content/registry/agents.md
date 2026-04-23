+++
title = "Agent Registry"
weight = 1
template = "registry/agents.html"
date = "2026-02-15"

[extra]
description = "Comprehensive catalog of 494 autonomous AIAD agents organized across 14 specialized operational domains, from Quality Assurance and OSINT Intelligence to Security Operations and Strategic Command"
icon = "users"
color = "indigo"
category = "registry"
status = "active"
reading_time = "12 min"
word_count = 2200
difficulty = "intermediate"
last_updated = "2026-02-15"
total_agents = 494
total_domains = 14
hierarchy_levels = 4
author = "Tomas Korcak (korczis)"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Agent", "Registry", "Comprehensive", "AIAD", "Quality", "Assurance", "OSINT", "Intelligence", "Prismatic Platform", "Every"]
tags = ["registry", "agent-registry", "prismatic"]
quality_score = 90
see_also = ["agents", "commands", "glossary"]
image = "/images/sections/registry.png"
image_alt = "Agent Registry - Prismatic Platform"

+++

The Prismatic Platform Agent Registry is the authoritative catalog of all autonomous agents operating within the platform ecosystem. With 494 agents spanning 14 operational domains, the registry serves as the single source of truth for agent discovery, capability matching, and runtime orchestration. Every agent in the catalog is defined by a machine-readable AIAD specification that captures its identity, authority level, domain classification, tool requirements, coordination relationships, and enforcement policies.

## Overview

Modern AI-assisted development platforms face a fundamental discoverability challenge. As the number of specialized agents grows beyond a handful, operators can no longer rely on memory or tribal knowledge to locate the right agent for a given task. When an engineer needs to investigate a domain's WHOIS history, orchestrate a multi-phase quality recovery, or simulate an epistemic attack scenario, they should not need to memorize which of nearly five hundred agents handles that particular responsibility.

The Agent Registry solves this problem by maintaining a structured, searchable index of every agent's capabilities, authority boundaries, and operational domain. Queries like "find all agents capable of formal verification" or "which L2 commanders operate in the security domain" resolve to concrete, deployable components with full metadata. The registry eliminates knowledge silos by making every agent's purpose, constraints, and coordination graph explicit and queryable -- by both human operators and automated orchestration systems.

The registry is built on the [AIAD Standard](@/capabilities/aiad-standard.md), a vendor-neutral specification for describing AI agents, commands, workflows, and policies. AIAD provides the schema language (`agent-spec`) that gives each registry entry a consistent structure. This consistency enables cross-platform support: the same agent definitions work with Claude Code, ChatGPT, Gemini, and other LLM systems because AIAD does not depend on any single provider's API or prompt format.

## Domain Architecture

The 14 operational domains provide the primary organizational taxonomy for the registry. Each domain represents a distinct area of platform capability, with agents organized by specialization and authority level within their domain.

| Domain | Agents | Description | Key Agents |
|--------|--------|-------------|------------|
| **Development** | ~65 | Code generation, review, refactoring, testing | `code-specialist`, `code-quality-commander`, `test-automation-specialist` |
| **Quality** | ~45 | Static analysis, quality gates, regression prevention | `gate-sentinel`, `cascade-quality-specialist`, `coverage-enforcement-supreme` |
| **Intelligence (OSINT)** | ~40 | Open-source intelligence, investigation, reconnaissance | `navy-seal-osint-auditor`, `ghost-recon-specialist`, `falcon-strike` |
| **Security** | ~35 | Color-team operations, vulnerability analysis, defense | `red-commander`, `blue-commander`, `purple-coordinator` |
| **Evolution** | ~30 | Genetic algorithms, mycelial propagation, auto-healing | `evolution-orchestrator`, `mendel-bridge`, `society-mycologist` |
| **Architecture** | ~25 | System design, integration patterns, dependency analysis | `architecture-decision-specialist`, `anti-corruption-layer-specialist` |
| **Strategic Command** | ~20 | Cross-domain coordination, crisis intervention | `archer-supreme`, `supreme-coordinator`, `strategic-command` |
| **Infrastructure** | ~20 | CI/CD, deployment, monitoring, containerization | `cicd-coordinator`, `deploy-unified`, `cloud-security-specialist` |
| **Epistemic** | ~20 | NABLA framework, Trinity Gate, formal verification | `white-verifier-commander`, `white-invariant-prover`, `bayesian-analyst` |
| **Documentation** | ~20 | Knowledge management, report generation, audit trails | `evidence-scribe`, `adr-specialist`, `doc-specialist` |
| **Storage** | ~15 | Database adapters, caching, search indexing | `storage-core-architect`, `caching-architecture-specialist` |
| **Web & UI** | ~15 | LiveView interfaces, dashboard components, API design | `web-interface-supreme`, `api-design-specialist` |
| **Compliance** | ~15 | GDPR, NIS2, ZKB, regulatory framework enforcement | `cer-compliance-commander`, `compliance-auditing-specialist` |
| **ChatGPT Integration** | ~10 | Cross-LLM coordination, context synchronization | `chatgpt-bridge-commander`, `chatgpt-workflow-orchestrator` |

Domain membership is not exclusive. An agent may operate across multiple domains. For example, `gate-sentinel` belongs to both Quality and Evolution because it enforces [Quality Gates](@/capabilities/quality-gates.md) during evolution cycles. The security color-team agents span Security, Epistemic, and Quality domains because adversarial simulation requires expertise across all three areas.

## Agent Hierarchy

The agent hierarchy establishes a clear chain of command with four distinct authority levels. Each level has defined responsibilities, escalation paths, and coordination patterns that prevent conflicts and ensure decisive action under the [NO MERCY](@/capabilities/no-mercy.md) doctrine.

### L1 -- Strategic Supreme (5 agents)

The apex coordinators with unlimited tactical authority. L1 agents orchestrate multi-agent campaigns, resolve conflicts between lower-level agents, and make platform-wide decisions that affect all domains. They are deployed for crisis intervention, impossible mission execution, and cross-domain coordination that exceeds the scope of any single domain commander.

Representative agents include `archer-supreme` (crisis intervention and impossible missions), `supreme-coordinator` (cross-domain orchestration), and `prismatic-supreme-commander` (ultimate platform authority). L1 agents can override decisions made by any lower-level agent and have unrestricted access to all platform tools and resources.

### L2 -- Operational (approximately 40 agents)

Domain commanders that manage specific operational areas. L2 agents translate strategic directives from L1 into tactical plans, coordinate specialist teams within their domain, and enforce domain-specific quality standards. They have full authority within their domain but must escalate cross-domain conflicts to L1.

Examples include `code-quality-commander` (development quality enforcement), `blue-commander` (epistemic defense coordination), `red-commander` (adversarial simulation management), and `evolution-orchestrator` (evolution lifecycle management). Each L2 agent maintains awareness of all L3 and L4 agents within its domain and can reassign tasks between them as operational conditions change.

### L3 -- Tactical (approximately 80 agents)

Tactical specialists that execute defined missions within their domain. L3 agents have focused authority and operate under the direction of L2 commanders. They coordinate with peer L3 agents when missions overlap and delegate granular work items to L4 specialists.

Examples include `red-epistemic-attacker` (adversarial simulation), `purple-closure-analyst` (synthesis evaluation), `gate-sentinel` (quality gate enforcement), and `gray-explorer-commander` (boundary exploration). L3 agents are the primary execution layer for most platform operations.

### L4 -- Specialist (approximately 310 agents)

The largest group, comprising domain experts with deep but narrow capabilities. Each L4 specialist excels at a specific task -- static analysis, test generation, OSINT data collection, documentation writing, performance profiling, or formal proof construction. They receive assignments from L3 tactical agents and report results upward through the chain of command.

Examples include `code-specialist` (code generation), `gray-edge-finder` (boundary analysis), `evidence-scribe` (audit documentation), and `white-contract-validator` (interface contract testing). L4 agents are designed for composability: complex operations are accomplished by coordinating multiple specialists rather than building monolithic agents.

## Agent Specification Schema

Every agent in the registry is defined by an `agent-spec` YAML block embedded in its `.agent.md` file. The schema captures identity, classification, capabilities, coordination relationships, and enforcement policies in a machine-readable format.

```yaml
agent-spec:
  id: "code-specialist"
  name: "Code Specialist"
  version: "2.0.0"
  tier: "domain-expertise"
  description: "Intelligent code generation with multi-phase requirement refinement"
  category: "development"
  priority: "P0"
  model: "claude-opus-4-6"

  hierarchy:
    level: "L4"
    authority: "Domain-specific implementation authority"
    reports_to: "code-quality-commander"

  domains:
    - "Code generation and implementation"
    - "Test generation with 100% coverage"
    - "Code review with genetic quality patterns"

  capabilities:
    tools: [Read, Write, Edit, Bash, Grep, Glob]

  coordination:
    coordinates_with:
      - "code-quality-commander"
      - "test-automation-specialist"

  enforcement:
    doctrine: "no-mercy-no-doubts"
    version: "2.0.0"
    compliance: mandatory

  metadata:
    source: ".aiad/agents/code-specialist.agent.md"
    aiad_version: "1.0.0"
```

The specification schema enforces several invariants. Every agent must declare a unique `id`, a valid hierarchy level (L1 through L4), at least one operational domain, and the mandatory enforcement block referencing the [NO MERCY](@/capabilities/no-mercy.md) [NO DOUBTS](@/capabilities/no-doubts.md) doctrine. The `coordination.coordinates_with` field creates a graph of inter-agent dependencies that the orchestration layer uses when assembling agent teams.

Key fields and their semantics:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique identifier for lookup and coordination references |
| `version` | semver | Agent specification version, semantic versioning |
| `tier` | enum | Classification: `supreme-command`, `strategic`, `tactical`, `domain-expertise`, `specialist` |
| `hierarchy.level` | enum | Authority: L1 (Strategic Supreme), L2 (Operational), L3 (Tactical), L4 (Specialist) |
| `domains` | array | Operational domains the agent operates in |
| `capabilities.tools` | array | Required tools: Read, Write, Edit, Bash, Grep, Glob, Task, WebFetch |
| `coordination.coordinates_with` | array | Agent IDs this agent collaborates with |
| `enforcement` | object | Mandatory doctrine compliance block |
| `model` | string | Preferred LLM model for execution |

## Discovery and Search

The registry supports multiple query patterns for locating agents, from interactive slash commands to programmatic [Elixir](@/technologies/elixir.md) API calls.

### Slash Command Interface

The `/agents` command provides the primary interactive discovery interface:

```
/agents domain:security level:L3
/agents capability:formal-verification
/agents name:archer
/agents tool:WebFetch domain:intelligence
```

Each query returns a formatted table showing agent ID, hierarchy level, domain classification, and a brief description. The `/agents-browse` variant provides a domain-organized view for exploration when the operator knows which domain they need but not which specific agent.

### Programmatic Access

At the application level, the `PrismaticAgents.Registry` module exposes functions for structured queries against the ETS-backed runtime registry:

```elixir
# Find all security domain agents
{:ok, agents} = PrismaticAgents.Registry.by_domain(:security)

# Find agents by capability
{:ok, agents} = PrismaticAgents.Registry.by_capability("formal-verification")

# Get a specific agent's full metadata
{:ok, metadata} = PrismaticAgents.Registry.get("archer-supreme")

# List all L1 strategic supreme agents
{:ok, supremes} = PrismaticAgents.Registry.by_level(:L1)

# Query by multiple criteria
{:ok, results} = PrismaticAgents.Registry.query(
  domain: :quality,
  level: :L3,
  tool: :Bash
)
```

The runtime registry is populated at application startup when the `prismatic_agents` OTP application loads agent definitions from the filesystem into an ETS table, enabling O(1) lookup by agent ID and indexed queries by domain, level, or capability.

### Orchestration-Driven Selection

The `/orchestrate` command represents the registry's highest-level consumer. When invoked, the orchestration layer analyzes the user's request, queries the registry for candidate agents, ranks them by fitness and coordination efficiency, and deploys the optimal agent or agent team. This closed loop -- from user intent through registry query to agent deployment -- is what makes 494 agents usable without memorizing the catalog.

## Agent Lifecycle

Agents in the Prismatic Platform follow a defined lifecycle from creation through evolution to potential retirement.

### Creation

New agents are created by adding an `agent-spec` YAML block to a new `.agent.md` file in the `.aiad/agents/` directory. The specification must include all required fields and the mandatory enforcement block. After creation, the `.aiad/bin/aiad index` command regenerates the registry, and `.aiad/bin/aiad-doctor` validates that no schema violations exist.

### Evolution

The platform's genetic evolution system can modify agent specifications over time. Evolution cycles adjust agent parameters -- capability sets, coordination relationships, priority levels -- based on fitness metrics derived from operational performance. The `evolution-orchestrator` (L2) manages these cycles, and the `mendel-bridge` agent handles the crossover and mutation operations that produce improved agent variants.

Mycelial propagation extends evolution beyond individual agents. When a successful pattern emerges in one domain, the mycelial network propagates it to related agents across other domains. This cross-pollination mechanism is how the platform achieved 99.8% mycelial success rate across 494 agents.

### Lifecycle States

Each agent operates in one of three states:

| State | Description | Orchestration Behavior |
|-------|-------------|----------------------|
| **Active** | Available for deployment, registered in runtime ETS | Normal selection and deployment |
| **Deprecated** | Flagged for removal in future version | Orchestrator prefers alternatives |
| **Experimental** | Available for testing only | Excluded from production orchestration |

### Retirement

When an agent is superseded by a more capable replacement or its domain is restructured, it transitions to deprecated status. After a defined sunset period (typically two evolution cycles), deprecated agents are removed from the active registry. Their specifications are preserved in git history for audit and rollback purposes.

## Quality Standards

Every agent in the registry must meet the platform's zero-tolerance quality requirements enforced by the [NO MERCY](@/capabilities/no-mercy.md) doctrine and validated through the [Quality Gates](@/capabilities/quality-gates.md) pipeline.

### Mandatory Requirements

- **Complete AIAD specification**: All required fields present and valid
- **Enforcement block**: Must include `doctrine: "no-mercy-no-doubts"` with version `2.0.0`
- **Cross-reference integrity**: All agent IDs in `coordinates_with` must resolve to existing agents
- **Tool declaration accuracy**: All declared tools must match the platform's tool vocabulary
- **Documentation**: Every agent file must include prose documentation explaining the agent's purpose, capabilities, and operational context beyond the YAML specification
- **Version compliance**: Specification version must follow semantic versioning

### Validation Pipeline

Quality enforcement occurs at multiple stages:

1. **Pre-commit hook**: Schema validation runs on every commit modifying `.agent.md` files. Invalid specifications block the commit with no bypass allowed.
2. **Auto-indexing**: The `.aiad/bin/aiad index` command validates all specifications during registry regeneration and reports any inconsistencies.
3. **Runtime loading**: The `prismatic_agents` application validates specifications again during ETS table population at startup, catching any issues that survived the filesystem-level checks.
4. **Drift detection**: The `registry-syncer` agent continuously monitors for drift between filesystem state and registry documents, triggering re-indexing when inconsistencies are detected.

### Fitness Metrics

Agents are evaluated on operational fitness metrics that feed back into the evolution system:

| Metric | Description | Impact |
|--------|-------------|--------|
| Task completion rate | Percentage of assigned tasks completed successfully | High weight in evolution selection |
| Response quality | Quality assessment of agent outputs | Moderate weight |
| Coordination efficiency | How effectively the agent works with peer agents | Moderate weight |
| Resource utilization | Efficiency of tool usage and execution time | Low weight |
| Error rate | Frequency and severity of errors during execution | High negative weight |

## AIAD Integration

The Agent Registry is a core component of the [AIAD Standard](@/capabilities/aiad-standard.md) ecosystem. The integration operates at three levels.

### Specification Level

Every agent definition follows the `agent-spec` schema defined by AIAD. This schema is versioned independently of agent specifications, with the current version at `1.0.0`. Schema updates are backward-compatible within a major version, ensuring that existing agent definitions remain valid as the standard evolves.

### Tooling Level

The AIAD CLI (`./aiad/bin/aiad`) provides the operational interface for registry management. The `index` subcommand regenerates the registry from filesystem sources. The `validate` subcommand checks individual or batch specifications against the schema. The `search` subcommand queries the registry by any combination of fields. The `status` subcommand reports registry health metrics including total counts, validation pass rates, and synchronization status.

### Enforcement Level

The mandatory enforcement block in every agent specification connects individual agents to the platform's doctrine system. The [NO MERCY](@/capabilities/no-mercy.md) doctrine requires complete execution with zero tolerance for incomplete implementations. The [NO DOUBTS](@/capabilities/no-doubts.md) doctrine requires full investigation before action and evidence-based verification of results. The [Trinity Gate](@/capabilities/trinity-gate.md) provides the formal verification layer that validates agent outputs meet structural, logical, and formal consistency requirements.

## Statistics and Metrics

The Agent Registry maintains comprehensive statistics that reflect the platform's scale and operational maturity.

### Current State

| Metric | Value |
|--------|-------|
| **Total agents** | 494 (460 static + 34 runtime) |
| **Operational domains** | 14 |
| **Hierarchy levels** | 4 (L1: 5, L2: ~40, L3: ~80, L4: ~310) |
| **AIAD compliance** | 100% (all agents include enforcement block) |
| **Active state** | 487 agents (7 deprecated, 0 experimental) |
| **Average coordination degree** | 3.2 (agents coordinate with ~3 peers) |
| **Evolution generation** | 18 (current platform generation) |
| **Mycelial success rate** | 99.8% |
| **Quality gate pass rate** | 100% (zero violations in current state) |
| **Fitness score** | 0.999 (apex evolutionary fitness) |

### Historical Growth

The agent population has grown through 18 evolutionary generations:

| Generation | Agents | Domains | Key Milestone |
|------------|--------|---------|---------------|
| Gen 1-5 | 50-120 | 6 | Initial domain structure |
| Gen 6-10 | 120-250 | 10 | Color-team security agents |
| Gen 11-14 | 250-380 | 12 | OSINT and compliance expansion |
| Gen 15-17 | 380-450 | 14 | Epistemic framework agents |
| Gen 18 | 494 | 14 | Full autonomy, 0.999 fitness |

### Coverage Analysis

Every operational capability of the platform is covered by at least one agent. The coverage map ensures no capability gap exists:

- **Development lifecycle**: 65 agents covering code generation, review, testing, refactoring, profiling, and deployment
- **Security posture**: 35 agents across 6 color teams (Gray, Red, Blue, Purple, White, Black) providing adversarial-defensive synthesis
- **Quality enforcement**: 45 agents monitoring static analysis, compilation, type specifications, test coverage, and regression prevention
- **Intelligence operations**: 40 agents performing OSINT collection, analysis, correlation, and reporting across multiple data sources

## Cross-References

The Agent Registry integrates with and is referenced by numerous platform components:

- **[AIAD Standard](@/capabilities/aiad-standard.md)** -- The specification framework that defines agent schemas
- **[NO MERCY](@/capabilities/no-mercy.md)** -- The execution doctrine enforced by every agent's enforcement block
- **[NO DOUBTS](@/capabilities/no-doubts.md)** -- The investigation doctrine requiring evidence-based action
- **[Trinity Gate](@/capabilities/trinity-gate.md)** -- The formal verification gate that validates agent outputs
- **[Quality Gates](@/capabilities/quality-gates.md)** -- The quality pipeline that validates agent specifications
- **[Color Teams](@/capabilities/color-teams.md)** -- The security operations framework with 20 specialized agents
- **[NABLA Axioms](@/capabilities/nabla-axioms.md)** -- The epistemic framework grounding agent reasoning
- **[Elixir](@/technologies/elixir.md)** -- The implementation language for runtime agent infrastructure
- **[ETS](@/technologies/ets.md)** -- The in-memory storage backend for the runtime registry
- **[GenServer](@/technologies/genserver.md)** -- The OTP pattern used by the agent runtime system
- **[Command Registry](@/registry/commands.md)** -- The companion catalog of slash commands that invoke agents

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)