+++
title = "Swagger"
weight = 50
[extra]
description = "Interactive API documentation UI powered by OpenApiSpex that provides real-time endpoint exploration, request testing, and schema browsing"
category = "api"
related_terms = ["openapi-spec", "rest-api", "api", "documentation", "json-schema", "endpoint"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Swagger", "SwaggerUI", "OpenAPI", "API documentation", "interactive", "glossary", "Prismatic Platform"]
tags = ["glossary", "api", "documentation"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Swagger - Prismatic Platform"
+++

## Definition & Overview

Swagger refers to a suite of tools for designing, building, and documenting RESTful APIs. Originally the name of the API specification format, the specification was donated to the OpenAPI Initiative in 2015 and renamed to OpenAPI Specification (OAS). Today, "Swagger" most commonly refers to SwaggerUI -- an interactive web-based documentation tool that renders an OpenAPI specification as a browsable, testable API explorer. Developers can view endpoint descriptions, examine request/response schemas, and send live API requests directly from the browser.

SwaggerUI transforms API documentation from a static reference into an interactive development tool. Instead of reading API docs and constructing curl commands manually, developers browse endpoints organized by tags, inspect parameter types and example values, fill in request forms, and execute requests with a single click. The response is displayed immediately with headers, status codes, and formatted body content. This dramatically reduces the time-to-first-successful-request for API consumers.

The Prismatic Platform serves SwaggerUI at `/api/swaggerui` on port 4004. The underlying OpenAPI 3.0 specification is generated automatically by OpenApiSpex from the platform's Elixir typespecs and controller annotations. This means the documentation is always accurate -- it is derived from the same code that handles requests, eliminating the specification-implementation drift that plagues manually maintained API docs.

## Technical Deep Dive

### OpenApiSpex Integration

The platform generates its OpenAPI spec from Elixir code:

```elixir
defmodule PrismaticApi.ApiSpec do
  @moduledoc """
  OpenAPI 3.0 specification generated from code annotations.
  Serves as the single source of truth for SwaggerUI.
  """

  alias OpenApiSpex.{Info, OpenApi, Paths, Server}

  @behaviour OpenApi

  @impl true
  def spec do
    %OpenApi{
      info: %Info{
        title: "Prismatic Platform API",
        version: "1.0.0",
        description: "Auto-introspecting REST API exposing all Prismatic facade modules"
      },
      servers: [
        %Server{url: "http://localhost:4004", description: "Development"},
        %Server{url: "https://prismatic-prod.fly.dev", description: "Production"}
      ],
      paths: Paths.from_router(PrismaticApi.Router)
    }
    |> OpenApiSpex.resolve_schema_modules()
  end
end
```

### Controller with OpenApiSpex Annotations

Each controller action declares its API contract:

```elixir
defmodule PrismaticApi.OsintController do
  use PrismaticApi, :controller
  use OpenApiSpex.ControllerSpecs

  alias PrismaticApi.Schemas

  tags ["OSINT Tools"]

  operation :list_tools,
    summary: "List all OSINT tools",
    description: "Returns all 127 registered OSINT tools with metadata",
    responses: %{
      200 => {"Tool list", "application/json", Schemas.ToolListResponse}
    }

  def list_tools(conn, _params) do
    {:ok, tools} = PrismaticOsintCore.ToolRegistry.all()
    json(conn, %{status: "success", data: tools, count: length(tools)})
  end

  operation :execute_tool,
    summary: "Execute an OSINT tool",
    description: "Runs the specified tool with provided parameters",
    parameters: [
      slug: [in: :path, type: :string, description: "Tool slug identifier", required: true]
    ],
    request_body: {"Tool parameters", "application/json", Schemas.ToolExecuteRequest},
    responses: %{
      200 => {"Execution result", "application/json", Schemas.ToolExecuteResponse},
      404 => {"Tool not found", "application/json", Schemas.ErrorResponse},
      429 => {"Rate limited", "application/json", Schemas.RateLimitResponse}
    }

  def execute_tool(conn, %{"slug" => slug} = params) do
    with {:ok, tool} <- PrismaticOsintCore.ToolRegistry.lookup(slug),
         :ok <- PrismaticOsintCore.RateLimiter.allow?(tool, conn.assigns[:user_id]),
         {:ok, result} <- PrismaticOsintCore.ToolExecutor.execute(tool, params) do
      json(conn, %{status: "success", data: result})
    end
  end
end
```

### Schema Definitions

Response schemas provide SwaggerUI with type information for display:

```elixir
defmodule PrismaticApi.Schemas do
  @moduledoc """
  OpenAPI schema definitions for request/response types.
  Rendered as interactive schema browsers in SwaggerUI.
  """

  alias OpenApiSpex.Schema

  defmodule ToolListResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ToolListResponse",
      type: :object,
      properties: %{
        status: %Schema{type: :string, example: "success"},
        count: %Schema{type: :integer, example: 127},
        data: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              slug: %Schema{type: :string, example: "ares-ico-lookup"},
              name: %Schema{type: :string, example: "ARES ICO Lookup"},
              category: %Schema{type: :string, enum: ["czech", "global", "sanctions", "eu", "uk", "us", "universal"]},
              requires_auth: %Schema{type: :boolean}
            }
          }
        }
      }
    })
  end

  defmodule ErrorResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ErrorResponse",
      type: :object,
      properties: %{
        status: %Schema{type: :string, example: "error"},
        message: %Schema{type: :string, example: "Resource not found"}
      }
    })
  end
end
```

### Router Configuration for SwaggerUI

```elixir
defmodule PrismaticApi.Router do
  use PrismaticApi, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug OpenApiSpex.Plug.PutApiSpec, module: PrismaticApi.ApiSpec
  end

  scope "/api" do
    pipe_through :api

    # OpenAPI spec endpoint (JSON)
    get "/openapi", OpenApiSpex.Plug.RenderSpec, []

    # SwaggerUI
    get "/swaggerui", OpenApiSpex.Plug.SwaggerUI, path: "/api/openapi"

    scope "/v1" do
      get "/health", PrismaticApi.HealthController, :check
      get "/endpoints", PrismaticApi.EndpointController, :list
      get "/osint/tools", PrismaticApi.OsintController, :list_tools
      post "/osint/tools/:slug/execute", PrismaticApi.OsintController, :execute_tool
    end
  end
end
```

## Architecture & Implementation

The SwaggerUI in the Prismatic Platform is auto-generated from code, ensuring zero documentation drift. When a developer adds a new controller action with OpenApiSpex annotations, SwaggerUI automatically displays the new endpoint on the next deployment. No manual documentation update is required.

The specification is available as both a JSON endpoint (`/api/openapi`) for programmatic consumption and as the interactive SwaggerUI (`/api/swaggerui`) for human consumption. External tools can consume the JSON spec for client code generation, contract testing, or import into API management platforms.

Authentication in SwaggerUI is configured to accept bearer tokens, matching the platform's `APIAuth` plug. This enables authenticated API exploration directly from the browser without switching to external tools.

## Usage in Prismatic Platform

SwaggerUI is accessible at the API port:

```bash
# Access SwaggerUI
open http://localhost:4004/api/swaggerui

# Get raw OpenAPI spec
curl http://localhost:4004/api/openapi

# Test endpoint from SwaggerUI or curl
curl -X POST http://localhost:4004/api/v1/osint/tools/ares-ico-lookup/execute \
  -H "Content-Type: application/json" \
  -d '{"ico": "12345678"}'
```

## Cross-References

- [OpenAPI Spec](@/glossary/openapi-spec.md) - Specification format rendered by SwaggerUI
- [REST API](@/glossary/rest-api.md) - API architecture documented through Swagger
- [API](@/glossary/api.md) - Broader concept of programmatic interfaces
- [Status Code](@/glossary/status-code.md) - HTTP codes displayed in SwaggerUI responses

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
