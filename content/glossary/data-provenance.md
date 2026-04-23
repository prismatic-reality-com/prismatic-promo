+++
title = "Data Provenance"
weight = 50
[extra]
tags = ["glossary", "data-management", "nabla", "traceability", "audit", "epistemic", "compliance", "governance"]
description = "The documented history of data including its origin, transformations, chain of custody, and quality metadata, enabling full traceability and trust assessment across the Prismatic Platform's epistemic pipeline"
category = "data-management"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Data Governance & Epistemic Framework"
related_concepts = ["provenance-mandatory", "nabla-infinity", "audit-trail", "data-pipeline", "belief-graph", "epistemic-pipeline", "trinity-gate"]
implementation_status = "production"
authority_level = "L3 Strategic"
difficulty_rating = 7
prerequisites = ["data-pipeline", "audit-trail", "nabla-infinity", "ets", "ecto"]
learning_path = ["data-pipeline", "audit-trail", "data-provenance", "provenance-mandatory", "belief-graph", "trinity-gate"]
interactive_demos = ["/labs/glossary/data-provenance"]
code_examples = ["Elixir GenServer provenance tracker", "Ecto changeset provenance middleware", "ETS provenance cache with TTL"]
external_resources = ["https://www.w3.org/TR/prov-dm/", "https://hexdocs.pm/ecto/Ecto.html", "https://www.nist.gov/topics/data"]
version_introduced = "0.8.0"
stability_level = "stable"
testing_scenarios = ["provenance chain integrity verification", "transformation audit completeness", "cross-system lineage tracing", "temporal provenance decay validation"]
keywords = ["data provenance", "data lineage", "data traceability", "chain of custody", "data origin", "transformation history", "NABLA provenance", "epistemic traceability"]
related_terms = ["provenance-mandatory", "nabla-infinity", "audit-trail", "audit-logging", "data-pipeline", "belief-graph", "epistemic-pipeline", "trinity-gate", "time-decay", "contradiction-preservation"]
word_count = 1997
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Data Provenance - Prismatic Platform"
+++

## Definition

Data provenance refers to the comprehensive, machine-verifiable record of a data element's entire lifecycle: its origin, every transformation it has undergone, the agents or processes that acted upon it, the timestamps of each operation, and the chain of custody linking producers to consumers. Unlike simple logging, provenance captures the causal graph of data derivation, enabling any downstream consumer to trace a value back to its original source and understand exactly how it was produced.

In the Prismatic Platform, data provenance is elevated from an operational concern to an epistemic axiom. [NABLA Axiom 7 (Provenance Mandatory)](/glossary/provenance-mandatory/) declares that no belief, evidence, or claim may exist in the system without a traceable provenance chain. This enforcement transforms provenance from a "nice to have" audit feature into a hard architectural constraint that gates all data flow through the platform's [Trinity Gate](/glossary/trinity-gate/) verification system.

## Overview

Data provenance addresses a fundamental question in any data-intensive system: "Where did this data come from, and why should I trust it?" In traditional software architectures, data flows through pipelines without retaining memory of its transformations. A database record might have been imported, cleaned, enriched, aggregated, and filtered, but the final consumer sees only the end result with no visibility into the process that produced it.

This opacity creates several critical problems. First, errors become difficult to diagnose because there is no trail to follow backward from a faulty output to its root cause. Second, trust becomes impossible to establish because consumers cannot assess the reliability of data whose origin they cannot verify. Third, compliance requirements from regulations like GDPR, NIS2, and SOX demand demonstrable [audit trails](/glossary/audit-trail/) that traditional architectures cannot provide without bolted-on solutions.

The Prismatic Platform addresses these challenges by making provenance a first-class architectural concern. Every piece of data that enters the system -- whether from an OSINT adapter, a user input, an API call, or an internal computation -- is assigned a provenance record that follows it through every subsequent transformation. This record is immutable, timestamped, and linked to the specific agent, process, or function that performed each operation.

