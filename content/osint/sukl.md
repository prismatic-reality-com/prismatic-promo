+++
title = "SUKL"
weight = 33
[extra]
category = "czech"
type = "company"
module = "Sukl"
description = "State Institute for Drug Control (SUKL) - pharmaceutical registry covering medicinal products, pharmacies, clinical trials, and licensed distributors"
has_api = true
url = "https://www.sukl.cz"
rate_limit = "Public database access, API for registered users"
capabilities = ["Drug Registry Search", "Pharmacy Lookup", "Clinical Trial Registry", "Distributor Verification", "Adverse Event Database", "API Numbering"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1145
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["SUKL", "State", "Institute", "Drug", "Control", "osint", "czech", "Prismatic Platform", "Description", "Level"]
tags = ["osint", "czech", "sukl", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "SUKL - Prismatic Platform"
+++

## Overview

SUKL (Statni ustav pro kontrolu leciv, the State Institute for Drug Control) is the Czech Republic's pharmaceutical regulatory authority, operating under Act No. 378/2007 Coll. (on Pharmaceuticals). SUKL maintains comprehensive registries of all authorized medicinal products, licensed pharmacies, clinical trials, pharmaceutical distributors, and adverse drug events in the Czech Republic. As the national competent authority under EU pharmaceutical legislation, SUKL data integrates with the European Medicines Agency (EMA) databases and participates in pan-European regulatory networks.

For [OSINT](/glossary/osint/) purposes, SUKL provides essential intelligence for healthcare sector analysis, pharmaceutical company profiling, clinical trial tracking, and supply chain verification. The pharmacy and distributor registries enable verification of licensed entities in the pharmaceutical supply chain, while the drug [registry](/glossary/registry-otp/) reveals product portfolios and market authorization status. This data is critical for compliance screening in the heavily regulated pharmaceutical sector, where unauthorized distribution or counterfeit medicines represent both legal and public health risks.

The breadth of SUKL's data coverage makes it uniquely valuable for cross-domain intelligence. When combined with entity data from [ARES](/osint/ares/) and [Justice.cz](/osint/justice-cz/), SUKL licensing data validates that pharmaceutical companies actually hold the authorizations they claim. When combined with [EU Sanctions](/osint/eu-sanctions/) screening, it identifies entities that may be subject to trade restrictions on pharmaceutical products. This multi-registry approach is central to the Prismatic platform's Czech entity intelligence capabilities.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Medicinal Products** | Authorized drugs with SUKL codes, ATC classification |
| **Pharmacies** | Licensed pharmacies with addresses and operators |
| **Distributors** | Licensed pharmaceutical distributors |
| **Clinical Trials** | Registered clinical trials in the Czech Republic |
| **Adverse Events** | Pharmacovigilance reports (ADRR) |
| **API Substances** | Active pharmaceutical ingredient registrations |
| **Medical Devices** | Medical device notifications |
| **Pricing** | Maximum prices and reimbursement levels |

### Drug Registry Fields

Each medicinal product entry in the SUKL database contains comprehensive regulatory and commercial information:

| Field | Description |
|-------|-------------|
| **SUKL Code** | Unique product identifier (7-digit code) |
| **Name** | Brand and generic name |
| **ATC Code** | Anatomical Therapeutic Chemical classification |
| **MAH** | Marketing Authorization Holder |
| **Strength** | Active substance dosage |
| **Form** | Pharmaceutical form (tablet, injection, etc.) |
| **Status** | Authorized, suspended, withdrawn |
| **Reimbursement** | Public health insurance reimbursement level |
| **Package Size** | Number of units per package |
| **Route** | Administration route (oral, intravenous, etc.) |
| **ATC Group** | Therapeutic classification group |
| **Registration Number** | EU or national registration reference |

### Pharmacy Registry Fields

The pharmacy registry provides detailed information for license verification and geographic coverage analysis:

| Field | Description |
|-------|-------------|
| **Pharmacy Name** | Official registered name |
| **Operator ICO** | Business identification number of the operating entity |
| **License Number** | SUKL-issued pharmacy license |
| **Address** | Street address with GPS coordinates |
| **Type** | General pharmacy, hospital pharmacy, nuclear pharmacy |
| **Status** | Active, suspended, closed |
| **Operating Hours** | Standard and emergency hours |
| **Services** | Dispensing, compounding, clinical services |

## Integration with Prismatic

SUKL provides the pharmaceutical intelligence layer within the Prismatic platform, enabling healthcare sector analysis and supply chain verification.

```elixir
# Search medicinal products
{:ok, drugs} = Sukl.search_drugs("paracetamol")
# => [
#   %{
#     sukl_code: "0012345",
#     name: "Paralen 500",
#     atc_code: "N02BE01",
#     mah: "Zentiva k.s.",
#     strength: "500 mg",
#     form: :tablet,
#     status: :authorized,
#     reimbursement: %{group: "N02BE01", level: :full}
#   }
# ]

# Search pharmacies by location
{:ok, pharmacies} = Sukl.search_pharmacies(city: "Praha")
# => [%{name: "Lekarna U Zlateho lva", address: "...", operator_ico: "12345678", license: "..."}]

# Verify pharmaceutical distributor
{:ok, distributor} = Sukl.verify_distributor("87654321")

# Search clinical trials
{:ok, trials} = Sukl.clinical_trials(sponsor: "Pfizer", status: :ongoing)

# Get product portfolio for a MAH
{:ok, portfolio} = Sukl.mah_portfolio("Zentiva k.s.")

# Check adverse events for a product
{:ok, events} = Sukl.adverse_events(sukl_code: "0012345")

# Get pricing and reimbursement data
{:ok, pricing} = Sukl.pricing("0012345")

# Search by ATC classification
{:ok, drugs} = Sukl.search_by_atc("N02BE")
```

### Pharmaceutical Supply Chain Verification

The supply chain verification pipeline cross-references SUKL licensing data with company registries and sanctions lists to ensure pharmaceutical supply chain integrity:

```elixir
defmodule PrismaticPerimeter.Healthcare.SupplyChainVerification do
  @moduledoc """
  Verifies pharmaceutical supply chain entities by cross-referencing
  SUKL licensing data with company registers and sanctions lists.
  """

  def verify_pharma_entity(ico) do
    with {:ok, company} <- Ares.get_full_details(ico),
         {:ok, sukl_licenses} <- Sukl.verify_distributor(ico),
         {:ok, rzp_licenses} <- Rzp.get_licenses(ico),
         {:ok, sanctions} <- EuSanctions.search(company.nazev) do
      {:ok, %{
        entity: company,
        sukl_authorization: sukl_licenses,
        trade_licenses: rzp_licenses,
        sanctions_status: sanctions,
        supply_chain_risk: assess_pharma_risk(sukl_licenses, sanctions),
        verification_status: determine_verification(sukl_licenses),
        compliance_summary: generate_compliance_summary(sukl_licenses, rzp_licenses, sanctions)
      }}
    end
  end

  defp assess_pharma_risk(sukl_licenses, sanctions) do
    cond do
      sanctions.hit -> :critical
      sukl_licenses == nil or sukl_licenses == [] -> :high
      expired_license?(sukl_licenses) -> :medium
      true -> :low
    end
  end
end
```

### Market Authorization Holder Analysis

SUKL data enables comprehensive analysis of pharmaceutical market participants and their product portfolios:

```elixir
defmodule PrismaticIntelligence.Pharma.MarketAnalysis do
  @moduledoc """
  Analyzes pharmaceutical market structure using SUKL
  product registry and company intelligence.
  """

  def analyze_mah(mah_name) do
    with {:ok, portfolio} <- Sukl.mah_portfolio(mah_name),
         {:ok, company} <- find_company_by_name(mah_name),
         {:ok, trials} <- Sukl.clinical_trials(sponsor: mah_name) do
      {:ok, %{
        mah: mah_name,
        total_products: length(portfolio),
        active_products: Enum.count(portfolio, &(&1.status == :authorized)),
        therapeutic_areas: extract_atc_groups(portfolio),
        market_share_by_atc: calculate_atc_market_share(portfolio),
        active_clinical_trials: length(trials),
        pipeline_indicators: assess_pipeline(trials),
        company_details: company
      }}
    end
  end
end
```

## EU Regulatory Integration

As a national competent authority, SUKL operates within the broader EU pharmaceutical regulatory framework. This integration ensures data consistency across member states and enables cross-border regulatory intelligence:

| EU System | Integration | Data Exchange |
|-----------|------------|--------------|
| **EMA (European Medicines Agency)** | Centralized procedure participation | Product authorizations |
| **EudraVigilance** | Pharmacovigilance reporting | Adverse event data |
| **EudraCT** | Clinical trial registration | Trial registrations |
| **FMD (Falsified Medicines Directive)** | Serialization verification | Medicine authenticity |
| **EDQM** | European Pharmacopoeia compliance | Quality standards |
| **Article 57 Database** | Product data submission | Marketing authorization data |

### Centralized vs. National Authorization

Understanding the authorization pathway is important for intelligence analysis:

| Authorization Type | Pathway | SUKL Role | Coverage |
|-------------------|---------|-----------|----------|
| **Centralized** | EMA (Brussels) | Enforcement only | All EU member states |
| **Mutual Recognition** | Reference member state | Recognition + enforcement | Multiple member states |
| **Decentralized** | Parallel national review | Active review participant | Multiple member states |
| **National** | SUKL directly | Full authorization | Czech Republic only |

## ATC Classification System

SUKL uses the WHO Anatomical Therapeutic Chemical (ATC) classification to organize medicinal products, enabling systematic analysis of the pharmaceutical market:

| ATC Level | Example | Description |
|-----------|---------|-------------|
| **1st (Anatomical)** | N | Nervous system |
| **2nd (Therapeutic)** | N02 | Analgesics |
| **3rd (Pharmacological)** | N02B | Other analgesics and antipyretics |
| **4th (Chemical)** | N02BE | Anilides |
| **5th (Substance)** | N02BE01 | Paracetamol |

This classification enables sector-wide analysis of pharmaceutical market composition, authorization trends, and competitor portfolios within specific therapeutic areas. The hierarchical structure supports both broad market surveys (level 1-2) and detailed competitive analysis (level 4-5).

### Pharmaceutical Market Intelligence Applications

ATC-based analysis provides strategic intelligence for multiple use cases:

| Analysis Type | ATC Level | Output |
|--------------|-----------|--------|
| **Market Overview** | Level 1 | Therapeutic area market sizes and trends |
| **Competitive Landscape** | Level 3-4 | Product positioning and market share |
| **Pipeline Analysis** | Level 4-5 | Clinical trial activity by therapeutic target |
| **Generic Entry** | Level 5 | Patent expiry and generic competition timeline |
| **Pricing Analysis** | Level 4-5 | Reimbursement levels and pricing comparisons |

## Rate Limits and Access

| Aspect | Details |
|--------|---------|
| **Authentication** | None for public databases; API requires registration |
| **Rate Limit** | No official limit for web access |
| **Data Format** | HTML (web), XML/CSV (data exports) |
| **Cost** | Free access to all public registries |
| **Coverage** | ~70,000 medicinal products, ~7,000 pharmacies |
| **Language** | Czech (primary), some English documentation |

### Data Access Methods

| Method | Description | Best For |
|--------|-------------|----------|
| **Web Interface** | Interactive search at sukl.cz | Manual research |
| **Data Exports** | Periodic CSV/XML data dumps | Bulk analysis |
| **API (registered)** | Programmatic access for authorized users | Integration |
| **Open Data Portal** | Government open data initiative | Statistical analysis |

## Use Cases

### Pharmaceutical Intelligence
- Map marketing authorization holder portfolios and therapeutic area coverage
- Track drug approvals, suspensions, and withdrawals for regulatory monitoring
- Monitor clinical trial activity by sponsor and therapeutic area
- Pricing and reimbursement analysis for market access intelligence

### Supply Chain Compliance
- Verify pharmacy and distributor licensing status for supply chain integrity
- Ensure supply chain integrity for pharmaceutical products under FMD serialization
- Cross-reference with [ARES](/osint/ares/) and [RZP](/osint/rzp/) for entity verification
- [NIS2](/glossary/nis2/) healthcare sector compliance for critical infrastructure operators

### Healthcare Sector Analysis
- Pharmacy density and geographic coverage mapping for underserved area identification
- Distributor network analysis and concentration assessment
- Combine with [CNB](/osint/cnb/) for health insurance entity verification
- Healthcare sector M&A due diligence with product portfolio analysis

### Due Diligence
- Verify pharmaceutical company claims about product portfolios and market authorizations
- Assess clinical trial activity as an indicator of R&D investment and pipeline strength
- Cross-reference distributor licenses with corporate entity data from [VR.cz](/osint/vr-cz/)
- Identify undisclosed regulatory actions (suspensions, withdrawals) during M&A review

### Adverse Event Monitoring
- Track pharmacovigilance signals for specific products or therapeutic areas
- Monitor adverse event trends that may indicate product safety issues
- Correlate adverse event data with product market share for risk assessment
- Support regulatory compliance reporting for pharmaceutical companies

## Related Sources

- [ARES](/osint/ares/) - Entity identification for pharmaceutical companies
- [RZP](/osint/rzp/) - Trade license verification for pharmacies
- [Justice.cz](/osint/justice-cz/) - Corporate details of pharma companies
- [CEDR](/osint/cedr/) - Healthcare sector subsidies
- [EU Sanctions](/osint/eu-sanctions/) - [Sanctions screening](/glossary/sanctions-screening/) for pharma entities
- [VR.cz](/osint/vr-cz/) - Unified registry for entity verification
- [Insolvency Register](/osint/insolvencni-rejstrik/) - Financial health of pharma entities

## Related Platform Components

- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Healthcare sector compliance assessment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)