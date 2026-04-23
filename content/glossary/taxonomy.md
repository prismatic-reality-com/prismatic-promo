+++
title = "Taxonomy"
weight = 50
[extra]
tags = ["glossary", "taxonomy", "classification", "hierarchy", "knowledge-management", "ontology", "domain-driven-design", "agent-tier", "organization"]
description = "A systematic classification scheme organizing concepts, entities, or data into hierarchical categories. In Prismatic: agent taxonomy (L1-L5 tiers), quality domain taxonomy (13 domains), Red Team 329-entry attack taxonomy, and OSINT provider classification."
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "advanced"
domain_category = "Knowledge & Organization"
related_concepts = ["ontology", "classification", "knowledge graph", "hierarchy", "domain-driven design", "semantic web", "controlled vocabulary"]
implementation_status = "production"
authority_level = "platform-core"
difficulty_rating = 6
prerequisites = ["domain-driven-design", "agent", "knowledge-graph"]
learning_path = ["domain-driven-design", "ontology", "taxonomy", "knowledge-graph"]
interactive_demos = ["/labs/glossary/taxonomy"]
code_examples = ["TaxonomyTree", "AgentTierClassifier", "QualityDomainTaxonomy", "AttackTaxonomyRegistry"]
external_resources = ["https://en.wikipedia.org/wiki/Taxonomy_(general)", "https://www.w3.org/TR/skos-reference/", "https://hexdocs.pm/elixir/Module.html"]
version_introduced = "gen-5"
stability_level = "stable"
testing_scenarios = ["taxonomy tree validation", "classification consistency", "tier assignment correctness", "taxonomy evolution integrity", "cross-reference validation"]
keywords = ["taxonomy", "classification", "hierarchy", "ontology", "agent tier", "quality domain", "attack taxonomy", "knowledge organization", "controlled vocabulary"]
related_terms = ["ontology", "knowledge-graph", "domain-driven-design", "agent-tier", "agent", "quality", "red-team", "color-teams", "classification", "belief-graph"]
word_count = 1683
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Taxonomy - Prismatic Platform"
+++

## Definition

A **Taxonomy** is a systematic scheme of classification that organizes concepts, entities, or data into hierarchical categories based on shared characteristics, relationships, and distinguishing properties. Derived from the Greek *taxis* (arrangement) and *nomos* (law), taxonomy provides the structural foundation for naming, grouping, and navigating complex domains of knowledge. Within the Prismatic Platform, taxonomy is not merely a documentation convenience but a first-class architectural concept: the [agent tier](/glossary/agent-tier/) taxonomy (L1-L5) governs operational authority, the [quality](/glossary/quality/) domain taxonomy (13 domains) structures platform integrity enforcement, the [Red Team](/glossary/red-team/) maintains a 329-entry attack taxonomy for adversarial simulation, and OSINT provider classification organizes 120+ intelligence sources across 7 categories.

## Overview

Taxonomy has been a foundational intellectual tool since Aristotle first classified living organisms in the 4th century BCE. Carl Linnaeus formalized biological taxonomy in the 18th century with his binomial nomenclature system, establishing principles that persist in modern information science: hierarchical organization, mutual exclusivity at each level, and complete coverage of the domain.

In software engineering, taxonomies appear wherever systems must organize and navigate complex domains:

- **Error Classification** -- Organizing errors by type, severity, and recovery strategy
- **Security Threat Taxonomies** -- MITRE ATT&CK, STRIDE, DREAD, and custom attack classification schemes
- **Service Catalogs** -- Organizing microservices, APIs, and capabilities by domain and function
- **Permission Systems** -- Role-based access control hierarchies
- **Content Management** -- Categorizing documents, articles, and knowledge base entries

The Prismatic Platform takes taxonomy further by making taxonomic structures computationally active -- they are not just documentation but runtime data structures that drive authorization decisions, quality enforcement, agent orchestration, and security assessment. Every taxonomy in the platform is defined as Elixir code with type specifications, validated at compile time through [Dialyzer](/glossary/dialyzer/), and enforced through [behaviour](/glossary/behaviour/) contracts.

### Key Properties of Well-Formed Taxonomies

