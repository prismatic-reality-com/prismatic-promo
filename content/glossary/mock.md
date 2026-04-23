+++
title = "Mock"
weight = 50
[extra]
description = "A mock is a test double that simulates the behavior of a real dependency by providing pre-programmed responses and recording interactions, enabling isolated unit testing but often masking integration issues -- the Prismatic Platform forbids mocks in production code"
category = "quality"
subcategory = "testing"
difficulty = "intermediate"
technology_type = "testing_technique"
platform_component = "quality_enforcement"
paradigm = "test_isolation"
prerequisite_concepts = ["unit_testing", "dependency_injection", "behaviour", "interface_segregation"]
use_cases = ["unit_testing", "external_api_isolation", "deterministic_testing", "parallel_test_execution"]
benefits = ["test_speed", "determinism", "independence_from_external_systems", "parallel_execution"]
implementation_patterns = ["behaviour_injection", "mox_expectations", "contract_testing", "sandbox_modules"]
quality_metrics = ["mock_drift_rate", "false_positive_rate", "integration_coverage", "mock_to_real_ratio"]
integration_points = ["mox", "exunit", "behaviours", "application_config", "pre_commit_hooks"]
related_disciplines = ["software_testing", "test_driven_development", "dependency_injection", "design_patterns"]
related_terms = ["property-test", "mutation-testing", "quality-floor", "behaviour", "exunit", "test-coverage", "integration-test", "genserver", "protocol", "adapter-pattern", "dependency-injection", "sandbox", "fixture", "assertion"]
tags = ["glossary", "mock", "testing", "test-double", "isolation", "forbidden-pattern", "quality"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
quality_score = 92
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "The Prismatic Platform enforces a zero-mocks-in-production-code policy, preferring behaviour-based dependency injection and real implementations over simulated test doubles"
date_created = "2026-02-24"
date_modified = "2026-04-08"
keywords = ["mock", "test double", "mocking", "Mox", "test isolation", "fake", "stub", "forbidden pattern", "dependency injection", "behaviour", "contract testing", "sandbox"]
image = "/images/sections/glossary.png"
image_alt = "Mock - Prismatic Platform"
word_count = 3800
see_also = ["capabilities", "architecture", "quality-floor"]
+++

## Definition

A mock is a test double -- an object or module that replaces a real dependency during testing with a controlled substitute that returns pre-programmed responses and optionally records how it was called. Mocks enable isolated [unit testing](/glossary/exunit/) by decoupling the code under test from its dependencies: a test for a service that calls an external [API](/glossary/api/) can use a mock API client that returns predictable responses without network access. This isolation makes tests faster, more deterministic, and independent of external system availability.

However, mocks carry significant risks. They can diverge from real implementation behavior, creating tests that pass against mocks but fail against real dependencies ("mock drift"). They couple tests to implementation details (verifying that specific methods were called in specific order) rather than behavior (verifying that the output is correct). Over-reliance on mocks can produce test suites with high [coverage](/glossary/test-coverage/) but low confidence -- tests that verify interactions with fakes rather than correctness of behavior.

## Overview

### The Test Double Taxonomy

The term "mock" is frequently used as a catch-all for test doubles, but the testing literature distinguishes several distinct types, each serving different purposes:

| Type | Behavior | Records Calls | Verification | Use Case |
|------|----------|---------------|-------------|----------|
| **Dummy** | Does nothing, satisfies type requirements | No | None | Filling required parameters |
| **Stub** | Returns fixed, pre-configured responses | No | State-based | Providing canned data |
| **Spy** | Delegates to real implementation | Yes | Interaction + State | Verifying side effects |
| **Mock** | Returns pre-programmed responses | Yes | Interaction-based | Verifying communication |
| **Fake** | Simplified working implementation | No | State-based | In-memory databases, sandboxes |

The distinction matters because each type creates different coupling between tests and implementation:

- **State-based verification** (stubs, fakes): Tests assert on outputs. Refactoring that changes internal communication but preserves outputs doesn't break tests.
- **Interaction-based verification** (mocks, spies): Tests assert on method calls. Any refactoring that changes how components communicate breaks tests, even if behavior is preserved.

### The Fundamental Critique

The fundamental critique of mocking (articulated in "Mocks Aren't Stubs" by Martin Fowler and in the testing literature) is that mocks verify interactions (how code communicates with dependencies) while [assertions](/glossary/assertion/) verify outcomes (what code produces). Interaction testing is brittle: refactoring that changes how a result is computed (but not what result is produced) breaks mock-based tests unnecessarily.

Consider a function that fetches user data and formats a greeting:

```elixir
# Interaction test (mock-based, brittle):
expect(MockUserRepo, :get_by_id, fn 42 -> %{name: "Alice"} end)
assert "Hello, Alice!" == Greeter.greet(42)
# Breaks if Greeter refactors to use get_by_email instead

# Outcome test (state-based, resilient):
insert_user(%{id: 42, name: "Alice"})
assert "Hello, Alice!" == Greeter.greet(42)
# Survives internal refactoring as long as output is correct
```

This doesn't mean mocks are never appropriate -- they're valuable at system boundaries where real implementations are impractical (third-party APIs, payment processors, email services). The key is using them at the right granularity.

## Technical Deep Dive

### Mox: The Elixir Standard

In the [Elixir](/glossary/elixir/) ecosystem, [Mox](https://hex.pm/packages/mox) is the standard mocking library, designed by Jose Valim. It enforces a critical constraint: **you can only mock [behaviours](/glossary/behaviour/)**. This "mock only what you own" principle ensures that mock boundaries align with architectural boundaries. You cannot mock arbitrary modules or functions -- you must first define a behaviour (callback specification), then mock that behaviour.

```elixir
# Step 1: Define the behaviour (the contract)
defmodule MyApp.HTTPClient do
  @callback get(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  @callback post(String.t(), map(), keyword()) :: {:ok, map()} | {:error, term()}
end

# Step 2: Define the mock (in test_helper.exs)
Mox.defmock(MyApp.MockHTTPClient, for: MyApp.HTTPClient)

# Step 3: Configure expectations in tests
expect(MyApp.MockHTTPClient, :get, fn url ->
  assert url =~ "api.example.com"
  {:ok, %{status: 200, body: %{"data" => "value"}}}
end)
```

Mox's design has several properties that mitigate common mocking pitfalls:

1. **Behaviour enforcement**: Mocks must implement the same callbacks as real modules, preventing mock/real API divergence at the type level
2. **Process isolation**: Each test process gets its own mock expectations, enabling concurrent test execution
3. **Verification**: `verify_on_exit!` ensures all expected calls were made, catching under-specification
4. **Strict expectations**: By default, unexpected calls raise errors, catching over-specification
5. **Allowances**: `allow/3` shares mock configuration across processes for async tests

### Mock Drift: The Silent Killer

Mock drift occurs when a mock's behavior diverges from the real implementation it replaces. This creates tests that pass against the mock but fail against reality. Common causes:

| Drift Type | Example | Detection |
|-----------|---------|-----------|
| **API drift** | Real API adds a required header; mock doesn't check | Contract tests |
| **Behavior drift** | Real implementation returns `{:error, :timeout}`; mock only returns `{:ok, _}` | Error path testing |
| **Schema drift** | Real response adds new fields; mock returns old schema | Schema validation |
| **Performance drift** | Real implementation is slow; mock is instant | Integration tests |
| **Side effect drift** | Real implementation writes logs; mock doesn't | Observability tests |

The Prismatic Platform mitigates mock drift through **contract tests** -- tests that verify the mock's behaviour specification matches the real implementation's actual behavior:

```elixir
# Contract test: verifies real and mock implement the same behaviour
defmodule MyApp.HTTPClientContractTest do
  use ExUnit.Case

  # Test against real implementation
  describe "Tesla implementation" do
    @tag :integration
    test "get/2 returns {:ok, map} for valid URLs" do
      assert {:ok, %{status: _}} = MyApp.HTTPClient.Tesla.get("https://httpbin.org/get")
    end

    test "get/2 returns {:error, _} for invalid URLs" do
      assert {:error, _} = MyApp.HTTPClient.Tesla.get("https://nonexistent.invalid")
    end
  end

  # Same tests against mock -- if these pass but real fails, you have drift
end
```

### Alternatives to Mocking

The testing literature offers several strategies that reduce or eliminate the need for mocks:

#### 1. Behaviour-Based Dependency Injection

The most common Prismatic Platform pattern. Define a [behaviour](/glossary/behaviour/), implement it with a real module and a test-friendly module, and swap via configuration:

```elixir
# The behaviour (contract)
defmodule PrismaticOsintCore.HTTPClient.Behaviour do
  @callback get(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  @callback post(String.t(), map(), keyword()) :: {:ok, map()} | {:error, term()}
end

# Real implementation
defmodule PrismaticOsintCore.HTTPClient.Tesla do
  @behaviour PrismaticOsintCore.HTTPClient.Behaviour

  @impl true
  def get(url, opts \\ []) do
    case Tesla.get(url, opts) do
      {:ok, %Tesla.Env{status: status, body: body}} ->
        {:ok, %{status: status, body: body}}
      {:error, reason} ->
        {:error, {:http_error, reason}}
    end
  end

  @impl true
  def post(url, body, opts \\ []) do
    case Tesla.post(url, body, opts) do
      {:ok, %Tesla.Env{status: status, body: body}} ->
        {:ok, %{status: status, body: body}}
      {:error, reason} ->
        {:error, {:http_error, reason}}
    end
  end
end

# Test-friendly sandbox (a fake, not a mock)
defmodule PrismaticOsintCore.HTTPClient.Sandbox do
  @behaviour PrismaticOsintCore.HTTPClient.Behaviour

  @impl true
  def get(url, _opts) do
    case url do
      "https://api.example.com/healthy" ->
        {:ok, %{status: 200, body: %{"status" => "ok"}}}
      "https://api.example.com/error" ->
        {:ok, %{status: 500, body: %{"error" => "internal"}}}
      _ ->
        {:error, :not_found}
    end
  end

  @impl true
  def post(_url, _body, _opts) do
    {:ok, %{status: 201, body: %{"created" => true}}}
  end
end
```

Configuration swap:

```elixir
# config/config.exs
config :prismatic_osint_core, :http_client, PrismaticOsintCore.HTTPClient.Tesla

# config/test.exs
config :prismatic_osint_core, :http_client, PrismaticOsintCore.HTTPClient.Sandbox
```

#### 2. Property-Based Testing

[Property-based testing](/glossary/property-test/) with StreamData generates hundreds of random inputs, providing stronger guarantees than mock-based scenario tests for pure functions:

```elixir
property "JSON round-trip preserves data" do
  check all data <- StreamData.map_of(StreamData.string(:alphanumeric), StreamData.integer()) do
    assert {:ok, ^data} = data |> Jason.encode!() |> Jason.decode!() |> then(&{:ok, &1})
  end
end
```

#### 3. Ecto Sandbox

For database interactions, [Ecto](/glossary/ecto/)'s SQL Sandbox provides real database access in tests with automatic rollback, eliminating the need to mock the repository:

```elixir
setup do
  :ok = Ecto.Adapters.SQL.Sandbox.checkout(Prismatic.Repo)
end

test "creates an entity" do
  # Uses real database, rolled back after test
  assert {:ok, entity} = Entities.create(%{name: "Test Corp", type: "company"})
  assert entity.name == "Test Corp"
end
```

#### 4. Process-Based Isolation

The BEAM's [process](/glossary/process/) model enables a unique testing pattern: start a real [GenServer](/glossary/genserver/) with test-specific configuration rather than mocking it:

```elixir
test "worker processes messages correctly" do
  {:ok, worker} = Worker.start_link(
    source: :in_memory,
    batch_size: 1,
    handler: self()  # Send results to test process
  )

  Worker.enqueue(worker, %{type: "test_event"})

  assert_receive {:processed, %{type: "test_event"}}, 1000
end
```

## Usage in Prismatic Platform

### Zero-Mocks-in-Production Policy

The Prismatic Platform's Forbidden Patterns Enforcement explicitly blocks `Mox.defmock` in production code (`lib/` directories). The pre-commit [pipeline](/glossary/pipeline/) scans for mock-related patterns and rejects commits that introduce them outside test directories. This policy reflects the platform's NMND doctrine: production code must use real implementations, not simulated substitutes.

```bash
# Pre-commit check (Phase 8: Forbidden Patterns)
# Scans lib/ for mock-related patterns:
# - Mox.defmock
# - :meck (Erlang mocking library)
# - mock_* function definitions in lib/
```

### Approved Testing Patterns

Instead of mocks, the platform uses three approved patterns:

1. **Behaviour-based injection**: Modules depend on behaviour specifications, and the real implementation is configured via application environment or function parameters
2. **Real lightweight implementations**: For external APIs, the platform provides sandbox modules that hit real test endpoints rather than simulated responses
3. **Property-based testing**: StreamData generators exercise code with hundreds of random inputs, providing stronger guarantees than mock-based scenario tests

### Where Mox Is Permitted

In test code (`test/` directories), Mox usage is permitted for testing modules that interact with external systems where real [integration](/glossary/integration/) would be impractical:

- Third-party OSINT APIs with rate limits
- Payment processors (no sandbox available)
- Email delivery services
- External webhook consumers
- Rate-limited government registries (ARES, Justice.cz)

Even in these cases, the platform requires contract tests that verify the mock's behaviour specification matches the real implementation's actual behavior.

### Quality Floor Enforcement

The [Quality Floor](/glossary/quality-floor/) Guardian monitors mock usage across the test suite. A module with more than 50% of its tests relying on mocks triggers an advisory warning. The rationale: if most tests for a module need mocks, the module likely has too many external dependencies and should be refactored to separate pure logic from I/O.

```elixir
# Quality Floor mock ratio check
defmodule PrismaticSafety.MockAuditor do
  @moduledoc """
  Audits test files for mock dependency ratio.
  Warns when >50% of tests in a file use Mox expectations.
  """

  @spec audit_file(String.t()) :: {:ok, float()} | {:warning, float(), String.t()}
  def audit_file(test_file_path) do
    content = File.read!(test_file_path)
    total_tests = Regex.scan(~r/\btest\b/, content) |> length()
    mock_tests = Regex.scan(~r/\bexpect\(|stub\(/, content) |> length()

    ratio = if total_tests > 0, do: mock_tests / total_tests, else: 0.0

    if ratio > 0.5 do
      {:warning, ratio, "#{test_file_path}: #{round(ratio * 100)}% mock-dependent tests"}
    else
      {:ok, ratio}
    end
  end
end
```

## Code Examples

### Complete Behaviour-Based Architecture

```elixir
# 1. Define the behaviour (contract)
defmodule PrismaticOsintCore.Source.Behaviour do
  @moduledoc """
  Behaviour for OSINT data sources.
  All adapters must implement this contract.
  """

  @callback search(map()) :: {:ok, list(map())} | {:error, term()}
  @callback health_check() :: :ok | {:error, term()}
  @callback rate_limit_status() :: {:ok, map()}
end

# 2. Real implementation
defmodule PrismaticOsintSources.CzechAres do
  @moduledoc """
  Czech ARES business registry adapter.
  """
  @behaviour PrismaticOsintCore.Source.Behaviour

  @impl true
  def search(%{query: query}) do
    http_client = Application.get_env(:prismatic_osint_core, :http_client)

    case http_client.get("https://ares.gov.cz/api/v1/search?q=#{URI.encode(query)}") do
      {:ok, %{status: 200, body: body}} ->
        {:ok, parse_results(body)}
      {:ok, %{status: status}} ->
        {:error, {:api_error, status}}
      {:error, reason} ->
        {:error, {:network_error, reason}}
    end
  end

  @impl true
  def health_check do
    http_client = Application.get_env(:prismatic_osint_core, :http_client)

    case http_client.get("https://ares.gov.cz/api/v1/health") do
      {:ok, %{status: 200}} -> :ok
      _ -> {:error, :unhealthy}
    end
  end

  @impl true
  def rate_limit_status do
    {:ok, %{remaining: 100, reset_at: DateTime.utc_now() |> DateTime.add(60, :second)}}
  end

  defp parse_results(body) when is_map(body) do
    Map.get(body, "results", [])
  end
end

# 3. Test with Mox (in test/ only)
defmodule PrismaticOsintSources.CzechAresTest do
  use ExUnit.Case
  import Mox

  setup :verify_on_exit!

  describe "search/1" do
    test "returns parsed results on success" do
      expect(MockHTTPClient, :get, fn url ->
        assert url =~ "ares.gov.cz"
        {:ok, %{status: 200, body: %{"results" => [%{"ico" => "12345"}]}}}
      end)

      assert {:ok, [%{"ico" => "12345"}]} =
        PrismaticOsintSources.CzechAres.search(%{query: "test"})
    end

    test "returns error on API failure" do
      expect(MockHTTPClient, :get, fn _url ->
        {:ok, %{status: 500, body: %{}}}
      end)

      assert {:error, {:api_error, 500}} =
        PrismaticOsintSources.CzechAres.search(%{query: "test"})
    end

    test "handles network errors" do
      expect(MockHTTPClient, :get, fn _url ->
        {:error, :timeout}
      end)

      assert {:error, {:network_error, :timeout}} =
        PrismaticOsintSources.CzechAres.search(%{query: "test"})
    end
  end
end
```

### Anti-Pattern: What NOT to Do

```elixir
# ❌ FORBIDDEN: Mock in production code
defmodule PrismaticWeb.SomeController do
  # This would be caught by pre-commit Phase 8
  @http_client Mox.defmock(MockClient, for: HTTPClient)  # ❌ NMND violation

  def index(conn, _params) do
    # ...
  end
end

# ❌ ANTI-PATTERN: Mocking internal modules
# Don't mock modules you own -- refactor instead
expect(MockUserService, :get_user, fn id -> %{id: id, name: "Test"} end)
# If you need to mock UserService, it's a sign that UserService
# does too much (violates single responsibility)

# ❌ ANTI-PATTERN: Over-specified mock expectations
expect(MockDB, :query, fn "SELECT * FROM users WHERE id = $1", [42] ->
  {:ok, [%{id: 42, name: "Alice"}]}
end)
# This test breaks if you change the SQL, even if the result is correct
# Prefer testing the output, not the query

# ✅ CORRECT: Test the behavior, not the implementation
insert_user(%{id: 42, name: "Alice"})
assert %{name: "Alice"} = UserService.get_user(42)
```

## When Mocking Is Justified

Despite the platform's strong anti-mock stance, there are legitimate cases where mocking is the pragmatic choice:

| Scenario | Why Mock | Alternative (if available) |
|----------|----------|---------------------------|
| Third-party API with rate limits | Can't hit real API in CI | Record/replay (VCR cassettes) |
| Payment processor | Can't charge real cards | Processor's test mode |
| Email delivery | Don't want to send real emails | [Bamboo](https://hex.pm/packages/bamboo) test adapter |
| Clock/time | Need deterministic timestamps | `Clock` [behaviour](/glossary/behaviour/) |
| Random number generation | Need reproducible tests | Seeded PRNG |
| External webhooks | Can't receive real webhooks | Local webhook receiver |
| Government APIs (ARES, OR) | Rate-limited, occasionally down | Cached responses + contract tests |

The decision framework: **mock at system boundaries, test with real implementations within boundaries**. If the dependency is inside your system (another module, a GenServer, a database), prefer real implementations. If it's outside your system (external HTTP API, email service, payment processor), mocking is acceptable.

## Historical Context

The debate over mocking has a long history in software testing:

- **2004**: Martin Fowler publishes "Mocks Aren't Stubs," distinguishing classicist (state-based) and mockist (interaction-based) testing schools
- **2007**: Growing Object-Oriented Software, Guided by Tests (GOOS) popularizes mock-driven TDD in Java
- **2010s**: The pendulum swings back -- "Don't Mock What You Don't Own" becomes accepted wisdom
- **2017**: Jose Valim publishes "Mocks and explicit contracts" for Elixir, establishing the behaviour-first pattern that Mox implements
- **2020s**: The Elixir community largely converges on behaviour injection + Ecto Sandbox + property testing as the preferred testing strategy, with Mox reserved for system boundaries

The Prismatic Platform's anti-mock stance reflects the mature Elixir community consensus: the BEAM's process model, Ecto's sandbox, and behaviour-based injection make most mocking unnecessary. The remaining cases (external APIs) are handled by Mox with contract testing to prevent drift.

## Best Practices

Use [behaviour](/glossary/behaviour/)-based dependency injection as the primary mechanism for swappable dependencies -- this enables testing without mocks while maintaining clean architecture. When mocks are necessary in tests, mock only at architectural boundaries (HTTP clients, database adapters), never at internal module boundaries.

Verify mock expectations with `verify_on_exit!` to ensure expected calls actually occur. Write contract tests that verify mock specifications match real implementation behavior. Prefer [property-based tests](/glossary/property-test/) over mock-based scenario tests for pure functions.

Never mock time -- use a `Clock` behaviour with a real implementation and a controllable test implementation. Never mock the database -- use [Ecto](/glossary/ecto/) SQL Sandbox for real database access with automatic rollback.

Keep mock expectations minimal: specify only what the test needs to verify. Over-specified expectations (exact argument matching, call order assertions) make tests brittle. Prefer `stub/3` over `expect/3` when you don't need to verify the call was made.

Monitor your mock-to-real ratio: if more than 30% of your test assertions involve mocks, the codebase likely needs architectural refactoring to reduce external dependencies in business logic.

## Related Terms

- [Behaviour](/glossary/behaviour/) -- Elixir callback specification that defines mockable contracts
- [Property Test](/glossary/property-test/) -- testing approach preferred over mocking for pure functions
- [Mutation Testing](/glossary/mutation-testing/) -- test quality assessment that reveals mock-masking issues
- [Quality Floor](/glossary/quality-floor/) -- quality standard that forbids production mocks
- [ExUnit](/glossary/exunit/) -- Elixir's testing framework that integrates with Mox
- [Test Coverage](/glossary/test-coverage/) -- metric that high-mock tests inflate artificially
- [Integration Test](/glossary/integration-test/) -- tests that exercise real dependencies, catching what mocks miss
- [Adapter Pattern](/glossary/adapter-pattern/) -- pattern that enables behaviour-based injection
- [Dependency Injection](/glossary/dependency-injection/) -- design pattern that makes mocking possible
- [GenServer](/glossary/genserver/) -- OTP pattern tested with process isolation rather than mocks
- [Protocol](/glossary/protocol/) -- Elixir dispatch mechanism that serves as an alternative to behaviour-based mocking
- [Assertion](/glossary/assertion/) -- the state-based verification alternative to mock-based interaction testing
- [Sandbox](/glossary/sandbox/) -- test-friendly environment that replaces mocking for database access
- [Ecto](/glossary/ecto/) -- database wrapper whose SQL Sandbox eliminates database mocking

## See Also

- [Architecture](/architecture/) -- dependency injection architecture
- [Capabilities](/capabilities/) -- testing capabilities and strategies
- [Quality Gates](/quality/) -- quality enforcement that monitors mock usage
- [NMND Doctrine](/nmnd/) -- the doctrine behind zero-mocks-in-production policy

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
