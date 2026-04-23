+++
title = "Phoenix"
weight = 23
[extra]
category = "framework"
description = "Elixir web framework built on OTP providing real-time capabilities through channels and LiveView, with fault-tolerant request handling via BEAM processes"
related_terms = ["otp", "beam", "liveview", "flowbite", "endpoint", "graphql", "channel", "elixir", "plug", "pubsub", "ecto", "tailwindcss"]
difficulty = "intermediate"
importance = "critical"
platform_relevance = "core"
date_created = "2025-04-10"
date_updated = "2026-02-22"
version = "2.0.0"
audience = ["web-developers", "backend-engineers", "fullstack-engineers", "platform-architects"]
prerequisites = ["elixir", "otp", "beam"]
domain = "web-frameworks"
related_patterns = ["plug-pipeline", "router-dispatch", "pubsub-broadcast", "channel-multiplexing", "live-navigation", "component-composition"]
see_also = ["architecture", "technologies", "apps"]
acronyms = ["HTTP", "WSS", "PubSub", "CRDT", "HEEx", "DSL", "SSR"]
standards = ["HTTP-1.1", "HTTP-2", "WebSocket-RFC-6455", "OpenAPI-3.0"]
tools = ["mix", "phoenix_live_reload", "esbuild", "tailwind", "openapispex"]
platforms = ["beam", "fly-io", "docker", "postgresql"]
keywords = ["Phoenix web framework", "Elixir Phoenix LiveView", "real-time web applications", "Phoenix channels WebSocket", "fault-tolerant web framework", "Phoenix request lifecycle", "server-rendered reactivity", "Phoenix framework architecture"]
tags = ["phoenix", "web-framework", "elixir", "liveview", "real-time"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1587
date_modified = "2026-02-23"
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "Phoenix - Prismatic Platform"
+++

## Definition

Phoenix is a productive, fault-tolerant web framework written in [Elixir](@/glossary/elixir.md) that leverages [OTP](@/glossary/otp.md) and the [BEAM](@/glossary/beam.md) virtual machine for building scalable, real-time web applications. Created by Chris McCord in 2014, Phoenix combines the developer productivity of frameworks like Ruby on Rails with the performance and reliability characteristics of Erlang/OTP systems. It has since become the dominant web framework in the Elixir ecosystem, powering applications ranging from real-time collaboration tools to financial trading platforms, and serving as the foundational web layer for the Prismatic Platform's 115 umbrella applications.

Phoenix's architecture processes each HTTP request in an isolated BEAM process, meaning a slow or crashing request cannot affect other connections. This is a fundamental departure from thread-pooled frameworks (Rails, Django, Express) where a single hung request can exhaust the pool and bring down the entire application. With Phoenix, tens of thousands of simultaneous connections are routine, and millions are achievable on a single node -- a property inherited directly from BEAM's lightweight process model that creates processes in microseconds with approximately 2KB of initial memory.

The framework's most significant innovation is [LiveView](@/glossary/phoenix-liveview.md), which enables rich, interactive user interfaces rendered entirely on the server without custom JavaScript. Combined with Phoenix's channel system for real-time bidirectional communication through [WebSockets](@/glossary/websocket.md), Phoenix provides a complete stack for building modern web applications where real-time updates are first-class citizens rather than bolted-on afterthoughts. The Prismatic Platform uses both Phoenix applications -- `prismatic_web` on port 4000 for LiveView dashboards and `prismatic_api` on port 4004 for the auto-introspecting REST gateway.

## Historical Context and Evolution

Phoenix emerged from Chris McCord's experience with Ruby on Rails, where he recognized that Rails' productivity model could be combined with Erlang's concurrency model through Elixir. The first public release (0.1) appeared in 2014, and Phoenix 1.0 shipped in August 2015 with a stable API that established the core abstractions -- Endpoint, Router, Controller, Channel, and PubSub -- that persist to this day.

The introduction of LiveView in late 2018 marked a paradigm shift. Prior to LiveView, Phoenix followed the traditional request-response model for HTML pages and used Channels for real-time features. LiveView unified both patterns: server-rendered HTML with WebSocket-driven interactivity, eliminating the need for separate JavaScript frameworks for interactive UIs. This innovation influenced the broader web development industry, inspiring similar approaches in other ecosystems such as Laravel Livewire (PHP), Hotwire (Rails), and Blazor Server (.NET).

Phoenix 1.7 (released 2023) introduced significant architectural changes: verified routes replacing path helpers, unified function components replacing view modules, and built-in support for [TailwindCSS](@/glossary/tailwindcss.md) in the project generator. These changes streamlined the developer experience and aligned Phoenix more closely with the component-based architecture that LiveView had popularized.

## Architecture Overview

Phoenix follows a layered architecture where each layer has a clearly defined responsibility. Understanding this architecture is essential for building and maintaining Phoenix applications at scale.

### Request Lifecycle

Every HTTP request in Phoenix flows through a well-defined pipeline:

```
Client Request
    |
    v
Endpoint (Phoenix.Endpoint)
    |-- Static file serving
    |-- Session management
    |-- Request parsing
    |
    v
Router (Phoenix.Router)
    |-- Route matching
    |-- Pipeline selection (plug chains)
    |
    v
Controller / LiveView
    |-- Business logic
    |-- View rendering
    |
    v
Response (HTML, JSON, WebSocket upgrade)
```

Each layer is implemented as a chain of [Plugs](@/glossary/plug.md) -- composable functions that receive a connection struct, transform it, and pass it forward. This design makes the request lifecycle completely transparent and easily extensible. The Prismatic Platform adds custom plugs for API authentication, rate limiting, request tracing, and [telemetry](@/glossary/telemetry.md) instrumentation at each stage.

### Core Components

| Component | Module | Responsibility |
|-----------|--------|---------------|
| **Endpoint** | `Phoenix.Endpoint` | HTTP server configuration, shared plugs, socket declarations |
| **Router** | `Phoenix.Router` | URL pattern matching, pipeline selection, scope grouping |
| **Controller** | `Phoenix.Controller` | Request handling, response rendering, action dispatch |
| **View / Component** | `Phoenix.Component` | Template rendering, HEEx compilation, component composition |
| **Channel** | `Phoenix.Channel` | WebSocket topic handlers, real-time bidirectional messaging |
| **Socket** | `Phoenix.Socket` | WebSocket connection lifecycle, authentication, transport |
| **PubSub** | `Phoenix.PubSub` | Distributed publish-subscribe for inter-process and inter-node messaging |
| **Presence** | `Phoenix.Presence` | CRDT-based distributed user tracking across nodes |

## Router and Pipelines

Phoenix's router uses a macro-based DSL that compiles routes into pattern-matching clauses at compile time, making route dispatch extremely fast -- route matching is O(1) with respect to the number of routes due to BEAM's pattern matching optimizations. Routes are organized into scopes with shared pipeline configurations:

```elixir
defmodule PrismaticWeb.Router do
  @moduledoc """
  Main router for the Prismatic Platform web application.
  Defines browser and API pipelines with appropriate middleware.
  """

  use PrismaticWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {PrismaticWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug PrismaticWeb.Plugs.APIAuth
    plug PrismaticWeb.Plugs.RateLimiter
  end

  scope "/", PrismaticWeb do
    pipe_through :browser

    live "/", DashboardLive
    live "/perimeter", PerimeterLive
    live "/perimeter/assets", PerimeterAssetsLive
    live "/perimeter/compliance", PerimeterComplianceLive
    live "/perimeter/easm", PerimeterEASMLive
    live "/osint/toolbox", OsintToolboxLive
    live "/osint/toolbox/:category", OsintToolboxLive
    live "/osint/toolbox/:category/:tool", OsintToolboxLive
  end

  scope "/api/v1", PrismaticAPI do
    pipe_through :api

    get "/health", HealthController, :index
    get "/endpoints", EndpointController, :index
    post "/:app/:action", DispatchController, :dispatch
  end
end
```

Pipelines are one of Phoenix's most powerful abstractions. They allow different groups of routes to share authentication, content negotiation, and middleware logic without duplication, while keeping the routing DSL declarative and readable. The Prismatic Platform defines separate pipelines for browser sessions, API authentication, and internal service communication.

## Phoenix PubSub and Real-Time Communication

Phoenix includes a distributed publish-subscribe system (`Phoenix.PubSub`) that enables real-time communication between processes, both within a single node and across a [cluster](@/glossary/cluster.md) of BEAM nodes. PubSub is the backbone of both Channels and LiveView's real-time capabilities:

```elixir
defmodule PrismaticPerimeter.AlertBroadcaster do
  @moduledoc """
  Broadcasts security alerts to all connected LiveView sessions
  and channel subscribers using Phoenix PubSub.
  """

  @spec broadcast_alert(map()) :: :ok | {:error, term()}
  def broadcast_alert(alert) do
    Phoenix.PubSub.broadcast(Prismatic.PubSub, "perimeter:alerts", %{
      type: :new_vulnerability,
      asset: alert.asset,
      severity: alert.severity,
      details: alert.details,
      timestamp: DateTime.utc_now()
    })
  end

  @spec subscribe_to_alerts() :: :ok | {:error, term()}
  def subscribe_to_alerts do
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "perimeter:alerts")
  end
end
```

PubSub adapters determine how messages propagate across nodes. The default `Phoenix.PubSub.PG2` adapter uses Erlang's built-in process groups for zero-configuration clustering. For larger deployments, Redis-backed adapters provide pub/sub across nodes that cannot form an Erlang cluster. The Prismatic Platform uses PG2 for its Fly.io deployment where nodes can form a native BEAM cluster.

## Channels and WebSockets

Phoenix Channels provide a high-level abstraction for real-time bidirectional communication over [WebSockets](@/glossary/websocket.md). Each channel connection spawns a dedicated BEAM process, meaning a single Phoenix server can maintain hundreds of thousands of simultaneous WebSocket connections with each connection fully isolated:

```elixir
defmodule PrismaticWeb.PerimeterChannel do
  @moduledoc """
  Real-time channel for Perimeter EASM dashboard updates.
  Each connected client joins a domain-specific topic for
  targeted security alert delivery.
  """

  use Phoenix.Channel

  @impl true
  def join("perimeter:" <> domain, _params, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :domain, domain)}
  end

  @impl true
  def handle_info(:after_join, socket) do
    push(socket, "state", get_current_perimeter_state(socket.assigns.domain))
    {:noreply, socket}
  end

  @impl true
  def handle_in("scan_request", %{"target" => target}, socket) do
    case PrismaticPerimeter.initiate_scan(target) do
      {:ok, scan_id} ->
        {:reply, {:ok, %{scan_id: scan_id}}, socket}
      {:error, reason} ->
        {:reply, {:error, %{reason: to_string(reason)}}, socket}
    end
  end
end
```

### Presence

Phoenix.Presence provides distributed, real-time user tracking using CRDTs (Conflict-free Replicated Data Types). It tracks which users are connected to which topics across all nodes in a cluster, handling network partitions and node failures gracefully without a central coordination point. The Prismatic Platform uses Presence for tracking active operator sessions across the EASM dashboard.

## Telemetry Integration

Phoenix ships with comprehensive [telemetry](@/glossary/telemetry.md) instrumentation, emitting events at every stage of request processing:

| Event | Measurements | Metadata |
|-------|-------------|----------|
| `[:phoenix, :endpoint, :start]` | `system_time` | `conn`, `options` |
| `[:phoenix, :endpoint, :stop]` | `duration` | `conn`, `options` |
| `[:phoenix, :router_dispatch, :start]` | `system_time` | `conn`, `route`, `plug` |
| `[:phoenix, :router_dispatch, :stop]` | `duration` | `conn`, `route`, `plug` |
| `[:phoenix, :live_view, :mount, :start]` | `system_time` | `socket`, `params` |
| `[:phoenix, :live_view, :mount, :stop]` | `duration` | `socket`, `params` |
| `[:phoenix, :live_view, :handle_event, :stop]` | `duration` | `socket`, `event` |
| `[:phoenix, :channel_joined]` | `duration` | `socket`, `params` |

The Prismatic Platform aggregates these telemetry events through its [observability](@/glossary/observability.md) infrastructure, feeding them into dashboards, alerting systems, and the quality floor guardian. The P0 page load performance standard (total page load < 250ms, server-side render < 100ms, LiveView mount < 150ms) is enforced through these telemetry measurements.

## Plug Architecture

The [Plug](@/glossary/plug.md) specification is the foundation of Phoenix's request processing. Every stage of request handling -- from endpoint to router to controller -- is a Plug. This composability enables the Prismatic Platform to insert custom behavior at any point in the pipeline:

```elixir
defmodule PrismaticWeb.Plugs.RequestTracing do
  @moduledoc """
  Plug that adds distributed tracing headers to every request,
  enabling end-to-end latency tracking across platform services.
  """

  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    trace_id = get_or_generate_trace_id(conn)
    span_id = generate_span_id()

    conn
    |> Plug.Conn.assign(:trace_id, trace_id)
    |> Plug.Conn.assign(:span_id, span_id)
    |> Plug.Conn.put_resp_header("x-trace-id", trace_id)
  end

  defp get_or_generate_trace_id(conn) do
    case Plug.Conn.get_req_header(conn, "x-trace-id") do
      [trace_id] -> trace_id
      [] -> generate_trace_id()
    end
  end

  defp generate_trace_id, do: Base.encode16(:crypto.strong_rand_bytes(16), case: :lower)
  defp generate_span_id, do: Base.encode16(:crypto.strong_rand_bytes(8), case: :lower)
end
```

## Implementation in the Prismatic Platform

Phoenix powers the Prismatic Platform's web interfaces through two separate Phoenix applications within the umbrella:

| Application | Port | Purpose | Key Routes |
|-------------|------|---------|------------|
| **prismatic_web** | 4000 | LiveView dashboards, real-time UI | `/`, `/perimeter`, `/perimeter/*`, `/osint/toolbox` |
| **prismatic_api** | 4004 | Auto-introspecting REST API | `/api/v1/*`, `/api/swaggerui`, `/api/openapi` |

The `prismatic_web` application uses [LiveView](@/glossary/phoenix-liveview.md) with [Flowbite](@/glossary/flowbite.md) components and [TailwindCSS](@/glossary/tailwindcss.md) for all dashboards, including the Perimeter EASM dashboard, agent monitoring views, the OSINT toolbox (120 tools across 7 categories), and the quality floor guardian interface. All LiveView templates comply with the TailwindCSS-first mandate -- zero inline styles, zero custom CSS files.

The `prismatic_api` application leverages Phoenix's [Plug](@/glossary/plug.md) pipeline and [OpenAPI](@/glossary/openapi.md) specification (via OpenApiSpex) for automatic [REST API](@/glossary/rest-api.md) generation. It auto-discovers all public functions across all `Prismatic*` facade modules using Elixir introspection at boot time, requiring zero manual endpoint configuration.

## Performance Characteristics

Phoenix consistently ranks among the fastest web frameworks in benchmarks:

| Metric | Typical Value | Why It Matters |
|--------|---------------|----------------|
| **Throughput** | 100K+ req/s (JSON), 50K+ req/s (HTML) | Handles traffic spikes without horizontal scaling |
| **Latency (p50)** | < 1ms for simple requests | Fast median response for typical operations |
| **Latency (p99)** | < 10ms under normal load | Consistent tail latency due to per-process GC |
| **WebSocket connections** | 2M+ per node (demonstrated) | Each connection is a lightweight BEAM process |
| **Memory per connection** | ~10KB (channel), ~50KB (LiveView) | Efficient resource usage enables high concurrency |
| **Graceful degradation** | Linear, not cliff | No thread pool exhaustion; each request independent |

The linear degradation property is Phoenix's killer feature for production systems. Thread-pooled frameworks exhibit a cliff effect -- they perform well up to the pool size limit, then collapse catastrophically. Phoenix degrades linearly: the 10,001st concurrent request is only marginally slower than the 10,000th. The Prismatic Platform enforces sub-250ms page loads through telemetry-based monitoring and CI gate enforcement.

## Deployment and Releases

Phoenix applications are deployed as OTP [releases](@/glossary/release.md) -- self-contained packages that include the Erlang runtime, compiled BEAM bytecode, and all dependencies:

```elixir
defmodule PrismaticPlatform.MixProject do
  @moduledoc false
  use Mix.Project

  def project do
    [
      releases: [
        prismatic: [
          include_executables_for: [:unix],
          applications: [
            prismatic_web: :permanent,
            prismatic_api: :permanent,
            prismatic_perimeter: :permanent,
            prismatic_agents: :permanent,
            runtime_tools: :permanent
          ],
          steps: [:assemble, :tar]
        ]
      ]
    ]
  end
end
```

The Prismatic Platform packages Phoenix releases into [Docker](@/glossary/docker.md) containers using multi-stage builds. The build stage compiles Elixir code, compiles TailwindCSS and esbuild assets, and produces a release tarball. The runtime stage uses a minimal Alpine Linux image with only the Erlang runtime. The resulting container deploys to [Fly.io](@/glossary/fly-io.md) with staging (`prismatic-staging.fly.dev`) and production (`prismatic-prod.fly.dev`) environments.

## Testing Phoenix Applications

Phoenix provides comprehensive testing support through ExUnit with specialized helpers for controllers, channels, and LiveView:

```elixir
defmodule PrismaticWeb.PerimeterLiveTest do
  use PrismaticWeb.ConnCase
  import Phoenix.LiveViewTest

  describe "Perimeter dashboard" do
    test "mounts and renders security rating", %{conn: conn} do
      {:ok, view, html} = live(conn, "/perimeter")

      assert html =~ "Perimeter Dashboard"
      assert has_element?(view, "[data-role=security-rating]")
    end

    test "live updates when new vulnerability detected", %{conn: conn} do
      {:ok, view, _html} = live(conn, "/perimeter")

      Phoenix.PubSub.broadcast(Prismatic.PubSub, "perimeter:alerts", %{
        type: :new_vulnerability,
        asset: "api.example.com",
        severity: :critical
      })

      assert render(view) =~ "api.example.com"
    end

    test "filter assets by severity", %{conn: conn} do
      {:ok, view, _html} = live(conn, "/perimeter/assets")

      view
      |> element("[data-role=severity-filter]")
      |> render_change(%{severity: "critical"})

      assert has_element?(view, "[data-severity=critical]")
      refute has_element?(view, "[data-severity=low]")
    end
  end
end
```

## Error Handling and Fallbacks

[Phoenix](@/glossary/phoenix.md) leverages [OTP](@/glossary/otp.md)'s "let it crash" philosophy for error handling. Each request executes in an isolated BEAM process, so an unhandled exception in one request terminates only that process -- other connections are completely unaffected. The [Plug](@/glossary/plug.md) pipeline provides structured error handling through exception-catching plugs and custom error views:

```elixir
defmodule PrismaticWeb.FallbackController do
  @moduledoc """
  Centralized error handling for API and browser requests.
  Converts error tuples into appropriate HTTP responses.
  """

  use PrismaticWeb, :controller

  @spec call(Plug.Conn.t(), {:error, atom()}) :: Plug.Conn.t()
  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(PrismaticWeb.ErrorJSON)
    |> render(:"404")
  end

  def call(conn, {:error, :unauthorized}) do
    conn
    |> put_status(:unauthorized)
    |> put_view(PrismaticWeb.ErrorJSON)
    |> render(:"401")
  end

  def call(conn, {:error, :rate_limited}) do
    conn
    |> put_status(:too_many_requests)
    |> put_resp_header("retry-after", "60")
    |> put_view(PrismaticWeb.ErrorJSON)
    |> render(:"429")
  end
end
```

For LiveView, error handling follows a different pattern. The `handle_info/2` and `handle_event/3` callbacks can return `{:noreply, socket}` with error assigns to display error states in the UI without crashing the LiveView process. If a LiveView process does crash, [Phoenix](@/glossary/phoenix.md) automatically reconnects the client and re-mounts the LiveView, providing seamless recovery from transient errors. This self-healing property is inherited directly from the BEAM's supervision model and is one of the key advantages Phoenix has over JavaScript-based frameworks where a runtime error can leave the UI in an inconsistent state.

## Related Terms

- [OTP](@/glossary/otp.md) - Foundation runtime Phoenix is built upon
- [BEAM](@/glossary/beam.md) - Virtual machine executing Phoenix processes
- [LiveView](@/glossary/phoenix-liveview.md) - Phoenix's real-time server-rendered UI framework
- [Plug](@/glossary/plug.md) - Composable middleware specification powering Phoenix pipelines
- [Channel](@/glossary/channel.md) - WebSocket-based real-time communication layer
- [PubSub](@/glossary/pubsub.md) - Distributed publish-subscribe for real-time events
- [Ecto](@/glossary/ecto.md) - Database toolkit commonly paired with Phoenix
- [Endpoint](@/glossary/endpoint.md) - HTTP server entry point in Phoenix applications
- [Flowbite](@/glossary/flowbite.md) - UI component library used with Phoenix LiveView
- [TailwindCSS](@/glossary/tailwindcss.md) - Utility-first CSS framework used in Phoenix templates
- [OpenAPI](@/glossary/openapi.md) - API specification standard for Phoenix REST endpoints
- [WebSocket](@/glossary/websocket.md) - Transport protocol for Channels and LiveView

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Apps](@/apps/_index.md) - Application directory including prismatic_web and prismatic_api

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
