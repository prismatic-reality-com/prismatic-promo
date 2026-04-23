+++
title = "Dashboard"
description = "Dashboards are real-time visual interfaces that aggregate, display, and enable interaction with system metrics, operational data, and business intelligence, serving as the primary human interface for monitoring and managing complex software platforms."
weight = 30

[extra]
category = "glossary"
tags = ["dashboard", "visualization", "monitoring", "real-time", "liveview", "flowbite", "metrics", "ui", "business-intelligence", "observability"]
related_terms = ["liveview", "monitoring", "telemetry", "flowbite", "metrics", "scalability", "fault-tolerance", "otp"]
difficulty = "intermediate"
importance = "critical"
date_created = "2026-02-22"
date_modified = "2026-02-22"
version = "2.0.0"
platforms = ["prismatic", "elixir", "phoenix"]
domain = "user-interface"
audience = ["developers", "architects", "product-managers", "devops-engineers"]
prerequisite_knowledge = ["web-development", "data-visualization", "phoenix-liveview"]
learning_outcomes = ["Distinguish between operational, analytical, strategic, and tactical dashboards", "Design effective real-time dashboards using Phoenix LiveView", "Apply information hierarchy and cognitive load principles to dashboard layout", "Implement server-pushed updates for live metric visualization"]
quality_score = 95
word_count_target = 2500
cross_references = 10
section_count = 14
has_code_examples = true
has_diagrams = false
review_status = "comprehensive"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
technical_level = "intermediate"
domain_category = "visualization"
implementation_status = "production"
authority_level = "L3-strategic"
code_examples = true
version_introduced = "0.5.0"
stability_level = "stable"
keywords = ["dashboard", "monitoring", "visualization", "LiveView", "real-time", "metrics", "Flowbite", "Phoenix", "observability"]
word_count = 2861
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Dashboard - Prismatic Platform"
+++

## Overview

A dashboard is a visual display of the most important information needed to achieve one or more objectives, consolidated and arranged on a single screen so the information can be monitored at a glance. In software engineering, dashboards serve as the primary human interface for understanding system state, detecting anomalies, tracking business metrics, and making operational decisions. They transform raw data streams into actionable visual narratives.

Within the [Prismatic Platform](@/glossary/application.md), dashboards are not peripheral features but central operational tools. The platform exposes 15+ distinct dashboard views built with Phoenix [LiveView](@/glossary/liveview.md), [Flowbite](@/glossary/flowbite.md) UI components, and TailwindCSS. These dashboards provide real-time visibility into agent operations, security ratings, quality metrics, OSINT intelligence, and system health -- all rendered server-side and pushed to the browser over WebSocket connections without requiring a JavaScript framework.

---

## Definition and Etymology

The word "dashboard" originally referred to a board of wood or leather placed at the front of a horse-drawn carriage to prevent mud from being "dashed" onto the driver and passengers. When automobiles replaced carriages, the term transferred to the panel of instruments facing the driver -- speedometer, fuel gauge, temperature indicator -- providing at-a-glance awareness of the vehicle's operating state.

The metaphor migrated to software in the 1980s and 1990s as executive information systems (EIS) attempted to give business leaders the same kind of at-a-glance awareness of organizational performance. Stephen Few, in his influential 2006 book *Information Dashboard Design*, formalized the definition: "A dashboard is a visual display of the most important information needed to achieve one or more objectives; consolidated and arranged on a single screen so the information can be monitored at a glance."

The critical elements of this definition are: **visual** (not tabular or textual), **most important** (curated, not comprehensive), **objectives-driven** (tied to specific goals), **single screen** (no scrolling or navigation required for primary metrics), and **at a glance** (comprehensible in seconds, not minutes).

---

## Historical Context

The evolution of dashboards parallels the evolution of computing's role in organizations:

**1970s-1980s: Management Information Systems (MIS)**. Early computer-generated reports were printed on paper -- batch-processed, hours or days old, and designed for analysts rather than decision-makers. The gap between data and decision was measured in days.

**1980s-1990s: Executive Information Systems (EIS)**. The first attempts at visual, interactive displays for senior leaders. These systems ran on dedicated terminals and were expensive to build and maintain. Few organizations could afford them.

