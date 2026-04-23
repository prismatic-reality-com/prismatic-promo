+++
title = "/inject"
weight = 1960
[extra]
category = "Framework"
description = "AIAD injection coordination for pattern and agent deployment"
syntax = "/inject [options]"
authority = "L2+"
agent = "aiad-injection-coordinator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1100
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["inject", "AIAD", "commands", "Framework", "Prismatic Platform", "Artifact", "HARD BLOCK"]
tags = ["commands", "framework", "inject", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/inject - Prismatic Platform"
+++

## Overview

**/inject** is a production command in the **Framework** category of the Prismatic Platform that coordinates the injection of [AIAD](/glossary/aiad/) components -- agents, commands, patterns, policies, and workflows -- into the platform ecosystem. Injection is the controlled process of introducing new or updated AIAD artifacts into the live system, ensuring that each artifact passes validation, integrates correctly with existing components, and is properly indexed in the AIAD registry.

This command operates under the **L2+** authority level and is executed by the `aiad-injection-coordinator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the AIAD (Autonomous Intelligence Agent Design) standard. The injection process is analogous to dependency injection in software architecture: new capabilities are introduced into the system through a controlled interface that validates compatibility and manages lifecycle.

With over 400 agents, 216 commands, and dozens of policies and patterns, the AIAD ecosystem requires careful coordination when adding or modifying components. The `/inject` command ensures that new artifacts do not conflict with existing ones, that naming conventions are followed, that required fields are present, and that the AIAD registry index is updated to reflect the new state.

## Architecture

The injection system operates as a multi-stage pipeline that validates, transforms, registers, and verifies AIAD artifacts.

### Injection Pipeline

```
Artifact Source -> Validator -> Transformer -> Registry Writer -> Verifier -> Indexer
       |               |             |               |               |          |
       v               v             v               v               v          v
  .aiad/ files    Schema Check  Normalization    ETS Insert     Integration  aiad index
  Git commits     Field Check   ID Generation    Disk Write     Test Run     Rebuild
  Templates       Name Check    Cross-ref        Notification   Health Check Complete
```

### Artifact Types

| Type | File Pattern | Registry Location | Key Fields |
|------|-------------|-------------------|------------|
| **Agent** | `*.agent.md` | `.aiad/agents/` | name, level, domain, capabilities |
| **Command** | `*.cmd.md` | `.aiad/commands/` | name, syntax, authority, agent |
| **Policy** | `*.policy.md` | `.aiad/policies/` | name, scope, enforcement level |
| **Pattern** | `*.pattern.md` | `.aiad/patterns/` | name, category, applicability |
| **Workflow** | `*.workflow.md` | `.aiad/workflows/` | name, steps, triggers |
| **Hook** | `*.hook.yaml` | `.aiad/hooks/` | name, event, action |
| **Adapter** | `*.adapter.md` | `.aiad/adapters/` | name, source, target |

### Validation Rules

Every artifact must pass a comprehensive validation before injection is permitted.

| Rule | Enforcement | Description |
|------|-------------|-------------|
| **Schema compliance** | HARD BLOCK | Artifact must match its type's YAML/TOML schema |
| **Unique naming** | HARD BLOCK | No two artifacts of the same type may share a name |
| **Authority level** | HARD BLOCK | Authority level must be valid (L1-L4, SUPREME, P0) |
| **Agent reference** | SOFT WARNING | Referenced agents must exist in registry |
| **Cross-references** | SOFT WARNING | Referenced commands/glossary must exist |
| **Doctrine compliance** | HARD BLOCK | Enforcement block with NM/ND doctrine must be present |

## Usage

```bash
# Inject a new agent definition
/inject agent .aiad/agents/new-specialist.agent.md

# Inject a new command
/inject command .aiad/commands/new-command.cmd.md

# Inject a new policy
/inject policy .aiad/policies/new-policy.policy.md

# Inject all artifacts in a directory
/inject batch .aiad/agents/

# Dry run to validate without injecting
/inject agent new-agent.agent.md --dry-run

# Inject with automatic index rebuild
/inject agent new-agent.agent.md --reindex

# Inject from a template
/inject agent --template=specialist --name="custom-specialist"

# Validate all existing artifacts
/inject validate --all

# Show injection history
/inject history --limit=20

# Rollback last injection
/inject rollback --last
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | required | Artifact type: agent, command, policy, pattern, workflow, hook, adapter |
| `path` | string | required | Path to artifact file or directory for batch |
| `--dry-run` | flag | false | Validate without injecting |
| `--reindex` | flag | true | Rebuild AIAD index after injection |
| `--template` | string | none | Create from template: specialist, commander, coordinator |
| `--name` | string | none | Artifact name (used with --template) |
| `--force` | flag | false | Overwrite existing artifact with same name |
| `--validate-only` | flag | false | Only run validation, do not inject |
| `--all` | flag | false | Validate/inject all artifacts in registry |
| `--format` | string | text | Output format: text, json |
| `--verbose` | flag | false | Show detailed validation output |

## Execution Flow

1. **Artifact Loading**: The specified artifact file is loaded and its YAML/TOML frontmatter is parsed. The artifact type is validated against the file pattern and frontmatter schema.

2. **Schema Validation**: The artifact's fields are checked against the schema for its type. Required fields are verified, field types are checked, and enumerated values are validated.

3. **Uniqueness Check**: The artifact name is checked against all existing artifacts of the same type in the registry. If a conflict is found and `--force` is not specified, injection is blocked.

4. **Cross-Reference Validation**: References to other artifacts (agents referenced by commands, commands referenced in workflows) are validated for existence. Missing references produce warnings but do not block injection.

5. **Doctrine Compliance Check**: The artifact is checked for the mandatory NM/ND enforcement block. Agents, commands, and policies without doctrine compliance metadata are rejected.

6. **Registry Write**: The artifact file is written to its registry location (if not already there) and the registry ETS table is updated with the new artifact metadata.

7. **Index Rebuild**: If `--reindex` is enabled (default), the AIAD index is rebuilt to include the new artifact. This runs `./.aiad/bin/aiad index` which scans all registry directories and updates the composite index.

8. **Post-Injection Verification**: The injected artifact is verified by attempting to resolve it through the registry lookup mechanism. If resolution fails, the injection is rolled back.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `aiad-injection-coordinator` | Manages injection lifecycle |
| [AIAD Registry](/glossary/aiad/) | Target registry | All artifacts injected into AIAD registry |
| [/ecosystem](/commands/ecosystem/) | Status reflection | Ecosystem view updated after injection |
| [/seadf](/commands/seadf/) | Evolution integration | New artifacts feed SEADF evolution |
| [Quality Gates](/glossary/quality-gates/) | Validation | Injection blocked if quality gates fail |
| [Telemetry](/glossary/telemetry/) | Event tracking | Injection events tracked for audit |
| [/agents](/commands/agents/) | Agent listing | New agents appear in agent listings |
| [Git Trees](/commands/git-trees/) | File discovery | Used to locate artifact files |

## Best Practices

**Always dry-run first.** Use `--dry-run` before injecting any new artifact to catch validation errors, naming conflicts, and cross-reference issues without modifying the registry.

**Use templates for consistency.** The `--template` option generates artifacts with correct structure and mandatory fields pre-populated. Templates enforce naming conventions and reduce manual errors.

**Inject incrementally.** When adding multiple related artifacts (e.g., a new agent with its associated commands), inject them one at a time to isolate any issues. Batch injection is convenient but makes debugging harder.

**Validate the entire registry periodically.** Run `/inject validate --all` to check for drift in existing artifacts. Schema changes, renamed references, and deprecated fields are caught by periodic full validation.

**Keep the index current.** The AIAD index must be rebuilt after any injection. The default `--reindex` flag handles this, but if you bypass it for performance, remember to manually run `./.aiad/bin/aiad index` before relying on registry lookups.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `schema_validation_failed` | Artifact does not match type schema | Fix the artifact file according to schema requirements |
| `name_conflict` | Artifact name already exists in registry | Use `--force` to overwrite or choose a different name |
| `missing_required_field` | Required frontmatter field is absent | Add the missing field to the artifact |
| `invalid_authority_level` | Authority level not recognized | Use valid levels: L1, L2, L2+, L3, L3+, L4, SUPREME, P0 |
| `doctrine_compliance_missing` | NM/ND enforcement block not present | Add the mandatory enforcement YAML block |
| `cross_reference_not_found` | Referenced artifact does not exist | Create the referenced artifact or fix the reference |
| `index_rebuild_failed` | AIAD index command failed | Run `./.aiad/bin/aiad index` manually and check for errors |

## Advanced Usage

### Artifact Templates

Create new artifacts from predefined templates.

```bash
# Create a specialist agent
/inject agent --template=specialist --name="custom-analysis-specialist"

# Create a commander agent
/inject agent --template=commander --name="custom-operations-commander"

# Create a command definition
/inject command --template=standard --name="custom-operation"
```

### Batch Injection from CI/CD

Integrate artifact injection into the CI/CD pipeline for automated deployment.

```bash
# Validate all artifacts in CI
/inject validate --all --format=json --output=validation-report.json

# Inject updated artifacts
/inject batch .aiad/agents/ --force --reindex
```

### Artifact Migration

Migrate artifacts between schema versions.

```bash
# Check for schema version mismatches
/inject validate --all --check-schema-version

# Migrate artifacts to new schema
/inject migrate --from=v1 --to=v2 --dry-run
/inject migrate --from=v1 --to=v2 --apply
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every injected artifact must pass validation. No artifact enters the registry without schema compliance and doctrine enforcement.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Dry-run validation provides complete diagnostic output before any registry modification occurs.

## Related Commands

- [/seadf](/commands/seadf/) - Self-Evolving Autonomous Development Framework control and monitoring
- [/ecosystem](/commands/ecosystem/) - Platform ecosystem overview and status monitoring
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/integrate](/commands/integrate/) - Cross-system integration design and implementation
- [/migrate](/commands/migrate/) - Safe migration planning with rollback strategies

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)