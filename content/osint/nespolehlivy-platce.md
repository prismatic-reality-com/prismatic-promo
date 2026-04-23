+++
title = "Nespolehlivy Platce"
weight = 38
[extra]
category = "czech"
type = "financial"
module = "NespolehlivyPlatce"
description = "Unreliable VAT Payer List - Czech Financial Administration registry of entities flagged for serious VAT compliance failures"
has_api = true
url = "https://adisreg.mfcr.cz/adistc/DphReg"
rate_limit = "Public access via ADIS"
capabilities = ["Unreliable Status Check", "Flagging Date Lookup", "Reason Classification", "Published Account Verification", "Batch Screening", "Historical Status"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1476
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Nespolehlivy", "Platce", "Unreliable", "Payer", "List", "Czech", "Financial", "Administration", "osint", "Prismatic Platform"]
tags = ["osint", "czech", "nespolehlivy-platce", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Nespolehlivy Platce - Prismatic Platform"
+++

## Overview

Nespolehlivy Platce DPH (Unreliable VAT Payer) is a public list maintained by the Czech Financial Administration (Financni sprava) under Section 106a of Act No. 235/2004 Coll. (VAT Act, Zakon o dani z pridane hodnoty). Entities are placed on this list when they seriously breach their VAT obligations -- including repeated failure to file VAT returns, failure to pay assessed VAT, or engaging in transactions designed to evade VAT. The designation carries severe business consequences: any entity paying an unreliable VAT payer to an account not published in the [DPH](@/osint/dph.md) [registry](@/glossary/registry-otp.md) becomes jointly liable for the unpaid VAT (guarantee liability under Section 109 VAT Act).

This joint liability mechanism (ruceni za nezaplacenou dan) creates a powerful incentive for all Czech businesses to screen their trading partners before making VAT-relevant payments. Failure to verify a trading partner's reliability status and published bank accounts can result in the paying entity being held responsible for the VAT obligations of its unreliable supplier. This makes the Unreliable VAT Payer list one of the most operationally significant Czech public registers for business compliance.

For OSINT purposes, this list is one of the strongest negative indicators available in Czech public registers. Designation as an unreliable payer signals serious financial distress, tax evasion, or administrative neglect. It is a critical screening input for any business engagement with Czech entities, particularly for supply chain due diligence and KYC/AML processes. The presence of an entity on this list materially increases the risk profile of any transaction involving that entity and warrants enhanced due diligence through correlated sources such as [ARES](@/osint/ares.md), [Justice.cz](@/osint/justice-cz.md), and the [Insolvency Register](@/osint/insolvencni-rejstrik.md).

## Data Sources and Coverage

The Unreliable VAT Payer list is maintained by regional tax offices (uzemni financni organy) under the coordination of the General Financial Directorate (Generalni financni reditelstvi). Each designation is issued by the competent tax administrator based on documented VAT compliance failures. The list is published through the ADIS (Automated Tax Information System) register operated by the Ministry of Finance.

| Data Type | Description | Authority |
|-----------|-------------|-----------|
| **DIC** | Tax identification number of unreliable payer | Financial Administration |
| **ICO** | Company identification number | Cross-referenced with ARES |
| **Entity Name** | Name of the flagged entity | Official register name |
| **Flagging Date** | Date of unreliable designation | Tax administrator decision |
| **Reason** | Category of VAT violation | Classified by violation type |
| **Published Accounts** | Bank accounts (or lack thereof) | Critical for liability |
| **Status** | Currently unreliable, or designation removed | Updated in real-time |

### Flagging Criteria

The Czech Financial Administration designates entities as unreliable VAT payers based on specific criteria defined in law and methodological guidance:

| Reason | Description | Severity |
|--------|-------------|----------|
| **Repeated Non-Filing** | 3+ consecutive missed VAT returns | High |
| **VAT Arrears** | Significant unpaid VAT liabilities | High |
| **Missing Accounts** | No published bank accounts | Medium |
| **Fraud Indicators** | Involvement in carousel fraud patterns | Critical |
| **Administrator Designation** | Tax administrator discretionary decision | Variable |

### Legal Framework

The Unreliable VAT Payer regime is governed by several interconnected provisions of Czech tax law. Section 106a of the VAT Act establishes the criteria for designation, while Section 109 creates the guarantee liability mechanism that makes screening operationally mandatory. The General Financial Directorate has published methodological guidance (Information GFR No. D-17) that provides detailed criteria for designation decisions, including specific thresholds for non-filing periods and arrears amounts.

## Technical Architecture

The Prismatic Platform integrates the Unreliable VAT Payer list through a dual-access architecture. The primary data source is the ADIS register maintained by the Ministry of Finance (MFCR), which provides the authoritative list. A secondary access path through the ARES system enables cross-referencing with broader entity data including company names, addresses, and NACE codes.

The adapter implements an aggressive caching strategy with a 4-hour TTL, balancing data freshness against the rate at which new designations are issued (typically a few per day). The cache is warmed on application startup by loading the complete unreliable payer list, enabling O(1) lookups during batch screening operations.

For batch screening workflows, the adapter supports parallel processing with configurable concurrency limits. A batch of 1,000 entities can be screened against the unreliable payer list in under 5 seconds using the pre-loaded cache, compared to several minutes of sequential API calls without caching.

Data normalization handles the various formats in which tax identification numbers (DIC) and company identification numbers (ICO) appear across Czech registers, ensuring consistent matching regardless of whether the input includes the "CZ" country prefix or leading zeros.

## API Integration

The Unreliable VAT Payer list provides a critical negative screening layer within the Prismatic platform, integrated tightly with [DPH](@/osint/dph.md) registry data and entity verification from [ARES](@/osint/ares.md).

```elixir
# Check if entity is unreliable
{:ok, check} = NespolehlivyPlatce.check("CZ12345678")
# => %{
#   dic: "CZ12345678",
#   ico: "12345678",
#   unreliable: true,
#   flagged_since: ~D[2024-06-15],
#   reason: :repeated_non_filing,
#   published_accounts: []
# }

# Batch screening
{:ok, results} = NespolehlivyPlatce.batch_check([
  "CZ12345678", "CZ87654321", "CZ11223344"
])
# => [
#   %{dic: "CZ12345678", unreliable: true},
#   %{dic: "CZ87654321", unreliable: false},
#   %{dic: "CZ11223344", unreliable: false}
# ]

# Check with full context (includes ARES data)
{:ok, full} = NespolehlivyPlatce.check_with_context("CZ12345678")

# Monitor for new additions
{:ok, new_additions} = NespolehlivyPlatce.recent_additions(since: ~D[2025-01-01])

# Get full unreliable payer list
{:ok, full_list} = NespolehlivyPlatce.full_list()
```

### Vendor Screening Pipeline

```elixir
defmodule PrismaticPerimeter.Compliance.VendorScreening do
  @moduledoc """
  Screens vendors for VAT reliability as part of
  supplier onboarding and ongoing monitoring.
  """

  def screen_vendor(ico) do
    dic = "CZ#{ico}"

    with {:ok, unreliable} <- NespolehlivyPlatce.check(dic),
         {:ok, vat_status} <- Dph.validate(dic),
         {:ok, company} <- Ares.get_full_details(ico),
         {:ok, insolvency} <- InsolvencniRejstrik.check(ico) do
      {:ok, %{
        entity: company,
        vat_status: vat_status,
        unreliable_payer: unreliable.unreliable,
        insolvency_proceedings: insolvency.has_proceedings,
        guarantee_liability_risk: unreliable.unreliable && Enum.empty?(unreliable.published_accounts),
        overall_risk: calculate_vendor_risk(unreliable, insolvency),
        recommended_action: recommend_action(unreliable, insolvency),
        safe_payment_accounts: vat_status.published_accounts
      }}
    end
  end
end
```

## Use Cases

### Payment Risk Mitigation
- Screen all vendors before payment to avoid guarantee liability under Section 109 of the VAT Act
- Verify published bank accounts before VAT-relevant transfers to ensure payments go to registered accounts
- Implement automated payment blocking for unreliable payers to prevent inadvertent liability
- Combine with [DPH](@/osint/dph.md) for complete VAT compliance covering both registration status and published accounts

### Supplier Due Diligence
- Red-flag unreliable payers during vendor onboarding to prevent onboarding of high-risk suppliers
- Ongoing monitoring of existing supplier base through periodic batch rescreening
- Cross-reference with [Insolvency Register](@/osint/insolvencni-rejstrik.md) for correlated distress signals
- Include in comprehensive checks with [ARES](@/osint/ares.md) and [Justice.cz](@/osint/justice-cz.md) for complete entity profiling

### Fraud Detection
- Identify potential carousel fraud participants by analyzing networks of unreliable payers and their trading relationships
- Track entities cycling between unreliable and reliable status, which may indicate manipulative compliance behavior
- Map networks of related unreliable payers through shared directors, addresses, or bank accounts
- Support [Hlidac Statu](@/osint/hlidac-statu.md) anti-corruption analysis with VAT compliance intelligence

### Regulatory Compliance
- Automated compliance with Czech VAT Act requirements for trading partner verification
- Audit trail generation for VAT compliance documentation
- NIS2 supply chain risk management for entities in critical infrastructure sectors

## Data Quality

The Unreliable VAT Payer list benefits from its status as an official government register maintained by the Czech Financial Administration. Designations are based on documented compliance failures and follow established legal procedures, providing high confidence in the accuracy of entries.

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Authority** | Excellent -- official government register with legal backing | Section 106a VAT Act |
| **Currency** | High -- updated as designations are issued/removed | Near real-time updates |
| **Accuracy** | High -- based on documented compliance failures | Tax administrator verification |
| **Completeness** | High for VAT-registered entities; N/A for non-VAT entities | Scope limited to VAT payers |
| **Actionability** | Very high -- direct operational impact on payment decisions | Guarantee liability mechanism |
| **Historical Coverage** | Moderate -- current status always available; history varies | Removed designations less accessible |

### Access Details

| Aspect | Details |
|--------|---------|
| **Authentication** | None required |
| **API** | ADIS register (MFCR), also accessible via ARES |
| **Rate Limit** | No official limit |
| **Data Format** | HTML (web), XML (ARES integration) |
| **Cost** | Free access |
| **Update Frequency** | Updated as designations are issued/removed |

## Platform Integration

Within the Prismatic Platform, the Unreliable VAT Payer list serves as a critical negative indicator in the entity risk scoring pipeline. The adapter integrates with the broader Czech registry ecosystem, cross-referencing unreliable payer status with entity data from ARES, corporate governance data from Justice.cz, insolvency proceedings from the Insolvency Register, and VAT registration details from the DPH registry.

The integration supports three operational modes: real-time single-entity screening (used during interactive investigations), batch screening (used for periodic supplier base rescreening), and continuous monitoring (used for automated alerting when new entities are added to the list or existing entries are modified).

Unreliable payer status feeds into the Prismatic Perimeter security rating through the financial compliance component, where entities designated as unreliable receive significant negative scoring adjustments. The guarantee liability risk assessment combines unreliable payer status with published account availability to produce a specific risk indicator for payment operations.

## NABLA Compliance

The Unreliable VAT Payer list integration adheres to NABLA epistemic framework requirements. The authoritative nature of the source (official government register with legal backing) provides high-confidence signals that satisfy the Source Independence axiom. The Provenance Mandatory axiom is satisfied through attribution to the specific tax administration decision, including designation date, reason classification, and the competent tax office.

Signal Plurality is enforced by requiring corroboration from at least one additional Czech register (typically ARES or the Insolvency Register) before the unreliable payer designation drives automated risk decisions. This prevents false positive scenarios where a designation error could incorrectly block legitimate business relationships.

Time Decay is implemented through cache TTL management and historical status tracking, ensuring that recently removed designations are treated differently from long-standing unreliable status in risk calculations.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| **Single entity check (cached)** | < 5ms | 0.5-2ms |
| **Single entity check (API)** | < 500ms | 200-400ms |
| **Batch screening (1,000 entities)** | < 10s | 3-5s |
| **Full list download** | < 30s | 10-20s |
| **Cache warm-up** | < 60s | 20-40s |
| **Cache hit ratio** | > 90% | 95%+ |

The ETS-backed cache enables O(1) lookups during batch screening operations, dramatically reducing latency compared to sequential API calls. The cache is automatically refreshed every 4 hours, with manual refresh available through the adapter management interface.

## Related Resources

- [DPH](@/osint/dph.md) - VAT payer registry with published bank accounts
- [ARES](@/osint/ares.md) - Entity identification and verification
- [Insolvency Register](@/osint/insolvencni-rejstrik.md) - Insolvency as correlated risk factor
- [Justice.cz](@/osint/justice-cz.md) - Corporate details of flagged entities
- [CNB](@/osint/cnb.md) - Financial entity verification
- [Hlidac Statu](@/osint/hlidac-statu.md) - Cross-referenced entity analytics
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Financial compliance in security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)