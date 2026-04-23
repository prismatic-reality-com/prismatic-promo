+++
title = "Log Level"
weight = 50
[extra]
description = "A log level is a severity classification assigned to log messages that determines their importance, visibility, and routing in a logging system -- Elixir's Logger implements RFC 5424 with compile-time purging for zero-overhead debug calls in production."
category = "platform"
domain = "observability"
complexity = "beginner"
stability = "stable"
related_terms = ["logging", "profiling", "kpi", "audit-logging", "telemetry", "structured-log", "otel", "observability", "monitoring", "debugging"]
tags = ["glossary", "log-level", "logging", "severity", "debugging", "monitoring", "observability", "operations", "elixir", "logger"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "beginner"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
beam_related = true
key_takeaway = "Elixir's Logger levels (emergency through debug) enable Prismatic Platform to enforce zero-noise production output with compile-time purging while preserving full diagnostic capability through runtime level adjustment."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["log level", "logging severity", "debug level", "info level", "warning level", "error level", "log filtering", "structured logging", "Logger", "compile-time purging"]
image = "/images/sections/glossary.png"
image_alt = "Log Level - Prismatic Platform"
word_count = 3400
see_also = ["capabilities", "architecture", "audit-logging"]
+++

## Definition

A **log level** is a categorical severity label attached to each log message that indicates its importance and intended audience. Standard log levels, ordered from most to least severe, are: emergency (system unusable), alert (immediate action required), critical (critical conditions), error (error conditions), warning (potentially harmful), notice (normal but significant), info (informational), and debug (detailed diagnostic). This hierarchy enables runtime filtering: setting the log level to `warning` suppresses all `info` and `debug` messages, reducing output volume while retaining actionable signals.

Log levels serve two distinct purposes: during development, low-severity levels (debug, info) provide detailed execution traces for understanding behavior; in production, high-severity levels (warning, error, critical) surface only actionable conditions that require attention. The ability to adjust log levels at runtime -- without redeployment -- is a critical operational capability that enables detailed investigation during incidents without permanent verbosity.

In the Prismatic Platform, log levels are a cornerstone of the OTEL (Observability [Telemetry](@/glossary/telemetry.md) Enforcement Layer) doctrine, which mandates appropriate logging in all [GenServer](@/glossary/genserver.md) handlers, controller actions, and rescue blocks.

## Core Concepts

### The Severity Hierarchy

Elixir's Logger implements the Syslog severity scale (RFC 5424):

| Level | Numeric | Meaning | Production Visible | Example |
|-------|---------|---------|-------------------|---------|
| `:emergency` | 0 | System is unusable | Yes | BEAM VM crash, disk full |
| `:alert` | 1 | Immediate action required | Yes | Database connection pool exhausted |
| `:critical` | 2 | Critical conditions | Yes | Supervision tree root terminated |
| `:error` | 3 | Error conditions | Yes | OSINT tool execution failed |
| `:warning` | 4 | Potentially harmful situations | Yes | Rate limit approached, retry triggered |
| `:notice` | 5 | Normal but significant events | No (prod) | Application started, config loaded |
| `:info` | 6 | Informational messages | No (prod) | Tool execution completed, entity loaded |
| `:debug` | 7 | Detailed diagnostic information | No (prod) | Function parameters, intermediate state |

The hierarchy is strictly ordered: setting the log level to `:warning` shows everything from `:emergency` through `:warning` and suppresses `:notice`, `:info`, and `:debug`.

### Compile-Time Purging

Elixir's Logger provides a unique optimization: **compile-time purging**. Log calls below a configured level are removed at compilation, producing zero runtime overhead:

```elixir
# config/config.exs
config :logger, compile_time_purge_matching: [
  [level_lower_than: :info]  # Remove all :debug calls from compiled code
]

# In production, this:
Logger.debug("Detailed state: #{inspect(large_state)}")
# Compiles to literally nothing -- not even the string interpolation runs
```

This means debug logging in production code is free. Developers can add detailed `Logger.debug` calls without worrying about performance -- in production builds, these calls don't exist in the bytecode.

| Purge Level | Removed Calls | Use Case |
|-------------|---------------|----------|
| `:debug` | None removed | Development, testing |
| `:info` | `:debug` removed | Staging environments |
| `:warning` | `:debug`, `:info`, `:notice` | Production (Prismatic default) |
| `:error` | Everything below `:error` | High-throughput services |

### Structured Logging

Structured logging attaches machine-parseable metadata alongside human-readable text:

```elixir
# Unstructured (hard to parse, query, aggregate)
Logger.info("Tool shodan completed in 234ms with 15 results")

# Structured (machine-parseable, queryable, aggregatable)
Logger.info("Tool execution completed",
  tool: "shodan",
  duration_ms: 234,
  result_count: 15,
  execution_id: "exec_abc123"
)
```

In Elixir, `Logger.metadata/1` attaches key-value pairs to all subsequent log calls in the current process, enabling correlation across distributed traces:

```elixir
def handle_call({:execute, tool_slug, params}, _from, state) do
  Logger.metadata(
    tool: tool_slug,
    execution_id: Ecto.UUID.generate(),
    request_id: state.current_request_id
  )

  # All subsequent Logger calls in this process include the metadata
  Logger.info("Starting execution")
  result = do_execute(tool_slug, params)
  Logger.info("Execution complete", result_count: length(result))

  {:reply, result, state}
end
```

### Per-Module Level Override

Elixir's Logger supports runtime per-module level overrides, enabling surgical verbosity during incident investigation:

```elixir
# Normal operation: only warnings and above from OSINT tools
Logger.put_module_level(PrismaticOsintCore.ToolExecutor, :warning)

# During incident: enable debug for specific module only
Logger.put_module_level(PrismaticOsintCore.ToolExecutor, :debug)

# Reset to global default
Logger.delete_module_level(PrismaticOsintCore.ToolExecutor)
```

This capability is critical for production debugging: you can increase verbosity for a single module without flooding logs from the entire application.

## Technical Deep Dive

### Logger Architecture in BEAM

```
┌─────────────────────────┐
│    Application Code     │
│  Logger.info("msg")     │
└────────────┬────────────┘
             │
     ┌───────▼────────┐
     │  Logger Module  │  (Level check, metadata merge)
     └───────┬────────┘
             │
     ┌───────▼────────┐
     │  Logger Backend │  (Erlang :logger)
     └───────┬────────┘
             │
     ┌───────▼────────┐    ┌──────────────┐
     │ Console Handler │    │ File Handler  │
     │ (level: :warn)  │    │ (level: :info)│
     └────────────────┘    └──────────────┘
```

Multiple handlers can have independent level configurations. The Prismatic Platform configures:

| Handler | Level | Output | Purpose |
|---------|-------|--------|---------|
| Console | `:warning` (prod) | stdout | Operational monitoring |
| File | `:info` | `log/prismatic.log` | Detailed audit trail |
| JSON | `:info` | `log/structured.json` | Log aggregation (ELK/Loki) |
| Telemetry | All levels | `:telemetry` events | Metrics derivation |

### Level Selection Decision Tree

```
Is this a failure that needs human attention?
├── Yes → Is the system still functional?
│   ├── No → :critical or :emergency
│   └── Yes → :error
├── No → Is this a potential problem?
│   ├── Yes → :warning
│   └── No → Is this a significant business event?
│       ├── Yes → :info
│       └── No → :debug
```

### When to Use Each Level

| Level | Use When | Examples | Anti-Patterns |
|-------|----------|---------|---------------|
| `:emergency` | System cannot function | VM memory exhaustion, disk full | Never -- let BEAM handle this |
| `:alert` | Immediate human action needed | All DB connections exhausted | Transient errors (use :error) |
| `:critical` | Critical subsystem failure | Supervision tree collapsed | Expected failures (use :error) |
| `:error` | Operation failed, needs investigation | API call returned 500, query timeout | Expected conditions (use :warning) |
| `:warning` | Anomaly that may need attention | Rate limit approaching, retry triggered, deprecation | Every request (becomes noise) |
| `:notice` | Significant normal event | Application started, migration completed | Frequent events (use :info) |
| `:info` | Business event completed | Entity loaded, tool executed, report generated | Per-request logging (too verbose) |
| `:debug` | Diagnostic detail | Function args, intermediate state, SQL queries | Production (use compile-time purge) |

## Usage in Prismatic Platform

### Clean Run Policy

The platform enforces a Clean Run policy: zero unexpected output in production. This means:

```elixir
# config/prod.exs
config :logger,
  level: :warning,
  compile_time_purge_matching: [
    [level_lower_than: :info]  # Remove :debug from bytecode
  ]

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id, :tool, :execution_id, :module]
```

### OTEL Doctrine Compliance

The OTEL doctrine requires logging in specific patterns:

```elixir
# OTEL REQUIRED: GenServer init logging
@impl true
def init(config) do
  Logger.info("#{__MODULE__} starting", config: inspect(config))
  {:ok, initial_state(config)}
end

# OTEL REQUIRED: Rescue block logging
def execute(tool, params) do
  # execution logic
rescue
  e in [RuntimeError, ArgumentError] ->
    Logger.error("Execution failed",
      tool: tool,
      error: Exception.message(e),
      stacktrace: Exception.format_stacktrace(__STACKTRACE__)
    )
    {:error, {:execution_failed, Exception.message(e)}}
end

# OTEL REQUIRED: Controller action logging
def create(conn, params) do
  Logger.info("Creating entity", params: inspect(Map.keys(params)))
  # action logic
end
```

### OSINT Tool Execution Logging

```elixir
defmodule PrismaticOsintCore.ToolExecutor do
  @moduledoc "Executes OSINT tools with structured logging at appropriate levels."

  require Logger

  @spec execute(String.t(), map()) :: {:ok, map()} | {:error, term()}
  def execute(tool_slug, params) do
    execution_id = Ecto.UUID.generate()
    Logger.metadata(tool: tool_slug, execution_id: execution_id)

    Logger.debug("Starting OSINT tool execution",
      params: inspect(Map.keys(params))
    )

    start_time = System.monotonic_time(:millisecond)

    case do_execute(tool_slug, params) do
      {:ok, result} ->
        duration = System.monotonic_time(:millisecond) - start_time

        Logger.info("Tool execution completed",
          result_count: map_size(result),
          duration_ms: duration
        )

        :telemetry.execute(
          [:prismatic, :osint, :execution],
          %{duration_ms: duration, result_count: map_size(result)},
          %{tool: tool_slug}
        )

        {:ok, result}

      {:error, :rate_limited} ->
        Logger.warning("Tool rate limited, scheduling retry",
          retry_after_seconds: 60
        )
        {:error, :rate_limited}

      {:error, reason} ->
        Logger.error("Tool execution failed",
          reason: inspect(reason)
        )
        {:error, reason}
    end
  end

  defp do_execute(_tool_slug, _params) do
    {:ok, %{status: :completed}}
  end
end
```

### Runtime Level Adjustment for Incidents

```elixir
defmodule PrismaticOps.LogLevelManager do
  @moduledoc """
  Runtime log level management for incident response.
  Allows targeted verbosity increases without redeployment.
  """

  require Logger

  @spec enable_debug(module()) :: :ok
  def enable_debug(module) do
    Logger.warning("Enabling debug logging",
      target_module: inspect(module),
      operator: "incident_response"
    )

    Logger.put_module_level(module, :debug)
  end

  @spec reset_module(module()) :: :ok
  def reset_module(module) do
    Logger.info("Resetting module log level to default",
      target_module: inspect(module)
    )

    Logger.delete_module_level(module)
  end

  @spec enable_debug_temporary(module(), pos_integer()) :: :ok
  def enable_debug_temporary(module, seconds \\ 300) do
    enable_debug(module)

    Task.start(fn ->
      Process.sleep(:timer.seconds(seconds))
      reset_module(module)
      Logger.info("Auto-reset debug logging after #{seconds}s",
        target_module: inspect(module)
      )
    end)

    :ok
  end

  @spec current_levels() :: list({module(), atom()})
  def current_levels do
    Logger.get_module_level(:all)
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| `:info` for every request | Floods production logs | Use `:debug` for per-request detail |
| String interpolation in debug | Evaluates even when purged at runtime | Use compile-time purging or macro form |
| No structured metadata | Can't query/aggregate logs | Always use keyword metadata |
| Same level for all modules | Can't debug specific subsystem | Use per-module level overrides |
| Error for expected conditions | Rate limits, retries flagged as errors | Use `:warning` for expected anomalies |
| No correlation IDs | Can't trace requests across processes | Set `Logger.metadata` at entry points |
| Logging sensitive data | PII/secrets in log output | Never log passwords, tokens, or PII |

## Anti-Patterns

```elixir
# BAD: String interpolation runs even if debug is filtered at runtime
Logger.debug("Processing #{inspect(large_map)} with #{length(big_list)} items")
# The inspect/1 and length/1 calls execute even if debug is suppressed!

# GOOD: Use compile-time purging to eliminate entirely
# config: compile_time_purge_matching: [[level_lower_than: :info]]
Logger.debug("Processing entity", entity_id: entity.id, count: length(items))

# BAD: Logging in hot paths
def validate_token(token) do
  Logger.info("Validating token: #{token}")  # Called 1000x/sec!
  # ...
end

# GOOD: Debug level + compile-time purge for hot paths
def validate_token(token) do
  Logger.debug("Token validation", token_prefix: String.slice(token, 0..7))
  # ...
end
```

## Best Practices

1. **Use `:debug` for detailed execution traces** useful only during development -- compile-time purging eliminates them in production.
2. **Use `:info` for significant business events** (tool execution completed, entity loaded) -- not per-request detail.
3. **Use `:warning` for recoverable anomalies** (rate limiting, retries, deprecation) that may need attention.
4. **Use `:error` for failures requiring investigation** -- each error should be actionable.
5. **Never use `:info` or `:debug` for conditions that occur on every request** -- these become noise.
6. **Include structured metadata** in all log calls for machine parseability and correlation.
7. **Set compile-time purge level to `:info`** in production to eliminate debug call overhead entirely.
8. **Use `Logger.metadata/1`** at process initialization to attach correlation IDs that propagate through all subsequent log calls.
9. **Never log sensitive data** -- passwords, API keys, tokens, PII must never appear in logs.
10. **Use per-module level overrides** for incident investigation instead of changing global level.

## Related Terms

- [Logging](@/glossary/logging.md) -- the broader practice of recording system events
- [Telemetry](@/glossary/telemetry.md) -- metrics collection complementing log-based observability
- [Structured Log](@/glossary/structured-log.md) -- machine-parseable log format
- [Audit Logging](@/glossary/audit-logging.md) -- compliance-oriented event recording
- [KPI](@/glossary/kpi.md) -- metrics derived from log analysis
- [Observability](@/glossary/observability.md) -- the broader discipline encompassing logging
- [Profiling](@/glossary/profiling.md) -- performance analysis complementing log-based debugging
- [Monitoring](@/glossary/monitoring.md) -- system health tracking using log signals
- [GenServer](@/glossary/genserver.md) -- OTP behaviour requiring OTEL logging compliance

## See Also

- [Architecture](@/architecture/_index.md) -- observability architecture
- [Capabilities](@/capabilities/_index.md) -- monitoring and logging capabilities
- [Elixir Logger Documentation](https://hexdocs.pm/logger/)
- [OTEL Doctrine](@/architecture/_index.md) -- observability enforcement requirements

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
