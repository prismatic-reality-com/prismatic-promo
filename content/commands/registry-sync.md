+++
title = "/registry-sync"
weight = 2070
[extra]
category = "Framework"
description = "AIAD registry synchronization and indexing"
syntax = "/registry-sync [options]"
authority = "L2+"
agent = "registry-sync-specialist"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1122
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["registry-sync", "AIAD", "commands", "Framework", "Prismatic Platform", "Step", "Component"]
tags = ["commands", "framework", "registry-sync", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/registry-sync - Prismatic Platform"
+++

## Overview

**/registry-sync** is a production command in the **Framework** category of the Prismatic Platform that performs [AIAD](/glossary/aiad/) registry synchronization and indexing operations. The AIAD registry is the platform's central catalog of all agents, commands, pipelines, policies, and adapters. This command ensures that the registry accurately reflects the current state of all AIAD components across the codebase, resolving discrepancies between filesystem artifacts and the runtime registry.

In a platform with over 400 agents, 210 commands, and numerous pipelines and policies, the registry can drift from the actual filesystem state through several mechanisms: new components added without indexing, component files modified without registry updates, components removed without corresponding registry cleanup, or cross-references that become stale after rename operations. The `/registry-sync` command detects and resolves all of these drift scenarios through a comprehensive reconciliation process.

The synchronization process operates bidirectionally. It scans the filesystem for AIAD component files (`.agent.md`, `.cmd.md`, `.pipeline.md`, `.policy.md`, `.adapter.md`) and compares them against the current registry state. New files trigger registry additions, missing files trigger registry removals, and modified files trigger registry updates. The indexing phase then rebuilds all cross-reference indexes, enabling fast lookup by name, category, authority level, status, and other metadata fields.

This command operates under the **L2+** authority level and is executed by the `registry-sync-specialist` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the AIAD (Autonomous Intelligence Agent Design) standard.

## Architecture

The registry synchronization system implements a three-phase architecture that separates discovery, reconciliation, and indexing concerns.

```
Filesystem Scan (.aiad/)
    |
    v
[Discovery Phase]
    +---> Agent Files (.aiad/agents/*.agent.md)
    +---> Command Files (.aiad/commands/*.cmd.md)
    +---> Pipeline Files (.aiad/pipelines/*.pipeline.md)
    +---> Policy Files (.aiad/policies/*.policy.md)
    +---> Adapter Files (.aiad/adapters/*.adapter.md)
    |
    v
[Reconciliation Phase]
    +---> Compare filesystem state vs registry state
    +---> Identify: New, Modified, Removed, Stale
    +---> Apply changes (add, update, remove)
    |
    v
[Indexing Phase]
    +---> Name Index (fast lookup by component name)
    +---> Category Index (group by functional category)
    +---> Authority Index (group by authority level)
    +---> Cross-Reference Index (inter-component relationships)
    +---> Status Index (production, development, deprecated)
    |
    v
Registry Synchronized
```

The registry itself is persisted in two formats: a human-readable markdown file (`.claude/AGENT_REGISTRY.md` and `.claude/COMMAND_REGISTRY.md`) for documentation purposes, and an ETS table for fast runtime access. The synchronization process updates both representations atomically to prevent inconsistency.

## Usage

```bash
# Full registry synchronization
/registry-sync

# Sync with verbose output showing all changes
/registry-sync --verbose

# Sync only agents (skip commands, pipelines, etc.)
/registry-sync --type=agents

# Sync only commands
/registry-sync --type=commands

# Dry-run to preview changes without applying
/registry-sync --dry-run

# Sync with validation of all cross-references
/registry-sync --validate-refs

# Sync and generate updated registry documentation
/registry-sync --generate-docs

# Force full rebuild of all indexes
/registry-sync --rebuild-indexes

# Sync specific component by name
/registry-sync --component=archer-supreme
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--type` | enum | all | Component type to sync: `agents`, `commands`, `pipelines`, `policies`, `adapters`, `all` |
| `--verbose` | boolean | false | Show detailed change log during synchronization |
| `--dry-run` | boolean | false | Preview changes without applying them |
| `--validate-refs` | boolean | false | Validate all cross-references between components |
| `--generate-docs` | boolean | false | Regenerate registry documentation files |
| `--rebuild-indexes` | boolean | false | Force complete index rebuild |
| `--component` | string | - | Sync a specific component by name |
| `--fix-stale` | boolean | false | Automatically fix stale cross-references |
| `--report` | boolean | false | Generate detailed synchronization report |
| `--format` | enum | text | Output format: `text`, `json`, `markdown` |
| `--prune` | boolean | false | Remove orphaned registry entries |
| `--check-only` | boolean | false | Check for drift without making changes |

## Execution Flow

The registry synchronization follows a carefully ordered execution flow that ensures consistency at every stage.

**Step 1 - Current Registry Load**: The existing registry state is loaded from the ETS table (or from the markdown files if ETS is unavailable). This provides the "expected" state against which the filesystem will be compared.

**Step 2 - Filesystem Discovery**: The `.aiad/` directory tree is scanned recursively for all component files matching the known file extensions. Each discovered file is parsed to extract its metadata: name, type, category, authority level, status, and cross-references.

**Step 3 - Delta Computation**: The discovered filesystem state is compared against the loaded registry state. The comparison produces four categories of changes: new components (present on filesystem but not in registry), modified components (present in both but with different metadata), removed components (present in registry but not on filesystem), and stale components (present in both but with broken cross-references).

**Step 4 - Change Application**: Changes are applied in a specific order to maintain referential integrity. Additions are processed first (so that new cross-reference targets exist), then modifications, then removals. Each change is logged for audit purposes.

**Step 5 - Index Rebuild**: All indexes are rebuilt from the updated registry state. The name index enables O(1) lookup by component name. The category index groups components by functional category. The cross-reference index maps dependencies between components.

**Step 6 - Documentation Generation**: When enabled, the markdown registry files are regenerated from the updated registry state, ensuring that documentation stays synchronized with runtime state.

**Step 7 - Validation**: A final validation pass confirms that all cross-references resolve, all required metadata fields are populated, and no orphaned entries remain.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `registry-sync-specialist` | Specialized in AIAD registry management |
| [AIAD](/glossary/aiad/) Standard | Component specification | Defines the structure for all registered components |
| `.aiad/bin/aiad index` | CLI equivalent | Shell script for registry indexing |
| [AGENT_REGISTRY.md](/glossary/registry-otp/) | Documentation output | Human-readable agent catalog |
| COMMAND_REGISTRY.md | Documentation output | Human-readable command catalog |
| [/inject](/commands/inject/) | Component deployment | Inject deploys components; registry-sync indexes them |
| [/seadf](/commands/seadf/) | Framework integration | SEADF triggers registry-sync during evolution cycles |
| [Telemetry](/glossary/telemetry/) | Operation tracking | Sync operations emit telemetry events |

## Best Practices

Run registry synchronization after any batch addition or removal of AIAD components. While individual component changes are typically handled by the relevant deployment commands, bulk operations (such as importing a new agent category or deprecating a set of commands) require explicit synchronization to ensure registry consistency.

Use `--dry-run` before applying synchronization in automated pipelines. The dry-run output reveals exactly what changes will be made, enabling review before commitment. This is particularly important in CI/CD pipelines where unexpected registry changes could indicate a configuration error.

Enable `--validate-refs` regularly (at least weekly) to detect cross-reference drift before it accumulates. Stale cross-references between agents and commands, or between commands and pipelines, can cause runtime errors when the platform attempts to resolve a dependency chain.

Use the `--check-only` flag in pre-commit hooks to prevent commits that would introduce registry drift. This flag returns a non-zero exit code if the filesystem state differs from the registry, blocking the commit until synchronization is performed.

## Error Handling

Registry synchronization errors are categorized by severity and handled accordingly. Parse errors in individual component files are reported as warnings but do not halt the overall synchronization. This ensures that a single malformed file does not prevent the rest of the registry from being updated.

Cross-reference validation errors are reported with full context including the referring component, the missing target, and the file locations involved. When `--fix-stale` is enabled, the engine attempts to resolve stale references by searching for renamed or relocated components.

```
REGISTRY-SYNC REPORT
Scanned: 403 agents, 210 commands, 15 pipelines, 22 policies
Changes:
  Added: 3 agents (vision-analyzer, security-rating-engine, compliance-checker)
  Modified: 1 command (perimeter updated authority L2+ -> L3)
  Removed: 0
  Stale refs: 2
    - red-commander references missing agent: red-stealth-specialist
    - quality-enforce references deprecated policy: quality-v1
Warnings: 1 parse error in .aiad/agents/malformed.agent.md (line 15: missing required field 'authority')
Status: SYNCHRONIZED with 2 stale reference warnings
```

## Advanced Usage

Advanced registry operations support custom component types, registry migration between versions, and integration with external catalog systems.

```bash
# Registry diff between branches
/registry-sync --diff=main..feature/new-agents

# Export registry to external catalog format
/registry-sync --export=openapi --output=/tmp/registry-api.json

# Import components from external AIAD-compatible source
/registry-sync --import=/path/to/external-components/ --validate

# Registry statistics and health report
/registry-sync --stats --health-check

# Rebuild registry from scratch (destructive)
/registry-sync --full-rebuild --confirm
```

The `--diff` mode is particularly useful during code review, showing exactly which registry changes a feature branch introduces. This enables reviewers to understand the operational impact of a branch beyond its code changes.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Registry synchronization processes every component file without exception. Parse errors are reported but do not prevent the rest of the synchronization from completing to ensure maximum registry accuracy.
- **NO DOUBTS**: Full investigation before action, evidence-based results. The reconciliation phase performs exhaustive comparison between filesystem and registry state. Every change is documented with its source evidence, and the validation phase confirms the registry's internal consistency.

## Related Commands

- [/seadf](/commands/seadf/) - Self-Evolving Autonomous Development Framework control and monitoring
- [/rc1-orchestrate](/commands/rc1-orchestrate/) - Complete RC1 delivery pipeline execution with ROC optimization
- [/inject](/commands/inject/) - AIAD injection coordination for pattern and agent deployment
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/migrate](/commands/migrate/) - Safe migration planning with rollback strategies
- [/integrate](/commands/integrate/) - Cross-system integration design and implementation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)