+++
title = "Have I Been Pwned"
weight = 12
[extra]
category = "global"
type = "breach"
module = "Hibp"
description = "Comprehensive breach detection service tracking billions of compromised accounts"
has_api = true
url = "https://haveibeenpwned.com"
rate_limit = "10 req/min (API key required for email search)"
capabilities = ["Breach Search", "Password Exposure Check", "Domain Search", "Paste Monitoring", "Breach Notification", "Data Class Analysis"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 814
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Pwned", "Comprehensive", "osint", "global", "Prismatic Platform", "HIBP", "Medium", "Description"]
tags = ["osint", "global", "have-i-been-pwned", "prismatic"]
quality_score = 75
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Have I Been Pwned - Prismatic Platform"
+++

## Overview

Have I Been Pwned (HIBP), created by security researcher Troy Hunt, is the world's largest aggregator of data breach information. The service tracks billions of compromised accounts across thousands of data breaches, allowing individuals and organizations to check whether their email addresses, passwords, or domains have appeared in known breaches.

HIBP is an essential component of any due diligence, compliance, or security posture assessment workflow. It provides critical insight into credential exposure that directly impacts organizational risk. The service has been adopted by government agencies, financial institutions, and enterprises worldwide as a standard component of their security monitoring infrastructure.

HIBP's data is sourced from publicly disclosed breaches, paste sites, and data dumps. Each breach is verified by Troy Hunt before inclusion, ensuring data quality and accuracy. The service distinguishes between verified breaches, unverified data dumps, and paste content, providing context that allows investigators to assess the reliability of exposure data.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Breached Accounts** | 13+ billion compromised accounts indexed |
| **Breach Sources** | 700+ distinct breach events cataloged |
| **Data Classes** | Email, password, name, phone, address, IP, etc. |
| **Pastes** | Compromised data found on paste sites (Pastebin, etc.) |
| **Passwords** | 800M+ unique passwords from breaches (k-anonymity) |
| **Domain Exposure** | All breached accounts for a given domain |

### Breach Intelligence

Each indexed breach includes rich metadata enabling detailed analysis:

| Metadata Field | Description |
|---------------|-------------|
| **Breach Date** | When the breach actually occurred |
| **Discovery Date** | When the breach was publicly disclosed |
| **Account Count** | Total number of compromised accounts |
| **Data Classes** | Specific data types exposed (passwords, names, etc.) |
| **Verification** | Whether the breach data has been verified |
| **Sensitivity** | Flag for sensitive breaches (adult sites, etc.) |
| **Fabricated** | Whether the breach data is known fabricated |
| **Retired** | Whether the breach source has been removed |

### Data Classes Taxonomy

HIBP tracks a comprehensive taxonomy of data types that appear in breaches:

| Data Class | Severity | Impact |
|-----------|----------|--------|
| **Passwords** | Critical | Direct account compromise risk |
| **Password Hints** | High | Facilitates password guessing |
| **Email Addresses** | Medium | Enables phishing targeting |
| **Phone Numbers** | Medium | Enables SIM swapping, vishing |
| **Physical Addresses** | Medium | Physical security concern |
| **IP Addresses** | Low | Limited attribution value |
| **Dates of Birth** | Medium | Identity theft enablement |
| **Credit Cards** | Critical | Direct financial fraud risk |
| **Government IDs** | Critical | Identity theft enablement |

## Integration with Prismatic

HIBP integrates with the Prismatic platform for automated breach exposure monitoring, compliance assessments, and [security rating](@/glossary/security-rating.md) calculations.

```elixir
# Check if an email appears in any breach
{:ok, breaches} = Hibp.check_email("user@example.com")
# => [
#   %{name: "Adobe", breach_date: ~D[2013-10-04], data_classes: ["emails", "passwords"]},
#   %{name: "LinkedIn", breach_date: ~D[2012-05-05], data_classes: ["emails", "passwords"]}
# ]

# Check if a password has been exposed (uses k-anonymity - password never sent)
{:ok, exposure} = Hibp.check_password("hunter2")
# => %{exposed: true, count: 17_043}

# Get all breaches for a domain
{:ok, domain_breaches} = Hibp.domain_search("example.com")
# => %{
#   breaches: [...],
#   total_exposed_accounts: 247,
#   unique_breaches: 5,
#   data_classes_exposed: ["emails", "passwords", "names", "phone_numbers"]
# }

# Get breach details
{:ok, breach} = Hibp.get_breach("Adobe")

# List all breaches in the database
{:ok, all_breaches} = Hibp.list_breaches()

# Check for pastes containing an email
{:ok, pastes} = Hibp.check_pastes("user@example.com")
```

### Compliance and Due Diligence Pipeline

HIBP data feeds directly into the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) module for security posture assessment.

