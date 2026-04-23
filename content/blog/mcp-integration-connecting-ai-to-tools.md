+++
title = "MCP Integration: Connecting AI to Real-World Tools"
date = 2026-03-31
description = "How Prismatic implements the Model Context Protocol to expose OSINT adapters, DD pipelines, and platform capabilities as tools that AI assistants can invoke directly."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["mcp", "ai", "integration", "tools", "protocol", "claude"]
reading_time = "9 min"
keywords = ["Model Context Protocol", "MCP integration", "AI tool integration", "Claude MCP", "AI-powered tools", "LLM tool use"]
image = "/images/blog/mcp-integration.png"
word_count = 1600
date_created = "2026-03-31"
date_modified = "2026-03-31"
quality_score = 85
see_also = ["developers", "architecture", "capabilities"]
image_alt = "MCP Integration: Connecting AI to Real-World Tools - Prismatic Platform"
+++

The Model Context Protocol (MCP) is a standard for connecting AI assistants to external tools and data sources. Prismatic implements MCP to expose its 157 OSINT adapters, DD pipeline, and platform capabilities as tools that AI assistants like Claude can invoke directly. This post explains the integration architecture.

## What Is MCP?

MCP defines a JSON-RPC based protocol for tool invocation:

1. **Discovery** -- the AI assistant queries available tools and their schemas
2. **Invocation** -- the assistant calls a tool with structured parameters
3. **Response** -- the tool returns structured results

This turns Prismatic into a toolkit that any MCP-compatible AI assistant can use.

## Prismatic's MCP Server

The MCP server runs as a dedicated OTP application within the umbrella:

```elixir
defmodule PrismaticMcp.Server do
  @moduledoc "MCP server exposing Prismatic capabilities as AI tools"

  def list_tools do
    [
      osint_tools(),
      dd_tools(),
      platform_tools()
    ]
    |> List.flatten()
  end

  defp osint_tools do
    PrismaticOsintCore.Registry.list_adapters()
    |> Enum.map(fn adapter ->
      %{
        name: "osint_#{adapter.slug}",
        description: adapter.description,
        parameters: adapter_to_schema(adapter)
      }
    end)
  end
end
```

Every OSINT adapter is automatically exposed as an MCP tool. When a new adapter is added to the platform, it appears as an MCP tool without any additional configuration.

## Tool Categories

Prismatic exposes tools across four categories:

### OSINT Tools (157)

Each of the 157 OSINT adapters becomes an MCP tool:

```json
{
  "name": "osint_czech_ares",
  "description": "Query Czech ARES business registry for company information",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {"type": "string", "description": "Company name or ICO"},
      "limit": {"type": "integer", "default": 10}
    },
    "required": ["query"]
  }
}
```

An AI assistant can query ARES by invoking this tool with a company name or identification number.

### DD Tools

Due diligence operations exposed as tools:

- `dd_create_case` -- create a new DD investigation case
- `dd_run_pipeline` -- execute the DD pipeline for a case
- `dd_list_entities` -- list entities in a case
- `dd_get_findings` -- retrieve findings for an entity
- `dd_export_report` -- generate a DD report

### Platform Tools

Infrastructure and monitoring tools:

- `platform_health` -- check system health
- `platform_stats` -- retrieve platform statistics
- `platform_search` -- search across all platform data
- `agent_invoke` -- invoke a specific agent by slug

### Security Tools

EASM and compliance tools:

- `perimeter_discover` -- discover external attack surface
- `perimeter_rating` -- compute security rating
- `compliance_assess` -- assess NIS2/ZKB compliance
- `sanctions_check` -- screen against sanctions lists

## MCP Transport

Prismatic supports two MCP transports:

### Stdio Transport

For local AI assistants (e.g., Claude Code):

```bash
# In Claude Code MCP configuration
{
  "prismatic": {
    "command": "mix",
    "args": ["mcp.server", "--stdio"],
    "cwd": "/path/to/prismatic-platform"
  }
}
```

The server communicates via stdin/stdout, making it easy to integrate with local tools.

### HTTP Transport

For remote AI assistants and API integrations:

```bash
# Start MCP HTTP server
mix mcp.server --http --port 4005
```

The HTTP transport enables cloud-hosted AI services to access Prismatic tools over the network.

## Security Model

MCP tool invocations go through the same security layer as direct API calls:

- **Authentication** -- MCP connections require valid API tokens
- **Authorization** -- tool access respects role-based permissions
- **Rate limiting** -- MCP calls count toward API rate limits
- **Audit logging** -- every MCP invocation is logged with caller identity

The security model ensures that exposing tools via MCP does not bypass existing access controls.

## Practical Usage

An AI assistant analyzing a Czech company can:

1. Query ARES for basic company data
2. Cross-reference with Justice.cz for director information
3. Check sanctions lists for matches
4. Run an insolvency check
5. Generate a summary with confidence scores

All through MCP tool calls, without leaving the AI conversation:

```
User: "Tell me about Navigara s.r.o."
AI: [calls osint_czech_ares with query "Navigara s.r.o."]
AI: [calls osint_czech_justice with query "12345678"]
AI: [calls osint_sanctions_eu with query "Navigara"]
AI: "Navigara s.r.o. (ICO 12345678) is a Prague-based IT company
     founded in 2018. Two directors, one foreign shareholder.
     No sanctions matches. Confidence: 0.94."
```

The AI assistant acts as an analyst, using Prismatic's tools to gather and synthesize intelligence.

## Dynamic Tool Discovery

As new OSINT adapters are added to the platform, they automatically appear as MCP tools. The AI assistant discovers new tools each time it refreshes its tool list:

```elixir
# When a new adapter is compiled:
# 1. It registers in the OSINT adapter registry (ETS)
# 2. The MCP server includes it in list_tools/0
# 3. AI assistants discover it on next connection
```

This zero-configuration approach means the AI's capabilities grow automatically with the platform.

## Conclusion

MCP transforms Prismatic from a platform you interact with through a web interface into a toolkit that AI assistants can use programmatically. The 157 OSINT adapters, DD pipeline, and security tools become capabilities that any MCP-compatible AI can leverage -- making intelligence analysis accessible through natural language conversation.

---

*Configure MCP in your AI assistant using the [MCP Guide](/developers/mcp/) or browse available tools at [API Documentation](@/api/_index.md).*