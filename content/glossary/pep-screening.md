+++
title = "PEP Screening"
weight = 50
[extra]
tags = ["glossary", "compliance", "osint", "security", "due-diligence", "aml", "kyc"]
description = "Politically Exposed Person (PEP) screening -- the systematic process of identifying individuals who hold or have held prominent public functions, assessing their associated risks, and applying enhanced due diligence measures in compliance with AML/KYC regulations"
category = "compliance"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "16 min"
difficulty = "advanced"
quality_score = 95
related_terms = ["kyc", "aml", "sanctions-screening", "due-diligence", "compliance-framework", "risk-assessment", "beneficial-ownership", "entity-resolution", "osint", "intelligence-platform"]
key_concepts = ["politically exposed persons", "enhanced due diligence", "risk scoring", "watchlist matching", "FATF recommendations", "EU AMLD", "Czech AML Act", "beneficial ownership chains"]
use_cases = ["financial institution onboarding", "corporate due diligence", "M&A target screening", "third-party risk management", "regulatory compliance automation"]
prerequisites = ["aml", "kyc", "compliance-framework"]
see_also = ["sanctions-screening", "entity-resolution", "beneficial-ownership", "risk-score"]
glossary_letter = "P"
weight_category = "compliance"
word_count = 1761
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["PEP", "Screening", "Politically", "Exposed", "Person", "AMLKYC", "glossary", "compliance", "Prismatic Platform", "PEPs"]
image = "/images/sections/glossary.png"
image_alt = "PEP Screening - Prismatic Platform"
+++

## Definition

**PEP Screening** (Politically Exposed Person Screening) is the regulated process of identifying, classifying, and applying enhanced due diligence to individuals who hold or have recently held prominent public functions, their family members, and their known close associates. PEPs present elevated risk for potential involvement in money laundering, corruption, bribery, and other financial crimes due to their positions of influence and access to public funds. PEP screening is a mandatory component of Anti-Money Laundering (AML) and Know Your Customer (KYC) compliance programs worldwide, governed by frameworks including the Financial Action Task Force (FATF) Recommendations, the European Union Anti-Money Laundering Directives (AMLD), and national legislation such as the Czech AML Act (Act No. 253/2008 Sb.).

Within the Prismatic Platform, PEP screening is implemented as a core capability of the OSINT intelligence infrastructure and the Due Diligence module, combining automated watchlist matching with entity resolution, beneficial ownership chain analysis, and risk scoring to deliver compliance-grade screening results with full audit trails and evidence provenance.

## Overview

The concept of Politically Exposed Persons originated in the international anti-corruption and anti-money laundering communities. The FATF -- the intergovernmental body that sets global AML standards -- first introduced PEP-specific requirements in its 2003 Revised Recommendations. Since then, PEP screening has become a cornerstone of financial regulation worldwide, with increasingly stringent requirements in each successive regulatory generation.

PEPs are categorized into three tiers:

1. **Domestic PEPs**: Individuals holding prominent public functions within a country -- heads of state, senior government officials, senior judicial figures, military leaders, state-owned enterprise directors, and senior political party officials.

2. **Foreign PEPs**: Individuals holding equivalent positions in foreign countries. FATF Recommendation 12 requires enhanced due diligence for all foreign PEPs without exception.

3. **International Organization PEPs**: Senior figures in international organizations such as the United Nations, European Commission, World Bank, IMF, and similar bodies.

Additionally, the following categories require screening:

- **Family members of PEPs**: Spouses, children, parents, siblings, and in-laws of PEPs
- **Close associates of PEPs**: Individuals with close business relationships, joint beneficial ownership of legal entities, or any other close social connection to a PEP

The challenge of PEP screening lies not in the concept but in the execution. Names vary across languages and transliteration systems. Political positions change frequently. Family relationships are not always publicly documented. Close associates may be deliberately hidden. The volume of data requiring screening can be enormous -- a major financial institution may need to screen millions of customer records against tens of thousands of PEP entries across hundreds of jurisdictions.

### Regulatory Framework

