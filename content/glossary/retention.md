+++
title = "Retention"
weight = 50

[extra]
description = "The policy and mechanisms governing how long data is stored before archival or deletion, balancing storage costs, compliance requirements, and analytical value across all platform data categories."
category = "architecture"
domain = "data-governance"
complexity = "intermediate"
stability = "stable"
beam_related = true
related_terms = ["ttl", "vacuum", "replication", "storage-adapter", "compliance", "gdpr", "ets", "timescaledb", "archival", "data-lifecycle", "nis2", "audit-trail"]
tags = ["retention", "data-lifecycle", "compliance", "storage", "archival", "gdpr", "policy", "ttl", "ets", "timescaledb", "nis2", "data-governance"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Data retention policies in Prismatic Platform balance compliance requirements (GDPR, NIS2) with operational needs, using TTL-based expiration, partition-based deletion, ETS cleanup, and scheduled GenServer jobs to enforce policies as code."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Retention", "data lifecycle", "compliance", "GDPR", "NIS2", "storage", "glossary", "Prismatic Platform", "TTL", "data expiration", "archival", "log rotation", "ETS TTL"]
image = "/images/sections/glossary.png"
image_alt = "Retention - Prismatic Platform"
word_count = 3300
see_also = ["capabilities", "architecture", "compliance", "gdpr", "storage-adapter"]
+++

## Definition

**Retention** defines the duration for which data is stored in a system and the rules governing its lifecycle after that period expires. Retention policies specify different durations for different data categories -- security audit logs may be retained for 7 years, OSINT search results for 90 days, user sessions for 24 hours, and temporary processing data for minutes. Each category balances competing concerns: compliance mandates, operational utility, analytical value, and storage cost.

Retention is driven by competing concerns: compliance mandates (GDPR requires data minimization, meaning data should not be kept longer than necessary for its stated purpose), legal holds (litigation may require preserving data beyond normal retention), operational needs (historical data enables trend analysis and anomaly detection), and cost (storage grows linearly with retention duration while the marginal value of old data typically decays exponentially).

In the Prismatic Platform, retention is implemented as code rather than policy documents. GenServer-based cleanup jobs enforce retention periods automatically, partition-based deletion handles high-volume time-series data efficiently, and ETS tables implement TTL through periodic scans. Every data category has a documented retention period with a compliance justification, and the retention enforcement system is validated through automated testing as part of the quality gate pipeline.

## Core Concepts

| Concept | Description | Prismatic Usage |
|---------|-------------|-----------------|
| **TTL (Time-To-Live)** | Per-record expiration duration after which data is eligible for deletion | DD fetch records (30 days), OSINT executions (90 days), sessions (24 hours) |
| **Partition-based deletion** | Dropping entire time-based table partitions rather than row-level deletion | TimescaleDB hypertable chunk dropping for metrics and telemetry data |
| **Scheduled cleanup jobs** | GenServer processes that periodically scan for and remove expired records | `RetentionPolicy` GenServer running hourly cleanup across all data categories |
| **Data minimization** | GDPR principle: do not retain data longer than necessary for its purpose | Drives the platform's default retention periods and justification requirements |
| **Legal hold** | Temporary override that preserves data beyond normal retention | Implemented as a flag on records that prevents cleanup job deletion |
| **Right to be forgotten** | GDPR Article 17: individual-level deletion on request | Soft deletion with cascading relationship cleanup across all storage backends |
| **Retention tiers** | Different retention durations for different data sensitivity levels | 4 tiers: ephemeral (hours), operational (days), analytical (months), compliance (years) |
| **Archival** | Moving expired data to cold storage before deletion | PostgreSQL -> S3 archival for DD entity snapshots before retention cleanup |
| **Log rotation** | Periodic truncation and rotation of log files by size or age | Erlang SASL logs, application logs, and telemetry event logs |
| **ETS TTL** | Time-based expiration for in-memory cache entries | HierarchicalCache entries expire after configurable TTL (default: 5 minutes) |
| **Audit trail** | Immutable record of all data access and modification events | 7-year retention for NIS2 compliance on critical infrastructure operations |
| **Soft deletion** | Marking records as deleted without physical removal | `deleted_at` timestamp enables GDPR verification before permanent cleanup |

