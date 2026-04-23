+++
title = "Rollback"
weight = 50

[extra]
description = "The process of reverting a system, database, or deployment to a previous known-good state when a change introduces errors, data corruption, or unacceptable behavior -- a critical safety mechanism that must be deliberately designed into every layer of the platform."
category = "architecture"
domain = "infrastructure"
complexity = "intermediate-advanced"
stability = "stable"
beam_related = true
related_terms = ["schema-migration", "replication", "rpo", "rto", "wal", "release", "blue-green-deployment", "ecto", "transaction", "supervision-tree", "hot-code-upgrade", "idempotent"]
tags = ["rollback", "deployment", "migration", "recovery", "database", "revert", "ecto", "fly-io", "transaction", "disaster-recovery", "ci-cd", "nwb"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Rollback capability requires forward planning -- every migration must have a reverse, every deployment must be revertible, and every release must preserve backward compatibility. In the Prismatic Platform, the NWB (No Way Back) doctrine creates deliberate tension: permanent solutions are preferred, but safe rollback paths remain mandatory for operational resilience."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Rollback", "deployment", "migration", "recovery", "glossary", "Prismatic Platform", "Ecto", "PostgreSQL", "MVCC", "blue-green", "Fly.io", "NWB doctrine", "disaster recovery"]
image = "/images/sections/glossary.png"
image_alt = "Rollback - Prismatic Platform"
word_count = 3400
see_also = ["architecture", "capabilities", "infrastructure"]
+++

## Definition

A **rollback** is the process of reverting changes to restore a system to a previously known-good state. Rollbacks apply at multiple levels of a software system: database schema rollbacks undo migrations, application rollbacks redeploy a previous release version, transaction rollbacks discard uncommitted changes within a single database operation, and configuration rollbacks revert settings to their prior values. The ability to rollback safely and predictably is a fundamental prerequisite for deploying changes with confidence, enabling teams to move fast without permanently breaking production systems.

Rollback capability is never automatic -- it must be deliberately designed and tested at every layer. Database migrations must include `down/0` functions that correctly reverse the `up/0` changes. Deployment pipelines must retain previous release artifacts and support rapid redeployment. Configuration changes must be versioned and reversible. Transaction isolation levels must be chosen to ensure consistency during partial failures. Without deliberate rollback design, the only recovery option is forward-fixing under pressure -- a high-risk, high-stress situation that compounds the original failure with human error.

In the Prismatic Platform, rollback occupies a nuanced position relative to the **NWB (No Way Back)** doctrine. NWB mandates permanent, forward-only solutions for architecture and code evolution. However, operational rollback capability for deployments and database state remains mandatory -- the doctrine distinguishes between architectural regression (prohibited) and operational recovery (required). A migration that adds a new capability should be permanent; a deployment that introduces a bug must be revertible.

## Core Concepts

### Rollback Taxonomy

| Rollback Type | Scope | Mechanism | Time to Execute | Data Loss Risk |
|---------------|-------|-----------|-----------------|----------------|
| **Transaction** | Single operation | PostgreSQL MVCC | Microseconds | None |
| **Schema Migration** | Database structure | `mix ecto.rollback` | Seconds-minutes | Possible (lossy transforms) |
| **Data Migration** | Row-level changes | Custom reverse scripts | Minutes-hours | High (irreversible transforms) |
| **Application** | Running code | Blue-green deploy | 10-30 seconds | None |
| **Configuration** | Runtime settings | Config revert + restart | Seconds | None |
| **Infrastructure** | Entire stack | Terraform/IaC rollback | Minutes | None (if stateless) |

### Rollback vs. Forward-Fix Decision Matrix

| Scenario | Preferred Strategy | Rationale |
|----------|-------------------|-----------|
| Critical data corruption | Rollback immediately | Every second increases damage scope |
| Performance degradation (>50%) | Rollback, then investigate | Users impacted; fix under pressure is risky |
| Minor UI regression | Forward-fix | Rollback cost exceeds fix cost |
| Security vulnerability introduced | Rollback immediately | Exposure window must be minimized |
| Partial feature breakage | Feature flag disable | Surgical; avoids full rollback side effects |
| Database migration failure mid-way | Transaction rollback + manual | Partial migrations are the hardest scenario |

### NWB Doctrine Tension

| NWB Principle | Rollback Reality | Resolution |
|---------------|-----------------|------------|
| Permanent solutions only | Deployments must be revertible | NWB applies to architecture, not operations |
| No backwards compatibility | Old releases must work with current DB | Migration `down/0` must maintain compatibility window |
| Forward-only evolution | Bugs require going back | Rollback is forward -- it moves to a known-good state |
| No rollback scenarios | Production incidents require recovery | NWB prohibits design-for-rollback; requires design-for-resilience |

