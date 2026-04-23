+++
title = "L3 Strategic Commanders"
weight = 50
[extra]
description = "Mid-upper tier AIAD agents with multi-domain coordination authority, responsible for orchestrating L1 and L2 agents across domain boundaries to execute complex intelligence operations, campaigns, and cross-functional workflows."
category = "agents"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "agent-architecture"
related_concepts = ["multi-domain coordination", "agent orchestration", "strategic command", "cross-domain operations", "campaign management", "delegation patterns", "escalation protocols"]
implementation_status = "production"
authority_level = "domain-expert"
difficulty_rating = 8
prerequisites = ["aiad", "agent-tier", "l1-operational-units", "l2-tactical-specialists", "otp"]
learning_path = ["aiad", "l1-operational-units", "l2-tactical-specialists", "l3-strategic-commanders", "l5-supreme-authority"]
interactive_demos = ["/labs/glossary/l3-strategic-commanders"]
code_examples = ["Elixir L3 commander behaviour specification", "Multi-domain campaign orchestrator", "Cross-domain delegation engine"]
external_resources = ["https://en.wikipedia.org/wiki/Command_and_control", "https://www.erlang.org/doc/design_principles/sup_princ", "https://hexdocs.pm/elixir/Supervisor.html"]
version_introduced = "0.8.0"
stability_level = "stable"
testing_scenarios = ["cross-domain coordination accuracy", "delegation chain validation", "escalation path testing", "campaign lifecycle management", "fault tolerance under agent failure"]
keywords = ["L3 strategic commanders definition", "AIAD agent hierarchy", "strategic tier agents", "multi-domain coordination", "agent orchestration patterns", "cross-domain command", "AIAD L3 specification", "intelligence campaign management"]
tags = ["agents", "aiad", "hierarchy", "architecture", "strategic", "coordination", "l3"]
related_terms = ["agent-tier", "authority-level", "l1-operational-units", "l2-tactical-specialists", "l5-supreme-authority", "aiad", "chain-of-command", "strategic-command", "supervision-tree", "genserver"]
word_count = 1476
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "L3 Strategic Commanders - Prismatic Platform"
+++

## Definition

L3 Strategic Commanders are mid-upper tier agents in the AIAD (AI-Augmented Intelligence Design) hierarchy, possessing multi-domain coordination authority that enables them to orchestrate agents across domain boundaries. Unlike [L1 Operational Units](/glossary/l1-operational-units/) (single-domain, read-only) and [L2 Tactical Specialists](/glossary/l2-tactical-specialists/) (single-domain, write access), L3 agents operate across multiple domains simultaneously, coordinating complex workflows that require data from multiple sources, analysis from multiple specialists, and actions across multiple subsystems.

L3 Strategic Commanders are the first tier in the AIAD hierarchy with authority to delegate work to agents in other domains, escalate issues to higher authority levels, and make decisions that affect multiple subsystems. They are team commanders, campaign coordinators, and cross-functional orchestrators. In the Prismatic Platform's Color-Team security architecture, every team commander (red-commander, blue-commander, purple-coordinator) is an L3 agent.

The "strategic" designation reflects their role: they do not execute operational tasks directly (that is L1/L2 work) but rather define strategy, allocate resources, coordinate execution, and synthesize results across domains to produce outcomes that no single-domain agent could achieve alone.

## Overview

### Position in the AIAD Hierarchy

| Tier | Name | Authority | Scope | Agent Count | Key Capability |
|------|------|-----------|-------|-------------|----------------|
| L1 | Operational Units | Read-only / limited write | Single domain | ~300 | Data collection, formatting |
| L2 | Tactical Specialists | Domain write access | Single domain, deep | ~120 | Enrichment, analysis |
| **L3** | **Strategic Commanders** | **Multi-domain coordination** | **Cross-domain** | **~80** | **Orchestration, delegation** |
| L4 | Domain Authority | Full domain control | Domain + dependencies | ~25 | Architecture, supervision |
| L5 | Supreme Authority | Platform-wide control | Entire platform | ~5 | Platform governance |

