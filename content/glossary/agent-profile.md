+++
title = "Agent Profile"
weight = 50
[extra]
description = "A structured metadata document defining an AIAD agent's identity, capabilities, authority level, behavioral constraints, and operational parameters within the Prismatic Platform"
category = "platform"
related_terms = ["aiad-agent", "agent", "agent-orchestration", "command-registry", "doctrine", "auto-discovery", "configuration"]
tags = ["glossary", "agent-profile", "aiad", "agent-metadata", "authority-level", "platform", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
difficulty = "intermediate"
quality_score = 86
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Agent profiles are the declarative identity documents that define what each of the 530+ AIAD agents can do, how they behave, and what authority they hold within the platform hierarchy"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["agent profile", "AIAD agent", "agent metadata", "authority level", "agent manifest", "agent capabilities", "agent configuration", "agent registry", "behavioral constraints"]
image = "/images/sections/glossary.png"
image_alt = "Agent Profile - Prismatic Platform"
word_count = 1000
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

An agent profile is a structured metadata document that serves as the authoritative declaration of an AIAD agent's identity within the Prismatic Platform. It specifies the agent's name, purpose, authority level, behavioral constraints, input/output specifications, dependencies, and operational parameters. Agent profiles follow the AIAD standard format (`.agent.md` files) and are indexed by the AIAD toolchain for discovery, validation, and runtime configuration.

Each of the 530+ agents in the Prismatic Platform has a corresponding profile that acts as both documentation and machine-readable configuration, enabling automatic registration, capability discovery, and authority-level enforcement.

## Technical Deep Dive

### Profile Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique agent identifier (kebab-case) |
| `title` | string | Yes | Human-readable display name |
| `level` | enum | Yes | Authority level (L0-L4) |
| `domain` | string | Yes | Functional domain (security, quality, osint, etc.) |
| `capabilities` | list | Yes | What the agent can do |
| `constraints` | list | Yes | What the agent cannot do |
| `inputs` | list | Yes | Required input parameters |
| `outputs` | list | Yes | Produced output formats |
| `dependencies` | list | No | Other agents this agent requires |
| `enforcement` | map | Yes | Doctrine compliance declaration |

### Authority Level Hierarchy

```
L4: Supreme (Cosmic Clearance)     -- Platform-wide authority
L3: Strategic (Commander)          -- Domain-wide orchestration
L2: Tactical (Specialist)         -- Task-specific execution
L1: Operational (Worker)          -- Single-operation focus
L0: Informational (Observer)      -- Read-only monitoring
```

## Architecture and Implementation

### Profile Loader

```elixir
defmodule Prismatic.AIAD.ProfileLoader do
  @moduledoc """
  Loads and validates AIAD agent profiles from .agent.md files.
  Profiles are parsed from YAML frontmatter within markdown documents,
  validated against the AIAD schema, and registered in the agent registry.
  """

  @type profile :: %{
          name: String.t(),
          title: String.t(),
          level: atom(),
          domain: String.t(),
          capabilities: [String.t()],
          constraints: [String.t()],
          enforcement: map()
        }

  @spec load_profile(Path.t()) :: {:ok, profile()} | {:error, term()}
  def load_profile(path) do
    with {:ok, content} <- File.read(path),
         {:ok, frontmatter} <- extract_frontmatter(content),
         {:ok, profile} <- validate_profile(frontmatter) do
      {:ok, profile}
    end
  end

  @spec load_all(Path.t()) :: {:ok, [profile()]}
  def load_all(agents_dir \\ ".aiad/agents/") do
    profiles =
      agents_dir
      |> Path.join("*.agent.md")
      |> Path.wildcard()
      |> Enum.map(&load_profile/1)
      |> Enum.filter(&match?({:ok, _}, &1))
      |> Enum.map(fn {:ok, profile} -> profile end)

    {:ok, profiles}
  end

  @spec validate_profile(map()) :: {:ok, profile()} | {:error, :invalid_profile}
  defp validate_profile(raw) do
    required_fields = [:name, :title, :level, :domain, :capabilities, :constraints]

    if Enum.all?(required_fields, &Map.has_key?(raw, &1)) do
      {:ok, Map.take(raw, required_fields ++ [:enforcement, :dependencies, :inputs, :outputs])}
    else
      {:error, :invalid_profile}
    end
  end
end
```

## Usage in Prismatic Platform

Agent profiles serve multiple purposes across the platform:

- **Auto-Discovery**: The AIAD indexer scans `.aiad/agents/` to discover all registered agents
- **Registry Population**: Profiles populate the agent registry (530+ entries) for runtime lookup
- **Authority Enforcement**: The authority guard checks profile-declared levels before operation execution
- **Documentation**: Profiles serve as living documentation of each agent's purpose and boundaries
- **Promo Site**: Agent profiles are rendered as dedicated pages on the promo site (427 agent pages)
- **Command Routing**: The command registry maps commands to agents via profile declarations

### Profile Example (AIAD Format)

```yaml
---
agent-spec: "1.0.0"
name: "osint-coordinator"
title: "OSINT Intelligence Coordinator"
level: "L3"
domain: "osint"
capabilities:
  - "Orchestrate multi-source OSINT gathering"
  - "Correlate intelligence from 127 adapters"
  - "Produce structured intelligence reports"
constraints:
  - "No direct network access (delegates to adapters)"
  - "Cannot modify source configurations"
  - "Must verify source plurality (NABLA axiom)"
enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory
---
```

## Code Examples

### Agent Profile Registry

```elixir
defmodule Prismatic.AIAD.AgentRegistry do
  @moduledoc """
  ETS-backed registry of all AIAD agent profiles.
  Provides sub-millisecond lookup by name, domain, or authority level.
  """

  use GenServer

  @table :aiad_agent_registry

  @spec get_agent(String.t()) :: {:ok, map()} | {:error, :not_found}
  def get_agent(name) do
    case :ets.lookup(@table, name) do
      [{^name, profile}] -> {:ok, profile}
      [] -> {:error, :not_found}
    end
  end

  @spec list_by_domain(String.t()) :: [map()]
  def list_by_domain(domain) do
    :ets.match_object(@table, {:_, %{domain: domain}})
    |> Enum.map(fn {_name, profile} -> profile end)
  end

  @spec list_by_level(atom()) :: [map()]
  def list_by_level(level) do
    :ets.match_object(@table, {:_, %{level: level}})
    |> Enum.map(fn {_name, profile} -> profile end)
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(@table, [:set, :named_table, :protected, read_concurrency: true])
    {:ok, profiles} = Prismatic.AIAD.ProfileLoader.load_all()

    Enum.each(profiles, fn profile ->
      :ets.insert(table, {profile.name, profile})
    end)

    {:ok, %{table: table, count: length(profiles)}}
  end
end
```

## Best Practices

1. **One profile per agent**: Every agent must have exactly one profile document. No orphan agents, no undocumented agents.

2. **Declare constraints explicitly**: Constraints are as important as capabilities. A profile without constraints is incomplete.

3. **Enforce doctrine compliance**: Every profile must include the enforcement block declaring NO MERCY, NO DOUBTS compliance.

4. **Keep profiles version-controlled**: Profile changes are code changes. They go through the same review and CI/CD process.

5. **Validate at index time**: The AIAD indexer validates all profiles against the schema. Invalid profiles block the index build.

6. **Use authority levels correctly**: Do not over-grant authority. Most specialist agents should be L1-L2. Only orchestrators and commanders warrant L3-L4.

## Related Terms

- [AIAD Agent](/glossary/aiad-agent/) -- the runtime entity described by the profile
- **Command Registry** -- maps commands to agents via profiles
- [Auto-Discovery](/glossary/auto-discovery/) -- mechanism for finding and loading profiles
- **Configuration** -- runtime parameters complementing profile declarations
- **Collaboration** -- multi-agent interaction patterns defined in profiles

## See Also

- [AIAD Standard](/glossary/aiad/) -- the framework governing agent profile format
- [Agent Registry](.claude/AGENT_REGISTRY.md) -- complete listing of all 530+ agents
- [Agent Pages](/agents/) -- promo site agent documentation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
