+++
title = "PostgreSQL and TimescaleDB Patterns for Intelligence Platforms"
date = 2026-03-13
description = "Database architecture patterns using Ecto schemas, TimescaleDB hypertables for time-series data, connection pooling strategies, and query optimization techniques."

[extra]
author = "Tomas Korcak (korczis)"
category = "architecture"
tags = ["postgresql", "timescaledb", "ecto", "database", "performance"]
reading_time = "9 min"
keywords = ["postgresql timescaledb", "ecto schemas", "hypertables", "connection pooling", "query optimization"]
image = "/images/blog/postgresql-timescaledb-patterns.png"
word_count = 1100
date_created = "2026-03-13"
date_modified = "2026-03-13"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "PostgreSQL and TimescaleDB Patterns for Intelligence Platforms - Prismatic Platform"
+++

Intelligence platforms generate massive volumes of time-series data: OSINT scan results, entity risk scores over time, investigation timelines, and system telemetry. PostgreSQL with TimescaleDB provides both relational integrity for domain data and efficient time-series storage for analytical workloads. This post covers the database patterns used across the Prismatic Platform.

## Schema Architecture

The platform uses a multi-schema PostgreSQL setup where each umbrella app owns its schema namespace. Ecto schemas map directly to domain concepts:

```elixir
defmodule PrismaticDD.Schema.Case do
  @moduledoc """
  Due diligence case schema.

  Represents an investigation case with entities, findings,
  risk assessments, and audit trail. Uses UUID primary keys
  for distributed-safe identity.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{}

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "dd_cases" do
    field :title, :string
    field :description, :string
    field :status, Ecto.Enum, values: [:draft, :in_progress, :review, :completed, :archived]
    field :risk_level, Ecto.Enum, values: [:low, :medium, :high, :critical]
    field :metadata, :map, default: %{}

    has_many :entities, PrismaticDD.Schema.CaseEntity
    has_many :findings, PrismaticDD.Schema.Finding
    has_many :documents, PrismaticDD.Schema.Document
    belongs_to :assignee, PrismaticAuth.Schema.User

    timestamps(type: :utc_datetime_usec)
  end

  @required_fields ~w(title status)a
  @optional_fields ~w(description risk_level metadata assignee_id)a

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(case_record, attrs) do
    case_record
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_length(:title, min: 3, max: 255)
    |> foreign_key_constraint(:assignee_id)
  end
end
```

## Migration Patterns

Migrations follow a strict naming convention and always include rollback support. For cross-app dependencies, migrations reference schemas by table name rather than Ecto module:

```elixir
defmodule PrismaticDD.Repo.Migrations.CreateDDCases do
  @moduledoc """
  Creates the dd_cases table with full audit trail support.
  """

  use Ecto.Migration

  def change do
    create table(:dd_cases, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :title, :string, null: false
      add :description, :text
      add :status, :string, null: false, default: "draft"
      add :risk_level, :string
      add :metadata, :map, default: %{}
      add :assignee_id, references(:users, type: :binary_id, on_delete: :nilify_all)

      timestamps(type: :utc_datetime_usec)
    end

    create index(:dd_cases, [:status])
    create index(:dd_cases, [:assignee_id])
    create index(:dd_cases, [:risk_level])
    create index(:dd_cases, [:inserted_at])
  end
end
```

## TimescaleDB Hypertables

Time-series data like entity risk scores, scan results, and system metrics use TimescaleDB hypertables. These automatically partition data by time intervals for efficient range queries and retention policies:

```elixir
defmodule PrismaticOsint.Repo.Migrations.CreateScanResults do
  @moduledoc """
  Creates scan_results as a TimescaleDB hypertable.
  Partitions by 1-day intervals with 90-day retention.
  """

  use Ecto.Migration

  def up do
    create table(:scan_results, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :entity_id, :binary_id, null: false
      add :source, :string, null: false
      add :risk_score, :float
      add :confidence, :float
      add :raw_data, :map, default: %{}
      add :scanned_at, :utc_datetime_usec, null: false
    end

    create index(:scan_results, [:entity_id])
    create index(:scan_results, [:source])
    create index(:scan_results, [:scanned_at])

    # Convert to hypertable with 1-day chunks
    execute """
    SELECT create_hypertable('scan_results', 'scanned_at',
      chunk_time_interval => INTERVAL '1 day',
      if_not_exists => TRUE
    );
    """

    # Add compression policy (compress chunks older than 7 days)
    execute """
    ALTER TABLE scan_results SET (
      timescaledb.compress,
      timescaledb.compress_segmentby = 'entity_id,source'
    );
    """

    execute """
    SELECT add_compression_policy('scan_results', INTERVAL '7 days');
    """

    # Add retention policy (drop data older than 90 days)
    execute """
    SELECT add_retention_policy('scan_results', INTERVAL '90 days');
    """
  end

  def down do
    drop table(:scan_results)
  end
end
```

| Feature | Standard PostgreSQL | TimescaleDB Hypertable |
|---------|--------------------|-----------------------|
| Insert throughput | ~50K rows/s | ~200K rows/s |
| Time-range query (1 day) | Full table scan | Single chunk scan |
| Compression | Manual | Automatic policy |
| Retention | Manual DELETE | Automatic drop_chunks |
| Continuous aggregates | Manual materialized views | Native, auto-refresh |
| Partitioning | Manual PARTITION BY | Automatic by time |

## Continuous Aggregates

