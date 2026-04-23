+++
title = "Prismatic OSINT Czech Legal"
weight = 33
[extra]
icon = "scale"
color = "amber"
description = "Czech legal and regulatory OSINT adapters - courts, insolvency, and public procurement"
category = "OSINT"
files = "240"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 802
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "OSINT", "Czech", "Legal", "apps", "Prismatic Platform", "ARES", "Content"]
tags = ["apps", "osint", "prismatic-osint-czech-legal", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic OSINT Czech Legal - Prismatic Platform"
+++

## Overview

Prismatic [OSINT](@/glossary/osint.md) Czech Legal provides specialized adapters for Czech legal and regulatory intelligence sources. It integrates with court registries, insolvency databases, public procurement portals, and regulatory bodies to support legal due diligence, compliance monitoring, and risk assessment within the Czech Republic. With 240 source files, it is one of the most comprehensive Czech legal intelligence modules in the platform.

The application implements a provider-based architecture where each Czech data source has a dedicated adapter implementing the platform's OSINT provider [protocol](@/glossary/protocol.md). This ensures uniform [rate limiting](@/glossary/rate-limiting.md), caching, error recovery, and data normalization across all sources, regardless of the underlying API format (REST, SOAP, HTML scraping, or RSS).

## ARES (Administrative Register of Economic Subjects)

ARES is the Czech Ministry of Finance's unified gateway to multiple business registries. The adapter provides comprehensive entity lookup and monitoring:

### ARES Capabilities

| Capability | Endpoint | Data |
|-----------|----------|------|
| **Entity Lookup** | `/ekonomicke-subjekty/{ico}` | Full company profile, legal form, NACE codes |
| **Name Search** | `/ekonomicke-subjekty` | Search by name, fuzzy matching supported |
| **Address Search** | `/ekonomicke-subjekty` | Find entities by registered address |
| **Financial Statements** | `/ucetni-zaverky` | Published financial reports (from 2014) |
| **Change Monitoring** | `/zmeny` | Track changes to entity records |

```elixir
# Full entity profile from ARES
{:ok, profile} = PrismaticOsintCzechLegal.ares_profile(ico: "12345678")

# Returns normalized entity with cross-references
%{
  ico: "12345678",
  name: "Firma s.r.o.",
  legal_form: :sro,
  registered_address: %{street: "Vodickova 30", city: "Praha 1", zip: "110 00"},
  nace_codes: ["62010", "62020"],
  date_of_registration: ~D[2015-03-12],
  data_sources: [:ares, :rzp, :dph],
  provenance: %{source: "ares.gov.cz", fetched_at: ~U[...]}
}
```

## Commercial Register (Justice.cz)

The Commercial Register provides detailed corporate governance information not available through ARES:

| Data Type | Content | Intelligence Value |
|-----------|---------|-------------------|
| **Company Formation** | Articles of association, founding documents | Corporate structure analysis |
| **Directors & Board** | Current and historical directors, supervisory board | Beneficial ownership mapping |
| **Ownership** | Shareholder register, ownership percentages | Corporate chain analysis |
| **Procuration** | Authorized signatories and their powers | Decision authority mapping |
| **Filings** | All filings with the register (changes, annual reports) | Change event detection |
| **Insolvency Notes** | Cross-references to insolvency proceedings | Risk flagging |

### Director and Ownership Analysis

```elixir
# Extract full corporate structure
{:ok, structure} = PrismaticOsintCzechLegal.corporate_structure(ico: "12345678")

%{
  directors: [
    %{name: "Jan Novak", birth_date: ~D[1980-01-15], role: :executive_director, since: ~D[2020-01-01]},
    %{name: "Eva Svobodova", birth_date: ~D[1975-06-20], role: :executive_director, since: ~D[2018-05-15]}
  ],
  shareholders: [
    %{name: "Holding A.S.", ico: "87654321", share: 60.0},
    %{name: "Jan Novak", share: 40.0}
  ],
  supervisory_board: [],
  capital: %{amount: 200_000, currency: :CZK, paid_up: true}
}
```

## Insolvency Register (ISIR)

The Czech Insolvency Register provides real-time data on all insolvency proceedings:

| Feature | Description | Update Frequency |
|---------|-------------|-----------------|
| **Filing Search** | Search by ICO, name, or case number | Real-time |
| **Status Tracking** | Monitor proceedings through all stages | Event-driven |
| **Creditor Information** | Registered creditors and claimed amounts | Per-filing |
| **Administrator Data** | Assigned insolvency administrators | Per-appointment |
| **Document Access** | Court documents and decisions | Per-publication |

```elixir
# Check insolvency status
{:ok, status} = PrismaticOsintCzechLegal.insolvency_check(ico: "12345678")

%{
  has_active_proceedings: false,
  historical_proceedings: [
    %{case: "KSPH 36 INS 1234/2020", status: :resolved, type: :oddluzeni}
  ],
  risk_score: 0.15,
  confidence: 0.95
}
```

## Regulatory Data Sources

### UOHS (Competition Authority)

| Data Type | Content | Intelligence Value |
|-----------|---------|-------------------|
| **Competition Decisions** | Cartel investigations, merger approvals | Market risk assessment |
| **Public Procurement Oversight** | Tender irregularity investigations | Procurement compliance |
| **State Aid** | Registered state aid notifications | Subsidy mapping |

### CNB (Czech National Bank)

| Registry | Content | Update Frequency |
|----------|---------|-----------------|
| **Licensed Entities** | Banks, insurance, investment firms | Monthly |
| **Foreign Exchange** | Licensed currency exchange operators | Monthly |
| **Payment Institutions** | Licensed payment service providers | Monthly |
| **Warning List** | Entities operating without license | As published |

### DPH (VAT Registration)

```elixir
# VAT registration verification
{:ok, vat} = PrismaticOsintCzechLegal.verify_vat(dic: "CZ12345678")

%{
  dic: "CZ12345678",
  registered: true,
  reliability: :reliable,  # or :unreliable (nespolehlivy platce DPH)
  registered_since: ~D[2015-04-01],
  bank_accounts: ["CZ6508000000001234567890"]
}
```

### RZP (Trade Licensing Register)

| Data Type | Content | Intelligence Value |
|-----------|---------|-------------------|
| **Trade Licenses** | Active and historical trade licenses | Business activity verification |
| **License Type** | Notifiable, regulated, or concession-based | Regulatory exposure |
| **Suspensions** | License suspensions and revocations | Risk flagging |

## Public Procurement

### Verejne Zakazky (Public Tenders)

The public procurement adapter monitors Czech government tenders for intelligence and compliance analysis:

| Feature | Description | Use Case |
|---------|-------------|----------|
| **Tender Monitoring** | New tender publication alerts | Market opportunity detection |
| **Award Tracking** | Contract award to supplier mapping | Supplier relationship analysis |
| **Supplier History** | Win rates, contract values by supplier | Performance benchmarking |
| **Anomaly Detection** | Single-bidder detection, value clustering | Procurement fraud signals |
| **Subcontractor Chains** | Declared subcontractor relationships | Supply chain mapping |

```elixir
# Public procurement history
{:ok, history} = PrismaticOsintCzechLegal.procurement_history(ico: "12345678")

%{
  total_contracts: 23,
  total_value: %{amount: 45_000_000, currency: :CZK},
  win_rate: 0.34,
  average_contract_value: %{amount: 1_956_522, currency: :CZK},
  contracting_authorities: ["Ministerstvo financi", "Statni fond dopravni infrastruktury"],
  anomaly_flags: [:high_win_rate_single_authority]
}
```

## Rate Limiting and Data Normalization

### Rate Limiting Strategy

| Source | Rate Limit | Strategy | Burst |
|--------|-----------|----------|-------|
| **ARES** | 10 req/s | Token bucket | 20 |
| **Justice.cz** | 5 req/s | Fixed window | 10 |
| **ISIR** | 20 req/s | Token bucket | 40 |
| **UOHS** | 3 req/s | Fixed window | 5 |
| **CNB** | 10 req/s | Token bucket | 15 |

### Data Normalization

All source data is normalized to canonical schemas before entering the platform:

| Normalization Step | Description | Example |
|-------------------|-------------|---------|
| **Name Canonicalization** | Standardize company name formats | "FIRMA, s.r.o." to "Firma s.r.o." |
| **Address Normalization** | Parse and structure addresses | Free text to structured `{street, city, zip}` |
| **Date Handling** | Convert Czech date formats to ISO 8601 | "15.11.2024" to `~D[2024-11-15]` |
| **Currency Normalization** | Standardize amounts to `{amount, currency}` | "1.234.567 Kc" to `{1_234_567, :CZK}` |
| **Encoding** | Handle Windows-1250 and UTF-8 | Source encoding detection and conversion |

## Integrated Usage

```elixir
# Full legal profile combining all sources
{:ok, profile} = PrismaticOsintCzechLegal.legal_profile(ico: "12345678")

# Includes data from ARES + Justice.cz + ISIR + UOHS + CNB + DPH + RZP
# with cross-source entity resolution and confidence scoring
```

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| **[Prismatic OSINT Core](@/apps/prismatic-osint-core.md)** | Core OSINT framework [protocols](@/glossary/protocol.md) and provider abstractions |
| **[Prismatic Czech Courts](@/apps/prismatic-czech-courts.md)** | Court decision and insolvency data for cross-reference |
| **[Prismatic Storage Core](@/apps/prismatic-storage-core.md)** | Persistent storage for cached registry data |
| **[Prismatic Nabla](@/apps/prismatic-nabla.md)** | [Confidence scoring](@/glossary/confidence-scoring.md) for cross-source entity resolution |
| **[Prismatic](@/apps/prismatic.md)** | Investigation workflow integration |
| **[Prismatic Perimeter](@/apps/prismatic-perimeter.md)** | Compliance assessment for Czech entities |

## Related Components

- [Prismatic Czech Courts](@/apps/prismatic-czech-courts.md) - Court decision extraction
- [Prismatic Czech Autocrawler](@/apps/prismatic-czech-autocrawler.md) - Automated registry crawling
- [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) - OSINT provider framework
- [Prismatic Web](@/apps/prismatic-web.md) - [LiveView](@/glossary/liveview.md) dashboards
- [Prismatic API](@/apps/prismatic-api.md) - REST [API gateway](@/glossary/api-gateway.md)

## Related Agents

- [Competitor Researcher](@/agents/competitor-researcher.md) -- Leverages Czech legal registry data for competitive intelligence and due diligence
- [Alert Management Specialist](@/agents/alert-management-specialist.md) -- Manages alerts from insolvency monitoring and regulatory change detection
- [Adapter Pattern Specialist](@/agents/adapter-pattern-specialist.md) -- Ensures Czech legal source adapters follow the OSINT provider protocol consistently

## Related Capabilities

- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Cross-source legal intelligence fusion across ARES, Justice.cz, ISIR, CNB, and others
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Continuous monitoring of Czech regulatory data sources for entity changes
- [NABLA Axioms](@/capabilities/nabla-axioms.md) -- Signal plurality enforced across independent Czech legal data sources

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)