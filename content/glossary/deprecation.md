+++
title = "Deprecation"
weight = 50

[extra]
description = "Formal process of marking software features, APIs, or modules as obsolete with a planned removal timeline, providing migration guidance while maintaining backward compatibility during the transition period"
category = "platform"
domain = "software-engineering"
complexity = "intermediate"
stability = "mature"
beam_related = true
related_terms = ["api", "versioning", "deployment", "documentation", "elixir", "mix", "compilation", "behaviour", "releases-elixir", "gateway", "endpoint", "code-change"]
tags = ["glossary", "deprecation", "api", "versioning", "lifecycle", "migration"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Elixir's @deprecated module attribute and compiler warnings provide first-class deprecation support, enabling the Prismatic Platform to evolve its umbrella architecture without breaking downstream consumers."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Deprecation", "API", "versioning", "lifecycle", "module deprecation", "@deprecated", "migration", "backward compatibility", "glossary", "Prismatic Platform", "Elixir"]
image = "/images/sections/glossary.png"
image_alt = "Deprecation - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "apps"]
+++

## Definition

Deprecation is the formal process of marking software components -- functions, modules, APIs, configuration options, CLI commands -- as obsolete with a planned removal timeline. Deprecated components continue to function during a transition period but generate warnings to guide consumers toward replacement implementations. Effective deprecation balances the need for platform evolution with the responsibility to existing users, providing clear migration paths and sufficient transition time.

Deprecation is not removal. It is a signal: "this still works, but it will stop working in a known future version, and here is what you should use instead." The distinction matters because premature removal breaks consumers without warning, while perpetual deprecation accumulates technical debt without resolution. A disciplined deprecation policy defines clear lifecycle stages: active, deprecated (with timeline), sunset (final warning), and removed.

In compiled languages and platforms like Elixir/BEAM, deprecation integrates directly with the compiler. Elixir's `@deprecated` module attribute causes the compiler to emit warnings whenever deprecated functions are called, making deprecation violations visible at build time rather than at runtime. The Prismatic Platform leverages this to enforce deprecation awareness across its umbrella architecture, where changes in one app may deprecate interfaces consumed by dozens of others.

---

## Core Concepts

### Deprecation Lifecycle Stages

| Stage | Signal | Duration | Action Required |
|-------|--------|----------|-----------------|
| **Active** | None | Indefinite | Normal usage |
| **Soft Deprecation** | Documentation notice | 1-2 releases | Plan migration |
| **Hard Deprecation** | Compiler/runtime warning | 2-3 releases | Execute migration |
| **Sunset** | Error-level warning | 1 release | Final migration window |
| **Removed** | Compilation/runtime error | Permanent | Must have migrated |

### Deprecation Mechanisms by Level

| Deprecation Level | Mechanism | Visibility | Prismatic Usage |
|------------------|-----------|------------|-----------------|
| **Function** | `@deprecated "Use new_function/1 instead"` | Compiler warning | Internal API evolution |
| **Module** | `@deprecated "Module removed in v4.0"` | Compiler warning | Storage adapter migration |
| **Mix Task** | Warning in task output + `IO.warn/1` | Runtime warning | Task consolidation |
| **API Endpoint** | `Deprecation` HTTP header + response body notice | HTTP response header | REST API versioning |
| **Configuration** | Warning in Application.start callback | Boot-time warning | Config key migration |
| **CLI Flag** | Warning in OptionParser output | Stderr warning | Command-line tool evolution |
| **Behaviour Callback** | `@deprecated` on `@optional_callbacks` | Compiler warning | Contract evolution |
| **PubSub Topic** | Documentation + dual-publish period | Runtime transparency | Event schema migration |

### Deprecation vs. Related Concepts

| Concept | Definition | Relationship to Deprecation |
|---------|------------|----------------------------|
| **Removal** | Permanent deletion of a component | Final stage after deprecation |
| **Versioning** | Parallel existence of multiple API versions | Alternative to deprecation |
| **Feature Flags** | Runtime toggle for features | Can control deprecation visibility |
| **Migration** | Process of moving from old to new implementation | Consumer action during deprecation |
| **Breaking Change** | Incompatible API modification | What deprecation prevents |
| **Backward Compatibility** | Old interfaces still work | What deprecation provides temporarily |
| **Forward Compatibility** | New code works with old data | Orthogonal concern |

---

## Technical Deep Dive

### Elixir's Built-in Deprecation Support

Elixir provides first-class deprecation support through the `@deprecated` module attribute. When a function annotated with `@deprecated` is called, the Elixir compiler emits a warning at compile time. This is superior to runtime-only deprecation warnings because it catches usage before code ships to production.

The compiler stores deprecation metadata in the module's documentation chunk, making it accessible through `Code.fetch_docs/1`. This enables automated tooling to discover all deprecated functions across the codebase, generate migration reports, and track deprecation compliance.

### Compiler Warning Integration

The `--warnings-as-errors` flag converts deprecation warnings into compilation failures in CI, ensuring that deprecated function usage cannot be merged. The Prismatic Platform enforces this in its pre-commit hooks via `mix compile --warnings-as-errors --force`, making deprecation violations blocking rather than advisory.

### HTTP API Deprecation Headers

For REST API endpoints, the platform follows the IETF `Deprecation` header specification (draft-ietf-httpapi-deprecation-header). Deprecated endpoints include three headers in responses:

```
Deprecation: Sun, 01 Jun 2026 00:00:00 GMT
Sunset: Sun, 01 Sep 2026 00:00:00 GMT
Link: </api/v2/entities>; rel="successor-version"
```

This allows HTTP clients to programmatically detect and respond to deprecated endpoints without parsing response bodies.

### Cross-App Deprecation in Umbrella Architecture

In a large umbrella with many apps, deprecating a function in one app may affect consumers across many other apps. The platform addresses this through:

1. **Compile-time detection**: `--warnings-as-errors` catches all cross-app deprecation usage
2. **Deprecation scanning**: A dedicated mix task scans all modules for `@deprecated` attributes
3. **Migration tracking**: Each deprecation is tracked with a removal version and replacement path
4. **Coordinated releases**: Apps are released together, ensuring deprecation timelines are synchronized

---

## Usage in Prismatic Platform

### Module-Level Deprecation

```elixir
defmodule PrismaticStorage.LegacyAdapter do
  @moduledoc """
  Legacy storage adapter maintained for backward compatibility.
  All functions are deprecated in favor of PrismaticStorage.Core.

  This module will be removed in Prismatic Platform v4.0.

  ## Migration Guide

  Replace all calls to this module with their PrismaticStorage.Core equivalents:

  | Legacy Function | Replacement |
  |----------------|-------------|
  | `fetch/1` | `PrismaticStorage.Core.get/2` |
  | `store/2` | `PrismaticStorage.Core.put/3` |
  | `remove/1` | `PrismaticStorage.Core.delete/2` |
  | `list_all/0` | `PrismaticStorage.Core.list/1` |
  """

  require Logger

  @deprecated "Use PrismaticStorage.Core.get/2 instead. Will be removed in v4.0"
  @spec fetch(String.t()) :: {:ok, term()} | {:error, :not_found}
  def fetch(key) do
    Logger.warning("PrismaticStorage.LegacyAdapter.fetch/1 is deprecated",
      module: __MODULE__,
      replacement: "PrismaticStorage.Core.get/2",
      removal_version: "4.0"
    )

    PrismaticStorage.Core.get(key, [])
  end

  @deprecated "Use PrismaticStorage.Core.put/3 instead. Will be removed in v4.0"
  @spec store(String.t(), term()) :: :ok | {:error, term()}
  def store(key, value) do
    Logger.warning("PrismaticStorage.LegacyAdapter.store/2 is deprecated",
      module: __MODULE__,
      replacement: "PrismaticStorage.Core.put/3",
      removal_version: "4.0"
    )

    case PrismaticStorage.Core.put(key, value, []) do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end
end
```

### API Endpoint Deprecation Plug

```elixir
defmodule PrismaticWeb.Plugs.DeprecationHeader do
  @moduledoc """
  Plug that adds IETF Deprecation and Sunset headers to responses
  for deprecated API endpoints. Consults the deprecation registry
  to determine header values.

  ## Examples

      # In router pipeline:
      plug PrismaticWeb.Plugs.DeprecationHeader
  """

  @behaviour Plug

  alias PrismaticApi.DeprecationRegistry

  @doc """
  Initializes the plug with optional configuration.
  """
  @spec init(keyword()) :: keyword()
  def init(opts), do: opts

  @doc """
  Checks if the current request path matches a deprecated endpoint
  and adds appropriate headers if so.

  ## Examples

      iex> conn = %Plug.Conn{request_path: "/api/v1/legacy/fetch"}
      iex> conn = call(conn, [])
      iex> Plug.Conn.get_resp_header(conn, "deprecation")
      # Returns deprecation date if endpoint is deprecated
  """
  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(conn, _opts) do
    case DeprecationRegistry.lookup(conn.request_path, conn.method) do
      {:deprecated, %{deprecation_date: dep, sunset_date: sun, successor: succ}} ->
        conn
        |> Plug.Conn.put_resp_header("deprecation", format_http_date(dep))
        |> Plug.Conn.put_resp_header("sunset", format_http_date(sun))
        |> Plug.Conn.put_resp_header("link", "<#{succ}>; rel=\"successor-version\"")

      :active ->
        conn
    end
  end

  defp format_http_date(datetime) do
    Calendar.strftime(datetime, "%a, %d %b %Y %H:%M:%S GMT")
  end
end
```

---

## Code Examples

### Deprecation Tracker

```elixir
defmodule Prismatic.Deprecation.Tracker do
  @moduledoc """
  Tracks deprecated function usage across the platform,
  generating reports for migration planning and deadline
  enforcement. Scans all loaded Prismatic modules for
  @deprecated attributes and correlates with caller analysis.

  ## Examples

      iex> {:ok, deprecations} = Prismatic.Deprecation.Tracker.scan_deprecations()
      iex> is_list(deprecations)
      true
  """

  require Logger

  @type usage :: %{
    module: module(),
    function: atom(),
    arity: non_neg_integer(),
    callers: list({module(), atom(), non_neg_integer()}),
    removal_version: String.t(),
    replacement: String.t()
  }

  @type report :: %{
    total_deprecated: non_neg_integer(),
    by_version: %{String.t() => list(usage())},
    overdue: list(usage()),
    scan_timestamp: DateTime.t()
  }

  @doc """
  Scans all loaded Prismatic modules for deprecated functions.
  Returns a list of deprecation usage records with metadata.

  ## Examples

      iex> {:ok, results} = Prismatic.Deprecation.Tracker.scan_deprecations()
      iex> Enum.all?(results, &is_map/1)
      true
  """
  @spec scan_deprecations() :: {:ok, list(usage())}
  def scan_deprecations do
    deprecated =
      :code.all_loaded()
      |> Enum.filter(fn {mod, _} -> prismatic_module?(mod) end)
      |> Enum.flat_map(fn {mod, _} -> extract_deprecations(mod) end)

    {:ok, deprecated}
  end

  @doc """
  Generates a comprehensive deprecation report grouped by
  removal version, with overdue items highlighted.

  ## Examples

      iex> {:ok, report} = Prismatic.Deprecation.Tracker.generate_report()
      iex> Map.has_key?(report, :total_deprecated)
      true
  """
  @spec generate_report() :: {:ok, report()}
  def generate_report do
    {:ok, deprecations} = scan_deprecations()

    by_version =
      deprecations
      |> Enum.group_by(& &1.removal_version)
      |> Enum.sort_by(fn {version, _} -> version end)
      |> Map.new()

    current_version = Application.spec(:prismatic, :vsn) |> to_string()

    overdue =
      Enum.filter(deprecations, fn dep ->
        dep.removal_version != "unknown" &&
          Version.compare(dep.removal_version <> ".0", current_version <> ".0") != :gt
      end)

    report = %{
      total_deprecated: length(deprecations),
      by_version: by_version,
      overdue: overdue,
      scan_timestamp: DateTime.utc_now()
    }

    if overdue != [] do
      Logger.warning(
        "Found #{length(overdue)} overdue deprecations past removal deadline",
        overdue_count: length(overdue)
      )
    end

    {:ok, report}
  end

  @doc """
  Validates that no overdue deprecations exist. Returns :ok if clean,
  or {:error, list} with overdue items. Used in CI pipeline.

  ## Examples

      iex> Prismatic.Deprecation.Tracker.validate_no_overdue()
      :ok
  """
  @spec validate_no_overdue() :: :ok | {:error, list(usage())}
  def validate_no_overdue do
    {:ok, report} = generate_report()

    case report.overdue do
      [] -> :ok
      overdue -> {:error, overdue}
    end
  end

  defp extract_deprecations(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, :elixir, _, _, _, docs} ->
        Enum.flat_map(docs, fn
          {{:function, name, arity}, _, _, _, %{deprecated: message}} ->
            [%{
              module: module,
              function: name,
              arity: arity,
              removal_version: extract_version(message),
              replacement: message,
              callers: []
            }]
          _ ->
            []
        end)

      _ ->
        []
    end
  end

  defp prismatic_module?(mod) do
    mod |> Atom.to_string() |> String.starts_with?("Elixir.Prismatic")
  end

  defp extract_version(message) do
    case Regex.run(~r/v(\d+\.\d+)/, message) do
      [_, version] -> version
      _ -> "unknown"
    end
  end
end
```

### Mix Task for Deprecation Audit

```elixir
defmodule Mix.Tasks.Deprecation.Audit do
  @moduledoc """
  Mix task that audits all deprecations across the platform
  and generates a human-readable report.

  ## Usage

      mix deprecation.audit
      mix deprecation.audit --format=json
      mix deprecation.audit --fail-on-overdue
  """

  use Mix.Task

  @shortdoc "Audit all deprecated functions across the platform"

  @doc false
  @spec run(list(String.t())) :: :ok
  def run(args) do
    Mix.Task.run("app.start")

    {opts, _, _} = OptionParser.parse(args,
      strict: [format: :string, fail_on_overdue: :boolean]
    )

    {:ok, report} = Prismatic.Deprecation.Tracker.generate_report()

    case Keyword.get(opts, :format, "text") do
      "json" -> IO.puts(Jason.encode!(report, pretty: true))
      "text" -> print_text_report(report)
    end

    if Keyword.get(opts, :fail_on_overdue, false) && report.overdue != [] do
      Mix.raise("Found #{length(report.overdue)} overdue deprecations")
    end
  end

  defp print_text_report(report) do
    IO.puts("\n=== Deprecation Audit Report ===")
    IO.puts("Total deprecated: #{report.total_deprecated}")
    IO.puts("Overdue: #{length(report.overdue)}")
    IO.puts("Scan time: #{report.scan_timestamp}\n")

    Enum.each(report.by_version, fn {version, deps} ->
      IO.puts("--- Version #{version} (#{length(deps)} items) ---")
      Enum.each(deps, fn dep ->
        IO.puts("  #{inspect(dep.module)}.#{dep.function}/#{dep.arity}")
        IO.puts("    Replacement: #{dep.replacement}")
      end)
    end)
  end
end
```

---

## Common Pitfalls

| Pitfall | Symptom | Solution |
|---------|---------|----------|
| **Deprecating without replacement** | Users cannot migrate; deprecated code persists forever | Always specify replacement in `@deprecated` message |
| **No removal timeline** | Deprecated code accumulates indefinitely | Include version number: `"Will be removed in v4.0"` |
| **Removing without deprecation** | Compilation failures in downstream apps | Always deprecate for at least one release before removing |
| **Ignoring `--warnings-as-errors`** | Deprecated usage slips into production | Enforce in CI; Prismatic pre-commit hooks enforce this |
| **Deprecating internal functions** | Unnecessary noise for implementation details | Only deprecate public API (`def`, not `defp`) |
| **Silent runtime deprecation** | `IO.warn/1` missed in log noise | Use `@deprecated` attribute for compile-time visibility |
| **Cross-app deprecation blindness** | App A deprecates, Apps B-Z unaware | Umbrella-wide compilation catches all cross-app usage |
| **API deprecation without headers** | HTTP clients cannot detect programmatically | Use `Deprecation` + `Sunset` + `Link` headers per IETF spec |
| **Deprecating without migration guide** | Users know what is deprecated but not how to migrate | Include step-by-step migration in `@moduledoc` |
| **Too short deprecation window** | Users cannot migrate in time | Minimum 2 release cycles for public API deprecation |
| **Deprecation warning fatigue** | Too many warnings cause developers to ignore all of them | Prioritize and batch deprecation waves |
| **Config key deprecation** | App crashes on startup with old config | Provide adapter that reads old key and maps to new key |

---

## Best Practices

1. **Always provide replacement guidance** -- the `@deprecated` message must specify exactly what to use instead, with module and function name.
2. **Set explicit removal timelines** -- specify the version where removal will occur so consumers can plan migrations proactively.
3. **Treat deprecation warnings as errors in CI** -- `--warnings-as-errors` ensures deprecated usage is addressed before merge.
4. **Maintain a deprecation changelog** -- document all deprecations with migration instructions in release notes.
5. **Deprecate before removing** -- never remove public API without at least two release cycles of deprecation warnings.
6. **Use structured logging for runtime deprecation** -- `Logger.warning/2` with metadata enables programmatic deprecation tracking.
7. **Add HTTP deprecation headers to REST APIs** -- follow the IETF `Deprecation` header specification for machine-readable signals.
8. **Scan for overdue deprecations in CI** -- run `mix deprecation.audit --fail-on-overdue` to ensure past-deadline items are resolved.
9. **Coordinate cross-app deprecation waves** -- in umbrella architecture, deprecate and migrate in coordinated batches, not ad hoc.
10. **Test the migration path** -- write tests that exercise both the deprecated path and the replacement to ensure behavioral equivalence.

---

## Related Terms

- [API](/glossary/api/) -- primary surface where deprecation affects external consumers
- [Versioning](/glossary/versioning/) -- alternative approach to managing API evolution
- [Deployment](/glossary/deployment/) -- release process where deprecation warnings surface
- [Documentation](/glossary/documentation/) -- migration guides accompanying deprecation notices
- [Elixir](/glossary/elixir/) -- language providing first-class `@deprecated` attribute support
- [Mix](/glossary/mix/) -- build tool enforcing `--warnings-as-errors` for deprecation
- [Compilation](/glossary/compilation/) -- phase where `@deprecated` warnings are emitted
- [Behaviour](/glossary/behaviour/) -- contract system where callback deprecation applies
- [Releases (Elixir)](/glossary/releases-elixir/) -- release lifecycle tied to deprecation timelines
- [Gateway](/glossary/gateway/) -- API gateway managing deprecated endpoint routing
- [Endpoint](/glossary/endpoint/) -- HTTP endpoints subject to deprecation headers
- [Code Change](/glossary/code-change/) -- hot code upgrades interacting with deprecation

---

## See Also

- [Architecture](/architecture/) -- platform evolution and API versioning strategies
- [Apps](/apps/) -- umbrella applications subject to deprecation lifecycle
- [Capabilities](/capabilities/) -- platform capabilities that may be deprecated over time
- **Elixir Docs**: [Module attributes](https://hexdocs.pm/elixir/Module.html) -- official `@deprecated` documentation
- **IETF**: [draft-ietf-httpapi-deprecation-header](https://datatracker.ietf.org/doc/draft-ietf-httpapi-deprecation-header/) -- HTTP deprecation header specification

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
