+++
title = "repair-society-coordinator"
weight = 351
[extra]
domain = "mycelium"
level = "L3"
description = "Coordination of distributed repair operations across the mycelial network for self-healing infrastructure"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["mycelial-network", "seadf", "aiad", "supervision-tree", "dynamic-supervisor", "process-isolation", "message-passing", "no-doubts", "telemetry", "no-mercy"]
domain_normalized = "ecosystem"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 83
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["repair-society-coordinator", "Coordination", "agents", "agent", "Prismatic Platform", "Strategic Command", "SEADF", "Distress"]
tags = ["agents", "agent", "repair-society-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "repair-society-coordinator - Prismatic Platform"
+++

## Overview

The repair-society-coordinator operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's mycelium domain, coordinating distributed repair operations across the [mycelial network](/glossary/mycelial-network/) to maintain the platform's self-healing infrastructure. In biological ecosystems, mycorrhizal networks enable trees and plants to share resources and signal distress, allowing the forest to respond collectively to damage. The Prismatic Platform's mycelial network implements an analogous pattern for software infrastructure: a distributed communication and resource-sharing substrate through which agents detect, diagnose, and repair system degradation collaboratively.

The repair-society-coordinator manages the collective repair behavior of the agent ecosystem. When a component experiences degradation -- performance decline, data quality reduction, process failure, or configuration drift -- the mycelial network propagates distress signals to the repair society. The coordinator evaluates these signals, diagnoses root causes, and orchestrates repair actions across the affected agents, ensuring that repairs are coordinated rather than competing and that the repair process itself does not introduce instability.

Built on the [AIAD](/glossary/aiad/) standard and integrated with the [SEADF](/glossary/seadf/) evolutionary framework, this agent applies [Lean4](/glossary/lean4/) theorems to guarantee that repair operations preserve system invariants. The five core theorems ensure that repair actions maintain semantic equivalence, type safety, termination properties, resource bounds, and compositional safety -- critical guarantees when autonomous repair agents modify running systems.

## Mycelial Network Architecture

The mycelial network provides the communication substrate through which repair operations are coordinated. The network is implemented as a distributed [PubSub](/glossary/pubsub/) system with topic-based routing, allowing agents to subscribe to repair-related event channels and publish distress signals to specific repair domains.

**Distress signal propagation** operates through a multi-hop broadcast mechanism where agents that detect anomalies publish structured distress signals containing the affected component, symptom description, severity classification, and diagnostic context. The mycelial network routes these signals to the repair-society-coordinator and any repair-capable agents in the affected domain.

**Resource sharing** enables healthy agents to contribute processing capacity, data, or configuration templates to repair operations. When a repair requires data reconstruction, for example, the mycelial network facilitates requests to agents that hold relevant data, enabling distributed repair without centralized data stores.

**Consensus-based repair** ensures that multiple repair agents do not apply conflicting fixes to the same component. The repair-society-coordinator manages repair consensus through a lightweight protocol that claims repair authority for specific components, preventing repair races.

## Key Capabilities

- **Distress signal triage** -- Evaluates incoming distress signals from the mycelial network, classifying severity, identifying root causes, and prioritizing repair actions based on system impact
- **Repair orchestration** -- Coordinates multi-agent repair operations, ensuring that repair actions are sequenced correctly, do not conflict, and collectively address the root cause rather than individual symptoms
- **Root cause analysis** -- Applies diagnostic reasoning to correlate distress signals from multiple sources, distinguishing between primary failures and secondary symptoms to direct repair at root causes
- **[Supervision tree](/glossary/supervision-tree/) repair** -- Manages repair of [OTP](/glossary/otp/) supervision tree degradation, including process restart escalation, supervisor reconfiguration, and [dynamic supervisor](/glossary/dynamic-supervisor/) child management
- **Configuration drift repair** -- Detects and corrects configuration drift where runtime configuration diverges from intended state, restoring correct configuration through the mycelial network
- **Formal safety guarantees** -- Applies Lean4 theorems to verify that repair operations preserve system invariants, preventing repair actions from introducing new failures
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with continuous distress signal monitoring and self-directed repair prioritization
- **[Telemetry integration](/capabilities/telemetry-integration/)** for repair operation monitoring and system health tracking

## Repair Protocol

The repair protocol follows a structured lifecycle. The **detection phase** receives distress signals from the mycelial network and the platform's [telemetry](/glossary/telemetry/) infrastructure. Signals are correlated to identify patterns that indicate systemic issues versus isolated incidents.

The **diagnosis phase** applies root cause analysis to correlated signals, building a causal model of the detected degradation. The coordinator distinguishes between symptoms (observable effects) and causes (underlying failures), ensuring that repair actions address causes rather than merely suppressing symptoms.

The **planning phase** designs a repair plan specifying the sequence of repair actions, the agents responsible for each action, resource requirements, and rollback procedures. The plan is validated against the Lean4 safety theorems before execution approval.

The **execution phase** deploys repair actions through the mycelial network, monitoring each action's progress and outcome. The coordinator maintains repair state that tracks which actions have been completed, which are in progress, and which are pending. If a repair action fails or produces unexpected results, the coordinator triggers rollback procedures.

The **verification phase** confirms that the repair achieved its objective by re-evaluating the distress signals and quality metrics that triggered the repair. Successful repairs produce resolution events that propagate through the mycelial network, informing all affected agents that the issue has been addressed.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to orchestrate repair operations across the mycelial network, claim repair authority for affected components, and coordinate multi-agent repair campaigns.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/repair status` | Display current repair operations and system health status | L3+ |
| `/repair diagnose` | Initiate diagnostic analysis for a specified component or symptom | L3+ |
| `/repair history` | Show repair history with outcomes and resolution times | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [recursive-optimizer](/agents/recursive-optimizer/) | Optimization recommendations that affect repair-relevant components require coordination |
| [registry-auto](/agents/registry-auto/) | Registry corruption triggers repair operations |
| [quality-assurance-commander](/agents/archer-supreme/) | Quality metric degradation triggers repair investigation |
| [refactoring-coordinator-agent](/agents/refactoring-coordinator-agent/) | Formal safety verification shared between refactoring and repair operations |

## Enforcement

Repair operations comply with the [NO MERCY](/glossary/no-mercy/) doctrine: system degradation is addressed immediately and completely, not deferred or partially mitigated. The [NO DOUBTS](/glossary/no-doubts/) principle mandates that repair actions are validated through formal safety verification before execution, and repair outcomes are verified through measurement rather than assumption. The [SEADF](/glossary/seadf/) framework ensures that repair operations contribute to the platform's evolutionary fitness rather than merely restoring previous state.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)