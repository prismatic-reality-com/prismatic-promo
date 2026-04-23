+++
title = "Ontology"
weight = 47
[extra]
category = "intelligence"
description = "Formal specification of entity types, properties, and relationships within a domain"
related_terms = ["knowledge-graph", "entity-resolution", "domain-driven-design", "3nl", "belief-graph", "confidence-scoring", "bounded-context", "vector-database"]
tier = "TIER 1"
domain = "Knowledge Representation"
platform_integration = "Cross-Platform"
maturity = "Production"
complexity = "Advanced"
audience = ["knowledge-engineers", "ontologists", "intelligence-architects"]
key_benefits = ["semantic-modeling", "automated-inference", "type-safety", "schema-evolution"]
prerequisites = ["knowledge-graph", "domain-driven-design", "bounded-context"]
formalism = "Property Graph + Elixir Structs"
standard = "Lightweight OWL-inspired"
implementation = "KuzuDB + Elixir Protocols"
layers = ["upper-ontology", "domain-ontology", "epistemic-ontology"]
prismatic_module = "PrismaticPerimeter.Ontology"
evolution_strategy = "Versioned Schema Migrations"
inference_engine = "Rule-based transitive closure"
validation = "Compile-time + Runtime"
reasoning_model = "Open-world with closed-world constraints"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1536
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Ontology", "Formal", "glossary", "intelligence", "Prismatic Platform", "Domain", "High", "Organization"]
tags = ["glossary", "intelligence", "ontology", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Ontology - Prismatic Platform"
+++

## Definition

An ontology is a formal, explicit specification of a shared conceptualization -- it defines the types of entities that exist in a domain, their properties, the relationships between them, and the constraints that govern valid combinations. In philosophy, ontology is the study of what exists; in computer science, an ontology is an engineered artifact that makes a domain's conceptual structure machine-readable and machine-enforceable. Unlike database schemas, which define storage layout, ontologies capture rich semantic relationships including hierarchies (an IP address is a type of network entity), constraints (a certificate must have an issuer), inference rules (if A resolves to B and B hosts C, then A indirectly exposes C), and cardinality (a domain may resolve to multiple IP addresses, but an SSL certificate has exactly one serial number).

The formal ontology tradition in computer science traces to Tom Gruber's 1993 definition: "an explicit specification of a conceptualization." The Web Ontology Language (OWL), built on RDF (Resource Description Framework) and standardized by the W3C, provides the most widely used formalism for ontologies on the semantic web. However, practical ontologies in intelligence and security platforms often use lighter-weight representations -- property graph schemas, Elixir struct hierarchies, or protocol definitions -- that capture the essential type structure without the full complexity of OWL's description logic.

The Prismatic Platform maintains domain ontologies for its intelligence and security assessment functions. These ontologies serve as the schema for the platform's [knowledge graphs](@/glossary/knowledge-graph.md), the classification framework for [entity resolution](@/glossary/entity-resolution.md), and the vocabulary for cross-component communication. They are implemented as Elixir struct hierarchies with protocol implementations in KuzuDB, providing compile-time type checking and runtime semantic validation.

## Ontological Foundations

Understanding the theoretical foundations of ontology engineering is essential for building effective knowledge representation systems. The field draws from several disciplines that together inform practical ontology design.

### Philosophical Roots

Ontology in philosophy asks the fundamental question: "What exists?" The computational adoption of this question narrows it to: "What entities and relationships must our system be able to represent?" This seemingly simple question has profound implications for system design. A security ontology that lacks a concept for "cloud resource" cannot represent findings about cloud infrastructure, no matter how sophisticated its other components are.

The open-world assumption (OWA) -- the principle that the absence of a statement does not imply its negation -- is a critical distinction between ontological and database reasoning. In a relational database, if no row exists for a given query, the answer is definitively "no." In an ontological system under OWA, the absence of information means "unknown," not "false." This distinction is fundamental for intelligence systems where incomplete information is the norm rather than the exception.

### Description Logic Foundations

Formal ontologies are grounded in description logics (DLs), a family of knowledge representation languages that provide decidable reasoning over class hierarchies and role restrictions. Key DL constructors include:

| Constructor | Symbol | Example | Meaning |
|-------------|--------|---------|---------|
| **Concept inclusion** | C ⊑ D | WebService ⊑ Service | Every web service is a service |
| **Concept intersection** | C ⊓ D | ExpiredCert ⊓ PublicCert | Certificates that are both expired and public |
| **Existential restriction** | ∃R.C | ∃hosts.WebService | Things that host at least one web service |
| **Universal restriction** | ∀R.C | ∀signedBy.TrustedCA | Things where all signers are trusted CAs |
| **Cardinality** | ≥n R | ≥2 resolves_to | Domains resolving to at least 2 IPs |

While the Prismatic Platform does not implement a full DL reasoner, these formal constructs inform the design of ontology constraints and inference rules implemented in Elixir.

## Ontological Layers

The platform's ontologies are organized in layers, from the most abstract to the most domain-specific:

### Upper Ontology (Foundation Layer)

The upper ontology defines the most general entity types that span all domains:

| Type | Description | Subtypes |
|------|-------------|----------|
| `Entity` | Any identifiable thing | All domain-specific types |
| `TemporalEntity` | Entity with time bounds | Events, observations, assessments |
| `SpatialEntity` | Entity with location | IP addresses, servers, datacenters |
| `Agent` | Entity capable of action | Organizations, users, software agents |
| `Observation` | Recorded fact about an entity | Scan results, DNS records, certificate data |

```elixir
defmodule PrismaticOntology.Upper do
  @moduledoc "Upper ontology defining the most general entity types spanning all domains."

  defmodule Entity do
    @moduledoc "Root type for all ontology entities."
    @type t :: %__MODULE__{
      id: String.t(),
      type: atom(),
      created_at: DateTime.t(),
      updated_at: DateTime.t(),
      provenance: [provenance_entry()]
    }
    @type provenance_entry :: %{source: String.t(), timestamp: DateTime.t(), confidence: float()}
    defstruct [:id, :type, :created_at, :updated_at, provenance: []]
  end

  defmodule TemporalEntity do
    @moduledoc "Entity with temporal bounds -- events, observations, assessments."
    @type t :: %__MODULE__{
      entity: Entity.t(),
      valid_from: DateTime.t(),
      valid_until: DateTime.t() | nil,
      temporal_granularity: :instant | :interval | :ongoing
    }
    defstruct [:entity, :valid_from, :valid_until, temporal_granularity: :interval]
  end

  defmodule SpatialEntity do
    @moduledoc "Entity with geographic or network location."
    @type t :: %__MODULE__{
      entity: Entity.t(),
      location: %{latitude: float(), longitude: float()} | nil,
      network_location: %{ip: String.t(), asn: integer()} | nil,
      jurisdiction: String.t() | nil
    }
    defstruct [:entity, :location, :network_location, :jurisdiction]
  end
end
```

### Domain Ontologies

Each [bounded context](@/glossary/bounded-context.md) maintains its own domain ontology, defining entity types specific to its problem domain.

#### EASM Ontology (Prismatic Perimeter)

```elixir
# Type hierarchy for External Attack Surface Management
defmodule PrismaticPerimeter.Ontology do
  @moduledoc "EASM domain ontology defining entity types and relationships."

  @entity_types %{
    network: [:domain, :ip_address, :ip_range, :asn],
    cryptographic: [:certificate, :key, :cipher_suite],
    service: [:web_service, :mail_service, :dns_service, :ssh_service],
    organizational: [:organization, :subsidiary, :contact],
    vulnerability: [:cve, :misconfiguration, :exposure],
    cloud: [:cloud_resource, :storage_bucket, :serverless_function, :container_registry]
  }

  @relationship_types %{
    network: [
      {:domain, :resolves_to, :ip_address},
      {:domain, :has_subdomain, :domain},
      {:ip_address, :belongs_to, :ip_range},
      {:ip_range, :announced_by, :asn}
    ],
    hosting: [
      {:ip_address, :hosts, :web_service},
      {:ip_address, :exposes, :service},
      {:service, :uses, :certificate}
    ],
    organizational: [
      {:organization, :operates, :domain},
      {:organization, :owns, :ip_range},
      {:organization, :subsidiary_of, :organization}
    ],
    security: [
      {:service, :vulnerable_to, :cve},
      {:certificate, :issued_for, :domain},
      {:certificate, :signed_by, :certificate}
    ],
    cloud: [
      {:cloud_resource, :hosted_in, :region},
      {:cloud_resource, :managed_by, :organization},
      {:domain, :points_to, :cloud_resource}
    ]
  }

  @spec entity_types() :: map()
  def entity_types, do: @entity_types

  @spec relationship_types() :: map()
  def relationship_types, do: @relationship_types

  @spec valid_relationship?(atom(), atom(), atom()) :: boolean()
  def valid_relationship?(source_type, rel_type, target_type) do
    @relationship_types
    |> Map.values()
    |> List.flatten()
    |> Enum.any?(fn {s, r, t} -> s == source_type and r == rel_type and t == target_type end)
  end
end
```

#### OSINT Ontology

The OSINT ontology classifies intelligence sources, their reliability, and the types of information they provide:

| Source Type | Entity Types Produced | Reliability | Refresh Rate |
|-------------|----------------------|-------------|--------------|
| **Active Scanner** | IP, Service, Banner | High (direct observation) | Hours-Days |
| **Passive DNS** | Domain, IP, Resolution | Medium (historical) | Real-time |
| **Certificate Transparency** | Certificate, Domain | High (cryptographic proof) | Real-time |
| **WHOIS** | Organization, Contact, Domain | Medium (self-reported) | Days |
| **BGP** | ASN, IP Range | High (routing fabric) | Minutes |
| **Business Registry** | Organization, Officer, Address | High (government source) | Days-Weeks |
| **Social Media** | Person, Account, Connection | Low-Medium (self-reported) | Hours |

#### Epistemic Ontology

The epistemic ontology defines the types used in the platform's [belief graph](@/glossary/belief-graph.md) and epistemic pipeline:

| Type | Description | Properties |
|------|-------------|-----------|
| `Belief` | An assessed proposition | confidence, provenance, timestamp |
| `Evidence` | Supporting or contradicting signal | source, strength, reliability |
| `InferenceRule` | Rule connecting evidence to belief | antecedents, consequent, confidence_transfer |
| `Contradiction` | Two incompatible beliefs | belief_a, belief_b, resolution_status |
| `TrinityVerification` | Verification result from [Trinity Gate](@/glossary/trinity-gate.md) | structural, logical, formal, verdict |

```elixir
defmodule PrismaticOntology.Epistemic do
  @moduledoc "Epistemic ontology for belief representation and reasoning."

  defmodule Belief do
    @moduledoc "An assessed proposition with calibrated confidence."
    @type t :: %__MODULE__{
      id: String.t(),
      proposition: String.t(),
      confidence: float(),
      provenance: [Evidence.t()],
      created_at: DateTime.t(),
      decay_rate: float()
    }
    defstruct [:id, :proposition, :confidence, :created_at, provenance: [], decay_rate: 0.01]
  end

  defmodule Evidence do
    @moduledoc "A signal supporting or contradicting a belief."
    @type t :: %__MODULE__{
      source: String.t(),
      signal_type: :supporting | :contradicting | :neutral,
      strength: float(),
      reliability: float(),
      timestamp: DateTime.t()
    }
    defstruct [:source, :signal_type, :strength, :reliability, :timestamp]
  end

  @spec compute_belief_confidence([Evidence.t()]) :: {:ok, float()} | {:error, :insufficient_signals}
  def compute_belief_confidence(evidence_list) when length(evidence_list) < 2 do
    {:error, :insufficient_signals}
  end

  def compute_belief_confidence(evidence_list) do
    weighted_sum =
      evidence_list
      |> Enum.map(fn e -> e.strength * e.reliability * signal_multiplier(e.signal_type) end)
      |> Enum.sum()

    total_weight =
      evidence_list
      |> Enum.map(fn e -> e.reliability end)
      |> Enum.sum()

    confidence = weighted_sum / max(total_weight, 0.001)
    {:ok, Float.round(min(max(confidence, 0.0), 1.0), 4)}
  end

  defp signal_multiplier(:supporting), do: 1.0
  defp signal_multiplier(:contradicting), do: -0.5
  defp signal_multiplier(:neutral), do: 0.0
end
```

## Ontology-Driven Entity Classification

The ontology serves as the classification framework for incoming data. When an OSINT source returns raw data, the ontology determines how to classify it:

```elixir
defmodule PrismaticPerimeter.Ontology.Classifier do
  @moduledoc "Classify raw observations into ontology entity types."

  @spec classify(map()) :: {:ok, [tuple()]} | {:error, term()}
  def classify(%{type: "host", ip: ip, ports: ports}) do
    {:ok, [
      {:ip_address, %{address: ip}},
      Enum.map(ports, fn port ->
        {:service, %{port: port.port, protocol: port.transport, product: port.product}}
      end)
    ]}
  end

  def classify(%{type: "dns", query: domain, answer: records}) do
    {:ok, [
      {:domain, %{name: domain}},
      Enum.map(records, fn
        %{type: "A", data: ip} -> {:resolves_to, %{domain: domain, ip: ip}}
        %{type: "CNAME", data: target} -> {:has_alias, %{source: domain, target: target}}
        %{type: "MX", data: mx} -> {:mail_handled_by, %{domain: domain, mx: mx}}
        %{type: "NS", data: ns} -> {:nameserver, %{domain: domain, ns: ns}}
      end)
    ]}
  end

  def classify(%{type: "certificate", fingerprint: fp, subject: subject, sans: sans}) do
    entities = [{:certificate, %{fingerprint: fp, subject: subject}}]
    domain_links = Enum.map(sans, fn san -> {:issued_for, %{certificate: fp, domain: san}} end)
    {:ok, entities ++ domain_links}
  end

  def classify(unknown) do
    {:error, {:unrecognized_type, Map.get(unknown, :type, :missing)}}
  end
end
```

## Three Normal Levels (3NL) Mapping

The platform's [3NL](@/glossary/3nl.md) framework maps directly to ontological layers. Each 3NL level corresponds to a different level of ontological abstraction:

| 3NL Level | Ontological Layer | Content | Operations |
|-----------|------------------|---------|------------|
| **Level 1: Data** | Instance level | Raw observations, individual entity instances | Collection, normalization, deduplication |
| **Level 2: Information** | Type level | Classified entities, typed relationships | Classification, linking, validation |
| **Level 3: Knowledge** | Schema level | Ontological rules, inference patterns, constraints | Reasoning, inference, verification |

This mapping ensures that the platform's intelligence processing pipeline (data collection -> information extraction -> knowledge synthesis) is grounded in a formal ontological framework. Each level builds on the one below it, with the ontology providing the structural scaffolding that holds all levels together.

## Ontology Evolution

Ontologies are not static -- they evolve as understanding of the domain deepens and new entity types emerge. The platform manages ontology evolution through versioned schema migrations:

| Evolution Type | Description | Example | Risk Level |
|---------------|-------------|---------|------------|
| **Extension** | Adding new entity or relationship types | Adding `CloudResource` type for cloud asset discovery | Low |
| **Specialization** | Adding subtypes to existing types | Splitting `Service` into `WebService`, `MailService` | Low |
| **Constraint addition** | Adding new validation rules | Requiring all certificates to have an expiry date | Medium |
| **Deprecation** | Marking types as superseded | Replacing `Host` with more specific `IPAddress` + `Service` | Medium |
| **Restructuring** | Changing type hierarchies | Moving `Certificate` from network to cryptographic | High |
| **Merging** | Combining redundant types | Unifying `PersonName` and `ContactName` | High |

```elixir
defmodule PrismaticPerimeter.Ontology.Migrations do
  @moduledoc "Versioned ontology migrations for schema evolution."

  defmodule V2 do
    @moduledoc "V2: Add cloud resource types and relationships."

    @spec up() :: :ok
    def up do
      add_entity_type(:cloud_resource, %{
        parent: :entity,
        properties: [:provider, :region, :type, :identifier, :public_access],
        relationships: [
          {:cloud_resource, :belongs_to, :organization},
          {:cloud_resource, :exposes, :service},
          {:domain, :points_to, :cloud_resource}
        ]
      })
    end

    @spec down() :: :ok
    def down do
      remove_entity_type(:cloud_resource)
    end
  end

  defmodule V3 do
    @moduledoc "V3: Add container and serverless entity types."

    @spec up() :: :ok
    def up do
      add_entity_type(:container_registry, %{
        parent: :cloud_resource,
        properties: [:registry_url, :visibility, :image_count],
        relationships: [
          {:container_registry, :hosted_on, :cloud_resource},
          {:container_registry, :managed_by, :organization}
        ]
      })

      add_entity_type(:serverless_function, %{
        parent: :cloud_resource,
        properties: [:runtime, :endpoint_url, :memory_mb],
        relationships: [
          {:serverless_function, :invoked_by, :service},
          {:serverless_function, :accesses, :cloud_resource}
        ]
      })
    end
  end
end
```

## Inference and Reasoning

Ontologies enable automated inference -- deriving new knowledge from existing facts and ontological rules:

### Transitive Relationships

If Organization A is a subsidiary of Organization B, and Organization B operates Domain X, the ontology can infer that Domain X is indirectly associated with Organization A. This transitive inference reveals attack surface elements that direct queries would miss.

```elixir
defmodule PrismaticOntology.InferenceEngine do
  @moduledoc "Rule-based inference engine operating on ontologically typed entities."

  @spec transitive_closure(atom(), String.t(), atom()) :: {:ok, [String.t()]} | {:error, term()}
  def transitive_closure(start_type, start_id, relationship) do
    visited = MapSet.new()
    do_closure(start_type, start_id, relationship, visited, [])
  end

  defp do_closure(entity_type, entity_id, relationship, visited, acc) do
    if MapSet.member?(visited, entity_id) do
      {:ok, acc}
    else
      case KnowledgeGraph.outgoing(entity_id, relationship) do
        {:ok, neighbors} ->
          new_visited = MapSet.put(visited, entity_id)
          Enum.reduce(neighbors, {:ok, acc ++ neighbors}, fn neighbor, {:ok, current_acc} ->
            do_closure(entity_type, neighbor.id, relationship, new_visited, current_acc)
          end)

        {:error, reason} ->
          {:error, reason}
      end
    end
  end

  @spec infer_indirect_associations(String.t()) :: {:ok, [map()]} | {:error, term()}
  def infer_indirect_associations(organization_id) do
    with {:ok, subsidiaries} <- transitive_closure(:organization, organization_id, :subsidiary_of),
         {:ok, domains} <- find_all_domains(subsidiaries ++ [organization_id]),
         {:ok, ips} <- resolve_all_domains(domains) do
      {:ok, %{
        subsidiaries: subsidiaries,
        domains: domains,
        ip_addresses: ips,
        inferred_attack_surface: length(domains) + length(ips)
      }}
    end
  end
end
```

### Type Inheritance

Properties and constraints defined at a parent type automatically apply to subtypes. A rule stating "all Services must have a port number" automatically applies to WebService, MailService, and any future service subtypes.

### Constraint Validation

The ontology defines constraints that can be checked at data ingestion time:

| Constraint | Description | Enforcement |
|-----------|-------------|-------------|
| **Cardinality** | A Certificate has exactly one serial number | Reject duplicates |
| **Type restriction** | RESOLVES_TO only connects Domain to IPAddress | Reject invalid edges |
| **Temporal** | Certificate not_after must be after not_before | Reject invalid dates |
| **Referential** | Every Service must be hosted on an IPAddress | Warn on dangling references |
| **Uniqueness** | No two Domains may share the same FQDN | Deduplicate on ingest |
| **Mandatory properties** | All Organizations must have a name | Reject incomplete records |

## Comparison with Database Schemas

| Dimension | Database Schema | Ontology |
|-----------|----------------|----------|
| **Purpose** | Storage layout | Conceptual model |
| **Expressiveness** | Tables, columns, foreign keys | Types, relationships, constraints, inference rules |
| **Hierarchy** | Limited (single table inheritance) | Rich type hierarchies with multiple inheritance |
| **Inference** | None (queries must be explicit) | Automated reasoning from rules |
| **Cross-system** | Tied to specific database | Portable across storage backends |
| **Evolution** | Schema migrations | Ontology versioning with backward compatibility |
| **Open-world** | Closed-world (missing = false) | Open-world (missing = unknown) |
| **Validation** | Column constraints, triggers | Semantic constraints, type restrictions |

The Prismatic Platform bridges both: ontologies define the conceptual model, and database schemas (KuzuDB graph schema, [PostgreSQL](@/glossary/postgresql.md) tables, [Ecto](@/glossary/ecto.md) schemas) implement the storage layout.

## Ontology Design Principles

Effective ontology engineering follows established principles that balance expressiveness with practical utility:

| Principle | Description | Application |
|-----------|-------------|-------------|
| **Minimal ontological commitment** | Define only what is necessary | Avoid speculative entity types |
| **Orthogonal differentiation** | Each type represents a distinct concept | No overlapping entity types |
| **Monotonic extension** | New versions only add, never remove | Backward-compatible evolution |
| **Single responsibility** | Each ontology covers one domain | EASM, OSINT, Epistemic are separate |
| **Grounded vocabulary** | Terms reflect domain expert usage | Security terms match industry standards |

## Ontology Serialization and Storage

The platform stores ontology definitions in multiple formats depending on the use case:

```elixir
defmodule PrismaticOntology.Serializer do
  @moduledoc "Serialize ontology definitions to various formats for storage and exchange."

  @spec to_json(module()) :: {:ok, String.t()} | {:error, term()}
  def to_json(ontology_module) do
    schema = %{
      version: ontology_module.version(),
      entity_types: ontology_module.entity_types(),
      relationship_types: ontology_module.relationship_types(),
      constraints: ontology_module.constraints(),
      metadata: %{
        created_at: DateTime.utc_now(),
        domain: ontology_module.domain()
      }
    }

    case Jason.encode(schema, pretty: true) do
      {:ok, json} -> {:ok, json}
      {:error, reason} -> {:error, {:serialization_failed, reason}}
    end
  end

  @spec to_kuzu_schema(module()) :: {:ok, [String.t()]} | {:error, term()}
  def to_kuzu_schema(ontology_module) do
    node_tables =
      ontology_module.entity_types()
      |> Enum.flat_map(fn {_category, types} -> types end)
      |> Enum.map(fn type ->
        "CREATE NODE TABLE #{Atom.to_string(type)} (id STRING, PRIMARY KEY(id))"
      end)

    rel_tables =
      ontology_module.relationship_types()
      |> Enum.flat_map(fn {_category, rels} -> rels end)
      |> Enum.map(fn {src, rel, tgt} ->
        "CREATE REL TABLE #{Atom.to_string(rel)} (FROM #{Atom.to_string(src)} TO #{Atom.to_string(tgt)})"
      end)

    {:ok, node_tables ++ rel_tables}
  end
end
```

## Related Terms

- [Knowledge Graph](@/glossary/knowledge-graph.md) -- Graph database structured according to the ontology
- [Entity Resolution](@/glossary/entity-resolution.md) -- Deduplication guided by ontology entity definitions and matching rules
- [Domain-Driven Design](@/glossary/domain-driven-design.md) -- Design methodology informing ontology boundary decisions
- [Bounded Context](@/glossary/bounded-context.md) -- Scope within which a domain ontology is internally consistent
- [3NL](@/glossary/3nl.md) -- Three Normal Levels framework mapped to ontological layers
- [Belief Graph](@/glossary/belief-graph.md) -- Epistemic graph structured by the epistemic ontology
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Numeric confidence attached to ontology instances
- [Vector Database](@/glossary/vector-database.md) -- Complementary storage for embedding-based entity similarity
- [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) -- Processing pipeline operating on ontology-typed entities
- [Trinity Gate](@/glossary/trinity-gate.md) -- Verification gate operating on ontologically typed beliefs
- [Attack Surface](@/glossary/attack-surface.md) -- Security domain modeled by the EASM ontology
- [PostgreSQL](@/glossary/postgresql.md) -- Relational storage implementing ontology schemas

## See Also

- [Architecture](@/architecture/_index.md) -- Knowledge representation architecture and ontological foundations
- [Technologies](@/technologies/_index.md) -- Ontology implementation technology (KuzuDB, Elixir structs)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