The provenance system integrates deeply with the platform's [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework. Because NABLA requires all beliefs to be traceable (Axiom 7), the provenance system serves as the infrastructure backbone for epistemic validation. When the [Trinity Gate](/glossary/trinity-gate/) evaluates a claim, it examines the provenance chain to verify that the claim's supporting evidence has a valid, unbroken lineage from trusted sources.

## Technical Details

### Provenance Data Model

A provenance record in the Prismatic Platform follows a directed acyclic graph (DAG) structure inspired by the W3C PROV Data Model (PROV-DM). Each node in the graph represents either an entity (a data artifact), an activity (a transformation or process), or an agent (a human, software agent, or system component). Edges represent three fundamental relationships: `wasGeneratedBy` (entity to activity), `used` (activity to entity), and `wasAttributedTo` (entity to agent).

The platform extends PROV-DM with several domain-specific additions. Each provenance record includes a confidence score indicating the reliability of the source, a decay timestamp for the [Time Decay](/glossary/time-decay/) axiom, and a plurality flag tracking whether multiple independent sources have confirmed the same data. These extensions directly support the seven [NABLA Axioms](/glossary/nabla-axioms/).

### Storage Architecture

Provenance records are stored across multiple backends depending on the access pattern. Hot provenance (recent, frequently accessed) lives in [ETS](/glossary/ets/) tables for sub-millisecond lookup. Warm provenance is persisted to [PostgreSQL](/glossary/postgresql/) via [Ecto](/glossary/ecto/) changesets with full indexing on entity ID, timestamp, and agent. Cold provenance for compliance and long-term audit is archived to immutable append-only storage.

The multi-tier storage approach ensures that provenance tracking does not become a performance bottleneck. ETS provides the speed needed for real-time provenance queries during [data pipeline](/glossary/data-pipeline/) execution, while PostgreSQL provides the durability and queryability needed for compliance reporting and forensic analysis.

### Provenance Chain Integrity

Every provenance record includes a cryptographic hash of its contents and a reference to its parent record's hash, forming a hash chain similar to a blockchain but optimized for read-heavy workloads. This chain ensures that any tampering with historical provenance records is detectable. The platform verifies chain integrity as part of its periodic health checks and during any [audit logging](/glossary/audit-logging/) review.

## Implementation in Prismatic Platform

### Core Provenance Tracker

The provenance system is implemented as a GenServer that receives provenance events from across the platform and maintains the provenance DAG in ETS with periodic PostgreSQL persistence.

