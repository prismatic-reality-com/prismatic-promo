+++
title = "Prismatic IR PVM Web"
weight = 46
[extra]
category = "Web"
files = 17
description = "LiveView interface for IR/PVM investigation dashboards"
status = "Active"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1009
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "PVM", "Web", "LiveView", "IRPVM", "apps", "Prismatic Platform", "PrismaticIrPvmWeb", "Evidence", "Risk"]
tags = ["apps", "web", "prismatic-ir-pvm-web", "prismatic"]
quality_score = 77
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic IR PVM Web - Prismatic Platform"
+++

## Overview

Prismatic IR [PVM](@/glossary/pvm.md) Web provides the [LiveView](@/glossary/liveview.md) interface for the Investigation and Risk Process Virtual Machine, delivering interactive dashboards for case management, evidence review, and risk assessment visualization. Built with [Phoenix LiveView](@/glossary/phoenix-liveview.md) for real-time server-rendered updates, it enables investigators to manage complex due diligence cases, review multi-source evidence chains, and track risk assessment workflows without page reloads or client-side rendering frameworks.

The application serves as the presentation layer for the [Prismatic IR PVM](@/apps/prismatic-ir-pvm.md) core engine. While the core engine orchestrates investigation workflows, executes risk scoring models, and manages case state machines, the web layer renders those states into actionable visual interfaces. Every case transition, evidence attachment, and risk score update propagates in real time through [PubSub](@/glossary/pubsub.md) broadcasts over [WebSocket](@/glossary/websocket.md) connections, ensuring all connected investigators see synchronized case state without manual refreshing.

The dashboard integrates with the platform's [RBAC](@/glossary/rbac.md) authorization system to enforce role-based access to investigation data. Analyst, reviewer, and manager roles see different dashboard views with appropriate data scope restrictions, ensuring that sensitive investigation materials are only visible to authorized personnel. All user interactions generate [audit trail](@/glossary/audit-trail.md) entries for regulatory compliance with [GDPR](@/glossary/gdpr.md) and internal governance requirements.

## Architecture

```
IR PVM Engine --[PubSub]--> LiveView Channels --> Browser (WebSocket)
      |                            |
      +-- Case State Events        +-- Case Dashboard
      +-- Evidence Updates         +-- Evidence Viewer
      +-- Risk Score Changes       +-- Risk Heatmaps
      +-- Workflow Transitions     +-- Workflow Console
                                        |
Prismatic Auth --[RBAC]--> Role-Based View Filtering
                                        |
Prismatic Web --[Components]--> Shared Layout + Navigation
```

All view logic follows [pure function](@/glossary/pure-function.md) principles, computing display state from case data without side effects. User interactions dispatch events through LiveView handles, which delegate to the core engine's [GenServer](@/glossary/genserver.md) API for state transitions under [OTP](@/glossary/otp.md) [supervision tree](@/glossary/supervision-tree.md) management.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticIrPvmWeb` | Web application entry point and router configuration |
| `PrismaticIrPvmWeb.CaseDashboardLive` | Case listing with filtering, sorting, and status tracking |
| `PrismaticIrPvmWeb.CaseDetailLive` | Individual case view with timeline and evidence summary |
| `PrismaticIrPvmWeb.EvidenceViewerLive` | Evidence review interface with annotation and provenance |
| `PrismaticIrPvmWeb.RiskDashboardLive` | Risk heatmaps and trend visualization across portfolios |
| `PrismaticIrPvmWeb.WorkflowConsoleLive` | Visual workflow tracking with state machine diagrams |
| `PrismaticIrPvmWeb.Components` | Shared LiveView components for case cards, timelines, risk gauges |
| `PrismaticIrPvmWeb.Components.CaseTimeline` | Interactive timeline component with milestone and SLA indicators |

## Key Features

### Case Management Dashboard
- Interactive case management interface with filtering, sorting, and status tracking across investigation portfolios
- Case timeline visualization showing investigation progression, milestone completion, and SLA adherence
- Bulk operations for case assignment, priority adjustment, and status transitions with confirmation dialogs
- Case search with full-text query support across case titles, descriptions, and evidence metadata

