+++
title = "Code as Truth"
weight = 50
[extra]
description = "Principle that the actual codebase is the single source of truth for system behavior, superseding documentation, specifications, verbal agreements, or any other representation that may drift from reality"
category = "philosophy"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "Software Philosophy"
related_concepts = ["single-source-of-truth", "documentation-drift", "specification-reality-gap", "executable-specification", "living-documentation"]
implementation_status = "production"
authority_level = "doctrine-level"
difficulty_rating = 5
prerequisites = ["software-development-basics", "version-control", "code-reading-skills"]
learning_path = ["code-quality", "documentation", "code-as-truth", "code-as-hypothesis", "specification"]
interactive_demos = ["/labs/glossary/code-as-truth"]
code_examples = ["elixir", "yaml"]
external_resources = ["https://martinfowler.com/bliki/CodeAsDocumentation.html", "https://www.hillelwayne.com/post/spec-composition/"]
version_introduced = "gen-5"
stability_level = "stable"
testing_scenarios = ["doc-code-sync-verification", "spec-implementation-alignment", "comment-accuracy-audit", "api-contract-validation"]
keywords = ["code-as-truth", "single-source-of-truth", "documentation-drift", "specification", "codebase", "source-of-truth", "living-documentation"]
tags = ["glossary", "philosophy", "documentation", "quality"]
related_terms = ["code-quality", "documentation", "specification", "code-as-hypothesis", "credo", "typespec", "clean-run", "static-analysis", "formal-verification", "no-mercy-no-doubts", "refactoring", "technical-debt"]
word_count = 1826
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Code as Truth - Prismatic Platform"
+++

## Definition

Code as Truth is the engineering principle that the actual source code of a system is the authoritative, canonical representation of what that system does. When disagreements arise between documentation, specifications, architecture diagrams, meeting notes, verbal descriptions, or any other artifact and what the code actually implements, the code is correct and everything else is wrong -- or at minimum, outdated. This principle does not claim that the code is doing what it *should* do (that is a question for testing and review), only that the code defines what the system *does* do.

## Overview

Every software project produces multiple representations of its behavior: requirements documents, design specifications, API documentation, architecture diagrams, inline comments, README files, wiki pages, Confluence articles, Jira tickets, Slack conversations, and the code itself. These representations inevitably diverge over time. A developer fixes a bug without updating the specification. An architect redesigns a component without revising the diagram. A product manager describes behavior that was never implemented exactly as described. Over months and years, the gap between documentation and reality widens until non-code artifacts become unreliable or actively misleading.

Code as Truth resolves this divergence by establishing a clear hierarchy: the code wins. This is not an ideological preference but a practical recognition of how software systems work. The compiler, interpreter, or runtime executes the code, not the documentation. Users experience the behavior defined by the code, not the behavior described in the wiki. Security vulnerabilities exist in the code, not in the architecture diagram. Performance characteristics emerge from the code, not from the design document.

This principle has profound implications for how teams organize their work. If the code is truth, then reading code is a primary research skill, not a fallback when documentation is missing. If the code is truth, then keeping documentation synchronized with code is an ongoing engineering challenge, not an administrative task. If the code is truth, then code quality directly determines how readable and understandable the truth is -- poorly written code is an obscured truth, not just an aesthetic deficiency.

The principle also intersects with [Code as Hypothesis](/glossary/code-as-hypothesis/) in an important way: the code is the truth about what the system does, but that truth is provisional. The system may be doing the wrong thing. The code tells you what *is*; testing, review, and production observation tell you whether what *is* matches what *should be*.

## Technical Details

### The Documentation Drift Problem

Documentation drift is the inevitable divergence between non-code artifacts and actual system behavior. Studies consistently find that documentation accuracy decays exponentially with time since the last synchronization:

| Time Since Last Sync | Typical Accuracy | Risk Level |
|---------------------|------------------|------------|
| **0-1 week** | 95-100% | Low -- documentation likely current |
| **1-4 weeks** | 80-95% | Medium -- spot-check critical claims |
| **1-3 months** | 50-80% | High -- treat as unreliable |
| **3-12 months** | 20-50% | Critical -- likely misleading |
| **1+ years** | <20% | Dangerous -- may describe a different system |

