+++
title = "Code as Hypothesis"
weight = 50
[extra]
description = "Philosophy treating every code implementation as a testable hypothesis to be validated through automated testing, peer review, production observation, and formal verification rather than accepted as a finished artifact"
category = "philosophy"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "Software Philosophy"
related_concepts = ["scientific-method-in-engineering", "hypothesis-driven-development", "evidence-based-engineering", "epistemic-humility", "continuous-validation"]
implementation_status = "production"
authority_level = "doctrine-level"
difficulty_rating = 7
prerequisites = ["testing-fundamentals", "scientific-method", "code-quality-concepts"]
learning_path = ["code-quality", "testing", "code-as-hypothesis", "property-based-testing", "formal-verification"]
interactive_demos = ["/labs/glossary/code-as-hypothesis"]
code_examples = ["elixir", "lean4"]
external_resources = ["https://www.hillelwayne.com/post/hypothesis-driven-development/", "https://martinfowler.com/articles/developer-testing.html"]
version_introduced = "gen-8"
stability_level = "stable"
testing_scenarios = ["hypothesis-formulation", "test-as-proof", "production-validation", "regression-as-disproof"]
keywords = ["code-as-hypothesis", "hypothesis-driven", "testable-code", "scientific-rigor", "evidence-based", "validation", "verification"]
tags = ["glossary", "philosophy", "quality", "testing"]
related_terms = ["property-based-testing", "scientific-rigor", "code-quality", "regression-testing", "formal-verification", "code-as-truth", "trinity-gate", "nabla-infinity", "code-coverage", "exunit", "clean-run", "no-mercy-no-doubts"]
word_count = 1817
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Code as Hypothesis - Prismatic Platform"
+++

## Definition

Code as Hypothesis is a software development philosophy that treats every code implementation as a testable proposition rather than a completed artifact. Under this model, writing code is analogous to formulating a scientific hypothesis: the implementation represents a claim about how a system should behave, and that claim must be subjected to rigorous validation through automated tests, static analysis, peer review, and production observation before it earns confidence. Code never graduates to "proven truth" -- it remains a hypothesis that can be invalidated by new evidence, changing requirements, or previously unconsidered edge cases.

## Overview

The Code as Hypothesis philosophy emerges from recognizing a fundamental problem in software engineering: developers routinely treat their implementations as correct by default, shifting the burden of proof to testing as an afterthought. This inverts the scientific method, where hypotheses are treated as provisional until validated. When code is treated as hypothesis, the entire development workflow reorients around validation -- tests are not quality checks bolted onto finished code, but the experimental apparatus that determines whether the hypothesis holds.

This philosophy has deep roots in the scientific method and epistemology. Karl Popper's falsifiability criterion states that a hypothesis has scientific value only if it can be disproven. Applied to software, this means code has engineering value only if it can be tested for failure. Code that cannot fail tests is either trivial or insufficiently tested. The most valuable tests are those that could realistically fail -- they probe the boundaries of the hypothesis rather than confirming the obvious.

The practical consequences are significant. When code is a hypothesis, writing the test first (Test-Driven Development) becomes natural rather than dogmatic -- you define what would prove the hypothesis before constructing it. [Property-based testing](@/glossary/property-based-testing.md) becomes essential because it explores the hypothesis space more thoroughly than hand-crafted examples. [Regression testing](@/glossary/regression-testing.md) becomes mandatory because every production bug is a falsification that demands a new experimental guard. And [formal verification](@/glossary/formal-verification.md) becomes the gold standard because it provides mathematical proof rather than probabilistic evidence.

The philosophy also changes how developers relate to their code psychologically. If code is a hypothesis, having it invalidated (a failing test, a production bug, a code review critique) is not a personal failure -- it is the scientific process working correctly. This reduces ego attachment to implementations and creates a culture where discovering flaws is celebrated rather than hidden.

## Technical Details

### The Hypothesis Lifecycle

Every piece of code passes through stages analogous to the scientific method:

| Stage | Scientific Method | Software Equivalent | Prismatic Enforcement |
|-------|-------------------|--------------------|-----------------------|
| **Observation** | Observe a phenomenon | Identify a requirement or bug | GitLab issue creation |
| **Hypothesis** | Formulate an explanation | Write implementation code | Code in feature branch |
| **Prediction** | Derive testable predictions | Define expected behaviors | Test specifications |
| **Experiment** | Design and run experiments | Write and execute tests | ExUnit + property tests |
| **Analysis** | Analyze results | Review test results and coverage | Quality gates + Credo + Dialyzer |
| **Peer Review** | Peer review and replication | Code review | Pull request review |
| **Publication** | Publish findings | Merge to main branch | 11-phase pre-commit validation |
| **Ongoing Scrutiny** | Continuous challenge by community | Production monitoring + regression | Autoheal + autoevolve cycles |

### Confidence Levels

Not all hypotheses carry equal confidence. The framework defines graduated confidence levels based on the strength of validation:

```elixir
defmodule Prismatic.HypothesisConfidence do
  @moduledoc """
  Confidence classification for code hypotheses based on
  the depth and breadth of their validation evidence.
  """

  @type confidence_level ::
    :speculative     # No tests, no review -- raw conjecture
    | :preliminary   # Basic happy-path tests pass
    | :supported     # Comprehensive unit + integration tests
    | :robust        # Property-based tests + static analysis clean
    | :verified      # Formal verification or exhaustive proof
    | :battle_tested # All above + production observation over time

  @spec classify(map()) :: {:ok, confidence_level()} | {:error, :insufficient_evidence}
  def classify(%{} = evidence) do
    cond do
      formal_proof?(evidence) -> {:ok, :verified}
      property_tests?(evidence) and static_clean?(evidence) -> {:ok, :robust}
      comprehensive_tests?(evidence) -> {:ok, :supported}
      basic_tests?(evidence) -> {:ok, :preliminary}
      any_tests?(evidence) -> {:ok, :speculative}
      true -> {:error, :insufficient_evidence}
    end
  end

  @spec minimum_for_merge() :: confidence_level()
  def minimum_for_merge, do: :robust

  @spec minimum_for_production() :: confidence_level()
  def minimum_for_production, do: :robust

  defp formal_proof?(%{lean4_proofs: proofs}) when length(proofs) > 0, do: true
  defp formal_proof?(_), do: false

  defp property_tests?(%{property_tests: count}) when count > 0, do: true
  defp property_tests?(_), do: false

  defp static_clean?(%{credo_violations: 0, dialyzer_violations: 0, warnings: 0}), do: true
  defp static_clean?(_), do: false

  defp comprehensive_tests?(%{unit_tests: u, integration_tests: i})
       when u > 0 and i > 0, do: true
  defp comprehensive_tests?(_), do: false

  defp basic_tests?(%{unit_tests: u}) when u > 0, do: true
  defp basic_tests?(_), do: false

  defp any_tests?(%{test_count: c}) when c > 0, do: true
  defp any_tests?(_), do: false
end
```

### Falsification Patterns

The hypothesis model identifies specific patterns where code hypotheses are commonly falsified:

| Falsification Source | What It Reveals | Prevention Strategy |
|---------------------|-----------------|---------------------|
| **Unit test failure** | Logic error in isolated component | TDD -- write test before code |
| **Integration test failure** | Incorrect assumptions about component interaction | Contract testing between modules |
| **Property test failure** | Edge case the developer did not anticipate | StreamData generators for all public APIs |
| **Dialyzer warning** | Type-level inconsistency | Full typespec coverage with @spec |
| **Credo violation** | Structural anti-pattern | Strict mode + custom checks |
| **Production error** | Environmental assumption failure | Chaos engineering + telemetry |
| **Performance regression** | Scalability hypothesis invalidated | Benchee benchmarks + load testing |
| **Security audit finding** | Safety hypothesis invalidated | Adversarial testing (Red Team) |

### Integration with NABLA Infinity

The Code as Hypothesis philosophy aligns directly with the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework. NABLA's seven axioms enforce the same intellectual discipline that the hypothesis model requires:

```
Signal Plurality    -> Multiple test types validate the same hypothesis
Contradiction Pres. -> Failing tests are preserved, not deleted or skipped
Absence Informative -> Missing tests for a module are data (coverage gaps)
Time Decay          -> Confidence decreases if tests are not maintained
Unknown Valid       -> "I don't know if this is correct" is a legitimate state
Source Independence -> Tests from different authors increase confidence
Provenance Mandatory -> Every claim about correctness must trace to a test
```

