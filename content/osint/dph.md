+++
title = "DPH"
weight = 14
[extra]
icon = "document-text"
color = "blue"
category = "czech"
type = "company"
module = "Dph"
source_type = "registry"
description = "Czech VAT Payer Registry - verification of VAT registration status and unreliable payer flags"
has_api = true
url = "https://adisreg.mfcr.cz/adistc/DphReg"
rate_limit = "No official limit, public data"
capabilities = ["VAT Number Validation", "Unreliable Payer Check", "Bank Account Verification", "Registration Status", "DIC Lookup", "Bulk Screening"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1547
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["DPH", "Czech", "Payer", "Registry", "osint", "Prismatic Platform", "Section", "SOAP"]
tags = ["osint", "czech", "dph", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "DPH - Prismatic Platform"
+++

## Overview

The DPH [registry](/glossary/registry-otp/) (Dan z pridane hodnoty -- Value Added Tax) is the authoritative public register of VAT-registered entities in the Czech Republic, maintained and operated by the Czech Financial Administration (Financni sprava Ceske republiky) under the Ministry of Finance. The registry operates under the legal framework established by Act No. 235/2004 Coll., on Value Added Tax (Zakon o dani z pridane hodnoty), as amended, and provides real-time verification of VAT registration status for all taxable persons operating within the Czech tax jurisdiction.

The DPH registry serves a dual purpose in Czech business intelligence. First, it provides standard VAT number validation, confirming whether a given DIC (Danove identifikacni cislo -- Tax Identification Number, format CZxxxxxxxx) corresponds to a valid, active VAT registration. Second, and more critically for risk assessment purposes, it maintains the "Nespolehlivy platce DPH" (Unreliable VAT Payer) designation -- a publicly accessible flag indicating that a taxpayer has committed serious VAT compliance failures as defined in Section 106a of the VAT Act.

The unreliable payer designation carries significant legal consequences under Czech law. When a business transacts with an entity designated as an unreliable VAT payer, the business partner assumes joint and several liability (ruceni prijemce zdanitelneho plneni) for any unpaid VAT on that transaction under Section 109 of the VAT Act. This joint liability mechanism makes the DPH registry check not merely a best practice but a legal necessity for any entity conducting business with Czech counterparties. Failure to verify a supplier's DPH status before payment can result in the purchasing entity being held directly liable for the supplier's VAT obligations.

The Czech Financial Administration designates an entity as an unreliable VAT payer when it demonstrates patterns of serious VAT non-compliance, including systematic failure to file VAT returns, repeated failure to pay VAT obligations, or deliberate participation in VAT fraud schemes. Once designated, the flag remains public and is accessible to all business partners as a risk signal. The designation can be appealed and removed if the entity demonstrates sustained compliance improvement, but the historical fact of designation remains a significant risk indicator.

## Data Sources and Coverage

The DPH registry provides several distinct data categories, each serving specific verification and compliance use cases.

| Data Category | Description | Legal Basis |
|---------------|-------------|-------------|
| **VAT Registration Status** | Active, suspended, or cancelled registration | Section 94-95 VAT Act |
| **DIC Number** | Tax identification number (CZxxxxxxxx format) | Section 130 VAT Act |
| **Unreliable Payer Flag** | Designation as unreliable VAT payer | Section 106a VAT Act |
| **Published Bank Accounts** | Registered accounts for VAT payments | Section 96 VAT Act |
| **Registration Date** | Date of VAT registration and status changes | Administrative records |
| **Group Registration** | VAT group membership details | Section 95a-95b VAT Act |
| **Effective Date** | Date from which current status applies | Administrative records |

### Geographic and Temporal Scope

The DPH registry covers all VAT-registered entities operating in the Czech Republic, including Czech companies, foreign entities registered for Czech VAT, and VAT groups. The registry provides current-state data (not historical snapshots), meaning queries return the entity's status as of the moment of the query. For historical VAT status tracking, integration with the ARES historical data feed is required.

The registry also interfaces with the EU-wide VIES (VAT Information Exchange System) operated by the European Commission, enabling cross-border VAT number validation for all EU member states. Czech DIC numbers validated through VIES are confirmed against the DPH registry in real-time.

### Czech Legal Context

The unreliable payer mechanism was introduced into Czech law on January 1, 2013, as part of anti-fraud measures targeting VAT carousel schemes. The mechanism creates a powerful economic incentive for business partners to verify VAT status: if a purchaser pays to a bank account that is not published in the DPH registry, or transacts with an unreliable payer without taking appropriate precautions, the purchaser becomes jointly liable for the unpaid VAT. This joint liability exposure can be substantial, particularly in high-value B2B transactions.

| Legal Instrument | Relevance |
|-----------------|-----------|
| **Act No. 235/2004 Coll.** | Primary VAT legislation establishing registration requirements |
| **Section 106a** | Unreliable payer designation criteria and procedures |
| **Section 109** | Joint liability for VAT when transacting with unreliable payers |
| **Section 96** | Published bank account requirements |
| **Act No. 280/2009 Coll.** | Tax Procedure Code governing administrative processes |
| **EU VAT Directive 2006/112/EC** | EU framework for VAT administration |

## Technical Architecture

The DPH registry is accessible through a public XML web service operated by the Czech Financial Administration at `https://adisreg.mfcr.cz/adistc/`. The service provides SOAP-based endpoints for individual DIC lookups and unreliable payer status checks.

### Service Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/adistc/DphReg` | SOAP/XML | VAT registration status lookup |
| `/adistc/NesijPlatci` | SOAP/XML | Unreliable payer status check |
| `/adistc/UctyDPH` | SOAP/XML | Published bank accounts lookup |
| VIES API | SOAP | EU-wide VAT validation via European Commission |

### Data Formats

The primary data format is XML over SOAP, with responses structured according to the Financial Administration's published schema. The VIES integration uses the European Commission's standard SOAP interface. No REST/JSON API is officially provided, though the Prismatic adapter normalizes all responses to JSON for platform integration.

## API Integration

```elixir
defmodule PrismaticOsint.Adapters.Dph do
  @moduledoc """
  Czech VAT Payer Registry (DPH) adapter for VAT verification,
  unreliable payer checks, and published bank account validation.
  Integrates with both the Czech Financial Administration SOAP
  service and the EU VIES system.
  """

  @behaviour PrismaticOsint.Adapter

  @doc """
  Comprehensive VAT status check for a Czech entity.
  Returns registration status, unreliable payer flag,
  and published bank accounts.
  """
  def check(dic) do
    with {:ok, status} <- check_registration(dic),
         {:ok, unreliable} <- check_unreliable(dic),
         {:ok, accounts} <- get_published_accounts(dic) do
      {:ok, %{
        dic: dic,
        registration: status,
        unreliable_payer: unreliable,
        published_accounts: accounts,
        joint_liability_risk: assess_liability_risk(unreliable),
        checked_at: DateTime.utc_now()
      }}
    end
  end

  @doc """
  Check VAT registration status.
  """
  def check_registration(dic) do
    case soap_call(:dph_reg, %{dic: normalize_dic(dic)}) do
      {:ok, response} ->
        {:ok, %{
          dic: dic,
          status: parse_status(response),
          registered_since: parse_date(response, :registration_date),
          vat_group: parse_group(response)
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Check if entity is designated as unreliable VAT payer.
  """
  def check_unreliable(dic) do
    case soap_call(:nesij_platci, %{dic: normalize_dic(dic)}) do
      {:ok, response} ->
        {:ok, %{
          dic: dic,
          is_unreliable: parse_unreliable_flag(response),
          designation_date: parse_date(response, :designation_date),
          reason: parse_reason(response)
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Get published bank accounts for VAT payments.
  """
  def get_published_accounts(dic) do
    case soap_call(:ucty_dph, %{dic: normalize_dic(dic)}) do
      {:ok, response} ->
        accounts = parse_accounts(response)
        {:ok, %{dic: dic, accounts: accounts, count: length(accounts)}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Validate VAT number through EU VIES system.
  """
  def vies_validate(vat_number) do
    {country_code, number} = split_vat_number(vat_number)
    case PrismaticOsint.Vies.check_vat(country_code, number) do
      {:ok, result} ->
        {:ok, %{
          vat_number: vat_number,
          valid: result.valid,
          name: result.name,
          address: result.address,
          country: country_code
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp assess_liability_risk(%{is_unreliable: true}), do: :critical
  defp assess_liability_risk(_), do: :none
end
```

### Bulk Compliance Screening Pipeline

```elixir
defmodule PrismaticCompliance.Czech.VatScreener do
  @moduledoc """
  Bulk VAT compliance screening for Czech business partner portfolios.
  Checks registration status, unreliable payer flags, and bank account
  validity for all counterparties.
  """

  def screen_portfolio(entities) do
    results = entities
    |> Task.async_stream(fn entity ->
      with {:ok, dph} <- Dph.check(entity.dic),
           {:ok, ares} <- Ares.get_basic(entity.ico) do
        %{
          entity: entity,
          vat_status: dph.registration.status,
          unreliable: dph.unreliable_payer.is_unreliable,
          published_accounts: dph.published_accounts.accounts,
          liability_risk: dph.joint_liability_risk,
          company_name: ares.nazev
        }
      end
    end, max_concurrency: 5, timeout: 15_000)
    |> Enum.to_list()

    {:ok, %{
      screened: length(results),
      unreliable_payers: Enum.count(results, &match?({:ok, %{unreliable: true}}, &1)),
      high_risk: Enum.filter(results, &match?({:ok, %{liability_risk: :critical}}, &1)),
      screened_at: DateTime.utc_now()
    }}
  end
end
```

## Use Cases

### Mandatory Pre-Transaction Verification

Czech law effectively mandates DPH registry verification before any significant B2B transaction. Businesses must verify that their supplier is not designated as an unreliable VAT payer and must confirm that payments are directed to published bank accounts to avoid joint liability exposure. This verification should be performed at the point of invoice receipt, before payment authorization.

### Supplier Portfolio Compliance Screening

Organizations with large supplier portfolios conduct periodic bulk screening of all active counterparties against the DPH registry. This screening identifies newly designated unreliable payers, expired VAT registrations, and changes in published bank accounts that could create compliance exposure. The screening frequency depends on risk appetite, but quarterly screening is considered minimum best practice.

### M&A Due Diligence

During acquisition due diligence, the target company's complete supplier and customer portfolio is screened for DPH compliance risks. Active relationships with unreliable payers represent contingent liabilities that must be quantified and disclosed. Historical unreliable payer designations on the target company itself represent significant reputation and compliance risk.

### Credit Risk Assessment

An entity's DPH status is a strong signal in credit risk models. Entities designated as unreliable VAT payers have demonstrated inability or unwillingness to meet tax obligations, which correlates strongly with broader financial distress. Combined with [Insolvency Register](/osint/insolvencni-rejstrik/) data and [Executors](/osint/executors/) enforcement proceedings, DPH status provides a comprehensive credit risk profile.

### Bank Account Verification for Payment Security

The published bank accounts feature of the DPH registry serves as an anti-fraud measure. Before processing payments, finance departments verify that the destination bank account appears in the DPH registry for the invoicing entity. Payments to non-published accounts can trigger joint liability under Section 109 and may also indicate invoice fraud or business email compromise.

## Data Quality and Reliability

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Authority** | Authoritative | Official government register; definitive legal status |
| **Currency** | Real-time | Status changes reflected immediately upon administrative decision |
| **Accuracy** | Very High | Direct from Czech Financial Administration databases |
| **Completeness** | Complete for registered entities | All Czech VAT-registered entities included |
| **Historical Data** | Current state only | No historical status tracking in DPH alone |
| **Availability** | High | Government service with good uptime; occasional maintenance windows |

### Limitations

The DPH registry provides current-state data only. To determine whether an entity was an unreliable payer at a specific historical date, integration with external monitoring or ARES historical feeds is required. The SOAP-based interface lacks modern API conventions (REST, JSON), requiring specialized adapter implementation. Published bank account data may not cover all accounts used by an entity, only those specifically registered for VAT purposes.

## Platform Integration

Within the Prismatic Platform, the DPH registry is a core compliance verification source integrated into the Czech entity analysis pipeline. Every Czech company profile is automatically enriched with VAT status and unreliable payer flags during the standard entity resolution workflow.

The DPH adapter cross-references published bank accounts with payment records and triggers real-time alerts when a business partner's status changes to unreliable. Integration with [ARES](/osint/ares/) provides the entity resolution layer (mapping ICO to DIC), while integration with [Hlidac statu](/osint/hlidac-statu/) provides additional analytics on entities with compliance concerns.

## NABLA Compliance

| NABLA Axiom | Compliance | Implementation |
|-------------|------------|----------------|
| **Signal Plurality** | Compliant | DPH status cross-referenced with ARES, VIES, and Hlidac statu data |
| **Contradiction Preservation** | Compliant | Discrepancies between DPH and VIES status are flagged |
| **Absence Informative** | Compliant | Missing DPH registration for entity claiming VAT status flagged as anomaly |
| **Time Decay** | Compliant | All checks timestamped; stale status flags require re-verification |
| **Unknown Valid** | Compliant | SOAP service errors reported as unknown rather than assumed clear |
| **Source Independence** | Compliant | Direct government source independent of commercial data providers |
| **Provenance Mandatory** | Compliant | All results traced to specific SOAP response with timestamp |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Response Time** | 500ms-2s | SOAP service typical response time |
| **Rate Limit** | No official limit | Fair use expected; bulk queries should be throttled |
| **Data Freshness** | Real-time | Administrative decisions reflected immediately |
| **Coverage** | All CZ VAT entities | Complete coverage of registered taxpayers |
| **VIES Integration** | All 27 EU states | Cross-border validation available |
| **Availability** | ~99% | Government service with scheduled maintenance |
| **Data Format** | XML/SOAP | Normalized to JSON by Prismatic adapter |

## Related Resources

- [ARES](/osint/ares/) - Czech business registry that aggregates DPH data alongside company information
- [RZP](/osint/rzp/) - Trade Licensing Register for complementary entity verification
- [CNB](/osint/cnb/) - Czech National Bank regulated entities registry
- [Hlidac statu](/osint/hlidac-statu/) - Government watchdog with company analytics and risk scoring
- [Justice.cz](/osint/justice-cz/) - Commercial Register for company details and beneficial ownership
- [EU Sanctions](/osint/eu-sanctions/) - EU sanctions screening complementing VAT compliance checks
- [Insolvencni rejstrik](/osint/insolvencni-rejstrik/) - Insolvency data for entities with VAT compliance issues

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)