+++
title = "Ollama Coordinator"
weight = 278
[extra]
domain = "infrastructure"
level = "L3"
description = "Manages local Ollama models for autonomous AI development with model lifecycle, quality gates, and cloud fallback"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ets", "dynamic-supervisor", "circuit-breaker", "umbrella-application", "postgresql", "aiad"]
domain_normalized = "infrastructure"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2150
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Ollama", "Coordinator", "Manages", "agents", "agent", "Prismatic Platform", "Model"]
tags = ["agents", "agent", "ollama-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Ollama Coordinator - Prismatic Platform"
+++

## Overview

The [Ollama](@/glossary/ollama.md) Coordinator operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's infrastructure domain, managing the lifecycle, deployment, and quality assurance of local AI models through the Ollama runtime. In a platform built on autonomous agent intelligence, access to large language models (LLMs) is a foundational capability. The Ollama Coordinator ensures that local models are available, performant, and meeting quality standards, while providing transparent fallback to cloud-based models when local capabilities are insufficient. This hybrid local-cloud architecture provides cost efficiency, latency reduction, privacy preservation, and operational resilience.

Built on the [AIAD](@/glossary/aiad.md) standard and implemented as an [OTP](@/glossary/otp.md) application with a [GenServer](@/glossary/genserver.md) core and [supervision tree](@/glossary/supervision-tree.md) for fault tolerance, the coordinator manages three primary model tiers: **qwen3-coder** (7B parameters, sub-3-second response, optimized for code generation), **gpt-oss:20b** (20B parameters, sub-5-second response, balanced general capability), and **deepseek-coder** (6.7B parameters, sub-3-second response, specialized for code analysis). Each model is continuously monitored for availability, response quality, and resource consumption. The [NO DOUBTS](@/glossary/no-doubts.md) principle governs model selection: the coordinator selects models based on measured quality metrics for the specific task type rather than static preference orderings.

## Theoretical Foundations

Local LLM management draws from model serving infrastructure design, quality-of-service optimization, and multi-model routing theory. The coordinator implements a model routing framework inspired by load balancer algorithms but extended with quality-awareness: routing decisions consider not only model availability and response latency but also measured output quality for the specific task type being requested.

The quality evaluation framework uses automated metrics including BLEU score for code generation accuracy, AST validity for syntactic correctness, and task-specific evaluation rubrics for analytical outputs. These automated metrics are calibrated against human evaluation benchmarks to ensure they correlate with actual output utility. When automated quality scores fall below configured thresholds, the coordinator routes requests to higher-capability models or triggers cloud fallback.

The fallback architecture follows a cascade pattern: requests first attempt the preferred local model, fall back to alternative local models if the preferred model is unavailable or degraded, and escalate to cloud models only when no local model can meet quality requirements. This cascade minimizes cloud API costs and latency while ensuring that quality is never compromised by local model limitations.

## Operational Domain

The infrastructure domain for Ollama coordination covers all aspects of local LLM lifecycle management. The coordinator handles model download and installation, version management, GPU/CPU resource allocation, context window configuration, and runtime performance monitoring. The domain also encompasses the routing logic that dispatches LLM requests from platform agents to appropriate models and the quality gate infrastructure that validates model outputs.

Model state is maintained in [ETS](@/glossary/ets.md) tables that track per-model health metrics including availability status, current load, average response latency, error rate, and quality score history. The coordinator publishes model status through the platform's [telemetry](@/glossary/telemetry.md) infrastructure, enabling other agents to factor model availability into their operational planning.

## Key Capabilities

- **Model lifecycle management** -- Manages the complete lifecycle of local Ollama models including installation, version updates, configuration tuning, and decommissioning, ensuring that available models meet current platform requirements
- **Quality-aware routing** -- Routes LLM requests to the model best suited for the specific task type based on measured quality metrics, response latency, and current availability, optimizing for output quality within latency constraints
- **Cloud fallback management** -- Implements transparent fallback to cloud-based models (via Anthropic API) when local models cannot meet quality or availability requirements, with [circuit breaker](@/glossary/circuit-breaker.md) protection against cloud service failures
- **Resource optimization** -- Monitors and optimizes GPU/CPU resource allocation across active models, managing memory consumption below 8GB target, ensuring greater than 99% uptime, and maintaining sub-3-second response times
- **Quality gate enforcement** -- Validates model outputs against task-specific quality criteria before delivering results to requesting agents, rejecting outputs that fall below accuracy thresholds
- **Performance benchmarking** -- Runs periodic benchmark suites against all active models, tracking quality and performance trends that inform routing decisions and identify model degradation
- **Model configuration optimization** -- Tunes model parameters including temperature, top-p, context window size, and batch configuration based on observed performance characteristics and task requirements
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with self-directed model health monitoring and automatic remediation for degraded models
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** publishing model metrics including availability, latency distributions, quality scores, resource utilization, and fallback frequency

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to manage local model deployments, configure routing policies, and trigger cloud fallback when local capabilities are insufficient.

## Model Routing Architecture

The routing architecture implements a three-stage decision pipeline. The **classification stage** analyzes the incoming request to determine the task type (code generation, code analysis, natural language processing, structured data extraction) and quality requirements. The **selection stage** evaluates available models against the classified requirements, considering quality history for the specific task type, current load, and response latency. The **execution stage** dispatches the request to the selected model, monitors execution, and validates the output against quality gates.

If the selected model's output fails quality validation, the request is automatically re-routed to the next-best model. If all local models fail, cloud fallback is activated. The [circuit breaker](@/glossary/circuit-breaker.md) pattern prevents repeated attempts against models that are consistently failing, automatically routing around degraded models until health checks confirm recovery.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/ollama status` | Display status of all managed models with health metrics | L3+ |
| `/ollama models` | List available models with quality scores and capability profiles | L3+ |
| `/ollama install` | Install or update a specified model | L3+ |
| `/ollama config` | View or modify model configuration parameters | L3+ |
| `/ollama test` | Run quality benchmark suite against specified models | L3+ |
| `/ollama optimize` | Trigger resource optimization cycle | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [openrouter-llm-specialist](@/agents/openrouter-llm-specialist.md) | Cloud model routing partner for hybrid local-cloud architecture |
| [network-security-specialist](@/agents/network-security-specialist.md) | Ensures Ollama API endpoint security and access control |
| [performance-benchmarking-agent](@/agents/performance-benchmarking-agent.md) | Model benchmarks contribute to platform-wide performance tracking |
| [neuroevolution-coordinator](@/agents/neuroevolution-coordinator.md) | Model quality trends inform evolutionary fitness criteria |

## Resource Management

The coordinator manages resource allocation to prevent local models from impacting platform operations. Memory consumption is capped at 8GB per model instance with soft limits that trigger model unloading before hard limits are reached. GPU utilization is monitored and balanced across active model instances. The coordinator implements a least-recently-used (LRU) model eviction policy for memory management when multiple models compete for limited GPU memory, keeping frequently-used models resident while evicting idle models.

## Enforcement

Model management follows the [NO MERCY](@/glossary/no-mercy.md) doctrine: no model output is delivered without quality validation, no degraded model remains in the routing pool without remediation, and quality metrics are enforced without exception. The [NO DOUBTS](@/glossary/no-doubts.md) principle ensures that routing decisions are grounded in measured quality data, and the [Trinity Gate](@/glossary/trinity-gate.md) validates that model outputs maintain structural, logical, and formal consistency with platform requirements.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)