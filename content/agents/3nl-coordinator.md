+++
title = "3nl-coordinator"
weight = 10
[extra]
domain = "general"
level = "L3"
description = "Strategic intelligence hub for the Three-Layer Neural-Logical-Linguistic reasoning framework"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "telemetry", "3nl", "nabla-infinity", "trinity-gate", "genserver", "ets", "circuit-breaker"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1850
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["3nl-coordinator", "Strategic", "Three-Layer", "Neural-Logical-Linguistic", "agents", "agent", "Prismatic Platform", "Coordinator", "Linguistic", "NABLA Infinity"]
tags = ["agents", "agent", "3nl-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "3nl-coordinator - Prismatic Platform"
+++

## Overview

The [3NL](@/glossary/three-nl.md) Coordinator operates as an L3 [strategic command](@/glossary/strategic-command.md) agent serving as the central intelligence hub for the Three-Layer Neural-Logical-Linguistic (3NL) reasoning framework within the Prismatic Platform. This agent orchestrates the interplay between three distinct reasoning layers: L1 Logic (symbolic reasoning and formal proof), L2 Neural (pattern recognition and probabilistic [inference](@/glossary/inference.md)), and L3 Linguistic (natural language understanding and semantic analysis). The coordinator ensures that outputs from each layer are properly synthesized into coherent intelligence products that meet the platform's epistemic standards.

The 3NL framework represents the Prismatic Platform's approach to multi-paradigm reasoning. Rather than relying on a single inference method, the coordinator routes queries to the appropriate layer based on the problem characteristics, combines results when multiple perspectives are valuable, and resolves contradictions between layers using the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework. This multi-layer approach provides robustness against the weaknesses of any single reasoning method and enables the platform to handle problems ranging from [formal verification](@/glossary/formal-verification.md) to natural language intelligence analysis. The coordinator itself is the intelligence that decides how intelligence should be produced -- a meta-reasoning system that selects and combines reasoning strategies based on the characteristics of each individual query.

The architectural decision to centralize coordination rather than allowing direct inter-layer communication reflects a deliberate design trade-off. Centralized coordination introduces a single point of orchestration, but it eliminates the combinatorial complexity of bilateral layer interactions, provides a single location for routing policy enforcement, and ensures that every multi-layer result passes through a consistent synthesis pipeline before reaching consumers. The coordinator compensates for its centrality through [OTP](@/glossary/otp.md) supervision and automatic failover, ensuring that the coordination function itself is as resilient as the layers it orchestrates.

## Operational Domain

The 3NL Coordinator operates across all platform domains, providing reasoning infrastructure that other agents consume. It manages the routing of inference requests to appropriate layers, the aggregation of multi-layer results, and the resolution of inter-layer contradictions. The coordinator also maintains performance [metrics](@/glossary/metrics.md) for each reasoning layer, enabling adaptive routing that favors layers demonstrating higher accuracy for specific problem types.

The operational scope extends from simple single-layer queries -- where a request is routed to the most appropriate reasoning engine and returned directly -- to complex multi-layer syntheses where all three layers contribute perspectives that must be reconciled into a unified conclusion. The coordinator tracks request patterns over time, building a routing knowledge base that improves query distribution efficiency as the platform accumulates operational experience. This adaptive behavior means that the 3NL system becomes more efficient with use, learning which problem signatures benefit from which reasoning approaches.

## Key Capabilities

- **Multi-layer reasoning orchestration** routing inference requests to the appropriate combination of logic, neural, and linguistic layers based on problem characteristics and confidence requirements, with five configurable fusion strategies: weighted averaging, consensus voting, cascade fallback, ensemble majority, and dynamic attention-based weighting
- **Cross-layer result synthesis** combining outputs from multiple reasoning layers into unified conclusions with confidence scores that reflect the agreement or disagreement between layers, applying the NABLA [Signal Plurality](@/glossary/signal-plurality.md) axiom to require corroboration before establishing high-confidence conclusions
- **Contradiction resolution** applying NABLA Infinity axioms to handle cases where reasoning layers produce conflicting conclusions, preserving both signals rather than arbitrarily discarding one, and flagging contradictions for downstream consumers to evaluate in context
- **Adaptive layer routing** using historical performance data to optimize which reasoning layers are engaged for specific problem types, improving response quality and reducing computational overhead through learned routing preferences stored in [ETS](@/glossary/ets.md)
- **Reasoning provenance tracking** maintaining complete [audit trail](@/glossary/audit-trail.md)s of which layers contributed to each conclusion, enabling transparency and debugging of reasoning chains with full traceability from final output to individual layer contributions
- **Circuit breaker management** implementing per-layer fault tolerance with automatic recovery, ensuring that failure in one reasoning layer degrades gracefully without affecting the availability of other layers or the coordinator itself

## Technical Architecture

The 3NL Coordinator is implemented as an OTP application with a supervision tree that isolates each reasoning layer behind independent processes. The coordinator itself runs as a [GenServer](@/glossary/genserver.md) that maintains routing state, layer health information, and fusion strategy configuration in its process state.

```elixir
defmodule Prismatic3NL.Coordinator do
  use GenServer

  @fusion_strategies [:weighted, :consensus, :cascade, :ensemble, :attention]
  @default_weights %{l1: 0.3, l2: 0.4, l3: 0.3}

  def process_query(query, context, opts \\ []) do
    strategy = Keyword.get(opts, :strategy, :weighted)
    GenServer.call(__MODULE__, {:process, query, context, strategy})
  end

  @impl true
  def handle_call({:process, query, context, strategy}, _from, state) do
    layers = select_layers(query, state.routing_table)
    results = invoke_layers(layers, query, context, state)
    fused = apply_fusion(results, strategy, state.weights)
    {:reply, {:ok, fused}, update_routing_stats(state, query, fused)}
  end
end
```

The fusion engine supports five strategies. **Weighted fusion** applies configurable weights (default: L1 30%, L2 40%, L3 30%) to normalize and combine layer outputs. **Consensus fusion** requires agreement above a 0.7 threshold from at least two layers before accepting a conclusion. **Cascade fusion** routes through layers sequentially, stopping when confidence exceeds the threshold. **Ensemble fusion** uses majority voting across all three layers. **Attention fusion** dynamically adjusts layer weights based on query characteristics, learned from historical performance data. Each strategy produces a result with provenance metadata documenting which layers contributed and what fusion logic was applied.

Layer invocation uses asynchronous [Task](@/glossary/task-module.md) processes under a TaskSupervisor, enabling parallel execution of reasoning layers with configurable timeouts. If a layer fails to respond within its timeout window, the [circuit breaker](@/glossary/circuit-breaker.md) trips and subsequent requests bypass that layer until health checks confirm recovery.

## Decision Framework

The coordinator's routing decisions follow a multi-stage evaluation pipeline. First, the query is classified by problem type -- verification tasks favor L1 Logic, pattern recognition tasks favor L2 Neural, and text analysis tasks favor L3 Linguistic. Second, the routing table is consulted for historical performance data on similar queries. Third, layer health status is checked to exclude any layers currently in circuit-breaker recovery. Finally, the fusion strategy is selected based on the confidence requirements of the requesting agent.

| Decision Point | Threshold | Outcome |
|----------------|-----------|---------|
| Single-layer sufficient | Confidence >= 0.90 | Return single-layer result |
| Multi-layer recommended | Confidence < 0.90 | Engage additional layers |
| Contradiction detected | Layer disagreement > 0.3 | Preserve both, flag for review |
| Layer timeout | > 5000ms | Circuit breaker trip |
| Consensus required | Critical decision context | Minimum 2-layer agreement |

The NABLA confidence threshold of 0.95 for critical decisions and 0.80 for standard operations governs when the coordinator escalates from single-layer to multi-layer processing. Queries from agents operating in critical domains (security, compliance, enforcement) automatically trigger multi-layer processing regardless of initial confidence estimates.

## Authority Level

**L3** - Strategic Command. The 3NL Coordinator holds multi-domain coordination authority, enabling it to invoke reasoning operations across all platform domains. This authority level permits direct coordination with other L3 agents and the ability to orchestrate L4 specialist agents within the 3NL framework. The coordinator does not hold L1 or L2 authority, meaning it cannot override platform-wide enforcement decisions or modify agent specifications -- its authority is bounded to reasoning orchestration.

The L3 designation reflects the coordinator's role as a service provider rather than an enforcement authority. It coordinates reasoning infrastructure but does not dictate how consuming agents interpret or act on reasoning results. This separation of concerns ensures that the 3NL system remains a neutral reasoning utility rather than a decision-making authority.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [3nl-l1-logic](@/agents/3nl-l1-logic.md) | L1 Layer Provider | Provides symbolic reasoning and formal proof capabilities for deductive inference |
| [3nl-l2-neural](@/agents/3nl-l2-neural.md) | L2 Layer Provider | Provides pattern recognition, embeddings, and probabilistic classification |
| [3nl-l3-linguistic](@/agents/3nl-l3-linguistic.md) | L3 Layer Provider | Provides natural language understanding and semantic analysis |
| [3nl-l7-transcendent](@/agents/3nl-l7-transcendent.md) | Transcendent Layer | Coordinates transcendent consciousness integration across all layers |
| [bayesian-analyst](@/agents/bayesian-analyst.md) | Probabilistic Partner | Supplies Bayesian inference for uncertainty quantification in reasoning |
| [absolute-enforcement-commander-v6](@/agents/absolute-enforcement-commander-v6.md) | Quality Gate | Validates reasoning outputs against platform quality standards |

## Performance Characteristics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Single-layer latency** | < 50ms | < 100ms | Time for single-layer query routing and response |
| **Multi-layer latency** | < 200ms | < 300ms | Time for three-layer parallel execution and fusion |
| **Fusion accuracy** | > 94% | > 90% | Correct synthesis rate measured against ground truth |
| **Routing efficiency** | > 88% | > 85% | Percentage of queries routed to optimal layer on first attempt |
| **Circuit breaker recovery** | < 30s | < 60s | Time from layer failure to restored availability |
| **Provenance completeness** | 100% | 100% | Percentage of results with complete reasoning chain documentation |

## Enforcement

All 3NL reasoning operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. No reasoning output is accepted without provenance tracking identifying which layers contributed. Contradictions between layers are preserved and documented per the NABLA [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom. Single-layer conclusions on critical decisions require explicit justification for why additional layers were not consulted. Reasoning chains without traceable provenance are rejected as L2 violations. The coordinator enforces [Trinity Gate](@/glossary/trinity-gate.md) passage for all reasoning outputs that will influence platform-critical decisions -- structural consistency of the reasoning graph, logical consistency of the derived conclusions, and formal necessity of the inference chain must all be validated before the result is released to consuming agents.

## Related Resources

- [3NL Framework](@/glossary/three-nl.md) -- Glossary entry for the Three-Layer Neural-Logical-Linguistic system
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- The epistemic framework governing contradiction resolution and signal plurality
- [Trinity Gate](@/glossary/trinity-gate.md) -- Four-layer validation system for high-confidence claims
- [Autonomous Self-Healing](@/capabilities/autonomous-self-healing.md) -- Platform capability for automatic recovery from failures
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Cross-agent coordination for multi-step intelligence operations
- [Architecture Overview](@/architecture/_index.md) -- Platform architecture and design patterns

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)