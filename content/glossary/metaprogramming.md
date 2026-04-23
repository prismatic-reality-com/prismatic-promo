+++
title = "Metaprogramming"
weight = 50

[extra]
description = "Metaprogramming is the technique of writing code that generates, transforms, or manipulates other code at compile time, enabling powerful abstractions like self-registering modules, DSLs, and boilerplate elimination through Elixir's macro system and AST manipulation."
category = "architecture"
domain = "language-engineering"
complexity = "advanced"
stability = "stable"
beam_related = true
related_terms = ["module", "ast", "behaviour", "compilation", "process", "macro", "quote-unquote", "dsl", "ets", "registry", "protocol", "use-macro"]
tags = ["glossary", "metaprogramming", "macros", "ast", "elixir", "compile-time", "code-generation", "dsl", "self-registering", "boilerplate-elimination"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Metaprogramming is the foundation of Prismatic Platform's self-registering architecture, enabling OSINT tools, Academy topics, and DD sources to auto-discover and register themselves through compile-time macro expansion and @after_compile callbacks."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["metaprogramming", "macros", "AST manipulation", "code generation", "compile-time", "Elixir macros", "self-registering", "DSL", "quote", "unquote", "before_compile", "after_compile", "module attributes"]
image = "/images/sections/glossary.png"
image_alt = "Metaprogramming - Prismatic Platform"
word_count = 3500
see_also = ["capabilities", "architecture", "agents", "compilation", "ets"]
+++

## Definition

Metaprogramming is the practice of writing programs that treat other programs (or themselves) as data -- generating, analyzing, or transforming code programmatically. In Elixir, metaprogramming operates on the Abstract Syntax Tree (AST) through the macro system: macros receive AST fragments as input and return modified AST fragments that the compiler inserts at the call site. This compile-time code generation enables powerful patterns: domain-specific languages (DSLs), boilerplate elimination, protocol implementation, and most importantly for the Prismatic Platform, self-registering module architectures.

Elixir's approach to metaprogramming is deliberately constrained compared to languages with unrestricted code generation (Lisp, Ruby). Macros are hygienic by default (they do not inadvertently capture variables from the caller's scope), they operate only at compile time (not runtime), and the community convention is to use them sparingly and only for reducing genuine boilerplate. The motto "macros are for boilerplate, not for cleverness" reflects this philosophy.

The Prismatic Platform leverages metaprogramming as an architectural primitive. Three core subsystems -- OSINT ToolRegistry, Academy TopicRegistry, and DD SourceRegistry -- use identical metaprogramming patterns to achieve zero-configuration module discovery. When a developer creates a new OSINT adapter, Academy topic, or DD source, it automatically registers itself at compile time without touching any central configuration file. This pattern scales to 157+ OSINT adapters, 4 Academy topics, and multiple DD sources with zero maintenance overhead.

## Core Concepts

| Concept | Description | Prismatic Usage |
|---------|-------------|-----------------|
| **AST (Abstract Syntax Tree)** | Nested three-element tuples representing code structure: `{function, metadata, args}` | Foundation of all macro operations in the platform |
| **`quote/2`** | Converts Elixir code to its AST representation | Used in macro bodies to construct code templates |
| **`unquote/1`** | Injects runtime values into a quoted AST expression | Parameterizes generated code with compile-time values |
| **Macro hygiene** | Variables in macros do not leak into or capture from the caller's scope | Prevents subtle bugs in generated code across 157+ adapters |
| **`use` pattern** | `use MyModule` triggers `__using__/1`, injecting AST into the caller | Entry point for self-registering modules |
| **`@before_compile`** | Callback executed before module compilation completes | Injects final functions (e.g., `__tool_config__/0`) |
| **`@after_compile`** | Callback executed after module compilation with access to bytecode | Triggers ETS registration of compiled module metadata |
| **Module attributes** | Compile-time metadata (`@attr value`) readable by macros | Store tool/topic/source configuration for extraction |
| **Accumulating attributes** | Attributes that collect multiple values via `Module.register_attribute/3` | Collect multi-field configurations within a single module |
| **`Macro.escape/1`** | Converts complex Elixir terms into their AST representation | Embeds configuration maps in generated function bodies |
| **`defmacro`** | Defines a macro that receives and returns AST | Implements `register_tool/1`, `register_topic/1`, `register_source/1` |
| **Protocol derivation** | `@derive` triggers compile-time protocol implementation | Jason.Encoder derivation for API-exposed schemas |

