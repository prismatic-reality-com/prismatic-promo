+++
title = "Storage Adapter"
weight = 50
[extra]
description = "Pluggable backend interface implementing the PrismaticStorage.Core behaviour for transparent multi-backend data access"
category = "storage"
related_terms = ["adapter-pattern", "behaviour", "ets", "ecto", "kuzudb", "meilisearch", "protocol"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["storage adapter", "pluggable backend", "behaviour", "interface", "glossary", "Prismatic Platform"]
tags = ["glossary", "storage", "architecture"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Storage Adapter - Prismatic Platform"
+++

## Definition & Overview

A storage adapter is a module that implements the `PrismaticStorage.Core` behaviour, providing a standardized interface for data operations (get, put, delete, list, query) against a specific backend technology. Each adapter translates the platform's abstract storage operations into the native API of its backend -- ETS calls for the in-memory adapter, Ecto queries for PostgreSQL, HTTP requests for Meilisearch, Cypher queries for KuzuDB. Client code depends only on the abstract interface, never on backend-specific details.

The storage adapter pattern enables the Prismatic Platform to support seven distinct storage technologies through a single API. Application code that stores an entity record does not need to know whether the data lands in PostgreSQL, ETS, or Redis. The adapter handles all translation, connection management, error normalization, and serialization. This decoupling means that storage backends can be swapped without modifying any business logic -- a change from ETS to Redis requires only a configuration update.

Storage adapters are a core architectural element of the platform. Every subsystem -- OSINT tool results, DD entity records, Academy progress tracking, Perimeter vulnerability findings -- stores data through the adapter interface. The adapters are individually tested through a shared contract test suite that verifies behavioral compliance, and are collectively monitored through instrumented telemetry wrappers that provide uniform observability.

## Technical Deep Dive

### The Core Behaviour

Every storage adapter must implement this behaviour:

```elixir
defmodule PrismaticStorage.Core do
  @moduledoc """
  Core storage behaviour that all adapters must implement.
  Compile-time enforcement via @behaviour ensures complete implementation.
  """

  @type key :: binary() | atom()
  @type value :: term()
  @type opts :: keyword()

  @callback get(key(), opts()) :: {:ok, value()} | {:ok, nil} | {:error, term()}
  @callback put(key(), value(), opts()) :: {:ok, value()} | {:error, term()}
  @callback delete(key(), opts()) :: :ok | {:error, term()}
  @callback list(opts()) :: {:ok, [value()]} | {:error, term()}
  @callback exists?(key(), opts()) :: {:ok, boolean()} | {:error, term()}
  @callback count(opts()) :: {:ok, non_neg_integer()} | {:error, term()}
  @callback query(map(), opts()) :: {:ok, [value()]} | {:error, term()}
  @callback bulk_put([{key(), value()}], opts()) :: {:ok, non_neg_integer()} | {:error, term()}

  @optional_callbacks [query: 2, bulk_put: 2]
end
```

### Adapter Implementations

Each adapter translates the abstract interface to backend-specific operations:

```elixir
defmodule PrismaticStorage.ETS do
  @moduledoc """
  ETS storage adapter. Sub-microsecond operations.
  Optimized for hot-path reads with read_concurrency.
  """

  @behaviour PrismaticStorage.Core

  @impl true
  def get(key, opts) do
    table = Keyword.fetch!(opts, :table)
    case :ets.lookup(table, key) do
      [{^key, value}] -> {:ok, value}
      [] -> {:ok, nil}
    end
  end

  @impl true
  def put(key, value, opts) do
    table = Keyword.fetch!(opts, :table)
    :ets.insert(table, {key, value})
    {:ok, value}
  end

  @impl true
  def delete(key, opts) do
    table = Keyword.fetch!(opts, :table)
    :ets.delete(table, key)
    :ok
  end

  @impl true
  def list(opts) do
    table = Keyword.fetch!(opts, :table)
    values = :ets.tab2list(table) |> Enum.map(&elem(&1, 1))
    {:ok, values}
  end

  @impl true
  def exists?(key, opts) do
    table = Keyword.fetch!(opts, :table)
    {:ok, :ets.member(table, key)}
  end

  @impl true
  def count(opts) do
    table = Keyword.fetch!(opts, :table)
    {:ok, :ets.info(table, :size)}
  end
end
```

```elixir
defmodule PrismaticStorage.Meilisearch do
  @moduledoc """
  Meilisearch storage adapter. Full-text search optimized.
  Translates storage operations to Meilisearch HTTP API calls.
  """

  @behaviour PrismaticStorage.Core

  @impl true
  def get(key, opts) do
    index = Keyword.fetch!(opts, :index)
    url = "#{base_url()}/indexes/#{index}/documents/#{key}"

    case PrismaticHttp.SecureClient.get(url) do
      {:ok, %{status: 200, body: body}} -> {:ok, Jason.decode!(body)}
      {:ok, %{status: 404}} -> {:ok, nil}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl true
  def put(key, value, opts) do
    index = Keyword.fetch!(opts, :index)
    document = Map.put(value, "id", key)
    url = "#{base_url()}/indexes/#{index}/documents"

    case PrismaticHttp.SecureClient.post(url, Jason.encode!([document])) do
      {:ok, %{status: status}} when status in [200, 202] -> {:ok, value}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl true
  def query(filters, opts) do
    index = Keyword.fetch!(opts, :index)
    search_params = build_search_params(filters)
    url = "#{base_url()}/indexes/#{index}/search"

    case PrismaticHttp.SecureClient.post(url, Jason.encode!(search_params)) do
      {:ok, %{status: 200, body: body}} ->
        %{"hits" => hits} = Jason.decode!(body)
        {:ok, hits}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp base_url, do: Application.get_env(:prismatic_storage_meilisearch, :url)

  defp build_search_params(%{search: query} = filters) do
    %{"q" => query}
    |> maybe_add_filter(filters)
    |> maybe_add_facets(filters)
  end

  defp maybe_add_filter(params, %{filter: filter}), do: Map.put(params, "filter", filter)
  defp maybe_add_filter(params, _), do: params

  defp maybe_add_facets(params, %{facets: facets}), do: Map.put(params, "facets", facets)
  defp maybe_add_facets(params, _), do: params
end
```

## Architecture & Implementation

The platform organizes storage adapters as separate umbrella applications: `prismatic_storage_ets`, `prismatic_storage_ecto`, `prismatic_storage_meilisearch`, `prismatic_storage_kuzudb`, `prismatic_storage_duckdb`, `prismatic_storage_redis`, `prismatic_storage_file`. This isolation ensures that each adapter's dependencies (Tesla for HTTP-based backends, Ecto for PostgreSQL, etc.) do not pollute other adapters or application code.

Runtime adapter selection is configuration-driven. Development environments default to ETS for zero-dependency operation. Production environments use PostgreSQL (via Ecto) for durable storage with ETS as a caching layer. Specialized workloads select the optimal backend: Meilisearch for full-text search, KuzuDB for graph traversal, DuckDB for analytical queries.

The contract test suite (`PrismaticStorage.AdapterContractTest`) is a reusable test macro that validates any adapter against the full behaviour specification. Each adapter's test suite includes the contract tests plus backend-specific tests for features beyond the common interface.

## Usage in Prismatic Platform

Storage adapters are consumed through the unified facade:

```elixir
# Runtime adapter selection
adapter = Application.get_env(:prismatic_storage, :default_adapter, PrismaticStorage.ETS)

# Uniform operations across any backend
{:ok, _} = adapter.put("entity-123", %{name: "Test Corp"}, table: :entities)
{:ok, entity} = adapter.get("entity-123", table: :entities)
{:ok, all} = adapter.list(table: :entities)
```

## Cross-References

- [Adapter Pattern](/glossary/adapter-pattern/) - Design pattern implemented by storage adapters
- [Behaviour](/glossary/behaviour/) - Contract mechanism enforcing adapter compliance
- [ETS](/glossary/ets/) - In-memory storage adapter for high-speed caching
- [Ecto](/glossary/ecto/) - Database wrapper used by the PostgreSQL adapter

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