For dashboards that display aggregated risk trends, continuous aggregates pre-compute rollups that refresh automatically:

```elixir
defmodule PrismaticOsint.Repo.Migrations.CreateRiskTrendAggregate do
  @moduledoc """
  Creates a continuous aggregate for entity risk score trends.
  Auto-refreshes every hour with a 2-hour lag.
  """

  use Ecto.Migration

  def up do
    execute """
    CREATE MATERIALIZED VIEW risk_score_hourly
    WITH (timescaledb.continuous) AS
    SELECT
      time_bucket('1 hour', scanned_at) AS bucket,
      entity_id,
      source,
      AVG(risk_score) AS avg_risk,
      MAX(risk_score) AS max_risk,
      MIN(risk_score) AS min_risk,
      COUNT(*) AS scan_count
    FROM scan_results
    GROUP BY bucket, entity_id, source
    WITH NO DATA;
    """

    execute """
    SELECT add_continuous_aggregate_policy('risk_score_hourly',
      start_offset => INTERVAL '7 days',
      end_offset => INTERVAL '2 hours',
      schedule_interval => INTERVAL '1 hour'
    );
    """
  end

  def down do
    execute "DROP MATERIALIZED VIEW IF EXISTS risk_score_hourly CASCADE;"
  end
end
```

Query the aggregate from Ecto using a raw fragment:

```elixir
defmodule PrismaticOsint.Analytics.RiskTrend do
  @moduledoc """
  Queries pre-computed risk score trends from TimescaleDB
  continuous aggregates for dashboard rendering.
  """

  import Ecto.Query

  alias PrismaticOsint.Repo

  @spec entity_risk_trend(String.t(), DateTime.t(), DateTime.t()) :: [map()]
  def entity_risk_trend(entity_id, from, to) do
    query =
      from r in "risk_score_hourly",
        where: r.entity_id == ^entity_id,
        where: r.bucket >= ^from and r.bucket <= ^to,
        select: %{
          bucket: r.bucket,
          avg_risk: r.avg_risk,
          max_risk: r.max_risk,
          scan_count: r.scan_count
        },
        order_by: [asc: r.bucket],
        limit: 500

    Repo.all(query)
  end
end
```

## Connection Pooling

Each umbrella app has its own Repo with a dedicated connection pool. Pool sizes are tuned based on the app's query profile:

```elixir
# config/runtime.exs
config :prismatic_dd, PrismaticDD.Repo,
  url: System.get_env("DATABASE_URL"),
  pool_size: String.to_integer(System.get_env("DD_POOL_SIZE", "10")),
  queue_target: 500,
  queue_interval: 5_000

config :prismatic_osint, PrismaticOsint.Repo,
  url: System.get_env("DATABASE_URL"),
  pool_size: String.to_integer(System.get_env("OSINT_POOL_SIZE", "20")),
  queue_target: 1_000,
  queue_interval: 10_000
```

| App | Default Pool Size | Queue Target | Typical Query Duration |
|-----|-------------------|-------------|----------------------|
| `prismatic_dd` | 10 | 500ms | 5-50ms |
| `prismatic_osint` | 20 | 1000ms | 10-200ms (external calls) |
| `prismatic_web` | 15 | 500ms | 2-20ms |
| `prismatic_auth` | 5 | 200ms | 1-5ms |

## Query Optimization Patterns

Preload associations explicitly to avoid N+1 queries. Use `Ecto.Query.preload/3` with targeted queries:

```elixir
defmodule PrismaticDD.Cases do
  @moduledoc """
  Case management context with optimized query patterns.
  All list queries are bounded and use explicit preloads.
  """

  import Ecto.Query
  alias PrismaticDD.Repo

  @spec list_cases(keyword()) :: [Case.t()]
  def list_cases(opts \\ []) do
    limit = Keyword.get(opts, :limit, 50)
    status = Keyword.get(opts, :status)

    Case
    |> maybe_filter_status(status)
    |> preload([:assignee, entities: :entity, findings: []])
    |> order_by([c], desc: c.inserted_at)
    |> limit(^limit)
    |> Repo.all()
  end

  defp maybe_filter_status(query, nil), do: query
  defp maybe_filter_status(query, status) do
    where(query, [c], c.status == ^status)
  end
end
```

For complex analytical queries that join across TimescaleDB hypertables and standard tables, use CTEs to keep the query plan efficient:

```elixir
@spec high_risk_entities_with_trend(float(), integer()) :: [map()]
def high_risk_entities_with_trend(threshold, days) do
  cutoff = DateTime.add(DateTime.utc_now(), -days * 86_400, :second)

  query = """
  WITH recent_scores AS (
    SELECT entity_id, AVG(risk_score) AS avg_risk, COUNT(*) AS scans
    FROM scan_results
    WHERE scanned_at > $1
    GROUP BY entity_id
    HAVING AVG(risk_score) > $2
  )
  SELECT e.id, e.name, e.type, rs.avg_risk, rs.scans
  FROM entities e
  INNER JOIN recent_scores rs ON e.id = rs.entity_id
  ORDER BY rs.avg_risk DESC
  LIMIT 100
  """

  {:ok, result} = Repo.query(query, [cutoff, threshold])
  Enum.map(result.rows, &row_to_map(result.columns, &1))
end
```

These patterns provide the foundation for handling both OLTP workloads (case management, entity CRUD) and OLAP workloads (risk trend analysis, scan aggregation) within a single PostgreSQL instance augmented by TimescaleDB.
