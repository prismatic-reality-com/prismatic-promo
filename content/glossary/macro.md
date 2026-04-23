+++
title = "Macro"
weight = 40
[extra]
category = "technology"
description = "Elixir compile-time metaprogramming construct for code generation and AST transformation"
related_terms = ["elixir", "mix", "protocol", "behaviour", "pattern-matching", "pipe-operator", "beam", "genserver"]
platform_relevance = "high"
complexity = "advanced"
domain = "metaprogramming"
layer = "compile-time"
paradigm = "functional"
runtime = "BEAM"
language = "Elixir"
origin = "Lisp macro tradition"
first_introduced = "Elixir 1.0"
prismatic_usage = "contract-test-generation, telemetry-instrumentation, boilerplate-elimination"
quality_impact = "high"
safety_level = "moderate"
documentation_required = true
testing_strategy = "test-generated-code"
anti_pattern_risk = "magic-macros"
enforcement = "no-magic-macros-policy"
related_apps = ["prismatic_storage_core", "prismatic_telemetry", "prismatic_safety"]
see_also = ["protocol", "behaviour", "genserver", "beam", "mix", "elixir", "pattern-matching", "pipe-operator"]
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 2074
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Macro", "Elixir", "glossary", "technology", "Prismatic Platform"]
tags = ["glossary", "technology", "macro", "prismatic"]
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "Macro - Prismatic Platform"
+++

## Definition

Macros in Elixir are compile-time metaprogramming constructs that receive abstract syntax tree (AST) fragments as arguments and return transformed AST that is injected into the calling module during compilation. They enable the generation of code at compile time rather than runtime, providing capabilities for domain-specific languages (DSLs), boilerplate elimination, compile-time validation, and syntactic abstraction. Elixir's macro system is built on the `quote/unquote` mechanism, which provides hygienic macro expansion -- meaning variables introduced by a macro do not leak into or conflict with variables in the calling context unless explicitly intended.

The theoretical foundation of Elixir's macro system derives from homoiconicity -- the property that code and data share the same representation. In Elixir, every expression can be represented as a three-element tuple `{atom, metadata, arguments}` forming the AST. The `quote` special form converts code into its AST representation, and `unquote` injects values into a quoted expression. This uniform representation means that macros manipulate code using the same data structures and functions used for any other data processing, making metaprogramming a natural extension of regular programming rather than a separate discipline requiring specialized syntax.

Elixir itself is substantially built on macros. Core language constructs including `def`, `defmodule`, `if`, `unless`, `case`, `cond`, `with`, and the [pipe operator](@/glossary/pipe-operator.md) `|>` are implemented as macros in the standard library, expanding to lower-level primitives during compilation. This design philosophy -- building the language from a minimal core and expressing higher-level constructs as macros -- provides both extensibility and transparency. Developers can inspect how any language construct works by examining its macro implementation, and they can create similarly powerful constructs for their own domains. The macro system is one of the features that distinguishes [Elixir](@/glossary/elixir.md) from other [BEAM](@/glossary/beam.md) languages and is deeply integrated into how the Prismatic Platform generates reliable, type-safe code across its 115 umbrella applications.

## Historical Context and Theoretical Foundations

The concept of macros in programming languages traces back to the Lisp family, where John McCarthy's original 1958 paper introduced the idea that code could be manipulated as data. This homoiconicity principle -- that programs and data share a common representation -- became the foundation for macro systems in Scheme, Common Lisp, and eventually Clojure. Elixir's macro system, designed by Jose Valim, draws directly from this lineage while incorporating lessons learned from decades of macro system evolution.

The critical advance in Elixir's approach compared to early Lisp macros is hygiene. Unhygienic macros, as found in Common Lisp, can inadvertently capture variables from the calling context, leading to subtle and difficult-to-diagnose bugs. Scheme introduced hygienic macros with `syntax-rules` and `syntax-case`, and Elixir follows this tradition by default. Every variable introduced within a `quote` block is scoped to the macro's own context. To deliberately inject a variable into the caller's scope, the developer must explicitly use `var!`, making the intention clear and auditable.

This distinction between hygienic and unhygienic expansion is fundamental to understanding macro safety in large codebases. The Prismatic Platform's policy of forbidding "magic macros" is directly informed by the risk profile of unhygienic macro usage. When a macro silently modifies the caller's namespace, the resulting behavior is indistinguishable from spooky action at a distance. The platform enforces that macros either remain hygienic or document their scope-breaking behavior with the same rigor applied to unsafe operations in systems programming languages.

