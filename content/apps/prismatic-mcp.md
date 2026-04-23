+++
title = "Prismatic MCP"
weight = 45
[extra]
icon = "puzzle-piece"
color = "violet"
description = "Model Context Protocol server providing 27 tools for AI-platform integration"
category = "AI"
files = "160"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 723
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "MCP", "Model", "Context", "Protocol", "AI-platform", "apps", "Prismatic Platform", "OSINT", "Tool"]
tags = ["apps", "ai", "prismatic-mcp", "prismatic"]
quality_score = 70
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic MCP - Prismatic Platform"
+++

## Overview

Prismatic MCP implements the Model Context [Protocol](@/glossary/protocol.md), providing a standardized interface for AI models (Claude, GPT, local [Ollama](@/glossary/ollama.md) models) to interact with the Prismatic Platform. It exposes 27 tools covering [OSINT](@/glossary/osint.md) queries, security operations, entity management, and platform administration through the MCP specification.

The Model Context Protocol is an open standard that enables AI assistants to interact with external tools and data sources in a structured, validated, and auditable manner. Prismatic MCP transforms the platform's capabilities into MCP-compliant tool definitions, allowing any MCP-capable AI client to query OSINT sources, run security scans, manage entities, and monitor platform health through a single standardized interface.

## Architecture

```
Prismatic.MCP.Application
└── Prismatic.MCP.Supervisor (:one_for_one)
    ├── Prismatic.MCP.Server (GenServer)
    │   └── MCP protocol handler (JSON-RPC 2.0)
    ├── Prismatic.MCP.Transport (GenServer)
    │   ├── :stdio (local Claude/GPT)
    │   └── :sse (remote clients via Plug)
    ├── Prismatic.MCP.Router (GenServer)
    │   └── Pattern-matched tool dispatch
    ├── Prismatic.MCP.ToolRegistry (GenServer)
    │   └── ETS: :mcp_tools (27 tool definitions, hot reload)
    ├── Prismatic.MCP.Auth (GenServer)
    │   └── RBAC with JWT token validation
    └── Prismatic.MCP.AuditLog (GenServer)
        └── Immutable audit trail for all invocations
```

```
MCP Client (Claude/GPT) --> Transport Layer --> Router --> Tool Handler --> Platform API --> Result
         |                       |                |            |                |             |
    JSON-RPC 2.0            stdio/SSE       Tool lookup    Validation    Prismatic.*     Formatted
    Messages               transport         + dispatch    + auth       facade call      response
```

| Component | Implementation | Purpose |
|-----------|---------------|---------|
| **Transport** | stdio (local), SSE (remote) | Client-server communication |
| **Router** | Pattern-matched tool dispatch | Route requests to correct handler |
| **Validator** | JSON Schema parameter validation (ex_json_schema) | Input sanitization and type checking |
| **Auth Layer** | [RBAC](@/glossary/rbac.md)-based tool access | Role-based tool authorization |
| **Handlers** | Per-tool implementation modules | Tool logic and platform API calls |
| **Serializer** | Structured result formatting | Convert Elixir results to MCP format |

## Key Modules

| Module | Purpose |
|--------|---------|
| `Prismatic.MCP` | Main API facade |
| `Prismatic.MCP.Application` | OTP application entry point |
| `Prismatic.MCP.Server` | MCP protocol handler implementing JSON-RPC 2.0 |
| `Prismatic.MCP.Transport` | stdio and SSE transport layer management |
| `Prismatic.MCP.Router` | Tool request routing and dispatch |
| `Prismatic.MCP.ToolRegistry` | ETS-cached tool definitions with hot reload |
| `Prismatic.MCP.Auth` | RBAC authorization with JWT validation |
| `Prismatic.MCP.AuditLog` | Immutable audit trail for all tool invocations |
| `Prismatic.MCP.Tools.*` | Per-domain tool handler modules (OSINT, Security, Storage, Analysis, Admin) |

## Available Tools (27)

### OSINT Tools (8)

| Tool | Parameters | Returns |
|------|-----------|---------|
| **`search_entity`** | query, sources, max_results | Entity matches with [confidence scores](@/glossary/confidence-scoring.md) |
| **`query_source`** | source, query, params | Raw source results |
| **`collect_intelligence`** | target, domains, depth | Multi-domain intelligence report |
| **`entity_profile`** | identifier, type | Comprehensive entity profile |
| **`domain_recon`** | domain, scan_types | Domain reconnaissance results |
| **`certificate_search`** | domain, include_expired | Certificate transparency results |
| **`dns_enumeration`** | domain, record_types | DNS enumeration results |
| **`whois_lookup`** | domain | WHOIS registration data |

### Security Tools (6)

| Tool | Parameters | Returns |
|------|-----------|---------|
| **`check_rating`** | target, framework | Security rating (A-F, 300-900) |
| **`scan_surface`** | target, scan_types | Attack surface discovery results |
| **`assess_compliance`** | target, frameworks | Compliance assessment (NIS2, ZKB) |
| **`vulnerability_check`** | target, severity | Vulnerability findings |
| **`exposure_check`** | target | Exposed services and data leaks |
| **`threat_intel`** | indicator, type | Threat intelligence report |

