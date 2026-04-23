+++
title = "Prismatic Ollama"
weight = 25
[extra]
icon = "sparkles"
color = "emerald"
description = "Local AI integration with Ollama for sovereign, on-premise language model inference"
category = "AI"
files = "185"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 710
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Ollama", "Local", "apps", "Prismatic Platform", "Auto", "Quality Gate", "NABLA", "Response Time"]
tags = ["apps", "ai", "prismatic-ollama", "prismatic"]
quality_score = 70
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Ollama - Prismatic Platform"
+++

## Overview

Prismatic [Ollama](/glossary/ollama/) provides the platform's local AI [inference](/glossary/inference/) capability through integration with Ollama. It enables sovereign, on-premise language model usage without sending data to external cloud providers. The module manages model lifecycle, request routing, response processing, and quality gate enforcement for AI-generated outputs.

Data sovereignty is a fundamental requirement for intelligence platforms handling sensitive [OSINT](/glossary/osint/), legal, and financial data. Prismatic Ollama ensures that no query or context data leaves the organization's infrastructure during AI-assisted analysis. Combined with the platform's [NABLA](/glossary/nabla-infinity/) epistemic framework, it provides AI capabilities where outputs are treated as signals requiring the same [confidence scoring](/glossary/confidence-scoring/), [provenance tracking](/glossary/provenance-mandatory/), and multi-source validation as any other intelligence source.

## Model Management

### Coordinator Agent

The Ollama Coordinator Agent ([AIAD](/glossary/aiad/)-compliant) manages the full model lifecycle:

```
Model Discovery --> Health Check --> Load/Unload --> Request Routing --> Quality Gate
      |                |                |                 |                  |
   ollama list     Memory check     Memory-aware      Best model for     Pass/fail
   API call        + latency test   scheduling         task type          + fallback
```

| Coordinator Function | Description | Automation |
|---------------------|-------------|------------|
| **Auto-Discovery** | Detect available models on startup | Startup hook |
| **Health Monitoring** | Periodic latency and accuracy testing | Every 60s |
| **Memory Management** | Load/unload models based on memory pressure | Threshold-based |
| **Version Tracking** | Track model versions, trigger re-evaluation on update | On model pull |
| **Failover** | Automatic cloud fallback when local models unavailable | [Circuit breaker](/glossary/circuit-breaker/) |

### Model Registry

```elixir
# Check available models and their status
{:ok, models} = PrismaticOllama.list_models()

[
  %{name: "qwen3-coder", size: "7B", status: :loaded, memory_mb: 7200,
    capabilities: [:code_generation, :code_review, :refactoring]},
  %{name: "gpt-oss:20b", size: "20B", status: :available, memory_mb: 15800,
    capabilities: [:general_intelligence, :analysis, :summarization]},
  %{name: "deepseek-coder", size: "6.7B", status: :loaded, memory_mb: 6900,
    capabilities: [:code_analysis, :bug_detection, :documentation]}
]
```

### Supported Models

| Model | Size | Response Time | Memory | Primary Use | Accuracy |
|-------|------|--------------|--------|-------------|----------|
| **qwen3-coder** | 7B | < 3s | < 8GB | Code generation, review | > 85% |
| **gpt-oss:20b** | 20B | < 5s | < 16GB | General intelligence, analysis | > 90% |
| **deepseek-coder** | 6.7B | < 3s | < 8GB | Code analysis, bug detection | > 85% |

## Cloud Fallback Architecture

When local models are unavailable or insufficient for a task, the coordinator transparently routes to cloud providers:

```
Request --> Local Model Available? --> YES --> Local Inference --> Quality Gate --> Result
                    |
                    NO (or quality gate fails)
                    |
            Cloud Fallback --> Cloud API --> Quality Gate --> Result
                    |
            Circuit Breaker monitors failure rate
```

| Fallback Trigger | Condition | Recovery |
|-----------------|-----------|----------|
| **Model Unavailable** | Ollama not running or model not pulled | Auto-pull attempt, then cloud |
| **Memory Pressure** | System memory > 90% | Unload model, use cloud |
| **Quality Gate Failure** | Local output below quality threshold | Retry with cloud model |
| **Timeout** | Response time exceeds 30s | Cancel local, route to cloud |
| **Repeated Failures** | 3+ consecutive failures | Circuit breaker opens for 60s |

### Cloud Provider Configuration

```elixir
# Cloud fallback configuration
config :prismatic_ollama, :cloud_fallback,
  enabled: true,
  providers: [
    %{name: :anthropic, model: "claude-sonnet-4-20250514", priority: 1},
    %{name: :openai, model: "gpt-4o", priority: 2}
  ],
  circuit_breaker: %{
    failure_threshold: 3,
    reset_timeout_ms: 60_000
  }
```

## Inference Pipeline

### Request Processing

```elixir
# Structured prompt with variable injection
{:ok, code} = PrismaticOllama.generate("Write an Elixir GenServer for rate limiting",
  model: "qwen3-coder",
  template: :code_generation,
  variables: %{language: "Elixir", pattern: "GenServer"},
  max_tokens: 2000,
  temperature: 0.3
)

# Code analysis with quality scoring
{:ok, analysis} = PrismaticOllama.analyze(source_code,
  model: "deepseek-coder",
  task: :quality_review,
  criteria: [:credo_compliance, :otp_patterns, :typespec_coverage]
)

# Structured entity extraction
{:ok, entities} = PrismaticOllama.extract(text,
  model: "gpt-oss:20b",
  schema: %{
    entities: [%{name: :string, type: :enum, confidence: :float}],
    relationships: [%{source: :string, target: :string, type: :string}]
  }
)
```

