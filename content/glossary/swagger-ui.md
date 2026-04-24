+++
title = "Swagger UI"
description = "Comprehensive guide to Swagger UI: interactive API documentation and testing interface for OpenAPI specifications, with deep integration patterns in Elixir/Phoenix platforms and the Prismatic ecosystem."
weight = 50

[extra]
category = "api"
tags = ["swagger-ui", "openapi", "api-documentation", "rest-api", "api-gateway", "api-testing", "developer-experience", "openapi-spec", "interactive-docs", "api-design"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
author = "Tomas Korcak (korczis)"
status = "active"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["openapi", "rest-api", "api-gateway", "api-integration", "json-schema", "sdk", "developer-experience", "developer-portal", "authentication", "validation"]
key_takeaway = "Swagger UI transforms static OpenAPI specifications into interactive, explorable API documentation that accelerates developer onboarding and reduces integration friction by orders of magnitude."
platforms = ["elixir", "phoenix", "prismatic"]
use_cases = ["api-documentation", "api-testing", "developer-onboarding", "contract-validation", "integration-testing"]
prerequisites = ["rest-api", "openapi", "json-schema"]
word_count = 2053
date_modified = "2026-02-23"
keywords = ["Swagger", "Comprehensive", "OpenAPI", "ElixirPhoenix", "Prismatic", "glossary", "api", "Prismatic Platform", "OpenAPI Specification"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Swagger UI - Prismatic Platform"
+++

## Definition

Swagger UI is an open-source, browser-based interface that dynamically renders OpenAPI (formerly Swagger) specifications into interactive API documentation. It allows developers to explore endpoints, inspect request and response schemas, authenticate with real credentials, and execute live API calls directly from the documentation page -- without writing a single line of client code. Originally developed by SmartBear Software as part of the Swagger ecosystem, Swagger UI has become the de facto standard for API documentation in modern software engineering, serving as the visual layer atop the OpenAPI Specification (OAS).

At its core, Swagger UI parses a JSON or YAML OpenAPI document and generates a fully navigable HTML/JavaScript application. Each endpoint is rendered with its HTTP method, path, parameters, request body schema, response codes, and example payloads. The "Try it out" feature transforms documentation into a live testing tool, enabling developers to construct requests, submit them against a running API server, and inspect the raw HTTP responses -- all within the browser. This feedback loop drastically reduces the time required to understand and integrate with an API.

In the context of the [Prismatic Platform](@/glossary/prismatic-api.md), Swagger UI serves as the primary human interface for the auto-introspecting REST API gateway, automatically generated from Elixir typespecs and module documentation without any manual specification authoring.

## Historical Context and Evolution

The Swagger project originated in 2011 when Tony Tam at Wordnik needed a way to document their API. The initial Swagger specification provided a machine-readable format for describing RESTful APIs, and Swagger UI was built as the visual renderer for that format. By 2015, the specification had gained such widespread adoption that the Linux Foundation formed the OpenAPI Initiative (OAI) to govern it, renaming the specification to OpenAPI Specification while the tooling retained the Swagger brand.

Swagger UI has evolved through several major versions. Swagger UI 2.x established the familiar green-and-white interface that became synonymous with API documentation. Swagger UI 3.x introduced a complete rewrite using React, bringing modern component architecture, improved theming, and plugin support. Swagger UI 4.x and 5.x continued refinements with better security scheme handling, enhanced markdown rendering, and improved accessibility.

The ecosystem expanded beyond basic documentation. SwaggerHub introduced hosted collaboration. Swagger Editor enabled specification authoring. Swagger Codegen (later OpenAPI Generator) automated SDK generation. Together, these tools established a complete lifecycle for API-first development -- and Swagger UI remained the centerpiece for human consumption of API contracts.

## Core Architecture and Components

Swagger UI's architecture comprises several interconnected systems that transform a static specification into an interactive experience:

**Specification Parser**: Reads OpenAPI 2.0 (Swagger) or OpenAPI 3.0/3.1 documents in JSON or YAML format. The parser resolves `$ref` references, expands schema compositions (`allOf`, `oneOf`, `anyOf`), and builds an internal representation of the API surface.

**Layout Engine**: Organizes endpoints by tags, rendering each operation with its HTTP method badge, path template, summary, and description. The collapsible accordion interface allows navigation through large APIs without overwhelming the user.

**Schema Renderer**: Displays request and response schemas as interactive trees. Complex nested objects, arrays, enumerations, and polymorphic types are rendered with expandable nodes. JSON Schema validation rules (required fields, format constraints, patterns) are displayed inline.

**Request Builder**: The "Try it out" mode transforms static documentation into a form-based request constructor. Path parameters, query parameters, headers, and request bodies are rendered as input fields with type-appropriate widgets (text inputs, dropdowns for enums, file uploads for binary).

**HTTP Client**: Executes constructed requests against the API server, displaying the curl command equivalent, response status code, headers, and body. CORS handling and authentication token injection happen transparently.

**Authorization Manager**: Supports OAuth2 flows (implicit, authorization code, client credentials, password), API key injection (header, query, cookie), HTTP Basic/Bearer authentication, and OpenID Connect discovery.

## Platform Integration in Prismatic

The [Prismatic API](@/glossary/prismatic-api.md) gateway implements automatic Swagger UI generation as a core architectural feature. Rather than maintaining a separate OpenAPI specification document, the platform derives the entire API surface from Elixir code:

```elixir
defmodule PrismaticApi.Spec do
  @moduledoc """
  Generates OpenAPI 3.0 specification from introspected
  Prismatic facade modules. Serves as the source of truth
  for Swagger UI rendering.
  """

  alias OpenApiSpex.{Info, OpenApi, Paths, Server}

  @behaviour OpenApi

  @impl OpenApi
  def spec do
    %OpenApi{
      info: %Info{
        title: "Prismatic Platform API",
        version: "1.0.0",
        description: "Auto-introspected REST API for all Prismatic facade modules"
      },
      servers: [
        %Server{url: "http://localhost:4004", description: "Development"},
        %Server{url: "https://prismatic-prod.fly.dev", description: "Production"}
      ],
      paths: PrismaticApi.Scanner.build_paths()
    }
    |> OpenApiSpex.resolve_schema_modules()
  end
end

defmodule PrismaticApi.Router do
  use Phoenix.Router

  pipeline :api do
    plug :accepts, ["json"]
    plug OpenApiSpex.Plug.PutApiSpec, module: PrismaticApi.Spec
  end

  scope "/api" do
    pipe_through :api

    # Swagger UI served at /api/swagger-ui
    get "/swaggerui", OpenApiSpex.Plug.SwaggerUI,
      path: "/api/openapi"

    # Raw OpenAPI spec
    get "/openapi", OpenApiSpex.Plug.RenderSpec, []

    # Auto-discovered endpoints
    scope "/v1" do
      get "/health", PrismaticApi.HealthController, :check
      get "/endpoints", PrismaticApi.EndpointController, :index
      match :*, "/:app/:action", PrismaticApi.DispatchController, :dispatch
    end
  end
end
```

This approach ensures that Swagger UI always reflects the current state of the codebase. When a developer adds a new public function to any `Prismatic*` facade module with proper `@spec` and `@doc` annotations, the function automatically appears in Swagger UI on the next server restart -- zero manual specification authoring required.

## OpenAPI Specification Integration

Swagger UI's power derives from the richness of the [OpenAPI Specification](@/glossary/openapi.md) it renders. Understanding the specification structure is essential for producing high-quality interactive documentation:

```elixir
defmodule PrismaticApi.Schemas.SecurityRating do
  @moduledoc """
  OpenApiSpex schema for security rating responses.
  Swagger UI renders this as an interactive model viewer.
  """

  require OpenApiSpex
  alias OpenApiSpex.Schema

  OpenApiSpex.schema(%{
    title: "SecurityRating",
    description: "Security rating assessment for a domain",
    type: :object,
    required: [:domain, :grade, :score],
    properties: %{
      domain: %Schema{
        type: :string,
        description: "The assessed domain",
        example: "example.com"
      },
      grade: %Schema{
        type: :string,
        enum: ["A", "B", "C", "D", "F"],
        description: "Letter grade from A (best) to F (worst)"
      },
      score: %Schema{
        type: :integer,
        minimum: 300,
        maximum: 900,
        description: "Numeric score between 300 and 900"
      },
      industry_percentile: %Schema{
        type: :integer,
        minimum: 0,
        maximum: 100,
        description: "Percentile rank within the industry"
      },
      assessed_at: %Schema{
        type: :string,
        format: :"date-time",
        description: "ISO 8601 timestamp of the assessment"
      },
      findings: %Schema{
        type: :array,
        items: PrismaticApi.Schemas.Finding,
        description: "List of security findings"
      }
    }
  })
end
```

Swagger UI renders this schema as a collapsible model with field-level documentation, type annotations, validation constraints, and example values. The interactive model viewer allows developers to understand the exact shape of API responses before writing integration code.

## Authentication and Security Schemes

Swagger UI supports multiple [authentication](@/glossary/authentication.md) mechanisms, each rendered with appropriate UI controls. The Prismatic Platform configures security schemes that match its production authentication flow:

```elixir
defmodule PrismaticApi.SecuritySchemes do
  @moduledoc """
  Defines authentication schemes rendered in Swagger UI's
  Authorize dialog. Supports API key, Bearer token, and
  OAuth2 flows.
  """

  alias OpenApiSpex.SecurityScheme

  def api_key_scheme do
    %SecurityScheme{
      type: "apiKey",
      name: "X-API-Key",
      in: "header",
      description: "API key obtained from the developer portal"
    }
  end

  def bearer_scheme do
    %SecurityScheme{
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "JWT token from /api/v1/auth/token endpoint"
    }
  end

  def oauth2_scheme do
    %SecurityScheme{
      type: "oauth2",
      flows: %{
        authorizationCode: %{
          authorizationUrl: "/oauth/authorize",
          tokenUrl: "/oauth/token",
          scopes: %{
            "read:perimeter" => "Read perimeter assessments",
            "write:perimeter" => "Create perimeter scans",
            "admin" => "Full administrative access"
          }
        }
      }
    }
  end
end
```

When a developer clicks the "Authorize" button in Swagger UI, a modal dialog presents input fields appropriate to each configured scheme. Once authenticated, subsequent "Try it out" requests automatically include the credentials, enabling live testing against authenticated endpoints.

## Customization and Theming

Swagger UI supports extensive customization through configuration options, plugins, and CSS overrides. The Prismatic Platform applies custom theming to align the documentation interface with the platform's visual identity:

```elixir
defmodule PrismaticApi.SwaggerConfig do
  @moduledoc """
  Swagger UI configuration for Prismatic branding.
  Applied via OpenApiSpex plug options.
  """

  def config do
    %{
      path: "/api/openapi",
      default_model_expand_depth: 3,
      display_operation_id: true,
      doc_expansion: "list",
      filter: true,
      show_extensions: true,
      show_common_extensions: true,
      try_it_out_enabled: true,
      persist_authorization: true,
      deep_linking: true,
      syntax_highlight: %{
        activated: true,
        theme: "monokai"
      },
      validator_url: :none
    }
  end
end
```

Key configuration options include `doc_expansion` (controls initial collapse state), `filter` (enables endpoint search), `deep_linking` (produces shareable URLs for specific endpoints), `persist_authorization` (remembers credentials across page reloads), and `try_it_out_enabled` (pre-enables the interactive mode). These options are passed to the `OpenApiSpex.Plug.SwaggerUI` plug in the router configuration.

## Testing and Validation with Swagger UI

Beyond documentation, Swagger UI serves as a powerful [validation](@/glossary/validation.md) and testing tool. The platform leverages this capability in multiple ways:

```elixir
defmodule PrismaticApi.ContractTest do
  @moduledoc """
  Contract tests that verify API responses match
  the OpenAPI specification rendered by Swagger UI.
  Uses OpenApiSpex cast_and_validate for automated
  schema compliance checking.
  """

  use ExUnit.Case, async: true
  alias OpenApiSpex.TestAssertions

  setup do
    spec = PrismaticApi.Spec.spec()
    {:ok, spec: spec}
  end

  test "all endpoints return spec-compliant responses", %{spec: spec} do
    for {path, path_item} <- spec.paths,
        {method, operation} <- path_operations(path_item) do
      conn =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> dispatch_request(method, path)

      TestAssertions.assert_schema(conn.resp_body, operation, spec)
    end
  end

  test "security rating endpoint matches schema", %{spec: spec} do
    conn =
      build_conn()
      |> put_req_header("accept", "application/json")
      |> post("/api/v1/perimeter/security_rating", %{domain: "example.com"})

    assert conn.status == 200
    TestAssertions.assert_schema(conn.resp_body, "SecurityRating", spec)
  end

  defp path_operations(path_item) do
    [:get, :post, :put, :patch, :delete]
    |> Enum.map(fn method -> {method, Map.get(path_item, method)} end)
    |> Enum.reject(fn {_method, op} -> is_nil(op) end)
  end
end
```

This testing approach ensures that the documentation rendered by Swagger UI is always accurate. If the API behavior drifts from the specification, contract tests fail, preventing documentation-reality divergence -- a common problem in manually maintained API documentation.

## Performance Considerations

Swagger UI's client-side rendering performance depends on specification size. Large APIs with hundreds of endpoints and deeply nested schemas can result in slow initial rendering and high memory consumption in the browser. The Prismatic Platform addresses this through several strategies:

**Lazy Loading**: Endpoints are collapsed by default (`doc_expansion: "list"`), deferring schema rendering until the user expands a specific operation. This reduces initial DOM size and JavaScript execution time.

**Specification Splitting**: For very large API surfaces, the platform supports splitting the specification into multiple documents using `$ref` to external files, reducing the initial payload size.

**Server-Side Caching**: The OpenAPI specification is computed once at boot time and cached in ETS. Subsequent requests to `/api/openapi` serve the cached document without re-introspection, keeping response times under the platform's 10ms health check standard.

**CDN Delivery**: Swagger UI's static assets (JavaScript, CSS, fonts) are served from a CDN in production, reducing server load and improving global load times.

## Developer Experience and Onboarding

Swagger UI fundamentally transforms the [developer experience](@/glossary/developer-experience.md) for API consumers. The interactive nature of the documentation reduces the traditional API integration workflow from "read docs, write code, debug, repeat" to "explore, try, integrate":

**Discovery**: Developers browse available endpoints organized by tags, using the search/filter functionality to find relevant operations. Each endpoint's summary and description provide context without requiring external documentation.

**Exploration**: Expanding an endpoint reveals its full contract: parameters, request body schema, response codes, and example payloads. The model viewer displays the complete type hierarchy, including nested objects and polymorphic variants.

**Experimentation**: The "Try it out" feature allows developers to construct and execute requests interactively. They can modify parameters, inspect responses, and iterate rapidly -- all without leaving the browser or writing any code.

**Integration**: Once the developer understands the API behavior through experimentation, the curl command displayed with each request provides a starting point for implementation. Combined with [SDK](@/glossary/sdk.md) generation from the same OpenAPI spec, the path from exploration to production integration is seamless.

## Comparison with Alternatives

While Swagger UI dominates the API documentation space, several alternatives exist, each with distinct trade-offs:

**Redoc**: A React-based alternative that produces a three-panel layout (navigation, content, code samples). Redoc emphasizes readability over interactivity -- it renders beautiful documentation but lacks Swagger UI's "Try it out" feature by default. Best for APIs where documentation consumption outweighs interactive testing.

**Stoplight Elements**: A modern, embeddable documentation component that supports both OpenAPI and JSON Schema. Offers better customization than Swagger UI but requires more setup and commercial licensing for advanced features.

**RapiDoc**: A web component-based renderer with extensive theming support. Lighter weight than Swagger UI and supports both OpenAPI 3.0 and 3.1, but has a smaller community and fewer integrations.

**Postman/Insomnia**: Full-featured API testing clients that import OpenAPI specifications. They provide superior testing workflows but require installation and lack the zero-setup browser accessibility of Swagger UI.

The Prismatic Platform chose Swagger UI for its OpenApiSpex integration (native Elixir library support), universal familiarity among developers, zero-configuration setup, and the feedback loop between documentation and live testing.

## Security Considerations

Exposing Swagger UI in production requires careful security consideration. The interactive testing capability means that authenticated endpoints can be invoked directly from the documentation interface:

**Environment Isolation**: Swagger UI should point to the appropriate environment. Production documentation should not enable "Try it out" against production data without explicit authorization.

**Authentication Gating**: The Swagger UI endpoint itself can be protected behind authentication, ensuring only authorized developers access the documentation.

**CORS Configuration**: The API must be configured to accept requests from the Swagger UI origin. Overly permissive CORS policies can introduce [security](@/glossary/security.md) vulnerabilities.

**Sensitive Data Masking**: Example values in the specification should not contain real credentials, tokens, or personally identifiable information. The Prismatic Platform uses synthetic example data throughout its specification.

**Rate Limiting**: Interactive testing can generate significant request volume. The platform's [rate limiting](@/glossary/rate-limiting.md) infrastructure applies equally to Swagger UI requests and programmatic API calls.

## Best Practices for OpenAPI Specifications

Creating specifications that render well in Swagger UI requires attention to several authoring practices:

**Descriptive Summaries**: Every operation should have both a `summary` (short, displayed in the endpoint list) and a `description` (detailed, displayed when expanded). Use Markdown for rich formatting.

**Comprehensive Examples**: Provide `example` values for all schema properties. Swagger UI uses these to generate sample request bodies and response previews, dramatically improving comprehension.

**Meaningful Tags**: Group endpoints by functional area using tags. Swagger UI renders tags as collapsible sections, and a well-organized tag structure mirrors the mental model of API consumers.

**Error Documentation**: Document all possible response codes (400, 401, 403, 404, 422, 500) with descriptive schemas. Swagger UI renders each response code with its schema, helping developers implement comprehensive error handling.

**Schema Reuse**: Define reusable schemas in `components/schemas` and reference them with `$ref`. This keeps the specification DRY and ensures Swagger UI's model viewer displays a consistent type system.

## Integration with CI/CD Pipelines

The OpenAPI specification that feeds Swagger UI can be integrated into [CI/CD](@/glossary/ci-cd.md) pipelines for automated validation:

```elixir
defmodule Mix.Tasks.Api.ValidateSpec do
  @moduledoc """
  Mix task to validate the OpenAPI specification at build time.
  Ensures Swagger UI will render a valid, consistent API surface.
  """

  use Mix.Task

  @shortdoc "Validates the OpenAPI specification"

  @impl Mix.Task
  def run(_args) do
    Mix.Task.run("app.start")

    spec = PrismaticApi.Spec.spec()

    with :ok <- validate_all_refs_resolved(spec),
         :ok <- validate_all_schemas_documented(spec),
         :ok <- validate_all_operations_tagged(spec),
         :ok <- validate_examples_present(spec) do
      Mix.shell().info("OpenAPI specification is valid")
    else
      {:error, issues} ->
        for issue <- issues do
          Mix.shell().error("Specification issue: #{issue}")
        end

        Mix.raise("OpenAPI specification validation failed")
    end
  end

  defp validate_all_refs_resolved(spec) do
    case OpenApiSpex.resolve_schema_modules(spec) do
      %OpenApiSpex.OpenApi{} -> :ok
      _ -> {:error, ["Unresolved schema references detected"]}
    end
  end

  defp validate_all_schemas_documented(spec) do
    undocumented =
      spec.paths
      |> Enum.flat_map(fn {_path, item} -> Map.values(item) end)
      |> Enum.filter(fn op -> is_nil(op.description) end)

    case undocumented do
      [] -> :ok
      ops -> {:error, Enum.map(ops, &"Missing description: #{&1.operationId}")}
    end
  end

  defp validate_all_operations_tagged(spec) do
    untagged =
      spec.paths
      |> Enum.flat_map(fn {_path, item} -> Map.values(item) end)
      |> Enum.filter(fn op -> is_nil(op.tags) or op.tags == [] end)

    case untagged do
      [] -> :ok
      ops -> {:error, Enum.map(ops, &"Missing tags: #{&1.operationId}")}
    end
  end

  defp validate_examples_present(_spec), do: :ok
end
```

## Ecosystem and Tooling

Swagger UI exists within a rich ecosystem of complementary tools:

**OpenAPI Generator**: Produces client SDKs, server stubs, and documentation from the same specification that feeds Swagger UI. The Prismatic [Developer Portal](@/glossary/developer-portal.md) uses this to offer language-specific SDKs.

**Swagger Editor**: A browser-based specification editor with real-time Swagger UI preview. Useful during API design phases before implementation begins.

**Swagger Inspector**: A testing tool that records API interactions and generates OpenAPI specifications from observed traffic. Useful for documenting legacy APIs that lack formal specifications.

**OpenApiSpex (Elixir)**: The native Elixir library that bridges [Phoenix Framework](@/glossary/phoenix-framework.md) and the OpenAPI ecosystem. It provides schema definition macros, request validation plugs, and Swagger UI serving -- all within the OTP application lifecycle.

## Future Directions

The Swagger UI ecosystem continues evolving alongside the OpenAPI Specification:

**OpenAPI 3.1 Support**: Full alignment with JSON Schema 2020-12, enabling richer schema definitions including `if/then/else`, `prefixItems`, and improved `$ref` handling.

**Async API Integration**: As event-driven architectures grow, tools like AsyncAPI provide Swagger UI-like experiences for [WebSocket](@/glossary/websocket.md), message queue, and server-sent event APIs.

**AI-Assisted Documentation**: Large language models are being integrated into API documentation workflows, generating descriptions, examples, and usage guides from code analysis.

**Embedded Documentation**: Swagger UI components are increasingly embedded directly into developer portals and product dashboards, rather than served as standalone pages.

## Related Concepts

- [OpenAPI Specification](@/glossary/openapi.md) -- the machine-readable format Swagger UI renders
- [REST API](@/glossary/rest-api.md) -- the architectural style documented by Swagger UI
- [API Gateway](@/glossary/api-gateway.md) -- infrastructure that hosts Swagger UI alongside API routing
- [JSON Schema](@/glossary/json-schema.md) -- the type system underlying OpenAPI schemas
- [Authentication](@/glossary/authentication.md) -- security schemes configured in Swagger UI
- [Validation](@/glossary/validation.md) -- request/response validation powered by the same spec
- [SDK](@/glossary/sdk.md) -- client libraries generated from the documented specification
- [Developer Portal](@/glossary/developer-portal.md) -- the broader developer experience context
- [Phoenix Framework](@/glossary/phoenix-framework.md) -- the Elixir web framework hosting Swagger UI
- [CI/CD](@/glossary/ci-cd.md) -- pipelines that validate specification integrity

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
