+++
title = "Blue-Green Deployment"
weight = 53
[extra]
category = "architecture"
description = "Zero-downtime deployment strategy using two identical production environments with atomic traffic switching"
related_terms = ["continuous-deployment", "canary-release", "feature-flag", "fly-io", "load-balancing", "docker", "release"]
tags = ["deployment", "devops", "zero-downtime", "infrastructure", "continuous-delivery", "resilience"]
difficulty = "intermediate"
importance = "high"
ecosystem = "infrastructure"
use_cases = ["zero-downtime-deployment", "instant-rollback", "production-validation", "release-management"]
prerequisites = ["docker", "continuous-deployment"]
reading_time_minutes = 13
version = "2.0.0"
last_updated = "2026-02-22"
author = "Tomas Korcak"
platform_relevance = "high"
beam_specific = false
otp_pattern = false
production_tested = true
prismatic_usage = "active"
deployment_target = "fly-io"
rollback_time = "seconds"
coined_by = "Martin Fowler"
reading_time = "6 min"
word_count = 1193
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Blue-Green", "Deployment", "Zero-downtime", "glossary", "architecture", "Prismatic Platform", "Blue", "Green", "LIVE"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Blue-Green Deployment - Prismatic Platform"
+++

## Definition and Overview

Blue-green deployment is a release strategy that maintains two identical production environments: "blue" (current live) and "green" (new version). Traffic is switched from blue to green atomically once the new version is validated, achieving zero-downtime deployments. If the green environment exhibits problems, traffic is instantly switched back to blue, providing an immediate rollback capability without redeployment.

The technique was popularized by Martin Fowler and Jez Humble in the context of continuous delivery, though its conceptual roots trace back to mainframe-era system cutover procedures. The key insight is that by maintaining two complete, independent environments, the deployment risk is decoupled from the deployment action itself. Validation happens before traffic switches, and rollback is a configuration change rather than a redeployment.

Blue-green deployment addresses the fundamental tension in software releases: the desire to ship quickly versus the need to ship safely. By separating the "deploy" action (installing new code) from the "release" action (routing user traffic), teams can deploy new versions at any time, validate them thoroughly, and release them to users only when confidence is established. This separation of concerns is a cornerstone of modern deployment practice.

The strategy is particularly valuable for systems where downtime has significant business impact. E-commerce platforms, financial services, healthcare systems, and security intelligence platforms -- like the Prismatic Platform -- cannot afford deployment windows or failed rollbacks. Blue-green deployment transforms releases from high-anxiety events requiring change management approvals into routine operations that happen multiple times per day.

## Technical Deep Dive

### Environment Architecture

A blue-green deployment requires two complete, identical production environments:

```
                     Load Balancer / Edge Router
                            |
              +-------------+-------------+
              |                           |
        Blue Environment            Green Environment
        (Current Live)              (New Version)
              |                           |
        +-----+-----+              +-----+-----+
        | App Server |              | App Server |
        | App Server |              | App Server |
        | Database   |              | Database   |
        +-----+-----+              +-----+-----+
```

### Deployment Phases

| Phase | Action | State | Duration |
|-------|--------|-------|----------|
| 1. Idle | Both environments running, blue serves traffic | Blue: LIVE, Green: STANDBY | Continuous |
| 2. Deploy | New version deployed to green environment | Blue: LIVE, Green: DEPLOYING | 1-10 minutes |
| 3. Validate | Health checks, smoke tests, integration tests on green | Blue: LIVE, Green: VALIDATING | 1-5 minutes |
| 4. Switch | Load balancer routes all traffic to green | Blue: STANDBY, Green: LIVE | Milliseconds-seconds |
| 5. Monitor | Observe green under production traffic | Blue: STANDBY (rollback ready), Green: LIVE | 15-60 minutes |
| 6. Retire | Blue updated or held for next deployment cycle | Blue: STANDBY, Green: LIVE | Until next deploy |

### Database Considerations

The most challenging aspect of blue-green deployment is database management, as both environments typically share a database:

| Strategy | Description | Trade-off |
|----------|-------------|-----------|
| Shared Database | Both environments use the same database | Schema migrations must be backward-compatible |
| Separate Databases | Each environment has its own database | Requires data synchronization during switchover |
| Feature Flags | Database schema changes gated by flags | More complex application logic |
| Expand-Contract | Add new schema, migrate data, remove old schema | Requires multiple deployment cycles |

