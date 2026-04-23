+++
title = "llm-zed-adapter"
weight = 232
[extra]
domain = "aiad-enhanced"
level = "L4"
description = "Zed extension LLM coordination with native integration"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "no-mercy", "no-doubts", "trinity-gate", "nabla-infinity", "otp", "genserver", "telemetry"]
domain_normalized = "aiad"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["llm-zed-adapter", "extension", "coordination", "native", "integration", "agents", "agent", "Prismatic Platform", "Elixir"]
tags = ["agents", "agent", "llm-zed-adapter", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "llm-zed-adapter - Prismatic Platform"
+++

## Overview

The LLM Zed Adapter operates as an L4 domain specialist within the AIAD-Enhanced domain of the Prismatic Platform. This agent provides native integration between the Prismatic LLM infrastructure and the Zed code editor, enabling developers to access the platform's multi-provider LLM capabilities directly from their editing environment. The adapter translates Zed's extension API requests into Prismatic LLM pipeline calls, applying the same routing, quality validation, and cost optimization that governs all platform LLM operations.

Modern development workflows increasingly integrate LLM assistance directly into code editors. The Zed editor provides a high-performance, extensible editing environment with native LLM support through its extension API. The LLM Zed Adapter bridges Zed's extension protocol with Prismatic's LLM routing infrastructure, giving developers access to [Ollama](@/glossary/ollama.md) local models, Claude, and OpenRouter through Zed's familiar inline assist, code generation, and chat interfaces. Every request through this adapter benefits from Prismatic's intelligent routing, cost tracking, and quality validation.

## Integration Architecture

The adapter implements a bridge pattern that translates between Zed's extension protocol and Prismatic's internal LLM API.

```
Zed Editor --> Zed Extension API --> LLM Zed Adapter --> Prismatic LLM Router
                                          |                     |
                                    Format Translation     Provider Selection
                                          |                     |
                                    Response Formatting    Quality Validation
                                          |                     |
                                    Zed Display <--------- Final Response
```

```elixir
defmodule PrismaticAgents.LLMZedAdapter do
  @moduledoc """
  Bridge between Zed editor's LLM extension API and
  Prismatic's multi-provider LLM infrastructure.
  """

  use GenServer

  @type zed_request :: %{
    type: :inline_assist | :code_gen | :chat | :explain,
    content: String.t(),
    context: zed_context(),
    editor_state: map()
  }

  @type zed_context :: %{
    file_path: String.t(),
    language: String.t(),
    selection: String.t() | nil,
    surrounding_code: String.t(),
    project_root: String.t()
  }

  @spec handle_zed_request(zed_request()) :: {:ok, String.t()} | {:error, term()}
  def handle_zed_request(request) do
    GenServer.call(__MODULE__, {:zed_request, request}, :timer.minutes(2))
  end

  @impl true
  def handle_call({:zed_request, request}, _from, state) do
    with {:ok, prismatic_request} <- translate_request(request),
         {:ok, enriched} <- enrich_with_project_context(prismatic_request, request.context),
         {:ok, routed} <- PrismaticAgents.LLMRouting.route(enriched.prompt),
         {:ok, response} <- PrismaticAgents.LLMUnifiedOrchestrator.execute(enriched),
         {:ok, formatted} <- format_for_zed(response, request.type) do
      {:reply, {:ok, formatted}, update_metrics(state, request, response)}
    end
  end
end
```

## Request Type Handling

The adapter handles four primary request types from Zed, each with specialized prompt construction and response formatting.

| Request Type | Zed Trigger | Prompt Strategy | Response Format |
|---|---|---|---|
| Inline Assist | Selection + prompt | Code context + instruction | Code replacement |
| Code Generation | Empty selection + prompt | File context + specification | New code block |
| Chat | Chat panel message | Conversational with project context | Markdown response |
| Explain | Selection + "explain" | Code + explanation request | Inline documentation |

## Project Context Enrichment

The adapter enriches every request with relevant project context to improve LLM response quality.

```elixir
defmodule PrismaticAgents.LLMZedAdapter.ContextEnricher do
  @spec enrich(map(), zed_context()) :: {:ok, enriched_request()}
  def enrich(request, context) do
    project_info = gather_project_context(context.project_root)
    language_config = get_language_config(context.language)
    related_files = find_related_files(context.file_path, context.project_root)

    enriched_prompt = """
    Project: #{project_info.name} (#{project_info.framework})
    Language: #{context.language}
    File: #{context.file_path}
    #{if context.selection, do: "Selected code:\n```\n#{context.selection}\n```\n", else: ""}
    #{request.content}
    """

    {:ok, %{request | prompt: enriched_prompt, metadata: %{
      project: project_info,
      language: language_config,
      related_files: related_files
    }}}
  end
end
```

## Elixir-Specific Enhancements

When the adapter detects that the active file is Elixir, it applies platform-specific enhancements to both prompts and response validation.

| Enhancement | Trigger | Action |
|---|---|---|
| OTP pattern suggestion | GenServer/Supervisor code | Add OTP pattern context to prompt |
| Typespec generation | Function definition | Request @spec in generated code |
| Test generation | Module file | Suggest corresponding test file |
| Credo compliance | Any Elixir code | Validate response against Credo rules |
| Phoenix conventions | LiveView/Controller code | Add Phoenix convention context |

## Performance Characteristics

| Metric | Target | Current | Provider |
|---|---|---|---|
| Inline assist latency | < 2s | 1.2s avg | Ollama (local) |
| Code generation latency | < 5s | 3.5s avg | Provider-dependent |
| Chat response latency | < 3s | 2.1s avg | Ollama (local) |
| Context enrichment overhead | < 200ms | 150ms avg | Local file system |

## Key Capabilities

- **Native Zed extension integration** implementing the Zed extension API protocol for seamless editor integration without external tool dependencies
- **Multi-provider routing** leveraging Prismatic's LLM routing infrastructure to select optimal models for each request type and complexity level
- **Project-aware context enrichment** automatically gathering relevant project context including file structure, language configuration, and related modules to improve response quality
- **Elixir-specific enhancements** applying OTP pattern awareness, typespec generation, and Credo compliance checking for Elixir code operations
- **Response format adaptation** translating LLM responses into the appropriate format for each Zed request type (code blocks, inline replacements, markdown chat)
- **Cost and quality tracking** maintaining per-developer usage metrics for cost attribution and quality monitoring

## Authority Level

**L4** - Domain Specialist. Focused domain authority for Zed editor LLM integration operations. The adapter operates within the constraints set by the LLM routing layer and does not independently make provider selection decisions.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [llm-routing-orchestrator-agent](@/agents/llm-routing-orchestrator-agent.md) | Routing Authority | Provides routing decisions for all Zed-originated LLM requests |
| [llm-unified-orchestrator](@/agents/llm-unified-orchestrator.md) | Execution Layer | Executes LLM requests with quality validation |
| [ollama-coordinator](@/agents/ollama-coordinator.md) | Local Provider | Preferred provider for low-latency editor operations |
| [code-specialist](@/agents/code-specialist.md) | Code Quality | Provides code quality context for generation validation |

## Integration

| Component | Relationship |
|---|---|
| Zed Extension API | Primary interface for editor integration |
| Prismatic LLM Router | Request routing and provider selection |
| [Ollama](@/glossary/ollama.md) | Preferred local provider for latency-sensitive operations |
| Platform [Telemetry](@/glossary/telemetry.md) | Usage metrics, latency tracking, and quality monitoring |

## Enforcement

The LLM Zed Adapter operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. All generated code must pass quality validation before being presented to the developer. Elixir code responses are validated against Credo and compilation requirements. Cost tracking is mandatory for every request, enabling accurate budget attribution. The adapter inherits all quality and security constraints from the platform's LLM infrastructure, ensuring that editor-originated requests receive the same governance as programmatic requests.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)