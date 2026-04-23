+++
title = "Rule-Based Reasoning"
description = "A knowledge representation and inference methodology that applies explicit if-then rules to derive conclusions, enforce policies, and automate decisions from structured domain knowledge."
weight = 50

[extra]
category = "epistemic"
tags = ["rule-based-reasoning", "epistemic", "inference", "knowledge-representation", "policy-enforcement", "decision-making", "automation", "expert-systems"]
related_terms = ["bayesian-reasoning", "trinity-gate", "axiom-enforcement", "quality-gate", "policy", "credo", "static-analysis", "confidence-scoring", "contradiction-preservation", "doctrine"]
date_created = "2026-02-22"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "19 min"
difficulty = "intermediate"
quality_score = 95
version = "1.0.0"
tldr = "Rule-based reasoning applies explicit if-then rules to facts to derive conclusions, enforce policies, and automate decisions -- forming the deterministic enforcement backbone of the Prismatic Platform's quality gates, NABLA axioms, and doctrine compliance."
word_count = 1077
date_modified = "2026-02-23"
keywords = ["Rule-Based", "Reasoning", "knowledge", "representation", "inference", "methodology", "applies", "explicit", "glossary", "epistemic"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Rule-Based Reasoning - Prismatic Platform"
+++

## Definition

Rule-based reasoning is a computational approach to knowledge representation and inference that encodes domain knowledge as a collection of explicit conditional rules (typically in if-then form) and applies these rules to known facts to derive new conclusions, trigger actions, or enforce constraints. Each rule expresses a relationship between conditions (antecedents) and consequences (consequents): when the conditions are satisfied by the current state of knowledge, the rule "fires" and its consequences take effect.

The approach has deep roots in artificial intelligence, originating with expert systems in the 1970s and 1980s (MYCIN for medical diagnosis, DENDRAL for chemical analysis, R1/XCON for computer configuration). While machine learning and neural networks have since dominated AI headlines, rule-based reasoning remains indispensable in domains requiring explainability, auditability, and deterministic behavior -- precisely the properties needed for security enforcement, compliance validation, and quality assurance. When a system must explain exactly why a decision was made (not just what decision was made), rule-based reasoning provides the traceable inference chain that probabilistic methods cannot.

In the Prismatic Platform, rule-based reasoning forms the deterministic backbone of the enforcement infrastructure: [quality gates](@/glossary/quality-gate.md) apply rules to code metrics to determine pass/fail, [Credo](@/glossary/credo.md) checks apply pattern-matching rules to AST nodes to detect code quality issues, the [Trinity Gate](@/glossary/trinity-gate.md) applies logical consistency rules to epistemic claims, and [NABLA axiom enforcement](@/glossary/axiom-enforcement.md) applies hard rules to belief states. Each of these systems derives its authority from explicit, auditable rules rather than opaque statistical models.

## Anatomy of a Rule

A rule consists of three components that together express a complete unit of domain knowledge:

| Component | Also Called | Purpose | Example |
|-----------|-----------|---------|---------|
| **Antecedent** | Condition, premise, LHS | Facts that must be true for the rule to fire | `compilation_warnings > 0` |
| **Consequent** | Action, conclusion, RHS | What happens when the rule fires | `block_commit()` |
| **Priority** | Salience, weight | Determines firing order when multiple rules match | `priority: 100` (highest first) |

```
RULE: zero-warning-policy
  IF compilation_warnings > 0
  AND target_environment == :production
  THEN block_commit("Zero warnings required for production code")
  PRIORITY: 100
```

### Forward Chaining vs. Backward Chaining

Rule-based systems use two primary inference strategies:

| Strategy | Direction | Mechanism | Use Case |
|----------|----------|-----------|----------|
| **Forward Chaining** | Data-driven | Start with known facts, apply rules to derive conclusions | Monitoring, alerting, quality gates |
| **Backward Chaining** | Goal-driven | Start with a hypothesis, find rules that could prove it | Diagnosis, explanation, compliance verification |
| **Hybrid** | Both | Combine forward and backward chaining | Complex expert systems |

The Prismatic Platform primarily uses forward chaining: known facts (code metrics, test results, scan findings) are fed into rule engines that fire matching rules to produce conclusions (pass/fail decisions, quality scores, compliance assessments). Backward chaining is used in diagnostic contexts, such as when the [autoheal](@/glossary/autoheal.md) system traces a quality violation backward through rules to identify root causes.

## Rule Categories in Prismatic

The platform organizes its rules into distinct categories with different enforcement levels:

| Category | Engine | Rule Count | Enforcement | Example |
|----------|--------|-----------|-------------|---------|
| **Quality Gates** | `mix quality.gates` | 13 domains | BLOCKING | Zero compilation warnings |
| **Credo Checks** | `mix credo --strict` | 150+ checks | BLOCKING | Consistent naming, no TODO without context |
| **Forbidden Patterns** | `mix quality.forbidden_patterns` | 6 categories | BLOCKING/WARN | No mocks in lib/, no stubs |
| **Pre-Commit Rules** | `.githooks/pre-commit` | 11 phases | BLOCKING | Template validation, design consistency |
| **NABLA Axioms** | Trinity Gate | 7 axioms | BLOCKING (hard) / WARN (soft) | Signal plurality, contradiction preservation |
| **Doctrine Rules** | NM/ND enforcement | 10 principles | BLOCKING | Complete execution, zero tolerance |
| **Performance Rules** | `mix performance.check` | 5 metrics | BLOCKING | Page load < 250ms |

## Implementation in Elixir

The Prismatic Platform implements rule-based reasoning through pattern matching, behaviours, and composable rule modules. Elixir's pattern matching is a natural fit for rule antecedents, and its protocol system enables extensible rule engines:

```elixir
defmodule PrismaticQuality.RuleEngine do
  @moduledoc """
  Forward-chaining rule engine for quality gate evaluation.
  Rules are evaluated in priority order against collected facts.
  """

  @type fact :: {atom(), term()}
  @type rule_result :: :pass | {:fail, String.t()} | {:warn, String.t()}

  defmodule Rule do
    @moduledoc false
    @enforce_keys [:name, :priority, :condition, :action]
    defstruct [:name, :priority, :condition, :action, :category, :description]

    @type t :: %__MODULE__{
      name: atom(),
      priority: non_neg_integer(),
      condition: (map() -> boolean()),
      action: (map() -> rule_result()),
      category: atom(),
      description: String.t()
    }
  end

  @spec evaluate([Rule.t()], map()) :: %{passed: [atom()], failed: [atom()], warnings: [atom()]}
  def evaluate(rules, facts) do
    rules
    |> Enum.sort_by(& &1.priority, :desc)
    |> Enum.reduce(%{passed: [], failed: [], warnings: []}, fn rule, acc ->
      if rule.condition.(facts) do
        case rule.action.(facts) do
          :pass ->
            emit_telemetry(:rule_passed, rule)
            %{acc | passed: [rule.name | acc.passed]}

          {:fail, reason} ->
            emit_telemetry(:rule_failed, rule, reason)
            %{acc | failed: [{rule.name, reason} | acc.failed]}

          {:warn, reason} ->
            emit_telemetry(:rule_warned, rule, reason)
            %{acc | warnings: [{rule.name, reason} | acc.warnings]}
        end
      else
        %{acc | passed: [rule.name | acc.passed]}
      end
    end)
  end

  defp emit_telemetry(event, rule, reason \\ nil) do
    :telemetry.execute(
      [:prismatic, :quality, :rule_engine, event],
      %{count: 1},
      %{rule: rule.name, category: rule.category, reason: reason}
    )
  end
end
```

### Defining Quality Gate Rules

Quality gates are expressed as rule structs that encode domain-specific policies:

```elixir
defmodule PrismaticQuality.Rules.CompilationRules do
  @moduledoc "Rules governing compilation quality standards."

  alias PrismaticQuality.RuleEngine.Rule

  @spec rules() :: [Rule.t()]
  def rules do
    [
      %Rule{
        name: :zero_warnings,
        priority: 100,
        category: :compilation,
        description: "Production code must compile with zero warnings",
        condition: fn facts -> Map.has_key?(facts, :compilation_warnings) end,
        action: fn facts ->
          case facts.compilation_warnings do
            0 -> :pass
            n -> {:fail, "#{n} compilation warning(s) detected"}
          end
        end
      },
      %Rule{
        name: :dialyzer_clean,
        priority: 95,
        category: :compilation,
        description: "Dialyzer must report zero type violations",
        condition: fn facts -> Map.has_key?(facts, :dialyzer_violations) end,
        action: fn facts ->
          case facts.dialyzer_violations do
            0 -> :pass
            n -> {:fail, "#{n} Dialyzer violation(s) detected"}
          end
        end
      },
      %Rule{
        name: :credo_strict,
        priority: 90,
        category: :quality,
        description: "All Credo checks must pass in strict mode",
        condition: fn facts -> Map.has_key?(facts, :credo_issues) end,
        action: fn facts ->
          case facts.credo_issues do
            0 -> :pass
            n -> {:fail, "#{n} Credo issue(s) in strict mode"}
          end
        end
      }
    ]
  end
end
```

## NABLA Axiom Rules

The platform's [NABLA epistemic framework](@/glossary/axiom-enforcement.md) encodes its seven non-negotiable axioms as rules with hard and soft enforcement levels:

```elixir
defmodule PrismaticNabla.AxiomRules do
  @moduledoc "Rule definitions for NABLA epistemic axiom enforcement."

  alias PrismaticQuality.RuleEngine.Rule

  @spec rules() :: [Rule.t()]
  def rules do
    [
      %Rule{
        name: :signal_plurality,
        priority: 100,
        category: :nabla_hard,
        description: "Minimum 2 independent signals required for any belief",
        condition: fn facts -> Map.has_key?(facts, :belief_signals) end,
        action: fn %{belief_signals: signals} ->
          if length(signals) >= 2 do
            :pass
          else
            {:fail, "Signal plurality violated: #{length(signals)} signal(s), minimum 2 required"}
          end
        end
      },
      %Rule{
        name: :contradiction_preservation,
        priority: 100,
        category: :nabla_hard,
        description: "Contradictory evidence must be preserved, never discarded",
        condition: fn facts -> Map.has_key?(facts, :contradictions) end,
        action: fn %{contradictions: contradictions, resolved_contradictions: resolved} ->
          discarded = contradictions -- resolved
          suppressed = Enum.filter(discarded, & &1.suppressed)

          if Enum.empty?(suppressed) do
            :pass
          else
            {:fail, "#{length(suppressed)} contradiction(s) suppressed without resolution"}
          end
        end
      },
      %Rule{
        name: :provenance_mandatory,
        priority: 95,
        category: :nabla_hard,
        description: "All beliefs must be traceable to their source",
        condition: fn facts -> Map.has_key?(facts, :beliefs) end,
        action: fn %{beliefs: beliefs} ->
          untraced = Enum.filter(beliefs, fn b -> is_nil(b.provenance) end)

          if Enum.empty?(untraced) do
            :pass
          else
            {:fail, "#{length(untraced)} belief(s) without provenance"}
          end
        end
      },
      %Rule{
        name: :time_decay,
        priority: 90,
        category: :nabla_hard,
        description: "All beliefs must carry timestamps for freshness evaluation",
        condition: fn facts -> Map.has_key?(facts, :beliefs) end,
        action: fn %{beliefs: beliefs} ->
          undated = Enum.filter(beliefs, fn b -> is_nil(b.timestamp) end)

          if Enum.empty?(undated) do
            :pass
          else
            {:fail, "#{length(undated)} belief(s) without timestamps"}
          end
        end
      }
    ]
  end
end
```

## Credo as a Rule Engine

[Credo](@/glossary/credo.md) is the Prismatic Platform's primary [static analysis](@/glossary/static-analysis.md) tool, and it operates as a rule-based reasoning system. Each Credo check is a rule that pattern-matches against Elixir AST nodes to detect code quality issues:

| Check Category | Rule Count | Examples | Enforcement |
|---------------|-----------|---------|-------------|
| **Consistency** | 20+ | Consistent parameter patterns, naming | Warning / Error |
| **Readability** | 25+ | Max line length, function complexity | Warning |
| **Refactoring** | 15+ | Nesting depth, cyclomatic complexity | Warning |
| **Design** | 10+ | Alias usage, duplicate code | Warning |
| **Warning** | 15+ | Unused variables, deprecated functions | Error |
| **Custom (Regression)** | 5+ | Hardcoded CI values, unsafe function references | Error |

The Prismatic Platform extends Credo with custom checks in `apps/prismatic_credo/`:

```elixir
defmodule PrismaticCredo.Check.Regression.HardcodedCIValues do
  @moduledoc """
  Detects hardcoded CI-specific values that should use environment
  variables or configuration.

  This is a regression prevention rule: once a hardcoded CI value
  has been fixed, this rule ensures it never returns.
  """
  use Credo.Check,
    base_priority: :high,
    category: :warning,
    explanations: [
      check: "Hardcoded CI values create environment coupling."
    ]

  @impl Credo.Check
  def run(%SourceFile{} = source_file, params) do
    issue_meta = IssueMeta.for(source_file, params)

    Credo.Code.prewalk(source_file, &traverse(&1, &2, issue_meta))
  end

  defp traverse({:@, _, [{name, meta, [value]}]} = ast, issues, issue_meta)
       when is_binary(value) do
    if ci_value?(value) and not allowed_context?(name) do
      {ast, [issue_for(issue_meta, meta[:line], value) | issues]}
    else
      {ast, issues}
    end
  end

  defp traverse(ast, issues, _issue_meta), do: {ast, issues}
end
```

## Rule Conflict Resolution

When multiple rules fire simultaneously with conflicting conclusions, the engine uses a conflict resolution strategy:

| Strategy | Description | When Used |
|----------|------------|----------|
| **Priority** | Highest priority rule wins | Default strategy in quality gates |
| **Specificity** | Most specific antecedent wins | Credo check precedence |
| **Recency** | Most recently asserted fact triggers | Continuous monitoring |
| **First Match** | First matching rule wins, others skipped | Pre-commit phase ordering |
| **All Must Pass** | All rules must pass (no conflict resolution) | Trinity Gate, NABLA axioms |

The Prismatic Platform's quality gates use the "all must pass" strategy -- there is no conflict resolution because all 13 quality domains must independently pass. A single failure blocks the operation regardless of how many other rules pass.

## Pre-Commit Rule Pipeline

The pre-commit hook implements an 11-phase rule pipeline that evaluates code changes before allowing a commit:

| Phase | Rule Category | Check | Enforcement |
|-------|-------------|-------|-------------|
| 1 | File safety | Large file detection (>1MB) | BLOCK |
| 2 | Security | Secret/credential detection | BLOCK |
| 3 | Compilation | `mix compile --warnings-as-errors` | BLOCK |
| 4 | Static analysis | `mix credo --strict` | BLOCK |
| 5 | Type checking | Dialyzer on changed files | BLOCK |
| 6 | Testing | `mix test` on affected tests | BLOCK |
| 7 | Quality gates | `mix quality.gates` | BLOCK |
| 8 | Templates | Promo template validation | BLOCK |
| 9 | Forbidden patterns | Mock/stub/placeholder detection | BLOCK |
| 10 | Design consistency | Flowbite sidebar validation | BLOCK |
| 11 | Documentation | CLAUDE.md presence check | WARN |

Each phase is itself a rule: if the condition (phase applies to changed files) is met, the action (run the check) executes. Phases run sequentially so that fast checks (file safety, secret detection) fail early before slower checks (compilation, testing).

## Rule-Based vs. Probabilistic Reasoning

Rule-based reasoning and [probabilistic/Bayesian reasoning](@/glossary/bayesian-reasoning.md) are complementary approaches with distinct strengths:

| Dimension | Rule-Based | Probabilistic |
|-----------|-----------|---------------|
| **Output** | Deterministic (pass/fail) | Probabilistic (confidence %) |
| **Explainability** | Full trace (which rule, which fact) | Limited (weight contributions) |
| **Uncertainty handling** | Binary (matches or doesn't) | Continuous (posterior probabilities) |
| **Knowledge acquisition** | Manual rule authoring | Learning from data |
| **Maintenance** | Explicit rule updates | Model retraining |
| **Edge cases** | Must be explicitly encoded | Can generalize from training data |
| **Auditability** | Complete audit trail | Statistical validation |
| **Platform usage** | Quality gates, policy enforcement | [Risk scoring](@/glossary/risk-score.md), [confidence scoring](@/glossary/confidence-scoring.md) |

The Prismatic Platform uses both: rule-based reasoning for enforcement (hard pass/fail decisions) and probabilistic reasoning for assessment (confidence-weighted scores). The [Trinity Gate](@/glossary/trinity-gate.md) combines both: structural consistency uses graph-theoretic rules, logical consistency uses formal logic rules, and formal necessity uses proof-theoretic verification.

## Rule Lifecycle Management

Rules in the Prismatic Platform follow a managed lifecycle:

| Phase | Activity | Responsible | Artifact |
|-------|---------|-------------|----------|
| **Proposal** | New rule identified from bug, audit, or evolution | Agent or developer | Issue/ticket |
| **Definition** | Rule condition and action specified | Domain expert | Rule module |
| **Testing** | Rule validated against known examples | Testing agent | Test suite |
| **Deployment** | Rule added to engine configuration | CI/CD pipeline | Config update |
| **Monitoring** | Rule firing frequency and impact tracked | Telemetry system | Dashboard metrics |
| **Retirement** | Obsolete rule deactivated | Domain expert | Changelog entry |

## Context in Prismatic

Rule-based reasoning is the enforcement mechanism that gives the Prismatic Platform's doctrines and policies their teeth. The NO MERCY, NO DOUBTS doctrine articulates principles; rule-based reasoning translates those principles into executable checks that run on every commit, every build, and every deployment. The 13-domain [quality gate](@/glossary/quality-gate.md) system, the [pre-commit hooks](@/glossary/pre-commit-hooks.md), the [NABLA axiom enforcement](@/glossary/axiom-enforcement.md), and the [forbidden pattern detection](@/glossary/quality-gate.md) are all rule-based systems that operate deterministically on observable facts about the codebase.

This deterministic foundation is what enables the platform to maintain its 100/100 quality score across 141 umbrella applications and ~2.8M lines of code. Rules do not forget, do not get tired, and do not make exceptions -- they fire every time their conditions are met, which is exactly the behavior required for NO MERCY enforcement.

## Related Terms

- [Bayesian Reasoning](@/glossary/bayesian-reasoning.md) -- Probabilistic complement to deterministic rule-based reasoning
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-layer verification system combining rule-based checks
- [Quality Gate](@/glossary/quality-gate.md) -- Rule-based pass/fail checkpoints in the development pipeline
- [Axiom Enforcement](@/glossary/axiom-enforcement.md) -- NABLA axioms encoded as non-bypassable rules
- [Credo](@/glossary/credo.md) -- Static analysis tool operating as an AST-level rule engine
- [Static Analysis](@/glossary/static-analysis.md) -- Code analysis powered by rule-based pattern matching
- [Policy](@/glossary/policy.md) -- Organizational rules governing platform behavior
- [Doctrine](@/glossary/doctrine.md) -- Foundational principles encoded as enforcement rules
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- Probabilistic scoring complementing rule-based decisions
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) -- Rule pipeline executing before every commit
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) -- NABLA axiom enforced through rules
- [Dialyzer](@/glossary/dialyzer.md) -- Type-checking tool applying type-inference rules

## See Also

- [Architecture](@/architecture/_index.md) -- Platform enforcement architecture
- [Capabilities](@/capabilities/_index.md) -- Quality and enforcement capabilities
- Glossary -- Related epistemic and quality concepts
- [Commands](@/commands/_index.md) -- Mix commands implementing rule-based checks

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