```elixir
defmodule PrismaticPerimeter.Assessment.BreachExposure do
  @moduledoc """
  Assesses organization breach exposure for security ratings.
  """

  def assess_domain(domain) do
    with {:ok, breaches} <- Hibp.domain_search(domain),
         {:ok, score} <- calculate_breach_risk_score(breaches) do
      {:ok, %{
        domain: domain,
        risk_score: score,
        total_exposed: breaches.total_exposed_accounts,
        breach_count: breaches.unique_breaches,
        most_recent: most_recent_breach(breaches),
        credential_exposure: has_password_exposure?(breaches),
        recommendation: generate_recommendation(score)
      }}
    end
  end

  defp calculate_breach_risk_score(breaches) do
    base_score = 100 - min(breaches.total_exposed_accounts / 10, 60)
    recency_penalty = recency_factor(breaches)
    credential_penalty = if has_password_exposure?(breaches), do: 15, else: 0
    {:ok, max(base_score - recency_penalty - credential_penalty, 0)}
  end
end
```

### Executive Exposure Monitoring

For high-value targets such as C-suite executives, HIBP breach data is combined with email discovery to create executive exposure reports:

```elixir
defmodule PrismaticPerimeter.Assessment.ExecutiveExposure do
  @moduledoc """
  Monitors breach exposure for key organizational personnel.
  """

  def monitor_executives(domain) do
    with {:ok, hunter} <- Hunter.domain_search(domain),
         executives <- filter_executives(hunter.emails),
         {:ok, exposure} <- batch_check_emails(executives) do
      {:ok, %{
        domain: domain,
        executives_checked: length(executives),
        executives_exposed: Enum.count(exposure, & &1.breached),
        critical_exposures: filter_credential_exposure(exposure),
        recommendations: generate_executive_recommendations(exposure)
      }}
    end
  end
end
```

## Privacy Architecture

### k-Anonymity Password Model

The Pwned Passwords API uses a k-anonymity model that ensures the full password hash is never transmitted:

| Step | Description |
|------|-------------|
| 1. | Client hashes the password using SHA-1 |
| 2. | Client sends only the first 5 characters of the hash |
| 3. | API returns all hash suffixes matching the prefix (~500 results) |
| 4. | Client checks locally if the full hash appears in the results |
| 5. | The full hash never leaves the client |

This architecture means HIBP can never determine which password was being checked, even if API traffic were intercepted. The same model is used by organizations integrating password checks into registration and authentication flows.

### Domain Search Authorization

Domain searches require proof of domain ownership (verified via DNS TXT record or email verification), ensuring that only authorized personnel can view the full breach exposure for a domain.

## Rate Limits and Access

| Tier | Rate Limit | Features |
|------|-----------|----------|
| **Password API** | No limit | k-anonymity password check (free, no key) |
| **Breach API** | 10 req/min | Email breach lookup (API key required) |
| **Domain Search** | 10 req/min | Domain-level breach data (subscription) |
| **Enterprise** | Custom | Bulk operations, webhook notifications |

### Authentication
The breach search API requires a paid API key. The Pwned Passwords API (k-anonymity model) is free and does not require authentication.

## Use Cases

### Security Posture Assessment
- Measure organizational breach exposure for [security ratings](@/apps/prismatic-perimeter.md)
- Track breach exposure trends over time
- Compare exposure against industry benchmarks
- Feed breach data into composite risk scores

### Compliance
- [GDPR](@/glossary/gdpr.md) breach notification requirement support
- [NIS2](@/glossary/nis2.md) security measure validation
- SOC 2 credential management evidence
- PCI DSS password security validation using Pwned Passwords

### Due Diligence
- Pre-acquisition target breach exposure assessment
- Vendor and third-party risk evaluation
- Executive exposure monitoring
- Ongoing monitoring for new breach disclosures affecting watched domains

### Incident Response
- Rapidly determine if leaked credentials belong to organizational accounts
- Correlate breach timing with observed unauthorized access
- Identify which data classes were exposed for targeted remediation
- Support password reset campaigns with exposure evidence

## Related Sources

- [DeHashed](@/osint/dehashed.md) - Credential-specific breach search
- [Intelligence X](@/osint/intelligencex.md) - Dark web and leak archive search
- [VirusTotal](@/osint/virustotal.md) - Malware and URL scanning for breach vector analysis
- [Shodan](@/osint/shodan.md) - Identify exposed services that may lead to breaches
- [URLScan](@/osint/urlscan.md) - Detect phishing pages targeting breached users
- [Hunter.io](@/osint/hunter.md) - Email discovery for breach exposure scope

## Related Platform Components

- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Breach data in [EASM](@/glossary/easm.md) security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)