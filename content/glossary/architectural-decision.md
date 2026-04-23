+++
title = "Architectural Decision"
weight = 50
[extra]
description = "A design choice that addresses a significant requirement and has measurable impact on system quality attributes, recorded as Architecture Decision Records (ADRs) to preserve decision rationale and context"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-advanced"
domain_category = "software-architecture"
related_concepts = ["domain-driven-design", "architectural-pattern", "software-architecture", "architectural-thinking", "bounded-context", "quality-attribute", "system-design-principle"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 6
prerequisites = ["software design fundamentals", "system quality attributes", "stakeholder analysis", "trade-off reasoning"]
learning_path = ["software-architecture", "architectural-decision", "architectural-pattern", "domain-driven-design", "architectural-thinking"]
interactive_demos = ["ADR template generator", "decision matrix evaluator"]
code_examples = ["ADR enforcement module", "decision record schema", "quality gate integration"]
external_resources = ["https://adr.github.io/", "https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions", "https://en.wikipedia.org/wiki/Architectural_decision"]
version_introduced = "0.1.0"
stability_level = "stable"
testing_scenarios = ["ADR completeness validation", "decision consistency checking", "impact assessment verification"]
keywords = ["ADR", "architectural decision", "decision record", "trade-off", "quality attributes", "design rationale", "architecture governance"]
tags = ["glossary", "architecture", "governance", "decision-making"]
related_terms = ["domain-driven-design", "architectural-pattern", "software-architecture", "architectural-thinking", "bounded-context", "system-design-principle", "architectural-insights", "quality-attribute"]
word_count = 1638
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Architectural Decision - Prismatic Platform"
+++

## Definition

An **Architectural Decision** is a design choice that addresses a functionally or non-functionally significant requirement, has measurable impact on a system's quality attributes (performance, security, maintainability, scalability, reliability), and is costly to reverse once implemented. Unlike routine implementation decisions (variable naming, algorithm selection within a module), architectural decisions shape the fundamental structure of a system -- its component boundaries, communication patterns, data ownership, technology selection, and deployment topology.

Formally, an architectural decision `D` can be characterized by the tuple `(Context, Drivers, Options, Decision, Consequences)` where `Context` describes the forces and constraints at play, `Drivers` enumerate the quality attributes being optimized, `Options` list the alternatives considered, `Decision` states the chosen path with rationale, and `Consequences` document the trade-offs accepted. This structured representation, known as an Architecture Decision Record (ADR), ensures that future maintainers understand not just what was decided but why it was decided, enabling informed reassessment as context evolves.

## Overview

The concept of explicitly recording architectural decisions emerged from Michael Nygard's influential 2011 article "Documenting Architecture Decisions," which argued that architecture is not a set of artifacts but a set of decisions. This insight shifted the focus from static diagrams (which become stale) to living decision logs (which capture the evolving reasoning behind system structure).

Architectural decisions matter because they constrain the solution space for all subsequent implementation decisions. Choosing an event-sourced architecture, for example, determines the data storage model, the consistency guarantees, the query patterns, the deployment requirements, and the debugging tools for the entire system. These decisions are architecturally significant precisely because they are difficult and expensive to reverse -- changing from a monolith to microservices, or from SQL to NoSQL, requires substantial rework that ripples through the entire codebase.

In the Prismatic Platform, architectural decisions govern critical system boundaries: the choice of an Elixir/OTP umbrella architecture with 141 apps, the trait-based storage abstraction supporting multiple backends, the AIAD agent standard defining how 1,090 agents communicate, and the auto-introspecting API gateway that eliminates specification drift. Each of these decisions is documented, justified, and periodically reviewed as the platform evolves through its generational advancement cycle.

### The ADR Lifecycle

| Phase | Activity | Output |
|-------|----------|--------|
| **Identification** | Recognize a decision point that will significantly impact quality attributes | Decision trigger documentation |
| **Analysis** | Enumerate alternatives, evaluate trade-offs, consult stakeholders | Options matrix with weighted criteria |
| **Decision** | Select the option that best satisfies the priority-ordered quality attributes | Formal ADR with rationale |
| **Implementation** | Execute the decision in code, infrastructure, and process | Working system reflecting the decision |
| **Review** | Periodically reassess decisions as context evolves | Updated ADR status (superseded, deprecated, confirmed) |

## Technical Details

### ADR Structure and Format

The canonical ADR format provides a lightweight yet comprehensive template for recording decisions:

```markdown
# ADR-{NUMBER}: {TITLE}

## Status
{Proposed | Accepted | Deprecated | Superseded by ADR-XXX}

## Context
{What is the issue that we are seeing that motivates this decision?}

## Decision Drivers
- {driver 1: quality attribute or constraint}
- {driver 2: quality attribute or constraint}

## Considered Options
1. {Option A}
2. {Option B}
3. {Option C}

## Decision
{Which option was selected and why}

## Consequences
### Positive
- {positive consequence 1}

### Negative
- {negative consequence 1}

### Neutral
- {neutral consequence 1}
```

### Decision Categorization

Architectural decisions fall into several categories, each with distinct characteristics:

| Category | Scope | Reversibility | Examples in Prismatic |
|----------|-------|---------------|----------------------|
| **Structural** | System decomposition | Very Low | Umbrella app architecture, bounded contexts |
| **Behavioral** | Communication patterns | Low | Message passing vs shared state, sync vs async |
| **Technology** | Platform/framework selection | Low-Medium | Elixir/OTP, PostgreSQL, Phoenix LiveView |
| **Integration** | External system coupling | Medium | OpenApiSpex, webhook protocols, OSINT adapters |
| **Data** | Storage and consistency | Very Low | Event sourcing, CQRS, ETS caching strategy |
| **Deployment** | Infrastructure and operations | Medium | Fly.io, Docker, CI/CD pipeline structure |
| **Process** | Development workflow | High | Code review policy, testing strategy, quality gates |

### Decision Quality Attributes Framework

Every architectural decision in the Prismatic Platform is evaluated against a standardized set of quality attributes:

```elixir
defmodule PrismaticArchitecture.DecisionEvaluator do
  @moduledoc """
  Evaluates architectural decisions against platform quality
  attributes using a weighted scoring model. Each decision
  must score above the minimum threshold to be accepted.
  """

  @type quality_attribute :: %{
    name: String.t(),
    weight: float(),
    score: 1..10,
    rationale: String.t()
  }

  @type decision_evaluation :: %{
    decision_id: String.t(),
    title: String.t(),
    attributes: [quality_attribute()],
    total_score: float(),
    status: :accepted | :rejected | :needs_review
  }

  @minimum_threshold 7.0

  @quality_attributes [
    %{name: "performance", weight: 0.15},
    %{name: "reliability", weight: 0.20},
    %{name: "security", weight: 0.20},
    %{name: "maintainability", weight: 0.15},
    %{name: "scalability", weight: 0.10},
    %{name: "testability", weight: 0.10},
    %{name: "operability", weight: 0.10}
  ]

  @spec evaluate(String.t(), String.t(), [{String.t(), 1..10, String.t()}]) ::
          {:ok, decision_evaluation()} | {:error, term()}
  def evaluate(decision_id, title, attribute_scores) do
    with {:ok, scored_attributes} <- validate_scores(attribute_scores) do
      total = calculate_weighted_score(scored_attributes)

      status =
        cond do
          total >= @minimum_threshold -> :accepted
          total >= @minimum_threshold - 1.0 -> :needs_review
          true -> :rejected
        end

      {:ok, %{
        decision_id: decision_id,
        title: title,
        attributes: scored_attributes,
        total_score: total,
        status: status
      }}
    end
  end

  @spec calculate_weighted_score([quality_attribute()]) :: float()
  defp calculate_weighted_score(attributes) do
    attributes
    |> Enum.reduce(0.0, fn attr, acc -> acc + attr.weight * attr.score end)
    |> Float.round(2)
  end

  @spec validate_scores([{String.t(), 1..10, String.t()}]) ::
          {:ok, [quality_attribute()]} | {:error, :missing_attributes}
  defp validate_scores(scores) do
    expected_names = Enum.map(@quality_attributes, & &1.name) |> MapSet.new()
    provided_names = Enum.map(scores, &elem(&1, 0)) |> MapSet.new()

    if MapSet.equal?(expected_names, provided_names) do
      attributes =
        Enum.map(scores, fn {name, score, rationale} ->
          weight =
            Enum.find(@quality_attributes, &(&1.name == name))
            |> Map.get(:weight)

          %{name: name, weight: weight, score: score, rationale: rationale}
        end)

      {:ok, attributes}
    else
      {:error, :missing_attributes}
    end
  end
end
```

### Decision Record Schema

The platform enforces a structured schema for all architectural decisions to ensure completeness and consistency:

```elixir
defmodule PrismaticArchitecture.ADR.Schema do
  @moduledoc """
  Schema definition for Architecture Decision Records.
  Enforces mandatory fields and validates completeness
  before an ADR can transition to 'accepted' status.
  """

  @type adr :: %{
    id: String.t(),
    title: String.t(),
    status: :proposed | :accepted | :deprecated | :superseded,
    context: String.t(),
    drivers: [String.t()],
    options: [option()],
    decision: String.t(),
    consequences: %{
      positive: [String.t()],
      negative: [String.t()],
      neutral: [String.t()]
    },
    metadata: %{
      author: String.t(),
      date: Date.t(),
      reviewers: [String.t()],
      supersedes: String.t() | nil,
      superseded_by: String.t() | nil,
      tags: [String.t()]
    }
  }

  @type option :: %{
    name: String.t(),
    description: String.t(),
    pros: [String.t()],
    cons: [String.t()]
  }

  @spec validate(adr()) :: {:ok, adr()} | {:error, [String.t()]}
  def validate(adr) do
    errors =
      []
      |> validate_required(adr, :id, "ID is required")
      |> validate_required(adr, :title, "Title is required")
      |> validate_required(adr, :context, "Context is required")
      |> validate_min_length(adr, :drivers, 1, "At least one decision driver required")
      |> validate_min_length(adr, :options, 2, "At least two options must be considered")
      |> validate_required(adr, :decision, "Decision statement is required")
      |> validate_consequences(adr)

    case errors do
      [] -> {:ok, adr}
      errors -> {:error, errors}
    end
  end

  defp validate_required(errors, map, key, message) do
    case Map.get(map, key) do
      nil -> [message | errors]
      "" -> [message | errors]
      _ -> errors
    end
  end

  defp validate_min_length(errors, map, key, min, message) do
    case Map.get(map, key, []) do
      list when length(list) >= min -> errors
      _ -> [message | errors]
    end
  end

  defp validate_consequences(errors, adr) do
    consequences = Map.get(adr, :consequences, %{})
    positive = Map.get(consequences, :positive, [])
    negative = Map.get(consequences, :negative, [])

    errors
    |> then(fn e -> if positive == [], do: ["At least one positive consequence required" | e], else: e end)
    |> then(fn e -> if negative == [], do: ["At least one negative consequence required (honesty about trade-offs)" | e], else: e end)
  end
end
```

### Decision Governance Framework

| Governance Level | Decision Scope | Approval Required | Documentation |
|-----------------|----------------|-------------------|---------------|
| **L1 - Team** | Module-internal design | Tech lead | Brief ADR or commit message |
| **L2 - Application** | App-level architecture | App owner + architect | Full ADR |
| **L3 - Platform** | Cross-app concerns | Architecture review board | Full ADR + RFC |
| **L4 - Strategic** | Technology stack, vendor | CTO + stakeholders | Full ADR + RFC + PoC |

## Implementation in Prismatic Platform

### Key Architectural Decisions

The Prismatic Platform's architecture is shaped by several foundational decisions:

**ADR-001: Elixir/OTP Umbrella Architecture** -- The decision to structure the platform as an umbrella project with 115+ apps rather than a monolith or microservices deployment. This provides the modularity and clear boundaries of microservices with the operational simplicity of a single deployment unit, leveraging OTP supervision trees for fault isolation.

**ADR-002: Trait-Based Storage Abstraction** -- Rather than coupling to a specific database, the platform defines storage behaviors (`PrismaticStorageCore.Traits`) that can be implemented by multiple backends (ETS, Ecto/PostgreSQL, Meilisearch, KuzuDB). This enables testing with fast in-memory backends while deploying against durable storage.

**ADR-003: AIAD Agent Standard** -- The decision to define a formal standard for agent specification (1,090 agents) including mandatory metadata, enforcement blocks, and doctrine compliance. This ensures consistency and composability across the entire agent ecosystem.

**ADR-004: Auto-Introspecting API Gateway** -- Instead of maintaining a separate OpenAPI specification, the API gateway discovers endpoints at boot time by introspecting Elixir module documentation and typespecs. This eliminates specification drift by construction.

**ADR-005: NO MERCY, NO DOUBTS Enforcement** -- The decision to enforce zero-tolerance quality standards (zero warnings, zero stubs, zero mocks in production code, 100% test coverage) through automated gates. This trades development velocity for long-term maintainability and reliability.

### Decision Tracking in Quality Gates

```elixir
defmodule PrismaticQuality.ADRCompliance do
  @moduledoc """
  Validates that critical architectural decisions are reflected
  in the codebase. Runs as part of the quality gate pipeline.
  """

  @spec check_umbrella_boundaries() :: {:ok, :compliant} | {:error, [String.t()]}
  def check_umbrella_boundaries do
    violations =
      for app <- list_umbrella_apps(),
          dep <- get_app_deps(app),
          not allowed_dependency?(app, dep) do
        "#{app} has unauthorized dependency on #{dep}"
      end

    case violations do
      [] -> {:ok, :compliant}
      _ -> {:error, violations}
    end
  end

  defp list_umbrella_apps, do: []
  defp get_app_deps(_app), do: []
  defp allowed_dependency?(_app, _dep), do: true
end
```

## Comparison with Alternatives

| Approach | Strengths | Weaknesses | When to Use |
|----------|-----------|------------|-------------|
| **Formal ADRs** | Traceable, reviewable, searchable | Overhead for small decisions | Significant, costly-to-reverse decisions |
| **Architecture diagrams** | Visual, intuitive | Static, no rationale captured | Supplementing ADRs, stakeholder communication |
| **Tribal knowledge** | Zero overhead | Untraceable, fragile, person-dependent | Never (anti-pattern) |
| **RFC process** | Broad input, thorough analysis | Slow, heavy-weight | Strategic decisions affecting multiple teams |
| **Code comments** | Close to implementation | No structure, easily lost | Implementation-level decisions only |
| **Decision matrices** | Quantitative, comparable | Can create false precision | Evaluating multiple options with clear criteria |

The Prismatic Platform uses formal ADRs for L2+ decisions, supplemented by code-level documentation for L1 decisions and RFCs for L4 strategic decisions.

## Best Practices

1. **Record decisions when they are made**: ADRs lose value when written retrospectively because the context, alternatives, and reasoning are forgotten. Capture decisions within the same sprint they are made.

2. **Document rejected alternatives**: The alternatives you did not choose and the reasons for rejection are as valuable as the decision itself. Future engineers will inevitably consider the same alternatives.

3. **Be explicit about trade-offs**: Every architectural decision involves trade-offs. Documenting the negative consequences builds trust and enables future reassessment when the trade-off balance shifts.

4. **Keep ADRs immutable**: Never modify an accepted ADR. If a decision is reversed, create a new ADR that supersedes the original, preserving the historical chain of reasoning.

5. **Link decisions to quality attributes**: Every decision should explicitly state which quality attributes it optimizes and which it trades off. This connects decisions to measurable system properties.

6. **Review decisions periodically**: Context changes. Technology evolves. Team capabilities shift. Architectural decisions should be reviewed at regular intervals to confirm they remain valid.

7. **Make decisions reversible when possible**: Prefer architectural choices that preserve optionality. The [Adapter Pattern](@/glossary/adapter-pattern.md) and dependency injection are examples of keeping decisions reversible by abstracting over them.

8. **Involve stakeholders early**: Architectural decisions affect multiple teams and roles. Include operations, security, and product perspectives in the decision process.

## Common Pitfalls

1. **Decision avoidance**: Deferring architectural decisions indefinitely under the guise of "we need more information." This often results in emergent architecture driven by accident rather than intention.

2. **Implicit architecture**: Making significant decisions without recognizing them as architectural. Choosing a database, a communication pattern, or a deployment model are all architectural decisions that deserve formal treatment.

3. **Sunk cost bias**: Refusing to revisit a decision because of the effort already invested. If context has changed materially, the original decision may no longer be optimal.

4. **Over-documentation**: Recording every minor implementation choice as a formal ADR, creating noise that obscures truly significant decisions. Reserve ADRs for decisions that are costly to reverse.

5. **Consensus seeking**: Trying to make every stakeholder happy rather than making the best trade-off for the system. Architectural decisions should optimize for the system's priority-ordered quality attributes, not for unanimity.

6. **Ignoring operational context**: Making decisions based solely on development-time concerns while neglecting operational implications (deployment complexity, monitoring requirements, failure modes).

7. **Technology-first thinking**: Selecting a technology and then fitting the problem to it, rather than starting from requirements and quality attributes. Decisions driven by technology hype rather than evidence are a common source of architectural debt.

## Use Cases

**Umbrella App Boundary Design**: When adding a new capability to the Prismatic Platform, the architectural decision of where to place it (new umbrella app vs. extension of existing app) is guided by [bounded context](@/glossary/bounded-context.md) analysis and dependency graph evaluation.

**Storage Backend Selection**: The decision to use ETS for development/testing, PostgreSQL for durable storage, Meilisearch for full-text search, and KuzuDB for graph queries was an architectural decision that leveraged the trait-based storage abstraction to avoid lock-in.

**Quality Gate Evolution**: The decision to enforce 100% test coverage, zero warnings, and zero stubs as non-bypassable quality gates (the NO MERCY doctrine) was a deliberate trade-off of short-term velocity for long-term platform integrity.

**Agent Communication Protocol**: Defining AIAD as the standard for agent specification and communication was an architectural decision that enables 1,090 agents to interoperate through a common protocol, supporting the platform's autonomous evolution capabilities.

**API Strategy**: Choosing auto-introspection over manual OpenAPI specification maintenance was a decision that traded initial complexity for permanent consistency, ensuring the API documentation never drifts from the implementation.

## Related Concepts

- [Architectural Pattern](@/glossary/architectural-pattern.md) -- reusable solutions that architectural decisions select between
- [Software Architecture](@/glossary/software-architecture.md) -- the overarching discipline within which decisions are made
- [Domain-Driven Design](@/glossary/domain-driven-design.md) -- methodology that informs bounded context decisions
- [Architectural Thinking](@/glossary/architectural-thinking.md) -- the cognitive skill of reasoning about architectural trade-offs
- [Architectural Insights](@/glossary/architectural-insights.md) -- deep understanding gained from studying past decisions
- [Bounded Context](@/glossary/bounded-context.md) -- DDD concept that directly shapes decomposition decisions
- [System Design Principle](@/glossary/system-design-principle.md) -- guiding principles that constrain the decision space
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- pattern enabling reversible technology decisions

## See Also

- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) -- Michael Nygard's foundational article on ADRs
- [ADR GitHub Organization](https://adr.github.io/) -- tooling and templates for managing ADRs
- [ISO 42010](https://www.iso.org/standard/50508.html) -- international standard for architecture description
- [Architecture Decision Records in Action](https://www.thoughtworks.com/radar/techniques/lightweight-architecture-decision-records) -- ThoughtWorks Technology Radar entry

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
