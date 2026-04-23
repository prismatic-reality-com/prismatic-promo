+++
title = "API Versioning"
weight = 50
[extra]
description = "The practice of managing changes to an API's interface over time through version identifiers, enabling backward-compatible evolution without breaking existing consumers"
category = "architecture"
related_terms = ["api", "backward-compatibility", "contract", "configuration", "endpoint", "compliance"]
tags = ["glossary", "api-versioning", "api", "rest", "backward-compatibility", "semver", "openapi", "phoenix", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
difficulty = "intermediate"
quality_score = 85
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "API versioning enables the Prismatic Platform's REST gateway to evolve its 100+ auto-discovered endpoints while maintaining backward compatibility for existing consumers"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["API versioning", "REST versioning", "URL versioning", "header versioning", "semantic versioning", "OpenAPI", "backward compatibility", "API evolution", "breaking changes"]
image = "/images/sections/glossary.png"
image_alt = "API Versioning - Prismatic Platform"
word_count = 950
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

API versioning is the practice of assigning version identifiers to API interfaces so that changes can be introduced without breaking existing consumers. As APIs evolve -- adding endpoints, modifying response shapes, deprecating features -- versioning provides a contract between the API provider and its consumers: "If you use version N, the behavior you rely on will not change." This enables independent evolution of client and server codebases, critical for platforms with multiple integration partners.

The Prismatic Platform's REST API gateway (port 4004) uses URL path versioning (`/api/v1/`) with OpenApiSpex-generated documentation, auto-discovering all public functions across Prismatic facade modules.

## Technical Deep Dive

### Versioning Strategies

| Strategy | Format | Pros | Cons | Prismatic Choice |
|----------|--------|------|------|-----------------|
| **URL Path** | `/api/v1/resource` | Explicit, cacheable | URL pollution | Yes (primary) |
| **Header** | `Accept: application/vnd.prismatic.v1+json` | Clean URLs | Hidden versioning | No |
| **Query Param** | `/api/resource?version=1` | Easy to test | Not RESTful | No |
| **Content Negotiation** | `Accept: application/json; version=1` | Standards-based | Complex | No |

### Version Lifecycle

```
Alpha (v0.x) → Beta (v1-beta) → Stable (v1) → Deprecated (v1, sunset header) → Removed
                                      ↓
                                 v2 development
                                      ↓
                                 v2 release (v1 sunset clock starts)
```

## Architecture and Implementation

```elixir
defmodule PrismaticAPI.VersionRouter do
  @moduledoc """
  Version-aware router for the Prismatic API gateway.
  Routes requests to the appropriate version handler based on
  the URL path prefix. Supports concurrent version hosting.
  """

  use Phoenix.Router

  pipeline :api_v1 do
    plug :accepts, ["json"]
    plug PrismaticAPI.Plugs.VersionHeader, version: "v1"
    plug OpenApiSpex.Plug.PutApiSpec, module: PrismaticAPI.ApiSpec.V1
  end

  scope "/api/v1", PrismaticAPI.V1 do
    pipe_through [:api, :api_auth, :api_v1]

    get "/health", HealthController, :index
    get "/endpoints", EndpointController, :index
    get "/:app/:action", DispatchController, :get_dispatch
    post "/:app/:action", DispatchController, :post_dispatch
  end

  # Future version support
  # scope "/api/v2", PrismaticAPI.V2 do
  #   pipe_through [:api, :api_auth, :api_v2]
  # end
end
```

### Version Negotiation Plug

```elixir
defmodule PrismaticAPI.Plugs.VersionHeader do
  @moduledoc """
  Adds API version headers to responses for client awareness.
  Includes deprecation warnings for sunset versions.
  """

  @behaviour Plug

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, opts) do
    version = Keyword.fetch!(opts, :version)

    conn
    |> Plug.Conn.put_resp_header("x-api-version", version)
    |> Plug.Conn.put_resp_header("x-api-supported-versions", "v1")
    |> maybe_add_sunset_header(version)
  end

  defp maybe_add_sunset_header(conn, version) do
    case get_sunset_date(version) do
      nil -> conn
      date -> Plug.Conn.put_resp_header(conn, "sunset", date)
    end
  end

  defp get_sunset_date(_version), do: nil
end
```

## Usage in Prismatic Platform

- **REST API Gateway**: `/api/v1/` prefix for all auto-discovered endpoints (100+ facade functions)
- **OpenApiSpex Integration**: Version-specific OpenAPI 3.0 specs at `/api/openapi`
- **Swagger UI**: Version-aware interactive documentation at `/api/swaggerui`
- **OSINT API**: Tool execution endpoints versioned for stability
- **Perimeter API**: Security rating and asset discovery endpoints under versioned paths

## Code Examples

### Version-Aware Response Formatting

```elixir
defmodule PrismaticAPI.V1.ResponseFormatter do
  @moduledoc """
  Formats API responses for v1 consumers with consistent envelope structure.
  """

  @spec success(term(), map()) :: map()
  def success(data, metadata \\ %{}) do
    %{
      version: "v1",
      status: "success",
      data: data,
      metadata: Map.merge(%{timestamp: DateTime.utc_now()}, metadata)
    }
  end

  @spec error(String.t(), String.t(), integer()) :: map()
  def error(code, message, http_status) do
    %{
      version: "v1",
      status: "error",
      error: %{code: code, message: message, http_status: http_status}
    }
  end
end
```

## Best Practices

1. **Version from day one**: Adding versioning retroactively is painful. Start with `/api/v1/` even if you do not anticipate changes.

2. **Use semantic versioning for the API spec**: Major version bumps for breaking changes, minor for additions, patch for fixes.

3. **Communicate deprecation clearly**: Use `Sunset` and `Deprecation` HTTP headers with clear dates.

4. **Support at most two concurrent versions**: Maintaining more than two active versions creates unsustainable maintenance burden.

5. **Define what constitutes a breaking change**: Adding fields is not breaking. Removing fields, changing types, or altering semantics is.

6. **Generate version-specific documentation**: Each version gets its own OpenAPI spec and Swagger UI instance.

## Related Terms

- [Backward Compatibility](/glossary/backward-compatibility/) -- maintaining existing behavior across versions
- **Contract** -- formal API behavior agreements
- **Configuration** -- version-specific API configuration

## See Also

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html) -- API documentation standard
- [Prismatic API](/glossary/prismatic-api/) -- the platform's REST gateway
- [OpenApiSpex](https://hexdocs.pm/open_api_spex/) -- Elixir OpenAPI integration

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
