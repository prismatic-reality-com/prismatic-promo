+++
title = "AI Drift Web"
weight = 22
[extra]
category = "Web"
files = 24
description = "LiveView dashboard for AI drift monitoring and visualization"
status = "Active"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1357
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Drift", "Web", "LiveView", "apps", "Prismatic Platform", "WebSocket", "AppAiDriftWeb", "PubSub"]
tags = ["apps", "web", "ai-drift-web", "prismatic"]
quality_score = 77
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "AI Drift Web - Prismatic Platform"
+++

## Abstract

AI Drift Web provides the real-time [LiveView](@/glossary/liveview.md) dashboard for monitoring AI decision drift across all tracked models within the Prismatic Platform. It renders drift scores, trend charts, alert histories, and model health indicators through [Phoenix LiveView](@/glossary/phoenix-liveview.md) server-rendered updates, eliminating the need for client-side JavaScript frameworks. The dashboard uses [TailwindCSS](@/glossary/tailwindcss.md) and [Flowbite](@/glossary/flowbite.md) components following the platform's unified UI standards. Built on Phoenix 1.8.3 with LiveView 1.1.0, the application leverages efficient DOM diffing over [WebSocket](@/glossary/websocket.md) connections managed by the [BEAM](@/glossary/beam.md) runtime, ensuring sub-second update latency even under high model monitoring loads.

## 1. Introduction

### 1.1 Problem Statement

AI systems in production require continuous monitoring to detect behavioral drift -- the gradual deviation of model outputs from their expected baselines. While the [AI Drift](@/apps/ai-drift.md) core engine performs statistical drift detection and threshold evaluation, raw drift scores and alert data are not actionable without a visual presentation layer that enables operators to identify patterns, investigate anomalies, and compare model behaviors in real time. Without a dedicated monitoring dashboard, drift detection insights remain buried in logs and API responses, reducing the operational value of the entire monitoring pipeline.

AI Drift Web bridges this gap by transforming structured drift data into actionable visual intelligence. Every drift event, baseline deviation, and alert is rendered in real time over WebSocket connections, enabling immediate operator response to emerging drift patterns.

### 1.2 Design Goals

1. **Real-time visualization** -- sub-second updates for drift scores, alerts, and model health without polling or page reloads.
2. **Zero client-side frameworks** -- all rendering handled server-side through Phoenix LiveView for reduced complexity and consistent behavior.
3. **Role-based access** -- dashboard views filtered by operator role through [RBAC](@/glossary/rbac.md) integration with Prismatic Auth.
4. **Comparative analysis** -- side-by-side model comparison enabling drift differential analysis across model versions.
5. **Audit compliance** -- all dashboard interactions logged for [audit trail](@/glossary/audit-trail.md) compliance with [GDPR](@/glossary/gdpr.md) requirements.
6. **Platform consistency** -- TailwindCSS and Flowbite components matching all other Prismatic dashboards.

### 1.3 Scope

AI Drift Web covers the presentation and interaction layer for drift monitoring. All drift calculations, [confidence scoring](@/glossary/confidence-scoring.md), and alert logic reside in the [AI Drift](@/apps/ai-drift.md) core engine. The web layer consumes structured data through [PubSub](@/glossary/pubsub.md) broadcasts and [GenServer](@/glossary/genserver.md) queries, rendering interactive components that support filtering, drill-down, and comparative analysis without duplicating business logic.

## 2. Architecture

### 2.1 System Design

```
AI Drift Engine ──[PubSub]──> LiveView Channels ──> Browser (WebSocket)
      │                            │
      ├─ Drift Scores              ├─ Dashboard Layout
      ├─ Alert Events              ├─ Trend Charts
      ├─ Baseline Data             ├─ Alert Console
      └─ Model Metadata            └─ Comparison Views
                                        │
Prismatic Auth ──[RBAC]──> Access Control Layer
                                        │
Prismatic Web ──[Components]──> Shared UI Templates
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `AppAiDriftWeb.Application` | OTP application entry point with supervision tree |
| `AppAiDriftWeb.DashboardLive` | Main drift monitoring dashboard with real-time score updates |
| `AppAiDriftWeb.ModelDetailLive` | Per-model detail view with drift history and trend analysis |
| `AppAiDriftWeb.AlertConsoleLive` | Interactive alert management with acknowledgment and escalation |
| `AppAiDriftWeb.ComparisonLive` | Side-by-side model comparison with drift differential analysis |
| `AppAiDriftWeb.Router` | Phoenix router with LiveView route definitions and pipeline configuration |
| `AppAiDriftWeb.Endpoint` | HTTP endpoint with WebSocket transport configuration |

### 2.3 Process Topology

```
AppAiDriftWeb.Application (Supervisor, :one_for_one)
+-- AppAiDriftWeb.Endpoint (Phoenix.Endpoint)
|     HTTP server, WebSocket transport, static file serving
+-- Phoenix.PubSub (subscription management)
|     Real-time drift event distribution to connected LiveView processes
+-- AppAiDriftWeb.Telemetry (Telemetry.Metrics.ConsoleReporter)
      Dashboard performance metrics reporting
