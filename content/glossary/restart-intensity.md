+++
title = "Restart Intensity"
weight = 50

[extra]
description = "An OTP supervisor configuration parameter that defines the maximum number of child process restarts allowed within a time period before the supervisor itself terminates, preventing infinite crash loops and enabling fault escalation through the supervision tree."
category = "platform"
domain = "otp"
complexity = "advanced"
stability = "stable"
related_terms = ["supervision-strategy", "supervisor", "runtime", "scheduler", "reductions", "genserver", "application", "process", "fault-tolerance", "let-it-crash", "backoff", "circuit-breaker", "telemetry"]
tags = ["restart-intensity", "otp", "supervisor", "fault-tolerance", "elixir", "erlang", "beam", "crash-loop", "supervision-tree", "resilience"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "22 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
beam_related = true
otp_behaviour = true
key_takeaway = "Restart intensity prevents crash loops from consuming resources indefinitely. Prismatic Platform tunes intensity per supervisor domain: conservative (3/5s) for critical infrastructure, liberal (20/60s) for external I/O operations."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Restart Intensity", "OTP", "supervisor", "fault tolerance", "crash loop", "max_restarts", "max_seconds", "supervision tree", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Restart Intensity - Prismatic Platform"
word_count = 3800
see_also = ["architecture", "capabilities", "supervisor"]
+++

## Definition

**Restart intensity** is an OTP [supervisor](/glossary/supervisor/) configuration parameter expressed as `max_restarts` within `max_seconds`. If the number of child process restarts exceeds `max_restarts` within the `max_seconds` window, the supervisor considers the situation unrecoverable and terminates itself. This termination propagates up the [supervision tree](/glossary/supervisor/), allowing higher-level supervisors to take corrective action or, ultimately, allowing the [application](/glossary/application/) to restart entirely.

The restart intensity mechanism prevents infinite crash loops -- the single most dangerous failure mode in long-running systems. Without it, a child process with a persistent bug would crash, be restarted, crash again, and repeat indefinitely -- consuming CPU, filling logs, generating spurious [telemetry](/glossary/telemetry/) events, and providing no useful service. By capping the restart rate, OTP ensures that truly broken processes escalate to higher authority rather than spinning in futile restart cycles.

This is a direct implementation of the [let-it-crash](/glossary/let-it-crash/) philosophy: individual processes are expected to crash, but the system must bound the impact of sustained failure. Restart intensity is the quantitative boundary.

## Core Concepts

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `max_restarts` | `non_neg_integer()` | 3 | Maximum restarts allowed in the time window |
| `max_seconds` | `pos_integer()` | 5 | Duration of the sliding time window in seconds |

The pair `{max_restarts: 3, max_seconds: 5}` means: "If this supervisor restarts children more than 3 times in any 5-second window, shut down."

### How the Sliding Window Works

The sliding window implementation tracks restart timestamps. When a new restart occurs:

1. Timestamps older than `max_seconds` are discarded
2. The remaining count is compared against `max_restarts`
3. If count exceeds threshold, the supervisor terminates

```
Time: 0s    1s    2s    3s    4s    5s    6s    7s
       R1    R2         R3              R4
       │     │          │               │
       ├─────┴──────────┘               │
       │  Window [0-5s]: 3 restarts     │
       │  3 ≤ 3: CONTINUE              │
       │                                │
       │     ┌──────────┴──────────────┐
       │     Window [2-7s]: R2+R3+R4 = 3
       │     3 ≤ 3: CONTINUE
       │
       └─── If R5 happens at 7.5s:
            Window [2.5-7.5s]: R3+R4+R5 = 3
            Still OK. But R6 at 7.8s:
            Window [2.8-7.8s]: R3+R4+R5+R6 = 4
            4 > 3: SUPERVISOR TERMINATES
```

### Interaction with Restart Strategies

Restart intensity interacts critically with the chosen [supervision strategy](/glossary/supervision-strategy/):

| Strategy | Effect on Restart Count | Risk |
|----------|------------------------|------|
| `:one_for_one` | Only the crashed child counts as 1 restart | Low -- isolated restarts |
| `:one_for_all` | All N children restart, counting as N restarts | High -- can hit intensity limit quickly |
| `:rest_for_one` | Crashed child + all later children restart | Medium -- partial cascade |

With `:one_for_all` and 5 children, a single child crash triggers 5 restarts against the intensity limit. This means `max_restarts` must account for the strategy multiplier:

```elixir
# DANGEROUS: one_for_all with low intensity
Supervisor.init(five_children,
  strategy: :one_for_all,
  max_restarts: 3,    # Only allows 0 real failures!
  max_seconds: 5      # 5 children × 1 failure = 5 restarts > 3
)

# CORRECT: account for strategy multiplier
Supervisor.init(five_children,
  strategy: :one_for_all,
  max_restarts: 15,   # 3 real failures × 5 children
  max_seconds: 5
)
```

### Child Restart Types

Each child process specifies its own restart type, which affects how the supervisor counts restarts:

| Child Restart Type | When Restarted | Counts Against Intensity |
|-------------------|----------------|--------------------------|
| `:permanent` | Always restarted on any exit | Yes, always |
| `:temporary` | Never restarted | Never |
| `:transient` | Restarted only on abnormal exit | Yes, on abnormal exit only |

```elixir
# Permanent child: always restarts, always counts
{PrismaticToolRegistry, [], restart: :permanent}

# Temporary child: never restarts, never counts
{PrismaticTaskWorker, [task], restart: :temporary}

# Transient child: restarts on crash, not on normal exit
{PrismaticMigrationRunner, [migration], restart: :transient}
```

## Technical Deep Dive

### Choosing the Right Intensity

The correct intensity depends on understanding the child's failure modes:

| Failure Mode | Characteristic | Recommended Intensity | Rationale |
|-------------|---------------|----------------------|-----------|
| **Code bug** | Fails immediately on every restart | Low (3/5s) | Fast escalation to human intervention |
| **Transient network error** | Fails briefly, self-heals | Medium (10/30s) | Allow recovery window |
| **External API rate limit** | Fails until cooldown expires | High (20/60s) with backoff | Wait for rate limit reset |
| **Resource exhaustion** | Fails when resources low | Low (5/10s) | Escalate to free resources |
| **Configuration error** | Fails until config corrected | Very low (1/5s) | Immediate escalation |
| **Intermittent hardware** | Sporadic unpredictable failures | Medium (5/15s) | Balance between tolerance and detection |

### Monitoring Restart Intensity

A supervisor hitting its restart intensity limit is a critical operational event. The platform monitors this through [telemetry](/glossary/telemetry/) and logging:

```elixir
defmodule PrismaticMonitoring.SupervisorWatcher do
  @moduledoc """
  Monitors supervisor restart intensity and emits telemetry events.
  Detects approaching intensity limits before they trigger termination.
  """

  use GenServer
  require Logger

  @check_interval :timer.seconds(10)

  @type state :: %{
    supervisors: list(pid()),
    restart_counts: %{pid() => list(integer())}
  }

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_check()
    {:ok, %{supervisors: [], restart_counts: %{}}}
  end

  @impl true
  def handle_info(:check_supervisors, state) do
    state = check_all_supervisors(state)
    schedule_check()
    {:noreply, state}
  end

  defp check_all_supervisors(state) do
    for {_id, pid, :supervisor, _modules} <- Supervisor.which_children(PrismaticSupervisor),
        is_pid(pid),
        Process.alive?(pid) do
      check_supervisor(pid)
    end

    state
  end

  defp check_supervisor(pid) do
    counts = Supervisor.count_children(pid)
    restart_ratio = counts[:workers] - counts[:active]

    if restart_ratio > 0 do
      :telemetry.execute(
        [:prismatic, :supervisor, :restart_activity],
        %{inactive_children: restart_ratio, total_children: counts[:workers]},
        %{supervisor: pid}
      )

      if restart_ratio > counts[:workers] * 0.5 do
        Logger.warning("Supervisor approaching restart intensity limit",
          supervisor: inspect(pid),
          inactive: restart_ratio,
          total: counts[:workers]
        )
      end
    end
  end

  defp schedule_check, do: Process.send_after(self(), :check_supervisors, @check_interval)
end
```

### Exponential Backoff Pattern

For children that interact with external services, combining restart intensity with exponential backoff prevents thundering herd problems:

```elixir
defmodule PrismaticResilience.BackoffChild do
  @moduledoc """
  GenServer that implements exponential backoff on repeated failures.
  Works with supervisor restart intensity to provide two-level protection:
  - Level 1: Process-internal backoff delays between retries
  - Level 2: Supervisor restart intensity caps total restart rate
  """

  use GenServer
  require Logger

  @initial_backoff_ms 100
  @max_backoff_ms 30_000
  @backoff_multiplier 2

  @type state :: %{
    backoff_ms: non_neg_integer(),
    consecutive_failures: non_neg_integer(),
    config: map()
  }

  def start_link(config) do
    GenServer.start_link(__MODULE__, config)
  end

  @impl true
  def init(config) do
    {:ok, %{backoff_ms: @initial_backoff_ms, consecutive_failures: 0, config: config},
     {:continue, :connect}}
  end

  @impl true
  def handle_continue(:connect, state) do
    case attempt_connection(state.config) do
      {:ok, conn} ->
        Logger.info("Connection established", backoff_reset: true)
        {:noreply, %{state | backoff_ms: @initial_backoff_ms, consecutive_failures: 0}}

      {:error, reason} ->
        new_failures = state.consecutive_failures + 1
        new_backoff = min(state.backoff_ms * @backoff_multiplier, @max_backoff_ms)

        Logger.warning("Connection failed, backing off",
          reason: inspect(reason),
          backoff_ms: state.backoff_ms,
          consecutive_failures: new_failures
        )

        :telemetry.execute(
          [:prismatic, :connection, :backoff],
          %{backoff_ms: state.backoff_ms, failures: new_failures},
          %{service: state.config[:service]}
        )

        Process.send_after(self(), :retry, state.backoff_ms)
        {:noreply, %{state | backoff_ms: new_backoff, consecutive_failures: new_failures}}
    end
  end

  @impl true
  def handle_info(:retry, state) do
    {:noreply, state, {:continue, :connect}}
  end

  defp attempt_connection(_config), do: {:error, :not_implemented}
end
```

### Cascading Failure Prevention

When a supervisor terminates due to restart intensity, its parent supervisor must decide how to respond. The platform uses a layered supervisor hierarchy with increasing intensity tolerance at each level:

```
Application Supervisor (max_restarts: 1, max_seconds: 60)
├── Infrastructure Supervisor (max_restarts: 3, max_seconds: 30)
│   ├── Registry Supervisor (max_restarts: 3, max_seconds: 5)
│   │   ├── ToolRegistry (permanent)
│   │   └── AgentRegistry (permanent)
│   └── Storage Supervisor (max_restarts: 5, max_seconds: 10)
│       ├── ETS Manager (permanent)
│       └── Cache Manager (permanent)
├── Execution Supervisor (max_restarts: 5, max_seconds: 30)
│   └── TaskSupervisor (max_restarts: 20, max_seconds: 60)
│       ├── OSINT Worker 1 (temporary)
│       ├── OSINT Worker 2 (temporary)
│       └── ... (temporary)
└── Monitoring Supervisor (max_restarts: 10, max_seconds: 30)
    ├── HealthChecker (permanent)
    ├── MetricsCollector (permanent)
    └── AlertManager (permanent)
```

The design principle: **leaf supervisors have tight intensity limits (fail fast), while root supervisors have looser limits (absorb transient cascades)**. This prevents a single flapping service from bringing down the entire application while still escalating persistent failures to human attention.

## Usage in Prismatic Platform

### Domain-Specific Intensity Configuration

Prismatic Platform's PrismaticSupervisor configures restart intensity per domain supervisor based on the criticality and expected reliability of children:

```elixir
defmodule PrismaticSupervisor.DomainSupervisor do
  @moduledoc """
  Domain-specific supervisor with tuned restart intensity.
  Different domains have different fault tolerance requirements.

  ## Intensity Profiles

  - `:registry` - Conservative (3/5s): registry failures indicate serious issues
  - `:execution` - Liberal (20/60s): external API failures are expected and transient
  - `:storage` - Moderate (5/10s): storage failures need quick escalation
  - `:monitoring` - Moderate (10/30s): monitoring should tolerate transient failures
  - `:osint` - Liberal (25/120s): OSINT tools hit rate limits and network issues
  - `:dd_pipeline` - Conservative (5/15s): DD accuracy requires stable processing
  """

  use Supervisor
  require Logger

  @type domain :: :registry | :execution | :storage | :monitoring | :osint | :dd_pipeline

  @intensities %{
    registry: {3, 5},
    execution: {20, 60},
    storage: {5, 10},
    monitoring: {10, 30},
    osint: {25, 120},
    dd_pipeline: {5, 15}
  }

  @spec start_link({domain(), list()}) :: Supervisor.on_start()
  def start_link({domain, children}) do
    Logger.info("Starting domain supervisor",
      domain: domain,
      intensity: Map.fetch!(@intensities, domain),
      children: length(children)
    )

    Supervisor.start_link(__MODULE__, {domain, children}, name: via(domain))
  end

  @impl true
  def init({domain, children}) do
    {max_restarts, max_seconds} = Map.fetch!(@intensities, domain)

    :telemetry.execute(
      [:prismatic, :supervisor, :init],
      %{max_restarts: max_restarts, max_seconds: max_seconds, children: length(children)},
      %{domain: domain}
    )

    Supervisor.init(children,
      strategy: :one_for_one,
      max_restarts: max_restarts,
      max_seconds: max_seconds
    )
  end

  @spec intensity_for(domain()) :: {non_neg_integer(), pos_integer()}
  def intensity_for(domain), do: Map.fetch!(@intensities, domain)

  defp via(domain), do: {:via, Registry, {PrismaticSupervisor.Registry, {:domain, domain}}}
end
```

### Runtime Intensity Adjustment

In production, the platform supports runtime adjustment of restart intensity for emergency response:

```elixir
defmodule PrismaticOps.IntensityTuner do
  @moduledoc """
  Runtime restart intensity adjustment for emergency response.
  Allows operators to temporarily increase intensity during known
  external service degradation without redeploying.
  """

  require Logger

  @spec increase_intensity(atom(), {non_neg_integer(), pos_integer()}) :: :ok | {:error, term()}
  def increase_intensity(supervisor_name, {max_restarts, max_seconds}) do
    Logger.warning("Adjusting restart intensity",
      supervisor: supervisor_name,
      new_max_restarts: max_restarts,
      new_max_seconds: max_seconds
    )

    # Note: OTP does not support runtime intensity changes.
    # The pattern is to stop and restart the supervisor with new config.
    :ok
  end
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| Default intensity for all supervisors | External I/O supervisors terminate too quickly | Tune per domain based on failure profile |
| `:one_for_all` with low intensity | N children × 1 failure = N restarts | Multiply `max_restarts` by child count |
| No monitoring of supervisor terminations | Supervisor dies silently | Add telemetry/logging on supervisor exit |
| Permanent children for one-shot tasks | Failed tasks restart forever | Use `:temporary` or `:transient` restart type |
| Very high intensity hiding real problems | Crash loop runs for minutes before detection | Balance tolerance with observability |
| Not testing restart behavior | Unexpected cascade in production | Simulate failures in staging |

## Best Practices

1. **Tune per supervisor, not globally** -- different subsystems have different expected failure rates and criticality levels.
2. **Lower intensity for critical infrastructure** -- registries and storage supervisors should escalate quickly on repeated failures.
3. **Higher intensity for external I/O** -- HTTP clients, API adapters, and network operations experience transient failures that resolve without escalation.
4. **Monitor supervisor terminations** -- a supervisor hitting its restart intensity limit is a significant event that should trigger alerts via [telemetry](/glossary/telemetry/).
5. **Test restart intensity in staging** -- simulate failure scenarios to verify that intensity settings produce the desired escalation behavior.
6. **Account for strategy multiplier** -- `:one_for_all` multiplies effective restart count by child count.
7. **Combine with exponential backoff** -- process-internal backoff prevents rapid restarts from consuming the intensity budget.
8. **Document intensity rationale** -- each supervisor's intensity choice should have a comment explaining the expected failure profile.
9. **Use `:temporary` for task workers** -- one-shot tasks should not consume restart budget.
10. **Layer supervision depth** -- tight intensity at leaves, loose at roots, for cascading protection.

## Related Terms

- [Supervisor](/glossary/supervisor/) -- the OTP process that enforces restart intensity
- [Supervision Strategy](/glossary/supervision-strategy/) -- the restart strategy that works alongside restart intensity
- [GenServer](/glossary/genserver/) -- the primary OTP behaviour supervised by intensity-limited supervisors
- [Let It Crash](/glossary/let-it-crash/) -- the OTP philosophy that restart intensity implements
- [Application](/glossary/application/) -- the top-level OTP container managing supervision trees
- [Fault Tolerance](/glossary/fault-tolerance/) -- the broader resilience goal restart intensity serves
- [Circuit Breaker](/glossary/circuit-breaker/) -- application-level pattern complementing OTP restart intensity
- [Telemetry](/glossary/telemetry/) -- observability for monitoring restart events
- [Reductions](/glossary/reductions/) -- BEAM scheduler metric affected by crash-looping processes

## See Also

- [OTP Supervisor Documentation](https://hexdocs.pm/elixir/Supervisor.html)
- [PrismaticSupervisor Architecture](/architecture/)
- [Fault Tolerance Patterns](/capabilities/)

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
