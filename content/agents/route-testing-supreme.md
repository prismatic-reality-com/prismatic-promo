+++
title = "route-testing-supreme"
weight = 357
[extra]
domain = "cosmic-clearance"
level = "L1"
description = "Absolute route testing enforcement with 100% coverage guarantee"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "nabla-infinity", "trinity-gate", "seadf", "otp", "beam", "telemetry"]
domain_normalized = "supreme"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1850
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["route-testing-supreme", "Absolute", "agents", "agent", "Prismatic Platform", "Block", "Phoenix", "LiveView"]
tags = ["agents", "agent", "route-testing-supreme", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "route-testing-supreme - Prismatic Platform"
+++

## Overview

The route-testing-supreme operates as an L1 Supreme Authority within the Prismatic Platform's cosmic-clearance domain, providing absolute route testing enforcement with a 100% coverage guarantee across all web-accessible endpoints. In a platform serving multiple Phoenix applications (main web on port 4000, API on port 4004, promo site, and additional services), every route that is defined must be tested for correct response status, content type, and behavioral compliance. No route enters production without verified test coverage, and no deployment proceeds if any route test fails.

Route testing at the supreme authority level reflects the critical importance of endpoint reliability in an intelligence platform. A broken route does not merely degrade user experience -- it can disrupt intelligence collection pipelines, block API consumers, prevent dashboard access during time-sensitive operations, and create security vulnerabilities through unexpected error responses that leak implementation details. The route-testing-supreme treats every route as a production contract that must be honored.

Built on the [AIAD](@/glossary/aiad.md) standard and governing from the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine at supreme enforcement level, this agent maintains zero tolerance for untested routes. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework applies to route testing through the [signal plurality](@/glossary/signal-plurality.md) axiom: route health is assessed through multiple independent verification methods (HTTP status, response body content, response time, header correctness) rather than relying on a single pass/fail signal.

## Route Testing Architecture

The testing architecture operates through comprehensive verification at multiple levels.

**Discovery verification** ensures that the route testing suite covers every route defined in the application's router. The agent extracts all defined routes from Phoenix router modules using `Phoenix.Router.__routes__/1` and compares them against the test suite's route coverage map. Any route present in the router but absent from the test suite is flagged as a coverage gap.

**Response verification** tests each route for correct HTTP response status, content type, and basic response structure. GET routes must return 200 or redirect status codes. POST routes must handle valid and invalid input correctly. Error routes must return appropriate 4xx/5xx status codes without leaking sensitive information. LiveView routes must successfully mount and render initial state.

**Performance verification** measures response time for every route against the platform's page load performance standard. Server-side render time must be under 100ms, total page load under 250ms, and LiveView mount under 150ms. Routes that exceed performance thresholds are flagged as violations regardless of functional correctness.

**Security verification** checks that routes enforce proper authentication and authorization requirements. Protected routes must reject unauthenticated access with appropriate status codes. Public routes must not expose internal implementation details through error responses. All routes must include proper security headers (CSP, X-Frame-Options, HSTS).

## Key Capabilities

- **100% route coverage enforcement** -- Guarantees that every route defined in Phoenix routers has corresponding test coverage, with automatic detection of coverage gaps when new routes are added
- **Multi-signal route verification** -- Tests routes across multiple dimensions (status, content, performance, security) rather than simple pass/fail response checking
- **Performance standard enforcement** -- Validates that all routes meet the platform's page load performance standard (<250ms total, <100ms server render, <150ms LiveView mount)
- **Security header verification** -- Confirms that all routes include required security headers and that protected routes enforce authentication boundaries correctly
- **LiveView testing** -- Tests LiveView routes for successful mount, initial render, and event handler responsiveness
- **Regression detection** -- Detects route regressions introduced by code changes, including broken routes, degraded performance, and altered response structures
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with automatic route testing triggered by deployment events
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for route health tracking, performance trending, and coverage metric monitoring

## Route Verification Matrix

| Verification | GET Routes | POST Routes | LiveView | API Endpoints |
|-------------|------------|-------------|----------|---------------|
| **Status Code** | 200 or redirect | 200/201 or 422 | 200 | Per OpenAPI spec |
| **Content Type** | text/html | varies | text/html | application/json |
| **Performance** | <250ms total | <250ms total | <150ms mount | <100ms response |
| **Auth** | Per route config | Per route config | Per route config | API key/token |
| **Security Headers** | Full set | Full set | Full set | CORS + auth |
| **Body Content** | Non-empty | Per spec | Rendered HTML | JSON schema |

## Implementation Architecture

```elixir
defmodule PrismaticWeb.RouteTestingSupreme do
  @moduledoc """
  Supreme route testing enforcement with 100% coverage
  guarantee across all Phoenix applications.
  """

  alias PrismaticWeb.{RouteDiscovery, RouteVerifier, PerformanceChecker}

  @type route_result :: %{
    path: String.t(),
    method: atom(),
    status: :pass | :fail,
    checks: [check_result()],
    response_time_ms: non_neg_integer()
  }

  @type check_result :: %{
    check: atom(),
    status: :pass | :fail,
    detail: String.t()
  }

  @spec verify_all_routes() :: {:ok, [route_result()]} | {:error, [route_result()]}
  def verify_all_routes do
    routes = RouteDiscovery.all_routes()
    results = Enum.map(routes, &verify_route/1)

    case Enum.any?(results, &(&1.status == :fail)) do
      true -> {:error, results}
      false -> {:ok, results}
    end
  end

  @spec coverage_report() :: %{total: non_neg_integer(), tested: non_neg_integer(), gaps: [String.t()]}
  def coverage_report do
    all_routes = RouteDiscovery.all_routes() |> MapSet.new(&route_key/1)
    tested_routes = RouteDiscovery.tested_routes() |> MapSet.new(&route_key/1)
    gaps = MapSet.difference(all_routes, tested_routes)

    %{
      total: MapSet.size(all_routes),
      tested: MapSet.size(tested_routes),
      gaps: MapSet.to_list(gaps)
    }
  end
end
```

## Performance Standards

| Metric | Hard Limit | Measurement | Enforcement |
|--------|-----------|-------------|-------------|
| **Total Page Load** | <250ms | End-to-end request cycle | Block deployment |
| **Server Render** | <100ms | Phoenix response generation | Block deployment |
| **LiveView Mount** | <150ms | WebSocket mount + initial render | Block deployment |
| **LiveView Event** | <50ms | Event handler execution | Block deployment |
| **API Response** | <100ms | JSON serialization + response | Block deployment |
| **Health Check** | <10ms | Minimal health endpoint | Block deployment |

## Coverage Enforcement Protocol

| Coverage Level | Status | Response |
|---------------|--------|----------|
| **100%** | OPTIMAL | Deploy permitted |
| **99-99.9%** | WARNING | Deploy permitted with gap report |
| **95-99%** | CRITICAL | Deploy blocked, gap remediation required |
| **<95%** | EMERGENCY | All deploys blocked, supreme escalation |

## Authority Level

**L1** - Supreme Authority - Platform-wide strategic and tactical control with authority to block deployments, require route test additions, and enforce performance standards across all web applications.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/route-test all` | Execute comprehensive route testing across all applications | L1 |
| `/route-test coverage` | Display route coverage report with gap identification | L1 |
| `/route-test performance` | Run performance verification against all routes | L1 |
| `/route-test security` | Execute security header and auth boundary verification | L1 |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [prismatic-supreme-commander](@/agents/prismatic-supreme-commander.md) | Supreme coordination for platform-wide deployment decisions |
| [prismatic-api-introspector](@/agents/prismatic-api-introspector.md) | API route discovery feeds route testing coverage |
| [quality-enforcement-commander](@/agents/quality-enforcement-commander.md) | Route test results are a quality enforcement dimension |
| [refactor-specialist-coordinator](@/agents/refactor-specialist-coordinator.md) | Refactoring operations verified by route testing |
| [replication-specialist](@/agents/replication-specialist.md) | Route availability verified after failover operations |

## Enforcement

Route testing operates under absolute [NO MERCY](@/glossary/no-mercy.md) enforcement at the supreme level: no untested route reaches production, no performance violation is accepted, and no deployment proceeds with route test failures. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that route test results are deterministic -- the same route tested under the same conditions produces the same result. The [Trinity Gate](@/glossary/trinity-gate.md) validates route testing infrastructure integrity, ensuring that the testing system itself correctly detects the violations it claims to detect.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)