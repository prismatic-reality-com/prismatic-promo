+++
title = "LiveView Streams for Large Datasets: 10k Rows Without the Memory Bill"
date = 2026-04-09
description = "Phoenix LiveView streams solve a problem most dashboards pretend they don't have: the DOM keeps every row you ever rendered. Here's when to reach for streams, when to reach for pagination, and the memory math behind the decision."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["liveview", "streams", "performance", "phoenix", "ui"]
reading_time = "6 min"
keywords = ["LiveView streams", "Phoenix streams", "large dataset UI", "DOM memory"]
image = "/images/blog/liveview-streams.png"
word_count = 500
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 33
see_also = ["liveview", "phoenix-liveview", "performance", "memory", "ui-components"]
image_alt = "LiveView Streams for Large Datasets"
+++

A naive LiveView page that renders 10,000 rows works — until the user scrolls, the server holds the full list in assigns, the DOM carries 10,000 nodes, and the process heap balloons to tens of megabytes. Multiply that by 200 connected clients and the BEAM is doing a lot of work to show a lot of data nobody is looking at. [LiveView](@/glossary/liveview.md) streams are the fix.

## The memory math

A single row assign with ten fields is maybe 500 bytes. Ten thousand rows is ~5 MB per socket. Two hundred sockets is 1 GB — just for the data that is already on screen. Add the DOM diff tracking LiveView needs to patch updates, and the real cost is higher.

Streams break that coupling. The server no longer keeps the rows; it keeps a stream cursor. The client DOM keeps only the rows it has actually inserted. When you update a row, LiveView sends a targeted patch for *that* row — it does not re-diff the entire list.

## The API

```elixir
def mount(_params, _session, socket) do
  {:ok,
   socket
   |> stream_configure(:terms, dom_id: &"term-#{&1.slug}")
   |> stream(:terms, Glossary.list_terms(), limit: 200, reset: true)}
end

def handle_event("load-more", %{"cursor" => cursor}, socket) do
  more = Glossary.list_terms(after: cursor)
  {:noreply, stream(socket, :terms, more, at: -1)}
end

def handle_info({:term_updated, term}, socket) do
  {:noreply, stream_insert(socket, :terms, term)}
end
```

Three things to notice:

1. `stream_configure/3` sets a stable DOM id — required, because the client identifies rows by id.
2. `limit: 200` caps the client-side list. Older entries are pruned from the DOM as new ones arrive.
3. `stream_insert/3` is targeted: it patches one row, not the list.

## The template

```heex
<ul id="terms" phx-update="stream">
  <li :for={{id, term} <- @streams.terms} id={id}>
    <.link navigate={~p"/glossary/#{term.slug}"}><%= term.name %></.link>
  </li>
</ul>
```

`phx-update="stream"` is the magic. It tells LiveView not to re-render the parent on every assign change. Forget it and streams silently degrade to a regular list.

## When NOT to use streams

Streams are wrong when you need:

- Filtering that touches the whole dataset (streams are append/patch, not query).
- A total count that updates live (keep the count as a separate scalar assign).
- Sort orders that change frequently (each sort needs a `reset: true` stream).

For those cases, use pagination or a separate search index — [Meilisearch](@/glossary/meilisearch.md) is the right tool for big filterable lists.

## Where to go next

- **Academy**: [LiveView Dashboards](/academy/liveview-dashboards) — streams in production dashboards
- **Glossary**: [LiveView](@/glossary/liveview.md), [Phoenix LiveView](@/glossary/phoenix-liveview.md), [Performance](@/glossary/performance.md), [Memory](@/glossary/memory.md), [UI Components](@/glossary/ui-components.md)

Streams are not faster. Streams are *cheaper*. At 200 connected clients that is the same thing.
