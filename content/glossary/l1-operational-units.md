+++
title = "L1 Operational Units"
weight = 50
[extra]
description = "The foundational tier of the AIAD agent hierarchy, comprising focused single-domain agents with read-only or limited write access that perform data collection, formatting, validation, and basic analysis operations."
category = "agents"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "intermediate"
quality_score = 95
technical_level = "intermediate"
domain_category = "agent-architecture"
related_concepts = ["agent hierarchy", "operational authority", "single-domain focus", "read-only access", "data collection", "AIAD framework", "chain of command"]
implementation_status = "production"
authority_level = "domain-expert"
difficulty_rating = 5
prerequisites = ["aiad", "agent-tier", "otp"]
learning_path = ["aiad", "agent-tier", "l1-operational-units", "l2-tactical-specialists", "l3-strategic-commanders", "l5-supreme-authority"]
interactive_demos = ["/labs/glossary/l1-operational-units"]
code_examples = ["Elixir L1 agent behaviour specification", "Data collector agent implementation", "Authority level enforcement"]
external_resources = ["https://en.wikipedia.org/wiki/Command_hierarchy", "https://www.erlang.org/doc/design_principles/des_princ", "https://hexdocs.pm/elixir/GenServer.html"]
version_introduced = "0.8.0"
stability_level = "stable"
testing_scenarios = ["authority boundary enforcement", "read-only access validation", "single-domain scope verification", "escalation path testing", "supervision tree integration"]
keywords = ["L1 operational units definition", "AIAD agent hierarchy", "operational tier agents", "agent authority levels", "single-domain agents", "data collector agents", "AIAD L1 specification", "agent chain of command"]
tags = ["agents", "aiad", "hierarchy", "architecture", "operational", "l1"]
related_terms = ["agent-tier", "authority-level", "l2-tactical-specialists", "l3-strategic-commanders", "l5-supreme-authority", "aiad", "chain-of-command", "strategic-command", "supervision-tree", "genserver"]
word_count = 1474
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "L1 Operational Units - Prismatic Platform"
+++

## Definition

L1 Operational Units are the foundational tier in the AIAD (AI-Augmented Intelligence Design) agent hierarchy. They represent the most numerous and most focused agents in the system -- specialized workers that perform a single, well-defined operation within a single domain. L1 agents operate with read-only or strictly limited write access, executing predefined tasks without autonomous decision-making authority. They are the data collectors, formatters, validators, parsers, and basic analyzers that form the operational backbone of the Prismatic Platform's 530+ agent ecosystem.

The "L1" designation follows military and organizational hierarchy conventions where lower numbers indicate lower authority levels. L1 agents cannot modify system state beyond their narrow operational scope, cannot invoke agents at their own tier or above, and cannot make decisions that affect other domains. Their authority is constrained by design: an L1 data collector can fetch data from an external API but cannot decide what to do with that data -- that decision belongs to higher-tier agents.

## Overview

### Position in the AIAD Hierarchy

The AIAD framework defines five authority levels, each with distinct capabilities and constraints:

| Tier | Name | Authority | Scope | Agent Count | Example |
|------|------|-----------|-------|-------------|---------|
| **L1** | **Operational Units** | **Read-only / limited write** | **Single domain** | **~300** | **Data collectors, formatters** |
| L2 | Tactical Specialists | Domain write access | Single domain, deep | ~120 | Enrichment engines, analyzers |
| L3 | Strategic Commanders | Multi-domain coordination | Cross-domain | ~80 | Team commanders, coordinators |
| L4 | Domain Authority | Full domain control | Domain + dependencies | ~25 | Domain architects, system leads |
| L5 | Supreme Authority | Platform-wide control | Entire platform | ~5 | Archer Supreme, orchestrators |

L1 agents constitute approximately 56% of all AIAD agents (roughly 300 out of 530+). This proportion reflects a fundamental design principle: the majority of work in any intelligent system is routine data collection and processing. By concentrating this work at the lowest authority level with the strictest constraints, the system minimizes the blast radius of any individual agent failure.

### Design Principles

L1 agents are governed by five design principles:

1. **Single Responsibility**: Each L1 agent performs exactly one operation. A DNS record collector collects DNS records. It does not parse, enrich, or analyze them.
2. **Minimal Authority**: L1 agents receive the minimum permissions necessary for their task. A web scraper gets HTTP client access but not database write access.
3. **Stateless Where Possible**: L1 agents prefer stateless operation. State, when necessary, is managed by the supervising process or ETS tables, not by the agent itself.
4. **Fail Fast**: L1 agents fail immediately on unexpected input rather than attempting recovery. Recovery is the responsibility of the supervision tree.
5. **Observable**: L1 agents emit telemetry events for every significant operation, enabling monitoring by higher-tier agents.

### Operational Categories

L1 agents fall into several operational categories:

| Category | Function | Examples | Count |
|----------|----------|----------|-------|
| **Data Collectors** | Fetch data from external sources | DNS collector, WHOIS collector, ARES adapter | ~100 |
| **Parsers** | Transform raw data into structured format | HTML parser, JSON normalizer, XML extractor | ~50 |
| **Formatters** | Convert data between formats | Markdown generator, CSV exporter, JSON-LD serializer | ~40 |
| **Validators** | Verify data against rules | Schema validator, checksum verifier, format checker | ~40 |
| **Basic Analyzers** | Perform simple, rule-based analysis | Pattern matcher, threshold checker, anomaly flagger | ~35 |
| **Notifiers** | Send notifications through channels | Email sender, webhook caller, PubSub broadcaster | ~20 |
| **Metrics Collectors** | Gather system metrics | Telemetry aggregator, health checker, latency measurer | ~15 |

## Technical Details

### L1 Agent Behaviour Specification

Every L1 agent in the Prismatic Platform implements a common behaviour that enforces authority constraints at the compile level:

```elixir
defmodule PrismaticAgents.Behaviour.L1Operational do
  @moduledoc """
  Behaviour specification for L1 Operational Unit agents.
  Enforces single-domain scope, read-only/limited-write access,
  and mandatory telemetry emission.

  All L1 agents MUST implement this behaviour. The behaviour
  provides compile-time verification of authority constraints
  and runtime enforcement through the authority checker.
  """

  @type agent_config :: %{
    agent_id: String.t(),
    domain: atom(),
    operation: atom(),
    access_level: :read_only | :limited_write,
    timeout_ms: pos_integer(),
    telemetry_prefix: list(atom())
  }

  @type operation_result :: %{
    agent_id: String.t(),
    operation: atom(),
    status: :success | :failure | :timeout,
    data: term(),
    metadata: %{
      started_at: DateTime.t(),
      completed_at: DateTime.t(),
      duration_ms: non_neg_integer(),
      source: atom()
    }
  }

  @doc """
  Initialize the agent with its configuration.
  Must validate that the configuration specifies L1 authority.
  """
  @callback init(agent_config()) :: {:ok, term()} | {:error, term()}

  @doc """
  Execute the agent's single operation.
  Must return within the configured timeout.
  """
  @callback execute(input :: term(), state :: term()) ::
              {:ok, operation_result()} | {:error, term()}

  @doc """
  Return the agent's domain. Must be a single atom.
  L1 agents are prohibited from operating across domains.
  """
  @callback domain() :: atom()

  @doc """
  Return the agent's access level.
  Must be :read_only or :limited_write.
  """
  @callback access_level() :: :read_only | :limited_write

  @doc """
  Validate that the agent's authority level is L1.
  Called at compile time via __using__ macro.
  """
  @callback authority_level() :: :l1

  defmacro __using__(opts) do
    domain = Keyword.fetch!(opts, :domain)
    operation = Keyword.fetch!(opts, :operation)

    quote do
      @behaviour PrismaticAgents.Behaviour.L1Operational

      use GenServer

      @impl PrismaticAgents.Behaviour.L1Operational
      def domain, do: unquote(domain)

      @impl PrismaticAgents.Behaviour.L1Operational
      def authority_level, do: :l1

      @impl PrismaticAgents.Behaviour.L1Operational
      def access_level, do: :read_only

      def start_link(config) do
        GenServer.start_link(__MODULE__, config, name: via_tuple(config))
      end

      @impl GenServer
      def init(config) do
        :telemetry.execute(
          [:prismatic_agents, :l1, :init],
          %{},
          %{agent_id: config.agent_id, domain: unquote(domain), operation: unquote(operation)}
        )

        __MODULE__.init(config)
      end

      defp via_tuple(config) do
        {:via, Registry, {PrismaticAgents.Registry, {unquote(domain), config.agent_id}}}
      end

      defoverridable access_level: 0
    end
  end
end
```

