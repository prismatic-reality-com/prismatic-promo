+++
title = "No Mercy, No Doubts"
weight = 3
[extra]
description = "The universal doctrine governing all Prismatic Platform operations: zero tolerance for incomplete work combined with full investigation before decisive action"
category = "doctrine"
abbreviation = "NM/ND"
date_created = "2026-02-13"
last_updated = "2026-02-13"
author = "Tomáš Korcak (korczis)"
reading_time = "8 min"
word_count = 2200
difficulty = "intermediate"
related_terms = ["no-mercy", "no-doubts", "nm-nd", "violation-protocol", "clean-run", "regression-test", "aiad", "archer-supreme", "confidence-threshold", "pre-commit-hooks", "session-discipline", "nabla-infinity", "trinity-gate", "quality-gates", "qdp", "zero-warning-policy"]
date_modified = "2026-02-23"
keywords = ["Mercy", "Doubts", "Prismatic", "Platform", "glossary", "doctrine", "Prismatic Platform", "Every"]
tags = ["glossary", "doctrine", "no-mercy-no-doubts", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "No Mercy, No Doubts - Prismatic Platform"
+++

## Definition

No Mercy, No Doubts (NM/ND) is the universal doctrine governing every operation within the Prismatic Platform. It consists of two complementary enforcement arms: **NO MERCY**, which mandates zero tolerance for incomplete implementations, untested code, quality violations, and deferred fixes; and **NO DOUBTS**, which requires full investigation and evidence-based understanding before taking action, followed by decisive and committed execution once a decision is made. Classified at Sig Nihl Level 3, the doctrine applies without exception to all code, all agents, all pipelines, and all sessions. No bypass mechanism exists. There is no "fix later," no "good enough for now," and no action taken without verified confidence.

The doctrine is not a set of guidelines or aspirational principles. It is an enforcement framework with automated tooling -- pre-commit hooks, quality gates, CI pipelines, and agent compliance checks -- that blocks non-compliant work from entering the codebase. The platform's sustained 100/100 quality score across all 13 quality domains is a direct consequence of NM/ND enforcement.

## Historical Context and Motivation

The NM/ND Doctrine emerged from a straightforward observation: quality debt compounds faster than financial debt, and deferred fixes are more expensive than immediate fixes by an order of magnitude. Early iterations of the Prismatic Platform permitted "TODO" markers, placeholder implementations, and deferred test coverage -- standard practices in most software projects. The result was predictable: accumulated technical debt that consumed more engineering time in maintenance than the original implementations saved in speed.

The doctrine was formalized as a response to this pattern. Rather than managing quality debt through periodic cleanup sprints, the platform adopted a zero-tolerance policy. Every implementation is complete or it does not merge. Every bug fix includes a regression test or it is rejected. Every compilation produces zero warnings or the commit is blocked. This approach eliminates the category of "known issues" entirely -- if an issue is known, it is fixed immediately.

The NO DOUBTS component was added to prevent the opposite failure mode: premature action based on incomplete understanding. Zero tolerance for incomplete work must be paired with thorough investigation to avoid situations where developers implement the wrong solution perfectly. NO DOUBTS ensures that the exploration phase is thorough, evidence-based, and confidence-gated before the enforcement phase begins.

## Philosophical Foundations

The NM/ND Doctrine draws from several intellectual traditions, though it does not claim philosophical novelty. Its value lies in rigorous application, not original theory.

From **stoic philosophy**, NM/ND adopts the principle that excellence is not an act but a habit. Marcus Aurelius wrote: "Waste no more time arguing about what a good man should be. Be one." The doctrine translates this into engineering terms: waste no more time debating what good code should be -- enforce it automatically. The pre-commit hook does not argue; it blocks.

From **lean manufacturing**, NM/ND adopts the concept of "jidoka" (autonomation) -- the principle that quality defects should be detected and stopped at the point of creation, not downstream. In Toyota's production system, any worker can stop the assembly line when a defect is detected. In the Prismatic Platform, any [quality gate](@/glossary/quality-gates.md) can stop a commit when a violation is detected. The cost of stopping is always less than the cost of propagating a defect.

From **military doctrine**, NM/ND adopts the principle of "commander's intent" -- clear articulation of the desired end state that enables autonomous execution. The doctrine's end state is explicit: 100/100 quality, zero warnings, zero debt, zero known issues. Every agent and every developer understands this intent and can act autonomously toward it.

## The Two Arms of the Doctrine

### NO MERCY -- Enforcement

[NO MERCY](@/glossary/no-mercy.md) governs the delivery of all code and artifacts within the platform. Its requirements are absolute:

- **Zero Tolerance**: No incomplete implementations, no stubs, no mocks used as permanent fixtures, no placeholder code, no TODO markers, no FIXME annotations. If something is written, it is finished.
- **100% Test Coverage**: All code must have comprehensive tests -- unit tests, integration tests, and property-based tests where applicable. Coverage is measured and enforced, not estimated.
- **Production-Ready from Creation**: Every line of code is production-grade from the moment it is written. There is no "development quality" versus "production quality" distinction.
- **Immediate Remediation**: Issues discovered during development, review, or runtime must be fixed immediately. There is no backlog of known defects.
- **Mandatory Regression Tests**: Every bug fix must include regression tests that would have caught the original bug. This requirement is enforced by pre-commit hooks and has no bypass mechanism.
- **Clean Run**: Every compilation must produce zero warnings (enforced via `--warnings-as-errors`), all quality gates must pass, and all static analysis tools (Credo, Dialyzer) must report clean.

The enforcement is not advisory. Pre-commit hooks block commits that violate any NO MERCY rule. CI pipelines reject pull requests that fail quality gates. The platform does not distinguish between "critical" and "minor" violations -- all violations are blocking.

### NO DOUBTS -- Epistemic Rigor

[NO DOUBTS](@/glossary/no-doubts.md) governs the decision-making process that precedes action. Its requirements complement NO MERCY by ensuring that the right problem is solved before demanding that the solution is complete:

- **Full Investigation**: Before implementing any change, the developer or agent must fully understand the problem, its root cause, its scope, and its implications. Surface-level analysis is insufficient.
- **Evidence-Based Action**: Every decision must be backed by tests, benchmarks, profiling data, or formal verification. Assertions without evidence are treated as unverified hypotheses, not facts.
- **Confidence Gating**: The transition from exploration to execution occurs only when confidence reaches the 0.95 threshold and the [Trinity Gate](@/glossary/trinity-gate.md) passes all three verification layers (structural consistency, logical consistency, and formal necessity).
- **No Unvalidated Claims**: All outputs must be verified before delivery. Claims about performance improvements must include benchmarks. Claims about bug fixes must include regression tests. Claims about security must include verification.
- **Decisive Commitment**: Once investigation is complete and confidence is established, execution proceeds with full commitment and no second-guessing. Hesitation after the confidence threshold is met is itself a violation.

The interplay between the two arms prevents both failure modes: NO MERCY prevents incomplete delivery, and NO DOUBTS prevents delivering the wrong thing completely.

## Integration with NABLA Infinity

The NM/ND Doctrine operates in conjunction with the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework. NABLA governs the exploration and hypothesis-formation phase of work, while NM/ND governs the execution and delivery phase. The transition between them is formalized:

```
EXPLORATION (NABLA: maps uncertainty, preserves contradictions, forms hypotheses)
        |
    confidence >= 0.95 AND trinity_gate.passed AND axioms_compliant
        |
EXECUTION (NM/ND: decisive action, complete delivery, zero tolerance)
```

During the NABLA phase, [contradiction preservation](@/glossary/contradiction-preservation.md) is mandatory -- conflicting evidence is maintained, not resolved prematurely. Multiple hypotheses are explored in parallel. Uncertainty is mapped explicitly rather than hidden behind false confidence. The seven NABLA axioms (Signal Plurality, Contradiction Preservation, Absence Informative, Time Decay, Unknown Valid, Source Independence, [Provenance Mandatory](@/glossary/provenance-mandatory.md)) govern this phase.

The transition to NM/ND execution occurs only when confidence crosses the 0.95 threshold and the Trinity Gate validates the conclusion through three independent verification methods. Once this transition occurs, the NM/ND enforcement rules apply in full: the implementation must be complete, tested, documented, and production-ready.

This two-phase approach prevents a common anti-pattern in software development where developers oscillate between investigation and implementation without clear boundaries. In the Prismatic Platform, the boundary is explicit, measurable, and enforced.

## Violation Protocol

Violations of the NM/ND Doctrine are classified into four severity levels, each with escalating consequences:

| Level | Description | Trigger | Consequence |
|-------|-------------|---------|-------------|
| **L1** | Minor deviation | Style violation, missing comment | Warning issued, immediate correction required |
| **L2** | Quality violation | Missing test, compilation warning | Commit blocked, correction mandatory before retry |
| **L3** | Incomplete delivery | Stub implementation, placeholder code | Commit rejected, full restart of the implementation |
| **L4** | Doubt-compromised | Action taken without evidence, unverified claim | Commit rejected, Supreme Review initiated |

The violation protocol is enforced automatically through pre-commit hooks, CI pipeline gates, and agent compliance checks. L1 and L2 violations can be resolved by the developer. L3 violations require re-implementation. L4 violations trigger an escalation to Supreme-level review, as they indicate a fundamental process failure rather than an implementation gap.

There are no exceptions to the violation protocol. The phrase "just this once" does not exist in the NM/ND framework. Emergency hotfixes, time-critical patches, and deadline-driven features all receive the same enforcement. The rationale is straightforward: emergencies are precisely when quality discipline matters most, because rushed fixes under pressure are the primary source of cascading failures.

## Agent Enforcement

Every agent in the Prismatic Platform's 530+ agent ecosystem carries a mandatory NM/ND enforcement block in its [AIAD](@/glossary/aiad.md) specification:

```yaml
enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory
```

This block is not optional metadata -- it is a required field validated during agent registration. An agent definition that omits the enforcement block will fail AIAD validation and will not be registered in the Agent Registry.

The enforcement block serves two purposes. First, it declares that the agent operates under NM/ND governance, making compliance expectations explicit to anyone reading the agent specification. Second, it enables automated compliance checking: the platform can scan all agent definitions and verify that every agent is governed by the current doctrine version.

Agents at different tier levels (L1 through L5) all carry the same enforcement block. The doctrine applies uniformly regardless of agent authority level. An [Archer Supreme](@/glossary/archer-supreme.md) L5 agent and an L1 tactical specialist are both subject to the same quality requirements.

## Automated Enforcement Infrastructure

NM/ND enforcement is implemented through multiple automated systems that operate at different stages of the development lifecycle:

**Pre-Commit Hooks**: The `.githooks/pre-commit` script runs quality checks before any commit is created. It validates zero warnings, runs affected tests, checks for forbidden patterns (TODO, FIXME, placeholder implementations), and verifies that regression tests accompany bug fixes. Commits that fail any check are blocked.

**CI Pipeline Gates**: GitLab CI pipelines enforce NM/ND at the merge request level. The pipeline runs the full test suite, Credo static analysis, Dialyzer type checking, and coverage verification. Merge requests that fail any gate cannot be merged.

**Quality Gates Task**: The `mix quality.gates` task provides a single command that runs all NM/ND checks in sequence. It is used both locally during development and in CI pipelines for automated enforcement.

**Session Discipline Protocol**: Every development session must create GitLab issues for tracking, commit frequently (no batching), push all commits to the remote, verify changes locally before committing, and pass all hooks without bypass flags. The `--no-verify` flag is absolutely forbidden.

**Quality Floor Guardian**: An autonomous monitoring system that tracks quality metrics across all 13 domains. If quality drops below the 100/100 threshold, the guardian triggers auto-healing processes and escalates to the appropriate level.

## Implementation in Elixir

The NM/ND Doctrine's enforcement infrastructure is itself implemented as [OTP](@/glossary/otp.md) applications within the platform:

```elixir
defmodule PrismaticSafety.DoctrineEnforcer do
  @moduledoc """
  Runtime enforcement of the NO MERCY, NO DOUBTS doctrine.
  Validates agent outputs, pipeline results, and system state
  against doctrine requirements.
  """

  use GenServer

  @type enforcement_result :: :compliant | {:violation, violation_level(), String.t()}
  @type violation_level :: :l1 | :l2 | :l3 | :l4

  @spec check_compliance(map()) :: enforcement_result()
  def check_compliance(artifact) do
    checks = [
      &check_completeness/1,
      &check_test_coverage/1,
      &check_forbidden_patterns/1,
      &check_warning_free/1,
      &check_provenance/1
    ]

    Enum.reduce_while(checks, :compliant, fn check, _acc ->
      case check.(artifact) do
        :pass -> {:cont, :compliant}
        {:fail, level, reason} -> {:halt, {:violation, level, reason}}
      end
    end)
  end

  @spec enforce!(map()) :: :ok | no_return()
  def enforce!(artifact) do
    case check_compliance(artifact) do
      :compliant -> :ok
      {:violation, level, reason} ->
        :telemetry.execute(
          [:prismatic, :doctrine, :violation],
          %{level: level},
          %{reason: reason, artifact: artifact.id}
        )
        raise PrismaticSafety.DoctrineViolation,
          level: level,
          reason: reason,
          artifact: artifact
    end
  end

  defp check_completeness(artifact) do
    cond do
      has_stubs?(artifact) -> {:fail, :l3, "Contains stub implementations"}
      has_placeholders?(artifact) -> {:fail, :l3, "Contains placeholder code"}
      has_todos?(artifact) -> {:fail, :l2, "Contains TODO markers"}
      true -> :pass
    end
  end
end
```

## Practical Impact

The NM/ND Doctrine has measurable effects on the platform's quality metrics:

- **Quality Score**: 100/100 across all 13 quality domains, maintained continuously
- **Quality Debt**: 0 QDP (Quality Debt Points) -- complete elimination of accumulated debt
- **Compilation**: Zero warnings across 115 [OTP](@/glossary/otp.md) applications
- **Static Analysis**: Zero Credo violations, zero Dialyzer violations
- **Test Coverage**: Comprehensive coverage with mandatory regression tests for every bug fix
- **Runtime**: Zero known defects in the active codebase
- **Agent Compliance**: 530/530 agents carrying mandatory enforcement blocks

These metrics are not aspirational targets -- they are enforced invariants. Any regression triggers immediate automated response through the Quality Floor Guardian and pre-commit protection systems.

## NM/ND in the Development Workflow

A typical development session under NM/ND governance follows this workflow:

1. **Session Start**: Create GitLab issue(s) for tracking. Load context from previous session.
2. **Investigation (NO DOUBTS)**: Read relevant code. Understand the problem. Form hypotheses. Verify assumptions through tests and analysis.
3. **Confidence Check**: Has confidence reached 0.95? Does the solution pass the Trinity Gate? If not, continue investigation.
4. **Implementation (NO MERCY)**: Write complete, production-ready code. Include all tests. Achieve zero warnings.
5. **Validation**: Run `mix quality.gates`. Run affected tests. Verify zero compilation warnings.
6. **Commit**: Pre-commit hooks validate compliance. Push immediately.
7. **Session End**: Ensure all commits pushed. Save session context. Update GitLab issues.

The workflow makes the NM/ND transition explicit. Steps 2-3 operate under NO DOUBTS governance (thorough investigation, evidence gathering). Steps 4-6 operate under NO MERCY governance (complete implementation, zero tolerance). The transition between them is the confidence check at step 3.

## Common Misconceptions

**"NM/ND slows down development."** The opposite is true in practice. By eliminating the category of deferred fixes and known issues, NM/ND removes the overhead of tracking, triaging, and eventually fixing accumulated debt. The cost is paid upfront at implementation time, when context is fresh and the fix is cheapest.

**"NM/ND is only about code quality."** NM/ND governs all platform operations, including documentation, session management, agent definitions, and deployment processes. The doctrine's scope extends to any artifact that enters the platform's version-controlled repositories.

**"NO DOUBTS means analysis paralysis."** NO DOUBTS requires thorough investigation, but it also requires decisive action once confidence is established. The confidence threshold (0.95) and Trinity Gate provide an explicit, measurable transition point. Once that point is reached, hesitation is itself a violation.

**"NM/ND is too rigid for experimentation."** The NABLA exploration phase explicitly supports uncertainty, contradiction, and multiple hypotheses. NM/ND applies only after the exploration phase reaches confidence. Experimentation happens under NABLA governance; delivery happens under NM/ND governance.

**"NM/ND requires superhuman developers."** NM/ND is enforced through tooling, not willpower. The pre-commit hooks, quality gates, and CI pipelines ensure compliance automatically. Developers do not need to remember every rule -- the tooling catches violations before they enter the codebase.

## Related Terms

- [NO MERCY](@/glossary/no-mercy.md) -- The zero tolerance enforcement arm of the doctrine
- [NO DOUBTS](@/glossary/no-doubts.md) -- The evidence-based investigation arm of the doctrine
- [Violation Protocol](@/glossary/violation-protocol.md) -- L1-L4 escalation levels for doctrine breaches
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing the exploration phase before NM/ND execution
- [Trinity Gate](@/glossary/trinity-gate.md) -- Three-layer verification gate enabling the NABLA-to-NM/ND transition
- [Quality Gates](@/glossary/quality-gates.md) -- Automated enforcement pipeline implementing NM/ND checks
- [AIAD](@/glossary/aiad.md) -- Agent specification standard carrying mandatory NM/ND enforcement blocks
- [Confidence Threshold](@/glossary/confidence-threshold.md) -- The 0.95 threshold that triggers transition from exploration to execution
- [Clean Run](@/glossary/clean-run.md) -- The compilation and test state required by NO MERCY enforcement
- [Regression Test](@/glossary/regression-test.md) -- Mandatory test accompanying every bug fix under NM/ND
- [Provenance Mandatory](@/glossary/provenance-mandatory.md) -- NABLA axiom ensuring decisions have traceable evidence

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture governed by NM/ND principles
- [Platform Capabilities](@/capabilities/_index.md) -- Quality enforcement and doctrine capabilities in action
- [Applications](@/apps/_index.md) -- 115 OTP applications all operating under NM/ND governance
- [Agent Registry](@/agents/_index.md) -- 530+ agents carrying mandatory NM/ND enforcement blocks
- [Technologies](@/technologies/_index.md) -- Technology stack supporting NM/ND automated enforcement

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
