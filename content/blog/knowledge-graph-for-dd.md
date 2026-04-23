+++
title = "Knowledge Graphs for Due Diligence: Why Relations Beat Records"
date = 2026-04-09
description = "Tabular DD misses the thing DD is for: the relationships between entities. Moving a DD case from Postgres rows to a knowledge graph changes which questions you can actually answer."

[extra]
author = "Tomáš Korcak (korczis)"
category = "intelligence"
tags = ["knowledge-graph", "graph", "dd", "kuzu", "due-diligence"]
reading_time = "7 min"
keywords = ["knowledge graph due diligence", "KuzuDB", "graph database DD", "entity relationships"]
image = "/images/blog/knowledge-graph.png"
word_count = 520
date_created = "2026-04-09"
date_modified = "2026-04-09"
quality_score = 34
see_also = ["knowledge-graph", "entity-graph", "entity-resolution", "due-diligence", "kyc"]
image_alt = "Knowledge Graphs for Due Diligence"
+++

Relational databases are great at "find me this row." Graph databases are great at "find me everything connected to this row within three hops." [Due diligence](/glossary/due-diligence) almost always needs the second query, and forcing it through Postgres joins is how DD platforms end up with 600-line SQL statements nobody can audit.

## The question that breaks Postgres

> "Show me every company where at least one director of the target also served on a board whose audit was flagged in the last three years, including indirect ownership via nominees."

Try that as SQL. You end up with a recursive CTE, six self-joins, and a plan the optimizer gives up on above 10k rows. Try it as a graph query:

```cypher
MATCH (target:Company {id: $target_id})
MATCH (target)-[:DIRECTOR_OF]->(p:Person)
      -[:DIRECTOR_OF]->(other:Company)
      -[:AUDITED_BY]->(a:Audit {flagged: true})
WHERE a.year >= $since
RETURN DISTINCT other, p, a
```

Same question. One query. No CTE. Works at 10M nodes.

## The data model

A DD [knowledge graph](/glossary/knowledge-graph) has a small ontology and ruthless naming discipline:

- **Nodes:** Person, Company, Bank, Jurisdiction, Audit, Court_Case, Asset
- **Edges:** DIRECTOR_OF, OWNS, BENEFICIAL_OWNER_OF, LITIGATED_AGAINST, BANKED_BY, REGISTERED_IN, AUDITED_BY

Every edge carries a timestamp and a provenance. Edges without provenance are not edges — they are rumors. The [entity graph](/glossary/entity-graph) is only as trustworthy as the source of each relation.

## Entity resolution feeds the graph

Garbage in, garbage graph. Before anything hits the graph, it passes through [entity resolution](/glossary/entity-resolution): "Navigara s.r.o." and "NAVIGARA SRO - v likvidaci" must collapse into one node or the graph is lying. The resolver writes to the graph in an `Ecto.Multi`-style transaction so an unresolved row can never create a dangling node.

## Temporal correctness

Graphs without time are a trap. A director who resigned in 2019 should not show up in a 2024 analysis of current directors. Every edge carries `valid_from` and `valid_until`, and every query filters on the case's "as-of" date:

```cypher
MATCH (c:Company)-[r:DIRECTOR_OF]->(p:Person)
WHERE r.valid_from <= $as_of AND (r.valid_until IS NULL OR r.valid_until > $as_of)
RETURN p
```

The "as-of" is what turns the graph from a snapshot into a point-in-time view — which is what regulators and [KYC](/glossary/kyc) reviewers actually need.

## When NOT to use a graph

If the question is "show me all cases assigned to user X", it is a Postgres query. If the question is "list companies registered in Cyprus with more than €10M revenue," it is a Meilisearch query. Graphs are for *traversal*. Use them when the answer depends on paths, not records.

## Where to go next

- **Academy**: [DD Investigation](/academy/learn/dd-investigation) — the graph-backed workflow end to end
- **Academy**: [Storage Patterns](/academy/learn/storage-patterns) — picking the right adapter per question
- **Glossary**: [Knowledge Graph](/glossary/knowledge-graph), [Entity Graph](/glossary/entity-graph), [Entity Resolution](/glossary/entity-resolution), [Due Diligence](/glossary/due-diligence), [KYC](/glossary/kyc)

Relations beat records when the question is about connections. DD is always about connections.