## Technical Deep Dive

### Elixir AST Representation

Elixir's AST is represented as nested three-element tuples: `{function_name, metadata, arguments}`. For example, `1 + 2` compiles to `{:+, [line: 1], [1, 2]}`. Literals (atoms, integers, strings, lists, two-element tuples) represent themselves in the AST. Everything else -- function calls, operators, special forms -- becomes a three-element tuple.

The `quote/2` macro converts Elixir code to its AST representation, and `unquote/1` injects values into a quoted expression. This quote/unquote mechanism is the foundation of all macro operations. Understanding that macros operate on AST tuples, not on source code strings, is the key insight that separates Elixir metaprogramming from text-based code generation.

### The `use` Pattern and Module Injection

The `use` macro pattern -- `use MyModule` -- triggers `MyModule.__using__/1`, which returns AST that is injected into the calling module. This is the primary extension point for module-level metaprogramming. Combined with `@before_compile` and `@after_compile` callbacks, `use` enables sophisticated patterns where module compilation triggers registration side effects.

When a module includes `use PrismaticOsintCore.Tool`, the following sequence occurs:

1. `__using__/1` injects `@before_compile`, `Module.register_attribute/3`, and `import` into the caller
2. The caller invokes `register_tool(%{...})`, which stores the config as a module attribute
3. `__before_compile__/1` reads the attribute and generates a `__tool_config__/0` function plus an `@after_compile` callback
4. After compilation, `__after_compile__/2` calls the generated function and registers the config in the ETS table

This four-step sequence transforms a simple `use` + `register_tool` call into full ETS registration without any manual wiring.

### `@after_compile` and Runtime Registration

The `@after_compile` callback is particularly powerful: it executes after a module finishes compiling, with access to the module's compiled bytecode. This enables runtime registration of compile-time information -- extracting module attributes, function signatures, and configuration data from compiled modules and storing them in persistent storage (ETS tables) for runtime access.

This bridge between compile-time and runtime is the exact mechanism that powers Prismatic Platform's self-registering systems. The compile-time data (tool configuration, topic metadata, source definitions) is extracted from the compiled module and inserted into an ETS table that persists for the lifetime of the BEAM VM. At application startup, the ETS table is populated by compiling all modules; at runtime, lookups against the ETS table provide sub-microsecond access to all registered metadata.

### Module Attributes as Configuration Storage

Module attributes (`@attr value`) store compile-time metadata that macros can read and transform. Accumulating attributes (`Module.register_attribute(__MODULE__, :attr, accumulate: true)`) enable collecting configuration across multiple macro invocations within a single module.

In the Prismatic Platform, module attributes serve as the transport mechanism between the `register_tool/1` macro call and the `@before_compile` callback. The macro stores configuration in `@tool_config`, and the `@before_compile` callback reads it back to generate the `__tool_config__/0` function. This two-phase approach cleanly separates configuration declaration from code generation.

### Macro Debugging and Introspection

Debugging macros requires understanding the generated code. `Macro.to_string/1` converts an AST back to readable Elixir code. `Macro.expand/2` fully expands a macro call in a given environment. `IO.inspect(ast, label: "generated")` inside a `quote` block prints the AST during compilation.

For Prismatic Platform's macros, the primary debugging technique is to inspect the generated `__tool_config__/0` function: calling `ModuleName.__tool_config__()` in IEx returns the exact configuration map that was registered, confirming that the macro expansion preserved all values correctly.

### Code Generation Governance

Prismatic Platform's code generation governance policy (`.aiad/policies/code-generation-governance.policy.md`) defines a 7-tier safety hierarchy for metaprogramming:

- **T1 (Macros)**: Standard `defmacro` -- permitted for boilerplate elimination
- **T2 (Module.create/3)**: Dynamic module creation -- permitted for registries
- **T3 (Code.compile_string/1)**: String-to-code compilation -- restricted, requires justification
- **T4-T7**: Increasingly restricted forms through to T7 (banned: `Code.eval_string` with user input)

The SEADF and MENDEL systems have formal exemptions for higher-tier code generation within their evolution contexts.

