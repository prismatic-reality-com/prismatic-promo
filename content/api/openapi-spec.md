+++
title = "OpenAPI 3.0 Specification"
weight = 9
[extra]
description = "Auto-generated OpenAPI 3.0 specification derived from Elixir @spec type annotations and @doc strings"
category = "infrastructure"
method = "GET"
path = "/api/openapi"
status = "stable"
auth_required = false
glossary_terms = ["aiad", "trinity-gate", "quality-dna"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "2 min"
word_count = 483
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OpenAPI", "Specification", "Auto-generated", "Elixir", "api", "infrastructure", "Prismatic Platform", "Direct"]
tags = ["api", "infrastructure", "openapi-30-specification", "prismatic"]
quality_score = 70
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "OpenAPI 3.0 Specification - Prismatic Platform"
+++

## Overview

The OpenAPI Specification endpoint serves the complete, auto-generated [OpenAPI](/glossary/openapi/) 3.0 schema for the Prismatic API. This specification is not hand-written or manually maintained. It is generated at boot time by the same scanner that populates the [Endpoint Discovery](/api/endpoints/) registry, translating Elixir `@spec` type annotations into JSON Schema objects and `@doc` strings into operation descriptions.

This approach eliminates the documentation drift problem that plagues most APIs. When a developer changes a function's type specification, the OpenAPI schema updates automatically on the next deployment. When a new function is added to a facade module, it appears in the specification without any additional effort. The [Trinity Gate](/glossary/trinity-gate/) verification ensures that every endpoint in the specification has valid type mappings and complete documentation.

The specification is served as a JSON document conforming to the OpenAPI 3.0.3 standard. It can be consumed by code generators, testing tools, API gateways, and the built-in [Swagger UI](/api/swagger-ui/) explorer.

## Endpoint

```
GET /api/openapi
```

Returns the complete OpenAPI 3.0.3 specification as a JSON document.

**Port**: 4004
**Content-Type**: `application/json`

## Authentication

No authentication required. The specification document is publicly accessible to support integration with API gateways, client generators, and documentation tools that may not have credentials.

## Request

### Parameters

This endpoint accepts no parameters. The full specification is always returned.

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Accept` | No | Defaults to `application/json` |

### Example Request

```
GET /api/openapi HTTP/1.1
Host: localhost:4004
Accept: application/json
```

## Response

### Success Response (200 OK)

The response is a complete OpenAPI 3.0.3 document. Below is a condensed example showing the structure:

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "Prismatic Platform API",
    "version": "7.5.0",
    "description": "Auto-introspecting REST gateway for the Prismatic Platform. All endpoints are automatically discovered from Elixir module introspection.",
    "contact": {
      "name": "Prismatic Platform",
      "url": "https://korczis.github.io/prismatic-promo"
    },
    "license": {
      "name": "Proprietary"
    }
  },
  "servers": [
    {
      "url": "http://localhost:4004",
      "description": "Local development"
    },
    {
      "url": "https://prismatic-staging.fly.dev",
      "description": "Staging environment"
    },
    {
      "url": "https://prismatic-prod.fly.dev",
      "description": "Production environment"
    }
  ],
  "paths": {
    "/api/v1/health": {
      "get": {
        "operationId": "health_check",
        "summary": "System health check",
        "description": "Returns comprehensive health status for all platform components",
        "tags": ["core"],
        "security": [],
        "responses": {
          "200": {
            "description": "Health status report",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HealthResponse"
                }
              }
            }
          },
          "503": {
            "description": "System unhealthy",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/HealthResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/perimeter/discover": {
      "post": {
        "operationId": "perimeter_discover",
        "summary": "Discover attack surface",
        "description": "Perform comprehensive external attack surface discovery for a domain",
        "tags": ["perimeter"],
        "security": [{ "bearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/DiscoverRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Discovery results",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/DispatchResponse"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    },
    "schemas": {
      "HealthResponse": {
        "type": "object",
        "required": ["status", "version", "uptime_seconds", "timestamp"],
        "properties": {
          "status": {
            "type": "string",
            "enum": ["healthy", "degraded", "unhealthy"]
          },
          "version": { "type": "string" },
          "uptime_seconds": { "type": "integer" },
          "timestamp": { "type": "string", "format": "date-time" },
          "components": { "type": "object" }
        }
      },
      "DispatchResponse": {
        "type": "object",
        "required": ["ok"],
        "properties": {
          "ok": { "type": "boolean" },
          "data": {},
          "error": { "$ref": "#/components/schemas/ErrorDetail" },
          "meta": { "$ref": "#/components/schemas/RequestMeta" }
        }
      },
      "ErrorDetail": {
        "type": "object",
        "properties": {
          "code": { "type": "string" },
          "message": { "type": "string" },
          "details": { "type": "object" }
        }
      },
      "RequestMeta": {
        "type": "object",
        "properties": {
          "request_id": { "type": "string" },
          "dispatched_to": { "type": "string" },
          "execution_time_ms": { "type": "number" }
        }
      },
      "DiscoverRequest": {
        "type": "object",
        "required": ["domain"],
        "properties": {
          "domain": { "type": "string", "example": "example.com" },
          "options": {
            "type": "object",
            "properties": {
              "include_subdomains": { "type": "boolean", "default": true },
              "max_depth": { "type": "integer", "default": 3 },
              "passive_only": { "type": "boolean", "default": false }
            }
          }
        }
      }
    }
  },
  "tags": [
    { "name": "core", "description": "Core platform endpoints" },
    { "name": "perimeter", "description": "External attack surface management" },
    { "name": "agents", "description": "AIAD agent management" }
  ]
}
```

### Type Mapping Reference

The scanner converts Elixir type specifications to JSON Schema following these rules:

| Elixir Type | JSON Schema Type | Notes |
|-------------|-----------------|-------|
| `String.t()` | `{"type": "string"}` | Direct mapping |
| `integer()` | `{"type": "integer"}` | Direct mapping |
| `float()` | `{"type": "number"}` | Direct mapping |
| `boolean()` | `{"type": "boolean"}` | Direct mapping |
| `atom()` | `{"type": "string"}` | Atoms become strings |
| `list(t)` | `{"type": "array", "items": ...}` | Recursive mapping of element type |
| `map()` | `{"type": "object"}` | Untyped map |
| `%{key: type}` | `{"type": "object", "properties": ...}` | Typed map with property schemas |
| `t1 \| t2` | `{"oneOf": [...]}` | Union types |
| `nil` | `{"type": "null"}` | Null type |
| `{t1, t2}` | `{"type": "array", "items": [...]}` | Tuple as fixed-length array |
| `DateTime.t()` | `{"type": "string", "format": "date-time"}` | ISO 8601 format |
| `Decimal.t()` | `{"type": "string", "pattern": "^-?\\d+\\.?\\d*$"}` | String to preserve precision |
| Custom struct | `{"$ref": "#/components/schemas/..."}` | Named schema reference |

## Code Examples

### curl

```bash
# Download the full spec
curl -s http://localhost:4004/api/openapi | jq . > prismatic-openapi.json

# List all paths
curl -s http://localhost:4004/api/openapi | jq '.paths | keys[]'

# Count endpoints by tag
curl -s http://localhost:4004/api/openapi | \
  jq '[.paths[][]] | group_by(.tags[0]) | map({tag: .[0].tags[0], count: length})'

# Extract schemas
curl -s http://localhost:4004/api/openapi | jq '.components.schemas | keys[]'
```

### Elixir

```elixir
# Access the spec programmatically
spec = PrismaticApi.ApiSpec.spec()
IO.puts("API version: #{spec.info.version}")
IO.puts("Endpoints: #{map_size(spec.paths)}")

# Generate client code from the spec
{:ok, spec_json} = Jason.encode(PrismaticApi.ApiSpec.spec())
File.write!("prismatic-openapi.json", spec_json)
```

### Python

```python
import requests
import json

# Download and parse the spec
response = requests.get("http://localhost:4004/api/openapi")
spec = response.json()

print(f"API: {spec['info']['title']} v{spec['info']['version']}")
print(f"Endpoints: {len(spec['paths'])}")

# List all operations
for path, methods in spec["paths"].items():
    for method, details in methods.items():
        if method in ("get", "post", "put", "delete"):
            print(f"  {method.upper():6s} {path:40s} {details.get('summary', '')}")

# Save for code generation
with open("prismatic-openapi.json", "w") as f:
    json.dump(spec, f, indent=2)
```

## Error Responses

| Status Code | Condition | Description |
|-------------|-----------|-------------|
| 200 | Always | The specification is always available if the API is running |
| 429 | Rate limited | Excessive requests |

The specification endpoint does not produce errors under normal operation. If the API process is running, the specification is available.

## Rate Limits

| Limit Type | Value | Window |
|------------|-------|--------|
| Per IP | 30 requests | 1 minute |
| Burst | 5 requests | 1 second |

The specification is a static JSON document cached in memory. Rate limits exist to prevent abuse, not for performance reasons.

## Related Endpoints

- [Swagger UI](/api/swagger-ui/) -- Interactive browser consuming this specification
- [Endpoint Discovery](/api/endpoints/) -- Programmatic endpoint listing from the same data source
- [Generic Dispatch](/api/dispatch/) -- How specification paths map to runtime dispatch
- [Health Check](/api/health/) -- Verify the API is running before fetching the spec

## Integration with Code Generators

The specification is designed to work with standard OpenAPI code generators:

```bash
# Generate TypeScript client
npx openapi-generator-cli generate \
  -i http://localhost:4004/api/openapi \
  -g typescript-axios \
  -o ./generated/typescript-client

# Generate Python client
openapi-generator generate \
  -i http://localhost:4004/api/openapi \
  -g python \
  -o ./generated/python-client

# Generate Elixir client
mix openapi.generate http://localhost:4004/api/openapi --output lib/prismatic_client
```

The auto-generated specification ensures that client libraries are always in sync with the server implementation. The [Quality DNA](/glossary/quality-dna/) system validates specification completeness as part of the platform's continuous quality assessment.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)