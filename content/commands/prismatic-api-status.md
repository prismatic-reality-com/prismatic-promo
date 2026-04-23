+++
title = "/prismatic-api-status"
weight = 1460
[extra]
category = "API"
description = "Prismatic API auto-introspecting REST gateway status"
syntax = "/prismatic-api-status [options]"
authority = "L2+"
agent = "elixir-core-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 991
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["prismatic-api-status", "Prismatic", "REST", "commands", "API", "Prismatic Platform", "Telemetry", "PrismaticApi"]
tags = ["commands", "api", "prismatic-api-status", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/prismatic-api-status - Prismatic Platform"
+++

## Overview

**/prismatic-api-status** is a production command in the **API** category of the Prismatic Platform that provides comprehensive health and operational status reporting for the auto-introspecting REST gateway. The command queries the running [Prismatic API](@/glossary/prismatic-api.md) application to aggregate endpoint discovery statistics, scanner health, registry cache status, request throughput metrics, and error rates into a unified dashboard view.

The Prismatic API gateway is unique in that it discovers its own endpoints at boot time by introspecting all `Prismatic*` facade modules. This means the API surface is dynamic -- it changes as new modules are added or existing ones are modified. The status command provides visibility into this dynamic surface, reporting exactly how many modules were discovered, how many functions are exposed, and whether any modules failed introspection due to type mapping issues or missing documentation.

This command operates under the **L2+** authority level and is executed by the `elixir-core-specialist` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The command is used frequently during development and deployment cycles to verify that the API gateway is fully operational and that all expected endpoints are accessible.

Beyond simple health checks, the status command provides deep diagnostic information including per-endpoint latency percentiles, connection pool utilization, authentication success rates, and rate limiter state. This makes it an essential tool for both operational monitoring and troubleshooting API-related issues in production environments.

## Architecture

The status command aggregates data from multiple subsystems within the API gateway architecture.

```
/prismatic-api-status
         |
         v
+------------------+
| StatusAggregator |
+------------------+
    |    |    |    |
    v    v    v    v
+------+ +------+ +------+ +------+
|Scanner| |Registry| |Router| |Telemetry|
|Health | |Stats  | |Metrics| |Events |
+------+ +------+ +------+ +------+
    |         |         |         |
    v         v         v         v
+-------------------------------------------+
|          Formatted Status Report          |
+-------------------------------------------+
```

| Component | Data Source | Metrics Provided |
|-----------|-----------|------------------|
| **Scanner** | `PrismaticApi.Scanner` | Module count, scan duration, last scan timestamp |
| **Registry** | `PrismaticApi.Registry` (ETS) | Endpoint count, cache hit rate, memory usage |
| **Router** | `PrismaticApi.Router` | Active routes, method distribution, path patterns |
| **Telemetry** | `:telemetry` events | Request count, latency P50/P95/P99, error rates |
| **Auth** | `PrismaticWeb.Plugs.APIAuth` | Auth success/failure counts, token validity |

## Usage

### Basic Status Check

```bash
# Quick status overview
/prismatic-api-status

# Detailed status with all metrics
/prismatic-api-status --verbose

# JSON output for programmatic consumption
/prismatic-api-status --format json
```

### Health Monitoring

```bash
# Check if API is healthy (exit code 0 = healthy, 1 = unhealthy)
/prismatic-api-status --health-check

# Include endpoint-level health
/prismatic-api-status --endpoints

# Show only endpoints with errors
/prismatic-api-status --errors-only
```

### Performance Metrics

```bash
# Display request latency percentiles
/prismatic-api-status --latency

# Show throughput over the last hour
/prismatic-api-status --throughput --window 1h

# Display connection pool utilization
/prismatic-api-status --connections
```

### Diagnostic Mode

```bash
# Full diagnostic dump including internal state
/prismatic-api-status --diagnose

# Check for misconfigured or unreachable endpoints
/prismatic-api-status --check-endpoints

# Verify OpenAPI spec consistency with live endpoints
/prismatic-api-status --verify-spec
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--verbose` | `boolean` | `false` | Include detailed metrics for all subsystems |
| `--format` | `json \| text \| table` | `text` | Output format for status report |
| `--health-check` | `boolean` | `false` | Simple pass/fail health check with exit code |
| `--endpoints` | `boolean` | `false` | Include per-endpoint status and metrics |
| `--errors-only` | `boolean` | `false` | Show only endpoints or subsystems with errors |
| `--latency` | `boolean` | `false` | Display request latency percentiles (P50/P95/P99) |
| `--throughput` | `boolean` | `false` | Display request throughput statistics |
| `--window` | `string` | `5m` | Time window for metric aggregation |
| `--connections` | `boolean` | `false` | Show connection pool utilization |
| `--diagnose` | `boolean` | `false` | Full diagnostic dump of internal state |
| `--check-endpoints` | `boolean` | `false` | Verify all endpoints are reachable |
| `--verify-spec` | `boolean` | `false` | Compare live endpoints against OpenAPI spec |

## Execution Flow

The status command executes a multi-phase data collection and aggregation pipeline.

1. **Gateway Connectivity** -- The command first verifies that the API gateway process is running and responsive. On port 4004, a lightweight health check endpoint (`/api/v1/health`) is pinged with a 5-second timeout.

2. **Scanner Status** -- The Scanner GenServer is queried for its current state, including the number of discovered modules, the last scan timestamp, any scan errors, and the total scan duration.

3. **Registry Metrics** -- ETS table statistics are collected from the endpoint registry, including total entries, memory consumption, and cache hit/miss ratios since the last restart.

4. **Request Metrics** -- [Telemetry](@/glossary/telemetry.md) event aggregations are retrieved for the specified time window. These include total request count, success/error breakdown, and latency distribution across percentiles.

5. **Authentication Metrics** -- Auth plug statistics are collected, including token validation counts, expired token rejections, and unauthorized access attempts.

6. **Report Assembly** -- All collected metrics are assembled into the requested output format and displayed. Exit codes are set based on overall health for script integration.

```elixir
# Programmatic status check
{:ok, status} = PrismaticApi.Status.check()
# => %{healthy: true, endpoints: 47, uptime_seconds: 86400, ...}
```

## Integration Points

| System | Integration | Purpose |
|--------|-------------|---------|
| [Prismatic API](@/apps/prismatic-api.md) | Primary target -- reports on this application | Status source |
| [Telemetry](@/glossary/telemetry.md) | Consumes `[:prismatic_api, :request, :*]` events | Metrics source |
| [Quality Gates](@/glossary/quality-gates.md) | API health as a quality gate prerequisite | Gate input |
| CI/CD Pipeline | Health check in deployment verification | Deployment gate |
| [Prismatic Web](@/apps/prismatic-web.md) | API status widget on admin dashboard | Display |
| Monitoring/Alerting | Structured JSON output for log aggregation | Observability |
| [AIAD Registry](@/glossary/aiad.md) | Command registration and discovery | Infrastructure |

## Best Practices

1. **Post-deployment verification** -- Always run `/prismatic-api-status --check-endpoints` after deploying changes to verify that all endpoints are accessible and responding correctly.

2. **Baseline establishment** -- Capture a status snapshot before making changes with `--format json` to enable before/after comparison of endpoint counts and performance metrics.

3. **Monitoring integration** -- Use `--format json --health-check` in monitoring scripts to feed structured health data into alerting systems. The command returns exit code 0 for healthy and 1 for unhealthy states.

4. **Regular spec verification** -- Run `--verify-spec` periodically to detect drift between the live endpoint surface and the OpenAPI specification. Drift indicates that facade modules have changed without regenerating the spec.

5. **Window tuning** -- Adjust `--window` based on traffic patterns. Use shorter windows (1m-5m) for real-time troubleshooting and longer windows (1h-24h) for trend analysis.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :gateway_unreachable}` | API gateway process not running on port 4004 | Start the API application with `mix phx.server` |
| `{:error, :scanner_not_running}` | Scanner GenServer has crashed | Check application supervisor tree and logs |
| `{:error, :registry_empty}` | No endpoints discovered | Verify facade modules are compiled and loaded |
| `{:error, :telemetry_unavailable}` | Telemetry system not initialized | Check telemetry handler registration in application startup |
| `{:error, :timeout}` | Status collection exceeded timeout | Individual subsystem may be overloaded; use `--diagnose` |

When partial status collection succeeds, the command outputs available data and flags missing subsystems with `[UNAVAILABLE]` markers rather than failing entirely. This ensures operators always receive maximum available information.

## Advanced Usage

### Continuous Monitoring

```bash
# Watch status every 10 seconds
watch -n 10 '/prismatic-api-status --format text --latency'