## Technical Deep Dive

### Database Rollbacks with Ecto

Database rollbacks in Ecto use the migration system. Each migration module defines `up/0` (apply the change) and `down/0` (reverse the change). Running `mix ecto.rollback` executes the `down/0` function of the most recently applied migration, recorded in the `schema_migrations` table. The `-n` flag allows rolling back multiple migrations: `mix ecto.rollback -n 3` reverses the last three.

For complex migrations that involve data transformation, the `down/0` function may be **lossy** -- adding a column is trivially reversible, but splitting a column's data into two new columns cannot be perfectly reversed because the merge logic is ambiguous. The Prismatic Platform's migration policy requires that lossy `down/0` functions include a `Logger.warning/1` call documenting what data fidelity is lost, so operators are never surprised.

Ecto migrations run inside a database transaction by default (PostgreSQL supports transactional DDL). If the migration fails partway through, the entire migration is rolled back atomically. However, certain DDL operations in PostgreSQL cannot run inside a transaction (e.g., `CREATE INDEX CONCURRENTLY`), requiring the `@disable_ddl_transaction true` module attribute. These non-transactional migrations are inherently riskier because partial application cannot be automatically reversed.

### Application Rollbacks on Fly.io

Application rollbacks on Fly.io use `fly deploy --image <previous-image>` to redeploy the previous container image. The platform maintains references to the last 5 release images, enabling rapid rollback without rebuilding from source. The `fly releases` command lists available rollback targets with timestamps and deployment status.

BEAM hot code upgrades support rollback through OTP release handlers and the `:release_handler.install_release/1` mechanism. However, hot code rollback is fragile in practice -- processes holding state in the old format may crash when the old code module is purged. The Prismatic Platform uses blue-green deployment for safer rollbacks: the previous version runs alongside the new one, and traffic is switched atomically at the load balancer level.

The deployment pipeline includes a **rollback verification step**: before promoting a new release to production, the CI/CD system verifies that rolling back to the previous release produces a healthy system. This catches scenarios where a new migration makes the old code incompatible with the database state.

### Transaction-Level Rollbacks

Transaction-level rollbacks are handled by PostgreSQL's MVCC (Multi-Version Concurrency Control). Each transaction sees a consistent snapshot of the database, and uncommitted changes are invisible to other transactions. Ecto's `Repo.transaction/2` automatically rolls back if the function returns `{:error, _}` or raises an exception, leaving the database unchanged.

Multi-step operations that span multiple Ecto changesets should use `Ecto.Multi` for coordinated transaction management. `Ecto.Multi` collects multiple operations into a single transaction, rolling back all of them if any step fails. This is critical for operations like "create entity + create relationships + update case status" where partial completion would leave the database in an inconsistent state.

### Savepoints and Nested Transactions

PostgreSQL supports savepoints within transactions, allowing partial rollback without aborting the entire transaction. Ecto exposes this through nested `Repo.transaction/2` calls, which create savepoints rather than new transactions. This pattern is useful for operations where some steps are optional -- a failed optional step rolls back to the savepoint while the outer transaction continues.

### WAL and Point-in-Time Recovery

PostgreSQL's Write-Ahead Log (WAL) enables point-in-time recovery (PITR), allowing the database to be restored to any moment in time. This is the ultimate rollback mechanism for catastrophic failures -- restore from the last base backup and replay WAL segments up to the moment before the failure. Fly.io's managed PostgreSQL handles WAL archiving and base backup scheduling automatically, with a configurable retention window.

## Usage in Prismatic Platform

The platform's deployment pipeline maintains the last 5 release artifacts on Fly.io, enabling rapid rollback without rebuilding. The CI/CD pipeline includes rollback verification -- every deployment is tested for clean rollback before being promoted to production. The `just production-recover` command automates the rollback process, including health check verification after the rollback completes.

Schema migrations in the DD pipeline (`dd_entities`, `dd_relationships`, `dd_cases`, `dd_entity_attributes`) always include `down/0` functions that reverse the schema change. The pre-commit hook verifies that all new migrations have both `up/0` and `down/0` defined. Migrations that modify existing data (as opposed to adding new structures) require an additional review step documented in the migration's `@moduledoc`.

The platform's feature flag system (`PrismaticConfig`) provides a lightweight alternative to full rollbacks for feature-level issues. Disabling a feature flag instantly removes a feature from the user experience without reverting code or database changes, buying time for a proper fix without the blast radius of a full deployment rollback.

