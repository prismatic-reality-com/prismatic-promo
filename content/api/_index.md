+++
title = "API"
sort_by = "title"
template = "api/list.html"
page_template = "api/page.html"
transparent = false

[extra]
description = "Auto-introspecting REST gateway with OpenAPI 3.0 specification, generic dispatch, and zero-configuration endpoint discovery"
category = "ecosystem"
icon = "terminal"
endpoint_count = 15
port = 4004
spec_version = "3.0"
auth_type = "API Key + RBAC"
author = "Tomas Korcak (korczis)"

# SEO & Social
image = "/images/sections/api.png"
image_alt = "Prismatic API auto-introspecting REST gateway architecture"
og_type = "article"
twitter_card = "summary_large_image"

# Academic metadata
academic_tier = "whitepaper"
citation_style = "IEEE"
reading_time = "14 min"
word_count = 3200
difficulty = "intermediate"

# Content classification
content_version = "2.0.0"
last_enhanced = "2026-02-12"
quality_score = 95
date_created = "2026-02-06"
date_updated = "2026-02-12"

# Cross-references
related_sections = ["lab", "academy", "apps", "architecture"]
glossary_terms = ["AIAD", "OTP", "ETS", "OpenAPI", "REST", "GenServer", "RBAC"]
keywords = ["auto-introspecting REST API", "OpenAPI 3.0 specification", "zero-configuration endpoint discovery", "generic dispatch controller", "Elixir API gateway", "SwaggerUI documentation", "role-based access control API", "type-safe REST dispatch"]
tags = ["api", "rest", "openapi", "gateway", "automation"]
see_also = ["technologies", "capabilities", "agents"]

# API-specific metadata
protocol = "REST"
transport = "HTTP/1.1"
serialization = "JSON"
documentation_format = "OpenAPI 3.0"
swagger_ui = true
rate_limiting = true
versioning = "URL path (v1)"
date_modified = "2026-02-23"
+++

## Overview

The Prismatic API is a self-discovering REST gateway that eliminates the traditional overhead of API development. Rather than requiring developers to manually define routes, write controllers, maintain schema documentation, and synchronize specifications with implementation, the Prismatic API automatically discovers all public functions across the platform's facade modules using Elixir's introspection capabilities and exposes them as fully documented OpenAPI 3.0 endpoints. The result is an API that is always complete, always accurate, and always in sync with the underlying platform.

This zero-configuration approach is not a convenience shortcut that trades capability for simplicity. The auto-introspected API supports the full range of features expected of a production REST gateway: role-based access control, request validation, structured error responses, rate limiting, and interactive documentation via SwaggerUI. The difference is that these features are derived from the source code itself rather than maintained as a separate, potentially divergent artifact.

The API serves as the platform's primary external interface, enabling programmatic access to every capability that the platform exposes through its facade modules. It also functions as the definitive reference layer for the [Academy](@/academy/_index.md), providing precise endpoint specifications that complement the Academy's conceptual teaching. When [Lab](@/lab/_index.md) experiments graduate to production, their functions appear as API endpoints automatically, completing the research-to-deployment pipeline without additional integration work.

The API runs as a standalone Phoenix application on port 4004, separate from the main web interface but sharing the same underlying platform services. This separation allows the API to be scaled, monitored, and secured independently of the web dashboard.

## Architecture

The API's architecture follows a scanner-registry-dispatch pattern that converts Elixir module metadata into HTTP endpoints through a series of well-defined transformations.

```
Boot Time:
  Scanner ──> discovers Prismatic* facade modules
     │
     ▼
  TypeMapper ──> converts @spec AST to OpenAPI JSON Schema
     │
     ▼
  Registry (ETS) ──> caches endpoint metadata for fast lookup
     │
     ▼
  ApiSpec ──> generates OpenAPI 3.0 specification
     │
     ▼
  SwaggerUI ──> serves interactive documentation

Request Time:
  HTTP Request ──> Router ──> APIAuth Plug ──> RateLimiter
     │
     ▼
  DispatchController ──> resolves {app, action} to {module, function}
     │
     ▼
  safe_apply(module, function, args) ──> with timeout protection
     │
     ▼
  JSON Response ──> with appropriate HTTP status code
```

