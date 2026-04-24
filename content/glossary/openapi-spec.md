+++
title = "OpenAPI Specification"
weight = 10
[extra]
description = "Industry-standard REST API documentation format enabling auto-generation, validation, and client SDK generation from Elixir typespecs"
category = "architecture"
abbreviation = "OAS"
keywords = ["API documentation", "Swagger", "OpenApiSpex", "auto-generation", "REST", "JSON Schema", "type mapping"]
related_app = "prismatic-api"
related_terms = ["umbrella-application", "adapter-pattern", "openapi", "plug", "elixir", "phoenix-liveview", "api-gateway", "swagger-ui", "json-schema"]
platforms = ["Web", "API", "Mobile"]
complexity = "intermediate"
status = "production"
version = "3.0.3"
documentation_url = "https://swagger.io/specification/"
code_repository = "apps/prismatic_api/"
maintainer = "OpenAPI Initiative"
license = "Apache 2.0"
integration_patterns = ["auto-introspection", "runtime-validation", "SDK-generation"]
use_cases = ["API documentation", "contract testing", "client generation", "validation"]
prerequisites = ["REST APIs", "JSON", "HTTP methods"]
learning_resources = ["Swagger Documentation", "OpenApiSpex Guide", "JSON Schema Tutorial"]
related_concepts = ["REST", "HTTP", "JSON", "API Gateway", "Microservices"]
business_value = "Eliminates documentation drift and enables automated API lifecycle management"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1754
date_created = "2026-02-23"
date_modified = "2026-02-23"
tags = ["glossary", "architecture", "openapi-specification", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "OpenAPI Specification - Prismatic Platform"
+++

## Definition & Overview

The OpenAPI Specification (OAS), formerly known as the Swagger Specification, is a standard, language-agnostic interface description format for RESTful APIs. Version 3.0, the current major release, defines a comprehensive structure for describing API endpoints, request and response schemas, authentication methods, server configurations, and operational metadata in machine-readable JSON or YAML format. The specification is maintained by the OpenAPI Initiative under the Linux Foundation and has become the de facto industry standard for API documentation and lifecycle management.

OpenAPI serves multiple critical purposes in modern software engineering ecosystems. First, it provides **human-readable documentation** through tools like [Swagger UI](@/glossary/swagger-ui.md) and Redoc that render interactive API explorers from the specification. Second, it enables **automated code generation** of client SDKs, server stubs, and test harnesses across dozens of programming languages through tools like OpenAPI Generator. Third, it serves as a **contract** between API producers and consumers, enabling independent development and validation of both sides against the same specification. Fourth, it enables **automated testing** through contract testing frameworks that verify implementations against the specification.

The specification describes every aspect of an API comprehensively: available endpoints (paths), HTTP methods supported by each endpoint, request parameters (path, query, header, cookie), request body schemas with detailed validation rules, response schemas for each status code including error conditions, authentication and authorization schemes, server URLs and environments, and rich metadata including API version, contact information, license, and external documentation links. This exhaustive description enables sophisticated tooling to validate requests and responses at runtime, generate comprehensive test cases, produce accurate documentation automatically, and maintain API contracts across distributed teams and services.

For enterprise platforms that expose programmatic interfaces, OpenAPI is not merely a documentation format -- it is a critical architectural component that ensures API contracts are explicit, versioned, machine-verifiable, and evolution-friendly. When combined with auto-introspection capabilities from modern language ecosystems like [Elixir](@/glossary/elixir.md), OpenAPI eliminates the common and expensive problem of documentation drift, where the specification diverges from the actual implementation over time, leading to integration failures and developer frustration.

## Historical Context & Evolution

The OpenAPI Specification evolved from Swagger, which was created by Tony Tam at Wordnik in 2011 to solve internal API documentation challenges. The specification went through several iterations:

- **Swagger 1.x (2011-2014)**: Initial format with basic endpoint documentation
- **Swagger 2.0 (2014-2017)**: Mature format with JSON Schema integration
- **OpenAPI 3.0 (2017-present)**: Transferred to Linux Foundation, enhanced type system
- **OpenAPI 3.1 (2021)**: Full JSON Schema compatibility, webhook support

The transition from Swagger to OpenAPI reflected the specification's maturation from a documentation tool to a foundational infrastructure component for API-driven architectures. The Linux Foundation governance model ensures vendor neutrality and long-term stability, making it safe for enterprises to build critical infrastructure around the specification.

## Industry Impact & Adoption

OpenAPI has achieved unprecedented adoption across the software industry:

- **95% of Fortune 500 companies** use OpenAPI for API documentation
- **250+ tools** in the OpenAPI ecosystem for generation, validation, and testing
- **50+ programming languages** supported by code generators
- **Major cloud providers** (AWS, Azure, Google Cloud) provide OpenAPI specifications for their services
- **API management platforms** (Kong, Ambassador, Istio) use OpenAPI for configuration

This widespread adoption creates powerful network effects where developers expect OpenAPI support, tools are built with OpenAPI integration as a priority, and API consumers can leverage familiar tooling across different services and vendors.

## Technical Deep Dive

### OpenAPI 3.0 Document Structure

An OpenAPI 3.0 document follows a hierarchical structure:

| Component | Purpose | Example |
|-----------|---------|---------|
| **openapi** | Specification version | `"3.0.3"` |
| **info** | API metadata (title, version, description) | `{title: "Prismatic API", version: "1.0.0"}` |
| **servers** | Base URLs for API deployment | `[{url: "https://api.prismatic.dev"}]` |
| **paths** | Available endpoints and operations | `{"/api/v1/perimeter/discover": {post: ...}}` |
| **components** | Reusable schemas, parameters, responses | `{schemas: {SecurityRating: ...}}` |
| **security** | Global authentication requirements | `[{bearerAuth: []}]` |
| **tags** | Grouping mechanism for operations | `[{name: "Perimeter", description: "EASM"}]` |

### Type System Mapping

The critical challenge in auto-generating OpenAPI specifications from Elixir code is mapping Elixir's type system to JSON Schema. The type mapping must handle Elixir's rich typespec vocabulary:

| Elixir Type | JSON Schema | Notes |
|-------------|-------------|-------|
| `integer()` | `{type: "integer"}` | Direct mapping |
| `float()` | `{type: "number", format: "float"}` | IEEE 754 |
| `String.t()` | `{type: "string"}` | Direct mapping |
| `boolean()` | `{type: "boolean"}` | Direct mapping |
| `atom()` | `{type: "string"}` | Serialized as string |
| `list(t)` | `{type: "array", items: ...}` | Recursive mapping |
| `map()` | `{type: "object"}` | Generic object |
| `%{key: value}` | `{type: "object", properties: ...}` | Typed properties |
| `t() \| nil` | `{oneOf: [type_schema, {type: "null"}]}` | Nullable |
| `{:ok, t()} \| {:error, t()}` | Response schema with status codes | Result tuple mapping |

### OpenApiSpex Integration

```elixir
defmodule PrismaticApi.Schemas.SecurityRating do
  @moduledoc """
  OpenAPI schema for security rating responses.
  Auto-generated from Elixir typespec annotations.
  """

  require OpenApiSpex

  OpenApiSpex.schema(%{
    title: "SecurityRating",
    description: "Security rating assessment for a domain",
    type: :object,
    required: [:grade, :score, :domain],
    properties: %{
      domain: %OpenApiSpex.Schema{
        type: :string,
        description: "Assessed domain name",
        example: "example.com"
      },
      grade: %OpenApiSpex.Schema{
        type: :string,
        enum: ["A", "B", "C", "D", "F"],
        description: "Letter grade (A-F)"
      },
      score: %OpenApiSpex.Schema{
        type: :integer,
        minimum: 300,
        maximum: 900,
        description: "Numeric score (300-900)"
      },
      industry_percentile: %OpenApiSpex.Schema{
        type: :number,
        format: :float,
        minimum: 0.0,
        maximum: 100.0,
        description: "Industry percentile ranking"
      },
      assessed_at: %OpenApiSpex.Schema{
        type: :string,
        format: :"date-time",
        description: "ISO 8601 assessment timestamp"
      }
    }
  })
end
```

## Advanced Schema Definition

### Complex Type Handling

OpenAPI 3.0 supports sophisticated schema definitions that can represent complex data structures:

```elixir
defmodule PrismaticApi.Schemas.ComplianceAssessment do
  @moduledoc """
  Complex nested schema for compliance assessment results.
  """

  require OpenApiSpex

  OpenApiSpex.schema(%{
    title: "ComplianceAssessment",
    description: "Comprehensive compliance assessment with nested regulations",
    type: :object,
    required: [:domain, :overall_score, :regulations],
    properties: %{
      domain: %OpenApiSpex.Schema{
        type: :string,
        format: :hostname,
        example: "example.com"
      },
      overall_score: %OpenApiSpex.Schema{
        type: :number,
        format: :float,
        minimum: 0.0,
        maximum: 100.0,
        description: "Weighted compliance score"
      },
      regulations: %OpenApiSpex.Schema{
        type: :array,
        items: %OpenApiSpex.Schema{
          type: :object,
          required: [:name, :compliance_level, :requirements],
          properties: %{
            name: %OpenApiSpex.Schema{
              type: :string,
              enum: ["NIS2", "ZKB", "GDPR", "ISO-27001"],
              description: "Regulation identifier"
            },
            compliance_level: %OpenApiSpex.Schema{
              type: :string,
              enum: ["compliant", "partial", "non_compliant", "not_applicable"],
              description: "Compliance status"
            },
            requirements: %OpenApiSpex.Schema{
              type: :array,
              items: %OpenApiSpex.Schema{
                type: :object,
                properties: %{
                  id: %OpenApiSpex.Schema{type: :string},
                  description: %OpenApiSpex.Schema{type: :string},
                  met: %OpenApiSpex.Schema{type: :boolean},
                  evidence: %OpenApiSpex.Schema{type: :array, items: %{type: :string}}
                }
              }
            }
          }
        }
      },
      assessed_at: %OpenApiSpex.Schema{
        type: :string,
        format: :"date-time",
        description: "ISO 8601 assessment timestamp"
      },
      next_assessment: %OpenApiSpex.Schema{
        type: :string,
        format: :"date-time",
        description: "Next scheduled assessment"
      }
    }
  })
end
```

### Polymorphic Responses

Using `oneOf`, `anyOf`, and `allOf` for complex response patterns:

```elixir
defmodule PrismaticApi.Schemas.SearchResult do
  @moduledoc """
  Polymorphic search result that can represent different entity types.
  """

  require OpenApiSpex

  OpenApiSpex.schema(%{
    title: "SearchResult",
    description: "Polymorphic search result",
    oneOf: [
      %OpenApiSpex.Reference{"$ref": "#/components/schemas/CompanyResult"},
      %OpenApiSpex.Reference{"$ref": "#/components/schemas/PersonResult"},
      %OpenApiSpex.Reference{"$ref": "#/components/schemas/DomainResult"}
    ],
    discriminator: %OpenApiSpex.Discriminator{
      property_name: "type",
      mapping: %{
        "company" => "#/components/schemas/CompanyResult",
        "person" => "#/components/schemas/PersonResult",
        "domain" => "#/components/schemas/DomainResult"
      }
    }
  })
end
```

## Security Integration

### Authentication Schemes

OpenAPI 3.0 supports multiple authentication schemes, properly integrated with the Prismatic Platform's [RBAC](@/glossary/rbac.md) system:

```elixir
defmodule PrismaticApi.ApiSpec do
  def spec do
    %OpenApiSpex.OpenApi{
      # ... other fields ...

      components: %OpenApiSpex.Components{
        security_schemes: %{
          "BearerAuth" => %OpenApiSpex.SecurityScheme{
            type: :http,
            scheme: :bearer,
            bearer_format: "JWT",
            description: "JWT token for API authentication"
          },
          "ApiKeyAuth" => %OpenApiSpex.SecurityScheme{
            type: :apiKey,
            in: :header,
            name: "X-API-Key",
            description: "API key for service-to-service authentication"
          },
          "OAuth2" => %OpenApiSpex.SecurityScheme{
            type: :oauth2,
            flows: %OpenApiSpex.OAuthFlows{
              authorization_code: %OpenApiSpex.OAuthFlow{
                authorization_url: "https://prismatic-prod.fly.dev/oauth/authorize",
                token_url: "https://prismatic-prod.fly.dev/oauth/token",
                scopes: %{
                  "read" => "Read access to resources",
                  "write" => "Write access to resources",
                  "admin" => "Administrative access"
                }
              }
            }
          }
        }
      },

      security: [
        %{"BearerAuth" => []},
        %{"ApiKeyAuth" => []},
        %{"OAuth2" => ["read", "write"]}
      ]
    }
  end
end
```

### Rate Limiting Documentation

```elixir
defmodule PrismaticApi.Operations.RateLimitedOperation do
  @moduledoc """
  Example of documenting rate limiting in OpenAPI operations.
  """

  use OpenApiSpex.ControllerSpecs

  def open_api_operation(action) do
    case action do
      :heavy_analysis ->
        %OpenApiSpex.Operation{
          tags: ["Analysis"],
          summary: "Perform heavy computational analysis",
          description: "Rate limited to 10 requests per minute per user",
          responses: %{
            200 => OpenApiSpex.Response.new("Analysis results", "application/json", AnalysisResult),
            429 => OpenApiSpex.Response.new("Rate limit exceeded", "application/json", RateLimitError)
          },
          extensions: %{
            "x-rate-limit" => %{
              "requests" => 10,
              "period" => "1m",
              "scope" => "user"
            }
          }
        }
    end
  end
end
```

## Architecture & Implementation

### Performance Optimizations

The auto-introspection system includes several performance optimizations for production deployment:

```elixir
defmodule PrismaticApi.Scanner.Performance do
  @moduledoc """
  Performance optimizations for the scanning and registration process.
  """

  # ETS table for O(1) endpoint lookups
  @ets_table :prismatic_api_endpoints

  # Compilation-time module analysis cache
  @compile {:persistent_term, [{:prismatic_modules, []}]}

  @spec optimized_scan() :: {:ok, non_neg_integer()}
  def optimized_scan do
    # Use compilation-time cached module list when available
    modules =
      case :persistent_term.get({:prismatic_modules, []}, []) do
        [] -> discover_modules()
        cached_modules -> cached_modules
      end

    # Parallel processing for large module sets
    endpoints =
      modules
      |> Task.async_stream(&extract_endpoints_cached/1,
                          max_concurrency: System.schedulers_online(),
                          timeout: 30_000)
      |> Enum.flat_map(fn
        {:ok, endpoints} -> endpoints
        {:error, _} -> []
      end)

    # Batch ETS insertions for better performance
    :ets.insert(@ets_table, endpoints)

    {:ok, length(endpoints)}
  end

  defp extract_endpoints_cached(module) do
    # Cache parsed results in module attributes during compilation
    case Module.get_attribute(module, :openapi_endpoints) do
      nil -> extract_and_cache_endpoints(module)
      cached -> cached
    end
  end
end
```

### Memory Management

```elixir
defmodule PrismaticApi.Scanner.MemoryManager do
  @moduledoc """
  Memory-efficient scanning for large codebases.
  """

  @spec scan_with_memory_limits() :: {:ok, non_neg_integer()}
  def scan_with_memory_limits do
    # Process modules in batches to avoid memory pressure
    batch_size = Application.get_env(:prismatic_api, :scan_batch_size, 50)

    modules = discover_modules()

    endpoint_count =
      modules
      |> Enum.chunk_every(batch_size)
      |> Enum.reduce(0, fn batch, acc ->
        endpoints = process_batch(batch)
        register_endpoints(endpoints)

        # Force garbage collection between batches
        :erlang.garbage_collect()

        acc + length(endpoints)
      end)

    {:ok, endpoint_count}
  end

  defp process_batch(modules) do
    modules
    |> Enum.map(&extract_endpoints_lazy/1)
    |> Enum.flat_map(& &1)
  end

  defp extract_endpoints_lazy(module) do
    # Lazy evaluation to reduce memory footprint
    Stream.resource(
      fn -> Code.fetch_docs(module) end,
      fn docs -> extract_from_docs_stream(docs) end,
      fn _ -> :ok end
    )
    |> Enum.to_list()
  end
end
```

### Auto-Introspection Pipeline

The Prismatic API's auto-introspection pipeline eliminates manual API documentation entirely by generating the OpenAPI specification from Elixir source code at boot time:

```
Boot Time                        Runtime                    Client
+-----------------+         +------------------+       +-------------+
| Module Scanner  |         | Dispatch         |       | Swagger UI  |
| - Code.fetch_   |-------->| Controller       |       | - /api/     |
|   docs/1        |    |    | - {app, action}  |       |   swaggerui |
| - Typespec.     |    |    |   resolution     |<------|             |
|   fetch_specs/1 |    |    | - safe_apply/3   |       | API Client  |
| - __info__/1    |    |    +------------------+       | - SDK gen   |
+---------+-------+    |                               +-------------+
          |            v
          |    +------------------+
          +--->| ETS Registry     |
          |    | - endpoint cache |
          |    | - O(1) lookup    |
          |    +------------------+
          |
          v
+-----------------+
| TypeMapper      |
| - @spec -> JSON |
|   Schema        |
| - Recursive     |
|   type walking  |
+--------+--------+
         |
         v
+-----------------+
| ApiSpec Module  |
| - OpenAPI 3.0   |
| - /api/openapi  |
+-----------------+
```

### Scanner Implementation

```elixir
defmodule PrismaticApi.Scanner do
  @moduledoc """
  Auto-discovers all Prismatic facade modules and registers
  their public functions as API endpoints.
  """

  @prismatic_prefix "Prismatic"

  @spec scan_and_register() :: {:ok, non_neg_integer()}
  def scan_and_register do
    endpoints =
      :code.all_loaded()
      |> Enum.map(fn {module, _} -> module end)
      |> Enum.filter(&prismatic_facade?/1)
      |> Enum.flat_map(&extract_endpoints/1)
      |> Enum.each(&register_endpoint/1)

    {:ok, length(endpoints)}
  end

  defp prismatic_facade?(module) do
    module_name = Atom.to_string(module)

    String.starts_with?(module_name, "Elixir.#{@prismatic_prefix}") and
      not String.contains?(module_name, ".Impl.") and
      not String.contains?(module_name, ".Internal.")
  end

  defp extract_endpoints(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, :elixir, _, module_doc, _, function_docs} ->
        function_docs
        |> Enum.filter(fn {{kind, _name, _arity}, _, _, doc, _} ->
          kind == :function and doc != :hidden
        end)
        |> Enum.map(fn {{:function, name, arity}, _, _, doc, _} ->
          specs = fetch_specs(module, name, arity)
          %{module: module, function: name, arity: arity, doc: doc, specs: specs}
        end)

      _ ->
        []
    end
  end
end
```

## Usage in Prismatic Platform

The [Prismatic API](@/glossary/prismatic-api.md) (`prismatic_api`) auto-generates a complete OpenAPI 3.0 specification by introspecting all `Prismatic*` facade modules at boot time. Using Elixir introspection (`Code.fetch_docs/1`, `Code.Typespec.fetch_specs/1`, `Module.__info__/1`), the scanner builds an ETS-cached endpoint registry with zero manual configuration.

### Available Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/v1/health` | GET | Health check endpoint |
| `/api/v1/endpoints` | GET | List all discovered endpoints |
| `/api/v1/:app/:action` | GET/POST | Generic dispatch (GET for 0-2 params, POST otherwise) |
| `/api/openapi` | GET | OpenAPI 3.0 JSON specification |
| `/api/swagger-ui` | GET | Interactive Swagger UI documentation |

### Type Mapping Flow

Elixir `@spec` type annotations are automatically mapped to JSON Schema via `OpenApiSpex`. The type mapper walks the AST representation of Elixir typespecs, recursively converting each type node to its JSON Schema equivalent. This produces a specification that stays in sync with the codebase automatically -- when a function signature changes, the API documentation updates on the next deployment.

### Runtime Validation

OpenApiSpex provides runtime request validation against the generated schemas. Every incoming API request is validated against the specification before reaching the dispatch controller, ensuring that malformed requests produce clear 422 Unprocessable Entity responses with detailed error messages.

## Code Examples

### Generic Dispatch Controller

```elixir
defmodule PrismaticApi.DispatchController do
  @moduledoc """
  Generic dispatch controller that resolves {app, action} tuples
  to module.function(args) calls using the ETS endpoint registry.
  """

  use PrismaticApi, :controller

  @spec dispatch(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def dispatch(conn, %{"app" => app, "action" => action} = params) do
    with {:ok, endpoint} <- lookup_endpoint(app, action),
         {:ok, args} <- extract_args(params, endpoint),
         {:ok, result} <- safe_apply(endpoint.module, endpoint.function, args) do
      conn
      |> put_status(200)
      |> json(%{data: result, meta: %{app: app, action: action}})
    else
      {:error, :not_found} ->
        conn |> put_status(404) |> json(%{error: "Endpoint not found"})

      {:error, :invalid_args, details} ->
        conn |> put_status(422) |> json(%{error: "Invalid arguments", details: details})

      {:error, reason} ->
        conn |> put_status(500) |> json(%{error: "Internal error", reason: inspect(reason)})
    end
  end

  defp safe_apply(module, function, args) do
    try do
      result = apply(module, function, args)
      {:ok, result}
    rescue
      e -> {:error, Exception.message(e)}
    end
  end
end
```

### API Specification Module

```elixir
defmodule PrismaticApi.ApiSpec do
  @moduledoc """
  OpenAPI 3.0 specification for the Prismatic API.
  Generated from introspected module typespecs.
  """

  @behaviour OpenApiSpex.OpenApi

  @impl true
  def spec do
    %OpenApiSpex.OpenApi{
      info: %OpenApiSpex.Info{
        title: "Prismatic Platform API",
        version: "1.0.0",
        description: "Auto-introspecting REST API for the Prismatic Platform"
      },
      servers: [
        %OpenApiSpex.Server{url: "http://localhost:4004", description: "Development"},
        %OpenApiSpex.Server{url: "https://prismatic-prod.fly.dev", description: "Production"}
      ],
      paths: generate_paths(),
      components: generate_components()
    }
    |> OpenApiSpex.resolve_schema_modules()
  end
end
```

## Enterprise Deployment Patterns

### Multi-Environment Configuration

Production OpenAPI deployments require sophisticated environment management:

```elixir
defmodule PrismaticApi.EnvironmentConfig do
  @moduledoc """
  Environment-specific OpenAPI configuration management.
  """

  @spec server_configurations() :: [OpenApiSpex.Server.t()]
  def server_configurations do
    base_servers() ++ environment_specific_servers()
  end

  defp base_servers do
    [
      %OpenApiSpex.Server{
        url: "http://localhost:4004",
        description: "Development server",
        variables: %{
          "port" => %OpenApiSpex.ServerVariable{
            default: "4004",
            enum: ["4000", "4004", "8080"]
          }
        }
      }
    ]
  end

  defp environment_specific_servers do
    case Application.get_env(:prismatic_api, :environment) do
      :prod ->
        [
          %OpenApiSpex.Server{
            url: "https://api.prismatic.dev",
            description: "Production API server"
          },
          %OpenApiSpex.Server{
            url: "https://api-eu.prismatic.dev",
            description: "European production server"
          }
        ]

      :staging ->
        [
          %OpenApiSpex.Server{
            url: "https://api-staging.prismatic.dev",
            description: "Staging environment"
          }
        ]

      _ ->
        []
    end
  end
end
```

### API Versioning Strategy

```elixir
defmodule PrismaticApi.VersionManager do
  @moduledoc """
  Manages API versioning through OpenAPI specifications.
  """

  @current_version "1.0.0"
  @supported_versions ["1.0.0", "0.9.0"]

  @spec version_specific_spec(String.t()) :: OpenApiSpex.OpenApi.t()
  def version_specific_spec(version) when version in @supported_versions do
    base_spec()
    |> apply_version_overrides(version)
    |> add_deprecation_warnings(version)
  end

  defp apply_version_overrides(spec, "0.9.0") do
    # Legacy compatibility for older API version
    %{spec |
      info: %{spec.info |
        version: "0.9.0",
        description: "Legacy API version - deprecated, please migrate to v1.0.0"
      },
      paths: filter_v1_only_paths(spec.paths)
    }
  end

  defp add_deprecation_warnings(spec, version) when version != @current_version do
    # Add deprecation notices to older versions
    %{spec |
      info: %{spec.info |
        extensions: %{
          "x-deprecated" => true,
          "x-sunset-date" => "2025-12-31",
          "x-migration-guide" => "https://docs.prismatic.dev/migration/v1.0"
        }
      }
    }
  end
end
```

### Testing & Validation Framework

```elixir
defmodule PrismaticApi.ValidationSuite do
  @moduledoc """
  Comprehensive validation suite for OpenAPI specifications.
  """

  use ExUnit.Case

  @spec validate_all_endpoints() :: :ok | {:error, [String.t()]}
  def validate_all_endpoints do
    spec = PrismaticApi.ApiSpec.spec()
    errors = []

    errors = errors ++ validate_required_fields(spec)
    errors = errors ++ validate_response_schemas(spec)
    errors = errors ++ validate_security_requirements(spec)
    errors = errors ++ validate_example_data(spec)

    case errors do
      [] -> :ok
      error_list -> {:error, error_list}
    end
  end

  defp validate_response_schemas(spec) do
    spec.paths
    |> Enum.flat_map(fn {_path, path_item} ->
      path_item
      |> extract_operations()
      |> Enum.flat_map(&validate_operation_responses/1)
    end)
  end

  defp validate_example_data(spec) do
    # Validate that all examples conform to their schemas
    spec.components.schemas
    |> Enum.flat_map(fn {name, schema} ->
      case schema.example do
        nil -> []
        example -> validate_example_against_schema(name, example, schema)
      end
    end)
  end

  @doc """
  Contract testing against running API instance.
  """
  @spec run_contract_tests(String.t()) :: :ok | {:error, [String.t()]}
  def run_contract_tests(base_url) do
    spec = PrismaticApi.ApiSpec.spec()

    spec.paths
    |> Enum.flat_map(fn {path, path_item} ->
      test_all_operations(base_url, path, path_item)
    end)
    |> case do
      [] -> :ok
      failures -> {:error, failures}
    end
  end
end
```

## Performance & Scalability

### Caching Strategies

```elixir
defmodule PrismaticApi.CacheManager do
  @moduledoc """
  Multi-layer caching for OpenAPI specifications and endpoint metadata.
  """

  use GenServer

  # L1: ETS cache for endpoint lookups
  @endpoint_cache :prismatic_api_endpoints

  # L2: Redis cache for generated specs
  @redis_cache PrismaticApi.Redis

  # L3: CDN cache for public spec endpoints
  @cdn_ttl 3600  # 1 hour

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec get_spec(String.t()) :: {:ok, map()} | {:error, :not_found}
  def get_spec(version) do
    with {:error, :not_found} <- get_from_l1_cache(version),
         {:error, :not_found} <- get_from_l2_cache(version) do
      generate_and_cache_spec(version)
    end
  end

  defp get_from_l1_cache(version) do
    case :ets.lookup(@endpoint_cache, {:spec, version}) do
      [{_, spec}] -> {:ok, spec}
      [] -> {:error, :not_found}
    end
  end

  defp get_from_l2_cache(version) do
    case Redix.command(@redis_cache, ["GET", "openapi_spec:#{version}"]) do
      {:ok, nil} -> {:error, :not_found}
      {:ok, json} -> {:ok, Jason.decode!(json)}
      {:error, _} -> {:error, :not_found}
    end
  end

  defp generate_and_cache_spec(version) do
    spec = PrismaticApi.VersionManager.version_specific_spec(version)
    json_spec = Jason.encode!(spec)

    # Cache in all layers
    :ets.insert(@endpoint_cache, {{:spec, version}, spec})
    Redix.command(@redis_cache, ["SETEX", "openapi_spec:#{version}", @cdn_ttl, json_spec])

    {:ok, spec}
  end
end
```

### Monitoring & Observability

```elixir
defmodule PrismaticApi.Telemetry do
  @moduledoc """
  Telemetry and observability for OpenAPI operations.
  """

  @spec attach_handlers() :: :ok
  def attach_handlers do
    events = [
      [:prismatic_api, :spec, :generated],
      [:prismatic_api, :endpoint, :discovered],
      [:prismatic_api, :validation, :failed],
      [:prismatic_api, :dispatch, :duration]
    ]

    :telemetry.attach_many("prismatic-api-telemetry", events, &handle_event/4, %{})
  end

  defp handle_event([:prismatic_api, :spec, :generated], measurements, metadata, _config) do
    # Track spec generation performance
    PrismaticApi.Metrics.timing("openapi.spec.generation", measurements.duration)
    PrismaticApi.Metrics.gauge("openapi.endpoints.count", metadata.endpoint_count)

    Logger.info("OpenAPI spec generated",
      version: metadata.version,
      endpoints: metadata.endpoint_count,
      duration_ms: measurements.duration
    )
  end

  defp handle_event([:prismatic_api, :validation, :failed], _measurements, metadata, _config) do
    # Track validation failures for quality monitoring
    PrismaticApi.Metrics.increment("openapi.validation.failures")

    Logger.warning("API request validation failed",
      path: metadata.path,
      method: metadata.method,
      errors: metadata.errors
    )
  end

  defp handle_event([:prismatic_api, :dispatch, :duration], measurements, metadata, _config) do
    # Track API endpoint performance
    PrismaticApi.Metrics.histogram("openapi.dispatch.duration", measurements.duration, %{
      app: metadata.app,
      action: metadata.action,
      status: metadata.status
    })
  end
end
```

## Best Practices & Guidelines

### Documentation Excellence

1. **Keep Typespecs Accurate**: Since the OpenAPI specification is generated from `@spec` annotations, inaccurate typespecs produce inaccurate API documentation. Maintain typespecs as part of the implementation, not as an afterthought. Use [Dialyzer](@/glossary/dialyzer.md) to verify typespec correctness.

2. **Document with @doc**: The `@doc` attribute provides the description field in the OpenAPI operation. Write clear, concise documentation that serves both Elixir developers reading the source and API consumers reading the Swagger UI. Include usage examples and parameter descriptions.

3. **Use Structured Return Types**: Define custom types for return values rather than using bare `map()`. Custom types map to named schemas in OpenAPI, producing more informative documentation and enabling better client code generation.

4. **Version the API**: Include version information in the URL path (`/api/v1/`) and in the OpenAPI info object. This enables backward-compatible evolution of the API while maintaining support for existing clients.

5. **Validate at Runtime**: Enable OpenApiSpex request validation in production to catch malformed requests before they reach business logic. This provides clear error messages and prevents unexpected behavior while reducing debugging time.

### Security Best Practices

6. **Document Security Requirements**: Clearly specify authentication and authorization requirements for each endpoint. Use OpenAPI security schemes to document JWT tokens, API keys, and OAuth2 flows.

7. **Validate Input Thoroughly**: Use JSON Schema validation rules (format, pattern, enum, min/max values) to validate input data. This prevents injection attacks and data corruption.

8. **Rate Limiting Documentation**: Document rate limiting policies using OpenAPI extensions (`x-rate-limit`) to help API consumers implement appropriate retry logic.

### Performance Optimization

9. **Cache Generated Specs**: Generate OpenAPI specifications at boot time and cache them in memory. Use ETag headers to enable client-side caching of the specification document.

10. **Optimize for Large APIs**: For APIs with hundreds of endpoints, consider splitting the specification into multiple documents or using OpenAPI's `$ref` mechanism to reduce duplication.

11. **Monitor Performance**: Track specification generation time, endpoint discovery duration, and validation performance using [Telemetry](@/glossary/telemetry.md) events.

### Development Workflow

12. **Test Specifications**: Write automated tests that validate the generated OpenAPI specification against JSON Schema validators and OpenAPI linters.

13. **Version Control**: Store generated specifications in version control to track API evolution and enable diff-based reviews of API changes.

14. **Continuous Integration**: Integrate OpenAPI validation into CI/CD pipelines to prevent breaking changes from reaching production.

## Common Pitfalls & Solutions

### Documentation Drift
- **Problem**: Manual modifications to generated specifications get overwritten on reboot
- **Solution**: Make all customizations through source code (typespecs, docs, schema modules) rather than editing generated files
- **Prevention**: Use version control hooks to detect manual edits to generated specifications

### Complex Type Mapping
- **Problem**: Advanced Elixir types (opaque types, complex unions, recursive types) may not map cleanly to JSON Schema
- **Solution**: Define explicit OpenAPI schema modules for complex types and test rendering in Swagger UI
- **Workaround**: Use type aliases to simplify complex union types for API boundaries

### Missing Specifications
- **Problem**: Functions without `@spec` annotations cannot be type-mapped, reducing documentation quality
- **Solution**: Enforce `@spec` annotations through [Credo](@/glossary/credo.md) rules and pre-commit hooks
- **Detection**: Add telemetry to track endpoints with missing type information

### Performance at Scale
- **Problem**: Introspecting hundreds of modules at boot time adds significant startup latency
- **Solution**: Use compilation-time caching, parallel processing, and memory-efficient scanning
- **Monitoring**: Track boot-time performance and set alerts for regression

### Security Schema Gaps
- **Problem**: Auto-generated specifications may not capture all authentication requirements
- **Solution**: Define explicit security schemes and validate them against actual middleware configuration
- **Testing**: Include contract tests that verify security enforcement matches documentation

### JSON Schema Limitations
- **Problem**: OpenAPI's JSON Schema subset cannot represent all Elixir types (atoms, tuples, processes)
- **Solution**: Use serialization layers that convert Elixir types to JSON-compatible representations
- **Documentation**: Clearly document type conversions in API documentation

### Circular Dependencies
- **Problem**: Schema references can create circular dependencies in complex domain models
- **Solution**: Use OpenAPI's `$ref` mechanism and careful schema design to break cycles
- **Architecture**: Design API schemas separately from internal domain models

## Ecosystem Integration

### Tool Compatibility Matrix

| Tool Category | Tools | OpenAPI 3.0 Support | Integration Quality |
|---------------|-------|---------------------|-------------------|
| **Code Generation** | OpenAPI Generator, Swagger Codegen | ✅ Full | Excellent |
| **Documentation** | Swagger UI, Redoc, Elements | ✅ Full | Excellent |
| **Testing** | Dredd, Pact, Postman | ✅ Full | Good |
| **Validation** | Spectral, OpenAPI-Spec-Validator | ✅ Full | Excellent |
| **API Gateways** | Kong, Ambassador, Istio | ✅ Full | Good |
| **Monitoring** | DataDog, New Relic, APM tools | 🔄 Partial | Fair |

### Client SDK Generation

```bash
# Generate TypeScript client
openapi-generator-cli generate \
  -i http://localhost:4004/api/openapi \
  -g typescript-axios \
  -o ./clients/typescript \
  --additional-properties=supportsES6=true,npmName=prismatic-api-client

# Generate Python client
openapi-generator-cli generate \
  -i http://localhost:4004/api/openapi \
  -g python \
  -o ./clients/python \
  --additional-properties=packageName=prismatic_api

# Generate Go client
openapi-generator-cli generate \
  -i http://localhost:4004/api/openapi \
  -g go \
  -o ./clients/go \
  --additional-properties=packageName=prismatic,packageVersion=1.0.0
```

### Contract Testing Integration

```elixir
defmodule PrismaticApi.ContractTest do
  @moduledoc """
  Contract testing using the generated OpenAPI specification.
  """

  use ExUnit.Case

  @spec_url "http://localhost:4004/api/openapi"

  test "all endpoints conform to OpenAPI specification" do
    {:ok, spec} = fetch_openapi_spec(@spec_url)

    spec["paths"]
    |> Enum.each(fn {path, operations} ->
      operations
      |> Enum.each(fn {method, operation} ->
        assert_endpoint_conforms(method, path, operation)
      end)
    end)
  end

  defp assert_endpoint_conforms(method, path, operation) do
    # Generate test request based on OpenAPI operation
    request = generate_test_request(method, path, operation)

    # Execute request against running API
    response = execute_request(request)

    # Validate response matches OpenAPI specification
    assert_response_valid(response, operation["responses"])
  end
end
```

## Future Developments

### OpenAPI 3.1 Migration Path

The migration to OpenAPI 3.1 brings several enhancements:

- **Full JSON Schema Draft 2020-12 support**
- **Webhook specifications**
- **Enhanced discriminator support**
- **Improved anyOf/oneOf semantics**

```elixir
defmodule PrismaticApi.Migration.OpenApi31 do
  @moduledoc """
  Migration utilities for OpenAPI 3.1 features.
  """

  @spec add_webhook_support(OpenApiSpex.OpenApi.t()) :: OpenApiSpex.OpenApi.t()
  def add_webhook_support(spec) do
    webhooks = %{
      "complianceAssessmentComplete" => %{
        "post" => %{
          "requestBody" => %{
            "content" => %{
              "application/json" => %{
                "schema" => %{"$ref" => "#/components/schemas/ComplianceWebhook"}
              }
            }
          },
          "responses" => %{
            "200" => %{"description" => "Webhook received"}
          }
        }
      }
    }

    %{spec | webhooks: webhooks}
  end
end
```

### AI-Enhanced Documentation

Future enhancements include AI-powered documentation generation:

```elixir
defmodule PrismaticApi.AI.DocumentationEnhancer do
  @moduledoc """
  AI-powered enhancement of OpenAPI documentation.
  """

  @spec enhance_descriptions(OpenApiSpex.OpenApi.t()) :: OpenApiSpex.OpenApi.t()
  def enhance_descriptions(spec) do
    spec
    |> enhance_operation_descriptions()
    |> enhance_schema_descriptions()
    |> add_usage_examples()
  end

  defp enhance_operation_descriptions(spec) do
    # Use LLM to generate comprehensive operation descriptions
    # based on function implementation and context
  end
end
```

## Related Concepts

- [Prismatic API](@/glossary/prismatic-api.md) - The application that auto-generates OpenAPI specifications
- [Umbrella Application](@/glossary/umbrella-application.md) - Architecture hosting the API application
- [Adapter Pattern](@/glossary/adapter-pattern.md) - Storage abstraction behind API endpoints
- [Elixir](@/glossary/elixir.md) - Language providing `@spec` annotations for auto-generation
- [Phoenix LiveView](@/glossary/phoenix-liveview.md) - Web framework complementing the REST API
- [RBAC](@/glossary/rbac.md) - Role-based access control enforced on API endpoints
- [Plug](@/glossary/plug.md) - Request pipeline handling API middleware

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Prismatic API App](@/apps/prismatic-api.md) - API application documentation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)