+++
title = "/intel-export"
weight = 720
[extra]
category = "Intelligence"
description = "Generate comprehensive intelligence packages for external LLM analysis"
syntax = "/intel-export [options]"
authority = "L3"
agent = "intelligence-export-coordinator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1144
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["intel-export", "Generate", "commands", "Intelligence", "Prismatic Platform", "NABLA", "Export", "Package"]
tags = ["commands", "intelligence", "intel-export", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/intel-export - Prismatic Platform"
+++

## Overview

**/intel-export** is a production command in the **Intelligence** category of the Prismatic Platform that generates comprehensive, structured intelligence packages designed for consumption by external Large Language Model (LLM) systems. When the platform's intelligence collection commands ([/investigate](/commands/investigate/), [/email-osint](/commands/email-osint/), [/ghost-recon](/commands/ghost-recon/)) produce raw findings, the intel-export command transforms these findings into packages optimized for further analysis by specialized AI systems, human analysts, or integration into broader intelligence workflows.

This command operates under the **L3** authority level and is executed by the `intelligence-export-coordinator` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the sensitivity of intelligence products and ensures that export operations are restricted to authorized operators with appropriate clearance.

Intelligence packages differ from raw command output in several critical ways. They include executive summaries suitable for non-technical stakeholders, structured data sections optimized for LLM context windows, provenance metadata that traces every finding to its source, confidence assessments calibrated to the [NABLA](/glossary/nabla-infinity/) framework, and recommended follow-up actions based on the findings. The export format is deliberately designed to be self-contained so that the receiving analyst or LLM has all necessary context without needing access to the Prismatic Platform itself.

## Architecture

The export system operates as a multi-stage transformation pipeline that converts raw intelligence data into structured packages.

### Export Pipeline

```
Raw Intelligence -> Deduplicator -> Enricher -> Scorer -> Formatter -> Package Builder
       |                |              |           |           |             |
       v                v              v           v           v             v
  Collection Data   Remove Dupes   Add Context  Confidence  Template     Output File
  Source Metadata   Merge Related  Cross-ref    Calibration  Selection   Verification
  Timestamps        Entity Link    Gap Analysis  Weighting   Rendering   Signature
```

### Package Structure

| Section | Content | Purpose |
|---------|---------|---------|
| **Executive Summary** | 2-3 paragraph overview | Quick orientation for analysts |
| **Key Findings** | Prioritized finding list | Actionable intelligence highlights |
| **Entity Profile** | Target entity details | Comprehensive target description |
| **Source Inventory** | Sources queried with results | Provenance and completeness assessment |
| **Detailed Findings** | Full finding data by category | Deep analysis material |
| **Confidence Assessment** | NABLA-calibrated scoring | Reliability evaluation |
| **Intelligence Gaps** | Missing or inconclusive data | Areas requiring further investigation |
| **Recommended Actions** | Prioritized follow-up steps | Actionable next steps |
| **Metadata** | Export timestamp, version, scope | Package management |

### Export Formats

| Format | Extension | Use Case | LLM Optimized |
|--------|-----------|----------|---------------|
| **Markdown** | `.md` | Human-readable, LLM-compatible | Yes |
| **JSON** | `.json` | Programmatic consumption | Yes |
| **HTML** | `.html` | Web presentation | No |
| **STIX** | `.stix.json` | Threat intelligence sharing | Partial |
| **PDF** | `.pdf` | Formal reports | No |

## Usage

```bash
# Export intelligence from the latest investigation
/intel-export --source=latest --format=markdown

# Export specific investigation results
/intel-export --source=investigation_id_abc123 --format=json

# Export with LLM optimization (context window sizing)
/intel-export --source=latest --format=markdown --llm-optimize --max-tokens=100000

# Export as STIX format for threat intelligence sharing
/intel-export --source=latest --format=stix --output=threat-intel.stix.json

# Export with specific sections only
/intel-export --source=latest --sections="summary,findings,actions"

# Export all investigations for a target
/intel-export --target=example.com --format=markdown --output=example-intel-package.md

# Export with redaction for external sharing
/intel-export --source=latest --redact=pii --format=pdf

# Generate comparative export across multiple investigations
/intel-export --compare=inv_001,inv_002 --format=markdown
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--source` | string | latest | Investigation ID or "latest" |
| `--target` | string | none | Target entity to export intel for |
| `--format` | string | markdown | Export format: markdown, json, html, stix, pdf |
| `--output` | string | auto-named | Output file path |
| `--llm-optimize` | flag | false | Optimize structure for LLM consumption |
| `--max-tokens` | integer | 50000 | Maximum token count for LLM-optimized exports |
| `--sections` | string | all | Comma-separated section list |
| `--redact` | string | none | Redaction level: none, pii, sensitive, maximum |
| `--compare` | string | none | Comma-separated investigation IDs for comparison |
| `--classification` | string | unclassified | Classification level for the package |
| `--include-raw` | flag | false | Include raw source data alongside processed findings |
| `--verbose` | flag | false | Include detailed provenance chains |

## Execution Flow

1. **Source Resolution**: The specified investigation source is resolved. This can be a specific investigation ID, the most recent investigation, or all investigations for a given target entity.

2. **Data Aggregation**: Raw intelligence data from all specified sources is loaded and aggregated. This includes findings, metadata, confidence scores, source information, and timestamps.

3. **Deduplication**: Duplicate findings that appear across multiple collection phases or sources are identified and merged. The highest-confidence version is retained with cross-references to supporting sources.

4. **Enrichment**: Findings are enriched with contextual data from the platform's knowledge base. Geographic data, industry classification, organizational relationships, and historical context are added where available.

5. **Confidence Calibration**: NABLA-framework confidence scores are recalculated based on the complete evidence set. Multi-source corroboration increases confidence; contradictory findings are flagged with preserved contradiction details per the addiction preservation doctrine.

6. **Gap Analysis**: The intelligence collection is analyzed for gaps -- categories where data was expected but not found, sources that were unavailable, and questions that remain unanswered. These gaps are documented as potential areas for follow-up investigation.

7. **Template Selection**: The appropriate export template is selected based on format and sections requested. LLM-optimized templates include structural markers that help language models parse the content efficiently.

8. **Package Generation**: The complete package is rendered into the target format, including all sections, metadata, and any required redactions. The package is verified for completeness and consistency.

9. **Output Writing**: The package is written to the specified output path or auto-generated filename. A verification hash is computed and included in the package metadata.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `intelligence-export-coordinator` | Package generation and formatting |
| [/investigate](/commands/investigate/) | Primary data source | Investigation results feed exports |
| [/email-osint](/commands/email-osint/) | Email intel source | Email-specific findings included |
| [/ghost-recon](/commands/ghost-recon/) | Passive intel source | Zero-footprint findings included |
| [NABLA Framework](/glossary/nabla-infinity/) | Confidence calibration | Epistemic scoring and provenance |
| [Quality Gates](/glossary/quality-gates/) | Export quality | Package completeness validation |
| [Telemetry](/glossary/telemetry/) | Export [metrics](/glossary/metrics/) | Package size, generation time tracking |

## Best Practices

**Use LLM optimization for AI-assisted analysis.** The `--llm-optimize` flag structures the package with clear section headers, consistent formatting, and efficient information density that maximizes the value extracted per token of LLM context.

**Set appropriate redaction levels for external sharing.** Never share raw intelligence packages externally without appropriate redaction. Use `--redact=pii` for packages that will be shared outside the immediate team, and `--redact=sensitive` for broader distribution.

**Include confidence assessments.** Consumers of intelligence packages need to know how reliable each finding is. Always include the confidence assessment section, which provides NABLA-calibrated scoring for every major finding.

**Document intelligence gaps.** The gaps section is often more valuable than the findings themselves. Knowing what you do not know enables better decision-making and targeted follow-up investigation.

**Use STIX format for threat intelligence sharing.** When sharing findings with security operations centers or threat intelligence platforms, use the STIX export format for compatibility with industry-standard tools.

**Verify package completeness.** After export, review the package to ensure all expected sections are present and populated. The `--verbose` flag includes detailed provenance chains for audit purposes.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `source_not_found` | Investigation ID does not exist | Verify investigation ID with `/investigate --list` |
| `no_data_for_target` | No investigation data exists for target | Run an investigation first |
| `format_unsupported` | Requested export format not available | Use supported format: markdown, json, html, stix, pdf |
| `token_limit_exceeded` | LLM-optimized export exceeds max-tokens | Reduce sections or increase `--max-tokens` |
| `redaction_error` | PII detection encountered ambiguous data | Review manually and apply explicit redaction markers |
| `output_write_failed` | Cannot write to specified output path | Verify directory exists and permissions are sufficient |

## Advanced Usage

### LLM-Optimized Chain Analysis

Generate packages structured for multi-step LLM analysis workflows.

```bash
# Phase 1: Generate LLM analysis prompt
/intel-export --source=latest --format=markdown --llm-optimize \
  --sections="summary,findings" --max-tokens=50000 --output=phase1-analysis.md

# Phase 2: Generate detailed evidence package
/intel-export --source=latest --format=markdown --llm-optimize \
  --sections="detailed,sources,confidence" --max-tokens=100000 --output=phase2-evidence.md
```

### Comparative Intelligence Reports

Compare findings across multiple investigation sessions.

```bash
/intel-export --compare=inv_jan,inv_feb --format=markdown \
  --sections="summary,findings,changes" --output=monthly-comparison.md
```

### Automated Report Generation

Integrate intel export into automated intelligence workflows.

```bash
# Daily automated intelligence summary
/investigate target.com --mode=quick --format=json && \
/intel-export --source=latest --format=markdown --llm-optimize --output=daily-intel.md
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every export package includes completeness verification and section validation.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every finding in the export includes full provenance, confidence scoring, and source attribution per [NABLA](/glossary/nabla-infinity/) requirements.

## Related Commands

- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/ghost-recon](/commands/ghost-recon/) - Ghost reconnaissance for passive zero-footprint intelligence gathering
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction
- [/ma-analyze](/commands/ma-analyze/) - Comprehensive M&A analysis including financial, legal and operational review
- [/osint-engines](/commands/osint-engines/) - Multi-engine OSINT source coordination and parallel querying

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)