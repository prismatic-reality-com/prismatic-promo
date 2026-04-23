+++
title = "Hunter.io"
weight = 30
[extra]
icon = "envelope"
color = "cyan"
category = "global"
type = "email"
module = "HunterIo"
source_type = "email"
description = "Email finding and verification platform - discover and validate professional email addresses"
has_api = true
url = "https://hunter.io"
rate_limit = "Free: 25 req/mo, Starter: 500/mo, Growth: 5000/mo"
capabilities = ["Domain Email Search", "Email Finder", "Email Verification", "Company Email Patterns", "Author Finder", "Bulk Verification"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1406
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Hunterio", "Email", "osint", "global", "Prismatic Platform", "Hunter", "LinkedIn"]
tags = ["osint", "global", "hunterio", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Hunter.io - Prismatic Platform"
+++

## Overview

Hunter.io is a leading email intelligence platform that discovers and verifies professional email addresses associated with companies and domains. It crawls billions of web pages, indexes email addresses found in public sources, and identifies the email naming patterns used by organizations. Hunter.io is widely used in sales, recruiting, and [OSINT](@/glossary/osint.md) investigations to find contact information for specific individuals at target organizations.

For OSINT analysts, Hunter.io provides a fast path to identifying individuals within an organization, mapping organizational communication patterns, and verifying the deliverability of discovered email addresses before using them in social engineering assessments or contact attempts. The platform processes over 300 million professional email addresses and serves as an essential component in any reconnaissance toolkit focused on human intelligence targets.

Hunter.io distinguishes itself from generic email search tools through its focus on professional context. Each discovered email address comes with metadata about the source where it was found, the person's job title and department, and a confidence score indicating how likely the address is to be valid. This contextual enrichment transforms raw email addresses into actionable intelligence about organizational structure and personnel.

## Data Sources and Coverage

Hunter.io aggregates email data from multiple publicly accessible sources across the internet. Understanding these sources helps analysts assess the completeness and freshness of returned data.

| Source Category | Description | Coverage |
|----------------|-------------|----------|
| **Company Websites** | Crawled corporate sites including team pages, about pages, and contact directories | Global, 50M+ domains |
| **Social Media Profiles** | Professional profiles on LinkedIn, Twitter, GitHub with publicly visible emails | Major platforms |
| **Press Releases** | News wires, PR distribution sites, media mentions | English, major EU languages |
| **Government Filings** | SEC filings, patent applications, regulatory submissions with email contacts | US, EU primarily |
| **Conference Proceedings** | Speaker lists, attendee directories, academic papers | Tech, business conferences |
| **Job Postings** | Hiring manager emails from job boards and career pages | Global job platforms |
| **DNS and WHOIS** | Domain registration records with administrative and technical contacts | All gTLDs and ccTLDs |

The platform re-crawls sources regularly to maintain freshness, but analysts should be aware that discovered emails may be stale. The confidence score partially reflects recency -- recently observed emails receive higher confidence ratings than those seen only in older crawls.

## API Integration

Hunter.io provides a well-documented [REST API](@/glossary/rest-api.md) at `https://api.hunter.io/v2/` with JSON responses. Authentication is via API key passed as a query parameter.

### API Endpoints

| Endpoint | Method | Description | Credits |
|----------|--------|-------------|---------|
| `/domain-search` | GET | Find all emails for a domain | 1 per 10 results |
| `/email-finder` | GET | Find email for a specific person at a domain | 1 |
| `/email-verifier` | GET | Verify deliverability of a single email | 1 |
| `/email-count` | GET | Count emails for a domain (free, no credits) | 0 |
| `/account` | GET | Account information and usage | 0 |
| `/leads` | GET/POST | Manage leads database | 0 |
| `/leads_lists` | GET/POST | Manage lead lists | 0 |
| `/campaigns` | GET/POST | Email campaign management | 0 |

### Rate Limits by Plan

| Plan | Searches/Month | Verifications/Month | Price |
|------|---------------|---------------------|-------|
| Free | 25 | 50 | $0 |
| Starter | 500 | 1,000 | $49/mo |
| Growth | 5,000 | 10,000 | $149/mo |
| Business | 30,000 | 60,000 | $499/mo |
| Enterprise | Custom | Custom | Custom |

## Query Examples

### curl Examples

```bash
# Domain search - find all emails at a company
curl "https://api.hunter.io/v2/domain-search?domain=example.com&api_key=YOUR_KEY"

# Email finder - predict email for a specific person
curl "https://api.hunter.io/v2/email-finder?domain=example.com&first_name=John&last_name=Smith&api_key=YOUR_KEY"

# Email verification - check deliverability
curl "https://api.hunter.io/v2/email-verifier?email=john.smith@example.com&api_key=YOUR_KEY"

# Email count - free endpoint, no credits consumed
curl "https://api.hunter.io/v2/email-count?domain=example.com&type=personal"

# Domain search with department filter
curl "https://api.hunter.io/v2/domain-search?domain=example.com&department=executive&api_key=YOUR_KEY"

# Domain search with specific result limit
curl "https://api.hunter.io/v2/domain-search?domain=example.com&limit=50&offset=0&api_key=YOUR_KEY"
```

### Elixir Integration

```elixir
# Domain email search with full metadata
{:ok, results} = PrismaticOsint.HunterIo.domain_search("example.com",
  department: "executive",
  limit: 100
)
# => %{
#   domain: "example.com",
#   pattern: "{first}.{last}",
#   emails: [
#     %{value: "john.smith@example.com", type: "personal",
#       confidence: 95, first_name: "John", last_name: "Smith",
#       position: "CTO", department: "engineering",
#       sources: [%{uri: "https://...", extracted_on: "2025-06-15"}]}
#   ]
# }

# Find specific person's email
{:ok, email} = PrismaticOsint.HunterIo.email_finder("example.com",
  first_name: "Jane",
  last_name: "Doe"
)
# => %{email: "jane.doe@example.com", score: 92, position: "CFO"}

# Bulk verification pipeline
emails = ["a@example.com", "b@example.com", "c@example.com"]
results = PrismaticOsint.HunterIo.bulk_verify(emails)
# => [%{email: "a@example.com", status: "valid", score: 98}, ...]

# Enrich discovered email with cross-source correlation
{:ok, enriched} = PrismaticOsint.Pipeline.enrich_email("john@example.com",
  sources: [:hunter_io, :haveibeenpwned, :pulsedive]
)
```

## Data Schema

Each email result from Hunter.io follows a structured schema that the Prismatic adapter normalizes into the platform's entity model.

| Field | Type | Description |
|-------|------|-------------|
| `value` | string | The email address |
| `type` | enum | `personal` or `generic` (info@, support@, etc.) |
| `confidence` | integer | 0-100 confidence score |
| `first_name` | string | Person's first name (if known) |
| `last_name` | string | Person's last name (if known) |
| `position` | string | Job title or position |
| `seniority` | enum | `junior`, `senior`, `executive` |
| `department` | enum | `executive`, `engineering`, `finance`, `hr`, `marketing`, `sales`, `support`, `communication`, `legal` |
| `linkedin` | string | LinkedIn profile URL (if found) |
| `twitter` | string | Twitter handle (if found) |
| `phone_number` | string | Direct phone number (if found) |
| `sources` | array | Web pages where the email was discovered |
| `verification.status` | enum | `valid`, `invalid`, `accept_all`, `webmail`, `disposable`, `unknown` |
| `verification.score` | integer | Deliverability score 0-100 |

## Use Cases

### Reconnaissance and Target Identification

During authorized penetration tests or red team exercises, Hunter.io enables rapid identification of personnel at target organizations. By mapping email patterns and personnel, analysts build a comprehensive picture of who works where and how to reach them. This intelligence feeds social engineering assessments and phishing simulations.

### Organizational Structure Mapping

Email naming patterns reveal organizational structure. When combined with department and seniority metadata, analysts can reconstruct reporting hierarchies, identify decision makers, and understand departmental boundaries -- all from publicly observable email data.

### Breach Correlation

Discovered emails can be cross-referenced with breach databases like [Have I Been Pwned](@/osint/haveibeenpwned.md) to assess an organization's exposure. Employees with breached credentials represent potential initial access vectors that should be flagged during security assessments.

### Supply Chain Intelligence

By analyzing email patterns across partner organizations, analysts map business relationships and supply chain dependencies. Shared email domains, cross-company references, and forwarding patterns reveal organizational boundaries and inter-company communication channels.

### Executive Exposure Monitoring

Continuous monitoring of executive email addresses across breach databases, paste sites, and dark web marketplaces provides early warning of credential compromise affecting high-value targets.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Public sources only** | Cannot discover emails never published publicly | Combine with pattern prediction and LinkedIn OSINT |
| **Confidence != accuracy** | High confidence emails may still be invalid | Always verify before use with the verification endpoint |
| **Generic email filtering** | Generic addresses (info@, support@) mixed with personal | Use `type=personal` filter in API queries |
| **Stale data** | Some indexed emails may belong to former employees | Cross-reference with current LinkedIn profiles |
| **Limited to professional email** | Personal Gmail/Outlook addresses not covered | Supplement with social media OSINT tools |
| **Rate limits on free tier** | 25 searches/month severely limits investigation scope | Implement caching and quota management |
| **GDPR redacted WHOIS** | European domain contacts increasingly hidden | Use technical contacts and alternative discovery methods |

## Legal and Ethical Considerations

Hunter.io collects data exclusively from publicly accessible sources, which generally places its use within legal bounds under most jurisdictions. However, analysts must consider several important factors.

**GDPR Compliance**: Under the EU General Data Protection Regulation, email addresses constitute personal data. Collecting and processing them requires a lawful basis. Hunter.io maintains GDPR compliance by sourcing from public pages, but downstream use by investigators must also have lawful basis -- typically legitimate interest for security research or contractual obligation for authorized assessments.

**Authorized Use Only**: Email addresses discovered through Hunter.io should only be used for purposes authorized by the investigation scope. Sending unsolicited communications, credential stuffing, or harassment based on discovered emails violates both Hunter.io's terms of service and applicable law.

**Data Retention**: Investigators should establish clear data retention policies for discovered email data. Personal data that is no longer needed for the stated purpose should be securely deleted.

**Scope Limitations**: During penetration testing or red team exercises, ensure that email discovery and any subsequent social engineering activities fall within the scope defined in the rules of engagement.

## Integration with Prismatic Platform

Within the [Prismatic Platform](@/apps/prismatic.md), Hunter.io serves as the primary email intelligence provider in the OSINT pipeline. The `PrismaticOsint.HunterIo` adapter handles authentication, rate limiting, caching, and result normalization.

Key integration features include:

- **Quota Management**: The adapter tracks API credit consumption across concurrent investigations and implements fair-share allocation to prevent any single investigation from exhausting monthly quotas.
- **Result Caching**: Verified email results are cached with configurable TTL (default 7 days) to minimize redundant API calls and preserve rate limits for new queries.
- **Cross-Source Enrichment**: Discovered emails are automatically enriched through Have I Been Pwned breach checks, [Pulsedive](@/osint/pulsedive.md) threat intelligence lookups, and social media profile correlation.
- **Entity Graph Integration**: Email addresses, associated persons, and organizations are modeled as entities in the platform's [knowledge graph](@/glossary/knowledge-graph.md), enabling relationship discovery across investigations.
- **Batch Processing**: The adapter supports bulk operations for large-scale domain surveys, managing rate limits and retries transparently.

## Best Practices

1. **Start with email count**: Use the free `/email-count` endpoint before consuming credits on domain searches. This reveals whether Hunter.io has meaningful coverage for your target domain.

2. **Filter by department**: When investigating specific roles, use department filters to focus results and conserve credits.

3. **Verify before use**: Always run discovered emails through the verification endpoint before incorporating them into reports or using them in authorized testing.

4. **Pattern prediction**: Learn the organization's email pattern (e.g., `first.last@domain.com`) to predict addresses for known employees, then verify the prediction.

5. **Cross-reference sources**: Validate Hunter.io findings against LinkedIn, company websites, and other OSINT sources to confirm currency and accuracy.

6. **Cache aggressively**: Domain search results remain valid for days to weeks. Cache results to maximize the value of each API credit.

7. **Monitor rate limits**: Track the `X-RateLimit-Remaining` response header to avoid hitting limits during time-sensitive investigations.

8. **Document provenance**: Record the source URL and extraction date for each discovered email to maintain audit trails required by investigation standards.

## Related Providers

- [Have I Been Pwned](@/osint/haveibeenpwned.md) - Check discovered emails against breach databases
- [SecurityTrails](@/osint/securitytrails.md) - DNS data for domain intelligence
- [BuiltWith](@/osint/builtwith.md) - Technology profiling for target domains
- [Shodan](@/osint/shodan.md) - Infrastructure intelligence for target organizations
- [DNSdumpster](@/osint/dnsdumpster.md) - DNS reconnaissance for domain mapping
- [Pulsedive](@/osint/pulsedive.md) - Threat intelligence enrichment for discovered indicators
- [Intelligence X](@/osint/intelx.md) - Dark web and leak search for email exposure

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)