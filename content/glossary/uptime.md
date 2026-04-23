+++
title = "Uptime"
weight = 50
[extra]
description = "Service availability percentage measuring the proportion of time a system is operational and accessible to users"
category = "infrastructure"
related_terms = ["sla", "monitoring", "health-check", "reliability"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["uptime", "availability", "SLA", "reliability", "service level", "glossary", "Prismatic Platform"]
tags = ["glossary", "infrastructure"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Uptime - Prismatic Platform"
+++

## Definition & Overview

Uptime is the percentage of time a system or service is operational and accessible to its users, calculated as the ratio of available time to total time within a measurement period. Expressed as a percentage with increasing precision, uptime targets define service reliability expectations: 99% uptime allows 3.65 days of downtime per year, 99.9% (three nines) allows 8.76 hours, 99.99% (four nines) allows 52.6 minutes, and 99.999% (five nines) allows just 5.26 minutes of annual downtime.

Uptime is the most visible metric of service reliability and forms the foundation of Service Level Agreements (SLAs). However, raw uptime numbers can be misleading without context. A service might report 99.9% uptime while experiencing frequent 30-second outages that collectively fit within the budget but severely impact user experience. Modern reliability engineering supplements uptime with more nuanced metrics like error budgets, latency percentiles, and success rate to provide a comprehensive picture of service health.

The Prismatic Platform, deployed on Fly.io with staging (prismatic-staging.fly.dev) and production (prismatic-prod.fly.dev) environments, monitors uptime through health check endpoints that verify not just HTTP connectivity but also critical dependency availability (PostgreSQL, ETS tables, OSINT tool registry). The Ollama local AI integration targets >99% uptime for inference availability, with automatic cloud fallback when local models are unavailable.

## Technical Deep Dive

The platform implements health checks that provide granular uptime visibility:

```elixir
defmodule PrismaticWeb.HealthController do
  @moduledoc """
  Health check endpoint that verifies system component
  availability for uptime monitoring.
  """

  use PrismaticWeb, :controller

  @health_checks [
    {:database, &__MODULE__.check_database/0},
    {:ets_registry, &__MODULE__.check_ets_registry/0},
    {:osint_tools, &__MODULE__.check_osint_tools/0},
    {:memory, &__MODULE__.check_memory/0}
  ]

  @spec check(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def check(conn, _params) do
    start = System.monotonic_time(:microsecond)

    results =
      @health_checks
      |> Task.async_stream(fn {name, check_fn} ->
        {name, timed_check(check_fn)}
      end, timeout: 5_000, max_concurrency: 4)
      |> Enum.map(fn {:ok, result} -> result end)
      |> Map.new()

    duration_us = System.monotonic_time(:microsecond) - start
    all_healthy = Enum.all?(results, fn {_, {status, _}} -> status == :ok end)

    response = %{
      status: if(all_healthy, do: "healthy", else: "degraded"),
      checks: format_checks(results),
      response_time_us: duration_us,
      timestamp: DateTime.utc_now(),
      version: Application.spec(:prismatic, :vsn) |> to_string()
    }

    status_code = if all_healthy, do: 200, else: 503

    conn
    |> put_status(status_code)
    |> json(response)
  end

  def check_database do
    case Ecto.Adapters.SQL.query(PrismaticDd.Repo, "SELECT 1", []) do
      {:ok, _} -> {:ok, "connected"}
      {:error, reason} -> {:error, inspect(reason)}
    end
  end

  def check_ets_registry do
    case :ets.info(:osint_tool_registry) do
      :undefined -> {:error, "registry not initialized"}
      info -> {:ok, "#{Keyword.get(info, :size, 0)} tools registered"}
    end
  end

  def check_osint_tools do
    count = PrismaticOsintCore.ToolRegistry.count()
    if count > 0, do: {:ok, "#{count} tools available"}, else: {:error, "no tools registered"}
  end

  def check_memory do
    memory = :erlang.memory(:total)
    limit = 2_000_000_000

    if memory < limit do
      {:ok, "#{div(memory, 1_048_576)}MB used"}
    else
      {:error, "memory pressure: #{div(memory, 1_048_576)}MB"}
    end
  end

  defp timed_check(check_fn) do
    start = System.monotonic_time(:microsecond)
    result = check_fn.()
    duration = System.monotonic_time(:microsecond) - start
    {elem(result, 0), %{message: elem(result, 1), duration_us: duration}}
  end

  defp format_checks(results) do
    Map.new(results, fn {name, {status, details}} ->
      {name, Map.put(details, :status, status)}
    end)
  end
end
```

For uptime tracking and SLA calculation:

```elixir
defmodule PrismaticMonitoring.UptimeTracker do
  @moduledoc """
  Tracks service uptime over time windows for SLA
  calculation and availability reporting.
  """

  use GenServer

  @check_interval_ms 30_000
  @health_url "http://localhost:4000/api/v1/health"

  defstruct [:checks, :started_at, total_checks: 0, successful_checks: 0]

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_check()
    {:ok, %__MODULE__{checks: [], started_at: DateTime.utc_now()}}
  end

  @spec current_uptime() :: float()
  def current_uptime do
    GenServer.call(__MODULE__, :get_uptime)
  end

  @spec uptime_for_period(pos_integer()) :: float()
  def uptime_for_period(hours) do
    GenServer.call(__MODULE__, {:get_uptime_period, hours})
  end

  @impl true
  def handle_call(:get_uptime, _from, state) do
    uptime =
      if state.total_checks > 0 do
        Float.round(state.successful_checks / state.total_checks * 100, 4)
      else
        100.0
      end

    {:reply, uptime, state}
  end

  @impl true
  def handle_call({:get_uptime_period, hours}, _from, state) do
    cutoff = DateTime.add(DateTime.utc_now(), -hours * 3600, :second)

    relevant = Enum.filter(state.checks, fn {ts, _} ->
      DateTime.compare(ts, cutoff) == :gt
    end)

    uptime =
      if Enum.empty?(relevant) do
        100.0
      else
        successful = Enum.count(relevant, fn {_, status} -> status == :ok end)
        Float.round(successful / length(relevant) * 100, 4)
      end

    {:reply, uptime, state}
  end

  @impl true
  def handle_info(:check, state) do
    status = perform_health_check()
    now = DateTime.utc_now()

    new_state = %{state |
      checks: [{now, status} | Enum.take(state.checks, 86_400)],
      total_checks: state.total_checks + 1,
      successful_checks: state.successful_checks + (if status == :ok, do: 1, else: 0)
    }

    schedule_check()
    {:noreply, new_state}
  end

  defp perform_health_check do
    case :httpc.request(:get, {String.to_charlist(@health_url), []}, [timeout: 5_000], []) do
      {:ok, {{_, 200, _}, _, _}} -> :ok
      _ -> :error
    end
  end

  defp schedule_check do
    Process.send_after(self(), :check, @check_interval_ms)
  end
end
```

## Architecture & Implementation

The platform's uptime monitoring architecture operates at multiple levels:

**Infrastructure Level**: Fly.io provides built-in health checks that monitor the application's HTTP endpoints. When a health check fails, Fly.io automatically restarts the instance and routes traffic to healthy replicas.

**Application Level**: The health controller checks all critical dependencies (database, ETS registries, memory) within a 10ms budget. This fast health check satisfies the platform's P0 performance standard while providing meaningful degradation signals.

**Component Level**: Individual GenServers and supervisors report their health status. The PrismaticSupervisor's HealthMonitor aggregates component-level health into a system-wide status that feeds the health check endpoint.

**External Monitoring**: Third-party monitoring services ping the production and staging endpoints at regular intervals, providing independent uptime verification that isn't subject to the same failure modes as internal monitoring.

## Usage in Prismatic Platform

The uptime data feeds into the platform's operational dashboards and SLA reporting:

```elixir
defmodule PrismaticWeb.StatusLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    if connected?(socket) do
      :timer.send_interval(30_000, :refresh)
    end

    {:ok, assign_status(socket)}
  end

  @impl true
  def handle_info(:refresh, socket) do
    {:noreply, assign_status(socket)}
  end

  defp assign_status(socket) do
    assign(socket,
      uptime_24h: PrismaticMonitoring.UptimeTracker.uptime_for_period(24),
      uptime_7d: PrismaticMonitoring.UptimeTracker.uptime_for_period(168),
      uptime_30d: PrismaticMonitoring.UptimeTracker.uptime_for_period(720),
      current_status: PrismaticMonitoring.UptimeTracker.current_uptime()
    )
  end
end
```

## Cross-References

- [Monitoring](@/glossary/monitoring.md) - Observation systems tracking uptime
- **Health Check** - Endpoint for availability verification
- [SLA](@/glossary/sla.md) - Service Level Agreement defining uptime targets
- [Time to First Byte](@/glossary/time-to-first-byte.md) - Performance metric during uptime
- **Warmup** - Initialization affecting availability after restart

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
