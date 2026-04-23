+++
title = "Endpoint Discovery"
weight = 2
[extra]
description = "Auto-discovered endpoint listing with metadata, parameter schemas, and module provenance"
category = "core"
method = "GET"
path = "/api/v1/endpoints"
status = "stable"
auth_required = true
glossary_terms = ["aiad", "quality-dna", "trinity-gate"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 702
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Endpoint", "Discovery", "Auto-discovered", "api", "core", "Prismatic Platform", "Elixir", "Description", "Type"]
tags = ["api", "core", "endpoint-discovery", "prismatic"]
quality_score = 70
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Endpoint Discovery - Prismatic Platform"
+++

## Overview

The Endpoint Discovery API returns a complete catalog of all automatically discovered REST endpoints available on the Prismatic Platform. This is the API's self-describing capability: the platform inspects its own codebase at boot time, discovers every public function on every `Prismatic*` facade module, maps their Elixir `@spec` type annotations to JSON Schema, and exposes the results through this single endpoint.

Unlike traditional API documentation that requires manual synchronization between code and docs, the Prismatic API generates its endpoint catalog directly from source code introspection. When a developer adds a new public function with a `@spec` annotation to any facade module, it automatically appears in the endpoint listing on the next application restart. Zero configuration, zero drift between implementation and documentation.

The discovery mechanism uses three Elixir introspection functions: `Code.fetch_docs/1` for documentation strings, `Code.Typespec.fetch_specs/1` for type specifications, and `Module.__info__(:functions)` for function arities. The results are cached in an ETS table for sub-millisecond lookup during request dispatch.

## Endpoint

```
GET /api/v1/endpoints
```

Returns the complete list of auto-discovered API endpoints with their metadata, parameter schemas, and response types.

**Port**: 4004
**Content-Type**: `application/json`

## Authentication

Requires a valid API token. The endpoint listing contains structural information about the API surface that should be restricted to authenticated consumers.

```
Authorization: Bearer <api_token>
```

See [Authentication](/api/authentication/) for token management details.

## Request

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `app` | string | No | all | Filter by application name (e.g., `perimeter`, `agents`) |
| `method` | string | No | all | Filter by HTTP method (`GET`, `POST`, `PUT`, `DELETE`) |
| `status` | string | No | all | Filter by endpoint status (`stable`, `beta`, `deprecated`) |
| `search` | string | No | none | Full-text search across endpoint names and descriptions |
| `page` | integer | No | 1 | Page number for paginated results |
| `per_page` | integer | No | 50 | Results per page (max 200) |

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token for authentication |
| `Accept` | No | Defaults to `application/json` |

### Example Request

```
GET /api/v1/endpoints?app=perimeter&method=POST HTTP/1.1
Host: localhost:4004
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Accept: application/json
```

## Response

### Success Response (200 OK)

```json
{
  "total": 312,
  "page": 1,
  "per_page": 50,
  "pages": 7,
  "endpoints": [
    {
      "id": "perimeter.discover",
      "app": "perimeter",
      "action": "discover",
      "method": "POST",
      "path": "/api/v1/perimeter/discover",
      "status": "stable",
      "description": "Discover the external attack surface for a given domain",
      "module": "PrismaticPerimeter",
      "function": "discover",
      "arity": 1,
      "parameters": [
        {
          "name": "domain",
          "type": "string",
          "required": true,
          "description": "Target domain for attack surface discovery",
          "example": "example.com"
        }
      ],
      "response_type": {
        "type": "object",
        "properties": {
          "domain": { "type": "string" },
          "assets": { "type": "array" },
          "risk_score": { "type": "number" }
        }
      },
      "auth_required": true,
      "rate_limit": "30/min",
      "added_in": "7.2.0",
      "tags": ["security", "easm", "perimeter"]
    },
    {
      "id": "perimeter.security_rating",
      "app": "perimeter",
      "action": "security_rating",
      "method": "GET",
      "path": "/api/v1/perimeter/security_rating",
      "status": "stable",
      "description": "Get the security rating (A-F) for a domain",
      "module": "PrismaticPerimeter",
      "function": "security_rating",
      "arity": 1,
      "parameters": [
        {
          "name": "domain",
          "type": "string",
          "required": true,
          "description": "Domain to rate"
        }
      ],
      "response_type": {
        "type": "object",
        "properties": {
          "grade": { "type": "string", "enum": ["A", "B", "C", "D", "F"] },
          "score": { "type": "integer", "minimum": 300, "maximum": 900 }
        }
      },
      "auth_required": true,
      "rate_limit": "60/min",
      "added_in": "7.3.0",
      "tags": ["security", "rating"]
    }
  ],
  "filters_applied": {
    "app": "perimeter",
    "method": "POST"
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of matching endpoints |
| `page` | integer | Current page number |
| `per_page` | integer | Results per page |
| `pages` | integer | Total number of pages |
| `endpoints` | array | Array of endpoint descriptor objects |
| `filters_applied` | object | Echo of the applied filter parameters |

### Endpoint Descriptor Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique endpoint identifier (`app.action` format) |
| `app` | string | Application namespace |
| `action` | string | Action name within the application |
| `method` | string | HTTP method (GET, POST, PUT, DELETE) |
| `path` | string | Full URL path |
| `status` | string | Endpoint maturity: `stable`, `beta`, `deprecated` |
| `description` | string | Human-readable description from `@doc` annotation |
| `module` | string | Fully qualified Elixir module name |
| `function` | string | Function name on the module |
| `arity` | integer | Function arity (number of parameters) |
| `parameters` | array | Parameter descriptors with types and validation |
| `response_type` | object | JSON Schema for the response body |
| `auth_required` | boolean | Whether authentication is required |
| `rate_limit` | string | Rate limit expression for this endpoint |
| `added_in` | string | Platform version when the endpoint was introduced |
| `tags` | array | Categorization tags |

## Code Examples

### curl

```bash
# List all endpoints
curl -s -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/endpoints | jq '.total'

# Filter by application
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/endpoints?app=perimeter" | jq '.endpoints[].path'

# Search for security-related endpoints
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/endpoints?search=security" | jq '.endpoints[] | {id, path, method}'

# Get only POST endpoints
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/endpoints?method=POST" | jq '.endpoints[].id'
```

### Elixir

```elixir
# Internal: query the ETS registry directly
endpoints = PrismaticApi.Registry.list_endpoints()
perimeter_endpoints = Enum.filter(endpoints, &(&1.app == "perimeter"))

# External: HTTP client
{:ok, response} = HTTPoison.get(
  "http://localhost:4004/api/v1/endpoints",
  [{"Authorization", "Bearer #{api_token}"}],
  params: [app: "agents", status: "stable"]
)

%{"endpoints" => endpoints, "total" => total} = Jason.decode!(response.body)
IO.puts("Found #{total} agent endpoints")
```

### Python

```python
import requests

headers = {"Authorization": f"Bearer {api_token}"}
params = {"app": "perimeter", "per_page": 200}

response = requests.get(
    "http://localhost:4004/api/v1/endpoints",
    headers=headers,
    params=params
)

data = response.json()
for endpoint in data["endpoints"]:
    print(f"{endpoint['method']:6s} {endpoint['path']:40s} [{endpoint['status']}]")
```

## Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `unauthorized` | Missing or invalid authentication token |
| 422 | `invalid_parameter` | Invalid filter parameter value (e.g., invalid method) |
| 429 | `rate_limited` | Too many requests (see [Rate Limiting](/api/rate-limiting/)) |

See [Error Handling](/api/error-handling/) for the standard error response format.

## Rate Limits

| Limit Type | Value | Window |
|------------|-------|--------|
| Per token | 120 requests | 1 minute |
| Burst | 20 requests | 1 second |

The endpoint listing is cached in ETS and is computationally inexpensive to serve. Rate limits are primarily to prevent enumeration abuse.

## Related Endpoints

- [Health Check](/api/health/) -- Verify the API is running before querying endpoints
- [Generic Dispatch](/api/dispatch/) -- How discovered endpoints are called at runtime
- [OpenAPI Specification](/api/openapi-spec/) -- Machine-readable schema generated from the same discovery data
- [Swagger UI](/api/swagger-ui/) -- Interactive browser for discovered endpoints

## Discovery Architecture

The endpoint discovery pipeline runs at application startup and consists of four stages:

1. **Module Scanning** -- Enumerates all loaded modules matching the `Prismatic*` namespace pattern using `:code.all_loaded/0` and `:application.loaded_applications/0`.

2. **Function Extraction** -- For each module, calls `Module.__info__(:functions)` to get the exported function list, then filters to public facade functions (excluding callbacks, private helpers, and test utilities).

3. **Type Mapping** -- Reads `@spec` annotations via `Code.Typespec.fetch_specs/1` and converts the Elixir type AST into [OpenAPI](/glossary/openapi/) JSON Schema objects. Supports primitive types, maps, lists, tuples (converted to arrays), and custom types (resolved recursively).

4. **Registry Population** -- Inserts all discovered endpoint descriptors into an ETS table keyed by `{app, action}` tuples. The [Generic Dispatch](/api/dispatch/) controller reads from this same table at request time.

The discovery results feed directly into the [Quality DNA](/glossary/quality-dna/) assessment, where endpoint coverage metrics contribute to the platform's overall quality score. The [Trinity Gate](/glossary/trinity-gate/) verification layer validates that all discovered endpoints have proper type specifications and documentation.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)