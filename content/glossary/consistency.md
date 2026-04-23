+++
title = "Consistency"
weight = 50
[extra]
description = "A data quality dimension ensuring that data values across multiple sources, records, and time periods do not contradict each other and follow defined rules"
category = "data-quality"
related_terms = ["completeness", "accuracy", "cap-theorem", "acid-transactions", "configuration-drift"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["consistency", "data quality", "data consistency", "eventual consistency", "strong consistency", "CAP theorem", "glossary", "Prismatic Platform"]
tags = ["glossary", "data-quality", "architecture"]
quality_score = 78
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Consistency - Prismatic Platform"
+++

## Definition & Overview

Consistency is a multi-dimensional quality attribute in data management and distributed systems. As a data quality dimension, consistency means that data values across multiple sources, records, and time periods do not contradict each other and adhere to defined business rules, format standards, and referential constraints. As a distributed systems property (the "C" in CAP theorem and ACID), consistency means that all nodes in a system see the same data at the same time.

Data consistency operates at several levels: format consistency (dates always in ISO 8601), referential consistency (foreign keys point to existing records), cross-source consistency (the same entity has the same attributes across different databases), temporal consistency (data states are valid for their respective time periods), and semantic consistency (values make logical sense given domain rules).

The Prismatic Platform manages consistency challenges across its heterogeneous storage backends (PostgreSQL, ETS, Redis, Meilisearch, KuzuDB) and multiple data sources (157 OSINT tools, 4 DD sources, external APIs). The platform embraces eventual consistency for read-heavy OSINT operations while maintaining strong consistency for critical state (quality DNA, audit trails, compliance records). The NABLA Infinity framework's Contradiction Preservation axiom provides a unique approach to consistency -- rather than forcing consistency at all costs, it preserves inconsistencies as information.

## Technical Deep Dive

### Consistency Models

| Model | Guarantee | Latency | Use Case |
|-------|-----------|---------|----------|
| **Strong (Linearizable)** | Latest write visible to all reads | Higher | Financial, audit trails |
| **Sequential** | All operations appear in same order | Medium | Event ordering |
| **Causal** | Causally related ops in order | Medium | Chat, collaboration |
| **Eventual** | All replicas converge eventually | Lowest | OSINT cache, search index |
| **Read-your-writes** | Writer sees own latest write | Low | User session data |

### Cross-Source Consistency Checker

```elixir
defmodule PrismaticOsintCore.ConsistencyChecker do
  @moduledoc """
  Checks consistency of entity data across multiple OSINT sources.
  Identifies contradictions between sources and applies NABLA's
  Contradiction Preservation axiom rather than forcing resolution.
  """

  @type consistency_report :: %{
    entity_id: String.t(),
    attribute: String.t(),
    sources: [%{source: String.t(), value: term(), confidence: float()}],
    status: :consistent | :inconsistent | :single_source,
    contradiction: map() | nil
  }

  @spec check_entity(String.t(), [map()]) :: [consistency_report()]
  def check_entity(entity_id, source_results) do
    attributes = extract_all_attributes(source_results)

    Enum.map(attributes, fn attr ->
      values_by_source = extract_attribute_values(source_results, attr)

      unique_values = values_by_source
      |> Enum.map(& &1.value)
      |> Enum.uniq()

      status = cond do
        length(values_by_source) <= 1 -> :single_source
        length(unique_values) == 1 -> :consistent
        true -> :inconsistent
      end

      contradiction = if status == :inconsistent do
        %{
          attribute: attr,
          values: unique_values,
          sources: Enum.map(values_by_source, & &1.source),
          preserved: true,
          resolution: :none
        }
      end

      %{
        entity_id: entity_id,
        attribute: attr,
        sources: values_by_source,
        status: status,
        contradiction: contradiction
      }
    end)
  end

  defp extract_all_attributes(results) do
    results
    |> Enum.flat_map(&Map.keys(&1.attributes))
    |> Enum.uniq()
  end

  defp extract_attribute_values(results, attr) do
    results
    |> Enum.filter(&Map.has_key?(&1.attributes, attr))
    |> Enum.map(fn result ->
      %{
        source: result.source_name,
        value: Map.get(result.attributes, attr),
        confidence: result.confidence
      }
    end)
  end
end
```

### Storage Consistency Strategy

```elixir
defmodule PrismaticStorage.ConsistencyStrategy do
  @moduledoc """
  Defines consistency strategy per storage backend and data type.
  Critical data uses strong consistency (PostgreSQL transactions).
  Read-heavy data uses eventual consistency (ETS + async sync).
  """

  @type strategy :: :strong | :eventual | :read_your_writes

  @spec strategy_for(atom()) :: strategy()
  def strategy_for(:audit_trail), do: :strong
  def strategy_for(:consent_records), do: :strong
  def strategy_for(:quality_dna), do: :strong
  def strategy_for(:dd_entities), do: :strong
  def strategy_for(:osint_cache), do: :eventual
  def strategy_for(:search_index), do: :eventual
  def strategy_for(:tool_registry), do: :read_your_writes
  def strategy_for(:session_data), do: :read_your_writes
  def strategy_for(_), do: :eventual
end
```

## Architecture & Implementation

The Prismatic Platform uses a polyglot persistence architecture where each storage backend provides different consistency guarantees. PostgreSQL (via Ecto with ACID transactions) provides strong consistency for critical state: DD entities, audit trails, consent records, and quality metadata. ETS provides single-node consistency with sub-microsecond access for registries (OSINT ToolRegistry, Academy TopicRegistry, DD SourceRegistry). Redis provides eventual consistency for distributed caching. Meilisearch provides eventual consistency for full-text search indexes.

The platform's approach to cross-source data consistency is philosophically distinct from traditional approaches. Rather than forcing all sources to agree (which would require discarding data), the NABLA Infinity framework's Contradiction Preservation axiom mandates that inconsistencies be preserved as information. When two OSINT tools return different values for the same entity attribute, both values are stored with their respective confidence scores, and the inconsistency is flagged for analyst review.

This approach recognizes that inconsistency in intelligence data often carries more information than consistency. If three government databases agree on an entity's address but one commercial database disagrees, the disagreement itself is a signal worth investigating -- it could indicate a recent move, a data entry error, or deliberate obfuscation.

## Usage in Prismatic Platform

The DD pipeline's Loader phase uses content-hash-based diff detection to identify changes in entity data across load runs. When a source provides data inconsistent with previously loaded data, the diff is recorded in `dd_load_runs` rather than silently overwriting. This preserves the temporal consistency of the entity database and enables change tracking.

The Quality DNA system enforces consistency between sessions. The quality score, violation counts, and compliance metrics must be consistent with the previous session's state unless explicit changes occurred. Unexpected changes trigger drift detection and potential quality floor violations.

The Perimeter security rating system tracks consistency of external configurations over time. Organizations whose public-facing configurations remain consistent across assessment scans receive higher stability scores than those exhibiting frequent changes, as consistency correlates with mature change management practices.

## Cross-References

- [Completeness](/glossary/completeness/) - complementary data quality dimension
- [Accuracy](/glossary/accuracy/) - data correctness complementing consistency
- [CAP Theorem](/glossary/cap-theorem/) - consistency-availability-partition tolerance trade-off
- [ACID Transactions](/glossary/acid-transactions/) - transactional consistency guarantees
- [Configuration Drift](/glossary/configuration-drift/) - consistency loss over time
- **Livebooks**: `livebooks/domains/storage_data/` - consistency model experiments
- **Academy**: Distributed systems and data quality topics

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
