+++
title = "Integration Testing"
description = "Comprehensive guide to integration testing -- the practice of verifying that multiple software components, services, and subsystems work correctly together across boundaries, ensuring system-level correctness in the Prismatic Platform."
weight = 50

[extra]
category = "quality"
tags = ["integration-testing", "testing", "quality", "elixir", "exunit", "ecto", "phoenix", "ci-cd", "test-coverage", "verification"]
status = "active"
author = "Tomas Korcak (korczis)"
date_created = "2026-02-22"
date_updated = "2026-02-22"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
key_takeaway = "Integration testing verifies that independently developed components -- modules, services, databases, APIs, and external systems -- interact correctly when combined, catching defects that unit tests miss at component boundaries."
related_terms = ["unit-testing", "testing", "exunit", "test-coverage", "property-based-testing", "quality-gates", "ci-cd", "regression-testing", "performance-testing", "code-coverage"]
aliases = ["integration-tests", "system-integration-testing", "component-integration-testing"]
prerequisites = ["unit-testing", "testing", "elixir"]
see_also = ["unit-testing", "property-based-testing", "regression-testing", "performance-testing"]
word_count = 1814
date_modified = "2026-02-23"
keywords = ["Integration", "Testing", "Comprehensive", "Prismatic", "Platform", "glossary", "quality", "Prismatic Platform", "Phase", "Sandbox"]
image = "/images/sections/glossary.png"
image_alt = "Integration Testing - Prismatic Platform"
+++

## Definition

Integration testing is a software testing methodology that verifies the correct interaction between two or more software components that have been individually unit-tested. Unlike unit tests, which validate isolated functions or modules in controlled environments with mocked dependencies, integration tests exercise real interactions across component boundaries -- database queries against actual database instances, HTTP requests to running service endpoints, message passing between GenServer processes, and data flow through multi-stage pipelines. Integration tests answer the critical question: "Do these components work together correctly?" The scope ranges from narrow integration tests (two components with a real dependency) to broad integration tests (full subsystem or end-to-end request flows).

## Overview

The software testing pyramid places integration testing between unit testing at the base and end-to-end (E2E) testing at the apex. While unit tests are fast, numerous, and focused on individual functions, they cannot detect defects that emerge at component boundaries. A module that correctly parses JSON and another module that correctly queries a database may still fail in integration if they disagree on field names, data types, null handling, or error formats. Integration testing bridges this gap by exercising real interactions across these boundaries.

In the Prismatic Platform's Elixir/Phoenix umbrella architecture, integration testing takes on particular importance due to the system's 115 umbrella applications communicating through well-defined interfaces. Each application has its own supervision tree, its own database schemas, its own GenServer processes, and its own public API surface. Unit tests within a single application verify local correctness, but only integration tests can verify that:

- `PrismaticStorage.Ecto` correctly persists data that `Prismatic.Agents` produces
- `PrismaticWeb` LiveView pages correctly render data fetched through `Prismatic.API`
- `PrismaticPerimeter` security scans correctly integrate with `PrismaticStorage.Core` trait implementations
- Broadway pipelines correctly process messages from source to sink across application boundaries

The BEAM virtual machine provides unique advantages for integration testing. The Ecto Sandbox adapter enables concurrent integration tests against a real PostgreSQL database by wrapping each test in a transaction that rolls back after the test completes. This means integration tests run against genuine database behavior (constraints, indexes, triggers, query plans) without the overhead of database cleanup between tests. ExUnit's built-in async test execution, combined with the BEAM's lightweight process model, allows thousands of integration tests to run concurrently.

The Prismatic Platform organizes integration tests into three phases:

**Phase 1 (36 tests)**: Workflow and Step integration tests that verify multi-step processing pipelines produce correct outputs when components are composed.

**Phase 2 (41 tests)**: Storage, Web, and Agent integration tests that verify cross-application communication, database persistence, LiveView rendering, and agent coordination.

**Phase 3 (44 tests)**: End-to-end tests that exercise complete user journeys from HTTP request through business logic, database persistence, and response rendering.

## Technical Details

### Cross-Application Integration Tests

Integration tests in the Prismatic Platform umbrella verify that applications communicate correctly through their public interfaces:

```elixir
defmodule PrismaticStorage.Integration.AdapterContractTest do
  @moduledoc """
  Integration test suite verifying that storage adapters correctly
  implement the storage contract across real backend systems.
  Runs against actual PostgreSQL, ETS, and Meilisearch instances.
  """

  use ExUnit.Case, async: true

  alias PrismaticStorage.Core.StorageContract
  alias PrismaticStorage.Ecto.Adapter, as: EctoAdapter
  alias PrismaticStorage.ETS.Adapter, as: ETSAdapter

  @adapters [
    {EctoAdapter, :ecto_integration},
    {ETSAdapter, :ets_integration}
  ]

  for {adapter, tag} <- @adapters do
    describe "#{inspect(adapter)} integration" do
      @tag tag
      setup do
        {:ok, pid} = unquote(adapter).start_link(test: true)
        on_exit(fn -> Process.alive?(pid) && GenServer.stop(pid) end)
        %{adapter: unquote(adapter), pid: pid}
      end

      test "stores and retrieves entities with correct types", %{adapter: adapter} do
        entity = %{
          id: Ecto.UUID.generate(),
          name: "Test Entity",
          score: 42.5,
          tags: ["alpha", "beta"],
          metadata: %{"key" => "value"},
          inserted_at: DateTime.utc_now()
        }

        assert {:ok, stored} = StorageContract.store(adapter, entity)
        assert {:ok, retrieved} = StorageContract.fetch(adapter, stored.id)

        assert retrieved.id == entity.id
        assert retrieved.name == entity.name
        assert_in_delta retrieved.score, entity.score, 0.001
        assert retrieved.tags == entity.tags
        assert retrieved.metadata == entity.metadata
      end

      test "handles concurrent writes without data loss", %{adapter: adapter} do
        entities =
          for i <- 1..100 do
            %{id: Ecto.UUID.generate(), name: "Entity #{i}", value: i}
          end

        results =
          entities
          |> Task.async_stream(
            fn entity -> StorageContract.store(adapter, entity) end,
            max_concurrency: 20,
            timeout: 10_000
          )
          |> Enum.map(fn {:ok, result} -> result end)

        assert Enum.all?(results, &match?({:ok, _}, &1))

        stored_count = StorageContract.count(adapter)
        assert {:ok, 100} = stored_count
      end

      test "update-then-fetch returns updated values", %{adapter: adapter} do
        entity = %{id: Ecto.UUID.generate(), name: "Original", version: 1}
        assert {:ok, _} = StorageContract.store(adapter, entity)

        updates = %{name: "Updated", version: 2}
        assert {:ok, updated} = StorageContract.update(adapter, entity.id, updates)
        assert updated.name == "Updated"
        assert updated.version == 2

        assert {:ok, fetched} = StorageContract.fetch(adapter, entity.id)
        assert fetched.name == "Updated"
        assert fetched.version == 2
      end

      test "delete removes entity and subsequent fetch returns error", %{adapter: adapter} do
        entity = %{id: Ecto.UUID.generate(), name: "To Delete"}
        assert {:ok, _} = StorageContract.store(adapter, entity)
        assert {:ok, _} = StorageContract.delete(adapter, entity.id)
        assert {:error, :not_found} = StorageContract.fetch(adapter, entity.id)
      end
    end
  end
end
```

### Phoenix LiveView Integration Tests

LiveView integration tests verify the complete request-response cycle including mount, event handling, and DOM updates:

```elixir
defmodule PrismaticWeb.Integration.PerimeterLiveTest do
  @moduledoc """
  Integration tests for the Perimeter dashboard LiveView.
  Exercises the full stack from LiveView mount through database
  queries to rendered HTML output.
  """

  use PrismaticWeb.ConnCase, async: true
  import Phoenix.LiveViewTest

  alias PrismaticPerimeter.SecurityRating
  alias PrismaticPerimeter.AssetDiscovery

  setup %{conn: conn} do
    user = insert(:user, role: :security_analyst)
    conn = log_in_user(conn, user)

    domain = "integration-test.example.com"

    {:ok, _} =
      AssetDiscovery.register_domain(domain, %{
        organization: "Test Corp",
        ip_addresses: ["93.184.216.34"],
        certificates: [%{issuer: "Let's Encrypt", expires: ~D[2027-01-01]}]
      })

    {:ok, _} =
      SecurityRating.calculate(domain, %{
        tls_score: 90,
        dns_score: 85,
        vulnerability_score: 95,
        compliance_score: 80
      })

    %{conn: conn, domain: domain, user: user}
  end

  describe "dashboard mount and rendering" do
    test "displays security rating for monitored domain", %{conn: conn, domain: domain} do
      {:ok, view, html} = live(conn, "/perimeter")

      assert html =~ domain
      assert html =~ "Security Rating"
      assert has_element?(view, "[data-testid='security-grade']")
    end

    test "asset count updates when new assets are discovered", %{conn: conn, domain: domain} do
      {:ok, view, _html} = live(conn, "/perimeter/assets")

      initial_count =
        view
        |> element("[data-testid='asset-count']")
        |> render()
        |> extract_count()

      AssetDiscovery.register_subdomain(domain, "api.#{domain}", %{
        ip_addresses: ["93.184.216.35"]
      })

      send(view.pid, :refresh_assets)

      updated_count =
        view
        |> element("[data-testid='asset-count']")
        |> render()
        |> extract_count()

      assert updated_count == initial_count + 1
    end

    test "compliance tab renders NIS2 and ZKB assessments", %{conn: conn, domain: domain} do
      {:ok, view, _html} = live(conn, "/perimeter/compliance")

      view
      |> element("[data-testid='domain-selector']")
      |> render_change(%{domain: domain})

      html = render(view)
      assert html =~ "NIS2"
      assert html =~ "ZKB"
      assert html =~ "Compliance Score"
    end
  end

  defp extract_count(html) do
    html
    |> Floki.parse_document!()
    |> Floki.text()
    |> String.trim()
    |> String.to_integer()
  end
end
```

### Broadway Pipeline Integration Tests

Testing multi-stage data processing pipelines end-to-end:

```elixir
defmodule Prismatic.Integration.OsintPipelineTest do
  @moduledoc """
  Integration tests for the OSINT data processing pipeline.
  Verifies the complete flow from source ingestion through
  entity resolution to storage persistence.
  """

  use ExUnit.Case, async: false

  alias Prismatic.OSINT.Pipeline
  alias Prismatic.OSINT.EntityResolver
  alias PrismaticStorage.Ecto.Repo

  @moduletag :integration

  setup do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(Repo)
    Ecto.Adapters.SQL.Sandbox.mode(Repo, {:shared, self()})

    on_exit(fn ->
      Repo.delete_all(Prismatic.OSINT.Entity)
      Repo.delete_all(Prismatic.OSINT.RawRecord)
    end)

    :ok
  end

  describe "end-to-end pipeline processing" do
    test "ingests raw OSINT data and produces resolved entities" do
      raw_records = [
        %{source: "ares", ico: "12345678", name: "Test Company s.r.o.", address: "Prague 1"},
        %{source: "justice", ico: "12345678", name: "Test Company s.r.o.", court: "Prague Municipal Court"},
        %{source: "isir", ico: "12345678", name: "Test Company", status: "active"}
      ]

      results =
        raw_records
        |> Enum.map(&Pipeline.ingest/1)
        |> Enum.map(fn {:ok, record} -> record end)

      assert length(results) == 3

      {:ok, entities} = EntityResolver.resolve_by_ico("12345678")

      assert length(entities) == 1
      entity = hd(entities)

      assert entity.ico == "12345678"
      assert entity.canonical_name == "Test Company s.r.o."
      assert length(entity.source_records) == 3
      assert MapSet.new(entity.sources) == MapSet.new(["ares", "justice", "isir"])
    end

    test "handles conflicting data from multiple sources" do
      raw_records = [
        %{source: "ares", ico: "87654321", name: "Alpha Corp", address: "Brno"},
        %{source: "justice", ico: "87654321", name: "Alpha Corporation", address: "Brno, Czech Republic"}
      ]

      Enum.each(raw_records, fn record ->
        assert {:ok, _} = Pipeline.ingest(record)
      end)

      {:ok, entities} = EntityResolver.resolve_by_ico("87654321")
      entity = hd(entities)

      assert entity.confidence_score > 0.8
      assert entity.name_variants == ["Alpha Corp", "Alpha Corporation"]
    end
  end
end
```

## Implementation

Implementing effective integration testing in an Elixir umbrella project follows several key patterns:

**Test Organization**: Integration tests live alongside the application they primarily test but exercise cross-application boundaries. The `test/integration/` subdirectory within each umbrella app contains tests that reach beyond the application's own modules. Common test utilities (factories, fixtures, helper functions) reside in shared support modules.

