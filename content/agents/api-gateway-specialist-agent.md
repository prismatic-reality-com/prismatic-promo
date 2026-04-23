+++
title = "API Gateway Specialist Agent"
weight = 35
[extra]
domain = "primary"
level = "L3"
description = "Gateway and facade pattern management for API traffic routing, request transformation, circuit breaking, and cross-cutting concern enforcement at the platform boundary"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "no-mercy", "liveview", "circuit-breaker", "rate-limiting"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 95
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["API", "Gateway", "Specialist", "Agent", "agents", "Prismatic Platform", "CORS"]
tags = ["agents", "agent", "api-gateway-specialist-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "API Gateway Specialist Agent - Prismatic Platform"
+++

## Overview

The [API Gateway](/glossary/api-gateway/) Specialist Agent operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Primary domain of the Prismatic Platform. This agent designs and maintains gateway and facade patterns that manage API traffic routing, request transformation, and cross-cutting concerns such as authentication, [rate limiting](/glossary/rate-limiting/), and request logging. The gateway layer serves as the single entry point for all external API consumers, providing a unified interface to the platform's distributed service architecture.

In the Prismatic ecosystem, the API gateway is not a simple reverse proxy. It implements intelligent request dispatch through the platform's auto-introspecting architecture, where [Prismatic API](/glossary/prismatic-api/) scans all facade modules at boot time and routes incoming requests to the appropriate module functions. The API Gateway Specialist ensures this dispatch mechanism handles edge cases including partial module availability, graceful degradation during deployments, and proper error propagation from backend services to API consumers.

The gateway also serves as the platform's primary security boundary for API traffic. Authentication verification, authorization checks, rate limit enforcement, and request validation all execute at the gateway level before requests reach backend modules. This centralized security enforcement ensures consistent policy application across all API endpoints without requiring each backend module to implement its own security checks.

## Architecture

The API Gateway Specialist manages a layered gateway architecture that processes requests through a pipeline of middleware stages before dispatch to backend modules.

**Request Pipeline.** Incoming requests pass through a configurable middleware pipeline implemented as [Plug](/glossary/plug/) chains in the [Phoenix](/glossary/phoenix/) router. The pipeline stages execute in order: CORS policy application, authentication verification, rate limit checking, request validation, request transformation, dispatch to backend module, response transformation, and response logging. Each stage can short-circuit the pipeline, returning an error response without invoking subsequent stages.

**Facade Module Registry.** The gateway maintains an ETS-backed registry of available facade modules discovered through the auto-introspection scanner. Each registry entry maps a `{app, action}` tuple to the corresponding module and function. The registry is refreshed at boot time and can be hot-reloaded when new modules are deployed.

**Circuit Breaker Layer.** Each backend module endpoint is wrapped in a [circuit breaker](/glossary/circuit-breaker/) that monitors response times and error rates. When a backend module's error rate exceeds the threshold, the circuit breaker opens, routing requests to a fallback handler that returns a cached response or a graceful degradation message. This prevents a failing backend from consuming gateway resources and degrading the experience for consumers of healthy endpoints.

```elixir
defmodule PrismaticAPI.Gateway do
  use Phoenix.Router

  pipeline :api do
    plug :accepts, ["json"]
    plug PrismaticAPI.Plugs.CORS
    plug PrismaticAPI.Plugs.APIAuth
    plug PrismaticAPI.Plugs.RateLimiter
    plug PrismaticAPI.Plugs.RequestValidator
  end

  scope "/api/v1", PrismaticAPI do
    pipe_through :api
    get "/health", HealthController, :check
    get "/endpoints", EndpointController, :list
    get "/:app/:action", DispatchController, :dispatch_get
    post "/:app/:action", DispatchController, :dispatch_post
  end
end

defmodule PrismaticAPI.DispatchController do
  use PrismaticAPI, :controller

  def dispatch_get(conn, %{"app" => app, "action" => action} = params) do
    case resolve_endpoint(app, action) do
      {:ok, module, function} ->
        case check_circuit_breaker(module, function) do
          :closed -> safe_apply(module, function, extract_args(params))
          :open -> fallback_response(conn, app, action)
        end
      {:error, :not_found} ->
        send_resp(conn, 404, encode_error("Endpoint not found"))
    end
  end
end
```

## Core Capabilities

- **Request routing and dispatch** with pattern-based routing rules that map incoming API requests to appropriate backend modules, supporting both static configuration and auto-discovered endpoints
- **Facade pattern implementation** that presents simplified, consumer-friendly interfaces over complex internal service architectures, hiding implementation details and inter-service dependencies
- **Cross-cutting concern management** including authentication verification, rate limiting enforcement, request/response logging, and CORS policy application at the gateway level
- **[Circuit breaker](/glossary/circuit-breaker/) and fallback routing** that detects backend service failures and automatically routes requests to fallback handlers or cached responses, maintaining API availability
- **Request transformation pipelines** that normalize incoming requests, validate payload schemas, and transform responses to match consumer-expected formats across API versions
- **Gateway health monitoring** with real-time metrics on request throughput, error rates, latency percentiles, and circuit breaker states for operational visibility

## Implementation

The gateway implementation builds on Phoenix's router and plug pipeline architecture with additional ETS-backed service discovery and circuit breaker integration.

The dispatch controller resolves API requests to backend module functions through the facade module registry. Resolution is O(1) through ETS lookup, ensuring that gateway routing does not add significant latency to request processing. The `safe_apply/3` function wraps the backend module invocation with error handling, preventing backend exceptions from crashing the gateway process.

Rate limiting uses a sliding window algorithm backed by ETS counters, supporting per-endpoint and per-consumer rate limits. The rate limiter emits telemetry events when limits are approached (80% utilization warning) and when limits are exceeded (429 response), enabling proactive capacity management.

## Integration Points

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [api-design-specialist-agent](/agents/api-design-specialist-agent/) | Design Authority | Receives API design specifications for gateway implementation |
| [cloud-security-specialist](/agents/cloud-security-specialist/) | Security Partner | Coordinates gateway security policies and authentication flows |
| [alert-management-specialist](/agents/alert-management-specialist/) | Health Monitor | Routes gateway health alerts including circuit breaker events |
| [aiad-dashboard-commander](/agents/aiad-dashboard-commander/) | Visibility | Displays gateway metrics on monitoring dashboards |
| [absolute-enforcement-commander-v6](/agents/absolute-enforcement-commander-v6/) | Quality Gate | Validates gateway configuration against quality standards |

## Operational Workflow

The gateway operational workflow covers both request processing and gateway configuration management.

**Request Processing Flow.** Each incoming request traverses the middleware pipeline. CORS headers are applied first, followed by authentication verification (API key or token validation). Authenticated requests are rate-limited based on consumer identity and endpoint. Valid requests are dispatched to the backend module through the facade registry. Responses are transformed if version translation is required, and the complete request/response cycle is logged with timing metrics.

**Circuit Breaker Management.** Circuit breakers monitor backend module health through a sliding window of recent responses. When the error rate exceeds the threshold (default 50% over 10 requests), the circuit breaker opens, diverting traffic to the fallback handler. After the cooldown period (default 30 seconds), the circuit breaker enters half-open state, allowing a single probe request. If the probe succeeds, the circuit closes and normal routing resumes.

**Gateway Configuration Updates.** Configuration changes (new rate limits, updated authentication rules, modified CORS policies) are applied through the AIAD Hot Reload Coordinator, enabling live gateway updates without restart. The facade module registry is refreshed when new backend modules are deployed, enabling immediate availability of new API endpoints.

## NABLA Compliance

The API Gateway Specialist operates under NABLA Infinity axiom compliance for gateway operations.

**Signal Plurality.** Backend module health is assessed through multiple independent signals: response codes, response latency, error rates, and circuit breaker state. No single signal triggers a routing change; the circuit breaker algorithm considers the composite signal.

**Provenance Mandatory.** Every request routing decision is logged with provenance: the matched route, the resolved backend module, the authentication result, the rate limit status, and the response code. This audit trail enables debugging of routing issues and security analysis of access patterns.

**Time Decay.** Rate limit windows implement explicit time decay. Request counts older than the window period do not affect current rate calculations. Circuit breaker state includes temporal context -- the time of last failure, time of last probe -- to prevent stale failure data from keeping circuits open indefinitely.

## Configuration

```elixir
config :prismatic_api, PrismaticAPI.Gateway,
  rate_limit_window_ms: 60_000,
  rate_limit_default: 100,
  circuit_breaker_threshold: 0.50,
  circuit_breaker_window: 10,
  circuit_breaker_cooldown_ms: 30_000,
  cors_allowed_origins: ["*"],
  request_logging: true,
  telemetry_prefix: [:prismatic_api, :gateway]
```

The AIAD specification at `.aiad/agents/api-gateway-specialist-agent.agent.md` defines L3 strategic command authority with enforcement block requiring `no-mercy-no-doubts` doctrine compliance.

## Performance

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Request routing latency** | < 5ms | < 10ms | Time for gateway dispatch (excluding backend processing) |
| **Authentication check** | < 2ms | < 5ms | Time for API key or token validation |
| **Rate limit check** | < 1ms | < 2ms | Time for sliding window rate limit evaluation |
| **Gateway throughput** | > 5k req/s | > 2k req/s | Maximum sustained request rate |
| **Circuit breaker response** | < 1ms | < 5ms | Time to return fallback response when circuit is open |
| **Endpoint discovery** | < 1ms | < 5ms | O(1) ETS lookup for facade module resolution |

## Related Resources

- [Prismatic API](/glossary/prismatic-api/) -- Auto-introspecting REST gateway application
- [OpenAPI](/glossary/openapi/) -- API specification standard
- [Architecture Overview](/architecture/) -- Platform architecture including API gateway layer
- [AIAD Standard](/capabilities/aiad-standard/) -- Agent specification standard
- [Applications](/apps/) -- Platform applications with gateway-managed API surfaces
- [Technologies](/technologies/) -- Technology stack including Phoenix and Plug

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)