The architecture's key insight is that Elixir provides rich module metadata at runtime. Every public function's documentation, type specifications, and arity are accessible through standard library functions. The API exploits this to generate everything a REST gateway needs without requiring any manual specification.

### Scanner

The scanner runs at application boot time and discovers all modules whose name begins with `Prismatic` that expose public functions with `@doc` annotations and `@spec` type specifications. The scanner uses `Code.fetch_docs/1` to retrieve documentation, `Code.Typespec.fetch_specs/1` to retrieve type specifications, and `Module.__info__(:functions)` to enumerate public functions.

```elixir
defmodule PrismaticApi.Scanner do
  @spec discover_endpoints() :: [EndpointMeta.t()]
  def discover_endpoints do
    :code.all_loaded()
    |> Enum.filter(&prismatic_facade?/1)
    |> Enum.flat_map(&extract_endpoints/1)
    |> Enum.filter(&has_spec_and_doc?/1)
  end

  defp prismatic_facade?({module, _}) do
    module
    |> Atom.to_string()
    |> String.starts_with?("Elixir.Prismatic")
  end

  defp extract_endpoints({module, _}) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, :elixir, _, _, _, docs} ->
        Enum.map(docs, &build_endpoint_meta(module, &1))

      _ ->
        []
    end
  end
end
```

The scanner is idempotent and can be re-executed at runtime to discover newly loaded modules. The `mix prismatic_api.rescan` task triggers a live rescan without requiring application restart.

### Registry

Discovered endpoint metadata is stored in an ETS table for sub-microsecond lookup during request dispatch. The registry maps `{app_name, action_name}` tuples to full endpoint metadata including the target module, function atom, parameter specifications, documentation text, and OpenAPI schema fragments.

```elixir
# Registry lookup during dispatch
case :ets.lookup(:prismatic_api_registry, {app, action}) do
  [{_, endpoint_meta}] ->
    {:ok, endpoint_meta}

  [] ->
    {:error, :endpoint_not_found}
end
```

The ETS-based registry provides constant-time lookups regardless of the number of registered endpoints and survives temporary process failures through the registry GenServer's supervision strategy.

### Dispatch Controller

The dispatch controller is a single Phoenix controller that handles all API requests through generic pattern matching on the `app` and `action` path parameters. It resolves these parameters to a module and function through the registry, validates the request parameters against the endpoint's type specification, and invokes the function through `safe_apply/3`.

The `safe_apply/3` wrapper provides timeout protection, error isolation, and structured error reporting. If the target function raises an exception, `safe_apply` catches it and returns a structured error response rather than allowing the exception to propagate to the HTTP layer.

## Auto-Discovery Mechanism

The auto-discovery mechanism is the API's defining capability. It leverages three Elixir introspection functions to extract everything needed to generate a complete REST endpoint from source code alone.

### Code.fetch_docs/1

This function retrieves the documentation chunk compiled into a module's beam file. The API uses it to extract `@moduledoc` content (which becomes the endpoint group description) and `@doc` content for each function (which becomes the endpoint description in the OpenAPI spec). Functions without `@doc` annotations are excluded from the API surface, providing a natural opt-out mechanism.

### Code.Typespec.fetch_specs/1

This function retrieves the compiled type specifications for a module's functions. The API's type mapper converts these specifications from Elixir AST format into OpenAPI JSON Schema definitions. This conversion handles primitive types, common compound types (lists, maps, tuples), custom type references, and union types. The type mapper also extracts return type information to generate response schemas.

### Module.__info__/1

This function provides the list of public functions and their arities. Combined with the documentation and type specification data, it provides the complete picture needed to generate an endpoint: the function name becomes the action, the arity determines whether the endpoint uses GET (0-2 parameters) or POST (3+ parameters), the parameter types become the request schema, and the return type becomes the response schema.

## Type Mapping System

The type mapping system converts Elixir `@spec` AST nodes into OpenAPI JSON Schema definitions. This conversion is the most technically intricate component of the API, as it must faithfully represent Elixir's type system within the constraints of JSON Schema.

