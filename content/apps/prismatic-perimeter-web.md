+++
title = "Prismatic Perimeter Web"
weight = 44
[extra]
icon = "presentation-chart-bar"
color = "rose"
description = "LiveView dashboard for EASM - security ratings, asset inventory, and compliance views"
category = "Security"
files = "280"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1181
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Perimeter", "Web", "LiveView", "EASM", "apps", "Security", "Prismatic Platform", "PrismaticPerimeterWeb", "Compliance"]
tags = ["apps", "security", "prismatic-perimeter-web", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Perimeter Web - Prismatic Platform"
+++

## Overview

[Prismatic Perimeter](/glossary/prismatic-perimeter/) Web provides the [LiveView](/glossary/liveview/)-based dashboard for [External Attack Surface Management](/glossary/easm/). It presents [security rating](/glossary/security-rating/)s, asset inventories, compliance assessments, and risk trend visualizations through real-time interactive interfaces that update automatically as new intelligence is collected. The dashboard enables security teams to monitor their organization's external attack surface without manual refresh cycles.

The interface is structured around four primary views: the overview dashboard with summary [metrics](/glossary/metrics/) and grade displays, the asset inventory with filtering, sorting, and drill-down capabilities, the compliance assessment view with framework-level and article-level detail, and the advanced EASM view for power users requiring full analytical access. Each view renders server-side through [Phoenix LiveView](/glossary/phoenix-liveview/), delivering a rich interactive experience without the complexity of a client-side JavaScript framework.

All visualization components are built with [TailwindCSS](/glossary/tailwindcss/) and [Flowbite](/glossary/flowbite/), following the platform's design system for consistent styling across dashboard applications. Security rating gauges, asset topology maps, compliance heatmaps, and risk trend charts are server-rendered with minimal JavaScript, ensuring fast load times and accessibility compliance.

## Architecture

```
Prismatic Perimeter Core (Business Logic)
        | PubSub Events
Perimeter Web LiveView Processes
        | WebSocket Push
Browser Dashboard (Server-Rendered HTML)
        |
TailwindCSS + Flowbite Components + Chart.js
```

Each dashboard session runs as an independent LiveView process under [OTP](/glossary/otp/) supervision. Real-time updates flow through [PubSub](/glossary/pubsub/) subscriptions, so security rating changes, new asset discoveries, and compliance status updates appear instantly across all connected operator sessions.

The server-side rendering architecture provides critical security advantages for an EASM dashboard. No sensitive security rating data needs to be serialized to JSON and sent to a client-side framework -- the server computes the HTML diff and pushes only changed bytes over the [WebSocket](/glossary/websocket/) connection, minimizing the risk of intelligence data exposure in client-side state.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticPerimeterWeb` | Web application entry point and router configuration |
| `PrismaticPerimeterWeb.DashboardLive` | Overview dashboard with security grade gauge and summary metrics |
| `PrismaticPerimeterWeb.AssetsLive` | Asset inventory with multi-criteria filtering, sorting, and drill-down |
| `PrismaticPerimeterWeb.ComplianceLive` | Compliance assessment detail views with article-level gap analysis |
| `PrismaticPerimeterWeb.EasmLive` | Advanced EASM view with full analytical controls and raw data access |
| `PrismaticPerimeterWeb.Components` | Shared LiveView components for gauges, charts, heatmaps, and data tables |
| `PrismaticPerimeterWeb.RatingGauge` | Animated security rating gauge component with grade transitions |
| `PrismaticPerimeterWeb.ComplianceHeatmap` | Framework coverage heatmap with drill-down capability |

## Key Features

### Dashboard Views

The overview dashboard provides immediate situational awareness with the security grade prominently displayed alongside key metrics:

```elixir
defmodule PrismaticPerimeterWeb.DashboardLive do
  use PrismaticPerimeterWeb, :live_view

  @impl true
  def mount(_params, session, socket) do
    if connected?(socket) do
      PrismaticPerimeter.subscribe(:rating_updates)
      PrismaticPerimeter.subscribe(:asset_discoveries)
      PrismaticPerimeter.subscribe(:compliance_changes)
    end

    {:ok, assign(socket,
      rating: load_current_rating(),
      assets: load_asset_summary(),
      compliance: load_compliance_status(),
      trends: load_rating_trends()
    )}
  end

  @impl true
  def handle_info({:rating_updated, new_rating}, socket) do
    {:noreply, assign(socket,
      rating: new_rating,
      trends: update_trends(socket.assigns.trends, new_rating)
    )}
  end

  @impl true
  def handle_info({:asset_discovered, asset}, socket) do
    assets = update_asset_summary(socket.assigns.assets, asset)
    {:noreply, assign(socket, assets: assets)}
  end
end
```

- Overview dashboard with security grade gauge and key metrics summary
- Asset inventory with multi-criteria filtering, sorting, and bulk operations
- Compliance assessment detail views with article-level gap analysis
- Security rating history with trend lines and trajectory projections

### Real-Time Updates

| Event Type | Source | Update Latency | Dashboard Effect |
|------------|--------|---------------|-----------------|
| Rating change | Rating engine | < 100ms | Grade gauge animation, trend chart update |
| Asset discovery | Scanner pipeline | < 200ms | Asset count increment, inventory update |
| Compliance change | Compliance engine | < 150ms | Heatmap cell update, gap list refresh |
| Vulnerability found | Detection engine | < 100ms | Risk indicator, vulnerability count |

- LiveView [WebSocket](/glossary/websocket/) connections for sub-second update delivery
- Real-time asset discovery notifications as scanners complete
- Live security rating changes reflected immediately on grade gauge
- Compliance status change alerts with severity indicators

### Visualization Components

- Security rating gauge with animated grade transitions and numeric score display
- Asset topology map showing infrastructure relationships and service dependencies
- [Compliance framework](/glossary/compliance-framework/) coverage heatmap with drill-down to article-level detail
- Risk trend charts with configurable time windows and overlay comparison

### Compliance Assessment Views

The compliance view provides hierarchical detail from framework-level overview down to individual article requirements:

| View Level | Content | Interaction |
|------------|---------|-------------|
| Framework overview | Overall compliance score per framework | Click to expand |
| Article list | Per-article compliance status with gap indicators | Click for detail |
| Article detail | Requirements, evidence, and remediation recommendations | Evidence links |
| Evidence view | Source data supporting compliance determination | Provenance chain |

### Asset Inventory Filtering

The asset inventory view supports multi-criteria filtering that enables security teams to quickly isolate specific asset categories, risk levels, or discovery sources. Filter state is maintained in the LiveView socket assigns, and filter changes trigger server-side re-query with immediate DOM updates through WebSocket push. The filtering engine supports compound conditions combining asset type, risk severity, discovery date range, and scanner source:

```elixir
defmodule PrismaticPerimeterWeb.AssetsLive do
  use PrismaticPerimeterWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket), do: PrismaticPerimeter.subscribe(:asset_discoveries)

    {:ok, assign(socket,
      assets: PrismaticPerimeter.list_assets(limit: 50),
      filters: %{type: :all, severity: :all, source: :all},
      sort_by: :discovered_at,
      sort_order: :desc,
      page: 1
    )}
  end

  @impl true
  def handle_event("apply_filters", params, socket) do
    filters = %{
      type: parse_filter(params["type"], :all),
      severity: parse_filter(params["severity"], :all),
      source: parse_filter(params["source"], :all)
    }
    assets = PrismaticPerimeter.filter_assets(filters, limit: 50, page: 1)
    {:noreply, assign(socket, assets: assets, filters: filters, page: 1)}
  end
