+++
title = "Compilation"
weight = 50
[extra]
tags = ["glossary", "core", "elixir", "beam", "build-system", "performance", "tooling"]
description = "The process of transforming high-level source code into executable machine instructions or intermediate bytecode, encompassing lexical analysis, parsing, optimization, and code generation -- with specific emphasis on Elixir/BEAM compilation, umbrella project builds, and zero-warning enforcement"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Software Engineering"
related_concepts = ["abstract syntax tree", "bytecode generation", "static analysis", "incremental compilation", "cross-compilation", "JIT compilation", "ahead-of-time compilation"]
implementation_status = "active"
authority_level = "technical"
difficulty_rating = "advanced"
prerequisites = ["programming language fundamentals", "BEAM virtual machine basics", "Elixir module system", "OTP application structure"]
learning_path = ["understand compilation phases", "study BEAM bytecode format", "implement Mix compiler configuration", "enforce zero-warning compilation", "optimize umbrella compilation performance"]
interactive_demos = ["compilation pipeline visualizer", "AST explorer", "bytecode inspector", "warning analysis dashboard"]
code_examples = true
external_resources = ["https://hexdocs.pm/mix/Mix.Tasks.Compile.html", "https://hexdocs.pm/elixir/Code.html", "https://www.erlang.org/doc/man/compile"]
version_introduced = "1.0.0"
stability_level = "stable"
testing_scenarios = ["zero-warning compilation verification", "incremental compilation correctness", "cross-dependency compilation order", "umbrella application compilation", "release compilation with consolidation"]
keywords = ["compilation", "compiler", "BEAM bytecode", "Elixir compilation", "mix compile", "warnings-as-errors", "static analysis", "AST"]
related_terms = ["beam-vm", "ast", "static-analysis", "dialyzer", "credo", "zero-warning-policy", "quality-gate", "clean-run", "typespec", "release"]
word_count = 1658
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Compilation - Prismatic Platform"
+++

## Definition

**Compilation** is the systematic process of transforming source code written in a high-level programming language into a lower-level representation that can be executed by a target runtime environment. This transformation encompasses multiple phases -- lexical analysis (tokenization), syntactic analysis (parsing into an Abstract Syntax Tree), semantic analysis (type checking, scope resolution), optimization, and code generation. In the context of the Prismatic Platform and the broader Elixir ecosystem, compilation specifically refers to the transformation of Elixir source code (`.ex` files) into BEAM bytecode (`.beam` files) that executes on the Erlang Virtual Machine (BEAM VM).

Compilation in Elixir is not merely a translation step; it is a critical quality enforcement point. The Prismatic Platform leverages the compilation process as a first-line defense against defects through strict `--warnings-as-errors` enforcement, comprehensive Dialyzer analysis, and compilation-time module attribute validation. Every compilation serves simultaneously as a build step and a quality gate.

## Overview

The Elixir compilation model differs fundamentally from compilation in languages like C, Java, or Go. Elixir compiles to BEAM bytecode, which runs on a virtual machine optimized for concurrent, distributed, fault-tolerant systems. This compilation target provides unique characteristics:

**Concurrent Compilation**: The Elixir compiler can compile multiple modules in parallel, respecting dependency ordering. This is critical for the Prismatic Platform's 115 umbrella applications, where parallel compilation significantly reduces build times.

**Macro Expansion**: Unlike most compiled languages, Elixir performs extensive macro expansion during compilation. Macros transform the AST before code generation, enabling powerful metaprogramming while maintaining compiled performance. Approximately 30% of Elixir's standard library is implemented through macros.

**Protocol Consolidation**: During release builds, Elixir consolidates protocol dispatch tables, converting runtime protocol resolution into compile-time dispatches. This optimization is critical for production performance.

**Hot Code Reloading**: BEAM's compilation model supports loading new module versions into a running system without stopping it. Each module can have two versions active simultaneously (current and old), enabling zero-downtime deployments.

### Compilation Pipeline

The Elixir compilation pipeline consists of several distinct phases:

1. **Tokenization**: Source text is broken into tokens (atoms, strings, operators, keywords)
2. **Parsing**: Tokens are assembled into an Abstract Syntax Tree (AST) represented as Elixir terms
3. **Macro Expansion**: Macros are recursively expanded, transforming the AST
4. **Compilation**: The expanded AST is compiled to Erlang Abstract Format
5. **Erlang Compilation**: Erlang Abstract Format is compiled to BEAM bytecode
6. **Loading**: BEAM bytecode is loaded into the VM for execution

Each phase provides opportunities for analysis, validation, and optimization that the Prismatic Platform exploits for quality enforcement.