```elixir
defmodule Prismatic.Provenance.Tracker do
  @moduledoc """
  Tracks data provenance across the Prismatic Platform.

  Maintains a directed acyclic graph (DAG) of provenance records,
  enforcing NABLA Axiom 7 (Provenance Mandatory) by requiring
  all data entities to have a valid provenance chain.
  """

  use GenServer

  alias Prismatic.Provenance.{Record, Chain, Validator}

  @type entity_id :: String.t()
  @type provenance_id :: String.t()
  @type agent_ref :: String.t()

  @type provenance_record :: %Record{
    id: provenance_id(),
    entity_id: entity_id(),
    parent_id: provenance_id() | nil,
    activity: atom(),
    agent: agent_ref(),
    timestamp: DateTime.t(),
    confidence: float(),
    hash: binary(),
    parent_hash: binary() | nil,
    metadata: map()
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec record_origin(entity_id(), agent_ref(), map()) ::
          {:ok, provenance_record()} | {:error, term()}
  def record_origin(entity_id, agent, metadata \\ %{}) do
    GenServer.call(__MODULE__, {:record_origin, entity_id, agent, metadata})
  end

  @spec record_transformation(entity_id(), atom(), agent_ref(), map()) ::
          {:ok, provenance_record()} | {:error, term()}
  def record_transformation(entity_id, activity, agent, metadata \\ %{}) do
    GenServer.call(__MODULE__, {:transform, entity_id, activity, agent, metadata})
  end

  @spec get_lineage(entity_id()) :: {:ok, [provenance_record()]} | {:error, :not_found}
  def get_lineage(entity_id) do
    GenServer.call(__MODULE__, {:lineage, entity_id})
  end

  @spec verify_chain(entity_id()) :: {:ok, :valid} | {:error, :broken_chain, provenance_id()}
  def verify_chain(entity_id) do
    GenServer.call(__MODULE__, {:verify, entity_id})
  end

  @impl true
  def init(opts) do
    table = :ets.new(:provenance_records, [:set, :public, read_concurrency: true])

    state = %{
      table: table,
      persistence_interval: Keyword.get(opts, :persistence_interval, :timer.minutes(5)),
      records_since_persist: 0
    }

    schedule_persistence(state.persistence_interval)
    {:ok, state}
  end

  @impl true
  def handle_call({:record_origin, entity_id, agent, metadata}, _from, state) do
    record = %Record{
      id: generate_id(),
      entity_id: entity_id,
      parent_id: nil,
      activity: :origin,
      agent: agent,
      timestamp: DateTime.utc_now(),
      confidence: Map.get(metadata, :confidence, 1.0),
      hash: nil,
      parent_hash: nil,
      metadata: metadata
    }

    record = %{record | hash: Chain.compute_hash(record)}
    :ets.insert(state.table, {entity_id, [record]})

    emit_telemetry(:origin_recorded, record)
    {:reply, {:ok, record}, %{state | records_since_persist: state.records_since_persist + 1}}
  end

  @impl true
  def handle_call({:transform, entity_id, activity, agent, metadata}, _from, state) do
    case :ets.lookup(state.table, entity_id) do
      [{^entity_id, chain}] ->
        parent = List.first(chain)

        record = %Record{
          id: generate_id(),
          entity_id: entity_id,
          parent_id: parent.id,
          activity: activity,
          agent: agent,
          timestamp: DateTime.utc_now(),
          confidence: calculate_confidence(parent.confidence, activity),
          hash: nil,
          parent_hash: parent.hash,
          metadata: metadata
        }

        record = %{record | hash: Chain.compute_hash(record)}
        :ets.insert(state.table, {entity_id, [record | chain]})

        emit_telemetry(:transformation_recorded, record)
        {:reply, {:ok, record}, %{state | records_since_persist: state.records_since_persist + 1}}

      [] ->
        {:reply, {:error, :no_provenance_origin}, state}
    end
  end

  @impl true
  def handle_call({:lineage, entity_id}, _from, state) do
    case :ets.lookup(state.table, entity_id) do
      [{^entity_id, chain}] -> {:reply, {:ok, Enum.reverse(chain)}, state}
      [] -> {:reply, {:error, :not_found}, state}
    end
  end

  @impl true
  def handle_call({:verify, entity_id}, _from, state) do
    case :ets.lookup(state.table, entity_id) do
      [{^entity_id, chain}] -> {:reply, Chain.verify_integrity(chain), state}
      [] -> {:reply, {:error, :not_found}, state}
    end
  end

  @impl true
  def handle_info(:persist, state) do
    if state.records_since_persist > 0 do
      persist_to_database(state.table)
    end

    schedule_persistence(state.persistence_interval)
    {:noreply, %{state | records_since_persist: 0}}
  end

  @spec calculate_confidence(float(), atom()) :: float()
  defp calculate_confidence(parent_confidence, activity) do
    degradation = case activity do
      :enrichment -> 0.02
      :aggregation -> 0.05
      :filtering -> 0.01
      :normalization -> 0.01
      :inference -> 0.10
      _ -> 0.03
    end

    max(0.0, parent_confidence - degradation)
  end

  defp generate_id, do: "prov_" <> Base.url_encode64(:crypto.strong_rand_bytes(16), padding: false)
  defp schedule_persistence(interval), do: Process.send_after(self(), :persist, interval)
  defp persist_to_database(_table), do: :ok
  defp emit_telemetry(event, record) do
    :telemetry.execute(
      [:prismatic, :provenance, event],
      %{confidence: record.confidence},
      %{entity_id: record.entity_id, agent: record.agent, activity: record.activity}
    )
  end
end
```

