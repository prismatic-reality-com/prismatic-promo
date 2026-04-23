+++
title = "Audit Trail"
weight = 208

[extra]
category = "epistemic"
description = "Immutable, append-only record of all epistemic events, belief graph mutations, confidence score computations, and enforcement actions across the platform."
related_terms = ["qeve", "belief-graph", "confidence-scoring", "provenance-mandatory", "nabla-infinity", "trinity-gate", "contradiction-preservation", "signal-plurality", "epistemic-pipeline", "cherry-picking", "epistemic-robustness", "time-decay", "entity-resolution"]
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
word_count = 3094
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Audit", "Trail", "Immutable", "glossary", "epistemic", "Prismatic Platform", "Trinity Gate", "PostgreSQL", "Field"]
tags = ["glossary", "epistemic", "audit-trail", "prismatic"]
quality_score = 97
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Audit Trail - Prismatic Platform"
+++

## Definition

An audit trail in the Prismatic Platform is an immutable, append-only, cryptographically verifiable record of every epistemic event that occurs within the system. This includes signal ingestion, belief graph mutations, confidence score computations, contradiction detections, enforcement actions (E1 warnings through E4 audits), Trinity Gate evaluations, QEVE pipeline executions, and every administrative action that affects the platform's knowledge state. The audit trail is not a secondary logging concern but a first-class component of the epistemic infrastructure, designed to satisfy the [Provenance Mandatory](/glossary/provenance-mandatory/) axiom's requirement that every belief in the system be traceable back to its origins through an unbroken, verifiable chain of custody.

The audit trail serves three distinct functions that are often conflated but are architecturally separate in the Prismatic Platform:

1. **Forensic reconstruction**: The ability to reproduce the exact state of the platform's knowledge at any historical point in time, including the evidence available, the conclusions derived, the confidence scores computed, and the contradictions present. This enables post-hoc analysis of decisions: "Given what the platform knew at time T, was the conclusion justified?"

2. **Compliance verification**: The ability to demonstrate to external auditors, regulators, and stakeholders that the platform's conclusions were derived through legitimate epistemic processes, that no evidence was suppressed or manipulated, and that all enforcement actions were correctly applied. This is particularly critical for due diligence assessments where the platform's conclusions may influence material financial decisions.

3. **System debugging**: The ability to trace a specific conclusion back through its derivation chain to identify where errors, biases, or failures occurred. When a conclusion proves wrong, the audit trail enables root cause analysis: was the evidence wrong, was the inference rule flawed, was a contradiction missed, or was the robustness assessment overly optimistic?

The audit trail is distinct from conventional application logging. Application logs record system events (errors, performance metrics, user actions). The audit trail records epistemic events (evidence ingestion, belief formation, confidence computation, contradiction detection). The two systems share infrastructure but serve fundamentally different purposes: logs diagnose system behavior; the audit trail diagnoses reasoning behavior.

## Immutability Architecture

### Append-Only Design

The audit trail is strictly append-only. Events are written once and can never be modified, deleted, or overwritten. This design principle is non-negotiable because the audit trail's forensic and compliance value depends entirely on its integrity. An audit trail that can be retroactively edited is worthless -- it proves only what someone wants it to prove, not what actually happened.

The append-only constraint is enforced at multiple architectural layers:

**Storage layer**: The underlying storage (PostgreSQL with a dedicated audit schema) uses INSERT-only permissions for the audit trail tables. The database user that writes audit events has no UPDATE or DELETE privileges. This is enforced at the PostgreSQL role level, not at the application level, preventing application-level bugs or compromises from enabling modification.

**Application layer**: The audit trail writer module exposes only `append/1` and `query/1` functions. There is no `update/2`, `delete/1`, or `truncate/0` function. The module's API makes modification impossible at the interface level.

**Cryptographic layer**: Each audit event includes a hash that chains to the previous event, creating a tamper-evident sequence. Modifying any historical event would break the hash chain, making the modification detectable. The hash function is SHA-256, and the chain is verified periodically by the integrity checker.

