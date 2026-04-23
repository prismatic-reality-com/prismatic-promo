+++
title = "Prismatic Nabla"
weight = 5
[extra]
icon = "academic-cap"
color = "violet"
description = "NABLA Infinity epistemic framework - 7 axioms, Trinity Gate, and confidence management"
category = "Epistemic"
files = "410"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 766
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Nabla", "Infinity", "Trinity", "Gate", "apps", "Epistemic", "Prismatic Platform", "PrismaticNabla", "Layer"]
tags = ["apps", "epistemic", "prismatic-nabla", "prismatic"]
quality_score = 70
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Nabla - Prismatic Platform"
+++

## Overview

Prismatic Nabla implements the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework, the platform's core system for managing knowledge, confidence, and truth. It enforces 7 non-negotiable axioms that govern how the platform forms, maintains, and revises beliefs. Every intelligence assessment, [security rating](/glossary/security-rating/), and analytical conclusion passes through Nabla's verification pipeline.

With 410 source files, Prismatic Nabla is one of the most substantial applications in the [umbrella](/glossary/umbrella-application/). This reflects the reality that epistemic management pervades every domain: [OSINT](/glossary/osint/) intelligence requires confidence scoring, [EASM](/glossary/easm/) ratings require evidence-based assessment, compliance claims require provenance verification, and threat intelligence requires contradiction-preserving analysis. Nabla is not a utility library -- it is the epistemic foundation on which all platform intelligence products rest.

## 7 Non-Negotiable Axioms

Each axiom is implemented as an enforcement module with configurable severity (HARD blocks operations, SOFT logs warnings):

### Axiom Implementation Details

| # | Axiom | Enforcement | Implementation | Violation Response |
|---|-------|-------------|---------------|-------------------|
| 1 | **[Signal Plurality](/glossary/signal-plurality/)** | HARD | `PrismaticNabla.Axiom.SignalPlurality` | BLOCKED until 2+ signals provided |
| 2 | **[Contradiction Preservation](/glossary/contradiction-preservation/)** | HARD | `PrismaticNabla.Axiom.ContradictionPreservation` | BLOCKED -- conflicting signals must be preserved |
| 3 | **Absence Informative** | SOFT | `PrismaticNabla.Axiom.AbsenceInformative` | WARNING -- missing signal tracked as evidence |
| 4 | **[Time Decay](/glossary/time-decay/)** | HARD | `PrismaticNabla.Axiom.TimeDecay` | BLOCKED until timestamps provided |
| 5 | **Unknown Valid** | HARD | `PrismaticNabla.Axiom.UnknownValid` | BLOCKED -- "I don't know" must be accepted |
| 6 | **Source Independence** | SOFT | `PrismaticNabla.Axiom.SourceIndependence` | WARNING -- independent sources weighted higher |
| 7 | **[Provenance Mandatory](/glossary/provenance-mandatory/)** | HARD | `PrismaticNabla.Axiom.ProvenanceMandatory` | BLOCKED until provenance chain provided |

### Axiom Enforcement Pipeline

```elixir
# Every belief assertion passes through the axiom pipeline
defmodule PrismaticNabla.AxiomPipeline do
  @axioms [
    SignalPlurality,
    ContradictionPreservation,
    AbsenceInformative,
    TimeDecay,
    UnknownValid,
    SourceIndependence,
    ProvenanceMandatory
  ]

  def enforce(belief, evidence) do
    Enum.reduce_while(@axioms, {:ok, belief}, fn axiom, {:ok, acc} ->
      case axiom.check(acc, evidence) do
        {:ok, updated} -> {:cont, {:ok, updated}}
        {:violation, :hard, reason} -> {:halt, {:error, {:axiom_violation, axiom, reason}}}
        {:violation, :soft, reason} ->
          Logger.warning("Soft axiom violation: #{axiom} - #{reason}")
          {:cont, {:ok, acc}}
      end
    end)
  end
end
```

### Axiom Application Examples

**Signal Plurality in Practice:**

```elixir
# BLOCKED: Only one source
{:error, {:axiom_violation, SignalPlurality, "Only 1 signal, minimum 2 required"}} =
  PrismaticNabla.assert(%{
    claim: "Entity X is high risk",
    evidence: [single_source_signal],
    confidence: 0.90
  })

# ALLOWED: Multiple independent sources
{:ok, belief} = PrismaticNabla.assert(%{
  claim: "Entity X is high risk",
  evidence: [shodan_signal, censys_signal, certificate_signal],
  confidence: 0.92
})
```

**Contradiction Preservation in Practice:**

