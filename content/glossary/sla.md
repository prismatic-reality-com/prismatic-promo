+++
title = "SLA"
weight = 50
[extra]
description = "Service Level Agreement defining measurable quality, availability, and performance commitments between service provider and consumer"
category = "operations"
related_terms = ["monitoring", "uptime", "latency", "availability", "telemetry", "alerting", "observability"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["SLA", "service level agreement", "availability", "uptime", "performance", "glossary", "Prismatic Platform"]
tags = ["glossary", "operations", "reliability"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "SLA - Prismatic Platform"
+++

## Definition & Overview

A Service Level Agreement (SLA) is a formal contract between a service provider and its consumers that defines measurable targets for service quality, availability, and performance. SLAs establish the boundary between acceptable and unacceptable service delivery, creating accountability through explicit metrics, measurement periods, and consequences for violations. They transform vague expectations ("the system should be fast") into precise, verifiable commitments ("P95 response time under 250ms, measured over rolling 30-day windows").

SLAs operate within a hierarchy of related concepts. Service Level Indicators (SLIs) are the raw metrics being measured (response time, error rate, throughput). Service Level Objectives (SLOs) are the target values for those metrics (99.9% availability). The SLA is the contractual wrapper that attaches consequences to SLO violations (credits, escalation procedures, remediation timelines).

The Prismatic Platform enforces internal SLAs across all subsystems through automated monitoring and pre-commit quality gates. The page load performance standard (all pages under 250ms) functions as an internal SLA enforced at the CI/CD level -- code that violates this target is blocked from merging. This approach shifts SLA enforcement left, preventing violations before they reach production rather than detecting them after users are impacted.

## Technical Deep Dive

### SLA Definition and Monitoring

The platform defines SLAs as structured data with automated measurement and alerting:

```elixir
defmodule PrismaticMonitoring.SLA do
  @moduledoc """
  Defines and monitors Service Level Agreements.
  SLAs are specified declaratively and enforced through
  telemetry event handlers and periodic health checks.
  """

  @type metric :: :availability | :latency_p95 | :latency_p99 | :error_rate | :throughput

  @type t :: %__MODULE__{
    name: String.t(),
    metric: metric(),
    target: number(),
    operator: :lt | :lte | :gt | :gte | :eq,
    window: pos_integer(),
    window_unit: :minutes | :hours | :days,
    severity: :warning | :critical | :emergency
  }

  defstruct [:name, :metric, :target, :operator, :window, :window_unit, :severity]

  @platform_slas [
    %__MODULE__{
      name: "page_load_time",
      metric: :latency_p95,
      target: 250,
      operator: :lt,
      window: 1,
      window_unit: :hours,
      severity: :critical
    },
    %__MODULE__{
      name: "server_render_time",
      metric: :latency_p95,
      target: 100,
      operator: :lt,
      window: 1,
      window_unit: :hours,
      severity: :critical
    },
    %__MODULE__{
      name: "api_availability",
      metric: :availability,
      target: 99.9,
      operator: :gte,
      window: 30,
      window_unit: :days,
      severity: :emergency
    },
    %__MODULE__{
      name: "liveview_mount",
      metric: :latency_p95,
      target: 150,
      operator: :lt,
      window: 1,
      window_unit: :hours,
      severity: :critical
    },
    %__MODULE__{
      name: "health_check",
      metric: :latency_p99,
      target: 10,
      operator: :lt,
      window: 1,
      window_unit: :hours,
      severity: :warning
    }
  ]

  @spec platform_slas() :: [t()]
  def platform_slas, do: @platform_slas

  @spec check(t(), number()) :: :ok | {:violation, t(), number()}
  def check(%__MODULE__{operator: :lt, target: target} = sla, actual) when actual >= target do
    {:violation, sla, actual}
  end

  def check(%__MODULE__{operator: :gte, target: target} = sla, actual) when actual < target do
    {:violation, sla, actual}
  end

  def check(_sla, _actual), do: :ok
end
```

### Telemetry-Based SLA Measurement

The platform uses Erlang telemetry for continuous SLA measurement without manual instrumentation:

```elixir
defmodule PrismaticMonitoring.SLATracker do
  @moduledoc """
  Attaches to telemetry events and tracks SLA compliance
  using ETS-backed sliding window metrics.
  """

  use GenServer

  @metrics_table :sla_metrics
  @check_interval :timer.minutes(1)

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    :ets.new(@metrics_table, [:named_table, :public, :ordered_set])
    attach_telemetry_handlers()
    schedule_check()
    {:ok, %{violations: []}}
  end

  defp attach_telemetry_handlers do
    :telemetry.attach_many(
      "sla-tracker",
      [
        [:phoenix, :endpoint, :stop],
        [:phoenix, :live_view, :mount, :stop],
        [:prismatic, :api, :request, :stop]
      ],
      &handle_telemetry_event/4,
      nil
    )
  end

  def handle_telemetry_event(
    [:phoenix, :endpoint, :stop],
    %{duration: duration},
    _metadata,
    _config
  ) do
    duration_ms = System.convert_time_unit(duration, :native, :millisecond)
    record_metric(:latency_p95, duration_ms)
  end

  defp record_metric(metric, value) do
    key = {metric, System.system_time(:millisecond)}
    :ets.insert(@metrics_table, {key, value})
  end

  @impl true
  def handle_info(:check_slas, state) do
    violations =
      PrismaticMonitoring.SLA.platform_slas()
      |> Enum.map(fn sla ->
        actual = calculate_metric(sla.metric, sla.window, sla.window_unit)
        {sla, PrismaticMonitoring.SLA.check(sla, actual)}
      end)
      |> Enum.filter(fn {_, result} -> match?({:violation, _, _}, result) end)

    if violations != [] do
      Enum.each(violations, &handle_violation/1)
    end

    schedule_check()
    {:noreply, %{state | violations: violations}}
  end

  defp schedule_check, do: Process.send_after(self(), :check_slas, @check_interval)
end
```

## Architecture & Implementation

SLA enforcement in the Prismatic Platform operates at three levels. The development-time level uses pre-commit hooks and mix tasks (`mix performance.check`) to prevent code that would violate SLAs from being committed. The CI/CD level runs benchmark tests against SLA targets, blocking deployments that regress. The production level uses real-time telemetry to detect violations and trigger alerts.

This three-level approach means that SLA violations are caught as early as possible in the development lifecycle. A developer who introduces a slow database query will be blocked at commit time rather than discovering the violation in production monitoring days later. The NO MERCY doctrine applies to SLAs: there are no exceptions, no temporary relaxations, and no "we'll fix it later" deferrals.

The platform's SLA metrics are stored in ETS for real-time access and periodically flushed to PostgreSQL for historical trend analysis. Sliding window calculations use ordered ETS tables with timestamp-based keys, enabling efficient range queries without scanning the entire metrics history.

## Usage in Prismatic Platform

Every subsystem has explicit SLAs. The OSINT toolbox requires tool execution results within 30 seconds. The DD pipeline requires entity processing within 5 seconds per record. The Perimeter security scanner requires vulnerability assessments within 60 seconds per domain.

```elixir
# Check current SLA compliance
slas = PrismaticMonitoring.SLA.platform_slas()
results = Enum.map(slas, fn sla ->
  actual = PrismaticMonitoring.SLATracker.current_metric(sla.metric)
  %{sla: sla.name, target: sla.target, actual: actual, status: PrismaticMonitoring.SLA.check(sla, actual)}
end)
```

## Cross-References

- [Monitoring](/glossary/monitoring/) - Infrastructure providing SLA measurement data
- [Telemetry](/glossary/telemetry/) - Event system powering real-time SLA tracking
- [Observability](/glossary/observability/) - Broader practice encompassing SLA monitoring
- [Latency](/glossary/latency/) - Key SLA metric for response time targets

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
