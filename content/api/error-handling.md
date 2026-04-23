+++
title = "Error Handling & Response Codes"
weight = 13
[extra]
description = "Standard error response format, HTTP status code semantics, error taxonomy, and troubleshooting guide"
category = "infrastructure"
method = "N/A"
path = "/api/v1/*"
status = "stable"
auth_required = false
glossary_terms = ["no-mercy", "trinity-gate", "quality-dna", "aiad"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 663
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Error", "Handling", "Response", "Codes", "Standard", "HTTP", "api", "infrastructure", "Prismatic Platform", "Request"]
tags = ["api", "infrastructure", "error-handling--response-codes", "prismatic"]
quality_score = 65
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Error Handling & Response Codes - Prismatic Platform"
+++

## Overview

The Prismatic API uses a consistent error response format across all endpoints. Every error response follows the same JSON structure, includes a machine-readable error code, a human-readable message, and optional detail fields that provide context for debugging. This consistency allows client libraries to implement a single error handling path regardless of which endpoint produced the error.

The error handling philosophy follows the [No Mercy](/glossary/no-mercy/) doctrine: errors are never swallowed, never vague, and never misleading. Every error response provides enough information for the caller to understand what went wrong and how to fix it. Internal server errors include a request correlation ID that can be used to locate the corresponding server-side log entry for detailed diagnosis.

Error responses are generated at multiple layers of the request pipeline: the authentication plug, the rate limiter, the dispatch controller, and the dispatched function itself. Each layer produces errors in the same format, so clients see a uniform interface regardless of where the error originated.

## Error Response Format

All error responses share this structure:

```json
{
  "ok": false,
  "error": {
    "code": "error_code_here",
    "message": "Human-readable description of what went wrong",
    "details": {
      "field": "additional_context",
      "expected": "what was expected",
      "received": "what was received"
    }
  },
  "meta": {
    "request_id": "req_abc123",
    "timestamp": "2026-02-12T10:30:00.000Z"
  }
}
```

### Error Response Fields

| Field | Type | Always Present | Description |
|-------|------|---------------|-------------|
| `ok` | boolean | Yes | Always `false` for error responses |
| `error.code` | string | Yes | Machine-readable error code (snake_case) |
| `error.message` | string | Yes | Human-readable error description |
| `error.details` | object | No | Additional context (varies by error type) |
| `meta.request_id` | string | Yes | Unique request correlation ID for log tracing |
| `meta.timestamp` | string | Yes | ISO 8601 timestamp of the error |

## HTTP Status Codes

### Success Codes

| Code | Name | Usage |
|------|------|-------|
| 200 | OK | Successful request with response body |
| 201 | Created | Resource successfully created (e.g., new API token) |
| 204 | No Content | Successful request with no response body (e.g., deletion) |

### Client Error Codes (4xx)

| Code | Name | Error Codes | Description |
|------|------|-------------|-------------|
| 400 | Bad Request | `invalid_request`, `invalid_domain`, `invalid_json`, `missing_parameter` | Request is malformed or contains invalid data |
| 401 | Unauthorized | `token_missing`, `token_invalid`, `token_expired`, `token_revoked` | Authentication failed |
| 403 | Forbidden | `insufficient_scope`, `insufficient_role`, `ip_blocked` | Authenticated but not authorized |
| 404 | Not Found | `endpoint_not_found`, `resource_not_found`, `agent_not_found` | Requested resource does not exist |
| 405 | Method Not Allowed | `method_not_allowed` | HTTP method not supported for this path |
| 408 | Request Timeout | `dispatch_timeout`, `scan_timeout` | Request processing exceeded timeout |
| 409 | Conflict | `resource_conflict`, `duplicate_name` | Request conflicts with current state |
| 413 | Payload Too Large | `request_too_large` | Request body exceeds size limit |
| 415 | Unsupported Media Type | `unsupported_content_type` | Content-Type is not application/json |
| 422 | Unprocessable Entity | `validation_error`, `type_coercion_failed`, `invalid_parameter` | Request is well-formed but semantically invalid |
| 429 | Too Many Requests | `rate_limited` | Rate limit exceeded |

### Server Error Codes (5xx)

| Code | Name | Error Codes | Description |
|------|------|-------------|-------------|
| 500 | Internal Server Error | `internal_error`, `dispatch_error` | Unexpected server-side failure |
| 502 | Bad Gateway | `upstream_error` | Upstream service failure |
| 503 | Service Unavailable | `service_unavailable`, `maintenance` | Platform is temporarily unavailable |
| 504 | Gateway Timeout | `upstream_timeout` | Upstream service timeout |

## Error Taxonomy

### Authentication Errors

```json
{
  "ok": false,
  "error": {
    "code": "token_expired",
    "message": "Authentication token has expired",
    "details": {
      "expired_at": "2026-02-12T09:00:00.000Z",
      "token_id": "tok_abc123"
    }
  },
  "meta": { "request_id": "req_001", "timestamp": "2026-02-12T10:30:00.000Z" }
}
```

### Validation Errors

```json
{
  "ok": false,
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": {
      "errors": [
        {
          "field": "domain",
          "code": "required",
          "message": "Domain is required"
        },
        {
          "field": "options.max_depth",
          "code": "out_of_range",
          "message": "max_depth must be between 1 and 10",
          "received": 15,
          "expected": { "min": 1, "max": 10 }
        }
      ]
    }
  },
  "meta": { "request_id": "req_002", "timestamp": "2026-02-12T10:30:00.000Z" }
}
```

### Dispatch Errors

```json
{
  "ok": false,
  "error": {
    "code": "endpoint_not_found",
    "message": "No endpoint found for {app: 'invalid', action: 'nonexistent'}",
    "details": {
      "app": "invalid",
      "action": "nonexistent",
      "suggestion": "Use GET /api/v1/endpoints to list available endpoints"
    }
  },
  "meta": { "request_id": "req_003", "timestamp": "2026-02-12T10:30:00.000Z" }
}
```

### Timeout Errors

```json
{
  "ok": false,
  "error": {
    "code": "dispatch_timeout",
    "message": "Request processing timed out after 30000ms",
    "details": {
      "dispatched_to": "PrismaticPerimeter.discover/1",
      "timeout_ms": 30000,
      "suggestion": "Try with passive_only: true for faster results, or increase timeout_seconds in options"
    }
  },
  "meta": { "request_id": "req_004", "timestamp": "2026-02-12T10:30:00.000Z" }
}
```

### Rate Limit Errors

```json
{
  "ok": false,
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded. Try again in 12 seconds.",
    "details": {
      "limit": 60,
      "window_seconds": 60,
      "retry_after_seconds": 12,
      "limit_type": "per_token"
    }
  },
  "meta": { "request_id": "req_005", "timestamp": "2026-02-12T10:30:00.000Z" }
}
```

### Internal Errors

```json
{
  "ok": false,
  "error": {
    "code": "internal_error",
    "message": "An unexpected error occurred. Reference ID: req_006 for support.",
    "details": {
      "reference_id": "req_006"
    }
  },
  "meta": { "request_id": "req_006", "timestamp": "2026-02-12T10:30:00.000Z" }
}
```

Internal errors intentionally omit stack traces and implementation details to prevent information leakage. The `reference_id` can be used by platform operators to locate the full error context in server logs.

## Code Examples

### curl -- Error Handling

```bash
# Capture and handle errors
response=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/perimeter/rating?domain=example.com)

body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)

if [ "$status" -ge 400 ]; then
  error_code=$(echo "$body" | jq -r '.error.code')
  error_msg=$(echo "$body" | jq -r '.error.message')
  echo "Error [$status] $error_code: $error_msg"
else
  echo "$body" | jq '.data'
fi
```

### Elixir -- Structured Error Handling

```elixir
defmodule PrismaticClient.ErrorHandler do
  def handle_response({:ok, %{status_code: status, body: body}}) when status >= 400 do
    case Jason.decode(body) do
      {:ok, %{"error" => %{"code" => code, "message" => message}}} ->
        {:error, %{code: code, message: message, status: status}}

      _ ->
        {:error, %{code: "unknown", message: "Unparseable error response", status: status}}
    end
  end

  def handle_response({:ok, %{status_code: status, body: body}}) when status < 400 do
    case Jason.decode(body) do
      {:ok, %{"ok" => true, "data" => data}} -> {:ok, data}
      {:ok, %{"ok" => false, "error" => error}} -> {:error, error}
      _ -> {:error, %{code: "parse_error", message: "Invalid response format"}}
    end
  end

  def handle_response({:error, %HTTPoison.Error{reason: reason}}) do
    {:error, %{code: "connection_error", message: "#{inspect(reason)}"}}
  end
end
```

### Python -- Comprehensive Error Handling

```python
import requests

class PrismaticAPIError(Exception):
    def __init__(self, status_code, code, message, details=None, request_id=None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or {}
        self.request_id = request_id
        super().__init__(f"[{status_code}] {code}: {message}")

def api_request(method, url, **kwargs):
    response = requests.request(method, url, **kwargs)

    if response.status_code >= 400:
        try:
            error_data = response.json()
            error = error_data.get("error", {})
            meta = error_data.get("meta", {})
            raise PrismaticAPIError(
                status_code=response.status_code,
                code=error.get("code", "unknown"),
                message=error.get("message", "Unknown error"),
                details=error.get("details"),
                request_id=meta.get("request_id")
            )
        except (ValueError, KeyError):
            raise PrismaticAPIError(
                status_code=response.status_code,
                code="unparseable",
                message=response.text[:200]
            )

    return response.json()

# Usage with error handling
try:
    result = api_request(
        "GET",
        "http://localhost:4004/api/v1/perimeter/rating",
        headers={"Authorization": f"Bearer {token}"},
        params={"domain": "example.com"}
    )
    print(f"Rating: {result['data']['rating']['grade']}")

except PrismaticAPIError as e:
    if e.code == "token_expired":
        print("Token expired, refreshing...")
    elif e.code == "rate_limited":
        retry_after = e.details.get("retry_after_seconds", 60)
        print(f"Rate limited, retry in {retry_after}s")
    elif e.code == "endpoint_not_found":
        print(f"Endpoint not found: {e.message}")
    else:
        print(f"API Error [{e.status_code}]: {e.message}")
        if e.request_id:
            print(f"Reference: {e.request_id}")
```

## Troubleshooting Guide

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| All requests return 401 | Token expired or invalid | Generate a new token via [Authentication](/api/authentication/) |
| Specific endpoint returns 403 | Token lacks required scope | Create a token with the appropriate scope |
| POST returns 415 | Missing Content-Type header | Add `Content-Type: application/json` header |
| POST returns 400 `invalid_json` | Malformed JSON body | Validate JSON syntax before sending |
| Request returns 408 | Operation timeout | Use `passive_only` option or increase timeout |
| Frequent 429 responses | Rate limit exceeded | Implement backoff (see [Rate Limiting](/api/rate-limiting/)) |
| 500 with `internal_error` | Server-side bug | Report the `request_id` to platform operators |

## Rate Limits

Error responses are not rate-limited independently. However, repeated 401 errors from the same IP trigger the authentication rate limit (see [Authentication](/api/authentication/)).

## Related Endpoints

- [Authentication](/api/authentication/) -- Authentication error details and token management
- [Rate Limiting](/api/rate-limiting/) -- Rate limit error details and backoff strategies
- [Generic Dispatch](/api/dispatch/) -- Dispatch timeout and resolution errors
- [Health Check](/api/health/) -- Verify the API is running when receiving connection errors

The error handling system is validated by the [Trinity Gate](/glossary/trinity-gate/) to ensure consistency: every error code maps to exactly one HTTP status, every error message is actionable, and no error path leaks internal implementation details. The [Quality DNA](/glossary/quality-dna/) system tracks error rates and patterns to identify systemic issues before they impact consumers.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)