```elixir
defmodule PrismaticApi.TypeMapper do
  @spec to_json_schema(type_ast :: term()) :: map()

  # Primitive types
  def to_json_schema({:type, _, :integer, []}) do
    %{"type" => "integer"}
  end

  def to_json_schema({:type, _, :binary, []}) do
    %{"type" => "string"}
  end

  def to_json_schema({:type, _, :boolean, []}) do
    %{"type" => "boolean"}
  end

  def to_json_schema({:type, _, :float, []}) do
    %{"type" => "number", "format" => "double"}
  end

  # List types
  def to_json_schema({:type, _, :list, [inner_type]}) do
    %{"type" => "array", "items" => to_json_schema(inner_type)}
  end

  # Map types
  def to_json_schema({:type, _, :map, fields}) do
    %{
      "type" => "object",
      "properties" => Map.new(fields, &field_to_property/1)
    }
  end

  # Union types (converted to oneOf)
  def to_json_schema({:type, _, :union, variants}) do
    %{"oneOf" => Enum.map(variants, &to_json_schema/1)}
  end
end
```

The type mapper handles the common case where Elixir functions return `{:ok, result}` or `{:error, reason}` tuples by extracting the success type for the 200 response schema and the error type for the error response schema. This convention-based extraction means that idiomatic Elixir return types produce idiomatic REST responses without any manual annotation.

## Core Endpoints

The API exposes a set of core infrastructure endpoints alongside the auto-discovered domain endpoints.

### Health Check

```bash
# GET /api/v1/health
curl http://localhost:4004/api/v1/health

# Response:
{
  "status": "healthy",
  "version": "7.5.0",
  "uptime_seconds": 86400,
  "endpoints_registered": 15,
  "last_scan": "2026-02-12T10:30:00Z"
}
```

The health endpoint reports system status, the number of registered endpoints, and the timestamp of the last scanner run. It is unauthenticated to support load balancer health probes.

### Endpoint Discovery

```bash
# GET /api/v1/endpoints
curl -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/endpoints

# Response:
{
  "endpoints": [
    {
      "app": "perimeter",
      "action": "discover",
      "method": "POST",
      "path": "/api/v1/perimeter/discover",
      "description": "Discover external attack surface for a domain",
      "parameters": [{"name": "domain", "type": "string", "required": true}],
      "response_type": "AttackSurface"
    },
    ...
  ],
  "total": 15
}
```

The endpoint discovery route returns a complete listing of all registered endpoints with their metadata, parameter schemas, and response types. This endpoint powers the SwaggerUI interface and can be consumed programmatically by client code generators.

### Generic Dispatch

The generic dispatch routes (`GET /api/v1/:app/:action` and `POST /api/v1/:app/:action`) form the API's primary interface. GET is used for functions with 0-2 parameters (passed as query parameters); POST is used for functions with 3 or more parameters (passed as JSON body). The dispatch controller validates parameters, invokes the target function, and serializes the result as JSON.

### OpenAPI Specification

```bash
# GET /api/openapi
curl http://localhost:4004/api/openapi

# Returns a complete OpenAPI 3.0 JSON specification
# auto-generated from discovered endpoints
```

The OpenAPI specification is regenerated from the registry on every request, ensuring it always reflects the current state of discovered endpoints. The specification includes endpoint paths, request/response schemas, authentication requirements, and descriptive text extracted from module documentation.

### SwaggerUI

The interactive SwaggerUI interface at `/api/swaggerui` renders the OpenAPI specification as a browsable, executable documentation page. Developers can explore endpoints, inspect schemas, and send test requests directly from the browser.

## Domain APIs

The auto-discovery mechanism exposes domain-specific APIs that correspond to the platform's major capability areas.

**Perimeter API**: Asset discovery, security rating calculations, compliance assessments, and attack surface analysis. Endpoints include `discover`, `security_rating`, `assess_compliance`, and `list_assets`.

**Agents API**: Agent status queries, configuration inspection, and lifecycle management. Endpoints include `list_agents`, `agent_status`, and `agent_metrics`.

**Quality API**: Quality gate execution, quality score reporting, and quality DNA inspection. Endpoints include `quality_score`, `gate_status`, and `quality_history`.

**OSINT API**: Open-source intelligence operations including domain reconnaissance, email intelligence, and infrastructure mapping. Endpoints follow the platform's OSINT provider architecture.

Each domain API inherits the platform's authentication and authorization requirements. Access to specific endpoints is governed by the RBAC system, which maps API tokens to roles and roles to permitted operations.

