+++
title = "Phoenix PubSub Fan-Out Patterns: Topics Are a Contract"
date = 2026-04-09
description = "PubSub is free — until the fan-out is wrong and one broadcast wakes 10,000 LiveView sockets. Three topic naming rules that keep Prismatic's live dashboards responsive at scale."

[extra]
author = "Tomáš Korcak (korczis)"
category = "engineering"
tags = ["pubsub", "phoenix", "liveview", "scale", "patterns"]
reading_time = "6 min"
keywords = ["Phoenix PubSub", "LiveView fan-out", "topic naming", "PubSub patterns"]
image = "/images/blog/pubsub-fanout.png"
word_count = 500
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 33
see_also = ["pubsub", "phoenix", "liveview", "observability", "performance"]
image_alt = "Phoenix PubSub Fan-Out Patterns"
+++

`Phoenix.PubSub.broadcast(Prismatic.PubSub, "updates", msg)` is a one-liner. It is also how a careless change wakes every connected [LiveView](@/glossary/liveview.md) on the platform. PubSub is trivially cheap per-subscriber, which means it is catastrophically expensive at the wrong fan-out. Three rules keep `/hub` responsive.

## Rule 1: Topics are scoped, not global

A global topic like `"updates"` is a sign that someone stopped thinking. Real topics carry the smallest scope that correctly identifies the audience:

```elixir
# ❌ wakes everyone
Phoenix.PubSub.broadcast(Prismatic.PubSub, "updates", {:dd_case_updated, case})

# ✅ wakes only viewers of this one case
Phoenix.PubSub.broadcast(Prismatic.PubSub, "dd:case:#{case.id}", {:updated, case})
```

The topic is the contract. A LiveView that subscribes to `"dd:case:#{id}"` is promising "I care about this case and nothing else." Broadcasting to that topic from an unrelated code path is a bug — it means someone violated the contract.

## Rule 2: Topic names are a taxonomy

Prismatic uses a three-segment pattern: `<domain>:<object>:<id>`. Flat namespaces don't scale mentally past ~20 topics. A taxonomy lets you grep production and answer "who subscribes to this?" in seconds:

```
dd:case:<id>         # per-case updates
dd:entity:<id>       # per-entity changes
osint:run:<run_id>   # per-OSINT-run execution stream
system:alert         # global alerts (use sparingly)
system:error_feed    # error stream (use sparingly)
```

The last two are the exception to rule 1. Global topics are allowed when the audience is *every* operator — but every such topic needs a written justification.

## Rule 3: Broadcast the smallest payload

A PubSub message is copied into every subscriber's mailbox. A 100 KB payload × 500 subscribers = 50 MB of BEAM heap allocated per broadcast. Don't do that. Send the minimum — an id, an event type, a version — and let each subscriber decide whether to fetch more:

```elixir
# ❌ 100 KB × N copies
broadcast(topic, {:case_updated, case_with_all_entities})

# ✅ N copies of 40 bytes
broadcast(topic, {:case_updated, case.id, case.version})
```

Subscribers that care can `fetch/1` the full record. Subscribers that don't (idle LiveViews, closed tabs that haven't disconnected yet) throw the message away cheaply.

## Fan-out via Registry for low-cardinality cases

For low-cardinality, high-frequency broadcasts (say, 50 subscribers), `Registry.dispatch/3` is cheaper than PubSub and gives you synchronous back-pressure. Use it when the set of subscribers is small and known. Use PubSub when the set is large or unknown.

## Observability on every broadcast

Every broadcast path emits [telemetry](@/glossary/telemetry.md):

```elixir
:telemetry.execute([:pubsub, :broadcast], %{bytes: payload_size}, %{topic: topic})
```

The dashboard groups by topic. A topic that suddenly starts broadcasting 10× more bytes is a regression worth a ticket. [Observability](@/glossary/observability.md) for PubSub is the only way to catch these before users notice.

## Where to go next

- **Academy**: [LiveView Dashboards](/academy/liveview-dashboards) — consuming PubSub in LiveView
- **Glossary**: [PubSub](@/glossary/pubsub.md), [Phoenix](@/glossary/phoenix.md), [LiveView](@/glossary/liveview.md), [Observability](@/glossary/observability.md), [Performance](@/glossary/performance.md)

Topics are a contract. Payloads are copies. Broadcast accordingly.