The [Trinity Gate](@/glossary/trinity-gate.md) provides the ultimate validation mechanism: structural consistency (the code forms a valid dependency graph), logical consistency (the code follows sound logical rules), and formal necessity (the code's properties are provable in Lean4).

### Test as Experiment Design

When tests are designed as experiments rather than confirmations, their structure changes fundamentally:

```elixir
defmodule Prismatic.PaymentProcessor.HypothesisTest do
  @moduledoc """
  Tests designed as experiments to validate the payment processing hypothesis:
  'Given a valid payment request, the system will atomically debit the source,
  credit the destination, and produce an audit record, or fail entirely
  with no partial state changes.'
  """

  use ExUnit.Case, async: true
  use ExUnitProperties

  # Hypothesis: All valid payments produce exactly one audit record
  property "valid payments produce exactly one audit record" do
    check all amount <- positive_integer(),
              source <- account_generator(),
              dest <- account_generator(),
              source != dest do
      {:ok, result} = PaymentProcessor.process(%{
        amount: amount,
        source: source,
        destination: dest
      })

      assert length(result.audit_records) == 1
      assert result.audit_records |> hd() |> Map.get(:amount) == amount
    end
  end

  # Falsification attempt: Insufficient funds must fail atomically
  property "insufficient funds never produce partial state changes" do
    check all amount <- positive_integer(),
              balance <- integer(0..max(0, amount - 1)),
              source <- account_generator(balance: balance),
              dest <- account_generator() do
      assert {:error, :insufficient_funds} =
               PaymentProcessor.process(%{
                 amount: amount,
                 source: source,
                 destination: dest
               })

      # Verify no state changed -- the hypothesis of atomicity
      assert Account.balance(source) == balance
      assert Account.balance(dest) == Account.initial_balance()
    end
  end
end
```

## Implementation in Prismatic Platform

### Doctrine-Level Enforcement

The Prismatic Platform elevates Code as Hypothesis from philosophy to enforced doctrine through the [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) system. The "No Doubts" component directly implements hypothesis validation:

- **Full Investigation**: Understand the problem completely before formulating the code hypothesis
- **Evidence-Based**: Every claim about code correctness must be backed by tests, benchmarks, or verification
- **Verified Results**: No unvalidated claims, no unchecked outputs
- **Decisive Action**: Once confidence reaches the threshold (0.95), execute with full commitment

### Mandatory Regression Test Protocol

Every bug fix is treated as the falsification of a previous hypothesis. The mandatory protocol requires:

1. Identify the root cause (what assumption was wrong)
2. Create regression tests that would have caught the bug (the new experiment)
3. Verify the test fails with unfixed code (proves the test is valid)
4. Apply the fix (reformulate the hypothesis)
5. Verify the test passes (the new hypothesis survives the experiment)

```elixir
defmodule Prismatic.Quality.RegressionProtocol do
  @moduledoc """
  Enforces the mandatory regression test protocol.
  Every bug fix must include tests that prove the previous
  hypothesis was falsified and the new hypothesis holds.
  """

  @spec validate_bug_fix(map()) :: {:ok, :compliant} | {:error, String.t()}
  def validate_bug_fix(%{commit: commit, tests_added: tests, tests_before: before, tests_after: after_}) do
    with :ok <- verify_tests_added(tests),
         :ok <- verify_tests_fail_before(before),
         :ok <- verify_tests_pass_after(after_) do
      {:ok, :compliant}
    end
  end

  defp verify_tests_added([]), do: {:error, "Bug fix without regression test -- BLOCKED"}
  defp verify_tests_added(_tests), do: :ok

  defp verify_tests_fail_before(:passed), do: {:error, "Test passes before fix -- test does not validate hypothesis"}
  defp verify_tests_fail_before(:failed), do: :ok

  defp verify_tests_pass_after(:failed), do: {:error, "Test fails after fix -- hypothesis not supported"}
  defp verify_tests_pass_after(:passed), do: :ok
end
```

### Quality Gate as Experiment Battery

The platform's [quality gate](@/glossary/quality-gate.md) system runs a comprehensive battery of experiments against every code hypothesis:

| Gate | Experiment Type | What It Tests |
|------|----------------|---------------|
| Compilation (--warnings-as-errors) | Structural validity | Code parses and type-checks |
| [Credo](@/glossary/credo.md) --strict | Pattern analysis | No anti-patterns or style violations |
| [Dialyzer](@/glossary/dialyzer.md) | Type analysis | Type contracts are consistent |
| ExUnit | Behavioral validation | Specified behaviors hold |
| StreamData | Property exploration | Properties hold across input space |
| Code Coverage | Hypothesis completeness | All code paths are tested |
| Forbidden Patterns | Negative validation | Known anti-patterns absent |

### 11-Phase Pre-Commit Validation

The [pre-commit hooks](@/glossary/pre-commit-hooks.md) system implements hypothesis validation as a gate before any code enters the repository:

```
Phase 1:  Compilation check (--warnings-as-errors)
Phase 2:  Credo strict analysis
Phase 3:  Dialyzer type checking
Phase 4:  Test execution
Phase 5:  Coverage verification
Phase 6:  Forbidden pattern scan
Phase 7:  DateTime precision check
Phase 8:  Template validation
Phase 9:  Performance check
Phase 10: Design consistency
Phase 11: Quality gate summary
```

Each phase is an experiment. If any experiment falsifies the code hypothesis, the commit is blocked. There are no exceptions, no bypass flags, no `--no-verify`.

## Comparison with Alternatives

| Philosophy | Core Belief | Testing Role | Failure Meaning |
|-----------|-------------|-------------|-----------------|
| **Code as Hypothesis** | Code is provisional until validated | Tests are experiments that validate or falsify | Scientific progress -- hypothesis refined |
| **Code as Craft** | Code is an artistic expression of skill | Tests verify the craftsman's work | Quality defect -- skill gap |
| **Code as Specification** | Code precisely defines behavior | Tests confirm specification conformance | Specification error -- rewrite |
| **Code as Documentation** | Code describes what the system does | Tests are executable examples | Documentation drift -- update |
| **Code as Asset** | Code has business value to protect | Tests are insurance against degradation | Asset depreciation -- technical debt |
| **Move Fast, Break Things** | Speed matters more than correctness | Tests are optional safety nets | Acceptable cost of velocity |

The Code as Hypothesis model is uniquely suited to platforms that demand both high quality and continuous evolution. Unlike "Code as Craft" which can lead to over-engineering, or "Move Fast" which accepts breakage, the hypothesis model maintains intellectual rigor while embracing change -- every change is simply a new hypothesis to validate.

## Best Practices

### Write Falsifiable Tests

Design tests that can actually fail in meaningful ways. A test that asserts `assert true` validates nothing. Tests should encode specific, non-obvious expectations about system behavior:

```elixir
# Weak hypothesis test -- hard to falsify
test "process_payment returns ok" do
  assert {:ok, _} = PaymentProcessor.process(valid_payment())
end

# Strong hypothesis test -- specific, falsifiable claims
test "process_payment debits source by exact amount and records timestamp" do
  payment = valid_payment(amount: 42_00)
  before_balance = Account.balance(payment.source)

  {:ok, result} = PaymentProcessor.process(payment)

  assert Account.balance(payment.source) == before_balance - 42_00
  assert result.processed_at != nil
  assert DateTime.diff(DateTime.utc_now(), result.processed_at, :second) < 2
end
```

### Use Property-Based Testing for Invariants

[Property-based testing](@/glossary/property-based-testing.md) generates hundreds or thousands of random inputs, exploring the hypothesis space far more thoroughly than hand-written examples:

```elixir
property "encoding then decoding is identity" do
  check all data <- binary() do
    assert data == data |> Encoder.encode() |> Decoder.decode()
  end
end
```

### Track Confidence Explicitly

Annotate modules and functions with their validation status using documentation and metadata:

```elixir
@doc """
Calculates risk score for a domain.

Confidence: :robust
Evidence: 47 unit tests, 12 property tests, Dialyzer clean, Credo clean
Last falsification attempt: 2026-02-15 (passed)
Known limitations: Does not handle IPv6-only domains
"""
@spec calculate_risk(String.t()) :: {:ok, float()} | {:error, term()}
def calculate_risk(domain) do
  # ...
end
```

### Treat Production Bugs as Falsifications

Every production bug is evidence that a hypothesis was wrong. Document what assumption was incorrect and what test would have caught it. This builds institutional memory about the types of hypotheses that tend to fail.

## Common Pitfalls

### Confirmation Bias in Testing

Writing tests that confirm what the code already does rather than challenging it. This produces high coverage but low confidence. Counter by writing tests before code (TDD) or having different people write tests and implementation.

### Hypothesis Rigidity

Becoming attached to an implementation and ignoring evidence that it should change. The hypothesis model requires willingness to discard code when evidence contradicts it. This is especially difficult when significant effort has been invested.

### Confusing Coverage with Confidence

100% line coverage does not mean the hypothesis is validated. Coverage measures which code was executed, not which behaviors were verified. A test that calls a function without meaningful assertions provides coverage but zero confidence.

### Skipping the Falsification Step

The regression test protocol requires verifying that the test fails before the fix. Skipping this step means the test might pass regardless of the fix, providing false confidence. Always verify your experiment can detect the failure it claims to prevent.

### Under-Testing Boundary Conditions

Most falsifications occur at boundaries -- zero values, empty collections, maximum sizes, concurrent access, network timeouts. Tests that only exercise the happy path leave the hypothesis vulnerable at its weakest points.

## Use Cases

### Safety-Critical Systems

In domains where failures have severe consequences (financial systems, security infrastructure, medical devices), the hypothesis model provides the intellectual rigor needed. Every behavior claim must be validated before deployment.

### Continuous Evolution Platforms

Systems that change frequently (like Prismatic Platform with its generational evolution) benefit from treating code as provisional. Each generation reformulates hypotheses about system behavior, and the test suite validates whether the new hypotheses hold.

### Multi-Team Development

When multiple teams contribute to a shared codebase, the hypothesis model provides a common language for quality. Instead of debating subjective code quality, teams discuss whether the evidence supports the implementation's claims.

### Regulatory Compliance

Regulated industries require evidence of software correctness. The hypothesis model naturally produces this evidence -- every test is a documented experiment, every passing suite is validation evidence, and every regression test documents a known failure mode.

### Technical Debt Assessment

By classifying code into confidence levels (speculative through battle-tested), teams can objectively assess where technical debt lies. Low-confidence code is high-risk debt; battle-tested code is validated capital.

## Related Concepts

- [Property-Based Testing](@/glossary/property-based-testing.md) -- the most powerful experimental technique for validating code hypotheses
- [Scientific Rigor](@/glossary/scientific-rigor.md) -- the epistemological foundation of the hypothesis model
- [Code Quality](@/glossary/code-quality.md) -- measurable characteristics that hypothesis validation improves
- [Regression Testing](@/glossary/regression-testing.md) -- tests created when a hypothesis is falsified by a production bug
- [Formal Verification](@/glossary/formal-verification.md) -- mathematical proof that a code hypothesis holds for all inputs
- [Code as Truth](@/glossary/code-as-truth.md) -- complementary principle: the code is the truth, but truth is provisional
- [Trinity Gate](@/glossary/trinity-gate.md) -- three-layer verification that a hypothesis is sound
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- epistemic framework whose axioms align with hypothesis validation
- [Code Coverage](@/glossary/code-coverage.md) -- metric measuring how thoroughly the hypothesis space is explored
- [ExUnit](@/glossary/exunit.md) -- the primary experimental apparatus for Elixir code hypotheses
- [Clean Run](@/glossary/clean-run.md) -- the zero-warning standard that code hypotheses must meet
- [No Mercy No Doubts](@/glossary/no-mercy-no-doubts.md) -- the doctrine that enforces hypothesis validation without exception

## See Also

- [Credo](@/glossary/credo.md) -- static analysis that validates structural properties of code hypotheses
- [Dialyzer](@/glossary/dialyzer.md) -- type-level validation of code hypotheses through success typing
- [Fitness Score](@/glossary/fitness-score.md) -- quantitative measure of platform hypothesis confidence
- [Autoevolve](@/glossary/autoevolve.md) -- autonomous system that reformulates platform hypotheses
- [Quality Gate](@/glossary/quality-gate.md) -- the experiment battery that every hypothesis must pass

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