### Ecto Changeset Provenance Middleware

Every Ecto changeset in the platform passes through provenance middleware that automatically records the transformation:

```elixir
defmodule Prismatic.Provenance.EctoMiddleware do
  @moduledoc """
  Automatic provenance tracking for Ecto changesets.

  Injects provenance metadata into every database operation,
  ensuring NABLA Axiom 7 compliance at the persistence layer.
  """

  alias Prismatic.Provenance.Tracker

  @spec track_changeset(Ecto.Changeset.t(), atom(), String.t()) :: Ecto.Changeset.t()
  def track_changeset(%Ecto.Changeset{} = changeset, operation, agent) do
    entity_id = extract_entity_id(changeset)

    case operation do
      :insert ->
        Tracker.record_origin(entity_id, agent, %{
          schema: changeset.data.__struct__,
          changes: Map.keys(changeset.changes)
        })

      :update ->
        Tracker.record_transformation(entity_id, :update, agent, %{
          schema: changeset.data.__struct__,
          changed_fields: Map.keys(changeset.changes)
        })

      :delete ->
        Tracker.record_transformation(entity_id, :deletion, agent, %{
          schema: changeset.data.__struct__,
          soft_delete: Map.has_key?(changeset.changes, :deleted_at)
        })
    end

    changeset
  end

  @spec extract_entity_id(Ecto.Changeset.t()) :: String.t()
  defp extract_entity_id(%Ecto.Changeset{data: %{id: id}}) when not is_nil(id) do
    "entity_#{id}"
  end

  defp extract_entity_id(_changeset) do
    "entity_" <> Base.url_encode64(:crypto.strong_rand_bytes(12), padding: false)
  end
end
```

### NABLA Axiom 7 Enforcement

The platform enforces provenance at the framework level, rejecting any data that lacks a valid provenance chain:

```elixir
defmodule Prismatic.Nabla.ProvenanceEnforcer do
  @moduledoc """
  Enforces NABLA Axiom 7: Provenance Mandatory.

  All beliefs entering the Trinity Gate must have a complete,
  verifiable provenance chain. No exceptions.
  """

  alias Prismatic.Provenance.Tracker

  @spec validate_provenance(String.t()) ::
          {:ok, :provenance_valid} | {:error, :missing_provenance | :broken_chain}
  def validate_provenance(entity_id) do
    with {:ok, lineage} <- Tracker.get_lineage(entity_id),
         true <- length(lineage) > 0,
         {:ok, :valid} <- Tracker.verify_chain(entity_id) do
      {:ok, :provenance_valid}
    else
      {:error, :not_found} -> {:error, :missing_provenance}
      {:error, :broken_chain, _id} -> {:error, :broken_chain}
      false -> {:error, :missing_provenance}
    end
  end

  @spec enforce!(String.t()) :: :ok | no_return()
  def enforce!(entity_id) do
    case validate_provenance(entity_id) do
      {:ok, :provenance_valid} ->
        :ok

      {:error, :missing_provenance} ->
        raise Prismatic.Nabla.ProvenanceError,
          message: "NABLA Axiom 7 violation: entity #{entity_id} has no provenance chain",
          entity_id: entity_id

      {:error, :broken_chain} ->
        raise Prismatic.Nabla.ProvenanceError,
          message: "NABLA Axiom 7 violation: entity #{entity_id} has broken provenance chain",
          entity_id: entity_id
    end
  end
end
```

## Comparison with Alternatives

### Data Provenance vs. Audit Logging

[Audit logging](/glossary/audit-logging/) records discrete events (who did what, when) as a flat sequence. Data provenance captures the causal relationships between data transformations as a graph. Audit logs answer "what happened?" while provenance answers "how was this value derived?" The Prismatic Platform uses both: audit logging for operational monitoring and provenance for epistemic validation.

### Data Provenance vs. Version Control

