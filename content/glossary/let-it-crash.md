+++
title = "Let It Crash"
weight = 16
[extra]
category = "architecture"
description = "OTP philosophy where processes are allowed to fail and supervisors handle recovery"
related_terms = ["fault-tolerance", "supervisor", "process-isolation", "otp", "beam", "self-healing", "circuit-breaker", "dynamic-supervisor", "agent", "genserver"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1525
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Let", "Crash", "philosophy", "processes", "allowed", "supervisors", "handle", "recovery", "glossary", "architecture"]
tags = ["glossary", "architecture", "let-it-crash", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Let It Crash - Prismatic Platform"
+++

## Definition

"Let it crash" is the core design philosophy of the OTP framework and the defining characteristic of fault-tolerant Erlang/Elixir systems. The principle states that processes should be allowed -- and expected -- to fail when they encounter unexpected conditions, rather than defensively handling every possible error inline. Failed processes are restarted by their [supervisors](/glossary/supervisor/) with clean initial state, eliminating corrupted state and simplifying error handling. Recovery logic is centralized in the supervision hierarchy rather than scattered throughout business logic.

This approach is counterintuitive to developers trained in defensive programming traditions where unhandled exceptions represent bugs. In OTP systems, the opposite is true: a process crash is not a bug but a recovery mechanism. The "bug" would be silently swallowing an error and continuing with corrupted state, which in traditional systems produces subtle, hard-to-diagnose failures that can persist for hours or days before manifesting.

The philosophy produces systems that are paradoxically more reliable because they fail more often. Each individual failure is small (one process), fast (milliseconds to detect and restart), and clean (fresh state replaces corrupted state). The alternative -- attempting to prevent all failures through defensive code -- produces systems where failures are rare but catastrophic: large (entire system), slow (difficult to diagnose), and dirty (corrupted state persists).

## Joe Armstrong's Original Concept

Joe Armstrong, the creator of Erlang, developed the let-it-crash philosophy while working on telephone switching systems at Ericsson in the late 1980s. Telephone switches are among the most demanding real-time systems: they must handle millions of concurrent calls with less than 2 hours of downtime per year (99.97% uptime). A single call failure is acceptable; a system-wide outage is not.

Armstrong's key insight was that attempting to handle every possible error within the call-processing code made the code more complex and more fragile, not more reliable. Error handling code itself could contain bugs. Exception handlers could catch errors they were not designed for, masking the real problem. Defensive checks could become outdated as the system evolved, creating false confidence.

The solution was to separate the **error-prone work** (processing a telephone call) from the **recovery logic** (what to do when processing fails). Workers handle the happy path. Supervisors handle everything else. Armstrong described this as:

> "The key idea is that we have two processes: one to do the work, and one to fix things if the work process crashes. If the worker process crashes, it's restarted automatically by the supervisor. If the supervisor can't fix the problem, it escalates to its own supervisor."

This separation produces two classes of code:

1. **Worker code**: Focused, simple, handles only expected cases. Free from defensive clutter. Easy to read, test, and verify.
2. **Supervisor code**: Generic, reusable, handles failure patterns rather than specific errors. Configured through child specifications rather than custom code.

## Why Defensive Programming is Harmful

Defensive programming -- the practice of anticipating and guarding against every possible error condition -- is considered a best practice in most programming traditions. In OTP systems, excessive defensive programming is an anti-pattern that actively undermines reliability. Understanding why requires examining the failure modes of defensive code.

### The False Safety of catch-all Handlers

```elixir
# ANTI-PATTERN: Defensive programming that masks problems
defmodule BadScanner do
  def scan(target) do
    try do
      result = ExternalAPI.query(target)
      process_result(result)
    rescue
      _error ->
        # What error? From which call? Is the API down?
        # Is the input malformed? Is our processing buggy?
        # We will never know.
        {:ok, []}  # Return empty results, pretend nothing happened
    end
  end
end

# OTP PATTERN: Let unexpected errors surface through crashes
defmodule GoodScanner do
  use GenServer

  def handle_call({:scan, target}, _from, state) do
    case ExternalAPI.query(target) do
      {:ok, result} ->
        {:reply, {:ok, process_result(result)}, state}
      {:error, :rate_limited} ->
        # Expected error: handle explicitly
        {:reply, {:error, :retry_later}, state}
      {:error, :not_found} ->
        # Expected error: handle explicitly
        {:reply, {:ok, []}, state}
      # Unexpected errors (network failure, API change, parsing error)?
      # Process crashes. Supervisor restarts. Error is logged.
      # The problem is VISIBLE and DIAGNOSABLE.
    end
  end
end
```

The defensive version (`BadScanner`) appears safer but is actually dangerous. It catches and silently discards errors, returning empty results that downstream consumers treat as legitimate data. The system continues operating on false information. The error is invisible to operators. Diagnosis requires manual investigation of why results are unexpectedly empty -- a symptom far removed from the root cause.

The OTP version (`GoodScanner`) handles expected errors explicitly and allows unexpected errors to crash the process. The crash is immediate, visible, and logged. The supervisor restarts the process. The error appears in logs with a full stack trace. The problem is diagnosable within seconds rather than hours.

### The Code Complexity Tax

Defensive programming imposes a code complexity tax that compounds with system size. Every function that might fail requires error handling code. Every error handler might itself fail, requiring meta-error handling. Every null check, type guard, and boundary validation adds lines of code that must be read, tested, and maintained.

In a platform with 90+ umbrella applications and thousands of modules, the defensive approach would multiply code volume by 2-3x with error handling alone. The let-it-crash approach keeps business logic clean and delegates recovery to the supervision tree, which is defined once and applies uniformly across the entire platform.

### The Corrupted State Problem

The most insidious failure mode of defensive programming is **state corruption through partial recovery**. When a function catches an error mid-operation, the process's state may be partially modified. The catch handler cannot reliably determine what was changed and what was not. The process continues operating with corrupted state, producing incorrect results that propagate through the system.

In the let-it-crash approach, a process crash discards all in-flight state. The supervisor starts a new process with known-good initial state. There is no partially-modified state to reason about. The fresh start guarantees consistency.

## Supervisor Recovery in Practice

The let-it-crash philosophy works because supervisors provide automatic, structured recovery. When a process crashes:

1. **Detection**: The supervisor receives an exit signal from the linked child process (typically within microseconds)
2. **Logging**: The crash reason, process state, and stack trace are recorded via Logger
3. **Strategy Application**: The supervisor's restart strategy determines which processes to restart
4. **Restart**: New processes are started with their initial state from the child specification
5. **Intensity Check**: If restarts exceed `max_restarts` within `max_seconds`, the supervisor itself crashes, escalating to its parent

```elixir
defmodule PrismaticAgents.WorkerSupervisor do
  use Supervisor

  @impl Supervisor
  def init(_opts) do
    children = [
      # Workers designed to crash on unexpected input
      # Supervisor restarts them with clean state
      {PrismaticAgents.OSINTWorker, restart: :permanent},
      {PrismaticAgents.AnalysisWorker, restart: :permanent},
      {PrismaticAgents.ReportWorker, restart: :transient}
    ]

    # 5 crashes in 30 seconds before escalation
    Supervisor.init(children,
      strategy: :one_for_one,
      max_restarts: 5,
      max_seconds: 30
    )
  end
end
```

The `restart` option in child specifications provides fine-grained control:

| Restart Type | Behavior | Use Case |
|-------------|----------|----------|
| `:permanent` | Always restart, regardless of crash reason | Long-running services (GenServers) |
| `:transient` | Restart only on abnormal termination | Tasks that may complete normally |
| `:temporary` | Never restart | One-shot operations |

## Process Isolation Enabling Crashes

The let-it-crash philosophy is only viable because the [BEAM](/glossary/beam/) VM provides strong [process isolation](/glossary/process-isolation/). In a language with shared memory (Java, Python, C++), allowing a component to crash risks corrupting shared state. In the BEAM, a crashed process takes only its own heap with it. No other process is affected.

This isolation extends to:

- **Memory**: Each process has a private heap. No process can read or write another's memory.
- **Execution**: Each process has an independent execution context. A crash in one does not interrupt another.
- **Garbage Collection**: Each process has its own garbage collector. A GC pause in one process does not affect others.
- **Scheduling**: The BEAM's preemptive scheduler ensures crashed processes are cleaned up promptly.

Without these guarantees, the let-it-crash philosophy would be reckless. With them, it is the most pragmatic approach to building reliable systems.

## Practical Examples in Prismatic

The Prismatic Platform applies let-it-crash throughout its 90+ umbrella applications:

**Agent Execution**: When an [agent](/glossary/agent/) encounters unexpected data during an OSINT scan -- malformed JSON from an external API, an unexpected HTTP status code, a parsing error in HTML content -- the agent process crashes. Its supervisor restarts it with clean state. The scan can be retried automatically. No other agents are affected.

**Storage Operations**: When a database query returns an unexpected result format (perhaps due to a schema migration in progress), the storage process crashes rather than attempting to interpret malformed data. The supervisor restarts the process, which reconnects with a fresh connection and retries.

**Pipeline Processing**: When a data pipeline stage receives input that does not match its expected format, the stage crashes. The pipeline supervisor restarts it. [Backpressure](/glossary/backpressure/) mechanisms in [GenStage](/glossary/genstage/) ensure that the crash does not cause data loss -- unprocessed events remain in the upstream buffer and are re-delivered to the restarted process.

**Quality Enforcement**: When a quality gate encounters a file it cannot analyze (corrupted AST, encoding error, excessive nesting), the analysis process crashes. The quality supervisor restarts it and continues with the remaining files. The failed file is logged for manual investigation.

## Relationship to Fault Tolerance and Self-Healing

Let-it-crash, [fault tolerance](/glossary/fault-tolerance/), and [self-healing](/glossary/self-healing/) form a hierarchy of resilience mechanisms in the Prismatic Platform:

| Level | Mechanism | Scope | Response Time | Complexity |
|-------|-----------|-------|---------------|------------|
| **L0** | Let-it-crash | Single process | Microseconds | None (automatic) |
| **L1** | Supervisor restart | Process tree branch | Milliseconds | Minimal (configured) |
| **L2** | [Circuit breaker](/glossary/circuit-breaker/) | External boundary | Seconds | Low (state machine) |
| **L3** | Self-healing | Application | Seconds-minutes | Medium (diagnostic) |
| **L4** | Platform healing | Cross-application | Minutes | High (coordinated) |

Let-it-crash is the foundation -- the fastest, simplest, and most reliable form of fault recovery. When a simple restart suffices, no higher-level mechanism is needed. Higher levels activate only when simpler recovery fails, creating an efficient escalation path from millisecond process restarts to minute-scale platform healing.

## Related Terms

- [Fault Tolerance](/glossary/fault-tolerance/) -- System property enabled by the let-it-crash philosophy
- [Supervisor](/glossary/supervisor/) -- OTP behavior implementing crash recovery strategies
- [Process Isolation](/glossary/process-isolation/) -- Memory isolation that makes safe crashing possible
- [OTP](/glossary/otp/) -- Framework providing supervision infrastructure
- [BEAM](/glossary/beam/) -- Virtual machine guaranteeing process isolation
- [Self-Healing](/glossary/self-healing/) -- Platform-level recovery extending beyond simple restarts
- [Circuit Breaker](/glossary/circuit-breaker/) -- Pattern handling slow failures that do not cause crashes
- [Dynamic Supervisor](/glossary/dynamic-supervisor/) -- Runtime process management with crash recovery
- [Agent](/glossary/agent/) -- Autonomous entities designed to crash and restart cleanly
- [Backpressure](/glossary/backpressure/) -- Flow control preventing data loss during process restarts
- [GenServer](/glossary/genserver/) -- Common process type designed for supervised crash recovery
- [Immutability](/glossary/immutability/) -- Data property ensuring crash restarts begin with clean state

## See Also

- [Architecture](/architecture/) -- Platform resilience design
- [Technologies](/technologies/) -- Elixir/OTP implementation details
- [Capabilities](/capabilities/) -- Platform fault tolerance capabilities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)