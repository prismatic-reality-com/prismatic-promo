+++
title = "Technical Vocabulary"
weight = 50
[extra]
tags = ["glossary", "core", "communication", "documentation", "terminology", "domain-language", "knowledge-management", "precision", "standards"]
description = "Technical vocabulary is the formalized set of domain-specific terms, definitions, and naming conventions that enable precise, unambiguous communication within a software engineering organization -- serving as the foundation for documentation, code review, architecture discussions, and cross-team collaboration"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
date_created = "2026-02-22"
date_updated = "2026-02-22"
version = "2.0.0"
related_terms = ["domain-driven-design", "domain", "specification", "documentation", "quality-standard", "architecture", "code-quality", "glossary", "domain-specialization", "aiad"]
learning_outcomes = ["Understand the role of precise technical vocabulary in software engineering", "Apply domain-driven design ubiquitous language principles", "Implement naming conventions that encode domain knowledge", "Build and maintain a living glossary for platform development", "Use technical vocabulary to reduce ambiguity in code and documentation"]
prerequisites = ["domain-driven-design", "architecture", "code-quality"]
see_also = ["domain", "specification", "architectural-thinking", "quality-and-transparency", "quality-standard"]
acronyms = ["DDD = Domain-Driven Design", "UL = Ubiquitous Language", "AIAD = AI Agent Definition", "BC = Bounded Context"]
platforms = ["Prismatic Platform", "Software Engineering (Universal)"]
use_cases = ["Team onboarding acceleration", "Code review precision", "Architecture documentation", "API design clarity", "Cross-team communication", "Glossary maintenance"]
key_metrics = ["Glossary term count", "Term coverage per domain", "Naming convention compliance", "Documentation coverage", "Onboarding time reduction"]
glossary_terms = 127
domain = "core"
related_patterns = ["ubiquitous language", "bounded context", "naming conventions", "self-documenting code", "glossary-driven development"]
standards = ["Elixir naming conventions", "Phoenix naming conventions", "AIAD standard", "Conventional Commits"]
tools = ["Credo", "mix docs", "ExDoc", "glossary index"]
platform_relevance = "critical"
importance = "foundational"
elixir_version = "1.19+"
otp_version = "27+"
tldr = "Technical vocabulary is the curated, enforced set of terms and naming conventions that ensure unambiguous communication across code, documentation, APIs, and operational procedures in a platform with 115 applications and 530+ agents."
word_count = 1639
date_modified = "2026-02-23"
keywords = ["Technical", "Vocabulary", "glossary", "core", "Prismatic Platform", "Domain"]
image = "/images/sections/glossary.png"
image_alt = "Technical Vocabulary - Prismatic Platform"
+++

## Definition

Technical vocabulary is the formalized set of domain-specific terms, definitions, and naming conventions that enable precise, unambiguous communication within a software engineering organization. It encompasses not only the words used in code (module names, function names, type names) but also the terms used in documentation, architecture discussions, issue tracking, commit messages, and cross-team collaboration. A well-maintained technical vocabulary serves as the linguistic foundation upon which all other engineering practices are built -- without shared, precise terminology, code reviews devolve into misunderstandings, architecture discussions become ambiguous, and documentation fails to communicate.

Within the Prismatic Platform, technical vocabulary is not an afterthought but a first-class engineering concern, formalized through this glossary of 127+ terms, enforced through naming conventions, and integrated into every layer of the platform from module names to agent definitions.

## The Role of Language in Software Engineering

Software engineering is fundamentally a linguistic activity. Code is written in programming languages. Requirements are expressed in natural language. Architecture is described through named patterns. APIs communicate through named endpoints with named parameters. Every interaction between humans and between humans and machines is mediated by language.

The quality of this language directly determines the quality of communication, which in turn determines the quality of the software produced. When a team lacks shared vocabulary, common failure modes emerge:

**Term Collision**: Two developers use the same word to mean different things. "Service" might mean an OTP GenServer to one developer and an HTTP endpoint to another. These collisions create subtle bugs when assumptions diverge.