### Storage Tools (5)

| Tool | Parameters | Returns |
|------|-----------|---------|
| **`get_entity`** | id, type | Entity record |
| **`store_entity`** | entity, type | Storage confirmation |
| **`query_graph`** | query, depth, filters | Knowledge graph traversal results |
| **`search_entities`** | query, filters, limit | Full-text search results |
| **`entity_relationships`** | id, depth, types | Relationship graph |

### Analysis Tools (4) and Admin Tools (4)

| Tool | Parameters | Returns |
|------|-----------|---------|
| **`analyze_risk`** | target, domains | Risk score with evidence |
| **`correlate_signals`** | signals, method | Correlated findings |
| **`detect_anomaly`** | entity, baseline | Anomaly report |
| **`confidence_assess`** | claim, evidence | NABLA-compliant confidence score |
| **`platform_health`** | -- | Health status across all subsystems |
| **`get_config`** | key, domain | Configuration value |
| **`list_agents`** | domain, tier, status | Agent registry query results |
| **`quality_status`** | -- | Quality score, QDP, domain breakdown |

## Configuration

```elixir
config :prismatic_mcp, :server,
  transport: :stdio,           # or :sse for remote
  port: 3000,                  # SSE port (if applicable)
  tools_module: PrismaticMcp.Tools,
  auth_module: PrismaticMcp.Auth,
  rate_limit: %{
    requests_per_minute: 60,
    burst: 10
  },
  audit_log: true

config :prismatic_mcp, :auth,
  roles: [:reader, :analyst, :admin],
  default_role: :reader
```

## API Reference

```elixir
# Direct tool invocation from Elixir
{:ok, result} = PrismaticMcp.invoke("search_entity", %{
  query: "example.com",
  sources: ["shodan", "censys"],
  max_results: 20
})

# Batch tool invocation
{:ok, results} = PrismaticMcp.batch_invoke([
  {"search_entity", %{query: "example.com"}},
  {"check_rating", %{target: "example.com"}},
  {"dns_enumeration", %{domain: "example.com"}}
])

# Tool discovery (MCP clients use tools/list endpoint)
{:ok, tools} = PrismaticMcp.list_tools()
```

### Security: Role-Based Access Control

| Role | OSINT | Security | Storage | Analysis | Admin |
|------|-------|----------|---------|----------|-------|
| **Reader** | search, profile | check_rating | get, search | -- | health, quality |
| **Analyst** | All 8 | All 6 | get, search, graph | All 4 | health, quality |
| **Admin** | All 8 | All 6 | All 5 | All 4 | All 4 |

## Testing

```bash
# Run all MCP tests
cd apps/prismatic_mcp && mix test

# Run with coverage
mix test --cover

# Run tool handler tests
mix test test/prismatic_mcp/tools_test.exs

# Run auth and RBAC tests
mix test test/prismatic_mcp/auth_test.exs
```

Testing covers tool invocation with parameter validation, RBAC permission enforcement, audit log completeness, rate limiting behavior, and transport layer protocol compliance. Integration tests verify end-to-end tool execution against platform facade APIs.

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| [Prismatic](@/apps/prismatic.md) | Core platform API for OSINT and investigation tools |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Security rating and EASM tools |
| [Prismatic Storage Core](@/apps/prismatic-storage-core.md) | Entity storage and graph query tools |
| [Prismatic Nabla](@/apps/prismatic-nabla.md) | Confidence assessment and epistemic tools |
| [Prismatic Ollama](@/apps/prismatic-ollama.md) | Local AI inference for analysis tools |
| [Prismatic Agents](@/apps/prismatic-agents.md) | Agent listing and status tools |

## NABLA Compliance

| NABLA Axiom | Enforcement | Implementation |
|-------------|------------|----------------|
| Provenance Mandatory | HARD -- every invocation logged with full context | Audit log entry per tool call with client, parameters, result |
| Signal Plurality | HARD -- multi-source queries enforce plurality | search_entity fans out to multiple OSINT sources |
| Time Decay | HARD -- result timestamps mandatory | All tool results include timestamp and TTL metadata |
| Source Independence | SOFT -- per-source results distinguishable | Multi-source queries return per-source attribution |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Tool Discovery | < 10ms | Cached tool definitions |
| Average Tool Latency | 50-500ms | Depends on backend operation |
| Concurrent Clients | 50+ | GenServer per client |
| Throughput | 100+ req/s | Per MCP server instance |
| Audit Log Overhead | < 1ms | Async ETS write |

## Related Resources

- [Prismatic Ollama](@/apps/prismatic-ollama.md) -- Local AI inference
- [Prismatic Claude](@/apps/prismatic-claude.md) -- Claude AI integration
- [Prismatic API](@/apps/prismatic-api.md) -- REST API gateway
- [AIAD Standard](@/capabilities/aiad-standard.md) -- MCP tool definitions follow AIAD specifications
- [Cross-Domain Flexibility](@/capabilities/cross-domain-flexibility.md) -- 27 tools spanning 5 domains
- [Quality Gates](@/capabilities/quality-gates.md) -- Validation, rate limiting, and audit logging gates

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)