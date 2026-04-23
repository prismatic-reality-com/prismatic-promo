+++
title = "/garden-analyze"
weight = 1330
[extra]
category = "Infrastructure"
description = "Deep analysis of garden repositories with pattern detection and architecture assessment"
syntax = "/garden-analyze [options]"
authority = "L2+"
agent = "garden-analyzer"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1285
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["garden-analyze", "Deep", "commands", "Infrastructure", "Prismatic Platform", "GARDEN", "Analysis", "TypeScript"]
tags = ["commands", "infrastructure", "garden-analyze", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/garden-analyze - Prismatic Platform"
+++

## Overview

**/garden-analyze** is a production command in the **Infrastructure** category of the Prismatic Platform. It performs deep analysis of [GARDEN](/glossary/garden/) repositories with pattern detection and architecture assessment, extracting actionable knowledge from 20+ years of development history across 116 repositories. The command transforms legacy codebases into structured intelligence that informs current platform development.

The GARDEN (Global Archive of Reusable Design and Engineering kNowledge) system represents a unique asset in the Prismatic Platform ecosystem. Spanning 22 active repositories with over 3,050 files and 55+ identified patterns, the GARDEN preserves institutional knowledge from projects covering OSINT, graph databases, web scraping, geocoding, AI, and distributed systems. The `/garden-analyze` command is the primary tool for extracting value from this archive, performing structural analysis, pattern detection, and architecture assessment that surfaces reusable knowledge.

Legacy code analysis is fundamentally different from contemporary code analysis. The code in GARDEN repositories was written across different technology eras, using different conventions, targeting different runtime environments. The [garden-analyzer](/agents/garden-analyzer/) agent is specifically trained to handle this diversity, recognizing patterns across Elixir, JavaScript, TypeScript, Rust, Python, and Ruby codebases while normalizing findings into a common assessment framework that is meaningful for current platform development.

This command operates under the **L2+** authority level and is executed by the `garden-analyzer` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard.

## Architecture

The garden analysis system implements a multi-phase extraction and assessment pipeline:

```
GARDEN Repository --> Language Detector --> Structure Analyzer --> Pattern Detector
       |                    |                     |                      |
  116 Repos            Multi-Language         Module Graph          55+ Patterns
  3,050+ Files         Parser Selection       Dependency Map         Matching
       |                    |                     |                      |
  File Inventory       AST/Syntax Parse      Architecture Map       Pattern Score
       \                    |                     /                      |
        --> Knowledge Extractor --> Assessment Generator --> Analysis Report
                    |
              Historical Context
              (git blame/log)
```

**Language Detector**: Identifies the programming languages used in each repository. GARDEN repositories span Elixir, JavaScript, TypeScript, Rust, Python, Ruby, and Go. The detector selects appropriate parsers and analysis strategies for each language.

**Structure Analyzer**: Maps the repository's module structure, dependency graph, and architectural boundaries. For Elixir repositories, this includes supervision tree analysis and OTP pattern identification. For JavaScript/TypeScript, this includes module dependency graphs and framework pattern detection.

**Pattern Detector**: Matches code structures against the platform's 55+ pattern library. The detector identifies patterns at multiple granularity levels: code-level patterns (error handling idioms, state machine structures), module-level patterns (repository pattern, service pattern, adapter pattern), and architecture-level patterns (hexagonal architecture, event-driven design, CQRS).

**Knowledge Extractor**: Synthesizes detected patterns, structural analysis, and historical context into structured knowledge artifacts. These artifacts are formatted for integration into the platform's pattern library and can inform evolution strategies through the [/evolve-patterns](/commands/evolve-patterns/) command.

## Usage

### Basic Repository Analysis

```bash
# Analyze a specific GARDEN repository
/garden-analyze sig

# Analyze with full pattern detection
/garden-analyze prismatic-legacy --patterns

# Brief summary of a repository
/garden-analyze kuzu-ex --brief
```

### Multi-Repository Analysis

```bash
# Analyze all T1 (production) repositories
/garden-analyze --tier=T1

# Analyze all repositories in a specific language
/garden-analyze --language=elixir

# Cross-repository pattern analysis
/garden-analyze --cross-repo --repos="sig,prismatic-legacy,crisstal"
```

### Pattern and Architecture Assessment

```bash
# Deep pattern detection with matching scores
/garden-analyze sig --patterns --verbose --min-score=0.7

# Architecture assessment for a repository
/garden-analyze prismatic-legacy --architecture

# Extract reusable patterns for platform integration
/garden-analyze sig --extract-patterns --output=patterns.json

# Compare repository architecture with current platform
/garden-analyze kuzu-ex --compare-with=prismatic_storage_kuzu
```

### Reporting

```bash
# Generate comprehensive analysis report
/garden-analyze sig --report --format=markdown

# Generate knowledge extraction summary
/garden-analyze --all --summary --format=table

# Export analysis results for external tools
/garden-analyze sig --export --format=json
```

## Options & Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--patterns` | flag | false | Enable pattern detection and matching |
| `--brief` | flag | false | Generate brief summary instead of full analysis |
| `--tier` | string | none | Analyze repositories in a specific tier (T1-T5) |
| `--language` | string | all | Filter repositories by programming language |
| `--cross-repo` | flag | false | Enable cross-repository pattern analysis |
| `--repos` | string | all | Comma-separated list of repositories |
| `--architecture` | flag | false | Include architectural assessment |
| `--extract-patterns` | flag | false | Extract reusable patterns for platform integration |
| `--compare-with` | string | none | Compare with a current platform application |
| `--report` | flag | false | Generate comprehensive analysis report |
| `--summary` | flag | false | Generate summary across multiple repositories |
| `--all` | flag | false | Analyze all GARDEN repositories |
| `--min-score` | float | 0.5 | Minimum pattern matching score for inclusion |
| `--verbose` | flag | false | Include detailed analysis metrics |
| `--format` | string | text | Output format (text, json, table, markdown) |
| `--export` | flag | false | Export results for external tooling |
| `--output` | string | stdout | Output file path for export operations |
| `--depth` | string | standard | Analysis depth (shallow, standard, deep) |

## Execution Flow

The `/garden-analyze` command follows a structured 6-phase analysis pipeline:

1. **Repository Discovery**: The target GARDEN repositories are located and validated. For tier-based analysis, all repositories in the specified tier are enumerated. For individual repositories, the path is resolved from the GARDEN registry.

2. **Inventory and Classification**: The repository's file inventory is catalogued with language classification, file type distribution, and size metrics. Historical context is extracted from git log to understand the repository's development timeline and contribution patterns.

3. **Structural Analysis**: The repository's code structure is analyzed: module graph, dependency relationships, directory organization, and configuration patterns. For Elixir repositories, supervision trees and OTP application structure are identified. The analysis produces an architecture map.

4. **Pattern Detection**: The code is scanned against the platform's 55+ pattern library. Each detected pattern is scored for matching confidence and relevance to current platform development. Cross-repository analysis identifies patterns that appear across multiple GARDEN repositories, indicating battle-tested approaches.

5. **Knowledge Extraction**: Detected patterns, structural insights, and architectural observations are synthesized into structured knowledge artifacts. Each artifact includes the pattern description, source code references, applicability assessment, and integration recommendations.

6. **Report Generation**: All analysis results are compiled into a structured report. The report includes repository overview, language breakdown, architectural assessment, detected patterns with scores, extracted knowledge artifacts, and recommendations for platform integration.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [GARDEN](/glossary/garden/) | Data Source | 116 repositories, 3,050+ files of legacy knowledge |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | Garden-analyzer agent performs deep analysis |
| [Evolution Engine](/glossary/autoevolve/) | Consumer | Extracted patterns feed evolution strategies |
| [/evolve-patterns](/commands/evolve-patterns/) | Integration | Discovered patterns enter platform pattern library |
| [Mycelial Network](/glossary/mycelial-network/) | Distribution | Extracted patterns propagate via mycelial network |
| [Quality DNA](/glossary/quality-dna/) | Persistence | Analysis results cached for cross-session access |
| [Telemetry](/glossary/telemetry/) | Monitoring | Analysis [metrics](/glossary/metrics/) and pattern detection rates |
| AIAD Registry | Discovery | Command specification and agent binding |

## Best Practices

**Analyze T1 repositories first**: T1 (production) repositories like `sig` and `prismatic` contain the most mature, battle-tested patterns. Start with these for the highest-confidence pattern extraction.

**Use cross-repo analysis for pattern validation**: Patterns that appear independently in multiple GARDEN repositories are more likely to be genuinely useful than patterns found in only one repository. Use `--cross-repo` to identify these validated patterns.

**Compare with current platform modules**: When analyzing a GARDEN repository that has a current platform counterpart (e.g., `kuzu-ex` and `prismatic_storage_kuzu`), use `--compare-with` to identify knowledge that was lost or transformed during the transition.

**Set appropriate pattern matching thresholds**: The default 0.5 minimum score includes partial matches that may require interpretation. Use 0.7+ for high-confidence pattern extraction, 0.3-0.5 for exploratory analysis.

**Extract patterns into the platform library**: Discovered patterns with high scores and broad applicability should be extracted (`--extract-patterns`) and fed into the [/evolve-patterns](/commands/evolve-patterns/) pipeline for formal integration into the platform's pattern library.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `REPOSITORY_NOT_FOUND` | GARDEN repository path not valid | Verify repository name against GARDEN registry |
| `LANGUAGE_NOT_SUPPORTED` | Repository uses an unsupported language | Add language parser or analyze supported portions only |
| `PATTERN_LIBRARY_UNAVAILABLE` | Platform pattern library not accessible | Check pattern library configuration and availability |
| `ANALYSIS_TIMEOUT` | Deep analysis exceeded time limit | Use `--depth=shallow` or analyze specific directories |
| `GIT_HISTORY_UNAVAILABLE` | Repository git history not accessible | Historical context will be omitted from analysis |

## Advanced Usage

### Knowledge Mining Campaigns

```bash
# Mine all T1-T3 repositories for OSINT patterns
/garden-analyze --tier=T1,T2,T3 --patterns \
  --filter-domain=osint --extract-patterns --output=osint-patterns.json

# Mine all repositories for OTP supervision patterns
/garden-analyze --all --patterns \
  --filter-pattern="supervision*" --verbose --format=markdown
```

### Legacy-to-Modern Migration Analysis

```bash
# Analyze a legacy repository and generate migration plan
/garden-analyze prismatic-legacy --architecture --migration-plan \
  --target-app=prismatic --format=markdown

# Identify legacy code that should NOT be migrated
/garden-analyze prismatic-legacy --deprecation-analysis --verbose
```

### GARDEN Ecosystem Health

```bash
# Generate comprehensive GARDEN health report
/garden-analyze --all --health-check --format=table

# Identify stale repositories that should be archived
/garden-analyze --all --staleness-check --threshold=365d
```

The GARDEN represents 20+ years of accumulated engineering wisdom. The `/garden-analyze` command ensures this wisdom is not lost but continuously extracted, refined, and integrated into the current platform through the evolution system. Each analysis run potentially surfaces patterns and knowledge that can inform current development decisions.

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Every GARDEN repository is subject to thorough analysis. No repository is too old, too messy, or too complex to analyze. Valuable patterns exist in the most unexpected places, and the analyzer exhaustively searches for them.
- **NO DOUBTS**: Pattern detection is evidence-based with explicit confidence scores. The analyzer does not guess at pattern matches -- it computes structural similarity metrics and reports them transparently. Low-confidence matches are flagged, not hidden.

The GARDEN analysis system embodies the [NABLA Infinity](/glossary/nabla-infinity/) principle of "absence informative" -- understanding what patterns are missing from a repository is as valuable as understanding what patterns are present. The analyzer tracks expected-but-absent patterns and reports them as potential improvement opportunities.

## Related Commands

- [/gardener](/commands/gardener/) - GARDEN legacy knowledge repository management across 116 repos
- [/garden-explore](/commands/garden-explore/) - Explore GARDEN repositories for patterns and knowledge
- [/evolve-patterns](/commands/evolve-patterns/) - Pattern evolution through meta-evolution analysis
- [/mycelialize](/commands/mycelialize/) - Biological-inspired pattern propagation at 500K patterns/sec
- [/ollama](/commands/ollama/) - Local AI Ollama model management, installation and optimization
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring
- [/analyze](/commands/analyze/) - System architecture analysis with dependency mapping
- [/evolve](/commands/evolve/) - Living AIAD ecosystem evolution with 5-phase cycle

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)