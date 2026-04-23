+++
title = "API Design Specialist Agent"
weight = 34
[extra]
domain = "primary"
level = "L3"
description = "Expert in REST and GraphQL API architecture, endpoint design, versioning strategies, auto-introspection optimization, and OpenAPI documentation standards for the Prismatic Platform"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "no-mercy", "liveview", "openapi", "graphql"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 95
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["API", "Design", "Specialist", "Agent", "Expert", "REST", "GraphQL", "OpenAPI", "Prismatic", "Platform"]
tags = ["agents", "agent", "api-design-specialist-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "API Design Specialist Agent - Prismatic Platform"
+++

## Overview

The API Design Specialist Agent operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Primary domain of the Prismatic Platform. This agent provides expert guidance on REST and [GraphQL](/glossary/graphql/) API architecture, endpoint design, versioning strategies, and documentation standards. Every public-facing API surface in the Prismatic ecosystem passes through this agent's review process to ensure consistency, discoverability, and long-term maintainability.

API design in the Prismatic Platform is not merely about exposing functions over HTTP. The platform's auto-introspecting REST gateway at [Prismatic API](/glossary/prismatic-api/) automatically discovers facade modules and generates [OpenAPI](/glossary/openapi/) 3.0 specifications. The API Design Specialist ensures that the underlying module structures, function signatures, and [typespec](/glossary/typespec/) annotations are optimized for this auto-discovery process, producing clean and well-documented API surfaces without manual specification writing.

The agent also governs API evolution -- the process by which endpoints are versioned, deprecated, and eventually retired. In a platform serving both external consumers and internal [LiveView](/glossary/liveview/) dashboards, breaking API changes can cascade through multiple consumer layers. The API Design Specialist enforces versioning discipline that provides backward compatibility guarantees while enabling the platform to evolve its API surface without accumulating legacy endpoint debt.

## Architecture

The API Design Specialist's review architecture is organized around three validation layers that examine API surfaces at different levels of abstraction.

**Contract Layer.** The outermost layer validates API contracts -- the formal agreements between the platform and its consumers. This includes endpoint paths, HTTP methods, request/response schemas, error codes, and pagination patterns. Contract validation uses [OpenApiSpex](/glossary/openapi/) to parse the auto-generated OpenAPI specification and check it against the platform's API design standards.

**Implementation Layer.** The middle layer validates that [Elixir](/glossary/elixir/) module structures are optimized for the auto-introspection process. Function arities, typespec annotations, module documentation, and facade pattern implementation are checked against the requirements of the Prismatic API scanner. This layer ensures that the auto-generated API specification accurately reflects the intended API surface.

**Evolution Layer.** The innermost layer tracks API versioning, deprecation timelines, and backward compatibility. When a function signature changes in a facade module, this layer assesses the impact on existing API consumers and generates migration guidance. Deprecated endpoints carry explicit sunset dates, and the evolution layer enforces that deprecated endpoints are actually removed after their sunset period.

```elixir
defmodule PrismaticAPI.DesignValidator do
  @api_standards %{
    http_methods: [:get, :post, :put, :patch, :delete],
    pagination_style: :cursor,
    error_format: :json_api,
    versioning: :url_prefix,
    auth_required: true
  }

  def validate_endpoint(endpoint_spec) do
    with {:ok, _} <- validate_method_semantics(endpoint_spec),
         {:ok, _} <- validate_response_schema(endpoint_spec),
         {:ok, _} <- validate_error_handling(endpoint_spec),
         {:ok, _} <- validate_pagination(endpoint_spec),
         {:ok, _} <- validate_typespec_coverage(endpoint_spec),
         {:ok, _} <- validate_versioning(endpoint_spec) do
      {:ok, :compliant}
    end
  end

  def validate_facade_module(module) do
    functions = module.__info__(:functions)
    specs = Code.Typespec.fetch_specs(module)
    docs = Code.fetch_docs(module)

    Enum.flat_map(functions, fn {name, arity} ->
      validate_function_api_readiness(module, name, arity, specs, docs)
    end)
  end

  defp validate_method_semantics(%{method: :get, has_side_effects: true}) do
    {:error, "GET endpoints must not have side effects"}
  end
  defp validate_method_semantics(_), do: {:ok, :valid}
end
```

## Core Capabilities

- **REST endpoint architecture** with resource-oriented design, proper HTTP method semantics, standard status codes, and pagination patterns that follow OpenAPI 3.0 conventions
- **GraphQL schema design** with careful type system planning, resolver optimization, DataLoader integration for N+1 prevention, and field-level authorization controls
- **API versioning strategy** implementing URL-based and header-based versioning with clear deprecation timelines, migration guides, and backward compatibility guarantees for existing consumers
- **Auto-introspection optimization** ensuring Elixir module structures, function arities, and typespec annotations produce clean auto-generated API documentation through the Prismatic API scanner
- **[Rate limiting](/glossary/rate-limiting/) and authentication design** defining per-endpoint rate limits, API key management patterns, and [RBAC](/glossary/rbac/) integration that balances security with usability
- **Contract testing frameworks** that verify API behavior against OpenAPI specifications, catching breaking changes before they reach production

## Implementation

The API Design Specialist integrates with the Prismatic API auto-introspection system to provide continuous validation of API surfaces.

The validation pipeline operates in two modes. The design-time mode runs during code review and pre-commit validation, checking proposed changes against API design standards. The runtime mode monitors the auto-generated OpenAPI specification for drift between the documented API surface and the actual implementation, detecting undocumented endpoints and missing typespec coverage.

Contract tests are generated automatically from the OpenAPI specification, creating a test suite that verifies every documented endpoint responds correctly to valid requests and produces appropriate error responses for invalid inputs. These contract tests run as part of the standard test suite, catching API contract violations before they reach production.

## Integration Points

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [api-gateway-specialist-agent](/agents/api-gateway-specialist-agent/) | Gateway Partner | Coordinates API routing and facade patterns for gateway management |
| [code-review-specialist-agent-v20](/agents/code-review-specialist-agent-v20/) | Quality Reviewer | Reviews API implementations for design standard compliance |
| [absolute-enforcement-commander-v6](/agents/absolute-enforcement-commander-v6/) | Quality Gate | Integrates API design validation into quality gate pipeline |
| [aiad-verification-engine](/agents/aiad-verification-engine/) | Schema Validator | Validates OpenAPI specification schema correctness |
| [aiad-dashboard-commander](/agents/aiad-dashboard-commander/) | Visibility | Displays API health metrics and deprecation timelines on dashboards |

## Operational Workflow

The API design workflow covers the complete lifecycle from initial design through deployment, versioning, and eventual retirement.

**Design Phase.** New API endpoints begin with a design review. The specialist validates the proposed endpoint against REST design principles: resource-oriented URLs, correct HTTP method semantics, comprehensive error handling, and appropriate authentication requirements. For GraphQL additions, schema design is reviewed for type safety, resolver efficiency, and authorization coverage.

**Implementation Phase.** During implementation, the specialist validates that facade modules are structured for auto-introspection: complete typespec coverage, appropriate function arities (0-2 params for GET, higher for POST), and comprehensive module documentation. Contract tests are generated from the expected API surface.

**Evolution Phase.** When API changes are required, the specialist ensures backward compatibility through versioning. Deprecated endpoints receive explicit sunset dates (minimum 90 days). Migration guides document the path from deprecated to replacement endpoints. The evolution layer tracks sunset timelines and enforces removal of deprecated endpoints after expiry.

**Retirement Phase.** Endpoints past their sunset date are removed from the API surface. The specialist verifies that no active consumers depend on the retired endpoint (through usage telemetry) before authorizing removal. Retirement is logged in the API evolution history for audit purposes.

## NABLA Compliance

The API Design Specialist operates under NABLA Infinity axiom compliance for API design decisions.

**Signal Plurality.** API design decisions are informed by multiple signals: REST design principles, platform conventions, consumer usage patterns, performance benchmarks, and security requirements. No single signal determines API design choices.

**Provenance Mandatory.** Every API design decision includes documented rationale. Endpoint design choices, versioning decisions, and deprecation timelines are recorded with the evidence and reasoning that informed them.

**Time Decay.** API usage metrics carry timestamps. Deprecation decisions are based on current usage data, not historical assumptions. Sunset timelines are reviewed periodically to ensure they remain appropriate given actual consumer migration progress.

## Configuration

```elixir
config :prismatic_api, PrismaticAPI.DesignValidator,
  api_standards_version: "2.0.0",
  pagination_style: :cursor,
  versioning_strategy: :url_prefix,
  min_deprecation_period_days: 90,
  auto_contract_test_generation: true,
  typespec_coverage_required: true,
  telemetry_prefix: [:prismatic_api, :design_validator]
```

The AIAD specification at `.aiad/agents/api-design-specialist-agent.agent.md` defines L3 strategic command authority with enforcement block requiring `no-mercy-no-doubts` doctrine compliance.

## Performance

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Endpoint validation time** | < 100ms | < 200ms | Time to validate a single endpoint against design standards |
| **Full API audit** | < 30s | < 60s | Time to validate all endpoints in the API surface |
| **Typespec coverage** | > 95% | 100% | Percentage of facade functions with typespec annotations |
| **Contract test coverage** | > 90% | > 95% | Percentage of documented endpoints with contract tests |
| **Deprecated endpoint compliance** | 100% | 100% | Deprecated endpoints with sunset dates and migration guides |
| **API documentation freshness** | > 95% | > 98% | Percentage of endpoints with current documentation |

## Related Resources

- [Prismatic API](/glossary/prismatic-api/) -- Auto-introspecting REST gateway
- [OpenAPI](/glossary/openapi/) -- API specification standard used by the platform
- [Architecture Overview](/architecture/) -- Platform architecture including API layer
- [AIAD Standard](/capabilities/aiad-standard/) -- Agent specification standard
- [Applications](/apps/) -- Platform applications with API surfaces
- [Technologies](/technologies/) -- Technology stack including API frameworks

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)