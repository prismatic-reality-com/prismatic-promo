+++
title = "REST API Auto-Discovery: From Elixir Modules to Endpoints"
date = 2026-03-11
description = "How Prismatic auto-discovers API endpoints by scanning Elixir modules, extracting @spec definitions, and generating a generic dispatch controller with type coercion."

[extra]
author = "Tomas Korcak (korczis)"
category = "architecture"
tags = ["api", "elixir", "auto-discovery", "metaprogramming", "openapi"]
reading_time = "9 min"
keywords = ["api auto-discovery", "elixir metaprogramming", "code fetch docs", "generic controller", "type coercion"]
image = "/images/blog/rest-api-auto-discovery.png"
word_count = 1100
date_created = "2026-03-11"
date_modified = "2026-03-11"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "REST API Auto-Discovery: From Elixir Modules to Endpoints - Prismatic Platform"
+++

One of the more unusual architectural decisions in the Prismatic Platform is that REST API endpoints are not hand-written. Instead, the system scans Elixir modules at compile time, extracts their `@spec` definitions and documentation, and generates a unified dispatch controller that routes HTTP requests to the appropriate function with automatic parameter coercion.

This approach eliminates the traditional boilerplate of writing controller actions, request validation, and response serialization for every endpoint. When a developer adds a new public function with a `@spec` and `@doc`, it automatically becomes available as an API endpoint.

## The Discovery Pipeline

The auto-discovery pipeline runs in four stages during compilation:

| Stage | Module | Purpose |
|-------|--------|---------|
| 1. Scan | `ApiDiscovery.Scanner` | Find modules with `@api_expose` attribute |
| 2. Extract | `ApiDiscovery.Extractor` | Parse `@spec`, `@doc`, and parameter metadata |
| 3. Map | `ApiDiscovery.Mapper` | Convert typespecs to OpenAPI schema + route definitions |
| 4. Register | `ApiDiscovery.Registry` | Store endpoint definitions in ETS for runtime dispatch |

## Module Scanning with Code.fetch_docs

The scanner identifies modules that opt into API exposure using a module attribute. It then uses `Code.fetch_docs/1` to extract documentation and `Code.Typespec.fetch_specs/1` to get type specifications:

```elixir
defmodule PrismaticWeb.ApiDiscovery.Scanner do
  @moduledoc """
  Scans compiled modules for API-exposable functions.

  Uses Code.fetch_docs/1 and beam_lib to extract
  documentation and typespecs from compiled .beam files.
  """

  @spec scan_modules() :: [module_info()]
  def scan_modules do
    :code.all_loaded()
    |> Enum.filter(&has_api_attribute?/1)
    |> Enum.flat_map(&extract_endpoints/1)
  end

  defp has_api_attribute?({module, _beam_file}) do
    case module.__info__(:attributes)[:api_expose] do
      nil -> false
      _ -> true
    end
  end

  defp extract_endpoints({module, _beam_file}) do
    {:docs_v1, _, :elixir, _, _, _, docs} = Code.fetch_docs(module)
    specs = fetch_specs(module)

    for {{:function, name, arity}, _, _, doc, metadata} <- docs,
        Map.has_key?(metadata, :api),
        spec = Map.get(specs, {name, arity}) do
      %{
        module: module,
        function: name,
        arity: arity,
        doc: extract_doc_text(doc),
        spec: spec,
        http_method: Map.get(metadata, :api_method, :get),
        path: Map.get(metadata, :api_path, build_default_path(module, name))
      }
    end
  end

  defp fetch_specs(module) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} -> Map.new(specs, fn {{name, arity}, spec} -> {{name, arity}, spec} end)
      :error -> %{}
    end
  end
end
```

## Exposing Functions as Endpoints

A domain module opts into API exposure with the `@api_expose` attribute and annotates individual functions with `@doc` metadata:

```elixir
defmodule PrismaticOsint.EntitySearch do
  @moduledoc """
  Entity search across multiple OSINT sources.
  Auto-exposed as REST API via ApiDiscovery.
  """

  @api_expose true

  @doc """
  Search for entities matching the given query.

  ## API Metadata
    api: true
    api_method: :get
    api_path: "/api/v1/osint/search"
  """
  @spec search(String.t(), keyword()) :: {:ok, [Entity.t()]} | {:error, term()}
  def search(query, opts \\ []) do
    sources = Keyword.get(opts, :sources, [:all])
    limit = Keyword.get(opts, :limit, 25)

    OsintMesh.search(query, sources, limit: limit)
  end
end
```

## Spec-to-OpenAPI Mapping

The mapper translates Elixir typespecs into OpenAPI 3.0 schema definitions. This mapping handles common Elixir types including unions, keyword lists, and custom structs:

```elixir
defmodule PrismaticWeb.ApiDiscovery.Mapper do
  @moduledoc """
  Maps Elixir typespecs to OpenAPI 3.0 schema definitions.

  Handles primitive types, unions, structs, keyword lists,
  and custom type references with recursive resolution.
  """

  @spec typespec_to_schema(term()) :: map()
  def typespec_to_schema({:type, _, :binary, []}) do
    %{"type" => "string"}
  end

  def typespec_to_schema({:type, _, :integer, []}) do
    %{"type" => "integer"}
  end

  def typespec_to_schema({:type, _, :float, []}) do
    %{"type" => "number", "format" => "float"}
  end

  def typespec_to_schema({:type, _, :boolean, []}) do
    %{"type" => "boolean"}
  end

  def typespec_to_schema({:type, _, :list, [inner]}) do
    %{"type" => "array", "items" => typespec_to_schema(inner)}
  end

  def typespec_to_schema({:type, _, :union, types}) do
    %{"oneOf" => Enum.map(types, &typespec_to_schema/1)}
  end

  def typespec_to_schema({:remote_type, _, [{:atom, _, module}, {:atom, _, :t}, []]}) do
    %{"$ref" => "#/components/schemas/#{inspect(module)}"}
  end

  def typespec_to_schema({:type, _, :map, fields}) do
    properties =
      for {:type, _, :map_field_exact, [{:atom, _, key}, value_type]} <- fields,
          into: %{} do
        {Atom.to_string(key), typespec_to_schema(value_type)}
      end

    %{"type" => "object", "properties" => properties}
  end
end
```

