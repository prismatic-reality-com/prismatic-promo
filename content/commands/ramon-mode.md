+++
title = "/ramon-mode"
weight = 1990
[extra]
category = "Framework"
description = "Ramon mode guardian for specialized help and assistance"
syntax = "/ramon-mode [options]"
authority = "L2+"
agent = "ramon-mode-guardian"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1112
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ramon-mode", "Ramon", "commands", "Framework", "Prismatic Platform", "Ramon Mode", "Guidance", "Phase"]
tags = ["commands", "framework", "ramon-mode", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ramon-mode - Prismatic Platform"
+++

## Overview

**/ramon-mode** is a production command in the **Framework** category of the Prismatic Platform. It activates a specialized assistance mode named after Ramon, providing guided, patient, step-by-step help for complex platform operations. While the platform's standard command interface assumes familiarity with the 216-command registry and the underlying [AIAD](/glossary/aiad/) architecture, Ramon Mode adapts the interaction style to the user's current needs, offering contextual explanations, safe defaults, and progressive disclosure of advanced features.

This command operates under the **L2+** authority level and is executed by the `ramon-mode-guardian` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The guardian agent monitors the interaction context, detects confusion or uncertainty, and adjusts its guidance level accordingly.

Ramon Mode serves multiple purposes within the platform ecosystem. For new team members, it provides onboarding assistance that would otherwise require synchronous mentoring. For experienced operators working in unfamiliar domains, it provides domain-specific context without requiring them to read extensive documentation. For complex multi-step operations, it provides checkpoint-based guidance that prevents partial completion or misconfiguration.

The fundamental design principle behind Ramon Mode is that the platform should be accessible to operators at all experience levels without compromising its power for experts. Rather than simplifying the platform's capabilities, Ramon Mode adds an adaptive assistance layer that explains, suggests, and validates operations at a depth appropriate to the operator's current context and confidence level.

## Syntax and Usage

```bash
/ramon-mode [options]
```

The command supports activation, configuration, deactivation, and status checking.

```bash
# Activate Ramon Mode
/ramon-mode

# Activate with specific guidance level
/ramon-mode --level guiding

# Activate for specific domain
/ramon-mode --domain quality

# Show Ramon Mode status
/ramon-mode --status

# Deactivate Ramon Mode
/ramon-mode --off

# Activate with teaching focus on a topic
/ramon-mode --teach "mycelial propagation"

# Activate for onboarding a new team member
/ramon-mode --onboarding

# Set checkpoint frequency
/ramon-mode --checkpoints frequent

# Get guided help with quality evolution
/ramon-mode --domain evolution --level guiding

# Guided security audit with safe defaults
/ramon-mode --domain security --level guiding --safe-defaults
```

## Parameters and Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--level` | enum | `suggesting` | Guidance level: `observing`, `suggesting`, `guiding`, `teaching` |
| `--domain` | string | auto | Focus domain for contextual guidance |
| `--teach` | string | none | Topic for teaching mode |
| `--onboarding` | flag | false | Activate onboarding mode |
| `--focus` | string | none | Specific focus area within domain |
| `--safe-defaults` | flag | true | Use safe defaults for all suggestions |
| `--checkpoints` | enum | `normal` | Checkpoint frequency: `minimal`, `normal`, `frequent` |
| `--status` | flag | false | Show current Ramon Mode state |
| `--off` | flag | false | Deactivate Ramon Mode |
| `--verbose` | flag | false | Detailed explanations for every action |
| `--history` | flag | false | Show guidance interaction history |
| `--profile` | string | none | Load a domain-specific guidance profile |
| `--generate-runbook` | string | none | Generate a guided runbook for a specific operation |

### Guidance Levels

| Level | Trigger | Behavior |
|-------|---------|----------|
| **Observing** | User executing commands confidently | Minimal intervention, background monitoring |
| **Suggesting** | User pausing or exploring unfamiliar territory | Contextual suggestions and relevant command hints |
| **Guiding** | User requests help or encounters errors | Step-by-step walkthrough with explanations |
| **Teaching** | New domain or complex multi-step operation | Full tutorial mode with concepts, examples, and validation |

The guidance level can be set explicitly or adjusted dynamically based on the guardian's assessment of the user's interaction patterns. Explicit setting takes precedence over dynamic adjustment.

## Implementation Architecture

The Ramon Mode system operates as an interaction layer between the user and the platform's command infrastructure.

```
             /ramon-mode
                   |
          Context Analyzer
                   |
          +--------+--------+
          |        |        |
       User      Domain    History
       Profile   Detector  Tracker
          |        |        |
          +--------+--------+
                   |
          Guidance Engine
                   |
          +--------+--------+
          |        |        |
       Explain   Suggest   Validate
       Module    Module    Module
          |        |        |
          +--------+--------+
                   |
          Interaction Manager
                   |
          +--------+--------+
          |        |        |
       Progress  Safe     Checkpoint
       Tracker   Defaults  Manager
```

### Execution Phases

**Phase 1 -- Context Assessment**: When activated, Ramon Mode assesses the current context: what the user has been working on, which commands were recently executed, what errors occurred, and which domains are involved. This builds a profile of the user's current needs.

**Phase 2 -- Guidance Configuration**: Based on context assessment, the guidance engine configures itself with appropriate levels of explanation, safe defaults for commands, and checkpoint intervals. The configuration adapts dynamically as the interaction progresses.

**Phase 3 -- Active Guidance**: During active operation, Ramon Mode intercepts command invocations and enriches them with contextual information. Before executing potentially destructive commands, it presents confirmation prompts with clear explanations of consequences. After command execution, it explains results and suggests logical next steps.

**Phase 4 -- Checkpoint Management**: At configured intervals, Ramon Mode creates checkpoints summarizing progress, decisions made, and remaining steps. Checkpoints enable safe resumption if the session is interrupted and provide audit trails for complex operations.

**Phase 5 -- Learning Adaptation**: The guidance engine tracks which explanations the user found helpful versus skipped. Over time, it adjusts its verbosity and focus areas to match the user's learning progression, gradually reducing guidance as expertise grows.

## Examples

### Quality Domain Onboarding

```bash
/ramon-mode --domain quality --level teaching
# Ramon Mode activates and explains:
# "The Prismatic Platform tracks quality across 13 domains. Let me walk you
# through each domain, starting with the most commonly used ones..."
# Proceeds to explain Dialyzer, Credo, Compilation domains with examples
# and interactive exercises
```

### Guided Deployment

```bash
/ramon-mode --domain operations --level guiding --safe-defaults
# Before /deploy staging:
# "This will deploy the current code to staging. I've verified:
#  - Working directory is clean
#  - Quality gates pass
#  - Tests pass
# Shall I proceed with a rolling deployment (safest option)?"
```

### Troubleshooting Assistance

```bash
/ramon-mode --troubleshoot "compilation warnings in prismatic_web" --level teaching
# Identifies the warnings, explains their causes, and walks through
# resolution steps one at a time with validation after each fix
```

### Runbook Generation

```bash
/ramon-mode --generate-runbook "production deployment" --output ./runbooks/deploy.md
# Generates a step-by-step runbook document with checkpoints,
# validation steps, and rollback procedures
```

## Integration with Platform

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/seadf](/commands/seadf/) | Framework | SEADF provides the evolution context for guidance |
| [/quality-gates](/commands/quality-gates/) | Interception | Gates can trigger guided error resolution |
| [/stack](/commands/stack/) | Context | Stack conversation mode provides interaction history |
| [/quality-unified](/commands/quality-unified/) | Peer | Quality commands enriched with explanations |
| [Prismatic Agents](/glossary/prismatic-agents/) | Runtime | Guardian agent coordinates with specialist agents |
| [Telemetry](/glossary/telemetry/) | Monitoring | Guidance effectiveness metrics |
| [NABLA Infinity](/glossary/nabla-infinity/) | Epistemic | Guidance backed by epistemic framework |
| Session Context | State | User progress and preferences persisted across sessions |

