+++
title = "Security Verification"
weight = 50
[extra]
category = "security"
description = "The systematic process of validating that security controls, implementations, and claims meet specified requirements through formal proofs, automated testing, and adversarial validation within the platform's multi-gate verification framework"
related_terms = ["security-synthesis", "security", "trinity-gate", "white-team", "formal-verification", "property-based-testing", "regression-testing", "adversarial-testing", "quality-gates", "comprehensive-verification"]
keywords = ["security verification framework", "formal security proofs", "automated security validation", "multi-gate verification", "security control testing", "White Team verification", "property-based security testing", "Trinity Gate security", "continuous security verification", "security assurance levels"]
tags = ["security", "verification", "quality", "formal-methods", "testing"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "advanced"
quality_score = 95
date_created = "2026-02-22"
version = "2.0.0"
word_count = 1324
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Security Verification - Prismatic Platform"
+++

## Definition and Overview

Security Verification is the systematic, evidence-based process of confirming that security controls, implementations, and architectural decisions actually deliver the protection they claim to provide. It goes beyond security testing (which discovers vulnerabilities) to prove, with quantifiable confidence, that security properties hold under specified conditions. In the Prismatic Platform, security verification is formalized through the [White Team](@/glossary/white-team.md) verification methodology and enforced by the [Trinity Gate](@/glossary/trinity-gate.md) validation framework, which requires all security claims to pass structural consistency, logical consistency, and formal necessity checks before being accepted.

The distinction between security testing and security verification is fundamental. Testing demonstrates the presence of vulnerabilities; verification demonstrates the absence of specific vulnerability classes. A penetration test that finds no SQL injection vulnerabilities does not verify that the application is free from SQL injection -- it merely means the testers did not find any within the test scope and duration. True verification requires proving that the input validation and query construction patterns used throughout the codebase make SQL injection structurally impossible, regardless of test coverage.

This distinction has practical consequences. Testing-only approaches produce findings like "we tested 200 endpoints and found 3 vulnerable." Verification-based approaches produce claims like "the parameterized query pattern used by all 200 endpoints provably prevents SQL injection, as validated by static analysis, property-based testing, and formal proof." The latter is dramatically more valuable because it provides assurance about the entire surface, not just the tested subset.

## Verification Levels

The Prismatic Platform implements a progressive verification methodology with six assurance levels, adapted from the White Team's constructive verification approach:

### Level Hierarchy

| Level | Name | Method | Assurance | Typical Use |
|-------|------|--------|-----------|-------------|
| **L0** | Assertion | Runtime assertions and preconditions | Minimal | Development-time checks |
| **L1** | Unit Proof | Targeted unit tests for security properties | Low | Individual function validation |
| **L2** | Contract | Interface contract testing (behavior, protocol, API) | Medium | Module boundary verification |
| **L3** | Property | Property-based testing with randomized inputs | High | Algorithmic correctness proofs |
| **L4** | Formal | Formal proofs (Lean4, model checking) | Very High | Critical security invariants |
| **L5** | Adversarial | Red Team re-verification under adversarial conditions | Maximum | Production-grade assurance |

Each level subsumes all lower levels. An L4-verified security property also has L0-L3 verification. The level required depends on the criticality of the security property being verified.

### Level Selection Criteria

```
                    L5 (Adversarial)
                   /                \
          L4 (Formal)            Production
         /          \              Systems
    L3 (Property)    Critical       |
   /          \      Controls       |
L2 (Contract)  Security    ---------
  /        \   Invariants
L1 (Unit)   Module
  /    \    Boundaries
L0      Dev-time
(Assert) Checks
```

## Technical Deep Dive

### L0: Assertion-Based Verification

The most basic verification level uses runtime assertions to enforce security preconditions:

```elixir
defmodule PrismaticSecurity.InputValidator do
  @moduledoc """
  L0 assertion-based security verification for input validation.
  Guards against common injection patterns at function boundaries.
  """

  @spec validate_domain(String.t()) :: {:ok, String.t()} | {:error, :invalid_domain}
  def validate_domain(domain) when is_binary(domain) do
    cond do
      String.length(domain) > 253 ->
        {:error, :invalid_domain}

      not Regex.match?(~r/\A[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\z/, domain) ->
        {:error, :invalid_domain}

      String.contains?(domain, ["../", "..\\", "\x00"]) ->
        {:error, :invalid_domain}

      true ->
        {:ok, String.downcase(domain)}
    end
  end

  def validate_domain(_), do: {:error, :invalid_domain}
end
```

### L2: Contract-Based Verification

Contract verification tests that module interfaces enforce security properties across their boundaries:

```elixir
defmodule PrismaticSecurity.ContractVerification do
  @moduledoc """
  L2 contract-based verification ensuring security properties
  hold across module boundaries. Tests the behavioral contract
  between security modules and their consumers.
  """

  use ExUnit.Case, async: true

  describe "AuthenticationContract" do
    test "expired tokens are always rejected regardless of payload" do
      valid_payload = %{user_id: 1, role: :admin, permissions: [:all]}
      expired_token = build_token(valid_payload, expired: true)

      assert {:error, :token_expired} = PrismaticAuth.verify_token(expired_token)
    end

    test "token verification is constant-time against timing attacks" do
      valid_token = build_token(%{user_id: 1})
      invalid_token = "completely_wrong_token"

      {valid_time, _} = :timer.tc(fn -> PrismaticAuth.verify_token(valid_token) end)
      {invalid_time, _} = :timer.tc(fn -> PrismaticAuth.verify_token(invalid_token) end)

      assert abs(valid_time - invalid_time) < 1_000
    end

    test "privilege escalation through token manipulation is impossible" do
      user_token = build_token(%{user_id: 1, role: :viewer})
      tampered_token = tamper_role(user_token, :admin)

      assert {:error, :invalid_signature} = PrismaticAuth.verify_token(tampered_token)
    end
  end
end
```

### L3: Property-Based Verification

Property-based testing generates thousands of randomized inputs to verify that security properties hold universally, not just for hand-picked test cases:

```elixir
defmodule PrismaticSecurity.PropertyVerification do
  @moduledoc """
  L3 property-based security verification using StreamData generators
  to prove security properties hold across the entire input space.
  """

  use ExUnit.Case, async: true
  use ExUnitProperties

  property "SQL injection is structurally impossible through parameterized queries" do
    check all input <- string(:printable, min_length: 1, max_length: 1000) do
      malicious_inputs = [
        input,
        "#{input}'; DROP TABLE users; --",
        "#{input}\" OR 1=1 --",
        "#{input}\\x00",
        "#{input}' UNION SELECT * FROM credentials --"
      ]

      for malicious <- malicious_inputs do
        {query, params} = PrismaticStorage.build_query(:search, %{term: malicious})

        assert malicious in params
        refute String.contains?(query, malicious)
        assert query == "SELECT * FROM entities WHERE name = $1"
      end
    end
  end

  property "HMAC signatures are unforgeable without the secret key" do
    check all payload <- binary(min_length: 1, max_length: 10_000),
              wrong_key <- binary(min_length: 32, max_length: 32) do
      correct_key = Application.fetch_env!(:prismatic_auth, :hmac_secret)

      signature = PrismaticAuth.HMAC.sign(payload, correct_key)

      refute PrismaticAuth.HMAC.verify?(payload, signature, wrong_key)
      assert PrismaticAuth.HMAC.verify?(payload, signature, correct_key)

      modified = payload <> <<0>>
      refute PrismaticAuth.HMAC.verify?(modified, signature, correct_key)
    end
  end

  property "rate limiter never allows more than N requests per window" do
    check all requests <- list_of(constant(:request), min_length: 1, max_length: 200),
              limit <- integer(1..50),
              window_ms <- integer(1000..60_000) do
      limiter = PrismaticSecurity.RateLimiter.new(limit: limit, window_ms: window_ms)

      {accepted, _rejected} =
        requests
        |> Enum.reduce({0, limiter}, fn _req, {count, lim} ->
          case PrismaticSecurity.RateLimiter.check(lim) do
            {:ok, new_lim} -> {count + 1, new_lim}
            {:error, :rate_limited, new_lim} -> {count, new_lim}
          end
        end)

      assert accepted <= limit
    end
  end
end
```

### L4: Formal Verification

For critical security invariants, formal proofs provide mathematical certainty:

```elixir
defmodule PrismaticSecurity.FormalVerification do
  @moduledoc """
  L4 formal verification of critical security invariants.
  Generates Lean4 proof obligations from Elixir security specifications
  and validates them through the formal proof engine.
  """

  @type invariant :: %{
    name: String.t(),
    property: String.t(),
    proof_status: :proved | :unproved | :counterexample,
    lean4_reference: String.t()
  }

  @spec verify_access_control_invariants() :: {:ok, [invariant()]} | {:error, term()}
  def verify_access_control_invariants do
    invariants = [
      %{
        name: "privilege_monotonicity",
        property: "Removing a role from a user never increases their permissions",
        lean4_reference: "proofs/access_control/privilege_monotonicity.lean"
      },
      %{
        name: "least_privilege_closure",
        property: "The intersection of all role permissions equals effective permissions",
        lean4_reference: "proofs/access_control/least_privilege.lean"
      },
      %{
        name: "separation_of_duty",
        property: "No single user can hold both approver and requestor roles for same resource",
        lean4_reference: "proofs/access_control/separation_of_duty.lean"
      }
    ]

    results =
      invariants
      |> Enum.map(fn inv ->
        case verify_lean4_proof(inv.lean4_reference) do
          {:ok, :proved} -> Map.put(inv, :proof_status, :proved)
          {:error, :counterexample, ce} -> Map.merge(inv, %{proof_status: :counterexample, counterexample: ce})
          {:error, :unproved} -> Map.put(inv, :proof_status, :unproved)
        end
      end)

    all_proved = Enum.all?(results, &(&1.proof_status == :proved))

    if all_proved do
      {:ok, results}
    else
      {:error, {:unverified_invariants, Enum.reject(results, &(&1.proof_status == :proved))}}
    end
  end
end
```

### L5: Adversarial Verification

The highest assurance level combines all lower levels with active adversarial testing by the Red Team:

```elixir
defmodule PrismaticSecurity.AdversarialVerification do
  @moduledoc """
  L5 adversarial verification combining formal proofs with active
  Red Team testing to achieve maximum assurance. A security property
  at L5 has been proved correct AND survived adversarial assault.
  """

  @spec verify_l5(atom(), keyword()) :: {:ok, l5_result()} | {:error, term()}
  def verify_l5(security_property, opts \\ []) do
    with {:ok, l4_result} <- FormalVerification.verify(security_property),
         {:ok, red_team_result} <- RedTeamRetest.challenge(security_property, opts),
         {:ok, trinity_result} <- TrinityGate.validate(l4_result, red_team_result) do
      {:ok, %{
        property: security_property,
        assurance_level: :l5,
        formal_proof: l4_result,
        adversarial_test: red_team_result,
        trinity_gate: trinity_result,
        confidence: calculate_l5_confidence(l4_result, red_team_result),
        verified_at: DateTime.utc_now()
      }}
    end
  end

  defp calculate_l5_confidence(formal, adversarial) do
    formal_weight = if formal.proof_status == :proved, do: 0.6, else: 0.3
    adversarial_weight = adversarial.survival_rate * 0.4
    formal_weight + adversarial_weight
  end
end
```

## Architecture and Implementation

### Verification Pipeline

Security verification in the Prismatic Platform runs as a multi-stage pipeline integrated into the CI/CD process:

```
Code Change
    |
    v
Phase 1: L0 Assertions (compile-time + runtime)
    |
    v
Phase 2: L1 Unit Tests (mix test --tag security)
    |
    v
Phase 3: L2 Contract Tests (interface boundary validation)
    |
    v
Phase 4: L3 Property Tests (randomized input verification)
    |
    v
Phase 5: Static Analysis (Dialyzer + Credo --strict)
    |
    v
Phase 6: L4 Formal Proofs (scheduled, not per-commit)
    |
    v
Phase 7: L5 Adversarial (Red Team campaigns, periodic)
    |
    v
Trinity Gate Validation
    |
    v
Deployment Authorization
```

Phases 1-5 run on every commit. Phase 6 runs on release candidates. Phase 7 runs on scheduled cadence or for critical changes.

### Continuous Verification

Security verification is not a one-time activity. The platform implements continuous verification through:

| Mechanism | Frequency | Scope |
|-----------|-----------|-------|
| Pre-commit hooks | Every commit | L0-L1 on changed files |
| CI pipeline | Every push | L0-L3 full suite |
| Nightly build | Daily | L0-L4 with extended property tests |
| Red Team campaigns | Weekly | L5 on critical security surfaces |
| Compliance audit | Monthly | Full L0-L5 against compliance framework |

### Verification Evidence Artifacts

Every verification run produces evidence artifacts stored in a tamper-evident log:

```elixir
defmodule PrismaticSecurity.VerificationEvidence do
  @moduledoc """
  Produces and stores tamper-evident verification evidence artifacts.
  Every security verification must produce provenance-tracked evidence
  per NABLA provenance_mandatory axiom.
  """

  @type evidence :: %{
    verification_id: String.t(),
    property: atom(),
    level: :l0 | :l1 | :l2 | :l3 | :l4 | :l5,
    result: :passed | :failed | :inconclusive,
    confidence: float(),
    timestamp: DateTime.t(),
    duration_ms: non_neg_integer(),
    artifacts: [map()],
    provenance: map()
  }

  @spec record(evidence()) :: {:ok, String.t()} | {:error, term()}
  def record(evidence) do
    evidence_with_hash = %{evidence |
      hash: compute_hash(evidence),
      chain_previous: get_previous_hash(evidence.property)
    }

    with {:ok, _} <- persist_evidence(evidence_with_hash),
         :ok <- emit_telemetry(evidence_with_hash) do
      {:ok, evidence_with_hash.verification_id}
    end
  end

  defp compute_hash(evidence) do
    evidence
    |> :erlang.term_to_binary()
    |> then(&:crypto.hash(:sha256, &1))
    |> Base.encode16(case: :lower)
  end
end
```

## Usage in Prismatic Platform

### Quality Gates Integration

Security verification is integrated into the platform's [Quality Gates](@/glossary/quality-gates.md) system. The `mix quality.gates` command includes security verification checks:

| Gate | Verification Level | Blocking |
|------|-------------------|----------|
| Compilation warnings | L0 | Yes |
| Credo security checks | L1 | Yes |
| Dialyzer type safety | L2 | Yes |
| Security property tests | L3 | Yes |
| Forbidden patterns scan | L1 | Yes |
| Dependency vulnerability audit | L1 | Yes |

### Regression Test Protocol

The platform's mandatory [regression testing](@/glossary/regression-testing.md) protocol directly supports security verification. Every security bug fix must include:

1. A regression test that would have caught the vulnerability (L1 minimum)
2. Verification that the test fails with the unfixed code (proving test validity)
3. Verification that the test passes with the fixed code (proving fix effectiveness)
4. Property-based extension where applicable (L3 upgrade)

### Pre-Commit Security Verification

The 11-phase pre-commit hook includes dedicated security verification:

```
Phase 1:  Forbidden patterns (no hardcoded secrets)
Phase 2:  Compilation with --warnings-as-errors
Phase 3:  Credo --strict (includes security checks)
Phase 4:  Dialyzer (type-level security verification)
Phase 5:  Test suite (includes security property tests)
Phase 6:  Quality gates (composite verification check)
Phase 7:  Dependency audit (known vulnerability check)
Phase 8:  Template validation (XSS prevention)
Phase 9:  Asset verification (integrity checks)
Phase 10: Design consistency (security UI patterns)
Phase 11: Final verification (composite pass/fail)
```

## Best Practices

**Start at L0 and progress upward.** Not every security property needs L4 formal verification. Begin with assertions, add unit tests, then escalate verification level based on the criticality of the property. Authentication invariants deserve L4; input length validation is fine at L1.

**Automate verification in the CI pipeline.** Manual verification does not scale and cannot be repeated reliably. Every verification check that can be automated must be automated and run on every code change.

**Write verification tests before the implementation.** Test-driven security development means writing the security property test first, confirming it fails, then implementing the control and confirming the test passes. This is the security-specific application of TDD.

**Track verification coverage, not just test coverage.** Code coverage tells you what lines are executed during tests. Verification coverage tells you which security properties have been verified at which assurance level. Maintain a verification matrix mapping security properties to their current assurance level.

**Use property-based testing as the default for security logic.** Hand-written unit tests verify security for the specific inputs chosen by the test author. Property-based tests verify security across randomly generated inputs, including adversarial edge cases the developer might not anticipate.

**Produce evidence, not assertions.** Security verification must produce auditable evidence artifacts with full provenance. A test that passes silently provides no evidence. Every verification should produce a timestamped, signed artifact showing what was verified, how, when, and with what result.

## Common Pitfalls

**Testing happy paths only.** Security verification must focus on adversarial inputs, boundary conditions, and error paths. A test that verifies "valid user can log in" does not verify "invalid user cannot." Always test both the positive and negative sides of a security property.

**Conflating code coverage with security assurance.** 100% line coverage does not mean 100% security verification. A line of code can be executed in tests without any assertion about its security behavior. Coverage without property assertions is observation, not verification.

**Verification at the wrong level.** Verifying implementation details instead of security properties creates brittle tests that break on refactoring without actually testing security. Verify "unauthorized users cannot access admin endpoints" (property), not "the auth middleware calls the check_role function" (implementation).

**Ignoring verification of third-party dependencies.** Your application code may be perfectly verified, but a vulnerable dependency can undermine all that verification. Include dependency vulnerability scanning in your verification pipeline.

**Skipping adversarial re-verification after changes.** A security property verified at L5 before a code change may no longer hold after the change. Verification is not permanent -- it must be re-executed when the verified code changes.

## Relationship to Compliance

Security verification directly supports compliance frameworks by providing auditable evidence:

| Framework | Verification Requirement | Platform Support |
|-----------|------------------------|------------------|
| NIS2 | Risk-based security measures | L3+ verification of critical controls |
| ZKB 264/2025 | Cybersecurity compliance | L2+ contract verification of compliance controls |
| OWASP Top 10 | Vulnerability prevention | L3 property-based testing for each category |
| ISO 27001 | ISMS controls | L2 contract verification + L5 periodic audit |
| SOC 2 | Security controls | Verification evidence artifacts as audit trail |

## Related Concepts

- [Security Synthesis](@/glossary/security-synthesis.md) -- Combines verification results with other security signals
- [Security](@/glossary/security.md) -- The overarching domain that verification supports
- [Trinity Gate](@/glossary/trinity-gate.md) -- Multi-gate validation framework for security claims
- [White Team](@/glossary/white-team.md) -- Team responsible for constructive verification
- [Formal Verification](@/glossary/formal-verification.md) -- Mathematical proof of system properties
- [Property-Based Testing](@/glossary/property-based-testing.md) -- Randomized input testing for L3 verification
- [Regression Testing](@/glossary/regression-testing.md) -- Ensuring fixes remain effective over time
- [Adversarial Testing](@/glossary/adversarial-testing.md) -- Active attack simulation for L5 verification
- [Quality Gates](@/glossary/quality-gates.md) -- Composite quality checks including security verification
- [Dialyzer](@/glossary/dialyzer.md) -- Static analysis providing type-level security verification
- [Comprehensive Verification](@/glossary/comprehensive-verification.md) -- Broader verification beyond security

## See Also

- [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) -- EASM module verified through this framework
- [Pre-Commit Hooks](@/glossary/pre-commit-hooks.md) -- CI integration for continuous verification
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Apps](@/apps/_index.md) -- Umbrella applications subject to security verification

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
