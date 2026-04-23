+++
title = "Request ID"
weight = 50

[extra]
description = "A unique identifier assigned to each incoming HTTP request at the system boundary, propagated through all downstream operations, and included in every log entry and response -- enabling end-to-end distributed tracing, log correlation, and debugging across all Prismatic Platform components."
category = "api"
domain = "observability"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["trace", "structured-log", "request-rate", "status-code", "session", "opentelemetry", "correlation-id", "span", "logger-metadata", "plug", "pubsub", "telemetry"]
tags = ["request-id", "tracing", "correlation", "http", "debugging", "observability", "logging", "opentelemetry", "distributed-tracing", "plug", "logger-metadata", "uuid"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Request IDs enable end-to-end tracing across the Prismatic Platform's distributed components, correlating logs from Phoenix endpoints through GenServer calls to database queries and async OSINT tool executions -- all linked by a single UUID propagated via Logger metadata."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Request ID", "tracing", "correlation", "HTTP", "observability", "glossary", "Prismatic Platform", "OpenTelemetry", "Logger metadata", "distributed tracing", "x-request-id", "UUID", "Plug.RequestId"]
image = "/images/sections/glossary.png"
image_alt = "Request ID - Prismatic Platform"
word_count = 3400
see_also = ["architecture", "capabilities", "observability"]
+++

## Definition

A **request ID** is a unique identifier assigned to every incoming request at the system boundary, propagated through all downstream operations, and included in every log entry and response header. It serves as the correlation key that links together all activities triggered by a single user action across multiple processes, services, storage systems, and async operations. Without request IDs, debugging a production issue requires manually correlating timestamps and guessing which log lines belong to the same request -- an error-prone process that becomes impossible at scale.

Phoenix generates request IDs automatically through the `Plug.RequestId` plug, which either reads an existing `x-request-id` header from the incoming request (preserving upstream correlation) or generates a new UUID v4. This ID is stored in the Elixir Logger metadata via `Logger.metadata(request_id: id)` and included in all log entries within that request's process scope. The same ID is returned in the `x-request-id` response header, enabling clients to reference specific requests when reporting issues.

In modern observability practice, request IDs are the foundation upon which more sophisticated distributed tracing systems like OpenTelemetry are built. While OpenTelemetry adds span hierarchies, timing data, and cross-service propagation, the humble request ID remains the human-readable key that operators use to search logs during incident response. The Prismatic Platform uses both: OpenTelemetry for structured trace data and request IDs for human-friendly log correlation.

## Core Concepts

### Request ID Lifecycle

| Phase | Location | Action | Owner |
|-------|----------|--------|-------|
| **Generation** | Phoenix Endpoint | Read `x-request-id` header or generate UUID v4 | `Plug.RequestId` |
| **Attachment** | Plug pipeline | Store in Logger metadata + conn assigns | `Plug.RequestId` + custom plug |
| **Propagation (sync)** | Controller/LiveView | Automatically included in all Logger calls within the process | Logger metadata (process dictionary) |
| **Propagation (async)** | Task, GenServer cast | Must be explicitly passed and re-attached | Developer responsibility |
| **Propagation (PubSub)** | Broadcast message | Must be included in message payload | Developer responsibility |
| **Propagation (cross-node)** | `:rpc.call`, distributed GenServer | Must be passed as explicit parameter | Developer responsibility |
| **Response** | HTTP response | Included in `x-request-id` response header | `Plug.RequestId` |
| **Storage** | Log aggregation | Indexed for search; primary correlation key | Log infrastructure |

### Request ID Formats

| Format | Length | Collision Risk | Information Encoded | Use Case |
|--------|--------|---------------|---------------------|----------|
| UUID v4 (random) | 36 chars | 1 in 2^122 | None (random) | Standard; default in Phoenix |
| UUID v7 (time-ordered) | 36 chars | Near-zero | Timestamp (ms precision) | Chronological sorting without metadata lookup |
| Snowflake ID | 18-19 digits | Zero (coordinated) | Timestamp + machine + sequence | High-throughput systems needing ordering |
| Custom structured | Variable | Configurable | Timestamp + origin + random | Debug-friendly; reveals request source |
| OpenTelemetry Trace ID | 32 hex chars | 1 in 2^128 | None (random) | W3C Trace Context standard |

### Propagation Boundary Types

| Boundary | Automatic? | Mechanism | Risk if Missed |
|----------|-----------|-----------|----------------|
| Same process (sync) | Yes | Logger metadata in process dictionary | N/A |
| `Task.async/1` | No | Must capture and re-attach Logger metadata | Orphaned log entries |
| `Task.Supervisor.start_child/2` | No | Must pass request_id in task function closure | Untraceable async work |
| `GenServer.call/2` | No | Must include in call message or use metadata | GenServer logs lack correlation |
| `Phoenix.PubSub.broadcast/3` | No | Must include in broadcast payload | Subscriber logs lack correlation |
| Cross-node RPC | No | Must pass as explicit parameter | Remote node logs unlinked |
| HTTP client call to external service | No | Must set `x-request-id` header on outgoing request | External service logs unlinked |
| LiveView `handle_event/3` | Partial | LiveView process has its own metadata; initial mount propagates | Event handler logs may differ from mount |

### OpenTelemetry Integration

| Concept | Request ID Equivalent | Relationship |
|---------|----------------------|-------------|
| Trace ID | Request ID | One-to-one; trace ID is the request ID in OTel context |
| Span ID | None (flat) | Spans add hierarchy; request IDs are flat correlation keys |
| Baggage | Logger metadata | Both propagate context; baggage crosses service boundaries |
| W3C traceparent | x-request-id | traceparent is the standardized header; x-request-id is Phoenix convention |

## Technical Deep Dive

### Plug.RequestId Internals

`Plug.RequestId` is a simple but critical piece of the Phoenix pipeline. On each request, it:

1. Checks for an existing `x-request-id` request header
2. If present, validates it (must be printable ASCII, max 200 chars) and uses it
3. If absent, generates a new UUID v4 using `:crypto.strong_rand_bytes/1`
4. Stores the ID in `conn.private[:plug_request_id]`
5. Calls `Logger.metadata(request_id: id)` to attach it to the current process
6. Adds the `x-request-id` response header

This means every `Logger.info/2`, `Logger.warning/2`, and `Logger.error/2` call within the request's process automatically includes the request ID without the developer needing to pass it explicitly. The process dictionary-based metadata propagation is what makes this seamless within a single process.

### The Async Propagation Problem

Logger metadata is stored in the process dictionary, which means it does not automatically propagate to new processes. When a request handler spawns a `Task` or sends a message to a `GenServer`, the new process starts with empty Logger metadata. This is the single biggest source of "untraceable" log entries in BEAM applications.

The solution is explicit propagation. Before spawning async work, capture the current Logger metadata and re-attach it in the new process:

```elixir
metadata = Logger.metadata()
Task.start(fn ->
  Logger.metadata(metadata)
  # Now all Logger calls in this task include the request_id
  do_work()
end)
```

For GenServer calls, the request ID should be included in the message payload, and the GenServer should temporarily set Logger metadata while handling the message:

```elixir
# Caller
GenServer.call(MyServer, {:process, data, Logger.metadata()})

# GenServer handler
def handle_call({:process, data, caller_metadata}, _from, state) do
  Logger.metadata(caller_metadata)
  # Process with full tracing context
  Logger.metadata([])  # Clean up after handling
  {:reply, :ok, state}
end
```

### Structured Logging with Request IDs

The Prismatic Platform uses structured logging (JSON format in production) where the request ID appears as a top-level field in every log entry:

```json
{
  "timestamp": "2026-04-01T14:23:45.123Z",
  "level": "info",
  "message": "OSINT tool execution started",
  "request_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "module": "PrismaticOsintCore.ToolRegistry",
  "tool": "czech-ares",
  "duration_ms": null
}
```

This enables instant log correlation: searching for `request_id: "a1b2c3d4-..."` returns every log entry from every component that participated in processing that request, in chronological order.

### Request IDs in LiveView

LiveView connections present a unique challenge for request ID propagation. The initial HTTP request that renders the page has one request ID (from the GET request), but the WebSocket connection that powers live interactions creates a new long-lived process with its own lifecycle. The Prismatic Platform handles this by:

1. Assigning the initial request ID during the static render
2. Passing it to the LiveView socket assigns during mount
3. Using the socket-assigned request ID for all subsequent `handle_event` and `handle_info` logging
4. Generating a new correlation ID for each user interaction within the LiveView session

This creates a two-level correlation: the session-level request ID links all activity within a LiveView session, and the interaction-level correlation ID links activity within a single button click or form submission.

## Usage in Prismatic Platform

Every API request to the Prismatic API gateway (port 4004) receives a request ID that propagates through the dispatch controller, into the target module's function execution, through any database queries, and back in the response headers. The API response envelope includes the request ID in both the header and the JSON body, ensuring clients can always reference it.

OSINT tool executions include the originating request ID in their PubSub messages on the `"osint:execution:#{slug}"` topic, enabling correlation between the LiveView that initiated the execution and the async `Task` that performs it. When a tool execution completes and broadcasts results, the subscribing LiveView can match the result to the original request.

The DD investigation pipeline propagates request IDs through multi-stage processing: entity extraction, relationship mapping, scoring, and hypothesis generation each log their activity with the original investigation request ID, creating a complete audit trail of every step in the investigation.

The structured logging system indexes request IDs as a primary field in the log aggregation system, allowing developers to reconstruct the complete processing chain for any request using a single log search query.

## Code Examples

```elixir
defmodule PrismaticWeb.Plugs.RequestTracing do
  @moduledoc """
  Enhanced request tracing that propagates request ID through
  async operations, cross-process calls, and PubSub broadcasts.

  Extends the standard Plug.RequestId with additional metadata
  including request origin, timestamp, and OpenTelemetry trace
  context integration.

  ## Architecture

  Sits in the Plug pipeline after Plug.RequestId, enriching
  the request context with additional tracing metadata that
  downstream components can use for correlation.
  """

  import Plug.Conn

  require Logger

  @behaviour Plug

  @doc """
  Initializes the plug with default options.
  """
  @spec init(keyword()) :: keyword()
  @impl true
  def init(opts), do: opts

  @doc """
  Enriches the connection with request tracing metadata.

  Reads the request ID set by Plug.RequestId, adds it to
  the conn assigns for downstream access, attaches additional
  metadata to the Logger, and sets the response header.

  ## Examples

      # In a test
      conn = build_conn(:get, "/api/v1/health")
      |> RequestTracing.call([])

      assert conn.assigns[:request_id] != nil
      assert get_resp_header(conn, "x-request-id") != []
  """
  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  @impl true
  def call(conn, _opts) do
    request_id =
      get_req_header(conn, "x-request-id")
      |> List.first()
      |> case do
        nil -> Ecto.UUID.generate()
        existing -> existing
      end

    Logger.metadata(
      request_id: request_id,
      remote_ip: format_ip(conn.remote_ip),
      method: conn.method,
      path: conn.request_path
    )

    Logger.info("Request started",
      method: conn.method,
      path: conn.request_path
    )

    conn
    |> put_resp_header("x-request-id", request_id)
    |> assign(:request_id, request_id)
    |> register_before_send(&log_response/1)
  end

  @spec log_response(Plug.Conn.t()) :: Plug.Conn.t()
  defp log_response(conn) do
    Logger.info("Request completed",
      status: conn.status,
      method: conn.method,
      path: conn.request_path
    )

    conn
  end

  @spec format_ip(:inet.ip_address()) :: String.t()
  defp format_ip({a, b, c, d}), do: "#{a}.#{b}.#{c}.#{d}"
  defp format_ip(_), do: "unknown"
end
```

```elixir
defmodule PrismaticOsintCore.TracedExecution do
  @moduledoc """
  Executes OSINT tools with request ID propagation for end-to-end tracing.

  Captures Logger metadata from the calling process and re-attaches it
  in the async execution task, ensuring that all log entries from tool
  execution are correlated with the originating request.

  ## Tracing Flow

  1. LiveView handler captures Logger metadata (includes request_id)
  2. Task.Supervisor starts execution task with captured metadata
  3. Task re-attaches metadata and logs all activity with request_id
  4. PubSub broadcast includes request_id in message payload
  5. Subscribing LiveView receives result linked to original request
  """

  require Logger

  @type execution_result :: {:ok, term()} | {:error, term()}

  @doc """
  Executes a tool with full request ID propagation.

  The request_id parameter is explicitly passed rather than
  relying on Logger metadata, because this function is designed
  to be called from async contexts where metadata may not be set.

  ## Examples

      iex> TracedExecution.execute_with_trace("czech-ares", %{query: "Navigara"}, "abc-123")
      {:ok, %{results: [...]}}
  """
  @spec execute_with_trace(String.t(), map(), String.t()) :: execution_result()
  def execute_with_trace(tool_slug, params, request_id) do
    Logger.metadata(request_id: request_id)
    Logger.info("Starting tool execution", tool: tool_slug)

    start_time = System.monotonic_time(:millisecond)
    result = PrismaticOsintCore.ToolRegistry.execute(tool_slug, params)
    duration = System.monotonic_time(:millisecond) - start_time

    case result do
      {:ok, _data} ->
        Logger.info("Tool execution succeeded",
          tool: tool_slug,
          duration_ms: duration
        )

      {:error, reason} ->
        Logger.warning("Tool execution failed",
          tool: tool_slug,
          duration_ms: duration,
          reason: inspect(reason)
        )
    end

    result
  end

  @doc """
  Spawns a traced tool execution as a supervised task.

  Captures the caller's Logger metadata and propagates it to
  the spawned task. Broadcasts results with the request_id
  included in the PubSub message payload.

  ## Examples

      iex> TracedExecution.spawn_traced("czech-ares", %{query: "Navigara"})
      {:ok, pid}
  """
  @spec spawn_traced(String.t(), map()) :: {:ok, pid()}
  def spawn_traced(tool_slug, params) do
    caller_metadata = Logger.metadata()
    request_id = Keyword.get(caller_metadata, :request_id, "unknown")
    topic = "osint:execution:#{tool_slug}"

    {:ok, _pid} =
      Task.Supervisor.start_child(PrismaticOsintCore.TaskSupervisor, fn ->
        Logger.metadata(caller_metadata)

        Logger.info("Async tool execution started",
          tool: tool_slug,
          spawned_from: request_id
        )

        result = execute_with_trace(tool_slug, params, request_id)

        Phoenix.PubSub.broadcast(
          PrismaticWeb.PubSub,
          topic,
          {:execution_complete, result, %{request_id: request_id}}
        )
      end)
  end
end
```

```elixir
defmodule PrismaticWeb.RequestContext do
  @moduledoc """
  Utilities for request ID propagation across process boundaries.

  Provides helper functions for the common patterns of capturing
  and re-attaching request context in async operations, GenServer
  calls, and PubSub messages.
  """

  require Logger

  @type context :: %{request_id: String.t(), metadata: keyword()}

  @doc """
  Captures the current request context for propagation.

  Call this before spawning async work or sending messages
  to other processes. The returned context can be passed to
  `restore_context/1` in the target process.

  ## Examples

      iex> Logger.metadata(request_id: "abc-123")
      iex> ctx = RequestContext.capture()
      iex> ctx.request_id
      "abc-123"
  """
  @spec capture() :: context()
  def capture do
    metadata = Logger.metadata()

    %{
      request_id: Keyword.get(metadata, :request_id, "no-request-id"),
      metadata: metadata
    }
  end

  @doc """
  Restores a previously captured request context.

  Call this at the beginning of an async task or GenServer
  handler to re-attach the request ID and other metadata
  to the current process's Logger.

  ## Examples

      iex> ctx = %{request_id: "abc-123", metadata: [request_id: "abc-123"]}
      iex> RequestContext.restore(ctx)
      :ok
      iex> Logger.metadata()[:request_id]
      "abc-123"
  """
  @spec restore(context()) :: :ok
  def restore(%{metadata: metadata}) do
    Logger.metadata(metadata)
    :ok
  end

  @doc """
  Wraps a function with request context propagation.

  Returns a new function that, when called, first restores
  the captured context and then executes the original function.
  Useful for Task.Supervisor callbacks.

  ## Examples

      iex> ctx = RequestContext.capture()
      iex> wrapped = RequestContext.wrap(ctx, fn -> Logger.metadata()[:request_id] end)
      iex> Task.async(wrapped) |> Task.await()
      "abc-123"
  """
  @spec wrap(context(), (() -> term())) :: (() -> term())
  def wrap(context, fun) do
    fn ->
      restore(context)
      fun.()
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Not propagating to async Tasks | Task log entries have no request_id; untraceable | Capture Logger metadata before spawning; re-attach in task |
| Assuming GenServer inherits caller metadata | GenServer process has its own metadata; caller's request_id lost | Pass request_id in GenServer message; set metadata in handler |
| Using sequential IDs instead of UUIDs | Leak request volume information; predictable | Use UUID v4 (random) or UUID v7 (time-ordered) |
| Not returning request_id in response headers | Clients cannot reference specific requests when reporting issues | Always set `x-request-id` response header |
| Overwriting metadata in long-lived processes | GenServer metadata from one request bleeds into next | Clear metadata after handling each message |
| Not including request_id in PubSub messages | Subscribers cannot correlate broadcasts to originating requests | Include request_id in broadcast payload, not just Logger metadata |
| Truncating request_id in logs | Partial IDs cannot be searched; false matches | Ensure log format includes full request_id without truncation |
| Not propagating across HTTP client calls | External service logs cannot be correlated | Set `x-request-id` header on all outgoing HTTP requests |
| Generating new IDs mid-pipeline | Multiple IDs for same request; correlation broken | Generate once at boundary; propagate everywhere else |
| Ignoring LiveView session boundaries | WebSocket reconnection loses request context | Store request_id in socket assigns during mount; use for session lifetime |

## Best Practices

1. **Assign request IDs at the system boundary** -- never generate IDs deep in the call stack; the entry point (Plug pipeline, LiveView mount, API gateway) owns ID creation.

2. **Propagate across all async boundaries** -- explicitly pass request IDs to Tasks, GenServer calls, PubSub messages, and HTTP client requests. Use `RequestContext.capture/0` and `RequestContext.restore/1` helpers.

3. **Include in all log entries** -- use Logger metadata to automatically attach the ID to every log line within the request scope; never log without correlation context.

4. **Return in response headers** -- clients can report issues with their request ID, enabling instant log correlation during support interactions.

5. **Use UUIDs, not sequential IDs** -- sequential IDs leak information about request volume and timing; UUID v4 provides sufficient collision resistance for any throughput level.

6. **Clean up metadata in long-lived processes** -- GenServers that handle requests from multiple callers must reset Logger metadata after each handler to prevent context leakage.

7. **Include request_id in PubSub payloads** -- Logger metadata does not cross PubSub boundaries; the request_id must be part of the broadcast message structure.

8. **Integrate with OpenTelemetry** -- use the request ID as the OpenTelemetry trace ID (or map between them) for unified observability across request IDs and spans.

9. **Index request_id in log aggregation** -- ensure the log storage system indexes request_id as a primary search field for sub-second correlation lookups.

10. **Test propagation in integration tests** -- verify that async operations, GenServer calls, and PubSub broadcasts all carry the originating request ID.

## Related Terms

- [Trace](@/glossary/trace.md) -- the complete processing record identified by a request ID; spans form the trace tree
- [Structured Log](@/glossary/structured-log.md) -- log format that includes request ID as a first-class searchable field
- [OpenTelemetry](/glossary/opentelemetry/) -- distributed tracing standard that builds on request ID concepts
- [Correlation ID](/glossary/correlation-id/) -- synonym for request ID in message-driven architectures
- [Span](/glossary/span/) -- individual unit of work within a trace, identified by span ID and linked to trace/request ID
- [Logger Metadata](/glossary/logger-metadata/) -- the BEAM mechanism for attaching context to log entries within a process
- [Plug](@/glossary/plug.md) -- the composable request processing pipeline where request IDs are generated
- [PubSub](@/glossary/pubsub.md) -- publish-subscribe system requiring explicit request ID propagation
- [Telemetry](@/glossary/telemetry.md) -- metrics and events system that can include request ID in measurements
- [Status Code](@/glossary/status-code.md) -- the HTTP response code accompanying the request ID in the response
- [Session](@/glossary/session.md) -- the user session context that may span multiple request IDs
- [UUID](/glossary/uuid/) -- the identifier format used for request ID generation

## See Also

- [API Gateway](@/architecture/_index.md) -- where request IDs originate for REST API requests
- [Observability](@/capabilities/_index.md) -- the monitoring infrastructure that consumes request IDs
- [Plug.RequestId documentation](https://hexdocs.pm/plug/Plug.RequestId.html) -- official Plug documentation
- [OpenTelemetry for Erlang/Elixir](https://opentelemetry.io/docs/instrumentation/erlang/) -- OTel integration guide
- [W3C Trace Context](https://www.w3.org/TR/trace-context/) -- standardized distributed tracing headers

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