**1990s-2000s: Business Intelligence (BI) Platforms**. Tools like Cognos, Business Objects, and later Tableau democratized dashboard creation. Self-service BI allowed analysts to build dashboards without programmer involvement. However, these dashboards were typically refreshed on schedules (hourly, daily) rather than in real-time.

**2000s-2010s: Operational Dashboards**. As web applications proliferated, operational dashboards emerged to monitor system health: Nagios, Grafana, Datadog, and New Relic. These tools introduced real-time data streams, alerting, and the concept of dashboards as operational necessities rather than executive luxuries.

**2010s-Present: Embedded and Real-Time Dashboards**. Modern applications embed dashboards directly into their UIs. Server-sent events, WebSockets, and frameworks like Phoenix LiveView enable true real-time updates without polling. The dashboard is no longer a separate tool -- it is an integral part of the application.

---

## Core Concepts: Dashboard Types

### Operational Dashboards

Operational dashboards monitor real-time system state and are designed for immediate action. They answer the question: "Is everything working right now?" Key characteristics include high refresh rates (seconds, not minutes), alert integration, and emphasis on current values rather than historical trends. Examples in the Prismatic Platform include the agent health monitor, system throughput display, and error rate tracker.

### Analytical Dashboards

Analytical dashboards support data exploration and root cause analysis. They answer the question: "Why did this happen?" They typically feature interactive filters, drill-down capabilities, time range selection, and comparative views. The Prismatic Platform's quality metrics dashboard, which tracks the evolution of quality scores across 115 umbrella applications over time, is an analytical dashboard.

### Strategic Dashboards

Strategic dashboards track progress toward long-term goals and key performance indicators (KPIs). They answer the question: "Are we on track?" Refresh rates are lower (daily or weekly), and the focus is on trends, forecasts, and goal attainment. The platform's generation evolution tracker (Gen 1 through Gen 19, fitness score 0.9995) serves a strategic purpose.

### Tactical Dashboards

Tactical dashboards bridge operational and strategic concerns. They help managers allocate resources, prioritize work, and respond to emerging situations. The EASM (External Attack Surface Management) dashboard in `prismatic_perimeter` is tactical -- it shows security ratings (A-F grades), compliance status, and risk scores that inform resource allocation decisions.

---

## Technical Deep Dive: Phoenix LiveView Dashboards

Phoenix [LiveView](@/glossary/liveview.md) fundamentally changes dashboard architecture by eliminating the traditional client-server separation for real-time interfaces. Instead of building a JavaScript single-page application that polls a REST API, LiveView renders HTML on the server and pushes incremental DOM updates to the browser over a persistent WebSocket connection.

### Architectural Advantages

**No JavaScript framework required.** Dashboard interactivity -- sorting tables, filtering data, toggling views, expanding details -- is handled entirely through server-side event handling. This eliminates an entire class of frontend complexity: no Redux, no React state management, no API serialization layer.

**Automatic real-time updates.** When server state changes, the LiveView process automatically re-renders the affected template portions and sends minimal diffs to the browser. For dashboards displaying live [metrics](@/glossary/metrics.md), this means sub-second updates without polling.

**Server-side state management.** Dashboard state (selected filters, time ranges, expanded sections) lives in the LiveView process's memory. There is no state synchronization problem between client and server because the server is the single source of truth.

**Built-in fault tolerance.** Each dashboard user session runs as an independent BEAM process under [OTP supervision](@/glossary/supervision-tree.md). If one user's session crashes, it is automatically restarted without affecting other users. The browser reconnects seamlessly.

### LiveView Dashboard Implementation

The following code demonstrates the pattern used across the Prismatic Platform's 15+ dashboard views. The `mount/3` callback establishes the initial state and subscribes to real-time event streams. The `handle_info/2` callback processes server-pushed updates. The `handle_event/3` callback responds to user interactions.

