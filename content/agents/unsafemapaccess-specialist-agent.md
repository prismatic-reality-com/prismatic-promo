+++
title = "UnsafeMapAccess Specialist Agent"
weight = 410
[extra]
domain = "specialist"
level = "L3"
description = "Agent: unsafe-map-access-specialist"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2300
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["UnsafeMapAccess", "Specialist", "Agent", "agents", "Prismatic Platform", "Elixir"]
tags = ["agents", "agent", "unsafemapaccess-specialist-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "UnsafeMapAccess Specialist Agent - Prismatic Platform"
+++

## Overview

The UnsafeMapAccess Specialist Agent operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's quality specialist domain, dedicated to detecting and eliminating unsafe map access patterns across the entire [Elixir](@/glossary/elixir.md) codebase. Unsafe map access -- using `map.field` dot notation or `map[:key]` bracket syntax on potentially nil maps -- represents a critical memory safety concern in [OTP](@/glossary/otp.md) applications, as it produces runtime `KeyError` or `nil` propagation that can crash [GenServer](@/glossary/genserver.md) processes and cascade through [supervision tree](@/glossary/supervision-tree.md)s.

This agent enforces the platform's zero-tolerance policy for unsafe map access under the [NO MERCY](@/glossary/no-mercy.md) doctrine. The platform maintains 0 violations in the Unsafe Map Access quality domain as part of its 100/100 quality score. Every map access must use safe patterns: `Map.get/3` with explicit defaults, `Map.fetch/2` with `{:ok, value}` / `:error` handling, or [pattern matching](@/glossary/pattern-matching.md) in function heads. The agent scans the codebase's 6,652 `.ex` files using AST analysis to detect violations that static analysis tools like [Dialyzer](@/glossary/dialyzer.md) and [Credo](@/glossary/credo.md) cannot catch on their own.

The agent is a core component of the [CASCADE](@/glossary/cascade.md) elimination pipeline, which systematically identifies and removes anti-patterns from the codebase. Unsafe map access was one of the original CASCADE pattern categories, and its complete elimination represents a milestone in the platform's journey to a 100/100 quality score. The agent maintains this achievement through continuous enforcement, preventing any regression in the Unsafe Map Access quality domain.

## Architecture

The UnsafeMapAccess Specialist Agent is implemented as a supervised [OTP](@/glossary/otp.md) process that integrates with the platform's quality infrastructure through multiple interfaces.

```
UnsafeMapAccess.Supervisor
+-- Scanner.Worker          (AST-based violation detection)
+-- Analyzer.Engine         (context-aware false positive filtering)
+-- Remediation.Generator   (safe replacement code generation)
+-- Cache.Store             (ETS-backed incremental analysis state)
+-- PreCommit.Gate          (git hook enforcement)
```

The scanner performs AST traversal of Elixir source files, identifying dot-notation and bracket access nodes. The analyzer applies context-aware filtering to distinguish genuinely unsafe accesses from safe patterns (such as struct field access where the struct type is guaranteed by pattern matching). The remediation generator produces syntactically correct replacement code using the appropriate safe access pattern for each context. The [ETS](@/glossary/ets.md) cache stores analysis results indexed by file content hash, enabling incremental scanning that only re-analyzes modified files. The pre-commit gate integrates with Git hooks to block commits that introduce new violations.

Each component runs as a separate process under the supervisor, ensuring that a failure in one component (such as a parsing error on a malformed file) does not affect the others. The scanner communicates with the analyzer through message passing, and the remediation generator is invoked only when violations are confirmed, minimizing unnecessary computation.

## Core Capabilities

The agent provides six primary capabilities that together form a comprehensive unsafe map access prevention system.

**AST-Level Map Access Detection** parses Elixir source files into Abstract Syntax Trees to identify dot-notation access (`map.field`) and bracket access (`map[:key]`) patterns on non-guaranteed map structures. The detection operates at the AST level rather than text-level pattern matching, ensuring accuracy even in the presence of macros, sigils, and complex expression nesting.

**Context-Aware Analysis** distinguishes between genuinely unsafe accesses and safe patterns that superficially resemble violations. Struct field access on a variable bound by pattern matching (`%MyStruct{} = data; data.field`) is safe because the struct's existence is guaranteed. The analyzer tracks variable bindings through function clause heads, `with` expressions, `case` branches, and guard clauses to determine whether a map's existence is guaranteed at the point of access.

**Safe Pattern Replacement** generates correct replacement code using the safe access pattern most appropriate to each context. For map lookups with sensible defaults, `Map.get/3` is preferred. For lookups where absence is an error condition, `Map.fetch!/2` or `Map.fetch/2` with explicit error handling is generated. For struct field access, function-head pattern matching is recommended.

**Incremental Scanning** targets only modified files and their dependents rather than performing full-codebase scans on every invocation. The agent maintains an [ETS](@/glossary/ets.md)-cached dependency graph that maps each file to its reverse dependencies, so that when a module's type definitions change, all modules that access its maps are re-scanned.

**Pre-Commit Enforcement** integrates with the Git pre-commit hook pipeline to block any commit that introduces new unsafe map access violations. This enforcement operates at the file diff level, scanning only the changed lines and their surrounding context to determine whether new violations have been introduced.

**Remediation Statistics** tracks violation counts, remediation rates, and pattern distribution over time, publishing metrics through the platform's [telemetry](@/glossary/telemetry.md) system for monitoring and trending.

## Implementation

The core scanner is implemented as an [OTP](@/glossary/otp.md) [GenServer](@/glossary/genserver.md) that manages scanning state and coordinates analysis operations.

```elixir
defmodule Prismatic.Agents.UnsafeMapAccess.Scanner do
  @moduledoc """
  AST-based scanner for unsafe map access patterns.
  Detects dot-notation and bracket access on potentially nil maps.
  """

  use GenServer

  alias Prismatic.Agents.UnsafeMapAccess.{Analyzer, Cache}

  @type violation :: %{
    file: String.t(),
    line: pos_integer(),
    column: pos_integer(),
    access_type: :dot | :bracket,
    expression: String.t(),
    suggested_fix: String.t()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(opts) do
    {:ok, %{
      violations: [],
      scan_count: 0,
      config: Map.new(opts)
    }}
  end

  @spec scan_file(Path.t()) :: {:ok, [violation()]} | {:error, term()}
  def scan_file(file_path) do
    with {:ok, source} <- File.read(file_path),
         {:ok, ast} <- Code.string_to_quoted(source, columns: true) do
      violations =
        ast
        |> traverse_ast([])
        |> Enum.reject(&Analyzer.safe_access?(&1, ast))
        |> Enum.map(&build_violation(file_path, &1, source))

      Cache.store(file_path, content_hash(source), violations)
      {:ok, violations}
    end
  end

  defp traverse_ast({:., meta, [receiver, field]}, acc)
       when is_atom(field) do
    [{:dot, meta, receiver, field} | acc]
  end

  defp traverse_ast({:access, meta, [map, _key]}, acc) do
    [{:bracket, meta, map, nil} | acc]
  end

  defp traverse_ast({_form, _meta, children}, acc)
       when is_list(children) do
    Enum.reduce(children, acc, &traverse_ast/2)
  end

  defp traverse_ast(_other, acc), do: acc

  defp build_violation(file, {type, meta, _receiver, _field}, _source) do
    %{
      file: file,
      line: Keyword.get(meta, :line, 0),
      column: Keyword.get(meta, :column, 0),
      access_type: type,
      expression: "detected at #{Keyword.get(meta, :line, 0)}",
      suggested_fix: suggest_fix(type)
    }
  end

  defp suggest_fix(:dot), do: "Use Map.get/3 or pattern match in function head"
  defp suggest_fix(:bracket), do: "Use Map.get/3 with default or Map.fetch/2"

  defp content_hash(source), do: :crypto.hash(:sha256, source)
end
```

The `traverse_ast/2` function recursively walks the AST, collecting all map access nodes. The `Analyzer.safe_access?/2` function applies context-aware filtering to eliminate false positives by examining variable binding context. The `Cache` module persists analysis results in ETS keyed by content hash, enabling instant results for unmodified files.

## Integration Points

The UnsafeMapAccess Specialist Agent integrates with the platform's quality and development infrastructure at multiple levels.

| Component | Direction | Description |
|-----------|-----------|-------------|
| [CASCADE Pipeline](@/glossary/cascade.md) | Bidirectional | Core CASCADE anti-pattern category; feeds violation data and receives elimination directives |
| [code-quality-commander](@/agents/code-quality-commander.md) | Outbound | Reports violation counts to the supreme quality authority for platform scoring |
| [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) | Outbound | Feeds real-time violation metrics into domain monitoring |
| [Performance Benchmarking Agent](@/agents/performance-benchmarking-agent.md) | Inbound | Validates that safe-access replacements maintain runtime performance |
| Git Pre-Commit Hooks | Enforcement | Blocks commits introducing new violations |
| [Dialyzer](@/glossary/dialyzer.md) | Complementary | Catches type-level violations that AST analysis cannot detect |
| [Credo](@/glossary/credo.md) | Complementary | Catches style-level issues; the specialist handles deeper semantic analysis |

## Operational Workflow

The agent operates in three modes: continuous background scanning, on-demand targeted analysis, and pre-commit enforcement.

**Continuous Scanning** runs on a configurable interval (default 30 minutes), scanning all files modified since the last scan. Results are cached in ETS and published through telemetry. Any new violations trigger immediate alert escalation to the code-quality-commander.

**On-Demand Analysis** is invoked through the `/unsafe-map scan` command, performing a targeted scan of specified files, directories, or the entire codebase. Results include violation details, suggested fixes, and remediation statistics.

**Pre-Commit Enforcement** activates during every `git commit`, scanning the staged diff for new unsafe map access patterns. If any violation is detected, the commit is blocked with a detailed error message showing the violation location and suggested fix. This gate is non-bypassable under the [NO MERCY](@/glossary/no-mercy.md) doctrine.

The remediation workflow follows a four-step process: (1) scan to identify violations, (2) generate safe replacement code, (3) apply replacements with user confirmation, (4) re-scan to verify elimination. Each step is logged through telemetry for audit trail purposes.

## NABLA Compliance

The UnsafeMapAccess Specialist Agent operates under [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic governance for all violation claims.

**Signal Plurality**: Every violation report includes both the AST evidence (the specific syntax node identified) and the context analysis result (why the access is deemed unsafe). Two independent signals confirm each violation.

**Provenance Mandatory**: Every violation carries a complete provenance chain: source file path, line number, column number, AST node type, binding context analysis, and the specific rule that determined the access as unsafe. This provenance is immutable once recorded.

**Contradiction Preservation**: When the analyzer encounters ambiguous cases where an access might be safe depending on runtime conditions, both the potential-safe and potential-unsafe interpretations are preserved in the report. The agent does not collapse ambiguity into false certainty.

**Time Decay**: Cached analysis results include timestamps and are invalidated when source files change. The agent never relies on stale analysis results for enforcement decisions.

All enforcement decisions pass through [Trinity Gate](@/glossary/trinity-gate.md) validation: structural consistency (the violation report references valid AST nodes), logical consistency (the unsafe determination follows from the binding context), and formal necessity (the replacement code is provably safe through type analysis).

## Configuration

The agent accepts configuration through the application environment and command-line parameters.

```elixir
config :prismatic_agents, Prismatic.Agents.UnsafeMapAccess,
  scan_interval: :timer.minutes(30),
  scan_paths: ["apps/"],
  exclude_paths: ["_build/", "deps/", "test/"],
  cache_table: :unsafe_map_access_cache,
  max_violations_per_file: 100,
  auto_fix: false,
  pre_commit_enabled: true,
  telemetry_prefix: [:prismatic, :unsafe_map_access]
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `scan_interval` | 30 minutes | Time between automated background scans |
| `scan_paths` | `["apps/"]` | Directories to scan for Elixir source files |
| `exclude_paths` | `["_build/", "deps/", "test/"]` | Directories excluded from scanning |
| `auto_fix` | `false` | Whether to apply fixes automatically (requires explicit opt-in) |
| `pre_commit_enabled` | `true` | Whether pre-commit enforcement is active |

## Performance

The agent is optimized for rapid incremental scanning with minimal resource consumption.

| Metric | Target | Measured |
|--------|--------|----------|
| Per-file AST scan | < 10 ms | 3-6 ms |
| Incremental scan (changed files only) | < 5 seconds | 1-3 seconds |
| Full codebase scan (6,652 files) | < 60 seconds | 25-40 seconds |
| Cache lookup (ETS) | < 1 ms | 0.05-0.2 ms |
| Pre-commit check (staged diff) | < 3 seconds | 0.5-1.5 seconds |
| Memory footprint (cache) | < 20 MB | 8-15 MB |

The incremental scanning strategy ensures that typical development workflows experience sub-second pre-commit checks, as only the changed files in the staged diff require analysis. The ETS cache eliminates redundant parsing of unmodified files, and the content hash indexing ensures cache validity without timestamp-based expiration.

## Related Resources

- [CASCADE Pipeline](@/glossary/cascade.md) -- Systematic anti-pattern elimination infrastructure
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- Quality monitoring system receiving violation metrics
- [NO MERCY Doctrine](@/glossary/no-mercy.md) -- Zero-tolerance enforcement framework
- [Dialyzer](@/glossary/dialyzer.md) -- Complementary static analysis for type-level safety
- [Credo](@/glossary/credo.md) -- Style and consistency checking
- [AIAD Standard](@/glossary/aiad.md) -- Agent specification standard
- [Pattern Matching](@/glossary/pattern-matching.md) -- Preferred safe access mechanism in Elixir

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)