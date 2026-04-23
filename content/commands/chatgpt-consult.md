+++
title = "/chatgpt-consult"
weight = 240
[extra]
category = "Development"
description = "Consult ChatGPT for alternative perspectives and solutions"
syntax = "/chatgpt-consult [options]"
authority = "L2+"
agent = "chatgpt-bridge"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1247
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["chatgpt-consult", "Consult", "ChatGPT", "commands", "Development", "Prismatic Platform", "GitLab", "Context", "Architecture"]
tags = ["commands", "development", "chatgpt-consult", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/chatgpt-consult - Prismatic Platform"
+++

## Overview

The **/chatgpt-consult** command initiates structured consultation sessions with ChatGPT for obtaining alternative perspectives, architectural guidance, problem-solving strategies, and planning assistance within the Prismatic Platform's development workflow. Unlike direct API calls through [/chatgpt-bridge](/commands/chatgpt-bridge/), the consult command wraps the interaction in a purpose-driven consultation framework that includes automatic context preparation, conversation type selection, output format management, and optional GitLab integration for tracking consultation outcomes as actionable issues.

The value of multi-model consultation in complex software engineering cannot be overstated. When working within a system as architecturally dense as the Prismatic Platform -- with its 90 umbrella applications, 400+ agents, and multi-paradigm design patterns -- a single analytical perspective risks blind spots. The **/chatgpt-consult** command operationalizes the principle that different LLM architectures produce genuinely different analytical insights. ChatGPT's training distribution and reasoning patterns differ from Claude's, which means that routing specific categories of questions -- particularly architectural trade-off analysis, broad pattern recognition, and alternative solution exploration -- to ChatGPT can surface perspectives that would not emerge from a Claude-only workflow. This embodies the [NABLA Infinity](/glossary/nabla-infinity/) framework's Signal Plurality axiom: by deliberately seeking independent perspectives from a different AI system, the platform prevents single-source truth bias in architectural and strategic decisions.

This command operates under the **L2+** authority level and is executed by the `chatgpt-bridge` agent, coordinated by the `chatgpt-consultation-coordinator` subsystem within the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) framework. It supports five consultation types (architecture, code-review, problem-solving, planning, and general), four interaction modes (rapid, interactive, deep, collaborative), and multiple context levels that automatically optimize the information package sent to ChatGPT based on the consultation topic. A distinctive feature is the GitLab integration via `Prismatic.Issues.ChatGPTGitLabBridge`, which can automatically extract action items from consultation responses and create corresponding GitLab issues with appropriate labels, priorities, and milestone assignments. The command is part of the platform's 216-command slash command [registry](/glossary/registry-otp/).

## Usage

```bash
/chatgpt-consult <question> [--type <consultation_type>] [--context <level>] [--mode <interaction_mode>] [--files <paths>] [--output <format>] [--gitlab-sync] [--auto-create-issues]
```

### Quick Technical Consultations

```bash
# Rapid technical question
/chatgpt-consult "How to optimize LLM orchestrator for better throughput?"

# Quick code review consultation
/chatgpt-consult "Review this agent implementation" --files lib/prismatic/agents/registry.ex --type code-review --mode rapid
```

### Architecture and Design Consultations

```bash
# Strategic architecture discussion with full context
/chatgpt-consult "Design scalable architecture for 10K concurrent users" --type architecture --context comprehensive --mode deep

# Pattern analysis consultation
/chatgpt-consult "Analyze current agent coordination patterns and suggest improvements" --type architecture --context focused
```

### Problem-Solving Sessions

```bash
# Complex debugging consultation
/chatgpt-consult "High memory usage in LLM memory manager" --type problem-solving --context comprehensive --mode collaborative

# Performance investigation
/chatgpt-consult "Investigate slow database queries in OSINT module" --type problem-solving --files "apps/prismatic/lib/prismatic/osint/**/*.ex"
```

### Planning with GitLab Integration