## Usage in Prismatic Platform

### OSINT ToolRegistry (157+ Adapters)

`use PrismaticOsintCore.Tool` injects the `register_tool/1` macro. When an OSINT adapter calls `register_tool(%{slug: "ares", ...})`, the macro stores the configuration as a module attribute. The `@after_compile` hook extracts this configuration and inserts it into the ToolRegistry ETS table. This enables 157 OSINT tools to self-register without any central configuration file.

Each adapter declares its capabilities (category, API style, input fields, authentication requirements) through the registration map. The ToolRegistry provides filtered lookups (by category, by auth requirement, by input type) using ETS match specifications compiled from these declared capabilities.

### Academy TopicRegistry (4 Topics)

`use PrismaticAcademy.Topic` provides `register_topic/1` with the identical pattern. Four topic modules self-register with category, difficulty, duration, and framework metadata. The TopicRegistry ETS table enables the Academy dashboard to discover and display all available topics without hardcoded lists.

### DD SourceRegistry (Multiple Sources)

`use PrismaticDd.Source` provides `register_source/1` for DD pipeline sources (ForbesCz, Parliament, Senate, LocalGov). Each source declares its fetch strategy, rate limits, and entity type mappings. The DD pipeline controller queries the SourceRegistry to determine which sources are available for a given entity type.

### Doctrine Enforcement Macros

The platform's doctrine enforcement system uses metaprogramming to inject compliance checks at compile time. The `Prismatic.Doctrine` module provides macros that verify ZERO, SEAL, and PERF compliance patterns are present in modules that `use` it. This shifts doctrine enforcement from runtime detection to compile-time prevention.

### Agent DSL

The AIAD agent system uses a macro-based DSL for agent definition. `use Prismatic.Agent` provides `agent/2`, `capability/2`, and `command/2` macros that generate the agent's metadata, capability registry entries, and command handlers from declarative specifications.

## Code Examples

```elixir
defmodule PrismaticOsintCore.Tool do
  @moduledoc """
  Metaprogramming foundation for self-registering OSINT tools.

  Provides the `use PrismaticOsintCore.Tool` pattern that enables
  OSINT adapter modules to self-register their metadata into the
  ToolRegistry ETS table at compile time. This eliminates the need
  for central configuration files and enables automatic discovery
  of all OSINT tools.

  ## Architecture

  The self-registration flow operates in four phases:

  1. `__using__/1` injects imports, attribute registration, and
     `@before_compile` callback into the caller module
  2. `register_tool/1` macro stores configuration as a module attribute
  3. `__before_compile__/1` generates `__tool_config__/0` function and
     `@after_compile` callback
  4. `__after_compile__/2` extracts config and inserts into ETS

  ## Example

      defmodule MyAdapter do
        use PrismaticOsintCore.Tool

        register_tool(%{
          slug: "my-tool",
          name: "My Tool",
          category: :global,
          api_style: :source,
          input_fields: [%{name: :query, type: :text, label: "Query", required: true}],
          requires_auth: false
        })

        @impl PrismaticOsintCore.ToolBehaviour
        def search(input, _params), do: {:ok, []}
      end

  """

  @doc """
  Injects self-registration infrastructure into the calling module.

  Sets up the `@before_compile` callback, registers the `:tool_config`
  accumulating attribute, and imports the `register_tool/1` macro.
  """
  defmacro __using__(_opts) do
    quote do
      @before_compile PrismaticOsintCore.Tool
      Module.register_attribute(__MODULE__, :tool_config, accumulate: false)
      import PrismaticOsintCore.Tool, only: [register_tool: 1]
    end
  end

  @doc """
  Declares tool configuration for self-registration.

  Stores the provided configuration map as the `@tool_config` module
  attribute. This attribute is read by the `@before_compile` callback
  to generate the `__tool_config__/0` function.

  ## Parameters

    * `config` - Map containing tool metadata:
      * `:slug` (required) - Unique tool identifier
      * `:name` (required) - Human-readable tool name
      * `:category` (required) - Tool category atom
      * `:api_style` (required) - `:source` or `:provider`
      * `:input_fields` (required) - List of input field specifications
      * `:requires_auth` (required) - Boolean authentication requirement

  """
  defmacro register_tool(config) do
    quote do
      @tool_config unquote(config)
    end
  end

  @doc false
  defmacro __before_compile__(env) do
    config = Module.get_attribute(env.module, :tool_config)

    if config do
      quote do
        @after_compile {PrismaticOsintCore.Tool, :__after_compile__}

        @doc false
        @spec __tool_config__() :: map()
        def __tool_config__, do: unquote(Macro.escape(config))
      end
    end
  end

  @doc """
  Post-compilation callback that registers the tool in the ETS registry.

  Called automatically after the module finishes compiling. Extracts
  the tool configuration from the generated `__tool_config__/0` function
  and inserts it into the ToolRegistry ETS table for runtime discovery.

  ## Parameters

    * `module` - The compiled module
    * `_bytecode` - The compiled bytecode (unused)

  """
  @spec __after_compile__(module(), binary()) :: :ok | {:error, term()}
  def __after_compile__(module, _bytecode) do
    if function_exported?(module, :__tool_config__, 0) do
      config = module.__tool_config__()
      PrismaticOsintCore.ToolRegistry.register(config.slug, module, config)
    end
  end
end
```

