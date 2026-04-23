+++
title = "/chatgpt-workflow"
weight = 260
[extra]
category = "Development"
description = "Multi-step workflow coordination across AI assistants"
syntax = "/chatgpt-workflow [options]"
authority = "L2+"
agent = "chatgpt-bridge"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1287
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-workflow", "Multi-step", "commands", "Development", "Prismatic Platform", "Workflow", "Ollama", "AIAD"]
tags = ["commands", "development", "chatgpt-workflow", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/chatgpt-workflow - Prismatic Platform"
+++

## Overview

**/chatgpt-workflow** is a production command in the **Development** category of the Prismatic Platform that orchestrates multi-step workflow coordination across heterogeneous AI assistants. Rather than relying on a single language model for every stage of a complex task, this command decomposes workflows into discrete steps and routes each step to the most capable assistant available, whether that is a local [Ollama](/glossary/ollama/) model, a cloud-hosted Claude instance, or a ChatGPT session accessible through the platform's bridge infrastructure.

This command operates under the **L2+** authority level and is executed by the `chatgpt-bridge` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The workflow engine supports sequential, parallel, and conditional step execution, with full provenance tracking to satisfy the platform's [NABLA](/glossary/nabla-infinity/) epistemic requirements.

Cross-assistant workflow coordination addresses a fundamental limitation of single-model interactions: no single LLM excels at every task. Code generation, creative writing, data analysis, and formal reasoning each benefit from different model strengths. The `/chatgpt-workflow` command allows operators to define workflows that leverage these complementary capabilities while maintaining a unified execution context and audit trail.

## Architecture

The command is built on a multi-layer architecture that separates workflow definition from execution orchestration.

### Workflow Definition Layer

Workflows are defined as directed acyclic graphs (DAGs) of steps, where each step specifies its target assistant, input transformation, output extraction, and dependency relationships. The definition layer validates workflow structure before execution begins, preventing cycles and ensuring all dependencies are satisfiable.

### Execution Orchestration Layer

The orchestration layer manages step scheduling, context propagation, and result aggregation. It maintains a shared context object that accumulates results from completed steps, making them available to downstream steps through template interpolation.

### Bridge Communication Layer

Each supported assistant type has a dedicated bridge adapter that handles protocol-specific communication. The ChatGPT bridge uses session-based HTTP interaction, the Claude bridge uses the Anthropic API, and the Ollama bridge communicates with locally running model instances.

| Layer | Responsibility | Implementation |
|-------|---------------|----------------|
| **Definition** | Workflow DAG validation | `WorkflowDefinition` module |
| **Orchestration** | Step scheduling and context | `WorkflowOrchestrator` GenServer |
| **Bridge** | Assistant-specific communication | `BridgeAdapter` behaviour |
| **Provenance** | Audit trail and lineage tracking | `ProvenanceTracker` module |
| **Telemetry** | Execution metrics and events | `:telemetry` integration |

## Usage

```bash
# Execute a predefined workflow
/chatgpt-workflow --workflow=code-review-pipeline

# Run a workflow with custom parameters
/chatgpt-workflow --workflow=research-synthesis --params='{"topic": "quantum computing"}'

# Execute with explicit assistant routing
/chatgpt-workflow --workflow=multi-model-analysis --route="step1:ollama,step2:claude,step3:chatgpt"

# Dry run to validate workflow structure
/chatgpt-workflow --workflow=deployment-checklist --dry-run

# Resume a previously interrupted workflow
/chatgpt-workflow --resume=workflow_id_abc123

# List available workflow definitions
/chatgpt-workflow --list
```

### Workflow Definition Example

```yaml
name: code-review-pipeline
description: Multi-assistant code review with synthesis
steps:
  - id: analyze_structure
    assistant: ollama
    model: qwen3-coder
    prompt: "Analyze the structural patterns in this code: {{input}}"

  - id: security_review
    assistant: claude
    prompt: "Perform a security-focused code review: {{input}}"
    depends_on: []

  - id: synthesize
    assistant: chatgpt
    prompt: |
      Synthesize these two reviews into actionable recommendations:
      Structure: {{analyze_structure.output}}
      Security: {{security_review.output}}
    depends_on: [analyze_structure, security_review]
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--workflow` | string | required | Workflow definition name or path |
| `--params` | JSON | `{}` | Parameters passed to workflow template |
| `--route` | string | auto | Manual assistant routing overrides |
| `--dry-run` | flag | false | Validate workflow without executing |
| `--resume` | string | none | Resume interrupted workflow by ID |
| `--list` | flag | false | List available workflow definitions |
| `--timeout` | integer | 300 | Per-step timeout in seconds |
| `--parallel` | integer | 3 | Maximum parallel step execution |
| `--verbose` | flag | false | Show detailed step-by-step output |
| `--output` | string | stdout | Output file path for results |
| `--format` | string | text | Output format: text, json, markdown |
| `--context` | string | none | Initial context file to load |

## Execution Flow

The workflow execution follows a well-defined lifecycle that ensures reliability and traceability.

1. **Definition Loading**: The workflow definition is loaded from the AIAD registry or a local file path. The definition is parsed and validated for structural correctness, including cycle detection in the dependency graph.

2. **Parameter Binding**: User-provided parameters are bound to the workflow template. Missing required parameters cause immediate failure with descriptive error messages.

3. **Dependency Resolution**: The step dependency graph is topologically sorted to determine execution order. Steps with no dependencies are identified as initial candidates for parallel execution.

4. **Step Scheduling**: The orchestrator schedules steps for execution based on dependency satisfaction and the configured parallelism limit. Independent steps execute concurrently.

5. **Bridge Dispatch**: Each scheduled step is dispatched to its target assistant through the appropriate bridge adapter. The bridge handles connection management, request formatting, and response parsing.

6. **Result Collection**: Step outputs are collected and stored in the shared context. The provenance tracker records the assistant used, timestamps, token counts, and confidence metadata.

7. **Context Propagation**: Completed step results are made available to downstream steps through template interpolation in the shared context object.

8. **Synthesis and Output**: After all steps complete, the final outputs are aggregated according to the workflow definition and formatted for presentation.

```
Definition Loading -> Parameter Binding -> Dependency Resolution
         |                                          |
         v                                          v
  Validation Gate                          Topological Sort
         |                                          |
         v                                          v
  Step Scheduling <--- Context Propagation <--- Result Collection
         |                                          ^
         v                                          |
  Bridge Dispatch -----> Assistant Execution --------+
```

## Integration Points

This command integrates with the following platform components.

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `chatgpt-bridge` agent | Agent manages bridge connections and session lifecycle |
| [AIAD Registry](/glossary/aiad/) | Command and workflow specification | Workflow definitions stored as AIAD artifacts |
| [Quality Gates](/glossary/quality-gates/) | Pre/post execution validation | Workflow outputs validated against quality criteria |
| [Telemetry](/glossary/telemetry/) | Execution [metrics](/glossary/metrics/) | Step timing, token usage, and success rates tracked |
| [NABLA Framework](/glossary/nabla-infinity/) | Epistemic provenance | Signal plurality enforced across multi-assistant outputs |
| [Ollama](/glossary/ollama/) | Local LLM bridge | Zero-cost local model execution for suitable steps |
| [Session Lifecycle](/glossary/session-discipline/) | Context persistence | Workflow state survives session boundaries |

## Best Practices

Effective use of the `/chatgpt-workflow` command requires understanding both the strengths of individual assistants and the overhead of cross-assistant coordination.

**Design for independence.** Structure workflow steps to be as independent as possible. Steps that can execute in parallel reduce total workflow time significantly. Reserve sequential dependencies for cases where a later step genuinely requires the output of an earlier one.

**Choose assistants deliberately.** Route computationally intensive or code-heavy tasks to specialized models. Use larger models for synthesis and reasoning steps. Local Ollama models are ideal for high-volume, low-complexity steps where latency and cost matter.

**Keep prompts self-contained.** Each step's prompt should contain sufficient context to produce a meaningful result, even if the assistant has no knowledge of the broader workflow. Template interpolation provides previous step outputs, but the prompt framing should not assume conversational context.

**Set appropriate timeouts.** Different assistants and models have vastly different response times. Configure per-step timeouts that reflect the expected complexity and the target assistant's typical performance.

**Use dry-run before production.** Always validate new workflow definitions with `--dry-run` before executing them against live assistants. This catches structural errors, missing dependencies, and template interpolation issues without consuming API tokens.

**Monitor token budgets.** Multi-step workflows that propagate context between steps can accumulate significant token counts. Use output extraction to pass only relevant portions of step results to downstream steps.

## Error Handling

The command implements comprehensive error handling at every layer of the execution stack.

| Error Category | Detection | Recovery Strategy |
|---------------|-----------|-------------------|
| **Bridge Connection Failure** | Connection timeout or HTTP error | Retry with exponential backoff (3 attempts) |
| **Assistant Rate Limiting** | HTTP 429 or equivalent | Automatic delay and retry with jitter |
| **Step Timeout** | Exceeds configured per-step timeout | Mark step as failed, propagate to dependents |
| **Invalid Workflow Definition** | DAG validation failure | Immediate rejection with structural diagnostics |
| **Template Interpolation Error** | Missing context variable | Fail step with descriptive missing-variable message |
| **Partial Workflow Failure** | One or more steps fail | Checkpoint state for resume, report partial results |

When a step fails, all steps that depend on it are automatically cancelled. The workflow state is checkpointed so that the operator can fix the issue and resume from the last successful checkpoint using `--resume`.

```bash
# Check status of a failed workflow
/chatgpt-workflow --status=workflow_id_abc123

# Resume after fixing the issue
/chatgpt-workflow --resume=workflow_id_abc123 --skip-failed
```

## Advanced Usage

### Custom Bridge Adapters

The command supports custom bridge adapters for assistants not natively supported by the platform. Custom adapters implement the `BridgeAdapter` behaviour and register with the workflow engine.

```elixir
defmodule MyCustomBridge do
  @behaviour PrismaticAgents.BridgeAdapter

  @impl true
  def connect(config), do: {:ok, %{session: nil}}

  @impl true
  def send_message(state, prompt), do: {:ok, "response", state}

  @impl true
  def disconnect(state), do: :ok
end
```

### Conditional Step Execution

Workflows can include conditional steps that execute only when previous step outputs meet specified criteria.

```yaml
steps:
  - id: check_complexity
    assistant: ollama
    prompt: "Rate complexity 1-10: {{input}}"

  - id: deep_analysis
    assistant: claude
    prompt: "Perform deep analysis: {{input}}"
    condition: "{{check_complexity.output}} > 7"
```

### Workflow Composition

Complex workflows can compose simpler workflows as sub-workflows, enabling reuse of proven workflow patterns across different operational contexts.

```bash
/chatgpt-workflow --workflow=master-pipeline --sub-workflows="review:code-review,test:test-gen"
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every workflow step must complete successfully or the entire workflow fails with full diagnostics.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Multi-assistant outputs are cross-validated to ensure signal plurality per NABLA requirements.

## Related Commands

- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/test](/commands/test/) - Comprehensive test generation and verification
- [/llm](/commands/llm/) - Primary LLM operation management and orchestration
- [/local-llm](/commands/local-llm/) - Execute LLM requests using local providers with zero API cost
- [/chatgpt-bridge](/commands/chatgpt-bridge/) - ChatGPT bridge operations for cross-LLM coordination
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)