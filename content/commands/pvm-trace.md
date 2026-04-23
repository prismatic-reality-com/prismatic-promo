+++
title = "/pvm-trace"
weight = 1820
[extra]
category = "PVM"
description = "Real-time execution tracing and debugging for PVM programs"
syntax = "/pvm-trace [options]"
authority = "L2+"
agent = "pvm-executor"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1074
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["pvm-trace", "Real-time", "commands", "PVM", "Prismatic Platform", "Trace", "Path"]
tags = ["commands", "pvm", "pvm-trace", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/pvm-trace - Prismatic Platform"
+++

## Overview

**/pvm-trace** is a production command in the **PVM** category of the Prismatic Platform that provides real-time execution tracing and debugging capabilities for [PVM](/glossary/pvm/) (Prismatic Virtual Machine) programs. The command attaches to a running PVM program or replays a recorded execution, providing instruction-level visibility into program behavior including register state, stack frames, heap allocations, I/O operations, and control flow decisions.

Tracing is essential for understanding the runtime behavior of compiled PVM programs, particularly when debugging failures, diagnosing performance bottlenecks, or verifying that a program behaves according to its specification. The tracer operates at the bytecode instruction level but maps each instruction back to its source IR line through the debug information embedded by the [/pvm-compile](/commands/pvm-compile/) command, enabling developers to reason about program behavior in terms of the original high-level description.

This command operates under the **L2+** authority level and is executed by the `pvm-executor` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The tracer is designed to have minimal performance impact on the traced program, using asynchronous event collection and buffered output to avoid introducing timing artifacts that would alter program behavior.

The command supports multiple tracing modes: full trace (every instruction), conditional trace (only when predicates match), breakpoint-based (pause at specific locations), and statistical (sampling-based performance profiling). These modes can be combined to focus tracing on specific areas of interest while maintaining manageable output volumes for programs that execute millions of instructions.

## Architecture

The tracing system sits alongside the PVM runtime, observing execution without modifying it.

```
+-------------------+
| PVM.Runtime       |
| (executing)       |
+-------------------+
      |
      | trace events
      v
+-------------------+
| Trace Collector   |
| (async buffer)    |
+-------------------+
      |
      v
+-------------------+     +-------------------+
| Trace Processor   |---->| Source Mapper      |
| (filter/format)   |     | (IR line mapping)  |
+-------------------+     +-------------------+
      |
      v
+-------------------+
| Trace Output      |
| (terminal/file)   |
+-------------------+
```

| Component | Responsibility |
|-----------|----------------|
| **Trace Collector** | Asynchronously collects trace events from the runtime |
| **Trace Processor** | Filters events based on predicates and formats output |
| **Source Mapper** | Maps bytecode offsets to source IR line numbers |
| **Trace Output** | Renders trace data to terminal, file, or structured format |
| **Breakpoint Manager** | Manages breakpoint locations and pause/resume state |
| **Statistics Aggregator** | Collects instruction frequency and timing statistics |

## Usage

### Live Tracing

```bash
# Trace a running PVM program by PID
/pvm-trace --pid <runtime_pid>

# Start a program with tracing enabled
/pvm-trace --program workflow.pvmb --param domain=example.com

# Trace with source IR mapping
/pvm-trace --program workflow.pvmb --source workflow.ir
```

### Breakpoint Debugging

```bash
# Set breakpoint at source line
/pvm-trace --program workflow.pvmb --break-at line:42

# Set breakpoint at bytecode offset
/pvm-trace --program workflow.pvmb --break-at offset:0x0020

# Set conditional breakpoint
/pvm-trace --program workflow.pvmb --break-when "r0 == :error"

# Break on specific instruction type
/pvm-trace --program workflow.pvmb --break-on CALL
```

### Filtered Tracing

```bash
# Trace only I/O operations
/pvm-trace --program workflow.pvmb --filter io

# Trace only control flow (branches, calls, returns)
/pvm-trace --program workflow.pvmb --filter control-flow

# Trace specific register changes
/pvm-trace --program workflow.pvmb --watch r0,r1,r5

# Exclude verbose instructions
/pvm-trace --program workflow.pvmb --exclude "LOAD_CONST,NOP"
```

### Performance Profiling

```bash
# Statistical profiling with 1% sampling
/pvm-trace --program workflow.pvmb --profile --sample-rate 0.01

# Instruction frequency analysis
/pvm-trace --program workflow.pvmb --profile --frequency

# Hot path identification
/pvm-trace --program workflow.pvmb --profile --hot-paths

# Memory allocation tracking
/pvm-trace --program workflow.pvmb --profile --memory
```

### Replay Tracing

```bash
# Trace a recorded replay
/pvm-trace --replay /tmp/replay.log

# Step through replay
/pvm-trace --replay /tmp/replay.log --step

# Replay with search for specific state
/pvm-trace --replay /tmp/replay.log --search "r3 contains :timeout"
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--program` | `string` | `nil` | Path to PVM bytecode to execute with tracing |
| `--pid` | `string` | `nil` | PID of running PVM runtime to attach |
| `--replay` | `string` | `nil` | Path to replay log for offline tracing |
| `--source` | `string` | `nil` | Path to source IR for line mapping |
| `--param` | `key=value` | `[]` | Input parameters when executing with tracing |
| `--break-at` | `string` | `nil` | Breakpoint location (line:N or offset:0xN) |
| `--break-when` | `string` | `nil` | Conditional breakpoint predicate |
| `--break-on` | `string` | `nil` | Break on specific instruction type |
| `--filter` | `string` | `all` | Event filter: all, io, control-flow, memory |
| `--watch` | `string` | `nil` | Comma-separated register names to watch |
| `--exclude` | `string` | `nil` | Instruction types to exclude from trace |
| `--profile` | `boolean` | `false` | Enable statistical profiling mode |
| `--sample-rate` | `float` | `1.0` | Sampling rate for profiling (0.0-1.0) |
| `--output` | `string` | `stdout` | Trace output destination |
| `--format` | `text \| json \| flamegraph` | `text` | Output format |
| `--step` | `boolean` | `false` | Step-by-step execution mode |
| `--verbose` | `boolean` | `false` | Include register dumps at each instruction |

## Execution Flow

1. **Attachment** -- The tracer attaches to the target PVM runtime, either by starting a new program with tracing hooks or by connecting to an existing runtime process via its PID.

2. **Instrumentation** -- Trace hooks are installed in the instruction dispatcher. These hooks fire asynchronously for each executed instruction, pushing events to the trace collector without blocking the main execution loop.

3. **Event Collection** -- The trace collector buffers events in batches, periodically flushing to the trace processor. Buffer size is tuned to balance latency against overhead.

4. **Filtering** -- The trace processor applies the configured filters, discarding events that do not match the specified criteria. For conditional breakpoints, predicate evaluation occurs at this stage.

5. **Source Mapping** -- Surviving events are enriched with source IR line mappings using the debug information from the bytecode. If `--source` is provided, the actual source lines are included in the output.

6. **Breakpoint Handling** -- When a breakpoint is hit, the runtime is paused and control is transferred to the interactive debugger. The operator can inspect registers, evaluate expressions, and continue or step execution.

7. **Output Rendering** -- Processed events are rendered to the configured output destination in the specified format. Text format provides human-readable output; JSON enables tool integration; flamegraph format produces profiling visualizations.

## Integration Points

| System | Integration | Purpose |
|--------|-------------|---------|
| [/pvm-compile](/commands/pvm-compile/) | Debug info enables source mapping | Source correlation |
| [/pvm-execute](/commands/pvm-execute/) | Traces programs started by executor | Runtime attachment |
| [Telemetry](/glossary/telemetry/) | Trace statistics as telemetry events | Observability |
| [Quality Gates](/glossary/quality-gates/) | Trace analysis for performance validation | Performance gates |
| [Formal Verification](/glossary/formal-verification/) | Execution traces as verification evidence | Proof artifacts |
| [NABLA](/glossary/nabla-infinity/) | Provenance tracking via execution traces | Epistemics |

## Best Practices

1. **Use filters in production** -- Full tracing generates enormous output volumes. Always use `--filter` to limit tracing to relevant operations when diagnosing production issues.

2. **Prefer sampling for profiling** -- For performance analysis, use `--profile --sample-rate 0.01` rather than full tracing. Sampling provides statistically valid profiling data with minimal overhead.

3. **Source mapping for debugging** -- Always provide `--source` when debugging logic errors. Bytecode-level traces are difficult to interpret without IR line correlation.

4. **Breakpoints over full trace** -- When searching for a specific condition, use `--break-when` instead of tracing everything and searching the output. Breakpoints are far more efficient.

5. **Save traces for regression** -- When debugging a resolved issue, save the trace and add it to the test suite as a regression artifact.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :process_not_found}` | Target PID does not exist or is not a PVM runtime | Verify PID and that the program is running |
| `{:error, :no_debug_info}` | Bytecode compiled without debug info | Recompile with `--debug-info` (default) |
| `{:error, :source_mismatch}` | Source IR does not match compiled bytecode | Use the source file that matches the compiled version |
| `{:error, :trace_buffer_overflow}` | Trace events generated faster than processed | Use `--filter` to reduce event volume or increase buffer |
| `{:error, :invalid_breakpoint}` | Breakpoint location outside program range | Verify line number or offset against source/bytecode |

## Advanced Usage

### Flamegraph Generation

```bash
# Generate flamegraph from profiling data
/pvm-trace --program workflow.pvmb --profile --format flamegraph --output /tmp/flame.svg

