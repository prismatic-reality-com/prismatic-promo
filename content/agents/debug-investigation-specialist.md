+++
title = "debug-investigation-specialist"
weight = 128
[extra]
domain = "primary-producer"
level = "L2"
description = "Systematic debugging methodology, complex issue investigation, root cause analysis, and BEAM/OTP runtime diagnostics for production and development environments."
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "seadf", "mycelial-network", "otp", "no-doubts", "genstage", "telemetry", "phoenix", "no-mercy", "liveview", "beam", "genserver"]
domain_normalized = "primary"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 1900
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["debug-investigation-specialist", "Systematic", "BEAMOTP", "agents", "agent", "Prismatic Platform", "BEAM"]
tags = ["agents", "agent", "debug-investigation-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "debug-investigation-specialist - Prismatic Platform"
+++

## Overview

The Debug Investigation Specialist operates as an L2 [tactical operations](/glossary/tactical-execution/) agent within the Primary Producer domain of the Prismatic Platform. This agent provides systematic debugging methodology and complex issue investigation capabilities, specializing in root cause analysis for issues that span multiple applications, involve concurrency problems, or manifest in the [BEAM](/glossary/beam/)/[OTP](/glossary/otp/) runtime in ways that require deep understanding of process scheduling, message passing, and supervision tree behavior.

Debugging in a 90-app umbrella architecture presents challenges that do not exist in simpler systems. Issues may originate in one application but manifest in another through indirect dependencies. Concurrency bugs in OTP processes may only appear under specific timing conditions. Memory leaks in long-running GenServers may accumulate over days before causing observable symptoms. The Debug Investigation Specialist addresses these challenges through a structured investigation methodology that systematically narrows the search space, gathering evidence at each step to guide the investigation toward the root cause.

The specialist embodies the NO DOUBTS principle: every debugging conclusion is backed by evidence, every hypothesis is tested before being accepted, and every fix is verified through reproduction testing that confirms the root cause has been eliminated.

## Systematic Debugging Methodology

The specialist follows a structured debugging methodology that ensures efficient progress from symptom observation to root cause identification.

Symptom characterization is the first phase, collecting detailed information about the observed problem. This includes when the symptom first appeared, its frequency and reproducibility, the specific conditions under which it occurs, and its observable impact. The specialist distinguishes between the symptom (what the user observes) and the root cause (the underlying defect), ensuring that investigation targets the cause rather than merely treating the symptom.

Hypothesis generation produces a ranked list of potential causes based on the characterized symptoms. The specialist draws on knowledge of common defect patterns in Elixir/OTP systems, recent code changes (obtained through git history), and the platform's architectural topology to generate hypotheses ordered by likelihood. Each hypothesis includes a predicted observation that would confirm or refute it.

Hypothesis testing systematically evaluates each hypothesis through targeted evidence gathering. The specialist designs minimal experiments that distinguish between competing hypotheses, preferring diagnostic approaches that provide conclusive results over those that produce ambiguous evidence. Each test either confirms a hypothesis (leading to fix implementation) or eliminates it (refining the search space for remaining hypotheses).

Root cause verification confirms that the identified cause actually produces the observed symptom. The specialist creates a minimal reproduction case that demonstrates the defect, verifies that the proposed fix eliminates the symptom in the reproduction case, and validates that the fix does not introduce side effects through regression testing.

## BEAM Runtime Diagnostics

The specialist has deep expertise in BEAM runtime diagnostics that are essential for investigating issues specific to the Erlang/Elixir runtime environment.

Process diagnostics use :erlang.process_info/2 and :observer to examine process state, message queue depth, memory consumption, and reductions (a measure of CPU usage). The specialist identifies runaway processes (consuming excessive reductions), mailbox overflow (unbounded message queue growth), and zombie processes (alive but no longer performing useful work) through systematic process inspection.

Memory diagnostics use :erlang.memory/0, :recon.proc_count/2, and binary reference tracking to identify memory consumption patterns. The specialist distinguishes between process heap memory (private to each process), ETS memory (shared tables), binary memory (reference-counted large binaries), and atom table memory (permanent allocations). Memory leaks in BEAM systems often involve binary references held by long-lived processes or ETS tables with accumulating entries that are never cleaned.

Message passing diagnostics investigate issues related to inter-process communication. The specialist traces message flows between processes using :dbg or :sys.trace/2, identifying bottlenecks where message processing cannot keep up with message arrival, routing errors where messages are sent to incorrect processes, and protocol violations where message formats do not match the receiving process's expectations.

Scheduler diagnostics examine BEAM scheduler utilization to identify CPU-bound processes that monopolize schedulers, dirty scheduler usage for NIF operations, and scheduler imbalance that leaves some schedulers idle while others are saturated. The specialist uses :scheduler.utilization/1 and :msacc.stats/0 to quantify scheduler behavior.

## Concurrency Issue Investigation

Concurrency issues are among the most challenging debugging targets due to their timing-dependent nature and difficulty of reproduction.

Race condition investigation identifies cases where two or more processes access shared state in an order-dependent manner without proper synchronization. In Elixir/OTP systems, race conditions typically involve multiple processes reading from and writing to the same ETS table, accessing the same GenServer state through concurrent calls, or interacting with external resources without coordination. The specialist identifies race windows through timing analysis and confirms them through controlled reproduction.

Deadlock investigation identifies mutual waiting conditions where two or more processes are blocked waiting for resources held by each other. In OTP systems, deadlocks can occur through GenServer call chains where A calls B and B calls A, through ETS read-write lock contention, or through external resource lock ordering violations. The specialist uses process state inspection and call graph analysis to identify deadlock participants and the lock ordering that caused the cycle.

Supervision tree investigation examines crash and restart patterns in OTP supervision trees. The specialist identifies restart cascade scenarios where a child crash triggers supervisor restarts that cascade to siblings, permanent failure patterns where a child repeatedly crashes faster than its supervisor's restart intensity allows, and supervision strategy mismatches where the chosen strategy (one_for_one, one_for_all, rest_for_one) does not match the actual dependency structure of the supervised children.

## Production Debugging Techniques

Production debugging requires techniques that provide diagnostic information without degrading service performance or risking data integrity.

Non-intrusive observation uses [telemetry](/glossary/telemetry/) events, structured logging, and metrics to gather diagnostic data from production systems without attaching debuggers or adding breakpoints. The specialist designs telemetry instrumentation that provides sufficient diagnostic detail for common issue categories while maintaining acceptable performance overhead.

Sampling-based diagnostics collect detailed information from a statistically representative subset of operations rather than all operations. This approach provides sufficient evidence for investigation while keeping the overhead proportional to the sampling rate rather than the operation volume.

Remote shell access through the BEAM's distributed node capabilities enables direct process inspection in production when non-intrusive methods are insufficient. The specialist uses remote shell access with extreme caution, following protocols that prevent accidental state modification and that log all diagnostic commands for audit purposes.

Post-mortem analysis examines crash dumps, log files, and metric time series after an incident has been resolved, reconstructing the sequence of events that led to the failure. The specialist maintains templates for post-mortem investigation that ensure consistent evidence collection and analysis across incidents.

## Regression Prevention

Every resolved investigation includes regression prevention measures that ensure the same issue cannot recur.

Regression test creation produces automated tests that reproduce the identified defect and verify that the fix prevents it. These tests are added to the platform's test suite permanently, providing ongoing protection against regression.

Monitoring enhancement adds or refines monitoring that would detect early symptoms of similar issues in the future. If an issue was difficult to detect through existing monitoring, the specialist improves monitoring coverage to ensure that similar issues are caught earlier in their progression.

## Authority Level

**L2** - [Tactical Operations](/glossary/tactical-execution/) - Domain-specific tactical execution with cross-domain coordination capabilities for complex debugging investigations that span multiple applications.

## Coordination

| Agent | Relationship | Purpose |
|-------|-------------|---------|
| [code-specialist](/agents/code-specialist/) | Code Partner | Implements fixes identified through debugging investigation |
| [database-performance-specialist](/agents/database-performance-specialist/) | Database Partner | Assists with database-related performance investigation |
| [deployment-health-monitor](/agents/deployment-health-monitor/) | Monitoring Partner | Provides health metrics that may correlate with investigated issues |

## Enforcement

All debugging operations are governed by the [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine. Every root cause claim must be backed by reproduction evidence. Every fix must include a regression test that verifies the root cause has been eliminated. Production debugging operations must follow established safety protocols that prevent diagnostic activities from causing additional harm. Post-mortem analysis is mandatory for all significant production incidents. Hypotheses are never presented as conclusions without supporting evidence.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)