```elixir
# Both signals preserved, not resolved
{:ok, belief} = PrismaticNabla.assert(%{
  claim: "Entity X compliance status",
  evidence: [
    %{signal: :sanctions_match, confidence: 0.88, source: :eu_sanctions},
    %{signal: :clean_record, confidence: 0.85, source: :local_registry}
  ],
  contradictions: [:sanctions_match_vs_clean_record]
})
# belief.has_contradictions == true
# belief.resolved == false  (contradictions preserved, not smoothed)
```

## Belief Graph

The [Belief Graph](/glossary/belief-graph/) is Nabla's core data structure -- a directed acyclic graph where nodes represent claims, evidence, or meta-beliefs, and edges represent support, contradiction, or derivation relationships.

### Graph Structure

| Node Type | Description | Properties |
|-----------|-------------|-----------|
| **Claim** | An assertion about the world | Confidence, timestamp, provenance |
| **Evidence** | A data point supporting or contradicting a claim | Source, reliability, freshness |
| **Meta-Belief** | A belief about the quality of other beliefs | Meta-confidence, scope |
| **Inference** | A derived claim from combining evidence | Derivation rule, input beliefs |

| Edge Type | Description | Semantics |
|-----------|-------------|----------|
| **Supports** | Evidence supports a claim | Weighted by source reliability |
| **Contradicts** | Evidence contradicts a claim | Preserved per Axiom 2 |
| **Derives** | Claim derived from other claims | Inference rule attached |
| **Supersedes** | Newer evidence supersedes older | Time decay application |

### Graph Operations

```elixir
# Build belief graph for an entity assessment
{:ok, graph} = PrismaticNabla.build_graph(%{
  entity: "example.com",
  domains: [:security, :compliance, :reputation],
  depth: 3
})

# Query the graph
{:ok, supporting} = PrismaticNabla.graph_query(graph, :supporting, claim_id)
{:ok, contradicting} = PrismaticNabla.graph_query(graph, :contradicting, claim_id)
{:ok, inference_chain} = PrismaticNabla.graph_query(graph, :derivation_path, claim_id)
```

## Confidence Scoring

[Confidence scoring](/glossary/confidence-scoring/) in Nabla is Bayesian-inspired with domain-specific adjustments:

### Scoring Model

```
Confidence(claim) = base_confidence
                  * corroboration_factor(supporting_signals)
                  * contradiction_penalty(contradicting_signals)
                  * time_decay_factor(evidence_age)
                  * source_independence_bonus(unique_sources)
```

| Factor | Calculation | Range |
|--------|------------|-------|
| **Base Confidence** | Initial assessment from primary evidence | 0.0 - 1.0 |
| **Corroboration** | `1 + 0.1 * (independent_sources - 1)` capped at 1.5 | 1.0 - 1.5 |
| **Contradiction Penalty** | `1 - 0.15 * contradiction_count` floored at 0.5 | 0.5 - 1.0 |
| **Time Decay** | `e^(-lambda * age_days)` with configurable half-life | 0.0 - 1.0 |
| **Source Independence** | `1 + 0.05 * independent_source_count` capped at 1.3 | 1.0 - 1.3 |

### Confidence Thresholds by Domain

| Domain | Minimum Confidence | [Trinity Gate](/capabilities/trinity-gate/) Required |
|--------|-------------------|-------------------------|
| **Critical Decisions** | 0.95 | MANDATORY |
| **Security Ratings** | 0.80 | MANDATORY |
| **Standard Operations** | 0.80 | MANDATORY |
| **Exploratory Analysis** | 0.60 | RECOMMENDED |
| **Research Queries** | 0.50 | OPTIONAL |

### Temporal Decay Configuration

```elixir
# Configure domain-specific decay rates
PrismaticNabla.configure_decay(%{
  security_vulnerabilities: %{half_life_days: 30},   # Fast decay: vulns get patched
  corporate_ownership: %{half_life_days: 365},        # Slow decay: ownership changes rarely
  dns_records: %{half_life_days: 7},                  # Medium decay: DNS changes periodically
  compliance_assessment: %{half_life_days: 90}         # Quarterly reassessment expected
})
```

## Trinity Gate (4-Layer)

The Trinity Gate is the platform's multi-layer verification system. All claims must pass through it before achieving "verified" status:

### Layer Architecture

| Layer | Method | Verified Property | Nabla Module |
|-------|--------|-------------------|-------------|
| **Layer 1: Structural** | Graph Theory | Belief graph forms valid DAG, no cycles | `PrismaticNabla.TrinityGate.Structural` |
| **Layer 2: Logical** | Rule-Based | Propositions satisfy logical consistency | `PrismaticNabla.TrinityGate.Logical` |
| **Layer 3: Formal** | [Modal Logic](/glossary/modal-logic/) + [Lean4](/glossary/lean4/) | Claims proven in formal system | `PrismaticNabla.TrinityGate.Formal` |
| **Layer 4: Consciousness** | Meta-verification | Reasoning process itself is sound | `PrismaticNabla.TrinityGate.Consciousness` |

