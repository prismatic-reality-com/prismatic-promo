+++
title = "Building LiveView Dashboards"
weight = 8
[extra]
description = "Real-time monitoring interfaces with Phoenix LiveView, Flowbite components, and TailwindCSS"
category = "intermediate"
difficulty = "intermediate"
duration = "60 min"
prerequisites = ["getting-started", "development-workflow"]
glossary_terms = ["aiad", "no-mercy", "quality-dna", "cascade", "easm"]
technologies = ["elixir", "phoenix-liveview", "tailwindcss", "flowbite"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 871
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Building", "LiveView", "Dashboards", "Real-time", "Phoenix", "Flowbite", "TailwindCSS", "academy", "intermediate", "Prismatic Platform"]
tags = ["academy", "intermediate", "building-liveview-dashboards", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "Building LiveView Dashboards - Prismatic Platform"
+++

## Overview

Phoenix LiveView enables rich, real-time dashboards without writing JavaScript. The Prismatic Platform uses LiveView for all its monitoring interfaces -- from the main dashboard at `/` to the EASM control panel at `/perimeter`. This guide teaches you to build production-quality LiveView dashboards that display live data, handle user interactions, and comply with the platform's strict styling requirements.

You will learn:

- LiveView architecture: mount, handle_event, handle_info lifecycle
- Real-time data updates via PubSub subscriptions
- TailwindCSS-first styling with Flowbite component patterns
- Navigation protection (never break phx-click dropdowns)
- Dashboard layout patterns used across the platform

## Prerequisites

- Completed [Getting Started with Prismatic Platform](@/academy/getting-started.md)
- Completed [Development Workflow & CI/CD](@/academy/development-workflow.md)
- Basic HTML/CSS knowledge
- Understanding of Phoenix routing (`router.ex`)

## Core Concepts

### LiveView Architecture

A LiveView module handles the full lifecycle of a server-rendered, real-time page:

1. **mount/3** -- called on initial page load and on WebSocket connection. Set up initial state.
2. **render/1** -- returns the HEEx template. Called after every state change.
3. **handle_event/3** -- processes user interactions (clicks, form submissions).
4. **handle_info/2** -- processes server-side messages (PubSub events, timer ticks).

The key insight: LiveView maintains a persistent WebSocket connection. When state changes, only the diff is sent to the browser. This gives you real-time updates with minimal bandwidth.

### TailwindCSS-First Rule

The platform enforces TailwindCSS utilities and Flowbite components exclusively:

- **REQUIRED**: TailwindCSS utility classes (`bg-gray-900`, `text-white`, `p-4`)
- **REQUIRED**: Flowbite component patterns (cards, tables, badges, modals)
- **FORBIDDEN**: Inline styles (`style="..."`)
- **FORBIDDEN**: Custom CSS files (except the base Tailwind input)

### Dark Mode

The platform uses forced dark mode. The `<html>` element has `class="dark"` permanently set. Use direct dark classes (`bg-gray-950`, `text-white`, `text-gray-400`) rather than `dark:` conditional prefixes on frontpage templates.

## Step-by-Step Guide

### Step 1: Create a LiveView Module

Create a dashboard that displays agent status in real-time:

```elixir
defmodule PrismaticWeb.AgentDashboardLive do
  @moduledoc """
  Real-time dashboard displaying agent health, activity, and alerts.
  Subscribes to agent telemetry events for live updates.
  """

  use PrismaticWeb, :live_view

  alias PrismaticAgents.Registry

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      # Subscribe to agent events for live updates
      Phoenix.PubSub.subscribe(Prismatic.PubSub, "agents:status")

      # Schedule periodic refresh
      :timer.send_interval(5_000, self(), :refresh)
    end

    {:ok, assign_agent_data(socket)}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="min-h-screen bg-gray-950 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white">Agent Dashboard</h1>
          <p class="text-gray-400 mt-2">
            <%= @total_agents %> agents active | Last updated: <%= @last_updated %>
          </p>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <.stat_card title="Total Agents" value={@total_agents} color="blue" />
          <.stat_card title="Healthy" value={@healthy_count} color="green" />
          <.stat_card title="Warning" value={@warning_count} color="yellow" />
          <.stat_card title="Critical" value={@critical_count} color="red" />
        </div>

        <!-- Agent Table -->
        <div class="bg-gray-900 rounded-lg border border-gray-800">
          <div class="p-4 border-b border-gray-800">
            <h2 class="text-xl font-semibold text-white">Agent Registry</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-gray-400">
              <thead class="text-xs text-gray-400 uppercase bg-gray-800">
                <tr>
                  <th class="px-6 py-3">Agent</th>
                  <th class="px-6 py-3">Tier</th>
                  <th class="px-6 py-3">Status</th>
                  <th class="px-6 py-3">Last Activity</th>
                  <th class="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <%= for agent <- @agents do %>
                  <tr class="border-b border-gray-800 hover:bg-gray-800">
                    <td class="px-6 py-4 font-medium text-white"><%= agent.name %></td>
                    <td class="px-6 py-4"><%= agent.tier %></td>
                    <td class="px-6 py-4">
                      <.status_badge status={agent.status} />
                    </td>
                    <td class="px-6 py-4"><%= format_time(agent.last_activity) %></td>
                    <td class="px-6 py-4">
                      <button
                        phx-click="inspect_agent"
                        phx-value-name={agent.name}
                        class="text-blue-400 hover:text-blue-300"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                <% end %>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    """
  end

  # Function components for reusable UI elements

  defp stat_card(assigns) do
    color_classes = %{
      "blue" => "text-blue-400 bg-blue-400/10",
      "green" => "text-green-400 bg-green-400/10",
      "yellow" => "text-yellow-400 bg-yellow-400/10",
      "red" => "text-red-400 bg-red-400/10"
    }

    assigns = assign(assigns, :color_class, Map.get(color_classes, assigns.color, "text-gray-400"))

    ~H"""
    <div class="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <p class="text-sm text-gray-400 uppercase tracking-wide"><%= @title %></p>
      <p class={"text-3xl font-bold mt-2 #{@color_class}"}><%= @value %></p>
    </div>
    """
  end

  defp status_badge(assigns) do
    {text, class} = case assigns.status do
      :healthy -> {"Healthy", "bg-green-400/10 text-green-400"}
      :warning -> {"Warning", "bg-yellow-400/10 text-yellow-400"}
      :critical -> {"Critical", "bg-red-400/10 text-red-400"}
      _ -> {"Unknown", "bg-gray-400/10 text-gray-400"}
    end

    assigns = assign(assigns, text: text, class: class)

    ~H"""
    <span class={"px-2 py-1 text-xs font-medium rounded-full #{@class}"}>
      <%= @text %>
    </span>
    """
  end

  # Event Handlers

  @impl true
  def handle_event("inspect_agent", %{"name" => name}, socket) do
    {:noreply, push_navigate(socket, to: ~p"/agents/#{name}")}
  end

  @impl true
  def handle_info(:refresh, socket) do
    {:noreply, assign_agent_data(socket)}
  end

  @impl true
  def handle_info({:agent_status_changed, _event}, socket) do
    {:noreply, assign_agent_data(socket)}
  end

  # Private helpers

  defp assign_agent_data(socket) do
    agents = Registry.list_agents_with_status()

    socket
    |> assign(:agents, agents)
    |> assign(:total_agents, length(agents))
    |> assign(:healthy_count, Enum.count(agents, &(&1.status == :healthy)))
    |> assign(:warning_count, Enum.count(agents, &(&1.status == :warning)))
    |> assign(:critical_count, Enum.count(agents, &(&1.status == :critical)))
    |> assign(:last_updated, Calendar.strftime(DateTime.utc_now(), "%H:%M:%S UTC"))
  end

  defp format_time(nil), do: "Never"
  defp format_time(dt), do: Calendar.strftime(dt, "%Y-%m-%d %H:%M")
end
```

### Step 2: Add the Route

```elixir
# In lib/prismatic_web/router.ex
scope "/", PrismaticWeb do
  pipe_through [:browser, :require_authenticated_user]

  live "/agents", AgentDashboardLive, :index
  live "/agents/:name", AgentDetailLive, :show
end
```

### Step 3: Real-Time Updates via PubSub

When agents change status, broadcast the event:

```elixir
# In the agent module
defp broadcast_status_change(agent_name, new_status) do
  Phoenix.PubSub.broadcast(
    Prismatic.PubSub,
    "agents:status",
    {:agent_status_changed, %{name: agent_name, status: new_status}}
  )
end
```

The LiveView's `handle_info/2` receives this broadcast and updates the UI automatically. No polling, no JavaScript, no manual DOM manipulation.

### Step 4: Flowbite Component Patterns

Use Flowbite's component patterns for consistent UI:

```heex
<!-- Modal (Flowbite pattern with Alpine.js) -->
<div
  x-data="{ open: false }"
  x-show="open"
  class="fixed inset-0 z-50 overflow-y-auto"
>
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-white">Agent Details</h3>
      <p class="text-gray-400 mt-2">Detailed agent information here.</p>
      <button
        @click="open = false"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Close
      </button>
    </div>
  </div>
</div>
```

### Step 5: Rebuild TailwindCSS

After any template changes, rebuild the CSS:

```bash
cd sites/promo && npx tailwindcss -i static/css/tailwind-input.css -o static/css/tailwind.css --minify
```

For the main application:

```bash
cd apps/prismatic_web/assets && npx tailwindcss -i css/app.css -o ../priv/static/assets/app.css
```

Failing to rebuild causes invisible text and missing styles -- the most common "it doesn't work" issue.

## Code Examples

### Live Chart with Periodic Updates

```elixir
@impl true
def mount(_params, _session, socket) do
  if connected?(socket) do
    :timer.send_interval(1_000, self(), :tick)
  end

  {:ok, assign(socket, :data_points, [])}
end

@impl true
def handle_info(:tick, socket) do
  new_point = %{
    timestamp: DateTime.utc_now(),
    value: :rand.uniform(100)
  }

  points = Enum.take([new_point | socket.assigns.data_points], 60)
  {:noreply, assign(socket, :data_points, points)}
end
```

## Common Pitfalls

**Breaking phx-click dropdowns.** Navigation protection is a mandatory requirement. Never add event handlers that interfere with existing `phx-click` bindings on dropdown menus or navigation elements.

**Using inline styles.** The platform forbids `style="..."` attributes. Use TailwindCSS utility classes exclusively.

**Forgetting `connected?/1` check.** PubSub subscriptions and timers must only be set up when the socket is connected (WebSocket phase), not during the initial static render (HTTP phase).

**Heavy computation in render.** The `render/1` function is called on every state change. Keep it lightweight. Precompute values in `mount/3`, `handle_event/3`, or `handle_info/2` and store them in assigns.

**Not rebuilding TailwindCSS after template changes.** Stale CSS is the number one cause of "invisible text" bugs. Always rebuild after adding new utility classes.

## Exercises

1. **Add sorting.** Implement column header clicks that sort the agent table by name, tier, or status. Use `phx-click` events and maintain sort state in assigns.

2. **Add filtering.** Add a dropdown that filters agents by tier (L1, L2, L3, L4). Use the Flowbite select component pattern.

3. **Build a detail page.** Create the `AgentDetailLive` module that shows full details for a single agent, including its configuration, history, and telemetry metrics.

4. **Add live search.** Implement a search input with `phx-change` debounce that filters agents by name as the user types.

## Summary

LiveView provides real-time dashboards with server-rendered HTML, WebSocket-based updates, and zero custom JavaScript. The platform enforces TailwindCSS-first styling with Flowbite components, dark mode by default, and strict navigation protection. PubSub integration enables instant UI updates when backend state changes. Always rebuild TailwindCSS after template modifications.

## Practical Implementation

### In Prismatic Platform

LiveView dashboards are implemented primarily in these applications:

- **prismatic_web** (`apps/prismatic_web/`) -- The primary Phoenix LiveView application serving dashboards at `http://localhost:4000`. Contains LiveView modules for the main dashboard (`/`), EASM (`/perimeter`), DD investigations (`/dd`), Labs (`/labs`), and agent monitoring. Routes are defined in `lib/prismatic_web/router.ex`
- **prismatic_perimeter_web** (`apps/prismatic_perimeter_web/`) -- Perimeter-specific LiveView components for EASM dashboards including asset inventory, compliance assessment, and security rating displays
- **prismatic_hawkeye_web** (`apps/prismatic_hawkeye_web/`) -- Visitor intelligence (HAWKEYE) dashboard components for real-time visitor monitoring
- **prismatic_ir_pvm_web** (`apps/prismatic_ir_pvm_web/`) -- Incident response and PVM (Process Virtual Machine) visualization dashboards

### Code Examples from the Codebase

The DD investigation dashboard demonstrates multi-route LiveView patterns:

```elixir
# From prismatic_web/lib/prismatic_web/router.ex
scope "/dd", PrismaticWeb.DD do
  live "/", OverviewLive, :index
  live "/investigate", InvestigateLive, :index
  live "/cases", CasesLive, :index
  live "/cases/new", CasesLiveNew, :new
  live "/entities", EntitiesLive, :index
  live "/graph", GraphLive, :index
end

scope "/perimeter", PrismaticWeb.Perimeter do
  live "/", DashboardLive, :index
  live "/assets", AssetsLive, :index
  live "/compliance", ComplianceLive, :index
  live "/easm", EasmLive, :index
end
```

Real-time updates via PubSub follow the platform-standard pattern:

```elixir
# Subscribe in mount/3 only when WebSocket is connected
if connected?(socket) do
  Phoenix.PubSub.subscribe(Prismatic.PubSub, "agents:status")
  :timer.send_interval(5_000, self(), :refresh)
end
```

## See Also

### Related Applications
- [prismatic_web](@/apps/prismatic-web.md) -- Main Phoenix LiveView application
- [prismatic_perimeter_web](@/apps/prismatic-perimeter-web.md) -- EASM-specific dashboard components
- [prismatic_hawkeye_web](@/apps/prismatic-hawkeye-web.md) -- Visitor intelligence dashboards

### Glossary
- [Phoenix LiveView](@/glossary/phoenix-liveview.md) -- Real-time server-rendered UI framework
- [TailwindCSS](@/glossary/tailwindcss.md) -- Utility-first CSS framework (mandatory)
- [PubSub](@/glossary/pubsub.md) -- Broadcast communication for live updates
- [EASM](@/glossary/easm.md) -- External Attack Surface Management dashboards
- [Phoenix](@/glossary/phoenix.md) -- Elixir web framework

### Architecture
- [Phoenix LiveView](@/architecture/phoenix-liveview.md) -- LiveView architecture and patterns
- [PubSub](@/architecture/pubsub.md) -- Real-time event distribution architecture

### Related Academy Topics
- [Building EASM Features](@/academy/easm-development.md) -- The Perimeter dashboard as production LiveView
- [Storage Architecture](@/academy/storage-patterns.md) -- Data sources powering dashboard displays
- [API Integration](@/academy/api-integration.md) -- REST API as alternative to LiveView
- [DD Investigation Techniques](@/academy/dd-investigation.md) -- DD dashboard and case management

## Next Steps

- [Building EASM Features](@/academy/easm-development.md) -- the Perimeter dashboard is a production LiveView example
- [Storage Architecture & Adapters](@/academy/storage-patterns.md) -- data sources for your dashboards
- [API Integration Guide](@/academy/api-integration.md) -- REST API alternatives to LiveView

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)