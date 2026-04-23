+++
title = "Authentication & Authorization"
weight = 11
[extra]
description = "API key management, Bearer token lifecycle, role-based access control, and scope enforcement"
category = "infrastructure"
method = "N/A"
path = "/api/v1/auth"
status = "stable"
auth_required = false
glossary_terms = ["aiad", "no-mercy", "trinity-gate", "color-teams"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 745
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Authentication", "Authorization", "Bearer", "api", "infrastructure", "Prismatic Platform", "Token", "Read", "Description", "Tokens"]
tags = ["api", "infrastructure", "authentication--authorization", "prismatic"]
quality_score = 70
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Authentication & Authorization - Prismatic Platform"
+++

## Overview

The Prismatic API uses a layered authentication and authorization system built on Bearer tokens with role-based access control (RBAC) and fine-grained scope enforcement. Every API request (except the [Health Check](@/api/health.md) and [OpenAPI Specification](@/api/openapi-spec.md) endpoints) must include a valid Bearer token that identifies the caller and determines what operations they are authorized to perform.

The authentication system is implemented as a Phoenix plug (`PrismaticWeb.Plugs.APIAuth`) that executes before the [Generic Dispatch](@/api/dispatch.md) controller. It validates the token, resolves the associated identity, checks scope requirements for the requested endpoint, and attaches the authorization context to the connection. If any check fails, the request is rejected before reaching the dispatch layer.

Token management follows the principle of least privilege: tokens are issued with specific scopes that limit access to particular API domains. A token with `perimeter:read` scope can query security ratings but cannot modify agent configurations. This granularity allows organizations to issue purpose-specific tokens for different integration scenarios.

The [No Mercy](@/glossary/no-mercy.md) doctrine applies to authentication: there are no grace periods, no soft failures, and no anonymous access to protected endpoints. Invalid tokens are rejected immediately with a clear error response.

## Authentication Methods

### Bearer Token Authentication

The primary authentication method. Include the token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens are issued through the token management endpoints or through the platform's identity system.

### Token Structure

Tokens are JSON Web Tokens (JWT) containing:

```json
{
  "sub": "user_abc123",
  "iss": "prismatic-platform",
  "iat": 1739347200,
  "exp": 1739433600,
  "scopes": ["perimeter:read", "agents:read"],
  "roles": ["analyst"],
  "metadata": {
    "name": "API Integration Token",
    "created_by": "admin@example.com"
  }
}
```

| Claim | Type | Description |
|-------|------|-------------|
| `sub` | string | Subject identifier (user or service account ID) |
| `iss` | string | Token issuer (always `prismatic-platform`) |
| `iat` | integer | Issued-at timestamp (Unix epoch) |
| `exp` | integer | Expiration timestamp (Unix epoch) |
| `scopes` | array | Authorized API scopes |
| `roles` | array | RBAC role assignments |
| `metadata` | object | Optional token metadata |

## Token Lifecycle

### Creating a Token

```
POST /api/v1/auth/tokens
```

```json
{
  "name": "EASM Integration",
  "scopes": ["perimeter:read", "perimeter:write"],
  "expires_in": 86400,
  "metadata": {
    "purpose": "CI/CD pipeline integration",
    "environment": "staging"
  }
}
```

**Response (201 Created):**

```json
{
  "ok": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "token_id": "tok_abc123",
    "name": "EASM Integration",
    "scopes": ["perimeter:read", "perimeter:write"],
    "created_at": "2026-02-12T10:00:00.000Z",
    "expires_at": "2026-02-13T10:00:00.000Z"
  }
}
```

**Important**: The full token value is only returned once at creation time. Store it securely. Subsequent queries return only the token ID and metadata, never the token itself.

### Listing Tokens

```
GET /api/v1/auth/tokens
```

Returns all tokens for the authenticated user (without token values):

```json
{
  "ok": true,
  "data": {
    "tokens": [
      {
        "token_id": "tok_abc123",
        "name": "EASM Integration",
        "scopes": ["perimeter:read", "perimeter:write"],
        "created_at": "2026-02-12T10:00:00.000Z",
        "expires_at": "2026-02-13T10:00:00.000Z",
        "last_used_at": "2026-02-12T10:30:00.000Z",
        "usage_count": 47
      }
    ]
  }
}
```

### Revoking a Token

```
DELETE /api/v1/auth/tokens/:token_id
```

Immediately invalidates the token. All subsequent requests using this token will receive a 401 response.

**Response (200 OK):**

```json
{
  "ok": true,
  "data": {
    "token_id": "tok_abc123",
    "revoked_at": "2026-02-12T11:00:00.000Z"
  }
}
```

### Refreshing a Token

```
POST /api/v1/auth/tokens/:token_id/refresh
```

Issues a new token with the same scopes and a fresh expiration. The old token is revoked.

```json
{
  "expires_in": 86400
}
```

## Scopes

Scopes follow a `domain:permission` pattern. Each scope grants access to a specific set of API operations.

### Available Scopes

| Scope | Description | Endpoints |
|-------|-------------|-----------|
| `perimeter:read` | Read attack surface data | discover, rating, compliance |
| `perimeter:write` | Modify perimeter configurations | asset management, scan scheduling |
| `agents:read` | Read agent registry and status | list, status |
| `agents:write` | Manage agent configurations | activate, deactivate, configure |
| `quality:read` | Read quality metrics | quality DNA, floor guardian |
| `quality:write` | Modify quality thresholds | gate configuration |
| `webhooks:read` | Read webhook configurations | list, status |
| `webhooks:write` | Manage webhooks | create, update, delete |
| `admin:read` | Read administrative data | audit logs, system config |
| `admin:write` | Modify system configuration | settings, user management |

### Scope Inheritance

Some scopes include others implicitly:

- `admin:write` includes `admin:read`
- `perimeter:write` includes `perimeter:read`
- `agents:write` includes `agents:read`

## Roles

Roles are predefined bundles of scopes that simplify permission management.

| Role | Included Scopes | Description |
|------|-----------------|-------------|
| `viewer` | `*:read` | Read-only access to all domains |
| `analyst` | `perimeter:read`, `agents:read`, `quality:read` | Security analysis access |
| `operator` | `perimeter:*`, `agents:*`, `quality:read` | Operational management |
| `admin` | `*:*` | Full administrative access |

## Code Examples

### curl

```bash
# Create a token
curl -s -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "CI Pipeline", "scopes": ["perimeter:read"], "expires_in": 3600}' \
  http://localhost:4004/api/v1/auth/tokens | jq '.data.token'

# Use the token
export API_TOKEN="eyJhbGciOiJIUzI1NiIs..."
curl -s -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/perimeter/rating?domain=example.com | jq .

# List tokens
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:4004/api/v1/auth/tokens | jq '.data.tokens[] | {id: .token_id, name, scopes}'

# Revoke a token
curl -s -X DELETE \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:4004/api/v1/auth/tokens/tok_abc123

# Refresh a token
curl -s -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"expires_in": 86400}' \
  http://localhost:4004/api/v1/auth/tokens/tok_abc123/refresh | jq '.data.token'
```

### Elixir

```elixir
# Create a token programmatically
{:ok, token_data} = PrismaticApi.Auth.create_token(%{
  name: "Internal Service",
  scopes: ["perimeter:read", "agents:read"],
  expires_in: 86400
})

# Validate a token
case PrismaticApi.Auth.validate_token(token_string) do
  {:ok, claims} -> IO.puts("Valid for: #{inspect(claims.scopes)}")
  {:error, :expired} -> IO.puts("Token expired")
  {:error, :invalid} -> IO.puts("Invalid token")
end

# Check authorization for a specific scope
case PrismaticApi.Auth.authorize(conn, "perimeter:read") do
  :ok -> proceed_with_request(conn)
  {:error, :unauthorized} -> send_401(conn)
  {:error, :forbidden} -> send_403(conn)
end
```

### Python

```python
import requests
import os

# Create a token
admin_token = os.environ["ADMIN_TOKEN"]
response = requests.post(
    "http://localhost:4004/api/v1/auth/tokens",
    headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
    json={"name": "Python Client", "scopes": ["perimeter:read"], "expires_in": 3600}
)

api_token = response.json()["data"]["token"]

# Use the token for API calls
session = requests.Session()
session.headers.update({"Authorization": f"Bearer {api_token}"})

rating = session.get(
    "http://localhost:4004/api/v1/perimeter/rating",
    params={"domain": "example.com"}
).json()

print(f"Rating: {rating['data']['rating']['grade']}")
```

## Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `token_missing` | No Authorization header provided |
| 401 | `token_invalid` | Token signature verification failed |
| 401 | `token_expired` | Token has passed its expiration time |
| 401 | `token_revoked` | Token has been explicitly revoked |
| 403 | `insufficient_scope` | Token does not include the required scope |
| 403 | `insufficient_role` | Token's role does not permit the operation |
| 422 | `invalid_scope` | Requested scope does not exist |

See [Error Handling](@/api/error-handling.md) for the standard error response format.

## Rate Limits

Authentication endpoints have their own rate limits to prevent brute-force attacks:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /auth/tokens` | 10 requests | 1 minute |
| `DELETE /auth/tokens/:id` | 30 requests | 1 minute |
| `POST /auth/tokens/:id/refresh` | 10 requests | 1 minute |
| Failed authentication attempts | 20 attempts | 5 minutes |

After 20 failed authentication attempts from a single IP within 5 minutes, the IP is temporarily blocked for 15 minutes.

## Security Best Practices

| Practice | Description |
|----------|-------------|
| **Short-lived tokens** | Use tokens with the shortest practical expiration |
| **Minimum scopes** | Request only the scopes needed for the integration |
| **Token rotation** | Refresh tokens regularly, do not reuse expired tokens |
| **Secure storage** | Store tokens in environment variables or secret managers, never in code |
| **Revoke on compromise** | Immediately revoke tokens if they may have been exposed |
| **Audit regularly** | Review token usage via the listing endpoint |

## Related Endpoints

- [Health Check](@/api/health.md) -- Public endpoint (no auth required)
- [OpenAPI Specification](@/api/openapi-spec.md) -- Public endpoint (no auth required)
- [Rate Limiting](@/api/rate-limiting.md) -- Rate limit enforcement details
- [Error Handling](@/api/error-handling.md) -- Authentication error response format

The authentication system enforces the [Color Teams](@/glossary/color-teams.md) isolation model. Tokens associated with Red Team operations cannot access Blue Team data, and vice versa. The [Trinity Gate](@/glossary/trinity-gate.md) verification validates that scope definitions are internally consistent and that no privilege escalation paths exist in the role hierarchy.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)