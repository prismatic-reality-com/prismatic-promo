+++
title = "Prismatic Web"
weight = 7
[extra]
icon = "monitor"
color = "indigo"
description = "LiveView dashboards with TailwindCSS and Flowbite components"
category = "Frontend"
files = "567"
status = "Production"
port = "4000"
keywords = ["Phoenix LiveView dashboards", "real-time web application", "TailwindCSS Flowbite components", "server-rendered reactivity", "security monitoring dashboard", "WebSocket DOM diffing", "HAWKEYE visitor intelligence", "Perimeter EASM dashboard"]
tags = ["web", "liveview", "dashboard", "frontend"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1432
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Web - Prismatic Platform"
+++

## Abstract

Prismatic Web is the primary user-facing application of the Prismatic Platform, delivering real-time interactive dashboards through [Phoenix LiveView](@/glossary/phoenix-liveview.md) with server-rendered reactivity, styled exclusively with [TailwindCSS](@/glossary/tailwindcss.md) utilities and [Flowbite](@/glossary/flowbite.md) components. The application hosts four major dashboard modules -- [HAWKEYE](@/glossary/hawkeye.md) (visitor intelligence), Perimeter (external [attack surface](@/glossary/attack-surface.md) management), Quality (platform health), and Agents (AI agent management) -- each implemented as a self-contained LiveView module with independent state management, [PubSub](@/glossary/pubsub.md)-driven data updates, and component-level memoization. The architecture enforces a strict design system: no inline styles, no custom CSS, and no client-side JavaScript frameworks. All interactivity is managed through LiveView's [WebSocket](@/glossary/websocket.md)-based communication, achieving sub-100ms initial page loads and sub-10ms incremental updates through minimal DOM diffing. The application serves as the operational command center for security analysts, compliance officers, and platform operators.

## 1. Introduction

### 1.1 Problem Statement

An intelligence platform generating continuous streams of security assessments, visitor profiles, compliance data, and agent activity requires a real-time operational interface that updates without manual page refreshes. Traditional server-rendered applications require full page reloads to display new data, while single-page JavaScript applications introduce client-side complexity, state synchronization challenges, and a second codebase to maintain. The gap between backend capability and frontend presentation creates operational latency where analysts view stale data.

Phoenix LiveView eliminates this gap by maintaining a persistent WebSocket connection between browser and server, pushing DOM diffs in real time as backend state changes. Prismatic Web exploits this architecture to deliver dashboards that reflect platform state within milliseconds of changes, without requiring any custom JavaScript.

### 1.2 Design Goals

1. **Server-rendered reactivity** -- all UI state managed on the server via LiveView processes, eliminating client-side state management complexity.
2. **TailwindCSS-first design system** -- all styling through utility classes with Flowbite components, enforcing visual consistency.
3. **Sub-100ms initial load** -- optimized asset delivery with component memoization for fast first paint.
4. **Real-time data push** -- PubSub-driven updates to dashboards as backend events occur.
5. **Responsive design** -- mobile-first layouts with breakpoint-based adaptations for tablet and desktop.
6. **Accessibility compliance** -- WCAG 2.1 AA conformance across all dashboard components.

### 1.3 Scope

Prismatic Web covers the web presentation layer: LiveView modules, component library, routing, asset pipeline, and design system. It does not implement business logic, which resides in domain-specific applications. The web application delegates all computation to backend services and renders their results.

## 2. Architecture

### 2.1 System Design

```
Browser (WebSocket)
       |
  Phoenix Endpoint (port 4000)
       |
  Router → LiveView Modules
       |
  +----+----+----+----+
  |    |    |    |    |
  HAWKEYE  Perimeter  Quality  Agents
  Live     Live       Live     Live
  |    |    |    |    |
  Component Tree (Function Components)
       |
  PubSub Subscriptions ← Backend Events
       |
  DOM Diff → Browser Update (<10ms)
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticWeb.Endpoint` | Phoenix endpoint: HTTP listener, WebSocket transport, static asset serving |
| `PrismaticWeb.Router` | Route definitions mapping URL paths to LiveView modules |
| `PrismaticWeb.DashboardLive` | Main dashboard LiveView with platform overview [metrics](@/glossary/metrics.md) |
| `PrismaticWeb.PerimeterLive` | [EASM](@/glossary/easm.md) dashboard: [security rating](@/glossary/security-rating.md)s, asset inventory, compliance |
| `PrismaticWeb.HawkeyeLive` | Visitor intelligence: live feed, geographic map, risk distribution |
| `PrismaticWeb.QualityLive` | Platform health: quality score, domain violations, trend charts |
| `PrismaticWeb.AgentsLive` | Agent management: [registry](@/glossary/registry-otp.md) browser, execution history, circuit states |
| `PrismaticWeb.Components` | Reusable function components: cards, tables, charts, metrics |
| `PrismaticWeb.Layouts` | Application and root layouts with navigation and theme support |

### 2.3 Process Topology

```
PrismaticWeb.Application (Supervisor, :one_for_one)
+-- PrismaticWeb.Endpoint (Phoenix.Endpoint)
|     HTTP/WebSocket listener on port 4000
|     Static file serving from priv/static/
+-- PrismaticWeb.Telemetry (Telemetry.Metrics.ConsoleReporter)
|     Request latency, WebSocket connections, LiveView mount metrics
+-- PrismaticWeb.Presence (Phoenix.Presence)
      Tracks connected users for real-time collaboration indicators
```

Each LiveView module spawns a server-side process per connected client. These processes subscribe to relevant PubSub topics and push DOM diffs when backend state changes. Process lifecycle is managed by the endpoint [supervisor](@/glossary/supervisor.md), with automatic cleanup on WebSocket disconnection.

### 2.4 Data Flow

A browser navigates to a dashboard URL. The router resolves the LiveView module, which mounts with initial state loaded from backend services. The LiveView process subscribes to PubSub topics relevant to its dashboard domain. When backend events occur (new visitor profiled, security rating updated, quality score changed), PubSub broadcasts reach the LiveView process, which updates its assigns and pushes a minimal DOM diff to the browser. The browser applies the diff without a full page reload.

## 3. Implementation

### 3.1 Key Algorithms

**Component Memoization**. Function components accept assigns and render HEEx templates. LiveView's diff engine compares previous and current assigns; if assigns are unchanged, the component output is skipped entirely. This optimization reduces DOM diff computation for static dashboard sections.

**PubSub Fan-Out**. Each dashboard subscribes to specific topics. The HAWKEYE dashboard subscribes to `"hawkeye:visitor_update"` and `"hawkeye:threat_detected"`. The Perimeter dashboard subscribes to `"perimeter:rating_update"` and `"perimeter:asset_discovered"`. This selective subscription prevents unnecessary updates across unrelated dashboards.

### 3.2 Data Structures

```elixir
defmodule PrismaticWeb.DashboardLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "platform:metrics")
    end

    {:ok,
     assign(socket,
       page_title: "Dashboard",
       quality_score: PrismaticSafety.quality_score(),
       active_visitors: PrismaticVisitorIntelligence.active_count(),
       agent_count: PrismaticAgents.active_count(),
       recent_alerts: PrismaticSignals.recent(limit: 10)
     )}
  end

  @impl true
  def handle_info({:metrics_update, metrics}, socket) do
    {:noreply, assign(socket, metrics)}
  end
end
```

### 3.3 API Surface

```elixir
# Route structure
scope "/", PrismaticWeb do
  pipe_through [:browser, :require_auth]

  live "/", DashboardLive, :index
  live "/perimeter", PerimeterLive, :index
  live "/perimeter/assets", PerimeterLive, :assets
  live "/perimeter/compliance", PerimeterLive, :compliance
  live "/perimeter/easm", PerimeterLive, :easm
  live "/hawkeye", HawkeyeLive, :index
  live "/agents", AgentsLive, :index
  live "/quality", QualityLive, :index
end

# Reusable component API
~H"""
<.dashboard_card title="Security Rating" icon="shield">
  <.rating_badge grade={@rating.grade} score={@rating.score} />
  <.trend_indicator direction={@rating.trend} />
</.dashboard_card>

<.data_table
  id="assets"
  rows={@assets}
  columns={[:domain, :type, :risk_score, :last_seen]}
  sort_by={@sort_by}
  filter={@filter}
  page={@page}
/>
```

### 3.4 Configuration

```elixir
config :prismatic_web, PrismaticWeb.Endpoint,
  url: [host: "localhost"],
  http: [port: 4000],
  live_view: [signing_salt: "..."],
  pubsub_server: PrismaticWeb.PubSub,
  render_errors: [view: PrismaticWeb.ErrorView],
  watchers: [
    esbuild: {Esbuild, :install_and_run, [:default, ~w(--sourcemap=inline --watch)]},
    tailwind: {Tailwind, :install_and_run, [:default, ~w(--watch)]}
  ]

config :prismatic_web,
  # Design system
  theme: :dark,
  font_family: "JetBrains Mono",
  color_scheme: :prismatic_default,

  # Performance
  live_view_timeout: 30_000,
  static_cache_max_age: 86400,

  # Dashboard refresh intervals
  dashboard_refresh: :timer.seconds(5),
  hawkeye_refresh: :timer.seconds(2),
  quality_refresh: :timer.seconds(10)
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Auth](@/apps/prismatic-auth.md) | Session authentication and [RBAC](@/glossary/rbac.md) permission checks |
| [Prismatic HAWKEYE](@/apps/prismatic-hawkeye.md) | Visitor intelligence data for HAWKEYE dashboard |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Security ratings and asset data for Perimeter dashboard |
| [Prismatic Safety](@/apps/prismatic-safety.md) | Quality metrics for Quality dashboard |
| [Prismatic Agents](@/apps/prismatic-agents.md) | [Agent registry](@/glossary/agent-registry.md) and execution data for Agents dashboard |
| [Prismatic Telemetry](@/apps/prismatic-telemetry.md) | Request and LiveView performance metrics |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic HAWKEYE](@/apps/prismatic-hawkeye.md) | Dashboard hosting for visitor intelligence LiveView |
| [Prismatic Perimeter Web](@/apps/prismatic-perimeter-web.md) | EASM dashboard components |
| [Prismatic API](@/apps/prismatic-api.md) | SwaggerUI hosting and API documentation |

### 4.3 Inter-Process Communication

LiveView processes communicate with backend services through direct function calls for initial data loading and through Phoenix PubSub for real-time updates. No [GenServer](@/glossary/genserver.md) [message passing](@/glossary/message-passing.md) is used in the rendering path, minimizing latency. Presence tracking uses Phoenix.Presence for connected user visibility.

### 4.4 External Integrations

The asset pipeline integrates with esbuild for JavaScript bundling and the Tailwind CLI for CSS compilation. Static assets are served from `priv/static/` with cache-busting fingerprints. The Flowbite component library is included as a Tailwind plugin.

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Initial page load | < 100ms | Server-rendered HTML with inline critical CSS |
| LiveView mount | < 50ms | WebSocket upgrade and initial state push |
| Incremental DOM update | < 10ms | Minimal diff computation and patch application |
| Static asset delivery | < 5ms | Pre-compressed with CDN cache headers |
| WebSocket reconnection | < 200ms | Automatic reconnection with state recovery |

### 5.2 Scalability

Each connected client maintains one LiveView server process. Memory per LiveView process is approximately 50-100KB depending on dashboard state. A single node supports thousands of concurrent LiveView connections. Horizontal scaling is achieved through [load balancing](@/glossary/load-balancing.md) with session affinity for WebSocket connections.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 256 MB | 1 GB (with 500+ concurrent users) |
| CPU | 2 cores | 4 cores |
| Network | Port 4000 | Low bandwidth (DOM diffs are bytes, not kilobytes) |

## 6. Testing Strategy

### 6.1 Unit Tests

Function components are tested with `Phoenix.Component.render_component/2` to verify correct HTML output for given assigns. Component tests cover all variants, responsive breakpoints, and accessibility attributes.

### 6.2 Integration Tests

LiveView integration tests use `Phoenix.LiveViewTest` to simulate full mount, interaction, and PubSub-driven update cycles. Tests verify that dashboard data loads correctly, filtering and sorting work, and real-time updates appear without page reload.

### 6.3 Property-Based Testing

StreamData generators produce random dashboard state (varying numbers of assets, visitors, agents) to verify that LiveView rendering never crashes regardless of data volume, and that DOM diffs remain bounded in size.

## 7. Security Considerations

### 7.1 Threat Model

Cross-site scripting is the primary web application threat. Phoenix LiveView mitigates XSS by default through automatic HTML escaping in HEEx templates. Content Security Policy headers restrict script sources. WebSocket connections are authenticated via the session token established during HTTP handshake.

### 7.2 Access Control

All routes pass through the `:require_auth` pipeline, which validates the user session via [Prismatic Auth](@/apps/prismatic-auth.md). Individual dashboard sections enforce additional permissions: HAWKEYE requires `hawkeye_read`, Perimeter requires `perimeter_read`, and Agents requires `agents_read`. Unauthorized access renders a 403 error page.

## 8. Operational Considerations

### 8.1 Deployment

Prismatic Web deploys as part of the umbrella [release](@/glossary/release.md), listening on port 4000. Static assets are compiled during the release build process with `mix assets.deploy`. The application requires no external services beyond the backend applications it renders data from.

### 8.2 Monitoring

[Telemetry](@/glossary/telemetry.md) events cover HTTP request latency (`[:phoenix, :endpoint, :stop]`), LiveView mount time (`[:phoenix, :live_view, :mount, :stop]`), and WebSocket message processing (`[:phoenix, :live_view, :handle_event, :stop]`). Metrics are exported to the [Prismatic Telemetry](@/apps/prismatic-telemetry.md) pipeline.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Dashboard not updating | PubSub subscription missing | Verify `connected?/1` guard in mount |
| Slow initial load | Large dataset in mount | Paginate data; defer non-critical loads |
| WebSocket disconnections | Proxy timeout configuration | Increase WebSocket idle timeout |
| Stale CSS after deploy | Asset cache not busted | Verify `mix assets.deploy` ran |

## 9. Future Work

Planned enhancements include server-side chart rendering with SVG components, multi-user collaborative dashboards with shared cursor indicators, customizable dashboard layouts with drag-and-drop widget placement, offline mode with service worker caching, and progressive web application support for mobile installation.

## References

- [Phoenix LiveView](https://hexdocs.pm/phoenix_live_view/) -- Server-rendered reactive interfaces
- [TailwindCSS](https://tailwindcss.com/) -- Utility-first CSS framework
- [Flowbite](https://flowbite.com/) -- Component library for TailwindCSS
- [Prismatic HAWKEYE](@/apps/prismatic-hawkeye.md) -- Visitor intelligence system
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) -- EASM and security ratings
- [Prismatic Auth](@/apps/prismatic-auth.md) -- Authentication and access control

## Related Agents

- [Elixir Architect](@/agents/elixir-architect.md) -- Designs the LiveView process topology, PubSub subscription patterns, and component memoization strategies
- [API Design Specialist Agent](@/agents/api-design-specialist-agent.md) -- Ensures dashboard data interfaces and route structures follow consistent API design patterns
- [Deployment Commander Agent](@/agents/deployment-commander-agent.md) -- Orchestrates asset pipeline builds, static file deployment, and production release configuration

## Related Capabilities

- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- LiveView WebSocket connections delivering sub-10ms incremental DOM updates across all dashboards
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Request latency, LiveView mount time, and WebSocket message processing metrics
- [Quality Gates](@/capabilities/quality-gates.md) -- TailwindCSS-first design system enforcement with zero inline styles and WCAG 2.1 AA compliance

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)