```elixir
defmodule PrismaticWeb.PerimeterDashboardLive do
  use PrismaticWeb, :live_view

  alias PrismaticPerimeter.SecurityRating
  alias PrismaticPerimeter.AssetDiscovery

  @refresh_interval :timer.seconds(30)

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      :timer.send_interval(@refresh_interval, self(), :refresh_metrics)
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "perimeter:events")
    end

    {:ok,
     socket
     |> assign(:page_title, "Perimeter Dashboard")
     |> assign(:security_rating, nil)
     |> assign(:asset_count, 0)
     |> assign(:compliance_status, %{})
     |> assign(:risk_distribution, %{})
     |> assign(:last_updated, nil)
     |> load_initial_data()}
  end

  @impl true
  def handle_info(:refresh_metrics, socket) do
    {:noreply, refresh_all_metrics(socket)}
  end

  @impl true
  def handle_info({:perimeter_event, event}, socket) do
    {:noreply, handle_perimeter_event(socket, event)}
  end

  @impl true
  def handle_event("filter_assets", %{"category" => category}, socket) do
    filtered = AssetDiscovery.filter_by_category(category)
    {:noreply, assign(socket, :assets, filtered)}
  end

  @impl true
  def handle_event("change_time_range", %{"range" => range}, socket) do
    {:noreply,
     socket
     |> assign(:time_range, parse_range(range))
     |> refresh_all_metrics()}
  end

  defp load_initial_data(socket) do
    socket
    |> assign(:security_rating, SecurityRating.current())
    |> assign(:asset_count, AssetDiscovery.count())
    |> assign(:compliance_status, fetch_compliance())
    |> assign(:risk_distribution, fetch_risk_distribution())
    |> assign(:last_updated, DateTime.utc_now())
  end

  defp refresh_all_metrics(socket) do
    socket
    |> assign(:security_rating, SecurityRating.current())
    |> assign(:asset_count, AssetDiscovery.count())
    |> assign(:risk_distribution, fetch_risk_distribution())
    |> assign(:last_updated, DateTime.utc_now())
  end

  defp handle_perimeter_event(socket, %{type: :asset_discovered}) do
    assign(socket, :asset_count, socket.assigns.asset_count + 1)
  end

  defp handle_perimeter_event(socket, %{type: :rating_changed} = event) do
    assign(socket, :security_rating, event.new_rating)
  end

  defp handle_perimeter_event(socket, _event), do: socket

  defp fetch_compliance do
    %{nis2: :compliant, zkb: :partial, gdpr: :compliant}
  end

  defp fetch_risk_distribution do
    %{critical: 2, high: 8, medium: 23, low: 45, info: 112}
  end

  defp parse_range("1h"), do: :one_hour
  defp parse_range("24h"), do: :one_day
  defp parse_range("7d"), do: :one_week
  defp parse_range(_), do: :one_day
end
```

### Template Pattern with Flowbite Components

The corresponding LiveView template leverages [Flowbite](@/glossary/flowbite.md) components for consistent, accessible UI. The card-based layout follows the information hierarchy principle -- primary KPIs in the top row, detail tables and charts below:

```heex
<div class="grid grid-cols-1 gap-4 lg:grid-cols-4 mb-6">
  <div class="rounded-lg border border-gray-700 bg-gray-800 p-4">
    <h3 class="text-sm font-medium text-gray-400">Security Rating</h3>
    <div class="mt-2 flex items-baseline gap-2">
      <span class="text-3xl font-bold text-white">
        <%= @security_rating && @security_rating.grade %>
      </span>
      <span class="text-sm text-gray-400">
        <%= @security_rating && @security_rating.score %>/900
      </span>
    </div>
  </div>

  <div class="rounded-lg border border-gray-700 bg-gray-800 p-4">
    <h3 class="text-sm font-medium text-gray-400">Discovered Assets</h3>
    <p class="mt-2 text-3xl font-bold text-white"><%= @asset_count %></p>
  </div>

  <div class="rounded-lg border border-gray-700 bg-gray-800 p-4">
    <h3 class="text-sm font-medium text-gray-400">Compliance</h3>
    <div class="mt-2 flex gap-2">
      <%= for {framework, status} <- @compliance_status do %>
        <span class={"inline-flex rounded px-2 py-1 text-xs font-medium " <>
          compliance_color(status)}>
          <%= framework |> Atom.to_string() |> String.upcase() %>
        </span>
      <% end %>
    </div>
  </div>

  <div class="rounded-lg border border-gray-700 bg-gray-800 p-4">
    <h3 class="text-sm font-medium text-gray-400">Last Updated</h3>
    <p class="mt-2 text-lg text-white">
      <%= @last_updated && Calendar.strftime(@last_updated, "%H:%M:%S") %>
    </p>
  </div>
</div>
```