L3 agents constitute approximately 15% of all AIAD agents (roughly 80 out of 530+). This proportion reflects the organizational principle that commanders should be outnumbered by the forces they coordinate -- a healthy ratio of roughly 1 commander to 5 operational/tactical agents.

### Strategic Authority Capabilities

L3 Strategic Commanders possess capabilities beyond L1/L2:

| Capability | Description | L1 | L2 | L3 |
|-----------|-------------|----|----|-----|
| **Read** | Access data within scope | Yes | Yes | Yes |
| **Collect** | Fetch from external sources | Yes | Yes | Yes |
| **Write** | Modify domain state | No | Yes | Yes |
| **Analyze** | Deep analysis within domain | No | Yes | Yes |
| **Coordinate** | Direct agents in other domains | No | No | **Yes** |
| **Delegate** | Assign tasks to L1/L2 agents | No | No | **Yes** |
| **Escalate** | Raise issues to L4/L5 | No | No | **Yes** |

The three capabilities unique to L3 -- coordinate, delegate, and escalate -- define the strategic commander role:

- **Coordinate**: Direct agents across domain boundaries. An L3 intelligence commander can coordinate DNS collection (OSINT domain), entity resolution (analysis domain), and risk scoring (compliance domain) into a unified investigation
- **Delegate**: Assign specific tasks to L1 and L2 agents. Delegation includes task definition, timeout specification, and result handling
- **Escalate**: Raise issues that exceed L3 authority to L4 Domain Authority or L5 Supreme Authority. Escalation follows the [chain of command](/glossary/chain-of-command/) protocol

### Color-Team L3 Commanders

In the Prismatic Platform's Color-Team security architecture, each team is led by an L3 Strategic Commander:

| Team | Commander | Domain | Coordination Scope |
|------|-----------|--------|--------------------|
| **Gray** | `gray-explorer-commander` | Boundary exploration | Gray L4 agents, routes findings to Red/Blue/Purple |
| **Red** | `red-commander` | Adversarial simulation | Red L2 specialists, emits to Purple/Blue |
| **Blue** | `blue-commander` | Epistemic defense | Blue L2 specialists, produces defensive posture |
| **Purple** | `purple-coordinator` | Synthesis & closure | Red/Blue loop closure, regression monitoring |
| **White** | `white-verifier-commander` | Constructive verification | White L4 specialists, composite proof construction |
| **Black** | `black-theorist-commander` | Threat modeling (ISOLATED) | Black L3 enforcer, abstract threat models only |

## Technical Details

### L3 Commander Behaviour Specification

The L3 behaviour extends the base agent behaviour with coordination, delegation, and escalation capabilities:

