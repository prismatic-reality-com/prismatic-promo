+++
title = "OTP Supervision Tree Optimization"
weight = 3
[extra]
description = "Testing different supervision strategies, restart policies, and process topologies across 90 umbrella applications"
category = "architecture"
status = "active"
difficulty = "advanced"
glossary_terms = ["no-mercy", "no-doubts", "cascade", "quality-dna"]
related_lab = ["agent-prototyping", "multi-agent-coordination", "pipeline-experimentation"]
technologies = ["elixir", "otp", "ets", "genserver"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 820
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["OTP", "Supervision", "Tree", "Optimization", "Testing", "lab", "architecture", "Prismatic Platform", "Topology", "Domain"]
tags = ["lab", "architecture", "otp-supervision-tree-optimization", "prismatic"]
quality_score = 80
see_also = ["technologies", "capabilities", "agents"]
image = "/images/sections/lab.png"
image_alt = "OTP Supervision Tree Optimization - Prismatic Platform"
+++

## Hypothesis

We hypothesize that restructuring the Prismatic Platform's supervision trees from a flat `:one_for_one` topology to a domain-partitioned hierarchical topology with mixed restart strategies will reduce cascading failure propagation by 80% and improve cold-start time by 45%, while maintaining the platform's zero-downtime guarantee under single-node failure conditions.

## Background

The Prismatic Platform runs 90 umbrella applications under [OTP](/technologies/erlang-otp/) supervision. The original architecture followed a straightforward pattern: each application defines a top-level [Supervisor](/technologies/supervisor/) with `:one_for_one` strategy, starting children in dependency order. This simplicity served the platform well through the first 40 applications, but scaling beyond that introduced three systemic problems.

First, cascading failures. When a storage backend process crashes, it can trigger restart storms in dependent processes across multiple applications. With `:one_for_one`, each process restarts independently, potentially reconnecting to backends that are still recovering. This creates thundering herd effects that can take 30-60 seconds to stabilize.

Second, cold-start time. Sequential process startup across 90 applications takes 12.4 seconds on average. Many of these startups are independent and could execute in parallel, but the flat supervision hierarchy enforces serial ordering.

Third, resource isolation. A misbehaving process in one domain (such as an agent consuming excessive memory) can affect processes in unrelated domains because they share the same supervision boundary.

The `prismatic_supervisor` application was built to address these issues through compositional supervision with dependency-aware startup, domain partitioning, and pluggable registry backends ([ETS](/technologies/ets/) for development, Horde for production clustering).

## Methodology

We evaluated four supervision topologies against identical failure injection scenarios:

**Topology A: Flat (Baseline)** -- Current production topology. Each of 90 applications has a `:one_for_one` supervisor with children started sequentially.

**Topology B: Domain-Partitioned** -- Applications grouped into 8 domains (Storage, Intelligence, Security, Web, Agent, Evolution, Infrastructure, Analysis). Each domain gets a dedicated supervisor with domain-appropriate restart strategy.

**Topology C: Hierarchical with Rest-for-One** -- Similar to B, but critical dependencies within domains use `:rest_for_one` to ensure dependent processes restart when their dependencies crash.

**Topology D: Full Compositional** -- The `prismatic_supervisor` implementation with dependency graph resolution, parallel startup within independent subgraphs, and runtime health monitoring.

Failure scenarios injected:

1. **Single process crash** -- Kill one worker process, measure recovery time
2. **Storage backend failure** -- Simulate PostgreSQL connection loss for 10 seconds
3. **Domain cascade** -- Kill all processes in the Intelligence domain simultaneously
4. **Memory pressure** -- Force one process to allocate 500MB, triggering OS memory pressure
5. **Network partition** -- Simulate 5-second network partition between application groups

## Setup

The domain-partitioned supervisor configuration:

```elixir
defmodule PrismaticSupervisor.DomainConfig do
  @domains %{
    storage: %{
      strategy: :rest_for_one,
      max_restarts: 5,
      max_seconds: 30,
      apps: [
        :prismatic_storage_core,
        :prismatic_storage_ets,
        :prismatic_storage_ecto,
        :prismatic_storage_meilisearch,
        :prismatic_storage_kuzu
      ]
    },
    intelligence: %{
      strategy: :one_for_one,
      max_restarts: 10,
      max_seconds: 60,
      apps: [
        :prismatic_agents,
        :prismatic_osint,
        :prismatic_visitor_intelligence,
        :prismatic_deduction
      ]
    },
    security: %{
      strategy: :one_for_all,
      max_restarts: 3,
      max_seconds: 10,
      apps: [
        :prismatic_perimeter,
        :prismatic_auth,
        :prismatic_compliance,
        :prismatic_dark
      ]
    }
  }

  @spec domain_for(atom()) :: atom()
  def domain_for(app) do
    Enum.find_value(@domains, :uncategorized, fn {domain, config} ->
      if app in config.apps, do: domain
    end)
  end

  @spec config_for(atom()) :: map()
  def config_for(domain), do: Map.get(@domains, domain, default_config())

  defp default_config do
    %{strategy: :one_for_one, max_restarts: 5, max_seconds: 30}
  end
end
```

The dependency resolver builds a startup DAG:

```elixir
defmodule PrismaticSupervisor.DependencyResolver do
  @spec resolve(map()) :: {:ok, [[atom()]]} | {:error, :cycle_detected}
  def resolve(dependency_graph) do
    case topological_sort(dependency_graph) do
      {:ok, sorted} -> {:ok, group_independent(sorted, dependency_graph)}
      {:error, _} = error -> error
    end
  end

  defp group_independent(sorted, graph) do
    sorted
    |> Enum.reduce({[], MapSet.new()}, fn app, {groups, started} ->
      deps = Map.get(graph, app, [])

      if MapSet.subset?(MapSet.new(deps), started) do
        case groups do
          [current | rest] ->
            {[current ++ [app] | rest], MapSet.put(started, app)}
          [] ->
            {[[app]], MapSet.put(started, app)}
        end
      else
        {[[app] | groups], MapSet.put(started, app)}
      end
    end)
    |> elem(0)
    |> Enum.reverse()
  end
end
```

## Results

Failure recovery times (seconds to full operational status):

| Failure Scenario | Topology A | Topology B | Topology C | Topology D |
|------------------|-----------|-----------|-----------|-----------|
| Single process crash | 0.8 | 0.3 | 0.3 | 0.2 |
| Storage backend failure | 34.2 | 8.1 | 4.7 | 3.1 |
| Domain cascade | 47.8 | 12.4 | 9.8 | 6.2 |
| Memory pressure | 22.1 | 15.3 | 11.7 | 8.4 |
| Network partition | 38.7 | 14.9 | 10.2 | 7.1 |

Cold-start times:

| Topology | Cold Start (s) | Improvement |
|----------|---------------|-------------|
| A (Flat) | 12.4 | Baseline |
| B (Domain) | 8.2 | -33.9% |
| C (Hierarchical) | 7.1 | -42.7% |
| D (Compositional) | 6.4 | -48.4% |

Cascade propagation (number of processes affected by a single process crash):

| Topology | Avg Affected | Max Affected | Cascade Rate |
|----------|-------------|-------------|-------------|
| A | 14.7 | 83 | 16.3% |
| B | 4.2 | 12 | 4.7% |
| C | 2.8 | 8 | 3.1% |
| D | 2.1 | 5 | 2.3% |

## Analysis

Topology D (Full Compositional) exceeded our hypothesis targets. Cascading failure propagation dropped by 85.7% (target: 80%), and cold-start time improved by 48.4% (target: 45%). The key insight is that dependency-aware parallel startup and domain-partitioned restart strategies complement each other more than expected.

The storage backend failure scenario revealed the most dramatic improvement. Topology A's 34.2-second recovery was caused by a thundering herd of 83 processes simultaneously attempting reconnection. Topology D's dependency graph ensures that storage-dependent processes wait for backend health confirmation before restarting, reducing the affected set to 5 processes and recovery to 3.1 seconds.

The `:one_for_all` strategy for the security domain proved essential. Security processes share authentication state, and partial restarts create windows where some processes have stale credentials. Restarting all security processes together eliminates this inconsistency window.

Memory pressure recovery in Topology D benefited from the health monitoring component, which detected the memory spike 200ms before the OS triggered OOM actions, allowing graceful process migration.

## Conclusions

1. **Domain-partitioned supervision is mandatory** for umbrella platforms exceeding 40 applications.
2. **Mixed restart strategies** per domain provide better fault isolation than global `:one_for_one`.
3. **Dependency-aware parallel startup** provides nearly 50% cold-start improvement with no correctness trade-offs.
4. **Health monitoring** enables proactive failure management that reduces recovery time by an additional 25% over reactive-only supervision.
5. **The compositional approach scales** -- adding new applications requires only domain classification, not topology redesign.

## Next Steps

- Evaluate Horde-based distributed supervision for multi-node deployments
- Implement adaptive restart rate limiting based on failure frequency patterns
- Add chaos engineering scenarios using the [Color Team](/glossary/color-teams/) framework
- Benchmark supervision tree performance under sustained 100K process counts
- Integrate with [SEADF](/glossary/seadf/) for autonomous topology evolution

## Related Experiments

- [Agent Prototyping](/lab/agent-prototyping/) -- Agents operate under these supervision trees
- [Multi-Agent Coordination](/lab/multi-agent-coordination/) -- Coordination patterns affected by topology
- [Pipeline Experimentation](/lab/pipeline-experimentation/) -- Pipeline stages supervised by domain partitions
- [Quality Evolution](/lab/quality-evolution/) -- Quality monitoring interacts with supervision health

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)