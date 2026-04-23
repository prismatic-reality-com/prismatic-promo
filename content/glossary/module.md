+++
title = "Module"
weight = 50
[extra]
description = "The fundamental code organization unit in Elixir, encapsulating functions, types, documentation, and module attributes within a namespace."
category = "elixir"
related_terms = ["behaviour", "protocol", "genserver", "macro"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["module", "Elixir", "defmodule", "namespace", "code organization", "glossary", "Prismatic Platform"]
tags = ["glossary", "elixir"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Module - Prismatic Platform"
+++

## Definition & Overview

In Elixir, a module is the fundamental unit of code organization. Defined with `defmodule`, a module encapsulates related functions, type specifications, documentation, module attributes, and compile-time configuration within a hierarchical namespace. Modules serve as the primary mechanism for grouping functionality, defining public APIs, implementing behaviours, and structuring large codebases into manageable, composable units.

Unlike classes in object-oriented languages, Elixir modules do not carry instance state. They are collections of functions that operate on data passed as arguments, following the functional programming paradigm. This stateless nature makes modules inherently composable and testable: any function can be called independently with the appropriate arguments, without needing to construct object instances or manage lifecycle concerns.

The Prismatic Platform's 115 umbrella applications contain thousands of modules, organized by the platform's feature-based directory structure. Each module follows strict naming conventions (no Manager/Handler/Utils/Helper suffixes), includes comprehensive typespecs and documentation, and exposes a minimal public API through explicit `def` (public) versus `defp` (private) function declarations. The platform's facade pattern uses top-level modules as public entry points for each umbrella application.

## Technical Deep Dive

Modules in Elixir are compiled into BEAM bytecode and loaded as atoms in the VM's module table. The BEAM stores module metadata (functions, attributes, documentation, typespecs) in chunks within the compiled `.beam` file, accessible at runtime through `:beam_lib.chunks/2`. This introspection capability is the foundation of the Prismatic Platform's self-registering architecture, where `@after_compile` callbacks extract tool configurations from compiled modules.

Module attributes (`@moduledoc`, `@doc`, `@spec`, `@type`, `@behaviour`, `@impl`) provide compile-time metadata that serves multiple purposes. Documentation attributes are used by ExDoc for documentation generation. Type specifications are used by Dialyzer for static analysis. Behaviour declarations establish contracts that the compiler verifies. The `@impl` attribute explicitly marks callback implementations, enabling both compiler verification and reader clarity.

```elixir
defmodule PrismaticDd.Client do
  @moduledoc """
  DD pipeline fetch phase client.

  Handles downloading raw data from registered sources and
  staging it in the dd_fetch_records table for subsequent
  loading by the Loader module.

  ## Architecture

  The Client operates as a stateless service module. Each fetch
  operation is independent and idempotent. Results are stored in
  PostgreSQL for durability and audit trail.

  ## Usage

      {:ok, run} = PrismaticDd.Client.fetch_group(:forbes)
      {:ok, records} = PrismaticDd.Client.get_fetch_records(run.id)
  """

  alias PrismaticDd.Repo
  alias PrismaticDd.Schemas.FetchRecord
  alias PrismaticDd.SourceRegistry

  @type fetch_result :: {:ok, FetchRecord.t()} | {:error, term()}

  @doc """
  Fetches all records from sources in the given group.

  ## Parameters

    * `group` - Source group atom (e.g., `:forbes`, `:parliament`)

  ## Returns

    * `{:ok, fetch_record}` - Fetch completed successfully
    * `{:error, reason}` - Fetch failed with reason

  ## Examples

      iex> PrismaticDd.Client.fetch_group(:forbes)
      {:ok, %FetchRecord{status: :completed, records_fetched: 100}}
  """
  @spec fetch_group(atom()) :: fetch_result()
  def fetch_group(group) when is_atom(group) do
    sources = SourceRegistry.by_group(group)

    results =
      sources
      |> Task.async_stream(&fetch_source/1, max_concurrency: 5, timeout: 60_000)
      |> Enum.reduce({[], []}, fn
        {:ok, {:ok, records}}, {ok, err} -> {[records | ok], err}
        {:ok, {:error, reason}}, {ok, err} -> {ok, [reason | err]}
        {:exit, reason}, {ok, err} -> {ok, [{:exit, reason} | err]}
      end)

    case results do
      {records, []} ->
        store_fetch_results(group, List.flatten(records))

      {_records, errors} ->
        {:error, {:partial_failure, errors}}
    end
  end

  @spec fetch_source(map()) :: {:ok, [map()]} | {:error, term()}
  defp fetch_source(source) do
    source.module.fetch(source.config)
  end

  @spec store_fetch_results(atom(), [map()]) :: fetch_result()
  defp store_fetch_results(group, records) do
    Repo.insert_fetch_record(%{
      group: group,
      records_fetched: length(records),
      raw_data: records,
      status: :completed,
      fetched_at: DateTime.utc_now()
    })
  end
end
```

Module compilation in Elixir happens in dependency order. The compiler analyzes module references (function calls, struct usage, behaviour implementation) to determine compilation order, recompiling dependent modules when dependencies change. The `@after_compile` callback used by the self-registering pattern executes after the module's bytecode is finalized but within the same compilation process, ensuring registration data reflects the final compiled state.

## Architecture & Implementation

The Prismatic Platform's module architecture follows three organizational principles. First, the facade pattern: each umbrella app exposes its public API through a single top-level module (e.g., `PrismaticDd`, `PrismaticOsintCore`, `PrismaticPerimeter`) that delegates to internal modules. External consumers interact only with the facade, allowing internal restructuring without breaking consumers.

Second, the behaviour-contract pattern: internal modules implement behaviours that define their expected interface. The `PrismaticOsintCore.Tool` behaviour, `PrismaticAcademy.Topic` behaviour, and `PrismaticDd.Source` behaviour all use this pattern to ensure consistent interfaces across implementations while enabling polymorphic dispatch.

Third, the context-based grouping pattern: modules within an app are organized by business context (schemas, queries, services) rather than technical role (controllers, models, views). This keeps related code together and makes it easier to understand the full implementation of a feature by reading modules in a single directory.

## Usage in Prismatic Platform

The self-registering module pattern demonstrates advanced module usage:

```elixir
defmodule PrismaticOsintCore.Adapters.Shodan do
  @moduledoc """
  Shodan OSINT adapter - self-registers via Tool behaviour.
  """

  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "shodan-host-search",
    name: "Shodan Host Search",
    category: :global,
    api_style: :provider,
    input_fields: [
      %{name: :query, type: :text, label: "Search Query", required: true},
      %{name: :page, type: :number, label: "Page", required: false}
    ],
    requires_auth: true
  })

  @impl PrismaticOsintCore.Tool
  def run(%{query: query} = params) do
    page = Map.get(params, :page, 1)

    with {:ok, client} <- build_client(),
         {:ok, response} <- Tesla.get(client, "/shodan/host/search",
           query: [query: query, page: page]) do
      {:ok, format_response(response.body)}
    end
  end

  defp build_client do
    middleware = [
      {Tesla.Middleware.BaseUrl, "https://api.shodan.io"},
      {Tesla.Middleware.Query, [key: api_key()]},
      Tesla.Middleware.JSON
    ]

    {:ok, Tesla.client(middleware)}
  end

  defp api_key, do: Application.get_env(:prismatic_osint_core, :shodan_api_key)
  defp format_response(body), do: body
end
```

This pattern, replicated across 127 OSINT tools, 4 DD sources, and 4 Academy topics, demonstrates how Elixir's module system enables powerful metaprogramming patterns that eliminate boilerplate while maintaining type safety and compile-time verification.

## Cross-References

- [Behaviour](/glossary/behaviour/) - Contract system for module interfaces
- [GenServer](/glossary/genserver/) - Stateful module pattern using OTP
- [Protocol](/glossary/protocol/) - Data-type polymorphism mechanism
- [Macro](/glossary/macro/) - Compile-time code generation in modules
- **OTP Release** - Deployment packaging of compiled modules

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
