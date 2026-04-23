+++
title = "Pipl"
weight = 46
[extra]
category = "global"
type = "social"
module = "Pipl"
description = "Deep people search engine aggregating identity data from public records, social media, and proprietary sources"
has_api = true
url = "https://pipl.com"
rate_limit = "Rate limits vary by contract tier"
capabilities = ["People Search", "Identity Resolution", "Email-to-Person Lookup", "Phone Lookup", "Social Profile Aggregation", "Address History", "Associated Identities"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1177
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Pipl", "Deep", "osint", "global", "Prismatic Platform", "LinkedIn", "Cross", "Prismatic"]
tags = ["osint", "global", "pipl", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Pipl - Prismatic Platform"
+++

## Overview

Pipl is the world's largest people search engine for identity verification and people intelligence, maintaining profiles on over 3 billion unique identity records. Unlike consumer people-search sites, Pipl is designed for professional investigators, compliance teams, and fraud analysts who need to resolve fragmented identity data into comprehensive person profiles. The platform serves as the gold standard for identity resolution in the intelligence and compliance industries.

Pipl's core technology is id[entity resolution](@/glossary/entity-resolution.md) -- the ability to take a single data point (email, phone, name, username) and link it to a complete identity profile by correlating data across public records, social media, deep web sources, and proprietary data partnerships. The platform excels at connecting online identities (social media accounts, email addresses, usernames) with real-world identities (full names, addresses, phone numbers, employment records). This cross-domain linking capability is what distinguishes Pipl from simpler people search tools that operate within a single data domain.

For [OSINT](@/glossary/osint.md) investigations, Pipl is particularly valuable when starting with minimal information. An email address or phone number can unlock an entire identity graph including social media profiles across multiple platforms, historical addresses, associated phone numbers, and employment history. This makes Pipl a critical first step in person-focused investigations before drilling into more specialized sources like [LinkedIn Sales Navigator](@/osint/linkedin-sales.md) for professional context or [Clearbit](@/osint/clearbit.md) for corporate enrichment.

## Data Sources and Coverage

Pipl aggregates identity data from a vast network of sources spanning public records, social media platforms, deep web indexes, and proprietary data partnerships. The identity resolution engine correlates data points across these sources to build unified person profiles with confidence scores per data element.

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **Personal Information** | Full name, age, date of birth, gender | 3B+ identity records |
| **Contact Data** | Email addresses, phone numbers (current and historical) | Multiple per person |
| **Addresses** | Current and historical physical addresses | With temporal metadata |
| **Social Profiles** | LinkedIn, Facebook, Twitter, Instagram, GitHub, and 200+ networks | Cross-platform linking |
| **Online Identities** | Usernames, aliases, profile URLs across platforms | Deep web indexed |
| **Employment** | Current and past employers, job titles | Self-reported + inferred |
| **Education** | Schools, degrees, graduation years | Where available |
| **Associated Identities** | Related persons, family members, roommates | Relationship inference |

### Identity Resolution Model

```
Input: email@example.com OR +420123456789 OR "John Doe, Prague"
    |
    v
Pipl Identity Resolution Engine
    |
    v
Cross-reference: Public Records + Social Media + Deep Web + Proprietary Data
    |
    v
Output: Unified Identity Profile with confidence scores per data point
```

The resolution engine applies probabilistic matching algorithms to link fragmented identity data across sources, handling name variations, address changes, and platform-specific usernames to build cohesive person profiles. Each data element in the resulting profile carries an individual confidence score reflecting the strength of the underlying evidence.

## Technical Architecture

The Prismatic Platform integrates Pipl through a REST API adapter optimized for both interactive identity lookups and batch resolution workflows. The adapter implements intelligent query construction that maximizes resolution success by selecting the most discriminating input parameters based on available data.

The identity resolution pipeline follows a waterfall strategy: if an email-based lookup produces a high-confidence match, the pipeline proceeds directly to enrichment. If the initial lookup produces multiple possible matches, the pipeline automatically narrows results using additional available identifiers (phone, name, location) through iterative refinement queries.

Response normalization handles the complex nested structure of Pipl's identity profiles, extracting and flattening social profiles, contact information, and employment data into the Prismatic entity schema. Confidence scores from Pipl are mapped to the platform's internal confidence framework, with Pipl's match confidence thresholds calibrated against known-good identity data.

The adapter implements privacy-aware processing that respects data minimization principles, caching only the identity elements necessary for the active investigation and implementing configurable data retention policies for resolved identities.

## API Integration

Pipl provides deep person intelligence for the Prismatic platform's entity investigation pipeline, complementing corporate data from [Crunchbase](@/osint/crunchbase.md) and [ZoomInfo](@/osint/zoominfo.md) with personal identity context.

```elixir
# Search by email address
{:ok, person} = Pipl.search(email: "john.doe@example.com")
# => %{
#   possible_persons: 1,
#   person: %{
#     names: [%{first: "John", last: "Doe", display: "John Doe"}],
#     emails: [
#       %{address: "john.doe@example.com", type: "work"},
#       %{address: "jdoe@gmail.com", type: "personal"}
#     ],
#     phones: [%{number: "+420123456789", country_code: 420, type: "mobile"}],
#     addresses: [
#       %{city: "Prague", state: nil, country: "CZ", display: "Prague, Czech Republic"}
#     ],
#     jobs: [
#       %{title: "CTO", organization: "Example Corp", date_from: "2020"}
#     ],
#     social_profiles: [
#       %{network: "linkedin", url: "linkedin.com/in/johndoe"},
#       %{network: "github", url: "github.com/johndoe"},
#       %{network: "twitter", username: "@johndoe"}
#     ],
#     match_confidence: 0.97
#   }
# }

# Search by phone number
{:ok, person} = Pipl.search(phone: "+420123456789")

# Search by name and location
{:ok, results} = Pipl.search(
  first_name: "John",
  last_name: "Doe",
  city: "Prague",
  country: "CZ"
)

# Search by username
{:ok, person} = Pipl.search(username: "johndoe")

# Search by social profile URL
{:ok, person} = Pipl.search(url: "https://linkedin.com/in/johndoe")

# Bulk search for multiple identities
{:ok, results} = Pipl.search_batch([
  %{email: "person1@example.com"},
  %{phone: "+420987654321"},
  %{first_name: "Jane", last_name: "Smith", country: "CZ"}
])
```

### Person Investigation Pipeline

```elixir
defmodule PrismaticIntelligence.Investigation.PersonResolver do
  @moduledoc """
  Resolves person identities from minimal data points using Pipl
  as the primary identity resolution engine.
  """

  def resolve_person(identifier) do
    with {:ok, pipl_result} <- Pipl.search(identifier),
         {:ok, clearbit_data} <- enrich_with_clearbit(pipl_result),
         {:ok, breach_data} <- check_breaches(pipl_result) do
      {:ok, %{
        identity: pipl_result.person,
        corporate_context: clearbit_data,
        breach_exposure: breach_data,
        social_footprint: extract_social_footprint(pipl_result),
        confidence: pipl_result.person.match_confidence,
        data_sources: [:pipl, :clearbit, :haveibeenpwned],
        resolved_at: DateTime.utc_now()
      }}
    end
  end

  defp check_breaches(pipl_result) do
    emails = Enum.map(pipl_result.person.emails, & &1.address)

    breach_tasks = Enum.map(emails, fn email ->
      Task.async(fn -> HaveIBeenPwned.breaches(email) end)
    end)

    results = Task.await_many(breach_tasks, 15_000)
    {:ok, Enum.zip(emails, results) |> Enum.into(%{})}
  end
end
```

## Use Cases

### Identity Verification
- Resolve email addresses to full person profiles for KYC compliance with confidence scoring
- Verify identity claims against aggregated public records and social media data
- Cross-reference with [ARES](@/osint/ares.md) for Czech business owner verification connecting personal and corporate identities
- Detect synthetic identities by analyzing profile consistency across multiple data sources

### Fraud Investigation
- Link online identities to real-world persons for fraud attribution
- Identify associated accounts and aliases across platforms to map fraudulent networks
- Build identity graphs showing connections between suspects through shared contact information
- Detect account takeover attempts by comparing resolved identities against known account holders

### People Intelligence
- Discover social media presence across 200+ platforms from a single identifier
- Track employment history and organizational affiliations for background investigations
- Map social networks and professional relationships through contact graph analysis
- Identify subject matter expertise through cross-platform activity analysis

### Compliance and Due Diligence
- PEP (Politically Exposed Person) identification through comprehensive identity resolution
- UBO (Ultimate Beneficial Owner) verification connecting natural persons to corporate entities
- Sanctions screening enrichment with resolved identity details for more accurate matching

## Data Quality

Pipl's data quality benefits from its proprietary identity resolution engine and extensive data partnerships, though the aggregated nature of the data introduces variability in coverage and accuracy across regions and demographics.

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Resolution Accuracy** | High -- proprietary matching algorithms | Confidence scores per match |
| **Coverage** | Excellent for US/EU; variable elsewhere | 3B+ identity records |
| **Social Profile Linking** | Excellent -- 200+ platform coverage | Cross-platform correlation |
| **Contact Data Currency** | Good -- regularly updated partnerships | Historical data preserved |
| **Employment Data** | Good -- LinkedIn and public records derived | Self-reported nature |
| **Privacy Compliance** | High -- GDPR and CCPA compliant operations | Data minimization supported |

### Access Tiers

| Tier | Features | Typical Use |
|------|----------|-------------|
| **Search API** | Single-person lookups | Investigators, analysts |
| **SEARCH API Pro** | Enhanced matching, more sources | Compliance teams |
| **Bulk API** | Batch identity resolution | Enterprise workflows |
| **Enterprise** | Custom integration, SLA | Large-scale operations |

API key required for all requests. Enterprise contracts include enhanced matching confidence and additional data sources.

## Platform Integration

Within the Prismatic Platform, Pipl serves as the primary person identity resolution engine. The adapter integrates with the entity investigation workflow, providing the personal identity layer that complements corporate intelligence from ZoomInfo, Crunchbase, and Czech registries. Resolved identities are linked to entity records in the Prismatic knowledge graph, enabling seamless navigation between person and corporate intelligence.

The integration supports three workflows: interactive identity lookup during investigations, batch identity resolution for compliance screening, and continuous monitoring for identity changes on watched subjects.

## NABLA Compliance

Pipl integration satisfies NABLA epistemic requirements through its confidence-scored identity resolution. The Signal Plurality axiom is inherently addressed by Pipl's multi-source resolution engine, which correlates data across hundreds of sources before producing a unified profile. The Provenance Mandatory axiom is met through attribution to specific data sources and confidence scores per data element.

The Unknown Valid axiom is particularly relevant for identity resolution, where the absence of a match does not confirm non-existence -- the subject may simply not have a sufficient digital footprint. The platform explicitly communicates this epistemic limitation in resolution results.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| **Single identity lookup** | < 2s | 500ms-1.5s |
| **Batch resolution (100 identities)** | < 120s | 40-80s |
| **High-confidence match rate** | > 70% | 75-85% |
| **Cache hit ratio** | > 50% | 55-65% |
| **API availability** | > 99.5% | 99.8% |

## Related Resources

- [Clearbit](@/osint/clearbit.md) - Company and person enrichment from email/domain
- [Have I Been Pwned](@/osint/haveibeenpwned.md) - Breach exposure for discovered email addresses
- [Social Searcher](@/osint/social-searcher.md) - Social media monitoring and search
- [LinkedIn Sales Navigator](@/osint/linkedin-sales.md) - Professional network intelligence
- [ZoomInfo](@/osint/zoominfo.md) - B2B contact and organizational data
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Person identity enrichment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)