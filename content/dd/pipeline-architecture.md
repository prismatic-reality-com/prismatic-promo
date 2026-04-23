+++
title = "Client/Loader Pipeline Architecture"
weight = 95
date = "2026-02-23"

[extra]
tags = ["pipeline", "client-loader", "etl", "metaprogramming", "elixir", "otp", "self-registering", "postgresql"]
icon = "bolt"
color = "cyan"
description = "Two-phase Client/Loader pipeline with self-registering sources via metaprogramming, PostgreSQL fortress tables, diff detection, and periodic scheduling"
category = "technical"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
word_count = 2200
difficulty = "advanced"
image = "/images/dd/pipeline-architecture.png"
image_alt = "DD Client/Loader Pipeline with self-registering source modules"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "1.0.0"
last_enhanced = "2026-02-23"
quality_score = 92
see_also = ["platform-architecture", "entity-management", "osint-integration", "czech-registries"]
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Pipeline", "Client", "Loader", "Architecture", "Self-Registering", "Metaprogramming", "PostgreSQL", "ETS", "Elixir", "OTP"]
+++

## Abstract

The Prismatic DD Client/Loader Pipeline is a two-phase entity loading architecture that replaces the legacy bulk processing system with a PostgreSQL-backed, diff-aware pipeline. Sources self-register via Elixir metaprogramming (behaviour + macro + `@after_compile` hook), enabling zero-configuration addition of new data sources. The Client phase fetches raw data from OSINT adapters into staging tables, while the Loader phase normalizes, deduplicates, and persists entities and relationships into fortress PostgreSQL tables. A GenServer-based Scheduler manages periodic refresh cycles with configurable intervals per source group.

## Introduction

### The Entity Loading Challenge

Due diligence platforms must ingest entities from dozens of heterogeneous data sources -- government registries, business databases, sanctions lists, and public records -- each with different data formats, update frequencies, and reliability characteristics. The challenge is threefold:

1. **Source Heterogeneity**: Each source returns data in a different format. Forbes CZ provides ranked wealth lists, the Czech Parliament API provides member directories, and sanctions databases provide structured watchlists. A unified loading pipeline must normalize all of these into a consistent entity model.

2. **Change Detection**: Re-fetching 50,000+ entities daily is wasteful if only a fraction have changed. Content-hash-based diff detection enables the pipeline to skip unchanged records, reducing database writes and processing time by orders of magnitude.

3. **Source Registration**: Adding new data sources should require minimal boilerplate. The self-registering source pattern -- borrowed from the platform's OSINT tool registry -- enables new sources to appear in the pipeline and UI automatically upon compilation.

### Architecture Overview

```
Source Modules (self-registering via @after_compile)
        |
        v
  SourceRegistry (ETS GenServer)
        |
   +----+----+
   |         |
   v         v
 Client    Scheduler
 (fetch)   (periodic)
   |         |
   v         |
dd_fetch_records (PostgreSQL staging)
   |         |
   v         v
 Loader ----+
 (normalize + persist)
   |
   +--------+--------+
   |        |        |
   v        v        v
dd_entities  dd_relationships  dd_entity_attributes
   (PostgreSQL fortress tables)
```

## Self-Registering Source Pattern

### The Source Behaviour

Every DD data source implements the `PrismaticDd.Source` behaviour, which defines four callbacks:

| Callback | Phase | Purpose |
|----------|-------|---------|
| `get_source_config/0` | Registration | Returns source metadata (slug, group, entity type, estimated count) |
| `fetch/1` | Client | Downloads raw data from the OSINT adapter |
| `normalize/1` | Loader | Transforms a raw data record into standardized entity attributes |
| `extract_relationships/2` | Loader | Extracts relationships from raw data for a given entity |

### Metaprogramming Registration

The `use PrismaticDd.Source` macro injects three things:

1. **Behaviour declaration**: `@behaviour PrismaticDd.Source`
2. **Import**: `register_source/1` macro
3. **Default implementation**: `extract_relationships/2` returns `[]` (overridable)

The `register_source/1` macro stores the configuration as a module attribute and sets up an `@after_compile` hook that fires during compilation:

```elixir
defmacro register_source(config) do
  quote do
    @source_config unquote(config)
    @impl PrismaticDd.Source
    def get_source_config, do: @source_config
    @after_compile PrismaticDd.Source
  end
end
```

The `__after_compile__/2` callback extracts the `@source_config` attribute from the compiled BEAM bytecode and registers it in the `SourceRegistry` ETS table:

```elixir
def __after_compile__(_env, bytecode) do
  case :beam_lib.chunks(bytecode, [:attributes]) do
    {:ok, {module, [{:attributes, attributes}]}} ->
      case Keyword.get(attributes, :source_config) do
        [config] when is_map(config) ->
          PrismaticDd.SourceRegistry.register_source(module, config)
        _ -> :ok
      end
    _ -> :ok
  end
end
```

This pattern mirrors the OSINT tool self-registration used elsewhere in the platform, ensuring consistency across the codebase.

### Source Implementation Example

```elixir
defmodule PrismaticDd.Sources.ForbesCz do
  use PrismaticDd.Source

  register_source(%{
    slug: "forbes-cz",
    name: "Forbes Czech Republic",
    description: "Top 100 wealthiest Czechs from Forbes CZ annual ranking",
    group: :forbes,
    entity_type: :person,
    estimated_count: 100,
    refresh_interval_hours: 168,
    adapter_module: PrismaticOsintSources.Adapters.Czech.ForbesCz,
    tags: ["czech", "wealth", "business"]
  })

  @impl true
  def fetch(opts) do
    PrismaticOsintSources.Adapters.Czech.ForbesCz.list_richest(opts)
  end

  @impl true
  def normalize(raw_data) do
    %{
      name: raw_data["name"],
      type: "person",
      source_id: raw_data["rank"] |> to_string(),
      identifiers: %{},
      attributes: %{
        "net_worth_czk" => raw_data["net_worth"],
        "rank" => raw_data["rank"],
        "industry" => raw_data["industry"]
      }
    }
  end
end
```

### SourceRegistry GenServer

The `PrismaticDd.SourceRegistry` is an ETS-backed GenServer providing sub-millisecond lookups:

| Operation | Function | Description |
|-----------|----------|-------------|
| Register | `register_source/2` | Stores module + config in ETS (called by `@after_compile`) |
| List | `list_sources/0` | Returns all registered sources |
| By group | `sources_by_group/1` | Returns sources for a specific group (e.g., `:forbes`) |
| By slug | `get_source/1` | Lookup by slug string (e.g., `"forbes-cz"`) |
| Groups | `get_groups/0` | Returns group list with source counts |

## Client Phase (Fetch)

The `PrismaticDd.Client` module implements the fetch phase:

1. **Source resolution**: Queries `SourceRegistry` for all sources in the target group
2. **Adapter dispatch**: Calls `source.fetch(opts)` on each source module
3. **Content hashing**: Computes MD5 hash of each raw record for diff detection
4. **Staging insert**: Bulk inserts raw data into `dd_fetch_records` with conflict skip
5. **Run tracking**: Creates a `LoadRun` record with fetch statistics
6. **PubSub broadcast**: Emits progress events on `"dd:pipeline"` topic

Key features:
- **Dry run mode**: Preview without side effects (`Client.fetch_group(:forbes, dry_run: true)`)
- **Fetch versioning**: Each fetch creates a new version for temporal tracking
- **Conflict resolution**: `ON CONFLICT DO NOTHING` on `(source_group, source_id, fetch_version)` prevents duplicates

## Loader Phase (Persist)

The `PrismaticDd.Loader` module implements the load phase:

1. **Pending records**: Reads `dd_fetch_records` with `status = "pending"` for the group
2. **Source resolution**: Resolves the source module for normalization
3. **Diff detection**: Compares `content_hash` of fetch record vs existing entity
4. **Normalization**: Calls `source.normalize(raw_data)` to produce entity attributes
5. **Entity upsert**: Inserts or updates `dd_entities` based on `source_group + source_id`
6. **Relationship extraction**: Calls `source.extract_relationships/2` and upserts relationships
7. **Status update**: Marks fetch records as `loaded`, `skipped`, or `failed`
8. **Run tracking**: Creates a `LoadRun` record with load statistics