Version control systems like Git track changes to files over time with branching and merging. Data provenance tracks changes to data values through computational pipelines. While Git operates at the file level with human-initiated commits, provenance operates at the datum level with automatic, continuous recording. Git is essential for code; provenance is essential for data.

### Data Provenance vs. Event Sourcing

Event sourcing stores a complete history of domain events and derives current state by replaying them. Provenance tracks the derivation graph of data elements across system boundaries. Event sourcing is a data storage pattern; provenance is a metadata overlay. The two are complementary: the Prismatic Platform uses event sourcing in some subsystems and tracks the provenance of events themselves.

### Data Provenance vs. Data Lineage

Data lineage is often used interchangeably with provenance but typically refers to column-level or table-level tracking in data warehouse contexts. Provenance in the Prismatic Platform is finer-grained, tracking individual data elements through arbitrary computational pipelines, not just SQL transformations. Prismatic's provenance also includes confidence scores and cryptographic verification that lineage tools typically lack.

### W3C PROV vs. Prismatic Provenance

The W3C PROV standard (PROV-DM, PROV-O, PROV-N) provides a general-purpose provenance data model. Prismatic extends PROV with domain-specific attributes: confidence scoring (for NABLA [Signal Plurality](/glossary/signal-plurality/)), temporal decay (for [Time Decay](/glossary/time-decay/) axiom), and cryptographic chain verification. The platform's model is a strict superset of PROV-DM.

## Best Practices

**Record at source boundaries.** Always create a provenance origin record when data enters the system, whether from an API call, a file import, an OSINT adapter, or user input. The origin record is the foundation of the entire chain; without it, downstream provenance is meaningless.

**Include confidence metadata.** Every provenance record should include a confidence score reflecting the reliability of the source and the fidelity of the transformation. Confidence naturally degrades through transformations (especially inference and aggregation), and this degradation must be tracked for [NABLA](/glossary/nabla-infinity/) compliance.

**Use immutable records.** Provenance records must never be modified after creation. If a correction is needed, append a new record with a `correction` activity type that references the original. This immutability is essential for audit compliance and chain integrity verification.

**Verify chains periodically.** Run chain integrity verification as part of regular health checks. A broken chain indicates either a bug in the provenance system or potential tampering, both of which require immediate investigation.

**Separate hot and cold storage.** Keep recent provenance in ETS for performance-critical lookups and persist to PostgreSQL for durability. Archive old provenance to cold storage for compliance, but ensure it remains queryable for forensic analysis.

**Annotate transformations meaningfully.** The `activity` field should describe the semantic nature of the transformation (enrichment, filtering, aggregation, inference), not just the technical operation (insert, update). This semantic annotation enables downstream consumers to understand the nature of data derivation.

## Common Pitfalls

**Incomplete origin recording.** The most common failure is neglecting to record provenance at the point where data first enters the system. Without an origin record, the entire downstream chain is unanchored and fails NABLA Axiom 7 validation. Every ingestion point must be instrumented.

**Confidence score inflation.** Assigning uniformly high confidence scores to all provenance records defeats the purpose of confidence tracking. Each transformation type has a natural confidence degradation that must be honestly reflected. Inference operations, in particular, should significantly reduce confidence.

**Synchronous provenance in hot paths.** Recording provenance synchronously in performance-critical paths can introduce unacceptable latency. Use asynchronous recording (cast instead of call) for high-throughput pipelines, with periodic synchronous verification to catch any dropped records.

**Ignoring cross-system provenance.** Data often flows between subsystems (OSINT adapters to storage, storage to analysis, analysis to presentation). Provenance must be maintained across these boundaries, not just within a single subsystem. The Prismatic Platform uses entity IDs that are globally unique to enable cross-system lineage tracking.

**Treating provenance as optional.** In systems where provenance is advisory rather than mandatory, it inevitably degrades as developers skip instrumentation for convenience. The Prismatic Platform avoids this by making provenance a hard requirement at the [Trinity Gate](/glossary/trinity-gate/) level -- data without provenance simply cannot pass validation.

