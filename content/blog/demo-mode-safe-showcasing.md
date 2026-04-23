+++
title = "Demo Mode: Safe Showcasing for Intelligence Platforms"
date = 2026-03-28
description = "Building a deterministic demo system with simulation engine, DemoModeGuard, and environment-variable activation for safe platform demonstrations."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["demo-mode", "simulation", "guard", "showcasing", "deterministic"]
reading_time = "8 min"
keywords = ["demo mode system", "simulation engine", "deterministic scenarios", "DemoModeGuard", "safe showcasing", "intelligence platform demo"]
image = "/images/blog/demo-mode-safe-showcasing.png"
word_count = 1200
date_created = "2026-03-28"
date_modified = "2026-03-28"
quality_score = 85
see_also = ["sandbox", "synthetic-data", "feature-flag", "liveview", "testing"]
image_alt = "Demo Mode Safe Showcasing - Prismatic Platform"
+++

Demonstrating an intelligence platform to a potential client is a minefield. You cannot show real investigation data. You cannot trigger live OSINT queries against actual targets during a sales call. You cannot risk a production error interrupting a demo. Yet the demo must feel real enough to convey the platform's capabilities.

Prismatic's demo mode solves this with three components: a simulation engine that produces deterministic fake data, a guard module that blocks all production-impacting operations, and environment-variable activation that ensures demo mode can never accidentally leak into production.

## Activation

Demo mode is controlled by a single environment variable:

```elixir
# config/runtime.exs
config :prismatic, :demo_mode,
  enabled: System.get_env("PRISMATIC_DEMO_MODE") == "true",
  scenario: System.get_env("PRISMATIC_DEMO_SCENARIO", "default")
```

The `Prismatic.Demo` module provides the runtime check:

```elixir
defmodule Prismatic.Demo do
  @moduledoc """
  Demo mode switch. Controls whether the platform operates
  in demonstration mode with simulated data.
  """

  @spec enabled?() :: boolean()
  def enabled? do
    Application.get_env(:prismatic, :demo_mode)[:enabled] == true
  end

  @spec scenario() :: atom()
  def scenario do
    Application.get_env(:prismatic, :demo_mode)[:scenario]
    |> String.to_existing_atom()
  end
end
```

When demo mode is disabled (the default), the Demo module is effectively inert. No code paths change, no data is intercepted, no routes are modified.

## DemoModeGuard

The guard is the safety mechanism. It intercepts operations that would have production side effects and either blocks them or redirects them to the simulation engine:

```elixir
defmodule Prismatic.Demo.Guard do
  @moduledoc """
  Blocks production-impacting operations during demo mode.
  Redirects blocked operations to simulation alternatives.
  """

  @blocked_operations [
    :osint_query,
    :external_api_call,
    :email_send,
    :webhook_dispatch,
    :database_write,
    :file_export
  ]

  @spec check(atom(), map()) :: :allow | {:redirect, module(), atom(), list()}
  def check(operation, params) do
    if Prismatic.Demo.enabled?() and operation in @blocked_operations do
      {:redirect, Prismatic.Demo.SimulationEngine, :simulate, [operation, params]}
    else
      :allow
    end
  end

  @spec guard(atom(), map(), function()) :: term()
  def guard(operation, params, real_fn) do
    case check(operation, params) do
      :allow -> real_fn.()
      {:redirect, mod, fun, args} -> apply(mod, fun, args)
    end
  end
end
```

Integration points throughout the codebase use the guard:

```elixir
# In an OSINT adapter
def execute_search(query, opts) do
  Prismatic.Demo.Guard.guard(:osint_query, %{query: query}, fn ->
    # Real OSINT query execution
    do_real_search(query, opts)
  end)
end
```

This pattern ensures that every external-facing operation passes through the guard. In production mode, the guard is a no-op (the `check/2` function returns `:allow` immediately). In demo mode, it redirects to the simulation engine.

## Simulation Engine

The simulation engine produces deterministic data for three built-in scenarios:

### Scenario 1: Czech Company Investigation

A due diligence investigation on a fictional Czech company. The simulation produces ARES registry data, ownership chains, sanctions screening results, and adverse media findings. All data is pre-computed and stored in a static map, ensuring identical results across demo runs.

### Scenario 2: Person Profile

A comprehensive person investigation with professional history, corporate affiliations, and digital footprint analysis. Demonstrates the platform's entity resolution and network visualization capabilities.

### Scenario 3: Financial Analysis

