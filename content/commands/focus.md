+++
title = "/focus"
weight = 840
[extra]
category = "Architecture"
description = "Strategic focus management and priority coordination"
syntax = "/focus [options]"
authority = "L3"
agent = "focus-coordinator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1218
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["focus", "Strategic", "commands", "Architecture", "Prismatic Platform", "GitLab"]
tags = ["commands", "architecture", "focus", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/focus - Prismatic Platform"
+++

## Overview

**/focus** is a production command in the **Architecture** category of the Prismatic Platform. It provides strategic focus management and priority coordination, enabling teams and agents to align their efforts on the highest-impact objectives while maintaining awareness of the broader platform context. In a system with 100+ applications, 434 agents, and multiple active milestones, maintaining strategic focus is essential for effective resource allocation and delivery.

The challenge of focus in complex systems is well-documented in software engineering literature. Conway's Law predicts that organizations produce systems mirroring their communication structures, but the inverse also holds: complex systems create communication overhead that diffuses focus across too many concerns. The `/focus` command counteracts this diffusion by establishing clear priority hierarchies, tracking active focus areas, and surfacing context switches that dilute strategic impact.

The focus-coordinator agent manages focus state across the platform, maintaining a priority stack that reflects current strategic objectives, active milestones, and resource constraints. The agent integrates with GitLab milestone tracking, [SEADF](/glossary/seadf/) evolution priorities, and the [quality gates](/glossary/quality-gates/) enforcement system to ensure that focus decisions are informed by the platform's actual state rather than assumptions.

This command operates under the **L3** authority level, reflecting its strategic governance role. Focus decisions affect resource allocation across the platform and can redirect agent priorities, making L3 authority appropriate for the scope of impact. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The focus management system operates through a priority stack architecture with context tracking:

```
Strategic Objectives --> Priority Ranker --> Focus Stack --> Agent Alignment
        |                      |                |                  |
   GitLab Milestones     Impact Scoring    Priority Queue     Agent Registry
   Quality State         Urgency Eval      Focus Windows      Task Assignment
   Resource Inventory    Dependency Map     Context Tracker    Progress Monitor
        \                      |                /                  |
         --> Focus State Manager --> Context Switch Detector --> Dashboard
                     |
              Session Integration
              (stack-based conversation)
```

**Priority Ranker**: Evaluates candidate focus areas using a multi-dimensional scoring model that considers strategic impact (alignment with active milestones), urgency (deadline proximity, blocking dependencies), effort-to-impact ratio, and current resource availability. The ranker produces an ordered priority list.

**Focus Stack**: Maintains the active focus priority stack. The stack operates on a LIFO basis for interruptions (urgent items push onto the stack) with explicit pop operations when items are completed or deprioritized. The stack provides the definitive answer to "what should we be working on right now?"

**Context Switch Detector**: Monitors for unplanned context switches -- situations where work diverges from the declared focus without explicit justification. Context switches are not prohibited but they are tracked and surfaced, making the cost of distraction visible.

**Agent Alignment**: Translates focus decisions into agent-level task assignments. When focus shifts, the alignment system communicates new priorities to affected agents through the AIAD agent registry.

## Usage

### Focus Management

```bash
# Show current focus state
/focus

# Set primary focus
/focus --set="MVP Prismatic Perimeter security validation"

# Push an urgent item onto focus stack
/focus --push="Critical: production security patch" --urgency=P0

# Pop completed focus item
/focus --pop

# List focus stack
/focus --stack
```

### Strategic Alignment

```bash
# Align focus with active milestones
/focus --align-milestones

# Focus on a specific milestone
/focus --milestone=M46

# Show focus-milestone alignment status
/focus --alignment-status --format=table
```

### Analysis and Reporting

```bash
# Analyze context switch frequency
/focus --context-switches --period=7d

# Generate focus effectiveness report
/focus --report --format=markdown

# Show focus history
/focus --history --last=10

# Identify focus drift (work diverging from declared focus)
/focus --drift-analysis --verbose
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--set` | string | none | Set primary focus area |
| `--push` | string | none | Push urgent item onto focus stack |
| `--pop` | flag | false | Pop top item from focus stack |
| `--stack` | flag | false | Display current focus stack |
| `--urgency` | string | P2 | Urgency level for pushed items (P0, P1, P2, P3) |
| `--milestone` | string | none | Align focus with specific GitLab milestone |
| `--align-milestones` | flag | false | Auto-align focus with active milestones |
| `--alignment-status` | flag | false | Show focus-milestone alignment |
| `--context-switches` | flag | false | Analyze context switch frequency |
| `--period` | string | 7d | Time period for analysis |
| `--report` | flag | false | Generate focus effectiveness report |
| `--history` | flag | false | Show focus state history |
| `--last` | integer | 5 | Number of historical entries |
| `--drift-analysis` | flag | false | Detect work diverging from declared focus |
| `--format` | string | text | Output format (text, json, table, markdown) |
| `--verbose` | flag | false | Include detailed analysis |
| `--broadcast` | flag | false | Broadcast focus change to all agents |

## Execution Flow

The `/focus` command follows a structured 5-phase focus management pipeline:

1. **State Assessment**: The current focus state is loaded from the focus stack, including active priorities, milestone alignment, and resource allocation. Recent context switch history is retrieved for pattern analysis.

2. **Priority Evaluation**: If a focus change is requested, the new priority is evaluated against the existing stack. The evaluator considers impact, urgency, dependencies, and resource availability. Conflicting priorities are surfaced for explicit resolution.

3. **Impact Analysis**: Focus changes are analyzed for downstream impact. Shifting focus away from an active milestone may delay delivery. Pushing an urgent item may preempt lower-priority work. The analysis quantifies these trade-offs.

4. **State Update**: The focus stack is updated to reflect the new priority state. Focus changes are logged with timestamps, justifications, and impact assessments for historical analysis.

5. **Alignment Broadcast**: Focus changes are optionally broadcast to affected agents through the AIAD registry. Agents adjust their task priorities based on the new focus state.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Alignment | Agent task priority adjustment based on focus |
| GitLab API | Milestones | Milestone alignment and progress tracking |
| Stack Conversation | Session | Focus state integrated with conversation stack |
| [SEADF](/glossary/seadf/) | Framework | Evolution priority alignment with focus |
| [Quality Gates](/glossary/quality-gates/) | Context | Quality state influences focus priorities |
| [Telemetry](/glossary/telemetry/) | Monitoring | Focus change [metrics](/glossary/metrics/) and context switch tracking |
| AIAD Registry | Discovery | Command specification and agent binding |
| [Quality DNA](/glossary/quality-dna/) | Persistence | Focus state history across sessions |

## Best Practices

**Limit active focus to 3 items maximum**: Research on multitasking consistently shows that focus beyond 3 concurrent items degrades all of them. Use the focus stack to manage priorities sequentially rather than expanding the active set.

**Align focus with milestone deadlines**: Use `--align-milestones` at session start to ensure that declared focus matches the most urgent milestone requirements. Misalignment between focus and milestones is a leading cause of missed deadlines.

**Track context switches explicitly**: Every context switch has a cost -- typically 15-30 minutes of cognitive reloading. Use `--context-switches` to quantify the total cost and identify patterns (e.g., recurring interruptions from specific sources).

**Pop completed items promptly**: Completed focus items that remain on the stack create cognitive overhead. Pop them immediately to maintain a clean, accurate focus state.

**Use P0 urgency sparingly**: Overuse of P0 urgency dilutes its meaning. Reserve P0 for genuine emergencies (production outages, security incidents) and use P1-P3 for normal priority management.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `FOCUS_STACK_OVERFLOW` | Too many items pushed without popping | Pop completed items; consolidate related priorities |
| `MILESTONE_NOT_FOUND` | Referenced milestone does not exist in GitLab | Verify milestone ID; check GitLab project configuration |
| `ALIGNMENT_CONFLICT` | Requested focus conflicts with mandatory milestone priorities | Resolve conflict explicitly; P0 milestones take precedence |
| `BROADCAST_FAILED` | Agent alignment broadcast did not reach all agents | Retry broadcast; check agent registry connectivity |
| `DRIFT_DETECTION_INSUFFICIENT_DATA` | Not enough session data for drift analysis | Accumulate more session history before analysis |

## Advanced Usage

### Focus Templates

```bash
# Apply a predefined focus template for sprint planning
/focus --template=sprint-start --milestone=M47

# Apply a focus template for incident response
/focus --template=incident-response --urgency=P0

# Create a custom focus template
/focus --save-template="security-audit" \
  --items="perimeter-scan,compliance-check,vulnerability-assessment"
```

### Cross-Session Focus Continuity

```bash
# Restore focus state from previous session
/focus --restore-from-session --latest

# Compare current focus with last session's focus
/focus --compare-sessions --format=table
```

### Team Focus Coordination

```bash
# Show focus alignment across all active agents
/focus --team-alignment --format=table

# Identify agents working outside declared focus
/focus --off-focus-agents --verbose
```

The focus management system integrates with the platform's stack-based conversation mode, ensuring that focus context is preserved across conversation frames and that focus changes are reflected in the active stack.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for unfocused work. Every active work item must align with a declared focus priority. Work outside the declared focus is tracked as context switches with associated cost metrics. No drift goes unnoticed.
- **NO DOUBTS**: Focus decisions are evidence-based. Priority rankings use quantified impact scores, milestone urgency analysis, and resource availability data. The system never guesses about priorities -- it evaluates them against objective criteria.

Strategic focus is the mechanism by which the NO MERCY doctrine's "Complete execution" principle is operationalized. By ensuring that resources are concentrated on the highest-priority objectives, the `/focus` command prevents the dilution that leads to incomplete delivery across too many fronts.

## Related Commands

- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/architect](/commands/architect/) - Architecture design and recommendation generation
- [/migrate](/commands/migrate/) - Safe migration planning with rollback strategies
- [/code](/commands/code/) - Core coding implementation and feature development
- [/fix](/commands/fix/) - Bug fix implementation with mandatory [regression tests](/capabilities/regression-tests/)
- [/refactor](/commands/refactor/) - Safe refactoring with zero-regression guarantee
- [/estimate](/commands/estimate/) - Task estimation with AI-powered complexity analysis
- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)