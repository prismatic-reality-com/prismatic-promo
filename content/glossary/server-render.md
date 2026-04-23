+++
title = "Server Render"
weight = 50
[extra]
description = "Server-side HTML generation technique where the server produces complete page markup before sending to the client"
category = "web"
related_terms = ["server", "process", "runtime", "profiling", "percentile"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["server render", "SSR", "server-side rendering", "Phoenix", "LiveView", "HTML generation", "glossary", "Prismatic Platform"]
tags = ["glossary", "web", "phoenix", "liveview"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Server Render - Prismatic Platform"
+++

## Definition & Overview

Server-side rendering (SSR) is the technique of generating complete HTML markup on the server before sending it to the client browser. In contrast to client-side rendering (where the browser receives minimal HTML and JavaScript constructs the page), server rendering delivers a fully formed page that the browser can display immediately. This approach provides faster First Contentful Paint (FCP), better SEO (search engines see complete content), and works without JavaScript on the client.

Phoenix LiveView, the Prismatic Platform's primary UI framework, uses a sophisticated server rendering model. The initial page load is server-rendered -- the browser receives complete HTML. After the initial load, a WebSocket connection is established, and subsequent interactions are handled through server-rendered DOM patches sent over the WebSocket. This model combines the performance benefits of server rendering with the interactivity of single-page applications, without requiring a separate JavaScript framework.

The Prismatic Platform enforces strict server render performance requirements: total page load under 250ms, server-side render time under 100ms, LiveView mount under 150ms, and LiveView event handling under 50ms. These requirements ensure that the server rendering advantage (fast initial display) is not negated by slow server-side processing. Every LiveView page must include Benchee performance tests that verify these thresholds.

## Technical Deep Dive

Phoenix LiveView rendering follows a two-phase process: static render (producing the initial HTML) and connected mount (establishing the WebSocket and initializing live state). The static render produces SEO-friendly HTML that the browser displays while the WebSocket connection is being established.

```elixir
defmodule PrismaticWeb.OsintToolboxLive do
  @moduledoc """
  OSINT Toolbox LiveView with optimized server rendering.
  Initial render queries ETS-cached tool registry for
  sub-millisecond data access.
  """

  use PrismaticWeb, :live_view

  @impl true
  def mount(params, _session, socket) do
    # Data loaded from ETS -- sub-millisecond access
    categories = PrismaticOsintCore.ToolRegistry.list_categories()
    tools = load_tools(params)

    socket =
      socket
      |> assign(:categories, categories)
      |> assign(:tools, tools)
      |> assign(:selected_category, params["category"])
      |> assign(:page_title, "OSINT Toolbox")

    {:ok, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="min-h-screen bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-white mb-8">OSINT Toolbox</h1>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside class="hidden lg:block">
            <nav class="space-y-1">
              <%= for category <- @categories do %>
                <.link
                  navigate={~p"/osint/toolbox/#{category.slug}"}
                  class="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800"
                >
                  <%= category.name %> (<%= category.count %>)
                </.link>
              <% end %>
            </nav>
          </aside>

          <div class="lg:col-span-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <%= for tool <- @tools do %>
                <.link
                  navigate={~p"/osint/toolbox/#{tool.category}/#{tool.slug}"}
                  class="bg-gray-800 rounded-lg p-4 hover:bg-gray-750"
                >
                  <h3 class="text-white font-medium"><%= tool.name %></h3>
                  <p class="text-gray-400 text-sm mt-1"><%= tool.description %></p>
                </.link>
              <% end %>
            </div>
          </div>
        </div>
      </div>
    </div>
    """
  end

  defp load_tools(%{"category" => category}) do
    PrismaticOsintCore.ToolRegistry.list_by_category(String.to_existing_atom(category))
  end

  defp load_tools(_params) do
    PrismaticOsintCore.ToolRegistry.list_all()
  end
end
```

The HEEx template engine compiles templates at build time into optimized Elixir functions. This compilation step means that template rendering involves function calls and IO list construction rather than string parsing, making server rendering extremely fast.

```elixir
defmodule PrismaticWeb.RenderBenchmark do
  @moduledoc """
  Benchmarks server render times for LiveView pages.
  All pages must render within 100ms (P95) to meet
  platform performance standards.
  """

  @spec benchmark_render(module(), map()) :: map()
  def benchmark_render(live_module, assigns \\ %{}) do
    socket = build_test_socket(assigns)

    {time_us, rendered} = :timer.tc(fn ->
      Phoenix.LiveView.Engine.render(live_module, socket.assigns)
    end)

    html_size = rendered |> Phoenix.HTML.Safe.to_iodata() |> IO.iodata_length()

    %{
      render_time_us: time_us,
      render_time_ms: time_us / 1000,
      html_size_bytes: html_size,
      meets_sla: time_us / 1000 < 100.0
    }
  end

  defp build_test_socket(assigns) do
    %Phoenix.LiveView.Socket{
      assigns: Map.merge(%{__changed__: %{}}, assigns)
    }
  end
end
```

Performance optimization for server rendering focuses on three areas: minimizing data access time (using ETS-cached registries instead of database queries), reducing template complexity (avoiding deeply nested loops and complex conditionals), and limiting the HTML payload size (pagination, lazy loading for large lists).

```elixir
defmodule PrismaticWeb.RenderOptimizer do
  @moduledoc """
  Optimizations for server-side rendering performance.
  Ensures all LiveView pages meet the 100ms render SLA.
  """

  @spec preload_assigns(map(), keyword()) :: map()
  def preload_assigns(assigns, opts \\ []) do
    # Parallel data loading for independent assigns
    tasks = Keyword.get(opts, :tasks, [])

    results =
      tasks
      |> Task.async_stream(fn {key, loader} ->
        {key, loader.()}
      end, max_concurrency: 4, timeout: 5_000)
      |> Enum.reduce(assigns, fn
        {:ok, {key, value}}, acc -> Map.put(acc, key, value)
        _, acc -> acc
      end)

    results
  end

  @spec paginate(list(), non_neg_integer(), non_neg_integer()) :: %{
    items: list(),
    total: non_neg_integer(),
    page: non_neg_integer(),
    per_page: non_neg_integer(),
    total_pages: non_neg_integer()
  }
  def paginate(items, page, per_page) do
    total = length(items)
    total_pages = max(ceil(total / per_page), 1)
    offset = (page - 1) * per_page

    %{
      items: Enum.slice(items, offset, per_page),
      total: total,
      page: page,
      per_page: per_page,
      total_pages: total_pages
    }
  end
end
```

## Architecture & Implementation

The server rendering architecture in Phoenix LiveView operates through the Plug pipeline. An HTTP request arrives at the endpoint, passes through the router, and reaches the LiveView module. The `mount/3` callback loads data, and the `render/1` callback produces the HTML. The complete HTML response is sent to the browser in a single HTTP response, with no JavaScript required for the initial display.

After the initial render, LiveView establishes a WebSocket connection and re-mounts with `connected?(socket)` returning true. Subsequent user interactions (clicks, form submissions) are sent over the WebSocket, processed by `handle_event/3` callbacks, and the server sends back minimal DOM patches (diffs) rather than full page re-renders. This architecture minimizes bandwidth and provides instant-feeling interactions.

The Prismatic Platform's Zola-based promo site uses a different server rendering model: static site generation (SSG). Pages are rendered to static HTML at build time, with no server-side processing at request time. This provides the fastest possible server response (just serving static files) at the cost of dynamic content capability.

## Usage in Prismatic Platform

Server rendering performance is validated through Benchee tests and the performance monitoring pipeline. All new LiveView pages require performance benchmarks.

```elixir
# Verify render performance
result = PrismaticWeb.RenderBenchmark.benchmark_render(
  PrismaticWeb.OsintToolboxLive,
  %{categories: categories, tools: tools}
)

assert result.meets_sla, "Render time #{result.render_time_ms}ms exceeds 100ms SLA"
```

The platform's 250ms total page load budget is allocated as: 100ms server render, 50ms network transfer, 100ms client parsing and paint. This budget drives architectural decisions -- data must come from ETS or pre-computed caches, never from database queries in the render path.

## Cross-References

- [Server](/glossary/server/) - Network service hosting the render engine
- [Process](/glossary/process/) - BEAM processes handling render requests
- [Runtime](/glossary/runtime/) - Server configuration affecting render performance
- [Profiling](/glossary/profiling/) - Measuring server render performance
- [Percentile](/glossary/percentile/) - Render time P95 thresholds for SLA enforcement

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
