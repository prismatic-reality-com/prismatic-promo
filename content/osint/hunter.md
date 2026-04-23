+++
title = "Hunter.io"
weight = 20
[extra]
category = "global"
type = "email"
module = "Hunter"
description = "Email finder and verification platform for professional outreach and OSINT enrichment"
has_api = true
url = "https://hunter.io"
rate_limit = "25 req/mo (free), 500/mo (starter), 10000/mo (business), 50000/mo (enterprise)"
capabilities = ["Email Finder", "Email Verification", "Domain Search", "Author Finder", "Bulk Verification", "Company Enrichment", "Lead Generation"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 733
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Hunterio", "Email", "OSINT", "global", "Prismatic Platform", "Been Pwned", "Server", "Identify", "Hunter"]
tags = ["osint", "global", "hunterio", "prismatic"]
quality_score = 65
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Hunter.io - Prismatic Platform"
+++

## Overview

Hunter.io is the leading email intelligence platform, enabling discovery and verification of professional email addresses associated with any domain. It crawls the web, indexing publicly available email addresses and their associated metadata, and uses pattern recognition to predict email formats for organizations. With over 100 million indexed email addresses, Hunter.io is a critical component of any email-based [OSINT](@/glossary/osint.md) workflow.

In the Prismatic Platform ecosystem, Hunter.io serves as the primary email discovery engine, feeding verified contact data into investigation pipelines, social engineering assessments, and organizational mapping workflows. It complements breach-focused tools like [Have I Been Pwned](@/osint/haveibeenpwned.md) by providing the discovery layer that identifies which email addresses exist for a target domain.

The platform's strength lies in its dual capability: discovery and verification. Discovery reveals the email landscape of an organization, while verification confirms deliverability through SMTP-level checks without sending actual messages. This combination ensures that downstream enrichment through [FullContact](@/osint/fullcontact.md) or breach checking through [Have I Been Pwned](@/osint/haveibeenpwned.md) operates on validated data.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Email Addresses** | Professional email addresses indexed from public web sources |
| **Email Patterns** | Organizational email format patterns (e.g., `{first}.{last}@domain.com`) |
| **Confidence Score** | 0-100% confidence that a discovered email is valid |
| **Sources** | URLs where each email address was found publicly |
| **Verification Status** | SMTP-level verification of email deliverability |
| **Department** | Organizational department classification (engineering, marketing, etc.) |
| **Position/Title** | Job title when available from source data |
| **Social Profiles** | LinkedIn and Twitter profiles associated with email addresses |

### Email Pattern Detection

Hunter.io identifies the email naming convention used by an organization and applies it to predict email addresses for known employees:

```
Organization: Example Corp (example.com)
Detected Pattern: {first}.{last}@example.com (87% confidence)
Known patterns: {first}{last}, {f}{last}, {first}_{last}, {first}
```

### Verification Result Categories

The SMTP-level verification process produces detailed results that go beyond simple valid/invalid:

| Status | Meaning | Reliability |
|--------|---------|------------|
| **deliverable** | Mailbox exists and accepts mail | High confidence |
| **undeliverable** | Mailbox does not exist | High confidence |
| **risky** | Exists but may bounce (catch-all, full inbox) | Medium confidence |
| **unknown** | Server did not provide definitive answer | Low confidence |
| **accept_all** | Server accepts all addresses (no verification possible) | Cannot determine |

## Integration with Prismatic

Hunter.io integrates with the [OSINT Core](@/apps/prismatic-osint-core.md) framework as the primary email discovery adapter, feeding into person enrichment, organizational mapping, and security assessment pipelines.

```elixir
# Search for all email addresses at a domain
{:ok, result} = Hunter.domain_search("example.com")
# => %{
#   domain: "example.com",
#   organization: "Example Corp",
#   pattern: "{first}.{last}",
#   emails: [
#     %{value: "john.doe@example.com", type: "personal", confidence: 95,
#       first_name: "John", last_name: "Doe", position: "CTO",
#       department: "engineering", sources: [%{uri: "https://...", ...}]},
#     ...
#   ],
#   total: 247
# }

# Find a specific person's email
{:ok, email} = Hunter.email_finder("example.com", first_name: "John", last_name: "Doe")
# => %{email: "john.doe@example.com", confidence: 92, sources: 3}

# Verify an email address (SMTP-level check)
{:ok, verification} = Hunter.verify("john.doe@example.com")
# => %{
#   result: "deliverable",
#   score: 95,
#   mx_records: true,
#   smtp_server: true,
#   smtp_check: true,
#   accept_all: false,
#   disposable: false,
#   webmail: false
# }

# Bulk verification
{:ok, batch} = Hunter.bulk_verify(["user1@example.com", "user2@example.com"])

# Get email count for a domain
{:ok, count} = Hunter.email_count("example.com")
# => %{total: 247, personal: 189, generic: 58}
```

### Organizational Mapping Pipeline

The organizational mapping pipeline combines Hunter.io email discovery with [FullContact](@/osint/fullcontact.md) enrichment to build complete organizational profiles from a single domain input.

```elixir
defmodule PrismaticOsint.Enrichment.OrganizationMapper do
  @moduledoc """
  Maps organizational structure using Hunter.io email discovery
  combined with FullContact person enrichment.
  """

  def map_organization(domain) do
    with {:ok, hunter_result} <- Hunter.domain_search(domain),
         {:ok, enriched} <- enrich_contacts(hunter_result.emails) do
      {:ok, %{
        domain: domain,
        organization: hunter_result.organization,
        email_pattern: hunter_result.pattern,
        departments: group_by_department(enriched),
        key_personnel: identify_key_personnel(enriched),
        total_discovered: hunter_result.total
      }}
    end
  end

  defp enrich_contacts(emails) do
    emails
    |> Enum.map(fn email ->
      case FullContact.enrich_email(email.value) do
        {:ok, profile} -> Map.merge(email, profile)
        {:error, _} -> email
      end
    end)
    |> then(&{:ok, &1})
  end
end
```

### Breach Correlation Pipeline

Discovered emails are automatically cross-referenced with breach databases to identify compromised accounts within the target organization:

```elixir
defmodule PrismaticOsint.Investigation.BreachCorrelation do
  @moduledoc """
  Correlates Hunter.io discovered emails with breach databases
  to assess organizational credential exposure.
  """

  def correlate_breaches(domain) do
    with {:ok, hunter} <- Hunter.domain_search(domain),
         {:ok, results} <- check_breaches(hunter.emails) do
      {:ok, %{
        domain: domain,
        total_emails: hunter.total,
        emails_breached: Enum.count(results, & &1.breached),
        breach_rate: Enum.count(results, & &1.breached) / max(hunter.total, 1),
        critical_exposures: filter_critical(results),
        breach_timeline: build_timeline(results),
        recommendations: generate_recommendations(results)
      }}
    end
  end

  defp check_breaches(emails) do
    emails
    |> Task.async_stream(fn email ->
      case Hibp.check_email(email.value) do
        {:ok, breaches} -> %{email: email, breached: true, breaches: breaches}
        {:error, _} -> %{email: email, breached: false, breaches: []}
      end
    end, max_concurrency: 5, timeout: 10_000)
    |> Enum.map(fn {:ok, result} -> result end)
    |> then(&{:ok, &1})
  end
end
```

## Email Security Analysis

Hunter.io verification results include signals that inform email security posture assessment:

| Signal | Assessment Value | Impact on Security Rating |
|--------|-----------------|--------------------------|
| **MX Records** | Domain has mail infrastructure | Baseline requirement |
| **SPF Record** | Sender authentication configured | Positive indicator |
| **Accept All** | Server accepts any address | Vulnerability to spoofing |
| **Disposable** | Using temporary email service | Risk indicator |
| **Webmail** | Using consumer email (Gmail, Yahoo) | Professionalism concern |
| **Catch-All** | Server accepts non-existent addresses | Spam/phishing vulnerability |

## Rate Limits and Access

| Tier | Searches/Month | Verifications/Month | Features |
|------|---------------|--------------------:|----------|
| **Free** | 25 | 50 | Basic search, single verification |
| **Starter** | 500 | 1,000 | Domain search, bulk tasks |
| **Growth** | 5,000 | 10,000 | Priority support, integrations |
| **Business** | 50,000 | 100,000 | Custom integrations, webhooks |

### Authentication
All API requests require an API key passed as a query parameter or `Authorization: Bearer` header. Free tier available with email registration.

## Use Cases

### Email-Based Reconnaissance
- Discover all publicly associated email addresses for a target domain
- Map organizational structure by department and seniority
- Identify email naming patterns for targeted phishing assessments
- Enumerate generic addresses (info@, support@, admin@) for service mapping

### Breach Correlation
- Cross-reference discovered emails with [Have I Been Pwned](@/osint/haveibeenpwned.md) breach data
- Identify compromised executive accounts for security posture assessment
- Feed verified emails into [DeHashed](@/osint/dehashed.md) for credential exposure checks
- Calculate organizational breach exposure rate (breached/total emails)

### Security Posture Assessment
- Measure email exposure surface for [Perimeter security ratings](@/apps/prismatic-perimeter.md)
- Identify over-exposed employee email addresses
- Validate email security configurations (SPF, DKIM, DMARC) via discovered patterns
- Assess accept-all and catch-all configurations as spoofing risk indicators

### Supply Chain Intelligence
- Map vendor and partner organizations through email discovery
- Identify shared personnel across organizational boundaries
- Track organizational growth through email count trends
- Verify claimed company size against discovered email volume

## Related Sources

- [Have I Been Pwned](@/osint/haveibeenpwned.md) - Check discovered emails against breach databases
- [EmailRep](@/osint/emailrep.md) - Reputation scoring for discovered email addresses
- [FullContact](@/osint/fullcontact.md) - Person enrichment from email addresses
- [DeHashed](@/osint/dehashed.md) - Credential exposure search for discovered emails
- [Intelligence X](@/osint/intelligencex.md) - Deep search for email appearances in leaked datasets
- [IPQualityScore](@/osint/ipqualityscore.md) - Email validation and fraud scoring

## Related Platform Components

- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Email exposure in [EASM](@/glossary/easm.md) security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)