1. **Mutual Exclusivity** -- Each entity belongs to exactly one category at each level of the hierarchy. An agent cannot simultaneously be L2 and L4.
2. **Collective Exhaustiveness** -- Every entity in the domain can be classified. No agent, quality domain, or attack vector falls outside the taxonomy.
3. **Hierarchical Consistency** -- Parent-child relationships are transitive. If A is a parent of B and B is a parent of C, then A is an ancestor of C.
4. **Stable Identity** -- Taxonomic categories have stable identifiers that do not change when the taxonomy evolves. New categories are added; existing ones are deprecated, never deleted.
5. **Controlled Vocabulary** -- Terms within the taxonomy are precisely defined, avoiding synonyms and ambiguity.

## Technical Details

### Taxonomy Data Structures

A taxonomy can be represented as a tree (strict hierarchy), a DAG (multiple inheritance), or a lattice (with meet/join operations). The Prismatic Platform uses trees for most taxonomies due to their simplicity and efficient traversal:

```elixir
defmodule Prismatic.Taxonomy.Tree do
  @moduledoc """
  A generic taxonomy tree data structure supporting
  hierarchical classification with path-based navigation,
  validation, and traversal operations.
  """

  @type node_id :: String.t()

  @type taxonomy_node :: %{
    id: node_id(),
    name: String.t(),
    description: String.t(),
    level: non_neg_integer(),
    parent_id: node_id() | nil,
    children_ids: [node_id()],
    metadata: map(),
    deprecated: boolean()
  }

  @type tree :: %{
    root_id: node_id(),
    nodes: %{node_id() => taxonomy_node()},
    name: String.t(),
    version: String.t()
  }

  @spec new(String.t(), String.t()) :: tree()
  def new(name, version) do
    root = %{
      id: "root",
      name: name,
      description: "Root node of #{name} taxonomy",
      level: 0,
      parent_id: nil,
      children_ids: [],
      metadata: %{},
      deprecated: false
    }

    %{
      root_id: "root",
      nodes: %{"root" => root},
      name: name,
      version: version
    }
  end

  @spec add_node(tree(), node_id(), node_id(), String.t(), map()) ::
          {:ok, tree()} | {:error, :parent_not_found | :duplicate_id}
  def add_node(tree, parent_id, node_id, name, metadata \\ %{}) do
    cond do
      Map.has_key?(tree.nodes, node_id) ->
        {:error, :duplicate_id}

      not Map.has_key?(tree.nodes, parent_id) ->
        {:error, :parent_not_found}

      true ->
        parent = Map.fetch!(tree.nodes, parent_id)
        updated_parent = %{parent | children_ids: [node_id | parent.children_ids]}

        node = %{
          id: node_id,
          name: name,
          description: "",
          level: parent.level + 1,
          parent_id: parent_id,
          children_ids: [],
          metadata: metadata,
          deprecated: false
        }

        nodes =
          tree.nodes
          |> Map.put(parent_id, updated_parent)
          |> Map.put(node_id, node)

        {:ok, %{tree | nodes: nodes}}
    end
  end

  @spec classify(tree(), map(), (taxonomy_node(), map() -> boolean())) ::
          {:ok, taxonomy_node()} | {:error, :unclassifiable}
  def classify(tree, entity, classifier_fn) do
    root = Map.fetch!(tree.nodes, tree.root_id)
    find_deepest_match(tree, root, entity, classifier_fn)
  end

  @spec ancestors(tree(), node_id()) :: [taxonomy_node()]
  def ancestors(tree, node_id) do
    case Map.get(tree.nodes, node_id) do
      nil -> []
      node -> collect_ancestors(tree, node, [])
    end
  end

  @spec descendants(tree(), node_id()) :: [taxonomy_node()]
  def descendants(tree, node_id) do
    case Map.get(tree.nodes, node_id) do
      nil -> []
      node -> collect_descendants(tree, node, [])
    end
  end

  @spec path(tree(), node_id()) :: [node_id()]
  def path(tree, node_id) do
    tree
    |> ancestors(node_id)
    |> Enum.map(& &1.id)
    |> Enum.reverse()
    |> Kernel.++([node_id])
  end

  @spec depth(tree()) :: non_neg_integer()
  def depth(tree) do
    tree.nodes
    |> Map.values()
    |> Enum.map(& &1.level)
    |> Enum.max(fn -> 0 end)
  end

  @spec validate(tree()) :: {:ok, :valid} | {:error, [String.t()]}
  def validate(tree) do
    errors =
      []
      |> validate_root(tree)
      |> validate_parent_refs(tree)
      |> validate_no_cycles(tree)
      |> validate_level_consistency(tree)

    case errors do
      [] -> {:ok, :valid}
      errs -> {:error, errs}
    end
  end

  @spec find_deepest_match(tree(), taxonomy_node(), map(), function()) ::
          {:ok, taxonomy_node()} | {:error, :unclassifiable}
  defp find_deepest_match(tree, node, entity, classifier_fn) do
    children =
      node.children_ids
      |> Enum.map(&Map.fetch!(tree.nodes, &1))
      |> Enum.reject(& &1.deprecated)
      |> Enum.filter(&classifier_fn.(&1, entity))

    case children do
      [] ->
        if node.id == tree.root_id and not classifier_fn.(node, entity) do
          {:error, :unclassifiable}
        else
          {:ok, node}
        end
      [match] -> find_deepest_match(tree, match, entity, classifier_fn)
      [first | _] -> find_deepest_match(tree, first, entity, classifier_fn)
    end
  end

  @spec collect_ancestors(tree(), taxonomy_node(), [taxonomy_node()]) :: [taxonomy_node()]
  defp collect_ancestors(_tree, %{parent_id: nil}, acc), do: acc
  defp collect_ancestors(tree, node, acc) do
    parent = Map.fetch!(tree.nodes, node.parent_id)
    collect_ancestors(tree, parent, [parent | acc])
  end

  @spec collect_descendants(tree(), taxonomy_node(), [taxonomy_node()]) :: [taxonomy_node()]
  defp collect_descendants(tree, node, acc) do
    Enum.reduce(node.children_ids, acc, fn child_id, inner_acc ->
      child = Map.fetch!(tree.nodes, child_id)
      collect_descendants(tree, child, [child | inner_acc])
    end)
  end

  @spec validate_root([String.t()], tree()) :: [String.t()]
  defp validate_root(errors, %{root_id: root_id, nodes: nodes}) do
    case Map.get(nodes, root_id) do
      nil -> ["Root node #{root_id} not found" | errors]
      %{parent_id: nil} -> errors
      _ -> ["Root node has a parent" | errors]
    end
  end

  @spec validate_parent_refs([String.t()], tree()) :: [String.t()]
  defp validate_parent_refs(errors, %{nodes: nodes}) do
    Enum.reduce(nodes, errors, fn {_id, node}, acc ->
      case node.parent_id do
        nil -> acc
        pid ->
          if Map.has_key?(nodes, pid), do: acc, else: ["Broken parent ref: #{pid}" | acc]
      end
    end)
  end

  @spec validate_no_cycles([String.t()], tree()) :: [String.t()]
  defp validate_no_cycles(errors, %{nodes: nodes}) do
    Enum.reduce(nodes, errors, fn {id, _node}, acc ->
      if has_cycle?(nodes, id, MapSet.new()), do: ["Cycle detected at #{id}" | acc], else: acc
    end)
  end

  @spec has_cycle?(%{node_id() => taxonomy_node()}, node_id(), MapSet.t()) :: boolean()
  defp has_cycle?(_nodes, nil, _visited), do: false
  defp has_cycle?(nodes, id, visited) do
    if MapSet.member?(visited, id) do
      true
    else
      case Map.get(nodes, id) do
        nil -> false
        node -> has_cycle?(nodes, node.parent_id, MapSet.put(visited, id))
      end
    end
  end

  @spec validate_level_consistency([String.t()], tree()) :: [String.t()]
  defp validate_level_consistency(errors, %{nodes: nodes}) do
    Enum.reduce(nodes, errors, fn {_id, node}, acc ->
      case node.parent_id do
        nil -> acc
        pid ->
          parent = Map.get(nodes, pid)
          if parent && node.level != parent.level + 1 do
            ["Level inconsistency at #{node.id}: expected #{parent.level + 1}, got #{node.level}" | acc]
          else
            acc
          end
      end
    end)
  end
end
```

