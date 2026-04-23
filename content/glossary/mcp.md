+++
title = "MCP (Model Context Protocol)"
weight = 40
[extra]
description = "An open protocol standard for connecting AI models to external data sources, tools, and services through a unified interface layer"
category = "ai"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "advanced"
quality_score = 95
abbreviation = "MCP"
related_terms = ["api", "api-gateway", "api-integration", "agent", "ai-agent", "agent-orchestration", "protocol", "plug", "telemetry", "genserver"]
keywords = ["Model Context Protocol definition", "MCP architecture", "AI tool integration protocol", "LLM tool calling", "MCP server implementation", "AI model context management", "MCP Elixir integration", "Claude MCP protocol", "AI agent tool access", "model context protocol specification"]
tags = ["ai", "protocol", "integration", "architecture", "tooling"]
difficulty_level = "advanced"
platform_relevance = "critical"
elixir_relevance = "high"
version = "1.0.0"
word_count = 2036
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "MCP (Model Context Protocol) - Prismatic Platform"
+++

## Definition

The Model Context Protocol (MCP) is an open protocol standard that defines how AI language models connect to external data sources, tools, and services. MCP provides a unified interface layer between AI models and the systems they need to interact with -- databases, APIs, file systems, development tools, and custom business logic. Rather than building bespoke integrations for each tool-model combination, MCP establishes a standardized communication protocol that allows any compliant model to work with any compliant tool server. The Prismatic Platform integrates 14+ MCP servers providing 27+ tools, enabling AI agents to interact with platform capabilities including PostgreSQL databases, file systems, GitHub repositories, memory stores, and the custom `prismatic-mcp` server that exposes platform-specific functionality.

## Overview

The emergence of MCP addresses a fundamental challenge in the AI tooling ecosystem: the N-times-M integration problem. Without a standard protocol, N different AI models each need custom integrations with M different tools, resulting in N * M integration implementations. MCP reduces this to N + M implementations -- each model needs one MCP client, and each tool needs one MCP server. This is the same architectural pattern that database connectors (ODBC/JDBC), language servers (LSP), and debug adapters (DAP) have successfully applied in their respective domains.

Before MCP, AI tool integrations were fragmented across competing proprietary approaches. OpenAI's function calling, Anthropic's tool use, Google's extensions, and various open-source frameworks each defined their own schemas for describing tools, passing parameters, and returning results. Developers building tools for AI consumption had to implement multiple integration layers, one for each model provider. MCP standardizes this interaction, allowing tool developers to implement once and connect to any compliant model.

The protocol operates on a client-server architecture. The AI model (or its host application) acts as the MCP client, discovering available servers, querying their capabilities, and invoking their tools. MCP servers expose tools (functions the model can call), resources (data the model can read), and prompts (template interactions the model can use). Communication happens over standard transports -- stdio for local processes, HTTP with Server-Sent Events for remote servers -- using JSON-RPC 2.0 as the message format.

The significance of MCP extends beyond simple tool access. By providing a structured way for models to discover and interact with external systems, MCP enables a new class of AI applications: agents that can autonomously navigate complex workflows across multiple systems, gather information from diverse sources, and take actions in the real world (within authorization boundaries). The Prismatic Platform's 530+ AIAD agents leverage MCP as one of their primary mechanisms for interacting with platform infrastructure, external services, and development tools.

MCP's design philosophy prioritizes discoverability (models can enumerate available tools and their schemas), type safety (tool parameters and return values are described with JSON Schema), composability (multiple MCP servers can be composed into a unified tool surface), and security (authorization boundaries are enforced at the server level). These properties align well with the Prismatic Platform's emphasis on structured interfaces, type-safe interactions, and defense-in-depth security.

The protocol is rapidly gaining adoption across the AI ecosystem. Major model providers, IDE developers, and tool vendors have announced MCP support, suggesting it is becoming the de facto standard for AI-tool integration. For platform engineers, understanding MCP is essential for building systems that can effectively leverage AI capabilities.

## Technical Details

### MCP Architecture Components

The MCP ecosystem consists of several key components:

| Component | Role | Example |
|-----------|------|---------|
| **MCP Host** | Application that manages MCP connections | Claude Desktop, IDE plugin, custom app |
| **MCP Client** | Protocol client within the host | Built into the host application |
| **MCP Server** | Exposes tools, resources, and prompts | `prismatic-mcp`, `postgres`, `filesystem` |
| **Transport** | Communication layer | stdio (local), HTTP+SSE (remote) |
| **Protocol** | Message format and semantics | JSON-RPC 2.0 over transport |

