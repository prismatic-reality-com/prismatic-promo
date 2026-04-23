+++
title = "Table"
weight = 50
[extra]
description = "Fundamental data structure for organized storage in both ETS (in-memory key-value) and PostgreSQL (relational) contexts"
category = "storage"
related_terms = ["ets", "postgresql", "ecto", "schema", "migration", "database", "storage-adapter"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["table", "ETS", "database", "PostgreSQL", "storage", "glossary", "Prismatic Platform"]
tags = ["glossary", "storage", "database"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Table - Prismatic Platform"
+++

## Definition & Overview

A table is a structured data container that organizes information into rows and columns (in relational databases) or key-value entries (in ETS). In PostgreSQL, a table is a persistent, schema-defined collection of records with typed columns, constraints, and indexes. In ETS (Erlang Term Storage), a table is an in-memory data structure that stores Erlang/Elixir terms as tuples, providing sub-microsecond access without disk I/O.

The table concept spans both the relational and in-memory storage worlds in the Prismatic Platform. PostgreSQL tables store durable entity data (DD entities, audit logs, user records) with ACID transaction guarantees. ETS tables store ephemeral operational data (tool registries, session caches, metric buffers) with concurrent read access and single-writer semantics. Understanding both table types -- their capabilities, performance characteristics, and appropriate use cases -- is essential for working with the platform.

The platform maintains dozens of tables across both storage systems. The DD pipeline uses PostgreSQL tables (`dd_entities`, `dd_relationships`, `dd_fetch_records`, `dd_load_runs`, `dd_entity_attributes`) for persistent entity storage. The self-registering subsystems use ETS tables (`:osint_tool_registry`, `:academy_topics`, `:dd_source_registry`) for sub-microsecond lookups. Each table type serves a distinct purpose in the platform's dual-storage architecture.

## Technical Deep Dive

### ETS Table Creation and Usage

ETS tables are created by the process that will own them:

```elixir
defmodule PrismaticRegistry.TableManager do
  @moduledoc """
  Manages ETS table lifecycle for platform registries.
  Demonstrates different table types and access patterns.
  """

  @spec create_registry_table(atom(), keyword()) :: atom()
  def create_registry_table(name, opts \\ []) do
    type = Keyword.get(opts, :type, :set)
    access = Keyword.get(opts, :access, :public)

    :ets.new(name, [
      :named_table,
      type,              # :set, :ordered_set, :bag, :duplicate_bag
      access,            # :public, :protected, :private
      read_concurrency: Keyword.get(opts, :read_concurrency, true),
      write_concurrency: Keyword.get(opts, :write_concurrency, false)
    ])
  end

  @spec table_info(atom()) :: map()
  def table_info(table) do
    %{
      size: :ets.info(table, :size),
      memory_bytes: :ets.info(table, :memory) * :erlang.system_info(:wordsize),
      type: :ets.info(table, :type),
      owner: :ets.info(table, :owner),
      read_concurrency: :ets.info(table, :read_concurrency),
      write_concurrency: :ets.info(table, :write_concurrency)
    }
  end
end

# Platform ETS tables
# :osint_tool_registry   - 127 entries, :set, :public, read_concurrency: true
# :academy_topics        - 4 entries, :set, :public, read_concurrency: true
# :dd_source_registry    - 4 entries, :set, :public, read_concurrency: true
# :sliding_window_limiter - dynamic, :ordered_set, :public, write_concurrency: true
# :prismatic_sessions    - dynamic, :set, :public, read_concurrency: true
```

### PostgreSQL Table Definition via Ecto

PostgreSQL tables are defined through Ecto migrations and schemas:

```elixir
defmodule PrismaticDd.Repo.Migrations.CreateEntities do
  use Ecto.Migration

  def change do
    create table(:dd_entities, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :entity_type, :string, null: false
      add :source_slug, :string, null: false
      add :external_id, :string
      add :attributes, :map, default: %{}
      add :content_hash, :string
      add :status, :string, default: "active"

      timestamps(type: :utc_datetime_usec)
    end

    create index(:dd_entities, [:entity_type])
    create index(:dd_entities, [:source_slug])
    create unique_index(:dd_entities, [:source_slug, :external_id])
    create index(:dd_entities, [:status])
  end
end

defmodule PrismaticDd.Schemas.EntityRecord do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "dd_entities" do
    field :name, :string
    field :entity_type, :string
    field :source_slug, :string
    field :external_id, :string
    field :attributes, :map, default: %{}
    field :content_hash, :string
    field :status, :string, default: "active"

    timestamps(type: :utc_datetime_usec)
  end

  @required_fields ~w(name entity_type source_slug)a
  @optional_fields ~w(external_id attributes content_hash status)a

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(entity, attrs) do
    entity
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> unique_constraint([:source_slug, :external_id])
  end
end
```

### Table Type Selection Guide

```elixir
defmodule PrismaticStorage.TableSelector do
  @moduledoc """
  Decision guide for choosing between ETS and PostgreSQL tables.
  """

  @spec recommend(keyword()) :: :ets | :postgresql
  def recommend(opts) do
    cond do
      # ETS: sub-microsecond access needed
      Keyword.get(opts, :latency_requirement) == :sub_microsecond -> :ets

      # PostgreSQL: ACID transactions needed
      Keyword.get(opts, :needs_transactions) == true -> :postgresql

      # PostgreSQL: must survive node restart
      Keyword.get(opts, :persistence) == :durable -> :postgresql

      # ETS: read-heavy, write-rare
      Keyword.get(opts, :read_write_ratio, 1) > 100 -> :ets

      # PostgreSQL: complex queries needed
      Keyword.get(opts, :needs_joins) == true -> :postgresql

      # PostgreSQL: data must be queryable across nodes
      Keyword.get(opts, :cross_node) == true -> :postgresql

      # Default: ETS for speed, PostgreSQL for durability
      true -> :postgresql
    end
  end
end
```

## Architecture & Implementation

The platform's table architecture follows a dual-storage pattern. Hot data (registries, caches, rate limit counters) lives in ETS for maximum read throughput. Cold data (entity records, audit logs, compliance assessments) lives in PostgreSQL for durability, queryability, and transactional consistency. Some data exists in both: entities are stored in PostgreSQL for durability and cached in ETS for read performance.

ETS tables are owned by GenServers within the application's supervision tree. If the owner process crashes, the ETS table is destroyed. The self-registering pattern (OSINT tools, Academy topics, DD sources) handles this through `@after_compile` hooks that re-register on application restart, automatically repopulating the ETS table.

PostgreSQL tables use UUID primary keys throughout the platform, enabling distributed ID generation without coordination. JSONB columns store flexible attributes that vary across entity types. Indexes are added strategically based on query patterns, following the principle of indexing frequently queried columns without over-indexing write-heavy tables.

## Usage in Prismatic Platform

Tables are the foundational storage primitive across all subsystems:

```elixir
# ETS table operations
:ets.insert(:osint_tool_registry, {"ares-ico-lookup", tool_config})
:ets.lookup(:osint_tool_registry, "ares-ico-lookup")

# PostgreSQL table operations via Ecto
PrismaticDd.Repo.insert(EntityRecord.changeset(%EntityRecord{}, attrs))
PrismaticDd.Repo.all(from e in EntityRecord, where: e.source_slug == "forbes-cz")
```

## Cross-References

- [ETS](/glossary/ets/) - In-memory table implementation for high-speed access
- [PostgreSQL](/glossary/postgresql/) - Relational database providing persistent tables
- [Ecto](/glossary/ecto/) - Database wrapper defining table schemas and migrations
- [Storage Adapter](/glossary/storage-adapter/) - Abstraction layer over both table types

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
