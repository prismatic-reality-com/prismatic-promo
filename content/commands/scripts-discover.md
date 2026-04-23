+++
title = "/scripts-discover"
weight = 1410
[extra]
category = "Infrastructure"
description = "AI-powered script discovery, parameter completion and intelligent execution"
syntax = "/scripts-discover [options]"
authority = "L2+"
agent = "scripts-infrastructure-supreme"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1137
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["scripts-discover", "AI-powered", "commands", "Infrastructure", "Prismatic Platform", "Phase", "Script", "Show"]
tags = ["commands", "infrastructure", "scripts-discover", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/scripts-discover - Prismatic Platform"
+++

## Overview

**/scripts-discover** is a production command in the **Infrastructure** category of the Prismatic Platform. It provides AI-powered discovery, documentation, and intelligent execution of shell scripts across the platform's `scripts/` directory and beyond. The command scans script files, extracts their purpose from comments and code analysis, identifies required parameters, suggests default values, and can execute scripts with interactive parameter completion. This transforms a directory of potentially hundreds of undocumented scripts into a navigable, self-documenting toolbox.

This command operates under the **L2+** authority level and is executed by the `scripts-infrastructure-supreme` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The infrastructure-supreme agent has deep knowledge of shell scripting conventions, environment variable patterns, and the platform's operational procedures.

In a platform with 50+ shell scripts covering deployment, testing, validation, data management, and development utilities, remembering script names, their parameters, and their interactions is a significant cognitive burden. `/scripts-discover` eliminates this burden by providing a searchable, categorized, intelligently documented interface to the entire script ecosystem.

Shell scripts represent a unique category of platform infrastructure: they are often the oldest, least documented, and most critical components of an operational workflow. Deployment scripts, database migration helpers, and environment setup tools frequently accumulate over years without formal documentation. The AI-powered documentation generation capability of `/scripts-discover` addresses this documentation debt by analyzing script source code to infer purpose, parameters, and safety characteristics.

## Syntax and Usage

```bash
/scripts-discover [options]
```

The command supports discovery, search, documentation generation, and guided execution.

```bash
# Discover all scripts with descriptions
/scripts-discover

# Search for scripts by keyword
/scripts-discover --search "deploy"

# Show detailed info for specific script
/scripts-discover --info scripts/deploy-dd-data.sh

# Execute script with parameter assistance
/scripts-discover --run scripts/setup-mcp-servers.sh

# List scripts by category
/scripts-discover --category deployment

# Show scripts that need documentation
/scripts-discover --undocumented

# Generate documentation for all scripts
/scripts-discover --generate-docs

# Discover scripts with dependency analysis
/scripts-discover --deps

# Show recently modified scripts
/scripts-discover --recent 7d

# Export script catalog as JSON
/scripts-discover --format json --export ./script-catalog.json

# Find all scripts related to database operations
/scripts-discover --search "database OR migrate OR seed"

# Get guided execution of deployment script
/scripts-discover --run scripts/deploy-production.sh --guided

# Discover scripts that depend on specific environment variables
/scripts-discover --env-var GITLAB_TOKEN
```

## Parameters and Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--search` | string | none | Search scripts by keyword or pattern |
| `--info` | path | none | Show detailed information for specific script |
| `--run` | path | none | Execute script with parameter assistance |
| `--category` | string | all | Filter by category |
| `--format` | enum | `text` | Output format: `text`, `json`, `markdown` |
| `--export` | path | none | Export catalog to file |
| `--undocumented` | flag | false | Show only undocumented scripts |
| `--generate-docs` | flag | false | Generate documentation for scripts |
| `--deps` | flag | false | Include dependency analysis |
| `--recent` | duration | all | Filter by modification time |
| `--unused` | flag | false | Show scripts not recently executed |
| `--env-var` | string | none | Filter by required environment variable |
| `--guided` | flag | false | Interactive guided execution mode |
| `--dry-run` | flag | false | Show what script would do without executing |
| `--verbose` | flag | false | Detailed analysis output |
| `--scan-dirs` | string | `scripts/` | Directories to scan for scripts |
| `--health` | flag | false | Generate health overview of all scripts |
| `--output` | path | none | Output destination for generated docs |

### Script Categories

| Category | Pattern | Examples |
|----------|---------|---------|
| **Deployment** | `deploy-*.sh`, `release-*.sh` | Fly.io deployment, release management |
| **Testing** | `test-*.sh`, `validate-*.sh` | Validation suites, integration tests |
| **Development** | `dev-*.sh`, `setup-*.sh` | Development environment, MCP setup |
| **Data** | `data-*.sh`, `migrate-*.sh` | Data migrations, seed scripts |
| **Quality** | `quality-*.sh`, `check-*.sh` | Quality checks, linting scripts |
| **Infrastructure** | `infra-*.sh`, `docker-*.sh` | Docker builds, infrastructure management |
| **Git** | `git-*.sh` | Git utilities, hooks, tree operations |

## Implementation Architecture

The script discovery system combines static analysis, AI-powered documentation generation, and interactive execution support.

```
             /scripts-discover
                    |
           Script Scanner
                    |
          +--------+--------+
          |        |        |
       Header   Code      Dependency
       Parser   Analyzer   Resolver
          |        |        |
          +--------+--------+
                   |
           AI Documenter
                   |
          +--------+--------+
          |        |        |
       Purpose   Param    Safety
       Extractor Detector  Analyzer
          |        |        |
          +--------+--------+
                   |
          Interactive Executor
                   |
          +--------+--------+
          |        |        |
       Param    Dry-Run   Execute
       Complete  Preview   Monitor
```

### Execution Phases

**Phase 1 -- Script Enumeration**: The command scans the `scripts/` directory and other configured locations for executable shell scripts. Each script is identified by its shebang line, file extension, and executable permissions.

**Phase 2 -- Header Analysis**: Script headers are parsed for documentation comments (lines starting with `#`), extracting purpose descriptions, author information, parameter documentation, and usage examples.

**Phase 3 -- Code Analysis**: The script body is analyzed for parameter usage (`$1`, `$2`, `$@`), environment variable references (`$ENV_VAR`), external command dependencies, file system operations, and network calls. This analysis builds a comprehensive profile of what the script does and what it needs.

**Phase 4 -- AI Documentation**: For scripts lacking adequate documentation, the AI documenter generates purpose descriptions, parameter documentation, and safety assessments based on code analysis. Generated documentation is clearly marked as AI-generated to distinguish it from human-authored documentation.

**Phase 5 -- Interactive Execution**: When executing a script (`--run`), the system presents discovered parameters with descriptions and suggested defaults. The user confirms or modifies each parameter. A dry-run preview shows what the script will do before actual execution.

**Phase 6 -- Catalog Output**: The final catalog is formatted according to the requested format, with scripts organized by category, purpose, and recency. The catalog includes health indicators (documentation quality, last execution, dependency status).

## Examples

### Comprehensive Script Discovery

```bash
/scripts-discover --verbose
# Discovered 52 scripts in scripts/:
#   Deployment: 12 scripts (10 documented, 2 undocumented)
#   Testing: 8 scripts (7 documented, 1 undocumented)
#   Development: 6 scripts (all documented)
#   Quality: 15 scripts (all documented)
#   Git: 5 scripts (all documented)
#   Infrastructure: 6 scripts (4 documented, 2 undocumented)
```

### Guided Deployment Execution

```bash
/scripts-discover --run scripts/deploy-production.sh --guided
# Script: deploy-production.sh
# Purpose: Deploy to production via Fly.io
# Parameters:
#   $1 - Version tag (default: latest) [Enter version]: v2.1.0
#   $FLYCTL_TOKEN - Fly.io authentication token [Set: Yes]
# Safety: MEDIUM - Modifies production environment
# Dry-run output:
#   flyctl deploy --config fly.production.toml --image v2.1.0
# Execute? [y/N]:
```

### Documentation Generation

```bash
/scripts-discover --generate-docs --output ./docs/scripts/ --format markdown
# Generated documentation for 52 scripts:
#   - 47 from existing comments
#   - 5 AI-generated (marked as such)
```

### Environment Variable Audit

```bash
/scripts-discover --env-var GITLAB_TOKEN
# Scripts requiring GITLAB_TOKEN:
#   scripts/deploy-production.sh (deployment)
#   scripts/create-gitlab-issue.sh (development)
#   scripts/ci-quality-check.sh (quality)
```

## Integration with Platform

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/seadf](@/commands/seadf.md) | Framework | Scripts are part of SEADF infrastructure |
| [/ollama](@/commands/ollama.md) | AI Engine | Ollama powers AI documentation generation |
| [Git Trees](@/glossary/git-trees.md) | Infrastructure | Fast script enumeration |
| [Telemetry](@/glossary/telemetry.md) | Monitoring | Script execution tracking |
| [Quality Gates](@/glossary/quality-gates.md) | Enforcement | Script quality standards |
| [GARDEN](@/glossary/garden.md) | Data Source | Legacy scripts from GARDEN repos |
| [/ramon-mode](@/commands/ramon-mode.md) | Guidance | Ramon Mode provides guided execution context |

