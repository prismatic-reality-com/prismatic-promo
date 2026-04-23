+++
title = "Email Intelligence Hub"
weight = 61
[extra]
category = "universal"
type = "email"
module = "EmailIntelligence"
description = "Multi-source email analysis aggregating verification, breach exposure, reputation, and social profiles into unified intelligence"
has_api = true
url = "https://emailrep.io"
rate_limit = "Varies by underlying source, internally managed"
capabilities = ["Email Verification", "Breach Check", "Domain Intelligence", "Social Profile Discovery", "Reputation Scoring", "Deliverability Analysis", "Disposable Detection", "Batch Processing"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1131
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Email", "Intelligence", "Hub", "Multi-source", "osint", "universal", "Prismatic Platform", "Hunter", "High", "EmailRep"]
tags = ["osint", "universal", "email-intelligence-hub", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Email Intelligence Hub - Prismatic Platform"
+++

## Overview

The Email Intelligence Hub is Prismatic's aggregated email analysis capability that orchestrates parallel intelligence gathering across multiple specialized email data providers, fusing their results into a unified investigation interface. Rather than requiring analysts to query individual services sequentially, the hub dispatches concurrent requests across verification providers, breach databases, reputation services, and social profile resolvers, producing a comprehensive email address assessment in a single API call with millisecond-level latency overhead.

Email addresses represent one of the most productive starting points in [OSINT](/glossary/osint/) investigations. A single professional email address can unlock the subject's full legal name, current employer, job title, social media presence across dozens of platforms, history of data breach exposure, domain registration patterns, and web activity footprint. The Email Intelligence Hub automates this entire enrichment workflow, transforming a single identifier into a comprehensive digital profile within seconds. This capability is foundational for due diligence, fraud detection, identity verification, phishing assessment, and security posture evaluation.

The hub aggregates intelligence from a configurable set of underlying sources. [Have I Been Pwned](/osint/haveibeenpwned/) provides breach exposure data, revealing whether the email appears in known data breaches along with the specific data classes compromised. [EmailRep](/osint/emailrep/) delivers reputation scoring, disposable email detection, and social profile discovery across 100+ platforms. [Hunter.io](/osint/hunter/) contributes email verification, deliverability analysis, and organizational email pattern detection. [Pipl](/osint/pipl/) resolves social profiles and personal identity information from email addresses. [Clearbit](/osint/clearbit/) provides person and company enrichment data including job titles, company details, and professional context.

The hub's signal fusion engine correlates data across these sources to generate unified confidence scores that are more reliable than any individual source. When multiple sources independently confirm a piece of information (e.g., the subject's employer), confidence increases. When sources contradict each other, the contradictions are preserved and flagged for analyst review in accordance with NABLA epistemic framework requirements. The engine also handles graceful degradation: if one source is unavailable, rate-limited, or returns an error, results from the remaining sources are returned with appropriate confidence adjustments.

## Data Sources and Coverage

| Data Point | Description | Source(s) | Confidence Impact |
|-----------|-------------|-----------|-------------------|
| **Email Verification** | Syntax validation, MX record check, SMTP probe | Hunter, EmailRep | High (direct verification) |
| **Breach History** | Known data breach appearances with dates and data classes | HIBP, DeHashed | High (authoritative source) |
| **Domain Intelligence** | Domain age, registration, MX configuration, SPF/DKIM/DMARC | Hunter, SecurityTrails | High |
| **Social Profiles** | Linked accounts across 200+ platforms | Pipl, FullContact | Moderate (may be stale) |
| **Reputation Score** | Aggregate trust/[risk score](/glossary/risk-score/) (0-100) | EmailRep | Moderate (proprietary model) |
| **Deliverability** | Inbox placement probability | Hunter | High (direct SMTP test) |
| **Disposable Detection** | Temporary/throwaway email identification | EmailRep | High (database matching) |
| **Role Detection** | Personal vs. role-based (info@, admin@) | Hunter | High (pattern matching) |
| **Person Enrichment** | Full name, title, employer, photo | Clearbit, Pipl | Moderate to High |
| **Malicious Indicators** | Spam, phishing, malware association history | EmailRep, Spamhaus | Moderate |

### Multi-Source Fusion Architecture

```
Input: email@example.com
    |
    v
Parallel dispatch to all configured sources (concurrent)
    |
    +-- EmailRep: reputation score, disposable check, dark web, social profiles
    |
    +-- Hunter.io: verification, deliverability, domain data, email pattern
    |
    +-- HIBP: breach exposure count, breach details, data classes
    |
    +-- Pipl: social profiles, personal identity, employment history
    |
    +-- Clearbit: person enrichment, company enrichment, photo
    |
    v
Signal Fusion Engine
    +-- Correlate matching fields across sources
    +-- Preserve contradictions (NABLA compliance)
    +-- Calculate per-field confidence scores
    +-- Generate unified risk assessment
    |
    v
Unified Email Intelligence Report with per-field confidence
```

## Technical Architecture

The Email Intelligence Hub operates as an orchestration layer within the Prismatic OSINT pipeline, managing concurrent API calls, response normalization, signal fusion, and result caching.

### Processing Pipeline

The hub follows a four-phase processing model: dispatch, collection, fusion, and assessment.

| Phase | Description | Latency |
|-------|-------------|---------|
| **Dispatch** | Concurrent API calls to all configured sources | <50ms |
| **Collection** | Await responses with configurable timeouts per source | 1-5 seconds |
| **Fusion** | Cross-source correlation, deduplication, confidence scoring | <100ms |
| **Assessment** | Risk assessment, recommendation generation | <50ms |

### Caching Strategy

Results are cached for 24 hours to minimize API consumption on repeated queries. Cache invalidation occurs when breach databases are updated (HIBP publishes new breaches) or when source configurations change. Stale cache entries are served with reduced confidence scores and a freshness indicator.

## API Integration

```elixir
defmodule PrismaticOsint.Adapters.EmailIntelligence do
  @moduledoc """
  Email Intelligence Hub orchestrating multi-source email analysis
  with parallel dispatch, signal fusion, and graceful degradation.
  """

  @behaviour PrismaticOsint.Adapter

  @doc """
  Comprehensive email investigation aggregating all configured sources.
  """
  def investigate(email, opts \\ []) do
    sources = Keyword.get(opts, :sources, default_sources())
    timeout = Keyword.get(opts, :timeout, 15_000)

    tasks = Enum.map(sources, fn source ->
      Task.async(fn -> query_source(source, email) end)
    end)

    results = Task.await_many(tasks, timeout)
    fused = fuse_signals(email, Enum.zip(sources, results))

    {:ok, %{
      email: email,
      verification: fused.verification,
      reputation: fused.reputation,
      breaches: fused.breaches,
      person: fused.person,
      social_profiles: fused.social_profiles,
      domain: fused.domain,
      confidence: fused.overall_confidence,
      sources_queried: sources,
      sources_responded: fused.responded_sources,
      investigated_at: DateTime.utc_now()
    }}
  end

  @doc """
  Batch investigation for multiple email addresses.
  """
  def batch_investigate(emails, opts \\ []) do
    emails
    |> Task.async_stream(fn email -> investigate(email, opts) end,
      max_concurrency: Keyword.get(opts, :concurrency, 5),
      timeout: 30_000
    )
    |> Enum.map(fn {:ok, result} -> result end)
    |> then(&{:ok, &1})
  end

  @doc """
  Quick reputation check (lightweight, fast).
  """
  def quick_check(email) do
    investigate(email, sources: [:emailrep], timeout: 5_000)
  end

  @doc """
  Domain-wide email enumeration with verification.
  """
  def enumerate_domain(domain, opts \\ []) do
    with {:ok, emails} <- Hunter.domain_search(domain),
         {:ok, enriched} <- maybe_enrich(emails, opts) do
      {:ok, %{
        domain: domain,
        emails: enriched,
        total: length(enriched),
        pattern: emails.pattern
      }}
    end
  end
end
```

### Email Investigation Pipeline

```elixir
defmodule PrismaticIntelligence.Email.InvestigationPipeline do
  @moduledoc """
  Orchestrates comprehensive email investigation by aggregating
  intelligence from multiple sources with graceful degradation
  and NABLA-compliant signal fusion.
  """

  def investigate(email) do
    tasks = [
      Task.async(fn -> EmailRep.check(email) end),
      Task.async(fn -> HaveIBeenPwned.breaches(email) end),
      Task.async(fn -> Clearbit.enrich_person(email) end),
      Task.async(fn -> Pipl.search(email: email) end)
    ]

    results = Task.await_many(tasks, 15_000)
    [reputation, breaches, enrichment, identity] = results

    {:ok, %{
      email: email,
      reputation: extract_ok_or_nil(reputation),
      breaches: extract_ok_or_empty(breaches),
      person: extract_ok_or_nil(enrichment),
      identity: extract_ok_or_nil(identity),
      risk_assessment: assess_email_risk(reputation, breaches),
      confidence: calculate_confidence(results),
      investigated_at: DateTime.utc_now()
    }}
  end

  defp assess_email_risk(reputation, breaches) do
    rep_score = get_in_safe(reputation, [:score]) || 50
    breach_count = length(extract_ok_or_empty(breaches))

    cond do
      rep_score < 20 -> :high_risk
      breach_count > 5 and rep_score < 50 -> :elevated_risk
      breach_count > 0 -> :moderate_risk
      rep_score > 80 -> :low_risk
      true -> :unknown
    end
  end
end
```

## Use Cases

### Identity Verification and KYC

The Email Intelligence Hub provides multi-dimensional identity verification for KYC/AML compliance workflows. By correlating email verification status, social profile presence, employment history, and breach exposure, the hub generates a composite identity confidence score that supports or challenges claimed identities. Disposable email detection and domain age analysis help identify recently created identities that may be associated with fraud.

### Fraud Detection and Prevention

E-commerce platforms, financial institutions, and SaaS providers use the hub to score incoming registration and transaction emails for fraud risk. The combination of reputation scoring, disposable email detection, breach exposure analysis, and social profile presence creates a multi-layered fraud detection system that is significantly more effective than any single-source check.

### Organizational Breach Exposure Assessment

By combining Hunter.io domain enumeration with HIBP breach data, the hub enables organization-wide breach exposure assessment. All publicly discoverable email addresses for a target domain are identified, then each is checked against breach databases to quantify the organization's credential exposure. This assessment feeds directly into [Prismatic Perimeter](/apps/prismatic-perimeter/) [security rating](/glossary/security-rating/) calculations.

### Phishing Target Identification

Security assessment teams use the hub to identify high-value phishing targets within an organization. Emails associated with executive roles, combined with breach exposure indicating compromised credentials, represent elevated phishing risk. This intelligence informs both defensive measures and authorized phishing simulation exercises.

## Data Quality and Reliability

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Cross-Source Agreement** | High confidence when 3+ sources agree | Per-field confidence scoring |
| **Single-Source Findings** | Lower confidence, flagged for review | Annotated with source identifier |
| **Contradictions** | Preserved per NABLA requirements | Both signals presented to analyst |
| **Freshness** | Variable by source | Reputation scores real-time; breach data may lag |
| **Coverage** | Excellent for professional emails | Reduced coverage for personal/free provider emails |
| **Graceful Degradation** | Full | Individual source failures do not block results |

## Platform Integration

The Email Intelligence Hub serves as the primary email investigation interface within the Prismatic Platform. It feeds into due diligence pipelines, fraud detection workflows, security posture assessments, and the HAWKEYE visitor intelligence system. All results are normalized to the platform's standard intelligence schema and stored with full provenance metadata.

## NABLA Compliance

| NABLA Axiom | Compliance | Implementation |
|-------------|------------|----------------|
| **Signal Plurality** | Compliant | 5+ independent sources for each email investigation |
| **Contradiction Preservation** | Compliant | Conflicting identity data from different sources preserved |
| **Absence Informative** | Compliant | Sources returning no data are tracked as negative signals |
| **Time Decay** | Compliant | Per-source timestamps; stale data flagged with reduced confidence |
| **Unknown Valid** | Compliant | Partial results returned with uncertainty rather than false completeness |
| **Source Independence** | Compliant | Sources use independent data collection methodologies |
| **Provenance Mandatory** | Compliant | Every data point tagged with source identifier and retrieval timestamp |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **End-to-End Latency** | 2-8 seconds | Parallel dispatch; bottlenecked by slowest source |
| **Cache Hit Rate** | 30-50% | 24-hour TTL for repeated queries |
| **Source Availability** | 95%+ per source | Graceful degradation on individual failures |
| **Batch Throughput** | 50-100 emails/min | Rate-limited by underlying source quotas |
| **Confidence Threshold** | 0.70+ for actionable | Below 0.70 flagged for manual review |
| **Data Sources** | 5+ configurable | EmailRep, HIBP, Hunter, Pipl, Clearbit |

## Related Resources

- [Have I Been Pwned](/osint/haveibeenpwned/) - Breach database for exposure checks
- [EmailRep](/osint/emailrep/) - Email reputation scoring and social profile discovery
- [Hunter.io](/osint/hunter/) - Email discovery, verification, and domain enumeration
- [FullContact](/osint/fullcontact/) - Person and company enrichment from email addresses
- [Pipl](/osint/pipl/) - Deep people search and social profile resolution
- [Clearbit](/osint/clearbit/) - Person and company enrichment
- [IPQualityScore](/osint/ipqualityscore/) - Email validation with fraud scoring integration

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)