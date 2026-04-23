+++
title = "Manual Quality Assurance"
weight = 40
[extra]
description = "Human-driven quality verification activities including exploratory testing, manual code review, and hands-on validation that complement automated quality systems"
category = "quality"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
abbreviation = "Manual QA"
related_terms = ["quality-assurance", "testing", "quality-gates", "regression-testing", "code-reviews", "quality-debt", "credo", "dialyzer", "static-analysis", "continuous-validation"]
keywords = ["manual quality assurance", "manual testing vs automated testing", "exploratory testing techniques", "manual code review", "QA automation strategy", "human testing judgment", "quality verification methods", "manual testing limitations", "test automation migration", "software quality engineering"]
tags = ["quality", "testing", "automation", "code-review", "process-improvement"]
difficulty_level = "intermediate"
platform_relevance = "critical"
elixir_relevance = "high"
version = "1.0.0"
word_count = 2059
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Manual Quality Assurance - Prismatic Platform"
+++

## Definition

Manual quality assurance (Manual QA) encompasses all human-driven activities aimed at verifying that software meets its quality requirements. This includes exploratory testing where testers interact with systems without predefined scripts, manual code review where developers read and assess code written by peers, user acceptance testing where stakeholders verify business requirements are met, and ad-hoc verification where engineers manually inspect system behaviour during development. In the Prismatic Platform context, manual QA represents a category of quality activity that the platform systematically replaces with automated equivalents wherever possible, while acknowledging that certain quality judgments -- architectural coherence, user experience assessment, creative problem-solving -- fundamentally require human cognition.

## Overview

The relationship between manual and automated quality assurance is one of the most consequential decisions in software engineering. Pure manual QA does not scale: as codebases grow, the number of test scenarios grows combinatorially, and manual testing cannot keep pace. A team of five manual testers might adequately cover a 10,000-line application, but the same team is hopelessly insufficient for a 2.8-million-line platform like Prismatic. The time to execute a full manual regression suite grows linearly with feature count, while the time between releases shrinks as organizations adopt continuous delivery practices.

Yet the industry's history of attempting to eliminate manual QA entirely is equally instructive. Automated tests excel at regression detection -- verifying that previously working functionality continues to work. They are far less effective at discovering novel defects, assessing usability, evaluating architectural coherence, or making subjective quality judgments. The most sophisticated automated test suite cannot determine whether a user interface is confusing, whether an error message is helpful, or whether an API design follows intuitive conventions.

The modern consensus, reflected in the Prismatic Platform's approach, is that manual QA should be strategic rather than comprehensive. Automation handles the exhaustive, repetitive verification (does every function return the correct type? does every API endpoint respond within latency bounds? do all quality gates pass?), while human judgment focuses on areas where automation falls short (is this the right abstraction? does this user flow make sense? is this error message actually helpful?).

The evolution from manual to automated QA follows a predictable pattern across organizations. Teams typically begin with entirely manual QA, then automate the most painful manual processes (usually regression testing), then progressively automate more categories until reaching a steady state where automation handles 80-95% of verification and humans focus on the remaining 5-20% that requires judgment. The Prismatic Platform's NO MERCY doctrine pushes this ratio further than most organizations, targeting 95-100% automation through its 11-phase pre-commit pipeline, automated quality gates, and continuous evolution systems.

The cost dynamics of manual QA are stark. A manual test that takes 5 minutes to execute costs 5 minutes every time it runs. Over a year of daily execution, that single test costs approximately 21 hours of human time. An automated test with the same coverage costs significantly more to create (perhaps 2-4 hours of development time) but near-zero to execute thereafter. The break-even point typically occurs within the first month for tests that run daily, making automation the clear economic choice for any recurring verification.

Historical data from software projects consistently shows that manual QA catches fewer defects per hour of effort compared to automated approaches for regression testing, but outperforms automation in exploratory testing and usability assessment. The key insight is that these are complementary capabilities, not competing approaches.

## Technical Details

### Quality Assurance Automation Maturity Model

The Prismatic Platform tracks automation maturity across quality dimensions:

