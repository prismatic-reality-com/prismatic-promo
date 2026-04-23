+++
title = "Ecto"
weight = 24
[extra]
category = "framework"
description = "Elixir database toolkit providing schema definitions, composable queries, changesets for data validation, and migration management for PostgreSQL and other databases."
related_terms = ["otp", "supervision-tree", "beam", "adapter-pattern", "postgresql"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 874
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Ecto", "Elixir", "PostgreSQL", "glossary", "framework", "Prismatic Platform", "Repo"]
tags = ["glossary", "framework", "ecto", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Ecto - Prismatic Platform"
+++

## Definition

Ecto is Elixir's official database toolkit, providing a unified interface for data validation, querying, and persistence. Unlike traditional Object-Relational Mappers (ORMs) that attempt to hide the database behind an object-oriented abstraction, Ecto takes a functional approach that embraces the relational model. Schemas define data structures as Elixir structs, changesets validate and transform data before persistence, and queries compose through Elixir's [pipe operator](/glossary/pipe-operator/) without hidden state or lazy loading. Every database interaction is explicit, making data flows transparent and testable.

Ecto's architecture separates concerns into four distinct modules: `Ecto.Schema` defines data shapes and their database mappings, `Ecto.Changeset` handles validation, casting, and constraint checking as a pure data transformation pipeline, `Ecto.Query` builds composable SQL queries using Elixir's macro system, and `Ecto.Repo` manages database connections, transactions, and query execution. This separation means that validation logic can be tested without a database, queries can be built incrementally without execution, and database interactions are always explicit function calls rather than implicit side effects triggered by attribute access.

Created by Jose Valim and the Elixir core team, Ecto was designed from the start to avoid the pitfalls of ActiveRecord-style ORMs: N+1 queries from lazy loading, implicit database calls from attribute access, and the conflation of validation with persistence. By making every database interaction a conscious, explicit choice, Ecto produces applications where data access patterns are visible in the code rather than hidden behind abstractions.

## Core Architecture

Ecto's four-module architecture creates a clean separation between data definition, validation, querying, and persistence.

### Schema

Ecto schemas define the shape of data and its mapping to database tables. Unlike ORM models that mix data definition with behavior, Ecto schemas are simple Elixir structs with metadata about field types and associations:

```elixir
defmodule PrismaticPerimeter.Schema.Asset do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "perimeter_assets" do
    field :domain, :string
    field :ip_address, :string
    field :asset_type, Ecto.Enum, values: [:domain, :ip, :certificate, :cloud_resource, :service]
    field :risk_score, :integer
    field :grade, Ecto.Enum, values: [:A, :B, :C, :D, :F]
    field :last_scanned_at, :utc_datetime_usec
    field :metadata, :map, default: %{}

    belongs_to :organization, PrismaticPerimeter.Schema.Organization
    has_many :vulnerabilities, PrismaticPerimeter.Schema.Vulnerability
    has_many :scan_results, PrismaticPerimeter.Schema.ScanResult

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(asset, attrs) do
    asset
    |> cast(attrs, [:domain, :ip_address, :asset_type, :risk_score, :grade, :last_scanned_at, :metadata])
    |> validate_required([:domain, :asset_type])
    |> validate_number(:risk_score, greater_than_or_equal_to: 0, less_than_or_equal_to: 100)
    |> unique_constraint(:domain, name: :perimeter_assets_domain_index)
    |> foreign_key_constraint(:organization_id)
  end
end
```

### Changeset

Changesets are Ecto's most distinctive feature. A changeset represents a proposed change to data, carrying both the data transformation and validation results as an inspectable data structure. Changesets compose through the pipe operator, building up validation rules incrementally:

```elixir
# Changesets are data, not side effects -- they can be inspected, tested, and composed
changeset = %Asset{}
|> Asset.changeset(%{domain: "api.example.com", asset_type: :domain, risk_score: 75})
|> validate_format(:domain, ~r/^[a-z0-9.-]+\.[a-z]{2,}$/i)
|> prepare_changes(fn changeset ->
  put_change(changeset, :last_scanned_at, DateTime.utc_now())
end)

# Check validity without touching the database
changeset.valid?  # => true

# Inspect errors
changeset.errors  # => []

# Only interact with the database when explicitly asked
Repo.insert(changeset)  # => {:ok, %Asset{}} | {:error, %Ecto.Changeset{}}
```

| Changeset Feature | Description |
|-------------------|-------------|
| **cast/3** | Whitelist and type-cast external parameters into schema fields |
| **validate_required/2** | Ensure fields are present and non-nil |
| **validate_format/3** | Check field values against regex patterns |
| **validate_number/3** | Numeric range validation |
| **validate_length/3** | String/list length constraints |
| **unique_constraint/2** | Database unique index enforcement (checked on insert/update) |
| **foreign_key_constraint/2** | Referential integrity enforcement |
| **prepare_changes/2** | Register callbacks executed within the database transaction |
| **put_assoc/3** | Manage associated records through the parent changeset |

### Query

Ecto queries compose through Elixir's pipe operator, building up SQL incrementally without execution. The query DSL uses macros to provide compile-time checks and type safety:

```elixir
import Ecto.Query

# Queries compose through pipes -- no query is executed until passed to Repo
query =
  from(a in Asset, as: :asset)
  |> where([asset: a], a.asset_type == :domain)
  |> where([asset: a], a.risk_score >= 70)
  |> join(:left, [asset: a], v in assoc(a, :vulnerabilities), as: :vuln)
  |> group_by([asset: a], a.id)
  |> select([asset: a, vuln: v], %{
    domain: a.domain,
    risk_score: a.risk_score,
    grade: a.grade,
    vulnerability_count: count(v.id)
  })
  |> order_by([asset: a], desc: a.risk_score)
  |> limit(50)

# Execute the composed query
high_risk_assets = Repo.all(query)
```

Query composition enables building reusable query fragments:

```elixir
defmodule PrismaticPerimeter.Queries.AssetQuery do
  import Ecto.Query

  def base, do: from(a in Asset, as: :asset)

  def by_type(query, type), do: where(query, [asset: a], a.asset_type == ^type)
  def high_risk(query), do: where(query, [asset: a], a.risk_score >= 70)
  def with_vulnerabilities(query), do: preload(query, [:vulnerabilities])
  def recently_scanned(query, since), do: where(query, [asset: a], a.last_scanned_at >= ^since)

  # Compose in calling code
  # AssetQuery.base() |> AssetQuery.by_type(:domain) |> AssetQuery.high_risk() |> Repo.all()
end
```

### Repo

Ecto.Repo is the boundary between the application and the database. It manages connection pools, executes queries, and coordinates transactions. Each Repo is a module that uses `Ecto.Repo` and is started under a [supervision tree](/glossary/supervision-tree/):

```elixir
defmodule PrismaticStorage.Repo do
  use Ecto.Repo,
    otp_app: :prismatic_storage_ecto,
    adapter: Ecto.Adapters.Postgres

  # Custom Repo functions for platform-specific patterns
  def fetch(queryable, id) do
    case get(queryable, id) do
      nil -> {:error, :not_found}
      record -> {:ok, record}
    end
  end
end
```

## Ecto.Multi for Transactions

Ecto.Multi provides a way to compose multiple database operations into a single transaction, with each operation named and able to reference the results of previous operations:

```elixir
alias Ecto.Multi

Multi.new()
|> Multi.insert(:asset, Asset.changeset(%Asset{}, asset_params))
|> Multi.insert(:initial_scan, fn %{asset: asset} ->
  ScanResult.changeset(%ScanResult{}, %{asset_id: asset.id, status: :pending})
end)
|> Multi.run(:notify, fn _repo, %{asset: asset} ->
  Phoenix.PubSub.broadcast(Prismatic.PubSub, "perimeter:updates", {:asset_created, asset})
  {:ok, :notified}
end)
|> Repo.transaction()
# => {:ok, %{asset: %Asset{}, initial_scan: %ScanResult{}, notify: :notified}}
# => {:error, failed_operation, failed_changeset, changes_so_far}
```

Multi operations are composable -- different modules can build up Multi structs that are then merged and executed as a single atomic transaction.

## Migration System

Ecto's migration system manages database schema evolution through versioned, reversible migration files. Each migration is a module with `up/0` and `down/0` functions (or a reversible `change/0` function):

```elixir
defmodule PrismaticStorage.Repo.Migrations.CreatePerimeterAssets do
  use Ecto.Migration

  def change do
    create table(:perimeter_assets, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :domain, :string, null: false
      add :ip_address, :string
      add :asset_type, :string, null: false
      add :risk_score, :integer
      add :grade, :string
      add :last_scanned_at, :utc_datetime_usec
      add :metadata, :map, default: %{}
      add :organization_id, references(:organizations, type: :binary_id)

      timestamps(type: :utc_datetime_usec)
    end

    create unique_index(:perimeter_assets, [:domain])
    create index(:perimeter_assets, [:asset_type])
    create index(:perimeter_assets, [:risk_score])
    create index(:perimeter_assets, [:organization_id])
  end
end
```

Migrations run sequentially by timestamp, are tracked in a `schema_migrations` table, and can be rolled back individually. The `change/0` macro automatically generates rollback operations for most DDL commands, reducing boilerplate.

## Multi-Tenancy Support

Ecto supports multi-tenancy through PostgreSQL schemas (prefixes), allowing tenant data isolation at the database level:

```elixir
# Query a specific tenant's data using prefix
Repo.all(Asset, prefix: "tenant_acme")

# Insert into a specific tenant's schema
Repo.insert(changeset, prefix: "tenant_acme")

# Run migrations for a specific tenant
Ecto.Migrator.run(Repo, migrations_path, :up, prefix: "tenant_acme")
```

This approach provides strong isolation guarantees -- each tenant's data lives in a separate [PostgreSQL](/glossary/postgresql/) schema, with cross-tenant queries impossible without explicit prefix specification.

## Context in Prismatic

The Prismatic Platform uses Ecto as its primary interface to [PostgreSQL](/glossary/postgresql/) across multiple umbrella applications. The `prismatic_storage_ecto` adapter implements the platform's storage protocols using Ecto repositories, following the [adapter pattern](/glossary/adapter-pattern/) that allows swapping storage backends without changing business logic.

| Application | Ecto Usage |
|-------------|------------|
| **prismatic_storage_ecto** | Core Repo, shared schemas, migration management |
| **prismatic_perimeter** | Asset, vulnerability, and scan result schemas |
| **prismatic_agents** | Agent configuration and state persistence |
| **prismatic_web** | Session storage, user authentication |

Ecto changesets enforce data integrity at the application layer, complementing PostgreSQL constraints. The platform's migration system manages schema evolution across all 90 applications through coordinated Ecto migrations, with [Mix](/glossary/mix/) tasks automating migration execution during deployments.

## Telemetry and Performance

Ecto emits telemetry events for every query execution, enabling comprehensive [observability](/glossary/observability/) without code instrumentation:

| Event | Measurements | Use Case |
|-------|-------------|----------|
| `[:prismatic, :repo, :query]` | `total_time`, `decode_time`, `query_time`, `queue_time` | Query performance monitoring |
| `[:ecto, :repo, :init]` | - | Connection pool startup tracking |

```elixir
# Attach a telemetry handler for slow query logging
:telemetry.attach(
  "slow-query-logger",
  [:prismatic, :repo, :query],
  fn _event, %{total_time: time}, metadata, _config ->
    if time > 100_000_000 do  # 100ms in native time units
      Logger.warning("Slow query (#{div(time, 1_000_000)}ms): #{metadata.query}")
    end
  end,
  nil
)
```

Connection pooling is managed by DBConnection, with pool size configured per Repo. The platform monitors queue time (time spent waiting for a connection) as a key indicator of pool saturation.

## Related Terms

- [PostgreSQL](/glossary/postgresql/) - Primary database backend for Ecto in Prismatic
- [Adapter Pattern](/glossary/adapter-pattern/) - Storage abstraction pattern Ecto enables
- [Supervision Tree](/glossary/supervision-tree/) - Ecto.Repo runs under OTP supervision
- [BEAM](/glossary/beam/) - Virtual machine managing Ecto's connection pools
- [OTP](/glossary/otp/) - Runtime environment Ecto operates within
- [Mix](/glossary/mix/) - Build tool running Ecto migrations and tasks
- [Pipe Operator](/glossary/pipe-operator/) - Composition mechanism for Ecto queries and changesets
- [Phoenix](/glossary/phoenix/) - Web framework commonly paired with Ecto
- [Connection Pooling](/glossary/connection-pooling/) - Database connection management via DBConnection
- [Observability](/glossary/observability/) - Telemetry-based query monitoring
- [Pattern Matching](/glossary/pattern-matching/) - Elixir feature used extensively in Ecto APIs
- [Immutability](/glossary/immutability/) - Changesets as immutable data transformations

## See Also

- [Technologies](/technologies/) - Full technology stack
- [Architecture](/architecture/) - Platform architecture
- [Data Pipeline](/glossary/data-pipeline/) - Data processing patterns using Ecto as persistence layer
- [TimescaleDB](/glossary/timescaledb/) - Time-series extension for PostgreSQL used with Ecto

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)