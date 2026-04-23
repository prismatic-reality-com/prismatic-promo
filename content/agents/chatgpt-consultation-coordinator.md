+++
title = "chatgpt-consultation-coordinator"
weight = 71
[extra]
domain = "ai-consultation-workflows"
level = "L3"
description = "Manages structured multi-turn consultation workflows between platform agents and ChatGPT, ensuring consultation sessions follow defined protocols, produce validated outcomes, and integrate results back into the platform's epistemic decision-making pipelines."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "professional"
glossary_terms = ["aiad", "otp", "genserver", "supervision-tree", "dynamic-supervisor", "message-passing", "no-doubts", "telemetry", "no-mercy", "nabla-infinity", "trinity-gate", "signal-plurality"]
domain_normalized = "orchestration"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-consultation-coordinator", "Manages", "ChatGPT", "agents", "agent", "Prismatic Platform", "Consultation Coordinator", "Phase", "Multi"]
tags = ["agents", "agent", "chatgpt-consultation-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "chatgpt-consultation-coordinator - Prismatic Platform"
+++

## Executive Summary

The ChatGPT Consultation Coordinator operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the AI Consultation Workflows domain of the Prismatic Platform. This agent manages structured consultation workflows between platform agents and ChatGPT, ensuring that AI consultations follow defined protocols, produce actionable outcomes, and are properly integrated back into the platform's decision-making pipelines. Rather than treating each ChatGPT interaction as an isolated question-answer exchange, the Consultation Coordinator orchestrates multi-turn dialogues with progressive context building, structured output extraction, and evidence-grade validation of all results.

In a platform with 434 autonomous agents operating across domains as diverse as [OSINT](@/glossary/osint.md) intelligence, compliance automation, and code quality enforcement, the ability to conduct structured AI consultations is a critical operational capability. Complex problems -- architectural reviews, strategic planning exercises, risk assessments -- require consultation sessions that span multiple turns, accumulate context progressively, and extract outputs in formats that downstream agents can consume without manual transformation. The Consultation Coordinator manages this complexity through consultation templates, session lifecycle management, and output validation pipelines that ensure every consultation produces results meeting the platform's epistemic standards.

## Architecture

The Consultation Coordinator implements a three-layer architecture spanning consultation planning, execution management, and output processing.

```
+----------------------------------------------------------------------+
|         ChatGPT Consultation Coordinator (L3)                        |
+----------------------------------------------------------------------+
|  Planning Layer                                                       |
|  +--------------------+  +--------------------+  +------------------+ |
|  | Template Selection |  | Context Assembly   |  | Goal Definition  | |
|  | (Use-case match)   |  | (Domain context)   |  | (Success crit.)  | |
|  +--------+-----------+  +--------+-----------+  +--------+---------+ |
|           |                       |                       |           |
|  +--------+-----------------------+-----------------------+--------+  |
|  |              Session Execution Engine                             |  |
|  |  +--------------+  +-----------------+  +-------------------+    |  |
|  |  | Turn Manager |  | Context Accum.  |  | Progress Tracker  |    |  |
|  |  +--------------+  +-----------------+  +-------------------+    |  |
|  +-----------------------------------------------------------------+  |
|                            |                                          |
|  Output Layer              |                                          |
|  +--------------------+  +-+------------------+  +------------------+ |
|  | Structure Valid.   |  | Evidence Grading   |  | Learning Capture | |
|  | (Schema check)     |  | (NABLA compliance) |  | (Pattern extract)| |
|  +--------------------+  +--------------------+  +------------------+ |
+----------------------------------------------------------------------+
```

The Planning Layer selects appropriate consultation templates based on the requesting agent's domain and objective, assembles relevant context from platform knowledge bases, and defines success criteria that the output layer uses for validation. The Session Execution Engine manages multi-turn dialogue state, accumulating context across turns while tracking progress toward consultation goals. The Output Layer validates consultation results against structural expectations and epistemic quality standards before releasing them to consuming agents.

## Operational Domain

The AI Consultation Workflows domain defines structured approaches to leveraging external AI capabilities. The Consultation Coordinator ensures that consultations are not ad-hoc but follow repeatable patterns that produce consistent, high-quality results. This includes consultation planning, execution monitoring, output validation, and post-consultation learning capture.

Unlike simple prompt-response interactions, consultations in this domain follow defined protocols with clear phases: requirement gathering, context assembly, iterative refinement, output extraction, and validation. Each phase has specific entry and exit criteria that the Consultation Coordinator enforces. This structured approach transforms what would otherwise be unpredictable AI interactions into reliable, repeatable processes with measurable quality characteristics.

The domain also governs consultation scheduling and resource management. ChatGPT API interactions consume tokens and are subject to rate limits, so the Consultation Coordinator optimizes scheduling to balance urgency against cost, prioritizing time-sensitive consultations while batching deferrable ones for cost efficiency.

## Core Capabilities

**Consultation Template Management** maintains a versioned library of structured templates for common consultation patterns. Each template defines the consultation objective, required context inputs, turn structure, expected output format, and validation criteria. Templates exist for architecture review consultations (multi-turn analysis of design decisions with trade-off assessment), code analysis consultations (structured examination of implementation patterns with improvement recommendations), risk assessment consultations (systematic threat identification with probability and impact scoring), and strategic planning consultations (multi-perspective analysis of platform direction with evidence-backed recommendations). Templates are measured for effectiveness and evolved based on historical outcome quality.

**Multi-Turn Dialogue Orchestration** manages complex consultation sessions that require progressive context building across multiple ChatGPT interactions. The orchestrator maintains conversation state, tracks which information has been communicated, identifies when additional context is needed, and manages the turn-by-turn progression toward the consultation's defined objectives. Each turn's output is validated before the next turn begins, ensuring that the conversation builds on accurate foundations.

**Output Validation Pipeline** verifies that consultation results meet the platform's evidence standards before forwarding to consuming agents. Validation includes structural checks (does the output match the expected schema), content checks (are all required sections present), evidence checks (are claims supported by cited reasoning), and consistency checks (do different parts of the output contradict each other). Outputs that fail validation are either refined through additional consultation turns or flagged for manual review.

**Consultation Scheduling and Optimization** coordinates the timing of AI consultations to optimize API token usage and minimize latency for time-sensitive requests. The scheduler maintains a priority queue of pending consultation requests, factors in current API rate limit headroom, and batches related consultations to share context setup costs. Time-sensitive consultations (triggered by production incidents or blocking decisions) receive immediate scheduling, while analytical consultations are batched during low-usage periods.

**Learning Capture and Pattern Extraction** extracts reusable patterns from completed consultations to improve template effectiveness and reduce future consultation overhead. After each consultation completes, the learning capture system analyzes the consultation's turn count, token consumption, output quality score, and downstream impact. High-performing consultation patterns are abstracted into new or improved templates, while ineffective patterns are flagged for retirement.

## Implementation

```elixir
defmodule PrismaticChatGPT.ConsultationCoordinator do
  @moduledoc """
  L3 Strategic Command agent managing structured consultation
  workflows between platform agents and ChatGPT.
  """

  use GenServer

  alias PrismaticChatGPT.{TemplateLibrary, SessionEngine, OutputValidator}
  alias PrismaticChatGPT.{ContextAssembler, LearningCapture}

  defstruct [
    :active_sessions,
    :template_registry,
    :pending_queue,
    :completed_log,
    :learning_patterns
  ]

  @spec start_consultation(map()) :: {:ok, String.t()} | {:error, term()}
  def start_consultation(request) do
    GenServer.call(__MODULE__, {:start, request})
  end

  @spec get_session_status(String.t()) :: {:ok, map()} | {:error, :not_found}
  def get_session_status(session_id) do
    GenServer.call(__MODULE__, {:status, session_id})
  end

  @impl true
  def handle_call({:start, request}, _from, state) do
    with {:ok, template} <- TemplateLibrary.select(request.objective, request.domain),
         {:ok, context} <- ContextAssembler.build(template, request),
         {:ok, session} <- SessionEngine.initialize(template, context, request) do
      updated = Map.put(state.active_sessions, session.id, session)
      {:reply, {:ok, session.id}, %{state | active_sessions: updated}}
    else
      {:error, _reason} = error -> {:reply, error, state}
    end
  end

  @impl true
  def handle_call({:status, session_id}, _from, state) do
    case Map.get(state.active_sessions, session_id) do
      nil -> {:reply, {:error, :not_found}, state}
      session -> {:reply, {:ok, SessionEngine.summarize(session)}, state}
    end
  end
end
```

## Authority Level

**L3** -- Strategic Command -- Multi-domain coordination with specialized operational command authority. The Consultation Coordinator exercises authority over consultation lifecycle management, template governance, and output quality validation. It coordinates with higher-authority agents for strategic consultation priorities and with specialist agents for domain-specific context assembly.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [chatgpt-integration-commander](@/agents/chatgpt-integration-commander.md) | Integration Authority | Provides API access, manages connection lifecycle, and enforces rate limits for consultations |
| [chatgpt-prompt-engineer](@/agents/chatgpt-prompt-engineer.md) | Prompt Design | Optimizes consultation prompts within templates for maximum output quality per token |
| [chatgpt-archive-specialist](@/agents/chatgpt-archive-specialist.md) | Archive Management | Preserves complete consultation records for future reference and pattern extraction |
| [chatgpt-context-manager](@/agents/chatgpt-context-manager.md) | Context Optimization | Manages context window utilization across multi-turn consultation sessions |
| [chatgpt-workflow-orchestrator](@/agents/chatgpt-workflow-orchestrator.md) | Workflow Integration | Embeds consultations as steps within larger multi-step workflow sequences |

## Operational Workflow

**Phase 1 -- Consultation Planning**: When a consultation request arrives, the coordinator selects an appropriate template from the versioned library, assembles required context from platform knowledge bases, defines success criteria based on the requesting agent's objectives, and estimates token budget for the session. Planning failures (missing context, no matching template, insufficient token budget) are reported immediately with actionable remediation suggestions.

**Phase 2 -- Session Initialization**: The coordinator initializes a consultation session with the selected template, assembled context, and defined success criteria. The session is registered in the active session registry with a unique identifier, and the first turn's prompt is constructed from the template's opening structure combined with the assembled context.

**Phase 3 -- Multi-Turn Execution**: The session engine executes the consultation through its defined turns, validating each turn's output before constructing the next turn's prompt. Context accumulates across turns, with the context manager optimizing window utilization to prevent overflow. Progress tracking monitors advancement toward defined success criteria, triggering additional turns or alternative approaches when progress stalls.

**Phase 4 -- Output Extraction and Validation**: Upon reaching consultation goals (or exhausting the turn budget), the output layer extracts the final consultation product, validates it against structural and evidence standards, and grades its quality. Outputs meeting quality thresholds are forwarded to the requesting agent with provenance metadata. Outputs below threshold trigger either refinement turns or escalation to manual review.

**Phase 5 -- Learning Capture**: Completed consultations feed the learning capture system, which analyzes consultation effectiveness and extracts patterns for template improvement. Token efficiency, output quality, turn count, and downstream impact are all measured and correlated with template and context choices.

## Performance Metrics

| Metric | Target | Measured |
|--------|--------|----------|
| Consultation success rate | > 95% | 97.3% |
| Average turn count | < 5 turns | 3.2 turns |
| Output validation pass rate | > 90% | 93.1% |
| Token efficiency (quality/token) | > 0.8 | 0.85 |
| Template reuse rate | > 80% | 87% |
| Learning pattern extraction rate | > 70% | 74% |

## NABLA Compliance

**Signal Plurality**: Consultation outputs are validated against multiple evidence signals, not just structural checks. Content quality, logical consistency, and source diversity are all evaluated independently before acceptance.

**Provenance Mandatory**: Every consultation output carries complete provenance metadata including the template version used, context sources consulted, turn count, token consumption, and validation results. Downstream agents can trace any consultation-derived conclusion back to its source interaction.

**Contradiction Preservation**: When consultation outputs contain contradictory findings (common in risk assessments and strategic analyses), both sides of the contradiction are preserved and forwarded to the consuming agent with explicit contradiction markers. The coordinator never silently resolves contradictions in favor of one side.

**Time Decay**: Consultation results carry temporal metadata, and the coordinator tracks how consultation freshness degrades over time. Stale consultation results are flagged when referenced, triggering re-consultation recommendations for time-sensitive domains.

## Enforcement

All consultation operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. No consultation result is accepted without validation against platform evidence standards. Consultations that produce ambiguous or contradictory outputs trigger NABLA [Contradiction Preservation](@/glossary/contradiction-preservation.md) protocols for further investigation. Template effectiveness is continuously measured, and underperforming templates are retired and replaced without exception.

## Related Resources

- [chatgpt-integration-commander](@/agents/chatgpt-integration-commander.md) -- API integration and failover management
- [chatgpt-prompt-engineer](@/agents/chatgpt-prompt-engineer.md) -- Prompt optimization for consultation quality
- [chatgpt-workflow-orchestrator](@/agents/chatgpt-workflow-orchestrator.md) -- Multi-step workflow execution
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Cross-domain intelligence aggregation
- [AIAD Standard](@/glossary/aiad.md) -- Agent design specification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)