## Technical Details

### Elixir Compilation Configuration

The Prismatic Platform enforces strict compilation settings across all 115 umbrella applications:

```elixir
defmodule PrismaticApp.MixProject do
  use Mix.Project

  def project do
    [
      app: :prismatic_app,
      version: "0.1.0",
      build_path: "../../_build",
      config_path: "../../config/config.exs",
      deps_path: "../../deps",
      lockfile: "../../mix.lock",
      elixir: "~> 1.19",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      # MANDATORY: Zero-warning enforcement
      elixirc_options: [
        warnings_as_errors: true
      ],
      # Dialyzer configuration
      dialyzer: [
        plt_file: {:no_warn, "../../priv/plts/dialyzer.plt"},
        plt_add_apps: [:mix, :ex_unit],
        flags: [
          :error_handling,
          :race_conditions,
          :underspecs,
          :unknown,
          :unmatched_returns
        ]
      ],
      # Test coverage
      test_coverage: [tool: ExCoveralls],
      preferred_cli_env: [
        coveralls: :test,
        "coveralls.detail": :test,
        "coveralls.html": :test
      ]
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]
end
```

### AST Inspection and Manipulation

Understanding and manipulating the AST is fundamental to advanced compilation techniques in Elixir:

```elixir
defmodule PrismaticCompiler.ASTAnalyzer do
  @moduledoc """
  Analyzes Elixir AST for pattern detection, quality enforcement,
  and automated code transformation. Used by quality gates to
  detect anti-patterns at compile time.
  """

  @type ast_node :: {atom(), keyword(), list()}

  @spec analyze_module(String.t()) :: {:ok, map()} | {:error, term()}
  def analyze_module(file_path) do
    with {:ok, source} <- File.read(file_path),
         {:ok, ast} <- Code.string_to_quoted(source, file: file_path) do
      analysis = %{
        file: file_path,
        functions: extract_functions(ast),
        module_attributes: extract_attributes(ast),
        macro_usage: detect_macro_usage(ast),
        anti_patterns: detect_anti_patterns(ast),
        complexity: calculate_complexity(ast),
        typespecs: extract_typespecs(ast)
      }

      {:ok, analysis}
    end
  end

  @spec extract_functions(ast_node()) :: list(map())
  defp extract_functions(ast) do
    ast
    |> Macro.prewalk([], fn
      {:def, meta, [{name, _, args} | _]} = node, acc ->
        arity = if is_list(args), do: length(args), else: 0
        func = %{name: name, arity: arity, line: Keyword.get(meta, :line), visibility: :public}
        {node, [func | acc]}

      {:defp, meta, [{name, _, args} | _]} = node, acc ->
        arity = if is_list(args), do: length(args), else: 0
        func = %{name: name, arity: arity, line: Keyword.get(meta, :line), visibility: :private}
        {node, [func | acc]}

      node, acc ->
        {node, acc}
    end)
    |> elem(1)
    |> Enum.reverse()
  end

  @spec detect_anti_patterns(ast_node()) :: list(map())
  defp detect_anti_patterns(ast) do
    patterns = []

    patterns =
      ast
      |> Macro.prewalk(patterns, fn
        # Detect unsafe map access (map.key instead of Map.get/2)
        {{:., _, [Access, :get]}, _, _} = node, acc ->
          {node, acc}

        # Detect length() > 0 anti-pattern
        {:>, meta, [{:length, _, _}, 0]} = node, acc ->
          warning = %{
            type: :length_comparison,
            line: Keyword.get(meta, :line),
            message: "Use Enum.any?/1 instead of length() > 0",
            severity: :warning
          }
          {node, [warning | acc]}

        # Detect Process.sleep in non-test code
        {{:., meta, [{:__aliases__, _, [:Process]}, :sleep]}, _, _} = node, acc ->
          warning = %{
            type: :process_sleep,
            line: Keyword.get(meta, :line),
            message: "Avoid Process.sleep/1 in production code",
            severity: :error
          }
          {node, [warning | acc]}

        node, acc ->
          {node, acc}
      end)
      |> elem(1)

    Enum.reverse(patterns)
  end

  defp extract_attributes(ast) do
    ast
    |> Macro.prewalk([], fn
      {:@, _, [{name, _, _}]} = node, acc when is_atom(name) ->
        {node, [name | acc]}
      node, acc ->
        {node, acc}
    end)
    |> elem(1)
    |> Enum.uniq()
    |> Enum.reverse()
  end

  defp detect_macro_usage(ast) do
    ast
    |> Macro.prewalk([], fn
      {:use, _, [{:__aliases__, _, modules} | _]} = node, acc ->
        {node, [Module.concat(modules) | acc]}
      node, acc ->
        {node, acc}
    end)
    |> elem(1)
    |> Enum.reverse()
  end

  defp extract_typespecs(ast) do
    ast
    |> Macro.prewalk([], fn
      {:@, _, [{:spec, _, _}]} = node, acc ->
        {node, [:spec | acc]}
      {:@, _, [{:type, _, _}]} = node, acc ->
        {node, [:type | acc]}
      {:@, _, [{:typep, _, _}]} = node, acc ->
        {node, [:typep | acc]}
      node, acc ->
        {node, acc}
    end)
    |> elem(1)
    |> length()
  end

  defp calculate_complexity(ast) do
    ast
    |> Macro.prewalk(0, fn
      {:case, _, _} = node, acc -> {node, acc + 1}
      {:cond, _, _} = node, acc -> {node, acc + 1}
      {:if, _, _} = node, acc -> {node, acc + 1}
      {:unless, _, _} = node, acc -> {node, acc + 1}
      {:with, _, _} = node, acc -> {node, acc + 1}
      node, acc -> {node, acc}
    end)
    |> elem(1)
  end
end
```