### Agent Tier Taxonomy (L1-L5)

The platform's 530+ AIAD agents are classified into a five-tier hierarchy based on operational authority, scope, and autonomy:

```elixir
defmodule Prismatic.Taxonomy.AgentTier do
  @moduledoc """
  Defines the five-tier agent taxonomy governing
  operational authority and scope across 530+ AIAD agents.
  """

  @type tier :: 1 | 2 | 3 | 4 | 5

  @type tier_definition :: %{
    level: tier(),
    name: String.t(),
    authority: String.t(),
    scope: String.t(),
    max_agents: pos_integer() | :unlimited,
    escalation_target: tier() | nil,
    capabilities: [atom()]
  }

  @spec tier_definitions() :: %{tier() => tier_definition()}
  def tier_definitions do
    %{
      1 => %{
        level: 1,
        name: "Supreme",
        authority: "COSMIC CLEARANCE",
        scope: "Platform-wide strategic decisions",
        max_agents: 5,
        escalation_target: nil,
        capabilities: [:orchestrate, :override, :evolve, :audit, :deploy]
      },
      2 => %{
        level: 2,
        name: "Strategic Commander",
        authority: "TOP SECRET",
        scope: "Domain-level coordination and planning",
        max_agents: 20,
        escalation_target: 1,
        capabilities: [:coordinate, :plan, :delegate, :report]
      },
      3 => %{
        level: 3,
        name: "Tactical Leader",
        authority: "SECRET",
        scope: "Team-level operation management",
        max_agents: 50,
        escalation_target: 2,
        capabilities: [:execute, :monitor, :escalate, :recommend]
      },
      4 => %{
        level: 4,
        name: "Operational Specialist",
        authority: "CONFIDENTIAL",
        scope: "Specific task execution within domain",
        max_agents: 200,
        escalation_target: 3,
        capabilities: [:execute, :report, :request]
      },
      5 => %{
        level: 5,
        name: "Worker",
        authority: "UNCLASSIFIED",
        scope: "Atomic task execution",
        max_agents: :unlimited,
        escalation_target: 4,
        capabilities: [:execute, :report]
      }
    }
  end

  @spec classify_agent(map()) :: {:ok, tier()} | {:error, :unclassifiable}
  def classify_agent(%{authority_level: auth, scope: scope}) do
    tier =
      cond do
        auth in ["COSMIC", "COSMIC CLEARANCE"] -> 1
        auth in ["TOP SECRET", "STRATEGIC"] -> 2
        auth in ["SECRET", "TACTICAL"] -> 3
        auth in ["CONFIDENTIAL", "OPERATIONAL"] -> 4
        true -> 5
      end

    {:ok, tier}
  end

  def classify_agent(_), do: {:error, :unclassifiable}

  @spec can_escalate_to?(tier(), tier()) :: boolean()
  def can_escalate_to?(from_tier, to_tier) when is_integer(from_tier) and is_integer(to_tier) do
    to_tier < from_tier
  end

  @spec tier_count() :: %{tier() => non_neg_integer()}
  def tier_count do
    # In production, this queries the AgentRegistry
    %{1 => 5, 2 => 18, 3 => 45, 4 => 180, 5 => 282}
  end
end
```

