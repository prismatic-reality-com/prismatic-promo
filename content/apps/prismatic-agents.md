+++
title = "Prismatic Agents"
weight = 4
[extra]
icon = "users"
color = "purple"
description = "404 autonomous agents with AIAD standard compliance"
category = "AI"
files = "1840"
status = "Production"
port = "N/A"
keywords = ["autonomous AI agent runtime", "AIAD standard compliance", "multi-agent orchestration system", "agent authority hierarchy", "OTP process-per-agent isolation", "slash command routing", "circuit breaker protection", "agent telemetry monitoring"]
tags = ["agents", "ai", "runtime", "orchestration"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1141
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Agents - Prismatic Platform"
+++

## Abstract

Prismatic Agents is the autonomous agent runtime powering 404 specialized AI agents across 14 operational domains within the Prismatic Platform. Every agent adheres to the [AIAD](/glossary/aiad/) (AI-Agent Interface Definition) standard, a YAML-based specification that defines agent capabilities, tool access, authority tiers, and doctrine compliance requirements. The runtime provides process-per-agent isolation through [OTP](/glossary/otp/) [supervision tree](/glossary/supervision-tree/)s, command routing via an [ETS](/glossary/ets/)-backed [registry](/glossary/registry-otp/), [circuit breaker](/glossary/circuit-breaker/) protection for agent execution, and [telemetry integration](/capabilities/telemetry-integration/) for performance monitoring. Agents are organized into a five-tier authority hierarchy (L1 Basic through L5 Supreme) that governs resource access, decision scope, and escalation paths. The system supports 210 registered commands, each mapped to one or more agents with priority-based dispatch.

## 1. Introduction

### 1.1 Problem Statement

A platform integrating 90 OTP applications, 121+ [OSINT](/glossary/osint/) sources, security operations, compliance assessment, and quality enforcement requires coordination logic that exceeds what can be expressed through direct function calls or simple event handlers. Complex operations -- such as conducting a full [EASM](/glossary/easm/) assessment, orchestrating color team security exercises, or performing multi-source [intelligence fusion](/glossary/intelligence-fusion/) -- involve sequences of tool invocations, conditional branching, error recovery, and result synthesis that benefit from an agent abstraction.

Without a standardized agent framework, coordination logic becomes distributed across ad-hoc scripts, hard-coded pipelines, and manual operator intervention. Prismatic Agents centralizes this coordination in a runtime that provides isolation, monitoring, and standardized interfaces while allowing domain experts to define agent behavior declaratively.

### 1.2 Design Goals

1. **Standardized agent definitions** -- all agents follow the AIAD specification, enabling automated indexing, capability discovery, and interoperability.
2. **Five-tier authority hierarchy** -- agents operate within defined authority levels that constrain resource access and decision scope.
3. **[Process isolation](/glossary/process-isolation/)** -- each agent execution runs in a supervised process, preventing failures from cascading across the runtime.
4. **Command routing** -- a registry maps slash commands (e.g., `/archer-supreme`) to agent dispatch with priority ordering.
5. **Doctrine compliance** -- all agents implement the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine enforcement block.
6. **Telemetry integration** -- every agent invocation emits telemetry events for monitoring and performance analysis.

### 1.3 Scope

Prismatic Agents provides the agent runtime, registry, and command dispatch infrastructure. It does not implement the domain-specific logic of individual agents, which reside in their respective application modules. The agent definitions (`.aiad/agents/*.agent.md`) are declarative specifications consumed by the runtime.

## 2. Architecture

### 2.1 System Design

```
User Command ("/archer-supreme fix authentication")
       |
  Command Router (ETS lookup)
       |
  Agent Registry --> Agent Definition (AIAD YAML)
       |
  Dispatch Decision (authority check, capability match)
       |
  Agent Process (supervised Task)
       |
  +----+----+----+----+
  | Tool 1  | Tool 2  | Tool N  |
  | (Read)  | (Edit)  | (Bash)  |
  +---------+---------+---------+
       |
  Result Aggregation
       |
  Telemetry Event + Response
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticAgents.Registry` | ETS-backed agent and command registry; boot-time AIAD scanning |
| `PrismaticAgents.Router` | Command string parsing and agent dispatch routing |
| `PrismaticAgents.Dispatcher` | Agent process creation, execution supervision, timeout enforcement |
| `PrismaticAgents.Authority` | Five-tier authority level enforcement (L1-L5) |
| `PrismaticAgents.ToolAccess` | Tool permission management per [agent tier](/glossary/agent-tier/) |
| `PrismaticAgents.Telemetry` | Agent execution telemetry event emission |
| `PrismaticAgents.AiadParser` | AIAD YAML specification parser and validator |
| `PrismaticAgents.CircuitBreaker` | Per-agent circuit breaker for failure isolation |

### 2.3 Process Topology

```
PrismaticAgents.Application (Supervisor, :one_for_one)
+-- PrismaticAgents.Registry (GenServer)
|     Owns ETS tables for agent definitions and command mappings
+-- PrismaticAgents.Dispatcher (GenServer)
|     Manages agent execution lifecycle and timeout enforcement
+-- PrismaticAgents.CircuitBreaker (GenServer)
|     Tracks per-agent failure counts and circuit states
+-- Task.Supervisor
      Supervises individual agent execution tasks
```

### 2.4 Data Flow

Commands enter through the Router, which parses the command string, resolves the target agent(s) from the Registry, performs authority checks, and hands off to the Dispatcher. The Dispatcher creates a supervised Task for the agent execution, monitors it for timeout, and collects the result. Telemetry events are emitted at dispatch, completion, and error boundaries.

## 3. Implementation

### 3.1 Key Algorithms

**Command Resolution**. The Router tokenizes the command string, extracts the command trigger (e.g., `/archer-supreme`), and performs an O(1) ETS lookup to find matching agent definitions. When multiple agents match (multi-agent commands), they are ordered by priority and executed sequentially or in parallel depending on the command specification.

**Authority Enforcement**. Each agent has an assigned tier (L1-L5). Before dispatch, the Authority module verifies that the agent's tier grants access to the requested tools and resources. L5 agents have unlimited access; L1 agents are restricted to read-only operations and basic validation tools.

### 3.2 Data Structures

```elixir
defmodule PrismaticAgents.AgentDefinition do
  @type t :: %__MODULE__{
    name: String.t(),
    version: String.t(),
    tier: :L1 | :L2 | :L3 | :L4 | :L5,
    description: String.t(),
    capabilities: [atom()],
    tools: [atom()],
    domain: String.t(),
    commands: [String.t()],
    enforcement: %{doctrine: String.t(), compliance: :mandatory | :recommended}
  }
end
```

### 3.3 API Surface

```elixir
# List all registered agents
@spec list_agents(keyword()) :: {:ok, [AgentDefinition.t()]}
PrismaticAgents.list_agents(tier: :L5, domain: "security")

# Execute a command
@spec execute(String.t(), String.t()) :: {:ok, term()} | {:error, term()}
PrismaticAgents.execute("/archer-supreme", "analyze perimeter security for example.com")

# Get agent capabilities
@spec get_capabilities(String.t()) :: {:ok, [atom()]} | {:error, :not_found}
PrismaticAgents.get_capabilities("strategic-command")

# Check agent authority for a tool
@spec authorized?(String.t(), atom()) :: boolean()
PrismaticAgents.authorized?("basic-validator", :bash)
```

### 3.4 Configuration

```elixir
config :prismatic_agents,
  # Agent definitions
  aiad_path: ".aiad/agents/",
  command_path: ".aiad/commands/",

  # Execution
  default_timeout: 120_000,
  max_concurrent_agents: 50,

  # Circuit breaker
  failure_threshold: 5,
  reset_timeout: 60_000,

  # Authority
  tier_tool_access: %{
    L1: [:read, :glob, :grep],
    L2: [:read, :glob, :grep, :edit, :write],
    L3: [:read, :glob, :grep, :edit, :write, :bash],
    L4: [:read, :glob, :grep, :edit, :write, :bash, :web_fetch],
    L5: :all
  }
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Core](/apps/prismatic-core/) | Base entity definitions and configuration |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Agent execution [metrics](/glossary/metrics/) |
| [Prismatic Safety](/apps/prismatic-safety/) | Doctrine compliance enforcement |
| [Prismatic Claude](/apps/prismatic-claude/) | Session lifecycle and stack conversation integration |

### 4.2 Dependents

Every application that defines agents or consumes agent services depends on Prismatic Agents for dispatch and execution. Key consumers include [Prismatic Dark](/apps/prismatic-dark/) (20 color team agents), [Prismatic Perimeter](/apps/prismatic-perimeter/) (discovery and assessment agents), and [Prismatic OSINT Core](/apps/prismatic-osint-core/) (intelligence collection agents).

### 4.3 Inter-Process Communication

Agent dispatch uses supervised Tasks for process isolation. Results are returned via Task.await with configurable timeouts. Agent-to-agent communication is mediated through the Dispatcher to maintain authority boundaries. Telemetry events provide asynchronous [observability](/glossary/observability/).

### 4.4 External Integrations

The AIAD specification files (`.aiad/agents/*.agent.md`) are version-controlled alongside the codebase. The `aiad index` CLI tool generates a machine-readable registry from these files. External AI models (Claude, [Ollama](/glossary/ollama/)) interact with agents through the [Prismatic MCP](/apps/prismatic-mcp/) and [Prismatic Claude](/apps/prismatic-claude/) integration layers.

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Command resolution (ETS lookup) | < 1 microsecond | O(1) hash table lookup |
| Agent dispatch overhead | < 5ms | Process creation + authority check |
| AIAD index scan (434 agents) | 100-200ms | Boot-time one-time cost |
| Concurrent agent limit | 50 | Configurable via `max_concurrent_agents` |

### 5.2 Scalability

The ETS-backed registry supports lock-free concurrent reads. Agent executions are bounded by the concurrent limit and supervised independently, allowing the system to handle burst loads without resource exhaustion. The circuit breaker prevents repeatedly dispatching to failing agents.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 256 MB | 1 GB (with all agents loaded) |
| CPU | 2 cores | 4 cores (for concurrent execution) |

## 6. Testing Strategy

### 6.1 Unit Tests

Registry tests verify correct AIAD parsing, agent lookup, and command resolution. Authority tests verify tier-based access control for all tool combinations. Circuit breaker tests verify state transitions through closed, open, and half-open states.

### 6.2 Integration Tests

End-to-end command dispatch tests exercise the full pipeline from command string through router, dispatcher, agent execution, and result collection. Tests verify timeout enforcement, error handling, and telemetry emission.

### 6.3 Property-Based Testing

StreamData generators produce random command strings and agent configurations to verify that the router always resolves to a valid agent or returns a structured error, and that authority checks are monotonically ordered (L5 > L4 > L3 > L2 > L1).

## 7. Security Considerations

### 7.1 Threat Model

The primary threat is privilege escalation through unauthorized agent dispatch or tool access. The five-tier authority system ensures that agents cannot access tools beyond their tier. Command dispatch requires proper authentication context. Agent definitions are version-controlled and validated at boot time.

### 7.2 Access Control

Agent execution inherits the authentication context of the initiating user or system. L5 (Supreme) agents require explicit operator authorization. All agent invocations are logged to the [audit trail](/glossary/audit-trail/) with full context including command, agent, tools used, and result.

## 8. Operational Considerations

### 8.1 Deployment

Prismatic Agents deploys as part of the umbrella [release](/glossary/release/). Agent definitions are loaded from `.aiad/agents/` at boot time. The registry is rebuilt on each deployment, ensuring consistency with the codebase.

### 8.2 Monitoring

Telemetry events: `[:prismatic, :agents, :dispatch]`, `[:prismatic, :agents, :complete]`, `[:prismatic, :agents, :error]`, `[:prismatic, :agents, :circuit_open]`. Metrics include agent execution counts, latency distributions, success rates, and active agent counts.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Command not found | Missing AIAD definition | Add agent definition to `.aiad/agents/` |
| Agent timeout | Long-running operation | Increase `default_timeout` or optimize agent logic |
| Circuit open | Repeated agent failures | Investigate root cause; reset breaker after fix |
| Authority denied | Agent tier insufficient for tool | Verify agent tier matches required tool access |

## 9. Future Work

Planned enhancements include dynamic agent loading without restart, agent composition (pipelines of agents with data flow), agent versioning with [blue-green deployment](/glossary/blue-green-deployment/), distributed agent execution across cluster nodes, and agent performance profiling with optimization recommendations.

## References

- [AIAD Standard](.aiad/README.md) -- Agent specification standard
- [Agent Registry](.claude/AGENT_REGISTRY.md) -- Complete agent catalog
- [Command Registry](.claude/COMMAND_REGISTRY.md) -- Command catalog with mappings
- [Prismatic Dark](/apps/prismatic-dark/) -- Color team security agents
- [Prismatic Claude](/apps/prismatic-claude/) -- AI integration layer
- [Prismatic Safety](/apps/prismatic-safety/) -- Quality and doctrine enforcement

## Related Agents

- [Elixir Architect](/agents/elixir-architect/) -- Ensures all agent runtime code follows OTP best practices and Elixir architectural standards
- [Evolution Orchestrator Supreme](/agents/evolution-orchestrator-supreme/) -- Drives autonomous evolution of the agent ecosystem through continuous improvement cycles
- [Evolution Analyzer Specialist](/agents/evolution-analyzer-specialist/) -- Analyzes agent performance metrics and fitness scores to identify optimization opportunities

## Related Capabilities

- [AIAD Standard](/capabilities/aiad-standard/) -- The YAML-based specification standard governing all 404 agent definitions, capabilities, and authority tiers
- [Color Teams](/capabilities/color-teams/) -- Six-team adversarial-defensive security operations framework with 20 specialized agents
- [Autonomous Self-Healing](/capabilities/autonomous-self-healing/) -- Enables the agent runtime to detect failures and trigger automatic recovery through circuit breakers and evolution cycles

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)