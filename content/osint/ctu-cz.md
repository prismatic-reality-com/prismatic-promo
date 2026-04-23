+++
title = "CTU / Czech Telecom Office"
weight = 55
[extra]
category = "czech"
type = "regulatory"
module = "CtuCz"
description = "Czech Telecommunication Office - telecom operators, spectrum, and numbering"
has_api = false
url = "https://ctu.cz"
rate_limit = "Public website, no official API"
capabilities = ["Operator Registry", "Spectrum Allocation", "Number Portability", "Coverage Maps", "Market Analysis", "Regulatory Data"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1473
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["CTU", "Czech", "Telecom", "Office", "Telecommunication", "osint", "Prismatic Platform", "Mobile", "Vodafone"]
tags = ["osint", "czech", "ctu---czech-telecom-office", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "CTU / Czech Telecom Office - Prismatic Platform"
+++

## Overview

The Czech Telecommunication Office (CTU -- Cesky telekomunikacni urad) is the national regulatory authority for electronic communications and postal services in the Czech Republic, established under Act No. 127/2005 Sb. (the Electronic Communications Act). Operating as an independent administrative body, CTU exercises regulatory oversight over all telecommunications operators, internet service providers, broadcasting distributors, and postal service providers operating within Czech territory. Its mandate encompasses market regulation, spectrum management, numbering administration, network access oversight, universal service obligations, and consumer protection.

For [OSINT](/glossary/osint/) analysts and infrastructure intelligence practitioners, CTU data provides a comprehensive view of the Czech telecommunications landscape that is unavailable from any other source. The operator registry identifies every entity authorized to provide electronic communications services, including ISPs, mobile network operators, fixed-line providers, VoIP services, and broadcasting distributors. Spectrum allocation data reveals frequency holdings that directly correlate with network capacity, geographic coverage, and investment commitments. Numbering data enables phone number attribution to specific operators, essential for communications intelligence and fraud investigation.

CTU also publishes detailed market analysis reports, including annual reports on the state of electronic communications, broadband coverage maps, mobile network quality measurements, and price benchmarking studies. These publications provide strategic intelligence about market structure, competitive dynamics, technology deployment timelines (5G rollout, fiber-to-the-home expansion), and regulatory trends that affect the entire Czech ICT ecosystem.

The office's role in number portability administration makes it particularly valuable for OSINT operations. When a phone number is ported between operators, the CTU-maintained portability database records the transfer, enabling current operator identification for any Czech telephone number. This capability is essential for communications attribution, fraud investigation, and law enforcement cooperation.

CTU participates in the Body of European Regulators for Electronic Communications (BEREC) and coordinates with European counterparts on cross-border regulatory matters, spectrum harmonization, and international roaming regulation. Understanding CTU's European regulatory context is important for analysts investigating cross-border telecommunications issues.

## Data Sources and Coverage

### Operator Registry

CTU maintains the definitive registry of all entities authorized to provide electronic communications services in the Czech Republic. The registry is updated as new operators register and existing operators modify or terminate their activities.

| Operator Category | Approximate Count | Registration Type |
|-------------------|-------------------|-------------------|
| **Mobile Network Operators** | 4 (MNO) + MVNOs | Licensed (spectrum) |
| **Fixed-Line Operators** | ~50 | Registered |
| **Internet Service Providers** | ~500 | Registered |
| **VoIP Providers** | ~30 | Registered |
| **Broadcasting Distributors** | ~10 | Licensed |
| **Postal Service Providers** | ~20 | Registered |
| **Total Registered Entities** | ~700 | Mixed |

### Spectrum Data

| Band | Primary Use | Key Licensees |
|------|-----------|---------------|
| **700 MHz** | 5G mobile broadband | O2, T-Mobile, Vodafone, CRA |
| **800 MHz** | 4G/LTE mobile broadband | O2, T-Mobile, Vodafone |
| **900 MHz** | GSM/4G mobile | O2, T-Mobile, Vodafone |
| **1800 MHz** | GSM/4G mobile | O2, T-Mobile, Vodafone |
| **2100 MHz** | 3G/UMTS mobile | O2, T-Mobile, Vodafone |
| **2600 MHz** | 4G capacity | O2, T-Mobile, Vodafone |
| **3400-3800 MHz** | 5G high-capacity | O2, T-Mobile, Vodafone, CRA |
| **26 GHz** | 5G mmWave (planned) | Auction pending |

### Numbering Data

| Number Range | Service Type | Attribution |
|-------------|-------------|-------------|
| **+420 2xx** | Prague geographic | Operator-assigned |
| **+420 3xx-5xx** | Regional geographic | Operator-assigned |
| **+420 6xx** | Mobile services | MNO-assigned |
| **+420 7xx** | Mobile services | MNO-assigned |
| **+420 8xx** | Toll-free/premium | Service-assigned |
| **+420 9xx** | Premium rate/VoIP | Service-assigned |

### Market Reports

| Report Type | Frequency | Content |
|-------------|-----------|---------|
| **Annual Report** | Yearly | Comprehensive market overview |
| **Broadband Coverage** | Quarterly | Fixed and mobile coverage maps |
| **Quality Measurements** | Bi-annually | Mobile network quality benchmarks |
| **Price Comparison** | Annually | Service pricing benchmarks |
| **Market Analysis** | As needed | Significant Market Power determinations |

## API Integration

CTU does not provide a formal REST API for programmatic access. Data is available through the CTU website (ctu.cz), downloadable datasets, and structured web pages.

### Data Access Points

| Data Type | Access Method | Format | URL |
|-----------|--------------|--------|-----|
| **Operator Registry** | Web search | HTML | `https://www.ctu.cz/vyhledavaci-databaze/evidence-podnikatelu` |
| **Spectrum Allocations** | Downloadable files | PDF/XLS | `https://www.ctu.cz/spektrum` |
| **Numbering Plans** | Downloadable files | XLS/CSV | `https://www.ctu.cz/cislovaci-plany` |
| **Coverage Maps** | Interactive map | Web | `https://digi.ctu.cz/` |
| **Market Reports** | Download | PDF | `https://www.ctu.cz/vseodbornecinnosti/telekomunikace` |
| **Regulatory Decisions** | Search | HTML/PDF | `https://www.ctu.cz/rozhodnuti-a-opatreni` |
| **Number Portability** | Web query | HTML | `https://www.ctu.cz/prenositelnost-cisel` |

### curl Examples

```bash
# Download current numbering plan (Czech telephone numbering)
curl -L "https://www.ctu.cz/sites/default/files/obsah/ctu/hlavni-cinnosti/elektronicke-komunikace/cislovaci-plany/soubory/cislovaci-plan.xlsx" \
  -o cislovaci_plan.xlsx

# Access coverage map data
curl "https://digi.ctu.cz/api/v1/coverage?lat=50.0755&lon=14.4378" \
  -H "Accept: application/json"

# Get operator list page
curl "https://www.ctu.cz/vyhledavaci-databaze/evidence-podnikatelu"
```

## Query Examples

```elixir
# Search for registered telecom operators
{:ok, operators} = CtuCz.search_operators("internet")
# => [%{name: "O2 Czech Republic a.s.", ico: "60193336",
#       services: ["internet access", "voice telephony", "data services"],
#       registration_date: ~D[2005-05-01], status: :active},
#      %{name: "T-Mobile Czech Republic a.s.", ico: "64949681",
#       services: ["mobile services", "internet access"], ...}]

# Number attribution - identify which operator owns a number
{:ok, operator} = CtuCz.number_lookup("+420602123456")
# => %{number: "+420602123456", operator: "O2 Czech Republic a.s.",
#      number_type: :mobile, ported: false, original_operator: "O2"}

# Check number portability status
{:ok, port_info} = CtuCz.portability_check("+420777123456")
# => %{number: "+420777123456", current_operator: "T-Mobile",
#      original_operator: "O2", ported: true, port_date: ~D[2024-03-15]}

# Get coverage data for a geographic location
{:ok, coverage} = CtuCz.coverage(lat: 50.0755, lon: 14.4378)
# => %{location: %{lat: 50.0755, lon: 14.4378, name: "Praha centrum"},
#      mobile: [
#        %{operator: "O2", technologies: ["4G", "5G"], signal: :strong},
#        %{operator: "T-Mobile", technologies: ["4G", "5G"], signal: :strong},
#        %{operator: "Vodafone", technologies: ["4G"], signal: :strong}
#      ],
#      fixed: [%{type: "fiber", providers: ["O2", "Nordic Telecom"], ...}]}

# Get spectrum allocation summary
{:ok, spectrum} = CtuCz.spectrum_allocations(operator: "O2 Czech Republic")
# => [%{band: "700 MHz", bandwidth: "2x10 MHz", license_expiry: ~D[2041-01-01]},
#      %{band: "800 MHz", bandwidth: "2x10 MHz", license_expiry: ~D[2029-11-08]}, ...]

# Market statistics
{:ok, stats} = CtuCz.market_statistics(year: 2024)
# => %{mobile_subscriptions: 14_500_000, fixed_broadband: 3_800_000,
#      fiber_coverage: "42%", average_download: "85 Mbps"}
```

## Data Schema

### Operator Record

```elixir
%CtuCz.Operator{
  ico: "60193336",
  name: "O2 Czech Republic a.s.",
  legal_form: "a.s.",
  registered_address: %{
    street: "Za Brumlovkou 266/2",
    city: "Praha 4",
    postal_code: "14022"
  },
  registration_date: ~D[2005-05-01],
  status: :active,
  services: [
    %{type: :voice_telephony, scope: :national},
    %{type: :internet_access, scope: :national},
    %{type: :mobile_services, scope: :national},
    %{type: :broadcasting_distribution, scope: :national}
  ],
  spectrum_holdings: [
    %{band: "700 MHz", bandwidth_mhz: 20, technology: "5G"},
    %{band: "800 MHz", bandwidth_mhz: 20, technology: "LTE"},
    %{band: "900 MHz", bandwidth_mhz: 20, technology: "GSM/LTE"}
  ],
  market_share: %{
    mobile: 0.38,
    fixed_broadband: 0.25,
    voice: 0.32
  }
}
```

## Use Cases

### Telecommunications Infrastructure Intelligence

OSINT analysts map the complete telecommunications infrastructure of the Czech Republic through CTU data, identifying all authorized operators, their service areas, technology deployments, and spectrum holdings. This intelligence supports network capacity assessment, coverage gap analysis, and infrastructure dependency identification for critical facilities.

### Phone Number Attribution

For communications intelligence and fraud investigation, CTU's numbering data enables attribution of Czech phone numbers to specific operators. Combined with portability data, analysts can determine both the original and current operator for any Czech telephone number, supporting call detail record analysis and communications pattern investigation.

### ISP and Network Provider Identification

When investigating internet-based activity originating from Czech IP addresses, CTU's operator registry provides definitive identification of the ISP or network operator. This supplements IP intelligence from services like IPInfo and Shodan with authoritative regulatory data confirming the operator's legal identity and service scope.

### Market Competitive Analysis

Business intelligence analysts use CTU market reports and spectrum data to assess the competitive dynamics of the Czech telecommunications market. Spectrum holdings directly correlate with network capacity and geographic coverage, while market share data reveals competitive positioning and consolidation trends.

### 5G and Infrastructure Planning

Technology strategists and investment analysts track CTU spectrum auction results, 5G deployment timelines, and coverage obligation requirements to assess the pace and direction of telecommunications infrastructure development in the Czech Republic.

### Regulatory Compliance Monitoring

Companies operating in the Czech telecommunications market monitor CTU regulatory decisions, market analyses, and enforcement actions for compliance risks and market access implications. Significant Market Power designations and access obligation decisions directly affect market structure and competitive dynamics.

## Limitations

**No Formal API**: CTU does not provide a structured REST API for programmatic access. Data extraction requires web scraping or manual download of published datasets, which limits automation and real-time integration capabilities.

**Language Barrier**: CTU publications and data are primarily in Czech, with limited English-language content available mainly in annual reports and BEREC-related documents.

**Coverage Map Granularity**: While CTU publishes coverage maps, the data resolution may not capture micro-coverage variations in urban areas or indoor coverage quality. Published coverage data represents theoretical coverage based on network planning models rather than real-world measurements.

**Number Portability Delays**: The public portability lookup may not reflect very recent porting events due to processing delays in the centralized porting database.

**Historical Data Access**: While CTU publishes current registry data and recent reports, historical datasets (operator registrations, past spectrum allocations) may require formal information requests under Czech freedom of information law.

## Legal and Ethical Considerations

CTU registry data is public information published under Czech law (Act No. 127/2005 Sb.). Access to operator registries, spectrum allocations, and market reports does not require authorization or consent.

Phone number attribution data, while available for legitimate purposes, may intersect with privacy considerations when used to identify individuals associated with specific numbers. Analysts should ensure that number lookups are conducted for authorized purposes and that resulting intelligence is handled in accordance with [GDPR](/glossary/gdpr/) and Czech data protection law.

Coverage map data and spectrum allocation information is published for public transparency and may be freely used for analysis, research, and business planning purposes.

Regulatory decisions published by CTU are official government documents and may be freely referenced, cited, and analyzed. However, some decisions may involve confidential commercial information that is redacted from public versions.

## Integration with Prismatic Platform

Prismatic Platform integrates CTU data as an infrastructure intelligence source, supplementing network-level data from IP intelligence providers with authoritative regulatory information.

### Telecommunications Intelligence Module

```elixir
defmodule Prismatic.Intel.TelecomIntelligence do
  @moduledoc """
  Combines CTU regulatory data with IP intelligence and network scanning
  to produce comprehensive telecommunications infrastructure profiles.
  """

  def profile_operator(ico) do
    with {:ok, ctu_data} <- CtuCz.operator_by_ico(ico),
         {:ok, ares_data} <- Ares.get_by_ico(ico),
         {:ok, ip_ranges} <- identify_operator_ip_ranges(ctu_data),
         {:ok, infrastructure} <- scan_infrastructure(ip_ranges) do
      {:ok, %TelecomProfile{
        operator: ctu_data,
        corporate: ares_data,
        ip_ranges: ip_ranges,
        infrastructure: infrastructure,
        spectrum_value: estimate_spectrum_value(ctu_data.spectrum_holdings),
        market_position: assess_market_position(ctu_data)
      }}
    end
  end
end
```

### Number Attribution Service

The platform provides automated phone number attribution using CTU numbering data, enabling communications analysts to quickly identify the operator associated with any Czech telephone number. Portability data is incorporated to ensure current operator identification for ported numbers.

### Infrastructure Mapping

CTU operator data is combined with IP intelligence (IPInfo, Shodan) and DNS data (SecurityTrails, CIRCL passive DNS) to build comprehensive infrastructure maps of Czech telecommunications operators. These maps support attack surface assessment for [Prismatic Perimeter](/glossary/prismatic-perimeter/) evaluations of telecommunications companies.

## Best Practices

**Cross-Reference with ARES**: Always verify CTU operator information against ARES business registry data. The ICO number links both datasets, enabling confirmation of corporate identity, legal form, and registered address.

**Track Spectrum Auctions**: Monitor CTU spectrum auction announcements and results for early intelligence on infrastructure investment commitments. Spectrum acquisitions represent binding financial commitments that signal future network deployment plans.

**Use Coverage Maps Critically**: CTU coverage data represents planned/theoretical coverage. For operational planning, supplement with real-world network quality measurements and user-reported coverage data.

**Monitor Regulatory Decisions**: CTU regulatory decisions (especially Significant Market Power determinations and access obligations) directly affect market dynamics. Track these decisions for investment and competitive intelligence.

**Combine Number Attribution Sources**: For phone number intelligence, combine CTU data with HLR (Home Location Register) lookups and commercial number intelligence services for maximum accuracy, particularly for recently ported numbers.

## Related Providers

- [ARES](/osint/ares/) - Business registry for telecom operator corporate data
- [IPInfo](/osint/ipinfo/) - IP address intelligence for network attribution
- [Shodan](/osint/shodan/) - Internet device and service discovery for infrastructure mapping
- [Censys](/osint/censys/) - Certificate and host scanning for telecom infrastructure
- [OpenCorporates](/osint/open-corporates/) - Global corporate data for international operator groups
- [SecurityTrails](/osint/securitytrails/) - DNS intelligence for operator domain infrastructure

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)