The evolution from text-based preprocessors (C/C++ `#define`) through syntactic macros (Lisp `defmacro`) to hygienic macros (Scheme, Elixir) represents increasing formalization of metaprogramming safety. Each generation reduced the class of bugs that macros could introduce. Elixir's position at the end of this lineage means its macro system inherits decades of design wisdom, making it both powerful and, when used correctly, safe.

## Overview

Macros serve three primary purposes in Elixir development: reducing boilerplate through code generation, creating domain-specific languages for expressive problem descriptions, and performing compile-time validation that catches errors before runtime. Understanding when each purpose applies -- and more importantly, when macros should not be used -- is essential for writing maintainable Elixir code.

### The Quote/Unquote Mechanism

The `quote` special form converts Elixir source code into its AST representation, and `unquote` injects evaluated values back into a quoted expression. Together they form the foundation of all macro programming in Elixir.

```elixir
# quote converts code to AST
quote do
  1 + 2
end
# => {:+, [context: Elixir, imports: [{1, Kernel}]], [1, 2]}

# unquote injects values into quoted expressions
defmacro log_execution(expr) do
  quote do
    start = System.monotonic_time()
    result = unquote(expr)
    elapsed = System.monotonic_time() - start
    Logger.info("Executed in #{elapsed}ns")
    result
  end
end
```

### AST Structure

Every Elixir expression is represented as a tuple in the AST. Understanding this structure is essential for writing macros that manipulate code correctly.

| AST Form | Structure | Example Expression | AST Representation |
|----------|-----------|-------------------|--------------------|
| **Literal** | value | `42` | `42` |
| **Atom** | `:atom` | `:ok` | `:ok` |
| **Variable** | `{name, meta, context}` | `x` | `{:x, [], Elixir}` |
| **Call** | `{function, meta, args}` | `foo(1, 2)` | `{:foo, [], [1, 2]}` |
| **Qualified call** | `{{:., meta, [module, fun]}, meta, args}` | `String.length(s)` | `{{:., [], [String, :length]}, [], [{:s, [], Elixir}]}` |
| **Block** | `{:__block__, [], exprs}` | `a; b` | `{:__block__, [], [{:a, [], Elixir}, {:b, [], Elixir}]}` |

### Macro Expansion Pipeline

The Elixir compiler processes macros through a recursive expansion pipeline that runs until no macro calls remain in the AST. This process is deterministic and transparent, allowing developers to inspect the output at each stage.

```
Source Code --> Parse --> AST --> Macro Expansion --> Expanded AST --> Compile --> BEAM bytecode
                                      ^   |
                                      |   v
                                 (recursive until no macros remain)
```

The expansion order matters when macros call other macros. Elixir expands macros top-down and left-to-right within a module. Nested macro calls are expanded from the outermost inward. Understanding this order is critical when writing macros that depend on the output of other macros, a pattern the Prismatic Platform discourages but occasionally requires for deeply nested DSL definitions.

## Technical Details

### Hygiene

Macro hygiene prevents unintended variable capture between the macro definition and the calling context. This is one of the most important safety properties of Elixir's macro system.

```elixir
defmacro hygienic_example do
  quote do
    # This 'x' is scoped to the macro - it does NOT interfere
    # with any 'x' in the caller's scope
    x = 42
    x + 1
  end
end

# To intentionally break hygiene (inject into caller's scope):
defmacro unhygienic_example(var_name) do
  quote do
    var!(unquote(var_name)) = 42
  end
end
```

The `var!` function is the explicit escape hatch from hygiene. Every usage of `var!` should be treated as a code smell requiring justification and documentation. The Prismatic Platform's [Credo](@/glossary/credo.md) configuration includes a custom check that flags `var!` usage for mandatory review.

### Compile-Time vs Runtime

| Aspect | Compile-Time (Macros) | Runtime (Functions) |
|--------|----------------------|---------------------|
| **Execution** | During compilation | During program execution |
| **Input** | AST fragments | Evaluated values |
| **Output** | Transformed AST | Return values |
| **Error detection** | Compilation errors | Runtime exceptions |
| **Performance** | Zero runtime overhead | Function call overhead |
| **Debugging** | Harder (AST manipulation) | Standard debugging tools |
| **Testability** | Test generated code, not macro itself | Direct unit testing |
| **Use when** | Code generation, DSLs, validation | Business logic, data processing |

