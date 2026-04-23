+++
title = "Maltego"
weight = 42
[extra]
category = "global"
type = "osint"
module = "Maltego"
description = "Visual link analysis tool for OSINT investigations and graph-based intelligence"
has_api = true
url = "https://maltego.com"
rate_limit = "Transform-dependent, varies by data provider"
capabilities = ["Entity Resolution", "Link Analysis", "Graph Visualization", "Transform Hub", "Social Network Mapping", "Infrastructure Mapping"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1347
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Maltego", "Visual", "OSINT", "global", "Prismatic Platform", "Email", "Person"]
tags = ["osint", "global", "maltego", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Maltego - Prismatic Platform"
+++

## Overview

Maltego is the premier visual link analysis tool used by law enforcement, intelligence agencies, and corporate investigators worldwide. It provides an interactive graph environment where entities (people, companies, domains, IPs, etc.) are connected through automated transforms that query hundreds of data sources. Maltego turns raw [OSINT](@/glossary/osint.md) data into actionable visual intelligence by revealing hidden relationships.

Developed by Paterva in South Africa and now maintained by Maltego Technologies, the platform has become the industry standard for link analysis in digital investigations. Maltego's graph-based approach mirrors how intelligence analysts naturally think about relationships -- entities connected by edges that represent observed associations. This visual methodology enables pattern recognition that would be nearly impossible through text-based analysis of the same data.

The platform's power derives from its Transform Hub ecosystem, which connects to hundreds of third-party data providers. Each transform takes an input entity and returns related entities with relationship metadata. By chaining transforms, analysts build out investigation graphs that reveal connections spanning multiple data domains -- from DNS infrastructure to social media profiles to financial records.

Maltego operates on the principle that intelligence emerges from connections, not individual data points. A single IP address is a data point; its connection to a domain, which shares a registrant with another domain, which hosts a login page mimicking a target organization -- that is intelligence.

## Data Sources and Coverage

Maltego itself is a platform rather than a data source. Its intelligence comes from the transforms available through the Transform Hub and custom integrations.

| Transform Category | Key Providers | Entity Types |
|-------------------|---------------|-------------|
| **DNS/Domain** | SecurityTrails, PassiveTotal, DomainTools | Domain, IP, NS, MX, DNS Record |
| **WHOIS** | WhoisXML, DomainTools, RiskIQ | Registrant, Organization, Email |
| **Social Media** | Twitter, Facebook, LinkedIn (via scrapers) | Person, Handle, Post, Group |
| **Email** | Hunter.io, EmailRep, Pipl | Email, Person, Organization |
| **Threat Intelligence** | VirusTotal, Shodan, AlienVault OTX | Hash, URL, IP, CVE, Threat Actor |
| **Company Data** | OpenCorporates, Companies House, GLEIF | Company, Officer, Registration |
| **Geolocation** | MaxMind, IPInfo, Google Maps | Location, Coordinates, Address |
| **Cryptocurrency** | Chainalysis, CipherTrace | Wallet, Transaction, Exchange |
| **Phone/Identity** | Pipl, FullContact, TrueCaller | Phone, Person, Identity |
| **Dark Web** | IntelX, DarkOwl, Webhose | Paste, Forum Post, Market Listing |

### Built-in Transforms

Maltego ships with several built-in transform categories that do not require external API keys:

| Category | Transforms | Description |
|----------|-----------|-------------|
| DNS | 15+ | Forward/reverse DNS, MX, NS lookups |
| WHOIS | 5+ | Domain registration queries |
| Person | 10+ | Name to email, social media discovery |
| Infrastructure | 8+ | IP to geolocation, ASN, netblock |
| Document | 5+ | Metadata extraction from files |
| Social | 12+ | Profile lookups across platforms |

## API Integration

Maltego provides multiple integration points for programmatic access to its functionality.

### Transform API (TDS)

The Transform Distribution Server (TDS) protocol enables custom transform development. Transforms can be hosted locally or on remote servers.

```python
# Example Maltego transform server (Python/Flask)
from maltego_trx.maltego import MaltegoTransform

class DomainToIP(MaltegoTransform):
    def do_transform(self, request, response, config):
        domain = request.Value
        # Perform DNS resolution
        ips = resolve_domain(domain)
        for ip in ips:
            entity = response.addEntity("maltego.IPv4Address", ip)
            entity.addProperty("ipv4-address", "IPv4 Address", "strict", ip)
        return response
```

### Maltego REST API (Server Edition)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/graphs` | GET/POST | Manage investigation graphs |
| `/entities` | GET/POST | Entity CRUD operations |
| `/transforms` | POST | Execute transforms programmatically |
| `/export` | GET | Export graphs (GraphML, CSV, PDF) |
| `/machines` | POST | Run Maltego machines (automated workflows) |

## Query Examples

### Elixir Integration

```elixir
# Execute a domain-to-IP transform
{:ok, results} = PrismaticOsint.Maltego.transform("maltego.Domain", "example.com",
  transform: "paterva.v2.DomainToDNSName_DNSBrute"
)
# => %{entities: [
#   %{type: "maltego.DNSName", value: "mail.example.com", properties: %{...}},
#   %{type: "maltego.DNSName", value: "vpn.example.com", properties: %{...}}
# ]}

# Build a multi-hop investigation graph
{:ok, graph} = PrismaticOsint.Maltego.investigate("maltego.Person", "John Doe",
  depth: 3,
  transforms: [:person_to_email, :email_to_domain, :domain_to_ip]
)
# => %{nodes: 47, edges: 62, entity_types: [:person, :email, :domain, :ip]}

# Execute a Maltego Machine (automated workflow)
{:ok, result} = PrismaticOsint.Maltego.run_machine("L3 - Deep Internet Infrastructure",
  seed_entity: {"maltego.Domain", "example.com"}
)

# Export graph for external analysis
{:ok, graphml} = PrismaticOsint.Maltego.export(graph, format: :graphml)
{:ok, csv} = PrismaticOsint.Maltego.export(graph, format: :csv)

# Query the case management database
{:ok, cases} = PrismaticOsint.Maltego.list_cases(
  status: :active,
  created_after: ~D[2025-01-01]
)
```

### Transform Chain Examples

```
# Infrastructure investigation chain
Domain → DNS Records → IP Addresses → Reverse DNS → Co-hosted Domains
   ↓                                       ↓
WHOIS Registrant → Reverse WHOIS → Other Domains by Same Registrant
   ↓
SSL Certificate → Subject Alt Names → Additional Domains

# Person investigation chain
Person Name → Email Addresses → Social Media Profiles
   ↓                ↓                    ↓
Phone Numbers   Domain Ownership    Connections/Friends
   ↓                ↓                    ↓
Addresses      Company Roles        Group Memberships

# Threat actor investigation chain
Malware Hash → VirusTotal → C2 Domains → IP Infrastructure
   ↓                            ↓              ↓
MITRE ATT&CK TTP          WHOIS History   Passive DNS History
   ↓                            ↓              ↓
Related Campaigns          Registrant      Shared Infrastructure
```

## Data Schema

Maltego uses a typed entity model where each node in the graph has a defined type with properties.

| Entity Type | Key Properties | Description |
|------------|---------------|-------------|
| `maltego.Domain` | `fqdn`, `whois-info` | Internet domain name |
| `maltego.IPv4Address` | `ipv4-address`, `ip.port` | IPv4 host address |
| `maltego.DNSName` | `fqdn`, `dns.record-type` | DNS record entry |
| `maltego.EmailAddress` | `email`, `email.type` | Email address |
| `maltego.Person` | `person.firstname`, `person.lastname` | Individual person |
| `maltego.Company` | `company.name`, `registration-number` | Legal entity |
| `maltego.PhoneNumber` | `phone.number`, `phone.countrycode` | Telephone number |
| `maltego.URL` | `url`, `title` | Web page URL |
| `maltego.Hash` | `properties.hash`, `hash.type` | File hash (MD5/SHA) |
| `maltego.AS` | `as.number`, `as.name` | Autonomous System |
| `maltego.Location` | `country`, `city`, `latitude`, `longitude` | Geographic location |

## Use Cases

### Corporate Investigation

Maltego excels at mapping organizational structures and beneficial ownership. Starting from a company name, analysts chain transforms through corporate registries, director databases, and property records to reveal undisclosed relationships between entities. Cross-border corporate structures that span multiple jurisdictions are visualized as connected graphs, making it possible to identify shell companies, nominee directors, and hidden beneficial owners.

### Threat Intelligence and Attribution

Cyber threat investigators use Maltego to map adversary infrastructure. Starting from a single indicator of compromise (malware hash, C2 domain, or phishing URL), analysts pivot through passive DNS, WHOIS history, SSL certificates, and web crawl data to discover the full scope of a threat actor's infrastructure. Graph analysis reveals infrastructure reuse across campaigns, enabling attribution.

### Due Diligence and Compliance

Financial institutions and compliance teams use Maltego to screen entities against sanctions lists, PEP databases, and adverse media sources. The visual graph approach makes it easy to identify indirect connections between investigated entities and sanctioned parties that text-based screening would miss.

### Social Network Analysis

By mapping relationships between social media profiles, email addresses, phone numbers, and physical addresses, analysts reconstruct social networks that reveal group membership, communication patterns, and influence structures. This capability supports both security investigations and competitive intelligence.

### Fraud Investigation

Insurance, banking, and law enforcement investigators use Maltego to detect fraud rings by mapping connections between seemingly unrelated claims, accounts, or transactions. The graph visualization makes patterns visible that would be impossible to detect through individual record review.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Transform costs** | Many useful transforms require paid API keys from providers | Budget for essential transform subscriptions |
| **Data freshness varies** | Each transform pulls from its own data source with different update cycles | Note data timestamps and re-run transforms for critical findings |
| **Graph complexity** | Large investigations can produce overwhelming graphs | Use bookmarks, groups, and layout algorithms to manage complexity |
| **No bulk automation (CE)** | Community Edition lacks machines and bulk transforms | Use Classic/XL for automated workflows |
| **Desktop application** | Requires local installation, not cloud-native | Server Edition available for team collaboration |
| **Learning curve** | Effective use requires understanding entity types and transform chains | Invest in training and start with guided investigations |

## Legal and Ethical Considerations

**Authorized Purpose**: Maltego is a powerful investigation tool that should only be used for authorized purposes -- security research, authorized penetration testing, law enforcement with proper authority, journalistic investigation in the public interest, or corporate compliance and due diligence.

**Data Aggregation Risk**: Maltego's strength in connecting data across sources also creates privacy risks. Aggregating publicly available data points can reveal private information about individuals. Analysts should consider proportionality and necessity when expanding investigation graphs.

**Transform Terms of Service**: Each third-party transform provider has its own terms of service governing data use. Analysts must comply with provider terms for all transforms used in their investigations.

**Evidence Standards**: When Maltego findings are used as evidence, document the exact transforms used, their data sources, and the date of execution. Export graphs in multiple formats for preservation.

## Integration with Prismatic Platform

The [Prismatic Platform](@/apps/prismatic.md) integrates with Maltego through the Transform Distribution Server protocol, enabling bidirectional data flow between the platform's [knowledge graph](@/glossary/knowledge-graph.md) and Maltego investigation graphs.

- **Custom Transforms**: Prismatic provides a suite of custom Maltego transforms that query the platform's aggregated intelligence data, including Czech business registries, threat intelligence feeds, and cross-source correlation results.
- **Graph Synchronization**: Investigation graphs can be imported from Maltego into the Prismatic entity model and vice versa, enabling seamless transition between visual analysis and automated processing.
- **[Entity Resolution](@/glossary/entity-resolution.md)**: Maltego entity types map to Prismatic's unified entity model, enabling entities discovered in Maltego to be resolved against the platform's existing knowledge base.
- **Collaboration**: Maltego Server Edition integration enables team-based investigations with shared graphs and synchronized findings.

## Best Practices

1. **Start with a clear hypothesis**: Define what you are looking for before starting transforms. Undirected expansion creates unmanageable graphs.

2. **Use selective transforms**: Run targeted transforms rather than "Run All Transforms" to maintain graph clarity and conserve API credits.

3. **Bookmark key entities**: Mark important findings early so they remain visible as the graph grows.

4. **Document as you go**: Add notes to entities and edges explaining why they are significant. Memory fades; documentation persists.

5. **Validate critical paths**: When a connection chain supports a key finding, verify each link independently. A single incorrect transform result can invalidate the entire chain.

6. **Export regularly**: Save graph snapshots at key investigation milestones. Maltego graphs cannot be easily reconstructed if corrupted.

7. **Layer data sources**: Use transforms from multiple providers for the same query type. Cross-source validation increases confidence.

8. **Manage graph size**: Remove noise entities regularly. A focused graph with 50 significant entities is more valuable than a cluttered graph with 5,000.

## Related Providers

- [Shodan](@/osint/shodan.md) - Internet device scanning for infrastructure context
- [Censys](@/osint/censys.md) - Certificate and host intelligence
- [Open Corporates](@/osint/open-corporates.md) - Global corporate registry data
- [Hunter.io](@/osint/hunter-io.md) - Email discovery and verification
- [SecurityTrails](@/osint/securitytrails.md) - DNS and domain history
- [SpiderFoot](@/osint/spiderfoot.md) - Automated OSINT collection framework
- [VirusTotal](@/osint/virustotal.md) - Multi-engine threat analysis

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)