For shared databases, the expand-contract pattern is recommended:

1. **Expand**: Add new columns/tables without removing old ones
2. **Migrate**: Application code writes to both old and new schema
3. **Contract**: Remove old columns/tables after full cutover

### Expand-Contract Migration Example

```elixir
defmodule PrismaticStorage.Migrations.ExpandAssetSchema do
  @moduledoc """
  Phase 1 (Expand): Add new columns without removing old ones.
  Both blue and green environments can work with this schema.
  """

  use Ecto.Migration

  def up do
    # Add new column alongside existing one
    alter table(:assets) do
      add :risk_score_v2, :float
      add :scoring_version, :integer, default: 1
    end

    # Create index for new column
    create index(:assets, [:risk_score_v2])

    # Backfill new column from old data
    execute """
    UPDATE assets
    SET risk_score_v2 = risk_score,
        scoring_version = 1
    """
  end

  def down do
    alter table(:assets) do
      remove :risk_score_v2
      remove :scoring_version
    end
  end
end

defmodule PrismaticStorage.Migrations.ContractAssetSchema do
  @moduledoc """
  Phase 3 (Contract): Remove old columns after all environments
  have been updated to use the new schema.
  Only run AFTER blue-green switch is confirmed stable.
  """

  use Ecto.Migration

  def up do
    alter table(:assets) do
      remove :risk_score  # Old column no longer needed
    end

    rename table(:assets), :risk_score_v2, to: :risk_score
  end

  def down do
    alter table(:assets) do
      add :risk_score, :float
    end
  end
end
```

### Traffic Switching Mechanisms

| Mechanism | Granularity | Switchover Time | Rollback Time | Complexity |
|-----------|------------|-----------------|---------------|------------|
| DNS Switch | Domain level | Minutes (TTL dependent) | Minutes | Low |
| Load Balancer | Request level | Seconds | Seconds | Medium |
| Edge Router | Request level | Milliseconds | Milliseconds | Medium |
| Service Mesh | Request level | Milliseconds | Milliseconds | High |
| Fly.io Machines | Request level | Seconds | Seconds | Low (managed) |

### Comparison with Other Strategies

| Feature | Blue-Green | Canary | Rolling Update | Feature Flags | Hot Code Reload |
|---------|-----------|--------|---------------|---------------|-----------------|
| Rollback speed | Instant | Fast | Slow | Instant | N/A |
| Resource cost | 2x infrastructure | 1x + canary | 1x | 1x | 1x |
| Blast radius | All or nothing | Small percentage | Gradual | Per-feature | All |
| Database handling | Complex | Complex | Simple | N/A | N/A |
| Validation window | Pre-switch | During rollout | During rollout | Continuous | N/A |
| BEAM support | Standard | Standard | Standard | Standard | Native |

## Architecture and Implementation

### Load Balancer Configuration

A typical NGINX configuration for blue-green switching:

```nginx
upstream blue {
    server blue-app-1:4000;
    server blue-app-2:4000;
}

upstream green {
    server green-app-1:4000;
    server green-app-2:4000;
}

# Switch between environments by changing this include
# include /etc/nginx/active-blue.conf;
include /etc/nginx/active-green.conf;
```

### Health Check Protocol

Before switching traffic, the green environment must pass comprehensive health checks:

```elixir
defmodule PrismaticWeb.DeploymentHealthCheck do
  @moduledoc """
  Comprehensive health check module for blue-green deployment validation.
  All checks must pass before traffic is switched to the new environment.
  """

  @checks [
    :http_endpoint,
    :database_connectivity,
    :cache_connectivity,
    :external_api_connectivity,
    :application_boot_complete,
    :metrics_reporting,
    :websocket_connectivity,
    :pubsub_connectivity
  ]

  @spec validate_environment(String.t()) :: :pass | {:fail, [atom()]}
  def validate_environment(env_url) do
    results = Enum.map(@checks, fn check ->
      {check, run_check(check, env_url)}
    end)

    failures = Enum.filter(results, fn {_, result} -> result != :ok end)

    case failures do
      [] -> :pass
      failed -> {:fail, Enum.map(failed, &elem(&1, 0))}
    end
  end

  @spec run_check(atom(), String.t()) :: :ok | {:error, term()}
  defp run_check(:http_endpoint, url) do
    case Req.get("#{url}/health", receive_timeout: 5_000) do
      {:ok, %{status: 200}} -> :ok
      {:ok, %{status: status}} -> {:error, "Unexpected status: #{status}"}
      {:error, reason} -> {:error, reason}
    end
  end

  defp run_check(:database_connectivity, url) do
    case Req.get("#{url}/health/db", receive_timeout: 10_000) do
      {:ok, %{status: 200}} -> :ok
      other -> {:error, "Database check failed: #{inspect(other)}"}
    end
  end

  defp run_check(:application_boot_complete, url) do
    case Req.get("#{url}/health/ready", receive_timeout: 30_000) do
      {:ok, %{status: 200}} -> :ok
      other -> {:error, "Boot check failed: #{inspect(other)}"}
    end
  end

  defp run_check(check, url) do
    case Req.get("#{url}/health/#{check}", receive_timeout: 10_000) do
      {:ok, %{status: 200}} -> :ok
      other -> {:error, "#{check} check failed: #{inspect(other)}"}
    end
  end
end
```

### Automated Switchover Script

```bash
#!/bin/bash
# blue-green-switch.sh - Atomic environment switchover

set -euo pipefail

CURRENT=$(curl -s http://lb/active-environment)
TARGET=$(if [ "$CURRENT" = "blue" ]; then echo "green"; else echo "blue"; fi)

echo "Switching from $CURRENT to $TARGET"

# Phase 1: Validate target environment
echo "Phase 1: Validating $TARGET environment..."
if ! curl -sf "http://${TARGET}-app:4000/health" > /dev/null; then
  echo "ERROR: Target environment $TARGET is not healthy"
  exit 1
fi

# Phase 2: Run smoke tests against target
echo "Phase 2: Running smoke tests..."
if ! ./scripts/smoke-test.sh "http://${TARGET}-app:4000"; then
  echo "ERROR: Smoke tests failed on $TARGET"
  exit 1
fi

# Phase 3: Switch traffic
echo "Phase 3: Switching traffic..."
curl -X POST "http://lb/api/switch" -d "target=$TARGET"

# Phase 4: Verify switchover
sleep 5
NEW_ACTIVE=$(curl -s http://lb/active-environment)
if [ "$NEW_ACTIVE" = "$TARGET" ]; then
  echo "Successfully switched to $TARGET"
else
  echo "ERROR: Switch verification failed"
  exit 1
fi

# Phase 5: Monitor for 60 seconds
echo "Phase 5: Monitoring for 60 seconds..."
for i in $(seq 1 12); do
  ERROR_RATE=$(curl -s "http://lb/metrics/error-rate")
  if [ "$(echo "$ERROR_RATE > 0.01" | bc)" -eq 1 ]; then
    echo "ERROR: Error rate too high ($ERROR_RATE), rolling back..."
    curl -X POST "http://lb/api/switch" -d "target=$CURRENT"
    exit 1
  fi
  sleep 5
done

echo "Deployment complete. $TARGET is now live."
```

## Usage in Prismatic Platform

The Prismatic Platform leverages Fly.io's deployment infrastructure for blue-green style releases. Fly.io provides built-in support for zero-downtime deployments through its machine management system.

### Fly.io Deployment Model

```toml
# fly.toml
[deploy]
  strategy = "bluegreen"
  wait_timeout = "5m"

[checks]
  [checks.health]
    type = "http"
    port = 4000
    path = "/health"
    interval = "10s"
    timeout = "2s"
    grace_period = "30s"

  [checks.ready]
    type = "http"
    port = 4000
    path = "/health/ready"
    interval = "15s"
    timeout = "5s"
    grace_period = "60s"
```

### Deployment Pipeline

The platform's GitLab CI/CD pipeline implements blue-green deployment:

```
Commit -> CI Pipeline -> Build Docker Image -> Deploy to Staging -> Validate
                                                                      |
                                                               Pass? --+-- Yes -> Deploy to Prod (Green)
                                                                       |          -> Health Check
                                                                       |          -> Switch Traffic
                                                                       |          -> Monitor (15 min)
                                                                       +-- No  -> Block + Alert
```