| Regulation | Jurisdiction | Key PEP Requirements |
|-----------|-------------|---------------------|
| **FATF Recommendations 12, 22** | Global | Enhanced due diligence for foreign PEPs; risk-based approach for domestic PEPs |
| **EU 6th AMLD (2024/1640)** | European Union | Unified PEP definition; beneficial ownership registry integration; 12-month post-office monitoring |
| **NIS2 Directive** | European Union | Cybersecurity obligations for entities processing PEP data |
| **Czech AML Act (253/2008 Sb.)** | Czech Republic | PEP screening mandatory for obligated entities; integration with Czech beneficial ownership registry |
| **ZKB 264/2025 Sb.** | Czech Republic | Enhanced cybersecurity requirements for financial data processing systems |
| **UK Money Laundering Regulations** | United Kingdom | Risk-based approach; PEP status extends 12 months post-office |
| **US Bank Secrecy Act / FinCEN** | United States | Enhanced due diligence for foreign PEPs; private banking PEP requirements |

## Technical Details

### PEP Screening Architecture in Elixir

The Prismatic Platform implements PEP screening as a multi-stage pipeline combining OSINT intelligence gathering, entity resolution, and risk scoring. The following code demonstrates the core screening architecture.

```elixir
defmodule Prismatic.Compliance.PEPScreener do
  @moduledoc """
  Core PEP screening engine that combines watchlist matching,
  entity resolution, and risk scoring to produce compliance-grade
  screening results with full audit trails.

  Implements a multi-stage pipeline:
  1. Input normalization (name variants, transliteration)
  2. Candidate generation (fuzzy matching against PEP databases)
  3. Entity resolution (disambiguation and deduplication)
  4. Risk scoring (position, jurisdiction, recency, connections)
  5. Enhanced due diligence triggers
  6. Audit trail generation
  """

  use GenServer
  require Logger

  alias Prismatic.Compliance.PEPScreener.{
    NameNormalizer,
    CandidateGenerator,
    EntityResolver,
    RiskScorer,
    AuditTrail
  }

  @type pep_category :: :domestic | :foreign | :international_org
  @type relationship :: :self | :family_member | :close_associate
  @type risk_level :: :low | :medium | :high | :critical

  @type screening_request :: %{
    subject_name: String.t(),
    subject_dob: Date.t() | nil,
    subject_nationality: String.t() | nil,
    subject_identifiers: [%{type: String.t(), value: String.t()}],
    screening_context: :onboarding | :periodic | :event_driven,
    requestor_id: String.t()
  }

  @type screening_result :: %{
    request_id: String.t(),
    subject: screening_request(),
    matches: [pep_match()],
    risk_level: risk_level(),
    risk_score: float(),
    edd_required: boolean(),
    screening_timestamp: DateTime.t(),
    audit_trail: [audit_entry()]
  }

  @type pep_match :: %{
    pep_id: String.t(),
    matched_name: String.t(),
    match_confidence: float(),
    category: pep_category(),
    relationship: relationship(),
    position: String.t(),
    jurisdiction: String.t(),
    active: boolean(),
    last_verified: DateTime.t(),
    source: String.t()
  }

  @type audit_entry :: %{
    step: String.t(),
    timestamp: DateTime.t(),
    input: term(),
    output: term(),
    decision: String.t()
  }

  @match_threshold 0.75
  @high_risk_score 0.70
  @critical_risk_score 0.90

  # --- Client API ---

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec screen(screening_request()) :: {:ok, screening_result()} | {:error, term()}
  def screen(request) do
    GenServer.call(__MODULE__, {:screen, request}, :timer.seconds(30))
  end

  @spec batch_screen([screening_request()]) :: {:ok, [screening_result()]}
  def batch_screen(requests) do
    GenServer.call(__MODULE__, {:batch_screen, requests}, :timer.minutes(5))
  end

  # --- Server Callbacks ---

  @impl true
  def init(opts) do
    state = %{
      screening_count: 0,
      watchlist_version: Keyword.get(opts, :watchlist_version, "latest"),
      started_at: DateTime.utc_now()
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:screen, request}, _from, state) do
    request_id = generate_request_id()
    audit = AuditTrail.new(request_id)

    result =
      request
      |> normalize_input(audit)
      |> generate_candidates(audit)
      |> resolve_entities(audit)
      |> score_risk(audit)
      |> build_result(request, request_id, audit)

    new_state = %{state | screening_count: state.screening_count + 1}
    {:reply, {:ok, result}, new_state}
  end

  @impl true
  def handle_call({:batch_screen, requests}, _from, state) do
    results =
      requests
      |> Task.async_stream(
        fn request ->
          request_id = generate_request_id()
          audit = AuditTrail.new(request_id)

          request
          |> normalize_input(audit)
          |> generate_candidates(audit)
          |> resolve_entities(audit)
          |> score_risk(audit)
          |> build_result(request, request_id, audit)
        end,
        max_concurrency: System.schedulers_online(),
        timeout: :timer.seconds(30)
      )
      |> Enum.map(fn {:ok, result} -> result end)

    new_state = %{state | screening_count: state.screening_count + length(requests)}
    {:reply, {:ok, results}, new_state}
  end

  # --- Pipeline Stages ---

  @spec normalize_input(screening_request(), AuditTrail.t()) ::
          {[String.t()], screening_request(), AuditTrail.t()}
  defp normalize_input(request, audit) do
    name_variants = NameNormalizer.generate_variants(request.subject_name)
    audit = AuditTrail.record(audit, "normalize", request.subject_name, name_variants)
    {name_variants, request, audit}
  end

  @spec generate_candidates({[String.t()], screening_request(), AuditTrail.t()}) ::
          {[pep_match()], screening_request(), AuditTrail.t()}
  defp generate_candidates({name_variants, request, audit}) do
    candidates =
      name_variants
      |> Enum.flat_map(&CandidateGenerator.search(&1, @match_threshold))
      |> Enum.uniq_by(& &1.pep_id)

    audit = AuditTrail.record(audit, "candidates", name_variants, candidates)
    {candidates, request, audit}
  end

  @spec resolve_entities({[pep_match()], screening_request(), AuditTrail.t()}) ::
          {[pep_match()], screening_request(), AuditTrail.t()}
  defp resolve_entities({candidates, request, audit}) do
    resolved = EntityResolver.resolve(candidates, request)
    audit = AuditTrail.record(audit, "resolution", candidates, resolved)
    {resolved, request, audit}
  end

  @spec score_risk({[pep_match()], screening_request(), AuditTrail.t()}) ::
          {[pep_match()], float(), risk_level(), screening_request(), AuditTrail.t()}
  defp score_risk({matches, request, audit}) do
    {score, level} = RiskScorer.calculate(matches, request)
    audit = AuditTrail.record(audit, "risk_scoring", matches, {score, level})
    {matches, score, level, request, audit}
  end

  @spec build_result(
          {[pep_match()], float(), risk_level(), screening_request(), AuditTrail.t()},
          screening_request(),
          String.t(),
          AuditTrail.t()
        ) :: screening_result()
  defp build_result({matches, score, level, _request, audit}, request, request_id, _) do
    %{
      request_id: request_id,
      subject: request,
      matches: matches,
      risk_level: level,
      risk_score: score,
      edd_required: score >= @high_risk_score,
      screening_timestamp: DateTime.utc_now(),
      audit_trail: AuditTrail.entries(audit)
    }
  end

  @spec generate_request_id() :: String.t()
  defp generate_request_id do
    "PEP-#{:crypto.strong_rand_bytes(8) |> Base.hex_encode32(case: :lower)}"
  end
end
```

