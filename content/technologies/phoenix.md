+++
title = "Phoenix Framework"
weight = 10
[extra]
category = "web-framework"
description = "High-performance web framework for Elixir with real-time capabilities and productive developer experience"
url = "https://www.phoenixframework.org"
version = "1.7+"
icon = "phoenix"
color = "orange"
status = "active"
reading_time = "9 min"
keywords = ["Phoenix Framework Elixir", "LiveView real-time UI", "Phoenix channels WebSocket", "compiled route dispatch", "Bandit HTTP server", "HEEx template engine", "Phoenix PubSub system", "server-rendered web framework"]
tags = ["phoenix", "web-framework", "liveview", "elixir"]
author = "Tomas Korcak (korczis)"
word_count = 1179
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Phoenix Framework - Prismatic Platform"
+++

## Overview

Phoenix is the web framework powering the Prismatic Platform's HTTP interfaces, real-time dashboards, and API endpoints. Built on [Elixir](@/technologies/elixir.md) and the [BEAM](@/technologies/beam.md), Phoenix achieves microsecond response times while handling thousands of concurrent connections -- performance characteristics that are essential for the platform's real-time intelligence processing and monitoring dashboards. Phoenix serves as the foundational web layer for the entire platform, routing HTTP requests, managing WebSocket connections, and rendering the HTML that users interact with.

Phoenix's channel system and [LiveView](@/technologies/phoenix-liveview.md) enable the platform to push real-time updates to connected clients without the complexity of client-side JavaScript frameworks. The Prismatic Platform's security monitoring dashboards, agent status displays, and OSINT data feeds all leverage Phoenix's real-time capabilities to deliver instant updates. The framework's Bandit HTTP adapter provides a pure-Elixir HTTP server that runs entirely on the BEAM, eliminating external dependencies like Cowboy's NIF-based components and simplifying deployment.

The framework's emphasis on convention over configuration, combined with its powerful routing, controller, and template systems, enables rapid development of new platform features while maintaining clean separation of concerns across the 90-application umbrella structure. Phoenix's router compiles route patterns into efficient pattern-matching clauses at compile time, yielding sub-microsecond dispatch times regardless of the number of defined routes.

## Key Features

- **Compiled Routing**: Route dispatch compiles to pattern matching for sub-microsecond request routing with zero runtime overhead
- **Channels**: [WebSocket](@/technologies/websockets.md)-based real-time communication with presence tracking, topic-based routing, and automatic reconnection
- **LiveView**: Server-rendered real-time UI that eliminates the need for JavaScript frontend frameworks (see [dedicated page](@/technologies/phoenix-liveview.md))
- **PubSub**: Distributed publish-subscribe system for cross-node messaging with pluggable adapters
- **Telemetry**: Built-in instrumentation for monitoring, metrics collection, and performance tracing through the Telemetry library
- **Code Generation**: Mix tasks for scaffolding controllers, contexts, schemas, and LiveView modules with consistent project structure
- **Bandit Adapter**: Pure-Elixir HTTP/1.1 and HTTP/2 server with WebSocket support, replacing Cowboy as the default adapter
- **HEEx Templates**: HTML-aware template engine with compile-time validation, component slots, and dead code detection

## Platform Integration

Phoenix serves as the HTTP layer for multiple Prismatic applications, with the main web interface on port 4000 and the API gateway on port 4004. The router demonstrates the platform's multi-pipeline architecture.

```elixir
defmodule PrismaticWeb.Router do
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
    plug PrismaticWeb.Plugs.RateLimiter
  end

  scope "/", PrismaticWeb do
    pipe_through :browser

    live "/", HomeLive.Index, :index
    live "/perimeter", PerimeterLive.Index, :index
    live "/perimeter/assets", PerimeterLive.Assets, :index
    live "/perimeter/compliance", PerimeterLive.Compliance, :index
    live "/agents", AgentsLive.Index, :index
    live "/agents/:id", AgentsLive.Show, :show
  end

  scope "/api/v1", PrismaticApi do
    pipe_through :api

    get "/health", HealthController, :index
    get "/endpoints", EndpointController, :index
    resources "/assets", AssetController, only: [:index, :show]
  end
end
```

The Phoenix endpoint configures the full HTTP stack including static file serving, session management, and WebSocket transport:

```elixir
defmodule PrismaticWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :prismatic_web

  @session_options [
    store: :cookie,
    key: "_prismatic_key",
    signing_salt: "signing_salt",
    same_site: "Lax"
  ]

  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [:peer_data, :uri, :x_headers]]

  plug Plug.Static,
    at: "/",
    from: :prismatic_web,
    gzip: true,
    only: PrismaticWeb.static_paths()

  plug Plug.Session, @session_options
  plug PrismaticWeb.Router
end
```

## Architecture

Phoenix occupies the HTTP/presentation layer of the platform's architecture, interfacing between external clients and the internal business logic implemented across the umbrella applications.

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| **HTTP Server** | Bandit | TCP connection management, HTTP parsing, WebSocket upgrade |
| **Endpoint** | `PrismaticWeb.Endpoint` | Static files, sessions, request logging, error handling |
| **Router** | `PrismaticWeb.Router` | URL pattern matching, pipeline selection, scope management |
| **Pipelines** | [Plug](@/technologies/plug.md) chains | Authentication, content negotiation, CSRF protection |
| **Controllers** | Request handlers | Parameter extraction, context calls, response rendering |
| **LiveView** | [Phoenix LiveView](@/technologies/phoenix-liveview.md) | Real-time server-rendered interactive UI |
| **Channels** | WebSocket handlers | Topic-based real-time messaging with presence |
| **Templates** | HEEx | Compile-time validated HTML templates with components |

The platform runs two separate Phoenix applications: `prismatic_web` (port 4000) for the browser-facing interface and `prismatic_api` (port 4004) for the REST API gateway. Both share the same umbrella dependencies but have independent endpoints, routers, and pipelines.

## Context-Based Domain Organization

The platform follows Phoenix's context pattern for organizing business logic. Contexts serve as the public API boundary between the web layer and domain logic, ensuring that controllers and LiveViews never directly access database schemas or repositories. Each context module encapsulates a bounded domain with a well-defined interface.

```elixir
defmodule PrismaticPerimeter do
  @moduledoc "Public API for External Attack Surface Management"

  defdelegate list_assets(opts \\ []), to: PrismaticPerimeter.Assets
  defdelegate discover(domain), to: PrismaticPerimeter.Discovery
  defdelegate security_rating(domain), to: PrismaticPerimeter.Rating
  defdelegate assess_compliance(domain, frameworks), to: PrismaticPerimeter.Compliance
end
```

This pattern means that web-layer code never imports [Ecto](@/technologies/ecto.md) or constructs queries directly. The context boundary ensures testability, enables internal refactoring without breaking the web interface, and provides clear documentation of the platform's public API surface.

## Telemetry and Observability

Phoenix's built-in Telemetry integration provides comprehensive observability across the platform's request lifecycle. The platform attaches custom telemetry handlers that track request duration, response status, error rates, and LiveView mount times -- feeding these metrics into the monitoring infrastructure for real-time performance dashboards and alerting.

```elixir
defmodule PrismaticWeb.Telemetry do
  def attach_handlers do
    :telemetry.attach_many("prismatic-web", [
      [:phoenix, :endpoint, :stop],
      [:phoenix, :router_dispatch, :stop],
      [:phoenix, :live_view, :mount, :stop],
      [:phoenix, :live_view, :handle_event, :stop]
    ], &handle_event/4, nil)
  end

  defp handle_event([:phoenix, :endpoint, :stop], %{duration: duration}, metadata, _config) do
    PrismaticMetrics.record(:http_request_duration, duration,
      path: metadata.conn.request_path,
      status: metadata.conn.status
    )
  end
end
```

## Hot Code Upgrades and Deployment

A critical advantage of Phoenix for the Prismatic Platform is its support for hot code upgrades and graceful rolling deployments. Because the BEAM can run multiple versions of a module simultaneously, new code can be deployed without dropping active WebSocket connections or interrupting long-running LiveView sessions. This is essential for a security monitoring platform where analysts may have dashboards open for hours during incident investigation -- a deployment should never interrupt their workflow.

Phoenix's compile-time route verification and HEEx template validation catch routing errors and template syntax issues before they reach production, providing an additional safety net that complements the platform's strict quality gate enforcement.

## Performance Characteristics

Phoenix's performance is a direct consequence of the BEAM's process model and Elixir's compile-time optimizations. The framework adds minimal overhead on top of the raw HTTP server.

