+++
title = "RIPEstat"
weight = 38
[extra]
category = "global"
type = "ip"
module = "Ripestat"
description = "Authoritative RIPE NCC data and statistics service for Internet number resources and routing analysis"
has_api = true
url = "https://stat.ripe.net"
rate_limit = "No strict limit; fair use policy, 1000 req/day recommended"
capabilities = ["IP Prefix Information", "ASN Analysis", "BGP Routing Data", "Geolocation", "Abuse Contact Lookup", "Network History", "Peering Information", "RPKI Validation", "RIR Allocation Data", "Looking Glass"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1119
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["RIPEstat", "Authoritative", "RIPE", "Internet", "osint", "global", "Prismatic Platform"]
tags = ["osint", "global", "ripestat", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "RIPEstat - Prismatic Platform"
+++

## Overview

RIPEstat is the official data analysis and statistics service of RIPE NCC (Reseaux IP Europeens Network Coordination Centre), one of the five Regional Internet Registries (RIRs) responsible for allocating and registering Internet number resources in Europe, the Middle East, and Central Asia. RIPEstat provides authoritative, registry-sourced data about IP prefixes, Autonomous System Numbers (ASNs), BGP routing state, abuse contacts, RPKI validation status, and network ownership across the global Internet.

The critical distinction between RIPEstat and commercial IP intelligence services is authority. RIPEstat data originates directly from the registry responsible for allocating IP resources in its service region, and it aggregates data from all five RIRs (RIPE NCC, ARIN, APNIC, AfriNIC, LACNIC) through inter-registry data sharing agreements. This makes RIPEstat the definitive source for network ownership verification, BGP routing analysis, and abuse contact resolution. Commercial services such as [IPInfo](/osint/ipinfo/) or [MaxMind](/osint/maxmind/) provide valuable enrichment, but for authoritative ownership determination, RIPEstat is the primary source.

Within the Prismatic Platform, RIPEstat provides foundational network intelligence for the [Prismatic Perimeter](/apps/prismatic-perimeter/) [EASM](/glossary/easm/) module. It serves as the authoritative validation layer for IP ownership claims, routing security assessment (RPKI), and abuse contact resolution. The platform uses RIPEstat as the ground-truth source against which commercial IP intelligence data is validated.

## Data Sources and Coverage

RIPEstat aggregates data from authoritative sources across the global Internet infrastructure ecosystem:

| Data Source | Description | Update Frequency |
|-------------|-------------|-----------------|
| **RIPE Database** | Official registry of IP and ASN allocations in the RIPE region | Real-time |
| **RIS Route Collectors** | BGP routing data from 600+ peering points globally | Continuous |
| **RPKI Repositories** | Route Origin Authorization (ROA) data from all RIRs | Every 15 minutes |
| **Other RIR Databases** | ARIN, APNIC, AfriNIC, LACNIC registries | Daily sync |
| **IXP Databases** | Internet Exchange Point membership and peering data | Periodic |
| **Geolocation** | Country-level location derived from RIR allocation data | With registry updates |

### Available Data Types

| Data Type | Description | Authority Level |
|-----------|-------------|----------------|
| **IP Prefix Info** | Prefix holder, allocation date, RIR, status, less/more specifics | Authoritative |
| **ASN Overview** | AS holder name, country, registration date, prefix count | Authoritative |
| **BGP Routing** | Current and historical BGP announcements, visibility, path | Observed |
| **Abuse Contact** | Authoritative abuse contact for any IP prefix | Authoritative |
| **Geolocation** | Country-level geolocation from RIR allocation data | Authoritative |
| **RPKI Validation** | Route origin validation status (valid/invalid/unknown) | Authoritative |
| **Peering Data** | ASN peering relationships, upstreams, downstreams | Observed |
| **Visibility** | Global BGP visibility from route collectors | Observed |
| **Allocations** | IANA and RIR allocation history for prefixes | Authoritative |
| **Looking Glass** | Real-time BGP route lookups from RIPE RIS collectors | Real-time |

## Technical Architecture

RIPEstat's architecture combines authoritative registry data with observed routing data from the world's largest BGP collection infrastructure.

```
+-------------------+     +-------------------+     +------------------+
| RIPE Database     |     | RIS Route         |     | RPKI             |
| (Registry Data)   |     | Collectors (600+) |     | Repositories     |
+--------+----------+     +--------+----------+     +--------+---------+
         |                         |                          |
         v                         v                          v
+------------------------------------------------------------------+
|                    RIPEstat Data Platform                         |
|                                                                  |
|  +------------------+  +------------------+  +----------------+  |
|  | Registry Module  |  | Routing Module   |  | RPKI Module    |  |
|  | (Prefix/ASN)     |  | (BGP/Visibility) |  | (Validation)   |  |
|  +------------------+  +------------------+  +----------------+  |
|                                                                  |
|  +------------------+  +------------------+  +----------------+  |
|  | Abuse Contact    |  | Geolocation      |  | History        |  |
|  | Resolution       |  | (RIR-based)      |  | (Time Series)  |  |
|  +------------------+  +------------------+  +----------------+  |
+------------------------------------------------------------------+
                              |
                              v
                   +--------------------+
                   | Data API v2        |
                   | stat.ripe.net/data |
                   | (JSON responses)   |
                   +--------------------+
```

The Data API v2 provides structured JSON responses with consistent field naming and metadata. Each response includes a `data_call_name`, `query_id`, and `process_time` for operational monitoring.

| API Component | Endpoint Pattern | Purpose |
|--------------|-----------------|---------|
| **Prefix Overview** | `/data/prefix-overview/data.json` | IP prefix holder and allocation |
| **ASN Overview** | `/data/as-overview/data.json` | ASN holder and registration |
| **BGP State** | `/data/bgp-state/data.json` | Current BGP routing state |
| **Abuse Contact** | `/data/abuse-contact-finder/data.json` | Authoritative abuse contacts |
| **RPKI Validation** | `/data/rpki-validation/data.json` | ROA validation status |
| **Routing History** | `/data/routing-history/data.json` | Historical BGP announcements |
| **ASN Neighbours** | `/data/asn-neighbours/data.json` | Peering relationships |
| **RIR Stats** | `/data/rir-stats-country/data.json` | Country-level resource allocation |

## API Integration

RIPEstat provides a free, unauthenticated JSON API with comprehensive coverage of Internet number resource data.

```elixir
defmodule Prismatic.Osint.RipeStat do
  @moduledoc """
  Adapter for the RIPE NCC RIPEstat data service.
  Provides authoritative network intelligence including IP prefix ownership,
  ASN analysis, BGP routing data, RPKI validation, and abuse contacts.
  """

  @base_url "https://stat.ripe.net/data"
  @source_app "PrismaticPlatform"

  @doc """
  Get authoritative prefix overview - who owns this IP range.
  """
  @spec prefix_overview(String.t()) :: {:ok, map()} | {:error, term()}
  def prefix_overview(prefix) do
    with {:ok, response} <- api_call("prefix-overview", resource: prefix) do
      {:ok, %{
        prefix: response["data"]["resource"],
        asn: response["data"]["asns"] |> List.first() |> Map.get("asn"),
        holder: response["data"]["asns"] |> List.first() |> Map.get("holder"),
        block: response["data"]["block"],
        announced: response["data"]["announced"],
        type: response["data"]["type"],
        rir: response["data"]["rir"]
      }}
    end
  end

  @doc """
  Get ASN overview including holder, country, and registration date.
  """
  @spec asn_overview(String.t()) :: {:ok, map()} | {:error, term()}
  def asn_overview(asn) do
    with {:ok, response} <- api_call("as-overview", resource: asn) do
      {:ok, %{
        asn: response["data"]["resource"],
        holder: response["data"]["holder"],
        country: response["data"]["country"],
        announced: response["data"]["announced"],
        registration_date: response["data"]["registration_date"],
        rir: response["data"]["rir"]
      }}
    end
  end

  @doc """
  Get authoritative abuse contact for an IP address or prefix.
  """
  @spec abuse_contact(String.t()) :: {:ok, map()} | {:error, term()}
  def abuse_contact(ip_or_prefix) do
    with {:ok, response} <- api_call("abuse-contact-finder", resource: ip_or_prefix) do
      {:ok, %{
        abuse_contacts: response["data"]["abuse_contacts"],
        authoritative_rir: response["data"]["authoritative_rir"]
      }}
    end
  end

  @doc """
  Validate RPKI status for an ASN-prefix pair.
  """
  @spec rpki_validation(String.t() | integer(), String.t()) :: {:ok, map()} | {:error, term()}
  def rpki_validation(asn, prefix) do
    with {:ok, response} <- api_call("rpki-validation", resource: asn, prefix: prefix) do
      {:ok, %{
        status: response["data"]["status"],
        description: response["data"]["description"],
        validating_roas: response["data"]["validating_roas"]
      }}
    end
  end

  @doc """
  Get prefix routing history over a time range.
  """
  @spec prefix_routing_history(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def prefix_routing_history(prefix, opts \\ []) do
    params = [resource: prefix]
    params = if opts[:starttime], do: [{:starttime, opts[:starttime]} | params], else: params
    params = if opts[:endtime], do: [{:endtime, opts[:endtime]} | params], else: params

    api_call("routing-history", params)
  end

  @doc """
  Get ASN peering relationships (neighbours).
  """
  @spec asn_neighbours(String.t()) :: {:ok, map()} | {:error, term()}
  def asn_neighbours(asn) do
    api_call("asn-neighbours", resource: asn)
  end

  @doc """
  Get country-level RIR resource allocation statistics.
  """
  @spec rir_stats_country(String.t()) :: {:ok, map()} | {:error, term()}
  def rir_stats_country(country_code) do
    api_call("rir-stats-country", resource: country_code)
  end

  defp api_call(data_call, params) do
    params = Keyword.put(params, :sourceapp, @source_app)
    url = "#{@base_url}/#{data_call}/data.json?#{URI.encode_query(params)}"

    case Prismatic.Http.get(url) do
      {:ok, %{status: 200, body: body}} -> {:ok, Jason.decode!(body)}
      {:ok, %{status: status}} -> {:error, {:http_error, status}}
      {:error, reason} -> {:error, reason}
    end
  end
end
```

### Network Ownership Verification Pipeline

```elixir
defmodule PrismaticPerimeter.Discovery.NetworkOwnership do
  @moduledoc """
  Verifies network ownership using authoritative RIPEstat data,
  cross-referenced with commercial IP intelligence for comprehensive
  network ownership verification and routing security assessment.
  """

  @spec verify_ownership(String.t()) :: {:ok, map()} | {:error, term()}
  def verify_ownership(ip_address) do
    tasks = [
      Task.async(fn -> RipeStat.prefix_overview(ip_address) end),
      Task.async(fn -> RipeStat.abuse_contact(ip_address) end),
      Task.async(fn -> IpInfo.lookup(ip_address) end)
    ]

    [ripe, abuse, ipinfo] = Task.await_many(tasks, 10_000)

    with {:ok, ripe_data} <- ripe,
         {:ok, abuse_data} <- abuse do
      rpki = RipeStat.rpki_validation(ripe_data.asn, ripe_data.prefix)

      {:ok, %{
        ip: ip_address,
        authoritative_owner: ripe_data.holder,
        asn: ripe_data.asn,
        prefix: ripe_data.prefix,
        rir: ripe_data.rir,
        rpki_status: elem(rpki, 1)[:status],
        abuse_contact: abuse_data.abuse_contacts,
        commercial_owner: get_in(ipinfo, [:ok, :company, :name]),
        ownership_match: verify_match(ripe_data, ipinfo),
        routing_security: assess_routing_security(rpki)
      }}
    end
  end

  defp assess_routing_security({:ok, %{status: "valid"}}), do: :secure
  defp assess_routing_security({:ok, %{status: "invalid"}}), do: :critical_risk
  defp assess_routing_security(_), do: :unknown
end
```

## Use Cases

### Network Ownership Verification for EASM

In External Attack Surface Management, accurately attributing IP addresses to organizations is fundamental. RIPEstat provides the authoritative ownership data that validates or contradicts commercial intelligence sources.

- Authoritatively verify IP prefix ownership for [Perimeter](/apps/prismatic-perimeter/) asset attribution
- Validate ASN ownership claims from commercial sources like [IPInfo](/osint/ipinfo/)
- Resolve allocation hierarchies (IANA to RIR to LIR to end user)
- Identify whether IPs are allocated, assigned, or sub-allocated

### Routing Security Assessment

BGP security is a critical component of organizational security posture. RIPEstat provides the data necessary to assess RPKI deployment and detect routing anomalies.

- Validate RPKI deployment for organizational prefixes (ROA coverage)
- Detect BGP route anomalies including potential route hijacks
- Monitor routing changes for critical infrastructure over time
- Assess routing security maturity as part of [Perimeter](/apps/prismatic-perimeter/) security ratings

### Abuse Management and Incident Response

When responding to security incidents, identifying the responsible party for a network range requires authoritative data.

- Look up authoritative abuse contacts for incident reporting
- Cross-reference abuse contacts with [AbuseIPDB](/osint/abuseipdb/) community reports
- Identify the responsible LIR (Local Internet Registry) for network ranges
- Support law enforcement with authoritative network attribution

### Peering and Infrastructure Analysis

Understanding how organizations connect to the Internet reveals their infrastructure maturity and potential single points of failure.

- Map ASN peering relationships to understand network topology
- Identify transit providers and potential single points of failure
- Analyze prefix announcement patterns for infrastructure assessment
- Compare peering diversity across organizational ASNs

## Data Quality and Reliability

| Quality Dimension | Assessment | Notes |
|------------------|------------|-------|
| **Authority** | Definitive | Direct from the RIR responsible for resource allocation |
| **Completeness** | High | Global coverage through inter-RIR data sharing |
| **Timeliness** | High | Registry data real-time; routing data continuous |
| **Accuracy** | High | Authoritative source; minimal interpretation |
| **Accessibility** | Excellent | Free, unauthenticated JSON API |
| **Consistency** | High | Standardized response format across all data calls |

Key considerations:

- **Registry vs. routing data**: Registry data (ownership, allocation) is authoritative; routing data (BGP state, visibility) is observed and may differ from registry records
- **RPKI coverage**: Not all prefixes have ROAs; absence of RPKI data does not indicate insecurity, just lack of cryptographic validation
- **Update propagation**: Changes to RIPE Database records appear in RIPEstat within minutes; other RIR data may have longer propagation times
- **Geolocation limitation**: RIPEstat provides only country-level geolocation based on registry allocation data, not precise physical location

## Platform Integration

RIPEstat serves as the authoritative network intelligence layer within the Prismatic Platform:

| Component | Integration | Purpose |
|-----------|-------------|---------|
| **Perimeter EASM** | IP ownership verification | Authoritative asset attribution |
| **Security Rating** | RPKI validation scoring | Routing security posture assessment |
| **Abuse Management** | Abuse contact resolution | Incident response contact identification |
| **Network Mapping** | Peering and prefix analysis | Infrastructure topology mapping |
| **Validation Layer** | Cross-source verification | Ground truth for commercial IP data |

## NABLA Compliance

| Axiom | Implementation |
|-------|---------------|
| **Signal Plurality** | RIPEstat (authoritative) cross-referenced with IPInfo (commercial) and Shodan (observed) |
| **Contradiction Preservation** | Discrepancies between registry ownership and observed routing preserved as potential hijack indicators |
| **Provenance Mandatory** | All network data tagged with RIPEstat source, data call name, and query timestamp |
| **Time Decay** | BGP routing data timestamped; cache TTL set to 1 hour for routing, 24 hours for registry data |
| **Source Independence** | RIPEstat treated as authoritative independent source; commercial sources treated as supplementary |

## Performance Metrics

| Metric | Target | Typical |
|--------|--------|---------|
| **Prefix Overview** | < 500ms | ~300ms |
| **ASN Overview** | < 500ms | ~250ms |
| **Abuse Contact** | < 500ms | ~200ms |
| **RPKI Validation** | < 500ms | ~350ms |
| **Routing History** | < 2s | ~1.2s (depends on time range) |
| **ASN Neighbours** | < 1s | ~600ms |
| **Cache Hit Rate** | > 70% | ~75% (mixed TTLs) |

## Related Resources

### Network Intelligence Sources
- [IPInfo](/osint/ipinfo/) - Commercial IP geolocation and ASN enrichment
- [MaxMind](/osint/maxmind/) - GeoIP databases for offline geolocation

### Threat and Abuse Intelligence
- [AbuseIPDB](/osint/abuseipdb/) - Community IP abuse reporting
- [Spamhaus](/osint/spamhaus/) - IP and domain blocklists
- [GreyNoise](/osint/greynoise/) - Internet background noise classification

### Infrastructure Scanning
- [Shodan](/osint/shodan/) - Internet device scanning per ASN
- [Censys](/osint/censys/) - Internet-wide scanning with ASN-level analysis

### Platform Components
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - EASM with network ownership verification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)