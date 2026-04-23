+++
title = "/pvm-execute"
weight = 1810
[extra]
category = "PVM"
description = "Execute compiled PVM programs with fault tolerance and real-time monitoring"
syntax = "/pvm-execute [options]"
authority = "L2+"
agent = "pvm-executor"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 988
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["pvm-execute", "Execute", "commands", "PVM", "Prismatic Platform", "Execution", "Path"]
tags = ["commands", "pvm", "pvm-execute", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/pvm-execute - Prismatic Platform"
+++

## Overview

**/pvm-execute** is a production command in the **PVM** category of the Prismatic Platform that executes compiled [PVM](@/glossary/pvm.md) (Prismatic Virtual Machine) bytecode programs with built-in [fault tolerance](@/glossary/fault-tolerance.md), [real-time monitoring](@/capabilities/real-time-monitoring.md), and deterministic replay capabilities. The executor is the runtime component of the PVM toolchain, taking compiled `.pvmb` bytecode files and running them within a supervised OTP process environment that provides automatic crash recovery, resource limiting, and comprehensive execution telemetry.

The PVM executor implements a register-based virtual machine that runs within an Erlang process, leveraging the BEAM VM's preemptive scheduling, garbage collection, and distribution capabilities. Each PVM program executes in its own isolated process with configurable memory limits, execution timeouts, and I/O permissions. This isolation ensures that a misbehaving program cannot affect other running programs or the platform itself.

This command operates under the **L2+** authority level and is executed by the `pvm-executor` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The executor integrates with the platform's supervision tree, meaning crashed PVM programs are automatically restarted according to configurable restart strategies.

A distinguishing feature of the PVM executor is deterministic replay. Every execution is logged with sufficient detail that it can be exactly replayed later for debugging, auditing, or testing purposes. The replay log captures all external interactions (network calls, file I/O, random number generation) as recorded values, allowing the replayed execution to produce identical results without repeating side effects. This capability is essential for debugging intermittent failures and for formal verification of execution correctness.

## Architecture

The PVM executor operates within the platform's OTP supervision hierarchy.

```
PrismaticSupervisor
      |
      v
+-------------------+
| PVM.Supervisor    |
| (DynamicSupervisor)|
+-------------------+
      |
      v (per program)
+-------------------+
| PVM.Runtime       |
| (GenServer)       |
+-------------------+
   |      |      |
   v      v      v
+-----+ +-----+ +--------+
|Regs | |Stack| |Heap    |
|     | |     | |        |
+-----+ +-----+ +--------+
   |
   v
+-------------------+     +-------------------+
| Instruction       |---->| Replay Logger     |
| Dispatcher        |     | (deterministic)   |
+-------------------+     +-------------------+
   |
   v
+-------------------+
| I/O Sandbox       |
| (permissions)     |
+-------------------+
```

| Component | Responsibility |
|-----------|----------------|
| **PVM.Supervisor** | DynamicSupervisor managing all running PVM programs |
| **PVM.Runtime** | GenServer hosting a single program execution |
| **Instruction Dispatcher** | Fetches, decodes, and dispatches bytecode instructions |
| **Replay Logger** | Records all non-deterministic interactions for replay |
| **I/O Sandbox** | Enforces permission boundaries for external interactions |
| **Resource Monitor** | Tracks memory, CPU time, and I/O usage per program |

## Usage

### Basic Execution

```bash
# Execute a compiled PVM program
/pvm-execute --program workflow.pvmb

# Execute with input parameters
/pvm-execute --program scanner.pvmb --param domain=example.com

# Execute with timeout
/pvm-execute --program analysis.pvmb --timeout 60000

# Execute and capture output
/pvm-execute --program report.pvmb --output /tmp/results.json
```

### Fault-Tolerant Execution

```bash
# Execute with automatic restart on failure
/pvm-execute --program scanner.pvmb --restart-strategy transient --max-restarts 3

# Execute with checkpoint-based recovery
/pvm-execute --program long_workflow.pvmb --checkpoint-interval 30s

# Resume from last checkpoint
/pvm-execute --program long_workflow.pvmb --resume
```

### Monitored Execution

```bash
# Execute with real-time telemetry output
/pvm-execute --program workflow.pvmb --monitor

# Execute with resource limits
/pvm-execute --program untrusted.pvmb --memory-limit 256mb --cpu-limit 30s

# Execute with I/O restrictions
/pvm-execute --program sandboxed.pvmb --no-network --no-filesystem
```

### Replay and Debugging

```bash
# Execute with replay logging enabled
/pvm-execute --program workflow.pvmb --record-replay /tmp/replay.log

# Replay a previous execution
/pvm-execute --replay /tmp/replay.log

# Replay with step-by-step inspection
/pvm-execute --replay /tmp/replay.log --step
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--program` | `string` | required | Path to compiled `.pvmb` bytecode file |
| `--param` | `key=value` | `[]` | Input parameters (repeatable) |
| `--timeout` | `integer` | `120000` | Execution timeout in milliseconds |
| `--output` | `string` | `stdout` | Path to write execution output |
| `--restart-strategy` | `permanent \| transient \| temporary` | `temporary` | OTP restart strategy |
| `--max-restarts` | `integer` | `3` | Maximum restart attempts |
| `--checkpoint-interval` | `string` | `nil` | Interval between execution checkpoints |
| `--resume` | `boolean` | `false` | Resume from last checkpoint |
| `--monitor` | `boolean` | `false` | Enable real-time telemetry output |
| `--memory-limit` | `string` | `512mb` | Maximum memory allocation |
| `--cpu-limit` | `string` | `nil` | Maximum CPU time |
| `--no-network` | `boolean` | `false` | Disable network access |
| `--no-filesystem` | `boolean` | `false` | Disable filesystem access |
| `--record-replay` | `string` | `nil` | Path to write replay log |
| `--replay` | `string` | `nil` | Path to replay log for deterministic replay |
| `--step` | `boolean` | `false` | Step-by-step execution in replay mode |
| `--verbose` | `boolean` | `false` | Detailed execution logging |

## Execution Flow

1. **Bytecode Loading** -- The `.pvmb` file is loaded and its integrity checksum is verified. If verification fails, execution is aborted with an integrity error.

2. **Runtime Initialization** -- A new `PVM.Runtime` GenServer is started under the `PVM.Supervisor`. Registers, stack, and heap are allocated according to the bytecode's resource declarations.

3. **Parameter Binding** -- Input parameters specified via `--param` are bound to the program's declared input registers. Type compatibility is verified against the bytecode's type metadata.

4. **Instruction Execution** -- The instruction dispatcher enters its main loop, fetching instructions from the bytecode, decoding them, and dispatching to the appropriate handler. Each instruction may modify registers, push/pop stack frames, allocate heap objects, or perform external I/O.

5. **External Interaction Handling** -- When the program performs external operations (network requests, file access, database queries), the I/O sandbox checks permissions and the replay logger records the interaction and its result.

6. **Resource Monitoring** -- Throughout execution, the resource monitor tracks memory usage, CPU time, and I/O volume. If any limit is exceeded, execution is suspended and the configured response (warning, checkpoint, or termination) is triggered.

7. **Completion** -- When the program's main function returns, the output value is extracted from the designated result register, formatted according to `--output` settings, and emitted. Execution metrics are reported to the telemetry system.

## Integration Points

| System | Integration | Purpose |
|--------|-------------|---------|
| [/pvm-compile](@/commands/pvm-compile.md) | Produces bytecode consumed by executor | Compilation |
| [/pvm-trace](@/commands/pvm-trace.md) | Traces execution in real-time | Debugging |
| [OTP Supervision](@/glossary/otp.md) | Runtime processes managed by supervisor | Fault tolerance |
| [Telemetry](@/glossary/telemetry.md) | Execution metrics and events | Observability |
| [Quality Gates](@/glossary/quality-gates.md) | Execution success as quality checkpoint | Quality |
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Agent workflows compiled and executed as PVM programs | Agent runtime |

## Best Practices

1. **Always verify bytecode** -- The executor verifies integrity checksums by default. Do not disable this verification, even in development.

2. **Set appropriate limits** -- Configure memory and CPU limits based on expected program behavior. Unbounded execution risks affecting other platform components.

3. **Use checkpoints for long workflows** -- Programs that run for minutes or hours should use `--checkpoint-interval` to enable recovery without restarting from the beginning.

4. **Record replay logs** -- Enable `--record-replay` for production executions of critical workflows. Replay logs enable post-mortem debugging without reproducing the original environment.

5. **Sandbox untrusted programs** -- Use `--no-network --no-filesystem` for programs from untrusted sources. The I/O sandbox prevents unauthorized external access.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :integrity_failed}` | Bytecode checksum mismatch | Recompile the source IR |
| `{:error, :memory_exceeded}` | Program exceeded memory limit | Increase `--memory-limit` or optimize program |
| `{:error, :timeout}` | Execution exceeded timeout | Increase `--timeout` or use checkpoints |
| `{:error, :permission_denied, op}` | I/O operation blocked by sandbox | Adjust sandbox permissions or program design |
| `{:error, :max_restarts_exceeded}` | Program crashed too many times | Investigate crash cause with `/pvm-trace` |
| `{:error, :parameter_type_mismatch}` | Input parameter type does not match declaration | Verify parameter types against program specification |

## Advanced Usage

### Programmatic Execution

```elixir
# Start a PVM program from Elixir code
{:ok, pid} = PVM.Supervisor.start_program("workflow.pvmb",
  params: %{domain: "example.com"},
  timeout: 60_000,
  monitor: true
)

# Wait for result
{:ok, result} = PVM.Runtime.await(pid)
```

### Distributed Execution

```bash
# Execute across cluster nodes
/pvm-execute --program heavy_scan.pvmb --distribute --nodes 4

# Execute with affinity (pin to specific node)
/pvm-execute --program local_analysis.pvmb --node prismatic@node1
```

### Execution Chaining

```bash
# Pipe output of one program as input to another
/pvm-execute --program discover.pvmb --param domain=example.com | \
  /pvm-execute --program analyze.pvmb --stdin
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Programs that exceed resource limits are terminated cleanly. Bytecode integrity is verified before every execution. No partial results are emitted from crashed programs unless checkpoints are enabled.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Deterministic replay enables complete post-mortem analysis of any execution. All external interactions are logged with full context for audit and verification purposes.

## Related Commands

- [/pvm-compile](@/commands/pvm-compile.md) - Compile validated IR to optimized PVM bytecode
- [/pvm-trace](@/commands/pvm-trace.md) - Real-time execution tracing and debugging for PVM programs
- [/ir-generate](@/commands/ir-generate.md) - Generate Information Retrieval workflows from natural language descriptions
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee
- [/doc](@/commands/doc.md) - Technical documentation and API reference generation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)