| Metric | Value | Context |
|--------|-------|---------|
| Route dispatch | <1us | Compiled pattern matching |
| Simple JSON response | ~100us | Controller + JSON encoding |
| LiveView initial render | 50-150ms | Full page with data loading |
| WebSocket message | <1ms | Server-to-client push |
| Concurrent connections | 50,000+ | Per node, limited by RAM |
| Static file serving | <50us | Plug.Static with gzip |
| Throughput | 100,000+ req/s | Simple endpoints, production hardware |
| Memory per connection | ~2KB | HTTP; ~50KB for LiveView |

## Configuration

```elixir
# config/config.exs
config :prismatic_web, PrismaticWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [html: PrismaticWeb.ErrorHTML, json: PrismaticWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: PrismaticWeb.PubSub,
  live_view: [signing_salt: "secret_salt"]

# config/prod.exs
config :prismatic_web, PrismaticWeb.Endpoint,
  url: [host: "prismatic-prod.fly.dev", port: 443, scheme: "https"],
  http: [port: {:system, "PORT"}],
  server: true,
  check_origin: [
    "https://prismatic-prod.fly.dev",
    "https://prismatic-reality.com"
  ]

# config/runtime.exs
config :prismatic_web, PrismaticWeb.Endpoint,
  secret_key_base: System.fetch_env!("SECRET_KEY_BASE")
```

## Best Practices

- **Use pipelines for cross-cutting concerns** -- authentication, rate limiting, and content negotiation belong in plug pipelines, not in individual controllers
- **Separate contexts from controllers** -- controllers should call context modules (business logic) rather than accessing [Ecto](@/technologies/ecto.md) repositories directly
- **Prefer LiveView over traditional controllers** -- for any page that benefits from real-time updates, LiveView eliminates the need for polling and manual AJAX
- **Configure `check_origin` in production** -- prevent WebSocket hijacking by whitelisting allowed origins
- **Use Bandit over Cowboy** -- Bandit is a pure-Elixir HTTP server with better error messages, simpler configuration, and no NIF dependencies
- **Instrument with Telemetry** -- attach telemetry handlers for request timing, error tracking, and performance monitoring rather than adding custom logging
- **Keep endpoint configuration minimal** -- move application-specific plugs to the router pipelines; the endpoint should only handle transport-level concerns

## Comparison with Alternatives

| Feature | Phoenix | Rails | Django | Express/Fastify | ASP.NET |
|---------|---------|-------|--------|----------------|---------|
| Language | Elixir | Ruby | Python | JavaScript | C# |
| Concurrency | BEAM processes | Threads/Puma | Async/WSGI | Event loop | Async/threads |
| Real-time | Native (LiveView/Channels) | Action Cable | Channels (Django) | Socket.io | SignalR |
| Performance | 100K+ req/s | ~15K req/s | ~20K req/s | ~50K req/s | ~80K req/s |
| Fault tolerance | Supervision trees | Process monitoring | None built-in | None built-in | None built-in |
| Hot code reload | Native BEAM support | Requires restart | Requires restart | Requires restart | Requires restart |
| Deployment | Single release binary | Bundle + runtime | Bundle + runtime | Bundle + runtime | Container/binary |

Phoenix's combination of raw performance, native real-time support, and the BEAM's fault tolerance model makes it the ideal framework for the Prismatic Platform's requirements: high-concurrency security monitoring with zero-downtime deployment.

## Related Technologies

- [Phoenix LiveView](@/technologies/phoenix-liveview.md) - Real-time server-rendered UI framework
- [Plug](@/technologies/plug.md) - Middleware specification underlying all request processing
- [Ecto](@/technologies/ecto.md) - Database wrapper and query interface for data persistence
- [WebSockets](@/technologies/websockets.md) - Real-time communication protocol for channels and LiveView
- [Phoenix PubSub](@/technologies/pubsub.md) - Distributed messaging for cross-node event delivery
- [Elixir](@/technologies/elixir.md) - The programming language Phoenix is built with
- [BEAM VM](@/technologies/beam.md) - The virtual machine providing Phoenix's concurrency model
- [TailwindCSS](@/technologies/tailwindcss.md) - CSS framework used in all Phoenix templates

## Related Apps

- [prismatic_web](@/apps/prismatic-web.md) - Main web interface (port 4000) with all LiveView dashboards
- [prismatic_api](@/apps/prismatic-api.md) - REST API gateway (port 4004) with auto-introspecting OpenAPI
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - EASM module with Phoenix-powered dashboards

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)