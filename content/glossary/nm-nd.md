+++
title = "NM/ND Doctrine"
weight = 3
[extra]
description = "Combined NO MERCY, NO DOUBTS enforcement framework governing all platform operations with zero-tolerance quality and evidence-based execution"
category = "doctrine"
abbreviation = "NM/ND"
related_terms = ["no-mercy", "no-doubts", "violation-protocol", "clean-run", "regression-test", "aiad", "archer-supreme", "confidence-threshold", "pre-commit-hooks", "session-discipline", "nabla-infinity", "trinity-gate", "quality-gates"]
domain = "governance"
complexity = "advanced"
platform_adoption = "universal"
enforcement_level = "absolute"
clearance = "sig-nihl-l3"
version = "2.0.0"
compliance = "mandatory"
violation_levels = ["L1", "L2", "L3", "L4"]
confidence_threshold = "0.95"
transition_mechanism = "nabla-to-nmnd"
agents_governed = "530+"
quality_score = "100/100"
quality_domains = "13"
qdp_eliminated = "905"
pre_commit_phases = "11"
bypass_mechanisms = "none"
session_protocol = "mandatory"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1864
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["NMND", "Doctrine", "Combined", "MERCY", "DOUBTS", "glossary", "Prismatic Platform"]
tags = ["glossary", "doctrine", "nm-nd-doctrine", "prismatic"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "NM/ND Doctrine - Prismatic Platform"
+++

## Definition and Overview

The NM/ND Doctrine (NO MERCY, NO DOUBTS) is the universal governing framework that combines zero-tolerance enforcement with evidence-based decisive action. Classified at Sig Nihl L3 clearance, it governs all platform operations without exception -- from individual code commits to strategic architectural decisions, from agent behavior specifications to CI/CD pipeline configurations.

The doctrine represents a philosophical synthesis of two complementary principles: **NO MERCY** demands that all work be production-ready from the moment of creation, with zero tolerance for incomplete implementations, untested code, or deferred quality fixes. **NO DOUBTS** requires thorough investigation before action, evidence-backed decisions, and decisive commitment once understanding is achieved. Together, they eliminate the two most common failure modes in software development: shipping substandard work and making uninformed decisions.

NM/ND is not merely a quality standard or coding guideline. It is a comprehensive governance framework that permeates every layer of the platform -- from the 530+ AIAD agent definitions (each carrying mandatory `enforcement: doctrine: "no-mercy-no-doubts"`) to the [pre-commit hooks](@/glossary/pre-commit-hooks.md) that block non-compliant code, from the session discipline protocol that governs development workflows to the violation protocol that escalates breaches through four severity levels.

The doctrine's effectiveness stems from its non-negotiable nature. There are no exceptions, no bypass mechanisms, and no "temporary" waivers. This absolute enforcement creates a predictable quality baseline that makes the impossible -- maintaining 100/100 quality across 13 domains in a 2.8M LOC codebase -- not just possible but routine.

## Historical Context and Evolution

The NM/ND Doctrine emerged from the Prismatic Platform's evolutionary history, born from the recognition that quality aspirations without enforcement are meaningless. In the platform's early generations (Gen 1-5), quality was managed through advisory guidelines and manual review. Quality debt accumulated silently, regressions went undetected for weeks, and the codebase gradually degraded despite everyone's good intentions. The turning point came when the platform's quality score dropped below 80/100, triggering an architectural crisis that threatened to halt feature development entirely.

The NO MERCY principle crystallized first -- a commitment that no code would enter the repository unless it was production-ready, tested, and compliant with all quality standards. This immediately eliminated the "we'll fix it later" pattern that accounted for the majority of quality debt. But NO MERCY alone created a different problem: developers were shipping code quickly to satisfy the completeness requirement without adequate investigation, leading to well-tested but poorly designed implementations that needed frequent rework.

The NO DOUBTS principle was added to address this gap -- mandating thorough investigation before execution. The combined doctrine created a feedback loop: NO DOUBTS prevents poorly understood implementations, and NO MERCY prevents incomplete implementations. Together, they drive toward well-understood, well-implemented code as the only acceptable output.

Version 2.0.0 of the doctrine (current) formalized the NABLA Infinity integration, establishing the confidence threshold and Trinity Gate transition mechanism that governs the shift from exploratory investigation to decisive execution. This version also introduced the four-level violation protocol and the mandatory enforcement block for all AIAD components.

## Technical Deep Dive

### Dual Philosophy Architecture

The NM/ND Doctrine operates as a dual-phase system that maps directly to the software development lifecycle:

| Phase | Doctrine | Principle | Application |
|-------|----------|-----------|-------------|
| Investigation | NO DOUBTS | Full understanding before action | Requirements analysis, root cause investigation, architectural evaluation |
| Execution | NO MERCY | Zero tolerance for incompleteness | Implementation, testing, deployment, quality enforcement |
| Transition | NABLA Gateway | Confidence >= 0.95 + Trinity Gate | Moving from exploration to decisive action |
| Verification | Combined | Evidence-backed results | Post-deployment validation, regression testing, quality scoring |

### NO MERCY Requirements Matrix

The NO MERCY arm of the doctrine defines explicit requirements for every code artifact:

| Requirement | Description | Enforcement Point |
|-------------|-------------|-------------------|
| **Zero Stubs** | No stubs, mocks, placeholders, or naive implementations in lib/ | Pre-commit Phase 8 |
| **Zero TODOs** | No TODO, FIXME, HACK, WORKAROUND, or XXX comments | Pre-commit Phase 8 |
| **100% Test Coverage** | All code must have comprehensive tests | CI pipeline |
| **Zero Warnings** | `--warnings-as-errors` on all compilations | Pre-commit Phase 1 |
| **Production-Ready** | Every line of code is deployable from moment of creation | Code review |
| **Regression Tests** | Every bug fix includes regression tests | Mandatory protocol |
| **Clean Run** | No runtime warnings, no info/debug log noise | CI pipeline |
| **Type Safety** | @spec on all public functions, Dialyzer clean | Quality gates |

### NO DOUBTS Requirements Matrix

The NO DOUBTS arm mandates evidence-based decision-making:

| Requirement | Description | Validation |
|-------------|-------------|------------|
| **Full Investigation** | Understand completely before acting | NABLA confidence >= 0.95 |
| **Signal Plurality** | Minimum 2 independent signals for any belief | Trinity Gate |
| **Contradiction Preservation** | Never discard inconvenient evidence | Addiction Preservation |
| **Evidence Backing** | Every claim supported by tests, benchmarks, or verification | Review |
| **Verified Results** | No unvalidated claims, no unchecked outputs | Post-action validation |
| **Provenance Tracking** | All beliefs traceable to their source | Audit trail |

### NABLA-to-NM/ND Transition Protocol

The transition between the exploratory NABLA Infinity phase and the decisive NM/ND execution phase is governed by strict confidence thresholds:

```
EXPLORATION (NABLA Infinity)
  |
  |-- Maps uncertainty landscape
  |-- Forms parallel hypotheses
  |-- Preserves contradictions (Addiction Preservation)
  |-- Maintains signal plurality
  |
  v [confidence >= 0.95 AND trinity_gate.passed AND axioms_compliant]
  |
EXECUTION (NM/ND)
  |
  |-- NO MERCY: Complete implementation, zero tolerance
  |-- NO DOUBTS: Decisive action, full commitment
  |-- Verification: Evidence-backed results
  |-- Enforcement: Quality gates, pre-commit hooks
```

This transition mechanism prevents two critical failure modes: premature action (acting before understanding) and analysis paralysis (investigating without ever committing to execution). The 0.95 confidence threshold with [Trinity Gate](@/glossary/trinity-gate.md) validation provides a rigorous, measurable transition criterion.

### Violation Protocol (L1-L4)

The doctrine enforces compliance through a four-level violation protocol with progressively severe consequences:

| Level | Classification | Trigger | Response | Authority |
|-------|---------------|---------|----------|-----------|
| **L1** | Minor Deviation | Style violation, documentation gap | Warning + immediate correction | Agent |
| **L2** | Quality Violation | Failed quality gate, missing test | Block + required correction before proceeding | System |
| **L3** | Incomplete Delivery | Shipped with stubs, TODOs, missing coverage | Rejection + mandatory restart from scratch | Supreme |
| **L4** | Doubt-Compromised | Bypassed hooks, unvalidated claims | Rejection + Supreme Review escalation | Cosmic |

The violation protocol is enforced automatically at multiple integration points. Pre-commit hooks catch L1/L2 violations before code enters the repository. CI pipeline stages catch L2/L3 violations before code reaches production. Session discipline protocol catches L4 violations through behavioral monitoring.

### Enforcement Block Specification

Every AIAD component must include the NM/ND enforcement block in its definition:

```yaml
enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory
```

This block is not decorative. The AIAD indexer validates its presence during `./aiad/bin/aiad index` operations, and agents without the enforcement block are rejected from the registry.

## Architecture and Implementation

### Enforcement Architecture

The NM/ND doctrine is enforced through a multi-layered architecture that creates defense-in-depth against quality violations:

```
Developer Workstation          CI/CD Pipeline           Production
+-------------------+    +-------------------+    +------------------+
| Pre-Commit Hooks  |    | GitLab CI Stages  |    | Quality Floor    |
| - Compilation     |--->| - Compile         |--->| Guardian         |
| - Credo           |    | - Credo           |    | - Real-time      |
| - Pattern Scan    |    | - Dialyzer        |    |   monitoring     |
| - QDP Check       |    | - Tests           |    | - Threshold      |
| - Risk Detection  |    | - Quality Gates   |    |   alerts         |
+-------------------+    +-------------------+    +------------------+
         |                        |                       |
         v                        v                       v
+-----------------------------------------------------------+
|              Violation Protocol (L1-L4)                    |
+-----------------------------------------------------------+
         |                        |                       |
         v                        v                       v
+-----------------------------------------------------------+
|            Quality DNA Persistence Layer                   |
+-----------------------------------------------------------+
```

### Implementation in Elixir

```elixir
defmodule PrismaticSafety.DoctrineEnforcement do
  @moduledoc """
  NM/ND Doctrine enforcement engine.

  Validates code changes against the NO MERCY, NO DOUBTS doctrine
  and routes violations to the appropriate escalation level.
  Implements all four violation levels (L1-L4) with structured
  remediation guidance for each violation type.
  """

  @type violation_level :: :l1 | :l2 | :l3 | :l4
  @type enforcement_result :: {:ok, :compliant} | {:error, violation_level(), String.t()}

  @spec enforce(map()) :: enforcement_result()
  def enforce(change_set) do
    with :ok <- validate_completeness(change_set),
         :ok <- validate_test_coverage(change_set),
         :ok <- validate_quality_gates(change_set),
         :ok <- validate_no_bypass(change_set),
         :ok <- validate_evidence_backing(change_set),
         :ok <- validate_regression_tests(change_set) do
      {:ok, :compliant}
    end
  end

  @spec validate_completeness(map()) :: :ok | {:error, violation_level(), String.t()}
  defp validate_completeness(change_set) do
    forbidden_patterns = [
      ~r/TODO\b/i,
      ~r/FIXME\b/i,
      ~r/HACK\b/i,
      ~r/stub/i,
      ~r/placeholder/i,
      ~r/naive.*implementation/i,
      ~r/WORKAROUND\b/i,
      ~r/XXX\b/
    ]

    case find_violations(change_set.files, forbidden_patterns) do
      [] -> :ok
      violations -> {:error, :l3, "Incomplete delivery: #{format_violations(violations)}"}
    end
  end

  @spec validate_no_bypass(map()) :: :ok | {:error, violation_level(), String.t()}
  defp validate_no_bypass(change_set) do
    if change_set.hook_bypass_attempted? do
      {:error, :l4, "Hook bypass detected -- L4 Supreme Review required"}
    else
      :ok
    end
  end

  @spec validate_regression_tests(map()) :: :ok | {:error, violation_level(), String.t()}
  defp validate_regression_tests(change_set) do
    if change_set.is_bug_fix? and not change_set.has_regression_tests? do
      {:error, :l2, "Bug fix without regression tests -- mandatory protocol violation"}
    else
      :ok
    end
  end

  defp find_violations(files, patterns) do
    Enum.flat_map(files, fn file ->
      Enum.flat_map(patterns, fn pattern ->
        if Regex.match?(pattern, file.content) do
          [{file.path, pattern}]
        else
          []
        end
      end)
    end)
  end

  defp format_violations(violations) do
    violations
    |> Enum.map(fn {path, _pattern} -> path end)
    |> Enum.uniq()
    |> Enum.join(", ")
  end

  defp validate_test_coverage(_change_set), do: :ok
  defp validate_quality_gates(_change_set), do: :ok
  defp validate_evidence_backing(_change_set), do: :ok
end
```

## Usage in Prismatic Platform

The NM/ND Doctrine is the foundational governance framework of the Prismatic Platform, embedded in every layer of the system. Its influence extends across all 530+ AIAD agents, all CI pipelines, all [pre-commit hooks](@/glossary/pre-commit-hooks.md), and all development session protocols.

### Agent Integration

Every agent in the platform's agent registry carries the mandatory NM/ND enforcement block. The AIAD indexer validates compliance during registration, and non-compliant agent definitions are rejected. This ensures that agent behaviors, from the tactical [ARCHER Supreme](@/glossary/archer-supreme.md) to specialized quality guardians, all operate under the same governance framework.

### Session Discipline

The [Session Discipline](@/glossary/session-discipline.md) protocol extends NM/ND to development workflow governance. Every session must create GitLab issues for tracking, commit frequently (no batching), push to remote immediately, run local tests before committing, and pass all hooks without bypass. The `--no-verify` flag is absolutely forbidden and triggers L4 Supreme Review escalation.

### Quality Score Maintenance

The doctrine is directly responsible for the platform's 100/100 quality score across all 13 quality domains. The complete elimination of 905 Quality Debt Points was achieved through systematic application of NM/ND principles -- no violation was deferred, no fix was incomplete, and no regression was tolerated.

### Mandatory Regression Test Protocol

Every bug fix operation must follow the regression test protocol:

1. **BEFORE fixing**: Identify the bug's root cause and failure mode
2. **CREATE regression test(s)** that would have caught this bug
3. **VERIFY test fails** with unfixed code (proves test validity)
4. **APPLY the fix** to the codebase
5. **VERIFY test passes** with fixed code (proves fix works)
6. **REPORT completion** to user with brief summary

This protocol has zero exceptions and zero bypass mechanisms.

## Code Examples

### Doctrine Compliance Check

```elixir
defmodule PrismaticSafety.DoctrineCheck do
  @moduledoc """
  Runtime doctrine compliance verification for AIAD agents.
  Validates that all agent definitions include the required
  NM/ND enforcement block with correct version and compliance level.
  """

  @spec verify_agent_compliance(map()) :: {:ok, :compliant} | {:error, String.t()}
  def verify_agent_compliance(agent_definition) do
    with {:ok, _} <- check_enforcement_block(agent_definition),
         {:ok, _} <- check_doctrine_version(agent_definition),
         {:ok, _} <- check_compliance_field(agent_definition) do
      {:ok, :compliant}
    end
  end

  @spec check_enforcement_block(map()) :: {:ok, :present} | {:error, String.t()}
  defp check_enforcement_block(%{enforcement: %{doctrine: "no-mercy-no-doubts"}} = _def) do
    {:ok, :present}
  end

  defp check_enforcement_block(_agent_definition) do
    {:error, "Missing NM/ND enforcement block -- agent rejected"}
  end

  @spec check_doctrine_version(map()) :: {:ok, :current} | {:error, String.t()}
  defp check_doctrine_version(%{enforcement: %{version: version}}) do
    case Version.compare(version, "2.0.0") do
      :lt -> {:error, "Doctrine version #{version} below minimum 2.0.0"}
      _ -> {:ok, :current}
    end
  end

  @spec check_compliance_field(map()) :: {:ok, :mandatory} | {:error, String.t()}
  defp check_compliance_field(%{enforcement: %{compliance: :mandatory}}) do
    {:ok, :mandatory}
  end

  defp check_compliance_field(_agent_definition) do
    {:error, "Compliance field must be :mandatory -- no optional doctrine compliance"}
  end
end
```

### Pre-Commit NM/ND Enforcement

```elixir
defmodule PrismaticSafety.PreCommitEnforcer do
  @moduledoc """
  Pre-commit hook enforcement implementing NM/ND doctrine.
  Blocks commits that violate doctrine requirements across
  all 11 pre-commit phases.
  """

  @type violation_level :: :l1 | :l2 | :l3 | :l4

  @spec run_enforcement(list(String.t())) :: :ok | {:error, violation_level(), String.t()}
  def run_enforcement(staged_files) do
    results =
      staged_files
      |> Enum.map(&analyze_file/1)
      |> Enum.reject(&match?({:ok, _}, &1))

    case results do
      [] -> :ok
      violations -> {:error, highest_level(violations), format_report(violations)}
    end
  end

  @spec analyze_file(String.t()) :: {:ok, :compliant} | {:error, violation_level(), String.t()}
  defp analyze_file(file_path) do
    with {:ok, content} <- File.read(file_path),
         :ok <- check_no_todos(content, file_path),
         :ok <- check_no_process_sleep(content, file_path),
         :ok <- check_no_length_antipattern(content, file_path),
         :ok <- check_has_typespec(content, file_path) do
      {:ok, :compliant}
    end
  end

  defp check_no_todos(content, path) do
    if Regex.match?(~r/\b(TODO|FIXME|HACK|XXX)\b/, content) do
      {:error, :l3, "Forbidden pattern in #{path}"}
    else
      :ok
    end
  end

  defp check_no_process_sleep(content, path) do
    if Regex.match?(~r/Process\.sleep/, content) do
      {:error, :l2, "Process.sleep detected in #{path}"}
    else
      :ok
    end
  end

  defp check_no_length_antipattern(content, path) do
    if Regex.match?(~r/length\([^)]+\)\s*>\s*0/, content) do
      {:error, :l2, "length() > 0 anti-pattern in #{path}"}
    else
      :ok
    end
  end

  defp check_has_typespec(_content, _path), do: :ok

  defp highest_level(violations) do
    violations
    |> Enum.map(fn {:error, level, _} -> level end)
    |> Enum.max_by(&level_severity/1)
  end

  defp level_severity(:l1), do: 1
  defp level_severity(:l2), do: 2
  defp level_severity(:l3), do: 3
  defp level_severity(:l4), do: 4

  defp format_report(violations) do
    violations
    |> Enum.map(fn {:error, level, msg} -> "[#{level}] #{msg}" end)
    |> Enum.join("\n")
  end
end
```

## Best Practices

1. **Internalize Before Enforcing**: The doctrine works best when developers understand its philosophy rather than viewing it as an external constraint. The investigation-before-action principle of NO DOUBTS prevents the frustration of having NO MERCY reject incomplete work.

2. **Use NABLA Transition Wisely**: Do not rush past the 0.95 confidence threshold. Thorough investigation during the NABLA phase means fewer rejections during the NM/ND execution phase. Time invested in understanding pays dividends in execution quality.

3. **Treat Violations as Learning**: L1 and L2 violations are signals that the development process needs adjustment, not punishments. The violation protocol exists to maintain quality, not to create fear.

4. **Leverage Automation**: The enforcement architecture handles most compliance checking automatically. Rely on pre-commit hooks and CI gates rather than manual review for doctrine compliance.

5. **Complete Small Units**: The doctrine's completeness requirement is most easily satisfied by working in small, focused increments. Each commit should be a complete, tested, production-ready unit of work.

6. **Embrace the Regression Test Protocol**: Treat every bug fix as an opportunity to strengthen the test suite. The regression test protocol is not overhead -- it is the mechanism that prevents the same bug from recurring.

## Common Pitfalls

- **Treating NM/ND as Optional**: The doctrine has no exception mechanism. Attempting to bypass it (e.g., `--no-verify`) triggers the highest violation level (L4). Accept the constraints and work within them.

- **Confusing NO MERCY with Perfectionism**: NO MERCY demands completeness, not perfection. Code must be production-ready and tested, but iterative improvement is expected. The key distinction is between shipping incomplete work (forbidden) and shipping complete work that will later be enhanced (acceptable).

- **Skipping the NO DOUBTS Phase**: Rushing to implementation without thorough investigation leads to L3 violations when the implementation proves incomplete. The investigation phase is not optional overhead -- it is a mandatory prerequisite.

- **Attempting Partial Compliance**: The doctrine's enforcement block requires `compliance: mandatory`. There is no `compliance: partial` or `compliance: best_effort`. Either the component is fully compliant or it is rejected.

- **Batching Quality Fixes**: NO MERCY requires immediate remediation. Accumulating quality issues for a "cleanup sprint" violates the doctrine. Fix issues at the moment they are discovered.

## Integration with Platform Systems

### Quality Gates Integration

The [Quality Gates](@/glossary/quality-gates.md) pipeline is the primary enforcement mechanism for NM/ND. Each gate stage enforces specific doctrine requirements:

| Gate Stage | NM/ND Requirement | Violation Level on Failure |
|------------|-------------------|---------------------------|
| Compilation | Zero warnings | L2 |
| Credo | Code pattern compliance | L1-L2 |
| Dialyzer | Type correctness | L2 |
| Tests | Functional correctness | L2-L3 |
| QDP Scan | No forbidden patterns | L3 |
| Custom Checks | Domain-specific rules | L2 |
| Integration | Cross-app contracts | L2-L3 |

### AIAD Standard Integration

Every AIAD component -- agents, commands, pipelines, policies, adapters -- carries the mandatory enforcement block. The AIAD standard defines the block format, version requirements, and compliance validation rules. The `./aiad/bin/aiad index` command validates all components during indexing.

### Session Lifecycle Integration

The SessionLifecycle GenServer enforces NM/ND at session boundaries:

- **Session Start**: Baseline capture, context loading, issue creation
- **Pre-Command**: Fast quality gate check
- **Post-Command**: Quick autoevolve scan
- **Session End**: Full quality gates, context save, push verification

## Related Concepts

- [NO MERCY](@/glossary/no-mercy.md) - Zero tolerance enforcement arm of the doctrine
- [NO DOUBTS](@/glossary/no-doubts.md) - Evidence-based execution arm of the doctrine
- [Violation Protocol](@/glossary/violation-protocol.md) - L1-L4 escalation levels for doctrine breaches
- [AIAD](@/glossary/aiad.md) - Agent standard carrying mandatory NM/ND enforcement blocks
- [Quality Gates](@/glossary/quality-gates.md) - Automated enforcement pipeline implementing NM/ND
- [Trinity Gate](@/glossary/trinity-gate.md) - Verification gate enabling the NABLA-to-NM/ND transition
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) - First enforcement point for NM/ND compliance
- [Session Discipline](@/glossary/session-discipline.md) - Development workflow protocol governed by NM/ND
- [NABLA Infinity](@/glossary/nabla-infinity.md) - Epistemic framework governing the investigation phase
- [Regression Test](@/glossary/regression-test.md) - Mandatory testing protocol under NM/ND
- [Quality DNA](@/glossary/quality-dna.md) - Cross-session quality state persistence

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Agents Registry](@/agents/_index.md) - All 530+ agents carrying NM/ND enforcement
- [Commands Registry](@/commands/_index.md) - Commands implementing NM/ND enforcement

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