### Name Matching Challenges

PEP screening requires sophisticated name matching that accounts for:

- **Transliteration variants**: Arabic, Chinese, Cyrillic, and other scripts produce multiple valid Latin transliterations (e.g., "Mohammed" / "Muhammad" / "Mohamed")
- **Name ordering**: Different cultures place family names first or last
- **Titles and honorifics**: "Dr.", "Prof.", "H.E." may or may not be included
- **Aliases and maiden names**: Individuals may be known by multiple names
- **Typographical errors**: Data entry errors in source databases

The Prismatic Platform uses Jaro-Winkler distance, phonetic encoding (Soundex, Metaphone), and n-gram similarity in combination to achieve high recall without excessive false positives.

### Data Sources

| Source | Coverage | Update Frequency | Integration |
|--------|----------|-----------------|-------------|
| National PEP lists | Per-jurisdiction | Variable (days to months) | Direct API / bulk import |
| Commercial PEP databases | Global | Daily | API integration |
| Public registries | Per-jurisdiction | Real-time to monthly | OSINT adapters |
| Beneficial ownership registries | EU-wide (via AMLD) | Quarterly | Registry API |
| Czech commercial register | Czech Republic | Real-time | ARES adapter |
| Open sanctions databases | Global | Weekly | OpenSanctions API |

