+++
title = "Batch API Operations"
weight = 15
[extra]
description = "Bulk endpoint calls, parallel dispatch, transaction boundaries, and result aggregation"
category = "infrastructure"
method = "POST"
path = "/api/v1/batch"
status = "beta"
auth_required = true
glossary_terms = ["aiad", "no-mercy", "trinity-gate", "easm"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 960
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Batch", "API", "Operations", "Bulk", "infrastructure", "Prismatic Platform", "Description"]
tags = ["api", "infrastructure", "batch-api-operations", "prismatic"]
quality_score = 80
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Batch API Operations - Prismatic Platform"
+++

## Overview

The Batch Operations endpoint allows clients to bundle multiple API calls into a single HTTP request. Instead of making 50 individual requests to rate 50 domains, a client sends one batch request containing all 50 operations. The platform dispatches them in parallel using the BEAM's lightweight process model, collects the results, and returns them in a single response.

Batch operations address two practical problems. First, they reduce HTTP overhead: connection setup, TLS handshake, header serialization, and round-trip latency are paid once instead of per operation. Second, they simplify rate limit management: a batch of 50 operations counts as one request against the batch endpoint's rate limit, not 50 requests against 50 individual endpoint limits.

The batch system leverages Elixir's `Task.async_stream/3` to dispatch operations concurrently across available BEAM schedulers. Each operation in the batch is executed independently, so a failure in one operation does not affect the others. Results are returned in the same order as the input operations, with each result including its own success/error status.

Batch operations are particularly valuable for [EASM](@/glossary/easm.md) workflows that need to rate or scan multiple domains, agent fleet management operations that target multiple agents, and monitoring integrations that need to check multiple endpoints simultaneously.

## Endpoint

```
POST /api/v1/batch
```

Executes multiple API operations in a single request with parallel dispatch.

**Port**: 4004
**Content-Type**: `application/json`

## Authentication

Requires a valid API token. The token must have appropriate scopes for each operation in the batch. If the token lacks scope for any operation, that individual operation returns a 403 error in the results while other operations proceed normally.

```
Authorization: Bearer <api_token>
```

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token with scopes for all included operations |
| `Content-Type` | Yes | Must be `application/json` |
| `X-Request-ID` | No | Client-provided correlation ID |

### Body Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `operations` | array | Yes | -- | Array of operation descriptors (max 100) |
| `options.parallel` | boolean | No | true | Execute operations in parallel (false for sequential) |
| `options.stop_on_error` | boolean | No | false | Stop remaining operations after first error (sequential only) |
| `options.timeout_ms` | integer | No | 60000 | Overall batch timeout in milliseconds |

### Operation Descriptor

Each operation in the batch describes a single API call:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Client-assigned operation ID (returned in results for correlation) |
| `method` | string | Yes | HTTP method: `GET` or `POST` |
| `path` | string | Yes | API path (e.g., `/api/v1/perimeter/rating`) |
| `params` | object | No | Query parameters (for GET) or body parameters (for POST) |

### Example Request Body

```json
{
  "operations": [
    {
      "id": "rate-domain-1",
      "method": "GET",
      "path": "/api/v1/perimeter/rating",
      "params": { "domain": "example.com" }
    },
    {
      "id": "rate-domain-2",
      "method": "GET",
      "path": "/api/v1/perimeter/rating",
      "params": { "domain": "example.org" }
    },
    {
      "id": "rate-domain-3",
      "method": "GET",
      "path": "/api/v1/perimeter/rating",
      "params": { "domain": "example.net" }
    },
    {
      "id": "scan-domain-1",
      "method": "POST",
      "path": "/api/v1/perimeter/discover",
      "params": {
        "domain": "example.com",
        "options": { "passive_only": true }
      }
    },
    {
      "id": "agent-status",
      "method": "GET",
      "path": "/api/v1/agents/status",
      "params": { "domain": "security" }
    }
  ],
  "options": {
    "parallel": true,
    "timeout_ms": 60000
  }
}
```

## Response

### Success Response (200 OK)

The response contains results for every operation in the batch, in the same order as the input. Each result includes the original operation ID, the HTTP status code, and the response body.

```json
{
  "ok": true,
  "data": {
    "batch_id": "batch_2026021210300001",
    "total_operations": 5,
    "succeeded": 4,
    "failed": 1,
    "execution_time_ms": 2847,
    "results": [
      {
        "id": "rate-domain-1",
        "status": 200,
        "ok": true,
        "data": {
          "domain": "example.com",
          "rating": { "grade": "B", "score": 780 }
        },
        "execution_time_ms": 234
      },
      {
        "id": "rate-domain-2",
        "status": 200,
        "ok": true,
        "data": {
          "domain": "example.org",
          "rating": { "grade": "A", "score": 870 }
        },
        "execution_time_ms": 189
      },
      {
        "id": "rate-domain-3",
        "status": 404,
        "ok": false,
        "error": {
          "code": "no_scan_data",
          "message": "No discovery data available for example.net"
        },
        "execution_time_ms": 12
      },
      {
        "id": "scan-domain-1",
        "status": 200,
        "ok": true,
        "data": {
          "domain": "example.com",
          "scan_id": "scan_2026021210300042",
          "summary": { "total_assets": 23, "risk_score": 72.4 }
        },
        "execution_time_ms": 2341
      },
      {
        "id": "agent-status",
        "status": 200,
        "ok": true,
        "data": {
          "fleet_summary": { "total_agents": 20, "healthy": 18, "degraded": 2 }
        },
        "execution_time_ms": 23
      }
    ]
  },
  "meta": {
    "request_id": "req_batch_001",
    "execution_time_ms": 2847
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data.batch_id` | string | Unique batch execution identifier |
| `data.total_operations` | integer | Number of operations in the batch |
| `data.succeeded` | integer | Number of operations that returned 2xx |
| `data.failed` | integer | Number of operations that returned 4xx or 5xx |
| `data.execution_time_ms` | number | Total batch execution wall-clock time |
| `data.results` | array | Per-operation results (same order as input) |
| `data.results[].id` | string | Client-assigned operation ID (from input) |
| `data.results[].status` | integer | HTTP status code for this operation |
| `data.results[].ok` | boolean | Whether the operation succeeded |
| `data.results[].data` | object | Operation response data (on success) |
| `data.results[].error` | object | Operation error details (on failure) |
| `data.results[].execution_time_ms` | number | Per-operation execution time |

## Batch Limits

| Limit | Value | Description |
|-------|-------|-------------|
| Maximum operations per batch | 100 | Hard limit per request |
| Maximum request body size | 1 MB | Total batch request payload |
| Maximum batch timeout | 120 seconds | Overall batch execution timeout |
| Per-operation timeout | 30 seconds | Individual operation timeout |

## Transaction Semantics

Batch operations do **not** provide transactional guarantees. Each operation executes independently:

- **No atomicity**: Operations do not roll back if others fail
- **No ordering guarantees** in parallel mode: Operations may complete in any order (results are reordered to match input order)
- **Independent error handling**: Each operation succeeds or fails independently
- **Independent rate limiting**: Individual operations within a batch are checked against per-endpoint rate limits

For workflows requiring transactional behavior, use sequential mode (`"parallel": false`) with `"stop_on_error": true` and implement compensating transactions in the client.

## Code Examples

### curl

```bash
# Batch rate multiple domains
curl -s -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      {"id": "d1", "method": "GET", "path": "/api/v1/perimeter/rating", "params": {"domain": "example.com"}},
      {"id": "d2", "method": "GET", "path": "/api/v1/perimeter/rating", "params": {"domain": "example.org"}},
      {"id": "d3", "method": "GET", "path": "/api/v1/perimeter/rating", "params": {"domain": "example.net"}}
    ]
  }' \
  http://localhost:4004/api/v1/batch | jq '.data.results[] | {id, grade: .data.rating.grade}'

# Batch with mixed endpoint types
curl -s -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      {"id": "health", "method": "GET", "path": "/api/v1/health"},
      {"id": "agents", "method": "GET", "path": "/api/v1/agents/list", "params": {"domain": "security"}},
      {"id": "rating", "method": "GET", "path": "/api/v1/perimeter/rating", "params": {"domain": "example.com"}}
    ]
  }' \
  http://localhost:4004/api/v1/batch | jq '.data | {succeeded, failed, execution_time_ms}'
```

### Elixir

```elixir
# Build a batch of rating checks
domains = ["example.com", "example.org", "example.net", "example.edu"]

operations = Enum.map(domains, fn domain ->
  %{
    id: "rate-#{domain}",
    method: "GET",
    path: "/api/v1/perimeter/rating",
    params: %{domain: domain}
  }
end)

{:ok, response} = HTTPoison.post(
  "http://localhost:4004/api/v1/batch",
  Jason.encode!(%{operations: operations}),
  [{"Authorization", "Bearer #{token}"}, {"Content-Type", "application/json"}]
)

%{"data" => %{"results" => results}} = Jason.decode!(response.body)

Enum.each(results, fn result ->
  case result do
    %{"ok" => true, "data" => %{"rating" => %{"grade" => grade}}} ->
      IO.puts("#{result["id"]}: #{grade}")
    %{"ok" => false, "error" => %{"message" => msg}} ->
      IO.puts("#{result["id"]}: ERROR - #{msg}")
  end
end)
```

### Python

```python
import requests

headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}

# Batch rate 50 domains
domains = [f"domain{i}.com" for i in range(50)]

operations = [
    {
        "id": f"rate-{domain}",
        "method": "GET",
        "path": "/api/v1/perimeter/rating",
        "params": {"domain": domain}
    }
    for domain in domains
]

response = requests.post(
    "http://localhost:4004/api/v1/batch",
    headers=headers,
    json={"operations": operations, "options": {"parallel": True}}
)

batch = response.json()["data"]
print(f"Batch completed: {batch['succeeded']}/{batch['total_operations']} succeeded "
      f"in {batch['execution_time_ms']}ms")

# Process results
for result in batch["results"]:
    if result["ok"]:
        rating = result["data"]["rating"]
        print(f"  {result['id']}: {rating['grade']} ({rating['score']})")
    else:
        print(f"  {result['id']}: ERROR - {result['error']['message']}")
```

## Error Responses

### Batch-Level Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_batch` | Batch request format is invalid |
| 400 | `too_many_operations` | Exceeded 100 operations per batch |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 408 | `batch_timeout` | Overall batch execution exceeded timeout |
| 413 | `request_too_large` | Request body exceeds 1 MB limit |
| 429 | `rate_limited` | Batch endpoint rate limit exceeded |

### Operation-Level Errors

Individual operations within a batch can return any error documented in [Error Handling](@/api/error-handling.md). These errors are contained within the operation's result object and do not affect the batch response status code (which is always 200 if the batch itself was valid).

## Rate Limits

| Limit Type | Value | Window |
|------------|-------|--------|
| Per token | 30 requests | 1 minute |
| Burst | 5 requests | 1 second |
| Max operations | 100 | Per batch request |

Note: Individual operations within a batch are still checked against their per-endpoint rate limits. If an operation within a batch exceeds its endpoint limit, that operation returns 429 while other operations proceed.

## Related Endpoints

- [Generic Dispatch](@/api/dispatch.md) -- Single-operation dispatch (what batch operations call internally)
- [Endpoint Discovery](@/api/endpoints.md) -- Find available paths for batch operations
- [Rate Limiting](@/api/rate-limiting.md) -- Understand per-endpoint limits within batches
- [Error Handling](@/api/error-handling.md) -- Error format for individual batch operation failures
- [Attack Surface Discovery](@/api/perimeter-discover.md) -- Common batch target for multi-domain scanning
- [Security Rating](@/api/perimeter-rating.md) -- Common batch target for multi-domain rating

## Performance Characteristics

Batch operations benefit from the BEAM VM's lightweight process model. Each operation in a parallel batch spawns a dedicated Elixir process (approximately 2KB of memory per process). For a batch of 100 operations, this means approximately 200KB of additional memory overhead, with all operations executing concurrently across available CPU cores.

The total batch execution time is approximately equal to the slowest individual operation plus a small overhead for result aggregation (typically under 5ms). A batch of 50 rating lookups that each take 200ms completes in approximately 205ms rather than 10,000ms.

The [Trinity Gate](@/glossary/trinity-gate.md) validates that batch results maintain consistency: every operation in a batch produces the same result it would produce if called individually. No cross-operation interference is permitted, and the [No Mercy](@/glossary/no-mercy.md) doctrine ensures that partial batch failures are reported transparently rather than masked.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)