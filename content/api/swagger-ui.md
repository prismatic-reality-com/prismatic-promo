+++
title = "Interactive API Explorer"
weight = 10
[extra]
description = "Swagger UI interface for browsing, testing, and experimenting with all Prismatic API endpoints"
category = "infrastructure"
method = "GET"
path = "/api/swaggerui"
status = "stable"
auth_required = false
glossary_terms = ["aiad", "quality-dna", "easm"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 812
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Interactive", "API", "Explorer", "Swagger", "Prismatic", "infrastructure", "Prismatic Platform", "OpenAPI"]
tags = ["api", "infrastructure", "interactive-api-explorer", "prismatic"]
quality_score = 80
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Interactive API Explorer - Prismatic Platform"
+++

## Overview

The Swagger UI endpoint serves an interactive web-based API explorer built on the industry-standard Swagger UI framework. It consumes the auto-generated [OpenAPI Specification](@/api/openapi-spec.md) and renders it as a browsable, testable interface where developers can explore endpoints, read documentation, construct requests, and execute them directly from the browser.

This is the primary tool for API exploration during development and integration. Every endpoint discovered by the platform scanner appears in the Swagger UI automatically, complete with parameter descriptions, request body schemas, response examples, and authentication requirements. Developers can authenticate once and then test any endpoint without switching between documentation and a separate HTTP client.

The Swagger UI is served as a single-page application bundled with the Prismatic API application. It loads the [OpenAPI specification](@/api/openapi-spec.md) dynamically, ensuring that the explorer always reflects the current state of the API surface.

## Endpoint

```
GET /api/swaggerui
```

Serves the Swagger UI web application. Open this URL in a browser to access the interactive explorer.

**Port**: 4004
**Content-Type**: `text/html`

## Authentication

The Swagger UI page itself is publicly accessible. However, executing API calls through the UI requires authentication. The UI provides an "Authorize" button where you can enter your Bearer token, which is then included in all subsequent requests.

### Authenticating in Swagger UI

1. Open `http://localhost:4004/api/swaggerui` in your browser
2. Click the "Authorize" button in the top right
3. Enter your Bearer token in the `bearerAuth` field
4. Click "Authorize" and then "Close"
5. All subsequent "Try it out" requests will include the token

## Request

### Browser Access

```
http://localhost:4004/api/swaggerui
```

Open this URL directly in any modern web browser. The UI is a self-contained single-page application that requires no additional setup.

### Programmatic Access

While Swagger UI is designed for browser interaction, you can also fetch the HTML page programmatically:

```
GET /api/swaggerui HTTP/1.1
Host: localhost:4004
Accept: text/html
```

For programmatic API interaction, use the [OpenAPI Specification](@/api/openapi-spec.md) endpoint directly rather than the Swagger UI.

## Response

### Success Response (200 OK)

Returns an HTML page containing the Swagger UI application. The page loads the OpenAPI specification from `/api/openapi` and renders the interactive explorer.

The UI organizes endpoints by tags (corresponding to application domains):

| Tag | Description | Example Endpoints |
|-----|-------------|-------------------|
| **core** | Core platform operations | `/health`, `/endpoints` |
| **perimeter** | External attack surface management | `/perimeter/discover`, `/perimeter/rating` |
| **agents** | AIAD agent management | `/agents/list`, `/agents/status` |

### UI Features

| Feature | Description |
|---------|-------------|
| **Endpoint Browser** | Collapsible list of all endpoints organized by tag |
| **Try It Out** | Execute real API calls from the browser |
| **Request Builder** | Visual form for constructing request parameters and bodies |
| **Response Viewer** | Formatted display of response headers, body, and status |
| **Schema Explorer** | Browse and expand JSON Schema definitions |
| **Authentication** | Persistent token storage for the session |
| **Deep Linking** | URL fragments for linking to specific endpoints |
| **Search** | Filter endpoints by keyword |

## Code Examples

### Accessing from Development

```bash
# Open Swagger UI in default browser (macOS)
open http://localhost:4004/api/swaggerui

# Open Swagger UI in default browser (Linux)
xdg-open http://localhost:4004/api/swaggerui

# Verify the page loads
curl -s -o /dev/null -w "%{http_code}" http://localhost:4004/api/swaggerui
# Expected: 200
```

### curl -- Testing Endpoints Found in Swagger UI

After exploring endpoints in the Swagger UI, translate them to curl commands:

```bash
# From Swagger UI: GET /api/v1/health (no auth required)
curl -s http://localhost:4004/api/v1/health | jq .

# From Swagger UI: POST /api/v1/perimeter/discover (auth required)
curl -s -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}' \
  http://localhost:4004/api/v1/perimeter/discover | jq .

# From Swagger UI: GET /api/v1/agents/list (auth required)
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/agents/list?domain=security" | jq .
```

### Elixir -- Configuring Swagger UI

```elixir
# In the API router (apps/prismatic_api/lib/prismatic_api_web/router.ex)
scope "/api" do
  pipe_through [:api]

  # OpenApiSpex routes
  get "/openapi", OpenApiSpex.Plug.RenderSpec, []

  # Swagger UI
  get "/swaggerui", OpenApiSpex.Plug.SwaggerUI,
    path: "/api/openapi",
    title: "Prismatic Platform API",
    default_model_expand_depth: 3
end
```

### Python -- Using Swagger UI as Documentation Reference

```python
import requests
import webbrowser

# Open Swagger UI for exploration
swagger_url = "http://localhost:4004/api/swaggerui"
webbrowser.open(swagger_url)

# Meanwhile, use the OpenAPI spec programmatically
spec = requests.get("http://localhost:4004/api/openapi").json()

# Build a simple endpoint reference from the spec
for path, methods in spec["paths"].items():
    for method, details in methods.items():
        if method in ("get", "post", "put", "delete"):
            auth = "AUTH" if details.get("security") else "PUBLIC"
            print(f"[{auth}] {method.upper():6s} {path}")
            print(f"         {details.get('summary', 'No description')}")
            print()
```

## Error Responses

| Status Code | Condition | Description |
|-------------|-----------|-------------|
| 200 | Always | The UI page is always available when the API is running |
| 429 | Rate limited | Excessive page loads |

The Swagger UI endpoint itself does not produce application errors. If the API process is running, the page will load. If the OpenAPI specification fails to load within the UI, the page will display an error banner indicating the spec URL is unreachable.

## Rate Limits

| Limit Type | Value | Window |
|------------|-------|--------|
| Per IP | 30 requests | 1 minute |
| Burst | 5 requests | 1 second |

Rate limits apply to page loads only. API calls executed through the Swagger UI are subject to their own per-endpoint rate limits as documented in [Rate Limiting](@/api/rate-limiting.md).

## Related Endpoints

- [OpenAPI Specification](@/api/openapi-spec.md) -- The machine-readable spec that powers Swagger UI
- [Endpoint Discovery](@/api/endpoints.md) -- Programmatic alternative to Swagger UI browsing
- [Authentication](@/api/authentication.md) -- How to obtain tokens for Swagger UI authentication
- [Health Check](@/api/health.md) -- Verify the API is running before opening Swagger UI

## Customization

The Swagger UI instance is configured through [OpenApiSpex](@/glossary/openapi.md), the Elixir library that handles specification generation and UI serving. Configuration options include:

| Option | Value | Description |
|--------|-------|-------------|
| `path` | `/api/openapi` | Path to the OpenAPI specification |
| `title` | `Prismatic Platform API` | Page title |
| `default_model_expand_depth` | 3 | How deep to auto-expand schema models |
| `display_operation_id` | true | Show operation IDs alongside summaries |
| `filter` | true | Enable endpoint search/filter |

The UI inherits the platform's visual identity while maintaining full Swagger UI functionality. All auto-discovered endpoints from every `Prismatic*` facade module are visible, organized by the tags assigned during the scanning phase.

## Development Workflow

The recommended workflow for API development with Swagger UI:

1. Write a new public function on a `Prismatic*` facade module with `@spec` and `@doc`
2. Restart the API application (`mix phx.server` in `apps/prismatic_api`)
3. Open Swagger UI and verify the new endpoint appears
4. Use "Try it out" to test the endpoint interactively
5. Verify response schema matches the `@spec` return type
6. Share the Swagger UI link with consumers for integration testing

This workflow ensures that documentation, type safety, and testability are built into the development process from the start, embodying the [Quality DNA](@/glossary/quality-dna.md) principle of quality at creation rather than quality through inspection.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)