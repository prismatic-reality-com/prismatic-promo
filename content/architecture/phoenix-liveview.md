+++
title = "Phoenix LiveView"
weight = 1
date = 2026-02-12
[extra]
icon = "lightning"
color = "emerald"
description = "Real-time dashboards with server-rendered reactivity"
date_created = "2025-06-15"
reading_time = "12 min"
difficulty = "intermediate"
tags = ["phoenix", "liveview", "real-time", "websocket", "beam", "elixir", "dashboards"]
related_articles = ["pubsub", "telemetry", "supervision-trees", "umbrella-apps"]
authors = ["Tomáš Korcak (korczis)"]
author = "Tomas Korcak (korczis)"
word_count = 1496
date_modified = "2026-02-23"
keywords = ["Phoenix", "LiveView", "Real-time", "architecture", "Prismatic Platform", "JavaScript", "BEAM"]
quality_score = 80
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "Phoenix LiveView - Prismatic Platform"
+++

## Overview

[Phoenix](@/glossary/phoenix.md) [LiveView](@/glossary/liveview.md) represents a fundamental departure from the dominant single-page application paradigm that has governed web development since the mid-2010s. Rather than shipping a JavaScript runtime to the browser and managing client-side state through frameworks like React, Vue, or Angular, LiveView keeps all application state on the server inside lightweight [BEAM](@/glossary/beam.md) processes, communicating with the browser exclusively through a persistent [WebSocket](@/glossary/websocket.md) connection that transmits minimal DOM diffs.

This architectural decision was not made arbitrarily. The Prismatic Platform manages hundreds of concurrent real-time dashboards -- from [Perimeter security monitoring](@/apps/prismatic-perimeter.md) to [agent coordination](@/apps/prismatic-agents.md) -- where the traditional SPA approach would impose three compounding costs: a large JavaScript bundle for each dashboard variant, a complex client-side state synchronization layer, and an API surface that duplicates server-side business logic. LiveView eliminates all three by treating the browser as a thin rendering target rather than an application host.

The result is a system where adding a new real-time dashboard requires writing only server-side [Elixir](@/glossary/elixir.md) code, with no API endpoints to design, no JavaScript components to build, and no state synchronization bugs to chase. Every dashboard in the Prismatic Platform -- across [security perimeter monitoring](@/apps/prismatic-perimeter-web.md), deal pipeline tracking, and [agent orchestration](@/apps/prismatic-agents.md) -- is built entirely with LiveView.

## Architecture and Request Lifecycle

The LiveView lifecycle begins with a standard HTTP request that renders an initial HTML page. This page contains a small JavaScript client (~30KB) that immediately establishes a WebSocket connection back to the server. Once connected, a dedicated [BEAM](@/glossary/beam.md) process is spawned for that user session, and all subsequent interaction flows through this persistent connection.

```
Browser                              Server (BEAM VM)
  │                                       │
  ├── HTTP GET /perimeter ───────────────>│
  │                                       ├── Render initial HTML
  │<── Full HTML page ───────────────────┤
  │                                       │
  ├── WebSocket connect ─────────────────>│
  │                                       ├── Spawn LiveView process
  │                                       ├── mount/3 callback
  │                                       ├── Render + compute diff
  │<── DOM patch (initial state) ────────┤
  │                                       │
  ├── User click event ─────────────────>│
  │                                       ├── handle_event/3
  │                                       ├── Update assigns
  │                                       ├── Re-render + diff
  │<── DOM patch (minimal diff) ────────┤
  │                                       │
  │   (PubSub message arrives)            │
  │                                       ├── handle_info/2
  │                                       ├── Update assigns
  │<── DOM patch (server push) ─────────┤
```

This architecture means every LiveView instance is a [GenServer](@/glossary/genserver.md) process with its own isolated heap, its own garbage collection cycle, and its own failure boundary. When one user's session crashes, no other session is affected. The [BEAM's preemptive scheduler](@/glossary/beam.md) ensures fair CPU distribution across all connected sessions, preventing any single user from monopolizing server resources.

### Why Not a Traditional SPA?