Transaction rollbacks protect all multi-step operations in the DD investigation pipeline. Creating a new DD case with entities, relationships, and initial scoring uses `Ecto.Multi` to ensure atomicity -- if scoring engine initialization fails, the entire case creation rolls back rather than leaving orphaned entities.

## Code Examples

```elixir
defmodule PrismaticDd.Repo.Migrations.AddEntityAttributes do
  @moduledoc """
  Adds the dd_entity_attributes table for storing key-value metadata
  on DD entities. Fully reversible -- dropping the table loses all
  attribute data, which is acceptable because attributes are derived
  from source documents and can be re-extracted.

  ## Rollback Impact

  Rolling back this migration deletes all entity attribute records.
  Source documents remain intact, so attributes can be re-derived
  by re-running the extraction pipeline.
  """

  use Ecto.Migration

  def up do
    create table(:dd_entity_attributes, primary_key: false) do
      add :id, :binary_id, primary_key: true

      add :entity_id,
          references(:dd_entities, type: :binary_id, on_delete: :delete_all),
          null: false

      add :key, :string, null: false
      add :value, :jsonb
      add :source, :string

      timestamps(type: :utc_datetime_usec)
    end

    create index(:dd_entity_attributes, [:entity_id])
    create unique_index(:dd_entity_attributes, [:entity_id, :key, :source])
  end

  def down do
    drop_if_exists index(:dd_entity_attributes, [:entity_id, :key, :source])
    drop_if_exists index(:dd_entity_attributes, [:entity_id])
    drop_if_exists table(:dd_entity_attributes)
  end
end
```

```elixir
defmodule PrismaticStorage.SafeTransaction do
  @moduledoc """
  Wraps operations in transactions with automatic rollback on failure.

  Provides a consistent interface for transactional operations across
  the platform, ensuring that multi-step mutations either fully succeed
  or fully roll back with no partial state changes.

  ## Usage

      SafeTransaction.execute(Repo, fn ->
        with {:ok, entity} <- create_entity(params),
             {:ok, _rel} <- create_relationship(entity, target) do
          {:ok, entity}
        end
      end)
  """

  require Logger

  @doc """
  Executes a function within a database transaction.

  Returns `{:ok, result}` if the function returns `{:ok, result}`,
  or `{:error, reason}` if the function returns `{:error, reason}`
  (triggering an automatic rollback).

  ## Examples

      iex> SafeTransaction.execute(Repo, fn -> {:ok, 42} end)
      {:ok, 42}

      iex> SafeTransaction.execute(Repo, fn -> {:error, :not_found} end)
      {:error, :not_found}
  """
  @spec execute(Ecto.Repo.t(), (() -> {:ok, term()} | {:error, term()})) ::
          {:ok, term()} | {:error, term()}
  def execute(repo, fun) do
    repo.transaction(fn ->
      case fun.() do
        {:ok, result} ->
          result

        {:error, reason} ->
          Logger.warning("Transaction rolled back",
            reason: inspect(reason),
            repo: inspect(repo)
          )

          repo.rollback(reason)
      end
    end)
  end
end
```

```elixir
defmodule PrismaticDd.CaseCreator do
  @moduledoc """
  Creates DD investigation cases with full transactional integrity.

  Uses `Ecto.Multi` to coordinate multi-step case creation,
  ensuring atomic rollback if any step fails. This prevents
  orphaned entities or incomplete case state.
  """

  alias Ecto.Multi
  alias PrismaticDd.{Case, Entity, Relationship}
  alias PrismaticDd.Repo

  require Logger

  @doc """
  Creates a new DD case with associated entities and relationships.

  All operations execute within a single database transaction.
  If any step fails, the entire creation rolls back atomically.

  ## Examples

      iex> CaseCreator.create(%{
      ...>   name: "Project Alpha",
      ...>   entities: [%{name: "Corp A", type: :company}],
      ...>   relationships: []
      ...> })
      {:ok, %{case: %Case{}, entities: [%Entity{}]}}
  """
  @spec create(map()) :: {:ok, map()} | {:error, atom(), term(), map()}
  def create(params) do
    Multi.new()
    |> Multi.insert(:case, Case.changeset(%Case{}, params))
    |> Multi.run(:entities, fn repo, %{case: case} ->
      create_entities(repo, case, params[:entities] || [])
    end)
    |> Multi.run(:relationships, fn repo, %{case: case, entities: entities} ->
      create_relationships(repo, case, entities, params[:relationships] || [])
    end)
    |> Repo.transaction()
    |> case do
      {:ok, result} ->
        Logger.info("DD case created successfully",
          case_id: result.case.id,
          entity_count: length(result.entities)
        )

        {:ok, result}

      {:error, step, changeset, _completed} ->
        Logger.warning("DD case creation rolled back",
          failed_step: step,
          errors: inspect(changeset.errors)
        )

        {:error, step, changeset, %{}}
    end
  end

  @spec create_entities(Ecto.Repo.t(), Case.t(), list(map())) ::
          {:ok, list(Entity.t())} | {:error, term()}
  defp create_entities(_repo, _case, []), do: {:ok, []}

  defp create_entities(repo, case, entity_params) do
    entities =
      Enum.map(entity_params, fn params ->
        %Entity{}
        |> Entity.changeset(Map.put(params, :case_id, case.id))
        |> repo.insert!()
      end)

    {:ok, entities}
  end

  @spec create_relationships(Ecto.Repo.t(), Case.t(), list(Entity.t()), list(map())) ::
          {:ok, list(Relationship.t())} | {:error, term()}
  defp create_relationships(_repo, _case, _entities, []), do: {:ok, []}

  defp create_relationships(repo, case, _entities, rel_params) do
    relationships =
      Enum.map(rel_params, fn params ->
        %Relationship{}
        |> Relationship.changeset(Map.put(params, :case_id, case.id))
        |> repo.insert!()
      end)

    {:ok, relationships}
  end
end
```

