+++
title = "Code Generation"
weight = 50
[extra]
description = "Code generation is the automated production of source code from higher-level specifications, templates, schemas, or models, eliminating repetitive manual coding while ensuring consistency, correctness, and adherence to architectural standards."
category = "software-engineering"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "14 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "software-engineering"
related_concepts = ["metaprogramming", "template engines", "AST manipulation", "schema-driven development", "scaffolding", "macro systems", "domain-specific languages", "model-driven architecture"]
implementation_status = "production"
authority_level = "L3-strategic"
difficulty_rating = 4
prerequisites = ["Elixir fundamentals", "AST concepts", "macro basics", "template systems"]
learning_path = ["Elixir macros", "AST manipulation", "Mix task development", "code generator design", "schema-driven architecture"]
interactive_demos = ["macro expansion viewer", "AST explorer", "template-based generator"]
code_examples = true
external_resources = ["https://hexdocs.pm/elixir/macros.html", "https://hexdocs.pm/mix/Mix.Generator.html", "https://pragprog.com/titles/cmelixir/metaprogramming-elixir/"]
version_introduced = "0.5.0"
stability_level = "stable"
testing_scenarios = ["generated code compilation", "generated code correctness", "template variable substitution", "AST transformation validation", "round-trip generation fidelity"]
keywords = ["code generation", "metaprogramming", "macros", "AST", "scaffolding", "templates", "Mix generator", "schema-driven", "boilerplate elimination", "automation"]
tags = ["glossary", "software-engineering", "metaprogramming", "automation", "elixir", "code-quality"]
related_terms = ["macro", "compilation", "ast", "mix-task", "code-quality", "code-example", "protocol", "behaviour", "typespec", "static-analysis"]
word_count = 1635
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Code Generation - Prismatic Platform"
+++

## Definition

**Code generation** is the automated production of source code from higher-level specifications, templates, schemas, abstract syntax trees (ASTs), or declarative models. Rather than writing repetitive boilerplate code by hand, developers define patterns, rules, or templates that a generator transforms into concrete source code. Code generation spans a wide spectrum, from simple template substitution (scaffolding) to sophisticated metaprogramming systems that manipulate abstract syntax trees at compile time. In the Elixir ecosystem, code generation is deeply integrated into the language through its powerful macro system, which operates on the AST representation of code.

## Overview

Code generation addresses a fundamental tension in software engineering: the need for consistency and correctness across large codebases versus the cost and error-proneness of manually writing repetitive code. When a pattern must be replicated across dozens or hundreds of modules -- API endpoints, database schemas, test scaffolds, protocol implementations -- manual implementation invites inconsistency, omissions, and subtle bugs.

The code generation spectrum includes:

- **Template-based generation** (lowest complexity): String interpolation and file templates that produce source code from variables and patterns. Mix generators (`mix phx.gen.live`, `mix phx.gen.context`) exemplify this approach.
- **Schema-driven generation** (medium complexity): Code produced from formal schemas like OpenAPI specifications, Protocol Buffers definitions, or database schema metadata. The generated code is a faithful projection of the schema into a target language.
- **AST-based metaprogramming** (highest complexity): Compile-time manipulation of the language's abstract syntax tree. Elixir macros operate at this level, transforming quoted expressions into generated code during compilation.
- **AI-assisted generation** (emerging): Large language models producing code from natural language descriptions or high-level specifications. While powerful, AI-generated code requires the same verification and quality gates as manually written code.

### Why Code Generation Matters

In a platform with 141 umbrella applications, code generation is not a luxury -- it is a necessity. Without it, maintaining consistency across applications would require heroic manual effort and would inevitably fail as the codebase grows. Key benefits include:

1. **Consistency**: Generated code follows the same patterns everywhere, eliminating the "many ways to do the same thing" problem
2. **Correctness**: A validated generator produces correct code every time, while manual implementation introduces variation and errors
3. **Velocity**: Generating boilerplate in seconds rather than writing it in hours frees developers for genuinely creative work
4. **Evolvability**: When a pattern changes, updating the generator propagates the change across all generated artifacts
5. **Documentation alignment**: Generators can produce documentation alongside code, ensuring they stay synchronized

## Technical Details

### Elixir Macro System

Elixir's macro system is the most powerful code generation facility available in the platform. Macros operate on the abstract syntax tree (AST) at compile time, transforming quoted expressions into new code that is then compiled into the final BEAM bytecode:

```elixir
defmodule Prismatic.CodeGen.AdapterMacro do
  @moduledoc """
  Generates storage adapter implementations from a declarative
  specification. Each adapter follows the same contract but
  targets different storage backends.
  """

  defmacro defadapter(name, opts) do
    storage_module = Keyword.fetch!(opts, :storage)
    table_name = Keyword.fetch!(opts, :table)
    primary_key = Keyword.get(opts, :primary_key, :id)

    quote do
      defmodule unquote(name) do
        @moduledoc """
        Auto-generated storage adapter for #{unquote(table_name)}.
        Backend: #{inspect(unquote(storage_module))}
        """

        @behaviour Prismatic.StorageCore.Adapter

        @impl true
        def get(key) do
          unquote(storage_module).lookup(unquote(table_name), {unquote(primary_key), key})
        end

        @impl true
        def put(key, value) do
          record = Map.put(value, unquote(primary_key), key)
          unquote(storage_module).insert(unquote(table_name), record)
        end

        @impl true
        def delete(key) do
          unquote(storage_module).delete(unquote(table_name), {unquote(primary_key), key})
        end

        @impl true
        def list(opts \\ []) do
          unquote(storage_module).select(unquote(table_name), opts)
        end
      end
    end
  end
end
```

Usage of the macro produces complete adapter modules at compile time:

```elixir
defmodule Prismatic.Adapters do
  require Prismatic.CodeGen.AdapterMacro

  Prismatic.CodeGen.AdapterMacro.defadapter(
    Prismatic.Adapters.AgentStore,
    storage: Prismatic.StorageETS,
    table: :agents,
    primary_key: :agent_id
  )

  Prismatic.CodeGen.AdapterMacro.defadapter(
    Prismatic.Adapters.CommandStore,
    storage: Prismatic.StorageETS,
    table: :commands,
    primary_key: :command_id
  )
end
```

### Mix Generator Tasks

Mix tasks provide a user-friendly interface for template-based code generation. The Prismatic Platform includes custom generators that produce application scaffolds, test files, and documentation following platform standards:

```elixir
defmodule Mix.Tasks.Prismatic.Gen.App do
  @moduledoc """
  Generates a new Prismatic umbrella application with
  all required quality infrastructure: CLAUDE.md,
  quality DNA, test scaffolds, and standard mix.exs.

  ## Usage

      mix prismatic.gen.app my_app --category security

  ## Generated Files

    - apps/prismatic_my_app/mix.exs
    - apps/prismatic_my_app/lib/prismatic_my_app.ex
    - apps/prismatic_my_app/lib/prismatic_my_app/application.ex
    - apps/prismatic_my_app/test/test_helper.exs
    - apps/prismatic_my_app/test/prismatic_my_app_test.exs
    - apps/prismatic_my_app/CLAUDE.md
    - apps/prismatic_my_app/.claude/quality-dna/current-state.json
  """
  use Mix.Task

  @shortdoc "Generate a new Prismatic umbrella application"

  @template_dir "priv/templates/prismatic.gen.app"

  @impl Mix.Task
  def run(args) do
    {opts, [name], _} = OptionParser.parse(args, strict: [category: :string])

    category = Keyword.get(opts, :category, "core")
    module_name = Macro.camelize(name)
    app_name = "prismatic_#{name}"
    app_dir = Path.join("apps", app_name)

    bindings = [
      app_name: app_name,
      module_name: "Prismatic#{module_name}",
      category: category,
      elixir_version: "~> 1.19",
      date: Date.to_string(Date.utc_today())
    ]

    Mix.Generator.create_directory(app_dir)
    Mix.Generator.create_directory(Path.join(app_dir, "lib/#{app_name}"))
    Mix.Generator.create_directory(Path.join(app_dir, "test"))
    Mix.Generator.create_directory(Path.join(app_dir, ".claude/quality-dna"))

    generate_from_template("mix.exs.eex", Path.join(app_dir, "mix.exs"), bindings)
    generate_from_template("lib/app.ex.eex", Path.join(app_dir, "lib/#{app_name}.ex"), bindings)
    generate_from_template("lib/application.ex.eex", Path.join(app_dir, "lib/#{app_name}/application.ex"), bindings)
    generate_from_template("test/test_helper.exs.eex", Path.join(app_dir, "test/test_helper.exs"), bindings)
    generate_from_template("test/app_test.exs.eex", Path.join(app_dir, "test/#{app_name}_test.exs"), bindings)
    generate_from_template("CLAUDE.md.eex", Path.join(app_dir, "CLAUDE.md"), bindings)
    generate_from_template("quality-dna.json.eex", Path.join(app_dir, ".claude/quality-dna/current-state.json"), bindings)

    Mix.shell().info("""
    Application #{app_name} generated successfully.

    Next steps:
      1. Add #{app_name} to umbrella deps in apps/prismatic/mix.exs
      2. Run: mix deps.get
      3. Verify: mix compile --warnings-as-errors
      4. Add tests: mix test apps/#{app_name}
    """)
  end

  defp generate_from_template(template, target, bindings) do
    template_path = Path.join(@template_dir, template)
    content = EEx.eval_file(template_path, bindings)
    Mix.Generator.create_file(target, content)
  end
end
```

