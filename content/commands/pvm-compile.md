+++
title = "/pvm-compile"
weight = 1800
[extra]
category = "PVM"
description = "Compile validated IR to optimized PVM bytecode"
syntax = "/pvm-compile [options]"
authority = "L2+"
agent = "pvm-compiler"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1027
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["pvm-compile", "Compile", "commands", "PVM", "Prismatic Platform", "Compilation", "Verification", "Output"]
tags = ["commands", "pvm", "pvm-compile", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/pvm-compile - Prismatic Platform"
+++

## Overview

**/pvm-compile** is a production command in the **PVM** category of the Prismatic Platform that compiles validated intermediate representation (IR) into optimized [PVM](/glossary/pvm/) (Prismatic Virtual Machine) bytecode. The PVM is the platform's custom execution engine designed for running agent workflows, data transformation pipelines, and automated reasoning tasks with built-in fault tolerance, real-time monitoring, and deterministic replay capabilities.

The compilation process transforms high-level workflow descriptions -- expressed as IR generated from natural language or direct specification -- into a compact bytecode format that the PVM executor can run efficiently. The compiler performs multiple optimization passes including dead code elimination, constant folding, instruction scheduling, and register allocation to produce bytecode that executes with minimal overhead while preserving the semantic guarantees of the source IR.

This command operates under the **L2+** authority level and is executed by the `pvm-compiler` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The compiler integrates tightly with the PVM execution and tracing subsystems, ensuring that compiled bytecode carries sufficient metadata for runtime debugging, performance profiling, and deterministic replay.

A key design principle of the PVM compiler is that compilation is always reproducible: given the same IR input and compiler version, the output bytecode is identical byte-for-byte. This determinism is essential for the platform's formal verification requirements, where compiled programs must be provably equivalent to their source specifications. The compiler also embeds integrity checksums in the output bytecode, enabling the executor to verify program integrity before execution.

## Architecture

The PVM compilation pipeline follows a traditional multi-pass compiler architecture adapted for the platform's workflow-oriented bytecode.

```
IR Input (validated)
      |
      v
+-------------------+
| IR Parser/Loader  |
+-------------------+
      |
      v
+-------------------+
| Semantic Analyzer |
| (type checking)   |
+-------------------+
      |
      v
+-------------------+
| Optimization      |
| Passes (multi)    |
+-------------------+
      |
      v
+-------------------+
| Code Generator    |
| (bytecode emit)   |
+-------------------+
      |
      v
+-------------------+
| Bytecode Packager |
| (metadata + hash) |
+-------------------+
      |
      v
PVM Bytecode (.pvmb)
```

### Optimization Passes

| Pass | Order | Description |
|------|-------|-------------|
| **Dead Code Elimination** | 1 | Removes unreachable instructions and unused variables |
| **Constant Folding** | 2 | Evaluates compile-time constant expressions |
| **Instruction Scheduling** | 3 | Reorders independent instructions for pipeline efficiency |
| **Register Allocation** | 4 | Maps virtual registers to physical slots |
| **Peephole Optimization** | 5 | Applies local instruction pattern transformations |
| **Debug Info Generation** | 6 | Embeds source mapping for tracing and debugging |

## Usage

### Basic Compilation

```bash
# Compile an IR file to PVM bytecode
/pvm-compile --input workflow.ir

# Compile with specific output path
/pvm-compile --input workflow.ir --output /path/to/workflow.pvmb

# Compile with optimization level
/pvm-compile --input workflow.ir --opt-level 2

# Compile without optimizations (for debugging)
/pvm-compile --input workflow.ir --opt-level 0
```

### Compilation from Pipeline

```bash
# Compile IR generated from natural language
/ir-generate "Scan domain for open ports" | /pvm-compile --stdin

# Compile and immediately execute
/pvm-compile --input scanner.ir --execute

# Compile with specific target platform
/pvm-compile --input workflow.ir --target beam
```

### Verification and Inspection

```bash
# Compile and verify bytecode integrity
/pvm-compile --input workflow.ir --verify

# Dump compiled bytecode as human-readable assembly
/pvm-compile --input workflow.ir --dump-asm

# Show compilation statistics
/pvm-compile --input workflow.ir --stats

# Check IR validity without compiling
/pvm-compile --input workflow.ir --check-only
```

### Batch Compilation

```bash
# Compile all IR files in a directory
/pvm-compile --input-dir /path/to/workflows/ --output-dir /path/to/compiled/

# Parallel compilation
/pvm-compile --input-dir /path/to/workflows/ --parallel 4

# Incremental compilation (skip unchanged)
/pvm-compile --input-dir /path/to/workflows/ --incremental
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--input` | `string` | required | Path to IR source file |
| `--output` | `string` | auto | Output path for compiled bytecode |
| `--stdin` | `boolean` | `false` | Read IR from standard input |
| `--opt-level` | `0 \| 1 \| 2 \| 3` | `2` | Optimization level (0=none, 3=aggressive) |
| `--target` | `beam \| native` | `beam` | Target execution platform |
| `--execute` | `boolean` | `false` | Execute immediately after compilation |
| `--verify` | `boolean` | `false` | Verify bytecode integrity after compilation |
| `--dump-asm` | `boolean` | `false` | Output human-readable bytecode assembly |
| `--stats` | `boolean` | `false` | Show compilation statistics |
| `--check-only` | `boolean` | `false` | Validate IR without generating bytecode |
| `--input-dir` | `string` | `nil` | Directory of IR files for batch compilation |
| `--output-dir` | `string` | `nil` | Output directory for batch compilation |
| `--parallel` | `integer` | `1` | Number of parallel compilation workers |
| `--incremental` | `boolean` | `false` | Skip unchanged files in batch mode |
| `--debug-info` | `boolean` | `true` | Embed debug and source mapping information |
| `--deterministic` | `boolean` | `true` | Ensure reproducible output |

## Execution Flow

1. **IR Loading** -- The input IR is loaded from file or stdin. The IR format is validated against the PVM IR schema, checking for structural correctness and version compatibility.

2. **Semantic Analysis** -- Type checking is performed on the IR. All variable references are resolved, type constraints are verified, and the IR is annotated with type information for the optimizer.

3. **Optimization Pipeline** -- The IR passes through the configured optimization passes in sequence. Each pass transforms the IR representation and reports the number of transformations applied. At `--opt-level 0`, this phase is skipped entirely.

4. **Code Generation** -- The optimized IR is translated into PVM bytecode instructions. Each IR node maps to one or more bytecode instructions according to the code generation templates.

5. **Debug Info Embedding** -- Source location mappings are embedded into the bytecode to enable the [/pvm-trace](/commands/pvm-trace/) command to correlate execution steps with source IR lines.

6. **Packaging** -- The bytecode is packaged with metadata headers including compiler version, optimization level, target platform, source hash, and an integrity checksum. The package is written to the output path.

7. **Verification** -- If `--verify` is enabled, the packaged bytecode is loaded back and its integrity checksum is validated. The bytecode is also deserialized and checked for structural validity.

## Integration Points

| System | Integration | Purpose |
|--------|-------------|---------|
| [/pvm-execute](/commands/pvm-execute/) | Primary consumer of compiled bytecode | Execution |
| [/pvm-trace](/commands/pvm-trace/) | Uses debug info for execution tracing | Debugging |
| [/ir-generate](/commands/ir-generate/) | Produces IR that this command compiles | Pipeline input |
| [Quality Gates](/glossary/quality-gates/) | Compilation success as a quality checkpoint | Quality |
| [Telemetry](/glossary/telemetry/) | Compilation metrics and timing events | Observability |
| [Formal Verification](/glossary/formal-verification/) | Deterministic output enables bytecode verification | Verification |

## Best Practices

1. **Use optimization level 2 for production** -- Level 2 provides the best balance between compilation time and execution performance. Level 3 enables aggressive optimizations that may significantly increase compilation time.

2. **Always include debug info** -- The overhead of debug information in bytecode is minimal, but the ability to trace execution back to source IR is invaluable for production debugging.

3. **Verify in CI** -- Include `--verify` in CI/CD pipeline compilation steps to catch bytecode corruption early. Verification adds minimal time but prevents executing corrupted programs.

4. **Incremental for development** -- Use `--incremental` during development to avoid recompiling unchanged workflows. The compiler tracks file hashes to determine what needs recompilation.

5. **Check before compile** -- Use `--check-only` to validate IR changes before committing to a full compilation cycle, especially for large workflow files.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `{:error, :invalid_ir}` | IR input fails schema validation | Check IR syntax and version compatibility |
| `{:error, :type_error, details}` | Type mismatch in IR expressions | Review type annotations in the IR source |
| `{:error, :undefined_reference, name}` | Reference to undefined variable or function | Ensure all references are defined before use |
| `{:error, :optimization_failed, pass}` | An optimization pass produced invalid IR | Try lower `--opt-level` or report the issue |
| `{:error, :verification_failed}` | Output bytecode fails integrity check | Possible disk corruption; recompile |

## Advanced Usage

### Custom Optimization Passes

```elixir
# Register a custom optimization pass
PVM.Compiler.register_pass(:my_optimization, fn ir ->
  # Transform IR
  {:ok, optimized_ir}
end, order: 3)  # Run after constant folding
```

### Bytecode Inspection

```bash
# Disassemble compiled bytecode
/pvm-compile --input workflow.ir --dump-asm
# Output:
#   0000: LOAD_CONST  r0, "example.com"
#   0004: CALL        r1, :discover, [r0]
#   0008: BRANCH_ERR  r1, 0x0020
#   000c: LOAD_FIELD  r2, r1, :assets
#   0010: ITER_START  r3, r2
#   ...
```

### Cross-Compilation

```bash
# Compile for native execution (ahead-of-time)
/pvm-compile --input workflow.ir --target native --arch x86_64

# Compile for BEAM (default, runs on Erlang VM)
/pvm-compile --input workflow.ir --target beam
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. The compiler rejects any IR that fails semantic analysis. No partially compiled output is emitted. Optimization passes that produce invalid IR cause immediate failure with diagnostic information.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Deterministic compilation ensures that the same input always produces the same output. Bytecode integrity verification provides cryptographic evidence that compilation succeeded correctly.

## Related Commands

- [/pvm-execute](/commands/pvm-execute/) - Execute compiled PVM programs with [fault tolerance](/glossary/fault-tolerance/) and [real-time monitoring](/capabilities/real-time-monitoring/)
- [/pvm-trace](/commands/pvm-trace/) - Real-time execution tracing and debugging for PVM programs
- [/ir-generate](/commands/ir-generate/) - Generate Information Retrieval workflows from natural language descriptions
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)