**Term Drift**: A word's meaning gradually shifts as the team evolves, but the code and documentation retain the original meaning. The term "agent" might originally refer to a monitoring process but come to mean an AI-powered autonomous entity, creating confusion when reading older code.

**Precision Loss**: Developers default to vague, general terms ("thing," "data," "handler," "processor") when precise domain terms would communicate intent more effectively. This imprecision propagates from conversations into code and from code into architecture.

**Knowledge Silos**: Without shared vocabulary, domain knowledge becomes trapped in individual developers' heads, creating dangerous single points of knowledge failure.

## Domain-Driven Design and Ubiquitous Language

The concept of formalized technical vocabulary draws heavily from Eric Evans' Domain-Driven Design (DDD), particularly the principle of Ubiquitous Language. DDD posits that the most effective software teams share a common language between domain experts and developers -- a language that appears in conversations, documentation, and code without translation.

The Prismatic Platform applies this principle at scale across its 115 umbrella applications and 530 AIAD agents. Key DDD vocabulary principles enforced in the platform:

### Bounded Contexts Define Term Scope

Each umbrella application represents a bounded context where terms have specific meanings. "Asset" in `prismatic_perimeter` refers to an external attack surface element (domain, IP, certificate), while "asset" in `prismatic_web` might refer to a static file. The bounded context boundary makes this ambiguity explicit and manageable.

### The Domain Model Is the Code

Names in the code must match names in the domain. If the security team calls something a "security rating," the code must use `SecurityRating`, not `ScoreCard` or `GradeReport`. This alignment eliminates the cognitive overhead of translating between domain language and code language.

### Terms Evolve Through Consensus

When domain understanding deepens and a term's meaning needs refinement, the change propagates simultaneously through documentation, code, and conversation. The glossary serves as the authoritative source of truth for term definitions.

## The Prismatic Platform Glossary Architecture

The platform maintains a structured glossary of 127+ terms, each defined with consistent metadata and cross-references. This glossary serves multiple purposes simultaneously:

```elixir
defmodule Prismatic.Vocabulary.GlossaryTerm do
  @moduledoc """
  Represents a single term in the Prismatic Platform glossary.

  Each glossary term captures not just a definition but a complete
  knowledge artifact including category, difficulty level, related
  terms, learning outcomes, and quality metadata. This rich structure
  enables the glossary to function as both a reference document and
  a learning resource.

  ## Term Categories

  The glossary organizes terms into semantic categories that map
  to the platform's architectural domains:

  - `core` - Foundational platform concepts
  - `architecture` - Structural and design patterns
  - `quality` - Quality assurance and measurement
  - `security` - Security operations and compliance
  - `evolution` - Platform evolution and self-improvement
  - `agent` - AI agent framework concepts
  - `infrastructure` - Deployment and operations
  """

  @type t :: %__MODULE__{
    term: String.t(),
    title: String.t(),
    definition: String.t(),
    category: category(),
    difficulty: difficulty(),
    related_terms: [String.t()],
    learning_outcomes: [String.t()],
    prerequisites: [String.t()],
    tags: [String.t()],
    quality_score: non_neg_integer()
  }

  @type category :: :core | :architecture | :quality | :security
    | :evolution | :agent | :infrastructure

  @type difficulty :: :beginner | :intermediate | :advanced | :expert

  defstruct [
    :term, :title, :definition, :category, :difficulty,
    :related_terms, :learning_outcomes, :prerequisites,
    :tags, :quality_score
  ]

  @spec new(map()) :: {:ok, t()} | {:error, :invalid_term}
  def new(attrs) when is_map(attrs) do
    term = struct(__MODULE__, attrs)

    case validate(term) do
      :ok -> {:ok, term}
      {:error, reason} -> {:error, reason}
    end
  end

  @spec validate(t()) :: :ok | {:error, term()}
  def validate(%__MODULE__{} = term) do
    validations = [
      {term.term != nil and term.term != "", :missing_term},
      {term.definition != nil and String.length(term.definition) > 50, :insufficient_definition},
      {term.category in [:core, :architecture, :quality, :security, :evolution, :agent, :infrastructure], :invalid_category},
      {length(term.related_terms || []) >= 3, :insufficient_cross_references}
    ]

    case Enum.find(validations, fn {valid, _reason} -> not valid end) do
      nil -> :ok
      {_, reason} -> {:error, reason}
    end
  end
end
```

