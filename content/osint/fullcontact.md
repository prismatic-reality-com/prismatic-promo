+++
title = "FullContact"
weight = 28
[extra]
category = "global"
type = "social"
module = "FullContact"
description = "Person and company identity resolution and enrichment platform"
has_api = true
url = "https://www.fullcontact.com"
rate_limit = "100 req/min (free), 600 req/min (premium), custom (enterprise)"
capabilities = ["Person Enrichment", "Company Enrichment", "Identity Resolution", "Social Profile Discovery", "Audience Insights", "Contact Verification", "Entity Matching", "Data Append"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 691
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["FullContact", "Person", "osint", "global", "Prismatic Platform", "Hunter", "Email", "Identify"]
tags = ["osint", "global", "fullcontact", "prismatic"]
quality_score = 65
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "FullContact - Prismatic Platform"
+++

## Overview

FullContact is an id[entity resolution](@/glossary/entity-resolution.md) and data enrichment platform that transforms fragmented contact information into complete person and company profiles. Given a single identifier -- an email address, phone number, social handle, or physical address -- FullContact returns a comprehensive profile including demographic information, social media accounts, employment history, and company affiliations.

FullContact's identity graph connects over 3 billion person records with 200+ billion data points, resolving fragmented identities across multiple data sources. This makes it the industry standard for person enrichment in CRM systems, marketing platforms, and increasingly in [OSINT](@/glossary/osint.md) investigation workflows where building a complete profile from partial information is essential.

Within the Prismatic Platform, FullContact serves as the primary person enrichment engine, transforming email addresses discovered by [Hunter.io](@/osint/hunter.md) into complete identity profiles for organizational mapping and investigation workflows.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Full Name** | First, middle, last name with confidence score |
| **Social Profiles** | LinkedIn, Twitter, Facebook, GitHub, and 100+ networks |
| **Employment** | Current and past employers, job titles, seniority |
| **Location** | City, state, country with geocoding |
| **Demographics** | Age range, gender, interests |
| **Photos** | Profile photos from social media accounts |
| **Company** | Employer details with domain, industry, size |
| **Education** | School, degree, graduation year |
| **Bio** | Aggregated biography from social profiles |
| **Communication Channels** | Email, phone, social handles, website |

### Identity Resolution Process

FullContact's identity graph resolves fragmented data across silos into unified person records. The resolution engine uses probabilistic matching algorithms that weigh multiple signals to determine identity equivalence:

```
Input: email "john@example.com"
  -> Resolves to Person Record ID: fc-abc123
  -> Links: LinkedIn profile, Twitter handle, GitHub account
  -> Enriches: Full name, employer, title, location, photo
  -> Matches: Phone +1-555-0123, address 123 Main St
```

### Resolution Confidence Model

Each data point in a FullContact profile carries a confidence score reflecting the strength of the underlying evidence:

| Confidence Level | Score Range | Meaning |
|-----------------|-------------|---------|
| **Definitive** | 0.95 - 1.00 | Self-reported or verified through multiple sources |
| **High** | 0.80 - 0.94 | Strong cross-source correlation |
| **Medium** | 0.60 - 0.79 | Single-source or partial match |
| **Low** | 0.40 - 0.59 | Inferred or algorithmically predicted |
| **Speculative** | Below 0.40 | Weak signal, requires verification |

## Integration with Prismatic

FullContact integrates with the [OSINT Core](@/apps/prismatic-osint-core.md) person enrichment pipeline, providing identity resolution for investigation and organizational mapping workflows.

```elixir
# Enrich a person by email
{:ok, person} = FullContact.enrich_person(email: "john.doe@example.com")
# => %{
#   full_name: "John Doe",
#   age_range: "30-39",
#   gender: "male",
#   location: %{city: "San Francisco", state: "CA", country: "US"},
#   employment: [
#     %{name: "Example Corp", title: "Senior Engineer", current: true,
#       domain: "example.com"}
#   ],
#   social_profiles: [
#     %{type: "linkedin", url: "https://linkedin.com/in/johndoe", username: "johndoe"},
#     %{type: "github", url: "https://github.com/johndoe", username: "johndoe"},
#     %{type: "twitter", url: "https://twitter.com/johndoe", username: "johndoe"}
#   ],
#   photos: [%{url: "https://...", type: "linkedin"}],
#   bio: "Senior software engineer passionate about distributed systems..."
# }

# Enrich by phone number
{:ok, person} = FullContact.enrich_person(phone: "+14155550123")

# Enrich by social handle
{:ok, person} = FullContact.enrich_person(twitter: "johndoe")

# Enrich a company
{:ok, company} = FullContact.enrich_company(domain: "example.com")
# => %{
#   name: "Example Corp",
#   domain: "example.com",
#   industry: "Technology",
#   employees: "201-500",
#   founded: 2010,
#   location: %{city: "San Francisco", state: "CA"},
#   social_profiles: [%{type: "linkedin", url: "https://..."}],
#   tech_stack: ["AWS", "React", "Python"],
#   annual_revenue: "$10M-50M"
# }

# Identity resolution (match across identifiers)
{:ok, resolved} = FullContact.resolve(
  email: "john@example.com",
  phone: "+14155550123",
  name: %{first: "John", last: "Doe"}
)
```

### Person Investigation Pipeline

The person investigation pipeline combines FullContact enrichment with email intelligence, breach data, and employer information to build comprehensive subject profiles for due diligence and investigation workflows.

```elixir
defmodule PrismaticOsint.Investigation.PersonProfiler do
  @moduledoc """
  Builds comprehensive person profiles by combining FullContact
  enrichment with email intelligence and breach data.
  """

  def build_profile(email) do
    with {:ok, person} <- FullContact.enrich_person(email: email),
         {:ok, rep} <- EmailRep.query(email),
         {:ok, breaches} <- Hibp.check_email(email),
         {:ok, company} <- enrich_employer(person) do
      {:ok, %{
        identity: person,
        email_reputation: rep.reputation,
        breach_exposure: length(breaches),
        social_footprint: length(person.social_profiles),
        employer: company,
        risk_assessment: assess_person_risk(person, rep, breaches),
        investigation_leads: generate_investigation_leads(person)
      }}
    end
  end

  defp enrich_employer(%{employment: [%{domain: domain} | _]}) do
    FullContact.enrich_company(domain: domain)
  end

  defp enrich_employer(_), do: {:ok, nil}
end
```

### Organizational Mapping Workflow

FullContact enables automated organizational mapping when combined with email discovery. The workflow discovers all email addresses for a target domain via [Hunter.io](@/osint/hunter.md), then enriches each contact with FullContact to build a complete organizational picture:

```elixir
defmodule PrismaticOsint.Enrichment.OrgChartBuilder do
  @moduledoc """
  Builds organizational charts by enriching discovered
  email addresses with FullContact person data.
  """

  def build_org_chart(domain) do
    with {:ok, hunter_result} <- Hunter.domain_search(domain),
         {:ok, enriched} <- batch_enrich(hunter_result.emails) do
      {:ok, %{
        domain: domain,
        organization: hunter_result.organization,
        total_contacts: length(enriched),
        c_suite: filter_by_seniority(enriched, "c_suite"),
        directors: filter_by_seniority(enriched, "director"),
        managers: filter_by_seniority(enriched, "manager"),
        departments: group_by_department(enriched),
        social_graph: build_social_network(enriched)
      }}
    end
  end

  defp batch_enrich(emails) do
    emails
    |> Task.async_stream(fn email ->
      FullContact.enrich_person(email: email.value)
    end, max_concurrency: 10, timeout: 15_000)
    |> Enum.flat_map(fn
      {:ok, {:ok, person}} -> [person]
      _ -> []
    end)
    |> then(&{:ok, &1})
  end
end
```

## Rate Limits and Access

| Tier | Requests/Min | Enrichments/Month | Features |
|------|-------------|-------------------|----------|
| **Free** | 100 | 100 | Person and company enrichment |
| **Essentials** | 300 | 2,500 | Identity resolution, batch |
| **Premium** | 600 | 25,000 | Full API, webhooks, analytics |
| **Enterprise** | Custom | Unlimited | Private identity graph, SLA |

### Authentication
API key required via `Authorization: Bearer` header. Free tier available with registration.

### Data Privacy Considerations

FullContact processes personal data subject to various privacy regulations. Key considerations for OSINT integration:

| Regulation | Requirement | Prismatic Compliance |
|-----------|-------------|---------------------|
| **GDPR** | Legitimate interest or consent required | Investigation purpose documented |
| **CCPA** | Consumer data rights respected | Data minimization enforced |
| **LGPD** | Brazilian data protection compliance | Geographic filtering available |

## Use Cases

### OSINT Investigation
- Build complete profiles from partial identifiers (email, phone, name)
- Map organizational structures by enriching [Hunter.io](@/osint/hunter.md) discovered emails
- Identify key decision-makers for social engineering assessments
- Correlate social media presence across platforms for subject profiling

### Due Diligence
- Verify person identities for KYC/AML compliance
- Cross-reference with [OpenCorporates](@/osint/open-corporates.md) for corporate role verification
- Validate executive profiles for M&A intelligence
- Background checks for financial services onboarding

### Security Assessment
- Map target organization personnel for phishing simulation planning
- Identify high-value targets based on role and access level
- Correlate with [DeHashed](@/osint/dehashed.md) for credential exposure of key personnel
- Assess social media attack surface for executive protection

### Competitive Intelligence
- Monitor competitor organizational changes and key hires
- Track executive movements between companies in target industries
- Build relationship maps across industry networks
- Identify partnership and vendor relationships through employment patterns

## Related Sources

- [Hunter.io](@/osint/hunter.md) - Email discovery feeding person enrichment
- [EmailRep](@/osint/emailrep.md) - Email reputation scoring
- [Have I Been Pwned](@/osint/haveibeenpwned.md) - Breach exposure for discovered persons
- [OpenCorporates](@/osint/open-corporates.md) - Corporate entity and officer verification
- [Intelligence X](@/osint/intelligencex.md) - Deep search for person-related data exposure
- [ZoomInfo](@/osint/zoominfo.md) - Enterprise B2B contact and company intelligence
- [LinkedIn Sales Navigator](@/osint/linkedin-sales.md) - Professional network intelligence

## Related Platform Components

- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Person data in organizational risk assessment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)