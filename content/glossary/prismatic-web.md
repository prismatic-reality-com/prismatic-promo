+++
title = "Prismatic Web"
weight = 47
[extra]
category = "technology"
description = "Phoenix LiveView web application delivering real-time dashboards and interactive interfaces with sub-250ms performance requirements"
keywords = ["Phoenix LiveView", "real-time dashboards", "WebSocket", "server-rendered", "TailwindCSS", "performance"]
related_terms = ["phoenix", "liveview", "tailwindcss", "flowbite", "easm", "hawkeye", "phoenix-liveview", "websocket", "pubsub", "rbac"]
architecture_patterns = ["server-rendered", "real-time updates", "stateful connections", "component-based"]
performance_requirements = ["< 250ms page load", "< 100ms server render", "< 150ms mount", "< 50ms events"]
ui_framework = "Phoenix LiveView + TailwindCSS + Flowbite"
port = 4000
companion_apps = ["prismatic_api (4004)", "prismatic_perimeter", "prismatic_hawkeye"]
dashboard_types = ["security ratings", "asset inventory", "compliance", "agent status", "visitor intelligence"]
real_time_features = ["WebSocket connections", "PubSub subscriptions", "live data updates", "instant notifications"]
styling_mandate = "TailwindCSS-first, zero inline styles, zero custom CSS"
security_layers = ["authentication", "RBAC", "CSRF protection", "CSP headers", "rate limiting"]
integration_methods = ["direct function calls", "GenServer queries", "PubSub subscriptions", "behaviour-based access"]
responsive_design = "mobile-first, adaptive layouts"
testing_framework = "Phoenix.LiveViewTest"
deployment_target = "production web interface"
user_experience = "SPA-like interactivity with server-side rendering"
business_value = "Real-time visibility into platform operations with enterprise performance"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1114
date_created = "2026-02-23"
date_modified = "2026-02-23"
tags = ["glossary", "technology", "prismatic-web", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Prismatic Web - Prismatic Platform"
+++

## Definition and Overview

Prismatic Web (`prismatic_web`) is the Phoenix-based web application that serves the Prismatic Platform's interactive dashboards and user interfaces on port 4000. Built on Phoenix LiveView, it provides real-time, server-rendered interfaces that maintain persistent WebSocket connections between the client and server, enabling live data updates without page reloads or client-side JavaScript frameworks. The application uses TailwindCSS for utility-first styling and Flowbite for pre-built UI components, enforcing a strict mandate of zero inline styles and zero custom CSS.

Phoenix LiveView represents a paradigm shift in web application architecture. Traditional web applications separate into server-rendered HTML (request-response cycle) or client-side SPAs (React, Vue, Angular) with API backends. LiveView occupies a third position: the server renders HTML and maintains a stateful process per connection, pushing DOM patches over WebSocket when state changes. The user experience matches an SPA -- interactive, responsive, real-time -- but the programming model remains server-side Elixir with full access to the platform's OTP processes, ETS caches, and GenServer state.

This architecture is particularly well-suited to the Prismatic Platform because the data it displays (security ratings, asset inventories, compliance assessments, agent status) lives in server-side OTP processes. A traditional SPA would require building and maintaining a REST or GraphQL API layer to expose this data to the client. With LiveView, the dashboard processes can directly query the GenServer state, ETS tables, and Ecto repositories without serialization overhead. When underlying data changes (a new asset is discovered, a security rating is updated, an agent completes a task), the LiveView process is notified through PubSub or direct message passing, and the updated HTML is pushed to the client instantly.

The TailwindCSS-first mandate ensures visual consistency across the platform while enabling rapid UI development. TailwindCSS provides a comprehensive set of utility classes (spacing, colors, typography, layout, responsive design) that compose directly in HTML templates. Combined with Flowbite's component library (cards, tables, modals, dropdowns, navigation), developers can build professional dashboards without writing CSS or managing stylesheets. This approach eliminates CSS specificity conflicts, reduces bundle size through tree-shaking, and ensures that all UI elements follow the same design system.

## Technical Deep Dive

### LiveView Architecture

LiveView manages the connection lifecycle through a well-defined series of callbacks:

```elixir
defmodule PrismaticWeb.PerimeterDashboardLive do
  @moduledoc """
  LiveView for Prismatic Perimeter EASM dashboard.
  Displays security ratings, asset inventory, and compliance status.
  """
  use PrismaticWeb, :live_view

  @impl Phoenix.LiveView
  def mount(_params, _session, socket) do
    # Subscribe to real-time updates
    if connected?(socket) do
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "perimeter:updates")
      :timer.send_interval(30_000, :refresh_metrics)
    end

    socket =
      socket
      |> assign(:page_title, "Perimeter Dashboard")
      |> assign(:security_rating, load_security_rating())
      |> assign(:asset_count, load_asset_count())
      |> assign(:critical_findings, load_critical_findings())
      |> assign(:compliance_summary, load_compliance_summary())
      |> assign(:recent_discoveries, load_recent_discoveries())

    {:ok, socket}
  end

  @impl Phoenix.LiveView
  def handle_params(params, _uri, socket) do
    # Handle URL changes for filtering and navigation
    domain_filter = Map.get(params, "domain")

    socket =
      if domain_filter do
        assign(socket, :filtered_domain, domain_filter)
      else
        assign(socket, :filtered_domain, nil)
      end

    {:noreply, socket}
  end

  @impl Phoenix.LiveView
  def handle_event("discover", %{"domain" => domain}, socket) do
    # Trigger new discovery from the UI
    case PrismaticPerimeter.discover(domain) do
      {:ok, result} ->
        {:noreply,
          socket
          |> put_flash(:info, "Discovery completed: #{length(result.assets)} assets found")
          |> assign(:recent_discoveries, [result | socket.assigns.recent_discoveries])}

      {:error, reason} ->
        {:noreply, put_flash(socket, :error, "Discovery failed: #{inspect(reason)}")}
    end
  end

  @impl Phoenix.LiveView
  def handle_info(:refresh_metrics, socket) do
    {:noreply,
      socket
      |> assign(:security_rating, load_security_rating())
      |> assign(:asset_count, load_asset_count())}
  end

  @impl Phoenix.LiveView
  def handle_info({:perimeter_update, update}, socket) do
    # Real-time update from PubSub
    {:noreply, apply_update(socket, update)}
  end
end
```

### Template Architecture

LiveView templates use HEEx (HTML + Embedded Elixir) with TailwindCSS utilities:

```heex
<div class="min-h-screen bg-gray-900">
  <!-- Dashboard Header -->
  <div class="px-6 py-4 border-b border-gray-700">
    <h1 class="text-2xl font-bold text-white">Perimeter Dashboard</h1>
    <p class="text-gray-400 mt-1">External Attack Surface Management</p>
  </div>

  <!-- Metrics Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
    <!-- Security Rating Card -->
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div class="text-sm font-medium text-gray-400">Security Rating</div>
      <div class="mt-2 flex items-baseline">
        <span class={"text-4xl font-bold #{rating_color(@security_rating.grade)}"}>
          <%= @security_rating.grade %>
        </span>
        <span class="ml-2 text-lg text-gray-400"><%= @security_rating.score %>/900</span>
      </div>
    </div>

    <!-- Asset Count Card -->
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div class="text-sm font-medium text-gray-400">Discovered Assets</div>
      <div class="mt-2 text-4xl font-bold text-white"><%= @asset_count %></div>
    </div>

    <!-- Critical Findings Card -->
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div class="text-sm font-medium text-gray-400">Critical Findings</div>
      <div class="mt-2 text-4xl font-bold text-red-400"><%= length(@critical_findings) %></div>
    </div>

    <!-- Compliance Card -->
    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div class="text-sm font-medium text-gray-400">Compliance Score</div>
      <div class="mt-2 text-4xl font-bold text-emerald-400">
        <%= format_percent(@compliance_summary.score) %>
      </div>
    </div>
  </div>
</div>
```

### Route Structure

| Route | LiveView Module | Purpose |
|-------|----------------|---------|
| `/` | `HomeLive` | Platform overview and navigation |
| `/perimeter` | `PerimeterDashboardLive` | Security rating, asset count, top findings |
| `/perimeter/assets` | `AssetInventoryLive` | Searchable, filterable asset inventory |
| `/perimeter/compliance` | `ComplianceAssessmentLive` | NIS2/ZKB compliance status |
| `/perimeter/easm` | `EASMDashboardLive` | Advanced EASM with pipeline status |

### Performance Enforcement

All pages must meet strict performance requirements:

| Metric | Hard Limit | Measurement |
|--------|-----------|-------------|
| **Total page load** | < 250ms | Browser timing API |
| **Server-side render** | < 100ms | Telemetry event duration |
| **LiveView mount** | < 150ms | `mount/3` callback duration |
| **LiveView handle_event** | < 50ms | Event handler duration |
| **Health check** | < 10ms | `/health` endpoint response |

```elixir
defmodule PrismaticWeb.Telemetry do
  @moduledoc """
  Telemetry event handlers for performance monitoring.
  Enforces page load performance standards.
  """

  def handle_event([:phoenix, :live_view, :mount, :stop], measurements, metadata, _config) do
    duration_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)

    if duration_ms > 150 do
      Logger.warning("LiveView mount exceeded 150ms limit: #{duration_ms}ms for #{inspect(metadata.socket.view)}")
    end

    :telemetry.execute(
      [:prismatic_web, :performance, :mount],
      %{duration_ms: duration_ms},
      %{view: metadata.socket.view}
    )
  end

  def handle_event([:phoenix, :live_view, :handle_event, :stop], measurements, metadata, _config) do
    duration_ms = System.convert_time_unit(measurements.duration, :native, :millisecond)

    if duration_ms > 50 do
      Logger.warning("LiveView handle_event exceeded 50ms limit: #{duration_ms}ms")
    end
  end
end
```

## Architecture and Implementation

### Application Structure

```
prismatic_web/
├── lib/
│   ├── prismatic_web/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── layouts.ex       # Application layouts
│   │   │   └── core_components.ex # Shared components
│   │   ├── controllers/         # Traditional controllers
│   │   ├── live/                # LiveView modules
│   │   │   ├── perimeter/       # Perimeter dashboards
│   │   │   ├── agents/          # Agent management
│   │   │   └── home_live.ex     # Home page
│   │   ├── plugs/               # Authentication, RBAC
│   │   │   ├── api_auth.ex      # API authentication
│   │   │   └── rbac.ex          # Role-based access control
│   │   ├── router.ex            # Route definitions
│   │   └── endpoint.ex          # HTTP endpoint configuration
│   └── prismatic_web.ex         # Module definition
├── assets/                      # Static assets
│   ├── css/                     # TailwindCSS input
│   └── js/                      # LiveView hooks
└── test/                        # Test files
```

### Security Infrastructure

| Security Layer | Implementation | Purpose |
|----------------|---------------|---------|
| **Authentication** | Session-based + JWT | User identity verification |
| **Authorization** | RBAC via Plugs | Route and component-level access control |
| **CSRF Protection** | Phoenix CSRF tokens | Cross-site request forgery prevention |
| **CSP Headers** | Content-Security-Policy | Script injection prevention |
| **Rate Limiting** | Token bucket per IP | Denial-of-service protection |
| **Input Validation** | Ecto changesets | Server-side input sanitization |

## Usage in Prismatic Platform

Within the 90-app umbrella, prismatic_web serves as the primary user-facing application, rendering dashboards that connect to backend applications.

### Integration Points

| Backend Application | Integration Method | Dashboard |
|--------------------|-------------------|-----------|
| `prismatic_perimeter` | Direct function calls | Security ratings, asset inventory |
| `prismatic_agents` | GenServer queries | Agent status, task monitoring |
| `prismatic_storage_*` | Behaviour-based access | Data retrieval for displays |
| `prismatic_safety` | Quality gate queries | Quality score dashboard |
| `prismatic_hawkeye` | PubSub subscriptions | Visitor intelligence alerts |

### LiveView Hooks for Client-Side Interactivity

```javascript
// assets/js/hooks.js
let Hooks = {};

Hooks.CopyToClipboard = {
  mounted() {
    this.el.addEventListener("click", () => {
      const text = this.el.dataset.clipboardText;
      navigator.clipboard.writeText(text);
    });
  }
};

Hooks.ChartUpdate = {
  mounted() {
    this.handleEvent("chart_data", ({data}) => {
      this.updateChart(data);
    });
  },
  updateChart(data) {
    // Update chart rendering
  }
};

export default Hooks;
```

## Best Practices

**Use LiveView for interactive dashboards, controllers for static pages.** LiveView adds a persistent WebSocket connection per user. For pages that display static content or simple forms, traditional controller-based rendering is more resource-efficient.

**Minimize assigns in mount.** Only assign data that the template needs for initial render. Defer expensive data loading to `handle_continue` or background processes that push updates via PubSub. This keeps mount times under the 150ms limit.

**Subscribe to PubSub for real-time updates.** Rather than polling with timers, subscribe to PubSub topics that receive events when underlying data changes. This produces instant updates with minimal server load.

**Use components for reusable UI elements.** Extract common patterns (metric cards, data tables, status badges) into function components. This ensures visual consistency and reduces template duplication across dashboards.

**Enforce the TailwindCSS-first mandate.** Never add inline styles or custom CSS. Every visual property should be expressed through TailwindCSS utility classes. If a utility does not exist for a needed style, extend the TailwindCSS configuration rather than writing custom CSS.

## Common Pitfalls

**Loading too much data in mount.** Expensive database queries or API calls in `mount/3` block the initial page render. Use `connected?/1` to defer data loading until after the initial static render, then push updates over the socket.

**Breaking `phx-click` dropdown navigation.** The platform's navigation uses `phx-click` event handlers for dropdown menus. Template changes that modify the DOM structure around these elements can break interactivity. Test navigation after every template change.

**Stale assigns after PubSub updates.** When a PubSub message triggers an assign update, ensure the new value is actually different from the current assign. Pushing identical DOM patches wastes bandwidth and can cause flickering.

**Missing responsive design.** Dashboards must work across screen sizes. Use TailwindCSS responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) to adapt layouts. Test on mobile viewports, not just desktop.

