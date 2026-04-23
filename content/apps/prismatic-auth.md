+++
title = "Prismatic Auth"
weight = 16
[extra]
icon = "lock"
color = "red"
description = "Authentication, authorization, and role-based access control (RBAC)"
category = "Security"
files = "340"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1336
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Auth", "Authentication", "RBAC", "apps", "Security", "Prismatic Platform", "PrismaticAuth", "Plug"]
tags = ["apps", "security", "prismatic-auth", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Auth - Prismatic Platform"
+++

## Abstract

Prismatic Auth provides the platform's authentication, authorization, and access control infrastructure, implementing role-based access control ([RBAC](/glossary/rbac/)) with four predefined roles, API key lifecycle management with per-key [rate limiting](/glossary/rate-limiting/), session handling with [JWT](/glossary/jwt/) token refresh, and fine-grained permission enforcement through a [Phoenix](/glossary/phoenix/) [Plug](/glossary/plug/) pipeline. Every HTTP request to the platform -- whether to the [Prismatic Web](/apps/prismatic-web/) dashboards or the [Prismatic API](/apps/prismatic-api/) endpoints -- passes through the Auth pipeline, which validates credentials, resolves permissions, enforces rate limits, and logs all authentication events to an immutable [audit trail](/glossary/audit-trail/). The system supports password authentication with bcrypt hashing (cost factor 12), TOTP-based multi-factor authentication, and API key authentication with configurable expiration and permission scoping. Security measures include brute force protection with account lockout after five failed attempts, HMAC-SHA256 token signing with rotating keys, and configurable session idle timeouts.

## 1. Introduction

### 1.1 Problem Statement

A platform exposing sensitive intelligence data through web dashboards and [REST API](/glossary/rest-api/)s requires authentication and authorization that is both rigorous and ergonomic. Without centralized auth infrastructure, each application would implement its own credential validation, permission checking, and session management, leading to inconsistent security postures and potential bypass vulnerabilities. The intelligence domain demands that every data access is authenticated, authorized, and audited.

Prismatic Auth centralizes all authentication and authorization into a single application that other platform components consume through a consistent Plug pipeline. Security is not bolted on -- it is foundational.

### 1.2 Design Goals

1. **Unified auth pipeline** -- a single Plug-based pipeline through which all requests pass, ensuring consistent authentication and authorization.
2. **Role-based access control** -- four predefined roles (admin, analyst, viewer, api_consumer) with extensible permission sets.
3. **API key management** -- full lifecycle management for programmatic access with per-key rate limiting and permission scoping.
4. **Multi-factor authentication** -- TOTP-based second factor for sensitive operations and dashboard access.
5. **Audit completeness** -- every authentication and authorization event logged for regulatory compliance.
6. **Defense in depth** -- brute force protection, token rotation, session timeouts, and rate limiting as layered defenses.

### 1.3 Scope

Prismatic Auth covers authentication (identity verification), authorization (permission enforcement), and credential management (API keys, sessions, MFA). It does not implement user registration workflows or social login (OAuth providers), which would be added as needed.

## 2. Architecture

### 2.1 System Design

```
HTTP Request
       |
  PrismaticAuth Plug Pipeline
       |
  +----+----+----+----+
  |    |    |    |    |
  Session  API Key  Rate    Permission
  Validate Validate Limit   Check
       |
  Authenticated Request → Controller/LiveView
       |
  Audit Logger → Immutable Audit Trail
```

### 2.2 Core Components

| Module | Responsibility |
|--------|----------------|
| `PrismaticAuth` | Public facade: `authenticate/2`, `authorize/2`, `create_api_key/2`, `validate_session/1` |
| `PrismaticAuth.Plugs.RequireAuth` | Plug: session token validation, user assignment to conn |
| `PrismaticAuth.Plugs.RequirePermission` | Plug: RBAC permission enforcement per action |
| `PrismaticAuth.Plugs.APIAuth` | Plug: API key validation and rate limit enforcement |
| `PrismaticAuth.Plugs.RateLimiter` | Plug: per-user and per-key request rate limiting |
| `PrismaticAuth.RBAC.Roles` | Role definitions with associated permission sets |
| `PrismaticAuth.RBAC.Permissions` | Permission catalog and hierarchical permission resolution |
| `PrismaticAuth.RBAC.PolicyEngine` | Attribute-based access control for complex authorization rules |
| `PrismaticAuth.Sessions.TokenManager` | JWT token creation, validation, and refresh |
| `PrismaticAuth.Sessions.SessionStore` | Session persistence in [ETS](/glossary/ets/) with [PostgreSQL](/glossary/postgresql/) backup |
| `PrismaticAuth.APIKeys.KeyManager` | API key CRUD operations with [encryption at rest](/glossary/encryption-at-rest/) |
| `PrismaticAuth.APIKeys.KeyValidator` | Key validation, permission resolution, and rate limiting |
| `PrismaticAuth.Audit.EventLogger` | Structured audit event logging for compliance |

### 2.3 Process Topology

```
PrismaticAuth.Application (Supervisor, :one_for_one)
+-- PrismaticAuth.Sessions.SessionStore (GenServer)
|     ETS-backed session storage with periodic PostgreSQL sync
+-- PrismaticAuth.RateLimiter.Counter (GenServer)
|     Token bucket rate limiters per user and per API key
+-- PrismaticAuth.Audit.EventLogger (GenServer)
|     Async audit event buffering and batch persistence
+-- PrismaticAuth.KeyRotation (GenServer)
      Periodic token signing key rotation
```

### 2.4 Data Flow

An HTTP request enters the Plug pipeline. For browser requests, `RequireAuth` extracts the session token from the cookie, validates it against the SessionStore, and assigns the authenticated user to the connection. For API requests, `APIAuth` extracts the API key from the Authorization header, validates it against the KeyManager, and resolves associated permissions. `RequirePermission` then checks whether the authenticated identity has the required permission for the requested action. `RateLimiter` enforces request quotas. The audit logger records the authentication event asynchronously.

## 3. Implementation

### 3.1 Key Algorithms

**Token Validation**. JWT tokens are signed with HMAC-SHA256 using a rotating secret key. Validation verifies the signature, checks the expiration timestamp, and confirms the token has not been revoked. Token refresh is permitted within a configurable grace window before expiration, returning a new token with a refreshed expiration.

**Rate Limiting**. Per-user and per-API-key rate limiting uses a token bucket algorithm implemented in ETS. Each identity has a bucket with configurable capacity and refill rate. Requests that would empty the bucket receive a 429 Too Many Requests response with a Retry-After header.

### 3.2 Data Structures

```elixir
defmodule PrismaticAuth.RBAC.Roles do
  @type role_definition :: %{
    name: atom(),
    permissions: [atom()] | [:all],
    description: String.t()
  }

  def roles do
    %{
      admin: %{permissions: [:all], description: "Full platform access"},
      analyst: %{
        permissions: [
          :osint_query, :osint_read, :perimeter_read, :perimeter_scan,
          :report_create, :report_read, :dashboard_access
        ],
        description: "Intelligence analyst with query and reporting access"
      },
      viewer: %{
        permissions: [:dashboard_access, :report_read, :osint_read],
        description: "Read-only access to dashboards and reports"
      },
      api_consumer: %{
        permissions: [:api_access, :osint_query],
        description: "Programmatic API access only"
      }
    }
  end
end
```

### 3.3 API Surface

```elixir
# Authentication
@spec authenticate(String.t(), String.t()) :: {:ok, Session.t()} | {:error, term()}
PrismaticAuth.authenticate(email, password)

# Authorization
@spec authorize(User.t(), atom()) :: :ok | {:error, :forbidden}
PrismaticAuth.authorize(user, :perimeter_scan)

# API key management
@spec create_api_key(User.t(), keyword()) :: {:ok, ApiKey.t()} | {:error, term()}
PrismaticAuth.create_api_key(user,
  name: "CI Pipeline Key",
  permissions: [:api_access, :osint_query],
  expires_at: ~U[2026-12-31 23:59:59Z],
  rate_limit: 1000)

# Session management
@spec validate_session(Plug.Conn.t()) :: {:ok, User.t()} | {:error, term()}
PrismaticAuth.validate_session(conn)

@spec refresh_session(String.t()) :: {:ok, Session.t()} | {:error, term()}
PrismaticAuth.refresh_session(refresh_token)
```

### 3.4 Configuration

```elixir
config :prismatic_auth,
  # Password hashing
  password_hash_cost: 12,

  # Token signing
  token_algorithm: :hs256,
  token_expiry: :timer.hours(8),
  refresh_window: :timer.minutes(30),

  # Session
  session_idle_timeout: :timer.minutes(30),
  max_sessions_per_user: 5,

  # Rate limiting
  default_rate_limit: {1000, :hour},
  api_key_rate_limit: {1000, :hour},

  # Brute force protection
  max_failed_attempts: 5,
  lockout_duration: :timer.minutes(15),

  # MFA
  mfa_enabled: true,
  mfa_issuer: "Prismatic Platform"
```

## 4. Integration

### 4.1 Dependencies

| Application | Relationship |
|-------------|--------------|
| [Prismatic Storage](/apps/prismatic-storage/) | Session, API key, and user persistence |
| [Prismatic Telemetry](/apps/prismatic-telemetry/) | Authentication event [metrics](/glossary/metrics/) |
| [Prismatic Audit](/apps/prismatic-audit/) | Audit log persistence for compliance |

### 4.2 Dependents

| Application | Relationship |
|-------------|--------------|
| [Prismatic Web](/apps/prismatic-web/) | Dashboard authentication |
| [Prismatic API](/apps/prismatic-api/) | API endpoint authorization |
| [Prismatic HAWKEYE](/apps/prismatic-hawkeye/) | Dashboard access control |
| [Prismatic Compliance](/apps/prismatic-compliance/) | Audit log compliance data |

### 4.3 Inter-Process Communication

The SessionStore [GenServer](/glossary/genserver/) owns the ETS table for session data; Plugs read from this table directly (lock-free concurrent reads). The Audit EventLogger buffers events asynchronously, preventing audit logging from blocking the request path. Rate limiter state is maintained in ETS with atomic update operations.

### 4.4 External Integrations

Password hashing uses the bcrypt_elixir library. JWT handling uses the joken library. No external authentication providers are currently integrated.

## 5. Performance

### 5.1 Benchmarks

| Operation | Latency | Notes |
|-----------|---------|-------|
| Session validation (ETS) | < 1 microsecond | O(1) hash lookup |
| API key validation | < 5ms | Key lookup + permission resolution |
| Password verification | 100-200ms | bcrypt intentional slowness |
| Rate limit check | < 1 microsecond | ETS atomic operation |
| Audit event logging | < 1ms | Async buffered write |

### 5.2 Scalability

Session and rate limiter state is maintained in ETS, supporting millions of concurrent sessions with sub-microsecond access. API key validation involves a database lookup that can be cached. The auth pipeline adds approximately 1-5ms to each request.

### 5.3 Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 128 MB | 512 MB (with session cache) |
| CPU | 1 core | 2 cores |

## 6. Testing Strategy

### 6.1 Unit Tests

Role and permission tests verify correct permission sets for each role. Token tests verify creation, validation, expiration, and refresh behavior. Rate limiter tests verify bucket behavior under concurrent load.

### 6.2 Integration Tests

Full Plug pipeline tests exercise authentication from HTTP request through session validation, permission checking, rate limiting, and audit logging. Tests cover both success and failure paths for all credential types.

### 6.3 Property-Based Testing

StreamData generators produce random permission sets and role configurations to verify that permission checking is monotonic (higher roles include all lower permissions) and that rate limiting is fair across concurrent users.

## 7. Security Considerations

### 7.1 Threat Model

Primary threats include credential theft, session hijacking, privilege escalation, and brute force attacks. Mitigations include bcrypt hashing, HMAC-signed tokens with expiration, RBAC enforcement on every request, account lockout, MFA support, and comprehensive audit logging.

### 7.2 Access Control

Security measures implemented: bcrypt with cost factor 12, HMAC-SHA256 with rotating keys, per-user and per-key rate limiting, account lockout after 5 failed attempts, configurable session timeout (default 30 minutes), TOTP-based MFA, and immutable audit trail for all authentication events.

## 8. Operational Considerations

### 8.1 Deployment

Deploys as part of the umbrella [release](/glossary/release/). Requires PostgreSQL for persistent session and API key storage. Session state is ETS-backed with periodic PostgreSQL synchronization.

### 8.2 Monitoring

Telemetry events: `[:prismatic, :auth, :login]`, `[:prismatic, :auth, :logout]`, `[:prismatic, :auth, :api_key_used]`, `[:prismatic, :auth, :rate_limited]`, `[:prismatic, :auth, :lockout]`. Metrics include login success/failure rates, active sessions, API key usage, and rate limit utilization.

### 8.3 Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Auth failures | Expired session or API key | Check token expiration; rotate keys |
| Rate limiting unexpected | Low rate limit configuration | Adjust per-key or per-user limits |
| Account locked | Brute force detection | Wait for lockout expiry or admin unlock |
| MFA failures | Clock skew | Verify TOTP time synchronization |

## 9. Future Work

Planned enhancements include OAuth 2.0 provider integration for external identity providers, WebAuthn/FIDO2 support for passwordless authentication, attribute-based access control (ABAC) extending beyond role-based permissions, and federated identity across multiple Prismatic Platform deployments.

## References

- [Prismatic Web](/apps/prismatic-web/) -- Dashboard authentication consumer
- [Prismatic API](/apps/prismatic-api/) -- API authorization consumer
- [Prismatic Audit](/apps/prismatic-audit/) -- Audit trail persistence
- [Prismatic Compliance](/apps/prismatic-compliance/) -- Compliance reporting from auth data
- [bcrypt_elixir](https://hexdocs.pm/bcrypt_elixir/) -- Password hashing library

## Related Agents

- [GitLab Security Specialist Agent](/agents/gitlab-security-specialist-agent/) -- Audits authentication implementation for security vulnerabilities including credential storage and token management
- [API Gateway Specialist Agent](/agents/api-gateway-specialist-agent/) -- Reviews API key lifecycle management, rate limiting configuration, and the Plug authentication pipeline
- [Deployment Commander Agent](/agents/deployment-commander-agent/) -- Manages secure deployment of auth infrastructure including token signing key rotation and session store migration

## Related Capabilities

- [Color Teams](/capabilities/color-teams/) -- Red Team simulates credential attacks and privilege escalation while Blue Team validates defensive posture of the auth pipeline
- [Quality Gates](/capabilities/quality-gates/) -- Enforces comprehensive test coverage for all authentication paths, permission checks, and brute force protection logic
- [Session Discipline](/capabilities/session-discipline/) -- Governs session management standards including idle timeout enforcement and maximum concurrent session limits

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)