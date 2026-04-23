+++
title = "System Migration"
weight = 50
[extra]
tags = ["glossary", "architecture", "operations", "migration", "database", "zero-downtime", "Ecto", "schema-evolution", "data-transformation", "deployment"]
description = "Comprehensive guide to system migration strategies, zero-downtime database migrations, data transformation pipelines, and safe schema evolution in distributed Elixir/OTP platforms"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "advanced"
quality_score = 95
version = "2.0.0"
last_updated = "2026-02-22"
related_terms = ["acid-transactions", "data-pipeline", "ets-table", "supervision-tree", "fault-tolerance", "system-architecture", "pipeline", "quality-gate", "otp-application", "genserver", "telemetry", "performance"]
learning_outcomes = ["Design zero-downtime migration strategies for distributed Elixir systems", "Implement safe Ecto schema evolution with backward-compatible migrations", "Build data transformation pipelines for large-scale data migration", "Apply the expand-contract pattern for non-breaking schema changes", "Coordinate multi-application migrations in umbrella architectures"]
prerequisites = ["Familiarity with Ecto schemas and changesets", "Understanding of PostgreSQL DDL operations", "Basic knowledge of distributed systems coordination"]
key_concepts = ["Zero-downtime migration", "Expand-contract pattern", "Backward-compatible schema evolution", "Data transformation pipelines", "Migration verification", "Rollback strategies"]
platform_relevance = "critical"
elixir_version = "1.19+"
otp_version = "27+"
tldr = "System migration encompasses strategies and patterns for safely evolving database schemas, transforming data, and upgrading system components in distributed Elixir/OTP platforms without service interruption."
word_count = 1402
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["System", "Migration", "Comprehensive", "ElixirOTP", "glossary", "architecture", "Prismatic Platform", "Ecto"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "System Migration - Prismatic Platform"
+++

## Definition

System migration refers to the coordinated process of evolving a software system's data structures, schemas, runtime configurations, and deployed components from one state to another while preserving data integrity, maintaining service availability, and ensuring rollback capability. In distributed Elixir/OTP platforms, migration extends beyond traditional database schema changes to encompass ETS table evolution, process state transformation, supervision tree restructuring, and cross-application coordination within umbrella architectures.

Effective system migration requires treating every change as a potentially destructive operation that must be planned, tested, executed incrementally, and verified at each step. The Prismatic Platform's 115 umbrella applications and multi-database architecture (PostgreSQL, ETS, Meilisearch, KuzuDB) demand migration strategies that account for heterogeneous storage backends, inter-application dependencies, and the BEAM VM's hot code upgrade capabilities.

## Historical Context and Evolution

Database migration tooling has progressed through several generations. Early approaches relied on numbered SQL scripts executed manually by database administrators. Rails popularized the concept of versioned, reversible migrations in 2005, establishing the pattern of sequential migration files with `up` and `down` functions. This pattern was adopted by virtually every web framework, including Ecto in the Elixir ecosystem.

However, sequential migrations designed for single-database, single-application systems break down in distributed environments. Microservice architectures introduced the challenge of coordinating schema changes across multiple databases owned by different services. Event sourcing and CQRS patterns reframed migration as event replay and projection rebuilding. The expand-contract pattern emerged as the standard approach for zero-downtime schema evolution in continuously deployed systems.

Erlang/OTP introduced a unique migration dimension through hot code upgrades -- the ability to replace running code without stopping the system. OTP's `appup` and `relup` files describe how to transform process state during code upgrades, enabling truly zero-downtime system evolution. While modern Elixir deployments typically favor rolling restarts over hot code upgrades, the BEAM's capabilities inform the platform's approach to graceful state transformation.

## Platform Context

The Prismatic Platform faces migration challenges at multiple levels. At the database level, PostgreSQL schemas must evolve to support new features across 115 applications. At the storage level, ETS tables, Meilisearch indices, and KuzuDB graph schemas each require their own migration strategies. At the application level, GenServer state structures evolve between releases. At the umbrella level, migrations must be coordinated across applications with complex dependency relationships.

The platform's migration strategy is governed by two principles from the NO MERCY, NO DOUBTS doctrine. First, every migration must be reversible -- there is no "we'll fix it in the next release." Second, every migration must be verified -- no unvalidated claims about data integrity.

The PrismaticSupervisor's dependency-aware startup ensures that migrations execute in the correct topological order, respecting inter-application dependencies. The Quality Gate system (`mix quality.gates`) includes migration verification as a blocking gate -- no deployment proceeds until migration correctness is confirmed.

## Zero-Downtime Migration Strategies

Zero-downtime migration eliminates service interruption during schema and data evolution. This requires that the application code is compatible with both the old and new schema simultaneously during the migration window.

### The Expand-Contract Pattern

The expand-contract pattern splits every breaking schema change into three phases: expand (add new structures alongside old), migrate (copy/transform data), and contract (remove old structures). Each phase is deployed independently, ensuring backward compatibility at every step.

```elixir
defmodule Prismatic.Migration.ExpandContract do
  @moduledoc """
  Implements the expand-contract migration pattern for zero-downtime
  schema evolution. Each migration phase is independently deployable
  and reversible, ensuring backward compatibility throughout the
  migration window.

  Phase 1 (Expand): Add new column/table alongside existing
  Phase 2 (Migrate): Backfill data from old to new structure
  Phase 3 (Contract): Remove old column/table after verification
  """

  @type phase :: :expand | :migrate | :contract
  @type migration_state :: %{
          name: String.t(),
          current_phase: phase(),
          started_at: DateTime.t(),
          phases_completed: [phase()],
          verification_results: map()
        }

  @spec execute_phase(migration_state(), phase()) ::
          {:ok, migration_state()} | {:error, term()}
  def execute_phase(state, phase) do
    with :ok <- verify_prerequisites(state, phase),
         {:ok, result} <- run_phase(state, phase),
         :ok <- verify_phase_result(state, phase, result) do
      new_state = %{
        state
        | current_phase: next_phase(phase),
          phases_completed: [phase | state.phases_completed],
          verification_results: Map.put(state.verification_results, phase, result)
      }

      :telemetry.execute(
        [:prismatic, :migration, :phase_complete],
        %{duration_ms: DateTime.diff(DateTime.utc_now(), state.started_at, :millisecond)},
        %{name: state.name, phase: phase}
      )

      {:ok, new_state}
    end
  end

  defp verify_prerequisites(state, :expand) do
    if Enum.empty?(state.phases_completed), do: :ok, else: {:error, :expand_already_done}
  end

  defp verify_prerequisites(state, :migrate) do
    if :expand in state.phases_completed, do: :ok, else: {:error, :expand_not_complete}
  end

  defp verify_prerequisites(state, :contract) do
    if :migrate in state.phases_completed, do: :ok, else: {:error, :migrate_not_complete}
  end

  defp run_phase(_state, phase) do
    {:ok, %{phase: phase, completed_at: DateTime.utc_now()}}
  end

  defp verify_phase_result(_state, _phase, _result), do: :ok

  defp next_phase(:expand), do: :migrate
  defp next_phase(:migrate), do: :contract
  defp next_phase(:contract), do: :complete
end
```

### Ecto Migration Best Practices

Ecto migrations in the Prismatic Platform follow strict conventions for zero-downtime safety.

```elixir
defmodule Prismatic.Repo.Migrations.AddSecurityRatingToAssets do
  @moduledoc """
  Expand phase: adds security_rating column to assets table.
  This migration is backward-compatible -- existing code continues
  to work because the new column has a default value and existing
  queries do not reference it.

  Follows zero-downtime migration rules:
  - No column renames (breaks existing queries)
  - No NOT NULL without default (fails for existing rows)
  - No table locks (CREATE INDEX CONCURRENTLY)
  - No data transformation in DDL migration
  """

  use Ecto.Migration

  @disable_ddl_transaction true
  @disable_migration_lock true

  def up do
    alter table(:assets) do
      add :security_rating, :string, default: "unrated"
      add :rating_score, :integer, default: 0
      add :rated_at, :utc_datetime_usec
    end

    create index(:assets, [:security_rating], concurrently: true)
    create index(:assets, [:rating_score], concurrently: true)
  end

  def down do
    drop_if_exists index(:assets, [:rating_score])
    drop_if_exists index(:assets, [:security_rating])

    alter table(:assets) do
      remove :rated_at
      remove :rating_score
      remove :security_rating
    end
  end
end
```

Key rules enforced by the platform's migration linter: never rename columns (add new, migrate data, drop old); never add NOT NULL constraints without defaults; always use `CREATE INDEX CONCURRENTLY` (via `@disable_ddl_transaction true`); never mix DDL and DML in the same migration; always provide reversible `down` functions.

## Data Transformation Pipelines

Large-scale data migration requires structured transformation pipelines that process records in batches, handle failures gracefully, and provide progress visibility.

### Batch Processing with Backpressure

```elixir
defmodule Prismatic.Migration.DataTransformer do
  @moduledoc """
  Batch data transformation pipeline with backpressure control,
  progress tracking, and failure isolation. Processes records in
  configurable batches to avoid overwhelming the database or
  consuming excessive memory.
  """

  require Logger

  @type transform_fn :: (map() -> {:ok, map()} | {:error, term()})
  @type batch_result :: %{
          processed: non_neg_integer(),
          failed: non_neg_integer(),
          errors: [map()],
          duration_ms: non_neg_integer()
        }

  @spec transform_in_batches(Ecto.Queryable.t(), transform_fn(), keyword()) ::
          {:ok, batch_result()} | {:error, term()}
  def transform_in_batches(queryable, transform_fn, opts \\ []) do
    batch_size = Keyword.get(opts, :batch_size, 1_000)
    repo = Keyword.get(opts, :repo, Prismatic.Repo)
    max_failures = Keyword.get(opts, :max_failures, 100)

    start_time = System.monotonic_time(:millisecond)

    result = do_transform(queryable, transform_fn, %{
      repo: repo,
      batch_size: batch_size,
      max_failures: max_failures,
      last_id: 0,
      processed: 0,
      failed: 0,
      errors: []
    })

    duration = System.monotonic_time(:millisecond) - start_time

    case result do
      {:ok, state} ->
        final = %{
          processed: state.processed,
          failed: state.failed,
          errors: Enum.take(state.errors, 50),
          duration_ms: duration
        }

        :telemetry.execute(
          [:prismatic, :migration, :transform_complete],
          %{processed: final.processed, failed: final.failed, duration_ms: duration},
          %{}
        )

        {:ok, final}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp do_transform(queryable, transform_fn, state) do
    import Ecto.Query

    batch =
      queryable
      |> where([r], r.id > ^state.last_id)
      |> order_by([r], asc: r.id)
      |> limit(^state.batch_size)
      |> state.repo.all()

    case batch do
      [] ->
        {:ok, state}

      records ->
        new_state =
          Enum.reduce(records, state, fn record, acc ->
            case transform_fn.(record) do
              {:ok, _transformed} ->
                %{acc | processed: acc.processed + 1}

              {:error, reason} ->
                error = %{id: record.id, reason: reason}
                %{acc | failed: acc.failed + 1, errors: [error | acc.errors]}
            end
          end)

        if new_state.failed >= state.max_failures do
          {:error, {:max_failures_exceeded, new_state.failed}}
        else
          last_record = List.last(records)

          Logger.info(
            "Migration progress: #{new_state.processed} processed, " <>
              "#{new_state.failed} failed, last_id=#{last_record.id}"
          )

          new_state = %{new_state | last_id: last_record.id}

          Process.sleep(10)

          do_transform(queryable, transform_fn, new_state)
        end
    end
  end
end
```

## ETS Table Migration

ETS tables present unique migration challenges because they exist only in memory and lack built-in schema versioning. The Prismatic Platform addresses this through versioned ETS schemas and atomic table swaps.

### Atomic Table Swap Pattern

The atomic table swap pattern creates a new ETS table with the updated schema, populates it from the old table with data transformation applied, and atomically swaps the table names. This ensures that readers always see a consistent view -- either entirely old schema or entirely new schema, never a mix.

```elixir
defmodule Prismatic.Migration.ETSMigrator do
  @moduledoc """
  Migrates ETS table schemas using atomic table swap pattern.
  Creates new table, transforms data, swaps atomically.
  Ensures readers see consistent schema at all times.
  """

  require Logger

  @type migration_opts :: [
          transform: (tuple() -> tuple()),
          verify: (atom() -> boolean()),
          timeout: non_neg_integer()
        ]

  @spec migrate_table(atom(), migration_opts()) :: :ok | {:error, term()}
  def migrate_table(table_name, opts) do
    transform_fn = Keyword.fetch!(opts, :transform)
    verify_fn = Keyword.get(opts, :verify, fn _ -> true end)
    temp_name = :"#{table_name}_migration_temp"

    with :ok <- create_temp_table(temp_name, table_name),
         :ok <- transform_records(table_name, temp_name, transform_fn),
         true <- verify_fn.(temp_name),
         :ok <- swap_tables(table_name, temp_name) do
      Logger.info("ETS migration complete for #{table_name}")

      :telemetry.execute(
        [:prismatic, :migration, :ets_complete],
        %{table: table_name},
        %{}
      )

      :ok
    else
      false -> {:error, :verification_failed}
      {:error, reason} -> {:error, reason}
    end
  end

  defp create_temp_table(temp_name, source_name) do
    info = :ets.info(source_name)
    type = Keyword.get(info, :type, :set)
    protection = Keyword.get(info, :protection, :public)

    :ets.new(temp_name, [type, protection, :named_table])
    :ok
  rescue
    ArgumentError -> {:error, :table_creation_failed}
  end

  defp transform_records(source, target, transform_fn) do
    :ets.foldl(
      fn record, :ok ->
        transformed = transform_fn.(record)
        :ets.insert(target, transformed)
        :ok
      end,
      :ok,
      source
    )
  end

  defp swap_tables(original, temp) do
    :ets.rename(original, :"#{original}_old")
    :ets.rename(temp, original)
    :ets.delete(:"#{original}_old")
    :ok
  rescue
    ArgumentError -> {:error, :swap_failed}
  end
end
```

## Multi-Application Migration Coordination

In umbrella architectures like the Prismatic Platform, migrations often span multiple applications. A change to a shared schema may require coordinated migrations across several applications that depend on it.

### Dependency-Aware Migration Orchestration

The platform's migration orchestrator resolves the dependency graph between applications and executes migrations in topological order. If application B depends on application A, A's migrations run first. If migrations are independent, they execute in parallel for speed.

This orchestration integrates with the PrismaticSupervisor's dependency resolver, reusing the same DAG that governs application startup order. The migration orchestrator also coordinates with the Quality Gate system to verify that each application's migrations pass before proceeding to dependent applications.

## Rollback Strategies

Every migration must have a tested rollback path. The Prismatic Platform implements three rollback strategies depending on the migration type.

**DDL rollback** reverses structural changes through Ecto's `down/0` function. Every `up/0` migration must have a corresponding `down/0` that restores the previous schema state.

**Data rollback** is more complex because data transformation may not be perfectly reversible. The platform addresses this through pre-migration snapshots for critical tables and event-sourced change logs that record every transformation applied.

**State rollback** handles GenServer and ETS state changes through versioned state schemas and state transformation functions that can operate in both directions (upgrade and downgrade).

## Migration Verification and Testing

The NO MERCY doctrine requires that every migration is verified through automated testing before production execution.

### Migration Test Framework

Migration tests execute the `up` migration, verify the schema is correct, run application tests against the new schema, execute the `down` migration, verify the schema is restored, and run application tests against the original schema. This round-trip verification ensures that both migration directions work correctly and that the application functions correctly with both schemas.

### Production Migration Monitoring

During production migration execution, the platform monitors several health indicators: lock wait times (alerts if any query waits more than 5 seconds for a lock), replication lag (pauses migration if replicas fall behind), error rates (aborts migration if error rate exceeds baseline by more than 1%), and table bloat (monitors dead tuple accumulation and triggers VACUUM if needed).

## Common Migration Pitfalls

Several migration anti-patterns cause production incidents. **Long-running transactions** hold locks for extended periods, blocking all other queries on the affected tables. The solution is to break migrations into small, independent transactions. **Missing indexes on new columns** causes full table scans when queries reference new columns. The solution is to always add indexes in the expand phase. **Data-dependent DDL** mixes schema changes with data queries in a single transaction, risking lock contention and timeouts. The solution is to separate DDL migrations from DML data transformations. **Irreversible migrations** without rollback capability leave the system in a state where the only recovery option is restoring from backup. The solution is to always implement and test `down/0` functions.

## Case Study: Prismatic Perimeter Security Rating Migration

The Prismatic Perimeter EASM module required migrating its asset database from simple boolean vulnerability flags to a comprehensive security rating system with A-F grades, numeric scores (300-900), and compliance assessments. This migration demonstrates the expand-contract pattern in practice.

Phase 1 (Expand) added `security_rating`, `rating_score`, and `rated_at` columns with sensible defaults, deployed alongside existing code that ignored the new columns. Phase 2 (Migrate) ran a batch data transformer that computed security ratings from existing vulnerability data, processing 10,000 assets in batches of 500 with telemetry-tracked progress. Phase 3 (Contract) deployed the new UI that displays security ratings, and after a verification period, removed the legacy boolean vulnerability columns.

The entire migration completed with zero downtime, zero data loss, and full rollback capability at each phase.

## Related Terms

- [ACID Transactions](@/glossary/acid-transactions.md) -- transactional guarantees during migration operations
- [Data Pipeline](@/glossary/data-pipeline.md) -- pipeline patterns used in data transformation
- [ETS Table](@/glossary/ets-table.md) -- in-memory storage requiring specialized migration
- [Supervision Tree](@/glossary/supervision-tree.md) -- supervision hierarchy for migration processes
- [Fault Tolerance](@/glossary/fault-tolerance.md) -- resilience during migration failures
- [System Architecture](@/glossary/system-architecture.md) -- architectural context for migration planning
- [Pipeline](@/glossary/pipeline.md) -- pipeline execution patterns for batch migration
- [Quality Gate](@/glossary/quality-gate.md) -- verification gates for migration correctness
- [OTP Application](@/glossary/otp-application.md) -- application-level migration coordination
- [Telemetry](@/glossary/telemetry.md) -- migration progress monitoring
- [Performance](@/glossary/performance.md) -- performance impact management during migration

## Further Reading

- Percona. "Zero-Downtime Schema Changes in PostgreSQL." Percona Blog.
- Sadalage, Pramod J., and Martin Fowler. "Evolutionary Database Design." martinfowler.com.
- Ecto documentation on migrations: https://hexdocs.pm/ecto_sql/Ecto.Migration.html
- Braintree. "Safe Operations for High-Volume PostgreSQL." Braintree Blog.
- Erlang/OTP documentation on release handling: https://www.erlang.org/doc/design_principles/release_handling

---

*Built with precision. Ready for the future.*

**[Prismatic Platform](https://github.com/korczis/prismatic-platform)** by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