**Not testing LiveView mount and events.** LiveView provides `Phoenix.LiveViewTest` for testing mount, events, and DOM assertions. Every LiveView should have tests verifying mount succeeds, critical data is displayed, and user events produce expected state changes.

## Advanced LiveView Patterns

### Real-Time Data Updates

The platform's real-time nature requires sophisticated data synchronization:

```elixir
defmodule PrismaticWeb.RealTimeUpdates do
  @moduledoc """
  Manages real-time data synchronization across multiple
  LiveView processes with conflict resolution.
  """

  @spec broadcast_update(String.t(), map()) :: :ok
  def broadcast_update(topic, data) do
    Phoenix.PubSub.broadcast(PrismaticWeb.PubSub, topic, {:data_update, data})
  end

  @spec handle_concurrent_updates(Phoenix.LiveView.Socket.t(), map(), map()) :: Phoenix.LiveView.Socket.t()
  def handle_concurrent_updates(socket, incoming_data, current_data) do
    # Implement conflict resolution strategy
    resolved_data = resolve_conflicts(incoming_data, current_data)

    socket
    |> assign(:data, resolved_data)
    |> assign(:last_update, DateTime.utc_now())
    |> maybe_notify_conflicts(incoming_data, current_data)
  end

  defp resolve_conflicts(incoming, current) do
    # Last-write-wins with timestamp comparison
    if DateTime.compare(incoming.updated_at, current.updated_at) == :gt do
      incoming
    else
      current
    end
  end
end
```