```bash
# Consultation with automatic GitLab issue creation
/chatgpt-consult "Plan Q1 2026 feature implementation" --type planning --gitlab-sync --auto-create-issues

# Assign generated issues to milestone and assignee
/chatgpt-consult "Security audit recommendations" --type architecture --gitlab-sync --gitlab-milestone "v2.0.0" --gitlab-assignee "korczis"

# Output directly as GitLab issues
/chatgpt-consult "Break down OSINT integration tasks" --type planning --output gitlab-issues
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `question` | string | Yes | -- | Primary consultation question or topic |
| `--type` | enum | No | `general` | Consultation type: `architecture`, `code-review`, `problem-solving`, `planning`, `general` |
| `--context` | enum | No | `auto` | Context detail level: `auto`, `minimal`, `focused`, `comprehensive` |
| `--mode` | enum | No | `interactive` | Interaction mode: `rapid` (5-15 min), `interactive` (15-45 min), `deep` (1-3 hrs), `collaborative` (multi-session) |
| `--files` | array | No | -- | Specific files to include in consultation context |
| `--output` | enum | No | `session` | Output format: `session`, `summary`, `action-items`, `full-report`, `gitlab-issues` |
| `--gitlab-sync` | boolean | No | `true` | Sync consultation outcomes to GitLab issues |
| `--gitlab-milestone` | string | No | -- | GitLab milestone to assign to created issues |
| `--gitlab-labels` | array | No | `ai-generated,chatgpt-consultation` | Additional labels for GitLab issues |
| `--gitlab-assignee` | string | No | -- | Username to assign GitLab issues to |
| `--auto-create-issues` | boolean | No | `true` | Automatically create GitLab issues from extracted action items |
| `--session-tracking` | boolean | No | `true` | Create a session tracker issue in GitLab |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ (Strategic Execution) |
| **Executing Agent** | `chatgpt-bridge` (via `chatgpt-consultation-coordinator`) |
| **Agent Classification** | L2 Strategic Execution |
| **Status** | Production |
| **Usage Frequency** | Low |
| **Category** | Development |
| **Domain** | Consultation Workflows / Cross-LLM Collaboration |
| **AIAD Version** | 2.0.0 |
| **GitLab Integration** | v1.0 via `Prismatic.Issues.ChatGPTGitLabBridge` |

## Technical Implementation

The **/chatgpt-consult** command orchestrates a consultation lifecycle that spans context preparation, session management, consultation execution, outcome processing, and optional GitLab integration. The implementation separates concerns between the consultation logic and the GitLab bridge, allowing each to evolve independently.

```elixir
defmodule Prismatic.LLM.ChatGPT.Consult do
  @moduledoc """
  Structured consultation sessions with ChatGPT for architecture,
  code review, problem-solving, and planning workflows.
  """

  alias Prismatic.Issues.ChatGPTGitLabBridge

  @spec consult(String.t(), keyword()) :: {:ok, ConsultationResult.t()} | {:error, term()}
  def consult(question, opts \\ []) do
    type = Keyword.get(opts, :type, :general)
    context_level = Keyword.get(opts, :context, :auto)
    mode = Keyword.get(opts, :mode, :interactive)

    with {:ok, session} <- start_consultation_session(question, type, mode),
         {:ok, context} <- prepare_context(question, type, context_level, opts),
         {:ok, result} <- execute_consultation(session, context),
         {:ok, processed} <- process_outcomes(result, opts) do
      maybe_sync_gitlab(processed, opts)
      format_output(processed, Keyword.get(opts, :output, :session))
    end
  end

  defp prepare_context(question, type, :auto, opts) do
    inferred_level = infer_context_level(question, type)
    prepare_context(question, type, inferred_level, opts)
  end

  defp prepare_context(_question, type, level, opts) do
    base = %{
      platform_overview: load_platform_overview(),
      recent_changes: load_recent_changes(),
      current_state: get_platform_state()
    }

    type_context = case type do
      :architecture -> add_architecture_context(base)
      :code_review -> add_code_context(base, Keyword.get(opts, :files))
      :problem_solving -> add_debugging_context(base)
      :planning -> add_planning_context(base)
      _ -> base
    end

    {:ok, optimize_for_level(type_context, level)}
  end

  defp maybe_sync_gitlab(result, opts) do
    if Keyword.get(opts, :gitlab_sync, true) do
      ChatGPTGitLabBridge.process_consultation(result,
        auto_create: Keyword.get(opts, :auto_create_issues, true),
        labels: Keyword.get(opts, :gitlab_labels, ["ai-generated"]),
        milestone: Keyword.get(opts, :gitlab_milestone),
        assignee: Keyword.get(opts, :gitlab_assignee)
      )
    end
  end
