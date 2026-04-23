+++
title = "Registry Auto"
weight = 348
[extra]
domain = "general"
level = "L3"
description = "Automatic AIAD registry synchronization through file system monitoring and event-driven indexing"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "comprehensive"
glossary_terms = ["aiad", "no-mercy", "no-doubts", "otp", "seadf", "telemetry"]
domain_normalized = "general"
content_version = "2.0.0"
last_enhanced = "2026-02-15"
word_count = 2000
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Registry", "Auto", "Automatic", "AIAD", "agents", "agent", "Prismatic Platform", "Strategic Command"]
tags = ["agents", "agent", "registry-auto", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "Registry Auto - Prismatic Platform"
+++

## Overview

The [Registry](@/glossary/registry-otp.md) Auto agent operates as an L3 [Strategic Command](@/glossary/strategic-command.md) authority within the Prismatic Platform, providing automatic synchronization of the [AIAD](@/glossary/aiad.md) registry through file system monitoring and event-driven indexing. In a platform with over 400 agents and 200 commands defined as AIAD specification files, keeping the registry synchronized with the file system is a continuous operational requirement. This agent monitors the `.aiad/` directory structure for changes to agent specifications, command definitions, policy documents, and pipeline configurations, automatically triggering re-indexing operations that keep the registry current.

Without automatic registry synchronization, the platform's agent discovery, command routing, and specification validation systems would operate on stale data, potentially routing commands to deprecated agents or failing to discover newly created agents. The Registry Auto agent eliminates this synchronization gap by maintaining real-time awareness of AIAD file changes and propagating those changes to the registry infrastructure within seconds.

Built on the [AIAD](@/glossary/aiad.md) standard and governed by the [NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md) doctrine, this agent ensures that registry synchronization is reliable, complete, and verified. Every synchronization event is logged with before-and-after state snapshots, enabling audit trail reconstruction and change attribution.

## File System Monitoring Architecture

The agent monitors the `.aiad/` directory tree using a combination of file system event notifications and periodic full-scan reconciliation. The **event-driven** monitoring layer uses inotify (Linux) or FSEvents (macOS) to receive immediate notification of file creation, modification, deletion, and rename events within the monitored directory tree. This provides sub-second awareness of specification changes during active development.

The **reconciliation** layer performs periodic full-directory scans to detect changes that may have been missed by the event-driven layer -- such as changes made while the monitoring process was restarting, or changes propagated through distributed file systems that do not reliably generate local events. The reconciliation interval is configurable, defaulting to every 5 minutes.

The agent processes the following AIAD file types:

| File Pattern | Registry Impact |
|-------------|----------------|
| `.aiad/agents/*.agent.md` | Agent specification created, updated, or removed |
| `.aiad/commands/*.cmd.md` | Command definition created, updated, or removed |
| `.aiad/policies/*.policy.md` | Policy document indexed for reference |
| `.aiad/pipelines/*.pipeline.md` | Pipeline definition created, updated, or removed |
| `.aiad/hooks/*.hook.yaml` | Hook configuration created, updated, or removed |

## Key Capabilities

- **Real-time file change detection** -- Monitors the `.aiad/` directory tree for specification file changes using OS-level file system events, providing sub-second change detection
- **Automatic re-indexing** -- Triggers AIAD registry re-indexing when specification files are created, modified, or deleted, keeping the registry synchronized with the file system
- **Specification validation** -- Validates changed specification files against the AIAD schema before committing updates to the registry, preventing malformed specifications from corrupting the registry
- **Change event generation** -- Produces structured change events for each registry update, enabling downstream systems to react to specification changes
- **Reconciliation scanning** -- Performs periodic full-directory scans to detect and correct any synchronization drift between the file system and the registry
- **Batch optimization** -- Aggregates rapid sequences of file changes into batched re-indexing operations, preventing redundant indexing when multiple files change within a short window
- **[Autonomous operation](@/capabilities/autonomous-self-healing.md)** with continuous file system monitoring and self-recovering event processing
- **[Telemetry integration](@/capabilities/telemetry-integration.md)** for synchronization latency monitoring and change event tracking

## Synchronization Protocol

The synchronization protocol ensures consistency between the file system and the registry. When a file change event is received, the agent follows a structured processing pipeline.

**Detection** captures the file change event with metadata including the changed file path, change type (create, modify, delete), and timestamp. **Debouncing** aggregates events for the same file within a configurable window (default 500ms) to avoid processing intermediate saves during active editing. **Validation** parses the changed specification file and validates it against the AIAD schema, rejecting malformed specifications with diagnostic error messages.

**Indexing** updates the registry with the validated specification, maintaining the previous version for audit purposes. **Propagation** emits change events to downstream systems that depend on registry state, including command routing, agent discovery, and specification validation services. **Verification** confirms that the registry accurately reflects the file system state after the update, detecting any synchronization failures.

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority to update the AIAD registry, validate specifications, and propagate change events across the platform.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/registry sync` | Trigger manual full-directory reconciliation scan | L3+ |
| `/registry status` | Display current registry synchronization status and statistics | L3+ |
| `/registry changes` | Show recent registry change events with timestamps and details | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [quality-assurance-commander](@/agents/archer-supreme.md) | Registry consistency is a quality metric monitored by the quality infrastructure |
| [recursive-optimizer](@/agents/recursive-optimizer.md) | Registry synchronization patterns are analyzed for optimization opportunities |
| [repair-society-coordinator](@/agents/repair-society-coordinator.md) | Registry corruption triggers repair operations through the mycelial network |

## Operational Characteristics

The Registry Auto agent is designed for high availability and minimal resource consumption. File system event monitoring consumes negligible CPU during idle periods, with processing cost proportional to change frequency. The agent handles edge cases including rapid file creation/deletion cycles, concurrent modifications to the same file, and file system events during registry write operations.

The agent maintains a write-ahead log of pending registry updates, ensuring that synchronization is not lost if the agent process is restarted during an update sequence. Upon restart, the agent replays pending updates and performs a reconciliation scan to detect any changes that occurred during the restart window.

## Enforcement

Registry synchronization complies with the [NO MERCY](@/glossary/no-mercy.md) doctrine: stale registry state is treated as a quality violation requiring immediate correction. The [NO DOUBTS](@/glossary/no-doubts.md) principle mandates that registry state is verified against the file system through reconciliation, not merely assumed to be correct based on event processing. All synchronization events are logged to an immutable audit trail, and synchronization failures trigger immediate alerting through the [telemetry](@/glossary/telemetry.md) infrastructure.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)