```elixir
defmodule PrismaticQuality.AutomationMaturity do
  @moduledoc """
  Assesses the automation maturity level of quality assurance activities
  across the platform, identifying areas where manual processes persist
  and quantifying the automation opportunity.
  """

  @type maturity_level :: :manual | :scripted | :automated | :self_healing | :predictive

  @type qa_dimension :: %{
    name: String.t(),
    current_level: maturity_level(),
    target_level: maturity_level(),
    manual_hours_per_week: float(),
    automation_coverage: float(),
    gap_analysis: String.t()
  }

  @spec assess_platform() :: {:ok, list(qa_dimension())}
  def assess_platform do
    dimensions = [
      assess_dimension("Unit Testing", :self_healing, 0.99),
      assess_dimension("Integration Testing", :automated, 0.95),
      assess_dimension("Static Analysis", :self_healing, 1.0),
      assess_dimension("Type Checking", :automated, 1.0),
      assess_dimension("Code Review", :scripted, 0.85),
      assess_dimension("Security Scanning", :automated, 0.90),
      assess_dimension("Performance Testing", :automated, 0.80),
      assess_dimension("Exploratory Testing", :manual, 0.10),
      assess_dimension("Usability Assessment", :manual, 0.05),
      assess_dimension("Architecture Review", :scripted, 0.30)
    ]

    {:ok, dimensions}
  end

  defp assess_dimension(name, current_level, coverage) do
    %{
      name: name,
      current_level: current_level,
      target_level: :self_healing,
      automation_coverage: coverage,
      manual_hours_per_week: estimate_manual_hours(current_level, coverage),
      gap_analysis: gap_description(current_level, :self_healing)
    }
  end

  defp estimate_manual_hours(:manual, coverage), do: (1.0 - coverage) * 40.0
  defp estimate_manual_hours(:scripted, coverage), do: (1.0 - coverage) * 15.0
  defp estimate_manual_hours(:automated, coverage), do: (1.0 - coverage) * 5.0
  defp estimate_manual_hours(:self_healing, _coverage), do: 0.5
  defp estimate_manual_hours(:predictive, _coverage), do: 0.1
end
```

### Automated Replacement of Manual Code Review

One of the most significant manual QA activities in traditional development is code review. The Prismatic Platform automates the mechanical aspects of code review through its quality gate system while preserving human review for design and architectural decisions:

```elixir
defmodule PrismaticQuality.AutomatedReview do
  @moduledoc """
  Replaces mechanical aspects of manual code review with automated checks.
  Covers style, patterns, types, forbidden constructs, and coverage --
  freeing human reviewers to focus on design, architecture, and correctness.
  """

  @type review_result :: %{
    file: String.t(),
    checks_passed: non_neg_integer(),
    checks_failed: non_neg_integer(),
    findings: list(finding()),
    automated_coverage: float(),
    human_review_needed: boolean()
  }

  @type finding :: %{
    check: String.t(),
    severity: :info | :warning | :error | :critical,
    line: non_neg_integer(),
    message: String.t(),
    suggestion: String.t() | nil
  }

  @spec review_changeset(list(String.t())) :: {:ok, list(review_result())}
  def review_changeset(changed_files) do
    results =
      changed_files
      |> Enum.map(fn file ->
        checks = [
          run_compilation_check(file),
          run_credo_check(file),
          run_dialyzer_check(file),
          run_forbidden_pattern_check(file),
          run_typespec_coverage_check(file),
          run_naming_convention_check(file),
          run_complexity_check(file)
        ]

        findings = Enum.flat_map(checks, fn {:ok, f} -> f; _ -> [] end)
        passed = Enum.count(checks, &match?({:ok, []}, &1))
        failed = length(checks) - passed

        %{
          file: file,
          checks_passed: passed,
          checks_failed: failed,
          findings: findings,
          automated_coverage: passed / max(length(checks), 1),
          human_review_needed: has_architectural_changes?(file, findings)
        }
      end)

    {:ok, results}
  end

  defp has_architectural_changes?(file, _findings) do
    # Files that modify supervision trees, public APIs, or system boundaries
    # always require human architectural review
    String.contains?(file, ["supervisor", "application.ex", "router.ex"]) or
      String.ends_with?(file, "_behaviour.ex")
  end
end
```

### Exploratory Testing Framework

While the Prismatic Platform automates most QA activities, it provides infrastructure to support the manual exploratory testing that remains valuable:

```elixir
defmodule PrismaticQuality.ExploratorySession do
  @moduledoc """
  Structured framework for manual exploratory testing sessions.
  Captures findings, timing, and coverage information to make
  manual testing systematic and reproducible even though the
  testing itself is unscripted.
  """

  @type session :: %{
    id: String.t(),
    charter: String.t(),
    tester: String.t(),
    started_at: DateTime.t(),
    ended_at: DateTime.t() | nil,
    findings: list(finding()),
    areas_explored: list(String.t()),
    notes: list(String.t()),
    duration_minutes: non_neg_integer()
  }

  @type finding :: %{
    severity: :low | :medium | :high | :critical,
    description: String.t(),
    steps_to_reproduce: String.t(),
    expected: String.t(),
    actual: String.t(),
    screenshot_path: String.t() | nil,
    automatable: boolean()
  }

  @spec start_session(String.t(), String.t()) :: {:ok, session()}
  def start_session(charter, tester) do
    session = %{
      id: generate_session_id(),
      charter: charter,
      tester: tester,
      started_at: DateTime.utc_now(),
      ended_at: nil,
      findings: [],
      areas_explored: [],
      notes: [],
      duration_minutes: 0
    }

    :telemetry.execute(
      [:prismatic, :qa, :exploratory, :start],
      %{},
      %{charter: charter, tester: tester}
    )

    {:ok, session}
  end

  @spec record_finding(session(), map()) :: {:ok, session()}
  def record_finding(session, finding_attrs) do
    finding = %{
      severity: finding_attrs.severity,
      description: finding_attrs.description,
      steps_to_reproduce: finding_attrs.steps_to_reproduce,
      expected: Map.get(finding_attrs, :expected, ""),
      actual: Map.get(finding_attrs, :actual, ""),
      screenshot_path: Map.get(finding_attrs, :screenshot_path),
      automatable: Map.get(finding_attrs, :automatable, false)
    }

    {:ok, %{session | findings: [finding | session.findings]}}
  end

  @spec end_session(session()) :: {:ok, session()}
  def end_session(session) do
    now = DateTime.utc_now()
    duration = DateTime.diff(now, session.started_at, :minute)

    completed = %{session |
      ended_at: now,
      duration_minutes: duration
    }

    :telemetry.execute(
      [:prismatic, :qa, :exploratory, :complete],
      %{duration_minutes: duration, findings_count: length(session.findings)},
      %{charter: session.charter}
    )

    {:ok, completed}
  end
end
```

## Implementation

### The Prismatic QA Automation Stack

The platform replaces manual QA activities with a comprehensive automation stack:

| Manual QA Activity | Automated Replacement | Tool/System |
|--------------------|----------------------|-------------|
| Manual code style review | Automatic formatting enforcement | `mix format --check-formatted` |
| Manual pattern detection | Forbidden pattern scanner | `mix quality.forbidden_patterns` |
| Manual type verification | Static type analysis | Dialyzer + `mix dialyzer` |
| Manual code quality review | Automated code analysis | Credo + `mix credo --strict` |
| Manual compilation check | Warnings-as-errors | `mix compile --warnings-as-errors` |
| Manual test execution | Automated test suite | `mix test --cover` |
| Manual regression verification | Mandatory regression protocol | Pre-commit Phase 6 |
| Manual template review | Template validation | Pre-commit Phase 8 |
| Manual security review | Automated security scanning | Pre-commit Phase 9 |
| Manual design review | Design consistency checker | Pre-commit Phase 10 |
| Manual deployment | CI/CD pipeline | GitLab CI + Fly.io |

### Quality Gate as Manual QA Replacement

The `mix quality.gates` task aggregates multiple automated checks that collectively replace the manual QA sign-off process:

1. **Compilation gate**: Zero warnings (replaces manual "does it compile cleanly?" check)
2. **Credo gate**: Zero violations (replaces manual "does it follow coding standards?" check)
3. **Dialyzer gate**: Zero type errors (replaces manual "are types consistent?" check)
4. **Forbidden patterns gate**: Zero violations (replaces manual "any anti-patterns?" check)
5. **Test gate**: All tests pass with coverage threshold (replaces manual "did you run the tests?" check)
6. **Quality DNA gate**: State tracking (replaces manual "is quality trending up?" check)

