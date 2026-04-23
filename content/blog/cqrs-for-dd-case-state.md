+++
title = "CQRS for DD Case State: When the Read Model Has to Lie (On Purpose)"
date = 2026-04-09
description = "A DD case has one write model and twenty read shapes — timeline, graph, risk score, audit log, compliance export. Forcing them all through the same Ecto query is how dashboards die. CQRS is the fix."

[extra]
author = "Tomáš Korcak (korczis)"
category = "architecture"
tags = ["cqrs", "event-sourcing", "dd", "architecture", "read-model"]
reading_time = "8 min"
keywords = ["CQRS Elixir", "event sourcing DD", "read model", "write model separation"]
image = "/images/blog/cqrs-dd.png"
word_count = 540
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 35
see_also = ["cqrs", "event-sourcing", "ecto", "pubsub", "due-diligence"]
image_alt = "CQRS for DD Case State"
+++

A due diligence case has one canonical write path and twenty read shapes. The case dashboard wants a timeline. The graph view wants nodes and edges. The compliance export wants a flat row per entity. The analyst wants a redacted copy for a junior reviewer. Answering all of those from one `cases` table is the kind of decision that looks sensible until you hit 500k cases and the dashboard takes six seconds. [CQRS](/glossary/cqrs) separates the write model from the read models and the whole problem dissolves.

## Write side: the command

```elixir
defmodule PrismaticDD.Commands.AddEntity do
  defstruct [:case_id, :entity_attrs, :user_id, :source]
end

def execute(%AddEntity{} = cmd) do
  Ecto.Multi.new()
  |> Ecto.Multi.insert(:entity, Entity.changeset(cmd))
  |> Ecto.Multi.insert(:event, event_from(cmd))
  |> Ecto.Multi.run(:publish, fn _, %{event: e} ->
    Phoenix.PubSub.broadcast(Prismatic.PubSub, "dd:case:#{cmd.case_id}", e)
    {:ok, e}
  end)
  |> Repo.transaction()
end
```

The write path is narrow. It validates, it inserts, it emits an event. Notice what it does NOT do: it does not update any read models, it does not compute any rollups, it does not touch any derived tables. The read side listens.

## Read side: projectors

Each read shape has its own projector — a dedicated [GenServer](/glossary/genserver) that subscribes to events and updates its own denormalized table:

```elixir
defmodule PrismaticDD.Projections.Timeline do
  use GenServer

  def init(_) do
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "dd:case:*")
    {:ok, :ok}
  end

  def handle_info(%EntityAdded{} = e, state) do
    Repo.insert!(%TimelineEntry{
      case_id: e.case_id,
      at: e.timestamp,
      kind: "entity_added",
      label: e.entity_name
    })
    {:noreply, state}
  end
end
```

The timeline table is shaped *exactly* for the timeline view. Querying it is one `SELECT`. No joins. No aggregation. The dashboard renders in milliseconds instead of seconds.

## The read model has to lie

Not every read model is real-time consistent with the write side. The compliance export may run at T+5 seconds. The graph view may rebuild in the background every minute. This is not a bug — it is the whole point. Eventual consistency is the price you pay for independent scalability per read shape. In exchange, you get dashboards that do not care if the write volume triples.

## When NOT to do CQRS

CQRS is a tax. Two sides of the model, two deployment stories, two failure modes, two places to search when something is wrong. Pay the tax only when:

- Read shapes diverge sharply from the write model.
- Read volume dwarfs write volume.
- Different read shapes need different storage engines (Postgres / search / graph).

If Ecto + a few well-chosen indexes serves the dashboard, keep it simple.

## Where to go next

- **Academy**: [DD Investigation](/academy/learn/dd-investigation) — the case-state lifecycle
- **Academy**: [Storage Patterns](/academy/learn/storage-patterns) — where CQRS fits
- **Glossary**: [CQRS](/glossary/cqrs), [Event Sourcing](/glossary/event-sourcing), [Ecto](/glossary/ecto), [PubSub](/glossary/pubsub), [Due Diligence](/glossary/due-diligence)

One write model. Many read models. The dashboard stops being a bottleneck.
