+++
title = "Feature Flag"
weight = 52
[extra]
category = "architecture"
description = "Runtime toggle enabling or disabling features without code deployment, supporting gradual rollouts, A/B testing, and operational kill switches in Elixir/OTP systems."
related_terms = ["continuous-deployment", "blue-green-deployment", "canary-release", "ets", "phoenix", "genserver", "telemetry", "circuit-breaker"]
use_cases = ["Gradual feature rollout", "A/B testing", "Operational kill switch", "Per-tenant customization", "Trunk-based development"]
key_benefit = "Decouples code deployment from feature release, enabling safe incremental rollouts"
platforms = ["Prismatic Platform", "Phoenix", "OTP"]
programming_languages = ["Elixir", "Erlang"]
difficulty = "Intermediate"
prerequisites = ["Elixir", "GenServer", "ETS", "Phoenix"]
flag_types = ["Release", "Experiment", "Ops", "Permission"]
storage_backends = ["ETS", "Application env", "PostgreSQL", "External service"]
evaluation_latency = "Microseconds (ETS-backed)"
lifecycle_stages = ["Created", "Testing", "Rolling out", "Fully released", "Cleanup"]
cleanup_policy = "Remove within 1-2 sprints after full rollout"
enforcement_level = "Test both paths mandatory"
date_created = "2026-02-22"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1533
date_modified = "2026-02-23"
keywords = ["Feature", "Flag", "Runtime", "ElixirOTP", "glossary", "architecture", "Prismatic Platform", "GenServer"]
tags = ["glossary", "architecture", "feature-flag", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Feature Flag - Prismatic Platform"
+++

## Definition and Overview

A feature flag (also called feature toggle, feature switch, or feature gate) is a software engineering technique that allows developers to enable or disable features at runtime without deploying new code. Feature flags decouple the act of deploying code to production from the act of releasing features to users, enabling trunk-based development, gradual rollouts, A/B testing, instant kill switches for problematic features, and per-tenant customization. At their core, feature flags are conditional statements that check a configuration source to determine whether a code path should execute.

The concept originated in the early 2000s as a practice within continuous delivery pipelines, but has since evolved into a sophisticated discipline with dedicated tooling, lifecycle management, and governance practices. Feature flags can be categorized into several types: **release flags** (short-lived, controlling feature rollout), **experiment flags** (A/B testing with metrics collection), **ops flags** (operational controls like [circuit breakers](/glossary/circuit-breaker/)), and **permission flags** (long-lived, controlling feature access by user role or subscription tier). Each type has different lifecycle expectations and cleanup requirements.

Feature flags represent a fundamental shift in how software teams think about releases. Instead of the traditional model where deployment equals release, feature flags enable a model where code is deployed continuously but features are released independently, on their own schedules, to specific user segments. This separation of concerns is particularly valuable in large-scale platforms like Prismatic, where multiple teams contribute to a shared codebase of 115 umbrella applications.

## Historical Context and Evolution

Feature flags trace their origins to the early practices of continuous integration and delivery. Martin Fowler popularized the concept in 2010 with his article on feature toggles, but the practice existed informally in companies like Flickr and Facebook well before that. The evolution from simple boolean configuration values to sophisticated targeting systems with user segments, percentage rollouts, and real-time streaming updates represents a maturation of the practice into a first-class engineering discipline.

In the Elixir/OTP ecosystem, feature flags benefit from the BEAM virtual machine's unique properties. Hot code reloading allows flag configuration changes to propagate without restart. [ETS](/glossary/ets/) tables provide microsecond-level lookup performance for flag evaluation. [GenServer](/glossary/genserver/) processes can manage flag lifecycle and refresh cycles with OTP supervision guarantees. The combination of these capabilities makes Elixir an exceptionally good platform for implementing feature flag systems.

The evolution of feature flag taxonomy has settled on four primary categories, each with distinct characteristics:

| Flag Type | Lifespan | Decision Maker | Example |
|-----------|----------|-----------------|---------|
| **Release** | Days to weeks | Engineering | `easm_v2_scanning` |
| **Experiment** | Weeks to months | Product/Data | `pricing_page_variant` |
| **Ops** | Minutes to permanent | Operations | `heavy_osint_enrichment` |
| **Permission** | Permanent | Business | `enterprise_compliance_module` |

## Technical Deep Dive

Feature flag evaluation follows a decision tree that considers multiple inputs:

| Input | Description | Example |
|-------|-------------|---------|
| **Flag Key** | Unique identifier for the feature | `easm_advanced_scanning` |
| **Default Value** | Fallback when flag is undefined | `false` |
| **User Context** | Properties of the requesting user | `%{role: :admin, tenant: "acme"}` |
| **Environment** | Deployment environment | `:staging`, `:production` |
| **Percentage** | Gradual rollout percentage | `25` (25% of users) |
| **Rules** | Targeting rules for specific segments | `role == :admin AND tenant in ["acme", "globex"]` |

The evaluation pipeline processes these inputs in priority order: explicit user overrides take precedence, then targeting rules, then percentage-based rollout, and finally the default value. This layered approach allows fine-grained control over who sees what.

In Elixir/OTP systems, feature flag state can be stored in several backends depending on performance and distribution requirements:

```elixir
defmodule Prismatic.FeatureFlags do
  @moduledoc """
  Feature flag evaluation with ETS-cached state.
  Flags are loaded from application config at startup
  and can be updated at runtime via the management API.

  ## Architecture

  The feature flag system uses a layered architecture:
  1. Configuration source (config.exs, database, external service)
  2. GenServer managing state and refresh cycles
  3. ETS table for O(1) concurrent read access
  4. Evaluation engine processing rules, percentages, and overrides
  5. Telemetry integration for usage tracking

  ## Examples

      iex> Prismatic.FeatureFlags.enabled?(:easm_advanced_scanning)
      true

      iex> Prismatic.FeatureFlags.enabled?(:ai_drift_detection, %{environment: :staging})
      false
  """

  use GenServer

  require Logger

  @table :feature_flags
  @refresh_interval :timer.minutes(5)

  @type flag_config :: %{
    enabled: boolean(),
    rules: [map()],
    percentage: non_neg_integer(),
    metadata: map()
  }

  @type context :: %{
    optional(:user_id) => String.t(),
    optional(:role) => atom(),
    optional(:tenant) => String.t(),
    optional(:environment) => atom()
  }

  # Client API

  @spec enabled?(atom(), context()) :: boolean()
  def enabled?(flag_key, context \\ %{}) do
    case :ets.lookup(@table, flag_key) do
      [{^flag_key, config}] ->
        result = evaluate(config, context)
        emit_telemetry(flag_key, result, context)
        result

      [] ->
        emit_telemetry(flag_key, false, context)
        false
    end
  end

  @spec all_flags() :: [{atom(), flag_config()}]
  def all_flags do
    :ets.tab2list(@table)
  end

  @spec set(atom(), flag_config()) :: :ok
  def set(flag_key, config) do
    GenServer.call(__MODULE__, {:set_flag, flag_key, config})
  end

  @spec flag_info(atom()) :: {:ok, flag_config()} | {:error, :not_found}
  def flag_info(flag_key) do
    case :ets.lookup(@table, flag_key) do
      [{^flag_key, config}] -> {:ok, config}
      [] -> {:error, :not_found}
    end
  end

  # Server callbacks

  @impl true
  def init(_opts) do
    table = :ets.new(@table, [:named_table, :set, :protected, read_concurrency: true])
    load_flags_from_config(table)
    schedule_refresh()
    {:ok, %{table: table, refresh_count: 0}}
  end

  @impl true
  def handle_call({:set_flag, key, config}, _from, state) do
    :ets.insert(state.table, {key, config})
    Logger.info("Feature flag #{key} updated", flag: key, enabled: config.enabled)
    {:reply, :ok, state}
  end

  @impl true
  def handle_info(:refresh, state) do
    load_flags_from_config(state.table)
    schedule_refresh()
    {:noreply, %{state | refresh_count: state.refresh_count + 1}}
  end

  # Evaluation logic

  defp evaluate(%{enabled: false}, _context), do: false
  defp evaluate(%{enabled: true, rules: []}, _context), do: true

  defp evaluate(%{enabled: true, rules: rules, percentage: pct}, context) do
    cond do
      matches_rules?(rules, context) -> true
      pct > 0 -> within_percentage?(context, pct)
      true -> false
    end
  end

  defp matches_rules?(rules, context) do
    Enum.any?(rules, fn rule ->
      Enum.all?(rule, fn {key, expected} ->
        Map.get(context, key) == expected
      end)
    end)
  end

  defp within_percentage?(context, percentage) do
    hash = :erlang.phash2(Map.get(context, :user_id, :rand.uniform()), 100)
    hash < percentage
  end

  defp load_flags_from_config(table) do
    flags = Application.get_env(:prismatic, :feature_flags, %{})

    Enum.each(flags, fn {key, config} ->
      :ets.insert(table, {key, config})
    end)
  end

  defp schedule_refresh do
    Process.send_after(self(), :refresh, @refresh_interval)
  end

  defp emit_telemetry(flag_key, result, context) do
    :telemetry.execute(
      [:prismatic, :feature_flags, :evaluation],
      %{result: if(result, do: 1, else: 0)},
      %{flag: flag_key, context: context}
    )
  end
end
```

Consistent hashing for percentage-based rollouts ensures that a given user always sees the same flag state, preventing flickering behavior where a feature appears and disappears on subsequent requests. The hash is computed from a stable user identifier, not from random values.

## Architecture and Implementation

Feature flag architecture in OTP applications follows a layered design:

```
Configuration Source (config.exs / database / external service)
        |
        v
  Flag Store (GenServer + ETS)
        |
        v
  Evaluation Engine (rules, percentages, overrides)
        |
        v
  Application Code (conditional feature execution)
        |
        v
  Telemetry (flag evaluation metrics, usage tracking)
```

**Storage Layer**: Flags are stored in [ETS](/glossary/ets/) for O(1) lookup performance. The ETS table is owned by a dedicated [GenServer](/glossary/genserver/) that handles flag updates, periodic refresh from the configuration source, and flag lifecycle management. Using ETS ensures that flag evaluation never blocks on a GenServer call, which is critical for high-throughput request paths.

**Lifecycle Management**: Feature flags must be actively managed through their lifecycle. A release flag that has been fully rolled out (100% of users) should be cleaned up by removing the flag check from code and the flag definition from configuration. Stale flags create technical debt and confusion. The lifecycle stages are: **created** (defined but disabled), **testing** (enabled for internal users), **rolling out** (enabled for increasing percentages), **fully released** (enabled for all), and **cleanup** (flag removed from code).

**Configuration Sources**: Flags can originate from multiple sources depending on the deployment model:

| Source | Latency | Dynamic Updates | Complexity |
|--------|---------|-----------------|------------|
| `config.exs` | Zero (compiled) | Requires redeploy | Minimal |
| Application env | Zero (in-memory) | Runtime via `Application.put_env` | Low |
| [ETS](/glossary/ets/) table | Microseconds | Instant via GenServer | Medium |
| Database (PostgreSQL) | Milliseconds | Instant, persistent | Medium |
| External service (LaunchDarkly) | Network RTT | Real-time streaming | High |

## Usage in Prismatic Platform

The Prismatic Platform uses feature flags managed through application configuration and ETS-cached runtime state. Feature flags serve several critical functions across the platform:

**Module Activation**: New capabilities such as EASM modules, AI drift detection, and vision analysis can be enabled per-environment or per-tenant without redeployment:

```elixir
# In a LiveView or controller
defmodule PrismaticWeb.PerimeterLive do
  use PrismaticWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    socket =
      socket
      |> assign(:easm_enabled, Prismatic.FeatureFlags.enabled?(:easm_advanced_scanning))
      |> assign(:nis2_enabled, Prismatic.FeatureFlags.enabled?(:nis2_compliance_assessment))
      |> assign(:vision_enabled, Prismatic.FeatureFlags.enabled?(:vision_analysis,
           %{environment: socket.assigns.environment}))

    {:ok, socket}
  end
end
```

**Agent Activation**: The AIAD agent system supports feature-flagged agent activation, allowing experimental agents to run in staging while remaining disabled in production:

```elixir
defmodule Prismatic.Agents.Registry do
  @moduledoc """
  Agent registry with feature flag gating for controlled activation
  of experimental agents across environments.
  """

  @spec active_agents() :: [agent()]
  def active_agents do
    all_agents()
    |> Enum.filter(fn agent ->
      Prismatic.FeatureFlags.enabled?(
        String.to_existing_atom("agent_#{agent.id}"),
        %{environment: Mix.env()}
      )
    end)
  end
end
```

**Operational Controls**: Feature flags serve as operational [circuit breakers](/glossary/circuit-breaker/), allowing operators to disable resource-intensive features under load without a deployment cycle:

```elixir
# config/runtime.exs
config :prismatic, :feature_flags, %{
  easm_advanced_scanning: %{
    enabled: true,
    rules: [%{environment: :production}],
    percentage: 100
  },
  ai_drift_detection: %{
    enabled: true,
    rules: [%{environment: :staging}],
    percentage: 0
  },
  heavy_osint_enrichment: %{
    enabled: true,
    rules: [],
    percentage: 50  # Gradual rollout at 50%
  }
}
```

## Distributed Flag Synchronization

In distributed Elixir deployments running across multiple BEAM nodes, feature flag state must remain consistent. The Prismatic Platform handles this through several mechanisms:

```elixir
defmodule Prismatic.FeatureFlags.Distributor do
  @moduledoc """
  Distributes feature flag changes across BEAM cluster nodes
  using pg (process groups) for node discovery and direct
  message passing for flag state propagation.
  """

  @spec broadcast_change(atom(), flag_config()) :: :ok
  def broadcast_change(flag_key, config) do
    nodes = Node.list()

    Enum.each(nodes, fn node ->
      :rpc.cast(node, Prismatic.FeatureFlags, :set, [flag_key, config])
    end)

    :ok
  end

  @spec sync_from_source() :: {:ok, non_neg_integer()} | {:error, term()}
  def sync_from_source do
    case fetch_flags_from_database() do
      {:ok, flags} ->
        Enum.each(flags, fn {key, config} ->
          Prismatic.FeatureFlags.set(key, config)
        end)

        broadcast_all(flags)
        {:ok, map_size(flags)}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp fetch_flags_from_database do
    # Database-backed flag persistence for production
    {:ok, %{}}
  end

  defp broadcast_all(flags) do
    Enum.each(flags, fn {key, config} ->
      broadcast_change(key, config)
    end)
  end
end
```

## Flag Lifecycle Management

Managing the lifecycle of feature flags prevents flag debt -- the accumulation of stale conditional branches that clutter the codebase:

| Stage | Duration | Actions | Monitoring |
|-------|----------|---------|------------|
| **Created** | 0 days | Flag defined, code deployed, flag disabled | Verify deployment success |
| **Testing** | 1-5 days | Enabled for internal users/staging | Monitor for errors |
| **Rolling Out** | 1-2 weeks | Percentage increased incrementally | Track metrics, error rates |
| **Fully Released** | 1-2 sprints | Enabled for 100%, schedule cleanup | Monitor stability |
| **Cleanup** | 1 day | Remove flag checks, delete flag definition | Verify no references remain |

```elixir
defmodule Prismatic.FeatureFlags.Lifecycle do
  @moduledoc """
  Tracks feature flag lifecycle stages and enforces cleanup deadlines.
  Flags that exceed their expected lifecycle generate warnings.
  """

  @type lifecycle_stage :: :created | :testing | :rolling_out | :released | :cleanup

  @max_age_days %{
    release: 30,
    experiment: 90,
    ops: :permanent,
    permission: :permanent
  }

  @spec check_stale_flags() :: {:ok, [stale_flag()]} | {:error, term()}
  def check_stale_flags do
    flags = Prismatic.FeatureFlags.all_flags()
    now = Date.utc_today()

    stale =
      flags
      |> Enum.filter(fn {_key, config} ->
        max_age = Map.get(@max_age_days, config.metadata[:type], 30)
        max_age != :permanent and Date.diff(now, config.metadata[:created_at]) > max_age
      end)
      |> Enum.map(fn {key, config} -> %{key: key, age_days: Date.diff(now, config.metadata[:created_at])} end)

    {:ok, stale}
  end
end
```

## Testing Feature Flags

Testing both code paths of every feature flag is mandatory. Feature flag conditionals create implicit branches that can harbor untested behavior:

```elixir
defmodule PrismaticWeb.PerimeterLiveTest do
  use ExUnit.Case, async: true

  describe "with EASM scanning enabled" do
    setup do
      Prismatic.FeatureFlags.set(:easm_advanced_scanning, %{
        enabled: true, rules: [], percentage: 100, metadata: %{}
      })

      :ok
    end

    test "renders advanced scanning UI" do
      # Test the enabled path
    end
  end

  describe "with EASM scanning disabled" do
    setup do
      Prismatic.FeatureFlags.set(:easm_advanced_scanning, %{
        enabled: false, rules: [], percentage: 0, metadata: %{}
      })

      :ok
    end

    test "hides advanced scanning UI" do
      # Test the disabled path
    end
  end
end
```

## Best Practices

**Name Flags Descriptively**: Use clear, action-oriented names like `easm_advanced_scanning` rather than vague names like `new_feature` or `flag_42`. Include the domain and capability in the name.

**Set Expiration Dates**: Every release flag should have a defined cleanup date. After full rollout, schedule flag removal within one or two sprints. Flag debt accumulates quickly and creates maintenance burden.

**Default to Disabled**: New flags should default to `false` (disabled) in production. This ensures that deploying flag-gated code has no user impact until the flag is explicitly enabled.

**Test Both Paths**: Write tests that exercise both the enabled and disabled code paths using [ExUnit](/glossary/exunit/). Feature flag conditionals create implicit branches that can harbor untested behavior.

**Use Telemetry for Flag Evaluation Tracking**: Emit [telemetry](/glossary/telemetry/) events on flag evaluation to understand usage patterns and identify stale flags that are always returning the same value.

**Avoid Nested Flags**: Do not create flag dependencies where one flag's behavior depends on another flag's state. This creates exponential complexity in testing and reasoning about system behavior.

## Common Pitfalls

**Flag Debt**: The most common problem is accumulating stale flags that are never cleaned up. Over time, the codebase becomes littered with conditional branches that always evaluate to the same value, making code harder to read and maintain.

**Testing Gaps**: Failing to test both the enabled and disabled paths of a feature flag leads to production surprises when a flag is toggled. Both paths must have comprehensive test coverage.

**Performance Impact**: Evaluating flags on hot code paths can become a bottleneck if the flag store requires network calls. Always use [ETS](/glossary/ets/)-cached flag state for request-path evaluation, refreshing from slower sources on a background schedule.

**Inconsistent State Across Nodes**: In distributed deployments, flag state must be synchronized across all [BEAM](/glossary/beam/) nodes. A flag change that propagates to some nodes but not others creates inconsistent user experiences. Use distributed ETS, database-backed flags, or an external flag service with local caching.

**Boolean-Only Thinking**: Feature flags are not limited to boolean values. They can return strings, integers, or configuration maps. Thinking of flags as purely on/off limits their utility for A/B testing (where you need variant identifiers) and operational controls (where you need threshold values).

**Long-Lived Release Flags**: Release flags that persist beyond their rollout period become permission flags by default, but without the governance and documentation that permission flags require. Either clean up the flag or formally reclassify it.

## Comparison with Alternative Approaches

| Approach | Dynamic | Granular | Complexity | Use Case |
|----------|---------|----------|------------|----------|
| **Feature Flags** | Yes | Per-user/segment | Medium | Runtime feature control |
| **Environment Variables** | Restart needed | Per-environment | Low | Static configuration |
| **Config Files** | Restart needed | Per-environment | Low | Application settings |
| **Branch Deploys** | Yes | Per-branch | High | Feature preview environments |
| **A/B Testing Platforms** | Yes | Per-user | High | Experimentation |

## Related Concepts

- [Continuous Deployment](/glossary/continuous-deployment/) - Deployment practice enabled by feature flag safety nets
- [Blue-Green Deployment](/glossary/blue-green-deployment/) - Complementary zero-downtime deployment strategy
- [Canary Release](/glossary/canary-release/) - Gradual rollout strategy often combined with feature flags
- [ETS](/glossary/ets/) - In-memory store caching feature flag state for fast evaluation
- [GenServer](/glossary/genserver/) - Process managing feature flag state and refresh cycles
- [Telemetry](/glossary/telemetry/) - Metrics system tracking flag evaluation patterns
- [Circuit Breaker](/glossary/circuit-breaker/) - Operational pattern that feature flags can implement
- [Phoenix](/glossary/phoenix/) - Web framework integrating feature flags in LiveView and controllers
- [BEAM](/glossary/beam/) - Virtual machine enabling hot code reloading for flag updates
- [ExUnit](/glossary/exunit/) - Test framework for verifying both flag paths

## See Also

- [Architecture](/architecture/) - Feature management architecture patterns
- [Technologies](/technologies/) - Runtime configuration infrastructure
- [Apps](/apps/) - Umbrella applications using feature flags

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