### Quality Domain Taxonomy

The 13 [quality](/glossary/quality/) domains form a flat taxonomy (single level) with domain-specific enforcement rules:

```elixir
defmodule Prismatic.Taxonomy.QualityDomain do
  @moduledoc """
  Taxonomy of the 13 quality domains that collectively
  achieve the platform's 100/100 quality score.
  """

  @type domain_category :: :static_analysis | :runtime_safety | :code_quality | :documentation

  @type domain :: %{
    id: atom(),
    name: String.t(),
    category: domain_category(),
    severity: :blocking | :warning,
    current_violations: non_neg_integer(),
    automated_fix: boolean()
  }

  @spec all_domains() :: [domain()]
  def all_domains do
    [
      %{id: :dialyzer, name: "Dialyzer", category: :static_analysis, severity: :blocking, current_violations: 0, automated_fix: false},
      %{id: :credo, name: "Credo", category: :static_analysis, severity: :blocking, current_violations: 0, automated_fix: true},
      %{id: :compilation, name: "Compilation", category: :static_analysis, severity: :blocking, current_violations: 0, automated_fix: false},
      %{id: :datetime, name: "DateTime Precision", category: :runtime_safety, severity: :blocking, current_violations: 0, automated_fix: true},
      %{id: :guards, name: "Guard Functions", category: :code_quality, severity: :blocking, current_violations: 0, automated_fix: true},
      %{id: :impl_coverage, name: "@impl Coverage", category: :code_quality, severity: :blocking, current_violations: 0, automated_fix: true},
      %{id: :memory_safety, name: "Memory Safety", category: :runtime_safety, severity: :blocking, current_violations: 0, automated_fix: false},
      %{id: :performance, name: "Performance", category: :runtime_safety, severity: :blocking, current_violations: 0, automated_fix: false},
      %{id: :regression, name: "Regression Prevention", category: :code_quality, severity: :blocking, current_violations: 0, automated_fix: false},
      %{id: :timing, name: "Timing Patterns", category: :runtime_safety, severity: :blocking, current_violations: 0, automated_fix: true},
      %{id: :todo, name: "TODO Management", category: :documentation, severity: :warning, current_violations: 0, automated_fix: false},
      %{id: :typespec, name: "Typespec Coverage", category: :code_quality, severity: :blocking, current_violations: 0, automated_fix: false},
      %{id: :unsafe_map, name: "Unsafe Map Access", category: :runtime_safety, severity: :blocking, current_violations: 0, automated_fix: true}
    ]
  end

  @spec by_category(domain_category()) :: [domain()]
  def by_category(category) do
    Enum.filter(all_domains(), &(&1.category == category))
  end

  @spec blocking_count() :: non_neg_integer()
  def blocking_count do
    Enum.count(all_domains(), &(&1.severity == :blocking))
  end

  @spec total_violations() :: non_neg_integer()
  def total_violations do
    all_domains() |> Enum.map(& &1.current_violations) |> Enum.sum()
  end
end
```

