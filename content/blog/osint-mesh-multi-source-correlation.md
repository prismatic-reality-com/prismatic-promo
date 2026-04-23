+++
title = "The OSINT Mesh: Multi-Source Intelligence Correlation"
date = 2026-03-15
description = "How Prismatic correlates intelligence across 157 OSINT adapters using graph analysis, confidence aggregation, and the mesh expansion pattern to discover hidden connections."

[extra]
author = "Tomas Korcak (korczis)"
category = "intelligence"
tags = ["osint", "mesh", "correlation", "graph-analysis", "intelligence", "multi-source"]
reading_time = "10 min"
keywords = ["OSINT correlation", "multi-source intelligence", "intelligence mesh", "graph-based OSINT", "intelligence aggregation", "data correlation techniques"]
image = "/images/blog/osint-mesh.png"
word_count = 1700
date_created = "2026-03-15"
date_modified = "2026-03-15"
quality_score = 84
see_also = ["osint", "capabilities", "architecture"]
image_alt = "The OSINT Mesh: Multi-Source Intelligence Correlation - Prismatic Platform"
+++

A single OSINT source tells you a fact. Multiple sources tell you a story. The mesh pattern is Prismatic's approach to correlating intelligence across 157 adapters to discover connections that no single source reveals.

## The Mesh Pattern

Traditional OSINT workflows are linear: query a source, read the results, query the next source. The mesh pattern is parallel and iterative:

1. **Seed**: Start with a target entity (company name, domain, person)
2. **Expand**: Query all relevant adapters concurrently
3. **Correlate**: Match results across sources using entity resolution
4. **Discover**: Extract new entities from results (directors, domains, addresses)
5. **Repeat**: Use discovered entities as new seeds, expanding the mesh

Each iteration deepens the intelligence picture. A company name yields directors. Directors yield other companies. Other companies yield domains. Domains yield IP addresses. IP addresses yield hosted services.

## Concurrent Expansion

The expansion phase queries multiple sources in parallel:

```elixir
defmodule PrismaticOsintCore.Mesh.Expander do
  def expand(entity, opts \\ []) do
    adapters = select_adapters(entity.type, opts)
    timeout = Keyword.get(opts, :timeout, 30_000)

    tasks = Enum.map(adapters, fn adapter ->
      Task.async(fn ->
        case adapter.search(entity.query, opts) do
          {:ok, results} -> {adapter.metadata().name, results}
          {:error, reason} -> {adapter.metadata().name, {:error, reason}}
        end
      end)
    end)

    Task.await_many(tasks, timeout)
    |> Enum.reject(fn {_name, result} -> match?({:error, _}, result) end)
    |> Enum.flat_map(fn {source, results} ->
      Enum.map(results, &Map.put(&1, :source, source))
    end)
  end
end
```

For a company entity, this might query 20+ adapters simultaneously: ARES, Justice, WHOIS, Shodan, LinkedIn, OpenCorporates, sanctions lists, and more. Results arrive within seconds.

## Correlation Strategies

Raw results from different sources use different schemas. Correlation matches them using multiple strategies:

**Identifier matching** -- the strongest signal. If two records share an ICO, VAT ID, or domain name, they likely refer to the same entity:

```elixir
def correlate_by_identifier(results) do
  results
  |> Enum.group_by(fn r ->
    r[:identifiers][:ico] || r[:identifiers][:domain] || r[:identifiers][:email]
  end)
  |> Enum.reject(fn {key, _} -> is_nil(key) end)
  |> Enum.map(fn {_key, group} -> merge_group(group) end)
end
```

**Name similarity** -- for entities without shared identifiers, fuzzy name matching with Jaro-Winkler distance provides a reasonable match signal.

**Graph proximity** -- entities that are close in the relationship graph (shared directors, shared addresses, shared IP ranges) are likely related even without direct identifier matches.

## Confidence Aggregation

When multiple sources confirm the same fact, confidence increases. Prismatic uses a Bayesian approach:

```
P(fact | sources) = 1 - product(1 - confidence_i for each source_i)
```

If three independent sources each report a fact with 0.80 confidence, the aggregated confidence is:

```
1 - (1-0.80) * (1-0.80) * (1-0.80) = 1 - 0.008 = 0.992
```

This is the strength of multi-source intelligence: each additional source reduces uncertainty multiplicatively.

## Discovery: New Entities from Results

The mesh grows by extracting new entities from existing results:

| Source Result | Extracted Entity | Type |
|--------------|------------------|------|
| Company directors | Person names | Person |
| Domain WHOIS | Registrant email | Email |
| SSL certificates | Subject alternative names | Domain |
| LinkedIn profile | Other companies | Company |
| IP address scan | Hosted services | Service |
| Shareholder data | Parent companies | Company |

Each extracted entity becomes a candidate for the next expansion cycle. To prevent unbounded growth, the mesh enforces depth limits (typically 3 hops) and relevance thresholds (entities must be related to the original target).

## Graph Visualization

The mesh naturally maps to a graph structure, stored in KuzuDB:

- **Nodes**: entities (companies, people, domains, IPs)
- **Edges**: relationships (owns, directs, hosts, shares_address)
- **Properties**: confidence scores, source lists, timestamps

The graph reveals patterns invisible in tabular data:

- **Circular ownership**: Company A owns B, B owns C, C owns A
- **Hidden controllers**: A person who directs multiple companies through intermediaries
- **Infrastructure sharing**: Companies sharing the same IP range or hosting provider
- **Temporal patterns**: Entities created or modified around the same dates

## Practical Example: Due Diligence Mesh

Starting from a target company "Navigara s.r.o." (ICO 12345678):

**Hop 0** (seed): Query all Czech adapters for ICO 12345678
- ARES: company details, address, NACE codes
- Justice: 2 directors, 1 foreign shareholder
- ISIR: no insolvency records

**Hop 1** (expand directors): Query each director name
- Justice: Director A also directs Company X and Company Y
- LinkedIn: Director B lists additional employment
- Sanctions: no matches (positive signal)

**Hop 2** (expand related companies): Query Companies X and Y
- ARES: Company X shares address with target
- Justice: Company Y has insolvency proceedings
- Domain: Company X registered navigara-consulting.cz

**Result**: A mesh of 8 entities with 12 relationships, revealing that the target company shares infrastructure and directors with a company in insolvency proceedings -- a risk signal that no single source would surface.

## Rate Limiting and Resource Management

Expanding a mesh across 157 adapters requires careful resource management:

- **Adapter-level rate limits**: Declared in metadata, enforced by the pipeline
- **Global concurrency limits**: Maximum 50 concurrent adapter calls
- **Depth budgets**: Each hop level has a maximum entity count
- **Timeout management**: Individual adapter timeouts (15s) and mesh-level timeouts (5min)

## Conclusion

The OSINT mesh transforms Prismatic from a collection of adapters into an intelligence platform. By expanding, correlating, and discovering across multiple sources in parallel, the mesh reveals the connections that matter for due diligence, security assessments, and compliance investigations.

---

*Try the OSINT mesh at [Interactive Labs](@/lab/_index.md) or explore all [157 OSINT Adapters](@/osint/_index.md) for available data sources.*
