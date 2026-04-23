+++
title = "Strategic Command Agents"
weight = 1
[extra]
icon = "command"
color = "purple"
agent_count = 47
commands = ["/orchestrate", "/archer-supreme", "/coordinate"]
description = "Supreme orchestration and multi-domain coordination"
author = "Tomas Korcak (korczis)"
reading_time = "1 min"
word_count = 181
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Strategic", "Command", "Agents", "Supreme", "Prismatic Platform", "Cross", "Multi", "Real", "Domain", "Overview"]
tags = ["agents", "strategic-command-agents", "prismatic"]
quality_score = 37
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Strategic Command Agents - Prismatic Platform"
+++

## Overview

[Strategic Command](/glossary/strategic-command/) agents form the apex of the Prismatic agent hierarchy. These L3-L5 agents coordinate complex multi-agent operations, manage mission-critical decisions, and maintain platform-wide coherence.

## Agent Roster

| Agent | Level | Role | Specialization |
|-------|-------|------|----------------|
| **supreme-commander** | L5 | Platform Authority | Cross-domain strategic decisions |
| **archer-supreme** | L4 | Crisis Commander | Impossible missions, zero-error requirements |
| **strategic-command** | L4 | Mission Planner | Multi-phase operation coordination |
| **archer-command-center** | L4 | Tactical Hub | Real-time mission control |
| **tactical-command** | L3 | Field Operations | Domain-specific [tactical execution](/glossary/tactical-execution/) |

## Key Capabilities

### Multi-Agent Orchestration
- Spawn and coordinate up to 12 parallel agents
- Dynamic resource allocation based on mission parameters
- Real-time progress monitoring and course correction
- Automatic escalation on failure conditions

### Decision Authority
- L5: Platform-wide strategic changes
- L4: Cross-domain operational decisions
- L3: Domain-specific tactical choices

### Command Interface

```elixir
# Supreme orchestration
{:ok, result} = Prismatic.Orchestrate.run("investigate target company")

# ARCHER SUPREME activation
{:ok, mission} = Prismatic.ArcherSupreme.execute(%{
  objective: "complete security audit",
  constraints: [:zero_errors, :time_bound],
  max_agents: 12
})
```

## Integration Points

- **[Quality Gates](/glossary/quality-gates/)**: All strategic decisions pass [Trinity Gate](/glossary/trinity-gate/) verification
- **Epistemic Framework**: [NABLA Infinity](/glossary/nabla-infinity/) 7-axiom compliance
- **[Audit Trail](/glossary/audit-trail/)**: Immutable decision logging with provenance

## Commands

| Command | Description | Authority |
|---------|-------------|-----------|
| `/orchestrate` | Multi-agent task orchestration | L3+ |
| `/archer-supreme` | Crisis/impossible mission activation | L4 |
| `/coordinate` | Cross-domain coordination | L3+ |
| `/emergency` | Emergency response [protocol](/glossary/protocol/) | L4 |

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)