+++
title = "Ecto"
weight = 12
[extra]
category = "web-framework"
description = "Database wrapper and query generator with composable changesets for data validation and persistence"
url = "https://hexdocs.pm/ecto/"
version = "3.12+"
icon = "ecto"
color = "green"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1014
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Ecto", "Database", "technologies", "web framework", "Prismatic Platform", "PostgreSQL", "Built", "Changesets"]
tags = ["technologies", "web-framework", "ecto", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Ecto - Prismatic Platform"
+++

## Overview

Ecto is the data mapping and query library used throughout the Prismatic Platform for all database interactions. It provides a unified interface for defining schemas, composing queries, validating data through changesets, and managing database migrations. Ecto's design philosophy of explicit over implicit aligns perfectly with the platform's [NO MERCY](@/capabilities/no-mercy.md) quality standards -- every database operation is type-checked, every data mutation flows through validated changesets, and every query is composable and inspectable.

The Prismatic Platform uses Ecto primarily with [PostgreSQL](@/technologies/postgresql.md) for persistent storage, but its adapter pattern also supports interactions with other data stores. Ecto's composable query syntax enables the platform to build complex intelligence queries that can be dynamically assembled based on user filters, agent parameters, and automated analysis requirements. The query composition model means that common query patterns (filtering by domain, pagination, sorting) are defined once as composable functions and reused across all modules.

Ecto's changeset system provides a powerful data validation pipeline that ensures all data entering the platform's databases meets strict type and business rule requirements. Changesets are the sole entry point for data modification, creating an auditable pipeline where validation rules, constraint checks, and data transformations are defined declaratively and applied consistently. This is a critical quality gate in the platform's zero-defect approach -- malformed data is rejected at the changeset boundary before it can reach the database.

## Key Features

Ecto provides a comprehensive data layer that covers schema definition, data validation, query generation, and schema migration in a single, cohesive library.

- **Schemas**: Declarative data structure definitions with type specifications that map directly to database tables
- **Changesets**: Composable data validation and transformation pipelines that enforce business rules before persistence
- **Query Composition**: SQL generation through composable [Elixir](@/technologies/elixir.md) expressions with compile-time validation
- **Migrations**: Version-controlled database schema changes with forward and rollback support
- **Multi-Tenancy**: Built-in prefix support for schema-based multi-tenancy without code duplication
- **Preloading**: Explicit association loading to prevent N+1 queries through declarative preload specifications
- **Embedded Schemas**: Schema definitions without database backing for validation-only use cases (API input validation)
- **Custom Types**: Define platform-specific Ecto types that handle serialization and deserialization transparently

| Feature | Description | Platform Usage |
|---------|-------------|----------------|
| Schemas | Table-to-struct mapping | All database entities |
| Changesets | Validation pipeline | Every data mutation |
| Queries | Composable SQL generation | Dynamic intelligence queries |
| Migrations | Schema versioning | CI/CD database management |
| Preloads | Association loading | Agent-asset relationships |
| Multi-tenancy | Schema prefixes | Per-organization data isolation |
| Embedded schemas | Validation without tables | API request validation |

## Platform Integration

Ecto schemas and queries power all persistent data operations across the platform's 90 umbrella applications. The perimeter security module demonstrates typical schema and changeset patterns.

```elixir
defmodule PrismaticPerimeter.Schema.Asset do
  @moduledoc "External attack surface asset with risk scoring and vulnerability tracking."
  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{}

  schema "perimeter_assets" do
    field :domain, :string
    field :ip_address, :string
    field :asset_type, Ecto.Enum, values: [:domain, :ip, :certificate, :service]
    field :risk_score, :float
    field :last_scanned, :utc_datetime_usec

    has_many :vulnerabilities, PrismaticPerimeter.Schema.Vulnerability
    belongs_to :organization, PrismaticPerimeter.Schema.Organization
    timestamps(type: :utc_datetime_usec)
  end

  @required_fields ~w(domain asset_type)a
  @optional_fields ~w(ip_address risk_score last_scanned organization_id)a

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(asset, attrs) do
    asset
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:asset_type, [:domain, :ip, :certificate, :service])
    |> validate_number(:risk_score, greater_than_or_equal_to: 0.0, less_than_or_equal_to: 10.0)
    |> unique_constraint(:domain)
    |> foreign_key_constraint(:organization_id)
  end
end
```

Query composition enables building complex, dynamic queries from reusable building blocks:

```elixir
defmodule PrismaticPerimeter.Query.Asset do
  @moduledoc "Composable query functions for asset retrieval and filtering."
  import Ecto.Query

  alias PrismaticPerimeter.Schema.Asset

  @spec base() :: Ecto.Query.t()
  def base, do: from(a in Asset)

  @spec by_domain(Ecto.Query.t(), String.t()) :: Ecto.Query.t()
  def by_domain(query, domain) do
    where(query, [a], a.domain == ^domain)
  end

  @spec high_risk(Ecto.Query.t(), float()) :: Ecto.Query.t()
  def high_risk(query, threshold \\ 7.0) do
    where(query, [a], a.risk_score >= ^threshold)
  end

  @spec with_vulnerabilities(Ecto.Query.t()) :: Ecto.Query.t()
  def with_vulnerabilities(query) do
    preload(query, [:vulnerabilities])
  end

  @spec paginated(Ecto.Query.t(), non_neg_integer(), non_neg_integer()) :: Ecto.Query.t()
  def paginated(query, page, per_page) do
    query
    |> limit(^per_page)
    |> offset(^((page - 1) * per_page))
  end
end

# Usage: composable query pipeline
Asset.Query.base()
|> Asset.Query.by_domain("example.com")
|> Asset.Query.high_risk(8.0)
|> Asset.Query.with_vulnerabilities()
|> Asset.Query.paginated(1, 25)
|> Repo.all()
```

## Architecture

Ecto serves as the data access layer in the platform's layered architecture, mediating all interactions between the business logic and the database. The platform's storage layer follows the adapter pattern, with Ecto as the primary adapter for PostgreSQL.

| Layer | Component | Ecto's Role |
|-------|-----------|-------------|
| Business Logic | Domain modules | Calls Ecto queries and changesets |
| Data Access | Ecto schemas + queries | Schema definition, query composition, validation |
| Adapter | Ecto.Adapters.Postgres | PostgreSQL protocol translation |
| Connection | DBConnection pool | Connection pooling and transaction management |
| Storage | [PostgreSQL](@/technologies/postgresql.md) | Physical data storage |

The platform defines a storage behavior trait in `prismatic_storage_core` that Ecto implements through `prismatic_storage_ecto`, enabling other storage backends ([ETS](@/technologies/ets.md), Meilisearch, KuzuDB) to provide the same interface for different data stores.

## Performance Characteristics

Ecto's query generation and connection pooling are optimized for the platform's workload, which combines high-frequency read queries with batch write operations.

| Metric | Target | Typical Value |
|--------|--------|---------------|
| Simple query (by primary key) | < 5ms | 1-2ms |
| Complex join query | < 50ms | 10-30ms |
| Changeset validation | < 1ms | ~0.1ms |
| Migration execution | < 30 seconds | 1-10 seconds |
| Connection pool size | 10-20 per app | Configured per environment |
| Preload batch size | Configurable | Default batches by association |
| Transaction throughput | 1,000+ TPS | Depends on PostgreSQL capacity |

The platform uses `queue_target` and `queue_interval` settings to prevent connection pool exhaustion under load, failing fast rather than queueing requests that would exceed the page load performance standard.

## Configuration

Ecto is configured through the application environment with separate settings for each deployment environment.

```elixir
# config/config.exs - Base Ecto configuration
config :prismatic, PrismaticStorage.Repo,
  username: "postgres",
  database: "prismatic_dev",
  hostname: "localhost",
  pool_size: 10,
  queue_target: 5000,
  queue_interval: 1000

# config/prod.exs - Production configuration
config :prismatic, PrismaticStorage.Repo,
  pool_size: String.to_integer(System.get_env("POOL_SIZE") || "20"),
  ssl: true,
  ssl_opts: [verify: :verify_peer],
  socket_options: [:inet6]

# config/test.exs - Test configuration with sandbox
config :prismatic, PrismaticStorage.Repo,
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10
```

## Best Practices

The platform enforces Ecto conventions that maximize data integrity, query performance, and code maintainability across all 90 applications.

- **Always use changesets for data mutations** -- never insert or update data without passing through a changeset validation pipeline
- **Use `utc_datetime_usec` for all timestamps** -- microsecond precision with explicit UTC timezone prevents time-related bugs
- **Compose queries with named functions** -- build reusable query functions instead of inline query fragments for consistency and testability
- **Preload associations explicitly** -- never rely on lazy loading; use `Repo.preload/2` or query-level preloads to prevent N+1 queries
- **Define `@type t` for all schemas** -- enables [Dialyzer](@/technologies/dialyzer.md) to verify schema usage across the codebase
- **Use database constraints** -- add unique constraints, foreign key constraints, and check constraints at the database level, not just in changesets
- **Write reversible migrations** -- every migration must have a working `down` function for rollback capability
- **Test changesets independently** -- validate that changesets correctly reject invalid data using [ExUnit](@/technologies/exunit.md) assertions

## Comparison

Ecto was chosen for its explicit, composable design that aligns with the Prismatic Platform's values of clarity and type safety.

| Criterion | Ecto | ActiveRecord (Ruby) | SQLAlchemy (Python) | TypeORM (TS) |
|-----------|------|--------------------|--------------------|--------------|
| Query style | Composable, explicit | Method chaining, implicit | Explicit + ORM | Decorator-based |
| Validation | Changesets (separate from schema) | Model validations (coupled) | Marshmallow (separate) | Class-validator |
| Migrations | Built-in, reversible | Built-in, reversible | Alembic (separate) | Built-in |
| Type safety | @spec + Dialyzer | None (dynamic) | Type hints (optional) | TypeScript types |
| N+1 prevention | Explicit preloads | Eager loading | Joined loading | Eager relations |
| Immutability | Enforced (functional) | Mutable objects | Mutable sessions | Mutable entities |
| Multi-tenancy | Built-in prefixes | Gems (apartment) | Manual | Manual |

## Related Technologies

- [PostgreSQL](@/technologies/postgresql.md) - Primary database backend powering Ecto's SQL generation
- [Phoenix Framework](@/technologies/phoenix.md) - Web framework that Ecto integrates with for form handling and parameter casting
- [Elixir](@/technologies/elixir.md) - Language providing the pattern matching and pipe operator that make Ecto's API ergonomic
- [Dialyzer](@/technologies/dialyzer.md) - Type analysis that verifies Ecto schema and query type correctness
- [ExUnit](@/technologies/exunit.md) - Testing framework with Ecto SQL Sandbox for concurrent test isolation

## Related Apps

- [prismatic_storage_core](@/apps/prismatic-storage-core.md) - Storage traits and protocols that Ecto implements
- [prismatic_storage_ecto](@/apps/prismatic-storage-ecto.md) - Ecto adapter implementation conforming to platform storage behaviors
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - Security asset schemas and compliance query composition
- [prismatic_web](@/apps/prismatic-web.md) - LiveView form integration with Ecto changesets for real-time validation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)