### Hash Chain Structure

The audit trail implements a blockchain-inspired hash chain where each event's integrity depends on all previous events:

```
Event_0: hash_0 = SHA-256(event_0_data)
Event_1: hash_1 = SHA-256(hash_0 || event_1_data)
Event_2: hash_2 = SHA-256(hash_1 || event_2_data)
...
Event_n: hash_n = SHA-256(hash_{n-1} || event_n_data)
```

The concatenation operator `||` joins the previous hash with the current event's serialized data before hashing. This creates a chain where modifying Event_k would change hash_k, which would invalidate hash_{k+1}, which would invalidate hash_{k+2}, and so on through the entire subsequent chain. Detecting a single modified event is trivial: recompute the hash chain from the beginning and compare against stored hashes.

The hash chain is verified in two modes:

**Periodic full verification**: A background process recomputes the entire hash chain from Event_0 and verifies that every stored hash matches the computed hash. This runs daily and detects any tampering that occurred since the last verification.

**Incremental verification**: On each new event append, the writer verifies that the current chain tip hash matches the expected value before extending the chain. This detects real-time tampering attempts.

### Event Retention

Audit trail events are retained indefinitely for critical operations (enforcement actions, Trinity Gate evaluations, confidence scores for decisions above the critical threshold) and for a configurable retention period (default: 7 years) for standard operations. The 7-year default aligns with common regulatory retention requirements (SOX, GDPR data processing records, financial record keeping).

Events that reach the end of their retention period are archived to cold storage (S3-compatible object storage) rather than deleted. The archive preserves the hash chain integrity -- the last retained event's hash still chains correctly to the first archived event, enabling full chain verification if historical reconstruction is required.

## Event Types

The audit trail records events across six categories, each with a specific data model and retention policy.

### Signal Ingestion Events

Recorded when a new evidence signal enters the platform:

| Field | Type | Description |
|-------|------|-------------|
| `event_type` | `:signal_ingested` | Event classification |
| `signal_id` | string | Unique identifier for the ingested signal |
| `signal_type` | atom | Classification (`:sanctions_hit`, `:ownership_change`, etc.) |
| `source_id` | string | Originating source identifier |
| `independence_group` | string | Source independence grouping |
| `weight` | float | Initial signal weight |
| `timestamp` | DateTime | Ingestion timestamp (UTC, microsecond) |
| `raw_data_hash` | string | SHA-256 hash of the raw source data |
| `processing_pipeline` | string | Version of the ingestion pipeline |

Signal ingestion events form the foundation of the provenance chain. Every subsequent belief, hypothesis, and conclusion can be traced back through the audit trail to these initial ingestion events, satisfying the [Provenance Mandatory](/glossary/provenance-mandatory/) axiom.

### Belief Graph Mutation Events

Recorded when the [belief graph](/glossary/belief-graph/) is modified:

| Field | Type | Description |
|-------|------|-------------|
| `event_type` | atom | `:node_created`, `:edge_created`, `:node_updated`, `:contradiction_detected` |
| `mutation_id` | string | Unique mutation identifier |
| `affected_nodes` | list | Node IDs affected by the mutation |
| `affected_edges` | list | Edge IDs affected by the mutation |
| `before_state` | map | Relevant graph state before mutation (for node_updated events) |
| `after_state` | map | Graph state after mutation |
| `triggering_event` | string | Reference to the event that caused this mutation |
| `graph_snapshot_ref` | string | Reference to the graph snapshot at time of mutation |

The `triggering_event` field creates an explicit causal chain between events. A signal ingestion event may trigger multiple mutation events (new evidence node, new edges to hypotheses, potential contradiction nodes). Following the `triggering_event` references backward from any graph state produces the complete causal history of that state.

### Confidence Score Events

Recorded when a [confidence score](/glossary/confidence-scoring/) is computed:

| Field | Type | Description |
|-------|------|-------------|
| `event_type` | `:confidence_computed` | Event classification |
| `hypothesis_id` | string | The scored hypothesis |
| `belief_strength` | float | Component 1 |
| `belief_strength_derivation` | map | Full computation trace (signal weights, decay factors, independence adjustments) |
| `robustness_score` | float | Component 2 |
| `robustness_breakdown` | map | Five-dimensional robustness breakdown |
| `contradiction_index` | float | Component 3 |
| `contradiction_details` | list | Specific contradictions contributing to the index |
| `final_confidence` | float | The multiplicative result |
| `threshold_context` | atom | `:critical`, `:standard`, `:exploratory`, `:research` |
| `threshold_passed` | boolean | Whether the score met the applicable threshold |
| `pipeline_version` | string | QEVE pipeline version |
| `evidence_snapshot_ref` | string | Reference to the belief graph snapshot used |

Confidence score events are the most information-dense audit records because they must enable complete reproduction of the scoring computation. Given the event record and the referenced evidence snapshot, an auditor must be able to recompute the exact score independently. This reproducibility requirement drives the inclusion of full derivation traces rather than just final values.

### Enforcement Events

Recorded when a NABLA axiom violation or enforcement action occurs:

| Field | Type | Description |
|-------|------|-------------|
| `event_type` | atom | `:e1_warning`, `:e2_block`, `:e3_halt`, `:e4_audit` |
| `violation_type` | atom | Specific violation (`:cherry_picking`, `:contradiction_burial`, `:single_source`, etc.) |
| `violating_component` | string | Module or process that triggered the violation |
| `evidence` | map | Evidence supporting the violation detection |
| `remediation_required` | string | Required corrective action |
| `remediation_completed` | boolean | Whether correction has been applied |
| `remediation_event_ref` | string | Reference to the event recording the correction |

Enforcement events are critical for compliance demonstration. They prove that the platform actively detects and responds to epistemic violations rather than passively allowing them. The `remediation_completed` and `remediation_event_ref` fields create a closed loop: the violation is recorded, the required correction is specified, and the completion of the correction is linked back to the original violation.

### Trinity Gate Events

Recorded when the [Trinity Gate](/glossary/trinity-gate/) evaluates a conclusion:

| Field | Type | Description |
|-------|------|-------------|
| `event_type` | atom | `:trinity_gate_pass`, `:trinity_gate_fail` |
| `hypothesis_id` | string | The evaluated hypothesis |
| `structural_result` | map | Layer 1 (Graph Theory) result with details |
| `logical_result` | map | Layer 2 (Rule-Based) result with details |
| `formal_result` | map | Layer 3 (Modal Logic + Lean4) result with details |
| `gate_version` | string | Trinity Gate configuration version |
| `confidence_at_evaluation` | float | Confidence score at time of gate evaluation |

Trinity Gate events record the most consequential epistemic decision the platform makes: whether a conclusion is accepted or rejected for downstream consumption. The three-layer result breakdown enables targeted debugging -- if a conclusion fails the gate, the audit trail shows exactly which layer failed and why.

### Administrative Events

Recorded when system configuration or parameters change:

| Field | Type | Description |
|-------|------|-------------|
| `event_type` | atom | `:config_changed`, `:threshold_modified`, `:decay_function_updated`, `:domain_config_changed` |
| `changed_parameter` | string | Name of the modified parameter |
| `previous_value` | term | Value before change |
| `new_value` | term | Value after change |
| `change_rationale` | string | Documented reason for the change |
| `authorized_by` | string | Identity of the authorizing party |

Administrative events close a potential accountability gap. Without them, an adversary could manipulate conclusions by modifying system parameters (lowering confidence thresholds, changing decay functions, adjusting robustness weights) rather than directly manipulating evidence. The audit trail captures these parameter changes with the same immutability guarantees as evidence and scoring events.

## Forensic Reconstruction

### Point-in-Time Recovery

The audit trail enables point-in-time reconstruction of the platform's entire epistemic state. Given a target timestamp T, the reconstruction process:

1. Identifies the most recent belief graph snapshot before T
2. Replays all mutation events between the snapshot and T, in chronological order
3. Recomputes confidence scores using the parameters that were active at time T (recovered from administrative events)
4. Verifies that the reconstructed state matches any confidence score events recorded at time T

This process produces an exact replica of the platform's knowledge state at time T: what evidence was available, what conclusions were derived, what confidence scores were computed, and what contradictions were present. The reconstruction is deterministic -- given the same audit trail, the same state is always produced.

### Counterfactual Analysis

Beyond reconstruction, the audit trail supports counterfactual analysis: "What would the conclusion have been if Signal X had not been ingested?" This is implemented by replaying the mutation log with specific events removed and observing the resulting state. Counterfactual analysis serves two purposes:

1. **Dependency analysis**: Identifying which signals are load-bearing for specific conclusions (equivalent to signal robustness in the [epistemic robustness](/glossary/epistemic-robustness/) framework, but computed from historical data rather than Monte Carlo simulation)

2. **Bias investigation**: Testing whether a specific source systematically influenced conclusions by removing all events from that source and comparing the resulting conclusions against the historical conclusions

### Decision Justification

For conclusions that influence material decisions (due diligence recommendations, security assessments, compliance determinations), the audit trail produces a structured justification document:

```
DECISION JUSTIFICATION RECORD
==============================
Conclusion: [hypothesis statement]
Confidence: [final score] ([threshold context]: [pass/fail])
Date: [timestamp]

Evidence Base:
  - Signal 1: [type] from [source] (weight: [w], age: [days], decayed: [d])
  - Signal 2: [type] from [source] (weight: [w], age: [days], decayed: [d])
  ...

Contradictions:
  - Contradiction 1: [severity] between [node A] and [node B]
  ...

Scoring Derivation:
  Belief Strength: [value] ([derivation summary])
  Robustness Score: [value] ([5-dimension breakdown])
  Contradiction Index: [value] ([contributing contradictions])
  Final Confidence: [belief] * [robustness] * (1 - [contradiction]) = [final]

Trinity Gate Evaluation:
  Structural: [pass/fail] ([summary])
  Logical: [pass/fail] ([summary])
  Formal: [pass/fail] ([summary])

Enforcement History:
  [Any violations detected and remediated during this conclusion's derivation]
```

This document is generated automatically from the audit trail and provides a complete, verifiable justification for the conclusion. It answers the question every auditor, regulator, or stakeholder will ask: "Why did you reach this conclusion, and can you prove it was derived correctly?"

## Compliance Framework

### Regulatory Alignment

The audit trail is designed to satisfy requirements from multiple regulatory frameworks:

| Framework | Requirement | How Audit Trail Satisfies |
|-----------|-------------|--------------------------|
| **GDPR Art. 22** | Right to explanation of automated decisions | Full derivation chain from evidence to conclusion |
| **NIS2 Directive** | Security incident traceability | Complete event history with cryptographic integrity |
| **SOX Section 404** | Internal control documentation | Immutable record of all epistemic controls and enforcement |
| **ISO 27001 A.12.4** | Logging and monitoring | Comprehensive event recording with integrity verification |
| **ZKB 264/2025 Sb.** | Czech cybersecurity audit requirements | Full provenance chain with hash-chain verification |

The platform does not implement these regulatory requirements as separate compliance modules. Instead, the audit trail's design naturally satisfies them because the requirements share a common foundation: the ability to demonstrate that decisions were made through documented, controlled, verifiable processes.

### External Audit Support

The audit trail provides a dedicated query interface for external auditors:

**Temporal queries**: "Show all events between T1 and T2 affecting Hypothesis H"
**Causal queries**: "Show the complete derivation chain from Evidence E to Conclusion C"
**Enforcement queries**: "Show all enforcement actions in the past 90 days"
**Integrity queries**: "Verify the hash chain for events N through M"
**Configuration queries**: "Show all parameter changes affecting confidence scoring"

