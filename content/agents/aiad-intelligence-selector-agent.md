+++
title = "AIAD Intelligence Selector Agent"
weight = 28
[extra]
domain = "primary"
level = "L3"
description = "Intelligent component selection agent using relevance scoring, dependency resolution, and capability matching to choose optimal AIAD components for knowledge transfer to external projects"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "ecto", "no-mercy", "genserver"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["AIAD", "Intelligence", "Selector", "Agent", "Intelligent", "agents", "Prismatic Platform", "Dependency", "The Intelligence"]
tags = ["agents", "agent", "aiad-intelligence-selector-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "AIAD Intelligence Selector Agent - Prismatic Platform"
+++

## Overview

The [AIAD](@/glossary/aiad.md) Intelligence Selector Agent operates as an L3 [strategic command](@/glossary/strategic-command.md) agent within the Primary domain of the Prismatic Platform. This agent is responsible for intelligent component selection during knowledge transfer operations, analyzing a target project's characteristics and scoring every available AIAD component for relevance. The selector determines which agents, commands, workflows, and protocols from the platform's 404-agent, 210-command ecosystem should be included in a knowledge transfer deployment, ensuring that target projects receive precisely the components they need -- no more, no less.

Indiscriminate component deployment would overwhelm target projects with irrelevant infrastructure. A Python Django REST API project does not need Elixir-specific [OTP](@/glossary/otp.md) supervision agents or [LiveView](@/glossary/liveview.md) dashboard commanders. Conversely, omitting a critical dependency of a selected component would produce an incomplete, non-functional installation. The Intelligence Selector balances these concerns through a weighted scoring algorithm that evaluates language match, framework match, domain match, and capability match for every component, then resolves dependencies to ensure that selected components form a complete, self-consistent installation package.

The selection process is transparent and explainable. For every component, the selector produces a relevance score (0.0 to 1.0), a breakdown of how each scoring factor contributed to the total, and a human-readable explanation of why the component was selected or excluded. This transparency supports the NABLA provenance axiom by ensuring that selection decisions can be audited and understood by operators who review the deployment package before installation.

## Operational Domain

The Primary domain encompasses core platform operations that produce foundational artifacts. The Intelligence Selector operates within this domain as a critical stage in the knowledge transfer pipeline, positioned between the Project Analyzer (which produces the target analysis) and the Adaptation Engine (which adapts selected components for the target environment). The selector's output defines the scope of the entire knowledge transfer operation.

## Key Capabilities

- **Multi-factor relevance scoring** evaluating every AIAD component against the target project across four weighted dimensions: language match (40%), framework match (30%), domain match (20%), and capability match (10%), producing a composite 0-1 relevance score
- **Dependency resolution** ensuring that every selected component's dependencies are also included in the selection, preventing incomplete installations where a component references agents or commands that were not deployed
- **Priority classification** categorizing selected components as core (essential for basic AIAD functionality), recommended (high-value for the target project type), or optional (beneficial but not critical), enabling tiered deployment strategies
- **Selection reasoning documentation** producing human-readable explanations for every selection decision, enabling operators to understand and override the automated selection when domain-specific knowledge indicates different priorities
- **Exclusion detection** identifying components that should be explicitly excluded due to incompatibility, redundancy with the target's existing infrastructure, or unsuitability for the target's operational context
- **Incremental selection** supporting partial selections for projects with existing AIAD installations, identifying only the components that would add value beyond what is already installed

## Technical Architecture

The Intelligence Selector implements a scoring pipeline that evaluates each component against the project analysis output and resolves the dependency graph of selected components.

```elixir
defmodule AIAD.IntelligenceSelector do
  @scoring_weights %{language: 0.40, framework: 0.30, domain: 0.20, capability: 0.10}
  @selection_threshold 0.50

  def select(project_analysis) do
    components = load_all_components()
    scored = Enum.map(components, fn c ->
      score = compute_relevance_score(c, project_analysis)
      {c.id, score, explain_score(c, project_analysis, score)}
    end)

    selected = scored
    |> Enum.filter(fn {_id, score, _reason} -> score >= @selection_threshold end)
    |> resolve_dependencies()
    |> classify_priority()

    {:ok, selected}
  end

  defp compute_relevance_score(component, analysis) do
    language_score = score_language_match(component, analysis)
    framework_score = score_framework_match(component, analysis)
    domain_score = score_domain_match(component, analysis)
    capability_score = score_capability_match(component, analysis)

    language_score * @scoring_weights.language +
    framework_score * @scoring_weights.framework +
    domain_score * @scoring_weights.domain +
    capability_score * @scoring_weights.capability
  end
end
```

Language scoring uses a three-tier match: exact language match scores 1.0 (an Elixir component for an Elixir project), compatible language scores 0.7 (a generic component with language-agnostic patterns), and polyglot/universal components score 0.5. Framework scoring follows the same tier pattern. Domain scoring correlates the component's operational domain (API, testing, CI/CD, database, security) with the target project's detected capabilities. Capability scoring evaluates whether the component provides functionality that the target project needs but lacks.

## Decision Framework

| Selection Criterion | Score Range | Classification |
|-------------------|-------------|----------------|
| Exact language + framework match | 0.85 - 1.00 | Core component |
| Compatible language + domain match | 0.65 - 0.84 | Recommended component |
| Generic/polyglot + capability match | 0.50 - 0.64 | Optional component |
| Below threshold | 0.00 - 0.49 | Excluded |
| Dependency of selected component | N/A (forced) | Core dependency |

Dependency resolution operates after initial scoring to ensure completeness. If a selected agent references another agent in its coordination table or dependency declarations, the referenced agent is automatically included regardless of its individual score. This transitive closure ensures that the deployed component set is self-consistent.

## Authority Level

**L3** - Strategic Command. The Intelligence Selector holds multi-domain coordination authority for component evaluation across all AIAD domains. This permits the agent to access and evaluate any component in the registry, regardless of its originating domain, and to make cross-domain selection decisions based on the target project's needs. The L3 designation enables coordination with the Injection Coordinator for pipeline-level decisions and with the Adaptation Engine for post-selection processing.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [agent-discovery-specialist](@/agents/agent-discovery-specialist.md) | Registry Source | Provides the complete agent catalog for evaluation |
| [AIAD Adaptation Engine Agent](@/agents/aiad-adaptation-engine-agent.md) | Pipeline Successor | Receives selected components for Prismatic reference removal |
| [AIAD Project Analyzer Agent](@/agents/aiad-project-analyzer-agent.md) | Analysis Source | Provides target project analysis driving selection decisions |
| [AIAD Injection Coordinator Agent](@/agents/aiad-injection-coordinator-agent.md) | Pipeline Orchestrator | Coordinates overall knowledge transfer including selection stage |
| [aiad-verification-engine](@/agents/aiad-verification-engine.md) | Completeness Check | Validates that selected component set is internally consistent |

## Performance Characteristics

| Metric | Current | Target | Description |
|--------|---------|--------|-------------|
| **Full evaluation time** | < 5s | < 10s | Time to score all 404+ components against project analysis |
| **Dependency resolution** | < 2s | < 5s | Time to compute transitive dependency closure |
| **Selection accuracy** | > 90% | > 85% | Operator agreement with automated selection decisions |
| **Completeness rate** | 100% | 100% | Selected sets with all dependencies resolved |
| **Average selection size** | ~40 components | Varies | Typical number of components selected for deployment |
| **Explanation generation** | < 1s | < 2s | Time to produce human-readable selection reasoning |

## Enforcement

All selection operations are governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. Every selection decision must include documented reasoning -- components are never included or excluded without explanation. Dependency resolution is mandatory and non-bypassable; incomplete component sets are rejected. Selection scores are computed deterministically from the scoring algorithm, ensuring reproducibility. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that selection decisions be evidence-based, derived from measured characteristics of the target project and component registry, not from assumptions or heuristics without validated backing.

## Related Resources

- [AIAD Standard](@/capabilities/aiad-standard.md) -- Specification standard defining selectable components
- [AIAD Injection Coordinator Agent](@/agents/aiad-injection-coordinator-agent.md) -- Pipeline orchestrator invoking selection
- [AIAD Project Analyzer Agent](@/agents/aiad-project-analyzer-agent.md) -- Upstream analysis feeding selection
- [Agent Registry](@/registry/_index.md) -- Complete registry of selectable agents
- [Commands](@/commands/_index.md) -- Complete registry of selectable commands
- [Technologies](@/technologies/_index.md) -- Technology stack informing language/framework matching

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)