## Workflow Integration

Ramon Mode integrates into the platform workflow as an optional assistance overlay:

1. **Onboarding**: For new team members, `--onboarding` mode during their first week provides structured walkthrough covering platform architecture, command registry, quality standards, and development workflow in a progressive sequence.

2. **Domain Exploration**: When entering unfamiliar territory (a new quality domain, a complex deployment procedure, or a multi-step refactoring campaign), domain-specific guidance provides context without requiring extensive documentation reading.

3. **Production Operations**: When performing production-facing operations (deployments, migrations, data modifications), `--safe-defaults` ensures all suggested commands use the most conservative options, preventing accidental data loss or service disruption.

4. **Incident Response**: During incidents, guiding mode provides structured checklists and validation steps, ensuring that incident response follows established procedures even under pressure.

5. **Knowledge Transfer**: Runbook generation captures operational knowledge in executable documents that serve both as reference material and as guided execution scripts.

## NABLA Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Guided operations maintain the same quality standards as direct command execution. Ramon Mode never lowers quality bars -- it helps users reach them.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Guidance is based on platform documentation and operational evidence, not assumptions. Explanations cite specific documentation, configuration, or code examples.

NABLA axiom compliance:

| Axiom | Enforcement |
|-------|-------------|
| **Provenance Mandatory** | Every guidance recommendation traceable to documentation or platform data |
| **Signal Plurality** | Multiple information sources (docs, code, history) inform guidance |
| **Unknown Valid** | Guidance explicitly acknowledges areas of uncertainty |
| **Evidence-Based** | Recommendations backed by empirical data from the platform |
| **Time Decay** | Guidance adapts as user expertise grows; stale guidance refreshed |

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Mode activation | < 2s | ~500ms |
| Context assessment | < 5s | ~2s |
| Guidance generation | < 1s per command | ~200ms per command |
| Checkpoint creation | < 3s | ~1s |
| Runbook generation | < 30s | ~10s |
| History retrieval | < 1s | ~200ms |
| Memory overhead | < 20MB | ~8MB |

Ramon Mode adds minimal overhead to command execution. The guidance generation is designed to be asynchronous -- explanations are prepared while commands execute, so the perceived latency is near-zero for standard operations.

## Related Commands

- [/seadf](/commands/seadf/) - Self-Evolving Autonomous Development Framework control and monitoring
- [/stack](/commands/stack/) - Display complete conversation stack with all frames
- [/stack-utils](/commands/stack-utils/) - Advanced Stack Mode utility commands for maintenance and debugging
- [/quality-unified](/commands/quality-unified/) - Unified quality command with quick, full, pre-commit and CI modes
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/rc1-orchestrate](/commands/rc1-orchestrate/) - Complete RC1 delivery pipeline execution with ROC optimization

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)