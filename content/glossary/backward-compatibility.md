+++
title = "Backward Compatibility"
weight = 50
[extra]
description = "The property of a system, protocol, or API that enables newer versions to interoperate with inputs, data, or interfaces designed for older versions -- and why the Prismatic Platform deliberately prefers clean breaks under the NWB doctrine"
category = "architecture"
domain = "platform-engineering"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["api-versioning", "contract", "configuration", "compile-time", "binary", "compliance", "deployment", "ecto", "migration", "schema", "semver", "no-mercy-no-doubts", "releases-elixir"]
tags = ["glossary", "backward-compatibility", "compatibility", "api", "versioning", "migration", "evolution", "beam", "nwb", "clean-break"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Backward compatibility ensures platform evolution does not break existing integrations -- though the Prismatic Platform prefers clean breaks over compatibility shims when explicitly authorized under the NWB (No Way Back) doctrine"
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["backward compatibility", "backwards compatible", "API compatibility", "breaking changes", "migration", "deprecation", "semver", "interoperability", "version compatibility", "NWB doctrine", "clean breaks", "schema migration", "Ecto migration", "API versioning"]
image = "/images/sections/glossary.png"
image_alt = "Backward Compatibility - Prismatic Platform"
word_count = 3400
see_also = ["capabilities", "architecture", "agents", "technologies"]
+++

## Definition

Backward compatibility (also written as "backwards compatibility") is the property of a system where newer versions can accept and correctly process inputs, data formats, or API calls designed for older versions. A backward-compatible change preserves existing behavior while adding new capabilities. Breaking backward compatibility forces all consumers to update simultaneously, which is costly and risky in distributed systems with multiple integration partners.

The concept originates from hardware engineering -- IBM's System/360 (1964) was one of the first architectures to guarantee that software written for earlier models would run unchanged on newer hardware. In software, backward compatibility spans multiple dimensions: wire protocol compatibility (network messages), binary compatibility (compiled artifacts), source compatibility (code that compiles against both old and new APIs), behavioral compatibility (identical observable behavior), and data compatibility (stored formats readable by new code).

In the Prismatic Platform, backward compatibility is deliberately NOT the default posture. The platform operates under the **NWB (No Way Back) doctrine**, which mandates permanent solutions over temporary compatibility shims. This means that when a breaking change is necessary, the platform prefers a clean break with explicit migration tooling over accumulating compatibility layers that create long-term technical debt. The rationale is clear: compatibility shims are invisible dependencies that rot over time, creating fragile code paths that are rarely tested and frequently misunderstood.

This does not mean the platform breaks things carelessly. External-facing APIs use versioned URL paths (`/api/v1/`, `/api/v2/`), database schemas evolve through Ecto migrations with explicit up/down paths, and breaking changes are documented with migration guides. The distinction is that internal module interfaces, GenServer protocols, and inter-app contracts within the umbrella are allowed to break freely, with the compilation step serving as the compatibility check.

## Core Concepts

### Compatibility Dimensions

| Dimension | Definition | Example | Breaking Impact |
|-----------|-----------|---------|-----------------|
| **Wire Protocol** | Network message format stability | JSON response field removal | All API consumers fail |
| **Binary** | Compiled artifact interop | BEAM bytecode version change | Requires recompilation |
| **Source** | Code compiles against both versions | Function signature change | Compilation errors |
| **Behavioral** | Same inputs produce same outputs | Algorithm change returning different results | Silent data corruption |
| **Data/Schema** | Stored data readable by new code | Database column removal | Query failures, data loss |
| **Configuration** | Config files work across versions | Environment variable rename | Application startup failure |

### Compatibility Matrix

| Change Type | Backward Compatible? | NWB Preferred Approach | Example |
|-------------|---------------------|----------------------|---------|
| Add new field to response | Yes | Additive -- always safe | Adding `created_at` to API response |
| Add new optional parameter | Yes | Additive -- always safe | New optional `?limit=` query param |
| Remove field from response | NO | Clean break + migration guide | Removing `legacy_id` field |
| Change field type | NO | New field + deprecation | Changing `count` from integer to string |
| Rename endpoint | NO | Version bump `/api/v2/` | `/api/v1/users` to `/api/v2/accounts` |
| Add new endpoint | Yes | Additive -- always safe | Adding `/api/v1/reports` |
| Change error format | NO | Version bump + envelope versioning | Restructuring error response envelope |
| Remove Ecto column | NO | Migration with data preservation | Dropping `dd_entities.legacy_score` |
| Rename GenServer message | NO | Direct rename, compile catches it | `:fetch_all` to `:list_items` |

### Clean Break vs. Compatibility Shim

| Approach | Pros | Cons | Prismatic Preference |
|----------|------|------|---------------------|
| **Clean break** | No legacy code, clear contracts, testable | Forces consumer updates | Preferred (NWB doctrine) |
| **Compatibility shim** | No consumer impact short-term | Code complexity, invisible dependencies, testing burden | Avoided |
| **Version gate** | Controlled migration, parallel support | Dual maintenance, test matrix explosion | Used for external APIs only |
| **Adapter pattern** | Isolates old interface behind abstraction | Additional indirection, performance cost | Used for storage adapters |
| **Feature flag** | Gradual rollout, easy rollback | State management complexity, flag debt | Used for UI features only |

### Semver and Breaking Change Classification

| Semver Component | When to Bump | Breaking? | Example |
|-----------------|-------------|-----------|---------|
| **Major** (X.0.0) | Incompatible API changes | Yes | Removing REST endpoint |
| **Minor** (0.X.0) | New functionality, backward compatible | No | Adding new OSINT adapter |
| **Patch** (0.0.X) | Bug fixes, backward compatible | No | Fixing query parameter parsing |

## Technical Deep Dive

### The NWB Tension

The fundamental tension in platform engineering is between stability (never break consumers) and velocity (evolve quickly without baggage). Traditional software engineering defaults to stability, creating elaborate deprecation policies, multi-version support matrices, and compatibility shims that accumulate over years.

The Prismatic Platform resolves this tension through the **NWB (No Way Back) doctrine**: all solutions must be built for permanence, with no backward compatibility shims permitted in internal interfaces. The rationale is mathematical: if a system maintains N compatibility shims, the testing surface grows as O(N * M) where M is the number of consumers. At 94 umbrella apps and 552 agents, even a small number of shims creates an untestable combinatorial explosion.

NWB does not mean "break things recklessly." It means:

1. **Internal interfaces break freely** -- the compiler catches it, tests validate it, and the umbrella structure ensures all consumers are updated atomically in the same commit.
2. **External APIs use versioned paths** -- `/api/v1/` contracts are frozen once published; new behavior lives in `/api/v2/`.
3. **Database schemas use migrations** -- Ecto migrations provide explicit, reversible, auditable schema evolution.
4. **Configuration changes use compile-time validation** -- `Application.compile_env/3` catches stale config at build time.

### API Versioning Strategy

The Prismatic Platform uses URL path versioning for its REST API (served by `prismatic_api` on port 4004):

```
/api/v1/osint/list_tools      # V1 contract -- frozen
/api/v1/dd/cases               # V1 contract -- frozen
/api/v2/osint/list_tools      # V2 contract -- may differ
```

Version selection is handled at the router level, with each version mapping to a distinct controller module. Old versions are never patched -- they either work as originally specified or are removed entirely when the deprecation period expires.

### Schema Migration Patterns

Database schema evolution is the most critical backward compatibility concern because data persists across deployments. The platform uses Ecto migrations exclusively:

```elixir
defmodule PrismaticDd.Repo.Migrations.RenameEntityScoreToRiskRating do
  @moduledoc """
  NWB-compliant migration: renames column rather than adding a compatibility
  alias. All application code updated atomically in the same commit.

  ## Migration Safety
  - Reversible: yes (rename back in down/0)
  - Data loss: none (rename preserves data)
  - Downtime: minimal (metadata-only operation on PostgreSQL)
  """
  use Ecto.Migration

  def up do
    rename table(:dd_entities), :score, to: :risk_rating
    flush()

    # Update any dependent indexes
    drop_if_exists index(:dd_entities, [:score])
    create index(:dd_entities, [:risk_rating])
  end

  def down do
    rename table(:dd_entities), :risk_rating, to: :score
    flush()

    drop_if_exists index(:dd_entities, [:risk_rating])
    create index(:dd_entities, [:score])
  end
end
```

### Binary Compatibility on the BEAM

The BEAM virtual machine provides strong binary compatibility guarantees within an OTP release. Compiled `.beam` files from OTP 27 will run on any OTP 27.x runtime. However, cross-major-version compatibility is not guaranteed -- the bytecode format, instruction set, and external term format may change between OTP 26 and OTP 27.

For hot code upgrades (loading new module versions into a running system), the BEAM requires that the new module's exports are compatible with existing call sites. Elixir releases built with `mix release` handle this through appup files that specify upgrade and downgrade instructions.

### Contract Testing for Adapter Stability

The Prismatic Platform uses contract tests (also called "interface tests") to verify that storage adapter implementations satisfy the `PrismaticStorageCore.Adapter` behaviour without breaking consumers:

```elixir
defmodule PrismaticStorageCore.AdapterContractTest do
  @moduledoc """
  Contract test suite ensuring all storage adapters maintain
  backward-compatible behavior. Any adapter implementing the
  Adapter behaviour must pass these tests.
  """

  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter)

      describe "#{inspect(@adapter)} contract compliance" do
        test "get/2 returns {:ok, value} for existing keys" do
          assert {:ok, _} = @adapter.put("test_key", %{data: "value"})
          assert {:ok, %{data: "value"}} = @adapter.get("test_key")
        end

        test "get/2 returns {:error, :not_found} for missing keys" do
          assert {:error, :not_found} = @adapter.get("nonexistent_key_#{System.unique_integer()}")
        end

        test "delete/1 removes existing keys" do
          assert {:ok, _} = @adapter.put("delete_key", %{data: "value"})
          assert :ok = @adapter.delete("delete_key")
          assert {:error, :not_found} = @adapter.get("delete_key")
        end

        test "list/1 returns bounded results" do
          assert {:ok, results} = @adapter.list(limit: 10)
          assert length(results) <= 10
        end
      end
    end
  end
end
```

## Usage in Prismatic Platform

### Internal Interface Evolution (NWB)

Within the 94-app umbrella, backward compatibility is explicitly NOT maintained for internal Elixir module interfaces. When a function signature changes in `prismatic_osint_core`, all callers in `prismatic_osint_sources`, `prismatic_osint_monitoring`, and `prismatic_web` are updated in the same commit. The compiler guarantees that no stale call sites remain:

```bash
# Compilation with --warnings-as-errors catches all stale references
mix compile --warnings-as-errors --force
```

This approach is possible because the umbrella structure co-locates all producers and consumers. A breaking change in a library app is immediately visible to all dependent apps during compilation.

### External API Stability

The REST API at `/api/v1/` is the one area where backward compatibility is maintained rigorously. External consumers (CI systems, third-party integrations, the promo site) depend on stable response formats. Changes here follow a strict protocol:

1. New functionality is added to the existing version if additive
2. Breaking changes require a new version (`/api/v2/`)
3. Old versions are supported for a minimum of 90 days
4. Deprecation headers are added to old version responses

### Storage Adapter Contracts

Each storage adapter (ETS, Ecto, Meilisearch, KuzuDB) implements the `PrismaticStorageCore.Adapter` behaviour. The contract test suite runs against every adapter, ensuring that swapping adapters does not break consumers. This is the adapter pattern applied as a compatibility strategy.

### Ecto Schema Versioning

Database schemas are the most durable backward compatibility surface. The platform maintains a strict policy:

- **Additive changes** (new columns with defaults): single migration, no coordination needed
- **Rename/remove changes**: migration + application code change in same commit (NWB)
- **Type changes**: new column + data migration + old column removal in separate migrations

### Quality DNA State Documents

The `.claude/quality-dna/current-state.json` files use schema versioning to handle format evolution. Each document includes a `schema_version` field, and the reader code handles multiple versions:

```elixir
defmodule PrismaticQuality.StateReader do
  @moduledoc """
  Reads Quality DNA state documents with schema version handling.
  Supports schema versions 1 through 3 with automatic upgrade.
  """

  @spec read(Path.t()) :: {:ok, map()} | {:error, term()}
  def read(path) do
    with {:ok, content} <- File.read(path),
         {:ok, data} <- Jason.decode(content) do
      {:ok, upgrade_schema(data)}
    end
  end

  @spec upgrade_schema(map()) :: map()
  defp upgrade_schema(%{"schema_version" => 3} = data), do: data
  defp upgrade_schema(%{"schema_version" => 2} = data) do
    data
    |> Map.put("enforcement_matrix", %{})
    |> Map.put("schema_version", 3)
    |> upgrade_schema()
  end
  defp upgrade_schema(%{"schema_version" => 1} = data) do
    data
    |> Map.put("doctrine_compliance", %{})
    |> Map.put("schema_version", 2)
    |> upgrade_schema()
  end
  defp upgrade_schema(data) do
    Map.put(data, "schema_version", 1) |> upgrade_schema()
  end
end
```

## Code Examples

### Compatibility Guard Module

```elixir
defmodule PrismaticAPI.CompatibilityGuard do
  @moduledoc """
  Guards API endpoints against accidental backward-incompatible changes.
  Used in development and CI to detect breaking changes before release.

  The guard compares an old schema snapshot against the current schema
  and classifies every difference as additive (safe) or breaking (requires
  version bump). This runs as part of the pre-deploy validation pipeline.
  """

  @type field_change :: %{
          field: String.t(),
          change_type: :removed | :type_changed | :added,
          old_value: term(),
          new_value: term()
        }

  @type change_analysis :: %{
          breaking_changes: [field_change()],
          additive_changes: [field_change()],
          is_backward_compatible: boolean(),
          requires_version_bump: boolean()
        }

  @doc """
  Analyzes changes between two schema versions and classifies each
  difference as breaking or additive.

  ## Examples

      iex> old = %{name: :string, age: :integer}
      iex> new = %{name: :string, age: :integer, email: :string}
      iex> result = PrismaticAPI.CompatibilityGuard.analyze_changes(old, new)
      iex> result.is_backward_compatible
      true

      iex> old = %{name: :string, age: :integer}
      iex> new = %{name: :string}
      iex> result = PrismaticAPI.CompatibilityGuard.analyze_changes(old, new)
      iex> result.is_backward_compatible
      false
  """
  @spec analyze_changes(map(), map()) :: change_analysis()
  def analyze_changes(old_schema, new_schema) do
    removed_fields = Map.keys(old_schema) -- Map.keys(new_schema)
    added_fields = Map.keys(new_schema) -- Map.keys(old_schema)

    type_changes =
      old_schema
      |> Enum.filter(fn {key, type} ->
        Map.has_key?(new_schema, key) and Map.get(new_schema, key) != type
      end)
      |> Enum.map(fn {key, old_type} ->
        %{
          field: to_string(key),
          change_type: :type_changed,
          old_value: old_type,
          new_value: Map.get(new_schema, key)
        }
      end)

    breaking =
      Enum.map(removed_fields, fn field ->
        %{field: to_string(field), change_type: :removed, old_value: Map.get(old_schema, field), new_value: nil}
      end) ++ type_changes

    additive =
      Enum.map(added_fields, fn field ->
        %{field: to_string(field), change_type: :added, old_value: nil, new_value: Map.get(new_schema, field)}
      end)

    %{
      breaking_changes: breaking,
      additive_changes: additive,
      is_backward_compatible: breaking == [],
      requires_version_bump: breaking != []
    }
  end

  @doc """
  Validates that a proposed schema change is backward compatible.
  Returns :ok or {:error, reasons} with human-readable descriptions.
  """
  @spec validate_compatibility(map(), map()) :: :ok | {:error, [String.t()]}
  def validate_compatibility(old_schema, new_schema) do
    analysis = analyze_changes(old_schema, new_schema)

    if analysis.is_backward_compatible do
      :ok
    else
      reasons =
        Enum.map(analysis.breaking_changes, fn change ->
          case change.change_type do
            :removed -> "Field '#{change.field}' was removed"
            :type_changed -> "Field '#{change.field}' type changed from #{inspect(change.old_value)} to #{inspect(change.new_value)}"
          end
        end)

      {:error, reasons}
    end
  end
end
```

### Migration-Based Schema Evolution

```elixir
defmodule PrismaticDd.Repo.Migrations.AddEntityRiskAttributes do
  @moduledoc """
  Additive migration that preserves backward compatibility.
  Adds new columns without modifying existing ones.

  All new columns have defaults, ensuring that existing queries
  and Ecto schemas continue to work without modification.
  """
  use Ecto.Migration

  def change do
    alter table(:dd_entities) do
      add :risk_score, :float, default: nil
      add :risk_category, :string, default: "unassessed"
      add :last_verified_at, :utc_datetime_usec, default: nil
      add :verification_source, :string, default: nil
    end

    create index(:dd_entities, [:risk_score])
    create index(:dd_entities, [:risk_category])
    create index(:dd_entities, [:last_verified_at])
  end
end
```

### API Version Router

```elixir
defmodule PrismaticAPI.Router do
  @moduledoc """
  API router with explicit version boundaries.
  Each version maps to a separate controller module,
  ensuring that V1 contracts are frozen permanently.
  """
  use Plug.Router

  plug :match
  plug :dispatch

  # V1 -- frozen contract, no modifications allowed
  forward "/api/v1/osint", to: PrismaticAPI.V1.OsintController
  forward "/api/v1/dd", to: PrismaticAPI.V1.DdController
  forward "/api/v1/health", to: PrismaticAPI.V1.HealthController

  # V2 -- active development, may evolve
  forward "/api/v2/osint", to: PrismaticAPI.V2.OsintController

  match _ do
    send_resp(conn, 404, Jason.encode!(%{error: "Not found", api_versions: ["v1", "v2"]}))
  end
end
```

## Common Pitfalls

| Pitfall | Description | Impact | Prevention |
|---------|------------|--------|------------|
| **Invisible shim accumulation** | Compatibility layers added "just for now" that persist for years | Exponential testing surface growth | NWB doctrine: no shims in internal interfaces |
| **Silent behavioral change** | Same function signature, different behavior | Data corruption, wrong results | Property-based testing with historical inputs |
| **Config drift** | Environment variables renamed without updating all consumers | Application startup failures | `Application.compile_env/3` + compile-time validation |
| **Migration ordering** | Running migrations out of order in multi-node deployments | Schema inconsistency | Sequential migration locks, single migration runner |
| **Phantom dependencies** | Code depends on undocumented behavior of an older version | Breaks on seemingly unrelated changes | Contract tests, explicit interface documentation |
| **Deprecation without removal** | Marking code deprecated but never removing it | Permanent compatibility burden | Time-boxed deprecation with automated removal |
| **Test matrix explosion** | Supporting N versions creates N*M test combinations | Untestable compatibility surface | Maximum 2 concurrent API versions |
| **Binary format assumptions** | Assuming BEAM bytecode is stable across OTP versions | Runtime crashes after OTP upgrade | Recompile all dependencies on OTP version change |
| **ETS schema coupling** | Multiple processes assuming ETS table structure | Coordinated update required | ETS access through dedicated GenServer interface |
| **PubSub message format** | Changing PubSub message structure breaks subscribers | Silent subscriber failures | Versioned message envelopes |

## Best Practices

1. **Default to clean breaks for internal interfaces**: Unless external consumers depend on the interface, prefer removing old code entirely over maintaining compatibility layers. The umbrella structure ensures all callers are updated atomically.

2. **Version external APIs with URL paths**: Use `/api/v1/`, `/api/v2/` for APIs consumed by external systems. Freeze each version permanently once published. Never patch a frozen version.

3. **Use Ecto migrations exclusively for schema changes**: Database changes must always go through versioned, reversible migrations. Never use raw SQL in application code to alter schemas.

4. **Document every breaking change**: Every breaking change must be documented in the commit message and release notes with explicit migration instructions for affected consumers.

5. **Test behavioral compatibility with property tests**: Use `StreamData` generators to verify that new implementations produce the same outputs as old implementations for the same inputs.

6. **Set time-boxed deprecation deadlines**: If you must deprecate rather than remove, set a concrete removal date (maximum 90 days) and enforce it with a compile-time warning that becomes an error after the deadline.

7. **Use compile-time configuration validation**: Replace `Application.get_env/3` with `Application.compile_env/3` to catch stale configuration references at build time rather than runtime.

8. **Maintain contract test suites for behaviour implementations**: Every behaviour (storage adapter, OSINT tool, Academy topic) should have a shared contract test that all implementations must pass.

9. **Limit concurrent API versions to two**: Supporting more than two concurrent versions creates an untestable compatibility surface. When V3 is released, V1 is removed.

10. **Treat database migrations as irreversible in production**: While Ecto migrations support `down/0`, in practice rolling back production data migrations is dangerous. Write migrations that are safe to run forward-only.

## Related Terms

- [API Versioning](/glossary/api-versioning/) -- version management enabling controlled compatibility
- [Compilation](/glossary/compilation/) -- build phase that catches compatibility breaks
- [Compile-Time](/glossary/compile-time/) -- compile-time configuration validation
- [Configuration](/glossary/configuration/) -- version-aware configuration management
- [Contract](/glossary/contract/) -- formal agreements between API provider and consumer
- [Deployment](/glossary/deployment/) -- release process where compatibility is validated
- [Doctrine](/glossary/doctrine/) -- NWB doctrine governing compatibility decisions
- [Ecto](/glossary/ecto/) -- database toolkit with migration-based schema evolution
- [No Mercy No Doubts](/glossary/no-mercy-no-doubts/) -- enforcement doctrine prohibiting shims
- [Releases (Elixir)](/glossary/releases-elixir/) -- self-contained deployable artifacts
- [Schema](/glossary/schema/) -- data structure definitions requiring compatibility management
- [Semver](/glossary/semver/) -- versioning standard signaling compatibility status

## See Also

- [Semantic Versioning](https://semver.org/) -- versioning standard for compatibility signaling
- [Prismatic API](/glossary/prismatic-api/) -- platform REST gateway with versioning
- [Ecto Migration Documentation](https://hexdocs.pm/ecto_sql/Ecto.Migration.html) -- official migration reference
- [BEAM Compatibility](https://www.erlang.org/doc/system/compatibility.html) -- OTP compatibility guarantees

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
