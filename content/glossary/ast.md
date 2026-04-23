+++
title = "Abstract Syntax Tree (AST)"
description = "An Abstract Syntax Tree (AST) is a hierarchical tree data structure representing the syntactic structure of source code, serving as the foundation for code analysis, transformation, macro expansion, and metaprogramming in the Prismatic Platform."
weight = 50

[extra]
category = "compiler-theory"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
technical_level = "expert"
domain_category = "compiler-theory"
related_concepts = ["compilation", "metaprogramming", "static-analysis", "code-generation", "macro-expansion", "pattern-matching", "code-transformation"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 4
prerequisites = ["functional-programming", "elixir-basics", "compiler-theory", "data-structures"]
learning_path = ["elixir-fundamentals", "macro-systems", "compiler-internals", "code-analysis-pipelines"]
interactive_demos = ["ast-explorer", "macro-expansion-visualizer", "code-transformation-playground"]
code_examples = true
external_resources = ["https://hexdocs.pm/elixir/Macro.html", "https://hexdocs.pm/elixir/Code.html", "https://en.wikipedia.org/wiki/Abstract_syntax_tree"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["ast-traversal-correctness", "macro-expansion-determinism", "code-generation-round-trip", "pattern-matching-exhaustiveness"]
keywords = ["abstract syntax tree", "AST", "compiler", "metaprogramming", "macro", "code analysis", "syntax", "parse tree", "code transformation", "static analysis", "Elixir AST", "quoted expressions"]
tags = ["ast", "compiler-theory", "metaprogramming", "elixir", "static-analysis", "code-generation", "advanced"]
related_terms = ["compilation", "macro", "pattern-matching", "static-analysis", "code-generation", "elixir", "dialyzer", "credo", "typespec", "introspection"]
date_created = "2026-02-22"
word_count = 1805
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Abstract Syntax Tree (AST) - Prismatic Platform"
+++

## Definition

An **Abstract Syntax Tree (AST)** is a hierarchical tree data structure that represents the abstract syntactic structure of source code. Unlike a concrete syntax tree (parse tree), an AST omits syntactic details such as parentheses, semicolons, and whitespace that are irrelevant to the semantic meaning of the program. Each node in the tree represents a construct occurring in the source code -- variables, operators, function calls, control flow statements, and module definitions are all encoded as tree nodes with typed children.

In the context of Elixir and the Prismatic Platform, the AST takes on a particularly powerful role because Elixir's homoiconic nature means that code and data share the same representation. Every Elixir expression can be represented as a three-element tuple `{form, metadata, arguments}`, making the AST a first-class citizen that developers can inspect, transform, and generate programmatically through the macro system.

## Overview

Abstract Syntax Trees sit at the intersection of compiler theory, language design, and software engineering tooling. They serve as the canonical intermediate representation between raw source text and executable code, enabling a rich ecosystem of tools including linters, formatters, refactoring engines, type checkers, and code generators.

The fundamental insight behind ASTs is that programming languages have a tree-structured grammar. A function definition contains parameters and a body; the body contains expressions; expressions contain sub-expressions. By stripping away the surface syntax and preserving only the structural relationships, an AST provides a clean interface for any tool that needs to reason about code.

In modern software platforms, ASTs enable capabilities that would be impossible with string-based code manipulation:

- **Static analysis** tools like Dialyzer and Credo traverse ASTs to find type errors, code smells, and security vulnerabilities without executing the code
- **Macro systems** transform ASTs at compile time to generate boilerplate, implement domain-specific languages, and enforce architectural patterns
- **Code formatters** parse source into ASTs and then pretty-print them back with consistent styling
- **Refactoring tools** perform semantically-aware transformations that preserve program behavior while changing structure
- **Code generation** pipelines produce ASTs programmatically and convert them to source files

The Prismatic Platform leverages ASTs extensively across its 115-app umbrella architecture for compile-time code analysis, quality gate enforcement, custom Credo checks, and the AIAD agent specification system.

## Technical Details

### AST Structure in Elixir

Elixir's AST representation follows a consistent three-tuple format that makes it uniquely accessible compared to most languages:

```elixir
# The canonical AST node format
{atom | tuple, keyword_list, atom | list}

# Concrete examples:
# A variable reference
{:x, [line: 1], nil}

# A function call: sum(1, 2)
{:sum, [line: 1], [1, 2]}

# A remote function call: String.upcase("hello")
{{:., [line: 1], [{:__aliases__, [line: 1], [:String]}, :upcase]},
 [line: 1],
 ["hello"]}

# A module attribute: @moduledoc "..."
{:@, [line: 1], [{:moduledoc, [line: 1], ["Documentation"]}]}
```

The three elements are:

1. **Form** -- an atom representing the node type (`:def`, `:if`, `:case`, etc.) or a tuple for qualified calls
2. **Metadata** -- a keyword list containing source location (line, column), context information, and compiler annotations
3. **Arguments** -- a list of child nodes (sub-expressions), or an atom like `nil` for leaf nodes (variables)

### Quoting and Unquoting

Elixir provides the `quote` special form to convert code into its AST representation, and `unquote` to inject values back into a quoted expression:

```elixir
defmodule PrismaticAst.Explorer do
  @moduledoc """
  Demonstrates AST quoting, unquoting, and traversal patterns
  used throughout the Prismatic Platform for code analysis.
  """

  @doc """
  Converts an Elixir expression to its AST representation.
  Returns the three-tuple form used by the compiler.
  """
  @spec to_ast(String.t()) :: {:ok, Macro.t()} | {:error, term()}
  def to_ast(code_string) do
    Code.string_to_quoted(code_string,
      columns: true,
      token_metadata: true,
      unescape: false
    )
  end

  @doc """
  Demonstrates compile-time AST construction using quote/unquote.
  The function_name is injected at compile time into the AST template.
  """
  defmacro define_validator(function_name, validation_fn) do
    quote do
      @spec unquote(function_name)(term()) :: {:ok, term()} | {:error, String.t()}
      def unquote(function_name)(value) do
        case unquote(validation_fn).(value) do
          true -> {:ok, value}
          false -> {:error, "Validation failed for #{inspect(value)}"}
        end
      end
    end
  end
end
```

### AST Traversal Algorithms

The Prismatic Platform implements several AST traversal strategies for different analysis needs:

```elixir
defmodule PrismaticAst.Traversal do
  @moduledoc """
  AST traversal utilities supporting depth-first, breadth-first,
  and accumulator-based walks over Elixir syntax trees.
  """

  @doc """
  Performs a depth-first pre-order traversal of an AST,
  applying the visitor function to each node. Returns a list
  of all nodes matching the predicate.
  """
  @spec find_nodes(Macro.t(), (Macro.t() -> boolean())) :: [Macro.t()]
  def find_nodes(ast, predicate) do
    {_ast, acc} =
      Macro.prewalk(ast, [], fn node, acc ->
        if predicate.(node) do
          {node, [node | acc]}
        else
          {node, acc}
        end
      end)

    Enum.reverse(acc)
  end

  @doc """
  Counts all function definitions (def, defp, defmacro, defmacrop)
  in the given AST. Used by quality gates for complexity analysis.
  """
  @spec count_functions(Macro.t()) :: non_neg_integer()
  def count_functions(ast) do
    function_forms = [:def, :defp, :defmacro, :defmacrop]

    ast
    |> find_nodes(fn
      {form, _meta, _args} when form in function_forms -> true
      _other -> false
    end)
    |> length()
  end

  @doc """
  Extracts all module attributes from an AST, returning
  a map of attribute names to their values. Supports the
  quality DNA system's metadata extraction pipeline.
  """
  @spec extract_attributes(Macro.t()) :: %{atom() => term()}
  def extract_attributes(ast) do
    ast
    |> find_nodes(fn
      {:@, _meta, [{_name, _attr_meta, _value}]} -> true
      _other -> false
    end)
    |> Enum.reduce(%{}, fn {:@, _meta, [{name, _attr_meta, [value]}]}, acc ->
      Map.put(acc, name, value)
    end)
  end

  @doc """
  Transforms an AST by replacing all occurrences of one function
  call with another. Used during automated refactoring operations.
  """
  @spec rename_function(Macro.t(), atom(), atom()) :: Macro.t()
  def rename_function(ast, old_name, new_name) do
    Macro.postwalk(ast, fn
      {^old_name, meta, args} -> {new_name, meta, args}
      other -> other
    end)
  end
end
```

### AST-Based Pattern Detection

The platform uses AST analysis for detecting anti-patterns and enforcing coding standards:

```elixir
defmodule PrismaticAst.PatternDetector do
  @moduledoc """
  Detects forbidden patterns and anti-patterns by analyzing
  the AST structure. Powers the pre-commit quality gates
  and custom Credo checks.
  """

  @forbidden_calls [
    {:Process, :sleep},
    {:IO, :inspect},
    {:IO, :puts}
  ]

  @doc """
  Scans an AST for forbidden function calls that should not
  appear in production code. Returns a list of violations
  with line numbers for reporting.
  """
  @spec detect_forbidden_calls(Macro.t()) :: [{atom(), atom(), pos_integer()}]
  def detect_forbidden_calls(ast) do
    Macro.prewalk(ast, [], fn node, acc ->
      case node do
        {{:., _dot_meta, [{:__aliases__, _alias_meta, [module]}, function]},
         call_meta, _args} ->
          if {module, function} in @forbidden_calls do
            line = Keyword.get(call_meta, :line, 0)
            {node, [{module, function, line} | acc]}
          else
            {node, acc}
          end

        _other ->
          {node, acc}
      end
    end)
    |> elem(1)
    |> Enum.reverse()
  end

  @doc """
  Detects unsafe map access patterns (map.key instead of
  Map.get/3 or pattern matching) that can cause KeyError
  at runtime.
  """
  @spec detect_unsafe_map_access(Macro.t()) :: [%{line: pos_integer(), expression: String.t()}]
  def detect_unsafe_map_access(ast) do
    Macro.prewalk(ast, [], fn node, acc ->
      case node do
        {{:., meta, [{var_name, _var_meta, nil}, field]}, _call_meta, []}
        when is_atom(var_name) and is_atom(field) ->
          line = Keyword.get(meta, :line, 0)
          expr = "#{var_name}.#{field}"
          {node, [%{line: line, expression: expr} | acc]}

        _other ->
          {node, acc}
      end
    end)
    |> elem(1)
    |> Enum.reverse()
  end
end
```

### Compile-Time AST Transformations

Elixir macros operate by receiving ASTs and returning transformed ASTs at compile time:

```elixir
defmodule PrismaticAst.CompileTime do
  @moduledoc """
  Compile-time AST transformations that generate production code
  from declarative specifications. Demonstrates the power of
  AST manipulation for reducing boilerplate.
  """

  @doc """
  Generates a complete CRUD interface from a schema specification.
  The macro receives the schema AST at compile time and produces
  function definitions for create, read, update, and delete.
  """
  defmacro defcrud(schema_module, opts \\\\ []) do
    repo = Keyword.get(opts, :repo, PrismaticStorage.Repo)

    quote do
      @spec create(map()) :: {:ok, unquote(schema_module).t()} | {:error, Ecto.Changeset.t()}
      def create(attrs) do
        %unquote(schema_module){}
        |> unquote(schema_module).changeset(attrs)
        |> unquote(repo).insert()
      end

      @spec get(binary()) :: {:ok, unquote(schema_module).t()} | {:error, :not_found}
      def get(id) do
        case unquote(repo).get(unquote(schema_module), id) do
          nil -> {:error, :not_found}
          record -> {:ok, record}
        end
      end

      @spec update(unquote(schema_module).t(), map()) ::
              {:ok, unquote(schema_module).t()} | {:error, Ecto.Changeset.t()}
      def update(record, attrs) do
        record
        |> unquote(schema_module).changeset(attrs)
        |> unquote(repo).update()
      end

      @spec delete(unquote(schema_module).t()) ::
              {:ok, unquote(schema_module).t()} | {:error, Ecto.Changeset.t()}
      def delete(record) do
        unquote(repo).delete(record)
      end
    end
  end
end
```

## Implementation in the Prismatic Platform

The Prismatic Platform makes extensive use of ASTs across multiple subsystems:

### Custom Credo Checks

The `prismatic_credo` application contains AST-powered checks that enforce platform-specific coding standards. Each check receives the AST of a source file and traverses it to find violations:

- **HardcodedCiValues** -- detects hardcoded CI environment values in source code
- **HeexCssCustomProperties** -- validates CSS custom property usage in HEEx templates
- **JavascriptRegexFlags** -- catches JavaScript-style regex flags in Elixir code
- **SuggestUnusedVariablePrefix** -- recommends underscore prefixes for unused variables
- **UnsafeFunctionReferences** -- identifies potentially unsafe dynamic function references

### Quality Gate Enforcement

The pre-commit hook system parses modified files into ASTs and runs pattern detection to catch forbidden constructs before they enter the repository. This includes detection of `Process.sleep` calls, unsafe map access, missing `@spec` annotations, and forbidden naming patterns.

### Auto-Introspecting API

The `prismatic_api` application uses AST introspection via `Code.fetch_docs/1` and `Code.Typespec.fetch_specs/1` to automatically discover all public functions across facade modules and expose them as REST endpoints. The type specifications in the AST are mapped to OpenAPI JSON Schema types.

### SEADF Quality Guardian

The SEADF framework's Quality Guardian component analyzes ASTs to compute complexity metrics, detect code smells, and track quality trends across the entire umbrella architecture. It processes thousands of modules per scan using parallel AST traversal.

### Macro-Based DSLs

Several platform components define domain-specific languages through macros that transform declarative AST specifications into runtime code:

- Agent specifications in the AIAD system
- Storage adapter trait definitions
- Pipeline stage declarations
- Policy enforcement rules

## Comparison with Alternatives

| Approach | Strengths | Weaknesses | Use Case |
|----------|-----------|------------|----------|
| **AST Analysis** | Semantically aware, handles all syntax correctly, compiler-integrated | Requires language-specific parser, more complex than regex | Production code analysis, refactoring, generation |
| **Regular Expressions** | Simple, language-agnostic, fast for simple patterns | Cannot handle nested structures, high false positive rate | Quick text searches, simple pattern matching |
| **String Manipulation** | Straightforward, no parser needed | Fragile, breaks on formatting changes, no semantic understanding | Template-based generation only |
| **Concrete Syntax Trees** | Preserves all syntactic detail including whitespace | Larger, more complex to traverse, includes irrelevant nodes | Formatters, precise source transformation |
| **Bytecode Analysis** | Works on compiled code, can analyze optimized forms | Loses source-level information, version-dependent format | Runtime analysis, performance profiling |
| **S-Expressions** | Uniform structure, trivial to parse | Only natural in Lisp-family languages | Lisp/Clojure ecosystems |

Elixir's AST representation is particularly well-suited for analysis and transformation because:

1. **Uniform structure** -- every expression follows the same three-tuple format
2. **Metadata preservation** -- line numbers, column positions, and compiler annotations are embedded in every node
3. **Round-trip fidelity** -- `Macro.to_string/1` can convert ASTs back to readable source code
4. **First-class support** -- `quote`/`unquote` make AST construction a language primitive, not an external tool

## Best Practices

1. **Use `Macro.prewalk/3` and `Macro.postwalk/3`** for traversal instead of writing custom recursive functions. These standard library functions handle all edge cases including literals, blocks, and special forms.

2. **Preserve metadata during transformations**. When constructing new AST nodes, carry forward the metadata from the original nodes to maintain accurate line number reporting in error messages and debugging.

3. **Test macros by asserting on expansion results**. Use `Macro.expand_once/2` or `Macro.expand/2` in tests to verify that macros produce the expected AST without relying on runtime behavior.

4. **Prefer `Code.string_to_quoted/2` with `columns: true`** when parsing source strings. Column information enables precise error reporting and is required by modern analysis tools.

5. **Keep macros simple and delegate to functions**. A macro should do the minimum AST transformation needed, then call regular functions for the actual logic. This makes the code testable and debuggable.

6. **Use `Macro.escape/1` for embedding complex data**. When injecting runtime values into ASTs via `unquote`, escape complex data structures to ensure they are properly represented as AST literals.

7. **Document AST shapes with examples**. When writing code that pattern matches on AST nodes, include comments showing the expected input shape to help future maintainers understand the patterns.

8. **Validate AST inputs in public macro APIs**. Use guard clauses and pattern matching to provide clear compile-time error messages when macros receive unexpected AST shapes.

## Common Pitfalls

1. **Confusing quoted and unquoted contexts**. A common mistake is trying to use runtime variables inside `quote` blocks without `unquote`. The variable reference becomes a literal AST node rather than its value.

2. **Ignoring the metadata keyword list**. Dropping metadata during AST transformations causes confusing compiler errors with wrong line numbers, making debugging nearly impossible.

3. **Over-using macros when functions suffice**. Macros add compile-time complexity and make code harder to understand. If the same result can be achieved with a regular function, prefer the function.

4. **Assuming AST structure across Elixir versions**. The internal AST representation can change between Elixir releases. Always test AST-dependent code against the target Elixir version and use documented `Macro` module functions for traversal.

5. **Recursive traversal without base cases**. Forgetting to handle literal values (integers, strings, atoms, lists) in manual AST traversal leads to `FunctionClauseError` crashes on real-world code.

6. **Modifying ASTs in `prewalk` callbacks**. Changing the structure of child nodes during pre-order traversal can cause the walker to visit nodes that no longer exist or skip newly inserted nodes. Use `postwalk` when the transformation depends on child results.

7. **String-based AST comparison in tests**. Comparing `Macro.to_string/1` output is fragile because formatting can change. Compare AST structures directly using pattern matching or `Macro.expand/2`.

8. **Nested `quote` blocks without `bind_quoted`**. When a macro needs to use the same value multiple times, use `bind_quoted` to evaluate it once, preventing duplicate side effects.

## Use Cases

### Automated Code Quality Enforcement

AST analysis powers the Prismatic Platform's zero-warning, zero-debt quality system. Every source file is parsed into an AST and checked against a comprehensive set of rules covering naming conventions, complexity thresholds, required annotations, and forbidden patterns. This runs as part of the 11-phase pre-commit hook.

### Domain-Specific Language Creation

Platform components like the AIAD agent specification system, storage adapter traits, and pipeline definitions use macros to transform declarative specifications into runtime implementations. Developers write high-level descriptions and the macro system generates the full implementation through AST transformation.

### API Documentation Generation

The auto-introspecting API system reads `@doc`, `@spec`, and `@moduledoc` attributes from module ASTs to generate OpenAPI specifications automatically. This eliminates the need for separate API documentation that could drift from the implementation.

### Compile-Time Optimization

Performance-critical paths use AST transformations to evaluate constant expressions, inline small functions, and specialize generic code at compile time. This provides zero-cost abstractions where the developer writes clean, general code that compiles to optimized specific code.

### Security Vulnerability Detection

The color-team security operations use AST analysis to detect potential security vulnerabilities such as SQL injection points, unsafe deserialization, hardcoded credentials, and privilege escalation paths in code under review.

### Refactoring at Scale

When architectural changes require modifying patterns across hundreds of modules in the 115-app umbrella, AST-based refactoring tools can perform semantically-correct transformations that string-based find-and-replace would handle incorrectly.

## Related Concepts

The following concepts are closely related to Abstract Syntax Trees within the Prismatic Platform ecosystem:

- [Compilation](@/glossary/compilation.md) -- the process that transforms ASTs into executable bytecode for the BEAM virtual machine
- [Static Analysis](@/glossary/static-analysis.md) -- automated examination of source code ASTs without execution to find bugs and enforce standards
- [Credo](@/glossary/credo.md) -- the Elixir static analysis tool that uses AST traversal for its checks, including custom Prismatic Platform rules
- [Dialyzer](@/glossary/dialyzer.md) -- the success typing analyzer that operates on compiled BEAM bytecode derived from ASTs
- [Pattern Matching](@/glossary/pattern-matching.md) -- the fundamental mechanism used to destructure and analyze AST nodes during traversal
- [Code Generation](@/glossary/code-generation.md) -- the process of programmatically constructing ASTs and converting them to source code
- [Introspection](@/glossary/introspection.md) -- runtime examination of module metadata originally encoded in AST annotations
- [Elixir](@/glossary/elixir.md) -- the programming language whose homoiconic design makes AST manipulation a first-class feature
- [Typespec](@/glossary/typespec.md) -- type specifications stored as AST annotations that enable static type analysis
- [Macro](@/glossary/macro.md) -- compile-time functions that receive and return ASTs, enabling metaprogramming

## See Also

- [BEAM VM](@/glossary/beam-vm.md) -- the virtual machine that executes code compiled from Elixir ASTs
- [Quality Gate](@/glossary/quality-gate.md) -- enforcement checkpoints that use AST analysis to verify code standards
- [Functional Programming Language](@/glossary/functional-programming-language.md) -- the programming paradigm that shapes Elixir's AST design
- [Mix Task](@/glossary/mix-task.md) -- build tool tasks that often operate on ASTs for code analysis

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com) | Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
