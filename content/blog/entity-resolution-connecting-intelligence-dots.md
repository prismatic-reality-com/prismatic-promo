+++
title = "Entity Resolution: Connecting the Intelligence Dots"
date = 2026-03-11
description = "How Prismatic resolves entities across multiple data sources using graph databases, confidence scoring, and the Nabla epistemic framework to build verified intelligence profiles."

[extra]
author = "Tomas Korcak (korczis)"
category = "intelligence"
tags = ["entity-resolution", "osint", "graph-database", "nabla", "intelligence", "data-fusion"]
reading_time = "9 min"
keywords = ["entity resolution OSINT", "intelligence data fusion", "graph-based entity matching", "confidence scoring", "epistemic framework", "multi-source intelligence"]
image = "/images/blog/entity-resolution.png"
word_count = 1650
date_created = "2026-03-11"
date_modified = "2026-03-11"
quality_score = 83
see_also = ["osint", "capabilities", "architecture"]
image_alt = "Entity Resolution: Connecting the Intelligence Dots - Prismatic Platform"
+++

When you query a company name across 157 OSINT sources, you get back hundreds of records. Some are duplicates. Some refer to different entities with the same name. Some contain partial information that only makes sense when combined. Entity resolution is the process of determining which records refer to the same real-world entity and merging them into a coherent profile.

## The Entity Resolution Pipeline

Prismatic's entity resolution pipeline operates in four stages:

### Stage 1: Normalization

Raw records from different sources use different formats. A company might appear as:

- "ACME Corporation" (ARES registry)
- "Acme Corp." (Justice registry)
- "ACME CORPORATION s.r.o." (Trade register)
- "acme-corp" (domain WHOIS)

Normalization strips prefixes, suffixes, and legal form designators, standardizes case, and expands abbreviations:

```elixir
defmodule PrismaticOsintCore.EntityNormalizer do
  @legal_forms ~w(s.r.o. a.s. k.s. v.o.s. s.p. z.s. o.p.s.)

  def normalize_company(name) do
    name
    |> String.trim()
    |> remove_legal_form()
    |> String.downcase()
    |> collapse_whitespace()
    |> transliterate_diacritics()
  end
end
```

### Stage 2: Candidate Generation

Comparing every record against every other record is O(n^2). For 10,000 records, that is 100 million comparisons. We use blocking strategies to reduce the search space:

- **Phonetic blocking** -- group entities by their phonetic signature
- **Token blocking** -- group entities that share significant tokens
- **Geo blocking** -- group entities in the same jurisdiction

This reduces comparisons to candidates that have a reasonable chance of matching.

### Stage 3: Similarity Scoring

For each candidate pair, we compute similarity across multiple dimensions:

| Dimension | Weight | Method |
|-----------|--------|--------|
| Name | 0.30 | Jaro-Winkler + token overlap |
| Address | 0.20 | Structured address matching |
| Identifiers | 0.25 | ICO, VAT ID, domain exact match |
| Relationships | 0.15 | Shared directors, shareholders |
| Temporal | 0.10 | Overlapping activity periods |

A weighted score above 0.85 is an automatic merge. Between 0.65 and 0.85, the pair is flagged for human review. Below 0.65, the entities are treated as distinct.

### Stage 4: Graph Integration

Resolved entities are stored in KuzuDB, a graph database that captures relationships:

```
[Company A] ──owns──► [Company B]
     │                      │
     └──director──► [Person X] ◄──shareholder── [Company C]
```

Graph queries reveal relationships that are invisible in tabular data: ownership chains, circular ownership, beneficial ownership through intermediaries.

## Confidence with Nabla

Every entity resolution carries uncertainty. The Nabla epistemic framework quantifies this:

```elixir
%NablaConfidence{
  value: 0.87,
  epistemic: 0.05,    # Uncertainty from incomplete data
  aleatoric: 0.08,    # Uncertainty from inherent ambiguity
  sources: [:ares, :justice, :whois],
  evidence_count: 12
}
```

**Epistemic uncertainty** decreases as more data becomes available. If we have only a name match, epistemic uncertainty is high. Adding an ICO match reduces it.

**Aleatoric uncertainty** reflects inherent ambiguity. Two companies with the same name in the same city might genuinely be different entities. No amount of additional data eliminates this uncertainty.

The distinction matters for decision-making: epistemic uncertainty suggests we should gather more data, while aleatoric uncertainty suggests we should present both possibilities to the analyst.

## Cross-Source Verification

Prismatic's 157 OSINT adapters span six categories:

- **Czech registries** (ARES, Justice, Trade Register, Insolvency)
- **EU sources** (OpenCorporates, EIOPA, ECB)
- **Global databases** (Shodan, VirusTotal, WHOIS)
- **Sanctions lists** (EU, US OFAC, UK HMT)
- **Financial data** (annual reports, credit ratings)
- **Web intelligence** (social media, news, domain data)

When an entity appears in multiple categories with consistent information, confidence increases. When sources conflict (e.g., different addresses), the system flags the discrepancy for investigation.

## Real-World Example

A due diligence investigation on "Navigara s.r.o." produces:

1. **ARES**: ICO 12345678, address Praha 1, active since 2018
2. **Justice Registry**: Same ICO, 2 directors, 1 shareholder (foreign entity)
3. **Trade Register**: Same ICO, industry code 6201 (IT services)
4. **Insolvency Registry**: No records (positive signal)
5. **Domain WHOIS**: navigara.cz registered to same address
6. **LinkedIn**: Company page with 15 employees

Entity resolution merges these into a single profile with confidence 0.94 (high -- multiple identifier matches across official registries). The graph database records the shareholder relationship to the foreign entity, enabling ownership chain analysis.

## Conclusion

Entity resolution transforms raw intelligence from multiple sources into verified, confidence-scored entity profiles. The combination of blocking strategies for performance, multi-dimensional similarity scoring for accuracy, and the Nabla epistemic framework for uncertainty quantification produces profiles that analysts can trust -- and understand the limits of.

---

*Explore the [OSINT Capabilities](/osint/) or try the [Interactive Labs](/lab/) for hands-on entity resolution exercises.*
