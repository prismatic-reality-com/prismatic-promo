+++
title = "GenStatem"
weight = 38
[extra]
category = "technology"
description = "OTP state machine behaviour for modeling complex stateful protocols"
keywords = ["gen_statem", "state machine", "FSM", "OTP", "finite state machine", "callback mode", "state transitions", "Erlang"]
abbreviation = "N/A"
related_terms = ["genserver", "otp", "behaviour", "supervision-tree", "beam", "message-passing", "dialyzer", "prismatic-perimeter"]
related_apps = ["prismatic_perimeter", "prismatic_agents", "prismatic_supervisor", "prismatic_storage_core"]
domain = "otp-behaviours"
complexity = "advanced"
stability = "stable"
since_generation = 6
beam_related = true
otp_behaviour = true
elixir_module = ":gen_statem"
phoenix_component = false
security_relevant = false
compliance_relevant = false
osint_relevant = false
performance_critical = false
date_created = "2025-04-01"
date_updated = "2026-02-22"
version = "2.0.0"
erlang_otp_version = "19+"
callback_modes = ["state_functions", "handle_event_function"]
timeout_types = ["event_timeout", "state_timeout", "generic_timeout"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1310
date_modified = "2026-02-23"
tags = ["glossary", "technology", "genstatem", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "GenStatem - Prismatic Platform"
+++

## Definition

GenStatem (`:gen_statem`) is an OTP behaviour for building finite state machines (FSMs) and event-driven state processes on the [BEAM](/glossary/beam/) virtual machine. While [GenServer](/glossary/genserver/) manages arbitrary state through a uniform callback interface, GenStatem enforces explicit state transitions with dedicated callback functions per state, making complex protocols, handshakes, multi-phase workflows, and connection management type-safe and auditable. Every state transition is explicit, documented, and verifiable -- there are no hidden state changes or implicit transitions.

GenStatem was introduced in Erlang/OTP 19 as a replacement for the older `gen_fsm` behaviour, which it supersedes with a more powerful and flexible API. The key improvement over `gen_fsm` is the introduction of two callback modes (`:state_functions` and `:handle_event_function`) and state-enter callbacks, which execute automatically when transitioning into a state. These features address common shortcomings of ad hoc state machine implementations: forgotten state transitions, missing cleanup on state exit, and the difficulty of reasoning about valid state sequences.

## Overview

The fundamental design principle of GenStatem is that state machines should make illegal states unrepresentable. By defining explicit callback functions for each state, the compiler and [Dialyzer](/glossary/dialyzer/) can verify that all states have handlers and that transitions follow the declared patterns. This is a significant improvement over tracking state in a GenServer's state map, where nothing prevents an invalid state value from being set.

In the Prismatic Platform, GenStatem models complex multi-phase workflows where explicit state transitions are critical for correctness and auditability. The EASM scanning lifecycle, compliance assessment workflows, agent state management, and connection pool management all use GenStatem to ensure that every phase transition is deliberate and every possible event in every possible state has a defined handler.

The distinction between GenServer and GenStatem is not about capability but about clarity. GenServer can implement any state machine by tracking state in its process state map. But GenStatem makes the state machine structure visible in the code: states are function names (or pattern match values), transitions are return tuples, and unhandled state-event combinations produce clear function clause errors. This visibility reduces bugs and improves maintainability for any process with three or more distinct behavioral states.

## Callback Modes

GenStatem supports two callback modes that determine how state handlers are organized:

| Mode | Handler Organization | Use Case |
|------|---------------------|----------|
| `:state_functions` | One function per state (`def idle/3`, `def active/3`) | Clearly defined states, separate logic per state |
| `:handle_event_function` | Single function with state pattern matching | Dynamic states, state data as state names |

### State Functions Mode

In `:state_functions` mode, each state is a separate Elixir function. This produces the most readable code when states are well-defined and finite:

```elixir
defmodule PrismaticPerimeter.ConnectionFSM do
  @moduledoc """
  Connection state machine using state_functions callback mode.
  Each state is a separate function, making the state diagram
  directly readable from the code structure.
  """

  @behaviour :gen_statem

  @impl :gen_statem
  def callback_mode, do: [:state_functions, :state_enter]

  @impl :gen_statem
  def init(config) do
    data = %{config: config, attempts: 0, socket: nil, last_error: nil}
    {:ok, :disconnected, data}
  end

  # State: :disconnected
  def disconnected(:enter, _old_state, data) do
    {:keep_state, %{data | socket: nil}}
  end

  def disconnected(:cast, :connect, data) do
    {:next_state, :connecting, %{data | attempts: data.attempts + 1}}
  end

  # State: :connecting
  def connecting(:enter, _old_state, data) do
    actions = [{:state_timeout, 10_000, :connection_timeout}]
    {:keep_state, data, actions}
  end

  def connecting(:cast, {:connected, socket}, data) do
    {:next_state, :connected, %{data | socket: socket}}
  end

  def connecting(:state_timeout, :connection_timeout, data) do
    {:next_state, :disconnected, %{data | last_error: :timeout}}
  end

  # State: :connected
  def connected(:enter, _old_state, data) do
    actions = [{:state_timeout, 300_000, :keepalive}]
    {:keep_state, data, actions}
  end

  def connected(:cast, :disconnect, data) do
    {:next_state, :disconnecting, data}
  end

  def connected(:state_timeout, :keepalive, data) do
    send_keepalive(data.socket)
    actions = [{:state_timeout, 300_000, :keepalive}]
    {:keep_state, data, actions}
  end

  defp send_keepalive(_socket), do: :ok
end
```

### Handle Event Function Mode

In `:handle_event_function` mode, a single function handles all state-event combinations through pattern matching. This is useful when states are dynamic or when the same event handling logic applies across multiple states:

```elixir
defmodule PrismaticAgents.DynamicStateMachine do
  @moduledoc """
  Dynamic state machine using handle_event_function callback mode.
  Useful when states are not known at compile time or when
  cross-state event handling is common.
  """

  @behaviour :gen_statem

  @impl :gen_statem
  def callback_mode, do: [:handle_event_function]

  @impl :gen_statem
  def init(initial_state) do
    {:ok, initial_state, %{history: []}}
  end

  @impl :gen_statem
  def handle_event(:cast, :connect, :disconnected, data) do
    {:next_state, :connecting, %{data | history: [:connect | data.history]}}
  end

  def handle_event(:cast, {:connected, socket}, :connecting, data) do
    {:next_state, :connected, Map.put(data, :socket, socket)}
  end

  def handle_event({:call, from}, :get_state, state, data) do
    {:keep_state, data, [{:reply, from, {state, data}}]}
  end

  def handle_event(:cast, :reset, _any_state, _data) do
    {:next_state, :disconnected, %{history: []}}
  end
end
```

## State-Enter Callbacks

State-enter callbacks execute automatically when a state is entered, regardless of which transition led to it. This eliminates duplicated initialization logic and ensures consistent setup regardless of the entry path:

```elixir
defmodule PrismaticPerimeter.ProtocolFSM do
  @moduledoc """
  Protocol state machine demonstrating state-enter callbacks
  for automatic initialization and cleanup on state transitions.
  """

  @behaviour :gen_statem

  @impl :gen_statem
  def callback_mode, do: [:state_functions, :state_enter]

  def idle(:enter, _old_state, data) do
    actions = [{:state_timeout, 30_000, :session_timeout}]
    {:keep_state, %{data | active_since: nil}, actions}
  end

  def idle(:cast, {:request, payload}, data) do
    {:next_state, :processing, %{data | payload: payload}}
  end

  def idle(:state_timeout, :session_timeout, data) do
    {:next_state, :terminated, data}
  end

  def processing(:enter, _old_state, data) do
    actions = [{:state_timeout, 5_000, :processing_timeout}]
    {:keep_state, %{data | active_since: DateTime.utc_now()}, actions}
  end

  def processing(:cast, {:result, result}, data) do
    {:next_state, :idle, %{data | last_result: result}}
  end

  def processing(:state_timeout, :processing_timeout, data) do
    {:next_state, :error, %{data | last_error: :timeout}}
  end

  def error(:enter, _old_state, data) do
    :telemetry.execute([:protocol, :fsm, :error], %{count: 1}, %{error: data.last_error})
    {:keep_state, data}
  end
end
```

## Timeout Types

GenStatem provides three distinct timeout mechanisms, each serving different purposes:

| Timeout Type | Scope | Cancelled By | Use Case |
|-------------|-------|-------------|----------|
| **Event timeout** | Any event cancels | Any incoming event | Inactivity detection |
| **State timeout** | State change cancels | Entering a different state | Per-state deadlines |
| **Generic timeout** | Explicit cancel only | `{:timeout, name}` action | Named timers, retries |

```elixir
# Event timeout: resets on any event
{:keep_state, data, [{:timeout, 5_000, :inactivity}]}

# State timeout: cancelled by state change
{:keep_state, data, [{:state_timeout, 10_000, :deadline}]}

# Generic timeout: persists across events and states
{:keep_state, data, [{{:timeout, :retry}, 3_000, :retry_attempt}]}
```

The interaction between timeout types is carefully designed. Event timeouts are the most sensitive -- any incoming event resets them, making them suitable for detecting inactivity. State timeouts persist across events within the same state but cancel on state changes, making them suitable for per-state deadlines. Generic timeouts are the most persistent -- they survive both events and state changes, requiring explicit cancellation, making them suitable for scheduled operations that should occur regardless of state transitions.

## Transition Actions

State transitions can include actions that execute atomically with the transition:

| Action | Purpose |
|--------|---------|
| `{:reply, from, reply}` | Reply to a `call` caller |
| `{:state_timeout, ms, event}` | Set state-scoped timeout |
| `{:timeout, ms, event}` | Set event timeout |
| `{{:timeout, name}, ms, event}` | Set named generic timeout |
| `:postpone` | Re-queue current event for the new state |
| `{:next_event, type, event}` | Generate an internal event |
| `:hibernate` | Hibernate process to reduce memory |

```elixir
# Multiple actions in a single transition
{:next_state, :new_state, new_data, [
  {:reply, from, :ok},
  {:state_timeout, 5_000, :deadline},
  {:next_event, :internal, :initialize}
]}
```

## EASM Scanner State Machine

The Prismatic Perimeter's EASM scanner demonstrates GenStatem in a production context -- modeling the multi-phase asset discovery lifecycle:

```elixir
defmodule PrismaticPerimeter.Scanner.FSM do
  @moduledoc """
  State machine for EASM asset scanning lifecycle.
  Models the multi-phase discovery process with explicit
  state transitions, per-phase timeouts, and telemetry.
  """

  @behaviour :gen_statem

  defstruct [:domain, :findings, :phase, :started_at, errors: []]

  @type t :: %__MODULE__{
    domain: String.t() | nil,
    findings: [map()],
    phase: atom() | nil,
    started_at: DateTime.t() | nil,
    errors: [{atom(), term()}]
  }

  @impl :gen_statem
  def callback_mode, do: [:state_functions, :state_enter]

  @spec start_link(String.t()) :: {:ok, pid()} | {:error, term()}
  def start_link(domain) do
    :gen_statem.start_link(__MODULE__, domain, [])
  end

  @impl :gen_statem
  def init(domain) do
    data = %__MODULE__{domain: domain, findings: [], started_at: DateTime.utc_now()}
    {:ok, :initializing, data}
  end

  def initializing(:enter, _old, data) do
    actions = [{:state_timeout, 30_000, :init_timeout}]
    {:keep_state, data, actions}
  end

  def initializing(:cast, :start, data) do
    {:next_state, :dns_enumeration, data}
  end

  def initializing(:state_timeout, :init_timeout, data) do
    {:next_state, :complete, %{data | errors: [{:init, :timeout} | data.errors]}}
  end

  def dns_enumeration(:enter, _old, data) do
    actions = [
      {:state_timeout, 60_000, :dns_timeout},
      {:next_event, :internal, :run_dns}
    ]
    {:keep_state, %{data | phase: :dns}, actions}
  end

  def dns_enumeration(:internal, :run_dns, data) do
    case PrismaticPerimeter.DNS.enumerate(data.domain) do
      {:ok, records} ->
        {:next_state, :certificate_scan, %{data | findings: data.findings ++ records}}

      {:error, reason} ->
        {:next_state, :certificate_scan, %{data | errors: [{:dns, reason} | data.errors]}}
    end
  end

  def dns_enumeration(:state_timeout, :dns_timeout, data) do
    {:next_state, :certificate_scan, %{data | errors: [{:dns, :timeout} | data.errors]}}
  end

  def certificate_scan(:enter, _old, data) do
    actions = [
      {:state_timeout, 60_000, :cert_timeout},
      {:next_event, :internal, :run_cert_scan}
    ]
    {:keep_state, %{data | phase: :cert}, actions}
  end

  def certificate_scan(:internal, :run_cert_scan, data) do
    case PrismaticPerimeter.CertTransparency.scan(data.domain) do
      {:ok, certs} ->
        {:next_state, :service_fingerprint, %{data | findings: data.findings ++ certs}}

      {:error, reason} ->
        {:next_state, :service_fingerprint, %{data | errors: [{:cert, reason} | data.errors]}}
    end
  end

  def certificate_scan(:state_timeout, :cert_timeout, data) do
    {:next_state, :service_fingerprint, %{data | errors: [{:cert, :timeout} | data.errors]}}
  end

  def service_fingerprint(:enter, _old, data) do
    actions = [
      {:state_timeout, 120_000, :fingerprint_timeout},
      {:next_event, :internal, :run_fingerprint}
    ]
    {:keep_state, %{data | phase: :fingerprint}, actions}
  end

  def service_fingerprint(:internal, :run_fingerprint, data) do
    case PrismaticPerimeter.ServiceScanner.fingerprint(data.findings) do
      {:ok, enriched} ->
        {:next_state, :complete, %{data | findings: enriched}}

      {:error, reason} ->
        {:next_state, :complete, %{data | errors: [{:fingerprint, reason} | data.errors]}}
    end
  end

  def service_fingerprint(:state_timeout, :fingerprint_timeout, data) do
    {:next_state, :complete, %{data | errors: [{:fingerprint, :timeout} | data.errors]}}
  end

  def complete(:enter, _old, data) do
    duration = DateTime.diff(DateTime.utc_now(), data.started_at, :second)

    :telemetry.execute([:perimeter, :scan, :complete], %{
      duration_seconds: duration,
      finding_count: length(data.findings),
      error_count: length(data.errors)
    }, %{domain: data.domain})

    {:keep_state, %{data | phase: :complete}}
  end
end
```

## State Machine Visualization

A well-designed GenStatem should have a clear state transition diagram. The EASM scanner's state diagram:

```
                     start
    +-------------+ --------> +------------------+
    | INITIALIZING |           | DNS_ENUMERATION  |
    |              | <-------- |                  |
    +------+------+  timeout  +--------+---------+
           |                            |
           | timeout                    | done/error
           |                            v
           |                   +------------------+
           +-----------------> | CERTIFICATE_SCAN |
                               |                  |
                               +--------+---------+
                                        |
                                        | done/error
                                        v
                               +------------------+
                               | SERVICE_         |
                               | FINGERPRINT      |
                               +--------+---------+
                                        |
                                        | done/error
                                        v
                               +------------------+
                               |    COMPLETE      |
                               |                  |
                               +------------------+
```

## Usage in Prismatic Platform

### Application Areas

| Component | State Machine Purpose | States |
|-----------|----------------------|--------|
| **EASM Scanner** | Asset discovery lifecycle | initializing, dns_enum, cert_scan, fingerprint, complete |
| **Compliance Assessment** | Multi-phase compliance evaluation | setup, collecting, analyzing, reporting, complete |
| **Agent Lifecycle** | Agent startup, operation, shutdown | initializing, ready, active, pausing, stopped |
| **Connection Pool** | Database connection management | disconnected, connecting, connected, draining |
| **Circuit Breaker** | External service fault tolerance | closed, open, half_open |

### OTP-First Decision Criteria

The platform's OTP-first mandate favors GenStatem over ad hoc state tracking in GenServer whenever a process has well-defined states and transitions:

| Criteria | Use GenServer | Use GenStatem |
|----------|--------------|---------------|
| Number of distinct states | 1-2 | 3+ |
| State-dependent behavior | Minimal | Significant |
| State transition validation | Not critical | Critical |
| Timeout per state | Not needed | Needed |
| Auditability requirement | Low | High |
| Protocol modeling | No | Yes |

## GenStatem vs GenServer Comparison

| Feature | GenServer | GenStatem |
|---------|-----------|-----------|
| **State model** | Single state map | Named states + state data |
| **Callbacks** | handle_call/3, handle_cast/2, handle_info/2 | Per-state functions or handle_event/4 |
| **Transitions** | Implicit (modify state map) | Explicit (`:next_state` tuples) |
| **State-enter** | Not available | Built-in (`state_enter` callback mode) |
| **Timeouts** | Single (via handle_info) | Three types: event, state, generic |
| **Postpone** | Not available | Built-in (`:postpone` action) |
| **Type safety** | State values unconstrained | States verified by compiler |
| **Complexity** | Lower | Higher |

## Best Practices

1. **Use `:state_functions` mode for clarity.** When states are well-defined and finite, separate functions per state produce the most readable and maintainable code. Each function handles exactly the events valid in that state, and unhandled events produce clear function clause errors.

2. **Leverage state-enter callbacks for initialization and cleanup.** State-enter callbacks eliminate duplicated setup code that would otherwise appear in every transition leading to a state.

3. **Define state transition diagrams before coding.** Drawing the state diagram forces explicit thinking about all valid transitions and helps identify missing error handling paths.

4. **Use state timeouts for deadlines.** State timeouts automatically cancel when leaving the state, preventing stale timeout events from arriving in the wrong state.

5. **Log all state transitions.** State machine debugging requires understanding the sequence of transitions. Emit telemetry events on every transition for [observability](/glossary/observability/).

6. **Handle all events in all states.** An unhandled event causes the process to crash. For events that should be ignored in certain states, add explicit handlers returning `{:keep_state_and_data, []}`.

## Common Pitfalls

**Forgetting to handle all events in all states.** An unhandled event in a state causes the process to crash. For events that should be ignored in certain states, add explicit handlers that return `{:keep_state_and_data, []}`.

**Complex state data masking state machine logic.** If the state machine's complexity comes from data processing rather than state transitions, GenStatem adds unnecessary ceremony. Use GenServer for data-processing-heavy workflows and GenStatem for protocol-heavy workflows.

**Missing postpone for out-of-order events.** When events arrive in a state that cannot handle them yet, use `:postpone` to re-queue them for the next state rather than dropping them or implementing complex buffering.

**Using GenStatem when GenServer suffices.** GenStatem adds complexity over GenServer. If a process has two states (running/stopped) with no complex transitions, GenServer with a boolean flag is simpler and sufficient.

**Infinite state timeout chains.** Setting a state timeout that transitions to a state with another timeout can create infinite loops. Ensure timeout chains have a terminal state.

## Related Concepts

- [GenServer](/glossary/genserver/) -- Simpler stateful process behaviour for non-FSM use cases
- [OTP](/glossary/otp/) -- Framework providing GenStatem and other standard behaviours
- [Behaviour](/glossary/behaviour/) -- Callback mechanism that GenStatem implements
- [Supervision Tree](/glossary/supervision-tree/) -- Process monitoring ensuring state machine fault tolerance
- [BEAM](/glossary/beam/) -- Virtual machine executing GenStatem processes
- [Prismatic Perimeter](/glossary/prismatic-perimeter/) -- EASM scanning using GenStatem for multi-phase workflows
- [Dialyzer](/glossary/dialyzer/) -- Type analysis verifying state machine callback contracts
- [Circuit Breaker](/glossary/circuit-breaker/) -- Fault tolerance pattern naturally modeled as a state machine
- [Agent](/glossary/agent/) -- Platform agents using GenStatem for lifecycle management
- [Observability](/glossary/observability/) -- Telemetry integration for state transition monitoring

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- Applications using GenStatem for protocol modeling

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
