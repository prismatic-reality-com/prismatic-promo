+++
title = "API Integration"
weight = 50
[extra]
description = "Connecting software systems through Application Programming Interfaces for structured data exchange, functionality sharing, and orchestrated service composition across distributed architectures"
category = "integration"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-advanced"
domain_category = "software-integration"
related_concepts = ["api-gateway", "openapi", "rest-api", "graphql", "endpoint", "webhook", "microservices", "service-mesh"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 6
prerequisites = ["HTTP protocol fundamentals", "JSON/XML data formats", "authentication patterns", "basic networking"]
learning_path = ["api", "rest-api", "openapi", "api-gateway", "graphql", "service-mesh"]
interactive_demos = ["OpenAPI explorer at /api/swaggerui", "endpoint discovery at /api/v1/endpoints"]
code_examples = ["Elixir HTTP client", "OpenApiSpex controller", "webhook handler", "API authentication plug"]
external_resources = ["https://swagger.io/specification/", "https://graphql.org/", "https://hexdocs.pm/open_api_spex/"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["contract testing", "integration testing", "load testing", "chaos testing"]
keywords = ["API", "integration", "REST", "GraphQL", "OpenAPI", "webhook", "HTTP", "endpoint", "microservices"]
tags = ["glossary", "integration", "api", "architecture"]
related_terms = ["api-gateway", "openapi", "rest-api", "graphql", "endpoint", "webhook", "microservices", "authentication"]
word_count = 1648
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "API Integration - Prismatic Platform"
+++

## Definition

**API Integration** is the systematic process of connecting disparate software systems through well-defined Application Programming Interfaces (APIs) to enable structured data exchange, shared functionality invocation, and orchestrated service composition. An API integration establishes a contract between a provider (the system exposing functionality) and a consumer (the system invoking that functionality), specifying the format of requests, the structure of responses, authentication requirements, error semantics, and operational constraints such as rate limits and idempotency guarantees.

In formal terms, an API integration can be modeled as a typed communication channel `C: Request -> Response` where `Request` and `Response` are members of well-defined schemas, the channel enforces pre-conditions and post-conditions, and the integration layer handles serialization, transport, authentication, retry logic, and error normalization. The quality of an API integration is measured by its reliability (uptime, error rates), latency (p50, p95, p99), correctness (schema conformance), and evolvability (versioning, backward compatibility).

## Overview

API integration has evolved from simple remote procedure calls in the 1990s through SOAP/WSDL-based web services in the 2000s to the modern landscape dominated by REST, GraphQL, gRPC, and event-driven APIs. Today's API integrations must handle distributed system challenges including network partitions, partial failures, eventual consistency, and schema evolution -- all while maintaining developer ergonomics and operational observability.

The significance of API integration in modern software architecture cannot be overstated. Organizations typically operate dozens to hundreds of internal services, each exposing APIs that other services consume. External integrations with third-party services (payment processors, identity providers, analytics platforms, OSINT data sources) add further complexity. A well-designed API integration strategy reduces coupling between services, enables independent deployment and scaling, supports polyglot architectures, and provides clear boundaries for testing and monitoring.

Within the Prismatic Platform, API integration is a first-class concern. The platform's auto-introspecting [REST API](/glossary/rest-api/) discovers all public functions across facade modules at boot time, maps Elixir typespecs to [OpenAPI](/glossary/openapi/) schemas, and exposes them through a unified gateway. This approach eliminates the manual specification drift that plagues most API ecosystems and ensures that the API surface always reflects the actual codebase.

### Key Characteristics of API Integration

| Characteristic | Description | Prismatic Implementation |
|---------------|-------------|-------------------------|
| **Contract-First** | API shape defined before implementation | OpenApiSpex schemas with compile-time validation |
| **Auto-Discovery** | Services find each other dynamically | Boot-time module scanning with ETS caching |
| **Type Safety** | Request/response types enforced | Elixir @spec AST mapped to JSON Schema |
| **Versioning** | Multiple API versions coexist | URL-based versioning (`/api/v1/`, `/api/v2/`) |
| **Observability** | All calls traced and measured | Telemetry events on every request |
| **Resilience** | Graceful degradation under failure | Circuit breakers, bulkheads, retry with backoff |

## Technical Details

### API Integration Patterns

API integrations follow several well-established patterns, each suited to different requirements:

**Request-Response (Synchronous)**: The consumer sends a request and blocks until the provider returns a response. This is the simplest pattern and works well for low-latency, high-availability services. REST and gRPC primarily operate in this mode.

**Event-Driven (Asynchronous)**: The provider publishes events to a message broker, and consumers subscribe to relevant event streams. This decouples producer and consumer lifecycles, supports fan-out, and enables temporal decoupling. Webhook integrations are a simplified form of this pattern.

**Polling**: The consumer periodically queries the provider for updates. While less efficient than event-driven approaches, polling is simpler to implement and works when the provider does not support push notifications.

**Batch**: Large volumes of data are exchanged in bulk, typically on a schedule. ETL pipelines and data warehouse loading follow this pattern.

### Protocol Comparison

| Protocol | Transport | Serialization | Streaming | Schema | Prismatic Usage |
|----------|-----------|---------------|-----------|--------|----------------|
| **REST** | HTTP/1.1, HTTP/2 | JSON, XML | Limited (chunked) | OpenAPI 3.0 | Primary external API |
| **GraphQL** | HTTP/1.1, WebSocket | JSON | Subscriptions | SDL | Planned for complex queries |
| **gRPC** | HTTP/2 | Protocol Buffers | Bidirectional | .proto files | Internal high-perf services |
| **WebSocket** | TCP (upgraded HTTP) | JSON, binary | Full-duplex | Custom | LiveView, real-time updates |
| **Webhook** | HTTP POST | JSON | Push-based | JSON Schema | Event notifications |

### Authentication and Authorization

API integrations require robust authentication to verify the identity of consumers and authorization to enforce access control. Common mechanisms include:

```elixir
defmodule PrismaticAPI.Plugs.APIAuth do
  @moduledoc """
  Authentication plug for API requests.
  Supports multiple authentication strategies with
  fallback chain: Bearer token -> API key -> mTLS.
  """

  import Plug.Conn

  @behaviour Plug

  @spec init(keyword()) :: keyword()
  def init(opts), do: opts

  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(conn, _opts) do
    with {:error, :no_bearer} <- authenticate_bearer(conn),
         {:error, :no_api_key} <- authenticate_api_key(conn),
         {:error, :no_mtls} <- authenticate_mtls(conn) do
      conn
      |> put_status(401)
      |> Phoenix.Controller.json(%{error: "unauthorized", message: "Valid credentials required"})
      |> halt()
    else
      {:ok, identity} ->
        assign(conn, :current_identity, identity)
    end
  end

  @spec authenticate_bearer(Plug.Conn.t()) :: {:ok, map()} | {:error, :no_bearer}
  defp authenticate_bearer(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] -> verify_jwt(token)
      _ -> {:error, :no_bearer}
    end
  end

  @spec authenticate_api_key(Plug.Conn.t()) :: {:ok, map()} | {:error, :no_api_key}
  defp authenticate_api_key(conn) do
    case get_req_header(conn, "x-api-key") do
      [key] when byte_size(key) > 0 -> verify_api_key(key)
      _ -> {:error, :no_api_key}
    end
  end

  @spec authenticate_mtls(Plug.Conn.t()) :: {:ok, map()} | {:error, :no_mtls}
  defp authenticate_mtls(conn) do
    case conn.private[:client_cert] do
      nil -> {:error, :no_mtls}
      cert -> verify_certificate(cert)
    end
  end

  defp verify_jwt(_token), do: {:error, :no_bearer}
  defp verify_api_key(_key), do: {:error, :no_api_key}
  defp verify_certificate(_cert), do: {:error, :no_mtls}
end
```

### Rate Limiting and Throttling

Production API integrations must enforce rate limits to protect backend services from overload and ensure fair resource distribution among consumers:

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Fixed Window** | Count requests per time window | Simple, predictable limits |
| **Sliding Window** | Rolling count over time period | Smoother rate enforcement |
| **Token Bucket** | Refill tokens at fixed rate | Burst-tolerant with steady-state limit |
| **Leaky Bucket** | Process requests at fixed rate | Smooth output rate |
| **Adaptive** | Adjust limits based on system health | Dynamic load management |

### Error Handling and Retry Semantics

API integrations must handle failures gracefully. The key distinction is between transient failures (network timeouts, 503 responses) that should be retried and permanent failures (400 validation errors, 404 not found) that should not:

```elixir
defmodule PrismaticAPI.Client.RetryStrategy do
  @moduledoc """
  Exponential backoff retry strategy with jitter
  for transient API failures.
  """

  @type retry_opts :: %{
    max_retries: non_neg_integer(),
    base_delay_ms: non_neg_integer(),
    max_delay_ms: non_neg_integer(),
    jitter_factor: float()
  }

  @default_opts %{
    max_retries: 3,
    base_delay_ms: 100,
    max_delay_ms: 5_000,
    jitter_factor: 0.25
  }

  @spec execute((() -> {:ok, term()} | {:error, term()}), retry_opts()) ::
          {:ok, term()} | {:error, term()}
  def execute(fun, opts \\ @default_opts) do
    do_execute(fun, opts, 0)
  end

  @spec do_execute((() -> {:ok, term()} | {:error, term()}), retry_opts(), non_neg_integer()) ::
          {:ok, term()} | {:error, term()}
  defp do_execute(fun, opts, attempt) when attempt >= opts.max_retries do
    fun.()
  end

  defp do_execute(fun, opts, attempt) do
    case fun.() do
      {:ok, result} ->
        {:ok, result}

      {:error, reason} when reason in [:timeout, :econnrefused, :service_unavailable] ->
        delay = calculate_delay(attempt, opts)
        Process.sleep(delay)
        do_execute(fun, opts, attempt + 1)

      {:error, _reason} = error ->
        error
    end
  end

  @spec calculate_delay(non_neg_integer(), retry_opts()) :: non_neg_integer()
  defp calculate_delay(attempt, opts) do
    base = min(opts.base_delay_ms * Integer.pow(2, attempt), opts.max_delay_ms)
    jitter = trunc(base * opts.jitter_factor * :rand.uniform())
    base + jitter
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform implements API integration through its auto-introspecting REST gateway, which eliminates the traditional disconnect between code and API documentation.

### Auto-Discovery Architecture

At boot time, the API scanner traverses all modules matching the `Prismatic*` namespace, identifies public functions with documentation and typespecs, and registers them in an ETS-backed registry. The [OpenAPI](/glossary/openapi/) specification is generated automatically from Elixir `@spec` annotations:

```elixir
defmodule PrismaticAPI.Scanner do
  @moduledoc """
  Discovers API-eligible functions across all Prismatic facade modules
  at application boot time. Results are cached in ETS for O(1) lookup.
  """

  @spec scan_all_modules() :: {:ok, non_neg_integer()} | {:error, term()}
  def scan_all_modules do
    modules =
      :code.all_loaded()
      |> Enum.map(&elem(&1, 0))
      |> Enum.filter(&facade_module?/1)

    endpoints =
      Enum.flat_map(modules, fn module ->
        module
        |> discover_functions()
        |> Enum.map(&build_endpoint(module, &1))
      end)

    :ets.insert(:api_registry, {:endpoints, endpoints})
    {:ok, length(endpoints)}
  end

  @spec facade_module?(module()) :: boolean()
  defp facade_module?(module) do
    module
    |> Atom.to_string()
    |> String.starts_with?("Elixir.Prismatic")
  end

  @spec discover_functions(module()) :: [{atom(), non_neg_integer()}]
  defp discover_functions(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, :elixir, _, _, _, docs} ->
        docs
        |> Enum.filter(fn {{kind, _, _}, _, _, doc, _} ->
          kind == :function and doc != :hidden
        end)
        |> Enum.map(fn {{:function, name, arity}, _, _, _, _} ->
          {name, arity}
        end)

      _ ->
        []
    end
  end

  defp build_endpoint(module, {name, arity}) do
    %{
      module: module,
      function: name,
      arity: arity,
      method: if(arity <= 2, do: :get, else: :post),
      path: build_path(module, name)
    }
  end

  defp build_path(module, function) do
    app =
      module
      |> Module.split()
      |> Enum.at(1, "unknown")
      |> Macro.underscore()

    "/api/v1/#{app}/#{function}"
  end
end
```

### Generic Dispatch Controller

The dispatch controller resolves incoming API requests to the appropriate module and function, performing argument validation and type coercion:

```elixir
defmodule PrismaticAPI.DispatchController do
  @moduledoc """
  Generic API dispatch controller. Routes /api/v1/:app/:action
  to the corresponding Prismatic facade module function.
  """

  use PrismaticAPI, :controller

  @spec dispatch(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def dispatch(conn, %{"app" => app, "action" => action} = params) do
    with {:ok, endpoint} <- resolve_endpoint(app, action),
         {:ok, args} <- extract_args(params, endpoint),
         {:ok, result} <- safe_apply(endpoint.module, endpoint.function, args) do
      json(conn, %{status: "ok", data: result})
    else
      {:error, :not_found} ->
        conn |> put_status(404) |> json(%{error: "endpoint_not_found"})

      {:error, :invalid_args, details} ->
        conn |> put_status(400) |> json(%{error: "invalid_arguments", details: details})

      {:error, reason} ->
        conn |> put_status(500) |> json(%{error: "internal_error", reason: inspect(reason)})
    end
  end

  @spec safe_apply(module(), atom(), list()) :: {:ok, term()} | {:error, term()}
  defp safe_apply(module, function, args) do
    {:ok, apply(module, function, args)}
  rescue
    e -> {:error, Exception.message(e)}
  end

  defp resolve_endpoint(_app, _action), do: {:error, :not_found}
  defp extract_args(_params, _endpoint), do: {:ok, []}
end
```

### Webhook Integration

The platform supports inbound webhook processing for receiving events from external services:

| Webhook Source | Event Types | Processing |
|---------------|-------------|------------|
| GitHub/GitLab | Push, PR, Issue | CI/CD triggers, code analysis |
| External scanners | Vulnerability findings | Security posture updates |
| Monitoring | Alert, Recovery | Incident management |
| Payment | Transaction, Refund | Financial reconciliation |

## Comparison with Alternatives

| Approach | Strengths | Weaknesses | When to Use |
|----------|-----------|------------|-------------|
| **REST + OpenAPI** | Universal tooling, human-readable, cacheable | Over/under-fetching, multiple round-trips | Public APIs, CRUD operations |
| **GraphQL** | Precise data fetching, single endpoint, strong typing | Complexity, caching difficulty, N+1 risk | Complex data graphs, mobile clients |
| **gRPC** | High performance, streaming, code generation | Not browser-native, binary protocol | Internal microservices, latency-critical |
| **Message Queues** | Temporal decoupling, guaranteed delivery | Eventual consistency, debugging complexity | Async workflows, event sourcing |
| **Direct DB sharing** | Simple, fast | Tight coupling, schema dependency | Anti-pattern (avoid) |

Prismatic's approach of auto-introspecting REST with OpenApiSpex combines the universality of REST with the type safety typically associated with gRPC, while eliminating the manual specification maintenance burden that causes documentation drift.

## Best Practices

1. **Design APIs contract-first**: Define the [OpenAPI](/glossary/openapi/) specification before writing implementation code. This ensures consumer needs drive the design rather than implementation convenience.

2. **Version from day one**: Include version identifiers in API paths (`/api/v1/`) even for initial releases. Retrofitting versioning is significantly harder than including it from the start.

3. **Use idempotency keys**: For non-idempotent operations (POST, PUT), accept an idempotency key header to allow safe retries without duplicate side effects.

4. **Implement circuit breakers**: Wrap external API calls in [circuit breakers](/glossary/circuit-breaker/) to prevent cascading failures when downstream services are degraded.

5. **Return structured errors**: Use consistent error response schemas with machine-readable error codes, human-readable messages, and correlation IDs for debugging.

6. **Validate at the boundary**: Perform thorough input validation at the API layer rather than deep in business logic. Fail fast with clear error messages.

7. **Measure everything**: Emit telemetry for request count, latency distribution, error rate, and payload size. These metrics are essential for capacity planning and SLA management.

8. **Document rate limits**: Expose rate limit information in response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) so consumers can self-regulate.

## Common Pitfalls

1. **Specification drift**: Manual OpenAPI specifications diverge from actual implementation over time. Prismatic solves this through auto-introspection, but most teams must enforce CI checks that validate spec-code consistency.

2. **Chatty integrations**: Making many small API calls instead of batching or using more expressive query patterns. This multiplies latency and increases failure probability.

3. **Ignoring partial failures**: In distributed systems, a request may partially succeed. APIs must be designed so that consumers can detect and recover from partial failures.

4. **Hardcoded endpoints**: Embedding API URLs directly in code rather than using configuration or service discovery. This prevents environment-specific routing and complicates deployments.

5. **Missing pagination**: Returning unbounded result sets from list endpoints. All collection endpoints must support cursor-based or offset-based pagination.

6. **Inadequate timeout configuration**: Using default timeouts (often 30-60 seconds) instead of tuning per-endpoint. A slow downstream service should not block all consumers indefinitely.

7. **Breaking backward compatibility**: Removing fields, changing types, or altering semantics in existing API versions. Use additive changes within a version and reserve breaking changes for new versions.

## Use Cases

**Platform Service Composition**: The Prismatic Platform's 115 umbrella apps communicate through internal API integrations, enabling features like the [OSINT toolbox](/glossary/api-gateway/) to orchestrate queries across 120+ data providers through a unified interface.

**External Attack Surface Management**: The [Prismatic Perimeter](/glossary/attack-surface/) module integrates with external scanning APIs (DNS, certificate transparency, IP geolocation) to discover and assess an organization's attack surface, normalizing diverse API responses into a unified security rating model.

**Developer Portal**: The auto-generated SwaggerUI at `/api/swaggerui` provides an interactive API explorer where developers can discover available endpoints, examine request/response schemas, and execute test calls without writing code.

**Webhook-Driven Workflows**: External events (Git pushes, security alerts, monitoring triggers) flow into the platform through webhook integrations, triggering automated workflows such as code analysis pipelines and incident response procedures.

**OSINT Data Aggregation**: Over 120 OSINT adapters integrate with external intelligence APIs (Shodan, VirusTotal, ARES, commercial registers), each implementing a standardized adapter interface that normalizes heterogeneous API responses into uniform data structures.

## Related Concepts

- [API Gateway](/glossary/api-gateway/) -- centralized entry point that routes, authenticates, and rate-limits API traffic
- [OpenAPI](/glossary/openapi/) -- specification standard for describing RESTful API contracts
- [REST API](/glossary/rest-api/) -- architectural style for building web APIs using HTTP semantics
- [GraphQL](/glossary/graphql/) -- query language enabling clients to request precisely the data they need
- [Endpoint](/glossary/endpoint/) -- a specific URL path that accepts requests and returns responses
- [Circuit Breaker](/glossary/circuit-breaker/) -- resilience pattern that prevents cascading failures in API chains
- [Authentication](/glossary/authentication/) -- verifying the identity of API consumers
- [Adapter Pattern](/glossary/adapter-pattern/) -- structural pattern used to normalize diverse API interfaces
- [Microservices](/glossary/microservices/) -- architectural style where API integration is the primary communication mechanism

## See Also

- [OpenAPI Specification](https://swagger.io/specification/) -- the industry standard for API documentation
- [Prismatic API documentation](apps/prismatic_api/CLAUDE.md) -- internal platform API architecture guide
- [Elixir HTTP clients](https://hexdocs.pm/req/Req.html) -- Req library for making HTTP requests in Elixir
- [Phoenix Framework](https://hexdocs.pm/phoenix/) -- the web framework powering Prismatic's API layer

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
