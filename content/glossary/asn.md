+++
title = "ASN"
weight = 50
[extra]
description = "Autonomous System Number -- a unique identifier assigned to a network or collection of networks under a single administrative domain, essential for BGP routing and OSINT network intelligence"
category = "osint"
related_terms = ["advisory", "correlation", "aggregation", "anomaly-detection", "credential", "containment"]
tags = ["glossary", "asn", "network", "bgp", "routing", "osint", "infrastructure", "internet", "beam"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
difficulty = "intermediate"
quality_score = 85
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "ASN identification enables network-level OSINT intelligence, mapping IP addresses to organizations and revealing infrastructure relationships in the Prismatic Platform's Perimeter and OSINT systems"
date_created = "2026-02-24"
date_modified = "2026-02-24"
keywords = ["ASN", "Autonomous System Number", "BGP", "network intelligence", "IP attribution", "routing", "OSINT network", "infrastructure mapping", "AS lookup", "peering"]
image = "/images/sections/glossary.png"
image_alt = "ASN - Prismatic Platform"
word_count = 950
see_also = ["capabilities", "architecture", "agents"]
+++

## Definition

An Autonomous System Number (ASN) is a globally unique identifier assigned by Regional Internet Registries (RIRs) to a network or group of networks that operates under a single administrative policy. ASNs are fundamental to Border Gateway Protocol (BGP) routing, which governs how traffic flows between networks on the internet. In OSINT and cybersecurity, ASN data provides critical intelligence: mapping IP addresses to their owning organizations, identifying hosting infrastructure, detecting network relationships, and attributing malicious activity to specific network operators.

In the Prismatic Platform, ASN lookup and analysis is integrated into the OSINT toolbox and Perimeter EASM system for infrastructure discovery, attribution, and attack surface mapping.

## Technical Deep Dive

### ASN Structure

| Format | Range | Description |
|--------|-------|-------------|
| **2-byte ASN** | 1 - 65534 | Original format, mostly exhausted |
| **4-byte ASN** | 65536 - 4294967294 | Extended format (ASN.1 notation: X.Y) |
| **Private ASN** | 64512 - 65534, 4200000000 - 4294967294 | Internal use only |
| **Reserved** | 0, 65535 | Protocol use |

### ASN Intelligence Value

| Intelligence Use | Description | Platform Integration |
|-----------------|-------------|---------------------|
| **IP Attribution** | Map IP → Organization | Perimeter asset discovery |
| **Infrastructure Mapping** | Identify hosting providers | OSINT tool enrichment |
| **Peering Analysis** | Network relationship graph | DD entity enrichment |
| **Threat Attribution** | Link attacks to networks | Blue Team defense |
| **Geolocation** | Country/region of network | Compliance assessment |

### Data Sources

| Source | Type | Coverage |
|--------|------|----------|
| **RIPE NCC** | RIR (Europe, Middle East) | Full EMEA |
| **ARIN** | RIR (North America) | Full NA |
| **APNIC** | RIR (Asia Pacific) | Full APAC |
| **Team Cymru** | IP-to-ASN mapping | Global |
| **BGPStream** | Real-time BGP data | Global |

## Architecture and Implementation

```elixir
defmodule PrismaticOsintCore.ASNLookup do
  @moduledoc """
  ASN lookup and enrichment for OSINT intelligence gathering.
  Resolves IP addresses to ASN ownership data using multiple
  data sources with caching for performance.
  """

  @type asn_info :: %{
          asn: pos_integer(),
          name: String.t(),
          description: String.t(),
          country: String.t(),
          rir: String.t(),
          prefixes: [String.t()],
          peers: [pos_integer()]
        }

  @spec lookup_ip(String.t()) :: {:ok, asn_info()} | {:error, term()}
  def lookup_ip(ip_address) do
    case check_cache(ip_address) do
      {:ok, cached} -> {:ok, cached}
      {:error, :not_found} -> fetch_and_cache(ip_address)
    end
  end

  @spec lookup_asn(pos_integer()) :: {:ok, asn_info()} | {:error, term()}
  def lookup_asn(asn_number) do
    with {:ok, raw} <- query_rir(asn_number),
         info <- normalize_asn_data(raw) do
      cache_result(asn_number, info)
      {:ok, info}
    end
  end

  @spec get_prefixes(pos_integer()) :: {:ok, [String.t()]}
  def get_prefixes(asn_number) do
    case lookup_asn(asn_number) do
      {:ok, %{prefixes: prefixes}} -> {:ok, prefixes}
      error -> error
    end
  end

  @spec fetch_and_cache(String.t()) :: {:ok, asn_info()} | {:error, term()}
  defp fetch_and_cache(ip_address) do
    with {:ok, raw} <- query_team_cymru(ip_address),
         info <- normalize_asn_data(raw) do
      cache_result(ip_address, info)

      :telemetry.execute(
        [:prismatic, :osint, :asn, :lookup],
        %{count: 1},
        %{ip: ip_address, asn: info.asn}
      )

      {:ok, info}
    end
  end
end
```

## Usage in Prismatic Platform

- **Perimeter EASM**: ASN mapping for discovered assets to identify hosting infrastructure and network ownership
- **OSINT Toolbox**: ASN enrichment integrated into Shodan, Censys, and network analysis adapters
- **DD Pipeline**: Entity enrichment with network infrastructure ownership data
- **Blue Team Defense**: ASN-based traffic analysis for detecting anomalous network connections
- **Compliance Assessment**: Verifying data residency through ASN geolocation data

## Code Examples

### ASN-Based Asset Enrichment

```elixir
defmodule PrismaticPerimeter.ASNEnricher do
  @moduledoc """
  Enriches discovered assets with ASN ownership information
  for infrastructure attribution in the Perimeter EASM system.
  """

  alias PrismaticOsintCore.ASNLookup

  @spec enrich_assets([map()]) :: {:ok, [map()]}
  def enrich_assets(assets) do
    enriched = Enum.map(assets, fn asset ->
      case ASNLookup.lookup_ip(asset.ip_address) do
        {:ok, asn_info} ->
          Map.merge(asset, %{
            asn: asn_info.asn,
            asn_name: asn_info.name,
            asn_country: asn_info.country,
            hosting_provider: asn_info.description
          })
        {:error, _} -> asset
      end
    end)

    {:ok, enriched}
  end
end
```

## Best Practices

1. **Cache ASN lookups aggressively**: ASN-to-organization mappings change infrequently. Cache for 24-72 hours.
2. **Use multiple data sources**: Cross-reference RIR data with Team Cymru and BGPStream for accuracy.
3. **Track ASN changes over time**: ASN ownership changes can indicate infrastructure transfers relevant to intelligence.
4. **Handle private ASNs correctly**: Filter out private ASN ranges from analysis results.
5. **Monitor BGP announcements**: Real-time BGP monitoring detects route hijacking and prefix manipulation.

## Related Terms

- [Advisory](@/glossary/advisory.md) -- security advisories affecting specific ASN ranges
- **Correlation** -- relating ASN data across intelligence sources
- [Anomaly Detection](@/glossary/anomaly-detection.md) -- detecting anomalous BGP announcements
- **Containment** -- network-level containment by ASN

## See Also

- [RIPE NCC ASN Database](https://www.ripe.net/manage-ips-and-asns/) -- European RIR
- [Team Cymru IP-to-ASN](https://team-cymru.com/community-services/ip-asn-mapping/) -- global mapping service
- [OSINT Toolbox](@/osint/_index.md) -- platform intelligence gathering tools

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
