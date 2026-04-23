+++
title = "FullHunt"
weight = 51
[extra]
category = "global"
type = "attack_surface"
module = "FullHunt"
description = "Attack surface intelligence platform for exposed assets and vulnerabilities"
has_api = true
url = "https://fullhunt.io"
rate_limit = "100 req/month (free), tiered plans"
capabilities = ["Attack Surface Discovery", "Subdomain Enumeration", "Port Scanning", "Technology Detection", "Vulnerability Detection", "API Integration"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1429
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["FullHunt", "Attack", "osint", "global", "Prismatic Platform", "EASM", "Censys"]
tags = ["osint", "global", "fullhunt", "prismatic"]
quality_score = 77
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "FullHunt - Prismatic Platform"
+++

## Overview

FullHunt is an [attack surface](/glossary/attack-surface/) intelligence platform that continuously discovers and monitors internet-exposed assets belonging to organizations. It combines subdomain enumeration, port scanning, service identification, technology fingerprinting, and vulnerability detection into a unified platform purpose-built for external attack surface management (EASM). Unlike active scanning tools that require explicit authorization and generate network traffic, FullHunt maintains a continuously updated passive database of internet assets, enabling rapid discovery and assessment without directly probing target infrastructure.

For [OSINT](/glossary/osint/) analysts and security professionals, FullHunt provides a comprehensive view of an organization's internet-facing footprint from the attacker's perspective. The platform indexes billions of assets across the internet, associating them with their parent organizations through domain ownership, DNS resolution, certificate transparency logs, and other passive discovery techniques. This enables analysts to answer fundamental questions about what an organization exposes to the internet, what technologies they run, and what vulnerabilities may be present in their external infrastructure.

FullHunt occupies a specific niche in the attack surface intelligence landscape alongside platforms like Shodan, Censys, and BinaryEdge. Its differentiator is the focus on organization-centric attack surface mapping rather than general-purpose internet search, providing pre-correlated views of all assets belonging to a domain rather than requiring analysts to manually assemble findings from individual host queries. This organization-centric approach aligns well with EASM workflows and makes FullHunt particularly valuable for security teams managing large, distributed internet footprints.

The platform's data is refreshed through continuous internet scanning, with the frequency varying by asset type and plan tier. Critical infrastructure such as web servers and mail servers is scanned more frequently than less commonly targeted services, ensuring that the most security-relevant data remains current.

## Data Sources and Collection Methods

FullHunt's intelligence is derived from multiple passive and active collection methods:

| Collection Method | Data Produced | Coverage |
|-------------------|--------------|----------|
| **DNS Enumeration** | Subdomains, A/AAAA/CNAME/MX/NS records | Comprehensive -- certificate transparency, brute force, zone walking |
| **Port Scanning** | Open ports, service identification, banner grabbing | Top 1,000+ ports, full TCP for premium tiers |
| **TLS/SSL Analysis** | Certificate details, cipher suites, protocol versions | All HTTPS endpoints and TLS-enabled services |
| **Technology Fingerprinting** | Web frameworks, CMS, server software, libraries | HTTP headers, response bodies, JavaScript analysis |
| **Certificate Transparency** | Subdomain discovery from CT logs | Real-time CT log monitoring for new certificates |
| **Vulnerability Matching** | CVE correlation based on service versions | NVD cross-reference for identified service versions |
| **Cloud Asset Discovery** | Cloud provider identification, storage bucket exposure | AWS, Azure, GCP, DigitalOcean infrastructure detection |
| **WHOIS/Registration** | Domain ownership, registrar, registration dates | Standard WHOIS queries with historical data |

### Data Points per Asset

| Data Category | Specific Fields | Intelligence Value |
|---------------|----------------|-------------------|
| **Network** | IP address, ASN, geolocation, reverse DNS | Infrastructure mapping, hosting identification |
| **Services** | Port, protocol, banner, version | Vulnerability assessment, technology inventory |
| **Web** | HTTP status, headers, title, technologies | Application mapping, technology stack identification |
| **TLS** | Certificate chain, expiry, SAN entries, cipher strength | Certificate hygiene, subdomain discovery, crypto assessment |
| **DNS** | Record types, values, TTL, nameservers | DNS infrastructure mapping, CDN detection |
| **Vulnerabilities** | CVE IDs, severity scores, affected versions | Risk prioritization, remediation planning |
| **Cloud** | Provider, region, service type | Cloud footprint mapping, misconfiguration detection |

## API Integration

FullHunt provides a well-documented REST API with JSON responses. Authentication is via API key passed in the `X-API-KEY` header.

```elixir
defmodule Prismatic.Osint.FullHunt do
  @moduledoc """
  FullHunt OSINT adapter for attack surface intelligence.

  Provides structured access to FullHunt's internet asset database
  for attack surface discovery, technology fingerprinting, and
  vulnerability assessment. Requires valid API key.
  """

  @base_url "https://fullhunt.io/api/v1"

  @doc """
  Discover the complete attack surface for a domain.
  Returns all known subdomains, services, and technologies.
  """
  @spec domain(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def domain(domain_name, opts \\ []) do
    headers = [{"X-API-KEY", api_key()}]

    with {:ok, response} <- http_get("#{@base_url}/domain/#{domain_name}/details", headers),
         {:ok, parsed} <- Jason.decode(response.body) do
      {:ok, %{
        domain: domain_name,
        hosts: parsed["hosts"],
        host_count: parsed["host_count"],
        dns: parsed["dns"],
        metadata: parsed["metadata"],
        source: :fullhunt,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Enumerate all known subdomains for a domain.
  Returns subdomain list with resolution status.
  """
  @spec subdomains(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def subdomains(domain_name, opts \\ []) do
    headers = [{"X-API-KEY", api_key()}]

    with {:ok, response} <- http_get("#{@base_url}/domain/#{domain_name}/subdomains", headers),
         {:ok, parsed} <- Jason.decode(response.body) do
      {:ok, %{
        domain: domain_name,
        subdomains: parsed["hosts"],
        count: length(parsed["hosts"]),
        source: :fullhunt,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Search the FullHunt database using query syntax.
  Supports filters for technology, country, port, and more.
  """
  @spec search(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def search(query, opts \\ []) do
    page = Keyword.get(opts, :page, 1)
    headers = [{"X-API-KEY", api_key()}]
    params = %{query: query, page: page}

    with {:ok, response} <- http_get("#{@base_url}/search", headers, params),
         {:ok, parsed} <- Jason.decode(response.body) do
      {:ok, %{
        query: query,
        total: parsed["total"],
        hosts: parsed["hosts"],
        source: :fullhunt,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Get detailed information for a specific host.
  Returns all known services, technologies, and vulnerabilities.
  """
  @spec host(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def host(hostname, opts \\ []) do
    headers = [{"X-API-KEY", api_key()}]

    with {:ok, response} <- http_get("#{@base_url}/host/#{hostname}", headers),
         {:ok, parsed} <- Jason.decode(response.body) do
      {:ok, %{
        hostname: hostname,
        ip: parsed["ip"],
        ports: parsed["ports"],
        technologies: parsed["technologies"],
        vulnerabilities: parsed["vulnerabilities"],
        cloud: parsed["cloud"],
        tls: parsed["tls"],
        source: :fullhunt,
        collected_at: DateTime.utc_now()
      }}
    end
  end

  defp api_key, do: Application.get_env(:prismatic, :fullhunt_api_key)
end
```

### Search Query Syntax

FullHunt supports a rich query language for searching across its internet asset database:

| Filter | Syntax | Example |
|--------|--------|---------|
| **Technology** | `technology:name` | `technology:nginx` |
| **Country** | `country:code` | `country:CZ` |
| **Port** | `port:number` | `port:8443` |
| **ASN** | `asn:number` | `asn:13335` |
| **Cloud Provider** | `cloud:provider` | `cloud:aws` |
| **Status Code** | `status_code:code` | `status_code:200` |
| **Domain** | `domain:name` | `domain:example.com` |
| **IP Range** | `ip:range` | `ip:203.0.113.0/24` |

## Query Examples

Practical attack surface intelligence collection scenarios:

```elixir
# Full attack surface discovery for a target domain
{:ok, surface} = Prismatic.Osint.FullHunt.domain("example.com")
IO.puts("Total hosts: #{surface.host_count}")

# Enumerate subdomains for scope assessment
{:ok, subs} = Prismatic.Osint.FullHunt.subdomains("example.com")
IO.puts("Subdomains found: #{subs.count}")
Enum.each(subs.subdomains, &IO.puts/1)

# Find all nginx servers in Czech Republic
{:ok, results} = Prismatic.Osint.FullHunt.search("technology:nginx country:CZ")

# Identify exposed admin panels
{:ok, admin_panels} = Prismatic.Osint.FullHunt.search(
  "domain:example.com technology:wordpress port:443"
)

# Get detailed host intelligence
{:ok, host_info} = Prismatic.Osint.FullHunt.host("api.example.com")
IO.puts("Technologies: #{inspect(host_info.technologies)}")
IO.puts("Vulnerabilities: #{inspect(host_info.vulnerabilities)}")

# Cross-scanner validation with Shodan and Censys
{:ok, fullhunt_data} = Prismatic.Osint.FullHunt.domain("target.com")
{:ok, shodan_data} = Prismatic.Osint.Shodan.search("hostname:target.com")
{:ok, censys_data} = Prismatic.Osint.Censys.search("target.com")

combined_surface = %{
  domain: "target.com",
  fullhunt_hosts: fullhunt_data.host_count,
  shodan_results: shodan_data.total,
  censys_results: censys_data.total,
  unique_ips: merge_unique_ips(fullhunt_data, shodan_data, censys_data),
  all_technologies: merge_technologies(fullhunt_data, shodan_data),
  scanner_agreement: calculate_agreement_score(fullhunt_data, shodan_data, censys_data)
}
```

## Use Cases

### External Attack Surface Management

FullHunt's primary use case is continuous monitoring of an organization's external attack surface. Security teams use the platform to maintain a complete inventory of internet-facing assets, detect new assets as they appear through subdomain monitoring, identify technology changes that may introduce vulnerabilities, track vulnerability exposure across the entire external perimeter, and detect shadow IT and unauthorized services.

The organization-centric approach enables security teams to move beyond reactive vulnerability management toward proactive attack surface reduction. By maintaining continuous visibility into what is exposed, teams can identify and remediate exposure before adversaries discover and exploit it.

### Vulnerability Prioritization

FullHunt's correlation of discovered services with known vulnerabilities from the [CVE](/glossary/cve/) database enables risk-based vulnerability prioritization. Rather than treating all vulnerabilities equally, analysts can prioritize based on internet exposure (directly reachable from the internet), service criticality (business importance of the affected system), exploit availability (whether public exploits exist for the CVE), and environmental context (what other assets and data may be at risk).

This prioritization is critical for organizations with large attack surfaces where remediating all vulnerabilities simultaneously is infeasible. FullHunt data enables data-driven triage decisions that maximize security impact per remediation effort.

### Competitive Intelligence and Technology Assessment

FullHunt's technology fingerprinting enables non-intrusive assessment of competitor technology stacks. Analysts can identify what web frameworks, content management systems, and server software competitors use, discover their cloud providers and hosting infrastructure, assess their security posture through exposed service versions and TLS configurations, and track technology changes over time as indicators of digital transformation initiatives.

### Merger and Acquisition Due Diligence

During M&A technical due diligence, FullHunt provides rapid assessment of an acquisition target's internet-exposed infrastructure without requiring access to internal systems. The attack surface assessment reveals the size and complexity of the target's internet footprint, potential security liabilities from exposed vulnerable services, technology debt indicators from outdated software versions, and cloud infrastructure scope and provider dependencies.

### Incident Response and Threat Hunting

During incident response, FullHunt data helps identify potential attack vectors by revealing all internet-facing services that may have been compromised, historical changes in the attack surface that correlate with the incident timeline, and technologies in use that may be affected by the exploited vulnerability.

## Limitations and Constraints

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Passive data currency** | Data may not reflect very recent changes | Combine with active scanning for critical assessments |
| **Free tier restrictions** | 100 queries/month limits continuous monitoring | Upgrade to Pro for production use, cache results locally |
| **Vulnerability matching accuracy** | Version-based CVE matching may produce false positives | Validate critical findings with targeted active scanning |
| **IPv6 coverage gaps** | IPv6 scanning coverage less comprehensive than IPv4 | Supplement with Censys for IPv6-heavy environments |
| **Internal assets invisible** | Cannot discover assets behind NAT/firewalls | Use as complement to internal vulnerability scanning |
| **Geographic scanning bias** | Some regions may have less frequent scanning | Cross-validate with regional scanning platforms like ZoomEye |

## API Plans and Pricing

| Plan | Queries/Month | Features | Best For |
|------|--------------|----------|----------|
| **Community** | 100 | Basic domain lookup, subdomain enumeration | Individual researchers, occasional assessments |
| **Pro** | 10,000 | Full API access, search, export, monitoring | Security teams, regular EASM operations |
| **Enterprise** | Custom | Dedicated scanning, priority data, SLA, webhooks | SOC integration, continuous monitoring at scale |

## Legal and Ethical Considerations

FullHunt operates by scanning publicly accessible internet infrastructure and indexing the results. The Prismatic Platform's use of FullHunt data operates within standard open-source intelligence boundaries. All data queried through FullHunt represents publicly observable internet infrastructure that any internet user could discover through direct connection.

When using FullHunt for attack surface assessment of third-party organizations, the Prismatic Platform ensures that all activities fall within authorized scope such as contracted security assessments, due diligence with legal basis, or authorized competitive intelligence. The platform does not use FullHunt data to facilitate unauthorized access to discovered services.

Discovered vulnerabilities are handled in accordance with responsible disclosure principles. When FullHunt reveals critical vulnerabilities in non-client infrastructure, the platform's disclosure policy governs how and whether the affected organization is notified.

## Platform Integration

FullHunt integrates into the [Prismatic Perimeter](/apps/prismatic-perimeter/) EASM module as one of multiple attack surface intelligence sources, contributing to comprehensive external exposure assessment.

```elixir
defmodule Prismatic.Pipeline.AttackSurfaceIntelligence do
  @moduledoc """
  Multi-scanner attack surface intelligence pipeline correlating
  FullHunt, Shodan, Censys, and BinaryEdge for comprehensive EASM.
  """

  def assess_attack_surface(domain) do
    tasks = [
      Task.async(fn -> Prismatic.Osint.FullHunt.domain(domain) end),
      Task.async(fn -> Prismatic.Osint.Shodan.search("hostname:#{domain}") end),
      Task.async(fn -> Prismatic.Osint.Censys.search(domain) end)
    ]

    [fullhunt, shodan, censys] = Task.await_many(tasks, :timer.seconds(30))

    %{
      domain: domain,
      total_assets: deduplicate_assets(fullhunt, shodan, censys),
      technologies: merge_technology_findings(fullhunt, shodan),
      vulnerabilities: aggregate_vulnerabilities(fullhunt, shodan, censys),
      cloud_exposure: extract_cloud_assets(fullhunt),
      risk_score: calculate_composite_risk(fullhunt, shodan, censys),
      scanner_coverage: assess_scanner_agreement(fullhunt, shodan, censys)
    }
  end
end
```

## Best Practices

For effective attack surface intelligence using FullHunt, establish a baseline scan of all organizational domains during initial deployment and then monitor for changes over time. Use the subdomain enumeration endpoint as a starting point, then drill into host details for assets that appear high-risk based on exposed ports or outdated technologies.

Cross-validate FullHunt findings with at least one additional scanning platform such as [Shodan](/osint/shodan/) or [Censys](/osint/censys/) for critical assessments. Different scanners have different scanning schedules, port coverage, and fingerprinting capabilities, so multi-source correlation provides more complete and reliable intelligence.

Integrate FullHunt data with vulnerability management workflows by mapping discovered services to [NVD](/osint/nvd/) vulnerability data and prioritizing remediation based on internet exposure, exploit availability, and business criticality. Automate alerting for new subdomains and newly discovered services to ensure rapid response to attack surface expansion.

## Related Sources

- [Shodan](/osint/shodan/) - Internet-connected device search engine with deep service fingerprinting
- [Censys](/osint/censys/) - Internet-wide scanning with certificate and host intelligence
- [SecurityTrails](/osint/securitytrails/) - DNS and domain history for infrastructure tracking
- [BinaryEdge](/osint/binaryedge/) - Internet scanning with data leak and vulnerability detection
- [ZoomEye](/osint/zoomeye/) - Cyberspace search engine with Asia-Pacific coverage
- [WhoisXML](/osint/whoisxml/) - WHOIS and DNS intelligence for domain attribution
- [crt.sh](/osint/crtsh/) - Certificate transparency log search for subdomain discovery

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)