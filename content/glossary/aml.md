+++
title = "AML (Anti-Money Laundering)"
weight = 8

[extra]
description = "Comprehensive regulatory framework of laws, regulations, and institutional procedures designed to detect, prevent, and report the laundering of criminal proceeds through the financial system, requiring rigorous customer due diligence, transaction monitoring, and suspicious activity reporting"
category = "intelligence"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "15 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "regulatory-compliance"
related_concepts = ["kyc", "sanctions-screening", "due-diligence", "beneficial-ownership", "compliance-framework"]
implementation_status = "production"
authority_level = "L4-command"
difficulty_rating = 8
prerequisites = ["compliance-framework", "risk-assessment", "entity-resolution"]
learning_path = "compliance-engineering"
interactive_demos = ["/labs/glossary/aml"]
code_examples = ["PrismaticDD.AML.screen/2", "PrismaticDD.SanctionsChecker.check/2", "PrismaticDD.RiskAssessor.assess/3"]
external_resources = ["FATF 40 Recommendations", "EU 6th Anti-Money Laundering Directive", "Czech AML Act 253/2008 Sb."]
version_introduced = "gen-12"
stability_level = "stable"
testing_scenarios = ["sanctions-list-matching", "pep-identification", "transaction-pattern-detection", "beneficial-ownership-resolution", "risk-scoring-consistency"]
keywords = ["anti-money laundering", "AML", "financial crime", "sanctions screening", "suspicious activity", "FATF", "compliance"]
tags = ["compliance", "aml", "financial-crime", "sanctions", "kyc", "due-diligence", "regulatory", "intelligence"]
related_terms = ["kyc", "sanctions-screening", "due-diligence", "beneficial-ownership", "risk-score", "entity-resolution", "compliance-framework", "pep-screening"]
abbreviation = "AML"
word_count = 1955
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "AML (Anti-Money Laundering) - Prismatic Platform"
+++

## Definition