These queries return structured, machine-readable responses that can be imported into external audit tools. The query interface is read-only -- auditors can examine but not modify the trail.

## Implementation Architecture

### Storage Model

The audit trail uses a dedicated PostgreSQL schema (`audit`) with partitioned tables for scalability:

```
audit.events (range-partitioned by timestamp, monthly partitions)
  ├── event_id (UUID, primary key)
  ├── event_type (enum)
  ├── timestamp (timestamptz, microsecond precision)
  ├── chain_hash (bytea, SHA-256)
  ├── previous_hash (bytea, reference to prior event)
  ├── payload (jsonb, event-type-specific data)
  ├── partition_key (date, for range partitioning)
  └── indexes: event_type, timestamp, hypothesis_id (from payload)
```

Monthly partitioning enables efficient temporal queries and straightforward retention management. Partitions older than the retention period are detached and moved to cold storage without affecting the active table's performance.

### Write Path

The audit event write path is designed for reliability over performance. Events are written synchronously -- the operation that generates the event blocks until the audit record is confirmed written. This prevents the scenario where an epistemic operation succeeds but its audit record fails, which would create an unauditable gap.

The write path:

1. Serializes the event payload to canonical JSON (deterministic field ordering for hash reproducibility)
2. Computes the chain hash: SHA-256(previous_hash || canonical_json)
3. Inserts the event record within a PostgreSQL transaction
4. Returns confirmation only after the transaction commits

If the audit write fails, the triggering epistemic operation is rolled back. This "audit-or-nothing" policy ensures that no epistemic event occurs without a corresponding audit record. The system prefers to reject a valid operation rather than allow an unauditable one.

### Read Path

The read path is optimized for the forensic reconstruction and compliance query patterns described above. Key optimizations:

**Materialized views**: Pre-computed views for common query patterns (e.g., all confidence scores for a hypothesis over time, enforcement action summaries by type)

**Covering indexes**: Composite indexes that satisfy common queries entirely from the index without accessing the main table

**Partition pruning**: Temporal queries automatically prune irrelevant monthly partitions, reducing scan scope

**JSONB path indexing**: GIN indexes on frequently queried JSONB paths (e.g., `payload->>'hypothesis_id'`) for efficient payload filtering

### Telemetry Integration

Every audit event is also published as a Telemetry event under the `[:prismatic, :audit, event_type]` namespace. This enables real-time monitoring of epistemic operations without querying the audit database. Monitoring dashboards consume Telemetry events for live status while audit queries consume the database for historical analysis.

## Relationship to Provenance

The audit trail and the [Provenance Mandatory](/glossary/provenance-mandatory/) axiom are closely related but serve different functions:

**Provenance** answers: "Where did this belief come from?" It tracks the origin and transformation history of individual knowledge claims within the epistemic pipeline.

**Audit trail** answers: "What happened when?" It records every event that affected the platform's knowledge state, in chronological order, with cryptographic integrity.

Provenance is a property of individual beliefs (each belief carries its provenance metadata). The audit trail is a property of the system (it records all events regardless of which belief they affect). The two systems cross-reference each other: a belief's provenance chain includes references to audit trail events, and audit trail events include the provenance metadata of the beliefs they affect.

Together, they provide complementary perspectives on the same epistemic history. An auditor asking "Is Conclusion C trustworthy?" can approach the question from either direction: follow C's provenance chain backward to its evidence sources, or query the audit trail for all events related to C and reconstruct its derivation history.

## Integrity Threats and Countermeasures

### Insider Tampering

The most credible threat to audit trail integrity is insider tampering: an authorized user with database access modifying historical records to conceal a failure or bias. The hash chain makes modification detectable but does not prevent it -- a sufficiently privileged user could modify a record AND recompute all subsequent hashes.

The platform mitigates this threat through:

1. **Database role separation**: The audit write role has INSERT-only permissions. No role has UPDATE or DELETE on audit tables. The DBA role that manages partitions cannot modify individual records.

