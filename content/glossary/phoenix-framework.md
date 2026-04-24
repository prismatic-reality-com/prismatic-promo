+++
title = "Phoenix Framework"
weight = 20
[extra]
description = "Productive, reliable web framework for Elixir that leverages the BEAM virtual machine to build fault-tolerant, real-time, scalable applications with LiveView server-rendered reactive UIs"
category = "technology"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["elixir", "liveview", "plug", "phoenix", "channel", "websocket", "endpoint", "ecto", "otp", "beam"]
keywords = ["Phoenix Framework Elixir", "Phoenix LiveView real-time", "Elixir web framework", "BEAM web development", "Phoenix channels WebSocket", "Phoenix PubSub", "server-rendered reactive UI", "Phoenix plug pipeline"]
tags = ["phoenix", "elixir", "web-framework", "liveview", "real-time"]
date_created = "2026-02-22"
acronym = ""
difficulty_level = "intermediate"
importance = "critical"
word_count = 1631
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Phoenix Framework - Prismatic Platform"
+++

## Definition

Phoenix Framework is a web application framework written in Elixir that leverages the BEAM virtual machine's concurrency, fault tolerance, and distribution capabilities to build highly scalable, real-time web applications. Created by Chris McCord and first released in 2014, Phoenix provides a productive development experience comparable to Ruby on Rails while delivering performance characteristics that rival Go and Rust web servers -- handling millions of concurrent WebSocket connections on a single machine.

Phoenix's architecture is built around the Plug specification (a composable middleware system), Channels (real-time communication over WebSockets and long-polling), PubSub (distributed publish-subscribe messaging), and LiveView (server-rendered reactive user interfaces that eliminate the need for client-side JavaScript frameworks). The framework embraces the BEAM's process-per-connection model, where each HTTP request and each WebSocket connection is handled by a dedicated lightweight process with its own memory and failure boundary.

## Overview

Phoenix occupies a unique position in the web framework landscape. Most modern web frameworks must choose between developer productivity (Ruby on Rails, Django, Laravel) and runtime performance (Go, Rust, Node.js). Phoenix achieves both simultaneously because the BEAM's concurrency model -- lightweight processes, preemptive scheduling, and efficient message passing -- eliminates the traditional trade-off between elegant abstraction and raw performance.

The framework's connection handling architecture fundamentally differs from thread-pool-based servers. Where a traditional server allocates one OS thread per connection (limiting concurrency to thousands), Phoenix allocates one BEAM process per connection (enabling concurrency of millions). Each process consumes approximately 2-3KB of memory, compared to megabytes per thread in JVM or .NET servers. This means a Phoenix application can maintain hundreds of thousands of simultaneous WebSocket connections on commodity hardware without specialized infrastructure.

**Performance Characteristics in Production**: The Prismatic Platform, built entirely on Phoenix, demonstrates these capabilities in practice. The platform serves multiple applications from a single Phoenix umbrella app: the main web dashboard (PrismaticWeb), API gateway (PrismaticAPI), and external attack surface management interface (PrismaticPerimeter). Under typical load, the platform achieves sub-100ms server-side render times for LiveView pages, handles concurrent OSINT queries across 120+ providers without blocking, and maintains real-time WebSocket connections for dashboard updates.

**Real-time Architecture Advantages**: Phoenix's real-time capabilities extend beyond WebSockets. The framework's PubSub system enables applications to broadcast events across multiple server nodes without additional infrastructure. When a security rating changes in the Perimeter application, the update propagates in real-time to any connected dashboards across the entire cluster. This distributed real-time capability would require complex external message brokers (Redis, RabbitMQ) in most other frameworks but is native in Phoenix.

**Fault Tolerance in Practice**: Phoenix applications inherit the BEAM's "let it crash" philosophy, where individual request processes fail fast and are automatically restarted by supervisors. If a single OSINT provider query crashes due to malformed data, only that specific query process fails -- the web server, other concurrent queries, and user sessions remain unaffected. This isolation prevents cascading failures that plague thread-based servers where a single bad request can corrupt shared state.

