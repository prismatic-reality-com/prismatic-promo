+++
title = "Blackboard"
weight = 73
[extra]
category = "architecture"
description = "Shared knowledge store enabling multi-agent coordination and reasoning"
related_terms = ["kuzudb", "ets", "garden", "agent-registry", "mycelial-network", "intelligence-fusion", "knowledge-graph", "agent", "data-pipeline"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1491
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Blackboard", "Shared", "glossary", "architecture", "Prismatic Platform", "PubSub", "KuzuDB"]
tags = ["glossary", "architecture", "blackboard", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Blackboard - Prismatic Platform"
+++

{% import "macros/flowbite.html" as fb %}

## Definition

The Blackboard pattern is a software architecture for collaborative problem solving in which multiple independent knowledge sources (agents, solvers, or subsystems) cooperate by reading from and writing to a shared data structure known as the blackboard. Unlike direct message-passing architectures where agents must know about each other, the blackboard decouples producers from consumers: agents observe the current state of shared knowledge, contribute partial solutions when their expertise is relevant, and trigger further reasoning by other agents who recognize new opportunities in the updated state.

The pattern originated in speech understanding research at Carnegie Mellon University in the 1970s (the Hearsay-II system) and has since been applied to signal interpretation, planning, diagnosis, and multi-agent intelligence systems. The classical blackboard architecture consists of three components: the blackboard data structure (shared working memory), knowledge sources (independent specialist modules), and a control component (scheduling mechanism that determines which knowledge source to activate next).

The blackboard's enduring appeal lies in its ability to coordinate heterogeneous agents that possess different representations, algorithms, and domains of expertise without requiring them to understand each other's internal workings. Each agent interacts only with the shared knowledge structure, contributing what it can and consuming what it needs. This makes the pattern particularly well-suited for complex analytical tasks -- such as intelligence fusion, security assessment, and epistemic reasoning -- where no single agent possesses sufficient knowledge to solve the problem alone.

## Historical Context and Evolution

{{ fb::p5_interactive_dashboard(title="Blackboard Knowledge Sharing Simulation", sketch_type="particles", data_source="blackboard.knowledge_sharing", controls=true) }}

{{ fb::divider(label="Architecture Visualization") }}

**Interactive Demo**: The visualization above demonstrates the blackboard pattern in action within the Prismatic Platform. Watch as multiple knowledge sources (represented as colored agents around the perimeter) contribute insights to the shared blackboard space (center). Each particle represents a knowledge contribution flowing from agents to the blackboard and triggering responses from other agents. Observe how the system resolves conflicts when contradictory knowledge is contributed and how new knowledge propagates through the agent network. The animation shows the three classical components: knowledge sources (agents), the blackboard data structure (shared central space), and the control mechanism (coordination logic).

The blackboard pattern has evolved significantly from its origins in AI research to its modern incarnation in distributed systems and multi-agent platforms.

| Era | System | Contribution |
|-----|--------|--------------|
| 1971-1976 | Hearsay-II (CMU) | First blackboard system for speech understanding |
| 1980s | BB1, GBB | Generalized blackboard frameworks with explicit control |
| 1986 | Nii's "Blackboard Systems" survey | Canonical formalization of the pattern |
| 1990s | CLIPS/JESS | Rule-based systems with blackboard-like working memory |
| 2000s | Multi-agent systems (JADE, JACK) | Blackboard as agent coordination mechanism |
| 2005-2020 | GARDEN legacy (Prismatic) | Blackboard for OSINT intelligence fusion |
| 2025+ | Prismatic Platform | Modernized blackboard with ETS, KuzuDB, 434 agents |

The GARDEN legacy knowledge base represents a particularly significant chapter in this evolution. Over 20+ years and 22 repositories, the GARDEN ecosystem developed a Blackboard system for OSINT intelligence gathering that coordinated multiple data sources, enrichment providers, and analysis modules. This battle-tested architecture directly informs the Prismatic Platform's modern implementation.

{{ fb::p5_grid_2x2(
  title1="Knowledge Sources Activity", type1="agents", data1="blackboard.knowledge_sources",
  title2="Shared Memory Structure", type2="network", data2="blackboard.memory_structure",
  title3="Control Flow Coordination", type3="generative", data3="blackboard.control_flow",
  title4="Conflict Resolution", type4="particles", data4="blackboard.conflict_resolution"
) }}

## Classical Blackboard Architecture

The canonical blackboard architecture consists of three interacting components, each serving a distinct role in the collaborative problem-solving process.

### Knowledge Sources

Knowledge sources (KS) are independent specialist modules, each possessing expertise in a specific domain or analysis technique. A knowledge source monitors the blackboard for conditions that match its area of expertise, and when triggered, reads relevant data, performs its analysis, and writes results back to the blackboard. Knowledge sources do not communicate with each other directly.

In the Prismatic Platform, the 434 [agents](@/glossary/agent.md) across 14 domains serve as knowledge sources. Each agent specializes in a particular capability -- OSINT data extraction, security rating calculation, epistemic verification, quality assessment -- and contributes its findings to the shared knowledge structure.

### The Blackboard Data Structure

The blackboard itself is a structured shared workspace organized into levels of abstraction or problem-solving stages. Data on the blackboard is typically organized hierarchically, with raw observations at lower levels and increasingly refined interpretations at higher levels.

```
Level 5: Conclusions     [Security Rating: B (780)]
Level 4: Interpretations [3 critical vulnerabilities, 12 informational]
Level 3: Hypotheses      [Possible misconfigured TLS, outdated cipher suites]
Level 2: Features        [Open ports: 80, 443, 8080; TLS version: 1.2]
Level 1: Raw Data        [DNS records, certificate chain, port scan results]
```

### Control Component

The control component determines which knowledge source to activate next, based on the current state of the blackboard and a scheduling strategy. Control strategies range from simple (round-robin, priority-based) to sophisticated (opportunistic, focus-of-attention, meta-level reasoning about which KS activation would most advance the solution).

## GARDEN Legacy and Modernization

The [GARDEN](@/glossary/garden.md) legacy knowledge base (22 repositories, 3,050+ files, 55+ patterns, 20+ years) is the direct ancestor of Prismatic's blackboard implementation. The GARDEN ecosystem's Blackboard system, originating from the `prismatic-legacy` repository (1,302 files, Tier 4 archive), demonstrated several key principles that carry forward.

| GARDEN Pattern | Modern Prismatic Implementation |
|----------------|-------------------------------|
| Shared working memory (in-process) | [ETS](@/glossary/ets.md) tables with microsecond access |
| Knowledge source registry | [Agent Registry](@/glossary/agent-registry.md) (434 agents) |
| Hierarchical blackboard levels | Multi-backend storage tiers (ETS, PostgreSQL, KuzuDB) |
| Rule-based control | AIAD agent activation policies and priority scheduling |
| Serialized knowledge | Structured Elixir terms with provenance metadata |
| Single-process coordination | Distributed coordination via [PubSub](@/glossary/pubsub.md) and message passing |

The modernization effort preserved GARDEN's core insight -- that heterogeneous knowledge sources produce better analytical results when coordinated through shared state rather than point-to-point communication -- while replacing the implementation with OTP-native technologies capable of operating across distributed BEAM nodes.

## Prismatic's Blackboard Implementation

The Prismatic Platform implements the blackboard pattern using a multi-backend storage architecture that separates concerns by access pattern and query complexity.

### Storage Backend Selection

| Backend | Role in Blackboard | Access Pattern | Latency |
|---------|-------------------|----------------|---------|
| [ETS](@/glossary/ets.md) | Hot working memory | Key-value lookup, concurrent reads | Microseconds |
| [PostgreSQL](@/glossary/postgresql.md) | Persistent fact store | Relational queries, transactions | Milliseconds |
| [KuzuDB](@/glossary/kuzudb.md) | Relationship graph | Path queries, pattern matching | Milliseconds |
| [Meilisearch](@/glossary/meilisearch.md) | Full-text search | Keyword and semantic search | Milliseconds |
| [Redis](@/glossary/redis.md) | Cross-node shared state | Pub/sub, distributed counters | Sub-millisecond |

### Agent Interaction Model

Agents interact with the blackboard through a standardized interface that enforces provenance tracking and [NABLA Infinity](@/glossary/nabla-infinity.md) axiom compliance.

```elixir
# Agent contributing findings to the blackboard
defmodule PrismaticAgents.SecurityScanner do
  @behaviour PrismaticAgents.KnowledgeSource

  @impl true
  def trigger_condition(blackboard) do
    # Activate when new domains are discovered
    Blackboard.has_new_entries?(blackboard, :discovered_domains)
  end

  @impl true
  def contribute(blackboard, context) do
    domains = Blackboard.read(blackboard, :discovered_domains)

    findings =
      domains
      |> Enum.map(&scan_domain/1)
      |> Enum.flat_map(&extract_vulnerabilities/1)

    Blackboard.write(blackboard, :security_findings, findings,
      source: __MODULE__,
      confidence: 0.85,
      timestamp: DateTime.utc_now()
    )
  end
end
```

### Color Team Signal Flow

The [Color Teams](@/glossary/color-teams.md) (Gray, Red, Blue, Purple, White, Black) use the blackboard as their primary coordination mechanism, following the signal flow architecture.

```
Gray Team writes  --> :boundary_seeds      (edge cases, specification gaps)
Red Team reads    <-- :boundary_seeds
Red Team writes   --> :adversarial_findings (simulated attack results)
Purple reads      <-- :adversarial_findings + :defensive_evidence
Purple writes     --> :synthesis_results    (Red-Blue loop closure)
Blue Team reads   <-- :synthesis_results
Blue Team writes  --> :defensive_posture    (updated defense status)
White Team reads  <-- :synthesis_results
White Team writes --> :verification_proofs  (formal verification results)
```

## Collaborative Problem Solving

The blackboard pattern excels at problems that require multiple forms of expertise applied in a flexible, data-driven order. The Prismatic Platform exploits this for several key workflows.

**OSINT Intelligence Fusion**: Multiple data source agents (Shodan, Censys, GreyNoise, DNS, certificate transparency) independently contribute raw observations to the blackboard. Entity resolution agents identify connections between observations. Analysis agents synthesize findings into coherent intelligence assessments. No single agent orchestrates this process; the blackboard's state drives activation.

**Security Rating Calculation**: The [EASM](@/glossary/easm.md) pipeline calculates security ratings (A-F, 300-900 score) by combining findings from diverse assessment agents. Vulnerability scanners, configuration analyzers, compliance checkers, and reputation services each contribute their assessments independently. The rating engine reads the accumulated evidence and computes a composite score.

**Epistemic Verification**: The [Trinity Gate](@/glossary/trinity-gate.md) verification process uses the blackboard to coordinate structural consistency checks, logical consistency validation, and formal proof construction. Each verification layer writes its results to the blackboard, and the gate controller reads the combined evidence to make accept/reject decisions.

## Control Strategies

The Prismatic Platform implements several control strategies for blackboard agent activation, selected based on the problem domain and urgency.

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Priority-based** | Agents activated by priority level (L1-L4) | Normal operations |
| **Opportunistic** | Activate agent whose preconditions are most satisfied | Intelligence fusion |
| **Focus-of-attention** | Direct activation toward specific blackboard regions | Incident response |
| **Event-driven** | PubSub notifications trigger agent activation | Real-time monitoring |
| **Meta-level** | Control agent reasons about which KS to activate | Complex multi-step analysis |

The event-driven strategy, implemented via Phoenix [PubSub](@/glossary/pubsub.md), is the most common in practice. When an agent writes to the blackboard, a PubSub notification is broadcast to all subscribed agents, which then evaluate their trigger conditions and self-activate if appropriate. This eliminates polling overhead while maintaining the blackboard's decoupled architecture.

## Comparison with Alternative Coordination Patterns

| Pattern | Coupling | State Model | Scalability | Best For |
|---------|----------|-------------|-------------|----------|
| **Blackboard** | Low (shared state) | Persistent, inspectable | Moderate | Complex analytical tasks |
| **Message passing** | Low (async messages) | Transient (mailbox) | High | Request-response, streaming |
| [PubSub](@/glossary/pubsub.md) | Low (topic-based) | Transient (events) | High | Event notification |
| **Orchestrator** | High (central control) | Centralized | Low | Sequential workflows |
| **Choreography** | Moderate (protocol) | Distributed | Moderate | Multi-step transactions |

The Prismatic Platform uses all of these patterns in combination, with the blackboard serving as the coordination backbone for complex analytical workflows and [message passing](@/glossary/message-passing.md) handling the high-throughput operational communication.

## Performance and Scalability

The multi-backend blackboard architecture is designed to handle the platform's scale: 434 agents, 89 umbrella applications, and millions of intelligence records.

| Metric | Target | Implementation |
|--------|--------|----------------|
| Read latency (hot data) | < 10 microseconds | ETS concurrent reads |
| Write latency (facts) | < 1 millisecond | ETS write-through to PostgreSQL |
| Relationship queries | < 50 milliseconds | KuzuDB graph traversal |
| Full-text search | < 100 milliseconds | Meilisearch indexed search |
| Agent activation latency | < 5 milliseconds | PubSub event-driven triggers |
| Concurrent readers | Unlimited | ETS lock-free concurrent reads |

ETS provides the performance-critical hot path, with write-through replication to PostgreSQL for durability and KuzuDB for relationship-rich queries. This tiered approach ensures that agent activation is never bottlenecked by storage latency while maintaining full persistence and queryability of the accumulated knowledge.

## Related Terms

- [Knowledge Graph](@/glossary/knowledge-graph.md) - Graph-structured knowledge representation complementing blackboard state
- [Agent](@/glossary/agent.md) - Autonomous units serving as knowledge sources in the blackboard architecture
- [Agent Registry](@/glossary/agent-registry.md) - Registry of 434 agents interacting via the blackboard
- [Data Pipeline](@/glossary/data-pipeline.md) - Pipeline patterns feeding data into and consuming data from the blackboard
- [GARDEN](@/glossary/garden.md) - Source of the blackboard pattern with 22 repos of legacy knowledge
- [KuzuDB](@/glossary/kuzudb.md) - Graph storage backing relationship-rich blackboard queries
- [ETS](@/glossary/ets.md) - In-memory storage for high-speed blackboard access
- [PubSub](@/glossary/pubsub.md) - Event distribution for blackboard change notifications
- [Color Teams](@/glossary/color-teams.md) - Security teams coordinating through blackboard signal flow
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) - Multi-source correlation leveraging blackboard data
- [Mycelial Network](@/glossary/mycelial-network.md) - Knowledge propagation network complementing blackboard coordination

## See Also

- [prismatic_blackboard](../../../apps/prismatic_blackboard/README.md) -- Blackboard shared knowledge store application
- [prismatic_storage_kuzudb](../../../apps/prismatic_storage_kuzudb/README.md) -- Graph backend for relationship-rich knowledge
- [prismatic_storage_ets](../../../apps/prismatic_storage_ets/README.md) -- In-memory backend for fast blackboard access
- [prismatic_agents](../../../apps/prismatic_agents/README.md) -- Agent runtime reading/writing the blackboard
- [Architecture](@/architecture/_index.md) -- Platform architecture and multi-agent coordination patterns
- [Agents](@/agents/_index.md) -- Agent specifications and knowledge source definitions

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)