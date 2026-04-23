+++
title = "/ollama"
weight = 1290
[extra]
category = "Infrastructure"
description = "Local AI Ollama model management, installation and optimization"
syntax = "/ollama [options]"
authority = "L2+"
agent = "ollama-coordinator"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1103
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ollama", "Local", "commands", "Infrastructure", "Prismatic Platform", "Model", "Subcommand", "PrismaticClaude"]
tags = ["commands", "infrastructure", "ollama", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ollama - Prismatic Platform"
+++

## Overview

**/ollama** is a production command in the **Infrastructure** category of the Prismatic Platform. It provides comprehensive local AI Ollama model management, installation, and optimization, enabling the platform to leverage locally-hosted large language models for development tasks without relying on external API services.

The Prismatic Platform integrates with [Ollama](https://ollama.ai) as a first-class local AI provider, supporting models including qwen3-coder (7B parameters, sub-3-second response), gpt-oss:20b (20B parameters, sub-5-second response), and deepseek-coder (6.7B parameters, sub-3-second response). The `/ollama` command serves as the unified management interface for installing, configuring, monitoring, and optimizing these local models, ensuring that developers maintain productive AI-assisted workflows even in air-gapped environments or when cloud API quotas are exhausted.

Local model execution provides several strategic advantages beyond cost elimination. Response latency is bounded by local hardware rather than network conditions. Sensitive code and prompts never leave the development machine. Model availability is guaranteed regardless of external service status. The `/ollama` command manages these benefits through intelligent model selection, resource optimization, and automatic fallback to cloud providers when local model quality falls below acceptable thresholds.

This command operates under the **L2+** authority level and is executed by the `ollama-coordinator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The command's medium usage frequency reflects its role as a management interface -- typically invoked for configuration and monitoring rather than per-request operations.

## Architecture

The `/ollama` command interfaces with the Ollama runtime through a multi-layered management architecture that handles model lifecycle, performance monitoring, and intelligent routing.

### System Architecture

```
/ollama Command --> Ollama Coordinator Agent
                          |
          +---------------+---------------+
          |               |               |
    Model Manager    Performance      Config
    (install/remove)  Monitor         Manager
          |               |               |
    +-----+-----+   +----+----+     +----+----+
    |     |     |   |    |    |     |    |    |
  Pull  List  Info  Lat  Mem  GPU   Env  Route Fall
  Model Model Model ency Usage Util  Vars  Rules back
          |               |               |
          +---------------+---------------+
                          |
                    Ollama Runtime (localhost:11434)
```

### Core Components

| Component | Module | Responsibility |
|-----------|--------|----------------|
| **Ollama Coordinator** | `PrismaticClaude.OllamaCoordinator` | Central management and orchestration |
| **Model Manager** | `PrismaticClaude.Ollama.ModelManager` | Model installation, removal, updates |
| **Performance Monitor** | `PrismaticClaude.Ollama.PerfMonitor` | Latency, memory, GPU utilization tracking |
| **Config Manager** | `PrismaticClaude.Ollama.ConfigManager` | Environment, routing rules, fallback policies |
| **Health Checker** | `PrismaticClaude.Ollama.HealthChecker` | Ollama service availability verification |
| **Quality Assessor** | `PrismaticClaude.Ollama.QualityAssessor` | Output quality evaluation against benchmarks |

## Usage

### Service Management

```bash
# Check Ollama service status
/ollama status

# Start Ollama service (if not running)
/ollama start

# Restart Ollama service
/ollama restart

# View detailed service information
/ollama info
```

### Model Management

```bash
# List installed models
/ollama models

# Install a recommended model
/ollama install qwen3-coder

# Install with specific quantization
/ollama install deepseek-coder --quantization q4_K_M

# Remove a model
/ollama remove gpt-oss:20b

# Update all models to latest versions
/ollama update --all

# Show model details and capabilities
/ollama info qwen3-coder
```

### Configuration

```bash
# View current configuration
/ollama config

# Set default model for code generation
/ollama config --default-model qwen3-coder

# Configure GPU layers for optimal performance
/ollama config --gpu-layers 35

# Set memory limit
/ollama config --memory-limit 8GB

# Configure context window
/ollama config --context-size 8192

# Set automatic cloud fallback threshold
/ollama config --fallback-threshold 0.85
```

### Performance Operations

```bash
# Run performance benchmark
/ollama test

# Optimize model for current hardware
/ollama optimize

# Monitor real-time performance
/ollama monitor --interval 5s

# Generate performance report
/ollama report --format markdown
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | Subcommand | - | Check Ollama service status and health |
| `models` | Subcommand | - | List installed models with metadata |
| `install` | Subcommand | - | Install a new model from Ollama registry |
| `remove` | Subcommand | - | Remove an installed model |
| `update` | Subcommand | - | Update models to latest versions |
| `config` | Subcommand | - | View or modify configuration |
| `test` | Subcommand | - | Run performance benchmarks |
| `optimize` | Subcommand | - | Optimize model configuration for hardware |
| `monitor` | Subcommand | - | Real-time performance monitoring |
| `--quantization` | Enum | Auto | Model quantization: `q4_0`, `q4_K_M`, `q5_K_M`, `q8_0`, `f16` |
| `--gpu-layers` | Integer | Auto | Number of layers offloaded to GPU |
| `--memory-limit` | String | `8GB` | Maximum memory allocation |
| `--context-size` | Integer | `4096` | Context window size in tokens |
| `--default-model` | String | `qwen3-coder` | Default model for unspecified requests |
| `--fallback-threshold` | Float | `0.85` | Quality score below which cloud fallback triggers |
| `--interval` | Duration | `10s` | Monitoring poll interval |
| `--all` | Boolean | `false` | Apply operation to all models |

## Execution Flow

**Phase 1 -- Service Verification** (0-2s): The command verifies that the Ollama runtime is accessible at `localhost:11434`. If the service is not running and the subcommand requires it, the command provides instructions for starting the service or can attempt automatic startup with `--auto-start`.

**Phase 2 -- Subcommand Dispatch** (2-5s): Based on the specified subcommand, the Ollama Coordinator delegates to the appropriate management component. Model operations go to the Model Manager, configuration changes to the Config Manager, and performance operations to the Performance Monitor.

**Phase 3 -- Operation Execution** (5s-variable): The delegated component executes the requested operation. Model installations involve pulling from the Ollama registry, which can take several minutes depending on model size and network speed. Configuration changes are applied immediately. Performance benchmarks run a standardized test suite against the target model.

**Phase 4 -- Validation** (variable): After execution, the command validates the result. Model installations verify that the model responds correctly to test prompts. Configuration changes verify that the new settings are accepted by the Ollama runtime. Performance benchmarks validate that results fall within expected ranges.

**Phase 5 -- Reporting** (1-2s): A summary of the operation is displayed, including any warnings or recommendations. For performance operations, this includes latency statistics, memory utilization, and quality assessment scores.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Managed by `ollama-coordinator` agent |
| [AIAD Registry](/glossary/aiad/) | Discovery | Registered command with AIAD metadata |
| [Quality Gates](/glossary/quality-gates/) | Quality assessment | Output quality validation against benchmarks |
| [Telemetry](/glossary/telemetry/) | Observability | Model performance [metrics](/glossary/metrics/) and usage stats |
| LLM Router | Routing | Local models as routing targets in multi-provider setup |
| Claude Code | Fallback | Cloud AI fallback when local quality insufficient |
| Environment Config | Configuration | `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL` env vars |

## Best Practices

**Model Selection**: Choose models based on task requirements. Use `qwen3-coder` (7B) for fast code completion and simple queries. Use `deepseek-coder` (6.7B) for code-specific tasks requiring deeper understanding. Reserve `gpt-oss:20b` (20B) for complex reasoning tasks where quality outweighs latency.

**Quantization Trade-offs**: Lower quantization (q4_0) reduces memory usage and increases speed at the cost of output quality. Higher quantization (q8_0, f16) preserves quality but requires more memory and GPU resources. The default `q4_K_M` provides the best balance for most development tasks.

**Memory Management**: Monitor memory usage with `/ollama monitor`. Models should not exceed 80% of available system memory. If memory pressure is detected, consider using smaller models or lower quantization levels.

**Fallback Configuration**: Set the fallback threshold appropriately for your workflow. A threshold of 0.85 means that if local model output quality drops below 85% of expected quality, the system automatically routes to cloud providers. Lower thresholds tolerate more quality variation; higher thresholds trigger cloud fallback more frequently.

**Regular Updates**: Run `/ollama update --all` weekly to keep models at their latest versions. Model improvements can significantly impact output quality and performance.

## Error Handling

| Error Condition | Handling Strategy | User Impact |
|----------------|-------------------|-------------|
| Ollama service not running | Clear instructions for service startup | Command does not execute model operations |
| Model not found in registry | Suggest closest matching models | Installation fails with suggestions |
| Insufficient disk space | Report required space and available space | Installation blocked |
| GPU memory exhaustion | Automatic CPU fallback with warning | Slower response times |
| Model download interrupted | Automatic resume from last checkpoint | Extended installation time |
| Quality below threshold | Automatic cloud fallback triggered | Transparent routing change |

## Advanced Usage

### Multi-Model Routing

Configure intelligent routing between multiple local models based on task type:

```bash
# Configure routing rules
/ollama config --route "code-completion -> qwen3-coder"
/ollama config --route "code-review -> deepseek-coder"
/ollama config --route "reasoning -> gpt-oss:20b"

# View routing table
/ollama config --show-routes
```

### Custom Model Creation

Create fine-tuned models from Modelfiles:

```bash
# Create model from Modelfile
/ollama create prismatic-coder --modelfile ./Modelfile.prismatic

# Test custom model
/ollama test prismatic-coder --benchmark code-quality
```

### Hardware Profiling

Automatically determine optimal configuration for current hardware:

```bash
# Full hardware profile and auto-configuration
/ollama optimize --auto-configure --benchmark-all

# Profile specific model
/ollama optimize --model qwen3-coder --profile gpu-memory
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Model installations must complete fully or not at all. Configuration changes must be validated before acceptance. Quality assessments must meet minimum thresholds or trigger fallback.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Performance benchmarks provide quantitative evidence for model selection decisions. Quality thresholds are based on measured output quality, not assumptions. Fallback decisions are data-driven.

## Related Commands

- [/local-llm](/commands/local-llm/) - Execute LLM requests using local providers with zero API cost
- [/llm](/commands/llm/) - Primary LLM operation management and orchestration
- [/openrouter](/commands/openrouter/) - OpenRouter LLM provider operations and management
- [/chatgpt-bridge](/commands/chatgpt-bridge/) - ChatGPT bridge operations for cross-LLM coordination
- [/gardener](/commands/gardener/) - [GARDEN](/glossary/garden/) legacy knowledge repository management across 116 repos
- [/connect](/commands/connect/) - MCP server connection management across 14+ servers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)