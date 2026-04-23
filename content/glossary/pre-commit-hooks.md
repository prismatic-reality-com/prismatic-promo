+++
title = "Pre-Commit Hooks"
weight = 70
[extra]
category = "architecture"
description = "Automated quality enforcement executed before each git commit, serving as the first line of defense in the quality pipeline"
related_terms = ["quality-gates", "session-discipline", "gitlab-ci", "nm-nd", "violation-protocol", "zero-warning-policy", "credo", "dialyzer", "quality-debt", "regression-test"]
pattern_type = "enforcement"
complexity = "medium"
enforcement_level = "P0"
bypass_policy = "ABSOLUTELY FORBIDDEN"
hook_phases = 10
hook_directory = ".githooks"
config_method = "core.hooksPath"
security_critical = true
otp_components = ["Mix.Task", "Regex", "File", "System"]
elixir_libraries = ["Credo", "Dialyzer", "ExUnit"]
key_modules = ["PrismaticSafety.PredictivePreCommit", "PrismaticSafety.QualityFloorGuardian"]
blocking_behavior = "exit code non-zero blocks commit"
max_duration_target = "30 seconds"
date_created = "2025-03-10"
date_updated = "2026-02-22"
doctrine = "no-mercy-no-doubts"
violation_level = "L4 Supreme Review for bypass attempts"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1622
date_modified = "2026-02-23"
keywords = ["Pre-Commit", "Hooks", "Automated", "glossary", "architecture", "Prismatic Platform", "Supreme Review"]
tags = ["glossary", "architecture", "pre-commit-hooks", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Pre-Commit Hooks - Prismatic Platform"
+++

## Definition

Pre-commit hooks are Git hook scripts that execute automatically before each commit is finalized, serving as the first line of defense in a quality enforcement pipeline. They run programmatic checks against staged changes -- including compilation verification, static analysis, test execution, pattern detection, and security scanning -- and block the commit if any check fails. Pre-commit hooks transform quality standards from documentation-level aspirations into mechanically enforced constraints that cannot be circumvented without explicit, auditable bypass actions.

In the broader software engineering context, Git hooks are scripts triggered by Git lifecycle events (pre-commit, commit-msg, pre-push, post-merge). Pre-commit hooks specifically intercept the commit operation, executing between `git commit` invocation and the actual commit object creation. If the hook script exits with a non-zero status, Git aborts the commit, forcing the developer to address the identified issues before the code enters the repository history.

## Historical Context and Rationale

The practice of automated pre-commit validation has evolved significantly since Git introduced its hook system in 2005. Early hook usage was limited to simple formatting checks (trailing whitespace, tab-space consistency) because the overhead of more sophisticated analysis was prohibitive on the hardware of that era. As development machines grew more powerful and static analysis tools more efficient, the scope of pre-commit enforcement expanded dramatically.

The Python ecosystem's `pre-commit` framework (2014) popularized the concept of declarative hook configuration, spawning equivalents in every major language ecosystem. Husky (JavaScript), Overcommit (Ruby), and Lefthook (Go) followed, each providing framework-level hook management. The common thread across all these tools is the recognition that code quality cannot be maintained through human discipline alone -- it requires mechanical enforcement.

In Elixir ecosystems specifically, the combination of compilation warnings (`--warnings-as-errors`), [Credo](@/glossary/credo.md) static analysis, [Dialyzer](@/glossary/dialyzer.md) type checking, and ExUnit testing creates a particularly rich pre-commit validation surface. The BEAM's compilation model, where individual modules can be recompiled independently, makes incremental pre-commit checks efficient even in large codebases.

The Prismatic Platform has elevated pre-commit hooks from a development convenience to a governance mechanism. Under the [NO MERCY, NO DOUBTS doctrine](@/glossary/nm-nd.md), pre-commit hooks are not optional tooling -- they are mandatory enforcement infrastructure. The `--no-verify` flag, which Git provides as an escape hatch to skip hooks, is classified as a violation-level offense subject to L4 Supreme Review escalation.

## Overview

The fundamental challenge in maintaining code quality at scale is enforcement consistency. Code review catches many issues but is inherently manual, asynchronous, and subject to reviewer fatigue. CI/CD pipelines catch issues but only after code has been committed and pushed. Pre-commit hooks fill the gap by catching issues at the earliest possible point -- before code enters the repository -- providing immediate feedback to the developer while the context of the change is fresh.

Effective pre-commit hooks balance thoroughness with speed. Running the full test suite on every commit would ensure quality but would also make commits take minutes, destroying developer flow. The optimal strategy runs fast, high-value checks locally (compilation, linting, pattern detection on changed files) and defers slower checks (full test suite, integration tests, Dialyzer) to CI/CD pipelines. This tiered approach ensures that the most common and dangerous issues are caught immediately while comprehensive verification happens asynchronously.

Pre-commit hooks are particularly powerful in large codebases with many contributors, where maintaining consistent quality standards across diverse development styles is critical. By encoding standards as executable checks rather than written guidelines, hooks eliminate the interpretation gap between "what the standard says" and "what developers actually do."

## Technical Architecture

### Git Hook Execution Model

```
Developer runs: git commit -m "message"
    |
    v
Git reads .git/hooks/pre-commit (or configured hookPath)
    |
    v
Hook script executes sequentially:
    |-- Phase 1: File validation (no secrets, valid encoding)
    |-- Phase 2: Compilation (mix compile --warnings-as-errors)
    |-- Phase 3: Static analysis (mix credo --strict)
    |-- Phase 4: Pattern detection (anti-pattern scanning)
    |-- Phase 5: Changed file tests (mix test <changed_files>)
    |-- Phase 6: QDP scan (quality debt point detection)
    |-- Phase 7: Forbidden patterns (mocks, stubs, placeholders)
    |-- Phase 8: Template validation (promo site templates)
    |-- Phase 9: Predictive regression analysis
    |-- Phase 10: Design consistency validation
    |
    v
Exit code 0? --> Commit proceeds
Exit code != 0? --> Commit BLOCKED, error displayed
```

### Hook Configuration

Git hooks are configured via the `core.hooksPath` configuration or symlinks from `.git/hooks/`:

```bash
# Set hooks path to the project's hooks directory
git config core.hooksPath .githooks

# Or create symlinks
ln -sf ../../.githooks/pre-commit .git/hooks/pre-commit
```

### Multi-Phase Pre-Commit Script

```bash
#!/usr/bin/env bash
set -euo pipefail

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
ELIXIR_FILES=$(echo "$STAGED_FILES" | grep '\.ex$' || true)

# Phase 1: Secret detection
echo "Phase 1: Checking for secrets..."
if git diff --cached --diff-filter=ACM | grep -iE \
  '(api_key|secret_key|password|token|private_key)[\s]*[:=][\s]*["\x27][^"\x27]+["\x27]'; then
  echo "ERROR: Potential secret detected in staged changes"
  exit 1
fi

# Phase 2: Compilation check
echo "Phase 2: Compilation verification..."
if ! mix compile --warnings-as-errors 2>&1; then
  echo "ERROR: Compilation failed or warnings detected"
  exit 1
fi

# Phase 3: Static analysis on changed files
echo "Phase 3: Static analysis..."
if [ -n "$ELIXIR_FILES" ]; then
  if ! mix credo --strict $ELIXIR_FILES 2>&1; then
    echo "ERROR: Credo violations detected"
    exit 1
  fi
fi

# Phase 4: Anti-pattern detection
echo "Phase 4: Pattern detection..."
if git diff --cached | grep -n 'length(.*) > 0'; then
  echo "ERROR: length() > 0 anti-pattern. Use Enum.any?/1 or pattern matching"
  exit 1
fi

if git diff --cached | grep -n 'Process\.sleep'; then
  echo "ERROR: Process.sleep detected. Use Process.send_after or :timer"
  exit 1
fi

# Phase 5: Run tests for changed modules
echo "Phase 5: Running tests for changed modules..."
TEST_FILES=$(echo "$ELIXIR_FILES" | \
  sed 's|lib/|test/|;s|\.ex$|_test.exs|' | \
  xargs -I{} sh -c 'test -f {} && echo {}' || true)
if [ -n "$TEST_FILES" ]; then
  if ! mix test $TEST_FILES 2>&1; then
    echo "ERROR: Tests failed for changed modules"
    exit 1
  fi
fi

# Phase 6: Quality debt point scan
echo "Phase 6: QDP scan..."
if ! mix quality.forbidden_patterns --count-only 2>&1; then
  echo "ERROR: Forbidden patterns detected"
  exit 1
fi

echo "All pre-commit checks passed"
exit 0
```

## Predictive Pre-Commit System

Within the Prismatic Platform, pre-commit hooks are defined in `.githooks/` and include the Predictive Pre-Commit quality protection system -- an advanced hook that goes beyond static checks to predict quality regressions based on change patterns:

```elixir
defmodule PrismaticSafety.PredictivePreCommit do
  @moduledoc """
  Predictive pre-commit quality protection system.
  Analyzes staged changes for risk patterns that historically
  correlate with quality regressions. Uses pattern matching
  against a curated risk taxonomy to provide early warning
  of potential quality issues.
  """

  @type risk_severity :: :high | :medium | :low
  @type risk_finding :: %{
    file: String.t(),
    pattern: atom(),
    severity: risk_severity(),
    message: String.t(),
    match_count: non_neg_integer()
  }

  @risk_patterns [
    {:process_sleep, ~r/Process\.sleep/, :high,
     "Process.sleep blocks the calling process. Use Process.send_after or :timer.send_interval"},
    {:length_check, ~r/length\(.*\)\s*>\s*0/, :medium,
     "length() > 0 traverses the entire list. Use Enum.any?/1 or match?([_ | _], list)"},
    {:unsafe_map_access, ~r/\w+\.\w+(?!\()/, :high,
     "Unsafe map access (map.key) raises on missing key. Use Map.get/3 or pattern matching"},
    {:missing_spec, ~r/def\s+\w+\(/, :medium,
     "Public function without @spec. Add typespec for Dialyzer analysis"},
    {:todo_fixme, ~r/(TODO|FIXME|HACK|XXX)/, :low,
     "TODO/FIXME comment detected. Resolve or create a tracked issue"},
    {:hardcoded_url, ~r/http:\/\/localhost/, :medium,
     "Hardcoded localhost URL detected. Use configuration or environment variables"},
    {:bare_raise, ~r/raise\s+"not implemented"/, :high,
     "Stub implementation detected. Complete the implementation before committing"}
  ]

  @spec analyze_staged_changes() :: {:ok, []} | {:error, [risk_finding()]}
  def analyze_staged_changes do
    findings =
      staged_files()
      |> Enum.flat_map(&analyze_file/1)
      |> Enum.sort_by(& &1.severity, :desc)

    case findings do
      [] -> {:ok, []}
      findings -> {:error, findings}
    end
  end

  @spec staged_files() :: [String.t()]
  defp staged_files do
    {output, 0} = System.cmd("git", ["diff", "--cached", "--name-only", "--diff-filter=ACM"])
    output |> String.split("\n", trim: true) |> Enum.filter(&String.ends_with?(&1, ".ex"))
  end

  defp analyze_file(file_path) do
    diff = get_staged_diff(file_path)

    @risk_patterns
    |> Enum.flat_map(fn {name, pattern, severity, message} ->
      case Regex.scan(pattern, diff) do
        [] ->
          []

        matches ->
          [%{
            file: file_path,
            pattern: name,
            severity: severity,
            message: message,
            match_count: length(matches)
          }]
      end
    end)
  end

  @spec get_staged_diff(String.t()) :: String.t()
  defp get_staged_diff(file_path) do
    {output, 0} = System.cmd("git", ["diff", "--cached", "--", file_path])
    output
  end
end
```

## Platform Hook Phases

The Prismatic Platform's pre-commit hook runs 10 phases sequentially, ordered by speed and severity to provide the fastest feedback for the most critical issues:

| Phase | Check | Blocking | Duration | What It Catches |
|-------|-------|----------|----------|-----------------|
| 1 | Secret detection | Yes | ~1s | API keys, passwords, tokens in code |
| 2 | File encoding validation | Yes | ~0.5s | Invalid UTF-8, binary files |
| 3 | Compilation (`--warnings-as-errors`) | Yes | ~5-15s | Type errors, unused variables, warnings |
| 4 | Credo strict (changed files) | Yes | ~2-5s | Code style, complexity, readability |
| 5 | Anti-pattern detection | Yes | ~1s | `length() > 0`, `Process.sleep`, unsafe access |
| 6 | Changed file tests | Yes | ~5-30s | Functional regressions in modified code |
| 7 | QDP scan | Yes | ~2s | Mocks, stubs, placeholders, forbidden patterns |
| 8 | Template validation | Yes (promo) | ~1s | Invalid HTML structure, broken links |
| 9 | Predictive regression analysis | Warning | ~2s | Historical risk pattern correlation |
| 10 | Design consistency | Yes (promo) | ~1s | Flowbite sidebar rules, grid layout violations |

The total hook execution time for a typical change (3-5 Elixir files) is 20-40 seconds. This is within the acceptable range for maintaining developer flow while providing comprehensive validation.

## No-Verify Prohibition

The `--no-verify` flag is **absolutely forbidden** by the [Session Discipline](@/glossary/session-discipline.md) protocol:

| Action | Status | Consequence |
|--------|--------|-------------|
| `git commit --no-verify` | FORBIDDEN | L4 Supreme Review escalation |
| `git push --no-verify` | FORBIDDEN | L4 Supreme Review escalation |
| Modifying hook scripts to bypass | FORBIDDEN | L4 Supreme Review escalation |
| Removing hooks directory | FORBIDDEN | L4 Supreme Review escalation |
| Setting empty `core.hooksPath` | FORBIDDEN | L4 Supreme Review escalation |

This prohibition is enforced at the doctrine level by the [NO MERCY, NO DOUBTS](@/glossary/nm-nd.md) framework. The rationale is that bypassing hooks means bypassing quality standards, which means accepting [quality debt](@/glossary/quality-debt.md) -- a direct violation of the platform's zero-QDP mandate. Every bypass represents a conscious decision to degrade platform integrity.

## Integration with Quality Floor Guardian

The pre-commit hooks integrate with the [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) to form a continuous quality enforcement loop:

```elixir
defmodule PrismaticSafety.PreCommitGate do
  @moduledoc """
  Pre-commit gate integration with the Quality Floor Guardian.
  Checks current quality floor status before allowing commits.
  If the quality floor is in EMERGENCY state, all commits are blocked
  regardless of individual hook results.
  """

  @spec check_quality_floor() :: :ok | {:error, String.t()}
  def check_quality_floor do
    case PrismaticSafety.QualityFloorGuardian.current_status() do
      :optimal -> :ok
      :warning -> :ok
      :critical -> {:error, "Quality floor CRITICAL: investigate before committing"}
      :emergency -> {:error, "Quality floor EMERGENCY: all commits BLOCKED"}
    end
  end

  @spec run_all_phases() :: {:ok, map()} | {:error, map()}
  def run_all_phases do
    with :ok <- check_quality_floor(),
         {:ok, _} <- check_secrets(),
         {:ok, _} <- check_compilation(),
         {:ok, _} <- check_credo(),
         {:ok, _} <- check_anti_patterns(),
         {:ok, _} <- check_tests(),
         {:ok, _} <- check_forbidden_patterns() do
      {:ok, %{phases_passed: 7, status: :all_clear}}
    end
  end
end
```

## Comparison with Quality Enforcement Alternatives

| Approach | Execution Point | Speed | Enforcement | Scope | Prismatic Usage |
|----------|----------------|-------|-------------|-------|-----------------|
| **Pre-Commit Hooks** | Before commit | Fast (seconds) | Local, bypassable (normally) | Changed files | Primary enforcement |
| **CI/CD Pipeline** | After push | Slow (minutes) | Remote, mandatory | Full codebase | Secondary verification |
| **IDE Linting** | During editing | Instant | Advisory only | Open file | Developer convenience |
| **Code Review** | After push | Hours/days | Manual gate | Changed files | Human judgment layer |
| **Pre-Push Hooks** | Before push | Moderate | Local, bypassable | Committed changes | Additional gate |
| **Post-Commit Hooks** | After commit | N/A | Notification only | Committed changes | Telemetry emission |
| **[Quality Gates](@/glossary/quality-gates.md)** | On demand | Variable | Mix task | Full codebase | Comprehensive scan |

The optimal strategy combines pre-commit hooks (fast local checks), CI/CD (comprehensive remote checks), and code review (human judgment) -- each layer catching what the previous layer misses.

## Best Practices

**Keep Hooks Fast**: Pre-commit hooks should complete in under 30 seconds for most changes. Developers who wait minutes for hooks will find ways to bypass them, undermining the entire quality infrastructure. The Prismatic Platform targets 20-40 seconds for typical commits.

**Check Changed Files Only**: Run static analysis and tests only on files included in the current commit, not the entire codebase. Full-codebase checks belong in CI/CD pipelines. Use `git diff --cached --name-only` to identify staged files.

**Provide Clear Error Messages**: When a hook blocks a commit, explain exactly what failed, where, and how to fix it. Include the file path, line number, and a remediation suggestion. Cryptic error messages lead to frustration and bypass attempts.

**Version Control Hooks**: Store hook scripts in the repository (e.g., `.githooks/`) rather than relying on developer-local configuration. Use `core.hooksPath` or project setup scripts to ensure all developers use the same hooks.

**Phase Ordering**: Run fastest checks first. If secret detection takes 1 second and compilation takes 15 seconds, run secret detection first to provide fast feedback for the most critical issue.

**Graceful Degradation**: If a hook depends on an external tool that might not be installed, check for its presence and provide a helpful error message rather than a cryptic failure. For example, verify that `mix` is available before running Credo checks.

**Incremental Analysis**: Where possible, analyze only the diff rather than the full file. This reduces false positives from pre-existing issues and focuses feedback on the current change.

## Use Cases

**Quality Standard Enforcement**: Ensuring that code quality standards (zero warnings, complete typespecs, no anti-patterns) are mechanically enforced rather than relying on developer discipline or review thoroughness.

**Secret Prevention**: Detecting accidentally staged credentials, API keys, and private keys before they enter repository history, where they persist even after deletion from the working tree.

**Regression Prevention**: Running tests for changed modules before commit, catching regressions at the earliest possible point in the development cycle. This is particularly effective when combined with the [mandatory regression test protocol](@/glossary/regression-test.md).

**Standard Compliance**: Enforcing coding standards (formatting, naming conventions, documentation requirements) consistently across all contributors regardless of IDE configuration.

**Security Scanning**: Running lightweight security checks (dependency vulnerability scanning, unsafe function detection) before code enters the repository.

**Anti-Pattern Detection**: Identifying known problematic patterns (`length() > 0`, `Process.sleep`, unsafe map access) at commit time, before they propagate through code review and into production.

## Common Pitfalls

**Over-Zealous Hooks**: Running too many checks or checks that are too slow creates developer friction. If hooks regularly take more than 60 seconds, developers will resist using them. Balance thoroughness with speed.

**False Positives**: Hooks that frequently flag non-issues erode trust. Tune pattern matching to minimize false positives, and provide escape mechanisms for legitimate exceptions (documented in code comments, not `--no-verify`).

**Environment Dependency**: Hooks that depend on specific tool versions, system libraries, or environment variables may fail inconsistently across developer machines. Document requirements and verify them at hook startup.

**Stale Hook Scripts**: When hooks are symlinked from a versioned directory, ensure developers regularly update their hook configuration after pulling changes. Consider using a setup script that runs automatically.

## Related Concepts

- [Quality Gates](@/glossary/quality-gates.md) - Full enforcement pipeline that hooks invoke
- [Session Discipline](@/glossary/session-discipline.md) - Protocol forbidding hook bypass
- [Violation Protocol](@/glossary/violation-protocol.md) - Escalation for hook bypass attempts
- [Zero Warning Policy](@/glossary/zero-warning-policy.md) - Compilation standard enforced by hooks
- [NM/ND Doctrine](@/glossary/nm-nd.md) - Governing framework mandating hook compliance
- [Quality Debt](@/glossary/quality-debt.md) - QDP scanning performed by pre-commit hooks
- [Regression Test](@/glossary/regression-test.md) - Test execution triggered by hooks
- [Credo](@/glossary/credo.md) - Static analysis tool invoked in Phase 4
- [Dialyzer](@/glossary/dialyzer.md) - Type checking deferred to CI but informed by hooks
- [GitLab CI](@/glossary/gitlab-ci.md) - CI/CD pipeline providing comprehensive post-push checks

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Capabilities](@/capabilities/_index.md) - Quality enforcement capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
