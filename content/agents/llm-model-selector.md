+++
title = "llm-model-selector"
weight = 227
[extra]
domain = "aiad-enhanced"
level = "L4"
description = "Intelligent model selection based on task complexity, quality requirements, cost constraints, and provider availability"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "no-mercy", "no-doubts", "trinity-gate", "nabla-infinity", "otp", "genserver", "telemetry", "ecto"]
domain_normalized = "aiad"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["llm-model-selector", "Intelligent", "agents", "agent", "Prismatic Platform", "AIAD", "Selection"]
tags = ["agents", "agent", "llm-model-selector", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "llm-model-selector - Prismatic Platform"
+++

## Overview

The llm-model-selector is an L4 domain authority agent operating within the [AIAD](/glossary/aiad/)-enhanced domain of the Prismatic Platform. This agent makes intelligent model selection decisions for each LLM request, choosing the optimal model based on task complexity, quality requirements, cost constraints, latency targets, and provider availability. In a platform with access to multiple LLM providers and model tiers (Claude Opus, Claude Sonnet, GPT-4, local Ollama models), selecting the right model for each task is essential for balancing quality, cost, and performance.

Built on the [AIAD](/glossary/aiad/) standard, the llm-model-selector addresses the model selection problem through a multi-criteria decision framework. Using a large, expensive model for every request maximizes quality but incurs unnecessary cost for simple tasks that cheaper models handle equally well. Using the cheapest model for every request minimizes cost but produces unacceptable quality for complex reasoning, code generation, and analysis tasks. The model selector finds the optimal balance by classifying each request's complexity and matching it to the least expensive model that meets the task's quality requirements.

## Selection Architecture

The selection architecture implements a three-phase process: task classification, model matching, and selection validation.

Task classification analyzes the incoming LLM request to determine its complexity level and quality requirements. Classification examines the task type (code generation, analysis, summarization, classification, extraction, conversation), the required output quality (production code, draft analysis, quick answer, exploratory), the input complexity (length, domain specificity, ambiguity level), and any explicit quality annotations provided by the requesting agent. The classifier produces a task profile that captures these dimensions in a machine-processable format.

Model matching compares the task profile against the capability profiles of available models. Each model has a capability profile that records its performance characteristics across task types, measured through periodic benchmarking and continuous quality monitoring. The matching algorithm identifies all models that meet the task's minimum quality threshold, then selects the least expensive option from the qualifying set. When multiple models offer equivalent quality at similar costs, the matcher considers secondary criteria: latency (faster models preferred for interactive tasks), availability (models with current health issues deprioritized), and consistency (models with lower response variance preferred for production tasks).

Selection validation checks the selected model against operational constraints. Budget checks verify that the projected cost of the request falls within the requesting agent's budget allocation (via the [llm-cost-manager](/agents/llm-cost-manager/)). Availability checks verify that the selected model's provider is currently healthy (via the [llm-fallback-coordinator](/agents/llm-fallback-coordinator/)). Rate limit checks verify that the selected provider has sufficient rate limit headroom for the request.

## Key Capabilities

- **Task complexity classification** -- Analyzes LLM request characteristics to determine complexity level and quality requirements, informing model selection
- **Multi-criteria model matching** -- Selects optimal models based on quality, cost, latency, availability, and consistency criteria using configurable weighting
- **Cost-quality optimization** -- Identifies the least expensive model that meets each task's quality requirements, preventing unnecessary use of expensive models
- **Dynamic capability profiling** -- Maintains and updates model capability profiles through periodic benchmarking and continuous quality monitoring
- **Provider health integration** -- Considers real-time provider health data in model selection, avoiding models on unhealthy or rate-limited providers
- **Selection caching** -- Caches selection decisions for repeated task patterns, reducing selection latency for common request types
- **A/B testing support** -- Routes a configurable percentage of requests to alternative models for comparative quality measurement
- **[GenServer](/glossary/genserver/)-based state management** -- Maintains capability profiles and selection state as [OTP](/glossary/otp/) GenServer state
- **[Telemetry integration](/capabilities/telemetry-integration/)** for selection decision tracking and model performance monitoring

## Model Capability Profiles

Each available model maintains a capability profile that records its performance characteristics. Profiles are structured around task categories with per-category metrics.

For code generation tasks, profiles record output correctness rate (percentage of generated code that compiles and passes tests), style compliance rate (percentage of output that matches platform coding standards), and generation latency (time to produce typical code generation responses).

For analysis tasks, profiles record reasoning accuracy (assessed through benchmark analysis tasks with known answers), insight density (useful observations per response), and structured output reliability (percentage of responses that conform to requested output format).

For classification tasks, profiles record classification accuracy, confidence calibration (alignment between stated confidence and actual accuracy), and latency (important for high-throughput classification pipelines).

Profiles are updated through two mechanisms: periodic benchmarking (scheduled execution of standardized tasks with known expected outputs) and continuous monitoring (statistical analysis of production quality signals including user acceptance rates, code review outcomes, and downstream test results).

## Selection Strategies

The model selector supports configurable selection strategies for different operational contexts.

**Quality-first** selects the highest-quality available model regardless of cost. Used for production code generation, security-critical analysis, and formal verification assistance.

**Cost-optimized** selects the cheapest model meeting minimum quality thresholds. Used for development-time assistance, exploratory analysis, and high-volume processing tasks.

**Balanced** applies configurable quality-cost weighting. The default strategy for most platform operations.

**Latency-optimized** selects the fastest model meeting minimum quality thresholds. Used for interactive development assistance and real-time analysis.

**Local-preferred** routes to local Ollama models when their quality meets the task threshold, falling back to cloud models only when local quality is insufficient. Used for cost-sensitive development and offline operation.

## Authority Level

**L4** - Domain Authority - Specialized domain expertise for model selection within the LLM interaction pipeline. The L4 designation reflects the agent's tactical role in making per-request decisions within the strategic framework established by higher-authority agents.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management |
| [llm-generic-bridge](/agents/llm-generic-bridge/) | Capability matrix source for model matching |
| [GenServer](/glossary/genserver/) | OTP-based capability profile and selection state management |
| [Ecto](/glossary/ecto/) | Persistent storage for benchmark results and capability history |
| Prismatic Telemetry | Selection decision [metrics](/glossary/metrics/) and model performance tracking |
| [SEADF](/glossary/seadf/) | Autonomous evolution of classification and matching algorithms |
| AIAD [Registry](/glossary/registry-otp/) | Agent specification and discovery |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/llm-select status` | Display current model selection state and capability profiles | L2+ |
| `/llm-select strategy <name>` | Switch to a named selection strategy | L3+ |
| `/llm-select benchmark` | Execute model capability benchmark suite | L3+ |
| `/llm-select profile <model>` | Display detailed capability profile for a specific model | L2+ |

## Coordination with LLM Agents

| Agent | Relationship |
|-------|-------------|
| [**llm-generic-bridge**](/agents/llm-generic-bridge/) (L4) | Provides capability matrices and provider connection status |
| [**llm-cost-manager**](/agents/llm-cost-manager/) (L4) | Budget constraints inform model selection |
| [**llm-fallback-coordinator**](/agents/llm-fallback-coordinator/) (L3) | Provider health data influences model availability assessment |
| [**llm-performance-optimizer**](/agents/llm-performance-optimizer/) (L3) | Latency data informs model selection for time-sensitive tasks |

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine requires that model selection never produces requests to models that cannot meet the stated quality requirements. No cost optimization bypasses quality minimums. The [NO DOUBTS](/glossary/no-doubts/) principle requires that capability profiles are based on measured performance data, not assumed capabilities. Every profile claim is backed by benchmark or monitoring evidence.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)