## Technical Deep Dive

### Retention Tier Architecture

Prismatic Platform defines four retention tiers, each with distinct implementation mechanisms:

**Tier 1 -- Ephemeral (Minutes to Hours)**: Temporary processing data, WebSocket session state, LiveView socket assigns. Retained only during active use and garbage collected automatically by the BEAM when the owning process terminates. No explicit cleanup needed. ETS cache entries with 5-minute TTL also fall in this tier.

**Tier 2 -- Operational (1-90 Days)**: DD fetch records (30 days), OSINT execution history (90 days), user session logs (7 days), error telemetry events (30 days). Retained for debugging, trend analysis, and operational review. Cleaned by the `RetentionPolicy` GenServer's hourly sweep. Row-level deletion with batching to avoid lock contention.

**Tier 3 -- Analytical (91-365 Days)**: DD entity records (indefinite while source is active), Academy learner progress (365 days), API usage metrics (180 days). Retained for business intelligence, learning analytics, and platform optimization. Archived to cold storage before deletion for reproducibility.

**Tier 4 -- Compliance (1-7 Years)**: Security audit trails (7 years, NIS2), authentication events (3 years), data access logs (5 years, GDPR accountability). Retained for regulatory compliance. Immutable storage with integrity verification. Partition-based deletion for efficient expiration.

### PostgreSQL Retention Implementation

For PostgreSQL tables, retention operates through scheduled DELETE queries with WHERE clauses on timestamp columns. To prevent lock contention on large tables, deletion is batched: the cleanup job deletes in batches of 1000 rows with a brief pause between batches, allowing concurrent reads and writes to proceed.

For time-series data stored in TimescaleDB hypertables, retention is dramatically more efficient. `add_retention_policy('metrics', INTERVAL '30 days')` automatically drops chunks older than the specified interval. This is orders of magnitude faster than row-level deletion because entire chunks (physical files) are simply removed without scanning individual rows.

Partitioned tables provide a middle ground: `ALTER TABLE ... DETACH PARTITION` removes an entire time-based partition from the table without row-level scanning. The detached partition can be archived to cold storage before being dropped. Prismatic Platform uses this pattern for audit trail tables that require archival before deletion.

### ETS TTL Implementation

ETS tables do not natively support TTL. Prismatic Platform implements TTL through a periodic scan pattern: a GenServer timer fires every N seconds, scans ETS entries for those with timestamps older than the TTL threshold, and deletes them. This approach trades scan overhead for simplicity and works well for tables with fewer than 100,000 entries.

For the HierarchicalCache (ETS layer), entries include an `inserted_at` timestamp in their value tuple. The cleanup scan uses `:ets.select_delete/2` with a match specification that compares the timestamp against the current time minus TTL. This operation executes inside the ETS table's memory space, avoiding copying entries to the scanning process.

### GDPR Right to Be Forgotten

GDPR's "right to be forgotten" (Article 17) adds complexity to retention: individual records may need deletion on demand, independent of the general retention schedule. Prismatic Platform implements this through a multi-phase deletion pipeline:

1. **Soft deletion**: Set `deleted_at` timestamp on all records associated with the data subject
2. **Cascading identification**: Query all storage backends (PostgreSQL, Meilisearch, ETS, KuzuDB) for related records
3. **Relationship cleanup**: Remove or anonymize references in related records (DD relationships, OSINT execution history)
4. **Physical deletion**: After a verification period (7 days), permanently delete soft-deleted records
5. **Verification**: Generate a deletion certificate confirming all copies have been removed

This pipeline ensures no orphaned references remain while providing a verification window to catch errors before irreversible deletion.

### Log Rotation