The drift accelerates in systems with high change velocity. The Prismatic Platform, with its generational evolution model and hundreds of commits per month, would experience catastrophic documentation drift if it relied on manually maintained specifications.

### Executable Documentation Strategies

The Code as Truth principle motivates strategies that derive documentation from code rather than maintaining it separately:

```elixir
defmodule PrismaticApi.EndpointScanner do
  @moduledoc """
  Automatically discovers all public API endpoints by scanning
  Prismatic facade modules at boot time. The endpoint catalog
  IS the code -- no separate documentation to maintain.

  This module implements Code as Truth by making the API spec
  a direct derivation of the actual module structure rather
  than a manually authored artifact that could drift.
  """

  @spec scan_all_modules() :: {:ok, [endpoint()]} | {:error, term()}
  def scan_all_modules do
    modules = Application.loaded_applications()
    |> Enum.flat_map(&discover_facade_modules/1)
    |> Enum.flat_map(&extract_public_functions/1)
    |> Enum.map(&build_endpoint_spec/1)

    {:ok, modules}
  end

  @spec extract_public_functions(module()) :: [function_spec()]
  defp extract_public_functions(module) do
    case Code.fetch_docs(module) do
      {:docs_v1, _, :elixir, _, module_doc, _, function_docs} ->
        function_docs
        |> Enum.filter(&public_and_documented?/1)
        |> Enum.map(fn {{:function, name, arity}, _, _, doc, _} ->
          specs = fetch_typespecs(module, name, arity)
          %{module: module, name: name, arity: arity, doc: doc, specs: specs}
        end)

      _ ->
        []
    end
  end

  @spec fetch_typespecs(module(), atom(), non_neg_integer()) :: [term()]
  defp fetch_typespecs(module, name, arity) do
    case Code.Typespec.fetch_specs(module) do
      {:ok, specs} ->
        specs
        |> Enum.filter(fn {{n, a}, _} -> n == name and a == arity end)
        |> Enum.map(fn {_, spec} -> spec end)

      :error ->
        []
    end
  end
end
```

### Self-Documenting Code Patterns

When code is truth, making that truth readable becomes paramount. Self-documenting patterns reduce the need for separate documentation:

```elixir
defmodule Prismatic.SecurityRating do
  @moduledoc """
  Calculates security ratings for domains using evidence-based scoring.

  Rating grades follow the standard scale:
  - A (850-900): Exceptional security posture
  - B (750-849): Strong with minor gaps
  - C (600-749): Adequate with notable risks
  - D (400-599): Below average, significant risks
  - F (300-399): Critical security deficiencies

  The scoring algorithm weights evidence by recency (time decay),
  source independence, and confidence level per NABLA axioms.
  """

  @type grade :: :A | :B | :C | :D | :F
  @type score :: 300..900

  @grade_thresholds %{
    A: 850,
    B: 750,
    C: 600,
    D: 400,
    F: 300
  }

  @spec rate(String.t()) :: {:ok, %{grade: grade(), score: score()}} | {:error, term()}
  def rate(domain) when is_binary(domain) do
    with {:ok, evidence} <- collect_evidence(domain),
         {:ok, weighted} <- apply_nabla_weights(evidence),
         {:ok, score} <- calculate_composite_score(weighted),
         {:ok, grade} <- score_to_grade(score) do
      {:ok, %{grade: grade, score: score, evidence_count: length(evidence)}}
    end
  end

  @spec score_to_grade(score()) :: {:ok, grade()} | {:error, :invalid_score}
  defp score_to_grade(score) when score in 300..900 do
    grade =
      @grade_thresholds
      |> Enum.sort_by(fn {_grade, threshold} -> threshold end, :desc)
      |> Enum.find_value(fn {grade, threshold} ->
        if score >= threshold, do: grade
      end)

    {:ok, grade || :F}
  end

  defp score_to_grade(_score), do: {:error, :invalid_score}
end
```

In this example, the code IS the documentation. The typespecs define the contract. The module doc describes the behavior. The guard clauses enforce constraints. The pattern matching reveals the control flow. A separate specification would only risk drifting from this truth.

### Typespecs as Truth

[Typespecs](/glossary/typespec/) in Elixir serve as machine-verifiable documentation that cannot drift from the implementation because [Dialyzer](/glossary/dialyzer/) validates them:

```elixir
# The typespec IS the API contract -- not a comment, not a wiki page
@spec process_payment(payment_request()) ::
        {:ok, payment_result()} | {:error, payment_error()}

# Dialyzer will catch if the implementation returns something
# the spec does not describe -- the truth self-corrects
```

When typespecs are enforced through Dialyzer (as they are in the Prismatic Platform), they become a form of executable documentation: specifications that are automatically verified against the code they describe. This is Code as Truth taken to its logical conclusion -- the documentation is the code, and the code is checked by the compiler.

### Version Control as Historical Truth

Git provides a complete, immutable history of every truth the system has ever embodied. When combined with the Code as Truth principle, version control becomes an authoritative record:

```bash
# What did the authentication flow look like 6 months ago?
# Don't check the wiki -- check the code.
git log --since="6 months ago" --until="5 months ago" \
  -- apps/prismatic_web/lib/prismatic_web/plugs/auth.ex

# When did the payment calculation change?
# Don't ask in Slack -- ask git.
git log -p --follow -- apps/prismatic/lib/prismatic/payment.ex

# Who made this decision and why?
# Check the commit message, not the meeting notes.
git blame apps/prismatic_perimeter/lib/prismatic_perimeter/security_rating.ex
```

## Implementation in Prismatic Platform

### Architectural Enforcement

The Prismatic Platform implements Code as Truth through several architectural decisions that eliminate documentation-code divergence:

**Auto-Introspecting API**: The [Prismatic API](/glossary/api/) gateway does not maintain a separate API specification. Instead, it scans all `Prismatic*` facade modules at boot time, extracts their public functions, maps their typespecs to OpenAPI schemas, and generates the API documentation automatically. The documentation IS the code.

**CLAUDE.md as Executable Instructions**: The platform's development protocols are encoded in `CLAUDE.md` files that Claude Code reads and follows. These are not aspirational guidelines -- they are executed instructions that directly govern behavior. When the `CLAUDE.md` says "run `mix quality.gates` before committing," that is what happens.

**Quality DNA Auto-Generation**: Each application's quality state is captured in `.claude/quality-dna/current-state.json`, auto-generated from actual analysis runs rather than manually maintained.

### Code Reading as Primary Skill

The platform's Git Trees system optimizes for code reading, recognizing it as the primary research method when code is truth:

```bash
# Find the truth about how EASM discovery works
./scripts/git-trees.sh find "discover.*easm"

# Read the actual implementation -- this IS the specification
mix git_trees list apps/prismatic_perimeter/lib/prismatic_perimeter/

# Trace the truth across the codebase
mix git_trees find "security_rating"
```

### OpenApiSpex as Derived Truth

The REST API specification is derived directly from code, not authored separately:

```elixir
defmodule PrismaticApi.TypeMapper do
  @moduledoc """
  Maps Elixir @spec AST to OpenAPI JSON Schema.
  This is the mechanism by which code becomes documentation --
  the spec IS the code's type information, extracted and formatted.
  """

  @spec elixir_type_to_openapi(term()) :: {:ok, map()} | {:error, term()}
  def elixir_type_to_openapi({:type, _, :binary, []}) do
    {:ok, %{"type" => "string"}}
  end

  def elixir_type_to_openapi({:type, _, :integer, []}) do
    {:ok, %{"type" => "integer"}}
  end

  def elixir_type_to_openapi({:type, _, :float, []}) do
    {:ok, %{"type" => "number", "format" => "float"}}
  end

  def elixir_type_to_openapi({:type, _, :boolean, []}) do
    {:ok, %{"type" => "boolean"}}
  end

  def elixir_type_to_openapi({:type, _, :list, [inner_type]}) do
    with {:ok, inner_schema} <- elixir_type_to_openapi(inner_type) do
      {:ok, %{"type" => "array", "items" => inner_schema}}
    end
  end

  def elixir_type_to_openapi({:type, _, :map, fields}) do
    properties =
      fields
      |> Enum.reduce(%{}, fn {{:atom, _, key}, value_type}, acc ->
        case elixir_type_to_openapi(value_type) do
          {:ok, schema} -> Map.put(acc, Atom.to_string(key), schema)
          {:error, _} -> acc
        end
      end)

    {:ok, %{"type" => "object", "properties" => properties}}
  end

  def elixir_type_to_openapi(unknown) do
    {:error, {:unmapped_type, unknown}}
  end
end
```