---

## Key Metrics Visualization

Effective dashboards display metrics that directly correspond to system health and business value. The Prismatic Platform organizes metrics into four categories:

### Throughput Metrics

Throughput measures the rate of useful work completed. For the platform, this includes agent executions per second, API requests processed, OSINT queries completed, and pages rendered. Throughput is typically displayed as time-series line charts or sparklines showing both current value and recent trend.

### Latency Metrics

Latency measures how long operations take. The platform enforces hard limits: page loads under 250ms, server renders under 100ms, LiveView mounts under 150ms. Latency dashboards display percentile distributions (p50, p95, p99) rather than averages, because averages hide the tail latency that affects real users.

### Error Rate Metrics

Error rates measure the proportion of operations that fail. The platform tracks both application errors (function failures, validation errors) and infrastructure errors (timeouts, connection failures). Error rate displays use conditional coloring: green below threshold, yellow approaching threshold, red exceeding threshold.

### Health Scores

Composite health scores aggregate multiple signals into a single indicator. The platform's quality score (100/100) combines 13 quality domains. The security rating (A-F grade, 300-900 numeric) combines vulnerability data, compliance status, and exposure analysis. These composite scores are displayed as gauges or grade badges.

---

## Dashboard Design Principles

### Information Hierarchy

Not all information is equally important. The most critical metrics should occupy the most prominent positions (top-left in left-to-right cultures, largest visual weight). Secondary information supports the primary metrics. Tertiary detail should be available on demand (click to expand, hover for tooltip) rather than displayed by default.

### Cognitive Load Management

George Miller's research suggests humans can hold approximately seven items (plus or minus two) in working memory simultaneously. Dashboards must respect this limitation. Techniques include: grouping related metrics into visual clusters, using progressive disclosure to hide detail until requested, maintaining consistent visual patterns so that interpretation becomes automatic, and limiting the total number of distinct elements on a single screen.

### Gestalt Principles

Visual perception follows predictable patterns described by Gestalt psychology:

- **Proximity**: Elements placed close together are perceived as related. Group related metrics spatially.
- **Similarity**: Elements that look alike are perceived as belonging together. Use consistent colors, sizes, and shapes for metrics of the same type.
- **Enclosure**: Elements within a shared boundary are perceived as a group. Use cards, borders, and background colors to delineate metric groups.
- **Continuity**: The eye follows smooth lines and curves. Align elements along consistent grid lines.

### Color as Data

Color should encode meaning, not decoration. The platform follows a consistent color vocabulary: green for healthy/passing, yellow/amber for warning, red for critical/failing, blue for informational, and gray for inactive/disabled. Color should never be the only indicator of state -- always pair with text labels or icons to support colorblind users.

### Data-Ink Ratio

Edward Tufte's principle of maximizing the data-ink ratio argues that every element on a dashboard should contribute to understanding. Remove grid lines that add no information, decorative elements that distract, and 3D effects that distort perception. The goal is maximum information with minimum visual noise.

---

## Business Intelligence Integration

Dashboards often serve as the presentation layer for broader business intelligence (BI) systems. The Prismatic Platform integrates BI concepts at multiple levels:

**Data Aggregation**: [Telemetry](@/glossary/telemetry.md) events from across the platform are aggregated into time-bucketed summaries suitable for dashboard display. Raw event rates of thousands per second are reduced to meaningful aggregates (averages, percentiles, counts) computed at configurable intervals.

**Dimensional Analysis**: Metrics can be sliced along multiple dimensions -- by application, by agent tier, by time period, by geographic region. The dashboard provides interactive filters that allow users to explore these dimensions without requiring new queries.

**Anomaly Detection**: Beyond displaying current values, intelligent dashboards highlight deviations from expected patterns. A sudden spike in error rates, an unusual latency distribution, or a gradual drift in quality scores should be visually distinct from normal operation.

**Historical Comparison**: Strategic and analytical dashboards benefit from comparison capabilities -- this week versus last week, this release versus previous release, this quarter versus same quarter last year. Time-based comparisons reveal trends that instantaneous snapshots cannot.

---

## Prismatic Platform Dashboard Inventory

The platform provides 15+ dashboard views, each serving a distinct operational purpose:

| Dashboard | Route | Type | Key Metrics |
|-----------|-------|------|-------------|
| **System Overview** | `/` | Operational | Agent count, quality score, system health |
| **EASM Dashboard** | `/perimeter` | Tactical | Security rating (A-F), asset count, compliance |
| **Asset Inventory** | `/perimeter/assets` | Analytical | Assets by type, risk level, discovery method |
| **Compliance View** | `/perimeter/compliance` | Strategic | NIS2, ZKB control assessment status |
| **OSINT Toolbox** | `/osint/toolbox` | Operational | 120 tools across 7 categories |
| **Agent Monitor** | `/agents` | Operational | Agent status, executions/sec, error rates |
| **Quality Metrics** | `/quality` | Strategic | 13 domain scores, trend lines, debt tracking |
| **Labs Playground** | `/labs` | Analytical | Experimental features, A/B metrics |
| **API Explorer** | `/api/swaggerui` | Analytical | Endpoint discovery, request/response |

Each dashboard follows the same LiveView pattern: mount with loading state, subscribe to PubSub topics, handle periodic refreshes, and respond to user interaction events.

---

## EASM Dashboard: Security Ratings

The Prismatic Perimeter EASM dashboard represents the platform's most sophisticated dashboard implementation. It provides security ratings comparable to industry leaders like BitSight, SecurityScorecard, and Black Kite.

The dashboard displays:

- **Overall Security Grade** (A-F): A composite score ranging from 300 to 900, displayed as both a letter grade and a numeric value with industry percentile ranking.
- **Asset Inventory**: Discovered domains, IP addresses, certificates, cloud resources, and services, filterable by type, risk level, and discovery method.
- **Compliance Assessment**: NIS2 Directive (EU 2022/2555) and ZKB 264/2025 Sb. (Czech) compliance status with individual control assessment.
- **Risk Distribution**: Visual breakdown of findings by severity (critical, high, medium, low, informational) displayed as both counts and proportional bars.
- **Trend Indicators**: Directional arrows showing whether each metric is improving, stable, or degrading relative to the previous assessment period.

This dashboard exemplifies the tactical dashboard type -- it informs resource allocation decisions (which risks to remediate first), tracks progress toward compliance goals, and provides the real-time awareness needed for security operations.

---

## Best Practices

1. **Design for the question, not the data.** Start by identifying what decisions the dashboard supports, then determine what data those decisions require. Avoid the temptation to display data simply because it is available.

2. **Establish clear refresh semantics.** Users must understand whether they are looking at real-time data, data from the last refresh cycle, or cached data. Display the last-updated timestamp prominently and make the refresh interval obvious.

3. **Provide context for every number.** A metric value of "47ms" means nothing without context. Is that good or bad? What is the threshold? What was it yesterday? Always pair current values with targets, thresholds, or historical baselines.

4. **Test on realistic data volumes.** A dashboard that looks perfect with 10 data points may be unusable with 10,000. Test with production-scale data volumes and ensure that visual elements scale gracefully -- table pagination, chart axis auto-scaling, and truncation strategies must all be verified.

5. **Optimize for scanning, not reading.** Dashboard users scan for anomalies; they do not read every metric sequentially. Visual patterns that make anomalies immediately obvious (conditional coloring, threshold lines, sparklines showing trend direction) are more valuable than precise numbers.

6. **Handle loading and error states explicitly.** A dashboard that shows stale data without indicating staleness is worse than a dashboard that shows a loading indicator. Design explicit states for loading, error, empty (no data), and stale (data older than expected).

7. **Respect the performance contract.** The Prismatic Platform mandates LiveView mount times under 150ms and handle_event times under 50ms. Dashboard data fetching must be asynchronous -- mount the view immediately with loading placeholders, then populate data via `handle_info` or `handle_async`.

8. **Use PubSub for real-time updates.** Rather than polling databases on a timer, subscribe to PubSub topics and push updates only when state actually changes. This reduces server load and provides truly real-time feedback.

---

## Anti-Patterns

### Dashboard Sprawl

Creating dozens of dashboards that nobody monitors. Every dashboard should have a clear owner and a defined purpose. If nobody checks a dashboard for a month, it should be archived, not maintained.

### Vanity Metrics

Displaying metrics that look impressive but do not inform decisions. Total user count (ever-increasing) tells you nothing about current system health. Focus on actionable metrics: rate of change, error ratios, latency percentiles.