## Implementation

### Screening Pipeline Stages

1. **Input Normalization**: Subject names are decomposed into components, transliterated into standard Latin form, and expanded into variant lists. Date of birth, nationality, and identifiers are standardized.

2. **Candidate Generation**: Normalized name variants are matched against PEP watchlists using fuzzy matching algorithms. All candidates above the configurable threshold (default 0.75) are retained.

3. **Entity Resolution**: Candidates are disambiguated using additional signals -- date of birth, nationality, known identifiers, position history. This stage reduces false positives by confirming or rejecting candidate matches.

4. **Risk Scoring**: Confirmed matches are scored based on multiple factors: PEP category (foreign PEPs score higher per FATF), position seniority, jurisdiction risk rating, recency of office, relationship type (self vs. family vs. associate), and source reliability.

5. **EDD Trigger Evaluation**: Screening results above the high-risk threshold automatically trigger Enhanced Due Diligence requirements, generating structured EDD task lists for compliance officers.

6. **Audit Trail Finalization**: Every step of the pipeline is recorded with timestamps, inputs, outputs, and decisions. This audit trail satisfies regulatory requirements for demonstrating adequate screening procedures.

### Integration with OSINT Infrastructure

PEP screening in the Prismatic Platform leverages the full OSINT adapter ecosystem (120+ tools across 7 categories). Czech-specific screening benefits from 28 Czech OSINT adapters including ARES, Justice Ministry registers, ISIR insolvency register, and commercial registry lookups. This enables cross-referencing PEP screening results with corporate ownership data, insolvency records, and judicial proceedings.

## Comparison

### PEP Screening vs. Sanctions Screening

| Dimension | PEP Screening | Sanctions Screening |
|-----------|--------------|-------------------|
| **Purpose** | Identify elevated-risk individuals by position | Identify prohibited individuals/entities |
| **Legal effect** | Enhanced due diligence required | Transaction prohibition |
| **Lists** | PEP databases (commercial + public) | OFAC SDN, EU Consolidated, UN lists |
| **False positive rate** | Higher (broader matching criteria) | Lower (more precise identifiers) |
| **Ongoing monitoring** | Required (position changes) | Required (list updates) |
| **Risk tolerance** | Risk-based approach | Zero tolerance |

### Manual vs. Automated PEP Screening

| Dimension | Manual | Automated |
|-----------|--------|-----------|
| **Throughput** | 10-50 screenings/day/analyst | 10,000+ screenings/hour |
| **Consistency** | Variable (analyst fatigue, judgment) | Deterministic (same input, same output) |
| **Audit trail** | Requires manual documentation | Automatic and comprehensive |
| **Name matching** | Relies on analyst knowledge | Algorithmic with tunable thresholds |
| **Cost per screening** | $5-50 | $0.01-0.50 |
| **Regulatory acceptance** | Accepted with documentation | Accepted with validation evidence |

## Best Practices

1. **Risk-based calibration**: Adjust matching thresholds based on the risk profile of the customer segment. Private banking clients warrant lower thresholds (higher sensitivity) than retail customers.

2. **Ongoing monitoring**: PEP status changes over time. Implement continuous monitoring with event-driven re-screening when watchlist updates occur.

3. **Four-eyes principle**: Automated screening should flag matches for human review. No automated system should make final disposition decisions on high-risk matches.

4. **Documentation obsession**: Regulatory examinations focus heavily on the screening process itself. Maintain comprehensive audit trails that document not just results but the reasoning behind disposition decisions.

5. **Transliteration coverage**: Invest in comprehensive name normalization. A system that only matches exact Latin spellings will miss a substantial percentage of true PEPs from non-Latin-script jurisdictions.

6. **Beneficial ownership integration**: PEP screening of natural persons is incomplete without checking beneficial ownership chains. A PEP may not appear as a direct customer but may be the ultimate beneficial owner of a corporate customer.

