+++
title = "Progressive Disclosure"
weight = 50
[extra]
tags = ["glossary", "ux", "design", "liveview", "interface", "usability", "information-architecture"]
description = "Progressive disclosure is a design strategy that sequences information and functionality presentation from simple to complex, showing users only what they need at each interaction stage and revealing advanced features on demand, reducing cognitive load while maintaining access to full system capabilities."
category = "design"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["phoenix-liveview", "composability", "modularity", "domain-driven-design", "observability", "telemetry", "quality-gate", "feature-flag", "api-gateway", "authority-level"]
key_concepts = ["cognitive load reduction", "layered complexity", "on-demand detail", "sensible defaults", "interaction stages"]
use_cases = ["dashboard design", "configuration interfaces", "onboarding flows", "diagnostic tools", "API documentation"]
prerequisites = ["phoenix-liveview", "composability"]
version = "1.0.0"
schema_type = "DefinedTerm"
date_created = "2026-02-22"
word_count = 2023
date_modified = "2026-02-23"
keywords = ["Progressive", "Disclosure", "glossary", "design", "Prismatic Platform", "Step", "Clicking", "LiveView"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Progressive Disclosure - Prismatic Platform"
+++

## Definition

Progressive disclosure is a design strategy that manages complexity by presenting information and functionality in layers, ordered from most essential to most detailed. At each layer, the user sees only what is relevant to their current task or expertise level. Additional detail, configuration options, and advanced features are available on demand -- typically through expansion controls, drill-down navigation, or explicit mode switches -- but are hidden until requested.

The term originates from human-computer interaction research, where studies consistently demonstrate that users perform better, make fewer errors, and report higher satisfaction when interfaces present a manageable amount of information at each step rather than exposing all options simultaneously. Progressive disclosure reduces cognitive load (the mental effort required to process information) by ensuring that the user's working memory is not overwhelmed by irrelevant options.

In the context of software platforms, progressive disclosure extends beyond visual interfaces to encompass API design, configuration systems, documentation, error reporting, and even codebase organization. A well-designed API exposes simple defaults for common cases and offers granular control for advanced use. A well-designed configuration system works out of the box with sensible defaults and allows deep customization for operators who need it.

The Prismatic Platform applies progressive disclosure across its LiveView dashboards, AIAD agent interfaces, quality reporting tools, and OSINT investigation workflows. Users see summary metrics on initial load, drill into detailed breakdowns on click, and access raw data and configuration only when explicitly requested.

## Overview

The fundamental insight behind progressive disclosure is that different users need different levels of detail at different times. A security analyst viewing the Prismatic Perimeter dashboard needs the overall security rating (A-F grade) at a glance, asset-level risk scores when investigating specific concerns, and raw scan evidence only when diagnosing false positives. Presenting all three levels simultaneously would overwhelm the initial view and make the common case (checking the overall rating) unnecessarily difficult.

Progressive disclosure operates on three principles:

**Principle 1: Reasonable defaults cover 80% of use cases.** Most users most of the time need the most common configuration. The system should work correctly with zero configuration, and the first interaction should present only the information needed for the most common task.

**Principle 2: Complexity is available, not imposed.** Advanced features exist and are discoverable, but they do not clutter the primary interface. A "Show Advanced" toggle, a details expansion panel, or a drill-down link gates access to deeper layers.

**Principle 3: Each layer is self-sufficient.** Every disclosure level should provide a complete, useful view. The summary view is not a broken version of the detail view -- it is a purposefully designed view that answers the questions appropriate to that level of engagement.

In Elixir/Phoenix applications, progressive disclosure aligns naturally with LiveView's event-driven model. Initial page loads deliver summary data (fast render, minimal payload). User interactions (clicks, toggles, form submissions) trigger targeted updates that fetch and display additional detail without full page reloads. This architecture means that the cost of deeper disclosure layers is paid only by users who request them, keeping the common case fast and lightweight.

The Prismatic Platform enforces a strict performance standard (all pages under 250ms, server render under 100ms) that makes progressive disclosure not just a design preference but an architectural necessity. Loading all possible detail on every page load would violate these performance constraints. By deferring expensive data fetches to user-initiated events, progressive disclosure enables rich interfaces that remain within performance budgets.

## Technical Details

### LiveView Progressive Disclosure Pattern

Phoenix LiveView's stateful connection model is ideal for progressive disclosure. The initial mount renders the summary, and handle_event callbacks fetch detail on demand:

```elixir
defmodule PrismaticWeb.PerimeterLive.Dashboard do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    # Initial load: summary only (fast)
    {:ok,
     socket
     |> assign(:view_mode, :summary)
     |> assign(:security_rating, load_security_rating())
     |> assign(:asset_count, load_asset_count())
     |> assign(:selected_asset, nil)
     |> assign(:asset_details, nil)}
  end

  @impl true
  def handle_event("expand_asset", %{"id" => asset_id}, socket) do
    # Layer 2: Asset detail (loaded on demand)
    details = PrismaticPerimeter.get_asset_details(asset_id)

    {:noreply,
     socket
     |> assign(:selected_asset, asset_id)
     |> assign(:asset_details, details)
     |> assign(:view_mode, :detail)}
  end

  @impl true
  def handle_event("show_raw_evidence", %{"asset_id" => asset_id}, socket) do
    # Layer 3: Raw scan data (loaded only when explicitly requested)
    evidence = PrismaticPerimeter.get_scan_evidence(asset_id)

    {:noreply, assign(socket, :raw_evidence, evidence)}
  end

  @impl true
  def handle_event("collapse_detail", _params, socket) do
    # Return to summary view
    {:noreply,
     socket
     |> assign(:view_mode, :summary)
     |> assign(:selected_asset, nil)
     |> assign(:asset_details, nil)
     |> assign(:raw_evidence, nil)}
  end

  defp load_security_rating do
    case PrismaticPerimeter.current_rating() do
      {:ok, rating} -> rating
      {:error, _} -> %{grade: :unknown, score: 0}
    end
  end

  defp load_asset_count do
    case PrismaticPerimeter.asset_summary() do
      {:ok, summary} -> summary
      {:error, _} -> %{total: 0, critical: 0, warning: 0}
    end
  end
end
```

### Template with Disclosure Layers

The HEEx template renders different levels of detail based on the current view mode:

```heex
<div class="space-y-6">
  <%!-- Layer 1: Always visible summary --%>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-gray-800 rounded-lg p-6">
      <h3 class="text-sm font-medium text-gray-400">Security Rating</h3>
      <p class="text-4xl font-bold text-white mt-2">
        <%= @security_rating.grade %>
      </p>
      <p class="text-sm text-gray-500 mt-1">
        Score: <%= @security_rating.score %>/900
      </p>
    </div>
    <div class="bg-gray-800 rounded-lg p-6">
      <h3 class="text-sm font-medium text-gray-400">Total Assets</h3>
      <p class="text-4xl font-bold text-white mt-2">
        <%= @asset_count.total %>
      </p>
    </div>
    <div class="bg-gray-800 rounded-lg p-6">
      <h3 class="text-sm font-medium text-gray-400">Critical Findings</h3>
      <p class="text-4xl font-bold text-red-400 mt-2">
        <%= @asset_count.critical %>
      </p>
    </div>
  </div>

  <%!-- Layer 2: Asset detail (shown on demand) --%>
  <%= if @view_mode == :detail and @asset_details do %>
    <div class="bg-gray-800 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-white">
          Asset: <%= @asset_details.hostname %>
        </h3>
        <button phx-click="collapse_detail"
                class="text-gray-400 hover:text-white text-sm">
          Collapse
        </button>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-400">Risk Score</p>
          <p class="text-xl text-white"><%= @asset_details.risk_score %></p>
        </div>
        <div>
          <p class="text-sm text-gray-400">Last Scan</p>
          <p class="text-xl text-white"><%= @asset_details.last_scan %></p>
        </div>
      </div>

      <%!-- Layer 3: Raw evidence (deepest level) --%>
      <%= if assigns[:raw_evidence] do %>
        <div class="mt-4 bg-gray-900 rounded p-4 font-mono text-sm text-gray-300">
          <pre><%= Jason.encode!(@raw_evidence, pretty: true) %></pre>
        </div>
      <% else %>
        <button phx-click="show_raw_evidence"
                phx-value-asset_id={@selected_asset}
                class="mt-4 text-sm text-blue-400 hover:text-blue-300">
          Show Raw Evidence
        </button>
      <% end %>
    </div>
  <% end %>
</div>
```

### Progressive API Design

Progressive disclosure applies to APIs through optional parameters, sensible defaults, and expandable responses:

```elixir
defmodule PrismaticPerimeter.API do
  @moduledoc """
  API with progressive disclosure: simple calls return summaries,
  optional parameters unlock detailed responses.
  """

  @spec security_rating(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def security_rating(domain, opts \\ []) do
    detail_level = Keyword.get(opts, :detail, :summary)
    include_evidence = Keyword.get(opts, :evidence, false)
    include_history = Keyword.get(opts, :history, false)

    with {:ok, base_rating} <- compute_rating(domain) do
      result =
        base_rating
        |> maybe_expand_details(detail_level)
        |> maybe_include_evidence(include_evidence, domain)
        |> maybe_include_history(include_history, domain)

      {:ok, result}
    end
  end

  defp maybe_expand_details(rating, :summary), do: rating

  defp maybe_expand_details(rating, :full) do
    Map.merge(rating, %{
      category_scores: compute_category_scores(rating),
      methodology: describe_methodology(),
      confidence_intervals: compute_confidence(rating)
    })
  end

  defp maybe_include_evidence(rating, false, _domain), do: rating

  defp maybe_include_evidence(rating, true, domain) do
    Map.put(rating, :evidence, PrismaticPerimeter.get_evidence(domain))
  end

  defp maybe_include_history(rating, false, _domain), do: rating

  defp maybe_include_history(rating, true, domain) do
    Map.put(rating, :history, PrismaticPerimeter.get_rating_history(domain))
  end

  defp compute_rating(_domain), do: {:ok, %{grade: :B, score: 780}}
  defp compute_category_scores(_rating), do: %{}
  defp describe_methodology, do: %{}
  defp compute_confidence(_rating), do: %{}
end
```

### Configuration Progressive Disclosure

Configuration systems benefit from progressive disclosure through layered defaults:

```elixir
defmodule PrismaticStorage.Config do
  @moduledoc """
  Storage configuration with progressive disclosure.
  Works with zero configuration (sensible defaults),
  allows medium customization (common options),
  and supports deep customization (all knobs).
  """

  @default_config %{
    # Layer 1: Just works (zero config needed)
    pool_size: 10,
    timeout: 15_000,

    # Layer 2: Common customization
    ssl: false,
    queue_target: 50,
    queue_interval: 1_000,

    # Layer 3: Expert tuning
    prepare: :named,
    socket_options: [],
    ownership_timeout: 120_000,
    migration_lock: "FOR UPDATE",
    start_apps_before_migration: [],
    telemetry_prefix: [:prismatic, :storage]
  }

  @spec build(keyword()) :: map()
  def build(overrides \\ []) do
    Map.merge(@default_config, Map.new(overrides))
  end
end
```

## Implementation

### Designing Disclosure Layers

Implementing progressive disclosure requires mapping information to layers based on user needs:

**Step 1: Identify user personas and their primary tasks.**

| Persona | Primary Task | Information Need |
|---------|-------------|-----------------|
| Executive | Status check | Overall rating, trend direction |
| Security analyst | Investigation | Asset details, vulnerability data |
| DevOps engineer | Incident response | Raw logs, configuration, metrics |
| Auditor | Compliance review | Evidence, methodology, history |

**Step 2: Map information to disclosure layers.**

| Layer | Content | Trigger | Load Strategy |
|-------|---------|---------|---------------|
| L0 (Ambient) | Status indicators, badges | Always visible | Included in initial render |
| L1 (Summary) | Key metrics, counts, grades | Page load | Server-side query on mount |
| L2 (Detail) | Breakdowns, timelines, comparisons | Click/expand | Async fetch on event |
| L3 (Evidence) | Raw data, logs, configurations | Explicit request | Lazy load with pagination |

**Step 3: Implement load boundaries.**

Each layer transition should be a clear boundary where data is fetched. Do not pre-fetch L3 data on the assumption that users might want it -- most will not, and the cost is paid by all users.

**Step 4: Provide navigation between layers.**

Users must be able to move both deeper (expand, drill down) and shallower (collapse, back to summary). Trapping users in a detail view without a clear path back to the summary violates the self-sufficiency principle.

### Testing Progressive Disclosure

Test each layer independently and verify that layer transitions work correctly:

```elixir
defmodule PrismaticWeb.PerimeterLive.DashboardTest do
  use PrismaticWeb.ConnCase, async: true
  import Phoenix.LiveViewTest

  describe "progressive disclosure layers" do
    test "mount shows summary only", %{conn: conn} do
      {:ok, view, html} = live(conn, ~p"/perimeter")

      # Summary layer is present
      assert html =~ "Security Rating"
      assert html =~ "Total Assets"

      # Detail layer is not rendered
      refute html =~ "Raw Evidence"
      refute html =~ "Show Raw Evidence"
    end

    test "clicking asset expands detail layer", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/perimeter")

      html =
        view
        |> element("[phx-click=expand_asset]", "asset-1")
        |> render_click()

      assert html =~ "Risk Score"
      assert html =~ "Last Scan"
      assert html =~ "Show Raw Evidence"
    end

    test "show raw evidence loads deepest layer", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/perimeter")

      view |> element("[phx-click=expand_asset]") |> render_click()

      html =
        view
        |> element("[phx-click=show_raw_evidence]")
        |> render_click()

      assert html =~ "evidence"
    end

    test "collapse returns to summary", %{conn: conn} do
      {:ok, view, _html} = live(conn, ~p"/perimeter")

      view |> element("[phx-click=expand_asset]") |> render_click()

      html =
        view
        |> element("[phx-click=collapse_detail]")
        |> render_click()

      refute html =~ "Risk Score"
    end
  end
end
```

## Comparison

### Progressive Disclosure vs. Wizard/Step-by-Step

| Aspect | Progressive Disclosure | Wizard |
|--------|----------------------|--------|
| Navigation | Non-linear (expand/collapse) | Linear (next/back) |
| User control | Full (any layer anytime) | Sequential (must complete steps) |
| Context | All layers in one view | One step visible at a time |
| Use case | Information display | Data collection/configuration |
| Complexity handling | Layers of detail | Sequential decomposition |

### Progressive Disclosure vs. Role-Based Access

Role-based access control (RBAC) hides features based on user permissions. Progressive disclosure hides features based on user intent. An admin user with full permissions still benefits from progressive disclosure because they do not need all their available functionality at every moment. RBAC answers "what can you access?" while progressive disclosure answers "what do you need right now?"

### Progressive Disclosure vs. Responsive Design

Responsive design adapts the interface to the device's screen size. Progressive disclosure adapts the interface to the user's current need. They are complementary: a responsive layout might collapse navigation into a hamburger menu (responsive) while a dashboard within that layout shows summary metrics first and detail on click (progressive disclosure). Both strategies manage screen real estate, but for different reasons.

## Best Practices

1. **Start with the most common use case.** The default view (Layer 0/L1) should satisfy the majority of users without any interaction. If most users need to expand to see useful information, the default layer is too shallow.

2. **Make disclosure controls discoverable.** If users cannot find the "Show Details" button, progressive disclosure becomes information hiding. Use standard UI patterns: expandable cards, tabbed interfaces, "Learn more" links, and hover previews.

3. **Preserve context during expansion.** When a user expands a detail panel, the summary should remain visible. Replacing the summary with the detail view forces the user to mentally reconstruct the context they just had.

4. **Lazy-load deeper layers.** Do not pre-fetch data for layers the user may never visit. LiveView's event-driven model makes this natural -- fetch data in `handle_event` callbacks, not in `mount`.

5. **Remember disclosure state.** If a user expands a section, collapses it, and then returns to the page, consider restoring their previous disclosure state. URL parameters, localStorage, or server-side preferences can track this.

6. **Provide keyboard navigation.** Progressive disclosure should be accessible. Expansion controls should be keyboard-focusable and activatable with Enter/Space. ARIA attributes should communicate the expanded/collapsed state to screen readers.

7. **Design each layer as a complete view.** The summary is not a broken version of the detail view. Each layer should answer the questions appropriate to its level of engagement and feel complete in itself.

8. **Test with real users at different expertise levels.** Novice users should find the default view sufficient. Expert users should be able to reach advanced features quickly. Both should feel that the interface was designed for them.

## Pitfalls

**Over-disclosure at the default layer.** The most common mistake is showing too much information initially, defeating the purpose of progressive disclosure. If the default view has 20 metrics, 5 charts, and 3 tables, it is not a summary -- it is an information dump. Ruthlessly curate the default layer.

**Under-disclosure at deeper layers.** The opposite mistake: hiding essential information behind too many clicks. If a security analyst needs 4 click-throughs to reach the vulnerability details they check daily, the disclosure hierarchy does not match the user's actual workflow.

**Inconsistent disclosure patterns.** Using expandable cards in one section, tabs in another, and modal dialogs in a third creates confusion. Pick a small set of disclosure patterns and apply them consistently across the interface.

**Losing state on layer transitions.** If expanding a detail panel causes the summary to re-render and lose scroll position, users lose their orientation. LiveView's targeted updates via `phx-update="stream"` and DOM patching help preserve state during partial re-renders.

**Performance cliffs at deeper layers.** If Layer 1 loads in 50ms but Layer 3 takes 5 seconds because it fetches unindexed data, the user experiences a jarring performance cliff. Each layer should meet the platform's performance standards (250ms page load, 50ms event handling).

## Use Cases

### OSINT Investigation Workflow

An OSINT analyst investigating a company starts with a summary view: company name, jurisdiction, registration status, and risk indicators. Clicking the risk indicator reveals a breakdown by category (sanctions, adverse media, PEP connections). Clicking a specific category shows individual findings with source citations. Clicking a source opens the raw data from the original registry. Each layer provides progressively more detail while maintaining the investigation context.

### Platform Quality Dashboard

The Prismatic Platform's quality dashboard shows the aggregate quality score (100/100) at the top level. Expanding reveals per-domain scores (Dialyzer, Credo, compilation warnings, etc.). Expanding a domain shows individual violations (if any) with file paths and line numbers. Clicking a violation opens the relevant code with suggested fixes. This four-layer structure lets the platform maintainer check overall health in seconds and investigate specific issues without leaving the dashboard.

### API Documentation

The Prismatic API documentation uses progressive disclosure to serve both newcomers and experienced developers. The landing page shows endpoint categories with one-sentence descriptions. Clicking a category reveals the endpoint list with method, path, and summary. Clicking an endpoint shows parameters, request/response schemas, and example calls. An "Advanced" toggle reveals authentication details, rate limiting, error codes, and pagination. This structure lets a newcomer make their first API call in minutes while giving experienced developers access to every detail.

### Agent Configuration Interface

AIAD agents in the Prismatic Platform have dozens of configurable parameters. The agent creation interface shows only the required fields (name, type, domain) at first. An "Advanced Configuration" section, collapsed by default, reveals optional parameters (timeout, retry policy, escalation rules). An "Expert Mode" toggle exposes internal tuning parameters (batch size, backoff multiplier, circuit breaker thresholds). This three-tier disclosure prevents new users from being overwhelmed while giving power users full control.

## Related Concepts

Progressive disclosure connects to interface design, information architecture, and system configuration patterns:

- [Phoenix LiveView](@/glossary/phoenix-liveview.md) -- the real-time UI framework that enables layer transitions without full page reloads through server-pushed DOM updates
- [Composability](@/glossary/composability.md) -- the ability to compose simple components into complex interfaces, the building blocks of progressive disclosure layers
- [Modularity](@/glossary/modularity.md) -- software design principle that enables progressive disclosure by structuring functionality into independent, composable modules
- [Observability](@/glossary/observability.md) -- production monitoring that benefits from progressive disclosure, showing summary dashboards with drill-down to raw telemetry
- [Telemetry](@/glossary/telemetry.md) -- Elixir's metrics framework whose output is typically displayed through progressively disclosed dashboard layers
- [Quality Gate](@/glossary/quality-gate.md) -- automated check that surfaces pass/fail summaries with drill-down to detailed violation reports
- [Feature Flag](@/glossary/feature-flag.md) -- mechanism for controlling which features are disclosed to which users, complementing progressive disclosure with audience targeting
- [API Gateway](@/glossary/api-gateway.md) -- entry point that can implement progressive disclosure through response expansion and field selection
- [Authority Level](@/glossary/authority-level.md) -- AIAD concept where agent capabilities are disclosed progressively based on authority tier
- [Domain-Driven Design](@/glossary/domain-driven-design.md) -- architectural approach that informs disclosure layer boundaries by aligning them with domain contexts

## See Also

- [Monitoring](@/glossary/monitoring.md) -- production dashboards that exemplify progressive disclosure from alerts to metrics to traces
- [Quality Gates](@/glossary/quality-gates.md) -- pass/fail summaries with expandable violation details
- [Slash Command](@/glossary/slash-command.md) -- command interface that progressively reveals options through argument parsing
- [Phoenix](@/glossary/phoenix.md) -- the web framework providing the foundation for LiveView-based progressive disclosure
- [Architecture](@/glossary/architecture.md) -- system design discipline that informs how information is layered and disclosed

---

*Built with precision by the Prismatic Platform team. This glossary entry is part of a living knowledge base that evolves with the platform.*

**[Prismatic Platform](https://github.com/korczis/prismatic-platform)** | Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [LinkedIn](https://linkedin.com/in/korczis)
