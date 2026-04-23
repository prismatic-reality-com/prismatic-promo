+++
title = "Czech Courts Portal"
weight = 67
[extra]
category = "czech"
type = "legal"
module = "CzechCourts"
description = "Czech court decision database - judicial intelligence and case law"
has_api = false
url = "https://rozhodnuti.justice.cz"
rate_limit = "Web interface, no official API"
capabilities = ["Court Decision Search", "Case Law Analysis", "Judge Activity", "Legal Precedent", "Entity Litigation History", "Appeal Tracking"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1612
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Czech", "Courts", "Portal", "osint", "Prismatic Platform", "Court", "Supreme Administrative", "Full"]
tags = ["osint", "czech", "czech-courts-portal", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Czech Courts Portal - Prismatic Platform"
+++

## Overview

The Czech Courts Portal (rozhodnuti.justice.cz) provides public access to court decisions from the entire Czech judicial system, encompassing district courts (okresni soudy), regional courts (krajske soudy), high courts (vrchni soudy), the Supreme Court (Nejvyssi soud), and the Supreme Administrative Court (Nejvyssi spravni soud). The portal contains hundreds of thousands of anonymized court decisions spanning civil, criminal, commercial, administrative, and constitutional law matters, representing one of the most comprehensive judicial transparency initiatives in Central Europe.

The portal was established as part of the Czech Republic's broader open government and judicial transparency reforms. Under Act No. 106/1999 Sb. (Freedom of Information Act) and subsequent Ministry of Justice directives, Czech courts are required to publish selected decisions in anonymized form. The anonymization process replaces natural person names with pseudonyms while preserving legal entity names (company names, ICO numbers), geographic references, and the complete legal reasoning of the court. This design choice is particularly valuable for [OSINT](/glossary/osint/) analysts investigating corporate entities, as company names and identification numbers remain fully searchable and identifiable in published decisions.

For OSINT analysts and investigative researchers, the Czech Courts Portal provides intelligence that is unavailable from any other source. Litigation history reveals disputes between entities, regulatory enforcement patterns, corporate governance conflicts, fraud and insolvency proceedings, intellectual property disputes, and contract enforcement actions. The full text of judicial decisions provides narrative context, factual findings, and legal reasoning that goes far beyond the structured data available in commercial registries.

The portal's value extends beyond individual case analysis to systematic pattern detection. By analyzing decision volumes, case types, and outcomes for specific entities, courts, or legal areas, analysts can identify litigation trends, assess regulatory enforcement intensity, and evaluate judicial consistency. This systematic analysis supports risk assessment, compliance monitoring, and investigative journalism.

The Supreme Court and Supreme Administrative Court decisions are particularly valuable as they establish legal precedent (judikatura) that guides lower court decisions. These high-court decisions are published more consistently and with greater detail than lower court decisions, providing authoritative interpretations of Czech law.

## Data Sources and Coverage

### Court System Coverage

| Court Level | Courts | Decision Types | Publication Rate |
|-------------|--------|---------------|-----------------|
| **District Courts** | 86 | Civil, criminal, executory | Selective (~30%) |
| **Regional Courts** | 8 | Appellate, first-instance commercial | Selective (~50%) |
| **High Courts** | 2 (Prague, Olomouc) | Appellate civil and criminal | High (~70%) |
| **Supreme Court** | 1 | Cassation, extraordinary review | Near-complete (~95%) |
| **Supreme Administrative Court** | 1 | Administrative cassation | Near-complete (~95%) |

### Content Statistics

| Metric | Coverage |
|--------|----------|
| **Total Published Decisions** | 500,000+ |
| **Annual New Decisions** | ~50,000 |
| **Date Range** | 2000-present (varies by court) |
| **Legal Areas** | Civil, criminal, commercial, administrative, constitutional |
| **Search Fields** | Full text, case number, court, date, legal area |
| **Decision Format** | Full text with anonymization |
| **Language** | Czech |

### Decision Types

| Czech Term | English | OSINT Value |
|-----------|---------|-------------|
| **Rozsudek** | Judgment | Full merits decision, most detail |
| **Usneseni** | Resolution/Order | Procedural decisions, less detail |
| **Nález** | Constitutional finding | Constitutional Court decisions |
| **Stanovisko** | Opinion | Unified legal interpretations |

## API Integration

The Czech Courts Portal does not provide an official REST API. Access is through the web interface at rozhodnuti.justice.cz with structured search parameters available via URL query strings.

### Data Access Methods

| Method | Access | Capabilities |
|--------|--------|-------------|
| **Web Search** | Free, no authentication | Full-text search, filtering by court/date/area |
| **URL Parameters** | Free, no authentication | Structured queries via GET parameters |
| **RSS Feeds** | Free, no authentication | New decision notifications for saved searches |
| **Bulk Download** | Not officially available | Complete dataset not provided for download |
| **ECLI Search** | Free | European Case Law Identifier lookup |

### Search Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `typSoudu` | os, ks, vs, ns, nss | Court type filter |
| `soud` | Court identifier | Specific court |
| `agendaNazev` | Agenda code | Legal area (C, T, Cdo, etc.) |
| `datumOd` / `datumDo` | DD.MM.YYYY | Date range |
| `senat` | Number | Senate/panel number |
| `fulltext` | Text | Full-text search query |

### curl Examples

```bash
# Search for decisions mentioning a company name
curl "https://rozhodnuti.justice.cz/Vyhledavani?fulltext=Prismatic+s.r.o.&typSoudu=&datumOd=01.01.2020&datumDo=31.12.2025"

# Search Supreme Court commercial decisions
curl "https://rozhodnuti.justice.cz/Vyhledavani?typSoudu=ns&agendaNazev=Cdo&datumOd=01.01.2024"

# Search by case number
curl "https://rozhodnuti.justice.cz/Vyhledavani?fulltext=25+Cdo+1234%2F2024"

# Search Supreme Administrative Court decisions on data protection
curl "https://rozhodnuti.justice.cz/Vyhledavani?typSoudu=nss&fulltext=ochrana+osobnich+udaju"
```

## Query Examples

```elixir
# Search court decisions mentioning an entity
{:ok, decisions} = CzechCourts.search("Example s.r.o.", court: :supreme)
# => %{total: 15, decisions: [
#   %{case_number: "25 Cdo 1234/2024", court: "Nejvyssi soud",
#     decision_date: ~D[2024-09-15], decision_type: :rozsudek,
#     legal_area: :commercial, summary: "Dispute over software license...",
#     ecli: "ECLI:CZ:NS:2024:25.CDO.1234.2024.1"},
#   ...
# ]}

# Get full decision text
{:ok, decision} = CzechCourts.decision("25 Cdo 1234/2024")
# => %{case_number: "25 Cdo 1234/2024",
#      court: "Nejvyssi soud", senate: 25,
#      decision_date: ~D[2024-09-15],
#      decision_type: :rozsudek,
#      full_text: "CESKA REPUBLIKA\nROZSUDEK\nJMENEM REPUBLIKY\n...",
#      legal_references: ["89/2012 Sb. s 2913", "99/1963 Sb. s 237"],
#      outcome: :granted}

# Entity litigation history
{:ok, history} = CzechCourts.litigation_history(ico: "12345678")
# => %{entity: "Example s.r.o.", ico: "12345678",
#      total_cases: 23,
#      by_type: %{civil: 15, commercial: 5, administrative: 3},
#      by_role: %{plaintiff: 12, defendant: 11},
#      by_outcome: %{won: 8, lost: 6, settled: 5, pending: 4},
#      timeline: [%{year: 2024, cases: 5}, %{year: 2023, cases: 7}, ...]}

# Search decisions by legal area and date range
{:ok, decisions} = CzechCourts.search_by_area(
  area: :insolvency,
  date_from: ~D[2024-01-01],
  date_to: ~D[2025-01-01],
  court_type: :regional
)

# Track judge decision patterns
{:ok, analysis} = CzechCourts.judge_analysis(
  court: "Krajsky soud v Praze",
  senate: 45,
  area: :commercial
)

# Legal precedent search
{:ok, precedents} = CzechCourts.precedent_search(
  legal_provision: "89/2012 Sb. s 2913",
  court: :supreme
)
```

## Data Schema

### Court Decision Record

```elixir
%CzechCourts.Decision{
  case_number: "25 Cdo 1234/2024",
  ecli: "ECLI:CZ:NS:2024:25.CDO.1234.2024.1",
  court: %{
    name: "Nejvyssi soud",
    type: :supreme,
    location: "Brno"
  },
  senate: 25,
  decision_date: ~D[2024-09-15],
  publication_date: ~D[2024-11-01],
  decision_type: :rozsudek,
  legal_area: :commercial,
  agenda: "Cdo",
  outcome: :granted,
  full_text: "Full decision text...",
  headnote: "Summary of legal principle...",
  legal_provisions: [
    %{act: "89/2012 Sb.", section: "2913", name: "Obciansky zakonik"},
    %{act: "99/1963 Sb.", section: "237", name: "Obciansky soudni rad"}
  ],
  parties: %{
    anonymized: true,
    plaintiff: "Zalobce (anonymized)",
    defendant: "Example s.r.o., ICO: 12345678"
  },
  prior_decisions: [
    %{court: "Krajsky soud v Praze", case_number: "45 Co 567/2023"}
  ]
}
```

## Use Cases

### Corporate Litigation Risk Assessment

Due diligence analysts search the Courts Portal to assess the litigation exposure of target companies. A company involved in numerous lawsuits as defendant may indicate contractual disputes, product liability issues, or regulatory non-compliance. The nature and outcomes of past litigation inform risk scoring and negotiation positioning.

### Regulatory Enforcement Pattern Analysis

Compliance teams monitor court decisions related to regulatory enforcement in their sector. Administrative court decisions reveal how regulators (Czech National Bank, antitrust office, data protection authority) exercise enforcement powers, what violations they prioritize, and what penalties courts uphold or modify. This intelligence informs compliance strategy and risk assessment.

### Fraud and Financial Crime Investigation

Criminal court decisions provide detailed accounts of fraud schemes, financial crimes, and related prosecutions. Even with anonymized individual names, the factual descriptions in criminal judgments reveal modus operandi, victim profiles, and enforcement outcomes that inform fraud detection and prevention strategies.

### Insolvency and Bankruptcy Intelligence

Court decisions in insolvency proceedings reveal the circumstances, asset distributions, and creditor outcomes of business failures. This intelligence supports credit risk assessment, supply chain risk monitoring, and identification of serial insolvency participants.

### Intellectual Property Dispute Tracking

Technology companies and IP-intensive businesses monitor court decisions on patent, trademark, and copyright disputes. Czech courts' interpretations of IP rights, fair use, and damage calculations inform IP strategy and litigation risk assessment.

### Legal Precedent Research

Legal professionals use the portal for comprehensive precedent research, identifying how Czech courts have interpreted specific legal provisions, applied EU directives, and resolved novel legal questions. The Supreme Court and Supreme Administrative Court decisions carry particular authority as precedent.

## Limitations

**Incomplete Publication**: Not all court decisions are published on the portal. Lower court (district and regional) decisions have lower publication rates (~30-50%), meaning that comprehensive litigation history analysis may miss cases decided by lower courts. Supreme Court and Supreme Administrative Court decisions have near-complete publication.

**Anonymization of Individuals**: Natural person names are anonymized in published decisions. While this protects privacy, it makes it difficult to track individuals across multiple cases or to identify natural person litigants. Corporate entity names and ICO numbers are preserved.

**No Official API**: The absence of a structured API limits automated analysis and integration capabilities. Extracting decision data at scale requires web scraping approaches that may be fragile and subject to website changes.

**Search Quality**: The portal's full-text search functionality has limitations in handling complex boolean queries, phrase matching, and diacritic-insensitive search. Search results may include irrelevant matches or miss relevant decisions.

**Publication Delay**: There is typically a delay of weeks to months between the decision date and publication on the portal. Very recent decisions may not yet be available.

**Language Limitation**: All decisions are published exclusively in Czech. Non-Czech speakers require translation services for analysis, and automated translation may miss legal nuances.

## Legal and Ethical Considerations

Published court decisions are public information under Czech law. Their use for research, analysis, and journalism is permitted without restriction. However, several considerations apply.

The anonymization of natural persons in published decisions is a deliberate privacy protection measure. Attempting to re-identify anonymized individuals through correlation with other data sources may violate [GDPR](/glossary/gdpr/) principles and Czech data protection law, even if technically possible.

Court decisions should be interpreted with appropriate legal expertise. Non-lawyers may misinterpret legal terminology, procedural context, or the significance of specific decision outcomes. OSINT analysts should consult legal professionals when drawing conclusions from judicial decisions.

The publication of court decisions serves the principles of judicial transparency and public accountability. Using this data for purposes that undermine these principles (harassment, intimidation, or commercial exploitation of personal information) would be ethically inappropriate and potentially illegal.

When publishing analysis based on court decisions, appropriate context should be provided to avoid misrepresenting the significance or finality of individual decisions. First-instance decisions may be overturned on appeal; interim orders do not represent final judgments.

## Integration with Prismatic Platform

Prismatic Platform integrates the Czech Courts Portal as a legal intelligence source, enabling comprehensive litigation analysis as part of entity due diligence and risk assessment workflows.

### Legal Intelligence Pipeline

```elixir
defmodule Prismatic.Intel.LegalIntelligence do
  @moduledoc """
  Extracts and analyzes litigation intelligence from Czech court decisions,
  integrating with entity profiles from ARES and other corporate registries.
  """

  def litigation_profile(ico) do
    with {:ok, ares_entity} <- Ares.get_by_ico(ico),
         {:ok, decisions} <- CzechCourts.litigation_history(ico: ico),
         {:ok, insolvency} <- InsolvencniRejstrik.check(ico),
         {:ok, uohs} <- Uohs.decisions(ico: ico) do
      {:ok, %LitigationProfile{
        entity: ares_entity,
        court_decisions: decisions,
        insolvency_status: insolvency,
        competition_decisions: uohs,
        risk_score: calculate_litigation_risk(decisions),
        patterns: detect_litigation_patterns(decisions),
        recommendations: generate_risk_recommendations(decisions)
      }}
    end
  end
end
```

### Entity Due Diligence Integration

Court decision analysis is integrated into the platform's entity due diligence workflow. When an entity is profiled, the platform automatically searches the Courts Portal for relevant decisions, analyzes litigation patterns, and incorporates findings into the composite risk assessment alongside data from ARES, CUZK, Hlidac statu, and other Czech registries.

### Regulatory Trend Monitoring

The platform monitors new court decisions in key regulatory areas (financial services, data protection, competition law, environmental regulation) to detect enforcement trends and regulatory risk shifts. Systematic analysis of decision volumes, outcomes, and penalty levels provides early warning of changing regulatory postures.

## Best Practices

**Search by ICO When Possible**: Company ICO numbers are preserved in court decisions and provide more reliable search results than company names, which may appear in different forms or be partially obscured by anonymization.

**Check Multiple Court Levels**: A comprehensive litigation history requires searching across district, regional, and high courts. Supreme Court searches alone will miss first-instance and appellate decisions that were not appealed further.

**Analyze Decision Outcomes Contextually**: A high number of court cases does not necessarily indicate a problematic entity. Large companies naturally have more litigation. Analyze the nature, outcomes, and trends of litigation rather than raw case counts.

**Cross-Reference with Insolvency Register**: Court decisions related to insolvency proceedings should be cross-referenced with the Insolvency Register (insolvencni rejstrik) for complete procedural context and current status.

**Track Pending Proceedings**: The presence of ongoing litigation (identified through procedural decisions like usneseni) is as important as concluded cases. Pending proceedings represent unresolved risk exposure.

**Use ECLI for Citation**: The European Case Law Identifier (ECLI) provides a standardized, persistent citation format for Czech court decisions. Use ECLI identifiers for stable references in reports and documentation.

## Related Providers

- [Justice.cz](/osint/justice-cz/) - Czech Commercial Register for corporate entity details
- [Insolvencni rejstrik](/osint/insolvencni-rejstrik/) - Insolvency proceedings register
- [UOHS](/osint/uohs/) - Competition authority decisions and enforcement actions
- [Hlidac statu](/osint/hlidac-statu/) - Government watchdog with legal analytics
- [ARES](/osint/ares/) - Business entity identification for litigation search
- [CUZK](/osint/cuzk/) - Property records for asset tracing in judgment enforcement
- [CNB](/osint/cnb/) - Financial supervisory decisions for regulated entities

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)