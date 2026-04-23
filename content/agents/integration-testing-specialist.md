+++
title = "integration-testing-specialist"
weight = 211
[extra]
domain = "quality"
level = "L3"
description = "End-to-end integration testing across system boundaries"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["qdp", "cascade", "no-mercy", "no-doubts", "trinity-gate", "aiad", "property-based-testing", "telemetry", "genstage", "ets"]
domain_normalized = "quality"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1650
quality_score = 92
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["integration-testing-specialist", "End-to-end", "agents", "agent", "Prismatic Platform", "Medium", "Integration", "GenServer", "PubSub", "The Integration"]
tags = ["agents", "agent", "integration-testing-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "integration-testing-specialist - Prismatic Platform"
+++

## Overview

The Integration Testing Specialist operates as an L3 strategic command agent within the Quality domain of the Prismatic Platform. This agent designs, executes, and maintains end-to-end integration tests that verify correct behavior across system boundaries -- between umbrella applications, external services, database layers, and inter-process communication channels. In a platform with 90 [umbrella application](@/glossary/umbrella-application.md)s that communicate through [GenServer](@/glossary/genserver.md) calls, [PubSub](@/glossary/pubsub.md) events, and database operations, integration testing is the primary defense against cross-boundary regression.

Unit tests verify individual module behavior; integration tests verify that modules work together correctly. The Integration Testing Specialist focuses on the boundaries between components where assumptions break down: API contract mismatches, data format inconsistencies, timing-dependent interactions, and state management across process boundaries. This agent produces test suites that exercise real interaction paths, using actual database connections and process communication rather than mocks.

## Operational Domain

The Quality domain encompasses all testing, static analysis, and quality assurance activities within the Prismatic Platform. The Integration Testing Specialist specifically targets cross-boundary testing that other testing agents cannot cover. It works alongside the [test-specialist](@/agents/test-specialist.md) (unit testing), the [cascade-quality-specialist](@/agents/cascade-quality-specialist.md) (quality pattern enforcement), and the [mandatory-regression-prevention-commander](@/agents/mandatory-regression-prevention-commander.md) (regression test enforcement).

## Integration Test Categories

The specialist maintains test suites across five distinct integration categories, each targeting a different type of cross-boundary interaction.

| Category | Boundary Tested | Test Strategy | Typical Test Count |
|---|---|---|---|
| Application-to-Application | Inter-app function calls | Contract testing with real modules | High |
| Database Integration | [Ecto](@/glossary/ecto.md) queries across schemas | Sandbox mode with real PostgreSQL | High |
| Process Communication | GenServer, PubSub, [GenStage](@/glossary/genstage.md) | Real process spawning | Medium |
| External Service | API clients, webhooks | Recorded responses (VCR pattern) | Medium |
| LiveView Integration | [Phoenix](@/glossary/phoenix.md) LiveView components | Connected LiveView tests | Medium |

## Test Architecture

```elixir
defmodule PrismaticAgents.IntegrationTestSpecialist do
  @moduledoc """
  Integration test orchestration engine.
  Manages cross-boundary test execution with proper isolation
  and dependency ordering.
  """

  @type test_suite :: %{
    category: atom(),
    modules: [module()],
    dependencies: [atom()],
    setup_requirements: [atom()],
    estimated_duration_ms: non_neg_integer()
  }

  @spec run_integration_suite(atom(), keyword()) :: {:ok, test_result()} | {:error, term()}
  def run_integration_suite(category, opts \\ []) do
    with {:ok, suite} <- load_suite(category),
         {:ok, deps} <- verify_dependencies(suite),
         {:ok, env} <- setup_test_environment(suite),
         {:ok, results} <- execute_tests(suite, env, opts),
         :ok <- teardown_environment(env) do
      {:ok, results}
    end
  end

  defp verify_dependencies(suite) do
    missing = Enum.filter(suite.dependencies, fn dep ->
      not dependency_available?(dep)
    end)

    case missing do
      [] -> {:ok, suite.dependencies}
      deps -> {:error, {:missing_dependencies, deps}}
    end
  end
end
```

## Contract Testing Pattern

The specialist enforces contract testing at application boundaries. Each umbrella application that exposes a public API defines a contract module that specifies the expected input and output types. Integration tests verify that callers and callees agree on the contract.

```elixir
defmodule PrismaticStorage.Contract do
  @moduledoc "Storage adapter contract for integration testing."

  @callback store(key :: String.t(), value :: term()) :: {:ok, term()} | {:error, term()}
  @callback fetch(key :: String.t()) :: {:ok, term()} | {:error, :not_found}
  @callback delete(key :: String.t()) :: :ok | {:error, term()}
end

defmodule PrismaticStorage.ContractTest do
  @moduledoc "Contract compliance test for storage adapters."

  defmacro __using__(opts) do
    adapter = Keyword.fetch!(opts, :adapter_module)

    quote do
      use ExUnit.Case, async: true

      @adapter unquote(adapter)

      test "store/2 returns {:ok, _} for valid input" do
        assert {:ok, _} = @adapter.store("test_key", "test_value")
      end

      test "fetch/1 returns {:ok, _} for existing key" do
        {:ok, _} = @adapter.store("existing", "value")
        assert {:ok, "value"} = @adapter.fetch("existing")
      end

      test "fetch/1 returns {:error, :not_found} for missing key" do
        assert {:error, :not_found} = @adapter.fetch("nonexistent_key")
      end
    end
  end
end
```

## Test Execution Strategy

| Strategy | When Used | Isolation Level | Speed |
|---|---|---|---|
| Parallel async | Independent test modules | Full process isolation | Fast |
| Sequential | Tests with shared state dependencies | Shared sandbox | Medium |
| Ordered execution | Tests with explicit ordering requirements | Controlled setup/teardown | Slow |
| Smoke suite | Post-deployment verification | Production-like environment | Fast (subset) |

## Key Capabilities

- **Cross-application contract testing** verifying that inter-application interfaces maintain backward compatibility and type correctness across all 90 umbrella applications
- **Database integration testing** executing tests against real [PostgreSQL](@/glossary/postgresql.md) instances in sandbox mode, testing complex queries, transactions, and migration correctness
- **Process communication testing** verifying GenServer call/cast/info handling, PubSub event propagation, and GenStage producer-consumer contracts with real OTP processes
- **LiveView integration testing** testing [LiveView](@/glossary/liveview.md) components with connected test fixtures that exercise real-time update paths, event handling, and state management
- **[Property-based testing](@/glossary/property-based-testing.md)** using StreamData to generate random inputs that test integration boundaries under unexpected conditions
- **Test dependency management** automatically detecting and ordering tests based on their infrastructure dependencies to prevent flaky failures from missing prerequisites

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md). Multi-domain coordination and specialized operational command. The Integration Testing Specialist has authority to define integration test requirements for any application boundary and block releases that fail integration test suites.

