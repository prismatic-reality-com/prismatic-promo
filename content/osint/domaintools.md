+++
title = "DomainTools"
weight = 64
[extra]
category = "global"
type = "domain"
module = "DomainTools"
description = "Premium domain intelligence with WHOIS history, hosting, and risk scores"
has_api = true
url = "https://domaintools.com"
rate_limit = "API key required, enterprise plans"
capabilities = ["WHOIS History", "Reverse WHOIS", "Domain Risk Score", "Hosting History", "Domain Monitor", "Iris Investigation"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1144
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["DomainTools", "Premium", "WHOIS", "osint", "global", "Prismatic Platform", "Compliant", "GDPR"]
tags = ["osint", "global", "domaintools", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "DomainTools - Prismatic Platform"
+++

## Overview

DomainTools is the enterprise-grade domain intelligence platform that has served as the foundational data source for domain-centric security investigations since its founding in 2002. Originally launched as a WHOIS lookup service, DomainTools has evolved into the most comprehensive domain intelligence platform available, maintaining the world's largest repository of [WHOIS](@/glossary/whois.md) historical records with data spanning over two decades and covering virtually every registered domain on the internet.

The platform is trusted by security operations centers (SOCs), [threat intelligence](@/glossary/threat-intelligence.md) teams, law enforcement agencies, brand protection departments, and fraud investigation units at major organizations worldwide. DomainTools' unique value proposition lies in its historical depth: while current WHOIS records show who owns a domain today, DomainTools preserves the complete registration history, revealing previous owners, registration patterns, nameserver changes, and hosting migrations that are invisible to point-in-time queries.

DomainTools' flagship investigation platform, Iris, provides connected threat intelligence through domain-centric graph analysis. Iris enables analysts to pivot from a single suspicious domain to discover entire threat actor infrastructures by following connections through shared registrant information, nameserver configurations, IP address co-hosting patterns, and SSL certificate relationships. This connected intelligence approach has proven particularly effective for phishing campaign attribution, malware command-and-control infrastructure mapping, and brand impersonation detection.

The platform processes and indexes over 350 million domain registration events annually, maintaining a historical archive that exceeds 12 billion WHOIS records. This scale enables pattern recognition across registrant behaviors, domain registration campaigns, and infrastructure reuse that would be impossible with current-state-only data sources.

## Data Sources and Coverage

DomainTools aggregates data from multiple authoritative sources to build its comprehensive domain intelligence database.

| Data Source | Description | Historical Depth |
|-------------|-------------|-----------------|
| **WHOIS Records** | Registration data from all gTLD and ccTLD registries | 2002 to present; 12+ billion records |
| **DNS Records** | A, AAAA, MX, NS, SOA, TXT record monitoring | Continuous monitoring since 2006 |
| **IP Intelligence** | IP-to-domain mappings, hosting provider attribution | Historical hosting changes tracked |
| **SSL Certificates** | Certificate metadata including SANs and issuers | Certificate transparency integration |
| **Passive DNS** | DNS resolution history from global sensor network | Billions of resolution events |
| **Domain Registrations** | New domain registration monitoring across all TLDs | Real-time monitoring |
| **Risk Indicators** | Machine learning-based domain risk scoring | Continuously updated models |

### WHOIS Data Coverage

| TLD Category | Coverage | Notes |
|-------------|----------|-------|
| **gTLDs** (.com, .net, .org) | >99% | Most comprehensive coverage |
| **New gTLDs** (.xyz, .online, .io) | >95% | Coverage since each TLD's launch |
| **Major ccTLDs** (.uk, .de, .cn, .ru) | >90% | Varies by registry cooperation |
| **Privacy-Protected** | Registrant masked | Underlying registration metadata still tracked |
| **GDPR-Redacted** | Limited registrant data post-2018 | Historical pre-GDPR data preserved |

## Technical Architecture

DomainTools' infrastructure processes domain intelligence at massive scale through a distributed data pipeline architecture.

### Data Pipeline

```
Data Ingestion Layer
    +-- WHOIS Polling (all registries, continuous)
    +-- DNS Monitoring (global sensor network)
    +-- Certificate Transparency Log Processing
    +-- Passive DNS Collection
    +-- Domain Registration Feeds
    |
    v
Processing Layer
    +-- Record Normalization and Deduplication
    +-- Entity Resolution (registrant matching)
    +-- Change Detection and Alerting
    +-- Risk Score Computation (ML models)
    +-- Graph Relationship Building
    |
    v
Storage and Indexing
    +-- Historical Archive (12+ billion WHOIS records)
    +-- Real-time Search Index
    +-- Graph Database (connected infrastructure)
    +-- Time-Series DNS Data
    |
    v
API and Investigation Layer
    +-- REST API (programmatic access)
    +-- Iris Investigate (visual investigation)
    +-- Iris Detect (brand monitoring)
    +-- Iris Enrich (SIEM/SOAR integration)
```

### API Structure

The DomainTools API provides RESTful endpoints with JSON responses, authenticated via API username and key signature.

| API Product | Endpoint | Description |
|-------------|----------|-------------|
| **Domain Profile** | `/v1/domain-profile` | Current registration and hosting |
| **WHOIS History** | `/v1/whois/history` | Complete registration history |
| **Reverse WHOIS** | `/v1/reverse-whois` | Domains by registrant details |
| **Reverse IP** | `/v1/reverse-ip` | Domains hosted on an IP |
| **Hosting History** | `/v1/hosting-history` | IP and nameserver changes |
| **Risk Score** | `/v1/reputation` | Domain risk assessment (0-100) |
| **Iris Investigate** | `/v1/iris-investigate` | Connected infrastructure analysis |
| **Iris Enrich** | `/v1/iris-enrich` | Lightweight enrichment for SIEM |

## API Integration

```elixir
defmodule PrismaticOsint.Adapters.DomainTools do
  @moduledoc """
  DomainTools adapter for comprehensive domain intelligence.
  Provides WHOIS history, risk scoring, reverse lookups,
  and connected infrastructure investigation via Iris.
  """

  @behaviour PrismaticOsint.Adapter

  @doc """
  Get comprehensive domain profile including current registration,
  hosting, and risk assessment.
  """
  def profile(domain) do
    with {:ok, whois} <- api_call("/v1/domain-profile", %{domain: domain}),
         {:ok, risk} <- api_call("/v1/reputation", %{domain: domain}) do
      {:ok, %{
        domain: domain,
        registrant: whois["registrant"],
        registrar: whois["registration"]["registrar"],
        created: whois["registration"]["created"],
        updated: whois["registration"]["updated"],
        expires: whois["registration"]["expires"],
        nameservers: whois["name_servers"],
        risk_score: risk["risk_score"],
        risk_components: risk["reasons"],
        retrieved_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Retrieve complete WHOIS history for a domain.
  """
  def whois_history(domain) do
    case api_call("/v1/whois/history", %{domain: domain}) do
      {:ok, response} ->
        records = response["history"]
        |> Enum.map(&normalize_whois_record/1)
        |> Enum.sort_by(& &1.date, {:desc, Date})

        {:ok, %{domain: domain, records: records, total: length(records)}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Find all domains registered by the same entity.
  """
  def reverse_whois(query, opts \\ []) do
    params = %{terms: query, mode: Keyword.get(opts, :mode, "purchase")}
    case api_call("/v1/reverse-whois", params) do
      {:ok, response} ->
        {:ok, %{
          query: query,
          domains: response["domains"],
          total: response["domain_count"]["current_count"]
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Assess domain risk using DomainTools reputation scoring.
  """
  def risk_score(domain) do
    case api_call("/v1/reputation", %{domain: domain}) do
      {:ok, response} ->
        {:ok, %{
          domain: domain,
          score: response["risk_score"],
          reasons: response["reasons"],
          risk_level: classify_risk(response["risk_score"])
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp classify_risk(score) when score >= 80, do: :critical
  defp classify_risk(score) when score >= 60, do: :high
  defp classify_risk(score) when score >= 40, do: :medium
  defp classify_risk(_score), do: :low
end
```

### Threat Infrastructure Investigation Pipeline

```elixir
defmodule PrismaticOsint.Investigation.ThreatInfrastructure do
  @moduledoc """
  Maps threat actor infrastructure using DomainTools Iris
  pivot analysis combined with passive DNS and risk scoring.
  """

  def investigate_domain(domain) do
    tasks = [
      Task.async(fn -> DomainTools.profile(domain) end),
      Task.async(fn -> DomainTools.whois_history(domain) end),
      Task.async(fn -> DomainTools.risk_score(domain) end),
      Task.async(fn -> SecurityTrails.dns_history(domain) end)
    ]

    [profile, history, risk, dns] = Task.await_many(tasks, 30_000)

    with {:ok, related} <- discover_related_infrastructure(profile) do
      {:ok, %{
        target: domain,
        profile: extract_ok(profile),
        registration_history: extract_ok(history),
        risk_assessment: extract_ok(risk),
        dns_history: extract_ok(dns),
        related_infrastructure: related,
        investigation_leads: generate_leads(profile, history, risk),
        investigated_at: DateTime.utc_now()
      }}
    end
  end

  defp discover_related_infrastructure({:ok, profile}) do
    registrant = profile.registrant
    if registrant do
      DomainTools.reverse_whois(registrant)
    else
      {:ok, %{domains: [], total: 0}}
    end
  end

  defp discover_related_infrastructure(_), do: {:ok, %{domains: [], total: 0}}
end
```

## Use Cases

### Threat Intelligence and Attribution

DomainTools is the industry standard for domain-centric threat investigation. Security analysts use Iris Investigate to trace phishing campaigns, malware delivery infrastructure, and command-and-control networks by following registration patterns, shared hosting, nameserver clusters, and SSL certificate relationships. The historical depth enables attribution even when threat actors change their infrastructure, because registration patterns and behavioral fingerprints persist across domain generations.

### Brand Protection and Anti-Phishing

Brand protection teams use DomainTools' domain monitoring capabilities to detect newly registered domains that impersonate their brands. The system identifies typosquatting variants, homoglyph attacks, and lookalike domains within hours of registration, enabling rapid takedown before phishing campaigns launch. Reverse WHOIS lookups help identify serial offenders who register multiple impersonation domains.

### Fraud Investigation

Financial crime investigators use DomainTools to verify the legitimacy of domains used in business email compromise (BEC), investment fraud, and romance scams. The WHOIS history reveals whether a domain was recently registered (a common fraud indicator), whether it has been associated with previous fraudulent activity, and whether its registration details match claimed business identities.

### M&A Due Diligence

Domain portfolio assessment during mergers and acquisitions leverages DomainTools to verify domain ownership chains, identify potential trademark conflicts, assess the security posture of acquired web infrastructure, and discover any historical association with malicious activity that could present reputational risk.

## Data Quality and Reliability

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Completeness** | Excellent | Most comprehensive WHOIS archive globally |
| **Historical Depth** | Unmatched | Records dating to 2002; 12+ billion WHOIS records |
| **Currency** | Real-time | Continuous monitoring with near-real-time updates |
| **Accuracy** | Very High | Direct registry data; authoritative sources |
| **GDPR Impact** | Moderate | Post-2018 registrant data may be redacted; historical data preserved |
| **Risk Score Accuracy** | High | ML models trained on labeled malicious infrastructure |

### Limitations

DomainTools' primary limitation since 2018 is the impact of GDPR on WHOIS data availability. Many registries now redact registrant personal information, reducing the effectiveness of registrant-based pivots for recently registered domains. However, DomainTools preserves pre-GDPR historical data and still provides non-personal registration metadata (registrar, dates, nameservers) that enables infrastructure-based analysis. Enterprise customers may have access to additional data through ICANN-authorized purposes.

## Platform Integration

Within the Prismatic Platform, DomainTools serves as the premium domain intelligence source, providing historical depth and connected infrastructure analysis that complement free and lower-cost alternatives. The integration prioritizes DomainTools for high-confidence investigation workflows where historical context and attribution capabilities are critical.

DomainTools risk scores feed directly into [Prismatic Perimeter](@/apps/prismatic-perimeter.md) [security rating](@/glossary/security-rating.md) calculations, contributing to the domain reputation component of overall security posture assessments. The Iris Investigate API enables automated infrastructure mapping that populates the platform's threat intelligence knowledge graph.

## NABLA Compliance

| NABLA Axiom | Compliance | Implementation |
|-------------|------------|----------------|
| **Signal Plurality** | Compliant | DomainTools provides one of multiple domain intelligence signals alongside SecurityTrails, WhoisXML |
| **Contradiction Preservation** | Compliant | Discrepancies between DomainTools and other WHOIS sources are flagged for review |
| **Absence Informative** | Compliant | GDPR-redacted records tracked as information-absent signals |
| **Time Decay** | Compliant | All records include retrieval and effective timestamps |
| **Unknown Valid** | Compliant | Inconclusive risk scores reported as uncertainty rather than false confidence |
| **Source Independence** | Compliant | Independent WHOIS collection infrastructure separate from other providers |
| **Provenance Mandatory** | Compliant | Full provenance chain from registry source through DomainTools to platform |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **API Response Time** | 200-800ms | Varies by endpoint complexity |
| **WHOIS History Depth** | 20+ years | Records from 2002 to present |
| **Domain Coverage** | 350M+ active domains | All gTLDs and major ccTLDs |
| **Historical Records** | 12+ billion | WHOIS record archive |
| **Risk Score Update** | Continuous | ML models updated regularly |
| **New Domain Detection** | Near real-time | Registration monitoring across all TLDs |
| **Data Freshness** | Minutes to hours | Depending on registry update frequency |

## Related Resources

- [WhoisXML API](@/osint/whoisxml.md) - WHOIS and DNS intelligence alternative
- [SecurityTrails](@/osint/securitytrails.md) - DNS history and passive DNS intelligence
- [RiskIQ](@/osint/riskiq.md) - Passive DNS and web intelligence platform
- [crt.sh](@/osint/crtsh.md) - [Certificate transparency](@/glossary/certificate-transparency.md) for domain discovery
- [DNSdumpster](@/osint/dnsdumpster.md) - Free DNS reconnaissance complement
- [FullHunt](@/osint/fullhunt.md) - Attack surface discovery for domain infrastructure

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)