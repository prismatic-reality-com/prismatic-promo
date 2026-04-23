+++
title = "Censys"
weight = 9
[extra]
category = "security"
description = "Internet-wide scan data platform providing comprehensive visibility into hosts, certificates, and services across the public internet."
related_terms = ["shodan", "easm", "signal-plurality", "attack-surface", "greynoise", "tls", "risk-score"]
tier = "TIER 1"
domain = "Security Intelligence"
platform_integration = "Prismatic Perimeter"
maturity = "Production"
complexity = "Advanced"
audience = ["security-engineers", "threat-analysts", "osint-practitioners"]
key_benefits = ["certificate-transparency", "internet-wide-scanning", "tls-assessment", "subdomain-enumeration"]
prerequisites = ["attack-surface", "tls", "easm"]
api_version = "v2"
scan_engine = "ZMap + ZGrab2"
data_model = "Hosts, Services, Certificates"
founded = "2013"
origin = "University of Michigan"
authentication = "API ID + Secret (HTTP Basic)"
prismatic_module = "PrismaticPerimeter.Sources.Censys"
query_language = "Censys Search Language"
refresh_rate = "Regular full-internet scans"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1769
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Censys", "Internet-wide", "glossary", "security", "Prismatic Platform", "ZMap"]
tags = ["glossary", "security", "censys", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Censys - Prismatic Platform"
+++

## Definition

Censys is a security intelligence platform that performs continuous internet-wide scans, cataloging hosts, services, certificates, and software across the public internet. Founded in 2013 by Zakir Durumeric, David Adrian, and J. Alex Halderman at the University of Michigan, Censys emerged from academic research on internet-wide network scanning and built upon the ZMap scanner -- a tool capable of scanning the entire IPv4 address space in under 45 minutes. This academic pedigree distinguishes Censys from commercial-first alternatives, bringing rigorous methodology and reproducible scanning practices to the security intelligence domain.

Censys differentiates itself through its deep focus on TLS/SSL certificate transparency, its structured and strongly-typed data model, and its comprehensive coverage of the X.509 certificate ecosystem. While [Shodan](@/glossary/shodan.md) excels at service and device discovery through banner grabbing, Censys provides superior visibility into the certificate landscape -- tracking certificate issuance, expiration, chain validity, and compliance with certificate transparency (CT) requirements. This complementary focus makes Censys an essential corroborating data source for multi-signal security assessments.

The platform offers both a web interface for interactive exploration and a RESTful API for programmatic integration. Censys continuously refreshes its dataset through regular full-internet scans, maintaining a historical record of how the internet's infrastructure evolves over time. This longitudinal data enables trend analysis, tracking how an organization's [attack surface](@/glossary/attack-surface.md) changes across weeks, months, and years.

## Scanning Methodology

Censys's scanning infrastructure is built on ZMap and ZGrab, providing a two-phase approach to internet-wide data collection:

| Phase | Tool | Purpose | Performance |
|-------|------|---------|-------------|
| **Host Discovery** | ZMap | SYN scan across all IPv4 on target ports | Full IPv4 in < 45 minutes |
| **Service Probing** | ZGrab2 | Application-layer handshake and data collection | Protocol-specific deep inspection |
| **Certificate Collection** | CT Log Monitors | Certificate Transparency log aggregation | Continuous, near-real-time |
| **Data Enrichment** | Censys Pipeline | ASN, geolocation, WHOIS, reverse DNS | Automated post-processing |

The two-phase approach first identifies live hosts through rapid TCP SYN scanning (ZMap), then performs detailed application-layer probes (ZGrab2) to collect service banners, TLS certificates, HTTP headers, and protocol-specific metadata. This separation allows Censys to scan efficiently without sacrificing depth of inspection.

```
ZMap (SYN scan)  -->  Responsive IPs  -->  ZGrab2 (service probes)
                                                  |
                                         +--------+--------+
                                         |        |        |
                                       HTTP     TLS    Protocol-
                                      Headers   Certs   Specific
                                                  |
                                         CT Log Integration
                                                  |
                                         Censys Search Index
```

### ZMap Architecture

ZMap achieves its remarkable scanning speed through several design choices that differ fundamentally from traditional port scanners like Nmap. Rather than maintaining a state table of outstanding connections (which would consume gigabytes of memory at internet scale), ZMap uses a stateless scanning approach based on cyclic multiplicative groups. Each probe packet encodes its identity in the IP ID and TCP sequence number fields, allowing ZMap to correlate responses without maintaining per-connection state. This mathematical approach means ZMap's memory usage is constant regardless of the number of hosts being scanned.

The scanning pipeline operates in three concurrent stages: a packet generation stage that iterates through the IP address space in a pseudo-random order (ensuring even distribution across networks), a raw packet transmission stage that sends SYN packets at line rate, and a response collection stage that processes SYN-ACK responses. The pseudo-random iteration order is critical for avoiding concentrating scan traffic on any single network, which would trigger rate limiting or IDS alerts.

### ZGrab2 Service Probing

ZGrab2 extends ZMap's host discovery with application-layer protocol analysis. For each responsive host, ZGrab2 initiates full protocol handshakes to extract detailed service information:

| Protocol | Data Collected | Security Relevance |
|----------|---------------|-------------------|
| **HTTPS** | TLS version, cipher suites, certificate chain, HTTP headers | Encryption strength, certificate validity |
| **HTTP** | Response headers, server software, redirect chains | Software versions, misconfiguration |
| **SSH** | Key exchange algorithms, host key fingerprint | Weak algorithms, key reuse |
| **SMTP** | Banner, STARTTLS support, authentication methods | Email security posture |
| **FTP** | Banner, anonymous access, TLS support | Sensitive file exposure |
| **DNS** | Recursive resolution, zone transfer, DNSSEC | DNS infrastructure assessment |
| **RDP** | Security negotiation, NLA support | Remote access exposure |

## Data Model

Censys provides a well-structured data model organized around three primary entities:

| Entity | Description | Key Fields |
|--------|-------------|------------|
| **Hosts** | Individual IP addresses with all observed services | IP, ports, services, autonomous_system, location, operating_system |
| **Services** | Port-level service instances on a host | port, transport_protocol, service_name, banner, software, tls |
| **Certificates** | X.509 certificates observed in the wild | fingerprint, subject, issuer, validity, key_algorithm, ct_logs |

### Host Data Structure

```json
{
  "ip": "93.184.216.34",
  "services": [
    {
      "port": 443,
      "service_name": "HTTP",
      "transport_protocol": "TCP",
      "tls": {
        "version_selected": "TLSv1.3",
        "cipher_selected": "TLS_AES_256_GCM_SHA384",
        "certificates": {
          "leaf_fp_sha_256": "abc123...",
          "chain_fps_sha_256": ["def456...", "ghi789..."]
        }
      },
      "http": {
        "response": {
          "status_code": 200,
          "headers": {"server": "nginx/1.24.0"}
        }
      }
    }
  ],
  "autonomous_system": {
    "asn": 15133,
    "name": "EDGECAST",
    "bgp_prefix": "93.184.216.0/24"
  },
  "location": {
    "country_code": "US",
    "city": "Norwell"
  }
}
```

### Service Fingerprinting

Censys applies sophisticated service fingerprinting to identify the software running on each service, going beyond simple banner matching. The fingerprinting engine analyzes multiple signals including HTTP response headers (Server, X-Powered-By, X-AspNet-Version), TLS implementation quirks (cipher suite ordering, extension support), protocol-specific behaviors (SSH key exchange algorithm preferences), and JARM fingerprints (active TLS server fingerprinting). This multi-signal approach achieves higher accuracy than any single identification method.

## Certificate Transparency Integration

Censys has one of the most comprehensive Certificate Transparency (CT) datasets, aggregating certificates from all major CT logs. This is critical for security monitoring:

| CT Capability | Description | Security Value |
|--------------|-------------|----------------|
| **Certificate inventory** | All certificates issued for a domain | Detect unauthorized certificate issuance |
| **Pre-certificate monitoring** | Certificates logged before issuance | Early warning of suspicious certificate requests |
| **Issuer analysis** | Track which CAs issue certificates for a domain | Detect CA compromise or policy violations |
| **Expiration tracking** | Monitor certificate lifetimes | Prevent service outages from expired certificates |
| **SAN enumeration** | Extract Subject Alternative Names | Discover subdomains and related infrastructure |
| **Historical certificates** | Archived expired and revoked certificates | Investigate past infrastructure configurations |

Certificate transparency data is particularly valuable for [EASM](@/glossary/easm.md) because it reveals infrastructure that may not be discoverable through port scanning alone. A certificate issued for `internal-staging.example.com` reveals the existence of that subdomain even if the server is not currently accessible.

### CT Log Processing Pipeline

Censys monitors all major Certificate Transparency logs in near-real-time, processing millions of certificates daily. The CT pipeline performs several enrichment steps on each certificate: extracting all Subject Alternative Names (SANs) to build a comprehensive domain-to-certificate mapping, computing certificate chain validity by walking the issuer chain to known root certificates, detecting wildcard certificates that may cover undiscovered subdomains, and identifying certificates with unusually long validity periods that may indicate misconfiguration or policy violations.

## API Integration

Censys provides a RESTful Search API (v2) for programmatic access to its dataset:

```elixir
# Censys API client for Prismatic EASM
defmodule PrismaticPerimeter.Sources.Censys do
  @moduledoc "Censys Search API v2 integration for attack surface discovery."

  @base_url "https://search.censys.io/api/v2"

  @type host_result :: %{
    ip: String.t(),
    services: [service()],
    autonomous_system: map(),
    location: map(),
    last_updated: DateTime.t()
  }

  @doc "Search Censys hosts index"
  @spec search_hosts(String.t(), keyword()) :: {:ok, [host_result()]} | {:error, term()}
  def search_hosts(query, opts \\ []) do
    params = %{
      q: query,
      per_page: Keyword.get(opts, :per_page, 50),
      cursor: Keyword.get(opts, :cursor, nil)
    }

    case authenticated_request(:get, "/hosts/search", params) do
      {:ok, %{status: 200, body: body}} ->
        {:ok, parse_host_results(body["result"]["hits"])}

      {:ok, %{status: 429}} ->
        {:error, :rate_limited}

      {:ok, %{status: status, body: body}} ->
        {:error, {:api_error, status, body}}

      {:error, reason} ->
        {:error, {:connection_error, reason}}
    end
  end

  @doc "Search for certificates matching a domain"
  @spec search_certificates(String.t()) :: {:ok, [map()]} | {:error, term()}
  def search_certificates(domain) do
    query = "parsed.names: #{domain}"

    case authenticated_request(:get, "/certificates/search", %{q: query}) do
      {:ok, %{status: 200, body: body}} ->
        {:ok, body["result"]["hits"]}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc "Search for hosts associated with a domain"
  @spec domain_search(String.t()) :: {:ok, [host_result()]} | {:error, term()}
  def domain_search(domain) do
    search_hosts("services.tls.certificates.leaf_data.names: #{domain}")
  end

  @doc "Aggregate host data by autonomous system for a given domain"
  @spec aggregate_by_asn(String.t()) :: {:ok, [map()]} | {:error, term()}
  def aggregate_by_asn(domain) do
    params = %{
      q: "services.tls.certificates.leaf_data.names: #{domain}",
      field: "autonomous_system.asn",
      num_buckets: 50
    }

    case authenticated_request(:get, "/hosts/aggregate", params) do
      {:ok, %{status: 200, body: body}} ->
        {:ok, body["result"]["buckets"]}

      {:ok, %{status: status, body: body}} ->
        {:error, {:api_error, status, body}}

      {:error, reason} ->
        {:error, {:connection_error, reason}}
    end
  end

  defp authenticated_request(method, path, params) do
    headers = [
      {"Authorization", "Basic #{Base.encode64("#{api_id()}:#{api_secret()}")}"},
      {"Accept", "application/json"}
    ]

    HTTPClient.request(method, "#{@base_url}#{path}", headers: headers, params: params)
  end

  defp api_id, do: Application.get_env(:prismatic_perimeter, :censys_api_id)
  defp api_secret, do: Application.get_env(:prismatic_perimeter, :censys_api_secret)
end
```

## Censys Search Language

Censys provides a structured query language for searching its dataset. Unlike Shodan's simple key:value filter syntax, the Censys Search Language supports boolean operators, nested field access, wildcards, and range queries:

| Query Type | Syntax | Example |
|-----------|--------|---------|
| **Exact match** | `field: "value"` | `services.http.response.headers.server: "nginx"` |
| **Boolean AND** | `field1: val1 AND field2: val2` | `location.country_code: "CZ" AND services.port: 443` |
| **Boolean OR** | `field1: val1 OR field2: val2` | `services.port: 80 OR services.port: 443` |
| **Negation** | `NOT field: value` | `NOT services.tls.certificates.leaf_data.issuer.organization: "Let's Encrypt"` |
| **Wildcard** | `field: value*` | `services.tls.certificates.leaf_data.names: *.example.com` |
| **Range** | `field: [min TO max]` | `services.port: [8000 TO 9000]` |
| **Existence** | `field: *` | `services.ssh: *` (hosts with SSH) |

```elixir
defmodule PrismaticPerimeter.Sources.Censys.QueryBuilder do
  @moduledoc "Type-safe query builder for Censys Search Language."

  @type query :: String.t()

  @spec for_domain(String.t()) :: query()
  def for_domain(domain) do
    "services.tls.certificates.leaf_data.names: #{domain}"
  end

  @spec for_organization(String.t()) :: query()
  def for_organization(org) do
    "services.tls.certificates.leaf_data.subject.organization: \"#{org}\""
  end

  @spec with_port(query(), integer()) :: query()
  def with_port(base_query, port) do
    "#{base_query} AND services.port: #{port}"
  end

  @spec in_country(query(), String.t()) :: query()
  def in_country(base_query, country_code) do
    "#{base_query} AND location.country_code: \"#{country_code}\""
  end

  @spec excluding_cdn(query()) :: query()
  def excluding_cdn(base_query) do
    cdn_asns = ["AS13335", "AS20940", "AS16509"]
    exclusions = Enum.map_join(cdn_asns, " AND ", fn asn ->
      "NOT autonomous_system.asn: #{String.trim_leading(asn, "AS")}"
    end)
    "#{base_query} AND #{exclusions}"
  end
end
```

## Context in Prismatic

Censys serves as a complementary data source alongside [Shodan](@/glossary/shodan.md) in the Prismatic Perimeter module. The platform queries Censys for certificate data, host services, and autonomous system information during [attack surface](@/glossary/attack-surface.md) discovery. As required by the [Signal Plurality](@/glossary/signal-plurality.md) axiom, Censys findings corroborate or contradict Shodan data, providing the independent second signal needed for confident security assessments.

The integration leverages Censys's specific strengths in the multi-source discovery pipeline:

| Use Case | Censys Advantage | Pipeline Role |
|----------|-----------------|---------------|
| **Certificate discovery** | Deep CT integration, comprehensive cert database | Primary source for certificate-based asset discovery |
| **TLS assessment** | Detailed cipher suite and protocol analysis | Corroboration of Shodan TLS findings |
| **Subdomain enumeration** | SAN field extraction from certificates | Complementary to DNS-based enumeration |
| **Historical analysis** | Longitudinal data on host changes | [Time decay](@/glossary/time-decay.md) calibration |
| **ASN mapping** | Accurate autonomous system attribution | Organization boundary definition |

When Shodan and Censys agree on a finding (e.g., both detect an expired TLS certificate on the same host), the finding receives a high confidence score. When they disagree, the platform preserves both signals per the [Contradiction Preservation](@/glossary/contradiction-preservation.md) axiom and flags the finding for analyst review.

## Multi-Source Correlation Pipeline

The Prismatic Platform uses Censys data as part of a multi-source correlation pipeline that synthesizes findings from multiple OSINT providers:

```elixir
defmodule PrismaticPerimeter.CorrelationPipeline do
  @moduledoc "Multi-source OSINT correlation integrating Censys with other providers."

  @spec correlate_findings(String.t()) :: {:ok, map()} | {:error, term()}
  def correlate_findings(domain) do
    # Execute all source queries in parallel
    tasks = %{
      censys: Task.async(fn -> PrismaticPerimeter.Sources.Censys.domain_search(domain) end),
      shodan: Task.async(fn -> PrismaticPerimeter.Sources.Shodan.domain_search(domain) end),
      greynoise: Task.async(fn -> PrismaticPerimeter.Sources.GreyNoise.ip_context(domain) end)
    }

    results = Map.new(tasks, fn {source, task} ->
      {source, Task.await(task, 30_000)}
    end)

    with {:ok, censys_data} <- results.censys,
         {:ok, shodan_data} <- results.shodan do
      correlated = merge_and_score(censys_data, shodan_data, results.greynoise)
      {:ok, correlated}
    end
  end

  defp merge_and_score(censys_hosts, shodan_hosts, greynoise_result) do
    # Group by IP for cross-source comparison
    censys_by_ip = Map.new(censys_hosts, &{&1.ip, &1})
    shodan_by_ip = Map.new(shodan_hosts, &{&1.ip, &1})

    all_ips = MapSet.union(
      MapSet.new(Map.keys(censys_by_ip)),
      MapSet.new(Map.keys(shodan_by_ip))
    )

    Enum.map(all_ips, fn ip ->
      censys_entry = Map.get(censys_by_ip, ip)
      shodan_entry = Map.get(shodan_by_ip, ip)

      %{
        ip: ip,
        sources: compute_sources(censys_entry, shodan_entry),
        confidence: compute_confidence(censys_entry, shodan_entry),
        services: merge_services(censys_entry, shodan_entry),
        noise_classification: classify_noise(ip, greynoise_result)
      }
    end)
  end
end
```

## Censys vs. Shodan Comparison

| Dimension | Censys | [Shodan](@/glossary/shodan.md) |
|-----------|--------|--------|
| **Origin** | Academic (University of Michigan) | Independent (John Matherly) |
| **Scan engine** | ZMap + ZGrab2 (open source) | Proprietary crawlers |
| **Certificate data** | Deep (CT log integration, full chain analysis) | Basic (certificate extraction only) |
| **ICS/SCADA** | Moderate coverage | Extensive (Modbus, S7, BACnet, EtherNet/IP) |
| **Data freshness** | Regular full-internet scans | Continuous crawling |
| **Query language** | Censys Search Language (structured) | Filter-based (key:value) |
| **Authentication** | API ID + Secret (HTTP Basic) | API key |
| **Historical data** | Yes (paid tiers) | Yes (paid tiers) |
| **Academic usage** | Free academic access program | Limited free tier |
| **Prismatic role** | Certificate corroboration, TLS assessment | Primary service/device discovery |
| **IPv6 support** | Growing coverage | Limited |
| **Aggregate queries** | Built-in aggregation API | Manual post-processing |

## API Tiers and Rate Limits

| Tier | Queries/Month | Results/Query | Features |
|------|--------------|---------------|----------|
| **Community** | 250 | 100 | Basic search, limited API |
| **Solo** | 25,000 | 1,000 | Full API, historical data |
| **Teams** | 250,000 | 10,000 | Team access, advanced analytics |
| **Enterprise** | Custom | Unlimited | Dedicated infrastructure, SLA |

The Prismatic Platform implements [rate limiting](@/glossary/rate-limiting.md) for Censys API calls using a sliding window algorithm calibrated to the subscription tier. Failed requests due to rate limiting are automatically retried with exponential backoff.

```elixir
defmodule PrismaticPerimeter.Sources.Censys.RateLimiter do
  @moduledoc "Sliding window rate limiter for Censys API integration."

  use GenServer

  @type state :: %{
    window_ms: non_neg_integer(),
    max_requests: non_neg_integer(),
    requests: :queue.queue(integer())
  }

  @spec request_allowed?() :: boolean()
  def request_allowed? do
    GenServer.call(__MODULE__, :check_rate)
  end

  @spec record_request() :: :ok
  def record_request do
    GenServer.cast(__MODULE__, :record)
  end

  @impl true
  def handle_call(:check_rate, _from, state) do
    now = System.monotonic_time(:millisecond)
    cleaned = prune_old_requests(state.requests, now - state.window_ms)
    allowed = :queue.len(cleaned) < state.max_requests
    {:reply, allowed, %{state | requests: cleaned}}
  end

  @impl true
  def handle_cast(:record, state) do
    now = System.monotonic_time(:millisecond)
    {:noreply, %{state | requests: :queue.in(now, state.requests)}}
  end
end
```

## Security Considerations

When integrating Censys data into security assessments, several considerations apply:

| Consideration | Description | Mitigation |
|--------------|-------------|------------|
| **Data staleness** | Scan data may be hours or days old | Cross-reference with active probing |
| **Incomplete coverage** | Not all ports/protocols scanned every cycle | Supplement with Shodan and active scanning |
| **False positives** | Service identification may be inaccurate | Validate findings with direct connection |
| **IPv6 gaps** | IPv6 coverage is growing but incomplete | Combine with DNS-based IPv6 enumeration |
| **CDN masking** | CDN IPs may not reflect origin infrastructure | Use certificate SANs to identify origins |
| **Geolocation accuracy** | IP geolocation is approximate | Use ASN data for organizational attribution |

## Best Practices for Censys Integration

When building integrations with the Censys API, the following practices ensure reliable and efficient operation within the Prismatic Platform:

1. **Prefer certificate-based discovery over host scanning** -- Censys's CT log integration provides the most unique value compared to other OSINT sources. Use Censys primarily for certificate intelligence and leverage [Shodan](@/glossary/shodan.md) for service discovery.

2. **Use aggregate queries for broad analysis** -- The aggregation API provides statistical summaries without consuming per-result quota. Use aggregates to understand the distribution of services, ASNs, or software versions before drilling into individual hosts.

3. **Cache responses with TTL matching scan frequency** -- Censys data refreshes on a schedule (not continuously). Caching responses for 6-12 hours avoids redundant API calls without missing significant changes.

4. **Implement circuit breakers for API failures** -- Network issues and rate limiting can cause cascade failures in the discovery pipeline. Use circuit breaker patterns to gracefully degrade when Censys is unavailable.

5. **Always validate confidence with [Signal Plurality](@/glossary/signal-plurality.md)** -- Never rely on Censys alone for security assertions. Every finding must be corroborated by at least one independent source.

## Related Terms

- [Shodan](@/glossary/shodan.md) - Complementary internet scanning platform for service discovery
- [EASM](@/glossary/easm.md) - Attack surface management consuming Censys data
- [Signal Plurality](@/glossary/signal-plurality.md) - Axiom requiring Censys as corroborating source
- [Attack Surface](@/glossary/attack-surface.md) - External infrastructure Censys helps discover
- [GreyNoise](@/glossary/greynoise.md) - Noise classification complementing Censys findings
- [TLS](@/glossary/tls.md) - Certificate and protocol analysis from Censys scans
- [Risk Score](@/glossary/risk-score.md) - Ratings informed by Censys-validated findings
- [Rate Limiting](@/glossary/rate-limiting.md) - API quota management for Censys integration
- [Time Decay](@/glossary/time-decay.md) - Historical Censys data calibrated for recency
- [Contradiction Preservation](@/glossary/contradiction-preservation.md) - Handling Shodan/Censys disagreements
- [Knowledge Graph](@/glossary/knowledge-graph.md) - Graph database storing correlated Censys findings
- [Entity Resolution](@/glossary/entity-resolution.md) - Linking Censys host data to organizational entities

## See Also

- [Architecture](@/architecture/_index.md) - EASM data source architecture
- [Apps](@/apps/_index.md) - Prismatic Perimeter application
- [OSINT](@/osint/_index.md) - Open-source intelligence collection methodology

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
