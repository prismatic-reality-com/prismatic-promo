+++
title = "Chainalysis"
weight = 51
[extra]
category = "global"
type = "crypto"
module = "Chainalysis"
description = "Enterprise cryptocurrency compliance and investigation platform used by 100+ government agencies and 70+ financial institutions"
has_api = true
url = "https://www.chainalysis.com"
rate_limit = "Contract-dependent, typically 100 req/min"
capabilities = ["Transaction Screening", "Address Risk Scoring", "Cluster Analysis", "Flow Visualization", "Sanctions Compliance", "DeFi Monitoring", "Cross-Chain Tracing", "Real-Time Alerts"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1753
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Chainalysis", "Enterprise", "osint", "global", "Prismatic Platform", "High", "VASP", "OFAC"]
tags = ["osint", "global", "chainalysis", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Chainalysis - Prismatic Platform"
+++

## Overview

Chainalysis is the leading cryptocurrency investigation and compliance platform, used by over 100 government agencies, 70 financial institutions, and thousands of companies worldwide. The platform provides the most comprehensive blockchain analytics capability available, covering Bitcoin, Ethereum, and over 150 other cryptocurrencies and tokens. Founded in 2014 by former Kraken COO Michael Gronager, Chainalysis has established itself as the industry standard for converting pseudonymous blockchain data into actionable intelligence for law enforcement, compliance teams, and financial institutions.

At its core, Chainalysis maintains a proprietary attribution database that maps cryptocurrency addresses to real-world entities: exchanges, darknet markets, ransomware operators, sanctioned entities, DeFi protocols, mixers, and more. This attribution data, built over years of law enforcement collaboration, independent research, and partnerships with virtual asset service providers, transforms the pseudonymous nature of blockchain transactions into a transparent intelligence layer. The attribution database covers billions of addresses across all supported blockchains, with new attributions added continuously through both automated clustering algorithms and manual analyst verification.

Chainalysis offers three primary products: **Reactor** for investigation (visual transaction tracing, graph analysis, and case management), **KYT (Know Your Transaction)** for compliance (real-time transaction screening, risk scoring, and regulatory reporting), and **Kryptos** for market intelligence (institutional-grade research and portfolio risk assessment). For the Prismatic platform, Chainalysis provides the gold standard for cryptocurrency compliance screening, far exceeding what raw blockchain explorer data from [Blockchain.com](/osint/blockchain-com/) or [Etherscan](/osint/etherscan/) can provide alone. The platform's intelligence enables the critical distinction between legitimate cryptocurrency activity and illicit fund flows that characterize money laundering, sanctions evasion, ransomware payments, and terrorist financing.

## Data Sources and Coverage

Chainalysis aggregates intelligence from blockchain data, law enforcement partnerships, VASP collaborations, and proprietary research to build its attribution and risk assessment capabilities.

| Data Type | Description | Coverage Depth |
|-----------|-------------|----------------|
| **Entity Attribution** | Address-to-entity mapping (exchanges, darknet, ransomware, etc.) | Billions of addresses |
| **[Risk Score](/glossary/risk-score/)s** | Address and transaction risk ratings (low, medium, high, severe) | All supported chains |
| **Cluster Analysis** | Address clustering identifying wallets controlled by same entity | Heuristic + manual |
| **Transaction Flows** | Visual fund flow tracing across hops and chains | Unlimited depth |
| **[Sanctions Screening](/glossary/sanctions-screening/)** | Real-time screening against OFAC, EU, UN, and other sanctions lists | Global coverage |
| **DeFi Interactions** | [Protocol](/glossary/protocol/)-level tracking (Uniswap, Aave, Tornado Cash, etc.) | 100+ protocols |
| **Cross-Chain** | Tracing across bridge transactions (BTC to ETH, L2 bridges) | Major bridges |
| **Historical Data** | Full historical coverage since each blockchain's genesis | Complete |
| **Counterparty Intelligence** | VASP-reported transaction counterparty data | KYT participants |

### Attribution Categories

| Category | Risk Level | Examples |
|----------|------------|---------|
| **Sanctions** | Severe | OFAC SDN-listed cryptocurrency addresses |
| **Darknet Market** | High | Hydra, AlphaBay, Silk Road addresses |
| **Ransomware** | High | REvil, Conti, LockBit, BlackCat payment addresses |
| **Stolen Funds** | High | Addresses holding proceeds of exchange hacks |
| **Mixer/Tumbler** | Medium-High | Tornado Cash, Wasabi, CoinJoin transactions |
| **Scam** | Medium-High | Ponzi schemes, phishing, pig butchering addresses |
| **P2P Exchange** | Medium | Peer-to-peer exchange addresses (LocalBitcoins) |
| **Exchange** | Low | Regulated cryptocurrency exchanges (Coinbase, Kraken) |
| **Mining** | Low | Mining pool and individual miner addresses |

### Clustering Methodology

Chainalysis uses several clustering heuristics to group addresses controlled by the same entity. For Bitcoin, common-input-ownership (CIO) heuristics identify addresses that appear as inputs in the same transaction, as they are almost certainly controlled by the same wallet. Change address detection identifies outputs returned to the sender. For Ethereum and EVM chains, contract creation analysis and internal transaction patterns reveal address relationships. These automated heuristics are supplemented by manual analyst attribution based on law enforcement intelligence, open-source research, and voluntary VASP disclosures.

## Technical Architecture

The Chainalysis platform operates a sophisticated data pipeline that ingests raw blockchain data and transforms it into enriched intelligence products.

The blockchain ingestion layer runs full nodes for all supported blockchains, parsing every block and transaction in real time. For Bitcoin, this means processing approximately 300,000 transactions per day. For Ethereum, the ingestion includes standard transactions, internal transactions (contract calls), token transfers, and event logs.

The clustering engine applies heuristic algorithms to group addresses into entity clusters. The clustering is continuously refined as new transactions provide additional linkage evidence. Clusters can contain millions of addresses for large entities like major exchanges.

The attribution layer maps clusters to real-world entities using a combination of intelligence sources. Attribution confidence levels range from "confirmed" (law enforcement verified) to "estimated" (heuristic-based). The attribution database is the core intellectual property of the platform and represents over a decade of cumulative intelligence.

The risk scoring engine computes risk scores for addresses and transactions based on direct exposure (immediate counterparty category), indirect exposure (exposure through intermediaries within configurable hop distance), behavioral patterns (transaction timing, amounts, and structuring), and sanctions list matching. Risk scores are recalculated in near real-time as new transactions and attributions are added to the system.

## API Integration

Chainalysis provides enterprise-grade APIs for programmatic integration with compliance and investigation workflows.

```elixir
defmodule PrismaticOsint.Adapters.Chainalysis do
  @moduledoc """
  Chainalysis blockchain analytics adapter for cryptocurrency compliance
  screening, risk assessment, and transaction monitoring.
  """

  @kyt_url "https://api.chainalysis.com/api/kyt/v2"
  @reactor_url "https://api.chainalysis.com/api/risk/v2"

  # Screen a cryptocurrency address for risk
  def screen_address(address, opts \\ []) do
    asset = Keyword.get(opts, :asset, "BTC")
    body = %{address: address, asset: asset}

    with {:ok, response} <- api_post("#{@reactor_url}/entities", body) do
      {:ok, %{
        address: address,
        asset: asset,
        risk_score: response["risk"],
        risk_rating: response["riskRating"],
        cluster: parse_cluster(response["cluster"]),
        exposure: parse_exposure(response["exposure"]),
        sanctions_match: response["sanctionsMatch"],
        alerts: response["alerts"] || []
      }}
    end
  end

  # Real-time transaction screening (KYT)
  def kyt_screen_transfer(opts) do
    body = %{
      asset: Keyword.fetch!(opts, :asset),
      direction: Keyword.fetch!(opts, :direction),
      transferReference: Keyword.fetch!(opts, :transfer_reference),
      address: Keyword.fetch!(opts, :address)
    }

    with {:ok, response} <- api_post("#{@kyt_url}/transfers", body) do
      {:ok, parse_kyt_result(response)}
    end
  end

  # Trace fund flows through the blockchain
  def trace_flows(address, opts \\ []) do
    direction = Keyword.get(opts, :direction, :both)
    depth = Keyword.get(opts, :depth, 5)
    min_value = Keyword.get(opts, :min_value_usd, 0)

    params = %{direction: direction, depth: depth, minValueUsd: min_value}

    with {:ok, response} <- api_get("#{@reactor_url}/addresses/#{address}/flows", params) do
      {:ok, parse_flow_graph(response)}
    end
  end

  # Screen against sanctions lists
  def sanctions_screen(address) do
    with {:ok, response} <- api_get("#{@reactor_url}/addresses/#{address}/sanctions") do
      {:ok, %{
        address: address,
        sanctioned: response["match"],
        programs: response["programs"] || [],
        checked_at: DateTime.utc_now()
      }}
    end
  end

  # Monitor address for future activity
  def create_alert(opts) do
    body = %{
      address: Keyword.fetch!(opts, :address),
      conditions: Keyword.get(opts, :conditions, []),
      notifyMethod: Keyword.get(opts, :notify, :webhook)
    }

    api_post("#{@kyt_url}/alerts", body)
  end
end
```

### Crypto Compliance Pipeline

```elixir
defmodule PrismaticCompliance.Crypto.ComplianceScreener do
  @moduledoc """
  Enterprise cryptocurrency compliance screening using Chainalysis
  for risk scoring and OFAC/EU sanctions matching.
  """

  alias PrismaticOsint.Adapters.{Chainalysis, Ofac}

  def screen_crypto_address(address, asset \\ "BTC") do
    tasks = [
      Task.async(fn -> Chainalysis.screen_address(address, asset: asset) end),
      Task.async(fn -> Ofac.check_crypto_address(address) end),
      Task.async(fn -> get_blockchain_data(address, asset) end)
    ]

    [chainalysis, ofac, blockchain] = Task.await_many(tasks, 30_000)

    {:ok, %{
      address: address,
      asset: asset,
      chainalysis_risk: extract_ok(chainalysis),
      ofac_match: extract_ok(ofac),
      blockchain_data: extract_ok(blockchain),
      composite_risk: calculate_composite_risk(chainalysis, ofac),
      action_required: determine_action(chainalysis, ofac),
      screened_at: DateTime.utc_now()
    }}
  end

  defp determine_action(chainalysis, ofac) do
    cond do
      match?({:ok, %{sanctions_match: true}}, chainalysis) -> :block_immediately
      match?({:ok, %{match: true}}, ofac) -> :block_immediately
      match?({:ok, %{risk_score: :high}}, chainalysis) -> :enhanced_review
      match?({:ok, %{risk_score: :medium}}, chainalysis) -> :standard_review
      true -> :clear
    end
  end
end
```

## Use Cases

### Regulatory Compliance

Chainalysis provides the compliance infrastructure required for Virtual Asset Service Providers (VASPs) operating under global anti-money laundering regulations. Key compliance workflows include real-time transaction screening for all incoming and outgoing cryptocurrency transfers, automated sanctions screening against [OFAC](/osint/ofac/), [EU](/osint/eu-sanctions/), UN, and national sanctions lists, Travel Rule compliance for cross-border cryptocurrency transfers exceeding regulatory thresholds, Suspicious Activity Report (SAR) preparation with supporting blockchain evidence, and customer risk profiling based on transaction history and counterparty exposure.

### Financial Crime Investigation

Law enforcement agencies and financial crime investigators use Chainalysis Reactor to trace ransomware payments through blockchain networks to identify cash-out points at regulated exchanges, investigate cryptocurrency money laundering through mixers, decentralized exchanges, and cross-chain bridges, reconstruct fund flows for court-admissible blockchain evidence packages, identify darknet market operators and buyers through transaction pattern analysis, and trace proceeds of cryptocurrency exchange hacks and DeFi exploits.

### Risk Assessment and Due Diligence

Financial institutions and cryptocurrency businesses leverage Chainalysis risk scoring for onboarding decisions about new customers based on their cryptocurrency transaction history, ongoing transaction monitoring to detect emerging risk patterns, counterparty risk assessment for over-the-counter and institutional trading, portfolio-level risk assessment for investment funds with cryptocurrency exposure, and vendor due diligence for partnerships with other VASPs and cryptocurrency service providers.

### Ransomware Response

Chainalysis provides critical capabilities for ransomware incident response, enabling victim organizations and law enforcement to trace ransom payments to identify the receiving wallets and their associated entity clusters, monitor ransom payment addresses for fund movement indicating cash-out attempts, generate intelligence packages for law enforcement coordination across jurisdictions, and assess whether ransom payment would violate sanctions regulations.

## Data Quality and Validation

Chainalysis maintains the highest data quality standards in the blockchain analytics industry through multiple validation mechanisms.

Attribution confidence levels are explicitly tracked and communicated. Confirmed attributions come from direct law enforcement intelligence, VASP partnerships, or verified open-source evidence. Estimated attributions derive from clustering heuristics and may be updated as additional evidence becomes available. The platform clearly distinguishes between these confidence levels in all API responses and investigation tools.

Clustering accuracy is continuously validated through false positive monitoring. When transactions reveal that two clusters should be separate entities (a clustering error), the platform corrects the cluster assignment and retroactively updates all dependent risk scores and attributions.

Cross-chain tracing accuracy depends on bridge transaction identification, which uses a combination of known bridge contract monitoring, transaction timing correlation, and amount matching. Cross-chain attributions carry lower confidence scores than single-chain attributions, reflecting the inherent uncertainty in bridging operations.

Risk scores undergo periodic backtesting against known-outcome cases (confirmed fraud, successful prosecutions, cleared false positives) to calibrate scoring models and ensure that risk thresholds accurately predict real-world outcomes.

## Platform Integration

Within the Prismatic ecosystem, Chainalysis provides enterprise-grade cryptocurrency compliance integrated with the dual-jurisdiction sanctions screening pipeline alongside [OFAC](/osint/ofac/) and [EU Sanctions](/osint/eu-sanctions/).

The compliance screening pipeline routes all cryptocurrency address screenings through Chainalysis KYT as the primary risk assessment source, with OFAC SDN list and EU Consolidated Sanctions List checked in parallel. Results are aggregated into a composite risk score that considers both the Chainalysis risk rating and direct sanctions list matches.

The investigation workflow integrates Chainalysis Reactor capabilities with other Prismatic intelligence sources, enabling analysts to begin with a cryptocurrency address and expand the investigation to include entity identification, beneficial ownership through [ARES](/osint/ares/) and [Justice.cz](/osint/justice-cz/), and media intelligence through [GDELT](/osint/gdelt/).

The [Prismatic Perimeter](/apps/prismatic-perimeter/) security rating engine incorporates cryptocurrency compliance posture as a factor in organizational security ratings, penalizing entities that interact with high-risk cryptocurrency addresses or operate VASPs without adequate compliance programs.

## NABLA Compliance

The Chainalysis integration adheres to NABLA epistemic framework requirements for reliable intelligence assessment.

**Signal Plurality**: Cryptocurrency risk assessments are never based on Chainalysis alone. The platform cross-validates against independent analytics providers ([Elliptic](/osint/elliptic/), [Crystal Blockchain](/osint/crystal-blockchain/)), direct sanctions list checks, and raw blockchain data. Critical screening decisions require consensus from at least two independent providers.

**Contradiction Preservation**: When Chainalysis and alternative providers disagree on risk classification, both assessments are preserved and presented to analysts with supporting evidence. The platform does not automatically resolve contradictions but flags them for manual review.

**Time Decay**: Attribution confidence degrades over time for addresses that have been inactive. Historical risk assessments carry temporal metadata enabling analysts to distinguish between current and historical risk profiles. Risk scores are recalculated when new transaction activity is detected.

**Provenance Mandatory**: All Chainalysis data points include complete provenance: API response timestamps, attribution confidence levels, cluster identifiers, and the specific Chainalysis data pipeline version. Investigation reports maintain full audit trails for regulatory compliance and court admissibility.

**Source Independence**: Chainalysis is weighted as an independent source with its own proprietary clustering methodology, attribution database, and risk scoring model. Source independence is maintained by using separate API credentials, independent data freshness monitoring, and distinct confidence calibration.

## Performance and Rate Limits

| Product | Access | Typical Users | Response Time |
|---------|--------|---------------|---------------|
| **KYT Standard** | Enterprise contract | Exchanges, fintechs | < 500ms |
| **KYT Complete** | Enterprise contract | Financial institutions, 100+ chains | < 1s |
| **Reactor** | Enterprise license | Law enforcement, investigators | Interactive |
| **Kryptos** | Research subscription | Institutional investors, researchers | Dashboard |

### Authentication and Integration

API key and secret required for all programmatic access. Enterprise onboarding process includes compliance review, use case validation, and data handling agreements. The API supports both synchronous request-response patterns for real-time screening and asynchronous webhook-based notifications for ongoing monitoring alerts.

Typical API rate limits are contract-dependent, with standard enterprise agreements supporting 100 requests per minute. The Prismatic adapter implements request queuing, response caching (5-minute TTL for risk scores, 24-hour TTL for entity attributions), and circuit breaker patterns to ensure reliable operation within rate limits.

## Related Resources

- [Blockchain.com](/osint/blockchain-com/) - Bitcoin blockchain explorer for raw data
- [Etherscan](/osint/etherscan/) - Ethereum blockchain explorer and analytics
- [Elliptic](/osint/elliptic/) - Crypto risk management and compliance
- [Crystal Blockchain](/osint/crystal-blockchain/) - Blockchain analytics and visualization
- [OFAC](/osint/ofac/) - US sanctions including cryptocurrency addresses
- [EU Sanctions](/osint/eu-sanctions/) - European Union sanctions compliance
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Cryptocurrency compliance in security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)