### Evidence Viewer

The evidence viewer provides a rich interface for reviewing multi-format evidence items collected during investigations. Each evidence item displays its source, collection timestamp, [confidence scoring](@/glossary/confidence-scoring.md), and chain of custody information.

- Rich evidence review interface with document preview, annotation capabilities, and evidence chain visualization
- Multi-format support for documents, images, structured data, and [OSINT](@/glossary/osint.md) intelligence reports
- Evidence provenance tracking showing source, collection timestamp, and confidence scoring for each item
- Side-by-side comparison mode for evaluating conflicting evidence from different sources

```elixir
# Evidence viewer LiveView mount
defmodule PrismaticIrPvmWeb.EvidenceViewerLive do
  use PrismaticIrPvmWeb, :live_view

  @impl true
  def mount(%{"case_id" => case_id}, _session, socket) do
    if connected?(socket) do
      PrismaticIrPvm.subscribe_evidence(case_id)
    end

    evidence = PrismaticIrPvm.list_evidence(case_id)
    {:ok, assign(socket, case_id: case_id, evidence: evidence, selected: nil)}
  end

  @impl true
  def handle_info({:evidence_added, item}, socket) do
    evidence = [item | socket.assigns.evidence]
    {:noreply, assign(socket, evidence: evidence)}
  end

  @impl true
  def handle_event("select_evidence", %{"id" => id}, socket) do
    selected = Enum.find(socket.assigns.evidence, & &1.id == id)
    {:noreply, assign(socket, selected: selected)}
  end
end
```

### Risk Visualization
- Dynamic risk heat maps displaying assessment results across entity portfolios with drill-down capability
- Trend charts correlating [risk score](@/glossary/risk-score.md) evolution with investigation events and evidence milestones
- Comparative risk views enabling side-by-side entity assessment for related-party investigations
- Risk distribution histograms showing portfolio-level risk concentration patterns

### Workflow Console
- Visual workflow status tracking with state machine diagrams, milestone indicators, and SLA countdown displays
- One-click workflow actions for common transitions (approve, escalate, request information, close)
- Configurable notification preferences for workflow events with [telemetry](@/glossary/telemetry.md) integration
- Workflow history audit showing every state transition with actor, timestamp, and justification

### Case Timeline Component

The interactive timeline component renders investigation progression with color-coded milestones, SLA indicators, and evidence attachment markers:

```elixir
defmodule PrismaticIrPvmWeb.Components.CaseTimeline do
  use Phoenix.Component

  attr :events, :list, required: true
  attr :sla_deadlines, :list, default: []

  def timeline(assigns) do
    ~H"""
    <div class="relative border-l-2 border-gray-700 ml-4">
      <%= for event <- @events do %>
        <div class="mb-6 ml-6">
          <div class={"absolute -left-2 w-4 h-4 rounded-full #{event_color(event.type)}"} />
          <div class="text-sm text-gray-400"><%= format_timestamp(event.timestamp) %></div>
          <div class="font-medium text-white"><%= event.title %></div>
          <div class="text-sm text-gray-500"><%= event.description %></div>
        </div>
      <% end %>
    </div>
    """
  end
end
```

### Role-Based Access Control

The dashboard enforces strict RBAC policies that control what each user role can see and do within the investigation interface:

| Role | Case Access | Evidence Actions | Workflow Actions |
|------|-------------|------------------|------------------|
| Analyst | Assigned cases only | View, annotate | Submit for review |
| Reviewer | Team cases | View, annotate, verify | Approve, request changes |
| Manager | All cases | Full access | All transitions, assign |
| Auditor | All cases (read-only) | View only | None |

## Routes

```elixir
# Mount the IR PVM dashboard in your Phoenix router
scope "/investigations", PrismaticIrPvmWeb do
  live "/", CaseDashboardLive, :index
  live "/cases/:id", CaseDetailLive, :show
  live "/cases/:id/evidence", EvidenceViewerLive, :index
  live "/risk", RiskDashboardLive, :index
  live "/workflow", WorkflowConsoleLive, :index
end
```

