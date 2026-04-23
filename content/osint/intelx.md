+++
title = "Intelligence X"
weight = 45
[extra]
category = "global"
type = "search"
module = "IntelX"
description = "Search engine for leaked data, dark web, and historical content"
has_api = true
url = "https://intelx.io"
rate_limit = "API key required, tiered plans"
capabilities = ["Leak Search", "Dark Web Indexing", "Email Intelligence", "Domain Intelligence", "Paste Monitoring", "Historical Content"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1308
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Intelligence", "Search", "osint", "global", "Prismatic Platform", "IntelX", "Description"]
tags = ["osint", "global", "intelligence-x", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Intelligence X - Prismatic Platform"
+++

## Overview

Intelligence X (IntelX) is a search engine and data archive that indexes content from the open web, dark web, paste sites, leaked databases, and other hard-to-reach sources. Unlike traditional search engines, IntelX specializes in preserving and making searchable data that is typically ephemeral or hidden. It is widely used by cybersecurity professionals, journalists, and investigators for uncovering compromised credentials, leaked documents, and threat actor communications.

The platform was founded in Prague, Czech Republic, and operates under European data protection laws. IntelX differentiates itself by maintaining historical archives of content that may no longer exist at its original location -- deleted paste site entries, removed dark web forum posts, expired .onion sites, and historical versions of web pages. This temporal dimension makes IntelX invaluable for investigations where evidence may have been deliberately destroyed or where understanding the timeline of data exposure is critical.

IntelX indexes content across multiple layers of the internet. The surface web crawler captures public documents, government filings, and corporate disclosures. The deep web indexer processes paste sites, code repositories, and semi-public databases. The dark web scanner monitors .onion services, I2P sites, and encrypted forums. All content is processed through entity extraction to enable structured searches by email, domain, IP, phone number, Bitcoin address, and other identifier types.

## Data Sources and Coverage

| Source Category | Description | Indexed Volume |
|----------------|-------------|---------------|
| **Leaked Databases** | Credentials, personal data from data breaches | Billions of records |
| **Dark Web (.onion)** | Tor hidden services, forums, marketplaces | 200,000+ .onion pages |
| **Paste Sites** | Pastebin, Ghostbin, IX, JustPaste.it, Rentry | 100M+ pastes |
| **Public Documents** | Court records, government filings, regulatory docs | Millions of documents |
| **WHOIS History** | Domain registration changes over time | 1B+ historical records |
| **Social Media Archives** | Deleted or cached social media content | Selective archiving |
| **Source Code** | GitHub, GitLab leaked and deleted repositories | Millions of repos |
| **News Archives** | Deleted news articles and press releases | Major outlets |
| **Forum Posts** | Hacking forums, underground communities | Thousands of forums |
| **Telegram/Discord** | Public channel archives and leaked content | Growing coverage |

## API Integration

IntelX provides a multi-phase API at `https://2.intelx.io/` with JSON responses. Authentication is via API key passed in the `x-key` header. The search workflow follows a two-step pattern: initiate a search, then retrieve results.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/intelligent/search` | POST | Initiate a new search |
| `/intelligent/search/result` | GET | Retrieve search results |
| `/file/read` | GET | Read full content of a result |
| `/file/preview` | GET | Preview content without full download |
| `/phonebook/search` | POST | Structured entity search |
| `/phonebook/search/result` | GET | Retrieve phonebook results |

### API Tiers

| Tier | Searches/Day | Results/Search | Storage Access | Price |
|------|-------------|---------------|----------------|-------|
| Free | 10 | 10 | Limited preview | $0 |
| Professional | 5,000 | 1,000 | Full content | $400/mo |
| Enterprise | 50,000 | 10,000 | Full + bulk | Custom |
| Academic | 1,000 | 100 | Full content | Free (verified) |

## Query Examples

### curl Examples

```bash
# Initiate a search for an email address
curl -X POST "https://2.intelx.io/intelligent/search" \
  -H "x-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "term": "user@example.com",
    "buckets": [],
    "lookuplevel": 0,
    "maxresults": 100,
    "timeout": 5,
    "datefrom": "",
    "dateto": "",
    "sort": 2,
    "media": 0,
    "terminate": []
  }'

# Retrieve results (using search ID from initiation response)
curl "https://2.intelx.io/intelligent/search/result?id=SEARCH_ID&limit=100" \
  -H "x-key: YOUR_API_KEY"

# Phonebook search for domain (structured entity extraction)
curl -X POST "https://2.intelx.io/phonebook/search" \
  -H "x-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"term": "example.com", "maxresults": 1000, "target": 1}'

# Read full content of a specific result
curl "https://2.intelx.io/file/read?type=0&storageid=STORAGE_ID&bucket=BUCKET" \
  -H "x-key: YOUR_API_KEY"
```

### Search Selectors

```
# Search by email
email@example.com

# Search by domain
example.com

# Search by IP address
192.168.1.1

# Search by CIDR range
192.168.1.0/24

# Search by Bitcoin address
1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

# Search by phone number
+420123456789

# Search by IBAN
CZ6508000000192000145399

# Search by MAC address
00:1A:2B:3C:4D:5E
```

### Elixir Integration

```elixir
# Search for email in leaks and dark web
{:ok, search} = PrismaticOsint.IntelX.search("user@example.com", type: :email)
# => %{id: "abc-123", status: :running, results_count: 0}

# Poll for results (adapter handles polling automatically)
{:ok, results} = PrismaticOsint.IntelX.await_results(search.id, timeout: 30_000)
# => %{results: [%{name: "breach_2024.txt", date: ~U[2024-03-15 ...],
#       bucket: "leaks", media: 24, ...}]}

# Search domain across all sources
{:ok, findings} = PrismaticOsint.IntelX.search("example.com", type: :domain)

# Phonebook search - extract structured entities from a domain
{:ok, entities} = PrismaticOsint.IntelX.phonebook("example.com",
  target: :emails,
  max_results: 500
)
# => %{emails: ["john@example.com", "jane@example.com", ...], count: 342}

# Get full content of a specific result
{:ok, content} = PrismaticOsint.IntelX.fetch(result.storage_id, result.bucket)

# Monitor for new mentions
{:ok, monitor} = PrismaticOsint.IntelX.create_alert("example.com",
  notify: :webhook,
  webhook_url: "https://prismatic.internal/webhooks/intelx"
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `systemid` | string | Unique result identifier |
| `storageid` | string | Storage location identifier for content retrieval |
| `bucket` | string | Source category (pastes, leaks, darknet, etc.) |
| `name` | string | Result name or filename |
| `date` | datetime | When the content was indexed |
| `media` | integer | Media type code (0=text, 1=paste, 24=leak, etc.) |
| `type` | integer | Content type identifier |
| `size` | integer | Content size in bytes |
| `accesslevel` | integer | Required access tier (0=public, 1=pro, 2=enterprise) |
| `tags` | array | Associated tags and classifications |
| `simhash` | string | Similarity hash for deduplication |

## Use Cases

### Breach Intelligence and Credential Monitoring

IntelX excels at identifying organizational exposure through data breaches. Analysts search by corporate domain to discover all leaked credentials, internal documents, and proprietary data that have appeared in known breaches. The temporal dimension allows tracking of when exposure first occurred and whether it has spread to secondary leak sites.

### Dark Web Monitoring

For organizations concerned about their presence on dark web marketplaces and forums, IntelX provides passive monitoring without requiring direct access to Tor or I2P networks. This reduces operational security risks associated with dark web browsing while maintaining intelligence coverage.

### Investigative Research

Journalists and investigators use IntelX to find deleted or hidden content that may be relevant to their work. Cached social media posts, removed press releases, and archived forum discussions can provide evidence of activities that subjects have attempted to conceal.

### Counterintelligence

Security teams use IntelX to understand what adversaries can learn about their organization. By searching for their own domains, executive names, and internal system identifiers, teams can assess their exposure posture and remediate information leaks before they are exploited.

### Insider Threat Detection

Monitoring for internal email addresses and proprietary terminology appearing in paste sites or underground forums can provide early warning of insider threats or data exfiltration.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Ephemeral content** | Some dark web content disappears before indexing | Use multiple dark web monitoring services |
| **Free tier severely limited** | Only 10 searches/day with 10 results each | Professional tier required for real investigations |
| **Content may be fabricated** | Leaked databases sometimes contain fabricated entries | Cross-reference findings with other sources |
| **Delayed indexing** | New breaches may take days to weeks to appear | Supplement with real-time breach notification services |
| **No content modification detection** | Cannot verify if leaked data has been altered | Validate critical findings through independent channels |
| **Geographic bias** | Stronger coverage of English/European content | Supplement with region-specific tools for Asia/LATAM |

## Legal and Ethical Considerations

**Data Sensitivity**: IntelX results frequently contain highly sensitive personal data including passwords, financial information, and private communications. Investigators must handle this data according to applicable data protection regulations and organizational policies.

**Lawful Purpose**: Accessing leaked credentials or personal data requires a lawful purpose. Legitimate uses include authorized security assessments, incident response, law enforcement investigations, and journalistic inquiry in the public interest. Using leaked data for unauthorized access, harassment, or fraud is illegal.

**European Jurisdiction**: IntelX operates under Czech and EU law. Data retention and access policies comply with GDPR. Investigators in non-EU jurisdictions should verify that their use of IntelX data complies with their local data protection laws.

**Evidence Handling**: When IntelX findings are used as evidence, investigators should document the search methodology, timestamp results, and maintain chain of custody records. IntelX provides result identifiers that can serve as reference points for reproducibility.

**Responsible Disclosure**: If IntelX searches reveal previously unknown data breaches affecting third parties, investigators should consider responsible disclosure to affected organizations, particularly when personal data exposure is ongoing.

## Integration with Prismatic Platform

Within the [Prismatic Platform](/apps/prismatic/), IntelX serves as the primary dark web and breach intelligence source in the OSINT pipeline.

- **Automated Breach Monitoring**: Scheduled searches for monitored domains and email addresses with automated alerting when new exposure is detected.
- **Phonebook Integration**: The phonebook API provides structured entity extraction that feeds directly into the platform's entity resolution engine.
- **Cross-Source Correlation**: IntelX findings are automatically correlated with [Have I Been Pwned](/osint/haveibeenpwned/) breach records, [Hunter.io](/osint/hunter-io/) email intelligence, and [VirusTotal](/osint/virustotal/) threat data.
- **Content Archiving**: Retrieved content is stored in the platform's evidence repository with full provenance metadata for audit and compliance purposes.
- **Risk Scoring**: Discovery of organizational data in IntelX automatically contributes to the entity risk score in [Prismatic Perimeter](/apps/prismatic-perimeter/).

## Best Practices

1. **Use phonebook for structured data**: The phonebook API provides cleaner, structured results compared to the general search API for entity enumeration tasks.

2. **Filter by bucket**: Narrow searches to specific source categories (pastes, leaks, darknet) to reduce noise and focus on relevant findings.

3. **Set date ranges**: Use `datefrom` and `dateto` parameters to scope searches to relevant time periods, especially when investigating specific incidents.

4. **Handle results asynchronously**: The two-phase search model (initiate + poll) requires async handling. The Prismatic adapter manages this transparently.

5. **Verify before acting**: Leaked data may be incomplete, outdated, or fabricated. Always validate critical findings through independent sources before taking action.

6. **Document searches**: Maintain audit logs of all IntelX queries for compliance and investigation reproducibility.

7. **Respect access levels**: Some results require higher API tiers. Plan your subscription level based on investigation requirements.

8. **Monitor continuously**: Set up automated alerts for organizational domains to catch new exposure promptly.

## Related Providers

- [Have I Been Pwned](/osint/haveibeenpwned/) - Breach notification and credential check
- [VirusTotal](/osint/virustotal/) - Malware and threat correlation
- [Hunter.io](/osint/hunter-io/) - Email discovery and verification
- [Shodan](/osint/shodan/) - Infrastructure intelligence
- [Pulsedive](/osint/pulsedive/) - Threat intelligence enrichment
- [ThreatFox](/osint/threatfox/) - Malware IOC sharing
- [SecurityTrails](/osint/securitytrails/) - DNS and WHOIS intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)