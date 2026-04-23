+++
title = "EmailRep"
weight = 27
[extra]
category = "global"
type = "email"
module = "EmailRep"
description = "Email reputation and risk scoring API for fraud prevention and email intelligence"
has_api = true
url = "https://emailrep.io"
rate_limit = "No published limit (free), custom (enterprise)"
capabilities = ["Email Reputation Scoring", "Breach Detection", "Social Profile Discovery", "Domain Analysis", "Disposable Email Detection", "Email Age Estimation", "Fraud Risk Assessment", "Dark Web Presence"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1056
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["EmailRep", "Email", "osint", "global", "Prismatic Platform", "Compliant"]
tags = ["osint", "global", "emailrep", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "EmailRep - Prismatic Platform"
+++

## Overview

EmailRep (operated by Sublime Security) is a comprehensive email reputation intelligence API that aggregates signals from over 100 data sources to produce detailed reputation profiles for any queried email address. The service combines social media presence detection, breach database correlation, domain reputation analysis, dark web monitoring, and deliverability verification into a single API endpoint that returns both a categorical reputation score and a rich set of granular boolean indicators.

Founded as an open intelligence project, EmailRep was designed to answer a deceptively simple question: "Is this email address trustworthy?" The answer, however, requires synthesizing dozens of signals: Does the email appear in known data breaches? Does it have associated social media profiles indicating a real person? Is the domain a known disposable email provider? Has the email been spotted on dark web forums? Is the email infrastructure properly configured with SPF, DKIM, and DMARC? Has it been reported for spam or phishing activity? EmailRep aggregates all of these signals into a single API response.

The API returns not just a categorical reputation level (none, low, medium, high) but a detailed `details` object containing over 20 boolean and categorical fields. This granularity makes EmailRep valuable for multiple use cases: fraud prevention teams use the disposable email detection and reputation scoring; security operations centers use the phishing and malicious activity indicators; [OSINT](/glossary/osint/) investigators use the social profile discovery and breach correlation; and compliance teams use the overall reputation assessment for identity verification workflows.

Within the Prismatic Platform, EmailRep serves as the email reputation scoring engine, providing real-time risk signals to the [OSINT Core](/apps/prismatic-osint-core/) investigation pipeline, the [HAWKEYE](/apps/prismatic-hawkeye/) visitor intelligence system, and the [Email Intelligence Hub](/osint/email-intelligence/) aggregation layer.

## Data Sources and Coverage

EmailRep aggregates data from a diverse set of sources to construct reputation profiles. The specific sources are not individually disclosed, but the data categories and their signals are well-documented.

| Data Category | Signals | Description |
|---------------|---------|-------------|
| **Reputation Score** | none / low / medium / high | Categorical reputation classification |
| **Suspicious Flag** | Boolean | Aggregate suspicion indicator based on all signals |
| **References Count** | Integer | Number of source references found for this email |
| **Breach Data** | credentials_leaked, credentials_leaked_recent, data_breach | Breach exposure indicators |
| **Social Presence** | profiles[] | Detected social media accounts (LinkedIn, GitHub, Twitter, etc.) |
| **Domain Analysis** | domain_exists, domain_reputation, new_domain, days_since_creation | Domain health indicators |
| **Email Properties** | free_provider, disposable, accept_all, deliverable, valid_mx | Email infrastructure signals |
| **Security Config** | spoofable, spf_strict, dmarc_enforced | Email authentication configuration |
| **Malicious History** | blacklisted, malicious_activity, malicious_activity_recent, spam | Abuse indicators |
| **Dark Web** | dark_web_presence | Appearance in dark web datasets |
| **Temporal** | first_seen, last_seen | Email address age and activity window |

### Reputation Classification Logic

| Level | Criteria | Typical Profile |
|-------|----------|-----------------|
| **high** | Long history, multiple social profiles, clean record | Established professional email with verified identity |
| **medium** | Some social presence but limited history or minor flags | Active email with partial verification signals |
| **low** | Limited social presence, recent creation, or breach exposure | Newer email or email with negative indicators |
| **none** | No data available from any source | Brand new, disposable, or completely private email |

## Technical Architecture

EmailRep provides a simple REST API with a single primary endpoint. The API design prioritizes ease of integration with minimal request complexity.

### API Structure

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /query/{email}` | GET | Query email reputation |
| `POST /report/{email}` | POST | Report a malicious email |

### Request/Response Format

```
GET https://emailrep.io/query/user@example.com
Headers: Key: {api_key}, Accept: application/json

Response: {
  "email": "user@example.com",
  "reputation": "high",
  "suspicious": false,
  "references": 15,
  "details": {
    "blacklisted": false,
    "malicious_activity": false,
    "credentials_leaked": true,
    "data_breach": true,
    "first_seen": "2015-03-12",
    "last_seen": "2025-12-01",
    "domain_exists": true,
    "domain_reputation": "high",
    "free_provider": false,
    "disposable": false,
    "deliverable": true,
    "spoofable": false,
    "spf_strict": true,
    "dmarc_enforced": true,
    "profiles": ["linkedin", "github", "twitter"]
  }
}
```

## API Integration

```elixir
defmodule PrismaticOsint.Adapters.EmailRep do
  @moduledoc """
  EmailRep adapter for email reputation scoring, social profile
  discovery, and fraud risk assessment. Feeds into the Email
  Intelligence Hub and HAWKEYE visitor intelligence system.
  """

  @behaviour PrismaticOsint.Adapter

  @doc """
  Query email reputation with full details.
  """
  def query(email) do
    case api_get("/query/#{URI.encode(email)}") do
      {:ok, %{status: 200, body: body}} ->
        {:ok, %{
          email: body["email"],
          reputation: body["reputation"],
          suspicious: body["suspicious"],
          references: body["references"],
          details: normalize_details(body["details"]),
          queried_at: DateTime.utc_now()
        }}

      {:ok, %{status: 429}} ->
        {:error, :rate_limited}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Report a malicious email to the EmailRep database.
  """
  def report(email, opts) do
    tags = Keyword.get(opts, :tags, [])
    description = Keyword.get(opts, :description, "")

    api_post("/report/#{URI.encode(email)}", %{
      tags: tags,
      description: description,
      timestamp: DateTime.to_unix(DateTime.utc_now())
    })
  end

  @doc """
  Bulk reputation check for multiple emails.
  """
  def bulk_query(emails) do
    emails
    |> Task.async_stream(&query/1, max_concurrency: 3, timeout: 10_000)
    |> Enum.map(fn {:ok, result} -> result end)
    |> then(&{:ok, &1})
  end
end
```

### Email Risk Scoring Pipeline

```elixir
defmodule PrismaticOsint.Enrichment.EmailRiskScorer do
  @moduledoc """
  Combines EmailRep reputation with breach data and domain
  intelligence for comprehensive email risk scoring.
  """

  def score_email(email) do
    with {:ok, rep} <- EmailRep.query(email),
         {:ok, breaches} <- Hibp.check_email(email) do
      risk_factors = [
        {:reputation, reputation_risk(rep.reputation)},
        {:breach_exposure, breach_risk(breaches)},
        {:disposable, if(rep.details.disposable, do: 30, else: 0)},
        {:dark_web, if(rep.details.malicious_activity, do: 25, else: 0)},
        {:email_security, email_security_risk(rep.details)},
        {:social_presence, social_risk(rep.details.profiles)}
      ]

      {:ok, %{
        email: email,
        risk_score: calculate_composite_risk(risk_factors),
        risk_factors: risk_factors,
        reputation: rep.reputation,
        breach_count: length(breaches),
        social_profiles: rep.details.profiles,
        recommendation: generate_recommendation(risk_factors)
      }}
    end
  end

  defp reputation_risk("high"), do: 0
  defp reputation_risk("medium"), do: 15
  defp reputation_risk("low"), do: 35
  defp reputation_risk("none"), do: 50
  defp reputation_risk(_), do: 25
end
```

## Use Cases

### Fraud Prevention and Account Security

EmailRep is widely deployed in account registration and login workflows to assess the risk of incoming email addresses. Disposable email detection prevents abuse from throwaway addresses. Reputation scoring identifies accounts associated with known malicious activity. Social profile presence serves as a proxy for identity verification, with higher social presence correlating with lower fraud risk.

### Phishing Detection and Email Security

Security operations centers integrate EmailRep into their email security stacks to assess sender reputation in real-time. Emails from addresses with no reputation, recent creation dates, spoofable domains, or missing email authentication (SPF/DKIM/DMARC) receive elevated scrutiny. The malicious activity history flags help identify known phishing and spam operators.

### OSINT Investigation Starting Point

EmailRep's social profile discovery capability makes it a valuable first step in email-based OSINT investigations. The profiles array reveals which social media platforms are associated with an email address, providing immediate pivot points for further investigation. Combined with the temporal data (first_seen/last_seen), analysts can assess how established an email identity is.

### Identity Verification and KYC

Compliance teams use EmailRep alongside other verification sources for know-your-customer workflows. The combination of reputation scoring, social profile presence, breach exposure, and domain analysis creates a multi-dimensional identity confidence assessment that supports or challenges claimed identities.

## Data Quality and Reliability

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Coverage** | Good for professional emails | Best results for active, established email addresses |
| **Accuracy** | High for boolean signals | Disposable/free provider detection highly accurate |
| **Reputation Calibration** | Good | Four-tier system provides clear risk categorization |
| **Social Profile Detection** | Moderate | May miss private or recently created profiles |
| **Freshness** | Real-time query | Aggregates from live sources at query time |
| **False Positive Rate** | Low | Conservative scoring minimizes false positives |

## Platform Integration

EmailRep feeds into the Prismatic email intelligence pipeline as the primary reputation scoring engine. It provides the reputation component for the [Email Intelligence Hub](/osint/email-intelligence/), contributes risk signals to the HAWKEYE visitor intelligence system, and supplies social profile pivot points for the OSINT investigation framework.

## NABLA Compliance

| NABLA Axiom | Compliance | Implementation |
|-------------|------------|----------------|
| **Signal Plurality** | Compliant | EmailRep is one of multiple email intelligence sources in the hub |
| **Contradiction Preservation** | Compliant | EmailRep reputation compared against HIBP and Hunter data |
| **Absence Informative** | Compliant | "none" reputation treated as signal, not absence |
| **Time Decay** | Compliant | first_seen/last_seen timestamps tracked; query time recorded |
| **Unknown Valid** | Compliant | Unknown emails reported as "none" reputation, not assumed safe |
| **Source Independence** | Compliant | Independent aggregation from EmailRep's proprietary source set |
| **Provenance Mandatory** | Compliant | All results tagged with EmailRep source and query timestamp |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **API Response Time** | 200-800ms | Single query typical response |
| **Rate Limit (Free)** | No published limit | Fair use policy |
| **Rate Limit (Pro)** | Custom | Based on enterprise agreement |
| **Signal Count** | 20+ boolean/categorical | Per-email granular indicators |
| **Social Platform Coverage** | 100+ platforms | LinkedIn, GitHub, Twitter, Facebook, etc. |
| **Breach Database** | Billions of records | Cross-referenced with known breaches |
| **Availability** | 99.9%+ | Cloud-hosted with high availability |

## Related Resources

- [Hunter.io](/osint/hunter/) - Email discovery and verification complementing reputation data
- [Have I Been Pwned](/osint/haveibeenpwned/) - Breach exposure correlation for flagged emails
- [FullContact](/osint/fullcontact/) - Person enrichment extending social profile discovery
- [DeHashed](/osint/dehashed/) - Credential exposure details for breach-flagged emails
- [IPQualityScore](/osint/ipqualityscore/) - Fraud scoring with email reputation integration
- [Email Intelligence Hub](/osint/email-intelligence/) - Aggregation layer combining EmailRep with other sources

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)