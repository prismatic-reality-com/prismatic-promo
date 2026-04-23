+++
title = "Trace"
weight = 50
[extra]
description = "Distributed request tracking mechanism that follows operations across service boundaries for observability and debugging"
category = "observability"
related_terms = ["telemetry", "monitoring", "span", "logging"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["trace", "distributed tracing", "observability", "request tracking", "OpenTelemetry", "glossary", "Prismatic Platform"]
tags = ["glossary", "observability"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Trace - Prismatic Platform"
+++

## Definition & Overview

A trace is a record that follows a single request or operation as it propagates through a distributed system, capturing timing, metadata, and causal relationships across all participating services and processes. In distributed tracing, a trace is composed of multiple spans, each representing a discrete unit of work within the request's lifecycle. Together, these spans form a directed acyclic graph (DAG) that visualizes the complete execution path.

Distributed tracing is essential in systems like the Prismatic Platform where a single user action, such as an OSINT tool execution, may traverse multiple OTP processes, external API calls, database queries, and PubSub event emissions. Without tracing, correlating a slow response to its root cause across these boundaries would require manual log correlation, which is error-prone and time-consuming.

The platform leverages Erlang's built-in tracing capabilities (`:erlang.trace/3`) for low-level BEAM process observation and integrates with the `:telemetry` library for application-level distributed tracing. This dual-layer approach provides both fine-grained process-level visibility and high-level request-flow understanding, making it possible to diagnose issues ranging from GenServer message queue buildup to external API latency spikes.

## Technical Deep Dive

The Prismatic Platform implements distributed tracing using a context propagation model where trace identifiers flow through process metadata:

```elixir
defmodule PrismaticTrace.Context do
  @moduledoc """
  Trace context propagation for distributed request
  tracking across OTP processes and external calls.
  """

  @type trace_id :: String.t()
  @type span_id :: String.t()

  @type t :: %__MODULE__{
    trace_id: trace_id(),
    parent_span_id: span_id() | nil,
    span_id: span_id(),
    baggage: map()
  }

  defstruct [:trace_id, :parent_span_id, :span_id, baggage: %{}]

  @spec new() :: t()
  def new do
    %__MODULE__{
      trace_id: generate_id(),
      span_id: generate_id(),
      parent_span_id: nil
    }
  end

  @spec child_span(t()) :: t()
  def child_span(%__MODULE__{} = parent) do
    %__MODULE__{
      trace_id: parent.trace_id,
      parent_span_id: parent.span_id,
      span_id: generate_id(),
      baggage: parent.baggage
    }
  end

  @spec put_in_process(t()) :: :ok
  def put_in_process(%__MODULE__{} = ctx) do
    Process.put(:trace_context, ctx)
    :ok
  end

  @spec from_process() :: t() | nil
  def from_process do
    Process.get(:trace_context)
  end

  defp generate_id do
    :crypto.strong_rand_bytes(8) |> Base.hex_encode32(case: :lower, padding: false)
  end
end

defmodule PrismaticTrace.Span do
  @moduledoc """
  Represents a unit of work within a trace, recording
  timing, attributes, and status information.
  """

  alias PrismaticTrace.Context

  @type t :: %__MODULE__{
    context: Context.t(),
    name: String.t(),
    start_time: integer(),
    end_time: integer() | nil,
    attributes: map(),
    events: [map()],
    status: :ok | :error
  }

  defstruct [:context, :name, :start_time, :end_time,
             attributes: %{}, events: [], status: :ok]

  @spec start(String.t(), keyword()) :: t()
  def start(name, opts \\ []) do
    parent_ctx = Keyword.get(opts, :parent) || Context.from_process()

    ctx =
      if parent_ctx do
        Context.child_span(parent_ctx)
      else
        Context.new()
      end

    Context.put_in_process(ctx)

    %__MODULE__{
      context: ctx,
      name: name,
      start_time: System.monotonic_time(:microsecond),
      attributes: Keyword.get(opts, :attributes, %{})
    }
  end

  @spec finish(t()) :: t()
  def finish(%__MODULE__{} = span) do
    finished = %{span | end_time: System.monotonic_time(:microsecond)}
    duration_us = finished.end_time - finished.start_time

    :telemetry.execute(
      [:prismatic, :trace, :span, :finish],
      %{duration_us: duration_us},
      %{span_name: finished.name, trace_id: finished.context.trace_id}
    )

    finished
  end
end
```

For tracing across process boundaries (GenServer calls, Task.async), the trace context must be explicitly propagated since each Erlang process has its own process dictionary:

```elixir
defmodule PrismaticTrace.Propagation do
  @moduledoc """
  Helpers for propagating trace context across process
  boundaries in OTP applications.
  """

  alias PrismaticTrace.Context

  @spec with_trace((() -> term())) :: term()
  def with_trace(fun) do
    parent_ctx = Context.from_process()

    Task.async(fn ->
      if parent_ctx do
        child_ctx = Context.child_span(parent_ctx)
        Context.put_in_process(child_ctx)
      end

      fun.()
    end)
    |> Task.await()
  end
end
```

## Architecture & Implementation

The tracing architecture in the Prismatic Platform operates at three levels:

**BEAM-Level Tracing**: Erlang's native tracing (`sys:trace/2`, `:dbg`) provides process-level visibility into GenServer calls, message passing, and garbage collection events. This is used sparingly for debugging specific OTP issues since it carries overhead.

**Application-Level Tracing**: The `:telemetry` library instruments all significant operations (HTTP requests, database queries, OSINT tool executions) with span-like events. Telemetry handlers collect these events and correlate them using trace IDs propagated through process dictionaries.

**External Integration**: For operations that cross the BEAM boundary (external API calls to Shodan, VirusTotal, Czech registries), trace context is injected into HTTP headers following the W3C Trace Context standard. This enables end-to-end visibility even when the Prismatic Platform is part of a larger distributed system.

The trace collector aggregates completed spans and stores them in ETS for real-time dashboard access, with periodic flush to PostgreSQL for historical analysis. The LiveView monitoring dashboard renders trace waterfalls that visualize the complete execution path of any traced request.

## Usage in Prismatic Platform

Tracing is particularly valuable for the OSINT toolbox where a single tool execution may involve multiple external API calls, result parsing, and database persistence:

```elixir
defmodule PrismaticOsintCore.TracedExecution do
  @moduledoc """
  Wraps OSINT tool execution with distributed tracing
  for end-to-end visibility.
  """

  alias PrismaticTrace.Span

  @spec execute(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def execute(tool_slug, params) do
    root_span = Span.start("osint.tool.execute",
      attributes: %{tool_slug: tool_slug})

    with {:ok, tool} <- traced_lookup(tool_slug),
         {:ok, result} <- traced_run(tool, params) do
      Span.finish(%{root_span | status: :ok})
      {:ok, result}
    else
      {:error, reason} = error ->
        Span.finish(%{root_span | status: :error,
          attributes: Map.put(root_span.attributes, :error, inspect(reason))})
        error
    end
  end

  defp traced_lookup(slug) do
    span = Span.start("osint.registry.lookup",
      attributes: %{slug: slug})
    result = PrismaticOsintCore.ToolRegistry.get_tool(slug)
    Span.finish(span)
    result
  end

  defp traced_run(tool, params) do
    span = Span.start("osint.tool.run",
      attributes: %{module: inspect(tool.module)})
    result = tool.module.run(params)
    Span.finish(span)
    result
  end
end
```

## Cross-References

- [Telemetry](/glossary/telemetry/) - Event measurement framework
- [Monitoring](/glossary/monitoring/) - Operational observation
- [Logging](/glossary/logging/) - Event recording system
- [Tracking](/glossary/tracking/) - Progress and analytics monitoring
- [Time to First Byte](/glossary/time-to-first-byte/) - Performance metric benefiting from trace data

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