### Example L1 Agent: DNS Record Collector

A concrete L1 agent implementation for DNS record collection:

```elixir
defmodule PrismaticAgents.L1.DNS.RecordCollector do
  @moduledoc """
  L1 Operational Unit: DNS Record Collector.
  Collects DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA) for a given domain.
  Read-only access. No state modification. Single-domain scope.
  """

  use PrismaticAgents.Behaviour.L1Operational,
    domain: :dns_intelligence,
    operation: :record_collection

  @record_types [:a, :aaaa, :mx, :ns, :txt, :cname, :soa]

  @type dns_query :: %{
    domain: String.t(),
    record_types: list(atom()),
    nameserver: String.t() | nil
  }

  @type dns_record :: %{
    domain: String.t(),
    type: atom(),
    value: String.t(),
    ttl: non_neg_integer(),
    collected_at: DateTime.t()
  }

  @impl PrismaticAgents.Behaviour.L1Operational
  def init(config) do
    state = %{
      agent_id: config.agent_id,
      nameserver: Map.get(config, :nameserver, "8.8.8.8"),
      timeout_ms: Map.get(config, :timeout_ms, 5_000),
      queries_completed: 0
    }

    {:ok, state}
  end

  @impl PrismaticAgents.Behaviour.L1Operational
  def execute(%{domain: domain} = input, state) do
    started_at = DateTime.utc_now()
    record_types = Map.get(input, :record_types, @record_types)

    results =
      record_types
      |> Task.async_stream(
        fn type -> query_record(domain, type, state.nameserver, state.timeout_ms) end,
        max_concurrency: length(record_types),
        timeout: state.timeout_ms + 1_000
      )
      |> Enum.flat_map(fn
        {:ok, {:ok, records}} -> records
        {:ok, {:error, _}} -> []
        {:exit, _} -> []
      end)

    completed_at = DateTime.utc_now()
    duration_ms = DateTime.diff(completed_at, started_at, :millisecond)

    :telemetry.execute(
      [:prismatic_agents, :l1, :dns, :collection_complete],
      %{record_count: length(results), duration_ms: duration_ms},
      %{agent_id: state.agent_id, domain: domain}
    )

    result = %{
      agent_id: state.agent_id,
      operation: :record_collection,
      status: :success,
      data: results,
      metadata: %{
        started_at: started_at,
        completed_at: completed_at,
        duration_ms: duration_ms,
        source: :dns_resolver
      }
    }

    {:ok, result}
  end

  @spec query_record(String.t(), atom(), String.t(), pos_integer()) ::
          {:ok, list(dns_record())} | {:error, term()}
  defp query_record(domain, type, nameserver, timeout) do
    dns_type = atom_to_dns_type(type)

    case :inet_res.resolve(to_charlist(domain), :in, dns_type,
           [{:nameservers, [{parse_ip(nameserver), 53}]}, {:timeout, timeout}]) do
      {:ok, dns_msg} ->
        records = extract_records(domain, type, dns_msg)
        {:ok, records}

      {:error, reason} ->
        {:error, {:dns_query_failed, type, reason}}
    end
  end

  defp atom_to_dns_type(:a), do: :a
  defp atom_to_dns_type(:aaaa), do: :aaaa
  defp atom_to_dns_type(:mx), do: :mx
  defp atom_to_dns_type(:ns), do: :ns
  defp atom_to_dns_type(:txt), do: :txt
  defp atom_to_dns_type(:cname), do: :cname
  defp atom_to_dns_type(:soa), do: :soa

  defp extract_records(domain, type, dns_msg) do
    dns_msg
    |> :inet_dns.msg(:anlist)
    |> Enum.map(fn rr ->
      %{
        domain: domain,
        type: type,
        value: format_rr_value(type, :inet_dns.rr(rr, :data)),
        ttl: :inet_dns.rr(rr, :ttl),
        collected_at: DateTime.utc_now()
      }
    end)
  end

  defp format_rr_value(:a, {a, b, c, d}), do: "#{a}.#{b}.#{c}.#{d}"
  defp format_rr_value(:txt, data) when is_list(data), do: Enum.join(data, "")
  defp format_rr_value(:mx, {priority, host}), do: "#{priority} #{host}"
  defp format_rr_value(_type, data), do: to_string(data)

  defp parse_ip(ip_string) do
    {:ok, ip} = :inet.parse_address(to_charlist(ip_string))
    ip
  end
end
```

