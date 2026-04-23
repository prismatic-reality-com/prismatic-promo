+++
title = "PLT (Persistent Lookup Table)"
weight = 50
[extra]
description = "Dialyzer's cached type analysis results stored on disk for incremental static analysis across compilations"
category = "tooling"
related_terms = ["typespec", "dialyzer", "quality-floor", "property-test", "placeholder"]
complexity_level = "advanced"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-24"
keywords = ["PLT", "Persistent Lookup Table", "Dialyzer", "static analysis", "type checking", "glossary", "Prismatic Platform"]
tags = ["glossary", "tooling", "static-analysis", "elixir"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "PLT (Persistent Lookup Table) - Prismatic Platform"
+++

## Definition & Overview

A Persistent Lookup Table (PLT) is a disk-cached database of type information used by Dialyzer, the Erlang/Elixir static analysis tool. The PLT stores the inferred type signatures of all functions in the analyzed codebase along with the standard library (OTP) and all dependencies. By persisting this information between analysis runs, Dialyzer avoids re-analyzing unchanged modules, reducing analysis time from hours to minutes on large codebases.

The PLT is constructed through success typing, Dialyzer's type inference algorithm. Unlike traditional type systems that reject programs that might have errors, success typing identifies programs that will definitely fail at runtime. This approach works with Erlang and Elixir's dynamic type system by building a type lattice from actual program behavior rather than declared types. The PLT captures this lattice persistently, enabling incremental refinement as the codebase evolves.

For the Prismatic Platform with its 115 umbrella applications and approximately 2.8 million lines of code, the PLT is critical infrastructure. Without persistent caching, each Dialyzer run would need to analyze the entire OTP standard library, all Mix dependencies, and all platform modules -- a process that could take over an hour. With a warm PLT, incremental analysis of changed modules completes in minutes, enabling Dialyzer integration into the development workflow and CI pipeline.

## Technical Deep Dive

PLT construction proceeds in stages. The base PLT contains type information for the Erlang/OTP standard library and is shared across projects. The project PLT extends the base with dependency and application-specific type information. This layered approach means that OTP upgrades require only base PLT reconstruction, while dependency changes require only project PLT updates.

```elixir
# mix.exs configuration for Dialyzer PLT management
defmodule PrismaticPlatform.MixProject do
  use Mix.Project

  def project do
    [
      # ...
      dialyzer: [
        plt_file: {:no_warn, "priv/plts/dialyzer.plt"},
        plt_add_apps: [:mix, :ex_unit],
        plt_core_path: "priv/plts/core",
        flags: [
          :unmatched_returns,
          :error_handling,
          :no_opaque,
          :underspecs
        ],
        ignore_warnings: ".dialyzer_ignore.exs"
      ]
    ]
  end
end
```

The PLT file format is an Erlang term storage (ETS) table serialized to disk. Each entry maps a module-function-arity (MFA) tuple to its success type signature. The internal structure supports efficient lookup, insertion, and merging operations required during incremental analysis.

```elixir
defmodule PrismaticQuality.DialyzerManager do
  @moduledoc """
  Manages Dialyzer PLT lifecycle including creation, updates,
  validation, and cache invalidation for the platform's
  115 umbrella applications.
  """

  @plt_path "priv/plts/dialyzer.plt"
  @core_plt_path "priv/plts/core"

  @spec ensure_plt() :: :ok | {:error, term()}
  def ensure_plt do
    cond do
      not File.exists?(@plt_path) ->
        build_plt()

      plt_stale?() ->
        update_plt()

      true ->
        :ok
    end
  end

  @spec build_plt() :: :ok | {:error, term()}
  def build_plt do
    apps = discover_plt_apps()

    case System.cmd("mix", ["dialyzer", "--plt"], stderr_to_stdout: true) do
      {_output, 0} -> :ok
      {output, code} -> {:error, {code, output}}
    end
  end

  @spec update_plt() :: :ok | {:error, term()}
  def update_plt do
    case System.cmd("mix", ["dialyzer", "--plt"], stderr_to_stdout: true) do
      {_output, 0} -> :ok
      {output, code} -> {:error, {code, output}}
    end
  end

  @spec plt_stale?() :: boolean()
  def plt_stale? do
    plt_mtime = File.stat!(@plt_path).mtime

    beam_files()
    |> Enum.any?(fn beam ->
      File.stat!(beam).mtime > plt_mtime
    end)
  end

  @spec nuclear_cache_fix() :: :ok
  def nuclear_cache_fix do
    # The documented nuclear option for PLT corruption
    File.rm_rf!("_build/dev/lib/prismatic_claude/ebin")
    File.rm_rf!(@plt_path)
    :ok
  end

  defp beam_files do
    Path.wildcard("_build/dev/lib/*/ebin/*.beam")
  end

  defp discover_plt_apps do
    Mix.Project.apps_paths()
    |> Map.keys()
    |> Enum.map(&to_string/1)
  end
end
```

PLT corruption is a known issue that can occur when BEAM files change without corresponding PLT updates, OTP versions change, or concurrent compilation interferes with PLT writes. The platform documents a nuclear cache fix procedure: `rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt`, which forces complete PLT reconstruction.

## Architecture & Implementation

The Prismatic Platform's PLT management integrates with the broader quality infrastructure. The pre-commit hook validates that Dialyzer passes with the current PLT before allowing commits. The CI pipeline rebuilds the PLT on dependency changes and caches it across pipeline runs. The Quality Floor Guardian monitors PLT health and triggers reconstruction when corruption is detected.

PLT files are excluded from version control (listed in `.gitignore`) because they contain machine-specific binary data. Instead, the CI pipeline maintains PLT caches keyed by the lock file hash (`mix.lock`), ensuring that dependency changes trigger fresh PLT construction while unchanged dependencies use the cached PLT.

The platform's zero-warning policy means that every Dialyzer finding must be either fixed or explicitly ignored with documentation in `.dialyzer_ignore.exs`. The current state is zero Dialyzer violations across all 115 umbrella applications, maintained through continuous enforcement.

## Usage in Prismatic Platform

Developers interact with the PLT through standard Mix tasks and the quality gate pipeline. The PLT is transparently managed -- developers run `mix dialyzer` and the tooling ensures the PLT is current.

```elixir
# Standard Dialyzer run (uses cached PLT)
# mix dialyzer

# Force PLT rebuild
# mix dialyzer --plt

# Quality gate integration (includes Dialyzer)
# mix quality.gates

# Nuclear cache fix for corrupted PLT
# rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt
# mix dialyzer --plt
```

The platform tracks Dialyzer violations as a quality domain in the Quality DNA system. The current state records zero violations, and any regression triggers immediate Quality Floor Guardian alerts. The PLT is the foundation enabling this zero-violation state by making incremental Dialyzer analysis practical for a multi-million-line codebase.

## Cross-References

- **Quality Floor** - Minimum quality threshold that Dialyzer PLT analysis protects
- **Property Test** - Testing approach complementing static type analysis
- [Placeholder](@/glossary/placeholder.md) - Forbidden pattern that Dialyzer's PLT-backed analysis helps detect
- **Process** - BEAM execution unit whose type signatures are stored in the PLT
- **Runtime** - Execution phase where PLT-detected errors would manifest

---

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