### MCP Server Implementation in Elixir

The Prismatic Platform implements MCP servers using GenServer processes that handle the JSON-RPC communication protocol:

```elixir
defmodule PrismaticMCP.Server do
  @moduledoc """
  MCP server implementation that exposes Prismatic Platform capabilities
  as tools, resources, and prompts accessible to AI models via the
  Model Context Protocol.
  """

  use GenServer

  @type tool :: %{
    name: String.t(),
    description: String.t(),
    input_schema: map(),
    handler: (map() -> {:ok, term()} | {:error, term()})
  }

  @type resource :: %{
    uri: String.t(),
    name: String.t(),
    description: String.t(),
    mime_type: String.t()
  }

  @type server_state :: %{
    tools: %{String.t() => tool()},
    resources: %{String.t() => resource()},
    transport: module(),
    capabilities: map()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    tools = register_platform_tools()
    resources = register_platform_resources()

    state = %{
      tools: tools,
      resources: resources,
      transport: Keyword.get(opts, :transport, PrismaticMCP.Transport.Stdio),
      capabilities: %{
        tools: %{listChanged: true},
        resources: %{subscribe: true, listChanged: true},
        prompts: %{listChanged: true}
      }
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:jsonrpc, "initialize", params}, _from, state) do
    response = %{
      protocolVersion: "2024-11-05",
      capabilities: state.capabilities,
      serverInfo: %{
        name: "prismatic-mcp",
        version: "1.0.0"
      }
    }

    {:reply, {:ok, response}, state}
  end

  @impl true
  def handle_call({:jsonrpc, "tools/list", _params}, _from, state) do
    tools_list =
      state.tools
      |> Enum.map(fn {_name, tool} ->
        %{
          name: tool.name,
          description: tool.description,
          inputSchema: tool.input_schema
        }
      end)

    {:reply, {:ok, %{tools: tools_list}}, state}
  end

  @impl true
  def handle_call({:jsonrpc, "tools/call", %{"name" => name, "arguments" => args}}, _from, state) do
    case Map.get(state.tools, name) do
      nil ->
        {:reply, {:error, %{code: -32601, message: "Tool not found: #{name}"}}, state}

      tool ->
        :telemetry.execute(
          [:prismatic, :mcp, :tool_call],
          %{},
          %{tool: name}
        )

        case tool.handler.(args) do
          {:ok, result} ->
            {:reply, {:ok, %{content: [%{type: "text", text: Jason.encode!(result)}]}}, state}

          {:error, reason} ->
            {:reply, {:ok, %{content: [%{type: "text", text: "Error: #{reason}"}], isError: true}}, state}
        end
    end
  end

  defp register_platform_tools do
    %{
      "quality_status" => %{
        name: "quality_status",
        description: "Get current platform quality status across all 13 domains",
        input_schema: %{type: "object", properties: %{}},
        handler: &handle_quality_status/1
      },
      "git_trees" => %{
        name: "git_trees",
        description: "Search the codebase using optimized git tree operations",
        input_schema: %{
          type: "object",
          properties: %{
            "command" => %{type: "string", enum: ["list", "find", "apps", "stats"]},
            "path" => %{type: "string"}
          },
          required: ["command"]
        },
        handler: &handle_git_trees/1
      },
      "osint_search" => %{
        name: "osint_search",
        description: "Execute OSINT search across 120+ intelligence sources",
        input_schema: %{
          type: "object",
          properties: %{
            "query" => %{type: "string"},
            "sources" => %{type: "array", items: %{type: "string"}}
          },
          required: ["query"]
        },
        handler: &handle_osint_search/1
      }
    }
  end
end
```

### MCP Transport Layer

MCP supports multiple transport mechanisms. The Prismatic Platform implements both stdio (for local development) and HTTP+SSE (for remote access):

