+++
title = "Production Environment"
weight = 50
[extra]
tags = ["glossary", "deployment", "infrastructure", "devops", "operations", "fly-io", "production"]
description = "A production environment is the live, user-facing deployment of an application where real traffic is served, real data is processed, and operational reliability directly impacts end users and business outcomes."
category = "infrastructure"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["fly-io", "docker", "ci-cd", "blue-green-deployment", "canary-release", "monitoring", "telemetry", "observability", "release", "cluster"]
key_concepts = ["environment parity", "release management", "configuration injection", "health checks", "deployment strategies", "rollback procedures"]
use_cases = ["application deployment", "traffic management", "incident response", "capacity planning"]
prerequisites = ["ci-cd", "docker", "release"]
version = "1.0.0"
schema_type = "DefinedTerm"
date_created = "2026-02-22"
word_count = 1793
date_modified = "2026-02-23"
keywords = ["Production", "Environment", "user-facing", "deployment", "application", "traffic", "glossary", "infrastructure", "Prismatic Platform", "Docker"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Production Environment - Prismatic Platform"
+++

## Definition

A production environment is the deployment context in which an application serves real users, processes real data, and operates under the full weight of actual traffic, security threats, and reliability expectations. Unlike development, staging, or testing environments, the production environment has no safety net: failures affect actual users, data loss is permanent, and performance degradation translates directly to business impact.

In the Elixir/OTP ecosystem, the production environment is where the BEAM VM's design philosophy proves its value. Hot code upgrades, supervision trees, graceful degradation, and distributed clustering -- capabilities that are theoretical in development -- become critical operational tools in production. The production environment is not just a place where code runs; it is where the system's true reliability, performance, and resilience characteristics are tested every second by real-world conditions.

The Prismatic Platform runs its production environment on Fly.io at `prismatic-prod.fly.dev`, with a staging mirror at `prismatic-staging.fly.dev`. The platform's 115 umbrella applications are compiled into an OTP release, packaged in a Docker container, and deployed through a GitLab CI/CD pipeline with automated quality gates that enforce zero-warning compilation, comprehensive test coverage, and sub-250ms page load times.

## Overview

The production environment sits at the apex of the deployment pipeline. Code flows from developer machines through version control, continuous integration, automated testing, and staging validation before reaching production. Each stage adds confidence that the code will behave correctly under real conditions, but production remains the ultimate proving ground.

An Elixir production environment differs from those of most programming languages in several important ways. The BEAM VM provides built-in support for clustering (connecting multiple nodes into a single distributed system), hot code reloading (updating running code without stopping the application), and introspection (observing internal state of running processes). These capabilities reduce the operational gap between what the system can do in theory and what operators can do in practice.

Configuration in production must be injected at runtime, not compiled in at build time. Elixir's `config/runtime.exs` file runs at application startup and reads environment variables, secrets, and service discovery endpoints. This separation ensures that the same compiled release artifact can be deployed to staging, production, and disaster recovery environments without recompilation.

The Prismatic Platform enforces strict parity between staging and production to minimize "works in staging, fails in production" scenarios. Both environments use the same Docker image, the same BEAM configuration, and the same infrastructure provider (Fly.io). The only differences are environment-specific secrets, database connection strings, and domain names -- all injected via environment variables.

Production reliability is measured, not assumed. Every response time, every error rate, every resource utilization metric is captured through Telemetry, aggregated in monitoring dashboards, and subject to alerting thresholds. The platform's P0 performance standard requires all pages to load under 250ms and all server-side renders to complete under 100ms.

## Technical Details

### OTP Release Configuration

Elixir applications are deployed to production as OTP releases -- self-contained packages that include the compiled application, the Erlang runtime, and all dependencies:

```elixir
defmodule Prismatic.MixProject do
  use Mix.Project

  def project do
    [
      apps_path: "apps",
      version: "0.1.0",
      start_permanent: Mix.env() == :prod,
      releases: [
        prismatic: [
          applications: [
            prismatic: :permanent,
            prismatic_web: :permanent,
            prismatic_api: :permanent,
            prismatic_agents: :permanent,
            prismatic_storage_ecto: :permanent,
            prismatic_perimeter: :permanent
          ],
          include_executables_for: [:unix],
          steps: [:assemble, :tar]
        ]
      ]
    ]
  end
end
```

### Runtime Configuration

Production configuration reads from environment variables, ensuring the release artifact is environment-agnostic:

```elixir
# config/runtime.exs
import Config

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise "DATABASE_URL environment variable is not set"

  config :prismatic_storage_ecto, PrismaticStorage.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "10")),
    ssl: true,
    ssl_opts: [verify: :verify_peer]

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise "SECRET_KEY_BASE environment variable is not set"

  config :prismatic_web, PrismaticWeb.Endpoint,
    url: [host: System.get_env("PHX_HOST", "prismatic-prod.fly.dev"), port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: String.to_integer(System.get_env("PORT", "4000"))
    ],
    secret_key_base: secret_key_base,
    server: true

  config :prismatic_web, PrismaticWeb.Endpoint,
    check_origin: [
      "https://prismatic-prod.fly.dev",
      "https://prismatic.korczis.com"
    ]
end
```

### Dockerfile for Production

The multi-stage Docker build minimizes image size and attack surface:

```dockerfile
# Stage 1: Build
FROM hexpm/elixir:1.19.0-erlang-27.2-debian-bookworm-20241016-slim AS builder

RUN apt-get update -y && apt-get install -y build-essential git && \
    apt-get clean && rm -f /var/lib/apt/lists/*_*

WORKDIR /app

ENV MIX_ENV=prod

COPY mix.exs mix.lock ./
COPY config config
COPY apps apps

RUN mix deps.get --only prod && \
    mix deps.compile

RUN mix compile --warnings-as-errors && \
    mix release prismatic

# Stage 2: Runtime
FROM debian:bookworm-20241016-slim AS runner

RUN apt-get update -y && \
    apt-get install -y libstdc++6 openssl libncurses5 locales ca-certificates && \
    apt-get clean && rm -f /var/lib/apt/lists/*_*

RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

WORKDIR /app

RUN useradd --create-home --shell /bin/bash app
USER app

COPY --from=builder --chown=app:app /app/_build/prod/rel/prismatic ./

CMD ["bin/prismatic", "start"]
```

### Health Check Endpoint

Production environments require health checks for load balancers and orchestrators:

```elixir
defmodule PrismaticWeb.HealthController do
  use PrismaticWeb, :controller

  @health_check_timeout_ms 5_000

  def index(conn, _params) do
    checks = %{
      database: check_database(),
      ets: check_ets_tables(),
      memory: check_memory(),
      uptime: format_uptime()
    }

    status = if all_healthy?(checks), do: 200, else: 503

    conn
    |> put_status(status)
    |> json(%{status: status_label(status), checks: checks, timestamp: DateTime.utc_now()})
  end

  defp check_database do
    case Ecto.Adapters.SQL.query(PrismaticStorage.Repo, "SELECT 1", [], timeout: @health_check_timeout_ms) do
      {:ok, _} -> %{status: :healthy}
      {:error, reason} -> %{status: :unhealthy, reason: inspect(reason)}
    end
  end

  defp check_ets_tables do
    tables = [:agent_registry, :config_cache, :session_store]
    results = Enum.map(tables, fn table ->
      case :ets.info(table) do
        :undefined -> {table, :missing}
        info -> {table, {:healthy, Keyword.get(info, :size, 0)}}
      end
    end)
    %{status: :healthy, tables: Map.new(results)}
  end

  defp check_memory do
    memory = :erlang.memory()
    total_mb = div(memory[:total], 1_048_576)
    %{status: (if total_mb < 4096, do: :healthy, else: :warning), total_mb: total_mb}
  end

  defp format_uptime do
    {uptime_ms, _} = :erlang.statistics(:wall_clock)
    %{seconds: div(uptime_ms, 1000)}
  end

  defp all_healthy?(checks) do
    Enum.all?(checks, fn {_key, check} ->
      check[:status] == :healthy
    end)
  end

  defp status_label(200), do: "healthy"
  defp status_label(_), do: "unhealthy"
end
```

### Fly.io Deployment Configuration

The Prismatic Platform deploys to Fly.io using a `fly.toml` configuration:

```toml
app = "prismatic-prod"
primary_region = "fra"
kill_signal = "SIGTERM"
kill_timeout = 30

[build]
  dockerfile = "Dockerfile"

[env]
  PHX_HOST = "prismatic-prod.fly.dev"
  MIX_ENV = "prod"
  ERL_AFLAGS = "-proto_dist inet6_tcp"

[http_service]
  internal_port = 4000
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 1

  [http_service.concurrency]
    type = "connections"
    hard_limit = 1000
    soft_limit = 800

[[vm]]
  memory = "1gb"
  cpu_kind = "shared"
  cpus = 1
```

## Implementation

### Deployment Pipeline

A production deployment follows a strict sequence of validation gates:

**Stage 1: Quality Gates (CI)**

The GitLab CI pipeline runs all quality checks before any deployment is permitted:

1. `mix compile --warnings-as-errors` -- zero compilation warnings
2. `mix credo --strict` -- static analysis passes
3. `mix dialyzer` -- type checking passes
4. `mix test --cover` -- all tests pass with coverage thresholds
5. `mix quality.gates` -- platform-specific quality checks
6. `mix quality.forbidden_patterns` -- no stubs, mocks, or placeholders

**Stage 2: Staging Deployment**

The validated release is deployed to `prismatic-staging.fly.dev` for integration testing against a production-like environment.

**Stage 3: Production Deployment**

After staging verification, the same Docker image is deployed to production:

```bash
# Deploy to production (executed by CI/CD, not manually)
fly deploy --app prismatic-prod --image registry.fly.io/prismatic-prod:$SHA

# Verify health after deployment
fly status --app prismatic-prod
fly logs --app prismatic-prod --instance latest
```

**Stage 4: Post-Deployment Verification**

Automated smoke tests run against the production endpoint to verify core functionality.

### Rollback Procedure

If a deployment introduces a critical issue, rollback is immediate:

```bash
# List recent deployments
fly releases --app prismatic-prod

# Roll back to previous release
fly deploy --app prismatic-prod --image registry.fly.io/prismatic-prod:$PREVIOUS_SHA
```

### Environment Isolation

Production secrets are managed through Fly.io's secret store, never committed to version control:

```bash
# Set production secrets (one-time setup)
fly secrets set DATABASE_URL="postgresql://..." --app prismatic-prod
fly secrets set SECRET_KEY_BASE="..." --app prismatic-prod
fly secrets set MEILISEARCH_URL="..." --app prismatic-prod

# List configured secrets (values are never displayed)
fly secrets list --app prismatic-prod
```

## Comparison

### Production vs. Staging vs. Development

| Aspect | Development | Staging | Production |
|--------|------------|---------|------------|
| Data | Seed/mock data | Anonymized copy | Real user data |
| Traffic | Single developer | QA team | Public users |
| Uptime requirement | None | Best effort | SLA-bound |
| Error tolerance | High (debugging) | Low (testing) | Zero (business impact) |
| Configuration | Hardcoded/local | Env vars | Secrets manager |
| Monitoring | Optional | Active | Mandatory + alerting |
| Deployment | Manual (mix phx.server) | Automated | Automated + gated |
| Rollback | Not applicable | Quick | Instant |
| SSL/TLS | Optional | Required | Required + HSTS |
| Logging level | Debug | Info | Warning + structured |

### Fly.io vs. Kubernetes vs. Bare Metal

| Aspect | Fly.io | Kubernetes | Bare Metal |
|--------|--------|-----------|------------|
| Operational overhead | Low | High | Very high |
| BEAM clustering | Built-in DNS | Service mesh required | Manual configuration |
| Cost at scale | Moderate | Variable | Lowest |
| Deployment speed | Seconds | Minutes | Minutes to hours |
| Auto-scaling | Native | Configured | Manual |
| Global distribution | Built-in edge | Multi-cluster required | CDN layer required |

### OTP Release vs. Docker-Only

Elixir's OTP release system provides capabilities that Docker alone cannot match: hot code upgrades within a running VM, remote console access to inspect live state, and built-in clustering. Docker provides infrastructure-level isolation, reproducibility, and compatibility with cloud orchestrators. The Prismatic Platform combines both: an OTP release packaged inside a Docker container, gaining the benefits of both approaches.

## Best Practices

1. **Compile with `--warnings-as-errors` in CI.** Warnings in development become bugs in production. The CI pipeline must enforce zero warnings as a hard gate before any deployment.

2. **Use runtime configuration exclusively.** Never embed environment-specific values (database URLs, API keys, domain names) at compile time. Use `config/runtime.exs` and environment variables to ensure release portability.

3. **Implement structured logging.** Production logs must be machine-parseable (JSON format) and include correlation IDs for request tracing. Human-readable logs are for development only.

4. **Set up health checks with depth.** A health check that returns 200 without verifying database connectivity is worse than no health check at all -- it masks outages from the load balancer. Check all critical dependencies.

5. **Monitor the Four Golden Signals.** Track latency (request duration distribution), traffic (requests per second), errors (error rate), and saturation (resource utilization) for every production service.

6. **Deploy the same artifact everywhere.** The Docker image deployed to staging must be byte-identical to the one deployed to production. Rebuilding for production introduces "works on staging" risk.

7. **Automate rollbacks.** Manual rollback procedures are too slow for production incidents. One command (or better, automated detection + rollback) should restore the previous known-good release.

8. **Use connection pooling aggressively.** Production databases enforce connection limits. Configure Ecto's pool size to stay within limits under peak load, and use PgBouncer for additional pooling if needed.

9. **Enable BEAM observer access.** In production, the ability to connect a remote IEx console or Observer to a running node is invaluable for diagnosing issues that monitoring dashboards cannot explain. Secure this access with SSH tunnels and authentication.

10. **Test in production-like conditions.** Load testing against staging with production-scale data and traffic patterns catches performance issues that unit tests cannot reveal.

## Pitfalls

**Configuration drift between environments.** When staging and production configurations diverge (different pool sizes, different timeouts, different feature flags), bugs that appear in one environment cannot be reproduced in the other. Maintain strict parity through infrastructure-as-code and environment variable templates.

**Secret exposure through logs or errors.** Database connection strings, API keys, and authentication tokens can leak into error messages, stack traces, and log output. Use structured logging with explicit field whitelists and sanitize error tuples before logging.

**Insufficient database connection management.** Elixir's concurrency model can easily exhaust a database's connection limit. Each Ecto repo in each application in the umbrella maintains its own connection pool. With 115 applications, even a pool_size of 2 means 230 connections. Plan pool sizes carefully and use connection poolers like PgBouncer.

**Missing graceful shutdown.** When Fly.io sends SIGTERM to stop a machine, the application has a limited window (kill_timeout) to finish in-flight requests and close connections. Without proper shutdown handling in the Phoenix endpoint and supervised processes, requests are dropped and connections leak.

**Ignoring BEAM VM flags.** Production BEAM VMs benefit from specific flags: `+sbwt none` to reduce CPU usage when idle, `+stbt ts` for scheduling, and appropriate `+MBas` / `+MBbas` allocator settings. Defaults work for development but may not be optimal for production workloads.

## Use Cases

### Multi-Region Elixir Deployment

An Elixir application deployed to Fly.io's `fra` (Frankfurt) and `iad` (Virginia) regions uses `libcluster` to form a distributed Erlang cluster across regions. The production environment handles automatic failover: if the Frankfurt region experiences an outage, traffic is routed to Virginia, where the clustered BEAM nodes have replicated critical state through distributed ETS or CRDT-based synchronization.

### Zero-Downtime Deployments

The Prismatic Platform uses rolling deployments where new machines are started with the updated release before old machines are drained and stopped. Fly.io's built-in load balancer shifts traffic to healthy new machines as they pass health checks, ensuring that users never experience downtime during deployment. OTP's graceful shutdown ensures in-flight requests complete before the old machine terminates.

### Production Observability Stack

A complete production observability setup integrates Telemetry events, Prometheus metrics export, and Grafana dashboards. Every Phoenix request, every Ecto query, every GenServer call emits telemetry events that are aggregated into histograms and counters. Alerting rules trigger PagerDuty notifications when error rates exceed thresholds or latency P95 breaches the 250ms limit.

### Incident Response with Remote Console

When a production issue defies dashboard analysis, an engineer connects a remote IEx console to the running production node through a secure tunnel. Using Observer and process introspection, they identify a GenServer with a growing mailbox (indicating backpressure), trace the source of the messages, and apply a targeted fix. This level of production introspection is unique to the BEAM ecosystem.

## Related Concepts

Production environment intersects with deployment, infrastructure, and operational concerns across the platform:

- [Fly.io](@/glossary/fly-io.md) -- the cloud platform hosting the Prismatic Platform's production and staging environments
- [Docker](@/glossary/docker.md) -- containerization technology used to package OTP releases for reproducible production deployment
- [CI/CD](@/glossary/ci-cd.md) -- the automated pipeline that validates, builds, and deploys code to the production environment
- [Blue-Green Deployment](@/glossary/blue-green-deployment.md) -- deployment strategy that maintains two identical production environments for instant rollback
- [Canary Release](@/glossary/canary-release.md) -- gradual rollout strategy that routes a small percentage of production traffic to new releases
- [Monitoring](@/glossary/monitoring.md) -- continuous observation of production health through metrics, logs, and traces
- [Telemetry](@/glossary/telemetry.md) -- Elixir's instrumentation library for emitting and consuming production metrics
- [Observability](@/glossary/observability.md) -- the ability to understand production system state from external outputs
- [Release](@/glossary/release.md) -- OTP release packaging that creates self-contained deployable artifacts for production
- [Cluster](@/glossary/cluster.md) -- distributed BEAM node topology used in multi-region production deployments

## See Also

- [Supervision Tree](@/glossary/supervision-tree.md) -- the OTP structure that provides automatic recovery in production
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- system property that ensures production services survive component failures
- [Load Balancing](@/glossary/load-balancing.md) -- traffic distribution across production instances for performance and availability
- [Incident Response](@/glossary/incident-response.md) -- procedures for diagnosing and resolving production issues
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- pattern for protecting production services from cascading failures

---

*Built with precision by the Prismatic Platform team. This glossary entry is part of a living knowledge base that evolves with the platform.*

**[Prismatic Platform](https://github.com/korczis/prismatic-platform)** | Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [LinkedIn](https://linkedin.com/in/korczis)
