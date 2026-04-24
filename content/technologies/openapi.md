+++
title = "OpenAPI/Swagger"
weight = 70
[extra]
category = "protocol"
description = "API specification standard for describing, documenting, and consuming RESTful web services with automatic introspection"
url = "https://www.openapis.org"
version = "3.0"
icon = "openapi"
color = "green"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1000
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OpenAPISwagger", "RESTful", "technologies", "protocol", "Prismatic Platform", "OpenAPI", "Elixir", "Swagger"]
tags = ["technologies", "protocol", "openapi-swagger", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "OpenAPI/Swagger - Prismatic Platform"
+++

## Overview

OpenAPI (formerly Swagger) is the API documentation standard used by the Prismatic Platform's auto-introspecting REST API. The platform generates a complete OpenAPI 3.0 specification automatically by scanning all Prismatic facade modules at boot time, mapping [Elixir](@/technologies/elixir.md) `@spec` type annotations to JSON Schema, and exposing the result through Swagger UI for interactive API exploration. This approach represents a fundamental shift from traditional API documentation workflows where specifications are authored manually and inevitably drift from the actual implementation.

The Prismatic API's auto-introspection approach means the OpenAPI specification is always synchronized with the actual codebase. When a module's `@spec` changes, the API documentation updates automatically on the next application restart. This eliminates the common problem of documentation drift and ensures that API consumers always have accurate, up-to-date documentation without any manual authoring. The specification serves as both documentation and a runtime validation contract -- incoming requests are validated against the schema before reaching handler code, preventing malformed data from propagating through the system.

The [OpenApiSpex](https://hex.pm/packages/open_api_spex) library generates schemas, validates request parameters at runtime, and serves the interactive Swagger UI at `/api/swagger-ui`, providing developers with a complete API exploration and testing interface. The Prismatic API application on port 4004 is the sole consumer of this OpenAPI infrastructure, serving as the unified gateway through which external systems interact with the platform's capabilities.

## Key Features

- **Auto-Introspection**: Elixir module scanning discovers all public functions and maps `@spec` AST to JSON Schema automatically, eliminating manual specification authoring
- **Schema Definition**: JSON Schema types for request/response validation, derived directly from Elixir typespecs with support for nested structures, enums, and union types
- **Path Documentation**: Endpoint descriptions, parameters, and examples generated from module `@doc` annotations and function signatures
- **Authentication Schemes**: Security scheme documentation covering API keys, [JWT](@/technologies/jose.md) tokens, and OAuth flows with per-endpoint authorization requirements
- **Runtime Validation**: Request parameters validated against the OpenAPI schema before reaching handler code, providing early rejection of malformed requests
- **Interactive UI**: Swagger UI at `/api/swagger-ui` for exploring and testing every endpoint interactively with authentication support
- **Code Generation**: Clients can generate SDKs in any language from the exported specification using OpenAPI Generator or similar tools
- **Versioned Endpoints**: API versioning through URL path prefixes enables breaking changes without disrupting existing consumers

## Platform Integration

OpenAPI powers the platform's auto-documented REST API. The spec module, scanner, and type mapper work together to produce the complete specification. The architecture follows a three-phase pipeline: discovery, mapping, and serving.

```elixir
defmodule PrismaticApi.ApiSpec do
  alias OpenApiSpex.{Info, OpenApi, Paths, Server}

  @behaviour OpenApi

  @impl OpenApi
  def spec do
    %OpenApi{
      info: %Info{
        title: "Prismatic Platform API",
        version: "1.0.0",
        description: "Auto-introspecting REST API for the Prismatic Platform"
      },
      servers: [%Server{url: "http://localhost:4004"}],
      paths: Paths.from_router(PrismaticApi.Router)
    }
    |> OpenApiSpex.resolve_schema_modules()
  end
end

defmodule PrismaticApi.Scanner do
  @doc "Discovers all Prismatic facade modules and their public functions"
  def scan_modules do
    :code.all_loaded()
    |> Enum.filter(fn {mod, _} -> prismatic_facade?(mod) end)
    |> Enum.flat_map(fn {mod, _} -> discover_endpoints(mod) end)
    |> Enum.map(&build_endpoint_spec/1)
  end

  defp prismatic_facade?(mod) do
    mod
    |> Atom.to_string()
    |> String.starts_with?("Elixir.Prismatic")
  end

  defp discover_endpoints(mod) do
    case Code.fetch_docs(mod) do
      {:docs_v1, _, _, _, _, _, docs} ->
        Enum.filter(docs, fn {{:function, _, _}, _, _, doc, _} -> doc != :hidden end)

      _ -> []
    end
  end
end
```

The type mapper converts Elixir typespec AST into OpenAPI JSON Schema definitions, handling the full range of Elixir's type system including maps, lists, tuples, atoms, and custom structs:

```elixir
defmodule PrismaticApi.TypeMapper do
  @doc "Maps Elixir typespec AST nodes to OpenAPI JSON Schema objects"
  def elixir_to_json_schema({:type, _, :string, []}), do: %{"type" => "string"}
  def elixir_to_json_schema({:type, _, :integer, []}), do: %{"type" => "integer"}
  def elixir_to_json_schema({:type, _, :boolean, []}), do: %{"type" => "boolean"}
  def elixir_to_json_schema({:type, _, :float, []}), do: %{"type" => "number", "format" => "double"}
  def elixir_to_json_schema({:type, _, :list, [inner]}),
    do: %{"type" => "array", "items" => elixir_to_json_schema(inner)}
  def elixir_to_json_schema({:type, _, :map, fields}),
    do: %{"type" => "object", "properties" => map_fields(fields)}
  def elixir_to_json_schema({:type, _, :atom, []}),
    do: %{"type" => "string", "description" => "Elixir atom value"}
  def elixir_to_json_schema({:remote_type, _, [{:atom, _, DateTime}, {:atom, _, :t}, []]}),
    do: %{"type" => "string", "format" => "date-time"}
end
```

## Architecture

The OpenAPI infrastructure occupies a specific position in the platform's request processing pipeline:

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| **Discovery** | `PrismaticApi.Scanner` | Boot-time module scanning, function enumeration, doc extraction |
| **Mapping** | `PrismaticApi.TypeMapper` | Elixir typespec AST to JSON Schema conversion |
| **Registry** | `PrismaticApi.EndpointRegistry` | ETS-cached endpoint metadata for fast lookup |
| **Specification** | `PrismaticApi.ApiSpec` | OpenApiSpex behaviour implementation, spec assembly |
| **Validation** | `OpenApiSpex.Plug.CastAndValidate` | Request parameter validation against schema |
| **Dispatch** | `PrismaticApi.DispatchController` | Generic function dispatch after validation |
| **Documentation** | `OpenApiSpex.Plug.SwaggerUI` | Interactive API explorer at `/api/swagger-ui` |

The scanner runs once at application startup and caches results in [ETS](@/technologies/ets.md). Subsequent requests serve the cached specification without re-scanning, ensuring sub-millisecond spec retrieval even with hundreds of discovered endpoints.

## Performance Characteristics

The auto-introspection approach introduces no runtime overhead for API consumers because the scanning phase occurs only during application startup.

| Metric | Value | Notes |
|--------|-------|-------|
| Boot-time scan duration | ~200ms | Scanning all Prismatic modules |
| Spec retrieval latency | <1ms | ETS-cached after initial scan |
| Request validation overhead | ~0.5ms | Schema validation per request |
| Spec JSON size | ~150KB | Complete specification with all endpoints |
| Discovered endpoints | 50+ | Across all Prismatic facade modules |
| Swagger UI load time | <500ms | Including spec fetch and rendering |

## Configuration

The API routes expose the OpenAPI specification and Swagger UI alongside the generic dispatch endpoint.

```elixir
# API routes in PrismaticApi.Router
scope "/api" do
  pipe_through [:api]

  get "/openapi", OpenApiSpex.Plug.RenderSpec, []
  get "/swaggerui", OpenApiSpex.Plug.SwaggerUI,
    path: "/api/openapi",
    default_model_expand_depth: 3

  get "/v1/health", PrismaticApi.HealthController, :index
  get "/v1/endpoints", PrismaticApi.EndpointController, :index
  match :*, "/v1/:app/:action", PrismaticApi.DispatchController, :dispatch
end
```

Environment-specific configuration controls the API server and scanner behavior:

```elixir
# config/config.exs
config :prismatic_api, PrismaticApi.Endpoint,
  url: [host: "localhost"],
  http: [port: 4004],
  adapter: Bandit.PhoenixAdapter

config :prismatic_api, PrismaticApi.Scanner,
  module_prefix: "Elixir.Prismatic",
  exclude_modules: [PrismaticApi, PrismaticWeb],
  cache_table: :api_endpoint_registry
```

## Best Practices

- **Let introspection generate the spec** -- never write OpenAPI YAML manually; the scanner ensures accuracy and eliminates documentation drift entirely
- **Add `@doc` and `@spec` to all facade functions** -- these are the source material for API documentation; missing typespecs produce incomplete schemas
- **Use OpenApiSpex cast and validate plugs** -- validate incoming requests against the schema before handler code executes, providing clear error messages for invalid input
- **Version the API path** -- `/api/v1/` prefix allows future breaking changes without disrupting existing clients while maintaining backward compatibility
- **Test the spec** -- verify that the generated OpenAPI JSON is valid using `OpenApiSpex.TestAssertions` in your test suite
- **Keep facade functions pure** -- functions exposed through the API should accept simple types (strings, integers, maps) that map cleanly to JSON, avoiding complex Elixir-specific types
- **Document error responses** -- use `@doc` metadata to describe possible error conditions so the specification includes error response schemas
- **Monitor endpoint count** -- track the number of discovered endpoints across deployments to detect accidental exposure or missing modules

## Comparison with Alternatives

| Feature | OpenAPI 3.0 (Prismatic) | GraphQL | gRPC | JSON:API |
|---------|------------------------|---------|------|----------|
| Schema Language | JSON Schema | SDL | Protocol Buffers | JSON Schema subset |
| Auto-Introspection | Yes (Elixir scanning) | Requires schema definition | Requires proto files | Manual |
| Interactive Explorer | Swagger UI | GraphiQL/Playground | BloomRPC | None standard |
| Runtime Validation | Built-in via OpenApiSpex | Built-in | Built-in | Manual |
| Code Generation | 50+ language targets | Limited | Excellent | Limited |
| Caching | HTTP native (ETags, 304) | Complex (POST-based) | N/A | HTTP native |
| Learning Curve | Low (REST familiarity) | Medium | High | Medium |
| Platform Usage | Primary API gateway | Via [Absinthe](@/technologies/absinthe.md) | Not used | Not used |

The Prismatic Platform chose OpenAPI as the primary API specification because its auto-introspection capability eliminates manual specification authoring, and REST's simplicity reduces the cognitive load for API consumers who may not be familiar with the platform's internals.

## Related Technologies

- [GraphQL](@/technologies/graphql.md) - Alternative API paradigm via [Absinthe](@/technologies/absinthe.md) for flexible queries
- [Phoenix Framework](@/technologies/phoenix.md) - Web framework hosting the API endpoints and routing
- [Plug](@/technologies/plug.md) - Middleware pipeline for request validation and authentication
- [JOSE](@/technologies/jose.md) - JWT authentication documented in the security schemes
- [Elixir](@/technologies/elixir.md) - Source language whose typespecs drive the schema generation
- [ETS](@/technologies/ets.md) - In-memory cache for the endpoint registry

## Related Apps

- [prismatic_api](@/apps/prismatic-api.md) - The auto-introspecting REST API gateway on port 4004
- [prismatic_web](@/apps/prismatic-web.md) - The main web application whose facades are exposed through the API
- [prismatic_storage_core](@/apps/prismatic-storage-core.md) - Storage abstractions whose traits are discoverable via the scanner

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)