## Coordination

| Agent | Relationship | Purpose |
|---|---|---|
| [test-specialist](@/agents/test-specialist.md) | Unit Test Partner | Coordinates unit vs integration test boundary definition |
| [cascade-quality-specialist](@/agents/cascade-quality-specialist.md) | Quality Patterns | Ensures integration tests cover CASCADE pattern scenarios |
| [mandatory-regression-prevention-commander](@/agents/mandatory-regression-prevention-commander.md) | Regression Tests | Ensures bug fixes include integration-level regression tests |
| [database-specialist](@/agents/database-specialist.md) | Database Tests | Coordinates database-specific integration test design |

## Integration

| Component | Relationship |
|---|---|
| [Quality Gates](@/glossary/quality-gates.md) | Integration tests as mandatory quality gate |
| [GitLab CI](@/glossary/gitlab-ci.md)/CD | Automated integration test execution in pipelines |
| [ETS](@/glossary/ets.md) | Test state management for cross-process test coordination |
| Platform [Telemetry](@/glossary/telemetry.md) | Test execution metrics and flakiness detection |

## Enforcement

All integration testing operates under the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine. No application boundary may exist without corresponding integration tests. Failed integration tests block merge requests without exception. Integration test suites must achieve deterministic results -- flaky tests are treated as bugs requiring immediate investigation. The [Trinity Gate](@/glossary/trinity-gate.md) validation requires that integration test coverage claims are verified through actual test execution evidence, not estimated from code analysis.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)