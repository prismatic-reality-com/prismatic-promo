+++
title = "Phoenix LiveView"
weight = 11
[extra]
category = "web-framework"
description = "Server-rendered real-time user interfaces without the complexity of client-side JavaScript frameworks"
url = "https://hexdocs.pm/phoenix_live_view/"
version = "1.0+"
icon = "liveview"
color = "orange"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1314
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Phoenix", "LiveView", "Server-rendered", "JavaScript", "technologies", "web framework", "Prismatic Platform", "WebSocket", "HTML"]
tags = ["technologies", "web-framework", "phoenix-liveview", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Phoenix LiveView - Prismatic Platform"
+++

## Overview

Phoenix LiveView is the real-time UI technology that powers all Prismatic Platform dashboards. It enables rich, interactive user experiences by maintaining a persistent [WebSocket](@/technologies/websockets.md) connection between the server and browser, rendering HTML on the server and efficiently patching the DOM with minimal data transfer. This architecture eliminates the need for a separate JavaScript frontend framework while delivering performance characteristics that match or exceed traditional single-page applications for the platform's use cases.

The Prismatic Platform uses LiveView extensively for its security monitoring dashboards, agent status displays, EASM (External Attack Surface Management) interfaces, and compliance assessment tools. Every interactive view in the platform -- from the Perimeter dashboard showing real-time security ratings to the agent constellation display tracking 404+ agents -- is implemented as a LiveView. The server-side rendering approach means that complex business logic (security calculations, compliance scoring, agent coordination) stays in [Elixir](@/technologies/elixir.md) where it benefits from the [BEAM](@/technologies/beam.md)'s concurrency model, rather than being duplicated in JavaScript.

LiveView's integration with [Phoenix PubSub](@/technologies/pubsub.md) enables multi-user real-time collaboration features where changes made by one user are instantly visible to all connected users. This is critical for the platform's team-based security operations, where multiple analysts may be examining the same attack surface simultaneously and need to see discoveries as they happen.

## Key Features

- **Server-Side Rendering**: HTML rendered on the server with a minimal JavaScript client (~30KB) that handles DOM patching and WebSocket communication
- **Real-Time Updates**: Automatic DOM patching through WebSocket connection -- only changed elements are transmitted, minimizing bandwidth
- **Streams**: Efficient rendering of large collections (agent lists, vulnerability tables) without full re-render using append/prepend operations
- **Function Components**: Stateless components for reusable UI elements with compile-time slot validation and HEEx template syntax
- **Live Components**: Stateful components with their own lifecycle for encapsulating complex interactive widgets
- **Uploads**: Built-in file upload handling with progress tracking, drag-and-drop support, and server-side validation
- **JS Hooks**: Client-side JavaScript interop for third-party libraries like [Three.js](@/technologies/threejs.md) and [Chart.js](@/technologies/chartjs.md)
- **Live Navigation**: SPA-like navigation with `live_patch` and `live_redirect` maintaining the WebSocket connection across page transitions

## Platform Integration

LiveView powers all interactive dashboards across the platform. The Perimeter EASM dashboard demonstrates the typical pattern: mount loads initial data, PubSub subscription enables real-time updates, and stream operations handle efficient list rendering.

```elixir
defmodule PrismaticWeb.PerimeterLive.Index do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "perimeter:updates")
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "perimeter:findings")
    end

    assets = PrismaticPerimeter.list_assets()
    rating = PrismaticPerimeter.current_rating()

    {:ok,
     socket
     |> assign(security_rating: rating, page_title: "Perimeter Dashboard")
     |> stream(:assets, assets)}
  end

  @impl true
  def handle_params(params, _url, socket) do
    {:noreply, apply_filters(socket, params)}
  end

  @impl true
  def handle_info({:asset_discovered, asset}, socket) do
    {:noreply, stream_insert(socket, :assets, asset, at: 0)}
  end

  @impl true
  def handle_info({:rating_changed, new_rating}, socket) do
    {:noreply, assign(socket, :security_rating, new_rating)}
  end

  @impl true
  def handle_event("filter_assets", %{"type" => type}, socket) do
    filtered = PrismaticPerimeter.list_assets(type: type)
    {:noreply, stream(socket, :assets, filtered, reset: true)}
  end
end
```

LiveView components encapsulate reusable UI patterns like the security rating badge used across multiple dashboards:

```elixir
defmodule PrismaticWeb.Components.SecurityRating do
  use Phoenix.Component

  attr :grade, :atom, required: true
  attr :score, :integer, required: true
  attr :class, :string, default: ""

  def security_badge(assigns) do
    ~H"""
    <div class={"rounded-lg p-4 #{grade_bg(@grade)} #{@class}"}>
      <span class="text-4xl font-black text-white"><%= @grade %></span>
      <span class="text-sm text-white/80 ml-2"><%= @score %>/900</span>
    </div>
    """
  end

  defp grade_bg(:A), do: "bg-green-600"
  defp grade_bg(:B), do: "bg-blue-600"
  defp grade_bg(:C), do: "bg-yellow-600"
  defp grade_bg(:D), do: "bg-orange-600"
  defp grade_bg(:F), do: "bg-red-600"
end
```

## Architecture

LiveView sits at the intersection of several platform technologies, serving as the primary interface between users and the platform's backend capabilities.

| Layer | Technology | Role in LiveView Stack |
|-------|-----------|----------------------|
| **Browser** | JavaScript client (phoenix_live_view.js) | DOM patching, event capture, WebSocket management |
| **Transport** | [WebSockets](@/technologies/websockets.md) | Persistent bidirectional connection |
| **Server Process** | LiveView GenServer | State management, event handling, template rendering |
| **Messaging** | [Phoenix PubSub](@/technologies/pubsub.md) | Cross-process real-time event delivery |
| **Styling** | [TailwindCSS](@/technologies/tailwindcss.md) + [Flowbite](@/technologies/flowbite.md) | Utility-first CSS with component library |
| **Interactivity** | [Alpine.js](@/technologies/alpinejs.md) | Client-side state for dropdowns, modals, toggles |
| **3D Visualization** | [Three.js](@/technologies/threejs.md) | WebGL scenes managed via JS Hooks |
| **Data** | [Ecto](@/technologies/ecto.md) + [PostgreSQL](@/technologies/postgresql.md) | Persistent data queries and mutations |

Each LiveView process consumes approximately 40-60KB of memory on the [BEAM](@/technologies/beam.md), meaning the platform can support thousands of concurrent dashboard sessions on a single node.

## Lifecycle and State Management

Understanding the LiveView lifecycle is essential for building performant, correct dashboard implementations. Every LiveView undergoes a two-phase mount: the initial disconnected mount renders static HTML for fast first-paint and SEO, followed by a connected mount that establishes the WebSocket connection and enables real-time interactivity.

The lifecycle callbacks form a predictable state machine:

| Callback | Phase | Purpose | Platform Usage |
|----------|-------|---------|---------------|
| `mount/3` | Both phases | Initialize state, subscribe to topics | Load dashboard data, PubSub subscriptions |
| `handle_params/3` | Connected | URL parameter changes | Filter, sort, and pagination state |
| `handle_event/3` | Connected | User interactions | Button clicks, form submissions, filter changes |
| `handle_info/2` | Connected | External messages | PubSub updates, timer ticks, background job results |
| `render/1` | Both phases | Template rendering | HEEx template with Tailwind classes |

The `assigns` map is the single source of truth for a LiveView's state. The platform follows a strict convention: only data that the template directly renders should be stored in assigns. Derived values are computed in the template or in helper functions, never cached in assigns where they could become stale.

## Streams for Large Collections

LiveView streams are the platform's primary tool for rendering large, dynamic collections without the memory overhead of holding all items in server-side assigns. The agent monitoring dashboard, for instance, displays hundreds of active agents with real-time status updates. Without streams, each status update would re-render the entire agent list. With streams, only the changed agent row is updated in the DOM.

```elixir
# Efficient agent list with stream-based updates
def mount(_params, _session, socket) do
  agents = PrismaticAgents.list_active()
  {:ok, stream(socket, :agents, agents)}
end

def handle_info({:agent_status_changed, agent}, socket) do
  # Only this single agent row is re-rendered and patched
  {:noreply, stream_insert(socket, :agents, agent)}
end

def handle_info({:agent_removed, agent}, socket) do
  {:noreply, stream_delete(socket, :agents, agent)}
end
```

## Security Architecture

LiveView's server-side architecture provides significant security advantages for a platform that handles sensitive intelligence data. Because all state management and business logic execute on the server, there is no client-side JavaScript bundle that could expose API endpoints, data transformation logic, or authorization rules to inspection. The browser receives only rendered HTML and minimal DOM patches, meaning an attacker examining the client-side code gains no insight into the platform's internal data structures or processing pipeline.

This security-by-architecture approach eliminates an entire class of client-side vulnerabilities including XSS attacks on sensitive data rendered in JavaScript state stores. It is a natural fit for a security intelligence platform where data confidentiality is paramount.

## Performance Characteristics

LiveView's server-rendered architecture provides predictable performance characteristics that align with the platform's strict page load requirements.

| Metric | Target | Typical | Notes |
|--------|--------|---------|-------|
| Initial page load | <250ms | 80-150ms | Server-side render + first paint |
| LiveView mount | <150ms | 50-100ms | WebSocket upgrade + initial assign |
| Event handling | <50ms | 5-20ms | `handle_event` callback execution |
| DOM patch size | Minimal | 200B-2KB | Only changed elements transmitted |
| Memory per connection | ~50KB | 40-60KB | BEAM process + assigns state |
| Concurrent connections | 10,000+ | Tested to 5,000 | Per node with 4GB RAM |
| Reconnection time | <2s | ~500ms | Automatic reconnect on network interruption |

## Configuration

```elixir
# config/config.exs
config :prismatic_web, PrismaticWeb.Endpoint,
  live_view: [signing_salt: "generated_salt"],
  pubsub_server: PrismaticWeb.PubSub

# config/dev.exs - LiveView development settings
config :prismatic_web, PrismaticWeb.Endpoint,
  live_reload: [
    patterns: [
      ~r"priv/static/.*(js|css|png|jpeg|svg)$",
      ~r"lib/prismatic_web/(controllers|live|components)/.*(ex|heex)$"
    ]
  ]

# config/prod.exs - Production WebSocket settings
config :prismatic_web, PrismaticWeb.Endpoint,
  live_view: [signing_salt: System.fetch_env!("LIVE_VIEW_SALT")],
  check_origin: ["https://prismatic-prod.fly.dev", "https://prismatic-reality.com"]
```

## Testing LiveView

The platform tests all LiveView modules using the `Phoenix.LiveViewTest` library, which simulates the full WebSocket lifecycle including mount, event handling, and PubSub message delivery. This testing approach validates both the rendered HTML and the state transitions.

```elixir
defmodule PrismaticWeb.PerimeterLiveTest do
  use PrismaticWeb.ConnCase, async: true
  import Phoenix.LiveViewTest

  test "displays security rating on mount", %{conn: conn} do
    {:ok, view, html} = live(conn, "/perimeter")
    assert html =~ "Security Rating"
    assert has_element?(view, "[data-role=security-grade]")
  end

  test "updates when rating changes", %{conn: conn} do
    {:ok, view, _html} = live(conn, "/perimeter")
    send(view.pid, {:rating_changed, %{grade: :A, score: 850}})
    assert render(view) =~ "A"
  end

  test "filters assets by type", %{conn: conn} do
    {:ok, view, _html} = live(conn, "/perimeter")
    view |> element("[data-role=filter-domains]") |> render_click()
    assert has_element?(view, "[data-role=asset-row]")
  end
end
```

## Best Practices

- **Guard PubSub subscriptions with `connected?/1`** -- subscribing during the static render phase (disconnected mount) causes errors and duplicate messages
- **Use streams for large collections** -- rendering 1,000+ items with standard assigns causes expensive full re-renders; streams append/prepend efficiently
- **Keep assigns minimal** -- only assign data that the template actually renders; large unused data structures waste memory across all connected sessions
- **Debounce rapid events** -- form inputs should use `phx-debounce="300"` to prevent flooding the server with keypress events
- **Handle stale state gracefully** -- when a user clicks an action on an item that was concurrently deleted, handle the `{:error, :not_found}` case instead of crashing
- **Use `live_patch` for filter changes** -- URL-based state management through `handle_params/3` enables bookmarkable filtered views and browser back/forward navigation
- **Test with `Phoenix.LiveViewTest`** -- the testing library simulates WebSocket connections and enables assertions on rendered HTML and event handling

## Comparison with Alternatives

| Feature | Phoenix LiveView | React/Next.js | Vue/Nuxt | HTMX |
|---------|-----------------|---------------|----------|------|
| Server rendering | Native | SSR optional | SSR optional | Server-driven |
| JavaScript required | ~30KB client | 100KB+ framework | 80KB+ framework | ~14KB |
| State management | Server-side assigns | Client-side (Redux, etc.) | Client-side (Pinia, etc.) | Server-side |
| Real-time updates | Built-in (WebSocket) | Requires additional setup | Requires additional setup | SSE/WebSocket |
| SEO | Excellent (server HTML) | Requires SSR setup | Requires SSR setup | Excellent |
| Offline support | Limited | Full PWA support | Full PWA support | Limited |
| Learning curve | Low (Elixir knowledge) | Medium-High | Medium | Low |
| Platform fit | Native BEAM integration | Separate frontend service | Separate frontend service | Partial integration |

The Prismatic Platform chose LiveView because it eliminates the operational complexity of maintaining a separate frontend application while providing real-time capabilities natively. The server-side rendering model ensures that security-sensitive business logic never leaves the server.

## Related Technologies

- [Phoenix Framework](@/technologies/phoenix.md) - The base web framework providing routing, endpoints, and channels
- [Phoenix PubSub](@/technologies/pubsub.md) - Real-time messaging backbone for cross-process event delivery
- [WebSockets](@/technologies/websockets.md) - Transport protocol for persistent bidirectional communication
- [Alpine.js](@/technologies/alpinejs.md) - Client-side interactivity complement for dropdowns, modals, and toggles
- [TailwindCSS](@/technologies/tailwindcss.md) - UI styling framework used exclusively in all LiveView templates
- [Flowbite](@/technologies/flowbite.md) - Component library providing pre-built UI patterns
- [ETS](@/technologies/ets.md) - In-memory storage frequently accessed from LiveView processes

## Related Apps

- [prismatic_web](@/apps/prismatic-web.md) - All LiveView dashboards and interactive interfaces
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - EASM LiveView interfaces for security monitoring
- [prismatic_agents](@/apps/prismatic-agents.md) - Agent status dashboards with real-time updates

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)