**Hash chain breaks from concurrent writes.** When multiple processes record provenance for the same entity simultaneously, hash chain integrity can be compromised. Use the centralized GenServer approach (as shown above) or implement optimistic concurrency control with retry logic.

## Use Cases

### OSINT Intelligence Gathering

When the platform's 120 OSINT adapters gather intelligence from external sources, each piece of data receives a provenance origin record tagged with the source adapter, timestamp, and source-specific confidence score. As the data flows through enrichment, deduplication, and analysis pipelines, each transformation appends to the provenance chain. Analysts can trace any intelligence finding back to its original source and assess its reliability.

### Compliance Auditing (NIS2, ZKB)

Regulatory frameworks like NIS2 (EU) and ZKB 264/2025 (Czech Republic) require organizations to demonstrate data handling practices. The provenance system provides auditors with a complete, cryptographically verifiable record of how every piece of compliance-relevant data was collected, processed, and stored. This eliminates the manual documentation burden that plagues traditional compliance workflows.

### Epistemic Validation (Trinity Gate)

The [Trinity Gate](/glossary/trinity-gate/) verification system uses provenance chains as a prerequisite for claim validation. Before evaluating the structural, logical, and formal consistency of a claim, the gate first verifies that all supporting evidence has valid provenance. Claims backed by evidence with broken or missing provenance chains are automatically rejected, regardless of their logical validity.

### Security Incident Forensics

During security incident investigation, provenance records enable analysts to trace the exact path of compromised data through the system. If an attacker injected malicious data through a vulnerable endpoint, the provenance chain reveals every process that consumed that data, enabling rapid assessment of the blast radius and targeted remediation.

### Data Quality Assessment

Provenance records enable automated data quality scoring based on the characteristics of the derivation chain. Data with short chains from high-confidence sources scores higher than data derived through long chains of low-confidence transformations. This scoring feeds into the platform's [belief graph](/glossary/belief-graph/) and influences decision-making priorities.

## Related Concepts

- [Provenance Mandatory](/glossary/provenance-mandatory/) -- NABLA Axiom 7 that makes provenance a hard requirement for all platform data
- [NABLA Infinity](/glossary/nabla-infinity/) -- The epistemic framework whose seven axioms include provenance as a foundational requirement
- [Audit Trail](/glossary/audit-trail/) -- Complementary system recording discrete operational events alongside provenance graphs
- [Audit Logging](/glossary/audit-logging/) -- The operational logging infrastructure that works alongside provenance tracking
- [Data Pipeline](/glossary/data-pipeline/) -- The transformation infrastructure through which provenance-tracked data flows
- [Belief Graph](/glossary/belief-graph/) -- The graph structure where provenance-backed evidence supports platform beliefs
- [Epistemic Pipeline](/glossary/epistemic-pipeline/) -- The processing pipeline that validates provenance as part of epistemic evaluation
- [Trinity Gate](/glossary/trinity-gate/) -- The three-part verification gate that requires valid provenance for all claims
- [Time Decay](/glossary/time-decay/) -- NABLA axiom requiring temporal metadata that provenance records include
- [Contradiction Preservation](/glossary/contradiction-preservation/) -- NABLA axiom for maintaining conflicting evidence, supported by provenance-based source tracking
- [Signal Plurality](/glossary/signal-plurality/) -- NABLA axiom requiring multiple independent sources, verified through provenance chains
- [Ecto](/glossary/ecto/) -- The database toolkit through which provenance is persisted to PostgreSQL

## See Also

- [W3C PROV Data Model](https://www.w3.org/TR/prov-dm/) -- The standard that inspired Prismatic's provenance architecture
- [NABLA Axioms](/glossary/nabla-axioms/) -- All seven epistemic axioms, of which provenance is Axiom 7
- [PostgreSQL](/glossary/postgresql/) -- Primary persistence backend for warm and cold provenance records
- [ETS](/glossary/ets/) -- In-memory storage for hot provenance records
- [Security Assessment](/glossary/security-assessment/) -- Uses provenance data for threat analysis and compliance reporting

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
