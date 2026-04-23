+++
title = "Stub"
weight = 50
[extra]
description = "Placeholder implementation returning hardcoded values - explicitly forbidden in Prismatic Platform production code by NO MERCY doctrine"
category = "testing"
related_terms = ["mock", "forbidden-patterns", "no-mercy", "testing", "quality-gates", "production-ready"]
complexity_level = "beginner"
platform_integration = "reference"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["stub", "placeholder", "forbidden", "NO MERCY", "quality", "glossary", "Prismatic Platform"]
tags = ["glossary", "testing", "quality"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Stub - Prismatic Platform"
+++

## Definition & Overview

A stub is a placeholder implementation that returns hardcoded or minimal responses instead of performing real operations. In testing contexts, stubs replace external dependencies (databases, APIs, file systems) with predictable stand-ins that return predetermined values. In production code, stubs represent incomplete implementations -- functions that claim to implement an interface but actually skip the real logic, typically raising "not implemented" exceptions or returning dummy data.

The distinction between testing stubs and production stubs is critical. Testing stubs are a legitimate (though often inferior) alternative to more expressive test doubles. Production stubs are technical debt that violates interface contracts, misleads callers, and creates hidden failure modes. A module that claims to implement a behaviour but stubs out half the callbacks is worse than no implementation at all -- it passes compile-time checks while silently failing at runtime.

In the Prismatic Platform, stubs in production code are explicitly and categorically forbidden. The NO MERCY doctrine requires that every line of code be production-ready from the moment of creation. The platform's forbidden patterns scanner (Phase 7 of the pre-commit hook) detects and blocks stub patterns in `lib/` directories, including `raise "not implemented"`, `raise :not_implemented`, `# STUB`, `# PLACEHOLDER`, and `# FIXME`. This enforcement is non-bypassable: no exceptions, no temporary allowances, no "we'll fix it later" deferrals.

## Technical Deep Dive

### Forbidden Stub Patterns

The platform's forbidden pattern scanner detects these stub indicators:

```elixir
defmodule PrismaticQuality.ForbiddenPatterns.StubDetector do
  @moduledoc """
  Detects stub and placeholder patterns in production code.
  Part of the forbidden patterns enforcement system.
  BLOCKING: Commits with stubs in lib/ are rejected.
  """

  @stub_patterns [
    # Code patterns
    {~r/raise\s+"not\s+implemented"/i, :code_stub, :block},
    {~r/raise\s+:not_implemented/i, :code_stub, :block},
    {~r/raise\s+"TODO"/i, :code_stub, :block},
    {~r/fn\s*_.*->\s*:ok\s*end/, :noop_stub, :block},
    {~r/def\s+\w+.*do\s*\n\s*:ok\s*\n\s*end/, :empty_impl, :block},

    # Comment patterns
    {~r/#\s*STUB/i, :comment_stub, :block},
    {~r/#\s*PLACEHOLDER/i, :comment_placeholder, :block},
    {~r/#\s*FIXME/i, :comment_fixme, :block},
    {~r/#\s*HACK/i, :comment_hack, :block},
    {~r/#\s*WORKAROUND/i, :comment_workaround, :block},
    {~r/#\s*XXX/i, :comment_xxx, :block},
    {~r/#\s*temporary/i, :comment_temporary, :block},
    {~r/#\s*quick\s+and\s+dirty/i, :comment_qad, :block},
    {~r/#\s*naive/i, :comment_naive, :block}
  ]

  @whitelisted_paths [
    "lib/mix/tasks/quality/",
    "prismatic_credo/",
    "config/",
    "garden/",
    "deps/",
    "_build/"
  ]

  @spec scan_file(String.t()) :: [map()]
  def scan_file(file_path) do
    if whitelisted?(file_path) do
      []
    else
      file_path
      |> File.read!()
      |> String.split("\n")
      |> Enum.with_index(1)
      |> Enum.flat_map(fn {line, line_num} ->
        detect_patterns(line, line_num, file_path)
      end)
    end
  end

  defp detect_patterns(line, line_num, file_path) do
    Enum.flat_map(@stub_patterns, fn {regex, category, severity} ->
      if Regex.match?(regex, line) do
        [%{
          file: file_path,
          line: line_num,
          category: category,
          severity: severity,
          content: String.trim(line)
        }]
      else
        []
      end
    end)
  end

  defp whitelisted?(path) do
    Enum.any?(@whitelisted_paths, &String.contains?(path, &1))
  end
end
```

### The Right Alternative: Complete Implementations

Instead of stubs, the platform requires complete implementations or explicit feature flags:

```elixir
# FORBIDDEN: stub implementation
defmodule BadAdapter do
  @behaviour PrismaticStorage.Core

  @impl true
  def get(_key, _opts), do: raise("not implemented")

  @impl true
  def put(_key, _value, _opts), do: :ok  # noop stub
end

# CORRECT: complete implementation
defmodule PrismaticStorage.ETS do
  @behaviour PrismaticStorage.Core

  @impl true
  def get(key, opts) do
    table = Keyword.fetch!(opts, :table)
    case :ets.lookup(table, key) do
      [{^key, value}] -> {:ok, value}
      [] -> {:ok, nil}
    end
  end

  @impl true
  def put(key, value, opts) do
    table = Keyword.fetch!(opts, :table)
    :ets.insert(table, {key, value})
    {:ok, value}
  end
end

# CORRECT: explicit unsupported operation (not a stub)
defmodule PrismaticStorage.ReadOnlyAdapter do
  @behaviour PrismaticStorage.Core

  @impl true
  def get(key, opts) do
    # Full implementation
    {:ok, fetch_from_source(key, opts)}
  end

  @impl true
  def put(_key, _value, _opts) do
    {:error, :read_only_adapter}
  end
end
```

### Testing Stubs vs Production Stubs

In test code, the platform prefers behaviours and dependency injection over stubs:

```elixir
# Test helper: configurable test adapter (NOT a stub)
defmodule PrismaticStorage.TestAdapter do
  @moduledoc """
  Test adapter that stores data in a process-local Agent.
  This is a COMPLETE implementation, not a stub.
  """

  @behaviour PrismaticStorage.Core

  def start_link do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  @impl true
  def get(key, _opts) do
    value = Agent.get(__MODULE__, &Map.get(&1, key))
    {:ok, value}
  end

  @impl true
  def put(key, value, _opts) do
    Agent.update(__MODULE__, &Map.put(&1, key, value))
    {:ok, value}
  end

  @impl true
  def delete(key, _opts) do
    Agent.update(__MODULE__, &Map.delete(&1, key))
    :ok
  end

  @impl true
  def list(_opts) do
    values = Agent.get(__MODULE__, &Map.values/1)
    {:ok, values}
  end

  @impl true
  def exists?(key, _opts) do
    exists = Agent.get(__MODULE__, &Map.has_key?(&1, key))
    {:ok, exists}
  end

  @impl true
  def count(_opts) do
    count = Agent.get(__MODULE__, &map_size/1)
    {:ok, count}
  end
end
```

## Architecture & Implementation

The platform's anti-stub enforcement operates at three levels. The pre-commit hook (Phase 7) scans changed files for forbidden patterns before the commit is created. The CI pipeline runs a full codebase scan. The quality gates mix task (`mix quality.forbidden_patterns`) provides on-demand checking.

The enforcement is strict but scoped. Test files (`test/` directories) are not scanned for stub patterns because test doubles are legitimate there (though the platform still prefers complete test adapters over stubs). Configuration files, dependency code, and quality tooling itself are whitelisted to prevent false positives.

The NO MERCY doctrine's rationale for banning stubs is straightforward: stubs represent deferred decisions, and deferred decisions compound into technical debt. A stub in module A causes module B (which depends on A) to develop workarounds, which causes module C to compensate for B's workarounds. Banning stubs from the start prevents this cascade entirely.

## Usage in Prismatic Platform

Stub detection is automated and non-bypassable:

```elixir
# Run forbidden patterns check
# mix quality.forbidden_patterns --category stubs

# Pre-commit hook output on violation:
# BLOCKED: Stub detected in lib/prismatic_foo/bar.ex:42
#   raise "not implemented"
# Commit rejected. NO MERCY: Complete the implementation.
```

## Cross-References

- **Forbidden Patterns** - Scanner that detects and blocks stubs
- [Quality Gates](/glossary/quality-gates/) - Enforcement system including stub detection
- [Behaviour](/glossary/behaviour/) - Contract mechanism that stubs violate
- [NO MERCY](/glossary/no-mercy/) - Doctrine requiring complete, production-ready code

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
