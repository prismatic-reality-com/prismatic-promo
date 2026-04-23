+++
title = "Plug"
weight = 15
[extra]
category = "architecture"
description = "Composable module specification for building request processing pipelines in Phoenix web applications."
related_terms = ["phoenix", "openapi", "rbac", "endpoint", "openapi-spec"]
acronym = ""
technical_domain = "Web Infrastructure"
complexity_level = "Intermediate"
platform_relevance = "Critical"
elixir_libraries = ["plug", "plug_cowboy", "plug_crypto", "cors_plug"]
phoenix_integration = "Foundation - Phoenix is built entirely on Plug"
beam_specific = true
prismatic_modules = ["PrismaticWeb.Plugs.APIAuth", "PrismaticWeb.Plugs.RateLimiter", "PrismaticWeb.Plugs.RequestLogger", "PrismaticApi.DispatchController"]
plug_types = ["function_plug", "module_plug"]
central_struct = "Plug.Conn"
pipeline_concept = true
industry_standard = "Rack (Ruby), WSGI (Python), Ring (Clojure)"
hex_package = "plug"
first_introduced = "Gen 1"
last_updated = "2026-02-22"
tags = ["plug", "middleware", "pipeline", "phoenix", "http", "conn", "request-processing", "composable"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1289
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Plug", "Composable", "Phoenix", "glossary", "architecture", "Prismatic Platform", "HTTP", "Module"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Plug - Prismatic Platform"
+++

## Definition

Plug is a specification and library for composable modules that process web requests in the Elixir ecosystem. At its core, Plug defines a simple contract: a plug receives a connection struct (`%Plug.Conn{}`), transforms it in some way, and returns the modified connection. This minimal interface -- receive a connection, return a connection -- enables plugs to compose into pipelines where each plug performs a single, focused transformation: parsing request bodies, authenticating users, enforcing rate limits, setting response headers, or any other request/response manipulation. The composability guarantee comes from the invariant that every plug's input type equals its output type: `Plug.Conn.t() -> Plug.Conn.t()`. This algebraic closure property means that any sequence of plugs is itself a valid plug, enabling arbitrary nesting and reuse.

Plug serves as the foundation for all HTTP processing in the Elixir ecosystem. [Phoenix](@/glossary/phoenix.md) is built entirely on top of Plug -- every Phoenix [endpoint](@/glossary/endpoint.md), router, pipeline, controller action, and [LiveView](@/glossary/liveview.md) mount passes through a chain of plugs. Understanding Plug is therefore essential for understanding how HTTP requests are processed in any Phoenix application, including the Prismatic Platform's web dashboard and API gateway. The relationship between Plug and Phoenix is analogous to Rack and Ruby on Rails, WSGI and Django, or Ring and Compojure -- Plug provides the HTTP abstraction layer, and Phoenix provides the application framework built on that abstraction.

The library provides two plug types: function plugs (simple functions that accept a connection and options) and module plugs (modules implementing `init/1` and `call/2` callbacks). Function plugs are convenient for simple transformations defined inline within routers or controllers, while module plugs support compile-time initialization for performance-critical operations like parsing configuration, compiling regex patterns, or pre-computing values that would be expensive to recompute per-request. The `init/1` callback runs once at compile time, and its return value is passed as the second argument to `call/2` on every request, amortizing initialization cost across all requests.

## The Plug.Conn Struct

`Plug.Conn` is the central data structure in the Plug ecosystem. It represents the entire state of an HTTP connection -- request data, response data, and metadata -- as an immutable Elixir struct. Because Elixir data structures are immutable, each plug transformation creates a new `Plug.Conn` struct with the modified fields while sharing unchanged data through structural sharing, making the pipeline both safe and memory-efficient:

```elixir
%Plug.Conn{
  # Request fields (populated from the HTTP request)
  host: "prismatic-prod.fly.dev",
  method: "POST",
  path_info: ["api", "v1", "perimeter", "discover"],
  query_string: "",
  req_headers: [{"content-type", "application/json"}, {"authorization", "Bearer ..."}],
  body_params: %{"domain" => "example.com"},
  remote_ip: {198, 51, 100, 42},

  # Response fields (set by plugs during processing)
  status: nil,
  resp_headers: [{"cache-control", "max-age=0, private, must-revalidate"}],
  resp_body: nil,

  # Connection state machine
  state: :unset,          # :unset -> :set -> :sent -> :file | :chunked
  halted: false,          # true if a plug has halted the pipeline

  # Assigns (application-specific data passed between plugs)
  assigns: %{
    current_user: nil,
    request_id: "F3nB8kQ..."
  },

  # Private (framework-internal data)
  private: %{
    phoenix_router: PrismaticWeb.Router,
    phoenix_endpoint: PrismaticWeb.Endpoint,
    phoenix_action: :index
  }
}
```

| Field Category | Key Fields | Description |
|---------------|------------|-------------|
| **Request** | `method`, `path_info`, `req_headers`, `body_params`, `query_params`, `remote_ip` | Parsed from the incoming HTTP request by the adapter |
| **Response** | `status`, `resp_headers`, `resp_body` | Set progressively by plugs during processing |
| **State** | `state`, `halted` | Tracks connection lifecycle and pipeline flow control |
| **Assigns** | `assigns` | Application-specific key-value store for passing data between plugs |
| **Private** | `private` | Framework-internal metadata (router, endpoint, action, etc.) |
| **Cookies** | `cookies`, `req_cookies`, `resp_cookies` | Cookie parsing and setting |
| **Session** | `secret_key_base` | Session encryption key for signed/encrypted cookies |

The `assigns` field is particularly important -- it serves as the primary mechanism for passing data between plugs in a pipeline. An authentication plug sets `assigns.current_user`, which a subsequent authorization plug reads to make access control decisions. This pattern avoids global state and makes data flow explicit: if a plug needs data, it must be in `assigns` or the plug cannot function, making dependencies between plugs visible and testable.

## Function Plugs

Function plugs are the simplest form: a function that accepts a connection and options, and returns a connection. They are typically defined as private functions within a router or controller module:

```elixir
defmodule PrismaticWeb.Router do
  @moduledoc """
  Main router for the Prismatic Platform web dashboard.
  Defines plug pipelines and route scoping.
  """

  use PrismaticWeb, :router

  # Function plug defined inline in a pipeline
  pipeline :api do
    plug :accepts, ["json"]
    plug :put_request_id
    plug :log_request
    plug :set_content_type
  end

  # Function plug implementation - adds unique request ID
  defp put_request_id(conn, _opts) do
    request_id = Ecto.UUID.generate()

    conn
    |> Plug.Conn.assign(:request_id, request_id)
    |> Plug.Conn.put_resp_header("x-request-id", request_id)
  end

  # Function plug implementation - structured request logging
  defp log_request(conn, _opts) do
    Logger.info("#{conn.method} #{conn.request_path}",
      request_id: conn.assigns[:request_id],
      remote_ip: conn.remote_ip |> :inet.ntoa() |> to_string(),
      user_agent: Plug.Conn.get_req_header(conn, "user-agent") |> List.first()
    )
    conn
  end

  # Function plug implementation - set JSON content type
  defp set_content_type(conn, _opts) do
    Plug.Conn.put_resp_content_type(conn, "application/json")
  end
end
```

Function plugs are ideal when the transformation is simple, self-contained, and does not require compile-time initialization. Their simplicity makes them easy to read inline within router definitions, keeping the plug pipeline declaration close to the transformation logic.

## Module Plugs

Module plugs implement the `Plug` behaviour with two callbacks: `init/1` (called at compile time for initialization) and `call/2` (called at runtime for each request). The separation of initialization from execution is a critical performance optimization:

```elixir
defmodule PrismaticWeb.Plugs.APIAuth do
  @moduledoc """
  Authenticates API requests via Bearer tokens.
  Supports token verification, path exclusion, and
  structured error responses for unauthorized access.
  """

  @behaviour Plug

  import Plug.Conn

  @type opts :: %{
    token_prefix: String.t(),
    excluded_paths: list(String.t()),
    realm: String.t()
  }

  @impl true
  @spec init(keyword()) :: opts()
  def init(opts) do
    # Called once at compile time -- expensive operations go here
    %{
      token_prefix: Keyword.get(opts, :token_prefix, "Bearer"),
      excluded_paths: Keyword.get(opts, :excluded_paths, ["/api/v1/health"]),
      realm: Keyword.get(opts, :realm, "prismatic-api")
    }
  end

  @impl true
  @spec call(Plug.Conn.t(), opts()) :: Plug.Conn.t()
  def call(conn, opts) do
    if conn.request_path in opts.excluded_paths do
      conn
    else
      case get_req_header(conn, "authorization") do
        [header] -> authenticate(conn, header, opts)
        _ -> unauthorized(conn, opts)
      end
    end
  end

  defp authenticate(conn, header, opts) do
    case String.split(header, " ", parts: 2) do
      [prefix, token] when prefix == opts.token_prefix ->
        case PrismaticAuth.verify_token(token) do
          {:ok, user} ->
            conn
            |> assign(:current_user, user)
            |> assign(:authenticated_at, DateTime.utc_now())

          {:error, :expired} ->
            unauthorized(conn, opts, "Token expired")

          {:error, _reason} ->
            unauthorized(conn, opts, "Invalid token")
        end

      _ ->
        unauthorized(conn, opts, "Malformed authorization header")
    end
  end

  defp unauthorized(conn, opts, message \\ "Authentication required") do
    conn
    |> put_resp_header("www-authenticate", "Bearer realm=\"#{opts.realm}\"")
    |> put_status(:unauthorized)
    |> Phoenix.Controller.json(%{error: message, status: 401})
    |> halt()
  end
end
```

The `halt/1` function is critical for security plugs. When a plug calls `halt/1`, it sets `conn.halted = true`, which signals Phoenix to stop executing subsequent plugs in the pipeline. This prevents unauthenticated requests from reaching controllers. Without `halt/1`, the response would be set but the pipeline would continue, potentially overwriting the 401 response with controller output.

## Pipeline Composition

Phoenix routers organize plugs into named pipelines that are applied to groups of routes. Pipelines compose -- a scope can `pipe_through` multiple pipelines, which are concatenated in order:

```elixir
defmodule PrismaticWeb.Router do
  @moduledoc """
  Router with composable plug pipelines for browser,
  API, and admin route groups.
  """

  use PrismaticWeb, :router

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
    plug PrismaticWeb.Plugs.RequestLogger
    plug PrismaticWeb.Plugs.CORSHeaders
  end

  pipeline :admin do
    plug PrismaticWeb.Plugs.RequireAdmin
    plug PrismaticWeb.Plugs.AuditLogger
  end

  pipeline :telemetry do
    plug PrismaticWeb.Plugs.TelemetryPlug
  end

  # Routes inherit ALL plugs from pipe_through
  scope "/", PrismaticWeb do
    pipe_through [:browser, :telemetry]
    live "/", DashboardLive
    live "/perimeter", PerimeterLive
    live "/osint/toolbox", OsintToolboxLive
  end

  scope "/admin", PrismaticWeb do
    pipe_through [:browser, :admin, :telemetry]  # browser + admin + telemetry
    live "/agents", AdminAgentsLive
    live "/quality", AdminQualityLive
  end

  scope "/api/v1", PrismaticAPI do
    pipe_through [:api, :telemetry]
    get "/health", HealthController, :check
    get "/endpoints", EndpointsController, :index
    post "/:app/:action", DispatchController, :dispatch
  end
end
```

This enables reusable middleware groups that can be mixed and matched for different route categories. The `:telemetry` pipeline can be added to any scope to enable request [metrics](@/glossary/metrics.md) emission, independent of authentication or content type concerns.

## Plug.Router for Standalone Applications

While most Elixir web applications use Phoenix, `Plug.Router` provides a lightweight alternative for simple HTTP services that do not need Phoenix's full feature set:

```elixir
defmodule PrismaticHealth.Router do
  @moduledoc """
  Lightweight health check router using Plug.Router.
  No Phoenix dependency - suitable for sidecar health endpoints.
  """

  use Plug.Router

  plug Plug.Logger
  plug Plug.Parsers, parsers: [:json], json_decoder: Jason
  plug :match
  plug :dispatch

  get "/health" do
    body = Jason.encode!(%{
      status: "healthy",
      timestamp: DateTime.utc_now(),
      version: Application.spec(:prismatic, :vsn) |> to_string()
    })

    send_resp(conn, 200, body)
  end

  get "/ready" do
    case check_readiness() do
      {:ok, details} ->
        send_resp(conn, 200, Jason.encode!(%{status: "ready", details: details}))

      {:error, reason} ->
        send_resp(conn, 503, Jason.encode!(%{status: "not_ready", reason: reason}))
    end
  end

  match _ do
    send_resp(conn, 404, Jason.encode!(%{error: "not found"}))
  end

  defp check_readiness do
    with {:ok, _} <- Ecto.Adapters.SQL.query(PrismaticStorage.Repo, "SELECT 1"),
         true <- Process.whereis(PrismaticAgents.Supervisor) != nil do
      {:ok, %{database: "connected", agents: "running"}}
    else
      _ -> {:error, "dependencies not ready"}
    end
  end
end
```

## Plug Adapters and HTTP Servers

Plug connects to HTTP servers through adapter modules. The adapter translates between the HTTP server's native connection representation and `Plug.Conn`:

| Adapter | HTTP Server | Concurrency | Use Case |
|---------|------------|-------------|----------|
| **Plug.Cowboy** | Cowboy 2.x | One Erlang process per connection | Production standard (Phoenix < 1.7) |
| **Bandit** | Bandit | One Erlang process per connection, HTTP/2 native | Modern alternative, pure Elixir (Phoenix >= 1.7) |
| **Plug.Test** | None (in-memory) | Synchronous | Testing without network I/O |

Phoenix 1.7+ defaults to Bandit, a pure-Elixir HTTP server with native HTTP/2 support and better performance characteristics. The adapter abstraction means that switching HTTP servers requires only changing the adapter configuration, with zero changes to plug pipelines or application code.

## Implementation in Prismatic Platform

The Prismatic Platform uses Plug extensively across its [Phoenix](@/glossary/phoenix.md) applications. Custom plugs enforce platform-specific concerns across both the web dashboard and API gateway:

| Plug | Application | Purpose | Type |
|------|-------------|---------|------|
| **APIAuth** | prismatic_api | Bearer token authentication for REST API | Module |
| **RateLimiter** | prismatic_api, prismatic_web | Token bucket [rate limiting](@/glossary/rate-limiting.md) per IP/user | Module |
| **RequestLogger** | prismatic_api | [Structured logging](@/glossary/structured-logging.md) with request metadata | Module |
| **RequireAdmin** | prismatic_web | [RBAC](@/glossary/rbac.md) authorization for admin routes | Module |
| **AuditLogger** | prismatic_web | Immutable audit trail for administrative actions | Module |
| **CORSHeaders** | prismatic_api | Cross-origin resource sharing headers | Module |
| **OpenAPIValidator** | prismatic_api | [OpenAPI](@/glossary/openapi.md) spec request/response validation | Module |
| **TelemetryPlug** | prismatic_web, prismatic_api | Request [metrics](@/glossary/metrics.md) emission via `:telemetry` | Module |
| **SetCurrentUser** | prismatic_web | Session-based user assignment for browser routes | Module |

The API gateway (`prismatic_api`) chains plugs for authentication, RBAC authorization, request validation, rate limiting, and OpenAPI spec enforcement. The web dashboard (`prismatic_web`) uses plug pipelines for session management, CSRF protection, [LiveView](@/glossary/liveview.md) setup, and telemetry instrumentation. This separation ensures that API and browser concerns never leak into each other while sharing common infrastructure like telemetry.

## Plug Security Patterns

Security-critical plugs follow specific patterns to prevent common vulnerabilities:

```elixir
defmodule PrismaticWeb.Plugs.RateLimiter do
  @moduledoc """
  Token bucket rate limiter implemented as a Plug.
  Uses ETS for O(1) lookup and atomic counter updates.
  """

  @behaviour Plug

  @impl true
  @spec init(keyword()) :: map()
  def init(opts) do
    table = :ets.new(:rate_limiter, [:set, :public, read_concurrency: true])

    %{
      table: table,
      max_requests: Keyword.get(opts, :max_requests, 100),
      window_ms: Keyword.get(opts, :window_ms, 60_000)
    }
  end

  @impl true
  @spec call(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def call(conn, opts) do
    key = rate_limit_key(conn)
    now = System.monotonic_time(:millisecond)

    case check_rate(opts.table, key, now, opts) do
      {:ok, remaining} ->
        conn
        |> Plug.Conn.put_resp_header("x-ratelimit-limit", to_string(opts.max_requests))
        |> Plug.Conn.put_resp_header("x-ratelimit-remaining", to_string(remaining))

      {:error, :rate_limited, retry_after} ->
        conn
        |> Plug.Conn.put_resp_header("retry-after", to_string(retry_after))
        |> Plug.Conn.put_status(429)
        |> Phoenix.Controller.json(%{error: "Rate limit exceeded"})
        |> Plug.Conn.halt()
    end
  end

  defp rate_limit_key(conn) do
    ip = conn.remote_ip |> :inet.ntoa() |> to_string()
    user_id = conn.assigns[:current_user] && conn.assigns.current_user.id

    user_id || ip
  end
end
```

## Testing Plugs

Plugs are straightforward to test because they are pure functions over the `Plug.Conn` struct. The `Plug.Test` module provides helper functions for constructing test connections without starting an HTTP server:

```elixir
defmodule PrismaticWeb.Plugs.APIAuthTest do
  @moduledoc """
  Tests for the APIAuth plug covering authentication,
  rejection, and path exclusion scenarios.
  """

  use ExUnit.Case, async: true
  use Plug.Test

  alias PrismaticWeb.Plugs.APIAuth

  @opts APIAuth.init([])

  describe "call/2" do
    test "authenticates valid Bearer token" do
      conn =
        conn(:get, "/api/v1/endpoints")
        |> put_req_header("authorization", "Bearer valid_token")
        |> APIAuth.call(@opts)

      refute conn.halted
      assert conn.assigns.current_user != nil
      assert %DateTime{} = conn.assigns.authenticated_at
    end

    test "rejects missing authorization header" do
      conn =
        conn(:get, "/api/v1/endpoints")
        |> APIAuth.call(@opts)

      assert conn.halted
      assert conn.status == 401
      assert {"www-authenticate", _} = List.keyfind(conn.resp_headers, "www-authenticate", 0)
    end

    test "rejects expired tokens with specific message" do
      conn =
        conn(:get, "/api/v1/endpoints")
        |> put_req_header("authorization", "Bearer expired_token")
        |> APIAuth.call(@opts)

      assert conn.halted
      assert conn.status == 401
      body = Jason.decode!(conn.resp_body)
      assert body["error"] =~ "expired"
    end

    test "skips excluded paths" do
      conn =
        conn(:get, "/api/v1/health")
        |> APIAuth.call(APIAuth.init(excluded_paths: ["/api/v1/health"]))

      refute conn.halted
    end

    test "handles malformed authorization header" do
      conn =
        conn(:get, "/api/v1/endpoints")
        |> put_req_header("authorization", "malformed")
        |> APIAuth.call(@opts)

      assert conn.halted
      assert conn.status == 401
    end
  end
end
```

The key testing insight is that `Plug.Test.conn/2` creates a `%Plug.Conn{}` struct in memory without any network I/O, enabling fast and isolated unit tests. Combined with `async: true`, plug tests run in parallel and complete in milliseconds.

## Plug vs. Middleware in Other Ecosystems

| Concept | Plug (Elixir) | Rack (Ruby) | WSGI (Python) | Ring (Clojure) | Express (Node.js) |
|---------|--------------|-------------|---------------|----------------|-------------------|
| **Abstraction** | Struct transform | Array response | Callable | Map transform | Mutation + next() |
| **Immutability** | Yes (new conn) | No | No | Yes (new map) | No (mutates req/res) |
| **Init/Call Split** | Yes (compile-time init) | No | No | No | No |
| **Halt Mechanism** | `halt/1` sets flag | Rack middleware decides | Middleware decides | Short-circuit return | Skip `next()` call |
| **Composition** | Pipeline macro | Rack::Builder | Middleware stack | Threading macro | `app.use()` chain |
| **Type Safety** | Plug.Conn struct | Array convention | Dict convention | Map convention | None |

Plug's compile-time `init/1` phase is unique among these frameworks and provides measurable performance benefits for plugs that require configuration parsing, regex compilation, or other initialization work.

## Related Terms

- [Phoenix](@/glossary/phoenix.md) - Web framework built entirely on Plug
- [Endpoint](@/glossary/endpoint.md) - Phoenix entry point implemented as a plug pipeline
- [OpenAPI](@/glossary/openapi.md) - API specification enforced through validation plugs
- [RBAC](@/glossary/rbac.md) - Access control implemented via authorization plugs
- [Rate Limiting](@/glossary/rate-limiting.md) - Throughput control via rate limiter plugs
- [LiveView](@/glossary/liveview.md) - Server-rendered UI routed through plug pipelines
- [REST API](@/glossary/rest-api.md) - API endpoints protected by plug chains
- [Structured Logging](@/glossary/structured-logging.md) - Request logging implemented as plugs
- [Metrics](@/glossary/metrics.md) - Telemetry emission from plug instrumentation
- [BEAM](@/glossary/beam.md) - VM executing plug pipelines as lightweight processes
- [API Gateway](@/glossary/api-gateway.md) - Gateway pattern implemented with plug pipelines
- [ETS](@/glossary/ets.md) - In-memory storage used by rate limiter and cache plugs

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture
- [Technologies](@/technologies/_index.md) - Technology stack
- [JWT](@/glossary/jwt.md) - Token format used in authentication plugs
- [TLS](@/glossary/tls.md) - Transport layer security for plug connections

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
