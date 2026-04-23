+++
title = "Placeholder"
weight = 50
[extra]
description = "Temporary implementation marker explicitly forbidden in production code under NO MERCY doctrine"
category = "quality"
related_terms = ["quality-floor", "property-test", "semver", "plt", "forbidden-patterns"]
complexity_level = "beginner"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["placeholder", "stub", "mock", "forbidden pattern", "quality", "glossary", "Prismatic Platform", "NO MERCY"]
tags = ["glossary", "quality", "doctrine", "enforcement"]
quality_score = 77
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Placeholder - Prismatic Platform"
+++

## Definition & Overview

A placeholder is a temporary marker in source code indicating an incomplete implementation, deferred logic, or provisional value that is intended to be replaced with a production-quality implementation later. Common manifestations include `raise "not implemented"`, `# TODO: implement this`, `# PLACEHOLDER`, stub functions returning hardcoded values, and mock implementations that bypass real system behavior.

In conventional software development, placeholders serve a legitimate role during prototyping and iterative development. However, the Prismatic Platform's NO MERCY doctrine categorically forbids placeholders in any code that reaches version control. The rationale is straightforward: placeholders represent technical debt with a proven tendency to persist indefinitely. Studies of large codebases consistently show that TODO comments and placeholder implementations have median lifetimes measured in years, not days. The NO MERCY doctrine eliminates this category of debt by preventing it from entering the codebase.

The platform enforces placeholder prohibition through automated detection at multiple levels: pre-commit hooks (Phase 8 forbidden pattern scanning), CI pipeline checks, the `mix quality.forbidden_patterns` task, and Credo custom checks. This multi-layered enforcement ensures that no placeholder, stub, mock, or TODO marker survives the development pipeline regardless of the entry point.

## Technical Deep Dive

Placeholder detection in the Prismatic Platform uses pattern matching against known placeholder signatures. The detection system categorizes forbidden patterns by severity and scope, enabling nuanced enforcement that distinguishes between truly forbidden patterns and acceptable uses (such as documentation examples or test fixtures).

```elixir
defmodule PrismaticQuality.ForbiddenPatterns do
  @moduledoc """
  Automated detection of forbidden patterns including placeholders,
  stubs, mocks, and TODO markers. Enforced at pre-commit and CI.
  """

  @type pattern_category :: :placeholder | :stub | :mock | :todo | :naive | :hack
  @type severity :: :block | :warn
  @type violation :: %{
    file: String.t(),
    line: non_neg_integer(),
    category: pattern_category(),
    severity: severity(),
    pattern: String.t(),
    context: String.t()
  }

  @forbidden_patterns [
    # Placeholders
    {~r/# PLACEHOLDER/i, :placeholder, :block, "lib/"},
    {~r/# STUB/i, :stub, :block, "lib/"},
    {~r/# MOCK/i, :mock, :block, "lib/"},
    {~r/# FIXME/i, :placeholder, :block, "all"},
    {~r/# HACK/i, :placeholder, :block, "all"},
    {~r/# WORKAROUND/i, :placeholder, :block, "all"},
    {~r/# XXX/i, :placeholder, :block, "all"},

    # Stubs
    {~r/raise\s+"not implemented"/i, :stub, :block, "lib/"},
    {~r/raise\s+:not_implemented/, :stub, :block, "lib/"},

    # Mocks in production code
    {~r/Mox\.defmock/, :mock, :block, "lib/"},

    # Naive implementations
    {~r/# naive/i, :naive, :block, "lib/"},
    {~r/# temporary/i, :naive, :block, "lib/"},
    {~r/# quick and dirty/i, :naive, :block, "lib/"},

    # Test skips without justification
    {~r/@tag :skip(?!\s+#)/, :placeholder, :warn, "test/"}
  ]

  @whitelisted_paths ~w(
    lib/mix/tasks/quality/
    prismatic_credo/
    config/
    garden/
    deps/
    _build/
  )

  @spec scan(String.t()) :: {:ok, [violation()]}
  def scan(path) do
    violations =
      path
      |> gather_files()
      |> Enum.reject(&whitelisted?/1)
      |> Task.async_stream(&scan_file/1, max_concurrency: System.schedulers_online())
      |> Enum.flat_map(fn {:ok, violations} -> violations end)
      |> Enum.sort_by(& &1.severity)

    {:ok, violations}
  end

  defp scan_file(file) do
    content = File.read!(file)
    lines = String.split(content, "\n")

    Enum.flat_map(@forbidden_patterns, fn {pattern, category, severity, scope} ->
      if file_in_scope?(file, scope) do
        lines
        |> Enum.with_index(1)
        |> Enum.filter(fn {line, _} -> Regex.match?(pattern, line) end)
        |> Enum.map(fn {line, line_num} ->
          %{
            file: file,
            line: line_num,
            category: category,
            severity: severity,
            pattern: Regex.source(pattern),
            context: String.trim(line)
          }
        end)
      else
        []
      end
    end)
  end

  defp whitelisted?(file) do
    Enum.any?(@whitelisted_paths, &String.contains?(file, &1))
  end

  defp file_in_scope?(file, "all"), do: true
  defp file_in_scope?(file, scope), do: String.contains?(file, scope)

  defp gather_files(path) do
    Path.wildcard(Path.join(path, "**/*.{ex,exs}"))
  end
end
```