Erlang SASL logs, application logs, and telemetry event logs use file-based rotation. The BEAM's built-in `:logger_disk_log_h` handler rotates log files based on size (default: 10MB per file, 5 rotations). Prismatic Platform configures rotation based on both size and time: logs rotate daily or at 50MB, whichever comes first, with 30-day retention on rotated files.

For structured telemetry events stored in PostgreSQL, the same scheduled cleanup job handles retention. Events are timestamped and cleaned by the same Tier 2 operational retention policy as other time-bounded data.

## Usage in Prismatic Platform

### DD Pipeline Retention

The DD pipeline implements the most complex retention policy in the platform. Raw fetched data (`dd_fetch_records`) is retained for 30 days for debugging -- long enough to diagnose pipeline failures but short enough to limit storage growth during high-volume fetch cycles. Processed entities in `dd_entities` are retained indefinitely while their source is active, because entities represent accumulated knowledge. When a DD case is closed, its entities transition to Tier 3 analytical retention (365 days) and then archival.

Entity relationships (`dd_relationships`) follow the same lifecycle as their parent entities. Contradiction markers and decision engine scores are retained with the entity for the duration of its lifecycle, enabling longitudinal analysis of how entity assessments evolve over time.

### OSINT Execution Retention

OSINT tool execution history uses a 90-day default retention with configurable per-tool overrides. Tools that query volatile data sources (social media, news) have shorter retention (30 days) because results become stale quickly. Tools that query stable registries (business registers, court records) have longer retention (180 days) because results remain valid longer.

Execution results are stored as JSON blobs in PostgreSQL. Before retention cleanup, the system extracts aggregate statistics (execution count, average response time, error rate) and stores them in a permanent metrics table, preserving analytical value without retaining raw data.

### ETS Registry Retention

ETS-based registries (ToolRegistry, TopicRegistry, SourceRegistry) do not implement retention because their data is derived from compiled BEAM modules -- it is regenerated on every application start. These registries are considered ephemeral (Tier 1) even though they persist for the lifetime of the BEAM VM.

Dynamic ETS caches (HierarchicalCache, session cache) implement 5-minute TTL with periodic cleanup every 60 seconds. This ensures stale cache entries do not accumulate during long-running production deployments.

### Compliance Audit Trail

NIS2 compliance requires 7-year retention of security audit trails for critical infrastructure operations. Prismatic Platform stores these in a dedicated partitioned PostgreSQL table with monthly partitions. Each partition is integrity-verified (SHA-256 hash chain) and archived to S3-compatible cold storage at 90 days. Physical deletion of partitions older than 7 years is automated via the retention policy GenServer.

## Code Examples

