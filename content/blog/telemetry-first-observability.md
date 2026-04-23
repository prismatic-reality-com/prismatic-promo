+++
title = "Telemetry-First Observability: Events Before Dashboards"
date = 2026-04-09
description = "Dashboards built without a telemetry contract lie. Telemetry built without a consumer is overhead. Here's how Prismatic wires :telemetry events into a coherent observability story across 94 umbrella apps."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["telemetry", "observability", "monitoring", "metrics", "elixir"]
reading_time = "7 min"
keywords = ["Elixir telemetry", "observability patterns", "metrics", "Prismatic telemetry"]
image = "/images/blog/telemetry-first.png"
word_count = 510
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 33
see_also = ["telemetry", "observability", "metrics", "monitoring", "structured-logging"]
image_alt = "Telemetry-First Observability"
+++

The wrong order is: build the dashboard, then scatter events to fill it. The right order is: define the events that describe what the system actually does, *then* consume them into dashboards, logs, and alerts. [Telemetry](/glossary/telemetry)-first observability is the difference between metrics that survive refactors and metrics that drift into lies.

## The contract

Every Prismatic subsystem declares its events up front:

```elixir
defmodule PrismaticOsint.Telemetry do
  @events [
    [:osint, :search, :start],
    [:osint, :search, :stop],
    [:osint, :search, :exception],
    [:osint, :adapter, :rate_limited],
    [:osint, :adapter, :circuit_open]
  ]

  def events, do: @events
end
```

The list is the API. Consumers (Prometheus exporter, LiveView dashboard, log formatter, alert rules) depend on *this* list — not on whatever incidental `:telemetry.execute` calls happen to exist. Refactor the implementation freely; keep the event contract stable.

## Span wrapping

Every boundary crossing uses `:telemetry.span/3`:

```elixir
def search(query, opts) do
  :telemetry.span(
    [:osint, :search],
    %{query: query, adapter: opts[:adapter]},
    fn ->
      result = do_search(query, opts)
      {result, %{result_count: length(result)}}
    end
  )
end
```

This gives you start, stop, duration, and exception events for free. No manual timing. No forgotten `try/rescue`. Exception events include the stacktrace so you don't have to chase logs.

## Metrics from events, not from logs

Logs are for humans. [Metrics](/glossary/metrics) are for time-series databases. Scraping metrics out of logs is an anti-pattern — you end up with a pipeline that breaks every time a log line changes. Instead:

```elixir
defmodule PrismaticWeb.Telemetry do
  import Telemetry.Metrics

  def metrics do
    [
      summary("osint.search.stop.duration", unit: {:native, :millisecond}),
      counter("osint.search.exception.count"),
      counter("osint.adapter.rate_limited.count", tags: [:adapter]),
      last_value("osint.adapter.circuit_open.count", tags: [:adapter])
    ]
  end
end
```

The exporter reads the list and generates Prometheus metrics. Add a new event to the contract, add a metric to the list, done.

## Structured logs attach, not replace

Every event handler that logs also attaches structured metadata ([structured logging](/glossary/structured-logging) is non-negotiable):

```elixir
:telemetry.attach("osint-slow-search", [:osint, :search, :stop], fn _, meas, meta, _ ->
  if meas.duration > 2_000_000_000 do
    Logger.warning("slow osint search",
      query: meta.query,
      adapter: meta.adapter,
      duration_ms: div(meas.duration, 1_000_000)
    )
  end
end, nil)
```

Logs complement metrics. They do not replace them.

## The rule

> If it matters, it emits telemetry. If it doesn't emit telemetry, it doesn't matter.

New code that would be hard to debug in production starts with the event contract, not the dashboard. The dashboard is the last step, not the first.

## Where to go next

- **Academy**: [LiveView Dashboards](/academy/learn/liveview-dashboards) — consume telemetry in real time
- **Academy**: [OTP Fundamentals](/academy/learn/otp-fundamentals) — where the boundaries to instrument live
- **Glossary**: [Telemetry](/glossary/telemetry), [Observability](/glossary/observability), [Metrics](/glossary/metrics), [Monitoring](/glossary/monitoring), [Structured Logging](/glossary/structured-logging)

Events before dashboards. Always.
