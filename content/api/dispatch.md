+++
title = "Generic Dispatch Architecture"
weight = 3
[extra]
description = "How {app, action} tuples resolve to module function calls via safe_apply with timeout protection"
category = "core"
method = "N/A"
path = "/api/v1/:app/:action"
status = "stable"
auth_required = true
glossary_terms = ["aiad", "trinity-gate", "no-mercy"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 857
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Generic", "Dispatch", "Architecture", "action", "tuples", "resolve", "module", "function", "calls", "api"]
tags = ["api", "core", "generic-dispatch-architecture", "prismatic"]
quality_score = 80
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Generic Dispatch Architecture - Prismatic Platform"
+++

## Overview

The Generic Dispatch system is the core routing mechanism of the Prismatic API. Instead of defining individual controllers for each endpoint, a single `DispatchController` resolves every API request by looking up the `{app, action}` tuple from the URL path, finding the corresponding Elixir module and function in the ETS registry, and invoking it through a `safe_apply/3` wrapper that provides timeout protection, error normalization, and telemetry instrumentation.

This architecture is what makes the Prismatic API truly auto-introspecting. When a developer adds a new public function to any `Prismatic*` facade module with a proper `@spec` and `@doc`, the function becomes callable through the API without writing a single line of routing, controller, or serialization code. The dispatch system handles parameter extraction, type coercion, function invocation, and response serialization automatically.

The dispatch mechanism distinguishes between GET and POST requests based on function arity. Functions with 0-2 parameters are exposed as GET endpoints (with parameters extracted from query strings), while functions with more parameters or complex input types are exposed as POST endpoints (with parameters extracted from the JSON request body).

## Endpoint

```
GET  /api/v1/:app/:action
POST /api/v1/:app/:action
```

The `:app` segment maps to a Prismatic application namespace (e.g., `perimeter` maps to `PrismaticPerimeter`). The `:action` segment maps to a function name on that module (e.g., `discover` maps to `PrismaticPerimeter.discover/1`).

**Port**: 4004
**Content-Type**: `application/json`

## Authentication

All dispatch endpoints require authentication. The `PrismaticWeb.Plugs.APIAuth` plug validates the Bearer token and attaches the authenticated user context to the connection before dispatch occurs.

```
Authorization: Bearer <api_token>
```

See [Authentication](/api/authentication/) for token lifecycle management.

## Request

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `app` | string | Yes | Application namespace (lowercase, e.g., `perimeter`, `agents`, `safety`) |
| `action` | string | Yes | Function name (lowercase with underscores, e.g., `discover`, `security_rating`) |

### GET Request Parameters

For functions with 0-2 parameters, arguments are passed as query string parameters:

```
GET /api/v1/perimeter/security_rating?domain=example.com
```

### POST Request Body

For functions with more than 2 parameters or complex input types, arguments are passed in the JSON body:

```json
{
  "domain": "example.com",
  "options": {
    "include_subdomains": true,
    "max_depth": 3
  }
}
```

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token |
| `Content-Type` | POST only | Must be `application/json` for POST requests |
| `Accept` | No | Defaults to `application/json` |
| `X-Request-ID` | No | Client-provided request ID for tracing |

## Response

### Success Response (200 OK)

The response body contains the serialized return value of the dispatched function. The structure depends entirely on what the underlying Elixir function returns.

```json
{
  "ok": true,
  "data": {
    "domain": "example.com",
    "assets": [
      { "type": "subdomain", "value": "www.example.com", "discovered_at": "2026-02-12T10:30:00Z" },
      { "type": "subdomain", "value": "api.example.com", "discovered_at": "2026-02-12T10:30:01Z" }
    ],
    "scan_duration_ms": 1247
  },
  "meta": {
    "request_id": "req_abc123",
    "dispatched_to": "PrismaticPerimeter.discover/1",
    "execution_time_ms": 1253
  }
}
```

### Response Envelope

Every dispatch response is wrapped in a standard envelope:

| Field | Type | Description |
|-------|------|-------------|
| `ok` | boolean | Whether the function returned `{:ok, _}` |
| `data` | any | The function return value (serialized to JSON) |
| `meta` | object | Request metadata including dispatch target and timing |
| `meta.request_id` | string | Request correlation ID |
| `meta.dispatched_to` | string | Module and function that handled the request |
| `meta.execution_time_ms` | number | Wall-clock execution time in milliseconds |

### Error Envelope

When the dispatched function returns `{:error, reason}`:

```json
{
  "ok": false,
  "error": {
    "code": "domain_not_found",
    "message": "The domain 'notexist.invalid' could not be resolved",
    "details": {
      "domain": "notexist.invalid",
      "dns_error": "nxdomain"
    }
  },
  "meta": {
    "request_id": "req_def456",
    "dispatched_to": "PrismaticPerimeter.discover/1",
    "execution_time_ms": 342
  }
}
```

## Dispatch Resolution

The dispatch process follows a precise sequence:

### Step 1: Registry Lookup

The controller extracts `{app, action}` from the URL path and looks up the ETS registry:

```elixir
case PrismaticApi.Registry.lookup(app, action) do
  {:ok, %{module: module, function: function, arity: arity}} -> proceed
  :error -> {:error, :not_found}
end
```

### Step 2: Parameter Extraction

Parameters are extracted from the request based on the HTTP method and the registered function arity:

- **GET with arity 0**: No parameters
- **GET with arity 1-2**: Parameters from query string, coerced to expected types
- **POST**: Parameters from JSON body, validated against the registered schema

### Step 3: Safe Apply

The function is invoked through `safe_apply/3`, which provides several protections:

```elixir
defp safe_apply(module, function, args) do
  task = Task.async(fn -> apply(module, function, args) end)
  case Task.yield(task, @dispatch_timeout) || Task.shutdown(task) do
    {:ok, {:ok, result}} -> {:ok, result}
    {:ok, {:error, reason}} -> {:error, reason}
    {:ok, other} -> {:ok, other}
    nil -> {:error, :timeout}
  end
end
```

Protections include:

| Protection | Mechanism | Default |
|------------|-----------|---------|
| **Timeout** | `Task.yield` + `Task.shutdown` | 30 seconds |
| **Process isolation** | Dispatched in a separate `Task` process | Always |
| **Error normalization** | Catches exceptions, converts to `{:error, _}` tuples | Always |
| **Telemetry** | Emits `:prismatic_api, :dispatch, :start/:stop/:exception` events | Always |

### Step 4: Response Serialization

The function return value is serialized to JSON using `Jason.encode!/1`. Elixir-specific types are converted:

| Elixir Type | JSON Type | Example |
|-------------|-----------|---------|
| atom | string | `:ok` becomes `"ok"` |
| tuple | array | `{1, 2}` becomes `[1, 2]` |
| struct | object | `%Rating{grade: :A}` becomes `{"grade": "A"}` |
| MapSet | array | MapSet of strings becomes string array |
| DateTime | string | ISO 8601 formatted |
| Decimal | string | Preserves precision |

## Code Examples

### curl

```bash
# GET dispatch (0-2 parameters)
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/perimeter/security_rating?domain=example.com" | jq .

# POST dispatch (complex parameters)
curl -s -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com", "frameworks": ["nis2", "zkb"]}' \
  http://localhost:4004/api/v1/perimeter/assess_compliance | jq .

# Dispatch with request tracing
curl -s -H "Authorization: Bearer $API_TOKEN" \
  -H "X-Request-ID: trace-001" \
  "http://localhost:4004/api/v1/agents/list" | jq '.meta'
```

### Elixir

```elixir
# Direct dispatch (internal, bypasses HTTP)
{:ok, result} = PrismaticApi.Dispatch.call("perimeter", "discover", %{"domain" => "example.com"})

# HTTP dispatch (external)
{:ok, response} = HTTPoison.post(
  "http://localhost:4004/api/v1/perimeter/discover",
  Jason.encode!(%{domain: "example.com"}),
  [
    {"Authorization", "Bearer #{token}"},
    {"Content-Type", "application/json"}
  ]
)

%{"ok" => true, "data" => data} = Jason.decode!(response.body)
```

### Python

```python
import requests

headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json",
    "X-Request-ID": "py-trace-001"
}

# GET dispatch
response = requests.get(
    "http://localhost:4004/api/v1/perimeter/security_rating",
    headers=headers,
    params={"domain": "example.com"}
)

# POST dispatch
response = requests.post(
    "http://localhost:4004/api/v1/perimeter/discover",
    headers=headers,
    json={"domain": "example.com", "options": {"include_subdomains": True}}
)

result = response.json()
print(f"Dispatched to: {result['meta']['dispatched_to']}")
print(f"Execution time: {result['meta']['execution_time_ms']}ms")
```

## Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_parameters` | Request parameters fail schema validation |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 404 | `endpoint_not_found` | No registered function for the `{app, action}` tuple |
| 408 | `dispatch_timeout` | Function execution exceeded the 30-second timeout |
| 422 | `type_coercion_failed` | Query parameter could not be coerced to expected type |
| 429 | `rate_limited` | Per-endpoint rate limit exceeded |
| 500 | `dispatch_error` | Unhandled exception in the dispatched function |

See [Error Handling](/api/error-handling/) for the complete error taxonomy.

## Rate Limits

Rate limits are configured per endpoint in the registry. Default limits apply when no endpoint-specific limit is set.

| Limit Type | Default | Description |
|------------|---------|-------------|
| Per token per endpoint | 60/min | Standard per-endpoint limit |
| Global per endpoint | 600/min | Aggregate limit across all consumers |
| Burst | 10/sec | Maximum burst rate |

Individual endpoints may override these defaults. Check the `rate_limit` field in the [Endpoint Discovery](/api/endpoints/) response for per-endpoint limits.

## Related Endpoints

- [Endpoint Discovery](/api/endpoints/) -- Find available dispatch targets
- [Health Check](/api/health/) -- Verify dispatch infrastructure is healthy
- [OpenAPI Specification](/api/openapi-spec/) -- Machine-readable dispatch schemas
- [Error Handling](/api/error-handling/) -- Error response format for failed dispatches
- [Batch Operations](/api/batch-operations/) -- Dispatch multiple calls in a single request

## Design Philosophy

The generic dispatch architecture embodies the [No Mercy](/glossary/no-mercy/) principle: every function exposed through the API must have a complete `@spec`, proper `@doc`, and pass through the [Trinity Gate](/glossary/trinity-gate/) verification. Functions without type specifications are excluded from discovery. Functions without documentation are flagged for correction. There are no half-measures in API exposure.

The `safe_apply/3` wrapper ensures that no single API call can destabilize the platform. Process isolation through `Task.async` means a crashing function kills only its own process, not the dispatch controller. The timeout mechanism prevents long-running operations from consuming connection pool resources. The [AIAD](/glossary/aiad/) agent framework monitors dispatch telemetry and automatically flags endpoints with high error rates or degrading performance.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)