| Characteristic | Phoenix | Rails | Django | Express | Go (net/http) |
|---------------|---------|-------|--------|---------|---------------|
| **Language** | Elixir | Ruby | Python | JavaScript | Go |
| **Concurrency model** | BEAM processes | Thread pool | Thread pool | Event loop | Goroutines |
| **Connections per node** | Millions | Thousands | Thousands | Tens of thousands | Hundreds of thousands |
| **Real-time** | Channels + LiveView | ActionCable | Django Channels | Socket.io | Custom |
| **Fault tolerance** | Built-in (supervisors) | External (systemd) | External | External | Manual |
| **Hot code reload** | Built-in (BEAM) | Restart required | Restart required | Restart required | Restart required |
| **Latency (P99)** | Sub-millisecond | Tens of milliseconds | Tens of milliseconds | Milliseconds | Sub-millisecond |

## Technical Details

### Request Pipeline (Plug Architecture)

Phoenix's request handling is built on Plug, a specification for composable modules that transform a connection (`%Plug.Conn{}` struct). Every Phoenix request passes through a pipeline of plugs, each performing a single transformation:

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
    plug PrismaticWeb.Plugs.RequestTimer
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug PrismaticWeb.Plugs.APIAuth
    plug PrismaticWeb.Plugs.RateLimiter
    plug OpenApiSpex.Plug.PutApiSpec, module: PrismaticAPI.ApiSpec
  end

  scope "/", PrismaticWeb do
    pipe_through :browser

    live "/", HomeLive, :index
    live "/perimeter", PerimeterLive, :index
    live "/osint/toolbox", OSINT.ToolboxLive, :index
  end

  scope "/api/v1", PrismaticAPI do
    pipe_through :api

    get "/health", HealthController, :index
    get "/endpoints", EndpointController, :index
    post "/:app/:action", DispatchController, :dispatch
  end
end
```

### Endpoint Architecture

The Phoenix Endpoint is a Supervisor that manages all connection-handling infrastructure:

```elixir
defmodule PrismaticWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :prismatic_web

  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]]

  socket "/socket", PrismaticWeb.UserSocket,
    websocket: true,
    longpoll: false

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

### LiveView -- Server-Rendered Reactive UIs

LiveView is Phoenix's paradigm-shifting approach to building interactive web applications. Instead of sending JSON to a client-side JavaScript framework, LiveView renders HTML on the server and sends differential updates over a WebSocket. The server maintains a stateful process for each connected user:

```elixir
defmodule PrismaticWeb.PerimeterLive do
  use PrismaticWeb, :live_view

  @impl Phoenix.LiveView
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "perimeter:updates")
      Process.send_after(self(), :refresh_metrics, 30_000)
    end

    {:ok,
     socket
     |> assign(:assets, PrismaticPerimeter.list_assets())
     |> assign(:rating, PrismaticPerimeter.overall_rating())
     |> assign(:compliance, PrismaticPerimeter.compliance_summary())}
  end

  @impl Phoenix.LiveView
  def handle_info(:refresh_metrics, socket) do
    Process.send_after(self(), :refresh_metrics, 30_000)
    {:noreply, assign(socket, :rating, PrismaticPerimeter.overall_rating())}
  end

  @impl Phoenix.LiveView
  def handle_info({:asset_discovered, asset}, socket) do
    {:noreply, update(socket, :assets, &[asset | &1])}
  end

  @impl Phoenix.LiveView
  def handle_event("scan_domain", %{"domain" => domain}, socket) do
    case PrismaticPerimeter.discover(domain) do
      {:ok, results} ->
        {:noreply,
         socket
         |> assign(:assets, results.assets)
         |> put_flash(:info, "Discovered #{length(results.assets)} assets")}

      {:error, reason} ->
        {:noreply, put_flash(socket, :error, "Scan failed: #{reason}")}
    end
  end
end
```

### Channels -- Real-Time Communication

Phoenix Channels provide bidirectional real-time communication over WebSockets with topic-based routing and presence tracking:

```elixir
defmodule PrismaticWeb.AgentChannel do
  use PrismaticWeb, :channel

  @impl Phoenix.Channel
  def join("agent:" <> agent_id, _params, socket) do
    case PrismaticAgents.Registry.lookup(agent_id) do
      {:ok, agent} ->
        send(self(), :after_join)
        {:ok, assign(socket, :agent, agent)}

      {:error, :not_found} ->
        {:error, %{reason: "agent not found"}}
    end
  end

  @impl Phoenix.Channel
  def handle_info(:after_join, socket) do
    push(socket, "agent_state", PrismaticAgents.get_state(socket.assigns.agent))
    {:noreply, socket}
  end

  @impl Phoenix.Channel
  def handle_in("execute", %{"command" => command}, socket) do
    case PrismaticAgents.execute(socket.assigns.agent, command) do
      {:ok, result} -> {:reply, {:ok, result}, socket}
      {:error, reason} -> {:reply, {:error, %{reason: reason}}, socket}
    end
  end
end
```

### PubSub -- Distributed Messaging

Phoenix PubSub provides cluster-wide publish-subscribe messaging, ensuring that real-time updates propagate across all nodes in a distributed deployment:

```elixir
# Publishing events from any process
Phoenix.PubSub.broadcast(Prismatic.PubSub, "perimeter:updates",
  {:asset_discovered, %{domain: "example.com", type: :subdomain}})

# In production with multiple nodes, PubSub uses the PG2 adapter
# or Redis adapter for cross-node message delivery
config :prismatic_web, PrismaticWeb.Endpoint,
  pubsub_server: Prismatic.PubSub

config :prismatic, Prismatic.PubSub,
  adapter: Phoenix.PubSub.PG2,
  pool_size: System.schedulers_online()
```

### Telemetry Integration

Phoenix emits telemetry events at every layer, enabling comprehensive observability:

```elixir
defmodule PrismaticWeb.Telemetry do
  use Supervisor

  def start_link(arg) do
    Supervisor.start_link(__MODULE__, arg, name: __MODULE__)
  end

  @impl Supervisor
  def init(_arg) do
    children = [
      {:telemetry_poller,
       measurements: [
         {PrismaticWeb.Telemetry, :dispatch_stats, []}
       ],
       period: :timer.seconds(10)}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end

  # Phoenix emits events for every request phase:
  # [:phoenix, :endpoint, :start] / [:phoenix, :endpoint, :stop]
  # [:phoenix, :router_dispatch, :start] / [:phoenix, :router_dispatch, :stop]
  # [:phoenix, :live_view, :mount, :start] / [:phoenix, :live_view, :mount, :stop]
  # [:phoenix, :live_view, :handle_event, :start] / [:phoenix, :live_view, :handle_event, :stop]
end
```

## Implementation in Prismatic Platform

Phoenix is the web layer of the Prismatic Platform, serving the primary LiveView dashboards on port 4000 and the auto-introspecting REST API on port 4004. The platform uses Phoenix across multiple applications in its umbrella structure:

| Application | Phoenix Usage | Port | Key Routes |
|-------------|---------------|------|------------|
| **prismatic_web** | LiveView dashboards, browser UI | 4000 | `/`, `/perimeter`, `/osint/toolbox`, `/labs` |
| **prismatic_api** | OpenApiSpex REST gateway | 4004 | `/api/v1/*`, `/api/swagger-ui` |

### Performance Characteristics

The platform enforces strict performance budgets aligned with Phoenix's capabilities:

| Metric | Hard Limit | Typical | Enforcement |
|--------|-----------|---------|-------------|
| **Total page load** | < 250ms | ~80ms | Pre-commit blocking |
| **Server-side render** | < 100ms | ~30ms | Pre-commit blocking |
| **LiveView mount** | < 150ms | ~50ms | Pre-commit blocking |
| **LiveView handle_event** | < 50ms | ~10ms | Pre-commit blocking |
| **Health check** | < 10ms | ~2ms | Pre-commit blocking |