### Schema-Driven Code Generation

The Prismatic API module demonstrates schema-driven generation where OpenAPI specifications are introspected at boot time and used to generate API endpoints:

```elixir
defmodule Prismatic.CodeGen.APIScanner do
  @moduledoc """
  Scans Prismatic facade modules at boot time and generates
  API endpoint metadata from function signatures and typespecs.
  This is runtime code generation -- the scanner produces
  data structures that drive the generic dispatch controller.
  """

  @type endpoint :: %{
    app: String.t(),
    action: String.t(),
    module: atom(),
    function: atom(),
    arity: non_neg_integer(),
    params: [param()],
    return_type: String.t(),
    doc: String.t() | nil
  }

  @type param :: %{
    name: String.t(),
    type: String.t(),
    required: boolean()
  }

  @spec scan_all_facades() :: [endpoint()]
  def scan_all_facades do
    :code.all_loaded()
    |> Enum.map(&elem(&1, 0))
    |> Enum.filter(&facade_module?/1)
    |> Enum.flat_map(&scan_module/1)
  end

  defp facade_module?(module) do
    module_name = Atom.to_string(module)
    String.starts_with?(module_name, "Elixir.Prismatic") and
      not String.contains?(module_name, ".Impl.") and
      not String.contains?(module_name, ".Internal.")
  end

  defp scan_module(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _anno, _lang, _format, _module_doc, _meta, function_docs} ->
        function_docs
        |> Enum.filter(fn {{kind, _name, _arity}, _anno, _sig, _doc, _meta} ->
          kind == :function
        end)
        |> Enum.map(fn {{_kind, name, arity}, _anno, _sig, doc, _meta} ->
          %{
            app: extract_app_name(module),
            action: Atom.to_string(name),
            module: module,
            function: name,
            arity: arity,
            params: extract_params(module, name, arity),
            return_type: extract_return_type(module, name, arity),
            doc: extract_doc_string(doc)
          }
        end)

      _ -> []
    end
  end

  defp extract_app_name(module) do
    module
    |> Module.split()
    |> Enum.at(1, "unknown")
    |> Macro.underscore()
  end

  defp extract_params(module, name, arity) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} ->
        specs
        |> Enum.find(fn {{n, a}, _} -> n == name and a == arity end)
        |> case do
          nil -> generate_default_params(arity)
          {_, [{:type, _, :fun, [{:type, _, :product, types}, _ret]}]} ->
            types
            |> Enum.with_index()
            |> Enum.map(fn {type, idx} ->
              %{name: "arg#{idx}", type: format_type(type), required: true}
            end)
          _ -> generate_default_params(arity)
        end
      :error -> generate_default_params(arity)
    end
  end

  defp generate_default_params(arity) do
    Enum.map(0..(arity - 1), fn idx ->
      %{name: "arg#{idx}", type: "any", required: true}
    end)
  end

  defp extract_return_type(_module, _name, _arity), do: "any"
  defp extract_doc_string(%{"en" => doc}), do: doc
  defp extract_doc_string(_), do: nil
  defp format_type({:type, _, name, _}), do: Atom.to_string(name)
  defp format_type(_), do: "any"
end
```

### AST-Based Code Transformation

For advanced scenarios, the platform uses AST manipulation to transform code at compile time. This approach is used in the AIAD agent system to generate standardized boilerplate from declarative specifications:

```elixir
defmodule Prismatic.CodeGen.ASTTransformer do
  @moduledoc """
  Transforms Elixir AST nodes to inject platform-standard
  boilerplate: telemetry instrumentation, error handling
  wrappers, and logging infrastructure.
  """

  @type transform_opts :: [
    instrument: boolean(),
    wrap_errors: boolean(),
    add_logging: boolean()
  ]

  @spec transform(Macro.t(), transform_opts()) :: Macro.t()
  def transform(ast, opts \\ []) do
    ast
    |> maybe_instrument(Keyword.get(opts, :instrument, true))
    |> maybe_wrap_errors(Keyword.get(opts, :wrap_errors, true))
    |> maybe_add_logging(Keyword.get(opts, :add_logging, false))
  end

  defp maybe_instrument(ast, true) do
    Macro.prewalk(ast, fn
      {:def, meta, [{name, fn_meta, args} = _head | body]} ->
        instrumented_body = quote do
          start_time = System.monotonic_time(:microsecond)
          result = (fn -> unquote_splicing(body) end).()
          elapsed = System.monotonic_time(:microsecond) - start_time
          :telemetry.execute(
            [:prismatic, :function, :call],
            %{duration: elapsed},
            %{function: unquote(name), module: __MODULE__}
          )
          result
        end
        {:def, meta, [{name, fn_meta, args}, [do: instrumented_body]]}

      other -> other
    end)
  end

  defp maybe_instrument(ast, false), do: ast

  defp maybe_wrap_errors(ast, true) do
    Macro.prewalk(ast, fn
      {:def, meta, [{name, fn_meta, args} | body]} ->
        wrapped_body = quote do
          try do
            unquote_splicing(body)
          rescue
            error ->
              {:error, %{
                function: unquote(name),
                module: __MODULE__,
                error: Exception.message(error),
                stacktrace: __STACKTRACE__
              }}
          end
        end
        {:def, meta, [{name, fn_meta, args}, [do: wrapped_body]]}

      other -> other
    end)
  end

  defp maybe_wrap_errors(ast, false), do: ast

  defp maybe_add_logging(ast, _), do: ast
end
```

## Implementation in Prismatic Platform

Code generation permeates the Prismatic Platform at multiple levels:

### Compile-Time Generation (Macros)

The platform uses macros extensively for:

- **Storage adapter generation**: The trait/behaviour-based storage system uses macros to generate adapter implementations from declarative specifications
- **Protocol implementations**: Common protocol implementations (JSON encoding, telemetry events) are generated through `use` macros
- **Test helpers**: Contract test suites are generated from behaviour specifications, ensuring all adapters pass the same validation

### Boot-Time Generation (Runtime Introspection)

The Prismatic API module demonstrates runtime code generation:

- **Endpoint discovery**: At boot time, the scanner introspects all loaded modules and generates API endpoint metadata
- **OpenAPI specification**: The OpenAPI 3.0 specification is generated from function typespecs and documentation
- **Swagger UI**: The interactive API documentation is generated from the introspected endpoint registry

### Development-Time Generation (Mix Tasks)

Custom Mix tasks generate application scaffolds, quality infrastructure, and documentation:

- `mix prismatic.gen.app` -- generates a new umbrella application with full quality infrastructure
- `mix promo.enhance` -- generates enhanced documentation content for the promo site
- `mix quality.standardize_mix` -- generates standardized mix.exs configurations across all apps

### AI-Assisted Generation

The platform's integration with Claude Code and local Ollama models enables AI-assisted code generation within the AIAD framework. AI-generated code passes through the same quality gates as manually written code -- no exceptions.

## Comparison with Alternatives

| Approach | Type Safety | Debugging | Performance | Complexity |
|----------|------------|-----------|-------------|------------|
| **Elixir Macros** | Compile-time verified | AST debugging via `Macro.to_string/1` | Zero runtime overhead | High -- requires AST knowledge |
| **Mix Generators** | Generated code must compile | Standard debugging | N/A (development-time) | Low -- template interpolation |
| **Runtime Code Gen** | Runtime errors possible | Standard debugging | Minor overhead | Medium |
| **Reflection/Introspection** | Type-safe if specs exist | Standard debugging | Boot-time cost | Medium |
| **External Code Gen** | Depends on generator | Standard debugging | Zero runtime overhead | Variable |
| **AI-Assisted** | Must pass quality gates | Standard debugging | N/A (development-time) | Low (usage), high (validation) |

The Prismatic Platform uses a mix of these approaches, choosing the right tool for each context. Macros handle repetitive compile-time patterns, Mix tasks handle scaffolding, and runtime introspection handles the API discovery system.

## Best Practices

### Macro Hygiene

1. **Keep macros small**: Macros should generate the minimum necessary code. Extract complex logic into regular functions that the generated code calls.

2. **Use `quote` and `unquote` correctly**: Understand the difference between compile-time and runtime values. Variables in `quote` blocks are hygienic by default -- use `var!()` only when intentional variable injection is needed.

3. **Provide clear error messages**: When macro inputs are invalid, produce compile-time errors with helpful messages rather than generating invalid code that fails cryptically at runtime.

4. **Document generated code**: Use `@moduledoc` and `@doc` within `quote` blocks so that generated modules have documentation visible in ExDoc and IEx.