| Elixir Type | OpenAPI Schema | Notes |
|-------------|---------------|-------|
| `String.t()` | `{"type": "string"}` | Direct mapping |
| `integer()` | `{"type": "integer"}` | Direct mapping |
| `float()` | `{"type": "number", "format": "float"}` | Includes format hint |
| `boolean()` | `{"type": "boolean"}` | Direct mapping |
| `[Entity.t()]` | `{"type": "array", "items": {"$ref": ...}}` | Recursive resolution |
| `String.t() \| nil` | `{"oneOf": [...], "nullable": true}` | Union handling |
| `keyword()` | `{"type": "object"}` | Converted to query params |

## Generic Dispatch Controller

The dispatch controller is the single entry point for all auto-discovered endpoints. It performs parameter extraction, type coercion, function invocation, and response envelope wrapping:

```elixir
defmodule PrismaticWeb.Api.DispatchController do
  @moduledoc """
  Generic API dispatch controller for auto-discovered endpoints.

  Handles parameter extraction from query string, path params,
  and request body. Performs type coercion based on the registered
  spec, invokes the target function, and wraps the result in
  a standard API envelope.
  """

  use PrismaticWeb, :controller

  alias PrismaticWeb.ApiDiscovery.Registry

  @spec dispatch(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def dispatch(conn, %{"endpoint_id" => endpoint_id} = params) do
    with {:ok, endpoint} <- Registry.lookup(endpoint_id),
         {:ok, coerced_params} <- coerce_params(params, endpoint.spec),
         {:ok, result} <- apply(endpoint.module, endpoint.function, build_args(coerced_params)) do
      conn
      |> put_status(200)
      |> json(%{
        data: serialize(result),
        meta: %{
          request_id: conn.assigns[:request_id],
          timestamp: DateTime.utc_now(),
          api_version: "v1"
        }
      })
    else
      {:error, :not_found} ->
        conn |> put_status(404) |> json(%{error: "Endpoint not found"})

      {:error, %{type: :coercion, details: details}} ->
        conn |> put_status(422) |> json(%{error: "Invalid parameters", details: details})

      {:error, reason} ->
        conn |> put_status(500) |> json(%{error: "Internal error", details: inspect(reason)})
    end
  end
end
```

## Type Coercion Pipeline

HTTP parameters arrive as strings. The coercion pipeline converts them to the types expected by the target function based on the registered spec:

```elixir
defmodule PrismaticWeb.ApiDiscovery.Coercion do
  @moduledoc """
  Type coercion for HTTP parameters based on registered typespecs.

  Converts string parameters from query strings and path params
  to their expected Elixir types with validation.
  """

  @spec coerce(String.t(), atom()) :: {:ok, term()} | {:error, String.t()}
  def coerce(value, :integer) do
    case Integer.parse(value) do
      {int, ""} -> {:ok, int}
      _ -> {:error, "expected integer, got: #{value}"}
    end
  end

  def coerce(value, :boolean) do
    case String.downcase(value) do
      v when v in ["true", "1", "yes"] -> {:ok, true}
      v when v in ["false", "0", "no"] -> {:ok, false}
      _ -> {:error, "expected boolean, got: #{value}"}
    end
  end

  def coerce(value, :atom) do
    {:ok, String.to_existing_atom(value)}
  rescue
    ArgumentError -> {:error, "unknown atom: #{value}"}
  end

  def coerce(value, :string), do: {:ok, value}

  def coerce(value, {:list, inner_type}) do
    value
    |> String.split(",", trim: true)
    |> Enum.reduce_while({:ok, []}, fn item, {:ok, acc} ->
      case coerce(String.trim(item), inner_type) do
        {:ok, coerced} -> {:cont, {:ok, [coerced | acc]}}
        {:error, _} = err -> {:halt, err}
      end
    end)
    |> case do
      {:ok, list} -> {:ok, Enum.reverse(list)}
      error -> error
    end
  end
end
```

## Route Generation

The router integrates with Phoenix's routing DSL. At compile time, auto-discovered endpoints are injected into the `:api` pipeline scope:

```elixir
# In router.ex — auto-discovered routes
scope "/api/v1", PrismaticWeb.Api do
  pipe_through [:api, :api_auth]

  # Auto-generated from ApiDiscovery.Registry
  for endpoint <- PrismaticWeb.ApiDiscovery.Registry.all_endpoints() do
    match endpoint.http_method, endpoint.path,
      DispatchController, :dispatch,
      assigns: %{endpoint_id: endpoint.id}
  end
end
```

This architecture means adding a new API endpoint requires zero changes to controllers, routers, or serializers. Define a function with `@spec` and `@doc`, mark it with the API metadata, and it appears in the API automatically, complete with OpenAPI documentation, parameter validation, and type-safe coercion.

The tradeoff is increased compile-time complexity and a less conventional code path. Debugging requires understanding the dispatch layer. But for a platform with hundreds of domain functions that need API exposure, the elimination of repetitive controller code is significant.
