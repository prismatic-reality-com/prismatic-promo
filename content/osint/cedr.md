+++
title = "CEDR"
weight = 15
[extra]
icon = "chart-bar"
color = "blue"
category = "czech"
type = "company"
module = "Cedr"
source_type = "financial"
description = "Czech Central Register of Subsidies - tracking EU and national subsidies, grants, and dotace"
has_api = true
url = "https://cedr.mfcr.cz"
rate_limit = "No official limit, public open data"
capabilities = ["Subsidy Search", "Recipient Lookup", "Program Tracking", "EU Funds Monitoring", "Financial Flow Analysis", "Cross-Reference by ICO"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1572
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["CEDR", "Czech", "Central", "Register", "Subsidies", "osint", "Prismatic Platform", "ERDF"]
tags = ["osint", "czech", "cedr", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "CEDR - Prismatic Platform"
+++

## Overview

CEDR (Centralni evidence dotaci z rozpoctu) is the Czech Central Register of Subsidies, operated and maintained by the Ministry of Finance of the Czech Republic (Ministerstvo financi CR). Established under Act No. 218/2000 Coll. on Budgetary Rules (zakon o rozpoctovych pravidlech) and subsequently modernized through implementing regulations, CEDR serves as the authoritative national database recording all subsidies, grants, financial contributions, and returnable financial assistance (dotace) provided from the Czech state budget, state funds, EU structural and investment funds, and other public financial mechanisms.

Since its inception in the early 2000s with significant modernization around 2010, CEDR has been the single source of truth for tracking how public funds flow from government programs through providing bodies to individual recipients. The register captures the complete lifecycle of subsidy disbursement: from initial program allocation through recipient selection, payment execution, project implementation, and eventual verification or return of unused funds. This comprehensive recording, mandated by law, makes CEDR an indispensable tool for public accountability, investigative analysis, and financial due diligence in the Czech context.

For [OSINT](/glossary/osint/) analysts and investigators, CEDR reveals critical financial intelligence about entities operating in the Czech Republic. The register answers fundamental questions: Which companies and organizations receive public funding? How much do they receive, from which programs, and over what time periods? Are there patterns suggesting subsidy dependency, concentration of funds, or potential irregularities? This data is essential for detecting subsidy fraud, mapping government-dependent entities, assessing the financial sustainability of organizations, and performing comprehensive due diligence.

The Czech legal framework mandates that all providers of public funds -- ministries, state agencies, regional authorities (kraje), municipalities, and other public bodies -- must register every subsidy disbursement in CEDR. This legal obligation, enforced through budgetary oversight mechanisms and audit by the Supreme Audit Office (NKU), ensures near-complete coverage of the Czech public funding landscape. The register currently contains records spanning over two decades, covering hundreds of billions of Czech crowns in disbursed funds across thousands of programs and hundreds of thousands of recipients.

## Data Sources and Coverage

CEDR's data originates from mandatory reporting by all Czech public subsidy providers. The register covers the full spectrum of public financial assistance available in the Czech Republic, from small municipal grants to multi-billion crown EU structural fund disbursements.

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **Subsidy Recipients** | Entity name, ICO (company identification number), address, legal form | All recipients since early 2000s |
| **Grant Details** | Program name, provider ministry/agency, amount awarded, amount disbursed | Complete payment records |
| **EU Structural Funds** | ERDF, ESF, Cohesion Fund, EAFRD with specific operational program | All EU fund disbursements in CZ |
| **Payment History** | Individual payment dates, amounts, and milestones | Transaction-level detail |
| **Project Information** | Project name, purpose description, implementation period, region | Project-level metadata |
| **Return/Sanction Data** | Amounts returned, penalties for misuse, audit findings | Compliance outcomes |
| **Provider Details** | Ministry, agency, state fund, or regional authority providing the subsidy | All public providers |
| **Program Hierarchy** | Program structure, sub-programs, calls for proposals | Multi-level program tracking |

### EU Funding Programs Covered

| Program | EU Fund Source | Programming Period |
|---------|---------------|-------------------|
| **OP Podnikani a inovace pro konkurenceschopnost** | ERDF | 2014-2020, 2021-2027 |
| **OP Zamestnanost plus** | ESF+ | 2014-2020, 2021-2027 |
| **OP Zivotni prostredi** | CF/ERDF | 2014-2020, 2021-2027 |
| **OP Doprava** | CF/ERDF | 2014-2020, 2021-2027 |
| **Integrovany regionalni OP** | ERDF/ESF | 2014-2020, 2021-2027 |
| **Program rozvoje venkova** | EAFRD | 2014-2020, 2021-2027 |
| **OP Vyzkum, vyvoj a vzdelavani** | ERDF/ESF | 2014-2020, 2021-2027 |
| **National Subsidy Programs** | Czech state budget | Ongoing, various ministries |
| **EEA/Norway Grants** | EEA/Norway mechanism | Current programming period |

### Czech Legal Framework

CEDR operates within a well-defined legal context that governs public fund disbursement and transparency:

- **Act No. 218/2000 Coll.** (Budgetary Rules) - Primary legal basis mandating subsidy registration
- **Act No. 250/2000 Coll.** (Budgetary Rules for Territorial Self-Governing Units) - Regional subsidy requirements
- **Act No. 320/2001 Coll.** (Financial Control Act) - Audit and verification framework
- **EU Regulation No. 1303/2013** and successors - EU structural fund management requirements
- **Government Resolution No. 158/2014** - CEDR open data publication mandate

## Technical Architecture

CEDR provides open data access through its portal at `https://cedropendata.mfcr.cz/` with a [REST API](/glossary/rest-api/) supporting queries against the full subsidy database. The system follows standard REST conventions with JSON and CSV response formats, and requires no authentication for public data access.

### API Endpoints

| Endpoint | Description | Key Parameters |
|----------|-------------|----------------|
| `/api/v1/dotace` | Search subsidies by various criteria | ico, program, provider, year range, amount |
| `/api/v1/prijemce` | Search and list subsidy recipients | ico, name, address, legal form |
| `/api/v1/programy` | List and search subsidy programs | provider, year, fund source, status |
| `/api/v1/poskytovatele` | List subsidy providers (ministries, agencies) | name, type, region |
| `/api/v1/export` | Bulk data export for offline analysis | format (json, csv), date range, program |

The API supports pagination for large result sets with standard `offset` and `limit` parameters. Filtering is available by recipient ICO, subsidy provider, program identifier, date range, amount thresholds, EU fund source, and geographic region. Bulk data exports enable comprehensive offline analysis of the entire database.

## API Integration

```elixir
defmodule PrismaticOsint.Providers.Cedr do
  @moduledoc """
  CEDR (Central Register of Subsidies) integration for tracking
  public fund disbursements to Czech entities. Provides subsidy
  intelligence for financial due diligence and fraud detection.

  Legal basis: Act No. 218/2000 Coll. on Budgetary Rules.
  Data source: Ministry of Finance of the Czech Republic.
  """

  @behaviour PrismaticOsint.Provider

  @base_url "https://cedropendata.mfcr.cz/api/v1"

  @spec search_by_ico(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
  @doc "Get all subsidies received by an entity identified by ICO."
  def search_by_ico(ico, opts \\ []) do
    params = %{
      ico: ico,
      rok_od: Keyword.get(opts, :year_from),
      rok_do: Keyword.get(opts, :year_to)
    }

    get("/dotace", params)
  end

  @spec search_by_program(String.t(), keyword()) :: {:ok, list(map())} | {:error, term()}
  @doc "Get all recipients of a specific subsidy program."
  def search_by_program(program_id, opts \\ []) do
    params = %{
      program: program_id,
      limit: Keyword.get(opts, :limit, 100),
      offset: Keyword.get(opts, :offset, 0)
    }

    get("/dotace", params)
  end

  @spec total_subsidies(String.t()) :: {:ok, map()} | {:error, term()}
  @doc "Calculate total subsidies received by an entity across all programs."
  def total_subsidies(ico) do
    with {:ok, subsidies} <- search_by_ico(ico) do
      total = Enum.reduce(subsidies, 0, &(&1.castka_cerpani + &2))
      programs = subsidies |> Enum.map(& &1.program) |> Enum.uniq()

      {:ok, %{
        ico: ico,
        total_czk: total,
        subsidy_count: length(subsidies),
        unique_programs: length(programs),
        programs: programs
      }}
    end
  end

  @spec eu_funds_by_ico(String.t()) :: {:ok, list(map())} | {:error, term()}
  @doc "Get only EU-funded subsidies for an entity."
  def eu_funds_by_ico(ico) do
    with {:ok, subsidies} <- search_by_ico(ico) do
      eu_only = Enum.filter(subsidies, &(&1.zdroj_eu != nil))
      {:ok, eu_only}
    end
  end
end
```

### Subsidy Dependency Analysis Pipeline

```elixir
defmodule PrismaticPerimeter.Financial.SubsidyAnalysis do
  @moduledoc """
  Analyzes entity dependency on public subsidies by correlating
  CEDR data with ARES company profiles, Registr smluv contracts,
  and Hlidac statu analytics for comprehensive financial intelligence.
  """

  @spec analyze_subsidy_dependency(String.t()) :: {:ok, map()} | {:error, term()}
  def analyze_subsidy_dependency(ico) do
    tasks = [
      Task.async(fn -> PrismaticOsint.Providers.Cedr.search_by_ico(ico) end),
      Task.async(fn -> PrismaticOsint.Providers.Ares.get_full_details(ico) end),
      Task.async(fn -> PrismaticOsint.Providers.RegistrSmluv.search(ico) end),
      Task.async(fn -> PrismaticOsint.Providers.HlidacStatu.entity_profile(ico) end)
    ]

    [subsidies, company, contracts, watchdog] = Task.await_many(tasks, 30_000)

    {:ok, %{
      entity: extract_ok(company),
      subsidies: extract_ok(subsidies),
      public_contracts: extract_ok(contracts),
      watchdog_profile: extract_ok(watchdog),
      dependency_ratio: calculate_dependency_ratio(subsidies, company),
      provider_concentration: assess_provider_concentration(subsidies),
      temporal_pattern: analyze_temporal_distribution(subsidies),
      fraud_indicators: detect_anomalies(subsidies, contracts),
      analyzed_at: DateTime.utc_now()
    }}
  end
end
```

## Use Cases

### Financial Due Diligence

CEDR is essential for due diligence on Czech entities, particularly in M&A transactions, investment decisions, and partnership assessments. The register reveals whether a target entity is heavily dependent on public subsidies, which programs fund its operations, and whether it has any history of subsidy misuse or forced returns. An entity deriving a substantial portion of its revenue from non-recurring government grants may present sustainability risks that must be factored into valuation. Cross-referencing CEDR data with financial statements from the [Justice.cz](/osint/justice-cz/) commercial register's collection of deposited accounts (sbirka listin) enables precise calculation of subsidy dependency ratios.

### Subsidy Fraud Detection

Pattern analysis across CEDR data can reveal potential subsidy fraud indicators: entities receiving disproportionate funding relative to their declared size and activities, companies with suspiciously similar ownership structures receiving funds from the same programs, recipients that consistently fail to complete funded projects resulting in return obligations, and entities with patterns of receiving funds shortly before entering insolvency proceedings. Cross-referencing with [ARES](/osint/ares/) company data, [Insolvency Registry](/osint/insolvencni-rejstrik/) proceedings, and [Court Cases](/osint/court-cases/) strengthens fraud detection capabilities.

### EU Fund Flow Analysis

As an EU member state, the Czech Republic receives billions of euros in structural and investment funds each programming period. CEDR tracks how these EU funds flow through Czech operational programs to individual recipients, enabling analysis of fund distribution patterns, regional allocation equity, absorption rates, and the effectiveness of EU cohesion policy implementation. This analysis is valuable for EU institutions, audit bodies, and research organizations studying the impact of EU funding in Central Europe.

### Public Accountability and Investigative Journalism

CEDR's open data mandate enables investigative journalists and civil society organizations (such as [Hlidac statu](/osint/hlidac-statu/)) to scrutinize public fund distribution. The data supports analyses of political patronage patterns, geographic distribution fairness, industry concentration, and the relationship between subsidy recipients and political actors or decision-makers.

### Competitive Intelligence

Understanding which competitors receive public subsidies, from which programs, and in what amounts provides strategic intelligence about their capabilities, investments, and government relationships. CEDR data reveals R&D investment patterns (through innovation program subsidies), expansion plans (through regional development grants), and workforce development initiatives (through ESF training subsidies).

## Data Quality and Reliability

**Strengths**: CEDR data is legally mandated reporting from official public sources, enforced through budgetary oversight and audit mechanisms. The register's ICO-based identification system enables precise, unambiguous entity matching across the Czech administrative ecosystem. Historical data spanning two decades supports longitudinal trend analysis. The open data portal provides machine-readable access without authentication barriers.

**Limitations**: Data entry quality depends on the reporting practices of individual providing bodies, and some records may have incomplete project descriptions, delayed reporting, or inconsistent categorization. The register does not capture subsidies from private foundations, international organizations outside the EU framework, or bilateral government aid programs not channeled through the state budget. Financial amounts are denominated in Czech crowns (CZK), requiring currency conversion for international comparisons. Very small subsidies may have less detailed metadata.

**Mitigation**: The Prismatic Platform cross-references CEDR data with [Hlidac statu](/osint/hlidac-statu/) analytics (which independently processes and enriches CEDR data), [ARES](/osint/ares/) company records for entity validation, and [Registr smluv](/osint/registr-smluv/) contract data for a complete picture of entity-state financial relationships.

## Platform Integration

| Integration Point | Description | Component |
|-------------------|-------------|-----------|
| **Financial Intelligence** | Subsidy data enriches entity financial profiles | `PrismaticOsint.Financial` |
| **Due Diligence Pipeline** | Subsidy history included in entity assessment workflows | `PrismaticPerimeter.DueDiligence` |
| **Czech Entity Pipeline** | CEDR correlated with ARES, Justice.cz, Registr smluv, Hlidac statu | `PrismaticOsint.Czech` |
| **Fraud Detection** | Anomaly pattern analysis for subsidy fraud indicators | `PrismaticOsint.FraudDetection` |
| **EU Compliance** | EU fund tracking and compliance verification | `PrismaticCompliance.EU` |

## NABLA Compliance

| Axiom | Implementation |
|-------|----------------|
| **Signal Plurality** | CEDR data always correlated with ARES, Hlidac statu, and Registr smluv before conclusions |
| **Contradiction Preservation** | Discrepancies between CEDR amounts and entity financial statements preserved for investigation |
| **Time Decay** | Recent subsidy data weighted higher in dependency analysis; historical patterns provide context |
| **Source Independence** | Official government register provides independent signal from commercial data aggregators |
| **Provenance Mandatory** | Every subsidy record includes provider, program, payment dates, and legal basis |
| **Unknown Valid** | Absence from CEDR does not confirm absence of all public funding (municipal-level gaps possible) |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **API Response Time** | 200-800ms | Single ICO query with full history |
| **Bulk Export** | 1-10 minutes | Depending on dataset size and format |
| **Data Freshness** | Monthly updates | Aligned with provider reporting cycles |
| **Historical Depth** | 20+ years | From early 2000s to present |
| **Record Volume** | Millions of disbursement records | Complete national coverage |
| **Program Coverage** | Thousands of programs | All ministries, agencies, and funds |

## Related Resources

- [Registr smluv](/osint/registr-smluv/) - Czech Contract Registry for public spending correlation
- [Hlidac statu](/osint/hlidac-statu/) - Government watchdog aggregating and enriching subsidy analytics
- [ARES](/osint/ares/) - Czech business registry for recipient entity identification and validation
- [Verejne zakazky](/osint/verejne-zakazky/) - Public procurement portal for complete public spending view
- [EU Sanctions](/osint/eu-sanctions/) - Sanctions screening for subsidy recipients
- [Justice.cz](/osint/justice-cz/) - Commercial register for beneficial ownership and financial statements

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)