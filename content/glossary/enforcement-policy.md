+++
title = "Enforcement Policy"
weight = 50
[extra]
tags = ["glossary", "quality", "policy", "enforcement", "governance", "doctrine", "compliance", "automation"]
description = "Formal rules defining how quality, security, and doctrinal standards are enforced across a platform, including violation levels, remediation requirements, and automated blocking mechanisms that prevent non-compliant code from entering production"
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate-to-advanced"
domain_category = "Quality Engineering"
related_concepts = ["policy", "no-mercy-no-doubts", "quality-gate", "violation-protocol", "clean-run", "zero-warning-policy", "pre-commit-hooks"]
implementation_status = "production"
authority_level = "platform-wide"
difficulty_rating = 5
prerequisites = ["policy", "quality-gate", "no-mercy-no-doubts"]
learning_path = ["policy", "quality-gate", "enforcement-policy", "violation-protocol", "clean-run"]
interactive_demos = ["/labs/glossary/enforcement-policy"]
code_examples = ["Policy enforcement GenServer", "Violation detection module", "Pre-commit gate implementation"]
external_resources = ["https://hexdocs.pm/credo/overview.html", "https://hexdocs.pm/dialyxir/readme.html", "https://semver.org/"]
version_introduced = "gen-5"
stability_level = "stable"
testing_scenarios = ["Policy compliance verification", "Violation detection accuracy", "Escalation path testing", "Auto-remediation validation", "Hook bypass prevention"]
keywords = ["enforcement", "policy", "quality", "compliance", "gates", "hooks", "violations", "doctrine", "governance", "automation"]
related_terms = ["policy", "no-mercy-no-doubts", "quality-gate", "violation-protocol", "clean-run", "zero-warning-policy", "pre-commit-hooks", "regression-testing", "audit-trail", "axiom-enforcement"]
word_count = 1614
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Enforcement Policy - Prismatic Platform"
+++

## Definition

An **enforcement policy** is a formal, machine-readable specification that defines how quality, security, and doctrinal standards are maintained across a software platform. Unlike advisory guidelines that suggest best practices, enforcement policies are binding: they specify exact conditions that must be met, the consequences of violations at each severity level, and the automated mechanisms that detect and block non-compliant changes before they reach production. An enforcement policy transforms aspirational standards into operational reality by removing human discretion from compliance decisions.

In the Prismatic Platform, enforcement policies govern every aspect of the development lifecycle -- from the [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) doctrine that mandates zero tolerance for incomplete implementations, through 11-phase [pre-commit hooks](@/glossary/pre-commit-hooks.md) that block non-compliant commits, to [quality gates](@/glossary/quality-gate.md) that prevent degradation of the platform's 100/100 quality score.

## Overview

The concept of enforcement in software engineering has evolved significantly over the past two decades. Early approaches relied on code review checklists and manual inspection -- processes that were thorough but slow and inconsistent. The shift toward automated enforcement began with linting tools and continued through CI/CD pipelines, but most platforms still treat enforcement as advisory rather than mandatory.

The Prismatic Platform takes enforcement to its logical conclusion: every standard has an automated check, every check has blocking authority, and no human can bypass the enforcement without explicit escalation protocols. This approach eliminates the "broken windows" effect where small violations accumulate into systemic quality degradation.

### The Enforcement Hierarchy

Enforcement policies operate at multiple levels of the platform:

1. **Doctrinal Level**: The [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) doctrine establishes the philosophical foundation -- zero tolerance for incomplete work, full investigation before action, evidence-based decisions.

2. **Policy Level**: Individual policies (`*.policy.md` files in `.aiad/policies/`) codify specific rules for domains like forbidden patterns, Elixir best practices, page load performance, and Flowbite sidebar layouts.

3. **Gate Level**: [Quality gates](@/glossary/quality-gate.md) implement policies as executable checks that return pass/fail results. The `mix quality.gates` command runs all gates in sequence.

4. **Hook Level**: [Pre-commit hooks](@/glossary/pre-commit-hooks.md) enforce gates at the point of commit, preventing non-compliant code from entering version control.

5. **CI Level**: Continuous integration pipelines provide a second enforcement layer, catching anything that might slip past local hooks.

### Violation Severity Model

The platform uses a four-level violation severity model that maps directly to the [violation protocol](@/glossary/violation-protocol.md):

| Level | Name | Trigger | Automated Response | Human Response |
|-------|------|---------|-------------------|----------------|
| **L1** | Minor | Style deviation, naming issue | Warning in output | Immediate correction expected |
| **L2** | Quality | Compilation warning, missing spec | Commit blocked | Required correction before retry |
| **L3** | Delivery | Incomplete implementation, stub code | Commit rejected, restart required | Work item flagged for review |
| **L4** | Integrity | Doctrine violation, hook bypass attempt | Full rejection, supreme review | Escalation to platform authority |