```elixir
# Usage in an OSINT adapter module
defmodule PrismaticOsintCore.Adapters.CzechAres do
  @moduledoc """
  Czech ARES Business Register OSINT adapter.

  Queries the Czech Administrative Register of Economic Subjects (ARES)
  for company information by ICO (company identification number).
  Self-registers via the `PrismaticOsintCore.Tool` metaprogramming
  pattern for automatic discovery in the OSINT toolbox.
  """

  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "czech-ares",
    name: "Czech ARES Business Register",
    category: :czech,
    api_style: :source,
    input_fields: [
      %{name: :ico, type: :text, label: "Company ICO", required: true}
    ],
    requires_auth: false
  })

  @doc """
  Searches the ARES register for a company by ICO.

  ## Parameters

    * `input` - Map with `:query` key containing the ICO string
    * `_params` - Additional parameters (unused)

  ## Returns

    * `{:ok, results}` - List of matching company records
    * `{:error, reason}` - Error with descriptive reason

  """
  @spec search(map(), map()) :: {:ok, list(map())} | {:error, term()}
  def search(%{query: ico}, _params) do
    # Implementation queries the ARES XML API
    # and transforms results into normalized entity format
    {:ok, []}
  end
end
```

```elixir
defmodule PrismaticPlatform.MacroIntrospection do
  @moduledoc """
  Utilities for inspecting and debugging macro expansions.

  Provides helper functions for development-time macro debugging
  without runtime overhead. All functions are designed for IEx
  usage and are not called in production code paths.
  """

  @doc """
  Expands a macro call and returns readable Elixir code.

  Useful for understanding what code a macro generates
  without reading the macro implementation directly.

  ## Examples

      iex> PrismaticPlatform.MacroIntrospection.expand_to_string(
      ...>   quote(do: use PrismaticOsintCore.Tool)
      ...> )
      # Returns the expanded code as a string

  """
  @spec expand_to_string(Macro.t()) :: String.t()
  def expand_to_string(ast) do
    ast
    |> Macro.expand(__ENV__)
    |> Macro.to_string()
  end

  @doc """
  Lists all registered tools in the ToolRegistry ETS table.

  Returns the count and slugs of all self-registered OSINT tools,
  demonstrating that metaprogramming-based registration is working.

  ## Examples

      iex> {count, slugs} = PrismaticPlatform.MacroIntrospection.registered_tools()
      iex> count > 0
      true

  """
  @spec registered_tools() :: {non_neg_integer(), list(String.t())}
  def registered_tools do
    tools = :ets.tab2list(:osint_tool_registry)
    {length(tools), Enum.map(tools, fn {slug, _config} -> slug end)}
  end
end
```

## Common Pitfalls

