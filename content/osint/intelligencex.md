+++
title = "Intelligence X"
weight = 29
[extra]
category = "global"
type = "breach"
module = "IntelligenceX"
description = "Search engine and archive for leaked data, dark web content, and historical web snapshots"
has_api = true
url = "https://intelx.io"
rate_limit = "10 req/day (free), 10000 req/day (professional), unlimited (enterprise)"
capabilities = ["Leak Search", "Dark Web Archive", "Paste Search", "Domain Intelligence", "Email Search", "Phone Search", "Bitcoin Address Search", "IBAN Search", "Historical Data", "Phonebook API"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1156
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Intelligence", "Search", "osint", "global", "Prismatic Platform", "Description", "Email", "Indefinite"]
tags = ["osint", "global", "intelligence-x", "prismatic"]
quality_score = 75
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Intelligence X - Prismatic Platform"
+++

## Overview

Intelligence X is a unique search engine and data archive that preserves and indexes content from the dark web, data leaks, paste sites, and other hard-to-reach sources that are typically ephemeral. Founded in Prague, Czech Republic, Intelligence X operates one of the most comprehensive archives of leaked data, dark web marketplace content, and historically significant datasets available to legitimate security researchers and investigators.

Unlike conventional search engines, Intelligence X indexes content that other platforms deliberately exclude: leaked databases, dark web forums, ransomware gang leak sites, paste dumps, and government document leaks. The platform maintains historical snapshots, meaning that even after content is removed from its original source, Intelligence X preserves it for legitimate investigation purposes. This archival philosophy creates a unique intelligence resource that captures the Internet's dark underbelly before it disappears.

The platform's Czech origin gives it a distinctive position in the global intelligence landscape. Operating under European data protection frameworks while maintaining archives of leaked data requires careful legal and ethical navigation. Intelligence X restricts access to verified security researchers, law enforcement, and enterprise security teams, implementing usage policies that balance intelligence value against privacy concerns.

Within the Prismatic Platform, Intelligence X serves as the deep intelligence layer for the [OSINT Core](@/apps/prismatic-osint-core.md) investigation framework, providing access to dark web and leak data that surface-level tools like [Have I Been Pwned](@/osint/haveibeenpwned.md) and [DeHashed](@/osint/dehashed.md) cannot reach.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Data Leaks** | Indexed content from major data breaches and leaks |
| **Dark Web** | Archived Tor hidden service content (marketplaces, forums) |
| **Paste Sites** | Pastebin, Ghostbin, and other paste platform content |
| **Public Records** | Government documents, court records, regulatory filings |
| **[Whois](@/glossary/whois.md) History** | Historical WHOIS records for domains |
| **DNS Records** | Current and historical DNS configurations |
| **Cryptocurrency** | Bitcoin and other cryptocurrency address tracking |
| **Email Intelligence** | Email appearances across indexed sources |
| **Phone Intelligence** | Phone number appearances in leaked datasets |
| **IBAN/Financial** | Banking identifiers in leaked financial data |

### Archive Persistence Model

Intelligence X archives data with immutable timestamps and provenance tracking:

| Preservation Type | Description | Retention |
|------------------|-------------|-----------|
| **Dark web snapshots** | Tor hidden service content preserved even after takedown | Indefinite |
| **Paste content** | Paste site content archived before deletion | Indefinite |
| **Leak data** | Indexed breach data with provenance metadata | Per policy |
| **Historical web** | Web snapshots for investigation timelines | Indefinite |
| **WHOIS history** | Domain registration changes over time | Indefinite |
| **DNS history** | DNS record changes for domain intelligence | Indefinite |

### Source Categories and Buckets

Intelligence X organizes archived content into distinct buckets that indicate the origin and nature of the data:

| Bucket | Description | Sensitivity | Typical Content |
|--------|-------------|------------|----------------|
| **Leaks** | Content from data breaches and unauthorized disclosures | High | Databases, credentials, documents |
| **Darknet** | Archived Tor hidden service content | Very High | Marketplace listings, forum posts |
| **Pastes** | Content from paste sites (Pastebin, Ghostbin, etc.) | Medium | Code, credentials, data dumps |
| **Public** | Government documents, court records, public filings | Low | Legal documents, registrations |
| **WHOIS** | Historical WHOIS registration data | Low | Domain ownership history |
| **Dumpster** | Content from URL shorteners and file sharing services | Medium | Shared files, shortened URLs |

## Integration with Prismatic

Intelligence X provides deep intelligence capabilities for the Prismatic investigation pipeline, complementing surface-level breach tools like [Have I Been Pwned](@/osint/haveibeenpwned.md) and [DeHashed](@/osint/dehashed.md).

```elixir
# Search for any term across all indexed sources
{:ok, results} = IntelligenceX.search("example.com")
# => %{
#   id: "search_id_abc123",
#   status: 0,
#   records: [
#     %{type: "dataleak", name: "example_com_leak_2023.sql",
#       date: ~U[2023-06-15 00:00:00Z], bucket: "leaks",
#       media: 24, size: 15_000_000},
#     %{type: "paste", name: "Pastebin paste abc123",
#       date: ~U[2024-01-20 14:30:00Z], bucket: "pastes"},
#     %{type: "darknet", name: "Ransomware Blog Post - Example Corp",
#       date: ~U[2024-03-05 00:00:00Z], bucket: "darknet"}
#   ]
# }

# Search specifically for an email
{:ok, results} = IntelligenceX.search("user@example.com", type: :email)

# Search for cryptocurrency address
{:ok, results} = IntelligenceX.search("bc1qxy2kgdygjrsqtzq2n0yrf...", type: :bitcoin)

# Search phone number
{:ok, results} = IntelligenceX.search("+420123456789", type: :phone)

# Phonebook API (discover subdomains, emails, URLs)
{:ok, phonebook} = IntelligenceX.phonebook("example.com", target: :domain)
# => %{selectors: ["www.example.com", "api.example.com", "staging.example.com"]}

{:ok, emails} = IntelligenceX.phonebook("example.com", target: :email)
# => %{selectors: ["admin@example.com", "info@example.com"]}

# Get file preview from search result
{:ok, preview} = IntelligenceX.get_preview(result_id, storage_id)

# Get search statistics
{:ok, stats} = IntelligenceX.stats()

# Search by IBAN (financial investigation)
{:ok, results} = IntelligenceX.search("CZ6508000000192000145399", type: :iban)

# Search with date filtering
{:ok, results} = IntelligenceX.search("target@company.com",
  type: :email,
  date_from: ~U[2024-01-01 00:00:00Z],
  date_to: ~U[2024-12-31 23:59:59Z]
)
```

### Deep Investigation Pipeline

The deep investigation pipeline combines Intelligence X archival data with surface-level breach sources for comprehensive exposure assessment:

```elixir
defmodule PrismaticOsint.Investigation.DeepIntelligence do
  @moduledoc """
  Deep intelligence gathering using Intelligence X's dark web
  and leak archives combined with surface-level OSINT sources.
  """

  def deep_investigate(target) do
    with {:ok, intelx} <- IntelligenceX.search(target),
         {:ok, dehashed} <- DeHashed.search(email: target),
         {:ok, hibp} <- Hibp.check_email(target),
         {:ok, phonebook} <- IntelligenceX.phonebook(target, target: :email) do
      {:ok, %{
        target: target,
        surface_exposure: %{
          hibp_breaches: length(hibp),
          dehashed_records: dehashed.total
        },
        deep_exposure: %{
          leak_mentions: count_by_type(intelx.records, "dataleak"),
          dark_web_mentions: count_by_type(intelx.records, "darknet"),
          paste_mentions: count_by_type(intelx.records, "paste")
        },
        associated_emails: phonebook.selectors,
        timeline: build_exposure_timeline(intelx.records),
        risk_level: assess_deep_risk(intelx, dehashed, hibp)
      }}
    end
  end

  defp assess_deep_risk(intelx, dehashed, hibp) do
    dark_web = count_by_type(intelx.records, "darknet")
    leaks = count_by_type(intelx.records, "dataleak")

    cond do
      dark_web > 0 -> :critical
      leaks > 3 -> :high
      length(hibp) > 5 -> :high
      dehashed.total > 0 -> :medium
      true -> :low
    end
  end
end
```

### Ransomware Leak Monitoring

Intelligence X archives ransomware gang leak sites, enabling proactive monitoring for organizational data exposure:

```elixir
defmodule PrismaticPerimeter.Intelligence.RansomwareMonitor do
  @moduledoc """
  Monitors Intelligence X for organizational mentions on
  ransomware leak sites and dark web forums.
  """

  def monitor_for_leaks(organization_name, domain) do
    searches = [
      IntelligenceX.search(organization_name, bucket: :darknet),
      IntelligenceX.search(domain, bucket: :darknet),
      IntelligenceX.search(domain, bucket: :leaks)
    ]

    results = Enum.map(searches, fn
      {:ok, result} -> result.records
      {:error, _} -> []
    end)
    |> List.flatten()
    |> Enum.uniq_by(& &1.id)

    {:ok, %{
      organization: organization_name,
      domain: domain,
      total_dark_web_mentions: length(results),
      ransomware_mentions: filter_ransomware(results),
      leak_timeline: build_timeline(results),
      alert_level: determine_alert_level(results)
    }}
  end
end
```

### Search Selector Types

Intelligence X accepts multiple search selector types, each mapped to specialized indexing:

| Selector | Description | Example |
|----------|-------------|---------|
| **Email** | Email address search across all sources | `user@example.com` |
| **Domain** | Domain name and subdomain discovery | `example.com` |
| **URL** | Specific URL appearances in indexed data | `https://example.com/path` |
| **IP** | IP address appearances in leaks and logs | `1.2.3.4` |
| **CIDR** | IP range search | `1.2.3.0/24` |
| **Phone** | Phone number in international format | `+420123456789` |
| **Bitcoin** | Bitcoin address tracking | `bc1qxy2kgdygjrsqtzq2n0yrf...` |
| **IBAN** | International bank account number | `CZ6508000000192000145399` |
| **Simhash** | Content similarity search | Similarity matching |
| **PGP Key** | PGP public key fingerprint | Key fingerprint hex |

## Phonebook API

The Phonebook API is a distinct Intelligence X capability that provides fast enumeration of subdomains, email addresses, and URLs associated with a target domain. Unlike the main search API, the Phonebook operates on a pre-computed index for near-instant results:

| Target Type | Description | Use Case |
|------------|-------------|----------|
| **Domains** | Subdomain enumeration from historical data | Attack surface discovery |
| **Emails** | Email addresses associated with the domain | Contact discovery |
| **URLs** | Historical URLs under the domain | Content discovery |

The Phonebook API is particularly valuable for the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) asset discovery workflow, as it reveals subdomains and email addresses from historical leak data that may not appear in current DNS records or certificate transparency logs.