The pre-commit hook integrates placeholder detection as Phase 8, blocking any commit that introduces forbidden patterns. This enforcement is non-bypassable -- the `--no-verify` flag is itself forbidden by platform policy.

```elixir
defmodule PrismaticQuality.PreCommit.Phase8 do
  @moduledoc """
  Pre-commit Phase 8: Forbidden pattern detection.
  BLOCKS commit if any placeholder, stub, or mock is detected
  in staged files.
  """

  @spec check(list(String.t())) :: :ok | {:error, [map()]}
  def check(staged_files) do
    elixir_files = Enum.filter(staged_files, &String.ends_with?(&1, [".ex", ".exs"]))

    violations =
      elixir_files
      |> Enum.flat_map(fn file ->
        {:ok, violations} = PrismaticQuality.ForbiddenPatterns.scan_file(file)
        Enum.filter(violations, &(&1.severity == :block))
      end)

    case violations do
      [] -> :ok
      violations -> {:error, violations}
    end
  end
end
```

## Architecture & Implementation

The forbidden pattern enforcement architecture operates at three levels: local (pre-commit hooks), CI/CD (pipeline quality gates), and continuous monitoring (Quality Floor Guardian). This triple-layered approach ensures that even if one enforcement point is circumvented (e.g., through direct database writes to the repository), subsequent layers catch the violation.

The Quality Floor Guardian continuously monitors the codebase for pattern regression. If a new placeholder is detected in the main branch (perhaps introduced through a force-push or merge conflict resolution), the Guardian emits a critical alert and blocks subsequent commits until the violation is resolved.

Pattern detection results are stored in the Quality DNA system, providing cross-session continuity. This means that a pattern violation detected in one development session persists as a tracked issue across subsequent sessions, preventing the "it will be fixed later" deferral that placeholders represent.

## Usage in Prismatic Platform

The `mix quality.forbidden_patterns` task provides the primary interface for developers to check their code before committing. The task supports filtering by category, count-only mode for CI integration, and detailed output showing exact file locations and pattern matches.

```elixir
# Full codebase scan
# mix quality.forbidden_patterns

# Machine-readable count for CI
# mix quality.forbidden_patterns --count-only

# Filter by category
# mix quality.forbidden_patterns --category mocks

# Check only staged files
# mix quality.forbidden_patterns --staged
```

The platform maintains a current count of zero forbidden patterns across all 115 umbrella applications, achieved through the combination of automated enforcement and the NO MERCY doctrine's cultural prohibition against incomplete implementations. Every function is production-ready from the moment of creation -- there is no "implement later" pathway.

## Cross-References

- [Quality Floor](/glossary/quality-floor/) - Minimum quality threshold that placeholder detection protects
- [Property Test](/glossary/property-test/) - Testing approach that replaces placeholder test stubs
- [PLT](/glossary/plt/) - Persistent Lookup Table used by Dialyzer to detect incomplete implementations
- **Semver** - Versioning standard governing how forbidden pattern changes are released
- **Provenance** - Origin tracing for quality violation reports

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