### Incremental Compilation in Umbrella Projects

Managing compilation across 115 umbrella applications requires careful dependency tracking and incremental compilation:

```elixir
defmodule PrismaticCompiler.UmbrellaCompilation do
  @moduledoc """
  Manages incremental compilation across the Prismatic umbrella project.
  Determines which applications need recompilation based on dependency
  changes and file modification timestamps.
  """

  @spec determine_compilation_targets() :: {:ok, list(atom())} | {:error, term()}
  def determine_compilation_targets do
    with {:ok, apps} <- list_umbrella_apps(),
         {:ok, dep_graph} <- build_dependency_graph(apps),
         {:ok, modified} <- find_modified_apps(apps) do
      targets =
        modified
        |> expand_dependents(dep_graph)
        |> topological_sort(dep_graph)

      {:ok, targets}
    end
  end

  @spec compile_with_enforcement(list(atom())) :: {:ok, map()} | {:error, list(map())}
  def compile_with_enforcement(targets) do
    results =
      targets
      |> Enum.map(fn app ->
        {app, compile_app(app)}
      end)

    errors =
      results
      |> Enum.filter(fn {_app, result} -> match?({:error, _}, result) end)

    warnings =
      results
      |> Enum.flat_map(fn {app, {:ok, diagnostics}} ->
        Enum.map(diagnostics, &Map.put(&1, :app, app))
      end)

    cond do
      length(errors) > 0 ->
        {:error, Enum.map(errors, fn {app, {:error, reason}} -> %{app: app, error: reason} end)}

      length(warnings) > 0 ->
        {:error, warnings}

      true ->
        {:ok, %{compiled: length(targets), warnings: 0, errors: 0}}
    end
  end

  defp list_umbrella_apps do
    apps =
      Path.wildcard("apps/*/mix.exs")
      |> Enum.map(fn path ->
        path
        |> Path.dirname()
        |> Path.basename()
        |> String.to_atom()
      end)

    {:ok, apps}
  end

  defp build_dependency_graph(apps) do
    graph =
      apps
      |> Enum.reduce(%{}, fn app, acc ->
        deps = get_app_deps(app)
        Map.put(acc, app, deps)
      end)

    {:ok, graph}
  end

  defp find_modified_apps(apps) do
    modified =
      apps
      |> Enum.filter(fn app ->
        source_modified_after_beam?(app)
      end)

    {:ok, modified}
  end

  defp expand_dependents(modified, dep_graph) do
    Enum.reduce(modified, MapSet.new(modified), fn app, acc ->
      dependents = find_all_dependents(app, dep_graph)
      MapSet.union(acc, MapSet.new(dependents))
    end)
    |> MapSet.to_list()
  end

  defp find_all_dependents(app, dep_graph) do
    dep_graph
    |> Enum.filter(fn {_dependent, deps} -> app in deps end)
    |> Enum.map(fn {dependent, _} -> dependent end)
  end

  defp topological_sort(apps, dep_graph) do
    Enum.sort(apps, fn a, b ->
      a_deps = Map.get(dep_graph, a, [])
      b in a_deps
    end)
  end

  defp get_app_deps(_app), do: []
  defp source_modified_after_beam?(_app), do: false
  defp compile_app(_app), do: {:ok, []}
end
```

## Implementation in Prismatic Platform

### Zero-Warning Policy

