+++
title = "/integrate"
weight = 830
[extra]
category = "Architecture"
description = "Cross-system integration design and implementation"
syntax = "/integrate [options]"
authority = "L3"
agent = "integration-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1162
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["integrate", "Cross-system", "commands", "Architecture", "Prismatic Platform", "Integration", "GenServer"]
tags = ["commands", "architecture", "integrate", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/integrate - Prismatic Platform"
+++

## Overview

**/integrate** is a production command in the **Architecture** category of the Prismatic Platform that designs and implements cross-system integrations between platform components, external services, and third-party APIs. In a platform with nearly 100 umbrella applications, the integration surface is vast: applications must communicate through well-defined interfaces, external services must be connected through adapters, and data must flow reliably between systems with different schemas, protocols, and availability characteristics.

This command operates under the **L3** authority level and is executed by the `integration-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the architectural significance of integration work: poorly designed integrations can introduce coupling, data inconsistency, and cascading failure modes that undermine the entire platform.

The integration-specialist agent approaches every integration through the lens of OTP principles: supervision trees for fault tolerance, GenServer patterns for state management, and behaviour contracts for interface definition. Integrations are never ad-hoc HTTP calls scattered throughout the codebase; they are structured components with defined contracts, error handling, retry policies, and circuit breakers. This disciplined approach to integration design reflects a core platform conviction: the boundaries between systems are where most failures originate, and therefore where the most rigorous engineering practices must be applied.

The command covers the complete integration lifecycle: design (analyzing source and target systems to determine the optimal integration pattern), implementation (generating adapter code with proper OTP supervision), testing (generating integration tests that cover failure modes), documentation (producing integration specifications), and monitoring (configuring health checks and alerting for the live integration).

## Syntax and Usage

```bash
/integrate <action> [options]
```

The command accepts a required action parameter that determines the operation: design, implement, test, list, health, docs, configure, verify, or analyze.

```bash
# Design a new integration
/integrate design --source=prismatic_web --target=external_api --protocol=rest

# Implement an integration adapter
/integrate implement --adapter=payment-gateway --protocol=rest

# Test integration connectivity
/integrate test --adapter=gitlab --verbose

# List all configured integrations
/integrate list

# Show integration health status
/integrate health

# Generate integration documentation
/integrate docs --adapter=meilisearch --format=markdown

# Configure retry and circuit breaker policies
/integrate configure --adapter=external-api --retries=3 --circuit-breaker=true

# Run integration test suite
/integrate verify --adapter=all

# Analyze integration dependencies
/integrate analyze --dependency-map
```

## Parameters and Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `action` | string | required | Action: `design`, `implement`, `test`, `list`, `health`, `docs`, `configure`, `verify`, `analyze` |
| `--source` | string | none | Source system for integration design |
| `--target` | string | none | Target system for integration design |
| `--adapter` | string | none | Adapter name for implementation/test |
| `--protocol` | string | `rest` | Communication protocol: `rest`, `grpc`, `amqp`, `websocket` |
| `--retries` | integer | `3` | Number of retry attempts |
| `--circuit-breaker` | boolean | `true` | Enable circuit breaker pattern |
| `--timeout` | integer | `30` | Request timeout in seconds |
| `--format` | string | `text` | Output format: `text`, `json`, `markdown` |
| `--verbose` | flag | `false` | Show detailed output |
| `--dependency-map` | flag | `false` | Generate dependency visualization |
| `--pattern` | string | `auto` | Integration pattern: `request-response`, `event-driven`, `polling`, `batch`, `saga` |
| `--backoff` | string | `exponential` | Retry backoff strategy: `linear`, `exponential`, `constant` |

## Implementation Architecture

The integration framework follows a layered architecture that separates interface definition from protocol implementation. This separation ensures that business logic remains decoupled from the specific external service, enabling adapter substitution without modifying consuming code.

### Integration Layers

```
Business Logic Layer
         |
         v
Integration Contract (Behaviour)
         |
         v
Adapter Layer (Protocol-specific)
         |
         v
Transport Layer (HTTP, gRPC, AMQP, etc.)
         |
         v
External System
```

### Adapter Architecture

Every external integration is implemented as an adapter that conforms to a platform-defined behaviour:

```elixir
defmodule PrismaticIntegration.Adapter do
  @callback connect(config :: map()) :: {:ok, state :: term()} | {:error, reason :: term()}
  @callback request(state :: term(), operation :: atom(), params :: map()) :: {:ok, result :: term()} | {:error, reason :: term()}
  @callback disconnect(state :: term()) :: :ok
  @callback health_check(state :: term()) :: :healthy | :degraded | :unhealthy
end
```

### Integration Patterns

| Pattern | Use Case | Implementation | Fault Tolerance |
|---------|----------|---------------|-----------------|
| **Request-Response** | Synchronous API calls | GenServer + HTTP client | Circuit breaker + retry |
| **Event-Driven** | Asynchronous notifications | PubSub + event handlers | Dead letter queue |
| **Polling** | External systems without webhooks | GenServer + timer | Backoff on failure |
| **Batch** | Bulk data transfer | Flow + batch processor | Checkpoint + resume |
| **Saga** | Multi-step distributed transactions | Saga orchestrator | Compensating transactions |
| **Circuit Breaker** | Fault isolation for all patterns | Circuit breaker GenServer | Automatic recovery |

### Execution Flow

1. **Integration Assessment**: The integration-specialist agent analyzes the source and target systems to determine the optimal integration pattern. System characteristics (synchronous vs. asynchronous, reliability requirements, data volume) inform the pattern selection.

2. **Contract Definition**: A behaviour module is generated that defines the integration contract. This contract specifies the operations available, parameter types, return types, and error modes.

3. **Adapter Implementation**: A concrete adapter module is generated that implements the contract for the specific target system. The adapter handles protocol details, authentication, serialization, and error translation.

4. **Fault Tolerance Setup**: Supervision trees, circuit breakers, and retry policies are configured for the integration. Each integration runs under its own supervisor to prevent failures from cascading to other integrations.

5. **Testing**: Integration tests are generated and executed. Tests cover happy path, error handling, timeout behavior, retry logic, and circuit breaker activation.

6. **Documentation**: Integration documentation is generated including contract specification, configuration options, error codes, and usage examples.

7. **Registration**: The completed integration is registered in the platform's integration registry, making it discoverable by other commands and agents.

## Examples

### Custom Adapter Development

```elixir
defmodule PrismaticIntegration.Adapters.CustomService do
  @behaviour PrismaticIntegration.Adapter

  @impl true
  def connect(%{url: url, api_key: key}) do
    {:ok, %{url: url, api_key: key, client: HTTPClient.new()}}
  end

  @impl true
  def request(state, :fetch_data, %{query: query}) do
    case HTTPClient.get(state.client, "#{state.url}/data", query: query) do
      {:ok, %{status: 200, body: body}} -> {:ok, Jason.decode!(body)}
      {:ok, %{status: status}} -> {:error, {:http_error, status}}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl true
  def health_check(state) do
    case HTTPClient.get(state.client, "#{state.url}/health") do
      {:ok, %{status: 200}} -> :healthy
      _ -> :unhealthy
    end
  end
end
```

### Saga Pattern for Distributed Transactions

```bash
/integrate design --pattern=saga --steps="create_order,reserve_inventory,process_payment"
```

This generates a saga orchestrator that manages the multi-step transaction with compensating actions for each step. If payment processing fails, the saga automatically releases the inventory reservation and cancels the order creation.

### Integration Dependency Analysis

```bash
/integrate analyze --dependency-map --format=json --output=integration-map.json
/integrate analyze --critical-path
/integrate analyze --cycles
```

## Integration with Platform

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `integration-specialist` | Designs and implements integrations |
| [/analyze](/commands/analyze/) | Architecture analysis | Integration dependency mapping |
| [/architect](/commands/architect/) | Architecture design | Integration fits within architecture |
| [/code](/commands/code/) | Implementation | Adapter code generation |
| [/test](/commands/test/) | Testing | Integration test generation |
| [Quality Gates](/glossary/quality-gates/) | Quality validation | Integration code quality |
| [Telemetry](/glossary/telemetry/) | Health monitoring | Integration health [metrics](/glossary/metrics/) |
| [OTP Supervision](/glossary/otp/) | Fault tolerance | Supervision tree management |
| Circuit Breaker | Fault isolation | Per-integration circuit breaker GenServers |

## Workflow Integration

The /integrate command participates in several platform workflows:

1. **New Service Integration**: When adding a new external service dependency, the full lifecycle runs: design the integration pattern, implement the adapter, generate tests, document the contract, and register the integration. This ensures every external dependency is properly encapsulated from day one.

2. **Integration Health Monitoring**: The `health` action is invoked periodically (via SEADF evolution cycles) to assess the health of all active integrations. Degraded integrations trigger automatic investigation and alerting.

3. **Migration Planning**: When migrating between external service providers (e.g., switching payment processors), the adapter pattern allows implementing the new adapter alongside the old one, testing both in parallel, and switching atomically.

4. **Architecture Review**: During architecture reviews, `/integrate analyze --dependency-map` reveals the full integration topology, identifying single points of failure, critical path dependencies, and potential cascading failure scenarios.

5. **Incident Response**: When an external service fails, the circuit breaker configuration managed by `/integrate configure` determines how the platform degrades gracefully rather than cascading the failure.

## NABLA Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every integration must have error handling, circuit breakers, and tests. No ad-hoc integrations permitted. Adapters without health checks are rejected.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Integration design is based on thorough analysis of both source and target system characteristics. Retry policies and timeout values are derived from measured behavior, not assumptions.

NABLA axiom compliance for integrations:

| Axiom | Enforcement |
|-------|-------------|
| **Signal Plurality** | Multiple health check signals (latency, error rate, availability) |
| **Contradiction Preservation** | Conflicting health signals (fast response but high error rate) preserved |
| **Provenance Mandatory** | Every integration request/response logged with timestamps |
| **Time Decay** | Health status expires; stale health data triggers re-check |
| **Source Independence** | Health checks independent from business request monitoring |

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Integration design analysis | < 30s | ~10s |
| Adapter code generation | < 10s | ~3s |
| Integration test generation | < 15s | ~5s |
| Health check execution (all) | < 30s | ~10s |
| Circuit breaker transition | < 1ms | ~0.1ms (ETS state) |
| Retry with exponential backoff | Configurable | 1s, 2s, 4s, 8s... |
| Dependency map generation | < 5s | ~2s |

## Related Commands

- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/architect](/commands/architect/) - Architecture design and recommendation generation
- [/code](/commands/code/) - Core coding implementation and feature development
- [/test](/commands/test/) - Comprehensive test generation and verification
- [/migrate](/commands/migrate/) - Safe migration planning with rollback strategies
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee
- [/pattern](/commands/pattern/) - AI pattern lookup and pattern library access

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)