### Authority Enforcement at Runtime

The authority checker prevents L1 agents from exceeding their access level:

```elixir
defmodule PrismaticAgents.AuthorityChecker do
  @moduledoc """
  Runtime authority enforcement for AIAD agents.
  Validates that agents operate within their authority level,
  preventing L1 agents from performing L2+ operations.
  """

  @type authority_level :: :l1 | :l2 | :l3 | :l4 | :l5

  @authority_capabilities %{
    l1: [:read, :collect, :format, :validate, :notify],
    l2: [:read, :collect, :format, :validate, :notify, :write, :enrich, :analyze],
    l3: [:read, :collect, :format, :validate, :notify, :write, :enrich, :analyze,
         :coordinate, :delegate, :escalate],
    l4: [:read, :collect, :format, :validate, :notify, :write, :enrich, :analyze,
         :coordinate, :delegate, :escalate, :configure, :supervise],
    l5: [:all]
  }

  @spec check_authority(authority_level(), atom()) ::
          :authorized | {:unauthorized, String.t()}
  def check_authority(agent_level, requested_operation) do
    capabilities = Map.get(@authority_capabilities, agent_level, [])

    if :all in capabilities or requested_operation in capabilities do
      :authorized
    else
      {:unauthorized,
       "L#{level_number(agent_level)} agents cannot perform #{requested_operation}. " <>
         "Required: L#{minimum_level_for(requested_operation)} or higher."}
    end
  end

  @spec can_invoke?(authority_level(), authority_level()) :: boolean()
  def can_invoke?(caller_level, target_level) do
    level_number(caller_level) > level_number(target_level)
  end

  defp level_number(:l1), do: 1
  defp level_number(:l2), do: 2
  defp level_number(:l3), do: 3
  defp level_number(:l4), do: 4
  defp level_number(:l5), do: 5

  defp minimum_level_for(op) when op in [:write, :enrich, :analyze], do: 2
  defp minimum_level_for(op) when op in [:coordinate, :delegate, :escalate], do: 3
  defp minimum_level_for(op) when op in [:configure, :supervise], do: 4
  defp minimum_level_for(_op), do: 1
end
```

### Supervision and Fault Tolerance

L1 agents are supervised within domain-specific supervision trees, following OTP principles:

```elixir
defmodule PrismaticAgents.Supervisor.L1Pool do
  @moduledoc """
  Dynamic supervisor for L1 Operational Unit agents.
  Manages agent lifecycle with restart strategies appropriate
  for data collection workloads: temporary for one-shot operations,
  transient for periodic collectors.
  """

  use DynamicSupervisor

  @spec start_link(keyword()) :: Supervisor.on_start()
  def start_link(opts) do
    DynamicSupervisor.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    DynamicSupervisor.init(
      strategy: :one_for_one,
      max_restarts: 100,
      max_seconds: 60
    )
  end

  @spec start_agent(module(), map()) :: DynamicSupervisor.on_start_child()
  def start_agent(agent_module, config) do
    spec = %{
      id: config.agent_id,
      start: {agent_module, :start_link, [config]},
      restart: :transient,
      shutdown: 5_000
    }

    DynamicSupervisor.start_child(__MODULE__, spec)
  end

  @spec stop_agent(String.t()) :: :ok | {:error, :not_found}
  def stop_agent(agent_id) do
    case Registry.lookup(PrismaticAgents.Registry, agent_id) do
      [{pid, _}] -> DynamicSupervisor.terminate_child(__MODULE__, pid)
      [] -> {:error, :not_found}
    end
  end
end
```

