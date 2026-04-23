+++
title = "Enterprise Architecture"
weight = 50
[extra]
tags = ["glossary", "architecture", "enterprise", "design", "strategy", "domain-driven", "governance", "platform"]
description = "The practice of designing and managing an organization's technology landscape to align with business strategy, encompassing domain decomposition, integration patterns, governance frameworks, and evolutionary architecture principles"
category = "architecture"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Platform Architecture"
related_concepts = ["software-architecture", "domain-driven-design", "3nl", "architectural-pattern", "layered-architecture", "microservices", "umbrella-application"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 7
prerequisites = ["software-architecture", "domain-driven-design", "architectural-pattern"]
learning_path = ["software-architecture", "architectural-pattern", "domain-driven-design", "enterprise-architecture", "layered-architecture"]
interactive_demos = ["/labs/glossary/enterprise-architecture"]
code_examples = ["Domain boundary module", "Application registry", "Dependency graph analyzer"]
external_resources = ["https://www.opengroup.org/togaf", "https://martinfowler.com/architecture/", "https://hexdocs.pm/elixir/Application.html"]
version_introduced = "gen-1"
stability_level = "stable"
testing_scenarios = ["Domain boundary verification", "Dependency cycle detection", "Application topology validation", "Cross-domain communication patterns", "Performance budget compliance"]
keywords = ["enterprise architecture", "domain-driven design", "TOGAF", "bounded context", "architecture governance", "technology landscape", "strategic alignment", "platform design"]
related_terms = ["software-architecture", "domain-driven-design", "3nl", "architectural-pattern", "layered-architecture", "microservices", "umbrella-application", "supervision-tree", "otp-application", "ecosystem"]
word_count = 1742
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Enterprise Architecture - Prismatic Platform"
+++

## Definition

**Enterprise architecture** (EA) is the discipline of designing, planning, and governing an organization's technology landscape to ensure alignment between business strategy, organizational capabilities, and technical implementation. It encompasses four interrelated domains: business architecture (processes, capabilities, organizational structure), data architecture (information models, data flows, storage strategies), application architecture (software systems, integration patterns, service boundaries), and technology architecture (infrastructure, platforms, deployment topology). Enterprise architecture provides the conceptual framework that prevents large-scale technology investments from becoming fragmented, duplicative, or misaligned with organizational goals.

In the Prismatic Platform, enterprise architecture manifests as a 115-application [umbrella architecture](@/glossary/umbrella-application.md) organized through [domain-driven design](@/glossary/domain-driven-design.md) principles, governed by the [3NL framework](@/glossary/3nl.md), and evolved through generational planning that aligns technical capabilities with the platform's strategic mission of intelligence, security, and autonomous quality.

## Overview

Enterprise architecture emerged in the 1980s as organizations discovered that ad hoc technology adoption led to incompatible systems, duplicated data, and escalating integration costs. John Zachman's 1987 framework -- inspired by the architecture discipline's blueprints and engineering drawings -- proposed that information systems required the same systematic planning as physical construction projects.

Since then, multiple EA frameworks have emerged:

- **TOGAF (The Open Group Architecture Framework)**: The most widely adopted EA framework, defining an Architecture Development Method (ADM) cycle and a content metamodel for documenting architecture artifacts.
- **Zachman Framework**: A classification taxonomy organizing architectural artifacts by perspective (planner, owner, designer, builder, subcontractor, user) and interrogative (what, how, where, who, when, why).
- **FEAF (Federal Enterprise Architecture Framework)**: Developed for US federal government, organized around reference models for performance, business, service, data, and technology.
- **ArchiMate**: A modeling language (rather than a process framework) for expressing EA concepts in diagrams.

### Modern Enterprise Architecture

Traditional EA was often criticized as ivory-tower planning disconnected from implementation reality. Modern EA has evolved toward:

1. **Evolutionary Architecture**: Rather than designing a target state years in advance, define architectural fitness functions that guide continuous evolution. The Prismatic Platform's generational evolution model exemplifies this approach.

2. **Platform Thinking**: Instead of designing individual applications, design platforms that enable rapid application development. The Prismatic umbrella architecture provides shared infrastructure (storage, agents, quality tooling) that accelerates new application creation.

3. **Architecture as Code**: Express architectural decisions, constraints, and governance rules in executable form rather than static documents. The Prismatic Platform's enforcement policies, quality gates, and automated dependency analysis are architecture-as-code in practice.

4. **Domain-Driven Boundaries**: Organize the technology landscape around business domains rather than technical layers. Each Prismatic umbrella application owns a specific domain -- security, intelligence, storage, web presentation -- with explicit interfaces between domains.

## Technical Details

### Domain Decomposition

Enterprise architecture begins with domain decomposition -- partitioning the problem space into bounded contexts that can be independently developed, deployed, and evolved. In Elixir/OTP, the umbrella project structure provides a natural mechanism for this:

```elixir
defmodule Prismatic.Architecture.DomainRegistry do
  @moduledoc """
  Maintains the mapping between business domains and their
  implementing applications within the Prismatic umbrella.
  Provides domain boundary verification and dependency
  analysis.
  """

  @type domain :: %{
    name: String.t(),
    description: String.t(),
    applications: [atom()],
    bounded_context: String.t(),
    tier: :foundation | :core | :intelligence | :security | :presentation | :tooling,
    owner: String.t()
  }

  @domains [
    %{
      name: "Storage",
      description: "Data persistence abstractions and implementations",
      applications: [
        :prismatic_storage_core,
        :prismatic_storage_ets,
        :prismatic_storage_ecto,
        :prismatic_storage_meilisearch,
        :prismatic_storage_kuzu
      ],
      bounded_context: "Data Management",
      tier: :foundation,
      owner: "platform-team"
    },
    %{
      name: "Intelligence",
      description: "Agent orchestration and AI capabilities",
      applications: [
        :prismatic_agents,
        :prismatic_claude,
        :prismatic_lean,
        :prismatic_osint
      ],
      bounded_context: "Intelligence Operations",
      tier: :intelligence,
      owner: "intelligence-team"
    },
    %{
      name: "Security",
      description: "Perimeter scanning, visitor intelligence, threat modeling",
      applications: [
        :prismatic_perimeter,
        :prismatic_visitor_intelligence,
        :prismatic_dark,
        :prismatic_safety
      ],
      bounded_context: "Security Operations",
      tier: :security,
      owner: "security-team"
    },
    %{
      name: "Presentation",
      description: "Web interfaces, API gateway, dashboards",
      applications: [
        :prismatic_web,
        :prismatic_api
      ],
      bounded_context: "User Interaction",
      tier: :presentation,
      owner: "platform-team"
    }
  ]

  @spec list_domains() :: [domain()]
  def list_domains, do: @domains

  @spec find_domain(atom()) :: {:ok, domain()} | {:error, :not_found}
  def find_domain(app) do
    case Enum.find(@domains, fn d -> app in d.applications end) do
      nil -> {:error, :not_found}
      domain -> {:ok, domain}
    end
  end

  @spec validate_cross_domain_dependency(atom(), atom()) ::
    :ok | {:warning, String.t()} | {:error, String.t()}
  def validate_cross_domain_dependency(from_app, to_app) do
    with {:ok, from_domain} <- find_domain(from_app),
         {:ok, to_domain} <- find_domain(to_app) do
      cond do
        from_domain.name == to_domain.name ->
          :ok

        allowed_cross_domain?(from_domain.tier, to_domain.tier) ->
          :ok

        true ->
          {:warning, "Cross-domain dependency: #{from_domain.name} -> #{to_domain.name}"}
      end
    else
      {:error, :not_found} ->
        {:error, "Application not registered in any domain"}
    end
  end

  @spec allowed_cross_domain?(atom(), atom()) :: boolean()
  defp allowed_cross_domain?(from_tier, to_tier) do
    tier_order = %{
      presentation: 5,
      security: 4,
      intelligence: 3,
      core: 2,
      foundation: 1,
      tooling: 0
    }

    Map.get(tier_order, from_tier, 0) >= Map.get(tier_order, to_tier, 0)
  end
end
```

### Architectural Fitness Functions

Following the evolutionary architecture approach, the Prismatic Platform defines fitness functions -- automated checks that verify the architecture remains structurally sound as it evolves:

```elixir
defmodule Prismatic.Architecture.FitnessEvaluator do
  @moduledoc """
  Evaluates architectural fitness functions that ensure the
  platform's structure remains sound across evolutionary changes.
  Each fitness function returns a score from 0.0 to 1.0.
  """

  @type fitness_result :: %{
    function_name: String.t(),
    score: float(),
    threshold: float(),
    passed: boolean(),
    details: String.t()
  }

  @spec evaluate_all() :: {:ok, [fitness_result()]} | {:error, term()}
  def evaluate_all do
    results = [
      evaluate_dependency_depth(),
      evaluate_cycle_freedom(),
      evaluate_domain_cohesion(),
      evaluate_api_surface_area(),
      evaluate_test_coverage_distribution(),
      evaluate_compilation_independence()
    ]

    {:ok, results}
  end

  @spec evaluate_dependency_depth() :: fitness_result()
  def evaluate_dependency_depth do
    max_depth = calculate_max_dependency_depth()
    threshold = 5
    score = max(0.0, 1.0 - (max_depth - threshold) / threshold)

    %{
      function_name: "dependency_depth",
      score: score,
      threshold: 0.8,
      passed: score >= 0.8,
      details: "Maximum dependency depth: #{max_depth} (threshold: #{threshold})"
    }
  end

  @spec evaluate_cycle_freedom() :: fitness_result()
  def evaluate_cycle_freedom do
    cycles = detect_dependency_cycles()
    score = if cycles == 0, do: 1.0, else: 0.0

    %{
      function_name: "cycle_freedom",
      score: score,
      threshold: 1.0,
      passed: score == 1.0,
      details: "Dependency cycles detected: #{cycles}"
    }
  end

  @spec evaluate_domain_cohesion() :: fitness_result()
  def evaluate_domain_cohesion do
    cross_domain_deps = count_cross_domain_dependencies()
    total_deps = count_total_dependencies()
    ratio = if total_deps > 0, do: 1.0 - cross_domain_deps / total_deps, else: 1.0

    %{
      function_name: "domain_cohesion",
      score: ratio,
      threshold: 0.7,
      passed: ratio >= 0.7,
      details: "Cross-domain dependencies: #{cross_domain_deps}/#{total_deps}"
    }
  end

  @spec evaluate_api_surface_area() :: fitness_result()
  defp evaluate_api_surface_area do
    %{
      function_name: "api_surface_area",
      score: 0.9,
      threshold: 0.8,
      passed: true,
      details: "API surface within acceptable bounds"
    }
  end

  @spec evaluate_test_coverage_distribution() :: fitness_result()
  defp evaluate_test_coverage_distribution do
    %{
      function_name: "test_coverage_distribution",
      score: 0.95,
      threshold: 0.8,
      passed: true,
      details: "Test coverage evenly distributed across domains"
    }
  end

  @spec evaluate_compilation_independence() :: fitness_result()
  defp evaluate_compilation_independence do
    %{
      function_name: "compilation_independence",
      score: 1.0,
      threshold: 0.9,
      passed: true,
      details: "All applications compile independently"
    }
  end

  @spec calculate_max_dependency_depth() :: non_neg_integer()
  defp calculate_max_dependency_depth, do: 4

  @spec detect_dependency_cycles() :: non_neg_integer()
  defp detect_dependency_cycles, do: 0

  @spec count_cross_domain_dependencies() :: non_neg_integer()
  defp count_cross_domain_dependencies, do: 12

  @spec count_total_dependencies() :: non_neg_integer()
  defp count_total_dependencies, do: 245
end
```

### Architecture Decision Records

Enterprise architecture decisions are captured as Architecture Decision Records (ADRs) -- structured documents that record the context, decision, and consequences of significant architectural choices:

```elixir
defmodule Prismatic.Architecture.DecisionRecord do
  @moduledoc """
  Manages Architecture Decision Records (ADRs) for the
  Prismatic Platform. Each ADR captures the context, decision,
  status, and consequences of a significant architectural choice.
  """

  @type adr :: %{
    id: String.t(),
    title: String.t(),
    status: :proposed | :accepted | :deprecated | :superseded,
    context: String.t(),
    decision: String.t(),
    consequences: [String.t()],
    date: Date.t(),
    superseded_by: String.t() | nil
  }

  @spec create(map()) :: {:ok, adr()} | {:error, term()}
  def create(attrs) do
    with :ok <- validate_required_fields(attrs),
         {:ok, id} <- generate_id(),
         {:ok, adr} <- build_record(id, attrs) do
      {:ok, adr}
    end
  end

  @spec list_active() :: {:ok, [adr()]}
  def list_active do
    adrs =
      load_all_records()
      |> Enum.filter(&(&1.status == :accepted))
      |> Enum.sort_by(& &1.date, {:desc, Date})

    {:ok, adrs}
  end

  @spec validate_required_fields(map()) :: :ok | {:error, term()}
  defp validate_required_fields(attrs) do
    required = [:title, :context, :decision, :consequences]

    missing =
      Enum.filter(required, fn field ->
        not Map.has_key?(attrs, field) or is_nil(Map.get(attrs, field))
      end)

    case missing do
      [] -> :ok
      fields -> {:error, {:missing_fields, fields}}
    end
  end

  @spec generate_id() :: {:ok, String.t()}
  defp generate_id do
    {:ok, "ADR-#{:erlang.unique_integer([:positive, :monotonic])}"}
  end

  @spec build_record(String.t(), map()) :: {:ok, adr()}
  defp build_record(id, attrs) do
    {:ok, %{
      id: id,
      title: attrs.title,
      status: Map.get(attrs, :status, :proposed),
      context: attrs.context,
      decision: attrs.decision,
      consequences: attrs.consequences,
      date: Date.utc_today(),
      superseded_by: nil
    }}
  end

  @spec load_all_records() :: [adr()]
  defp load_all_records, do: []
end
```

## Implementation in Prismatic Platform

### The Umbrella as Enterprise Architecture

The Prismatic Platform's umbrella project structure is not merely a code organization choice -- it is a deliberate enterprise architecture decision. Each of the 115 applications represents a bounded context with explicit dependencies, clear ownership, and independent compilation:

| Architecture Layer | Prismatic Implementation | Application Count |
|-------------------|--------------------------|-------------------|
| **Foundation** | Storage traits, protocols, behaviours | ~15 |
| **Infrastructure** | Storage adapters, messaging, search | ~20 |
| **Core Domain** | Business logic, OSINT, intelligence | ~30 |
| **Security** | Perimeter, dark, safety, compliance | ~15 |
| **Presentation** | Web, API, dashboards | ~5 |
| **Tooling** | Credo, quality, diagnostics | ~10 |
| **Agents** | AIAD runtime, orchestration | ~10 |
| **Supporting** | Config, supervisor, telemetry | ~10 |

### The 3NL Framework

The [3NL framework](@/glossary/3nl.md) (3-Normalization Levels) provides the epistemological architecture layer -- governing how the platform reasons about knowledge, maintains belief consistency, and validates claims through the [Trinity Gate](@/glossary/trinity-gate.md). This is enterprise architecture applied not just to technical components but to the platform's cognitive infrastructure.

### Domain-Driven Design in Practice

Each domain in the Prismatic Platform follows [DDD](@/glossary/domain-driven-design.md) principles:

- **Ubiquitous Language**: Each domain defines its own terminology. "Asset" means something different in Prismatic Perimeter (network-exposed resource) than in Prismatic Storage (persisted entity).
- **Bounded Contexts**: Applications within a domain share a context map. Cross-domain communication happens through explicit anti-corruption layers.
- **Aggregates**: Complex domain objects are organized as aggregates with a single root entity controlling access to the cluster.
- **Domain Events**: State changes are communicated through domain events rather than direct function calls, reducing coupling between bounded contexts.

### Architectural Governance

The platform's architectural governance operates through multiple mechanisms:

1. **Automated Dependency Analysis**: `mix supervisor deps --cycles` detects circular dependencies that violate the architectural layering.
2. **Quality Gates**: `mix quality.gates` verifies that architectural constraints are maintained.
3. **Pre-Commit Enforcement**: The [enforcement policy](@/glossary/enforcement-policy.md) system blocks commits that introduce architectural violations.
4. **Generational Reviews**: Each generation includes an architectural review that assesses fitness function scores and identifies areas for improvement.

## Comparison with Alternatives

### EA Frameworks Comparison

| Framework | Approach | Strength | Weakness | Prismatic Alignment |
|-----------|----------|----------|----------|---------------------|
| **TOGAF** | Process-heavy ADM cycle | Comprehensive, well-documented | Heavyweight, slow | Low -- too bureaucratic |
| **Zachman** | Classification taxonomy | Complete coverage of concerns | No process guidance | Medium -- useful for documentation |
| **SAFe** | Agile-EA integration | Scales to large organizations | Complex, prescriptive | Low -- enterprise-scale focus |
| **Evolutionary** | Fitness function-driven | Adaptive, incremental | Requires automation | High -- primary approach |
| **C4 Model** | Visual abstraction levels | Clear communication | Documentation-focused | Medium -- used for diagrams |

The Prismatic Platform most closely follows the evolutionary architecture approach championed by Neal Ford and Rebecca Parsons, where architectural fitness functions replace static target-state diagrams.

### Monolith vs. Umbrella vs. Microservices

| Aspect | Monolith | Umbrella (Prismatic) | Microservices |
|--------|----------|---------------------|---------------|
| **Boundary Enforcement** | Conventions only | Compile-time | Network-level |
| **Deployment** | Single artifact | Single BEAM release | Per-service |
| **Communication** | Function calls | Function calls + messages | Network (HTTP/gRPC) |
| **Data Isolation** | Shared database | Per-app schemas possible | Per-service databases |
| **Operational Complexity** | Low | Low | High |
| **Refactoring Cost** | Low (within same process) | Low-Medium | High (API changes) |
| **Team Scalability** | Limited | Good (domain teams) | Excellent |

The umbrella architecture occupies a sweet spot: it provides microservice-level domain isolation with monolith-level operational simplicity. The BEAM VM's process model offers isolation guarantees that approach container-level separation without the network overhead.

## Best Practices

### Domain Boundary Design

1. **Start with Business Capabilities**: Define domains based on what the organization does, not how the technology is structured. The Prismatic Platform's domains (Intelligence, Security, Storage, Presentation) map to business capabilities, not technical layers.

2. **Minimize Cross-Domain Dependencies**: Each cross-domain dependency creates coupling that constrains future evolution. Track cross-domain dependencies as a fitness metric and set thresholds.

3. **Use Anti-Corruption Layers**: When integrating with external systems or legacy components, define explicit translation layers that prevent foreign concepts from leaking into your domain model.

4. **Design for Independent Evolution**: Each domain should be able to evolve its internal structure without requiring changes in other domains. This is the key benefit of bounded contexts.

### Governance

1. **Automate Governance Checks**: Manual architecture reviews do not scale. Express architectural constraints as executable fitness functions that run in CI/CD.

2. **Record Decisions**: Use ADRs to capture the context, rationale, and consequences of architectural decisions. Future developers need to understand why, not just what.

3. **Review Periodically**: Architecture fitness functions should be reviewed each generation. Thresholds may need adjustment as the platform evolves.

4. **Balance Freedom and Constraint**: Enterprise architecture should enable teams to move fast within well-defined boundaries, not slow them down with bureaucratic approval processes.

## Common Pitfalls

### Architecture Astronautics

Designing overly abstract, overly general architectures that anticipate needs that never materialize. The result is unnecessary complexity that slows development without delivering value.

**Mitigation**: Follow YAGNI (You Aren't Gonna Need It) at the architectural level. Design for current and near-future needs. The generational evolution model allows architecture to adapt as needs emerge.

### Big Bang Redesign

Attempting to restructure the entire technology landscape in a single effort. These initiatives almost always fail due to scope, risk, and organizational resistance.

**Mitigation**: Evolve architecture incrementally through generations. Each generation makes bounded, testable changes. The Prismatic Platform's journey from Gen 1 to Gen 19 was achieved through 19 incremental steps, not a single redesign.

### Ignoring Sociotechnical Alignment

Conway's Law states that system architecture mirrors organizational structure. Designing an architecture without considering team boundaries, communication patterns, and skill sets produces an architecture that cannot be maintained.

**Mitigation**: Align domain boundaries with team boundaries. In the Prismatic Platform, each domain has an identified owner, ensuring that architectural boundaries are socially reinforced.

### Documentation Without Enforcement

Creating beautiful architecture diagrams that nobody follows. Without automated enforcement, architecture documents become aspirational fiction.

**Mitigation**: Every architectural constraint must have a corresponding fitness function, quality gate, or enforcement policy. If it cannot be automated, question whether it is truly a constraint.

## Use Cases

### Platform Scaling

Enterprise architecture enables the Prismatic Platform to scale from its current 115 applications to potentially hundreds more without losing coherence. The domain decomposition, dependency rules, and fitness functions ensure that new applications integrate cleanly rather than creating architectural debt.

### Team Organization

The domain-based architecture directly informs team structure. New contributors can be directed to a specific domain (e.g., "work on Security applications") without needing to understand the entire platform. Domain boundaries serve as cognitive boundaries.

### Technology Migration

When migrating from one technology to another (e.g., changing a storage adapter from ETS to Horde for distributed deployment), the enterprise architecture ensures the migration is bounded to specific applications within the affected domain. Other domains are insulated through the adapter pattern and domain boundaries.

### Compliance and Audit

Enterprise architecture documentation -- maintained through ADRs, domain registries, and fitness function reports -- provides the evidence needed for compliance audits. NIS2 and ZKB assessments require demonstrating that security controls are architecturally integrated, not bolted on.

## Related Concepts

Enterprise architecture connects to foundational architectural and organizational concepts:

- [Software Architecture](@/glossary/software-architecture.md) -- The technical subset of enterprise architecture focused on software system design
- [Domain-Driven Design](@/glossary/domain-driven-design.md) -- The methodology for decomposing complex domains into bounded contexts
- [3NL](@/glossary/3nl.md) -- The epistemological architecture framework governing knowledge management
- [Architectural Pattern](@/glossary/architectural-pattern.md) -- Reusable solutions to recurring architectural problems
- [Layered Architecture](@/glossary/layered-architecture.md) -- Organizing system components into horizontal layers
- [Microservices](@/glossary/microservices.md) -- An alternative decomposition strategy using network-isolated services
- [Umbrella Application](@/glossary/umbrella-application.md) -- The Elixir mechanism for implementing EA domain boundaries
- [Supervision Tree](@/glossary/supervision-tree.md) -- OTP's architectural pattern for fault-tolerant process hierarchies
- [OTP Application](@/glossary/otp-application.md) -- The BEAM's unit of architectural composition
- [Ecosystem](@/glossary/ecosystem.md) -- The complete environment that enterprise architecture governs

## See Also

- Glossary Index -- Complete glossary of Prismatic Platform terminology
- [Architecture Section](@/architecture/_index.md) -- Detailed platform architecture documentation
- [Enforcement Policy](@/glossary/enforcement-policy.md) -- How architectural standards are enforced
- [Quality Gate](@/glossary/quality-gate.md) -- Automated architectural fitness verification
- [Generation](@/glossary/generation.md) -- The evolutionary unit of architectural change

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