These performance characteristics are achievable because Phoenix LiveView renders HTML on the server (no client-side framework overhead), sends only differential updates (typically a few bytes per event), and leverages BEAM's sub-millisecond process scheduling for event handling.

### Deployment Architecture

The platform deploys to Fly.io using OTP releases with Phoenix:

```elixir
# rel/env.sh.eex
export PHX_SERVER=true
export POOL_SIZE=10
export RELEASE_DISTRIBUTION=name
export RELEASE_NODE="prismatic@${FLY_APP_NAME}.internal"

# config/runtime.exs
config :prismatic_web, PrismaticWeb.Endpoint,
  url: [host: System.get_env("PHX_HOST"), port: 443, scheme: "https"],
  http: [
    ip: {0, 0, 0, 0, 0, 0, 0, 0},
    port: String.to_integer(System.get_env("PORT") || "4000")
  ],
  secret_key_base: System.fetch_env!("SECRET_KEY_BASE")
```

## Comparison with Alternatives

| Feature | Phoenix | Next.js | Django | Ruby on Rails | Spring Boot |
|---------|---------|---------|--------|---------------|-------------|
| **Server-side rendering** | LiveView (stateful) | React SSR | Templates | ERB/Haml | Thymeleaf |
| **Real-time** | Native (Channels/LiveView) | External (Socket.io) | Django Channels | ActionCable | WebFlux |
| **Concurrency** | Millions of processes | Event loop | Thread pool | Thread pool | Thread pool |
| **Database** | Ecto (functional) | Prisma/others | Django ORM | ActiveRecord | JPA/Hibernate |
| **Type safety** | Dialyzer + typespecs | TypeScript | Type hints | Sorbet | Java types |
| **Hot reload** | Native (BEAM) | HMR (client) | Dev server | Dev server | Spring DevTools |
| **Fault tolerance** | Supervision trees | PM2/containers | Gunicorn | Puma/containers | Spring Retry |
| **Memory per connection** | ~2-3KB | ~50KB+ | ~1MB (thread) | ~1MB (thread) | ~1MB (thread) |
| **Deployment** | OTP releases | Node.js runtime | WSGI/ASGI | Rack | JAR/WAR |

Phoenix's key differentiator is that its real-time capabilities are not bolted on -- they are native to the framework and the runtime. LiveView eliminates the client-server API boundary for interactive features, and Channels provide transparent WebSocket communication with built-in presence tracking and PubSub distribution across cluster nodes.

## Best Practices

1. **Use LiveView for Interactive Features**: Prefer LiveView over client-side JavaScript for interactive UI components. LiveView provides reactive updates with server-side state management, eliminating an entire class of client-server synchronization bugs.

2. **Design Plug Pipelines Carefully**: Order plugs from least to most expensive. Authentication and rate limiting should come before parsing and database access. Each plug should do exactly one thing.

3. **Leverage PubSub for Decoupling**: Use Phoenix PubSub to decouple components. Instead of direct function calls between contexts, broadcast events and let interested parties subscribe. This enables natural scaling to multi-node deployments.

4. **Context Modules for Business Logic**: Keep controllers and LiveViews thin. Place business logic in Phoenix contexts (plain Elixir modules with well-defined APIs). This maintains testability and prevents UI concerns from leaking into domain logic.

5. **Telemetry for Observability**: Attach telemetry handlers to Phoenix events for monitoring request latency, WebSocket connection counts, LiveView mount times, and PubSub message rates. The platform uses this for performance budget enforcement.

6. **Ecto Changesets for Validation**: Use Ecto changesets for all data validation, even for data that will not be persisted to a database. Changesets provide a composable, testable validation pipeline.

## Common Pitfalls

1. **Treating LiveView as a SPA Framework**: LiveView is not React on the server. Its strength is server-rendered HTML with differential updates, not complex client-side state management. For features requiring heavy client-side computation (canvas drawing, video editing), use JavaScript hooks.

