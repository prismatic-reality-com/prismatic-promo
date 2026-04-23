+++
title = "Page Load"
weight = 50
[extra]
description = "The total time from navigation start to the page being fully rendered and interactive, a critical user experience and performance metric."
category = "performance"
related_terms = ["p95", "latency", "live-view", "server-side-rendering"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["page load", "performance", "web performance", "render time", "user experience", "glossary", "Prismatic Platform"]
tags = ["glossary", "performance"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Page Load - Prismatic Platform"
+++

## Definition & Overview

Page load time is the duration from when a user initiates navigation (clicking a link, entering a URL) to when the page is fully rendered and interactive. It encompasses DNS resolution, TCP connection establishment, TLS handshake, HTTP request/response, HTML parsing, CSS/JavaScript download and execution, and final rendering. Page load is the most directly user-visible performance metric and has a documented impact on user engagement, conversion rates, and satisfaction.

Research consistently shows that page load times above 3 seconds cause significant user abandonment, with each additional second reducing conversion rates by approximately 7%. For professional tools used by analysts (like OSINT platforms), responsiveness is even more critical because users interact with many pages per session. A 250ms page load enables fluid, desktop-application-like navigation that supports rapid investigation workflows.

The Prismatic Platform enforces a strict 250ms page load performance standard (P0 - ABSOLUTE). This is measured at P95, meaning 95% of all page loads must complete within 250ms. The standard breaks down into sub-budgets: server-side render under 100ms, LiveView mount under 150ms, and handle_event under 50ms. These budgets are enforced through CI quality gates, production telemetry alerts, and merge blocking on violations.

## Technical Deep Dive

Page load is decomposed into server-side and client-side components. Server-side time includes request routing, authentication, data fetching (database queries, ETS lookups, external API calls), template rendering, and response serialization. Client-side time includes network transfer, HTML parsing, CSS application, JavaScript execution, and paint/layout operations.

In the Prismatic Platform's Phoenix/LiveView architecture, the initial page load follows a specific sequence: the first HTTP request receives server-rendered HTML (fast time-to-first-byte), followed by LiveView's WebSocket connection establishment for interactivity. Subsequent navigations use LiveView's client-side routing, which patches the DOM without full page reloads, achieving near-instant perceived navigation.

```elixir
defmodule PrismaticWeb.Plugs.PerformanceMonitor do
  @moduledoc """
  Plug that measures and records page load server-side timing.
  Emits telemetry events for percentile tracking.
  """

  import Plug.Conn

  @spec init(keyword()) :: keyword()
  def init(opts), do: opts

  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(conn, _opts) do
    start_time = System.monotonic_time(:microsecond)

    conn
    |> register_before_send(fn conn ->
      duration_us = System.monotonic_time(:microsecond) - start_time
      duration_ms = duration_us / 1000

      :telemetry.execute(
        [:prismatic, :web, :page_load],
        %{duration_ms: duration_ms, duration_us: duration_us},
        %{
          path: conn.request_path,
          method: conn.method,
          status: conn.status
        }
      )

      # Add Server-Timing header for client-side debugging
      put_resp_header(conn, "server-timing",
        "render;dur=#{Float.round(duration_ms, 2)}")
    end)
  end
end

defmodule PrismaticWeb.Performance.BudgetEnforcer do
  @moduledoc """
  Enforces page load performance budgets.
  Alerts when server-side render time approaches limits.
  """

  @budgets %{
    total_page_load: 250,
    server_render: 100,
    live_view_mount: 150,
    handle_event: 50,
    health_check: 10
  }

  @type budget_check :: %{
    metric: atom(),
    budget_ms: number(),
    actual_ms: number(),
    status: :ok | :warning | :violation,
    margin_pct: float()
  }

  @spec check_budget(atom(), number()) :: budget_check()
  def check_budget(metric, actual_ms) do
    budget = Map.fetch!(@budgets, metric)
    margin_pct = (budget - actual_ms) / budget * 100

    status =
      cond do
        actual_ms <= budget * 0.8 -> :ok
        actual_ms <= budget -> :warning
        true -> :violation
      end

    %{
      metric: metric,
      budget_ms: budget,
      actual_ms: Float.round(actual_ms, 2),
      status: status,
      margin_pct: Float.round(margin_pct, 1)
    }
  end

  @spec all_budgets_compliant?(map()) :: boolean()
  def all_budgets_compliant?(metrics) do
    Enum.all?(@budgets, fn {metric, budget} ->
      Map.get(metrics, metric, 0) <= budget
    end)
  end
end
```

The Server-Timing HTTP header provides visibility into server-side processing time directly in browser DevTools, enabling developers to measure the server component of page load without external tooling. The platform adds this header to all responses, making performance debugging straightforward.

## Architecture & Implementation

The Prismatic Platform achieves sub-250ms page loads through several architectural decisions. ETS-based registries provide sub-millisecond data access, eliminating database round-trips for common lookups (tool registry, topic registry, source registry). Phoenix's server-side rendering produces complete HTML on the first request, eliminating the "blank page while JavaScript loads" problem common in SPA architectures. LiveView's morphdom-based DOM patching minimizes client-side work for subsequent updates.

Static assets (TailwindCSS, JavaScript, images) are fingerprinted and served with far-future cache headers, eliminating download time for repeat visitors. The Fly.io edge network provides geographic proximity to users, reducing network latency. Gzip compression reduces transfer sizes by 70-80% for HTML and CSS responses.

Database queries are optimized through indexed columns, query plan analysis, and connection pooling. The platform maintains a query budget: each page handler has a documented maximum number of database queries (typically 1-3), and N+1 query patterns are detected by the pre-commit quality gate. Preloading and eager loading in Ecto ensure related data is fetched in batch rather than per-item.

## Usage in Prismatic Platform

LiveView mount performance tracking:

```elixir
defmodule PrismaticWeb.Live.PerformanceHook do
  @moduledoc """
  LiveView lifecycle hook that tracks mount and event handling times.
  Automatically attached to all LiveView modules.
  """

  import Phoenix.LiveView

  def on_mount(:performance_tracking, _params, _session, socket) do
    socket =
      socket
      |> attach_hook(:mount_timing, :handle_params, fn _params, _uri, socket ->
        mount_start = socket.assigns[:_mount_start]

        if mount_start do
          duration = System.monotonic_time(:microsecond) - mount_start
          duration_ms = duration / 1000

          :telemetry.execute(
            [:prismatic, :web, :live_view_mount],
            %{duration_ms: duration_ms},
            %{view: socket.view}
          )
        end

        {:cont, assign(socket, :_mount_start, System.monotonic_time(:microsecond))}
      end)
      |> attach_hook(:event_timing, :handle_event, fn event, _params, socket ->
        start = System.monotonic_time(:microsecond)

        socket = assign(socket, :_event_start, start)
        socket = assign(socket, :_event_name, event)

        {:cont, socket}
      end)
      |> assign(:_mount_start, System.monotonic_time(:microsecond))

    {:cont, socket}
  end
end
```

Page load performance is the most visible quality metric in the platform, directly impacting analyst productivity and investigation workflow efficiency. The strict 250ms standard, enforced at P95 through automated quality gates, ensures the platform maintains desktop-application-like responsiveness.

## Cross-References

- [P95](@/glossary/p95.md) - Percentile at which page load is measured for SLA
- [P99](@/glossary/p99.md) - Tail latency tracking for worst-case page loads
- [LiveView](@/glossary/liveview.md) - Phoenix framework enabling real-time page updates
- [ETS](@/glossary/ets.md) - In-memory storage enabling sub-millisecond data access
- [IPS](@/glossary/ips.md) - Throughput metric related to page rendering capacity

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