2. **Hash chain anchor publication**: Periodically (default: daily), the current chain tip hash is published to an external, immutable store (a separate integrity verification service). Recomputing the chain to hide a modification would require also compromising the external store.

3. **Concurrent verification**: Multiple independent processes verify the hash chain on different schedules. All verifiers must agree. A compromised verifier is detectable through disagreement.

### Clock Manipulation

If the system clock is manipulated, events can be recorded with incorrect timestamps, potentially affecting temporal queries and time-based analysis. The platform mitigates this through:

1. **NTP synchronization monitoring**: Clock drift beyond configurable thresholds triggers alerts
2. **Monotonic ordering**: Events include a monotonic sequence number in addition to timestamp. Even if timestamps are incorrect, ordering is preserved
3. **Cross-reference validation**: Event timestamps are cross-validated against external system timestamps (database server time, NTP time) to detect discrepancies

### Storage Corruption

Hardware failures or software bugs can corrupt stored audit records. The hash chain serves as a corruption detector -- any corrupted record breaks the chain. The platform addresses corruption through:

1. **Replication**: PostgreSQL streaming replication provides at least one additional copy of the audit data
2. **Cold storage backups**: Archived partitions are stored in S3-compatible storage with checksumming
3. **Recovery from replicas**: If corruption is detected, the affected records are recovered from the replica or cold storage backup

## Scale Considerations

The audit trail grows continuously and can become a significant storage and performance concern at scale. The Prismatic Platform addresses scalability through several mechanisms:

**Partition management**: Monthly partitions keep individual table segments manageable. Queries that span partitions use PostgreSQL's partition pruning to minimize scan scope.

**Payload compression**: JSONB payloads are compressed using PostgreSQL's TOAST mechanism for large events. The derivation traces in confidence score events can be substantial; TOAST compression typically reduces their storage footprint by 60-70%.

**Selective indexing**: Not all payload fields are indexed. Only fields that appear in common query patterns (hypothesis_id, signal_id, violation_type) receive dedicated indexes. This balances query performance against index maintenance cost.

**Archive tiering**: Events beyond the active retention window are moved to cold storage, reducing the active dataset size. Cold storage events remain queryable through a federation layer but with higher latency.

At the current platform scale (thousands of signals per day, hundreds of confidence computations), the audit trail generates approximately 50-100 MB of audit data per day. At projected scale (millions of signals per day), the projected growth is 5-10 GB per day, manageable with the partitioning and archival strategy described above.

## Related Terms

- [QEVE](/glossary/qeve/) -- Verification engine whose pipeline executions are recorded in the audit trail
- [Belief Graph](/glossary/belief-graph/) -- Data structure whose mutations are the primary source of audit events
- [Confidence Scoring](/glossary/confidence-scoring/) -- Scoring computations recorded with full derivation traces
- [Provenance Mandatory](/glossary/provenance-mandatory/) -- Axiom whose traceability requirement the audit trail satisfies
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework whose axiom enforcement is recorded in the audit trail
- [Trinity Gate](/glossary/trinity-gate/) -- Verification gate whose evaluations are recorded as Trinity Gate events
- [Contradiction Preservation](/glossary/contradiction-preservation/) -- Axiom whose violations are enforcement events in the trail
- [Signal Plurality](/glossary/signal-plurality/) -- Axiom whose compliance is verifiable through signal ingestion events
- [Epistemic Pipeline](/glossary/epistemic-pipeline/) -- The 16-level pipeline whose operations the audit trail records
- [Cherry Picking](/glossary/cherry-picking/) -- Anti-pattern detectable through audit trail analysis of evidence selection
- [Epistemic Robustness](/glossary/epistemic-robustness/) -- Robustness measurements recorded in the audit trail
- [Time Decay](/glossary/time-decay/) -- Decay parameter changes recorded as administrative events
- [Entity Resolution](/glossary/entity-resolution/) -- Entity merge operations recorded as belief graph mutation events
- [Formal Verification](/glossary/formal-verification/) -- Lean4 proof results recorded in Trinity Gate events

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)