```

Each connected dashboard session runs as an independent LiveView process under [OTP](@/glossary/otp.md) supervision. The PubSub system broadcasts drift events from the core engine to all connected sessions, ensuring every operator sees identical real-time data without polling overhead.

### 2.4 Data Flow

All rendering follows [pure function](@/glossary/pure-function.md) principles with stateless view functions computing display state from drift data. Side effects (user interactions, navigation, alert acknowledgments) are handled through LiveView event callbacks that delegate to the core engine's GenServer API. The separation ensures that view rendering never modifies drift state and that all state mutations flow through the core engine's supervision boundary.

## 3. Implementation

### 3.1 Key Features

**Real-Time Drift Dashboard.** Server-rendered UI with WebSocket-based updates showing drift scores, model health, and alert status without page reloads. Configurable refresh intervals and auto-pause on user interaction prevent data loss during investigation. Role-based view customization through RBAC integration restricts sensitive model data to authorized operators.

**Drift Visualization.** Time-series charts displaying drift magnitude over configurable time windows with baseline comparison overlays. Statistical distribution plots showing output deviation patterns with percentile markers. Heatmap views correlating drift intensity across multiple models and input dimensions enable rapid identification of systemic drift patterns versus isolated model issues.

**Alert Management Console.** Interactive alert console for acknowledging, investigating, and resolving drift alerts with full audit trail. Alert severity classification with color-coded indicators and configurable notification thresholds. One-click escalation to [incident response](@/glossary/incident-response.md) workflows with evidence attachment. Alert deduplication prevents operator fatigue during sustained drift periods.

**Model Comparison.** Side-by-side model performance comparison with drift differential analysis and statistical summaries. Temporal alignment of drift events across model versions to identify regression patterns. Export capability for compliance reporting and [structured logging](@/glossary/structured-logging.md) integration generates evidence artifacts for the [Prismatic CER](@/apps/prismatic-cer.md) compliance repository.

### 3.2 LiveView Integration

```elixir
# Mount the drift dashboard in the Phoenix router
scope "/drift", AppAiDriftWeb do
  live "/", DashboardLive, :index
  live "/models/:id", ModelDetailLive, :show
  live "/alerts", AlertConsoleLive, :index
  live "/compare", ComparisonLive, :index
end

# Subscribe to real-time drift updates in a LiveView
defmodule AppAiDriftWeb.DashboardLive do
  use AppAiDriftWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      AppAiDrift.subscribe_drift_events()
      AppAiDrift.subscribe_alert_events()
    end

    {:ok, assign(socket,
      models: AppAiDrift.list_monitored_models(),
      alerts: AppAiDrift.recent_alerts(limit: 50),
      stats: AppAiDrift.dashboard_stats()
    )}
  end

  @impl true
  def handle_info({:drift_update, model_id, score}, socket) do
    {:noreply, update_model_score(socket, model_id, score)}
  end
end
```

### 3.3 Configuration

```elixir
config :app_ai_drift_web,
  generators: [context_app: :app_ai_drift],
  live_view: [signing_salt: "configured_salt"],
  pubsub_server: AppAiDrift.PubSub,
  default_refresh_interval: 5_000,
  max_alerts_displayed: 100,
  chart_time_window: :last_24_hours,
  comparison_max_models: 4
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [AI Drift](@/apps/ai-drift.md) | Core drift detection engine providing real-time drift scores and alert data via PubSub |
| [Prismatic Web](@/apps/prismatic-web.md) | Shared LiveView components, layout templates, and navigation infrastructure |
| [Prismatic Auth](@/apps/prismatic-auth.md) | Authentication and RBAC for dashboard access control |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic Web](@/apps/prismatic-web.md) | Hosts the drift dashboard routes within the unified platform navigation |

### 4.3 External Dependencies

The application depends on Phoenix 1.8.3, Phoenix LiveView 1.1.0, TailwindCSS for styling, esbuild for JavaScript bundling, and OpenApiSpex 3.22 for API documentation. CORS is handled via `cors_plug` for cross-origin API access. Wallaby provides browser-based integration testing.

