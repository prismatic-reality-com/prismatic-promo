+++
title = "Containment"
weight = 50
[extra]
description = "An incident response phase focused on limiting the scope and impact of a security incident by isolating affected systems and preventing further spread"
category = "security"
related_terms = ["circuit-breaker", "containerization", "compliance", "color-teams", "closure"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["containment", "incident response", "isolation", "breach containment", "damage limitation", "NIST", "glossary", "Prismatic Platform"]
tags = ["glossary", "security", "incident-response"]
quality_score = 76
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Containment - Prismatic Platform"
+++

## Definition & Overview

Containment is the critical incident response phase focused on limiting the scope and impact of a security incident by isolating affected systems, severing attack propagation paths, and preserving evidence for subsequent investigation. In the NIST SP 800-61 incident response framework, containment follows detection and analysis (identifying that an incident has occurred) and precedes eradication (removing the threat) and recovery (restoring normal operations).

Containment strategy must balance competing priorities: isolating the threat quickly to prevent spread versus maintaining enough access to gather forensic evidence. An overly aggressive containment (e.g., immediately shutting down all affected systems) may destroy volatile evidence crucial for understanding the attack. An overly cautious containment may allow the threat to spread to additional systems. Effective containment uses a phased approach: short-term containment (immediate isolation), evidence preservation, and long-term containment (sustainable defensive posture).

In the Prismatic Platform, containment principles apply at both the security operations level (Color Team incident response simulations) and the architectural level (OTP supervision strategies, circuit breakers, process isolation). The Erlang/OTP "let it crash" philosophy is itself a containment strategy -- process isolation ensures that a failure in one component cannot propagate to unrelated components, containing the blast radius of any issue.

## Technical Deep Dive

### Incident Containment Phases (NIST SP 800-61)

| Phase | Goal | Duration | Actions |
|-------|------|----------|---------|
| **Short-term** | Stop immediate spread | Minutes | Network isolation, credential revocation |
| **Evidence Preservation** | Capture forensic data | Minutes-Hours | Memory dumps, log collection |
| **Long-term** | Sustainable containment | Hours-Days | Patched systems, enhanced monitoring |
| **Transition** | Move to eradication | After analysis | Root cause identified, remediation planned |

### OTP Containment Architecture

```elixir
defmodule PrismaticSupervisor.ContainmentStrategy do
  @moduledoc """
  Implements containment patterns using OTP supervision strategies.
  Process isolation is the BEAM's primary containment mechanism --
  a crashed process cannot corrupt another process's state.
  """

  @type containment_action :: :isolate | :restart | :terminate | :escalate

  @spec determine_action(atom(), non_neg_integer(), non_neg_integer()) :: containment_action()
  def determine_action(child_id, restart_count, max_restarts) do
    cond do
      restart_count >= max_restarts ->
        :escalate

      restart_count >= div(max_restarts, 2) ->
        :isolate

      true ->
        :restart
    end
  end

  @spec apply_containment(pid(), containment_action()) :: :ok
  def apply_containment(pid, :isolate) do
    Process.unlink(pid)

    :telemetry.execute(
      [:prismatic, :containment, :isolated],
      %{pid: inspect(pid)},
      %{action: :isolate}
    )

    :ok
  end

  def apply_containment(pid, :terminate) do
    Process.exit(pid, :shutdown)

    :telemetry.execute(
      [:prismatic, :containment, :terminated],
      %{pid: inspect(pid)},
      %{action: :terminate}
    )

    :ok
  end

  def apply_containment(_pid, :restart), do: :ok
  def apply_containment(_pid, :escalate), do: :ok
end
```

### Circuit Breaker as Containment

```elixir
defmodule PrismaticResilience.ContainmentCircuitBreaker do
  @moduledoc """
  Circuit breaker pattern implementing containment for external
  service failures. When a downstream service fails repeatedly,
  the circuit opens to contain the failure and prevent cascade.
  """

  use GenServer

  @type state :: :closed | :open | :half_open
  @failure_threshold 3
  @reset_timeout :timer.seconds(60)

  @spec call(atom(), fun()) :: {:ok, term()} | {:error, :circuit_open}
  def call(service_name, func) do
    GenServer.call(__MODULE__, {:call, service_name, func})
  end

  @impl GenServer
  def handle_call({:call, service, func}, _from, state) do
    circuit = Map.get(state, service, %{state: :closed, failures: 0})

    case circuit.state do
      :open ->
        if timer_expired?(circuit) do
          try_half_open(service, func, state)
        else
          {:reply, {:error, :circuit_open}, state}
        end

      :closed ->
        execute_with_tracking(service, func, state)

      :half_open ->
        execute_with_tracking(service, func, state)
    end
  end

  defp execute_with_tracking(service, func, state) do
    try do
      result = func.()
      circuit = %{state: :closed, failures: 0, last_failure: nil}
      {:reply, {:ok, result}, Map.put(state, service, circuit)}
    rescue
      _ ->
        circuit = Map.get(state, service, %{state: :closed, failures: 0})
        new_failures = circuit.failures + 1

        new_state = if new_failures >= @failure_threshold do
          :open
        else
          :closed
        end

        updated = %{state: new_state, failures: new_failures, last_failure: System.monotonic_time()}
        {:reply, {:error, :service_failure}, Map.put(state, service, updated)}
    end
  end

  defp try_half_open(service, func, state) do
    execute_with_tracking(service, func, Map.put(state, service, %{state: :half_open, failures: 0}))
  end

  defp timer_expired?(circuit) do
    case circuit[:last_failure] do
      nil -> true
      last -> System.monotonic_time() - last > System.convert_time_unit(@reset_timeout, :millisecond, :native)
    end
  end
end
```

## Architecture & Implementation

The Prismatic Platform implements containment at three architectural layers. At the process level, OTP supervision trees provide automatic containment -- each process runs in isolation, and a crash is contained within the process boundary. The supervision strategy (`:one_for_one`, `:one_for_all`, `:rest_for_one`) determines the containment scope when a child process fails.

At the service level, circuit breakers contain failures in external service calls (OSINT tool APIs, database connections, AI model endpoints). When a service fails repeatedly, the circuit opens, preventing the failure from consuming resources through retries and allowing the failing service time to recover. The `PrismaticClaude.SessionLifecycle` module uses circuit breakers with auto-open after 3 failures and auto-reset after 60 seconds.

At the security operations level, the Color Team exercises practice containment procedures. The Blue Team's defensive posture includes pre-planned containment actions for different threat scenarios. When the Red Team simulates an attack (in sandboxed environments with synthetic data), the Blue Team executes containment procedures and the Purple Team evaluates their effectiveness.

## Usage in Prismatic Platform

The PrismaticSupervisor's DomainSupervisor implements domain-level containment. If all processes within a domain (e.g., OSINT processing) fail, only that domain's supervisor restarts -- other domains continue operating normally. This prevents a failure in one platform capability from affecting unrelated capabilities.

The OSINT toolbox's async execution model uses containment to prevent slow or failed tool executions from blocking the overall investigation. Each tool execution runs in a supervised task that can be terminated independently. If a tool exceeds its timeout, the task is killed without affecting other concurrent tool executions.

The Quality Floor Guardian implements containment for quality regressions. When a quality metric drops below the floor, the guardian "contains" the regression by blocking commits until the metric is restored, preventing the regression from spreading through the codebase.

## Cross-References

- [Circuit Breaker](/glossary/circuit-breaker/) - service-level containment pattern
- [Containerization](/glossary/containerization/) - infrastructure-level isolation
- [Color Teams](/glossary/color-teams/) - security operations practicing containment
- [Closure](/glossary/closure/) - verified resolution following containment
- [Compliance](/glossary/compliance/) - regulatory requirements for incident response
- **Livebooks**: `livebooks/domains/security_compliance/` - incident response exercises
- **Academy**: Security incident response and containment methodology

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
