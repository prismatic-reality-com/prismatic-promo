+++
title = "Developer Portal"
weight = 50
[extra]
tags = ["glossary", "developer-experience", "documentation", "api", "onboarding", "ecosystem"]
description = "A developer portal is a centralized web-based platform that provides API documentation, SDK downloads, code examples, authentication credentials, and interactive tools for developers integrating with or extending a software platform"
category = "developer-experience"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "Developer Experience & API Management"
related_concepts = ["API documentation", "SDK", "developer experience", "OpenAPI", "Swagger UI", "interactive playground", "authentication", "rate limiting"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = "intermediate"
prerequisites = ["api", "rest-api", "documentation", "authentication"]
learning_path = ["api", "rest-api", "openapi", "swagger-ui", "sdk", "developer-portal"]
interactive_demos = ["api-explorer-playground", "sdk-quickstart-wizard", "authentication-flow-simulator"]
code_examples = true
external_resources = ["https://swagger.io/tools/swagger-ui/", "https://hexdocs.pm/open_api_spex/readme.html", "https://spec.openapis.org/oas/latest.html"]
version_introduced = "gen-19"
stability_level = "stable"
testing_scenarios = ["api-endpoint-discovery-validation", "sdk-installation-flow-testing", "authentication-credential-lifecycle", "documentation-accuracy-verification"]
keywords = ["developer portal", "API documentation", "SDK", "developer experience", "DX", "API gateway", "swagger", "openapi", "interactive docs", "code examples"]
related_terms = ["api", "rest-api", "openapi", "swagger-ui", "sdk", "documentation", "authentication", "api-gateway", "developer-experience", "prismatic-api"]
word_count = 1649
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Developer Portal - Prismatic Platform"
+++

## Definition

A developer portal is a centralized, web-accessible platform that serves as the primary interface between a software platform and the developers who build on it. It consolidates API documentation, SDK downloads, authentication credential management, interactive testing tools, code examples, tutorials, changelogs, and community resources into a single, coherent experience. The developer portal transforms a platform's technical capabilities from opaque implementation details into accessible, well-documented services that external and internal developers can discover, understand, and integrate within minutes.

Unlike simple API documentation pages that merely list endpoints and parameters, a modern developer portal provides an end-to-end developer journey: from initial discovery and evaluation, through authentication setup and first API call, to production integration, monitoring, and troubleshooting. The portal serves multiple audiences simultaneously -- from the technical evaluator making an adoption decision, to the frontend developer making their first API call, to the seasoned integrator debugging a production issue.

## Overview

Developer portals have evolved from static HTML documentation to dynamic, interactive platforms that rival the sophistication of the products they document. The modern developer portal is itself a software product, requiring careful UX design, continuous content management, real-time API testing capabilities, and integration with the platform's authentication and monitoring systems.

The evolution of developer portals mirrors the evolution of software architecture itself. As monolithic applications gave way to microservices and API-first architectures, the need for comprehensive developer documentation grew proportionally. A microservices platform with 50 services and 500 endpoints is unusable without a developer portal that provides unified discovery, consistent authentication, cross-service examples, and searchable documentation.

The Prismatic Platform's developer portal, introduced in Gen 19's Ecosystem Expansion, represents the platform's commitment to external developer adoption. Built on the auto-introspecting REST API gateway (Prismatic API), the portal automatically discovers all public facade modules, maps Elixir typespecs to OpenAPI schemas, and generates interactive documentation that stays synchronized with the codebase without manual intervention.

### Portal Architecture Layers

A developer portal typically consists of several architectural layers:

1. **Discovery Layer**: Search, browse, and filter available APIs and SDKs
2. **Documentation Layer**: Reference docs, tutorials, guides, and code examples
3. **Interactive Layer**: API playground, request builder, response inspector
4. **Authentication Layer**: API key management, OAuth flows, token lifecycle
5. **Monitoring Layer**: Usage dashboards, rate limit status, error analytics
6. **Community Layer**: Forums, issue tracking, changelog, migration guides

## Technical Details

### Auto-Introspecting API Documentation

The Prismatic Platform's developer portal leverages Elixir's introspection capabilities to generate documentation automatically from code:

```elixir
defmodule PrismaticApi.Portal.DocumentationGenerator do
  @moduledoc """
  Generates developer portal documentation by introspecting all
  Prismatic* facade modules. Uses Code.fetch_docs/1 and
  Code.Typespec.fetch_specs/1 to extract documentation and
  type information directly from compiled modules.
  """

  @type endpoint_doc :: %{
    module: module(),
    function: atom(),
    arity: non_neg_integer(),
    doc: String.t(),
    params: [param_doc()],
    return_type: String.t(),
    examples: [String.t()],
    http_method: :get | :post,
    path: String.t()
  }

  @type param_doc :: %{
    name: String.t(),
    type: String.t(),
    required: boolean(),
    description: String.t()
  }

  @spec generate_all() :: {:ok, [endpoint_doc()]}
  def generate_all do
    endpoints =
      discover_facade_modules()
      |> Enum.flat_map(&extract_public_functions/1)
      |> Enum.map(&build_endpoint_doc/1)
      |> Enum.sort_by(& &1.path)

    {:ok, endpoints}
  end

  @spec discover_facade_modules() :: [module()]
  defp discover_facade_modules do
    :code.all_loaded()
    |> Enum.map(&elem(&1, 0))
    |> Enum.filter(&facade_module?/1)
    |> Enum.sort()
  end

  @spec facade_module?(module()) :: boolean()
  defp facade_module?(module) do
    module
    |> Atom.to_string()
    |> String.starts_with?("Elixir.Prismatic")
    |> Kernel.and(has_public_api?(module))
  end

  @spec extract_public_functions(module()) :: [{module(), atom(), non_neg_integer()}]
  defp extract_public_functions(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, _, _, _, _, docs} ->
        docs
        |> Enum.filter(fn {{kind, _name, _arity}, _, _, doc, _} ->
          kind == :function and doc != :hidden
        end)
        |> Enum.map(fn {{_kind, name, arity}, _, _, _, _} ->
          {module, name, arity}
        end)

      _ ->
        []
    end
  end

  @spec build_endpoint_doc({module(), atom(), non_neg_integer()}) :: endpoint_doc()
  defp build_endpoint_doc({module, function, arity}) do
    app_name = module_to_app_name(module)
    http_method = if arity <= 2, do: :get, else: :post

    %{
      module: module,
      function: function,
      arity: arity,
      doc: fetch_function_doc(module, function, arity),
      params: extract_param_docs(module, function, arity),
      return_type: extract_return_type(module, function, arity),
      examples: generate_examples(module, function, arity),
      http_method: http_method,
      path: "/api/v1/#{app_name}/#{function}"
    }
  end
end
```

### Interactive API Playground

The developer portal includes an interactive playground powered by OpenApiSpex and SwaggerUI:

```elixir
defmodule PrismaticApi.Portal.Playground do
  @moduledoc """
  Manages the interactive API playground that allows developers
  to construct, execute, and inspect API requests directly from
  the developer portal. Provides request history, saved examples,
  and response schema validation.
  """

  @type playground_request :: %{
    method: :get | :post | :put | :delete,
    path: String.t(),
    headers: [{String.t(), String.t()}],
    query_params: %{String.t() => String.t()},
    body: map() | nil,
    auth_token: String.t() | nil
  }

  @type playground_response :: %{
    status: non_neg_integer(),
    headers: [{String.t(), String.t()}],
    body: map() | String.t(),
    timing_ms: non_neg_integer(),
    schema_valid: boolean()
  }

  @spec execute(playground_request()) :: {:ok, playground_response()} | {:error, String.t()}
  def execute(request) do
    start_time = System.monotonic_time(:millisecond)

    with {:ok, validated} <- validate_request(request),
         {:ok, authed} <- attach_authentication(validated),
         {:ok, response} <- dispatch_request(authed) do
      elapsed = System.monotonic_time(:millisecond) - start_time

      result = %{
        status: response.status,
        headers: response.headers,
        body: response.body,
        timing_ms: elapsed,
        schema_valid: validate_response_schema(request.path, response)
      }

      {:ok, result}
    end
  end

  @spec validate_request(playground_request()) :: {:ok, playground_request()} | {:error, String.t()}
  defp validate_request(request) do
    cond do
      is_nil(request.path) or request.path == "" ->
        {:error, "Path is required"}

      request.method not in [:get, :post, :put, :delete] ->
        {:error, "Invalid HTTP method: #{request.method}"}

      true ->
        {:ok, request}
    end
  end
end
```

### SDK Generation Pipeline

The developer portal includes SDK generation for multiple languages from the OpenAPI specification:

```elixir
defmodule PrismaticApi.Portal.SdkGenerator do
  @moduledoc """
  Generates language-specific SDKs from the platform's OpenAPI
  specification. Each SDK includes typed models, API client methods,
  authentication helpers, and comprehensive documentation.
  """

  @type sdk_config :: %{
    language: :elixir | :typescript | :python | :go | :rust,
    package_name: String.t(),
    version: String.t(),
    output_dir: String.t()
  }

  @type generation_result :: %{
    files_generated: non_neg_integer(),
    output_dir: String.t(),
    package_manifest: String.t(),
    warnings: [String.t()]
  }

  @spec generate(map(), sdk_config()) :: {:ok, generation_result()} | {:error, String.t()}
  def generate(openapi_spec, config) do
    with {:ok, parsed} <- parse_spec(openapi_spec),
         {:ok, models} <- generate_models(parsed, config),
         {:ok, client} <- generate_client(parsed, config),
         {:ok, auth} <- generate_auth_helpers(parsed, config),
         {:ok, tests} <- generate_test_suite(parsed, config),
         {:ok, docs} <- generate_documentation(parsed, config),
         {:ok, manifest} <- generate_package_manifest(config) do
      total_files =
        length(models) + length(client) + length(auth) +
        length(tests) + length(docs) + 1

      {:ok, %{
        files_generated: total_files,
        output_dir: config.output_dir,
        package_manifest: manifest,
        warnings: []
      }}
    end
  end

  @spec generate_models(map(), sdk_config()) :: {:ok, [String.t()]}
  defp generate_models(spec, %{language: :typescript} = _config) do
    models =
      spec
      |> Map.get("components", %{})
      |> Map.get("schemas", %{})
      |> Enum.map(fn {name, schema} ->
        generate_typescript_interface(name, schema)
      end)

    {:ok, models}
  end

  defp generate_models(spec, %{language: :elixir} = _config) do
    models =
      spec
      |> Map.get("components", %{})
      |> Map.get("schemas", %{})
      |> Enum.map(fn {name, schema} ->
        generate_elixir_struct(name, schema)
      end)

    {:ok, models}
  end
end
```

### Authentication and API Key Management

The portal provides self-service credential management:

```elixir
defmodule PrismaticApi.Portal.CredentialManager do
  @moduledoc """
  Manages developer credentials including API keys, OAuth clients,
  and JWT tokens. Provides self-service creation, rotation, and
  revocation through the developer portal interface.
  """

  @type api_key :: %{
    id: String.t(),
    key: String.t(),
    name: String.t(),
    scopes: [String.t()],
    rate_limit: non_neg_integer(),
    created_at: DateTime.t(),
    expires_at: DateTime.t() | nil,
    last_used_at: DateTime.t() | nil
  }

  @spec create_api_key(String.t(), keyword()) :: {:ok, api_key()} | {:error, String.t()}
  def create_api_key(developer_id, opts \\ []) do
    name = Keyword.get(opts, :name, "default")
    scopes = Keyword.get(opts, :scopes, ["read"])
    rate_limit = Keyword.get(opts, :rate_limit, 1000)
    expires_in = Keyword.get(opts, :expires_in, nil)

    key = generate_secure_key()

    api_key = %{
      id: generate_id(),
      key: key,
      name: name,
      scopes: scopes,
      rate_limit: rate_limit,
      created_at: DateTime.utc_now(),
      expires_at: calculate_expiry(expires_in),
      last_used_at: nil
    }

    with {:ok, _stored} <- store_credential(developer_id, api_key) do
      {:ok, api_key}
    end
  end

  @spec rotate_api_key(String.t(), String.t()) :: {:ok, api_key()} | {:error, String.t()}
  def rotate_api_key(developer_id, key_id) do
    with {:ok, existing} <- fetch_credential(developer_id, key_id),
         new_key = generate_secure_key(),
         rotated = %{existing | key: new_key, created_at: DateTime.utc_now()},
         {:ok, _stored} <- store_credential(developer_id, rotated),
         :ok <- schedule_old_key_revocation(developer_id, existing.key) do
      {:ok, rotated}
    end
  end

  @spec generate_secure_key() :: String.t()
  defp generate_secure_key do
    :crypto.strong_rand_bytes(32) |> Base.url_encode64(padding: false)
  end
end
```

## Implementation in Prismatic Platform

### Auto-Introspecting Architecture

The Prismatic Platform's developer portal is unique in its auto-introspecting design. Rather than requiring developers to manually write API documentation, the portal scans all `Prismatic*` facade modules at boot time, extracts their public functions, typespecs, and documentation strings, and generates a complete OpenAPI 3.0 specification. This approach guarantees that documentation is always synchronized with the actual codebase.

The auto-introspection pipeline operates as follows:

1. **Module Discovery**: `Code.all_loaded/0` enumerates all loaded modules, filtered to `Prismatic*` namespaces
2. **Function Extraction**: `Module.__info__(:functions)` retrieves public function signatures
3. **Documentation Extraction**: `Code.fetch_docs/1` retrieves `@moduledoc` and `@doc` annotations
4. **Type Mapping**: `Code.Typespec.fetch_specs/1` retrieves `@spec` annotations, mapped to OpenAPI JSON Schema types
5. **ETS Caching**: Discovered endpoints are cached in ETS for sub-millisecond lookup
6. **Spec Generation**: OpenApiSpex generates the complete OpenAPI 3.0 specification

### Portal Endpoints

The developer portal is accessible through several routes:

- `/api/v1/health` -- Health check endpoint (< 10ms response requirement)
- `/api/v1/endpoints` -- Complete endpoint catalog with documentation
- `/api/v1/:app/:action` -- Generic dispatch to any discovered facade function
- `/api/openapi` -- Machine-readable OpenAPI 3.0 JSON specification
- `/api/swaggerui` -- Interactive SwaggerUI for browser-based API exploration

### Gen 19 OSS Package Integration

The 4 open source packages released in Gen 19 (SDK, Plugin Kit, Security, UI) are each documented through the developer portal. The SDK package documentation includes quickstart guides, authentication examples, and integration patterns for the most common use cases.

## Comparison with Alternatives

### Static Documentation Sites (Docusaurus, GitBook) vs. Interactive Portals

Static documentation generators produce fast, searchable documentation but lack interactivity. The Prismatic developer portal combines static content (guides, tutorials) with dynamic features (API playground, credential management) in a single experience.

### API-Only Documentation (Swagger/Redoc) vs. Full Developer Portals

SwaggerUI and Redoc generate excellent API reference documentation from OpenAPI specs, but they address only one aspect of the developer journey. A full developer portal adds SDKs, authentication management, usage analytics, tutorials, and community features around the API reference core.

### Self-Hosted vs. Third-Party Portals (ReadMe, Stoplight, Postman)

Third-party developer portal platforms offer sophisticated features out of the box but introduce vendor lock-in, ongoing costs, and limitations on customization. The Prismatic Platform's self-hosted portal provides full control over the developer experience, integrates directly with the platform's authentication system, and evolves with the codebase.

### Code-First vs. Design-First API Development

Design-first approaches write the OpenAPI spec before implementing the API. Code-first approaches generate the spec from code. The Prismatic Platform uses code-first with OpenApiSpex, which ensures that the spec always reflects the actual implementation rather than a potentially outdated design document.

## Best Practices

1. **Keep Documentation Close to Code**: Use `@doc` and `@moduledoc` annotations rather than separate documentation files. The Prismatic Platform's auto-introspection relies on in-code documentation to stay synchronized.

2. **Provide Progressive Disclosure**: Structure content from simple to complex. A developer's first experience should be a working "hello world" API call within 5 minutes, not a comprehensive architecture overview.

3. **Include Runnable Examples**: Every API endpoint documentation should include a curl command, an SDK code snippet, and expected response body that developers can copy and execute immediately.

4. **Version Your API**: Use URL path versioning (`/api/v1/`, `/api/v2/`) and document breaking changes with migration guides. The Prismatic Platform uses `/api/v1/` as the current stable version.

5. **Provide Error Catalogs**: Document every possible error response with its HTTP status code, error code, human-readable message, and suggested resolution. Developers spend more time debugging errors than making successful calls.

6. **Monitor Portal Usage**: Track which documentation pages are most visited, which API playground requests fail, and which SDK languages are most downloaded. These metrics reveal where developers struggle.

7. **Test Documentation Continuously**: Use automated tests that verify documented examples still work. Documentation that includes broken examples erodes trust faster than missing documentation.

8. **Support Multiple Learning Styles**: Some developers learn from reference docs, others from tutorials, others from examples. Provide all three formats for critical integration points.

## Common Pitfalls

1. **Documentation Drift**: The most common failure mode for developer portals is documentation that falls out of sync with the API. The Prismatic Platform's auto-introspection approach eliminates this risk for API reference documentation.

2. **Authentication Complexity**: Complex authentication flows (OAuth 2.0 with PKCE, API key rotation, JWT refresh) are the most common source of developer frustration. Provide step-by-step guides with copy-pasteable code for every authentication scenario.

3. **Missing Error Documentation**: Developers encounter errors far more often than success cases during integration. Undocumented error responses force developers to reverse-engineer error handling through trial and error.

4. **Ignoring Search**: Developers rarely browse documentation linearly. If the portal's search does not index code examples, error messages, and parameter names, developers will not find what they need.

5. **Rate Limiting Surprises**: Developers who discover rate limits through failed requests rather than documentation will distrust the platform. Document rate limits prominently and provide rate limit headers in every response.

6. **SDK Version Fragmentation**: SDKs that fall behind the API version create confusion. The Prismatic Platform's SDK generation pipeline ensures SDKs are regenerated from the current OpenAPI spec.

7. **Monolingual Bias**: Providing examples only in one programming language alienates developers using other languages. At minimum, provide curl examples that work universally, plus SDK examples for the most popular client languages.

## Use Cases

### Third-Party Integration

External developers building integrations with the Prismatic Platform use the developer portal to discover available APIs, generate authentication credentials, test their integration in the playground, and monitor their API usage.

### Internal Developer Onboarding

New team members joining the Prismatic Platform use the developer portal as their first stop for understanding the platform's capabilities. The auto-generated endpoint catalog provides a complete map of available functionality.

### Partner API Programs

Organizations that partner with the Prismatic Platform receive dedicated API keys with custom rate limits and scopes, managed through the developer portal's credential management interface.

### API Evaluation

Technical evaluators comparing the Prismatic Platform against alternatives use the developer portal to assess API design quality, documentation completeness, and integration complexity without deploying the full platform.

### Compliance Documentation

The developer portal's comprehensive API documentation, including request/response schemas, authentication flows, and data handling descriptions, serves as input for compliance assessments (SOC2, ISO 27001, GDPR).

## Related Concepts

The developer portal connects to numerous concepts across the Prismatic Platform:

- [API](@/glossary/api.md) -- The programmatic interfaces that the developer portal documents and makes accessible
- [REST API](@/glossary/rest-api.md) -- The architectural style used by the Prismatic Platform's HTTP API endpoints
- [OpenAPI](@/glossary/openapi.md) -- The specification standard that powers the portal's auto-generated documentation
- [Swagger UI](@/glossary/swagger-ui.md) -- The interactive API exploration tool embedded in the developer portal
- [SDK](@/glossary/sdk.md) -- The language-specific client libraries generated from the OpenAPI specification and distributed through the portal
- [Documentation](@/glossary/documentation.md) -- The broader documentation strategy of which the developer portal is the external-facing component
- [Authentication](@/glossary/authentication.md) -- The credential management and verification system exposed through the portal
- [API Gateway](@/glossary/api-gateway.md) -- The infrastructure layer that routes portal API requests to the correct backend services
- [Developer Experience](@/glossary/developer-experience.md) -- The overall quality of the developer's interaction with the platform, of which the portal is the primary touchpoint
- [Prismatic API](@/glossary/prismatic-api.md) -- The auto-introspecting REST gateway that powers the developer portal's backend

## See Also

- [OpenAPI Spec](@/glossary/openapi-spec.md) -- Technical details of the OpenAPI 3.0 specification used by the portal
- [Rate Limiting](@/glossary/rate-limiting.md) -- How API usage limits are enforced and communicated through the portal
- [Endpoint](@/glossary/endpoint.md) -- The individual API operations discoverable through the portal
- [Introspection](@/glossary/introspection.md) -- The metaprogramming technique that enables automatic API documentation
- [Prismatic Web](@/glossary/prismatic-web.md) -- The LiveView application that hosts the developer portal's interactive features

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