| Pitfall | Impact | Prevention |
|---------|--------|------------|
| **Overusing macros for logic** | Obscures control flow, makes debugging impossible | Use macros only for boilerplate; prefer functions for logic |
| **Non-hygienic variable capture** | Subtle bugs where macro variables shadow caller variables | Use `var!(name)` only when intentional; default hygiene prevents this |
| **Complex nested `quote` blocks** | Generated code becomes unreadable and unmaintainable | Break complex macros into helper functions that return AST fragments |
| **Missing `Macro.escape/1`** | Complex terms (maps, structs) fail to embed in quoted code | Always escape non-literal values injected via `unquote` |
| **`@after_compile` side effects in tests** | Tests trigger ETS registration that persists across test cases | Use test-specific ETS tables or clean up in `on_exit` callbacks |
| **Forgetting required macro calls** | Module compiles but lacks expected functionality (e.g., no `register_tool`) | Add compile-time validation in `@before_compile` with clear error messages |
| **Macro expansion order dependencies** | Macros that depend on other macros' expansions produce incorrect code | Design macros to be order-independent; use `@before_compile` for final assembly |
| **String-based code generation** | `Code.compile_string/1` bypasses AST safety, enables injection | Use AST-based macros exclusively; string compilation is T3+ restricted |
| **Debugging generated code** | Errors point to generated code locations, not macro source | Use `Macro.to_string/1` to inspect generated code during development |
| **Runtime performance assumptions** | Assuming macro expansion has runtime cost (it does not) | Macro expansion occurs at compile time; generated code runs at full speed |

## Best Practices

1. **Use macros only for genuine boilerplate elimination** -- if the same code pattern appears in 10+ modules, a macro is justified; for fewer, prefer functions or behaviours.
2. **Keep macro implementations simple** -- complex macros are difficult to debug because errors manifest in generated code, not source code. Break complex generation into small helper functions.
3. **Use `@before_compile` for injecting functions** and `@after_compile` for registration side effects -- this separation keeps the compile-time flow predictable.
4. **Test macros by testing the modules that use them** -- verify the generated behavior (registered tools appear in ETS, generated functions return expected values) rather than the AST structure.
5. **Provide clear error messages when required macro calls are missing** -- e.g., raise at compile time if a module uses `PrismaticOsintCore.Tool` but never calls `register_tool/1`.
6. **Never use metaprogramming to obscure control flow** -- generated code should be unsurprising to readers who understand the pattern. Document the pattern once and reference it.
7. **Follow the code generation governance policy** -- respect the 7-tier safety hierarchy; never use T4+ generation without formal justification.
8. **Use `Macro.escape/1` for all non-literal values** -- maps, structs, and complex terms must be escaped before embedding in `quote` blocks.
9. **Prefer protocols and behaviours over macros** -- when the goal is polymorphism rather than code generation, protocols and behaviours are simpler and more explicit.
10. **Document the three-registry pattern** -- all three Prismatic self-registering systems (Tool, Topic, Source) use the identical pattern; new registries should follow the same template.

## Related Terms

- [Module](@/glossary/module.md) -- Elixir modules that contain and are generated by macros
- [AST](@/glossary/ast.md) -- Abstract Syntax Tree representation that macros manipulate
- [Behaviour](@/glossary/behaviour.md) -- Elixir's interface mechanism, often combined with macros
- [Compilation](@/glossary/compilation.md) -- the phase during which macros execute and expand
- [Process](@/glossary/process.md) -- processes that host the ETS registries populated by metaprogramming
- [ETS](@/glossary/ets.md) -- Erlang Term Storage used as the runtime target of compile-time registration
- [Registry](@/glossary/registry.md) -- the runtime data structure populated by self-registering macros
- [DSL](/glossary/dsl/) -- domain-specific languages built using macro-based code generation
- [Protocol](@/glossary/protocol.md) -- Elixir's polymorphism mechanism, an alternative to macros
- [Quote/Unquote](/glossary/quote-unquote/) -- the core mechanism for AST construction and injection
- [Use Macro](/glossary/use-macro/) -- the `use` pattern that triggers `__using__/1` callbacks
- [Code Generation](@/glossary/code-generation.md) -- broader category of techniques including macros

## See Also

- [Architecture](@/architecture/_index.md) -- self-registering architecture patterns across the platform
- [Capabilities](@/capabilities/_index.md) -- extensibility through metaprogramming-based plugin systems
- [OSINT Toolbox](@/osint/_index.md) -- 157 self-registering tools powered by metaprogramming
- [Academy](@/academy/_index.md) -- topic auto-discovery via the same metaprogramming pattern
- [Code Generation Governance](/.aiad/policies/code-generation-governance.policy.md) -- 7-tier safety hierarchy

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