7. **Regulatory update tracking**: PEP definitions and requirements change with each regulatory update. Implement a process for tracking and incorporating regulatory changes into screening rules.

8. **False positive management**: High false positive rates erode analyst effectiveness. Invest in entity resolution and whitelisting processes to reduce noise without compromising detection.

## Common Pitfalls

1. **Name-only matching**: Relying solely on name matching without corroborating identifiers (DOB, nationality, position) produces unmanageable false positive volumes.

2. **Static watchlists**: Using PEP databases that are not regularly updated misses newly appointed officials and fails to de-escalate former PEPs whose risk has diminished.

3. **Ignoring family and associates**: Screening only the named PEP while ignoring the FATF requirement to screen family members and close associates creates a significant compliance gap.

4. **Threshold miscalibration**: Setting matching thresholds too high misses true matches (compliance risk); setting them too low overwhelms analysts with false positives (operational risk).

5. **Insufficient audit trails**: Screening without adequate documentation of the process, thresholds, and disposition decisions fails regulatory examination even if the screening itself was adequate.

6. **Jurisdiction blindness**: Applying identical screening intensity across all jurisdictions ignores the risk-based approach mandated by FATF. High-risk jurisdictions warrant enhanced screening.

## Use Cases

### Financial Institution Customer Onboarding

Banks, insurance companies, and investment firms must screen all new customers against PEP databases during onboarding. The Prismatic Platform's batch screening capability enables processing of large customer intake volumes with sub-second per-screening latency.

### Corporate Due Diligence

When evaluating business partners, suppliers, or acquisition targets, PEP screening of directors, officers, and beneficial owners identifies potential corruption and bribery risk. The platform's beneficial ownership chain analysis traces PEP connections through complex corporate structures.

### Czech Regulatory Compliance

Czech obligated entities (banks, payment institutions, crypto-asset service providers) must comply with Act 253/2008 Sb. The Prismatic Platform's 28 Czech OSINT adapters provide deep integration with Czech registries for comprehensive domestic PEP screening.

### Ongoing Transaction Monitoring

Real-time PEP screening of transaction counterparties identifies elevated-risk transactions for enhanced scrutiny. The platform's streaming architecture supports continuous monitoring of high-volume transaction flows.

## Related Concepts

PEP screening intersects with multiple compliance and intelligence domains within the Prismatic Platform:

- [AML](/glossary/aml/) -- the broader regulatory framework within which PEP screening operates
- [KYC](/glossary/kyc/) -- the customer identification process that incorporates PEP screening as a mandatory component
- [Sanctions Screening](/glossary/sanctions-screening/) -- the complementary process of checking against prohibited persons and entity lists
- [Due Diligence](/glossary/due-diligence/) -- the comprehensive assessment process that includes PEP screening as one of multiple investigative dimensions
- [Beneficial Ownership](/glossary/beneficial-ownership/) -- the analysis of corporate ownership chains critical for identifying hidden PEP connections
- [Entity Resolution](/glossary/entity-resolution/) -- the technical capability for disambiguating PEP matches and reducing false positives
- [Risk Assessment](/glossary/risk-assessment/) -- the framework for evaluating and scoring PEP-related risks
- [OSINT](/glossary/osint/) -- the intelligence gathering infrastructure that powers PEP data collection and verification
- [Compliance Framework](/glossary/compliance-framework/) -- the organizational and technical structure governing PEP screening implementation
- [NIS2](/glossary/nis2/) -- the EU cybersecurity directive with implications for systems processing PEP data

## See Also

- [Intelligence Platform](/glossary/intelligence-platform/) -- the Prismatic Platform's broader intelligence capability
- [Audit Trail](/glossary/audit-trail/) -- the provenance and documentation system critical for regulatory compliance
- [Risk Score](/glossary/risk-score/) -- the quantitative framework for assessing screening results
- [ZKB](/glossary/zkb/) -- Czech cybersecurity regulation affecting PEP screening infrastructure
- [Prismatic Perimeter](/glossary/prismatic-perimeter/) -- the external attack surface management system that includes compliance assessment

---

*Built with precision. Engineered for the future.*

**[Prismatic Platform](https://github.com/korczis/prismatic-platform)** by [Tomas Korcak (korczis)](https://github.com/korczis) | Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
