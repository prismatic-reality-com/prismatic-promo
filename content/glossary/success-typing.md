+++
title = "Success Typing"
weight = 50
[extra]
description = "Dialyzer's type inference method that infers the broadest type for which a function can succeed, detecting only guaranteed type errors"
category = "quality"
related_terms = ["dialyzer", "typespec", "plt", "static-analysis", "elixir", "erlang"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["success typing", "Dialyzer", "type inference", "static analysis", "Elixir", "glossary", "Prismatic Platform"]
tags = ["glossary", "quality", "static-analysis"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Success Typing - Prismatic Platform"
+++

## Definition & Overview

Success typing is the type inference approach used by Dialyzer (DIscrepancy AnalYZer for ERlang programs). Unlike conventional type systems that require all code to satisfy declared types (and reject code that cannot be proven type-safe), success typing works in reverse: it infers the broadest type for which a function can possibly succeed, then reports only cases where a call is guaranteed to fail. If there is any chance that a function call might succeed with the given arguments, Dialyzer remains silent.

This approach has a fundamental advantage for dynamically typed languages: it produces no false positives. Every warning Dialyzer emits represents a genuine type error -- a code path that will definitely fail at runtime. Conversely, the absence of a Dialyzer warning does not guarantee type safety; it only means that Dialyzer could not prove failure. This "no false positives" property makes Dialyzer uniquely practical: developers can act on every warning with confidence that it represents a real bug.

In the Prismatic Platform, Dialyzer with success typing is a mandatory quality gate. The platform maintains a persistent PLT (Persistent Lookup Table) containing type information for all 115 umbrella applications and their dependencies. Every commit must pass Dialyzer analysis with zero warnings. The `@spec` annotations throughout the codebase provide hints that sharpen Dialyzer's analysis, enabling it to detect increasingly subtle type errors.

## Technical Deep Dive

### How Success Typing Works

Consider a function with an explicit typespec:

```elixir
defmodule PrismaticExample.SuccessTyping do
  @moduledoc """
  Demonstrates success typing behavior with examples.
  """

  # Declared spec: accepts integer, returns string
  @spec format_count(integer()) :: String.t()
  def format_count(n) when is_integer(n) do
    "Count: #{n}"
  end

  # Success typing analysis:
  # 1. Dialyzer infers that format_count/1 succeeds when n is integer()
  # 2. The @spec says integer() -> String.t(), which is consistent
  # 3. No warning: the spec and implementation agree

  # Now consider a caller:
  @spec process(map()) :: String.t()
  def process(%{count: count}) do
    # Dialyzer checks: can format_count succeed with `count`?
    # `count` has type term() (from map value)
    # term() includes integer(), so it MIGHT succeed
    # No warning (even though it could fail at runtime with non-integer)
    format_count(count)
  end

  # But this WILL produce a warning:
  @spec bad_call() :: String.t()
  def bad_call do
    # Dialyzer knows "hello" is a binary, never an integer
    # format_count can NEVER succeed with a binary
    # WARNING: The call will never succeed
    format_count("hello")
  end
end
```

### Spec-Driven Analysis Enhancement

The platform's typespecs sharpen Dialyzer's analysis:

```elixir
defmodule PrismaticStorage.Core do
  @moduledoc """
  Storage behaviour with typespecs that enable success typing.
  """

  @type key :: binary() | atom()
  @type value :: term()
  @type opts :: keyword()

  # These specs tell Dialyzer the exact contract:
  @callback get(key(), opts()) :: {:ok, value()} | {:ok, nil} | {:error, term()}
  @callback put(key(), value(), opts()) :: {:ok, value()} | {:error, term()}
  @callback delete(key(), opts()) :: :ok | {:error, term()}
end

defmodule PrismaticOsintCore.ToolRegistry do
  @moduledoc """
  Registry with precise specs that Dialyzer validates.
  """

  @spec lookup(String.t()) :: {:ok, map()} | {:error, :not_found}
  def lookup(slug) when is_binary(slug) do
    case :ets.lookup(:osint_tool_registry, slug) do
      [{^slug, config}] -> {:ok, config}
      [] -> {:error, :not_found}
    end
  end

  # Dialyzer can now verify that callers handle both :ok and :error cases.
  # If a caller pattern-matches only {:ok, config}, Dialyzer checks
  # whether the :error case is reachable (it is), but won't warn
  # because Elixir's pattern matching will raise MatchError, which
  # is a valid (if unintentional) behavior.
end
```

### PLT Management

The platform manages its Dialyzer PLT as a persistent artifact:

```elixir
# mix.exs configuration for Dialyzer
defmodule PrismaticPlatform.MixProject do
  def project do
    [
      # ... other config
      dialyzer: [
        plt_file: {:no_warn, "priv/plts/dialyzer.plt"},
        plt_add_apps: [:mix, :ex_unit],
        flags: [
          :error_handling,
          :underspecs,
          :unmatched_returns
        ],
        ignore_warnings: ".dialyzer_ignore.exs"
      ]
    ]
  end
end
```

```elixir
# .dialyzer_ignore.exs - explicit suppressions (must be justified)
# The Prismatic Platform targets ZERO Dialyzer warnings.
# Any suppression here requires a documented reason.
[
  # No suppressions - all warnings must be fixed
]
```

### Common Success Typing Patterns

```elixir
defmodule PrismaticExample.Patterns do
  @moduledoc """
  Common patterns that interact with success typing.
  """

  # Pattern 1: Guard-narrowed types
  @spec safe_divide(number(), number()) :: {:ok, float()} | {:error, :division_by_zero}
  def safe_divide(_numerator, 0), do: {:error, :division_by_zero}
  def safe_divide(_numerator, 0.0), do: {:error, :division_by_zero}
  def safe_divide(numerator, denominator) do
    {:ok, numerator / denominator}
  end
  # Dialyzer infers: the second clause can never match 0 (handled by first clause)
  # No warning because the code is still valid

  # Pattern 2: Impossible pattern (Dialyzer WILL warn)
  @spec always_ok() :: :ok
  def always_ok, do: :ok

  def bad_caller do
    case always_ok() do
      :ok -> :fine
      :error -> :unreachable  # Dialyzer: pattern can never match
    end
  end

  # Pattern 3: @impl annotation aids analysis
  @behaviour GenServer

  @impl true
  @spec init(keyword()) :: {:ok, map()}
  def init(opts) do
    {:ok, %{started_at: DateTime.utc_now(), opts: opts}}
  end
  # @impl tells Dialyzer this implements a callback,
  # enabling cross-module contract verification
end
```

## Architecture & Implementation

Dialyzer's success typing analysis in the Prismatic Platform runs at two stages. During development, developers run `mix dialyzer` locally, which takes 2-5 minutes for incremental analysis against the cached PLT. In CI, the full Dialyzer analysis runs in the `analyze` stage, blocking deployment if any warnings are produced.

The PLT is cached in `priv/plts/dialyzer.plt` and rebuilt when dependencies change. The "nuclear cache fix" (`rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt`) is used when the PLT becomes corrupted, forcing a clean rebuild.

The platform's 100/100 quality score includes zero Dialyzer violations across all 115 umbrella applications. This is maintained through the mandatory `@spec` annotations on all public functions (709 `@impl` annotations verified) and the pre-commit quality gates that run Dialyzer on changed modules.

## Usage in Prismatic Platform

Success typing is enforced at every stage of the development lifecycle:

```elixir
# Run Dialyzer analysis
# mix dialyzer

# Check specific module
# mix dialyzer --files lib/prismatic_osint_core/tool_registry.ex

# Quality gate enforcement
# mix quality.gates  # includes Dialyzer check
```

## Cross-References

- [Dialyzer](/glossary/dialyzer/) - Static analysis tool implementing success typing
- [Typespec](/glossary/typespec/) - Type annotations that guide success typing analysis
- [PLT](/glossary/plt/) - Persistent Lookup Table caching type information
- [Static Analysis](/glossary/static-analysis/) - Broader category including success typing

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
