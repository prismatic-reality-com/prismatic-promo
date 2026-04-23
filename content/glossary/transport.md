+++
title = "Transport"
weight = 50
[extra]
description = "MCP communication layer that handles message serialization, framing, and delivery between client and server processes"
category = "infrastructure"
related_terms = ["mcp", "protocol", "websocket", "stdio"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["transport", "MCP transport", "communication layer", "stdio", "SSE", "glossary", "Prismatic Platform"]
tags = ["glossary", "infrastructure"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Transport - Prismatic Platform"
+++

## Definition & Overview

A transport is the communication layer responsible for carrying messages between client and server processes in a protocol-based system. In the context of the Model Context Protocol (MCP), the transport handles message serialization (encoding structured data into transmittable format), framing (delineating message boundaries within a byte stream), and delivery (ensuring messages reach their destination reliably). The transport abstracts away the physical communication channel, allowing the same protocol logic to work over different mediums.

MCP supports two primary transport types: **stdio** (standard input/output) for local process communication, and **SSE** (Server-Sent Events over HTTP) for networked communication. The stdio transport is used when the MCP server runs as a child process of the client, with messages exchanged through piped stdin/stdout streams. The SSE transport is used for remote MCP servers accessible over HTTP, enabling browser-based clients and distributed deployments.

The Prismatic Platform hosts 14+ MCP servers that expose tools for filesystem operations, GitHub interaction, PostgreSQL queries, memory management, and platform-specific intelligence gathering. Each server's transport configuration determines how it communicates with Claude Code and other MCP clients. The transport choice significantly impacts latency, throughput, and deployment flexibility.

## Technical Deep Dive

A transport implementation in Elixir for MCP follows a behaviour pattern that abstracts the communication channel:

```elixir
defmodule PrismaticMCP.Transport do
  @moduledoc """
  Behaviour for MCP transport implementations. Abstracts
  communication channel from protocol logic.
  """

  @type message :: map()
  @type transport_state :: term()

  @callback init(opts :: keyword()) :: {:ok, transport_state()} | {:error, term()}
  @callback send_message(message(), transport_state()) :: {:ok, transport_state()} | {:error, term()}
  @callback receive_message(transport_state()) :: {:ok, message(), transport_state()} | {:error, term()}
  @callback close(transport_state()) :: :ok
end

defmodule PrismaticMCP.Transport.Stdio do
  @moduledoc """
  Stdio transport for local MCP server communication.
  Messages are JSON-RPC 2.0 encoded, newline-delimited.
  """

  @behaviour PrismaticMCP.Transport

  defstruct [:port, :buffer]

  @impl true
  def init(opts) do
    command = Keyword.fetch!(opts, :command)
    args = Keyword.get(opts, :args, [])

    port = Port.open({:spawn_executable, command}, [
      :binary,
      :exit_status,
      :use_stdio,
      args: args,
      env: Keyword.get(opts, :env, [])
    ])

    {:ok, %__MODULE__{port: port, buffer: ""}}
  end

  @impl true
  def send_message(message, %__MODULE__{port: port} = state) do
    encoded = Jason.encode!(message) <> "\n"
    Port.command(port, encoded)
    {:ok, state}
  end

  @impl true
  def receive_message(%__MODULE__{buffer: buffer} = state) do
    receive do
      {port, {:data, data}} when port == state.port ->
        combined = buffer <> data

        case String.split(combined, "\n", parts: 2) do
          [complete, rest] ->
            message = Jason.decode!(complete)
            {:ok, message, %{state | buffer: rest}}

          [incomplete] ->
            {:ok, nil, %{state | buffer: incomplete}}
        end
    after
      30_000 -> {:error, :timeout}
    end
  end

  @impl true
  def close(%__MODULE__{port: port}) do
    Port.close(port)
    :ok
  end
end
```

The SSE transport implementation handles HTTP-based communication with automatic reconnection:

```elixir
defmodule PrismaticMCP.Transport.SSE do
  @moduledoc """
  Server-Sent Events transport for remote MCP servers.
  Uses HTTP POST for client→server and SSE for server→client.
  """

  @behaviour PrismaticMCP.Transport

  defstruct [:base_url, :session_id, :http_client]

  @impl true
  def init(opts) do
    base_url = Keyword.fetch!(opts, :url)

    state = %__MODULE__{
      base_url: base_url,
      session_id: generate_session_id(),
      http_client: Tesla.client([
        {Tesla.Middleware.JSON, []},
        {Tesla.Middleware.Timeout, timeout: 30_000}
      ])
    }

    {:ok, state}
  end

  @impl true
  def send_message(message, %__MODULE__{} = state) do
    url = "#{state.base_url}/message"

    case Tesla.post(state.http_client, url, message,
           headers: [{"x-session-id", state.session_id}]) do
      {:ok, %{status: 200}} -> {:ok, state}
      {:ok, %{status: status}} -> {:error, {:http_error, status}}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl true
  def close(_state), do: :ok

  defp generate_session_id do
    :crypto.strong_rand_bytes(16) |> Base.url_encode64(padding: false)
  end
end
```

## Architecture & Implementation

The transport layer in the Prismatic Platform is configured per MCP server based on deployment topology:

**Local Servers (Stdio)**: The prismatic-mcp server (27 tools), filesystem server, and memory server all run as local child processes communicating via stdio. This provides the lowest latency since messages never leave the host machine and avoid HTTP overhead. The platform's MCP configuration in `.claude/` defines these servers with their executable paths and arguments.

**Remote Servers (SSE)**: External MCP servers like GitHub, PostgreSQL, and specialized intelligence providers use SSE transport over HTTPS. This enables integration with services running on different hosts while maintaining the MCP protocol's tool discovery and invocation semantics.

**Hybrid Configuration**: Some servers can operate in either mode depending on the deployment environment. During local development, a server might use stdio for fast iteration, while in production it switches to SSE for distributed operation.

The transport abstraction ensures that tool implementations are completely decoupled from their communication mechanism. A tool that searches PostgreSQL works identically whether accessed via local stdio or remote SSE, because the transport handles all serialization and delivery concerns transparently.

## Usage in Prismatic Platform

The platform's MCP server setup script configures transports for all 14+ servers:

```elixir
defmodule PrismaticMCP.ServerConfig do
  @moduledoc """
  Configuration for all MCP servers with transport
  selection based on deployment environment.
  """

  @spec servers() :: [map()]
  def servers do
    [
      %{
        name: "prismatic-mcp",
        priority: :p1,
        tools: 27,
        transport: :stdio,
        command: "prismatic-mcp",
        args: ["--mode", "tools"]
      },
      %{
        name: "github",
        transport: :stdio,
        command: "gh-mcp",
        args: ["--token", System.get_env("GITHUB_TOKEN")]
      },
      %{
        name: "postgres",
        transport: :stdio,
        command: "pg-mcp",
        args: ["--connection", System.get_env("DATABASE_URL")]
      },
      %{
        name: "context7",
        transport: :sse,
        url: "https://context7.prismatic.dev/mcp"
      }
    ]
  end

  @spec start_all() :: [{:ok, pid()} | {:error, term()}]
  def start_all do
    Enum.map(servers(), fn config ->
      transport_mod = transport_module(config.transport)
      PrismaticMCP.Server.start_link(config, transport: transport_mod)
    end)
  end

  defp transport_module(:stdio), do: PrismaticMCP.Transport.Stdio
  defp transport_module(:sse), do: PrismaticMCP.Transport.SSE
end
```

## Cross-References

- [MCP](@/glossary/mcp.md) - Model Context Protocol
- [Tool](@/glossary/tool.md) - MCP-exposed capabilities
- [Protocol](@/glossary/protocol.md) - Communication standard
- [WebSocket](@/glossary/websocket.md) - Alternative bidirectional transport
- **Webhook** - HTTP callback mechanism

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