### Generator Design

1. **Make generators idempotent**: Running a generator twice should produce the same result. Generated files should be deterministic based on their inputs.

2. **Separate generated and hand-written code**: Use conventions (filename prefixes, directory structure) to distinguish generated code from hand-written code. Never mix generated and manual code in the same file.

3. **Validate generated output**: Generated code should pass the same [quality gates](/glossary/quality-gates/) as manually written code. Run compilation, [Credo](/glossary/credo/), and [Dialyzer](/glossary/dialyzer/) checks on generated output.

4. **Version your generators**: When a generator changes, all previously generated code should be regenerated. Track generator versions in the generated file headers.

## Common Pitfalls

### Macro Overuse

The most common pitfall in Elixir code generation is using macros where regular functions would suffice. Macros should be reserved for situations where compile-time code transformation is genuinely necessary. If a function can accomplish the same goal, prefer the function -- it is simpler to write, debug, and understand.

### Debugging Complexity

Generated code can be difficult to debug because the source code the developer wrote is not the same code that executes. Elixir mitigates this with `Macro.to_string/1` and `Macro.expand/2`, but developers must understand these tools to debug macro-generated code effectively.

### Compilation Order Dependencies

Macros that reference other modules create compile-time dependencies. In a large umbrella, these dependencies can cause compilation order issues. Use `require` explicitly and be aware of circular dependency risks in macro modules.

### Template Drift

Template-based generators can drift from platform standards if the templates are not updated alongside the standards. Include template validation in the CI pipeline to detect drift early.

### Over-Generation

Generating too much code can create a different maintenance burden -- when the generator changes, hundreds of files need regeneration. Find the right balance between generation and abstraction.

## Use Cases

### Storage Adapter Proliferation

The Prismatic Platform supports multiple storage backends (ETS, Ecto/PostgreSQL, Meilisearch, KuzuDB, Redis). Each backend requires adapter implementations that conform to the same behaviour contract. Code generation ensures that all adapters implement the complete contract consistently, and new adapters can be scaffolded in minutes rather than hours.

### API Endpoint Discovery

The Prismatic API module uses [introspection](/glossary/introspection/) and runtime code generation to automatically expose all public facade functions as REST endpoints. This eliminates the manual step of writing controller actions for each function, ensuring that the API always reflects the current state of the codebase.

### Quality Infrastructure Standardization

With 141 umbrella applications, maintaining consistent quality infrastructure (mix.exs configuration, quality DNA, CLAUDE.md documentation) requires automation. Mix generators produce standardized infrastructure files, and validation tasks verify compliance across all apps.

### Test Scaffold Generation

Contract tests for storage adapters are generated from the behaviour specification. When a new function is added to the adapter behaviour, the test generator produces test cases for all existing adapters, ensuring immediate coverage of the new functionality.

## Related Concepts

Code generation connects deeply to the Elixir ecosystem and platform architecture:

- [Macro](/glossary/macro/) -- Elixir's compile-time metaprogramming facility, the primary mechanism for AST-based code generation in the platform
- [AST](/glossary/ast/) -- Abstract Syntax Tree, the intermediate representation that macros manipulate during code generation
- [Compilation](/glossary/compilation/) -- The build phase during which macro-based code generation executes and generated code is verified
- [Mix Task](/glossary/mix-task/) -- The task system used to implement development-time code generators and scaffolding tools
- [Code Quality](/glossary/code-quality/) -- Generated code must meet the same quality standards as hand-written code, enforced through quality gates
- [Typespec](/glossary/typespec/) -- Type specifications that serve as inputs for API code generation and documentation generation
- [Protocol](/glossary/protocol/) -- Elixir protocols whose implementations can be generated from declarative specifications
- [Behaviour](/glossary/behaviour/) -- Behaviour contracts that define the interface that generated adapter code must implement
- [Static Analysis](/glossary/static-analysis/) -- Tools like Credo and Dialyzer that validate generated code at compile time
- [Code Example](/glossary/code-example/) -- Code examples that demonstrate generated code usage, themselves subject to doctest verification

## See Also

- [Introspection](/glossary/introspection/) -- Runtime module inspection used for API endpoint discovery
- [OpenAPI](/glossary/openapi/) -- The specification format generated from function typespecs by the API scanner
- [Elixir](/glossary/elixir/) -- The language whose macro system enables compile-time code generation
- [Refactoring](/glossary/refactoring/) -- Code generation and refactoring are complementary practices for maintaining code quality
- [Mix](/glossary/mix/) -- The build tool that provides the generator task infrastructure

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
