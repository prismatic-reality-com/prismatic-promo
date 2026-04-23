+++
title = "/cer-vet"
weight = 1630
[extra]
category = "Compliance"
description = "Czech company vetting using 8-digit ICO identifier"
syntax = "/cer-vet [options]"
authority = "L2+"
agent = "cer-compliance-commander"
status = "Production"
usage = "medium"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1236
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["cer-vet", "Czech", "8-digit", "commands", "Compliance", "Prismatic Platform", "ARES"]
tags = ["commands", "compliance", "cer-vet", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/cer-vet - Prismatic Platform"
+++

## Overview

The **/cer-vet** command performs comprehensive supplier vetting for Czech Critical Entity Resilience (CER) compliance as required by Section 18 of Law 266/2025 Sb. -- the Supplier Due Diligence obligation. Given an 8-digit Czech ICO (company identification number), this command executes a multi-dimensional assessment of a supplier's legal status, financial health, beneficial ownership structure, sanctions exposure, and supply chain risk profile. The result is an evidence-based compliance determination that enables critical infrastructure operators to make informed decisions about supplier relationships within their essential service delivery chains.

Supply chain security has emerged as a primary concern in the European regulatory framework for critical infrastructure protection. The Czech transposition of the CER Directive recognizes that the resilience of essential services depends not only on the operator's own capabilities but also on the reliability and integrity of its supplier network. Section 18 of Law 266/2025 Sb. imposes explicit due diligence requirements on critical entities with respect to their suppliers, including verification of beneficial ownership, assessment of financial stability, and screening against sanctions lists. The **/cer-vet** command automates this entire due diligence workflow, aggregating data from ARES (the Czech Administrative Register of Economic Subjects), the Commercial Register (OR.cz), the ISIR insolvency register, international sanctions databases, and PEP (Politically Exposed Persons) screening services into a unified risk assessment.

The command is executed by the `cer-compliance-commander` agent, a strategic-command-level agent within the [AIAD](@/glossary/aiad.md) (Autonomous Intelligence Agent Design) framework. It supports three depth levels -- quick preliminary assessments, standard vetting, and comprehensive deep-dive analyses that include subsidiary mapping and extended beneficial ownership chains. Batch vetting via CSV file import enables organizations to vet their entire supplier portfolio efficiently. The command forms part of the Prismatic Platform's 216-command slash command [registry](@/glossary/registry-otp.md) and works in concert with [/cer-screen](@/commands/cer-screen.md) for personnel verification and [/cer-report](@/commands/cer-report.md) for aggregated compliance reporting.

## Usage

```bash
/cer-vet <ico> [--depth <level>] [--include-subsidiaries] [--include-ubo] [--output <format>] [--file <csv_path>]
```

### Basic Supplier Vetting

```bash
# Standard supplier vetting by ICO
/cer-vet 12345678

# Quick preliminary assessment for initial evaluation
/cer-vet 12345678 --depth quick
```

### Comprehensive Vetting

```bash
# Full comprehensive vetting with all checks
/cer-vet 12345678 --depth comprehensive

# Include subsidiary company analysis
/cer-vet 12345678 --depth comprehensive --include-subsidiaries

# Full vetting with JSON output for system integration
/cer-vet 12345678 --depth comprehensive --include-subsidiaries --output json
```

### Batch Supplier Vetting

```bash
# Vet multiple suppliers from CSV file (one ICO per line)
/cer-vet --file suppliers.csv --output json

# Comprehensive batch vetting
/cer-vet --file suppliers.csv --depth comprehensive --output csv
```

### UBO Analysis Control

```bash
# Vetting without Ultimate Beneficial Owner analysis
/cer-vet 12345678 --include-ubo false

# Full vetting with UBO and subsidiaries
/cer-vet 12345678 --depth comprehensive --include-ubo --include-subsidiaries
```

## Options and Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `ico` | string | Yes (unless `--file`) | -- | Czech company ICO (8-digit identification number) |
| `--depth` | enum | No | `standard` | Vetting depth: `quick` (basic checks), `standard` (full registry scan), `comprehensive` (deep analysis with ownership chains) |
| `--include-subsidiaries` | boolean | No | `false` | Include analysis of subsidiary and affiliated companies |
| `--include-ubo` | boolean | No | `true` | Include Ultimate Beneficial Owner (UBO) discovery and analysis |
| `--output` | enum | No | `table` | Output format: `table`, `json`, `csv` |
| `--file` | path | No | -- | CSV file path for batch vetting; one ICO per line |

## Authority and Access

| Property | Value |
|----------|-------|
| **Authority Level** | L2+ (Strategic Command) |
| **Executing Agent** | `cer-compliance-commander` |
| **Agent Classification** | L1 Strategic Commander |
| **Status** | Production |
| **Usage Frequency** | Medium |
| **Category** | Compliance |
| **Domain** | CER / Supplier Vetting |
| **AIAD Version** | 1.0.0 |
| **Minimum Clearance** | Procurement Compliance Officer or CER Designated Administrator |

## Technical Implementation

The **/cer-vet** command orchestrates a multi-phase supplier assessment pipeline through the `cer-compliance-commander` agent. The vetting engine resolves the target company by ICO, executes parallel queries across Czech and international registries, and synthesizes findings into a composite risk score with supporting evidence.

```elixir
defmodule Prismatic.CER.Vetting do
  @moduledoc """
  Supplier vetting engine for CER Law 266/2025 Sb. Section 18 compliance.
  Performs beneficial owner analysis, financial health assessment, and sanctions screening.
  """

  @depth_sources %{
    quick: [:ares, :isir, :sanctions],
    standard: [:ares, :isir, :commercial_register, :sanctions, :pep, :court_cases, :executors],
    comprehensive: [:ares, :isir, :commercial_register, :sanctions, :pep, :court_cases,
                    :executors, :financial_statements, :ubo_chain, :subsidiaries, :supply_chain]
  }

  @spec vet(String.t(), keyword()) :: {:ok, VettingResult.t()} | {:error, term()}
  def vet(ico, opts \\ []) do
    depth = Keyword.get(opts, :depth, :standard)
    sources = Map.fetch!(@depth_sources, depth)

    with {:ok, entity} <- resolve_company(ico),
         {:ok, results} <- query_sources(entity, sources, opts),
         {:ok, ubo} <- maybe_discover_ubo(entity, opts),
         {:ok, risk} <- calculate_supplier_risk(results, ubo, depth) do
      {:ok, build_vetting_result(entity, results, ubo, risk)}
    end
  end

  defp resolve_company(ico) do
    with {:ok, ares_data} <- Prismatic.CER.ARES.lookup(ico),
         {:ok, or_data} <- Prismatic.CER.CommercialRegister.lookup(ico) do
      {:ok, merge_company_data(ares_data, or_data)}
    end
  end

  defp maybe_discover_ubo(entity, opts) do
    if Keyword.get(opts, :include_ubo, true) do
      Prismatic.CER.UBO.discover_chain(entity.ico)
    else
      {:ok, []}
    end
  end
end
```

The depth parameter controls which data sources are queried, enabling operators to balance thoroughness against execution time. A `quick` vetting (typically completing in 2-3 seconds) checks only the essential registries -- ARES for company existence and basic data, ISIR for insolvency status, and sanctions lists for international restrictions. A `standard` vetting (5-10 seconds) adds the full Commercial Register record, PEP screening, court case searches, and executor proceedings. A `comprehensive` vetting (10-20 seconds) extends further to financial statement analysis, multi-level UBO chain discovery, subsidiary mapping, and supply chain dependency assessment.

The UBO discovery engine traverses ownership chains through the Commercial Register, identifying natural persons who ultimately control the company. For complex corporate structures with multiple layers of intermediate entities, the engine follows ownership links to a configurable depth (default: 4 levels), flagging any beneficial owners who themselves appear in insolvency, sanctions, or PEP databases.

## Workflow Integration

The **/cer-vet** command integrates into supplier lifecycle management at several touchpoints. During **supplier onboarding**, procurement teams execute a `standard` or `comprehensive` vetting before approving new supplier relationships. The vetting result includes a clear `APPROVED` or `NOT RECOMMENDED` determination with supporting evidence, providing the due diligence documentation required by Law 266/2025 s.18.

For **ongoing supplier monitoring**, batch vetting runs periodically (typically quarterly or semi-annually) against the full supplier portfolio. The CSV import enables seamless integration with procurement management systems -- export the supplier ICO list, run the batch vet, and import results back into the vendor management platform.

During **contract renewal**, a fresh comprehensive vetting is recommended to verify that supplier risk profiles have not deteriorated since initial onboarding. Changes in beneficial ownership, insolvency filings, or sanctions list additions that occurred between vetting cycles are surfaced immediately.

All vetting results automatically aggregate into [/cer-report](@/commands/cer-report.md) compliance reports, providing the supplier due diligence statistics required for the annual CER compliance submission.

## Integration Points

| Component | Relationship |
|-----------|-------------|
| [Prismatic Agents](@/glossary/prismatic-agents.md) | Executed by `cer-compliance-commander` agent |
| [/cer-report](@/commands/cer-report.md) | Vetting results aggregate into compliance reports |
| [/cer-screen](@/commands/cer-screen.md) | Employee screening with supplier context correlation |
| [/investigate](@/commands/investigate.md) | Deep OSINT investigation for flagged suppliers |
| AIAD Registry | Command specification and discovery |
| [Quality Gates](@/glossary/quality-gates.md) | Pre/post execution quality validation |
| [Telemetry](@/glossary/telemetry.md) | Command execution [metrics](@/glossary/metrics.md) and event tracking |
| ARES / Commercial Register | Czech company registry data sources |
| ISIR / Courts / Executors | Czech legal and insolvency registries |
| Sanctions / PEP Databases | International sanctions and politically exposed persons screening |
| Prismatic REST API | Programmatic access via `POST /api/cer/vet` |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](@/glossary/no-mercy-no-doubts.md)** doctrine:

- **NO MERCY**: Zero tolerance for incomplete vetting. Every data source appropriate for the selected depth level must return a definitive result or an explicit error status. No supplier is marked as `APPROVED` if any critical registry query failed. Batch vetting processes every ICO or fails with a clear manifest of which suppliers could not be vetted and why. Invalid ICO formats are rejected immediately with actionable error messages.
- **NO DOUBTS**: Full investigation of all configured data sources before rendering a compliance determination. The UBO discovery engine follows ownership chains exhaustively rather than stopping at the first beneficial owner found. When registry data conflicts with sanctions data (for example, a company showing active status in ARES but appearing on a sanctions list), both signals are preserved with explicit conflict markers. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework ensures that vetting determinations are never based on a single data source.
- **Regression Protection**: All vetting logic includes regression test suites that validate risk calculations and UBO discovery against known reference companies. Changes to scoring algorithms, source integration, or depth configuration trigger mandatory re-validation.

## Best Practices

1. **Start with standard depth**: For most supplier evaluations, `standard` depth provides sufficient coverage. Reserve `comprehensive` depth for high-value suppliers, critical infrastructure components, or suppliers with complex ownership structures.
2. **Always include UBO analysis**: Ultimate Beneficial Owner discovery is enabled by default for good reason. Hidden ownership by sanctioned or politically exposed persons is a primary regulatory concern under CER law.
3. **Enable subsidiary analysis for large suppliers**: Use `--include-subsidiaries` for major suppliers to identify subsidiary companies that may introduce additional risk into the supply chain.
4. **Use batch vetting for portfolio reviews**: Export your supplier ICO list from procurement systems and use `--file` for efficient portfolio-wide vetting rather than running individual queries.
5. **Maintain vetting history**: Archive all vetting results with timestamps to demonstrate continuous due diligence compliance during regulatory audits. JSON output is recommended for archival integration.
6. **Re-vet on ownership changes**: When you become aware of ownership changes in a supplier, run an immediate comprehensive re-vet rather than waiting for the next scheduled batch cycle.

## Related Commands

- [/cer-report](@/commands/cer-report.md) - Czech company compliance report generation from ICO identifier
- [/cer-screen](@/commands/cer-screen.md) - Employee screening for compliance and background verification
- [/investigate](@/commands/investigate.md) - Launch comprehensive [OSINT](@/glossary/osint.md) investigation across 121+ sources
- [/email-osint](@/commands/email-osint.md) - Email-based OSINT gathering with breach correlation and social profiling
- [/google-hacking](@/commands/google-hacking.md) - Google dorking and advanced search intelligence extraction

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)