## Rate Limits and Access

| Tier | Searches/Day | Features | Price |
|------|-------------|----------|-------|
| **Free** | 10 | Basic search, limited results | Free |
| **Professional** | 10,000 | Full search, phonebook, statistics | Paid |
| **Enterprise** | Unlimited | Real-time API, bulk exports, custom retention | Custom |

### Authentication

API key required via `x-key` header. Free tier provides limited access. Professional and enterprise tiers unlock full capabilities including the Phonebook API and bulk export.

### Legal and Ethical Considerations

Intelligence X data includes sensitive leaked information. Usage must comply with applicable data protection laws including GDPR. Access is provided for legitimate security research, journalism, law enforcement, and enterprise security purposes. The platform maintains audit logs of all searches and may terminate access for policy violations.

| Consideration | Requirement |
|--------------|-------------|
| **Authorized purpose** | Security research, law enforcement, enterprise security |
| **Data handling** | GDPR compliance for personal data in results |
| **Audit trail** | All searches logged and auditable |
| **Redistribution** | Prohibited without explicit authorization |
| **Retention** | Cached results subject to data minimization |

## Use Cases

### Corporate Threat Assessment
- Discover if organizational data has appeared on dark web leak sites or ransomware blogs
- Monitor ransomware gang blogs for mentions of client organizations
- Feed deep intelligence into [Perimeter](@/apps/prismatic-perimeter.md) [security rating](@/glossary/security-rating.md)s
- Track credential exposure beyond what surface-level tools detect