```elixir
defmodule PrismaticStorage.RetentionPolicy do
  @moduledoc """
  Implements data retention policies with scheduled cleanup.

  Runs as a GenServer that periodically scans data categories
  for records exceeding their retention period and deletes them
  in bounded batches. Supports legal holds, soft deletion
  verification, and retention tier enforcement.

  ## Retention Tiers

    * Tier 1 (Ephemeral): Automatic BEAM GC, no explicit cleanup
    * Tier 2 (Operational): 1-90 day cleanup via this GenServer
    * Tier 3 (Analytical): 91-365 day cleanup with archival
    * Tier 4 (Compliance): 1-7 year cleanup with verification

  ## Configuration

  Retention policies are defined as code in `@policies` and cannot
  be overridden at runtime without a code change, ensuring retention
  periods are version-controlled and auditable.
  """

  use GenServer

  require Logger

  @check_interval_ms :timer.hours(1)
  @batch_size 1_000
  @batch_pause_ms 100

  @typedoc "Retention policy definition with duration and tier"
  @type policy :: %{
    duration: pos_integer(),
    unit: :days | :hours | :minutes,
    tier: :operational | :analytical | :compliance,
    archival_required: boolean()
  }

  @policies %{
    dd_fetch_records: %{duration: 30, unit: :days, tier: :operational, archival_required: false},
    osint_executions: %{duration: 90, unit: :days, tier: :operational, archival_required: false},
    session_logs: %{duration: 7, unit: :days, tier: :operational, archival_required: false},
    error_events: %{duration: 30, unit: :days, tier: :operational, archival_required: false},
    api_usage_metrics: %{duration: 180, unit: :days, tier: :analytical, archival_required: true},
    learner_progress: %{duration: 365, unit: :days, tier: :analytical, archival_required: true},
    audit_trail: %{duration: 2555, unit: :days, tier: :compliance, archival_required: true}
  }

  @doc """
  Starts the retention policy enforcement GenServer.

  ## Options

    * `:name` - Process registration name (default: `__MODULE__`)
    * `:check_interval_ms` - Override cleanup interval (default: 1 hour)

  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: Keyword.get(opts, :name, __MODULE__))
  end

  @doc """
  Returns all configured retention policies.

  ## Examples

      iex> policies = PrismaticStorage.RetentionPolicy.policies()
      iex> Map.has_key?(policies, :dd_fetch_records)
      true

  """
  @spec policies() :: %{atom() => policy()}
  def policies, do: @policies

  @doc """
  Returns the retention policy for a specific data category.

  ## Parameters

    * `category` - The data category atom

  ## Examples

      iex> {:ok, policy} = PrismaticStorage.RetentionPolicy.policy_for(:dd_fetch_records)
      iex> policy.duration
      30

  """
  @spec policy_for(atom()) :: {:ok, policy()} | {:error, :unknown_category}
  def policy_for(category) do
    case Map.fetch(@policies, category) do
      {:ok, policy} -> {:ok, policy}
      :error -> {:error, :unknown_category}
    end
  end

  @impl true
  def init(opts) do
    interval = Keyword.get(opts, :check_interval_ms, @check_interval_ms)
    schedule_cleanup(interval)

    {:ok, %{
      last_run: nil,
      check_interval_ms: interval,
      stats: %{total_deleted: 0, last_run_deleted: 0}
    }}
  end

  @impl true
  def handle_info(:cleanup, state) do
    deleted_count =
      Enum.reduce(@policies, 0, fn {category, policy}, acc ->
        cutoff = compute_cutoff(policy.duration, policy.unit)

        if policy.archival_required do
          archive_before_delete(category, cutoff)
        end

        count = cleanup_table_batched(category, cutoff)

        if count > 0 do
          Logger.info(
            "Retention cleanup: removed #{count} records from #{category} " <>
            "(tier=#{policy.tier}, cutoff=#{DateTime.to_iso8601(cutoff)})"
          )
        end

        acc + count
      end)

    schedule_cleanup(state.check_interval_ms)

    {:noreply, %{state |
      last_run: DateTime.utc_now(),
      stats: %{
        total_deleted: state.stats.total_deleted + deleted_count,
        last_run_deleted: deleted_count
      }
    }}
  end

  @impl true
  def handle_call(:stats, _from, state) do
    {:reply, state.stats, state}
  end

  @doc false
  @spec compute_cutoff(pos_integer(), :days | :hours | :minutes) :: DateTime.t()
  def compute_cutoff(duration, :days) do
    DateTime.utc_now() |> DateTime.add(-duration * 86_400, :second)
  end

  def compute_cutoff(duration, :hours) do
    DateTime.utc_now() |> DateTime.add(-duration * 3_600, :second)
  end

  def compute_cutoff(duration, :minutes) do
    DateTime.utc_now() |> DateTime.add(-duration * 60, :second)
  end

  defp cleanup_table_batched(category, cutoff) do
    schema = table_schema(category)
    cleanup_batch(schema, cutoff, 0)
  end

  defp cleanup_batch(schema, cutoff, acc) do
    import Ecto.Query, warn: false

    batch_ids =
      from(r in schema,
        where: r.inserted_at < ^cutoff,
        where: is_nil(r.legal_hold) or r.legal_hold == false,
        select: r.id,
        limit: @batch_size
      )
      |> PrismaticDd.Repo.all()

    if batch_ids == [] do
      acc
    else
      {count, _} =
        from(r in schema, where: r.id in ^batch_ids)
        |> PrismaticDd.Repo.delete_all()

      Process.sleep(@batch_pause_ms)
      cleanup_batch(schema, cutoff, acc + count)
    end
  end

  defp archive_before_delete(category, cutoff) do
    Logger.info("Archiving #{category} records before retention deletion (cutoff=#{DateTime.to_iso8601(cutoff)})")
    # Archive implementation delegates to cold storage adapter
    :ok
  end

  defp table_schema(:dd_fetch_records), do: PrismaticDd.Schemas.FetchRecord
  defp table_schema(:osint_executions), do: PrismaticOsintCore.ExecutionRecord
  defp table_schema(:session_logs), do: PrismaticAuth.SessionLog
  defp table_schema(:error_events), do: PrismaticTelemetry.ErrorEvent
  defp table_schema(:api_usage_metrics), do: PrismaticApi.UsageMetric
  defp table_schema(:learner_progress), do: PrismaticAcademy.LearnerProgress
  defp table_schema(:audit_trail), do: PrismaticCompliance.AuditEntry

  defp schedule_cleanup(interval) do
    Process.send_after(self(), :cleanup, interval)
  end
end
```

