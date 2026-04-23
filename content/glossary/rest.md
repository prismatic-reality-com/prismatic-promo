+++
title = "REST API"
weight = 50
[extra]
tags = ["glossary", "technical", "rest", "api", "http", "openapi", "auto-introspection", "phoenix", "json", "web-services"]
description = "REST (Representational State Transfer) API design encompasses the architectural style, constraints, and implementation patterns for building scalable web services, including the Prismatic Platform's auto-introspecting REST gateway that discovers and exposes all facade module functions as a fully documented OpenAPI 3.0 API."
category = "technical"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["api", "api-gateway", "api-integration", "prismatic-api", "openapi", "openapi-spec", "phoenix-framework", "phoenix", "elixir", "authentication", "authorization", "json", "telemetry"]
learning_outcomes = ["Design RESTful APIs that follow Richardson Maturity Model Level 3", "Implement auto-introspecting API gateways using Elixir module introspection", "Build OpenAPI 3.0 specifications from Elixir typespecs automatically", "Apply REST constraints to Phoenix-based web services", "Understand the Prismatic API's automatic endpoint discovery architecture"]
prerequisites = ["api", "elixir", "phoenix-framework", "openapi"]
key_concepts = ["REST constraints", "resource-oriented design", "statelessness", "HATEOAS", "content negotiation", "auto-introspection", "facade module pattern", "OpenAPI specification", "HTTP method semantics", "Richardson Maturity Model"]
use_cases = ["Public API design for platform consumers", "Internal service-to-service communication", "Auto-generated API documentation", "SDK generation from OpenAPI specs", "Third-party integration endpoints"]
platform_relevance = "critical"
importance = "critical"
version = "3.0.0"
date_created = "2026-02-22"
date_updated = "2026-02-22"
elixir_modules = ["PrismaticApi.Router", "PrismaticApi.DispatchController", "PrismaticApi.Scanner", "PrismaticApi.TypeMapper", "PrismaticApi.ApiSpec"]
audience = ["backend-engineers", "api-consumers", "integration-architects", "frontend-developers"]
domain = "api-design"
related_patterns = ["resource-oriented-design", "auto-introspection", "facade-pattern", "generic-dispatch", "type-driven-api"]
see_also = ["api", "api-gateway", "openapi", "phoenix-framework", "webhooks"]
acronyms = ["REST = Representational State Transfer", "API = Application Programming Interface", "HATEOAS = Hypermedia As The Engine Of Application State", "RBAC = Role-Based Access Control"]
standards = ["HTTP/1.1 RFC 7231", "OpenAPI 3.0", "JSON RFC 8259", "Richardson Maturity Model"]
tools = ["mix phx.server", "curl", "openapi-generator", "swagger-ui"]
platforms = ["prismatic-platform", "elixir-otp", "phoenix-liveview", "fly-io"]
word_count = 1312
date_modified = "2026-02-23"
keywords = ["REST", "API", "Representational", "State", "Transfer", "Prismatic", "Platforms", "glossary", "technical", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "REST API - Prismatic Platform"
+++

## Definition

REST (Representational State Transfer) is an architectural style for designing networked applications, originally described by Roy Fielding in his 2000 doctoral dissertation. A REST API (Application Programming Interface) is a web service that adheres to REST constraints, using HTTP as the transport protocol and standard HTTP methods (GET, POST, PUT, PATCH, DELETE) to perform operations on resources identified by URIs. REST APIs communicate primarily via JSON (or XML) representations and are designed to be stateless, cacheable, and uniformly interfaced.

In the Prismatic Platform, REST API design takes on additional significance through the **Prismatic API** -- an auto-introspecting REST gateway that automatically discovers all public functions across all `Prismatic*` facade modules via Elixir introspection capabilities (`Code.fetch_docs/1`, `Code.Typespec.fetch_specs/1`, `Module.__info__/1`) and exposes them as a fully documented [OpenAPI](/glossary/openapi/) 3.0 REST API with zero manual configuration. This auto-introspection approach represents a novel contribution to REST API design: instead of manually defining routes and handlers, the API surface is derived directly from the codebase's type system and documentation.

## REST Constraints

Fielding's original REST architectural style defines six constraints that a system must satisfy to be considered RESTful. Understanding these constraints is essential for designing APIs that are truly RESTful rather than merely HTTP-based.

### Client-Server

The client and server are separated by a uniform interface. The client does not need to know about data storage (which remains on the server), and the server does not need to know about the user interface. This separation improves portability (clients can evolve independently) and scalability (servers can be simplified).

### Statelessness

Each request from client to server must contain all information necessary to understand and process the request. The server does not store client state between requests. Session state is kept entirely on the client. This constraint improves reliability (any server can handle any request), scalability (no session affinity required), and visibility (each request is self-contained and can be independently monitored).

### Cacheability

Responses must explicitly or implicitly define themselves as cacheable or non-cacheable. When a response is cacheable, the client (or intermediate proxy) can reuse the response data for equivalent requests, reducing latency and server load.

### Layered System

A client cannot ordinarily tell whether it is connected directly to the end server or to an intermediary. Intermediary servers (load balancers, caches, gateways) can improve scalability and enforce security policies without the client's knowledge.

### Uniform Interface

The uniform interface constraint is REST's most distinguishing feature. It simplifies and decouples the architecture, enabling each part to evolve independently. The uniform interface comprises four sub-constraints: resource identification through URIs, manipulation of resources through representations, self-descriptive messages, and hypermedia as the engine of application state (HATEOAS).

### Code on Demand (Optional)

Servers can temporarily extend or customize client functionality by transferring executable code (e.g., JavaScript). This is the only optional REST constraint.

## Richardson Maturity Model

Leonard Richardson's Maturity Model categorizes REST APIs into four levels of RESTful maturity:

| Level | Description | Example |
|-------|-------------|---------|
| 0 | Single URI, single HTTP method | SOAP-style RPC over POST |
| 1 | Multiple URIs (resources), single method | `/api/users`, `/api/orders` but all POST |
| 2 | Multiple URIs + proper HTTP methods | GET `/api/users`, POST `/api/users`, DELETE `/api/users/123` |
| 3 | Level 2 + HATEOAS (hypermedia controls) | Responses include links to related resources |

The Prismatic API targets Level 2 with elements of Level 3, using proper HTTP methods and including endpoint discovery through the `/api/v1/endpoints` resource.

## The Prismatic API Architecture

The [Prismatic API](/glossary/prismatic-api/) is a standalone Phoenix application running on port 4004 that implements a novel auto-introspecting REST gateway. Instead of manually defining routes and controllers for each endpoint, the API scans all `Prismatic*` modules at boot time, discovers their public functions, maps their Elixir typespecs to OpenAPI JSON Schema, and exposes them through a single generic dispatch controller.

### Architecture Overview

```
Boot-time Scanner
    │
    ▼
Module Discovery (Code.ensure_loaded/1 + Module.__info__/1)
    │
    ▼
Type Extraction (Code.Typespec.fetch_specs/1)
    │
    ▼
Registry (ETS) ──────────────────► DispatchController
    │                                    │
    ▼                                    ▼
TypeMapper ──► OpenApiSpex Schema   safe_apply(Module, :function, args) ──► JSON
    │
    ▼
ApiSpec ──► SwaggerUI (/api/swaggerui)
```

### Auto-Discovery Scanner

The scanner runs at application startup and discovers all eligible facade modules:

```elixir
defmodule PrismaticApi.Scanner do
  @moduledoc """
  Boot-time scanner that discovers all Prismatic* facade modules
  and their public functions, building an ETS-backed registry
  of available API endpoints.

  The scanner uses Elixir's introspection capabilities to:
  1. Find all loaded modules matching the Prismatic* pattern
  2. Extract public function signatures via Module.__info__(:functions)
  3. Fetch @spec annotations via Code.Typespec.fetch_specs/1
  4. Fetch @doc annotations via Code.fetch_docs/1
  5. Register each function as an API endpoint in ETS

  Zero manual configuration required -- adding a new public function
  to any Prismatic* facade module automatically creates a new API
  endpoint after the next application restart.
  """

  @type endpoint :: %{
    app: String.t(),
    action: String.t(),
    module: module(),
    function: atom(),
    arity: non_neg_integer(),
    spec: term() | nil,
    doc: String.t() | nil,
    http_method: :get | :post
  }

  @registry_table :prismatic_api_endpoints

  @spec scan() :: {:ok, non_neg_integer()}
  def scan do
    :ets.new(@registry_table, [:named_table, :set, :public, read_concurrency: true])

    endpoints =
      discover_modules()
      |> Enum.flat_map(&extract_endpoints/1)
      |> Enum.each(&register_endpoint/1)

    count = :ets.info(@registry_table, :size)
    {:ok, count}
  end

  @spec lookup(String.t(), String.t()) :: {:ok, endpoint()} | {:error, :not_found}
  def lookup(app, action) do
    case :ets.lookup(@registry_table, {app, action}) do
      [{_key, endpoint}] -> {:ok, endpoint}
      [] -> {:error, :not_found}
    end
  end

  @spec all_endpoints() :: [endpoint()]
  def all_endpoints do
    :ets.tab2list(@registry_table)
    |> Enum.map(fn {_key, endpoint} -> endpoint end)
    |> Enum.sort_by(fn e -> {e.app, e.action} end)
  end

  defp discover_modules do
    :code.all_loaded()
    |> Enum.map(fn {mod, _} -> mod end)
    |> Enum.filter(&prismatic_facade?/1)
  end

  defp prismatic_facade?(module) do
    name = Atom.to_string(module)
    String.starts_with?(name, "Elixir.Prismatic") and
    not String.contains?(name, ".Impl.") and
    not String.contains?(name, ".Private.")
  end

  defp extract_endpoints(module) do
    functions = module.__info__(:functions)
    specs = fetch_specs(module)
    docs = fetch_docs(module)

    Enum.map(functions, fn {func, arity} ->
      app = module_to_app(module)
      action = Atom.to_string(func)

      %{
        app: app,
        action: action,
        module: module,
        function: func,
        arity: arity,
        spec: Map.get(specs, {func, arity}),
        doc: Map.get(docs, {func, arity}),
        http_method: if(arity <= 2, do: :get, else: :post)
      }
    end)
  end

  defp fetch_specs(module) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} -> Map.new(specs, fn {{f, a}, spec} -> {{f, a}, spec} end)
      :error -> %{}
    end
  end

  defp fetch_docs(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, _, _, _, _, docs} ->
        Map.new(docs, fn {{:function, name, arity}, _, _, doc, _} ->
          doc_text = case doc do
            %{"en" => text} -> text
            _ -> nil
          end
          {{name, arity}, doc_text}
        end)

      _ ->
        %{}
    end
  end

  defp module_to_app(module) do
    module
    |> Module.split()
    |> Enum.at(0, "prismatic")
    |> Macro.underscore()
  end

  defp register_endpoint(endpoint) do
    :ets.insert(@registry_table, {{endpoint.app, endpoint.action}, endpoint})
  end
end
```

### Type Mapper

The TypeMapper converts Elixir typespec AST into OpenAPI JSON Schema definitions:

```elixir
defmodule PrismaticApi.TypeMapper do
  @moduledoc """
  Maps Elixir @spec type AST to OpenAPI 3.0 JSON Schema definitions.

  Handles common Elixir types:
  - Primitives: atom, integer, float, binary/string, boolean
  - Collections: list, map, keyword
  - Tagged tuples: {:ok, result} | {:error, reason}
  - Custom types: resolves @type definitions recursively

  The mapping enables automatic OpenAPI spec generation from
  existing Elixir typespecs without manual schema definitions.
  """

  @type json_schema :: %{
    type: String.t(),
    properties: %{String.t() => json_schema()} | nil,
    items: json_schema() | nil,
    description: String.t() | nil
  }

  @spec map_type(term()) :: json_schema()
  def map_type({:type, _, :integer, []}) do
    %{type: "integer"}
  end

  def map_type({:type, _, :float, []}) do
    %{type: "number", format: "float"}
  end

  def map_type({:type, _, :binary, []}) do
    %{type: "string"}
  end

  def map_type({:type, _, :boolean, []}) do
    %{type: "boolean"}
  end

  def map_type({:type, _, :atom, []}) do
    %{type: "string", description: "Elixir atom serialized as string"}
  end

  def map_type({:type, _, :list, [inner_type]}) do
    %{type: "array", items: map_type(inner_type)}
  end

  def map_type({:type, _, :map, fields}) do
    properties = Map.new(fields, fn {key, type} ->
      {Atom.to_string(key), map_type(type)}
    end)

    %{type: "object", properties: properties}
  end

  def map_type({:type, _, :union, types}) do
    %{oneOf: Enum.map(types, &map_type/1)}
  end

  def map_type(_unknown) do
    %{type: "object", description: "Complex Elixir type"}
  end
end
```

### Generic Dispatch Controller

The dispatch controller resolves incoming API requests to module/function calls:

```elixir
defmodule PrismaticApi.DispatchController do
  @moduledoc """
  Generic dispatch controller that resolves REST API requests
  to Elixir module/function invocations via the endpoint registry.

  Routes:
  - GET  /api/v1/:app/:action       -> Module.function() or Module.function(param)
  - POST /api/v1/:app/:action       -> Module.function(body_params)
  - GET  /api/v1/endpoints           -> List all discovered endpoints
  - GET  /api/v1/health              -> Health check

  The controller performs safe dispatch through safe_apply/3,
  which wraps the function call in error handling and emits
  telemetry events for observability.
  """

  use PrismaticApi, :controller

  @spec dispatch(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def dispatch(conn, %{"app" => app, "action" => action} = params) do
    case PrismaticApi.Scanner.lookup(app, action) do
      {:ok, endpoint} ->
        args = extract_args(conn, params, endpoint)
        result = safe_apply(endpoint.module, endpoint.function, args)
        render_result(conn, result)

      {:error, :not_found} ->
        conn
        |> put_status(404)
        |> json(%{error: "Endpoint not found", app: app, action: action})
    end
  end

  @spec health(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def health(conn, _params) do
    json(conn, %{
      status: "healthy",
      timestamp: DateTime.utc_now(),
      version: Application.spec(:prismatic_api, :vsn) |> to_string()
    })
  end

  @spec endpoints(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def endpoints(conn, _params) do
    all = PrismaticApi.Scanner.all_endpoints()

    endpoints_json = Enum.map(all, fn ep ->
      %{
        app: ep.app,
        action: ep.action,
        method: ep.http_method |> Atom.to_string() |> String.upcase(),
        arity: ep.arity,
        doc: ep.doc,
        path: "/api/v1/#{ep.app}/#{ep.action}"
      }
    end)

    json(conn, %{endpoints: endpoints_json, count: length(endpoints_json)})
  end

  defp extract_args(conn, params, endpoint) do
    case conn.method do
      "GET" ->
        query_params = Map.drop(params, ["app", "action"])
        if map_size(query_params) > 0, do: [query_params], else: []

      "POST" ->
        body = conn.body_params
        if endpoint.arity > 0, do: [body], else: []

      _ ->
        []
    end
  end

  defp safe_apply(module, function, args) do
    start_time = System.monotonic_time(:millisecond)

    try do
      result = apply(module, function, args)
      duration = System.monotonic_time(:millisecond) - start_time

      :telemetry.execute(
        [:prismatic, :api, :dispatch],
        %{duration_ms: duration},
        %{module: module, function: function, status: :ok}
      )

      {:ok, result}
    rescue
      error ->
        duration = System.monotonic_time(:millisecond) - start_time

        :telemetry.execute(
          [:prismatic, :api, :dispatch],
          %{duration_ms: duration},
          %{module: module, function: function, status: :error}
        )

        {:error, Exception.message(error)}
    end
  end

  defp render_result(conn, {:ok, result}) do
    json(conn, %{data: result, status: "success"})
  end

  defp render_result(conn, {:error, message}) do
    conn
    |> put_status(500)
    |> json(%{error: message, status: "error"})
  end
end
```

## REST API Design Best Practices

### Resource Naming

Resources should be nouns (not verbs), use plural forms for collections, and follow a consistent hierarchy:

```
GET    /api/v1/perimeter/assets          # List assets
GET    /api/v1/perimeter/assets/123      # Get specific asset
POST   /api/v1/perimeter/assets          # Create asset
PUT    /api/v1/perimeter/assets/123      # Replace asset
PATCH  /api/v1/perimeter/assets/123      # Update asset
DELETE /api/v1/perimeter/assets/123      # Delete asset
```

### HTTP Method Semantics

| Method | Idempotent | Safe | Use Case |
|--------|-----------|------|----------|
| GET | Yes | Yes | Retrieve resources |
| POST | No | No | Create resources, trigger actions |
| PUT | Yes | No | Replace entire resource |
| PATCH | No | No | Partial update |
| DELETE | Yes | No | Remove resource |
| HEAD | Yes | Yes | Check resource existence |
| OPTIONS | Yes | Yes | Discover allowed methods |

### Status Codes

The Prismatic API uses standard HTTP status codes consistently:

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST that created a resource |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Malformed request, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource or endpoint does not exist |
| 409 | Conflict | Resource state conflict (e.g., duplicate) |
| 422 | Unprocessable Entity | Semantic validation failure |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server failure |

### Pagination

Collections support pagination through query parameters:

```
GET /api/v1/perimeter/assets?page=2&page_size=25
```

Response includes pagination metadata:

```json
{
  "data": [...],
  "meta": {
    "page": 2,
    "page_size": 25,
    "total_count": 347,
    "total_pages": 14
  }
}
```

### Filtering and Sorting

```
GET /api/v1/perimeter/assets?type=domain&sort=-created_at&severity=high
```

The `-` prefix on sort fields indicates descending order.

## Security Considerations

REST API security in the Prismatic Platform follows defense-in-depth principles.

### Authentication

The API inherits `PrismaticWeb.Plugs.APIAuth`, which supports API key [authentication](/glossary/authentication/) via the `Authorization` header and session-based authentication for browser-based clients accessing the SwaggerUI.

### Authorization

Role-based access control (RBAC) restricts which endpoints each authenticated principal can access. The [authorization](/glossary/authorization/) layer checks permissions before dispatch, ensuring that the generic dispatch controller cannot be used to invoke privileged functions.

### Rate Limiting

All API endpoints are rate-limited to prevent abuse. Default limits are 100 requests per minute per API key, with higher limits available for authenticated service accounts.

### Input Validation

The TypeMapper's OpenAPI schema definitions are used for request validation via OpenApiSpex. Invalid requests are rejected with 400/422 responses before reaching the dispatch controller, preventing malformed input from reaching application code.

## Performance Characteristics

The Prismatic API is designed to meet the platform's strict performance requirements:

| Metric | Target | Actual |
|--------|--------|--------|
| Health check response | < 10ms | < 5ms |
| Endpoint listing | < 50ms | < 20ms |
| Simple dispatch (0-1 args) | < 100ms | 30-80ms |
| Complex dispatch (2+ args) | < 250ms | 50-200ms |
| OpenAPI spec generation | < 500ms | < 300ms |

The ETS-backed endpoint registry provides O(1) lookup for endpoint resolution, ensuring that the dispatch overhead is constant regardless of the number of registered endpoints.

## OpenAPI Integration

The Prismatic API generates a complete OpenAPI 3.0 specification from discovered endpoints, including request/response schemas derived from Elixir typespecs. The specification is available at `/api/openapi` (JSON) and rendered interactively at `/api/swaggerui`.

This auto-generated specification can be used to:

- Generate client SDKs in any language (via openapi-generator)
- Produce API documentation websites
- Import into API testing tools (Postman, Insomnia)
- Validate API contracts in CI/CD pipelines

## Comparison with Alternatives

| Approach | Manual Effort | Type Safety | Documentation | Prismatic Approach |
|----------|--------------|-------------|---------------|-------------------|
| Manual Phoenix routes | High | Manual validation | Manual | Auto-discovered from code |
| GraphQL | Medium | Schema-defined | Built-in | REST with auto-OpenAPI |
| gRPC | Medium | Protobuf-defined | Generated | HTTP/JSON for accessibility |
| tRPC | Low | TypeScript-native | Generated | Elixir-native introspection |

The Prismatic API's auto-introspection approach is most similar to tRPC's philosophy (derive the API from the code) but applied to Elixir's type system and HTTP/JSON rather than TypeScript and RPC.

## Versioning Strategy

The API uses URL-based versioning (`/api/v1/...`) to enable non-breaking evolution. When breaking changes are necessary, a new version prefix (`/api/v2/...`) is introduced while maintaining the previous version for a deprecation period.

## Testing REST APIs

REST API endpoints in the Prismatic Platform are tested at three levels:

1. **Unit tests** -- Test individual dispatch functions with mocked dependencies
2. **Integration tests** -- Test the full request/response cycle through `Phoenix.ConnTest`
3. **Contract tests** -- Validate that the API conforms to its OpenAPI specification

## Related Concepts

- [API](/glossary/api/) -- General API concepts and patterns
- [API Gateway](/glossary/api-gateway/) -- Gateway patterns for API routing
- [API Integration](/glossary/api-integration/) -- Connecting to external APIs
- [Prismatic API](/glossary/prismatic-api/) -- The auto-introspecting REST gateway
- [OpenAPI](/glossary/openapi/) -- API specification standard
- [OpenAPI Spec](/glossary/openapi-spec/) -- Specification format details
- [Phoenix Framework](/glossary/phoenix-framework/) -- Elixir web framework
- [Phoenix](/glossary/phoenix/) -- Phoenix ecosystem overview
- [Authentication](/glossary/authentication/) -- Identity verification
- [Authorization](/glossary/authorization/) -- Access control
- [Telemetry](/glossary/telemetry/) -- Observability infrastructure
- [Elixir](/glossary/elixir/) -- Programming language foundation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
