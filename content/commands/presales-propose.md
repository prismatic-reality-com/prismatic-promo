+++
title = "/presales-propose"
weight = 1910
[extra]
category = "Presales"
description = "Proposal writing and generation for presales opportunities"
syntax = "/presales-propose [options]"
authority = "L2+"
agent = "proposal-writer"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1238
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["presales-propose", "Proposal", "commands", "Presales", "Prismatic Platform", "Phase", "Technical"]
tags = ["commands", "presales", "presales-propose", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/presales-propose - Prismatic Platform"
+++

## Overview

**/presales-propose** is a production command in the **Presales** category of the Prismatic Platform that automates the generation of professional, structured proposals for presales opportunities. The command synthesizes data from all upstream presales activities -- opportunity analysis, technical assessment, pricing strategy, competitive research, and case management -- to produce comprehensive, customized proposals that are ready for prospect review with minimal manual editing.

The proposal generation engine applies template-based document composition with intelligent content selection. Rather than generating generic proposals, the engine selects and customizes content sections based on the specific opportunity characteristics: industry vertical, solution scope, deployment model, compliance requirements, and competitive context. This targeted content selection ensures that every proposal speaks directly to the prospect's specific needs and concerns while maintaining consistent quality and branding standards.

This command operates under the **L2+** authority level and is executed by the `proposal-writer` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The proposal writer agent combines technical writing capability with commercial awareness, producing documents that are both technically accurate and persuasively structured.

As the culmination of the presales pipeline, `/presales-propose` represents the point where all intelligence gathering, analysis, assessment, and pricing converge into a deliverable artifact. The quality of this output directly impacts win rates, making it one of the most business-critical commands in the presales category. The command enforces the platform's [NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/) doctrine by refusing to generate proposals from incomplete data -- every required section must have adequate backing from upstream presales activities.

## Architecture

The proposal generation architecture implements a template composition engine with dynamic content selection and assembly.

```
Case Data                Template Engine              Output
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Analysis     │     │ Template         │     │ PDF Document    │
│ Assessment   │────>│ Selector         │     │                 │
│ Pricing      │     │ (Industry,       │     │ - Cover Page    │
│ Research     │     │  Scope, Model)   │     │ - Exec Summary  │
│ Case Notes   │     │       │          │     │ - Solution      │
└──────────────┘     │       v          │     │ - Architecture  │
                     │ Content          │────>│ - Implementation│
                     │ Assembler        │     │ - Pricing       │
                     │ (Section Fill,   │     │ - Timeline      │
                     │  Customization)  │     │ - Team          │
                     │       │          │     │ - References    │
                     │       v          │     │ - T&Cs          │
                     │ Quality Checker  │     └─────────────────┘
                     │ (Completeness,   │
                     │  Consistency)    │
                     └──────────────────┘
```

The Template Selector maintains a library of proposal templates organized by industry vertical (technology, financial services, government, healthcare), solution scope (EASM, compliance, intelligence, full platform), and deployment model (SaaS, on-premise, hybrid). Each template defines the required and optional sections, the content structure for each section, and the visual layout and branding elements.

The Content Assembler populates template sections with data from the case record. Technical descriptions are drawn from the assessment. Pricing tables are constructed from the pricing analysis. Competitive differentiation points are extracted from the research. Implementation timelines are generated from the project plan. This automated assembly ensures consistency between the proposal content and the underlying analytical data.

## Usage

### Basic Proposal Generation

```bash
# Generate proposal from case data
/presales-propose --case-id "CASE-2026-042"

# Generate with specific template
/presales-propose --case-id "CASE-2026-042" --template enterprise-easm

# Quick proposal draft for review
/presales-propose --case-id "CASE-2026-042" --draft
```

### Customized Proposals

```bash
# Proposal with specific sections
/presales-propose --case-id "CASE-2026-042" \
  --sections "executive-summary,solution,architecture,pricing,timeline"

# Proposal with compliance emphasis
/presales-propose --case-id "CASE-2026-042" --emphasis compliance --frameworks nis2,gdpr

# Proposal in specific language
/presales-propose --case-id "CASE-2026-042" --language cs
```

### Multi-Format Output

```bash
# PDF with corporate branding
/presales-propose --case-id "CASE-2026-042" --format pdf --output proposal.pdf

# DOCX for collaborative editing
/presales-propose --case-id "CASE-2026-042" --format docx --output proposal.docx

# Markdown for review
/presales-propose --case-id "CASE-2026-042" --format markdown
```

### Proposal Iteration

```bash
# Generate revision based on feedback
/presales-propose --case-id "CASE-2026-042" --revision 2 \
  --feedback "Emphasize ROI, reduce technical detail"

# Side-by-side diff between revisions
/presales-propose --case-id "CASE-2026-042" --diff --revision-a 1 --revision-b 2
```

## Options & Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--case-id` | string | required | Presales case identifier |
| `--template` | enum | auto | Proposal template: enterprise-easm, smb-security, government, custom |
| `--draft` | flag | false | Generate draft without final formatting |
| `--sections` | string | all | Comma-separated section list |
| `--emphasis` | enum | balanced | Content emphasis: technical, commercial, compliance, balanced |
| `--frameworks` | string | none | Compliance frameworks to highlight |
| `--language` | enum | en | Proposal language: en, cs, de |
| `--revision` | integer | 1 | Proposal revision number |
| `--feedback` | string | none | Revision guidance from feedback |
| `--diff` | flag | false | Compare revisions |
| `--revision-a` | integer | none | First revision for comparison |
| `--revision-b` | integer | none | Second revision for comparison |
| `--branding` | enum | default | Branding preset: default, minimal, corporate |
| `--from-assessment` | flag | true | Include assessment data |
| `--from-pricing` | flag | true | Include pricing data |
| `--include-references` | flag | true | Include case studies and references |
| `--format` | enum | pdf | Output: pdf, docx, markdown, html |
| `--output` | path | stdout | Output file path |

## Execution Flow

The proposal generation follows a multi-phase composition pipeline.

**Phase 1 -- Data Collection** (1-3 seconds): All upstream presales data is collected from the case record: analysis results, technical assessment, pricing recommendation, competitive research, and case notes. The command validates that minimum data requirements are met for the selected template. Missing data triggers specific error messages indicating which upstream commands need to be run.

**Phase 2 -- Template Selection and Customization** (< 1 second): The appropriate template is selected based on the opportunity profile or explicit template specification. Template sections are configured based on the `--sections` and `--emphasis` parameters. Optional sections are included or excluded based on data availability and relevance.

**Phase 3 -- Content Assembly** (2-5 seconds): Each template section is populated with content from the case data. The executive summary synthesizes key opportunity characteristics and value proposition. The solution section describes the proposed architecture and capabilities. The implementation section outlines the delivery plan with milestones. The pricing section presents the selected pricing model with options. Each section is generated with appropriate level of detail for the target audience.

**Phase 4 -- Quality Validation** (1-2 seconds): The assembled proposal is validated for completeness (all required sections populated), consistency (pricing matches assessment scope, timeline matches effort estimates), and formatting (all references resolved, all images embedded, all cross-references valid).

**Phase 5 -- Document Rendering** (1-5 seconds): The validated proposal is rendered in the requested output format. PDF rendering applies corporate branding, page layout, headers/footers, and table of contents. DOCX rendering preserves editability with tracked change support. Markdown rendering produces a clean text representation for review.

## Integration Points

| Component | Integration Type | Description |
|-----------|-----------------|-------------|
| [/presales-analyze](/commands/presales-analyze/) | Data Source | Opportunity analysis feeds executive summary |
| [/presales-assess](/commands/presales-assess/) | Data Source | Technical assessment feeds solution section |
| [/presales-price](/commands/presales-price/) | Data Source | Pricing recommendation feeds pricing section |
| [/presales-research](/commands/presales-research/) | Data Source | Competitive analysis feeds differentiation |
| [/presales-case](/commands/presales-case/) | Case Management | Proposal linked to case record |
| [/presales](/commands/presales/) | Parent Command | Top-level presales orchestration |
| [Prismatic Agents](/glossary/prismatic-agents/) | Execution | `proposal-writer` agent |
| [Telemetry](/glossary/telemetry/) | Observability | Proposal generation and revision metrics |

## Best Practices

**Complete Upstream Steps First**: The best proposals are generated from complete upstream data. Ensure that analysis, assessment, pricing, and competitive research are all linked to the case before generating the proposal. Missing data produces weaker sections.

**Use Draft Mode for Review**: Generate an initial draft with `--draft` for internal review before producing the final formatted version. Draft mode is faster and produces markdown output suitable for collaborative editing.

**Customize for the Audience**: Use `--emphasis technical` when the primary reviewer is a CTO or technical architect. Use `--emphasis commercial` when the reviewer is a CFO or procurement team. Use `--emphasis compliance` when regulatory compliance is the primary driver.

**Iterate with Feedback**: Use the `--revision` and `--feedback` options to refine proposals based on internal or prospect feedback. The revision system preserves all previous versions for comparison.

**Review the Quality Validation Output**: Pay attention to any quality warnings in the generation output. These indicate areas where the proposal may be inconsistent with upstream data or where sections may be thinner than ideal.

## Error Handling

| Error Condition | Behavior | Recovery |
|----------------|----------|----------|
| Case not found | Error with available cases | Verify case ID |
| Missing assessment data | Error indicating required command | Run `/presales-assess` first |
| Missing pricing data | Error indicating required command | Run `/presales-price` first |
| Template not found | Error with available templates | Use supported template name |
| Language not supported | Fallback to English | Use supported language code |
| PDF rendering failure | Fallback to markdown | Check template formatting |

## Advanced Usage

### Executive Briefing

```bash
# Generate concise executive briefing (2-3 pages)
/presales-propose --case-id "CASE-2026-042" --template executive-brief \
  --sections "executive-summary,value-proposition,pricing-summary" \
  --format pdf --output exec-brief.pdf
```

### RFP Response Compilation

```bash
# Generate structured RFP response
/presales-propose --case-id "CASE-2026-042" --template rfp-response \
  --rfp-sections rfp-structure.json --format docx --output rfp-response.docx
```

### Multi-Language Proposal

```bash
# Generate bilingual proposal (English + Czech)
/presales-propose --case-id "CASE-2026-042" --language en --output proposal-en.pdf
/presales-propose --case-id "CASE-2026-042" --language cs --output proposal-cs.pdf
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Proposals are never generated from incomplete data -- missing upstream activities block generation with specific guidance on what to complete. Every section must meet minimum quality thresholds. Proposals with unresolved placeholders or inconsistencies are rejected.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every claim in the proposal is backed by data from upstream presales activities. Technical capabilities described in the proposal are verified against the AIAD capability registry. Pricing commitments match the approved pricing analysis. The [NABLA](/glossary/nabla-infinity/) framework ensures that proposal claims are traceable to evidence.

## Related Commands

- [/presales](/commands/presales/) - Presales intelligence for company analysis and opportunity identification
- [/presales-analyze](/commands/presales-analyze/) - Text, file and URL analysis for presales opportunity assessment
- [/presales-assess](/commands/presales-assess/) - Technical assessment of opportunities and cases
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)