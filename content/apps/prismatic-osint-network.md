+++
title = "Prismatic OSINT Network"
weight = 31
[extra]
icon = "globe-americas"
color = "cyan"
description = "Network intelligence OSINT adapters - IP, DNS, port scanning, and infrastructure analysis"
category = "OSINT"
files = "280"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 978
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "OSINT", "Network", "apps", "Prismatic Platform", "Source", "PrismaticOsintNetwork"]
tags = ["apps", "osint", "prismatic-osint-network", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic OSINT Network - Prismatic Platform"
+++

## Overview

Prismatic [OSINT](/glossary/osint/) Network provides adapters for network-focused intelligence sources, integrating with platforms such as [Shodan](/glossary/shodan/), [Censys](/glossary/censys/), BinaryEdge, SecurityTrails, and [GreyNoise](/glossary/greynoise/) to collect data about IP addresses, domains, DNS records, open ports, and network infrastructure. Each external source is accessed through a standardized adapter that normalizes data into a common schema, enabling uniform querying regardless of the originating platform.

Network intelligence forms the backbone of [attack surface](/glossary/attack-surface/) discovery. When [Prismatic Perimeter](/apps/prismatic-perimeter/) evaluates an organization's external exposure, it relies on OSINT Network adapters to enumerate subdomains, identify exposed services, correlate IP addresses with autonomous systems, and track [certificate transparency](/glossary/certificate-transparency/) logs. The resulting data feeds directly into [security rating](/glossary/security-rating/) algorithms in [Prismatic Perimeter Core](/apps/prismatic-perimeter-core/).

The module implements intelligent source orchestration. Rather than querying all sources for every request, it selects the optimal combination of sources based on the query type, data freshness requirements, and API quota availability. Source responses are cached with configurable TTLs and cross-validated for consistency, adhering to the platform's [signal plurality](/glossary/signal-plurality/) requirements under the [NABLA framework](/glossary/nabla-infinity/).

## Architecture

```
Query Interface --> Source Selector --> Adapter Pool --> Response Normalizer --> Cache
       |                |                |                 |               |
  IP/Domain Query   Quota Aware     Per-Source       Common Schema    TTL-Based
  Infrastructure    Freshness       Rate Limiting    Confidence       ETS Store
  DNS/WHOIS         Type Matching   Error Handling   Scoring          Invalidation
```

Each adapter runs as a supervised process with its own [rate limiting](/glossary/rate-limiting/) state, ensuring that API quotas are never exceeded even under concurrent query load. The [adapter pattern](/glossary/adapter-pattern/) follows the platform's storage adapter design from [Prismatic Storage Core](/apps/prismatic-storage-core/).

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticOsintNetwork` | Public facade: `ip_intelligence/1`, `domain_recon/1`, `map_infrastructure/1`, `quota_status/0` |
| `PrismaticOsintNetwork.Application` | OTP application entry point with adapter pool supervision |
| `PrismaticOsintNetwork.SourceSelector` | Intelligent source selection based on query type, freshness, and quota availability |
| `PrismaticOsintNetwork.ShodanAdapter` | Shodan API integration for service banner collection and vulnerability tagging |
| `PrismaticOsintNetwork.CensysAdapter` | Censys integration for certificate intelligence and host profiling |
| `PrismaticOsintNetwork.SecurityTrailsAdapter` | Historical DNS data and domain intelligence retrieval |
| `PrismaticOsintNetwork.GreyNoiseAdapter` | Scanner identification and benign traffic classification |
| `PrismaticOsintNetwork.ResponseNormalizer` | Source-specific response normalization to common network schema |
| `PrismaticOsintNetwork.QuotaManager` | Per-source API quota tracking with token bucket rate limiting |

## Key Features

### IP Intelligence

Comprehensive IP address analysis combines data from multiple network intelligence sources into a unified profile with [confidence scoring](/glossary/confidence-scoring/):

```elixir
defmodule PrismaticOsintNetwork.IpIntelligence do
  @spec analyze(String.t(), keyword()) :: {:ok, IpProfile.t()} | {:error, term()}
  def analyze(ip_address, opts \\ []) do
    sources = SourceSelector.select_for(:ip_lookup, opts)

    results = Task.async_stream(sources, fn source ->
      {source, query_adapter(source, :ip_lookup, ip_address)}
    end, max_concurrency: length(sources), timeout: 15_000)
    |> collect_results()

    merged = ResponseNormalizer.merge_ip_results(results)

    {:ok, %IpProfile{
      ip: ip_address,
      geolocation: merged.geo,
      asn: merged.asn,
      organization: merged.org,
      ports: merged.open_ports,
      services: merged.services,
      reputation: compute_reputation(results),
      sources: Map.keys(results),
      confidence: compute_confidence(results),
      last_seen: merged.most_recent_observation
    }}
  end
end
```

- Geolocation, ASN, and organization mapping from multiple sources with cross-validation
- Reverse DNS and PTR record resolution with history tracking
- Port and service enumeration with banner analysis and version detection
- Reputation scoring aggregated from [threat intelligence](/glossary/threat-intelligence/) feeds

### DNS Intelligence

- Forward and reverse DNS resolution with DNSSEC validation status
- Historical DNS record tracking through passive DNS databases
- Passive DNS database queries across SecurityTrails, VirusTotal, and others
- Zone transfer detection and DNS configuration analysis

### Infrastructure Mapping

The infrastructure mapping capability assembles a complete picture of an organization's external-facing systems:

| Discovery Method | Source | Data Collected | Coverage |
|-----------------|--------|----------------|----------|
| Subdomain enumeration | Certificate transparency, DNS brute-force | Subdomains, CNAME chains | High (passive + active) |
| Certificate monitoring | crt.sh, Censys | Issued certificates, SANs, expiry | Comprehensive |
| Port scanning | Shodan, Censys, BinaryEdge | Open ports, service banners | Internet-wide |
| WHOIS tracking | SecurityTrails, WHOIS APIs | Registration, nameservers, history | Domain-level |
| Technology fingerprinting | HTTP headers, response analysis | Web server, framework, CMS | Application-layer |
| ASN correlation | IPInfo, BGP data | IP ranges, peer ASNs | Network-layer |

- Subdomain enumeration across certificate transparency, DNS, and web sources
- Certificate transparency log monitoring for new certificate issuances
- [WHOIS](/glossary/whois/) and registration data aggregation with change tracking
- Technology stack fingerprinting from HTTP headers and response analysis

### Source Orchestration

The source selector implements cost-aware, quota-aware selection to minimize API expenditure while maximizing intelligence completeness:

```elixir
defmodule PrismaticOsintNetwork.SourceSelector do
  @spec select_for(atom(), keyword()) :: list(atom())
  def select_for(query_type, opts \\ []) do
    all_capable = sources_supporting(query_type)
    freshness = Keyword.get(opts, :freshness, :standard)
    budget = Keyword.get(opts, :budget, :optimal)

    all_capable
    |> filter_by_quota_availability()
    |> filter_by_freshness(freshness)
    |> sort_by_cost(budget)
    |> ensure_plurality(min: 2)
    |> Enum.take(max_sources(budget))
  end

  defp ensure_plurality(sources, min: min_count) do
    if length(sources) < min_count do
      Logger.warning("Insufficient sources for plurality: #{length(sources)}")
    end
    sources
  end
end
```

## Integrated Sources

| Source | Data Type | Key Capability |
|--------|-----------|----------------|
| Shodan | IP/Port | Service banner collection and vulnerability tagging |
| Censys | Cert/Host | Certificate intelligence and host profiling |
| BinaryEdge | Scan | Internet-wide scanning with [protocol](/glossary/protocol/) analysis |
| SecurityTrails | DNS | Historical DNS data and domain intelligence |
| GreyNoise | IP | Scanner identification and benign traffic classification |
| IPInfo | IP | Geolocation, ASN mapping, and company attribution |

## Usage

```elixir
# Multi-source IP intelligence with automatic source selection
{:ok, intel} = PrismaticOsintNetwork.ip_intelligence("1.2.3.4")
# => %{geo: %{country: "US", city: "San Francisco"}, asn: 13335,
#       org: "Cloudflare", ports: [80, 443], reputation: 0.92}

# Comprehensive domain reconnaissance
{:ok, recon} = PrismaticOsintNetwork.domain_recon("example.com")
# => %{subdomains: 47, dns_records: [...], certificates: [...], technologies: [...]}

# Full infrastructure mapping with relationship graph
{:ok, infra} = PrismaticOsintNetwork.map_infrastructure("example.com")
# => %{hosts: 23, services: 89, certificates: 12, relationships: [...]}

# Check source API quota status
{:ok, quotas} = PrismaticOsintNetwork.quota_status()
# => %{shodan: %{remaining: 450, resets_at: ~U[...]}, censys: %{remaining: 230, ...}}

# Historical DNS analysis
{:ok, dns_history} = PrismaticOsintNetwork.dns_history("example.com",
  record_types: [:A, :CNAME, :MX], from: ~D[2024-01-01])
```

## NABLA Compliance

| NABLA Axiom | Network OSINT Enforcement | Implementation |
|-------------|--------------------------|----------------|
| Provenance Mandatory | Every data point traceable to originating source and scan timestamp | Source attribution and observation timestamp on all results |
| Signal Plurality | Network intelligence requires multi-source corroboration | SourceSelector enforces minimum 2 independent sources per query |
| Source Independence | Each network source adapter operates independently | Per-source process isolation, independent rate limiting, separate error handling |
| Time Decay | Network data freshness critical for security assessment | TTL-based caching with configurable staleness thresholds per source |
| Contradiction Preservation | Conflicting scan results preserved for analyst review | Multi-source results maintained independently with per-source confidence |

## Testing

IP intelligence tests verify multi-source data merging, geolocation accuracy, and ASN correlation against known IP address fixtures. DNS intelligence tests verify record resolution, historical tracking, and DNSSEC validation. Infrastructure mapping tests verify subdomain enumeration completeness, certificate monitoring, and technology fingerprinting accuracy.

Source orchestration tests verify quota management, cost optimization, and plurality enforcement. Integration tests exercise the full pipeline from multi-source query through normalization to cached result delivery. Adapter contract tests verify consistent [behaviour](/glossary/behaviour/) compliance across all source adapters.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Perimeter](/apps/prismatic-perimeter/) | Primary consumer for attack surface discovery and asset enumeration |
| [Prismatic OSINT Core](/apps/prismatic-osint-core/) | Implements core OSINT adapter protocol for network sources |
| [Prismatic OSINT Monitoring](/apps/prismatic-osint-monitoring/) | Network source checks for continuous infrastructure monitoring |
| [Prismatic Detection Engine](/apps/prismatic-detection-engine/) | Network intelligence feeds threat detection rules |
| [Prismatic OSINT Sources](/apps/prismatic-osint-sources/) | Source [registry](/glossary/registry-otp/) and API key management |
| [Prismatic Perimeter Core](/apps/prismatic-perimeter-core/) | Network data feeds security rating dimension scoring |

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| IP intelligence (single source) | 200ms-2s | Depends on source API response time |
| IP intelligence (multi-source) | 1-5s | Parallel queries across selected sources |
| Domain reconnaissance | 2-10s | Subdomain enumeration + DNS + certificates |
| Infrastructure mapping | 5-30s | Full enumeration with relationship building |
| DNS history query | 500ms-3s | Historical record retrieval |
| Source quota check | < 10ms | ETS-backed quota state |
| Response normalization | < 50ms | Pure function transformation |

[Telemetry](/glossary/telemetry/) events: `[:prismatic, :osint_network, :query_completed]`, `[:prismatic, :osint_network, :source_selected]`, `[:prismatic, :osint_network, :quota_consumed]`.

## Related Resources

- [Prismatic OSINT Sources](/apps/prismatic-osint-sources/) -- Source registry and API key management for all OSINT adapters
- [Prismatic Crawler Core](/apps/prismatic-crawler-core/) -- HTTP-based collection infrastructure for active scanning
- [Prismatic Traits](/apps/prismatic-traits/) -- Network intelligence contributes to entity trait computation
- [Competitor Researcher](/agents/competitor-researcher/) -- Leverages network intelligence for competitive infrastructure analysis
- [Alert Management Specialist](/agents/alert-management-specialist/) -- Manages alerts from network intelligence change detection
- [Adapter Pattern Specialist](/agents/adapter-pattern-specialist/) -- Ensures OSINT source adapters follow consistent interface patterns
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Multi-source network intelligence fusion across Shodan, Censys, and others
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Continuous monitoring of network infrastructure changes
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Signal plurality enforced across independent network intelligence sources

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)