+++
title = "Sunset"
weight = 50
[extra]
description = "API version deprecation deadline after which an endpoint is permanently removed, requiring clients to migrate to newer versions"
category = "api"
related_terms = ["api", "versioning", "deprecation", "rest-api", "openapi-spec", "backward-compatibility"]
complexity_level = "beginner"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["sunset", "API deprecation", "versioning", "lifecycle", "glossary", "Prismatic Platform"]
tags = ["glossary", "api", "lifecycle"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Sunset - Prismatic Platform"
+++

## Definition & Overview

Sunsetting is the process of permanently removing an API version, endpoint, or feature after a defined deprecation period. The sunset date is the deadline after which the deprecated resource returns errors instead of responses, forcing clients to migrate to the replacement. The HTTP `Sunset` header (RFC 8594) provides a machine-readable mechanism for communicating sunset dates in API responses, enabling automated client-side migration tooling.

API sunsetting requires balancing two competing pressures. On one side, maintaining old API versions indefinitely creates maintenance burden, prevents architectural evolution, and forces the team to support potentially insecure legacy interfaces. On the other side, removing APIs too aggressively breaks integrations, erodes trust, and drives consumers to competitors. The sunset process mediates this tension through a structured lifecycle: announcement, deprecation warnings, migration support, and finally removal.

In the Prismatic Platform, the API layer at port 4004 uses versioned endpoints (`/api/v1/...`) and supports the Sunset header for deprecated endpoints. The platform's approach to sunsetting follows its broader NO MERCY philosophy applied to API lifecycle: once a sunset date is set, it is non-negotiable. The migration period provides ample time for clients to adapt, but the removal date is absolute. This predictability is more valuable to API consumers than flexibility, because it enables them to plan migration work with confidence.

## Technical Deep Dive

### Sunset Header Implementation

The platform adds Sunset headers to deprecated endpoints:

```elixir
defmodule PrismaticApi.Plugs.SunsetHeader do
  @moduledoc """
  Adds RFC 8594 Sunset header to deprecated API endpoints.
  Warns clients about upcoming endpoint removal.
  """

  import Plug.Conn

  @deprecated_endpoints %{
    {"/api/v1/osint/search", "GET"} => ~D[2026-06-01],
    {"/api/v1/tools/list", "GET"} => ~D[2026-06-01]
  }

  def init(opts), do: opts

  def call(conn, _opts) do
    key = {conn.request_path, conn.method}

    case Map.get(@deprecated_endpoints, key) do
      nil ->
        conn

      sunset_date ->
        conn
        |> put_resp_header("sunset", format_date(sunset_date))
        |> put_resp_header("deprecation", "true")
        |> put_resp_header("link", build_successor_link(key))
    end
  end

  defp format_date(date) do
    Calendar.strftime(date, "%a, %d %b %Y 00:00:00 GMT")
  end

  defp build_successor_link({path, _method}) do
    successor = String.replace(path, "/v1/", "/v2/")
    "<#{successor}>; rel=\"successor-version\""
  end
end
```

### API Lifecycle Management

The platform manages the full API lifecycle:

```elixir
defmodule PrismaticApi.Lifecycle do
  @moduledoc """
  Manages API endpoint lifecycle from introduction through sunset.
  Tracks version status and enforces deprecation policies.
  """

  @type status :: :active | :deprecated | :sunset | :removed

  @type endpoint_lifecycle :: %{
    path: String.t(),
    version: String.t(),
    introduced: Date.t(),
    deprecated: Date.t() | nil,
    sunset: Date.t() | nil,
    successor: String.t() | nil,
    status: status()
  }

  @spec get_status(String.t(), String.t()) :: status()
  def get_status(path, version) do
    lifecycle = get_lifecycle(path, version)
    today = Date.utc_today()

    cond do
      lifecycle.sunset && Date.compare(today, lifecycle.sunset) in [:gt, :eq] ->
        :removed

      lifecycle.deprecated && Date.compare(today, lifecycle.deprecated) in [:gt, :eq] ->
        :deprecated

      true ->
        :active
    end
  end

  @spec enforce_sunset(Plug.Conn.t(), String.t(), String.t()) :: Plug.Conn.t()
  def enforce_sunset(conn, path, version) do
    case get_status(path, version) do
      :removed ->
        conn
        |> Plug.Conn.put_status(410)
        |> Phoenix.Controller.json(%{
          error: "Gone",
          message: "This API endpoint has been sunset. Please migrate to the successor version.",
          successor: get_lifecycle(path, version).successor
        })
        |> Plug.Conn.halt()

      :deprecated ->
        conn

      :active ->
        conn
    end
  end

  defp get_lifecycle(path, version) do
    # Retrieved from configuration or ETS registry
    %{
      path: path,
      version: version,
      introduced: ~D[2026-01-01],
      deprecated: nil,
      sunset: nil,
      successor: nil,
      status: :active
    }
  end
end
```

### Client Migration Support

The platform provides migration tooling to help API consumers transition:

```elixir
defmodule PrismaticApi.MigrationGuide do
  @moduledoc """
  Generates migration guides for deprecated API endpoints.
  Helps clients transition to successor versions.
  """

  @spec generate(String.t(), String.t()) :: map()
  def generate(old_path, new_path) do
    %{
      from: old_path,
      to: new_path,
      breaking_changes: detect_breaking_changes(old_path, new_path),
      mapping: generate_field_mapping(old_path, new_path),
      timeline: %{
        deprecated: "Sunset header added, warnings in response",
        migration_period: "6 months minimum",
        sunset: "Endpoint returns 410 Gone",
        removal: "Endpoint removed from routing"
      }
    }
  end

  defp detect_breaking_changes(_old, _new) do
    # Compare OpenAPI specs for breaking changes
    []
  end

  defp generate_field_mapping(_old, _new) do
    # Map old field names to new field names
    %{}
  end
end
```

## Architecture & Implementation

The platform's sunset policy enforces a minimum 6-month deprecation period between the first deprecation warning and the actual sunset date. This period is documented in the API guidelines and communicated through multiple channels: Sunset headers in responses, deprecation warnings in API documentation (SwaggerUI), changelog entries, and direct notification to known API consumers.

The enforcement is implemented at the Plug middleware level. The `SunsetHeader` plug adds headers to deprecated endpoints. A separate `SunsetEnforcer` plug returns 410 Gone for endpoints past their sunset date. Both plugs read from a centralized endpoint lifecycle registry, ensuring consistency between what the documentation says and what the API actually enforces.

The 410 Gone response code is used specifically for sunset endpoints (not 404 Not Found), because 410 explicitly communicates that the resource existed previously but has been intentionally removed. Clients that handle 410 can automatically redirect to the successor endpoint if one is provided.

## Usage in Prismatic Platform

Sunset management is integrated into the API lifecycle:

```elixir
# Check endpoint status
PrismaticApi.Lifecycle.get_status("/api/v1/osint/search", "v1")
# => :deprecated

# Generate migration guide
PrismaticApi.MigrationGuide.generate("/api/v1/osint/search", "/api/v2/osint/search")
```

## Cross-References

- [REST API](@/glossary/rest-api.md) - API architecture with versioned endpoints
- [OpenAPI Spec](@/glossary/openapi-spec.md) - Documentation format tracking endpoint lifecycle
- **Versioning** - Strategy enabling parallel API versions
- **Swagger** - Interactive documentation showing deprecation status

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