## Authentication and Authorization

The API implements a layered security model that balances accessibility with protection.

### API Key Management

API access requires a bearer token passed in the `Authorization` header. Tokens are generated through the platform's identity management system and associated with a specific user and role set. Tokens have configurable expiration periods and can be revoked immediately when compromised.

```bash
# Authenticated request
curl -H "Authorization: Bearer pk_live_abc123def456" \
  http://localhost:4004/api/v1/perimeter/discover \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'
```

### Role-Based Access Control

The RBAC system defines permissions at the endpoint level. Each endpoint specifies the minimum role required for access. The role hierarchy (viewer, operator, admin, supreme) provides progressive access levels. When a request arrives, the `APIAuth` plug extracts the token, resolves the associated role, and verifies that the role satisfies the endpoint's access requirement.

### Token Lifecycle

Tokens progress through a defined lifecycle: creation, active use, optional renewal, and eventual expiration or revocation. The API tracks token usage metrics (last used, request count, error rate) to support security auditing and anomaly detection.

## Error Handling

The API returns structured error responses that provide actionable information for client developers.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Parameter 'domain' must be a valid hostname",
    "details": {
      "parameter": "domain",
      "provided": "not a domain",
      "expected": "string matching hostname pattern"
    },
    "request_id": "req_abc123"
  }
}
```

### HTTP Status Codes

The API uses standard HTTP status codes consistently:

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | Success | Successful operation with response body |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Invalid parameters or malformed request |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Endpoint or resource does not exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Unexpected server-side failure |

Every error response includes a `request_id` field that correlates with server-side logs, enabling efficient debugging of reported issues.

## Rate Limiting

The API enforces rate limits to protect platform resources and ensure fair access across consumers.

### Per-Endpoint Limits

Rate limits are configured per endpoint based on the computational cost of the underlying operation. Lightweight operations like health checks and endpoint listing have generous limits. Resource-intensive operations like attack surface discovery have tighter constraints.

| Endpoint Category | Rate Limit | Burst Allowance |
|-------------------|-----------|-----------------|
| Health/Status | 1000/min | 100 burst |
| Discovery/Listing | 100/min | 20 burst |
| Analysis/Computation | 20/min | 5 burst |
| Write Operations | 30/min | 10 burst |

### Rate Limit Headers

Every response includes standard rate limit headers that inform clients of their current consumption:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1707734460
```

Clients that exceed their rate limit receive a 429 response with a `Retry-After` header indicating when they can resume making requests.

## OpenAPI Specification

The auto-generated OpenAPI 3.0 specification is the API's definitive contract. It is derived entirely from the Elixir source code and is regenerated on each request to ensure accuracy.

The specification includes complete path definitions with parameter schemas, request body schemas for POST endpoints, response schemas for both success and error cases, authentication scheme definitions, and server information. The specification is valid OpenAPI 3.0 and can be consumed by any OpenAPI-compatible tooling including code generators, documentation platforms, and testing frameworks.

```bash
# Download and validate the OpenAPI spec
curl http://localhost:4004/api/openapi -o prismatic-api.json

# Generate a Python client from the spec
openapi-generator generate -i prismatic-api.json -g python -o ./prismatic-client

# Generate a TypeScript client
openapi-generator generate -i prismatic-api.json -g typescript-fetch -o ./prismatic-ts-client
```

The specification's self-generating nature means it never drifts from the implementation. When a developer adds a new public function with a `@doc` and `@spec` to a facade module, the OpenAPI specification reflects that addition at the next scanner run without any manual intervention.

## SDK and Client Libraries

While the API can be consumed with any HTTP client, the auto-generated OpenAPI specification enables the creation of strongly-typed client libraries for any language with OpenAPI tooling.

### Elixir Client

```elixir
# Direct Elixir consumption using standard HTTP client
defmodule PrismaticClient do
  @base_url "http://localhost:4004/api/v1"

  @spec discover(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def discover(domain, opts \\ []) do
    headers = [
      {"Authorization", "Bearer #{opts[:token]}"},
      {"Content-Type", "application/json"}
    ]

    body = Jason.encode!(%{domain: domain})

    case HTTPoison.post("#{@base_url}/perimeter/discover", body, headers) do
      {:ok, %{status_code: 200, body: body}} ->
        {:ok, Jason.decode!(body)}

      {:ok, %{status_code: status, body: body}} ->
        {:error, {status, Jason.decode!(body)}}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

### curl Examples

```bash
# Discover attack surface
curl -X POST http://localhost:4004/api/v1/perimeter/discover \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}'