### Macro Anti-Patterns

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **Macro for everything** | Obscures code flow, harder to debug | Use functions first, macros only when necessary |
| **Complex logic in macros** | Untestable, hard to reason about | Extract logic to functions, use macros only for AST generation |
| **Nested macros** | Expansion order confusion | Flatten macro calls, avoid macro-generating macros |
| **Unquoted external calls** | Side effects during compilation | Keep macro bodies pure, defer side effects to generated code |
| **Magic macros** | Implicit behavior surprises developers | Document thoroughly, prefer explicit over implicit |
| **Unhygienic variable capture** | Silent namespace pollution | Use `var!` only with documentation, prefer hygienic patterns |

### The `__using__` Callback Pattern

The `__using__/1` callback is the idiomatic way to provide macro injection in Elixir. When a module calls `use SomeModule, opts`, Elixir invokes `SomeModule.__using__(opts)` which returns a quoted block injected into the calling module. This provides a single, documented entry point for macro-based functionality.

```elixir
defmodule PrismaticStorage.Storable do
  @moduledoc """
  Macro module that injects storage capabilities into any module.
  Generates standard CRUD functions with telemetry instrumentation.
  """

  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter)
    table = Keyword.fetch!(opts, :table)

    quote do
      @adapter unquote(adapter)
      @table unquote(table)

      @spec store(String.t(), map()) :: {:ok, map()} | {:error, term()}
      def store(key, value) do
        :telemetry.execute([:prismatic, :storage, :store], %{}, %{table: @table})
        @adapter.store(@table, key, value)
      end

      @spec fetch(String.t()) :: {:ok, map()} | {:error, :not_found}
      def fetch(key) do
        :telemetry.execute([:prismatic, :storage, :fetch], %{}, %{table: @table})
        @adapter.fetch(@table, key)
      end

      @spec delete(String.t()) :: :ok | {:error, term()}
      def delete(key) do
        :telemetry.execute([:prismatic, :storage, :delete], %{}, %{table: @table})
        @adapter.delete(@table, key)
      end
    end
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform uses macros judiciously, following the mandate that forbids magic macros except for boilerplate elimination. Key macro usage patterns include contract test generation, telemetry instrumentation, and storage adapter trait injection.

### Adapter Contract Test Generation

```elixir
defmodule PrismaticStorage.AdapterContractTest do
  @moduledoc """
  Macro that generates a standardized test suite ensuring any
  storage adapter implements the required contract correctly.

  Used across all 7 storage backends (ETS, Ecto, Meilisearch,
  KuzuDB, Redis, DuckDB, DETS) to ensure uniform contract compliance.
  """

  defmacro __using__(opts) do
    adapter_module = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter_module)

      describe "#{inspect(@adapter)} contract compliance" do
        test "implements store/2" do
          assert {:ok, _} = @adapter.store("test_key", %{data: "value"})
        end

        test "implements fetch/1" do
          {:ok, _} = @adapter.store("fetch_key", %{data: "test"})
          assert {:ok, %{data: "test"}} = @adapter.fetch("fetch_key")
        end

        test "implements delete/1" do
          {:ok, _} = @adapter.store("delete_key", %{data: "test"})
          assert :ok = @adapter.delete("delete_key")
          assert {:error, :not_found} = @adapter.fetch("delete_key")
        end

        test "returns {:error, :not_found} for missing keys" do
          assert {:error, :not_found} = @adapter.fetch("nonexistent")
        end
      end
    end
  end
end

# Usage in test files across 115 umbrella apps:
defmodule PrismaticStorage.ETSAdapterTest do
  use PrismaticStorage.AdapterContractTest, adapter_module: PrismaticStorage.ETS
end
```

### Telemetry Instrumentation Macro

```elixir
defmodule PrismaticTelemetry.Instrumented do
  @moduledoc """
  Macro for adding telemetry instrumentation to functions
  with zero boilerplate. Generates before/after telemetry events
  and measures execution duration automatically.
  """

  defmacro definstrumented(name, args, do: body) do
    event_prefix = [:prismatic, :instrumented]

    quote do
      @spec unquote(name)(unquote_splicing(Enum.map(args, fn _ -> quote do: term() end))) :: term()
      def unquote(name)(unquote_splicing(args)) do
        start_time = System.monotonic_time()
        start_metadata = %{function: unquote(name), args: unquote(args)}

        :telemetry.execute(
          unquote(event_prefix) ++ [:start],
          %{system_time: System.system_time()},
          start_metadata
        )

        result = unquote(body)

        :telemetry.execute(
          unquote(event_prefix) ++ [:stop],
          %{duration: System.monotonic_time() - start_time},
          Map.put(start_metadata, :result, elem(result, 0))
        )

        result
      end
    end
  end