The decision to use LiveView over a React/Vue SPA involved evaluating several architectural tradeoffs:

| Criterion | SPA (React/Vue) | LiveView | Prismatic Decision |
|-----------|-----------------|----------|-------------------|
| Initial bundle size | 200-500KB JS | ~30KB JS | LiveView: smaller payload |
| State management | Client-side (Redux/Pinia) | Server-side (process) | LiveView: single source of truth |
| API surface | REST/[GraphQL](@/glossary/graphql.md) endpoints required | None (direct data access) | LiveView: less code duplication |
| Real-time updates | WebSocket + client reconciliation | Built-in via [PubSub](@/glossary/pubsub.md) | LiveView: native integration |
| SEO | Requires SSR setup | Server-rendered by default | LiveView: zero configuration |
| Offline support | Possible with service workers | Requires connection | SPA: advantage for offline |
| Latency sensitivity | Client-side instant | Network round-trip | SPA: advantage for <50ms interactions |

For the Prismatic Platform, the tradeoffs favor LiveView decisively. Our dashboards require persistent real-time data streams ([security rating](@/glossary/security-rating.md)s, asset discovery, agent status) where server-side state is authoritative. The rare cases where sub-50ms client interaction matters (drag-and-drop, complex form validation) are handled through LiveView's JavaScript hooks mechanism, which allows targeted JavaScript for specific interactions without abandoning the server-rendered model.

## Server-Side State Management

All UI state in a LiveView process lives in the socket's `assigns` map. This is a deliberate constraint that produces several architectural benefits: state is always consistent (no client-server drift), state is always inspectable (via `:sys.get_state/1` on the process), and state transitions are always sequential (one message at a time in the process mailbox).

```elixir
defmodule PrismaticWeb.PerimeterLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      # Subscribe to real-time updates via PubSub
      PrismaticPerimeter.subscribe()

      # Schedule periodic refresh of aggregate metrics
      Process.send_after(self(), :refresh_metrics, 30_000)
    end

    {:ok,
     assign(socket,
       assets: [],
       security_rating: nil,
       compliance_status: %{},
       loading: true,
       page: 1,
       per_page: 25,
       sort_by: :discovered_at,
       sort_dir: :desc
     )}
  end

  @impl true
  def handle_info({:asset_discovered, asset}, socket) do
    socket =
      socket
      |> update(:assets, fn assets ->
        assets
        |> List.insert_at(0, asset)
        |> Enum.take(socket.assigns.per_page)
      end)
      |> push_event("flash", %{message: "New asset: #{asset.domain}"})

    {:noreply, socket}
  end

  @impl true
  def handle_info(:refresh_metrics, socket) do
    Process.send_after(self(), :refresh_metrics, 30_000)

    case PrismaticPerimeter.aggregate_metrics() do
      {:ok, metrics} ->
        {:noreply, assign(socket, metrics: metrics)}

      {:error, _reason} ->
        {:noreply, socket}
    end
  end

  @impl true
  def handle_event("sort", %{"field" => field}, socket) do
    field = String.to_existing_atom(field)

    {sort_by, sort_dir} =
      if socket.assigns.sort_by == field do
        {field, toggle_direction(socket.assigns.sort_dir)}
      else
        {field, :asc}
      end

    assets = sort_assets(socket.assigns.assets, sort_by, sort_dir)
    {:noreply, assign(socket, sort_by: sort_by, sort_dir: sort_dir, assets: assets)}
  end

  defp toggle_direction(:asc), do: :desc
  defp toggle_direction(:desc), do: :asc
end
```

This pattern demonstrates a key architectural principle: the LiveView process is the single source of truth for the UI. The `handle_info/2` callback receives domain events from [PubSub](@/architecture/pubsub.md), while `handle_event/3` handles user interactions. Both funnel through the same sequential process mailbox, making race conditions between user actions and server events structurally impossible.

## Component Architecture

LiveView provides two component abstractions that map cleanly to the stateful/stateless distinction familiar from other UI frameworks, but with the critical difference that "stateful" means a separate BEAM process, not merely a client-side state container.

### Live Components (Stateful)

