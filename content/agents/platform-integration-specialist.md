+++
title = "platform-integration-specialist"
weight = 303
[extra]
domain = "integration"
level = "L3"
description = "Third-party platform integration and SaaS connectivity"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["platform-integration-specialist", "Third-party", "SaaS", "agents", "agent", "Prismatic Platform", "OAuth", "GenServer"]
tags = ["agents", "agent", "platform-integration-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "platform-integration-specialist - Prismatic Platform"
+++

## Overview

The platform-integration-specialist operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's integration domain, responsible for designing, implementing, and maintaining connections between the platform and external third-party services, SaaS providers, and partner APIs. This agent manages the full integration lifecycle -- from API discovery and capability mapping through adapter implementation to ongoing health monitoring and version compatibility management. It ensures that external dependencies are isolated behind well-defined interfaces, preventing vendor lock-in and maintaining platform resilience.

Built on the [AIAD](@/glossary/aiad.md) standard and the [OTP](@/glossary/otp.md) supervision model, every integration managed by this agent runs within its own supervised process, with [circuit breaker](@/glossary/circuit-breaker.md) patterns preventing external service failures from cascading into the platform's core systems. The agent enforces the [NO MERCY](@/glossary/no-mercy.md) doctrine on integration quality: no adapter is deployed without comprehensive contract tests, error handling validation, and rate limit compliance verification.

## Operational Domain

The integration domain covers all external service connectivity including [REST API](@/glossary/rest-api.md)s, [GraphQL](@/glossary/graphql.md) endpoints, webhook receivers, OAuth flows, and streaming data connections. The agent maintains an integration [registry](@/glossary/registry-otp.md) that tracks all active connections, their health status, API version compatibility, and credential rotation schedules. Integration adapters follow the platform's [behaviour](@/glossary/behaviour.md)-based [adapter pattern](@/glossary/adapter-pattern.md), ensuring that any external service can be swapped for an alternative implementation without modifying consuming code.

| Integration Type | Protocol | Supervision Pattern |
|-----------------|----------|-------------------|
| REST APIs | HTTP/HTTPS with JSON | GenServer + Circuit Breaker |
| GraphQL | HTTP POST with typed queries | GenServer + Connection Pool |
| Webhooks | Inbound HTTP callbacks | Plug pipeline + validation |
| OAuth Flows | OAuth 2.0 / OIDC | Token refresh GenServer |
| Streaming | WebSocket / SSE | Supervised persistent connection |
| Batch Import | Scheduled HTTP polling | GenServer + Timer |

## Key Capabilities

- **API discovery and mapping** -- Analyzes third-party API documentation and [OpenAPI](@/glossary/openapi.md) specifications to generate integration capability maps, identifying available endpoints, authentication requirements, and rate limit constraints
- **Adapter code generation** -- Produces [OTP](@/glossary/otp.md)-compliant integration adapters that implement platform [behaviour](@/glossary/behaviour.md) contracts, including error handling, retry logic, and circuit breaker patterns
- **Health monitoring** -- Continuously monitors integration endpoint availability, response latency, error rates, and API version deprecation notices through [telemetry](@/glossary/telemetry.md) events
- **Credential lifecycle management** -- Tracks API key expiration, OAuth token refresh cycles, and certificate rotation requirements to prevent authentication failures
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-healing integration recovery when external services degrade
- **[SEADF](@/glossary/seadf.md) integration** for evolutionary improvement of adapter reliability based on failure pattern analysis

## Integration Adapter Architecture

```elixir
defmodule Prismatic.Integration.Adapter do
  @moduledoc """
  Behaviour and base implementation for external service
  integration adapters with circuit breaker protection.
  """

  @callback connect(config :: map()) :: {:ok, connection()} | {:error, term()}
  @callback request(connection(), method :: atom(), path :: String.t(), body :: term()) ::
    {:ok, response()} | {:error, term()}
  @callback health_check(connection()) :: :healthy | :degraded | :unavailable

  defmacro __using__(opts) do
    quote do
      @behaviour Prismatic.Integration.Adapter

      use GenServer

      alias Prismatic.Integration.{CircuitBreaker, RateLimiter, RetryPolicy}

      @service_name unquote(opts[:service_name])
      @base_url unquote(opts[:base_url])
      @rate_limit unquote(opts[:rate_limit] || 100)

      def start_link(config) do
        GenServer.start_link(__MODULE__, config, name: __MODULE__)
      end

      @impl GenServer
      def init(config) do
        {:ok, %{
          config: config,
          circuit: CircuitBreaker.new(threshold: 5, reset_timeout: 30_000),
          rate_limiter: RateLimiter.new(max_requests: @rate_limit, window: :timer.seconds(60)),
          connection: nil
        }}
      end

      def execute(method, path, body \\ nil) do
        GenServer.call(__MODULE__, {:execute, method, path, body}, 15_000)
      end

      @impl GenServer
      def handle_call({:execute, method, path, body}, _from, state) do
        with {:ok, state} <- CircuitBreaker.check(state),
             :ok <- RateLimiter.acquire(state.rate_limiter) do
          case request(state.connection, method, path, body) do
            {:ok, response} ->
              emit_telemetry(:success, method, path)
              {:reply, {:ok, response}, CircuitBreaker.record_success(state)}

            {:error, reason} = error ->
              emit_telemetry(:error, method, path)
              {:reply, error, CircuitBreaker.record_failure(state)}
          end
        else
          {:error, :circuit_open} ->
            {:reply, {:error, :service_unavailable}, state}

          {:error, :rate_limited} ->
            {:reply, {:error, :rate_limited}, state}
        end
      end

      defp emit_telemetry(status, method, path) do
        :telemetry.execute(
          [:prismatic, :integration, @service_name, status],
          %{count: 1},
          %{method: method, path: path}
        )
      end
    end
  end
end
```

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to register new integrations, enforce adapter compliance standards, and manage credential lifecycles.

## Integration Health Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Availability | Integration endpoint uptime percentage | > 99.5% |
| Response Latency | P95 response time from external service | < 500ms |
| Error Rate | Percentage of failed requests | < 1% |
| Circuit Breaker Opens | Frequency of circuit breaker activations | < 1 per day |
| Rate Limit Utilization | Percentage of rate limit budget consumed | < 80% |
| Credential Freshness | Time until credential expiration | > 7 days warning |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/integration status` | Display health status of all active integrations | L3+ |
| `/integration register` | Register and configure a new external service integration | L3+ |
| `/integration audit` | Audit integration security and compliance posture | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [service-mesh-specialist](@/agents/service-mesh-specialist.md) | Manages service-to-service communication patterns for integration traffic |
| [code-quality-commander](@/agents/code-quality-commander.md) | Enforces quality standards on generated adapter code |
| [performance-benchmarking-agent](@/agents/performance-benchmarking-agent.md) | Validates integration adapter performance characteristics |
| [security-audit-specialist](@/agents/security-audit-specialist.md) | Audits integration security posture and credential management |

## Circuit Breaker Pattern

The platform-integration-specialist implements the [circuit breaker](@/glossary/circuit-breaker.md) pattern for every external integration, preventing cascading failures when external services experience outages or degradation. The circuit breaker operates in three states.

In the **closed** state, requests flow through to the external service normally. Each failure increments a failure counter. When the failure count exceeds the threshold (configurable per integration, default 5 failures), the circuit transitions to the open state.

In the **open** state, all requests immediately return `{:error, :service_unavailable}` without attempting to contact the external service. This prevents the platform from wasting resources on requests that are likely to fail and prevents slow external responses from consuming connection pool capacity. The circuit remains open for a configurable reset timeout (default 30 seconds).

After the reset timeout expires, the circuit transitions to the **half-open** state. A single probe request is allowed through to the external service. If the probe succeeds, the circuit transitions back to closed and normal operation resumes. If the probe fails, the circuit transitions back to open for another reset timeout period. This probing mechanism enables automatic recovery when external services come back online without requiring manual intervention.

## Credential Lifecycle Management

External integrations require various forms of authentication: API keys, OAuth 2.0 tokens, client certificates, and service account credentials. The platform-integration-specialist tracks the lifecycle of all credentials, including creation date, expiration date, last rotation date, and renewal method. A credential monitoring process runs continuously, raising alerts when credentials approach their expiration date (configurable warning threshold, default 7 days before expiry).

For OAuth 2.0 integrations, the specialist manages automatic token refresh through a dedicated [GenServer](@/glossary/genserver.md) process per integration. This process proactively refreshes access tokens before they expire, ensuring that integrations never experience authentication failures due to token expiration. The refresh process handles the full OAuth flow including refresh token rotation when required by the authorization server.

Credential storage follows security best practices: credentials are never stored in source code or configuration files. Instead, they are retrieved from secure credential stores (environment variables for simple deployments, HashiCorp Vault for production environments) at runtime and held only in process memory.

## Integration Testing Strategy

Every integration adapter undergoes comprehensive testing before deployment. The testing strategy includes three layers: **contract tests** that verify the adapter correctly implements the platform's integration [behaviour](@/glossary/behaviour.md) contract (all callbacks present, correct return types), **simulation tests** that exercise the adapter against recorded responses from the external service (ensuring correct parsing of actual API responses), and **live tests** that execute against the real external service in a staging environment (validating end-to-end connectivity and authentication).

Contract tests and simulation tests run in the continuous integration pipeline on every commit. Live tests run on a scheduled basis (daily or weekly depending on the integration's criticality) to detect external API changes that might break the adapter. Failed live tests trigger immediate alerts to the integration maintenance team.

## Enforcement

All integrations must pass contract tests that validate both success and failure paths before deployment. The [NO MERCY](@/glossary/no-mercy.md) doctrine requires that every adapter handles timeout, authentication failure, [rate limiting](@/glossary/rate-limiting.md), and malformed response scenarios. No integration is promoted to production without complete [telemetry](@/glossary/telemetry.md) instrumentation and circuit breaker configuration. The [NO DOUBTS](@/glossary/no-doubts.md) principle mandates that integration health claims are backed by continuous monitoring data with [SEADF](@/glossary/seadf.md) evolutionary feedback loops.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)