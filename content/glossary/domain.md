+++
title = "Domain"
description = "Organizational taxonomy unit in the Prismatic Platform grouping related agents, commands, and capabilities according to functional specialization."
weight = 40

[extra]
category = "architecture"
tags = ["domain", "taxonomy", "classification", "organization", "agent-domain", "scope", "authority", "specialization", "domain-driven-design", "bounded-context", "modular-architecture"]
date_created = "2026-02-22"
date_updated = "2026-02-22"
difficulty = "intermediate"
audience = ["architects", "platform-engineers", "developers", "system-designers"]
related_terms = ["agent", "aiad", "registry", "taxonomy", "classification", "scope", "authority-level", "specialization", "umbrella-application", "supervision-tree"]
key_concepts = ["domain-specialization", "cross-domain-coordination", "domain-bridges", "failure-isolation", "independent-scaling", "authority-delegation"]
platforms = ["elixir", "otp", "beam"]
prerequisites = ["software-architecture", "organizational-patterns", "agent-concepts"]
use_cases = ["agent-organization", "capability-taxonomy", "authority-delegation", "resource-allocation", "failure-isolation"]
complexity = "medium"
stability = "stable"
domain_count = "14"
total_agents = "530+"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1675
date_modified = "2026-02-23"
keywords = ["Domain", "Organizational", "Prismatic", "Platform", "glossary", "architecture", "Prismatic Platform"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Domain - Prismatic Platform"
+++

## Definition and Overview

A **Domain** in the Prismatic Platform is a primary organizational unit that groups related agents, commands, workflows, and capabilities according to their functional specialization. The platform operates across 14 distinct domains, each representing a major area of system capability: Security, Quality Assurance, OSINT Intelligence, Development Operations, Infrastructure Management, Agent Coordination, Storage Systems, User Interface, Documentation, Analytics, Compliance, Testing, Performance, and Strategic Command.

The concept of domains in the Prismatic Platform draws from two complementary traditions. The first is Domain-Driven Design (DDD), Eric Evans' approach to structuring software around business domains, where bounded contexts define the boundaries within which a particular model is valid. The second is military organizational theory, where functional domains (intelligence, operations, logistics, communications) define specialized areas of responsibility with clear authority structures and coordination protocols.

Domains serve multiple purposes in the platform architecture: they provide the taxonomic structure for agent discovery and selection, they define scope boundaries for authority delegation, they enable resource allocation and scaling decisions, and they establish the organizational framework for capability evolution. When an operator needs "a security specialist" or "a quality assurance agent," the domain classification enables rapid identification of relevant resources without needing to know specific agent names or capabilities.

The domain model reflects the principle that complex systems require specialized expertise. Rather than deploying generalist agents that handle all concerns, the Prismatic Platform deploys domain specialists that excel within their area of expertise while coordinating across domains through standardized interfaces. This specialization approach increases both effectiveness (domain experts perform better within their domain) and reliability (failure in one domain does not compromise capabilities in other domains).

## Domain Classification System

The 14 operational domains form a complete taxonomy of platform capabilities. Each domain has a defined scope, agent population, authority boundaries, and coordination interfaces.

| Domain | Agent Count | Primary Focus | Authority Scope |
|--------|-------------|---------------|-----------------|
| **Security** | 45+ | Threat detection, vulnerability analysis, access control | System-wide security enforcement |
| **Quality** | 38+ | Code analysis, testing, performance monitoring | Development lifecycle quality gates |
| **OSINT** | 42+ | Intelligence gathering, investigation, data fusion | External intelligence collection |
| **DevOps** | 28+ | Deployment, infrastructure, monitoring | Production system management |
| **Infrastructure** | 31+ | Resource provisioning, scaling, maintenance | Platform foundation services |
| **Agents** | 35+ | Agent coordination, orchestration, lifecycle | Cross-agent communication and management |
| **Storage** | 24+ | Data persistence, retrieval, synchronization | Information management and access |
| **UI/UX** | 18+ | Interface design, user experience, accessibility | Human-system interaction |
| **Documentation** | 22+ | Content generation, maintenance, versioning | Knowledge management and sharing |
| **Analytics** | 15+ | Metrics collection, analysis, reporting | System performance and usage insights |
| **Compliance** | 12+ | Regulatory adherence, audit trails, governance | Legal and regulatory requirements |
| **Testing** | 26+ | Validation, verification, quality assurance | Correctness and reliability validation |
| **Performance** | 19+ | Optimization, profiling, resource management | System efficiency and scalability |
| **Strategic** | 8+ | Planning, coordination, crisis management | High-level decision making and direction |

## Domain Architecture in Elixir

Domains in the Prismatic Platform are implemented through a combination of [umbrella applications](/glossary/umbrella-application/), [supervision trees](/glossary/supervision-tree/), and registry-based discovery. Each domain maps to one or more umbrella applications, and agents within a domain are registered for discovery through the AIAD specification standard.

```elixir
defmodule Prismatic.Domain.Registry do
  @moduledoc """
  Registry for domain management in the Prismatic Platform.

  Provides domain discovery, agent lookup within domains,
  cross-domain coordination, and domain health monitoring.
  Each domain is a logical grouping of agents, commands,
  and capabilities with defined boundaries and interfaces.
  """

  use GenServer

  @type domain_name :: atom()
  @type domain_info :: %{
    name: domain_name(),
    agent_count: non_neg_integer(),
    agents: list(module()),
    status: :active | :degraded | :maintenance,
    started_at: DateTime.t(),
    health: float()
  }

  @type lookup_result :: {:ok, domain_info()} | {:error, :domain_not_found}

  @domains [
    :security, :quality, :osint, :devops, :infrastructure,
    :agents, :storage, :ui, :documentation, :analytics,
    :compliance, :testing, :performance, :strategic
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec list_domains() :: {:ok, list(domain_name())}
  def list_domains do
    {:ok, @domains}
  end

  @spec get_domain(domain_name()) :: lookup_result()
  def get_domain(domain_name) when domain_name in @domains do
    GenServer.call(__MODULE__, {:get_domain, domain_name})
  end

  def get_domain(_), do: {:error, :domain_not_found}

  @spec agents_in_domain(domain_name()) :: {:ok, list(module())} | {:error, term()}
  def agents_in_domain(domain_name) when domain_name in @domains do
    GenServer.call(__MODULE__, {:agents_in_domain, domain_name})
  end

  def agents_in_domain(_), do: {:error, :domain_not_found}

  @spec domain_health(domain_name()) :: {:ok, float()} | {:error, term()}
  def domain_health(domain_name) when domain_name in @domains do
    GenServer.call(__MODULE__, {:domain_health, domain_name})
  end

  def domain_health(_), do: {:error, :domain_not_found}

  # --- Callbacks ---

  @impl GenServer
  def init(_opts) do
    state = %{
      domains: initialize_domains(),
      started_at: DateTime.utc_now()
    }

    {:ok, state}
  end

  @impl GenServer
  def handle_call({:get_domain, name}, _from, state) do
    case Map.get(state.domains, name) do
      nil -> {:reply, {:error, :domain_not_found}, state}
      info -> {:reply, {:ok, info}, state}
    end
  end

  @impl GenServer
  def handle_call({:agents_in_domain, name}, _from, state) do
    case Map.get(state.domains, name) do
      nil -> {:reply, {:error, :domain_not_found}, state}
      %{agents: agents} -> {:reply, {:ok, agents}, state}
    end
  end

  @impl GenServer
  def handle_call({:domain_health, name}, _from, state) do
    case Map.get(state.domains, name) do
      nil -> {:reply, {:error, :domain_not_found}, state}
      %{health: health} -> {:reply, {:ok, health}, state}
    end
  end

  defp initialize_domains do
    @domains
    |> Enum.map(fn name ->
      {name, %{
        name: name,
        agent_count: 0,
        agents: [],
        status: :active,
        started_at: DateTime.utc_now(),
        health: 1.0
      }}
    end)
    |> Map.new()
  end
end
```

## Cross-Domain Coordination

While agents operate within domain boundaries, many platform capabilities require cross-domain coordination. The Prismatic Platform handles this through several mechanisms that maintain domain encapsulation while enabling system-wide collaboration.

### Domain Bridges

Domain bridges are specialized agents that understand multiple domains and can translate requirements between them. For example, a security-quality bridge agent can interpret security findings and determine appropriate quality gate adjustments.

```elixir
defmodule Prismatic.Domain.Bridge do
  @moduledoc """
  Implements cross-domain bridge agents that facilitate
  communication and coordination between domains.

  Bridges translate domain-specific concepts into a shared
  vocabulary, enabling agents in different domains to
  collaborate without tight coupling.
  """

  @type bridge_config :: %{
    source_domain: atom(),
    target_domain: atom(),
    translation_rules: list(map()),
    bidirectional: boolean()
  }

  @spec translate(atom(), atom(), term()) :: {:ok, term()} | {:error, :no_translation}
  def translate(source_domain, target_domain, message) do
    case find_bridge(source_domain, target_domain) do
      {:ok, bridge} ->
        apply_translation(bridge, message)

      {:error, :no_bridge} ->
        # Try indirect path through intermediate domain
        find_indirect_path(source_domain, target_domain, message)
    end
  end

  @doc """
  Routes a finding from one domain to all interested domains.

  When a security finding is discovered, it may be relevant
  to quality (adjust gates), compliance (audit trail),
  and infrastructure (patch management) domains.
  """
  @spec route_finding(atom(), map()) :: {:ok, list(atom())} | {:error, term()}
  def route_finding(source_domain, finding) do
    interested_domains = determine_interested_domains(source_domain, finding)

    results =
      interested_domains
      |> Enum.map(fn domain ->
        case translate(source_domain, domain, finding) do
          {:ok, translated} ->
            deliver_to_domain(domain, translated)
            domain

          {:error, _} ->
            nil
        end
      end)
      |> Enum.reject(&is_nil/1)

    {:ok, results}
  end

  defp find_bridge(_source, _target), do: {:error, :no_bridge}
  defp apply_translation(_bridge, message), do: {:ok, message}
  defp find_indirect_path(_source, _target, _message), do: {:error, :no_translation}
  defp determine_interested_domains(_source, _finding), do: []
  defp deliver_to_domain(_domain, _message), do: :ok
end
```

### Orchestration Agents

L1 and L2 agents with cross-domain authority can coordinate multi-domain campaigns. These agents understand domain boundaries while having authority to direct resources across domains when necessary. The Archer Supreme and Orchestrator agents operate at this level, capable of marshaling agents from any domain for strategic objectives.

### Standardized Interfaces

All domains implement common communication protocols ([AIAD](/glossary/aiad/)-compliant messaging) that enable inter-domain coordination without breaking domain encapsulation. The AIAD specification defines message formats, capability declarations, and interaction patterns that every agent must support.

### Shared Resources

Certain platform resources are accessible to all domains but managed centrally to prevent conflicts:

| Resource | Access Pattern | Manager |
|----------|---------------|---------|
| **[Trinity Gate](/glossary/trinity-gate/)** | Validation requests from any domain | Central validator |
| **Quality DNA** | Read from any, write from quality domain | Quality domain |
| **Session Context** | Read/write with domain tagging | Platform-level |
| **Telemetry** | Emit from any, aggregate centrally | Analytics domain |
| **Configuration** | Read from any, admin-only writes | Infrastructure domain |

## Domain Specialization Benefits

The domain specialization model provides several architectural advantages that compound as the system scales.

### Expertise Concentration

Each domain can develop deep expertise in its area without being distracted by concerns outside its scope. Security agents can focus entirely on threat detection and vulnerability analysis, accumulating specialized knowledge and heuristics. Quality agents can focus on code analysis patterns, test coverage metrics, and performance benchmarks. This specialization enables each domain to reach a level of sophistication that would be impossible for generalist agents.

### Failure Isolation

Problems in one domain do not cascade to other domains. If a quality gate malfunctions, security enforcement continues unaffected. If an OSINT data source becomes unavailable, the development workflow continues without interruption. This isolation is enforced at the [OTP](/glossary/otp/) level through separate [supervision trees](/glossary/supervision-tree/) for each domain.

```elixir
defmodule Prismatic.Domain.Supervisor do
  @moduledoc """
  Top-level supervisor for domain isolation.

  Each domain runs under its own supervisor, ensuring that
  failures in one domain cannot crash agents in another.
  The :one_for_one strategy means each domain supervisor
  is independently restartable.
  """

  use Supervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts \\ []) do
    Supervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl Supervisor
  def init(_opts) do
    children = [
      {Prismatic.Domain.SecuritySupervisor, []},
      {Prismatic.Domain.QualitySupervisor, []},
      {Prismatic.Domain.OSINTSupervisor, []},
      {Prismatic.Domain.DevOpsSupervisor, []},
      {Prismatic.Domain.InfrastructureSupervisor, []},
      {Prismatic.Domain.AgentsSupervisor, []},
      {Prismatic.Domain.StorageSupervisor, []},
      {Prismatic.Domain.UISupervisor, []},
      {Prismatic.Domain.DocumentationSupervisor, []},
      {Prismatic.Domain.AnalyticsSupervisor, []},
      {Prismatic.Domain.ComplianceSupervisor, []},
      {Prismatic.Domain.TestingSupervisor, []},
      {Prismatic.Domain.PerformanceSupervisor, []},
      {Prismatic.Domain.StrategicSupervisor, []},
      # Cross-domain coordination
      {Prismatic.Domain.Registry, []},
      {Prismatic.Domain.Bridge, []}
    ]

    Supervisor.init(children, strategy: :one_for_one)
  end
end
```

### Independent Scaling

Domains can be scaled independently based on workload. High-volume OSINT collection can be scaled up by adding more collector agents without affecting the more stable Strategic Command domain. In a clustered deployment, domains can be distributed across nodes based on their resource requirements.

### Technology Heterogeneity

Different domains can use different technologies, frameworks, or approaches as appropriate for their specific challenges. The Storage domain might use specialized database adapters and caching strategies, while the Analytics domain uses statistical libraries and visualization tools. Domain boundaries provide the encapsulation needed for this heterogeneity.

### Authority Delegation

Domain classification enables precise authority delegation. An [agent](/glossary/agent/) can be granted "full authority within the Quality domain" without needing to specify every individual capability. This is analogous to organizational role-based access control, where permissions are associated with roles rather than individual users.

## Domain-Driven Design Alignment

The Prismatic Platform's domain model aligns with several Domain-Driven Design patterns, adapted for multi-agent system architecture.

| DDD Concept | Prismatic Equivalent | Purpose |
|-------------|---------------------|---------|
| **Bounded Context** | Domain boundary | Define scope where model is valid |
| **Ubiquitous Language** | Domain-specific vocabulary | Shared terminology within domain |
| **Context Map** | Domain bridge configuration | Define relationships between domains |
| **Anti-Corruption Layer** | Bridge translation rules | Protect domain models from external concepts |
| **Aggregate Root** | Domain Commander (L2) | Entry point for domain operations |
| **Domain Event** | Agent event messages | Communicate significant occurrences |
| **Repository** | Storage domain adapters | Abstract data persistence |

The key difference between traditional DDD and the Prismatic approach is that DDD bounded contexts are typically passive (code modules), while Prismatic domains are active (running agent populations). A Prismatic domain is not just a conceptual boundary but a living, autonomous subsystem with its own agents, decision-making, and operational behavior.

## Domain Evolution and Governance

### Domain Lifecycle Management

Domains are not static taxonomic categories -- they evolve as platform capabilities mature and new requirements emerge.

**Domain Creation**: New domains can be created when a sufficiently distinct capability area emerges that cannot be adequately served by existing domains. The creation process involves defining the domain's scope, establishing its [supervision tree](/glossary/supervision-tree/), registering its agents, and configuring cross-domain bridges.

**Domain Splitting**: Large domains can be split when they become too broad to manage effectively. The original "Operations" domain was split into "DevOps" and "Infrastructure" as those capabilities matured and required different specializations.

**Domain Merging**: Small or overlapping domains can be merged when maintaining separation no longer provides architectural value. This is rare in practice because domain boundaries tend to sharpen over time rather than blur.

**Domain Retirement**: Domains can be retired when their capabilities are no longer needed or have been absorbed into other domains.

### Governance Standards

Each domain maintains its own governance standards while adhering to platform-wide requirements.

| Standard Level | Scope | Authority |
|---------------|-------|-----------|
| **Platform** | All domains | Absolute (NO MERCY, NO DOUBTS) |
| **Cross-Domain** | Inter-domain interfaces | Platform-wide approval required |
| **Domain** | Internal domain practices | Domain commander authority |
| **Agent** | Individual agent behavior | Constrained by domain standards |

**Platform Standards** are non-negotiable: all domains must comply with NO MERCY NO DOUBTS doctrine, [Trinity Gate](/glossary/trinity-gate/) validation, and AIAD specification compliance.

**Domain Standards** allow each domain to define best practices appropriate to its specialty. The Security domain might require additional threat modeling steps, while the Performance domain might require benchmark results for all changes.

## Domain Health Monitoring

Each domain exposes health metrics that enable the platform to detect degradation and trigger corrective action.

```elixir
defmodule Prismatic.Domain.HealthMonitor do
  @moduledoc """
  Monitors domain health across all 14 operational domains.

  Tracks agent availability, response times, error rates,
  and capability coverage to detect domain degradation
  early and trigger corrective action.
  """

  @type health_report :: %{
    domain: atom(),
    overall_health: float(),
    agent_availability: float(),
    avg_response_time_ms: non_neg_integer(),
    error_rate: float(),
    capability_coverage: float(),
    last_checked: DateTime.t()
  }

  @spec check_all_domains() :: {:ok, list(health_report())}
  def check_all_domains do
    {:ok, domains} = Prismatic.Domain.Registry.list_domains()

    reports =
      domains
      |> Enum.map(fn domain ->
        Task.async(fn -> check_domain(domain) end)
      end)
      |> Task.await_many(10_000)
      |> Enum.filter(&match?({:ok, _}, &1))
      |> Enum.map(fn {:ok, report} -> report end)

    {:ok, reports}
  end

  @spec check_domain(atom()) :: {:ok, health_report()} | {:error, term()}
  def check_domain(domain) do
    with {:ok, agents} <- Prismatic.Domain.Registry.agents_in_domain(domain),
         {:ok, availability} <- check_agent_availability(agents),
         {:ok, response_time} <- check_response_times(agents),
         {:ok, error_rate} <- check_error_rates(domain) do
      report = %{
        domain: domain,
        overall_health: calculate_overall_health(availability, response_time, error_rate),
        agent_availability: availability,
        avg_response_time_ms: response_time,
        error_rate: error_rate,
        capability_coverage: calculate_coverage(domain, agents),
        last_checked: DateTime.utc_now()
      }

      {:ok, report}
    end
  end

  defp check_agent_availability(agents) do
    alive_count = Enum.count(agents, fn agent ->
      case Process.whereis(agent) do
        nil -> false
        pid -> Process.alive?(pid)
      end
    end)

    total = max(length(agents), 1)
    {:ok, alive_count / total}
  end

  defp check_response_times(_agents), do: {:ok, 15}
  defp check_error_rates(_domain), do: {:ok, 0.001}

  defp calculate_overall_health(availability, response_time, error_rate) do
    availability_score = availability
    latency_score = max(0, 1.0 - response_time / 1000)
    error_score = max(0, 1.0 - error_rate * 100)

    (availability_score * 0.5 + latency_score * 0.3 + error_score * 0.2)
    |> Float.round(3)
  end

  defp calculate_coverage(_domain, _agents), do: 1.0
end
```

## Domains and the AIAD Standard

The [AIAD](/glossary/aiad/) specification standard uses domains as a primary classification axis for agents and commands. Every AIAD agent specification includes a `domain` field that determines which domain the agent belongs to, which in turn determines its [authority](/glossary/authority-level/) scope, coordination interfaces, and governance requirements.

```yaml
# Example AIAD agent specification
agent-spec:
  name: "security-scanner"
  domain: security         # Primary domain classification
  level: L4               # Specialist level within domain
  capabilities:
    - vulnerability-scanning
    - configuration-auditing
    - compliance-checking
  authority:
    scope: security        # Authority limited to security domain
    delegation: true       # Can delegate to L5 workers
```

This standardized classification enables automated agent discovery: when the platform needs a security specialist, it queries the [agent registry](/glossary/agent-registry/) for agents in the security domain with the required capabilities, without hardcoding specific agent names or module paths.

## Practical Domain Patterns

### Domain Facade Pattern

Each domain exposes a facade module that serves as the entry point for external access. This follows the same pattern as the Prismatic API's auto-introspection: external consumers interact with the domain through a clean, documented interface rather than reaching into internal components.

### Domain Event Sourcing

Domains communicate significant state changes through domain events. When the Security domain discovers a vulnerability, it emits a domain event that the Compliance domain can use to update audit trails, the Quality domain can use to adjust gates, and the Infrastructure domain can use to prioritize patching.

### Domain Circuit Breakers

When a domain becomes unhealthy (high error rates, slow responses, or agent unavailability), circuit breakers prevent cascading failures by temporarily limiting cross-domain requests to the affected domain. This gives the domain's supervision trees time to recover without overwhelming them with new requests.

## Related Concepts

- [Agent](/glossary/agent/) -- Individual entities organized into domains
- [AIAD](/glossary/aiad/) -- Specification standard using domain classification
- [Agent Registry](/glossary/agent-registry/) -- Discovery mechanism for domain agents
- [Authority Level](/glossary/authority-level/) -- Hierarchical authority within domains
- [Supervision Tree](/glossary/supervision-tree/) -- Fault tolerance structure for domains
- [Umbrella Application](/glossary/umbrella-application/) -- Code organization paralleling domains
- [Multi-Agent System](/glossary/multi-agent-system/) -- System architecture using domains
- [Taxonomy](/glossary/taxonomy/) -- Classification system including domains
- [Architecture](/glossary/architecture/) -- Platform architecture shaped by domains
- [OTP](/glossary/otp/) -- Framework enabling domain isolation

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
