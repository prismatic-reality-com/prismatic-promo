+++
title = "Software Development Kit (SDK)"
weight = 30
[extra]
description = "Packaged collection of tools, libraries, APIs, and documentation enabling developers to build applications that integrate with the Prismatic Platform ecosystem"
category = "development"
abbreviation = "SDK"
related_terms = ["api", "api-integration", "api-gateway", "protocol", "adapter-pattern", "open-source", "elixir", "phoenix-framework", "composability", "pipeline"]
keywords = ["software development kit definition", "SDK architecture design", "developer toolkit platform", "SDK versioning strategy", "API client library", "Elixir SDK development", "platform SDK integration", "developer experience SDK"]
tags = ["sdk", "development", "api", "integration", "tooling"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
word_count = 1425
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Software Development Kit (SDK) - Prismatic Platform"
+++

## Definition

A Software Development Kit (SDK) is a curated collection of tools, libraries, code samples, documentation, and development utilities packaged together to enable developers to build applications that integrate with a specific platform, service, or hardware. An SDK goes beyond a simple API client by providing higher-level abstractions, type-safe interfaces, error handling patterns, authentication flows, and idiomatic code structures that align with the target programming language's conventions. The goal of an SDK is to minimize the cognitive overhead required for integration: instead of manually constructing HTTP requests, parsing responses, and handling edge cases, developers work with strongly typed functions, well-documented modules, and battle-tested patterns that encapsulate the complexity of the underlying platform.

An SDK typically includes: client libraries for API communication, type definitions and data models, authentication and authorization helpers, configuration management, error handling and retry logic, logging and telemetry integration, code examples and quickstart guides, and comprehensive reference documentation. The best SDKs feel native to their target language -- an Elixir SDK uses GenServers and supervision trees, a TypeScript SDK uses Promises and type inference, a Rust SDK uses ownership and lifetimes. This idiomatic design is what separates a well-crafted SDK from a thin HTTP wrapper.

## Overview

The evolution of SDKs reflects the broader maturation of the software industry. Early SDKs were primarily associated with operating systems (Windows SDK, macOS SDK) and hardware platforms (Android SDK, iOS SDK). The cloud computing era shifted SDKs toward service integration: every major cloud provider (AWS, GCP, Azure) ships SDKs for dozens of languages. The modern platform economy has made SDKs a competitive differentiator -- developer experience directly impacts platform adoption, and the quality of an SDK often determines whether developers choose one platform over another.

SDKs serve multiple audiences with different needs:

| Audience | SDK Requirements | Priority |
|----------|-----------------|----------|
| **Application developers** | Simple API, good defaults, quickstart guides | Getting started fast |
| **Integration engineers** | Detailed configuration, custom transports, middleware hooks | Flexibility and control |
| **Platform operators** | Monitoring, telemetry, health checks, circuit breakers | Production reliability |
| **Security engineers** | Authentication flows, secret management, audit logging | Security posture |
| **Quality engineers** | Test utilities, mocking support, deterministic modes | Testability |

Within the Prismatic Platform, the SDK strategy follows a multi-package architecture: a core SDK for fundamental platform interaction, a Plugin Kit for extending platform capabilities, a Security SDK for specialized security operations, and a UI SDK for building frontend interfaces. Each package is independently versioned, minimally coupled, and designed for the specific concerns of its target audience.

The relationship between SDKs and [APIs](@/glossary/api.md) is complementary but distinct. An API defines the contract -- the endpoints, request formats, response schemas, and error codes. An SDK implements that contract in a specific language, adding type safety, retry logic, connection pooling, and developer ergonomics. You can use an API without an SDK (by making raw HTTP calls), but you cannot use an SDK without an underlying API. The SDK's value proposition is reducing the gap between "the API exists" and "I can productively use it."

## Technical Deep Dive

### SDK Architecture Patterns

A well-designed SDK follows layered architecture principles, separating concerns into distinct layers:

```
+--------------------------------------------------+
|  Public API Layer (Developer-Facing)              |
|  - Type-safe functions, documentation             |
|  - Idiomatic language patterns                    |
+--------------------------------------------------+
|  Business Logic Layer                             |
|  - Request building, response parsing             |
|  - Pagination, filtering, sorting                 |
+--------------------------------------------------+
|  Transport Layer                                  |
|  - HTTP client, WebSocket, gRPC                   |
|  - Connection pooling, keep-alive                 |
+--------------------------------------------------+
|  Resilience Layer                                 |
|  - Retry logic, circuit breakers                  |
|  - Rate limiting, backoff strategies              |
+--------------------------------------------------+
|  Authentication Layer                             |
|  - Token management, refresh flows                |
|  - API key rotation, OAuth2                       |
+--------------------------------------------------+
|  Telemetry Layer                                  |
|  - Request/response logging                       |
|  - Performance metrics, error tracking            |
+--------------------------------------------------+
```

### Elixir SDK Implementation

The Prismatic SDK for Elixir demonstrates how an SDK should be idiomatic to its target language -- using OTP patterns, supervision trees, and the functional programming style that Elixir developers expect:

```elixir
defmodule PrismaticSDK do
  @moduledoc """
  Official Elixir SDK for the Prismatic Platform.

  Provides type-safe, OTP-native access to all Prismatic Platform
  services including OSINT, security ratings, compliance assessment,
  and asset discovery.

  ## Quick Start

      # In your mix.exs
      {:prismatic_sdk, "~> 1.0"}

      # In your application
      client = PrismaticSDK.client(api_key: System.get_env("PRISMATIC_API_KEY"))
      {:ok, rating} = PrismaticSDK.Security.get_rating(client, "example.com")

  ## Configuration

      config :prismatic_sdk,
        api_key: {:system, "PRISMATIC_API_KEY"},
        base_url: "https://api.prismatic.io/v1",
        timeout: 30_000,
        retry_max: 3,
        telemetry_prefix: [:prismatic, :sdk]
  """

  @type client :: %__MODULE__.Client{
    api_key: String.t(),
    base_url: String.t(),
    http_client: module(),
    timeout: pos_integer(),
    retry_config: retry_config()
  }

  @type retry_config :: %{
    max_attempts: pos_integer(),
    base_delay_ms: pos_integer(),
    max_delay_ms: pos_integer(),
    jitter: boolean()
  }

  @type api_response(data) ::
    {:ok, data}
    | {:error, PrismaticSDK.Error.t()}

  @doc """
  Creates a new SDK client with the given configuration.
  The client is a lightweight struct -- no processes are started.
  For connection pooling, use `PrismaticSDK.start_pool/1`.
  """
  @spec client(keyword()) :: client()
  def client(opts \\ []) do
    %PrismaticSDK.Client{
      api_key: Keyword.get(opts, :api_key, fetch_config(:api_key)),
      base_url: Keyword.get(opts, :base_url, fetch_config(:base_url)),
      http_client: Keyword.get(opts, :http_client, PrismaticSDK.HTTP.Finch),
      timeout: Keyword.get(opts, :timeout, 30_000),
      retry_config: build_retry_config(opts)
    }
  end

  defp fetch_config(key) do
    case Application.get_env(:prismatic_sdk, key) do
      {:system, env_var} -> System.get_env(env_var)
      value -> value
    end
  end

  defp build_retry_config(opts) do
    %{
      max_attempts: Keyword.get(opts, :retry_max, 3),
      base_delay_ms: Keyword.get(opts, :retry_base_delay, 1_000),
      max_delay_ms: Keyword.get(opts, :retry_max_delay, 30_000),
      jitter: Keyword.get(opts, :retry_jitter, true)
    }
  end
end

defmodule PrismaticSDK.Client do
  @moduledoc false
  defstruct [:api_key, :base_url, :http_client, :timeout, :retry_config]
end
```

### Domain-Specific SDK Modules

Each SDK domain module provides focused, type-safe access to a specific platform capability:

```elixir
defmodule PrismaticSDK.Security do
  @moduledoc """
  Security assessment and rating operations.

  Provides access to the Prismatic Perimeter security rating engine,
  including domain scanning, vulnerability assessment, and compliance
  checking.
  """

  alias PrismaticSDK.{Client, Request, Response, Error}

  @type rating :: %{
    domain: String.t(),
    grade: :A | :B | :C | :D | :F,
    score: 300..900,
    industry_percentile: 0..100,
    assessed_at: DateTime.t(),
    factors: [rating_factor()]
  }

  @type rating_factor :: %{
    category: String.t(),
    score: float(),
    weight: float(),
    findings: [String.t()]
  }

  @doc """
  Retrieves the security rating for a domain.

  ## Examples

      {:ok, rating} = PrismaticSDK.Security.get_rating(client, "example.com")
      rating.grade  #=> :B
      rating.score  #=> 780

  ## Options

    * `:include_factors` - Include detailed rating factors (default: false)
    * `:cached` - Accept cached results up to N seconds old (default: 0)
  """
  @spec get_rating(Client.t(), String.t(), keyword()) ::
    {:ok, rating()} | {:error, Error.t()}
  def get_rating(%Client{} = client, domain, opts \\ []) do
    Request.new(:get, "/security/ratings/#{URI.encode(domain)}")
    |> Request.with_params(Keyword.take(opts, [:include_factors, :cached]))
    |> Request.execute(client)
    |> Response.decode(&decode_rating/1)
  end

  @doc """
  Initiates a full security scan for a domain.
  Returns a scan ID that can be polled for results.
  """
  @spec start_scan(Client.t(), String.t(), keyword()) ::
    {:ok, %{scan_id: String.t(), estimated_duration: pos_integer()}}
    | {:error, Error.t()}
  def start_scan(%Client{} = client, domain, opts \\ []) do
    body = %{
      domain: domain,
      scan_depth: Keyword.get(opts, :depth, :standard),
      include_subdomains: Keyword.get(opts, :subdomains, true)
    }

    Request.new(:post, "/security/scans")
    |> Request.with_body(body)
    |> Request.execute(client)
    |> Response.decode(&decode_scan_response/1)
  end

  defp decode_rating(data) do
    %{
      domain: data["domain"],
      grade: String.to_existing_atom(data["grade"]),
      score: data["score"],
      industry_percentile: data["industry_percentile"],
      assessed_at: DateTime.from_iso8601!(data["assessed_at"]),
      factors: Enum.map(data["factors"] || [], &decode_factor/1)
    }
  end

  defp decode_factor(data) do
    %{
      category: data["category"],
      score: data["score"],
      weight: data["weight"],
      findings: data["findings"] || []
    }
  end

  defp decode_scan_response(data) do
    %{
      scan_id: data["scan_id"],
      estimated_duration: data["estimated_duration_seconds"]
    }
  end
end
```

### SDK Resilience Patterns

Production SDKs must handle network failures, rate limits, and service degradation gracefully. The resilience layer implements exponential backoff with jitter, circuit breakers, and structured error reporting:

```elixir
defmodule PrismaticSDK.Resilience do
  @moduledoc """
  Resilience patterns for the Prismatic SDK.
  Implements retry with exponential backoff and jitter,
  circuit breaker pattern, and rate limit awareness.
  """

  alias PrismaticSDK.{Client, Error}

  @retryable_status_codes [429, 500, 502, 503, 504]

  @doc """
  Executes a request with automatic retry on transient failures.
  Uses exponential backoff with full jitter to prevent thundering herd.
  """
  @spec with_retry(Client.t(), (-> {:ok, any()} | {:error, Error.t()})) ::
    {:ok, any()} | {:error, Error.t()}
  def with_retry(%Client{retry_config: config}, request_fn) do
    do_retry(request_fn, config, 1)
  end

  defp do_retry(request_fn, %{max_attempts: max}, attempt) when attempt > max do
    case request_fn.() do
      {:ok, _} = success -> success
      {:error, _} = error -> error
    end
  end

  defp do_retry(request_fn, config, attempt) do
    case request_fn.() do
      {:ok, _} = success ->
        success

      {:error, %Error{status_code: code}} when code in @retryable_status_codes ->
        delay = calculate_delay(config, attempt)
        Process.sleep(delay)
        do_retry(request_fn, config, attempt + 1)

      {:error, %Error{reason: :timeout}} ->
        delay = calculate_delay(config, attempt)
        Process.sleep(delay)
        do_retry(request_fn, config, attempt + 1)

      {:error, _} = error ->
        error
    end
  end

  defp calculate_delay(config, attempt) do
    base = config.base_delay_ms * round(:math.pow(2, attempt - 1))
    capped = min(base, config.max_delay_ms)

    if config.jitter do
      :rand.uniform(capped)
    else
      capped
    end
  end
end
```

### SDK Telemetry Integration

Modern SDKs must be observable. The Prismatic SDK integrates with [Telemetry](@/glossary/telemetry.md) to provide standardized metrics for every API call:

```elixir
defmodule PrismaticSDK.Telemetry do
  @moduledoc """
  Telemetry integration for the Prismatic SDK.
  Emits standardized events for every API request,
  enabling monitoring, alerting, and performance analysis.
  """

  @doc """
  Wraps an API call with telemetry events.
  Emits start, stop, and exception events following
  the :telemetry.span/3 convention.
  """
  @spec span(atom(), map(), (-> {:ok, any()} | {:error, any()})) ::
    {:ok, any()} | {:error, any()}
  def span(operation, metadata, fun) do
    start_time = System.monotonic_time()

    :telemetry.execute(
      [:prismatic, :sdk, operation, :start],
      %{system_time: System.system_time()},
      metadata
    )

    try do
      result = fun.()
      duration = System.monotonic_time() - start_time

      :telemetry.execute(
        [:prismatic, :sdk, operation, :stop],
        %{duration: duration},
        Map.put(metadata, :result, result_type(result))
      )

      result
    rescue
      exception ->
        duration = System.monotonic_time() - start_time

        :telemetry.execute(
          [:prismatic, :sdk, operation, :exception],
          %{duration: duration},
          Map.merge(metadata, %{
            kind: :error,
            reason: exception,
            stacktrace: __STACKTRACE__
          })
        )

        reraise exception, __STACKTRACE__
    end
  end

  defp result_type({:ok, _}), do: :ok
  defp result_type({:error, _}), do: :error
  defp result_type(_), do: :unknown
end
```

## Platform Integration

### Multi-Package Architecture

The Prismatic Platform SDK follows a multi-package strategy where each package serves a distinct purpose:

| Package | Purpose | Audience | Dependencies |
|---------|---------|----------|-------------|
| **prismatic_sdk** | Core platform client, authentication, base types | All developers | Minimal (Finch, Jason) |
| **prismatic_plugin_kit** | Plugin development framework, hooks, lifecycle | Extension authors | prismatic_sdk |
| **prismatic_security** | Security scanning, rating, compliance APIs | Security engineers | prismatic_sdk |
| **prismatic_ui** | UI components, LiveView integration, themes | Frontend developers | prismatic_sdk, Phoenix |

This separation follows the [adapter pattern](@/glossary/adapter-pattern.md) principle: each package adapts the underlying platform API to the specific concerns of its target audience. A security engineer installing `prismatic_security` should not need to understand the plugin lifecycle, and a plugin author should not need to pull in UI dependencies.

### Versioning and Compatibility

SDK versioning follows semantic versioning (SemVer) with additional platform compatibility guarantees:

| Version Component | Meaning | Example |
|-------------------|---------|---------|
| **Major** (X.0.0) | Breaking API changes | New authentication flow |
| **Minor** (0.X.0) | New features, backward compatible | New endpoint support |
| **Patch** (0.0.X) | Bug fixes, performance improvements | Retry logic fix |

The SDK maintains backward compatibility with at least two major versions of the platform API. Deprecated functions emit compile-time warnings for one major version before removal.

### SDK and the API Gateway

The SDK communicates with the platform through the [API Gateway](@/glossary/api-gateway.md), which provides:

- **Request routing**: SDK requests are routed to the appropriate backend service
- **Rate limiting**: Per-client rate limits enforced at the gateway level
- **Authentication**: API keys and OAuth2 tokens validated before reaching services
- **Response caching**: Frequently requested data cached at the gateway layer
- **OpenAPI validation**: Request and response schemas validated against the [OpenAPI specification](@/glossary/api.md)

## Industry Context

### SDK Design Best Practices

The industry has converged on several best practices for SDK design:

| Practice | Description | Prismatic Implementation |
|----------|-------------|-------------------------|
| **Idiomatic code** | Follow target language conventions | OTP patterns, pipe operators, pattern matching |
| **Minimal dependencies** | Reduce dependency tree | Only Finch + Jason for core SDK |
| **Comprehensive types** | Full type coverage | @type and @spec on all public functions |
| **Error transparency** | Structured, actionable errors | PrismaticSDK.Error with code, message, metadata |
| **Testability** | Easy to mock and test | Behaviour-based HTTP client, test helpers |
| **Documentation** | Inline docs with examples | @moduledoc and @doc on everything |
| **Telemetry** | Observable by default | :telemetry events for all operations |

### Comparison with Major Platform SDKs

| Feature | Prismatic SDK | AWS SDK (Elixir) | Stripe (Elixir) | Google Cloud (Elixir) |
|---------|--------------|------------------|-----------------|----------------------|
| **Type safety** | Full @spec coverage | Partial | Partial | Minimal |
| **OTP integration** | GenServer, Supervisor | Basic | Basic | Basic |
| **Retry logic** | Exponential + jitter | Built-in | Built-in | Built-in |
| **Telemetry** | Native :telemetry | Custom | Custom | OpenTelemetry |
| **Error types** | Structured, pattern-matchable | Maps | Maps | Maps |
| **Pagination** | Stream-based, lazy | Manual | Auto-pagination | Manual |

## Anti-Patterns and Pitfalls

### Common SDK Design Mistakes

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **God SDK** | Single massive package with all features | Multi-package architecture with focused concerns |
| **Leaky abstractions** | HTTP details exposed to consumers | Clean domain types, transport-agnostic interfaces |
| **Silent failures** | Errors swallowed or logged without notification | Structured error types, explicit {:error, _} returns |
| **Blocking calls** | Synchronous HTTP blocking the caller | Async-first with explicit sync wrappers |
| **Global state** | Module attributes storing runtime config | Client struct passed explicitly to all functions |
| **Version coupling** | SDK breaks when API adds a field | Tolerant deserialization, ignore unknown fields |
| **Missing telemetry** | No visibility into SDK behavior | :telemetry events for all operations |

## Evolution and Future Directions

SDK development is evolving in several directions:

- **Code generation from OpenAPI**: Automatically generating type-safe SDK code from API specifications, reducing manual maintenance burden
- **Streaming and real-time**: SDKs increasingly support WebSocket, Server-Sent Events, and gRPC streaming alongside traditional request-response
- **Local-first SDKs**: Offline-capable SDKs that sync with the platform when connectivity returns
- **AI-assisted documentation**: Using LLMs to generate contextual examples based on the developer's specific integration scenario
- **Multi-runtime support**: Single SDK source targeting multiple runtimes (BEAM, Node.js, WASM) through compilation

The Prismatic Platform's SDK strategy -- with its multi-package architecture, OTP-native patterns, and comprehensive [telemetry](@/glossary/telemetry.md) integration -- positions the platform for adoption by the [Elixir](@/glossary/elixir.md) developer community while maintaining the quality standards enforced by the platform's [quality gates](@/glossary/quality-gates.md).

## Related Concepts

SDKs connect to numerous platform concepts:

- [API](@/glossary/api.md) -- The underlying contract that the SDK implements
- [API Gateway](@/glossary/api-gateway.md) -- The infrastructure layer that routes SDK requests
- [API Integration](@/glossary/api-integration.md) -- The practice of connecting systems through APIs and SDKs
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- The design pattern underlying SDK module architecture
- [Composability](@/glossary/composability.md) -- The principle enabling SDK modules to be combined
- [Telemetry](@/glossary/telemetry.md) -- Observability infrastructure integrated into every SDK call
- [Open Source](@/glossary/open-source.md) -- Distribution model for the Prismatic SDK packages
- [Protocol](@/glossary/protocol.md) -- Elixir protocols used for polymorphic SDK behavior

## Summary

A Software Development Kit transforms a platform API from a raw interface into a productive development experience. The best SDKs are invisible -- developers focus on their application logic while the SDK handles authentication, retry, serialization, telemetry, and error handling behind the scenes. The Prismatic Platform SDK follows OTP-native patterns with supervision trees, GenServers, and telemetry integration, packaged in a multi-package architecture that serves different audiences (application developers, plugin authors, security engineers, frontend developers) without coupling their concerns. By providing type-safe, well-documented, and thoroughly tested client libraries, the SDK lowers the barrier to platform adoption while maintaining the quality and reliability standards that the Prismatic Platform enforces across its entire ecosystem.

---

*Built with precision. Packaged for developers.*

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