### BEAM-Specific Considerations

The [BEAM](/glossary/beam/) VM provides additional deployment capabilities that complement blue-green deployment:

| BEAM Feature | Benefit | Use Case |
|-------------|---------|----------|
| Hot Code Reload | Enables in-place code updates for minor changes without environment switching | Bug fixes, config changes |
| Graceful Drain | Connected [WebSocket](/glossary/websocket/)/[LiveView](/glossary/liveview/) clients are gracefully migrated | Real-time dashboards |
| Distribution | Nodes can join and leave clusters without downtime | Scaling, maintenance |
| Application Restart | Individual OTP applications can restart without affecting others | Targeted recovery |
| Rolling Restart | Within a cluster, nodes can restart one at a time | Zero-impact maintenance |

```elixir
# BEAM-aware health check for blue-green validation
defmodule PrismaticWeb.HealthController do
  @moduledoc """
  Health endpoint for blue-green deployment validation.
  Checks database connectivity, application status, BEAM VM health,
  and cluster membership before reporting ready status.
  """

  use PrismaticWeb, :controller

  @spec index(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def index(conn, _params) do
    checks = %{
      database: check_repo(),
      applications: check_applications(),
      memory: check_memory(),
      schedulers: check_schedulers(),
      connected_nodes: Node.list() |> length(),
      uptime_seconds: :erlang.statistics(:wall_clock) |> elem(0) |> div(1000)
    }

    status = if Enum.all?(Map.values(checks), &healthy?/1), do: 200, else: 503
    json(conn, %{status: status_text(status), checks: checks})
  end

  @spec ready(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def ready(conn, _params) do
    # Ready check includes more thorough validation
    with :ok <- check_database_pool(),
         :ok <- check_ets_tables(),
         :ok <- check_pubsub() do
      json(conn, %{status: "ready", timestamp: DateTime.utc_now()})
    else
      {:error, reason} ->
        conn
        |> put_status(503)
        |> json(%{status: "not_ready", reason: inspect(reason)})
    end
  end

  defp check_repo do
    case Ecto.Adapters.SQL.query(Prismatic.Repo, "SELECT 1") do
      {:ok, _} -> :healthy
      _ -> :unhealthy
    end
  end

  defp check_applications do
    required = [:prismatic, :prismatic_web, :prismatic_storage_core]
    running = Application.started_applications() |> Enum.map(&elem(&1, 0))
    if Enum.all?(required, &(&1 in running)), do: :healthy, else: :unhealthy
  end

  defp check_memory do
    total = :erlang.memory(:total)
    if total < 2_000_000_000, do: :healthy, else: :warning
  end

  defp check_schedulers do
    online = :erlang.system_info(:schedulers_online)
    if online >= 2, do: :healthy, else: :warning
  end

  defp check_database_pool do
    case Ecto.Adapters.SQL.query(Prismatic.Repo, "SELECT 1") do
      {:ok, _} -> :ok
      error -> {:error, error}
    end
  end

  defp check_ets_tables do
    # Verify critical ETS tables exist
    tables = [:ets.info(table) || nil for table <- [:prismatic_cache, :prismatic_registry]]
    if Enum.all?(tables, &(&1 != nil)), do: :ok, else: {:error, :missing_ets_tables}
  end

  defp check_pubsub do
    # Verify PubSub is operational
    case Phoenix.PubSub.broadcast(PrismaticPubSub, "health:check", :ping) do
      :ok -> :ok
      error -> {:error, error}
    end
  end

  defp healthy?(:healthy), do: true
  defp healthy?(:warning), do: true
  defp healthy?(n) when is_integer(n), do: true
  defp healthy?(_), do: false

  defp status_text(200), do: "healthy"
  defp status_text(_), do: "unhealthy"
end
```

## LiveView Connection Handling

Blue-green deployments require special attention for [LiveView](/glossary/liveview/) and [WebSocket](/glossary/websocket/) connections, which are long-lived and stateful:

```elixir
defmodule PrismaticWeb.DeploymentDrainHandler do
  @moduledoc """
  Handles graceful draining of LiveView connections during blue-green
  deployment switches. Ensures users see a smooth transition rather
  than abrupt disconnections.
  """

  @spec drain_connections(integer()) :: :ok
  def drain_connections(timeout_ms \\ 30_000) do
    # Notify all connected LiveViews about pending deployment
    Phoenix.PubSub.broadcast(
      PrismaticPubSub,
      "system:deployment",
      {:deployment_pending, timeout_ms}
    )

    # Wait for connections to drain gracefully
    Process.sleep(timeout_ms)
    :ok
  end
end
```

