+++
title = "/presales-analyze"
weight = 1870
[extra]
category = "Presales"
description = "Text, file and URL analysis for presales opportunity assessment"
syntax = "/presales-analyze [options]"
authority = "L2+"
agent = "opportunity-analyzer"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1190
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["presales-analyze", "Text", "commands", "Presales", "Prismatic Platform", "Phase", "URLs"]
tags = ["commands", "presales", "presales-analyze", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/presales-analyze - Prismatic Platform"
+++

## Overview

**/presales-analyze** is a production command in the **Presales** category of the Prismatic Platform that performs comprehensive analysis of text, files, and URLs to assess presales opportunities. The command ingests unstructured business information from multiple source types -- including RFPs, tender documents, company websites, press releases, financial reports, and email correspondence -- and produces structured opportunity assessments with scoring, risk factors, and strategic recommendations.

The analysis engine applies natural language processing, entity extraction, and domain-specific heuristics to identify key opportunity characteristics: project scope, budget indicators, timeline constraints, technical requirements, competitive landscape signals, and decision-maker information. These extracted signals are then evaluated against configurable qualification criteria to produce an opportunity score that quantifies the likelihood of successful engagement and the strategic value of pursuing the opportunity.

This command operates under the **L2+** authority level and is executed by the `opportunity-analyzer` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The opportunity analyzer agent specializes in processing heterogeneous business documents and extracting actionable intelligence for sales strategy formulation.

Within the presales workflow, `/presales-analyze` typically serves as the first analytical step after an opportunity is identified. Raw materials such as tender documents, RFP PDFs, or prospect website URLs are fed into the analyzer, which produces a structured assessment that feeds into downstream commands like [/presales-assess](/commands/presales-assess/) for technical evaluation, [/presales-price](/commands/presales-price/) for pricing strategy, and [/presales-propose](/commands/presales-propose/) for proposal generation.

## Architecture

The analysis architecture implements a multi-format ingestion pipeline that normalizes diverse input sources into a common document model before applying analytical extractors.

```
Input Sources                  Processing Pipeline              Output
┌──────────────┐         ┌──────────────────────┐        ┌─────────────┐
│ Raw Text     │────>    │ Format Normalizer    │        │ Opportunity │
│ PDF/DOCX     │────>    │ (Text Extraction)    │        │ Assessment  │
│ URL Content  │────>    │         │            │        │ Report      │
│ Email Body   │────>    │         v            │        │             │
│ CSV/Excel    │────>    │ Entity Extractor     │────>   │ - Score     │
└──────────────┘         │ (NER + Domain Rules) │        │ - Risks     │
                         │         │            │        │ - Strategy  │
                         │         v            │        │ - Entities  │
                         │ Signal Classifier    │        │ - Timeline  │
                         │ (Qualification)      │        │ - Budget    │
                         │         │            │        │ - Competitors│
                         │         v            │        └─────────────┘
                         │ Opportunity Scorer   │
                         │ (Multi-factor)       │
                         └──────────────────────┘
```

The Entity Extractor identifies and classifies key entities within the document: organization names, person names with roles, monetary amounts with currency, dates and deadlines, technology mentions, and geographic references. Each extracted entity is tagged with confidence scores and source position, enabling traceability back to the original document.

The Signal Classifier evaluates extracted entities and patterns against presales qualification criteria. Positive signals (large budget mentions, urgent timelines, technology alignment) increase the opportunity score. Negative signals (incumbent vendor mentions, budget constraints, scope creep indicators) decrease it. The classifier operates on configurable rule sets that can be tuned for specific market segments and engagement models.

## Usage

### Text Analysis

```bash
# Analyze raw text description of opportunity
/presales-analyze --text "Company XYZ is looking for a cybersecurity platform..."

# Analyze text from clipboard
/presales-analyze --clipboard

# Analyze with specific qualification criteria
/presales-analyze --text "..." --criteria enterprise-security
```

### File Analysis

```bash
# Analyze RFP document
/presales-analyze --file /path/to/rfp-document.pdf

# Analyze multiple files for same opportunity
/presales-analyze --files "rfp.pdf,requirements.docx,budget.xlsx"

# Analyze with specific focus areas
/presales-analyze --file tender.pdf --focus technical-requirements
```

### URL Analysis

```bash
# Analyze company website for opportunity signals
/presales-analyze --url "https://example.com/about"

# Analyze tender portal listing
/presales-analyze --url "https://tender-portal.gov.cz/listing/12345"

# Deep crawl with link following
/presales-analyze --url "https://example.com" --crawl-depth 3
```

### Combined Analysis

```bash
# Multi-source opportunity analysis
/presales-analyze --file rfp.pdf --url "https://example.com" \
  --text "Additional context from meeting notes" --combine

# Generate structured opportunity brief
/presales-analyze --file rfp.pdf --output opportunity-brief.json --format json
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--text` | string | none | Raw text to analyze |
| `--file` | path | none | File path for document analysis |
| `--files` | string | none | Comma-separated file paths |
| `--url` | URL | none | URL to fetch and analyze |
| `--clipboard` | flag | false | Analyze text from system clipboard |
| `--crawl-depth` | integer | 1 | URL crawling depth for link following |
| `--criteria` | enum | default | Qualification criteria set |
| `--focus` | enum | all | Analysis focus: all, technical-requirements, budget, timeline, competitive |
| `--combine` | flag | false | Combine multi-source analysis into single assessment |
| `--case-id` | string | auto | Associate analysis with existing presales case |
| `--format` | enum | table | Output: table, json, html, pdf, markdown |
| `--output` | path | stdout | Output file path |
| `--language` | enum | auto | Source language: auto, cs, en, de |
| `--extract-contacts` | flag | false | Extract and structure contact information |
| `--competitive-analysis` | flag | false | Enable competitive landscape analysis |
| `--confidence-threshold` | float | 0.6 | Minimum confidence for entity inclusion |

## Execution Flow

The analysis pipeline processes input through four sequential phases with parallel sub-operations within each phase.

**Phase 1 -- Ingestion and Normalization** (1-10 seconds): Input sources are ingested and converted to a common text representation. PDF documents are processed through text extraction with layout preservation. DOCX files are parsed for structured content. URLs are fetched with JavaScript rendering support for dynamic content. Multiple sources are concatenated with source boundary markers for traceability.

**Phase 2 -- Entity Extraction** (2-5 seconds): The normalized text is processed through the entity extraction pipeline. Named Entity Recognition identifies organizations, persons, locations, and monetary values. Domain-specific extractors identify technology mentions, compliance references, timeline expressions, and competitive signals. Each entity is annotated with confidence score, source position, and entity type.

**Phase 3 -- Signal Classification** (1-3 seconds): Extracted entities and document patterns are evaluated against qualification criteria to classify opportunity signals. The classifier evaluates budget adequacy (does the indicated budget align with solution pricing?), timeline feasibility (can the solution be delivered within the stated timeframe?), technical fit (does the requirement align with platform capabilities?), and competitive position (is there an incumbent or preferred vendor?).

**Phase 4 -- Scoring and Report Generation** (< 2 seconds): The multi-factor opportunity score is calculated by weighting classified signals according to the selected criteria set. The final assessment report is generated with structured sections: executive summary, opportunity score with breakdown, extracted entities, risk factors, strategic recommendations, and recommended next steps (including which presales commands to execute next).

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/presales](/commands/presales/) | Parent Command | Top-level presales orchestration |
| [/presales-assess](/commands/presales-assess/) | Downstream | Technical assessment of analyzed opportunity |
| [/presales-price](/commands/presales-price/) | Downstream | Pricing based on analyzed requirements |
| [/presales-propose](/commands/presales-propose/) | Downstream | Proposal generation from analysis |
| [/presales-case](/commands/presales-case/) | Case Management | Associate analysis with presales case |
| [/presales-research](/commands/presales-research/) | Complementary | Competitor research to enrich analysis |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | `opportunity-analyzer` agent |
| [Telemetry](/glossary/telemetry/) | Observability | Analysis timing and quality metrics |
| [Quality Gates](/glossary/quality-gates/) | Validation | Analysis completeness checks |

