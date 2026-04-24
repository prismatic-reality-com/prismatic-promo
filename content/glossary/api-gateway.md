+++
title = "API Gateway"
weight = 19
[extra]
category = "architecture"
description = "Single entry point that routes, aggregates, and secures API requests to backend services"
acronym = "APIGW"
related_terms = ["rest-api", "rate-limiting", "jwt", "load-balancing", "openapi", "rbac", "plug", "oauth2", "tls", "circuit-breaker", "observability", "microservices"]
prismatic_app = "prismatic_api"
port = 4004
pattern_type = "infrastructure"
complexity = "high"
security_critical = true
enforcement_level = "P0"
otp_components = ["GenServer", "Plug", "ETS", "Telemetry"]
elixir_libraries = ["OpenApiSpex", "Guardian", "Plug", "Phoenix"]
key_modules = ["PrismaticApi.Scanner", "PrismaticApi.DispatchController", "PrismaticApi.TypeMapper", "PrismaticWeb.Plugs.APIAuth"]
discovery_method = "auto-introspection"
auth_mechanism = "JWT + RBAC"
api_version = "v1"
swagger_path = "/api/swagger-ui"
openapi_path = "/api/openapi"
date_created = "2025-06-15"
date_updated = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1771
date_modified = "2026-02-23"
keywords = ["API", "Gateway", "Single", "glossary", "architecture", "Prismatic Platform", "OpenAPI", "Plug"]
tags = ["glossary", "architecture", "api-gateway", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "API Gateway - Prismatic Platform"
+++

## Definition

An API gateway is an infrastructure component that serves as the single entry point for all client requests to a system's backend services. It handles cross-cutting concerns including request routing, authentication, authorization, rate limiting, response aggregation, protocol translation, request/response transformation, and observability. By centralizing these responsibilities in a single layer, an API gateway simplifies client interactions and enforces consistent security and operational policies across all endpoints.

The API gateway pattern emerged from the [microservices](@/glossary/microservices.md) architectural style, where decomposing a monolithic application into many services creates a challenge for clients: instead of communicating with one server, clients would need to know about and manage connections to dozens of services. The gateway abstracts this complexity, presenting a unified API surface while routing requests to the appropriate backend service. This decoupling allows backend services to evolve independently -- services can be split, merged, or replaced without affecting client integrations.

Beyond simple routing, modern API gateways provide sophisticated capabilities including request validation (ensuring payloads conform to schema definitions before they reach backend services), response transformation (adapting internal data formats to client expectations), [circuit breaking](@/glossary/circuit-breaker.md) (preventing cascading failures when downstream services degrade), and API versioning (supporting multiple API versions simultaneously). These capabilities make the API gateway a critical piece of production infrastructure that directly impacts security posture, reliability, and developer experience.

## Historical Context and Evolution

The concept of an API gateway traces its lineage through several decades of network architecture evolution. In the early days of web services, organizations deployed simple reverse proxies (Apache httpd, Nginx) to distribute traffic across backend servers. These proxies handled basic load balancing and SSL termination but offered no awareness of the API contracts they mediated.

The emergence of Service-Oriented Architecture (SOA) in the early 2000s introduced the Enterprise Service Bus (ESB), a heavyweight middleware layer that provided message routing, protocol transformation, and orchestration. ESBs like MuleSoft, IBM WebSphere, and Oracle Service Bus centralized integration logic but became notorious for complexity, vendor lock-in, and operational burden. The ESB was the spiritual predecessor of the modern API gateway, but its monolithic nature contradicted the lightweight principles that would later define microservices.

When the microservices movement gained momentum around 2012-2014, driven by organizations like Netflix, Amazon, and Spotify decomposing their monoliths, the need for a lightweight API mediation layer became acute. Netflix's Zuul gateway (open-sourced in 2013) demonstrated that a thin, programmable gateway could handle routing, filtering, and monitoring without the heavyweight orchestration of ESBs. Kong (2015), Tyk (2015), and AWS API Gateway (2015) followed, establishing the API gateway as a distinct infrastructure category.

The current generation of API gateways (Envoy, Istio, Kong 3.x, AWS API Gateway v2) has evolved beyond simple request routing to encompass service mesh integration, WebSocket support, gRPC bridging, GraphQL federation, and declarative configuration through infrastructure-as-code. The Prismatic Platform takes a distinctive approach within this landscape, implementing auto-introspecting discovery that eliminates the manual endpoint registration required by conventional gateways.

## Core Responsibilities

An API gateway centralizes several cross-cutting concerns that would otherwise be duplicated across every backend service:

| Responsibility | Description | Benefit |
|---------------|-------------|---------|
| **Request Routing** | Maps incoming paths to backend services | Clients interact with a single endpoint |
| **Authentication** | Validates [JWT](@/glossary/jwt.md) tokens and API keys | Consistent auth across all services |
| **Authorization** | Enforces [RBAC](@/glossary/rbac.md) policies per endpoint | Centralized permission management |
| **[Rate Limiting](@/glossary/rate-limiting.md)** | Throttles requests per client/endpoint | Prevents abuse and resource exhaustion |
| **Request Validation** | Validates payloads against [OpenAPI](@/glossary/openapi.md) schemas | Malformed requests rejected early |
| **Response Transformation** | Adapts internal formats to client expectations | Backend independence from API contract |
| **Protocol Translation** | Bridges HTTP to WebSocket, gRPC, etc. | Multi-protocol support from single entry |
| **[Observability](@/glossary/observability.md)** | Logs, metrics, and traces for all traffic | Unified monitoring and debugging |
| **CORS Management** | Cross-origin resource sharing headers | Consistent browser security policies |
| **Caching** | Response caching for frequently accessed data | Reduced backend load and latency |
| **Versioning** | Simultaneous support for multiple API versions | Backward compatibility without backend coupling |
| **Circuit Breaking** | Prevents cascading failures to degraded backends | System resilience under partial failure |

## Gateway Architecture Patterns

API gateways can be implemented following several architectural patterns, each suited to different deployment contexts:

| Pattern | Description | Use Case | Trade-offs |
|---------|-------------|----------|------------|
| **Edge Gateway** | Single gateway at the network edge | Small-medium APIs | Simple but can become bottleneck |
| **Backend for Frontend (BFF)** | Per-client-type gateway | Mobile + Web + API clients | Optimal per-client but higher ops cost |
| **Federated Gateway** | Gateway-per-domain with federation | Microservices at scale | Team autonomy but coordination overhead |
| **Sidecar Proxy** | Per-service proxy (Envoy, Istio) | Service mesh architectures | Fine-grained control but complex |
| **Auto-Introspecting** | Self-discovering endpoint registry | Convention-over-configuration | Zero-config but requires conventions |

The Prismatic Platform implements the auto-introspecting pattern, where the gateway discovers available endpoints at boot time through Elixir module introspection rather than requiring manual route configuration. This approach leverages the [BEAM](@/glossary/beam.md) virtual machine's runtime code inspection capabilities to eliminate configuration drift between the actual codebase and the gateway's routing table.

## Auto-Introspecting Gateway Design

The Prismatic API gateway (`prismatic_api`, port 4004) implements a unique auto-introspecting architecture that eliminates manual endpoint registration:

```
Boot Time:
  Scanner ─────> Module.concat(Prismatic*) ─────> Code.fetch_docs/1
     |                                                    |
     |           Code.Typespec.fetch_specs/1 <────────────┘
     |                     |
     v                     v
  Registry (ETS) <── TypeMapper ──> OpenApiSpex Schema
     |                                      |
     v                                      v
  DispatchController                   ApiSpec ──> SwaggerUI

Runtime:
  Request ──> Router ──> APIAuth ──> RateLimiter ──> DispatchController
                                                          |
                                                   Registry.lookup(app, action)
                                                          |
                                                   safe_apply(Module, :function, args)
                                                          |
                                                   JSON Response
```

The scanner examines all compiled modules matching the `Prismatic*` namespace, extracting public functions with their documentation (`Code.fetch_docs/1`) and type specifications (`Code.Typespec.fetch_specs/1`). These are registered in an [ETS](@/glossary/ets.md)-backed endpoint registry and automatically mapped to [OpenAPI](@/glossary/openapi.md) schema definitions through the TypeMapper.

```elixir
defmodule PrismaticApi.Scanner do
  @moduledoc """
  Boot-time scanner that discovers all Prismatic facade modules
  and registers their public functions as API endpoints.

  The scanner uses Elixir's code introspection capabilities to
  build the endpoint registry without manual configuration,
  ensuring the API surface always reflects the actual codebase.
  """

  @type endpoint :: %{
    module: module(),
    function: atom(),
    arity: non_neg_integer(),
    doc: String.t() | nil,
    spec: term() | nil
  }

  @spec discover_endpoints() :: {:ok, [endpoint()]} | {:error, term()}
  def discover_endpoints do
    endpoints =
      :code.all_loaded()
      |> Enum.filter(fn {module, _} -> facade_module?(module) end)
      |> Enum.flat_map(&extract_endpoints/1)

    Enum.each(endpoints, &register_endpoint/1)
    {:ok, endpoints}
  end

  @spec facade_module?(module()) :: boolean()
  defp facade_module?(module) do
    module_name = Atom.to_string(module)

    String.starts_with?(module_name, "Elixir.Prismatic") and
      not String.contains?(module_name, ".Impl.") and
      has_public_functions?(module)
  end

  defp extract_endpoints({module, _}) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, _, _, _, _, docs} ->
        docs
        |> Enum.filter(&public_function?/1)
        |> Enum.map(&build_endpoint(module, &1))

      _ ->
        []
    end
  end

  defp has_public_functions?(module) do
    module.__info__(:functions)
    |> Enum.any?(fn {_name, arity} -> arity >= 0 end)
  end
end
```

## Request Pipeline

The Prismatic API gateway processes every request through a [Plug](@/glossary/plug.md) pipeline that enforces security and operational policies:

| Stage | Plug | Responsibility | Failure Response |
|-------|------|---------------|-----------------|
| 1 | `Plug.SSL` | Force HTTPS, [TLS](@/glossary/tls.md) enforcement | 301 redirect to HTTPS |
| 2 | `Plug.Parsers` | Parse JSON/form request bodies | 400 Bad Request |
| 3 | `PrismaticWeb.Plugs.RequestId` | Assign unique request ID for tracing | (never fails) |
| 4 | `PrismaticWeb.Plugs.APIAuth` | Validate JWT, extract user context | 401 Unauthorized |
| 5 | `PrismaticWeb.Plugs.RequireRole` | Check RBAC role requirements | 403 Forbidden |
| 6 | `PrismaticWeb.Plugs.RateLimiter` | Enforce per-client rate limits | 429 Too Many Requests |
| 7 | `PrismaticApi.DispatchController` | Route to backend function | 404 Not Found / 500 Error |

```elixir
defmodule PrismaticApi.Router do
  @moduledoc """
  Gateway router with plug pipeline for authentication,
  authorization, rate limiting, and dispatch.

  Public endpoints (health, endpoint listing) bypass auth.
  All operational endpoints require JWT + RBAC validation.
  """

  use PrismaticApi, :router

  pipeline :api_gateway do
    plug :accepts, ["json"]
    plug PrismaticWeb.Plugs.RequestId
    plug PrismaticWeb.Plugs.APIAuth
    plug PrismaticWeb.Plugs.RequireRole, minimum: :viewer
    plug PrismaticWeb.Plugs.RateLimiter,
      by: :token_sub,
      limits: [
        {60, :second, 100},
        {3600, :second, 5000}
      ]
  end

  scope "/api/v1", PrismaticApi do
    pipe_through :api
    get "/health", HealthController, :check
    get "/endpoints", EndpointController, :index
  end

  scope "/api/v1", PrismaticApi do
    pipe_through [:api, :api_gateway]
    get "/:app/:action", DispatchController, :dispatch
    post "/:app/:action", DispatchController, :dispatch
  end

  scope "/api" do
    pipe_through :api
    get "/openapi", OpenApiSpex.Plug.RenderSpec, []
  end
end
```

## Generic Dispatch Controller

The dispatch controller is the heart of the auto-introspecting gateway. It resolves incoming `{app, action}` path parameters to `{module, function}` pairs through the ETS registry and invokes the target function using `safe_apply/3`, which wraps the call in error handling and telemetry instrumentation:

```elixir
defmodule PrismaticApi.DispatchController do
  @moduledoc """
  Generic dispatch controller that resolves API requests
  to backend function calls through the endpoint registry.
  Provides safe invocation with error handling and telemetry.
  """

  use PrismaticApi, :controller

  @spec dispatch(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def dispatch(conn, %{"app" => app, "action" => action} = params) do
    case PrismaticApi.Registry.lookup(app, action) do
      {:ok, %{module: module, function: function}} ->
        args = extract_args(params)

        case safe_apply(module, function, args) do
          {:ok, result} ->
            conn
            |> put_status(:ok)
            |> json(%{data: result, status: "success"})

          {:error, reason} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{error: inspect(reason), status: "error"})
        end

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Endpoint #{app}/#{action} not found"})
    end
  end

  @spec safe_apply(module(), atom(), list()) :: {:ok, term()} | {:error, term()}
  defp safe_apply(module, function, args) do
    start_time = System.monotonic_time()

    result = apply(module, function, args)

    :telemetry.execute(
      [:prismatic, :api, :dispatch],
      %{duration: System.monotonic_time() - start_time},
      %{module: module, function: function}
    )

    {:ok, result}
  rescue
    error ->
      {:error, {:dispatch_error, Exception.message(error)}}
  end
end
```

## OpenAPI Integration

The gateway automatically generates a complete [OpenAPI](@/glossary/openapi.md) 3.0 specification from discovered endpoints. The TypeMapper converts Elixir `@spec` AST into JSON Schema definitions:

| Elixir Type | OpenAPI Schema | Notes |
|-------------|---------------|-------|
| `String.t()` | `{type: "string"}` | Direct mapping |
| `integer()` | `{type: "integer"}` | Direct mapping |
| `boolean()` | `{type: "boolean"}` | Direct mapping |
| `float()` | `{type: "number", format: "float"}` | Format annotation |
| `[String.t()]` | `{type: "array", items: {type: "string"}}` | Array wrapper |
| `map()` | `{type: "object"}` | Generic object |
| `Date.t()` | `{type: "string", format: "date"}` | Format annotation |
| `DateTime.t()` | `{type: "string", format: "date-time"}` | ISO 8601 |
| `{:ok, term()} \| {:error, term()}` | Response schemas (200/400) | Tagged tuple decomposition |

The generated specification powers an interactive SwaggerUI at `/api/swagger-ui`, enabling developers to explore and test all discovered endpoints without writing client code.

## Security Architecture

The gateway serves as the security perimeter for all API access, implementing defense-in-depth through multiple layered security mechanisms:

| Security Layer | Implementation | Protection |
|---------------|----------------|------------|
| **Transport** | [TLS](@/glossary/tls.md) 1.3, HSTS, force_ssl | Encryption in transit |
| **Authentication** | [JWT](@/glossary/jwt.md) validation via Guardian | Identity verification |
| **Authorization** | [RBAC](@/glossary/rbac.md) plug middleware | Permission enforcement |
| **Rate Limiting** | Token bucket per client/endpoint | DoS protection |
| **Input Validation** | OpenAPI schema validation | Injection prevention |
| **CORS** | Strict origin whitelist | Cross-origin protection |
| **Logging** | Structured JSON with request ID | Audit trail |
| **Token Scoping** | [OAuth2](@/glossary/oauth2.md) scope validation | Least-privilege access |

All security decisions are made at the gateway level, ensuring that backend services never receive unauthenticated, unauthorized, or malformed requests. This "zero trust at the edge" approach simplifies backend service security because services can trust that requests passing through the gateway have been validated. The gateway also serves as the enforcement point for the [NO MERCY, NO DOUBTS doctrine](@/glossary/nm-nd.md), where any security policy violation results in immediate request rejection without exception.

## Performance Optimization

The auto-introspecting gateway is designed to meet the platform's strict performance requirements (all pages under 250ms, health checks under 10ms):

| Optimization | Technique | Impact |
|-------------|-----------|--------|
| **ETS Registry** | In-memory endpoint lookup | O(1) dispatch, ~1 microsecond |
| **Compiled Routes** | Phoenix compiled route matching | Sub-microsecond routing |
| **Connection Pooling** | Persistent connections to backends | Eliminated TCP handshake overhead |
| **JSON Encoding** | Jason library (NIF-accelerated) | 2-5x faster than Poison |
| **Request Pipelining** | HTTP/2 multiplexing | Reduced head-of-line blocking |
| **Response Caching** | ETS-based response cache with TTL | Eliminated redundant backend calls |

## Monitoring and Observability

The gateway emits comprehensive telemetry for monitoring and debugging:

| Metric | Type | Description |
|--------|------|-------------|
| `api.request.duration` | Histogram | End-to-end request latency |
| `api.request.count` | Counter | Total requests by status code |
| `api.auth.failure` | Counter | Authentication failures by reason |
| `api.rate_limit.exceeded` | Counter | Rate limit rejections by client |
| `api.dispatch.duration` | Histogram | Backend function execution time |
| `api.error.count` | Counter | Errors by type and endpoint |
| `api.registry.size` | Gauge | Number of registered endpoints |
| `api.scanner.duration` | Histogram | Boot-time scan duration |

## Context in Prismatic

The Prismatic API application (`prismatic_api`, port 4004) functions as the platform's API gateway. It auto-discovers all Prismatic facade modules via Elixir introspection at boot time, registers them in an ETS-backed endpoint registry, and routes incoming requests through a generic dispatch controller. Authentication is handled by `PrismaticWeb.Plugs.APIAuth` with [RBAC](@/glossary/rbac.md) enforcement, and the full API surface is documented via OpenApiSpex with SwaggerUI at `/api/swagger-ui`.

Key gateway routes:

| Route | Method | Auth Required | Description |
|-------|--------|---------------|-------------|
| `/api/v1/health` | GET | No | Health check endpoint |
| `/api/v1/endpoints` | GET | No | List all discovered endpoints |
| `/api/v1/:app/:action` | GET | Yes | Generic dispatch (0-2 params) |
| `/api/v1/:app/:action` | POST | Yes | Generic dispatch (3+ params) |
| `/api/openapi` | GET | No | OpenAPI 3.0 JSON specification |
| `/api/swagger-ui` | GET | No | Interactive API documentation |

## Comparison with Industry Alternatives

| Feature | Prismatic APIGW | Kong | AWS API Gateway | Envoy/Istio |
|---------|----------------|------|-----------------|-------------|
| **Discovery** | Auto-introspecting | Declarative config | Console/CloudFormation | xDS protocol |
| **Language** | Elixir/OTP | Lua/Go | Managed service | C++ |
| **Config Drift** | Impossible (runtime scan) | Possible | Possible | Reduced via control plane |
| **Latency** | Microseconds (in-process) | Milliseconds | Milliseconds | Microseconds (sidecar) |
| **Scaling** | BEAM scheduler | Horizontal pods | Managed auto-scale | Per-pod sidecar |
| **OpenAPI** | Auto-generated from @spec | Plugin | Import/export | N/A (gRPC native) |
| **Cost** | Zero (built-in) | License/hosting | Per-request pricing | Operational complexity |

## Best Practices

**Centralize Cross-Cutting Concerns**: Authentication, rate limiting, logging, and CORS should be handled exclusively at the gateway. Duplicating these concerns in backend services creates inconsistency and maintenance burden.

**Validate Early, Fail Fast**: Use OpenAPI schema validation at the gateway to reject malformed requests before they reach backend services. This protects backend services from invalid input and provides clear error messages to API consumers.

**Version Your API Surface**: Support multiple API versions through the gateway's routing layer. Backend services should be version-agnostic, with the gateway translating between client-facing API versions and internal interfaces.

**Monitor Everything**: Emit telemetry for every request, including latency histograms, error rates, and authentication failures. Gateway telemetry is the single most valuable source of API health data because it captures 100% of traffic.

**Keep the Gateway Thin**: The gateway should route, validate, and secure -- not orchestrate complex business logic. Business logic belongs in backend services. A thick gateway becomes a deployment bottleneck and single point of failure.

## Related Terms

- [REST API](@/glossary/rest-api.md) - HTTP interface style served through the gateway
- [Rate Limiting](@/glossary/rate-limiting.md) - Traffic control enforced at the gateway level
- [JWT](@/glossary/jwt.md) - Token-based authentication validated by the gateway
- [RBAC](@/glossary/rbac.md) - Role-based authorization enforced at the gateway
- [OAuth2](@/glossary/oauth2.md) - Token issuance and validation through the gateway
- [OpenAPI](@/glossary/openapi.md) - Specification documenting all gateway endpoints
- [Plug](@/glossary/plug.md) - Elixir middleware composing the gateway pipeline
- [TLS](@/glossary/tls.md) - Transport encryption terminated at the gateway
- [Circuit Breaker](@/glossary/circuit-breaker.md) - Resilience pattern protecting backend services
- [Observability](@/glossary/observability.md) - Monitoring and tracing through gateway telemetry
- [Microservices](@/glossary/microservices.md) - Architectural style that necessitates API gateways
- [ETS](@/glossary/ets.md) - In-memory storage backing the endpoint registry

## See Also

- [Architecture](@/architecture/_index.md) - Gateway integration architecture
- [Apps](@/apps/_index.md) - Prismatic API application details
- [Technologies](@/technologies/_index.md) - Phoenix, Plug, and OpenApiSpex

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
