+++
title = "Clearbit"
weight = 45
[extra]
category = "global"
type = "company"
module = "Clearbit"
description = "Real-time company and person data enrichment API for business intelligence and lead qualification"
has_api = true
url = "https://clearbit.com"
rate_limit = "600 req/min (standard), higher for enterprise"
capabilities = ["Company Enrichment", "Person Enrichment", "Email Lookup", "Domain Intelligence", "Company Discovery", "Reveal (IP-to-Company)", "Prospector"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1759
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Clearbit", "Real-time", "osint", "global", "Prismatic Platform", "Company"]
tags = ["osint", "global", "clearbit", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Clearbit - Prismatic Platform"
+++

## Overview

Clearbit (now part of HubSpot) is a data enrichment platform that transforms minimal input -- an email address, a domain name, or an IP address -- into comprehensive company and person profiles in real time. The platform maintains enriched profiles on over 44 million companies and 350 million contacts, built from a combination of public web data, social media profiles, government filings, technology detection, and proprietary data partnerships. Since its acquisition by HubSpot in 2023, Clearbit's enrichment capabilities have been deeply integrated into the HubSpot CRM ecosystem while maintaining its standalone API for programmatic access.

The core value proposition for [OSINT](@/glossary/osint.md) is Clearbit's ability to resolve partial identifiers into full entity profiles. Given only an email address, Clearbit returns the person's full name, job title, employer, social profiles, and the employer's complete company profile including industry classification, employee count, revenue estimates, technology stack, and corporate headquarters location. This enrichment capability is invaluable for transforming sparse data points encountered during investigations into actionable intelligence with minimal manual research effort.

Clearbit's Reveal product is particularly noteworthy for visitor intelligence applications. Reveal maps IP addresses to companies by maintaining a proprietary database of corporate IP ranges, identifying which organizations are visiting a website without requiring any form submission or user identification. This technology underpins many de-anonymization products in the B2B marketing space and is directly relevant for security-focused visitor intelligence systems such as the Prismatic [HAWKEYE](@/apps/prismatic-hawkeye.md) module.

The platform's data freshness is maintained through continuous crawling and re-enrichment cycles. Company profiles are updated as new information becomes available through web crawling, social media monitoring, financial filings, and technology detection scans. This ensures that enrichment results reflect current organizational state rather than stale historical data.

## Data Sources and Coverage

Clearbit aggregates data from hundreds of public and proprietary sources to build comprehensive entity profiles. The platform's data pipeline processes multiple signal types to ensure breadth and accuracy.

| Data Type | Description | Source Types |
|-----------|-------------|-------------|
| **Person Profiles** | Full name, title, employer, bio, social profiles, avatar | Social media, web crawling, WHOIS |
| **Company Profiles** | Name, domain, industry, size, revenue, tech stack, location | Financial filings, web crawling |
| **Email Enrichment** | Person and company profile from email address | Domain resolution, social matching |
| **Domain Enrichment** | Full company profile from domain name | DNS, WHOIS, web analysis |
| **IP-to-Company** | Resolve IP addresses to visiting company | BGP data, WHOIS, proprietary mapping |
| **Technology Stack** | Software, platforms, and services detected on company domains | Tag detection, DNS, header analysis |
| **Social Profiles** | LinkedIn, Twitter, Facebook, GitHub profiles | Social platform APIs, web crawling |
| **Firmographics** | SIC/NAICS codes, employee ranges, revenue estimates | Financial filings, web extraction |
| **Funding Data** | Investment rounds, investors, total funding | Crunchbase, SEC filings, news |
| **Parent/Subsidiary** | Corporate hierarchy and ownership relationships | Filings, web research |

### Enrichment Data Flow

The enrichment pipeline follows a multi-stage resolution process. When an email address is submitted, the platform first resolves the domain portion to identify the associated company. It then searches its person database for matching records, combining signals from social media profiles, public web pages, and historical data to construct the person profile. The company enrichment runs in parallel, analyzing the domain's web presence, technology stack, financial data, and firmographic indicators. Cross-referencing between person and company data validates employment relationships and organizational structure.

### Technology Detection

Clearbit's technology detection system identifies over 1,000 distinct technologies in use across company websites. Detection methods include HTML tag analysis for embedded scripts and tracking pixels, DNS record analysis for email and CDN providers, HTTP response header inspection for server software and frameworks, JavaScript library fingerprinting for frontend frameworks, and SSL certificate analysis for hosting and security providers. This technology intelligence is valuable for competitive analysis, market sizing, and identifying potential security exposures.

## Technical Architecture

Clearbit operates a large-scale data enrichment pipeline that continuously processes web data to maintain fresh company and person profiles. The architecture consists of several interconnected systems.

The web crawling infrastructure maintains a persistent crawl of millions of company websites, extracting structured data from HTML content, meta tags, structured data markup (JSON-LD, microdata), and linked social profiles. Crawl frequency is prioritized based on domain importance and change velocity, with high-value targets crawled daily and the long tail updated weekly.

The entity resolution engine matches incoming enrichment requests against the person and company databases using probabilistic matching algorithms. For person lookups, the engine considers email domain, name frequency, employment signals, and social profile linkage. Match confidence scores are returned with all results, enabling downstream systems to filter based on accuracy requirements.

The technology detection system operates as a specialized crawl that examines specific technical indicators on company websites. Unlike general web crawling, technology detection requires executing JavaScript (headless browser rendering), analyzing network requests, and inspecting DOM structure to identify client-side frameworks and services.

The Reveal (IP-to-Company) system maintains a continuously updated mapping of IP address ranges to companies. This mapping is built from BGP routing data, regional Internet registry (RIR) records, WHOIS data, and proprietary signals from Clearbit's customer network. The system handles the complexity of shared hosting environments, CDNs, and VPN services by maintaining confidence scores for IP-to-company mappings and excluding low-confidence attributions.

## API Integration

Clearbit provides a comprehensive API suite for programmatic entity enrichment and discovery.

```elixir
defmodule PrismaticOsint.Adapters.Clearbit do
  @moduledoc """
  Clearbit enrichment adapter for the Prismatic OSINT pipeline.
  Provides person, company, and IP-to-company resolution capabilities.
  """

  @person_url "https://person-stream.api.clearbit.com/v2/people/find"
  @company_url "https://company-stream.api.clearbit.com/v2/companies/find"
  @reveal_url "https://reveal.clearbit.com/v1/companies/find"
  @prospector_url "https://prospector.clearbit.com/v1/people/search"
  @discovery_url "https://discovery.clearbit.com/v1/companies/search"

  # Enrich a person by email
  def enrich_person(email) do
    with {:ok, response} <- api_get(@person_url, %{email: email}) do
      {:ok, %{
        id: response["id"],
        email: email,
        full_name: response["name"]["fullName"],
        first_name: response["name"]["givenName"],
        last_name: response["name"]["familyName"],
        title: response["employment"]["title"],
        seniority: response["employment"]["seniority"],
        company: %{
          name: response["employment"]["name"],
          domain: response["employment"]["domain"]
        },
        linkedin: response["linkedin"]["handle"],
        twitter: response["twitter"]["handle"],
        github: response["github"]["handle"],
        location: response["location"],
        bio: response["bio"]
      }}
    end
  end

  # Enrich a company by domain
  def enrich_company(domain) do
    with {:ok, response} <- api_get(@company_url, %{domain: domain}) do
      {:ok, %{
        name: response["name"],
        domain: domain,
        category: %{
          industry: response["category"]["industry"],
          sector: response["category"]["sector"]
        },
        metrics: %{
          employees: response["metrics"]["employees"],
          estimated_annual_revenue: response["metrics"]["estimatedAnnualRevenue"]
        },
        tech: response["tech"] || [],
        geo: response["geo"],
        identifiers: response["identifiers"]
      }}
    end
  end

  # Reveal: IP to company
  def reveal(ip) do
    with {:ok, response} <- api_get(@reveal_url, %{ip: ip}) do
      {:ok, %{company: parse_company(response["company"]), confidence: response["confidence"]}}
    end
  end

  # Prospector: find contacts at a company
  def prospector(domain, opts \\ []) do
    params = Map.merge(%{domain: domain}, Map.new(opts))

    with {:ok, response} <- api_get(@prospector_url, params) do
      {:ok, Enum.map(response["results"], &parse_person/1)}
    end
  end

  # Company discovery with filters
  def discover(filters) do
    with {:ok, response} <- api_get(@discovery_url, Map.new(filters)) do
      {:ok, Enum.map(response["results"], &parse_company/1)}
    end
  end
end
```

### Entity Enrichment Pipeline

```elixir
defmodule PrismaticIntelligence.Enrichment.EntityResolver do
  @moduledoc """
  Resolves partial entity identifiers into comprehensive profiles
  using Clearbit enrichment as the primary data source, with
  cross-validation against Czech registries and funding databases.
  """

  alias PrismaticOsint.Adapters.{Clearbit, Crunchbase, Ares}

  def resolve_from_email(email) do
    with {:ok, person} <- Clearbit.enrich_person(email),
         {:ok, company} <- Clearbit.enrich_company(person.company.domain),
         {:ok, crunchbase} <- Crunchbase.search_organization(company.name) do
      {:ok, %{
        person: person,
        company: company,
        funding: extract_ok(crunchbase),
        data_sources: [:clearbit, :crunchbase],
        enrichment_confidence: calculate_confidence(person, company),
        enriched_at: DateTime.utc_now()
      }}
    end
  end

  def resolve_from_domain(domain) do
    with {:ok, company} <- Clearbit.enrich_company(domain),
         {:ok, tech_stack} <- extract_tech(company),
         {:ok, leadership} <- Clearbit.prospector(domain, seniority: "executive") do
      {:ok, %{
        company: company,
        technology: tech_stack,
        leadership: leadership,
        enriched_at: DateTime.utc_now()
      }}
    end
  end
end
```

## Use Cases

### Lead Intelligence and Sales Enablement

Clearbit's primary commercial use case centers on B2B sales intelligence. For the Prismatic platform, this capability is repurposed for OSINT investigation workflows. Applications include instantly enriching inbound leads and investigation subjects from email addresses, scoring and qualifying entities based on company firmographics and technology stack, identifying decision-makers and key personnel within target organizations, building organizational charts from domain-level prospector queries, and tracking technology adoption patterns across industry segments for competitive intelligence.

### Visitor Intelligence

The Reveal product enables de-anonymization of website visitors at the organizational level, which is directly relevant to the [HAWKEYE](@/apps/prismatic-hawkeye.md) visitor intelligence system. Specific capabilities include mapping anonymous website visitors to companies via IP-to-company resolution, feeding identified company profiles into visitor behavior analysis, tracking organizational interest patterns based on page views and engagement metrics, correlating visitor identity with CRM records for account-based intelligence, and identifying high-value visitors for prioritized engagement.

### OSINT Enrichment and Investigation

Clearbit's enrichment capabilities transform minimal identifiers into comprehensive entity profiles for investigation workflows. Key applications include transforming email addresses into full person and company profiles with social media linkage, building comprehensive entity dossiers from a single domain name or email, cross-referencing enriched data with Czech registries such as [ARES](@/osint/ares.md) for local entity verification, mapping technology stacks to identify security tool adoption and potential exposure, and identifying corporate hierarchies and subsidiary relationships for complex investigation targets.

### Security Posture Assessment

Clearbit's technology detection feeds into security posture analysis by identifying the web technologies, security tools, email providers, and hosting infrastructure used by target organizations. This intelligence helps assess whether organizations have deployed security controls appropriate to their size and industry, identify outdated or vulnerable technology components, and map the external technology surface for attack surface analysis.

## Data Quality and Validation

Clearbit maintains data quality through continuous re-enrichment cycles and multi-source validation. Person records are refreshed when social media profile changes are detected, typically within 24-48 hours of a profile update. Company records are updated based on website changes, financial filing events, and technology stack modifications.

Enrichment confidence scores are provided for all results, with scores reflecting the strength of the match between the input identifier and the returned profile. High-confidence matches (90%+) indicate strong signals from multiple independent sources. Medium-confidence matches (70-90%) suggest a probable match with some uncertainty. Low-confidence matches (below 70%) indicate weak or contradictory signals and should be manually verified.

Data coverage varies by geography. North American and Western European companies have the highest coverage rates (85%+ for companies with web presence). Coverage for Central and Eastern European entities, including Czech companies, may be supplemented by cross-referencing with local registries such as [ARES](@/osint/ares.md) and [Justice.cz](@/osint/justice-cz.md).

## Platform Integration

Within the Prismatic ecosystem, Clearbit serves as the primary commercial entity enrichment source, integrated at multiple levels. The [OSINT Core](@/apps/prismatic-osint-core.md) framework uses Clearbit as the default enrichment adapter for person and company resolution. The [HAWKEYE](@/apps/prismatic-hawkeye.md) visitor intelligence system uses Clearbit Reveal for IP-to-company mapping, correlating identified visitors with security intelligence from [Shodan](@/osint/shodan.md) and [Censys](@/osint/censys.md).

The [Prismatic Perimeter](@/apps/prismatic-perimeter.md) security rating engine uses Clearbit technology detection data to assess whether organizations have appropriate security controls deployed. The enrichment pipeline maintains a local cache of enrichment results with configurable TTL (default 7 days for person data, 30 days for company data) to minimize API usage and ensure consistent results across concurrent queries.

## NABLA Compliance

The Clearbit integration within Prismatic adheres to the NABLA epistemic framework axioms.

**Signal Plurality**: Clearbit enrichment results are cross-validated against at least one independent source. Person profiles are verified against social media platforms and professional networks. Company profiles are cross-referenced with [ARES](@/osint/ares.md) for Czech entities, [Companies House](@/osint/companies-house.md) for UK entities, and [Crunchbase](@/osint/crunchbase.md) for funding data.

**Contradiction Preservation**: When Clearbit data conflicts with registry data (for example, different employee counts or industry classifications), both data points are preserved with source attribution. The platform presents contradictions transparently rather than silently selecting one source.

**Time Decay**: Enrichment results carry timestamps and freshness indicators. The platform applies configurable freshness weights that reduce confidence for enrichment results older than 30 days, reflecting the dynamic nature of employment and organizational data.

**Provenance Mandatory**: All enrichment data includes the source (Clearbit), the enrichment timestamp, the confidence score, and the specific API version. Downstream consumers can trace any data point back to its enrichment origin.

**Source Independence**: Clearbit is treated as an independent source from registry databases, financial data providers, and social media platforms, each contributing distinct signal types to the composite entity profile.

## Performance and Rate Limits

| Tier | Rate Limit | Features |
|------|-----------|----------|
| **Free** | 50 enrichments/month | Person and company enrichment |
| **Growth** | 600 req/min | Full enrichment API, Reveal |
| **Business** | 1,200 req/min | Prospector, Discovery, bulk enrichment |
| **Enterprise** | Custom | Custom data feeds, SLA, dedicated support |

### Authentication

API key required for all requests using Bearer token authentication via HTTP header. The Prismatic adapter manages credential rotation and monitors usage against plan limits, raising alerts at 80% consumption thresholds.

### Response Times

Synchronous enrichment endpoints (person-stream, company-stream) return results in 200-500ms for cached profiles and 1-3 seconds for profiles requiring fresh data collection. The Reveal endpoint responds in under 100ms due to the pre-computed nature of IP-to-company mappings.

## Related Resources

- [Crunchbase](@/osint/crunchbase.md) - Startup funding and investor intelligence
- [ZoomInfo](@/osint/zoominfo.md) - B2B contact and organizational data
- [ARES](@/osint/ares.md) - Czech business register for entity verification
- [Have I Been Pwned](@/osint/haveibeenpwned.md) - Breach exposure for enriched email addresses
- [FullContact](@/osint/fullcontact.md) - Person identity resolution and social enrichment
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Entity enrichment for security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)