+++
title = "LiveView"
weight = 16
[extra]
category = "framework"
subcategory = "web-framework"
description = "Phoenix real-time UI framework enabling server-rendered interactive interfaces over WebSockets without custom JavaScript"
keywords = ["liveview", "phoenix", "real-time", "websocket", "server-rendering", "elixir", "genserver", "interactive-ui"]
related_terms = ["otp", "genserver", "flowbite", "easm", "channel", "endpoint", "phoenix", "pubsub", "heex", "livecomponent"]
complexity = "intermediate"
implementation_guide = "yes"
code_examples = "yes"
best_practices = "yes"
use_cases = ["real-time-dashboards", "interactive-forms", "live-updates", "collaborative-interfaces"]
prerequisites = ["phoenix", "elixir-otp", "websockets", "html-css"]
learning_path = ["phoenix-basics", "genserver", "pubsub", "component-architecture"]
difficulty = "intermediate"
time_to_learn = "2-3 weeks"
industry_usage = "high"
pattern_type = "ui-framework"
architecture_layer = "presentation"
quality_gates = ["performance", "memory-usage", "connection-stability", "ux-responsiveness"]
testing_approach = ["live-view-testing", "component-testing", "integration-testing"]
monitoring = ["connection-count", "render-time", "memory-per-connection"]
scalability = "high"
server_features = ["server-side-rendering", "dom-diffing", "state-management", "event-handling"]
client_features = ["dom-patching", "form-handling", "navigation", "hooks"]
real_time_patterns = ["pubsub-subscriptions", "periodic-updates", "event-streaming"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1016
date_created = "2026-02-23"
date_modified = "2026-02-23"
tags = ["glossary", "framework", "liveview", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "LiveView - Prismatic Platform"
+++

## Definition

LiveView is a [Phoenix](@/glossary/phoenix.md) framework feature that enables rich, real-time user interfaces rendered entirely on the server and delivered over [WebSocket](@/glossary/websocket.md) connections. Unlike traditional Single Page Applications (SPAs) that run JavaScript frameworks like React or Vue in the browser, LiveView maintains all UI state on the server as an Elixir process, sending minimal DOM diffs to the client for efficient updates. This architecture eliminates the need for separate frontend and backend codebases while providing a responsive, interactive experience that rivals client-side frameworks.

The core insight behind LiveView is that modern network latencies (typically 10-50ms for most users) are fast enough that server-rendered updates feel instantaneous for the vast majority of UI interactions. By keeping state on the server, LiveView eliminates entire categories of frontend engineering problems: state synchronization between client and server, API versioning, client-side caching invalidation, and the security implications of running business logic in the browser. The trade-off is a persistent WebSocket connection per user session and slightly higher server memory usage compared to stateless HTTP request handling.

LiveView was created by Chris McCord (also the creator of Phoenix) and first released in 2019. It has since evolved into a comprehensive framework for building interactive web applications, with features including live navigation (SPA-like page transitions without full page reloads), file uploads with real-time progress, and a component system that supports both stateless function components and stateful LiveComponents with their own lifecycle.

## How LiveView Works

Understanding LiveView's internal mechanics is essential for building performant applications and debugging unexpected behavior.

### The Connection Lifecycle

When a user navigates to a LiveView route, two separate renders occur:

1. **Static HTML render** (HTTP): The initial page load renders the LiveView as static HTML on the server and sends it to the browser. This ensures the page is visible immediately, is SEO-friendly, and works even before the WebSocket connects.

2. **Live render** (WebSocket): Once the page loads, the browser's LiveView JavaScript client establishes a WebSocket connection. The server spawns a dedicated [GenServer](@/glossary/genserver.md) process for this connection and performs a second mount, this time with the `connected?` check returning true. From this point forward, all interactions happen over the WebSocket.

```elixir
defmodule PrismaticWeb.PerimeterDashboardLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "perimeter:updates")
      Process.send_after(self(), :refresh_metrics, 30_000)
    end

    {:ok,
     socket
     |> assign(:assets, PrismaticPerimeter.list_assets())
     |> assign(:security_rating, PrismaticPerimeter.current_rating())
     |> assign(:page_title, "Perimeter Dashboard")}
  end

  @impl true
  def handle_event("scan_domain", %{"domain" => domain}, socket) do
    case PrismaticPerimeter.initiate_scan(domain) do
      {:ok, _scan} ->
        {:noreply, put_flash(socket, :info, "Scan initiated for #{domain}")}
      {:error, reason} ->
        {:noreply, put_flash(socket, :error, "Scan failed: #{reason}")}
    end
  end

  @impl true
  def handle_info(:refresh_metrics, socket) do
    Process.send_after(self(), :refresh_metrics, 30_000)
    {:noreply, assign(socket, :security_rating, PrismaticPerimeter.current_rating())}
  end

  @impl true
  def handle_info(%{type: :asset_discovered} = event, socket) do
    {:noreply, update(socket, :assets, fn assets -> [event.asset | assets] end)}
  end
end
```

### DOM Diffing and Patching

When server-side state changes (via `handle_event`, `handle_info`, or `handle_params`), LiveView re-renders the template, computes the difference between the previous and current rendered output, and sends only the changed portions to the browser:

| Rendering Phase | What Happens |
|----------------|-------------|
| **State Change** | `assign/2` or `update/2` modifies the socket's assigns |
| **Re-render** | LiveView calls `render/1`, which evaluates the HEEx template |
| **Diff Computation** | LiveView compares static and dynamic parts of the template output |
| **Transport** | Only changed dynamic parts are sent as a compact JSON payload |
| **Client Patch** | The JavaScript client applies DOM patches using morphdom |

The key optimization is that HEEx templates separate static HTML (sent once) from dynamic content (tracked per-change). A template with 1,000 lines of HTML but one dynamic value will only transmit the changed value, not the surrounding markup.

## Architecture

```
Browser <-- WebSocket --> Phoenix.Endpoint --> LiveView Process (GenServer)
                                                      |
                                                      v
                                              render/1 (HEEx template)
                                                      |
                                                      v
                                              DOM diff --> Browser patch
```

Each LiveView connection spawns a dedicated server-side process (GenServer) that:

1. Manages the view's state (assigns)
2. Handles user events (clicks, form submissions, keyboard input)
3. Subscribes to [PubSub](@/glossary/pubsub.md) topics for real-time updates from other processes
4. Re-renders and sends DOM diffs on state changes
5. Monitors connection health and cleans up on disconnect

Because each LiveView is a BEAM process, it benefits from all of [BEAM](@/glossary/beam.md)'s properties: [fault isolation](@/glossary/process-isolation.md) (one user's crashed view does not affect others), preemptive scheduling (no single view can block others), and per-process garbage collection (GC pauses are bounded per-view).

## LiveComponents

LiveView provides two component models for organizing UI code:

### Function Components (Stateless)

Function components are pure functions that receive assigns and return HEEx markup. They have no lifecycle, no state, and no process -- they are simply reusable template fragments.

```elixir
defmodule PrismaticWeb.Components.SecurityBadge do
  use Phoenix.Component

  attr :grade, :atom, required: true
  attr :score, :integer, required: true

  def security_badge(assigns) do
    ~H"""
    <span class={"inline-flex items-center rounded-full px-3 py-1 text-sm font-medium #{grade_color(@grade)}"}>
      <%= @grade %> (<%= @score %>)
    </span>
    """
  end

  defp grade_color(:A), do: "bg-green-100 text-green-800"
  defp grade_color(:B), do: "bg-blue-100 text-blue-800"
  defp grade_color(:C), do: "bg-yellow-100 text-yellow-800"
  defp grade_color(grade) when grade in [:D, :F], do: "bg-red-100 text-red-800"
end
```

### Stateful LiveComponents

Stateful LiveComponents have their own state, lifecycle callbacks (`update/2`, `handle_event/3`), and can be targeted by events independently from the parent LiveView:

```elixir
defmodule PrismaticWeb.Components.AssetTableLive do
  use PrismaticWeb, :live_component

  @impl true
  def update(assigns, socket) do
    {:ok,
     socket
     |> assign(assigns)
     |> assign(:sort_by, :risk_score)
     |> assign(:sort_order, :desc)}
  end

  @impl true
  def handle_event("sort", %{"column" => column}, socket) do
    column = String.to_existing_atom(column)
    order = if socket.assigns.sort_by == column, do: toggle_order(socket.assigns.sort_order), else: :asc
    sorted = Enum.sort_by(socket.assigns.assets, &Map.get(&1, column), order)
    {:noreply, assign(socket, sort_by: column, sort_order: order, assets: sorted)}
  end
end
```

## HEEx Templates and Hooks

HEEx (HTML + EEx) is LiveView's template engine, designed specifically for server-rendered real-time UIs. It provides compile-time validation of HTML structure, component calls, and attribute types:

```elixir
~H"""
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <.card :for={asset <- @assets} class="p-4">
    <h3 class="text-lg font-semibold"><%= asset.domain %></h3>
    <.security_badge grade={asset.grade} score={asset.score} />
    <button phx-click="scan" phx-value-id={asset.id} class="mt-2 btn-primary">
      Rescan
    </button>
  </.card>
</div>
"""
```

### JavaScript Hooks

For interactions that require client-side behavior (drag-and-drop, third-party JavaScript libraries, clipboard access), LiveView provides a Hooks API:

```javascript
let Hooks = {};
Hooks.ClipboardCopy = {
  mounted() {
    this.el.addEventListener("click", () => {
      const text = this.el.dataset.copyValue;
      navigator.clipboard.writeText(text);
      this.pushEvent("copied", { value: text });
    });
  }
};
```

## Context in Prismatic

LiveView powers all of the Prismatic Platform's real-time dashboards. The platform enforces [TailwindCSS](@/glossary/tailwindcss.md)-first styling with [Flowbite](@/glossary/flowbite.md) components for all LiveView templates, explicitly forbidding inline styles and custom CSS.

### Dashboard Routes

| Route | LiveView Module | Description |
|-------|----------------|-------------|
| `/` | `DashboardLive` | Main platform dashboard with system overview |
| `/perimeter` | `PerimeterLive` | [EASM](@/glossary/easm.md) overview with security ratings |
| `/perimeter/assets` | `PerimeterAssetsLive` | Asset inventory with filtering and sorting |
| `/perimeter/compliance` | `PerimeterComplianceLive` | NIS2/ZKB compliance assessment |
| `/perimeter/easm` | `PerimeterEASMLive` | Advanced EASM dashboard with drill-down |

### Real-Time Update Patterns

The Prismatic Platform uses three patterns for pushing updates to LiveView dashboards:

| Pattern | Mechanism | Use Case |
|---------|-----------|----------|
| **PubSub broadcast** | `Phoenix.PubSub.broadcast/3` | Multi-user updates (new asset discovered, alert triggered) |
| **Process.send_after** | Scheduled self-messages | Periodic metric refresh (every 30s) |
| **handle_info callback** | Direct process messaging | Agent status updates, scan completion notifications |

## Performance Considerations

LiveView's server-side rendering model introduces specific performance characteristics:

| Consideration | Guidance |
|---------------|----------|
| **Assign minimization** | Only store data needed for rendering in socket assigns |
| **Temporary assigns** | Use `temporary_assigns` for large lists that need not persist in memory |
| **Stream API** | Use `stream/3` for efficiently managing large collections |
| **Debouncing** | Use `phx-debounce` on form inputs to reduce server roundtrips |
| **Component granularity** | Use LiveComponents to scope re-renders to changed sections |
| **PubSub selectivity** | Subscribe only to topics the current view needs |

```elixir
# Streams: efficient append/prepend without keeping full list in memory
def mount(_params, _session, socket) do
  {:ok, stream(socket, :assets, PrismaticPerimeter.list_assets())}
end
```

## Related Terms

- [Phoenix](@/glossary/phoenix.md) - Web framework that LiveView is built into
- [GenServer](@/glossary/genserver.md) - Behavior underlying each LiveView process
- [BEAM](@/glossary/beam.md) - Virtual machine providing process isolation for LiveView
- [WebSocket](@/glossary/websocket.md) - Transport protocol for LiveView connections
- [PubSub](@/glossary/pubsub.md) - Distributed messaging for real-time LiveView updates
- [Channel](@/glossary/channel.md) - Alternative real-time communication layer in Phoenix
- [Flowbite](@/glossary/flowbite.md) - Component library used with LiveView in Prismatic
- [TailwindCSS](@/glossary/tailwindcss.md) - Utility CSS framework for LiveView templates
- [EASM](@/glossary/easm.md) - External attack surface module with LiveView dashboards
- [Process Isolation](@/glossary/process-isolation.md) - Crash containment per LiveView connection
- [Plug](@/glossary/plug.md) - Middleware layer that routes requests to LiveView
- [Endpoint](@/glossary/endpoint.md) - Phoenix entry point managing WebSocket upgrades

## See Also

- [prismatic_web](../../../apps/prismatic_web/README.md) -- Main LiveView application serving platform dashboards
- [prismatic_perimeter_web](../../../apps/prismatic_perimeter_web/README.md) -- Perimeter EASM LiveView dashboards
- [prismatic_hawkeye_web](../../../apps/prismatic_hawkeye_web/README.md) -- HAWKEYE visitor intelligence LiveView
- [prismatic_ir_pvm_web](../../../apps/prismatic_ir_pvm_web/README.md) -- PVM incident response LiveView
- [Architecture](@/architecture/_index.md) -- Platform architecture
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- System reliability through process isolation
- [Observability](@/glossary/observability.md) -- Monitoring LiveView performance via telemetry

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)