+++
title = "Session Discipline"
weight = 7
[extra]
icon = "clock"
color = "yellow"
description = "Mandatory GitLab tracking, continuous atomic commits, push enforcement, and session context preservation"
category = "workflow"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 983
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Session", "Discipline", "Mandatory", "GitLab", "capabilities", "workflow", "Prismatic Platform", "BLOCK", "Universal"]
tags = ["capabilities", "workflow", "session-discipline", "prismatic"]
quality_score = 80
see_also = ["glossary", "agents", "architecture"]
image = "/images/sections/capabilities.png"
image_alt = "Session Discipline - Prismatic Platform"
+++

## Overview

The Mandatory Session Discipline Protocol ensures that every development session on the Prismatic Platform is tracked, committed continuously, and pushed to remote. No work is ever lost, no changes go untracked, and every session produces a complete audit trail from issue creation through implementation to final push. This protocol governs all development activity across the platform's 99 umbrella applications and 2.8 million lines of code.

Session Discipline addresses a class of failures that no amount of code quality enforcement can prevent: work loss due to uncommitted changes, untracked sessions that produce orphaned code, and knowledge loss when session context is not preserved. These failures are particularly insidious because they are invisible until the damage is done -- a power failure, a system crash, or simply ending a session without pushing can result in hours of lost work.

The protocol integrates with [Quality Gates](/capabilities/quality-gates/) for commit validation, [Telemetry Integration](/capabilities/telemetry-integration/) for session tracking, and the [NO MERCY](/capabilities/no-mercy/) doctrine's enforcement infrastructure to create an unbypassable workflow discipline that protects both the developer and the platform.

## Session Lifecycle

Every development session follows a mandatory three-phase lifecycle with specific requirements at each phase. The lifecycle is enforced through automated tooling and cannot be bypassed.

### Phase 1: Session Initialization

| Requirement | Description | Enforcement |
|-------------|-------------|-------------|
| **GitLab Issue** | Create or link to existing GitLab issue for work items | MANDATORY - session blocked without ticket |
| **Context Loading** | Load latest session context from `.claude/session-context/` | AUTOMATIC - loaded at session start |
| **Branch Creation** | Create feature branch from main if needed | RECOMMENDED for feature work |
| **Baseline Check** | Run `mix autoheal.baseline` for quality baseline | MANDATORY per evolution protocol |
| **Status Check** | Run `mix autoevolve status --brief` for platform state | MANDATORY per evolution protocol |

```elixir
defmodule PrismaticClaude.SessionLifecycle do
  @moduledoc """
  Manages the development session lifecycle.
  Enforces Session Discipline Protocol requirements at each phase.
  """

  use GenServer

  @type session_state :: :initialized | :active | :completing | :closed

  defstruct [
    :session_id,
    :gitlab_issue,
    :branch,
    :started_at,
    :commits: [],
    :files_modified: [],
    :state: :initialized
  ]

  @spec start_session(gitlab_issue :: String.t()) ::
    {:ok, session_id :: String.t()} | {:error, term()}
  def start_session(gitlab_issue) do
    with :ok <- validate_gitlab_issue(gitlab_issue),
         {:ok, context} <- load_latest_context(),
         {:ok, baseline} <- run_quality_baseline() do
      session_id = generate_session_id()

      {:ok, session_id}
    else
      {:error, :no_gitlab_issue} ->
        {:error, "Session BLOCKED: GitLab issue required"}

      {:error, reason} ->
        {:error, "Session initialization failed: #{reason}"}
    end
  end

  defp validate_gitlab_issue(nil), do: {:error, :no_gitlab_issue}
  defp validate_gitlab_issue(""), do: {:error, :no_gitlab_issue}
  defp validate_gitlab_issue(_issue), do: :ok

  defp load_latest_context do
    context_dir = ".claude/session-context/"

    case File.ls(context_dir) do
      {:ok, files} ->
        latest = files |> Enum.sort() |> List.last()
        {:ok, File.read!(Path.join(context_dir, latest))}

      {:error, _} ->
        {:ok, "No previous session context found"}
    end
  end

  defp run_quality_baseline do
    case System.cmd("mix", ["autoheal.baseline"], stderr_to_stdout: true) do
      {output, 0} -> {:ok, output}
      {output, _} -> {:error, "Baseline check failed: #{output}"}
    end
  end

  defp generate_session_id do
    date = Date.utc_today() |> Date.to_iso8601()
    random = :crypto.strong_rand_bytes(4) |> Base.encode16(case: :lower)
    "#{date}-#{random}"
  end
end
```

### Phase 2: Active Development

