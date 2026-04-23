+++
title = "RTO"
weight = 50

[extra]
description = "Recovery Time Objective -- the maximum acceptable duration of downtime after a failure, defining how quickly a system must be restored to operational status. A critical SLA metric that drives infrastructure investment, automation decisions, and BEAM supervision tree design."
category = "architecture"
domain = "infrastructure"
complexity = "intermediate-advanced"
stability = "stable"
beam_related = true
related_terms = ["rpo", "replication", "rollback", "uptime", "sla", "supervision-tree", "genserver", "health-check", "circuit-breaker", "blue-green-deployment", "chaos-engineering", "failover"]
tags = ["rto", "disaster-recovery", "availability", "downtime", "business-continuity", "sla", "beam", "supervision", "failover", "health-check", "chaos-engineering", "fly-io"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "RTO defines maximum acceptable downtime -- Prismatic Platform achieves process-level near-zero RTO through BEAM's self-healing supervision trees, application-level sub-30s RTO through Fly.io automatic failover, and database-level sub-60s RTO through managed PostgreSQL replication."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["RTO", "Recovery Time Objective", "disaster recovery", "downtime", "glossary", "Prismatic Platform", "BEAM", "OTP", "supervision", "failover", "SLA", "availability", "chaos engineering"]
image = "/images/sections/glossary.png"
image_alt = "RTO - Prismatic Platform"
word_count = 3500
see_also = ["architecture", "capabilities", "infrastructure"]
+++

## Definition

**RTO (Recovery Time Objective)** defines the maximum acceptable duration between a failure event and the restoration of service to operational status. An RTO of 5 minutes means the system must be fully operational within 5 minutes of any failure. An RTO of zero (continuous availability) requires hot standby systems that can assume traffic instantly with no perceptible interruption to users.

RTO is a business-driven metric, not a purely technical one. It translates business risk tolerance into infrastructure requirements. A 4-hour RTO can be met with manual failover procedures, operator runbooks, and backup restoration from snapshots. A 1-minute RTO demands automated failover with pre-provisioned standby systems, health check polling at sub-second intervals, and pre-warmed connection pools. Zero RTO requires active-active multi-region deployment with automatic traffic rerouting, database replication with synchronous commits, and no single point of failure anywhere in the stack.

The BEAM virtual machine provides a unique advantage for RTO at the process level: OTP supervision trees restart crashed processes in microseconds, making individual process failures nearly invisible to the overall system. This built-in fault tolerance means that many classes of failure that would require minutes of recovery time in other runtimes are handled transparently by the BEAM scheduler before any external monitoring system even detects the issue.

## Core Concepts

### Recovery Phase Breakdown

| Phase | Description | Typical Duration | Optimization Strategy |
|-------|-------------|-----------------|----------------------|
| **Detection** | Recognizing that a failure occurred | 1-30 seconds | Automated health checks, heartbeat monitoring |
| **Diagnosis** | Understanding what failed and why | 30s - 5 minutes | Structured logging, distributed tracing, runbooks |
| **Decision** | Choosing the recovery strategy | Seconds (automated) - minutes (manual) | Pre-defined playbooks, automated decision trees |
| **Execution** | Performing the recovery action | Seconds - hours | Automated failover, blue-green deployment |
| **Verification** | Confirming service restoration | 5-30 seconds | Automated smoke tests, health endpoints |

### RTO Tiers in Prismatic Platform

| Service Tier | Target RTO | Mechanism | Examples |
|-------------|-----------|-----------|----------|
| **Process-level** | < 1ms | OTP Supervisor restart | GenServer crash, ETS table owner death |
| **Service-level** | < 5s | Supervisor tree cascade | Entire supervision subtree restart |
| **Application-level** | < 30s | Fly.io container restart | VM crash, OOM kill, health check failure |
| **Database-level** | < 60s | PostgreSQL automatic failover | Primary DB failure, replica promotion |
| **Infrastructure-level** | < 5min | Multi-region failover | Entire region outage, DNS failover |
| **Catastrophic** | < 4hr | Full restore from backup | Data center loss, cascading failure |

### RTO vs. RPO Relationship

| Metric | Measures | Question Answered | Cost Driver |
|--------|----------|-------------------|-------------|
| **RTO** | Time to recovery | "How long can we be down?" | Automation, redundancy, standby capacity |
| **RPO** | Data loss tolerance | "How much data can we lose?" | Replication frequency, backup interval, WAL archiving |
| Combined | Total business impact | "What is the worst-case scenario?" | Both metrics drive independent infrastructure decisions |

### Availability Targets and Implied RTO

| Availability | Annual Downtime | Monthly Downtime | Implied Max RTO per Incident |
|-------------|-----------------|------------------|------------------------------|
| 99% | 3.65 days | 7.3 hours | Hours |
| 99.9% | 8.76 hours | 43.8 minutes | Minutes |
| 99.95% | 4.38 hours | 21.9 minutes | Minutes |
| 99.99% | 52.6 minutes | 4.38 minutes | Seconds |
| 99.999% | 5.26 minutes | 26.3 seconds | Sub-second |

## Technical Deep Dive

### BEAM Process-Level Recovery

The BEAM virtual machine provides process-level RTO measured in microseconds through OTP supervision trees. When a process crashes (throws an exception, receives a kill signal, or fails a health check), its supervisor detects the exit signal and restarts the process according to its configured strategy:

- **`:one_for_one`** -- restart only the failed child; other children are unaffected. This is the default and most common strategy, used when children are independent.
- **`:one_for_all`** -- restart all children when any child fails. Used when children are interdependent and partial state is inconsistent.
- **`:rest_for_one`** -- restart the failed child and all children started after it. Used for ordered dependency chains.

The supervisor's `max_restarts` and `max_seconds` configuration (restart intensity) prevents crash loops: if a child restarts more than `max_restarts` times within `max_seconds`, the supervisor itself terminates, escalating to its parent supervisor. This creates a cascading recovery mechanism -- local failures are handled locally, but persistent failures escalate up the supervision tree until they reach a level that can resolve the root cause (often by restarting a broader scope of the system).

### Application-Level Recovery on Fly.io

Fly.io performs health checks against the application's health endpoint (typically `/api/v1/health` or `/up`). The health check configuration specifies:

- **Interval**: How often to check (default 10 seconds)
- **Timeout**: How long to wait for a response (default 2 seconds)
- **Grace period**: How long to wait after deployment before checking (default 30 seconds)
- **Unhealthy threshold**: How many consecutive failures before marking unhealthy (default 3)

When a machine becomes unhealthy, Fly.io stops routing traffic to it and starts a replacement. For the Prismatic Platform, the total application-level RTO breaks down as: health check failure detection (~10s with default interval), traffic rerouting (~1s), new machine start (~15s), readiness verification (~5s) = approximately 30 seconds.

### Database-Level Recovery

PostgreSQL replication on Fly.io uses streaming replication with automatic failover. The primary database streams WAL records to one or more replicas. When the primary becomes unavailable:

1. The replication manager detects the primary is down (typically within 10-30 seconds)
2. A replica is promoted to primary (near-instant once the decision is made)
3. The application's connection string is updated to point to the new primary
4. Existing connections are terminated and must reconnect

The total database-level RTO is typically under 60 seconds. The RPO depends on the replication mode: synchronous replication guarantees zero data loss (RPO = 0) at the cost of write latency; asynchronous replication may lose the last few seconds of commits (RPO = seconds).

### Measuring Actual RTO

RTO is a target; actual recovery time (ART) is what happens in practice. The gap between target and actual reveals operational maturity. Measuring ART requires:

1. **Failure timestamp**: When the failure was detected (not when it occurred -- the difference is detection latency)
2. **Recovery timestamp**: When the service was verified healthy (not when recovery was initiated)
3. **Impact scope**: How many users/requests were affected during the outage

The Prismatic Platform tracks these metrics through the `RecoveryMonitor` GenServer, which records failure and recovery events and calculates rolling RTO compliance statistics.

## Usage in Prismatic Platform

The platform achieves process-level near-zero RTO through OTP supervision. When a GenServer crashes (ToolRegistry, TopicRegistry, SourceRegistry, ScoringEngine, HypothesisEngine), its supervisor restarts it within milliseconds. The supervisor's restart intensity configuration ensures rapid recovery while preventing crash loops -- typically configured for 3 restarts in 5 seconds before escalation.

Application-level RTO on Fly.io is typically under 30 seconds: health check failure detection (10s), container replacement (15s), and readiness verification (5s). The `/api/v1/health` endpoint verifies database connectivity, ETS table availability, and critical GenServer responsiveness -- ensuring the health check truly reflects the application's ability to serve requests.

Database failover RTO is under 60 seconds with Fly.io's managed PostgreSQL. The platform's Ecto pool configuration includes `queue_target: 50` and `queue_interval: 1000` to quickly surface connection issues rather than silently queuing requests during a failover.

The DD investigation pipeline has specific RTO requirements: active DD case data must be recoverable within 5 minutes (from PostgreSQL replication), while historical analysis data has a relaxed 4-hour RTO (from nightly backups). This tiered approach balances cost against business impact.

## Code Examples

```elixir
defmodule PrismaticInfra.RecoveryMonitor do
  @moduledoc """
  Monitors recovery time metrics for RTO compliance verification.

  Tracks failure and recovery events for all monitored components,
  calculates actual recovery times, and alerts when RTO targets
  are exceeded. Maintains a rolling window of the last 1000 recovery
  events for trend analysis.

  ## Architecture

  Runs as a GenServer under the infrastructure supervision tree.
  Receives failure/recovery events via cast messages and stores
  them in process state. Periodically publishes RTO compliance
  metrics via PubSub for dashboard consumption.
  """

  use GenServer

  require Logger

  @type component :: String.t()
  @type recovery_record :: {component(), non_neg_integer(), DateTime.t()}

  @max_history 1000

  @doc """
  Starts the recovery monitor.

  ## Examples

      iex> RecoveryMonitor.start_link([])
      {:ok, pid}
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Records a component failure event.

  Timestamps the failure for later RTO calculation when
  the corresponding recovery event arrives.

  ## Examples

      iex> RecoveryMonitor.record_failure("tool_registry")
      :ok
  """
  @spec record_failure(component()) :: :ok
  def record_failure(component) do
    GenServer.cast(__MODULE__, {:failure, component, System.monotonic_time(:millisecond)})
  end

  @doc """
  Records a component recovery event.

  Calculates the actual recovery time (ART) by comparing
  against the stored failure timestamp. Logs the recovery
  duration and stores it in the rolling history.

  ## Examples

      iex> RecoveryMonitor.record_recovery("tool_registry")
      :ok
  """
  @spec record_recovery(component()) :: :ok
  def record_recovery(component) do
    GenServer.cast(__MODULE__, {:recovery, component, System.monotonic_time(:millisecond)})
  end

  @doc """
  Returns the current RTO compliance summary.

  Includes average recovery time, worst-case recovery time,
  and compliance percentage against the target RTO.

  ## Examples

      iex> RecoveryMonitor.compliance_summary(30_000)
      %{avg_rto_ms: 450, max_rto_ms: 2100, compliance_pct: 100.0}
  """
  @spec compliance_summary(non_neg_integer()) :: map()
  def compliance_summary(target_rto_ms) do
    GenServer.call(__MODULE__, {:compliance_summary, target_rto_ms})
  end

  @impl true
  def init(_opts) do
    state = %{
      failures: %{},
      recovery_times: [],
      total_failures: 0,
      total_recoveries: 0
    }

    {:ok, state}
  end

  @impl true
  def handle_cast({:failure, component, time}, state) do
    Logger.info("Component failure detected",
      component: component,
      monotonic_time: time
    )

    updated_state = %{
      state
      | failures: Map.put(state.failures, component, time),
        total_failures: state.total_failures + 1
    }

    {:noreply, updated_state}
  end

  @impl true
  def handle_cast({:recovery, component, time}, state) do
    case Map.get(state.failures, component) do
      nil ->
        Logger.debug("Recovery event without matching failure",
          component: component
        )

        {:noreply, state}

      failure_time ->
        rto_ms = time - failure_time

        Logger.info("Component recovered",
          component: component,
          recovery_time_ms: rto_ms
        )

        broadcast_recovery(component, rto_ms)

        failures = Map.delete(state.failures, component)

        recovery_times =
          [{component, rto_ms, DateTime.utc_now()} | state.recovery_times]
          |> Enum.take(@max_history)

        updated_state = %{
          state
          | failures: failures,
            recovery_times: recovery_times,
            total_recoveries: state.total_recoveries + 1
        }

        {:noreply, updated_state}
    end
  end

  @impl true
  def handle_call({:compliance_summary, target_rto_ms}, _from, state) do
    times = Enum.map(state.recovery_times, fn {_comp, ms, _ts} -> ms end)

    summary =
      if times == [] do
        %{avg_rto_ms: 0, max_rto_ms: 0, compliance_pct: 100.0, sample_count: 0}
      else
        compliant = Enum.count(times, &(&1 <= target_rto_ms))

        %{
          avg_rto_ms: div(Enum.sum(times), length(times)),
          max_rto_ms: Enum.max(times),
          min_rto_ms: Enum.min(times),
          compliance_pct: Float.round(compliant / length(times) * 100, 1),
          sample_count: length(times),
          target_rto_ms: target_rto_ms
        }
      end

    {:reply, summary, state}
  end

  @spec broadcast_recovery(component(), non_neg_integer()) :: :ok
  defp broadcast_recovery(component, rto_ms) do
    Phoenix.PubSub.broadcast(
      PrismaticWeb.PubSub,
      "system:recovery",
      {:component_recovered, component, rto_ms}
    )
  end
end
```

```elixir
defmodule PrismaticInfra.SupervisorRTO do
  @moduledoc """
  Configures supervision trees with RTO-aware restart strategies.

  Provides helper functions for calculating optimal restart intensity
  based on target RTO and historical failure rates. Used by platform
  supervisors to tune their `max_restarts` and `max_seconds` parameters.
  """

  @doc """
  Calculates restart intensity for a given RTO target.

  Higher RTO tolerance allows fewer restarts before escalation.
  Lower RTO targets require more aggressive restart attempts
  before giving up and escalating to the parent supervisor.

  ## Examples

      iex> SupervisorRTO.restart_intensity(:critical)
      %{max_restarts: 5, max_seconds: 10}

      iex> SupervisorRTO.restart_intensity(:standard)
      %{max_restarts: 3, max_seconds: 5}
  """
  @spec restart_intensity(:critical | :standard | :relaxed) :: %{
          max_restarts: pos_integer(),
          max_seconds: pos_integer()
        }
  def restart_intensity(:critical), do: %{max_restarts: 5, max_seconds: 10}
  def restart_intensity(:standard), do: %{max_restarts: 3, max_seconds: 5}
  def restart_intensity(:relaxed), do: %{max_restarts: 2, max_seconds: 30}

  @doc """
  Returns supervisor child spec with RTO-appropriate configuration.

  Wraps a standard child spec with restart type and shutdown timeout
  tuned to the specified service tier.

  ## Examples

      iex> SupervisorRTO.child_spec_for(MyGenServer, :critical, [])
      %{id: MyGenServer, start: {MyGenServer, :start_link, [[]]}, restart: :permanent, shutdown: 5000}
  """
  @spec child_spec_for(module(), :critical | :standard | :relaxed, keyword()) :: map()
  def child_spec_for(module, tier, opts) do
    shutdown =
      case tier do
        :critical -> 5_000
        :standard -> 10_000
        :relaxed -> 30_000
      end

    %{
      id: module,
      start: {module, :start_link, [opts]},
      restart: :permanent,
      shutdown: shutdown
    }
  end
end
```

```elixir
defmodule PrismaticWeb.HealthCheck do
  @moduledoc """
  Health check endpoint for RTO monitoring and Fly.io health probes.

  Returns structured health status including database connectivity,
  critical GenServer availability, and ETS table integrity. A failing
  health check triggers Fly.io's automatic container replacement,
  directly contributing to application-level RTO.
  """

  require Logger

  @type health_status :: :healthy | :degraded | :unhealthy
  @type check_result :: %{status: health_status(), checks: map(), timestamp: DateTime.t()}

  @doc """
  Performs comprehensive health check.

  Returns `:healthy` only if all critical subsystems are operational.
  Returns `:degraded` if non-critical subsystems have issues.
  Returns `:unhealthy` if any critical subsystem is down.

  ## Examples

      iex> HealthCheck.check()
      %{status: :healthy, checks: %{database: :ok, ets: :ok, genservers: :ok}, timestamp: ~U[...]}
  """
  @spec check() :: check_result()
  def check do
    checks = %{
      database: check_database(),
      ets_tables: check_ets_tables(),
      critical_genservers: check_genservers()
    }

    status =
      cond do
        Enum.any?(checks, fn {_k, v} -> v == :critical_failure end) -> :unhealthy
        Enum.any?(checks, fn {_k, v} -> v != :ok end) -> :degraded
        true -> :healthy
      end

    %{status: status, checks: checks, timestamp: DateTime.utc_now()}
  end

  @spec check_database() :: :ok | :critical_failure
  defp check_database do
    try do
      Ecto.Adapters.SQL.query!(PrismaticDd.Repo, "SELECT 1", [])
      :ok
    rescue
      _e in [DBConnection.ConnectionError, Postgrex.Error] ->
        Logger.error("Health check: database connectivity failed")
        :critical_failure
    end
  end

  @spec check_ets_tables() :: :ok | :degraded
  defp check_ets_tables do
    required_tables = [:tool_registry, :topic_registry, :source_registry]

    missing =
      Enum.filter(required_tables, fn table ->
        :ets.info(table) == :undefined
      end)

    if missing == [] do
      :ok
    else
      Logger.warning("Health check: missing ETS tables", tables: missing)
      :degraded
    end
  end

  @spec check_genservers() :: :ok | :critical_failure
  defp check_genservers do
    critical_processes = [
      PrismaticOsintCore.ToolRegistry,
      PrismaticWeb.PubSub
    ]

    dead =
      Enum.filter(critical_processes, fn name ->
        GenServer.whereis(name) == nil
      end)

    if dead == [] do
      :ok
    else
      Logger.error("Health check: critical GenServers down", processes: dead)
      :critical_failure
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Measuring RTO from detection, not failure | Actual downtime is longer than measured RTO | Include detection latency in RTO calculations; reduce health check intervals |
| No health check verification after recovery | System marked "recovered" but still serving errors | Always run smoke tests before declaring recovery complete |
| Supervisor restart intensity too aggressive | Crash loop consumes resources; delays real recovery | Tune `max_restarts`/`max_seconds` based on actual failure patterns |
| Supervisor restart intensity too conservative | Transient failures escalate unnecessarily | Allow enough restarts for transient issues (network blips, GC pauses) |
| Single point of failure in monitoring | Monitoring system itself goes down with the app | Use external monitoring (Fly.io health checks, uptime services) |
| Ignoring cold-start time in RTO | New containers need to compile routes, warm ETS | Measure and optimize application boot time; pre-warm caches |
| Manual failover procedures | Humans are slow and make mistakes under pressure | Automate all failover; manual only as last resort |
| Testing RTO only in development | Production has different latency, data volume, traffic | Practice chaos engineering in staging with production-like conditions |
| Conflating process restart with full recovery | Process restarts with empty state; needs time to reload data | Account for state recovery time (ETS rebuild, cache warming) in RTO |
| No tiered RTO definitions | Everything treated as equally critical; over-investment or under-investment | Define RTO per service tier; invest proportionally |

## Best Practices

1. **Define RTO per service tier** -- critical user-facing services need tighter RTO than batch processing systems; not everything needs sub-second recovery.

2. **Automate failover completely** -- manual failover adds minutes to recovery time and introduces human error; automate detection, switchover, and verification.

3. **Practice recovery regularly** -- untested recovery procedures fail under pressure; run chaos engineering exercises monthly (process kills, network partitions, database failover).

4. **Measure actual recovery time** -- track real incidents and compare against RTO targets; the gap between target and actual reveals operational maturity.

5. **Include verification in RTO measurement** -- the system is not recovered until it is verified healthy with passing smoke tests, not just running.

6. **Tune supervisor restart intensity per component** -- critical components (ToolRegistry) should tolerate more restarts before escalation than non-critical ones.

7. **Optimize application boot time** -- cold-start time directly impacts RTO; measure and minimize it by lazy-loading non-critical subsystems.

8. **Use circuit breakers for external dependencies** -- external service failures should degrade gracefully, not cascade into application-level outages.

9. **Monitor RTO compliance continuously** -- track recovery events in dashboards; set alerts when actual recovery time approaches RTO targets.

10. **Account for state recovery, not just process recovery** -- a restarted GenServer with empty state is not fully recovered; include ETS rebuild and cache warming time.

## Related Terms

- [RPO](@/glossary/rpo.md) -- recovery point objective, the data loss companion to RTO; together they define the recovery envelope
- [Rollback](@/glossary/rollback.md) -- the primary mechanism for application-level recovery within RTO targets
- [Supervision Tree](@/glossary/supervision-tree.md) -- BEAM's hierarchical process recovery mechanism providing microsecond-level RTO
- [GenServer](@/glossary/genserver.md) -- the process abstraction supervised for automatic restart on failure
- [Health Check](@/glossary/health-check.md) -- the detection mechanism that triggers recovery actions
- [Replication](@/glossary/replication.md) -- database infrastructure enabling rapid failover within RTO
- [Circuit Breaker](@/glossary/circuit-breaker.md) -- pattern preventing cascade failures that would exceed RTO
- [Blue-Green Deployment](@/glossary/blue-green-deployment.md) -- deployment strategy minimizing RTO during releases
- [SLA](@/glossary/sla.md) -- service level agreements that formalize RTO commitments
- [Uptime](@/glossary/uptime.md) -- the availability metric that RTO directly impacts
- [Chaos Engineering](@/glossary/chaos-engineering.md) -- testing discipline for validating RTO achievement
- [Failover](/glossary/failover/) -- the automated switchover process that executes within RTO constraints

## See Also

- [Disaster Recovery](@/architecture/_index.md) -- comprehensive recovery planning and RTO target setting
- [Supervision Trees](@/capabilities/_index.md) -- BEAM's process-level recovery mechanism
- [Fly.io Health Checks](https://fly.io/docs/reference/configuration/#services-concurrency) -- platform health check configuration
- [Erlang Supervisor Documentation](https://www.erlang.org/doc/man/supervisor.html) -- OTP supervisor restart strategies
- [PostgreSQL Streaming Replication](https://www.postgresql.org/docs/current/warm-standby.html) -- database-level failover mechanism

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