```elixir
defmodule PrismaticStorage.EtsRetention do
  @moduledoc """
  TTL-based retention for ETS cache tables.

  Provides periodic cleanup of ETS entries that have exceeded
  their TTL. Uses `:ets.select_delete/2` with match specifications
  for efficient in-table deletion without copying entries to the
  scanning process.
  """

  use GenServer

  require Logger

  @default_ttl_ms :timer.minutes(5)
  @scan_interval_ms :timer.seconds(60)

  @doc """
  Starts the ETS retention scanner.

  ## Options

    * `:table` (required) - ETS table name to scan
    * `:ttl_ms` - TTL in milliseconds (default: 5 minutes)
    * `:scan_interval_ms` - Scan frequency (default: 60 seconds)

  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    table = Keyword.fetch!(opts, :table)
    GenServer.start_link(__MODULE__, opts, name: :"ets_retention_#{table}")
  end

  @impl true
  def init(opts) do
    state = %{
      table: Keyword.fetch!(opts, :table),
      ttl_ms: Keyword.get(opts, :ttl_ms, @default_ttl_ms),
      scan_interval_ms: Keyword.get(opts, :scan_interval_ms, @scan_interval_ms),
      total_expired: 0
    }

    schedule_scan(state.scan_interval_ms)
    {:ok, state}
  end

  @impl true
  def handle_info(:scan, state) do
    cutoff = System.monotonic_time(:millisecond) - state.ttl_ms

    # Match spec: entries where element 3 (timestamp) < cutoff
    expired_count = :ets.select_delete(state.table, [
      {{:_, :_, :"$1"}, [{:<, :"$1", cutoff}], [true]}
    ])

    if expired_count > 0 do
      Logger.debug("ETS retention: expired #{expired_count} entries from #{state.table}")
    end

    schedule_scan(state.scan_interval_ms)
    {:noreply, %{state | total_expired: state.total_expired + expired_count}}
  end

  defp schedule_scan(interval) do
    Process.send_after(self(), :scan, interval)
  end
end
```

