+++
title = "Shodan"
weight = 9
[extra]
category = "security"
description = "Internet-wide search engine for discovering connected devices, open ports, services, and vulnerabilities across the global attack surface"
related_terms = ["easm", "censys", "greynoise", "attack-surface", "signal-plurality", "risk-score", "tls", "rate-limiting"]
platform_relevance = "critical"
complexity = "intermediate"
domain = "osint"
layer = "intelligence-collection"
paradigm = "passive-reconnaissance"
creator = "John Matherly"
founded = "2009"
prismatic_usage = "easm-primary-discovery-source"
quality_impact = "high"
safety_level = "authorized-only"
documentation_required = true
integration_pattern = "api-client"
api_type = "REST"
data_freshness = "continuous-scanning"
related_apps = ["prismatic_perimeter", "prismatic_osint_core", "prismatic_perimeter_core"]
compliance_relevance = ["nis2", "zkb"]
see_also = ["censys", "greynoise", "easm", "attack-surface", "risk-score", "signal-plurality"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1772
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Shodan", "Internet-wide", "glossary", "security", "Prismatic Platform", "Filter", "String"]
tags = ["glossary", "security", "shodan", "prismatic"]
quality_score = 90
image = "/images/sections/glossary.png"
image_alt = "Shodan - Prismatic Platform"
+++

## Definition

Shodan is a search engine for internet-connected devices that continuously scans the entire IPv4 address space (and increasingly IPv6), cataloging open ports, running services, protocol banners, SSL/TLS certificates, and device metadata. Created by John Matherly in 2009, Shodan fundamentally differs from traditional search engines like Google: rather than indexing web content served over HTTP, Shodan indexes the internet's infrastructure layer -- servers, IoT devices, industrial control systems (ICS/SCADA), databases, network equipment, cameras, and any device that responds to network probes.

Shodan's scanning methodology involves sending crafted packets to every IP address on specific ports, collecting the responses (banners), and indexing the results in a searchable database. A banner is the initial response a service sends when a connection is established -- it typically reveals the software name, version, configuration details, and sometimes even the operating system. This passive reconnaissance data is invaluable for security professionals conducting asset discovery, vulnerability assessment, and exposure monitoring without actively probing target infrastructure.

The platform has become an indispensable tool in the External Attack Surface Management ([EASM](/glossary/easm/)) discipline, where organizations need to understand their externally visible footprint from an attacker's perspective. By querying Shodan for assets associated with a target organization, security teams can discover shadow IT, forgotten servers, misconfigured services, and exposed databases that the organization may not know exist. In the Prismatic Platform, Shodan serves as the primary data source for the [Prismatic Perimeter](/glossary/easm/) module's asset discovery pipeline, feeding findings into the [security rating](/glossary/security-rating/) engine that produces A-F grades for organizational security posture.

## Historical Context and Evolution

Shodan began as a personal project by John Matherly while he was a student, inspired by the idea of creating a search engine for internet-connected devices rather than web pages. The name "Shodan" references the artificial intelligence antagonist from the System Shock video game series. What started as a curiosity-driven project rapidly became one of the most important tools in the cybersecurity professional's toolkit.

The early internet scanning landscape was dominated by tools like Nmap, which required active, targeted scanning of specific IP ranges. Shodan's innovation was continuous, internet-wide scanning with results indexed in a searchable database. Instead of running your own scan (which takes time, bandwidth, and may trigger intrusion detection systems), you could query Shodan's pre-collected data to instantly discover what is exposed on any IP address or organization.

Over the years, Shodan has expanded from basic port scanning and banner grabbing to include SSL/TLS certificate analysis, vulnerability tagging (matching software versions to known CVEs), screenshot capture (visual snapshots of web interfaces, RDP sessions, and VNC desktops), and specialized protocol support for industrial control systems (Modbus, DNP3, EtherNet/IP), IoT protocols (MQTT, CoAP), and database protocols (MongoDB, Elasticsearch, Redis). The platform's Shodan Monitor product provides continuous monitoring of specified IP ranges, alerting organizations when new services appear or configurations change on their assets.

The ethical landscape around Shodan has evolved alongside the tool itself. Early critics viewed Shodan as a hacker's tool that made it trivially easy to find vulnerable systems. The security community now generally recognizes Shodan as a defensive tool: if Shodan can find your exposed database, so can an attacker. The difference is that Shodan enables defenders to find and fix exposures before attackers exploit them. This perspective aligns with the Prismatic Platform's philosophy of using [OSINT](/glossary/easm/) capabilities for authorized defensive security operations.

## Scanning Capabilities

Shodan's scanning infrastructure covers a broad range of protocols and services, providing deep visibility into internet-facing infrastructure.

| Capability | Description | Example Findings |
|-----------|-------------|-----------------|
| **Port scanning** | Identifies open TCP/UDP ports across all IPv4 | SSH on non-standard ports, exposed databases |
| **Banner grabbing** | Captures service identification responses | Software versions, configuration details |
| **SSL/TLS analysis** | Examines certificate chains and cipher suites | Expired certificates, weak protocols, self-signed certs |
| **HTTP content** | Captures HTTP headers and page titles | Admin panels, default credentials pages |
| **Protocol-specific** | Deep inspection of common protocols | Modbus (ICS), MQTT (IoT), RTSP (cameras) |
| **Vulnerability tagging** | Identifies known CVEs from banner data | CVE-matched vulnerable software versions |
| **Organization mapping** | Associates IPs with organizations via WHOIS/BGP | Autonomous System Number (ASN) attribution |
| **Geolocation** | Maps IP addresses to physical locations | Country, city, ISP, coordinates |
| **Screenshot capture** | Visual snapshots of exposed interfaces | Web dashboards, RDP sessions, VNC desktops |
| **Industrial protocols** | Modbus, DNP3, EtherNet/IP, BACnet scanning | SCADA controllers, PLCs, building automation |

### Common Shodan Search Filters

| Filter | Purpose | Example Query |
|--------|---------|---------------|
| `hostname:` | Search by hostname/domain | `hostname:example.com` |
| `org:` | Search by organization name | `org:"Acme Corporation"` |
| `port:` | Filter by open port | `port:3389` (RDP) |
| `product:` | Filter by software product | `product:Apache` |
| `version:` | Filter by software version | `version:2.4.49` (known vuln) |
| `country:` | Filter by country code | `country:CZ` |
| `city:` | Filter by city | `city:Prague` |
| `net:` | Filter by CIDR range | `net:192.168.0.0/16` |
| `ssl:` | Filter by SSL certificate field | `ssl.cert.subject.cn:example.com` |
| `vuln:` | Filter by CVE identifier | `vuln:CVE-2021-44228` (Log4Shell) |
| `has_screenshot:true` | Only results with screenshots | Visual discovery of exposed services |
| `asn:` | Filter by Autonomous System Number | `asn:AS13335` (Cloudflare) |

### Advanced Query Composition

Shodan supports Boolean operators and nested queries for precise discovery. This capability is essential for the Prismatic Platform's automated asset enumeration, where queries must be specific enough to avoid false positives while comprehensive enough to discover shadow IT.

```
# Find Apache servers in Czech Republic with known vulnerabilities
product:Apache country:CZ vuln:CVE-2021-41773

# Find exposed MongoDB instances (no authentication)
product:MongoDB port:27017 "MongoDB Server Information"

# Find Elasticsearch clusters with publicly readable indices
product:Elasticsearch port:9200 "cluster_name"

# Find exposed industrial control systems
tag:ics country:CZ
```

## API Integration

Shodan provides a RESTful API for programmatic access, enabling automated asset discovery and monitoring workflows.

```elixir
defmodule PrismaticPerimeter.Sources.Shodan do
  @moduledoc """
  Shodan API integration for external attack surface discovery.
  Implements rate-limited, resilient querying with circuit breaker
  protection and result caching for the EASM pipeline.
  """

  @base_url "https://api.shodan.io"

  @type search_result :: %{
    ip: String.t(),
    port: pos_integer(),
    protocol: String.t(),
    banner: String.t(),
    product: String.t() | nil,
    version: String.t() | nil,
    vulns: [String.t()],
    ssl: map() | nil,
    location: map(),
    timestamp: DateTime.t()
  }

  @doc "Search Shodan for hosts matching a query"
  @spec search(String.t(), keyword()) :: {:ok, [search_result()]} | {:error, term()}
  def search(query, opts \\ []) do
    params = %{
      key: api_key(),
      query: query,
      page: Keyword.get(opts, :page, 1),
      minify: Keyword.get(opts, :minify, false)
    }

    case HTTPClient.get("#{@base_url}/shodan/host/search", params: params) do
      {:ok, %{status: 200, body: body}} ->
        {:ok, parse_results(body["matches"])}

      {:ok, %{status: 429}} ->
        {:error, :rate_limited}

      {:ok, %{status: status, body: body}} ->
        {:error, {:api_error, status, body["error"]}}

      {:error, reason} ->
        {:error, {:connection_error, reason}}
    end
  end

  @doc "Get all information about a specific host"
  @spec host_info(String.t()) :: {:ok, map()} | {:error, term()}
  def host_info(ip) do
    case HTTPClient.get("#{@base_url}/shodan/host/#{ip}", params: %{key: api_key()}) do
      {:ok, %{status: 200, body: body}} -> {:ok, body}
      {:ok, %{status: 404}} -> {:error, :not_found}
      {:error, reason} -> {:error, reason}
    end
  end

  @doc "Search for hosts associated with a domain"
  @spec domain_search(String.t()) :: {:ok, [search_result()]} | {:error, term()}
  def domain_search(domain) do
    search("hostname:#{domain}")
  end

  @doc "Get DNS information for a domain including subdomains"
  @spec dns_resolve(String.t()) :: {:ok, map()} | {:error, term()}
  def dns_resolve(domain) do
    case HTTPClient.get("#{@base_url}/dns/domain/#{domain}", params: %{key: api_key()}) do
      {:ok, %{status: 200, body: body}} -> {:ok, body}
      {:error, reason} -> {:error, reason}
    end
  end

  defp api_key, do: Application.get_env(:prismatic_perimeter, :shodan_api_key)

  defp parse_results(nil), do: []
  defp parse_results(matches) when is_list(matches) do
    Enum.map(matches, fn match ->
      %{
        ip: match["ip_str"],
        port: match["port"],
        protocol: match["transport"],
        banner: match["data"],
        product: match["product"],
        version: match["version"],
        vulns: Map.get(match, "vulns", []) |> Map.keys(),
        ssl: match["ssl"],
        location: match["location"],
        timestamp: parse_timestamp(match["timestamp"])
      }
    end)
  end
end
```

## Data Model

Shodan's data model captures rich information about each discovered host and service.

| Field | Type | Description |
|-------|------|-------------|
| `ip_str` | String | IPv4 or IPv6 address |
| `port` | Integer | Open port number |
| `transport` | String | `tcp` or `udp` |
| `data` | String | Raw banner text |
| `product` | String | Identified software product |
| `version` | String | Software version |
| `os` | String | Detected operating system |
| `org` | String | Organization (from WHOIS/BGP) |
| `asn` | String | Autonomous System Number |
| `isp` | String | Internet Service Provider |
| `ssl` | Object | SSL/TLS certificate and configuration details |
| `vulns` | Object | Known CVE identifiers matching the service |
| `location` | Object | Country, city, coordinates, region |
| `timestamp` | DateTime | When the scan was performed |
| `hostnames` | Array | Reverse DNS hostnames |
| `domains` | Array | Associated domain names |
| `tags` | Array | Service classification tags (e.g., `ics`, `cloud`) |
| `http` | Object | HTTP-specific data (headers, title, favicon hash) |

## Context in Prismatic Platform

The Prismatic Platform integrates Shodan as a primary data source in the Perimeter module's [EASM](/glossary/easm/) asset discovery pipeline. When performing external attack surface management, the platform queries Shodan's API for exposed services, open ports, and banner data associated with target domains and IP ranges. The integration follows a multi-step process.

### Discovery Pipeline

1. **Discovery**: Query Shodan for all hosts matching target domains, IP ranges, and organization names
2. **Enrichment**: Extract software versions, TLS configurations, and vulnerability tags from banner data
3. **Correlation**: Cross-reference Shodan findings with [Censys](/glossary/censys/) and [GreyNoise](/glossary/greynoise/) data
4. **Scoring**: Feed validated findings into the [risk scoring](/glossary/risk-score/) engine
5. **Rating**: Aggregate scored findings into the organization's [security rating](/glossary/security-rating/)

Shodan findings feed into the platform's epistemic pipeline, where the [Signal Plurality](/glossary/signal-plurality/) axiom requires corroboration from at least one additional independent source before a finding can affect security ratings. A service detected by Shodan alone is flagged as "unconfirmed" until Censys or another source provides corroborating evidence.

```elixir
defmodule PrismaticPerimeter.Discovery.Pipeline do
  @moduledoc """
  Multi-source discovery pipeline for EASM asset enumeration.
  Enforces signal plurality by requiring findings from at least
  two independent sources before affecting security ratings.
  """

  @doc "Execute multi-source discovery for a target domain"
  @spec discover(String.t()) :: {:ok, list(map())} | {:error, term()}
  def discover(domain) do
    # Parallel queries to independent sources (Signal Plurality)
    tasks = [
      Task.async(fn -> PrismaticPerimeter.Sources.Shodan.domain_search(domain) end),
      Task.async(fn -> PrismaticPerimeter.Sources.Censys.domain_search(domain) end),
      Task.async(fn -> PrismaticPerimeter.Sources.GreyNoise.context_lookup(domain) end)
    ]

    [shodan_result, censys_result, greynoise_result] =
      Task.await_many(tasks, 30_000)

    # Correlate findings across sources
    correlated = correlate_findings(shodan_result, censys_result, greynoise_result)

    # Score only findings with multi-source confirmation
    scored = Enum.map(correlated, &score_finding/1)

    {:ok, scored}
  end

  defp correlate_findings({:ok, shodan}, {:ok, censys}, {:ok, greynoise}) do
    shodan_ips = MapSet.new(shodan, & &1.ip)
    censys_ips = MapSet.new(censys, & &1.ip)

    # Findings confirmed by multiple sources
    confirmed = MapSet.intersection(shodan_ips, censys_ips)

    Enum.map(shodan, fn finding ->
      confidence = if MapSet.member?(confirmed, finding.ip), do: :confirmed, else: :unconfirmed
      noise_context = Enum.find(greynoise, &(&1.ip == finding.ip))

      Map.merge(finding, %{
        confirmation_status: confidence,
        noise_classification: noise_context && noise_context.classification,
        source_count: count_sources(finding.ip, shodan_ips, censys_ips)
      })
    end)
  end
end
```

### Rate Limiting and Circuit Breaker

The Prismatic Platform implements sophisticated rate limiting for Shodan API calls, combining token bucket rate limiting with [circuit breaker](/glossary/circuit-breaker/) patterns to handle API failures gracefully.

```elixir
defmodule PrismaticPerimeter.Sources.Shodan.RateLimiter do
  @moduledoc """
  Token bucket rate limiter calibrated to the organization's Shodan
  API tier. Prevents credit exhaustion and respects provider quotas.
  """

  use GenServer

  @spec acquire_token() :: :ok | {:error, :rate_limited}
  def acquire_token do
    GenServer.call(__MODULE__, :acquire)
  end

  @impl true
  def handle_call(:acquire, _from, %{tokens: 0} = state) do
    {:reply, {:error, :rate_limited}, state}
  end

  def handle_call(:acquire, _from, %{tokens: tokens} = state) when tokens > 0 do
    {:reply, :ok, %{state | tokens: tokens - 1}}
  end

  @impl true
  def handle_info(:refill, state) do
    new_tokens = min(state.tokens + state.refill_rate, state.max_tokens)
    Process.send_after(self(), :refill, state.refill_interval)
    {:noreply, %{state | tokens: new_tokens}}
  end
end
```

## API Tiers and Rate Limits

Shodan offers multiple API access tiers with different capabilities and rate limits.

| Tier | Monthly Credits | Scan Credits | Results/Query | Features |
|------|----------------|-------------|---------------|----------|
| **Free** | 0 | 0 | 0 (search only) | Basic search, no API |
| **Membership** | 100 | 100 | 100 | API access, basic filters |
| **Small Business** | 65,536 | 65,536 | Unlimited | Network monitoring, alerts |
| **Corporate** | 327,680 | 327,680 | Unlimited | Vulnerability detection, full API |
| **Enterprise** | Custom | Custom | Unlimited | Dedicated scanning, SLA |

The Prismatic Platform's rate limiter configuration automatically adjusts to the organization's Shodan tier, ensuring optimal API utilization without credit exhaustion.

## Ethical and Legal Considerations

| Consideration | Description | Prismatic Approach |
|--------------|-------------|-------------------|
| **Authorization** | Scanning others' infrastructure may have legal implications | Query only for authorized targets |
| **Data sensitivity** | Shodan results may reveal sensitive infrastructure details | [Encryption at rest](/glossary/encryption-at-rest/) for all stored results |
| **Responsible disclosure** | Discovered vulnerabilities should be reported | Integrated finding notification workflow |
| **Terms of service** | Shodan ToS restricts certain automated usage patterns | Rate limiting and ToS-compliant queries |
| **Data retention** | Historical data may contain outdated findings | Timestamp-based [time decay](/glossary/time-decay/) scoring |
| **GDPR compliance** | IP addresses may constitute personal data under GDPR | [GDPR](/glossary/gdpr/)-compliant data handling and retention |

The Prismatic Platform enforces strict authorization checks before any Shodan queries are executed. The platform's color team security architecture, particularly the [Blue Team](/glossary/blue-team/) defensive posture agents, continuously monitors that OSINT collection operates within authorized boundaries. Any query targeting infrastructure outside the authorized scope triggers an immediate alert and blocks execution.

## Comparison with Alternatives

| Feature | Shodan | [Censys](/glossary/censys/) | [GreyNoise](/glossary/greynoise/) | BinaryEdge | ZoomEye |
|---------|--------|--------|-----------|------------|---------|
| **Primary focus** | Service/device discovery | Certificate/host scanning | Noise classification | Threat intelligence | Cyberspace mapping |
| **Scan methodology** | Proprietary crawlers | ZMap-based | Passive sensors | Proprietary | Proprietary |
| **Certificate data** | Basic | Deep (CT integration) | Minimal | Moderate | Moderate |
| **Historical data** | Yes (paid) | Yes (paid) | Limited | Yes | Yes |
| **ICS/SCADA coverage** | Extensive | Moderate | Limited | Moderate | Good |
| **API ergonomics** | Good | Good | Excellent | Good | Moderate |
| **Prismatic role** | Primary discovery | Certificate corroboration | Noise filtering | Not integrated | Not integrated |
| **IPv6 support** | Growing | Strong | Limited | Growing | Growing |
| **Screenshot capability** | Yes | Yes | No | No | Yes |

## Monitoring and Alerting

Shodan Monitor provides continuous surveillance of specified network ranges. The Prismatic Platform integrates Shodan Monitor alerts into the [EASM](/glossary/easm/) continuous monitoring pipeline, triggering automated reassessment when changes are detected on monitored assets.

| Alert Type | Trigger | Prismatic Response |
|-----------|---------|-------------------|
| **New service** | Previously unseen port/service | Queue for discovery pipeline |
| **SSL expiry** | Certificate approaching expiration | Generate compliance alert |
| **Vulnerability** | New CVE matched to service | Trigger rating recalculation |
| **Configuration change** | Banner content change detected | Re-enrich and re-score |

## Best Practices

1. **Combine with multiple sources**: Never rely on Shodan alone for security assessments. The [Signal Plurality](/glossary/signal-plurality/) axiom requires corroboration from independent sources like Censys and GreyNoise.

2. **Implement proper rate limiting**: Respect Shodan's API quotas to maintain reliable access. Use token bucket algorithms calibrated to your subscription tier.

3. **Cache results aggressively**: Shodan data changes slowly (hours to days between scans). Caching results for 1-4 hours reduces API calls without significantly impacting accuracy.

4. **Filter noise with GreyNoise**: Cross-reference Shodan findings with [GreyNoise](/glossary/greynoise/) to distinguish between genuinely exposed services and internet background noise.

5. **Monitor continuously**: Use Shodan Monitor or periodic queries to detect changes in your external attack surface rather than relying on point-in-time snapshots.

6. **Respect legal boundaries**: Only query Shodan for infrastructure you are authorized to assess. Store results with appropriate access controls and retention policies.

## Related Terms

- [EASM](/glossary/easm/) -- Attack surface management consuming Shodan data as primary source
- [Censys](/glossary/censys/) -- Complementary internet scan data source for corroboration
- [GreyNoise](/glossary/greynoise/) -- Internet noise analysis complementing Shodan findings
- [Attack Surface](/glossary/attack-surface/) -- The externally visible infrastructure Shodan discovers
- [Signal Plurality](/glossary/signal-plurality/) -- Axiom requiring Shodan data corroboration
- [Risk Score](/glossary/risk-score/) -- A-F grades informed by Shodan findings
- [Security Rating](/glossary/security-rating/) -- Organization-level rating fed by Shodan evidence
- [Rate Limiting](/glossary/rate-limiting/) -- API quota management for Shodan integration
- [TLS](/glossary/tls/) -- Certificate and cipher analysis from Shodan banner data
- [Encryption at Rest](/glossary/encryption-at-rest/) -- Protection of stored Shodan reconnaissance data
- [Circuit Breaker](/glossary/circuit-breaker/) -- Resilience pattern for Shodan API calls

## See Also

- [Architecture](/architecture/) -- EASM data source architecture
- [Apps](/apps/) -- Prismatic Perimeter application
- [OSINT](/osint/) -- Open-source intelligence collection methodology

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
