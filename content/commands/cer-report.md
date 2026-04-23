+++
title = "/cer-report"
weight = 1610
[extra]
category = "Compliance"
description = "Czech company compliance report generation from ICO identifier"
syntax = "/cer-report [options]"
authority = "L2+"
agent = "cer-compliance-commander"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1149
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cer-report", "Czech", "commands", "Compliance", "Prismatic Platform", "Report"]
tags = ["commands", "compliance", "cer-report", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/cer-report - Prismatic Platform"
+++

## Overview

The **/cer-report** command is the Prismatic Platform's primary compliance report generation facility for Czech critical infrastructure operators subject to the Critical Entity Resilience (CER) framework established by Law 266/2025 Sb. and the NIS2 cybersecurity directive transposed through Law 264/2025 Sb. This command transforms raw compliance data -- screening results, vetting outcomes, risk assessments, and continuous monitoring telemetry -- into structured, auditable reports that satisfy mandatory regulatory disclosure requirements imposed on operators of essential services within the Czech Republic.

The regulatory landscape for critical infrastructure compliance in the Czech Republic underwent a fundamental transformation with the passage of Laws 264/2025 and 266/2025, which transposed the European Union's NIS2 Directive and CER Directive into national legislation. These laws impose rigorous documentation and reporting obligations on designated critical entities, including annual compliance summaries, incident reports within strict notification windows, and comprehensive due diligence documentation for supply chain participants. The **/cer-report** command automates the generation of all mandated report types, ensuring that organizations can meet their regulatory obligations with minimal manual effort while maintaining the evidentiary rigor demanded by Czech regulatory authorities such as NUKIB (the National Cyber and Information Security Agency).

As a member of the Prismatic Platform's Compliance command family, **/cer-report** operates in concert with [/cer-screen](@/commands/cer-screen.md) and [/cer-vet](@/commands/cer-vet.md) to form a complete compliance lifecycle. While `/cer-screen` handles employee background verification and `/cer-vet` performs supplier due diligence, `/cer-report` aggregates findings from both subsystems -- along with risk assessment data and monitoring telemetry -- into publication-ready reports. This command is executed by the `cer-compliance-commander` agent, which coordinates data retrieval across multiple Czech legal [registries](@/glossary/registry-otp.md), [OSINT](@/glossary/osint.md) sources, and internal compliance databases to produce comprehensive documentation. The command is part of the platform's 216-command slash command registry, built on the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) standard.

## Usage

```bash
/cer-report <ico> [--type <report_type>] [--format <output_format>] [--period-start <date>] [--period-end <date>] [--output <path>]
```

### Annual Compliance Report (Default)

```bash
# Generate annual CER report using company ICO
/cer-report 12345678

# Annual report with specific period and PDF output
/cer-report 12345678 --type cer_annual --period-start 2025-01-01 --period-end 2025-12-31 --format pdf
```

### NIS2 Incident Report

```bash
# Generate NIS2 incident report for a specific date range
/cer-report 12345678 --type nis2_incident --period-start 2025-11-15 --format pdf --output incident_report_2025-11-15.pdf
```

### Due Diligence and Risk Assessment Reports

```bash
# Supplier due diligence report in PDF
/cer-report 12345678 --type due_diligence --format pdf

# Risk assessment report with JSON output for programmatic integration
/cer-report 12345678 --type risk_assessment --format json

# Employee screening summary report
/cer-report 12345678 --type employee_screening --output screening_2025.html
```

### Monitoring Summary

```bash
# Continuous monitoring activity summary
/cer-report 12345678 --type monitoring_summary --period-start 2025-10-01 --period-end 2025-12-31
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `ico` | string | Yes | -- | Czech company ICO (8-digit identifier) used as the primary entity key for report generation |
| `--type` | enum | No | `cer_annual` | Report type: `cer_annual`, `nis2_incident`, `due_diligence`, `employee_screening`, `risk_assessment`, `monitoring_summary` |
| `--format` | enum | No | `html` | Output format: `html`, `pdf`, `json` |
| `--period-start` | date | No | -- | Report period start date in `YYYY-MM-DD` format |
| `--period-end` | date | No | -- | Report period end date in `YYYY-MM-DD` format |
| `--output` | path | No | -- | Output file path; when omitted, report renders to standard output |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ (Strategic Command) |
| **Executing Agent** | `cer-compliance-commander` |
| **Agent Classification** | L1 Strategic Commander |
| **Status** | Production |
| **Usage Frequency** | Medium |
| **Category** | Compliance |
| **Domain** | CER / Regulatory Reporting |
| **AIAD Version** | 1.0.0 |
| **Minimum Clearance** | Domain Operator with CER compliance scope |

## Technical Implementation

The **/cer-report** command delegates execution to the `cer-compliance-commander` agent, which orchestrates a multi-phase data aggregation and rendering pipeline. The command handler resolves the target entity by ICO, retrieves all relevant compliance data from internal storage and external registries, applies report-type-specific templates, and produces the final output in the requested format.

```elixir
defmodule Prismatic.CER.ReportGenerator do
  @moduledoc """
  Generates CER/NIS2 compliance reports for Czech critical infrastructure operators.
  Supports multiple report types and output formats per Laws 264/2025 and 266/2025 Sb.
  """

  @report_types ~w(cer_annual nis2_incident due_diligence employee_screening risk_assessment monitoring_summary)a

  @spec generate(String.t(), keyword()) :: {:ok, Report.t()} | {:error, term()}
  def generate(ico, opts \\ []) do
    report_type = Keyword.get(opts, :type, :cer_annual)
    format = Keyword.get(opts, :format, :html)

    with {:ok, entity} <- Prismatic.CER.Registry.resolve_entity(ico),
         {:ok, data} <- aggregate_compliance_data(entity, report_type, opts),
         {:ok, report} <- render_report(data, report_type, format) do
      {:ok, report}
    end
  end

  defp aggregate_compliance_data(entity, :cer_annual, opts) do
    period = extract_period(opts)

    %{
      screenings: Prismatic.CER.Screening.list_results(entity.ico, period),
      vettings: Prismatic.CER.Vetting.list_results(entity.ico, period),
      risk_assessments: Prismatic.CER.Risk.list_assessments(entity.ico, period),
      monitoring: Prismatic.CER.Monitoring.summary(entity.ico, period),
      incidents: Prismatic.CER.Incidents.list(entity.ico, period)
    }
  end