## Implementation in Prismatic Platform

The Prismatic Platform deploys approximately 300 L1 Operational Unit agents across its 115 umbrella applications. These agents are the workhorses of the platform's [OSINT](@/glossary/osint.md) collection, data processing, and system monitoring capabilities.

### Agent Distribution by Domain

| Domain | L1 Agent Count | Primary Operations |
|--------|---------------|-------------------|
| **OSINT Collection** | ~100 | Registry queries, API calls, web scraping |
| **Data Processing** | ~50 | Parsing, normalization, format conversion |
| **Validation** | ~40 | Schema checking, data integrity, format verification |
| **Monitoring** | ~35 | Health checks, telemetry, metric collection |
| **Security** | ~30 | Vulnerability scanning, certificate checking, DNS monitoring |
| **Formatting** | ~25 | Report generation, export formatting, serialization |
| **Notification** | ~20 | Alert delivery, webhook calling, PubSub broadcasting |

### AIAD Specification Format

Each L1 agent is documented in an AIAD agent specification file:

```yaml
# .aiad/agents/dns-record-collector.agent.md
agent_id: dns-record-collector
name: DNS Record Collector
tier: L1
domain: dns_intelligence
operation: record_collection
access_level: read_only

capabilities:
  - Collect DNS records (A, AAAA, MX, NS, TXT, CNAME, SOA)
  - Query multiple nameservers
  - Parallel record type resolution

constraints:
  - Read-only access to DNS resolvers
  - No database write access
  - Single domain scope (dns_intelligence)
  - Cannot invoke L1 or higher agents

supervision:
  strategy: transient
  max_restarts: 10
  supervisor: PrismaticAgents.Supervisor.L1Pool

enforcement:
  doctrine: "no-mercy-no-doubts"
  version: "2.0.0"
  compliance: mandatory
```

## Comparison with Alternatives

| Framework | Hierarchy Model | Lowest Tier | Authority Enforcement | OTP Integration |
|-----------|----------------|-------------|----------------------|-----------------|
| **AIAD (Prismatic)** | 5-tier (L1-L5) | L1 Operational Units | Compile-time + runtime | Native GenServer/Supervisor |
| **LangChain Agents** | Flat (tools) | Tool functions | None (caller-enforced) | None |
| **AutoGPT** | Single agent | N/A (monolithic) | None | None |
| **CrewAI** | Role-based | Worker | Role-based soft limits | None |
| **Microsoft AutoGen** | Conversation-based | Assistant | Message filtering | None |
| **Apache Airflow** | DAG operators | Operator | DAG-level permissions | None |

AIAD's L1 tier provides structural guarantees (compile-time behaviour enforcement, runtime authority checking, OTP supervision) that soft role-based systems cannot match. The OTP supervision tree ensures that L1 agent failures are contained and recovered automatically without human intervention.

## Best Practices

1. **One Operation Per Agent**: An L1 agent should do exactly one thing. If you need to collect and parse, create two L1 agents
2. **Enforce Read-Only by Default**: Start with `:read_only` access and only upgrade to `:limited_write` when the operation genuinely requires writing
3. **Emit Telemetry Always**: Every L1 operation must emit telemetry events for monitoring by [L3 Strategic Commanders](@/glossary/l3-strategic-commanders.md)
4. **Use Transient Restart**: L1 agents performing one-shot collection should use `:transient` restart strategy; periodic collectors use `:permanent`
5. **Keep State Minimal**: L1 agents should hold minimal state -- ideally only their configuration. Working data belongs in the pipeline, not the agent
6. **Timeout Everything**: All external calls must have explicit timeouts. An L1 agent that hangs is worse than one that fails fast
7. **Document the Boundary**: The AIAD spec file must clearly state what the agent can and cannot do
8. **Test Authority Boundaries**: Include tests that verify the agent is rejected when attempting operations beyond its authority level

