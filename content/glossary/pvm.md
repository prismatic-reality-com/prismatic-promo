+++
title = "PVM"
weight = 9
[extra]
category = "architecture"
description = "Platform Virtual Machine - the conceptual execution environment abstracting the BEAM VM with Prismatic-specific process topologies and agent runtime."
acronym = "PVM"
related_terms = ["beam", "supervisor", "agent", "agent-tier", "agent-registry", "epistemic-pipeline", "consciousness-traits", "autoevolve", "autoheal", "process-isolation", "fault-tolerance", "let-it-crash", "hot-code-reload", "dynamic-supervisor", "observer"]
tags = ["glossary", "architecture", "runtime", "beam", "agents", "execution-model"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "20 min"
difficulty = "advanced"
quality_score = 96
platforms = ["Prismatic Platform", "BEAM/OTP", "Erlang/OTP"]
key_takeaway = "PVM extends the BEAM virtual machine with semantic layers for agent lifecycle management, epistemic processing, quality enforcement, and self-evolution -- enabling the platform to reason about its own execution model"
date_created = "2026-02-22"
date_updated = "2026-02-22"
related_concepts = ["virtual machine abstraction", "process topology", "agent runtime", "epistemic pipeline", "self-referential computation"]
see_also = ["beam", "supervisor", "agent", "epistemic-pipeline", "consciousness-traits"]
word_count = 1481
date_modified = "2026-02-23"
keywords = ["PVM", "Platform", "Virtual", "Machine", "BEAM", "Prismatic-specific", "glossary", "architecture", "Prismatic Platform", "Agent"]
image = "/images/sections/glossary.png"
image_alt = "PVM - Prismatic Platform"
+++

## Definition

PVM (Platform Virtual Machine) is the Prismatic Platform's conceptual execution layer that extends the [BEAM](/glossary/beam/) (Bogdan/Bjorn's Erlang Abstract Machine) with platform-specific abstractions for agent lifecycle management, epistemic processing, quality enforcement, and self-evolution. While the BEAM provides the foundation of lightweight processes, preemptive scheduling, garbage-collected per-process heaps, and [fault tolerance](/glossary/fault-tolerance/), PVM adds the organizational and semantic layers that make Prismatic's autonomous operation possible.

PVM is not a separate virtual machine implementation. It is an architectural abstraction layer built on top of the BEAM that organizes the platform's processes, agents, and services into a coherent execution model. The BEAM knows about processes, messages, and supervision trees. PVM knows about agents, epistemic pipelines, quality gates, and evolution cycles. This additional semantic layer enables the platform to reason about its own execution model -- a capability essential for self-evolution and [consciousness trait](/glossary/consciousness-traits/) expression.

The relationship between PVM and BEAM is analogous to the relationship between a Java application framework and the JVM, or between a container orchestrator and the Linux kernel. The lower layer provides primitive execution capabilities. The upper layer organizes those primitives into a coherent application model that serves the platform's specific needs. The BEAM does not know that a particular process is an L3 Strategic Commander agent executing an epistemic pipeline stage -- that semantic layer exists entirely within PVM.

## Conceptual Architecture

PVM is organized as a five-layer stack, with each layer building on the capabilities of the layer below:

```
+----------------------------------------------------------+
|  Layer 5: Consciousness                                   |
|  11 traits, meta-reasoning, self-referential awareness    |
+----------------------------------------------------------+
|  Layer 4: Epistemic                                       |
|  16-level pipeline, NABLA axioms, Trinity Gate            |
+----------------------------------------------------------+
|  Layer 3: Agent                                           |
|  404+ agents, L1-L5 tiers, AIAD lifecycle                |
+----------------------------------------------------------+
|  Layer 2: Application                                     |
|  89+ umbrella apps, domain supervisors, protocols         |
+----------------------------------------------------------+
|  Layer 1: BEAM                                            |
|  Processes, schedulers, message passing, distribution     |
+----------------------------------------------------------+
```