## Workflow Integration

The /scripts-discover command participates in several platform workflows:

1. **Operational Knowledge Management**: Regular discovery scans (`/scripts-discover --undocumented`) identify documentation debt in the script ecosystem. AI-generated documentation provides a baseline that human operators can refine.

2. **Safe Script Execution**: The guided execution mode (`--run --guided`) ensures that scripts are executed with correct parameters and appropriate safety awareness. This is particularly important for deployment and data modification scripts where incorrect parameters can cause production issues.

3. **CI/CD Documentation**: Generated documentation is committed to the repository as part of the development workflow, ensuring the team's operational knowledge base stays current.

4. **Script Health Monitoring**: The health dashboard (`--health`) provides an overview of script ecosystem health: documentation coverage, execution recency, dependency status, and permission configurations.

5. **Onboarding**: New team members use `/scripts-discover` to understand available operational tooling without reading each script individually. The categorized, searchable catalog accelerates the learning curve.

## NABLA Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Undocumented scripts are flagged for remediation. AI-generated documentation is clearly marked and subject to human review.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Script analysis is based on actual code examination, not filename guessing. Parameter detection uses code analysis, not heuristics.

NABLA axiom compliance:

| Axiom | Enforcement |
|-------|-------------|
| **Provenance Mandatory** | Script source, analysis method, and documentation origin tracked |
| **Signal Plurality** | Multiple analysis methods (header, code, dependency) provide independent signals |
| **Unknown Valid** | AI-generated documentation clearly labeled as inferred, not authoritative |
| **Evidence-Based** | All discoveries based on actual code analysis, not assumptions |
| **Source Independence** | Header analysis and code analysis operate independently |

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| Script enumeration | < 2s | ~500ms |
| Header analysis (all) | < 5s | ~2s |
| Code analysis (all) | < 10s | ~4s |
| AI documentation (per script) | < 5s | ~2s |
| Full discovery | < 30s | ~10s |
| Guided execution setup | < 3s | ~1s |
| Documentation generation (all) | < 60s | ~20s |
| Catalog export | < 5s | ~2s |

The discovery process is optimized for rapid scanning. Git Trees provides fast file enumeration. Header analysis uses simple line parsing for minimal overhead. Code analysis uses regular expressions for parameter and dependency detection, avoiding the overhead of full shell script parsing. AI documentation generation is the most expensive operation but is only invoked for scripts lacking adequate documentation.

## Related Commands

- [/seadf](@/commands/seadf.md) - Self-Evolving Autonomous Development Framework control and monitoring
- [/ollama](@/commands/ollama.md) - Local AI Ollama model management, installation and optimization
- [/gardener](@/commands/gardener.md) - [GARDEN](@/glossary/garden.md) legacy knowledge repository management across 116 repos
- [/agents](@/commands/agents.md) - List and manage agent ecosystem with status monitoring
- [/analyze](@/commands/analyze.md) - System architecture analysis with dependency mapping
- [/integrate](@/commands/integrate.md) - Cross-system integration design and implementation
- [/ramon-mode](@/commands/ramon-mode.md) - Ramon mode guardian for specialized help and assistance

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)