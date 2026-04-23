+++
title = "Model Context Protocol (MCP)"
weight = 50
[extra]
description = "Open standard for connecting AI models to external tools, data sources, and services, enabling structured tool use and context sharing."
category = "ai-ml"
related_terms = ["agent", "tool-use", "llm", "ai-integration"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["MCP", "Model Context Protocol", "AI tools", "LLM integration", "agent architecture", "glossary", "Prismatic Platform"]
tags = ["glossary", "ai-ml"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Model Context Protocol - Prismatic Platform"
+++

## Definition & Overview

The Model Context Protocol (MCP) is an open standard for connecting AI language models to external tools, data sources, and services. It provides a structured communication layer that enables AI models to discover available tools, understand their capabilities through schema definitions, invoke them with typed parameters, and process their responses. MCP standardizes the interface between AI agents and their operational environment, replacing ad-hoc tool integration with a consistent, discoverable protocol.

MCP addresses a fundamental challenge in AI agent architecture: how to give language models reliable access to external capabilities without custom integration code for every tool. Before MCP, each AI platform implemented its own tool-calling convention, making tools non-portable across platforms and requiring separate implementations for each model provider. MCP provides a universal protocol that works across providers, enabling a tools-once-use-everywhere development model.

The Prismatic Platform extensively leverages MCP for its AI agent infrastructure. With 14+ MCP servers configured, the platform provides Claude and other AI models with structured access to filesystem operations, GitHub integration, PostgreSQL queries, memory systems, and the platform's own 27-tool prismatic-mcp server. This MCP integration is what enables AI agents to operate effectively across the platform's 115 umbrella applications.

## Technical Deep Dive

MCP defines three core primitives: tools, resources, and prompts. Tools are executable functions with JSON Schema-defined inputs and outputs. Resources provide read access to data (files, database records, API responses). Prompts are templated instructions that guide model behavior for specific tasks. Each MCP server exposes a manifest describing its available primitives, which AI models use for discovery and capability planning.

The protocol uses JSON-RPC 2.0 over stdio or HTTP transports. The stdio transport is used for local MCP servers that run as child processes of the AI client. The HTTP transport enables remote MCP servers that can be shared across multiple clients. The Prismatic Platform uses both: local servers for filesystem and development tools, and the HTTP transport for the prismatic-mcp server that exposes platform-specific capabilities.

```elixir
defmodule PrismaticMcp.Server do
  @moduledoc """
  MCP server implementation exposing Prismatic Platform capabilities
  to AI agents via the Model Context Protocol.
  """

  @behaviour PrismaticMcp.ServerBehaviour

  @tools [
    %{
      name: "osint_search",
      description: "Search OSINT tools and execute intelligence queries",
      input_schema: %{
        type: "object",
        properties: %{
          tool_slug: %{type: "string", description: "OSINT tool identifier"},
          query: %{type: "string", description: "Search query"},
          options: %{type: "object", description: "Tool-specific options"}
        },
        required: ["tool_slug", "query"]
      }
    },
    %{
      name: "dd_entity_lookup",
      description: "Look up entities in the Due Diligence pipeline",
      input_schema: %{
        type: "object",
        properties: %{
          entity_type: %{type: "string", enum: ["person", "company", "organization"]},
          name: %{type: "string", description: "Entity name to search"}
        },
        required: ["name"]
      }
    },
    %{
      name: "quality_check",
      description: "Run quality gates on specified application",
      input_schema: %{
        type: "object",
        properties: %{
          app: %{type: "string", description: "Umbrella app name"},
          checks: %{type: "array", items: %{type: "string"}}
        },
        required: ["app"]
      }
    }
  ]

  @impl true
  def list_tools, do: {:ok, @tools}

  @impl true
  def call_tool("osint_search", %{"tool_slug" => slug, "query" => query} = params) do
    opts = Map.get(params, "options", %{})

    case PrismaticOsintCore.ToolRegistry.get(slug) do
      {:ok, tool} ->
        result = PrismaticOsintCore.execute(tool, %{query: query} |> Map.merge(opts))
        format_tool_response(result)

      {:error, :not_found} ->
        {:error, "Unknown OSINT tool: #{slug}"}
    end
  end

  @impl true
  def call_tool("dd_entity_lookup", %{"name" => name} = params) do
    entity_type = Map.get(params, "entity_type")
    results = PrismaticDd.search_entities(name, entity_type: entity_type)
    {:ok, %{entities: results, count: length(results)}}
  end

  defp format_tool_response({:ok, data}), do: {:ok, data}
  defp format_tool_response({:error, reason}), do: {:error, inspect(reason)}
end
```

Security is paramount in MCP implementations. Every tool call passes through authentication and authorization checks. The Prismatic Platform's MCP server enforces RBAC (Role-Based Access Control) on tool invocations, ensuring AI agents can only access capabilities appropriate to their authorization level. Sensitive operations require explicit user confirmation through a human-in-the-loop mechanism.

## Architecture & Implementation

The platform's MCP architecture follows a hub-and-spoke model. The central prismatic-mcp server acts as a gateway to platform capabilities, while specialized MCP servers (filesystem, GitHub, PostgreSQL, memory) provide domain-specific tools. This separation allows independent scaling and security boundary enforcement for different tool categories.

Tool discovery is automatic. When an AI agent session starts, it queries all configured MCP servers for their manifests, building a complete picture of available capabilities. The platform's auto-loading mechanism (configured in `.claude/settings.json`) ensures all 14+ MCP servers are available without manual configuration.

The prismatic-mcp server exposes 27 tools that span the platform's major subsystems: OSINT tool execution, DD entity management, quality gate checks, agent coordination, academy topic queries, and security assessment triggers. Each tool is implemented as a thin dispatch layer that delegates to the appropriate umbrella app's public API, maintaining the platform's existing authorization and audit logging.

## Usage in Prismatic Platform

MCP server configuration and tool registration:

```elixir
defmodule PrismaticMcp.Application do
  @moduledoc """
  MCP server application with auto-discovery of platform capabilities.
  """

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {PrismaticMcp.ToolRegistry, []},
      {PrismaticMcp.TransportSupervisor, transport_config()},
      {PrismaticMcp.AuthorizationServer, []}
    ]

    opts = [strategy: :one_for_one, name: PrismaticMcp.Supervisor]
    Supervisor.start_link(children, opts)
  end

  defp transport_config do
    %{
      stdio: %{enabled: true},
      http: %{
        enabled: true,
        port: Application.get_env(:prismatic_mcp, :port, 4005),
        auth: :bearer_token
      }
    }
  end
end

defmodule PrismaticMcp.ToolRegistry do
  @moduledoc """
  Auto-discovers and registers MCP tools from platform modules.
  """

  use GenServer

  @spec init(keyword()) :: {:ok, map()}
  def init(_opts) do
    tools = discover_platform_tools()
    {:ok, %{tools: tools, tool_count: length(tools)}}
  end

  defp discover_platform_tools do
    [
      PrismaticMcp.Tools.Osint,
      PrismaticMcp.Tools.DueDiligence,
      PrismaticMcp.Tools.Quality,
      PrismaticMcp.Tools.Academy,
      PrismaticMcp.Tools.Perimeter,
      PrismaticMcp.Tools.Storage
    ]
    |> Enum.flat_map(& &1.tools())
  end
end
```

The MCP integration enables AI agents to operate as first-class platform citizens, accessing the full breadth of OSINT tools, data pipelines, and quality systems through a standardized, secure, and discoverable protocol.

## Cross-References

- [Agent](@/glossary/agent.md) - AI agents that consume MCP tools
- [LLM](@/glossary/llm.md) - Language models that use MCP for tool access
- [API](@/glossary/api.md) - Complementary access pattern for human consumers
- **Tool Use** - AI capability enabled by MCP
- [Integration](@/glossary/integration.md) - Broader system interconnection context

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