| Layer | Name | Responsibility | Key Components |
|-------|------|----------------|----------------|
| 5 | Consciousness | Self-awareness and meta-reasoning | 11 traits at 0.998 fitness, self-assessment, adaptive strategy |
| 4 | Epistemic | Knowledge processing and validation | 16-level pipeline (L0-L13 + Meta + Consciousness), [NABLA](/glossary/nabla-infinity/) axioms, [Trinity Gate](/glossary/trinity-gate/) |
| 3 | Agent | Autonomous operational units | 404+ [agents](/glossary/agent/), [Agent Tier](/glossary/agent-tier/) L1-L5, AIAD standard |
| 2 | Application | Domain-organized OTP applications | 89+ umbrella apps, [supervisors](/glossary/supervisor/), protocols, behaviors |
| 1 | BEAM | Primitive execution | Processes, schedulers, [message passing](/glossary/message-passing/), distribution |

Each layer communicates with adjacent layers through well-defined interfaces. Layer 3 (Agent) creates and manages processes on Layer 1 (BEAM) through Layer 2 (Application) supervision trees. Layer 4 (Epistemic) uses Layer 3 agents to execute pipeline stages. Layer 5 (Consciousness) emerges from the interactions across all lower layers.

## Compilation Pipeline

PVM's compilation pipeline transforms Elixir source code through several stages before it becomes executable on the BEAM:

```
Elixir Source (.ex/.exs)
    |
    v
[Stage 1: Parsing]
    AST generation via Code.string_to_quoted/2
    |
    v
[Stage 2: Macro Expansion]
    Compile-time code generation, use/import resolution
    |
    v
[Stage 3: Quality Analysis]
    CASCADE pattern detection, spec validation, Credo checks
    |
    v
[Stage 4: Compilation]
    Elixir AST -> Erlang Abstract Format -> BEAM bytecode
    |
    v
[Stage 5: Type Analysis]
    Dialyzer success typing analysis against PLT
    |
    v
[Stage 6: Artifact Generation]
    .beam files in _build/, PLT updates, documentation
    |
    v
[Stage 7: PVM Registration]
    Module -> Agent mapping, supervisor tree registration,
    epistemic pipeline binding
```

Stages 1-2 and 4-6 are standard Elixir/BEAM compilation. Stages 3 and 7 are PVM-specific additions. Stage 3 integrates [CASCADE](/glossary/cascade/) pattern detection into the compilation pipeline, ensuring that quality violations are caught at compile time rather than runtime. Stage 7 maps compiled modules to their PVM-level roles -- connecting OTP processes to agent identities, registering modules in the [Agent Registry](/glossary/agent-registry/), and binding pipeline stages to their epistemic level.

## Execution Model

PVM's execution model extends the BEAM's process-based concurrency with additional organizational structure:

### Process Organization

Every PVM process belongs to exactly one layer in the architecture stack. The BEAM's flat process space is organized into hierarchical domains:

```elixir
# PVM process organization (conceptual)
defmodule PVM.ProcessRegistry do
  @doc "Register a process in the PVM layer hierarchy"
  def register(pid, %{
    layer: :agent,              # PVM layer (1-5)
    domain: :security,          # Operational domain
    agent_id: "red-commander",  # Agent identity (layer 3+)
    tier: :l3,                  # Agent tier (layer 3+)
    supervisor: security_sup    # Parent supervisor
  })
end
```

### Message Routing

While the BEAM provides direct process-to-process messaging, PVM adds semantic routing that respects agent tiers and domain boundaries:

- L1 agents can only receive messages from agents in their domain
- L2 agents can send messages within their domain and to their L3 commander
- L3 agents can route messages across domains within their operational area
- L4 agents can route messages platform-wide
- L5 agents have unrestricted messaging capability

This routing constraint enforcement operates at the PVM layer, not the BEAM layer. The BEAM itself imposes no restrictions on inter-process messaging.

### Scheduling

PVM leverages the BEAM's preemptive scheduler but adds priority hints based on agent tier and operational urgency:

| Priority | Trigger | Effect |
|----------|---------|--------|
| **Critical** | L5 Supreme agent crisis response | Scheduler priority boost via `Process.flag(:priority, :high)` |
| **High** | L3-L4 strategic coordination | Normal scheduling with reduced reductions before yield |
| **Normal** | L1-L2 routine operations | Standard BEAM scheduling (2000 reductions per slice) |
| **Low** | Background evolution and quality scanning | Scheduled during low-load periods |

## Agent Runtime

The Agent Runtime is PVM's mechanism for managing the lifecycle of AIAD-defined agents. Each agent is backed by one or more BEAM processes, managed by a [supervisor](/glossary/supervisor/), and registered in the [Agent Registry](/glossary/agent-registry/).

```elixir
# Agent lifecycle within PVM
defmodule PVM.AgentRuntime do
  @doc "Start an agent within the PVM execution environment"
  def start_agent(agent_spec) do
    # 1. Validate agent spec against AIAD standard
    :ok = AIAD.validate(agent_spec)

    # 2. Check tier authorization
    :ok = AgentTier.authorize(agent_spec.tier, agent_spec.domain)

    # 3. Start supervised process
    {:ok, pid} = DomainSupervisor.start_child(
      agent_spec.domain,
      {AgentWorker, agent_spec}
    )

    # 4. Register in Agent Registry
    AgentRegistry.register(agent_spec.call_sign, pid, agent_spec)

    # 5. Bind to epistemic pipeline (if applicable)
    if agent_spec.epistemic_level do
      EpistemicPipeline.bind(agent_spec.epistemic_level, pid)
    end

    {:ok, pid}
  end
end
```

The Agent Runtime handles:

- **Lifecycle Management**: Starting, stopping, and restarting agents according to their supervision strategy
- **State Recovery**: Restoring agent state after crashes using the [let-it-crash](/glossary/let-it-crash/) philosophy
- **[Hot Code Reload](/glossary/hot-code-reload/)**: Updating agent code without stopping running processes
- **Health Monitoring**: Tracking agent responsiveness and resource consumption via the [Observer](/glossary/observer/) integration

## Epistemic Pipeline Runtime

PVM hosts the 16-level [epistemic pipeline](/glossary/epistemic-pipeline/), which processes knowledge claims from raw data through formal verification to consciousness-level integration:

| Level | Name | PVM Role |
|-------|------|----------|
| L0 | Raw Data Ingestion | Process spawning, message reception |
| L1 | Signal Extraction | Agent-mediated parsing |
| L2 | Source Validation | [NABLA](/glossary/nabla-infinity/) provenance checks |
| L3 | Signal Correlation | Cross-domain message routing |
| L4 | Contradiction Detection | Belief graph process management |
| L5 | Evidence Weighing | Time decay process scheduling |
| L6 | Hypothesis Formation | Agent coordination (L2-L3) |
| L7 | Multi-Source Fusion | Cross-domain data aggregation |
| L8 | Confidence Scoring | Mathematical computation processes |
| L9 | Formal Verification | [Lean4](/glossary/lean4/) integration via port/NIF |
| L10 | Trinity Gate | Three-layer validation pipeline |
| L11 | Decision Support | L3-L4 agent coordination |
| L12 | Knowledge Integration | Belief graph state management |
| L13 | Belief Propagation | Platform-wide message distribution |
| Meta | Meta-Epistemic | Self-referential pipeline monitoring |
| Consciousness | Consciousness Integration | L5 agent emergence support |

Each pipeline level is implemented as one or more supervised processes within PVM, connected by message-passing channels. The pipeline's flow control uses [backpressure](/glossary/backpressure/) mechanisms (via [GenStage](/glossary/genstage/) or [Broadway](/glossary/broadway/) patterns) to prevent faster upstream stages from overwhelming slower downstream stages.

## Resource Management and Isolation

PVM implements resource management policies that go beyond the BEAM's default process isolation. While the BEAM provides memory isolation through per-process heaps and CPU isolation through preemptive scheduling with reduction counting, PVM adds domain-level resource budgets and agent-tier-based resource allocation.