```elixir
defmodule PrismaticMCP.Transport.Stdio do
  @moduledoc """
  Standard I/O transport for MCP communication.
  Used when the MCP server runs as a local child process of the AI host.
  Messages are newline-delimited JSON-RPC over stdin/stdout.
  """

  @behaviour PrismaticMCP.Transport

  @type state :: %{
    buffer: String.t(),
    handler: pid()
  }

  @impl true
  @spec init(keyword()) :: {:ok, state()}
  def init(opts) do
    {:ok, %{
      buffer: "",
      handler: Keyword.fetch!(opts, :handler)
    }}
  end

  @impl true
  @spec send_message(state(), map()) :: {:ok, state()}
  def send_message(state, message) do
    json = Jason.encode!(message)
    IO.puts(json)
    {:ok, state}
  end

  @impl true
  @spec receive_message(state()) :: {:ok, map(), state()} | {:error, term()}
  def receive_message(state) do
    case IO.gets("") do
      :eof ->
        {:error, :connection_closed}

      {:error, reason} ->
        {:error, reason}

      line ->
        case Jason.decode(String.trim(line)) do
          {:ok, message} -> {:ok, message, state}
          {:error, reason} -> {:error, {:parse_error, reason}}
        end
    end
  end
end

defmodule PrismaticMCP.Transport.HTTP do
  @moduledoc """
  HTTP + Server-Sent Events transport for remote MCP communication.
  Client sends JSON-RPC requests via HTTP POST, receives responses
  and server-initiated notifications via SSE stream.
  """

  @behaviour PrismaticMCP.Transport

  @type state :: %{
    endpoint: String.t(),
    auth_token: String.t() | nil,
    sse_connection: pid() | nil
  }

  @impl true
  @spec init(keyword()) :: {:ok, state()}
  def init(opts) do
    {:ok, %{
      endpoint: Keyword.fetch!(opts, :endpoint),
      auth_token: Keyword.get(opts, :auth_token),
      sse_connection: nil
    }}
  end

  @impl true
  @spec send_message(state(), map()) :: {:ok, state()}
  def send_message(state, message) do
    headers = build_headers(state.auth_token)
    body = Jason.encode!(message)

    case :httpc.request(:post, {state.endpoint, headers, "application/json", body}, [], []) do
      {:ok, _response} -> {:ok, state}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

### MCP Server Configuration

The Prismatic Platform configures MCP servers through a declarative configuration that specifies which servers to start, their transport mechanism, and their environment:

```elixir
defmodule PrismaticMCP.Config do
  @moduledoc """
  Configuration management for MCP server instances.
  Defines the platform's 14+ MCP server connections with their
  transport configuration, environment variables, and capability mapping.
  """

  @type server_config :: %{
    name: String.t(),
    command: String.t(),
    args: list(String.t()),
    transport: :stdio | :http,
    env: map(),
    priority: :p1 | :p2 | :p3,
    tools_count: non_neg_integer()
  }

  @spec platform_servers() :: list(server_config())
  def platform_servers do
    [
      %{
        name: "prismatic-mcp",
        command: "mix",
        args: ["mcp.server"],
        transport: :stdio,
        env: %{},
        priority: :p1,
        tools_count: 27
      },
      %{
        name: "postgres",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-postgres"],
        transport: :stdio,
        env: %{"DATABASE_URL" => System.get_env("DATABASE_URL", "")},
        priority: :p1,
        tools_count: 5
      },
      %{
        name: "filesystem",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-filesystem"],
        transport: :stdio,
        env: %{},
        priority: :p1,
        tools_count: 8
      },
      %{
        name: "github",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        transport: :stdio,
        env: %{"GITHUB_TOKEN" => System.get_env("GITHUB_TOKEN", "")},
        priority: :p1,
        tools_count: 12
      },
      %{
        name: "memory",
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-memory"],
        transport: :stdio,
        env: %{},
        priority: :p2,
        tools_count: 4
      },
      %{
        name: "context7",
        command: "npx",
        args: ["-y", "context7-mcp"],
        transport: :stdio,
        env: %{},
        priority: :p2,
        tools_count: 3
      }
    ]
  end
end
```

## Implementation

### Platform MCP Integration Architecture

The Prismatic Platform's MCP integration follows a layered architecture:

**Layer 1 -- Server Registry**: An ETS-backed registry tracks all active MCP server connections, their capabilities, health status, and last-known tool listings. This enables dynamic discovery of available tools across all connected servers.

**Layer 2 -- Tool Router**: When an AI agent requests a tool invocation, the router resolves which MCP server provides that tool and dispatches the request to the correct server. This abstraction allows agents to invoke tools by name without knowing which server hosts them.

**Layer 3 -- Authorization**: Each MCP tool invocation passes through an authorization layer that validates whether the requesting agent has permission to use that specific tool. This integrates with the platform's RBAC system to enforce least-privilege access.

**Layer 4 -- Telemetry**: All MCP interactions are instrumented with telemetry events, enabling monitoring of tool usage patterns, latency, error rates, and agent-tool interaction graphs.

**Layer 5 -- Circuit Breaker**: Each MCP server connection is wrapped in a circuit breaker that opens after repeated failures, preventing cascading failures when an MCP server becomes unhealthy.

### Setup and Configuration

The platform's MCP servers are initialized through a setup script:

```bash
# Initialize all MCP server connections
./scripts/setup-mcp-servers.sh