### Attack Taxonomy (329 Entries)

The [Red Team](/glossary/red-team/) maintains a comprehensive attack taxonomy organized by five epistemic attack primitives:

```
Attack Taxonomy (329 entries)
├── Truth Distortion (67 entries)
│   ├── Source Fabrication (12)
│   ├── Evidence Tampering (15)
│   ├── Provenance Spoofing (18)
│   └── Signal Injection (22)
├── Confidence Manipulation (58 entries)
│   ├── Threshold Gaming (14)
│   ├── Score Inflation (16)
│   ├── Calibration Drift (13)
│   └── Uncertainty Masking (15)
├── Signal Poisoning (72 entries)
│   ├── Data Pollution (20)
│   ├── Channel Corruption (18)
│   ├── Noise Amplification (17)
│   └── Filter Evasion (17)
├── Drift Induction (65 entries)
│   ├── Gradual Shift (16)
│   ├── Threshold Erosion (15)
│   ├── Baseline Manipulation (18)
│   └── Normalization Attack (16)
└── Salience Hijacking (67 entries)
    ├── Attention Diversion (17)
    ├── Priority Inversion (16)
    ├── Context Switching (18)
    └── Focus Degradation (16)
```

## Implementation in Prismatic Platform

### OSINT Provider Taxonomy

The platform's 120+ OSINT tools are classified into a provider taxonomy:

| Category | Count | Examples |
|----------|-------|---------|
| **Czech** | 28 | ARES, Justice, ISIR, Commercial Register |
| **Global** | 84 | Shodan, VirusTotal, Censys, Hunter.io |
| **Sanctions** | 3 | EU, OFAC SDN, UN |
| **EU** | 1 | European Business Register |
| **UK** | 1 | Companies House |
| **US** | 1 | SEC EDGAR |
| **Universal** | 2 | EmailIntelligence, EmailIntelligenceRateLimited |

### Taxonomy Evolution Protocol

Taxonomies evolve as the platform grows. The evolution protocol ensures backward compatibility:

1. **Addition** -- New categories can be added at any level. All existing classifications remain valid.
2. **Deprecation** -- Categories are marked `deprecated: true` but never removed. Existing entities retain their classification.
3. **Splitting** -- A category can be split into sub-categories. The parent category remains as a grouping node.
4. **Merging** -- Two categories at the same level can be merged. Both old identifiers redirect to the merged category.
5. **Re-rooting** -- The hierarchy can be restructured by adding intermediate levels. Leaf-level classifications are preserved.

## Comparison with Alternatives

| Approach | Strengths | Weaknesses | Prismatic Usage |
|----------|-----------|------------|----------------|
| **Tree Taxonomy** | Simple, fast traversal, clear hierarchy | Single inheritance only | Primary (agents, quality, attacks) |
| **DAG (Polyhierarchy)** | Multiple parents, flexible | Complex queries, cycle risk | OSINT providers (dual categories) |
| **Faceted Classification** | Multi-dimensional, flexible queries | Combinatorial explosion | Potential for future search |
| **Folksonomy (Tags)** | User-generated, flexible | No structure, inconsistent | Promo site content tags |
| **Ontology (OWL/RDF)** | Formal semantics, reasoning | Heavy infrastructure, complexity | Not used -- too heavyweight |
| **SKOS Vocabulary** | W3C standard, interoperable | XML-heavy, limited depth | Design reference only |
| **Flat Enumeration** | Simplest, no hierarchy | No relationships, no navigation | Quality domains (single level) |

The Prismatic Platform deliberately uses simple tree taxonomies for most classification needs. The overhead of formal ontology languages (OWL, RDF) is not justified when the primary consumers are Elixir pattern matching and ETS lookups rather than semantic reasoners.

## Best Practices

### Taxonomy Design

1. **Start Shallow, Deepen Later** -- Begin with 2-3 levels of hierarchy. Add depth only when classification ambiguity demands it. The agent tier taxonomy has exactly 5 levels because operational authority naturally stratifies into 5 bands.

2. **Name Precisely** -- Every category name should be unambiguous within its context. Avoid generic names like "Other" or "Miscellaneous" that become dumping grounds. If a category is needed for items that do not fit elsewhere, name it specifically (e.g., "Uncategorized -- Pending Review").

3. **Define Before Populating** -- The taxonomy structure should be defined and validated before entities are classified. Retrofitting a taxonomy onto existing data is more error-prone than classifying into a well-designed structure.

4. **Validate Continuously** -- Use the `Prismatic.Taxonomy.Tree.validate/1` function to verify structural integrity after every modification. Run validation as part of the quality gate pipeline.

5. **Document the Classification Criteria** -- For each category, explicitly document the criteria that determine membership. This enables automated classification and reduces subjective judgment in borderline cases.

6. **Version the Taxonomy** -- Track taxonomy changes with semantic versioning. Breaking changes (removing categories, changing hierarchy) require a major version bump. Additions are minor versions.

7. **Separate Structure from Content** -- The taxonomy tree structure (nodes, edges, levels) should be independent of the entities classified within it. This enables reuse of the taxonomy engine across domains.

### Implementation Patterns

- **ETS for Lookup** -- Store the taxonomy tree in [ETS](/glossary/ets/) for O(1) node lookup by ID. Tree traversal is rare; point lookups are common.
- **Compile-Time Validation** -- Use `@type` and `@spec` to encode taxonomy constraints that [Dialyzer](/glossary/dialyzer/) can verify at compile time.
- **Pattern Matching Classification** -- Leverage Elixir's pattern matching for classification logic rather than conditional chains.

## Common Pitfalls

### 1. Taxonomy Creep

Adding categories for every new entity rather than fitting entities into existing categories. This leads to taxonomies with hundreds of single-member categories, defeating the purpose of classification. Resist the urge to create a new category unless at least 3-5 entities would belong to it.

### 2. Mixing Concerns

Creating a single taxonomy that tries to classify entities along multiple dimensions simultaneously (e.g., by both domain AND severity). Use separate taxonomies for orthogonal dimensions and combine them through faceted search or multi-dimensional indexing.

### 3. Orphaned Categories

Categories that no longer contain any entities but remain in the taxonomy, creating navigation noise. Implement a periodic sweep that flags empty categories for review and potential deprecation.

