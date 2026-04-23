+++
title = "Prismatic Testing"
weight = 10
[extra]
icon = "beaker"
color = "cyan"
description = "Comprehensive testing framework with property-based testing and contract verification"
category = "Quality"
files = "380"
status = "Production"
port = "N/A"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1033
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Testing", "Comprehensive", "apps", "Quality", "Prismatic Platform", "Phase", "StreamData", "Contract"]
tags = ["apps", "quality", "prismatic-testing", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Testing - Prismatic Platform"
+++

## Overview

Prismatic Testing provides the platform's comprehensive testing infrastructure, including unit test utilities, [property-based testing](@/glossary/property-based-testing.md) generators, integration test harnesses, contract testing for storage adapters, and end-to-end test orchestration across the 90-application umbrella.

The framework enforces the [NO MERCY](@/glossary/no-mercy.md) doctrine requirement of 100% test coverage with zero stubs, mocks, or placeholder implementations. Every test validates real behavior against real (or in-memory) backends. This principle ensures that tests provide genuine confidence in system correctness rather than merely verifying that mocks return expected values. The result is a test suite that catches integration issues, race conditions, and behavioral regressions that mock-based testing would miss entirely.

The testing framework serves three distinct audiences: individual module developers who need fast unit feedback, integration teams who need cross-application verification, and the platform's autonomous evolution system which uses test results as fitness signals for generation-based improvement. Each audience requires different test characteristics -- speed, isolation, and coverage respectively -- and the framework's phased execution model accommodates all three.

## Architecture

```
PrismaticTesting
+-- ContractTests       # Adapter protocol verification
+-- Generators          # StreamData property generators
+-- Helpers             # Shared test utilities
+-- Factories           # Test data factories
+-- Integration         # Cross-app integration harnesses
+-- E2E                 # End-to-end test orchestration
```

### Test Execution Flow

```
mix test --> Phase 1 (Unit) --> Phase 2 (Integration) --> Phase 3 (E2E)
              |                    |                      |
         36 tests              41 tests               44 tests
              |                    |                      |
         Quality Gates --> Coverage Report --> Regression Check
```

The phased execution model ensures that fast tests run first, providing rapid feedback during development, while slower integration and end-to-end tests run subsequently to verify cross-application behavior. Each phase produces quality gate signals that feed into the platform's autonomous quality monitoring system.

## Contract Testing

The adapter contract test framework is the most architecturally significant component of Prismatic Testing. It verifies that every [storage adapter](@/apps/prismatic-storage.md) correctly implements the required protocols and behaviors defined by [Prismatic Storage Core](@/apps/prismatic-storage-core.md).

```elixir
# Use the contract test macro in any adapter test
defmodule MyAdapter.ContractTest do
  use PrismaticStorage.AdapterContractTest,
    adapter_module: MyAdapter

  # Automatically generates tests for:
  # - Readable protocol compliance
  # - Writable protocol compliance
  # - Queryable protocol compliance (if implemented)
  # - Error handling patterns
  # - Concurrent access safety
end
```

The contract test suite generates test cases from the behaviour and trait declarations of the adapter under test. When an adapter declares `traits: [Queryable, Transactional]`, the contract test macro generates tests for every callback in both the base adapter behaviour and the declared traits. This ensures that adding a new trait to an adapter automatically expands the test surface without requiring manual test authoring.

Contract tests are designed to be backend-agnostic -- the same test cases run against ETS, Ecto/PostgreSQL, Redis, KuzuDB, Meilisearch, and DuckDB adapters. The test setup phase initializes the appropriate backend, and the test cases interact only through the adapter protocol interface. This approach verifies that all adapters provide consistent behavior from the application code's perspective, which is the fundamental guarantee of the adapter pattern.

## Property-Based Testing

StreamData-powered property tests generate thousands of random inputs to find edge cases that example-based tests miss. The platform provides domain-specific generators that produce realistic test data matching the characteristics of actual platform entities.

```elixir
defmodule PrismaticTesting.Generators do
  use ExUnitProperties

  # Domain-specific generators
  def ico_generator do
    StreamData.string(:alphanumeric, length: 8)
  end

  def ip_address_generator do
    gen all(
      a <- StreamData.integer(0..255),
      b <- StreamData.integer(0..255),
      c <- StreamData.integer(0..255),
      d <- StreamData.integer(0..255)
    ) do
      "#{a}.#{b}.#{c}.#{d}"
    end
  end

  def risk_score_generator do
    StreamData.integer(0..100)
  end

  def domain_generator do
    gen all(
      name <- StreamData.string(:alphanumeric, min_length: 3, max_length: 20),
      tld <- StreamData.member_of(["com", "org", "net", "io", "cz"])
    ) do
      "#{String.downcase(name)}.#{tld}"
    end
  end
end
```

Property-based tests are particularly valuable for data transformation functions, serialization round-trips, and query filter logic where the space of possible inputs is too large to enumerate manually. The generators produce inputs that exercise boundary conditions, empty collections, Unicode strings, and extreme numeric values that developers rarely include in hand-written test cases.

The framework integrates with both `StreamData` (Elixir's built-in property testing library) and `PropCheck` (a QuickCheck-compatible library) to provide complementary approaches. StreamData generators compose naturally with Elixir's comprehension syntax, while PropCheck offers state machine testing capabilities for verifying stateful protocol interactions.

## Test Phase Organization

| Phase | Tests | Coverage | Duration |
|-------|-------|----------|----------|
| **Phase 1** | 36 | Workflow and Step unit tests | Seconds |
| **Phase 2** | 41 | Storage, Web, and Agent integration | 10-30 seconds |
| **Phase 3** | 44 | End-to-end across applications | 1-2 minutes |
| **Total** | 121+ | Full platform coverage | < 3 minutes |

Phase 1 tests are pure unit tests with no external dependencies. They test individual functions, module logic, and data transformations in isolation. Phase 2 tests introduce storage backends (ETS, PostgreSQL sandbox) and verify cross-module interactions within related application groups. Phase 3 tests exercise complete workflows that span multiple applications, including web request handling, storage operations, agent dispatch, and telemetry emission.

## Test Utilities

```elixir
# Shared test helpers
defmodule PrismaticTesting.Helpers do
  @doc "Create a temporary ETS table for isolated testing"
  def with_test_table(name, opts \\ [], fun) do
    table = :ets.new(name, opts ++ [:public, :set])
    try do
      fun.(table)
    after
      :ets.delete(table)
    end
  end

  @doc "Assert result matches {:ok, _} pattern"
  defmacro assert_ok(expr) do
    quote do
      assert {:ok, _} = unquote(expr)
    end
  end

  @doc "Assert result matches {:error, _} pattern"
  defmacro assert_error(expr) do
    quote do
      assert {:error, _} = unquote(expr)
    end
  end

  @doc "Run with timeout protection"
  def with_timeout(timeout_ms, fun) do
    task = Task.async(fun)
    Task.await(task, timeout_ms)
  end
end
```

The test utilities provide consistent patterns for common test operations: creating isolated ETS tables, asserting `{:ok, _}` / `{:error, _}` return patterns, managing test timeouts, and cleaning up test state. These utilities reduce boilerplate across the 5,500+ test files in the platform and ensure that test setup and teardown follow consistent patterns.

## Test Data Factories

The factory system generates realistic test data that matches the characteristics of production entities without using actual production data. Factories are composable -- a company factory can include embedded person factories for directors, domain factories for web presence, and relationship factories for corporate ownership.

Factories differ from generators in their purpose: generators produce random data for property-based testing to discover edge cases, while factories produce deterministic, realistic data for integration tests that verify specific business scenarios. A factory-generated investigation case includes realistic OSINT findings, entity relationships, and risk scores that exercise the full analysis pipeline.

## Quality Enforcement

### NO MERCY Test Requirements
- 100% coverage on business logic
- Zero stubs or mocks in production test suites
- Every bug fix requires a [regression test](@/glossary/regression-test.md)
- Property-based tests for all data transformation functions
- Contract tests for every storage adapter

### Pre-Commit Integration
Tests run automatically via the [Prismatic Safety](@/apps/prismatic-safety.md) pre-commit hook:
```bash
# Pre-commit test gate (automatic)
mix test --warnings-as-errors
mix credo --strict
mix dialyzer
```

## Dependencies

| Application | Relationship |
|-------------|-------------|
| [Prismatic Storage](@/apps/prismatic-storage.md) | Contract testing for all adapters |
| [Prismatic Safety](@/apps/prismatic-safety.md) | Quality gate verification |
| [Prismatic Agents](@/apps/prismatic-agents.md) | Agent behavior testing |
| [Prismatic Web](@/apps/prismatic-web.md) | [LiveView](@/glossary/liveview.md) integration tests |

## Usage

```bash
# Run all tests
mix test

# Run with coverage
mix test --cover

# Run specific phase
mix test apps/prismatic_testing/test/phase1/

# Run property-based tests
mix test --only property

# Run contract tests for a specific adapter
mix test apps/prismatic_storage_ets/test/contract_test.exs
```

## NABLA Compliance

The testing framework satisfies the Provenance Mandatory axiom by requiring that every test assertion includes sufficient context to trace failures back to their root cause. Test names describe what is being verified, assertion messages include the expected and actual values, and test metadata records the test phase, application, and execution timestamp. The Signal Plurality axiom is satisfied by the multi-phase test architecture, which provides independent verification signals from unit, integration, and end-to-end perspectives. The Trinity Gate's structural consistency requirement is enforced by contract tests that verify adapter protocol compliance across all six storage backends.

## Related Agents

- [CI/CD Guardrails Enforcer](@/agents/cicd-guardrails-enforcer.md) -- Enforces test coverage thresholds and quality gates in CI/CD pipelines
- [Evolution Analyzer Specialist](@/agents/evolution-analyzer-specialist.md) -- Analyzes test coverage trends and identifies testing gaps
- [Elixir Architect](@/agents/elixir-architect.md) -- Reviews test infrastructure patterns for OTP compliance

## Related Capabilities

- [Quality Gates](@/capabilities/quality-gates.md) -- Test execution integrated into the 13-domain quality gate validation pipeline
- [Regression Tests](@/capabilities/regression-tests.md) -- Mandatory regression test protocol enforced for every bug fix
- [No Mercy](@/capabilities/no-mercy.md) -- Zero-tolerance policy requiring 100% test coverage with no stubs or mocks

## Production Status

**Status**: Production Core
**Total Tests**: 121+ across 3 phases
**Coverage**: 100% on business logic
**Property Tests**: StreamData generators for all core types
**Contract Tests**: Full adapter [protocol](@/glossary/protocol.md) verification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)