## Common Pitfalls

1. **Scope Creep**: Adding "just one more feature" to an L1 agent until it becomes an L2 in disguise. If it needs write access or multi-step logic, promote it to L2
2. **Shared State**: L1 agents sharing ETS tables or process dictionaries. Each agent should be independent
3. **Missing Supervision**: Running L1 agents outside the supervision tree. All agents must be supervised
4. **Synchronous Blocking**: Making synchronous calls to slow external APIs without timeouts, blocking the agent process
5. **Authority Bypass**: Hardcoding write operations in an agent declared as `:read_only`. The authority checker catches this at runtime but it should be prevented at design time
6. **Monolithic Collectors**: Creating a single L1 agent that collects from multiple unrelated sources. Each source should have its own collector
7. **Missing Telemetry**: Skipping telemetry emission to "keep it simple." Telemetry is mandatory for L1 observability
8. **Over-Complex Error Handling**: L1 agents should fail fast. Complex retry logic belongs in the supervision tree or the orchestrating L2/L3 agent

## Use Cases

### OSINT Data Collection

The primary use case for L1 agents is [OSINT](@/glossary/osint.md) data collection. Each of the platform's 120+ OSINT source adapters is implemented as an L1 Operational Unit. The DNS collector queries DNS records, the WHOIS collector fetches registration data, the ARES adapter queries the Czech business registry -- each operating independently within its single-domain scope.

### System Health Monitoring

L1 metric collection agents monitor individual system components: a health check agent pings each service endpoint, a latency measurer records response times, and a resource monitor tracks memory and CPU usage. These feeds aggregate through [L2 Tactical Specialists](@/glossary/l2-tactical-specialists.md) into system health dashboards.

### Data Validation Pipeline

Before data enters the analysis pipeline, L1 validators check format compliance, schema adherence, and data integrity. A JSON schema validator ensures collected records match expected structures; a checksum verifier confirms data integrity; a timestamp validator ensures temporal consistency.

### Alert Notification Delivery

L1 notifier agents deliver alerts through specific channels. An email notifier sends formatted alerts, a webhook caller posts to external endpoints, and a PubSub broadcaster pushes updates to LiveView dashboards. Each handles a single delivery channel.

## Related Concepts

- [Agent Tier](@/glossary/agent-tier.md) -- The hierarchical classification system for AIAD agents
- [Authority Level](@/glossary/authority-level.md) -- Access and permission framework governing agent capabilities
- [L2 Tactical Specialists](@/glossary/l2-tactical-specialists.md) -- The next tier up, with domain write access and deeper analysis
- [L3 Strategic Commanders](@/glossary/l3-strategic-commanders.md) -- Multi-domain coordinators that orchestrate L1 and L2 agents
- [L5 Supreme Authority](@/glossary/l5-supreme-authority.md) -- Platform-wide control tier
- [AIAD](@/glossary/aiad.md) -- The AI-Augmented Intelligence Design framework defining the agent hierarchy
- [Chain of Command](@/glossary/chain-of-command.md) -- The authority flow from L5 through L1
- [Strategic Command](@/glossary/strategic-command.md) -- Command patterns used by higher-tier agents to direct L1 operations
- [Supervision Tree](@/glossary/supervision-tree.md) -- OTP supervision architecture underlying agent fault tolerance
- [GenServer](@/glossary/genserver.md) -- The OTP behaviour that L1 agents implement

## See Also

- [AIAD](@/glossary/aiad.md) -- Framework specification
- [Agent Tier](@/glossary/agent-tier.md) -- Hierarchy overview
- [L2 Tactical Specialists](@/glossary/l2-tactical-specialists.md) -- Next authority tier
- [L3 Strategic Commanders](@/glossary/l3-strategic-commanders.md) -- Coordination tier
- [OSINT](@/glossary/osint.md) -- Primary L1 collection domain
- [Telemetry](@/glossary/telemetry.md) -- Observability framework for L1 agents

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
