+++
title = "CIRCL"
weight = 56
[extra]
category = "global"
type = "threat"
module = "Circl"
description = "Luxembourg CERT - MISP, passive DNS, passive SSL, and threat sharing"
has_api = true
url = "https://circl.lu"
rate_limit = "API key required, community access available"
capabilities = ["Passive DNS", "Passive SSL", "MISP Integration", "Threat Sharing", "BGP Ranking", "Hash Lookup"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1706
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["CIRCL", "Luxembourg", "CERT", "MISP", "osint", "global", "Prismatic Platform"]
tags = ["osint", "global", "circl", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "CIRCL - Prismatic Platform"
+++

## Overview

CIRCL (Computer [Incident Response](/glossary/incident-response/) Center Luxembourg) is a government-driven initiative operated by SMILE GIE (Security Made In Luxembourg) that provides a comprehensive suite of open-source intelligence services widely used by the global security community. Founded in 2008, CIRCL has evolved from a national CERT focused on Luxembourg into a major contributor to the international threat intelligence ecosystem, developing and maintaining critical open-source security tools used by thousands of organizations worldwide.

CIRCL's infrastructure encompasses several interconnected services that form a powerful intelligence collection and analysis platform. The passive DNS database contains billions of historical DNS resolution records collected from strategically placed sensors, providing analysts with the ability to trace domain-to-IP relationships over time -- an essential capability for infrastructure attribution and threat hunting. The passive SSL database similarly captures SSL/TLS certificate observations, enabling identification of certificate reuse across threat actor infrastructure, detection of certificate changes that may indicate compromise, and historical analysis of encryption deployment patterns.

Perhaps CIRCL's most significant contribution to the security community is MISP (Malware Information Sharing Platform and Threat Sharing), an open-source [threat intelligence](/glossary/threat-intelligence/) platform that has become the de facto standard for structured threat intelligence sharing among organizations. MISP enables security teams to create, share, and consume threat intelligence events containing indicators of compromise (IOCs), threat actor profiles, vulnerability information, and tactical information in standardized formats (STIX, OpenIOC, MISP native format). Over 6,000 organizations worldwide operate MISP instances, forming a federated intelligence sharing network that dramatically amplifies each participant's detection capabilities.

CIRCL also operates specialized services including the hashlookup service for rapid malware identification, BGP Ranking for autonomous system reputation assessment, and the CVE search service for vulnerability intelligence. These services are available through well-documented APIs with generous access policies for the security research community, making CIRCL an essential resource for any organization building a multi-source threat intelligence capability.

## Data Sources and Coverage

### Passive DNS

CIRCL's passive DNS database is one of the largest publicly accessible passive DNS collections, built from strategically positioned DNS sensors that capture real-world resolution traffic. Unlike active DNS scanning (which queries authoritative nameservers directly), passive DNS captures the actual resolution patterns used by real clients, providing a more accurate picture of how domain infrastructure is used in practice.

| Metric | Coverage |
|--------|----------|
| **Total DNS Records** | 10+ billion unique records |
| **Daily New Records** | ~50 million |
| **Record Types** | A, AAAA, CNAME, MX, NS, SOA, TXT, SRV, PTR |
| **Data Retention** | 10+ years of historical data |
| **Sensor Network** | Multiple geographic locations |
| **Query Performance** | Sub-second response times |

### Passive SSL

The passive SSL service observes SSL/TLS certificates presented during network connections, building a historical database of certificate deployments across the internet.

| Metric | Coverage |
|--------|----------|
| **Total Certificates** | 500+ million unique certificates |
| **Daily Observations** | ~10 million new observations |
| **Certificate Fields** | Subject, Issuer, Serial, Fingerprint, SANs, Validity |
| **Historical Depth** | 8+ years |
| **Cross-Referencing** | IP-to-certificate and certificate-to-IP mapping |

### MISP Ecosystem

| Metric | Coverage |
|--------|----------|
| **Known MISP Instances** | 6,000+ worldwide |
| **CIRCL MISP Events** | 30,000+ events on public instance |
| **Indicator Types** | 100+ attribute types |
| **Sharing Groups** | Sector-specific (finance, government, health, etc.) |
| **Galaxies** | 60+ threat actor and malware family taxonomies |
| **Integration Standards** | STIX 1.x, STIX 2.x, OpenIOC, MISP JSON, CSV |

### Hash Lookup

The hashlookup service (hashlookup.circl.lu) indexes file hashes of known legitimate software, enabling analysts to quickly identify whether a file hash corresponds to known-good software or requires further investigation.

| Metric | Coverage |
|--------|----------|
| **Total Hashes** | 15+ billion (MD5, SHA1, SHA256) |
| **Sources** | NSRL (NIST), Debian packages, Ubuntu, Fedora, NixOS |
| **Lookup Speed** | Sub-100ms response time |
| **Bulk Query** | Supported via API (up to 100 hashes per request) |

### BGP Ranking

| Metric | Coverage |
|--------|----------|
| **ASNs Monitored** | 70,000+ autonomous systems |
| **Data Sources** | Multiple blocklists, threat feeds, abuse reports |
| **Update Frequency** | Daily ranking recalculation |
| **Historical Data** | 5+ years of ranking history |

## API Integration

### Authentication

Most CIRCL services require API key authentication obtained through community registration. Academic and research institutions typically receive elevated access. Some services (hashlookup, BGP ranking) offer limited public access without authentication.

### API Endpoints

| Service | Base URL | Authentication |
|---------|----------|----------------|
| **Passive DNS** | `https://www.circl.lu/pdns/query/` | API key (HTTP Basic Auth) |
| **Passive SSL** | `https://www.circl.lu/v2pssl/query/` | API key (HTTP Basic Auth) |
| **MISP** | `https://misppriv.circl.lu/` | MISP API key (Authkey header) |
| **Hash Lookup** | `https://hashlookup.circl.lu/` | None (public) |
| **BGP Ranking** | `https://bgpranking-ng.circl.lu/` | None (public) |
| **CVE Search** | `https://cve.circl.lu/` | None (public) |

### Rate Limits

| Service | Limit | Notes |
|---------|-------|-------|
| **Passive DNS** | Reasonable use (no hard limit) | Authenticated users; bulk queries by arrangement |
| **Passive SSL** | Reasonable use (no hard limit) | Authenticated users |
| **Hash Lookup** | 10 requests/second | Public access; bulk API available |
| **BGP Ranking** | Reasonable use | Public access |
| **CVE Search** | Reasonable use | Public access |

### curl Examples

```bash
# Passive DNS lookup for a domain
curl -u "username:api_key" \
  "https://www.circl.lu/pdns/query/example.com"

# Passive SSL query for an IP address
curl -u "username:api_key" \
  "https://www.circl.lu/v2pssl/query/1.2.3.4"

# Hash lookup (check if hash is known-good software)
curl "https://hashlookup.circl.lu/lookup/sha256/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

# Bulk hash lookup
curl -X POST "https://hashlookup.circl.lu/bulk/sha256" \
  -H "Content-Type: application/json" \
  -d '{"hashes": ["hash1", "hash2", "hash3"]}'

# BGP ranking for an ASN
curl "https://bgpranking-ng.circl.lu/json/asn?asn=12345&date=$(date +%Y-%m-%d)"

# CVE search by product
curl "https://cve.circl.lu/api/search/nginx"

# CVE details by ID
curl "https://cve.circl.lu/api/cve/CVE-2024-1234"

# MISP event search (requires MISP API key)
curl -H "Authorization: YOUR_MISP_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  "https://misppriv.circl.lu/events/restSearch" \
  -d '{"value": "malicious-domain.com", "type": "domain"}'
```

## Query Examples

```elixir
# Passive DNS lookup - get all historical resolutions for a domain
{:ok, records} = Circl.passive_dns("example.com")
# => [
#   %{rrname: "example.com", rrtype: "A", rdata: "93.184.216.34",
#     time_first: 1609459200, time_last: 1718409600, count: 45678},
#   %{rrname: "example.com", rrtype: "MX", rdata: "mail.example.com",
#     time_first: 1609459200, time_last: 1718409600, count: 12345},
#   ...
# ]

# Passive SSL query - find all certificates observed for an IP
{:ok, certs} = Circl.passive_ssl("93.184.216.34")
# => %{
#   certificates: [
#     %{fingerprint: "sha256:abcd...", subject: "CN=example.com",
#       issuer: "CN=DigiCert...", not_before: ~D[2024-01-01],
#       not_after: ~D[2025-01-01], seen_first: ~U[2024-01-15 00:00:00Z],
#       seen_last: ~U[2025-06-15 00:00:00Z]}
#   ],
#   ip: "93.184.216.34"
# }

# Hash lookup - determine if file hash is known-good
{:ok, result} = Circl.hash_lookup("sha256_hash_here")
# => %{known: true, source: "NSRL", file_name: "notepad.exe",
#      os: "Windows 10", product: "Microsoft Windows"}

# BGP ranking for ASN reputation assessment
{:ok, ranking} = Circl.bgp_ranking("AS12345")
# => %{asn: 12345, ranking: 0.0023, description: "Example ISP",
#      position: 1234, total_asns: 70000}

# CVE search for vulnerability intelligence
{:ok, cves} = Circl.cve_search("nginx", version: "1.21.6")
# => [%{id: "CVE-2024-1234", summary: "...", cvss: 7.5, ...}]

# MISP event search for threat intelligence
{:ok, events} = Circl.misp_search("malicious-domain.com", type: "domain")
# => [%{event_id: 12345, info: "APT Campaign X", date: ~D[2025-06-01],
#       threat_level: :high, attributes: [...]}]

# Bulk hash check for malware triage
{:ok, results} = Circl.bulk_hash_lookup([
  "hash1_sha256", "hash2_sha256", "hash3_sha256"
])
```

## Data Schema

### Passive DNS Record

```elixir
%Circl.PassiveDNS.Record{
  rrname: "example.com",
  rrtype: "A",
  rdata: "93.184.216.34",
  time_first: 1609459200,
  time_last: 1718409600,
  count: 45678,
  bailiwick: "example.com.",
  sensor_id: "sensor-eu-01"
}
```

### Passive SSL Certificate

```elixir
%Circl.PassiveSSL.Certificate{
  fingerprint: "sha256:abcdef1234567890...",
  subject: %{
    cn: "example.com",
    o: "Example Inc.",
    c: "US"
  },
  issuer: %{
    cn: "DigiCert SHA2 Extended Validation Server CA",
    o: "DigiCert Inc."
  },
  serial_number: "0A:1B:2C:3D:...",
  not_before: ~D[2024-01-01],
  not_after: ~D[2025-01-01],
  subject_alternative_names: ["example.com", "www.example.com"],
  seen_ips: ["93.184.216.34", "93.184.216.35"],
  first_seen: ~U[2024-01-15 00:00:00Z],
  last_seen: ~U[2025-06-15 00:00:00Z]
}
```

## Use Cases

### Threat Infrastructure Attribution

Passive DNS enables analysts to trace the historical relationship between domains and IP addresses, revealing infrastructure sharing patterns used by threat actors. When a known malicious domain is identified, passive DNS pivoting reveals all IP addresses it has resolved to over time, and reverse queries on those IPs reveal other domains hosted on the same infrastructure. This technique is fundamental to uncovering the full scope of threat actor infrastructure campaigns.

### Certificate-Based Threat Hunting

Passive SSL data enables detection of certificate reuse across threat actor infrastructure. When a self-signed certificate or a certificate with unusual characteristics is identified on a known malicious server, passive SSL queries reveal all other IP addresses where the same certificate has been observed, uncovering additional command-and-control nodes that share the same SSL configuration.

### Malware Triage and Known-Good Filtering

The hashlookup service dramatically accelerates malware triage by identifying files that match known legitimate software (from the NIST NSRL and Linux distribution packages). During incident response, hundreds of file hashes can be bulk-checked against hashlookup, immediately filtering out known-good files and focusing analyst attention on unknown or suspicious samples.

### Network Reputation Assessment

BGP Ranking provides autonomous system reputation scores based on the volume and severity of malicious activity originating from each ASN. This intelligence supports network-level risk assessment for peering decisions, hosting provider evaluation, and geographic threat analysis. Organizations can monitor the reputation of their own ASN and their hosting providers' ASNs.

### Structured Threat Intelligence Sharing

MISP enables organizations to create, share, and consume structured threat intelligence events containing IOCs, threat actor profiles, vulnerability information, and tactical intelligence. The federated sharing model ensures that intelligence flows between trusted communities while respecting data sensitivity and sharing restrictions.

## Limitations

**Access Requirements**: Passive DNS and passive SSL services require registration and API key approval. Access is prioritized for CERT/CSIRT teams, academic researchers, and organizations contributing to the threat intelligence community. Commercial use may require separate arrangements.

**Passive Collection Bias**: Passive DNS and SSL data reflects actual resolution traffic captured by CIRCL's sensors. Domains or certificates not observed by CIRCL's sensor network will have no passive records. Coverage is strongest for European domains due to sensor placement.

**MISP Complexity**: While MISP is an extremely powerful platform, it has a steep learning curve and requires significant operational investment to deploy and maintain effectively. Smaller organizations may find it challenging to operate their own MISP instance.

**Hash Lookup Scope**: The hashlookup service indexes known-good software hashes. It does not identify known-bad (malware) hashes. A hash not found in hashlookup may be legitimate custom software, not necessarily malware. Malware identification requires separate tools like VirusTotal.

**BGP Ranking Latency**: BGP rankings are recalculated daily. Rapid reputation changes (such as a clean ASN being compromised for spam distribution) may not be reflected immediately.

## Legal and Ethical Considerations

CIRCL services are provided for legitimate security research, incident response, and threat intelligence purposes. Users must comply with CIRCL's acceptable use policies, which prohibit using the services for unauthorized access, harassment, or any illegal purpose.

Passive DNS and passive SSL data are collected from network traffic observations and do not contain personally identifiable information. However, domain ownership and certificate subject information may relate to individuals, and processing this data may trigger [GDPR](/glossary/gdpr/) obligations in European jurisdictions.

MISP data sharing operates under the Traffic Light Protocol (TLP) and MISP distribution levels. Users must respect sharing restrictions and not redistribute intelligence beyond its intended audience. Violations of sharing agreements can result in community exclusion and loss of access to shared intelligence.

When using CIRCL data for threat attribution, analysts should maintain appropriate confidence levels and avoid making public attributions based solely on passive DNS or SSL correlations without corroborating evidence from multiple independent sources.

## Integration with Prismatic Platform

Prismatic Platform integrates CIRCL services as core components of the threat intelligence and infrastructure analysis pipeline, leveraging passive DNS, passive SSL, hashlookup, and MISP capabilities.

### Infrastructure Analysis Pipeline

```elixir
defmodule Prismatic.Intel.InfrastructureAnalysis do
  @moduledoc """
  Combines CIRCL passive DNS and passive SSL with active scanning data
  to produce comprehensive infrastructure intelligence profiles.
  """

  def analyze_infrastructure(domain) do
    with {:ok, pdns} <- Circl.passive_dns(domain),
         ip_addresses <- extract_unique_ips(pdns),
         {:ok, ssl_data} <- parallel_ssl_queries(ip_addresses),
         {:ok, bgp_data} <- parallel_bgp_queries(extract_asns(ip_addresses)) do
      {:ok, %InfrastructureProfile{
        domain: domain,
        dns_history: pdns,
        certificate_observations: ssl_data,
        network_reputation: bgp_data,
        infrastructure_timeline: build_timeline(pdns, ssl_data),
        shared_infrastructure: identify_co_hosted_domains(pdns),
        certificate_reuse: detect_cert_sharing(ssl_data)
      }}
    end
  end
end
```

### MISP Threat Feed Integration

The platform maintains a synchronized connection to CIRCL's MISP instance, ingesting threat intelligence events and correlating MISP indicators with data from other platform modules. MISP events are processed through the NABLA epistemic framework, ensuring that threat assertions meet signal plurality requirements before influencing platform decisions.

### Hashlookup for Malware Triage

During file analysis workflows, the platform queries CIRCL's hashlookup service to rapidly identify known-good software, reducing the volume of files requiring detailed analysis by VirusTotal and other malware scanning services.

## Best Practices

**Pivot Systematically**: When using passive DNS, follow a systematic pivoting methodology: start with the target domain, identify associated IPs, query each IP for co-hosted domains, and examine SSL certificates for infrastructure patterns. Document each pivot to maintain an auditable investigation trail.

**Combine Passive and Active Intelligence**: Passive DNS and SSL data reflect historical observations. Always validate current state through active DNS resolution and certificate inspection. The gap between historical passive records and current state can itself be informative (infrastructure changes may indicate compromise or migration).

**Leverage MISP Galaxies**: MISP galaxies provide rich contextual information about threat actors, malware families, and attack techniques. When MISP search returns events tagged with galaxy clusters, explore the galaxy relationships for additional context that enriches the investigation.

**Use Hashlookup for Negative Filtering**: Structure malware triage workflows to query hashlookup first, removing known-good files from the analysis queue before submitting unknowns to more expensive analysis services (VirusTotal, sandboxes).

**Monitor BGP Ranking Trends**: Track BGP ranking changes for ASNs associated with your organization and key partners. A declining reputation score (increasing malicious activity) may indicate infrastructure compromise requiring investigation.

## Related Providers

- [VirusTotal](/osint/virustotal/) - Multi-engine threat analysis with malware identification
- [AlienVault OTX](/osint/alienvault-otx/) - Open threat exchange with community IOC sharing
- [ThreatFox](/osint/threatfox/) - IOC sharing platform by abuse.ch
- [SecurityTrails](/osint/securitytrails/) - Commercial DNS history and intelligence
- [crt.sh](/osint/crtsh/) - [Certificate transparency](/glossary/certificate-transparency/) log search
- [Shodan](/osint/shodan/) - Internet-connected device and service discovery
- [DomainTools](/osint/domaintools/) - Premium WHOIS and domain intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)