### When Manual QA Remains Necessary

Despite aggressive automation, the Prismatic Platform acknowledges areas where human judgment is irreplaceable:

**Architectural Review**: No automated tool can determine whether a supervision tree is well-designed for fault tolerance, whether a module boundary is in the right place, or whether an abstraction will age well. Architecture review requires experience, taste, and contextual understanding.

**User Experience Assessment**: Automated tests can verify that a button exists and responds to clicks. They cannot assess whether the button is in the right place, whether the label is clear, or whether the interaction flow is intuitive.

**Security Threat Modelling**: While automated scanners detect known vulnerability patterns, threat modelling -- understanding how an adversary might chain multiple weaknesses into an attack -- requires creative adversarial thinking that current automation cannot replicate.

**Edge Case Discovery**: Exploratory testing by skilled testers discovers classes of defects that automated tests miss because automated tests can only check for conditions the test author anticipated. Exploratory testing is inherently about discovering the unexpected.

## Comparison

### Manual QA vs. Automated QA

| Dimension | Manual QA | Automated QA |
|-----------|-----------|--------------|
| **Speed** | Minutes to hours per test | Milliseconds to seconds per test |
| **Consistency** | Variable (fatigue, attention) | Deterministic |
| **Regression coverage** | Degrades over time | Maintained indefinitely |
| **Novel defect discovery** | Strong (human intuition) | Weak (only checks known conditions) |
| **Usability assessment** | Strong | Not possible |
| **Cost per execution** | High (human time) | Near-zero (compute time) |
| **Scalability** | Linear with features | Sublinear with features |
| **Maintenance** | Low (human adapts) | Ongoing (tests require maintenance) |
| **Confidence** | Subjective | Quantifiable |
| **Documentation** | Often informal | Self-documenting (test code) |

### QA Strategy Maturity Levels

| Level | Description | Manual/Auto Ratio | Example Organization |
|-------|-------------|-------------------|---------------------|
| **1 - Ad Hoc** | No systematic QA | 100/0 | Early-stage startup |
| **2 - Reactive** | Manual testing after bugs | 90/10 | Small team, no CI |
| **3 - Proactive** | Manual testing before release | 70/30 | Traditional QA team |
| **4 - Automated** | CI/CD with automated tests | 30/70 | Modern DevOps team |
| **5 - Optimized** | Strategic manual + comprehensive auto | 10/90 | SRE-mature organization |
| **6 - Autonomous** | Self-healing, predictive quality | 5/95 | Prismatic Platform (NO MERCY) |

## Best Practices

1. **Automate regression, explore manually**: Use automation for all regression testing -- verifying that existing functionality works. Reserve manual effort for exploratory testing that discovers new issues through creative investigation.

2. **Convert manual findings to automated tests**: Every defect discovered through manual QA should become an automated regression test. This ensures the same defect is never manually discovered twice.

3. **Time-box exploratory sessions**: Structure manual testing as focused sessions with explicit charters (what to explore), time limits (typically 60-90 minutes), and required deliverables (session notes, findings). This prevents manual testing from becoming unfocused browsing.

4. **Track manual QA cost**: Measure the hours spent on manual quality activities. This data drives automation investment decisions and reveals where human effort is being consumed by mechanical verification.

5. **Separate judgment from verification**: If a QA activity can be described as a deterministic rule ("function must have a typespec"), automate it. If it requires judgment ("is this API intuitive?"), keep it manual but structured.

6. **Invest in test infrastructure**: The primary barrier to automation is often the cost of writing and maintaining tests. Investing in test frameworks, factories, fixtures, and helper libraries reduces the marginal cost of each new automated test.

7. **Use risk-based testing for manual effort**: Focus manual QA effort on the highest-risk areas -- new features, complex business logic, security-sensitive code, and user-facing interactions. Low-risk areas should be covered exclusively by automation.

8. **Maintain manual testing skills**: As automation increases, the remaining manual testing requires higher skill. Invest in training testers for exploratory testing, security testing, and usability assessment rather than routine regression execution.

## Pitfalls