## Docker Multi-Stage Build

The platform uses Docker multi-stage builds optimized for blue-green deployment:

```dockerfile
# Stage 1: Build
FROM elixir:1.19-alpine AS builder
ENV MIX_ENV=prod
WORKDIR /app
COPY mix.exs mix.lock ./
COPY apps/*/mix.exs ./apps/
RUN mix deps.get --only prod && mix deps.compile
COPY . .
RUN mix release prismatic

# Stage 2: Runtime
FROM alpine:3.19
RUN apk add --no-cache libstdc++ openssl ncurses-libs
COPY --from=builder /app/_build/prod/rel/prismatic /app
ENV PORT=4000
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=2s --retries=3 \
  CMD wget -q -O- http://localhost:4000/health || exit 1
CMD ["/app/bin/prismatic", "start"]
```

## Best Practices

1. **Automate everything** -- Manual switchovers introduce human error. Script the entire deploy-validate-switch cycle.

2. **Make migrations backward-compatible** -- Since both environments share a database, schema changes must work with both the old and new application versions. Use the expand-contract pattern.

3. **Monitor after switching** -- The green environment may pass health checks but fail under real traffic patterns. Monitor error rates, latency, and resource usage for at least 15 minutes after switching.

4. **Keep environments truly identical** -- Infrastructure drift between blue and green causes "works in staging, fails in production" scenarios. Use infrastructure-as-code to enforce parity.

5. **Practice rollbacks** -- Regularly test the rollback procedure. A rollback you have never practiced is a rollback that will fail when you need it.

6. **Set a retirement policy** -- Define how long the standby environment is kept before being updated for the next deployment cycle.

7. **Handle long-lived connections** -- [WebSocket](/glossary/websocket/) and [LiveView](/glossary/liveview/) connections need graceful draining during switchover.

8. **Use health check cascades** -- Check not just HTTP endpoints but database connectivity, cache availability, and external service reachability.

## Common Pitfalls

- **Database migration conflicts**: Running destructive migrations (DROP COLUMN) before both environments have been updated. Always use expand-contract.

- **Session stickiness**: Users with active sessions on blue lose their sessions when switched to green. Use external session stores (Redis) shared between environments.

- **DNS TTL delays**: If switching via DNS, cached DNS records delay the switchover for up to the TTL duration. Use edge routers or load balancers for instant switching.

- **Cost**: Maintaining two full production environments doubles infrastructure costs. Optimize by scaling down the standby environment when not actively deploying.

- **Forgotten standby**: The standby environment can fall behind on OS patches, certificate renewals, and dependency updates. Include it in your maintenance schedule.

- **Incomplete health checks**: A health check that only verifies HTTP 200 misses database connectivity issues, missing ETS tables, or failed PubSub connections.

## Related Concepts

- [Continuous Deployment](/glossary/continuous-deployment/) -- Automated pipeline triggering blue-green deployments
- [Canary Release](/glossary/canary-release/) -- Gradual traffic migration alternative to atomic switching
- [Feature Flag](/glossary/feature-flag/) -- Runtime control complementing deployment strategies
- [Load Balancing](/glossary/load-balancing/) -- Traffic routing enabling environment switching
- [Disaster Recovery](/glossary/disaster-recovery/) -- Broader resilience strategy that blue-green supports
- [Docker](/glossary/docker/) -- Container technology used for environment parity
- [Release](/glossary/release/) -- OTP release building for deployment artifacts
- [WebSocket](/glossary/websocket/) -- Long-lived connections requiring graceful handling during switches
- [LiveView](/glossary/liveview/) -- Server-rendered UI with stateful connections affected by deployments

## Further Reading

- [Fly.io Deployment Documentation](https://fly.io/docs/reference/deploy/) -- Platform deployment reference
- [Architecture](/architecture/) -- Deployment architecture
- [Technologies](/technologies/) -- Fly.io deployment infrastructure
- [Apps](/apps/) -- Applications deployed via blue-green strategy

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
