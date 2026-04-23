+++
title = "municipal-court-specialist"
weight = 262
[extra]
domain = "prague"
level = "L3"
description = "Analysis of Prague Municipal Court proceedings and case outcomes"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "aiad", "nabla-infinity", "garden", "zkb", "nis2", "no-doubts", "seadf", "telemetry", "no-mercy"]
domain_normalized = "czech"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2200
quality_score = 82
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["municipal-court-specialist", "Analysis", "Prague", "Municipal", "Court", "agents", "agent", "Prismatic Platform", "Czech", "InfoSoud"]
tags = ["agents", "agent", "municipal-court-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "municipal-court-specialist - Prismatic Platform"
+++

## Overview

The municipal-court-specialist operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's Prague intelligence domain, responsible for systematic analysis of Prague Municipal Court (Mestsky soud v Praze) proceedings, case outcomes, and judicial patterns. This agent collects, structures, and analyzes publicly available court data to support due diligence investigations, corporate risk assessment, and regulatory compliance analysis. The Prague Municipal Court serves as both a first-instance court for significant civil and criminal matters and an appellate court for district courts within Prague, making it a critical intelligence source for Czech business intelligence operations.

Built on the [AIAD](/glossary/aiad/) standard and leveraging the platform's [OSINT](/glossary/osint/) infrastructure, this agent processes court records from the Czech judiciary's public information systems (InfoSoud, InfoJednani) and the Insolvency Registry (ISIR). All intelligence outputs comply with [NABLA Infinity](/glossary/nabla-infinity/) axioms: every court finding requires corroboration from official sources, and all entity identifications carry confidence scores based on matching criteria completeness.

## Operational Domain

The Prague court intelligence domain covers civil proceedings (contract disputes, property claims, corporate governance), commercial matters (insolvency proceedings, company dissolutions, debt recovery), criminal cases with corporate relevance (fraud, embezzlement, economic crime), and administrative proceedings (regulatory enforcement, permit disputes). The agent maintains a continuously updated database of court proceedings linked to entity profiles through the platform's [entity resolution](/glossary/entity-resolution/) capabilities.

| Court Division | Jurisdiction | Intelligence Value |
|---------------|-------------|-------------------|
| Civil Division | Contract disputes, property, damages | Corporate liability assessment |
| Commercial Division | Insolvency, company law, trademarks | Financial risk indicators |
| Criminal Division | Economic crime, fraud, corruption | Integrity due diligence |
| Administrative Division | Regulatory appeals, permits | Compliance history tracking |
| Appellate Division | District court appeals | Precedent and trend analysis |
| Enforcement Division | Judgment execution, seizures | Asset recovery intelligence |

## Key Capabilities

- **Court record collection** -- Systematically collects publicly available court records from InfoSoud (case tracking), InfoJednani (hearing schedules), and ISIR (insolvency registry), maintaining a structured local database of proceedings
- **Entity-case linking** -- Resolves court party identifications against the platform's entity database using name matching, ICO (company identification number) correlation, and date-of-birth verification for natural persons
- **Judicial pattern analysis** -- Identifies patterns in court outcomes across judges, case types, and time periods, revealing systemic trends in judicial decision-making for risk assessment
- **Insolvency monitoring** -- Provides continuous monitoring of the Czech Insolvency Registry for new filings, creditor claims, and resolution proceedings affecting entities of interest
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed court record collection cycles and entity monitoring alerts
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing collection metrics, entity resolution rates, and data freshness indicators

## Court Intelligence Pipeline

```elixir
defmodule Prismatic.Prague.CourtIntelligence do
  @moduledoc """
  Collects and analyzes Prague Municipal Court proceedings
  from public Czech judiciary information systems.
  """

  alias Prismatic.Prague.{InfoSoud, ISIR, EntityResolver}

  @type court_record :: %{
    case_number: String.t(),
    court: String.t(),
    division: atom(),
    parties: [party()],
    filing_date: Date.t(),
    status: atom(),
    outcomes: [outcome()]
  }

  @spec search_entity(String.t(), keyword()) :: {:ok, [court_record()]} | {:error, term()}
  def search_entity(entity_identifier, opts \\ []) do
    search_type = Keyword.get(opts, :type, :auto_detect)

    with {:ok, info_soud_results} <- InfoSoud.search(entity_identifier, search_type),
         {:ok, isir_results} <- ISIR.search(entity_identifier),
         {:ok, resolved} <- EntityResolver.resolve_parties(
           info_soud_results ++ isir_results
         ) do
      records =
        resolved
        |> deduplicate_records()
        |> enrich_with_outcomes()
        |> sort_by_relevance()

      emit_search_telemetry(entity_identifier, length(records))
      {:ok, records}
    end
  end

  @spec monitor_entity(String.t()) :: {:ok, monitor_ref()} | {:error, term()}
  def monitor_entity(entity_identifier) do
    Prismatic.Prague.CourtMonitor.register(entity_identifier, %{
      sources: [:info_soud, :isir, :info_jednani],
      check_interval: :timer.hours(6),
      alert_on: [:new_case, :insolvency_filing, :judgment, :enforcement]
    })
  end

  defp emit_search_telemetry(identifier, count) do
    :telemetry.execute(
      [:prismatic, :prague, :court_search],
      %{results_count: count},
      %{identifier: identifier, sources: [:info_soud, :isir]}
    )
  end
end
```

## Czech Legal Framework Context

| Legal Source | Relevance | Data Available |
|-------------|-----------|---------------|
| Act No. 99/1963 Sb. (Civil Procedure Code) | Civil proceedings structure | Case types, timelines, outcomes |
| Act No. 182/2006 Sb. (Insolvency Act) | Insolvency proceedings | Debtor status, creditor claims, reorganization |
| Act No. 89/2012 Sb. (Civil Code) | Substantive civil law | Contract and corporate disputes |
| Act No. 90/2012 Sb. (Business Corporations Act) | Corporate governance | Shareholder disputes, director liability |
| [ZKB](/glossary/zkb/) 264/2025 Sb. | Cybersecurity compliance | Court enforcement of security obligations |
| [NIS2](/glossary/nis2/) Directive (EU 2022/2555) | EU cybersecurity | Cross-border compliance proceedings |

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to orchestrate court intelligence collection operations and publish entity risk profiles based on judicial data.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/court search` | Search Prague Municipal Court records for specified entity | L3+ |
| `/court monitor` | Set up continuous monitoring for entity court activity | L3+ |
| `/court insolvency` | Query insolvency registry for specified company or person | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [linkedin-intelligence-specialist](/agents/linkedin-intelligence-specialist/) | Correlates professional profiles with court party identifications |
| [risk-intelligence-commander](/agents/risk-intelligence-commander/) | Court findings feed into corporate risk assessment models |
| [regulatory-intelligence-commander](/agents/regulatory-intelligence-commander/) | Regulatory enforcement proceedings inform compliance analysis |
| [reputation-risk-specialist](/agents/reputation-risk-specialist/) | Court proceedings with public interest feed reputation models |

## GARDEN Integration

The municipal-court-specialist leverages the [GARDEN](/glossary/garden/) legacy knowledge base for Czech legal domain expertise, including 20+ years of patterns from the `sig` repository's OSINT provider ecosystem. Historical court data processing patterns and entity resolution heuristics refined across the GARDEN repositories are directly applicable to the Prague court intelligence pipeline.

## Data Source Architecture

The municipal-court-specialist integrates with three primary Czech judiciary information systems, each providing distinct data types and access patterns.

### InfoSoud (Case Tracking)

InfoSoud (informacni system soudnictvi) is the public-facing case tracking system of the Czech judiciary. It provides basic case metadata including case numbers, filing dates, court division assignments, party names, and procedural milestones. The specialist queries InfoSoud through its public web interface, implementing structured parsing of HTML responses since no formal API is available. Queries support search by party name, ICO (company identification number), and case number. Rate limiting is applied to prevent excessive load on the public system.

### InfoJednani (Hearing Schedules)

InfoJednani provides hearing schedules and courtroom assignments for upcoming proceedings. This data is valuable for monitoring active cases: new hearing dates indicate case activity, while hearing cancellations or postponements may signal settlement negotiations or procedural delays. The specialist cross-references InfoJednani data with InfoSoud case records to build complete timeline views of case progression.

### ISIR (Insolvency Registry)

The ISIR (Insolvencni rejstrik) is the official Czech insolvency registry, providing comprehensive data on insolvency proceedings including debtor identification, creditor claims, trustee assignments, and resolution outcomes. ISIR data is particularly valuable for financial risk assessment because insolvency filings are a strong indicator of financial distress. The specialist monitors ISIR for new filings affecting entities in the platform's monitoring portfolio and correlates insolvency data with court proceedings in InfoSoud to build complete pictures of entities in financial difficulty.

## Entity Resolution for Czech Entities

Entity resolution in the Czech legal context presents specific challenges. Natural persons are identified by name and date of birth (rodno cislo is not publicly available), requiring fuzzy matching that accounts for Czech name declension patterns (nominative vs. genitive case forms). Legal entities are identified by ICO (identification number), which provides a reliable unique identifier, but court records do not always include ICO references, requiring fallback to name-based matching with address verification.

The specialist implements a multi-pass resolution strategy: first attempting exact ICO matching (highest confidence), then name-plus-address matching (high confidence), then name-only matching with disambiguation through additional attributes (moderate confidence). Matches below the moderate confidence threshold are flagged for manual review rather than automatically linked.

## Intelligence Products

The municipal-court-specialist produces structured intelligence products that integrate court data into the platform's broader entity risk assessment framework. Court intelligence products include entity litigation profiles (complete court history for a specific entity), sector litigation analysis (patterns across multiple entities in a business sector), judicial trend reports (outcome patterns across judges or court divisions), and insolvency early warning alerts (indicators of financial distress detected through court filings before formal insolvency proceedings begin).

## Enforcement

All court intelligence outputs comply with the [NO MERCY](/glossary/no-mercy/) doctrine: no entity-case linkage is published without verified identification matching, all court findings carry provenance chains to official sources, and intelligence products clearly distinguish between confirmed facts and analytical assessments. The [NO DOUBTS](/glossary/no-doubts/) principle mandates that every court record attribution passes entity resolution confidence thresholds before inclusion in risk assessments. [NABLA Infinity](/glossary/nabla-infinity/) source independence is enforced by requiring corroboration across multiple court information systems.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)