+++
title = "OpenAPI 3.0 and Swagger UI Integration in Phoenix"
date = 2026-03-12
description = "How Prismatic auto-generates OpenAPI 3.0 specs from Elixir typespecs, serves Swagger UI, validates requests, and manages API versioning."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["openapi", "swagger", "phoenix", "api", "documentation"]
reading_time = "8 min"
keywords = ["openapi elixir", "swagger phoenix", "api documentation", "request validation", "api versioning"]
image = "/images/blog/openapi-swagger-integration.png"
word_count = 1050
date_created = "2026-03-12"
date_modified = "2026-03-12"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "OpenAPI 3.0 and Swagger UI Integration in Phoenix - Prismatic Platform"
+++

Maintaining API documentation separately from implementation guarantees drift. The Prismatic Platform solves this by generating OpenAPI 3.0 specifications directly from Elixir typespecs and module documentation, then serving Swagger UI from the same Phoenix application. Every deployed endpoint is automatically documented with accurate schemas, examples, and error responses.

## Architecture Overview

The OpenAPI generation pipeline works in three layers:

| Layer | Responsibility | Module |
|-------|---------------|--------|
| Extraction | Parse `@spec`, `@doc`, `@moduledoc` from beam files | `OpenApi.Extractor` |
| Generation | Build OpenAPI 3.0 JSON/YAML document | `OpenApi.Generator` |
| Serving | Serve Swagger UI + spec file at `/api/docs` | `OpenApi.Plug` |

## Spec Generation from Typespecs

The generator walks all controller modules and their action functions, extracting type information to build request/response schemas:

```elixir
defmodule PrismaticWeb.OpenApi.Generator do
  @moduledoc """
  Generates OpenAPI 3.0 specification from Phoenix router
  and controller typespecs.

  Scans all routes in the :api pipeline, extracts specs
  from controller actions, and builds a complete OpenAPI
  document with schemas, paths, and security definitions.
  """

  @spec generate() :: map()
  def generate do
    routes = PrismaticWeb.Router.__routes__()
    api_routes = Enum.filter(routes, &api_route?/1)

    %{
      "openapi" => "3.0.3",
      "info" => %{
        "title" => "Prismatic Platform API",
        "version" => api_version(),
        "description" => "Intelligence platform REST API"
      },
      "servers" => [
        %{"url" => "/api/v1", "description" => "Production API"}
      ],
      "paths" => build_paths(api_routes),
      "components" => %{
        "schemas" => build_schemas(api_routes),
        "securitySchemes" => security_schemes()
      },
      "security" => [%{"bearerAuth" => []}, %{"apiKey" => []}]
    }
  end

  defp build_paths(routes) do
    routes
    |> Enum.group_by(& &1.path)
    |> Enum.into(%{}, fn {path, methods} ->
      {convert_path(path), build_path_item(methods)}
    end)
  end

  defp build_path_item(methods) do
    Enum.into(methods, %{}, fn route ->
      {String.downcase(route.verb), build_operation(route)}
    end)
  end

  defp build_operation(route) do
    controller = route.plug
    action = route.plug_opts

    %{
      "operationId" => "#{inspect(controller)}.#{action}",
      "summary" => extract_doc_summary(controller, action),
      "description" => extract_doc_body(controller, action),
      "tags" => extract_tags(controller),
      "parameters" => extract_parameters(route),
      "responses" => build_responses(controller, action),
      "requestBody" => build_request_body(controller, action)
    }
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Enum.into(%{})
  end
end
```

## Swagger UI Setup

Swagger UI is served as a static asset through a custom Plug. The spec endpoint returns the generated JSON, and the UI page loads it:

```elixir
defmodule PrismaticWeb.OpenApi.Plug do
  @moduledoc """
  Serves OpenAPI spec and Swagger UI.

  Mounts at /api/docs for the UI and /api/docs/openapi.json
  for the raw specification. Caches the generated spec in
  ETS and invalidates on code reload in development.
  """

  @behaviour Plug

  alias PrismaticWeb.OpenApi.Generator

  @impl Plug
  def init(opts), do: opts

  @impl Plug
  def call(%Plug.Conn{path_info: ["api", "docs", "openapi.json"]} = conn, _opts) do
    spec = cached_spec()

    conn
    |> Plug.Conn.put_resp_content_type("application/json")
    |> Plug.Conn.send_resp(200, Jason.encode!(spec))
    |> Plug.Conn.halt()
  end

  def call(%Plug.Conn{path_info: ["api", "docs"]} = conn, _opts) do
    conn
    |> Plug.Conn.put_resp_content_type("text/html")
    |> Plug.Conn.send_resp(200, swagger_ui_html())
    |> Plug.Conn.halt()
  end

  def call(conn, _opts), do: conn

  defp cached_spec do
    case :ets.lookup(:openapi_cache, :spec) do
      [{:spec, spec}] -> spec
      [] ->
        spec = Generator.generate()
        :ets.insert(:openapi_cache, {:spec, spec})
        spec
    end
  end
end
```