### Term Quality Standards

Each glossary term is held to measurable quality standards:

| Criterion | Threshold | Measurement |
|-----------|-----------|-------------|
| Word count | 1,500+ words | Character/word counting |
| Section structure | 8+ sections | Heading enumeration |
| Frontmatter keys | 5+ `[extra]` keys | Metadata parsing |
| Cross-references | 3+ `@/` links | Link extraction |
| Overall quality | 75/100 minimum | Weighted aggregate |
| Maximum quality | 95/100 target | Full enhancement |

## Naming Conventions as Encoded Vocabulary

In the Prismatic Platform, naming conventions are not merely stylistic preferences -- they are encoded vocabulary that communicates architectural intent:

### Module Naming

Module names encode their role, domain, and position in the architecture:

```elixir
# CORRECT: Name communicates domain and responsibility
defmodule PrismaticPerimeter.SecurityRating.Calculator do
  @moduledoc "Calculates security ratings for discovered assets."
end

# CORRECT: Name follows umbrella app -> context -> responsibility pattern
defmodule PrismaticStorage.ETS.Adapter do
  @moduledoc "ETS-backed storage adapter implementing the StorageCore trait."
end

# FORBIDDEN: Generic names that communicate nothing
defmodule Prismatic.Utils do       # What utilities? For what domain?
defmodule Prismatic.DataManager do  # What data? What management?
defmodule Prismatic.Handler do      # Handler of what?
defmodule Prismatic.Processor do    # Processes what?
```

The platform explicitly forbids the suffixes `Manager`, `Handler`, `Utils`, `Helper`, and `Processor` because they are vocabulary failures -- they use generic terms when specific terms would communicate actual intent.

### Function Naming

Function names encode their behavior contract:

```elixir
defmodule Prismatic.Vocabulary.NamingConventions do
  @moduledoc """
  Enforces naming conventions that encode domain vocabulary.

  Function names follow specific patterns that communicate their
  behavioral contract without requiring documentation:

  - `fetch_*` - Returns `{:ok, value}` or `{:error, reason}`
  - `get_*` - Returns value or raises on failure
  - `list_*` - Returns `[value]`, possibly empty
  - `create_*` - Returns `{:ok, created}` or `{:error, changeset}`
  - `update_*` - Returns `{:ok, updated}` or `{:error, changeset}`
  - `delete_*` - Returns `{:ok, deleted}` or `{:error, reason}`
  - `*?` - Returns boolean (predicate functions)
  - `*!` - Returns value or raises exception
  """

  @type naming_violation :: %{
    module: module(),
    function: atom(),
    arity: non_neg_integer(),
    expected_pattern: String.t(),
    actual_return: String.t()
  }

  @spec validate_module_naming(module()) :: {:ok, []} | {:error, [naming_violation()]}
  def validate_module_naming(module) do
    functions = module.__info__(:functions)

    violations =
      functions
      |> Enum.flat_map(fn {name, arity} -> check_naming(module, name, arity) end)

    case violations do
      [] -> {:ok, []}
      found -> {:error, found}
    end
  end

  @spec forbidden_suffix?(String.t()) :: boolean()
  def forbidden_suffix?(module_name) do
    forbidden = ~w(Manager Handler Utils Helper Processor)
    Enum.any?(forbidden, &String.ends_with?(module_name, &1))
  end

  defp check_naming(_module, _name, _arity), do: []
end
```

### Type Naming

Type specifications serve as executable vocabulary, defining the domain's data model in code:

```elixir
# Types ARE vocabulary -- they define what terms mean in code
@type security_grade :: :a | :b | :c | :d | :f
@type confidence_level :: :high | :medium | :low | :unknown
@type quality_domain :: :dialyzer | :credo | :compilation | :typespec_coverage
@type evolution_fitness :: float()  # 0.0 to 1.0
@type quality_score :: 0..100
```

## Vocabulary Domains in the Prismatic Platform

The platform's technical vocabulary spans several distinct domains, each with its own terminology:

### Quality Domain Vocabulary

| Term | Definition | Used In |
|------|-----------|---------|
| Quality Debt Point (QDP) | Quantified unit of quality violation | Quality gates, reports |
| [Quality Floor](@/glossary/quality-floor-guardian.md) | Minimum acceptable quality threshold | Guardian monitoring |
| Domain Compliance | Per-domain zero-violation status | Quality scoring |
| Ratcheting | Permanently locking quality gains | Pre-commit enforcement |
| [Quality DNA](@/glossary/quality-dna.md) | Persistent cross-session quality state | Session continuity |

### Agent Domain Vocabulary

| Term | Definition | Used In |
|------|-----------|---------|
| [AIAD](@/glossary/aiad.md) | AI Agent Definition standard | Agent specifications |
| [Agent Tier](@/glossary/agent-tier.md) | L1-L4 authority hierarchy | Agent configuration |
| [Agent Orchestration](@/glossary/agent-orchestration.md) | Multi-agent coordination | Workflow execution |
| Supreme Agent | Highest authority agent class | Strategic operations |
| Color Team | Adversarial-defensive security group | Security operations |

### Architecture Domain Vocabulary

| Term | Definition | Used In |
|------|-----------|---------|
| Umbrella Application | Independent OTP app in the monorepo | Project structure |
| [Supervision Tree](@/glossary/supervision-tree.md) | OTP process hierarchy | Reliability design |
| [Bounded Context](@/glossary/domain-driven-design.md) | Domain boundary with local terminology | Architecture design |
| [Behaviour](@/glossary/behaviour.md) | Elixir callback contract | Interface design |
| Trait | Cross-cutting capability pattern | Storage abstraction |

### Evolution Domain Vocabulary

| Term | Definition | Used In |
|------|-----------|---------|
| Generation | Major platform evolution milestone | Evolution tracking |
| [Fitness Score](@/glossary/evolution.md) | Composite adaptability measure (0.0-1.0) | AutoEvolve |
| [AutoHeal](@/glossary/autoheal.md) | Autonomous remediation cycle | Quality maintenance |
| [AutoEvolve](@/glossary/autoevolve.md) | Autonomous improvement cycle | Platform evolution |
| Trinity Gate | 3-condition validation protocol | Claim verification |

## Vocabulary Governance

Maintaining a consistent technical vocabulary across a platform with 115 applications and 530 agents requires active governance:

### Term Introduction Protocol

New terms enter the vocabulary through a defined process:

1. **Proposal**: A new concept is identified that requires a dedicated term
2. **Definition**: The term is formally defined with scope, boundaries, and examples
3. **Review**: The definition is reviewed for conflicts with existing terms
4. **Documentation**: The term is added to the glossary with full metadata
5. **Adoption**: The term is used consistently in code, documentation, and conversation

### Term Deprecation Protocol

When a term becomes obsolete or is replaced by a more precise alternative:

1. **Identification**: The term is identified as redundant, ambiguous, or obsolete
2. **Replacement**: A successor term is identified or confirmed unnecessary
3. **Migration**: Code and documentation are updated to use the replacement
4. **Archive**: The old term is marked as deprecated with a redirect to the successor

### Conflict Resolution

When two domains use the same word with different meanings, bounded contexts resolve the conflict. The term retains its domain-specific meaning within each context, and cross-context communication uses qualified terms (e.g., "perimeter asset" vs. "web asset").

## The Cost of Imprecise Vocabulary