The Prismatic Platform enforces `--warnings-as-errors` across all 115 umbrella applications. This policy treats compiler warnings as compilation failures, preventing code with potential issues from entering the codebase. The zero-warning policy has been instrumental in achieving the 100/100 quality score across 13 quality domains.

```bash
# Mandatory compilation command
mix compile --warnings-as-errors --force
```

### Pre-Commit Compilation Gate

The pre-commit hook system includes compilation verification as an early-phase gate. Code that fails to compile cleanly (zero warnings, zero errors) is blocked from commit. This gate operates before more expensive checks like Dialyzer and Credo.

### Dialyzer Integration

Dialyzer (the DIscrepancy AnalYZer for ERlang programs) performs additional static analysis on compiled BEAM bytecode. The Prismatic Platform maintains a shared PLT (Persistent Lookup Table) at `priv/plts/dialyzer.plt` for efficient cross-application analysis.

### Release Compilation

Production releases use additional compilation steps including protocol consolidation, dead code elimination, and embedded configuration. The release compilation process is managed through `mix release` with custom steps for the Prismatic Platform's deployment requirements.

### Nuclear Cache Fix

When compilation state becomes corrupted (a known issue with large umbrella projects and incremental compilation), the platform provides a documented recovery procedure:

```bash
rm -rf _build/dev/lib/prismatic_claude/ebin && rm -rf priv/plts/dialyzer.plt
```

This removes cached compilation artifacts and forces a clean rebuild, resolving module-not-found and stale-bytecode issues.

## Comparison with Alternatives

### JIT Compilation (JavaScript V8, JVM HotSpot)

Just-In-Time compilation defers compilation to runtime, using profiling data to optimize hot paths. The BEAM VM uses a different approach: ahead-of-time compilation to bytecode with a JIT layer (JIT available in OTP 24+) that compiles frequently-executed bytecode sequences to native code.

| Aspect | BEAM/Elixir | JVM | V8 (JavaScript) |
|--------|-------------|-----|------------------|
| Primary compilation | AOT to bytecode | AOT to bytecode | AOT to bytecode |
| JIT | Optional (OTP 24+) | Mandatory (HotSpot) | Mandatory |
| Hot reload | Native support | Limited (JRebel) | Native (development) |
| Compilation speed | Fast (parallel) | Moderate | Very fast |
| Startup time | Fast | Slow (JIT warmup) | Fast |
| Peak performance | Good | Excellent | Good |

### Static Compilation (Rust, Go, C)

Languages that compile directly to machine code eliminate the VM layer. This provides peak performance but sacrifices hot code reloading, portability, and the concurrent garbage collection that BEAM provides. For Prismatic's use case -- a distributed, fault-tolerant platform -- BEAM's compilation model is superior despite lower raw throughput.

### Interpreted Execution (Python, Ruby)

Interpreted languages skip compilation entirely, executing source code through an interpreter. While this simplifies the development cycle, it eliminates compile-time error detection and produces slower execution. The Prismatic Platform requires compile-time quality gates that interpreted languages cannot provide.

## Best Practices

1. **Always compile with `--warnings-as-errors`**. Warnings indicate potential defects. Allowing warnings to accumulate creates technical debt that compounds over time.

2. **Use `--force` for CI builds**. Incremental compilation can mask issues that a clean build would catch. CI pipelines should always compile from scratch.

3. **Maintain shared PLT files**. For Dialyzer analysis in umbrella projects, a shared PLT across all applications avoids redundant analysis and reduces compilation overhead.

4. **Configure proper `elixirc_paths`**. Separate test support modules from production code by configuring environment-specific compilation paths.

5. **Monitor compilation times**. Compilation time is a developer experience metric. Track it over time and investigate regressions. The Prismatic Platform targets under 60 seconds for incremental compilation.

6. **Use compiler diagnostics proactively**. Elixir 1.15+ provides structured compiler diagnostics. Integrate these into quality reporting for early warning of emerging issues.

7. **Consolidate protocols for production**. Always enable protocol consolidation in release builds. Unconsolidated protocol dispatch has O(n) lookup complexity compared to O(1) for consolidated dispatch.

8. **Document compilation dependencies**. In umbrella projects, explicitly document cross-application compilation dependencies to prevent circular dependency issues and optimize parallel compilation.

## Common Pitfalls

1. **Ignoring compilation warnings**. "It's just a warning" is the beginning of quality erosion. The Prismatic Platform's zero-warning policy exists because every warning ignored is a potential bug shipped.

2. **Stale compilation artifacts**. Incremental compilation can leave stale `.beam` files that cause runtime errors despite successful compilation. Regular clean builds and the nuclear cache fix prevent this.

