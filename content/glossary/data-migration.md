+++
title = "Data Migration"
weight = 50

[extra]
description = "Process of transferring data between storage systems, formats, or schemas while preserving integrity, consistency, and completeness through validated transformation pipelines."
category = "data"
related_terms = ["ecto", "database", "etl", "data-pipeline", "adapter-pattern", "data-quality", "deployment"]
tags = ["glossary", "data-migration", "ecto", "database", "schema", "etl", "deployment"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
difficulty = "intermediate"
quality_score = 84
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Ecto migrations provide versioned, reversible, and team-safe schema evolution with compile-time validation, forming the backbone of the Prismatic Platform's multi-database data migration strategy."
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["Data Migration", "Ecto", "schema", "database", "glossary", "Prismatic Platform", "ETL"]
image = "/images/sections/glossary.png"
image_alt = "Data Migration - Prismatic Platform"
word_count = 920
see_also = ["technologies", "architecture", "apps"]
+++

## Definition

Data migration is the process of transferring data between storage systems, formats, or database schemas while preserving data integrity, consistency, and completeness. Migrations encompass schema migrations (changing database table structures), data transformations (converting data formats or enriching records), storage migrations (moving data between backend technologies), and bulk imports (loading data from external sources). Effective migration strategies are versioned, reversible, idempotent, and validated at every stage.

In the Elixir ecosystem, Ecto migrations provide a first-class mechanism for database schema evolution, offering timestamped versioning, up/down reversibility, and SQL generation from Elixir DSL expressions.

## Technical Deep Dive

Data migrations in production systems must handle several challenges simultaneously.

| Challenge | Mitigation | Prismatic Approach |
|-----------|-----------|-------------------|
| **Downtime** | Rolling migrations, blue-green deploys | Ecto migrations + Fly.io rolling deploys |
| **Data Loss** | Reversible migrations, backup-first | `change/0` callbacks with automatic reverse |
| **Inconsistency** | Transactional migrations, checksums | Ecto transactions + content hash validation |
| **Performance** | Batched operations, concurrent indexes | `CREATE INDEX CONCURRENTLY`, batched inserts |
| **Ordering** | Timestamped migration files | Ecto timestamp-based ordering |
| **Team Conflicts** | Sequential version numbers | Ecto timestamps prevent conflicts |

## Usage in Prismatic Platform

The Prismatic Platform manages migrations across multiple Ecto repos (main, DD pipeline, Perimeter) with coordinated schema evolution.

```elixir
defmodule Prismatic.Repo.Migrations.CreateDdEntities do
  @moduledoc """
  Creates the core DD pipeline entity storage table with
  JSONB attributes, content hashing for diff detection,
  and proper indexing for efficient queries.
  """

  use Ecto.Migration

  def change do
    create table(:dd_entities, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :source_slug, :string, null: false
      add :external_id, :string, null: false
      add :entity_type, :string, null: false
      add :name, :string, null: false
      add :attributes, :map, default: %{}
      add :content_hash, :string, null: false
      add :fetch_record_id, references(:dd_fetch_records, type: :binary_id)

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:dd_entities, [:source_slug, :external_id])
    create index(:dd_entities, [:entity_type])
    create index(:dd_entities, [:content_hash])
    create index(:dd_entities, [:inserted_at])
  end
end
```

## Code Examples

```elixir
defmodule Prismatic.DataMigrator do
  @moduledoc """
  Cross-backend data migration utility leveraging the adapter pattern
  to transfer data between storage backends with validation and
  progress tracking.
  """

  @type migration_opts :: [
    batch_size: pos_integer(),
    validate: boolean(),
    on_conflict: :skip | :replace | :error
  ]

  @spec migrate(module(), module(), migration_opts()) ::
    {:ok, %{migrated: non_neg_integer(), skipped: non_neg_integer()}} |
    {:error, term()}
  def migrate(source_adapter, target_adapter, opts \\ []) do
    batch_size = Keyword.get(opts, :batch_size, 500)
    validate? = Keyword.get(opts, :validate, true)

    with {:ok, items} <- source_adapter.list([]) do
      result =
        items
        |> Enum.chunk_every(batch_size)
        |> Enum.reduce(%{migrated: 0, skipped: 0}, fn batch, acc ->
          case process_batch(batch, target_adapter, validate?, opts) do
            {:ok, count} -> %{acc | migrated: acc.migrated + count}
            {:skip, count} -> %{acc | skipped: acc.skipped + count}
          end
        end)

      {:ok, result}
    end
  end

  defp process_batch(batch, target_adapter, validate?, opts) do
    validated =
      if validate? do
        Enum.filter(batch, &valid_record?/1)
      else
        batch
      end

    pairs = Enum.map(validated, fn record -> {record.id, record} end)

    case target_adapter.bulk_put(pairs, opts) do
      {:ok, count} -> {:ok, count}
      {:error, _} -> {:skip, length(pairs)}
    end
  end

  defp valid_record?(%{id: id, content_hash: hash}) when is_binary(id) and is_binary(hash), do: true
  defp valid_record?(_), do: false
end
```

## Best Practices

1. **Always write reversible migrations** -- use `change/0` instead of `up/0`+`down/0` when possible; Ecto auto-generates reverse operations.
2. **Create indexes concurrently in production** -- `CREATE INDEX CONCURRENTLY` avoids table locks on large tables.
3. **Batch large data migrations** -- processing millions of records in a single transaction will exhaust memory and lock tables.
4. **Validate data after migration** -- row counts, checksums, and sample verification ensure completeness.
5. **Never mix schema and data migrations** -- keep structural changes separate from data transformations for clear rollback paths.
6. **Test migrations against production-like data** -- edge cases in real data frequently break migrations that pass on test fixtures.

## Related Terms

- [Ecto](/glossary/ecto/) -- Database wrapper providing the migration DSL
- [Data Quality](/glossary/data-quality/) -- Validation ensuring migration correctness
- [ETL](/glossary/etl/) -- Extract-Transform-Load pattern used in complex migrations
- [Data Pipeline](/glossary/data-pipeline/) -- Automated data processing workflows including migrations
- [Deployment](/glossary/deployment/) -- Release process incorporating database migrations

## See Also

- [Technologies](/technologies/) -- Database technologies and migration tools
- [Architecture](/architecture/) -- Platform data architecture
- [Apps](/apps/) -- Umbrella applications with migration requirements

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