# Verify MCP server health
mix mcp.status

# List all available tools across all connected servers
mix mcp.tools

# Test specific tool invocation
mix mcp.call prismatic-mcp quality_status
```

### MCP in the AIAD Agent Framework

AIAD agents interact with MCP servers through a standardized interface. When an agent needs to access a tool, it issues a tool request through the MCP client, which handles server selection, authorization, invocation, and result parsing:

1. **Agent declares tool need**: The agent's specification lists required MCP tools
2. **Orchestrator validates access**: The agent's authority level is checked against tool permissions
3. **Client dispatches request**: JSON-RPC request sent to appropriate MCP server
4. **Server executes tool**: Tool handler runs with provided arguments
5. **Result returned**: Structured response flows back through the protocol chain
6. **Telemetry recorded**: Invocation metrics recorded for monitoring and optimization

## Comparison

### MCP vs. Alternative AI Tool Integration Approaches

| Approach | Standardized | Transport | Type Safety | Discovery | Ecosystem |
|----------|-------------|-----------|-------------|-----------|-----------|
| **MCP** | Yes (open spec) | stdio, HTTP+SSE | JSON Schema | Built-in | Growing rapidly |
| **OpenAI Function Calling** | Vendor-specific | HTTP | JSON Schema | Manual | OpenAI only |
| **LangChain Tools** | Framework-specific | Python in-process | Python types | Manual | Python ecosystem |
| **Custom REST APIs** | Per-implementation | HTTP | OpenAPI (optional) | Manual | Universal |
| **GraphQL** | Schema-standardized | HTTP | Intrinsic | Introspection | Moderate |
| **gRPC** | Protobuf-standardized | HTTP/2 | Protobuf | Reflection | Strong |

### MCP vs. Language Server Protocol (LSP)

MCP draws explicit inspiration from LSP, which standardized the communication between code editors and language-specific intelligence providers. The parallels are instructive:

| Dimension | LSP | MCP |
|-----------|-----|-----|
| **Client** | Code editor (VS Code, etc.) | AI model host (Claude, etc.) |
| **Server** | Language server (rust-analyzer, etc.) | Tool server (prismatic-mcp, etc.) |
| **Protocol** | JSON-RPC 2.0 | JSON-RPC 2.0 |
| **Capabilities** | Completions, diagnostics, formatting | Tools, resources, prompts |
| **Transport** | stdio, pipe, socket | stdio, HTTP+SSE |
| **Impact** | Eliminated N*M editor-language integrations | Eliminating N*M model-tool integrations |

## Best Practices

1. **Design tools with clear, atomic responsibilities**: Each MCP tool should do one thing well. A `search_database` tool and a `write_record` tool are better than a `database_operations` tool that does both. This matches the AI model's ability to decompose complex tasks into tool-calling sequences.

2. **Provide comprehensive input schemas**: MCP tool descriptions should include detailed JSON Schema definitions for all parameters, with descriptions, examples, and constraints. AI models use these schemas to determine how to invoke tools correctly.

3. **Return structured results**: Tool responses should be structured (JSON) rather than free-text where possible. Structured results enable the model to extract specific fields, compare across invocations, and compose results from multiple tool calls.

4. **Implement proper error handling**: MCP tools should return meaningful error messages with context. "Database connection failed: host unreachable" is useful; "Error" is not. The model needs error context to decide whether to retry, try an alternative tool, or inform the user.

5. **Enforce authorization at the server level**: Never trust the AI model to respect access boundaries. Authorization must be enforced in the MCP server's tool handlers, not delegated to the model's judgment.

6. **Monitor tool usage patterns**: Instrument MCP tool calls with telemetry to understand which tools are used most frequently, which fail most often, and which latency characteristics affect agent performance.

7. **Version your MCP servers**: As tool capabilities evolve, version your MCP server implementations. Breaking changes to tool schemas can cause agent failures if not managed carefully.

8. **Use circuit breakers for external tools**: MCP tools that depend on external services (APIs, databases) should implement circuit breakers to prevent cascading failures when dependencies become unhealthy.

## Pitfalls

1. **Over-broad tool definitions**: Creating a single tool that accepts a complex configuration object and performs many different operations. This makes it difficult for AI models to use the tool correctly and impossible to apply fine-grained authorization.

2. **Insufficient tool descriptions**: Providing minimal descriptions that force the model to guess at tool semantics. The model cannot experiment with tools the way a human developer would; it relies entirely on the description and schema.

3. **Ignoring transport security**: Running MCP servers over unencrypted transports in production. While stdio transport is inherently local, HTTP transport must use TLS and proper authentication.

4. **Stateful tool assumptions**: Designing tools that assume a specific invocation order or maintain server-side state between calls. AI models may invoke tools in unexpected sequences, and MCP does not guarantee session affinity.

5. **Unbounded tool execution time**: MCP tools that can run for minutes or hours without timeout handling. Long-running tools should implement progress reporting or be decomposed into async initiation and polling tools.

6. **Exposing dangerous operations without safeguards**: MCP tools that can delete data, modify production systems, or execute arbitrary code must include confirmation mechanisms, dry-run modes, and audit logging.

7. **Ignoring the N+M advantage**: Building custom integrations for specific model-tool combinations instead of investing in MCP compliance. The protocol's value comes from composability -- every MCP server works with every MCP client.

## Use Cases

### Platform Quality Monitoring

The `prismatic-mcp` server exposes quality status tools that allow AI agents to query the platform's quality metrics across all 13 domains. An agent working on code changes can check whether its modifications have introduced quality regressions before committing, using the same quality data that the pre-commit pipeline enforces.

### Database Operations

The PostgreSQL MCP server provides structured access to the platform's database. AI agents can query data, inspect schemas, and analyze query performance without needing direct database credentials. Authorization is enforced at the MCP server level, limiting agents to read-only access on production databases.

### Codebase Navigation

The filesystem and git-trees MCP tools enable AI agents to navigate the platform's 2.8M LOC codebase efficiently. Rather than executing raw shell commands, agents use structured tools that return typed results -- file listings, search results, and repository statistics -- in a format optimized for AI consumption.

### OSINT Intelligence Gathering

The OSINT MCP tools expose the platform's 120+ intelligence sources through a unified interface. An AI agent conducting an investigation can search across Czech business registries, global threat intelligence databases, and sanctions lists through a single tool interface, with the MCP server handling source-specific API differences.

### GitHub Integration

The GitHub MCP server provides tools for interacting with repositories, pull requests, issues, and code reviews. AI agents can create issues, review PRs, and manage repository workflows through structured tool calls rather than CLI command construction.

## Related Concepts

Understanding MCP connects to several fundamental concepts in the Prismatic Platform:

- [API](/glossary/api/) -- the general concept of application programming interfaces that MCP standardizes for AI access
- [API Gateway](/glossary/api-gateway/) -- the gateway pattern that MCP servers apply to AI-tool communication
- [Agent](/glossary/agent/) -- the autonomous entities that use MCP tools to interact with platform systems
- [AI Agent](/glossary/ai-agent/) -- artificial intelligence agents that leverage MCP for tool access
- [Protocol](/glossary/protocol/) -- the Elixir protocol concept that parallels MCP's interface standardization
- [GenServer](/glossary/genserver/) -- the OTP behaviour used to implement MCP servers in the Prismatic Platform
- [Telemetry](/glossary/telemetry/) -- the instrumentation layer that monitors MCP tool usage
- [Agent Orchestration](/glossary/agent-orchestration/) -- the coordination of multiple agents using MCP tools
- [API Integration](/glossary/api-integration/) -- the broader practice of integrating external APIs that MCP simplifies
- [Plug](/glossary/plug/) -- the composable middleware pattern that influences MCP server design

## See Also

- [AIAD](/glossary/aiad/) -- the AI Agent Definition standard that defines how agents declare MCP tool requirements
- [Agent Registry](/glossary/agent-registry/) -- the registry that tracks which agents require which MCP tools
- [Phoenix Framework](/glossary/phoenix-framework/) -- the web framework that hosts HTTP-based MCP transport endpoints
- [OSINT](/glossary/osint/) -- the intelligence discipline that MCP tools expose for AI agent consumption
- [Security](/glossary/security/) -- the security considerations for MCP server deployment and authorization

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis). Part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) glossary. Contributions welcome via pull request.
