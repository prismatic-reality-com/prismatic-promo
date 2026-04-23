+++
title = "Agent Registry"
weight = 17
[extra]
category = "agents"
description = "Central catalog of all 530+ AIAD agents with capabilities and authority levels"
related_terms = ["aiad", "agent-tier", "archer-supreme", "supreme-commander", "blackboard", "color-teams", "agent", "consciousness-traits", "nabla-infinity", "supervisor", "process-isolation", "epistemic-pipeline", "mix", "autoevolve", "autoheal"]
total_agents = "530+"
static_agents = "500+"
runtime_agents = "~30"
domains = "16"
registry_file = ".claude/AGENT_REGISTRY.md"
index_command = "./.aiad/bin/aiad index"
specification_format = ".agent.md"
specification_directory = ".aiad/agents/"
tier_levels = ["L1 Operational", "L2 Tactical", "L3 Strategic", "L4 Safety-Critical", "L5 Supreme"]
governance_model = "Centralized Catalog with Auto-Indexing"
discovery_patterns = ["Direct Lookup", "Domain Search", "Tier Query", "Capability Match", "Dependency Resolution"]
integration_systems = ["Blackboard", "Epistemic Pipeline", "AutoEvolve", "Supervisor", "Quality Gates", "Color Teams"]
key_agents = ["archer-supreme", "supreme-coordinator", "red-commander", "blue-commander", "purple-coordinator"]
safety_critical_agents = ["gray-escalation-guard", "purple-regression-guard", "black-abstraction-enforcer"]
audit_capabilities = ["Population Audit", "Authority Audit", "Domain Coverage", "Duplicate Detection", "Deprecation Tracking"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1614
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Agent", "Registry", "Central", "AIAD", "glossary", "agents", "Prismatic Platform", "Agent Tier", "Domain"]
tags = ["glossary", "agents", "agent-registry", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Agent Registry - Prismatic Platform"
+++

## Definition

The Agent Registry is the centralized, authoritative catalog that indexes all AIAD-compliant agents within the Prismatic Platform. It records each agent's call sign, authority tier, domain specialization, capabilities, operational status, and inter-agent dependencies. Maintained in `.claude/AGENT_REGISTRY.md` and auto-indexed by the AIAD toolchain via `./.aiad/bin/aiad index`, the registry serves as the single source of truth for agent discovery, governance, and coordination across the entire platform ecosystem.

The registry is not a passive directory. It actively enforces agent governance by preventing duplicate definitions, validating tier assignments against the [Agent Tier](/glossary/agent-tier/) specification, and ensuring that every agent in the platform has a well-defined specification file. When an [agent](/glossary/agent/) is deployed, the runtime validates its identity against the registry. Unregistered agents cannot operate within the platform -- this constraint prevents rogue or unauthorized agents from accessing platform resources.

The design philosophy behind the Agent Registry is discoverability at scale. With 500+ statically defined agents and approximately 30 additional runtime-generated agents (530+ total), the platform requires a reliable mechanism for agents to locate collaborators, for commanders to identify available specialists, and for governance systems to audit the complete agent population. The registry provides this mechanism through structured indexing, domain classification, and tier-based querying.

## Historical Evolution

The Agent Registry evolved through several generations as the platform's agent population grew:

| Generation | Agent Count | Registry Format | Key Innovation |
|------------|-------------|-----------------|----------------|
| Gen 1-3 | < 50 | Manual Markdown | Hand-maintained list |
| Gen 4-7 | 50-150 | Semi-automated | AIAD spec format standardized |
| Gen 8-12 | 150-350 | Auto-indexed | `.aiad/bin/aiad index` toolchain |
| Gen 13-16 | 350-450 | Domain-classified | 14-domain taxonomy, tier governance |
| Gen 17-19 | 450-530+ | Full governance | Safety-critical flags, isolation constraints, audit trail |

Early versions of the registry were simple Markdown tables maintained by hand. As the agent population exceeded 100, manual maintenance became error-prone and inconsistent. The introduction of the AIAD specification format (`.agent.md` files with structured frontmatter) and the auto-indexing toolchain eliminated consistency issues by generating the registry from authoritative source files.

## Registry Structure

Each agent entry in the registry contains a standardized set of fields derived from the agent's `.agent.md` specification file:

| Field | Description | Example |
|-------|-------------|---------|
| **Call Sign** | Unique identifier for the agent | `red-commander` |
| **Authority Tier** | L1-L5 classification per [Agent Tier](/glossary/agent-tier/) | L3 Strategic |
| **Domain** | Primary operational domain from the 16-domain taxonomy | Security |
| **Specialization** | Specific capability or focus area | Adversarial scenario orchestration |
| **Status** | Current operational state (active, standby, deprecated) | Active |
| **Dependencies** | Other agents or systems required for operation | `red-epistemic-attacker`, `red-drift-inducer` |
| **Safety-Critical** | Whether the agent carries safety override authority | No |
| **ISOLATED** | Whether the agent operates under isolation constraints | No |
| **Specification** | Path to the `.agent.md` definition file | `.aiad/agents/red-commander.agent.md` |
| **Version** | Specification version for change tracking | 2.1.0 |

The registry format is designed for both human readability (Markdown table format in `AGENT_REGISTRY.md`) and machine parsing (structured fields extractable by the AIAD toolchain).

```elixir
defmodule PrismaticAgents.Registry.Entry do
  @moduledoc """
  Represents a single agent entry in the Agent Registry.
  Each entry corresponds to an .agent.md specification file.
  """

  @type t :: %__MODULE__{
    call_sign: String.t(),
    tier: :L1 | :L2 | :L3 | :L4 | :L5,
    domain: String.t(),
    specialization: String.t(),
    status: :active | :standby | :deprecated,
    dependencies: [String.t()],
    safety_critical: boolean(),
    isolated: boolean(),
    specification_path: String.t(),
    version: String.t()
  }

  @enforce_keys [:call_sign, :tier, :domain]
  defstruct [
    :call_sign,
    :tier,
    :domain,
    :specialization,
    status: :active,
    dependencies: [],
    safety_critical: false,
    isolated: false,
    specification_path: nil,
    version: "1.0.0"
  ]
end
```

## Auto-Indexing System

The registry is maintained through an automated indexing process that scans the `.aiad/agents/` directory for all `.agent.md` specification files and regenerates the registry from their contents. This auto-indexing ensures that the registry is always consistent with the actual agent definitions -- manual registry edits are overwritten on the next index run.

```bash
# Trigger auto-indexing of all agent specifications
./.aiad/bin/aiad index

# The indexer performs:
# 1. Scans .aiad/agents/ for all .agent.md files
# 2. Parses frontmatter and structured content from each file
# 3. Validates tier assignments and domain classifications
# 4. Detects duplicate call signs or conflicting specifications
# 5. Generates the unified AGENT_REGISTRY.md
# 6. Updates domain-specific sub-indexes
# 7. Emits validation report with warnings and errors
```

The auto-indexing process runs as part of the AIAD maintenance cycle and is triggered automatically when new agents are added or existing agents are modified. The [AutoEvolve](/glossary/autoevolve/) system monitors the registry for consistency and triggers re-indexing when drift is detected.

```elixir
defmodule PrismaticAgents.Registry.Indexer do
  @moduledoc """
  Auto-indexing engine that builds the Agent Registry from
  individual .agent.md specification files.
  """

  @spec index_all(String.t()) :: {:ok, index_result()} | {:error, term()}
  def index_all(agents_dir \\ ".aiad/agents/") do
    with {:ok, spec_files} <- list_specs(agents_dir),
         {:ok, entries} <- parse_all(spec_files),
         :ok <- validate_no_duplicates(entries),
         :ok <- validate_tier_assignments(entries),
         :ok <- validate_dependencies(entries) do
      {:ok, %{
        total: length(entries),
        by_domain: group_by_domain(entries),
        by_tier: group_by_tier(entries),
        warnings: collect_warnings(entries)
      }}
    end
  end

  @spec validate_no_duplicates([Entry.t()]) :: :ok | {:error, {:duplicates, [String.t()]}}
  defp validate_no_duplicates(entries) do
    duplicates =
      entries
      |> Enum.group_by(& &1.call_sign)
      |> Enum.filter(fn {_sign, agents} -> length(agents) > 1 end)
      |> Enum.map(fn {sign, _} -> sign end)

    case duplicates do
      [] -> :ok
      dupes -> {:error, {:duplicates, dupes}}
    end
  end
end
```

## Domain Classification

Agents are classified across 16 operational domains, each representing a distinct functional area of the platform:

| Domain | Agent Count | Description | Key Agents |
|--------|-------------|-------------|------------|
| **Security** | ~40 | [Color Teams](/glossary/color-teams/) and security operations | 20 Color Team agents + security specialists |
| **Quality** | ~45 | Quality enforcement, gates, and monitoring | Quality floor guardian, Credo enforcer |
| **Evolution** | ~35 | [AutoEvolve](/glossary/autoevolve/), [AutoHeal](/glossary/autoheal/), generation management | Evolution scanner, healing coordinator |
| **Intelligence** | ~40 | OSINT, entity resolution, data analysis | Ghost recon, delta force, email OSINT |
| **Architecture** | ~25 | Platform design, patterns, standards | Elixir architect, system designer |
| **Storage** | ~20 | Data persistence, adapters, caching | Storage coordinator, adapter specialists |
| **Web** | ~20 | LiveView, Phoenix, frontend | UI coordinator, dashboard specialists |
| **Testing** | ~30 | Test generation, coverage, validation | Test generator, coverage analyzer |
| **Documentation** | ~25 | Docs, guides, knowledge management | Doc generator, knowledge indexer |
| **Deployment** | ~15 | CI/CD, releases, infrastructure | Deploy coordinator, release manager |
| **Epistemic** | ~30 | [NABLA Infinity](/glossary/nabla-infinity/), [Trinity Gate](/glossary/trinity-gate/), pipeline | Epistemic validator, belief manager |
| **Consciousness** | ~20 | [Consciousness traits](/glossary/consciousness-traits/), self-awareness | Consciousness monitor, trait evaluator |
| **Perimeter** | ~15 | [EASM](/glossary/easm/), attack surface, compliance | Perimeter scanner, compliance assessor |
| **Promo** | ~10 | Content enhancement, site management | Promo content enhancer |
| **API** | ~10 | API gateway, endpoint discovery, OpenAPI | API scanner, spec generator |
| **Ecosystem** | ~15 | OSS packages, developer portal, community | SDK architect, plugin coordinator |

Domain classification is not exclusive -- some agents operate across multiple domains and are listed under their primary domain with cross-references to secondary domains. The registry supports domain-based querying, enabling L3+ agents to locate available specialists within specific operational areas.

## Agent Tier Distribution

The registry tracks the distribution of agents across authority tiers, ensuring proportional governance:

| Tier | Count | Percentage | Role | Example Agents |
|------|-------|------------|------|----------------|
| **L1 Operational** | ~200 | 38% | Task execution, single-domain specialists | File scanner, test runner, doc formatter |
| **L2 Tactical** | ~180 | 34% | Multi-step workflows, domain-scoped coordination | Red epistemic attacker, blue drift detector |
| **L3 Strategic** | ~100 | 19% | Cross-domain coordination, team command | Red commander, blue commander, purple coordinator |
| **L4 Safety-Critical** | ~40 | 7% | Safety overrides, emergency intervention | Gray escalation guard, purple regression guard |
| **L5 Supreme** | ~10 | 2% | Platform-wide authority, strategic decisions | [Archer Supreme](/glossary/archer-supreme/), [Supreme Commander](/glossary/supreme-commander/) |

This distribution follows a pyramid structure where the majority of agents operate at L1-L2 (execution), a smaller number coordinate at L3 (strategy), and a handful hold safety-critical (L4) or supreme (L5) authority. This mirrors military command structures and ensures that authority is concentrated at the top while operational capacity is distributed at the base.

## Agent Discovery

The registry enables several discovery patterns that are essential for platform coordination:

**Direct Lookup**: Given a call sign, retrieve the agent's full specification including tier, domain, capabilities, and current status. Used by any agent that knows which specific collaborator it needs.

**Domain Search**: Given a domain, retrieve all agents operating within that domain. Used by L3 commanders to identify available specialists for tactical assignments.

**Tier Query**: Given a tier level, retrieve all agents at that authority level. Used by L4+ agents to identify peers for cross-domain coordination.

**Capability Match**: Given a required capability, find agents that provide it. Used by the [Blackboard](/glossary/blackboard/) system to route knowledge requests to appropriate specialists.

**Dependency Resolution**: Given an agent, identify all agents it depends on and verify they are available. Used during deployment to ensure operational prerequisites are met.

```elixir
defmodule PrismaticAgents.Registry do
  @moduledoc """
  Agent Registry providing discovery, lookup, and governance
  for all 530+ AIAD-compliant agents in the platform.
  """

  @spec lookup(String.t()) :: {:ok, Entry.t()} | {:error, :not_found}
  def lookup(call_sign) do
    case :ets.lookup(@table, call_sign) do
      [{^call_sign, entry}] -> {:ok, entry}
      [] -> {:error, :not_found}
    end
  end

  @spec by_domain(String.t()) :: {:ok, [Entry.t()]}
  def by_domain(domain) do
    entries =
      :ets.tab2list(@table)
      |> Enum.filter(fn {_sign, entry} -> entry.domain == domain end)
      |> Enum.map(fn {_sign, entry} -> entry end)

    {:ok, entries}
  end

  @spec by_tier(:L1 | :L2 | :L3 | :L4 | :L5) :: {:ok, [Entry.t()]}
  def by_tier(tier) do
    entries =
      :ets.tab2list(@table)
      |> Enum.filter(fn {_sign, entry} -> entry.tier == tier end)
      |> Enum.map(fn {_sign, entry} -> entry end)

    {:ok, entries}
  end

  @spec by_capability(String.t()) :: {:ok, [Entry.t()]}
  def by_capability(capability) do
    entries =
      :ets.tab2list(@table)
      |> Enum.filter(fn {_sign, entry} -> capability in entry.capabilities end)
      |> Enum.map(fn {_sign, entry} -> entry end)

    {:ok, entries}
  end

  @spec resolve_dependencies(String.t()) :: {:ok, [Entry.t()]} | {:error, term()}
  def resolve_dependencies(call_sign) do
    with {:ok, agent} <- lookup(call_sign) do
      deps = Enum.map(agent.dependencies, fn dep_sign ->
        case lookup(dep_sign) do
          {:ok, dep} -> {:ok, dep}
          {:error, _} -> {:error, {:missing_dependency, dep_sign}}
        end
      end)

      case Enum.find(deps, &match?({:error, _}, &1)) do
        nil -> {:ok, Enum.map(deps, fn {:ok, d} -> d end)}
        error -> error
      end
    end
  end
end
```

## Runtime Extension

Beyond the 500+ statically defined agents, the platform generates approximately 30 additional agents at runtime. These runtime agents are created dynamically in response to platform conditions -- for example, when a new umbrella application is added and requires a dedicated quality monitoring agent, or when a specific investigation requires a temporary specialist agent.

Runtime agents are registered in the same registry as static agents, with an additional `runtime: true` flag distinguishing them. They follow the same [Agent Tier](/glossary/agent-tier/) classification, domain assignment, and capability specification as static agents. The key difference is lifecycle: static agents persist across platform restarts, while runtime agents are recreated as needed by their parent [supervisors](/glossary/supervisor/).

```elixir
defmodule PrismaticAgents.Registry.RuntimeExtension do
  @moduledoc "Manages runtime-generated agent entries in the registry."

  @spec register_runtime_agent(Entry.t()) :: {:ok, Entry.t()} | {:error, term()}
  def register_runtime_agent(%Entry{} = entry) do
    runtime_entry = %{entry | runtime: true, registered_at: DateTime.utc_now()}

    with :ok <- validate_call_sign_available(runtime_entry.call_sign),
         :ok <- validate_tier_within_bounds(runtime_entry.tier) do
      :ets.insert(@table, {runtime_entry.call_sign, runtime_entry})
      {:ok, runtime_entry}
    end
  end

  @spec deregister_runtime_agent(String.t()) :: :ok | {:error, :not_found}
  def deregister_runtime_agent(call_sign) do
    case :ets.lookup(@table, call_sign) do
      [{^call_sign, %{runtime: true}}] ->
        :ets.delete(@table, call_sign)
        :ok
      [{^call_sign, %{runtime: false}}] ->
        {:error, :cannot_deregister_static_agent}
      [] ->
        {:error, :not_found}
    end
  end
end
```

## Governance and Audit

The registry serves as the foundation for agent governance:

- **Population Audit**: The complete list of all agents is available for review at any time, enabling governance oversight
- **Authority Audit**: Tier assignments can be reviewed to ensure proportional authority distribution
- **Domain Coverage**: Gaps in domain coverage can be identified by comparing agent domain assignments against platform needs
- **Duplicate Detection**: The auto-indexing process detects and rejects duplicate call signs, preventing agent identity conflicts
- **Deprecation Tracking**: Agents marked as deprecated remain in the registry for audit purposes but are excluded from active discovery
- **Change History**: Registry regeneration timestamps and diff tracking enable audit trails for governance changes

The registry also integrates with the platform's [structured logging](/glossary/structured-logging/) and [observability](/glossary/observability/) systems, providing correlation between agent identities and their operational telemetry.

## Color Team Registry Integration

The [Color Teams](/glossary/color-teams/) system relies heavily on the registry for team composition validation. Each of the six color teams (Gray, Red, Blue, Purple, White, Black) has a defined agent roster that must be validated against the registry:

| Team | Required Agents | Registry Validation |
|------|----------------|---------------------|
| **Gray** | 3 agents (commander, edge-finder, escalation-guard) | Tier and safety-critical flags verified |
| **Red** | 4 agents (commander, epistemic-attacker, drift-inducer, scenario-generator) | Isolation constraints checked |
| **Blue** | 4 agents (commander, auth-sentinel, drift-detector, signal-aggregator) | Domain assignment verified |
| **Purple** | 4 agents (coordinator, mapper, closure-analyst, regression-guard) | Cross-team dependency resolution |
| **White** | 3 agents (verifier-commander, contract-validator, invariant-prover) | Formal verification capabilities checked |
| **Black** | 2 agents (theorist-commander, abstraction-enforcer) | MAXIMUM isolation enforced |

## Integration with Platform Systems

The Agent Registry integrates with several core platform systems:

| System | Integration | Purpose |
|--------|-------------|---------|
| **[Blackboard](/glossary/blackboard/)** | Agent capability lookup | Routes knowledge requests to appropriate specialists |
| **[Epistemic Pipeline](/glossary/epistemic-pipeline/)** | Tier-based access control | Ensures agents access only tier-appropriate pipeline levels |
| **[AutoEvolve](/glossary/autoevolve/)** | Registry consistency monitoring | Detects and corrects registry drift |
| **[Supervisor](/glossary/supervisor/)** | Process-agent mapping | Links OTP processes to their agent identities |
| **Quality Gates** | Agent compliance checking | Validates that all agents meet quality standards |
| **[Color Teams](/glossary/color-teams/)** | Team composition validation | Ensures team agent composition matches specifications |
| **SEADF** | Subsystem coordination | Routes tasks to appropriate agent domains |

## Related Terms

- [AIAD](/glossary/aiad/) -- The agent definition standard governing all registered agents
- [Agent](/glossary/agent/) -- Core concept of autonomous operational units tracked by the registry
- [Agent Tier](/glossary/agent-tier/) -- L1-L5 authority classification indexed in the registry
- [Archer Supreme](/glossary/archer-supreme/) -- L5 Supreme authority agent registered in the catalog
- [Supreme Commander](/glossary/supreme-commander/) -- L5 agent using the registry for cross-domain coordination
- [Color Teams](/glossary/color-teams/) -- 20 security agents registered across 6 teams
- [Blackboard](/glossary/blackboard/) -- Shared knowledge store using registry for agent discovery
- [Consciousness Traits](/glossary/consciousness-traits/) -- Traits tracked per agent in the registry
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework governing registered agent behavior
- [Supervisor](/glossary/supervisor/) -- OTP supervision managing registered agent processes
- [AutoEvolve](/glossary/autoevolve/) -- Evolution system monitoring registry consistency
- [AutoHeal](/glossary/autoheal/) -- Self-repair system using registry for agent health checks

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Agents](/agents/) -- Full agent catalog
- [Capabilities](/capabilities/) -- Platform capability catalog
- [Technologies](/technologies/) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