end
```

### Quality Gate Enforcement Macro

```elixir
defmodule PrismaticSafety.QualityEnforced do
  @moduledoc """
  Macro that wraps module definitions with quality gate enforcement.
  Ensures @moduledoc, @spec, and @impl annotations are present
  on all public functions in the decorated module.
  """

  defmacro __using__(_opts) do
    quote do
      @after_compile {PrismaticSafety.QualityEnforced, :verify_quality}

      import PrismaticSafety.QualityEnforced, only: [quality_check: 1]
    end
  end

  @spec verify_quality(module(), binary()) :: :ok | no_return()
  def verify_quality(module, _bytecode) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, _, _, module_doc, _, function_docs} ->
        verify_moduledoc(module, module_doc)
        verify_specs(module, function_docs)
        :ok

      _ ->
        raise CompileError,
          description: "Module #{inspect(module)} missing documentation"
    end
  end
end
```

## Comparison with Alternatives

| Feature | Elixir Macros | Rust proc_macros | C/C++ Preprocessor | Lisp Macros | Java Annotations |
|---------|---------------|------------------|---------------------|-------------|------------------|
| **Input** | AST (typed tuples) | Token streams | Text substitution | S-expressions | Class metadata |
| **Hygiene** | Yes (default) | N/A (different model) | No | Varies (Scheme yes, CL no) | N/A |
| **Type safety** | Pattern matching on AST | Full Rust type system | None | Runtime types | Compile-time processing |
| **Debugging** | `Macro.expand/2`, `Macro.to_string/1` | `cargo expand` | `-E` flag | `macroexpand` | Annotation processor output |
| **Power** | Full language at compile time | Full Rust at compile time | Text replacement only | Full language at compile time | Limited to metadata |
| **Risk** | Moderate (hygienic) | Moderate (complex) | High (text-level bugs) | High (unhygienic in CL) | Low (constrained) |
| **Ecosystem** | OTP/BEAM native | Cargo ecosystem | System headers | ASDF/Quicklisp | Maven/Gradle |
| **Common use** | DSLs, boilerplate | Derive traits, procedural | Conditional compilation | Everything | Frameworks (Spring) |

## Debugging and Introspection

Elixir provides several tools for understanding and debugging macro behavior, which are essential when working with the complex macro expansions found in the Prismatic Platform.

### Macro.expand and Macro.to_string

```elixir
# Expand a macro call to see generated code
expanded = Macro.expand(quote do
  use PrismaticStorage.Storable, adapter: PrismaticStorage.ETS, table: :agents
end, __ENV__)

