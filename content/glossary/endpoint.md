+++
title = "Endpoint"
weight = 15
[extra]
category = "architecture"
description = "Phoenix entry point that handles all incoming HTTP connections, configuring plugs, sockets, and serving static assets for the Prismatic Platform"
related_terms = ["phoenix", "plug", "liveview", "channel", "websocket", "pubsub", "rest-api", "tls", "rate-limiting", "supervisor", "beam", "otp", "genserver"]
keywords = ["Phoenix endpoint configuration", "HTTP request pipeline", "Plug middleware chain", "WebSocket connection management", "LiveView socket setup", "multi-endpoint architecture", "Phoenix static file serving", "endpoint supervision tree", "Elixir web server", "Bandit HTTP server"]
tags = ["endpoint", "phoenix", "http", "websocket", "architecture"]
platform_integration = "core"
related_app = "prismatic_web"
complexity = "intermediate"
audience = ["web-developers", "platform-architects", "devops-engineers"]
date_created = "2026-02-22"
version = "2.0.0"
requires_knowledge = ["phoenix", "plug", "otp"]
prismatic_components = ["PrismaticWeb.Endpoint", "PrismaticApi.Endpoint", "PrismaticWeb.Router"]
ports = ["4000 (web dashboard)", "4004 (REST API)"]
http_servers = ["Bandit", "Cowboy"]
plug_pipeline_stages = 9
enforcement_level = "P0"
performance_budget_ms = 250
socket_types = ["LiveView", "Channel", "LiveReload"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1695
date_modified = "2026-02-23"
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Endpoint - Prismatic Platform"
+++

## Definition and Overview

A Phoenix Endpoint is the boundary module through which all HTTP requests enter a [Phoenix](/glossary/phoenix/) application. Defined using the `Phoenix.Endpoint` behaviour, it acts as the outermost [Plug](/glossary/plug/) pipeline -- a sequence of composable middleware transformations applied to every request before it reaches the router. The endpoint is responsible for foundational concerns that apply universally: starting the HTTP server (Cowboy or Bandit), serving static files, parsing request bodies, managing sessions, configuring [WebSocket](/glossary/websocket/) and [LiveView](/glossary/liveview/) socket paths, enabling code reloading in development, and initializing the [PubSub](/glossary/pubsub/) system for real-time broadcasting.

Each Phoenix application has exactly one endpoint module, which is started as a child of the application's [supervision tree](/glossary/supervision-tree/). The endpoint supervises the HTTP listener, the PubSub adapter, and any socket handlers. This means that if the HTTP server crashes, the supervisor restarts it automatically without affecting the rest of the application -- a direct benefit of [OTP](/glossary/otp/) process isolation.

The endpoint sits between the web server and the router in Phoenix's request processing pipeline. Its plug chain executes in order for every request, making it the correct place for cross-cutting concerns like request logging, CORS headers, security headers, and [rate limiting](/glossary/rate-limiting/). The router, by contrast, handles path-specific dispatching to controllers and LiveView modules.

In the context of the Prismatic Platform, the endpoint is a critical architectural component because the platform operates multiple endpoints across its umbrella structure, each serving distinct concerns with independent security policies, authentication mechanisms, and performance budgets.

## Historical Context

Phoenix's endpoint design evolved from the Plug specification that Jose Valim and the Phoenix core team developed as a foundational abstraction for HTTP in Elixir. Before Phoenix, the Erlang ecosystem relied primarily on Cowboy for HTTP serving, with each application implementing its own middleware chain. The Plug specification standardized the concept of composable HTTP middleware, and Phoenix's Endpoint became the top-level orchestrator of plug pipelines.

Early Phoenix versions (pre-1.0) used a simpler endpoint configuration that conflated request processing with application startup. Phoenix 1.0 separated these concerns, establishing the endpoint as a supervised process with its own lifecycle. Phoenix 1.3 introduced the context-based architecture that further clarified the endpoint's role as a pure HTTP boundary, with business logic delegated to context modules. Phoenix 1.7's introduction of verified routes and the shift to function components reinforced the endpoint's position as an infrastructure-only concern.

The Prismatic Platform adopted the multi-endpoint pattern early in its architecture, recognizing that serving a [LiveView](/glossary/liveview/) dashboard and a [REST API](/glossary/rest-api/) gateway through the same endpoint creates security and performance coupling that violates the platform's isolation requirements.

## Implementation in Prismatic Platform

The Prismatic Platform operates multiple Phoenix endpoints across its umbrella architecture, each serving a distinct concern. `PrismaticWeb.Endpoint` (port 4000) serves the LiveView dashboard with real-time security monitoring, agent status feeds, the Perimeter [EASM](/glossary/easm/) interface, and [Quality Floor Guardian](/glossary/quality-floor-guardian/) views. `PrismaticApi.Endpoint` (port 4004) handles the auto-introspecting REST API with OpenAPI spec generation and SwaggerUI. Each endpoint configures its own plug pipeline, socket connections, static asset paths, and PubSub adapter independently, while sharing the same [BEAM](/glossary/beam/) node and supervision infrastructure.

The multi-endpoint architecture allows the platform to apply different security policies, rate limits, and authentication mechanisms to the web dashboard and API gateway without cross-contamination. API requests pass through `APIAuth` plugs with JWT token validation, while dashboard requests use session-based authentication with CSRF protection.

```elixir
defmodule PrismaticWeb.Endpoint do
  @moduledoc """
  Primary endpoint for the Prismatic Platform web dashboard.
  Serves LiveView pages, static assets, and WebSocket connections
  on port 4000. All requests pass through the plug pipeline
  before reaching PrismaticWeb.Router.
  """

  use Phoenix.Endpoint, otp_app: :prismatic_web

  # LiveView socket configuration with session-based auth
  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]],
    longpoll: false

  # Static file serving with aggressive caching for fingerprinted assets
  plug Plug.Static,
    at: "/",
    from: :prismatic_web,
    gzip: true,
    only: ~w(assets fonts images favicon.ico robots.txt)

  # Development-only code reloading
  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
  end

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug PrismaticWeb.Router
end
```

## Plug Pipeline Architecture

The endpoint's plug pipeline processes every incoming request through a deterministic sequence of transformations. The order matters -- each plug can modify the connection, halt processing, or pass it to the next plug. The pipeline is designed to execute the cheapest, most-likely-to-short-circuit operations first:

| Pipeline Stage | Plug | Purpose | Avg Latency |
|---------------|------|---------|-------------|
| **1. Code Reloader** | `Plug.CodeReloader` | Recompiles changed modules (dev only) | 0ms (prod) |
| **2. Request ID** | `Plug.RequestId` | Assigns unique ID for [distributed tracing](/glossary/distributed-tracing/) | <0.1ms |
| **3. Telemetry** | `Plug.Telemetry` | Emits request metrics for [observability](/glossary/observability/) | <0.1ms |
| **4. Static Files** | `Plug.Static` | Serves CSS, JS, images from `priv/static` | <1ms |
| **5. Body Parser** | `Plug.Parsers` | Parses JSON, URL-encoded, and multipart bodies | 1-5ms |
| **6. Method Override** | `Plug.MethodOverride` | Supports PUT/PATCH/DELETE via POST form data | <0.1ms |
| **7. Head** | `Plug.Head` | Converts HEAD requests to GET (discards body) | <0.1ms |
| **8. Session** | `Plug.Session` | Manages encrypted cookie-based sessions | <1ms |
| **9. Router** | `AppWeb.Router` | Dispatches to controllers, LiveView, or channels | Variable |

The total plug pipeline overhead is typically under 5ms for non-static requests, well within the platform's 250ms page load performance budget. Static file requests are served directly by `Plug.Static` without reaching later pipeline stages, providing sub-millisecond response times for cached assets.

## Socket Configuration

The endpoint is the sole location where WebSocket and LiveView socket paths are declared. Socket configuration determines how real-time connections are established, authenticated, and supervised:

```elixir
# LiveView socket -- server-rendered real-time UI
socket "/live", Phoenix.LiveView.Socket,
  websocket: [
    connect_info: [session: @session_options],
    timeout: 45_000,
    compress: true
  ]

# Custom channel socket -- bidirectional event communication
socket "/agent_socket", PrismaticWeb.AgentSocket,
  websocket: [
    connect_info: [:peer_data, :x_headers],
    timeout: 60_000
  ],
  longpoll: [timeout: 60_000]
```

Each socket declaration creates a supervised process tree for managing connections. The `websocket` and `longpoll` options configure transport-specific parameters. The `connect_info` option controls what connection metadata (session data, peer IP, headers) is available during the socket's `connect/3` callback for authentication decisions.

| Socket Type | Transport | Use Case in Prismatic | Max Connections |
|------------|-----------|----------------------|----------------|
| **LiveView Socket** | WebSocket | Dashboard real-time updates, EASM monitoring | Per-node limit |
| **Channel Socket** | WebSocket + LongPoll | Agent status feeds, inter-component events | Per-node limit |
| **LiveReload Socket** | WebSocket | Development-only hot reload (disabled in prod) | Dev only |

The WebSocket transport is preferred for its lower overhead and bidirectional capability. LongPoll serves as a fallback for environments where WebSocket connections are blocked by proxies or firewalls. The platform's production deployment on [Fly.io](/glossary/fly-io/) supports native WebSocket connections through its edge proxy.

## Static File Serving

The endpoint's `Plug.Static` configuration serves compiled frontend assets directly from the application's `priv/static` directory without routing through the application layer. This provides efficient static file delivery with proper cache headers:

| Option | Value | Effect |
|--------|-------|--------|
| `at` | `"/"` | URL prefix for static files |
| `from` | `:prismatic_web` | OTP app whose `priv/static` to serve |
| `gzip` | `true` | Serve `.gz` variants when client accepts |
| `only` | `~w(assets fonts images ...)` | Whitelist of directories/files to serve |
| `cache_control_for_etags` | `"public, max-age=31536000"` | Long-term caching for fingerprinted assets |

In production, static files are typically served by a CDN or reverse proxy (Fly.io's edge network for Prismatic), but the endpoint's `Plug.Static` serves as a reliable fallback and is the primary mechanism during development. The [TailwindCSS](/glossary/tailwindcss/) and JavaScript bundles are fingerprinted during the build process, enabling aggressive cache headers (1-year max-age) without stale content risks.

## Configuration and Runtime Settings

Endpoint configuration combines compile-time and runtime settings, supporting different behaviors across environments:

```elixir
# config/config.exs -- compile-time defaults
config :prismatic_web, PrismaticWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    formats: [html: PrismaticWeb.ErrorHTML, json: PrismaticWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: PrismaticWeb.PubSub,
  live_view: [signing_salt: "secret_salt"]

# config/runtime.exs -- runtime configuration from environment
config :prismatic_web, PrismaticWeb.Endpoint,
  url: [host: System.get_env("PHX_HOST", "localhost"), port: 443, scheme: "https"],
  http: [
    ip: {0, 0, 0, 0, 0, 0, 0, 0},
    port: String.to_integer(System.get_env("PORT", "4000"))
  ],
  secret_key_base: System.fetch_env!("SECRET_KEY_BASE")
```

Key configuration categories:

| Category | Settings | Purpose |
|----------|----------|---------|
| **HTTP** | `ip`, `port`, `transport_options` | Listener binding and connection limits |
| **URL** | `host`, `port`, `scheme` | URL generation for links and redirects |
| **PubSub** | `pubsub_server` | [PubSub](/glossary/pubsub/) adapter for broadcasting |
| **Secret** | `secret_key_base`, `signing_salt` | Session encryption and LiveView token signing |
| **Render** | `render_errors`, `layout` | Error page rendering configuration |
| **HTTP Server** | `adapter` | Bandit (default) or Cowboy selection |

## Supervision and Process Architecture

The endpoint starts as a supervised child process, managing its own supervision subtree:

```
Application Supervisor
  |-- PrismaticWeb.Endpoint (Supervisor)
  |     |-- Bandit (HTTP Server)
  |     |-- Phoenix.PubSub (Broadcasting)
  |     |-- Phoenix.LiveView.Socket.Pool (LiveView connections)
  |     |-- PrismaticWeb.AgentSocket.Pool (Channel connections)
  |-- PrismaticApi.Endpoint (Supervisor)
        |-- Bandit (HTTP Server, port 4004)
        |-- Phoenix.PubSub (API-specific broadcasting)
```

This architecture means the endpoint benefits from OTP's [fault tolerance](/glossary/fault-tolerance/) guarantees. If the HTTP server crashes, the endpoint supervisor restarts it. If a single WebSocket connection process crashes, it affects only that client. The endpoint itself remains available throughout, and the supervision tree ensures automatic recovery without manual intervention.

The endpoint's supervision strategy is `:one_for_one`, meaning each child process is restarted independently. This is correct because the HTTP server, PubSub system, and socket pools are operationally independent -- a PubSub crash does not require restarting the HTTP server, and vice versa.

## Multi-Endpoint Patterns

Umbrella applications like Prismatic can run multiple endpoints on different ports, each with independent configuration:

| Endpoint | Port | Purpose | Authentication | Performance Budget |
|----------|------|---------|---------------|-------------------|
| `PrismaticWeb.Endpoint` | 4000 | LiveView dashboard, EASM UI | Session + CSRF | 250ms page load |
| `PrismaticApi.Endpoint` | 4004 | REST API, SwaggerUI | JWT + RBAC | 100ms response |
| `Phoenix.LiveDashboard` | 4000 | System observability (dev/admin) | Admin session | N/A |

This separation ensures that API traffic (high volume, stateless) does not contend with dashboard traffic (lower volume, stateful WebSocket connections) for resources or configuration. Each endpoint can be independently scaled, monitored, and updated.

## Health Check Endpoint Pattern

The platform implements health check endpoints as early-terminating plugs to minimize latency:

```elixir
defmodule PrismaticWeb.Plugs.HealthCheck do
  @moduledoc """
  Fast health check plug that terminates before the full pipeline.
  Returns 200 OK in under 10ms for load balancer probes.
  Must be placed before expensive plugs in the pipeline.
  """

  import Plug.Conn

  @spec init(keyword()) :: keyword()
  def init(opts), do: opts

  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(%Plug.Conn{request_path: "/health"} = conn, _opts) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{status: "ok", node: node()}))
    |> halt()
  end

  def call(conn, _opts), do: conn
end
```

## Best Practices

**Configure Separate Endpoints for Different Concerns**: Use independent endpoints for web dashboards and API gateways, each with their own plug pipelines, authentication mechanisms, and rate limits. This prevents cross-contamination of security policies and enables independent scaling.

**Enable Gzip Compression for Static Assets**: Configure `Plug.Static` with `gzip: true` and pre-compress assets during build to reduce bandwidth and improve page load times without runtime CPU overhead.

**Use Runtime Configuration for Secrets**: Never hardcode `secret_key_base` or signing salts in compile-time config. Use `config/runtime.exs` with `System.fetch_env!/1` to inject secrets from the deployment environment.

**Order Plugs by Execution Cost**: Place fast, short-circuiting plugs (like health check paths) early in the pipeline, and expensive plugs (like body parsing) later, to minimize wasted work on rejected requests.

**Monitor Endpoint Telemetry**: Subscribe to `[:phoenix, :endpoint, :start]` and `[:phoenix, :endpoint, :stop]` telemetry events to track request latency, throughput, and error rates in real time.

**Set Connection Limits**: Configure `transport_options` to limit maximum concurrent connections, preventing resource exhaustion under load spikes. The platform's production configuration sets limits appropriate for Fly.io's machine sizes.

## Common Pitfalls

- **Placing expensive plugs before short-circuit checks**: Body parsing before health checks wastes CPU on every load balancer probe. Order plugs by likelihood of early termination.

- **Sharing secrets across endpoints**: Each endpoint should use its own `secret_key_base` and signing salts. Shared secrets mean a compromise of one endpoint compromises all.

- **Not configuring WebSocket timeouts**: Default WebSocket timeouts may be too aggressive for slow clients or too permissive for resource management. Tune based on observed connection patterns.

- **Serving large files through Plug.Static**: The endpoint is not designed for serving large file downloads. Use external storage or a CDN for files exceeding a few megabytes.

## Use Cases

- **Web Dashboard Serving**: Hosting the Prismatic LiveView dashboard with session-based authentication, CSRF protection, and real-time WebSocket connections for the Perimeter EASM interface
- **REST API Gateway**: Serving the auto-introspecting REST API with JWT authentication, request validation against OpenAPI schemas, and Swagger UI documentation
- **Development Hot Reload**: Configuring development-only code reloading and live reload sockets for sub-second feedback during development
- **Multi-Tenant Isolation**: Running multiple endpoints on separate ports with independent security configurations for different user populations

## Related Concepts

- [Phoenix](/glossary/phoenix/) -- Framework defining the Endpoint behaviour
- [Plug](/glossary/plug/) -- Composable middleware modules in the endpoint pipeline
- [LiveView](/glossary/liveview/) -- Real-time UI connected through endpoint socket configuration
- [Channel](/glossary/channel/) -- Bidirectional communication configured at the endpoint
- [WebSocket](/glossary/websocket/) -- Transport protocol for real-time endpoint connections
- [PubSub](/glossary/pubsub/) -- Broadcasting system initialized by the endpoint
- [Supervision Tree](/glossary/supervision-tree/) -- OTP process tree managing endpoint lifecycle
- [REST API](/glossary/rest-api/) -- Stateless API served through dedicated endpoint
- [Rate Limiting](/glossary/rate-limiting/) -- Traffic control applied in endpoint plug pipeline
- [Observability](/glossary/observability/) -- Telemetry and metrics emitted by endpoint plugs

## See Also

- [Architecture](/architecture/) -- Platform architecture and multi-endpoint design
- [Technologies](/technologies/) -- Technology stack details
- [Applications](/apps/) -- Umbrella apps with independent endpoints

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
