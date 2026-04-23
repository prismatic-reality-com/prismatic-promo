+++
title = "Schema"
description = "A formal definition of data structure, types, constraints, and relationships that serves as the contract between data producers and consumers, enabling validation, documentation, and code generation."
weight = 50

[extra]
category = "core"
tags = ["schema", "data-modeling", "ecto", "validation", "database", "openapi", "type-system", "contracts", "migrations"]
related_terms = ["database", "relational-database", "validation", "ecto", "postgresql", "protocol", "typespec", "swagger-ui", "rest-api", "api-gateway"]
date_created = "2026-02-22"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "intermediate"
quality_score = 95
version = "1.0.0"
tldr = "A schema is a formal specification of data structure and constraints that serves as the source of truth for data validation, database design, API contracts, and code generation -- implemented in the Prismatic Platform through Ecto schemas, OpenApiSpex definitions, and protocol specifications."
word_count = 1245
date_modified = "2026-02-23"
keywords = ["Schema", "formal", "definition", "structure", "types", "constraints", "relationships", "glossary", "core", "Prismatic Platform"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Schema - Prismatic Platform"
+++

## Definition

A schema is a formal description of the structure, types, constraints, and relationships of data within a system. It defines what data looks like (its shape), what values are acceptable (its constraints), how different pieces of data relate to each other (its relationships), and what operations are valid against it (its interface). A schema serves as a contract: producers must emit data that conforms to the schema, and consumers can rely on the schema's guarantees when processing data.

The concept of schema spans multiple domains in software engineering. In databases, a schema defines tables, columns, types, indexes, and foreign key relationships. In APIs, a schema defines request and response formats, required fields, and value constraints. In programming languages, a schema maps to type definitions, struct declarations, and interface specifications. In data serialization, a schema defines the wire format for encoding and decoding messages. Despite these different contexts, the core purpose remains the same: establishing a shared, unambiguous understanding of data structure that can be validated mechanically.

Schemas are the antidote to implicit assumptions. Without an explicit schema, every component that touches data must make assumptions about its structure -- assumptions that are invisible, untestable, and inevitably diverge over time. An explicit schema makes these assumptions visible, testable, and enforceable. When a schema changes, the change is visible in version control, and tools can automatically validate that all consumers handle the new structure correctly. This is why schema-first design is considered a best practice in API design, database design, and data engineering.

## Schema Types

Different kinds of schemas serve different purposes across the software stack:

| Schema Type | Domain | Purpose | Prismatic Tool |
|------------|--------|---------|---------------|
| **Database Schema** | Storage | Table structure, types, indexes, constraints | Ecto migrations |
| **Application Schema** | Business logic | Data structures, validations, type casting | Ecto schemas |
| **API Schema** | Interface | Request/response formats, OpenAPI definitions | OpenApiSpex |
| **Validation Schema** | Data quality | Changeset validations, business rules | Ecto changesets |
| **Serialization Schema** | Transport | Wire format for encoding/decoding | Jason, Protobuf |
| **Graph Schema** | Knowledge | Node types, edge types, properties | KuzuDB schema |
| **Configuration Schema** | Operations | Config structure, defaults, environment | Application config |

## Ecto Schemas in Elixir

The Prismatic Platform uses [Ecto](/glossary/database/) as its primary schema definition and data mapping library. Ecto schemas define the structure of data as Elixir structs with typed fields, associations, and validation rules:

```elixir
defmodule PrismaticPerimeter.Schema.Asset do
  @moduledoc """
  Schema representing an attack surface asset discovered
  by the Prismatic Perimeter EASM module.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{
    id: integer() | nil,
    domain: String.t(),
    type: atom(),
    risk_score: float() | nil,
    first_seen: DateTime.t() | nil,
    last_seen: DateTime.t() | nil,
    metadata: map()
  }

  schema "perimeter_assets" do
    field :domain, :string
    field :type, Ecto.Enum, values: [:domain, :ip, :certificate, :service, :cloud_resource]
    field :risk_score, :float
    field :status, Ecto.Enum, values: [:active, :inactive, :decommissioned], default: :active
    field :first_seen, :utc_datetime_usec
    field :last_seen, :utc_datetime_usec
    field :metadata, :map, default: %{}

    belongs_to :organization, PrismaticPerimeter.Schema.Organization
    has_many :vulnerabilities, PrismaticPerimeter.Schema.Vulnerability
    has_many :scan_results, PrismaticPerimeter.Schema.ScanResult

    timestamps(type: :utc_datetime_usec)
  end

  @required_fields ~w(domain type)a
  @optional_fields ~w(risk_score status first_seen last_seen metadata organization_id)a

  @spec changeset(t() | Ecto.Changeset.t(), map()) :: Ecto.Changeset.t()
  def changeset(asset, attrs) do
    asset
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
    |> validate_inclusion(:type, [:domain, :ip, :certificate, :service, :cloud_resource])
    |> validate_number(:risk_score, greater_than_or_equal_to: 0.0, less_than_or_equal_to: 10.0)
    |> validate_format(:domain, ~r/^[a-zA-Z0-9][a-zA-Z0-9.-]+[a-zA-Z0-9]$/)
    |> unique_constraint([:domain, :type, :organization_id])
    |> foreign_key_constraint(:organization_id)
  end
end
```

### Changeset Validation

Ecto changesets are the [validation](/glossary/validation/) layer that enforces schema constraints at the application level. Every data mutation flows through a changeset, which validates the data before it reaches the database:

```elixir
defmodule PrismaticPerimeter.Assets do
  @moduledoc "Context module for asset management operations."

  alias PrismaticPerimeter.{Repo, Schema.Asset}

  @spec create(map()) :: {:ok, Asset.t()} | {:error, Ecto.Changeset.t()}
  def create(attrs) do
    %Asset{}
    |> Asset.changeset(attrs)
    |> Repo.insert()
  end

  @spec update(Asset.t(), map()) :: {:ok, Asset.t()} | {:error, Ecto.Changeset.t()}
  def update(%Asset{} = asset, attrs) do
    asset
    |> Asset.changeset(attrs)
    |> Repo.update()
  end

  @spec validate(map()) :: {:ok, Ecto.Changeset.t()} | {:error, Ecto.Changeset.t()}
  def validate(attrs) do
    changeset = Asset.changeset(%Asset{}, attrs)

    if changeset.valid? do
      {:ok, changeset}
    else
      {:error, changeset}
    end
  end
end
```

The changeset pattern separates validation from persistence: you can validate data without inserting it into the database. This is useful for dry-run operations, preview modes, and API request validation.

## Database Schema Design

Database schemas in the Prismatic Platform follow [PostgreSQL](/glossary/postgresql/) best practices with explicit types, constraints, and indexes:

| Design Principle | Implementation | Benefit |
|-----------------|---------------|---------|
| **Explicit Types** | `Ecto.Enum`, `:utc_datetime_usec`, custom types | Runtime type safety |
| **Not Null** | `validate_required/2` + DB constraints | No surprise nils |
| **Foreign Keys** | `belongs_to` + `foreign_key_constraint` | Referential integrity |
| **Unique Constraints** | `unique_constraint` + DB indexes | No duplicate data |
| **Check Constraints** | `check_constraint` + DB checks | Domain rule enforcement |
| **Timestamps** | `timestamps(type: :utc_datetime_usec)` | Audit trail, microsecond precision |
| **Soft Deletes** | `:status` field with `:decommissioned` | Data preservation |

### Schema Migrations

Database schema changes are managed through versioned Ecto migrations that provide a deterministic, repeatable path from one schema version to another:

```elixir
defmodule PrismaticPerimeter.Repo.Migrations.CreatePerimeterAssets do
  use Ecto.Migration

  def change do
    create table(:perimeter_assets) do
      add :domain, :string, null: false
      add :type, :string, null: false
      add :risk_score, :float
      add :status, :string, null: false, default: "active"
      add :first_seen, :utc_datetime_usec
      add :last_seen, :utc_datetime_usec
      add :metadata, :map, default: %{}
      add :organization_id, references(:perimeter_organizations, on_delete: :restrict)

      timestamps(type: :utc_datetime_usec)
    end

    create index(:perimeter_assets, [:domain, :type, :organization_id], unique: true)
    create index(:perimeter_assets, [:organization_id])
    create index(:perimeter_assets, [:status])
    create index(:perimeter_assets, [:risk_score])
    create index(:perimeter_assets, [:last_seen])
  end
end
```

Migrations are the only sanctioned way to modify the database schema. Direct DDL changes are forbidden because they break the migration chain and make deployments non-reproducible.

## API Schema (OpenApiSpex)

The Prismatic [API gateway](/glossary/api-gateway/) uses OpenApiSpex to define API schemas that serve as the contract between API clients and the server:

```elixir
defmodule PrismaticApi.Schemas.AssetResponse do
  @moduledoc false
  require OpenApiSpex

  OpenApiSpex.schema(%{
    title: "AssetResponse",
    description: "Response containing an attack surface asset",
    type: :object,
    required: [:data],
    properties: %{
      data: %OpenApiSpex.Schema{
        type: :object,
        required: [:id, :domain, :type],
        properties: %{
          id: %OpenApiSpex.Schema{type: :integer, description: "Unique identifier"},
          domain: %OpenApiSpex.Schema{type: :string, description: "Domain name or IP"},
          type: %OpenApiSpex.Schema{
            type: :string,
            enum: ["domain", "ip", "certificate", "service"],
            description: "Asset classification"
          },
          risk_score: %OpenApiSpex.Schema{
            type: :number,
            format: :float,
            minimum: 0.0,
            maximum: 10.0,
            description: "Risk score from 0.0 to 10.0"
          },
          status: %OpenApiSpex.Schema{
            type: :string,
            enum: ["active", "inactive", "decommissioned"],
            description: "Current asset status"
          },
          first_seen: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "When the asset was first discovered"
          },
          last_seen: %OpenApiSpex.Schema{
            type: :string,
            format: :"date-time",
            description: "When the asset was last observed"
          }
        }
      },
      links: %OpenApiSpex.Schema{
        type: :object,
        description: "HATEOAS navigation links",
        properties: %{
          self: %OpenApiSpex.Schema{type: :string},
          vulnerabilities: %OpenApiSpex.Schema{type: :string},
          organization: %OpenApiSpex.Schema{type: :string}
        }
      }
    }
  })
end
```

The API schema is automatically derived from the Ecto schema through the TypeMapper module, ensuring that database structure and API contract remain synchronized without manual duplication.

## Schema Relationships

Schemas define relationships between entities that mirror real-world domain concepts:

| Relationship | Ecto Macro | Database Implementation | Example |
|-------------|-----------|----------------------|---------|
| **One-to-Many** | `has_many` / `belongs_to` | Foreign key | Organization has many Assets |
| **Many-to-Many** | `many_to_many` | Join table | Assets have many Tags |
| **One-to-One** | `has_one` / `belongs_to` | Foreign key with unique constraint | Asset has one SecurityRating |
| **Embedded** | `embeds_one` / `embeds_many` | JSONB column | Asset embeds many Findings |
| **Self-referential** | `belongs_to` (self) | Foreign key to same table | Asset parent/child hierarchy |

```elixir
defmodule PrismaticPerimeter.Schema.Organization do
  @moduledoc "Schema for monitored organizations."
  use Ecto.Schema

  schema "perimeter_organizations" do
    field :name, :string
    field :domain, :string
    field :industry, :string
    field :security_rating, :string

    has_many :assets, PrismaticPerimeter.Schema.Asset
    has_many :compliance_assessments, PrismaticPerimeter.Schema.ComplianceAssessment
    has_one :current_rating, PrismaticPerimeter.Schema.SecurityRating,
      where: [current: true]

    timestamps(type: :utc_datetime_usec)
  end
end
```

## Schema Versioning

Schema evolution is a critical concern in production systems. The Prismatic Platform follows strict versioning practices:

| Strategy | When to Use | Migration Approach |
|----------|------------|-------------------|
| **Add Column** | New optional field | `alter table, add :field, :type` |
| **Add Required Column** | New mandatory field | Add nullable, backfill, then add NOT NULL |
| **Rename Column** | Field name change | Add new, copy data, remove old (3-step) |
| **Remove Column** | Deprecated field | Remove from schema first, then migration |
| **Change Type** | Type evolution | Add new column, migrate data, swap |
| **Add Index** | Performance optimization | `create_if_not_exists index(...)` |
| **Schema Splitting** | Decomposition | Extract to new table with foreign key |

### Backward-Compatible Migrations

All migrations must be backward-compatible to support zero-downtime deployments:

```elixir
defmodule PrismaticPerimeter.Repo.Migrations.AddConfidenceScoreToAssets do
  use Ecto.Migration

  def change do
    alter table(:perimeter_assets) do
      # New column is nullable -- backward compatible
      add :confidence_score, :float

      # New column with default -- backward compatible
      add :assessment_version, :integer, default: 1
    end

    # Index for query performance -- backward compatible
    create index(:perimeter_assets, [:confidence_score], where: "confidence_score IS NOT NULL")
  end
end
```

## Embedded Schemas

For data that does not need its own table but still benefits from structural definition and validation, Ecto provides embedded schemas:

```elixir
defmodule PrismaticPerimeter.Schema.Finding do
  @moduledoc "Embedded schema for risk assessment findings."
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false
  embedded_schema do
    field :category, Ecto.Enum,
      values: [:network_security, :dns_health, :patching_cadence,
               :endpoint_security, :application_security, :leaked_credentials]
    field :severity, Ecto.Enum, values: [:critical, :high, :medium, :low, :informational]
    field :title, :string
    field :description, :string
    field :evidence, :string
    field :confidence, :float
    field :observed_at, :utc_datetime_usec
    field :remediation, :string
  end

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(finding, attrs) do
    finding
    |> cast(attrs, [:category, :severity, :title, :description, :evidence,
                    :confidence, :observed_at, :remediation])
    |> validate_required([:category, :severity, :title])
    |> validate_number(:confidence, greater_than_or_equal_to: 0.0, less_than_or_equal_to: 1.0)
  end
end
```

Embedded schemas are stored as JSONB in PostgreSQL, providing flexibility for semi-structured data while maintaining validation through changesets.

## Graph Schema (KuzuDB)

The Prismatic Platform also uses graph schemas for knowledge representation in [KuzuDB](/glossary/database/):

```elixir
defmodule PrismaticStorageKuzu.Schema do
  @moduledoc "Graph schema definition for KuzuDB knowledge graph."

  @spec define_schema() :: :ok
  def define_schema do
    # Node schemas
    create_node_table("Module", [
      {"name", "STRING"},
      {"app", "STRING"},
      {"doc", "STRING"},
      {"line_count", "INT64"}
    ])

    create_node_table("Function", [
      {"name", "STRING"},
      {"arity", "INT64"},
      {"visibility", "STRING"},
      {"spec", "STRING"}
    ])

    # Relationship schemas
    create_rel_table("DEFINES", "Module", "Function", [
      {"line", "INT64"}
    ])

    create_rel_table("CALLS", "Function", "Function", [
      {"call_count", "INT64"}
    ])

    create_rel_table("DEPENDS_ON", "Module", "Module", [
      {"type", "STRING"}
    ])
  end
end
```

## Schema Validation Patterns

The Prismatic Platform implements several validation patterns through schemas:

| Pattern | Mechanism | Use Case |
|---------|----------|----------|
| **Required Fields** | `validate_required/2` | Mandatory data presence |
| **Format Validation** | `validate_format/3` | Regex pattern matching (emails, domains) |
| **Inclusion** | `validate_inclusion/3` | Enum value validation |
| **Range** | `validate_number/3` | Numeric bounds checking |
| **Length** | `validate_length/3` | String length constraints |
| **Custom** | `validate_change/3` | Complex business logic |
| **Unique** | `unique_constraint/3` | Database-level uniqueness |
| **Cross-field** | Custom validation functions | Fields that depend on each other |

```elixir
defp validate_risk_assessment(changeset) do
  changeset
  |> validate_required([:domain, :type])
  |> validate_format(:domain, ~r/^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  |> validate_number(:risk_score,
    greater_than_or_equal_to: 0.0,
    less_than_or_equal_to: 10.0
  )
  |> validate_coherent_dates()
end

defp validate_coherent_dates(changeset) do
  first_seen = get_field(changeset, :first_seen)
  last_seen = get_field(changeset, :last_seen)

  if first_seen && last_seen && DateTime.compare(first_seen, last_seen) == :gt do
    add_error(changeset, :last_seen, "must be after first_seen")
  else
    changeset
  end
end
```

## Schema-First Design

The Prismatic Platform follows a schema-first design philosophy where the schema is defined before implementation:

| Phase | Activity | Artifact |
|-------|---------|----------|
| **1. Design** | Define data structure and constraints | Ecto schema module |
| **2. Migrate** | Create database tables and indexes | Ecto migration |
| **3. Validate** | Define changeset validation rules | Changeset functions |
| **4. API** | Generate OpenAPI schema | OpenApiSpex schema |
| **5. Test** | Write property-based tests against schema | ExUnit + StreamData |
| **6. Document** | Schema documentation in module docs | `@moduledoc` |

This approach ensures that all layers of the application agree on data structure from the start, reducing integration bugs and making changes traceable.

## Context in Prismatic

Schemas are the structural foundation of the Prismatic Platform's data architecture. Every persistent entity -- from [Perimeter](/glossary/prismatic-perimeter/) assets and vulnerability findings to agent configurations and quality metrics -- is defined through Ecto schemas with typed fields, validated through changesets, and persisted to [PostgreSQL](/glossary/postgresql/) through migrations. The [API gateway](/glossary/api-gateway/) auto-generates OpenAPI schemas from Elixir [type specifications](/glossary/typespec/), ensuring that API contracts stay synchronized with database structure without manual duplication.

The platform's schema design enforces data quality at multiple levels: type checking at compile time through [Dialyzer](/glossary/dialyzer/) and `@spec` annotations, [validation](/glossary/validation/) at runtime through Ecto changesets, and constraint enforcement at the database level through PostgreSQL constraints and indexes. This defense-in-depth approach to data integrity aligns with the NO MERCY doctrine: invalid data is rejected at the earliest possible point, never allowed to propagate through the system.

## Related Terms

- [Database](/glossary/database/) -- Storage systems that schemas define structure for
- [PostgreSQL](/glossary/postgresql/) -- Primary relational database with schema enforcement
- [Validation](/glossary/validation/) -- Data validation implemented through schema changesets
- [Typespec](/glossary/typespec/) -- Elixir type specifications complementing Ecto schemas
- [API Gateway](/glossary/api-gateway/) -- Generates API schemas from Ecto definitions
- [REST API](/glossary/rest-api/) -- Interface layer consuming schema-defined data
- [Swagger UI](/glossary/swagger-ui/) -- Interactive documentation powered by API schemas
- [Protocol](/glossary/protocol/) -- Elixir protocols defining behavior contracts alongside schemas
- [Relational Database](/glossary/relational-database/) -- Database paradigm built on schema-defined tables
- [Dialyzer](/glossary/dialyzer/) -- Type checker validating schema type annotations
- [Prismatic Storage](/glossary/prismatic-storage/) -- Storage layer built on schema definitions
- [Property-Based Testing](/glossary/property-based-testing/) -- Testing approach generating data from schemas

## See Also

- [Architecture](/architecture/) -- Platform data architecture and schema design
- [Apps](/apps/) -- Application schemas across umbrella apps
- [Technologies](/technologies/) -- Ecto, PostgreSQL, and OpenApiSpex
- [Capabilities](/capabilities/) -- Data modeling and validation capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