Key features:
- **Skip unchanged**: Records with matching content hashes are skipped (status: `"skipped"`)
- **Force mode**: `Loader.load_group(:parliament, force: true)` ignores content hash diff
- **Relationship loading**: Extracts and persists entity-to-entity relationships

## PostgreSQL Fortress Tables

The pipeline persists data into five PostgreSQL tables with UUID primary keys:

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `dd_entities` | Normalized entity records | `(source_group, source_id)` unique, `source_group`, `status` |
| `dd_relationships` | Entity-to-entity relationships | `(from_entity_id, to_entity_id, type)` unique, FKs |
| `dd_fetch_records` | Raw fetched data staging | `(source_group, source_id, fetch_version)` unique, `status` |
| `dd_load_runs` | Pipeline run audit trail | `source_group`, `phase`, `started_at` |
| `dd_entity_attributes` | Multi-source entity attributes | `(entity_id, key, source)` unique |

All tables use `timestamps()` with UTC precision and JSONB columns for flexible attribute storage.

## Scheduler

The `PrismaticDd.Scheduler` GenServer manages periodic refresh cycles:

| Source Group | Default Interval | Rationale |
|--------------|-----------------|-----------|
| Sanctions | 1 hour | Rapidly changing, compliance-critical |
| Parliament | 24 hours | Election cycle updates |
| Senate | 24 hours | Election cycle updates |
| Forbes | 168 hours (7 days) | Annual ranking, slow change |
| Local Gov | 168 hours (7 days) | Low change frequency |
| Top Firms | 24 hours | Contract updates |
| ARES Sweep | 24 hours | Registry updates |
| ISIR | 24 hours | Insolvency proceedings |
| Court Parties | 24 hours | Court filings |
| PEP | 24 hours | Politically exposed persons |

The Scheduler uses `Process.send_after/3` for timer management (no external dependencies) and delegates pipeline execution to `Task.Supervisor` workers. Active run deduplication prevents concurrent runs of the same group.

### Scheduler API

```elixir
PrismaticDd.Scheduler.status()   # Current schedule state
PrismaticDd.Scheduler.pause()    # Pause all scheduled runs
PrismaticDd.Scheduler.resume()   # Resume scheduling
PrismaticDd.Scheduler.trigger(:forbes)  # Immediate fetch+load
```

## LiveView Dashboard

The Pipeline Dashboard at `/hub/dd/pipeline` provides real-time monitoring:

- **Source group grid**: 10 groups displayed as color-coded cards with entity counts and status
- **Pipeline controls**: Per-group fetch/load/full pipeline triggers, plus "Run All" for full sweep
- **Scheduler controls**: Pause/resume toggle, next run times, active run indicators
- **View modes**: Grid view (cards) and table view (dense data)
- **Real-time updates**: PubSub subscription to `"dd:pipeline"` topic for live progress
- **Selected group detail**: Click a group to see source modules, entity counts, and last run stats

## Registered Sources

| Module | Slug | Group | Entity Type | Est. Count |
|--------|------|-------|-------------|------------|
| `Sources.ForbesCz` | `forbes-cz` | `:forbes` | person | ~100 |
| `Sources.Parliament` | `parliament` | `:parliament` | person | ~200 |
| `Sources.Senate` | `senate` | `:senate` | person | ~81 |
| `Sources.LocalGov` | `local-gov` | `:local_gov` | person | ~200 |

Additional sources (sanctions, PEP, top firms, ARES sweep, ISIR, court parties) are planned for future registration.

## References

- [Platform Architecture](@/dd/platform-architecture.md) -- Full technical architecture of the DD subsystem
- [Entity Management](@/dd/entity-management.md) -- Entity data model and operations
- [Czech Registry Integration](@/dd/czech-registries.md) -- 30+ Czech registry adapters
- [OSINT Integration](@/dd/osint-integration.md) -- 122 OSINT source framework
- [OSINT Sources](@/osint/_index.md) -- Complete source catalog
- [Glossary: Elixir Macro](@/glossary/elixir-macro.md) -- Metaprogramming and compile-time code generation
- [Glossary: GenServer](@/glossary/genserver.md) -- OTP process pattern
- [Glossary: ETS](@/glossary/ets.md) -- Erlang Term Storage

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