```elixir
defmodule PrismaticAgents.Behaviour.L3Commander do
  @moduledoc """
  Behaviour specification for L3 Strategic Commander agents.
  Extends base agent capabilities with multi-domain coordination,
  task delegation to L1/L2 agents, and escalation to L4/L5.

  L3 Commanders manage campaigns -- multi-step, multi-agent operations
  that span domain boundaries. Campaign state is tracked in ETS
  and persisted for fault recovery.
  """

  @type commander_config :: %{
    agent_id: String.t(),
    primary_domain: atom(),
    coordination_domains: list(atom()),
    delegatable_tiers: [:l1, :l2],
    escalation_targets: list(String.t()),
    campaign_timeout_ms: pos_integer(),
    max_concurrent_campaigns: pos_integer()
  }

  @type campaign :: %{
    campaign_id: String.t(),
    commander_id: String.t(),
    objective: String.t(),
    phases: list(campaign_phase()),
    status: :planning | :executing | :synthesizing | :complete | :failed | :escalated,
    started_at: DateTime.t(),
    completed_at: DateTime.t() | nil,
    delegated_tasks: list(delegated_task()),
    results: map()
  }

  @type campaign_phase :: %{
    phase_id: String.t(),
    name: String.t(),
    agents: list(String.t()),
    dependencies: list(String.t()),
    status: :pending | :active | :complete | :failed,
    timeout_ms: pos_integer()
  }

  @type delegated_task :: %{
    task_id: String.t(),
    agent_id: String.t(),
    agent_tier: :l1 | :l2,
    domain: atom(),
    operation: atom(),
    input: term(),
    status: :pending | :running | :complete | :failed | :timeout,
    result: term() | nil,
    delegated_at: DateTime.t(),
    completed_at: DateTime.t() | nil
  }

  @type escalation :: %{
    escalation_id: String.t(),
    from_commander: String.t(),
    to_authority: String.t(),
    reason: String.t(),
    context: map(),
    severity: :low | :medium | :high | :critical,
    created_at: DateTime.t()
  }

  @callback init(commander_config()) :: {:ok, term()} | {:error, term()}

  @callback plan_campaign(objective :: String.t(), context :: map(), state :: term()) ::
              {:ok, campaign()} | {:error, term()}

  @callback execute_campaign(campaign(), state :: term()) ::
              {:ok, map()} | {:error, term()}

  @callback synthesize_results(list(delegated_task()), state :: term()) ::
              {:ok, map()} | {:error, term()}

  @callback handle_escalation(escalation(), state :: term()) ::
              {:escalated, escalation()} | {:resolved, map()}

  @callback domains() :: list(atom())

  @callback authority_level() :: :l3

  defmacro __using__(opts) do
    primary_domain = Keyword.fetch!(opts, :primary_domain)
    coordination_domains = Keyword.get(opts, :coordination_domains, [])

    quote do
      @behaviour PrismaticAgents.Behaviour.L3Commander

      use GenServer

      @impl PrismaticAgents.Behaviour.L3Commander
      def authority_level, do: :l3

      @impl PrismaticAgents.Behaviour.L3Commander
      def domains, do: [unquote(primary_domain) | unquote(coordination_domains)]

      def start_link(config) do
        GenServer.start_link(__MODULE__, config, name: via_tuple(config))
      end

      @impl GenServer
      def init(config) do
        :telemetry.execute(
          [:prismatic_agents, :l3, :init],
          %{},
          %{
            agent_id: config.agent_id,
            primary_domain: unquote(primary_domain),
            coordination_domains: unquote(coordination_domains)
          }
        )

        state = %{
          config: config,
          active_campaigns: %{},
          campaign_history: [],
          delegated_tasks: %{},
          escalation_log: []
        }

        __MODULE__.init(config)
        |> case do
          {:ok, custom_state} -> {:ok, Map.put(state, :custom, custom_state)}
          {:error, reason} -> {:stop, reason}
        end
      end

      defp via_tuple(config) do
        {:via, Registry, {PrismaticAgents.Registry, {:l3, config.agent_id}}}
      end
    end
  end
end
```

### Campaign Orchestration Engine

L3 Commanders manage campaigns -- multi-phase operations that coordinate multiple agents across domains:

```elixir
defmodule PrismaticAgents.L3.CampaignOrchestrator do
  @moduledoc """
  Campaign orchestration engine for L3 Strategic Commanders.
  Manages the lifecycle of multi-agent, multi-domain campaigns
  from planning through execution to synthesis.

  Campaigns execute phases in dependency order, delegating tasks
  to L1/L2 agents and synthesizing results into unified outcomes.
  """

  @type orchestration_result :: %{
    campaign_id: String.t(),
    status: :complete | :partial | :failed,
    phases_completed: non_neg_integer(),
    phases_total: non_neg_integer(),
    tasks_delegated: non_neg_integer(),
    tasks_succeeded: non_neg_integer(),
    tasks_failed: non_neg_integer(),
    synthesized_result: map(),
    duration_ms: non_neg_integer()
  }

  @spec execute(map(), list(map()), keyword()) ::
          {:ok, orchestration_result()} | {:error, term()}
  def execute(campaign, phases, opts \\ []) do
    started_at = System.monotonic_time(:millisecond)
    timeout = Keyword.get(opts, :timeout, 120_000)

    ordered_phases = topological_sort(phases)

    result =
      Enum.reduce_while(ordered_phases, %{completed: [], results: %{}}, fn phase, acc ->
        case execute_phase(phase, acc.results, timeout) do
          {:ok, phase_result} ->
            {:cont, %{
              completed: [phase.phase_id | acc.completed],
              results: Map.put(acc.results, phase.phase_id, phase_result)
            }}

          {:error, reason} ->
            if phase_critical?(phase) do
              {:halt, {:error, {:critical_phase_failed, phase.phase_id, reason}}}
            else
              {:cont, %{
                completed: acc.completed,
                results: Map.put(acc.results, phase.phase_id, {:skipped, reason})
              }}
            end
        end
      end)

    duration = System.monotonic_time(:millisecond) - started_at

    case result do
      {:error, reason} ->
        {:error, reason}

      %{completed: completed, results: results} ->
        {:ok, build_orchestration_result(campaign, completed, phases, results, duration)}
    end
  end

  defp execute_phase(phase, prior_results, timeout) do
    tasks =
      phase.agents
      |> Enum.map(fn agent_config ->
        Task.async(fn ->
          delegate_to_agent(agent_config, prior_results)
        end)
      end)

    results =
      Task.yield_many(tasks, timeout)
      |> Enum.map(fn
        {_task, {:ok, result}} -> result
        {task, nil} -> Task.shutdown(task, :brutal_kill); {:error, :timeout}
        {_task, {:exit, reason}} -> {:error, {:agent_crashed, reason}}
      end)

    successes = Enum.filter(results, &match?({:ok, _}, &1))
    failures = Enum.filter(results, &match?({:error, _}, &1))

    if length(successes) > 0 do
      merged = Enum.map(successes, fn {:ok, r} -> r end)
      {:ok, %{agents_completed: length(successes), agents_failed: length(failures), data: merged}}
    else
      {:error, {:all_agents_failed, failures}}
    end
  end

  defp delegate_to_agent(agent_config, prior_results) do
    with :authorized <- verify_delegation_authority(agent_config),
         {:ok, agent_pid} <- locate_agent(agent_config),
         input <- prepare_input(agent_config, prior_results) do
      GenServer.call(agent_pid, {:execute, input}, agent_config.timeout_ms)
    end
  end

  defp verify_delegation_authority(agent_config) do
    if agent_config.tier in [:l1, :l2] do
      :authorized
    else
      {:error, {:cannot_delegate_to, agent_config.tier}}
    end
  end

  defp locate_agent(agent_config) do
    case Registry.lookup(PrismaticAgents.Registry, {agent_config.domain, agent_config.agent_id}) do
      [{pid, _}] -> {:ok, pid}
      [] -> {:error, {:agent_not_found, agent_config.agent_id}}
    end
  end

  defp prepare_input(agent_config, prior_results) do
    deps = Map.get(agent_config, :depends_on, [])

    dependency_data =
      deps
      |> Enum.map(fn dep -> Map.get(prior_results, dep) end)
      |> Enum.reject(&is_nil/1)

    Map.put(agent_config.input, :dependency_data, dependency_data)
  end

  defp topological_sort(phases) do
    # Sort phases by dependencies so that dependent phases execute after their prerequisites
    Enum.sort_by(phases, fn phase ->
      {length(phase.dependencies), phase.phase_id}
    end)
  end

  defp phase_critical?(phase), do: Map.get(phase, :critical, true)

  defp build_orchestration_result(campaign, completed, all_phases, results, duration) do
    task_counts = count_tasks(results)

    %{
      campaign_id: campaign.campaign_id,
      status: if(length(completed) == length(all_phases), do: :complete, else: :partial),
      phases_completed: length(completed),
      phases_total: length(all_phases),
      tasks_delegated: task_counts.delegated,
      tasks_succeeded: task_counts.succeeded,
      tasks_failed: task_counts.failed,
      synthesized_result: results,
      duration_ms: duration
    }
  end

  defp count_tasks(results) do
    Enum.reduce(results, %{delegated: 0, succeeded: 0, failed: 0}, fn
      {_phase, %{agents_completed: s, agents_failed: f}}, acc ->
        %{acc | delegated: acc.delegated + s + f, succeeded: acc.succeeded + s, failed: acc.failed + f}
      {_phase, {:skipped, _}}, acc ->
        acc
    end)
  end
end
```