# View in browser
open /tmp/flame.svg
```

### Remote Tracing

```elixir
# Attach to PVM runtime on remote node
PVM.Trace.attach({:pvm_runtime, :"prismatic@prod-node1"},
  filter: :io,
  output: {:file, "/tmp/remote_trace.log"}
)
```

### Differential Tracing

```bash
# Compare execution traces of two program versions
/pvm-trace --program v1.pvmb --output /tmp/trace_v1.json --format json
/pvm-trace --program v2.pvmb --output /tmp/trace_v2.json --format json
diff <(jq '.events[]' /tmp/trace_v1.json) <(jq '.events[]' /tmp/trace_v2.json)
```

### Automated Trace Analysis

```bash
# Search trace for error patterns
/pvm-trace --replay /tmp/replay.log --search "instruction == BRANCH_ERR" --format json | \
  jq '.events[] | select(.registers.r0 == "timeout")'
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The tracer captures all events within its configured scope -- no events are silently dropped. Buffer overflow is reported as an error, not handled by silent discard.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Execution traces provide complete, verifiable evidence of program behavior. Every traced instruction includes its full context (registers, stack depth, heap usage) for unambiguous interpretation.

The tracing system directly supports the [NABLA](/glossary/nabla-infinity/) Provenance Mandatory axiom by providing an auditable chain of execution steps that trace any output value back to its input sources and computation path.

## Related Commands

- [/pvm-compile](/commands/pvm-compile/) - Compile validated IR to optimized PVM bytecode
- [/pvm-execute](/commands/pvm-execute/) - Execute compiled PVM programs with [fault tolerance](/glossary/fault-tolerance/) and [real-time monitoring](/capabilities/real-time-monitoring/)
- [/ir-generate](/commands/ir-generate/) - Generate Information Retrieval workflows from natural language descriptions
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee
- [/doc](/commands/doc/) - Technical documentation and API reference generation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)