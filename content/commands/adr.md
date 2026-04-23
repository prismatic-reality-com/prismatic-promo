+++
title = "/adr"
weight = 1280
[extra]
category = "Documentation"
description = "Create and manage Architecture Decision Records for documenting significant decisions"
syntax = "/adr [options]"
authority = "L2+"
agent = "architecture-decision-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1138
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["adr", "Create", "Architecture", "Decision", "Records", "commands", "Documentation", "Prismatic Platform", "ADRs"]
tags = ["commands", "documentation", "adr", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/adr - Prismatic Platform"
+++

## Overview

The **/adr** command provides a structured system for creating and managing Architecture Decision Records (ADRs) within the Prismatic Platform. ADRs are the canonical mechanism for documenting significant architectural decisions, capturing the context that motivated each decision, the rationale behind the chosen approach, and the anticipated consequences -- both positive and negative. In a platform of over 100 umbrella applications, 400+ agents, and 210+ commands, maintaining a traceable record of why the architecture evolved in specific directions is essential for long-term maintainability and institutional knowledge preservation.

Architecture decisions in complex systems are rarely reversible without significant cost. The `/adr` command addresses this reality by enforcing a disciplined documentation practice that goes beyond simple notes or comments. Each ADR follows a standardized template with mandatory sections for status tracking, decision context, the decision itself, and categorized consequences. This structured approach ensures that future developers and architects can reconstruct the reasoning behind any significant architectural choice, even years after the original decision was made.

The command is executed by the `architecture-decision-specialist` agent, which brings domain expertise in architectural patterns, [Elixir](@/glossary/elixir.md)/OTP design principles, and the Prismatic Platform's specific architectural conventions. The agent ensures that ADRs are not merely bureaucratic artifacts but genuinely useful documents that capture the nuanced trade-offs inherent in architectural decisions. ADRs produced by this command integrate with the platform's broader documentation ecosystem and are stored in a dedicated directory with consistent naming conventions for easy discovery and cross-referencing.

## Usage

```bash
/adr [ACTION] [TITLE or ID]
```

### Create a New Architecture Decision Record

```bash
/adr new "Use PostgreSQL for primary storage"
```

### List All Existing ADRs

```bash
/adr list
```

### Display a Specific ADR by ID

```bash
/adr show 0015
```

### Supersede an Existing ADR with a New One

```bash
/adr supersede 0012 0018
```

### Deprecate an ADR That Is No Longer Relevant

```bash
/adr deprecate 0007
```

### Check the Status of All ADRs

```bash
/adr status
```

## Options and Parameters

| Parameter | Position | Required | Type | Description |
|-----------|----------|----------|------|-------------|
| `action` | 1 | Yes | string | Action to perform: `new`, `list`, `show`, `supersede`, `deprecate`, `status` |
| `title_or_id` | 2 | Conditional | string | ADR title (for `new`) or numeric ID (for `show`, `supersede`, `deprecate`) |
| `superseding_id` | 3 | Conditional | string | ID of the new ADR that supersedes the old one (only for `supersede` action) |

### Action Descriptions

| Action | Purpose | Example |
|--------|---------|---------|
| `new` | Create a new ADR with full template and metadata | `/adr new "Adopt ETS for session caching"` |
| `list` | Display all ADRs sorted by ID with status indicators | `/adr list` |
| `show` | Render a specific ADR with full content and cross-references | `/adr show 0023` |
| `supersede` | Mark an old ADR as superseded and link to its replacement | `/adr supersede 0010 0025` |
| `deprecate` | Mark an ADR as deprecated with deprecation context | `/adr deprecate 0005` |
| `status` | Overview of all ADRs grouped by status (proposed, accepted, deprecated, superseded) | `/adr status` |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ (Operational and above) |
| **Executing Agent** | `architecture-decision-specialist` |
| **Status** | Production |
| **Usage Frequency** | Medium |
| **Category** | Documentation |
| **Model** | claude-sonnet-4-20250514 |
| **Tools** | Read, Write, Edit, Bash, Grep, Glob |
| **Output Location** | `docs/architecture/decisions/` |
| **Naming Convention** | `XXXX-title-in-kebab-case.md` |

## Technical Implementation

The ADR command handler manages the full lifecycle of architecture decision records. When creating a new ADR, the agent scans the existing `docs/architecture/decisions/` directory to determine the next sequential ID, generates the complete template with all mandatory sections, and writes the file with proper kebab-case naming. The implementation follows the platform's standard `{:ok, result} / {:error, reason}` pattern for all operations.

```elixir
defmodule PrismaticArchitecture.ADR.Command do
  @moduledoc """
  Architecture Decision Record command handler.
  Creates, manages, and tracks ADRs with full lifecycle support.
  """

  @adr_directory "docs/architecture/decisions/"

  @spec new(String.t()) :: {:ok, String.t()} | {:error, term()}
  def new(title) do
    next_id = get_next_adr_id()
    filename = format_filename(next_id, title)
    content = generate_adr_template(next_id, title)

    case File.write(Path.join(@adr_directory, filename), content) do
      :ok -> {:ok, filename}
      {:error, reason} -> {:error, {:write_failed, reason}}
    end
  end

  @spec list() :: {:ok, [map()]}
  def list do
    adrs =
      @adr_directory
      |> File.ls!()
      |> Enum.filter(&String.ends_with?(&1, ".md"))
      |> Enum.sort()
      |> Enum.map(&parse_adr_summary/1)

    {:ok, adrs}
  end

  @spec supersede(String.t(), String.t()) :: {:ok, map()} | {:error, term()}
  def supersede(old_id, new_id) do
    with {:ok, old_path} <- find_adr_by_id(old_id),
         {:ok, new_path} <- find_adr_by_id(new_id),
         :ok <- update_status(old_path, "Superseded by ADR-#{new_id}"),
         :ok <- add_supersedes_reference(new_path, old_id) do
      {:ok, %{old: old_path, new: new_path, status: :superseded}}
    end
  end
end
```

The ADR template structure enforces consistency across all records. Every ADR includes the following mandatory sections: Status (with lifecycle tracking), Context (the motivating problem), Decision (the chosen approach), Consequences (positive and negative), and Related Decisions (cross-references to other ADRs). This structure ensures that each record is self-contained and provides sufficient context for understanding the decision without requiring access to external documents or tribal knowledge.

### ADR Template Structure

```markdown
# ADR-XXXX: Title

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-YYYY]

## Context
[What is the issue that we're seeing that motivates this decision?]

## Decision
[What is the change that we're proposing and/or doing?]

## Consequences
### Positive
- [Consequence 1]
- [Consequence 2]

### Negative
- [Consequence 1]
- [Consequence 2]

## Related Decisions
- ADR-XXXX: [Title]
```

## Workflow Integration

The `/adr` command integrates naturally into the platform's development lifecycle at several key decision points. When proposing new applications to the umbrella, when selecting storage backends, when changing authentication mechanisms, or when introducing new infrastructure dependencies, creating an ADR ensures the decision is documented before implementation begins.

ADRs are particularly valuable during code review. When a reviewer questions an architectural choice, referencing the relevant ADR provides immediate access to the original context and rationale. This reduces review friction and prevents re-litigation of decisions that were carefully considered and documented.

The command should be invoked early in the decision-making process -- ideally when a decision is still in the "Proposed" state. This allows team members to review the ADR, provide feedback, and contribute additional context before the decision is accepted and implementation begins. The `status` action provides a dashboard view of all pending proposals, enabling effective architectural governance.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `architecture-decision-specialist` agent |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution quality validation |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) and event tracking |
| Documentation Ecosystem | ADRs stored in `docs/architecture/decisions/` alongside architectural diagrams |
| [Session Context](@/glossary/session-discipline.md) | ADR operations logged in session context for continuity |
| [/architect](@/commands/architect.md) | Architecture design recommendations reference existing ADRs |
| [/analyze](@/commands/analyze.md) | Architecture analysis surfaces related ADR decisions |

