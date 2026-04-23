+++
title = "Logging"
weight = 50

[extra]
description = "The systematic practice of recording timestamped, structured events from a running system into persistent, searchable records that support debugging, auditing, monitoring, incident response, and regulatory compliance."
category = "platform"
domain = "observability"
complexity = "beginner"
stability = "stable"
beam_related = true
related_terms = ["log-level", "audit-logging", "profiling", "telemetry", "kpi", "monitoring", "tracing", "structured-data", "observability", "incident-response", "remediation", "compliance", "otel"]
tags = ["glossary", "logging", "observability", "debugging", "audit-trail", "structured-logging", "monitoring", "elixir-logger", "log-backends", "json-logging", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "beginner"
quality_score = 96
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Structured logging with metadata-rich entries enables the Prismatic Platform to maintain full operational visibility across 110 umbrella apps while enforcing clean production output through the OTEL doctrine pillar."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["logging", "structured logging", "application logs", "log management", "observability", "diagnostic logging", "event recording", "log aggregation", "Elixir Logger", "log backends", "JSON logging", "BEAM", "OTP"]
image = "/images/sections/glossary.png"
image_alt = "Logging - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "audit-logging", "telemetry"]
+++

## Definition

Logging is the practice of recording timestamped, categorized events from a running software system into durable storage for later analysis. Unlike metrics (which aggregate numerical measurements) and traces (which follow individual requests through services), logs capture discrete events with arbitrary detail: error messages, state transitions, business events, security incidents, and diagnostic information. Together, logs, metrics, and traces form the three pillars of observability.

Effective logging balances completeness (recording enough information to diagnose any issue) with noise reduction (not overwhelming operators with irrelevant detail). This balance is achieved through log levels (severity-based filtering), structured metadata (machine-parseable context), and selective verbosity (detailed logging in critical paths, minimal logging in hot paths).

In the context of the Prismatic Platform, logging is governed by the OTEL (Observability Telemetry Enforcement Layer) doctrine pillar, which mandates telemetry and logging for all GenServer callbacks, controller actions, LiveView handlers, and rescue blocks. The platform's structured logging approach ensures that every log entry carries enough context to correlate it with the originating request, user session, and business operation without requiring manual investigation.

## Core Concepts

### Log Level Hierarchy

| Level | Numeric | Purpose | Production Default | Example |
|-------|---------|---------|-------------------|---------|
| **:emergency** | 0 | System is unusable | Always shown | BEAM VM crash, data corruption |
| **:alert** | 1 | Immediate action required | Always shown | Database connection pool exhausted |
| **:critical** | 2 | Critical conditions | Always shown | Security breach detected |
| **:error** | 3 | Error conditions | Always shown | Unhandled exception, failed operation |
| **:warning** | 4 | Warning conditions | Shown (prod default) | Deprecated function call, slow query |
| **:notice** | 5 | Normal but significant | Development only | Configuration change, cache eviction |
| **:info** | 6 | Informational messages | Development only | Request completed, pipeline started |
| **:debug** | 7 | Debug-level messages | Development only | Function entry/exit, variable values |

### Structured vs. Unstructured Logging

| Aspect | Unstructured | Structured |
|--------|-------------|-----------|
| **Format** | Free-text string | Key-value pairs / JSON |
| **Example** | `"Error processing request for user 42"` | `%{event: "request_error", user_id: 42, error: "timeout"}` |
| **Searchability** | Regex only | Field-level indexing and filtering |
| **Parsing cost** | High (regex per query) | Low (pre-parsed at ingestion) |
| **Schema evolution** | Implicit, brittle | Explicit, addable fields |
| **Aggregation** | Manual regex extraction | Automatic field grouping |
| **Machine readability** | Poor | Excellent |

### Log Backend Architecture in BEAM/OTP

| Component | Role | Prismatic Usage |
|-----------|------|-----------------|
| **Logger** | Frontend API (`Logger.info/2`, metadata) | All application code |
| **Logger Handler** | Routes messages to backends | OTP 21+ `:logger` handler |
| **Console Backend** | Writes to stdout/stderr | Development environment |
| **JSON Backend** | Formats as JSON for aggregation | Production (stdout to container runtime) |
| **File Backend** | Writes to rotating log files | Local development archives |
| **Remote Backend** | Ships to Loki/ELK/CloudWatch | Production aggregation |
| **Ring Buffer** | In-memory circular buffer for LiveDashboard | Always active |

### Observability Pillars Comparison

| Pillar | Data Type | Cardinality | Retention | Primary Use |
|--------|-----------|-------------|-----------|-------------|
| **Logs** | Discrete events with arbitrary detail | High (per-event) | Days to months | Debugging, auditing, compliance |
| **Metrics** | Aggregated numerical measurements | Low (per-time-series) | Months to years | Alerting, dashboards, trends |
| **Traces** | Request-scoped span trees | Medium (per-request) | Hours to days | Latency analysis, dependency mapping |

## Technical Deep Dive

### Elixir Logger Architecture

Modern logging has evolved from unstructured text (`"Error processing request"`) to structured events with machine-parseable metadata. In the BEAM ecosystem, Elixir's Logger is built on Erlang's `:logger` (OTP 21+), which provides:

- **Asynchronous message passing**: Log calls send messages to the Logger process asynchronously, avoiding blocking the calling process. This is critical in high-throughput systems where a blocking log call could cascade into latency across all request handlers.

- **Configurable handlers**: Each handler independently formats, filters, and routes log messages. Multiple handlers can operate simultaneously (e.g., console for development, JSON for production, ring buffer for LiveDashboard).

- **Per-process metadata propagation**: `Logger.metadata/1` attaches key-value pairs to the calling process's metadata dictionary. All subsequent log calls from that process (and any spawned processes via `$callers`) automatically include this metadata, enabling correlation without explicit passing.

- **Compile-time message purging**: The `:compile_time_purge_matching` configuration eliminates log calls below a specified level at compile time, resulting in zero runtime overhead for suppressed levels. In production builds, `:debug` and `:info` calls are completely removed from the compiled bytecode.

### Structured Logging with Logger Metadata

The power of structured logging comes from consistent metadata attachment:

```
Logger.metadata(request_id: conn.request_id, user_id: user.id, session_id: session.id)
Logger.info("Order placed", order_id: order.id, total: order.total, items: length(order.items))
```

This single log call produces a record with both process-level metadata (request_id, user_id, session_id) and event-level metadata (order_id, total, items). A log aggregation system can then:

- Filter all events for a specific user: `user_id = 42`
- Correlate all events in a request: `request_id = "abc-123"`
- Aggregate order totals: `SUM(total) WHERE event = "Order placed"`
- Alert on high-value orders: `total > 10000`

None of this is possible with unstructured `"User 42 placed order 789 for $150.00"`.

### Log Rotation and Aggregation

In containerized deployments (Docker, Fly.io), applications log to stdout/stderr, and the container runtime routes logs to centralized aggregation (ELK stack, Loki, CloudWatch). This separation of concerns -- application produces, infrastructure routes -- simplifies application code and enables infrastructure-level log management policies.

For non-containerized deployments, log rotation prevents disk exhaustion. The standard approach uses `logrotate` with size-based or time-based rotation, compression of archived logs, and retention policies aligned with compliance requirements.

### Performance Characteristics

Logging performance matters because log calls are ubiquitous -- a typical request may generate 5-20 log entries. Key performance considerations:

| Aspect | Impact | Mitigation |
|--------|--------|------------|
| **String interpolation** | Computed even if level is filtered | Use `Logger.debug(fn -> "expensive #{inspect(data)}" end)` lazy form |
| **Metadata serialization** | JSON encoding cost per entry | Pre-format metadata at process boundaries |
| **I/O blocking** | Disk or network write latency | Async backends with bounded buffer |
| **Memory pressure** | Large log messages consume process heap | Limit message size; truncate large terms |
| **GC impact** | String allocation triggers garbage collection | Use iodata/chardata instead of string concatenation |

### Audit Logging vs. Diagnostic Logging

The Prismatic Platform maintains two distinct logging streams:

**Diagnostic logging** captures operational information for debugging and monitoring. It uses standard Logger levels, is filtered aggressively in production (`:warning` and above), and has short retention (7-30 days). Diagnostic logs may be sampled or dropped under extreme load.

**Audit logging** captures security-sensitive events: authentication attempts, authorization decisions, data access, configuration changes, and administrative actions. Audit logs are:

- **Immutable**: Written to append-only storage that cannot be modified or deleted by application code.
- **Complete**: Every security-relevant event is captured regardless of log level configuration.
- **Tamper-evident**: Checksummed or signed to detect unauthorized modification.
- **Retained long-term**: Kept for compliance periods (typically 1-7 years depending on regulation).
- **Structured**: Always use structured format with mandatory fields (actor, action, resource, timestamp, outcome).

## Usage in Prismatic Platform

The Prismatic Platform uses Elixir Logger across all 110 umbrella apps with consistent configuration:

| Environment | Log Level | Backend | Format | Retention |
|-------------|-----------|---------|--------|-----------|
| **Development** | `:debug` | Console | Human-readable with colors | Session only |
| **Test** | `:warning` | Console (silent by default) | Minimal | Test run only |
| **Staging** | `:info` | JSON to stdout | Structured JSON | 14 days |
| **Production** | `:warning` | JSON to stdout | Structured JSON | 30 days |

The platform's Clean Run policy explicitly prohibits info/debug log noise in production -- violations are caught by quality gates and the OTEL doctrine pillar. Every OSINT tool execution, DD pipeline run, and agent coordination event generates structured log entries with correlation metadata: execution IDs, tool slugs, entity IDs, and session contexts.

The PubSub system broadcasts events on topic-specific channels (`"dd:pipeline"`, `"osint:execution"`, `"quality:updated"`), and log entries include the PubSub topic for cross-reference. This enables operators to trace a complete operation across multiple processes and applications by filtering on a shared correlation ID.

The OTEL doctrine pillar enforces logging requirements at commit time:

- Every GenServer callback must emit telemetry or log on entry/exit.
- Every controller action must log request metadata.
- Every rescue block must log the caught exception with context.
- Silent error swallowing (bare rescue without logging) is a blocking pre-commit violation.

## Code Examples

### Structured Pipeline Logger with Correlation Metadata

```elixir
defmodule PrismaticDd.Pipeline.Logger do
  @moduledoc """
  Structured logging for DD pipeline operations with automatic
  correlation metadata propagation.

  All log entries include pipeline run ID, source slug, and phase
  information for complete traceability across the pipeline lifecycle.

  ## Architecture

  Metadata is set once at pipeline start via `Logger.metadata/1` and
  propagated to all downstream log calls. Each phase (fetch, transform,
  load, verify) logs start/complete/error events with phase-specific
  metrics.

  ## Example

      iex> PrismaticDd.Pipeline.Logger.log_fetch_start("czech-ares", "run-abc-123")
      :ok
      iex> PrismaticDd.Pipeline.Logger.log_fetch_complete("run-abc-123", 42, 1250)
      :ok
  """

  require Logger

  @doc """
  Initializes pipeline logging context with correlation metadata.

  Must be called at the start of each pipeline run to establish
  the correlation context for all subsequent log calls.

  ## Example

      iex> PrismaticDd.Pipeline.Logger.init_context("czech-ares", "run-abc-123")
      :ok
  """
  @spec init_context(String.t(), String.t()) :: :ok
  def init_context(source_slug, run_id) do
    Logger.metadata(
      pipeline: :dd,
      source: source_slug,
      run_id: run_id,
      started_at: DateTime.utc_now()
    )

    :ok
  end

  @doc """
  Logs the start of the fetch phase.
  """
  @spec log_fetch_start(String.t(), String.t()) :: :ok
  def log_fetch_start(source_slug, run_id) do
    init_context(source_slug, run_id)

    Logger.info("DD fetch phase starting",
      phase: :fetch,
      source: source_slug,
      run_id: run_id
    )
  end

  @doc """
  Logs successful completion of the fetch phase with metrics.
  """
  @spec log_fetch_complete(String.t(), non_neg_integer(), non_neg_integer()) :: :ok
  def log_fetch_complete(run_id, record_count, duration_ms) do
    Logger.info("DD fetch phase completed",
      run_id: run_id,
      records_fetched: record_count,
      duration_ms: duration_ms,
      phase: :fetch
    )
  end

  @doc """
  Logs a load phase failure with error details.
  """
  @spec log_load_error(String.t(), term()) :: :ok
  def log_load_error(run_id, reason) do
    Logger.error("DD load phase failed",
      run_id: run_id,
      error: inspect(reason),
      phase: :load
    )
  end

  @doc """
  Logs a pipeline phase transition with timing information.
  """
  @spec log_phase_transition(String.t(), atom(), atom(), non_neg_integer()) :: :ok
  def log_phase_transition(run_id, from_phase, to_phase, elapsed_ms) do
    Logger.info("DD pipeline phase transition",
      run_id: run_id,
      from_phase: from_phase,
      to_phase: to_phase,
      elapsed_ms: elapsed_ms
    )
  end

  @doc """
  Logs pipeline completion with aggregate metrics.
  """
  @spec log_pipeline_complete(String.t(), map()) :: :ok
  def log_pipeline_complete(run_id, metrics) do
    Logger.info("DD pipeline completed",
      run_id: run_id,
      total_records: Map.get(metrics, :total_records, 0),
      total_duration_ms: Map.get(metrics, :total_duration_ms, 0),
      phases_completed: Map.get(metrics, :phases_completed, []),
      success: true
    )
  end
end
```

### JSON Log Formatter for Production Aggregation

```elixir
defmodule PrismaticWeb.Logger.JSONFormatter do
  @moduledoc """
  Formats log entries as single-line JSON objects for ingestion by
  log aggregation systems (Loki, ELK, CloudWatch).

  Each log entry is a self-contained JSON object with standardized
  fields: timestamp (ISO 8601), level, message, and all metadata
  as top-level keys. The formatter handles encoding errors gracefully
  by falling back to inspect-based output.

  ## Output Format

      {"timestamp":"2026-04-02T10:30:00.000Z","level":"info","message":"Request completed","request_id":"abc-123","status":200,"duration_ms":42}

  ## Example

      iex> PrismaticWeb.Logger.JSONFormatter.format(:info, "test", {{2026,4,2},{10,30,0,0}}, [request_id: "abc"])
      [~s({"timestamp":"2026-04-02T10:30:00.000Z","level":"info","message":"test","request_id":"abc"}), "\\n"]
  """

  @doc """
  Formats a log entry as a JSON-encoded iodata string.

  ## Parameters

    * `level` - The log level atom (:debug, :info, :warning, :error, etc.)
    * `message` - The log message as iodata
    * `timestamp` - The log timestamp as `{{year, month, day}, {hour, min, sec, ms}}`
    * `metadata` - Keyword list of metadata key-value pairs

  ## Returns

  IO data containing the JSON-encoded log entry followed by a newline.
  """
  @spec format(Logger.level(), Logger.message(), Logger.Formatter.time(), keyword()) ::
          IO.chardata()
  def format(level, message, timestamp, metadata) do
    entry =
      %{
        timestamp: format_timestamp(timestamp),
        level: level,
        message: IO.chardata_to_string(message)
      }
      |> merge_metadata(metadata)

    [Jason.encode_to_iodata!(entry), "\n"]
  rescue
    e in [Jason.EncodeError, Protocol.UndefinedError] ->
      fallback = "#{format_timestamp(timestamp)} [#{level}] #{inspect({message, metadata})} (JSON encode failed: #{Exception.message(e)})\n"
      [fallback]
  end

  @doc """
  Formats a log timestamp tuple into ISO 8601 string.
  """
  @spec format_timestamp(Logger.Formatter.time()) :: String.t()
  def format_timestamp({date, {h, m, s, ms}}) do
    NaiveDateTime.from_erl!({date, {h, m, s}})
    |> NaiveDateTime.add(ms, :millisecond)
    |> NaiveDateTime.to_iso8601()
    |> Kernel.<>("Z")
  end

  defp merge_metadata(entry, metadata) do
    metadata
    |> Enum.reject(fn {_k, v} -> is_pid(v) or is_reference(v) or is_function(v) end)
    |> Enum.reduce(entry, fn {key, value}, acc ->
      Map.put(acc, key, safe_encode_value(value))
    end)
  end

  defp safe_encode_value(value) when is_binary(value), do: value
  defp safe_encode_value(value) when is_atom(value), do: value
  defp safe_encode_value(value) when is_number(value), do: value
  defp safe_encode_value(value) when is_list(value), do: inspect(value)
  defp safe_encode_value(value) when is_map(value), do: value
  defp safe_encode_value(value), do: inspect(value)
end
```

### Audit Logger with Tamper-Evident Trail

```elixir
defmodule PrismaticAuth.AuditLogger do
  @moduledoc """
  Immutable audit logging for security-sensitive operations.

  Records authentication, authorization, data access, and administrative
  events with mandatory fields, sequential numbering, and hash chaining
  for tamper detection.

  ## Mandatory Fields

  Every audit entry includes:
    * `actor` - Who performed the action (user_id, system, or anonymous)
    * `action` - What was done (authenticate, authorize, access, modify)
    * `resource` - What was acted upon (entity type and ID)
    * `outcome` - Success or failure with reason
    * `timestamp` - UTC timestamp
    * `sequence` - Monotonically increasing sequence number
    * `chain_hash` - SHA-256 hash of previous entry for tamper detection

  ## Example

      iex> PrismaticAuth.AuditLogger.log_auth_attempt("user@example.com", :success, %{method: :password})
      :ok
  """

  use GenServer

  require Logger

  @type actor :: String.t() | :system | :anonymous
  @type action :: :authenticate | :authorize | :access | :modify | :delete | :export
  @type outcome :: :success | {:failure, String.t()}

  @type audit_entry :: %{
          actor: actor(),
          action: action(),
          resource: String.t(),
          outcome: outcome(),
          timestamp: DateTime.t(),
          sequence: non_neg_integer(),
          chain_hash: String.t(),
          metadata: map()
        }

  @doc """
  Starts the audit logger GenServer.
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Records an authentication attempt in the audit trail.
  """
  @spec log_auth_attempt(String.t(), :success | :failure, map()) :: :ok
  def log_auth_attempt(identity, outcome, metadata \\ %{}) do
    GenServer.cast(__MODULE__, {:audit, %{
      actor: identity,
      action: :authenticate,
      resource: "auth:session",
      outcome: outcome,
      metadata: metadata
    }})
  end

  @doc """
  Records a data access event in the audit trail.
  """
  @spec log_data_access(actor(), String.t(), String.t(), map()) :: :ok
  def log_data_access(actor, resource_type, resource_id, metadata \\ %{}) do
    GenServer.cast(__MODULE__, {:audit, %{
      actor: actor,
      action: :access,
      resource: "#{resource_type}:#{resource_id}",
      outcome: :success,
      metadata: metadata
    }})
  end

  @impl true
  def init(_opts) do
    {:ok, %{sequence: 0, last_hash: "genesis"}}
  end

  @impl true
  def handle_cast({:audit, params}, state) do
    sequence = state.sequence + 1
    now = DateTime.utc_now()

    entry = %{
      actor: params.actor,
      action: params.action,
      resource: params.resource,
      outcome: params.outcome,
      timestamp: now,
      sequence: sequence,
      chain_hash: compute_chain_hash(state.last_hash, params, sequence),
      metadata: Map.get(params, :metadata, %{})
    }

    Logger.notice("AUDIT",
      audit: true,
      actor: entry.actor,
      action: entry.action,
      resource: entry.resource,
      outcome: entry.outcome,
      sequence: entry.sequence
    )

    {:noreply, %{sequence: sequence, last_hash: entry.chain_hash}}
  end

  defp compute_chain_hash(previous_hash, params, sequence) do
    data = "#{previous_hash}|#{params.action}|#{params.resource}|#{sequence}"
    :crypto.hash(:sha256, data) |> Base.encode16(case: :lower)
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Logging sensitive data** | Passwords, API keys, PII appear in logs and are retained/replicated | Implement redaction filters in Logger backends; never log raw credentials |
| **String interpolation in hot paths** | `Logger.debug("Processing #{inspect(large_data)}")` computes even when debug is filtered | Use lazy form: `Logger.debug(fn -> "Processing #{inspect(large_data)}" end)` |
| **Bare rescue without logging** | Exception caught but silently swallowed, invisible to operators | OTEL doctrine mandates logging in every rescue block; pre-commit hook enforces |
| **Excessive log volume** | Debug/info logging in production overwhelms aggregation system | Set production level to `:warning`; use compile-time purge for lower levels |
| **Missing correlation metadata** | Cannot trace events across processes or services | Set `Logger.metadata/1` at request entry point; propagate via `$callers` |
| **Synchronous logging under load** | Logger process mailbox grows unbounded during traffic spikes | Configure `:logger` sync threshold and discard threshold |
| **Unstructured log messages** | Cannot search, filter, or aggregate without regex parsing | Always use structured metadata parameters instead of string interpolation |
| **Logging in GenServer init** | Slow Logger during boot can delay GenServer startup | Keep init logging minimal; defer verbose logging to handle_continue |
| **Missing audit trail** | Security events not captured separately from diagnostic logs | Implement dedicated audit logger with immutable, long-retention storage |
| **Log-and-throw anti-pattern** | Logging an error and re-raising causes duplicate entries up the stack | Log at the point of handling, not at every catch/re-raise level |

## Best Practices

1. **Always use structured logging with metadata** -- pass key-value metadata parameters to Logger calls instead of interpolating values into message strings. This enables machine parsing, field-level filtering, and aggregation.

2. **Attach correlation IDs at process boundaries** -- set `Logger.metadata/1` with request_id, execution_id, and session_id at the entry point of every request or pipeline run. All downstream log calls inherit this context automatically.

3. **Never log sensitive data** -- passwords, API keys, authentication tokens, and PII must never appear in logs. Implement redaction filters in Logger backends and enforce through code review.

4. **Set compile-time purge levels per environment** -- use `:compile_time_purge_matching` to eliminate debug/info log calls from production bytecode, achieving zero overhead for suppressed levels.

5. **Use lazy evaluation for expensive log messages** -- wrap expensive computations in anonymous functions: `Logger.debug(fn -> "data: #{inspect(large_term)}" end)`. The function is only called if the level passes filtering.

6. **Separate audit and diagnostic log streams** -- audit logs (security events) must be immutable, tamper-evident, and retained long-term. Diagnostic logs can be rotated and discarded freely.

7. **Log every rescue block with exception details** -- the OTEL doctrine mandates that no exception is silently swallowed. Every rescue must include `Logger.error/2` with the exception module, message, and stacktrace.

8. **Test critical error paths produce log output** -- include assertions in integration tests that verify error scenarios generate the expected log entries with correct metadata.

9. **Use JSON formatting in production** -- JSON-formatted logs enable automatic parsing, indexing, and querying by log aggregation systems without custom regex parsers.

10. **Monitor Logger process health** -- watch for Logger mailbox growth (indicates backends cannot keep up) and configure sync/discard thresholds to prevent cascading latency during traffic spikes.

## Related Terms

- [Log Level](@/glossary/log-level.md) -- severity classification controlling which messages pass through filtering
- [Audit Logging](@/glossary/audit-logging.md) -- specialized immutable logging for security and compliance events
- [Telemetry](@/glossary/telemetry.md) -- complementary metrics and event system for structured measurements
- [Profiling](@/glossary/profiling.md) -- performance analysis technique that complements diagnostic logging
- [KPI](@/glossary/kpi.md) -- key performance indicators that may be derived from log analysis and aggregation
- [Monitoring](@/glossary/monitoring.md) -- operational practice that consumes log data for alerting and dashboards
- [Tracing](/glossary/tracing/) -- request-scoped observability that complements event-based logging
- [Remediation](@/glossary/remediation.md) -- security issue resolution process that relies on audit logging evidence
- [Incident Response](@/glossary/incident-response.md) -- operational procedure where logs provide primary forensic evidence
- [Compliance](@/glossary/compliance.md) -- regulatory frameworks that mandate specific logging and retention requirements
- [Observability](@/glossary/observability.md) -- the broader discipline encompassing logs, metrics, and traces
- [Response Distribution](@/glossary/response-distribution.md) -- performance analysis that uses duration metadata from log entries

## See Also

- [Elixir Logger Documentation](https://hexdocs.pm/logger/Logger.html) -- official Elixir Logger API reference
- [Erlang :logger Module](https://www.erlang.org/doc/man/logger.html) -- underlying OTP logging framework
- [Architecture](@/architecture/_index.md) -- observability architecture and telemetry infrastructure
- [OTEL Doctrine Pillar](@/architecture/_index.md) -- observability enforcement requirements
- [Capabilities](@/capabilities/_index.md) -- monitoring and logging capabilities overview

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