end
```

The context preparation system is consultation-type-aware. Architecture consultations receive platform architecture documentation, supervision tree diagrams, and design decision records. Code review consultations receive the specified source files along with their test coverage data, Credo findings, and dependency graphs. Problem-solving consultations include error logs, performance telemetry, and system state snapshots. The `auto` context level uses heuristics based on the question content and consultation type to select the appropriate detail level, balancing informativeness against ChatGPT's token limits.

The GitLab integration bridge extracts action items from consultation responses using pattern matching on markers (TODO, FIXME, ACTION), markdown checkboxes, imperative statements, and bullet points. Extracted items are automatically classified by priority (P0 through P3 based on urgency keywords) and type (bug, feature, enhancement, documentation, testing), then created as GitLab issues with appropriate labels and optional milestone/assignee assignments.

## Workflow Integration

The **/chatgpt-consult** command integrates into development workflows at decision points where alternative analytical perspectives add value. In the **architectural decision workflow**, architects use `deep` mode consultations with `comprehensive` context to explore design alternatives before committing to architectural choices. The consultation output, formatted as a `full-report`, becomes part of the decision record.

In the **sprint planning workflow**, the `planning` consultation type combined with `gitlab-issues` output automates the translation of strategic discussions into trackable work items. A single consultation can produce a set of prioritized, labeled, and milestone-assigned GitLab issues ready for sprint assignment.

The **debugging workflow** leverages `problem-solving` consultations in `collaborative` mode, where multi-session persistence allows iterative exploration of complex issues. Each session builds on previous findings, narrowing the investigation until root cause is identified.

For **code review workflows**, targeted consultations with `--files` parameters provide focused reviews on specific modules, with findings available as `action-items` or `summary` outputs for immediate developer consumption.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `chatgpt-bridge` agent via consultation coordinator |
| [/chatgpt-bridge](/commands/chatgpt-bridge/) | Underlying ChatGPT API communication layer |
| [/chatgpt-pack](/commands/chatgpt-pack/) | Context archive preparation for comprehensive consultations |
| [/chatgpt-analyze](/commands/chatgpt-analyze/) | Code analysis feeds consultation context |
| GitLab Issues API | Automatic issue creation from consultation action items |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](/glossary/quality-gates/) | Pre/post execution quality validation |
| [Telemetry](/glossary/telemetry/) | Command execution [metrics](/glossary/metrics/) and event tracking |
| Platform Knowledge Base | Context preparation draws on platform documentation |
| Phoenix PubSub | Real-time consultation event broadcasting |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Consultation sessions must produce actionable outcomes. No vague suggestions, no recommendations without implementation paths, no action items without priority classification. GitLab issue creation enforces completeness -- every created issue has a title, description, labels, and priority. Context preparation failures are reported explicitly rather than resulting in degraded consultations with incomplete information.
- **NO DOUBTS**: Consultation recommendations are treated as advisory intelligence, not authoritative decisions. The [NABLA Infinity](/glossary/nabla-infinity/) framework applies -- ChatGPT's recommendations are one signal among many, subject to validation against platform constraints, existing architecture decisions, and other analytical sources. When consultation outputs conflict with established platform patterns, both perspectives are preserved with explicit annotation rather than one being silently discarded.
- **Regression Protection**: Consultation templates, context preparation logic, and GitLab bridge integration include test suites that validate the end-to-end consultation pipeline against reference scenarios.

## Best Practices

1. **Choose the right consultation type**: Architecture questions go to `--type architecture`, debugging to `--type problem-solving`. The type selection determines which context is prepared, directly affecting consultation quality.
2. **Start with auto context**: The `auto` context level provides intelligent context selection for most consultations. Override to `comprehensive` only for major architectural decisions or `minimal` for quick questions.
3. **Use GitLab integration for planning**: When the consultation produces action items, use `--gitlab-sync --auto-create-issues` to automatically convert recommendations into trackable work items.
4. **Leverage collaborative mode for complex problems**: Multi-session consultations in `collaborative` mode build cumulative understanding, producing better outcomes for complex architectural or debugging scenarios than single-session interactions.
5. **Include relevant files explicitly**: For code review and problem-solving consultations, specify the relevant files with `--files` to ensure the consultation context includes the most pertinent source code.
6. **Review before acting on GitLab issues**: While automatic issue creation accelerates planning, always review generated issues before assigning to sprints. LLM-generated action items benefit from human validation of priority and scope.

## Related Commands

- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/test](/commands/test/) - Comprehensive test generation and verification
- [/chatgpt-bridge](/commands/chatgpt-bridge/) - ChatGPT bridge operations for cross-LLM coordination
- [/chatgpt-analyze](/commands/chatgpt-analyze/) - Launch ChatGPT ANALYZE conversation for deep code analysis
- [/chatgpt-pack](/commands/chatgpt-pack/) - Context packing for ChatGPT collaboration and knowledge transfer
- [/chatgpt-sync](/commands/chatgpt-sync/) - Synchronize context and progress between Claude and ChatGPT
- [/quality-gates](/commands/quality-gates/) - Enforce quality gate checkpoints with zero-warning compilation validation
- [/quality-enforce](/commands/quality-enforce/) - Mandatory progressive [quality debt](/glossary/quality-debt/) elimination with AIAD enforcement
- [/regression-check](/commands/regression-check/) - Execute 25 custom [Credo](/glossary/credo/) regression checks preventing 700+ violations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)