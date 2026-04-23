+++
title = "/health"
weight = 910
[extra]
category = "Operations"
description = "System health check with component-level status reporting"
syntax = "/health [options]"
authority = "L2+"
agent = "health-check-agent"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1244
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["health", "System", "commands", "Operations", "Prismatic Platform", "Check", "Performance"]
tags = ["commands", "operations", "health", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/health - Prismatic Platform"
+++

## Overview

**/health** is a production command in the **Operations** category of the Prismatic Platform that performs comprehensive system health checks across all platform components, providing detailed status reporting at the component, application, service, and infrastructure levels. The command serves as the primary diagnostic tool for assessing the operational readiness of the platform's 89+ umbrella applications, external service connections, database states, cache layers, and runtime environment configuration.

This command operates under the **L2+** authority level and is executed by the `health-check-agent`, which systematically probes each platform component to determine its operational status. The agent performs both shallow checks (is the component running?) and deep checks (is the component functioning correctly?) to provide a nuanced view of system health. Each component check produces a status classification (healthy, degraded, unhealthy, or unknown) along with diagnostic details and performance metrics. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

System health monitoring is critical in the Prismatic Platform's architecture because the umbrella application structure means that failures in foundational applications (such as `prismatic_storage_core` or `prismatic`) can cascade to dependent applications throughout the system. The `/health` command maps these dependencies and reports health status in dependency order, making it immediately clear whether an unhealthy component is a root cause or a downstream effect. This dependency-aware health reporting eliminates the common problem of alert storms where a single root cause triggers dozens of seemingly independent health failures.

The command enforces the platform's Page Load Performance Standard by including response time measurements in its health checks. The health check endpoint itself must respond within 10ms, and all other endpoints are measured against their respective performance standards (250ms page load, 100ms server render, 150ms LiveView mount). Performance degradation is reported as a health issue even when components are functionally correct.

## Architecture

```
/health Command
    |
    +-- Component Health Checker
    |       +-- OTP Application Prober
    |       +-- GenServer Health Monitor
    |       +-- Supervision Tree Walker
    |       +-- Process Registry Scanner
    |
    +-- Service Health Checker
    |       +-- PostgreSQL Connectivity
    |       +-- Redis Connectivity
    |       +-- Meilisearch Connectivity
    |       +-- KuzuDB Connectivity
    |       +-- Ollama Model Status
    |
    +-- Infrastructure Health Checker
    |       +-- Fly.io Instance Status
    |       +-- Memory Usage Monitor
    |       +-- Disk Space Monitor
    |       +-- CPU Load Monitor
    |       +-- Network Connectivity
    |
    +-- Performance Health Checker
    |       +-- Endpoint Response Timer
    |       +-- Database Query Timer
    |       +-- Cache Hit Rate Monitor
    |       +-- LiveView Connection Monitor
    |
    +-- Dependency Mapper
    |       +-- Application Dependency Graph
    |       +-- Root Cause Analyzer
    |       +-- Cascade Impact Predictor
    |
    +-- Health Reporter
            +-- Status Aggregator
            +-- Dashboard Formatter
            +-- JSON Exporter
            +-- Telemetry Emitter
```

The architecture uses a hierarchical probing strategy. Component health checks verify that OTP applications are running and their supervision trees are intact. Service health checks verify connectivity to external dependencies (databases, caches, search engines). Infrastructure health checks verify the underlying system resources. Performance health checks measure response times against defined thresholds. The Dependency Mapper correlates failures across components to identify root causes.

## Usage

### Quick Health Check

```bash
# Basic system health overview
/health

# Detailed health check with component-level breakdown
/health --verbose

# Health check for specific component
/health --component=prismatic_web

# Health check for a specific category
/health --category=services
```

### Service Health

```bash
# Check all external service connections
/health services

# Check database health specifically
/health services --service=postgresql

# Check search engine status
/health services --service=meilisearch

# Check AI model availability
/health services --service=ollama
```

### Performance Health

```bash
# Check performance against defined standards
/health performance

# Check specific endpoint performance
/health performance --endpoint=/perimeter

# Check database query performance
/health performance --category=database

# Performance trend over last hour
/health performance --trend --window=1h
```

### Infrastructure Health

```bash
# Check infrastructure resource usage
/health infrastructure

# Check memory usage across processes
/health infrastructure --memory

# Check disk space
/health infrastructure --disk

# Check Fly.io instance status
/health infrastructure --fly
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--verbose` | flag | false | Include detailed diagnostic information per component |
| `--component` | string | all | Specific umbrella application to check |
| `--category` | string | all | Check category (components, services, infrastructure, performance) |
| `--service` | string | all | Specific external service to check (postgresql, redis, meilisearch, kuzudb, ollama) |
| `--endpoint` | string | none | Specific web endpoint to performance check |
| `--memory` | flag | false | Include detailed memory analysis |
| `--disk` | flag | false | Include disk space analysis |
| `--fly` | flag | false | Include Fly.io instance status |
| `--trend` | flag | false | Show health trend over time |
| `--window` | string | 1h | Time window for trend analysis |
| `--format` | string | text | Output format (text, json, markdown, dashboard) |
| `--output` | string | stdout | File path for report output |
| `--threshold` | string | standard | Health threshold sensitivity (strict, standard, lenient) |

## Execution Flow

1. **Dependency Graph Construction**: Build the application dependency graph from the umbrella project's mix.exs configurations. This graph determines the order of health checks and enables root cause analysis.

2. **Component Probing**: Check each OTP application in dependency order. For each application, verify that it is started, its supervision tree is intact (all child processes running), and its key GenServers respond to health check messages.

3. **Service Probing**: Test connectivity to each external service. For PostgreSQL, execute a lightweight query (`SELECT 1`). For Redis, execute PING. For Meilisearch, check the health endpoint. For KuzuDB, verify graph connectivity. For Ollama, check model availability.

4. **Performance Measurement**: Measure response times for key endpoints against the platform's performance standards. Record timing data for trend analysis. Flag any measurements that exceed defined thresholds.

5. **Infrastructure Assessment**: Check system resource utilization (memory, disk, CPU). For Fly.io deployments, query instance status and scaling configuration. Flag resource utilization above warning thresholds.

6. **Root Cause Analysis**: When unhealthy components are detected, trace the dependency graph to identify root causes. If `prismatic_storage_ecto` is unhealthy due to PostgreSQL connection failure, all dependent applications are reported as "degraded (upstream dependency)" rather than independently unhealthy.

7. **Status Aggregation**: Compute the aggregate system health status. The aggregate is the worst status among all components: if any component is unhealthy, the system is unhealthy. Generate the health report with per-component details.

8. **Reporting**: Output the health report in the requested format. Emit [telemetry](/glossary/telemetry/) events for health monitoring dashboards. Store health check results for trend analysis.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Agent Execution | Executed by `health-check-agent` at L2+ authority |
| [Quality Gates](/glossary/quality-gates/) | Pre-deployment Check | Health check is a mandatory gate before deployments |
| [Telemetry](/glossary/telemetry/) | Continuous Monitoring | Health metrics feed into platform telemetry dashboards |
| [Prismatic Web](/apps/prismatic-web/) | Dashboard Display | Health status displayed in LiveView operations dashboard |
| [/guardrails](/commands/guardrails/) | Deployment Safety | Health checks are a guardrail for deployment gates |
| PostgreSQL | Service Dependency | Database connectivity and query performance monitored |
| Redis | Service Dependency | Cache connectivity and hit rates monitored |
| Meilisearch | Service Dependency | Search engine health and index status monitored |
| Fly.io | Infrastructure | Instance status and resource utilization tracked |
| OTP Supervision Trees | Component Health | Application supervisor tree integrity verified |

## Best Practices

**Regular Health Checks**: Execute `/health` at the start of every development session to verify that the development environment is properly configured and all services are available. This catches configuration drift and service outages early.

**Dependency-Aware Troubleshooting**: When health checks report multiple unhealthy components, focus on the root cause identified by the dependency analysis. Fixing the root cause will resolve downstream health issues automatically.

**Performance Baselines**: Establish performance baselines for all endpoints using `/health performance` before and after significant changes. Store baseline data for trend comparison.

**Threshold Tuning**: Use `--threshold=strict` for production environments where any performance degradation is concerning, and `--threshold=lenient` for development environments where services may not be fully optimized.

**Automated Health Monitoring**: Integrate `/health` into the platform's session lifecycle hooks to run automatic health checks at session start and periodically during long sessions. Configure alerts for health degradation.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `PostgreSQL connection refused` | Database not running or misconfigured | Start PostgreSQL and verify connection settings in config |
| `Meilisearch unreachable` | Search engine not running | Start Meilisearch service or verify network configuration |
| `OTP application not started` | Application failed to start | Check application logs for startup errors |
| `Performance threshold exceeded` | Endpoint response time too high | Profile and optimize the affected endpoint |
| `Memory usage critical` | System running low on memory | Identify memory-intensive processes; consider scaling resources |
| `Supervision tree incomplete` | Child process crashed without restart | Investigate process crash logs; check supervisor configuration |

## Advanced Usage

### Continuous Health Monitoring

```bash
# Start continuous health monitoring with 30-second intervals
/health --monitor --interval=30s

# Monitor specific services continuously
/health services --monitor --service=postgresql --interval=10s

# Export health metrics to Prometheus format
/health --monitor --format=prometheus --port=9090
```

### Health Check Scripting

```elixir
# Programmatic health check via Elixir
{:ok, report} = PrismaticSafety.HealthCheck.run(:full)
# => {:ok, %{status: :healthy, components: [...], services: [...]}}

# Check specific component programmatically
{:ok, status} = PrismaticSafety.HealthCheck.check_component(:prismatic_web)
# => {:ok, %{status: :healthy, response_time: 3, details: %{...}}}
```

### Custom Health Check Endpoints

The health check system exposes HTTP endpoints for external monitoring tools.

```bash
# Lightweight health check (< 10ms response required)
curl http://localhost:4000/api/health
# => {"status": "healthy", "timestamp": "2026-02-15T10:30:00Z"}

# Detailed health check with component breakdown
curl http://localhost:4000/api/health/detailed
# => {"status": "healthy", "components": [...], "services": [...]}
```

## Doctrine Compliance

All health check operations enforce the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine.

- **NO MERCY**: Health checks are comprehensive -- every component, service, and infrastructure element is probed. There is no "good enough" health status; components are either healthy or they are not. Performance thresholds are absolute: 250ms page load, 100ms server render, 10ms health check. No exceptions.
- **NO DOUBTS**: Health status is determined through direct probing, not assumptions. Database connectivity is verified with actual queries, not just socket checks. Performance is measured against actual response times, not estimates. All health data includes timestamps for temporal context.

The command enforces the Page Load Performance Standard (P0 - ABSOLUTE) by including performance measurements as health criteria.

## Related Commands

- [/guardrails](/commands/guardrails/) - CI/CD guardrails enforcement for deployment safety
- [/hygiene](/commands/hygiene/) - Ultra-fast dependency-free static analysis for code hygiene
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)