+++
title = "API Integration Guide"
weight = 15
[extra]
description = "Using the auto-introspecting REST API, authentication, OpenAPI spec, and SDK patterns"
category = "intermediate"
difficulty = "intermediate"
duration = "50 min"
prerequisites = ["getting-started", "storage-patterns"]
glossary_terms = ["aiad", "no-mercy", "easm", "sparkline", "quality-dna"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1055
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["API", "Integration", "Guide", "REST", "OpenAPI", "academy", "intermediate", "Prismatic Platform", "Step", "Prismatic"]
tags = ["academy", "intermediate", "api-integration-guide", "prismatic"]
quality_score = 80
see_also = ["glossary", "capabilities", "technologies"]
image = "/images/sections/academy.png"
image_alt = "API Integration Guide - Prismatic Platform"
+++

## Overview

The Prismatic API is not a hand-crafted REST service -- it is an auto-introspecting gateway that discovers all public functions across all `Prismatic*` facade modules at boot time and exposes them as a fully documented OpenAPI 3.0 REST API. Zero manual endpoint configuration. When you add a new public function to any facade module, the API automatically exposes it. This guide teaches you how the API works, how to use it, and how to build integrations against it.

You will learn:

- How auto-introspection discovers endpoints from Elixir module metadata
- The generic dispatch mechanism that routes HTTP requests to Elixir functions
- Authentication and authorization with API keys and RBAC
- Using the OpenAPI specification and Swagger UI
- Building client integrations and SDK patterns

## Prerequisites

- Completed [Getting Started with Prismatic Platform](@/academy/getting-started.md)
- Completed [Storage Architecture & Adapters](@/academy/storage-patterns.md)
- Basic understanding of REST APIs and HTTP
- `curl` or an HTTP client for testing

## Core Concepts

### Auto-Introspection Architecture

At boot time, the API scanner examines every loaded module matching the `Prismatic*` pattern. For each module, it extracts:

1. **Public functions** via `Module.__info__(:functions)`
2. **Documentation** via `Code.fetch_docs/1`
3. **Type specifications** via `Code.Typespec.fetch_specs/1`

These are compiled into an ETS-backed registry that maps URL paths to module functions:

```
Scanner --> Registry (ETS) --> DispatchController --> safe_apply(M, :f, args) --> JSON
              |
        TypeMapper --> OpenApiSpex Schema
              |
        ApiSpec --> SwaggerUI
```

### URL Routing Convention

Every endpoint follows the pattern:

```
/api/v1/:app/:action
```

Where:
- `:app` maps to a Prismatic module (e.g., `perimeter` maps to `PrismaticPerimeter`)
- `:action` maps to a public function on that module

HTTP method is determined by function arity:
- **GET** for functions with 0-2 parameters (passed as query params)
- **POST** for functions with 3+ parameters (passed as JSON body)

### The Registry

```elixir
defmodule PrismaticApi.Registry do
  @moduledoc """
  ETS-backed registry of discovered API endpoints.
  Populated at boot by the Scanner module.
  """

  @type endpoint :: %{
          module: module(),
          function: atom(),
          arity: non_neg_integer(),
          path: String.t(),
          method: :get | :post,
          doc: String.t() | nil,
          spec: term() | nil
        }

  @spec lookup(String.t(), String.t()) :: {:ok, endpoint()} | {:error, :not_found}
  def lookup(app, action) do
    case :ets.lookup(:api_registry, {app, action}) do
      [{_, endpoint}] -> {:ok, endpoint}
      [] -> {:error, :not_found}
    end
  end

  @spec list_endpoints() :: [endpoint()]
  def list_endpoints do
    :ets.tab2list(:api_registry)
    |> Enum.map(fn {_key, endpoint} -> endpoint end)
    |> Enum.sort_by(& &1.path)
  end
end
```

## Step-by-Step Guide

### Step 1: Start the API Server

The API runs on port 4004, separate from the main web application:

```bash
# Start the full platform (includes API)
iex -S mix phx.server

# Or start just the API application
cd apps/prismatic_api && iex -S mix phx.server
```

Verify it is running:

```bash
curl http://localhost:4004/api/v1/health
# => {"status": "ok", "timestamp": "2026-02-12T10:00:00Z"}
```

### Step 2: Discover Available Endpoints

The `/endpoints` route lists all discovered API operations:

```bash
curl http://localhost:4004/api/v1/endpoints | jq '.'
```

Response:

```json
{
  "endpoints": [
    {
      "path": "/api/v1/perimeter/discover",
      "method": "POST",
      "module": "PrismaticPerimeter",
      "function": "discover",
      "arity": 1,
      "doc": "Discovers the external attack surface for a domain."
    },
    {
      "path": "/api/v1/perimeter/security_rating",
      "method": "GET",
      "module": "PrismaticPerimeter",
      "function": "security_rating",
      "arity": 1,
      "doc": "Returns the security rating for a domain."
    }
  ],
  "total": 47
}
```

### Step 3: Call API Endpoints

**GET requests** (0-2 parameters):

```bash
# Get security rating for a domain
curl "http://localhost:4004/api/v1/perimeter/security_rating?domain=example.com"

# Response:
{
  "data": {
    "grade": "B",
    "score": 780,
    "industry_percentile": 72
  }
}
```

**POST requests** (3+ parameters):

```bash
# Run a full EASM assessment
curl -X POST http://localhost:4004/api/v1/perimeter/assess_compliance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "domain": "example.com",
    "frameworks": ["nis2", "zkb"],
    "depth": 2
  }'
```

### Step 4: Use the OpenAPI Specification

The auto-generated OpenAPI 3.0 spec is available at:

```bash
# JSON specification
curl http://localhost:4004/api/openapi

# Interactive Swagger UI
open http://localhost:4004/api/swaggerui
```

The spec includes:
- All discovered endpoints with path parameters
- Request/response schemas derived from Elixir `@spec` types
- Authentication requirements
- Documentation from `@doc` annotations

### Step 5: Authentication

The API uses Bearer token authentication:

```bash
# Set up your API key
export PRISMATIC_API_KEY="your-api-key-here"

# Authenticated request
curl -H "Authorization: Bearer $PRISMATIC_API_KEY" \
  http://localhost:4004/api/v1/perimeter/security_rating?domain=example.com
```

The authentication plug:

```elixir
defmodule PrismaticApi.Plugs.Auth do
  @moduledoc """
  API authentication plug. Validates Bearer tokens
  and assigns the authenticated user to the connection.
  """

  import Plug.Conn

  @spec init(keyword()) :: keyword()
  def init(opts), do: opts

  @spec call(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def call(conn, _opts) do
    case get_req_header(conn, "authorization") do
      ["Bearer " <> token] ->
        case validate_token(token) do
          {:ok, user} -> assign(conn, :current_user, user)
          {:error, _reason} -> unauthorized(conn)
        end

      _ ->
        unauthorized(conn)
    end
  end

  defp validate_token(token) do
    # Token validation logic
    PrismaticApi.TokenStore.validate(token)
  end

  defp unauthorized(conn) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(401, Jason.encode!(%{error: "Unauthorized"}))
    |> halt()
  end
end
```

### Step 6: Adding New Endpoints

Because the API is auto-introspecting, adding a new endpoint is as simple as adding a public function to a facade module:

```elixir
defmodule PrismaticPerimeter do
  @moduledoc """
  Public facade for the Perimeter EASM subsystem.
  All public functions are automatically exposed via the REST API.
  """

  @doc """
  Returns trending security scores for a domain over time.

  ## Parameters

    - `domain` - The domain to check
    - `days` - Number of days of history (default: 30)

  ## Returns

    `{:ok, [%{date: Date.t(), score: integer()}]}` on success.
  """
  @spec score_trend(String.t(), pos_integer()) :: {:ok, [map()]} | {:error, term()}
  def score_trend(domain, days \\ 30) do
    PrismaticPerimeter.Rating.trend(domain, days)
  end
end
```

After recompilation, this function appears at `GET /api/v1/perimeter/score_trend?domain=example.com&days=30` with full OpenAPI documentation derived from the `@doc` and `@spec`.

### Step 7: The Generic Dispatch Controller

The dispatch controller handles all API requests through a single entry point:

```elixir
defmodule PrismaticApi.DispatchController do
  @moduledoc """
  Generic dispatch controller. Routes all /api/v1/:app/:action
  requests to the appropriate Prismatic module function.
  """

  use PrismaticApi, :controller

  alias PrismaticApi.Registry

  @spec dispatch(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def dispatch(conn, %{"app" => app, "action" => action} = params) do
    case Registry.lookup(app, action) do
      {:ok, endpoint} ->
        args = extract_args(params, endpoint)

        case safe_apply(endpoint.module, endpoint.function, args) do
          {:ok, result} ->
            json(conn, %{data: result})

          {:error, reason} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{error: to_string(reason)})
        end

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Endpoint not found: #{app}/#{action}"})
    end
  end

  defp safe_apply(module, function, args) do
    try do
      apply(module, function, args)
    rescue
      e -> {:error, Exception.message(e)}
    end
  end

  defp extract_args(params, endpoint) do
    # Extract function arguments from request params
    # based on the endpoint's parameter definitions
    params
    |> Map.drop(["app", "action"])
    |> Map.values()
    |> Enum.take(endpoint.arity)
  end
end
```

## Code Examples

### Building a Client SDK

```elixir
defmodule PrismaticClient do
  @moduledoc """
  Client SDK for the Prismatic REST API.
  """

  @base_url "http://localhost:4004/api/v1"

  @spec discover(String.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def discover(domain, api_key) do
    url = "#{@base_url}/perimeter/discover"

    headers = [
      {"Content-Type", "application/json"},
      {"Authorization", "Bearer #{api_key}"}
    ]

    body = Jason.encode!(%{domain: domain})

    case HTTPoison.post(url, body, headers) do
      {:ok, %{status_code: 200, body: body}} ->
        {:ok, Jason.decode!(body)["data"]}

      {:ok, %{status_code: status, body: body}} ->
        {:error, {status, Jason.decode!(body)["error"]}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec security_rating(String.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def security_rating(domain, api_key) do
    url = "#{@base_url}/perimeter/security_rating?domain=#{URI.encode(domain)}"
    headers = [{"Authorization", "Bearer #{api_key}"}]

    case HTTPoison.get(url, headers) do
      {:ok, %{status_code: 200, body: body}} ->
        {:ok, Jason.decode!(body)["data"]}

      {:ok, %{status_code: status, body: body}} ->
        {:error, {status, Jason.decode!(body)["error"]}}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

### Using curl for Quick Testing

```bash
# Health check
curl -s http://localhost:4004/api/v1/health | jq '.'

# List all endpoints
curl -s http://localhost:4004/api/v1/endpoints | jq '.endpoints | length'

# Get security rating
curl -s "http://localhost:4004/api/v1/perimeter/security_rating?domain=example.com" \
  -H "Authorization: Bearer $API_KEY" | jq '.'

# Run compliance assessment
curl -s -X POST http://localhost:4004/api/v1/perimeter/assess_compliance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"domain": "example.com", "frameworks": ["nis2"]}' | jq '.'
```

## Common Pitfalls

**Expecting manual endpoint registration.** The API discovers endpoints automatically. Do not create controller actions for individual endpoints. Add functions to facade modules instead.

**Exposing internal functions.** Only public functions on `Prismatic*` modules are exposed. Private functions, functions on internal modules (not matching the `Prismatic*` pattern), and functions with leading underscores are excluded.

**Ignoring the @spec for API typing.** The `@spec` annotation is used to generate the OpenAPI schema. Without a spec, the endpoint's request/response types are `any`, which produces poor documentation.

**Not including @doc for endpoints.** The `@doc` annotation becomes the OpenAPI endpoint description. Missing docs produce undocumented endpoints in the Swagger UI.

**Calling heavyweight functions synchronously.** Some facade functions (like `PrismaticPerimeter.discover/1`) may take minutes to complete. For long-running operations, consider returning a job ID and providing a status-polling endpoint.

## Exercises

1. **Explore the Swagger UI.** Open `http://localhost:4004/api/swaggerui` and try calling three different endpoints. Observe how the request/response schemas match the Elixir typespecs.

2. **Add a new endpoint.** Create a new public function on any `Prismatic*` facade module with a `@doc` and `@spec`. Recompile and verify it appears in the endpoint list.

3. **Build a simple client.** Using `curl` or any HTTP library, write a script that calls the health endpoint, lists all endpoints, and calls one domain-specific endpoint.

4. **Test error handling.** Call an endpoint with invalid parameters and observe the error response. Call a non-existent endpoint and verify the 404 response.

5. **Generate a client from the OpenAPI spec.** Download the spec from `/api/openapi` and use an OpenAPI code generator (like `openapi-generator`) to create a client in your language of choice.

## Summary

The Prismatic API is an auto-introspecting REST gateway that discovers endpoints from Elixir module metadata. Public functions on `Prismatic*` facade modules are automatically exposed with OpenAPI documentation derived from `@spec` and `@doc` annotations. The generic dispatch controller routes all requests through a single entry point. Authentication uses Bearer tokens. No manual endpoint configuration is needed -- adding a public function to a facade module is sufficient.

Key takeaways:

- Auto-introspection eliminates manual API endpoint configuration
- `@spec` drives OpenAPI schema generation
- `@doc` drives OpenAPI documentation
- GET for 0-2 params, POST for 3+ params
- Swagger UI available at `/api/swaggerui`
- Add endpoints by adding public functions to facade modules

## Practical Implementation

### In Prismatic Platform

The auto-introspecting API is built on these applications:

- **prismatic_api** (`apps/prismatic_api/`) -- The standalone Phoenix app running on port 4004. Contains `PrismaticApi.Scanner` for boot-time module introspection, `PrismaticApi.Registry` (ETS-backed) for endpoint storage, `PrismaticApi.DispatchController` for generic routing, and `PrismaticApi.TypeMapper` for Elixir `@spec` to OpenAPI schema conversion. Swagger UI at `/api/swaggerui`
- **prismatic_perimeter** (`apps/prismatic_perimeter/`) -- Primary facade module whose public functions (`discover/1`, `security_rating/1`, `assess_compliance/2`) are automatically discovered and exposed as REST endpoints
- **prismatic_dd** (`apps/prismatic_dd/`) -- DD facade module providing `create_case/1`, `add_entity/2`, `investigate/1` exposed automatically via the API
- **prismatic_auth** (`apps/prismatic_auth/`) -- Authentication infrastructure supporting Bearer token validation, RBAC permissions, and API key management used by `PrismaticApi.Plugs.Auth`
- **prismatic_web** (`apps/prismatic_web/`) -- Main web app at port 4000, separate from the API. Shares authentication infrastructure with `prismatic_api`

### Code Examples from the Codebase

The auto-introspection architecture:

```elixir
# At boot, Scanner examines all Prismatic* modules:
# 1. Module.__info__(:functions)  -> discover public functions
# 2. Code.fetch_docs/1            -> extract @doc annotations
# 3. Code.Typespec.fetch_specs/1  -> extract @spec types

# Results stored in ETS and mapped to routes:
# GET  /api/v1/perimeter/security_rating  (arity 1 -> GET)
# POST /api/v1/perimeter/discover         (arity 1 -> POST for discovery)
# POST /api/v1/perimeter/assess_compliance (arity 2 -> POST)
```

API routes and health check:

```bash
# Health check (no auth required)
curl http://localhost:4004/api/v1/health

# List all discovered endpoints
curl http://localhost:4004/api/v1/endpoints

# OpenAPI 3.0 specification
curl http://localhost:4004/api/openapi

# Interactive Swagger UI
open http://localhost:4004/api/swaggerui
```

## See Also

### Related Applications
- [prismatic_api](@/apps/prismatic-api.md) -- Auto-introspecting REST gateway
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) -- EASM facade exposed through API
- [prismatic_dd](@/apps/prismatic-dd.md) -- DD facade exposed through API
- [prismatic_auth](@/apps/prismatic-auth.md) -- Authentication and RBAC for API access
- [prismatic_web](@/apps/prismatic-web.md) -- Main web application (separate from API)

