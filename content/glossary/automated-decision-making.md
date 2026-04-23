+++
title = "Automated Decision Making"
weight = 50
[extra]
tags = ["glossary", "automation", "ai", "decision-systems", "epistemic", "agents", "governance", "rules-engine"]
description = "Systems that make decisions without human intervention based on predefined rules, machine learning models, or epistemic frameworks -- replacing manual judgment with deterministic or probabilistic evaluation pipelines"
category = "artificial-intelligence"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "AI and Decision Systems"
related_concepts = ["algorithmic-decision-making", "autonomous-agent", "nabla-infinity", "epistemic-pipeline", "confidence-threshold", "trinity-gate", "rule-based-reasoning"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 7
prerequisites = ["agent", "confidence-threshold", "epistemic-pipeline", "rule-based-reasoning"]
learning_path = ["rule-based-reasoning", "confidence-scoring", "epistemic-pipeline", "automated-decision-making", "autonomous-agent"]
interactive_demos = ["/labs/glossary/automated-decision-making"]
code_examples = ["Decision engine GenServer", "Confidence-gated decision", "Authority-bounded decision"]
external_resources = ["https://en.wikipedia.org/wiki/Automated_decision-making", "https://gdpr-info.eu/art-22-gdpr/"]
version_introduced = "Generation 6"
stability_level = "stable"
testing_scenarios = ["decision boundary validation", "authority escalation", "confidence threshold enforcement", "audit trail completeness"]
keywords = ["decision-making", "automation", "rules-engine", "epistemic", "confidence", "authority", "delegation", "governance"]
related_terms = ["algorithmic-decision-making", "autonomous-agent", "nabla-infinity", "epistemic-pipeline", "confidence-threshold", "trinity-gate", "agent-tier", "authority-level", "rule-based-reasoning", "quality-gate"]
word_count = 1747
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Automated Decision Making - Prismatic Platform"
+++

## Definition

Automated decision making refers to systems that evaluate inputs, apply decision logic, and produce actionable outputs without requiring human intervention at the point of decision. The decision logic may be encoded as explicit rules (deterministic), learned from data (probabilistic), or derived from epistemic frameworks that reason about evidence quality and confidence levels. The defining characteristic is the removal of a human from the decision loop for a specific class of decisions, while maintaining human oversight over the decision framework itself.

Formally, an automated decision system is a function `D: Context x Policy -> Action x Justification` where the context includes all relevant state, the policy defines the decision boundaries, the action is the selected response, and the justification provides an auditable explanation of why that action was chosen.

## Overview

Automated decision making is not a single technique but a spectrum. At one end are simple rule-based systems -- if temperature exceeds threshold, trigger alert. At the other end are complex epistemic frameworks that weigh multiple evidence streams, account for uncertainty, preserve contradictions, and produce decisions with explicit confidence intervals. The choice of where a system falls on this spectrum depends on the stakes of the decision, the complexity of the domain, and the cost of errors.

The history of automated decision making traces from early expert systems in the 1970s through business rules engines in the 1990s to modern ML-powered decision systems. Each generation increased the complexity of decisions that could be automated, but also increased the difficulty of understanding, auditing, and correcting those decisions.

Three properties distinguish high-quality automated decision systems from naive implementations:

1. **Transparency**: Every decision must be explainable. "The model said so" is not an explanation.
2. **Bounded authority**: The system must know what it is authorized to decide and what requires escalation.
3. **Reversibility**: Automated decisions should be reversible where possible, with rollback mechanisms for when the decision logic itself is found to be flawed.

In the context of software platforms, automated decision making governs everything from code quality enforcement (should this commit be accepted?) to runtime behavior (should this request be rate-limited?) to system evolution (should this optimization be applied?).

## Technical Details

### Decision Architecture Patterns

| Pattern | Mechanism | Uncertainty Handling | Auditability | Use Case |
|---------|-----------|---------------------|--------------|----------|
| **Rule-based** | If-then-else chains | None (deterministic) | Complete | Policy enforcement |
| **Threshold-gated** | Numeric comparison | Implicit in threshold | High | Quality gates |
| **Confidence-scored** | Probabilistic evaluation | Explicit confidence interval | High | Evidence assessment |
| **Epistemic** | Multi-signal reasoning | Preserved contradictions | Complete | Strategic decisions |
| **ML-powered** | Learned patterns | Model uncertainty | Variable | Pattern recognition |
| **Consensus-based** | Multi-agent voting | Divergence tracking | Complete | High-stakes decisions |

### Decision Pipeline Architecture

A robust automated decision system follows a pipeline architecture:

```
Input Collection -> Evidence Assembly -> Confidence Evaluation
    -> Policy Matching -> Authority Check -> Decision Execution
    -> Audit Logging -> Outcome Monitoring
```

Each stage is independently testable and observable.

### Confidence-Gated Decision Making

The most important pattern in the Prismatic Platform's decision architecture is confidence gating -- decisions are authorized only when the confidence in the underlying evidence exceeds a context-dependent threshold:

```elixir
defmodule Prismatic.Decision.ConfidenceGate do
  @moduledoc """
  Evaluates decisions against confidence thresholds that vary
  by context. Critical decisions require higher confidence than
  exploratory ones. Implements the NABLA Infinity confidence
  threshold protocol.
  """

  @type evidence :: %{
    signals: [signal()],
    confidence: float(),
    contradictions: [contradiction()],
    provenance: [source()]
  }

  @type signal :: %{value: term(), source: atom(), timestamp: DateTime.t()}
  @type contradiction :: %{signal_a: signal(), signal_b: signal(), description: String.t()}
  @type source :: %{name: atom(), reliability: float(), last_verified: DateTime.t()}

  @type decision_context :: :critical | :standard | :exploratory | :research
  @type decision_result ::
    {:authorized, term(), float()}
    | {:blocked, :insufficient_confidence, float()}
    | {:escalated, :contradictions_unresolved, [contradiction()]}

  @context_thresholds %{
    critical: 0.95,
    standard: 0.80,
    exploratory: 0.60,
    research: 0.50
  }

  @spec evaluate(evidence(), decision_context(), (evidence() -> term())) :: decision_result()
  def evaluate(evidence, context, decision_fn) do
    threshold = Map.fetch!(@context_thresholds, context)

    cond do
      has_unresolved_critical_contradictions?(evidence) ->
        {:escalated, :contradictions_unresolved, evidence.contradictions}

      evidence.confidence < threshold ->
        {:blocked, :insufficient_confidence, evidence.confidence}

      true ->
        decision = decision_fn.(evidence)
        emit_telemetry(:decision_made, context, evidence.confidence)
        {:authorized, decision, evidence.confidence}
    end
  end

  @spec has_unresolved_critical_contradictions?(evidence()) :: boolean()
  defp has_unresolved_critical_contradictions?(evidence) do
    Enum.any?(evidence.contradictions, fn c ->
      c.severity == :critical and c.status == :unresolved
    end)
  end

  @spec emit_telemetry(atom(), decision_context(), float()) :: :ok
  defp emit_telemetry(event, context, confidence) do
    :telemetry.execute(
      [:prismatic, :decision, event],
      %{confidence: confidence},
      %{context: context, timestamp: DateTime.utc_now()}
    )
  end
end
```

### Authority-Bounded Decision Delegation

Not all decisions should be made at the same level. The Prismatic Platform implements a hierarchical authority model where each agent or system component has explicit decision boundaries:

```elixir
defmodule Prismatic.Decision.AuthorityBoundary do
  @moduledoc """
  Enforces authority boundaries on automated decisions.
  Each decision-maker has an explicit authority level (L1-L5)
  and a set of permitted decision categories. Decisions that
  exceed the maker's authority are escalated, never silently
  executed.
  """

  @type authority_level :: :l1_operational | :l2_tactical | :l3_strategic | :l4_supreme | :l5_cosmic
  @type decision_category :: :code_quality | :deployment | :security | :architecture | :policy

  @type decision_maker :: %{
    id: atom(),
    authority: authority_level(),
    permitted_categories: [decision_category()],
    escalation_target: atom() | nil
  }

  @authority_hierarchy [:l1_operational, :l2_tactical, :l3_strategic, :l4_supreme, :l5_cosmic]

  @spec authorize(decision_maker(), decision_category(), authority_level()) ::
    {:ok, :authorized} | {:error, :escalation_required, atom()}
  def authorize(maker, category, required_level) do
    maker_rank = Enum.find_index(@authority_hierarchy, &(&1 == maker.authority))
    required_rank = Enum.find_index(@authority_hierarchy, &(&1 == required_level))

    cond do
      category not in maker.permitted_categories ->
        {:error, :escalation_required, maker.escalation_target}

      maker_rank < required_rank ->
        {:error, :escalation_required, maker.escalation_target}

      true ->
        {:ok, :authorized}
    end
  end
end
```

### Decision Audit Trail

Every automated decision produces an immutable audit record:

| Field | Type | Purpose |
|-------|------|---------|
| `decision_id` | UUID | Unique identifier for correlation |
| `timestamp` | DateTime (microsecond) | When the decision was made |
| `context` | atom | Decision context (critical/standard/etc.) |
| `inputs` | map | All inputs considered |
| `confidence` | float | Confidence level at decision time |
| `contradictions` | list | Any unresolved contradictions |
| `authority_level` | atom | Authority of the decision-maker |
| `outcome` | term | The decision itself |
| `justification` | string | Human-readable explanation |
| `reversible` | boolean | Whether the decision can be rolled back |

## Implementation in Prismatic Platform

### Agent Authority Delegation

The Prismatic Platform's 530+ AIAD agents operate under a strict authority hierarchy. Each agent has a defined authority level (L1 through L5) that determines what decisions it can make autonomously:

- **L1 Operational Units**: Can decide to format code, run checks, emit reports. Cannot modify configuration or policy.
- **L2 Tactical Specialists**: Can decide to refactor code, apply fixes, escalate findings. Cannot change architecture.
- **L3 Strategic Commanders**: Can decide on team-level strategy, resource allocation, inter-agent coordination.
- **L4 Supreme Authority**: Can make platform-wide decisions on architecture, policy, and evolution direction.
- **L5 Cosmic Clearance**: Reserved for doctrine-level decisions affecting fundamental platform principles.

### Quality Gate Enforcement

The [Quality Gate](/glossary/quality-gate/) system makes automated pass/fail decisions across 13 quality domains. When `mix quality.gates` runs, it evaluates each domain independently and makes a composite decision: either all domains pass (merge allowed) or any domain fails (merge blocked). There is no human override -- the decision is final.

### Autoevolve Decision Engine

The [Autoevolve](/glossary/autoevolve/) system makes decisions about platform evolution. It scans the codebase for optimization opportunities, evaluates the risk/reward ratio of each candidate change, and decides which improvements to apply. Decisions with risk scores above a threshold are escalated for human review rather than applied automatically.

### NABLA Infinity Integration

The [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework governs the most critical decisions on the platform. It requires signal plurality (minimum 2 independent signals), contradiction preservation (no smoothing over conflicting evidence), and mandatory provenance (every belief must be traceable to its source). Decisions that violate these axioms are blocked by the framework itself.

### Session Lifecycle Decisions

The [Session Discipline](/glossary/session-discipline/) protocol automates decisions about session workflow: whether to run full or fast quality checks, when to trigger autoevolve scans, and whether session outputs meet completeness criteria before session close.

## Comparison with Alternatives

| Approach | Speed | Consistency | Explainability | Scalability | Risk |
|----------|-------|-------------|----------------|-------------|------|
| **Human-only decisions** | Slow | Low | High (if documented) | Poor | Bias, fatigue |
| **Human-in-the-loop** | Medium | Medium | High | Medium | Bottleneck |
| **Rule-based automation** | Fast | Perfect | Complete | High | Rigidity |
| **ML-based automation** | Fast | High | Variable | High | Opacity |
| **Epistemic automation (Prismatic)** | Fast | Perfect | Complete | High | Complexity |

The Prismatic approach combines the consistency of rule-based systems with the nuance of epistemic reasoning. Decisions are fast, deterministic, fully auditable, and -- critically -- aware of their own uncertainty. When a decision cannot be made with sufficient confidence, the system escalates rather than guessing.

## Best Practices

1. **Define authority boundaries explicitly**: Every automated decision-maker must have a documented scope of authority. Undefined boundaries lead to scope creep and unintended consequences.

2. **Require justification, not just outcomes**: A decision without an explanation is a liability. Every automated decision should produce a human-readable justification.

3. **Implement graduated confidence thresholds**: Critical decisions require higher confidence than routine ones. A single threshold for all decisions is either too permissive for critical cases or too restrictive for routine ones.

4. **Preserve contradictions**: When evidence conflicts, do not resolve the contradiction by discarding one signal. Escalate to a higher authority or a human decision-maker. Premature contradiction resolution is a primary source of automated decision failures.

5. **Make decisions reversible where possible**: Automated decisions should include rollback mechanisms. This is especially important during the initial deployment of new decision logic.

6. **Monitor decision quality over time**: Track the outcomes of automated decisions. If a decision category shows a high error rate, the decision logic needs refinement -- not just the inputs.

7. **Separate decision logic from execution**: The system that decides "what to do" should be independent from the system that "does it." This enables testing decision logic in isolation and prevents execution failures from corrupting decision state.

## Common Pitfalls

1. **Automating without understanding**: Converting a manual process to an automated one without fully understanding the manual process's implicit heuristics and edge cases leads to brittle automation that fails on the cases the manual process handled through tacit knowledge.

2. **Authority creep**: Starting with narrow automated decisions and gradually expanding scope without updating the authority framework. Eventually the system makes decisions it was never designed or authorized to make.

3. **Confidence theater**: Assigning confidence scores without a rigorous methodology for computing them. A confidence score of 0.95 is meaningless if it was not derived from actual evidence quality assessment.

4. **Audit trail as afterthought**: Designing the decision system first and adding auditing later results in incomplete audit trails that miss critical context. Audit logging must be integral to the decision architecture.

5. **Single-signal decisions**: Making automated decisions based on a single data source or evaluation method. The [NABLA Infinity](/glossary/nabla-infinity/) framework's signal plurality axiom exists precisely to prevent this failure mode.

6. **Ignoring time decay**: Evidence becomes less reliable over time. A security scan from last week may not reflect today's vulnerability landscape. Decision systems must account for evidence freshness.

7. **False dichotomy between automation and human judgment**: The goal is not to replace all human decisions but to automate the decisions that humans make poorly (high-volume, time-pressured, consistency-critical) while preserving human judgment for the decisions that humans make well (novel, ambiguous, ethically complex).

## Use Cases

### Quality Enforcement Decisions
Every code commit triggers automated decisions across 13 quality domains. The system decides pass/fail for each domain and computes a composite decision. No human involvement is needed for the common case (all pass). Human attention is required only when the system identifies a genuine quality violation.

### Agent Task Allocation
When a new task enters the platform, the orchestration system automatically decides which agent is best suited to handle it based on the task's domain, required authority level, agent availability, and historical performance. This decision is made in milliseconds, enabling real-time task routing across 530+ agents.

### Security Threat Assessment
The [Prismatic Perimeter](/glossary/prismatic-perimeter/) EASM system automatically assesses the security posture of discovered assets. It computes security ratings (A-F), identifies compliance gaps, and decides which findings warrant immediate attention based on severity, exploitability, and business impact.

### Platform Evolution
The autoevolve system automatically decides which platform improvements to apply. It evaluates candidate optimizations against risk criteria, performance benchmarks, and quality standards. Low-risk, high-value improvements are applied automatically; higher-risk changes are queued for human review.

### Epistemic Validation
The Trinity Gate makes automated decisions about belief validity. Every claim that enters the platform's knowledge system must pass three independent validation checks. The decision is binary: the claim is either validated (all three gates pass) or rejected (any gate fails). There is no partial validation.

## Related Concepts

- [Algorithmic Decision Making](/glossary/algorithmic-decision-making/) -- the broader field encompassing all algorithmic approaches to decisions
- [Autonomous Agent](/glossary/autonomous-agent/) -- software entities that embody automated decision-making capability
- [NABLA Infinity](/glossary/nabla-infinity/) -- the epistemic framework governing critical platform decisions
- [Epistemic Pipeline](/glossary/epistemic-pipeline/) -- the processing pipeline for evidence-based decisions
- [Confidence Threshold](/glossary/confidence-threshold/) -- numeric boundaries that gate decision authorization
- [Trinity Gate](/glossary/trinity-gate/) -- three-layer verification checkpoint for epistemic decisions
- [Agent Tier](/glossary/agent-tier/) -- authority levels that bound agent decision-making scope
- [Authority Level](/glossary/authority-level/) -- the hierarchical permission system for decisions
- [Rule-Based Reasoning](/glossary/rule-based-reasoning/) -- deterministic decision logic via if-then rules
- [Quality Gate](/glossary/quality-gate/) -- automated pass/fail decisions for code quality
- [Contradiction Preservation](/glossary/contradiction-preservation/) -- maintaining conflicting signals rather than resolving prematurely

## See Also

- [Autonomous Decision Making](/glossary/autonomous-decision-making/) for decisions made by fully autonomous systems
- [Autoevolve](/glossary/autoevolve/) for automated platform evolution decisions
- [Quality Gates](/glossary/quality-gates/) for the 13-domain quality enforcement system
- [GDPR](/glossary/gdpr/) for regulatory constraints on automated decision making (Article 22)
- [Audit Trail](/glossary/audit-trail/) for decision logging and compliance

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