During active development, the protocol enforces continuous commits and immediate push to remote:

| Requirement | Description | Enforcement |
|-------------|-------------|-------------|
| **Atomic commits** | One logical change per commit | MANDATORY - batching forbidden |
| **Local testing** | Run tests before every commit | MANDATORY - untested commits blocked |
| **Immediate commit** | Commit as soon as tests pass | MANDATORY - no accumulation |
| **Immediate push** | Push to remote after each commit | RECOMMENDED after each, MANDATORY at session end |
| **Progress tracking** | Update GitLab issue with progress | MANDATORY - tracked automatically |
| **Hook compliance** | All pre-commit hooks must pass | MANDATORY - `--no-verify` forbidden |

### Phase 3: Session Completion

| Requirement | Description | Enforcement |
|-------------|-------------|-------------|
| **All commits pushed** | Verify no unpushed commits remain | MANDATORY - session cannot close with unpushed work |
| **Context saved** | Save session context to `.claude/session-context/` | MANDATORY - preserves knowledge |
| **GitLab updated** | Close or update GitLab issue with final status | MANDATORY - tracked completion |
| **Evolution triggered** | Run `mix autoheal.cycle && mix autoevolve.mega` | MANDATORY per evolution protocol |

## Commit Standards

The Session Discipline Protocol enforces strict standards for every commit to ensure traceability, atomicity, and quality.

### Conventional Commits Format

All commits must follow the Conventional Commits specification:

```
type(scope): subject

[optional body explaining the "why"]

Co-Authored-By: Claude <noreply@anthropic.com>
```

| Type | Usage | Example |
|------|-------|---------|
| `feat` | New feature | `feat(perimeter): add NIS2 compliance checker` |
| `fix` | Bug fix (requires [regression test](/capabilities/regression-tests/)) | `fix(api): handle nil response in endpoint discovery` |
| `refactor` | Code restructuring | `refactor(storage): extract adapter trait` |
| `test` | Test additions or modifications | `test(perimeter): add property-based rating tests` |
| `docs` | Documentation updates | `docs(claude): update session context` |
| `perf` | Performance improvement | `perf(git-trees): optimize regex matching` |
| `chore` | Maintenance tasks | `chore(deps): update Phoenix to 1.7.18` |
| `ci` | CI/CD changes | `ci(gitlab): add Dialyzer stage` |

### Atomicity Requirements

Each commit must contain exactly one logical change. The following patterns are explicitly forbidden:

| Forbidden Pattern | Correct Approach |
|-------------------|-----------------|
| Multiple features in one commit | Separate commits per feature |
| Fix + refactor in one commit | Separate fix commit and refactor commit |
| Format changes mixed with logic | Format commit, then logic commit |
| Test + implementation in one commit | Acceptable when TDD (test-first) |
| Unrelated file changes grouped | Separate commits per concern |

## Forbidden Actions

The following actions are absolutely forbidden under the Session Discipline Protocol. Any attempt to execute these actions triggers an L4 violation escalation:

| Forbidden Action | Reason | Enforcement |
|-----------------|--------|-------------|
| `git commit --no-verify` | Bypasses quality gates | L4 SUPREME REVIEW |
| `git push --no-verify` | Bypasses push hooks | L4 SUPREME REVIEW |
| `git push --force` to main | Destroys repository history | L4 SUPREME REVIEW |
| `git reset --hard` without confirmation | Destroys uncommitted work | L3 REJECTION |
| `git checkout .` without confirmation | Discards all changes | L3 REJECTION |
| Batching multiple changes in one commit | Violates atomicity | L2 BLOCK |
| Committing without local test verification | Violates quality requirement | L2 BLOCK |
| Working without GitLab ticket | No traceability | L3 REJECTION |
| Session end without push to remote | Work loss risk | L2 BLOCK |
| Skipping session context save | Knowledge loss | L2 BLOCK |

## Session Context Preservation

Session context is saved to `.claude/session-context/` at session end (and recommended every 30 minutes during long sessions). The context file preserves the knowledge graph of the session for future sessions to build upon.

### Context File Format

```markdown
# Session Context: YYYY-MM-DD Description

## Objectives
- Primary objective description
- Secondary objectives if any

## Actions Taken
1. Action with file references
2. Action with commit hashes

## Files Modified
- `path/to/file.ex` - Description of changes
- `path/to/test_file.exs` - Tests added

## Key Decisions
- Decision description with rationale
- Alternative considered and why rejected

## Deliverables
- Feature/fix delivered with description
- Tests added with coverage summary

## Next Steps
- Recommended follow-up actions
- Outstanding items for future sessions

## GitLab Issues
- #ISSUE_NUMBER - Status and summary
```

