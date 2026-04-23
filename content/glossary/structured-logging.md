+++
title = "Structured Logging"
weight = 35
[extra]
category = "quality"
description = "Logging practice using machine-parseable formats with consistent key-value metadata for automated analysis, filtering, and correlation across distributed systems"
acronym = ""
status = "active"
priority = "high"
difficulty = "intermediate"
audience = ["backend-engineers", "devops", "sre", "platform-engineers"]
tags = ["observability", "logging", "telemetry", "monitoring", "debugging", "json", "metadata"]
related_terms = ["observability", "distributed-tracing", "metrics", "telemetry", "clean-run", "plug", "broadway", "ecto", "phoenix"]
platforms = ["beam", "elixir", "erlang"]
use_cases = ["debugging", "alerting", "auditing", "compliance", "performance-analysis"]
standards = ["rfc5424", "ecs", "opentelemetry"]
tools = ["logger", "jason", "telemetry", "logflare", "datadog"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
license = "GHL"
author = "Tomáš Korcak"
reading_time = "10 min"
word_count = 1949
date_modified = "2026-02-23"
keywords = ["Structured", "Logging", "glossary", "quality", "Prismatic Platform", "Logger", "Elixir"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Structured Logging - Prismatic Platform"
+++

## Definition

Structured logging is the practice of emitting log entries as machine-parseable data structures -- typically JSON objects or key-value pairs -- with consistent, typed fields rather than free-form text strings. Each log entry contains standardized metadata (timestamp, severity level, source module, correlation IDs) alongside event-specific fields, enabling automated analysis, filtering, aggregation, and alerting by log management systems without the need for fragile regular expression parsing.

The distinction between structured and unstructured logging is fundamental to operational capability at scale. An unstructured log entry like `"User alice logged in from 192.168.1.1 at 2026-02-14T10:30:00Z"` contains all the relevant information but requires custom parsing logic to extract individual fields. A structured equivalent like `{"event": "user_login", "user": "alice", "ip": "192.168.1.1", "timestamp": "2026-02-14T10:30:00Z"}` makes every field directly queryable, filterable, and aggregatable without any parsing. This difference becomes critical when processing millions of log entries per hour across dozens of services.

Structured logging also enforces discipline in what gets logged and how. By defining explicit schemas for log entries, teams establish contracts about what information is available for debugging and monitoring. Fields like `request_id`, `session_id`, and `trace_id` become standard metadata that can be used to correlate events across process boundaries, nodes, and services -- bridging the gap between logging and [distributed tracing](@/glossary/distributed-tracing.md).

## Log Structure Anatomy

A well-structured log entry in an Elixir application contains several layers of information organized into distinct categories. Each layer serves a specific purpose in the observability pipeline, from basic identification through to domain-specific business context.

| Field Category | Examples | Purpose |
|---------------|----------|---------|
| **Timestamp** | `timestamp`, `utc_time` | When the event occurred (microsecond precision) |
| **Severity** | `level` (debug, info, warning, error) | Event importance for filtering and alerting |
| **Source** | `module`, `function`, `line` | Where in the code the event originated |
| **Correlation** | `request_id`, `session_id`, `trace_id` | Linking related events across boundaries |
| **Domain** | `agent_name`, `domain`, `quality_score` | Business context for the event |
| **Event** | `event`, `action`, `status` | What happened |
| **Payload** | `params`, `result`, `error` | Event-specific data |
| **Environment** | `node`, `release`, `deploy_id` | Infrastructure context |

The layered approach ensures that every log entry can be filtered at multiple levels of granularity. An operator investigating a production incident can filter by `request_id` to see all events for a specific request, by `module` to see all events from a specific component, or by `level: error` to see all failures across the entire system.

## Elixir Logger Configuration

Elixir's built-in Logger supports structured metadata natively, providing a foundation for structured logging without external dependencies. The Logger module ships with every Elixir application and integrates deeply with the [BEAM](@/glossary/beam.md) virtual machine's process model.

```elixir
# Application-level Logger configuration
config :logger, :console,
  format: {LogFormatter, :format},
  metadata: [:request_id, :session_id, :agent_name, :domain, :trace_id]

# Custom JSON formatter for structured output
defmodule LogFormatter do
  @moduledoc """
  Formats Logger output as structured JSON entries.
  Each log entry includes all process-local metadata alongside
  the message and standard fields (level, timestamp, source).
  """

  @spec format(Logger.level(), Logger.message(), Logger.Formatter.time(), keyword()) ::
          IO.chardata()
  def format(level, message, timestamp, metadata) do
    entry = %{
      timestamp: format_timestamp(timestamp),
      level: level,
      message: IO.chardata_to_string(message),
      module: Keyword.get(metadata, :module),
      function: Keyword.get(metadata, :function),
      line: Keyword.get(metadata, :line),
      request_id: Keyword.get(metadata, :request_id),
      session_id: Keyword.get(metadata, :session_id),
      agent_name: Keyword.get(metadata, :agent_name),
      node: node()
    }

    [Jason.encode_to_iodata!(entry), "\n"]
  rescue
    _ -> [inspect({level, message, metadata}), "\n"]
  end

  @spec format_timestamp(Logger.Formatter.time()) :: String.t()
  defp format_timestamp({date, {h, m, s, ms}}) do
    {year, month, day} = date
    "#{year}-#{pad(month)}-#{pad(day)}T#{pad(h)}:#{pad(m)}:#{pad(s)}.#{pad_ms(ms)}Z"
  end

  defp pad(i) when i < 10, do: "0#{i}"
  defp pad(i), do: "#{i}"

  defp pad_ms(i) when i < 10, do: "00#{i}"
  defp pad_ms(i) when i < 100, do: "0#{i}"
  defp pad_ms(i), do: "#{i}"
end
```

### Setting Metadata in Context

The Logger metadata system allows attaching contextual information to all subsequent log calls within a process. This is particularly powerful in Elixir's process-per-request model, where each HTTP request or agent execution runs in an isolated process.

```elixir
defmodule AgentExecutor do
  @moduledoc """
  Executes AIAD agents with full structured logging context.
  All log entries within the execution automatically include
  agent identification and session correlation metadata.
  """

  require Logger

  @spec execute(map()) :: {:ok, map()} | {:error, term()}
  def execute(agent_spec) do
    # Set metadata that persists for all log calls in this process
    Logger.metadata(
      agent_name: agent_spec.name,
      agent_tier: agent_spec.tier,
      session_id: agent_spec.session_id
    )

    Logger.info("Agent execution started",
      task: agent_spec.task,
      priority: agent_spec.priority
    )

    case run_agent(agent_spec) do
      {:ok, result} ->
        Logger.info("Agent execution completed",
          duration_ms: result.duration_ms,
          findings_count: length(result.findings)
        )
        {:ok, result}

      {:error, reason} ->
        Logger.error("Agent execution failed",
          error: inspect(reason),
          retry_count: agent_spec.retry_count
        )
        {:error, reason}
    end
  end

  defp run_agent(_spec), do: {:ok, %{duration_ms: 0, findings: []}}
end
```

## Process-Local Metadata

One of Elixir Logger's most powerful features is process-local metadata. Because each [BEAM](@/glossary/beam.md) process has its own isolated memory space, Logger metadata set in one process does not affect any other process. This property enables clean contextual logging without global state pollution.

```elixir
defmodule PrismaticWeb.RequestContext do
  @moduledoc """
  Sets structured logging context for the duration of an HTTP request.
  All log entries within this process automatically include request metadata.
  """

  import Plug.Conn
  require Logger

  @spec init(keyword()) :: keyword()
  def init(opts), do: opts

  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(conn, _opts) do
    request_id = get_resp_header(conn, "x-request-id") |> List.first()

    Logger.metadata(
      request_id: request_id,
      remote_ip: conn.remote_ip |> :inet.ntoa() |> to_string(),
      method: conn.method,
      path: conn.request_path
    )

    conn
  end
end
```

When a [Plug](@/glossary/plug.md) sets metadata early in the request pipeline, every subsequent log call within that process -- through controllers, business logic, storage adapters, and error handlers -- automatically includes the request context. This is how a single `request_id` can appear in every log entry for a given HTTP request without passing it explicitly through every function call.

### Cross-Process Metadata Propagation

The process isolation that makes Logger metadata clean also creates a challenge: when work is delegated to other processes (via `Task.async`, `GenServer.call`, or message passing), the metadata does not automatically propagate. This must be handled explicitly to maintain log correlation across concurrent operations.

```elixir
defmodule TracedTask do
  @moduledoc """
  Task wrapper that propagates Logger metadata to child processes.
  Ensures log correlation across process boundaries in concurrent
  workflows such as parallel OSINT queries or batch processing.
  """

  require Logger

  @spec async((() -> any())) :: Task.t()
  def async(fun) do
    parent_metadata = Logger.metadata()

    Task.async(fn ->
      Logger.metadata(parent_metadata)
      fun.()
    end)
  end

  @spec async_stream(Enumerable.t(), (any() -> any()), keyword()) :: Enumerable.t()
  def async_stream(enumerable, fun, opts \\ []) do
    parent_metadata = Logger.metadata()

    Task.async_stream(enumerable, fn item ->
      Logger.metadata(parent_metadata)
      fun.(item)
    end, opts)
  end
end
```

This pattern is essential for maintaining end-to-end log correlation in systems like the Prismatic Platform, where a single user request may fan out into multiple concurrent operations across OSINT providers, storage backends, and analysis agents.

## Log Levels and Usage Guidelines

Elixir Logger defines four severity levels, each serving a distinct purpose in the operational lifecycle of a system. Consistent level usage across all modules is critical for effective filtering and alerting.

| Level | Purpose | Examples | Alerting |
|-------|---------|----------|----------|
| **`:debug`** | Detailed diagnostic information | Function entry/exit, variable values, query plans | Never |
| **`:info`** | Normal operational events | Agent started, scan completed, user logged in | Optional dashboards |
| **`:warning`** | Unexpected but handled conditions | Retry triggered, cache miss, deprecated API used | Monitor trends |
| **`:error`** | Failures requiring attention | Database connection lost, agent crash, validation failure | Immediate alert |

### Log Level Configuration

```elixir
# config/config.exs -- base configuration
config :logger, level: :info

# config/dev.exs -- verbose for development
config :logger, level: :debug

# config/prod.exs -- only important events
config :logger, level: :info

# Per-module level override (runtime)
Logger.configure(level: :warning)

# Compile-time purge of debug logs from production builds
config :logger, compile_time_purge_matching: [
  [level_lower_than: :info]
]
```

The compile-time purge is particularly important for performance. When configured, the Elixir compiler removes debug log calls entirely from the compiled bytecode, ensuring zero runtime overhead from debug logging in production builds. This means developers can add extensive debug logging during development without worrying about production performance impact.

## Telemetry Integration

Structured logging integrates naturally with Erlang's `:telemetry` library, bridging the gap between metric collection and log-based [observability](@/glossary/observability.md). Telemetry events can be captured as structured log entries, providing a unified view of system behavior.

```elixir
defmodule PrismaticWeb.TelemetryLogger do
  @moduledoc """
  Bridges telemetry events to structured log entries.
  Captures request timing, database queries, and agent execution
  metrics as structured log entries with full context.
  """

  require Logger

  @spec attach_handlers() :: :ok
  def attach_handlers do
    :telemetry.attach_many(
      "prismatic-logger",
      [
        [:phoenix, :endpoint, :stop],
        [:prismatic, :agent, :execute, :stop],
        [:prismatic, :storage, :query, :stop],
        [:broadway, :processor, :stop]
      ],
      &handle_event/4,
      nil
    )
  end

  @spec handle_event(list(atom()), map(), map(), any()) :: :ok
  def handle_event([:phoenix, :endpoint, :stop], measurements, metadata, _config) do
    Logger.info("HTTP request completed",
      duration_ms: div(measurements.duration, 1_000_000),
      status: metadata.conn.status,
      method: metadata.conn.method,
      path: metadata.conn.request_path
    )
  end

  def handle_event([:prismatic, :agent, :execute, :stop], measurements, metadata, _config) do
    Logger.info("Agent execution telemetry",
      agent: metadata.agent_name,
      duration_ms: div(measurements.duration, 1_000_000),
      findings: measurements.findings_count
    )
  end

  def handle_event([:prismatic, :storage, :query, :stop], measurements, metadata, _config) do
    duration_ms = div(measurements.duration, 1_000_000)

    if duration_ms > 100 do
      Logger.warning("Slow query detected",
        adapter: metadata.adapter,
        duration_ms: duration_ms,
        operation: metadata.operation
      )
    end
  end

  def handle_event(_event, _measurements, _metadata, _config), do: :ok
end
```

## Implementation in Prismatic Platform

The Prismatic Platform uses Elixir's Logger with structured metadata across all 115 umbrella applications. The logging architecture is designed to support the platform's [observability](@/glossary/observability.md) requirements while maintaining the zero-warning quality standard.

- **Uniform Schema**: All apps emit logs with consistent metadata fields (`module`, `function`, `line`, `request_id`, `session_id`), enabling cross-app log correlation.
- **Agent Context**: Agent execution logs include `agent_name`, `agent_tier`, and `task_id` metadata, enabling per-agent log filtering and analysis across the 530+ agent fleet.
- **Quality Gate Logging**: Quality checks log their domain, check name, and result status, feeding into the Quality DNA trend analysis system.
- **Telemetry Integration**: [Telemetry](@/glossary/observability.md) events are bridged to structured logs through telemetry handlers, ensuring that metric events also appear in the log stream with full context.
- **Zero-Warning Policy**: The platform treats compilation warnings as errors (`--warnings-as-errors`), keeping runtime logs free of noise. Only meaningful operational events appear in production logs.
- **Session Lifecycle**: The SessionLifecycle GenServer logs each hook execution with timing data and status, providing a structured trace of session operations.
- **[Distributed Tracing](@/glossary/distributed-tracing.md) Correlation**: Trace IDs from telemetry spans are included in log metadata, enabling seamless navigation between log entries and trace visualizations.
- **OSINT Pipeline Logging**: Each OSINT adapter logs query parameters, response metadata, and timing information, providing full auditability of intelligence gathering operations.

## Structured Logging vs. Unstructured Logging

The difference between structured and unstructured logging extends far beyond format. It affects every aspect of the operational pipeline from storage efficiency to incident response speed.

| Aspect | Structured Logging | Unstructured Logging |
|--------|-------------------|---------------------|
| **Format** | JSON / key-value pairs | Free-form text strings |
| **Querying** | Direct field access (`level: error AND agent: scanner`) | Regex patterns (fragile, slow) |
| **Aggregation** | Group by any field, compute statistics | Manual parsing required |
| **Schema Evolution** | Add fields without breaking consumers | Any change may break parsers |
| **Storage Efficiency** | Compressible columnar storage | Text compression only |
| **Alerting** | Field-based rules | Pattern-based rules |
| **Cross-Service Correlation** | Shared field names (request_id, trace_id) | Hope that formats align |
| **Type Safety** | Typed fields enable validation | All values are strings |
| **Dashboard Integration** | Direct field mapping to visualizations | ETL required before visualization |
| **Compliance** | Structured audit trails for GDPR, NIS2 | Manual parsing for audit |

## Log Pipeline Architecture

The log pipeline in a modern production system follows a well-defined flow from application code through collection, aggregation, indexing, and visualization. Each stage in the pipeline benefits from structured formatting.

```
Application Code
    |
    v
Elixir Logger (process-local metadata)
    |
    v
Logger Backend (JSON formatter)
    |
    v
Log Aggregator (stdout -> container runtime)
    |
    v
Log Shipper (Fluentd, Vector, Filebeat)
    |
    v
Log Management System (indexing, search, alerting)
    |
    v
Dashboards & Alerts
```

In containerized deployments (such as the Prismatic Platform on Fly.io), logs are written to stdout as JSON, captured by the container runtime, shipped to a log management system, and indexed for search. Structured formatting at the source eliminates the need for log parsing at any stage of this pipeline, reducing processing overhead and eliminating parsing errors.

## Log Rotation and Retention

In production environments, log management extends beyond formatting to include rotation, retention, and archival strategies. These concerns are particularly important for compliance with regulations like [GDPR](@/glossary/gdpr.md) and [NIS2](@/glossary/nis2.md).

| Concern | Strategy | Configuration |
|---------|----------|---------------|
| **Rotation** | Size-based or time-based file rotation | Container runtime handles stdout rotation |
| **Retention** | Keep recent logs for debugging, archive old logs | 7 days hot, 30 days warm, 1 year cold |
| **Compression** | Compress archived logs for storage efficiency | gzip or zstd compression on rotation |
| **Sampling** | Reduce debug log volume in high-traffic scenarios | Rate-limit debug entries per module |
| **Redaction** | Remove sensitive data before storage | PII scrubbing in Logger backend |
| **Compliance** | Retain audit logs per regulatory requirements | Immutable audit logs for GDPR Article 30 |

## Sensitive Data Handling

Structured logging requires careful attention to data sensitivity. Log entries must never contain credentials, personally identifiable information (PII), or other sensitive data. The Prismatic Platform enforces this through a dedicated safe logging module that automatically redacts sensitive fields.

```elixir
defmodule PrismaticSafety.SafeLogger do
  @moduledoc """
  Logger wrapper with automatic redaction of sensitive fields.
  Ensures GDPR compliance by preventing PII from appearing in
  log entries. All logging in security-sensitive contexts should
  use this module instead of Logger directly.
  """

  require Logger

  @sensitive_keys [:password, :token, :secret, :api_key, :credit_card,
                   :ssn, :email, :phone, :address, :date_of_birth]

  @spec info(String.t(), keyword()) :: :ok
  def info(message, metadata \\ []) do
    Logger.info(message, redact(metadata))
  end

  @spec warning(String.t(), keyword()) :: :ok
  def warning(message, metadata \\ []) do
    Logger.warning(message, redact(metadata))
  end

  @spec error(String.t(), keyword()) :: :ok
  def error(message, metadata \\ []) do
    Logger.error(message, redact(metadata))
  end

  @spec redact(keyword()) :: keyword()
  defp redact(metadata) do
    Enum.map(metadata, fn
      {key, _value} when key in @sensitive_keys -> {key, "[REDACTED]"}
      {key, value} when is_map(value) -> {key, redact_map(value)}
      pair -> pair
    end)
  end

  @spec redact_map(map()) :: map()
  defp redact_map(map) do
    Map.new(map, fn
      {key, _value} when key in @sensitive_keys -> {key, "[REDACTED]"}
      {key, value} when is_map(value) -> {key, redact_map(value)}
      pair -> pair
    end)
  end
end
```

## Anti-Patterns

Structured logging discipline requires avoiding several common anti-patterns that undermine the value of structured output. These anti-patterns are actively detected and prevented by the Prismatic Platform's quality gates.

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **String interpolation in logs** | `Logger.info("User #{user_id} action")` defeats structure | Use metadata: `Logger.info("User action", user_id: user_id)` |
| **Logging sensitive data** | PII, credentials in log entries | Scrub sensitive fields; use allowlists |
| **Excessive debug logging** | High-volume debug logs in production | Use `Logger.debug` (disabled in prod by default) |
| **Missing correlation IDs** | Cannot trace request across processes | Set `request_id` in Plug pipeline; propagate via metadata |
| **Inconsistent field names** | `user_id` in one app, `userId` in another | Enforce naming convention via shared Logger config |
| **Exception as string** | `Logger.error("Error: #{inspect(e)}")` loses structure | Use `Logger.error(Exception.message(e), stacktrace: ...)` |
| **Over-logging** | Logging every function call, every variable | Log meaningful events at boundaries; use debug for details |
| **Under-logging** | Missing logs for critical operations | Log all state transitions, external calls, and error paths |

## Best Practices

**Use Metadata, Not String Interpolation**: Always pass contextual data as Logger metadata keywords rather than interpolating into the message string. This preserves queryability and enables automated analysis. The message should describe what happened; metadata should describe the context.

**Set Metadata Early in the Pipeline**: In HTTP request processing, set `request_id`, `trace_id`, and other correlation metadata at the earliest [Plug](@/glossary/plug.md) in the pipeline. All downstream log entries will automatically include this context.

**Propagate Metadata Across Process Boundaries**: When spawning Tasks or making GenServer calls, explicitly capture and restore Logger metadata in the child process. This ensures log correlation works across the concurrent process model.

**Use Compile-Time Log Purging**: Configure `compile_time_purge_matching` to remove debug-level log calls from production bytecode. This eliminates the runtime overhead of evaluating debug log arguments even when the log level would filter them out.

**Adopt a Consistent Schema**: Define a standard set of metadata fields across all applications in the umbrella. Use a shared configuration module to enforce field names, types, and conventions. This consistency is what makes cross-service correlation possible.

**Log at Boundaries**: The most valuable log entries occur at system boundaries: incoming requests, outgoing API calls, database queries, queue message processing, and error handling. Focus logging effort at these boundaries rather than within internal function calls.

**Include Timing Information**: For operations that may have performance implications, include duration measurements in log metadata. This enables log-based performance analysis without requiring a separate metrics pipeline.

## Performance Considerations

Structured logging introduces overhead compared to simple text logging, primarily from JSON encoding and metadata collection. The Prismatic Platform mitigates this through several strategies.

**Lazy Evaluation**: Elixir's Logger evaluates log messages lazily using macros. When the log level is filtered out, the message and metadata expressions are never evaluated, incurring zero overhead.

**IO Data**: The JSON formatter returns IO data (nested lists and binaries) rather than concatenated strings, avoiding unnecessary memory allocation and copying during log output.

**Compile-Time Purging**: Debug-level log calls are removed from production bytecode entirely, ensuring that even the macro overhead is eliminated for filtered levels.

**Asynchronous Logging**: Elixir Logger operates asynchronously by default, sending log messages to a dedicated Logger process that handles formatting and output. This prevents logging from blocking the calling process.

## Related Terms

- [Observability](@/glossary/observability.md) - Logging is one of the three observability pillars
- [Distributed Tracing](@/glossary/distributed-tracing.md) - Trace IDs embedded in structured log entries for correlation
- [Metrics](@/glossary/metrics.md) - Complementary numeric measurements alongside structured logs
- [Clean Run](@/glossary/clean-run.md) - Zero-warning compilation enabling clean runtime log output
- [Stream Processing](@/glossary/stream-processing.md) - Processing log streams in real-time
- [Plug](@/glossary/plug.md) - HTTP middleware that injects request_id into Logger metadata
- [Broadway](@/glossary/broadway.md) - Pipeline stages with structured logging at each processing step
- [Ecto](@/glossary/ecto.md) - Database query logging with structured timing and parameter metadata
- [Phoenix](@/glossary/phoenix.md) - Web framework with built-in structured request logging
- [GDPR](@/glossary/gdpr.md) - Regulation requiring careful log data handling and retention

## See Also

- [Architecture](@/architecture/_index.md) - Platform logging and observability architecture
- [Technologies](@/technologies/_index.md) - Elixir Logger and telemetry configuration
- [Capabilities](@/capabilities/_index.md) - Operational visibility capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