### Performance Optimization Strategies

Meeting sub-250ms requirements demands aggressive optimization:

```elixir
defmodule PrismaticWeb.PerformanceOptimizer do
  @moduledoc """
  Implements performance optimizations for LiveView applications
  including caching, lazy loading, and resource optimization.
  """

  @spec optimize_render(Phoenix.LiveView.Socket.t()) :: Phoenix.LiveView.Socket.t()
  def optimize_render(socket) do
    # Implement view caching for expensive computations
    cached_view_data = get_cached_view_data(socket)

    socket
    |> assign(:cached_computations, cached_view_data)
    |> assign(:render_timestamp, System.monotonic_time())
  end

  defp get_cached_view_data(socket) do
    cache_key = generate_cache_key(socket.assigns)

    case ETS.lookup(:view_cache, cache_key) do
      [{_key, data}] -> data
      [] -> compute_and_cache_view_data(socket, cache_key)
    end
  end

  defp compute_and_cache_view_data(socket, cache_key) do
    data = expensive_computation(socket.assigns)
    ETS.insert(:view_cache, {cache_key, data})
    data
  end
end
```

### Component Composition Patterns

Building reusable UI components following Flowbite design patterns:

```elixir
defmodule PrismaticWeb.Components.DataTable do
  @moduledoc """
  Reusable data table component with sorting, filtering,
  and pagination built using Flowbite table patterns.
  """
  use PrismaticWeb, :component

  attr :items, :list, required: true
  attr :columns, :list, required: true
  attr :sortable, :boolean, default: true
  attr :filterable, :boolean, default: true
  attr :pagination, :map, default: %{}

  def data_table(assigns) do
    ~H"""
    <div class="bg-gray-800 rounded-lg border border-gray-700">
      <!-- Table Header with Filters -->
      <div :if={@filterable} class="p-4 border-b border-gray-700">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <input type="search"
                   placeholder="Search..."
                   class="bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2 w-full" />
          </div>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Filter
          </button>
        </div>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-300">
          <thead class="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th :for={column <- @columns}
                  class="px-6 py-3 cursor-pointer hover:bg-gray-600"
                  phx-click={@sortable && "sort"}
                  phx-value-field={column.key}>
                <%= column.title %>
                <span :if={@sortable} class="ml-1">↕</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr :for={item <- @items}
                class="bg-gray-800 border-b border-gray-700 hover:bg-gray-750">
              <td :for={column <- @columns} class="px-6 py-4">
                <%= render_cell_content(item, column) %>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div :if={@pagination != %{}} class="p-4 border-t border-gray-700">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-400">
            Showing <%= @pagination.start %>-<%= @pagination.end %> of <%= @pagination.total %>
          </span>
          <div class="flex space-x-2">
            <button class="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                    phx-click="prev_page">
              Previous
            </button>
            <button class="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                    phx-click="next_page">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
    """
  end

  defp render_cell_content(item, column) do
    case column.type do
      :text -> Map.get(item, column.key)
      :date -> format_date(Map.get(item, column.key))
      :status -> render_status_badge(Map.get(item, column.key))
      :custom -> column.renderer.(item)
    end
  end
end
```

