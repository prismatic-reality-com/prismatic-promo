+++
title = "livebook-coordinator"
weight = 219
[extra]
domain = "medium-predator"
level = "L2"
description = "Specialized coordinator for Livebook notebook management, interactive Elixir development, and collaborative data exploration workflows"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["aiad", "seadf", "mycelial-network", "nabla-infinity", "no-doubts", "telemetry", "no-mercy", "otp", "beam"]
domain_normalized = "predator"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2100
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["livebook-coordinator", "Specialized", "Livebook", "Elixir", "agents", "agent", "Prismatic Platform", "BEAM", "Runtime", "Notebook"]
tags = ["agents", "agent", "livebook-coordinator", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "livebook-coordinator - Prismatic Platform"
+++

## Overview

The livebook-coordinator is an L2 tactical operations agent operating within the Prismatic Platform's interactive development domain. This agent manages the lifecycle, configuration, and orchestration of Livebook notebooks -- the Elixir ecosystem's interactive computational notebook environment. Livebook provides a browser-based interface for writing and executing Elixir code in an interactive, cell-based format similar to Jupyter notebooks but deeply integrated with the [BEAM](/glossary/beam/) virtual machine and [OTP](/glossary/otp/) ecosystem. The coordinator ensures that Livebook instances are properly configured, connected to the platform's runtime, and available for data exploration, prototyping, documentation, and interactive analysis workflows.

Built on the [AIAD](/glossary/aiad/) standard, the livebook-coordinator addresses the need for interactive development environments within a platform that is otherwise oriented toward automated, agent-driven operations. While autonomous agents handle the majority of platform operations, certain activities -- exploratory data analysis, prototype development, interactive debugging, and collaborative investigation -- benefit from the immediate feedback and visual output that Livebook provides. The coordinator bridges the gap between the platform's automated infrastructure and its human operators' need for interactive tooling.

## Livebook Integration Architecture

The livebook-coordinator manages several aspects of Livebook integration with the Prismatic Platform. Instance management handles the provisioning, configuration, and lifecycle of Livebook server instances. Each instance is configured with appropriate authentication, resource limits, and network access controls. The coordinator supports both standalone Livebook instances (for isolated experimentation) and attached instances (connected to the platform's running BEAM nodes for live system introspection).

Notebook management handles the storage, versioning, and sharing of Livebook notebook files (.livemd format). Notebooks are stored in the platform's repository with version control through Git, enabling collaborative development and historical tracking of analysis workflows. The coordinator provides templates for common analytical tasks (entity investigation, data quality assessment, performance profiling) that users can instantiate and customize.

Runtime connection management handles the establishment and monitoring of connections between Livebook instances and the platform's BEAM runtime. Attached mode connections enable Livebook cells to execute code within the context of the running platform, accessing live data, calling platform functions, and inspecting process state. This capability is essential for interactive debugging and live system analysis.

## Key Capabilities

- **Instance lifecycle management** -- Provisions, configures, starts, stops, and monitors Livebook server instances with appropriate security and resource configurations
- **Notebook template library** -- Maintains a library of pre-built notebook templates for common platform operations including entity investigation, data exploration, performance analysis, and agent debugging
- **Runtime attachment** -- Manages connections between Livebook instances and the platform's running BEAM nodes, enabling live system introspection and interactive code execution
- **Collaborative notebook sharing** -- Supports multi-user access to shared notebooks with appropriate access control and conflict resolution for concurrent editing
- **Smart cell integration** -- Provides platform-specific Livebook Smart Cells that offer GUI-driven configuration for common platform operations (database queries, API calls, visualization generation)
- **Notebook validation** -- Checks notebooks for security issues (credential exposure, unsafe system calls) and platform compliance before sharing or publishing
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with health monitoring and automatic recovery of Livebook instances
- **[Telemetry integration](/capabilities/telemetry-integration/)** for instance utilization metrics and notebook execution monitoring

## Notebook Template Categories

The coordinator maintains notebook templates organized by analytical purpose, each designed to accelerate common interactive workflows.

**Investigation notebooks** provide structured frameworks for interactive entity investigation. Templates include pre-configured cells for querying the platform's OSINT providers, visualizing entity relationship graphs from KuzuDB, and generating formatted intelligence reports. Analysts can customize these templates by adding cells for specialized analysis while benefiting from the pre-built infrastructure for data access and visualization.

**Data quality notebooks** provide interactive tools for examining data quality across platform storage systems. Templates include cells for sampling data from PostgreSQL and ETS, computing quality metrics (completeness, consistency, accuracy, timeliness), and visualizing quality distributions. These notebooks support the platform's quality-first culture by making data quality assessment accessible and interactive.

**Performance analysis notebooks** provide interactive profiling and benchmarking tools. Templates include cells for executing Benchee benchmarks, visualizing execution profiles, and comparing performance across configurations. These notebooks complement the automated profiling provided by the [ir-pvm-profiler](/agents/ir-pvm-profiler/) with interactive exploration capability.

**Agent debugging notebooks** provide tools for inspecting agent state, tracing message flows, and testing agent behaviors in isolation. Templates include cells for querying agent process state, subscribing to telemetry events, and invoking agent functions with test inputs. These notebooks are invaluable for diagnosing complex agent interaction issues that are difficult to analyze through logs alone.

## Security Model

Livebook instances managed by the coordinator operate within the platform's security perimeter with appropriate access controls. Authentication is required for all Livebook access, with credentials managed through the platform's identity system. Notebook execution operates under the principle of least privilege -- notebooks connected to production systems have read-only access by default, with write access requiring explicit authorization through the platform's role-based access control system.

The coordinator enforces content security policies that prevent notebooks from becoming vectors for credential exposure or unauthorized system access. Notebooks are scanned for hardcoded credentials, API keys, and other sensitive data before storage in the version control system. Runtime connections to production systems are logged and audited.

## Authority Level

**L2** - Tactical Operations - Domain-specific [tactical execution](/glossary/tactical-execution/) authority for managing Livebook instances, notebook resources, and runtime connections within the interactive development domain.

## Integration Architecture

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime execution and instance lifecycle management |
| [BEAM](/glossary/beam/) VM | Runtime node connection for attached-mode Livebook instances |
| [Prismatic Storage](/glossary/prismatic-storage/) | Data access for interactive exploration notebooks |
| Prismatic Telemetry | Instance utilization [metrics](/glossary/metrics/) and notebook execution event tracking |
| [SEADF](/glossary/seadf/) | Autonomous evolution of notebook templates and Smart Cells |
| AIAD [Registry](/glossary/registry-otp/) | Agent specification and discovery |

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/livebook start` | Provision and start a new Livebook instance | L2+ |
| `/livebook attach <node>` | Connect Livebook to a running BEAM node | L2+ |
| `/livebook templates` | List available notebook templates | L1+ |
| `/livebook share <notebook>` | Share a notebook with specified access controls | L2+ |
| `/livebook status` | Report health and utilization of all managed Livebook instances | L2+ |

## Coordination with Related Agents

| Agent | Relationship |
|-------|-------------|
| [**investigate-coordinator**](/agents/investigate-coordinator/) (L3) | Investigation notebooks draw on investigation data and OSINT results |
| [**ir-pvm-profiler**](/agents/ir-pvm-profiler/) (L3) | Performance analysis notebooks complement automated profiling capabilities |
| [**llm-conversation-coordinator**](/agents/llm-conversation-coordinator/) (L3) | LLM-enhanced notebooks leverage conversation management for interactive AI workflows |

## Operational Metrics

The coordinator tracks operational metrics including instance uptime, notebook execution frequency, template utilization rates, and runtime connection stability. These metrics inform resource allocation decisions (how many Livebook instances to maintain) and template development priorities (which template categories see the most usage and would benefit from enhancement).

## Enforcement

The [NO MERCY](/glossary/no-mercy/) doctrine requires that all managed Livebook instances are properly secured and monitored. No instance operates without authentication. No notebook containing credentials enters version control. The [NO DOUBTS](/glossary/no-doubts/) principle requires that interactive analysis results produced through Livebook notebooks carry the same provenance and confidence scoring requirements as automated analysis -- the interactive nature of the tool does not exempt its outputs from epistemic rigor.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)