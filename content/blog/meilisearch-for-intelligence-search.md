+++
title = "Meilisearch for Intelligence Search: Typo Tolerance Is a Security Feature"
date = 2026-04-09
description = "Intelligence search is not product search. Users type 'Navigara' and the source says 'Navigára spol. s r.o.'. Exact match is worse than useless. Meilisearch + disciplined ranking makes the difference between finding the risk and missing it."

[extra]
author = "Tomáš Korcak (korczis)"
category = "intelligence"
tags = ["meilisearch", "search", "typo-tolerance", "osint", "dd"]
reading_time = "7 min"
keywords = ["Meilisearch intelligence", "typo tolerance search", "OSINT search", "entity search"]
image = "/images/blog/meilisearch.png"
word_count = 510
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["meilisearch", "full-text-search", "typo-tolerance", "osint", "due-diligence"]
image_alt = "Meilisearch for Intelligence Search"
+++

A product search for "iphon" should return "iPhone" because the user is trying to buy a phone. An intelligence search for "navigara" must return "Navigára spol. s r.o." *and* tell you how confident it is in the match, because the user is deciding whether to flag a subsidiary. Same primitive, completely different requirements. [Meilisearch](@/glossary/meilisearch.md) handles both — if you configure it deliberately.

## Why not Postgres FTS

Postgres full-text search is excellent when you own the schema and the queries are predictable. Intelligence search is the opposite: the schema is wide, queries span many fields, and users make typos in names written in languages they don't speak. Postgres FTS can do this, but configuring ranking, [typo tolerance](@/glossary/typo-tolerance.md), and multi-language stemming inside Postgres is a lot of SQL for a moving target.

Meilisearch is a tool for exactly this shape.

## Index design

The index is where the ranking decisions get encoded. Get this wrong and every downstream search has to compensate.

```elixir
%{
  index: "entities",
  primary_key: "id",
  searchable_attributes: [
    "name",                # most important
    "aliases",
    "ico",
    "address",
    "beneficial_owners"    # least important
  ],
  filterable_attributes: ["country", "entity_type", "tier", "last_seen"],
  sortable_attributes: ["last_seen", "risk_score"],
  ranking_rules: [
    "words", "typo", "proximity", "attribute", "sort", "exactness",
    "risk_score:desc"      # custom rule: surface higher risk first
  ]
}
```

The order of `searchable_attributes` matters: a match in `name` outranks a match in `address`. The order of `ranking_rules` decides how ties break — "words > typo" means more matched terms always wins over a closer typo distance, which is what you want for intelligence.

## Typo tolerance as risk

The default typo tolerance is "be helpful." For intelligence, you want "be helpful *and tell me you helped*." Every hit comes back with a `_matchesPosition` and a computed edit distance, so the UI can show a badge:

- **Exact match** — highest confidence.
- **1-char typo** — badge: "fuzzy match."
- **2-char typo** — badge: "possible match, review."

Hiding the fuzziness is how you miss a subsidiary. Exposing it is how you don't.

## Filterable attributes do the hard work

Search is only half. Filter is the other half. Filters run at index-time, not query-time, which means a query like "Czech companies registered after 2020 with beneficial-owner overlap to entity X" is milliseconds instead of seconds:

```elixir
Meilisearch.search("entities", "navigara", %{
  filter: "country = CZ AND last_seen > 2020-01-01",
  limit: 50
})
```

## The rule

> Index for the question you will actually ask, not for the data you happen to have.

An index that mirrors your Postgres schema is a bad index. An index built around the shape of intelligence queries — name-first, typo-aware, time-filtered, risk-ranked — is a good one.

## Where to go next

- **Academy**: [Storage Patterns](/academy/learn/storage-patterns) — when to reach for Meilisearch
- **Academy**: [DD Investigation](/academy/learn/dd-investigation) — using Meilisearch in a real case
- **Glossary**: [Meilisearch](@/glossary/meilisearch.md), [Full-Text Search](@/glossary/full-text-search.md), [Typo Tolerance](@/glossary/typo-tolerance.md), [OSINT](@/glossary/osint.md), [Due Diligence](@/glossary/due-diligence.md)

Typo tolerance is a feature in consumer search. In intelligence search it is the difference between finding the subsidiary and missing it.