```elixir
defmodule PrismaticInfra.DeploymentRollback do
  @moduledoc """
  Coordinates application rollback procedures for the Prismatic Platform.

  Manages rollback state tracking, health verification after rollback,
  and integration with the Fly.io deployment infrastructure.
  """

  require Logger

  @type rollback_result :: {:ok, map()} | {:error, String.t()}
  @type release_info :: %{version: String.t(), image: String.t(), deployed_at: DateTime.t()}

  @doc """
  Determines whether a rollback is recommended based on health metrics.

  Returns `{:rollback, reason}` if metrics indicate degradation,
  or `:healthy` if the current deployment is operating normally.

  ## Examples

      iex> DeploymentRollback.assess_rollback_need(%{error_rate: 0.15})
      {:rollback, "Error rate 15.0% exceeds 5% threshold"}

      iex> DeploymentRollback.assess_rollback_need(%{error_rate: 0.01})
      :healthy
  """
  @spec assess_rollback_need(map()) :: {:rollback, String.t()} | :healthy
  def assess_rollback_need(metrics) do
    cond do
      metrics.error_rate > 0.05 ->
        {:rollback, "Error rate #{Float.round(metrics.error_rate * 100, 1)}% exceeds 5% threshold"}

      Map.get(metrics, :p99_latency_ms, 0) > 1000 ->
        {:rollback, "P99 latency #{metrics.p99_latency_ms}ms exceeds 1000ms threshold"}

      Map.get(metrics, :health_check_failures, 0) > 3 ->
        {:rollback, "#{metrics.health_check_failures} consecutive health check failures"}

      true ->
        :healthy
    end
  end

  @doc """
  Executes post-rollback health verification.

  Runs a sequence of health checks to confirm the rolled-back
  version is operating correctly.
  """
  @spec verify_rollback_health(String.t()) :: {:ok, map()} | {:error, String.t()}
  def verify_rollback_health(release_version) do
    checks = [
      {:endpoint_health, &check_endpoint_health/0},
      {:database_connectivity, &check_database/0},
      {:critical_services, &check_critical_services/0}
    ]

    results =
      Enum.map(checks, fn {name, check_fn} ->
        {name, check_fn.()}
      end)

    failures = Enum.filter(results, fn {_name, result} -> result != :ok end)

    if failures == [] do
      Logger.info("Rollback health verification passed",
        release: release_version,
        checks_passed: length(results)
      )

      {:ok, %{release: release_version, status: :healthy, checks: results}}
    else
      Logger.error("Rollback health verification failed",
        release: release_version,
        failures: inspect(failures)
      )

      {:error, "Health verification failed: #{inspect(failures)}"}
    end
  end

  @spec check_endpoint_health() :: :ok | {:error, term()}
  defp check_endpoint_health, do: :ok

  @spec check_database() :: :ok | {:error, term()}
  defp check_database, do: :ok

  @spec check_critical_services() :: :ok | {:error, term()}
  defp check_critical_services, do: :ok
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Missing `down/0` function | Migration cannot be reversed; only forward-fix is possible | Enforce `down/0` in pre-commit hook; reject migrations without it |
| Lossy `down/0` without documentation | Data silently lost during rollback; operators unaware | Require `Logger.warning/1` in lossy `down/0` documenting data loss |
| Non-transactional DDL in migration | Partial migration on failure; database in inconsistent state | Use `@disable_ddl_transaction true` only when necessary; add manual cleanup in `down/0` |
| Schema rollback with incompatible code | Old code cannot read new schema; crash loop after rollback | Test rollback compatibility in CI; maintain one-version-back compatibility window |
| Rollback without artifact retention | Previous release image garbage-collected; cannot redeploy | Retain at least 5 release artifacts; configure Fly.io retention policy |
| Nested transaction confusion | Inner failure rolls back only to savepoint, not outer transaction | Understand Ecto's nested transaction behavior; use `Ecto.Multi` for complex flows |
| Rollback during active traffic | Requests in flight fail during version switch | Use blue-green deployment; drain connections before switching |
| Ignoring rollback in CI | Rollback path untested; fails when actually needed | Include `mix ecto.rollback` step in CI pipeline; test both directions |
| Data migration without reverse script | Row-level data changes cannot be undone | Write explicit reverse data migration scripts; store pre-migration snapshots |
| Conflating NWB with no-rollback | Refusing to build rollback capability citing doctrine | NWB applies to architecture permanence, not operational recovery |

## Best Practices

1. **Write `down/0` for every migration** -- migrations without rollback capability are a deployment risk; the pre-commit hook blocks migrations missing `down/0`.

2. **Test rollbacks in staging** -- run `mix ecto.rollback` in staging before deploying to production; verify the application starts correctly after rollback.

3. **Keep releases reversible for one version** -- avoid breaking changes that make the previous version incompatible with the current database state; maintain a one-version compatibility window.

4. **Use `Ecto.Multi` for atomic operations** -- multi-step operations should either fully succeed or fully rollback; never leave the database in a half-committed state.

5. **Maintain rollback artifacts** -- keep previous deployment images and release artifacts accessible for rapid recovery; configure Fly.io to retain at least 5 releases.

6. **Document lossy rollbacks explicitly** -- when `down/0` cannot perfectly reverse `up/0`, log a warning and document what data fidelity is lost.

7. **Prefer feature flags over full rollbacks** -- for feature-level issues, disable the feature flag rather than rolling back the entire deployment.

8. **Verify health after every rollback** -- a rollback is not complete until health checks pass; use `just post-deploy-validate` to confirm.

9. **Never rollback under time pressure without a runbook** -- document rollback procedures for every service; practiced rollbacks are fast rollbacks.

10. **Separate schema migrations from data migrations** -- schema changes (DDL) are cleanly reversible; data changes (DML) often are not. Keep them in separate migration files.

## Related Terms

- [Schema Migration](@/glossary/schema-migration.md) -- the mechanism through which database rollbacks are implemented
- [WAL](@/glossary/wal.md) -- the write-ahead log that enables transaction-level rollback and point-in-time recovery
- [RPO](@/glossary/rpo.md) -- recovery point objective that rollback timing determines; how much data can be lost
- [RTO](@/glossary/rto.md) -- recovery time objective that rollback speed directly affects
- [Release](@/glossary/release.md) -- OTP releases that package application code for deployment and rollback
- [Blue-Green Deployment](@/glossary/blue-green-deployment.md) -- deployment strategy enabling instant rollback via traffic switching
- [Ecto](@/glossary/ecto.md) -- the database wrapper providing migration and transaction rollback primitives
- [Transaction](/glossary/transaction/) -- atomic database operations with automatic rollback on failure
- [Idempotent](/glossary/idempotent/) -- operations safe to retry after rollback without side effects
- [Replication](@/glossary/replication.md) -- database replication enabling failover as an alternative to rollback
- [Supervision Tree](@/glossary/supervision-tree.md) -- BEAM's process-level automatic recovery mechanism
- [Hot Code Upgrade](@/glossary/hot-code-upgrade.md) -- BEAM's in-place code replacement as an alternative to deployment rollback

## See Also

- [Deployment Pipeline](@/architecture/_index.md) -- CI/CD rollback procedures and artifact retention
- [Database Migrations](@/capabilities/_index.md) -- migration rollback patterns and testing strategies
- [NWB Doctrine](/glossary/nwb/) -- the permanent solution doctrine and its interaction with rollback
- [Disaster Recovery](@/architecture/_index.md) -- comprehensive recovery planning including PITR
- [Fly.io Deployment](https://fly.io/docs/apps/deploy/) -- platform-specific rollback commands
- [Ecto.Multi documentation](https://hexdocs.pm/ecto/Ecto.Multi.html) -- coordinated transaction management

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
