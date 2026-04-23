+++
title = "RPO"
weight = 50

[extra]
description = "Recovery Point Objective -- the maximum acceptable amount of data loss measured in time, defining how far back in time recovery must restore data after a failure. RPO drives backup frequency, replication topology, and WAL archiving strategy across the entire Prismatic Platform data layer."
category = "architecture"
domain = "infrastructure"
complexity = "advanced"
stability = "stable"
beam_related = false
related_terms = ["rto", "replication", "wal", "rollback", "retention", "backup", "disaster-recovery", "high-availability", "failover", "checkpoint", "snapshot", "streaming-replication"]
tags = ["rpo", "disaster-recovery", "backup", "data-loss", "availability", "business-continuity", "postgresql", "wal", "replication", "infrastructure"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "RPO defines the maximum tolerable data loss window -- Prismatic Platform targets near-zero RPO through PostgreSQL streaming replication and WAL archiving, with per-data-category RPO classification driving infrastructure cost optimization."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["RPO", "Recovery Point Objective", "disaster recovery", "data loss", "WAL", "write-ahead log", "PostgreSQL replication", "backup strategy", "point-in-time recovery", "PITR", "streaming replication", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "RPO - Recovery Point Objective - Prismatic Platform"
word_count = 3200
see_also = ["architecture", "capabilities", "infrastructure"]
+++

## Definition

**RPO (Recovery Point Objective)** defines the maximum acceptable amount of data loss in the event of a disaster, measured as a time duration. An RPO of 1 hour means the organization can tolerate losing up to 1 hour of data. An RPO of zero means no data loss is acceptable under any circumstances. RPO is one of the two foundational disaster recovery metrics, alongside RTO (Recovery Time Objective), and together they determine the architecture, cost, and complexity of every data protection strategy.

RPO directly drives the choice of backup and replication strategy. Zero RPO requires synchronous replication to a standby -- every transaction is confirmed on both primary and replica before acknowledging to the client. A 1-hour RPO can be satisfied by hourly WAL archive shipping. A 24-hour RPO can be met with daily full backups. The relationship between RPO and infrastructure cost is inverse and exponential: halving the RPO typically more than doubles the cost, because the techniques required to achieve tighter RPO demand increasingly sophisticated infrastructure -- synchronous multi-region replication, dedicated network links, and real-time monitoring systems.

Understanding RPO requires distinguishing between the **target RPO** (the stated objective) and the **actual RPO** (the data loss that would occur given the current state of backups and replication). These can diverge silently: a misconfigured WAL archiver, a lagging replica, or a failed backup job can cause the actual RPO to exceed the target without any alert firing. Continuous monitoring and regular recovery testing are the only reliable methods to verify that target and actual RPO remain aligned.

## Core Concepts

### RPO Classification Matrix

| RPO Target | Strategy | Infrastructure Cost | Use Case | Data Loss Window |
|-----------|----------|-------------------|----------|-----------------|
| Zero (0s) | Synchronous replication | Very High | Financial transactions, compliance records | None -- every committed txn on replica |
| Near-zero (<5s) | Async streaming replication | High | Operational data, OSINT findings, DD entities | Replication lag (typically 0-2s) |
| Minutes (1-15m) | Continuous WAL archiving | Medium | Session data, analytics events, audit logs | Archive shipping interval |
| Hourly (1h) | Frequent incremental backups | Medium-Low | Cached computations, derived data | Backup interval + transfer time |
| Daily (24h) | Daily full backups (pg_dump) | Low | Historical archives, cold storage | 24h worst case |
| Weekly+ | Periodic snapshots | Very Low | Reference data, configuration | Days of potential loss |

### RPO vs. RTO Relationship

| Aspect | RPO | RTO |
|--------|-----|-----|
| Measures | Data loss tolerance | Downtime tolerance |
| Unit | Time (backward-looking) | Time (forward-looking) |
| Drives | Backup/replication frequency | Recovery infrastructure speed |
| Cost factor | Storage, bandwidth, replication | Failover automation, spare capacity |
| Failure to meet | Permanent data loss | Extended service unavailability |
| Monitoring | Replication lag, backup recency | Recovery drill duration, failover time |

### WAL-Based Recovery Mechanisms

| Mechanism | RPO Achieved | Write Latency Impact | Complexity | Prismatic Usage |
|-----------|-------------|---------------------|-----------|-----------------|
| Synchronous standby | 0 | +2-10ms per commit | High | Critical financial data |
| Async streaming replication | Lag (0-5s typical) | None | Medium | Primary operational data |
| Continuous WAL archiving to S3 | Archive interval (1-5m) | None | Medium | Point-in-time recovery base |
| pg_basebackup + WAL | Backup age + WAL gap | None | Low | Disaster recovery fallback |
| Logical replication | Lag (varies) | None | High | Cross-version, selective sync |

## Technical Deep Dive

RPO exists on a cost-performance spectrum. Lower RPO (less data loss tolerance) requires more expensive infrastructure: synchronous replicas, continuous WAL archiving, and multi-region replication. Higher RPO tolerates less expensive strategies: periodic backups, asynchronous replication, and single-region deployment. The engineering challenge is not achieving any particular RPO in isolation, but achieving the right RPO for each data category while minimizing total infrastructure cost.

### PostgreSQL WAL Architecture

PostgreSQL's Write-Ahead Log (WAL) is the foundation of all RPO strategies. Every data modification is first written to the WAL before being applied to the actual data files. This guarantees that committed transactions can be recovered even if the server crashes before the data pages are flushed to disk. WAL segments are fixed-size files (typically 16MB) that are sequentially written and can be shipped to remote locations for archival or replay.

The WAL pipeline supports several consumption modes:

1. **Streaming replication**: A standby connects to the primary and receives WAL records in real-time over a TCP connection. The standby replays these records to maintain a near-identical copy of the database. In synchronous mode, the primary waits for the standby to confirm receipt (or flush, or replay) before acknowledging the commit to the client.

2. **WAL archiving**: Completed WAL segments are copied to an archive location (typically object storage like S3) using the `archive_command` configuration. The archive can be used for point-in-time recovery (PITR), restoring the database to any specific moment covered by the archived segments.

3. **pg_receivewal**: A standalone utility that streams WAL records to a local directory, providing a middle ground between streaming replication (which requires a full standby) and archiving (which has segment-granularity delays).

### Synchronous Replication Deep Dive

PostgreSQL's `synchronous_commit` setting controls the durability guarantee per transaction:

- **`off`**: Transaction acknowledged immediately (no WAL write guaranteed). RPO = undefined; data loss on crash.
- **`local`**: Transaction acknowledged after WAL flush to local disk. RPO = 0 for single-server scenarios.
- **`remote_write`**: Transaction acknowledged after standby confirms receipt in OS buffer. RPO ~= 0 under normal operation; data loss possible if standby crashes before flushing.
- **`on`** (default): Transaction acknowledged after standby confirms WAL flush to disk. RPO = 0 for committed transactions.
- **`remote_apply`**: Transaction acknowledged after standby confirms replay. RPO = 0, and queries on the standby immediately see the data.

The tradeoff is write latency. Each stronger guarantee adds network round-trip time to every commit. For Prismatic Platform's Fly.io deployment, same-region synchronous replication adds approximately 1-3ms per commit, while cross-region synchronous replication can add 30-100ms+ depending on distance.

### Replication Lag and RPO Violation Detection

The actual RPO at any moment equals the replication lag -- the time difference between the last transaction committed on the primary and the last transaction replayed on the standby. Monitoring this lag is essential because it represents the data that would be lost if the primary failed at that instant.

Key lag metrics to monitor:

- **`pg_stat_replication.replay_lag`**: The time since the standby last replayed a WAL record. This is the authoritative RPO indicator.
- **`pg_stat_replication.write_lag`**: The time since the standby last wrote a WAL record to disk. Indicates network or I/O bottlenecks.
- **`pg_stat_replication.flush_lag`**: The time since the standby last flushed WAL to disk. Indicates standby I/O pressure.
- **Bytes behind**: The difference in WAL position between primary and standby, measured in bytes. Useful for capacity planning.

### Point-in-Time Recovery (PITR)

PITR allows restoring a database to any specific timestamp within the WAL archive window. This capability is critical for recovering from logical errors (accidental DELETE, schema corruption) that replication propagates instantly to all standbys. The RPO for PITR is determined by:

1. The age of the most recent base backup
2. The completeness of WAL archives since that backup
3. The archive shipping delay (time between WAL segment completion and archive upload)

A base backup taken daily with continuous WAL archiving provides PITR capability with RPO equal to the archive shipping delay (typically seconds to minutes).

## Usage in Prismatic Platform

The platform implements a tiered RPO strategy that assigns different data categories to appropriate protection levels:

### Tier 1: Near-Zero RPO (Critical Data)

- **DD case entities and relationships**: Due diligence data represents irreplaceable investigation findings. PostgreSQL streaming replication on Fly.io provides near-zero RPO with automatic failover.
- **OSINT execution history and findings**: Intelligence data collected from external sources cannot be re-collected identically. Protected by the same streaming replication.
- **User accounts and authentication data**: Authentication state loss could cause security incidents.

### Tier 2: Minutes RPO (Operational Data)

- **Pipeline execution state**: The DD pipeline tracks fetch/load progress. WAL archiving provides point-in-time recovery with minutes-level RPO.
- **Audit logs**: Compliance-relevant but reconstructable from other sources if necessary.
- **Search indices (Meilisearch)**: Can be rebuilt from PostgreSQL, but rebuild time is significant. Periodic snapshots reduce recovery time.

### Tier 3: Infinite RPO (Ephemeral Data)

- **ETS registry contents** (ToolRegistry, TopicRegistry, SourceRegistry, agent pools): Regenerated from compiled BEAM modules at startup. No backup needed or desired -- the source of truth is the codebase.
- **LiveView socket state**: Ephemeral per-session data that is naturally rebuilt on reconnection.
- **Telemetry buffers**: Real-time metrics that are aggregated into persistent storage at intervals.

### RPO Monitoring in Production

The platform monitors replication lag through a dedicated GenServer that queries PostgreSQL replication status at regular intervals and emits telemetry events when lag exceeds configured thresholds. These events feed into the platform's alerting pipeline and are visible on the system health dashboard.

## Code Examples

```elixir
defmodule PrismaticInfra.RPO.Monitor do
  @moduledoc """
  Monitors PostgreSQL replication lag to verify RPO compliance.

  This GenServer periodically queries the replica's replication status
  and emits telemetry events when lag exceeds the configured RPO threshold.
  It distinguishes between write lag, flush lag, and replay lag to provide
  granular insight into where replication delays originate.

  ## Configuration

      config :prismatic_infra, PrismaticInfra.RPO.Monitor,
        check_interval_ms: 30_000,
        rpo_threshold_ms: 5_000,
        repo: PrismaticDd.Repo

  ## Telemetry Events

      [:prismatic, :rpo, :check] - Emitted on every check cycle
      [:prismatic, :rpo, :violation] - Emitted when lag exceeds threshold
  """

  use GenServer
  require Logger

  @default_check_interval_ms :timer.seconds(30)
  @default_rpo_threshold_ms 5_000

  @type state :: %{
    compliant: boolean(),
    last_lag_ms: non_neg_integer(),
    violation_count: non_neg_integer(),
    last_check_at: DateTime.t() | nil,
    config: config()
  }

  @type config :: %{
    check_interval_ms: pos_integer(),
    rpo_threshold_ms: pos_integer(),
    repo: module()
  }

  @type lag_report :: %{
    replay_lag_ms: non_neg_integer(),
    write_lag_ms: non_neg_integer(),
    flush_lag_ms: non_neg_integer(),
    bytes_behind: non_neg_integer(),
    measured_at: DateTime.t()
  }

  # --- Public API ---

  @doc """
  Starts the RPO monitor with the given options.

  ## Options

    * `:check_interval_ms` - How often to check replication lag (default: 30s)
    * `:rpo_threshold_ms` - Maximum acceptable lag in milliseconds (default: 5000)
    * `:repo` - The Ecto repo to query for replication status

  ## Examples

      iex> PrismaticInfra.RPO.Monitor.start_link(rpo_threshold_ms: 3_000)
      {:ok, pid}
  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Returns the current RPO compliance status.

  ## Examples

      iex> PrismaticInfra.RPO.Monitor.status()
      %{compliant: true, last_lag_ms: 42, violation_count: 0}
  """
  @spec status() :: state()
  def status do
    GenServer.call(__MODULE__, :status)
  end

  @doc """
  Returns a detailed lag report with all replication lag components.

  ## Examples

      iex> PrismaticInfra.RPO.Monitor.detailed_lag()
      {:ok, %{replay_lag_ms: 42, write_lag_ms: 10, flush_lag_ms: 15, bytes_behind: 1024}}
  """
  @spec detailed_lag() :: {:ok, lag_report()} | {:error, term()}
  def detailed_lag do
    GenServer.call(__MODULE__, :detailed_lag)
  end

  @doc """
  Checks whether the current replication lag is within the RPO threshold.

  ## Examples

      iex> PrismaticInfra.RPO.Monitor.compliant?()
      true
  """
  @spec compliant?() :: boolean()
  def compliant? do
    GenServer.call(__MODULE__, :compliant?)
  end

  # --- Server Callbacks ---

  @impl true
  def init(opts) do
    config = %{
      check_interval_ms: Keyword.get(opts, :check_interval_ms, @default_check_interval_ms),
      rpo_threshold_ms: Keyword.get(opts, :rpo_threshold_ms, @default_rpo_threshold_ms),
      repo: Keyword.get(opts, :repo, PrismaticDd.Repo)
    }

    schedule_check(config.check_interval_ms)

    {:ok,
     %{
       compliant: true,
       last_lag_ms: 0,
       violation_count: 0,
       last_check_at: nil,
       config: config
     }}
  end

  @impl true
  def handle_call(:status, _from, state) do
    {:reply, Map.drop(state, [:config]), state}
  end

  @impl true
  def handle_call(:compliant?, _from, state) do
    {:reply, state.compliant, state}
  end

  @impl true
  def handle_call(:detailed_lag, _from, state) do
    result = measure_detailed_lag(state.config.repo)
    {:reply, result, state}
  end

  @impl true
  def handle_info(:check, state) do
    lag_ms = measure_replay_lag(state.config.repo)
    now = DateTime.utc_now()
    compliant = lag_ms <= state.config.rpo_threshold_ms

    :telemetry.execute(
      [:prismatic, :rpo, :check],
      %{lag_ms: lag_ms, threshold_ms: state.config.rpo_threshold_ms},
      %{compliant: compliant}
    )

    violation_count =
      if compliant do
        state.violation_count
      else
        Logger.warning(
          "RPO violation: replication lag #{lag_ms}ms exceeds threshold #{state.config.rpo_threshold_ms}ms",
          domain: [:prismatic, :rpo]
        )

        :telemetry.execute(
          [:prismatic, :rpo, :violation],
          %{lag_ms: lag_ms},
          %{threshold_ms: state.config.rpo_threshold_ms}
        )

        state.violation_count + 1
      end

    schedule_check(state.config.check_interval_ms)

    {:noreply,
     %{
       state
       | compliant: compliant,
         last_lag_ms: lag_ms,
         violation_count: violation_count,
         last_check_at: now
     }}
  end

  # --- Private Helpers ---

  defp measure_replay_lag(repo) do
    query = """
    SELECT COALESCE(
      extract(epoch from now() - pg_last_xact_replay_timestamp()) * 1000,
      0
    )::integer AS lag_ms
    """

    case Ecto.Adapters.SQL.query(repo, query, []) do
      {:ok, %{rows: [[lag]]}} when is_integer(lag) -> lag
      {:ok, _} -> 0
      {:error, reason} ->
        Logger.error("Failed to measure replication lag: #{inspect(reason)}",
          domain: [:prismatic, :rpo]
        )
        0
    end
  end

  defp measure_detailed_lag(repo) do
    query = """
    SELECT
      COALESCE(extract(epoch from replay_lag) * 1000, 0)::integer,
      COALESCE(extract(epoch from write_lag) * 1000, 0)::integer,
      COALESCE(extract(epoch from flush_lag) * 1000, 0)::integer,
      COALESCE(pg_wal_lsn_diff(sent_lsn, replay_lsn), 0)::bigint
    FROM pg_stat_replication
    LIMIT 1
    """

    case Ecto.Adapters.SQL.query(repo, query, []) do
      {:ok, %{rows: [[replay, write, flush, bytes]]}} ->
        {:ok,
         %{
           replay_lag_ms: replay,
           write_lag_ms: write,
           flush_lag_ms: flush,
           bytes_behind: bytes,
           measured_at: DateTime.utc_now()
         }}

      {:ok, %{rows: []}} ->
        {:error, :no_replication_connections}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp schedule_check(interval_ms) do
    Process.send_after(self(), :check, interval_ms)
  end
end
```

```elixir
defmodule PrismaticInfra.RPO.PolicyEngine do
  @moduledoc """
  Evaluates RPO policies for different data categories and recommends
  appropriate backup/replication strategies based on business requirements.

  Each data category is assigned an RPO tier that maps to specific
  infrastructure requirements. The policy engine validates that the
  current infrastructure meets the required RPO for each category.

  ## Data Categories

  - `:critical` - Zero data loss (synchronous replication)
  - `:operational` - Near-zero (async streaming, <5s lag)
  - `:analytical` - Minutes (WAL archiving)
  - `:ephemeral` - No backup required (regenerated at startup)
  """

  @type rpo_tier :: :critical | :operational | :analytical | :ephemeral
  @type strategy :: :sync_replication | :async_streaming | :wal_archiving | :daily_backup | :none

  @type policy :: %{
    tier: rpo_tier(),
    max_loss_seconds: non_neg_integer() | :infinity,
    strategy: strategy(),
    description: String.t()
  }

  @policies %{
    critical: %{
      tier: :critical,
      max_loss_seconds: 0,
      strategy: :sync_replication,
      description: "Zero data loss -- synchronous replication required"
    },
    operational: %{
      tier: :operational,
      max_loss_seconds: 5,
      strategy: :async_streaming,
      description: "Near-zero data loss -- async streaming replication"
    },
    analytical: %{
      tier: :analytical,
      max_loss_seconds: 900,
      strategy: :wal_archiving,
      description: "Minutes of acceptable loss -- WAL archive shipping"
    },
    ephemeral: %{
      tier: :ephemeral,
      max_loss_seconds: :infinity,
      strategy: :none,
      description: "No backup needed -- data regenerated from code"
    }
  }

  @doc """
  Returns the RPO policy for the given data category.

  ## Examples

      iex> PrismaticInfra.RPO.PolicyEngine.policy_for(:critical)
      %{tier: :critical, max_loss_seconds: 0, strategy: :sync_replication, description: "Zero data loss -- synchronous replication required"}

      iex> PrismaticInfra.RPO.PolicyEngine.policy_for(:ephemeral)
      %{tier: :ephemeral, max_loss_seconds: :infinity, strategy: :none, description: "No backup needed -- data regenerated from code"}
  """
  @spec policy_for(rpo_tier()) :: policy()
  def policy_for(tier) when is_map_key(@policies, tier) do
    Map.fetch!(@policies, tier)
  end

  @doc """
  Evaluates whether the current replication lag satisfies the RPO policy
  for the given data category.

  ## Examples

      iex> PrismaticInfra.RPO.PolicyEngine.evaluate(:operational, 2_000)
      {:ok, :compliant}

      iex> PrismaticInfra.RPO.PolicyEngine.evaluate(:operational, 10_000)
      {:error, :rpo_violation, %{actual_ms: 10_000, max_ms: 5_000}}
  """
  @spec evaluate(rpo_tier(), non_neg_integer()) ::
          {:ok, :compliant} | {:error, :rpo_violation, map()}
  def evaluate(tier, current_lag_ms) do
    policy = policy_for(tier)

    case policy.max_loss_seconds do
      :infinity ->
        {:ok, :compliant}

      max_seconds ->
        max_ms = max_seconds * 1_000

        if current_lag_ms <= max_ms do
          {:ok, :compliant}
        else
          {:error, :rpo_violation, %{actual_ms: current_lag_ms, max_ms: max_ms}}
        end
    end
  end

  @doc """
  Returns all defined RPO policies.

  ## Examples

      iex> policies = PrismaticInfra.RPO.PolicyEngine.all_policies()
      iex> map_size(policies)
      4
  """
  @spec all_policies() :: %{rpo_tier() => policy()}
  def all_policies, do: @policies
end
```

```elixir
defmodule PrismaticInfra.RPO.WALArchiveValidator do
  @moduledoc """
  Validates WAL archive completeness and continuity to ensure
  point-in-time recovery (PITR) capability within the target RPO.

  Checks that WAL segments are archived continuously without gaps,
  and that the archive lag (time since last archived segment) stays
  within acceptable bounds.
  """

  require Logger

  @type validation_result :: %{
    archive_lag_seconds: non_neg_integer(),
    last_archived_at: DateTime.t() | nil,
    continuous: boolean(),
    gap_count: non_neg_integer()
  }

  @doc """
  Validates that WAL archiving is current and continuous.

  ## Examples

      iex> PrismaticInfra.RPO.WALArchiveValidator.validate(PrismaticDd.Repo)
      {:ok, %{archive_lag_seconds: 12, continuous: true, gap_count: 0}}
  """
  @spec validate(module()) :: {:ok, validation_result()} | {:error, term()}
  def validate(repo) do
    with {:ok, lag} <- measure_archive_lag(repo),
         {:ok, continuity} <- check_continuity(repo) do
      {:ok,
       %{
         archive_lag_seconds: lag,
         last_archived_at: DateTime.utc_now() |> DateTime.add(-lag, :second),
         continuous: continuity.gaps == 0,
         gap_count: continuity.gaps
       }}
    end
  end

  defp measure_archive_lag(repo) do
    query = """
    SELECT COALESCE(
      extract(epoch from now() - last_archived_time)::integer,
      -1
    )
    FROM pg_stat_archiver
    """

    case Ecto.Adapters.SQL.query(repo, query, []) do
      {:ok, %{rows: [[lag]]}} when lag >= 0 -> {:ok, lag}
      {:ok, %{rows: [[-1]]}} -> {:error, :no_archive_history}
      {:error, reason} -> {:error, reason}
    end
  end

  defp check_continuity(repo) do
    query = """
    SELECT COALESCE(failed_count, 0)::integer
    FROM pg_stat_archiver
    """

    case Ecto.Adapters.SQL.query(repo, query, []) do
      {:ok, %{rows: [[failed]]}} -> {:ok, %{gaps: failed}}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Assuming replication = RPO compliance | Replication lag can spike during heavy writes, temporarily violating RPO | Monitor lag continuously with alerting thresholds below the RPO target |
| Same RPO for all data | Over-protecting ephemeral data wastes money; under-protecting critical data risks loss | Classify data into RPO tiers and apply appropriate strategies per tier |
| Testing only backups, not recovery | Backups may be corrupted or incomplete; only recovery testing proves RPO | Schedule regular recovery drills and measure actual data loss vs target |
| Ignoring WAL archive gaps | A single missing WAL segment breaks PITR chain, making all subsequent archives useless | Monitor `pg_stat_archiver.failed_count` and alert on any non-zero value |
| Synchronous replication without timeout | Network partition causes primary to hang indefinitely waiting for standby ACK | Configure `synchronous_standby_names` with `FIRST 1` and monitor standby health |
| Confusing RPO and RTO | RPO (data loss tolerance) and RTO (downtime tolerance) require different infrastructure | Define and track both metrics independently for each service |
| Measuring lag only on the primary | Primary-side lag metrics can be stale if the standby is disconnected | Query lag from both primary (`pg_stat_replication`) and standby (`pg_last_xact_replay_timestamp`) |
| No RPO for search indices | Meilisearch or Elasticsearch indices take hours to rebuild from scratch | Maintain periodic index snapshots alongside PostgreSQL backups |
| Overlooking logical corruption | Replication faithfully copies accidental DELETEs and schema corruption | Combine replication (for hardware failures) with PITR (for logical errors) |
| Single-region backups | A region-wide disaster destroys both primary and local backups | Archive WAL and base backups to a different geographic region |

## Best Practices

1. **Classify data by RPO tier** -- not all data has the same criticality. Financial records may need RPO=0 while ETS cache data needs no RPO. Document the classification and its business justification.

2. **Monitor actual RPO continuously** -- configured replication does not guarantee RPO. Measure replication lag as a proxy for actual RPO and alert when it approaches the threshold, not just when it exceeds it.

3. **Test recovery to verify RPO** -- periodically restore from backups and verify that the actual data loss matches the target RPO. Automated recovery testing should run at least monthly.

4. **Document RPO decisions** -- record why each data category has its assigned RPO, linking to business impact analysis. This documentation drives infrastructure budget decisions.

5. **Alert on RPO violations immediately** -- replication lag exceeding the RPO threshold should trigger immediate investigation. Use escalating alerts: warning at 50% of threshold, critical at 100%.

6. **Combine replication with PITR** -- replication protects against hardware failure but propagates logical errors. WAL archiving enables point-in-time recovery to undo accidental data corruption.

7. **Cross-region archive storage** -- store WAL archives and base backups in a different geographic region than the primary database to protect against region-wide disasters.

8. **Automate backup validation** -- every backup should be automatically verified (checksum validation, test restore to a scratch instance) to ensure it is usable when needed.

9. **Size WAL retention appropriately** -- configure `wal_keep_size` (or `wal_keep_segments` on older PostgreSQL) to retain enough WAL for standbys to reconnect after brief network interruptions without requiring a full base backup.

10. **Align RPO with SLA commitments** -- the stated RPO must be achievable with the deployed infrastructure and must match what is promised to users in service level agreements.

## Related Terms

- [RTO](@/glossary/rto.md) -- Recovery Time Objective, the companion metric measuring maximum acceptable downtime
- [Replication](@/glossary/replication.md) -- the primary mechanism for achieving low RPO targets
- [WAL](@/glossary/wal.md) -- Write-Ahead Log, the PostgreSQL mechanism enabling both replication and PITR
- [Rollback](@/glossary/rollback.md) -- recovery mechanism that operates within the RPO window
- [Backup](/glossary/backup/) -- periodic data copies providing baseline RPO protection
- [High Availability](/glossary/high-availability/) -- system design ensuring continuous operation
- [Failover](/glossary/failover/) -- automatic switching to a standby when the primary fails
- [Disaster Recovery](@/glossary/disaster-recovery.md) -- comprehensive planning for catastrophic failures
- [Retention](@/glossary/retention.md) -- policies governing how long backups and archives are kept
- [Checkpoint](/glossary/checkpoint/) -- PostgreSQL process that flushes dirty pages to disk
- [Snapshot](/glossary/snapshot/) -- point-in-time copy of storage for backup purposes
- [Streaming Replication](/glossary/streaming-replication/) -- PostgreSQL's real-time WAL-based replication

## See Also

- [Disaster Recovery Architecture](@/architecture/_index.md) -- comprehensive recovery planning
- [Infrastructure](@/capabilities/_index.md) -- deployment and replication infrastructure
- [PostgreSQL High Availability Documentation](https://www.postgresql.org/docs/current/high-availability.html) -- official PostgreSQL HA guide
- [Fly.io PostgreSQL](https://fly.io/docs/postgres/) -- managed PostgreSQL on Fly.io

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