### Alert Fatigue Through Dashboard

Displaying every alert, warning, and notification on a single screen creates visual noise that desensitizes operators to genuine problems. Apply severity filtering and ensure that critical alerts have visual treatments that are impossible to ignore.

### Polling Overload

Dashboards that poll the API every second for data that changes every minute waste resources and create unnecessary load. Match the refresh rate to the data's actual rate of change. LiveView's server-push model elegantly solves this -- the server only sends updates when state actually changes.

### Data Without Narrative

Raw numbers without interpretation. A dashboard showing "CPU: 73%" tells you the current value but not whether that is normal for this time of day, whether it is trending upward, or whether it will reach critical levels at the current rate. Add trend lines, predictions, and threshold markers to transform data into narrative.

### Blocking Mount Pattern

Loading all dashboard data synchronously in the `mount/3` callback. This blocks the initial page render and can exceed the 150ms LiveView mount time limit. Instead, mount immediately with placeholder/loading states and fetch data asynchronously via `send(self(), :load_data)` or `Task.async`.

---

## Related Technologies

| Technology | Relationship to Dashboards |
|---|---|
| [LiveView](@/glossary/liveview.md) | Server-rendered real-time UI framework powering Prismatic dashboards |
| [Flowbite](@/glossary/flowbite.md) | TailwindCSS component library providing dashboard UI elements |
| [Telemetry](@/glossary/telemetry.md) | Event and metrics collection infrastructure feeding dashboard data |
| [Monitoring](@/glossary/monitoring.md) | Operational practice that dashboards visualize and make actionable |
| [Metrics](@/glossary/metrics.md) | Quantitative measurements displayed on dashboards |
| [Scalability](@/glossary/scalability.md) | Quality attribute tracked through dashboard KPIs |
| [Fault Tolerance](@/glossary/fault-tolerance.md) | Resilience property monitored via dashboard health indicators |
| [OTP](@/glossary/otp.md) | Foundation enabling per-user dashboard process isolation |
| [EASM](@/glossary/easm.md) | External Attack Surface Management displayed through security dashboards |
| [Supervision Tree](@/glossary/supervision-tree.md) | Process hierarchy ensuring dashboard session fault tolerance |

---

## Future Directions

**AI-Augmented Dashboards**: Machine learning models that analyze dashboard metrics to surface insights, predict incidents before they occur, and recommend actions. Rather than requiring humans to interpret patterns, AI copilots can narrate what the dashboard shows and what it means.

**Adaptive Dashboards**: Interfaces that automatically reconfigure based on the current situation. During an incident, the dashboard surfaces incident-relevant metrics and suppresses normal operations data. During quiet periods, it shows trend analysis and optimization opportunities.

**Collaborative Dashboards**: Real-time shared cursors, annotations, and discussion threads embedded directly in dashboard views. When an operator spots an anomaly, they can annotate it in place and invite colleagues to investigate, creating a shared situational awareness space.

**Natural Language Querying**: Instead of configuring filters and selecting dimensions through UI controls, users ask questions in natural language: "Show me the error rate for the agent subsystem over the last 4 hours." The dashboard interprets the query and reconfigures its display accordingly.

**Edge-Rendered Dashboards**: As edge computing matures, dashboards may be rendered closer to the data source, reducing latency for globally distributed teams and enabling offline-capable monitoring for field operations.

---

## See Also

- [LiveView](@/glossary/liveview.md) -- Phoenix framework for real-time server-rendered interfaces
- [Monitoring](@/glossary/monitoring.md) -- Operational practice of observing system health
- [Telemetry](@/glossary/telemetry.md) -- Elixir metrics and event collection library
- [Flowbite](@/glossary/flowbite.md) -- TailwindCSS component library for UI design
- [Metrics](@/glossary/metrics.md) -- Quantitative system measurements
- [Scalability](@/glossary/scalability.md) -- System capacity and growth management
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- Resilience through failure isolation
- [OTP](@/glossary/otp.md) -- Open Telecom Platform framework
- [Supervision Tree](@/glossary/supervision-tree.md) -- Process hierarchy management
- [EASM](@/glossary/easm.md) -- External Attack Surface Management

---

## Connect & Contribute
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