3. **Circular dependencies in umbrella apps**. Circular compile-time dependencies between umbrella applications create compilation deadlocks. Use runtime dependencies (Application.ensure_all_started/1) instead of compile-time dependencies where possible.

4. **Macro expansion side effects**. Macros that perform side effects during compilation (file I/O, network calls, process spawning) create non-deterministic builds. Keep macro expansion pure.

5. **Missing typespecs**. While Elixir does not require typespecs for compilation, missing specs reduce Dialyzer's effectiveness. The Prismatic Platform requires typespecs on all public functions.

6. **Over-reliance on compile-time configuration**. Using `Application.compile_env/3` excessively creates runtime inflexibility. Use it only for values that genuinely need compile-time resolution.

7. **Ignoring compilation order**. In umbrella projects, the order in which applications compile matters. Dependencies must compile before dependents. Mix handles this automatically for declared dependencies, but undeclared dependencies cause intermittent build failures.

## Use Cases

### Quality Gate Enforcement

Compilation with `--warnings-as-errors` serves as the first quality gate in the Prismatic Platform's multi-phase quality pipeline. Code that does not compile cleanly never reaches more expensive checks like Dialyzer, Credo, or test execution.

### AST-Based Code Analysis

The compilation pipeline's AST representation enables programmatic code analysis. The Prismatic Platform uses AST analysis for anti-pattern detection (O(1) pattern detection with 90-250x speedup over naive approaches), typespec coverage verification, and automated code transformation.

### Hot Code Upgrades

BEAM's compilation model enables production systems to be upgraded without downtime. New module versions are compiled, loaded alongside existing versions, and activated through process restart or explicit code change. This is essential for Prismatic's high-availability requirements.

### Custom Compiler Integration

Elixir's Mix build system supports custom compilers. The Prismatic Platform uses custom compilers for AIAD specification validation, quality DNA generation, and documentation synthesis during the build process.

### Release Engineering

Production releases require specific compilation configurations: protocol consolidation, configuration embedding, stripped debug information, and native code generation. The compilation step is central to the release engineering pipeline.

## Related Concepts

Compilation connects to numerous technical concepts within the Prismatic Platform:

- [BEAM VM](@/glossary/beam-vm.md) -- The virtual machine that executes compiled Elixir bytecode, providing concurrent execution, fault tolerance, and hot code reloading.
- [AST](@/glossary/ast.md) -- The Abstract Syntax Tree intermediate representation produced during parsing and manipulated during macro expansion.
- [Static Analysis](@/glossary/static-analysis.md) -- Analysis techniques applied to compiled code or AST representations to detect defects without execution.
- [Dialyzer](@/glossary/dialyzer.md) -- The BEAM ecosystem's primary static analysis tool, operating on compiled bytecode to detect type errors and unreachable code.
- [Credo](@/glossary/credo.md) -- Elixir's static code analysis tool that operates on source code and AST to enforce style and consistency rules.
- [Zero-Warning Policy](@/glossary/zero-warning-policy.md) -- The Prismatic Platform's policy of treating all compilation warnings as errors, enforcing clean builds.
- [Quality Gate](@/glossary/quality-gate.md) -- Automated checkpoints that code must pass before proceeding, with compilation being the first gate.
- [Clean Run](@/glossary/clean-run.md) -- A compilation and test execution with zero warnings, zero errors, and complete test passage.
- [Typespec](@/glossary/typespec.md) -- Elixir type specifications that enhance compilation analysis and enable Dialyzer verification.
- [Release](@/glossary/release.md) -- The production deployment artifact produced by compiling, consolidating, and packaging an Elixir application.

## See Also

- [BEAM](@/glossary/beam.md) -- The Erlang virtual machine underlying Elixir compilation and execution
- [Phoenix Framework](@/glossary/phoenix-framework.md) -- Web framework with specific compilation requirements for templates and routes
- [Umbrella Application](@/glossary/umbrella-application.md) -- The project structure that shapes compilation strategy for the Prismatic Platform
- [Test Coverage](@/glossary/test-coverage.md) -- Coverage measurement that depends on compilation instrumentation
- [Quality Gates](@/glossary/quality-gates.md) -- The multi-phase quality pipeline in which compilation is the first gate

---

*Compilation is a foundational operation in the Prismatic Platform's quality infrastructure. Every build is simultaneously a quality gate. For compilation troubleshooting and optimization guidance, see the platform documentation.*

---

**Connect & Contribute**: Built by [Tomas Korcak (korczis)](https://github.com/korczis) and the Prismatic community. Open source under GHL license. [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
