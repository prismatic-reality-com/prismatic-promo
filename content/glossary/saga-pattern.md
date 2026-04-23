+++
title = "Saga Pattern"
weight = 51
[extra]
category = "architecture"
description = "Distributed transaction coordination through compensating actions"
related_terms = ["event-sourcing", "cqrs", "eventual-consistency", "circuit-breaker", "genserver", "supervision-tree"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1279
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Saga", "Pattern", "Distributed", "glossary", "architecture", "Prismatic Platform", "High", "Eventual", "Consistency"]
tags = ["glossary", "architecture", "saga-pattern", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Saga Pattern - Prismatic Platform"
+++

## Definition

The Saga pattern is a distributed systems design pattern that manages long-running transactions spanning multiple services or bounded contexts by decomposing them into a sequence of local transactions, each paired with a corresponding compensating action for rollback. Unlike the traditional two-phase commit (2PC) protocol, which relies on distributed locks and a blocking coordinator to achieve atomicity across participants, sagas achieve eventual consistency through forward recovery (completing all steps) or backward recovery (executing compensating actions in reverse order). The pattern was first described by Hector Garcia-Molina and Kenneth Salem in their 1987 paper "Sagas" at the ACM SIGMOD conference, originally addressing the problem of long-lived database transactions that held locks for unacceptable durations.

In contemporary distributed systems, the Saga pattern has become the primary alternative to 2PC for maintaining data consistency across microservices, event-driven architectures, and any system where participating components cannot share a single transactional resource manager. Each step in a saga executes within the local transaction boundary of its respective service. If any step fails, previously completed steps execute their compensating actions in reverse order, restoring the system to a consistent state without requiring distributed locks or global transaction coordinators.

## Overview

The fundamental insight of the Saga pattern is that not all business operations require ACID (Atomicity, Consistency, Isolation, Durability) guarantees across the entire operation. Many real-world workflows can tolerate brief periods of inconsistency as long as the system eventually reaches a consistent state through either successful completion or full compensation. This relaxation of the isolation property enables horizontal scalability and eliminates the availability problems inherent in distributed locking protocols.

Sagas operate under the ACD model: Atomicity (all steps complete or all are compensated), Consistency (the system transitions between valid states), and Durability (completed steps and compensations are persistent). The missing "I" (Isolation) means that intermediate states are visible to other transactions, which must be addressed through careful saga design, semantic locks, or countermeasures like commutative operations.

There are two fundamental coordination approaches for implementing sagas: choreography and orchestration. Choreography relies on event-driven communication where each service publishes domain events upon completing its local transaction, and downstream services subscribe to these events to trigger their respective steps. Orchestration employs a central saga coordinator (orchestrator) that explicitly directs the sequence of steps, sending commands to participants and handling their responses. Each approach carries distinct trade-offs in coupling, visibility, and complexity.

## Technical Details

### Choreography-Based Sagas

In a choreography-based saga, there is no central coordinator. Each service listens for events from upstream services and responds by executing its local transaction and publishing its own events. The saga's flow is implicitly defined by the event subscriptions across services.

Advantages of choreography include loose coupling between services, no single point of failure in coordination, and natural alignment with event-driven architectures. Disadvantages include difficulty in understanding the complete saga flow (it is distributed across multiple services), challenges in handling complex conditional logic, and the risk of cyclic event dependencies.

### Orchestration-Based Sagas

In an orchestration-based saga, a dedicated saga orchestrator process maintains the saga state machine, issues commands to participants, and handles their responses. The orchestrator knows the complete sequence of steps and their compensating actions, making the saga flow explicit and centralized.

Advantages of orchestration include clear visibility into the saga's current state, straightforward handling of conditional branching, and simpler reasoning about failure scenarios. Disadvantages include the introduction of a coordination bottleneck, tighter coupling to the orchestrator's command interface, and the need to ensure the orchestrator itself is fault-tolerant.

### Compensating Actions

Compensating actions are the inverse operations that undo the effects of previously completed saga steps. A critical distinction is that compensating actions are semantic inverses, not technical rollbacks. A compensating action for "charge credit card" is "issue refund," not "reverse the bytes written to the database." Compensating actions must be idempotent (safe to execute multiple times) and commutative with respect to concurrent operations when possible.

Not all operations have natural compensating actions. For example, sending an email cannot be unsent. Such steps should be placed at the end of the saga (pivot transactions) or handled through alternative mechanisms like notification emails explaining the cancellation.

## Implementation in Prismatic Platform

The Prismatic Platform implements saga coordination using OTP processes, where each saga instance is managed by a supervised GenServer that maintains the saga state machine:

```elixir
defmodule PrismaticPerimeter.Sagas.DiscoverySaga do
  @moduledoc """
  Orchestrates EASM discovery as a saga with compensating actions.
  Each discovery step (DNS, certificates, services) is a saga step
  with a corresponding cleanup action for failure recovery.
  """

  use GenServer
  require Logger

  @type saga_state :: :initialized | :dns_running | :certs_running |
                      :services_running | :completed | :compensating | :failed

  @type step :: %{
    name: atom(),
    execute: (map() -> {:ok, map()} | {:error, term()}),
    compensate: (map() -> :ok | {:error, term()})
  }

  defstruct [
    :domain,
    :state,
    :completed_steps,
    :current_step,
    :context,
    :error
  ]

  @spec start_link(String.t(), keyword()) :: GenServer.on_start()
  def start_link(domain, opts \\ []) do
    GenServer.start_link(__MODULE__, domain, opts)
  end

  @impl true
  def init(domain) do
    saga = %__MODULE__{
      domain: domain,
      state: :initialized,
      completed_steps: [],
      current_step: nil,
      context: %{domain: domain},
      error: nil
    }

    {:ok, saga, {:continue, :execute_next}}
  end

  @impl true
  def handle_continue(:execute_next, %{state: :completed} = saga) do
    Logger.info("Discovery saga completed",
      domain: saga.domain,
      steps_completed: length(saga.completed_steps)
    )
    {:noreply, saga}
  end

  def handle_continue(:execute_next, saga) do
    case next_step(saga) do
      nil ->
        {:noreply, %{saga | state: :completed}}

      step ->
        case step.execute.(saga.context) do
          {:ok, updated_context} ->
            updated_saga = %{saga |
              completed_steps: [step | saga.completed_steps],
              context: Map.merge(saga.context, updated_context)
            }
            {:noreply, updated_saga, {:continue, :execute_next}}

          {:error, reason} ->
            Logger.warning("Saga step failed, initiating compensation",
              step: step.name,
              reason: inspect(reason)
            )
            {:noreply, %{saga | state: :compensating, error: reason},
             {:continue, :compensate}}
        end
    end
  end

  def handle_continue(:compensate, %{completed_steps: []} = saga) do
    Logger.error("Saga fully compensated",
      domain: saga.domain,
      error: inspect(saga.error)
    )
    {:noreply, %{saga | state: :failed}}
  end

  def handle_continue(:compensate, saga) do
    [step | remaining] = saga.completed_steps
    step.compensate.(saga.context)
    {:noreply, %{saga | completed_steps: remaining},
     {:continue, :compensate}}
  end

  defp next_step(%{completed_steps: completed, context: context}) do
    all_steps = discovery_steps()
    completed_names = Enum.map(completed, & &1.name)
    Enum.find(all_steps, fn step -> step.name not in completed_names end)
  end

  defp discovery_steps do
    [
      %{name: :dns_enumeration,
        execute: &PrismaticPerimeter.DNS.enumerate/1,
        compensate: &PrismaticPerimeter.DNS.cleanup/1},
      %{name: :certificate_scan,
        execute: &PrismaticPerimeter.Certificates.scan/1,
        compensate: &PrismaticPerimeter.Certificates.cleanup/1},
      %{name: :service_fingerprint,
        execute: &PrismaticPerimeter.Services.fingerprint/1,
        compensate: &PrismaticPerimeter.Services.cleanup/1}
    ]
  end
end
```

The platform leverages OTP supervision trees to ensure saga orchestrators are fault-tolerant. If a saga process crashes, the supervisor restarts it, and the saga can recover its state from the persistent saga log to resume compensation or retry.

## Comparison with Alternatives

| Approach | Consistency | Availability | Complexity | Lock Duration | Use Case |
|----------|------------|--------------|------------|---------------|----------|
| **Saga (Orchestration)** | Eventual | High | Medium | None (no locks) | Multi-service workflows with central visibility |
| **Saga (Choreography)** | Eventual | Very High | High (distributed flow) | None (no locks) | Loosely coupled event-driven systems |
| **Two-Phase Commit (2PC)** | Strong (ACID) | Low (blocking) | Low | Duration of transaction | Single-database or tightly coupled systems |
| **TCC (Try-Confirm-Cancel)** | Eventual | High | High | Reservation period | Resource reservation workflows |
| **Event Sourcing + CQRS** | Eventual | High | High | None | Audit-heavy systems with replay requirements |
| **Outbox Pattern** | Eventual | High | Medium | Brief (local tx) | Reliable event publishing from databases |

Two-phase commit provides stronger consistency guarantees but introduces blocking coordination, reduced availability, and scalability limitations. Sagas sacrifice isolation for availability and scalability, making them the preferred choice for distributed systems that can tolerate brief inconsistency windows.

## Best Practices

Designing effective sagas requires attention to several critical concerns. First, every saga step must have an idempotent compensating action. Compensations may be retried due to network failures or process restarts, and executing them multiple times must produce the same result. Second, saga steps should be ordered so that the most likely failure points occur early in the sequence, minimizing the number of compensations needed on failure. Third, the pivot transaction (the point after which compensation is no longer needed because the saga is guaranteed to complete) should be identified and placed strategically.

Saga state must be persisted to durable storage to survive process restarts. In OTP-based systems, this can be accomplished through ETS tables backed by disk persistence, database-backed state machines, or event logs. The saga orchestrator should be idempotent itself, capable of resuming from any persisted state without duplicating side effects.

Monitoring saga execution is essential. Track metrics including saga duration, step failure rates, compensation frequency, and saga completion rates. Alert on sagas that remain in a compensating state for extended periods, as this may indicate a compensation action that itself is failing.

## Use Cases

The Saga pattern is applicable across a wide range of distributed system scenarios. In e-commerce, order fulfillment sagas coordinate inventory reservation, payment processing, and shipping initiation with compensating actions for each (release inventory, refund payment, cancel shipment). In EASM discovery, the Prismatic Platform uses sagas to coordinate DNS enumeration, certificate scanning, and service fingerprinting, with cleanup actions ensuring partial discovery results do not pollute the asset database.

Multi-agent operations in intelligence platforms naturally map to sagas when agents must perform coordinated actions across multiple data sources. If one source becomes unavailable mid-operation, compensating actions ensure that partial results are properly flagged or removed rather than presented as complete assessments.

Financial compliance workflows such as sanctions screening require saga coordination when checking entities across multiple lists with different availability characteristics. The saga ensures that either all lists are checked and results correlated, or the screening result is marked as incomplete with appropriate compensations.

## Related Concepts

- [Event Sourcing](@/glossary/event-sourcing.md) - Event log enabling saga replay and compensation tracking
- [CQRS](@/glossary/cqrs.md) - Command-query separation complementing saga write coordination
- [Eventual Consistency](@/glossary/eventual-consistency.md) - Consistency model that sagas achieve across services
- [Circuit Breaker](@/glossary/circuit-breaker.md) - Failure detection triggering saga compensation paths
- [GenServer](@/glossary/genserver.md) - Process abstraction implementing saga orchestrator logic
- [Supervision Tree](@/glossary/supervision-tree.md) - Fault-tolerant process hierarchy hosting saga orchestrators

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)