+++
title = "UOHS"
weight = 16
[extra]
icon = "scale"
color = "blue"
category = "czech"
type = "company"
module = "Uohs"
source_type = "legal"
description = "Czech Competition Authority - public decisions on antitrust, mergers, public procurement oversight, and state aid"
has_api = false
url = "https://www.uohs.cz"
rate_limit = "Web scraping only, no official API"
capabilities = ["Antitrust Decisions", "Merger Approvals", "Public Procurement Reviews", "State Aid Decisions", "Cartel Investigations", "Market Dominance Cases"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1535
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["UOHS", "Czech", "Competition", "Authority", "osint", "Prismatic Platform", "Description"]
tags = ["osint", "czech", "uohs", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "UOHS - Prismatic Platform"
+++

## Overview

UOHS (Urad pro ochranu hospodarske souteze -- the Office for the Protection of Competition) is the Czech national authority responsible for competition law enforcement, merger control, public procurement supervision, and state aid monitoring. Established in 1991, UOHS operates as an independent administrative authority with broad investigative and decision-making powers. The office publishes its administrative decisions, which contain detailed information about investigated companies, market analyses, penalties imposed, and remedies required. These decisions represent one of the richest sources of competitive intelligence available in the Czech Republic.

For [OSINT](/glossary/osint/) analysts, UOHS decisions reveal competitive dynamics between companies, attempted mergers and acquisitions that may not be publicly announced otherwise, cartel behavior, abuse of market dominance, and irregularities in public procurement processes. The decisions often contain non-public business information disclosed during investigations, including market share data, pricing strategies, supply agreements, and internal company communications that were obtained through UOHS's investigative powers. This makes UOHS an intelligence source of exceptional depth for understanding Czech corporate competitive behavior.

UOHS exercises four primary competencies. First, competition law enforcement: investigating and sanctioning cartels, abuse of dominant position, and other anticompetitive agreements under Czech Act No. 143/2001 Sb. and EU competition law. Second, merger control: reviewing and approving or blocking mergers and acquisitions that meet notification thresholds. Third, public procurement supervision: reviewing challenged procurement procedures and sanctioning contracting authorities for procedural violations. Fourth, state aid monitoring: assessing the compatibility of state support measures with EU state aid rules.

The office's decision database spans decades of enforcement history, providing longitudinal intelligence on corporate behavior, market evolution, and regulatory patterns. Decision texts are published in Czech and typically run from 10 to several hundred pages, making them among the most detailed public sources of business intelligence available for Czech companies.

## Data Sources and Coverage

UOHS publishes decisions through its online database (sbirky rozhodnuti), searchable by various criteria.

| Decision Category | Description | Annual Volume |
|------------------|-------------|---------------|
| **Antitrust Decisions** | Cartels, abuse of dominance, anticompetitive agreements | 50-100 |
| **Merger Decisions** | Approval, conditional approval, or prohibition of concentrations | 100-200 |
| **Procurement Reviews** | Decisions on challenged public procurement procedures | 500-1,000 |
| **State Aid Assessments** | Compatibility reviews of state support measures | 20-50 |
| **Penalty Decisions** | Fines and sanctions imposed on violating entities | 50-100 |
| **Interim Measures** | Temporary orders during ongoing investigations | 10-20 |

### Data Fields in Decisions

| Field | Type | Description |
|-------|------|-------------|
| **Case Number** | string | Unique case identifier (e.g., S0123/2025/KS) |
| **Decision Date** | date | Date the decision was issued |
| **Decision Type** | enum | First-instance, appeal (Chairman), final |
| **Parties** | array | All companies and entities involved |
| **Market Definition** | text | Relevant market analysis and definition |
| **Market Shares** | data | Market share percentages (often redacted ranges) |
| **Penalty Amount** | number | Fine imposed (if applicable) in CZK |
| **Legal Basis** | reference | Applicable Czech and EU legal provisions |
| **Remedies** | text | Behavioral or structural remedies imposed |
| **Appeal Status** | enum | Final, appealed to Chairman, court review |

### Decision Classification Codes

| Code Prefix | Domain | Description |
|-------------|--------|-------------|
| **S** | Cartels | Anticompetitive agreements (Section 3 Act 143/2001) |
| **S** (HS) | Mergers | Concentration assessment |
| **VZ** | Procurement | Public procurement review |
| **R** | Appeals | Chairman's appeal decisions |
| **P** | State Aid | State aid compatibility assessments |

## API Integration

UOHS does not provide an official API. Decision documents are published on the UOHS website in the collections database. Access requires web scraping or manual search. The Prismatic adapter handles structured extraction from published decision documents.

### Access Methods

| Method | Description | Data Freshness |
|--------|-------------|---------------|
| **Decision Database** | Searchable web interface at uohs.cz/cs/sbirky-rozhodnuti | Within days of issuance |
| **Annual Reports** | Comprehensive activity reports with statistics | Annual |
| **Press Releases** | Summaries of significant decisions | Same-day for major cases |
| **InfoDesk** | FOI request system for additional documents | On request (15 days) |
| **EU ECN** | Cross-referencing with European Competition Network | Varies |

## Query Examples

### curl Examples

```bash
# UOHS decision database search (web scraping required)
# Note: No official API - these are illustrative extraction patterns

# Search decisions by company name
curl "https://www.uohs.cz/cs/sbirky-rozhodnuti.html?query=Agrofert"

# Search decisions by case number
curl "https://www.uohs.cz/cs/sbirky-rozhodnuti.html?query=S0123/2025"

# Search merger decisions
curl "https://www.uohs.cz/cs/hospodarska-soutez/sbirky-rozhodnuti/spojovani-soutezitelu.html"

# Search procurement review decisions
curl "https://www.uohs.cz/cs/verejne-zakazky/sbirky-rozhodnuti.html"

# Download annual report
curl -O "https://www.uohs.cz/download/Informacni_listy/vyrocni_zpravy/VZ_2025.pdf"
```

### Elixir Integration

```elixir
# Search decisions by company name
{:ok, decisions} = PrismaticOsint.Uohs.search("Agrofert",
  category: :all,
  year_from: 2020
)
# => %{
#   total: 12,
#   decisions: [
#     %{case_number: "S0456/2024/KS", date: ~D[2024-06-15],
#       type: :merger, parties: ["AGROFERT, a.s.", "Target s.r.o."],
#       summary: "Merger approved without conditions",
#       penalty: nil, market: "agricultural inputs"},
#     %{case_number: "S0123/2023/KS", date: ~D[2023-03-20],
#       type: :antitrust, parties: ["AGROFERT, a.s.", "Competitor a.s."],
#       summary: "Investigation into alleged abuse of dominance",
#       penalty: 15_000_000, market: "fertilizer distribution"}
#   ]
# }

# Get detailed decision document
{:ok, decision} = PrismaticOsint.Uohs.get_decision("S0456/2024/KS")
# => %{
#   case_number: "S0456/2024/KS",
#   decision_date: ~D[2024-06-15],
#   category: :merger,
#   parties: [
#     %{name: "AGROFERT, a.s.", ico: "26185610", role: :acquiring},
#     %{name: "Target s.r.o.", ico: "12345678", role: :target}
#   ],
#   market_definition: "Relevant market: wholesale distribution of...",
#   market_shares: %{acquiring: "30-40%", target: "5-10%", combined: "35-50%"},
#   decision: :approved_unconditional,
#   penalty: nil,
#   full_text_url: "https://www.uohs.cz/..."
# }

# Get procurement review decisions for a contracting authority
{:ok, reviews} = PrismaticOsint.Uohs.procurement_reviews(
  contracting_authority: "Ministerstvo dopravy",
  year: 2025
)
# => %{
#   total: 8,
#   reviews: [
#     %{case_number: "VZ0789/2025", procurement_name: "Highway IT System",
#       complainant: "IT Company s.r.o.", result: :violation_found,
#       remedy: :procurement_annulled}
#   ]
# }

# Analyze a company's competition history
{:ok, profile} = PrismaticOsint.Uohs.competition_profile("12345678")
# => %{
#   entity: "Example Corp a.s.",
#   ico: "12345678",
#   merger_history: [%{year: 2024, target: "Small Co", result: :approved}],
#   antitrust_history: [%{year: 2022, type: :cartel, penalty: 5_000_000}],
#   procurement_complaints: 3,
#   total_penalties: 5_000_000,
#   risk_level: :medium
# }

# Cross-reference with other Czech registries
{:ok, enriched} = PrismaticOsint.Pipeline.competitive_intelligence("12345678",
  sources: [:uohs, :ares, :justice_cz, :verejne_zakazky, :registr_smluv]
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `case_number` | string | Unique UOHS case identifier |
| `decision_date` | date | Date of decision issuance |
| `category` | enum | `antitrust`, `merger`, `procurement`, `state_aid` |
| `subcategory` | string | Specific violation or transaction type |
| `parties[].name` | string | Legal name of involved entity |
| `parties[].ico` | string | Company identification number |
| `parties[].role` | enum | `investigated`, `complainant`, `acquiring`, `target` |
| `market_definition` | text | Relevant market analysis |
| `market_shares` | object | Market share data (often ranges) |
| `decision_outcome` | enum | `approved`, `conditional`, `prohibited`, `violation_found`, `dismissed` |
| `penalty_czk` | number | Fine amount in CZK (if applicable) |
| `remedies` | array | Behavioral or structural remedies |
| `legal_basis` | array | Applicable legal provisions |
| `appeal_status` | enum | `final`, `appealed`, `court_review` |
| `full_text_url` | string | URL to full decision document (PDF) |

## Use Cases

### Competitive Intelligence

UOHS merger decisions contain detailed market analyses including market definitions, market share estimates, competitive assessments, and barrier-to-entry analysis. This information is normally proprietary and unavailable through any other public source. For competitive intelligence analysts, UOHS merger reviews are among the most valuable open sources of market intelligence for Czech industries.

### Due Diligence and Risk Assessment

Companies with UOHS enforcement history carry elevated regulatory risk. Antitrust investigations, cartel penalties, and procurement violations indicate past compliance failures that may recur. Due diligence on potential business partners, acquisition targets, or counterparties should always include UOHS decision history to assess regulatory risk.

### Cartel Detection and Investigation

UOHS cartel decisions reveal the mechanics of anticompetitive behavior in Czech markets, including how cartels were organized, how pricing was coordinated, and how the cartel was detected. This information helps analysts identify potential cartel indicators in other markets: unusually stable market shares, parallel pricing behavior, and bid rotation patterns.

### Public Procurement Integrity

UOHS procurement review decisions identify specific irregularities in public procurement procedures: discriminatory qualification criteria, improper evaluation of bids, unjustified exclusion of bidders, and procedural violations by contracting authorities. Cross-referencing these decisions with [Verejne zakazky](/osint/verejne-zakazky/) procurement data reveals which agencies have problematic procurement practices.

### Merger and Acquisition Tracking

UOHS merger notifications provide early intelligence on corporate transactions that may not be publicly announced until completion. The merger decision database reveals which companies are actively acquiring, the markets they are entering, and the regulatory conditions imposed on their transactions.

### State Aid Analysis

UOHS state aid decisions reveal which sectors and companies receive government support and whether that support complies with EU rules. This intelligence is valuable for understanding government industrial policy priorities and identifying companies that benefit from preferential state treatment.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **No official API** | Data extraction requires web scraping or manual search | Use Prismatic adapter for structured extraction |
| **Czech language only** | Decisions published in Czech without English translations | Use machine translation; key terms are standardized |
| **Redacted data** | Commercially sensitive data (exact market shares, prices) often redacted | Use published ranges; cross-reference with industry data |
| **Decision length** | Major decisions can span hundreds of pages | Use NLP extraction for key entities and facts |
| **Publication delay** | Some decisions delayed pending appeal or confidentiality review | Monitor press releases for early notification |
| **Search limitations** | Web search interface has limited filtering capabilities | Build local index of extracted decision metadata |

## Legal and Ethical Considerations

**Public Administrative Decisions**: UOHS decisions are public administrative acts published pursuant to Czech administrative procedure law. There are no legal restrictions on accessing, analyzing, or referencing published decisions.

**Commercially Sensitive Information**: While decisions are public, they may contain information that is commercially sensitive for the involved companies. Responsible use includes understanding the context and avoiding misrepresentation of findings.

**Ongoing Proceedings**: Be aware that first-instance UOHS decisions may be appealed and reversed. Verify the final status of decisions before drawing conclusions.

**Court Review**: UOHS decisions can be challenged before Czech administrative courts. Court judgments may modify, annul, or confirm UOHS decisions. Check court records for decisions that have been judicially reviewed.

## Integration with Prismatic Platform

Within the [Prismatic Platform](/apps/prismatic/), UOHS serves as the primary regulatory intelligence source for Czech competition and procurement oversight.

- **Entity Risk Scoring**: UOHS enforcement history feeds into entity risk profiles, with antitrust violations, procurement sanctions, and merger conditions contributing to regulatory risk scores.
- **Competitive Intelligence**: UOHS market analyses from merger decisions are extracted and indexed, providing market share and competitive dynamics intelligence.
- **Procurement Analytics**: UOHS procurement review decisions are cross-referenced with [Verejne zakazky](/osint/verejne-zakazky/) and [Hlidac statu](/osint/hlidac-statu/) data for comprehensive procurement integrity analysis.
- **Cross-Registry Enrichment**: UOHS parties are matched against [ARES](/osint/ares/) company data and [Justice.cz](/osint/justice-cz/) ownership information for complete entity profiles.
- **Penalty Tracking**: The platform tracks cumulative UOHS penalties across related entities to assess group-level regulatory exposure.
- **M&A Intelligence**: Merger notifications and decisions feed into the platform's corporate transaction tracking capabilities.

## Best Practices

1. **Search by ICO, not just name**: Company names may vary across decisions (abbreviations, legal form changes). Use the ICO for precise entity matching.

2. **Check appeal status**: First-instance UOHS decisions may be overturned on appeal. Always check whether a decision is final before relying on its findings.

3. **Read the full market analysis**: Merger decisions contain detailed market definitions and competitive assessments that are unavailable elsewhere. Extract this intelligence systematically.

4. **Cross-reference penalties with company size**: A penalty of CZK 10 million means different things for a small company versus a multinational. Assess penalty significance relative to company turnover from [ARES](/osint/ares/).

5. **Track procurement patterns**: Repeated procurement review decisions against the same contracting authority may indicate systemic procurement governance issues.

6. **Monitor press releases**: UOHS publishes press releases for significant decisions before full decision texts are available. Set up monitoring for early intelligence.

7. **Consider EU-level decisions**: For large Czech companies, also check European Commission competition decisions (DG Competition) for EU-level enforcement.

## Related Providers

- [Verejne zakazky](/osint/verejne-zakazky/) - Public procurement portal reviewed by UOHS
- [ARES](/osint/ares/) - Czech business registry for entity identification
- [Justice.cz](/osint/justice-cz/) - Commercial Register for company structure and ownership
- [Hlidac statu](/osint/hlidac-statu/) - Government watchdog with procurement analytics
- [Registr smluv](/osint/registr-smluv/) - Czech Contract Registry for post-procurement contracts
- [CEDR](/osint/cedr/) - Central Register of Subsidies for state aid cross-reference

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)