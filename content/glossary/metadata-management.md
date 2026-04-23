+++
title = "Metadata Management"
weight = 50
[extra]
tags = ["glossary", "data", "governance", "architecture", "schema", "observability", "platform"]
description = "The systematic practice of defining, collecting, storing, and governing descriptive information about data assets, system components, and operational artifacts to enable discovery, lineage tracking, quality control, and automated decision-making across a platform"
category = "data"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["schema", "data-pipeline", "etl", "ecto", "telemetry", "documentation", "data-provenance", "registry", "observability", "typespec"]
keywords = ["metadata management platform", "data catalog Elixir", "schema registry OTP", "metadata governance", "data lineage tracking", "technical metadata collection", "operational metadata", "business metadata management", "metadata-driven architecture", "ETS metadata store"]
difficulty_level = "intermediate"
platform_relevance = "critical"
elixir_version = "1.19+"
otp_version = "27+"
last_updated = "2026-02-22"
word_count = 1761
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Metadata Management - Prismatic Platform"
+++

## Definition

Metadata Management is the systematic practice of defining, collecting, storing, and governing descriptive information about data assets, system components, and operational artifacts within a software platform. Metadata -- literally "data about data" -- encompasses structural descriptions (schemas, types, relationships), operational details (creation timestamps, processing history, access patterns), and business context (ownership, classification, compliance requirements). Effective metadata management transforms opaque data stores and service architectures into self-describing, discoverable, and governable systems where every artifact carries sufficient context for automated processing, human understanding, and regulatory compliance.

In platform engineering, metadata management extends beyond traditional data catalogs to encompass the entire system topology. Every module, process, configuration value, API endpoint, and deployment artifact carries metadata that describes its purpose, ownership, dependencies, and lifecycle state. When metadata is managed consistently, systems become introspectable -- operators can answer questions like "which services depend on this database table?", "when was this configuration last changed and by whom?", and "what data flows through this pipeline and where does it end up?" without spelunking through source code or querying multiple disconnected systems.

## Overview

The explosion of data-intensive applications, microservice architectures, and regulatory requirements has elevated metadata management from a nice-to-have practice to a critical infrastructure concern. Organizations that neglect metadata management face compounding problems: data scientists cannot find relevant datasets, compliance officers cannot demonstrate data lineage, incident responders cannot trace data flow through systems, and platform engineers cannot assess the impact of schema changes.

Modern metadata management operates across three primary categories:

### Technical Metadata

Technical metadata describes the structural and operational characteristics of data and system components. This includes database schemas (column names, types, constraints), API specifications (endpoints, parameters, response formats), module documentation (typespecs, function signatures, module attributes), and infrastructure configuration (deployment targets, resource limits, scaling policies). Technical metadata is typically extracted automatically from source code, configuration files, and runtime introspection.

### Operational Metadata

Operational metadata captures the dynamic behavior of systems over time. This includes data processing timestamps, pipeline execution durations, error rates, access logs, change history, and performance metrics. Operational metadata answers questions about what happened, when it happened, and how long it took. In the Prismatic Platform, operational metadata feeds into the telemetry pipeline and Quality DNA system for continuous monitoring.

### Business Metadata

Business metadata provides human-meaningful context that technical systems cannot infer. This includes data ownership assignments, classification labels (PII, confidential, public), regulatory applicability (GDPR, NIS2, ZKB), quality expectations, and retention policies. Business metadata requires human curation and organizational governance processes to maintain accuracy.

### The Metadata Lifecycle

Metadata follows its own lifecycle that must be managed:

1. **Definition**: Establishing metadata schemas and standards
2. **Collection**: Extracting or curating metadata from sources
3. **Storage**: Persisting metadata in accessible, queryable formats
4. **Discovery**: Enabling search and navigation of metadata catalogs
5. **Governance**: Maintaining accuracy, completeness, and consistency
6. **Retirement**: Archiving or removing metadata for decommissioned assets

## Technical Details

### Schema Registry Pattern

A central schema registry stores and versions metadata schemas, ensuring consistent interpretation across services:

```elixir
defmodule PrismaticMetadata.SchemaRegistry do
  @moduledoc """
  Central registry for metadata schemas across the platform.
  Stores versioned schema definitions in ETS for fast lookup
  and provides validation against registered schemas.
  Uses semantic versioning for schema evolution tracking.
  """

  use GenServer

  @table :metadata_schema_registry

  @type schema_version :: {pos_integer(), pos_integer(), pos_integer()}
  @type schema_entry :: %{
    name: String.t(),
    version: schema_version(),
    fields: [field_definition()],
    registered_at: DateTime.t(),
    registered_by: String.t(),
    compatibility: :backward | :forward | :full | :none
  }
  @type field_definition :: %{
    name: atom(),
    type: atom(),
    required: boolean(),
    description: String.t(),
    default: term() | nil
  }

  @spec register(String.t(), schema_version(), [field_definition()], keyword()) ::
    {:ok, schema_entry()} | {:error, term()}
  def register(name, version, fields, opts \\ []) do
    GenServer.call(__MODULE__, {:register, name, version, fields, opts})
  end

  @spec lookup(String.t()) :: {:ok, schema_entry()} | {:error, :not_found}
  def lookup(name) do
    case :ets.lookup(@table, name) do
      [{^name, entry}] -> {:ok, entry}
      [] -> {:error, :not_found}
    end
  end

  @spec lookup_version(String.t(), schema_version()) :: {:ok, schema_entry()} | {:error, :not_found}
  def lookup_version(name, version) do
    case :ets.lookup(@table, {name, version}) do
      [{_key, entry}] -> {:ok, entry}
      [] -> {:error, :not_found}
    end
  end

  @spec validate(String.t(), map()) :: :ok | {:error, [String.t()]}
  def validate(schema_name, data) when is_map(data) do
    case lookup(schema_name) do
      {:ok, schema} -> validate_against_schema(data, schema)
      {:error, :not_found} -> {:error, ["Schema '#{schema_name}' not found"]}
    end
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(@table, [:set, :protected, :named_table, read_concurrency: true])
    {:ok, %{table: table, schema_count: 0}}
  end

  @impl GenServer
  def handle_call({:register, name, version, fields, opts}, _from, state) do
    compatibility = Keyword.get(opts, :compatibility, :backward)

    case check_compatibility(name, version, fields, compatibility) do
      :ok ->
        entry = %{
          name: name,
          version: version,
          fields: fields,
          registered_at: DateTime.utc_now(),
          registered_by: Keyword.get(opts, :registered_by, "system"),
          compatibility: compatibility
        }

        :ets.insert(@table, {name, entry})
        :ets.insert(@table, {{name, version}, entry})

        :telemetry.execute(
          [:prismatic, :metadata, :schema_registered],
          %{schema_count: state.schema_count + 1},
          %{name: name, version: version}
        )

        {:reply, {:ok, entry}, %{state | schema_count: state.schema_count + 1}}

      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  defp check_compatibility(_name, _version, _fields, :none), do: :ok

  defp check_compatibility(name, _version, fields, :backward) do
    case lookup(name) do
      {:ok, existing} ->
        existing_required = MapSet.new(existing.fields |> Enum.filter(& &1.required) |> Enum.map(& &1.name))
        new_fields = MapSet.new(Enum.map(fields, & &1.name))
        if MapSet.subset?(existing_required, new_fields), do: :ok, else: {:error, :backward_incompatible}
      {:error, :not_found} -> :ok
    end
  end

  defp check_compatibility(_name, _version, _fields, _mode), do: :ok

  defp validate_against_schema(data, schema) do
    errors =
      schema.fields
      |> Enum.filter(& &1.required)
      |> Enum.reject(fn field -> Map.has_key?(data, field.name) or Map.has_key?(data, Atom.to_string(field.name)) end)
      |> Enum.map(fn field -> "Required field '#{field.name}' is missing" end)

    case errors do
      [] -> :ok
      errors -> {:error, errors}
    end
  end
end
```

### Metadata Collection Pipeline

Automated metadata collection extracts technical metadata from source code and runtime systems:

