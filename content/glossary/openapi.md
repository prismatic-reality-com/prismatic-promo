+++
title = "OpenAPI"
weight = 40
[extra]
category = "api"
description = "Specification standard for describing REST APIs in machine-readable format, enabling automatic documentation generation, client SDK creation, and API validation."
related_terms = ["aiad", "otp", "graphql", "openapi-spec", "plug"]
acronym = "OAS"
technical_domain = "API Design & Documentation"
complexity_level = "Intermediate"
platform_relevance = "Critical"
elixir_libraries = ["open_api_spex", "phoenix", "jason", "plug"]
phoenix_integration = "Full - controller annotations, request validation, spec generation"
beam_specific = false
prismatic_modules = ["PrismaticApi.ApiSpec", "PrismaticApi.DispatchController", "PrismaticApi.Scanner", "PrismaticApi.TypeMapper"]
specification_version = "3.0.3"
api_port = 4004
swagger_ui_path = "/api/swaggerui"
auto_discovery = true
industry_standard = "OpenAPI Initiative (Linux Foundation)"
first_introduced = "Gen 14"
last_updated = "2026-02-22"
tags = ["openapi", "api", "rest", "swagger", "specification", "documentation", "validation", "code-generation"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1331
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OpenAPI", "Specification", "REST", "APIs", "glossary", "api", "Prismatic Platform", "Elixir"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "OpenAPI - Prismatic Platform"
+++

## Definition

OpenAPI (formerly known as the Swagger Specification) is an industry-standard, language-agnostic specification for describing RESTful APIs in a machine-readable format using JSON or YAML. Maintained by the OpenAPI Initiative under the Linux Foundation, the specification defines a structured document format that captures every aspect of an API's surface area -- available endpoints, HTTP methods, request parameters, request and response body schemas, authentication mechanisms, error responses, and operational metadata. This single-source-of-truth approach enables an entire ecosystem of tooling to operate automatically: documentation generators produce interactive API explorers, code generators create type-safe client SDKs in dozens of languages, and validation middleware enforces request/response conformance at runtime.

The specification has evolved through three major versions. OpenAPI 2.0 (Swagger) established the core concepts of paths, operations, and schema definitions. OpenAPI 3.0 introduced components (reusable schemas), improved security definitions, support for multiple content types per operation, request body as a first-class concept (replacing the `body` parameter), and link objects for expressing relationships between operations. OpenAPI 3.1 aligned the schema format with JSON Schema 2020-12 for full compatibility with the broader JSON Schema ecosystem, added support for webhooks as top-level constructs, and made the `info` and `paths` fields optional to support webhook-only APIs. The 3.0 specification is currently the most widely adopted version and the one used by the Prismatic Platform's API layer.

An OpenAPI specification serves as both a design artifact (created during API planning to define the contract before implementation) and a runtime artifact (generated from code annotations to document what has been implemented). The design-first approach ensures API consumers and producers agree on the contract before development begins, reducing integration friction and enabling parallel development of client and server. The code-first approach eliminates documentation drift by generating the specification directly from source code, ensuring that the documented API always matches the implemented API. The Prismatic Platform employs a hybrid approach: auto-introspection generates the specification from Elixir module metadata, while OpenApiSpex annotations add semantic richness that cannot be inferred from type specifications alone.

## Specification Structure

An OpenAPI 3.0 document is organized into several top-level sections, each describing a different aspect of the API:

| Section | Purpose | Required |
|---------|---------|----------|
| **openapi** | Specification version (e.g., "3.0.3") | Yes |
| **info** | API title, version, description, contact, license | Yes |
| **servers** | Base URLs for API environments (dev, staging, prod) | No |
| **paths** | Endpoint definitions with operations (GET, POST, etc.) | Yes |
| **components** | Reusable schemas, parameters, responses, headers, security schemes | No |
| **security** | Global authentication requirements | No |
| **tags** | Logical grouping of operations with descriptions | No |
| **externalDocs** | Link to external documentation | No |

```yaml
# Simplified OpenAPI 3.0 specification
openapi: "3.0.3"
info:
  title: Prismatic Platform API
  version: "1.0.0"
  description: Auto-introspecting REST API for Prismatic Platform
  contact:
    name: Tomas Korcak
    url: https://github.com/korczis
  license:
    name: GHL
    url: https://github.com/korczis/prismatic-platform/blob/main/LICENSE

servers:
  - url: http://localhost:4004/api/v1
    description: Development
  - url: https://prismatic-staging.fly.dev/api/v1
    description: Staging
  - url: https://prismatic-prod.fly.dev/api/v1
    description: Production

paths:
  /perimeter/discover:
    post:
      summary: Discover attack surface for a domain
      operationId: perimeterDiscover
      tags: [perimeter]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DiscoverRequest'
      responses:
        '200':
          description: Discovery results
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AttackSurface'
        '400':
          description: Invalid request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized

components:
  schemas:
    DiscoverRequest:
      type: object
      required: [domain]
      properties:
        domain:
          type: string
          example: "example.com"
          pattern: "^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$"
    AttackSurface:
      type: object
      properties:
        assets:
          type: array
          items:
            $ref: '#/components/schemas/Asset'
        scan_time_ms:
          type: integer
          description: Scan duration in milliseconds
    Error:
      type: object
      required: [error]
      properties:
        error:
          type: string
        details:
          type: object
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## Schema and Type System

OpenAPI's type system, based on JSON Schema, provides a rich vocabulary for describing data structures with validation constraints. The type mapping between OpenAPI schemas and Elixir types is critical for the Prismatic Platform's auto-introspection system:

| Type | Format | Elixir Equivalent | Example | Validation |
|------|--------|--------------------|---------|------------|
| `string` | (default) | `String.t()` | `"hello"` | minLength, maxLength, pattern |
| `string` | `date-time` | `DateTime.t()` | `"2026-02-14T00:00:00Z"` | RFC 3339 format |
| `string` | `uuid` | `binary()` | `"550e8400-e29b..."` | UUID format |
| `string` | `email` | `String.t()` | `"user@example.com"` | RFC 5322 format |
| `integer` | `int32` | `integer()` | `42` | minimum, maximum, multipleOf |
| `integer` | `int64` | `integer()` | `9223372036854775807` | 64-bit range |
| `number` | `float` | `float()` | `3.14` | minimum, maximum |
| `boolean` | - | `boolean()` | `true` | - |
| `array` | - | `list()` | `[1, 2, 3]` | minItems, maxItems, uniqueItems |
| `object` | - | `map()` | `%{key: "value"}` | required, additionalProperties |

Advanced schema features include:

- **oneOf/anyOf/allOf**: Polymorphic types and schema composition. `oneOf` requires exactly one schema to match, `anyOf` requires at least one, and `allOf` requires all schemas to match (used for schema inheritance/extension)
- **discriminator**: Automatic type selection based on a field value, enabling efficient deserialization of polymorphic payloads
- **nullable**: Fields that accept `null` values (replaced by type arrays in 3.1)
- **enum**: Restricted value sets, mapped to Elixir atoms or string literals
- **pattern**: Regex validation for strings, enforced at the middleware level
- **minimum/maximum**: Numeric range constraints with optional `exclusiveMinimum`/`exclusiveMaximum`
- **readOnly/writeOnly**: Fields that appear only in responses or requests, respectively

## Code Generation and Tooling Ecosystem

The OpenAPI ecosystem provides tools across every stage of the API lifecycle, from design through deployment:

| Tool Category | Examples | Purpose |
|---------------|----------|---------|
| **Documentation** | Swagger UI, Redoc, Stoplight Elements | Interactive API exploration with try-it-out |
| **Client Generation** | OpenAPI Generator, Kiota, AutoRest | Type-safe SDKs in 50+ languages |
| **Server Stubs** | OpenAPI Generator, Connexion | Scaffold server implementations from spec |
| **Validation** | Spectral, Vacuum, openapi-diff | Lint specs for style, correctness, and breaking changes |
| **Testing** | Schemathesis, Dredd, Postman | Property-based and contract API testing from specs |
| **Mocking** | Prism, WireMock, MockServer | Mock servers from specs for frontend development |
| **Diff** | oasdiff, optic, openapi-diff | Detect breaking changes between spec versions |
| **Security** | OWASP ZAP, Akto | Security scanning based on API surface |

## OpenApiSpex Integration

The Prismatic Platform uses [OpenApiSpex](https://hex.pm/packages/open_api_spex), an Elixir library that generates OpenAPI 3.0 specifications from [Phoenix](@/glossary/phoenix.md) controller annotations and Elixir type specifications. OpenApiSpex provides a bidirectional bridge: Elixir data structures define the schema, and the schema validates incoming requests at runtime:

```elixir
defmodule PrismaticApi.Schemas.SecurityRating do
  @moduledoc """
  OpenAPI schema for security rating responses.
  Used by the Perimeter EASM module to communicate
  security assessment results via the REST API.
  """

  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(%{
    title: "SecurityRating",
    description: "Security rating for an asset with A-F grade and numeric score",
    type: :object,
    required: [:grade, :score, :asset_id],
    properties: %{
      grade: %Schema{
        type: :string,
        enum: ["A", "B", "C", "D", "E", "F"],
        description: "Letter grade from A (excellent) to F (critical)"
      },
      score: %Schema{
        type: :integer,
        minimum: 300,
        maximum: 900,
        description: "Numeric score analogous to credit scores"
      },
      asset_id: %Schema{
        type: :string,
        format: :uuid,
        description: "Unique identifier of the assessed asset"
      },
      factors: %Schema{
        type: :object,
        additionalProperties: true,
        description: "Detailed scoring factors by category"
      },
      measured_at: %Schema{
        type: :string,
        format: :"date-time",
        description: "Timestamp of the assessment"
      },
      confidence: %Schema{
        type: :number,
        minimum: 0.0,
        maximum: 1.0,
        description: "Confidence level of the rating"
      }
    }
  })
end
```

OpenApiSpex provides three key capabilities for the platform:

1. **Schema Definition**: Elixir modules define request/response schemas using OpenApiSpex macros, creating a single source of truth that is both documentation and validation logic
2. **Request Validation**: Incoming requests are automatically validated against the schema before reaching controller logic, rejecting malformed requests with structured error responses
3. **Spec Generation**: The complete OpenAPI 3.0 specification is generated at runtime from module metadata and served as JSON at `/api/openapi`

## Implementation in Prismatic Platform

The `prismatic_api` application implements a unique auto-introspecting API architecture that combines OpenAPI with Elixir's runtime introspection capabilities. Rather than manually defining API endpoints, the system automatically discovers all public functions across `Prismatic*` facade modules and exposes them as documented [REST API](@/glossary/rest-api.md) endpoints:

```elixir
defmodule PrismaticApi.Scanner do
  @moduledoc """
  Auto-discovers public functions across all Prismatic* facade modules
  at boot time and builds an endpoint registry for the API gateway.
  """

  @spec scan_modules() :: {:ok, list(map())} | {:error, term()}
  def scan_modules do
    modules =
      :code.all_loaded()
      |> Enum.map(&elem(&1, 0))
      |> Enum.filter(&prismatic_facade?/1)
      |> Enum.flat_map(&extract_endpoints/1)

    {:ok, modules}
  end

  defp prismatic_facade?(module) do
    module
    |> Atom.to_string()
    |> String.starts_with?("Elixir.Prismatic")
  end

  defp extract_endpoints(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, :elixir, _, _, _, docs} ->
        docs
        |> Enum.filter(&public_function?/1)
        |> Enum.map(&build_endpoint(module, &1))

      _ ->
        []
    end
  end

  defp public_function?({{:function, _name, _arity}, _, _, doc, _}) do
    doc != :hidden
  end

  defp public_function?(_), do: false

  defp build_endpoint(module, {{:function, name, arity}, _line, _sig, _doc, _meta}) do
    specs = Code.Typespec.fetch_specs(module)

    %{
      module: module,
      function: name,
      arity: arity,
      specs: extract_matching_specs(specs, name, arity),
      app: module_to_app(module),
      action: Atom.to_string(name)
    }
  end
end
```

**Auto-Discovery Pipeline**: At boot time, the Scanner module uses `Code.fetch_docs/1`, `Code.Typespec.fetch_specs/1`, and `Module.__info__/1` to enumerate all public functions, extract their type specifications, and build an endpoint registry cached in [ETS](@/glossary/ets.md).

**Type Mapping**: Elixir `@spec` type annotations are automatically translated to JSON Schema types for the OpenAPI specification through a dedicated TypeMapper module:

```elixir
defmodule PrismaticApi.TypeMapper do
  @moduledoc """
  Maps Elixir typespec AST to OpenAPI JSON Schema types.
  Handles basic types, union types, and structured returns.
  """

  @spec elixir_to_schema(term()) :: map()
  def elixir_to_schema({:type, _, :binary, []}) do
    %{"type" => "string"}
  end

  def elixir_to_schema({:type, _, :integer, []}) do
    %{"type" => "integer"}
  end

  def elixir_to_schema({:type, _, :float, []}) do
    %{"type" => "number", "format" => "float"}
  end

  def elixir_to_schema({:type, _, :boolean, []}) do
    %{"type" => "boolean"}
  end

  def elixir_to_schema({:type, _, :map, []}) do
    %{"type" => "object", "additionalProperties" => true}
  end

  def elixir_to_schema({:type, _, :list, [inner]}) do
    %{"type" => "array", "items" => elixir_to_schema(inner)}
  end

  def elixir_to_schema(_unknown) do
    %{"type" => "object", "description" => "Complex Elixir type"}
  end
end
```

**Generic Dispatch**: A single [Plug](@/glossary/plug.md)-based controller resolves `{app, action}` path parameters to `module.function(args)` calls, eliminating the need for per-endpoint controller modules.

**Endpoint Architecture**:

| Route | Method | Description |
|-------|--------|-------------|
| `/api/v1/health` | GET | Health check (sub-10ms response) |
| `/api/v1/endpoints` | GET | List all discovered endpoints with metadata |
| `/api/v1/:app/:action` | GET/POST | Generic dispatch (GET for 0-2 params, POST otherwise) |
| `/api/openapi` | GET | OpenAPI 3.0 JSON specification |
| `/api/swaggerui` | GET | Interactive Swagger UI documentation |

```
Scanner --> Registry (ETS) --> DispatchController --> safe_apply(Module, :function, args) --> JSON
               |
         TypeMapper --> OpenApiSpex Schema
               |
         ApiSpec --> SwaggerUI
```

This architecture means that adding a new public function to any Prismatic facade module automatically creates a new API endpoint with full OpenAPI documentation, request validation, and Swagger UI entry -- zero manual configuration required.

## API Versioning Strategies

OpenAPI supports API versioning through multiple strategies, each with distinct trade-offs:

| Strategy | Implementation | Pros | Cons |
|----------|---------------|------|------|
| **URL Path** | `/api/v1/resource` | Clear, cacheable, easy to route | URL pollution, harder to sunset |
| **Header** | `Accept: application/vnd.api.v2+json` | Clean URLs, granular | Hidden versioning, harder to test |
| **Query Parameter** | `/api/resource?version=2` | Simple to implement | Not RESTful, cache key complexity |
| **Content Negotiation** | `Accept: application/vnd.prismatic.v2+json` | Most RESTful | Complex implementation |

The Prismatic Platform uses URL path versioning (`/api/v1/`) for clarity and cacheability. The OpenAPI specification includes version metadata in the `info` section, and the `oasdiff` tool detects breaking changes between specification versions during CI/CD. Breaking changes are flagged as pipeline failures, requiring explicit acknowledgment before deployment.

## Request Validation Pipeline

OpenApiSpex enables automatic request validation that catches malformed requests before they reach business logic:

```elixir
defmodule PrismaticApi.DispatchController do
  @moduledoc """
  Generic API dispatch controller that validates requests
  against OpenAPI schemas and routes to discovered endpoints.
  """

  use PrismaticApi, :controller
  use OpenApiSpex.ControllerSpecs

  @spec dispatch(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def dispatch(conn, %{"app" => app, "action" => action} = params) do
    with {:ok, endpoint} <- PrismaticApi.Registry.lookup(app, action),
         {:ok, validated_params} <- validate_params(conn, endpoint, params),
         {:ok, result} <- safe_apply(endpoint.module, endpoint.function, validated_params) do
      conn
      |> put_status(200)
      |> json(%{data: result, status: "ok"})
    else
      {:error, :not_found} ->
        conn |> put_status(404) |> json(%{error: "Endpoint not found"})

      {:error, :validation_failed, errors} ->
        conn |> put_status(400) |> json(%{error: "Validation failed", details: errors})

      {:error, reason} ->
        conn |> put_status(500) |> json(%{error: "Internal error", message: inspect(reason)})
    end
  end
end
```

## Security Schemes

OpenAPI defines multiple security scheme types that map to different authentication and authorization patterns:

| Scheme Type | OpenAPI Key | Prismatic Usage |
|-------------|-------------|-----------------|
| **HTTP Bearer** | `bearerAuth` | [JWT](@/glossary/jwt.md) token authentication |
| **API Key** | `apiKey` | Service-to-service authentication |
| **OAuth 2.0** | `oauth2` | Third-party integrations |
| **OpenID Connect** | `openIdConnect` | SSO federation |

## Design-First vs. Code-First

| Approach | Workflow | Pros | Cons |
|----------|----------|------|------|
| **Design-First** | Write spec, generate server stubs, implement logic | Contract agreed upfront, parallel development | Spec can diverge from implementation |
| **Code-First** | Write code with annotations, generate spec | Spec always matches code, less overhead | Contract discovered late, harder to parallelize |
| **Hybrid (Prismatic)** | Auto-introspect + annotate, generate spec | Best of both, zero manual endpoint wiring | Requires disciplined type annotations |

## Related Terms

- [REST API](@/glossary/rest-api.md) - Architectural style that OpenAPI describes and documents
- [API Gateway](@/glossary/api-gateway.md) - Entry point that serves and enforces the OpenAPI specification
- [Phoenix](@/glossary/phoenix.md) - Web framework hosting the OpenAPI-documented API
- [Plug](@/glossary/plug.md) - Composable middleware validating requests against OpenAPI schemas
- [GraphQL](@/glossary/graphql.md) - Alternative API paradigm with its own introspection mechanism
- [Typespec](@/glossary/typespec.md) - Elixir type annotations that feed the auto-generated OpenAPI spec
- [Endpoint](@/glossary/endpoint.md) - Individual API operations defined in the OpenAPI paths section
- [RBAC](@/glossary/rbac.md) - Access control model described in the OpenAPI security section
- [JWT](@/glossary/jwt.md) - Authentication token format defined in OpenAPI security schemes
- [Observability](@/glossary/observability.md) - Monitoring infrastructure tracking API usage and errors
- [ETS](@/glossary/ets.md) - In-memory store caching the auto-discovered endpoint registry

## See Also

- [Architecture](@/architecture/_index.md) - Platform API architecture and auto-introspection design
- [Technologies](@/technologies/_index.md) - Technology stack including API tooling
- [Apps](@/apps/_index.md) - Applications exposing OpenAPI-documented endpoints

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
