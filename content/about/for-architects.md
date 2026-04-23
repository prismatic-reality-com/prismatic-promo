+++
title = "Prismatic for Architects"
weight = 2

[extra]
description = "Prismatic as a runtime for decisions over code -- working with contradictions, signal plurality, and confidence thresholds."
audience = "architect"
difficulty = "advanced"
glossary_terms = ["nabla-infinity", "trinity-gate", "qeve", "epistemic-pipeline", "color-teams"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1535
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Architects", "about", "Prismatic Platform", "Trinity Gate", "Every"]
tags = ["about", "prismatic-for-architects", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "teams"]
image = "/images/sections/about.png"
image_alt = "Prismatic for Architects - Prismatic Platform"
+++

## A Runtime for Decisions Over Code

Most platforms manage code. Prismatic manages the **decisions behind the code**.

When an architect designs a system, the output is not just APIs and data models. It is a graph of decisions: why this database, why this communication pattern, why this consistency model, what trade-offs were accepted, and what contradictions were deferred. Traditional tools lose this graph the moment the decision is made. It exists in someone's head, maybe in a design document that drifts out of sync within weeks.

Prismatic preserves the decision graph. Every claim has provenance. Every trade-off is recorded with its supporting evidence and counter-evidence. Contradictions are not resolved prematurely -- they are tracked as first-class epistemic entities with timestamps, confidence levels, and source attribution.

This is not metadata bolted onto a code repository. It is the foundation of the platform's [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework, enforced by 7 non-negotiable axioms and validated through the 4-layer [Trinity Gate](/glossary/trinity-gate/).

## The 16-Level Epistemic Pipeline

Prismatic processes information through a 16-level [epistemic pipeline](/glossary/epistemic-pipeline/) that mirrors how rigorous reasoning actually works -- from raw signal ingestion to consciousness-level synthesis:

| Level | Name | Function |
|-------|------|----------|
| **L0** | Signal Ingestion | Raw data capture from all sources |
| **L1** | Signal Validation | Source verification, duplicate detection |
| **L2** | Signal Classification | Categorization by domain, type, urgency |
| **L3** | Evidence Formation | Signals combined into structured evidence |
| **L4** | Hypothesis Generation | Evidence generates candidate explanations |
| **L5** | Hypothesis Testing | Candidates tested against available data |
| **L6** | Contradiction Detection | Conflicting hypotheses identified and preserved |
| **L7** | Confidence Assessment | Quantified confidence with uncertainty bounds |
| **L8** | Trinity Gate (Structural) | Graph theory: belief network forms valid DAG |
| **L9** | Trinity Gate (Logical) | Rule-based: propositions follow logical rules |
| **L10** | Trinity Gate (Formal) | Modal logic + Lean4 formal proofs |
| **L11** | Decision Synthesis | Verified claims synthesized into actionable decisions |
| **L12** | Action Planning | Decisions translated into execution plans |
| **L13** | Execution Monitoring | Real-time tracking of plan execution |
| **Meta** | Meta-Cognition | Pipeline self-assessment and calibration |
| **Consciousness** | System Awareness | 11-trait consciousness model (0.998 fitness) |

This is not a linear waterfall. Signals can trigger re-evaluation at any level. A contradiction detected at L6 can invalidate hypotheses at L4, which cascades to evidence at L3. The pipeline is re-entrant and self-correcting.

For architects, the critical insight is that **every architectural decision passes through this pipeline**. A decision to adopt a new storage backend does not happen because someone "feels" it is right. It happens because evidence was gathered (L0-L3), hypotheses were formed and tested (L4-L5), contradictions were identified (L6), confidence was quantified (L7), and the Trinity Gate validated the conclusion (L8-L10).

## OTP Supervision Tree Architecture

Prismatic is a 99-app Elixir umbrella application. This is not a monolith sliced into packages -- it is a genuine distributed system running on the BEAM virtual machine, where each application is an independent OTP application with its own supervision tree.

### Application Topology

```
prismatic_supervisor (root)
  |
  +-- prismatic_storage_core/    [Traits, protocols, behaviors]
  +-- prismatic/                 [Main API, coordination]
  +-- prismatic_api/             [Auto-introspecting REST API, port 4004]
  +-- prismatic_web/             [LiveView dashboards, port 4000]
  +-- prismatic_agents/          [434 agents runtime]
  +-- prismatic_safety/          [Quality Floor Guardian, predictions]
  +-- prismatic_perimeter/       [EASM, security ratings]
  +-- prismatic_claude/          [Session lifecycle, stack conversation]
  +-- prismatic_storage_ets/     [ETS adapter]
  +-- prismatic_storage_ecto/    [PostgreSQL adapter]
  +-- prismatic_storage_meili/   [Meilisearch adapter]
  +-- prismatic_storage_kuzu/    [KuzuDB graph adapter]
  +-- ... (87 more apps)
```

The `PrismaticSupervisor` provides compositional supervision with dependency-aware startup. Applications are classified into domains, and the `DependencyResolver` builds a directed acyclic graph of startup dependencies. The `HealthMonitor` tracks application health, and the `AppRegistry` provides a pluggable backend (ETS for development, Horde for distributed production).

This matters architecturally because **failure isolation is structural, not aspirational**. When `prismatic_storage_meili` crashes, the Meilisearch supervisor restarts it. Other applications continue operating. The BEAM scheduler ensures fair CPU distribution across all processes. No single failure cascades unless you explicitly couple components.

### The Meta-Rule in Practice

> **If the same solution could be written identically in Node.js, it is WRONG.**

For architects, this rule translates to concrete design constraints:

- **State lives in processes, not in objects.** Every stateful entity (agent, connection pool, cache, session) is a GenServer or Agent with an explicit lifecycle and restart strategy.
- **Communication is message-passing, not method calls.** Inter-component communication uses `GenServer.call/3` and `GenServer.cast/2`, which are location-transparent -- they work identically whether the target process is local or on another node.
- **Concurrency is structural, not bolted on.** You do not "add threading" to Elixir code. Every function call is already running in a lightweight process. The supervision tree defines the concurrency model.
- **Fault tolerance is the default.** A `Task.async/1` that crashes is caught by its parent supervisor. An `Agent.update/2` that times out returns `{:error, :timeout}`. You handle failure as data, not as exceptions.

## Formal Verification Layer (QEVE)

The [QEVE](/glossary/qeve/) (Quantified Epistemic Verification Engine) is where Prismatic diverges most sharply from traditional platforms. It combines three verification methodologies:

### Lean4 Formal Proofs

Lean4 is a theorem prover and programming language. In Prismatic, it is used to formally verify properties of critical system components. A security claim like "this authentication flow prevents token replay" is not just tested -- it is proven. The proof exists as a Lean4 artifact that can be independently verified.

### NABLA Epistemic Axioms

The [NABLA Infinity](/glossary/nabla-infinity/) framework enforces 7 axioms at the DNA level:

1. **Signal Plurality**: No belief based on a single signal. Minimum 2 independent sources required.
2. **Contradiction Preservation**: When signals disagree, both are preserved. Premature resolution is forbidden.
3. **Absence Informative**: Missing data is data. The absence of a signal is tracked as meaningful.
4. **Time Decay**: All beliefs have timestamps. Old evidence is weighted less than new evidence.
5. **Unknown Valid**: "I don't know" is a legitimate epistemic state. Forced conclusions are forbidden.
6. **Source Independence**: Independent sources are weighted higher than correlated sources.
7. **Provenance Mandatory**: Every belief must be traceable to its originating signals.

These are not guidelines. They are hard-enforced. A single hard-axiom violation blocks the operation (E2 level). A Trinity Gate failure halts the system and requires review (E3 level). Multiple axiom violations trigger an audit (E4 level).

### Monte Carlo Robustness Testing

Formal proofs establish correctness under specified conditions. Monte Carlo testing establishes robustness under uncertainty. By sampling from the distribution of possible inputs and environmental conditions, QEVE quantifies how sensitive a conclusion is to variations in the underlying evidence.

This produces confidence scores with uncertainty bounds -- not just "87% confident" but "87% confident with a 95% credible interval of [82%, 91%] under the assumption that source reliability exceeds 0.7."

## Drift Detection Architecture

Drift is the silent killer of systems. Configuration drift, behavioral drift, dependency drift, performance drift -- each type erodes system integrity without triggering alerts until the degradation is critical.

Prismatic monitors four drift dimensions continuously:

### Behavioral Drift

Agent behavior is specified in AIAD formal specifications. The system continuously compares actual agent behavior against specified behavior. Deviations are detected, classified, and either auto-corrected (if within tolerance) or escalated (if beyond tolerance).

### Configuration Drift

Every configuration parameter has a recorded baseline and acceptable range. Changes are tracked with timestamps and attribution. Unauthorized changes trigger immediate investigation.

### Dependency Drift

The dependency graph (which app depends on which) is computed from the actual codebase and compared against the declared dependencies in each application's `mix.exs`. Undeclared dependencies are violations. Circular dependencies are blocked.

### Performance Drift

Performance baselines are recorded for key operations. The system detects gradual degradation before it becomes critical. O(1) pattern detection (90-250x speedup over previous approaches) enables real-time performance monitoring without overhead.

The [Blue Team's](/glossary/blue-team/) drift detector agent specifically monitors all four dimensions, producing structured evidence (not alerts) that feeds into the epistemic pipeline at L0.

## Confidence Thresholds and Decision Points

Not all decisions require the same level of certainty. Prismatic defines explicit confidence thresholds tied to Trinity Gate requirements:

| Context | Confidence Threshold | Trinity Gate |
|---------|---------------------|-------------|
| Critical Decisions (security, production) | 0.95 | MANDATORY |
| Standard Operations (features, refactoring) | 0.80 | MANDATORY |
| Exploratory Analysis (research, prototyping) | 0.60 | RECOMMENDED |
| Research Queries (investigation, learning) | 0.50 | OPTIONAL |

The transition from exploration to execution follows the NABLA-to-NM/ND protocol:

```
EXPLORATION (NABLA: maps uncertainty, preserves contradictions)
    |
    v
confidence >= threshold AND trinity_gate.passed AND axioms_compliant
    |
    v
EXECUTION (NO MERCY: decisive action, complete delivery)
```

This is the architectural heart of Prismatic. The system does not rush to conclusions. It explores, accumulates evidence, preserves contradictions, and quantifies uncertainty. Only when the evidence crosses the confidence threshold and passes formal verification does it transition to execution mode -- and then it executes without compromise.

## Cross-Domain Integration

The 99 umbrella applications are not isolated silos. They communicate through well-defined interfaces enforced by the `PrismaticStorageCore` traits and protocols:

```elixir
# Storage adapters implement a common behavior
defmodule PrismaticStorage.AdapterBehaviour do
  @callback store(key :: term(), value :: term(), opts :: keyword()) ::
    {:ok, term()} | {:error, term()}
  @callback fetch(key :: term(), opts :: keyword()) ::
    {:ok, term()} | {:error, :not_found | term()}
  @callback delete(key :: term(), opts :: keyword()) ::
    :ok | {:error, term()}
end
```

Every adapter (ETS, Ecto/PostgreSQL, Meilisearch, KuzuDB) implements this behavior. Contract tests verify compliance:

```elixir
use PrismaticStorage.AdapterContractTest, adapter_module: MyAdapter
```

This composability extends to the agent system. Any agent can communicate with any other agent through the AIAD protocol, regardless of which umbrella application hosts them. The message-passing is location-transparent, and the supervision tree ensures fault isolation.

## What This Means for Your Architecture

If you are evaluating Prismatic as an architect, here are the architectural guarantees:

1. **Decisions are traceable.** Every architectural decision has a provenance chain from initial signals through evidence formation to Trinity Gate validation.

2. **Contradictions are preserved.** When two design options conflict, both are maintained with supporting evidence until the confidence threshold is met. No premature resolution.

3. **Drift is detected.** Behavioral, configuration, dependency, and performance drift are monitored continuously. Degradation is caught before it becomes critical.

4. **Quality is enforced structurally.** The 13 quality domains are not checked manually. They are enforced by automated gates at every commit.

5. **The system evolves.** Generation 18 represents 18 cycles of autonomous improvement. The platform does not just maintain quality -- it improves continuously.

6. **Failure is isolated.** The OTP supervision tree provides structural fault isolation. No single component failure cascades to the platform.

## Next Steps

- [For Developers](/about/for-developers/) -- The concrete developer experience with quality gates and regression enforcement
- [For Security & Risk](/about/for-security/) -- The Color Team architecture and EASM capabilities
- [QEVE Deep Dive](/about/qeve-deep-dive/) -- Detailed technical architecture of the verification engine
- [Platform Architecture](/architecture/) -- Full architectural documentation
- [Glossary: NABLA Infinity](/glossary/nabla-infinity/) -- The epistemic framework in detail

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)