## Security & Access Control

### RBAC Integration

Prismatic Web implements comprehensive role-based access control:

```elixir
defmodule PrismaticWeb.LiveAuth do
  @moduledoc """
  Authentication and authorization utilities for LiveView.
  Integrates with platform RBAC system.
  """

  @spec require_auth(Phoenix.LiveView.Socket.t()) :: Phoenix.LiveView.Socket.t()
  def require_auth(socket) do
    case get_current_user(socket) do
      nil ->
        socket
        |> Phoenix.LiveView.redirect(to: "/login")
        |> Phoenix.LiveView.halt()

      user ->
        assign(socket, :current_user, user)
    end
  end

  @spec require_role(Phoenix.LiveView.Socket.t(), atom() | [atom()]) :: Phoenix.LiveView.Socket.t()
  def require_role(socket, required_roles) when is_list(required_roles) do
    user = socket.assigns.current_user

    if PrismaticAuth.has_any_role?(user, required_roles) do
      socket
    else
      socket
      |> Phoenix.LiveView.put_flash(:error, "Insufficient permissions")
      |> Phoenix.LiveView.redirect(to: "/unauthorized")
      |> Phoenix.LiveView.halt()
    end
  end

  def require_role(socket, required_role) do
    require_role(socket, [required_role])
  end

  @spec authorize_component(Phoenix.LiveView.Socket.t(), atom(), map()) :: boolean()
  def authorize_component(socket, component_name, params \\ %{}) do
    user = socket.assigns.current_user
    PrismaticAuth.authorize_component?(user, component_name, params)
  end
end
```

