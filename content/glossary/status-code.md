+++
title = "Status Code"
weight = 50
[extra]
description = "HTTP response status indicator using standardized three-digit codes to communicate request outcome between client and server"
category = "web"
related_terms = ["http", "rest-api", "phoenix", "plug", "endpoint", "error-handling", "api"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["status code", "HTTP", "response", "REST API", "web", "glossary", "Prismatic Platform"]
tags = ["glossary", "web", "api"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Status Code - Prismatic Platform"
+++

## Definition & Overview

An HTTP status code is a three-digit integer returned by a web server as part of every HTTP response. The first digit defines the class of response: 1xx for informational, 2xx for success, 3xx for redirection, 4xx for client errors, and 5xx for server errors. Status codes communicate the outcome of a request in a machine-readable format, enabling clients to programmatically determine whether a request succeeded, failed, or requires further action.

Status codes are defined by RFC 9110 and form a critical part of the HTTP protocol contract. Using correct status codes is not merely a convention but a requirement for interoperable web services. A REST API that returns 200 for every response (including errors) breaks client-side error handling, caching, and monitoring. Correct status codes enable proxy servers to cache responses, load balancers to detect unhealthy backends, and monitoring systems to track error rates accurately.

The Prismatic Platform enforces correct status code usage across all HTTP interfaces: the Phoenix LiveView application (port 4000), the auto-introspecting REST API (port 4004), and the health check endpoints. The API layer maps Elixir's `{:ok, result}` / `{:error, reason}` tuples to appropriate HTTP status codes automatically, ensuring consistent behavior across all 127 OSINT tools exposed through the API.

## Technical Deep Dive

### Status Code Mapping in the API Layer

The platform's API dispatch controller translates Elixir result tuples to HTTP status codes:

```elixir
defmodule PrismaticApi.StatusMapper do
  @moduledoc """
  Maps Elixir result tuples to appropriate HTTP status codes.
  Ensures consistent response formatting across all API endpoints.
  """

  import Plug.Conn

  @spec respond(Plug.Conn.t(), term()) :: Plug.Conn.t()
  def respond(conn, {:ok, result}) do
    conn
    |> put_status(200)
    |> Phoenix.Controller.json(%{status: "success", data: result})
  end

  def respond(conn, {:ok, result, :created}) do
    conn
    |> put_status(201)
    |> Phoenix.Controller.json(%{status: "success", data: result})
  end

  def respond(conn, {:error, :not_found}) do
    conn
    |> put_status(404)
    |> Phoenix.Controller.json(%{status: "error", message: "Resource not found"})
  end

  def respond(conn, {:error, :unauthorized}) do
    conn
    |> put_status(401)
    |> Phoenix.Controller.json(%{status: "error", message: "Authentication required"})
  end

  def respond(conn, {:error, :forbidden}) do
    conn
    |> put_status(403)
    |> Phoenix.Controller.json(%{status: "error", message: "Insufficient permissions"})
  end

  def respond(conn, {:error, :rate_limited, retry_after}) do
    conn
    |> put_resp_header("retry-after", to_string(retry_after))
    |> put_status(429)
    |> Phoenix.Controller.json(%{status: "error", message: "Rate limit exceeded", retry_after: retry_after})
  end

  def respond(conn, {:error, :validation, errors}) do
    conn
    |> put_status(422)
    |> Phoenix.Controller.json(%{status: "error", message: "Validation failed", errors: errors})
  end

  def respond(conn, {:error, reason}) do
    conn
    |> put_status(500)
    |> Phoenix.Controller.json(%{status: "error", message: "Internal server error"})
  end
end
```

### Health Check Endpoint

The platform's health endpoint uses status codes to communicate system state to load balancers:

```elixir
defmodule PrismaticApi.HealthController do
  @moduledoc """
  Health check endpoint returning appropriate status codes
  for load balancer and monitoring integration.
  SLA: response time < 10ms.
  """

  use PrismaticApi, :controller

  @spec check(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def check(conn, _params) do
    checks = %{
      database: check_database(),
      ets_registries: check_registries(),
      memory: check_memory()
    }

    all_healthy = Enum.all?(checks, fn {_, status} -> status == :ok end)

    if all_healthy do
      conn
      |> put_status(200)
      |> json(%{status: "healthy", checks: checks, timestamp: DateTime.utc_now()})
    else
      conn
      |> put_status(503)
      |> json(%{status: "degraded", checks: checks, timestamp: DateTime.utc_now()})
    end
  end

  defp check_database do
    case Ecto.Adapters.SQL.query(PrismaticDd.Repo, "SELECT 1", []) do
      {:ok, _} -> :ok
      {:error, _} -> :error
    end
  rescue
    _ -> :error
  end

  defp check_registries do
    if :ets.whereis(:osint_tool_registry) != :undefined, do: :ok, else: :error
  end

  defp check_memory do
    memory_mb = :erlang.memory(:total) / 1_048_576
    if memory_mb < 2048, do: :ok, else: :warning
  end
end
```

### Plug-Based Error Handling

Phoenix error handling translates exceptions to status codes through the ErrorView:

```elixir
defmodule PrismaticWeb.ErrorHandler do
  @moduledoc """
  Centralized error handling that maps exceptions
  to correct HTTP status codes.
  """

  import Plug.Conn

  def call(conn, {:error, %Ecto.NoResultsError{}}) do
    conn |> put_status(404) |> halt()
  end

  def call(conn, {:error, %Ecto.ChangesetError{changeset: changeset}}) do
    errors = format_changeset_errors(changeset)
    conn |> put_status(422) |> json(%{errors: errors}) |> halt()
  end

  def call(conn, {:error, :timeout}) do
    conn |> put_status(504) |> halt()
  end

  defp format_changeset_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end
end
```

## Architecture & Implementation

The Prismatic Platform uses a layered approach to status code management. The innermost layer is the business logic, which returns `{:ok, _}` / `{:error, _}` tuples without HTTP knowledge. The middle layer (controllers, dispatchers) maps these tuples to status codes using the `StatusMapper`. The outer layer (Plug pipeline, error handlers) catches exceptions and translates them to appropriate error codes.

This separation ensures that business logic remains HTTP-agnostic while API responses are always correct. The same business logic function can be called from a LiveView (which uses flash messages), a REST API endpoint (which uses status codes), and a CLI task (which uses exit codes), each translating the result tuple to its transport-appropriate format.

The monitoring system tracks status code distributions as a key SLA metric. A sudden increase in 5xx responses triggers immediate alerting. Elevated 4xx rates might indicate client integration issues or input validation changes. The sliding window metrics system computes per-status-code rates over rolling time windows.

## Usage in Prismatic Platform

Status codes flow through every HTTP interaction in the platform:

```elixir
# API dispatch automatically maps status codes
PrismaticApi.StatusMapper.respond(conn, PrismaticPerimeter.discover("example.com"))

# Health check for load balancer integration
# GET /api/v1/health -> 200 (healthy) or 503 (degraded)
```

## Cross-References

- [REST API](/glossary/rest-api/) - API architecture relying on correct status codes
- [Plug](/glossary/plug/) - HTTP middleware managing status code responses
- [Phoenix](/glossary/phoenix/) - Web framework handling status code rendering
- [Error Handling](/glossary/error-handling/) - Strategy for mapping errors to status codes

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