end
```

### Security Rating Grade Scale

The security rating gauge translates numeric scores into letter grades following an industry-standard scale that enables quick comparative assessment across monitored organizations:

| Grade | Score Range | Interpretation | Visual Color |
|-------|-------------|---------------|-------------|
| A | 810 - 900 | Excellent security posture, minimal exposure | Green |
| B | 720 - 809 | Good posture with minor improvement opportunities | Blue |
| C | 630 - 719 | Moderate risk, several areas require attention | Yellow |
| D | 540 - 629 | Below average, significant remediation required | Orange |
| F | 300 - 539 | Critical risk, immediate intervention necessary | Red |

Grade transitions are animated using CSS transitions on the gauge component, providing visual feedback when security posture changes. The numeric score, letter grade, and industry percentile ranking are all displayed simultaneously to give operators both absolute and relative context for the assessment.

## Routes

| Route | View |
|-------|------|
| `/perimeter` | Main dashboard overview with grade and summary metrics |
| `/perimeter/assets` | Asset inventory with filtering and detail panels |
| `/perimeter/compliance` | Compliance assessment with [NIS2](/glossary/nis2/) and [ZKB](/glossary/zkb/) detail |
| `/perimeter/easm` | Advanced EASM view with full analytical controls |

## Usage

```elixir
# LiveView mount subscribes to real-time events
def mount(_params, session, socket) do
  if connected?(socket) do
    PrismaticPerimeter.subscribe(:rating_updates)
    PrismaticPerimeter.subscribe(:asset_discoveries)
    PrismaticPerimeter.subscribe(:compliance_changes)
  end

  {:ok, assign(socket,
    rating: load_current_rating(),
    assets: load_asset_summary(),
    compliance: load_compliance_status()
  )}
