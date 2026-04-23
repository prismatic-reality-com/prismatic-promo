+++
title = "Prismatic Hawkeye Web"
weight = 68
[extra]
icon = "eye"
color = "emerald"
description = "Visitor intelligence dashboard with real-time analytics and behavioral tracking"
category = "Intelligence"
files = "210"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1061
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Hawkeye", "Web", "Visitor", "apps", "Intelligence", "Prismatic Platform", "PrismaticHawkeyeWeb", "WebSocket", "PubSub"]
tags = ["apps", "intelligence", "prismatic-hawkeye-web", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Hawkeye Web - Prismatic Platform"
+++

## Overview

Prismatic [Hawkeye](/glossary/hawkeye/) Web provides the [LiveView](/glossary/liveview/)-based dashboard for the HAWKEYE visitor intelligence system. It renders real-time visitor analytics, behavioral pattern visualizations, threat indicator alerts, and entity intelligence gathered from web traffic analysis -- all delivered through server-rendered HTML with [WebSocket](/glossary/websocket/)-driven live updates that require zero client-side JavaScript frameworks.

The dashboard transforms raw visitor data from [Prismatic Hawkeye](/apps/prismatic-hawkeye/) into actionable intelligence views. Operators can drill down from aggregate traffic patterns to individual visitor sessions, examining technology fingerprints, geographic origins, and behavioral classifications. The threat view surfaces bot activity, credential stuffing attempts, and reconnaissance patterns in real time, enabling immediate response to active threats.

Built entirely with [TailwindCSS](/glossary/tailwindcss/) and [Flowbite](/glossary/flowbite/) components, the interface follows the platform's design standards for consistency across all dashboard applications. Every component leverages [Phoenix LiveView](/glossary/phoenix-liveview/)'s efficient DOM diffing to minimize bandwidth usage while maintaining sub-second update latency. The architecture ensures that no sensitive visitor intelligence data is exposed in client-side JavaScript state -- the server computes HTML diffs and pushes only changed bytes over the WebSocket connection, maintaining both performance and security.

## Architecture

```
Prismatic Hawkeye (Backend)
        | PubSub Events
Hawkeye Web LiveView Processes
        | WebSocket Push
Browser Dashboard (Server-Rendered HTML)
        |
TailwindCSS + Flowbite Components
```

Each connected dashboard session runs as an independent LiveView process supervised under [OTP](/glossary/otp/). The [PubSub](/glossary/pubsub/) system broadcasts visitor events to all connected sessions, ensuring every operator sees identical real-time data without polling overhead.

The LiveView architecture provides several advantages for an intelligence dashboard. Server-side rendering means that no visitor data needs to be serialized to JSON and sent to a client-side framework -- the server computes the HTML diff and pushes only the changed bytes over the WebSocket connection. This reduces both bandwidth consumption and the risk of sensitive intelligence data being exposed in client-side JavaScript state.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticHawkeyeWeb` | Web application entry point and router configuration |
| `PrismaticHawkeyeWeb.DashboardLive` | Main intelligence dashboard with summary metrics |
| `PrismaticHawkeyeWeb.VisitorsLive` | Visitor detail view with session history and fingerprints |
| `PrismaticHawkeyeWeb.ThreatsLive` | Active threat indicators and bot detection display |
| `PrismaticHawkeyeWeb.AnalyticsLive` | Analytics, reporting, and trend analysis views |
| `PrismaticHawkeyeWeb.Components` | Shared LiveView components for charts, tables, and indicators |
| `PrismaticHawkeyeWeb.Components.ThreatIndicator` | Severity-colored threat card component with confidence display |
| `PrismaticHawkeyeWeb.Components.VisitorCard` | Visitor summary card with fingerprint and geographic data |

## Key Features

### Real-Time Dashboard
- Live visitor count with geographic distribution maps updated in real time
- Behavioral pattern visualization with clustering overlays showing visitor segments
- Threat indicator alerts with severity-based color coding and escalation actions
- Technology stack fingerprinting display (OS, browser, libraries, frameworks)

### Dashboard Mount and Event Handling

The main dashboard subscribes to multiple PubSub channels on mount, receiving real-time updates for visitor events, threat alerts, and analytics changes:

```elixir
defmodule PrismaticHawkeyeWeb.DashboardLive do
  use PrismaticHawkeyeWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      PrismaticHawkeye.subscribe(:visitor_events)
      PrismaticHawkeye.subscribe(:threat_alerts)
      PrismaticHawkeye.subscribe(:analytics_updates)
    end

    {:ok, assign(socket,
      visitors: load_recent_visitors(),
      threats: load_active_threats(),
      stats: load_dashboard_stats(),
      visitor_count: PrismaticHawkeye.active_visitor_count()
    )}
  end

  @impl true
  def handle_info({:visitor_event, event}, socket) do
    visitors = update_visitor_list(socket.assigns.visitors, event)
    stats = recalculate_stats(visitors)
    count = socket.assigns.visitor_count + visitor_count_delta(event)
    {:noreply, assign(socket, visitors: visitors, stats: stats, visitor_count: count)}
  end
end
```

### Analytics Views
- Visitor segmentation by behavior patterns and risk profile with drill-down capability
- Geographic heatmap of access origins with drill-down by region and country
- Temporal access pattern analysis with hourly and daily aggregations for trend identification
- Bot vs. human traffic classification with confidence scores and evidence links

### Intelligence Reports
- Entity-specific intelligence summaries with threat timeline and behavioral history
- Automated threat briefings generated from detection rules with severity prioritization
- Periodic analytics reports with configurable delivery schedules and distribution lists
- Custom dashboard configurations saved per operator for personalized intelligence views

### Threat Detection Views

The threat detection views provide real-time visibility into malicious activity patterns. Each threat indicator is displayed with its classification, confidence level, source evidence, and recommended response action.

| Threat Type | Detection Method | Alert Level |
|-------------|------------------|-------------|
| Bot Activity | Behavioral fingerprinting | Medium-High |
| Credential Stuffing | Login velocity analysis | Critical |
| Reconnaissance | Path traversal patterns | High |
| API Abuse | Rate pattern analysis | Medium |
| Data Scraping | Content access patterns | Medium |

```elixir
# LiveView component for threat indicator display
defmodule PrismaticHawkeyeWeb.Components.ThreatIndicator do
  use Phoenix.Component

  attr :threat, :map, required: true
  attr :class, :string, default: ""

  def threat_card(assigns) do
    ~H"""
    <div class={"rounded-lg border p-4 #{severity_class(@threat.severity)} #{@class}"}>
      <div class="flex items-center justify-between">
        <span class="font-semibold"><%= @threat.type %></span>
        <span class="text-sm"><%= @threat.confidence %>% confidence</span>
      </div>
      <p class="mt-2 text-sm text-gray-400"><%= @threat.description %></p>
    </div>
    """
  end
end
```

### Visitor Session Detail

The visitor detail view provides comprehensive session reconstruction, showing every page visited, interaction timing, and behavioral signals that contributed to classification decisions:

| Data Point | Source | Update Frequency |
|------------|--------|------------------|
| Page navigation | Server-side route tracking | Real-time |
| Technology fingerprint | User-agent + JS feature detection | On session start |
| Geographic origin | IP geolocation with ISP data | On session start |
| Behavioral classification | ML model scoring | Every 30 seconds |
| Risk assessment | Multi-signal fusion | On each event |

## Routes

| Route | View |
|-------|------|
| `/hawkeye` | Main intelligence dashboard with summary [metrics](/glossary/metrics/) |
| `/hawkeye/visitors` | Visitor details, session history, and fingerprints |
| `/hawkeye/threats` | Active threat indicators and bot detection |
| `/hawkeye/analytics` | Analytics, reporting, and trend analysis |

## Usage

The web interface is served via Phoenix LiveView with real-time [WebSocket](/glossary/websocket/) updates. Access is controlled through the platform's authentication and [RBAC](/glossary/rbac/) system.

```elixir
# LiveView mount with real-time subscription
def mount(_params, session, socket) do
  if connected?(socket) do
    PrismaticHawkeye.subscribe(:visitor_events)
    PrismaticHawkeye.subscribe(:threat_alerts)
  end

  {:ok, assign(socket, visitors: [], threats: [], stats: load_stats())}
end

# Handle incoming visitor events via PubSub
def handle_info({:visitor_event, event}, socket) do
  visitors = update_visitor_list(socket.assigns.visitors, event)
  stats = recalculate_stats(visitors)
  {:noreply, assign(socket, visitors: visitors, stats: stats)}
end

# Handle threat alerts with severity-based routing
def handle_info({:threat_alert, alert}, socket) do
  threats = [alert | socket.assigns.threats] |> Enum.take(100)
  {:noreply, assign(socket, threats: threats)}
end
```

## NABLA Compliance

| NABLA Axiom | Hawkeye Web Enforcement | Implementation |
|-------------|------------------------|----------------|
| Provenance Mandatory | Every displayed data point traceable to source event | Visitor events carry full provenance chain from collection to display |
| Signal Plurality | Multiple behavioral signals combined for threat classification | Bot detection uses fingerprinting, velocity, and pattern signals |
| Time Decay | Dashboard timestamps reflect data freshness | Stale data indicators on widgets when events stop arriving |
| Source Independence | Independent PubSub channels per data type | Visitor events and threat alerts use separate subscription channels |
| Contradiction Preservation | Conflicting classification signals displayed together | Both bot and human indicators shown when signals disagree |

## Testing

LiveView tests verify component rendering, PubSub event handling, and WebSocket state management. Route tests verify authentication and RBAC enforcement on all dashboard paths. Component tests verify correct rendering of threat indicators, visitor cards, and analytics charts with known data fixtures.

Integration tests exercise the full pipeline from backend event emission through PubSub delivery to LiveView DOM updates. Performance tests verify that dashboard mount time stays under 150ms and event processing under 50ms as required by the platform's page load performance standard.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Hawkeye](/apps/prismatic-hawkeye/) | Backend intelligence engine providing all visitor data |
| [Prismatic Web](/apps/prismatic-web/) | Host Phoenix application and shared layout components |
| [Prismatic Visitor Intelligence](/apps/prismatic-visitor-intelligence/) | Deep visitor analysis and classification |
| [Prismatic Detection Engine](/apps/prismatic-detection-engine/) | Rule-based threat detection driving alert views |
| [Prismatic Auth](/apps/prismatic-auth/) | Authentication and RBAC for dashboard access control |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Dashboard mount | < 150ms | Initial page load with data |
| Event processing | < 50ms | PubSub to DOM update |
| WebSocket round-trip | < 100ms | Server push to browser render |
| Analytics query | < 200ms | Aggregated data computation |
| Threat alert display | < 50ms | From detection to visual indicator |
| Visitor detail load | < 120ms | Session history with fingerprints |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :hawkeye_web, :page_load]`, `[:prismatic, :hawkeye_web, :event_processed]`, `[:prismatic, :hawkeye_web, :threat_displayed]`.

## Related Resources

- [Prismatic Perimeter Web](/apps/prismatic-perimeter-web/) -- Sibling dashboard for [EASM](/glossary/easm/), sharing design patterns
- [Prismatic Telemetry](/apps/prismatic-telemetry/) -- Metrics collection powering dashboard performance monitoring
- [Elixir Architect](/agents/elixir-architect/) -- Ensures LiveView processes follow OTP supervision patterns
- [Alert Management Specialist](/agents/alert-management-specialist/) -- Configures threat indicator alerting and notification delivery
- [API Design Specialist Agent](/agents/api-design-specialist-agent/) -- Reviews PubSub event interface between backend and dashboard
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Powers live visitor analytics with sub-second update latency
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Tracks dashboard performance metrics
- [Quality Gates](/capabilities/quality-gates/) -- Validates LiveView component rendering and design consistency

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)