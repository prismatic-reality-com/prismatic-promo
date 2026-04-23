+++
title = "Phoenix LiveView"
weight = 7
[extra]
description = "Server-rendered reactive UI framework for real-time dashboards"
category = "architecture"
related_terms = ["tailwindcss", "flowbite", "umbrella-application", "elixir", "telemetry", "genserver"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1000
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Phoenix", "LiveView", "Server-rendered", "glossary", "architecture", "Prismatic Platform", "WebSocket", "Server", "PubSub", "Client"]
tags = ["glossary", "architecture", "phoenix-liveview", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Phoenix LiveView - Prismatic Platform"
+++

## Definition

Phoenix LiveView is a server-rendered reactive UI framework built on the Phoenix web framework and Elixir/OTP. It enables rich, real-time user interfaces without writing client-side JavaScript by maintaining a persistent WebSocket connection between the browser and server. DOM updates are computed server-side as minimal diffs and sent over the wire, providing instant interactivity with server-side state management. LiveView represents a paradigm shift from the JavaScript-heavy single-page application (SPA) model, returning rendering responsibility to the server while maintaining the interactive experience users expect from modern web applications.

LiveView was introduced by Chris McCord in 2018 and has since become the primary UI framework for Phoenix applications. Its architecture leverages the BEAM virtual machine's lightweight process model -- each connected user session runs in its own isolated process with independent garbage collection, crash isolation, and access to the full server-side application state. This eliminates the impedance mismatch between client and server that characterizes traditional SPA architectures, where business logic must be duplicated across both layers.

## Overview

Traditional web application architectures force a choice between server-rendered pages (fast initial load, poor interactivity) and client-rendered SPAs (rich interactivity, complex build toolchains, duplicated logic, poor SEO). LiveView eliminates this tradeoff by rendering HTML on the server and sending only the changed portions over a persistent WebSocket connection.

When a user first visits a LiveView page, the server renders a complete HTML response (enabling search engine indexing and fast first paint). The browser then establishes a WebSocket connection, and subsequent interactions (clicks, form submissions, keyboard events) are sent to the server as lightweight messages. The server processes the event, updates its state, re-renders the affected template portions, and sends a compressed diff of the changed HTML back to the browser. The client-side JavaScript library applies these diffs to the DOM, completing the update cycle in milliseconds.

This architecture provides several structural advantages: business logic exists in exactly one place (the server), authentication and authorization are enforced at the same layer as rendering, and real-time features like live updates and presence tracking come naturally from the underlying PubSub infrastructure rather than requiring additional WebSocket plumbing.

## Technical Details

### LiveView Lifecycle

```
Browser Request (HTTP GET)
    |
    v
mount/3 (disconnected) -- Server renders static HTML
    |
    v
HTML Response sent to browser (SEO-friendly, fast first paint)
    |
    v
Browser connects WebSocket
    |
    v
mount/3 (connected) -- Process spawned for this session
    |
    v
handle_params/3 -- URL parameters processed
    |
    v
render/1 -- Initial render via HEEx template
    |
    +--> User interacts (click, type, submit)
    |        |
    |        v
    |    handle_event/3 -- Server processes event
    |        |
    |        v
    |    State updated via assign/3
    |        |
    |        v
    |    render/1 -- Re-render, diff computed
    |        |
    |        v
    |    Diff sent over WebSocket (~bytes)
    |        |
    |        v
    |    Browser patches DOM
    |
    +--> External event (PubSub broadcast)
    |        |
    |        v
    |    handle_info/2 -- Process receives message
    |        |
    |        v
    |    (same render/diff/patch cycle)
    |
    +--> Navigation (live_patch / live_redirect)
             |
             v
         handle_params/3 -- URL updated without full page load
```

### Core Callbacks

```elixir
defmodule PrismaticWeb.PerimeterLive do
  use PrismaticWeb, :live_view

  alias PrismaticPerimeter.{AssetDiscovery, SecurityRating}

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "perimeter:alerts")
      send(self(), :load_initial_data)
    end

    {:ok,
     assign(socket,
       page_title: "Perimeter Dashboard",
       assets: [],
       security_rating: nil,
       loading: true,
       filter: %{severity: :all, type: :all}
     )}
  end

  @impl true
  def handle_params(%{"domain" => domain}, _uri, socket) do
    {:noreply,
     socket
     |> assign(:selected_domain, domain)
     |> load_domain_data(domain)}
  end

  def handle_params(_params, _uri, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_event("filter_assets", %{"severity" => severity}, socket) do
    filter = %{socket.assigns.filter | severity: String.to_existing_atom(severity)}
    filtered = apply_filter(socket.assigns.all_assets, filter)

    {:noreply,
     socket
     |> assign(:filter, filter)
     |> assign(:assets, filtered)}
  end

  @impl true
  def handle_event("scan_domain", %{"domain" => domain}, socket) do
    case AssetDiscovery.initiate_scan(domain) do
      {:ok, scan_id} ->
        {:noreply,
         socket
         |> put_flash(:info, "Scan initiated: #{scan_id}")
         |> assign(:scanning, true)}

      {:error, reason} ->
        {:noreply, put_flash(socket, :error, "Scan failed: #{reason}")}
    end
  end

  @impl true
  def handle_info({:new_vulnerability, alert}, socket) do
    {:noreply,
     socket
     |> update(:alerts, fn alerts -> [alert | Enum.take(alerts, 99)] end)
     |> put_flash(:warning, "New vulnerability: #{alert.title}")}
  end

  def handle_info(:load_initial_data, socket) do
    {:noreply,
     socket
     |> assign(:assets, AssetDiscovery.list_assets())
     |> assign(:security_rating, SecurityRating.current())
     |> assign(:loading, false)}
  end
end
```

### HEEx Templates and Components

LiveView uses HEEx (HTML + Embedded Elixir) templates with function components for reusable UI elements:

```elixir
defmodule PrismaticWeb.Components.SecurityBadge do
  use Phoenix.Component

  attr :grade, :atom, required: true, values: [:a, :b, :c, :d, :f]
  attr :score, :integer, required: true

  def security_badge(assigns) do
    ~H"""
    <div class={[
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold",
      grade_color(@grade)
    ]}>
      <span class="mr-1"><%= String.upcase(to_string(@grade)) %></span>
      <span class="text-xs opacity-75"><%= @score %></span>
    </div>
    """
  end

  defp grade_color(:a), do: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  defp grade_color(:b), do: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  defp grade_color(:c), do: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  defp grade_color(:d), do: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
  defp grade_color(:f), do: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
end
```

### LiveView Streams for Large Datasets

LiveView streams provide efficient handling of large collections without holding all items in memory:

```elixir
@impl true
def mount(_params, _session, socket) do
  {:ok,
   socket
   |> stream(:assets, AssetDiscovery.list_assets(limit: 50))
   |> assign(:page, 1)}
end

@impl true
def handle_event("load_more", _params, socket) do
  page = socket.assigns.page + 1
  assets = AssetDiscovery.list_assets(limit: 50, offset: (page - 1) * 50)

  {:noreply,
   socket
   |> stream(:assets, assets)
   |> assign(:page, page)}
end
```

## Implementation in Prismatic Platform

The Prismatic Platform uses Phoenix LiveView for all interactive dashboards, with the `prismatic_web` application serving as the primary user-facing interface on port 4000:

**Perimeter EASM Dashboard** (`/perimeter`): Real-time security posture monitoring with live-updating security ratings, asset counts, and vulnerability alerts. PubSub integration delivers instant updates when new assets are discovered or vulnerabilities detected.

**Asset Inventory** (`/perimeter/assets`): Filterable, sortable asset list using LiveView streams for efficient rendering of large asset inventories. Supports inline actions for asset tagging, risk override, and scan initiation.

**Compliance Assessment** (`/perimeter/compliance`): NIS2 and ZKB compliance dashboards with drill-down into specific requirements, gap analysis, and remediation tracking.

**Agent Monitoring**: Live status display of all 434 AIAD agents with health indicators, message throughput metrics, and error rate visualization.

All LiveView templates adhere to the TailwindCSS-first mandate, using TailwindCSS utility classes and Flowbite components exclusively with zero inline styles or custom CSS.

## Comparison with Alternatives

| Framework | Rendering | State Management | Real-time | Bundle Size | Learning Curve |
|-----------|-----------|-----------------|-----------|-------------|----------------|
| **Phoenix LiveView** | Server | Server (assigns) | Built-in (WebSocket) | ~30KB JS | Moderate (Elixir) |
| **React** | Client | Client (Redux/Context) | Requires WebSocket lib | 40-200KB+ | Moderate-High |
| **Next.js** | Server + Client | Both (hydration) | Requires WebSocket lib | 80-300KB+ | High |
| **htmx** | Server | Server | WebSocket extension | ~14KB | Low |
| **Svelte** | Client (compiled) | Client (stores) | Requires WebSocket lib | 5-50KB | Low-Moderate |
| **Blazor Server** | Server | Server (SignalR) | Built-in (SignalR) | ~100KB | Moderate (.NET) |

LiveView's primary advantage is eliminating the client-server state synchronization problem entirely. React, Svelte, and other client-side frameworks require developers to manage data fetching, caching, optimistic updates, and error handling on the client. LiveView moves all state to the server, accessed through standard Elixir data structures with full OTP fault tolerance.

## Best Practices

**Minimize Assigns**: Only store data in assigns that the template actually renders. Large assigns that change frequently cause unnecessary diff computation and wire transfer.

**Use Streams for Collections**: For lists that grow or paginate, use `stream/3` instead of regular assigns. Streams track items by ID and send only insertions and deletions, not the full collection.

**Debounce User Input**: Use `phx-debounce` on text inputs to avoid sending events on every keystroke. A 300ms debounce is appropriate for search fields; form validation can use shorter intervals.

**Connected Check**: Use `connected?(socket)` in `mount/3` to defer expensive operations (PubSub subscriptions, data loading) to the WebSocket connection phase, keeping the initial HTTP render fast.

**Temporary Assigns**: For data that is rendered once and not needed afterward (like flash messages or one-time notifications), use `assign_new/3` or temporary assigns to free memory after rendering.

**Component Extraction**: Extract reusable UI patterns into function components. Components are the LiveView equivalent of React components -- composable, testable, and parameterized via attributes.

## Use Cases

**Real-Time Dashboards**: Security monitoring, system health, and operational dashboards that need live-updating metrics without manual refresh. PubSub integration delivers instant updates to all connected users.

**Interactive Data Exploration**: Asset inventories, log viewers, and search interfaces where filtering, sorting, and pagination happen without full page reloads.

**Form-Heavy Applications**: Multi-step forms with server-side validation, dynamic field visibility, and real-time error feedback -- all without client-side JavaScript.

**Collaborative Features**: Multi-user editing, shared dashboards, and presence indicators using Phoenix Presence for CRDT-based distributed user tracking.

**Admin Interfaces**: Back-office tools that need rich interactivity but do not justify the complexity of a full SPA with separate API backend.

## Related Concepts

- [TailwindCSS](@/glossary/tailwindcss.md) - Mandatory styling framework for LiveView templates
- [Flowbite](@/glossary/flowbite.md) - Component library used in LiveView UIs
- [Phoenix](@/glossary/phoenix.md) - Web framework providing LiveView's HTTP and WebSocket infrastructure
- [GenServer](@/glossary/genserver.md) - OTP process backing each LiveView session
- [PubSub](@/glossary/pubsub.md) - Real-time event distribution for live-updating dashboards
- [Telemetry](@/glossary/telemetry.md) - Instrumentation for LiveView performance monitoring
- [Elixir](@/glossary/elixir.md) - The language powering server-side LiveView logic
- [Umbrella Application](@/glossary/umbrella-application.md) - Project structure housing the web application

## See Also

- [Technologies](@/technologies/_index.md) - Technology stack details
- [Architecture](@/architecture/_index.md) - Platform architecture overview

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)