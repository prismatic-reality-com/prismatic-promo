+++
title = "3nl-l2-neural"
weight = 12
[extra]
domain = "multi-class"
level = "L3"
description = "Pattern recognition, embeddings, and machine learning predictions within the 3NL framework"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "color-teams", "telemetry", "osint", "3nl", "ets", "genserver", "circuit-breaker"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1800
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["3nl-l2-neural", "Pattern", "agents", "agent", "Prismatic Platform", "Neural", "Linguistic", "Embedding"]
tags = ["agents", "agent", "3nl-l2-neural", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "3nl-l2-neural - Prismatic Platform"
+++

## Overview

The [3NL](/glossary/three-nl/) L2 Neural agent operates as an L3 [strategic command](/glossary/strategic-command/) agent providing the machine learning and pattern recognition layer of the Three-Layer Neural-Logical-Linguistic (3NL) framework within the Prismatic Platform. This agent implements embedding generation, pattern detection, classification, similarity matching, and anomaly detection capabilities that enable the platform to reason about data through statistical and neural methods. Where L1 Logic provides mathematical certainty through deductive proof and L3 Linguistic provides semantic understanding of natural language, L2 Neural excels at discovering patterns in high-dimensional data spaces that are invisible to symbolic reasoning.

The L2 Neural layer occupies a unique position in the 3NL architecture. It is the layer most comfortable with uncertainty -- its outputs are inherently probabilistic, expressing confidence as continuous values rather than binary proven/unproven states. This probabilistic nature makes L2 Neural the default routing target for queries where formal proof is impractical and linguistic analysis is insufficient. Pattern recognition across behavioral [telemetry](/glossary/telemetry/), anomaly detection in security event streams, and similarity matching across intelligence reports all rely on the neural layer's ability to generalize from observed data to novel situations.

The agent supports multiple network architectures -- attention mechanisms for focused processing, convolutional neural networks for structural pattern detection, recurrent neural networks for sequential data, and transformers for complex relational reasoning. Architecture selection is automatic based on data characteristics, though consuming agents can request specific architectures when domain knowledge indicates a preferred approach. All neural computations are reproducible through fixed random seeds and deterministic execution modes, ensuring that the same input produces the same output across repeated invocations.

## Operational Domain

The L2 Neural agent operates within the 3NL framework as the statistical reasoning engine. It receives pattern recognition and classification requests from the 3NL Coordinator, applies appropriate neural architectures to analyze input data, and returns results with confidence scores and feature attribution data. The agent is particularly valuable for tasks involving high-dimensional data, where symbolic reasoning cannot capture the complexity of patterns and linguistic analysis cannot process non-textual inputs.

The operational scope includes both online inference (real-time pattern detection on streaming data) and batch analysis (comprehensive pattern discovery across historical datasets). The agent maintains pre-computed embedding indices for frequently accessed data, enabling sub-millisecond similarity lookups. Embedding generation produces 384-dimensional vector representations that capture semantic proximity -- items that are functionally or conceptually similar map to nearby points in the embedding space, enabling efficient nearest-neighbor search for intelligence correlation and entity resolution.

## Key Capabilities

- **384-dimensional embedding generation** converting structured and unstructured data into dense vector representations that capture semantic similarity, enabling efficient nearest-neighbor search for intelligence correlation, entity resolution, and duplicate detection across the platform's data stores
- **Multi-architecture pattern recognition** supporting sequence patterns, keyword patterns, and structural patterns through configurable neural network architectures selected automatically based on input data characteristics
- **Multi-class classification** categorizing inputs into domain-specific categories with confidence scores and feature attribution, explaining which input features contributed most to each classification decision
- **Anomaly detection** using isolation forest algorithms and statistical outlier detection to identify unusual patterns in telemetry data, security event streams, and behavioral profiles, with configurable sensitivity thresholds
- **Similarity matching** computing pairwise and batch similarity scores across document collections, entity profiles, and behavioral patterns using cosine similarity over embedding vectors with optional domain-specific distance [metrics](/glossary/metrics/)
- **Continuous model adaptation** through online learning that updates model parameters incrementally as new data arrives, maintaining model relevance without requiring full retraining cycles

## Technical Architecture

The L2 Neural agent is implemented as an [OTP](/glossary/otp/) application with a [GenServer](/glossary/genserver/) managing model state, an embedding cache in [ETS](/glossary/ets/), and a computation pipeline that routes inference requests to the appropriate neural architecture. Model weights are loaded at startup and can be hot-swapped through the [BEAM](/glossary/beam/)'s code reloading capabilities.

```elixir
defmodule Prismatic3NL.Layers.L2Neural do
  use GenServer

  @embedding_dim 384
  @pattern_types [:sequence, :keyword, :structural]
  @classification_classes [:positive, :negative, :neutral]

  def embed(input, opts \\ []) do
    GenServer.call(__MODULE__, {:embed, input, opts})
  end

  def recognize_patterns(data, opts \\ []) do
    pattern_types = Keyword.get(opts, :types, @pattern_types)
    GenServer.call(__MODULE__, {:patterns, data, pattern_types})
  end

  def classify(input, opts \\ []) do
    GenServer.call(__MODULE__, {:classify, input, opts})
  end

  def detect_anomalies(dataset, opts \\ []) do
    algorithm = Keyword.get(opts, :algorithm, :isolation_forest)
    GenServer.call(__MODULE__, {:anomalies, dataset, algorithm})
  end

  @impl true
  def handle_call({:embed, input, opts}, _from, state) do
    embedding = compute_embedding(input, state.model, opts)
    cache_embedding(input, embedding, state.cache_table)
    {:reply, {:ok, %{vector: embedding, dim: @embedding_dim}}, state}
  end
end
```

The embedding cache uses an ETS table with `:set` type, keyed by content hash. Cache entries include a TTL (time-to-live) that ensures stale embeddings are recomputed when the underlying data changes. The cache hit rate typically exceeds 85% for repeated queries against the same intelligence corpus, reducing computation time by an order of magnitude for common access patterns.

The anomaly detection subsystem operates in two modes. Batch mode constructs an isolation forest from a complete dataset and scores every point. Streaming mode maintains a running model that evaluates each new data point against the established baseline, flagging anomalies in real-time as they occur. Streaming mode is critical for security monitoring, where detecting behavioral anomalies as they happen is more valuable than discovering them in retrospective analysis.

## Decision Framework

The L2 Neural agent produces probabilistic outputs with explicit confidence bounds. Unlike L1 Logic's ternary decision space (proven/disproven/unprovable), the neural layer operates in a continuous confidence space where every output carries a probability estimate.

| Confidence Range | Interpretation | Routing Recommendation |
|-----------------|----------------|----------------------|
| 0.90 - 1.00 | High confidence | Single-layer result sufficient |
| 0.70 - 0.89 | Moderate confidence | Recommend L1 or L3 corroboration |
| 0.50 - 0.69 | Low confidence | Multi-layer synthesis required |
| 0.00 - 0.49 | Insufficient signal | Flag for manual review |

The agent's confidence calibration is validated through periodic holdout testing -- a subset of inputs with known ground truth is processed through the neural layer, and the reported confidence values are compared against actual accuracy. Well-calibrated confidence means that when the agent reports 80% confidence, the prediction is correct approximately 80% of the time. Calibration drift triggers automatic model revalidation through the [SEADF](/glossary/seadf/) quality monitoring subsystem.

Feature attribution accompanies every classification and anomaly detection result, explaining which input features contributed most to the output. This transparency is critical for the NABLA provenance axiom -- consuming agents can trace neural conclusions back to the specific data patterns that produced them.

## Authority Level

**L3** - Strategic Command. The L2 Neural agent holds multi-domain coordination authority within the 3NL framework. Its authority scope covers pattern analysis requests from any platform domain, including security telemetry analysis, [OSINT](/glossary/osint/) intelligence correlation, and behavioral profiling. The agent operates in a read-only posture toward external data sources, consuming data for analysis without modifying source records.

The L3 designation permits the neural layer to coordinate with peer reasoning layers and to request additional context from domain-specific agents when input data requires enrichment. The authority does not extend to enforcement actions -- the neural layer detects and classifies patterns but does not take autonomous action on its findings.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [3nl-coordinator](/agents/3nl-coordinator/) | Coordination Hub | Receives pattern analysis requests and returns probabilistic results |
| [3nl-l1-logic](/agents/3nl-l1-logic/) | Peer Layer | Formal verification complement for neural pattern discoveries |
| [3nl-l3-linguistic](/agents/3nl-l3-linguistic/) | Peer Layer | Linguistic analysis complement for text-based pattern recognition |
| [3nl-l7-transcendent](/agents/3nl-l7-transcendent/) | Transcendent Layer | Quantum-coherent pattern synthesis across consciousness layers |
| [bayesian-analyst](/agents/bayesian-analyst/) | Statistical Partner | Bayesian uncertainty quantification for neural confidence calibration |
| [blue-drift-detector](/agents/blue-drift-detector/) | Drift Monitor | Behavioral and configuration drift detection using neural anomaly detection |

## Performance Characteristics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Embedding generation** | < 15ms | < 50ms | Time for single-input 384-dim embedding computation |
| **Batch embedding** | < 500ms/100 | < 1s/100 | Throughput for batch embedding generation |
| **Pattern recognition** | < 100ms | < 200ms | Time for multi-type pattern detection on single input |
| **Classification latency** | < 30ms | < 50ms | Time for single-input classification with confidence |
| **Anomaly detection (streaming)** | < 10ms | < 20ms | Per-event anomaly scoring in streaming mode |
| **Embedding cache hit rate** | > 85% | > 80% | Cache hit rate for repeated queries |

## Enforcement

All L2 Neural operations are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Neural outputs must include confidence scores and feature attribution for every result. Models must pass calibration validation before deployment, and calibration drift exceeding 5% triggers automatic revalidation. Anomaly detection thresholds must be evidence-based, derived from statistical analysis of baseline data rather than arbitrary configuration. No neural classification is accepted as ground truth without cross-validation through at least one additional reasoning layer for critical decisions. The [Trinity Gate](/glossary/trinity-gate/) structural consistency check validates that neural pattern graphs form valid directed acyclic graphs before results are propagated to consuming agents.

## Related Resources

- [3NL Framework](/glossary/three-nl/) -- The multi-paradigm reasoning architecture
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework governing confidence calibration requirements
- [Telemetry Integration](/capabilities/telemetry-integration/) -- Platform-wide telemetry feeding neural analysis pipelines
- [Autonomous Self-Healing](/capabilities/autonomous-self-healing/) -- Self-healing capabilities for model recovery
- [OSINT Sources](/osint/) -- Intelligence sources analyzed by neural pattern recognition
- [Color Teams](/teams/) -- Adversarial-defensive teams using neural anomaly detection

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)