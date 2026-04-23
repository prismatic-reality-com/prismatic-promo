+++
title = "Transform"
weight = 50
[extra]
description = "Data format conversion operation that reshapes, normalizes, or enriches data between pipeline stages"
category = "data"
related_terms = ["pipeline", "etl", "normalization", "adapter"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["transform", "data transformation", "ETL", "data pipeline", "normalization", "glossary", "Prismatic Platform"]
tags = ["glossary", "data"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Transform - Prismatic Platform"
+++

## Definition & Overview

A transform is a data processing operation that converts information from one format, structure, or representation to another. In data pipelines, transforms occupy the middle stage of the Extract-Transform-Load (ETL) pattern, where raw data from diverse sources is reshaped into a consistent, normalized format suitable for storage, analysis, or downstream consumption. Transforms may be simple (renaming fields, converting types) or complex (aggregating records, enriching with external data, applying business rules).

In the Prismatic Platform, transforms are central to the DD (Due Diligence) pipeline where raw data fetched from Czech registries (ARES, Justice, Parliament) must be normalized into the unified `dd_entities` and `dd_relationships` schema. Each source produces data in different formats (XML, JSON, HTML), with different field names and data types, requiring source-specific transform logic that maps heterogeneous inputs to homogeneous outputs.

Transforms also play a critical role in the OSINT subsystem, where intelligence gathered from 127 different tools must be normalized into comparable formats for cross-source correlation. A company name from ARES, a domain from Shodan, and a person record from Companies House all need to be transformed into a common entity model that supports relationship mapping and graph analysis.

## Technical Deep Dive

The Prismatic Platform implements transforms as composable functions that can be chained into transformation pipelines:

```elixir
defmodule PrismaticTransform.Pipeline do
  @moduledoc """
  Composable transformation pipeline that chains multiple
  transform operations with error propagation.
  """

  @type transform_fn :: (map() -> {:ok, map()} | {:error, term()})

  @type t :: %__MODULE__{
    name: String.t(),
    steps: [{String.t(), transform_fn()}],
    error_strategy: :halt | :skip | :collect
  }

  defstruct [:name, steps: [], error_strategy: :halt]

  @spec new(String.t(), keyword()) :: t()
  def new(name, opts \\ []) do
    %__MODULE__{
      name: name,
      error_strategy: Keyword.get(opts, :error_strategy, :halt)
    }
  end

  @spec add_step(t(), String.t(), transform_fn()) :: t()
  def add_step(%__MODULE__{} = pipeline, step_name, transform_fn) do
    %{pipeline | steps: pipeline.steps ++ [{step_name, transform_fn}]}
  end

  @spec run(t(), map()) :: {:ok, map()} | {:error, {String.t(), term()}}
  def run(%__MODULE__{steps: steps, error_strategy: strategy}, input) do
    Enum.reduce_while(steps, {:ok, input}, fn {step_name, transform_fn}, {:ok, data} ->
      case transform_fn.(data) do
        {:ok, transformed} ->
          {:cont, {:ok, transformed}}

        {:error, reason} when strategy == :halt ->
          {:halt, {:error, {step_name, reason}}}

        {:error, _reason} when strategy == :skip ->
          {:cont, {:ok, data}}
      end
    end)
  end

  @spec run_batch(t(), [map()]) :: {[map()], [map()]}
  def run_batch(%__MODULE__{} = pipeline, records) do
    {successes, failures} =
      records
      |> Enum.map(fn record ->
        case run(pipeline, record) do
          {:ok, transformed} -> {:ok, transformed}
          {:error, reason} -> {:error, %{original: record, reason: reason}}
        end
      end)
      |> Enum.split_with(&match?({:ok, _}, &1))

    {Enum.map(successes, fn {:ok, v} -> v end),
     Enum.map(failures, fn {:error, v} -> v end)}
  end
end
```

Common transform operations are provided as reusable building blocks:

```elixir
defmodule PrismaticTransform.Operations do
  @moduledoc """
  Library of reusable transform operations for common
  data conversion patterns.
  """

  @spec rename_keys(map(), [{atom(), atom()}]) :: {:ok, map()}
  def rename_keys(data, mappings) do
    transformed =
      Enum.reduce(mappings, data, fn {old_key, new_key}, acc ->
        case Map.pop(acc, old_key) do
          {nil, acc} -> acc
          {value, acc} -> Map.put(acc, new_key, value)
        end
      end)

    {:ok, transformed}
  end

  @spec coerce_types(map(), [{atom(), atom()}]) :: {:ok, map()} | {:error, term()}
  def coerce_types(data, type_specs) do
    result =
      Enum.reduce_while(type_specs, {:ok, data}, fn {field, type}, {:ok, acc} ->
        case coerce_field(Map.get(acc, field), type) do
          {:ok, value} -> {:cont, {:ok, Map.put(acc, field, value)}}
          {:error, reason} -> {:halt, {:error, {:type_coercion, field, reason}}}
        end
      end)

    result
  end

  @spec normalize_strings(map(), [atom()]) :: {:ok, map()}
  def normalize_strings(data, fields) do
    transformed =
      Enum.reduce(fields, data, fn field, acc ->
        case Map.get(acc, field) do
          nil -> acc
          value when is_binary(value) ->
            Map.put(acc, field, value |> String.trim() |> String.downcase())
          _ -> acc
        end
      end)

    {:ok, transformed}
  end

  defp coerce_field(nil, _type), do: {:ok, nil}
  defp coerce_field(value, :string) when is_binary(value), do: {:ok, value}
  defp coerce_field(value, :string), do: {:ok, to_string(value)}
  defp coerce_field(value, :integer) when is_integer(value), do: {:ok, value}
  defp coerce_field(value, :integer) when is_binary(value) do
    case Integer.parse(value) do
      {int, ""} -> {:ok, int}
      _ -> {:error, :invalid_integer}
    end
  end
  defp coerce_field(_, type), do: {:error, {:unsupported_type, type}}
end
```

## Architecture & Implementation

Transforms in the platform follow a three-layer architecture aligned with the DD pipeline's two-phase design:

**Source-Specific Transforms**: Each DD source module (ForbesCz, Parliament, Senate, LocalGov) implements its own transform logic that maps raw fetched data to the intermediate format. This layer handles the idiosyncrasies of each source: ARES returns XML with Czech field names, Parliament provides HTML tables, Forbes uses JSON with English fields.

**Normalization Transforms**: After source-specific mapping, a shared normalization layer standardizes data types, validates required fields, generates content hashes for diff detection, and enriches records with metadata (source, fetch timestamp, confidence score).

**Enrichment Transforms**: Optional post-normalization transforms that add derived data: geocoding addresses, resolving cross-references between entities, computing relationship strengths, and categorizing entities by type.

The DD Loader orchestrates these layers, running raw fetch records through the transform pipeline before upserting into `dd_entities`:

```elixir
defmodule PrismaticDd.Loader do
  @spec load_group(atom()) :: {:ok, map()} | {:error, term()}
  def load_group(group) do
    pipeline =
      PrismaticTransform.Pipeline.new("dd-#{group}")
      |> PrismaticTransform.Pipeline.add_step("source_transform", &source_transform(group, &1))
      |> PrismaticTransform.Pipeline.add_step("normalize", &normalize/1)
      |> PrismaticTransform.Pipeline.add_step("enrich", &enrich/1)
      |> PrismaticTransform.Pipeline.add_step("validate", &validate/1)

    fetch_records = PrismaticDd.Client.get_pending(group)
    {entities, errors} = PrismaticTransform.Pipeline.run_batch(pipeline, fetch_records)

    PrismaticDd.Repo.batch_upsert_entities(entities)
    {:ok, %{loaded: length(entities), errors: length(errors)}}
  end
end
```

## Usage in Prismatic Platform

Transforms are used throughout the platform wherever data crosses subsystem boundaries. The OSINT toolbox transforms raw API responses into displayable results. The Perimeter module transforms scan results into security ratings. The Academy transforms topic configurations into searchable index entries.

The composable pipeline pattern ensures that transforms remain testable and maintainable. Each transform step is a pure function that takes data in and produces data out, making unit testing straightforward and debugging transparent.

## Cross-References

- [Pipeline](@/glossary/pipeline.md) - Multi-stage data processing flow
- [ETL](@/glossary/etl.md) - Extract-Transform-Load pattern
- **Normalization** - Data standardization process
- [Adapter](@/glossary/adapter.md) - Source-specific interface
- [Traversal](@/glossary/traversal.md) - Graph navigation using transformed data

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