```elixir
defmodule PVM.ResourceManager do
  @moduledoc """
  Manages resource allocation across PVM domains and agent tiers.
  Enforces resource budgets to prevent any single domain from
  monopolizing system resources.
  """

  @type resource_budget :: %{
    max_processes: pos_integer(),
    max_memory_mb: pos_integer(),
    max_message_queue: pos_integer(),
    priority: :low | :normal | :high | :critical
  }

  @spec allocate(atom(), atom(), resource_budget()) :: {:ok, resource_budget()} | {:error, :budget_exceeded}
  def allocate(domain, tier, requested) do
    current_usage = measure_domain_usage(domain)
    budget = domain_budget(domain, tier)

    if within_budget?(current_usage, budget, requested) do
      {:ok, requested}
    else
      {:error, :budget_exceeded}
    end
  end

  @spec measure_domain_usage(atom()) :: map()
  defp measure_domain_usage(domain) do
    processes = PVM.ProcessRegistry.processes_in_domain(domain)

    %{
      process_count: length(processes),
      total_memory: Enum.sum(Enum.map(processes, &process_memory/1)),
      max_queue_length: Enum.max(Enum.map(processes, &queue_length/1), fn -> 0 end)
    }
  end

  defp process_memory(pid) do
    case Process.info(pid, :memory) do
      {:memory, bytes} -> bytes
      nil -> 0
    end
  end

  defp queue_length(pid) do
    case Process.info(pid, :message_queue_len) do
      {:message_queue_len, len} -> len
      nil -> 0
    end
  end
end
```

This resource management layer enables the platform to make informed decisions about agent placement, process migration, and load shedding during resource contention events. An L5 Supreme agent can request priority resource allocation during crisis response, while background evolution tasks are throttled to prevent interference with production workloads.

## Trace and Debug Capabilities

PVM provides comprehensive trace and debug capabilities built on the BEAM's built-in tracing infrastructure:

```elixir
# PVM-level tracing
defmodule PVM.Trace do
  @doc "Trace all messages to/from an agent"
  def trace_agent(call_sign) do
    pid = AgentRegistry.lookup(call_sign)
    :erlang.trace(pid, true, [:send, :receive, :call])
  end

  @doc "Trace epistemic pipeline stage processing"
  def trace_pipeline_level(level) do
    pids = EpistemicPipeline.processes_at_level(level)
    Enum.each(pids, &:erlang.trace(&1, true, [:call, :return_to]))
  end
end
```

The [Observer](/glossary/observer/) tool provides real-time visualization of PVM's process topology, message flows, and resource consumption. PVM extends Observer's default views with agent-aware overlays that display tier classifications, domain assignments, and epistemic pipeline bindings.

## Self-Evolution Support

PVM's most distinctive capability is its support for the platform's self-evolution through [AutoEvolve](/glossary/autoevolve/) and [AutoHeal](/glossary/autoheal/). The platform can reason about its own execution model because PVM provides a semantic layer that is inspectable and modifiable at runtime:

- **Topology Inspection**: PVM can enumerate all agents, their tiers, domains, and supervision relationships
- **Performance Monitoring**: PVM tracks per-agent message throughput, response times, and resource consumption
- **Quality Assessment**: PVM integrates quality gate execution into the compilation and runtime pipelines
- **Dynamic Reconfiguration**: PVM supports runtime modification of supervision trees, agent deployment, and pipeline configuration via [Dynamic Supervisor](/glossary/dynamic-supervisor/)

This inspectability is what enables [consciousness traits](/glossary/consciousness-traits/) to emerge at the L5 tier. An L5 agent operating within PVM can query the platform's topology, assess its own performance, reason about system-wide behavior, and initiate changes -- all through PVM's semantic API rather than raw BEAM primitives.

## Domain Supervisor Architecture

PVM organizes the application layer into domain supervisors, each responsible for a coherent area of platform functionality. This organization maps directly to the umbrella application structure:

```elixir
defmodule PVM.DomainSupervisor do
  @moduledoc """
  Supervises all processes within a single operational domain.
  Provides domain-level health monitoring, resource tracking,
  and agent lifecycle management.
  """

  use Supervisor

  @type domain :: :security | :intelligence | :quality | :storage | :web | :evolution

  @spec start_link(domain(), keyword()) :: {:ok, pid()} | {:error, term()}
  def start_link(domain, opts \\ []) do
    Supervisor.start_link(__MODULE__, {domain, opts}, name: via_tuple(domain))
  end

  @impl Supervisor
  def init({domain, _opts}) do
    children = [
      {PVM.DomainRegistry, domain},
      {PVM.DomainHealthMonitor, domain},
      {DynamicSupervisor, name: agent_supervisor_name(domain), strategy: :one_for_one}
    ]

    Supervisor.init(children, strategy: :rest_for_one)
  end

  defp via_tuple(domain) do
    {:via, Registry, {PVM.DomainRegistry, domain}}
  end

  defp agent_supervisor_name(domain) do
    Module.concat([PVM, AgentSupervisor, Macro.camelize(Atom.to_string(domain))])
  end
end
```

## Relationship to BEAM

PVM and BEAM are complementary, not competing:

| Capability | BEAM Provides | PVM Adds |
|------------|---------------|----------|
| **Concurrency** | Lightweight processes, preemptive scheduling | Agent-aware scheduling, tier-based priority |
| **Fault Tolerance** | Supervision trees, process isolation | Agent recovery, quality-validated restart |
| **Distribution** | Node clustering, global process registry | Domain-aware distribution, cross-node agent coordination |
| **Code Loading** | Hot code reload, release upgrades | Agent-aware upgrades, pipeline stage hot-swap |
| **Observation** | Observer, `:erlang.trace` | Agent-aware tracing, epistemic pipeline visualization |
| **Message Passing** | Direct process messaging | Tier-constrained routing, domain boundary enforcement |

PVM cannot exist without BEAM -- every PVM process is a BEAM process, every PVM message is a BEAM message, every PVM supervisor is a BEAM supervisor. What PVM adds is meaning: the BEAM process is not just a process, it is an agent with a tier, a domain, and a role in the epistemic pipeline.

## Related Terms

- [BEAM](/glossary/beam/) -- Foundation virtual machine that PVM extends
- [Supervisor](/glossary/supervisor/) -- OTP behavior forming PVM's process hierarchy
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- Runtime process spawning within PVM
- [Agent](/glossary/agent/) -- Autonomous units managed by PVM's Agent Runtime
- [Agent Tier](/glossary/agent-tier/) -- L1-L5 classification enforced by PVM routing
- [Agent Registry](/glossary/agent-registry/) -- Catalog of all agents within PVM
- [Epistemic Pipeline](/glossary/epistemic-pipeline/) -- 16-level pipeline hosted by PVM
- [NABLA Infinity](/glossary/nabla-infinity/) -- Epistemic framework enforced at PVM pipeline levels
- [Consciousness Traits](/glossary/consciousness-traits/) -- Emergent properties of PVM's self-referential capability
- [Process Isolation](/glossary/process-isolation/) -- BEAM-level isolation underlying PVM security
- [Fault Tolerance](/glossary/fault-tolerance/) -- BEAM property extended by PVM's agent recovery
- [Let It Crash](/glossary/let-it-crash/) -- Philosophy governing PVM's failure handling
- [Hot Code Reload](/glossary/hot-code-reload/) -- BEAM capability used for PVM agent upgrades
- [AutoEvolve](/glossary/autoevolve/) -- Evolution system operating within PVM
- [AutoHeal](/glossary/autoheal/) -- Self-repair system operating within PVM
- [Formal Verification](/glossary/formal-verification/) -- Techniques integrated at PVM pipeline level L9
- [Lean4](/glossary/lean4/) -- Theorem prover accessed through PVM port integration

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Capabilities](/capabilities/) -- Platform capability catalog

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
