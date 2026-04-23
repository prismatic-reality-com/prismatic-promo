+++
title = "Mycelial Network Supreme"
weight = 268
[extra]
domain = "mycelial"
level = "L3"
description = "Supreme manager of mycelial propagation networks, orchestrating intelligent pattern distribution across OSINT, Nabla Infinity, CATCH, and Agent Societies domains with adaptive load balancing"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["mycelial-network", "seadf", "aiad", "supervision-tree", "dynamic-supervisor", "process-isolation", "message-passing", "no-doubts", "nabla-infinity", "telemetry"]
domain_normalized = "ecosystem"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Mycelial", "Network", "Supreme", "OSINT", "Nabla", "Infinity", "CATCH", "Agent", "agents", "Prismatic Platform"]
tags = ["agents", "agent", "mycelial-network-supreme", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Mycelial Network Supreme - Prismatic Platform"
+++

## Overview

The Mycelial Network Supreme operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's mycelial domain, serving as the supreme manager of cross-domain pattern propagation networks. While other mycelial agents focus on specific aspects of network management -- healing, evolution, topology optimization -- the Network Supreme manages the intelligent distribution of patterns, knowledge, and operational intelligence across the platform's major operational domains: [OSINT](/glossary/osint/), [Nabla Infinity](/glossary/nabla-infinity/), CATCH, and Agent Societies. This cross-domain propagation capability ensures that insights generated in one domain rapidly reach agents in other domains where they can inform decisions and improve operations.

Built on the [AIAD](/glossary/aiad/) standard and implemented within the [SEADF](/glossary/seadf/) ecosystem framework, the Network Supreme manages propagation networks as adaptive systems that route patterns based on relevance, urgency, and consumer readiness. Rather than broadcasting all patterns to all domains, the agent applies intelligent routing that matches pattern characteristics to domain needs. A security vulnerability pattern discovered by OSINT agents is rapidly propagated to CATCH agents for threat assessment, while a quality improvement pattern identified in Agent Societies is routed to domains where similar quality challenges exist. The [NO DOUBTS](/glossary/no-doubts/) principle ensures that propagation decisions are evidence-based, with routing determined by measured pattern utility rather than assumed relevance.

## Theoretical Foundations

Cross-domain pattern propagation draws from epidemic spreading models, content-based routing theory, and adaptive information dissemination research. The Network Supreme implements a controlled epidemic propagation model where patterns spread through the agent ecosystem analogously to how information spreads in social networks, but with engineered controls that prevent information overload while ensuring critical patterns reach relevant consumers within time constraints.

The routing algorithm applies content-based filtering principles, where each domain maintains a relevance profile describing the types of patterns it can productively consume. Pattern-domain matching uses semantic similarity metrics that evaluate the overlap between a pattern's characteristics (domain of origin, type, urgency, information content) and each target domain's relevance profile. Adaptive load balancing ensures that propagation traffic does not overwhelm domain-specific processing capacity, using a token-bucket rate limiting mechanism that adapts bucket size based on measured domain absorption rates.

## Operational Domain

The mycelial domain encompasses all cross-domain pattern distribution activities within the platform. The Network Supreme maintains routing tables that map pattern types to target domains, with routing entries weighted by historical utility scores that reflect how productively each domain has consumed similar patterns in the past. These routing tables are stored in [ETS](/glossary/ets/) and updated continuously based on feedback from pattern consumers.

Four primary propagation channels are managed by the Network Supreme. The **OSINT channel** distributes intelligence patterns including threat indicators, entity profiles, and source reliability updates. The **Nabla channel** propagates epistemic patterns including belief updates, confidence adjustments, and axiom compliance findings. The **CATCH channel** distributes detection patterns including anomaly signatures, behavioral indicators, and threat classification updates. The **Societies channel** propagates organizational patterns including coordination improvements, authority adjustments, and team capability updates.

## Key Capabilities

- **Cross-domain pattern routing** -- Matches patterns to target domains using content-based filtering with semantic relevance scoring, ensuring that each pattern reaches domains where it can productively inform agent operations
- **Adaptive load balancing** -- Manages propagation traffic across domains using token-bucket rate limiting with adaptive bucket sizes, preventing information overload while maintaining propagation freshness guarantees
- **Priority-based scheduling** -- Prioritizes pattern propagation based on urgency, domain criticality, and pattern freshness, ensuring that high-priority security patterns overtake lower-priority optimization patterns in the propagation queue
- **Propagation feedback integration** -- Collects utility feedback from pattern consumers to continuously refine routing accuracy, strengthening routes that deliver high-utility patterns and weakening routes that produce low-value deliveries
- **Cross-domain conflict detection** -- Identifies cases where patterns from different domains carry contradictory information and routes them through the [NABLA Infinity](/glossary/nabla-infinity/) framework for contradiction-preserving resolution rather than silent override
- **Propagation network visualization** -- Provides real-time visualization of active propagation flows including traffic volumes, routing paths, delivery latencies, and utility feedback scores
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed propagation management that adapts to domain activity levels and pattern generation rates
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing propagation metrics including delivery rates, routing accuracy, consumer utility scores, and cross-domain propagation latencies

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to manage pattern propagation routes, adjust domain bandwidth allocations, and prioritize cross-domain information flows.

## Propagation Architecture

The Network Supreme implements a multi-tier propagation architecture. The **collection tier** receives patterns from all domain-specific agents through standardized pattern submission interfaces. Each pattern carries metadata including origin domain, pattern type, urgency level, freshness timestamp, and producer confidence score. The **routing tier** evaluates each pattern against routing tables and relevance profiles to determine target domains. The **delivery tier** manages actual propagation to target domains through [message passing](/glossary/message-passing/) channels with configurable quality-of-service guarantees.

Propagation is asynchronous and non-blocking. Pattern submission returns immediately to the producing agent, while actual propagation proceeds through the pipeline at rates governed by load balancing policies. Critical-priority patterns bypass normal queuing and are delivered through dedicated fast-path channels with guaranteed sub-second propagation latency.

The architecture includes a feedback loop where pattern consumers report utility scores that flow back to the routing tier, enabling continuous refinement of routing decisions. Low-utility patterns receive reduced routing priority in subsequent propagation cycles, while high-utility patterns receive increased propagation bandwidth and broader target domain distribution.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/mycelial propagation status` | Display current propagation network status with channel metrics | L3+ |
| `/mycelial propagation routes` | Show active routing table with relevance scores and utility feedback | L3+ |
| `/mycelial propagation priority` | Adjust priority weights for specific pattern types or domain channels | L3+ |
| `/mycelial propagation visualize` | Generate real-time propagation flow visualization | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [mycelial-network-coordinator](/agents/mycelial-network-coordinator/) | Reports to L1 coordinator for strategic direction and resource allocation |
| [mycelial-propagation-engine](/agents/mycelial-propagation-engine/) | Delegates technical propagation execution and formal safety verification |
| [osint-pattern-propagator](/agents/osint-pattern-propagator/) | Manages OSINT-specific pattern preparation and domain-specific routing refinement |
| [nabla-quality-feedback-coordinator](/agents/nabla-quality-feedback-coordinator/) | Integrates Nabla quality signals into propagation routing decisions |
| [mycelial-healer-specialist](/agents/mycelial-healer-specialist/) | Coordinates propagation channel repair when delivery failures are detected |

## Adaptive Routing Optimization

Routing table optimization occurs continuously through a reinforcement learning-inspired update mechanism. Each propagation event constitutes a routing action, and the utility feedback from the consumer constitutes the reward signal. The routing weights are updated using an exponential moving average that gives more weight to recent feedback while retaining influence from historical utility data. This approach enables the routing system to adapt to shifting domain needs -- when a domain's operational focus changes, the routing weights gradually shift to reflect the new pattern consumption profile.

## Enforcement

The Network Supreme enforces the [NO MERCY](/glossary/no-mercy/) doctrine for propagation quality: no pattern is propagated without validated metadata, no routing decision is made without relevance scoring, and propagation failures trigger mandatory investigation and repair. The [NABLA Infinity](/glossary/nabla-infinity/) axioms govern information handling within propagation: contradictory patterns from different domains are preserved rather than resolved, and all propagated patterns carry complete provenance chains. The [Trinity Gate](/glossary/trinity-gate/) validates that propagation routing decisions maintain structural consistency with domain boundaries, logical consistency with pattern semantics, and formal consistency with information flow policies.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)