```elixir
defmodule PrismaticMetadata.Collector do
  @moduledoc """
  Automated metadata collector that extracts technical metadata
  from Elixir modules, Ecto schemas, API specifications, and
  runtime system information. Operates as a pipeline that
  transforms raw system introspection into structured metadata.
  """

  @type source :: :modules | :ecto_schemas | :api_endpoints | :config | :runtime
  @type metadata_record :: %{
    source: source(),
    entity: String.t(),
    attributes: map(),
    collected_at: DateTime.t(),
    collector_version: String.t()
  }

  @collector_version "2.0.0"

  @doc """
  Collects metadata from all available sources and returns
  a unified set of metadata records.
  """
  @spec collect_all() :: {:ok, [metadata_record()]} | {:error, term()}
  def collect_all do
    results =
      [:modules, :ecto_schemas, :api_endpoints, :config]
      |> Task.async_stream(&collect_source/1, max_concurrency: 4, timeout: :timer.seconds(30))
      |> Enum.flat_map(fn
        {:ok, {:ok, records}} -> records
        {:ok, {:error, _reason}} -> []
        {:exit, _reason} -> []
      end)

    {:ok, results}
  end

  @spec collect_source(source()) :: {:ok, [metadata_record()]} | {:error, term()}
  def collect_source(:modules) do
    records =
      :code.all_loaded()
      |> Enum.filter(fn {mod, _} -> prismatic_module?(mod) end)
      |> Enum.map(fn {mod, _path} ->
        %{
          source: :modules,
          entity: inspect(mod),
          attributes: extract_module_metadata(mod),
          collected_at: DateTime.utc_now(),
          collector_version: @collector_version
        }
      end)

    {:ok, records}
  end

  def collect_source(:ecto_schemas) do
    records =
      :code.all_loaded()
      |> Enum.filter(fn {mod, _} -> ecto_schema?(mod) end)
      |> Enum.map(fn {mod, _path} ->
        %{
          source: :ecto_schemas,
          entity: inspect(mod),
          attributes: extract_schema_metadata(mod),
          collected_at: DateTime.utc_now(),
          collector_version: @collector_version
        }
      end)

    {:ok, records}
  end

  def collect_source(_source), do: {:ok, []}

  defp extract_module_metadata(mod) do
    %{
      functions: length(Module.definitions_in(mod, :def)),
      macros: length(Module.definitions_in(mod, :defmacro)),
      has_docs: match?({:docs_v1, _, _, _, _, _, _}, Code.fetch_docs(mod)),
      behaviours: module_behaviours(mod)
    }
  rescue
    _ -> %{error: "metadata extraction failed"}
  end

  defp extract_schema_metadata(mod) do
    %{
      table_name: mod.__schema__(:source),
      fields: mod.__schema__(:fields),
      primary_key: mod.__schema__(:primary_key),
      associations: mod.__schema__(:associations),
      field_count: length(mod.__schema__(:fields))
    }
  rescue
    _ -> %{error: "schema metadata extraction failed"}
  end

  defp prismatic_module?(mod) do
    mod |> inspect() |> String.starts_with?("Prismatic")
  end

  defp ecto_schema?(mod) do
    function_exported?(mod, :__schema__, 1)
  end

  defp module_behaviours(mod) do
    mod.module_info(:attributes)
    |> Keyword.get_values(:behaviour)
    |> List.flatten()
  rescue
    _ -> []
  end
end
```

### Data Lineage Tracking

Metadata management includes tracking how data flows through the system -- from ingestion to transformation to consumption:

```elixir
defmodule PrismaticMetadata.LineageTracker do
  @moduledoc """
  Tracks data lineage across processing stages, recording
  which transformations were applied, by which components,
  and at what times. Enables impact analysis for schema
  changes and regulatory compliance for data governance.
  """

  @type lineage_node :: %{
    entity_id: String.t(),
    entity_type: :table | :view | :api | :file | :stream,
    component: String.t(),
    operation: :read | :write | :transform | :aggregate
  }

  @type lineage_edge :: %{
    source: lineage_node(),
    target: lineage_node(),
    transformation: String.t(),
    recorded_at: DateTime.t()
  }

  @spec record_lineage(lineage_node(), lineage_node(), String.t()) :: :ok
  def record_lineage(source, target, transformation) do
    edge = %{
      source: source,
      target: target,
      transformation: transformation,
      recorded_at: DateTime.utc_now()
    }

    :telemetry.execute(
      [:prismatic, :metadata, :lineage_recorded],
      %{edge_count: 1},
      %{source: source.entity_id, target: target.entity_id}
    )

    persist_edge(edge)
  end

  @spec impact_analysis(String.t()) :: {:ok, [lineage_edge()]}
  def impact_analysis(entity_id) do
    downstream = find_downstream(entity_id, MapSet.new())
    {:ok, downstream}
  end

  defp find_downstream(_entity_id, _visited), do: []
  defp persist_edge(_edge), do: :ok
end
```