The Swagger UI HTML template references the CDN-hosted assets and points to the local spec URL:

```elixir
defp swagger_ui_html do
  """
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Prismatic API Documentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({
        url: '/api/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout'
      });
    </script>
  </body>
  </html>
  """
end
```

## Request Validation

Incoming requests are validated against the OpenAPI spec before reaching the controller. A validation plug intercepts the request, checks path parameters, query parameters, headers, and request body against the registered schema:

```elixir
defmodule PrismaticWeb.OpenApi.ValidationPlug do
  @moduledoc """
  Validates incoming API requests against the OpenAPI spec.

  Checks parameter types, required fields, enum values,
  and request body structure. Returns 422 with detailed
  error messages for invalid requests.
  """

  @behaviour Plug

  @impl Plug
  def init(opts), do: opts

  @impl Plug
  def call(conn, _opts) do
    with {:ok, operation} <- find_operation(conn),
         :ok <- validate_params(conn, operation),
         :ok <- validate_body(conn, operation) do
      conn
    else
      {:error, errors} ->
        conn
        |> Plug.Conn.put_status(422)
        |> Phoenix.Controller.json(%{
          error: "Validation failed",
          details: format_errors(errors)
        })
        |> Plug.Conn.halt()
    end
  end

  defp validate_params(conn, operation) do
    errors =
      for param <- Map.get(operation, "parameters", []),
          error = validate_single_param(conn, param),
          error != nil do
        error
      end

    if errors == [], do: :ok, else: {:error, errors}
  end

  defp validate_single_param(conn, %{"name" => name, "required" => true, "in" => "query"}) do
    case Map.get(conn.query_params, name) do
      nil -> %{param: name, error: "required query parameter missing"}
      _ -> nil
    end
  end
end
```

| Validation Type | Checked Against | Error Code | Response |
|----------------|-----------------|------------|----------|
| Missing required param | `required: true` in spec | `MISSING_PARAM` | 422 with field name |
| Wrong param type | Schema `type` field | `TYPE_MISMATCH` | 422 with expected type |
| Invalid enum value | Schema `enum` array | `INVALID_ENUM` | 422 with allowed values |
| Body schema mismatch | Request body schema | `SCHEMA_VIOLATION` | 422 with JSON path |
| Missing content-type | `requestBody.content` keys | `CONTENT_TYPE` | 415 Unsupported |

## API Versioning Strategy

The platform uses URL-based versioning with a fallback header strategy. The router mounts versioned scopes, and a version negotiation plug selects the appropriate handler:

```elixir
# Router versioned scopes
scope "/api/v1", PrismaticWeb.Api.V1 do
  pipe_through [:api, :api_auth, :openapi_validate]
  resources "/osint/search", OsintSearchController, only: [:index, :show]
  resources "/dd/cases", DDCaseController, only: [:index, :show, :create, :update]
end

scope "/api/v2", PrismaticWeb.Api.V2 do
  pipe_through [:api, :api_auth, :openapi_validate]
  resources "/osint/search", OsintSearchController, only: [:index, :show]
end
```

The versioning conventions follow a deprecation schedule:

| Version | Status | Deprecation Date | Removal Date |
|---------|--------|-----------------|--------------|
| v1 | Stable | - | - |
| v2 | Beta | - | - |
| v0 | Deprecated | 2026-01-01 | 2026-07-01 |

## Cache Invalidation in Development

During development, the OpenAPI spec must regenerate when code changes. The generator hooks into Phoenix's code reloader:

```elixir
defmodule PrismaticWeb.OpenApi.DevReloader do
  @moduledoc """
  Invalidates cached OpenAPI spec when code changes in dev.
  Hooks into Phoenix.CodeReloader notifications.
  """

  use GenServer
  require Logger

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl GenServer
  def init(_opts) do
    if Application.get_env(:prismatic_web, :env) == :dev do
      Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, "code_reload")
    end

    {:ok, %{}}
  end

  @impl GenServer
  def handle_info({:code_reload, _modules}, state) do
    Logger.info("OpenAPI spec cache invalidated after code reload")
    :ets.delete(:openapi_cache, :spec)
    {:noreply, state}
  end
end
```

This approach ensures the Swagger UI at `/api/docs` always reflects the actual implementation. No manual spec authoring, no documentation drift, and automatic request validation against the same source of truth.
