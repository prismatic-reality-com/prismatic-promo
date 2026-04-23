+++
title = "Server"
weight = 50
[extra]
description = "MCP tool server or network service providing functionality to clients through defined protocols and interfaces"
category = "infrastructure"
related_terms = ["process", "runtime", "permission", "secrets", "server-render"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["server", "MCP", "GenServer", "network service", "protocol", "endpoint", "glossary", "Prismatic Platform"]
tags = ["glossary", "infrastructure", "networking", "mcp"]
quality_score = 76
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Server - Prismatic Platform"
+++

## Definition & Overview

In the Prismatic Platform context, "server" refers to two distinct but related concepts: MCP (Model Context Protocol) tool servers that provide specialized functionality to AI agents, and network services that handle client requests through defined protocols. Both share the common pattern of listening for requests, processing them according to their protocol, and returning structured responses.

MCP servers extend Claude's capabilities by exposing tools, resources, and prompts through a standardized JSON-RPC protocol. The Prismatic Platform integrates 14+ MCP servers providing capabilities including filesystem access, GitHub integration, PostgreSQL queries, memory persistence, and the platform's own prismatic-mcp server (P1 priority) with 27 specialized tools. Each MCP server runs as a separate process, communicating with Claude through stdio or HTTP transport.

Network servers in the platform include Phoenix endpoints (port 4000 for the web interface, port 4004 for the REST API), the Livebook server for interactive notebooks, and internal GenServer processes that handle domain-specific request-response patterns. The BEAM virtual machine's process model makes every GenServer a lightweight server capable of handling concurrent requests through message passing.

## Technical Deep Dive

GenServer is the foundation of all server implementations in the Prismatic Platform. Each GenServer maintains isolated state and processes requests synchronously (`call`) or asynchronously (`cast`).

```elixir
defmodule PrismaticApi.Server do
  @moduledoc """
  REST API server configuration and startup.
  Runs on port 4004 with OpenApiSpex auto-discovery.
  """

  def child_spec(opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [opts]},
      type: :supervisor
    }
  end

  def start_link(opts) do
    port = Keyword.get(opts, :port, 4004)

    children = [
      {Plug.Cowboy, scheme: :http, plug: PrismaticApi.Endpoint, options: [port: port]},
      PrismaticApi.EndpointRegistry,
      PrismaticApi.Scanner
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: PrismaticApi.Supervisor)
  end
end
```

MCP server integration in the Prismatic Platform follows the MCP specification, exposing tools that Claude can invoke during sessions. The prismatic-mcp server provides 27 tools covering codebase exploration, quality checks, and platform operations.

```elixir
defmodule PrismaticMcp.Server do
  @moduledoc """
  MCP server implementation providing 27 platform-specific tools
  to Claude sessions via JSON-RPC over stdio transport.
  """

  @tools [
    %{
      name: "git_trees",
      description: "Fast codebase exploration via git ls-tree",
      input_schema: %{
        type: "object",
        properties: %{
          command: %{type: "string", enum: ["stats", "list", "find", "apps", "elixir"]},
          path: %{type: "string"}
        },
        required: ["command"]
      }
    },
    %{
      name: "quality_gates",
      description: "Run quality gate checks on the platform",
      input_schema: %{
        type: "object",
        properties: %{
          domain: %{type: "string"},
          fast: %{type: "boolean"}
        }
      }
    },
    %{
      name: "osint_tool_registry",
      description: "Query the OSINT tool registry",
      input_schema: %{
        type: "object",
        properties: %{
          action: %{type: "string", enum: ["list", "get", "search"]},
          category: %{type: "string"},
          slug: %{type: "string"}
        },
        required: ["action"]
      }
    }
  ]

  @spec handle_tool_call(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def handle_tool_call("git_trees", %{"command" => command} = params) do
    path = Map.get(params, "path", ".")

    case System.cmd("./scripts/git-trees.sh", [command, path], stderr_to_stdout: true) do
      {output, 0} -> {:ok, %{result: output}}
      {output, code} -> {:error, %{code: code, output: output}}
    end
  end

  def handle_tool_call("quality_gates", params) do
    args = if Map.get(params, "fast"), do: ["--fast"], else: []

    case System.cmd("mix", ["quality.gates.check" | args], stderr_to_stdout: true) do
      {output, 0} -> {:ok, %{result: output, status: "passed"}}
      {output, code} -> {:error, %{code: code, output: output, status: "failed"}}
    end
  end

  def handle_tool_call("osint_tool_registry", %{"action" => "list"} = params) do
    category = Map.get(params, "category")

    tools =
      if category do
        PrismaticOsintCore.ToolRegistry.list_by_category(String.to_existing_atom(category))
      else
        PrismaticOsintCore.ToolRegistry.list_all()
      end

    {:ok, %{tools: Enum.map(tools, &Map.take(&1, [:slug, :name, :category]))}}
  end

  @spec list_tools() :: [map()]
  def list_tools, do: @tools
end
```

The Phoenix web server uses Cowboy as the HTTP server, managed through the endpoint configuration. The endpoint handles both regular HTTP requests and WebSocket connections for LiveView.

```elixir
defmodule PrismaticWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :prismatic_web

  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]]

  plug Plug.Static,
    at: "/",
    from: :prismatic_web,
    gzip: false

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.Session, @session_options
  plug PrismaticWeb.Router
end
```

## Architecture & Implementation

The Prismatic Platform's server architecture follows a multi-port, multi-protocol design. The web server (port 4000) handles browser requests and LiveView WebSocket connections. The API server (port 4004) handles REST API requests with OpenApiSpex documentation. MCP servers communicate via stdio for Claude integration. Internal GenServers handle domain-specific operations within the BEAM VM.

All servers are supervised within the OTP supervision tree, ensuring automatic restart on failure. The PrismaticSupervisor manages domain-level supervisors, each containing the servers for that domain (OSINT servers, DD servers, Perimeter servers).

## Usage in Prismatic Platform

MCP server setup is automated through the platform's initialization scripts. The 14+ MCP servers are configured in the Claude Code settings and auto-loaded at session start.

```bash
# Setup MCP servers
./scripts/setup-mcp-servers.sh

# Start web server
mix phx.server  # port 4000

# Start API server (separate endpoint)
# Configured in config/runtime.exs, port 4004

# MCP server list
# prismatic-mcp (27 tools, P1)
# context7, filesystem, github, postgres, memory, etc.
```

## Cross-References

- [Process](/glossary/process/) - GenServer processes implementing server behavior
- [Runtime](/glossary/runtime/) - Server configuration loaded at runtime
- [Permission](/glossary/permission/) - Access control enforced at server endpoints
- [Secrets](/glossary/secrets/) - Authentication credentials for server connections
- [Server Render](/glossary/server-render/) - Server-side HTML generation by the web server

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
