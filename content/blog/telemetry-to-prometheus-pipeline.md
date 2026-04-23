+++
title = "Telemetry to Prometheus: The Pipeline You Stop Writing Once You Get It Right"
date = 2026-04-09
description = "`:telemetry` events → `Telemetry.Metrics` definitions → Prometheus exporter → Grafana. Four steps, three libraries, one rule: the metrics list is the API."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["telemetry", "prometheus", "metrics", "observability", "grafana"]
reading_time = "6 min"
keywords = ["Elixir telemetry Prometheus", "Telemetry.Metrics", "Grafana Elixir", "observability pipeline"]
image = "/images/blog/telemetry-prom.png"
word_count = 500
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 33
see_also = ["telemetry", "metrics", "observability", "monitoring", "performance"]
image_alt = "Telemetry to Prometheus Pipeline"
+++

Most Elixir codebases reinvent this pipeline three or four times before converging on the right shape. Write it once correctly and you stop touching it for years. The pipeline is: [telemetry](@/glossary/telemetry.md) events → `Telemetry.Metrics` definitions → Prometheus exporter → Grafana dashboards. Four stages. Each stage depends on exactly one thing from the previous stage. No coupling elsewhere.

## Stage 1: The event contract

Every subsystem publishes its event names up front:

```elixir
defmodule PrismaticOsint.Telemetry.Events do
  def all, do: [
    [:osint, :search, :start],
    [:osint, :search, :stop],
    [:osint, :search, :exception],
    [:osint, :breaker, :open],
    [:osint, :breaker, :close]
  ]
end
```

The list is the API. Everything downstream depends on *these names*. Refactor the internals freely; keep the names stable.

## Stage 2: Metric definitions

`Telemetry.Metrics` translates events into typed [metrics](@/glossary/metrics.md):

```elixir
defmodule PrismaticWeb.Telemetry do
  import Telemetry.Metrics

  def metrics do
    [
      summary("osint.search.stop.duration",
        unit: {:native, :millisecond},
        tags: [:adapter]),
      counter("osint.search.exception.count",
        tags: [:adapter, :kind]),
      counter("osint.breaker.open.count",
        tags: [:adapter]),
      last_value("osint.breaker.state",
        tags: [:adapter])
    ]
  end
end
```

Four metric types cover 95% of what you need:

- **counter** — things that only go up.
- **summary** — histogram/distribution over durations or sizes.
- **last_value** — current state (a breaker's on/off, a pool's size).
- **sum** — things that need integration over time.

Skip gauges that track arbitrary values from a GenServer. If you cannot express it as one of the four above, you are probably about to build a bespoke metric system. Don't.

## Stage 3: Prometheus exporter

`TelemetryMetricsPrometheus.Core` reads the metric list and produces the `/metrics` endpoint Prometheus scrapes:

```elixir
children = [
  {TelemetryMetricsPrometheus.Core, metrics: PrismaticWeb.Telemetry.metrics()}
]
```

Add a new metric to the list, restart the app, Prometheus picks it up on the next scrape. No exporter-side wiring. No per-metric config.

## Stage 4: Grafana dashboards as code

Grafana dashboards go in version control as JSON, not in the UI. A dashboard that was clicked together in the browser is a dashboard that will disappear in six months when someone accidentally hits "reset." Check it in. Review it in pull requests. Deploy it via the provisioning API.

## The rule

> The metrics list is the API. Everything upstream must emit events that the list knows about. Everything downstream reads from the list.

Break that rule and you get drift: events that nobody consumes, dashboards that query metrics that do not exist, alerts that fire on strings nobody emits. Follow it and the pipeline becomes invisible infrastructure.

## Where to go next

- **Academy**: [LiveView Dashboards](/academy/learn/liveview-dashboards) — in-app dashboards from the same telemetry
- **Glossary**: [Telemetry](@/glossary/telemetry.md), [Metrics](@/glossary/metrics.md), [Observability](@/glossary/observability.md), [Monitoring](@/glossary/monitoring.md), [Performance](@/glossary/performance.md)

Four stages. One contract. Write it once and move on.