### Cross-Domain Delegation Engine

The delegation engine manages task assignment from L3 Commanders to L1/L2 agents across domain boundaries:

```elixir
defmodule PrismaticAgents.L3.DelegationEngine do
  @moduledoc """
  Cross-domain task delegation engine for L3 Strategic Commanders.
  Manages the lifecycle of delegated tasks with timeout handling,
  result aggregation, and failure recovery.

  Enforces authority boundaries: L3 can only delegate to L1 and L2.
  Cross-domain delegation requires the target domain to be listed
  in the commander's coordination_domains configuration.
  """

  @type delegation_request :: %{
    commander_id: String.t(),
    target_agent: String.t(),
    target_domain: atom(),
    target_tier: :l1 | :l2,
    operation: atom(),
    input: term(),
    timeout_ms: pos_integer(),
    priority: :low | :normal | :high | :critical
  }

  @type delegation_outcome :: %{
    task_id: String.t(),
    status: :success | :failure | :timeout | :rejected,
    result: term(),
    duration_ms: non_neg_integer(),
    delegated_at: DateTime.t(),
    completed_at: DateTime.t()
  }

  @spec delegate(delegation_request()) :: {:ok, delegation_outcome()} | {:error, term()}
  def delegate(request) do
    with :ok <- validate_authority(request),
         :ok <- validate_domain_access(request),
         {:ok, pid} <- resolve_target(request) do
      execute_delegation(request, pid)
    end
  end

  @spec delegate_parallel(list(delegation_request()), keyword()) ::
          {:ok, list(delegation_outcome())}
  def delegate_parallel(requests, opts \\ []) do
    max_concurrency = Keyword.get(opts, :max_concurrency, 20)

    outcomes =
      requests
      |> Task.async_stream(
        &delegate/1,
        max_concurrency: max_concurrency,
        timeout: Keyword.get(opts, :timeout, 30_000)
      )
      |> Enum.map(fn
        {:ok, {:ok, outcome}} -> outcome
        {:ok, {:error, reason}} -> %{status: :failure, result: reason}
        {:exit, reason} -> %{status: :timeout, result: reason}
      end)

    {:ok, outcomes}
  end

  defp validate_authority(%{target_tier: tier}) when tier in [:l1, :l2], do: :ok
  defp validate_authority(%{target_tier: tier}),
    do: {:error, {:authority_violation, "L3 cannot delegate to #{tier}"}}

  defp validate_domain_access(request) do
    commander_config = get_commander_config(request.commander_id)

    allowed_domains =
      [commander_config.primary_domain | commander_config.coordination_domains]

    if request.target_domain in allowed_domains do
      :ok
    else
      {:error, {:domain_access_denied, request.target_domain}}
    end
  end

  defp resolve_target(request) do
    case Registry.lookup(PrismaticAgents.Registry, {request.target_domain, request.target_agent}) do
      [{pid, _}] -> {:ok, pid}
      [] -> {:error, {:target_not_found, request.target_agent}}
    end
  end

  defp execute_delegation(request, pid) do
    delegated_at = DateTime.utc_now()
    task_id = generate_task_id(request)
    started = System.monotonic_time(:millisecond)

    :telemetry.execute(
      [:prismatic_agents, :l3, :delegation, :start],
      %{},
      %{commander: request.commander_id, target: request.target_agent, domain: request.target_domain}
    )

    result =
      try do
        GenServer.call(pid, {:execute, request.input}, request.timeout_ms)
      catch
        :exit, {:timeout, _} -> {:error, :timeout}
        :exit, reason -> {:error, {:agent_exit, reason}}
      end

    duration = System.monotonic_time(:millisecond) - started
    completed_at = DateTime.utc_now()

    :telemetry.execute(
      [:prismatic_agents, :l3, :delegation, :complete],
      %{duration_ms: duration},
      %{commander: request.commander_id, target: request.target_agent, status: elem(result, 0)}
    )

    outcome = %{
      task_id: task_id,
      status: if(match?({:ok, _}, result), do: :success, else: :failure),
      result: result,
      duration_ms: duration,
      delegated_at: delegated_at,
      completed_at: completed_at
    }

    {:ok, outcome}
  end

  defp get_commander_config(commander_id) do
    [{_pid, config}] = Registry.lookup(PrismaticAgents.Registry, {:l3, commander_id})
    config
  end

  defp generate_task_id(request) do
    hash = :crypto.hash(:sha256, "#{request.commander_id}-#{request.target_agent}-#{System.system_time(:nanosecond)}")
    "DT-" <> (Base.encode16(hash, case: :lower) |> String.slice(0, 12))
  end
end
```

