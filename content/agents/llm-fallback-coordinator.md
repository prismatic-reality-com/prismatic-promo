+++
title = "llm-fallback-coordinator"
weight = 225
[extra]
domain = "aiad-enhanced"
level = "L3"
description = "Graceful degradation and fallback strategies for resilient LLM operations with automatic provider switching and quality preservation"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "no-mercy", "no-doubts", "trinity-gate", "nabla-infinity", "otp", "genserver", "telemetry"]
domain_normalized = "aiad"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["llm-fallback-coordinator", "Graceful", "agents", "agent", "Prismatic Platform", "Tier", "Failover", "AIAD"]
tags = ["agents", "agent", "llm-fallback-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "llm-fallback-coordinator - Prismatic Platform"
+++

## Overview

The llm-fallback-coordinator is an L3 [Strategic Command](/glossary/strategic-command/) agent operating within the [AIAD](/glossary/aiad/)-enhanced domain of the Prismatic Platform. This agent manages graceful degradation and fallback strategies for LLM operations, ensuring that platform functionality continues when primary LLM providers experience outages, rate limiting, elevated latency, or degraded response quality. In a platform where hundreds of autonomous agents depend on LLM capabilities, provider disruptions can cascade into widespread operational failures unless fallback mechanisms are in place to redirect requests to alternative providers transparently.

Built on the [AIAD](/glossary/aiad/) standard, the llm-fallback-coordinator implements a multi-tier resilience architecture that combines provider health monitoring, automatic failover, response quality validation, and graceful degradation. The coordinator's design philosophy is that no single LLM provider failure should cause platform-wide disruption -- the platform must maintain operational capability even when its preferred provider is unavailable, accepting controlled quality degradation over complete service interruption.

## Resilience Architecture

The resilience architecture operates through four coordinated mechanisms: health monitoring, failover routing, quality gating, and degradation management.

Health monitoring continuously assesses the operational status of all configured LLM providers. Monitoring probes measure response latency (P50, P95, P99), error rates (HTTP errors, timeout rates, malformed responses), rate limit headroom (remaining requests before throttling), and response quality (assessed through automated quality checks on sampled responses). Health scores are computed as weighted combinations of these metrics, updated in real-time, and published to the platform's telemetry system.

Failover routing determines where to send LLM requests when the primary provider's health score drops below configurable thresholds. The routing table maps each provider to a priority-ordered list of fallback providers, with fallback selection considering model capability (the fallback model must support the required capabilities), cost implications (failover to more expensive models is permitted but tracked), and current load (fallback providers that are already under load may be deprioritized). Failover is automatic and transparent to the requesting agent -- the LLM client receives a response without needing to know which provider fulfilled the request.

Quality gating validates that responses from fallback providers meet minimum quality standards. When a request is routed to a fallback provider with different capabilities than the primary, the quality gate checks that the response meets task-specific quality criteria before delivery. Responses that fail quality gating are rejected, and the request may be retried with a different fallback or returned to the requester with an explicit quality degradation warning.

Degradation management coordinates platform-wide response to sustained provider disruptions. When fallback options are exhausted or degraded, the coordinator signals to requesting agents that LLM capabilities are operating in degraded mode, enabling agents to activate their own degradation strategies (using cached responses, deferring non-critical operations, or operating with reduced intelligence).

## Key Capabilities

- **Provider health monitoring** -- Continuously assesses LLM provider operational status through latency, error rate, rate limit, and quality metrics
- **Automatic failover** -- Transparently routes LLM requests to fallback providers when primary providers experience disruptions
- **Quality-gated fallback** -- Validates fallback response quality before delivery, preventing degraded responses from silently replacing high-quality responses
- **Multi-tier fallback chains** -- Supports configurable fallback chains with multiple tiers (cloud primary, cloud secondary, local Ollama models, cached responses)
- **Rate limit management** -- Monitors rate limit consumption across providers and proactively distributes requests to prevent rate limit exhaustion
- **Provider recovery detection** -- Monitors recovering providers and automatically restores primary routing when provider health returns to acceptable levels
- **Degradation signaling** -- Communicates degradation status to requesting agents, enabling agent-level degradation strategies
- **[GenServer](/glossary/genserver/)-based coordination** -- Implements routing state and health monitoring as OTP GenServers for fault-tolerant operation
- **[Telemetry integration](/capabilities/telemetry-integration/)** for failover event tracking and provider health dashboard publication

## Fallback Chain Configuration

The fallback coordinator supports configurable fallback chains that define the sequence of alternative providers for different request types. A typical chain might include:

**Tier 1 (Primary)**: Claude Opus via Anthropic API -- highest quality, highest cost, primary for complex reasoning and code generation tasks.

**Tier 2 (Cloud Fallback)**: Alternative cloud providers with comparable model capabilities -- activated when Tier 1 experiences outages or rate limiting.

**Tier 3 (Local Fallback)**: Local Ollama models (qwen3-coder, deepseek-coder) running on platform infrastructure -- activated when cloud providers are unavailable, with accepted quality degradation for complex tasks.

**Tier 4 (Cached/Degraded)**: Cached responses for deterministic queries, deferred processing for non-urgent tasks -- activated when all provider tiers are unavailable.

Each tier transition triggers a telemetry event that tracks the duration and impact of operation at degraded tiers, providing data for capacity planning and provider SLA evaluation.

## Circuit Breaker Pattern

The coordinator implements the circuit breaker pattern for each provider connection. When error rates exceed configurable thresholds, the circuit breaker opens, immediately routing all requests to fallback providers without attempting the failing provider. After a configurable cool-down period, the circuit breaker enters a half-open state, routing a small percentage of requests to the recovering provider to test its health. If test requests succeed, the circuit breaker closes and normal routing resumes. If test requests fail, the circuit breaker remains open for another cool-down period.

The circuit breaker parameters (error threshold, cool-down period, test request percentage) are configurable per provider and can be adjusted dynamically based on the provider's historical reliability profile.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination authority enabling the coordinator to manage routing decisions across all LLM providers, signal degradation status to all requesting agents, and coordinate recovery procedures across the LLM infrastructure.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management |
| LLM Client Library | Request routing and response delivery integration |
| [GenServer](/glossary/genserver/) | OTP-based routing state and health monitoring |
| Ollama | Local model fallback for cloud provider outages |
| Prismatic Telemetry | Failover event tracking and provider health [metrics](/glossary/metrics/) |
| [SEADF](/glossary/seadf/) | Autonomous evolution of fallback chain optimization |
| AIAD [Registry](/glossary/registry-otp/) | Agent specification and discovery |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/llm-fallback status` | Display current provider health and routing status | L2+ |
| `/llm-fallback chain <request_type>` | Display configured fallback chain for a request type | L2+ |
| `/llm-fallback test <provider>` | Execute health check probe against a specific provider | L3+ |
| `/llm-fallback override <provider> <status>` | Manually set provider status (force-open or force-close circuit breaker) | L3+ |

## Coordination with LLM Agents

| Agent | Relationship |
|-------|-------------|
| [**llm-model-selector**](/agents/llm-model-selector/) (L4) | Model selection considers provider health for initial routing |
| [**llm-cost-manager**](/agents/llm-cost-manager/) (L4) | Failover cost implications are tracked and reported |
| [**llm-generic-bridge**](/agents/llm-generic-bridge/) (L4) | Provider abstraction layer enables transparent failover |
| [**llm-performance-optimizer**](/agents/llm-performance-optimizer/) (L3) | Latency monitoring contributes to provider health assessment |

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine requires that fallback mechanisms operate correctly and transparently. No LLM request fails silently due to provider outage when fallback options exist. The [NO DOUBTS](/glossary/no-doubts/) principle requires that all failover events are logged with complete context (reason for failover, selected fallback, quality assessment of fallback response), enabling post-incident analysis and provider SLA evaluation.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)