+++
title = "Entity Resolution"
weight = 44
[extra]
category = "intelligence"
description = "Intelligence process of determining whether multiple data records from different sources refer to the same real-world entity, enabling identity consolidation across disparate datasets."
related_terms = ["knowledge-graph", "ontology", "data-pipeline", "nabla-infinity", "trinity-gate", "confidence-scoring", "signal-plurality", "provenance-mandatory", "stream-processing"]
tier = "TIER 1"
domain = "Intelligence Processing"
platform_integration = "PrismaticResolution"
maturity = "Production"
complexity = "Advanced"
audience = ["intelligence-analysts", "data-engineers", "osint-practitioners"]
key_benefits = ["identity-consolidation", "cross-source-correlation", "deduplication", "entity-linking"]
prerequisites = ["knowledge-graph", "ontology", "confidence-scoring"]
matching_strategies = ["deterministic", "probabilistic", "graph-based"]
blocking_methods = ["exact-key", "sorted-neighborhood", "canopy", "lsh", "phonetic"]
similarity_metrics = ["jaro-winkler", "levenshtein", "jaccard", "cosine"]
confidence_threshold = 0.80
nabla_compliance = "Mandatory"
pipeline_model = "Broadway stream processing"
prismatic_module = "PrismaticResolution"
false_positive_impact = "Incorrectly merged entities"
false_negative_impact = "Missed entity connections"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1234
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Entity", "Resolution", "Intelligence", "glossary", "Prismatic Platform", "High", "Graph", "Name"]
tags = ["glossary", "intelligence", "entity-resolution", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Entity Resolution - Prismatic Platform"
+++

## Definition

Entity resolution (also known as record linkage, deduplication, entity matching, or identity resolution) is the process of determining whether different data records -- potentially from entirely different sources, using different identifiers, formats, spellings, and levels of completeness -- refer to the same real-world entity. In intelligence and cybersecurity contexts, this means linking persons, organizations, domains, IP addresses, email addresses, social media accounts, and digital assets across multiple data sources that share no common identifier. Entity resolution is the critical step that transforms fragmented, duplicated raw data into a coherent, consolidated view of reality.

The challenge is fundamentally one of uncertainty. A person named "Jan Novak" appearing in a Czech business registry, "J. Novak" listed as a domain registrant, and "jan.novak@example.com" found in a data breach may or may not be the same individual. Entity resolution combines deterministic matching (exact matches on unique identifiers like email addresses, tax IDs, or domain names), probabilistic matching (fuzzy similarity scoring on names, addresses, and other attributes), and graph-based matching (analyzing relationship patterns -- if two records share three common associates, they are more likely to be the same entity). The output is not a binary yes/no but a confidence-scored assertion: "these records represent the same entity with 87% confidence based on name similarity, shared IP range, and overlapping registration dates."

Entity resolution sits at the intersection of data engineering, information theory, and domain expertise. At scale, it requires efficient blocking strategies (reducing the O(n^2) comparison space to manageable candidate sets), sophisticated similarity metrics (Jaro-Winkler for names, Levenshtein for strings, geospatial proximity for addresses), and principled confidence calibration (ensuring that a "90% confidence" link is actually correct 90% of the time). False positives (incorrectly merging distinct entities) and false negatives (failing to link records for the same entity) both have serious consequences in intelligence operations.

## Context in Prismatic

The Prismatic Platform performs entity resolution through dedicated L2 resolver agents that consolidate intelligence records across OSINT sources. Social media profiles, corporate registry records, domain registrations, certificate transparency logs, and financial data are linked to master entity records using multi-signal correlation validated against [NABLA Infinity](/glossary/nabla-infinity/) axioms. The [Signal Plurality](/glossary/signal-plurality/) axiom requires that entity links be supported by at least two independent signals, and the [Provenance Mandatory](/glossary/provenance-mandatory/) axiom ensures that every link is traceable to its evidence sources.

Resolution [confidence scores](/glossary/confidence-scoring/) must exceed the standard operations threshold (tau = 0.80) before entity links are established in the [Knowledge Graph](/glossary/knowledge-graph/). Links below the threshold are preserved as candidate associations for analyst review rather than being discarded -- consistent with the [contradiction preservation](/glossary/contradiction-preservation/) principle. The [Trinity Gate](/glossary/trinity-gate/) validates resolution assertions through structural consistency (the entity graph remains a valid DAG), logical consistency (attribute values do not contradict), and formal verification.

## Entity Resolution Pipeline

The resolution process follows a multi-stage pipeline, each stage reducing the candidate space while increasing match precision:

```
Raw Records (N sources)
      |
      v
  1. Normalization
      |  Name standardization, address parsing, format unification
      v
  2. Blocking
      |  Partition records into candidate groups (O(n) instead of O(n^2))
      v
  3. Pairwise Comparison
      |  Compute similarity scores across multiple attributes
      v
  4. Classification
      |  Determine match/non-match/uncertain using trained thresholds
      v
  5. Clustering
      |  Group matched records into entity clusters
      v
  6. Confidence Scoring
      |  Assign NABLA-compliant confidence to each entity link
      v
  7. Knowledge Graph Integration
      |  Merge into master entity records with provenance
      v
  Master Entity Records
```

### Pipeline Implementation

```elixir
defmodule PrismaticResolution.Pipeline do
  @moduledoc "Multi-stage entity resolution pipeline with NABLA compliance."

  @spec resolve(String.t(), keyword()) :: {:ok, [map()]} | {:error, term()}
  def resolve(domain, opts \\ []) do
    confidence_threshold = Keyword.get(opts, :threshold, 0.80)

    with {:ok, raw_records} <- collect_source_records(domain),
         {:ok, normalized} <- normalize_records(raw_records),
         {:ok, blocks} <- generate_blocks(normalized),
         {:ok, candidates} <- pairwise_compare(blocks),
         {:ok, classified} <- classify_matches(candidates, confidence_threshold),
         {:ok, clusters} <- cluster_matches(classified),
         {:ok, scored} <- apply_nabla_scoring(clusters),
         {:ok, entities} <- integrate_knowledge_graph(scored) do
      {:ok, entities}
    end
  end

  defp collect_source_records(domain) do
    sources = [
      Task.async(fn -> PrismaticOsint.Czech.search(domain) end),
      Task.async(fn -> PrismaticOsint.Global.search(domain) end),
      Task.async(fn -> PrismaticPerimeter.Sources.Censys.domain_search(domain) end),
      Task.async(fn -> PrismaticPerimeter.Sources.Shodan.domain_search(domain) end)
    ]

    results = Enum.map(sources, &Task.await(&1, 30_000))
    merged = Enum.flat_map(results, fn
      {:ok, records} -> records
      {:error, _} -> []
    end)

    {:ok, merged}
  end

  defp normalize_records(records) do
    normalized = Enum.map(records, &PrismaticResolution.Normalizer.normalize/1)
    {:ok, normalized}
  end
end
```

## Normalization Stage

The normalization stage standardizes records from heterogeneous sources into a common format suitable for comparison:

```elixir
defmodule PrismaticResolution.Normalizer do
  @moduledoc "Record normalization for cross-source entity comparison."

  @spec normalize(map()) :: map()
  def normalize(record) do
    record
    |> normalize_name()
    |> normalize_address()
    |> normalize_phone()
    |> normalize_email()
    |> normalize_domain()
    |> add_normalization_metadata()
  end

  defp normalize_name(%{name: name} = record) when is_binary(name) do
    normalized =
      name
      |> String.trim()
      |> String.replace(~r/\s+/, " ")
      |> transliterate_diacritics()
      |> String.downcase()

    Map.put(record, :normalized_name, normalized)
  end

  defp normalize_name(record), do: record

  defp normalize_email(%{email: email} = record) when is_binary(email) do
    normalized =
      email
      |> String.trim()
      |> String.downcase()
      |> strip_email_aliases()

    Map.put(record, :normalized_email, normalized)
  end

  defp normalize_email(record), do: record

  defp strip_email_aliases(email) do
    case String.split(email, "@") do
      [local, domain] ->
        # Remove Gmail-style + aliases
        clean_local = local |> String.split("+") |> List.first()
        "#{clean_local}@#{domain}"

      _ ->
        email
    end
  end

  defp transliterate_diacritics(text) do
    text
    |> String.normalize(:nfd)
    |> String.replace(~r/[\x{0300}-\x{036f}]/u, "")
  end
end
```

| Normalization | Input | Output | Purpose |
|--------------|-------|--------|---------|
| **Name** | "Jan Novák" | "jan novak" | Diacritic removal, case folding |
| **Address** | "Ul. Karla IV 12/3" | "karla iv 12 3" | Street abbreviation expansion |
| **Phone** | "+420 123 456 789" | "420123456789" | Whitespace and prefix normalization |
| **Email** | "Jan.Novak+work@gmail.com" | "jan.novak@gmail.com" | Alias stripping, case folding |
| **Domain** | "www.Example.COM" | "example.com" | Protocol/www stripping, case folding |

## Matching Strategies

Entity resolution employs three complementary matching approaches:

| Strategy | Mechanism | Confidence | Speed | Example |
|----------|-----------|-----------|-------|---------|
| **Deterministic** | Exact match on unique identifiers | Very High (>0.95) | Fast | Same email, same tax ID, same domain |
| **Probabilistic** | Fuzzy similarity scoring across attributes | Variable (0.5-0.95) | Medium | Similar names + overlapping addresses |
| **Graph-Based** | Relationship pattern analysis | High (0.7-0.95) | Slow | Shared associates, co-registrations |

### Deterministic Matching

```elixir
defmodule PrismaticResolution.DeterministicMatcher do
  @moduledoc "Exact-match entity resolution on unique identifiers."

  @spec match(map(), map()) :: {:match, float()} | :no_match
  def match(record_a, record_b) do
    cond do
      match_email?(record_a, record_b) -> {:match, 0.99}
      match_tax_id?(record_a, record_b) -> {:match, 0.98}
      match_domain_registration?(record_a, record_b) -> {:match, 0.95}
      match_phone?(record_a, record_b) -> {:match, 0.90}
      true -> :no_match
    end
  end

  defp match_email?(a, b) do
    a[:normalized_email] != nil and a[:normalized_email] == b[:normalized_email]
  end

  defp match_tax_id?(a, b) do
    a[:tax_id] != nil and normalize_tax_id(a[:tax_id]) == normalize_tax_id(b[:tax_id])
  end

  defp match_domain_registration?(a, b) do
    a[:registrant_email] != nil and a[:registrant_email] == b[:registrant_email]
  end

  defp match_phone?(a, b) do
    a[:normalized_phone] != nil and a[:normalized_phone] == b[:normalized_phone]
  end

  defp normalize_tax_id(tax_id) when is_binary(tax_id) do
    String.replace(tax_id, ~r/[^0-9A-Z]/, "")
  end
end
```

### Probabilistic Matching

Probabilistic matching computes weighted similarity scores across multiple attributes:

| Attribute | Similarity Metric | Weight | Threshold |
|-----------|------------------|--------|-----------|
| **Person Name** | Jaro-Winkler distance | 0.30 | > 0.85 |
| **Organization** | Token-based Jaccard similarity | 0.25 | > 0.80 |
| **Address** | Geospatial distance + string similarity | 0.15 | < 500m or > 0.75 |
| **Phone** | Normalized exact match | 0.10 | Exact after normalization |
| **Date of Birth** | Exact or partial match | 0.10 | Exact or year+month |
| **Domain** | Levenshtein + TLD analysis | 0.10 | > 0.90 |

```elixir
defmodule PrismaticResolution.ProbabilisticMatcher do
  @moduledoc "Weighted probabilistic entity matching with configurable metrics."

  @type match_result :: {:match, float()} | {:candidate, float()} | :no_match

  @weights %{
    name: 0.30,
    organization: 0.25,
    address: 0.15,
    phone: 0.10,
    date_of_birth: 0.10,
    domain: 0.10
  }

  @spec match(map(), map()) :: match_result()
  def match(record_a, record_b) do
    scores = compute_attribute_scores(record_a, record_b)

    weighted_score =
      Enum.reduce(scores, 0.0, fn {attr, score}, acc ->
        acc + score * Map.get(@weights, attr, 0.0)
      end)

    total_weight =
      scores
      |> Enum.map(fn {attr, _score} -> Map.get(@weights, attr, 0.0) end)
      |> Enum.sum()

    normalized_score = if total_weight > 0, do: weighted_score / total_weight, else: 0.0

    cond do
      normalized_score >= 0.85 -> {:match, normalized_score}
      normalized_score >= 0.60 -> {:candidate, normalized_score}
      true -> :no_match
    end
  end

  defp compute_attribute_scores(a, b) do
    [
      {:name, jaro_winkler(a[:normalized_name], b[:normalized_name])},
      {:organization, jaccard_tokens(a[:organization], b[:organization])},
      {:address, address_similarity(a[:address], b[:address])},
      {:phone, exact_match(a[:normalized_phone], b[:normalized_phone])},
      {:domain, levenshtein_normalized(a[:domain], b[:domain])}
    ]
    |> Enum.reject(fn {_attr, score} -> is_nil(score) end)
  end

  defp jaro_winkler(nil, _), do: nil
  defp jaro_winkler(_, nil), do: nil
  defp jaro_winkler(a, b), do: String.jaro_distance(a, b)

  defp exact_match(nil, _), do: nil
  defp exact_match(_, nil), do: nil
  defp exact_match(a, b), do: if(a == b, do: 1.0, else: 0.0)
end
```

### Graph-Based Matching

Graph-based resolution analyzes relationship patterns in the [Knowledge Graph](/glossary/knowledge-graph/):

```elixir
defmodule PrismaticResolution.GraphMatcher do
  @moduledoc "Relationship pattern analysis for entity resolution."

  @spec shared_connections(String.t(), String.t()) :: {:ok, float()} | {:error, term()}
  def shared_connections(entity_a, entity_b) do
    with {:ok, neighbors_a} <- KnowledgeGraph.neighbors(entity_a),
         {:ok, neighbors_b} <- KnowledgeGraph.neighbors(entity_b) do
      set_a = MapSet.new(neighbors_a)
      set_b = MapSet.new(neighbors_b)

      shared = MapSet.intersection(set_a, set_b)
      total = MapSet.union(set_a, set_b)

      coefficient = if MapSet.size(total) > 0 do
        MapSet.size(shared) / MapSet.size(total)
      else
        0.0
      end

      {:ok, coefficient}
    end
  end

  @spec structural_equivalence(String.t(), String.t()) :: {:ok, float()} | {:error, term()}
  def structural_equivalence(entity_a, entity_b) do
    with {:ok, roles_a} <- KnowledgeGraph.roles(entity_a),
         {:ok, roles_b} <- KnowledgeGraph.roles(entity_b) do
      role_set_a = MapSet.new(roles_a)
      role_set_b = MapSet.new(roles_b)

      shared_roles = MapSet.intersection(role_set_a, role_set_b)
      total_roles = MapSet.union(role_set_a, role_set_b)

      score = if MapSet.size(total_roles) > 0 do
        MapSet.size(shared_roles) / MapSet.size(total_roles)
      else
        0.0
      end

      {:ok, score}
    end
  end
end
```

## Blocking Strategies

Without blocking, comparing N records requires N*(N-1)/2 pairwise comparisons. Blocking partitions records into groups that share a common attribute, dramatically reducing the comparison space:

| Blocking Strategy | Mechanism | Reduction | Risk |
|-------------------|-----------|-----------|------|
| **Exact Key** | Same first 3 chars of surname | ~100x | Misses misspellings |
| **Sorted Neighborhood** | Sliding window over sorted keys | ~50x | Window size trade-off |
| **Canopy** | Cheap distance metric pre-filter | ~200x | Threshold sensitivity |
| **LSH (Locality-Sensitive Hashing)** | Hash-based approximate matching | ~500x | Probability of missing matches |
| **Phonetic** | Soundex/Metaphone encoding | ~100x | Language-dependent |
| **Multi-key** | Union of multiple blocking keys | ~50x | Better recall, more comparisons |

```elixir
defmodule PrismaticResolution.Blocker do
  @moduledoc "Blocking strategies to reduce comparison space from O(n^2)."

  @spec generate_blocks([map()], atom()) :: {:ok, %{String.t() => [map()]}} | {:error, term()}
  def generate_blocks(records, strategy \\ :multi_key) do
    blocks = case strategy do
      :exact_key -> exact_key_blocking(records)
      :phonetic -> phonetic_blocking(records)
      :multi_key -> multi_key_blocking(records)
      :sorted_neighborhood -> sorted_neighborhood_blocking(records, window_size: 10)
    end

    {:ok, blocks}
  end

  defp multi_key_blocking(records) do
    # Generate multiple blocking keys per record for higher recall
    Enum.reduce(records, %{}, fn record, blocks ->
      keys = generate_blocking_keys(record)
      Enum.reduce(keys, blocks, fn key, acc ->
        Map.update(acc, key, [record], &[record | &1])
      end)
    end)
  end

  defp generate_blocking_keys(record) do
    [
      name_key(record[:normalized_name]),
      email_domain_key(record[:normalized_email]),
      phone_prefix_key(record[:normalized_phone]),
      address_postal_key(record[:postal_code])
    ]
    |> Enum.reject(&is_nil/1)
  end

  defp name_key(nil), do: nil
  defp name_key(name), do: "name:" <> String.slice(name, 0, 4)

  defp email_domain_key(nil), do: nil
  defp email_domain_key(email) do
    case String.split(email, "@") do
      [_, domain] -> "email_domain:" <> domain
      _ -> nil
    end
  end
end
```

## Confidence Calibration

Entity resolution confidence must be calibrated so that stated confidence matches actual accuracy. A system claiming 90% confidence should be correct 90% of the time:

| Confidence Range | Meaning | Action in Prismatic |
|-----------------|---------|---------------------|
| **0.95-1.00** | Near-certain match (deterministic) | Auto-merge into master entity |
| **0.80-0.95** | High-confidence probabilistic match | Auto-merge with provenance flag |
| **0.60-0.80** | Candidate match | Queue for analyst review |
| **0.40-0.60** | Uncertain association | Preserve as candidate, do not merge |
| **0.00-0.40** | Likely distinct entities | No link created |

All confidence scores are subject to [NABLA Infinity](/glossary/nabla-infinity/) axiom compliance:
- **Signal Plurality**: Link must be supported by 2+ independent signals
- **Provenance Mandatory**: Every contributing match factor must be traceable
- **Time Decay**: Confidence decreases as source data ages
- **Contradiction Preservation**: Contradicting evidence is preserved, not discarded

## OSINT Source Integration

Entity resolution across OSINT sources presents unique challenges due to source heterogeneity:

| Source Type | Identifiers Available | Quality | Coverage |
|------------|----------------------|---------|----------|
| **Domain WHOIS** | Registrant name, email, org | Declining (GDPR) | Global domains |
| **Certificate Transparency** | Domain, organization, issuer | High | All public TLS certs |
| **Business Registry** | Legal name, tax ID, address | High | Jurisdiction-specific |
| **Social Media** | Username, display name, bio | Variable | Platform-specific |
| **DNS Records** | Domain, IP, nameservers | High | All public domains |
| **[Shodan](/glossary/shodan/)** | IP, ports, banners, hostnames | High | Internet-facing services |
| **[Censys](/glossary/censys/)** | Certificates, hosts, protocols | High | Internet-wide scanning |
| **[GreyNoise](/glossary/greynoise/)** | IP, classification, tags | High | Internet noise sources |
| **Czech Registries** | ICO, legal name, officers, address | Very High | Czech Republic |
| **Sanctions Lists** | Name, aliases, identifiers | High | EU, US, UN coverage |

## Cross-Jurisdictional Challenges

Entity resolution across jurisdictions introduces additional complexity:

| Challenge | Description | Mitigation |
|-----------|-------------|------------|
| **Name transliteration** | Same name in Latin, Cyrillic, Arabic scripts | Multi-script normalization |
| **Address formats** | Different postal conventions per country | Country-specific address parsers |
| **Identifier formats** | Tax IDs, company numbers vary by jurisdiction | Format registry and normalizer |
| **Privacy regulations** | GDPR, CCPA restrict cross-border data linking | Jurisdiction-aware consent tracking |
| **Corporate structures** | Subsidiaries, holdings, beneficial ownership | Graph-based corporate tree resolution |
| **Name conventions** | Patronymics, matronymics, multiple surnames | Culture-aware name parsing |

## Performance Considerations

Entity resolution at scale requires careful performance optimization:

| Scale | Records | Naive Comparisons | With Blocking | Time (approx) |
|-------|---------|-------------------|---------------|---------------|
| Small | 1,000 | 500,000 | 5,000 | < 1 second |
| Medium | 100,000 | 5 billion | 500,000 | < 1 minute |
| Large | 10,000,000 | 50 trillion | 50,000,000 | < 1 hour |

The Prismatic Platform uses [Broadway](/glossary/broadway/) for [stream processing](/glossary/stream-processing/) of resolution pipelines, enabling real-time resolution of incoming intelligence as it arrives rather than batch-processing accumulated records.

```elixir
defmodule PrismaticResolution.StreamResolver do
  @moduledoc "Real-time entity resolution using Broadway stream processing."

  use Broadway

  @spec start_link(keyword()) :: {:ok, pid()} | {:error, term()}
  def start_link(opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [
        module: {BroadwayRabbitMQ.Producer, queue: "entity_resolution"},
        concurrency: Keyword.get(opts, :concurrency, 5)
      ],
      processors: [
        default: [concurrency: 10, max_demand: 50]
      ],
      batchers: [
        knowledge_graph: [concurrency: 2, batch_size: 100, batch_timeout: 5_000]
      ]
    )
  end

  @impl true
  def handle_message(_, message, _) do
    record = Jason.decode!(message.data)
    resolved = resolve_single_record(record)

    message
    |> Message.update_data(fn _ -> resolved end)
    |> Message.put_batcher(:knowledge_graph)
  end

  @impl true
  def handle_batch(:knowledge_graph, messages, _batch_info, _context) do
    entities = Enum.map(messages, & &1.data)
    PrismaticResolution.KnowledgeGraphIntegrator.batch_upsert(entities)
    messages
  end
end
```

## Related Terms

- [Knowledge Graph](/glossary/knowledge-graph/) - Graph structure storing resolved entity relationships
- [Ontology](/glossary/ontology/) - Schema defining entity types and relationship categories
- [Data Pipeline](/glossary/data-pipeline/) - Infrastructure for processing resolution workflows
- [NABLA Infinity](/glossary/nabla-infinity/) - Epistemic framework governing resolution confidence
- [Trinity Gate](/glossary/trinity-gate/) - Verification of resolution assertions
- [Confidence Scoring](/glossary/confidence-scoring/) - Calibrated match confidence assignment
- [Signal Plurality](/glossary/signal-plurality/) - Minimum evidence requirement for entity links
- [Provenance Mandatory](/glossary/provenance-mandatory/) - Traceability requirement for all resolution evidence
- [Stream Processing](/glossary/stream-processing/) - Real-time resolution pipeline execution
- [Shodan](/glossary/shodan/) - OSINT source providing infrastructure intelligence for resolution
- [Censys](/glossary/censys/) - Certificate and host data for entity correlation
- [Broadway](/glossary/broadway/) - Stream processing framework for resolution pipelines

## See Also

- [Agents](/agents/) - Entity resolution agents in the AIAD ecosystem
- [Architecture](/architecture/) - Intelligence processing architecture

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