## Doctrine Compliance

All ADR command operations are governed by the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Every significant architectural decision must be documented. No exceptions, no shortcuts. ADRs must include all mandatory sections. Incomplete records are rejected. The `new` action validates template completeness before writing. Decisions without documented consequences are not accepted.
- **NO DOUBTS**: Full investigation of context before documenting decisions. The `architecture-decision-specialist` agent verifies that the stated context accurately reflects the problem space, that the decision addresses the stated context, and that consequences are realistically assessed. Evidence-based rationale is required -- assertions without supporting evidence are flagged for revision.

The ADR system also supports the platform's [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework through its Provenance Mandatory axiom: every architectural belief encoded in the platform must be traceable to a documented decision with explicit rationale.

## Best Practices

1. **Create ADRs proactively**: Document decisions when they are being discussed, not after implementation is complete. The "Proposed" status exists for a reason -- use it to gather feedback before committing to an approach.

2. **Be explicit about consequences**: The most valuable part of an ADR is often the "Negative Consequences" section. Being honest about trade-offs helps future architects understand constraints and informs potential future supersessions.

3. **Cross-reference liberally**: When a new ADR relates to or builds upon existing decisions, link them explicitly in the "Related Decisions" section. This creates a navigable decision graph that reveals the evolution of architectural thinking.

4. **Supersede rather than edit**: When an architectural decision is revised, create a new ADR that supersedes the old one rather than editing the original. This preserves the historical record and makes the evolution of thinking visible.

5. **Use status tracking for governance**: Regularly run `/adr status` to review all ADRs grouped by status. Proposed ADRs awaiting review should not linger indefinitely -- either accept them or reject them with documented rationale.

6. **Keep context concise but complete**: The Context section should provide enough information for someone unfamiliar with the project to understand why the decision was necessary. Avoid jargon without definition and include references to relevant technical constraints.

## Related Commands

- [/architect](@/commands/architect.md) - Architecture design and recommendation generation
- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping
- [/chronic](@/commands/chronic.md) - Chronic documentation scan and technical hygiene maintenance
- [/find-lowfruit](@/commands/find-lowfruit.md) - Identify low-hanging fruit improvements across codebase
- [/scan-mycelium](@/commands/scan-mycelium.md) - Mycelial pattern scanning across documentation and code
- [/fix](@/commands/fix.md) - Bug fix implementation with mandatory [regression tests](@/capabilities/regression-tests.md)
- [/refactor](@/commands/refactor.md) - Safe refactoring with zero-regression guarantee

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)