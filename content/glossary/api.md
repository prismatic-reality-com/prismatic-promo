+++
title = "API"
description = "Application Programming Interface -- formal contracts defining how software components communicate, encompassing REST, GraphQL, gRPC, and WebSocket paradigms."
weight = 40

[extra]
category = "architecture"
tags = ["api", "rest", "graphql", "grpc", "websocket", "openapi", "phoenix", "plug", "json", "authentication", "rate-limiting", "middleware", "http", "endpoint"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
abbreviation = "API"
difficulty = "intermediate"
audience = ["developers", "architects", "platform-engineers", "integrators"]
related_terms = ["openapi", "rest", "graphql", "phoenix", "plug", "json", "webhook", "websockets", "authentication", "rate-limiting", "middleware", "api-gateway"]
key_concepts = ["contract-first-design", "auto-introspection", "type-safe-apis", "api-versioning", "generic-dispatch", "idempotency"]
platforms = ["elixir", "phoenix", "openapi", "swagger"]
prerequisites = ["http-fundamentals", "json", "client-server-architecture"]
use_cases = ["service-integration", "public-apis", "microservices", "mobile-backends", "third-party-access"]
complexity = "medium"
stability = "stable"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1520
date_modified = "2026-02-23"
keywords = ["API", "Application", "Programming", "Interface", "REST", "GraphQL", "WebSocket", "glossary", "architecture", "Prismatic Platform"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "API - Prismatic Platform"
+++

## Definition and Overview

An Application Programming Interface (API) is a formal contract that defines how software components communicate with each other. APIs specify the available operations, their input parameters, expected outputs, error conditions, and behavioral guarantees. By abstracting implementation details behind stable interfaces, APIs enable software composition -- building complex systems from independent, interchangeable components that can evolve independently.

APIs exist at every level of software architecture: programming language APIs define how functions and modules interact, library APIs define reusable functionality, operating system APIs provide access to hardware resources, and web APIs enable communication between distributed services over networks. The term has become most commonly associated with web APIs -- HTTP-based interfaces that allow different systems to exchange data and invoke operations across the internet.

Well-designed APIs embody the principle of information hiding: consumers need to know what an API does, not how it does it. This separation of concerns enables parallel development (teams can work on different components simultaneously), technology heterogeneity (different components can use different languages and frameworks), and independent deployment (components can be updated without coordinating with consumers, as long as the API contract is maintained).

The economic significance of APIs cannot be overstated. APIs are the foundation of the platform economy, enabling companies like Stripe, Twilio, and AWS to offer their capabilities as programmable services. In the Prismatic Platform, APIs serve a dual role: they expose platform capabilities to external consumers and they define the internal contracts between umbrella applications.

## API Architectural Styles

The choice of API style has profound implications for performance, developer experience, and system evolution. Each style makes different tradeoffs between simplicity, flexibility, performance, and tooling support.

| Style | Transport | Data Format | Key Characteristics | Best For |
|-------|-----------|-------------|---------------------|----------|
| **REST** | HTTP | JSON/XML | Resource-oriented, stateless, cacheable, uniform interface | CRUD operations, public APIs |
| **GraphQL** | HTTP | JSON | Query language, client-specified responses, single endpoint | Complex data requirements, mobile |
| **gRPC** | HTTP/2 | Protocol Buffers | Binary protocol, streaming, code generation | Internal services, performance-critical |
| **WebSocket** | TCP | Any | Full-duplex, persistent connection, real-time | Live updates, chat, streaming |
| **Message Queue** | AMQP/MQTT | Any | Asynchronous, decoupled, reliable delivery | Event-driven, eventual consistency |
| **Server-Sent Events** | HTTP | Text | Server-to-client streaming, simple | Notifications, feeds |

### REST (Representational State Transfer)

REST remains the dominant style for web APIs due to its simplicity, widespread tooling support, and alignment with HTTP semantics. REST APIs model the world as resources identified by URIs, manipulated through standard HTTP methods.

**Core Principles**:
- **Resources**: Every entity is a resource identified by a URI (`/api/v1/agents/42`)
- **HTTP Methods**: `GET` (read), `POST` (create), `PUT` (replace), `PATCH` (partial update), `DELETE` (remove)
- **Status Codes**: Standardized response codes (200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error)
- **Stateless**: Each request contains all information needed to process it
- **HATEOAS**: Responses include links to related resources and available actions
- **Content Negotiation**: Clients and servers negotiate data formats through Accept headers

### GraphQL

GraphQL addresses the over-fetching and under-fetching problems inherent in REST APIs by allowing clients to specify exactly what data they need. A single GraphQL endpoint replaces dozens of REST endpoints, with the client's query determining the response shape.

### gRPC

gRPC uses HTTP/2 and Protocol Buffers for high-performance service-to-service communication. Its code generation approach means client and server implementations are generated from a shared `.proto` definition, eliminating contract drift. gRPC supports four communication patterns: unary, server streaming, client streaming, and bidirectional streaming.

## API Design Principles

Effective API design requires balancing competing concerns: simplicity versus completeness, flexibility versus consistency, backward compatibility versus evolution. The following principles guide API design decisions in the Prismatic Platform.

```elixir
defmodule Prismatic.API.DesignPrinciples do
  @moduledoc """
  Demonstrates API design principles through Elixir module design.

  Good API design applies at every level, from HTTP endpoints
  to module interfaces. The same principles that make a REST API
  usable also make an Elixir module pleasant to work with.
  """

  @type api_response(data) :: {:ok, data} | {:error, api_error()}
  @type api_error :: %{
    code: atom(),
    message: String.t(),
    details: map()
  }

  @doc """
  Consistent error handling across all API boundaries.

  Every function returns {:ok, result} or {:error, reason},
  making error handling explicit and composable through
  pattern matching and the `with` construct.
  """
  @spec fetch_resource(String.t(), String.t()) :: api_response(map())
  def fetch_resource(resource_type, id) do
    with {:ok, module} <- resolve_module(resource_type),
         {:ok, resource} <- module.get(id),
         {:ok, serialized} <- serialize(resource) do
      {:ok, serialized}
    else
      {:error, :not_found} ->
        {:error, %{code: :not_found, message: "Resource not found", details: %{id: id}}}

      {:error, :invalid_type} ->
        {:error, %{code: :bad_request, message: "Invalid resource type", details: %{type: resource_type}}}

      {:error, reason} ->
        {:error, %{code: :internal_error, message: "Unexpected error", details: %{reason: inspect(reason)}}}
    end
  end

  @doc """
  Idempotent operations enable safe retries.

  PUT and DELETE operations are idempotent by design --
  executing them multiple times produces the same result
  as executing them once.
  """
  @spec upsert_resource(String.t(), String.t(), map()) :: api_response(map())
  def upsert_resource(resource_type, id, attrs) do
    with {:ok, module} <- resolve_module(resource_type),
         {:ok, resource} <- module.upsert(id, attrs) do
      {:ok, resource}
    end
  end

  defp resolve_module("agents"), do: {:ok, Prismatic.Agents}
  defp resolve_module("commands"), do: {:ok, Prismatic.Commands}
  defp resolve_module(_), do: {:error, :invalid_type}

  defp serialize(resource) when is_map(resource), do: {:ok, resource}
  defp serialize(_), do: {:error, :serialization_failed}
end
```

### Principle: Consistency Over Cleverness

API consistency means that once a developer learns one endpoint, they can predict how other endpoints behave. Consistent naming conventions, error formats, pagination styles, and authentication mechanisms reduce cognitive load and accelerate integration.

### Principle: Explicit Over Implicit

APIs should make their behavior explicit. Required parameters should be clearly distinguished from optional ones. Side effects should be documented. Rate limits should be communicated through response headers. Error messages should include enough context for the caller to understand what went wrong and how to fix it.

### Principle: Evolution Without Breakage

APIs must evolve over time without breaking existing consumers. This requires versioning strategies, backward-compatible changes, deprecation policies, and migration guides.

## API Specification Standards

Machine-readable API specifications enable automated tooling for documentation generation, client code generation, validation, and testing.

| Standard | Purpose | Format | Ecosystem |
|----------|---------|--------|-----------|
| **OpenAPI 3.0** | REST API specification | YAML/JSON | SwaggerUI, Redoc, code generators |
| **GraphQL SDL** | GraphQL schema definition | SDL | Apollo, Relay, GraphiQL |
| **Protocol Buffers** | gRPC interface definition | `.proto` | gRPC code generators |
| **AsyncAPI** | Event-driven API specification | YAML/JSON | Code generators, documentation |
| **JSON Schema** | Data structure validation | JSON | Validators across all languages |

[OpenAPI](@/glossary/openapi.md) has become the industry standard for REST APIs, and for good reason: it provides a single source of truth from which documentation, client SDKs, server stubs, validation middleware, and test suites can be generated. The Prismatic Platform uses OpenApiSpex to generate OpenAPI specifications directly from Elixir typespecs, eliminating the need for manual specification authoring.

## API Security

API security is a critical concern because APIs expose system functionality to potentially untrusted callers. A comprehensive API security strategy addresses [authentication](@/glossary/authentication.md), [authorization](@/glossary/authorization.md), transport security, input validation, and abuse prevention.

```elixir
defmodule Prismatic.API.Security do
  @moduledoc """
  API security middleware implementing authentication,
  authorization, rate limiting, and input validation.
  """

  @type auth_result :: {:ok, map()} | {:error, :unauthorized | :forbidden}

  @doc """
  Validates an API key and returns the associated permissions.

  API keys are hashed before storage and compared using
  constant-time comparison to prevent timing attacks.
  """
  @spec authenticate(String.t()) :: auth_result()
  def authenticate(api_key) when is_binary(api_key) do
    key_hash = :crypto.hash(:sha256, api_key) |> Base.encode16(case: :lower)

    case lookup_key(key_hash) do
      {:ok, %{active: true} = credentials} ->
        {:ok, credentials}

      {:ok, %{active: false}} ->
        {:error, :unauthorized}

      {:error, :not_found} ->
        # Perform dummy work to prevent timing attacks
        :crypto.hash(:sha256, "dummy")
        {:error, :unauthorized}
    end
  end

  @doc """
  Checks whether the authenticated caller has permission
  to perform the requested operation.
  """
  @spec authorize(map(), String.t(), String.t()) :: auth_result()
  def authorize(credentials, resource, action) do
    required_permission = "#{resource}:#{action}"

    if required_permission in credentials.permissions do
      {:ok, credentials}
    else
      {:error, :forbidden}
    end
  end

  @doc """
  Rate limiting using the token bucket algorithm.

  Each API key gets a bucket that refills at a configurable
  rate. Requests that exceed the bucket capacity are rejected
  with a 429 status code.
  """
  @spec check_rate_limit(String.t(), keyword()) :: {:ok, non_neg_integer()} | {:error, :rate_limited}
  def check_rate_limit(api_key, opts \\ []) do
    limit = Keyword.get(opts, :limit, 1000)
    window_seconds = Keyword.get(opts, :window, 3600)

    case get_request_count(api_key, window_seconds) do
      count when count < limit ->
        increment_request_count(api_key)
        {:ok, limit - count - 1}

      _ ->
        {:error, :rate_limited}
    end
  end

  defp lookup_key(_hash), do: {:ok, %{active: true, permissions: []}}
  defp get_request_count(_key, _window), do: 0
  defp increment_request_count(_key), do: :ok
end
```

### Security Mechanisms

| Mechanism | Purpose | Complexity | Use Case |
|-----------|---------|------------|----------|
| **API Keys** | Simple identification | Low | Internal services, development |
| **OAuth 2.0 / OIDC** | Delegated authorization | High | Third-party access, user-facing |
| **JWT** | Self-contained tokens | Medium | Stateless authentication |
| **mTLS** | Mutual certificate auth | High | Service-to-service, zero-trust |
| **HMAC Signatures** | Request integrity | Medium | Webhooks, financial APIs |

### Input Validation

Every API input must be validated before processing. Input validation prevents injection attacks, ensures data integrity, and provides clear error messages when invalid data is submitted. In Phoenix, input validation combines Ecto changesets (for data validation) with OpenApiSpex (for request schema validation).

## API Versioning Strategies

API versioning enables evolution while maintaining backward compatibility for existing consumers. Each strategy has tradeoffs between simplicity, flexibility, and maintenance burden.

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| **URL Path** | `/api/v1/agents` | Simple, explicit, cacheable | URL pollution, hard redirects |
| **Query Parameter** | `/api/agents?v=1` | Simple, optional | Can be accidentally omitted |
| **Header** | `Accept: application/vnd.prismatic.v1+json` | Clean URLs | Less discoverable |
| **Content Negotiation** | `Accept: application/json; version=1` | HTTP-native | Complex to implement |

The Prismatic Platform uses URL-path versioning (`/api/v1/`) for its simplicity and explicitness. When a breaking change is needed, a new version path is introduced while the old version continues to function for a documented deprecation period.

## Prismatic Platform API Implementation

### Auto-Introspecting REST API

The Prismatic API (`prismatic_api` app, port 4004) uses a novel auto-introspection approach that eliminates manual API definition entirely.

```elixir
defmodule PrismaticAPI.Scanner do
  @moduledoc """
  Boot-time scanner that discovers all public functions across
  Prismatic* facade modules and registers them as API endpoints.

  This approach means that adding a new public function to any
  Prismatic facade module automatically creates a new API endpoint
  with documentation, type validation, and OpenAPI specification.
  """

  @type endpoint :: %{
    module: module(),
    function: atom(),
    arity: non_neg_integer(),
    docs: String.t() | nil,
    spec: term() | nil,
    app: String.t(),
    action: String.t()
  }

  @spec discover_endpoints() :: {:ok, list(endpoint())}
  def discover_endpoints do
    endpoints =
      :application.loaded_applications()
      |> Enum.flat_map(fn {app, _, _} ->
        app
        |> :application.get_key(:modules)
        |> elem(1)
        |> Enum.filter(&facade_module?/1)
        |> Enum.flat_map(&extract_endpoints/1)
      end)

    {:ok, endpoints}
  end

  defp facade_module?(module) do
    module
    |> Atom.to_string()
    |> String.starts_with?("Elixir.Prismatic")
  end

  defp extract_endpoints(module) do
    module.__info__(:functions)
    |> Enum.map(fn {function, arity} ->
      %{
        module: module,
        function: function,
        arity: arity,
        docs: fetch_doc(module, function, arity),
        spec: fetch_spec(module, function, arity),
        app: derive_app_name(module),
        action: Atom.to_string(function)
      }
    end)
  end

  defp fetch_doc(module, function, arity) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, _, _, _, _, docs} ->
        Enum.find_value(docs, fn
          {{:function, ^function, ^arity}, _, _, %{"en" => doc}, _} -> doc
          _ -> nil
        end)

      _ ->
        nil
    end
  end

  defp fetch_spec(module, function, arity) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} ->
        Enum.find_value(specs, fn
          {{^function, ^arity}, spec} -> spec
          _ -> nil
        end)

      :error ->
        nil
    end
  end

  defp derive_app_name(module) do
    module
    |> Module.split()
    |> Enum.at(0, "prismatic")
    |> Macro.underscore()
  end
end
```

### Architecture Flow

The auto-introspection architecture follows a clear pipeline from discovery to dispatch:

```
Scanner → Registry (ETS) → DispatchController → safe_apply(Module, :function, args) → JSON
           |
    TypeMapper → OpenApiSpex Schema
           |
    ApiSpec → SwaggerUI
```

1. **Boot-time Scanning**: Discovers all public functions across `Prismatic*` facade modules
2. **Type Mapping**: Automatically converts Elixir `@spec` AST to OpenAPI JSON Schema
3. **Generic Dispatch**: Single controller resolves `{app, action}` to `module.function(args)`
4. **OpenApiSpex**: Full [OpenAPI](@/glossary/openapi.md) 3.0 specification with interactive [SwaggerUI](@/glossary/swagger-ui.md)

### Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check with system metrics |
| `/api/v1/endpoints` | GET | List all discovered endpoints |
| `/api/v1/:app/:action` | GET/POST | Generic dispatch to any facade function |
| `/api/openapi` | GET | OpenAPI 3.0 JSON specification |
| `/api/swaggerui` | GET | Interactive API documentation |

## API Testing Strategies

Comprehensive API testing ensures that contracts are honored, edge cases are handled, and performance meets requirements.

| Test Type | Purpose | Tools |
|-----------|---------|-------|
| **Contract Tests** | Verify API matches specification | OpenApiSpex validation |
| **Integration Tests** | Verify end-to-end behavior | Phoenix.ConnTest |
| **Load Tests** | Verify performance under load | Benchee, k6 |
| **Security Tests** | Verify authentication/authorization | Custom test suites |
| **Mutation Tests** | Verify test effectiveness | Muzak (Elixir) |

```elixir
defmodule PrismaticAPI.EndpointTest do
  @moduledoc false
  use ExUnit.Case, async: true
  use Plug.Test

  @spec test_health_endpoint() :: :ok
  def test_health_endpoint do
    conn = conn(:get, "/api/v1/health")
    response = PrismaticAPI.Router.call(conn, [])

    assert response.status == 200
    assert %{"status" => "healthy"} = Jason.decode!(response.resp_body)
    :ok
  end
end
```

## API Performance and Optimization

API performance directly impacts user experience and system costs. Key performance considerations include response time, throughput, payload size, and connection management.

| Optimization | Technique | Impact |
|-------------|-----------|--------|
| **Caching** | ETags, Cache-Control headers | Reduces redundant processing |
| **Compression** | gzip/brotli response encoding | Reduces bandwidth usage |
| **Pagination** | Cursor-based pagination | Prevents unbounded responses |
| **Field Selection** | Sparse fieldsets, GraphQL | Reduces payload size |
| **Connection Pooling** | HTTP/2, keep-alive | Reduces connection overhead |
| **Rate Limiting** | Token bucket algorithm | Prevents abuse and ensures fairness |

The Prismatic Platform enforces strict performance standards: all API endpoints must respond within 100ms server-side render time, with total page load under 250ms. These constraints are enforced through CI/CD gates and production [telemetry](@/glossary/telemetry.md) alerts.

## API Governance and Documentation

API governance ensures consistency, discoverability, and quality across all APIs in an organization. The Prismatic Platform's approach to API governance is unique because it eliminates most governance overhead through auto-introspection: since APIs are generated from code, there is no separate specification to keep in sync, and documentation is always accurate.

For external-facing APIs, additional governance concerns include deprecation policies, changelog management, and developer experience. Good [documentation](@/glossary/documentation.md) is essential for API adoption, and the Prismatic Platform generates interactive SwaggerUI documentation automatically from code.

## Historical Context

| Year | Milestone |
|------|-----------|
| **1960s** | OS system calls define first APIs |
| **2000** | Roy Fielding publishes REST dissertation |
| **2004** | Web 2.0 and public API explosion (Flickr, del.icio.us) |
| **2006** | AWS launches S3 and EC2 APIs, beginning cloud era |
| **2011** | Swagger specification created |
| **2015** | GraphQL open-sourced by Facebook |
| **2016** | gRPC open-sourced by Google |
| **2017** | OpenAPI 3.0 released (Swagger renamed) |
| **2020s** | API-first development becomes standard practice |
| **2024-2026** | Prismatic Platform demonstrates auto-introspecting API patterns |

## Related Concepts

- [OpenAPI](@/glossary/openapi.md) -- Specification standard for REST APIs
- [Phoenix](@/glossary/phoenix.md) -- Web framework powering Prismatic APIs
- [GraphQL](@/glossary/graphql.md) -- Query language for APIs
- [Authentication](@/glossary/authentication.md) -- Identity verification for API access
- [Authorization](@/glossary/authorization.md) -- Permission verification for API operations
- [API Gateway](@/glossary/api-gateway.md) -- Centralized API management
- [Telemetry](@/glossary/telemetry.md) -- API performance monitoring
- [Documentation](@/glossary/documentation.md) -- API documentation practices
- [Validation](@/glossary/validation.md) -- Input validation for API requests

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
