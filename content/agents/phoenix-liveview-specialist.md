+++
title = "phoenix-liveview-specialist"
weight = 301
[extra]
domain = "development"
level = "L3"
description = "Phoenix LiveView expertise including real-time UI, live components, PubSub, and interactive experiences"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 141
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["phoenix-liveview-specialist", "Phoenix", "LiveView", "PubSub", "agents", "agent", "Prismatic Platform"]
tags = ["agents", "agent", "phoenix-liveview-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "phoenix-liveview-specialist - Prismatic Platform"
+++

## Overview

The phoenix-liveview-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's development domain, providing deep expertise in [Phoenix LiveView](@/glossary/phoenix-liveview.md) for building real-time, interactive user interfaces that run server-side while delivering rich client-side experiences. This agent governs the design and implementation of all [LiveView](@/glossary/liveview.md) components across the platform's dashboards, including the Perimeter EASM dashboard, agent monitoring interfaces, and intelligence visualization tools. Every LiveView implementation must meet strict performance targets: under 150ms for mount, under 50ms for handle_event.

Built on the [AIAD](@/glossary/aiad.md) standard and the [Phoenix](@/glossary/phoenix.md) framework, this agent ensures that all real-time interfaces leverage [OTP](@/glossary/otp.md) concurrency primitives correctly -- each connected user runs in their own [BEAM](@/glossary/beam.md) process with isolated state, [PubSub](@/glossary/pubsub.md) subscriptions drive live updates, and [ETS](@/glossary/ets.md) caching eliminates redundant database queries. The [NO MERCY](@/glossary/no-mercy.md) doctrine applies to UI performance: no LiveView page ships that exceeds the 250ms total page load performance standard.

## Operational Domain

The LiveView development domain covers all real-time web interfaces within the Prismatic Platform, including server-side rendered pages with live updates, interactive dashboards with real-time data streaming, form handling with live validation, and file upload with progress tracking. The agent maintains component libraries, establishes rendering performance baselines, and enforces consistent UI patterns through TailwindCSS and Flowbite component standards.

| Interface Category | LiveView Pattern | Performance Target |
|-------------------|-----------------|-------------------|
| Dashboards | LiveView + PubSub streaming | < 100ms initial render |
| Data Tables | LiveView + live pagination | < 50ms page transition |
| Forms | LiveView + live validation | < 30ms validation feedback |
| Charts | LiveView + JS hooks | < 200ms chart update |
| File Uploads | LiveView uploads | Progress events < 100ms |
| Search | LiveView + debounced input | < 150ms result display |

## Key Capabilities

- **Real-time dashboard architecture** -- Designs LiveView dashboards that efficiently stream live data updates through Phoenix PubSub, minimizing DOM patches and maximizing rendering performance
- **Live component design** -- Creates reusable, stateful LiveView components with proper lifecycle management, efficient assigns tracking, and isolated update scoping
- **[PubSub](@/glossary/pubsub.md) integration** -- Implements publish-subscribe patterns for live data streaming, ensuring that dashboard updates are pushed to connected clients with minimal latency
- **Performance optimization** -- Profiles and optimizes LiveView rendering performance through techniques including temporary assigns, stream collections, assign_async, and targeted DOM patching
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed performance analysis and optimization recommendations
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing LiveView mount times, event handling latency, and rendering performance metrics

## LiveView Architecture Patterns

```elixir
defmodule PrismaticWeb.PerimeterLive.Dashboard do
  @moduledoc """
  Real-time Perimeter EASM dashboard with live security
  rating updates and asset discovery streaming.
  """

  use PrismaticWeb, :live_view

  alias PrismaticPerimeter.{SecurityRating, AssetDiscovery}

  @impl Phoenix.LiveView
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "perimeter:updates")
      schedule_refresh()
    end

    {:ok,
     socket
     |> assign(:page_title, "Perimeter Dashboard")
     |> assign(:rating, nil)
     |> assign(:assets_count, 0)
     |> assign_async(:security_rating, fn ->
       {:ok, %{security_rating: SecurityRating.current()}}
     end)
     |> stream(:recent_assets, AssetDiscovery.recent(limit: 50))}
  end

  @impl Phoenix.LiveView
  def handle_info({:asset_discovered, asset}, socket) do
    {:noreply, stream_insert(socket, :recent_assets, asset, at: 0)}
  end

  @impl Phoenix.LiveView
  def handle_info({:rating_updated, rating}, socket) do
    {:noreply, assign(socket, :rating, rating)}
  end

  @impl Phoenix.LiveView
  def handle_info(:refresh, socket) do
    schedule_refresh()
    {:noreply, assign(socket, :assets_count, AssetDiscovery.count())}
  end

  defp schedule_refresh, do: Process.send_after(self(), :refresh, 30_000)
end
```

### Live Component with Isolated State

```elixir
defmodule PrismaticWeb.Components.SecurityRatingBadge do
  @moduledoc """
  Reusable live component displaying security rating with
  real-time grade updates and color-coded visualization.
  """

  use Phoenix.LiveComponent

  @impl Phoenix.LiveComponent
  def update(assigns, socket) do
    {:ok,
     socket
     |> assign(assigns)
     |> assign(:color_class, grade_color(assigns[:grade]))}
  end

  @impl Phoenix.LiveComponent
  def render(assigns) do
    ~H"""
    <div class={"rounded-lg p-4 #{@color_class}"}>
      <span class="text-3xl font-bold"><%= @grade %></span>
      <span class="text-sm text-gray-400">Score: <%= @score %>/900</span>
    </div>
    """
  end

  defp grade_color(:A), do: "bg-green-900/50 text-green-400"
  defp grade_color(:B), do: "bg-blue-900/50 text-blue-400"
  defp grade_color(:C), do: "bg-yellow-900/50 text-yellow-400"
  defp grade_color(:D), do: "bg-orange-900/50 text-orange-400"
  defp grade_color(_), do: "bg-red-900/50 text-red-400"
end
```

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to define LiveView architecture standards, approve component designs, and enforce performance targets across all platform interfaces.

## Performance Standards

| Metric | Hard Limit | Measurement |
|--------|-----------|-------------|
| Total page load | < 250ms | Browser navigation timing |
| Server-side render | < 100ms | Telemetry mount duration |
| LiveView mount | < 150ms | Connected mount callback |
| handle_event | < 50ms | Event handler execution |
| PubSub update | < 30ms | Message to DOM patch |
| Health check | < 10ms | Endpoint response time |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/liveview performance` | Analyze LiveView performance metrics across all dashboards | L3+ |
| `/liveview components` | List all live components with usage counts and performance data | L3+ |
| `/liveview optimize` | Generate optimization recommendations for slow LiveView pages | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [performance-benchmarking-agent](@/agents/performance-benchmarking-agent.md) | Validates LiveView performance against established benchmarks |
| [code-quality-commander](@/agents/code-quality-commander.md) | Enforces code quality standards on LiveView implementations |
| [service-mesh-specialist](@/agents/service-mesh-specialist.md) | Coordinates WebSocket connection routing for LiveView sessions |
| [database-performance-specialist](@/agents/database-performance-specialist.md) | Optimizes database queries within LiveView data loading paths |

## Hot Code Reload Integration

LiveView development leverages [hot code reload](@/glossary/hot-code-reload.md) for rapid development iteration. The specialist ensures that live code reloading does not disrupt active user sessions -- state is preserved across reloads through proper socket assign management, and connected clients receive seamless updates without page refreshes. This capability is critical for the platform's development velocity.

## Performance Optimization Techniques

The phoenix-liveview-specialist employs several optimization techniques to maintain sub-250ms page load performance across all platform dashboards.

### Temporary Assigns

For large data sets that are only needed during initial render, the specialist uses temporary assigns (`assign(socket, :large_data, data, temporary_assigns: [large_data: []])`) to prevent the data from being held in process memory after the initial render. This is critical for dashboards that load large asset inventories or historical data sets during mount -- without temporary assigns, the process memory for each connected user would grow proportionally to the data volume.

### Stream Collections

For lists that update frequently (real-time event feeds, asset discovery streams), the specialist uses LiveView streams instead of regular assigns. Streams maintain a client-side DOM representation that can be incrementally updated through `stream_insert`, `stream_delete`, and `stream_reset` operations, eliminating the need to send the entire collection on each update. This reduces both server-side memory (the server does not hold the full list) and network bandwidth (only changes are transmitted).

### Assign Async

For data that requires time-consuming computation or external service calls (security rating calculations, compliance assessments), the specialist uses `assign_async` to load data asynchronously after the initial page render. This allows the page to render immediately with a loading placeholder, then populate the data when it becomes available. Assign async operations run in supervised tasks, ensuring that failures in async data loading do not crash the LiveView process.

### Targeted DOM Patching

The specialist carefully structures LiveView templates to minimize the DOM diff size on updates. Each updatable section is isolated in its own DOM element with a unique `id`, enabling LiveView's morphdom algorithm to limit patches to only the changed elements. For data tables, each row has a unique `id` attribute that enables row-level patching rather than full table re-rendering.

## Component Design Standards

The specialist maintains a component library of reusable LiveView components that follow consistent patterns across all platform dashboards. Components are categorized as **stateless function components** (for pure presentation), **stateful live components** (for interactive elements with their own lifecycle), and **slot-based layouts** (for structural composition). Every component includes performance annotations documenting expected render time and memory footprint.

All components follow TailwindCSS-first styling using Flowbite design patterns. Custom CSS is prohibited per platform standards. Components use TailwindCSS utility classes exclusively, with dark mode classes applied directly (no `dark:` prefix required since the platform enforces dark mode globally through the `class="dark"` attribute on the root HTML element).

## WebSocket Connection Management

Each connected LiveView user maintains a WebSocket connection to the server. The specialist implements connection management best practices including heartbeat monitoring (detecting disconnected clients), connection recovery (automatic reconnection with state restoration), and connection pooling (limiting the total number of concurrent WebSocket connections per server node). The connection limit is configured based on available memory and CPU resources, with graceful degradation (new connections are queued rather than rejected) when limits are approached.

## Enforcement

All LiveView implementations comply with the [NO MERCY](@/glossary/no-mercy.md) doctrine: no page exceeding the 250ms load target ships to production, components without performance telemetry are rejected, and all LiveView pages require Benchee performance tests before merge. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that performance measurements are reproducible and statistically significant, using P95 latency percentiles rather than averages. TailwindCSS-first styling is mandatory per platform standards.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)