### Glossary
- [API Gateway](@/glossary/api-gateway.md) -- API routing and management pattern
- [OpenAPI](@/glossary/openapi.md) -- REST API specification standard
- [REST API](@/glossary/rest-api.md) -- Representational State Transfer API design
- [RBAC](@/glossary/rbac.md) -- Role-Based Access Control for API authorization
- [Rate Limiting](@/glossary/rate-limiting.md) -- Request throttling for API protection

### Architecture
- [Storage Adapters](@/architecture/storage-adapters.md) -- Data layer behind API responses
- [Phoenix LiveView](@/architecture/phoenix-liveview.md) -- Alternative to API for real-time interfaces

### Related Academy Topics
- [Building EASM Features](@/academy/easm-development.md) -- Build features the API exposes
- [Storage Architecture](@/academy/storage-patterns.md) -- Data layer behind API responses
- [The AIAD Standard](@/academy/aiad-standard.md) -- How API endpoints map to AIAD commands
- [LiveView Dashboards](@/academy/liveview-dashboards.md) -- Alternative UI approach to REST API

## Next Steps

- [Building EASM Features](@/academy/easm-development.md) -- build features that the API exposes
- [Storage Architecture & Adapters](@/academy/storage-patterns.md) -- understand the data layer behind API responses
- [The AIAD Standard Explained](@/academy/aiad-standard.md) -- how API endpoints map to AIAD commands

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)