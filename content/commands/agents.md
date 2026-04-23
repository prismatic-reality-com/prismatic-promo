+++
title = "/agents"
weight = 860
[extra]
category = "Operations"
description = "List and manage agent ecosystem with status monitoring"
syntax = "/agents [options]"
authority = "L2+"
agent = "supreme-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1200
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["agents", "List", "commands", "Operations", "Prismatic Platform", "Agent", "AIAD", "Domain"]
tags = ["commands", "operations", "agents", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/agents - Prismatic Platform"
+++

## Overview

The **/agents** command provides comprehensive discovery, listing, and management capabilities for the 400+ [AIAD](/glossary/aiad/) agents that constitute the Prismatic Platform's autonomous intelligence ecosystem. As the primary interface for agent ecosystem visibility, this command enables operators to search agents by domain, inspect individual agent capabilities, monitor agent health and status, and retrieve statistical summaries of the entire agent fleet. In a platform where agents are the fundamental units of autonomous execution, understanding the available agent landscape is essential for effective orchestration and task delegation.

The scale of the Prismatic Platform's agent ecosystem demands dedicated tooling for discovery and management. With agents spanning over a dozen specialized domains -- from OSINT intelligence operations and storage architecture to security operations and developer experience -- finding the right agent for a specific task requires structured search and filtering capabilities. The `/agents` command addresses this need by providing multiple query modes: domain-based filtering, keyword search, individual agent inspection, capability matching, and aggregate statistics. Each query mode returns structured output designed for both human consumption and programmatic integration.

The command is coordinated by the `supreme-coordinator` agent, reflecting its cross-domain nature. Unlike commands that operate within a single domain, the `/agents` command must have visibility across all agent domains, hierarchies, and classifications. The supreme-coordinator brings the authority and cross-domain awareness necessary to present a unified view of the entire agent ecosystem, including agents at every authority level from L4 Tactical Specialists through SUPREME and COSMIC clearance levels.

## Usage

```bash
/agents [ACTION] [FILTER or AGENT-ID]
```

### List All Agents in the Ecosystem

```bash
/agents list
```

### Search Agents by Domain or Keyword

```bash
/agents search osint
```

### Display Detailed Information for a Specific Agent

```bash
/agents show intel-osint-specialist
```

### List Agent Capabilities Within a Domain

```bash
/agents capabilities storage
```

### Check Health and Status of All Agents

```bash
/agents status
```

### Retrieve Aggregate Agent Statistics

```bash
/agents stats
```

## Options and Parameters

| Parameter | Position | Required | Type | Default | Description |
|-----------|----------|----------|------|---------|-------------|
| `action` | 1 | No | string | `list` | Action to perform: `list`, `search`, `show`, `capabilities`, `status`, `stats` |
| `filter_or_id` | 2 | No | string | -- | Filter pattern for `search`, agent ID for `show`, domain for `capabilities` |

### Action Descriptions

| Action | Purpose | Output |
|--------|---------|--------|
| `list` | Display all agents grouped by domain | Hierarchical domain-grouped agent listing |
| `search` | Find agents matching a keyword or pattern | Filtered agent list with relevance indicators |
| `show` | Detailed view of a single agent | Full agent specification, capabilities, and history |
| `capabilities` | List capabilities within a domain | Capability matrix for the specified domain |
| `status` | Health monitoring dashboard | Agent health, uptime, and error rates |
| `stats` | Aggregate statistics | Total counts, domain distribution, authority breakdown |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ (Operational and above) |
| **Executing Agent** | `supreme-coordinator` |
| **Status** | Production |
| **Usage Frequency** | Medium |
| **Category** | Operations |
| **Model** | claude-sonnet-4-20250514 |
| **Tools** | Read, Grep, Glob, Bash |
| **AIAD Version** | 1.0.0 |
| **Agent Registry** | `.claude/AGENT_REGISTRY.md` |

## Technical Implementation

The `/agents` command operates by scanning the AIAD agent specification directory (`.aiad/agents/`) and the agent registry (`.claude/AGENT_REGISTRY.md`) to build a comprehensive view of the agent ecosystem. Agent specifications are parsed from their `.agent.md` files, extracting metadata including domain classification, authority level, capabilities, version, and status. The implementation leverages the platform's Git Trees infrastructure for high-performance file discovery.

```elixir
defmodule PrismaticAgents.Discovery.Command do
  @moduledoc """
  Agent discovery and management command handler.
  Provides comprehensive agent ecosystem visibility with
  multi-domain search, filtering, and health monitoring.
  """

  @agent_spec_dir ".aiad/agents/"
  @agent_registry ".claude/AGENT_REGISTRY.md"

  @spec list(keyword()) :: {:ok, map()}
  def list(opts \\ []) do
    agents =
      discover_all_agents()
      |> group_by_domain()
      |> apply_filters(opts)
      |> sort_by_authority()

    {:ok, %{
      total: count_total(agents),
      domains: map_size(agents),
      agents_by_domain: agents
    }}
  end

  @spec search(String.t()) :: {:ok, [map()]}
  def search(pattern) do
    results =
      discover_all_agents()
      |> Enum.filter(&matches_pattern?(&1, pattern))
      |> Enum.sort_by(& &1.relevance_score, :desc)

    {:ok, results}
  end

  @spec show(String.t()) :: {:ok, map()} | {:error, :not_found}
  def show(agent_id) do
    case find_agent_by_id(agent_id) do
      nil -> {:error, :not_found}
      agent -> {:ok, parse_full_specification(agent)}
    end
  end

  defp discover_all_agents do
    Path.wildcard(Path.join(@agent_spec_dir, "*.agent.md"))
    |> Enum.map(&parse_agent_spec/1)
    |> Enum.reject(&is_nil/1)
  end

  defp group_by_domain(agents) do
    Enum.group_by(agents, & &1.domain)
  end
end
```

The output format varies by action. The `list` action produces a hierarchical view grouped by domain, with each domain showing its agent count and the individual agents within it. The `search` action returns a flat list sorted by relevance. The `show` action returns the complete parsed specification for a single agent. The `stats` action computes aggregate metrics including total agent count, domain distribution, authority level breakdown, and status distribution.

### Domain Categories

The agent ecosystem is organized into the following primary domains, each containing specialized agents with domain-specific capabilities:

| Domain | Description | Agent Count Range |
|--------|-------------|-------------------|
| Supreme Command | Platform-wide coordination and strategic operations | 5-10 |
| Strategic Planning | Long-term architecture and roadmap planning | 10-20 |
| Tactical Operations | Execution-level task coordination | 20-30 |
| OSINT Intelligence | Open-source intelligence gathering and analysis | 40-50 |
| Storage & Database | Data persistence, caching, and query optimization | 25-35 |
| Web & Frontend | LiveView, TailwindCSS, and UI components | 15-25 |
| Analytics & Intelligence | Data analysis, reporting, and ML integration | 15-25 |
| Testing & QA | Test generation, quality assurance, and validation | 20-30 |
| Documentation | Technical writing, ADRs, and knowledge management | 10-15 |
| DevOps & CI/CD | Deployment, monitoring, and infrastructure | 15-25 |
| Security | Vulnerability analysis, compliance, and defense | 20-30 |
| Performance | Optimization, profiling, and benchmarking | 10-15 |
| Evolution | Self-improvement, meta-evolution, and adaptation | 10-15 |
| Color Teams | Red, Blue, Purple, Gray, White, Black team operations | 20 |

## Workflow Integration

The `/agents` command is a starting point for many platform workflows. Before initiating a complex operation, operators use `/agents search` to identify which agents are available for the task at hand. For example, before launching an OSINT investigation, an operator might run `/agents capabilities osint` to understand which intelligence-gathering capabilities are available.

The command is also essential for platform administration. Running `/agents status` regularly provides early warning of agent health issues, enabling proactive intervention before degraded agents impact operations. The `stats` action supports capacity planning by revealing the distribution of agents across domains and identifying areas where additional agent coverage may be needed.

During development sessions, `/agents show <agent-id>` provides the detailed specification needed to understand how to invoke a specific agent, what parameters it accepts, and what outputs it produces. This eliminates the need to manually navigate the AIAD specification directory and parse raw markdown files.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Primary target of discovery and management operations |
| AIAD Registry | Source of agent specifications and metadata |
| [Quality Gates](/glossary/quality-gates/) | Pre/post execution quality validation |
| [Telemetry](/glossary/telemetry/) | Command execution [metrics](/glossary/metrics/) and agent health tracking |
| [Session Context](/glossary/session-discipline/) | Agent discovery results logged in session context |
| [/orchestrate](/commands/orchestrate/) | Multi-agent orchestration uses agent discovery for task assignment |
| [/aiad-dashboard](/commands/aiad-dashboard/) | Dashboard displays agent metrics discovered by this command |
| [Mycelial Network](/glossary/mycelial-network/) | Agent coordination patterns visible through network topology |

## Doctrine Compliance

All agent management operations are governed by the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Agent discovery must be complete and accurate. No agents are omitted from results due to performance shortcuts or lazy enumeration. The `list` action returns every agent in the ecosystem without exception. The `status` action reports honest health metrics including degraded and failed agents -- no status whitewashing.
- **NO DOUBTS**: Agent specifications are parsed and validated before presentation. When the `show` action displays an agent's capabilities, those capabilities are verified against the actual agent specification file. Discrepancies between the registry and individual specification files are flagged rather than silently resolved. Evidence-based health metrics are derived from actual [telemetry](/glossary/telemetry/) data, not assumptions.

## Best Practices

1. **Start with search before orchestration**: Before invoking complex multi-agent operations, use `/agents search` to verify that the required agents exist and are in production status. This prevents orchestration failures due to referencing agents that are experimental or deprecated.

2. **Monitor agent health regularly**: Run `/agents status` at the beginning of each development session to identify any agents that may have degraded since the last session. Proactive health monitoring prevents cascading failures in multi-agent workflows.

3. **Use domain filtering for focused discovery**: When working within a specific domain, use `/agents capabilities <domain>` rather than the full `list` action. This provides a more focused view and reduces cognitive load.

4. **Inspect before invoking unfamiliar agents**: For agents you have not worked with previously, use `/agents show <agent-id>` to understand the agent's full specification, including authority requirements, tool access, and expected inputs/outputs.

5. **Track agent statistics over time**: Periodic `/agents stats` snapshots reveal the growth and evolution of the agent ecosystem, helping identify trends in domain coverage and overall platform capability.

## Related Commands

- [/aiad-dashboard](/commands/aiad-dashboard/) - AIAD dashboard for intelligence and domain monitoring
- [/orchestrate](/commands/orchestrate/) - Multi-agent orchestration for complex operations
- [/commit](/commands/commit/) - Smart commit with quality gates and conventional format
- [/connect](/commands/connect/) - MCP server connection management across 14+ servers
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)