### Gate Execution

```elixir
# Pass belief through Trinity Gate
{:ok, verified} = PrismaticNabla.trinity_gate(belief)

# Returns detailed verification report
%{
  structural: %{passed: true, dag_valid: true, cycles: 0},
  logical: %{passed: true, contradictions_flagged: 1, consistent: true},
  formal: %{passed: true, lean4_proof: "theorem ...", verified: true},
  consciousness: %{passed: true, meta_confidence: 0.97},
  overall: :passed,
  verified_at: ~U[...]
}

# Check axiom compliance
{:ok, report} = PrismaticNabla.axiom_check(belief)
# Returns per-axiom compliance status
```

## Usage

```elixir
# Create a belief with evidence
{:ok, belief} = PrismaticNabla.assert(%{
  claim: "Entity X is high risk",
  evidence: [signal_1, signal_2, signal_3],
  confidence: 0.87
})

# Verify through Trinity Gate
{:ok, verified} = PrismaticNabla.trinity_gate(belief)

# Check axiom compliance
{:ok, report} = PrismaticNabla.axiom_check(belief)

# Query beliefs with confidence threshold
{:ok, beliefs} = PrismaticNabla.query(entity: "X", min_confidence: 0.80)

# Revise belief with new evidence (Bayesian update)
{:ok, revised} = PrismaticNabla.revise(belief, new_evidence)

# Get full belief graph for entity
{:ok, graph} = PrismaticNabla.entity_graph("X", depth: 3)
```

## Architecture

```
Raw Evidence --> Signal Collection --> Axiom Enforcement --> Trinity Gate --> Verified Belief
                    |                    |                  |                    |
              Plurality Check      Contradiction       Structural +         Belief Graph
              Source Independence   Preservation        Logical +             Storage
              Provenance Tracking  Time Decay           Formal Check
```

| Component | Implementation |
|-----------|---------------|
| **Axiom Pipeline** | GenServer chain with sequential enforcement |
| **Belief Graph** | [KuzuDB](/glossary/kuzudb/) for persistence, [ETS](/glossary/ets/) for hot access |
| **Trinity Gate** | 4-stage pipeline with parallel Layer 1-2 and sequential Layer 3-4 |
| **Confidence Engine** | Pure functional module with Bayesian update |
| **Time Decay** | Background GenServer applying periodic decay to all beliefs |
| **[Telemetry](/glossary/telemetry/)** | Full event coverage for axiom checks, gate passages, confidence updates |

## Integration Points

All platform modules that make assessments or form conclusions integrate with Nabla for epistemic verification:

| Consumer | Integration Type | Primary Use |
|----------|-----------------|-------------|
| **[Prismatic Perimeter](/apps/prismatic-perimeter/)** | Security rating confidence | Evidence-based A-F grades |
| **[Prismatic](/apps/prismatic/)** | OSINT assessment confidence | Investigation conclusion validation |
| **[Prismatic Lean4](/apps/prismatic-lean4/)** | Trinity Gate Layer 3 | Formal proof integration |
| **[Prismatic Monte Carlo](/apps/prismatic-monte-carlo/)** | [QEVE](/glossary/qeve/) probabilistic component | Statistical confidence bounds |
| **[Prismatic Agents](/apps/prismatic-agents/)** | Agent decision confidence | Epistemic-aware agent operations |
| **[Prismatic OSINT Czech Legal](/apps/prismatic-osint-czech-legal/)** | Entity resolution confidence | Cross-source entity matching |

## Related Components

- [Prismatic Lean4](/apps/prismatic-lean4/) - Formal proof engine for Trinity Gate Layer 3
- [Prismatic Monte Carlo](/apps/prismatic-monte-carlo/) - Probabilistic verification
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - EASM security ratings
- [Prismatic Web](/apps/prismatic-web/) - [LiveView](/glossary/liveview/) dashboards
- [Prismatic API](/apps/prismatic-api/) - REST [API gateway](/glossary/api-gateway/)

## Related Agents

- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Enforces the 7 NABLA axioms across all platform intelligence assessments and belief assertions
- [Evolution Orchestrator Supreme](/agents/evolution-orchestrator-supreme/) -- Drives epistemic framework evolution ensuring axiom compliance scales with platform growth
- [Cross-Pollination Specialist](/agents/cross-pollination-specialist/) -- Transfers epistemic verification patterns across security, compliance, and intelligence domains

## Related Capabilities

- [NABLA Axioms](/capabilities/nabla-axioms/) -- The 7 non-negotiable axioms implemented and enforced by the Prismatic Nabla framework
- [Trinity Gate](/capabilities/trinity-gate/) -- The 4-layer verification system (structural, logical, formal, consciousness) managed by Nabla
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Belief graph construction and confidence scoring for multi-source intelligence fusion

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)