+++
title = "Provenance Mandatory"
weight = 3
[extra]
category = "doctrine"
description = "NABLA axiom requiring all beliefs and knowledge claims to maintain complete traceability back to their original sources."
related_terms = ["nabla-infinity", "signal-plurality", "epistemic-pipeline", "trinity-gate", "belief-graph", "contradiction-preservation", "time-decay", "qeve", "confidence-scoring", "entity-resolution", "knowledge-graph", "blue-team", "white-team"]
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 1908
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Provenance", "Mandatory", "NABLA", "glossary", "doctrine", "Prismatic Platform", "Provenance Mandatory", "Trinity Gate", "NABLA Infinity"]
tags = ["glossary", "doctrine", "provenance-mandatory", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Provenance Mandatory - Prismatic Platform"
+++

## Definition

Provenance Mandatory is the seventh and arguably most operationally consequential axiom of the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework. It requires that every belief, conclusion, and knowledge claim in the platform maintains a complete, traceable chain of custody back to its original source signals. No knowledge can exist in the system without an auditable provenance trail documenting where it came from, how it was processed, and what transformations it underwent. This axiom enables verification, debugging, and accountability for all platform knowledge.

The concept draws directly from forensic science and legal evidence handling, where the chain of custody determines whether evidence is admissible. A blood sample that cannot be traced from collection to laboratory to courtroom is worthless regardless of its content. NABLA Infinity applies the same standard to epistemic evidence: a belief that cannot be traced from raw signal through processing pipeline to final conclusion is epistemically inadmissible, regardless of how plausible it appears.

Provenance Mandatory is enforced as a HARD constraint at enforcement level E2. Beliefs without provenance are rejected immediately -- there is no override, no bypass flag, and no authority level that can waive this requirement. The axiom is structural, not advisory: the platform's data model physically cannot represent a belief without a provenance field, just as a strongly typed language cannot represent a string where an integer is required.

## Philosophical Foundations

The philosophical grounding of Provenance Mandatory extends far beyond software engineering into epistemology, historiography, and the philosophy of science. Every intellectual discipline that takes knowledge seriously has developed some form of provenance tracking.

In **historiography**, the distinction between primary sources (eyewitness accounts, original documents) and secondary sources (interpretations, analyses) is fundamental. A historical claim that cannot cite its sources is not scholarship -- it is assertion. Provenance Mandatory applies this standard to machine reasoning: an agent's conclusion that cannot cite its evidence chain is not knowledge -- it is noise.

In **scientific methodology**, the requirement for reproducibility serves the same function as provenance tracking. A scientific result must document its methods, data sources, and analysis steps in sufficient detail that another researcher can reproduce the result. Provenance Mandatory requires the same of the platform's epistemic pipeline: any conclusion must document its processing chain in sufficient detail that it can be re-derived from the original signals.

In **legal evidence handling**, the chain of custody (from Latin *custodia*, guardianship) establishes that evidence has not been tampered with between collection and presentation. Every handoff -- from crime scene to evidence locker to laboratory to courtroom -- is documented. A gap in the chain renders the evidence inadmissible. Provenance Mandatory applies this standard to epistemic evidence: every transformation -- from raw OSINT data to processed signal to aggregated belief -- is documented.

The philosophical position is that **knowledge without provenance is indistinguishable from fabrication**. A belief graph node that claims "Company X has regulatory risk" but cannot trace that claim to specific evidence, through specific processing steps, is no different from a hallucinated output. Provenance is what separates knowledge from assertion.

## Provenance Chain Structure

A provenance chain in the Prismatic Platform is a directed acyclic graph (DAG) connecting a final belief to its constituent evidence through a series of documented transformation steps. Each node in the chain carries specific metadata:

| Chain Element | Required Fields | Purpose |
|---------------|-----------------|---------|
| **Raw Signal** | `source_id`, `collection_timestamp`, `raw_data_hash`, `collector_agent` | Original data point before any processing |
| **Evidence** | `signal_refs[]`, `extraction_method`, `extraction_timestamp`, `extractor_agent` | Processed signal with extracted meaning |
| **Inference Step** | `evidence_refs[]`, `inference_rule`, `inference_timestamp`, `inference_agent`, `confidence_delta` | Logical step deriving new knowledge from existing evidence |
| **Belief** | `inference_chain[]`, `final_confidence`, `axiom_compliance`, `trinity_gate_result` | Final knowledge claim with full traceability |

The `raw_data_hash` field at the signal level uses cryptographic hashing (SHA-256) to ensure integrity verification. If the raw data is modified after collection, the hash mismatch is detectable at any point in the chain. This is analogous to blockchain's tamper-evidence properties but applied to individual evidence items rather than transaction ledgers.

```elixir
defmodule PrismaticEpistemic.ProvenanceChain do
  @moduledoc """
  Constructs and validates provenance chains for epistemic beliefs.
  Every belief must trace back to raw signals through documented steps.
  """

  @type chain_link :: %{
    source: source_ref(),
    transformation: transformation_type(),
    timestamp: DateTime.t(),
    agent: agent_id(),
    input_hashes: [binary()],
    output_hash: binary()
  }

  @spec build_chain(belief_id()) :: {:ok, [chain_link()]} | {:error, :broken_chain}
  def build_chain(belief_id) do
    with {:ok, belief} <- fetch_belief(belief_id),
         {:ok, inferences} <- trace_inferences(belief),
         {:ok, evidence} <- trace_evidence(inferences),
         {:ok, signals} <- trace_signals(evidence),
         :ok <- validate_chain_integrity(signals, evidence, inferences, belief) do
      {:ok, assemble_chain(signals, evidence, inferences, belief)}
    end
  end

  @spec validate_chain_integrity(list(), list(), list(), map()) :: :ok | {:error, :broken_chain}
  def validate_chain_integrity(signals, evidence, inferences, belief) do
    with :ok <- verify_hash_chain(signals, evidence),
         :ok <- verify_hash_chain(evidence, inferences),
         :ok <- verify_hash_chain(inferences, [belief]),
         :ok <- verify_no_gaps(signals, evidence, inferences, belief) do
      :ok
    end
  end
end
```

## Implementation in the Belief Graph

The [belief graph](/glossary/belief-graph/) is the platform's primary data structure for representing knowledge, and provenance is woven into its fabric at the structural level. Every node in the belief graph -- whether it represents a raw signal, a processed evidence item, or a derived conclusion -- carries a `provenance` field that is non-nullable in the schema definition.

When a new node is created in the belief graph, the provenance field must be populated before the node is persisted. The storage layer enforces this constraint at the write path: any attempt to insert a node with a nil or empty provenance field results in an immediate rejection with error `{:error, :provenance_required}`. This structural enforcement means that provenance compliance is not a runtime check that can be skipped -- it is a data model invariant.

The belief graph also supports **provenance queries**: given any node, the system can traverse the provenance links backward to produce the complete chain from conclusion to raw data. These queries are used by the [White Team](/glossary/white-team/) for formal verification, by the [Blue Team](/glossary/blue-team/) for defensive posture assessment, and by platform operators for debugging and audit.

## Relationship to Audit Trail

While provenance and audit trails serve related purposes, they are architecturally distinct in the Prismatic Platform. The audit trail records **who did what and when** -- a chronological log of system operations. Provenance records **why a belief exists** -- a logical chain of evidence and inference.

| Dimension | Audit Trail | Provenance Chain |
|-----------|-------------|------------------|
| **Structure** | Chronological sequence (append-only log) | Directed acyclic graph (evidence links) |
| **Question Answered** | "What operations occurred?" | "Where did this knowledge come from?" |
| **Granularity** | Per operation (API calls, agent actions) | Per belief (evidence through inference to conclusion) |
| **Primary Consumer** | Compliance officers, security reviewers | Epistemic validators, debugging agents |
| **Retention** | Time-bounded (legal requirements) | Belief-lifetime (as long as the belief persists) |
| **NABLA Axiom** | Not directly governed | Provenance Mandatory (Axiom 7) |

The two systems are complementary. An auditor might use the audit trail to identify when a particular belief was created, then use the provenance chain to verify that the belief's evidence base is sound. The audit trail documents the system's history; the provenance chain documents the system's reasoning.

## Integration with QEVE

The [QEVE](/glossary/qeve/) (Quality and Epistemic Verification Engine) verification pipeline depends on provenance data at every stage. When QEVE evaluates a belief for [Trinity Gate](/glossary/trinity-gate/) passage, the first check is provenance completeness: does the belief have an unbroken chain from conclusion to raw signals?

QEVE's verification stages interact with provenance as follows:

1. **Graph Build Stage**: Constructs the belief graph from input signals. Every node created receives provenance metadata automatically. Signals without source identification are rejected.

2. **Axiom Compliance Stage**: Validates all seven [NABLA Infinity](/glossary/nabla-infinity/) axioms. For Provenance Mandatory specifically, this stage verifies that every link in the chain is present, that hash integrity is maintained, and that no gaps exist in the transformation history.

3. **Confidence Calculation Stage**: Uses provenance chain length and transformation count as inputs to the [confidence scoring](/glossary/confidence-scoring/) formula. Longer chains with more transformations receive a small confidence penalty reflecting the accumulated uncertainty of multi-step inference.

4. **Trinity Gate Evaluation Stage**: The structural consistency check verifies that provenance links form a valid DAG (no cycles). The logical consistency check verifies that each inference step follows valid rules. The [formal verification](/glossary/formal-verification/) check can use provenance to trace specific inference steps for [Lean4](/glossary/lean4/) proof verification.

## Implementation in Elixir

The provenance system is implemented as an [OTP](/glossary/otp/) application with [GenServer](/glossary/genserver/)-backed storage and compile-time schema enforcement:

```elixir
defmodule PrismaticEpistemic.ProvenanceStore do
  @moduledoc """
  Persistent storage for provenance chains. Uses ETS for fast
  lookup and periodic disk persistence for durability.
  Every belief insertion is validated for provenance completeness.
  """

  use GenServer

  @type provenance_record :: %{
    belief_id: String.t(),
    chain: [PrismaticEpistemic.ProvenanceChain.chain_link()],
    integrity_hash: binary(),
    created_at: DateTime.t(),
    verified_at: DateTime.t() | nil
  }

  @spec store_provenance(String.t(), list()) :: :ok | {:error, :invalid_chain}
  def store_provenance(belief_id, chain) do
    GenServer.call(__MODULE__, {:store, belief_id, chain})
  end

  @spec lookup_provenance(String.t()) :: {:ok, provenance_record()} | {:error, :not_found}
  def lookup_provenance(belief_id) do
    case :ets.lookup(:provenance_store, belief_id) do
      [{^belief_id, record}] -> {:ok, record}
      [] -> {:error, :not_found}
    end
  end

  @spec verify_integrity(String.t()) :: :ok | {:error, :integrity_violation}
  def verify_integrity(belief_id) do
    with {:ok, record} <- lookup_provenance(belief_id),
         :ok <- validate_hash_chain(record.chain),
         :ok <- validate_no_gaps(record.chain) do
      :ok
    end
  end

  @impl GenServer
  def init(_opts) do
    table = :ets.new(:provenance_store, [
      :set, :named_table, :protected,
      read_concurrency: true
    ])
    {:ok, %{table: table}}
  end

  @impl GenServer
  def handle_call({:store, belief_id, chain}, _from, state) do
    case PrismaticEpistemic.ProvenanceChain.validate_chain_integrity(
      extract_signals(chain),
      extract_evidence(chain),
      extract_inferences(chain),
      extract_belief(chain)
    ) do
      :ok ->
        record = %{
          belief_id: belief_id,
          chain: chain,
          integrity_hash: compute_chain_hash(chain),
          created_at: DateTime.utc_now(),
          verified_at: nil
        }
        :ets.insert(state.table, {belief_id, record})

        :telemetry.execute(
          [:prismatic, :epistemic, :provenance, :stored],
          %{chain_length: length(chain)},
          %{belief_id: belief_id}
        )

        {:reply, :ok, state}

      {:error, reason} ->
        {:reply, {:error, :invalid_chain}, state}
    end
  end

  defp compute_chain_hash(chain) do
    chain
    |> Enum.map(& &1.output_hash)
    |> Enum.join()
    |> then(&:crypto.hash(:sha256, &1))
  end
end
```

The key design decision is that provenance validation occurs at write time, not read time. When a belief is stored, its provenance chain is validated immediately. This means that any belief successfully stored in the system has a verified provenance chain -- consumers never need to re-validate provenance during reads, which keeps the read path fast.

## Comparison with Blockchain Provenance

The comparison between NABLA's provenance tracking and blockchain-based provenance systems illuminates important design choices. Both systems aim to provide tamper-evident chains of custody, but they differ fundamentally in their trust models and performance characteristics.

| Aspect | NABLA Provenance | Blockchain Provenance |
|--------|------------------|----------------------|
| **Trust Model** | Centralized platform trust with cryptographic integrity | Decentralized consensus with distributed verification |
| **Performance** | O(1) write, O(n) chain traversal | O(consensus) write, O(n) chain traversal |
| **Mutability** | Append-only within belief lifetime | Immutable after consensus |
| **Verification** | Platform-internal hash verification | Distributed hash verification |
| **Use Case** | Epistemic reasoning traceability | Financial transaction integrity |

NABLA's provenance is not blockchain-based because the platform does not require decentralized consensus. The platform trusts its own agents and processing pipeline. What it requires is **internal auditability** -- the ability to trace any conclusion back through its reasoning chain for debugging, verification, and accountability. Cryptographic hashing provides tamper evidence without the overhead of distributed consensus.

## Practical Application in OSINT Pipelines

In practice, provenance tracking manifests most visibly in the platform's OSINT intelligence gathering pipelines. Consider a typical due diligence workflow:

1. A [Shodan](/glossary/shodan/) scan discovers an open port on a target company's IP address. The raw scan result is stored with provenance: `{source: "shodan", collection_timestamp: ~U[2026-02-14 10:00:00Z], collector: "osint-scanner-agent"}`.

2. The evidence extraction agent processes the raw scan into a structured finding: "Port 3306 (MySQL) open on 203.0.113.42." Provenance records the extraction: `{input: shodan_signal_ref, method: "port_classification", extractor: "evidence-extractor-agent"}`.

3. A risk assessment agent evaluates the finding against security benchmarks. The inference step is recorded: `{evidence: [port_finding_ref], rule: "exposed_database_port_risk", confidence_delta: +0.3}`.

4. The final belief -- "Target has medium database exposure risk" -- carries the complete chain from Shodan scan to risk assessment. Any reviewer can trace this conclusion back to the original port scan data.

Without provenance, step 4 would be an opaque assertion. With provenance, it is a verifiable claim.

## Provenance in Multi-Agent Systems

In the Prismatic Platform's 530+ agent ecosystem, provenance tracking takes on additional complexity. When multiple agents contribute to a single conclusion, the provenance chain must document each agent's contribution, the order of processing, and the confidence delta introduced at each step:

```elixir
defmodule PrismaticEpistemic.MultiAgentProvenance do
  @moduledoc """
  Tracks provenance across multi-agent inference chains.
  Each agent's contribution is recorded as a distinct link.
  """

  @type agent_contribution :: %{
    agent_id: String.t(),
    agent_tier: :l1 | :l2 | :l3 | :l4 | :l5,
    input_beliefs: [String.t()],
    output_belief: String.t(),
    inference_rule: String.t(),
    confidence_delta: float(),
    processing_time_ms: non_neg_integer(),
    timestamp: DateTime.t()
  }

  @spec record_contribution(agent_contribution()) :: :ok
  def record_contribution(contribution) do
    PrismaticEpistemic.ProvenanceStore.append_link(
      contribution.output_belief,
      %{
        source: {:agent, contribution.agent_id},
        transformation: {:inference, contribution.inference_rule},
        timestamp: contribution.timestamp,
        agent: contribution.agent_id,
        input_hashes: Enum.map(contribution.input_beliefs, &belief_hash/1),
        output_hash: belief_hash(contribution.output_belief)
      }
    )
  end
end
```

This multi-agent provenance tracking is essential for the [Purple Team](/glossary/purple-team/) security operations, where findings pass through Gray (boundary exploration), Red (adversarial simulation), Blue (defensive assessment), and Purple (synthesis) teams. Each team's contribution to a security finding is documented in the provenance chain, enabling post-incident analysis of how conclusions were reached and where disagreements occurred between teams.

## Enforcement and Violation Handling

Provenance Mandatory is enforced at HARD level with E2 BLOCK response. The enforcement operates at multiple layers:

| Layer | Enforcement Mechanism | Response to Violation |
|-------|----------------------|----------------------|
| **Data Model** | Non-nullable provenance field in belief schema | Insertion fails at schema level |
| **Pipeline** | Pre-processing validation in [epistemic pipeline](/glossary/epistemic-pipeline/) | Signal rejected before entering pipeline |
| **Agent Runtime** | Agent output validation before belief publication | Agent output rejected, error logged |
| **QEVE** | Axiom compliance check during verification | Belief fails Trinity Gate evaluation |
| **Audit** | Periodic provenance integrity scans | Integrity violations escalated to E3 HALT |

The multi-layer enforcement ensures that provenance violations are caught at the earliest possible point. A signal without source identification never enters the pipeline. An agent output without inference chain documentation never becomes a published belief. A belief with a broken provenance chain never passes [Trinity Gate](/glossary/trinity-gate/).

## Related Terms

- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework defining this axiom and its six siblings
- [Signal Plurality](/glossary/signal-plurality/) -- Sister axiom requiring multiple independent sources per belief
- [Contradiction Preservation](/glossary/contradiction-preservation/) -- Sister axiom requiring both sides of contradictions be preserved
- [Time Decay](/glossary/time-decay/) -- Sister axiom requiring beliefs to weaken as evidence ages
- [Epistemic Pipeline](/glossary/epistemic-pipeline/) -- 16-level processing system maintaining provenance at every stage
- [Trinity Gate](/glossary/trinity-gate/) -- Verification gate that checks provenance chain integrity
- [QEVE](/glossary/qeve/) -- Verification engine using provenance for axiom compliance
- [Belief Graph](/glossary/belief-graph/) -- Data structure in which provenance chains are embedded
- [Confidence Scoring](/glossary/confidence-scoring/) -- Scoring system influenced by provenance chain characteristics
- [Knowledge Graph](/glossary/knowledge-graph/) -- Broader knowledge representation incorporating provenance
- [Blue Team](/glossary/blue-team/) -- Defensive team that validates provenance integrity across the platform
- [White Team](/glossary/white-team/) -- Verification team using provenance for formal proof construction
- [Entity Resolution](/glossary/entity-resolution/) -- Process requiring provenance to track source attribution

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Capabilities](/capabilities/) -- Platform capability descriptions

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)