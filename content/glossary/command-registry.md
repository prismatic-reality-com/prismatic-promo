+++
title = "Command Registry"
weight = 50
[extra]
description = "The AIAD command catalog that indexes all available platform commands, their signatures, parameters, and execution contexts for agent and human use"
category = "aiad"
related_terms = ["command", "agent-registry", "aiad", "agent-orchestration", "auto-discovery"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["command registry", "AIAD", "command catalog", "platform commands", "agent commands", "glossary", "Prismatic Platform"]
tags = ["glossary", "aiad", "commands"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Command Registry - Prismatic Platform"
+++

## Definition & Overview

A command registry is a centralized catalog that indexes all available commands within a platform, providing metadata about each command's name, signature, parameters, execution context, authority level, and documentation. The registry serves as both a discovery mechanism (finding available commands) and a validation layer (ensuring commands are invoked with correct parameters and sufficient authority).

In distributed and agent-based systems, command registries solve the coordination problem of "who can do what." Without a registry, each agent or user would need to know the full API surface of the platform -- an impossibility as systems grow. The registry provides a single source of truth that can be queried at runtime, enabling dynamic command discovery and invocation.

The Prismatic Platform's AIAD Command Registry indexes 225 commands across all platform domains, from development commands (`/code`, `/test`, `/refactor`) to intelligence commands (`/investigate`, `/ghost-recon`, `/navy-seal`) to evolution commands (`/autoheal.cycle`, `/autoevolve.mega`). Every command is defined in a structured `.cmd.md` file within the `.aiad/commands/` directory, and the registry is automatically rebuilt via `./.aiad/bin/aiad index`. The registry is exposed as both a human-readable document (`.claude/COMMAND_REGISTRY.md`) and machine-readable data for agent consumption.

## Technical Deep Dive

### Command Specification Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Command name (e.g., `/investigate`) |
| `slug` | String | Yes | URL-friendly identifier |
| `category` | Enum | Yes | Domain category (dev, intelligence, evolution, etc.) |
| `authority` | Enum | Yes | Required authority level (universal, agent, supreme, cosmic) |
| `parameters` | List | No | Input parameter definitions |
| `output` | Map | No | Expected output format |
| `agents` | List | No | Agents that can execute this command |
| `examples` | List | No | Usage examples |

### Registry Implementation

```elixir
defmodule PrismaticAIAD.CommandRegistry do
  @moduledoc """
  ETS-backed command registry for the AIAD standard.
  Indexes all .cmd.md files from the .aiad/commands/ directory.
  Provides sub-millisecond lookups by name, category, or authority.
  """

  use GenServer

  @table :aiad_command_registry
  @commands_dir ".aiad/commands"

  @type command :: %{
    name: String.t(),
    slug: String.t(),
    category: atom(),
    authority: atom(),
    parameters: [map()],
    description: String.t(),
    agents: [String.t()],
    source_file: String.t()
  }

  @spec lookup(String.t()) :: {:ok, command()} | {:error, :not_found}
  def lookup(name) do
    case :ets.lookup(@table, name) do
      [{^name, command}] -> {:ok, command}
      [] -> {:error, :not_found}
    end
  end

  @spec list_by_category(atom()) :: [command()]
  def list_by_category(category) do
    :ets.select(@table, [
      {{:_, %{category: :"$1"} = :"$2"}, [{:==, :"$1", category}], [:"$2"]}
    ])
  end

  @spec list_all() :: [command()]
  def list_all do
    :ets.tab2list(@table)
    |> Enum.map(fn {_name, command} -> command end)
  end

  @spec count() :: non_neg_integer()
  def count, do: :ets.info(@table, :size)

  @impl GenServer
  def init(_opts) do
    table = :ets.new(@table, [:set, :named_table, :public, read_concurrency: true])
    commands = index_commands()
    Enum.each(commands, fn cmd -> :ets.insert(table, {cmd.name, cmd}) end)

    :telemetry.execute(
      [:prismatic, :aiad, :commands, :indexed],
      %{count: length(commands)},
      %{}
    )

    {:ok, %{table: table, command_count: length(commands)}}
  end

  defp index_commands do
    Path.wildcard(Path.join(@commands_dir, "*.cmd.md"))
    |> Enum.map(&parse_command_file/1)
    |> Enum.reject(&is_nil/1)
  end

  defp parse_command_file(file_path) do
    case File.read(file_path) do
      {:ok, content} -> extract_command_metadata(content, file_path)
      {:error, _} -> nil
    end
  end

  defp extract_command_metadata(content, file_path) do
    %{
      name: extract_field(content, "name"),
      slug: Path.basename(file_path, ".cmd.md"),
      category: extract_field(content, "category") |> String.to_atom(),
      authority: extract_field(content, "authority") |> String.to_atom(),
      parameters: [],
      description: extract_field(content, "description"),
      agents: [],
      source_file: file_path
    }
  end

  defp extract_field(content, field) do
    case Regex.run(~r/#{field}:\s*(.+)/, content) do
      [_, value] -> String.trim(value)
      nil -> ""
    end
  end
end
```

### Command Categories

| Category | Count | Examples | Authority |
|----------|-------|---------|-----------|
| **Development** | 35 | `/code`, `/test`, `/refactor`, `/optimize` | Universal |
| **Intelligence** | 28 | `/investigate`, `/ghost-recon`, `/delta-force` | Agent |
| **Evolution** | 15 | `/autoheal.cycle`, `/autoevolve.mega` | System |
| **Security** | 22 | `/red-team scenario`, `/blue-team posture` | Supreme |
| **Quality** | 18 | `/quality.gates`, `/quality.forbidden_patterns` | Universal |
| **Crisis** | 8 | `/emergency`, `/archer-supreme` | Cosmic |
| **Perimeter** | 12 | `/perimeter`, `/perimeter/compliance` | Agent |
| **Local AI** | 10 | `/ollama status`, `/ollama optimize` | Universal |
| **Promo** | 6 | `mix promo.enhance`, `mix promo.glossary_data` | Universal |
| **Other** | 60 | Various domain-specific commands | Varies |

## Architecture & Implementation

The Command Registry follows the same self-registering pattern used by the OSINT ToolRegistry, Academy TopicRegistry, and DD SourceRegistry. Command definitions are stored as structured Markdown files (`.cmd.md`) that serve dual purposes: human-readable documentation and machine-parseable specifications. The `aiad index` command scans the `.aiad/commands/` directory, parses each file's frontmatter, and rebuilds the registry.

The registry is materialized in two forms. The human-readable form is `.claude/COMMAND_REGISTRY.md`, which lists all 225 commands with their descriptions, categories, and usage examples. The machine-readable form is an ETS table populated at application boot, enabling sub-millisecond command lookups during agent operations. This dual materialization ensures that both humans (reading documentation) and agents (performing runtime lookups) have efficient access to command metadata.

Authority levels enforce a hierarchy of access. Universal commands can be executed by any agent or user. Agent-level commands require an active AIAD agent context. Supreme commands require elevated authority (typically reserved for orchestrators). Cosmic commands are reserved for emergency and crisis operations with the highest clearance level.

## Usage in Prismatic Platform

The `/orchestrate` command (Supreme authority) queries the Command Registry to determine which specialist commands to delegate to when coordinating complex multi-agent operations. Rather than hardcoding agent-command mappings, the orchestrator dynamically discovers available commands and selects the optimal execution plan based on the current registry state.

The promo site's command section (`sites/promo/content/commands/`) renders all 225 commands as browsable pages with Alpine.js filtering. The data is generated from the Command Registry and exported as `sites/promo/static/js/command-registry-data.js` for client-side search and filtering.

The API gateway (`prismatic_api`) uses the Command Registry as one of its endpoint discovery sources, potentially exposing commands as RESTful endpoints at `/api/v1/:command_slug`. This bridges the command-oriented AIAD interface with standard HTTP API consumption patterns.

## Cross-References

- [Command](@/glossary/command.md) - individual executable instruction
- [Agent Registry](@/glossary/agent-registry.md) - companion registry for AIAD agents
- [AIAD](@/glossary/aiad.md) - the standard defining command specifications
- [Auto-Discovery](@/glossary/auto-discovery.md) - dynamic component detection pattern
- [Agent Orchestration](@/glossary/agent-orchestration.md) - multi-agent command coordination
- **Livebooks**: `livebooks/domains/api_integration/` - command API exploration
- **Academy**: Platform command system architecture

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