end

# Handle asset filtering
def handle_event("filter_assets", %{"type" => type, "status" => status}, socket) do
  filtered = PrismaticPerimeter.filter_assets(type: type, status: status)
  {:noreply, assign(socket, assets: filtered)}
end

# Handle compliance drill-down
def handle_event("show_article", %{"framework" => fw, "article" => art}, socket) do
  detail = PrismaticPerimeterCore.article_detail(fw, art)
  {:noreply, assign(socket, article_detail: detail, show_detail: true)}
end
```

## NABLA Compliance

| NABLA Axiom | Perimeter Web Enforcement | Implementation |
|-------------|--------------------------|----------------|
| Provenance Mandatory | Every displayed data point traceable to source evidence | Rating dimensions link to underlying evidence with source attribution |
| Signal Plurality | Multi-source evidence indicated in dashboard views | Source count displayed per rating dimension and compliance article |
| Time Decay | Data freshness visually indicated on all dashboard elements | Timestamp indicators and staleness warnings on widgets |
| Source Independence | Independent PubSub channels per data type | Rating, asset, and compliance events use separate subscription channels |

## Testing

LiveView tests verify component rendering, PubSub event handling, and WebSocket state management across all four dashboard views. Route tests verify authentication and [RBAC](/glossary/rbac/) enforcement on all perimeter paths. Component tests verify correct rendering of security rating gauges, compliance heatmaps, and risk trend charts with known data fixtures.

Integration tests exercise the full pipeline from [Prismatic Perimeter Core](/apps/prismatic-perimeter-core/) rating computation through PubSub delivery to LiveView DOM updates. Performance tests verify that dashboard mount time stays under 150ms and event processing under 50ms.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Perimeter Core](/apps/prismatic-perimeter-core/) | Business logic for rating computation and compliance assessment |
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Orchestration layer for discovery and scanning workflows |
| [Prismatic Web](/apps/prismatic-web/) | Host Phoenix application providing layout and authentication |
| [Prismatic Auth](/apps/prismatic-auth/) | Authentication and [RBAC](/glossary/rbac/) enforcement for dashboard access |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Dashboard performance metrics and monitoring |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Dashboard mount | < 150ms | Initial page load with rating, assets, compliance |
| Asset inventory mount | < 100ms | Paginated asset list with filtering |
| Compliance view mount | < 120ms | Framework overview with article list |
| PubSub event to DOM update | < 50ms | Server-rendered HTML diff push |
| WebSocket round-trip | < 100ms | Server push to browser render |
| Rating gauge animation | < 200ms | CSS transition on grade change |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :perimeter_web, :page_load]`, `[:prismatic, :perimeter_web, :event_processed]`, `[:prismatic, :perimeter_web, :compliance_viewed]`.

## Related Resources

- [Prismatic Hawkeye Web](/apps/prismatic-hawkeye-web/) -- Sibling dashboard for visitor intelligence, sharing design patterns
- [Prismatic IR PVM Web](/apps/prismatic-ir-pvm-web/) -- [Incident response](/glossary/incident-response/) dashboard with similar architecture
- [Elixir Architect](/agents/elixir-architect/) -- Designs the OTP process topology for LiveView dashboard sessions and PubSub event handling
- [API Design Specialist Agent](/agents/api-design-specialist-agent/) -- Ensures dashboard data interfaces follow consistent API patterns
- [Alert Management Specialist](/agents/alert-management-specialist/) -- Manages real-time alert notification delivery to connected dashboard sessions
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- LiveView WebSocket connections delivering sub-second security rating and asset discovery updates
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Dashboard performance metrics including mount time, WebSocket latency, and DOM diff size
- [Quality Gates](/capabilities/quality-gates/) -- TailwindCSS-first design system enforcement and component accessibility compliance

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)