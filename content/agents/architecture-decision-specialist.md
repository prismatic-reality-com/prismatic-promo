+++
title = "architecture-decision-specialist"
weight = 39
[extra]
domain = "primary-producer"
level = "L2"
description = "Expert in ADR management and architectural decision documentation"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "no-mercy", "liveview"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["architecture-decision-specialist", "Expert", "agents", "agent", "Prismatic Platform", "ADRs", "Decision", "Architecture Decision"]
tags = ["agents", "agent", "architecture-decision-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "architecture-decision-specialist - Prismatic Platform"
+++

## Overview

The Architecture Decision Specialist operates as an L2 tactical operations agent within the Primary Producer domain of the Prismatic Platform. This agent manages the lifecycle of Architecture Decision Records (ADRs), ensuring that every significant architectural choice is documented with context, alternatives considered, decision rationale, and expected consequences. In a platform with 90 [umbrella application](/glossary/umbrella-application/)s and 400+ agents, undocumented architectural decisions become invisible constraints that trap future developers.

Architectural decisions in the Prismatic ecosystem range from framework-level choices like the selection of [OTP](/glossary/otp/) supervision strategies to tactical decisions about storage [adapter pattern](/glossary/adapter-pattern/)s and inter-application communication protocols. The Architecture Decision Specialist ensures each decision follows a structured template that captures the problem statement, constraints, evaluated alternatives with pros and cons, the chosen approach, and measurable success criteria. This creates a searchable knowledge base that explains not just what was decided, but why.

## Operational Domain

The Primary Producer domain focuses on core platform creation and foundational decision-making. The Architecture Decision Specialist sits at the intersection of architecture and documentation, ensuring that the reasoning behind structural choices is preserved for future reference. This agent collaborates with architects during decision-making and with developers during implementation to maintain alignment between documented decisions and actual code.

## ADR Lifecycle Management

Every Architecture Decision Record progresses through a defined lifecycle with explicit state transitions and quality gates at each stage.

| ADR State | Description | Required Actions | Transition Criteria |
|---|---|---|---|
| Proposed | Initial submission with problem statement | Define context, constraints, and alternatives | Minimum 2 alternatives documented |
| Under Review | Active review by stakeholders | Collect feedback, refine alternatives | Review period complete (minimum 48 hours) |
| Accepted | Decision approved and rationale documented | Finalize rationale, define success criteria | Consensus or authority approval |
| Implemented | Code changes reflecting the decision deployed | Link to implementation commits and tests | Code reviewed and merged |
| Superseded | Replaced by a newer decision | Link to superseding ADR with explanation | New ADR accepted |
| Deprecated | No longer applicable | Document deprecation rationale | Context no longer relevant |

The agent enforces strict lifecycle discipline. No ADR can skip states. Every state transition is recorded with timestamps, the identity of the decision-maker, and a brief justification for the transition.

## ADR Template Structure

```elixir
defmodule PrismaticAgents.ADR do
  @moduledoc """
  Architecture Decision Record structure enforced by the
  Architecture Decision Specialist.
  """

  @enforce_keys [:id, :title, :status, :context, :decision, :consequences]
  defstruct [
    :id,
    :title,
    :status,
    :context,
    :decision,
    :consequences,
    alternatives: [],
    success_criteria: [],
    related_adrs: [],
    implementation_links: [],
    review_date: nil,
    created_at: nil,
    updated_at: nil
  ]

  @type t :: %__MODULE__{
    id: String.t(),
    title: String.t(),
    status: :proposed | :under_review | :accepted | :implemented | :superseded | :deprecated,
    context: String.t(),
    decision: String.t(),
    consequences: [String.t()],
    alternatives: [alternative()],
    success_criteria: [String.t()],
    related_adrs: [String.t()],
    implementation_links: [String.t()],
    review_date: Date.t() | nil,
    created_at: DateTime.t() | nil,
    updated_at: DateTime.t() | nil
  }

  @type alternative :: %{
    name: String.t(),
    description: String.t(),
    pros: [String.t()],
    cons: [String.t()],
    rejection_reason: String.t() | nil
  }
end
```

## Key Capabilities

- **ADR lifecycle management** from proposal through review, approval, implementation tracking, and eventual supersession, with full version history and status tracking for each decision record
- **Decision impact analysis** that evaluates proposed architectural changes against existing ADRs, identifying conflicts, superseded decisions, and downstream implications across the umbrella project
- **Alternative documentation** requiring structured capture of all considered approaches with explicit pros, cons, and rejection rationale, preventing revisitation of previously evaluated options
- **Decision compliance monitoring** that tracks whether implemented code aligns with approved ADRs, flagging deviations that may indicate either implementation drift or undocumented decision changes
- **Cross-reference maintenance** linking ADRs to related code files, test suites, and other ADRs to create a navigable decision [knowledge graph](/glossary/knowledge-graph/)
- **Temporal analysis** tracking decision effectiveness over time by evaluating success criteria against measurable outcomes at scheduled review dates

## Decision Impact Analysis

When a new architectural decision is proposed, the specialist performs automated impact analysis against the existing ADR corpus. This prevents conflicting decisions and ensures new proposals acknowledge their relationship to prior choices.

```elixir
defmodule PrismaticAgents.ADR.ImpactAnalyzer do
  @spec analyze_impact(ADR.t(), [ADR.t()]) :: {:ok, impact_report()} | {:error, term()}
  def analyze_impact(proposed_adr, existing_adrs) do
    conflicts = find_conflicting_decisions(proposed_adr, existing_adrs)
    supersessions = find_superseded_decisions(proposed_adr, existing_adrs)
    dependencies = find_dependent_decisions(proposed_adr, existing_adrs)

    case conflicts do
      [] ->
        {:ok, %{
          conflicts: [],
          supersessions: supersessions,
          dependencies: dependencies,
          recommendation: :proceed_with_review
        }}

      conflicts ->
        {:ok, %{
          conflicts: conflicts,
          supersessions: supersessions,
          dependencies: dependencies,
          recommendation: :resolve_conflicts_first
        }}
    end
  end
end
```

## Decision Compliance Monitoring

The specialist continuously monitors the codebase for deviations from accepted ADRs. This is implemented through a combination of static analysis rules and periodic audits that compare implementation patterns against documented decisions.

| Compliance Check | Method | Frequency | Violation Response |
|---|---|---|---|
| Pattern adherence | AST analysis against ADR patterns | Per commit | Warning + ADR reference |
| Dependency alignment | Dependency graph vs ADR constraints | Per build | Block if ADR violation |
| Naming convention | Module naming vs ADR naming rules | Per commit | Credo check failure |
| Communication protocol | Inter-app messaging vs ADR contracts | Weekly audit | Report to architect |

## Authority Level

**L2** - Tactical Operations. Domain-specific [tactical execution](/glossary/tactical-execution/) with cross-domain coordination capabilities. The Architecture Decision Specialist can propose and document decisions across all domains but requires L3 authority approval for decisions that affect platform-wide architecture.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [adr-specialist](/agents/adr-specialist/) | ADR Partner | Collaborates on ADR governance and record management standards |
| [architecture-review-specialist](/agents/architecture-review-specialist/) | Review Authority | Validates architectural decisions against platform structural requirements |
| [code-review-specialist-agent-v20](/agents/code-review-specialist-agent-v20/) | Implementation Checker | Verifies that code changes align with documented architectural decisions |
| [system-architecture-specialist](/agents/system-architecture-specialist/) | Architecture Context | Provides system-wide architectural context for decision evaluation |

## Integration

| Component | Relationship |
|---|---|
| [Quality Gates](/glossary/quality-gates/) | ADR compliance checks integrated into quality pipeline |
| [GitLab CI](/glossary/gitlab-ci/)/CD | ADR validation in merge request pipelines |
| Platform [Telemetry](/glossary/telemetry/) | Decision effectiveness tracking through success criteria metrics |
| [Knowledge Graph](/glossary/knowledge-graph/) | ADR cross-reference network for decision navigation |

## Enforcement

All architectural decision processes are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. No significant architectural change may proceed without a documented ADR that has completed the review process. Decisions without explicit alternative analysis are rejected as incomplete. Every ADR must include measurable success criteria and a review date for evaluating the decision's effectiveness after implementation. The [NABLA](/glossary/nabla-infinity/) Contradiction Preservation axiom requires that rejected alternatives remain documented with their rejection rationale, preventing the platform from revisiting decisions without acknowledging prior analysis.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)