Imprecise technical vocabulary imposes measurable costs on software development:

**Communication Overhead**: When terms are ambiguous, every conversation requires clarification. "What do you mean by 'service'?" adds friction to every discussion.

**Code Comprehension Delay**: Generic names like `process_data/1` require reading the implementation to understand purpose. Precise names like `calculate_security_rating/1` communicate intent immediately.

**Onboarding Duration**: New team members must learn the implicit vocabulary through osmosis rather than consulting a formal reference. This informal learning is slow, error-prone, and inconsistent.

**Documentation Inconsistency**: Without agreed terminology, different documents use different words for the same concept, creating confusion about whether they describe the same thing or different things.

**Bug Introduction**: Misunderstanding a term's meaning leads to incorrect implementations. If a developer interprets "confidence level" as a percentage (0-100) when it is defined as a category (:high/:medium/:low), the resulting code will be structurally wrong.

Research in software engineering has consistently shown that communication failures -- not technical failures -- are the primary cause of project failures. Technical vocabulary is the infrastructure that prevents communication failures.

## Vocabulary in the AIAD Standard

The [AIAD](@/glossary/aiad.md) (AI Agent Definition) standard relies heavily on formalized vocabulary. Each agent definition uses standardized terms for:

- **Authority Levels**: L1 (Specialist), L2 (Tactical), L3 (Strategic), L4 (Safety-Critical)
- **Agent Roles**: Commander, Specialist, Guard, Coordinator, Analyzer
- **Enforcement Levels**: MANDATORY, BLOCKING, WARNING, OPTIONAL
- **Compliance States**: compliant, non-compliant, under-review, exempt

This standardized vocabulary ensures that agent definitions are unambiguous and that agents interoperate correctly based on shared terminology.

## Building Your Own Technical Vocabulary

To establish effective technical vocabulary in your organization:

1. **Start with the domain model**: Identify the core concepts of your business domain
2. **Define terms explicitly**: Write definitions that are specific, measurable, and unambiguous
3. **Encode in code**: Use domain terms as module names, function names, and type names
4. **Maintain a glossary**: Create and maintain a living reference document
5. **Enforce in review**: Check naming consistency in every code review
6. **Onboard through vocabulary**: Make the glossary the first thing new team members read
7. **Evolve deliberately**: Update vocabulary through a governed process, not ad-hoc drift

## Vocabulary and the Prismatic Glossary

This glossary itself is the primary artifact of the Prismatic Platform's technical vocabulary effort. With 127+ defined terms organized into categories, cross-referenced through explicit links, and maintained to measurable quality standards, it serves as both a reference document and a demonstration of the principles described in this article.

Each term in the glossary follows the same structure: formal definition, platform context, implementation details with code examples, cross-references to related terms, and quality metadata. This consistency is itself a vocabulary practice -- the glossary's structure communicates what a "complete term definition" means in the Prismatic Platform context.

## Related Concepts

- [Domain-Driven Design](@/glossary/domain-driven-design.md) -- The methodology that formalizes ubiquitous language
- [Domain](@/glossary/domain.md) -- The bounded area where vocabulary has specific meaning
- [Specification](@/glossary/specification.md) -- Formal description using domain vocabulary
- [AIAD](@/glossary/aiad.md) -- The agent standard that relies on standardized vocabulary
- [Architecture](@/glossary/architecture.md) -- Structural design described through architectural vocabulary
- [Code Quality](@/glossary/code-quality.md) -- Quality dimension that includes naming precision
- [Quality Standard](@/glossary/quality-standard.md) -- Standards that define vocabulary compliance
- [Domain Specialization](@/glossary/domain-specialization.md) -- Specialized vocabulary within domain boundaries
- [Documentation](@/glossary/quality-and-transparency.md) -- The written artifacts that depend on vocabulary
- [Architectural Thinking](@/glossary/architectural-thinking.md) -- Design reasoning expressed through vocabulary

See the Glossary index for the complete taxonomy of Prismatic Platform concepts.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
