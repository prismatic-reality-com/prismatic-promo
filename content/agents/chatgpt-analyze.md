+++
title = "chatgpt-analyze"
weight = 68
[extra]
domain = "code-analysis-architecture"
level = "L4"
description = "Level: Strategic Autonomy Created: 2025-12-21 AIAD Compliance**: v2.0.0"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.0.0"
last_enhanced = "2026-02-14"
word_count = 400
quality_score = 62
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-analyze", "Level", "Strategic", "Autonomy", "Created", "2025-12-21", "AIAD", "agents", "agent", "Prismatic Platform"]
tags = ["agents", "agent", "chatgpt-analyze", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "chatgpt-analyze - Prismatic Platform"
+++

## Overview

The ChatGPT Analyze agent operates as an L4 domain specialist within the Code Analysis and Architecture domain of the Prismatic Platform. This agent bridges the Prismatic ecosystem with external large language model capabilities, specifically leveraging ChatGPT for deep code analysis, architectural pattern recognition, and system design review. It serves as a specialized interface that translates platform-internal code structures into prompts optimized for external AI analysis, then validates and integrates the resulting insights back into the platform's knowledge base under strict evidence standards.

The agent was designed to augment the platform's native static analysis capabilities with the broader pattern recognition strengths of general-purpose language models. While Prismatic's internal tools excel at [Elixir](@/glossary/elixir.md)-specific analysis ([Credo](@/glossary/credo.md), [Dialyzer](@/glossary/dialyzer.md), custom [quality gates](@/glossary/quality-gates.md)), the ChatGPT Analyze agent brings cross-language architectural awareness, enabling it to identify design patterns, anti-patterns, and optimization opportunities that draw from the entire software engineering knowledge base rather than being limited to Elixir conventions. Every external analysis result undergoes validation against platform evidence standards before acceptance, ensuring that external AI insights meet the same rigor as internally generated analysis. This agent is part of the platform's 434-strong autonomous agent ecosystem, built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Architecture

The ChatGPT Analyze agent implements a four-layer architecture that separates code extraction, prompt engineering, API interaction, and result validation into distinct processing stages.

**Code Context Extractor** -- The first layer is responsible for extracting relevant code context from the platform's codebase. For a targeted analysis request, the extractor identifies not just the specified module but its dependency graph, its position within the [supervision tree](@/glossary/supervision-tree.md), its test coverage profile, and its recent change history. This enriched context enables the external AI to provide analysis that accounts for the module's role within the larger system rather than analyzing code in isolation.

**Prompt Assembly Engine** -- The second layer transforms extracted code context into optimized analysis prompts. The engine selects from a library of tested prompt templates based on the analysis type (architecture review, performance analysis, security audit, refactoring recommendation) and assembles the prompt with the extracted context. Token budget management ensures that the assembled prompt fits within model context limits while preserving the most analytically relevant information.

**API Interaction Layer** -- The third layer manages the actual ChatGPT API communication through the platform's bridge infrastructure. This includes request queuing, priority ordering, response streaming for large analyses, and error handling for transient API failures. The interaction layer is stateless, delegating all connection management to the [chatgpt-bridge-commander](@/agents/chatgpt-bridge-commander.md).

**Result Validation Engine** -- The fourth and most critical layer validates external AI analysis results against platform evidence standards. Architectural recommendations are checked against the platform's established patterns. Performance suggestions are benchmarked against actual telemetry data. Security findings are verified against the platform's threat model. Only validated insights propagate into the platform's knowledge base.

## Core Capabilities

- **Architectural pattern recognition** identifying design patterns, anti-patterns, and structural issues across the [umbrella application](@/glossary/umbrella-application.md) ecosystem through cross-language AI analysis that draws from broader software engineering knowledge
- **System design review** evaluating scalability characteristics, performance bottlenecks, and [fault tolerance](@/glossary/fault-tolerance.md) properties of proposed architectural changes before implementation commits resources
- **Technology stack evaluation** providing trade-off analysis and evidence-based recommendations for library selection, framework adoption, and infrastructure decisions through comparative AI analysis
- **Code complexity analysis** measuring cyclomatic complexity, coupling [metrics](@/glossary/metrics.md), and cohesion indicators to identify modules that would benefit from refactoring or consolidation
- **Cross-language insight synthesis** translating proven patterns from other language ecosystems (Rust ownership patterns, Go concurrency patterns, Haskell type system patterns) into Elixir-idiomatic implementations that leverage [OTP](@/glossary/otp.md) strengths
- **Refactoring impact assessment** analyzing proposed code changes to predict their impact on system stability, test coverage, and downstream dependencies before the changes are implemented
- **Technical debt quantification** using AI analysis to estimate the maintenance cost of existing code patterns compared to recommended alternatives, providing economic justification for refactoring investments

## Implementation

The analysis pipeline is implemented as a supervised [GenServer](@/glossary/genserver.md) that manages concurrent analysis requests with configurable parallelism.

```elixir
defmodule Prismatic.AI.ChatGPT.Analyzer do
  @moduledoc """
  External AI code analysis agent bridging Prismatic codebase
  with ChatGPT for architectural review, pattern recognition,
  and cross-language insight synthesis.
  """
  use GenServer

  alias Prismatic.AI.ChatGPT.{
    ContextExtractor,
    PromptAssembler,
    BridgeClient,
    ResultValidator
  }

  @type analysis_request :: %{
    target: String.t(),
    analysis_type: :architecture | :performance | :security | :refactoring,
    depth: :shallow | :standard | :deep,
    context_budget: pos_integer()
  }

  @type analysis_result :: %{
    findings: list(finding()),
    confidence: float(),
    validated: boolean(),
    provenance: map()
  }

  @spec analyze(analysis_request()) :: {:ok, analysis_result()} | {:error, term()}
  def analyze(request) do
    GenServer.call(__MODULE__, {:analyze, request}, :timer.minutes(3))
  end

  @impl true
  def handle_call({:analyze, request}, _from, state) do
    result =
      with {:ok, context} <- ContextExtractor.extract(request.target, request.depth),
           {:ok, prompt} <- PromptAssembler.assemble(request.analysis_type, context, request.context_budget),
           {:ok, raw_response} <- BridgeClient.query(prompt, model: "gpt-4o"),
           {:ok, parsed} <- parse_analysis_response(raw_response),
           {:ok, validated} <- ResultValidator.validate(parsed, context) do
        :telemetry.execute(
          [:prismatic, :ai, :analysis, :complete],
          %{duration_ms: System.monotonic_time(:millisecond) - state.start_time,
            findings_count: length(validated.findings),
            confidence: validated.confidence},
          %{analysis_type: request.analysis_type}
        )
        {:ok, validated}
      end

    {:reply, result, state}
  end

  defp parse_analysis_response(response) do
    case Jason.decode(response.content) do
      {:ok, %{"findings" => findings}} ->
        {:ok, %{findings: findings, raw_confidence: response.finish_reason}}
      {:error, _} ->
        {:ok, %{findings: [%{type: :unstructured, content: response.content}], raw_confidence: :low}}
    end
  end
end
```

## Integration Points

| Component | Integration Type | Function |
|-----------|-----------------|----------|
| [architecture-review-specialist](@/agents/architecture-review-specialist.md) | Analysis Consumer | Receives architectural analysis results for review decisions and pattern enforcement |
| [code-review-specialist-agent-v20](@/agents/code-review-specialist-agent-v20.md) | Quality Partner | Collaborates on code quality assessment combining AI-generated insights with rule-based analysis |
| [chatgpt-bridge-commander](@/agents/chatgpt-bridge-commander.md) | Transport Layer | Provides API communication, connection pooling, and rate limiting for ChatGPT interactions |
| [chatgpt-prompt-engineer](@/agents/chatgpt-prompt-engineer.md) | Prompt Optimization | Supplies optimized prompt templates and manages A/B testing for analysis prompt effectiveness |
| [chatgpt-context-manager](@/agents/chatgpt-context-manager.md) | Context Management | Coordinates context window optimization and cross-session context preservation |
| [ETS](@/glossary/ets.md) Analysis Cache | Performance | Caches recent analysis results to avoid redundant API calls for unchanged code |
| [Prismatic Telemetry](@/glossary/telemetry.md) | Observability | Emits analysis metrics including duration, token consumption, finding counts, and validation rates |

## Operational Workflow

**Phase 1: Request Intake** -- Analysis requests arrive from code review agents, manual developer requests, or automated CI pipeline triggers. Each request specifies the target module or code path, the analysis type, depth level, and token budget constraints.

**Phase 2: Context Extraction** -- The code context extractor builds a comprehensive analysis context including the target code, its dependency graph (up to configurable depth), test files, recent git history, and any existing analysis results in the cache. Context is prioritized by relevance to the analysis type.

**Phase 3: Prompt Assembly** -- The prompt assembler selects the appropriate template for the requested analysis type and populates it with the extracted context. Token budget management ensures the assembled prompt stays within model limits while maximizing analytical value per token.

**Phase 4: External Analysis** -- The assembled prompt is submitted to ChatGPT through the bridge commander. Response streaming enables progress monitoring for long-running analyses. Transient API failures trigger automatic retry with exponential backoff.

**Phase 5: Result Validation** -- External analysis results undergo multi-dimensional validation. Architectural recommendations are checked against established platform patterns. Performance claims are verified against telemetry baselines. Security findings are cross-referenced with known vulnerability databases.

**Phase 6: Integration** -- Validated findings are classified by actionability and integrated into the platform's knowledge base. Immediately actionable findings are routed to the appropriate enforcement agents. Exploratory findings are stored for future reference with declining confidence over time.

## NABLA Compliance

| Axiom | Implementation |
|-------|---------------|
| **Signal Plurality** | External AI analysis results are always combined with internal static analysis before forming conclusions; no decision rests solely on external AI output |
| **Contradiction Preservation** | When external analysis contradicts internal tools (e.g., AI recommends a pattern that Credo flags), both signals are preserved and escalated for investigation |
| **Provenance Mandatory** | Every analysis finding carries provenance linking it to the specific prompt, model version, and response that generated it |
| **Time Decay** | Analysis results carry timestamps and are weighted by recency; architectural recommendations degrade in relevance as the codebase evolves |
| **Source Independence** | External AI analysis is treated as an independent signal source, weighted separately from internal analysis tools in composite assessments |
| **Unknown Valid** | When ChatGPT expresses uncertainty or provides low-confidence findings, this uncertainty is explicitly preserved rather than filtered out |

## Configuration

```elixir
config :prismatic_ai, Prismatic.AI.ChatGPT.Analyzer,
  # Default model for analysis
  model: "gpt-4o",
  # Maximum context tokens per analysis
  max_context_tokens: 32_000,
  # Analysis result cache TTL (seconds)
  cache_ttl: 3600,
  # Maximum concurrent analyses
  max_concurrency: 3,
  # Minimum confidence threshold for validated findings
  confidence_threshold: 0.7,
  # Validation mode
  validation: :strict,
  # Fallback to local model on API failure
  fallback_model: "qwen3-coder"
```

## Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Shallow analysis | < 30 seconds | Single module with immediate dependencies |
| Standard analysis | < 90 seconds | Module with full dependency graph analysis |
| Deep analysis | < 3 minutes | Cross-module architectural analysis |
| Context extraction | < 5 seconds | Code context assembly with dependency resolution |
| Result validation | < 10 seconds | Multi-dimensional validation against platform standards |
| Cache hit rate | > 40% | Analysis cache effectiveness for unchanged code |

## Related Resources

- [**chatgpt-bridge-commander**](@/agents/chatgpt-bridge-commander.md) (L2) -- API transport layer for ChatGPT communication
- [**chatgpt-prompt-engineer**](@/agents/chatgpt-prompt-engineer.md) (L3) -- Prompt template management and optimization
- [**architecture-review-specialist**](@/agents/architecture-review-specialist.md) -- Architectural analysis consumer and enforcement
- [**code-review-specialist-agent-v20**](@/agents/code-review-specialist-agent-v20.md) (L3) -- Collaborative code quality assessment
- [Quality Gates](@/glossary/quality-gates.md) -- Platform quality validation framework

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)