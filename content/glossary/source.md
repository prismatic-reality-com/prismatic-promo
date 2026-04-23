+++
title = "Source"
weight = 50
[extra]
description = "OSINT data origin or DD pipeline data provider that self-registers via metaprogramming and feeds intelligence collection workflows"
category = "intelligence"
related_terms = ["osint", "source-registry", "adapter", "dd-pipeline", "provider", "tool-registry", "signal"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["source", "OSINT", "DD pipeline", "data provider", "intelligence", "glossary", "Prismatic Platform"]
tags = ["glossary", "intelligence", "osint"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Source - Prismatic Platform"
+++

## Definition & Overview

A source is a data origin from which intelligence or entity information is collected. In OSINT (Open Source Intelligence), a source is any publicly accessible data provider -- a government registry, a DNS resolver, a certificate transparency log, a social media API. In the DD (Due Diligence) pipeline, a source is a structured data provider that supplies entity records for normalization, deduplication, and relationship mapping. The source concept spans both subsystems, representing the entry point where external data enters the platform's processing pipeline.

In the Prismatic Platform, sources are not passive configurations but active, self-registering modules. Both the OSINT tool system and the DD pipeline use the same metaprogramming pattern: a module declares `use PrismaticOsintCore.Tool` or `use PrismaticDd.Source`, calls a registration macro with its configuration, and an `@after_compile` hook automatically inserts the source into an ETS-backed registry. This self-registration pattern means that adding a new source requires writing a single module -- no manual configuration files, no registry updates, no routing changes. The source is discoverable and executable immediately upon compilation.

The platform currently manages 127 OSINT sources across 7 categories (Czech, Global, Sanctions, EU, UK, US, Universal) and 4 DD sources (ForbesCz, Parliament, Senate, LocalGov). Each source carries metadata about its category, input requirements, authentication needs, rate limits, and output schema. This metadata drives automatic UI generation, API exposure, and scheduling decisions.

## Technical Deep Dive

### DD Source Behaviour

The DD pipeline defines sources through an Elixir behaviour with a self-registration macro:

```elixir
defmodule PrismaticDd.Source do
  @moduledoc """
  Behaviour and self-registration macro for DD pipeline sources.
  Modules that `use PrismaticDd.Source` and call `register_source/1`
  are automatically discoverable via the SourceRegistry.
  """

  @callback fetch(params :: map()) :: {:ok, [map()]} | {:error, term()}
  @callback normalize(raw :: map()) :: {:ok, map()} | {:error, term()}
  @callback source_config() :: map()

  defmacro __using__(_opts) do
    quote do
      @behaviour PrismaticDd.Source
      import PrismaticDd.Source, only: [register_source: 1]

      @after_compile __MODULE__

      def __after_compile__(_env, _bytecode) do
        config = __MODULE__.source_config()
        PrismaticDd.SourceRegistry.register(__MODULE__, config)
      end
    end
  end

  defmacro register_source(config) do
    quote do
      @source_config unquote(config)

      @impl true
      def source_config, do: @source_config
    end
  end
end
```

### Concrete Source Implementation

A DD source implements the behaviour with domain-specific fetching and normalization:

```elixir
defmodule PrismaticDd.Sources.ForbesCz do
  @moduledoc """
  Forbes Czech Republic rich list data source.
  Fetches and normalizes entity data from Forbes CZ rankings.
  """

  use PrismaticDd.Source

  register_source(%{
    slug: "forbes-cz",
    name: "Forbes Czech Republic",
    group: :forbes,
    entity_type: :person,
    country: "CZ",
    estimated_count: 100,
    refresh_interval_hours: 168,
    requires_auth: false
  })

  @impl true
  def fetch(_params) do
    case Tesla.get(base_url()) do
      {:ok, %{status: 200, body: body}} ->
        {:ok, parse_rankings(body)}

      {:ok, %{status: status}} ->
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl true
  def normalize(raw_entry) do
    {:ok, %{
      name: raw_entry["name"],
      entity_type: :person,
      source_slug: "forbes-cz",
      attributes: %{
        net_worth: raw_entry["net_worth"],
        rank: raw_entry["rank"],
        industry: raw_entry["industry"],
        country: "CZ"
      },
      external_id: "forbes-cz-#{raw_entry["rank"]}"
    }}
  end

  defp base_url, do: Application.get_env(:prismatic_dd, :forbes_cz_url)
  defp parse_rankings(body), do: Jason.decode!(body)["rankings"]
end
```

### OSINT Source/Provider Pattern

The OSINT system uses the same self-registration pattern but with a different interface tailored to interactive tool execution:

```elixir
defmodule PrismaticOsintCore.Adapters.Czech.AresAdapter do
  @moduledoc """
  Czech ARES (Access to Registers of Economic Subjects) adapter.
  Provides company lookup by ICO (identification number).
  """

  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "ares-ico-lookup",
    name: "ARES ICO Lookup",
    category: :czech,
    api_style: :source,
    input_fields: [
      %{name: :ico, type: :text, label: "ICO (Company ID)", required: true}
    ],
    requires_auth: false,
    description: "Query Czech business register by company identification number"
  })

  @spec search(map(), keyword()) :: {:ok, map()} | {:error, term()}
  def search(%{ico: ico}, _opts \\ []) do
    url = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/#{ico}"

    case Tesla.get(url) do
      {:ok, %{status: 200, body: body}} ->
        {:ok, normalize_response(body)}

      {:ok, %{status: 404}} ->
        {:error, :not_found}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp normalize_response(body) do
    data = Jason.decode!(body)
    %{
      name: data["obchodniJmeno"],
      ico: data["ico"],
      legal_form: data["pravniForma"],
      address: data["sidlo"],
      registration_date: data["datumVzniku"]
    }
  end
end
```

## Architecture & Implementation

The source architecture in the Prismatic Platform follows a three-layer model. The behaviour layer defines the contract (what a source must implement). The registration layer provides automatic discovery (how sources become known to the system). The execution layer handles invocation, rate limiting, and result processing (how sources are used).

All three self-registering subsystems (OSINT, Academy, DD) share the same foundational pattern:

| Component | OSINT | Academy | DD |
|-----------|-------|---------|-----|
| Behaviour | `PrismaticOsintCore.Tool` | `PrismaticAcademy.Topic` | `PrismaticDd.Source` |
| Macro | `register_tool/1` | `register_topic/1` | `register_source/1` |
| Registry | `ToolRegistry` (ETS) | `TopicRegistry` (ETS) | `SourceRegistry` (ETS) |
| Hook | `@after_compile` | `@after_compile` | `@after_compile` |
| Count | 127 tools | 4 topics | 4 sources |

This pattern reuse is intentional. By standardizing the self-registration mechanism, the platform ensures that new domain-specific registries can be created quickly by following the established template. The consistency also means that developers who understand one registry system immediately understand all three.

Sources are classified by reliability, freshness, and access method. Primary sources provide first-party data (government registries). Secondary sources aggregate or transform primary data (business intelligence platforms). Derived sources compute new information from existing data (entity relationship inference). This classification feeds into the NABLA signal framework, where source independence and reliability affect the confidence weighting of intelligence products.

## Usage in Prismatic Platform

Sources are consumed through the SourceRegistry, which provides sub-millisecond lookups by slug, group, or category. The DD Scheduler triggers source fetches on configured intervals. The OSINT toolbox exposes sources through the LiveView UI at `/osint/toolbox`.

```elixir
# List all DD sources
{:ok, sources} = PrismaticDd.SourceRegistry.all()

# Fetch from a specific source
{:ok, records} = PrismaticDd.Client.fetch_group(:forbes)

# Execute an OSINT source
{:ok, result} = PrismaticOsintCore.ToolRegistry.lookup("ares-ico-lookup")
```

## Cross-References

- [Source Registry](@/glossary/source-registry.md) - ETS-backed catalog of self-registered sources
- [OSINT](@/glossary/osint.md) - Intelligence discipline defining source categories
- **Tool Registry** - OSINT-specific source/tool catalog
- [Signal](@/glossary/signal.md) - Evidence unit produced by source execution

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
