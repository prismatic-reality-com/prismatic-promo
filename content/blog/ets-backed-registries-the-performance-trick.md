+++
title = "ETS-Backed Registries: The Performance Trick Behind 552 Self-Registering Agents"
date = 2026-04-09
description = "Self-registration sounds like metaprogramming magic. It's actually just ETS + @after_compile + discipline. Here's exactly how Prismatic keeps 552 agents and 128 OSINT tools discoverable in sub-millisecond time."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["ets", "registry", "metaprogramming", "performance", "self-registration"]
reading_time = "7 min"
keywords = ["ETS registry", "self-registration Elixir", "after_compile hook", "Prismatic agents"]
image = "/images/blog/ets-registry.png"
word_count = 520
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["ets", "registry", "self-registration", "metaprogramming", "agent-registry"]
image_alt = "ETS-Backed Self-Registering Registries"
+++

When Prismatic needs to answer "what agents exist?" it does not scan a directory, parse YAML, or query Postgres. It hits [ETS](/glossary/ets) and gets an answer in under a microsecond. The same pattern backs the 128 OSINT adapters, the 228 AIAD commands, and the glossary lookups. This is the [self-registration](/glossary/self-registration) pattern — and it is simpler than it looks.

## The goal

A subsystem that satisfies three properties:

1. **Zero manual registration.** Add a new module, recompile, it appears in the [registry](/glossary/registry).
2. **O(1) lookup.** No scanning, no filtering at query time.
3. **Reload-safe.** Restarting the registry GenServer rebuilds from the current BEAM, not a stale disk cache.

## The pattern

Step one: a registry [GenServer](/glossary/genserver) that owns a named, read-concurrent ETS table.

```elixir
defmodule PrismaticAgents.Registry do
  use GenServer

  def start_link(_), do: GenServer.start_link(__MODULE__, :ok, name: __MODULE__)

  def init(:ok) do
    :ets.new(:agent_registry, [:named_table, :set, :public, read_concurrency: true])
    load_from_beam()
    {:ok, %{}}
  end

  def get(slug), do: :ets.lookup(:agent_registry, slug) |> List.first()
  def all, do: :ets.tab2list(:agent_registry)
end
```

Step two: an `Agent` behaviour with an `@after_compile` hook that every concrete agent uses:

```elixir
defmodule PrismaticAgents.Agent do
  defmacro __using__(_opts) do
    quote do
      @behaviour PrismaticAgents.Agent.Behaviour
      @after_compile PrismaticAgents.Agent

      def __register__ do
        PrismaticAgents.Registry.put(metadata().slug, metadata())
      end
    end
  end

  def __after_compile__(_env, _bytecode) do
    # Deferred so registry GenServer is up at app start
    :ok
  end
end
```

Step three: on registry boot, walk all loaded modules and call `__register__/0` on anything implementing the behaviour:

```elixir
defp load_from_beam do
  :code.all_loaded()
  |> Enum.filter(fn {m, _} -> function_exported?(m, :__register__, 0) end)
  |> Enum.each(fn {m, _} -> m.__register__() end)
end
```

That's it. Three small pieces. No YAML, no DSL compiler, no magic.

## Why ETS specifically

- **Concurrent reads.** `read_concurrency: true` lets every LiveView query in parallel without serializing through a GenServer mailbox.
- **Survives ownership.** Named public tables outlive the owning process if you set `heir`. Good for hot reloads.
- **O(1) lookups.** A `:set` table gives O(1) by key. A `:ordered_set` gives O(log n) but keeps iteration cheap.

## The trap: hot reload and stale entries

In dev with `iex -S mix`, if a module is edited and the registry GenServer is *not* restarted, the ETS table still holds the old metadata. Fix: subscribe to `:code_server` events or just bind a dev-only PubSub that triggers a rebuild on `phx.reload`. Most teams do the second one.

## Where to go next

- **Academy**: [First Agent](/academy/learn/first-agent) — build a self-registering agent
- **Academy**: [Storage Patterns](/academy/learn/storage-patterns) — when ETS is the right adapter
- **Glossary**: [ETS](/glossary/ets), [Registry](/glossary/registry), [Self-Registration](/glossary/self-registration), [Metaprogramming](/glossary/metaprogramming), [Agent Registry](/glossary/agent-registry)

Three small pieces. 552 agents. Sub-microsecond lookups. That is the trick.