### Pipeline Stages

| Stage | Function | Implementation |
|-------|----------|---------------|
| **Template Resolution** | Apply prompt template with variables | ETS-cached templates |
| **Model Selection** | Choose best model for task type | Capability matching + load balancing |
| **Request Dispatch** | Send to Ollama HTTP API | Finch HTTP client with streaming |
| **Response Parsing** | Extract structured data from output | Schema-guided parsing with fallback |
| **Quality Gate** | Validate output meets quality standards | Task-specific validation rules |
| **Result Caching** | Cache results for identical prompts | Content-hash based with TTL |

## Quality Gate Enforcement

AI-generated outputs are treated as untrusted signals requiring validation:

| Quality Check | Description | Failure Action |
|--------------|-------------|---------------|
| **Schema Compliance** | Output matches expected structure | Retry with stricter prompt |
| **Factual Grounding** | Claims reference verifiable data | Flag as ungrounded |
| **Code Compilation** | Generated code compiles without errors | Retry with error context |
| **[Credo](/glossary/credo/) Compliance** | Generated code passes Credo strict | Auto-fix or retry |
| **Confidence Scoring** | AI self-reported confidence meets threshold | Route to larger model or cloud |
| **[NABLA](/glossary/nabla-infinity/) Integration** | Output treated as signal, not truth | [Signal Plurality](/glossary/signal-plurality/) requirement |

### NABLA Epistemic Integration

AI outputs are integrated into the [belief graph](/glossary/belief-graph/) as signals with explicit provenance:

```elixir
# AI output registered as NABLA signal
signal = %{
  source: :ollama,
  model: "qwen3-coder",
  model_version: "2024.11",
  confidence: 0.82,  # Model-assessed confidence
  provenance: %{
    prompt_hash: "sha256:...",
    model_id: "qwen3-coder:latest",
    inference_time_ms: 2340,
    temperature: 0.3
  }
}
```

## Performance Metrics

| Metric | Target | Current | Measurement |
|--------|--------|---------|-------------|
| **Response Time (7B)** | < 3s | 2.1s avg | [Telemetry](/glossary/telemetry/) p50 |
| **Response Time (20B)** | < 5s | 4.2s avg | Telemetry p50 |
| **Memory Usage** | < 8GB per 7B model | 7.2GB | `:erlang.memory/0` |
| **Uptime** | > 99% | 99.7% | Health check monitoring |
| **Quality Gate Pass Rate** | > 85% | 88% | Gate telemetry |
| **Cloud Fallback Rate** | < 5% | 2.3% | Routing telemetry |

## Architecture

```
Request --> Prompt Template --> Model Selector --> Ollama API --> Response Parser --> Quality Gate --> Result
              |                    |                  |               |                 |
         Variable           Capability +          HTTP/Stream     Structured       Pass/Fail
         Injection          Load Balance          via Finch       Extraction       + Fallback
```

| Component | Implementation |
|-----------|---------------|
| **Coordinator** | GenServer with ETS-backed model registry |
| **HTTP Client** | Finch with connection pooling and streaming |
| **Templates** | ETS-cached prompt templates with hot reload |
| **Quality Gates** | Configurable validation pipeline per task type |
| **[Circuit Breaker](/glossary/circuit-breaker/)** | Auto-opens after 3 failures, resets after 60s |
| **Telemetry** | Full event coverage for inference, quality, routing |

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| **[Prismatic MCP](/apps/prismatic-mcp/)** | MCP tools use Ollama for local AI operations |
| **[Prismatic Agents](/apps/prismatic-agents/)** | Agent AI capabilities backed by local inference |
| **[Prismatic Nabla](/apps/prismatic-nabla/)** | AI outputs as [NABLA](/glossary/nabla-infinity/)-managed signals |
| **[Prismatic Claude](/apps/prismatic-claude/)** | Cloud fallback through Claude integration |
| **[Prismatic Quality Intelligence](/apps/prismatic-quality-intelligence/)** | AI-assisted quality analysis |

## Related Components

- [Prismatic MCP](/apps/prismatic-mcp/) - Model Context [Protocol](/glossary/protocol/) server
- [Prismatic Claude](/apps/prismatic-claude/) - Claude AI integration (cloud)
- [Prismatic Agents](/apps/prismatic-agents/) - Agent runtime with AI capabilities
- [Prismatic Web](/apps/prismatic-web/) - [LiveView](/glossary/liveview/) dashboards
- [Prismatic API](/apps/prismatic-api/) - REST [API gateway](/glossary/api-gateway/)

## Related Agents

- [Evolution Orchestrator Supreme](/agents/evolution-orchestrator-supreme/) -- Drives model selection and quality gate evolution for AI inference
- [Cross-Pollination Specialist](/agents/cross-pollination-specialist/) -- Transfers AI capabilities across code generation, analysis, and extraction domains
- [ChatGPT Analyze](/agents/chatgpt-analyze/) -- AI-assisted analysis patterns adapted for local Ollama inference

## Related Capabilities

- [NABLA Axioms](/capabilities/nabla-axioms/) -- AI outputs treated as signals with provenance tracking and confidence scoring
- [Multi-Paradigm Solving](/capabilities/multi-paradigm-solving/) -- Multiple model capabilities (code, analysis, extraction) unified in single pipeline
- [Autonomous Self-Healing](/capabilities/autonomous-self-healing/) -- Automatic cloud fallback when local models are unavailable or fail quality gates

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)