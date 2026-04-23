+++
title = "Registry"
description = "Unified searchable catalog of 434+ autonomous agents and 216+ slash commands across 14 operational domains in the Prismatic Platform AIAD ecosystem"
sort_by = "weight"
template = "registry/list.html"

[extra]
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
word_count = 2500
difficulty = "intermediate"
image = "/images/sections/registry.png"
image_alt = "Prismatic Platform AIAD registry architecture"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "2.0.0"
last_enhanced = "2026-02-06"
quality_score = 95
related_articles = ["prismatic-agents", "aiad"]
glossary_terms = ["AIAD", "agent", "command", "registry", "domain"]
keywords = ["AIAD agent registry", "autonomous agent catalog", "slash command registry", "agent capability discovery", "domain classification taxonomy", "auto-indexing pipeline", "runtime skill selection", "machine-readable agent metadata"]
tags = ["registry", "aiad", "agents", "commands", "catalog"]
see_also = ["agents", "commands", "capabilities"]
total_agents = 434
total_commands = 216
total_domains = 14
date_modified = "2026-02-23"
+++

Unified searchable catalog of every [autonomous agent](/glossary/autonomous-agent/) and [slash command](/glossary/slash-command/) in the Prismatic Platform. 434 [agents](/glossary/agent/) and 216 [commands](/glossary/command/) span 14 operational [domains](/glossary/domain/) -- from [Quality Assurance](/glossary/quality-assurance/) and [OSINT Intelligence](/glossary/osint/) to [Security Operations](/glossary/security-operations/) and Strategic Command -- each registered with [machine-readable](/glossary/machine-readable/) [metadata](/glossary/metadata-management/) that enables auto-discovery, capability matching, and runtime skill selection.

## Abstract

The Prismatic Platform [Registry](/glossary/registry/) is the authoritative inventory of all AI-Assisted Development ([AIAD](/glossary/aiad/)) components available within the platform [ecosystem](/glossary/ecosystem/). It indexes 434 [autonomous agents](/glossary/autonomous-agent/), 216 [slash commands](/glossary/slash-command/), and their associated [metadata](/glossary/metadata-management/) -- capability declarations, [authority levels](/glossary/authority-level/), [domain](/glossary/domain/) classifications, tool requirements, and [enforcement policies](/glossary/enforcement-policy/) -- into a single searchable catalog. The registry serves three distinct roles: it is the **discovery mechanism** through which operators and orchestration systems locate the right agent for a given task, the **contract surface** that defines what each component can do and under what constraints, and the **quality enforcement checkpoint** that ensures every registered component meets the platform's zero-tolerance compliance requirements before it can be deployed.

This document explains the registry's architecture, the metadata schemas that govern agent and command definitions, the 14-domain classification taxonomy, the auto-indexing pipeline that keeps the registry synchronized with the filesystem, and the integration points through which Claude Code and other LLM consumers query the registry at runtime.

## Introduction

### The Discovery Problem

A platform with hundreds of specialized [agents](/glossary/agent/) faces a fundamental discoverability challenge. When an operator needs to fix a [compilation](/glossary/compilation/) warning, investigate a domain's [WHOIS](/glossary/whois/) history, or orchestrate a multi-phase [CI/CD](/glossary/ci-cd/) recovery, they should not need to know the name of the [agent](/glossary/agent/) or [command](/glossary/command/) that handles that task. The [registry](/glossary/registry/) solves this by maintaining a searchable index of capabilities, so queries like "find all agents that can perform [static analysis](/glossary/static-analysis/)" or "which command handles genetic evolution" resolve to concrete, deployable components.

Without a registry, agent ecosystems degrade into tribal knowledge -- a handful of operators know that `archer-supreme` handles crisis intervention and `navy-seal` handles OSINT audits, but new team members and automated orchestration systems have no structured way to discover these capabilities. The registry eliminates this knowledge silo by making every component's purpose, authority level, domain, and tool requirements explicit and queryable.

### The AIAD Standard

The [registry](/glossary/registry/) is built on the [AIAD](/glossary/aiad/) (AI-Assisted Development) standard, a vendor-neutral [specification](/glossary/specification/) for describing [AI agents](/glossary/ai-agent/), [commands](/glossary/command/), [workflows](/glossary/workflow/), and [policies](/glossary/policy/). [AIAD](/glossary/aiad/) provides the [schema](/glossary/schema/) language -- `agent-spec` for [agents](/glossary/agent/), `command-spec` for [commands](/glossary/command/) -- that gives each registry entry a consistent, [machine-readable](/glossary/machine-readable/) structure. This consistency is what makes cross-platform support possible: the same [agent](/glossary/agent/) definitions work with [Claude Code](/glossary/claude-code/), ChatGPT, Gemini, and other [LLM](/glossary/llm/) systems because [AIAD](/glossary/aiad/) does not depend on any single provider's [API](/glossary/api/) or prompt format.