### Investigation and Attribution
- Trace cryptocurrency transactions associated with threat actors
- Search dark web forums for mentions of specific targets or campaigns
- Cross-reference with [OFAC](@/osint/ofac.md) and [EU Sanctions](@/osint/eu-sanctions.md) for sanctioned entity investigations
- Build comprehensive exposure timelines from multiple data sources

### Data Breach Response
- Determine the scope and content of leaked data after a breach
- Identify where leaked data has been redistributed across dark web and paste sites
- Correlate with [DeHashed](@/osint/dehashed.md) and [Have I Been Pwned](@/osint/haveibeenpwned.md) for comprehensive exposure assessment
- Monitor for secondary distribution of stolen data

### Subdomain and Email Discovery
- Enumerate subdomains from historical leak data that may not appear in DNS
- Discover email addresses associated with a target domain from leak archives
- Feed discovered assets into the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) attack surface inventory
- Complement [crt.sh](@/osint/crtsh.md) and [SecurityTrails](@/osint/securitytrails.md) for comprehensive discovery

### Financial Investigation
- Search for IBAN and bank account numbers in leaked financial data
- Track cryptocurrency wallet addresses across dark web transactions
- Correlate financial identifiers with entity intelligence from [ARES](@/osint/ares.md)
- Support AML investigations with deep financial intelligence

## Related Sources

- [DeHashed](@/osint/dehashed.md) - Credential exposure from breach databases
- [Have I Been Pwned](@/osint/haveibeenpwned.md) - Breach notification and domain exposure
- [Hunter.io](@/osint/hunter.md) - Email discovery for exposure monitoring scope
- [VirusTotal](@/osint/virustotal.md) - Malware analysis for leaked file verification
- [OFAC](@/osint/ofac.md) - Sanctions list cross-referencing for financial investigations
- [EU Sanctions](@/osint/eu-sanctions.md) - EU restrictive measures for compliance checks
- [Chainalysis](@/osint/chainalysis.md) - Cryptocurrency tracing for financial investigations

## Related Platform Components

- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Deep intelligence in [EASM](@/glossary/easm.md) ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)