## Best Practices

**Provide Multiple Sources**: The analysis is significantly more accurate and comprehensive when multiple source types are combined. An RFP document plus the prospect's website plus meeting notes will produce a much richer assessment than any single source alone.

**Set the Right Criteria**: Use `--criteria enterprise-security` for cybersecurity opportunities, `--criteria data-analytics` for data platform opportunities, and so on. The criteria set adjusts signal weights to match the specific engagement model, significantly improving scoring accuracy.

**Extract Contacts Early**: Use `--extract-contacts` during initial analysis to capture decision-maker information while it is fresh. This structured contact data feeds directly into follow-up workflows and CRM integration.

**Associate with Cases**: Always use `--case-id` to link analyses to existing presales cases. This creates a complete analytical history for each opportunity, enabling trend tracking and decision audit trails.

**Review Confidence Scores**: Pay particular attention to entities with confidence scores below 0.8. These may represent ambiguous extractions that require manual verification before strategic decisions are based on them.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Unsupported file format | Error with supported formats list | Convert to PDF/DOCX/TXT |
| URL fetch failure | Error with HTTP status | Verify URL accessibility |
| Empty document | Warning with no analysis | Verify file has extractable content |
| Language detection failure | Fallback to English processing | Specify `--language` explicitly |
| Extraction timeout | Partial results with warning | Reduce document size or scope |
| Low-confidence results | Warning with confidence distribution | Provide additional source material |

## Advanced Usage

### Pipeline Integration

```bash
# Full presales pipeline from initial document
/presales-analyze --file rfp.pdf --case-id "CASE-2026-042" \
  | /presales-assess --technical \
  | /presales-price --model subscription \
  | /presales-propose --template enterprise
```

### Batch Opportunity Screening

```bash
# Screen multiple tender documents
/presales-analyze --files "tender1.pdf,tender2.pdf,tender3.pdf" \
  --criteria enterprise-security --format json --output screening-results.json

# Rank opportunities by score
/presales-analyze --batch tenders/ --rank --top 5
```

### Competitive Intelligence Enhancement

```bash
# Deep competitive analysis from RFP
/presales-analyze --file rfp.pdf --competitive-analysis \
  --cross-reference /presales-research --format pdf
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Every section of the input document is processed. No extraction failures are silently suppressed. Opportunity scores reflect all identified signals, including negative ones.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every extracted entity includes source provenance and confidence scoring. The [NABLA](/glossary/nabla-infinity/) axiom of Provenance Mandatory ensures all analytical claims are traceable to specific source content. Contradictory signals (e.g., large stated budget but constrained actual spending patterns) are preserved and highlighted per the Contradiction Preservation axiom.

## Related Commands

- [/presales](/commands/presales/) - Presales intelligence for company analysis and opportunity identification
- [/presales-assess](/commands/presales-assess/) - Technical assessment of opportunities and cases
- [/presales-case](/commands/presales-case/) - Presales case management for status tracking and updates
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)