### Context Loading

At session start, the most recent context file is loaded automatically, providing continuity across sessions:

```elixir
defmodule PrismaticClaude.SessionContext do
  @moduledoc """
  Manages session context persistence and loading.
  Ensures knowledge continuity across development sessions.
  """

  @context_dir ".claude/session-context/"

  @spec save_context(session_id :: String.t(), content :: String.t()) :: :ok | {:error, term()}
  def save_context(session_id, content) do
    filename = "#{session_id}-session.md"
    path = Path.join(@context_dir, filename)

    File.mkdir_p!(@context_dir)
    File.write!(path, content)

    # Also update the LATEST_SESSION.md symlink
    latest_path = Path.join(@context_dir, "LATEST_SESSION.md")
    File.write!(latest_path, content)

    :ok
  end

  @spec load_latest_context() :: {:ok, String.t()} | {:error, :no_context}
  def load_latest_context do
    latest_path = Path.join(@context_dir, "LATEST_SESSION.md")

    case File.read(latest_path) do
      {:ok, content} -> {:ok, content}
      {:error, _} -> {:error, :no_context}
    end
  end
end
```

## Violation Protocol

Session Discipline violations follow an escalation protocol aligned with the platform's enforcement framework:

| Violation | Severity | Response | Recovery |
|-----------|----------|----------|----------|
| Session without GitLab ticket | L3 REJECTION | Session blocked until ticket created | Create ticket, restart session |
| Unpushed commits at session end | L2 BLOCK | Push required before session closes | Execute `git push` |
| `--no-verify` flag usage | L4 SUPREME REVIEW | Immediate escalation, audit trail | Review, correction, new commit |
| Failed hooks bypassed | L4 SUPREME REVIEW | Platform integrity investigation | Full review of bypassed commits |
| Batch commit (multiple changes) | L2 BLOCK | Commit rejected, must split | `git reset --soft HEAD~1`, separate commits |
| Missing session context save | L2 BLOCK | Context must be saved before close | Save context, update LATEST_SESSION.md |
| Commit without local tests | L2 BLOCK | Commit rejected by pre-commit hook | Run tests, fix failures, recommit |

## Telemetry and Tracking

Every session lifecycle event emits telemetry for monitoring and audit purposes:

```elixir
# Session lifecycle telemetry events
:telemetry.execute([:prismatic_claude, :session_lifecycle, :start], %{}, %{
  session_id: session_id,
  gitlab_issue: issue_number,
  timestamp: DateTime.utc_now()
})

:telemetry.execute([:prismatic_claude, :session_lifecycle, :commit], %{count: 1}, %{
  session_id: session_id,
  commit_hash: hash,
  commit_type: :feat
})

:telemetry.execute([:prismatic_claude, :session_lifecycle, :end], %{
  duration: session_duration_ms,
  commit_count: total_commits
}, %{
  session_id: session_id,
  files_modified: file_count,
  pushed: true
})
```

## Integration Points

Session Discipline integrates with the broader platform infrastructure to ensure workflow compliance:

- **[NO MERCY](/capabilities/no-mercy/)**: Session Discipline is an enforcement mechanism of the zero-tolerance doctrine
- **[NO DOUBTS](/capabilities/no-doubts/)**: Context loading ensures investigation builds on prior session knowledge
- **[Quality Gates](/capabilities/quality-gates/)**: Pre-commit hooks validate every commit during the session
- **[Regression Tests](/capabilities/regression-tests/)**: Bug fix commits require regression tests per session protocol
- **[Telemetry Integration](/capabilities/telemetry-integration/)**: Session events tracked through telemetry pipeline
- **[Real-Time Monitoring](/capabilities/real-time-monitoring/)**: Session health visible in monitoring dashboards
- **[AIAD Standard](/capabilities/aiad-standard/)**: Agent sessions follow the same discipline requirements
- **[Trinity Gate](/capabilities/trinity-gate/)**: Critical session decisions may require Trinity validation
- **[Autonomous Self-Healing](/capabilities/autonomous-self-healing/)**: Session anomalies can trigger auto-healing

## Commands

| Command | Purpose | Authority |
|---------|---------|-----------|
| `/session-start` | Initialize session with GitLab tracking | Universal |
| `/session-save` | Save current session context | Universal |
| `/session-end` | Complete session with push verification | Universal |
| `/commit` | Atomic commit with session tracking | Universal |
| `/push` | Push all commits to remote | Universal |
| `/session-status` | Display current session state | Universal |

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)