end
```

The report rendering pipeline applies section-specific templates for each report type, computing compliance percentages, risk score distributions, and trend analyses from the aggregated data. PDF output uses a headless rendering engine, while JSON output provides structured data suitable for ingestion by external compliance management platforms. Each generated report includes a cryptographic hash for tamper detection and a unique report identifier for audit trail traceability.

The command also integrates with the Prismatic REST API through the equivalent `mix cer.report` task and the `POST /api/cer/reports` endpoint, enabling programmatic report generation from external systems such as scheduled cron jobs or compliance management dashboards.

## Workflow Integration

The **/cer-report** command fits into several compliance workflow patterns within the Prismatic Platform. In the standard annual compliance cycle, organizations execute `/cer-screen` for employee verification and `/cer-vet` for supplier due diligence throughout the year. At reporting intervals -- typically quarterly for monitoring summaries and annually for the mandatory CER annual report -- the `/cer-report` command aggregates all accumulated compliance data into the appropriate report format.

For incident response workflows, the `nis2_incident` report type supports the 24-hour early warning and 72-hour full notification timelines mandated by Law 264/2025 s.16. Operators can generate incident reports immediately following a cybersecurity event, with the report automatically incorporating timeline data, impact assessments, and response actions recorded during the incident handling process.

The command also supports integration with CI/CD pipelines through its JSON output format, allowing automated compliance dashboards to pull fresh report data on configurable schedules. This enables continuous compliance monitoring rather than point-in-time assessments.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `cer-compliance-commander` agent |
| [/cer-screen](@/commands/cer-screen.md) | Aggregates employee screening results into reports |
| [/cer-vet](@/commands/cer-vet.md) | Aggregates supplier vetting results into reports |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution quality validation |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) and event tracking |
| Prismatic REST API | Programmatic access via `POST /api/cer/reports` |
| Czech Legal Registries | ISIR, ARES, Commercial Register data sourcing |
| NUKIB Reporting | Report format compatibility with regulatory submissions |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete report generation. Every report section must contain verified data or explicitly declare data unavailability. No placeholder content, no estimated values without confidence markers, no partial reports delivered as complete. Report generation either succeeds with full compliance data or fails explicitly with actionable error diagnostics.
- **NO DOUBTS**: Full investigation of all data sources before report assembly. Every claim in a generated report is backed by traceable evidence with provenance metadata. The [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework ensures signal plurality -- compliance determinations are never based on a single data source. Contradiction preservation is enforced: if screening data conflicts with vetting data, both signals are preserved in the report with explicit uncertainty markers rather than arbitrarily resolving the conflict.
- **Regression Protection**: All report templates include automated validation against reference outputs. Any change to the report generation pipeline triggers regression tests that verify output structure, data completeness, and format compliance.

## Best Practices

1. **Schedule annual reports early**: Generate draft CER annual reports at least 30 days before the regulatory deadline to allow time for management review and remediation of any identified gaps.
2. **Use JSON for integration**: When feeding report data into external compliance dashboards or GRC platforms, use `--format json` for structured, machine-parseable output.
3. **Specify explicit date ranges**: Always provide `--period-start` and `--period-end` for reproducible reports. Omitting these parameters uses implicit defaults that may vary between report types.
4. **Archive all reports**: Maintain a complete archive of generated reports with their cryptographic hashes for regulatory audit purposes. Czech law requires retention of compliance documentation for a minimum period following the reporting year.
5. **Combine with continuous monitoring**: Use `monitoring_summary` reports at quarterly intervals to identify compliance drift before it becomes a finding in the annual report.
6. **Validate ICO before bulk operations**: Verify the ICO resolves correctly using `/cer-vet` before generating comprehensive reports to avoid wasted processing on invalid identifiers.

## Related Commands

- [/cer-screen](@/commands/cer-screen.md) - Employee screening for compliance and background verification
- [/cer-vet](@/commands/cer-vet.md) - Czech company vetting using 8-digit ICO identifier
- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction
- /risk-assess - Enterprise risk posture analysis and scoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)