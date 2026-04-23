+++
title = "Plug"
weight = 13
[extra]
category = "web-framework"
description = "Composable middleware specification and connection adapter for Elixir web applications"
url = "https://hexdocs.pm/plug/"
version = "1.16+"
icon = "plug"
color = "blue"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1114
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Plug", "Composable", "Elixir", "technologies", "web framework", "Prismatic Platform", "Conn", "Phoenix"]
tags = ["technologies", "web-framework", "plug", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Plug - Prismatic Platform"
+++

## Overview

Plug is the middleware specification that underpins all HTTP processing in the Prismatic Platform. It defines a common interface for composing modules that transform web requests and responses, enabling the platform to build sophisticated request processing pipelines for authentication, authorization, rate limiting, and API dispatch. Every HTTP request that enters the platform passes through a chain of Plug modules before reaching its handler, and every response passes back through the same chain in reverse.

The elegance of Plug lies in its simplicity: a plug is any module that implements `init/1` and `call/2`, where `call/2` receives a `%Plug.Conn{}` struct and returns a (possibly modified) `%Plug.Conn{}`. This uniform interface means that authentication, logging, compression, CORS headers, and content negotiation are all implemented as interchangeable pipeline stages that can be composed in any order. The `%Plug.Conn{}` struct itself is immutable -- each transformation returns a new struct, making the request processing pipeline a pure data transformation pipeline.

The Prismatic API gateway uses custom Plug modules extensively for its auto-introspecting REST API, where plugs handle endpoint discovery, parameter validation via [OpenAPI](@/technologies/openapi.md) schemas, and response formatting in a uniform pipeline. The main web application uses a separate set of plugs for browser sessions, CSRF protection, and user authentication. Both applications share common plugs for telemetry instrumentation and health checking.

## Key Features

- **Conn Struct**: Immutable request/response data structure threaded through pipelines, containing headers, params, assigns, status, and body
- **Module Plugs**: Reusable middleware modules with `init/1` (compile-time configuration) and `call/2` (runtime execution) callbacks
- **Function Plugs**: Lightweight inline middleware defined as simple two-argument functions for one-off transformations
- **Router**: Pattern-matching URL router with pipeline support, forward capabilities, and scope-based grouping
- **Adapters**: Bandit (pure Elixir) and Cowboy HTTP server adapters with identical Plug interface
- **Testing**: `Plug.Test` helpers for building test connections and asserting on response status, headers, and body
- **Parsers**: Built-in request body parsers for JSON, URL-encoded, and multipart form data with configurable size limits
- **Static Files**: `Plug.Static` for efficient static file serving with ETag support and gzip compression

## Platform Integration

Custom plugs handle authentication and API dispatch across the platform. The API authentication plug demonstrates the typical module plug pattern with `with` chains for clean error handling.

```elixir
defmodule PrismaticWeb.Plugs.APIAuth do
  @behaviour Plug
  import Plug.Conn

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    with {:ok, token} <- extract_token(conn),
         {:ok, claims} <- verify_token(token),
         {:ok, user} <- load_user(claims) do
      conn
      |> assign(:current_user, user)
      |> assign(:auth_method, :api_key)
    else
      {:error, :missing_token} ->
        conn |> put_status(:unauthorized) |> json_error("Missing API key") |> halt()

      {:error, :invalid_token} ->
        conn |> put_status(:unauthorized) |> json_error("Invalid API key") |> halt()

      {:error, :user_not_found} ->
        conn |> put_status(:forbidden) |> json_error("User not found") |> halt()
    end
  end

  defp extract_token(conn) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] -> {:ok, token}
      _ -> {:error, :missing_token}
    end
  end

  defp json_error(conn, message) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(conn.status, Jason.encode!(%{error: message}))
  end
end
```

The rate limiter plug uses [Redis](@/technologies/redis.md) for distributed rate limiting across cluster nodes, ensuring fair API usage regardless of which node handles the request:

```elixir
defmodule PrismaticWeb.Plugs.RateLimiter do
  @behaviour Plug
  import Plug.Conn

  @impl true
  def init(opts) do
    %{
      max_requests: Keyword.get(opts, :max_requests, 100),
      window_ms: Keyword.get(opts, :window_ms, 60_000)
    }
  end

  @impl true
  def call(conn, %{max_requests: max, window_ms: window}) do
    client_id = extract_client_id(conn)

    case PrismaticApi.RateLimiter.check_rate(client_id, max, div(window, 1000)) do
      :ok ->
        conn

      {:error, :rate_limited} ->
        conn
        |> put_resp_header("retry-after", to_string(div(window, 1000)))
        |> put_status(:too_many_requests)
        |> json_error("Rate limit exceeded")
        |> halt()
    end
  end

  defp extract_client_id(conn) do
    conn.assigns[:current_user][:id] || to_string(:inet.ntoa(conn.remote_ip))
  end
end
```

## Architecture

Plug sits at the core of the [Phoenix](@/technologies/phoenix.md) request lifecycle, processing every request through a defined sequence of transformations.

| Phase | Component | Purpose |
|-------|-----------|---------|
| **Connection** | HTTP Adapter (Bandit) | Accept TCP connection, parse HTTP request, create `%Plug.Conn{}` |
| **Endpoint** | `Phoenix.Endpoint` | Session, static files, request logging, error handling |
| **Router** | `Phoenix.Router` | URL pattern matching, pipeline selection |
| **Pipeline** | Ordered plug chain | Authentication, content negotiation, CSRF, rate limiting |
| **Controller/LiveView** | Request handler | Business logic execution and response generation |
| **Response** | `Plug.Conn` functions | Status code, headers, body encoding, send |

The `%Plug.Conn{}` struct carries the entire request context through the pipeline:

```elixir
%Plug.Conn{
  host: "prismatic-prod.fly.dev",
  method: "GET",
  path_info: ["api", "v1", "assets"],
  query_params: %{"type" => "domain"},
  req_headers: [{"authorization", "Bearer abc123"}],
  assigns: %{current_user: %User{}, auth_method: :api_key},
  status: nil,
  resp_body: nil
}
```

## The Conn Struct in Depth

The `%Plug.Conn{}` struct is the central abstraction in the Plug ecosystem. It represents the entire lifecycle of an HTTP request, from the initial connection through response delivery. Understanding its fields and their semantics is essential for writing correct plugs.

| Field Category | Key Fields | Description |
|---------------|-----------|-------------|
| **Request** | `method`, `request_path`, `path_info`, `query_string` | Parsed request line from HTTP |
| **Headers** | `req_headers`, `resp_headers` | Request and response header lists |
| **Parameters** | `params`, `query_params`, `body_params`, `path_params` | Parsed parameters from all sources |
| **State** | `assigns`, `private` | Application data (`assigns` for public, `private` for framework internals) |
| **Response** | `status`, `resp_body`, `resp_cookies` | Response under construction |
| **Lifecycle** | `state`, `halted` | Connection state (`:unset`, `:set`, `:sent`, `:chunked`) and halt flag |

The immutability guarantee means that each plug receives a fresh copy of the connection and cannot accidentally corrupt state for downstream plugs. This is fundamentally different from mutable middleware interfaces in other ecosystems where a poorly written middleware can corrupt the shared request object.

## Compile-Time Initialization

The compile-time initialization provided by `init/1` is a particularly significant advantage in production. Because [Phoenix](@/technologies/phoenix.md) calls `init/1` at compile time and passes the result to every `call/2` invocation, expensive operations like regex compilation, configuration validation, and default value resolution happen once during application startup rather than on every request.

```elixir
defmodule PrismaticWeb.Plugs.CorsPolicy do
  @behaviour Plug

  @impl true
  def init(opts) do
    %{
      allowed_origins: Keyword.get(opts, :origins, ["https://prismatic-prod.fly.dev"]),
      allowed_methods: Keyword.get(opts, :methods, ["GET", "POST", "PUT", "DELETE"]),
      max_age: Keyword.get(opts, :max_age, 86400),
      origin_regex: opts |> Keyword.get(:origin_pattern, ".*") |> Regex.compile!()
    }
  end

  @impl true
  def call(conn, config) do
    origin = get_req_header(conn, "origin") |> List.first()
    if origin && Regex.match?(config.origin_regex, origin) do
      conn
      |> put_resp_header("access-control-allow-origin", origin)
      |> put_resp_header("access-control-allow-methods", Enum.join(config.allowed_methods, ", "))
      |> put_resp_header("access-control-max-age", to_string(config.max_age))
    else
      conn
    end
  end
end
```

This design means that even complex plug pipelines with many stages add negligible latency to the request path. The immutability of `%Plug.Conn{}` also makes plug pipelines inherently safe for concurrent execution -- since no two requests ever share a mutable connection struct, there are no race conditions or synchronization requirements, which is essential for a platform handling thousands of simultaneous API and LiveView requests.

## Performance Characteristics

Plug's compile-time initialization and simple function call pipeline introduce minimal overhead per request.

| Metric | Value | Notes |
|--------|-------|-------|
| Pipeline dispatch | <10us | Per-plug function call overhead |
| Auth plug execution | ~50us | Token extraction + verification |
| Rate limit check | ~200us | Redis round-trip for distributed check |
| Body parsing (JSON) | ~100us | For typical API request bodies |
| Static file serving | <50us | `Plug.Static` with ETag cache |
| Total pipeline overhead | ~300us | Full browser pipeline with session |

## Configuration

```elixir
# Pipeline configuration in Phoenix Router
pipeline :browser do
  plug :accepts, ["html"]
  plug :fetch_session
  plug :fetch_live_flash
  plug :put_root_layout, html: {PrismaticWeb.Layouts, :root}
  plug :protect_from_forgery
  plug :put_secure_browser_headers
  plug PrismaticWeb.Plugs.SetCurrentUser
end

pipeline :api do
  plug :accepts, ["json"]
  plug PrismaticWeb.Plugs.APIAuth
  plug PrismaticWeb.Plugs.RateLimiter, max_requests: 100, window_ms: 60_000
  plug OpenApiSpex.Plug.CastAndValidate, json_render_error_v2: true
end

# Endpoint-level plug configuration
plug Plug.Parsers,
  parsers: [:urlencoded, :multipart, :json],
  pass: ["*/*"],
  json_decoder: Phoenix.json_library(),
  length: 10_000_000

plug Plug.Head
plug Plug.MethodOverride
```

## Testing Plugs

The platform tests all custom plugs in isolation using `Plug.Test.conn/3`, which builds test connections without requiring the full Phoenix stack. This isolation ensures that plug logic is verified independently of routing, endpoint configuration, and other infrastructure.

```elixir
defmodule PrismaticWeb.Plugs.APIAuthTest do
  use ExUnit.Case, async: true
  import Plug.Test

  test "authenticates valid bearer token" do
    conn = conn(:get, "/api/v1/assets")
    |> put_req_header("authorization", "Bearer valid_token")
    |> PrismaticWeb.Plugs.APIAuth.call(%{})

    assert conn.assigns[:current_user]
    refute conn.halted
  end

  test "rejects missing authorization header" do
    conn = conn(:get, "/api/v1/assets")
    |> PrismaticWeb.Plugs.APIAuth.call(%{})

    assert conn.status == 401
    assert conn.halted
  end
end
```

## Best Practices

- **Use module plugs for reusable middleware** -- function plugs are convenient for one-off transformations but cannot be shared across routers or applications
- **Initialize expensive resources in `init/1`** -- `init/1` runs at compile time (in Phoenix), so compile regex patterns, parse configuration, and validate options there
- **Call `halt/1` after sending a response** -- failing to halt allows downstream plugs to run even though a response has already been sent
- **Keep plugs single-purpose** -- a plug should do one thing well; compose multiple plugs rather than building a monolithic authentication-and-authorization-and-logging plug
- **Use `assign/3` for request-scoped data** -- `conn.assigns` is the canonical location for data that flows between plugs and controllers
- **Test plugs in isolation** -- use `Plug.Test.conn/3` to build test connections and assert on the plug's output without running the full Phoenix stack
- **Order plugs carefully** -- authentication must come before authorization, parsing before validation; pipeline order determines execution order

## Comparison with Alternatives

| Feature | Plug (Elixir) | Rack (Ruby) | WSGI (Python) | Connect/Express (Node.js) |
|---------|--------------|-------------|---------------|--------------------------|
| Interface | `init/1` + `call/2` | `call(env)` | `app(environ, start_response)` | `(req, res, next)` |
| Data structure | Immutable `%Plug.Conn{}` | Mutable env hash | Mutable environ dict | Mutable req/res objects |
| Composition | Pipeline (sequential) | Middleware stack | Middleware stack | Middleware chain |
| Compile-time init | Yes (`init/1`) | No | No | No |
| Async support | Native (BEAM processes) | Thread-based | async/await | Event loop |
| Testing | `Plug.Test` built-in | `Rack::Test` | `unittest.mock` | `supertest` |

Plug's immutable `%Plug.Conn{}` struct provides stronger guarantees than mutable middleware interfaces in other ecosystems, preventing accidental state corruption and making request processing easier to reason about.

## Related Technologies

- [Phoenix Framework](@/technologies/phoenix.md) - Built on top of Plug for routing, controllers, and endpoints
- [JOSE](@/technologies/jose.md) - JWT token handling used in authentication plugs
- [OpenAPI](@/technologies/openapi.md) - API specification validation through `OpenApiSpex.Plug.CastAndValidate`
- [Redis](@/technologies/redis.md) - Backing store for distributed rate limiting in the rate limiter plug
- [Elixir](@/technologies/elixir.md) - The language Plug is implemented in
- [BEAM VM](@/technologies/beam.md) - Process model that handles each connection independently

## Related Apps

- [prismatic_web](@/apps/prismatic-web.md) - Browser-facing plug pipelines for sessions, CSRF, and authentication
- [prismatic_api](@/apps/prismatic-api.md) - API plug pipelines for authentication, rate limiting, and OpenAPI validation
- [prismatic_auth](@/apps/prismatic-auth.md) - Authentication modules consumed by plug middleware

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)