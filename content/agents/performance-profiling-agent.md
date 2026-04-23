+++
title = "performance-profiling-agent"
weight = 298
[extra]
domain = "domain"
level = "L3"
description = "The Performance Profiling Agent identifies performance issues:"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["performance-profiling-agent", "Performance", "Profiling", "Agent", "agents", "Prismatic Platform", "Production", "BEAM"]
tags = ["agents", "agent", "performance-profiling-agent", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "performance-profiling-agent - Prismatic Platform"
+++

## Overview

The Performance Profiling Agent operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform's performance domain, specializing in the identification and diagnosis of performance bottlenecks, resource contention, and efficiency degradation across the platform's [OTP](@/glossary/otp.md) runtime. Unlike the benchmarking agent that measures aggregate performance against baselines, this agent performs deep diagnostic profiling to pinpoint the specific functions, processes, and code paths responsible for performance issues. Its diagnostic outputs provide the actionable intelligence needed to resolve performance problems at their root cause.

Built on the [AIAD](@/glossary/aiad.md) standard, the profiling agent leverages [BEAM](@/glossary/beam.md) VM introspection tools including `:fprof`, `:eprof`, `:cprof`, and `:recon` to capture execution profiles at function, process, and scheduler levels. The [NO DOUBTS](@/glossary/no-doubts.md) principle requires that all performance diagnoses are backed by measured profile data rather than architectural speculation. The agent produces structured profiling reports that attribute performance impact to specific code locations with quantified time and memory contributions.

## Theoretical Foundations

Performance profiling in the BEAM virtual machine operates on fundamentally different principles than profiling in conventional runtime environments. The BEAM's process model means that CPU time is distributed across potentially thousands of lightweight processes, each with its own heap and garbage collection cycle. Profiling must therefore operate at both the process level (which processes consume the most resources) and the function level (which functions within those processes are responsible).

The agent's profiling methodology distinguishes between four categories of performance consumption: CPU time (reductions consumed by computation), wait time (time spent waiting for messages, I/O, or locks), garbage collection time (time spent reclaiming process heap memory), and scheduling overhead (time spent context-switching between processes). Each category requires different profiling tools and produces different diagnostic insights.

Statistical profiling is preferred over instrumentation profiling for production environments because it introduces lower overhead. The agent supports both approaches: instrumentation profiling using `:fprof` and `:eprof` for development/staging environments where overhead is acceptable, and statistical sampling using `:recon` for production environments where minimal impact is essential.

## Operational Domain

The performance profiling domain covers CPU profiling (function call counts and time distribution), memory profiling (allocation patterns and garbage collection impact), process profiling (message queue depths, reduction counts, and scheduler binding), and I/O profiling (file and network operation latency). The agent supports both on-demand profiling triggered by performance complaints and continuous light-weight monitoring that detects gradual degradation patterns through [telemetry](@/glossary/telemetry.md) analysis.

The domain also includes specialized profiling for BEAM-specific concerns: binary reference counting (detecting binary memory leaks), process dictionary usage (identifying excessive dictionary growth), and port driver latency (measuring NIF and port driver impact on scheduler availability).

## Key Capabilities

- **Function-level CPU profiling** -- Captures execution time distribution across function calls using `:fprof` and `:eprof`, identifying hot functions that consume disproportionate CPU time relative to their operational value

- **Process-level diagnostics** -- Analyzes individual [OTP](@/glossary/otp.md) processes for message queue buildup, excessive reduction counts, memory growth patterns, and scheduler monopolization using `:recon` and `:observer` integration

- **Memory allocation analysis** -- Traces memory allocation patterns to identify functions that generate excessive garbage collection pressure through large binary creation, frequent small allocations, or reference-counted binary leaks

- **Distributed trace correlation** -- Connects profiling data with distributed trace spans from the service mesh to identify cross-process performance bottlenecks in multi-service workflows

- **Garbage collection impact assessment** -- Measures per-process garbage collection frequency and duration, identifying processes where GC pauses contribute significantly to observed latency

- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with triggered profiling sessions when telemetry signals indicate performance anomalies

- **[SEADF](@/glossary/seadf.md) integration** for evolutionary learning from profiling outcomes, improving future bottleneck prediction accuracy

## Authority Level

**L3** - Strategic Command - Multi-domain coordination with authority to initiate profiling sessions and publish diagnostic reports that drive performance remediation.

## Profiling Tools and Methods

| Tool | Use Case | Overhead | Environment |
|------|----------|----------|-------------|
| **:fprof** | Detailed function call tracing | High | Development/Staging |
| **:eprof** | Function time profiling | Medium | Development/Staging |
| **:cprof** | Function call counting | Low | Any |
| **:recon** | Production-safe process diagnostics | Minimal | Production |
| **:observer** | Visual process and scheduler monitoring | Low | Development |
| **Telemetry** | Continuous lightweight measurement | Minimal | Production |

The agent selects the appropriate profiling tool based on the investigation context, available environment, and acceptable overhead constraints. Production profiling is strictly limited to tools with minimal impact to prevent profiling activities from creating the performance problems they are investigating.

## Diagnostic Report Structure

Profiling reports follow a standardized format that enables efficient root cause resolution:

1. **Executive Summary** -- One-paragraph description of the identified performance issue and its impact
2. **Profiling Configuration** -- Tools used, sampling parameters, duration, and environment details
3. **Hot Path Analysis** -- Ranked list of functions by time consumption with call counts and per-call duration
4. **Process Analysis** -- Top resource-consuming processes with their roles and message queue states
5. **Memory Analysis** -- Allocation patterns, GC frequency, and binary reference statistics
6. **Root Cause Identification** -- Specific code location(s) responsible for the performance issue
7. **Remediation Recommendations** -- Concrete optimization suggestions with expected impact estimates

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/profile cpu` | Initiate CPU profiling session for specified subsystem | L3+ |
| `/profile memory` | Run memory allocation analysis for specified processes | L3+ |
| `/profile diagnose` | Generate diagnostic report for a reported performance issue | L3+ |
| `/profile production` | Run production-safe profiling using minimal-overhead tools | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [Performance Benchmarking Agent](@/agents/performance-benchmarking-agent.md) | Benchmark regressions trigger targeted profiling investigations |
| [performance-monitoring-specialist](@/agents/performance-monitoring-specialist.md) | Monitoring alerts trigger profiling for anomaly diagnosis |
| [performance-optimization-conductor](@/agents/performance-optimization-conductor.md) | Profiling results inform optimization campaign planning |
| [service-mesh-specialist](@/agents/service-mesh-specialist.md) | Provides distributed trace data for cross-process profiling correlation |
| [code-quality-commander](@/agents/code-quality-commander.md) | Performance diagnostics inform quality domain assessment |

## Enforcement

The [NO MERCY](@/glossary/no-mercy.md) doctrine requires that identified performance bottlenecks are resolved, not deferred. Profiling reports carry full diagnostic evidence per [NO DOUBTS](@/glossary/no-doubts.md), and all performance claims are backed by measured data with reproducibility instructions. Performance issues identified during profiling sessions are tracked until resolution, with escalation timelines that prevent indefinite deferral of performance problems.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)