### Security Monitoring

Real-time security monitoring integrated into the web interface:

```elixir
defmodule PrismaticWeb.SecurityMonitorLive do
  @moduledoc """
  Real-time security monitoring dashboard with threat
  visualization and incident response capabilities.
  """
  use PrismaticWeb, :live_view

  @impl Phoenix.LiveView
  def mount(_params, _session, socket) do
    socket = PrismaticWeb.LiveAuth.require_role(socket, [:security_analyst, :admin])

    if connected?(socket) do
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "security:alerts")
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "security:incidents")
    end

    socket =
      socket
      |> assign(:page_title, "Security Monitor")
      |> assign(:active_threats, load_active_threats())
      |> assign(:recent_incidents, load_recent_incidents())
      |> assign(:threat_level, calculate_threat_level())

    {:ok, socket}
  end

  @impl Phoenix.LiveView
  def handle_info({:security_alert, alert}, socket) do
    # Real-time security alert handling
    updated_socket =
      socket
      |> update(:active_threats, fn threats -> [alert | threats] end)
      |> assign(:threat_level, recalculate_threat_level(socket.assigns))
      |> maybe_trigger_incident_response(alert)

    {:noreply, updated_socket}
  end

  defp maybe_trigger_incident_response(socket, alert) do
    if alert.severity == :critical do
      # Trigger incident response workflow
      PrismaticSafety.IncidentResponse.create_incident(alert)

      socket
      |> put_flash(:error, "Critical security alert: #{alert.description}")
      |> assign(:incident_response_active, true)
    else
      socket
    end
  end
end
```