The AIAD standard currently governs 423 agent definition files (`.agent.md`) and 211 command definition files (`.cmd.md`), each stored in the `.aiad/agents/` and `.aiad/commands/` directories respectively. Runtime agents -- those registered dynamically during application startup -- bring the total to 434 agents and 216 commands including runtime-generated entries.

### Registry as Living Infrastructure

The registry is not a static document. It is continuously synchronized with the filesystem through the auto-indexing pipeline (`.aiad/bin/aiad index`), validated by quality gates on every commit, and queried at runtime by the orchestration layer to make deployment decisions. When a new agent definition file is added to `.aiad/agents/`, the next index run incorporates it into the registry. When an agent definition fails validation -- missing enforcement block, invalid authority level, undeclared tools -- the indexer flags it and the pre-commit hook blocks the commit.

## Registry Architecture

### Storage Layer

The registry is stored as two Markdown documents in the `.claude/` directory:

- **`.claude/AGENT_REGISTRY.md`** -- The complete agent catalog. Contains platform statistics, mandatory policies (stack-based conversation mode, autonomous evolution protocol, context management), and the full listing of all agents organized by functional group.
- **`.claude/COMMAND_REGISTRY.md`** -- The complete command catalog. Contains command statistics, category listings, and detailed specifications for all 216 slash commands.

These Markdown files serve as the human-readable reference. The machine-readable source of truth lives in the individual `.agent.md` and `.cmd.md` files under `.aiad/`, each containing a structured YAML specification block. The registry documents are generated by aggregating these individual files.

### Indexing Layer

The `.aiad/bin/aiad index` script traverses the `.aiad/agents/` and `.aiad/commands/` directories, parses the `agent-spec` and `command-spec` YAML blocks from each file, validates them against the AIAD schema, and updates the registry documents. The indexer also performs cross-reference validation -- ensuring that agents referenced in command definitions actually exist, that tool declarations match available tools, and that domain classifications use the canonical taxonomy.

### Runtime Layer

At application startup, the `prismatic_agents` [OTP application](/glossary/otp-application/) loads [agent](/glossary/agent/) definitions from the [registry](/glossary/registry/) into an [ETS table](/glossary/ets/), making them available for [O(1) lookup](/glossary/constant-time/) by [agent](/glossary/agent/) ID, [domain](/glossary/domain/), capability, or [authority level](/glossary/authority-level/). The runtime layer also registers dynamically created [agents](/glossary/agent/) -- those defined programmatically rather than through `.agent.md` files -- bringing the total count above the static file count.

### Query Interface

The registry supports multiple query patterns:

- **By ID**: Direct lookup of a specific agent or command by its unique identifier.
- **By Domain**: Retrieve all agents operating in a given domain (e.g., "quality", "intelligence", "security").
- **By Level**: Filter agents by hierarchy level (L1 through L4).
- **By Capability**: Search for agents that declare a specific capability or tool.
- **By Authority**: Find agents with sufficient authority for a given operation.

## Agent Registry

### Agent Metadata Schema

Every agent in the registry is defined by an `agent-spec` YAML block embedded in its `.agent.md` file. The schema captures identity, classification, capabilities, coordination relationships, and enforcement policies:

```yaml
agent-spec:
  id: "code-specialist"
  name: "Code Specialist"
  version: "2.0.0"
  tier: "domain-expertise"
  description: "Intelligent code generation with multi-phase requirement refinement"
  category: "development"
  priority: "P0"
  model: "claude-opus-4.5"

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

Key fields and their semantics:

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique identifier, used for lookup and coordination references |
| `version` | semver | Agent specification version, follows semantic versioning |
| `tier` | enum | Classification tier: `supreme-command`, `strategic`, `tactical`, `domain-expertise`, `specialist` |
| `hierarchy.level` | enum | Authority level: L1 (Strategic Supreme), L2 (Operational), L3 (Tactical), L4 (Specialist) |
| `domains` | array | Operational domains the agent operates in |
| `capabilities.tools` | array | Claude Code tools the agent requires (Read, Write, Edit, Bash, Grep, Glob, Task, WebFetch) |
| `coordination.coordinates_with` | array | Other agent IDs this agent collaborates with |
| `enforcement` | object | Mandatory doctrine compliance block |
| `model` | string | Preferred LLM model for execution |

### Agent Hierarchy Levels

The four [hierarchy levels](/glossary/agent-tier/) establish a clear [chain of command](/glossary/chain-of-command/):

**L1 -- [Strategic Supreme](/glossary/strategic-supreme/)** (5 [agents](/glossary/agent/)). These are the apex coordinators with unlimited tactical [authority](/glossary/authority-level/). They [orchestrate](/glossary/orchestration/) multi-[agent](/glossary/agent/) campaigns, resolve conflicts between lower-level [agents](/glossary/agent/), and make platform-wide decisions. Examples include `archer-supreme` ([crisis intervention](/glossary/crisis-intervention/) and impossible missions), `supreme-coordinator` (cross-domain [orchestration](/glossary/orchestration/)), and `prismatic-supreme-commander` (ultimate platform [authority](/glossary/authority-level/)).

**L2 -- Operational** (approximately 40 agents). Domain commanders that manage specific operational areas. They translate strategic directives into tactical plans, coordinate specialist teams, and enforce domain-specific quality standards. Examples include `code-quality-commander` (development quality enforcement), `blue-commander` (epistemic defense coordination), and `evolution-orchestrator` (evolution lifecycle management).

**L3 -- Tactical** (approximately 80 agents). Tactical specialists that execute defined missions within their domain. They have focused authority and operate under the direction of L2 commanders. Examples include `red-epistemic-attacker` (adversarial simulation), `purple-closure-analyst` (synthesis evaluation), and `gate-sentinel` (quality gate enforcement).

**L4 -- Specialist** (approximately 310 agents). The largest group, comprising domain experts with deep but narrow capabilities. Each specialist excels at a specific task -- static analysis, test generation, OSINT data collection, documentation writing, or performance profiling. They receive assignments from tactical agents and report results upward. Examples include `code-specialist` (code generation), `gray-edge-finder` (boundary analysis), and `evidence-scribe` (audit documentation).

### Agent Lifecycle States

Each agent operates in one of three states:

- **Active**: Available for deployment and currently registered in the runtime ETS table.
- **Deprecated**: Still registered but flagged for removal in a future version. Orchestration systems prefer alternatives when available.
- **Experimental**: Available for testing but not included in production orchestration decisions.

## Command Registry

### Command Metadata Schema

Commands are defined by a `command-spec` YAML block in `.cmd.md` files:

```yaml
command-spec:
  name: "evolve"
  description: "Self-evolving AIAD ecosystem intelligence"
  authority: "supreme"
  version: "5.1.0"
  classification:
    - "meta-evolution"
    - "self-recursive"
    - "living-intelligence"

  parameters:
    - name: "mode"
      type: "enum"
      required: false
      default: "intelligent"
      values:
        - "intelligent"
        - "self-evolve"
        - "meta-analyze"
        - "recursive"
        - "full"
      description: "Evolution mode with AI-powered intelligence selection"

    - name: "scope"
      type: "array"
      required: false
      default: ["intelligent-auto"]
      values:
        - "intelligent-auto"
        - "self"
        - "aiad"
        - "ecosystem"
        - "all"
      description: "Intelligent scope selection"

    - name: "meta-level"
      type: "integer"
      required: false
      default: 1
      min: 1
      max: 5
      description: "Meta-evolution recursion depth"

  outputs:
    - type: "meta_analysis_report"
      format: "structured_intelligence"
      description: "AI-powered meta-analysis of evolution effectiveness"

  enforcement:
    doctrine: "no-mercy-no-doubts"
    version: "2.0.0"
    compliance: mandatory