## Technical Details

### Policy Specification Format

Prismatic enforcement policies are written as structured Markdown documents with YAML enforcement blocks. Each policy specifies its scope, rules, violation levels, and remediation procedures:

```elixir
defmodule Prismatic.Quality.PolicyEnforcer do
  @moduledoc """
  Evaluates enforcement policies against code changes.
  Determines compliance status and generates violation
  reports with remediation guidance.
  """

  @type policy :: %{
    name: String.t(),
    version: String.t(),
    scope: :platform | :application | :module,
    rules: [rule()],
    enforcement_level: :advisory | :warning | :blocking
  }

  @type rule :: %{
    id: String.t(),
    description: String.t(),
    pattern: Regex.t() | (String.t() -> boolean()),
    severity: :l1 | :l2 | :l3 | :l4,
    auto_fix: boolean(),
    message: String.t()
  }

  @type violation :: %{
    rule_id: String.t(),
    file: String.t(),
    line: non_neg_integer() | nil,
    severity: :l1 | :l2 | :l3 | :l4,
    message: String.t(),
    suggestion: String.t() | nil
  }

  @type enforcement_result ::
    {:pass, []} | {:warn, [violation()]} | {:block, [violation()]}

  @spec enforce(policy(), [String.t()]) :: enforcement_result()
  def enforce(%{rules: rules, enforcement_level: level}, changed_files) do
    violations =
      changed_files
      |> Enum.flat_map(fn file ->
        Enum.flat_map(rules, fn rule ->
          check_rule(rule, file)
        end)
      end)
      |> Enum.sort_by(& &1.severity)

    case {level, violations} do
      {_, []} ->
        {:pass, []}

      {:advisory, violations} ->
        {:warn, violations}

      {:warning, violations} ->
        if Enum.any?(violations, &(&1.severity in [:l3, :l4])) do
          {:block, violations}
        else
          {:warn, violations}
        end

      {:blocking, violations} ->
        {:block, violations}
    end
  end

  @spec check_rule(rule(), String.t()) :: [violation()]
  defp check_rule(%{pattern: pattern} = rule, file) when is_struct(pattern, Regex) do
    case File.read(file) do
      {:ok, content} ->
        content
        |> String.split("\n")
        |> Enum.with_index(1)
        |> Enum.flat_map(fn {line, line_number} ->
          if Regex.match?(pattern, line) do
            [%{
              rule_id: rule.id,
              file: file,
              line: line_number,
              severity: rule.severity,
              message: rule.message,
              suggestion: nil
            }]
          else
            []
          end
        end)

      {:error, _} ->
        []
    end
  end

  defp check_rule(%{pattern: check_fn} = rule, file) when is_function(check_fn, 1) do
    case File.read(file) do
      {:ok, content} ->
        if check_fn.(content) do
          [%{
            rule_id: rule.id,
            file: file,
            line: nil,
            severity: rule.severity,
            message: rule.message,
            suggestion: nil
          }]
        else
          []
        end

      {:error, _} ->
        []
    end
  end
end
```

### Pre-Commit Enforcement Pipeline

The Prismatic Platform's pre-commit hook runs an 11-phase enforcement pipeline. Each phase evaluates specific policies and can block the commit:

```elixir
defmodule Prismatic.Quality.PreCommitPipeline do
  @moduledoc """
  Orchestrates the 11-phase pre-commit enforcement pipeline.
  Each phase runs independently and reports violations.
  A blocking violation in any phase halts the pipeline.
  """

  @type phase :: %{
    number: pos_integer(),
    name: String.t(),
    enforcer: module(),
    blocking: boolean()
  }

  @type pipeline_result ::
    {:ok, :all_passed}
    | {:error, :blocked, phase(), [Prismatic.Quality.PolicyEnforcer.violation()]}

  @phases [
    %{number: 1, name: "Compilation Warnings", enforcer: CompilationEnforcer, blocking: true},
    %{number: 2, name: "Credo Strict", enforcer: CredoEnforcer, blocking: true},
    %{number: 3, name: "Secret Detection", enforcer: SecretEnforcer, blocking: true},
    %{number: 4, name: "Forbidden Patterns", enforcer: ForbiddenPatternEnforcer, blocking: true},
    %{number: 5, name: "Typespec Coverage", enforcer: TypespecEnforcer, blocking: true},
    %{number: 6, name: "Test Execution", enforcer: TestEnforcer, blocking: true},
    %{number: 7, name: "Dialyzer", enforcer: DialyzerEnforcer, blocking: true},
    %{number: 8, name: "Template Validation", enforcer: TemplateEnforcer, blocking: true},
    %{number: 9, name: "Quality Floor", enforcer: QualityFloorEnforcer, blocking: true},
    %{number: 10, name: "Design Consistency", enforcer: DesignEnforcer, blocking: true},
    %{number: 11, name: "Regression Prevention", enforcer: RegressionEnforcer, blocking: true}
  ]

  @spec run([String.t()]) :: pipeline_result()
  def run(changed_files) do
    Enum.reduce_while(@phases, {:ok, :all_passed}, fn phase, _acc ->
      case apply(phase.enforcer, :check, [changed_files]) do
        {:pass, []} ->
          {:cont, {:ok, :all_passed}}

        {:warn, violations} ->
          report_warnings(phase, violations)
          {:cont, {:ok, :all_passed}}

        {:block, violations} when phase.blocking ->
          report_blocking(phase, violations)
          {:halt, {:error, :blocked, phase, violations}}

        {:block, violations} ->
          report_warnings(phase, violations)
          {:cont, {:ok, :all_passed}}
      end
    end)
  end

  @spec report_warnings(phase(), [map()]) :: :ok
  defp report_warnings(phase, violations) do
    IO.puts("\n  Phase #{phase.number} (#{phase.name}): #{length(violations)} warning(s)")

    Enum.each(violations, fn v ->
      IO.puts("    #{v.severity}: #{v.file}:#{v.line || "?"} - #{v.message}")
    end)
  end

  @spec report_blocking(phase(), [map()]) :: :ok
  defp report_blocking(phase, violations) do
    IO.puts("\n  BLOCKED at Phase #{phase.number} (#{phase.name})")

    Enum.each(violations, fn v ->
      IO.puts("    #{v.severity}: #{v.file}:#{v.line || "?"} - #{v.message}")
    end)
  end
end
```

### Forbidden Patterns Enforcement

One of the most critical enforcement policies prevents mocks, stubs, placeholders, and other forbidden patterns from entering the codebase:

```elixir
defmodule Prismatic.Quality.ForbiddenPatternEnforcer do
  @moduledoc """
  Detects and blocks forbidden code patterns including mocks,
  stubs, placeholders, hardcoded CI values, and naive
  implementations.
  """

  @type category :: :mocks | :stubs | :placeholders | :naive | :localhost | :test_skips
  @type pattern_rule :: {category(), Regex.t(), :block | :warn, String.t()}

  @forbidden_patterns [
    {:mocks, ~r/Mox\.defmock/, :block, "Mox.defmock forbidden in lib/ - use real implementations"},
    {:stubs, ~r/raise\s+"not implemented"/, :block, "Stub implementation forbidden"},
    {:stubs, ~r/raise\s+:not_implemented/, :block, "Stub implementation forbidden"},
    {:placeholders, ~r/#\s*PLACEHOLDER/, :block, "PLACEHOLDER comments forbidden"},
    {:placeholders, ~r/#\s*STUB/, :block, "STUB comments forbidden"},
    {:placeholders, ~r/#\s*FIXME/, :block, "FIXME comments forbidden - fix immediately"},
    {:placeholders, ~r/#\s*HACK/, :block, "HACK comments forbidden"},
    {:placeholders, ~r/#\s*XXX/, :block, "XXX comments forbidden"},
    {:naive, ~r/#\s*naive/, :block, "Naive implementation comments forbidden"},
    {:naive, ~r/#\s*temporary/, :block, "Temporary code markers forbidden"},
    {:naive, ~r/#\s*quick and dirty/, :block, "Quick-and-dirty markers forbidden"},
    {:localhost, ~r/"http:\/\/localhost/, :warn, "Hardcoded localhost URL detected"},
    {:test_skips, ~r/@tag\s+:skip/, :warn, "Test skip without issue reference"}
  ]

  @whitelisted_paths [
    "lib/mix/tasks/quality/",
    "prismatic_credo/",
    "config/",
    "garden/",
    "deps/",
    "_build/"
  ]

  @spec check([String.t()]) ::
    {:pass, []} | {:warn, [map()]} | {:block, [map()]}
  def check(changed_files) do
    violations =
      changed_files
      |> Enum.reject(&whitelisted?/1)
      |> Enum.flat_map(&scan_file/1)

    blocking = Enum.filter(violations, &(&1.action == :block))
    warnings = Enum.filter(violations, &(&1.action == :warn))

    cond do
      length(blocking) > 0 -> {:block, blocking ++ warnings}
      length(warnings) > 0 -> {:warn, warnings}
      true -> {:pass, []}
    end
  end

  @spec whitelisted?(String.t()) :: boolean()
  defp whitelisted?(path) do
    Enum.any?(@whitelisted_paths, &String.contains?(path, &1))
  end

  @spec scan_file(String.t()) :: [map()]
  defp scan_file(file) do
    case File.read(file) do
      {:ok, content} ->
        Enum.flat_map(@forbidden_patterns, fn {category, pattern, action, message} ->
          if Regex.match?(pattern, content) do
            [%{
              file: file,
              category: category,
              action: action,
              message: message,
              severity: if(action == :block, do: :l2, else: :l1)
            }]
          else
            []
          end
        end)

      {:error, _} ->
        []
    end
  end
end
```

