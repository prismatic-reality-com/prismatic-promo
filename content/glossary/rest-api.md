+++
title = "REST API"
weight = 20
[extra]
category = "technology"
description = "Representational State Transfer architectural style for stateless HTTP service interfaces with resource-oriented URLs and standard HTTP methods."
related_terms = ["api-gateway", "openapi", "plug", "phoenix", "jwt", "rate-limiting", "rbac", "graphql", "endpoint", "websocket"]
acronym = "REST"
full_name = "Representational State Transfer"
author = "Roy Fielding"
year_introduced = "2000"
paradigm = "Architectural Style"
difficulty = "Intermediate"
platforms = ["Phoenix", "Plug", "OpenApiSpex"]
prismatic_apps = ["prismatic_api", "prismatic_web", "prismatic_perimeter"]
http_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
constraints = ["Client-Server", "Stateless", "Cacheable", "Layered System", "Uniform Interface", "Code on Demand"]
port = "4004"
documentation_url = "/api/swagger-ui"
spec_url = "/api/openapi"
authentication = "JWT Bearer Token"
authorization = "RBAC"
rate_limiting = "Token Bucket per Client"
content_type = "application/json"
versioning_strategy = "URL Path (/api/v1/)"
reading_time = "7 min"
word_count = 1301
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["REST", "API", "Representational", "State", "Transfer", "HTTP", "URLs", "glossary", "technology", "Prismatic Platform"]
tags = ["glossary", "technology", "rest-api", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "REST API - Prismatic Platform"
+++

## Definition

REST (Representational State Transfer) is an architectural style for designing networked applications, defined by Roy Fielding in his 2000 doctoral dissertation. RESTful APIs use standard HTTP methods (GET, POST, PUT, PATCH, DELETE) to perform operations on resources identified by URLs, following a set of constraints that promote scalability, simplicity, and reliability. The six REST constraints are: client-server separation, statelessness (each request contains all information needed for processing), cacheability (responses declare whether they can be cached), layered system (intermediaries like load balancers and CDNs are transparent), uniform interface (standardized resource interaction), and optional code-on-demand (servers can extend client functionality with executable code).

The statelessness constraint is particularly significant for distributed systems: because no server-side session state is maintained between requests, any server instance can handle any request, enabling horizontal scaling through [load balancing](@/glossary/load-balancing.md) without sticky sessions. Each request carries its own authentication token (typically a [JWT](@/glossary/jwt.md)), request context, and parameters. This makes REST APIs naturally suited to cloud deployments, microservice architectures, and edge computing where requests may be handled by different instances on successive calls.

REST APIs follow conventions for resource naming (plural nouns for collections: `/api/v1/assets`, singular with ID for items: `/api/v1/assets/123`), HTTP status codes (200 for success, 201 for creation, 400 for client error, 404 for not found, 500 for server error), content negotiation (Accept and Content-Type headers), and hypermedia controls (HATEOAS -- links in responses that describe available actions). While few APIs implement full HATEOAS, the resource-oriented URL structure and standard method semantics have become the dominant pattern for web service interfaces.

## Historical Context

Roy Fielding formalized REST in Chapter 5 of his doctoral dissertation at the University of California, Irvine, titled "Architectural Styles and the Design of Network-based Software Architectures." Fielding was one of the principal authors of the HTTP/1.1 specification (RFC 2616) and co-founded the Apache HTTP Server project. REST was not invented as a new protocol but rather described as the architectural style underlying the existing World Wide Web -- HTTP, URIs, and HTML already embodied REST principles.

The adoption of REST for web APIs accelerated around 2005-2008 as an alternative to SOAP (Simple Object Access Protocol), which was perceived as heavyweight and complex. REST's simplicity -- using plain HTTP semantics rather than XML envelopes and WSDLs -- made it accessible to developers working with any language or platform. By 2010, REST had become the dominant API style, and by 2020, virtually all major web services (AWS, Google Cloud, GitHub, Stripe) offered REST APIs as their primary interface.

The Richardson Maturity Model, proposed by Leonard Richardson, classifies REST APIs into four levels of maturity: Level 0 (single URI, single method), Level 1 (multiple URIs for resources), Level 2 (HTTP verbs used correctly), and Level 3 (hypermedia controls / HATEOAS). Most production APIs operate at Level 2, using resource-oriented URLs with correct HTTP method semantics but without full HATEOAS.

## Context in Prismatic

The Prismatic API (`prismatic_api` app, port 4004) is an auto-introspecting REST gateway that discovers all public functions across `Prismatic*` facade modules at boot time and exposes them as [OpenAPI](@/glossary/openapi.md) 3.0 documented endpoints. This approach eliminates manual route configuration -- when a new public function is added to any Prismatic facade module, it automatically becomes available as a REST endpoint after the next boot. The generic dispatch controller resolves `{app, action}` tuples to `module.function(args)` calls, using GET for 0-2 parameter queries and POST for commands with larger payloads.

The API is built on [Phoenix](@/glossary/phoenix.md) with a dedicated [Endpoint](@/glossary/endpoint.md) on port 4004, separating API traffic from the [LiveView](@/glossary/liveview.md) dashboard on port 4000. Authentication uses [JWT](@/glossary/jwt.md) tokens validated through `PrismaticWeb.Plugs.APIAuth`, with [RBAC](@/glossary/rbac.md) (Role-Based Access Control) governing endpoint permissions. [Rate limiting](@/glossary/rate-limiting.md) protects against abuse, and all endpoints are documented through OpenApiSpex with SwaggerUI available at `/api/swagger-ui`.

## HTTP Methods and Resource Operations

REST maps CRUD operations to HTTP methods with standardized semantics:

| HTTP Method | CRUD | Idempotent | Safe | Example |
|-------------|------|-----------|------|---------|
| **GET** | Read | Yes | Yes | `GET /api/v1/assets` |
| **POST** | Create | No | No | `POST /api/v1/perimeter/discover` |
| **PUT** | Replace | Yes | No | `PUT /api/v1/assets/123` |
| **PATCH** | Partial Update | No* | No | `PATCH /api/v1/assets/123` |
| **DELETE** | Delete | Yes | No | `DELETE /api/v1/assets/123` |
| **HEAD** | Metadata | Yes | Yes | `HEAD /api/v1/assets` |
| **OPTIONS** | Capabilities | Yes | Yes | `OPTIONS /api/v1/assets` |

*PATCH can be made idempotent with conditional headers (If-Match).

[Idempotency](@/glossary/idempotency.md) is critical for reliability -- idempotent operations can be safely retried on network failure without creating duplicate resources or applying changes twice. The Prismatic API enforces idempotency keys for POST requests to enable safe retries in distributed environments.

## Prismatic Auto-Introspecting API Architecture

The Prismatic API's automatic endpoint discovery eliminates boilerplate:

```
Boot Time:
  Scanner.scan_modules()
    --> Finds all Prismatic* facade modules
    --> Code.fetch_docs/1 extracts documentation
    --> Code.Typespec.fetch_specs/1 extracts @spec types
    --> Module.__info__(:functions) lists public functions
    --> TypeMapper converts Elixir types to OpenAPI schemas
    --> Registry (ETS) stores endpoint metadata
    --> ApiSpec generates OpenAPI 3.0 specification

Request Time:
  GET /api/v1/perimeter/discover?domain=example.com
    --> DispatchController.call(conn, %{app: "perimeter", action: "discover"})
    --> Registry.lookup("perimeter", "discover")
    --> safe_apply(PrismaticPerimeter, :discover, ["example.com"])
    --> JSON response with OpenAPI-compliant structure
```

```elixir
defmodule PrismaticApi.DispatchController do
  @moduledoc """
  Generic REST dispatch controller for auto-discovered endpoints.

  Resolves {app, action} tuples to module function calls via the
  endpoint registry. Handles parameter extraction, type coercion,
  and standardized error formatting.
  """
  use PrismaticApi, :controller

  @spec call(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def call(conn, %{"app" => app, "action" => action}) do
    with {:ok, endpoint} <- Registry.lookup(app, action),
         {:ok, args} <- extract_args(conn, endpoint),
         {:ok, result} <- safe_apply(endpoint.module, endpoint.function, args) do
      conn
      |> put_status(200)
      |> json(%{data: result, meta: %{endpoint: "#{app}/#{action}"}})
    else
      {:error, :not_found} -> send_error(conn, 404, "Endpoint not found")
      {:error, :bad_request, msg} -> send_error(conn, 400, msg)
      {:error, reason} -> send_error(conn, 500, inspect(reason))
    end
  end

  @spec safe_apply(module(), atom(), [term()]) :: {:ok, term()} | {:error, term()}
  defp safe_apply(module, function, args) do
    result = apply(module, function, args)
    {:ok, result}
  rescue
    e -> {:error, Exception.message(e)}
  end
end
```

## HTTP Status Codes

REST APIs communicate outcomes through standardized status codes:

| Range | Category | Common Codes | Prismatic Usage |
|-------|----------|-------------|----------------|
| **2xx** | Success | 200 OK, 201 Created, 204 No Content | Successful operations |
| **3xx** | Redirection | 301 Moved, 304 Not Modified | API versioning, caching |
| **4xx** | Client Error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable, 429 Too Many Requests | Validation, auth, rate limiting |
| **5xx** | Server Error | 500 Internal, 502 Bad Gateway, 503 Unavailable | Application errors, overload |

```elixir
defmodule PrismaticApi.ErrorFormatter do
  @moduledoc "Standardized REST API error response formatting."

  @spec format_error(integer(), String.t(), map()) :: map()
  def format_error(status, message, details \\ %{}) do
    %{
      "error" => %{
        "code" => status_to_code(status),
        "message" => message,
        "details" => details
      },
      "meta" => %{
        "request_id" => generate_request_id(),
        "timestamp" => DateTime.utc_now() |> DateTime.to_iso8601()
      }
    }
  end

  @spec status_to_code(integer()) :: String.t()
  defp status_to_code(400), do: "BAD_REQUEST"
  defp status_to_code(401), do: "UNAUTHORIZED"
  defp status_to_code(403), do: "FORBIDDEN"
  defp status_to_code(404), do: "NOT_FOUND"
  defp status_to_code(422), do: "UNPROCESSABLE_ENTITY"
  defp status_to_code(429), do: "RATE_LIMITED"
  defp status_to_code(500), do: "INTERNAL_ERROR"
  defp status_to_code(_), do: "UNKNOWN_ERROR"
end
```

## API Versioning

The Prismatic API uses URL-based versioning for clarity and cache-friendliness:

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| **URL Path** (used) | `/api/v1/assets` | Clear, cacheable, easy routing | URL pollution |
| **Header** | `Accept: application/vnd.prismatic.v1+json` | Clean URLs | Hidden, harder to test |
| **Query Parameter** | `/api/assets?version=1` | Simple | Not RESTful, cache issues |

The URL path strategy was chosen because it provides the best developer experience: endpoints are self-documenting, curl commands include the version explicitly, and CDN caching rules can be version-aware without inspecting headers.

## OpenAPI Integration

The Prismatic API generates a complete [OpenAPI](@/glossary/openapi.md) 3.0 specification from Elixir typespecs:

```elixir
defmodule PrismaticApi.TypeMapper do
  @moduledoc """
  Maps Elixir @spec AST to OpenAPI JSON Schema.

  Converts typespec type annotations extracted via Code.Typespec
  into OpenAPI-compatible JSON Schema definitions for automatic
  API documentation generation.
  """

  @spec elixir_to_openapi(term()) :: map()
  def elixir_to_openapi({:type, _, :binary, []}) do
    %{"type" => "string"}
  end

  def elixir_to_openapi({:type, _, :integer, []}) do
    %{"type" => "integer"}
  end

  def elixir_to_openapi({:type, _, :float, []}) do
    %{"type" => "number", "format" => "float"}
  end

  def elixir_to_openapi({:type, _, :boolean, []}) do
    %{"type" => "boolean"}
  end

  def elixir_to_openapi({:type, _, :map, fields}) do
    %{"type" => "object", "properties" => map_fields(fields)}
  end

  def elixir_to_openapi({:type, _, :list, [inner]}) do
    %{"type" => "array", "items" => elixir_to_openapi(inner)}
  end
end
```

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check with dependency status |
| `/api/v1/endpoints` | GET | List all discovered API endpoints |
| `/api/v1/:app/:action` | GET/POST | Generic dispatch to Prismatic functions |
| `/api/openapi` | GET | OpenAPI 3.0 JSON specification |
| `/api/swagger-ui` | GET | Interactive Swagger UI documentation |

## Authentication and Authorization

REST API security in Prismatic uses a layered approach:

| Layer | Mechanism | Implementation |
|-------|-----------|---------------|
| **Transport** | [TLS](@/glossary/tls.md) encryption | Fly.io edge TLS termination |
| **Authentication** | [JWT](@/glossary/jwt.md) bearer tokens | `APIAuth` [Plug](@/glossary/plug.md) in endpoint pipeline |
| **Authorization** | [RBAC](@/glossary/rbac.md) role checks | Per-endpoint permission verification |
| **Rate Limiting** | Token bucket per client | [Rate Limiting](@/glossary/rate-limiting.md) plug |
| **Input Validation** | OpenApiSpex schema validation | Request body/params validation |
| **CORS** | Cross-Origin Resource Sharing | Configurable allowed origins |

```elixir
defmodule PrismaticApi.Router do
  @moduledoc "REST API router with authentication and rate limiting pipeline."
  use Phoenix.Router

  pipeline :api do
    plug :accepts, ["json"]
    plug PrismaticWeb.Plugs.APIAuth
    plug PrismaticWeb.Plugs.RateLimiter
    plug OpenApiSpex.Plug.CastAndValidate
  end

  pipeline :public_api do
    plug :accepts, ["json"]
    plug PrismaticWeb.Plugs.RateLimiter
  end

  scope "/api/v1", PrismaticApi do
    pipe_through :public_api
    get "/health", HealthController, :index
    get "/openapi", SpecController, :index
  end

  scope "/api/v1", PrismaticApi do
    pipe_through :api
    get "/endpoints", EndpointController, :index
    get "/:app/:action", DispatchController, :call
    post "/:app/:action", DispatchController, :call
  end
end
```

## REST vs. GraphQL

The Prismatic Platform offers both REST and [GraphQL](@/glossary/graphql.md) interfaces:

| Feature | REST API | GraphQL |
|---------|---------|---------|
| **Endpoint Structure** | Multiple URLs, one per resource | Single endpoint `/graphql` |
| **Data Fetching** | Fixed response shape per endpoint | Client specifies exact fields |
| **Over-fetching** | Common (returns full resource) | None (precise field selection) |
| **Under-fetching** | Requires multiple requests | Single query for nested data |
| **Caching** | HTTP cache headers, CDN-friendly | Application-level caching required |
| **Versioning** | URL-based (`/v1/`, `/v2/`) | Schema evolution, deprecation |
| **Documentation** | [OpenAPI](@/glossary/openapi.md) / Swagger | Introspection schema |
| **Real-time** | Polling or [WebSocket](@/glossary/websocket.md) | Subscriptions |
| **Prismatic Use** | Auto-introspecting generic dispatch | Complex intelligence queries |
| **Learning Curve** | Low (HTTP fundamentals) | Medium (query language, schema design) |

## Pagination, Filtering, and Sorting

REST APIs handle large collections through standardized query patterns:

```
# Cursor-based pagination (preferred for real-time data)
GET /api/v1/assets?after=eyJpZCI6MTIzfQ&limit=50

# Offset-based pagination (simpler, less stable)
GET /api/v1/assets?offset=100&limit=50

# Filtering
GET /api/v1/assets?type=domain&risk_score_gte=7.5

# Sorting
GET /api/v1/assets?sort=-risk_score,created_at

# Field selection (sparse fieldsets)
GET /api/v1/assets?fields=id,type,risk_score

# Combined
GET /api/v1/assets?type=domain&sort=-risk_score&limit=20&after=abc123&fields=id,type,value,risk_score
```

| Pattern | Implementation | Trade-off |
|---------|---------------|-----------|
| **Cursor Pagination** | Encode last-seen ID in opaque cursor | Stable under inserts, no count |
| **Offset Pagination** | SQL OFFSET/LIMIT | Simple, but skips on insert |
| **Keyset Pagination** | WHERE id > last_id | Fast, stable, no deep pages |

## Content Negotiation and Serialization

REST APIs use HTTP headers for content negotiation:

```elixir
defmodule PrismaticApi.ContentNegotiation do
  @moduledoc "Content negotiation for REST API responses."

  @spec serialize(term(), String.t()) :: {:ok, String.t()} | {:error, :unsupported_format}
  def serialize(data, "application/json"), do: {:ok, Jason.encode!(data)}
  def serialize(data, "text/csv"), do: {:ok, to_csv(data)}
  def serialize(_data, _format), do: {:error, :unsupported_format}
end
```

## Error Handling Patterns

Consistent error handling is critical for REST API usability. The Prismatic API follows the Problem Details for HTTP APIs standard (RFC 7807):

```elixir
defmodule PrismaticApi.ProblemDetails do
  @moduledoc "RFC 7807 Problem Details for HTTP API error responses."

  @spec build(integer(), String.t(), String.t()) :: map()
  def build(status, title, detail) do
    %{
      "type" => "https://prismatic-prod.fly.dev/api/errors/#{status}",
      "title" => title,
      "status" => status,
      "detail" => detail,
      "instance" => "/api/v1/#{generate_trace_id()}"
    }
  end
end
```

## Performance and Caching

REST APIs benefit from HTTP's built-in caching mechanisms:

| Header | Purpose | Example |
|--------|---------|---------|
| `Cache-Control` | Caching directives | `max-age=3600, public` |
| `ETag` | Resource version identifier | `"v1-abc123"` |
| `If-None-Match` | Conditional request | Send ETag, get 304 if unchanged |
| `Last-Modified` | Timestamp-based validation | `Wed, 22 Feb 2026 10:00:00 GMT` |
| `Vary` | Cache key differentiation | `Accept, Authorization` |

## Related Terms

- [OpenAPI](@/glossary/openapi.md) - Specification standard documenting REST APIs
- [API Gateway](@/glossary/api-gateway.md) - Entry point routing and aggregating API requests
- [Plug](@/glossary/plug.md) - Composable middleware for request processing
- [Phoenix](@/glossary/phoenix.md) - Framework powering the REST API server
- [JWT](@/glossary/jwt.md) - Token-based authentication for stateless API access
- [RBAC](@/glossary/rbac.md) - Role-based access control for API endpoints
- [Rate Limiting](@/glossary/rate-limiting.md) - Protection against API abuse
- [GraphQL](@/glossary/graphql.md) - Alternative query language for flexible data fetching
- [Endpoint](@/glossary/endpoint.md) - Phoenix entry point for API request handling
- [Idempotency](@/glossary/idempotency.md) - Safe retry semantics for HTTP methods
- [TLS](@/glossary/tls.md) - Transport layer encryption for API security
- [WebSocket](@/glossary/websocket.md) - Bidirectional protocol for real-time API features

## See Also

- [Architecture](@/architecture/_index.md) -- API architecture design
- [Applications](@/apps/_index.md) -- Prismatic API application details

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