# Convert expanded AST back to readable Elixir source
IO.puts(Macro.to_string(expanded))
```

### The @compile :debug_info Attribute

Adding `@compile :debug_info` to a module preserves macro expansion information in the compiled BEAM file, enabling [Dialyzer](@/glossary/dialyzer.md) and other analysis tools to reason about the generated code. The Prismatic Platform enables debug info globally for all compilation modes through the project configuration.

### IEx Helpers

The IEx shell provides several helpers for macro exploration. `h/1` displays documentation for macros, `i/1` inspects AST structures, and `Macro.expand_once/2` performs a single expansion step for understanding multi-level macro chains.

## Performance Characteristics

Macros have zero runtime overhead because all macro code executes during compilation and produces plain Elixir code that is compiled to BEAM bytecode. The generated code runs at the same speed as hand-written equivalent code. However, macros do have compile-time cost.

| Metric | Impact | Mitigation |
|--------|--------|------------|
| **Compilation time** | Increased (AST transformation) | Cache compiled modules, incremental compilation |
| **Runtime performance** | Zero overhead | N/A -- macros produce regular BEAM bytecode |
| **Memory usage** | Compile-time only | Expansion happens once, result is cached |
| **Code size** | Can increase (code generation) | Generate only what is needed, avoid redundancy |
| **Dialyzer analysis** | Analyzes expanded code | Enable debug_info for accurate type inference |

## Best Practices

1. **Functions First, Macros Last**: Default to regular functions for all logic. Reach for macros only when you need to generate code, create DSLs, or perform compile-time validation. The Prismatic Platform's rule -- "no magic macros except for boilerplate elimination" -- enforces this principle.

2. **Keep Macro Bodies Simple**: Extract complex logic into regular functions called from within the macro's quoted block. The macro should handle only AST transformation; all business logic should live in testable functions.

3. **Test Generated Code, Not Macros**: Test the behavior of code generated by macros, not the macro expansion itself. The `AdapterContractTest` macro is validated by the fact that all adapter implementations pass the generated test suite.

4. **Document Thoroughly**: Every macro should have comprehensive `@moduledoc` and `@doc` explaining what code it generates, what inputs it expects, and what side effects (if any) the generated code produces. Macros that surprise developers are bugs.

5. **Use `Macro.expand/2` for Debugging**: When macro behavior is unclear, use `Macro.expand/2` to see the generated code. `Macro.to_string/1` converts the expanded AST back to readable Elixir source.

6. **Prefer `use` over `import` for Macros**: The `__using__/1` callback provides a single, documented entry point for macro injection. Avoid requiring users to `import` and call individual macros, which scatters macro usage across files.

7. **Respect Hygiene**: Never use `var!` without documenting why hygiene must be broken. Treat every `var!` call as a safety-critical operation requiring review.

8. **Avoid Macros That Generate Macros**: Meta-macros create expansion chains that are extremely difficult to debug and reason about. If you find yourself writing a macro that generates another macro, reconsider the design.

## Common Pitfalls

- **Compile-time side effects**: Performing HTTP calls, database queries, or file I/O inside macro bodies. These execute during compilation, not at runtime, producing confusing behavior and non-reproducible builds.

- **Over-reliance on `unquote_splicing`**: While `unquote_splicing` is powerful for injecting lists into AST, overuse creates hard-to-read macro bodies. Prefer building the AST in helper functions and injecting the final result.

- **Forgetting `bind_quoted`**: Without `bind_quoted`, values passed to macros may be evaluated multiple times in the generated code. Always use `bind_quoted` when injecting values that should be evaluated once.

- **Debugging expanded code**: When a macro-generated function raises an error, the stack trace points to the expanded code location, not the macro definition. This can make debugging challenging without understanding the expansion.

## Use Cases

- **Contract Test Generation**: The `AdapterContractTest` macro generates standardized test suites for all storage adapters ([ETS](@/glossary/ets.md), Ecto, Meilisearch, KuzuDB), ensuring consistent contract compliance across the 7-backend storage architecture.

- **Behaviour Callback Boilerplate**: Macros generate default implementations for OTP [behaviour](@/glossary/behaviour.md) callbacks ([GenServer](@/glossary/genserver.md), Supervisor), reducing repetitive code across the platform's hundreds of GenServer processes.

- **Typespec Generation**: Macros generate `@spec` annotations from struct definitions, maintaining [typespec](@/glossary/typespec.md) coverage without manual annotation of every function.

- **Telemetry Instrumentation**: The instrumentation macro adds telemetry event emission to functions without modifying their logic, enabling observability across the platform with minimal code intrusion.

- **Mix Task Definition**: Custom [Mix](@/glossary/mix.md) tasks use macros to define standardized task metadata (description, shortdoc, moduledoc) and argument parsing boilerplate.

- **Quality Gate Enforcement**: Compile-time macros verify that modules comply with platform quality standards, catching violations before code reaches the test or deployment stages.

## Related Concepts

- [Elixir](@/glossary/elixir.md) -- Language providing the macro system and AST manipulation primitives
- [Protocol](@/glossary/protocol.md) -- Polymorphism mechanism that macros help implement across types
- [Behaviour](@/glossary/behaviour.md) -- Callback contracts that macros can auto-implement
- [Pattern Matching](@/glossary/pattern-matching.md) -- Core language feature used within macro-generated code
- [Mix](@/glossary/mix.md) -- Build tool that orchestrates compilation triggering macro expansion
- [BEAM](@/glossary/beam.md) -- Virtual machine executing compiled macro-expanded bytecode
- [Pipe Operator](@/glossary/pipe-operator.md) -- Language construct itself implemented as a macro
- [GenServer](@/glossary/genserver.md) -- OTP behaviour with macro-generated callback boilerplate
- [Dialyzer](@/glossary/dialyzer.md) -- Type analysis tool that analyzes macro-expanded code
- [Credo](@/glossary/credo.md) -- Static analysis tool enforcing macro usage policies
- [ETS](@/glossary/ets.md) -- Storage backend with macro-generated contract tests

## See Also

- [Architecture](@/architecture/_index.md) -- Code generation patterns and metaprogramming architecture
- [Technologies](@/technologies/_index.md) -- Elixir macro system and compile-time tooling
- [Capabilities](@/capabilities/_index.md) -- Code generation and automation capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
