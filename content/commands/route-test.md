+++
title = "/route-test"
weight = 150
[extra]
category = "Development"
description = "Route testing and HTTP endpoint verification"
syntax = "/route-test [options]"
authority = "L2+"
agent = "route-test-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 670
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["route-test", "Route", "HTTP", "commands", "Development", "Prismatic Platform", "LiveView", "Phase"]
tags = ["commands", "development", "route-test", "prismatic"]
quality_score = 70
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/route-test - Prismatic Platform"
+++

## Overview

**/route-test** is a production command in the **Development** category of the Prismatic Platform. It provides comprehensive HTTP route testing and endpoint verification for Phoenix applications within the umbrella, systematically exercising every defined route to verify correct responses, status codes, content types, and rendering behavior. The command catches routing regressions, dead endpoints, broken LiveView mounts, and misconfigured plugs before they reach production.

This command operates under the **L2+** authority level and is executed by the `route-test-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The route-test-specialist has deep knowledge of Phoenix routing conventions, plug pipelines, and LiveView lifecycle, enabling it to generate meaningful test scenarios for each endpoint type.

In a platform with multiple Phoenix applications (prismatic_web on port 4000, prismatic_api on port 4004), each with dozens of routes including LiveView pages, REST endpoints, health checks, and static assets, manual route verification is impractical. `/route-test` automates this process, providing a single command that exercises the entire routing surface and reports any anomalies.

## Architecture

The route testing system operates as a three-phase pipeline: route discovery, request generation, and response validation.

### Route Test Architecture

```
             /route-test
                   |
          Route Discoverer
                   |
          +--------+--------+
          |        |        |
       Phoenix   LiveView   API
       Router    Routes     Routes
          |        |        |
          +--------+--------+
                   |
          Request Generator
                   |
          +--------+--------+
          |        |        |
       HTTP      WebSocket  Health
       Requests  Connections Checks
          |        |        |
          +--------+--------+
                   |
          Response Validator
                   |
          +--------+--------+
          |        |        |
       Status   Content   Performance
       Codes    Types     Metrics
          |        |        |
          +--------+--------+
                   |
           Test Report
```

### Route Categories

| Category | Discovery Method | Test Strategy |
|----------|-----------------|---------------|
| **Static Routes** | `mix phx.routes` | GET request, verify 200 status |
| **LiveView Routes** | Router analysis, `live` macro detection | Mount verification, socket connection |
| **API Endpoints** | OpenApiSpex schema inspection | GET/POST with sample payloads |
| **Health Checks** | Convention (`/health`, `/ready`) | Response time < 10ms |
| **Static Assets** | Plug.Static configuration | Asset existence and MIME type |
| **Redirects** | Route analysis | Follow chain, verify final destination |
| **Error Pages** | Convention (`/404`, `/500`) | Correct error rendering |

## Usage

```bash
# Test all routes across all applications
/route-test

# Test routes for specific application
/route-test --app prismatic_web

# Test specific route pattern
/route-test --path "/perimeter/*"

# Test only LiveView routes
/route-test --type liveview

# Test API endpoints with sample payloads
/route-test --type api --with-payloads

# Verify performance thresholds
/route-test --check-performance

# Output results as JSON
/route-test --format json

# Test with verbose output (request/response details)
/route-test --verbose

# Dry run showing discovered routes
/route-test --dry-run

# Test and compare against baseline
/route-test --compare-baseline
```

### Practical Examples

```bash
# Full route verification before deployment
/route-test --check-performance --format json --report ./route-health.json

# Verify Perimeter EASM routes after changes
/route-test --app prismatic_web --path "/perimeter/*" --verbose

# Check all API endpoints respond correctly
/route-test --app prismatic_api --type api --with-payloads

# LiveView mount verification across all pages
/route-test --type liveview --verbose --check-performance

