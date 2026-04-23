+++
title = "Chaos Engineering"
weight = 8
[extra]
category = "architecture"
description = "Controlled failure injection methodology for testing system resilience and validating fault tolerance under adverse conditions"
related_terms = ["circuit-breaker", "supervisor", "fault-tolerance", "let-it-crash", "property-based-testing", "self-healing", "color-teams", "distributed-system", "observability", "beam", "red-team", "nabla-infinity"]
pattern_type = "resilience_validation"
complexity = "high"
security_critical = true
enforcement_level = "P1"
otp_components = ["Supervisor", "DynamicSupervisor", "GenServer", "Process", "Telemetry"]
elixir_libraries = ["StreamData", "Telemetry", "Phoenix.LiveDashboard"]
key_modules = ["PrismaticChaos.ProcessKiller", "PrismaticChaos.CircuitBreakerTest", "PrismaticChaos.LatencyInjector", "PrismaticChaos.EpistemicChaos"]
maturity_level = "Level 2 (automated staging)"
failure_categories = 8
epistemic_chaos = true
industry_origin = "Netflix Chaos Monkey (2011)"
principles_count = 5
date_created = "2025-07-05"
date_updated = "2026-02-22"
doctrine = "no-mercy-no-doubts"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1663
date_modified = "2026-02-23"
keywords = ["Chaos", "Engineering", "Controlled", "glossary", "architecture", "Prismatic Platform", "Level", "BEAM", "Without", "Chaos Engineering"]
tags = ["glossary", "architecture", "chaos-engineering", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Chaos Engineering - Prismatic Platform"
+++

## Definition

Chaos engineering is the discipline of experimenting on a distributed system to build confidence in its ability to withstand turbulent, unexpected conditions in production. Pioneered by Netflix with their Chaos Monkey tool in 2011 and formalized as a discipline through the "Principles of Chaos Engineering" manifesto, the practice applies the scientific method to system resilience: form a hypothesis about steady-state behavior, introduce a controlled perturbation (process crash, network partition, resource exhaustion, clock skew), observe the system's response, and validate or refute the hypothesis. The goal is not to break things randomly but to uncover systemic weaknesses before they manifest as production incidents.

The fundamental insight of chaos engineering is that complex [distributed systems](@/glossary/distributed-system.md) exhibit emergent failure modes that cannot be predicted through code review, unit testing, or architectural analysis alone. A system may handle individual component failures gracefully but collapse when three unrelated failures occur simultaneously. Chaos engineering systematically explores these combinatorial failure spaces, converting unknown unknowns into known quantities with documented mitigations.

Chaos engineering differs from traditional failure testing in scope and philosophy. Failure testing verifies that a specific component handles a specific failure correctly (e.g., "does the [circuit breaker](@/glossary/circuit-breaker.md) trip when the database is unavailable?"). Chaos engineering asks broader questions about system behavior (e.g., "does the system maintain acceptable latency and correctness when 30% of database connections fail intermittently?"). The practice operates in production or production-like environments because staging environments cannot reproduce the full complexity of production traffic patterns, data distributions, and timing relationships.

## Historical Context

The intellectual roots of chaos engineering extend back to the fault injection techniques developed in the 1970s and 1980s for testing safety-critical systems in aerospace and telecommunications. Researchers at Carnegie Mellon, AT&T Bell Labs, and NASA developed formalized approaches to injecting hardware faults (bit flips, stuck-at faults) and software faults (mutated instructions, corrupted memory) to validate system resilience. These early efforts were confined to specialized domains with dedicated testing infrastructure.

The transition to mainstream software engineering began with Netflix's Chaos Monkey (2011), a tool that randomly terminated virtual machine instances in production to force engineers to design services that could tolerate instance failures. Netflix subsequently developed the Simian Army -- a collection of chaos tools including Latency Monkey (injecting communication delays), Conformity Monkey (shutting down non-conforming instances), and Chaos Gorilla (simulating entire availability zone failures).

The formalization of chaos engineering as a discipline came with the publication of "Chaos Engineering: System Resiliency in Practice" (Casey Rosenthal and Nora Jones, O'Reilly, 2020) and the establishment of the "Principles of Chaos Engineering" website (principlesofchaos.org). These codified the practice from a set of Netflix-specific tools into a generalizable methodology applicable to any distributed system.

The rise of container orchestration (Kubernetes) and service mesh architectures (Istio, Linkerd) provided new failure surfaces and new injection mechanisms. Tools like Litmus (2018), Chaos Mesh (2019), and Gremlin (2016, commercial) made chaos experiments accessible without building custom tooling. The integration of chaos experiments into CI/CD pipelines ("continuous chaos") represented the maturity of the practice from manual experimentation to automated resilience validation.

For [BEAM](@/glossary/beam.md)-based systems like the Prismatic Platform, chaos engineering has a distinctive character. The BEAM's process model -- where millions of isolated processes communicate through message passing and are supervised by fault-tolerant hierarchies -- provides a natural boundary for failure injection. Killing a BEAM process is safe by design, unlike killing a thread in a shared-memory runtime. This makes the BEAM an ideal target for fine-grained chaos experiments.

## Principles of Chaos Engineering

The five core principles govern how chaos experiments are designed and executed:

| Principle | Description | Prismatic Application |
|-----------|-------------|----------------------|
| **Build Hypothesis** | Define steady-state behavior metrics | Agent response times, quality scores, EASM scan completion |
| **Vary Real-World Events** | Inject realistic failures | Process crashes, network timeouts, ETS table corruption |
| **Run in Production** | Test in real conditions | Production-like staging with realistic data volumes |
| **Automate Continuously** | Run experiments regularly | CI pipeline chaos stages, scheduled resilience tests |
| **Minimize Blast Radius** | Limit failure scope | Per-app chaos, gradual escalation, automatic rollback |

Each principle builds on the previous. Without a clear hypothesis about steady-state behavior, experiment results are uninterpretable. Without realistic failure injection, experiments do not reveal real-world weaknesses. Without production (or production-like) conditions, timing-dependent failures remain hidden. Without automation, chaos testing degrades from practice to ceremony. Without blast radius control, experiments risk becoming the incidents they aim to prevent.

## Failure Injection Categories

Chaos engineering covers multiple failure domains, each targeting different resilience mechanisms:

| Category | Injection Method | Tests | BEAM/OTP Mitigation |
|----------|-----------------|-------|---------------------|
| **Process Failure** | `Process.exit(pid, :kill)` | [Supervision](@/glossary/supervisor.md) restart | Supervisor restart strategies |
| **Network Partition** | Block inter-node traffic | Distributed consensus | `net_kernel` partition handling |
| **Resource Exhaustion** | Spawn millions of processes | Scheduler fairness | BEAM scheduler with reductions |
| **Memory Pressure** | Large ETS table allocation | GC and process isolation | Per-process garbage collection |
| **Clock Skew** | Adjust system clock | Time-dependent logic | Monotonic time APIs |
| **Dependency Failure** | Block external service | Circuit breaker activation | [Circuit Breaker](@/glossary/circuit-breaker.md) pattern |
| **Data Corruption** | Invalid ETS entries | Data validation | Input validation at boundaries |
| **Latency Injection** | Add artificial delays | Timeout handling | GenServer timeout configuration |

## Chaos Experiments for OTP Systems

The BEAM's process model enables fine-grained chaos experiments that would be difficult in thread-based systems:

```elixir
defmodule PrismaticChaos.ProcessKiller do
  @moduledoc """
  Chaos experiment: randomly kill supervised agent processes
  and verify that the supervision tree restores them within
  acceptable time bounds. Validates that OTP supervision
  strategies (one_for_one, one_for_all, rest_for_one) work
  correctly under real conditions.
  """

  @type experiment_result :: %{
    killed: non_neg_integer(),
    recovered: non_neg_integer(),
    recovery_time_ms: non_neg_integer(),
    success: boolean()
  }

  @spec run(atom(), non_neg_integer()) :: {:ok, experiment_result()} | {:error, term()}
  def run(supervisor, kill_count) do
    children_before = DynamicSupervisor.which_children(supervisor)
    count_before = length(children_before)
    targets = Enum.take_random(children_before, min(kill_count, count_before))

    start_time = System.monotonic_time(:millisecond)

    for {_, pid, _, _} <- targets do
      Process.exit(pid, :kill)
    end

    recovery_time = wait_for_recovery(supervisor, count_before, 5_000)
    children_after = DynamicSupervisor.which_children(supervisor)
    count_after = length(children_after)

    result = %{
      killed: length(targets),
      recovered: count_after,
      recovery_time_ms: recovery_time,
      success: count_after >= count_before
    }

    emit_telemetry(:process_kill, result)

    if result.success do
      {:ok, result}
    else
      {:error, {:recovery_failed, result}}
    end
  end

  @spec wait_for_recovery(atom(), non_neg_integer(), non_neg_integer()) :: non_neg_integer()
  defp wait_for_recovery(supervisor, expected_count, timeout) do
    start = System.monotonic_time(:millisecond)
    do_wait(supervisor, expected_count, start, timeout)
  end

  defp do_wait(supervisor, expected, start, timeout) do
    elapsed = System.monotonic_time(:millisecond) - start

    cond do
      elapsed > timeout ->
        elapsed

      length(DynamicSupervisor.which_children(supervisor)) >= expected ->
        elapsed

      true ->
        Process.sleep(50)
        do_wait(supervisor, expected, start, timeout)
    end
  end

  defp emit_telemetry(event, data) do
    :telemetry.execute(
      [:prismatic, :chaos, event],
      %{timestamp: System.monotonic_time()},
      data
    )
  end
end
```

```elixir
defmodule PrismaticChaos.CircuitBreakerTest do
  @moduledoc """
  Chaos experiment: inject failures at a specified rate and
  verify that circuit breakers trip at their configured thresholds.
  Validates the circuit breaker lifecycle: closed -> open -> half-open -> closed.
  """

  @spec run(atom(), float()) :: {:ok, map()} | {:error, term()}
  def run(service_name, failure_rate) when failure_rate > 0.0 and failure_rate < 1.0 do
    results =
      1..1000
      |> Enum.map(fn _ ->
        if :rand.uniform() < failure_rate do
          inject_failure(service_name)
        else
          normal_request(service_name)
        end
      end)

    breaker_state = CircuitBreaker.state(service_name)
    success_count = Enum.count(results, &match?({:ok, _}, &1))
    failure_count = Enum.count(results, &match?({:error, _}, &1))

    outcome = %{
      total_requests: 1000,
      successes: success_count,
      failures: failure_count,
      breaker_state: breaker_state,
      expected_trip: failure_rate > 0.5
    }

    if breaker_state in [:open, :half_open] do
      {:ok, outcome}
    else
      {:error, {:breaker_not_tripped, outcome}}
    end
  end

  defp inject_failure(service_name) do
    {:error, {:chaos_injected, service_name}}
  end

  defp normal_request(service_name) do
    {:ok, {:normal_response, service_name}}
  end
end
```

## Latency Injection Experiments

Latency injection is particularly important for validating timeout configurations and backpressure mechanisms:

```elixir
defmodule PrismaticChaos.LatencyInjector do
  @moduledoc """
  Injects artificial latency into service calls to validate
  timeout handling, backpressure, and graceful degradation.
  Tests that the system maintains acceptable response times
  even when individual components are slow.
  """

  @spec inject(module(), atom(), list(), non_neg_integer()) ::
    {:ok, term()} | {:error, :timeout}
  def inject(module, function, args, delay_ms) do
    task = Task.async(fn ->
      Process.sleep(delay_ms)
      apply(module, function, args)
    end)

    case Task.yield(task, delay_ms + 1_000) do
      {:ok, result} -> {:ok, result}
      nil ->
        Task.shutdown(task, :brutal_kill)
        {:error, :timeout}
    end
  end

  @spec run_latency_experiment(atom(), Range.t()) :: {:ok, map()}
  def run_latency_experiment(service, delay_range) do
    results =
      delay_range
      |> Enum.map(fn delay ->
        start = System.monotonic_time(:millisecond)
        result = inject(service, :health_check, [], delay)
        elapsed = System.monotonic_time(:millisecond) - start
        {delay, result, elapsed}
      end)

    analysis = %{
      total_experiments: length(results),
      timeouts: Enum.count(results, fn {_, r, _} -> match?({:error, :timeout}, r) end),
      max_observed_latency: results |> Enum.map(fn {_, _, e} -> e end) |> Enum.max(),
      degradation_threshold: find_degradation_point(results)
    }

    {:ok, analysis}
  end

  defp find_degradation_point(results) do
    results
    |> Enum.find(fn {_, result, _} -> match?({:error, _}, result) end)
    |> case do
      {delay, _, _} -> delay
      nil -> :no_degradation
    end
  end
end
```

## Epistemic Chaos Engineering

The Prismatic Platform extends chaos engineering beyond infrastructure into the epistemic domain -- testing whether the knowledge and decision-making pipeline maintains integrity under adversarial conditions:

| Epistemic Failure | Injection Method | Validates |
|-------------------|-----------------|-----------|
| **Signal Poisoning** | Inject false intelligence signals | [Signal Plurality](@/glossary/signal-plurality.md) axiom |
| **Confidence Manipulation** | Artificially inflate/deflate confidence | [Confidence Threshold](@/glossary/confidence-threshold.md) enforcement |
| **Drift Induction** | Gradually shift baseline values | [Blue Team](@/glossary/blue-team.md) drift detection |
| **Contradiction Injection** | Insert contradictory intelligence | [Contradiction Preservation](@/glossary/contradiction-preservation.md) |
| **Source Compromise** | Simulate compromised OSINT source | Provenance Mandatory axiom |
| **Salience Hijacking** | Amplify irrelevant signals | [Trinity Gate](@/glossary/trinity-gate.md) filtering |

This is the domain of the [Color Teams](@/glossary/color-teams.md) -- [Red Team](@/glossary/red-team.md) designs and executes epistemic attacks, Blue Team maintains defensive posture, and Purple Team synthesizes findings into improved resilience. Epistemic chaos engineering is unique to platforms that make decisions based on uncertain, multi-source intelligence -- a domain where the [NABLA Infinity](@/glossary/nabla-infinity.md) framework provides the formal axioms that chaos experiments validate.

```elixir
defmodule PrismaticChaos.EpistemicChaos do
  @moduledoc """
  Epistemic chaos experiments that validate the NABLA Infinity
  framework's axioms under adversarial conditions. Injects
  signal noise, confidence manipulation, and contradiction
  into the intelligence pipeline.
  """

  @spec inject_false_signal(atom(), map()) :: {:ok, :detected} | {:error, :undetected}
  def inject_false_signal(pipeline, false_signal) do
    result = pipeline.process(false_signal)

    case result do
      {:rejected, :insufficient_plurality} -> {:ok, :detected}
      {:rejected, :provenance_invalid} -> {:ok, :detected}
      {:accepted, _} -> {:error, :undetected}
    end
  end

  @spec inject_contradiction(atom(), map(), map()) ::
    {:ok, :preserved} | {:error, :buried}
  def inject_contradiction(pipeline, signal_a, signal_b) do
    pipeline.process(signal_a)
    pipeline.process(signal_b)

    beliefs = pipeline.current_beliefs()

    if contradiction_preserved?(beliefs, signal_a, signal_b) do
      {:ok, :preserved}
    else
      {:error, :buried}
    end
  end
end
```

## Observability During Chaos

Effective chaos experiments require comprehensive [observability](@/glossary/observability.md) to distinguish expected degradation from systemic failure:

| Observable | Tool | Threshold |
|-----------|------|-----------|
| **Process restart rate** | Telemetry + Metrics | < 10 restarts/min/supervisor |
| **Response latency** | Phoenix Telemetry | p99 < 500ms during chaos |
| **Error rate** | Structured Logging | < 5% increase from baseline |
| **Circuit breaker state** | Custom telemetry | Trips within configured threshold |
| **Supervision tree health** | Observer / LiveDashboard | All supervisors running |
| **ETS table integrity** | Health checks | All tables accessible |
| **Quality score** | Quality Floor Guardian | No drop below 95/100 |
| **[Fitness Score](@/glossary/fitness-score.md)** | SEADF Aggregator | No drop below 0.95 |

## Chaos Maturity Model

Organizations adopt chaos engineering through progressive maturity levels:

| Level | Description | Prismatic Status | Key Capability |
|-------|-------------|-----------------|----------------|
| **Level 0** | No chaos testing | Surpassed | None |
| **Level 1** | Manual failure injection in dev | Surpassed | Developer-initiated experiments |
| **Level 2** | Automated chaos in staging | **Active** | CI pipeline chaos stages |
| **Level 3** | Automated chaos in production | Planned | Production chaos with auto-rollback |
| **Level 4** | Continuous chaos with auto-remediation | Target | Self-healing validates in real-time |

## Integration with Property-Based Testing

[Property-based testing](@/glossary/property-based-testing.md) and chaos engineering are complementary approaches to resilience validation:

| Aspect | Property-Based Testing | Chaos Engineering |
|--------|----------------------|-------------------|
| **Scope** | Function/module level | System/infrastructure level |
| **Input** | Generated data | Injected failures |
| **Validates** | Logical correctness invariants | Operational resilience invariants |
| **Environment** | Test suite | Staging/production |
| **Automation** | Fully automated (StreamData) | Automated with human analysis |
| **BEAM Specific** | Process mailbox properties | Supervision tree recovery |

Together, property-based tests verify that individual components maintain their contracts under arbitrary inputs, while chaos experiments verify that the assembled system maintains its service levels under arbitrary failures.

## Best Practices

**Start with Steady State**: Before running chaos experiments, establish clear metrics defining normal system behavior (response latency percentiles, error rates, throughput). Without a baseline, experiment results are uninterpretable.

**Minimize Blast Radius**: Begin experiments with the smallest possible scope -- a single process, a single node, a single service. Only expand scope after building confidence in the system's recovery capabilities at smaller scales.

**Automate Continuously**: Chaos experiments should run regularly in CI/CD pipelines and scheduled jobs, not just during dedicated testing sessions. Intermittent manual testing misses regressions introduced between sessions.

**Combine with Property-Based Testing**: Use property-based testing for function-level invariant verification and chaos engineering for system-level resilience validation. Together they cover the full spectrum from logical correctness to operational resilience.

**Document Findings**: Every chaos experiment should produce a documented finding -- either confirming the hypothesis (the system handled the failure correctly) or identifying a gap (the system did not recover within acceptable bounds). These findings feed into the platform's resilience backlog.

**Graduate Through Maturity Levels**: Do not jump from Level 0 to Level 3. Progress through each maturity level, building confidence and tooling at each stage. Premature production chaos creates incidents rather than preventing them.

## Use Cases

- **Supervision Tree Validation**: Verifying that OTP [supervisors](@/glossary/supervisor.md) restart crashed processes within acceptable time bounds across all 115 umbrella applications
- **Circuit Breaker Testing**: Confirming that circuit breakers trip at configured failure thresholds and recover correctly during half-open states
- **Network Partition Simulation**: Testing cluster behavior when nodes lose connectivity, verifying PubSub message delivery and Horde process redistribution
- **Epistemic Chaos**: Red Team injection of false intelligence signals, confidence manipulation, and drift induction to validate NABLA axiom enforcement
- **Deployment Resilience**: Validating that rolling deployments on Fly.io maintain service availability during node restarts
- **Resource Exhaustion**: Testing system behavior under memory pressure and high process counts to verify BEAM scheduler fairness
- **Latency Tolerance**: Injecting delays into external service calls to validate timeout configurations and graceful degradation

## Related Concepts

- [Circuit Breaker](@/glossary/circuit-breaker.md) - Fault tolerance pattern validated by chaos testing
- [Supervisor](@/glossary/supervisor.md) - OTP process hierarchy tested under chaos conditions
- [Fault Tolerance](@/glossary/fault-tolerance.md) - System property that chaos engineering validates
- [Let-It-Crash](@/glossary/let-it-crash.md) - OTP philosophy enabling controlled process failure
- [Self-Healing](@/glossary/self-healing.md) - Autonomous recovery validated by chaos experiments
- [Property-Based Testing](@/glossary/property-based-testing.md) - Complementary testing at function level
- [Color Teams](@/glossary/color-teams.md) - Red Team applies adversarial chaos to epistemic systems
- [Distributed System](@/glossary/distributed-system.md) - Primary target of chaos engineering
- [Observability](@/glossary/observability.md) - Monitoring essential during chaos experiments
- [BEAM](@/glossary/beam.md) - VM whose process model enables fine-grained chaos injection
- [Fitness Score](@/glossary/fitness-score.md) - Quality metric monitored during chaos experiments
- [NABLA Infinity](@/glossary/nabla-infinity.md) - Epistemic framework validated by epistemic chaos

## See Also

- [Architecture](@/architecture/_index.md) - Platform resilience architecture
- [Technologies](@/technologies/_index.md) - Fault tolerance technology stack
- [Capabilities](@/capabilities/_index.md) - Resilience and chaos engineering capabilities

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