Live components run as separate processes within the parent LiveView's process tree. They receive their own `update/2` callbacks and can handle events independently. This is appropriate for self-contained UI units with their own data lifecycle:

```elixir
defmodule PrismaticWeb.Components.SecurityRatingCard do
  use PrismaticWeb, :live_component

  @impl true
  def update(%{rating: rating} = assigns, socket) do
    {:ok,
     socket
     |> assign(assigns)
     |> assign(
       trend: calculate_trend(rating),
       grade_class: grade_to_css_class(rating.grade),
       percentile_label: format_percentile(rating.industry_percentile)
     )}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class={"rounded-xl p-6 #{@grade_class}"}>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-400">Security Rating</p>
          <p class="text-4xl font-bold"><%= @rating.grade %></p>
          <p class="text-sm"><%= @rating.score %>/900</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-400">Industry Percentile</p>
          <p class="text-2xl font-semibold"><%= @percentile_label %></p>
          <p class={"text-sm #{trend_class(@trend)}"}>
            <%= trend_icon(@trend) %> <%= @trend.delta %>
          </p>
        </div>
      </div>
    </div>
    """
  end

  defp grade_to_css_class(:A), do: "bg-green-900/30 border border-green-500/20"
  defp grade_to_css_class(:B), do: "bg-blue-900/30 border border-blue-500/20"
  defp grade_to_css_class(:C), do: "bg-yellow-900/30 border border-yellow-500/20"
  defp grade_to_css_class(_), do: "bg-red-900/30 border border-red-500/20"
end
```

### Function Components (Stateless)

Function components are [pure function](@/glossary/pure-function.md)s that receive assigns and return HEEx templates. They are evaluated inline within the parent LiveView's render cycle, adding zero process overhead:

```elixir
defmodule PrismaticWeb.Components.UI do
  use Phoenix.Component

  attr :rating, :map, required: true
  attr :size, :atom, default: :md, values: [:sm, :md, :lg]

  def rating_badge(assigns) do
    ~H"""
    <span class={[
      "inline-flex items-center rounded-full font-semibold",
      size_class(@size),
      rating_color(@rating.grade)
    ]}>
      <%= @rating.grade %>
    </span>
    """
  end

  attr :label, :string, required: true
  attr :value, :string, required: true
  attr :trend, :atom, default: nil, values: [nil, :up, :down, :stable]

  def metric_card(assigns) do
    ~H"""
    <div class="rounded-lg bg-gray-800 p-4">
      <p class="text-sm text-gray-400"><%= @label %></p>
      <p class="text-2xl font-bold text-white"><%= @value %></p>
      <p :if={@trend} class={trend_class(@trend)}>
        <%= trend_arrow(@trend) %>
      </p>
    </div>
    """
  end
end
```

The guideline for choosing between the two is straightforward: use function components by default (they are faster and simpler), and promote to live components only when the component needs to independently handle events, maintain internal state, or perform its own data fetching.

## PubSub Integration for Real-Time Updates

The integration between LiveView and [Phoenix PubSub](@/architecture/pubsub.md) is where the architecture truly distinguishes itself from traditional approaches. Because each LiveView is a BEAM process, it can subscribe to PubSub topics directly in its `mount/3` callback and receive messages through `handle_info/2` -- the same mechanism used for all inter-process communication in [OTP](@/glossary/otp.md).

```elixir
defmodule PrismaticWeb.AgentDashboardLive do
  use PrismaticWeb, :live_view

  @topics ["agents:status", "agents:metrics", "agents:errors"]

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Enum.each(@topics, &Phoenix.PubSub.subscribe(PrismaticPubSub, &1))
    end

    {:ok,
     assign(socket,
       agents: PrismaticAgents.list_active(),
       error_count: 0,
       last_event: nil
     )}
  end

  @impl true
  def handle_info({:agent_started, agent}, socket) do
    {:noreply,
     socket
     |> update(:agents, &Map.put(&1, agent.id, agent))
     |> assign(last_event: {:started, agent.id, DateTime.utc_now()})}
  end

  @impl true
  def handle_info({:agent_error, agent_id, error}, socket) do
    {:noreply,
     socket
     |> update(:error_count, &(&1 + 1))
     |> assign(last_event: {:error, agent_id, DateTime.utc_now()})}
  end
end
```

