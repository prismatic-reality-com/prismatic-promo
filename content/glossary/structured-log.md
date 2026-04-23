+++
title = "Structured Log"
weight = 50
[extra]
description = "JSON-formatted log entries with consistent schema enabling machine-parseable analysis, filtering, and aggregation across distributed systems"
category = "observability"
related_terms = ["logging", "telemetry", "monitoring", "observability", "json", "elk-stack"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["structured log", "JSON logging", "observability", "log analysis", "glossary", "Prismatic Platform"]
tags = ["glossary", "observability", "logging"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Structured Log - Prismatic Platform"
+++

## Definition & Overview

A structured log is a log entry formatted as a machine-parseable data structure (typically JSON) rather than a freeform text string. Each log entry contains a consistent set of fields -- timestamp, level, message, module, metadata -- that can be indexed, filtered, and aggregated by log management systems. Structured logging transforms logs from a debugging aid into a queryable data source, enabling questions like "show all error logs from the OSINT module in the last hour where latency exceeded 500ms."

Traditional unstructured logs (`"[2026-02-23 14:30:00] ERROR: Failed to process request"`) require regex parsing to extract useful information. Structured logs (`{"timestamp": "2026-02-23T14:30:00Z", "level": "error", "module": "OsintTool", "message": "Failed to process request", "latency_ms": 523}`) provide every field as a first-class queryable attribute. This eliminates parsing fragility and enables real-time analytics, alerting, and dashboarding.

The Prismatic Platform uses structured logging throughout all subsystems. Elixir's Logger module is configured with a JSON backend that formats every log entry as a JSON object. Custom metadata (request IDs, user IDs, tool slugs, pipeline stages) is attached through Logger metadata, flowing through automatically to every log entry within that process context.

## Technical Deep Dive

### JSON Log Backend Configuration

The platform configures Elixir's Logger for structured JSON output:

```elixir
# config/prod.exs
config :logger, :console,
  format: {PrismaticLogging.JsonFormatter, :format},
  metadata: [:request_id, :user_id, :module, :function, :line, :tool_slug, :pipeline_stage]

config :logger,
  level: :info,
  compile_time_purge_matching: [
    [level_lower_than: :info]
  ]
```

```elixir
defmodule PrismaticLogging.JsonFormatter do
  @moduledoc """
  JSON log formatter for structured logging.
  Produces one JSON object per log line for machine parsing.
  """

  @spec format(Logger.level(), Logger.message(), Logger.Formatter.time(), keyword()) :: iodata()
  def format(level, message, timestamp, metadata) do
    log_entry = %{
      timestamp: format_timestamp(timestamp),
      level: level,
      message: IO.iodata_to_binary(message),
      module: metadata[:module],
      function: metadata[:function],
      line: metadata[:line],
      pid: inspect(metadata[:pid]),
      node: node()
    }

    # Merge custom metadata
    custom_fields =
      metadata
      |> Keyword.drop([:module, :function, :line, :pid, :gl, :time, :domain, :erl_level])
      |> Enum.into(%{})

    merged = Map.merge(log_entry, custom_fields)

    [Jason.encode_to_iodata!(merged), "\n"]
  rescue
    _ -> ["#{inspect({level, message, timestamp, metadata})}\n"]
  end

  defp format_timestamp({date, {hour, min, sec, ms}}) do
    {year, month, day} = date
    "#{year}-#{pad(month)}-#{pad(day)}T#{pad(hour)}:#{pad(min)}:#{pad(sec)}.#{pad3(ms)}Z"
  end

  defp pad(i) when i < 10, do: "0#{i}"
  defp pad(i), do: "#{i}"

  defp pad3(i) when i < 10, do: "00#{i}"
  defp pad3(i) when i < 100, do: "0#{i}"
  defp pad3(i), do: "#{i}"
end
```

### Contextual Metadata Attachment

The platform uses Logger metadata to flow context through processing pipelines:

```elixir
defmodule PrismaticOsintCore.ToolExecutor do
  @moduledoc """
  Executes OSINT tools with structured logging context.
  Logger metadata flows through all downstream calls.
  """

  require Logger

  @spec execute(map(), map(), keyword()) :: {:ok, map()} | {:error, term()}
  def execute(tool_config, params, opts \\ []) do
    Logger.metadata(
      tool_slug: tool_config.slug,
      tool_category: tool_config.category,
      user_id: Keyword.get(opts, :user_id),
      request_id: Keyword.get(opts, :request_id, UUID.uuid4())
    )

    Logger.info("Starting OSINT tool execution",
      params: inspect(params),
      requires_auth: tool_config.requires_auth
    )

    start_time = System.monotonic_time(:millisecond)

    result = tool_config.module.search(params, opts)

    duration_ms = System.monotonic_time(:millisecond) - start_time

    case result do
      {:ok, data} ->
        Logger.info("Tool execution completed",
          duration_ms: duration_ms,
          result_count: count_results(data)
        )
        {:ok, data}

      {:error, reason} ->
        Logger.error("Tool execution failed",
          duration_ms: duration_ms,
          error: inspect(reason)
        )
        {:error, reason}
    end
  end

  defp count_results(data) when is_list(data), do: length(data)
  defp count_results(data) when is_map(data), do: 1
  defp count_results(_), do: 0
end
```

### Structured Log Query Examples

The resulting JSON logs enable powerful queries:

```elixir
defmodule PrismaticLogging.Query do
  @moduledoc """
  Examples of structured log queries enabled by JSON formatting.
  These queries work with any JSON-aware log aggregator.
  """

  # Query: All errors from OSINT tools in last hour
  # filter: level == "error" AND tool_slug != null AND timestamp > now() - 1h

  # Query: Slow tool executions (>5s)
  # filter: duration_ms > 5000 AND tool_slug != null

  # Query: Failed DD pipeline stages
  # filter: level == "error" AND pipeline_stage != null

  # Query: Per-tool error rate
  # group by: tool_slug
  # aggregation: count(level == "error") / count(*)

  @spec build_query(keyword()) :: map()
  def build_query(opts) do
    %{
      level: Keyword.get(opts, :level),
      time_range: Keyword.get(opts, :time_range, "1h"),
      filters: Keyword.get(opts, :filters, %{}),
      group_by: Keyword.get(opts, :group_by),
      aggregation: Keyword.get(opts, :aggregation)
    }
  end
end
```

## Architecture & Implementation

Structured logging in the platform follows the principle of "log once, query many ways." Every log entry is written as a single JSON line, which can be consumed by local file readers, shipped to cloud log aggregators, or processed by real-time stream processors. The JSON format is self-describing, requiring no external schema to interpret.

The platform uses Logger metadata propagation to ensure that context established at the request boundary flows through to all log entries within that process. When a Phoenix endpoint sets `Logger.metadata(request_id: "abc123")`, every log entry from controllers, LiveView mounts, tool executions, and database queries within that request automatically includes the request ID.

Production logging follows strict guidelines: no PII in log entries, no raw error stacktraces at info level, no debug-level logs compiled into production builds. The `compile_time_purge_matching` configuration removes debug logs at compile time, ensuring zero runtime cost for disabled log levels.

## Usage in Prismatic Platform

Structured logging is the standard for all platform subsystems:

```elixir
require Logger

# Attach context
Logger.metadata(pipeline_stage: :fetch, source_group: :forbes)

# Structured log entries
Logger.info("Fetch started", estimated_records: 100)
Logger.info("Fetch completed", record_count: 98, duration_ms: 1250)
```

## Cross-References

- [Telemetry](@/glossary/telemetry.md) - Event system complementing structured logging
- [Monitoring](@/glossary/monitoring.md) - Infrastructure consuming structured log data
- [Observability](@/glossary/observability.md) - Broader practice encompassing structured logging
- [JSON](@/glossary/json.md) - Data format used for structured log entries

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
