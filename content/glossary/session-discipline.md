+++
title = "Session Discipline"
weight = 69
[extra]
description = "Mandatory GitLab tracking, continuous commits, push enforcement for all sessions"
category = "architecture"
related_terms = ["gitlab-ci", "pre-commit-hooks", "quality-gates", "nm-nd", "git-trees", "violation-protocol"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 822
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Session", "Discipline", "Mandatory", "GitLab", "glossary", "architecture", "Prismatic Platform", "Every"]
tags = ["glossary", "architecture", "session-discipline", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Session Discipline - Prismatic Platform"
+++

## Definition and Overview

Session Discipline is a P0 (Absolute) protocol mandating that every development session follows strict operational procedures to ensure traceability, prevent work loss, and maintain continuous quality enforcement. The protocol requires GitLab issue creation for all work items, continuous atomic commits rather than batching, immediate push to remote after each commit, local testing before every commit, all git hooks passing without bypass flags, and session context persistence for cross-session continuity.

The protocol addresses a fundamental problem in AI-assisted development: sessions are ephemeral but code changes are permanent. Without discipline, a productive session can produce excellent code that is lost to an interrupted connection, an unpushed commit, or an untested change that breaks the build. Session Discipline transforms the inherently volatile nature of development sessions into a reliable, traceable, auditable process where every change is tracked, tested, committed, and pushed as it happens rather than accumulated for a risky batch operation at session end.

Session Discipline is a direct expression of the NO MERCY, NO DOUBTS doctrine applied to development workflow. NO MERCY means zero tolerance for unpushed commits, untested changes, or missing issue tracking. NO DOUBTS means every action is deliberate, verified, and traceable. The protocol is not advisory -- it is enforced through automated hooks, session lifecycle automation, and violation escalation that can trigger L4 Supreme Review for the most serious breaches such as using `--no-verify` flags.

## Technical Deep Dive

### Protocol Requirements

The Session Discipline protocol mandates six non-negotiable requirements:

| Requirement | Description | Enforcement |
|-------------|-------------|-------------|
| GitLab Issue Tracking | Every work item has a corresponding GitLab issue | Session BLOCKED without tickets |
| Continuous Commits | Changes committed atomically and immediately | NO BATCHING allowed |
| Push to Remote | Every commit pushed to origin immediately | Unpushed work = incomplete session |
| Local Testing | All changes tested locally before commit | Untested code = rejected |
| All Hooks Pass | Pre-commit, commit-msg, pre-push hooks pass | NO BYPASS flags |
| Context Persistence | Session state saved to `.claude/session-context/` | Session context preserved |

### Forbidden Actions

The protocol explicitly forbids the following actions under any circumstances:

```elixir
defmodule PrismaticClaude.SessionDiscipline do
  @moduledoc """
  Enforces session discipline protocol.
  All forbidden actions trigger immediate violation response.
  """

  @forbidden_actions [
    {:git_no_verify_commit, "git commit --no-verify",
     :l4_supreme_review, "Bypasses pre-commit quality gates"},
    {:git_no_verify_push, "git push --no-verify",
     :l4_supreme_review, "Bypasses pre-push validation"},
    {:batch_commit, "Multiple unrelated changes in one commit",
     :l3_rejection, "Violates atomic commit requirement"},
    {:untested_commit, "Committing without local test verification",
     :l3_rejection, "Violates test-before-commit requirement"},
    {:no_ticket_work, "Working without GitLab ticket",
     :l3_rejection, "Violates issue tracking requirement"},
    {:unpushed_session_end, "Session ending with unpushed commits",
     :l2_block, "Violates immediate push requirement"}
  ]

  @type violation_level :: :l2_block | :l3_rejection | :l4_supreme_review

  @spec check_forbidden(String.t()) :: :ok | {:violation, violation_level(), String.t()}
  def check_forbidden(command) do
    case Enum.find(@forbidden_actions, fn {_id, pattern, _level, _reason} ->
      String.contains?(command, pattern)
    end) do
      nil -> :ok
      {_id, _pattern, level, reason} -> {:violation, level, reason}
    end
  end
end
```

### Session Execution Flow

Every session follows a mandatory three-phase execution flow:

```elixir
defmodule PrismaticClaude.SessionDiscipline.ExecutionFlow do
  @moduledoc """
  Manages the mandatory session execution flow.
  Each phase has specific requirements and validation.
  """

  @type session_phase :: :start | :active | :end

  @spec session_start(map()) :: {:ok, map()} | {:error, term()}
  def session_start(context) do
    with {:ok, issues} <- create_gitlab_issues(context),
         {:ok, prev_context} <- load_session_context(),
         {:ok, baseline} <- run_quality_baseline() do
      {:ok, %{
        phase: :active,
        issues: issues,
        previous_context: prev_context,
        baseline: baseline,
        commits: [],
        start_time: DateTime.utc_now()
      }}
    end
  end

  @spec during_session(map(), map()) :: {:ok, map()} | {:error, term()}
  def during_session(state, change) do
    with {:ok, _} <- run_local_tests(change),
         {:ok, commit} <- atomic_commit(change),
         {:ok, _} <- push_to_remote(commit),
         {:ok, _} <- update_gitlab_issue(state.issues, commit) do
      {:ok, %{state | commits: [commit | state.commits]}}
    end
  end

  @spec session_end(map()) :: {:ok, map()} | {:error, term()}
  def session_end(state) do
    with :ok <- verify_all_pushed(state.commits),
         :ok <- save_session_context(state),
         :ok <- close_gitlab_issues(state.issues) do
      {:ok, %{state | phase: :end}}
    end
  end
end
```

### Violation Escalation Protocol

Session Discipline violations trigger escalation based on severity:

| Level | Description | Trigger | Action |
|-------|-------------|---------|--------|
| L1 | Minor deviation | Late push, imprecise commit message | Warning + immediate correction |
| L2 | Workflow violation | Unpushed commits at session end | Block + required push |
| L3 | Protocol violation | No GitLab ticket, untested commit, batch commit | Rejection + restart from clean state |
| L4 | Integrity threat | `--no-verify` usage, hook bypass | Supreme Review + investigation |

```elixir
defmodule PrismaticClaude.SessionDiscipline.ViolationHandler do
  @moduledoc """
  Handles session discipline violations with appropriate escalation.
  """

  require Logger

  @spec handle_violation(violation_level(), String.t(), map()) :: :ok
  def handle_violation(:l1_warning, reason, context) do
    Logger.warning("Session Discipline L1: #{reason}")
    :telemetry.execute(
      [:prismatic_claude, :session_discipline, :violation],
      %{level: 1},
      %{reason: reason, session: context.session_id}
    )
  end

  def handle_violation(:l2_block, reason, context) do
    Logger.error("Session Discipline L2 BLOCK: #{reason}")
    :telemetry.execute(
      [:prismatic_claude, :session_discipline, :violation],
      %{level: 2},
      %{reason: reason, session: context.session_id}
    )
    block_further_operations(context)
  end

  def handle_violation(:l3_rejection, reason, context) do
    Logger.error("Session Discipline L3 REJECTION: #{reason}")
    reject_and_restart(context)
  end

  def handle_violation(:l4_supreme_review, reason, context) do
    Logger.error("Session Discipline L4 SUPREME REVIEW: #{reason}")
    escalate_to_supreme(context, reason)
  end
end
```

## Architecture and Implementation

### SessionLifecycle GenServer Integration

Session Discipline is enforced through the SessionLifecycle GenServer, which automates hook execution at session boundaries:

```elixir
defmodule PrismaticClaude.SessionLifecycle do
  @moduledoc """
  OTP GenServer managing session lifecycle with discipline enforcement.
  Executes hooks at session boundaries with circuit breaker protection.
  """

  use GenServer

  # 905 lines of implementation including:
  # - Priority-based hook registration
  # - Enable/disable per hook
  # - Circuit breaker (opens after 3 failures, resets after 60s)
  # - Telemetry event emission at all lifecycle points

  @impl true
  def handle_call({:trigger, :session_start}, _from, state) do
    # Execute mandatory hooks:
    # 1. Load session context
    # 2. Create GitLab issues
    # 3. Run mix autoheal.baseline
    # 4. Run mix autoevolve status --brief
    result = execute_hooks(:session_start, state)
    {:reply, result, update_state(state, :active)}
  end

  @impl true
  def handle_call({:trigger, :session_end}, _from, state) do
    # Execute mandatory hooks:
    # 1. Verify all commits pushed
    # 2. Save session context
    # 3. Run mix autoheal.cycle
    # 4. Close/update GitLab issues
    result = execute_hooks(:session_end, state)
    {:reply, result, update_state(state, :ended)}
  end
end
```

### Context Persistence Format

Session context is saved to `.claude/session-context/` in a structured markdown format:

```markdown
# Session Context: 2026-02-15 Feature Development

## Objectives
- Implement EASM dashboard filters
- Fix certificate expiry detection

## Actions Taken
1. Added LiveView filter component (commit abc123)
2. Fixed cert expiry parsing (commit def456)
3. Added regression tests (commit ghi789)

## Files Modified
- apps/prismatic_perimeter/lib/easm/dashboard_live.ex
- apps/prismatic_perimeter/lib/easm/cert_scanner.ex
- apps/prismatic_perimeter/test/easm/cert_scanner_test.exs

## Quality State
- Quality Score: 100/100
- Tests: All passing
- QDP: 0

## GitLab Issues
- #1290: EASM dashboard filters (closed)
- #1291: Certificate expiry fix (closed)

## Next Steps
- Implement dashboard export functionality
- Add compliance trend charts
```

### Atomic Commit Enforcement

The protocol enforces atomic commits through pre-commit validation:

```elixir
defmodule PrismaticClaude.SessionDiscipline.AtomicCommitValidator do
  @moduledoc """
  Validates that commits are atomic - single logical change per commit.
  Rejects commits that bundle unrelated changes.
  """

  @spec validate(list()) :: :ok | {:error, :non_atomic, String.t()}
  def validate(staged_files) do
    domains = categorize_files(staged_files)

    cond do
      length(Map.keys(domains)) > 2 ->
        {:error, :non_atomic, "Commit spans #{length(Map.keys(domains))} domains: #{inspect(Map.keys(domains))}"}

      mixed_test_and_source?(staged_files) and not regression_fix?(staged_files) ->
        {:error, :non_atomic, "Mixing unrelated test and source changes"}

      true ->
        :ok
    end
  end

  defp categorize_files(files) do
    Enum.group_by(files, fn file ->
      cond do
        String.contains?(file, "prismatic_perimeter") -> :perimeter
        String.contains?(file, "prismatic_web") -> :web
        String.contains?(file, "prismatic_agents") -> :agents
        String.contains?(file, "prismatic_safety") -> :safety
        true -> :other
      end
    end)
  end
end
```

## Usage in Prismatic Platform

### Session Workflow Commands

```bash
# Session start (automated via SessionLifecycle)
mix autoheal.baseline && mix autoevolve status

# During session - commit and push cycle
mix test apps/prismatic_perimeter/test/changed_test.exs  # Test first
git add apps/prismatic_perimeter/lib/changed_file.ex     # Stage specific files
git commit -m "fix(perimeter): correct certificate expiry parsing"  # Atomic commit
git push origin feature/cert-fix                          # Immediate push

# Session end (automated via SessionLifecycle)
mix autoheal.cycle && mix autoevolve.mega
```

### GitLab Integration

```bash
# Set GitLab credentials
export GITLAB_TOKEN="glpat-xxx"
export GITLAB_PROJECT_ID="korczis/prismatic-platform"

# Create session issue
glab issue create --title "Session: EASM dashboard improvements" --label "session"

# Update progress
glab issue note 1290 --message "Completed filter implementation, starting tests"

# Close on session end
glab issue close 1290 --comment "Session complete. All changes pushed and tested."
```

## Best Practices

1. **Create GitLab issues before writing code**. Issue-first development ensures every change is traceable to a requirement and provides the tracking infrastructure for progress updates.

2. **Commit after every logical change**. Do not accumulate changes. Each completed function, fixed bug, or added test should be its own commit. This maximizes traceability and minimizes risk.

3. **Push immediately after committing**. The time between commit and push is a window of vulnerability. Network issues, power failures, or session timeouts during this window can lose work.

4. **Test before every commit, not just at session end**. Running tests before each commit catches regressions immediately, when the change is fresh in context and easy to fix.

5. **Save session context even for short sessions**. Session context is the mechanism for cross-session continuity. Even a 15-minute session should persist its context for the next session to load.

## Common Pitfalls

- **Treating session discipline as overhead**: The protocol adds per-commit overhead (testing, pushing) but eliminates far larger costs from lost work, broken builds, and untraceable changes.

- **Batching "small" changes**: There is no threshold below which batching is acceptable. Even single-line changes should be committed atomically if they represent a complete logical change.

- **Forgetting to push before session end**: The most common violation. Automated session end hooks catch this, but relying on automation rather than habit leads to failures when hooks are not active.

- **Creating overly broad GitLab issues**: An issue like "improve the platform" provides no tracking value. Issues should be specific enough that they can be closed with a clear definition of done.

- **Skipping context persistence for "unimportant" sessions**: Every session produces context valuable for future sessions. Skipping persistence creates gaps in the quality improvement narrative.

## Related Concepts

- [Pre-Commit Hooks](/glossary/pre-commit-hooks/) -- Enforcement mechanism within sessions
- [Quality Gates](/glossary/quality-gates/) -- Gates enforced at every commit during sessions
- [NM/ND Doctrine](/glossary/nm-nd/) -- Governing framework mandating session standards
- [Violation Protocol](/glossary/violation-protocol/) -- Escalation for session discipline breaches
- [AIAD](/glossary/aiad/) -- Agent standard with session discipline compliance
- [Quality DNA](/glossary/quality-dna/) -- Cross-session quality persistence enabled by discipline
- [GitLab CI](/glossary/gitlab-ci/) -- CI/CD pipeline integration with session tracking

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Commands](/commands/) -- Session-related command catalog

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)