This pattern requires no additional API layer, no polling mechanism, and no client-side event bus. The domain event (`agent_started`) flows from the originating process through [PubSub](@/glossary/pubsub.md) directly into the LiveView process, which re-renders and sends a DOM diff to the browser. The entire path from domain event to screen update typically completes in under 10 milliseconds.

## Performance Characteristics

### BEAM VM Advantages for UI Serving

The [BEAM virtual machine](@/glossary/beam.md) provides several properties that make it exceptionally suited for serving many concurrent LiveView connections:

| Property | Mechanism | Impact on LiveView |
|----------|-----------|-------------------|
| [Process isolation](@/glossary/process-isolation.md) | Separate heap per process | One user's crash never affects others |
| Preemptive scheduling | Reduction counting | No single user can starve others |
| Per-process GC | Generational, per-heap | No global GC pauses across all sessions |
| Lightweight processes | ~2KB initial memory | 100,000+ concurrent sessions per node |
| [Hot code reload](@/glossary/hot-code-reload.md)ing | Module versioning | Zero-downtime dashboard updates |

### Measured Performance

Benchmarks from the Prismatic Platform production environment (single node, 8-core, 32GB RAM):

| Metric | Value | Methodology |
|--------|-------|-------------|
| Mount time (cold) | 2-5ms | `:telemetry` measurement of mount/3 |
| Mount time (warm, cached data) | <1ms | Data pre-loaded in [ETS](@/glossary/ets.md) |
| DOM diff generation | 50-200us | Template diffing engine |
| WebSocket frame size (typical) | 200-800 bytes | Compressed diff payload |
| Concurrent connections (single node) | 50,000+ | Load tested with Tsung |
| Memory per connection | 30-50KB | Measured via `:erlang.process_info/2` |
| Event round-trip (user click to DOM update) | 5-15ms | End-to-end with network |

### WebSocket Efficiency vs Polling

The bandwidth savings are substantial for data-heavy dashboards:

```
Scenario: 1,000 concurrent users on Perimeter dashboard, 2 updates/second

Traditional polling (REST API):
  1,000 users x 2 req/s x ~4KB response = 8 MB/s bandwidth
  + 1,000 users x 2 req/s x connection overhead = 2,000 TCP handshakes/s

LiveView (WebSocket + diffs):
  1,000 persistent connections x 2 diffs/s x ~400 bytes = 0.8 MB/s bandwidth
  + 0 TCP handshakes (persistent connections)

Bandwidth reduction: ~90%
Connection overhead reduction: ~100%
```

## Telemetry and Observability

Every LiveView lifecycle event emits [telemetry](@/architecture/telemetry.md) events that integrate with the platform's [observability](@/glossary/observability.md) infrastructure:

```elixir
defmodule PrismaticWeb.LiveViewTelemetry do
  @events [
    [:phoenix, :live_view, :mount, :start],
    [:phoenix, :live_view, :mount, :stop],
    [:phoenix, :live_view, :mount, :exception],
    [:phoenix, :live_view, :handle_event, :start],
    [:phoenix, :live_view, :handle_event, :stop],
    [:phoenix, :live_view, :handle_event, :exception]
  ]

  def attach do
    :telemetry.attach_many(
      "prismatic-liveview-metrics",
      @events,
      &handle_event/4,
      %{}
    )
  end

  defp handle_event(
         [:phoenix, :live_view, :mount, :stop],
         %{duration: duration},
         %{socket: socket},
         _config
       ) do
    view = socket.view |> Module.split() |> List.last()

    :telemetry.execute(
      [:prismatic, :dashboard, :mount],
      %{duration: duration},
      %{view: view, connected: Phoenix.LiveView.connected?(socket)}
    )
  end
end
```

This [telemetry](@/glossary/telemetry.md) data feeds into the platform's [quality gates](@/capabilities/quality-gates.md) and [real-time monitoring](@/capabilities/real-time-monitoring.md) systems, enabling automatic detection of performance regressions in dashboard rendering.