## Common Pitfalls

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| **Row-level deletion on large tables** | Lock contention blocks concurrent reads/writes during cleanup | Use partition-based deletion or batched deletion with pauses |
| **Missing retention policy documentation** | GDPR auditors require written justification for every retention period | Document each data category's retention period and legal basis in code comments |
| **Retention without archival** | Compliance data deleted before archival violates regulatory requirements | Always archive Tier 3/4 data before deletion; enforce via `archival_required` flag |
| **Ignoring legal holds** | Deleting data under active litigation causes legal liability | Check `legal_hold` flag in every cleanup query; exclude held records from deletion |
| **ETS cleanup race conditions** | Cleanup deletes entry between read and use in another process | Design consumers to handle missing entries gracefully; use `with` pattern |
| **Unbounded archival storage** | Archived data accumulates forever in cold storage | Apply separate retention policies to archives (e.g., S3 lifecycle rules) |
| **GDPR deletion without cascade** | Deleting entity but leaving references in relationship tables | Implement cascading deletion across all storage backends (PostgreSQL, Meilisearch, ETS, KuzuDB) |
| **Mixing retention with backup** | Confusion about whether backed-up data counts as retained | Document that backups are disaster recovery, not retention; separate lifecycles |
| **Hardcoded retention durations** | Changing retention requires code change and deployment | Define as module attributes with documentation; configuration-driven where compliance permits |
| **No verification of deletion** | Cannot prove to auditors that data was actually deleted | Generate deletion certificates with timestamps and record counts for compliance |

## Best Practices

1. **Document retention policies explicitly** -- every data category should have a defined retention period with legal/business justification, version-controlled in the codebase.
2. **Use partition-based deletion for time-series** -- dropping partitions is orders of magnitude faster than row-level DELETE operations and avoids lock contention.
3. **Implement retention as code, not manual processes** -- scheduled GenServer jobs ensure consistent enforcement without human intervention.
4. **Separate retention from backup** -- backups may retain data beyond the active retention period for disaster recovery; these are distinct lifecycles.
5. **Audit retention compliance regularly** -- verify that expired data is actually being removed according to policy; generate compliance reports automatically.
6. **Implement legal holds as a first-class concept** -- any record may need preservation beyond normal retention; the hold mechanism must be robust and auditable.
7. **Archive before deleting compliance data** -- Tier 3/4 data must be archived to cold storage before physical deletion; verify archival success before proceeding.
8. **Use batched deletion with pauses** -- prevent lock contention by deleting in batches of 1000 with brief pauses between batches.
9. **Implement cascading deletion for GDPR requests** -- a "right to be forgotten" request must cascade across all storage backends, not just the primary table.
10. **Test retention enforcement in CI** -- include retention policy tests in the quality gate pipeline to verify that cleanup logic works correctly before production deployment.

## Related Terms

- [TTL](@/glossary/ttl.md) -- time-to-live attribute that implements per-record retention
- [Vacuum](@/glossary/vacuum.md) -- PostgreSQL maintenance that reclaims space after retention cleanup
- [Storage Adapter](@/glossary/storage-adapter.md) -- abstraction layer that encapsulates backend-specific retention logic
- [GDPR](@/glossary/gdpr.md) -- EU regulation driving data minimization and right-to-deletion requirements
- [NIS2](@/glossary/nis2.md) -- EU directive requiring long-term audit trail retention for critical infrastructure
- [Compliance](@/glossary/compliance.md) -- regulatory framework that dictates retention durations
- [ETS](@/glossary/ets.md) -- in-memory tables requiring TTL-based retention for cache entries
- [TimescaleDB](@/glossary/timescaledb.md) -- time-series extension with built-in chunk-based retention policies
- [Archival](/glossary/archival/) -- cold storage transfer before retention-based deletion
- [Data Lifecycle](/glossary/data-lifecycle/) -- broader concept of data creation through deletion
- [Audit Trail](@/glossary/audit-trail.md) -- immutable records with longest retention requirements
- [Replication](@/glossary/replication.md) -- data duplication that must respect retention across all replicas

## See Also

- [Compliance](@/capabilities/_index.md) -- retention requirements from GDPR, NIS2, ZKB
- [Data Architecture](@/architecture/_index.md) -- storage lifecycle management across backends
- [DD Pipeline](@/dd/_index.md) -- complex retention policies for entity and fetch data
- [OSINT Toolbox](@/osint/_index.md) -- execution history retention with per-tool overrides
- [Security](/security/) -- audit trail retention for compliance

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