## Implementation

Implementing metadata management in a production platform follows a maturity model that progresses through four stages.

### Stage 1: Extraction

The initial stage focuses on automated extraction of technical metadata from existing systems. In an Elixir/OTP platform, this means introspecting loaded modules (`Code.fetch_docs/1`, `Module.definitions_in/2`), Ecto schemas (`__schema__/1`), and configuration (`Application.get_all_env/1`). The goal is to build a baseline inventory of what exists in the platform without requiring manual curation.

### Stage 2: Cataloging

With raw metadata collected, the next stage organizes it into a searchable catalog. This involves normalizing metadata formats, establishing naming conventions, creating relationships between metadata entities (for example, linking an API endpoint to its backing Ecto schema), and providing search interfaces. In the Prismatic Platform, the AIAD agent registry serves as a catalog for the 530+ agent metadata entries.

### Stage 3: Governance

Governance adds policies and processes around metadata quality. This includes assigning ownership to metadata entities, establishing update schedules, defining completeness requirements, and implementing validation rules. The Quality DNA system represents governance applied to quality metadata -- ensuring that quality measurements are complete, accurate, and current.

### Stage 4: Automation

The most mature stage uses metadata to drive automated decisions. Schema registries validate data at pipeline boundaries, lineage trackers assess change impact automatically, and metadata-driven code generators produce boilerplate from schema definitions. The Prismatic API's auto-introspection system exemplifies this stage: it discovers all public functions across facade modules and generates OpenAPI specifications entirely from metadata (typespecs, function signatures, documentation).

## Comparison

### Metadata Management vs. Documentation

| Dimension | Metadata Management | Documentation |
|-----------|-------------------|---------------|
| **Format** | Structured, machine-readable | Semi-structured, human-readable |
| **Collection** | Automated extraction plus curation | Manual authoring |
| **Consumers** | Systems, tools, and humans | Primarily humans |
| **Staleness risk** | Lower (automated extraction) | Higher (manual maintenance) |
| **Expressiveness** | Limited to schema-defined fields | Free-form, unlimited |
| **Queryability** | SQL or API queries, programmatic access | Full-text search only |

### Metadata Management vs. Data Catalog

A data catalog is a specific implementation of metadata management focused on data assets (tables, datasets, pipelines). Metadata management is broader, encompassing system components, infrastructure, processes, and operational artifacts. A data catalog is a tool; metadata management is a practice.

### Metadata Management vs. Configuration Management

Configuration management controls system behavior through parameters. Metadata management describes system structure and context. They overlap where configuration metadata describes what configurations exist and what they do, but diverge in scope: metadata management encompasses all descriptive information, not just operational parameters.

## Best Practices

**Automate metadata collection wherever possible.** Manual metadata entry is error-prone and unsustainable. Use compile-time introspection, runtime reflection, and CI/CD pipeline hooks to extract metadata automatically. Reserve manual curation for business metadata that cannot be inferred from code.

**Version metadata schemas.** Metadata formats evolve as platforms grow. Use semantic versioning for metadata schemas and enforce backward compatibility to prevent breaking consumers when schemas change. The SchemaRegistry pattern above demonstrates this with compatibility checking on registration.

**Establish metadata ownership.** Every metadata entity should have a defined owner responsible for its accuracy and completeness. Without ownership, metadata degrades as systems evolve and nobody maintains the descriptions.

**Use metadata to generate, not just describe.** The highest-value metadata drives code generation, documentation generation, and validation. When API documentation is generated from typespecs and schemas, it is always accurate. When validation rules are derived from schema definitions, they are always consistent with the data model.

**Link metadata across layers.** Technical metadata becomes far more valuable when linked to operational and business metadata. A database column linked to its data classification (PII), processing pipeline (ETL job), consumer (dashboard), and owner (team) enables comprehensive impact analysis and compliance reporting.

**Measure metadata quality.** Track completeness (percentage of entities with metadata), accuracy (percentage of metadata verified against reality), and freshness (age of last metadata update). Treat metadata quality as a quality domain alongside code quality and test coverage.

## Common Pitfalls