## 5. Testing Strategy

### 5.1 Unit Tests

LiveView component tests verify correct rendering of drift scores, alert displays, and model comparison views. Event handler tests confirm that PubSub messages trigger appropriate socket state updates and DOM patches.

### 5.2 Integration Tests

Full dashboard flow tests exercise the connection lifecycle from mount through real-time updates, alert acknowledgment, and model comparison. Wallaby-based browser tests verify end-to-end rendering and user interaction paths.

### 5.3 Property-Based Testing

StreamData generators produce random drift score sequences and alert configurations to verify that the dashboard renders all valid state combinations without crashes or rendering errors.

```elixir
property "dashboard renders all valid drift scores" do
  check all score <- float(min: 0.0, max: 1.0),
            status <- member_of([:stable, :warning, :critical]) do
    assert render_component(DriftScoreComponent,
      score: score, status: status) =~ "drift-score"
  end
end
```

## 6. Performance

### 6.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| LiveView mount | < 50ms | Initial page render with current state |
| PubSub event to DOM update | < 100ms | Server-side render + WebSocket push |
| Alert acknowledgment | < 20ms | GenServer call + socket update |
| Model comparison render | < 200ms | Two-model side-by-side with charts |
| Chart data aggregation | < 50ms | 24-hour window with 1-minute granularity |

### 6.2 Telemetry Events

The dashboard emits telemetry events for performance monitoring: `[:app_ai_drift_web, :live_view, :mount]`, `[:app_ai_drift_web, :live_view, :handle_event]`, `[:app_ai_drift_web, :pubsub, :event_received]`. These feed into [Prismatic Telemetry](@/apps/prismatic-telemetry.md) for dashboard performance [observability](@/glossary/observability.md).

### 6.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 64 MB | 128 MB |
| CPU | 1 core | 2 cores |
| WebSocket connections | 10 concurrent | 100 concurrent |

## 7. NABLA Compliance

Dashboard views propagate [confidence scoring](@/glossary/confidence-scoring.md) from the core engine without modification. Every drift score, alert, and comparison displayed in the dashboard carries its original confidence annotation and provenance metadata. The dashboard does not generate new epistemic claims -- it renders existing claims with their full NABLA context, ensuring operators can assess the reliability of displayed information.

## 8. Security Considerations

### 8.1 Access Control

Dashboard access requires authentication through [Prismatic Auth](@/apps/prismatic-auth.md). Role-based filtering ensures that analyst, manager, and auditor roles see appropriate data scope. Sensitive model configuration details are only visible to users with the `drift_admin` permission.

### 8.2 Audit Trail

All user interactions -- alert acknowledgments, escalations, comparison exports -- generate audit trail entries stored through the platform's compliance infrastructure. CORS configuration via `cors_plug` restricts API access to authorized origins.

## 9. Operational Considerations

### 9.1 Deployment

Deploys as part of the umbrella [release](@/glossary/release.md). Assets are built via TailwindCSS and esbuild during the deployment pipeline. The endpoint binds to a configurable port with WebSocket upgrade support.

### 9.2 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| No real-time updates | PubSub subscription missing | Verify `connected?/1` guard in mount |
| Stale dashboard data | WebSocket disconnected | Check endpoint configuration and firewall rules |
| Slow chart rendering | Large time window with fine granularity | Reduce time window or increase aggregation interval |
| Alert console empty | No drift alerts generated | Verify core engine thresholds and baseline data |

## 10. Future Work

Planned enhancements include custom dashboard layout persistence per operator, PDF export of drift reports for compliance documentation, real-time collaboration features allowing operators to annotate drift events, and integration with [Prismatic Narrative](@/apps/prismatic-narrative.md) for automated drift analysis report generation.

## References

- [AI Drift](@/apps/ai-drift.md) -- Core drift detection engine
- [Prismatic Web](@/apps/prismatic-web.md) -- Platform LiveView infrastructure
- [Phoenix LiveView](https://hexdocs.pm/phoenix_live_view/) -- Server-rendered real-time UI framework

## Related Agents

- [Alert Management Specialist](@/agents/alert-management-specialist.md) -- Coordinates alert lifecycle management across drift monitoring
- [Architecture Review Specialist](@/agents/architecture-review-specialist.md) -- Validates LiveView component architecture compliance

## Related Capabilities

- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Foundation for live drift data streaming and visualization
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Dashboard performance observability and render metrics

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)