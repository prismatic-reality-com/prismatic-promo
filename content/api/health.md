+++
title = "Health Check Endpoint"
weight = 1
[extra]
description = "System health verification endpoint returning component status, uptime metrics, and platform readiness"
category = "core"
method = "GET"
path = "/api/v1/health"
status = "stable"
auth_required = false
glossary_terms = ["easm", "aiad", "quality-dna"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 608
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Health", "Check", "Endpoint", "System", "api", "core", "Prismatic Platform", "Health Check", "Rate Limiting"]
tags = ["api", "core", "health-check-endpoint", "prismatic"]
quality_score = 70
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Health Check Endpoint - Prismatic Platform"
+++

## Overview

The Health Check endpoint provides comprehensive system status information for the Prismatic Platform. Unlike simple ping endpoints that return a static 200 OK, this endpoint performs active checks against all critical subsystems and returns a detailed health report. Load balancers, monitoring systems, orchestration layers, and human operators all rely on this endpoint to determine whether the platform is ready to accept traffic and process requests.

The health check follows the Health Check Response Format for HTTP APIs pattern, returning structured JSON that differentiates between overall system health and individual component status. Each component reports its own state independently, allowing operators to identify degraded subsystems without losing visibility into what remains functional.

This endpoint is one of only two unauthenticated routes in the entire API surface (the other being the [OpenAPI specification](/api/openapi-spec/)). This design decision ensures that external monitoring systems can probe platform health without requiring credential management.

## Endpoint

```
GET /api/v1/health
```

Returns the current health status of the Prismatic Platform, including individual component checks, memory usage, uptime, and version information.

**Port**: 4004 (default API gateway port)
**Content-Type**: `application/json`

## Authentication

No authentication required. This endpoint is publicly accessible to support integration with load balancers, health monitoring systems, and container orchestration platforms (Kubernetes liveness/readiness probes, Fly.io health checks).

While unauthenticated, the endpoint is rate-limited to prevent abuse. See the [Rate Limiting](/api/rate-limiting/) page for details.

## Request

### Parameters

This endpoint accepts no parameters. The health check always performs a full system assessment.

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Accept` | No | Defaults to `application/json`. Only JSON is supported. |

### Example Request

```
GET /api/v1/health HTTP/1.1
Host: localhost:4004
Accept: application/json
```

## Response

### Success Response (200 OK)

Returned when all critical components are healthy. Non-critical components may report degraded status without affecting the overall health determination.

```json
{
  "status": "healthy",
  "version": "7.5.0",
  "uptime_seconds": 86472,
  "timestamp": "2026-02-12T10:30:00.000Z",
  "components": {
    "database": {
      "status": "healthy",
      "latency_ms": 2.3,
      "connections": {
        "active": 12,
        "idle": 38,
        "max": 50
      }
    },
    "ets_registry": {
      "status": "healthy",
      "tables": 847,
      "memory_mb": 124.5
    },
    "agent_runtime": {
      "status": "healthy",
      "active_agents": 434,
      "domains": 14,
      "processes": 1892
    },
    "scanner": {
      "status": "healthy",
      "discovered_endpoints": 312,
      "last_scan": "2026-02-12T10:00:00.000Z"
    },
    "redis": {
      "status": "healthy",
      "latency_ms": 0.8,
      "memory_mb": 256.2
    },
    "meilisearch": {
      "status": "healthy",
      "indexed_documents": 48291,
      "latency_ms": 4.1
    }
  },
  "beam": {
    "schedulers": 16,
    "process_count": 24891,
    "memory_mb": 2048.7,
    "uptime_seconds": 86472
  }
}
```

### Degraded Response (200 OK)

Returned when non-critical components are unavailable but the system can still process requests.

```json
{
  "status": "degraded",
  "version": "7.5.0",
  "uptime_seconds": 86472,
  "timestamp": "2026-02-12T10:30:00.000Z",
  "components": {
    "database": { "status": "healthy", "latency_ms": 2.3 },
    "ets_registry": { "status": "healthy" },
    "agent_runtime": { "status": "healthy" },
    "scanner": { "status": "healthy" },
    "redis": { "status": "degraded", "error": "connection_timeout" },
    "meilisearch": { "status": "unavailable", "error": "connection_refused" }
  },
  "degraded_components": ["redis", "meilisearch"]
}
```

### Unhealthy Response (503 Service Unavailable)

Returned when one or more critical components (database, ETS registry, scanner) are unavailable.

```json
{
  "status": "unhealthy",
  "version": "7.5.0",
  "uptime_seconds": 86472,
  "timestamp": "2026-02-12T10:30:00.000Z",
  "components": {
    "database": { "status": "unavailable", "error": "connection_refused" },
    "ets_registry": { "status": "healthy" },
    "agent_runtime": { "status": "degraded" },
    "scanner": { "status": "healthy" },
    "redis": { "status": "healthy" },
    "meilisearch": { "status": "healthy" }
  },
  "critical_failures": ["database"]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Overall platform health: `healthy`, `degraded`, or `unhealthy` |
| `version` | string | Current platform version (semantic versioning) |
| `uptime_seconds` | integer | Seconds since the BEAM VM started |
| `timestamp` | string | ISO 8601 timestamp of the health check |
| `components` | object | Individual component health reports |
| `beam` | object | BEAM VM runtime statistics |
| `degraded_components` | array | List of non-critical degraded component names (only present when degraded) |
| `critical_failures` | array | List of critical failed component names (only present when unhealthy) |

### Component Status Values

| Status | Meaning |
|--------|---------|
| `healthy` | Component is operating normally |
| `degraded` | Component is partially functional with reduced performance |
| `unavailable` | Component is not responding |

## Code Examples

### curl

```bash
# Basic health check
curl -s http://localhost:4004/api/v1/health | jq .

# Check only the status field
curl -s http://localhost:4004/api/v1/health | jq '.status'

# Monitor health with watch (every 5 seconds)
watch -n 5 'curl -s http://localhost:4004/api/v1/health | jq ".status, .components | to_entries[] | {(.key): .value.status}"'

# Use in scripts for readiness checks
if [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4004/api/v1/health)" -eq 200 ]; then
  echo "Platform is healthy"
fi
```

### Elixir

```elixir
# Using the internal API (within the platform)
{:ok, health} = PrismaticApi.HealthController.check()

# Using HTTPoison for external access
{:ok, response} = HTTPoison.get("http://localhost:4004/api/v1/health")
health = Jason.decode!(response.body)

case health["status"] do
  "healthy" -> :ok
  "degraded" -> Logger.warning("Platform degraded: #{inspect(health["degraded_components"])}")
  "unhealthy" -> Logger.error("Platform unhealthy: #{inspect(health["critical_failures"])}")
end
```

### Python

```python
import requests

response = requests.get("http://localhost:4004/api/v1/health")
health = response.json()

if health["status"] == "healthy":
    print(f"Platform v{health['version']} is healthy")
    print(f"Uptime: {health['uptime_seconds'] // 3600} hours")
    print(f"Active agents: {health['components']['agent_runtime']['active_agents']}")
elif health["status"] == "degraded":
    print(f"Degraded components: {health.get('degraded_components', [])}")
else:
    print(f"CRITICAL: {health.get('critical_failures', [])}")
```

## Error Responses

| Status Code | Condition | Description |
|-------------|-----------|-------------|
| 200 | System healthy or degraded | Health report returned successfully |
| 429 | Rate limit exceeded | Too many health check requests (see [Rate Limiting](/api/rate-limiting/)) |
| 503 | System unhealthy | One or more critical components have failed |

The health endpoint itself does not return 500 errors. If the API process is running, it will always return either 200 or 503. If the API process is down entirely, the TCP connection will be refused at the network level.

## Rate Limits

| Limit Type | Value | Window |
|------------|-------|--------|
| Per IP | 60 requests | 1 minute |
| Global | 600 requests | 1 minute |
| Burst | 10 requests | 1 second |

Health check rate limits are more generous than standard API endpoints to accommodate monitoring systems that poll frequently.

## Related Endpoints

- [Endpoint Discovery](/api/endpoints/) -- List all available API endpoints
- [OpenAPI Specification](/api/openapi-spec/) -- Full API schema including health check schema
- [Error Handling](/api/error-handling/) -- Standard error response format
- [Rate Limiting](/api/rate-limiting/) -- Rate limit policies and headers

## Integration Patterns

### Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /api/v1/health
    port: 4004
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/v1/health
    port: 4004
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 1
```

### Fly.io Health Check

```toml
[[services.http_checks]]
  interval = "15s"
  timeout = "5s"
  grace_period = "30s"
  method = "GET"
  path = "/api/v1/health"
```

The health endpoint is the foundation of the platform's observability story. It feeds into the [Quality DNA](/glossary/quality-dna/) system and provides the baseline metrics that the [AIAD](/glossary/aiad/) agent framework uses to assess platform stability.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)