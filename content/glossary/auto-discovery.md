+++
title = "Auto-Discovery"
weight = 50
[extra]
description = "The automated process of detecting, cataloging, and registering components -- modules, agents, tools, or services -- without manual configuration, using compile-time hooks and runtime introspection"
category = "platform"
related_terms = ["aiad-agent", "agent-profile", "command-registry", "configuration", "compile-time", "contract"]
tags = ["glossary", "auto-discovery", "metaprogramming", "introspection", "registration", "ets", "otp", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
difficulty = "advanced"
quality_score = 88
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Auto-discovery enables zero-configuration component registration through Elixir metaprogramming, powering the self-registering architecture of OSINT tools, Academy topics, and DD sources"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["auto-discovery", "self-registration", "metaprogramming", "compile-time hooks", "@after_compile", "ETS registry", "introspection", "module discovery", "zero-configuration"]
image = "/images/sections/glossary.png"
image_alt = "Auto-Discovery - Prismatic Platform"
word_count = 1080
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

Auto-discovery is the automated process of detecting, cataloging, and registering system components without requiring explicit manual configuration. Instead of maintaining a central manifest of all modules, agents, or tools, auto-discovery systems use compile-time hooks, runtime introspection, or file system scanning to find and register components as they are added to the codebase. This eliminates a class of errors where components exist but are not registered, and dramatically reduces the friction of adding new capabilities to a platform.

In the Prismatic Platform, auto-discovery is a foundational architectural pattern implemented through Elixir metaprogramming (`@after_compile` hooks), enabling the self-registering systems for OSINT tools (127 adapters), Academy topics, DD pipeline sources, and the API gateway's endpoint discovery.

## Technical Deep Dive

### Discovery Mechanisms

| Mechanism | Timing | Method | Prismatic Usage |
|-----------|--------|--------|-----------------|
| **@after_compile** | Compile-time | Beam chunk extraction | OSINT tools, Academy topics, DD sources |
| **Module.concat/2** | Runtime | Dynamic module resolution | API endpoint discovery |
| **Code.fetch_docs/1** | Runtime | Documentation introspection | API auto-documentation |
| **Path.wildcard/1** | Build-time | File system pattern matching | AIAD agent profile loading |
| **Application.spec/2** | Runtime | Application module listing | PrismaticSupervisor auto-discovery |

### Self-Registration Pattern (Used in 3+ Subsystems)

```
1. Module uses behaviour: `use PrismaticOsintCore.Tool`
2. Module calls registration macro: `register_tool(@config)`
3. @after_compile hook fires after module compilation
4. Hook extracts config from BEAM chunks via :beam_lib.chunks/2
5. Config inserted into ETS registry table
6. Registry GenServer provides lookup API
```

## Architecture and Implementation

```elixir
defmodule PrismaticOsintCore.Tool do
  @moduledoc """
  Behaviour and auto-registration macro for OSINT tools.
  Modules using this behaviour automatically register themselves
  in the ToolRegistry via @after_compile hooks.
  This is the canonical self-registration pattern used across
  OSINT, Academy, and DD subsystems.
  """

  @callback execute(map()) :: {:ok, map()} | {:error, term()}

  defmacro __using__(_opts) do
    quote do
      @behaviour PrismaticOsintCore.Tool
      import PrismaticOsintCore.Tool, only: [register_tool: 1]
      @after_compile __MODULE__
    end
  end

  defmacro register_tool(config) do
    quote do
      @tool_config unquote(config)
      Module.put_attribute(__MODULE__, :tool_config, unquote(config))
    end
  end

  @doc """
  After-compile callback that extracts tool configuration from
  the compiled module's attributes and registers it in the
  ToolRegistry ETS table.
  """
  def __after_compile__(env, _bytecode) do
    config = Module.get_attribute(env.module, :tool_config)

    if config do
      PrismaticOsintCore.ToolRegistry.register(env.module, config)
    end
  end
end
```

### API Gateway Auto-Discovery

```elixir
defmodule PrismaticAPI.Scanner do
  @moduledoc """
  Boot-time scanner that discovers all public functions across
  Prismatic* facade modules using Elixir introspection.
  Results are cached in ETS for sub-millisecond dispatch.
  """

  @spec scan_all_modules() :: [map()]
  def scan_all_modules do
    :code.all_loaded()
    |> Enum.filter(fn {mod, _} -> prismatic_facade?(mod) end)
    |> Enum.flat_map(&discover_endpoints/1)
  end

  @spec discover_endpoints({module(), String.t()}) :: [map()]
  defp discover_endpoints({module, _path}) do
    functions = module.__info__(:functions)
    docs = Code.fetch_docs(module)
    specs = Code.Typespec.fetch_specs(module)

    Enum.map(functions, fn {name, arity} ->
      %{
        module: module,
        function: name,
        arity: arity,
        doc: extract_doc(docs, name, arity),
        spec: extract_spec(specs, name, arity)
      }
    end)
  end

  @spec prismatic_facade?(module()) :: boolean()
  defp prismatic_facade?(module) do
    module_name = Atom.to_string(module)
    String.starts_with?(module_name, "Elixir.Prismatic") and
      not String.contains?(module_name, ".Impl.") and
      not String.contains?(module_name, ".Internal.")
  end
end
```

## Usage in Prismatic Platform

- **OSINT ToolRegistry**: 127 tools self-register via `use PrismaticOsintCore.Tool` + `register_tool/1`
- **Academy TopicRegistry**: Topics self-register via `use PrismaticAcademy.Topic` + `register_topic/1`
- **DD SourceRegistry**: DD sources self-register via `use PrismaticDd.Source` + `register_source/1`
- **API Gateway**: Auto-discovers all Prismatic facade functions at boot time
- **PrismaticSupervisor**: Auto-discovers all umbrella apps and classifies them into domains
- **AIAD Indexer**: Discovers agent profiles by scanning `.aiad/agents/*.agent.md`

## Best Practices

1. **Use ETS for discovery results**: Discovery results should be cached in ETS for sub-millisecond lookups at runtime.
2. **Validate during registration**: Reject invalid configurations at registration time, not at usage time.
3. **Emit telemetry on registration**: Track how many components are discovered for monitoring and debugging.
4. **Handle missing registrations gracefully**: If a component is expected but not discovered, emit a clear error rather than silently degrading.
5. **Document the registration contract**: Every auto-discovery system must document what modules need to implement to be discovered.

## Related Terms

- [AIAD Agent](/glossary/aiad-agent/) -- agents discovered via profile scanning
- [Agent Profile](/glossary/agent-profile/) -- declarative documents enabling agent discovery
- **Command Registry** -- command-to-agent mapping via discovery
- **Compile-time** -- the phase where @after_compile hooks execute
- **Configuration** -- runtime parameters complementing discovered defaults

## See Also

- [Elixir Metaprogramming Guide](https://hexdocs.pm/elixir/meta-programming.html) -- official Elixir metaprogramming docs
- [OSINT Toolbox](/osint/) -- 127 self-discovered OSINT tools

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