### 4. Circular Classification

Defining category A as "things that are not B" and category B as "things that are not A" creates circular, uninformative definitions. Every category must have positive inclusion criteria.

### 5. Premature Formalization

Investing in formal ontology tooling (OWL, RDF, SPARQL) before the domain is well-understood. Start with simple data structures and formalize only when semantic reasoning becomes a genuine requirement.

### 6. Ignoring Evolution

Designing a taxonomy as a fixed structure that cannot accommodate new categories or restructuring. Every taxonomy will evolve; design for evolution from the start with deprecation flags and version tracking.

## Use Cases

### Agent Orchestration

The [agent tier](/glossary/agent-tier/) taxonomy (L1-L5) is the foundation of the platform's agent orchestration model. When a task arrives, the orchestrator uses the taxonomy to determine which tier of agent has the authority to handle it, whether escalation is needed, and how many agents at each tier are available. The taxonomy enforces that L5 workers cannot make strategic decisions and that L1 Supreme agents are reserved for platform-wide operations.

### Quality Gate Enforcement

The 13 quality domain taxonomy structures the platform's pre-commit validation pipeline. Each domain in the taxonomy corresponds to a specific quality check (Dialyzer, Credo, compilation warnings, etc.). The taxonomy determines execution order, failure severity (blocking vs. warning), and whether automated fixes are available.

### Red Team Scenario Generation

The 329-entry attack taxonomy enables systematic adversarial testing by providing a structured vocabulary of attack techniques. The [Red Team](/glossary/red-team/) scenario generator selects attack primitives from the taxonomy, composes them into multi-technique scenarios, and tracks coverage across the taxonomy to identify untested attack categories.

### OSINT Source Selection

When conducting an investigation, the platform uses the OSINT provider taxonomy to select appropriate sources based on the investigation context (Czech entity vs. global entity, financial vs. cyber, etc.). The taxonomy prevents wasting API calls on irrelevant sources and ensures comprehensive coverage within the relevant category.

### Knowledge Organization

The glossary, documentation, and [knowledge graph](/glossary/knowledge-graph/) use taxonomic classification to organize information for navigation and search. Each glossary term is classified by category, difficulty, and domain, enabling multi-dimensional browsing.

## Related Concepts

- [Ontology](/glossary/ontology/) -- Formal specification of concepts and relationships, richer than taxonomy
- [Knowledge Graph](/glossary/knowledge-graph/) -- Graph-structured knowledge representation using taxonomic categories
- [Domain-Driven Design](/glossary/domain-driven-design/) -- Strategic design approach that defines domain taxonomies
- [Agent Tier](/glossary/agent-tier/) -- The L1-L5 agent hierarchy governed by the agent tier taxonomy
- [Quality](/glossary/quality/) -- Platform quality system organized by the 13-domain quality taxonomy
- [Red Team](/glossary/red-team/) -- Adversarial simulation using the 329-entry attack taxonomy
- [Color Teams](/glossary/color-teams/) -- Security organization with team-based classification
- [Belief Graph](/glossary/belief-graph/) -- Epistemic graph structure using taxonomic categories for node types
- [Credo](/glossary/credo/) -- Static analysis tool whose checks form a quality sub-taxonomy
- [EASM](/glossary/easm/) -- External attack surface management using asset type taxonomies

## See Also

- [Agent](/glossary/agent/) -- AIAD agents classified by the tier taxonomy
- [Dialyzer](/glossary/dialyzer/) -- Type checking tool validating taxonomy type specifications
- [ETS](/glossary/ets/) -- In-memory storage used for taxonomy lookup tables
- [Behaviour](/glossary/behaviour/) -- Interface contracts enabling taxonomy-driven dispatch
- [Pattern Matching](/glossary/pattern-matching/) -- Core Elixir feature for taxonomy-based classification logic
- [Architectural Pattern](/glossary/architectural-pattern/) -- Design patterns organized taxonomically
- [Vulnerability Assessment](/glossary/vulnerability-assessment/) -- Security assessment using vulnerability taxonomies
- [Enterprise Architecture](/glossary/enterprise-architecture/) -- Organization-wide architecture using capability taxonomies

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