# Quick health check verification
/route-test --type health --timeout 5s
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--app` | `string` | all | Specific Phoenix application to test |
| `--path` | `string` | `*` | Route path pattern (supports wildcards) |
| `--type` | `enum` | all | Route type: `static`, `liveview`, `api`, `health`, `assets`, `redirects`, `errors`, `all` |
| `--method` | `string` | auto | HTTP method filter: `get`, `post`, `put`, `delete`, `all` |
| `--with-payloads` | `flag` | false | Send sample payloads to POST/PUT endpoints |
| `--check-performance` | `flag` | false | Verify response times against thresholds |
| `--format` | `enum` | `text` | Output format: `text`, `json`, `markdown`, `junit` |
| `--report` | `path` | none | Export test report to file |
| `--verbose` | `flag` | false | Show request/response details |
| `--dry-run` | `flag` | false | Discover routes without testing |
| `--compare-baseline` | `flag` | false | Compare against saved baseline |
| `--timeout` | `duration` | `30s` | Maximum time per route test |
| `--parallel` | `integer` | 5 | Number of parallel test workers |
| `--auth` | `string` | none | Authentication token for protected routes |
| `--exclude` | `string` | none | Route patterns to exclude |

## Execution Flow

### Phase 1: Route Discovery

The command introspects Phoenix routers to discover all defined routes. For each application, it extracts the route table including path, HTTP method, controller/LiveView module, action, and pipeline (plug stack).

### Phase 2: Test Plan Generation

Each discovered route is mapped to a test scenario based on its type:

| Route Type | Test Scenario |
|-----------|---------------|
| GET static | Single GET request, verify 200 |
| GET with params | Generate sample params from path segments |
| POST/PUT/DELETE | Generate sample payloads from schema (if available) |
| LiveView | HTTP GET + WebSocket mount verification |
| Health check | GET with strict timing requirements |
| Redirect | Follow redirect chain, verify terminal response |

### Phase 3: Request Execution

Test requests are dispatched in parallel using configurable worker count. Each request is timed and its response captured for validation.

### Phase 4: Response Validation

Responses are validated against expected criteria:

| Criterion | Expected | Failure Threshold |
|-----------|----------|-------------------|
| Status Code | 200 for GET, 2xx for mutations | Any non-2xx (except redirects) |
| Content-Type | Matches route pipeline (html, json, etc.) | Mismatch |
| Response Time | < 250ms total, < 100ms server | > threshold |
| Body Present | Non-empty for content routes | Empty body |
| LiveView Mount | WebSocket upgrade succeeds | Connection failure |

### Phase 5: Report Generation

Results are aggregated into a test report showing: routes tested, pass/fail counts, performance metrics, and detailed failure information for any failing routes.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/test](/commands/test/) | Peer | Route tests complement unit/integration tests |
| [/quality-gates](/commands/quality-gates/) | Enforcement | Route health is a quality gate check |
| [/security-audit](/commands/security-audit/) | Peer | Security audit includes route analysis |
| [/svihadlo](/commands/svihadlo/) | Downstream | New features validated through route tests |
| [Prismatic API](/apps/prismatic-api/) | Target | API endpoints are primary test targets |
| [Telemetry](/glossary/telemetry/) | Monitoring | Route performance metrics |

## Best Practices

### Pre-Deployment Verification

Run `/route-test --check-performance` before every deployment. This catches routing regressions and performance degradation that unit tests may miss.

### LiveView-Specific Testing

LiveView routes require special attention because they involve both HTTP rendering and WebSocket connections. Use `--type liveview --verbose` to verify both the initial page load and the socket mount.

### API Contract Testing

For API endpoints, always use `--with-payloads` to verify that endpoints accept and correctly process request bodies. The command generates sample payloads from OpenApiSpex schemas when available.

### Baseline Comparison

Maintain a route test baseline and use `--compare-baseline` to detect newly broken routes. This is especially valuable in CI/CD pipelines where route changes may be unintentional side effects of other modifications.

## Error Handling

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `ROUTE_NOT_FOUND` | Expected route returns 404 | Check router configuration for the route |
| `TIMEOUT_EXCEEDED` | Route response exceeded timeout | Investigate slow controller/LiveView; optimize |
| `MOUNT_FAILURE` | LiveView WebSocket mount failed | Check LiveView module for mount/3 errors |
| `STATUS_UNEXPECTED` | Unexpected HTTP status code | Review controller action and plug pipeline |
| `CONTENT_TYPE_MISMATCH` | Response content type does not match expected | Check pipeline content type configuration |
| `SERVER_ERROR` | Route returned 500 | Check server logs for the underlying error |
| `AUTH_REQUIRED` | Route requires authentication | Provide `--auth` token or exclude route |

## Advanced Usage

### Custom Payload Files

Provide custom request payloads for specific endpoints:

```bash
/route-test --app prismatic_api --payloads-dir ./test-payloads/
```

### JUnit Report for CI

Generate JUnit XML reports for CI pipeline integration:

```bash
/route-test --format junit --report ./test-results/route-tests.xml
```

### Continuous Route Monitoring

Set up periodic route testing for production monitoring:

```bash
/route-test --app prismatic_web --type health,liveview --check-performance --interval 5m
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every defined route must respond correctly or be reported as a failure.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Route health is verified through actual HTTP requests, not configuration inspection alone.

## Related Commands

- [/test](/commands/test/) - Comprehensive test generation and verification
- [/code](/commands/code/) - Core coding implementation and feature development
- [/svihadlo](/commands/svihadlo/) - Ultra-fast visible feature implementation in 5-15 minutes
- [/security-audit](/commands/security-audit/) - Comprehensive application security audit and vulnerability scan
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)