2. **Ignoring Process Boundaries**: Each LiveView instance is a BEAM process. Expensive operations in `handle_event` block only that user's process, but they can still degrade the user experience. Offload expensive work to background processes.

3. **Overusing Channels When PubSub Suffices**: Channels are for bidirectional client-server communication. For server-to-client broadcasting (dashboards, notifications), PubSub with LiveView is simpler and more maintainable.

4. **N+1 Queries in LiveView**: LiveView's reactive nature can trigger database queries on every event. Use Ecto preloads, assign caching, and stream-based loading to prevent query proliferation.

5. **Fat Controllers**: Placing business logic in controllers or LiveView modules makes it untestable in isolation. Always delegate to context modules.

6. **Ignoring Connection Lifecycle**: WebSocket connections can disconnect and reconnect. Design LiveView mounts to be idempotent and handle the `connected?/1` check to differentiate between the initial static render and the live WebSocket connection.

## Use Cases

- **Real-Time Dashboards**: The Prismatic Platform's Perimeter EASM dashboard uses LiveView to display live security ratings, asset discoveries, and compliance assessments with automatic updates via PubSub.

- **OSINT Toolbox**: The 120-tool OSINT interface at `/osint/toolbox` uses LiveView for interactive tool execution, result display, and category-based filtering -- all without client-side JavaScript.

- **API Gateways**: The auto-introspecting REST API on port 4004 uses Phoenix's controller architecture with OpenApiSpex for automatic documentation generation and Swagger UI hosting.

- **Multi-Tenant SaaS**: Phoenix's connection-per-process model naturally supports multi-tenant architectures where each tenant's state is isolated in its own process tree.

- **IoT Command and Control**: Phoenix Channels provide bidirectional communication with IoT devices, with Presence tracking device online/offline status across the cluster.

## Advanced Phoenix Patterns

The Prismatic Platform employs several advanced Phoenix patterns for scalability and maintainability:

### Real-time Communication Architecture

```elixir
defmodule PrismaticWeb.RealtimeSystem do
  @moduledoc """
  Advanced real-time communication patterns using Phoenix Channels and PubSub.
  """

  @spec broadcast_to_agents(String.t(), map()) :: :ok
  def broadcast_to_agents(event_type, payload) do
    Phoenix.PubSub.broadcast(
      PrismaticWeb.PubSub,
      "agents:global",
      {event_type, payload}
    )
  end

  @spec subscribe_to_agent_updates(String.t()) :: :ok | {:error, term()}
  def subscribe_to_agent_updates(agent_id) do
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "agent:#{agent_id}")
  end
end
```

## Related Concepts

- [Elixir](@/glossary/elixir.md) - The programming language that Phoenix is written in and runs on
- [LiveView](@/glossary/liveview.md) - Server-rendered reactive UI framework built into Phoenix
- [Plug](@/glossary/plug.md) - Composable middleware specification underlying Phoenix's request pipeline
- [Channel](@/glossary/channel.md) - Real-time bidirectional communication layer in Phoenix
- [WebSocket](@/glossary/websocket.md) - Transport protocol used by Phoenix Channels and LiveView
- [Endpoint](@/glossary/endpoint.md) - Phoenix Supervisor managing connection handling infrastructure
- [Ecto](@/glossary/ecto.md) - Database wrapper and query generator commonly used with Phoenix
- [BEAM](@/glossary/beam.md) - Virtual machine providing Phoenix's concurrency and fault tolerance
- [OTP](@/glossary/otp.md) - Framework library providing supervision and process management
- [PubSub](@/glossary/pubsub.md) - Distributed publish-subscribe system for Phoenix real-time features

## See Also

- [Phoenix](@/glossary/phoenix.md) - General Phoenix ecosystem entry
- [Phoenix LiveView](@/glossary/phoenix-liveview.md) - Detailed LiveView documentation
- [REST API](@/glossary/rest-api.md) - REST API design patterns used with Phoenix
- [Technologies](@/technologies/_index.md) - Full technology stack overview
- [Architecture](@/architecture/_index.md) - Platform architecture documentation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
