+++
title = "Time to First Byte"
weight = 50
[extra]
description = "TTFB performance metric measuring elapsed time from client request to the first byte of server response"
category = "performance"
related_terms = ["latency", "throughput", "monitoring", "uptime"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["TTFB", "time to first byte", "performance", "latency", "web performance", "glossary", "Prismatic Platform"]
tags = ["glossary", "performance"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Time to First Byte - Prismatic Platform"
+++

## Definition & Overview

Time to First Byte (TTFB) is a performance metric that measures the duration between a client sending an HTTP request and receiving the first byte of the response from the server. It encompasses three distinct phases: DNS resolution, TCP/TLS connection establishment, and server processing time. TTFB is widely considered one of the most important indicators of server-side performance because it captures everything that happens before the client can begin rendering content.

A low TTFB indicates that the server is processing requests efficiently, the network path is well-optimized, and backend operations (database queries, business logic, template rendering) are completing quickly. Conversely, high TTFB signals bottlenecks in server processing, slow database queries, inefficient middleware chains, or network congestion between the client and the origin server.

The Prismatic Platform enforces a strict P0 performance standard where all pages must load under 250ms total, with server-side render time capped at 100ms. TTFB is a critical subset of this budget, as it directly impacts perceived responsiveness. The platform's LiveView architecture provides inherent TTFB advantages because the initial HTML render happens server-side without client-side JavaScript execution delays.

## Technical Deep Dive

TTFB can be decomposed into measurable sub-components, each offering different optimization opportunities:

```elixir
defmodule PrismaticPerformance.TTFBAnalyzer do
  @moduledoc """
  Decomposes TTFB into constituent phases for targeted
  optimization of server-side response times.
  """

  @type ttfb_breakdown :: %{
    dns_lookup_ms: float(),
    tcp_connect_ms: float(),
    tls_handshake_ms: float(),
    server_processing_ms: float(),
    total_ttfb_ms: float()
  }

  @spec measure(String.t(), keyword()) :: {:ok, ttfb_breakdown()} | {:error, term()}
  def measure(url, opts \\ []) do
    iterations = Keyword.get(opts, :iterations, 10)

    results =
      1..iterations
      |> Enum.map(fn _ -> single_measurement(url) end)
      |> Enum.filter(&match?({:ok, _}, &1))
      |> Enum.map(fn {:ok, breakdown} -> breakdown end)

    case results do
      [] -> {:error, :all_measurements_failed}
      measurements -> {:ok, aggregate_measurements(measurements)}
    end
  end

  defp single_measurement(url) do
    start = System.monotonic_time(:microsecond)

    case :httpc.request(:get, {String.to_charlist(url), []}, [timeout: 10_000], []) do
      {:ok, {{_, status, _}, _headers, _body}} when status in 200..399 ->
        elapsed = System.monotonic_time(:microsecond) - start
        {:ok, %{total_ttfb_ms: elapsed / 1_000, status: status}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp aggregate_measurements(measurements) do
    values = Enum.map(measurements, & &1.total_ttfb_ms)

    %{
      p50_ms: percentile(values, 50),
      p95_ms: percentile(values, 95),
      p99_ms: percentile(values, 99),
      mean_ms: Enum.sum(values) / length(values),
      min_ms: Enum.min(values),
      max_ms: Enum.max(values),
      sample_count: length(values)
    }
  end

  defp percentile(sorted_values, pct) do
    sorted = Enum.sort(sorted_values)
    rank = pct / 100.0 * (length(sorted) - 1)
    lower = floor(rank)
    upper = ceil(rank)
    fraction = rank - lower

    Enum.at(sorted, lower) * (1 - fraction) + Enum.at(sorted, upper) * fraction
  end
end
```

Server processing time, the component most directly under application control, includes router matching, plug pipeline execution, controller/LiveView logic, database queries, and response serialization. The Prismatic Platform uses Phoenix's built-in telemetry to measure each phase independently.

Connection-level optimizations like HTTP/2 multiplexing, TLS session resumption, and TCP keep-alive significantly reduce the non-processing components of TTFB for repeat visitors. The Fly.io deployment infrastructure provides edge termination that minimizes network round-trip time for geographically distributed users.

## Architecture & Implementation

The platform's TTFB optimization architecture operates at multiple levels, from infrastructure to application code:

**Plug Pipeline Optimization**: Every plug in the request pipeline is instrumented with telemetry. Plugs that contribute more than 5ms to TTFB are flagged for optimization. The authentication plug, which validates API keys and JWT tokens, is particularly critical and uses ETS-cached session lookups to maintain sub-millisecond overhead.

**ETS-First Data Access**: For frequently accessed data like OSINT tool configurations, academy topics, and DD source registries, the platform reads from ETS tables rather than PostgreSQL. This reduces database round-trips during request processing, keeping server-side TTFB contribution to single-digit milliseconds for most pages.

**LiveView Mount Optimization**: Phoenix LiveView pages have a two-phase lifecycle: static render (contributing to TTFB) and WebSocket mount. The platform ensures that the static render phase includes only essential data, deferring expensive operations to the connected mount phase.

```elixir
defmodule PrismaticWeb.Plugs.TTFBTelemetry do
  @moduledoc """
  Plug that measures and reports TTFB for every request,
  emitting telemetry events for monitoring and alerting.
  """

  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    start_time = System.monotonic_time(:microsecond)

    Plug.Conn.register_before_send(conn, fn conn ->
      duration_us = System.monotonic_time(:microsecond) - start_time
      duration_ms = duration_us / 1_000

      :telemetry.execute(
        [:prismatic, :web, :ttfb],
        %{duration_ms: duration_ms, duration_us: duration_us},
        %{
          path: conn.request_path,
          method: conn.method,
          status: conn.status
        }
      )

      if duration_ms > 100 do
        require Logger
        Logger.warning("TTFB exceeded 100ms: #{duration_ms}ms for #{conn.method} #{conn.request_path}")
      end

      conn
    end)
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform's P0 performance standard mandates specific TTFB budgets for different page categories. The health check endpoint must respond within 10ms. Standard LiveView pages must achieve server-side render under 100ms. The OSINT toolbox, which dynamically generates forms from 127 registered tools, must still meet these thresholds thanks to ETS-cached tool configurations.

```elixir
defmodule PrismaticPerformance.TTFBBudget do
  @moduledoc """
  Defines and enforces TTFB budgets per route category.
  Violations trigger alerts and block deploys.
  """

  @budgets %{
    health_check: 10,
    static_page: 50,
    liveview_mount: 150,
    api_endpoint: 100,
    osint_toolbox: 100,
    perimeter_dashboard: 100
  }

  @spec check_budget(atom(), float()) :: :ok | {:violation, map()}
  def check_budget(category, ttfb_ms) do
    budget = Map.fetch!(@budgets, category)

    if ttfb_ms <= budget do
      :ok
    else
      {:violation, %{
        category: category,
        budget_ms: budget,
        actual_ms: ttfb_ms,
        overage_ms: ttfb_ms - budget,
        severity: violation_severity(ttfb_ms, budget)
      }}
    end
  end

  defp violation_severity(actual, budget) do
    ratio = actual / budget
    cond do
      ratio > 5.0 -> :critical
      ratio > 2.0 -> :high
      ratio > 1.5 -> :medium
      true -> :low
    end
  end
end
```

Production monitoring on Fly.io tracks P50, P95, and P99 TTFB percentiles continuously. When P95 exceeds 200ms, automated alerts fire. The CI/CD pipeline includes Benchee-based performance tests that verify TTFB budgets before allowing deployments to proceed.

## Cross-References

- [Latency](@/glossary/latency.md) - General response time measurement
- **Uptime** - Service availability metric
- [Monitoring](@/glossary/monitoring.md) - Operational observation
- [Telemetry](@/glossary/telemetry.md) - Event measurement framework
- **Warmup** - Initialization phase affecting initial TTFB

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
