+++
title = "/cer-screen"
weight = 1620
[extra]
category = "Compliance"
description = "Employee screening for compliance and background verification"
syntax = "/cer-screen [options]"
authority = "L2+"
agent = "cer-screening-specialist"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1233
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cer-screen", "Employee", "commands", "Compliance", "Prismatic Platform", "Czech", "OSINT"]
tags = ["commands", "compliance", "cer-screen", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/cer-screen - Prismatic Platform"
+++

## Overview

The **/cer-screen** command executes comprehensive employee screening for Czech Critical Entity Resilience (CER) compliance as mandated by Law 266/2025 Sb. This command performs multi-source background verification against Czech legal registries, OSINT intelligence databases, and financial exposure indicators to produce an evidence-based risk assessment for individual employees or batch populations. The screening determines whether personnel meet the security and reliability requirements imposed on employees of critical infrastructure operators, particularly those with access to sensitive systems, classified information, or essential service delivery chains.

Employee vetting is not merely a recommended practice under Czech CER law -- it is a statutory obligation. Section 15 of Law 266/2025 Sb. requires designated critical entities to implement personnel screening programs proportionate to the access level and risk exposure of each position. Failure to maintain adequate screening programs can result in regulatory sanctions, including financial penalties and, in severe cases, revocation of critical entity designation. The **/cer-screen** command automates this obligation by aggregating data from the ISIR (Insolvency Register), Czech court case databases, executor registries, the Commercial Register (OR.cz), and OSINT digital profile intelligence into a unified risk score with interpretable decision rationale.

The command is executed by the `cer-screening-specialist` agent, a domain-expertise-level agent within the Prismatic Platform's [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) framework. It supports both individual screening -- where a single employee is assessed in real-time -- and batch screening via CSV file import, enabling organizations to process entire workforce populations efficiently. The epistemic intelligence layer applies the platform's [NABLA Infinity](/glossary/nabla-infinity/) framework to ensure that risk scores are grounded in signal plurality rather than single-source determinations, with full interpretability reporting available for audit and regulatory review purposes. As part of the 216-command slash command [registry](/glossary/registry-otp/), it integrates seamlessly with [/cer-report](/commands/cer-report/) for aggregated compliance reporting and [/cer-vet](/commands/cer-vet/) for supplier-side due diligence.

## Usage

```bash
/cer-screen <name> [--birth-date <YYYY-MM-DD>] [--position <title>] [--access-level <level>] [--email <address>] [--ico <employer_ico>] [--output <format>] [--file <csv_path>] [--interpretable] [--audit-trail]
```

### Basic Employee Screening

```bash
# Screen employee by name
/cer-screen "Jan Novak"

# Screen with birth date for more accurate results
/cer-screen "Jan Novak" --birth-date 1985-03-15
```

### Enhanced Screening with Full Context

```bash
# Critical infrastructure access screening with all parameters
/cer-screen "Jan Novak" --birth-date 1985-03-15 --position "IT Administrator" --access-level critical --email jan.novak@company.cz

# Screening with employer context for supplier risk correlation
/cer-screen "Jan Novak" --birth-date 1985-03-15 --ico 12345678 --interpretable
```

### Batch Screening

```bash
# Screen multiple employees from CSV file
/cer-screen --file employees.csv --output json

# CSV format: name,birth_date,position,access_level,email
```

### Output Format Selection

```bash
# Table output for terminal review (default)
/cer-screen "Jan Novak" --output table

# JSON output for API integration
/cer-screen "Jan Novak" --output json --audit-trail

# CSV output for spreadsheet import
/cer-screen "Jan Novak" --output csv
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes (unless `--file`) | -- | Employee full name to screen |
| `--birth-date` | date | No | -- | Birth date in `YYYY-MM-DD` format; significantly improves match accuracy |
| `--position` | string | No | -- | Job position or title; used for risk weighting |
| `--access-level` | enum | No | `basic` | Access level: `basic`, `elevated`, `critical`; determines screening depth and risk thresholds |
| `--email` | string | No | -- | Email address for OSINT digital profile checks including breach exposure |
| `--ico` | string | No | -- | Employer ICO for supplier risk correlation analysis |
| `--output` | enum | No | `table` | Output format: `table`, `json`, `csv` |
| `--file` | path | No | -- | CSV file path for batch screening; one employee per row |
| `--interpretable` | boolean | No | `false` | Include full interpretability report explaining each risk factor's contribution |
| `--audit-trail` | boolean | No | `false` | Include complete audit trail with data source timestamps and query details |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ (Domain Expertise) |
| **Executing Agent** | `cer-screening-specialist` |
| **Agent Classification** | L2 Domain Specialist |
| **Status** | Production |
| **Usage Frequency** | Medium |
| **Category** | Compliance |
| **Domain** | CER / Employee Screening |
| **AIAD Version** | 1.0.0 |
| **Minimum Clearance** | HR Compliance Officer or CER Designated Administrator |

## Technical Implementation

The **/cer-screen** command delegates to the `cer-screening-specialist` agent, which orchestrates parallel queries across multiple Czech legal registries and OSINT data sources. The screening pipeline follows a fan-out/fan-in pattern: all data source queries execute concurrently with individual timeouts, and results are aggregated into a unified risk assessment using weighted scoring.

```elixir
defmodule Prismatic.CER.Screening do
  @moduledoc """
  Employee screening engine for CER Law 266/2025 Sb. compliance.
  Performs multi-source background verification with epistemic intelligence.
  """

  @sources [:isir, :court_cases, :executors, :commercial_register, :osint_digital, :osint_legal, :supplier_risk]

  @spec screen(String.t(), keyword()) :: {:ok, ScreeningResult.t()} | {:error, term()}
  def screen(name, opts \\ []) do
    params = build_screening_params(name, opts)

    with {:ok, results} <- query_all_sources(params),
         {:ok, risk} <- calculate_risk_score(results, params),
         {:ok, compliance} <- determine_compliance(risk, params) do
      {:ok, build_result(params, results, risk, compliance)}
    end
  end

  defp query_all_sources(params) do
    tasks =
      @sources
      |> Enum.map(fn source ->
        Task.async(fn -> {source, query_source(source, params)} end)
      end)

    results =
      tasks
      |> Task.await_many(30_000)
      |> Map.new()

    {:ok, results}
  end

  defp calculate_risk_score(results, params) do
    access_weights = access_level_weights(params.access_level)

    score =
      results
      |> Enum.reduce(0.0, fn {source, findings}, acc ->
        weight = Map.get(access_weights, source, 1.0)
        acc + source_risk_contribution(findings) * weight
      end)
      |> normalize_score()

    {:ok, %{score: score, level: risk_level(score), confidence: calculate_confidence(results)}}
  end
end
```

The risk calculation engine applies access-level-dependent weighting to each data source's findings. For employees with `critical` access level, insolvency and financial exposure findings receive amplified weighting, reflecting the elevated risk that financial distress poses to individuals with access to critical systems. The confidence score reflects the completeness of data source responses -- if a registry query times out or returns an error, the confidence is reduced accordingly, and the screening result explicitly flags the incomplete coverage.

The interpretability report, enabled via `--interpretable`, provides a complete breakdown of each risk factor's contribution to the final score, following the platform's epistemic transparency requirements. This report is designed to satisfy the regulatory requirement that screening decisions be explainable and auditable.

## Workflow Integration

The **/cer-screen** command supports three primary workflow patterns. In the **onboarding workflow**, new employees are screened before being granted access to critical systems. The screening result feeds directly into access provisioning systems, with `critical` access level screenings requiring explicit management approval for any employee flagged with elevated risk.

In the **continuous monitoring workflow**, batch screening is executed on a periodic schedule (typically quarterly) against the entire workforce population. The batch CSV import capability enables integration with HR information systems -- export the employee roster, run the batch screen, and feed the results back into the compliance management platform.

In the **ad-hoc investigation workflow**, individual employees are screened in response to specific triggers such as role changes, security incidents, or regulatory inquiries. The `--interpretable` and `--audit-trail` flags provide the detailed evidence documentation required for these investigative contexts.

Screening results aggregate automatically into [/cer-report](/commands/cer-report/) compliance reports, providing the employee screening statistics required for the annual CER compliance submission.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `cer-screening-specialist` agent |
| [/cer-report](/commands/cer-report/) | Screening results aggregate into compliance reports |
| [/cer-vet](/commands/cer-vet/) | Supplier risk correlation via `--ico` parameter |
| [/investigate](/commands/investigate/) | Deep OSINT investigation for flagged individuals |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](/glossary/quality-gates/) | Pre/post execution quality validation |
| [Telemetry](/glossary/telemetry/) | Command execution [metrics](/glossary/metrics/) and event tracking |
| ISIR / Czech Courts / Executors | Czech legal registry data sources |
| OSINT Intelligence | Breach exposure, digital footprint, dark web signals |
| Prismatic REST API | Programmatic access via `POST /api/cer/screen` |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete screenings. Every data source must return a definitive result or an explicit timeout/error status. No screening is marked as "passed" if any critical data source failed to respond. Batch screenings process every row or fail with a clear manifest of which employees were not screened and why.
- **NO DOUBTS**: Full investigation across all configured data sources before rendering a compliance determination. The epistemic intelligence layer enforces signal plurality -- a `LOW` risk determination requires corroborating evidence from multiple independent sources. When data sources produce contradictory signals (for example, a clean ISIR record but breach exposure via OSINT), the contradiction is preserved in the screening result rather than suppressed, with explicit confidence adjustments.
- **Regression Protection**: All screening logic includes regression test suites that validate risk score calculations against known reference cases. Changes to scoring weights or data source integration trigger mandatory re-validation of the full test corpus.

## Best Practices

1. **Always include birth date**: Name-only screening can produce ambiguous matches, especially for common Czech names. Including `--birth-date` dramatically improves match accuracy and reduces false positives.
2. **Use appropriate access levels**: Set `--access-level` to match the actual access tier of the employee's position. This ensures risk weighting is proportionate to the actual threat surface.
3. **Enable interpretability for flagged employees**: When a screening returns `HIGH` risk, re-run with `--interpretable` to generate the detailed breakdown needed for management review and regulatory documentation.
4. **Schedule batch screenings quarterly**: Czech CER regulations expect ongoing monitoring, not just point-of-hire screening. Quarterly batch runs detect changes in employee risk profiles between hiring events.
5. **Retain audit trails**: For regulatory compliance, always generate screening results with `--audit-trail` enabled and archive the output. Audit trails provide the provenance documentation required during regulatory inspections.
6. **Correlate with employer data**: Using `--ico` to specify the employer enables supplier risk correlation, which can surface conflicts of interest or dependency risks not visible from individual screening alone.

## Related Commands

- [/cer-report](/commands/cer-report/) - Czech company compliance report generation from ICO identifier
- [/cer-vet](/commands/cer-vet/) - Czech company vetting using 8-digit ICO identifier
- [/investigate](/commands/investigate/) - Launch comprehensive [OSINT](/glossary/osint/) investigation across 121+ sources
- [/email-osint](/commands/email-osint/) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](/commands/google-hacking/) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)