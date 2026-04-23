+++
title = "Integration Agents"
weight = 7
[extra]
icon = "plug"
color = "amber"
agent_count = 35
commands = ["/integrate", "/mcp", "/inject", "/garden-sync"]
description = "Cross-system integration, MCP servers, and legacy migration"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1600
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Integration", "Agents", "Cross-system", "Prismatic Platform", "GARDEN", "Legacy", "Pattern", "Model Context"]
tags = ["agents", "integration-agents", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Integration Agents - Prismatic Platform"
+++

## Overview

Integration agents manage connections between Prismatic and external systems, MCP (Model Context [Protocol](@/glossary/protocol.md)) servers, and legacy codebase migration. They ensure seamless data flow and system interoperability across the platform's 90 [umbrella application](@/glossary/umbrella-application.md)s, 14+ MCP server integrations, and 116 GARDEN legacy repositories.

The integration domain addresses one of the most challenging aspects of large-scale platform development: maintaining reliable communication between heterogeneous systems with different data formats, communication protocols, error handling conventions, and lifecycle management requirements. Integration agents provide a uniform abstraction layer that normalizes these differences while preserving the semantic richness of each system's native capabilities.

## Agent Roster

| Agent | Level | Role | Specialization |
|---|---|---|---|
| **integration-architect** | L3 | Integration Design | Cross-system architecture and contract definition |
| **mcp-coordinator** | L3 | MCP Management | MCP server orchestration and health monitoring |
| **gardener** | L3 | [GARDEN](@/glossary/garden.md) Sync | Legacy knowledge integration and pattern extraction |
| **inject-specialist** | L2 | Code Injection | Cross-platform code adaptation and modernization |
| **migrate-expert** | L2 | Migration | Legacy system migration with rollback capability |

## MCP Server Integration

The Model Context Protocol (MCP) integration layer connects the Prismatic Platform with 14+ external tool servers, providing a standardized interface for AI-assisted development operations.

| Server | Priority | Tools | Function | Health Check |
|---|---|---|---|---|
| **prismatic-mcp** | P1 | 27 | Native Prismatic tools and operations | Heartbeat every 30s |
| **context7** | P2 | 5 | Context management and session state | Connection probe |
| **filesystem** | P2 | 8 | File operations and directory management | Read/write probe |
| **github** | P2 | 15 | GitHub integration and repository operations | API health check |
| **postgres** | P2 | 6 | Database operations and query execution | Connection pool check |
| **memory** | P3 | 4 | Persistent memory and knowledge storage | Read/write probe |
| **[meilisearch](@/glossary/meilisearch.md)** | P3 | 5 | Full-text search integration | Index health check |

### MCP Architecture

```elixir
defmodule PrismaticMCP.ServerCoordinator do
  @moduledoc """
  Coordinates MCP server lifecycle, health monitoring,
  and request routing across all integrated servers.
  """

  use GenServer

  @health_check_interval_ms :timer.seconds(30)

  @type server_status :: %{
    name: String.t(),
    priority: :p1 | :p2 | :p3,
    status: :healthy | :degraded | :unavailable,
    tool_count: non_neg_integer(),
    last_health_check: DateTime.t(),
    error_rate: float()
  }

  @spec route_request(String.t(), map()) :: {:ok, term()} | {:error, term()}
  def route_request(tool_name, params) do
    with {:ok, server} <- find_server_for_tool(tool_name),
         {:ok, :healthy} <- check_server_health(server) do
      execute_tool(server, tool_name, params)
    else
      {:error, :unavailable} -> fallback_routing(tool_name, params)
      error -> error
    end
  end
end
```

## GARDEN Legacy Integration

GARDEN manages 116 legacy repositories with 20+ years of accumulated knowledge, representing a significant intellectual asset that the integration domain makes accessible to the modern platform.

| Tier | Repos | Example | Value | Integration Status |
|---|---|---|---|---|
| T1 Production | 8 | sig, prismatic | Core [OSINT](@/glossary/osint.md), AI | Active extraction |
| T2 Active | 12 | kuzu-ex, crisstal | Graph DB, ML | Pattern mining |
| T3 Libraries | 25 | simple_geocoder | Utilities | Selective migration |
| T4 Archive | 45 | prismatic-legacy | 1,302 files | Knowledge indexing |
| T5 R&D | 26 | comtesse | Rust prototypes | Pattern reference |

### Pattern Extraction Pipeline

The GARDEN integration pipeline extracts reusable patterns from legacy repositories and adapts them for the modern Elixir platform.

```
Legacy Repo --> Analysis --> Pattern ID --> Adaptation --> Integration
     |             |            |              |              |
  Source       AST Parse    55+ Known     Modernize      Prismatic
  Code         Semantic     Patterns     to Elixir       Native
               Index                    OTP/Phoenix
```

### Code Injection

```elixir
# Inject pattern from legacy codebase
{:ok, module} = Prismatic.Inject.from_garden(
  source: "sig/providers/breached.ex",
  target: "apps/prismatic_osint/lib/providers/",
  adapt: [:elixir_1_19, :otp_27, :phoenix_1_7]
)
```

## Integration Patterns

The integration domain employs established patterns for reliable cross-system communication.

| Pattern | Use Case | Implementation | Failure Handling |
|---|---|---|---|
| [Circuit Breaker](@/glossary/circuit-breaker.md) | External API calls | Fuse library | Fallback response |
| Retry with Backoff | Transient failures | Exponential backoff | Max retry limit |
| [Adapter Pattern](@/glossary/adapter-pattern.md) | Multi-backend support | Behaviour callbacks | Backend switching |
| Event Sourcing | State synchronization | [Broadway](@/glossary/broadway.md) pipelines | Dead letter queue |
| [Backpressure](@/glossary/backpressure.md) | Rate-limited APIs | [GenStage](@/glossary/genstage.md) demand | Buffered queue |

## Integration Points

- **External APIs**: [Rate limiting](@/glossary/rate-limiting.md), retry logic, circuit breakers for all outbound API calls
- **Databases**: [PostgreSQL](@/glossary/postgresql.md), [KuzuDB](@/glossary/kuzudb.md), Meilisearch adapters with connection pooling
- **Message Queues**: Broadway and GenStage for asynchronous processing pipelines
- **Cache**: [ETS](@/glossary/ets.md) for hot data, [Redis](@/glossary/redis.md) for distributed cache with TTL management

## Commands

| Command | Description | Authority | Usage |
|---|---|---|---|
| `/integrate` | Plan integration architecture | L3 | Design new integrations |
| `/mcp` | MCP server management | L2+ | Monitor and configure MCP servers |
| `/inject` | Legacy code adaptation | L3 | Adapt GARDEN patterns for platform |
| `/garden-sync` | Sync GARDEN repositories | L2+ | Update local GARDEN mirrors |
| `/gardener` | GARDEN orchestration | L3 | Manage GARDEN knowledge extraction |
| `/migrate` | System migration | L3 | Execute legacy system migrations |

## Health Monitoring

All integration points are continuously monitored with automatic degradation detection and alerting.

| Metric | Healthy | Degraded | Critical |
|---|---|---|---|
| MCP server response time | < 500ms | 500ms - 2s | > 2s |
| External API error rate | < 1% | 1-5% | > 5% |
| Database connection pool | > 50% available | 20-50% available | < 20% available |
| GARDEN sync freshness | < 24 hours | 24-72 hours | > 72 hours |

## Enforcement

All integration operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Integration contracts are defined before implementation begins. All external communication uses circuit breakers with defined fallback behavior. MCP server failures are handled gracefully with automatic retry and fallback routing. No integration is deployed without comprehensive contract tests that verify both success and failure paths.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)