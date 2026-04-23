+++
title = "Pre-Commit Security Gates: 9 Blocking Pillars for Code Quality"
date = 2026-03-06
description = "Implementing pre-commit hooks that enforce 9 blocking security and quality pillars: grep scanning for String.to_atom, hardcoded secrets, AST analysis mix tasks, and pillar-based enforcement architecture."

[extra]
author = "Tomas Korcak (korczis)"
category = "security"
tags = ["pre-commit", "security", "elixir", "ci-cd", "code-quality"]
reading_time = "9 min"
keywords = ["pre-commit hooks", "security gates", "string to atom", "ast analysis", "elixir quality"]
image = "/images/blog/pre-commit-security-gates.png"
word_count = 1090
date_created = "2026-03-06"
date_modified = "2026-03-06"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "Pre-Commit Security Gates - Prismatic Platform"
+++

## Shifting Security Left

The most expensive bugs are the ones that reach production. Every stage of the pipeline where you can catch a vulnerability — from IDE to pre-commit to CI to staging — reduces the cost and risk by an order of magnitude. Pre-commit hooks are the first automated gate, running in milliseconds on every commit attempt.

Our platform enforces 9 blocking pillars at the pre-commit stage. These are not advisory warnings — they reject the commit entirely. The developer must fix the violation before the commit can proceed. This eliminates entire categories of vulnerabilities from the codebase.

## The 9 Blocking Pillars

Each pillar targets a specific class of vulnerability or quality issue:

| Pillar | Enforcement | Target | Detection Speed |
|--------|------------|--------|-----------------|
| ZERO | Blocking | String.to_atom, bare rescue, unsafe binary_to_term | < 50ms |
| SEAL | Blocking | Hardcoded secrets, SQL injection, Code.eval | < 50ms |
| PERF | Blocking | length() for emptiness, unbounded queries | < 50ms |
| HYGIENE | Blocking | File size limits, trailing whitespace, merge conflicts | < 100ms |
| NMND | Blocking | Placeholders, TODO/FIXME in lib/, stubs | < 50ms |
| TACH | Blocking | Missing test files for changed modules | < 200ms |
| DOCS | Blocking | Missing @moduledoc, @doc, @spec | < 500ms |
| DEPS | Blocking | Unversioned deps, unstable git refs | < 100ms |
| RDME | Blocking | Missing README.md in umbrella apps | < 50ms |

## Hook Architecture

The pre-commit hook is a shell script that runs each pillar check sequentially. Any single failure blocks the entire commit:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Pre-commit hook: 9 blocking pillars
# Runs against staged files only for speed

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
STAGED_EX_FILES=$(echo "$STAGED_FILES" | grep -E '\.ex$' || true)
STAGED_LIB_FILES=$(echo "$STAGED_EX_FILES" | grep '^apps/.*/lib/' || true)
EXIT_CODE=0

# === PILLAR 1: ZERO (Runtime Safety) ===
if [ -n "$STAGED_LIB_FILES" ]; then
  # Check for String.to_atom (atom table exhaustion)
  if echo "$STAGED_LIB_FILES" | xargs grep -n 'String\.to_atom(' 2>/dev/null | \
     grep -v 'String\.to_existing_atom(' | grep -v '# ZERO:OK'; then
    echo "ZERO VIOLATION: String.to_atom found. Use String.to_existing_atom instead."
    EXIT_CODE=1
  fi

  # Check for bare rescue (swallowed errors)
  if echo "$STAGED_LIB_FILES" | xargs grep -nP 'rescue\s+_\s*->' 2>/dev/null | \
     grep -v '# ZERO:TYPED'; then
    echo "ZERO VIOLATION: Bare rescue found. Catch specific exception types."
    EXIT_CODE=1
  fi

  # Check for unsafe binary_to_term
  if echo "$STAGED_LIB_FILES" | xargs grep -n 'binary_to_term(' 2>/dev/null | \
     grep -v '\[:safe\]' | grep -v '# ZERO:OK'; then
    echo "ZERO VIOLATION: Unsafe binary_to_term. Use [:safe] option."
    EXIT_CODE=1
  fi
fi
```

## SEAL Pillar: Secret Detection

The SEAL pillar scans for hardcoded secrets using pattern matching. This catches API keys, passwords, private keys, and cloud credentials before they enter the repository:

```elixir
defmodule Prismatic.Enforcement.SEAL.SecretScanner do
  @moduledoc """
  AST-based secret detection for pre-commit and CI enforcement.
  Scans Elixir source files for hardcoded credentials and API keys.
  """

  @patterns [
    {~r/(?:api[_-]?key|secret[_-]?key|password)\s*[:=]\s*"[^"]{8,}"/, :credential},
    {~r/sk-[a-zA-Z0-9]{20,}/, :stripe_key},
    {~r/ghp_[a-zA-Z0-9]{36}/, :github_token},
    {~r/AKIA[0-9A-Z]{16}/, :aws_access_key},
    {~r/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, :private_key},
    {~r/xox[bporas]-[a-zA-Z0-9-]+/, :slack_token},
    {~r/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+/, :jwt_token}
  ]

  @spec scan_file(String.t()) :: list(map())
  def scan_file(file_path) do
    case File.read(file_path) do
      {:ok, content} ->
        content
        |> String.split("\n")
        |> Enum.with_index(1)
        |> Enum.flat_map(fn {line, line_number} ->
          scan_line(line, line_number, file_path)
        end)

      {:error, _} ->
        []
    end
  end

  defp scan_line(line, line_number, file_path) do
    # Skip comments and test fixtures
    trimmed = String.trim(line)

    if String.starts_with?(trimmed, "#") or String.contains?(line, "test_fixture") do
      []
    else
      Enum.flat_map(@patterns, fn {pattern, type} ->
        if Regex.match?(pattern, line) do
          [%{
            file: file_path,
            line: line_number,
            type: type,
            severity: :critical,
            message: "Potential hardcoded #{type} detected"
          }]
        else
          []
        end
      end)
    end
  end
