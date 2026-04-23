+++
title = "Elixir Macro"
weight = 42
[extra]
description = "A compile-time code transformation mechanism in Elixir that enables DSL creation, automatic code generation, and metaprogramming through AST manipulation"
category = "elixir"
abbreviation = "N/A"
related_terms = ["elixir", "behaviour-pattern", "metaprogramming", "dsl", "compile-time", "ast", "quote-unquote"]
complexity_level = "advanced"
use_cases = ["dsl_creation", "code_generation", "compile_time_optimization", "interface_abstraction", "behavior_injection"]
beam_feature = false
language_feature = true
compile_time = true
runtime_effect = false
metaprogramming = true
ast_manipulation = true
quote_unquote = true
hygiene = "partial"
platform_integration = "extensive"
umbrella_apps = ["prismatic_osint_core", "prismatic_academy", "prismatic_agents", "prismatic_claude"]
macro_types = ["function_macro", "attribute_macro", "using_macro", "compile_time_hook"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1750
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Elixir macro", "metaprogramming", "AST", "quote", "unquote", "DSL", "compile-time", "code generation", "Prismatic Platform"]
tags = ["glossary", "elixir", "macro", "metaprogramming", "prismatic"]
quality_score = 85
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Elixir Macro - Prismatic Platform"
+++

## Definition & Overview

An **Elixir Macro** is a compile-time code transformation mechanism that allows developers to write code that writes code. Macros receive the Abstract Syntax Tree (AST) representation of their arguments as input and return a new AST that gets compiled in place of the original macro call. This enables Domain-Specific Languages (DSLs), automatic code generation, interface abstraction, and compile-time optimizations that would be impossible with regular functions.

Unlike functions which operate on values at runtime, macros operate on code structure at compile time. When the Elixir compiler encounters a macro call, it executes the macro immediately and replaces the call site with the generated AST. This means macros can inspect the structure of their arguments (variable names, operators, nested expressions) and generate entirely different code based on that structure.

In the [Prismatic Platform](@/glossary/aiad.md), macros are extensively used for creating self-registering systems where modules automatically register themselves with central registries at compile time. The OSINT tool registration system, AIAD agent discovery, and Academy topic registration all use `@after_compile` hooks combined with macros to extract configuration from compiled bytecode and populate ETS registries during application startup.

## Technical Deep Dive

### AST Representation

Elixir represents all code as a three-element tuple AST where every expression is either an atom (literal), a three-element tuple `{function, metadata, arguments}`, or a two-element tuple `{value, metadata}` for literals with metadata:

```elixir
# Code: 1 + 2
# AST:  {:+, [context: Elixir, import: Kernel], [1, 2]}

# Code: foo(bar, baz)
# AST:  {:foo, [], [{:bar, [], []}, {:baz, [], []}]}

# Code: %{key: value}
# AST:  {:%{}, [], [key: {:value, [], []}]}
```

Macros receive this AST representation and can inspect, transform, and generate new AST structures that become part of the compiled module.

### Quote and Unquote

The `quote/2` special form converts Elixir code into its AST representation, while `unquote/1` injects runtime values into quoted expressions:

```elixir
defmodule PrismaticOsintCore.Tool do
  @moduledoc """
  Macro-based tool registration system enabling OSINT adapters
  to self-register with comprehensive metadata at compile time.
  """

  defmacro register_tool(config) do
    # Access the calling module at compile time
    caller_module = __CALLER__.module

    quote do
      @after_compile {PrismaticOsintCore.ToolRegistry, :register_compiled_tool}
      @tool_config unquote(config)

      def __tool_config__, do: unquote(config)
      def __tool_module__, do: unquote(caller_module)

      # Generate helper functions based on configuration
      unquote(generate_tool_helpers(config))
    end
  end

  defp generate_tool_helpers(config) do
    # Extract configuration at compile time to generate appropriate helpers
    case config[:api_style] do
      :source ->
        quote do
          def search(query, opts \\ []), do: source_search(query, opts)
          def get_details(source_id, opts \\ []), do: source_get_details(source_id, opts)
        end

      :provider ->
        quote do
          def run(subject, state), do: provider_run(subject, state)
          def init(opts), do: provider_init(opts)
        end
    end
  end
end
```

### Compile-Time Hooks

Macros can register compile-time hooks that execute after the module is compiled:

```elixir
defmodule PrismaticAcademy.Topic do
  @moduledoc """
  Self-registering topic system using @after_compile hooks to extract
  topic metadata from compiled modules and populate the topic registry.
  """

  defmacro register_topic(config) do
    quote do
      @after_compile {PrismaticAcademy.TopicRegistry, :register_topic}
      @topic_config unquote(config)

      def __topic_config__, do: @topic_config
      def topic_slug, do: unquote(config[:slug])
      def topic_category, do: unquote(config[:category])
      def difficulty_level, do: unquote(config[:difficulty])
    end
  end
end

defmodule PrismaticAcademy.TopicRegistry do
  def register_topic(env, _bytecode) do
    module = env.module

    # Extract topic configuration from compiled module
    if function_exported?(module, :__topic_config__, 0) do
      config = module.__topic_config__()
      :ets.insert(:topic_registry, {config[:slug], module, config})
    end
  end
end
```

### Macro Hygiene

Elixir macros are partially hygienic, meaning variables defined in macros don't accidentally clash with variables in the calling code:

```elixir
defmacro debug(expression) do
  quote do
    # These variables are hygienic - won't clash with caller's variables
    result = unquote(expression)
    metadata = %{
      module: __MODULE__,
      function: __FUNCTION__,
      line: __LINE__
    }

    IO.puts("Debug: #{inspect(result)} at #{inspect(metadata)}")
    result
  end
end

# Usage - the 'result' and 'metadata' variables inside the macro
# don't interfere with any 'result' or 'metadata' in this scope
def test_function do
  result = "original value"
  debug(1 + 2)  # Won't overwrite the 'result' variable above
  result        # Still "original value"
end
```

To break hygiene when needed (rare), use `var!/2`:

```elixir
defmacro set_magic_variable(value) do
  quote do
    # This WILL create a variable in the caller's scope
    var!(magic_value) = unquote(value)
  end
end
```

## Implementation Patterns in Prismatic Platform

### Self-Registering Systems

The most powerful pattern in the platform is self-registering modules that automatically register with centralized registries:

```elixir
defmodule MyOSINTAdapter do
  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "my-adapter",
    name: "My OSINT Tool",
    category: :global,
    api_style: :provider,
    input_fields: [
      %{name: :query, type: :text, label: "Search Query", required: true}
    ],
    requires_auth: true,
    rate_limit: %{requests_per_second: 1, burst: 5}
  })

  # The register_tool macro automatically:
  # - Stores configuration in module attributes
  # - Generates helper functions based on api_style
  # - Registers @after_compile hook for ETS insertion
  # - Creates UI metadata for LiveView form generation

  def provider_run(query, state) do
    # Implementation...
    {:ok, findings}
  end
end
```

### DSL Creation

Macros enable clean DSLs for complex configuration:

```elixir
defmodule PrismaticPerimeter.ComplianceRules do
  defmacro compliance_framework(name, do: block) do
    quote do
      @framework_name unquote(name)
      @rules []

      unquote(block)

      def framework_name, do: @framework_name
      def all_rules, do: Enum.reverse(@rules)
    end
  end

  defmacro rule(description, opts \\ [], do: check_block) do
    quote do
      rule_id = :erlang.unique_integer([:positive])

      @rules [%{
        id: rule_id,
        description: unquote(description),
        severity: unquote(opts[:severity] || :medium),
        check: fn -> unquote(check_block) end
      } | @rules]
    end
  end
end

# Usage creates a clean DSL:
defmodule NIS2Compliance do
  import PrismaticPerimeter.ComplianceRules

  compliance_framework "NIS2 Directive" do
    rule "Multi-factor authentication must be enabled", severity: :critical do
      PrismaticPerimeter.check_mfa_enabled()
    end

    rule "Incident response plan must exist" do
      File.exists?("incident_response_plan.pdf")
    end
  end
end
```

### Interface Abstraction

Macros can generate repetitive interface code:

```elixir
defmodule PrismaticStorage.Adapter do
  defmacro __using__(_opts) do
    quote do
      @behaviour PrismaticStorageCore.Adapter

      # Generate default implementations for optional callbacks
      def health_check, do: {:ok, %{status: :healthy}}
      def stats, do: {:ok, %{}}

      defoverridable [health_check: 0, stats: 0]

      # Generate telemetry helpers for each callback
      unquote(generate_telemetry_wrappers())
    end
  end

  defp generate_telemetry_wrappers do
    callbacks = [:get, :put, :delete, :query]

    for callback <- callbacks do
      quote do
        defp unquote(:"telemetry_#{callback}")(args, fun) do
          :telemetry.span(
            [:prismatic, :storage, unquote(callback)],
            %{adapter: __MODULE__},
            fn -> {fun.(), %{}} end
          )
        end
      end
    end
  end
end
```

### Compile-Time Optimization

Macros can perform expensive computations at compile time:

```elixir
defmodule PrismaticCore.Utils.UUID do
  @moduledoc """
  Deterministic UUID generation with compile-time optimization
  for known string inputs.
  """

  defmacro from_string(string) when is_binary(string) do
    # Compute UUID at compile time for string literals
    uuid = compute_uuid_from_string(string)
    quote do: unquote(uuid)
  end

  defmacro from_string(string) do
    # Runtime computation for dynamic strings
    quote do: compute_uuid_from_string(unquote(string))
  end

  defp compute_uuid_from_string(string) do
    :crypto.hash(:sha256, string)
    |> Base.encode16(case: :lower)
    |> String.slice(0, 36)
    # Format as proper UUID...
  end
end
```

## Advanced Macro Techniques

### Context Inspection

Macros can inspect their call context to make intelligent decisions:

```elixir
defmodule PrismaticCore.Debug do
  defmacro debug_context do
    caller = __CALLER__

    quote do
      %{
        module: unquote(caller.module),
        function: unquote(caller.function),
        file: unquote(caller.file),
        line: unquote(caller.line),
        context: unquote(caller.context),
        aliases: unquote(Macro.escape(caller.aliases)),
        imports: unquote(Macro.escape(caller.imports))
      }
    end
  end
end
```

### Code Generation from External Data

Macros can read external files and generate code:

```elixir
defmodule PrismaticOsint.SourceRegistry do
  @external_resource "priv/osint_sources.json"

  @sources "priv/osint_sources.json"
           |> File.read!()
           |> Jason.decode!()

  for source <- @sources do
    def source_info(unquote(source["slug"])) do
      unquote(Macro.escape(source))
    end
  end

  def source_info(_), do: nil

  def all_sources, do: unquote(Macro.escape(@sources))
end
```

## Best Practices and Pitfalls

### Best Practices

**Use macros sparingly.** Functions are easier to understand, debug, and test. Only use macros when you need compile-time code generation or inspection that's impossible with functions.

**Keep macro logic simple.** Complex macro logic is hard to debug because errors show up at the call site, not in the macro definition. Move complex logic to helper functions that the macro calls.

**Always use `quote do ... end`.** This provides better error messages and syntax highlighting than `quote(do: ...)`.

**Test the generated code, not just the macro.** Write tests that verify the AST generated by your macros produces the expected behavior.

**Document the generated interface.** Users of your macro need to understand what functions/attributes/behaviors the macro creates in their module.

### Common Pitfalls

**Variable capture.** Variables in the calling context can accidentally be captured by the macro if you're not careful with hygiene.

**Multiple evaluation.** If you `unquote` a variable multiple times, the expression gets evaluated multiple times:

```elixir
# BAD - expensive_computation() runs twice
defmacro bad_macro(arg) do
  quote do
    result1 = unquote(arg)
    result2 = unquote(arg)  # Evaluates arg again!
    {result1, result2}
  end
end

# GOOD - evaluate once, use twice
defmacro good_macro(arg) do
  quote do
    value = unquote(arg)
    {value, value}
  end
end
```

**Debugging difficulties.** Macro-generated code can be hard to debug because stack traces point to the macro call site, not the generated code. Use `Macro.expand/2` in IEx to see generated AST.

**Compile-time dependencies.** Files or resources read during macro expansion become compile-time dependencies. Use `@external_resource` to tell the compiler to recompile when they change.

## Usage in Prismatic Platform

The platform uses macros primarily for three patterns:

| Pattern | Implementation | Purpose |
|---------|---------------|---------|
| **Self-Registration** | `register_tool/1`, `register_topic/1`, `register_agent/1` | Automatic discovery and registry population |
| **DSL Creation** | Quality rules, compliance frameworks, workflow definitions | Domain-specific configuration languages |
| **Interface Generation** | Storage adapters, protocol implementations | Reduce boilerplate while maintaining type safety |

All macros in the platform follow strict conventions: they use `@after_compile` hooks for registration, generate helper functions based on configuration, and emit telemetry events for observability.

## Testing Macros

```elixir
defmodule PrismaticOsintCore.ToolTest do
  use ExUnit.Case, async: true

  test "register_tool/1 generates correct module attributes" do
    defmodule TestTool do
      use PrismaticOsintCore.Tool

      register_tool(%{
        slug: "test-tool",
        name: "Test Tool",
        category: :test
      })
    end

    assert TestTool.__tool_config__()[:slug] == "test-tool"
    assert TestTool.__tool_config__()[:name] == "Test Tool"
    assert TestTool.__tool_config__()[:category] == :test
  end

  test "register_tool/1 generates appropriate helper functions" do
    defmodule SourceTool do
      use PrismaticOsintCore.Tool

      register_tool(%{
        slug: "source-tool",
        api_style: :source
      })

      def source_search(_query, _opts), do: {:ok, []}
      def source_get_details(_id, _opts), do: {:ok, %{}}
    end

    # Macro should have generated these functions:
    assert function_exported?(SourceTool, :search, 2)
    assert function_exported?(SourceTool, :get_details, 2)
  end
end
```

## Related Concepts

- [Elixir](@/glossary/elixir.md) - Programming language providing the macro system
- [Behaviour Pattern](@/glossary/behaviour-pattern.md) - Often combined with macros for interface generation
- [AST](@/glossary/ast.md) - Abstract syntax tree that macros manipulate

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture using macro patterns
- [Apps](@/apps/_index.md) - Applications using self-registering macro systems
- [OSINT Core](@/apps/prismatic-osint-core.md) - Extensive macro-based tool registration
- [Academy](@/academy/_index.md) - Topic registration via macros
- [AIAD](@/glossary/aiad.md) - Agent standard using macro-based discovery

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)