**Metadata silos.** Different teams maintain separate metadata stores (a data team catalog, an infrastructure CMDB, a service registry) with no cross-references. This fragmentation defeats the purpose of metadata management by making cross-cutting queries impossible. Establish a unified metadata model or at minimum a federation layer that links disparate stores.

**Over-engineering the metadata model.** Designing an elaborate metadata ontology before collecting any metadata leads to paralysis. Start with simple, flat metadata records and evolve the model as patterns emerge. The Prismatic Platform's metadata started as simple module attributes and grew into structured schema registries over multiple generations.

**Treating metadata as static.** Metadata that is collected once and never updated quickly becomes misleading. Implement continuous metadata collection (analogous to continuous measurement) and flag stale metadata for review. The Collector module above runs periodically to refresh extracted metadata.

**Ignoring operational metadata.** Many metadata management initiatives focus on structural metadata (schemas, definitions) while neglecting operational metadata (access patterns, processing times, error rates). Operational metadata is often more valuable for day-to-day decision-making and incident response.

**Coupling metadata consumers to specific formats.** When metadata consumers are tightly coupled to a specific schema version, any schema evolution breaks them. Use versioned APIs for metadata access and provide adapters that translate between schema versions.

## Use Cases

### API Auto-Discovery

The Prismatic API uses metadata management to discover all public functions across Prismatic facade modules at boot time. By introspecting module documentation (`Code.fetch_docs/1`), type specifications (`Code.Typespec.fetch_specs/1`), and function exports (`Module.__info__/1`), the API generates a complete OpenAPI specification and routing table without manual configuration. Adding a new public function to any facade module automatically exposes it as an API endpoint.

### Quality Domain Tracking

The Quality DNA system manages metadata about 13 quality domains across 115 umbrella applications. Each domain's metadata includes its current score, violation count, trend direction, and last measurement timestamp. This metadata drives the Quality Floor Guardian's enforcement decisions and the AutoEvolve system's improvement targeting.

### AIAD Agent Registry

The platform's 530+ AIAD agents are described by structured metadata files (`.agent.md`) that include agent name, tier, capabilities, dependencies, and enforcement policies. The agent registry indexes this metadata for discovery, orchestration, and impact analysis. When an agent is modified, the registry metadata enables automated assessment of downstream effects.

### Compliance Reporting

Metadata management enables automated compliance reporting by linking data assets to their classification, processing purposes, retention policies, and legal bases. For GDPR compliance, metadata tracks which personal data fields exist, where they flow, who accesses them, and when they are deleted. For NIS2 compliance, metadata maps critical assets to their security controls and incident response procedures.

### Schema Migration Impact Analysis

Before applying a database schema migration, metadata lineage tracking identifies all downstream consumers of the affected tables -- API endpoints, reporting queries, ETL pipelines, and cached materialized views. This impact analysis prevents migrations from breaking consumers and enables coordinated rollouts across dependent services.

## Related Concepts

- [Schema](@/glossary/schema.md) -- Structural definitions that form the foundation of technical metadata
- [Data Pipeline](@/glossary/data-pipeline.md) -- Processing infrastructure that generates and consumes operational metadata
- [ETL](@/glossary/etl.md) -- Extract-Transform-Load processes that rely on metadata for source and target descriptions
- [Ecto](@/glossary/ecto.md) -- Elixir database library whose schemas provide rich extractable metadata
- [Telemetry](@/glossary/telemetry.md) -- Event system that generates operational metadata for runtime monitoring
- [Documentation](@/glossary/documentation.md) -- Human-readable knowledge artifacts complementing machine-readable metadata
- [Data Provenance](@/glossary/data-provenance.md) -- Tracking data origins and transformation history through metadata lineage
- [Registry](@/glossary/registry.md) -- Centralized lookup systems that store and serve component metadata
- [Observability](@/glossary/observability.md) -- System property enabled by comprehensive operational metadata
- [TypeSpec](@/glossary/typespec.md) -- Elixir type annotations that serve as extractable function-level metadata

## See Also

- [Prismatic API](@/glossary/prismatic-api.md) -- Auto-introspecting REST gateway driven by module metadata
- [Architecture](@/architecture/_index.md) -- Platform architecture documentation describing metadata flows
- [AIAD](@/glossary/aiad.md) -- Agent framework with standardized metadata schemas for all components
- [Quality DNA](@/glossary/quality-dna.md) -- Cross-session quality metadata persistence and analysis

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
