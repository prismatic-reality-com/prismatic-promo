+++
title = "Knowledge Graph"
weight = 46
[extra]
category = "intelligence"
subcategory = "data-structures"
description = "Graph-structured knowledge representation connecting entities through typed relationships for intelligence and security analysis"
keywords = ["graph-database", "kuzu", "cypher", "entity-resolution", "osint", "attack-surface", "infrastructure-mapping", "relationship-analysis"]
related_terms = ["ontology", "entity-resolution", "belief-graph", "vector-database", "domain-driven-design", "confidence-scoring", "signal-plurality", "provenance-mandatory"]
complexity = "intermediate"
implementation_guide = "yes"
code_examples = "yes"
best_practices = "yes"
use_cases = ["easm", "threat-intelligence", "osint-fusion", "attack-path-analysis"]
prerequisites = ["graph-theory", "elixir-basics", "ets-tables"]
learning_path = ["ontology", "entity-resolution", "kuzu-db", "cypher-queries"]
difficulty = "intermediate"
time_to_learn = "2-3 weeks"
industry_usage = "high"
pattern_type = "data-structure"
architecture_layer = "data"
quality_gates = ["performance", "consistency", "completeness"]
testing_approach = ["property-based", "graph-traversal", "relationship-validation"]
monitoring = ["query-performance", "graph-size", "update-latency"]
scalability = "horizontal"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1412
date_created = "2026-02-23"
date_modified = "2026-02-23"
tags = ["glossary", "intelligence", "knowledge-graph", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Knowledge Graph - Prismatic Platform"
+++

## Definition

A knowledge graph is a structured representation of real-world entities and their relationships, stored as a directed, labeled graph where nodes represent entities (people, organizations, domains, IP addresses, certificates, concepts) and edges represent typed, semantically meaningful relationships between them. Unlike tabular databases where relationships are implicit in foreign keys and reconstructed through joins, knowledge graphs make relationships first-class citizens -- queryable, traversable, and reasoned over directly. This representation enables capabilities that are impractical with relational data alone: multi-hop relationship discovery ("which organizations share certificate authorities with the target?"), path analysis ("what is the shortest chain of relationships connecting entity A to entity B?"), and pattern detection ("find all entities matching a known attack infrastructure pattern").

The concept has roots in artificial intelligence research dating to the 1960s (semantic networks) and was popularized in its modern form by Google's 2012 Knowledge Graph, which structured factual knowledge to enhance search results. In the security and intelligence domain, knowledge graphs serve a different purpose: they represent observed relationships between infrastructure elements, organizational connections, and threat indicators, enabling analysts to discover indirect exposure paths and hidden connections that no single data source reveals.

The Prismatic Platform uses KuzuDB as its graph database for building intelligence knowledge graphs. OSINT data from multiple providers -- [Shodan](@/glossary/shodan.md), [Censys](@/glossary/censys.md), [GreyNoise](@/glossary/greynoise.md), DNS records, certificate transparency logs, WHOIS data -- is fused into a unified knowledge graph where entities are connected through discovered relationships. The Prismatic Perimeter maps [attack surfaces](@/glossary/attack-surface.md) as knowledge graphs, enabling relationship traversal to discover indirect exposure paths and supply chain risks that are invisible in isolated data views.

## Graph Data Model

### Nodes, Edges, and Properties

The knowledge graph uses a property graph model where both nodes and edges carry typed attributes:

| Component | Description | Example |
|-----------|-------------|---------|
| **Node** | Entity with a type and properties | `Domain{name: "example.com", registered: 2020-01-15}` |
| **Edge** | Typed, directed relationship between nodes | `Domain --[RESOLVES_TO]--> IPAddress` |
| **Property** | Key-value attribute on node or edge | `confidence: 0.95, source: "censys"` |
| **Label** | Type classification for nodes | `:Domain`, `:IPAddress`, `:Certificate`, `:Organization` |

```
                    +----------------+
                    |  Organization  |
                    |  "Acme Corp"   |
                    +-------+--------+
                            |
                    [OPERATES]
                            |
                    +-------v--------+         +------------------+
                    |    Domain      |---[ISSUED_FOR]-->| Certificate    |
                    | "example.com"  |         | Let's Encrypt    |
                    +-------+--------+         +------------------+
                            |
                    [RESOLVES_TO]
                            |
                    +-------v--------+
                    |   IPAddress    |
                    | "93.184.216.34"|
                    +-------+--------+
                            |
                    [EXPOSES]
                            |
                    +-------v--------+
                    |    Service     |
                    |  "HTTPS:443"   |
                    +----------------+
```

### Node Types in the EASM Ontology

| Node Type | Properties | Relationships |
|-----------|-----------|---------------|
| `Domain` | name, registered, registrar, status | RESOLVES_TO, HAS_SUBDOMAIN, OPERATED_BY |
| `IPAddress` | address, version, asn, geolocation | HOSTS, EXPOSES, BELONGS_TO_RANGE |
| `Certificate` | serial, issuer, not_before, not_after | ISSUED_FOR, SIGNED_BY, SUPERSEDES |
| `Service` | port, protocol, product, version | RUNS_ON, DEPENDS_ON, VULNERABLE_TO |
| `Organization` | name, industry, country, size | OPERATES, OWNS, SUBSIDIARY_OF |
| `Vulnerability` | cve_id, cvss, description | AFFECTS, EXPLOITED_BY |

## KuzuDB Integration

The platform uses KuzuDB, an embedded graph database optimized for analytical queries on property graphs. KuzuDB provides:

- **Cypher-compatible query language**: Familiar graph query syntax for relationship traversal
- **Columnar storage**: Efficient analytical queries over large graphs
- **Embedded deployment**: No separate database server; runs within the BEAM process
- **ACID transactions**: Consistent graph mutations

```elixir
defmodule PrismaticStorage.KuzuDB.KnowledgeGraph do
  @moduledoc "Knowledge graph operations using KuzuDB."

  def discover_attack_path(source_domain, target_entity) do
    query = """
    MATCH path = shortestPath(
      (source:Domain {name: $source})-[*1..5]-(target {id: $target})
    )
    RETURN path, length(path) as distance
    """
    execute_query(query, %{source: source_domain, target: target_entity})
  end

  def find_shared_infrastructure(domain_a, domain_b) do
    query = """
    MATCH (a:Domain {name: $domain_a})-[:RESOLVES_TO]->(ip:IPAddress)
          <-[:RESOLVES_TO]-(b:Domain {name: $domain_b})
    RETURN ip.address, a.name, b.name
    """
    execute_query(query, %{domain_a: domain_a, domain_b: domain_b})
  end

  def enumerate_attack_surface(organization) do
    query = """
    MATCH (org:Organization {name: $org})-[:OPERATES]->(d:Domain)
          -[:RESOLVES_TO]->(ip:IPAddress)-[:EXPOSES]->(s:Service)
    OPTIONAL MATCH (s)-[:VULNERABLE_TO]->(v:Vulnerability)
    RETURN d.name, ip.address, s.port, s.protocol,
           collect(v.cve_id) as vulnerabilities
    ORDER BY size(vulnerabilities) DESC
    """
    execute_query(query, %{org: organization})
  end
end
```

## Multi-Source Intelligence Fusion

The knowledge graph's primary value lies in fusing intelligence from heterogeneous sources into a unified representation. Each OSINT source provides a partial view; the knowledge graph assembles the complete picture.

### Source Integration Pipeline

```
Shodan --------+
               |
Censys --------+----> Entity Extraction ----> Entity Resolution ----> Graph Merge
               |           |                        |                      |
GreyNoise -----+     Extract nodes/edges    Deduplicate across     Merge into unified
               |     from raw responses     sources using          knowledge graph
DNS Records ---+                            matching rules         with provenance
               |
CT Logs -------+
```

### Entity Resolution

[Entity resolution](@/glossary/entity-resolution.md) is the process of determining when entities from different sources refer to the same real-world thing. An IP address appearing in Shodan, Censys, and DNS records should be merged into a single node with properties from all sources.

| Resolution Strategy | Description | Confidence |
|--------------------|-------------|------------|
| **Exact match** | Identical identifier (IP, domain name) | 1.0 |
| **Certificate fingerprint** | Same certificate serial/fingerprint | 0.95 |
| **Behavioral correlation** | Similar services, timing, configuration | 0.70-0.85 |
| **Organizational linkage** | WHOIS, ASN, hosting provider match | 0.60-0.80 |

Each resolved entity carries a [confidence score](@/glossary/confidence-scoring.md) reflecting the certainty of the resolution, satisfying [NABLA Infinity](@/glossary/nabla-infinity.md)'s [signal plurality](@/glossary/signal-plurality.md) axiom -- entities confirmed by multiple independent sources receive higher confidence.

## Relationship to Belief Graphs

The [belief graph](@/glossary/belief-graph.md) is a specialized knowledge graph within the Prismatic Platform's epistemic infrastructure. While the EASM knowledge graph models factual observations (domains, IPs, certificates), the belief graph models epistemic states -- what the platform believes to be true, with what confidence, based on what evidence.

| Dimension | Knowledge Graph (EASM) | Belief Graph (Epistemic) |
|-----------|----------------------|------------------------|
| **Content** | Observed infrastructure facts | Beliefs with confidence levels |
| **Edges** | Infrastructure relationships | Evidential support relationships |
| **Mutation** | Updated on new observations | Updated through [epistemic pipeline](@/glossary/epistemic-pipeline.md) |
| **Confidence** | Source-level confidence per edge | System-level confidence per belief |
| **Verification** | Cross-source corroboration | [Trinity Gate](@/glossary/trinity-gate.md) passage |
| **Provenance** | Source attribution per node/edge | Full inference chain per belief |

The two graphs are complementary: the knowledge graph provides the factual foundation from which beliefs are derived, and the belief graph provides the epistemic framework for reasoning about those facts.

## Graph Analytics for Security Assessment

The knowledge graph enables graph-theoretic analysis for security assessment:

### Centrality Analysis

Nodes with high centrality (many connections) represent critical infrastructure -- compromising them affects many other entities.

| Metric | Security Meaning | Use Case |
|--------|-----------------|----------|
| **Degree centrality** | Number of direct connections | Identify most-connected infrastructure |
| **Betweenness centrality** | Frequency on shortest paths | Identify critical routing infrastructure |
| **PageRank** | Importance based on incoming link quality | Rank assets by exposure significance |

### Community Detection

Graph clustering algorithms identify groups of tightly connected entities that may represent organizational boundaries, shared infrastructure, or common threat exposure.

### Path Analysis

Multi-hop path queries discover indirect relationships that reveal supply chain risks, shared hosting exposure, and lateral movement opportunities:

```elixir
# Find all paths from a domain to any known vulnerable service
def find_vulnerability_paths(domain, max_hops \\ 3) do
  query = """
  MATCH path = (d:Domain {name: $domain})-[*1..#{max_hops}]->
        (s:Service)-[:VULNERABLE_TO]->(v:Vulnerability)
  WHERE v.cvss >= 7.0
  RETURN path, v.cve_id, v.cvss
  ORDER BY v.cvss DESC
  """
  execute_query(query, %{domain: domain})
end
```

## Provenance and Time Decay

Every node and edge in the knowledge graph carries [provenance](@/glossary/provenance-mandatory.md) metadata -- the source that reported it, the time of observation, and the confidence level. This provenance enables [time decay](@/glossary/time-decay.md): observations that have not been confirmed recently receive decreasing confidence, reflecting the reality that internet infrastructure changes constantly.

```elixir
# Edge with provenance and temporal metadata
%GraphEdge{
  source: "domain:example.com",
  target: "ip:93.184.216.34",
  type: :resolves_to,
  properties: %{
    first_observed: ~U[2025-06-15T10:30:00Z],
    last_confirmed: ~U[2026-01-28T14:22:00Z],
    source: :censys,
    confidence: 0.98,
    observation_count: 47
  }
}
```

## Query Performance and Optimization

Knowledge graph queries require careful optimization for security analytics workloads. The platform employs several strategies to ensure sub-second response times even on graphs containing millions of nodes and edges:

### Index Strategy

```elixir
defmodule PrismaticStorage.KuzuDB.IndexStrategy do
  @moduledoc """
  Knowledge graph indexing for optimal query performance.
  """

  def create_security_indexes() do
    indexes = [
      # Node-level indexes for fast entity lookup
      "CREATE INDEX ON :Domain(name)",
      "CREATE INDEX ON :IPAddress(address)",
      "CREATE INDEX ON :Certificate(serial_number)",
      "CREATE INDEX ON :Service(port, protocol)",

      # Relationship indexes for traversal optimization
      "CREATE INDEX ON (:Domain)-[:RESOLVES_TO]->(:IPAddress)",
      "CREATE INDEX ON (:Service)-[:VULNERABLE_TO]->(:Vulnerability)",

      # Composite indexes for complex queries
      "CREATE INDEX ON :Vulnerability(cvss, published_date)",
      "CREATE INDEX ON :Organization(industry, country)"
    ]

    Enum.each(indexes, &execute_ddl/1)
  end

  @spec optimize_attack_surface_query(String.t()) :: String.t()
  def optimize_attack_surface_query(organization) do
    """
    // Optimized query using index hints and result limits
    MATCH (org:Organization {name: $org})
    USING INDEX org:Organization(name)
    MATCH (org)-[:OPERATES]->(d:Domain)
    MATCH (d)-[:RESOLVES_TO]->(ip:IPAddress)
    MATCH (ip)-[:EXPOSES]->(s:Service)
    OPTIONAL MATCH (s)-[:VULNERABLE_TO]->(v:Vulnerability)
    WHERE v.cvss >= 7.0 OR v IS NULL
    RETURN d.name, ip.address, s.port, s.protocol,
           collect(v.cve_id)[..10] as top_vulns
    ORDER BY size(collect(v.cve_id)) DESC
    LIMIT 1000
    """
  end
end
```

### Query Pattern Optimization

| Pattern | Optimization Strategy | Performance Gain |
|---------|----------------------|------------------|
| **Shortest Path** | Bidirectional search with depth limits | 100-500x faster |
| **Subgraph Extraction** | Boundary filtering with property predicates | 50-100x faster |
| **Centrality Analysis** | Incremental updates with caching | 10-50x faster |
| **Pattern Matching** | Index-backed node filtering | 20-100x faster |

## Integration with Belief Systems

The knowledge graph serves as the foundational layer for [epistemic reasoning](@/glossary/epistemic-robustness.md) within the Prismatic Platform. Raw observations are transformed into beliefs through a structured pipeline that maintains [provenance](@/glossary/provenance-mandatory.md) and confidence tracking:

```elixir
defmodule PrismaticIntelligence.BeliefDerivation do
  @moduledoc """
  Derives beliefs from knowledge graph observations.
  """

  @spec derive_threat_belief(String.t(), map()) :: {:ok, Belief.t()} | {:error, term()}
  def derive_threat_belief(target_domain, context) do
    with {:ok, attack_paths} <- KnowledgeGraph.discover_attack_paths(target_domain),
         {:ok, vulnerabilities} <- KnowledgeGraph.enumerate_vulnerabilities(target_domain),
         {:ok, threat_indicators} <- correlate_threat_indicators(attack_paths, vulnerabilities) do

      belief = %Belief{
        proposition: "#{target_domain} is at elevated threat risk",
        confidence: calculate_composite_confidence(threat_indicators),
        evidence: compile_evidence_chain(attack_paths, vulnerabilities),
        provenance: extract_source_provenance(threat_indicators),
        derived_at: DateTime.utc_now()
      }

      {:ok, belief}
    end
  end

  defp calculate_composite_confidence(indicators) do
    # Apply NABLA Infinity signal plurality requirements
    source_count = indicators |> Enum.map(&(&1.source)) |> Enum.uniq() |> length()
    base_confidence = Enum.map(indicators, &(&1.confidence)) |> Statistics.mean()

    # Confidence boost for multiple independent sources
    plurality_bonus = min(0.2, (source_count - 1) * 0.05)
    min(1.0, base_confidence + plurality_bonus)
  end
end
```

## Scalability and Distribution

As knowledge graphs grow to enterprise scale (millions of nodes, billions of relationships), the platform employs several strategies to maintain performance and availability:

### Horizontal Scaling Strategy

```elixir
defmodule PrismaticStorage.KuzuDB.ClusterCoordinator do
  @moduledoc """
  Coordinates knowledge graph operations across multiple KuzuDB instances.
  """

  def partition_graph_by_domain(graph_data) do
    partitions = %{
      infrastructure: filter_nodes(graph_data, [:Domain, :IPAddress, :Service]),
      certificates: filter_nodes(graph_data, [:Certificate, :CertificateAuthority]),
      organizations: filter_nodes(graph_data, [:Organization, :Person]),
      threats: filter_nodes(graph_data, [:Vulnerability, :ThreatActor, :IOC])
    }

    # Ensure cross-partition relationships are replicated
    cross_partition_edges = identify_cross_partition_relationships(partitions)
    replicate_edges_across_partitions(cross_partition_edges)

    partitions
  end

  @spec federated_query(String.t(), map()) :: {:ok, [map()]} | {:error, term()}
  def federated_query(cypher_query, params) do
    # Parse query to identify required partitions
    required_partitions = analyze_query_requirements(cypher_query)

    # Execute subqueries on relevant partitions
    subquery_results = Enum.map(required_partitions, fn partition ->
      Task.async(fn -> execute_partition_query(partition, cypher_query, params) end)
    end)
    |> Task.await_many(30_000)

    # Merge results maintaining graph structure
    merge_federated_results(subquery_results)
  end
end
```

## Security and Access Control

Knowledge graphs contain sensitive intelligence data requiring robust security controls:

```elixir
defmodule PrismaticStorage.KuzuDB.SecurityLayer do
  @moduledoc """
  Security controls for knowledge graph access.
  """

  @spec authorize_query(User.t(), String.t()) :: :authorized | {:denied, String.t()}
  def authorize_query(%User{clearance_level: level, domains: allowed_domains}, query) do
    case analyze_query_sensitivity(query) do
      {:public, _nodes} -> :authorized
      {:sensitive, nodes} -> check_domain_access(nodes, allowed_domains)
      {:classified, _nodes} when level >= :secret -> :authorized
      {:classified, _nodes} -> {:denied, "Insufficient clearance level"}
    end
  end

  def apply_row_level_security(query_results, %User{} = user) do
    Enum.filter(query_results, fn result ->
      case extract_classification(result) do
        level when level <= user.clearance_level -> true
        _ -> false
      end
    end)
  end

  @spec audit_query_access(User.t(), String.t(), term()) :: :ok
  def audit_query_access(user, query, results) do
    audit_entry = %{
      user_id: user.id,
      query_hash: :crypto.hash(:sha256, query) |> Base.encode16(),
      result_count: length(results),
      accessed_at: DateTime.utc_now(),
      classification_levels: extract_accessed_classifications(results)
    }

    PrismaticAudit.log_graph_access(audit_entry)
  end
end
```

## Machine Learning Integration

The knowledge graph serves as a rich feature source for machine learning models used in threat detection and risk assessment:

```elixir
defmodule PrismaticML.GraphFeatures do
  @moduledoc """
  Extract ML features from knowledge graph structure and properties.
  """

  @spec extract_node_features(String.t(), String.t()) :: {:ok, [float()]} | {:error, term()}
  def extract_node_features(node_id, node_type) do
    features = [
      calculate_degree_centrality(node_id),
      calculate_betweenness_centrality(node_id),
      calculate_clustering_coefficient(node_id),
      extract_temporal_features(node_id),
      encode_categorical_properties(node_id, node_type)
    ]
    |> List.flatten()

    {:ok, features}
  end

  def build_threat_prediction_dataset(time_window) do
    threat_nodes = """
    MATCH (n)-[:VULNERABLE_TO|:EXPLOITED_BY]->()
    WHERE n.last_observed >= $start_time
    RETURN n.id, labels(n)[0] as type
    """

    benign_nodes = """
    MATCH (n)
    WHERE NOT (n)-[:VULNERABLE_TO|:EXPLOITED_BY]->()
    AND n.last_observed >= $start_time
    RETURN n.id, labels(n)[0] as type
    LIMIT 10000
    """

    with {:ok, threat_data} <- execute_query(threat_nodes, %{start_time: time_window}),
         {:ok, benign_data} <- execute_query(benign_nodes, %{start_time: time_window}) do

      # Extract features for both threat and benign nodes
      threat_features = Enum.map(threat_data, &extract_labeled_features(&1, :threat))
      benign_features = Enum.map(benign_data, &extract_labeled_features(&1, :benign))

      {:ok, %{features: threat_features ++ benign_features,
              labels: List.duplicate(1, length(threat_features)) ++
                     List.duplicate(0, length(benign_features))}}
    end
  end
end
```

## Industry Applications and Use Cases

Knowledge graphs have found widespread adoption across multiple industries for intelligence and analytics applications. In cybersecurity, they enable threat hunting and attack surface mapping. In finance, they power anti-money laundering (AML) and know-your-customer (KYC) processes. In healthcare, they model patient relationships and drug interactions. The Prismatic Platform's knowledge graph implementation addresses several critical use cases:

### External Attack Surface Management (EASM)

Organizations need comprehensive visibility into their internet-facing assets and the relationships between them. Traditional asset discovery tools provide lists of domains and IP addresses, but knowledge graphs reveal the connections that matter for security assessment.

### Threat Intelligence Correlation

Threat indicators rarely exist in isolation. A malicious domain might share hosting infrastructure with other domains, use certificates from the same authority, or resolve to IP addresses in the same ASN. Knowledge graphs enable analysts to discover these connections automatically, building a complete picture of threat actor infrastructure.

### Supply Chain Risk Assessment

Modern organizations depend on complex supply chains where a compromise at one vendor can cascade through multiple business relationships. Knowledge graphs model these business relationships, enabling risk assessment that considers indirect exposure through third-party vendors.

### Regulatory Compliance

Compliance frameworks like NIS2 and SOC 2 require organizations to understand their full attack surface, including indirect exposure through vendors and service providers. Knowledge graphs provide the relationship mapping necessary to demonstrate compliance with these requirements.

## Related Terms

- [Ontology](@/glossary/ontology.md) -- Formal schema defining entity types and relationship semantics for the graph
- [Entity Resolution](@/glossary/entity-resolution.md) -- Deduplication of entities across multiple data sources
- [Belief Graph](@/glossary/belief-graph.md) -- Epistemic specialized graph for reasoning under uncertainty
- [Vector Database](@/glossary/vector-database.md) -- Complementary storage for semantic similarity search
- [Domain-Driven Design](@/glossary/domain-driven-design.md) -- Design methodology informing graph ontology boundaries
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Numeric confidence attached to graph nodes and edges
- [Signal Plurality](@/glossary/signal-plurality.md) -- NABLA axiom requiring multiple sources for graph entity confirmation
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- NABLA axiom requiring source tracking on every graph element
- [Time Decay](@/glossary/time-decay.md) -- Temporal confidence degradation for graph observations
- [Attack Surface](@/glossary/attack-surface.md) -- The security domain modeled by the EASM knowledge graph
- [Shodan](@/glossary/shodan.md) -- OSINT source feeding infrastructure observations into the graph
- [Censys](@/glossary/censys.md) -- OSINT source providing certificate and host intelligence

## See Also

- [Architecture](@/architecture/_index.md) -- Graph intelligence architecture and knowledge representation
- [Technologies](@/technologies/_index.md) -- Graph database technology stack (KuzuDB)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)