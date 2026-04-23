+++
title = "Agent Status"
weight = 8
[extra]
description = "Real-time agent health monitoring, activity metrics, and performance telemetry"
category = "agents"
method = "GET"
path = "/api/v1/agents/status"
status = "stable"
auth_required = true
glossary_terms = ["aiad", "quality-dna", "no-mercy", "color-teams"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "2 min"
word_count = 421
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Agent", "Status", "Real-time", "api", "agents", "Prismatic Platform", "Type", "Description", "Filter", "Agent Registry"]
tags = ["api", "agents", "agent-status", "prismatic"]
quality_score = 70
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Agent Status - Prismatic Platform"
+++

## Overview

The Agent Status endpoint provides real-time health monitoring and performance telemetry for the Prismatic Platform's [AIAD](/glossary/aiad/) agent fleet. While the [Agent Registry](/api/agents-list/) provides the static catalog of agents, this endpoint delivers the dynamic operational picture: which agents are actively processing, their current resource consumption, message throughput, error rates, and responsiveness.

This endpoint is designed for operational dashboards, alerting integrations, and automated fleet management. The data is sourced directly from BEAM process telemetry, giving microsecond-accurate measurements of agent behavior without any sampling or approximation.

Agent status data feeds into the platform's autonomous evolution system. When an agent's error rate exceeds configured thresholds or its response latency degrades, the [Quality DNA](/glossary/quality-dna/) system automatically triggers investigation and, if necessary, agent restart or reconfiguration. The [No Mercy](/glossary/no-mercy/) doctrine requires that no agent degradation is tolerated without immediate corrective action.

## Endpoint

```
GET /api/v1/agents/status
```

Returns real-time status and performance metrics for agents. Can report on all agents or a specific subset.

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
| `agent_id` | string | No | all | Specific agent ID for detailed status |
| `domain` | string | No | all | Filter by operational domain |
| `status` | string | No | all | Filter by health status: `healthy`, `degraded`, `unhealthy`, `stopped` |
| `color_team` | string | No | all | Filter by color team |
| `include_metrics` | boolean | No | true | Include detailed performance metrics |
| `metrics_window` | string | No | `5m` | Time window for metrics: `1m`, `5m`, `15m`, `1h`, `24h` |

### Example Request

```
GET /api/v1/agents/status?domain=security&include_metrics=true&metrics_window=15m HTTP/1.1
Host: localhost:4004
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Response

### Success Response (200 OK)

```json
{
  "ok": true,
  "data": {
    "timestamp": "2026-02-12T10:30:00.000Z",
    "fleet_summary": {
      "total_agents": 434,
      "healthy": 428,
      "degraded": 4,
      "unhealthy": 0,
      "stopped": 2,
      "total_processes": 1892,
      "total_memory_mb": 847.3,
      "messages_per_second": 2341,
      "average_latency_ms": 4.2
    },
    "agents": [
      {
        "id": "red-commander",
        "name": "Red Team Commander",
        "domain": "security",
        "tier": "L3",
        "color_team": "red",
        "health": {
          "status": "healthy",
          "since": "2026-02-11T00:00:00.000Z",
          "consecutive_healthy_checks": 17280
        },
        "processes": {
          "count": 4,
          "memory_mb": 12.3,
          "message_queue_length": 0,
          "reductions": 284729481
        },
        "metrics": {
          "window": "15m",
          "messages_received": 342,
          "messages_processed": 340,
          "messages_failed": 2,
          "error_rate": 0.0058,
          "throughput_per_second": 0.38,
          "latency": {
            "p50_ms": 2.1,
            "p90_ms": 8.4,
            "p95_ms": 12.7,
            "p99_ms": 45.2,
            "max_ms": 127.8
          },
          "cpu_utilization": 0.02,
          "gc_runs": 156,
          "gc_reclaimed_bytes": 8421376
        },
        "last_activity": {
          "type": "scenario_evaluation",
          "at": "2026-02-12T10:29:58.000Z",
          "duration_ms": 34.5,
          "result": "success"
        }
      },
      {
        "id": "blue-drift-detector",
        "name": "Blue Team Drift Detector",
        "domain": "security",
        "tier": "L2",
        "color_team": "blue",
        "health": {
          "status": "degraded",
          "since": "2026-02-12T10:25:00.000Z",
          "consecutive_healthy_checks": 0,
          "degradation_reason": "elevated_latency"
        },
        "processes": {
          "count": 2,
          "memory_mb": 24.7,
          "message_queue_length": 47,
          "reductions": 198374621
        },
        "metrics": {
          "window": "15m",
          "messages_received": 891,
          "messages_processed": 844,
          "messages_failed": 0,
          "error_rate": 0.0,
          "throughput_per_second": 0.94,
          "latency": {
            "p50_ms": 45.2,
            "p90_ms": 234.5,
            "p95_ms": 456.7,
            "p99_ms": 892.1,
            "max_ms": 1247.3
          },
          "cpu_utilization": 0.15,
          "gc_runs": 892,
          "gc_reclaimed_bytes": 67108864
        },
        "last_activity": {
          "type": "drift_analysis",
          "at": "2026-02-12T10:30:00.000Z",
          "duration_ms": 456.7,
          "result": "success"
        },
        "alerts": [
          {
            "level": "warning",
            "message": "P95 latency (456.7ms) exceeds threshold (200ms)",
            "triggered_at": "2026-02-12T10:25:00.000Z",
            "auto_remediation": "pending_evaluation"
          }
        ]
      }
    ],
    "domain_health": {
      "security": { "healthy": 18, "degraded": 2, "unhealthy": 0, "stopped": 0 },
      "quality": { "healthy": 45, "degraded": 0, "unhealthy": 0, "stopped": 0 },
      "evolution": { "healthy": 36, "degraded": 2, "unhealthy": 0, "stopped": 0 },
      "perimeter": { "healthy": 28, "degraded": 0, "unhealthy": 0, "stopped": 0 }
    }
  },
  "meta": {
    "request_id": "req_status_001",
    "dispatched_to": "PrismaticAgents.status/0",
    "execution_time_ms": 23
  }
}
```

### Health Status Values

| Status | Meaning | Criteria |
|--------|---------|----------|
| `healthy` | Operating normally | Error rate < 1%, latency within thresholds, no queue buildup |
| `degraded` | Functional with reduced performance | Elevated latency, growing queue, or elevated error rate |
| `unhealthy` | Not processing correctly | Error rate > 5%, process crashes, or unresponsive |
| `stopped` | Intentionally or unintentionally inactive | Process not running |

### Metrics Fields

| Field | Type | Description |
|-------|------|-------------|
| `messages_received` | integer | Total messages received in the window |
| `messages_processed` | integer | Successfully processed messages |
| `messages_failed` | integer | Messages that resulted in errors |
| `error_rate` | number | Ratio of failed to received messages (0.0-1.0) |
| `throughput_per_second` | number | Average messages processed per second |
| `latency.p50_ms` | number | Median processing latency |
| `latency.p99_ms` | number | 99th percentile processing latency |
| `cpu_utilization` | number | CPU usage ratio (0.0-1.0) |
| `gc_runs` | integer | Garbage collection cycles in the window |

## Code Examples

### curl

```bash
# Fleet overview
curl -s -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/agents/status | jq '.data.fleet_summary'

# Specific agent status
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/agents/status?agent_id=red-commander" | jq '.data.agents[0]'

# Find degraded agents
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/agents/status?status=degraded" | \
  jq '.data.agents[] | {id, health: .health.status, reason: .health.degradation_reason}'

# Domain health summary
curl -s -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/agents/status | jq '.data.domain_health'
```

### Elixir

```elixir
# Get fleet status
{:ok, status} = PrismaticAgents.status()
IO.puts("Fleet: #{status.fleet_summary.healthy}/#{status.fleet_summary.total_agents} healthy")

# Monitor specific agent
{:ok, status} = PrismaticAgents.status(agent_id: "red-commander", metrics_window: "1h")
agent = hd(status.agents)
IO.puts("P99 latency: #{agent.metrics.latency.p99_ms}ms")

# Alert on degraded agents
{:ok, status} = PrismaticAgents.status(status: :degraded)
Enum.each(status.agents, fn agent ->
  Logger.warning("Degraded: #{agent.id} - #{agent.health.degradation_reason}")
end)
```

### Python

```python
import requests

headers = {"Authorization": f"Bearer {api_token}"}

# Fleet summary
response = requests.get(
    "http://localhost:4004/api/v1/agents/status",
    headers=headers,
    params={"metrics_window": "15m"}
)

data = response.json()["data"]
summary = data["fleet_summary"]
print(f"Fleet: {summary['healthy']}/{summary['total_agents']} healthy")
print(f"Throughput: {summary['messages_per_second']} msg/s")
print(f"Memory: {summary['total_memory_mb']:.1f} MB")

# Check for alerts
for agent in data["agents"]:
    if "alerts" in agent and agent["alerts"]:
        for alert in agent["alerts"]:
            print(f"ALERT [{alert['level']}] {agent['id']}: {alert['message']}")
```

## Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 404 | `agent_not_found` | Specified agent_id does not exist |
| 422 | `invalid_parameter` | Invalid filter or metrics_window value |
| 429 | `rate_limited` | Request rate limit exceeded |

## Rate Limits

| Limit Type | Value | Window |
|------------|-------|--------|
| Per token | 120 requests | 1 minute |
| Burst | 20 requests | 1 second |

Status data is derived from in-memory telemetry with minimal computation overhead.

## Related Endpoints

- [Agent Registry](/api/agents-list/) -- Static agent catalog with specifications
- [Health Check](/api/health/) -- Platform-level health including agent runtime
- [Webhooks](/api/webhooks/) -- Subscribe to agent health change notifications
- [Error Handling](/api/error-handling/) -- Standard error response format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)