## Implementation in Prismatic Platform

### Policy Registry

The platform maintains 20+ enforcement policies in `.aiad/policies/`, each governing a specific domain:

| Policy | Domain | Enforcement |
|--------|--------|-------------|
| `no-mercy-no-doubts-enforcement.policy.md` | Doctrine | L4 blocking |
| `forbidden-patterns-enforcement.policy.md` | Code quality | L2 blocking |
| `elixir-best-practices.policy.md` | Language standards | L2 blocking |
| `page-load-performance.policy.md` | Performance | L3 blocking |
| `flowbite-sidebar-layout.policy.md` | UI consistency | L2 blocking |
| `universal-app-quality-standard.policy.md` | App compliance | L2 blocking |
| `red-team-safety.policy.md` | Security operations | L4 blocking |

### Quality Floor Guardian

The Quality Floor Guardian is an autonomous enforcement agent that monitors the platform's quality score and triggers escalation when degradation is detected:

- **100-99%**: OPTIMAL -- monitor only
- **98-99%**: WARNING -- alert and investigation
- **95-98%**: CRITICAL -- auto-evolution trigger
- **Below 95%**: EMERGENCY -- block commits and escalate

This guardian enforces the policy that quality can never regress, only improve or remain constant.

### Mandatory Regression Test Protocol

The regression test protocol is an enforcement policy with absolute authority (P0). Every bug fix must:

1. Identify root cause before fixing
2. Create regression test(s) that would have caught the bug
3. Verify test fails without the fix
4. Apply the fix
5. Verify test passes with the fix
6. Report completion with structured output

This policy is enforced through code review, CI/CD validation, and the [clean run](@/glossary/clean-run.md) requirement.

### Session Discipline Enforcement

The Session Discipline Protocol enforces operational standards on every development session: GitLab issue tracking, continuous commits, push to remote, local testing, and all hooks passing. The `--no-verify` flag is absolutely forbidden -- any usage triggers L4 supreme review.

## Comparison with Alternatives

| Approach | Enforcement Level | Prismatic Comparison |
|----------|------------------|---------------------|
| **Code Review Only** | Advisory | Prismatic uses reviews AND automated blocking |
| **Linting (ESLint/Credo)** | Warning/Error | Prismatic integrates linting as one phase of 11 |
| **CI/CD Gates** | Post-push blocking | Prismatic blocks at pre-commit (earlier) |
| **GitHub Branch Protection** | Merge blocking | Prismatic blocks at commit (even earlier) |
| **Feature Flags** | Runtime gating | Prismatic prevents bad code from existing at all |
| **Manual Checklists** | Human-dependent | Prismatic removes human discretion entirely |

The key differentiator is enforcement point. Most platforms enforce at the CI/CD or merge level, meaning non-compliant code exists in branches for minutes to hours before being caught. Prismatic enforces at the commit level, ensuring non-compliant code never enters version control at all.

## Best Practices

### Policy Design

1. **Be Specific**: Each policy should address a single, well-defined concern. A policy that tries to enforce "code quality" is too vague. A policy that enforces "zero compilation warnings" is enforceable.

2. **Make Policies Machine-Readable**: Every policy must have an automated check. If you cannot write a check for it, it is a guideline, not a policy.

3. **Define Violation Levels Explicitly**: Map each rule to a specific severity level (L1-L4). Ambiguous severity leads to inconsistent enforcement.

4. **Include Remediation Guidance**: Every violation message should tell the developer how to fix the issue, not just that an issue exists.

5. **Version Policies**: Track policy changes over time. When a policy changes, update all documentation and enforcement scripts simultaneously.

### Enforcement Implementation

1. **Fail Fast**: Place the most common and cheapest checks first in the pipeline. If compilation fails, there is no point running Dialyzer.

