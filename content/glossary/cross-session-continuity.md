+++
title = "Cross-Session Continuity"
weight = 50
[extra]
description = "The Quality DNA persistence mechanism that maintains platform state, quality baselines, and context across independent development sessions"
category = "platform"
related_terms = ["configuration-drift", "consistency", "compilation", "code-quality", "confidence"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cross-session continuity", "Quality DNA", "session persistence", "state management", "context preservation", "glossary", "Prismatic Platform"]
tags = ["glossary", "platform", "quality"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Cross-Session Continuity - Prismatic Platform"
+++

## Definition & Overview

Cross-session continuity is the capability of a development platform to maintain state, context, and quality baselines across independent work sessions. In traditional development workflows, each session starts from scratch -- the developer must re-orient themselves, remember where they left off, and manually verify that the codebase is in the expected state. Cross-session continuity automates this process, creating a persistent "memory" that bridges the gap between sessions.

The challenge of cross-session continuity is analogous to maintaining institutional knowledge in an organization: when one person finishes their shift and another begins, the incoming person needs to understand what happened, what decisions were made, what the current state is, and what needs to happen next. Without this continuity, each session risks duplicating work, missing context, or inadvertently regressing previous improvements.

The Prismatic Platform implements cross-session continuity through three complementary mechanisms: the Quality DNA system (`.claude/quality-dna/current-state.json`), the Session Context system (`.claude/session-context/`), and the Stack-Based Conversation Mode (ETS-backed GenServer with disk persistence). Together, these systems ensure that every session starts with full awareness of previous sessions' outcomes, quality baselines, and ongoing work items.

## Technical Deep Dive

### Continuity Components

| Component | Storage | Scope | Update Frequency |
|-----------|---------|-------|-----------------|
| **Quality DNA** | JSON file | Quality metrics, violations, scores | Every commit |
| **Session Context** | Markdown files | Objectives, decisions, next steps | Session start/end |
| **Stack Conversation** | Binary + ETS | Conversation frames, checkpoints | Every response |
| **Quality Floor** | In-memory + file | Floor thresholds, guardian state | Session lifecycle |
| **AIAD Index** | Markdown + YAML | Agent/command registry state | On index rebuild |

### Quality DNA Persistence

```elixir
defmodule PrismaticClaude.QualityDNA do
  @moduledoc """
  Persists platform quality state across sessions.
  The Quality DNA captures the full quality profile of the codebase
  at a point in time, enabling cross-session drift detection and
  quality floor enforcement.
  """

  @dna_path ".claude/quality-dna/current-state.json"

  @type quality_state :: %{
    quality_score: non_neg_integer(),
    domain_scores: %{String.t() => non_neg_integer()},
    violation_counts: %{String.t() => non_neg_integer()},
    total_apps: non_neg_integer(),
    total_tests: non_neg_integer(),
    compilation_warnings: non_neg_integer(),
    credo_violations: non_neg_integer(),
    dialyzer_violations: non_neg_integer(),
    last_updated: String.t(),
    session_id: String.t(),
    generation: non_neg_integer()
  }

  @spec load() :: {:ok, quality_state()} | {:error, atom()}
  def load do
    case File.read(@dna_path) do
      {:ok, content} ->
        case Jason.decode(content, keys: :atoms) do
          {:ok, state} -> {:ok, state}
          {:error, _} -> {:error, :parse_error}
        end

      {:error, :enoent} ->
        {:error, :not_found}
    end
  end

  @spec save(quality_state()) :: :ok | {:error, term()}
  def save(state) do
    updated = Map.put(state, :last_updated, DateTime.utc_now() |> DateTime.to_iso8601())

    case Jason.encode(updated, pretty: true) do
      {:ok, json} ->
        File.mkdir_p!(Path.dirname(@dna_path))
        File.write!(@dna_path, json)
        :ok

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec detect_drift(quality_state(), quality_state()) :: [map()]
  def detect_drift(baseline, current) do
    checks = [
      check_score_drift(baseline.quality_score, current.quality_score),
      check_violation_drift(baseline.violation_counts, current.violation_counts),
      check_warning_drift(baseline.compilation_warnings, current.compilation_warnings)
    ]

    Enum.reject(checks, &is_nil/1)
  end

  defp check_score_drift(baseline_score, current_score) when current_score < baseline_score do
    %{
      type: :quality_regression,
      baseline: baseline_score,
      current: current_score,
      severity: if(baseline_score - current_score > 5, do: :critical, else: :warning)
    }
  end
  defp check_score_drift(_, _), do: nil

  defp check_violation_drift(baseline_counts, current_counts) do
    new_violations = Map.keys(current_counts)
    |> Enum.filter(fn key ->
      Map.get(current_counts, key, 0) > Map.get(baseline_counts, key, 0)
    end)

    if length(new_violations) > 0 do
      %{type: :new_violations, domains: new_violations, severity: :warning}
    end
  end

  defp check_warning_drift(0, current) when current > 0 do
    %{type: :new_warnings, count: current, severity: :critical}
  end
  defp check_warning_drift(_, _), do: nil
end
```

### Session Context Management

```elixir
defmodule PrismaticClaude.SessionContext do
  @moduledoc """
  Manages session context files for cross-session continuity.
  Each session produces a context file capturing objectives,
  actions, decisions, and next steps for subsequent sessions.
  """

  @context_dir ".claude/session-context"
  @latest_symlink ".claude/session-context/LATEST_SESSION.md"

  @type session_context :: %{
    session_id: String.t(),
    date: Date.t(),
    description: String.t(),
    objectives: [String.t()],
    actions_taken: [String.t()],
    files_modified: [String.t()],
    decisions: [String.t()],
    next_steps: [String.t()],
    quality_delta: map()
  }

  @spec save_context(session_context()) :: {:ok, String.t()}
  def save_context(context) do
    filename = "#{Date.to_iso8601(context.date)}-#{context.description}-session.md"
    filepath = Path.join(@context_dir, filename)

    content = format_context(context)

    File.mkdir_p!(@context_dir)
    File.write!(filepath, content)

    {:ok, filepath}
  end

  @spec load_latest() :: {:ok, String.t()} | {:error, :no_sessions}
  def load_latest do
    case File.read(@latest_symlink) do
      {:ok, content} -> {:ok, content}
      {:error, _} ->
        case list_sessions() do
          [latest | _] -> File.read(latest)
          [] -> {:error, :no_sessions}
        end
    end
  end

  @spec list_sessions() :: [String.t()]
  def list_sessions do
    Path.wildcard(Path.join(@context_dir, "*-session.md"))
    |> Enum.sort(:desc)
  end

  defp format_context(ctx) do
    """
    # Session Context: #{ctx.description}
    **Date**: #{Date.to_iso8601(ctx.date)}
    **Session ID**: #{ctx.session_id}

    ## Objectives
    #{Enum.map_join(ctx.objectives, "\n", &"- #{&1}")}

    ## Actions Taken
    #{Enum.map_join(ctx.actions_taken, "\n", &"- #{&1}")}

    ## Decisions
    #{Enum.map_join(ctx.decisions, "\n", &"- #{&1}")}

    ## Next Steps
    #{Enum.map_join(ctx.next_steps, "\n", &"- #{&1}")}
    """
  end
end
```

## Architecture & Implementation

The cross-session continuity architecture operates as a three-layer persistence system. The innermost layer (Quality DNA) captures numerical quality metrics that can be compared programmatically -- quality scores, violation counts, warning counts, and test coverage. This enables automated drift detection and quality floor enforcement. The middle layer (Session Context) captures human-readable session narratives -- objectives, decisions, and next steps that provide qualitative context for the next session. The outermost layer (Stack Conversation) captures the conversational state, enabling sessions to be forked, checkpointed, and resumed.

The Quality Floor Guardian uses Quality DNA as its enforcement baseline. At session start, it loads the previous Quality DNA state and compares it with the current codebase state. Any regression (lower quality score, new violations, new warnings) triggers an alert and potentially blocks operations until the regression is addressed. At session end, the updated Quality DNA is persisted, establishing the new baseline for the next session.

The Session Lifecycle GenServer (`PrismaticClaude.SessionLifecycle`) orchestrates the continuity protocol: loading previous state at session start, running quality baseline checks, and saving updated state at session end. The circuit breaker pattern protects against failures in the continuity system itself -- if Quality DNA loading fails, the session proceeds with degraded continuity rather than failing entirely.

## Usage in Prismatic Platform

Every Claude Code session with the Prismatic Platform benefits from cross-session continuity. The Automatic Startup Context Protocol mandates that on the first user message, the platform loads the latest session context, executes a quality baseline check, and provides a brief debrief with recommended next steps. This ensures that sessions start productively rather than requiring re-orientation.

The Quality DNA has tracked the platform's evolution from its early generations through the current Gen 19 (0.9995 fitness, 100/100 quality score). Each session's quality contribution is recorded, creating a historical record of quality improvement that demonstrates the cumulative effect of the NO MERCY doctrine.

The parallel session safety mechanism checks for concurrent sessions before saving context, preventing one session's context from overwriting another's. This is particularly important when multiple Claude Code sessions operate on different branches or features simultaneously.

## Cross-References

- [Configuration Drift](@/glossary/configuration-drift.md) - drift detected by cross-session comparison
- [Consistency](@/glossary/consistency.md) - state coherence maintained across sessions
- [Code Quality](@/glossary/code-quality.md) - quality metrics persisted by Quality DNA
- [Compilation](@/glossary/compilation.md) - compilation state tracked across sessions
- [Confidence](@/glossary/confidence.md) - confidence in quality state persistence
- **Livebooks**: `livebooks/domains/platform_administration/` - Quality DNA management
- **Academy**: Platform quality management and session lifecycle

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