## Testing LiveView

LiveView provides a first-class testing API that exercises the full server-side lifecycle without requiring a browser:

```elixir
defmodule PrismaticWeb.PerimeterLiveTest do
  use PrismaticWeb.ConnCase, async: true
  import Phoenix.LiveViewTest

  test "mounts with loading state" do
    {:ok, view, html} = live(conn, "/perimeter")

    assert html =~ "Loading"
    assert has_element?(view, "#perimeter-dashboard")
  end

  test "receives real-time asset discovery" do
    {:ok, view, _html} = live(conn, "/perimeter")

    # Simulate a PubSub event
    asset = %{id: "asset-1", domain: "example.com", type: :domain}
    send(view.pid, {:asset_discovered, asset})

    assert has_element?(view, "#asset-asset-1")
    assert render(view) =~ "example.com"
  end

  test "handles sorting" do
    {:ok, view, _html} = live(conn, "/perimeter")

    view
    |> element("[data-sort=domain]")
    |> render_click()

    assert has_element?(view, "[data-sort-dir=asc]")
  end
end
```

These tests run in milliseconds, provide full coverage of the server-side logic, and catch rendering regressions without the brittleness of browser-based end-to-end tests. For interactions that involve JavaScript hooks, the platform uses Playwright for targeted integration tests.

## Comparison with Alternative Approaches

### LiveView vs HTMX

HTMX shares LiveView's philosophy of server-rendered interactivity but differs in mechanism: HTMX sends HTML fragments over HTTP requests, while LiveView maintains a persistent WebSocket with DOM diffing. For Prismatic's use case (continuous real-time data streams), LiveView's persistent connection model is substantially more efficient. HTMX would require either polling or a separate WebSocket layer for push updates.

### LiveView vs Hotwire (Turbo + Stimulus)

Rails' Hotwire approach uses Turbo Streams for server-pushed HTML updates and Stimulus for JavaScript behaviors. The key difference is process isolation: each LiveView connection gets a dedicated BEAM process with independent failure handling, while Turbo relies on Action Cable backed by a thread pool. Under high concurrency (10,000+ simultaneous dashboard users), the BEAM's process model scales more predictably than thread-based alternatives.

### LiveView vs Server-Sent Events + React

A hybrid approach using SSE for server push and React for rendering would work but introduces the same bundle size and state synchronization costs as a full SPA. The Prismatic Platform considered this approach early in development and abandoned it because maintaining parallel server and client state models for 15+ dashboard types created an unsustainable maintenance burden.

## Deployment and Scaling Considerations

LiveView connections are stateful -- each user has an associated server process -- which has implications for deployment. The Prismatic Platform uses the following strategies:

1. **Sticky sessions** via load balancer configuration ensure WebSocket reconnections route to the same node
2. **Graceful draining** during deploys allows existing connections to complete before node shutdown
3. **PubSub clustering** via [distributed Erlang](@/glossary/cluster.md) ensures events reach LiveView processes regardless of which node they run on
4. **Connection limits** per node prevent memory exhaustion (configured at 60,000 connections based on benchmarking)

The [supervision tree](@/architecture/supervision-trees.md) for the web application ensures that crashed LiveView processes are automatically restarted, providing the user with a seamless reconnection experience through LiveView's built-in reconnection logic.

## Summary

Phoenix LiveView is not merely a convenience for avoiding JavaScript -- it is an architectural decision that aligns the UI layer with the same process-oriented, fault-tolerant model that governs the rest of the Prismatic Platform. Every dashboard is a supervised process. Every user interaction is a message. Every real-time update flows through the same [PubSub](@/architecture/pubsub.md) infrastructure that coordinates [agents](@/apps/prismatic-agents.md) and [storage adapters](@/architecture/storage-adapters.md). This uniformity reduces cognitive overhead, eliminates entire categories of bugs (client-server state drift, race conditions between user actions and server events), and enables the platform to serve real-time dashboards at scale with a remarkably small codebase.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