# Stream status as JSON lines for log processing
while true; do /prismatic-api-status --format json; sleep 30; done | jq -c .
```

### Programmatic Health Checks

```elixir
# Use in deployment health check
defmodule MyApp.HealthCheck do
  def check_api do
    case PrismaticApi.Status.check() do
      {:ok, %{healthy: true}} -> :ok
      {:ok, %{healthy: false, errors: errors}} -> {:error, errors}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

### Comparison with Baseline

```bash
# Save baseline
/prismatic-api-status --format json > /tmp/api-baseline.json

# After changes, compare
/prismatic-api-status --format json > /tmp/api-current.json
diff <(jq -S . /tmp/api-baseline.json) <(jq -S . /tmp/api-current.json)
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The status command reports all subsystem states without omission. An unhealthy gateway is reported unambiguously with actionable diagnostic information.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Status data is collected directly from running processes and telemetry events, never estimated or cached beyond the specified window.

The command upholds [NABLA](@/glossary/nabla-infinity.md) Signal Plurality by aggregating status from multiple independent subsystems rather than relying on a single health indicator.

## Related Commands

- [/prismatic-api-endpoints](@/commands/prismatic-api-endpoints.md) - List all auto-discovered API endpoints from facade modules
- [/prismatic-api-rescan](@/commands/prismatic-api-rescan.md) - Trigger endpoint re-scan of all Prismatic facade modules
- [/prismatic-api-spec](@/commands/prismatic-api-spec.md) - Generate and view [OpenAPI](@/glossary/openapi.md) 3.0 specification
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/quality-gates](@/commands/quality-gates.md) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/connect](@/commands/connect.md) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)