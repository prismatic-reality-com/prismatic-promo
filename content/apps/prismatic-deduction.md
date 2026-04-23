+++
title = "Prismatic Deduction"
weight = 50
[extra]
icon = "light-bulb"
color = "yellow"
description = "Logical deduction engine for automated reasoning and inference"
category = "Intelligence"
files = "140"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1059
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Deduction", "Logical", "apps", "Intelligence", "Prismatic Platform", "PrismaticDeduction", "Prolog", "Backward"]
tags = ["apps", "intelligence", "prismatic-deduction", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Deduction - Prismatic Platform"
+++

## Overview

Prismatic Deduction provides automated logical reasoning capabilities for deriving new conclusions from existing knowledge. It implements forward and backward chaining [inference](/glossary/inference/), rule-based deduction, and abductive reasoning to discover hidden relationships and generate hypotheses from [OSINT](/glossary/osint/) data. In intelligence analysis, the most valuable insights are often not directly observed but rather deduced from the intersection of multiple data points -- Deduction automates this process at scale.

The module operates on a knowledge base of facts (observed data) and rules (domain expertise encoded as logical implications). Forward chaining proactively applies rules to known facts to discover everything that can be concluded, surfacing connections that analysts might miss. Backward chaining works in reverse, starting from a hypothesis and searching for supporting evidence. Abductive reasoning generates the most likely explanations for observed anomalies, producing ranked hypotheses that guide further investigation.

Every conclusion produced by Deduction carries a full explanation chain -- the sequence of rules and facts that led to it. This is not merely a debugging convenience; it is a [NABLA](/glossary/nabla-infinity/) framework requirement. The provenance axiom mandates that all beliefs in the platform be traceable to their origins. Deduction enforces this by construction: no conclusion exists without a derivation path.

## Architecture

Deduction is built around three inference engines sharing a common knowledge base, coordinated through a central server process.

```
Facts (ETS) + Rules (DSL) --> Forward Chainer (event-driven)
                          --> Backward Chainer (goal-directed)
                          --> Abductive Reasoner (hypothesis generation)
                                    |
                          Explanation Chain Generator
                                    |
                          Confidence Propagation (NABLA)
                                    |
                          Structured Conclusions
```

The Forward Chainer is an event-driven [GenServer](/glossary/genserver/) that reacts to new facts arriving in the knowledge base, applying matching rules and asserting derived conclusions. The Backward Chainer accepts goal queries and searches the rule space using depth-first search with configurable depth limits and cycle detection. The Abductive Reasoner inverts the rule set, taking an observation and searching for fact combinations that would explain it.

### Process Topology

```
PrismaticDeduction.Application (Supervisor, :one_for_one)
+-- PrismaticDeduction.Server (GenServer)
|     Knowledge base state management and inference coordination
+-- PrismaticDeduction.ForwardChainer (GenServer)
|     Event-driven rule application on new facts
+-- PrismaticDeduction.BackwardChainer (GenServer)
|     Goal-directed search with cycle detection
+-- PrismaticDeduction.AbductiveReasoner (GenServer)
|     Hypothesis generation from observations
+-- PrismaticDeduction.Storage (GenServer)
|     Knowledge base persistence to PostgreSQL
+-- Task.Supervisor
      Parallel inference task execution
```

The knowledge base is stored in [ETS](/glossary/ets/) for fast [pattern matching](/glossary/pattern-matching/), with persistent snapshots to [PostgreSQL](/glossary/postgresql/) for durability. Rule definitions use an [Elixir](/glossary/elixir/) DSL that compiles to an internal representation compatible with the [Prismatic Logic Prolog](/apps/prismatic-logic-prolog/) engine.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticDeduction` | Public facade: `forward_chain/1`, `backward_chain/1`, `abduce/1`, `explain/1` |
| `PrismaticDeduction.Application` | OTP application entry point |
| `PrismaticDeduction.Server` | GenServer managing knowledge base state and inference coordination |
| `PrismaticDeduction.Rules` | Rule definition DSL with compile-time validation |
| `PrismaticDeduction.Claim` | Claim data structure with confidence and explanation chain |
| `PrismaticDeduction.Findings` | Finding aggregation and deduplication |
| `PrismaticDeduction.Graph` | Graph-based knowledge representation for rule traversal |
| `PrismaticDeduction.Storage` | Knowledge base persistence to PostgreSQL |
| `PrismaticDeduction.Stream` | Stream-based fact processing for large knowledge bases |
| `PrismaticDeduction.Adapter` | Adapter interface for external knowledge sources |
| `PrismaticDeduction.BlackboardAdapter` | Integration with Prismatic Blackboard for multi-agent reasoning |
| `PrismaticDeduction.Logic` | Core logic engine implementation |
| `PrismaticDeduction.Prolog` | Prolog-compatible rule import and execution |
| `PrismaticDeduction.Lean4` | Lean4 formal verification of deduction chains |
| `PrismaticDeduction.Dil` | Deduction Intermediate Language for rule compilation |

## Rule Definition DSL

The rule DSL provides a declarative syntax for encoding domain expertise as logical implications. Rules are compiled to an internal representation that supports both forward and backward chaining evaluation. The DSL supports pattern variables, guard conditions, and confidence annotations.

```elixir
PrismaticDeduction.define_rules(:risk_assessment, [
  rule(:high_risk_entity,
    when: [sanctions_match(:entity, _), active_insolvency(:entity)],
    then: high_risk(:entity),
    confidence: 0.95),

  rule(:shell_company_indicator,
    when: [registered_address_shared(:entity, :other, _count),
           _count > 10, recent_registration(:entity)],
    then: shell_company_suspect(:entity),
    confidence: 0.80),

  rule(:beneficial_ownership_risk,
    when: [complex_ownership_chain(:entity, _depth),
           _depth > 3, high_risk_jurisdiction(:entity)],
    then: beneficial_ownership_risk(:entity),
    confidence: 0.85)
])
```

Rules are validated at compile time to detect common errors such as undefined predicates, unreachable rules, and circular dependencies. The DSL also supports rule versioning, allowing rules to be updated without invalidating previously derived conclusions -- new rule versions are applied prospectively while historical derivation chains reference the rule version that was active when the conclusion was drawn.

## Confidence Propagation

Conclusions derived through inference chains carry confidence scores that attenuate with each reasoning step. The attenuation factor (configurable, default 0.95) models the reality that longer chains of reasoning introduce more uncertainty. A conclusion derived through three rules from high-confidence facts will carry lower confidence than one derived through a single rule.

The confidence propagation model supports three strategies:

| Strategy | Formula | Use Case |
|----------|---------|----------|
| **Minimum** | `min(fact_confidences) * attenuation^depth` | Conservative: weakest link determines confidence |
| **Product** | `product(fact_confidences) * attenuation^depth` | Bayesian: independent evidence multiplied |
| **Weighted** | `weighted_avg(fact_confidences, rule_weights)` | Custom: domain-specific weighting |

## Configuration

```elixir
config :prismatic_deduction,
  knowledge_base_backend: :ets,
  persistence_backend: :postgresql,
  max_forward_chain_depth: 10,
  max_backward_chain_depth: 20,
  confidence_attenuation: 0.95,
  confidence_strategy: :minimum,
  cycle_detection: true,
  explanation_generation: true,
  prolog_compatibility: true,
  max_hypotheses: 10
```

Configuration controls the maximum depth for forward and backward chaining to prevent infinite loops, confidence attenuation factor per inference step (each hop reduces confidence by the configured factor), cycle detection to prevent circular reasoning, and whether full explanation chains are generated for every conclusion.

## API Reference

```elixir
# Forward chaining from known facts
{:ok, conclusions} = PrismaticDeduction.forward_chain(
  facts: known_facts, rules: :risk_assessment, max_depth: 5)

# Backward chaining to verify a hypothesis
{:ok, evidence} = PrismaticDeduction.backward_chain(
  goal: high_risk(:entity_123),
  knowledge_base: :risk_assessment,
  max_depth: 10)
# => {:ok, %{supported: true, confidence: 0.87, evidence_chain: [...]}}

# Generate hypotheses for an anomaly
{:ok, hypotheses} = PrismaticDeduction.abduce(
  observation: {:unusual_transfer, "entity_456", amount: 5_000_000},
  knowledge_base: :financial_rules, max_hypotheses: 5)
# => {:ok, [%{hypothesis: :money_laundering, confidence: 0.72, explanation: [...]}, ...]}

# Get human-readable explanation for a conclusion
{:ok, explanation} = PrismaticDeduction.explain(conclusion)
# => {:ok, "entity_123 is high_risk because: sanctions_match AND active_insolvency (rule: high_risk_entity, confidence: 0.95)"}
```

## Testing

Forward chaining tests verify correct conclusion derivation from known fact/rule combinations. Backward chaining tests verify goal-directed search with cycle detection. Abductive reasoning tests verify hypothesis ranking by simplicity and evidence support. Confidence propagation tests verify that attenuation is monotonically decreasing through deduction chains.

Property-based tests generate random rule sets and fact bases to verify that the inference engines terminate, produce consistent results, and that confidence attenuation is monotonically decreasing through deduction chains. Explanation chain tests verify that every conclusion is traceable to its premises. Integration tests with [Prismatic Logic Prolog](/apps/prismatic-logic-prolog/) verify compatibility of the rule DSL with Prolog-based evaluation.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Security findings consumed as facts for inference |
| [Prismatic Property Intelligence](/apps/prismatic-property-intelligence/) | Ownership data as inference premises |
| [Prismatic Influence](/apps/prismatic-influence/) | Credibility assessments as fact inputs |
| [Prismatic Narrative](/apps/prismatic-narrative/) | Report generation from deduction explanations |
| [Prismatic CER](/apps/prismatic-cer/) | Deduction conclusions as compliance evidence |
| [Prismatic Logic Prolog](/apps/prismatic-logic-prolog/) | Logic programming backend for complex rule evaluation |
| [Prismatic Blackboard](/apps/prismatic-blackboard/) | Multi-agent collaborative reasoning integration |
| [Prismatic Lean4](/apps/prismatic-lean4/) | Formal verification of deduction chain correctness |

## NABLA Compliance

Deduction is one of the most NABLA-critical modules in the platform, as it generates derived beliefs that must carry full provenance.

| NABLA Axiom | Deduction Enforcement | Implementation |
|-------------|---------------------|----------------|
| Provenance Mandatory | Every conclusion carries a complete explanation chain | Derivation path from premises through rules to conclusion |
| Signal Plurality | Multiple independent rules must converge for high confidence | Multi-rule corroboration required for critical conclusions |
| Contradiction Preservation | Conflicting conclusions preserved with both derivation chains | Contradiction detection triggers investigation rather than resolution |
| Time Decay | Fact validity windows respected in temporal reasoning | Temporal logic operators enforce fact freshness |
| Unknown Valid | Insufficient evidence produces explicit "unknown" state | Backward chaining terminates with uncertainty when evidence is missing |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Forward chain (100 facts, 50 rules) | 10-50ms | Depends on rule matching complexity |
| Backward chain (single goal) | 5-100ms | Depends on search depth |
| Abductive reasoning | 50-500ms | Depends on hypothesis space size |
| Explanation generation | < 5ms | Chain traversal after conclusion |
| Rule compilation | < 10ms | Per rule set, cached after first compile |

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 128 MB | 256 MB |
| CPU | 2 cores | 4 cores |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :deduction, :forward_chain]`, `[:prismatic, :deduction, :backward_chain]`, `[:prismatic, :deduction, :abduce]`, `[:prismatic, :deduction, :conclusion_derived]`.

## Related Resources

- [Prismatic Logic Prolog](/apps/prismatic-logic-prolog/) -- Logic programming backend
- [Prismatic Narrative](/apps/prismatic-narrative/) -- Human-readable report generation
- [Prismatic CER](/apps/prismatic-cer/) -- Compliance evidence storage
- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Ensures complete explanation chains
- [Evolution Orchestrator Supreme](/agents/evolution-orchestrator-supreme/) -- Drives rule set evolution
- [Cross-Pollination Specialist](/agents/cross-pollination-specialist/) -- Transfers reasoning patterns across domains
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Provenance mandatory axiom on all conclusions
- [Trinity Gate](/capabilities/trinity-gate/) -- Formal verification of logical consistency
- [Multi-Paradigm Solving](/capabilities/multi-paradigm-solving/) -- Forward, backward, and abductive reasoning unified

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)