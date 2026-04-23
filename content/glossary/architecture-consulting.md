+++
title = "Architecture Consulting"
weight = 50
[extra]
description = "Professional practice of advising organizations on software system design, technology selection, architectural evolution, and engineering strategy to achieve optimal technical outcomes"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "expert"
domain_category = "software-engineering"
related_concepts = ["enterprise-architecture", "software-architecture", "domain-driven-design", "bounded-context", "quality-gates"]
implementation_status = "production"
authority_level = "platform-demonstrated"
difficulty_rating = 7
prerequisites = ["software-architecture", "domain-driven-design", "distributed-system"]
learning_path = "architecture"
interactive_demos = ["/labs/glossary/architecture-consulting"]
code_examples = ["elixir", "architecture-decision-record"]
external_resources = ["https://www.iasa-global.org/", "https://www.sei.cmu.edu/our-work/software-architecture/"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["architecture-review-checklist", "quality-assessment-validation", "decision-record-completeness"]
keywords = ["architecture consulting", "technical advisory", "system design", "technology selection", "architectural review", "platform engineering"]
tags = ["glossary", "architecture", "consulting", "engineering-practice", "strategic"]
related_terms = ["domain-driven-design", "bounded-context", "quality-gates", "supervision-tree", "adapter-pattern", "distributed-system", "aiad", "clean-run"]
word_count = 1999
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Architecture Consulting - Prismatic Platform"
+++

## Definition

Architecture consulting is the professional practice of advising organizations on the design, evaluation, evolution, and governance of software systems and their supporting infrastructure. An architecture consultant operates at the intersection of business strategy and technical implementation, translating organizational goals into concrete architectural decisions that shape system structure, technology selection, team organization, integration patterns, and operational characteristics. The discipline encompasses assessment of existing architectures, design of new systems, migration planning, technology evaluation, risk analysis, and the establishment of architectural standards that enable sustainable engineering practices.

Unlike general software development consulting, architecture consulting focuses specifically on the structural and strategic dimensions of systems: how components are decomposed, how they communicate, how data flows between them, what quality attributes they must satisfy (performance, scalability, reliability, security), and how the architecture accommodates future change. Architecture consultants work with constraints including organizational capabilities, budget, timelines, regulatory requirements, existing technical debt, and the cognitive load placed on development teams.

## Overview

The architecture consulting profession has evolved significantly over the past two decades. In the early 2000s, enterprise architecture frameworks like TOGAF, Zachman, and the Federal Enterprise Architecture Framework dominated the field, emphasizing comprehensive documentation and top-down governance. The rise of agile methodologies, cloud computing, microservices, and DevOps practices shifted the emphasis toward evolutionary architecture, just-in-time decision-making, and the recognition that architecture emerges from the collective decisions of development teams rather than from ivory-tower architects.

Modern architecture consulting operates across several dimensions:

| Dimension | Focus Area | Deliverables |
|-----------|-----------|--------------|
| **Strategic** | Technology roadmaps, build-vs-buy decisions, platform strategy | Technology radar, investment recommendations, capability maps |
| **Structural** | System decomposition, service boundaries, data architecture | Architecture diagrams, API contracts, data flow models |
| **Operational** | Deployment topology, observability, disaster recovery | Infrastructure designs, runbooks, SLA definitions |
| **Governance** | Standards enforcement, decision tracking, quality gates | Architecture Decision Records, fitness functions, review checklists |
| **Organizational** | Team topology, cognitive load assessment, Conway's Law alignment | Team structure recommendations, communication flow analysis |

### Engagement Models

Architecture consulting engagements typically follow one of several models, each suited to different organizational needs:

**Assessment engagements** evaluate existing systems against defined quality attributes. The consultant performs systematic analysis of codebases, infrastructure, operational data, and team practices to produce a comprehensive report with prioritized recommendations. Assessment engagements are common before major migrations, acquisitions, or when organizations experience persistent quality issues.

**Design engagements** create new architectural blueprints for greenfield systems or major system redesigns. These involve requirements analysis, technology evaluation, prototype development, and the production of detailed architectural specifications that guide implementation teams.

**Embedded advisory** places the consultant within the development organization for an extended period, providing ongoing guidance on architectural decisions as they arise. This model is particularly effective for organizations undergoing significant architectural transformation, as it provides continuous course correction.

**Review and governance** engagements establish and operate architectural review processes, including Architecture Decision Record (ADR) workflows, fitness function definition, and periodic architecture health assessments.

## Technical Details

### Architecture Decision Records

A cornerstone of architecture consulting is the systematic capture of architectural decisions. Architecture Decision Records (ADRs) document the context, considered options, decision rationale, and consequences of significant architectural choices. In Elixir/OTP systems, architectural decisions frequently involve process topology, supervision strategies, data ownership, and communication patterns.

```elixir
defmodule PrismaticArchitecture.DecisionRecord do
  @moduledoc """
  Structured representation of Architecture Decision Records (ADRs).

  ADRs capture the context, decision, and consequences of significant
  architectural choices. They serve as a persistent knowledge base for
  architectural consulting engagements and internal governance.
  """

  @type status :: :proposed | :accepted | :deprecated | :superseded
  @type impact_level :: :low | :medium | :high | :critical

  @type t :: %__MODULE__{
    id: String.t(),
    title: String.t(),
    status: status(),
    context: String.t(),
    decision: String.t(),
    consequences: [String.t()],
    alternatives_considered: [%{name: String.t(), pros: [String.t()], cons: [String.t()]}],
    impact_level: impact_level(),
    quality_attributes: [atom()],
    date: Date.t(),
    reviewers: [String.t()]
  }

  defstruct [
    :id, :title, :status, :context, :decision,
    :consequences, :alternatives_considered, :impact_level,
    :quality_attributes, :date, :reviewers
  ]

  @spec evaluate_fitness(t(), map()) :: {:ok, float()} | {:error, String.t()}
  def evaluate_fitness(%__MODULE__{} = adr, current_metrics) do
    quality_scores =
      adr.quality_attributes
      |> Enum.map(fn attr -> Map.get(current_metrics, attr, 0.0) end)

    case quality_scores do
      [] -> {:error, "No quality attributes defined for ADR #{adr.id}"}
      scores -> {:ok, Enum.sum(scores) / length(scores)}
    end
  end

  @spec supersede(t(), t()) :: {:ok, {t(), t()}} | {:error, String.t()}
  def supersede(%__MODULE__{status: :accepted} = old, %__MODULE__{} = new) do
    {:ok, {
      %{old | status: :superseded},
      %{new | status: :accepted}
    }}
  end

  def supersede(%__MODULE__{status: status}, _new) do
    {:error, "Cannot supersede ADR with status #{status}"}
  end
end
```

### Architecture Quality Assessment

Architecture consulting relies on measurable quality attributes -- often called architecture fitness functions -- to evaluate whether a system's architecture satisfies its intended goals. These fitness functions are automated checks that continuously validate architectural properties.

| Quality Attribute | Measurement Method | Prismatic Implementation |
|-------------------|-------------------|--------------------------|
| **Modularity** | Coupling/cohesion metrics, dependency graph analysis | Umbrella app boundaries, 115 isolated apps |
| **Reliability** | MTBF, error rate, supervision tree depth | OTP supervisors, circuit breakers, fault isolation |
| **Performance** | Response time percentiles, throughput | Sub-250ms page loads, O(1) pattern detection |
| **Scalability** | Load test results, resource utilization curves | BEAM concurrency, horizontal scaling via Horde |
| **Security** | Vulnerability count, attack surface area | 6-team color operations, Trinity Gate, 13-layer security |
| **Testability** | Coverage metrics, test execution time | 100% coverage mandate, property-based testing |
| **Deployability** | Deployment frequency, rollback rate | GitLab CI/CD, Fly.io blue-green deployments |
| **Maintainability** | Code complexity, documentation coverage | Zero warnings, Credo strict, Dialyzer clean |

### Technology Evaluation Framework

Architecture consultants employ structured evaluation frameworks when recommending technology choices. The evaluation considers technical fitness, organizational fit, ecosystem maturity, and total cost of ownership.

```elixir
defmodule PrismaticArchitecture.TechnologyEvaluation do
  @moduledoc """
  Framework for structured technology evaluation during
  architecture consulting engagements.
  """

  @type criterion :: %{
    name: String.t(),
    weight: float(),
    score: float(),
    evidence: String.t()
  }

  @type evaluation :: %{
    technology: String.t(),
    criteria: [criterion()],
    total_score: float(),
    recommendation: :adopt | :trial | :assess | :hold
  }

  @spec score_technology(String.t(), [criterion()]) :: evaluation()
  def score_technology(technology, criteria) do
    total_weight = Enum.reduce(criteria, 0.0, fn c, acc -> acc + c.weight end)

    weighted_score =
      criteria
      |> Enum.reduce(0.0, fn c, acc -> acc + c.weight * c.score end)
      |> Kernel./(max(total_weight, 1.0))

    recommendation =
      cond do
        weighted_score >= 0.85 -> :adopt
        weighted_score >= 0.70 -> :trial
        weighted_score >= 0.50 -> :assess
        true -> :hold
      end

    %{
      technology: technology,
      criteria: criteria,
      total_score: weighted_score,
      recommendation: recommendation
    }
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform itself serves as a reference architecture that demonstrates architecture consulting principles in practice. With 115 umbrella applications, 530+ AIAD agents, and a 100/100 quality score, the platform embodies the architectural standards that architecture consultants recommend but rarely see fully implemented.

### Architectural Principles Demonstrated

**Separation of concerns through umbrella applications**: Each of the 115 apps in the Prismatic umbrella has a clearly defined bounded context. Storage concerns are isolated in `prismatic_storage_*` adapters, web presentation lives in `prismatic_web`, agent runtime executes in `prismatic_agents`, and security operations operate in `prismatic_perimeter`. This decomposition follows the architecture consulting principle of minimizing coupling while maximizing cohesion.

**Supervision tree as architecture documentation**: In Prismatic, the OTP supervision tree IS the architecture diagram. `PrismaticSupervisor` provides dependency-aware startup, domain supervisors, and health monitoring. Every process has a documented place in the supervision hierarchy, making the runtime architecture explicit and inspectable.

**Quality gates as fitness functions**: The platform's pre-commit hooks, `mix quality.gates`, Dialyzer, and Credo enforcement serve as automated architecture fitness functions. They continuously validate that the codebase maintains its architectural properties -- zero warnings, complete type coverage, no forbidden patterns, and full test coverage.

**AIAD as governance framework**: The `.aiad/` directory contains 530+ agent specifications, 225 command definitions, policies, and doctrines. This is effectively an architecture governance framework expressed as executable specifications rather than static documents.

### Architecture Review Process

Prismatic implements a multi-gate architecture review process that architecture consultants would recognize as best practice:

| Gate | Timing | Checks | Enforcement |
|------|--------|--------|-------------|
| **Pre-commit** | Before every commit | 11 phases including compilation, Credo, forbidden patterns | Blocking |
| **Quality gates** | On demand / CI | Dialyzer, typespec coverage, test coverage, performance | Blocking |
| **Trinity Gate** | Before critical decisions | Structural, logical, and formal consistency | Mandatory |
| **Color Team review** | Continuous | Red team attacks, Blue team defense, Purple synthesis | Advisory |

## Comparison with Alternatives

| Approach | Strengths | Weaknesses | When to Use |
|----------|-----------|------------|-------------|
| **Architecture Consulting** | Expert guidance, fresh perspective, cross-industry knowledge | Cost, temporary engagement, knowledge transfer challenge | Major transitions, pre-acquisition, persistent quality issues |
| **Internal Architecture Team** | Deep domain knowledge, continuous presence, organizational trust | May lack breadth, groupthink risk, career path challenges | Sustained architecture governance, ongoing decision-making |
| **Platform Engineering** | Self-service infrastructure, golden paths, automated governance | May over-standardize, limited to infrastructure concerns | Scaling engineering practices, reducing cognitive load |
| **Architecture Frameworks (TOGAF)** | Comprehensive methodology, industry standard, training available | Heavyweight, documentation-heavy, slow adaptation | Large enterprises, regulated industries, compliance requirements |
| **Evolutionary Architecture** | Incremental, adaptive, aligned with agile | Requires discipline, may lack strategic vision, local optimization risk | Rapidly changing requirements, uncertain domains |

### Architecture Consulting Anti-Patterns

| Anti-Pattern | Description | Consequence |
|-------------|-------------|-------------|
| **Ivory Tower Architecture** | Architects design without understanding implementation realities | Designs that cannot be built or maintained |
| **Resume-Driven Architecture** | Technology choices driven by personal interest rather than fitness | Inappropriate technology stack, team frustration |
| **Big Design Up Front** | Attempting to decide everything before implementation | Analysis paralysis, obsolete designs, wasted effort |
| **Consulting Theater** | Producing impressive documentation without actionable guidance | Shelf-ware, no actual improvement |
| **Pattern Worship** | Applying design patterns without understanding the problem | Over-engineering, unnecessary complexity |

## Best Practices

1. **Start with assessment, not prescription**: Understand the current state thoroughly before recommending changes. Prismatic's `mix autoheal.baseline` captures system state before any intervention.

2. **Make decisions reversible where possible**: Prefer architectural choices that can be reversed without catastrophic cost. Prismatic's adapter pattern (`prismatic_storage_core` traits) allows swapping storage backends without changing business logic.

3. **Document decisions, not just designs**: Architecture Decision Records (ADRs) capture the "why" behind choices, enabling future architects to understand context. The `.aiad/` framework serves this purpose in Prismatic.

4. **Automate fitness functions**: Manual architecture reviews do not scale. Convert architectural rules into automated checks -- Prismatic's pre-commit hooks, quality gates, and Credo rules enforce architectural standards on every commit.

5. **Align team boundaries with architectural boundaries**: Conway's Law dictates that system structure mirrors organizational structure. Architecture consulting must address both simultaneously.

6. **Prefer simplicity over cleverness**: The best architecture is the simplest one that satisfies all quality attributes. Prismatic's meta-rule -- "If the same solution could be written identically in Node.js, it is WRONG" -- pushes toward leveraging platform strengths rather than adding unnecessary abstraction.

7. **Measure and iterate**: Architecture consulting engagements should define measurable success criteria and track progress. Prismatic's Quality DNA system tracks architectural health across sessions.

8. **Transfer knowledge aggressively**: The consulting engagement ends, but the organization must sustain the architecture. Documentation, training, and embedded knowledge transfer are essential.

## Common Pitfalls

**Ignoring organizational constraints**: The technically optimal architecture may be impossible for the organization to implement given its team structure, skill set, or timeline. Effective architecture consulting balances technical purity with organizational reality.

**Over-documenting at the expense of code**: Architecture documentation that is not enforced by code drifts from reality. Prismatic addresses this by encoding architectural rules in pre-commit hooks and quality gates rather than relying solely on written guidelines.

**Failing to address technical debt**: Architecture consulting that focuses only on new design without addressing existing technical debt leaves the organization with two systems to maintain. Prismatic's QDP (Quality Debt Points) system and mandatory debt elimination protocol ensure debt is addressed continuously.

**Neglecting operational architecture**: Beautiful designs that are impossible to deploy, monitor, or debug in production represent a failure of architecture consulting. The operational dimension -- deployment topology, observability, incident response -- must receive equal attention.

**Scope creep in recommendations**: Architecture consultants who recommend rewriting everything are rarely helpful. Incremental, prioritized improvements that deliver value at each step are more effective and more likely to be adopted.

**Technology bias**: Consultants may favor technologies they know best rather than technologies best suited to the problem. The structured technology evaluation framework described above mitigates this bias.

## Use Cases

**Pre-acquisition technical due diligence**: Before acquiring a software company, the acquirer engages architecture consultants to evaluate the target's codebase, infrastructure, scalability characteristics, and technical debt. This assessment directly influences valuation and integration planning.

**Cloud migration planning**: Organizations moving from on-premises to cloud infrastructure need architectural guidance on service decomposition, data migration strategy, networking topology, and the transition from monolithic to distributed systems.

**Platform modernization**: Legacy systems built on outdated technology stacks require careful architectural planning to modernize without disrupting business operations. Architecture consultants design migration paths that deliver incremental value.

**Regulatory compliance architecture**: Industries subject to regulations like NIS2, GDPR, or SOC 2 need architectural designs that embed compliance into the system's structure rather than bolting it on as an afterthought. Prismatic Perimeter demonstrates this for security compliance.

**Performance crisis resolution**: When systems experience persistent performance problems that cannot be solved by tactical optimization, architecture consulting identifies structural causes and designs systemic solutions.

**Team scaling architecture**: As engineering organizations grow, architectural decisions must accommodate increased coordination overhead, cognitive load, and deployment complexity. Architecture consulting helps design both the system and the team structure to scale effectively.

## Related Concepts

- [Domain-Driven Design](@/glossary/domain-driven-design.md) -- Strategic design methodology that architecture consulting frequently employs for service decomposition and bounded context identification
- [Bounded Context](@/glossary/bounded-context.md) -- Fundamental DDD concept used in architecture consulting to define service boundaries and team ownership
- [Quality Gates](@/glossary/quality-gates.md) -- Automated enforcement mechanisms that operationalize architectural decisions into verifiable checks
- [Supervision Tree](@/glossary/supervision-tree.md) -- OTP pattern that serves as living architecture documentation in Erlang/Elixir systems
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- Design pattern enabling technology-agnostic architecture through interface abstraction
- [Distributed System](@/glossary/distributed-system.md) -- System topology that architecture consulting must address for scalability and reliability
- [AIAD](@/glossary/aiad.md) -- Prismatic's agent-based governance framework that functions as executable architecture documentation
- [Clean Run](@/glossary/clean-run.md) -- Zero-warning compilation standard that serves as an architectural fitness function
- [EASM](@/glossary/easm.md) -- External attack surface management, a domain where architecture consulting informs security posture design
- [Compliance Framework](@/glossary/compliance-framework.md) -- Regulatory standards that architecture consulting must integrate into system design

## See Also

- [Architecture section](@/architecture/_index.md) -- Detailed documentation of Prismatic Platform's architectural decisions and patterns
- [AIAD Standard](/.aiad/README.md) -- The agent-based governance framework that operationalizes architectural standards
- [Quality Gates documentation](@/glossary/quality-gates.md) -- How Prismatic enforces architectural fitness functions
- ISO/IEC 42010:2022 -- International standard for architecture description of systems and software
- SEI Architecture Tradeoff Analysis Method (ATAM) -- Carnegie Mellon's systematic architecture evaluation methodology
- ThoughtWorks Technology Radar -- Quarterly publication tracking technology adoption recommendations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