Anti-Money Laundering (AML) encompasses the comprehensive framework of laws, regulations, institutional procedures, and technological systems designed to detect, prevent, and report the laundering of proceeds derived from criminal activity through the financial system. Money laundering transforms illicit funds into ostensibly legitimate assets through three canonical stages: placement (introducing illicit funds into the financial system), layering (creating complex transaction chains to obscure the funds' origin), and integration (reinvesting the laundered funds into legitimate commerce). In the Prismatic Platform, AML capabilities are operationalized through integrated OSINT intelligence gathering, sanctions screening against global watchlists, entity resolution across jurisdictions, and risk-scored due diligence workflows that produce audit-ready compliance documentation.

## Overview

Money laundering is among the oldest financial crimes, with historical roots predating modern banking. The term itself allegedly derives from Al Capone's use of laundromats to commingle illegal gambling and bootlegging revenue with legitimate business income during the 1920s Prohibition era. However, the modern AML regulatory framework emerged only in the late 20th century, driven by the recognition that financial systems were being systematically exploited by organized crime, drug trafficking, and eventually terrorism financing.

The evolution of AML regulation follows a clear trajectory of increasing scope and stringency:

| Year | Milestone | Impact |
|------|-----------|--------|
| 1970 | US Bank Secrecy Act (BSA) | First reporting requirements for financial institutions |
| 1986 | US Money Laundering Control Act | Made money laundering a federal crime |
| 1989 | FATF established (G7 Paris Summit) | International standard-setting body created |
| 1990 | FATF 40 Recommendations (1st edition) | First international AML standards |
| 1991 | EU 1st Anti-Money Laundering Directive | Customer identification requirements |
| 2001 | USA PATRIOT Act | Post-9/11 expansion to terrorism financing |
| 2001 | FATF 8 Special Recommendations on TF | Counter-terrorism financing standards |
| 2005 | EU 3rd AMLD | Risk-based approach introduced |
| 2012 | FATF Recommendations revised | Combined AML/CFT standards |
| 2015 | EU 4th AMLD (2015/849) | Beneficial ownership registers mandated |
| 2018 | EU 5th AMLD (2018/843) | Virtual currencies, enhanced PEP measures |
| 2020 | EU 6th AMLD (2018/1673) | Harmonized predicate offenses, aiding/abetting |
| 2021 | EU AML Package proposed | Single EU AML authority (AMLA), direct regulation |
| 2024 | EU AML Regulation & AMLA established | Directly applicable rules, AMLA in Frankfurt |
| 2025 | Czech AML Act amendments (ZKB 264/2025 Sb.) | Enhanced cyber-related AML obligations |

The Financial Action Task Force (FATF) serves as the global standard-setter, with its 40 Recommendations forming the de facto international AML framework. FATF's mutual evaluation process assesses member countries' compliance, and placement on the FATF "grey list" or "black list" carries severe economic consequences, effectively weaponizing AML compliance as a tool of international financial governance.

The three stages of money laundering each present distinct detection opportunities:

| Stage | Activity | Detection Signals | Prismatic Detection |
|-------|----------|-------------------|-------------------|
| **Placement** | Introducing cash into financial system | Structuring (splitting deposits below reporting thresholds), cash-intensive businesses, smurfing | Transaction pattern analysis |
| **Layering** | Complex transactions to obscure origin | Shell companies, cross-border transfers, trade-based laundering, cryptocurrency mixing | Entity resolution, ownership graph analysis |
| **Integration** | Reinvesting laundered funds | Luxury asset purchases, real estate, legitimate business investment | Beneficial ownership analysis, wealth-source verification |

The estimated global volume of money laundering is 2-5% of global GDP annually (approximately $800 billion to $2 trillion USD), according to United Nations Office on Drugs and Crime (UNODC) estimates. Despite massive compliance investments (estimated at $274 billion globally in 2023), detection rates remain below 1% of total illicit flows, highlighting both the scale of the challenge and the opportunity for technology-driven improvements.

## Technical Details

### AML Program Components

A comprehensive AML program as required by FATF and EU regulations must include:

| Component | Description | Regulatory Basis |
|-----------|-------------|-----------------|
| **Customer Due Diligence (CDD)** | Identity verification, risk assessment | FATF R.10, EU AMLD Art. 13 |
| **Enhanced Due Diligence (EDD)** | Additional measures for high-risk customers | FATF R.10, EU AMLD Art. 18 |
| **Simplified Due Diligence (SDD)** | Reduced measures for low-risk situations | EU AMLD Art. 15 |
| **Ongoing Monitoring** | Continuous transaction scrutiny | FATF R.10, EU AMLD Art. 13(1)(d) |
| **Suspicious Activity Reporting (SAR)** | Reports to Financial Intelligence Units | FATF R.20, EU AMLD Art. 33 |
| **Record Keeping** | 5-year minimum retention of CDD records | FATF R.11, EU AMLD Art. 40 |
| **Beneficial Ownership** | Identifying ultimate beneficial owners (25%+ threshold) | FATF R.24-25, EU AMLD Art. 30 |
| **PEP Screening** | Politically Exposed Persons identification | FATF R.12, EU AMLD Art. 20 |
| **Sanctions Screening** | Checking against designated person/entity lists | FATF R.6, EU Reg. 2580/2001 |
| **Training** | Staff AML awareness and procedure training | FATF R.18, EU AMLD Art. 46 |

### Risk-Based Approach

Modern AML regulation mandates a risk-based approach (RBA), where the intensity of compliance measures is proportional to the assessed risk level:

```
Risk Assessment Formula:
  Overall Risk = f(Customer Risk, Geographic Risk, Product Risk, Channel Risk, Transaction Risk)

  Customer Risk Factors:
  - Entity type (natural person, legal entity, trust, foundation)
  - Beneficial ownership complexity
  - PEP status (domestic, foreign, international organization)
  - Source of wealth/funds verifiability
  - Industry sector (cash-intensive, gambling, crypto, weapons)

  Geographic Risk Factors:
  - FATF grey/black list status
  - Transparency International CPI score
  - Sanctions regime applicability
  - Tax haven / secrecy jurisdiction indicators

  Product/Channel Risk Factors:
  - Remote onboarding (higher risk)
  - Virtual assets involvement
  - Correspondent banking chains
  - Trade finance complexity
```

### Sanctions List Architecture

Global sanctions screening requires matching against multiple overlapping lists:

| List | Issuer | Scope | Update Frequency |
|------|--------|-------|-----------------|
| **OFAC SDN** | US Treasury | Designated nationals and blocked persons | Daily |
| **EU Consolidated** | European Commission | EU autonomous and UN-implemented sanctions | Weekly |
| **UN Security Council** | United Nations | Global designations | As adopted |
| **HMT** | UK Treasury | UK financial sanctions | Daily |
| **SECO** | Swiss State Secretariat | Swiss-implemented sanctions | Weekly |
| **Czech National Bank** | CNB | Czech-specific designations | Monthly |

### Typology Framework

Money laundering typologies are classified patterns that compliance systems must detect:

```
FATF Typology Categories:
├── Trade-Based Money Laundering (TBML)
│   ├── Over/under-invoicing
│   ├── Multiple invoicing
│   └── Falsely described goods/services
├── Professional Money Laundering
│   ├── Shell company networks
│   ├── Trust/nominee structures
│   └── Professional intermediary abuse
├── Virtual Asset Laundering
│   ├── Cryptocurrency mixing/tumbling
│   ├── DeFi protocol exploitation
│   └── Cross-chain bridging
├── Real Estate Laundering
│   ├── Cash purchases through legal entities
│   ├── Renovation cost inflation
│   └── Rapid buying/selling cycles
└── Gatekeeping Professions
    ├── Legal professional exploitation
    ├── Accountant/auditor complicity
    └── Real estate agent facilitation
```

## Implementation in Prismatic Platform

### Sanctions Screening Engine

The platform implements real-time sanctions screening against OFAC SDN, EU Consolidated, and UN Security Council lists:

```elixir
defmodule PrismaticDD.SanctionsChecker do
  @moduledoc """
  Multi-list sanctions screening engine with fuzzy matching,
  phonetic algorithms, and confidence scoring. Supports OFAC SDN,
  EU Consolidated Sanctions, and UN Security Council designations.
  """

  @type screening_result :: %{
          entity: String.t(),
          matches: [match_result()],
          risk_level: :clear | :potential_match | :confirmed_match,
          screening_timestamp: DateTime.t(),
          lists_checked: [atom()]
        }

  @type match_result :: %{
          list: atom(),
          matched_entry: map(),
          confidence: float(),
          match_type: :exact | :fuzzy | :phonetic | :alias,
          details: map()
        }

  @spec check(String.t() | map(), keyword()) ::
          {:ok, screening_result()} | {:error, term()}
  def check(entity, opts \\ []) do
    lists = Keyword.get(opts, :lists, [:ofac_sdn, :eu_consolidated, :un_sc])
    threshold = Keyword.get(opts, :threshold, 0.85)

    results =
      lists
      |> Task.async_stream(fn list ->
        screen_against_list(entity, list, threshold)
      end, timeout: 30_000)
      |> Enum.flat_map(fn
        {:ok, matches} -> matches
        {:exit, _reason} -> []
      end)

    risk_level = classify_screening_results(results)

    {:ok, %{
      entity: normalize_entity_name(entity),
      matches: results,
      risk_level: risk_level,
      screening_timestamp: DateTime.utc_now(),
      lists_checked: lists
    }}
  end

  @spec screen_against_list(String.t() | map(), atom(), float()) ::
          [match_result()]
  defp screen_against_list(entity, list, threshold) do
    normalized = normalize_entity_name(entity)

    list
    |> load_list_entries()
    |> Enum.flat_map(fn entry ->
      scores = [
        {:exact, exact_match_score(normalized, entry)},
        {:fuzzy, fuzzy_match_score(normalized, entry)},
        {:phonetic, phonetic_match_score(normalized, entry)},
        {:alias, alias_match_score(normalized, entry)}
      ]

      scores
      |> Enum.filter(fn {_type, score} -> score >= threshold end)
      |> Enum.map(fn {type, score} ->
        %{list: list, matched_entry: entry, confidence: score, match_type: type, details: %{}}
      end)
    end)
  end
end
```

### AML Risk Assessment Pipeline

The platform's due diligence system computes composite AML risk scores across seven dimensions:

```elixir
defmodule PrismaticDD.AML.RiskAssessor do
  @moduledoc """
  Computes AML risk scores across seven dimensions using evidence
  from OSINT sources, sanctions screening, and ownership analysis.
  Produces audit-ready risk assessments per FATF risk-based approach.
  """

  @risk_dimensions [
    :financial,      # Insolvency, tax compliance, financial health
    :legal,          # Court proceedings, regulatory actions
    :ownership,      # UBO opacity, nominee structures, PEP connections
    :operational,    # Business activity consistency, industry risk
    :reputational,   # Adverse media, public records
    :sanctions,      # Sanctions list hits, jurisdiction risk
    :cyber           # Digital footprint, infrastructure security
  ]

  @spec assess(map(), map(), keyword()) ::
          {:ok, map()} | {:error, term()}
  def assess(entity, evidence, opts \\ []) do
    dimension_scores =
      @risk_dimensions
      |> Enum.map(fn dimension ->
        {dimension, score_dimension(dimension, entity, evidence)}
      end)
      |> Map.new()

    composite_score = compute_composite_score(dimension_scores, opts)
    risk_category = categorize_risk(composite_score)

    {:ok, %{
      entity_id: entity.id,
      dimension_scores: dimension_scores,
      composite_score: composite_score,
      risk_category: risk_category,
      assessment_date: DateTime.utc_now(),
      evidence_count: length(Map.values(evidence) |> List.flatten()),
      recommendation: generate_recommendation(risk_category),
      audit_trail: build_audit_trail(entity, evidence, dimension_scores)
    }}
  end

  @spec categorize_risk(float()) :: atom()
  defp categorize_risk(score) when score >= 0.8, do: :critical
  defp categorize_risk(score) when score >= 0.6, do: :high
  defp categorize_risk(score) when score >= 0.4, do: :medium
  defp categorize_risk(score) when score >= 0.2, do: :low
  defp categorize_risk(_score), do: :minimal
end
```

### Entity Ownership Graph Analysis

The platform leverages KuzuDB graph database to analyze ownership structures and detect layered laundering vehicles:

```elixir
defmodule PrismaticDD.AML.OwnershipAnalyzer do
  @moduledoc """
  Analyzes entity ownership graphs to detect AML red flags:
  circular ownership, nominee structures, excessive layering,
  and connections to high-risk jurisdictions.
  """

  @spec analyze_ownership_structure(String.t()) ::
          {:ok, map()} | {:error, term()}
  def analyze_ownership_structure(entity_id) do
    with {:ok, graph} <- build_ownership_graph(entity_id),
         {:ok, ubos} <- identify_ultimate_beneficial_owners(graph),
         {:ok, red_flags} <- detect_structural_red_flags(graph),
         {:ok, jurisdiction_risk} <- assess_jurisdiction_risk(graph) do
      {:ok, %{
        entity_id: entity_id,
        ownership_depth: graph_depth(graph),
        beneficial_owners: ubos,
        red_flags: red_flags,
        jurisdiction_risk: jurisdiction_risk,
        opacity_score: calculate_opacity_score(graph, ubos)
      }}
    end
  end

  @spec detect_structural_red_flags(map()) :: {:ok, [map()]}
  defp detect_structural_red_flags(graph) do
    red_flags =
      []
      |> maybe_add(detect_circular_ownership(graph))
      |> maybe_add(detect_nominee_indicators(graph))
      |> maybe_add(detect_excessive_layering(graph, max_layers: 4))
      |> maybe_add(detect_shell_company_indicators(graph))
      |> maybe_add(detect_jurisdiction_hopping(graph))

    {:ok, red_flags}
  end
end
```

## Comparison with Alternatives

| Solution | Coverage | Automation | OSINT Integration | Graph Analysis | Compliance Reporting | Cost |
|----------|----------|-----------|-------------------|----------------|---------------------|------|
| **Prismatic DD Platform** | Global + Czech specialty | High | 120+ sources | KuzuDB graph DB | Audit-ready | Medium |
| **Refinitiv World-Check** | Global, comprehensive | Medium | Limited (proprietary data) | Basic | Standard reports | Very high |
| **Dow Jones Risk & Compliance** | Global, media-focused | Medium | Adverse media strength | Basic | Standard reports | Very high |
| **ComplyAdvantage** | Global, AI-enhanced | High | Medium | Limited | Good | High |
| **LexisNexis Risk Solutions** | Global, US-focused | Medium | Limited | Network analysis | Standard reports | Very high |
| **Open-source tools** | Variable | Low | Manual integration | Custom-built | Manual | Low |
| **Manual compliance** | Depends on analyst | None | Manual research | None | Manual | Very high (labor) |

The Prismatic Platform differentiates through its deep Czech regulatory expertise (ARES, Justice Ministry, ISIR integration), graph-based ownership analysis via KuzuDB, and integration with 120+ OSINT sources that provide evidence beyond traditional AML databases.

## Best Practices

1. **Screen against all applicable sanctions lists simultaneously**: Do not rely on a single sanctions list. Screen against OFAC SDN, EU Consolidated, UN Security Council, and relevant national lists in parallel. Different lists have different coverage and update frequencies, and a miss on one list may be caught by another.

2. **Implement fuzzy matching with configurable thresholds**: Exact string matching catches only trivially evasive name variations. Implement Levenshtein distance, Jaro-Winkler similarity, Soundex/Metaphone phonetic matching, and transliteration-aware comparison. Set matching thresholds per risk category (lower thresholds for high-risk jurisdictions).

3. **Maintain comprehensive audit trails**: Every screening decision, risk assessment, and compliance action must be documented with full provenance. Regulators expect to see not just what was decided, but the complete reasoning chain. Design audit trail architecture before implementing business logic.

4. **Automate ongoing monitoring, not just onboarding**: AML compliance is not a one-time event. Implement continuous re-screening against updated sanctions lists, periodic risk reassessment, and transaction pattern monitoring. Use event-driven architecture to trigger re-evaluation when new intelligence becomes available.

5. **Build beneficial ownership resolution into the core pipeline**: Understanding who ultimately controls an entity is fundamental to AML compliance. Invest in ownership graph construction, UBO identification algorithms, and cross-jurisdictional ownership tracing. The EU 4th AMLD mandates beneficial ownership registers, but register data quality varies significantly across member states.

6. **Calibrate risk scoring with regulatory feedback**: Risk scoring models must evolve based on regulatory examination findings, SAR filing outcomes, and typology updates from FATF and national FIUs. Static risk models degrade over time as laundering techniques evolve.

7. **Integrate Czech-specific regulatory requirements**: For operations involving Czech entities, integrate with ARES (economic subjects register), ISIR (insolvency register), and the Czech Commercial Register. Czech AML Act 253/2008 Sb. has specific requirements that differ from the EU baseline, including enhanced obligations under ZKB 264/2025 Sb.

## Common Pitfalls

- **Over-reliance on name screening alone**: Name-based sanctions screening catches only the most obvious matches. Sophisticated laundering operations use nominee structures, shell companies, and intermediaries that are not themselves sanctioned. Combine name screening with network analysis, jurisdiction assessment, and behavioral pattern detection.

- **Treating AML compliance as a checkbox exercise**: Regulators increasingly look beyond formal program elements to assess "effectiveness." Having policies, procedures, and technology is necessary but insufficient. Regulators want evidence that the AML program actually detects and prevents laundering, measured by SAR quality, investigation outcomes, and regulatory examination results.

- **Ignoring data quality in sanctions lists**: Sanctions list entries vary dramatically in quality. Some entries have complete identification data (date of birth, passport number, address); others have only a name and nationality. Matching algorithms must handle this variability gracefully, adjusting confidence scores based on the specificity of available matching fields.

- **Failing to update typology knowledge**: Money laundering techniques evolve continuously. Virtual asset laundering, trade-based laundering, and professional money laundering networks use increasingly sophisticated methods. AML systems that rely on static rules without regular typology updates become progressively less effective.

- **Underestimating cross-border complexity**: AML regulations differ across jurisdictions in obligations, reporting thresholds, and enforcement approaches. An entity that is compliant in one jurisdiction may violate rules in another. Map regulatory requirements per jurisdiction and implement jurisdiction-aware compliance logic.

- **Neglecting the human element**: Technology enhances but does not replace human judgment in AML compliance. Complex cases require experienced investigators who understand both the regulatory framework and the business context. Ensure that algorithmic screening supports rather than supplants expert analysis.

## Use Cases

### Czech Entity Due Diligence

The platform's Czech OSINT adapters (28 sources including ARES, Justice Ministry, ISIR, Commercial Register, and Trade Register) enable comprehensive due diligence on Czech entities. The AML workflow queries all relevant registries, constructs ownership graphs from commercial register data, checks insolvency status, verifies tax compliance, and screens against both EU and Czech-specific sanctions lists. The resulting due diligence report satisfies Czech AML Act 253/2008 Sb. documentation requirements.

### Cross-Jurisdictional Ownership Tracing

Using KuzuDB graph analysis, the platform traces ownership chains across multiple jurisdictions to identify ultimate beneficial owners. This is particularly valuable for detecting layered structures designed to obscure ownership, such as a Czech s.r.o. owned by a Cyprus holding company owned by a Cayman Islands trust. The graph analysis detects red flags like circular ownership, excessive layering (>4 levels), and connections to secrecy jurisdictions.

### Sanctions Screening with Continuous Monitoring

The platform implements continuous sanctions screening that re-checks all monitored entities whenever sanctions lists are updated. When OFAC publishes a new SDN entry, all entities in the platform's monitoring portfolio are automatically re-screened within minutes. Potential matches trigger alerts with confidence scores, and confirmed matches generate compliance notifications with full audit documentation.

### PEP and Adverse Media Screening

Politically Exposed Persons (PEP) identification combines structured data from public registries with unstructured intelligence from media monitoring. The platform's OSINT tools aggregate information from government websites, corporate registries, news sources, and public databases to identify PEP connections that may not appear in commercial PEP databases. Adverse media screening uses natural language processing to identify negative news coverage relevant to AML risk assessment.

## Related Concepts

- [KYC](/glossary/kyc/) - Know Your Customer requirements forming the identity verification foundation of AML compliance
- [Sanctions Screening](/glossary/sanctions-screening/) - Automated checking against designated person and entity lists as a core AML control
- [Due Diligence](/glossary/due-diligence/) - Comprehensive investigation framework that operationalizes AML obligations for entity risk assessment
- [Beneficial Ownership](/glossary/beneficial-ownership/) - Identification of ultimate beneficial owners to detect layered laundering structures
- [Entity Resolution](/glossary/entity-resolution/) - Cross-source identity consolidation that enables comprehensive AML screening across jurisdictions
- [Risk Score](/glossary/risk-score/) - Quantified risk assessment producing numeric scores that drive AML decision-making
- [Compliance Framework](/glossary/compliance-framework/) - Regulatory structures (FATF, AMLD, ZKB) that define AML obligations
- [PEP Screening](/glossary/pep-screening/) - Identification of politically exposed persons requiring enhanced due diligence under AML regulations

## See Also

- [Prismatic DD App](https://github.com/korczis/prismatic-platform/tree/main/apps/prismatic_dd) - Due diligence platform with AML capabilities
- [OSINT Toolbox](https://github.com/korczis/prismatic-platform/tree/main/apps/prismatic_web/lib/prismatic_web/live/osint) - 120+ OSINT tools for AML intelligence gathering
- [FATF Recommendations](https://www.fatf-gafi.org/en/recommendations.html) - International AML standards
- [EU AML Package](https://finance.ec.europa.eu/financial-crime/anti-money-laundering-and-countering-financing-terrorism_en) - EU regulatory framework

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