# Get security rating
curl http://localhost:4004/api/v1/perimeter/security_rating?domain=example.com \
  -H "Authorization: Bearer $API_TOKEN"

# List all agents
curl http://localhost:4004/api/v1/agents/list_agents \
  -H "Authorization: Bearer $API_TOKEN"

# Check quality score
curl http://localhost:4004/api/v1/quality/quality_score \
  -H "Authorization: Bearer $API_TOKEN"
```

### Python Client

```python
import requests

class PrismaticAPI:
    def __init__(self, base_url="http://localhost:4004/api/v1", token=None):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers["Authorization"] = f"Bearer {token}"
        self.session.headers["Content-Type"] = "application/json"

    def discover(self, domain):
        resp = self.session.post(
            f"{self.base_url}/perimeter/discover",
            json={"domain": domain}
        )
        resp.raise_for_status()
        return resp.json()

    def security_rating(self, domain):
        resp = self.session.get(
            f"{self.base_url}/perimeter/security_rating",
            params={"domain": domain}
        )
        resp.raise_for_status()
        return resp.json()
```

## Webhooks and Events

The API supports webhook subscriptions for real-time notification of platform events. Consumers register webhook URLs and specify the event types they want to receive. When a matching event occurs, the API delivers a signed JSON payload to the registered URL.

### Supported Event Types

| Event | Description |
|-------|-------------|
| `endpoint.discovered` | New endpoint discovered during scanner run |
| `endpoint.removed` | Previously discovered endpoint no longer available |
| `perimeter.scan_complete` | Attack surface scan completed |
| `quality.gate_result` | Quality gate execution completed |
| `agent.status_change` | Agent transitioned between states |

### Webhook Payload Format

```json
{
  "event": "perimeter.scan_complete",
  "timestamp": "2026-02-12T14:30:00Z",
  "data": {
    "domain": "example.com",
    "assets_discovered": 42,
    "security_grade": "B",
    "scan_duration_ms": 3500
  },
  "signature": "sha256=abc123..."
}
```

Webhook payloads include an HMAC-SHA256 signature computed from the payload body and a shared secret, allowing consumers to verify payload authenticity and reject tampering attempts.

## Lab Integration

The API's auto-discovery mechanism creates a natural integration pathway with the [Lab](@/lab/_index.md). When a Lab experiment graduates to production, its public functions are implemented in the appropriate Prismatic facade module. At the next scanner run (or immediately if a live rescan is triggered), these functions appear as new API endpoints with full documentation and type schemas.

This integration means that the journey from validated Lab prototype to publicly accessible API endpoint is fully automated. The experiment team does not need to write controller code, define routes, or author OpenAPI annotations. They implement the function with proper `@doc` and `@spec` annotations, and the API infrastructure does the rest.

The `endpoint.discovered` webhook event notifies interested consumers when new endpoints become available, enabling downstream systems to adapt automatically to expanded API capabilities.

## Academy Integration

The API serves as the reference documentation layer for the [Academy](@/academy/_index.md). When the Academy teaches a concept such as epistemic validation or attack surface management, it links to the corresponding API endpoint documentation for precise technical specifications.

This separation of concerns allows the Academy to focus on teaching why and how concepts work, while the API provides the exact what: parameter names, types, required fields, response formats, and error codes. The Academy teaches understanding; the API provides specification. Together they give learners both the conceptual foundation and the technical reference needed to work effectively with the platform.

The OpenAPI specification also serves as a practical exercise resource for Academy courses. Learners can import the specification into Postman, Insomnia, or similar tools and interact with the API hands-on while studying the corresponding Academy material.

The Prismatic API demonstrates that API development does not require a tradeoff between completeness and maintainability. By leveraging Elixir's introspection capabilities, the API achieves both: it is always complete because it discovers everything, and it is always maintainable because there is no separate specification to keep in sync. The source code is the specification.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