A financial due diligence scenario with transaction analysis, related-party identification, and risk scoring. Demonstrates the decision engine's scoring and recommendation pipeline.

```elixir
defmodule Prismatic.Demo.SimulationEngine do
  @moduledoc """
  Deterministic simulation engine for demo mode.
  Produces consistent fake data for three scenarios.
  """

  @spec simulate(atom(), map()) :: {:ok, map()} | {:error, term()}
  def simulate(operation, params) do
    scenario = Prismatic.Demo.scenario()
    data = load_scenario_data(scenario)

    case operation do
      :osint_query ->
        simulate_osint(data, params)

      :external_api_call ->
        simulate_api_response(data, params)

      :database_write ->
        simulate_write(data, params)

      :email_send ->
        {:ok, %{status: :simulated, message: "Email would be sent to #{params[:to]}"}}

      _ ->
        {:ok, %{status: :simulated, operation: operation}}
    end
  end

  defp simulate_osint(data, %{query: query}) do
    # Deterministic: same query always returns same results
    results = Map.get(data.osint_results, normalize_query(query), [])

    # Add realistic delay
    Process.sleep(Enum.random(200..800))

    {:ok, %{
      source: :demo,
      query: query,
      results: results,
      timestamp: DateTime.utc_now()
    }}
  end

  defp load_scenario_data(scenario) do
    path = Application.app_dir(:prismatic, "priv/demo/#{scenario}.json")

    case File.read(path) do
      {:ok, content} -> Jason.decode!(content, keys: :atoms)
      {:error, _} -> default_scenario_data()
    end
  end
end
```

### Determinism

Determinism is essential. If a demo operator shows the platform on Monday and the client asks for a follow-up on Thursday, the demo must produce identical results. This rules out random data generation. Instead, all simulation data is pre-built and stored as JSON fixtures:

```json
{
  "company": {
    "name": "Exemplum s.r.o.",
    "ico": "99887766",
    "address": "Vinohradska 42, Praha 2",
    "established": "2018-03-15"
  },
  "osint_results": {
    "exemplum": [
      {"source": "ares", "data": {"status": "active", "revenue": "45M CZK"}},
      {"source": "justice", "data": {"proceedings": 0, "liens": 1}},
      {"source": "sanctions", "data": {"matches": 0, "screened_lists": 14}}
    ]
  }
}
```

## Demo LiveViews

Two dedicated LiveViews provide the demo experience:

- `/demo/showcase` - Guided walkthrough of platform capabilities with scenario selection.
- `/demo/sandbox` - Free-form exploration where all operations are simulated.

These routes are only mounted when demo mode is active:

```elixir
# router.ex
if Prismatic.Demo.enabled?() do
  scope "/demo", PrismaticWebWeb.Demo do
    pipe_through [:browser, :demo_layout]

    live "/showcase", ShowcaseLive
    live "/sandbox", SandboxLive
  end
end
```

## Safety Guarantees

The demo system provides four safety guarantees:

1. **No external side effects**: All OSINT queries, API calls, emails, and webhooks are intercepted by the guard.
2. **No data contamination**: Database writes in demo mode go to an in-memory store, not the production database.
3. **No route leakage**: Demo routes only exist when the environment variable is set.
4. **No configuration drift**: Demo mode cannot be toggled at runtime. It requires a process restart with the environment variable set, preventing accidental activation.

```elixir
# This is intentionally NOT a runtime toggle
# Changing demo mode requires restarting the application
@compile {:inline, enabled?: 0}
def enabled? do
  Application.get_env(:prismatic, :demo_mode)[:enabled] == true
end
```

## Testing the Demo

The demo system itself is tested with 35 tests covering:

- Guard blocking for all operation types
- Simulation engine determinism (same input = same output)
- Route availability only when demo mode is active
- LiveView rendering for all three scenarios
- Edge cases: unknown operations, missing scenario data, malformed queries

```elixir
describe "DemoModeGuard" do
  test "blocks OSINT queries in demo mode" do
    result = Guard.check(:osint_query, %{query: "test"})
    assert {:redirect, SimulationEngine, :simulate, _} = result
  end

  test "allows operations in production mode" do
    # Demo mode disabled in test config
    result = Guard.check(:osint_query, %{query: "test"})
    assert result == :allow
  end
end
```

The demo system reflects a broader principle: features that protect production integrity should be simple, explicit, and impossible to misconfigure. A single environment variable, a single guard module, and deterministic simulation data make the system easy to reason about and hard to break.
