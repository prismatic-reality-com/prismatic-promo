+++
title = "MISP"
weight = 66
[extra]
category = "global"
type = "threat"
module = "Misp"
description = "Malware Information Sharing Platform - structured threat intelligence sharing"
has_api = true
url = "https://misp-project.org"
rate_limit = "Instance-dependent"
capabilities = ["IOC Sharing", "Event Correlation", "Taxonomy Tagging", "Galaxy Clustering", "Feed Integration", "STIX Export"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1478
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["MISP", "Malware", "Information", "Sharing", "Platform", "osint", "global", "Prismatic Platform", "POST", "IOCs"]
tags = ["osint", "global", "misp", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "MISP - Prismatic Platform"
+++

## Overview

MISP (Malware Information Sharing Platform) is the open-source standard for structured [threat intelligence](/glossary/threat-intelligence/) sharing. It enables organizations to share, store, and correlate Indicators of Compromise (IOCs) of targeted attacks, threat intelligence, financial fraud information, vulnerability information, and counter-terrorism data. MISP communities share millions of IOCs through interconnected instances.

Originally developed by CIRCL (Computer Incident Response Center Luxembourg) and now maintained by a global community of contributors, MISP has become the de facto standard for threat intelligence sharing across CERTs, ISACs, government agencies, and private sector security teams. The platform is used by organizations in over 100 countries and processes billions of threat intelligence data points annually.

MISP's design philosophy centers on structured, machine-readable threat intelligence. Unlike unstructured threat reports or simple IOC feeds, MISP events contain rich contextual information including relationships between indicators, temporal metadata, classification tags, and provenance information. This structured approach enables automated processing, correlation, and decision-making that would be impossible with unstructured intelligence.

The platform supports a federated architecture where organizations run their own MISP instances and selectively share events with trusted communities. This model preserves organizational sovereignty over sensitive intelligence while enabling collective defense through information sharing. The Traffic Light Protocol (TLP), Permissible Actions Protocol (PAP), and granular sharing group controls provide fine-grained access management.

## Data Sources and Coverage

MISP aggregates threat intelligence from multiple categories of sources, each contributing different types and quality of intelligence.

| Source Category | Description | Volume |
|----------------|-------------|--------|
| **CERT/CSIRT Feeds** | National and sector CERTs sharing incident data | Thousands of events/month |
| **ISAC Communities** | Information Sharing and Analysis Centers by sector | Sector-specific intelligence |
| **Open Source Feeds** | Automated ingestion from public threat feeds | Millions of indicators |
| **Manual Submissions** | Analyst-created events from investigations | High-quality, context-rich |
| **Automated Integrations** | SIEM, sandbox, and toolchain outputs | High-volume, automated |
| **Partner Sharing** | Bilateral and multilateral intelligence exchange | Varies by partnership |
| **OSINT Feeds** | Botnet trackers, malware repositories, blocklists | Continuous updates |

### MISP Object Templates

| Object Type | Attributes | Description |
|------------|-----------|-------------|
| **file** | filename, md5, sha1, sha256, size, ssdeep | Malware samples and suspicious files |
| **network-connection** | ip-src, ip-dst, port, protocol | Network communication indicators |
| **domain-ip** | domain, ip, first-seen, last-seen | Domain-IP resolution pairs |
| **email** | from, to, subject, attachment, header | Phishing and spam indicators |
| **vulnerability** | cve-id, cvss-score, affected-product | Vulnerability intelligence |
| **threat-actor** | name, aliases, country, motivation | Threat actor profiles |
| **course-of-action** | description, type, efficacy | Defensive recommendations |
| **x509** | issuer, subject, serial, validity | Certificate indicators |

## API Integration

MISP provides a comprehensive REST API for all platform operations. Authentication uses API keys with role-based access control.

### Core API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/events` | GET/POST | List, create, and manage events |
| `/events/view/{id}` | GET | Get full event details with attributes |
| `/events/restSearch` | POST | Advanced event search with filters |
| `/attributes/restSearch` | POST | Search attributes across all events |
| `/attributes/add/{event_id}` | POST | Add attribute to existing event |
| `/objects/add/{event_id}` | POST | Add structured object to event |
| `/tags/search/{tag}` | GET | Search by taxonomy tag |
| `/galaxies` | GET | List available galaxy clusters |
| `/feeds` | GET | List configured feeds |
| `/sightings/add` | POST | Report sighting of an indicator |
| `/servers/pull` | POST | Trigger sync pull from remote instance |
| `/warninglists/checkValue` | POST | Check value against warning lists |

### API Authentication

| Method | Header | Format |
|--------|--------|--------|
| **API Key** | `Authorization` | API key from user profile |
| **Content Type** | `Content-Type` | `application/json` |
| **Accept** | `Accept` | `application/json` |

## Query Examples

### curl Examples

```bash
# Search for IOC across all events
curl -X POST "https://misp.example.org/attributes/restSearch" \
  -H "Authorization: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "1.2.3.4",
    "type": "ip-src",
    "includeContext": true,
    "includeCorrelations": true
  }'

# Get event details
curl "https://misp.example.org/events/view/12345" \
  -H "Authorization: YOUR_API_KEY" \
  -H "Accept: application/json"

# Create a new event
curl -X POST "https://misp.example.org/events/add" \
  -H "Authorization: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "Event": {
      "info": "Phishing campaign targeting finance sector - Feb 2026",
      "distribution": 1,
      "threat_level_id": 2,
      "analysis": 2,
      "Tag": [
        {"name": "tlp:amber"},
        {"name": "misp-galaxy:threat-actor=\"APT28\""}
      ],
      "Attribute": [
        {"type": "domain", "value": "phish.example.com", "category": "Network activity", "to_ids": true},
        {"type": "ip-dst", "value": "1.2.3.4", "category": "Network activity", "to_ids": true},
        {"type": "sha256", "value": "e3b0c44298fc1c149...", "category": "Payload delivery", "to_ids": true}
      ]
    }
  }'

# Search events by tag
curl -X POST "https://misp.example.org/events/restSearch" \
  -H "Authorization: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["misp-galaxy:threat-actor=\"APT28\""], "from": "2025-01-01"}'

# Export in STIX 2.1 format
curl "https://misp.example.org/events/restSearch" \
  -H "Authorization: YOUR_API_KEY" \
  -H "Accept: application/json" \
  -d '{"returnFormat": "stix2", "tags": ["tlp:white"]}'

# Report a sighting of an indicator
curl -X POST "https://misp.example.org/sightings/add" \
  -H "Authorization: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value": "1.2.3.4", "type": 0, "source": "Prismatic SIEM"}'
```

### Elixir Integration

```elixir
# Search MISP for IOC with full context
{:ok, events} = PrismaticOsint.Misp.search(
  attribute_value: "1.2.3.4",
  type: :ip_src,
  include_context: true,
  include_correlations: true
)
# => [%{event_id: 12345, info: "APT28 campaign Feb 2026",
#       threat_level: :high, analysis: :completed,
#       attributes: [...], tags: ["tlp:amber", ...]}]

# Get detailed event with all objects and attributes
{:ok, event} = PrismaticOsint.Misp.event(12345)

# Create event with structured objects
{:ok, created} = PrismaticOsint.Misp.create_event(%{
  info: "Phishing campaign targeting finance sector",
  threat_level: :high,
  distribution: :community,
  attributes: [
    %{type: "domain", value: "phish.example.com", to_ids: true},
    %{type: "ip-dst", value: "1.2.3.4", to_ids: true},
    %{type: "sha256", value: "e3b0c44298fc1c149...", to_ids: true}
  ],
  tags: ["tlp:amber", "misp-galaxy:threat-actor=\"APT28\""],
  objects: [
    %{template: "email", attributes: [
      %{type: "from", value: "attacker@phish.example.com"},
      %{type: "subject", value: "Urgent: Account verification required"}
    ]}
  ]
})

# Bulk IOC check against MISP knowledge base
iocs = ["1.2.3.4", "evil.example.com", "abc123def456..."]
{:ok, matches} = PrismaticOsint.Misp.bulk_check(iocs)
# => %{matched: 2, results: [%{value: "1.2.3.4", events: [...]}, ...]}

# Subscribe to feed updates for real-time intelligence
{:ok, subscription} = PrismaticOsint.Misp.subscribe(
  tags: ["misp-galaxy:sector=\"Finance\""],
  callback: &PrismaticOsint.Pipeline.process_misp_event/1
)

# Export events in STIX 2.1 format
{:ok, stix_bundle} = PrismaticOsint.Misp.export(
  format: :stix2,
  tags: ["tlp:white"],
  from: ~D[2025-01-01]
)
```

## Data Schema

### Event Structure

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique event identifier |
| `uuid` | string | Globally unique identifier (UUID4) |
| `info` | string | Event description/title |
| `threat_level_id` | enum | 1 (High), 2 (Medium), 3 (Low), 4 (Undefined) |
| `analysis` | enum | 0 (Initial), 1 (Ongoing), 2 (Completed) |
| `distribution` | enum | 0 (Org only), 1 (Community), 2 (Connected), 3 (All), 4 (Sharing group) |
| `date` | date | Event occurrence date |
| `published` | boolean | Whether event has been published to community |
| `orgc_id` | integer | Creating organization ID |
| `tags` | array | Classification tags (TLP, taxonomy, galaxy) |
| `attributes` | array | Indicator attributes with metadata |
| `objects` | array | Structured MISP objects |
| `galaxies` | array | Galaxy cluster associations |
| `related_events` | array | Correlated events |

### Attribute Structure

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | Attribute type (ip-src, domain, sha256, etc.) |
| `category` | string | Attribute category (Network activity, Payload delivery, etc.) |
| `value` | string | Indicator value |
| `to_ids` | boolean | Whether attribute should be used for detection |
| `first_seen` | datetime | First observation timestamp |
| `last_seen` | datetime | Last observation timestamp |
| `comment` | string | Analyst comment |
| `correlation_count` | integer | Number of correlated events |
| `sighting_count` | integer | Number of reported sightings |

## Use Cases

### Threat Intelligence Sharing

MISP's primary purpose is enabling organizations to share threat intelligence with trusted partners. Security teams create events documenting attacks they observe, tag them with appropriate classification levels (TLP), and share them with their MISP community. Recipients can then search their infrastructure for the shared indicators, improving collective defense.

### Incident Response

During incident response, analysts query MISP to determine whether observed indicators match known threats. Finding a match provides immediate context -- the associated malware family, threat actor, campaign, and recommended countermeasures. This dramatically reduces investigation time compared to analyzing indicators from scratch.

### Threat Hunting

Proactive threat hunters use MISP's correlation engine to identify patterns across events. By searching for relationships between indicators, analysts discover infrastructure shared between campaigns, detect early-stage intrusion attempts, and identify threat actors operating in their sector.

### Detection Engineering

MISP events with `to_ids: true` attributes can be automatically exported as detection rules for SIEM systems, IDS/IPS platforms, and firewalls. The structured taxonomy system enables targeted detection rule generation based on threat relevance.

### Intelligence Production

Analyst teams use MISP to produce structured intelligence products from raw incident data. The event model with its objects, attributes, galaxies, and tags provides a framework for creating machine-readable intelligence that can be consumed by both humans and automated systems.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Self-hosted complexity** | Running MISP requires server administration expertise | Use managed MISP services or cloud deployments |
| **Data quality varies** | Community-sourced data includes false positives | Use warning lists, correlations, and sighting data for validation |
| **Instance fragmentation** | Intelligence spread across disconnected MISP instances | Establish sync partnerships with key community instances |
| **Learning curve** | Complex taxonomy and galaxy system requires training | Invest in analyst training; start with standard taxonomies |
| **Performance at scale** | Large instances (10M+ attributes) require tuning | Implement proper indexing, caching, and archival policies |
| **Sharing reluctance** | Organizations hesitant to share incident details | TLP and sharing groups provide granular control |

## Legal and Ethical Considerations

**Information Sharing Agreements**: MISP sharing should operate under formal information sharing agreements (ISAs) between participating organizations. These agreements define allowed use, redistribution rights, and liability limitations.

**TLP Compliance**: The Traffic Light Protocol (TLP) markings on MISP events are legally and ethically binding within sharing communities. TLP:RED data must never be shared beyond the specific recipients. TLP:AMBER restricts sharing to the recipient's organization. Violations undermine trust and may violate sharing agreements.

**Attribution Sensitivity**: MISP events may contain attribution to specific threat actors or nation-states. Sharing attribution intelligence carries diplomatic and legal implications that should be considered, particularly for government organizations.

**Personal Data in IOCs**: Email addresses, usernames, and other personal identifiers appearing as IOCs constitute personal data under GDPR. Their processing requires lawful basis, typically legitimate interest in cybersecurity defense.

**Responsible Sharing**: Organizations should ensure that shared intelligence does not inadvertently reveal the identity of victims, compromise ongoing law enforcement operations, or provide adversaries with information about defensive capabilities.

## Integration with Prismatic Platform

The [Prismatic Platform](/apps/prismatic/) maintains a dedicated MISP instance that serves as the central threat intelligence repository for the platform's security operations.

- **Automated Feed Ingestion**: The platform subscribes to 40+ open-source MISP feeds, automatically ingesting and correlating new IOCs as they are published.
- **Bidirectional Sync**: Platform findings from [VirusTotal](/osint/virustotal/), [ThreatFox](/osint/threatfox/), and other threat intelligence sources are automatically published to MISP for sharing with trusted communities.
- **Correlation Engine**: MISP's built-in correlation is extended with the platform's cross-source correlation capabilities, linking MISP events with [Shodan](/osint/shodan/) infrastructure data and [SecurityTrails](/osint/securitytrails/) DNS intelligence.
- **STIX/TAXII Export**: Platform intelligence is exported in STIX 2.1 format for consumption by partner organizations and downstream security tools.
- **Alert Generation**: New MISP events matching monitored criteria trigger automated alerts and investigation workflows in the platform's incident response pipeline.
- **Galaxy Integration**: MISP galaxy clusters for MITRE ATT&CK, threat actors, and malware families are mapped to the platform's [knowledge graph](/glossary/knowledge-graph/).

## Best Practices

1. **Tag consistently**: Use standardized taxonomies (TLP, admiralty, PAP) on every event. Consistent tagging enables automated processing and filtering.

2. **Enrich before sharing**: Add context, relationships, and classification before publishing events. Raw IOC dumps without context have limited value.

3. **Use objects over flat attributes**: MISP objects preserve relationships between related attributes. A file object linking a filename, hash, and size is more useful than three separate attributes.

4. **Set `to_ids` thoughtfully**: Only mark attributes as IDS-worthy when they have sufficiently low false-positive rates for automated detection use.

5. **Report sightings**: When you observe shared indicators in your environment, report sightings back to the MISP community. Sighting data improves confidence scoring.

6. **Configure warning lists**: Enable MISP warning lists to flag indicators that match known benign infrastructure (CDNs, DNS resolvers, etc.).

7. **Automate feed management**: Configure automated feed pulls with appropriate frequency. High-volume feeds should pull every 15-30 minutes; lower-volume feeds every 1-6 hours.

8. **Archive old events**: Implement retention policies to keep your MISP instance performant. Archive events older than 2 years to cold storage while maintaining searchability.

## Related Providers

- [AlienVault OTX](/osint/alienvault-otx/) - Open threat exchange
- [ThreatFox](/osint/threatfox/) - IOC sharing by abuse.ch
- [VirusTotal](/osint/virustotal/) - Multi-engine threat analysis
- [CIRCL](/osint/circl-lu/) - Luxembourg CERT (MISP developer)
- [MITRE ATT&CK](/osint/mitre-attack/) - TTP framework
- [Pulsedive](/osint/pulsedive/) - Threat intelligence enrichment
- [Shodan](/osint/shodan/) - Infrastructure intelligence for IOC context

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)