### Comment Accuracy Through Static Analysis

[Credo](/glossary/credo/) checks verify that documentation aligns with code. Missing `@moduledoc`, undocumented public functions, and mismatched documentation are flagged as violations. This keeps the documentation layer of the code honest:

```elixir
# Credo enforces documentation presence
# If the code IS the truth, it must be readable truth

# These will trigger Credo violations:
defmodule Undocumented do           # Missing @moduledoc
  def public_function(x), do: x    # Missing @doc and @spec
end

# This is compliant -- the truth is self-describing:
defmodule Documented do
  @moduledoc "Transforms input data for downstream processing."

  @doc "Normalizes the input string to lowercase UTF-8."
  @spec normalize(String.t()) :: {:ok, String.t()} | {:error, :invalid_encoding}
  def normalize(input) when is_binary(input) do
    case String.valid?(input) do
      true -> {:ok, String.downcase(input)}
      false -> {:error, :invalid_encoding}
    end
  end
end
```

## Comparison with Alternatives

| Approach | Source of Truth | Strengths | Weaknesses |
|----------|----------------|-----------|------------|
| **Code as Truth** | Source code | Always accurate, machine-executable, version-controlled | Can be hard to read; requires code literacy |
| **Spec-Driven Development** | Formal specification (OpenAPI, Protobuf) | Clear contracts, language-independent | Spec can drift from implementation |
| **Documentation-First** | Written documentation | Accessible to non-developers, rich context | Fastest to drift, hardest to maintain |
| **Test-Driven Truth** | Test suite | Verifiable, executable | Tests can be wrong or incomplete |
| **Model-Driven** | UML/architecture models | Visual, abstract | Models rarely match reality at detail level |
| **Contract-Driven** | Interface contracts | Enforceable boundaries | Only covers interfaces, not internals |

### When Code as Truth Falls Short

The principle has limitations. Code tells you *what* the system does but not always *why*. Strategic decisions, business context, regulatory motivations, and historical reasoning are poorly captured in code alone. This is why the Prismatic Platform uses:

- Commit messages for *why* a change was made
- `@moduledoc` / `@doc` for *why* a module or function exists
- `CLAUDE.md` for *why* certain conventions are enforced
- Session context files for *why* architectural decisions were chosen
- AIAD agent specifications for *why* agents have their capabilities

The code is truth about behavior; surrounding artifacts provide truth about intent.

## Best Practices

### Make the Truth Readable

If code is the authoritative source, invest in making it readable. Use descriptive names, small functions, clear module boundaries, and self-documenting patterns:

```elixir
# The truth is obscured:
def p(d) do
  d |> Enum.map(&(&1 * 1.21)) |> Enum.sum()
end

# The truth is clear:
@vat_rate 1.21

@spec calculate_total_with_vat([number()]) :: float()
def calculate_total_with_vat(line_items) do
  line_items
  |> Enum.map(&apply_vat/1)
  |> Enum.sum()
end

defp apply_vat(amount), do: amount * @vat_rate
```

### Derive Documentation from Code

Whenever possible, generate documentation artifacts from the code itself rather than maintaining them separately. The Prismatic Platform's auto-introspecting API, auto-generated quality DNA, and typespec-derived schemas all follow this pattern.

### Use Typespecs Religiously

Typespecs are the bridge between code-as-truth and machine-verifiable documentation. With Dialyzer enforcement, they become specifications that cannot drift:

```elixir
@type domain_scan_result :: %{
  domain: String.t(),
  assets: [asset()],
  vulnerabilities: [vulnerability()],
  rating: SecurityRating.t(),
  scanned_at: DateTime.t()
}
```

### Version the Truth

Use git as your system of record. Conventional commit messages, meaningful branch names, and atomic commits create a navigable history of how the truth evolved.

### Keep Comments About "Why", Not "What"

The code already says what it does (it IS the truth about what). Comments should explain why decisions were made, what alternatives were considered, and what constraints apply:

```elixir
# BAD: Restating the truth (the code already says this)
# Multiply amount by 1.21
def with_vat(amount), do: amount * 1.21

# GOOD: Explaining why (context the code cannot express)
# Czech VAT rate as of 2026. Updated annually per MF decree.
# See: https://www.mfcr.cz/cs/dane/dan-z-pridane-hodnoty
@czech_vat_rate 1.21
def with_vat(amount), do: amount * @czech_vat_rate
```

## Common Pitfalls

### Treating Code as Self-Evident

Code is truth, but not all truth is self-evident. Complex algorithms, non-obvious business rules, and performance-critical optimizations need explanatory documentation even when the code is the authority. The principle says code is the source of truth for behavior, not that it communicates intent without help.

### Documentation Nihilism

Some teams misinterpret Code as Truth as "documentation is worthless." This is a dangerous overcorrection. External documentation serves different audiences (product managers, support teams, new developers) and different purposes (onboarding, strategic context, troubleshooting guides). The principle establishes hierarchy, not exclusion.

### Ignoring Documentation Debt

When documentation exists but has drifted from the code, it becomes actively harmful -- worse than no documentation at all, because it misleads. Teams should either keep documentation synchronized or explicitly mark it as potentially outdated.

### Code Obfuscation

If the code is truth, then obfuscated or cleverly compressed code makes the truth inaccessible. Prioritize readability over cleverness. The most maintainable codebase is one where any developer can read the code and understand the system's behavior.

### Conflating "What Is" with "What Should Be"

Code as Truth says the code defines what the system *does*. It does not say the system is doing the *right thing*. Tests, reviews, and production monitoring determine whether the truth is acceptable. A system can be perfectly self-consistent and still incorrect from a business perspective.

## Use Cases

### Onboarding New Developers

New team members who learn to read code directly (rather than relying on potentially outdated documentation) build accurate mental models faster. The code cannot lie about its own behavior.

### Incident Response

During production incidents, responders need to understand what the system is actually doing, not what it was designed to do. Reading the deployed code provides ground truth when specifications and architecture diagrams may describe an idealized version.

### Compliance Audits

Auditors need to verify what the system actually does with sensitive data. The code provides the definitive answer, supported by automated tests that demonstrate the claimed behavior.

### API Integration

When integrating with a system, the actual API behavior (derived from code) matters more than the documented behavior. Systems that generate API specs from code (like Prismatic's OpenApiSpex integration) ensure integrators see the truth.

### Architecture Recovery

When documentation has drifted to the point of uselessness, code archeology -- reading the actual implementation -- is the only reliable way to understand the system. Tools like `git blame`, dependency analysis, and call graph generation reconstruct the architecture from truth.

## Related Concepts

- [Code Quality](/glossary/code-quality/) -- determines how readable and navigable the truth is
- [Documentation](/glossary/documentation/) -- supplementary artifacts that provide context around the code truth
- [Specification](/glossary/specification/) -- a description of intended behavior that may drift from the code truth
- [Code as Hypothesis](/glossary/code-as-hypothesis/) -- complementary principle: the code truth is provisional
- [Typespec](/glossary/typespec/) -- machine-verifiable documentation embedded in the code
- [Credo](/glossary/credo/) -- enforces that the code truth is well-structured and readable
- [Static Analysis](/glossary/static-analysis/) -- automated verification of code properties
- [Refactoring](/glossary/refactoring/) -- improving how the truth is expressed without changing its meaning
- [Clean Run](/glossary/clean-run/) -- the standard that the code truth compiles without warnings
- [No Mercy No Doubts](/glossary/no-mercy-no-doubts/) -- doctrine that the truth must be fully verified
- [Technical Debt](/glossary/technical-debt/) -- the cost of truth that has become difficult to read or modify
- [Formal Verification](/glossary/formal-verification/) -- mathematical proof of properties the truth must hold

## See Also

- [Dialyzer](/glossary/dialyzer/) -- validates typespecs against the code truth through success typing
- [Quality Gate](/glossary/quality-gate/) -- automated verification that the truth meets standards
- [Pre-commit Hooks](/glossary/pre-commit-hooks/) -- enforcement that the truth is validated before recording
- [Development Workflow](/glossary/development-workflow/) -- the process through which truth is authored and verified
- [AIAD](/glossary/aiad/) -- the standard that structures truth about agent capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