end
```

## TACH Pillar: Test File Existence

The TACH pillar ensures that every changed module in `lib/` has a corresponding test file. This does not verify test content — it verifies that the test file exists:

```elixir
defmodule Prismatic.Enforcement.TACH.TestCoverage do
  @moduledoc """
  Verifies test file existence for changed source modules.
  Maps lib/ paths to test/ paths and checks existence.
  """

  @spec check_changed_files(list(String.t())) :: {:ok, list()} | {:violations, list(map())}
  def check_changed_files(staged_files) do
    violations =
      staged_files
      |> Enum.filter(&lib_file?/1)
      |> Enum.reject(&excluded?/1)
      |> Enum.map(fn file -> {file, expected_test_path(file)} end)
      |> Enum.reject(fn {_src, test_path} -> File.exists?(test_path) end)
      |> Enum.map(fn {src, test_path} ->
        %{
          source_file: src,
          expected_test: test_path,
          message: "Missing test file for #{src}"
        }
      end)

    if violations == [] do
      {:ok, []}
    else
      {:violations, violations}
    end
  end

  defp expected_test_path(lib_path) do
    lib_path
    |> String.replace("/lib/", "/test/")
    |> String.replace_suffix(".ex", "_test.exs")
  end

  defp lib_file?(path), do: String.contains?(path, "/lib/") and String.ends_with?(path, ".ex")

  defp excluded?(path) do
    exclusions = [
      "application.ex",
      "repo.ex",
      "endpoint.ex",
      "telemetry.ex",
      "/migrations/",
      "/types/"
    ]

    Enum.any?(exclusions, &String.contains?(path, &1))
  end
end
```

## PERF Pillar: Performance Anti-Patterns

The PERF pillar catches performance anti-patterns that are correct but inefficient:

```elixir
# PERF VIOLATIONS — caught at pre-commit

# O(n) emptiness check when O(1) is available
if length(list) == 0, do: :empty     # BANNED
if list == [], do: :empty             # CORRECT

if length(list) > 0, do: :has_items   # BANNED
if list != [], do: :has_items          # CORRECT

# Unbounded query — can return millions of rows
Repo.all(from u in User)              # BANNED
Repo.all(from u in User, limit: 100)  # CORRECT

# N+1 query pattern
Enum.map(users, fn u ->               # BANNED
  Repo.get(Profile, u.profile_id)
end)

from(p in Profile,                     # CORRECT
  where: p.user_id in ^user_ids)
|> Repo.all()
```

## Mix Task Enforcement

Beyond grep-based scanning, the pre-commit hook runs mix tasks for deeper analysis:

```bash
# === MIX TASK CHECKS ===
# Format check (fast, usually < 1s)
if ! mix format --check-formatted 2>/dev/null; then
  echo "FORMAT VIOLATION: Run 'mix format' to fix formatting."
  EXIT_CODE=1
fi

# Compilation with warnings-as-errors
if ! mix compile --warnings-as-errors --force 2>/dev/null; then
  echo "COMPILE VIOLATION: Fix all compiler warnings."
  EXIT_CODE=1
fi

# Truth validation (dynamic claim checking)
if ! mix truth.validate 2>/dev/null; then
  echo "TRUTH VIOLATION: Platform claims do not match reality."
  EXIT_CODE=1
fi
```

## Measuring Enforcement Effectiveness

We track enforcement metrics to understand what violations developers encounter most frequently and how quickly they resolve them:

| Metric | Q1 2026 Average | Target |
|--------|----------------|--------|
| Pre-commit rejections per developer per week | 3.2 | < 5 (learning signal) |
| ZERO violations caught | 45% of rejections | Decreasing over time |
| SEAL violations caught | 12% of rejections | Near zero (rare) |
| PERF violations caught | 28% of rejections | Decreasing over time |
| Average time to fix rejection | 2.1 minutes | < 5 minutes |
| Violations reaching CI (bypassed hook) | 0.3% | 0% (impossible with hook) |

The pre-commit gate is the foundation of the entire quality pipeline. By catching violations in the developer's terminal before they even enter git history, we maintain a clean codebase where security and quality are structural properties rather than aspirational goals. The 9 blocking pillars have eliminated entire categories of vulnerabilities from the platform, and the grep-based approach ensures that enforcement adds negligible friction to the development workflow.