**Database Strategy**: The Ecto Sandbox adapter wraps each test in a database transaction that rolls back on completion. For async tests, each test process gets an isolated database connection. For tests that require shared state (such as testing PubSub notifications triggered by database writes), the sandbox is set to shared mode. This strategy provides real database behavior with zero cleanup overhead.

**Service Dependencies**: Integration tests that depend on external services (Meilisearch, Redis, external APIs) use one of two strategies. For services available in CI, tests run against real instances started via Docker Compose. For unavailable services, Mox-based behaviour mocks are used, but these are explicitly flagged as "narrow integration tests" rather than full integration tests.

**Test Tagging**: ExUnit tags categorize tests by scope and dependency. Tags like `@tag :integration`, `@tag :database`, `@tag :external_api`, and `@tag :slow` enable selective test execution. CI pipelines run all tags; local development can exclude slow or external-dependent tests for rapid feedback.

**Fixture Management**: Test factories (using ExMachina or custom factory modules) generate realistic test data with valid relationships and constraints. Factories produce minimal valid entities by default but support trait-based customization for specific test scenarios.

**Assertion Patterns**: Integration tests use eventually-consistent assertions for async operations, checking conditions within a timeout rather than asserting immediately. The `assert_eventually` helper retries assertions for up to 5 seconds, accommodating the inherent asynchronicity of message-passing and background processing.

## Comparison

| Test Type | Scope | Speed | Confidence | Maintenance |
|-----------|-------|-------|------------|-------------|
| **Unit Tests** | Single function/module | Very fast (ms) | Local correctness | Low |
| **Narrow Integration** | Two components + real dependency | Fast (100ms) | Boundary correctness | Medium |
| **Broad Integration** | Subsystem or feature | Medium (seconds) | Feature correctness | Medium-High |
| **End-to-End (E2E)** | Full user journey | Slow (seconds-minutes) | System correctness | High |
| **Property-Based** | Function properties | Variable | Invariant correctness | Medium |
| **Performance** | Throughput/latency | Slow | Non-functional correctness | High |
| **Contract** | API interface conformance | Fast | Interface correctness | Low |

Integration tests occupy the middle ground of the testing pyramid, providing substantially more confidence than unit tests at a moderate cost in execution speed and maintenance burden. The Prismatic Platform's 121-test suite distributes roughly equally across unit-focused (Phase 1), integration-focused (Phase 2), and E2E-focused (Phase 3) tests.

## Best Practices

1. **Test Real Dependencies**: Use actual databases, actual message brokers, and actual file systems whenever possible. Mocking hides integration bugs by definition. The Ecto Sandbox makes PostgreSQL testing fast and isolated; use it instead of in-memory substitutes.

2. **Keep Tests Independent**: Each integration test must set up its own state and not depend on execution order or side effects from other tests. Use ExUnit's `setup` and `on_exit` callbacks to ensure clean state. Async-safe tests scale better and catch concurrency bugs.

3. **Focus on Boundaries**: Integration tests should exercise the seams between components, not re-test internal logic already covered by unit tests. Test that module A's output is correctly consumed by module B, not the internal computations of either module.

4. **Use Realistic Data**: Test with data that resembles production data in structure, variety, and edge cases. Include unicode strings, null values, maximum-length fields, and boundary dates. Factories should generate varied data, not identical records.

5. **Fail Fast with Clear Messages**: Integration test failures should clearly indicate which boundary failed and why. Use descriptive test names, specific assertions, and context in error messages. A failure in "stores and retrieves entities with correct types" is more debuggable than "integration test 47 failed."

6. **Control External Time**: Tests that depend on timestamps should use controllable time sources. Inject time dependencies rather than calling `DateTime.utc_now()` directly in code under test. This enables testing time-dependent behavior without flaky sleep-based approaches.

7. **Parallelize Aggressively**: The BEAM's concurrency model supports thousands of concurrent test processes. Use `async: true` wherever tests are isolated. The Ecto Sandbox's per-process connection pooling enables safe concurrent database tests.

8. **Integrate into CI/CD**: Integration tests must run on every commit, not just before releases. The CI pipeline should mirror the production dependency stack (same PostgreSQL version, same Meilisearch version) to catch environment-specific failures early.

## Pitfalls

