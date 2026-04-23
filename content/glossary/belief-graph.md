+++
title = "Belief Graph"
weight = 202

[extra]
category = "epistemic"
description = "Directed acyclic graph representing the platform's knowledge structure with weighted signals, provenance chains, and contradiction mappings."
related_terms = ["nabla-infinity", "signal-plurality", "provenance-mandatory", "trinity-gate", "qeve", "epistemic-pipeline", "entity-resolution", "time-decay", "contradiction-preservation", "confidence-scoring", "monte-carlo-verification"]
author = "Tomas Korcak (korczis)"
reading_time = "11 min"
word_count = 2273
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Belief", "Graph", "Directed", "glossary", "epistemic", "Prismatic Platform", "QEVE", "Entity", "Bayesian"]
tags = ["glossary", "epistemic", "belief-graph", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Belief Graph - Prismatic Platform"
+++

## Definition

A belief graph is a directed acyclic graph (DAG) that represents the platform's knowledge structure at any point in time. Nodes represent either evidence signals (raw data from external sources) or hypotheses (derived conclusions), while directed edges represent inference relationships -- "this evidence supports that hypothesis" or "this hypothesis depends on that premise." Every edge carries a weight reflecting the strength of the inferential relationship, a timestamp subject to [time decay](/glossary/time-decay/), and provenance metadata tracing the edge back to its origin.

The belief graph is the central data structure of the Prismatic Platform's epistemic infrastructure. It is the input to [QEVE](/glossary/qeve/) verification, the subject of [Trinity Gate](/glossary/trinity-gate/) evaluation, and the substrate on which all seven [NABLA Infinity](/glossary/nabla-infinity/) axioms operate. Every epistemic operation -- signal ingestion, hypothesis formation, confidence computation, contradiction detection, robustness testing -- is ultimately an operation on the belief graph.

The distinction between a belief graph and a conventional knowledge graph is fundamental. A knowledge graph asserts facts: "Entity A is related to Entity B." A belief graph asserts beliefs about facts, with quantified uncertainty: "There is evidence from two independent sources, weighted 0.73 and 0.68, that Entity A may be related to Entity B, with a contradiction index of 0.12 and a time-decayed confidence of 0.71." Knowledge graphs pretend certainty. Belief graphs quantify doubt.

## Graph Theory Foundations

### Directed Acyclic Graphs

A DAG is a directed graph containing no cycles. In the belief graph context, this structural constraint has a precise epistemic meaning: circular reasoning is forbidden. If Hypothesis A supports Hypothesis B, then B cannot support A, either directly or through any chain of intermediate nodes. The acyclicity constraint is enforced structurally by [Trinity Gate](/glossary/trinity-gate/)'s first layer (Structural Consistency) and is the most common point of gate failure, accounting for approximately 40% of rejections.

Formally, the belief graph G = (V, E) consists of:
- **V**: A set of vertices, partitioned into evidence nodes V_e and hypothesis nodes V_h
- **E**: A set of directed edges (u, v) where u, v are in V, representing "u supports v"
- **Acyclicity constraint**: There exists no sequence v_1, v_2, ..., v_k where (v_i, v_{i+1}) is in E for all i, and v_k = v_1

### Topological Ordering

Because the belief graph is a DAG, it admits a topological ordering: a linear arrangement of all nodes such that for every edge (u, v), node u appears before v. The topological ordering defines the evaluation sequence for the [QEVE](/glossary/qeve/) pipeline -- evidence nodes are evaluated first, then intermediate hypotheses in dependency order, then final conclusions. This ordering guarantees that every hypothesis is evaluated only after all of its supporting evidence has been processed.

The platform computes the topological ordering using Kahn's algorithm, which also serves as a cycle detection mechanism: if the algorithm cannot produce a complete ordering (some nodes remain with nonzero in-degree), the graph contains a cycle and is structurally invalid.

### Graph Density and Connectivity

The belief graph's density -- the ratio of actual edges to possible edges -- is a diagnostic metric. An extremely sparse graph (density < 0.05) may indicate insufficient evidence linkage: signals exist but have not been connected to hypotheses. An extremely dense graph (density > 0.50) may indicate over-linking: spurious connections that dilute genuine evidential relationships.

Connectivity analysis identifies isolated components -- subgraphs that are not connected to the main belief graph. Isolated components represent pockets of evidence that are not integrated into the overall assessment, potentially indicating blind spots or under-explored domains.

## Node Types

### Evidence Nodes

Evidence nodes represent raw signals from external sources. Each evidence node carries the full data model specified by the [QEVE](/glossary/qeve/) Evidence structure:

| Field | Type | Description |
|-------|------|-------------|
| `signal_type` | atom | Classification (`:sanctions_hit`, `:ownership_change`, `:lawsuit`, etc.) |
| `weight` | float | Signal strength [0.0, 1.0], subject to [time decay](/glossary/time-decay/) |
| `source_id` | string | Unique identifier for the originating source |
| `independence_group` | string | Source independence grouping for [Signal Plurality](/glossary/signal-plurality/) validation |
| `timestamp` | DateTime | Collection timestamp (UTC, microsecond precision) |
| `provenance` | map | Full chain of custody per [Provenance Mandatory](/glossary/provenance-mandatory/) |
| `raw_data_hash` | string | SHA-256 hash of original data for integrity verification |

Evidence nodes are leaf nodes in the DAG -- they have no incoming edges (no evidence supports evidence; evidence comes from external observation). They have outgoing edges to the hypothesis nodes they support.

### Hypothesis Nodes

Hypothesis nodes represent derived conclusions at varying levels of abstraction, from low-level factual claims ("Firm X changed ownership structure in 2025") to high-level risk assessments ("Firm X presents elevated acquisition risk"). Each hypothesis node carries:

| Field | Type | Description |
|-------|------|-------------|
| `statement` | string | Natural language description of the claim |
| `premises` | list | References to supporting evidence or lower-level hypothesis nodes |
| `rule_id` | string | Identifier of the inference rule deriving this hypothesis |
| `risk_level` | atom | Assessed risk level (`:low`, `:medium`, `:high`, `:critical`) |
| `threshold` | float | Minimum [confidence threshold](/glossary/confidence-threshold/) for acceptance |
| `confidence` | float | Current computed confidence, incorporating all axiom effects |
| `contradiction_index` | float | Proportion of contradictory evidence [0.0, 1.0] |

Hypothesis nodes can have both incoming edges (from their supporting evidence or premises) and outgoing edges (to higher-level hypotheses they support). Terminal hypothesis nodes -- those with no outgoing edges to other hypotheses -- represent the final conclusions of the analysis.

### Contradiction Nodes

A distinctive feature of the belief graph is explicit contradiction representation. When two signals or hypotheses contradict each other, the contradiction is not resolved but represented as a dedicated node:

| Field | Type | Description |
|-------|------|-------------|
| `contradicting_nodes` | tuple | The pair of nodes in contradiction |
| `severity` | atom | Contradiction strength (`:weak`, `:moderate`, `:strong`) |
| `type` | atom | Contradiction category (`:direct`, `:inferential`, `:temporal`) |
| `resolution_status` | atom | Always `:preserved` (resolution is forbidden by NABLA axiom) |

Contradiction nodes implement the [Contradiction Preservation](/glossary/contradiction-preservation/) axiom structurally. They are visible to all downstream consumers and factor into [confidence scoring](/glossary/confidence-scoring/) through the contradiction index.

## Edge Properties

Every edge in the belief graph carries metadata beyond the bare inferential relationship:

| Property | Type | Description |
|----------|------|-------------|
| `weight` | float | Strength of the inferential relationship [0.0, 1.0] |
| `rule_id` | string | The inference rule justifying this edge |
| `created_at` | DateTime | When this edge was established |
| `decay_function` | atom | Time decay model applied to this edge (`:exponential`, `:linear`, `:step`) |
| `half_life` | Duration | Domain-specific half-life for decay calculation |
| `provenance` | map | How this edge was derived (automatic inference, analyst judgment, etc.) |

Edge weights are not static. They decay over time according to the configured decay function, implementing the [NABLA Infinity](/glossary/nabla-infinity/) Time Decay axiom at the graph level. An edge established 18 months ago with an exponential decay function and 6-month half-life would have its weight reduced by approximately 87.5% (three half-lives of decay).

## Belief Propagation

Confidence propagates through the belief graph from evidence nodes to terminal hypotheses. The propagation algorithm combines edge weights, time decay, contradiction indices, and source independence into a single confidence value at each node.

### Forward Propagation

Starting from evidence nodes (processed in topological order), confidence propagates upward:

```
confidence(hypothesis) = aggregate(
  for each supporting edge (evidence, hypothesis):
    evidence.weight * edge.weight * decay_factor(edge) * independence_factor(evidence)
)
```

The aggregation function is not a simple sum or average. It implements a weighted combination that respects [Signal Plurality](/glossary/signal-plurality/) (requiring at least two independent contributing signals) and penalizes correlated sources (reducing the effective weight of signals sharing an `independence_group`).

### Contradiction Impact

Contradictions reduce confidence through the contradiction index:

```
effective_confidence = raw_confidence * (1 - contradiction_index)
```

A hypothesis with raw confidence 0.90 and contradiction index 0.20 has effective confidence 0.72. This multiplicative penalty ensures that contradictions cannot be overwhelmed by additional supporting evidence -- adding more supporting signals increases raw confidence but does not reduce the contradiction index. Only resolving the contradiction (by one side being definitively disproven) reduces the index.

### Absence Propagation

The [NABLA Infinity](/glossary/nabla-infinity/) "Absence Informative" axiom requires tracking expected-but-missing evidence. Absence propagates as a specific signal type: a node representing "expected evidence X was not found." This node participates in the belief graph with a configurable negative weight, reducing confidence in hypotheses that depend on the expected evidence.

## Implementation Architecture

### ETS-Backed Storage

The belief graph is stored in Erlang Term Storage (ETS) tables for high-performance concurrent access. The ETS implementation provides:

- **O(1) node lookup** by node identifier
- **Concurrent read access** from multiple BEAM processes (pipeline stages operate in parallel)
- **Atomic write operations** for graph modification
- **No serialization overhead** (ETS stores Erlang terms natively)

The graph is partitioned across three ETS tables:
- `belief_nodes`: Node data indexed by node ID
- `belief_edges`: Edge data indexed by (source, target) tuple
- `belief_contradictions`: Contradiction data indexed by contradiction ID

### Persistent Snapshots

ETS provides in-memory storage that is lost on process termination. The platform periodically snapshots the belief graph to persistent storage (PostgreSQL) for [audit trail](/glossary/audit-trail/) compliance and recovery. Snapshots are timestamped and immutable -- they represent the exact state of the belief graph at a specific moment, enabling forensic reconstruction of any historical assessment.

### Graph Mutations

All mutations to the belief graph are logged and versioned. Adding a signal, creating an edge, or discovering a contradiction generates a mutation event that is:

1. Applied to the in-memory ETS graph
2. Recorded in the mutation log (append-only)
3. Published via Telemetry for monitoring
4. Persisted to the [audit trail](/glossary/audit-trail/)

This architecture enables both real-time operation (fast ETS reads) and full auditability (complete mutation history).

## Comparison with Related Structures

### Knowledge Graphs

Knowledge graphs (e.g., Wikidata, Google Knowledge Graph) represent factual assertions as subject-predicate-object triples. They are authoritative: facts are either present or absent, with no notion of confidence, contradiction, or decay. Belief graphs generalize knowledge graphs by adding uncertainty quantification, temporal dynamics, and contradiction preservation.

| Dimension | Knowledge Graph | Belief Graph |
|-----------|----------------|--------------|
| **Assertions** | Facts (true/false) | Beliefs (weighted, decaying) |
| **Contradictions** | Resolved before insertion | Preserved indefinitely |
| **Temporal dynamics** | Static (updated discretely) | Continuous decay functions |
| **Confidence** | Implicit (present = true) | Explicit, quantified, formula-derived |
| **Provenance** | Optional metadata | Mandatory, auditable chain |

### Bayesian Networks

Bayesian networks represent probabilistic dependencies between variables. Nodes are random variables, edges represent conditional dependencies, and inference computes posterior probabilities given evidence. Belief graphs share the DAG structure and probabilistic reasoning but differ in several key ways:

- Bayesian networks require well-defined probability distributions at each node; belief graphs support incomplete and undefined distributions
- Bayesian networks resolve contradictions through probabilistic inference; belief graphs preserve contradictions explicitly
- Bayesian networks assume fixed structure; belief graphs evolve dynamically as new evidence arrives
- Bayesian networks produce point estimates (posterior probabilities); belief graphs produce confidence intervals with robustness scores

The platform's confidence propagation algorithm draws on Bayesian inference principles but extends them with [NABLA Infinity](/glossary/nabla-infinity/) axiom enforcement, contradiction preservation, and the multiplicative [confidence scoring](/glossary/confidence-scoring/) formula.

### Argumentation Frameworks

Dung's abstract argumentation frameworks (1995) represent arguments and attacks between them. An argument is "acceptable" if it is defended against all attacks. Belief graphs incorporate argumentation concepts -- contradictions function as attacks -- but extend them with weighted evidence, temporal decay, and formal verification through [QEVE](/glossary/qeve/).

## Graph Operations

### Signal Ingestion

When a new evidence signal arrives, the platform:

1. Creates an evidence node with full metadata
2. Checks independence group against existing signals
3. Identifies relevant hypothesis nodes that the signal supports or contradicts
4. Creates edges from the signal to relevant hypotheses
5. If contradictions are detected, creates contradiction nodes
6. Recomputes confidence for all affected hypotheses (forward propagation)
7. Logs the mutation for [audit trail](/glossary/audit-trail/)

### Hypothesis Formation

New hypotheses are formed by inference rules that combine existing nodes:

1. An inference rule matches a pattern of existing nodes
2. A new hypothesis node is created with the matched nodes as premises
3. Edges are created from premises to hypothesis
4. [Signal Plurality](/glossary/signal-plurality/) is verified (at least 2 independent supporting signals)
5. Confidence is computed through forward propagation
6. The hypothesis is evaluated against its acceptance threshold

### Pruning and Decay

The belief graph undergoes periodic maintenance:

- **Time decay application**: All edge weights are recomputed with updated decay factors
- **Stale node identification**: Nodes whose all supporting evidence has decayed below a minimum threshold are flagged
- **Orphan detection**: Nodes with no incoming or outgoing edges are identified and reported
- **Snapshot archival**: Old snapshots beyond the retention period are archived to cold storage

Pruning never deletes nodes or edges from the active graph. Instead, it marks them as `decayed_below_threshold` and excludes them from active propagation while preserving them in the audit trail. This ensures that historical reconstruction remains possible even after evidence has fully decayed.

## Role in QEVE Pipeline

The belief graph is the input to Stage 1 (Graph Build) of the [QEVE](/glossary/qeve/) pipeline. Stage 1 constructs or refreshes the belief graph from available evidence, enforcing NABLA axioms during construction. The subsequent stages operate on the graph:

- **Stage 2 (Structural Check)**: Validates DAG integrity, detects cycles, checks connectivity
- **Stage 3 (Logical Check)**: Validates inference rules applied in the graph
- **Stage 4 ([Formal Verification](/glossary/formal-verification/))**: Extracts theorems from the graph and proves them in Lean4
- **Stage 5 ([Monte Carlo Verification](/glossary/monte-carlo-verification/))**: Perturbs the graph to test conclusion robustness

The belief graph is not a passive data structure. It is the medium through which the platform's epistemic reasoning is expressed, validated, and stress-tested.

## Entity Resolution Integration

[Entity resolution](/glossary/entity-resolution/) -- determining whether two references point to the same real-world entity -- is a critical operation on the belief graph. When entity resolution identifies that two previously separate nodes refer to the same entity, the graph undergoes a merge operation:

1. The two nodes are consolidated into a single node
2. All incoming and outgoing edges from both nodes are transferred to the merged node
3. Contradictions between signals that now share a node are explicitly created
4. Confidence is recomputed for all affected downstream hypotheses

Entity resolution can both strengthen and weaken conclusions. Merging two entities with consistent evidence increases signal plurality. Merging two entities with contradictory evidence creates new contradictions and reduces confidence.

## Related Terms

- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework whose axioms govern belief graph construction and maintenance
- [QEVE](/glossary/qeve/) -- Verification pipeline that operates on the belief graph
- [Trinity Gate](/glossary/trinity-gate/) -- Verification gate that evaluates belief graph structural consistency
- [Signal Plurality](/glossary/signal-plurality/) -- Axiom enforcing minimum evidence diversity in the graph
- [Provenance Mandatory](/glossary/provenance-mandatory/) -- Axiom requiring full traceability for all graph nodes and edges
- [Time Decay](/glossary/time-decay/) -- Temporal weighting mechanism applied to graph edges
- [Contradiction Preservation](/glossary/contradiction-preservation/) -- Axiom requiring explicit contradiction representation in the graph
- [Confidence Scoring](/glossary/confidence-scoring/) -- Formula computing confidence from belief graph structure
- [Monte Carlo Verification](/glossary/monte-carlo-verification/) -- Robustness testing through belief graph perturbation
- [Formal Verification](/glossary/formal-verification/) -- Theorem extraction and proof from belief graph claims
- [Entity Resolution](/glossary/entity-resolution/) -- Node merging operation on the belief graph
- [Epistemic Pipeline](/glossary/epistemic-pipeline/) -- The 16-level pipeline in which the belief graph is processed
- [Audit Trail](/glossary/audit-trail/) -- Immutable record of all belief graph mutations
- [Confidence Threshold](/glossary/confidence-threshold/) -- Decision thresholds applied to belief graph confidence scores

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)