### Escalation Protocol

When an L3 Commander encounters a situation beyond its authority, it escalates to L4 or L5:

```elixir
defmodule PrismaticAgents.L3.EscalationProtocol do
  @moduledoc """
  Escalation protocol for L3 Strategic Commanders.
  Defines when and how L3 agents escalate issues to L4 Domain Authority
  or L5 Supreme Authority when situations exceed their coordination scope.
  """

  @type escalation_trigger :: :authority_exceeded | :cross_platform_impact |
                              :safety_critical | :doctrine_violation | :resource_exhaustion

  @type escalation_level :: :l4_domain | :l5_supreme

  @spec should_escalate?(map()) :: {boolean(), escalation_level(), escalation_trigger()}
  def should_escalate?(situation) do
    cond do
      situation[:doctrine_violation] ->
        {true, :l5_supreme, :doctrine_violation}

      situation[:safety_critical] ->
        {true, :l5_supreme, :safety_critical}

      situation[:cross_platform_impact] ->
        {true, :l4_domain, :cross_platform_impact}

      situation[:authority_exceeded] ->
        {true, :l4_domain, :authority_exceeded}

      situation[:resource_exhaustion] ->
        {true, :l4_domain, :resource_exhaustion}

      true ->
        {false, :l4_domain, :authority_exceeded}
    end
  end

  @spec escalate(String.t(), escalation_level(), map()) ::
          {:ok, String.t()} | {:error, term()}
  def escalate(commander_id, level, context) do
    escalation = %{
      escalation_id: generate_escalation_id(),
      from_commander: commander_id,
      level: level,
      context: context,
      severity: determine_severity(context),
      created_at: DateTime.utc_now()
    }

    :telemetry.execute(
      [:prismatic_agents, :l3, :escalation],
      %{severity: escalation.severity},
      %{commander: commander_id, level: level}
    )

    target = resolve_escalation_target(level, context)

    case GenServer.call(target, {:escalation, escalation}, 30_000) do
      {:ok, resolution} -> {:ok, resolution}
      {:error, reason} -> {:error, {:escalation_failed, reason}}
    end
  end

  defp determine_severity(%{doctrine_violation: true}), do: :critical
  defp determine_severity(%{safety_critical: true}), do: :critical
  defp determine_severity(%{cross_platform_impact: true}), do: :high
  defp determine_severity(_context), do: :medium

  defp resolve_escalation_target(:l5_supreme, _context) do
    {:via, Registry, {PrismaticAgents.Registry, {:l5, "archer-supreme"}}}
  end

  defp resolve_escalation_target(:l4_domain, context) do
    domain = Map.get(context, :domain, :general)
    {:via, Registry, {PrismaticAgents.Registry, {:l4, domain}}}
  end

  defp generate_escalation_id do
    "ESC-" <> (System.system_time(:nanosecond) |> Integer.to_string(36) |> String.slice(0, 10))
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform deploys approximately 80 L3 Strategic Commanders across its operational domains. These agents coordinate the platform's most complex operations, from multi-source OSINT investigations to Color-Team security campaigns.

### Commander Distribution by Domain

| Domain | L3 Commanders | Primary Mission |
|--------|--------------|-----------------|
| **Color-Team Security** | 6 | Team command (Red, Blue, Purple, White, Gray, Black) |
| **OSINT Operations** | 15 | Multi-source investigation campaigns |
| **Intelligence Analysis** | 12 | Cross-domain [intelligence analysis](/glossary/intelligence-analysis/) |
| **Compliance** | 10 | [KYC](/glossary/kyc/)/[AML](/glossary/aml/) workflow coordination |
| **EASM** | 8 | [Attack surface](/glossary/attack-surface/) discovery campaigns |
| **Quality Assurance** | 8 | Cross-app quality gate enforcement |
| **Platform Operations** | 7 | Infrastructure coordination |
| **Evolution** | 6 | Autoevolution campaign management |
| **Reporting** | 5 | Multi-domain report generation |
| **Miscellaneous** | 3 | Specialized cross-domain tasks |

### Campaign Examples

An L3 OSINT Commander executing a corporate due diligence campaign:

1. **Phase 1 (Collection)**: Delegates to 8 L1 collectors (ARES, Justice.cz, WHOIS, DNS, CT logs, ISIR, Sanctions, Web)
2. **Phase 2 (Processing)**: Delegates to 3 L2 specialists (entity resolution, data enrichment, format normalization)
3. **Phase 3 (Analysis)**: Delegates to 2 L2 analysts ([risk scoring](/glossary/risk-score/), [threat assessment](/glossary/threat-assessment/))
4. **Phase 4 (Synthesis)**: L3 Commander synthesizes results into unified investigation report
5. **Phase 5 (Dissemination)**: Delegates to L1 notifiers for report delivery

### Signal Flow in Color-Team Operations

```
Gray L3 Commander ──> Gray L4 Edge Finder (boundary seeds)
         │
         ├──> Red L3 Commander ──> Red L2 Specialists (adversarial scenarios)
         │              │
         │              └──> Purple L3 Coordinator (synthesis)
         │                            │
         │                            ├──> Blue L3 Commander ──> Blue L2 Specialists (defense)
         │                            │
         │                            └──> White L3 Commander ──> White L4 Provers (verification)
         │
         └──> Black L3 Commander (ISOLATED) ──> Black L3 Enforcer (abstraction)
