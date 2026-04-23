+++
title = "CTU"
weight = 36
[extra]
category = "czech"
type = "company"
module = "Ctu"
description = "Czech Telecommunication Office (CTU) - registry of telecom operators, spectrum licenses, numbering allocations, and regulatory decisions"
has_api = true
url = "https://www.ctu.cz"
rate_limit = "Public databases available"
capabilities = ["Operator Registry", "Spectrum License Search", "Numbering Plan Lookup", "Authorization Verification", "Penalty Records", "Market Analysis Data"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1372
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["CTU", "Czech", "Telecommunication", "Office", "osint", "Prismatic Platform", "Czech Republic"]
tags = ["osint", "czech", "ctu", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "CTU - Prismatic Platform"
+++

## Overview

CTU (Cesky telekomunikacni urad) is the Czech Republic's national regulatory authority for electronic communications and postal services, operating under Act No. 127/2005 Coll. (Electronic Communications Act). CTU maintains registries of all authorized telecom operators, spectrum license holders, numbering allocations, and regulatory decisions. Any entity providing electronic communications services or networks in the Czech Republic must notify CTU, making its registries the authoritative source for telecommunications market intelligence.

For [OSINT](@/glossary/osint.md) purposes, CTU data reveals the complete structure of the Czech telecommunications market -- who operates networks, holds spectrum licenses, provides services, and at what scale. This intelligence is critical for [NIS2](@/glossary/nis2.md) compliance assessment (telecom operators are classified as essential service providers under the directive), competitive intelligence in the telecommunications sector, infrastructure mapping for security assessments, and regulatory risk analysis for entities operating in regulated markets.

CTU's regulatory authority extends beyond simple registration. The office conducts market analyses, imposes access obligations on operators with significant market power (SMP), regulates wholesale pricing, manages spectrum auctions, and enforces quality-of-service requirements. Regulatory decisions and penalty records provide intelligence about an operator's compliance history and market position that is not available from any other source.

Combined with [ERU](@/osint/eru.md) energy regulatory data, CTU completes the critical infrastructure intelligence picture for Czech NIS2 assessments. The convergence of telecommunications and energy infrastructure makes cross-referencing between these regulatory databases essential for comprehensive critical infrastructure mapping.

## Data Sources and Coverage

CTU maintains multiple registries and databases that collectively provide comprehensive telecommunications market intelligence for the Czech Republic.

| Data Type | Description | Coverage |
|-----------|-------------|---------|
| **Authorized Operators** | All notified electronic communications providers | Comprehensive |
| **Spectrum Licenses** | Radio frequency allocations and individual licenses | All allocated spectrum |
| **Numbering Allocations** | Phone number blocks assigned to operators | Complete national plan |
| **Internet Registrations** | ISP registrations and network identifiers | All registered ISPs |
| **Regulatory Decisions** | Price regulation, access obligations, SMP findings | All published decisions |
| **Market Analyses** | Relevant market definitions and competition assessments | Per regulatory cycle |
| **Penalties** | Fines and sanctions for regulatory violations | Complete penalty history |
| **Quality Reports** | Service quality measurement data and benchmarks | Annual reports |
| **Spectrum Auctions** | Auction results, conditions, and obligations | All conducted auctions |

### Operator Categories and NIS2 Relevance

| Category | Description | NIS2 Classification | Examples |
|----------|-------------|---------------------|---------|
| **MNO** | Mobile network operators | Essential service | T-Mobile CZ, O2 CZ, Vodafone CZ |
| **MVNO** | Mobile virtual network operators | Essential service | SAZKAmobil, Kaktus |
| **Fixed ISP** | Fixed broadband providers | Essential service | CETIN, UPC, O2 |
| **Backbone** | Internet backbone and transit operators | Critical infrastructure | NIX.CZ, CESNET |
| **Broadcasting** | Radio and TV broadcasting operators | Important entity | Ceske Radiokomunikace |
| **Satellite** | Satellite communication providers | Important entity | Various |
| **IoT/M2M** | Machine-to-machine communication providers | Sector dependent | Various |

## Technical Architecture

CTU's public data is available through multiple channels with varying levels of structure and accessibility.

The operator registry is maintained as a searchable database on the CTU website, providing structured lookup by operator name, ICO, service type, and authorization status. Results include operator details, authorized services, spectrum holdings, and numbering allocations. The data is updated as notifications are processed, typically within days of an operator filing.

Spectrum allocation data is published through dedicated databases that map frequency bands to license holders, including license conditions, geographic coverage areas, and expiry dates. This data is essential for understanding the competitive dynamics of mobile network operators and identifying potential coverage gaps or interference issues.

Numbering plan allocations map telephone number blocks to operators, enabling reverse lookup from phone numbers to service providers. This intelligence is valuable for telecommunications fraud investigation, caller identification, and understanding operator market share through number block analysis.

Regulatory decisions and market analyses are published as PDF documents on the CTU website, requiring text extraction for programmatic analysis. The Prismatic adapter implements PDF parsing to extract structured data from these documents, including SMP designations, wholesale pricing obligations, and penalty amounts.

## API Integration

CTU data is accessed through a combination of structured database queries and document parsing, integrated into the Prismatic OSINT pipeline.

```elixir
defmodule PrismaticOsint.Adapters.Ctu do
  @moduledoc """
  Czech Telecommunication Office adapter for telecommunications
  intelligence within the Prismatic OSINT pipeline.
  """

  @base_url "https://www.ctu.cz"

  # Search authorized operators
  def search_operators(query) do
    with {:ok, html} <- fetch_operator_registry(query) do
      operators = parse_operator_results(html)
      {:ok, operators}
    end
  end

  # Get all operators by service type
  def by_service_type(service_type) do
    with {:ok, html} <- fetch_operator_registry(%{service: service_type}) do
      {:ok, parse_operator_results(html)}
    end
  end

  # Search spectrum allocations
  def spectrum_allocations(opts \\ []) do
    band = Keyword.get(opts, :band)
    operator = Keyword.get(opts, :operator)

    with {:ok, data} <- fetch_spectrum_data(band, operator) do
      {:ok, parse_spectrum_allocations(data)}
    end
  end

  # Verify operator authorization
  def verify_authorization(ico) do
    with {:ok, operator} <- search_operators(ico) do
      {:ok, %{
        authorized: operator != nil,
        services: operator[:services] || [],
        status: operator[:status],
        verified_at: DateTime.utc_now()
      }}
    end
  end

  # Get numbering allocations for an operator
  def numbering_allocations(ico) do
    with {:ok, data} <- fetch_numbering_data(ico) do
      {:ok, parse_numbering_allocations(data)}
    end
  end

  # Check penalty history
  def penalty_history(ico) do
    with {:ok, decisions} <- fetch_penalty_decisions(ico) do
      {:ok, parse_penalties(decisions)}
    end
  end

  # Market analysis data
  def market_analysis(market, opts \\ []) do
    year = Keyword.get(opts, :year, Date.utc_today().year)

    with {:ok, pdf} <- fetch_market_analysis(market, year) do
      {:ok, parse_market_analysis_pdf(pdf)}
    end
  end
end
```

### Telecom NIS2 Assessment Pipeline

```elixir
defmodule PrismaticPerimeter.NIS2.TelecomAssessment do
  @moduledoc """
  Assesses NIS2 compliance for telecom entities using CTU
  registration data, security ratings, and infrastructure exposure.
  """

  alias PrismaticOsint.Adapters.{Ctu, Ares, Shodan}
  alias PrismaticPerimeter

  def assess_telecom_entity(ico) do
    with {:ok, operator} <- Ctu.search_operators(ico),
         {:ok, company} <- Ares.get_full_details(ico),
         {:ok, rating} <- PrismaticPerimeter.security_rating(company.nazev),
         {:ok, shodan_data} <- Shodan.search("org:\"#{company.nazev}\"") do
      {:ok, %{
        entity: company,
        telecom_authorization: operator,
        spectrum_assets: operator[:spectrum_licenses] || [],
        nis2_classification: classify_telecom_nis2(operator),
        security_rating: rating,
        exposed_infrastructure: analyze_shodan_exposure(shodan_data),
        compliance_assessment: assess_telecom_nis2(operator, rating),
        assessed_at: DateTime.utc_now()
      }}
    end
  end

  defp classify_telecom_nis2(operator) do
    services = operator[:services] || []

    cond do
      :backbone in services -> :essential_critical_infrastructure
      :mobile_voice in services or :mobile_data in services -> :essential_service
      :fixed_internet in services -> :essential_service
      :broadcasting in services -> :important_entity
      true -> :standard_entity
    end
  end
end
```

## Use Cases

### Critical Infrastructure Mapping

CTU data is essential for comprehensive mapping of Czech telecommunications critical infrastructure. Key applications include identifying all telecom infrastructure operators and their authorized service areas, mapping spectrum holdings and network coverage areas for mobile and fixed operators, NIS2 essential entity identification based on service type and scale classification, combining CTU authorization data with [Shodan](@/osint/shodan.md) for infrastructure exposure assessment, and assessing the concentration of critical services among operators to evaluate systemic risk.

### Competitive Intelligence

Telecommunications market analysis leverages CTU data for competitive positioning and market dynamics understanding. Analysts can track new market entrants and operator registrations as they are filed, monitor spectrum auctions and allocation outcomes for competitive position changes, analyze market share through numbering allocation distribution, compare service quality data across operators using CTU measurement reports, and assess the impact of regulatory decisions on operator competitive positioning.

### Due Diligence and Regulatory Compliance

CTU data supports due diligence workflows for entities in the telecommunications sector. Specific applications include verifying telecom operator license claims during M&A due diligence, checking regulatory penalty history for compliance risk assessment, cross-referencing CTU data with [ARES](@/osint/ares.md) for entity verification and [Justice.cz](@/osint/justice-cz.md) for corporate structure analysis, assessing spectrum asset portfolio value for investment analysis, and evaluating NIS2 compliance readiness based on CTU registration and service classification.

### Fraud Investigation Support

CTU numbering data supports telecommunications fraud investigations by enabling operator identification from phone numbers, detecting number spoofing through numbering plan validation, identifying unauthorized telecom service providers, and correlating suspicious calling patterns with operator infrastructure data.

## Data Quality and Validation

CTU data quality is high for authorization and spectrum data, as these records carry legal significance and are maintained under regulatory oversight. Operator registrations are verified against company registry data, and spectrum licenses include precise technical parameters.

Penalty and decision data requires PDF parsing, which introduces potential extraction errors. The Prismatic adapter validates extracted data against known decision formats and flags anomalies for manual review.

Market analysis data is published on regulatory cycles (typically 3-year intervals) and may not reflect current market conditions between review periods. Time-sensitivity annotations are applied to market analysis data to indicate the applicable review period.

Coverage is comprehensive for registered operators but may not capture unauthorized or unregistered service providers. The absence of a CTU registration for a claimed telecom service provider is a significant red flag that warrants further investigation.

## Platform Integration

Within the Prismatic ecosystem, CTU provides the telecommunications intelligence layer for [Prismatic Perimeter](@/apps/prismatic-perimeter.md) NIS2 assessments. CTU data is correlated with [ARES](@/osint/ares.md) entity data, [Shodan](@/osint/shodan.md) infrastructure exposure data, [Censys](@/osint/censys.md) certificate and service scanning, and [ERU](@/osint/eru.md) energy regulatory data for comprehensive critical infrastructure mapping.

The NIS2 compliance assessment module uses CTU service classifications to determine entity NIS2 status (essential, important, or standard) and combines this with security rating data to produce compliance gap analyses.

## NABLA Compliance

**Signal Plurality**: CTU data is cross-validated with ARES entity data to verify operator identity and corporate structure. Infrastructure exposure assessments combine CTU authorization data with at least two independent scanning sources.

**Contradiction Preservation**: When CTU authorization data conflicts with observed network infrastructure (for example, unauthorized services detected through scanning), both signals are preserved for investigation.

**Time Decay**: Spectrum license expiry dates provide natural temporal boundaries. Authorization data is treated as current until the entity is deregistered. Market analysis data carries explicit validity period annotations.

**Provenance Mandatory**: All CTU data includes the source database, query parameters, retrieval timestamp, and document reference for regulatory decisions.

**Absence Informative**: The absence of CTU registration for a claimed telecom provider is treated as a significant negative signal, as registration is legally mandatory.

## Performance and Rate Limits

| Aspect | Details |
|--------|---------|
| **Authentication** | None required for public databases |
| **Rate Limit** | No official limit; respectful crawling recommended |
| **Data Format** | HTML (web), PDF (decisions), XLS (data exports) |
| **Cost** | Free access |
| **Coverage** | All authorized operators and spectrum holders in Czech Republic |
| **Response Time** | 1-5 seconds for registry queries |

The Prismatic adapter caches operator registry data with 7-day TTL, spectrum allocation data with 30-day TTL, and regulatory decisions with 90-day TTL.

## Related Resources

- [ERU](@/osint/eru.md) - Energy regulator (sister critical infrastructure authority)
- [ARES](@/osint/ares.md) - Entity identification for telecom companies
- [Shodan](@/osint/shodan.md) - Network infrastructure exposure assessment
- [Censys](@/osint/censys.md) - Certificate and service scanning for operators
- [Hlidac Statu](@/osint/hlidac-statu.md) - Public contracts for telecom entities
- [UOHS](@/osint/uohs.md) - Competition cases in telecom markets
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - NIS2 compliance assessment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)