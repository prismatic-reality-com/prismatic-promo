+++
title = "Entity Resolution: The Hard Part of Due Diligence Nobody Wants to Own"
date = 2026-04-09
description = "Two rows with the same ICO are easy. Two rows where one says 'Navigara s.r.o.' and the other says 'NAVIGARA SRO - in likvidaci' are where entity resolution earns its keep. Here's how Prismatic does it."

[extra]
author = "Tomáš Korcak (korczis)"
category = "intelligence"
tags = ["entity-resolution", "due-diligence", "dd", "kyc", "graph"]
reading_time = "8 min"
keywords = ["entity resolution", "due diligence", "KYC", "record linkage", "Prismatic DD"]
image = "/images/blog/entity-resolution.png"
featured = true
word_count = 560
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 36
see_also = ["entity-resolution", "entity-graph", "due-diligence", "kyc", "knowledge-graph"]
image_alt = "Entity Resolution in Due Diligence"
+++

Every [due diligence](@/glossary/due-diligence.md) team eventually hits the same wall: the data is there, but it refuses to *line up*. One source calls the company "Navigara s.r.o." Another calls it "NAVIGARA SRO - v likvidaci". A third has the right ICO but the wrong address. Collapsing those three rows into one entity — and knowing when *not* to collapse — is [entity resolution](@/glossary/entity-resolution.md), and it is where most DD stacks quietly lose.

## The three failure modes

1. **Under-merging** — two rows that should be one entity stay separate. You miss connections. You miss risk.
2. **Over-merging** — two unrelated entities collapse into one. You flag innocent people. You get sued.
3. **Temporal drift** — the same entity at t=0 and t=1 looks different (address change, ownership change) and you treat them as two.

A system that ignores any of the three is not doing entity resolution. It is doing string matching with good marketing.

## Blocking + scoring + graph

Prismatic's resolver runs three stages:

**1. Blocking.** Reduce O(n²) comparisons to O(n·k) by bucketing on cheap keys (ICO prefix, normalized name trigrams, country + postal code):

```elixir
def block(entities) do
  Enum.group_by(entities, fn e ->
    {country(e), trigram_head(e.name), ico_prefix(e)}
  end)
end
```

**2. Scoring.** Within a block, compute a weighted similarity across ICO exact match, name Jaro-Winkler, address Levenshtein, beneficial-owner overlap:

```elixir
def score(a, b) do
  0.45 * ico_match(a, b) +
  0.25 * name_sim(a, b) +
  0.15 * address_sim(a, b) +
  0.15 * bo_overlap(a, b)
end
```

**3. Graph.** Promote high-confidence pairs into a [knowledge graph](@/glossary/knowledge-graph.md) edge, then use community detection to find over-merges (one "entity" that is actually five) and missing merges (two communities sharing a directing mind).

## The golden record is a lie

Most stacks flatten resolved entities into a single "golden record." That is convenient and wrong. A resolved entity has a *history* — each merge is an event with a timestamp, a score, a reason, and a reversibility flag. If a later signal contradicts an earlier merge, you *split*, not overwrite.

```elixir
%EntityNode{
  id: "ent_01HX...",
  canonical: %{name: "Navigara s.r.o.", ico: "..."},
  merges: [
    %{source_id: "...", score: 0.97, merged_at: ~U[...], reason: :ico_exact},
    %{source_id: "...", score: 0.82, merged_at: ~U[...], reason: :name_address}
  ],
  reversible: true
}
```

## KYC and the regulator test

Under [KYC](@/glossary/kyc.md) obligations, "we merged because the names looked similar" is not a defensible answer. "We merged because ICO matched exactly and beneficial ownership overlapped 100%, here is the audit trail" is. Entity resolution without an audit trail is a liability.

## Where to go next

- **Academy**: [DD Investigation](/academy/dd-investigation) — full case walkthrough
- **Academy**: [Decision Core Fundamentals](/academy/learn/decision-core-fundamentals) — how resolved entities feed the decision engine
- **Glossary**: [Entity Resolution](@/glossary/entity-resolution.md), [Entity Graph](@/glossary/entity-graph.md), [Due Diligence](@/glossary/due-diligence.md), [KYC](@/glossary/kyc.md), [Knowledge Graph](@/glossary/knowledge-graph.md)

Get the merges right and the rest of DD is plumbing. Get them wrong and everything downstream is noise.
