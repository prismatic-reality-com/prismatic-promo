+++
title = "Tool"
weight = 50
[extra]
description = "Self-registering OSINT intelligence adapter or MCP tool that automatically exposes capabilities through UI and API"
category = "osint"
related_terms = ["osint", "adapter", "tool-registry", "mcp", "provider"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["tool", "OSINT tool", "adapter", "MCP tool", "self-registering", "glossary", "Prismatic Platform"]
tags = ["glossary", "osint"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Tool - Prismatic Platform"
+++

## Definition & Overview

In the Prismatic Platform, a tool is a self-registering intelligence adapter that encapsulates access to an external data source, API, or analysis capability. Tools are the atomic building blocks of the OSINT (Open Source Intelligence) subsystem, with 127 tools currently registered across seven categories: Czech (34), Global (85), Sanctions (3), EU (1), UK (1), US (1), and Universal (2). Each tool automatically generates its own UI forms, API endpoints, and documentation through the platform's metaprogramming infrastructure.

The tool concept extends beyond OSINT to encompass MCP (Model Context Protocol) tools that provide capabilities to AI agents. MCP tools follow a similar self-registering pattern but are oriented toward augmenting LLM capabilities rather than performing intelligence gathering. The platform hosts 14+ MCP servers exposing tools for filesystem operations, GitHub interaction, database queries, and memory management.

What makes the Prismatic Platform's tool architecture revolutionary is the zero-configuration approach. A developer creates a new tool module, defines its configuration via the `register_tool/1` macro, and the platform automatically handles UI generation, API exposure, execution orchestration, progress streaming, and run history tracking. No manual wiring, no route registration, no controller code.

## Technical Deep Dive

The self-registering tool pattern leverages Elixir's metaprogramming capabilities, specifically `@after_compile` callbacks and BEAM chunk introspection:

```elixir
defmodule PrismaticOsintCore.Tool do
  @moduledoc """
  Behaviour and macro for self-registering OSINT tools.
  `use PrismaticOsintCore.Tool` injects registration
  infrastructure into the adopting module.
  """

  @callback run(params :: map()) :: {:ok, map()} | {:error, term()}
  @callback search(query :: String.t(), opts :: keyword()) :: {:ok, list()} | {:error, term()}

  defmacro __using__(_opts) do
    quote do
      @behaviour PrismaticOsintCore.Tool

      import PrismaticOsintCore.Tool, only: [register_tool: 1]

      @after_compile __MODULE__

      def __after_compile__(env, _bytecode) do
        if function_exported?(env.module, :__tool_config__, 0) do
          config = env.module.__tool_config__()
          PrismaticOsintCore.ToolRegistry.register(config)
        end
      end
    end
  end

  defmacro register_tool(config) do
    quote do
      def __tool_config__ do
        unquote(config)
        |> Map.put(:module, __MODULE__)
        |> Map.put(:registered_at, DateTime.utc_now())
      end
    end
  end
end
```

The `ToolRegistry` is an ETS-backed GenServer that provides sub-millisecond lookups by slug, category, or capability:

```elixir
defmodule PrismaticOsintCore.ToolRegistry do
  @moduledoc """
  ETS-backed registry for all self-registered OSINT tools.
  Provides O(1) lookups and category-based filtering.
  """

  use GenServer

  @table :osint_tool_registry

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    table = :ets.new(@table, [:set, :named_table, :public, read_concurrency: true])
    {:ok, %{table: table}}
  end

  @spec register(map()) :: :ok
  def register(%{slug: slug} = config) do
    :ets.insert(@table, {slug, config})
    :ok
  end

  @spec get_tool(String.t()) :: {:ok, map()} | {:error, :not_found}
  def get_tool(slug) do
    case :ets.lookup(@table, slug) do
      [{^slug, config}] -> {:ok, config}
      [] -> {:error, :not_found}
    end
  end

  @spec list_by_category(atom()) :: [map()]
  def list_by_category(category) do
    :ets.foldl(fn {_slug, config}, acc ->
      if config.category == category, do: [config | acc], else: acc
    end, [], @table)
  end

  @spec count :: non_neg_integer()
  def count, do: :ets.info(@table, :size)
end
```

Each tool declares its input fields, authentication requirements, API style, and category in the `register_tool/1` call. The LiveView toolbox reads these declarations to dynamically generate appropriate form inputs.

## Architecture & Implementation

The tool architecture follows a layered design where each layer adds capabilities without requiring changes to individual tool modules:

**Registration Layer**: At compile time, `@after_compile` hooks extract tool configurations from BEAM chunks and insert them into the ETS registry. This happens automatically for any module that `use`s the Tool behaviour, requiring zero manual intervention.

**UI Generation Layer**: The `ToolboxLive` LiveView reads tool configurations from the registry and generates forms dynamically based on `input_fields`. Text inputs, select dropdowns, checkboxes, and textarea fields are all supported through a declarative configuration.

**Execution Layer**: When a user submits a tool form, the execution layer resolves the tool module from the registry, validates inputs against the declared schema, and dispatches the call asynchronously. Progress updates stream back to the UI via Phoenix PubSub.

**API Exposure Layer**: The PrismaticAPI gateway automatically discovers all registered tools and exposes them as REST endpoints at `/api/v1/osint/{slug}`. The OpenApiSpex documentation is generated from the tool's type specifications and input field declarations.

**History Layer**: Every tool execution is recorded in PostgreSQL with full input/output tracking, enabling audit trails and result caching.

## Usage in Prismatic Platform

Creating a new OSINT tool requires minimal boilerplate. The self-registering pattern means the developer focuses solely on the intelligence-gathering logic:

```elixir
defmodule PrismaticOsintCore.Adapters.Czech.AresAdapter do
  @moduledoc """
  ARES (Administrative Register of Economic Subjects)
  adapter for Czech company lookups.
  """

  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "ares-lookup",
    name: "ARES Company Lookup",
    description: "Search Czech ARES registry for company information",
    category: :czech,
    api_style: :source,
    input_fields: [
      %{name: :ico, type: :text, label: "ICO (Company ID)", required: true},
      %{name: :include_financials, type: :checkbox, label: "Include Financials", required: false}
    ],
    requires_auth: false,
    rate_limit: %{requests_per_minute: 60}
  })

  @impl true
  def search(ico, opts \\ []) do
    include_financials = Keyword.get(opts, :include_financials, false)
    url = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/#{ico}"

    case Tesla.get(url) do
      {:ok, %{status: 200, body: body}} ->
        result = parse_ares_response(body, include_financials)
        {:ok, result}

      {:ok, %{status: 404}} ->
        {:error, :not_found}

      {:error, reason} ->
        {:error, {:api_error, reason}}
    end
  end

  defp parse_ares_response(body, _include_financials) do
    # Real implementation parses ARES XML/JSON response
    Jason.decode!(body)
  end
end
```

This single module definition automatically creates a UI page at `/osint/toolbox/czech/ares-lookup`, an API endpoint at `/api/v1/osint/ares-lookup`, registry entry for programmatic access, and execution history tracking in PostgreSQL.

## Cross-References

- [OSINT](/glossary/osint/) - Open Source Intelligence methodology
- [Adapter](/glossary/adapter/) - Interface implementation pattern
- [Topic Registry](/glossary/topic-registry/) - Academy's analogous self-registering system
- [MCP](/glossary/mcp/) - Model Context Protocol
- **Provider** - External data source interface

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