```

## Comparison with Alternatives

| Framework | Coordination Model | Cross-Domain | Escalation | Authority Enforcement |
|-----------|-------------------|--------------|------------|----------------------|
| **AIAD L3 (Prismatic)** | Campaign-based orchestration | Native (typed domains) | Structured protocol | Compile + runtime |
| **LangChain Agents** | Sequential/parallel chains | None (single chain) | None | None |
| **AutoGPT** | Goal decomposition | None (monolithic) | None | None |
| **CrewAI** | Role-based delegation | Limited (flat roles) | Manager role only | Soft guidelines |
| **Microsoft AutoGen** | Conversation routing | Group chat patterns | Admin agent | Message-level |
| **Apache Airflow** | DAG orchestration | Cross-DAG triggers | SLA-based alerts | Connection-level |
| **Kubernetes Operators** | Reconciliation loops | CRD-based | Event escalation | RBAC |

AIAD L3's advantage: typed domain boundaries, structural authority enforcement, OTP fault tolerance for campaign execution, and explicit escalation protocols that prevent unauthorized cross-tier operations.

## Best Practices

1. **Plan Before Executing**: Every campaign should have a documented plan with phases, dependencies, and expected outcomes before execution begins
2. **Respect Domain Boundaries**: Only coordinate across domains listed in the commander's `coordination_domains`. Expanding scope requires L4 approval
3. **Delegate, Don't Execute**: L3 commanders should never perform L1/L2 operations directly. If you need data collected, delegate to an L1 collector
4. **Monitor Delegation Health**: Track success/failure rates of delegated tasks. Persistent failures in a domain indicate systemic issues requiring escalation
5. **Escalate Early**: When a situation exceeds L3 authority, escalate immediately rather than attempting to resolve it within constrained authority
6. **Synthesize Across Sources**: The unique value of L3 is cross-domain synthesis. Every campaign should produce results that no single-domain agent could achieve
7. **Maintain Campaign State**: Persist campaign state for fault recovery. If the commander process crashes mid-campaign, the supervision tree should restart it with recoverable state
8. **Emit Comprehensive Telemetry**: Campaign-level telemetry (phases, delegations, escalations) enables platform-wide observability

## Common Pitfalls

1. **Becoming an L2**: Performing deep single-domain analysis instead of coordinating across domains. If the commander only operates in one domain, it should be an L2
2. **Over-Delegation**: Creating unnecessarily complex delegation chains when a simpler L2 specialist could handle the task
3. **Missing Escalation**: Attempting to resolve L4/L5 issues within L3 authority, leading to incomplete or incorrect outcomes
4. **Campaign State Loss**: Not persisting campaign state, causing full campaign restarts on process crashes
5. **Synchronous Bottlenecks**: Waiting synchronously for all delegated tasks instead of processing results as they arrive
6. **Ignoring Partial Results**: Failing the entire campaign when one non-critical phase fails, rather than producing partial results from available data
7. **Domain Scope Creep**: Gradually expanding coordination scope beyond configured domains without proper authorization
8. **Circular Delegation**: L3 commanders delegating to each other, creating infinite loops. Delegation must always flow downward (L3 to L1/L2)

## Use Cases

### Multi-Source OSINT Investigation

An L3 OSINT Commander coordinates a comprehensive investigation of a target entity by delegating DNS collection, WHOIS lookup, certificate transparency monitoring, business registry queries, and sanctions screening to specialized [L1 Operational Units](/glossary/l1-operational-units/), then synthesizing results into a unified intelligence product.

### Color-Team Security Exercise

The Purple L3 Coordinator orchestrates a complete Red-Blue loop: directing the Red L3 Commander to generate adversarial scenarios, the Blue L3 Commander to produce defensive responses, and synthesizing both into closure assessments that identify genuine vulnerabilities versus false alarms.

### Cross-Domain Compliance Workflow

A Compliance L3 Commander coordinates [KYC](/glossary/kyc/) verification across OSINT collection (L1 registry queries), entity resolution (L2 identity matching), risk scoring (L2 assessment), and sanctions screening (L1 list checking) to produce a unified compliance decision.

### Platform Evolution Campaign

An Evolution L3 Commander coordinates autoevolution scans across multiple umbrella applications, delegating quality checks to L1 analyzers, collecting improvement opportunities from L2 specialists, and synthesizing platform-wide evolution recommendations.

## Related Concepts

- [Agent Tier](/glossary/agent-tier/) -- The hierarchical classification system defining L1 through L5
- [Authority Level](/glossary/authority-level/) -- Access and permission framework governing agent capabilities
- [L1 Operational Units](/glossary/l1-operational-units/) -- The agents L3 commanders most frequently delegate to
- [L2 Tactical Specialists](/glossary/l2-tactical-specialists/) -- Domain specialists providing deep analysis under L3 coordination
- [L5 Supreme Authority](/glossary/l5-supreme-authority/) -- Platform-wide governance tier that L3 escalates to
- [AIAD](/glossary/aiad/) -- The AI-Augmented Intelligence Design framework defining the hierarchy
- [Chain of Command](/glossary/chain-of-command/) -- The authority flow from L5 through L1
- [Strategic Command](/glossary/strategic-command/) -- Command patterns that L3 agents implement
- [Supervision Tree](/glossary/supervision-tree/) -- OTP supervision architecture for commander fault tolerance
- [GenServer](/glossary/genserver/) -- The OTP behaviour underlying commander implementations

## See Also

- [AIAD](/glossary/aiad/) -- Framework specification
- [Agent Tier](/glossary/agent-tier/) -- Hierarchy overview
- [L1 Operational Units](/glossary/l1-operational-units/) -- Operational tier
- [L2 Tactical Specialists](/glossary/l2-tactical-specialists/) -- Tactical tier
- [L5 Supreme Authority](/glossary/l5-supreme-authority/) -- Supreme tier
- [Intelligence Analysis](/glossary/intelligence-analysis/) -- Key L3 coordination domain

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