**Test Flakiness**: Integration tests that depend on timing, network availability, or shared state are prone to intermittent failures. Flaky tests erode team confidence in the test suite and lead to "retry and ignore" culture. Eliminate flakiness by using deterministic assertions, proper test isolation, and eventually-consistent assertion helpers.

**Slow Test Suites**: Integration tests are inherently slower than unit tests. Without discipline, test suite execution time grows unbounded. Mitigate by running tests in parallel, using database sandbox (not truncation/reset), minimizing fixture setup, and tagging slow tests for selective execution.

**Testing Implementation Details**: Integration tests that assert on internal database state, process mailbox contents, or GenServer internal state are brittle and break on refactoring. Test through public interfaces: HTTP responses, function return values, observable side effects.

**Insufficient Coverage at Boundaries**: Teams often write integration tests that exercise the happy path but neglect error cases at boundaries. What happens when the database connection drops mid-transaction? When an external API returns malformed JSON? When a GenServer process crashes during a multi-step operation? Boundary error handling is where the most critical bugs hide.

**Shared Test State**: Tests that write to shared ETS tables, global process registries, or filesystem paths without cleanup create order-dependent failures. Each test must own its state completely and clean up after itself.

**Mock Overuse**: Replacing real dependencies with mocks in integration tests defeats the purpose. If a test mocks the database, it is a unit test with extra steps, not an integration test. Reserve mocks for truly external, unavailable dependencies.

## Use Cases

**Database Migration Verification**: After applying a new Ecto migration, integration tests verify that existing queries still return correct results, new columns are populated correctly, and data type changes do not break downstream processing. This catches migration-induced regressions before they reach production.

**API Version Compatibility**: When releasing a new API version, integration tests verify backward compatibility by sending requests in the old format and verifying correct responses. This ensures that existing clients continue working after the upgrade.

**Multi-Application Workflow**: The Prismatic Platform's OSINT pipeline spans `prismatic_agents` (data collection), `prismatic_storage_ecto` (persistence), `prismatic_storage_meilisearch` (search indexing), and `prismatic_web` (dashboard display). Integration tests verify the complete flow from data ingestion to dashboard rendering.

**Authentication and Authorization Flow**: Integration tests verify the complete authentication flow: user login, JWT token generation, token refresh, protected resource access, and token expiration. These tests catch integration failures between the auth module, session storage, and protected endpoints.

**Supervision Tree Recovery**: Integration tests deliberately crash child processes and verify that supervision trees restart them correctly, that state is recovered from persistent storage, and that dependent processes handle the temporary unavailability gracefully.

## Related Concepts

Integration testing connects to the broader testing and quality ecosystem:

- [Unit Testing](/glossary/unit-testing/) -- testing individual functions and modules in isolation, forming the foundation that integration tests build upon
- [Testing](/glossary/testing/) -- the overall discipline of software verification including all test types and methodologies
- [ExUnit](/glossary/exunit/) -- the built-in Elixir test framework providing the test runner, assertions, and setup callbacks
- [Test Coverage](/glossary/test-coverage/) -- measuring what percentage of code is exercised by tests, including integration test contributions
- [Property-Based Testing](/glossary/property-based-testing/) -- testing invariant properties over randomly generated inputs, complementing example-based integration tests
- [Regression Testing](/glossary/regression-testing/) -- re-running tests after changes to detect unintended breakages, where integration tests catch boundary regressions
- [CI/CD](/glossary/ci-cd/) -- continuous integration pipelines that automatically execute integration tests on every commit
- [Quality Gates](/glossary/quality-gates/) -- automated checks that block merges when integration tests fail
- [Code Coverage](/glossary/code-coverage/) -- quantitative measurement of test effectiveness across the codebase
- [Ecto](/glossary/ecto/) -- the database library providing the Sandbox adapter essential for isolated integration tests

## See Also

- [Performance Testing](/glossary/performance-testing/) -- verifying non-functional requirements under load conditions
- [Chaos Engineering](/glossary/chaos-engineering/) -- deliberately injecting failures to test system resilience
- [Broadway](/glossary/broadway/) -- the concurrent data processing library whose pipelines are prime integration test targets
- [Phoenix LiveView](/glossary/phoenix-liveview/) -- the server-rendered UI framework with built-in integration testing support
- [Supervision Tree](/glossary/supervision-tree/) -- OTP supervision hierarchies whose recovery behavior is verified through integration tests

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | Part of the Prismatic Platform Glossary | Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
