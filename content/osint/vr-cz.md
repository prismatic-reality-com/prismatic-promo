+++
title = "VR.cz"
weight = 23
[extra]
category = "czech"
type = "company"
module = "VrCz"
description = "Czech Business Registry (Verejny rejstrik) providing unified access to all public registers"
has_api = true
url = "https://vr.justice.cz"
rate_limit = "No official limit, recommended 1 req/sec"
capabilities = ["Company Search", "All Register Types", "Statutory Bodies", "Beneficial Owners", "Document Collection", "Historical Extracts"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 709
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["VRcz", "Czech", "Business", "Registry", "Verejny", "osint", "Prismatic Platform", "Register", "Commercial Register", "Sbirka"]
tags = ["osint", "czech", "vrcz", "prismatic"]
quality_score = 65
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "VR.cz - Prismatic Platform"
+++

## Overview

VR.cz (Verejny rejstrik a Sbirka listin) is the unified public [registry](/glossary/registry-otp/) portal operated by the Czech Ministry of Justice. It provides a single access point to multiple registers: the Commercial Register (Obchodni rejstrik), Register of Associations (Spolkovy rejstrik), Foundation Register (Nadacni rejstrik), Register of Public Benefit Companies (Rejstrik ustavu), and the Register of Owners of Condominiums.

While [Justice.cz](/osint/justice-cz/) focuses specifically on the Commercial Register, VR.cz provides a broader view encompassing all legal entity types registered in the Czech Republic, including non-profit organizations, foundations, and housing cooperatives.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Commercial Register** | s.r.o., a.s., v.o.s., k.s. and other commercial entities |
| **Association Register** | Spolky (z.s.), civic associations |
| **Foundation Register** | Nadace and nadacni fondy |
| **Public Benefit Register** | Ustav entities |
| **SVJ Register** | Spolecenstvi vlastniku jednotek (condominium owners) |
| **Statutory Bodies** | Full statutory body composition with history |
| **Beneficial Owners** | UBO data (where available) |
| **Document Collection** | All filed documents (Sbirka listin) |

### Register Types

| Register | Czech Name | Entity Types |
|----------|-----------|-------------|
| **OR** | Obchodni rejstrik | Commercial companies (s.r.o., a.s.) |
| **SR** | Spolkovy rejstrik | Associations, clubs |
| **NR** | Nadacni rejstrik | Foundations |
| **UR** | Rejstrik ustavu | Public benefit institutions |
| **SVJ** | Rejstrik SVJ | Condominium associations |

## Integration with Prismatic

VR.cz provides the broadest Czech entity lookup capability within the Prismatic platform, covering entity types not available through [ARES](/osint/ares/) alone.

```elixir
# Search across all registers
{:ok, results} = VrCz.search(name: "Prismatic")
# => [
#   %{ico: "12345678", name: "Prismatic s.r.o.", register: :or, court: "Praha"},
#   %{ico: "87654321", name: "Prismatic Foundation", register: :nr, court: "Praha"}
# ]

# Get entity details (works for any register type)
{:ok, entity} = VrCz.get_entity("12345678")
# => %{
#   ico: "12345678",
#   name: "Prismatic s.r.o.",
#   register: :or,
#   legal_form: "spolecnost s rucenim omezenym",
#   address: "Vaclavske namesti 1, Praha 1, 110 00",
#   statutory_bodies: [...],
#   date_of_incorporation: ~D[2020-01-15],
#   beneficial_owners: [
#     %{name: "Jan Novak", share: "100%", since: ~D[2020-01-15]}
#   ]
# }

# Get full official extract
{:ok, extract} = VrCz.official_extract("12345678")

# Search specifically in the Association Register
{:ok, associations} = VrCz.search(name: "Tennis", register: :sr)

# Get filed documents
{:ok, documents} = VrCz.documents("12345678")

# Get beneficial owner information
{:ok, ubos} = VrCz.beneficial_owners("12345678")

# Get historical changes
{:ok, history} = VrCz.change_history("12345678")
```

### Comprehensive Entity Intelligence

```elixir
defmodule PrismaticPerimeter.Intelligence.CzechEntityIntelligence do
  @moduledoc """
  Provides unified Czech entity intelligence by combining
  all available public register sources.
  """

  def full_entity_report(ico) do
    # Parallel queries to all relevant registers
    tasks = [
      Task.async(fn -> VrCz.get_entity(ico) end),
      Task.async(fn -> Ares.get_full_details(ico) end),
      Task.async(fn -> Rzp.get_licenses(ico) end),
      Task.async(fn -> InsolvencniRejstrik.check(ico) end),
      Task.async(fn -> VrCz.beneficial_owners(ico) end)
    ]

    [vr, ares, rzp, insolvency, ubos] = Task.await_many(tasks, 30_000)

    {:ok, %{
      entity: extract_ok(vr),
      business_details: extract_ok(ares),
      trade_licenses: extract_ok(rzp),
      insolvency_status: extract_ok(insolvency),
      beneficial_owners: extract_ok(ubos),
      data_consistency: verify_cross_register_consistency(vr, ares),
      completeness_score: calculate_completeness(vr, ares, rzp, ubos)
    }}
  end
end
```

## Rate Limits and Access

| Aspect | Details |
|--------|---------|
| **Authentication** | None required (public register) |
| **Rate Limit** | No official limit; responsible scraping expected |
| **Data Format** | HTML (web interface), PDF (official extracts) |
| **Cost** | Free access to all public data |
| **Language** | Czech (primary), some English labels |
| **Coverage** | All Czech legal entities across 5 register types |

### Technical Notes
- No structured [REST API](/glossary/rest-api/); data access via HTML parsing
- Official extracts available as PDFs with court seal
- Beneficial owner data availability varies by entity type
- Historical changes tracked from register digitization onwards

## Use Cases

### Entity Verification
- Verify legal entity existence across all Czech register types
- Confirm entity type and legal form
- Access beneficial ownership data for [KYC/AML](/apps/prismatic-compliance/) compliance

### Non-Profit Intelligence
- Research associations, foundations, and public benefit entities
- Verify non-profit status for grant and subsidy compliance
- Track leadership changes in civic organizations

### Comprehensive Due Diligence
- Single access point covering [Commercial Register](/osint/justice-cz/), [Trade Licenses](/osint/rzp/), and more
- Cross-register data consistency verification
- Beneficial owner identification for AML compliance

## Czech Legal Entity Types

VR.cz covers the full spectrum of Czech legal entity types, each with distinct governance structures and regulatory requirements:

| Legal Form | Czech | Register | Key Characteristics |
|-----------|-------|----------|-------------------|
| **s.r.o.** | Spolecnost s rucenim omezenym | OR | Limited liability, 1+ owners, min. 1 CZK capital |
| **a.s.** | Akciova spolecnost | OR | Joint stock, min. 2M CZK capital, board structure |
| **v.o.s.** | Verejna obchodni spolecnost | OR | General partnership, unlimited liability |
| **k.s.** | Komanditni spolecnost | OR | Limited partnership, mixed liability |
| **z.s.** | Zaregistrovany spolek | SR | Registered association, min. 3 members |
| **Nadace** | Foundation | NR | Endowment-based, public benefit purpose |
| **SVJ** | Spolecenstvi vlastniku jednotek | SVJ | Condominium owners association |
| **Ustav** | Public benefit institute | UR | Service-oriented, no member structure |

### Beneficial Ownership (UBO) Data

Since 2018, VR.cz provides access to beneficial ownership data as required by the EU Anti-Money Laundering Directive:

| UBO Data Field | Description |
|---------------|-------------|
| **Name** | Full name of the beneficial owner |
| **Birth Date** | Date of birth (may be partially hidden) |
| **Nationality** | Country of citizenship |
| **Ownership Share** | Percentage of ownership or voting rights |
| **Control Type** | Direct, indirect, or effective control |
| **Since** | Date the beneficial ownership was established |

Beneficial ownership data is critical for KYC/AML compliance and is automatically cross-referenced with [OFAC](/osint/ofac/), [EU Sanctions](/osint/eu-sanctions/), and [UN Sanctions](/osint/un-sanctions/) lists in the Prismatic compliance pipeline.

### Document Collection (Sbirka listin)

The document collection is a critical component of VR.cz, containing all legally required filings:

| Document Type | Filing Requirement | Intelligence Value |
|--------------|-------------------|-------------------|
| **Annual Financial Statements** | Mandatory for all companies | Revenue, profit, asset analysis |
| **Articles of Association** | At incorporation and amendments | Governance structure |
| **Shareholder Meeting Minutes** | After each general meeting | Decision tracking |
| **Board Resolutions** | For significant decisions | Strategic intelligence |
| **Merger/Demerger Documents** | At corporate restructuring | M&A intelligence |
| **Audit Reports** | For companies above thresholds | Financial health assessment |

## Related Sources

- [ARES](/osint/ares/) - Aggregated business register with API access
- [Justice.cz](/osint/justice-cz/) - Commercial Register with detailed filings
- [RZP](/osint/rzp/) - Trade Licensing Register
- [Insolvency Register](/osint/insolvencni-rejstrik/) - Czech insolvency proceedings
- [EU Sanctions](/osint/eu-sanctions/) - EU sanctions list for entity screening
- [Executors](/osint/executors/) - Enforcement proceedings data

## Related Platform Components

- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Czech entity data in [EASM](/glossary/easm/) ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)