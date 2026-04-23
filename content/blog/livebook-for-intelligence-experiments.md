+++
title = "Livebook for Intelligence Experiments: From Notebook to Production in One Step"
date = 2026-04-09
description = "A Livebook session connected to your running application is the fastest feedback loop Elixir has ever had. Here's how Prismatic uses it for ad-hoc DD queries, OSINT exploration, and model calibration without losing rigor."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["livebook", "notebooks", "experimentation", "intelligence", "elixir"]
reading_time = "7 min"
keywords = ["Livebook", "Elixir notebooks", "intelligence experiments", "ad-hoc DD"]
image = "/images/blog/livebook.png"
word_count = 510
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["livebook", "elixir", "intelligence", "exploration", "investigation"]
image_alt = "Livebook for Intelligence Experiments"
+++

Intelligence work has a bad feedback loop. You have a hypothesis, you want to run a query across three adapters, plot the results, and see if the pattern holds. Doing that in an IDE is slow; doing it in `iex` loses history; doing it in a one-off script loses context. [Livebook](/glossary/livebook) is exactly the tool for this shape — and when it is connected to a running node, the loop collapses to "type, shift-enter, see."

## Attaching to a live node

```elixir
# In the Livebook runtime config:
# Attached node: prismatic@localhost
# Cookie: <whatever your dev.exs says>

# Cell:
{:ok, case} = Prismatic.DD.get_case("case_01HX...")
Prismatic.DD.entities_for(case)
|> Enum.group_by(& &1.type)
|> Enum.map(fn {k, v} -> {k, length(v)} end)
```

The cell runs *inside* the Prismatic BEAM node. No mocking. No fixtures. The real data, the real GenServers, the real ETS tables. Livebook becomes a live window into the system.

## Rules for connected notebooks

Two rules keep this from becoming a production hazard:

1. **Read-only by default.** Writes from a notebook should be explicit, gated, and logged. No `Repo.delete_all` anywhere, ever. Treat the notebook like a read replica unless you consciously opt out.
2. **Notebooks are committed.** Save `.livemd` files into `notebooks/` in the repo. A notebook that works once and then is lost is not reproducible, which defeats the point.

## From notebook to test

The best workflow: do an exploration in a notebook, find the query you want, promote it to a function in `lib/`, and write a test. The notebook becomes a scratch pad; the function becomes permanent. The notebook can stay in the repo as a worked example for the next person to face the same question.

```elixir
# In the notebook, after exploration:
defmodule PrismaticDD.Queries.Recent do
  def active_cases_by_analyst(since) do
    from(c in Case,
      where: c.inserted_at >= ^since and c.state == "active",
      preload: [:analyst])
    |> Repo.all()
  end
end
```

Paste that into `lib/`, write a test, ship.

## When to reach for a notebook vs iex

- **iex** — you need to poke at one value, the output is ephemeral, you will throw away the session.
- **Livebook** — you are iterating on a query, you want history, you want a chart, you want to share the exploration with a teammate.

`iex` is still irreplaceable for "is this GenServer alive?" and "what does this module export?" — but the minute you want to see the output in a table or a plot, switch.

## Where to go next

- **Academy**: [DD Investigation](/academy/learn/dd-investigation) — the workflow notebooks support
- **Academy**: [LiveView Dashboards](/academy/learn/liveview-dashboards) — the dashboards notebooks prototype
- **Glossary**: [Livebook](/glossary/livebook), [Elixir](/glossary/elixir), [Intelligence](/glossary/intelligence), [Investigation](/glossary/investigation)

The fastest feedback loop Elixir ever had. Use it.
