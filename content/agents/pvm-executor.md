+++
title = "pvm-executor"
weight = 324
[extra]
domain = "execution"
level = "L4"
description = "High-performance Platform Virtual Machine executor with fault tolerance and distributed execution capabilities"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "pvm", "telemetry", "beam"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["pvm-executor", "High-performance", "Platform", "Virtual", "Machine", "agents", "agent", "Prismatic Platform", "BEAM", "Checkpoint"]
tags = ["agents", "agent", "pvm-executor", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "pvm-executor - Prismatic Platform"
+++

## Overview

The [pvm](/glossary/pvm/)-executor operates as an L4 Domain Authority within the Prismatic Platform's execution domain, providing high-performance workflow execution with [fault tolerance](/glossary/fault-tolerance/) and distributed execution capabilities for the Prismatic Virtual Machine (PVM). This agent is the runtime engine that interprets compiled PVM bytecode produced by the [pvm-compiler](/agents/pvm-compiler/), dispatching operations to appropriate platform subsystems, managing execution state across multi-step workflows, and handling failure recovery when individual operations encounter errors. The executor is the point where declarative workflow specifications become operational reality -- every agent orchestration, pipeline execution, and quality gate evaluation ultimately runs through the PVM executor.

Built on the [BEAM](/glossary/beam/) virtual machine's native concurrency and fault tolerance capabilities, the executor leverages [OTP](/glossary/otp/) supervision trees to isolate workflow executions from each other, preventing failures in one workflow from affecting others. Each workflow execution runs in its own BEAM process with configurable resource limits (memory, execution time, message queue depth), providing natural sandboxing without external containerization. The executor supports distributed execution across multiple BEAM nodes, enabling workflows to span machine boundaries when resource requirements exceed single-node capacity.

## Execution Engine Architecture

The PVM executor implements a register-based bytecode interpreter optimized for the workflow execution patterns common in the Prismatic Platform.

**Instruction Dispatch** reads bytecode instructions sequentially from compiled workflow artifacts and dispatches them to specialized handlers. The dispatch mechanism uses direct threading (each instruction handler jumps directly to the next handler's address) rather than a central dispatch loop, eliminating per-instruction dispatch overhead. Common instruction sequences are recognized and handled as super-instructions, further reducing interpretation overhead.

**Register File** maintains the execution state for each running workflow. Registers hold intermediate computation results, references to external resources (database connections, agent handles, ETS table references), and control flow state (program counter, exception handler stack). The register file is implemented as a compact array within the executing BEAM process, providing O(1) access to any register.

**Operand Stack** supplements the register file for operations that produce variable numbers of results or consume variable numbers of inputs. The stack is used primarily for agent invocation (pushing arguments, popping results) and for managing nested control flow structures.

**Execution Context** carries metadata about the running workflow including its source specification, compilation parameters, scheduling priority, resource limits, and telemetry configuration. The context is immutable once established, ensuring that workflow behavior is deterministic and reproducible.

## Fault Tolerance Model

The executor implements a comprehensive fault tolerance model that ensures workflow reliability in the presence of component failures.

**Process Isolation** runs each workflow execution in a dedicated BEAM process under a [supervision tree](/glossary/supervision-tree/). If a workflow process crashes, the supervisor can restart it according to the workflow's restart strategy (retry from beginning, retry from last checkpoint, or fail permanently). Process isolation ensures that a crash in one workflow cannot corrupt the state of other running workflows.

**Checkpoint and Recovery** enables long-running workflows to persist their execution state at configurable checkpoints. If a workflow is interrupted (by crash, node failure, or resource exhaustion), it can resume from the most recent checkpoint rather than restarting from the beginning. Checkpoint data is stored in [ETS](/glossary/ets/) tables with periodic persistence to disk for durability across node restarts.

**Timeout Management** enforces configurable time limits at multiple granularities: per-instruction timeouts prevent individual operations from blocking indefinitely, per-stage timeouts bound the execution time of workflow phases, and per-workflow timeouts limit total workflow execution time. Timeout violations trigger the workflow's configured failure handler, which may retry, skip, or terminate the workflow.

**Circuit Breaker Integration** monitors the health of external dependencies (database connections, external APIs, agent processes) and automatically opens circuit breakers when failure rates exceed thresholds. Open circuit breakers cause dependent operations to fail fast rather than waiting for unresponsive dependencies, preventing cascading failure propagation through the workflow execution system.

## Distributed Execution

The executor supports distributed workflow execution across multiple BEAM nodes, enabling horizontal scaling for resource-intensive operations.

**Work Distribution** partitions workflow operations across available nodes based on resource requirements and node capacity. Operations that require specific resources (database connections, GPU access, specialized agent processes) are routed to nodes that provide those resources. Independent operations within a workflow are distributed across nodes for parallel execution.

**State Synchronization** maintains consistency of workflow execution state across distributed nodes. The executor uses a primary-replica model where the coordinating node maintains authoritative state and replica nodes execute delegated operations with eventual state propagation. Conflict resolution uses last-writer-wins semantics with vector clock ordering for causal consistency.

**Node Failure Handling** detects node failures through BEAM distribution monitoring and automatically reassigns operations from failed nodes to healthy nodes. Checkpoint data enables resumed execution of operations that were in progress on the failed node. The executor maintains sufficient state redundancy to survive single-node failures without workflow interruption.

## Resource Management

The executor implements fine-grained resource management to prevent resource exhaustion and ensure fair allocation across concurrent workflows.

**Memory Limits** enforce per-workflow and per-operation memory budgets. When a workflow's memory consumption approaches its limit, the executor triggers garbage collection on the workflow's process. If consumption exceeds the hard limit, the workflow is terminated with a resource exhaustion error.

**Concurrency Control** limits the number of concurrent operations that a workflow can execute simultaneously, preventing individual workflows from monopolizing shared resources. Concurrency limits are configurable per workflow and per operation type, with dynamic adjustment based on system load.

**Connection Pooling** manages shared resources (database connections, HTTP client connections) through pooling mechanisms that prevent resource exhaustion while maintaining efficient resource utilization across concurrent workflows.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/pvm execute` | Execute a compiled workflow with specified parameters | L4+ |
| `/pvm status` | Display running workflow executions with progress information | L4+ |
| `/pvm checkpoint` | Force checkpoint creation for a running workflow | L4+ |
| `/pvm terminate` | Terminate a running workflow execution | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [pvm-compiler](/agents/pvm-compiler/) | Receives compiled bytecode artifacts for execution |
| [pvm-adaptive-scheduler](/agents/pvm-adaptive-scheduler/) | Receives scheduling decisions for workflow dispatch timing |
| [pvm-tracer](/agents/pvm-tracer/) | Produces execution traces for monitoring and debugging |
| [production-deployment-specialist](/agents/production-deployment-specialist/) | Execution environment preparation for deployment workflows |

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and lifecycle management |
| Prismatic Telemetry | Execution performance [metrics](/glossary/metrics/) and workflow completion tracking |
| [AIAD](/glossary/aiad/) [Registry](/glossary/registry-otp/) | Agent invocation dispatch during workflow execution |
| [BEAM](/glossary/beam/) Distribution | Multi-node workflow execution and state synchronization |
| [SEADF](/glossary/seadf/) Pipeline | Evolution workflow execution and quality gate evaluation |

## Enforcement

Execution operations comply with the [NO MERCY](/glossary/no-mercy/) doctrine -- workflows that violate resource limits, exceed timeout budgets, or produce invalid outputs are terminated without exception. The [NO DOUBTS](/glossary/no-doubts/) principle requires that all execution results include full provenance information tracking which bytecode instructions produced each output element. The [Trinity Gate](/glossary/trinity-gate/) validates execution outputs for critical workflows through structural consistency (output data structures match specification), logical consistency (output values satisfy workflow postconditions), and formal necessity (output derivation is traceable through the executed instruction sequence).

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)