## Integration Ecosystem

### Backend Service Integration

Comprehensive integration with all platform services:

```elixir
defmodule PrismaticWeb.ServiceIntegration do
  @moduledoc """
  Manages integration between LiveView and backend services
  with error handling and fallback strategies.
  """

  @services [
    :prismatic_perimeter,
    :prismatic_agents,
    :prismatic_hawkeye,
    :prismatic_storage,
    :prismatic_safety
  ]

  @spec call_service(atom(), atom(), list()) :: {:ok, any()} | {:error, term()}
  def call_service(service, function, args) when service in @services do
    try do
      result = apply(service_module(service), function, args)
      {:ok, result}
    rescue
      error ->
        Logger.error("Service call failed", service: service, function: function, error: error)
        {:error, error}
    catch
      :exit, reason ->
        Logger.error("Service exit", service: service, reason: reason)
        {:error, :service_unavailable}
    end
  end

  defp service_module(:prismatic_perimeter), do: PrismaticPerimeter
  defp service_module(:prismatic_agents), do: PrismaticAgents
  defp service_module(:prismatic_hawkeye), do: PrismaticHawkeye
  defp service_module(:prismatic_storage), do: PrismaticStorage
  defp service_module(:prismatic_safety), do: PrismaticSafety
end
```

## Related Concepts

- [Phoenix](/glossary/phoenix/) -- Web framework powering prismatic_web
- [LiveView](/glossary/liveview/) -- Server-rendered interactive UI technology
- [TailwindCSS](/glossary/tailwindcss/) -- Utility-first CSS framework mandated for all styling
- [Flowbite](/glossary/flowbite/) -- Component library providing UI building blocks
- [EASM](/glossary/easm/) -- External attack surface management dashboards
- [Prismatic API](/glossary/prismatic-api/) -- Companion REST API application on port 4004
- [Prismatic Perimeter](/glossary/prismatic-perimeter/) -- Backend providing security data for dashboards
- [WebSocket](/glossary/websocket/) -- Real-time communication protocol for LiveView
- [PubSub](/glossary/pubsub/) -- Message broadcasting for real-time updates
- [RBAC](/glossary/rbac/) -- Role-based access control system
- [Performance](/glossary/performance/) -- Performance engineering and optimization
- [Telemetry](/glossary/telemetry/) -- Monitoring and observability framework

## See Also

- [prismatic_web](../../../apps/prismatic_web/README.md) -- Main web application serving LiveView dashboards
- [prismatic_perimeter](../../../apps/prismatic_perimeter/README.md) -- Backend for security rating dashboards
- [prismatic_perimeter_web](../../../apps/prismatic_perimeter_web/README.md) -- Perimeter-specific LiveView components
- [prismatic_hawkeye_web](../../../apps/prismatic_hawkeye_web/README.md) -- Visitor intelligence web interface
- [prismatic_api](../../../apps/prismatic_api/README.md) -- Companion REST API on port 4004
- [prismatic_auth](../../../apps/prismatic_auth/README.md) -- Authentication and RBAC for web routes
- [Architecture](/architecture/) -- Platform architecture overview
- [Apps](/apps/) -- Umbrella applications including prismatic_web

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)