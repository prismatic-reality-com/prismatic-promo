+++
title = "elixir-otp-debugger"
weight = 147
[extra]
domain = "debugging"
level = "L3"
description = "Specialized OTP and BEAM debugging agent for process inspection, message tracing, and fault diagnosis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "whitepaper"
glossary_terms = ["otp", "beam", "genserver", "supervision-tree", "ecto", "phoenix", "liveview", "aiad", "ets", "hot-code-reload"]
domain_normalized = "development"
content_version = "2.1.0"
last_enhanced = "2026-02-16"
word_count = 1950
quality_score = 92
keywords = ["otp-debugging", "beam-diagnostics", "process-inspection", "message-tracing", "fault-diagnosis", "scheduler-analysis", "memory-leak-detection"]
tags = ["prismatic", "agent", "debugging", "otp", "beam", "elixir"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "elixir-otp-debugger - Prismatic Platform"
+++

## Overview

The [Elixir](/glossary/elixir/)-[OTP](/glossary/otp/) Debugger operates as an L3 strategic command agent within the Debugging domain of the Prismatic Platform. This agent specializes in diagnosing issues that are unique to [BEAM](/glossary/beam/)-based distributed systems: process crashes within [supervision tree](/glossary/supervision-tree/)s, message queue backlogs, [GenServer](/glossary/genserver/) timeout cascades, [ETS](/glossary/ets/) table corruption, scheduler imbalances, and memory leaks in long-running processes. Standard debugging approaches designed for sequential, single-threaded programs are inadequate for OTP systems where hundreds of concurrent processes interact through asynchronous message passing -- the Elixir OTP Debugger brings BEAM-specific diagnostic techniques to every debugging engagement.

This agent is part of the platform's 430-strong autonomous agent ecosystem, built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. It operates under the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine: NO DOUBTS demands that every diagnosis is confirmed through evidence before a fix is applied (no speculative changes), and NO MERCY demands that every fix includes a regression test that would have caught the original issue.

Debugging in the Prismatic Platform -- with its 90 [umbrella application](/glossary/umbrella-application/)s, 430+ autonomous agents, and millions of inter-process messages per minute -- requires understanding of both the application logic and the BEAM runtime's behavior. A slowdown might be caused by application-level inefficiency, or it might be caused by a scheduler thread being monopolized by a reduction-heavy process. The Elixir OTP Debugger distinguishes between these categories and applies appropriate diagnostic techniques for each, leveraging [telemetry](/glossary/telemetry/) integration and the [NABLA Infinity](/glossary/nabla-infinity/) epistemic framework for evidence-based diagnosis.

## Architecture

The OTP Debugger implements a diagnostic server that coordinates multi-level BEAM inspection, maintaining diagnostic state and correlating findings across process, supervision, scheduler, and memory layers.

```elixir
defmodule Prismatic.Debugger.OTPDiagnostic do
  @moduledoc """
  Diagnostic GenServer for BEAM-level process inspection,
  message tracing, and fault correlation.
  """
  use GenServer

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec diagnose_process(pid()) :: {:ok, map()} | {:error, term()}
  def diagnose_process(pid) do
    GenServer.call(__MODULE__, {:diagnose, pid})
  end

  @impl true
  def init(_opts) do
    {:ok, %{active_traces: %{}, findings: [], correlation_buffer: []}}
  end

  @impl true
  def handle_call({:diagnose, pid}, _from, state) do
    diagnosis = %{
      process_info: Process.info(pid, [:message_queue_len, :heap_size, :status, :links]),
      state: safe_get_state(pid),
      supervisor: find_supervisor(pid),
      scheduler: :erlang.process_info(pid, :scheduler_id)
    }
    :telemetry.execute([:prismatic, :debugger, :diagnosis], %{pid: pid}, diagnosis)
    {:reply, {:ok, diagnosis}, %{state | findings: [diagnosis | state.findings]}}
  end

  defp safe_get_state(pid) do
    try do
      {:ok, :sys.get_state(pid, 5_000)}
    catch
      :exit, _ -> {:error, :process_unavailable}
    end
  end

  defp find_supervisor(pid) do
    case Process.info(pid, :dictionary) do
      {:dictionary, dict} -> Keyword.get(dict, :"$ancestors", [])
      _ -> []
    end
  end
end
```

## Key Capabilities

- **Process state inspection** -- Examines individual process internals including current state, message queue contents, stack traces, and linked/monitored processes using :sys.get_state/1, Process.info/2, and :erlang.process_info/2 for low-level runtime statistics.

- **Message tracing** -- Tracks message flow between processes to identify communication bottlenecks, lost messages, and protocol violations using :dbg and custom tracing middleware without significantly impacting system performance.

- **Supervision tree diagnosis** -- Analyzes supervision tree health by examining restart histories, crash frequencies, and failure propagation patterns to identify supervisors hitting maximum restart intensity or cascading restarts across unrelated processes.

- **Scheduler analysis** -- Evaluates BEAM scheduler utilization through :scheduler.utilization/1 to identify load imbalances, reduction-heavy processes, and scheduler contention causing parallelism bottlenecks.

- **Memory leak detection** -- Identifies processes and data structures that grow unboundedly over time, detecting growing process heaps, ETS table bloat, binary reference leaks, and atom table growth from dynamic atom creation.

- **[Hot code reload](/glossary/hot-code-reload/) debugging** -- Diagnoses issues arising during code upgrades including state migration failures in code_change/3 callbacks, processes running old code after reload, and module purging conflicts.

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - The Elixir OTP Debugger operates at the strategic command level with authority to instrument production processes for diagnostic purposes, mandate fixes for identified BEAM-level issues, and coordinate with architecture agents on systemic problems that require structural remediation.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/otp-debug diagnose <pid>` | Run comprehensive diagnosis on target process | L3 |
| `/otp-debug trace <pattern>` | Enable message tracing with pattern filter | L3 |
| `/otp-debug supervision <tree>` | Analyze supervision tree health and restart patterns | L3 |
| `/otp-debug scheduler` | Report scheduler utilization and imbalance metrics | L3 |
| `/otp-debug memory` | Analyze BEAM memory usage by category | L3 |
| `/otp-debug leaks` | Detect potential memory leaks in long-running processes | L3 |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [elixir-architect](/agents/elixir-architect/) | Architectural review that prevents many bugs the debugger would otherwise need to diagnose |
| [fix-specialist](/agents/fix-specialist/) | Implements fixes for diagnosed issues with full verification and regression testing |
| [code-review-specialist-agent-v20](/agents/code-review-specialist-agent-v20/) | Code review that catches potential BEAM-level issues before deployment |
| [elixir-core-specialist](/agents/elixir-core-specialist/) | OTP implementation guidance for complex debugging scenarios |

## Enforcement

The Elixir OTP Debugger operates under [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Every diagnosis must be confirmed through evidence from multiple diagnostic sources -- no speculative fixes are permitted. Every fix must include a regression test that reproduces the original failure mode. Debugging artifacts (trace configurations, diagnostic processes, temporary instrumentation) must be completely removed after diagnosis is complete. The [Trinity Gate](/glossary/trinity-gate/) validation ensures structural consistency of diagnostic conclusions, and the [NABLA Infinity](/glossary/nabla-infinity/) Signal Plurality axiom requires multiple evidence sources before confirming any root cause. No debugging code reaches production through accidental commit.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)