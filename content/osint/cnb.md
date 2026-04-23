+++
title = "CNB"
weight = 13
[extra]
icon = "chart-bar"
color = "blue"
category = "czech"
type = "company"
module = "Cnb"
source_type = "financial"
description = "Czech National Bank - registry of regulated financial entities, exchange rates, and supervisory data"
has_api = true
url = "https://www.cnb.cz"
rate_limit = "No official limit, public data"
capabilities = ["Regulated Entity Lookup", "License Verification", "Exchange Rate Data", "Financial Institution Registry", "Supervisory Decisions", "AML Obligated Entities"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1584
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["CNB", "Czech", "National", "Bank", "osint", "Prismatic Platform", "Czech Republic"]
tags = ["osint", "czech", "cnb", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "CNB - Prismatic Platform"
+++

## Overview

CNB (Ceska narodni banka -- Czech National Bank) is the central bank of the Czech Republic and the primary financial market [supervisor](@/glossary/supervisor.md) responsible for maintaining price stability, overseeing the financial system, and regulating all financial market participants operating within Czech jurisdiction. Established in 1993 following the dissolution of Czechoslovakia, CNB exercises comprehensive supervisory authority over banks, credit unions, insurance companies, pension funds, investment firms, payment institutions, electronic money issuers, and foreign exchange offices.

For [OSINT](@/glossary/osint.md) analysts, compliance professionals, and due diligence investigators, CNB registries represent the authoritative source for verifying the regulatory status of financial entities operating in the Czech Republic. The CNB maintains public registries (seznamy regulovanych a registrovanych subjektu) that enumerate every entity authorized to conduct financial activities, the scope of their permitted operations, and any supervisory actions taken against them. This data is essential for KYC (Know Your Customer) verification, AML (Anti-Money Laundering) compliance, counterparty risk assessment, and financial crime investigation.

The CNB's ARAD (Automatizovany RADa) database system provides comprehensive economic and financial statistics covering monetary policy, banking sector performance, balance of payments, financial market data, and real sector indicators. The ARAD system contains over 5,000 time series updated on schedules ranging from daily (exchange rates) to annual (structural statistics), making it one of the most comprehensive economic data repositories for any Central European economy.

Beyond its regulatory and statistical functions, CNB plays a critical role in the Czech AML/CFT framework. It maintains the list of obligated entities under Act No. 253/2008 Sb. (the Czech AML Act), conducts supervisory inspections, and publishes enforcement decisions. CNB supervisory decisions -- including fines, license revocations, and administrative proceedings -- are published and provide valuable intelligence for assessing the compliance posture and operational integrity of regulated entities.

The CNB also manages the Czech Republic's position in international financial organizations, participates in European Systemic Risk Board (ESRB) activities, and coordinates with the European Central Bank (ECB) on monetary and financial stability matters. For investigators working on cross-border financial cases, understanding CNB's role in the European supervisory architecture is essential.

## Data Sources and Coverage

### Regulated Entity Registries

CNB maintains comprehensive registries covering all categories of regulated financial entities authorized to operate in the Czech Republic.

| Registry | Entities Covered | Approximate Count |
|----------|-----------------|-------------------|
| **Credit Institutions** | Banks, building societies, credit unions | ~50 |
| **Insurance Companies** | Life, non-life, reinsurance | ~30 |
| **Pension Funds** | Supplementary pension companies | ~10 |
| **Investment Firms** | Brokers, asset managers, investment advisors | ~100 |
| **Investment Fund Managers** | UCITS, AIF managers | ~30 |
| **Payment Institutions** | Licensed payment service providers | ~30 |
| **Electronic Money Issuers** | E-money license holders | ~10 |
| **Foreign Exchange Offices** | Licensed currency exchange operators | ~800 |
| **Insurance Intermediaries** | Agents, brokers, tied agents | ~150,000 |
| **EU Passport Holders** | Entities operating under EU passporting | ~2,000 |

### ARAD Statistical Database

| Category | Time Series | Update Frequency |
|----------|-------------|-----------------|
| **Exchange Rates** | 30+ currencies | Daily |
| **Monetary Statistics** | 500+ series | Monthly |
| **Banking Sector** | 200+ series | Quarterly |
| **Balance of Payments** | 300+ series | Quarterly |
| **Financial Markets** | 400+ series | Daily/Monthly |
| **Insurance Sector** | 100+ series | Quarterly |
| **Capital Markets** | 200+ series | Monthly |
| **Real Sector** | 300+ series | Monthly/Quarterly |

### Supervisory Decisions

| Decision Type | Public Access | Historical Depth |
|---------------|--------------|-----------------|
| **Administrative Fines** | Full text published | 10+ years |
| **License Revocations** | Full text published | 10+ years |
| **License Restrictions** | Summary published | 10+ years |
| **Warnings** | Summary published | 5+ years |
| **Cease and Desist** | Summary published | 5+ years |

## API Integration

### Exchange Rate API

CNB provides freely accessible exchange rate data through multiple formats without authentication requirements.

**Base URLs**:
- Exchange rates: `https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/`
- ARAD: `https://www.cnb.cz/arad/`
- Entity registry: `https://apl.cnb.cz/apljerrsdad/`

| Endpoint | Format | Description |
|----------|--------|-------------|
| `/denni_kurz.txt` | Text/CSV | Daily exchange rates (current day) |
| `/denni_kurz.txt?date=DD.MM.YYYY` | Text/CSV | Exchange rates for specific date |
| `/rok.txt?rok=YYYY` | Text/CSV | Annual exchange rate data |
| ARAD REST endpoints | XML/JSON | Statistical time series |
| JERRS web interface | HTML | Regulated entity registry |

### Rate Limits

| Service | Limit | Authentication |
|---------|-------|----------------|
| **Exchange Rates** | No official limit | None required |
| **ARAD Statistics** | No official limit | None for public series |
| **Entity Registry** | Reasonable use | None required |
| **Supervisory Decisions** | Web access | None required |

### curl Examples

```bash
# Get today's exchange rates
curl "https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt"

# Get exchange rates for a specific date
curl "https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt?date=15.01.2025"

# Get annual exchange rates
curl "https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/rok.txt?rok=2024"

# ARAD statistical data (monetary aggregates example)
curl "https://www.cnb.cz/arad/#/cs/indicators" \
  -H "Accept: application/json"
```

## Query Examples

```elixir
# Look up a regulated financial entity by name
{:ok, entities} = Cnb.search_regulated("Komercni banka")
# => [%{name: "Komercni banka, a.s.", ico: "45317054",
#       type: :bank, license_date: ~D[1993-01-01],
#       permitted_activities: ["accepting deposits", "providing credits", ...]}]

# Verify license status for a specific entity
{:ok, license} = Cnb.verify_license(ico: "45317054")
# => %{status: :active, type: :credit_institution,
#      license_number: "CNB-123/93", granted: ~D[1993-01-01],
#      permitted_activities: [...], supervisory_actions: []}

# Check for supervisory actions against an entity
{:ok, actions} = Cnb.supervisory_actions(ico: "12345678")
# => [%{type: :fine, amount: 500_000, currency: "CZK",
#       date: ~D[2024-06-15], reason: "AML compliance failure",
#       decision_reference: "CNB/2024/1234"}]

# Get current exchange rates
{:ok, rates} = Cnb.exchange_rates()
# => %{date: ~D[2025-06-15], rates: [
#       %{currency: "EUR", amount: 1, rate: 24.805},
#       %{currency: "USD", amount: 1, rate: 22.543},
#       %{currency: "GBP", amount: 1, rate: 28.912}, ...]}

# Get historical exchange rate for a specific date
{:ok, rate} = Cnb.exchange_rate("EUR", ~D[2025-01-15])
# => %{currency: "EUR", amount: 1, rate: 25.120, date: ~D[2025-01-15]}

# List all AML obligated entities of a specific type
{:ok, entities} = Cnb.aml_obligated(:payment_institution)

# Get ARAD statistical time series
{:ok, data} = Cnb.arad_series("monetary_aggregate_m3", from: ~D[2024-01-01])
```

## Data Schema

### Regulated Entity Record

```elixir
%Cnb.RegulatedEntity{
  ico: "45317054",
  name: "Komercni banka, a.s.",
  entity_type: :credit_institution,
  license: %{
    number: "CNB-123/93",
    status: :active,
    granted: ~D[1993-01-01],
    last_modified: ~D[2024-03-15]
  },
  permitted_activities: [
    "Prijimani vkladu od verejnosti",
    "Poskytovani uveru",
    "Investicni sluzby",
    "Platebn sluzby"
  ],
  registered_address: %{
    street: "Na Prikope 33",
    city: "Praha 1",
    postal_code: "11407"
  },
  supervisory_actions: [],
  eu_passport: %{
    home_state: "CZ",
    host_states: ["SK", "DE"],
    passported_activities: [...]
  },
  aml_status: %{
    obligated: true,
    category: :credit_institution,
    last_inspection: ~D[2024-09-15]
  }
}
```

### Key Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `ico` | String | Company identification number |
| `entity_type` | Atom | Regulatory category (bank, insurer, etc.) |
| `license.status` | Atom | Active, suspended, revoked, expired |
| `permitted_activities` | List | Authorized financial activities |
| `supervisory_actions` | List | Fines, warnings, restrictions |
| `eu_passport` | Map | Cross-border passporting details |
| `aml_status` | Map | AML obligation and inspection data |

## Use Cases

### Financial Entity Due Diligence

Before entering financial relationships, organizations verify that counterparties hold valid CNB licenses for the activities they propose to conduct. This is legally mandatory for regulated entities and a best practice for all organizations. CNB registry queries confirm license validity, scope of permitted activities, and absence of adverse supervisory actions.

### AML/CFT Compliance Verification

Obligated entities under Czech AML law must verify the regulatory status of financial counterparties as part of their customer due diligence procedures. CNB registries provide authoritative confirmation of licensing status, while supervisory decision records reveal compliance failures that may indicate elevated AML risk.

### Investment Fund and Manager Assessment

Investors and fund-of-funds managers use CNB registries to verify the authorization of Czech investment fund managers, confirm the registration of individual funds, and assess the regulatory compliance track record through supervisory decision analysis.

### Insurance Intermediary Verification

With over 150,000 registered insurance intermediaries in the Czech Republic, CNB's intermediary registry is the authoritative source for verifying that agents and brokers hold valid registrations. This is essential for insurance distribution compliance and consumer protection.

### Cross-Border Financial Services Monitoring

CNB registries include entities operating in the Czech Republic under EU passporting arrangements. Analysts can identify which foreign financial institutions have notified CNB of cross-border activities, providing intelligence on the competitive landscape and potential regulatory jurisdiction questions.

## Limitations

**Registry Search Interface**: The JERRS entity registry uses a web-based interface that is functional but not optimized for programmatic access. Structured API access for entity lookups requires web scraping or structured interaction approaches.

**Historical Data Gaps**: While current registry data is comprehensive, historical records of entities that have been deregistered or had licenses revoked may have limited detail available through the public interface.

**Language**: Most CNB registry data is available primarily in Czech. While exchange rate and statistical data use standard formats, entity names, activity descriptions, and supervisory decisions are in Czech, requiring language capability for full interpretation.

**Intermediary Volume**: The insurance intermediary registry contains over 150,000 entries, making bulk analysis challenging through the web interface. Bulk data exports may require formal data requests.

**Supervisory Decision Anonymization**: Some supervisory decisions are partially anonymized, particularly those involving individuals or ongoing proceedings, limiting their utility for certain investigative purposes.

## Legal and Ethical Considerations

CNB registry data is public information published under Czech law (Act No. 6/1993 Sb., on the Czech National Bank, and sectoral financial regulation). Access to and use of this data does not require consent or authorization. However, users should consider several aspects.

The processing of personal data from CNB registries (names and addresses of statutory representatives, insurance intermediaries) must comply with [GDPR](@/glossary/gdpr.md) requirements. While the data is published for regulatory transparency purposes, its aggregation or use for purposes unrelated to financial regulation may require a separate lawful basis under Article 6 GDPR.

Supervisory decision data should be used responsibly. Published enforcement actions represent concluded proceedings and factual regulatory determinations. Using this data to make unsubstantiated claims about entities or individuals beyond what the published decisions state could give rise to defamation liability.

Exchange rate and statistical data from CNB is freely available for commercial and non-commercial use, subject to appropriate attribution requirements.

## Integration with Prismatic Platform

Prismatic Platform integrates CNB registry data as a critical compliance verification source within the Czech entity analysis pipeline and the broader financial intelligence framework.

### Compliance Verification Pipeline

```elixir
defmodule Prismatic.Compliance.CnbVerification do
  @moduledoc """
  Verifies regulatory status of financial entities through CNB registries,
  cross-referencing with ARES, sanctions lists, and DPH data.
  """

  def verify_financial_entity(ico) do
    with {:ok, ares_entity} <- Ares.get_by_ico(ico),
         {:ok, cnb_status} <- Cnb.verify_license(ico: ico),
         {:ok, sanctions} <- check_sanctions(ares_entity),
         {:ok, dph_status} <- Dph.check_status(ico) do
      {:ok, %ComplianceReport{
        entity: ares_entity,
        regulatory_status: cnb_status,
        sanctions_clear: sanctions.clear?,
        vat_status: dph_status,
        risk_level: calculate_risk(cnb_status, sanctions, dph_status),
        recommendations: generate_recommendations(cnb_status)
      }}
    end
  end
end
```

### Multi-Source Financial Intelligence

Financial entity lookups are cross-referenced with ARES business data, EU and OFAC [sanctions](@/glossary/sanctions-screening.md) lists, the DPH unreliable payer registry, and Hlidac statu risk analytics to provide comprehensive KYC/AML screening. The adapter automatically validates license status and flags entities with supervisory actions or revoked authorizations.

### Exchange Rate Service

The platform ingests daily CNB exchange rates for use across all modules requiring currency conversion, ensuring consistent and authoritative rate application throughout the system. Historical rates are cached for retrospective analysis and reporting.

## Best Practices

**Verify License Scope**: Checking that an entity is CNB-regulated is necessary but not sufficient. Verify that the entity's license covers the specific financial activity being proposed. A payment institution license does not authorize deposit-taking, for example.

**Monitor Supervisory Actions**: Set up periodic checks for supervisory decisions against counterparties and portfolio entities. New enforcement actions can significantly change the risk profile of a financial relationship.

**Cross-Reference with ARES**: Always correlate CNB registry data with ARES entity data to confirm that the ICO, legal name, and registered address match across both systems. Discrepancies may indicate data lag or, in rare cases, fraudulent representations.

**Track EU Passporting Changes**: For entities operating under EU passporting, monitor CNB notifications for changes in host-state registrations. Loss of passporting rights in certain jurisdictions may affect cross-border operations.

**Cache Exchange Rates Appropriately**: CNB publishes exchange rates once daily. Cache the daily rate and use it consistently throughout the business day to avoid inconsistencies. For intraday rates, commercial forex data providers are more appropriate.

**Understand Decision Publication Delays**: Supervisory decisions are published after they become final (after appeal periods expire). There may be a delay between the decision date and its publication in the registry.

## Related Providers

- [ARES](@/osint/ares.md) - Czech business registry for entity identification and cross-referencing
- [EU Sanctions](@/osint/eu-sanctions.md) - EU sanctions list for compliance screening
- [OFAC](@/osint/ofac.md) - US Treasury sanctions list for international screening
- [DPH](@/osint/dph.md) - Czech VAT payer registry for tax compliance
- [Justice.cz](@/osint/justice-cz.md) - Commercial Register with company details and beneficial ownership
- [Hlidac statu](@/osint/hlidac-statu.md) - Government watchdog with company risk analytics
- [Crunchbase](@/osint/crunchbase.md) - Business intelligence for fintech and financial company profiling

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)