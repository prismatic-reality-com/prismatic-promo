+++
title = "AIAD Agent: session"
weight = 371
[extra]
domain = "critical"
level = "L3"
description = "Session lifecycle management agent creating GitLab issues for every Claude Code session with automatic progress tracking, context persistence, and session discipline enforcement"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "color-teams", "seadf", "telemetry", "osint", "genserver"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 95
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["AIAD", "Agent", "session", "GitLab", "Claude", "Code", "agents", "Prismatic Platform"]
tags = ["agents", "agent", "aiad-agent-session", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "AIAD Agent: session - Prismatic Platform"
+++

## Overview

The [AIAD](/glossary/aiad/) Session Agent operates as an L3 [strategic command](/glossary/strategic-command/) agent within the Critical domain of the Prismatic Platform. This agent enforces mandatory session discipline by creating GitLab issues for every Claude Code session, tracking progress automatically through step-by-step updates, and persisting session context to `.claude/session-context/` for cross-session continuity. In a development process where LLM-assisted coding sessions produce significant platform changes, untracked sessions represent an unacceptable governance gap.

The session tracking mandate addresses a fundamental challenge in LLM-assisted development: accountability and traceability. Every session that modifies the platform must have a corresponding GitLab issue that documents objectives, tracks progress, records decisions, and preserves the session context for future reference. This requirement is not bureaucratic overhead -- it is the mechanism by which the platform maintains an auditable record of its own evolution. When a decision made three months ago needs to be revisited, the session context provides the rationale, alternatives considered, and evidence evaluated at the time.

The agent implements the Mandatory Session Discipline Protocol defined in the platform's CLAUDE.md governance document. This protocol requires GitLab issue creation at session start, continuous commits pushed to remote during work, local testing before every commit, all git hooks passing without bypass, and session context saved at session end. The Session Agent automates and enforces each of these requirements, preventing sessions from operating outside the governance framework.

## Architecture

The Session Agent integrates with the `PrismaticClaude.SessionLifecycle` GenServer that manages session state through a hook-based architecture with priority ordering and circuit breaker protection.

The hook system supports registration of custom session lifecycle hooks with priority ordering (0-100) and enable/disable controls per hook. Default hooks implement the mandatory session discipline requirements: GitLab issue creation, context loading, quality baseline execution (`mix autoheal.baseline`), and autoevolve status check. Hooks execute in priority order, with lower numbers executing first.

A circuit breaker protects against cascading failures from flaky external services (GitLab API timeouts, mix task failures), automatically opening after 3 failures and resetting after 60 seconds. When the circuit breaker opens, the session can continue with degraded tracking capability rather than being completely blocked, but operators are alerted to the tracking gap.

The session state machine tracks four phases: start (issue creation and context loading), active (progress tracking and commit discipline), pre-end (final quality checks and context persistence), and end (issue update and cleanup). Each phase transition emits [telemetry](/glossary/telemetry/) events under `[:prismatic_claude, :session_lifecycle, *]` for monitoring and audit purposes.

## Core Capabilities

- **Automatic GitLab issue creation** generating structured issues at session start with objectives, estimated scope, affected components, and milestone association, using the GitLab API through configured project credentials
- **Step-by-step progress tracking** updating GitLab issues with progress notes as work proceeds, including files modified, tests executed, and decisions made during the session
- **Session context persistence** saving structured session summaries to `.claude/session-context/YYYY-MM-DD-{description}-session.md` including objectives, actions taken, files modified, deliverables, key decisions, and recommended next steps
- **Context loading at session start** reading the most recent session context file to provide continuity across sessions, enabling multi-session work on complex features without losing accumulated context
- **Commit discipline enforcement** verifying that commits are made frequently (not batched), pushed to remote immediately, and that all git hooks pass without `--no-verify` bypass flags
- **Session lifecycle telemetry** emitting telemetry events for session start, progress, commit, push, and end events enabling monitoring and compliance reporting

## Implementation

The Session Agent builds on the SessionLifecycle GenServer with hook-based extensibility and circuit breaker protection.

```elixir
defmodule PrismaticClaude.SessionLifecycle do
  use GenServer

  @session_phases [:start, :pre_command, :post_command, :end]
  @circuit_breaker_threshold 3
  @circuit_breaker_reset_ms 60_000

  def start_session(objectives, opts \\ []) do
    GenServer.call(__MODULE__, {:start_session, objectives, opts})
  end

  def record_progress(description, artifacts \\ []) do
    GenServer.cast(__MODULE__, {:progress, description, artifacts})
  end

  def end_session(summary) do
    GenServer.call(__MODULE__, {:end_session, summary})
  end

  def get_session_status do
    GenServer.call(__MODULE__, :status)
  end

  @impl true
  def handle_call({:start_session, objectives, opts}, _from, state) do
    with {:ok, issue} <- create_gitlab_issue(objectives, opts),
         {:ok, context} <- load_latest_context(),
         :ok <- run_startup_hooks(state.hooks) do
      emit_telemetry(:session_started, %{issue_id: issue.id})
      {:reply, {:ok, issue}, %{state | active_issue: issue, context: context, phase: :active}}
    else
      {:error, reason} ->
        handle_start_failure(reason, state)
    end
  end

  @impl true
  def handle_call({:end_session, summary}, _from, state) do
    with :ok <- verify_all_commits_pushed(),
         {:ok, context_path} <- save_session_context(summary, state),
         :ok <- update_gitlab_issue(state.active_issue, :completed, summary) do
      emit_telemetry(:session_ended, %{context_path: context_path})
      {:reply, {:ok, context_path}, reset_session(state)}
    end
  end

  @impl true
  def handle_cast({:progress, description, artifacts}, state) do
    update_gitlab_issue(state.active_issue, :in_progress, description)
    emit_telemetry(:progress_recorded, %{description: description})
    {:noreply, append_progress(state, description, artifacts)}
  end

  defp handle_start_failure(reason, state) do
    case check_circuit_breaker(state.circuit_breaker) do
      :closed -> {:reply, {:error, reason}, increment_failure(state)}
      :open -> {:reply, {:error, :circuit_breaker_open}, state}
    end
  end
end
```

The implementation delegates hook execution to `PrismaticClaude.SessionHooks` which provides default implementations for the mandatory session discipline requirements. Hooks execute mix tasks in isolated processes with timeout protection. Custom hooks can be registered for project-specific requirements without modifying the core session lifecycle.

## Integration Points

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [absolute-enforcement-commander-v6](/agents/absolute-enforcement-commander-v6/) | Quality Integration | Session commit discipline integrates with quality gate enforcement |
| [aiad-auto-evolution-supreme](/agents/aiad-auto-evolution-supreme/) | Evolution Trigger | Sessions trigger platform evolution assessment at start and end |
| [aiad-dashboard-commander](/agents/aiad-dashboard-commander/) | Visibility | Session status displayed on ecosystem monitoring dashboards |
| [alert-management-specialist](/agents/alert-management-specialist/) | Compliance Alert | Routes session discipline violations to appropriate escalation paths |
| GitLab API | External Service | Creates and updates issues for session tracking |

## Operational Workflow

The session lifecycle follows a strict workflow with mandatory checkpoints at each transition.

| Session Event | Required Action | Enforcement Level |
|--------------|----------------|-------------------|
| Session start | Create GitLab issue | BLOCKING -- session cannot proceed |
| Code change | Run local tests | BLOCKING -- commit prevented |
| Tests pass | Commit immediately | MANDATORY -- no batching |
| Commit created | Push to remote | MANDATORY -- no local-only commits |
| Hook failure | Fix and retry (no bypass) | ABSOLUTE -- `--no-verify` forbidden |
| Session end | Save context, update issue | MANDATORY -- session incomplete without |

The operational cycle begins with session initialization: objectives are defined, a GitLab issue is created, and the most recent session context is loaded. During the active phase, the agent monitors for code changes, enforces commit discipline, and tracks progress through GitLab issue updates. At session end, all commits are verified as pushed, a structured context file is saved, and the GitLab issue is updated with the session summary.

The commit discipline enforcement monitors git operations through filesystem watchers and hook integrations. When a code change is detected, local tests must pass before a commit is allowed. Commits must be pushed to the remote immediately -- local-only commits are flagged as discipline violations. The `--no-verify` flag on any git operation triggers an immediate L4 supreme review escalation.

## NABLA Compliance

The Session Agent implements NABLA Infinity axioms as core governance principles for session tracking.

**Provenance Mandatory.** Every session context file includes complete provenance: session objectives, actions taken, files modified, decisions made, and their rationale. This provenance chain enables any platform change to be traced back to the session that produced it, the objectives that motivated it, and the evidence that informed it.

**Time Decay.** Session context files carry timestamps and are organized chronologically. The context loading mechanism reads the most recent file, but older contexts remain accessible for historical reference. Stale context is explicitly identified during loading, preventing operators from acting on outdated information from previous sessions.

**Signal Plurality.** Session compliance is validated through multiple signals: GitLab issue existence (tracking signal), commit history (progress signal), push status (distribution signal), and hook execution results (quality signal). No single signal determines session compliance.

## Configuration

```elixir
config :prismatic_claude, PrismaticClaude.SessionLifecycle,
  gitlab_project_id: System.get_env("GITLAB_PROJECT_ID"),
  gitlab_token: System.get_env("GITLAB_TOKEN"),
  context_path: ".claude/session-context/",
  circuit_breaker_threshold: 3,
  circuit_breaker_reset_ms: 60_000,
  hook_timeout_ms: 30_000,
  telemetry_prefix: [:prismatic_claude, :session_lifecycle]
```

The AIAD specification at `.aiad/agents/aiad-agent-session.agent.md` defines L3 strategic command authority with enforcement block requiring `no-mercy-no-doubts` doctrine compliance. GitLab credentials are loaded from environment variables and never committed to the repository.

## Performance

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Issue creation time** | < 5s | < 10s | Time to create GitLab issue at session start |
| **Context load time** | < 1s | < 2s | Time to read and parse latest session context |
| **Progress update latency** | < 2s | < 5s | Time to update GitLab issue with progress note |
| **Context save time** | < 1s | < 2s | Time to persist session context at session end |
| **Session tracking compliance** | > 95% | 100% | Percentage of sessions with GitLab issues |
| **Hook success rate** | > 98% | > 99% | Percentage of lifecycle hooks executing successfully |

## Related Resources

- [AIAD Standard](/capabilities/aiad-standard/) -- Agent specification standard governing session agents
- [NO MERCY](/capabilities/no-mercy/) -- Quality enforcement doctrine with session discipline requirements
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Session lifecycle telemetry events
- [Architecture Overview](/architecture/) -- Platform architecture including session lifecycle
- [Commands](/commands/) -- Session-related commands and slash operations
- [Glossary](/glossary/) -- Technical terminology and concepts

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)