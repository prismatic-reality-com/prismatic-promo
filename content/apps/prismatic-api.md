+++
title = "Prismatic API"
weight = 2
[extra]
icon = "server"
color = "blue"
description = "Auto-introspecting REST gateway with OpenAPI 3.0 documentation"
category = "Gateway"
files = "320"
status = "Development"
port = "4004"
keywords = ["auto-introspecting REST gateway", "OpenAPI 3.0 documentation", "Elixir reflection API", "zero-configuration endpoints", "generic dispatch controller", "SwaggerUI integration", "type-safe API dispatch", "facade module introspection"]
tags = ["api", "rest", "openapi", "gateway"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1316
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic API - Prismatic Platform"
+++

## Abstract

Prismatic API is an auto-introspecting REST gateway that discovers all public functions across Prismatic facade modules at boot time and exposes them as a fully documented [OpenAPI](/glossary/openapi/) 3.0 [REST API](/glossary/rest-api/) with zero manual configuration. The system leverages [Elixir](/glossary/elixir/)'s reflection capabilities -- `Code.fetch_docs/1`, `Code.Typespec.fetch_specs/1`, and `Module.__info__/1` -- to scan module exports, extract type specifications, and automatically generate OpenAPI JSON Schema definitions. A generic dispatch controller resolves `{app, action}` URL patterns to `module.function(args)` invocations, enabling any Prismatic facade function to be called via HTTP without writing per-endpoint controller code. The architecture separates concerns into a scanner subsystem (module discovery and type mapping), a [registry](/glossary/registry-otp/) ([ETS](/glossary/ets/)-cached endpoint catalog), and a dispatch layer (parameter validation and safe function application).

## 1. Introduction

### 1.1 Problem Statement

The Prismatic Platform comprises 90 OTP applications, each exposing domain-specific functionality through facade modules. Providing HTTP access to this functionality traditionally requires writing controllers, routes, parameter schemas, and documentation for each endpoint -- a linear effort that scales poorly as the platform grows. Every new facade function would require corresponding API code, creating a maintenance burden and introducing a persistent gap between internal capabilities and external accessibility.

The auto-introspection approach eliminates this gap entirely. When a developer adds a new public function to a facade module with a `@spec` annotation, it becomes available as an API endpoint automatically on the next boot cycle, complete with parameter validation, response documentation, and SwaggerUI integration.

### 1.2 Design Goals

1. **Zero-configuration endpoint generation** -- any public function on a `Prismatic*` facade module with a `@spec` becomes an API endpoint automatically.
2. **Type-safe dispatch** -- Elixir type specifications are translated into OpenAPI JSON Schema for automatic request validation.
3. **Full OpenAPI 3.0 compliance** -- complete specification generated at runtime, accessible at `/api/openapi`, with interactive SwaggerUI at `/api/swaggerui`.
4. **Secure by default** -- all endpoints inherit platform authentication through `PrismaticWeb.Plugs.APIAuth` and [RBAC](/glossary/rbac/) permission checks.
5. **Generic dispatch** -- a single controller handles all endpoints, routing `GET /api/v1/:app/:action` and `POST /api/v1/:app/:action` to the appropriate module function.
6. **Performance** -- boot-time scanning with ETS caching ensures sub-millisecond endpoint resolution at request time.

### 1.3 Scope

Prismatic API covers HTTP REST access to Prismatic facade modules. [GraphQL](/glossary/graphql/), gRPC, and [WebSocket](/glossary/websocket/) APIs are out of scope. The API does not expose internal modules, private functions, or functions without `@spec` annotations.

## 2. Architecture

### 2.1 System Design

```
Boot-Time Scanning Pipeline:
+-------------------+     +------------------+     +-------------------+
|  Module Scanner   | --> |  Type Mapper     | --> |  Registry (ETS)   |
|  Discover Prisma- |     |  @spec AST -->   |     |  Endpoint catalog |
|  tic* facades     |     |  OpenAPI Schema  |     |  cached for O(1)  |
+-------------------+     +------------------+     +-------------------+

Request-Time Dispatch Pipeline:
+-------------------+     +------------------+     +-------------------+
| HTTP Request      | --> | Auth Pipeline    | --> | Dispatch          |
| GET/POST          |     | APIAuth + RBAC   |     | Controller        |
| /api/v1/:app/:act |     | Rate Limiting    |     | safe_apply/3      |
+-------------------+     +------------------+     +-------------------+
                                                          |
                                                   +------+-------+
                                                   | Target Module|
                                                   | .function()  |
                                                   +--------------+
                                                          |
                                                   +------+-------+
                                                   | JSON Response|
                                                   +--------------+

Documentation Pipeline:
+-------------------+     +------------------+
| Registry (ETS)    | --> | OpenApiSpex      |
| Endpoint catalog  |     | Spec Generator   |
+-------------------+     +------------------+
                                |
                          +-----+------+
                          | SwaggerUI  |
                          | /api/      |
                          | swaggerui  |
                          +------------+
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticApi.Scanner` | Boot-time discovery of `Prismatic*` facade modules and their public functions |
| `PrismaticApi.TypeMapper` | Translation of Elixir `@spec` AST into OpenAPI JSON Schema types |
| `PrismaticApi.Registry` | ETS-backed endpoint registry for O(1) lookup by `{app, action}` |
| `PrismaticApi.DispatchController` | Generic [Phoenix](/glossary/phoenix/) controller that resolves and invokes target functions |
| `PrismaticApi.SafeApply` | Sandboxed function invocation with timeout, error handling, and audit logging |
| `PrismaticApi.ApiSpec` | Runtime OpenAPI 3.0 specification generation from registry data |
| `PrismaticApi.HealthController` | Health check endpoint at `/api/v1/health` |
| `PrismaticApi.EndpointController` | Endpoint catalog listing at `/api/v1/endpoints` |

### 2.3 Process Topology

```
PrismaticApi.Application (Supervisor, :one_for_one)
+-- PrismaticApi.Registry (GenServer)
|     ETS table owner; performs boot-time scan, caches endpoints
+-- PrismaticApi.Endpoint (Phoenix.Endpoint)
|     HTTP listener on port 4004
+-- PrismaticApi.Telemetry
      Telemetry event setup for API metrics
```

The Registry [GenServer](/glossary/genserver/) performs a full module scan in its `init/1` callback. Subsequent requests read from the ETS table without GenServer involvement, providing lock-free concurrent access.

### 2.4 Data Flow

```
HTTP Request (POST /api/v1/perimeter/discover)
       |
  Phoenix Router --> DispatchController.call/2
       |
  ETS Lookup: {"perimeter", "discover"} --> {PrismaticPerimeter, :discover, 1}
       |
  Parameter Extraction from JSON body
       |
  Type Validation against OpenAPI schema
       |
  SafeApply.call(PrismaticPerimeter, :discover, ["example.com"])
       |
  Result Serialization --> JSON Response (200 OK)
```

## 3. Implementation

### 3.1 Key Algorithms

**Module Discovery**. The scanner iterates over all loaded modules, filters those matching the `Prismatic*` naming convention, extracts public functions via `Module.__info__(:functions)`, fetches documentation via `Code.fetch_docs/1`, and retrieves type specifications via `Code.Typespec.fetch_specs/1`. Functions without specs are excluded from the API surface.

**Type Mapping**. The TypeMapper translates Elixir [typespec](/glossary/typespec/) AST nodes into OpenAPI JSON Schema objects. Primitive types map directly (`String.t()` to `{type: "string"}`), while compound types are decomposed recursively. Map types generate `object` schemas, list types generate `array` schemas, and union types generate `oneOf` schemas.

**Dispatch Resolution**. The URL pattern `/api/v1/:app/:action` is resolved by normalizing the app name (e.g., `"perimeter"` to `PrismaticPerimeter`) and looking up the function atom in the ETS registry. Functions with 0-2 parameters accept GET requests; functions with more parameters require POST with a JSON body.

### 3.2 Data Structures

```elixir
defmodule PrismaticApi.Endpoint do
  @type t :: %__MODULE__{
    app: String.t(),
    action: String.t(),
    module: module(),
    function: atom(),
    arity: non_neg_integer(),
    spec: term(),
    doc: String.t() | nil,
    method: :get | :post,
    schema: map()
  }

  defstruct [:app, :action, :module, :function, :arity,
             :spec, :doc, :method, :schema]
end
```

### 3.3 API Surface

```elixir
# Health check
# GET /api/v1/health
# => %{status: "ok", version: "7.5.0", uptime_seconds: 86400}

# List all discovered endpoints
# GET /api/v1/endpoints
# => [
#   %{app: "perimeter", action: "discover", method: "POST", arity: 1},
#   %{app: "perimeter", action: "security_rating", method: "GET", arity: 1},
#   ...
# ]

# Generic dispatch -- call any Prismatic facade function
# POST /api/v1/perimeter/discover
# Body: {"domain": "example.com"}
# => {:ok, %AttackSurface{...}}

# OpenAPI specification
# GET /api/openapi
# => Full OpenAPI 3.0 JSON document

# Interactive documentation
# GET /api/swaggerui
# => SwaggerUI HTML interface
```

```bash
# Health check
curl http://localhost:4004/api/v1/health

# List all discovered endpoints
curl http://localhost:4004/api/v1/endpoints

# Call a Prismatic function via REST
curl -X POST http://localhost:4004/api/v1/perimeter/discover \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer pk_live_abc123" \
  -d '{"domain": "example.com"}'

# Get OpenAPI spec
curl http://localhost:4004/api/openapi
```

### 3.4 Configuration

```elixir
config :prismatic_api,
  # Server
  port: 4004,
  host: "localhost",

  # Scanner
  scan_prefixes: ["Prismatic"],
  excluded_modules: [PrismaticApi, PrismaticWeb],
  require_spec: true,
  require_doc: false,

  # Dispatch
  dispatch_timeout: 30_000,
  max_response_size: 10_000_000,

  # Auth
  auth_module: PrismaticWeb.Plugs.APIAuth,
  rate_limit_per_key: 1000,
  rate_limit_window: 3600
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Auth](/apps/prismatic-auth/) | API key validation and RBAC permission enforcement |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Request [metrics](/glossary/metrics/) and latency tracking |
| [Prismatic Cache](/apps/prismatic-cache/) | Response caching with ETag support |
| All `Prismatic*` facades | Target modules for auto-discovery and dispatch |

### 4.2 Dependents

Any external client, CI/CD pipeline, or integration that needs programmatic access to Prismatic Platform capabilities uses the API as its entry point. The [Prismatic MCP](/apps/prismatic-mcp/) server also routes through the API for certain operations.

### 4.3 Inter-Process Communication

The API communicates with target modules through direct function calls via `SafeApply`. No [message passing](/glossary/message-passing/) or GenServer calls are involved in the dispatch path, minimizing latency. The Registry reads from a shared ETS table populated at boot time.

### 4.4 External Integrations

The API integrates with OpenApiSpex for specification generation and SwaggerUI for interactive documentation. External clients authenticate via API keys managed through [Prismatic Auth](/apps/prismatic-auth/).

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Endpoint resolution (ETS lookup) | < 1 microsecond | O(1) hash table lookup |
| Health check response | < 5ms | No computation |
| Endpoint listing | < 10ms | ETS table scan |
| Generic dispatch (simple function) | 5-50ms | Dominated by target function execution |
| Boot-time scan (90+ modules) | 200-500ms | One-time cost at application start |

### 5.2 Scalability

The API scales horizontally by deploying additional instances behind a load balancer. Each instance independently scans and caches its endpoint registry. Stateless dispatch means no session affinity is required.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 128 MB | 256 MB (with OpenAPI spec cache) |
| CPU | 1 core | 2 cores |
| Network | Port 4004 | Low bandwidth (JSON payloads) |

## 6. Testing Strategy

### 6.1 Unit Tests

Scanner tests verify correct module discovery, function filtering, and spec extraction. TypeMapper tests verify accurate AST-to-schema translation for all supported Elixir types. Dispatch tests verify correct function resolution and invocation.

### 6.2 Integration Tests

End-to-end HTTP tests exercise the full pipeline from HTTP request through authentication, dispatch, function execution, and JSON response. Tests cover both GET and POST dispatch paths, error handling, and authentication rejection.

### 6.3 Property-Based Testing

StreamData generators produce random module names and function signatures to verify the scanner handles edge cases in module naming, arity ranges, and spec formats.

## 7. Security Considerations

### 7.1 Threat Model

The primary threats are unauthorized access to platform functions and injection attacks through crafted parameters. Mitigations include mandatory authentication on all endpoints, type-validated parameters (rejecting malformed input before dispatch), function allowlisting (only `@spec`-annotated public functions on approved modules), and [rate limiting](/glossary/rate-limiting/) per API key.

### 7.2 Access Control

All API requests pass through `PrismaticWeb.Plugs.APIAuth` for authentication, followed by RBAC permission checks. Each discovered endpoint inherits permission requirements from its application domain. API keys are scoped to specific permissions and have configurable rate limits.

## 8. Operational Considerations

### 8.1 Deployment

The API deploys as a standalone Phoenix application within the umbrella, listening on port 4004. It requires no external services beyond the Prismatic Platform itself. Module scanning occurs automatically on boot.

### 8.2 Monitoring

[Telemetry](/glossary/telemetry/) events are emitted for every API request (`[:prismatic, :api, :request]`), including dispatch target, parameters, response status, and latency. Prometheus metrics expose request counts, latency distributions, and error rates.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Endpoint not appearing | Missing `@spec` on function | Add typespec annotation |
| 404 on valid function | Module not matching `Prismatic*` prefix | Verify module naming convention |
| Slow dispatch | Target function is slow | Profile target function independently |
| Auth failures | Expired or invalid API key | Check key status in Auth module |

## 9. Future Work

Planned enhancements include GraphQL schema auto-generation from the same introspection data, WebSocket streaming for long-running operations, endpoint versioning with deprecation notices, request/response schema evolution tracking, and SDK generation for Python, TypeScript, and Go clients.

## References

- [OpenAPI Specification 3.0](https://spec.openapis.org/oas/v3.0.3) -- API specification standard
- [OpenApiSpex](https://hexdocs.pm/open_api_spex/) -- Elixir OpenAPI implementation
- [Prismatic Auth](/apps/prismatic-auth/) -- Authentication and authorization
- [Prismatic Telemetry](/apps/prismatic-telemetry/) -- [Observability](/glossary/observability/) infrastructure
- [Prismatic Cache](/apps/prismatic-cache/) -- Response caching layer

## Related Agents

- [API Design Specialist Agent](/agents/api-design-specialist-agent/) -- Reviews API design patterns, endpoint naming conventions, and OpenAPI schema quality for the auto-introspecting gateway
- [API Gateway Specialist Agent](/agents/api-gateway-specialist-agent/) -- Manages gateway concerns including rate limiting, authentication pipeline, and dispatch security
- [Deployment Commander Agent](/agents/deployment-commander-agent/) -- Coordinates API deployment with boot-time scan verification and endpoint catalog validation

## Related Capabilities

- [Quality Gates](/capabilities/quality-gates/) -- Ensures all exposed functions carry proper type specifications and documentation required for auto-discovery
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Provides request-level observability with latency distributions, error rates, and dispatch metrics for every API endpoint
- [AIAD Standard](/capabilities/aiad-standard/) -- Standardizes the interface between the API gateway and the 404 agent ecosystem for command dispatch

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)