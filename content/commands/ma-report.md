+++
title = "/ma-report"
weight = 760
[extra]
category = "M&A Operations"
description = "Generate detailed M&A analysis report with visualizations"
syntax = "/ma-report [options]"
authority = "L2+"
agent = "ma-report-generator"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1459
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ma-report", "Generate", "commands", "M&A Operations", "Prismatic Platform", "Report", "Deal", "OSINT", "Financial"]
tags = ["commands", "m&a-operations", "ma-report", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/ma-report - Prismatic Platform"
+++

## Overview

**/ma-report** is a production command in the **M&A Operations** category of the Prismatic Platform that generates detailed, structured M&A analysis reports with visualizations, executive summaries, and actionable recommendations. While [/ma-analyze](@/commands/ma-analyze.md) performs the analytical work and stores results, the `/ma-report` command transforms those results into polished, stakeholder-ready documents suitable for board presentations, investment committee reviews, and deal team communications.

This command operates under the **L2+** authority level and is executed by the `ma-report-generator` agent. It is part of the platform's 216-command slash command [registry](@/glossary/registry-otp.md), built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard. The L2+ authority level allows broad access to report generation while ensuring that the underlying analysis data is appropriately protected.

Report generation in the Prismatic Platform produces documents that combine traditional M&A reporting with the platform's intelligence capabilities. A standard M&A report includes financial analysis tables and valuation summaries; a Prismatic M&A report additionally includes OSINT intelligence findings, digital infrastructure assessments, key personnel network maps, and [NABLA](@/glossary/nabla-infinity.md)-calibrated confidence scores for every major finding. This intelligence enrichment provides deal teams with context that traditional advisory reports lack.

The report generator supports multiple output formats (PDF, Markdown, HTML, JSON) and multiple report types (screening summary, full due diligence, executive briefing, financial detail, compliance report). Each report type follows a predefined template structure optimized for its intended audience, ensuring that executives receive concise summaries while analysts receive comprehensive detail.

## Architecture

The report generation system operates as a template-driven rendering pipeline with data extraction, visualization, and formatting stages.

### Report Generation Pipeline

```
/ma-report -> Data Extractor -> Visualizer -> Template Engine -> Formatter -> Output
                   |                |               |               |           |
                   v                v               v               v           v
             Deal Data         Charts          Section Render    PDF/MD      File Write
             Analysis Data     Tables          Variable Insert   HTML/JSON   Verification
             Intel Data        Diagrams        Conditional Sect  CSV         Distribution
             Compliance Data   Timelines       Page Layout       PPTX
```

### Report Types

| Type | Audience | Sections | Length | Purpose |
|------|----------|----------|--------|---------|
| **Screening Summary** | Deal team | Overview, key findings, recommendation | 3-5 pages | Initial go/no-go decision |
| **Due Diligence** | Full team | All domains, detailed findings | 20-50 pages | Comprehensive analysis review |
| **Executive Briefing** | Board/ExCo | Summary, valuation, risk, recommendation | 5-10 pages | Executive decision support |
| **Financial Detail** | Financial team | Valuation models, projections, sensitivities | 15-30 pages | Financial review and approval |
| **Compliance Report** | Legal/compliance | Regulatory, legal, compliance status | 10-20 pages | Compliance sign-off |
| **Intelligence Brief** | Security team | OSINT findings, digital assessment, risks | 10-15 pages | Security and intelligence review |
| **Comparison Report** | Strategy team | Multi-target comparison, ranking | 10-25 pages | Target selection |
| **Closing Memo** | All stakeholders | Final terms, conditions, next steps | 5-10 pages | Deal closure documentation |

### Visualization Types

| Visualization | Data Source | Usage |
|--------------|------------|-------|
| **Valuation Range Chart** | Financial analysis | Shows DCF, comparables, and precedent ranges |
| **Revenue Projection** | Financial model | Multi-year revenue forecast with scenarios |
| **Synergy Waterfall** | Synergy analysis | Breakdown of synergy sources and values |
| **Risk Heat Map** | Risk assessment | Domain x severity risk visualization |
| **Organizational Chart** | Personnel intel | Target company structure and key people |
| **Timeline Gantt** | Deal milestones | Deal progress and upcoming deadlines |
| **Confidence Dashboard** | NABLA scores | Confidence levels across analysis domains |
| **Competitive Landscape** | Strategic analysis | Market position relative to peers |

## Usage

```bash
# Generate default due diligence report
/ma-report DEAL-2026-001

# Generate specific report type
/ma-report DEAL-2026-001 --type=executive-briefing
/ma-report DEAL-2026-001 --type=screening-summary
/ma-report DEAL-2026-001 --type=financial-detail

# Generate in specific format
/ma-report DEAL-2026-001 --format=pdf --output=deal-report.pdf
/ma-report DEAL-2026-001 --format=markdown --output=deal-report.md
/ma-report DEAL-2026-001 --format=html --output=deal-report.html

# Generate with custom sections
/ma-report DEAL-2026-001 --sections="summary,financial,risk,recommendation"

# Generate comparison report for multiple deals
/ma-report --compare="DEAL-001,DEAL-002,DEAL-003" --type=comparison

# Generate with intelligence enrichment
/ma-report DEAL-2026-001 --include-intel --intel-sections="personnel,infrastructure,osint"

# Generate with redaction for external sharing
/ma-report DEAL-2026-001 --redact=external --format=pdf

# Generate LLM-optimized report for AI analysis
/ma-report DEAL-2026-001 --llm-optimize --max-tokens=100000 --format=markdown

# Update existing report with latest data
/ma-report DEAL-2026-001 --update --format=pdf

# Generate closing memo
/ma-report DEAL-2026-001 --type=closing-memo --terms-file=final-terms.json
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `deal_id` | string | required | Deal identifier (positional argument) |
| `--type` | string | due-diligence | Report type: screening-summary, due-diligence, executive-briefing, financial-detail, compliance, intelligence-brief, comparison, closing-memo |
| `--format` | string | pdf | Output format: pdf, markdown, html, json, csv, pptx |
| `--output` | string | auto-named | Output file path |
| `--sections` | string | all | Comma-separated section list |
| `--compare` | string | none | Comma-separated deal IDs for comparison report |
| `--include-intel` | flag | false | Include intelligence findings in report |
| `--intel-sections` | string | all | Intel section filter: personnel, infrastructure, osint, security |
| `--redact` | string | none | Redaction level: none, internal, external, maximum |
| `--llm-optimize` | flag | false | Optimize for LLM consumption |
| `--max-tokens` | integer | 50000 | Maximum tokens for LLM-optimized reports |
| `--update` | flag | false | Update existing report with latest data |
| `--template` | string | default | Custom report template name |
| `--branding` | string | default | Branding profile: default, formal, minimal |
| `--language` | string | en | Report language: en, de, cs, fr |
| `--terms-file` | string | none | Final terms JSON for closing memos |
| `--watermark` | string | none | Watermark text for PDF output |
| `--classification` | string | confidential | Classification: public, internal, confidential, restricted |

## Execution Flow

1. **Deal Data Loading**: The specified deal and all associated analysis results are loaded from the M&A pipeline. If the deal has not been analyzed, the report generator warns that the report will be based on available data only.

2. **Report Type Selection**: The report type determines the template structure, required sections, visualization types, and default formatting. Each type is optimized for its intended audience and purpose.

3. **Data Extraction**: Relevant data is extracted from analysis results across all domains (financial, legal, operational, strategic, technical). Intelligence data is extracted if `--include-intel` is specified.

4. **Visualization Generation**: Charts, tables, diagrams, and other visualizations are generated from the extracted data. Visualization types are selected based on the report type and available data. Missing data points are handled gracefully with "data not available" placeholders.

5. **Section Rendering**: Each report section is rendered using the template engine. Sections include variable substitution, conditional content (sections that appear only when relevant data exists), and cross-reference links between sections.

6. **Executive Summary Generation**: The executive summary is generated last, after all detail sections are complete. It synthesizes the key findings, recommendation, and risk factors from across all sections into a concise overview.

7. **Redaction Application**: If redaction is specified, sensitive information is removed or masked according to the redaction level. External redaction removes specific financial figures, personnel names, and intelligence source details. Maximum redaction removes all identifying information.

8. **Format Rendering**: The complete report is rendered into the target format. PDF rendering includes page layout, headers, footers, and table of contents. Markdown rendering includes section navigation links. HTML rendering includes interactive charts.

9. **Quality Validation**: The generated report is validated for completeness (all required sections present), consistency (cross-references resolve), and formatting (page breaks, table alignment, chart rendering).

10. **Output Writing**: The report is written to the specified output path. A verification hash is computed for integrity tracking. The report metadata (generation time, data sources, report version) is recorded.

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `ma-report-generator` | Report rendering and formatting |
| [/ma-analyze](@/commands/ma-analyze.md) | Analysis data | Primary data source for reports |
| [/ma-create](@/commands/ma-create.md) | Deal context | Deal profile and target information |
| [/ma-dashboard](@/commands/ma-dashboard.md) | Report links | Generated reports linked from dashboard |
| [/ma-enforce](@/commands/ma-enforce.md) | Compliance data | Compliance status for compliance reports |
| [/investigate](@/commands/investigate.md) | Intelligence data | OSINT findings for intelligence sections |
| [/intel-export](@/commands/intel-export.md) | Intelligence packaging | Structured intelligence for report integration |
| [NABLA Framework](@/glossary/nabla-infinity.md) | Confidence display | Confidence scores displayed in reports |
| [Quality Gates](@/glossary/quality-gates.md) | Report quality | Report completeness validation |
| [Telemetry](@/glossary/telemetry.md) | Generation [metrics](@/glossary/metrics.md) | Report generation time tracking |

## Best Practices

**Match report type to audience.** Executive briefings for board members, financial detail for the finance team, compliance reports for legal. Using the wrong report type wastes the audience's time and fails to communicate the information they need.

**Always include confidence scores.** The NABLA confidence scores provide critical context for decision-makers. A recommendation based on high-confidence findings carries different weight than one based on limited data.

**Use redaction for external distribution.** Reports shared outside the deal team should always use at least internal-level redaction. Reports shared with external parties (advisors, target company) should use external redaction.

**Generate screening summaries first.** Before investing time in a full due diligence report, generate a screening summary to validate that the deal merits comprehensive reporting. This saves significant effort on deals that will be rejected.

**Version your reports.** As analyses are updated with new data, generate updated reports and maintain the previous versions. Report versioning provides an audit trail of how the deal assessment evolved over time.

**Include intelligence enrichment for comprehensive reports.** The intelligence sections provide context that traditional M&A reports miss. Key personnel networks, digital infrastructure quality, and security posture are increasingly relevant to deal success.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `deal_not_found` | Deal ID does not exist | Verify deal ID with `/ma-status` |
| `no_analysis_data` | Deal has not been analyzed | Run `/ma-analyze` first |
| `template_not_found` | Custom template does not exist | Use default template or verify template name |
| `visualization_failed` | Chart generation error | Check data quality for affected visualization |
| `format_unsupported` | Requested format not available | Use supported format: pdf, markdown, html, json |
| `redaction_incomplete` | Redaction engine encountered ambiguous content | Review and apply manual redaction markers |
| `output_write_failed` | Cannot write to specified path | Check directory permissions and disk space |
| `intel_not_available` | Intelligence data requested but not collected | Run `/investigate` for target or omit intel sections |

## Advanced Usage

### Custom Report Templates

Create organization-specific report templates.

```bash
# Create custom template from existing report
/ma-report DEAL-2026-001 --save-template=org-standard

# Use custom template
/ma-report DEAL-2026-002 --template=org-standard --format=pdf

# List available templates
/ma-report --list-templates
```

### Automated Report Generation

Schedule recurring report generation.

```bash
# Weekly status report for all active deals
/ma-report --batch=active-deals --type=screening-summary --schedule=weekly

# Generate reports on analysis completion
/ma-report --on-trigger=analysis-complete --type=due-diligence --format=pdf
```

### Multi-Language Reports

Generate reports in multiple languages for international deal teams.

```bash
# Generate in multiple languages
/ma-report DEAL-2026-001 --language=en --output=report-en.pdf
/ma-report DEAL-2026-001 --language=de --output=report-de.pdf
/ma-report DEAL-2026-001 --language=cs --output=report-cs.pdf
```

### Presentation Generation

Generate presentation-ready outputs for stakeholder meetings.

```bash
# PowerPoint presentation
/ma-report DEAL-2026-001 --type=executive-briefing --format=pptx

# Presentation with custom branding
/ma-report DEAL-2026-001 --type=executive-briefing --format=pptx --branding=formal
```

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete execution or quality violations. Reports include all available data for requested sections or explicitly document why data is unavailable. No section is silently omitted.
- **NO DOUBTS**: Full investigation before action, evidence-based results. Every finding in the report includes provenance, confidence scoring, and data quality indicators. Reports are evidence documents, not opinion pieces.

## Related Commands

- [/ma-create](@/commands/ma-create.md) - Create new M&A deal with target profiling and initial assessment
- [/ma-analyze](@/commands/ma-analyze.md) - Comprehensive M&A analysis including financial, legal and operational review
- [/ma-dashboard](@/commands/ma-dashboard.md) - M&A deal pipeline dashboard with real-time status tracking
- [/ma-status](@/commands/ma-status.md) - M&A deal pipeline status overview and progress tracking
- [/ma-enforce](@/commands/ma-enforce.md) - M&A enforcement actions for deal compliance and deadline tracking
- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/intel-export](@/commands/intel-export.md) - Generate comprehensive intelligence packages for external LLM analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)