| Route | View |
|-------|------|
| `/investigations` | Case dashboard with portfolio overview |
| `/investigations/cases/:id` | Individual case detail with timeline |
| `/investigations/cases/:id/evidence` | Evidence viewer for specific case |
| `/investigations/risk` | Risk dashboard with heatmaps and trends |
| `/investigations/workflow` | Workflow console with state machine tracking |

## Usage

```elixir
# Subscribe to case updates in a LiveView
def mount(%{"id" => case_id}, _session, socket) do
  PrismaticIrPvm.subscribe_case(case_id)
  {:ok, assign(socket, case: PrismaticIrPvm.get_case!(case_id))}
end

# Handle real-time case state updates
def handle_info({:case_updated, case_data}, socket) do
  {:noreply, assign(socket, case: case_data)}
end

# Handle workflow transition actions
def handle_event("approve_case", %{"case_id" => id}, socket) do
  case PrismaticIrPvm.transition_case(id, :approve, socket.assigns.current_user) do
    {:ok, updated_case} -> {:noreply, assign(socket, case: updated_case)}
    {:error, reason} -> {:noreply, put_flash(socket, :error, reason)}
  end
end
```

## NABLA Compliance

| NABLA Axiom | IR PVM Web Enforcement | Implementation |
|-------------|----------------------|----------------|
| Provenance Mandatory | Every displayed evidence item shows source and chain of custody | Evidence viewer renders full provenance metadata |
| Signal Plurality | Risk visualizations aggregate multiple evidence signals | Risk heatmaps combine scores from independent assessment methods |
| Audit Trail | All user interactions logged for compliance | Every click, view, and transition generates audit entries |
| Time Decay | Stale evidence items visually marked | Timestamp-based freshness indicators on evidence cards |
| Contradiction Preservation | Conflicting evidence displayed without forced resolution | Side-by-side comparison mode preserves analyst judgment |

## Testing

LiveView tests verify component rendering, PubSub subscription handling, and RBAC enforcement. Route tests validate authentication requirements on all investigation paths. Evidence viewer tests verify multi-format rendering and annotation persistence. Risk dashboard tests verify heatmap computation and trend chart data accuracy with known fixtures.

Integration tests exercise the full pipeline from IR PVM engine events through PubSub to LiveView DOM updates. Performance tests verify mount times under 150ms and event processing under 50ms. Timeline component tests verify correct rendering order, SLA indicator visibility, and event color coding.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic IR PVM](@/apps/prismatic-ir-pvm.md) | Core investigation engine providing case data and workflows |
| [Prismatic Web](@/apps/prismatic-web.md) | Shared LiveView components, layout templates, and navigation |
| [Prismatic Auth](@/apps/prismatic-auth.md) | Authentication and RBAC for investigation view access |
| [Prismatic DD](@/apps/prismatic-dd.md) | Due diligence case data feeding investigation workflows |
| [Prismatic API](@/apps/prismatic-api.md) | [REST API](@/glossary/rest-api.md) gateway exposing investigation data programmatically |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Dashboard mount | < 150ms | Initial case list with filtering |
| Case detail load | < 100ms | Including timeline and evidence summary |
| Evidence viewer mount | < 200ms | With document preview rendering |
| PubSub event processing | < 50ms | From engine event to DOM update |
| Workflow transition | < 100ms | Including audit trail logging |
| Timeline render | < 80ms | Up to 200 events with SLA markers |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :ir_pvm_web, :page_load]`, `[:prismatic, :ir_pvm_web, :case_viewed]`, `[:prismatic, :ir_pvm_web, :workflow_action]`.

## Related Resources

- [Prismatic Hawkeye Web](@/apps/prismatic-hawkeye-web.md) -- Visitor intelligence dashboard following similar LiveView patterns
- [Prismatic Storage](@/apps/prismatic-storage.md) -- Persistence layer for case data and evidence
- [Evidence Enforcement Agent](@/agents/evidence-enforcement-agent.md) -- Ensures evidence chain integrity and provenance
- [Architecture Review Specialist](@/agents/architecture-review-specialist.md) -- Validates LiveView component architecture
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Foundation for live case state streaming
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Multi-source evidence fusion displayed through the viewer
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Dashboard performance observability

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)