2. **Provide Escape Hatches Carefully**: Whitelisted paths exist for specific purposes (quality tooling, Credo checks themselves). Document every whitelist entry and review them periodically.

3. **Never Use --no-verify**: This flag bypasses all pre-commit enforcement. In the Prismatic Platform, its usage is an L4 violation.

4. **Test the Enforcement Itself**: Write tests for your enforcement scripts. A broken enforcement pipeline is worse than no enforcement, because it creates false confidence.

## Common Pitfalls

### Over-Enforcement

Enforcing too many trivial rules creates developer friction without proportional quality improvement. Every enforcement rule should justify its cost in developer time against its benefit in prevented defects.

**Mitigation**: Regularly review L1 violations. If a rule generates many warnings but catches few real issues, consider demoting it to advisory or removing it.

### Under-Enforcement

Setting policies as advisory rather than blocking means they will eventually be ignored. Unenforced policies are worse than no policies because they create a false sense of compliance.

**Mitigation**: The Prismatic approach is explicit: all phases are blocking. If a rule is important enough to write, it is important enough to enforce.

### Stale Policies

Policies that reference deprecated tools, outdated patterns, or removed features confuse developers and undermine trust in the enforcement system.

**Mitigation**: Include policy review in the generational evolution process. Each generation should audit all policies for relevance.

### Bypass Culture

If developers routinely seek workarounds for enforcement (committing from other tools, using force pushes, or disabling hooks), the enforcement system has a cultural problem, not a technical one.

**Mitigation**: Ensure policies are reasonable, well-documented, and provide clear remediation paths. The [No Mercy, No Doubts](@/glossary/no-mercy-no-doubts.md) doctrine addresses this culturally: enforcement is not optional, not debatable, and not bypassable.

## Use Cases

### Zero-Warning Compilation Enforcement

The [zero-warning policy](@/glossary/zero-warning-policy.md) demonstrates enforcement at its most straightforward: `mix compile --warnings-as-errors --force` must complete without warnings. Any warning -- unused variable, missing `@impl`, deprecated function -- blocks the commit.

### Forbidden Pattern Prevention

The forbidden patterns policy prevents entire categories of anti-patterns from entering the codebase: no mocks in production code, no stub implementations, no placeholder comments, no hardcoded CI values. This policy is enforced at Phase 4 of the pre-commit pipeline and catches patterns that would otherwise accumulate into technical debt.

### Performance Budget Enforcement

The page load performance policy enforces hard limits: 250ms total page load, 100ms server render, 150ms LiveView mount. These are not aspirational targets -- they are blocking gates. Any new page or endpoint must meet these budgets, verified through Benchee tests, before it can be committed.

### Doctrinal Compliance

The NM/ND enforcement policy ensures that the platform's philosophical foundation is maintained in code: no incomplete implementations (NO MERCY), no unvalidated claims (NO DOUBTS). This is the highest-level enforcement policy, governing not just code but the entire development process.

## Related Concepts

Enforcement policies connect to the broader quality and governance ecosystem:

- [Policy](@/glossary/policy.md) -- The parent concept; enforcement policies are a specific type of policy with blocking authority
- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) -- The doctrinal foundation that enforcement policies operationalize
- [Quality Gate](@/glossary/quality-gate.md) -- The automated check mechanism that implements enforcement policies
- [Violation Protocol](@/glossary/violation-protocol.md) -- The escalation framework for different severity levels
- [Clean Run](@/glossary/clean-run.md) -- The requirement that all enforcement checks pass without warnings or errors
- [Zero Warning Policy](@/glossary/zero-warning-policy.md) -- A specific enforcement policy targeting compilation warnings
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) -- The git-level mechanism for pre-commit enforcement
- [Regression Testing](@/glossary/regression-testing.md) -- Enforcement through test coverage of previously fixed bugs
- [Audit Trail](@/glossary/audit-trail.md) -- Recording enforcement decisions for compliance and review
- [Axiom Enforcement](@/glossary/axiom-enforcement.md) -- Enforcing the NABLA epistemic axioms

## See Also

- Glossary Index -- Complete glossary of Prismatic Platform terminology
- [AIAD](@/glossary/aiad.md) -- The agent standard that includes enforcement specifications
- [Autonomous Quality](@/glossary/autonomous-quality.md) -- Self-managing quality systems built on enforcement policies
- [Credo](@/glossary/clean-run.md) -- Static analysis tool integrated into enforcement pipeline
- [Supervision](@/glossary/supervision.md) -- OTP fault tolerance as a form of runtime enforcement

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