```

### Parameter Type System

Command parameters support these types:

| Type | Description | Example |
|------|-------------|---------|
| `string` | Free-form text input | `--target "compilation"` |
| `enum` | One value from a fixed set | `--mode intelligent` |
| `array` | Multiple values from a fixed set | `--scope aiad,ecosystem` |
| `integer` | Numeric value with optional min/max bounds | `--meta-level 3` |
| `boolean` | True/false flag | `--intelligence-amplification true` |
| `path` | Filesystem path, validated for existence | `--config ./custom.yml` |

### Command Categories

Commands are organized into functional categories:

- **Development (DX)**: 22 commands for code generation, testing, refactoring, profiling, and quality enforcement (`/code`, `/test`, `/fix`, `/refactor`, `/optimize`, `/orchestrate`).
- **Intelligence (OSINT)**: 11 commands for investigation, email analysis, domain reconnaissance, and threat assessment (`/investigate`, `/email-osint`, `/ghost-recon`, `/navy-seal`).
- **Evolution**: 8 commands for genetic evolution, mycelial propagation, and ecosystem improvement (`/evolve`, `/mycelialize`, `/darwinize`, `/mendelize`).
- **Architecture**: 6 commands for analysis, review, migration, and integration (`/analyze`, `/architect`, `/integrate`).
- **Crisis**: 3 commands for emergency response and structural crisis detection (`/emergency`, `/archer-supreme`, `/dark-ops`).
- **Operations**: 9 commands for deployment, health monitoring, and agent management (`/deploy`, `/health`, `/agents`).
- **Stack Mode**: 6 commands for conversation state management (`/stack`, `/frame`, `/pop`, `/fork`, `/checkpoint`, `/goto`).
- **M&A Operations**: 5 commands for due diligence deal lifecycle management (`/ma-create`, `/ma-analyze`, `/ma-report`).
- **Documentation**: 5 commands for hygiene, pattern scanning, and context preservation (`/chronic`, `/find-lowfruit`, `/context-preserve`).
- **Defensive Security**: 4 commands for manipulation detection and defense (`/manipulation detect`, `/manipulation protect`).
- **Local AI**: Infrastructure commands for Ollama model management (`/ollama`).
- **Doctrine Enforcement**: Compliance verification commands (`/nmnd-status`).

## Domain Classification

The 14 operational [domains](/glossary/domain/) provide the primary organizational [taxonomy](/glossary/taxonomy/) for the [registry](/glossary/registry/). Each [domain](/glossary/domain/) represents a distinct area of platform capability:

| Domain | Agent Count | Description | Key Agents |
|--------|-------------|-------------|------------|
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

Domain membership is not exclusive. An agent may operate across multiple domains -- for example, `gate-sentinel` belongs to both Quality and Evolution because it enforces quality gates during evolution cycles.

## Search and Discovery

### The `/agents` Command

The primary discovery interface is the `/agents` slash command, which queries the registry and returns matching results. Operators can search by any combination of fields:

```
/agents domain:security level:L3
/agents capability:formal-verification
/agents name:archer
/agents tool:WebFetch domain:intelligence
```

The `/agents` command returns a formatted table showing agent ID, level, domain, and a brief description for each match. For detailed information about a specific agent, operators use the agent's documentation file directly.

### Browsing by Domain

The `/agents-browse` variant provides an interactive, domain-organized view of the registry. It presents the 14 domains as top-level categories, with agents grouped by hierarchy level within each domain. This is useful for exploration when the operator knows which domain they need but not which specific agent.

### Programmatic Access

At the application level, the `PrismaticAgents` module exposes functions for registry queries:

```elixir
# Find all security domain agents
{:ok, agents} = PrismaticAgents.Registry.by_domain(:security)

# Find agents by capability
{:ok, agents} = PrismaticAgents.Registry.by_capability("formal-verification")

# Get a specific agent's full metadata
{:ok, metadata} = PrismaticAgents.Registry.get("archer-supreme")

