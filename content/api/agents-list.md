+++
title = "Agent Registry"
weight = 7
[extra]
description = "Browse and search the complete registry of 434 AIAD agents across 14 operational domains"
category = "agents"
method = "GET"
path = "/api/v1/agents/list"
status = "stable"
auth_required = true
glossary_terms = ["aiad", "color-teams", "quality-dna", "nabla-infinity"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 584
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Agent", "Registry", "Browse", "AIAD", "api", "agents", "Prismatic Platform", "Filter", "Type", "Description"]
tags = ["api", "agents", "agent-registry", "prismatic"]
quality_score = 67
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Agent Registry - Prismatic Platform"
+++

## Overview

The Agent Registry endpoint provides programmatic access to the complete catalog of [AIAD](@/glossary/aiad.md) (AI-Augmented Intelligence Design) agents deployed on the Prismatic Platform. The registry contains 434 agents organized across 14 operational domains, ranging from security analysis and quality enforcement to autonomous evolution and epistemic verification.

Each agent entry includes its classification tier (L1 through L5), operational domain, capability description, activation status, and runtime metadata. The registry is the authoritative source of truth for agent inventory and is used by the platform's orchestration layer to route tasks to appropriate specialists.

The registry supports filtering by domain, tier, status, and capability keywords, as well as full-text search across agent names and descriptions. This endpoint is essential for building dashboards, monitoring agent fleet health, and integrating agent capabilities into external workflows.

Agents in the registry follow the AIAD specification standard, with each agent defined by a `.agent.md` file that declares its capabilities, authority level, operational constraints, and interaction protocols. The API exposes a JSON projection of this specification.

## Endpoint

```
GET /api/v1/agents/list
```

Returns a paginated list of all registered agents with their metadata.

**Port**: 4004
**Content-Type**: `application/json`

## Authentication

Requires a valid API token with `agents:read` scope.

```
Authorization: Bearer <api_token>
```

## Request

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `domain` | string | No | all | Filter by operational domain (e.g., `security`, `quality`, `evolution`, `perimeter`) |
| `tier` | string | No | all | Filter by agent tier: `L1`, `L2`, `L3`, `L4`, `L5` |
| `status` | string | No | all | Filter by activation status: `active`, `inactive`, `standby` |
| `color_team` | string | No | all | Filter by color team: `red`, `blue`, `purple`, `white`, `gray`, `black` |
| `search` | string | No | none | Full-text search across agent names, descriptions, and capabilities |
| `sort` | string | No | `name` | Sort field: `name`, `domain`, `tier`, `created_at` |
| `order` | string | No | `asc` | Sort order: `asc` or `desc` |
| `page` | integer | No | 1 | Page number |
| `per_page` | integer | No | 50 | Results per page (max 200) |

### Example Request

```
GET /api/v1/agents/list?domain=security&tier=L3&status=active HTTP/1.1
Host: localhost:4004
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Response

### Success Response (200 OK)

```json
{
  "ok": true,
  "data": {
    "total": 434,
    "filtered": 12,
    "page": 1,
    "per_page": 50,
    "pages": 1,
    "agents": [
      {
        "id": "red-commander",
        "name": "Red Team Commander",
        "domain": "security",
        "tier": "L3",
        "classification": "Strategic Commander",
        "status": "active",
        "color_team": "red",
        "description": "Orchestrates adversarial simulation scenarios using five attack primitives. Emits findings to Purple and Blue teams for synthesis and defense.",
        "capabilities": [
          "adversarial_simulation",
          "scenario_orchestration",
          "attack_taxonomy_management",
          "finding_emission"
        ],
        "authority_level": "tactical",
        "operational_constraints": [
          "sandbox_only",
          "synthetic_data_only",
          "no_network_access"
        ],
        "spec_file": ".aiad/agents/red-commander.agent.md",
        "runtime": {
          "process_count": 4,
          "memory_mb": 12.3,
          "messages_processed": 1847,
          "last_active": "2026-02-12T10:29:45.000Z",
          "uptime_seconds": 86400
        },
        "created_at": "2026-01-15T00:00:00.000Z",
        "version": "2.1.0"
      },
      {
        "id": "blue-commander",
        "name": "Blue Team Commander",
        "domain": "security",
        "tier": "L3",
        "classification": "Strategic Commander",
        "status": "active",
        "color_team": "blue",
        "description": "Synthesizes evidence from Blue specialists into unified defensive posture assessments grounded in NABLA axioms.",
        "capabilities": [
          "evidence_synthesis",
          "defensive_posture_assessment",
          "signal_aggregation",
          "drift_detection"
        ],
        "authority_level": "tactical",
        "operational_constraints": [
          "read_only_observation",
          "evidence_based_output_only"
        ],
        "spec_file": ".aiad/agents/blue-commander.agent.md",
        "runtime": {
          "process_count": 4,
          "memory_mb": 14.7,
          "messages_processed": 2103,
          "last_active": "2026-02-12T10:30:01.000Z",
          "uptime_seconds": 86400
        },
        "created_at": "2026-01-15T00:00:00.000Z",
        "version": "2.1.0"
      }
    ],
    "domain_summary": {
      "security": 20,
      "quality": 45,
      "evolution": 38,
      "perimeter": 28,
      "intelligence": 52,
      "storage": 18,
      "web": 22,
      "api": 15,
      "safety": 31,
      "claude": 12,
      "supervisor": 8,
      "garden": 25,
      "promo": 6,
      "infrastructure": 114
    },
    "tier_summary": {
      "L1": 45,
      "L2": 156,
      "L3": 89,
      "L4": 112,
      "L5": 32
    }
  },
  "meta": {
    "request_id": "req_agents_001",
    "dispatched_to": "PrismaticAgents.list/0",
    "execution_time_ms": 45
  }
}
```

### Agent Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique agent identifier (slug format) |
| `name` | string | Human-readable agent name |
| `domain` | string | Operational domain classification |
| `tier` | string | Agent tier: L1 (Worker) through L5 (Supreme) |
| `classification` | string | Role classification within the tier |
| `status` | string | Current activation status |
| `color_team` | string | Color team affiliation (if any) |
| `description` | string | Brief description of the agent's purpose |
| `capabilities` | array | List of capability identifiers |
| `authority_level` | string | Decision-making authority scope |
| `operational_constraints` | array | Restrictions on agent behavior |
| `spec_file` | string | Path to the AIAD specification file |
| `runtime` | object | Runtime metrics (when agent is active) |
| `version` | string | Agent specification version |

### Tier Descriptions

| Tier | Name | Role |
|------|------|------|
| L1 | Worker | Task execution, no autonomous decisions |
| L2 | Specialist | Domain expertise, limited autonomy |
| L3 | Commander | Strategic coordination, team management |
| L4 | Architect | Cross-domain design, policy enforcement |
| L5 | Supreme | Platform-wide authority, crisis management |

## Code Examples

### curl

```bash
# List all agents
curl -s -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/agents/list | jq '.data.total'

# Filter by color team
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/agents/list?color_team=red" | \
  jq '.data.agents[] | {id, name, tier}'

# Search for security-related agents
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/agents/list?search=epistemic" | \
  jq '.data.agents[] | {id, description}'

# Get domain summary
curl -s -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/agents/list | jq '.data.domain_summary'
```

### Elixir

```elixir
# List all agents
{:ok, result} = PrismaticAgents.list()
IO.puts("Total agents: #{result.total}")

# Filter by domain
{:ok, result} = PrismaticAgents.list(domain: :security, tier: :L3)
Enum.each(result.agents, fn agent ->
  IO.puts("#{agent.id}: #{agent.name} (#{agent.tier})")
end)

# Search
{:ok, result} = PrismaticAgents.list(search: "epistemic defense")
```

### Python

```python
import requests

headers = {"Authorization": f"Bearer {api_token}"}

# List all agents with domain filter
response = requests.get(
    "http://localhost:4004/api/v1/agents/list",
    headers=headers,
    params={"domain": "security", "status": "active"}
)

data = response.json()["data"]
print(f"Found {data['filtered']} of {data['total']} agents")

for agent in data["agents"]:
    team = f" [{agent['color_team'].upper()}]" if agent.get("color_team") else ""
    print(f"  {agent['tier']} {agent['id']}{team}: {agent['description'][:80]}")
```

## Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 422 | `invalid_filter` | Invalid filter parameter value |
| 429 | `rate_limited` | Request rate limit exceeded |

See [Error Handling](@/api/error-handling.md) for the standard error response format.

## Rate Limits

| Limit Type | Value | Window |
|------------|-------|--------|
| Per token | 120 requests | 1 minute |
| Burst | 20 requests | 1 second |

The agent registry is cached in ETS and serves responses in under 50ms.

## Related Endpoints

- [Agent Status](@/api/agents-status.md) -- Real-time health and activity metrics for agents
- [Endpoint Discovery](@/api/endpoints.md) -- Find all available agent-related endpoints
- [Health Check](@/api/health.md) -- Check agent runtime health as part of system health

## Agent Architecture

The agent registry reflects the [Color Teams](@/glossary/color-teams.md) organizational structure. Security agents are organized into six color teams (Gray, Red, Blue, Purple, White, Black) with strict information flow protocols. Non-security agents are organized by functional domain.

Each agent's operational constraints are enforced at the process level by the Elixir supervision tree. Sandbox-only agents run in isolated process groups with restricted capability sets. The [Quality DNA](@/glossary/quality-dna.md) system monitors agent performance metrics and triggers autonomous evolution when performance degrades below configured thresholds.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)