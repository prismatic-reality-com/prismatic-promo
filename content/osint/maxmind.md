+++
title = "MaxMind GeoIP"
weight = 63
[extra]
category = "global"
type = "ip"
module = "MaxMind"
description = "IP geolocation and risk scoring with GeoIP2 and minFraud databases"
has_api = true
url = "https://maxmind.com"
rate_limit = "Plan-dependent, database downloads available"
capabilities = ["IP Geolocation", "ASN Lookup", "Anonymous IP Detection", "Risk Scoring", "Connection Type", "Domain Resolution"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1410
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["MaxMind", "GeoIP", "GeoIP2", "osint", "global", "Prismatic Platform", "MMDB", "Weekly"]
tags = ["osint", "global", "maxmind-geoip", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "MaxMind GeoIP - Prismatic Platform"
+++

## Overview

MaxMind provides the industry-standard GeoIP databases for IP address geolocation, ASN identification, and anonymous network detection. The GeoIP2 databases map IP addresses to geographic locations, ISPs, organizations, and connection types. The minFraud service provides real-time fraud risk scoring. MaxMind data is used across the platform for enriching IP-based intelligence with location and network context.

Founded in 2002, MaxMind has built the most widely deployed IP intelligence databases in the industry. The GeoIP2 product line is used by hundreds of thousands of organizations for content personalization, advertising targeting, digital rights management, fraud prevention, and security analytics. For [OSINT](@/glossary/osint.md) analysts and cybersecurity professionals, MaxMind provides the foundational geolocation layer that transforms raw IP addresses into geographic and organizational intelligence.

MaxMind offers two deployment models: downloadable databases that are updated weekly (GeoIP2) or biweekly (GeoLite2), and a web service API for real-time lookups. The downloadable database model is particularly valuable for high-volume OSINT operations because it eliminates per-query API costs and latency, enabling millions of IP lookups per second on local infrastructure.

The accuracy of MaxMind geolocation varies by granularity. Country-level accuracy exceeds 99% for most regions. City-level accuracy ranges from 50% to 85% depending on the country and ISP -- higher in densely connected urban areas, lower in rural regions where IP blocks may be registered to ISP headquarters rather than actual subscriber locations.

## Data Sources and Coverage

MaxMind aggregates geolocation data from multiple sources and maintains proprietary algorithms for IP-to-location mapping.

| Data Source | Description | Update Frequency |
|-------------|-------------|-----------------|
| **Regional Internet Registries** | ARIN, RIPE, APNIC, AFRINIC, LACNIC allocation data | Daily |
| **ISP Network Data** | Direct partnerships with ISPs for subscriber location data | Ongoing |
| **User Submissions** | Crowd-sourced location corrections via MaxMind website | Continuous |
| **BGP Routing Tables** | ASN and network block ownership data | Daily |
| **Wi-Fi Positioning** | Wi-Fi access point geolocation databases | Periodic |
| **Proprietary Algorithms** | Machine learning models trained on known IP-location pairs | Continuous |
| **Government Registries** | National telecom regulator data | Varies by country |

### Database Products

| Database | Content | Format | Update | License |
|----------|---------|--------|--------|---------|
| **GeoIP2 Country** | Country, continent, registered country | MMDB | Weekly | Commercial |
| **GeoIP2 City** | Country, city, postal, coordinates, metro | MMDB | Weekly | Commercial |
| **GeoIP2 ISP** | ISP, organization, ASN | MMDB | Weekly | Commercial |
| **GeoIP2 Connection Type** | Connection type (broadband, cellular, etc.) | MMDB | Weekly | Commercial |
| **GeoIP2 Anonymous IP** | VPN, proxy, Tor, hosting, residential proxy | MMDB | Weekly | Commercial |
| **GeoIP2 Enterprise** | All above combined into single database | MMDB | Weekly | Commercial |
| **GeoLite2 Country** | Country-level (free, reduced accuracy) | MMDB | Biweekly | Free (CC BY-SA 4.0) |
| **GeoLite2 City** | City-level (free, reduced accuracy) | MMDB | Biweekly | Free (CC BY-SA 4.0) |
| **GeoLite2 ASN** | ASN data (free) | MMDB | Biweekly | Free (CC BY-SA 4.0) |

## API Integration

MaxMind provides both downloadable databases and a web service API. The Prismatic Platform uses the downloadable MMDB databases for high-performance local lookups.

### Web Service API Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/geoip/v2.1/country/{ip}` | GET | Country-level geolocation | JSON |
| `/geoip/v2.1/city/{ip}` | GET | City-level geolocation | JSON |
| `/geoip/v2.1/insights/{ip}` | GET | Full intelligence (all data points) | JSON |
| `/minfraud/v2.0/score` | POST | Fraud risk score | JSON |
| `/minfraud/v2.0/insights` | POST | Detailed fraud analysis | JSON |
| `/minfraud/v2.0/factors` | POST | Full risk factors breakdown | JSON |

### Rate Limits

| Plan | Queries/Day | Database Downloads | Price |
|------|-------------|-------------------|-------|
| GeoLite2 (Free) | 1,000 (web) | Unlimited MMDB | $0 |
| GeoIP2 Web (Starter) | 2,500 | N/A | $0.10/query |
| GeoIP2 Database | Unlimited (local) | Weekly updates | From $100/mo |
| GeoIP2 Enterprise | Unlimited (local) | Weekly updates | Custom |
| minFraud | Per-query pricing | N/A | From $0.005/query |

## Query Examples

### curl Examples

```bash
# GeoIP2 Web Service - City lookup
curl -u "ACCOUNT_ID:LICENSE_KEY" \
  "https://geoip.maxmind.com/geoip/v2.1/city/1.2.3.4"

# GeoIP2 Web Service - Insights (full data)
curl -u "ACCOUNT_ID:LICENSE_KEY" \
  "https://geoip.maxmind.com/geoip/v2.1/insights/1.2.3.4"

# minFraud Score request
curl -u "ACCOUNT_ID:LICENSE_KEY" \
  -X POST "https://minfraud.maxmind.com/minfraud/v2.0/score" \
  -H "Content-Type: application/json" \
  -d '{
    "device": {"ip_address": "1.2.3.4"},
    "email": {"address": "user@example.com"},
    "billing": {"country": "CZ"}
  }'

# Download GeoLite2 City database
curl -o GeoLite2-City.tar.gz \
  "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=YOUR_KEY&suffix=tar.gz"
```

### Elixir Integration

```elixir
# Geolocate IP address using local MMDB database
{:ok, location} = PrismaticOsint.MaxMind.geolocate("1.2.3.4")
# => %{
#   country: "CZ", country_name: "Czech Republic",
#   city: "Prague", city_name_cs: "Praha",
#   postal_code: "11000",
#   latitude: 50.0755, longitude: 14.4378,
#   accuracy_radius: 20, # km
#   continent: "EU", continent_name: "Europe",
#   time_zone: "Europe/Prague"
# }

# ASN lookup
{:ok, asn} = PrismaticOsint.MaxMind.asn("1.2.3.4")
# => %{asn: 47232, organization: "CZ.NIC, z.s.p.o.", network: "1.2.3.0/24"}

# Check for anonymous IP (VPN, proxy, Tor)
{:ok, anon} = PrismaticOsint.MaxMind.anonymous("1.2.3.4")
# => %{
#   is_anonymous: true,
#   is_anonymous_vpn: true,
#   is_hosting_provider: false,
#   is_public_proxy: false,
#   is_tor_exit_node: false,
#   is_residential_proxy: false
# }

# Connection type detection
{:ok, conn} = PrismaticOsint.MaxMind.connection_type("1.2.3.4")
# => %{connection_type: "Cable/DSL", isp: "Example ISP", organization: "Example Corp"}

# Batch geolocation for bulk IP analysis
ips = ["1.2.3.4", "5.6.7.8", "9.10.11.12"]
results = PrismaticOsint.MaxMind.batch_geolocate(ips)
# => [%{ip: "1.2.3.4", country: "CZ", city: "Prague"}, ...]

# Enterprise insights (combined all data)
{:ok, full} = PrismaticOsint.MaxMind.insights("1.2.3.4")
# => %{location: %{...}, asn: %{...}, anonymous: %{...}, connection: %{...}, risk: %{...}}

# minFraud risk assessment
{:ok, risk} = PrismaticOsint.MaxMind.minfraud_score(%{
  ip: "1.2.3.4",
  email: "user@example.com",
  billing_country: "CZ"
})
# => %{risk_score: 23.5, ip_risk: 15.2, disposition: "accept"}
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `country.iso_code` | string | ISO 3166-1 alpha-2 country code |
| `country.name` | string | Country name (localized) |
| `city.name` | string | City name (localized) |
| `postal.code` | string | Postal/ZIP code |
| `location.latitude` | float | Latitude (WGS84) |
| `location.longitude` | float | Longitude (WGS84) |
| `location.accuracy_radius` | integer | Accuracy radius in kilometers |
| `location.time_zone` | string | IANA time zone identifier |
| `continent.code` | string | Continent code (AF, AS, EU, NA, OC, SA) |
| `traits.isp` | string | Internet Service Provider name |
| `traits.organization` | string | Organization name associated with IP |
| `traits.autonomous_system_number` | integer | BGP ASN |
| `traits.autonomous_system_organization` | string | ASN organization name |
| `traits.connection_type` | enum | `Cable/DSL`, `Cellular`, `Corporate`, `Satellite` |
| `traits.user_type` | enum | `business`, `residential`, `government`, `military`, `school` |
| `traits.is_anonymous_proxy` | boolean | VPN or proxy detection |
| `traits.is_tor_exit_node` | boolean | Tor exit node detection |

## Use Cases

### Intelligence Enrichment

Every IP address encountered during an OSINT investigation benefits from geolocation context. MaxMind transforms raw IP addresses into actionable intelligence showing where infrastructure is physically located, which ISP provides connectivity, and whether the connection traverses anonymization networks. This enrichment is foundational -- virtually every other IP-based analysis depends on accurate geolocation.

### Threat Analysis

Geographic distribution patterns in attack traffic reveal adversary infrastructure. MaxMind data enables analysts to map attack sources by country, ISP, and ASN, identifying concentration patterns that may indicate coordinated campaigns or compromised networks. Anonymous IP detection distinguishes between direct attacks and traffic routed through VPNs, proxies, and Tor.

### Compliance and Jurisdiction

Determining the geographic jurisdiction for IP-based activities is essential for legal compliance. MaxMind data supports export control screening, data residency verification, and sanctions compliance by mapping IP addresses to countries. The accuracy is sufficient for regulatory purposes at the country level.

### Fraud Detection

The minFraud service combines IP geolocation with transaction data to assess fraud risk in real-time. By comparing the geographic location of the IP address with billing and shipping addresses, detecting anonymous networks, and assessing device characteristics, minFraud provides a risk score that supports automated fraud prevention.

### Network Topology Mapping

By correlating ASN data with geolocation, analysts map the physical topology of target networks. This reveals hosting provider choices, geographic distribution of infrastructure, and potential single points of failure that may be relevant to attack surface assessments.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **City-level accuracy 50-85%** | IP may be geolocated to ISP HQ rather than user location | Use accuracy_radius field; treat city as approximate |
| **Mobile IP blocks** | Cellular IPs often geolocate to carrier headquarters | Recognize cellular connection types and adjust expectations |
| **VPN/proxy bypass** | Users behind VPNs will geolocate to VPN server | Use Anonymous IP database to flag anonymized connections |
| **IPv6 coverage gaps** | IPv6 geolocation less accurate than IPv4 | Improving over time; supplement with other sources |
| **Database staleness** | Weekly updates may miss rapid IP reassignments | Use web service API for time-critical lookups |
| **Cloud provider IPs** | Cloud IPs geolocate to data center, not user | Identify cloud provider ASNs and handle separately |

## Legal and Ethical Considerations

**Data Licensing**: MaxMind databases are licensed products. GeoLite2 (free) requires account registration and compliance with the End User License Agreement. Commercial GeoIP2 databases have stricter licensing terms that prohibit redistribution.

**Accuracy Disclaimers**: MaxMind geolocation should not be used as the sole basis for legal jurisdiction determinations or physical location assertions. The stated accuracy ranges should be communicated to investigation consumers.

**Privacy Implications**: While IP geolocation does not directly identify individuals, it can reveal approximate physical locations. When combined with other OSINT data, geolocation contributes to identification of individuals, which triggers GDPR and other privacy regulation obligations.

**Attribution Caution**: Geographic location of an IP address does not prove the geographic location of the person using it. VPNs, proxies, Tor, and botnets all separate user location from IP location.

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), MaxMind provides the geolocation enrichment layer used by virtually all IP-based intelligence modules.

- **Local MMDB Deployment**: The platform maintains local copies of GeoIP2 databases (updated weekly via automated download) for zero-latency, unlimited-volume IP lookups.
- **Automatic Enrichment**: Every IP address ingested by the platform is automatically enriched with geolocation, ASN, and anonymous network detection.
- **Geographic Dashboards**: MaxMind data powers geographic visualizations in [Prismatic Perimeter](@/apps/prismatic-perimeter.md) showing attack surface distribution by country and region.
- **Anonymous Network Flagging**: VPN, proxy, and Tor detection feeds into the platform's [risk scoring](@/glossary/risk-score.md) system, with anonymous sources receiving elevated risk scores.
- **Cross-Source Validation**: MaxMind geolocation is cross-referenced with [IPInfo](@/osint/ipinfo.md) and [ONYPHE](@/osint/onyphe.md) data for confidence calibration.

## Best Practices

1. **Use local databases for bulk operations**: Download MMDB files for investigations requiring thousands of lookups. Web API is for low-volume, real-time needs.

2. **Respect accuracy radius**: Always consider the `accuracy_radius` field. A 200km radius means the actual location could be anywhere within that circle.

3. **Flag anonymous IPs**: Always check the Anonymous IP database alongside geolocation. VPN/proxy/Tor users will show misleading locations.

4. **Update regularly**: Set up automated weekly database downloads. IP allocations change frequently, and stale databases produce increasingly inaccurate results.

5. **Handle edge cases**: Reserved IP ranges (RFC 1918, RFC 6598), multicast addresses, and documentation ranges will return no results. Handle gracefully.

6. **Layer with ASN data**: ASN information often provides more reliable organizational attribution than geolocation. An IP belonging to AS13335 (Cloudflare) tells you more than its geolocation.

7. **Consider connection type**: Mobile IPs behave differently from broadband. Corporate IPs differ from residential. Connection type context improves analysis accuracy.

## Related Providers

- [IPInfo](@/osint/ipinfo.md) - IP geolocation and ASN data
- [Shodan](@/osint/shodan.md) - IP-level service discovery
- [AbuseIPDB](@/osint/abuseipdb.md) - IP reputation and abuse reports
- [GreyNoise](@/osint/greynoise.md) - Scanner identification
- [ONYPHE](@/osint/onyphe.md) - French cyber defense search engine
- [Censys](@/osint/censys.md) - Internet-wide scanning and host intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)