# List all L1 agents
{:ok, supremes} = PrismaticAgents.Registry.by_level(:L1)
```

## Auto-Indexing Pipeline

### How `.aiad/bin/aiad index` Works

The auto-indexing pipeline is a shell script that performs four phases:

**Phase 1 -- Discovery**. The script recursively scans `.aiad/agents/` for `*.agent.md` files and `.aiad/commands/` for `*.cmd.md` files. It builds a manifest of all discovered files with their modification timestamps.

**Phase 2 -- Parsing**. For each discovered file, the script extracts the `agent-spec` or `command-spec` YAML block (delimited by triple-backtick code fences with the `agent-spec yaml` or `command-spec yaml` language tag). The YAML is parsed and validated against the AIAD schema.

**Phase 3 -- Validation**. Each parsed specification is checked for:

- Required fields present (id, version, enforcement block)
- Valid hierarchy level (L1-L4)
- Valid authority declaration
- Enforcement block includes `doctrine: "no-mercy-no-doubts"` with version `2.0.0`
- All referenced agent IDs in `coordinates_with` resolve to existing agents
- All declared tools are in the platform's tool vocabulary

**Phase 4 -- Generation**. The validated specifications are aggregated into the registry documents. Statistics are recalculated (total agents, total commands, domain breakdowns), navigation links are updated, and the output is written to `.claude/AGENT_REGISTRY.md` and `.claude/COMMAND_REGISTRY.md`.

### Companion Tools

The `.aiad/bin/` directory contains additional utilities:

| Tool | Purpose |
|------|---------|
| `aiad` | Main CLI -- `index`, `validate`, `search`, `status` subcommands |
| `aiad-doctor` | Diagnostic tool that checks registry health and reports inconsistencies |
| `aiad-turbo` | Fast-path indexer for incremental updates (only processes changed files) |
| `aiad-watch` | Filesystem watcher that re-indexes automatically when `.agent.md` or `.cmd.md` files change |

## Integration with Claude Code

### Skill Discovery at Runtime

When Claude Code starts a session against the Prismatic Platform, it loads the registry as part of its context. The `CLAUDE.md` project instructions reference the registry and provide shorthand commands for common queries. The orchestration layer -- triggered by the `/orchestrate` command -- uses the registry to select the optimal agent or agent team for a given task.

The selection algorithm considers:

1. **Task domain**: Map the user's request to one or more domains.
2. **Required authority**: Determine the minimum authority level needed.
3. **Tool requirements**: Filter to agents that declare the necessary tools.
4. **Coordination graph**: Prefer agents that coordinate with already-active agents.
5. **Fitness score**: Among qualifying agents, prefer those with higher evolutionary fitness.

### The Unified Orchestrator

The `/orchestrate` command represents the registry's highest-level consumer. When invoked, it:

1. Analyzes the user's request to determine task type, complexity, and domain.
2. Queries the registry for candidate agents matching the requirements.
3. Ranks candidates by fitness, authority, and coordination efficiency.
4. Deploys the selected agent (or agent team for complex tasks).
5. Monitors execution and can substitute agents if the initial selection underperforms.

This closed loop -- from user intent, through registry query, to agent deployment -- is what makes the platform's 434 agents usable without requiring operators to memorize the catalog.

## Registry Maintenance

### Quality Enforcement

The registry participates in the platform's quality gate pipeline. Every commit that modifies a `.agent.md` or `.cmd.md` file triggers:

1. **Schema validation**: The AIAD schema is checked for structural correctness.
2. **Enforcement block verification**: The `no-mercy-no-doubts` doctrine block must be present with version `2.0.0`.
3. **Cross-reference integrity**: All agent ID references must resolve.
4. **Registry synchronization**: The indexer runs and verifies the registry documents are up to date.

If any check fails, the pre-commit hook blocks the commit. There are no bypass flags -- `--no-verify` is forbidden platform-wide.

### Version Management

Agent and command specifications follow semantic versioning. The registry tracks the version of each component and flags breaking changes (major version bumps) for review. Version history is preserved in git, enabling temporal queries ("which agents existed at version X of the platform").

### Drift Detection

The `registry-syncer` agent continuously monitors for drift between the filesystem state (`.agent.md` files) and the registry documents. Drift occurs when a file is added, modified, or deleted without re-running the indexer. The syncer detects these inconsistencies and either triggers an automatic re-index or flags the drift for human review, depending on the severity.

### Adding New Components

To add a new agent to the registry:

1. Create a new file at `.aiad/agents/{agent-id}.agent.md`.
2. Include the `agent-spec` YAML block with all required fields.
3. Include the mandatory enforcement block.
4. Run `.aiad/bin/aiad index` to regenerate the registry.
5. Verify with `.aiad/bin/aiad-doctor` that no validation errors exist.
6. Commit the agent file and the updated registry documents together.

The same process applies for commands, substituting `.aiad/commands/` and `command-spec`.

## Conclusion

The Prismatic Platform Registry transforms a large population of autonomous agents and commands from an opaque collection into a structured, searchable, quality-enforced catalog. By grounding every component in the AIAD standard's machine-readable specifications, the registry enables automated discovery, runtime skill selection, and continuous quality enforcement. The auto-indexing pipeline keeps the registry synchronized with the filesystem, the quality gate integration prevents invalid components from entering the catalog, and the query interfaces make the full breadth of platform capabilities accessible to both human operators and orchestration systems.

As the platform continues to evolve -- with new agents added through genetic evolution, mycelial propagation, and manual development -- the registry scales with it. Every new component that meets the AIAD specification and passes the quality gates automatically becomes discoverable, deployable, and maintainable through the same unified infrastructure.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