1. **Manual QA as a bottleneck**: When manual QA is on the critical path of every release, it becomes a scaling bottleneck. Teams wait for QA sign-off while automation could provide instant feedback.

2. **Automation theater**: Writing automated tests that pass but do not actually verify meaningful properties. A test suite with 90% code coverage that only checks return types provides false confidence.

3. **Loss of manual testing expertise**: As organizations automate, they sometimes eliminate manual QA roles entirely. When novel issues arise that automation misses, there are no skilled exploratory testers available.

4. **Manual testing as punishment**: Assigning manual regression testing to junior developers as busywork. This creates resentment, poor test quality, and missed defects while wasting human potential on mechanical work.

5. **Incomplete automation migration**: Automating 80% of manual tests and declaring victory while the remaining 20% accumulates as undocumented manual procedures that gradually degrade in execution quality.

6. **Flaky automated tests**: Automated tests that intermittently fail erode trust in the automated system and push teams back toward manual verification. Flaky tests must be fixed or removed immediately.

7. **Ignoring the manual QA to automation pipeline**: Failing to systematically convert manual test findings into automated tests, resulting in the same defects being manually discovered repeatedly across releases.

## Use Cases

### Pre-Commit Quality Enforcement

The Prismatic Platform's 11-phase pre-commit pipeline replaces what would traditionally be a manual QA checklist. Instead of relying on developers to remember to check compilation, run Credo, verify formatting, and execute tests, the pipeline enforces all of these automatically. A developer cannot commit code that violates any quality gate, eliminating the human failure modes of forgetfulness, time pressure, and inconsistency.

### Automated Regression Prevention

The mandatory regression test protocol replaces the manual QA practice of "let's check if that old bug came back." Every bug fix automatically includes a regression test that would catch the same defect if it recurs, building a permanent automated safety net that grows with every fix.

### Continuous Quality Monitoring

The Quality Floor Guardian automatically monitors quality metrics across all 13 quality domains, replacing the manual process of periodically reviewing quality dashboards. When quality degrades, the system triggers alerts and auto-healing rather than waiting for a human to notice the trend.

### Architecture Decision Records

While architectural review remains a human activity, the platform structures it through Architecture Decision Records (ADRs) that document decisions, rationale, and consequences. This replaces the manual process of relying on institutional memory for architectural context.

### Security Posture Assessment

The PrismaticPerimeter application automates security assessment that would otherwise require manual penetration testing and vulnerability scanning. While manual penetration testing remains valuable for discovering novel attack paths, the automated system handles the routine assessment of known vulnerability patterns across the entire attack surface.

## Related Concepts

Understanding manual quality assurance connects to the Prismatic Platform's comprehensive quality architecture:

- [Quality Assurance](@/glossary/quality-assurance.md) -- the overarching discipline encompassing both manual and automated quality activities
- [Testing](@/glossary/testing.md) -- automated verification of software correctness and reliability
- [Quality Gates](@/glossary/quality-gates.md) -- automated enforcement points that replace manual quality sign-off
- [Regression Testing](@/glossary/regression-testing.md) -- automated tests that prevent previously fixed defects from recurring
- [Code Reviews](@/glossary/code-reviews.md) -- the practice of peer review that combines manual judgment with automated assistance
- [Credo](@/glossary/credo.md) -- Elixir's static analysis tool that automates code quality checking
- [Dialyzer](@/glossary/dialyzer.md) -- the type checking system that automates type consistency verification
- [Static Analysis](@/glossary/static-analysis.md) -- automated analysis that replaces manual code inspection for pattern detection
- [Quality Debt](@/glossary/quality-debt.md) -- the accumulated cost of quality shortcuts that manual processes often create
- [Continuous Validation](@/glossary/continuous-validation.md) -- ongoing automated verification that replaces periodic manual review

## See Also

- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) -- the autonomous system that monitors quality metrics
- [Quality DNA](@/glossary/quality-dna.md) -- cross-session quality state tracking
- [Quality Standard](@/glossary/quality-standard.md) -- the universal quality requirements for platform applications
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) -- automated checks that enforce quality before code enters the repository
- [Automate Relentlessly](@/glossary/automate-relentlessly.md) -- the doctrine driving manual process elimination

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis). Part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) glossary. Contributions welcome via pull request.
