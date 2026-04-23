+++
title = "Elliptic"
weight = 52
[extra]
category = "global"
type = "crypto"
module = "Elliptic"
description = "Blockchain analytics and crypto compliance platform for financial crime detection across 100+ blockchains"
has_api = true
url = "https://www.elliptic.co"
rate_limit = "Plan-dependent enterprise contracts"
capabilities = ["Transaction Screening", "Wallet Screening", "Risk Scoring", "Sanctions Checking", "Source of Funds Analysis", "Cross-Chain Analytics", "DeFi Risk Assessment", "NFT Compliance"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1097
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Elliptic", "Blockchain", "osint", "global", "Prismatic Platform", "Compliant", "Chainalysis", "POST"]
tags = ["osint", "global", "elliptic", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Elliptic - Prismatic Platform"
+++

## Overview

Elliptic is a blockchain analytics and cryptoasset compliance company founded in 2013 in London, United Kingdom. As one of the earliest entrants in the blockchain analytics space, Elliptic pioneered the application of data science and machine learning to blockchain transaction analysis for financial crime detection and regulatory compliance. The platform now provides coverage across more than 100 blockchains, including Bitcoin, Ethereum, and all major decentralized finance (DeFi) and non-fungible token (NFT) ecosystems.

Elliptic's core technology comprises two primary products. **Elliptic Lens** provides real-time wallet and transaction screening with automated [risk score](@/glossary/risk-score.md) generation, enabling regulated entities to screen incoming and outgoing transactions against known risk indicators. **Elliptic Navigator** is an investigative tool that enables compliance analysts and law enforcement to visually trace fund flows across blockchains, through mixing services, across cross-chain bridges, and through decentralized exchange protocols. The visual graph interface allows investigators to follow complex transaction chains that would be impossible to trace manually.

Elliptic's most significant technical innovation is its Holistic Screening technology. Traditional blockchain screening evaluates only direct counterparty risk -- whether the immediate sender or receiver of funds is associated with a known entity. Holistic Screening extends this analysis to evaluate the complete fund flow history, assessing risk from funds that have passed through multiple intermediaries before reaching the screened address. This multi-hop analysis provides a more complete picture of exposure to illicit activity, capturing indirect connections to darknet markets, ransomware operations, and sanctioned entities that would be invisible to direct-counterparty screening alone.

For the Prismatic Platform, Elliptic serves as a complementary cryptocurrency compliance source alongside [Chainalysis](@/osint/chainalysis.md), providing independent risk assessments and cross-validation. The dual-provider approach is considered best practice in cryptocurrency compliance, as different analytics firms maintain different attribution databases, use different risk methodologies, and may have different coverage for specific blockchains or entity types. When an address is flagged by both providers, the confidence in the risk assessment increases substantially.

## Data Sources and Coverage

Elliptic builds its intelligence from multiple data categories, combining on-chain blockchain data with off-chain intelligence from regulatory actions, law enforcement investigations, and open-source research.

| Data Category | Description | Scale |
|---------------|-------------|-------|
| **Blockchain Data** | Raw transaction data from 100+ blockchains | Billions of transactions |
| **Entity Attributions** | Known entity labels (exchanges, darknet, ransomware) | Millions of attributed addresses |
| **Risk Scores** | Automated risk rating for addresses (0-10 scale) | Real-time scoring |
| **Sanctions Data** | OFAC, EU, UN sanctions list screening for crypto addresses | Updated within hours of list changes |
| **DeFi Protocol Data** | Smart contract interaction analysis across DeFi protocols | Hundreds of protocols |
| **Cross-Chain Intelligence** | Fund flow tracking across bridge transactions | All major bridges |
| **Source of Funds** | Historical analysis of fund origin categories | Configurable depth (1-20 hops) |
| **Destination of Funds** | Forward-looking analysis of where funds flow | Configurable depth |

### Holistic Screening Model

```
Traditional Screening: Direct counterparty only
    Address A --> Address B (screened) --> Address C
                      ^
                      |
                  Screen HERE only

Elliptic Holistic Screening: Full fund flow analysis
    Address A --> Address B --> Address C --> ... --> Address N
        ^            ^            ^                      ^
        |            |            |                      |
    All intermediaries screened for risk exposure
```

### Blockchain Coverage

| Blockchain Category | Examples | Coverage |
|--------------------|----------|----------|
| **Layer 1** | Bitcoin, Ethereum, Solana, Cardano, Avalanche | Full transaction indexing |
| **Layer 2** | Polygon, Arbitrum, Optimism, zkSync | Full transaction indexing |
| **Stablecoins** | USDT, USDC, DAI, BUSD | Token-level tracking |
| **DeFi Protocols** | Uniswap, Aave, Compound, Curve | Smart contract analysis |
| **NFT Platforms** | OpenSea, Blur, LooksRare | NFT transfer tracking |
| **Privacy Coins** | Zcash (transparent), Monero (limited) | Varies by protocol |

## Technical Architecture

Elliptic's platform operates as a cloud-hosted SaaS solution with API access for programmatic integration.

### API Structure

| Endpoint Category | Purpose | Method |
|------------------|---------|--------|
| **Wallet Screening** | Screen cryptocurrency addresses for risk | POST |
| **Transaction Screening** | Screen individual transactions | POST |
| **Source of Funds** | Analyze fund origin for an address | POST |
| **Destination of Funds** | Analyze where funds flow from an address | POST |
| **Batch Screening** | Screen multiple addresses/transactions | POST |
| **Sanctions Check** | Direct sanctions list matching | POST |

### Data Flow

```
Blockchain Nodes (100+ chains)
    |
    v
Elliptic Data Pipeline
    +-- Transaction Ingestion and Indexing
    +-- Entity Attribution Engine
    +-- Risk Scoring ML Models
    +-- Sanctions List Matching
    +-- Cross-Chain Bridge Tracking
    |
    v
Elliptic API
    +-- Lens (real-time screening)
    +-- Navigator (visual investigation)
    +-- Discovery (proactive monitoring)
    |
    v
Prismatic Platform Integration
```

## API Integration

```elixir
defmodule PrismaticOsint.Adapters.Elliptic do
  @moduledoc """
  Elliptic blockchain analytics adapter for cryptocurrency compliance
  screening, risk scoring, and fund flow analysis. Provides independent
  risk assessment complementing Chainalysis for dual-provider compliance.
  """

  @behaviour PrismaticOsint.Adapter

  @doc """
  Screen a cryptocurrency wallet address for risk.
  """
  def screen_wallet(address, opts \\ []) do
    asset = Keyword.get(opts, :asset, detect_asset(address))
    case api_post("/v2/wallet/screening", %{
      address: address,
      asset: asset,
      screening_type: "holistic"
    }) do
      {:ok, response} ->
        {:ok, %{
          address: address,
          risk_score: response["risk_score"],
          risk_level: classify_risk(response["risk_score"]),
          entity: response["entity"],
          categories: parse_categories(response["categories"]),
          sanctions_match: response["sanctions_match"],
          screening_type: :holistic
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Screen an individual transaction.
  """
  def screen_transaction(opts) do
    params = %{
      hash: Keyword.fetch!(opts, :hash),
      asset: Keyword.fetch!(opts, :asset),
      output_address: Keyword.get(opts, :output_address)
    }
    api_post("/v2/transaction/screening", params)
  end

  @doc """
  Analyze source of funds for an address.
  """
  def source_of_funds(address, opts \\ []) do
    depth = Keyword.get(opts, :depth, 10)
    min_pct = Keyword.get(opts, :min_percentage, 1.0)
    case api_post("/v2/wallet/source-of-funds", %{
      address: address,
      depth: depth,
      min_percentage: min_pct
    }) do
      {:ok, response} ->
        {:ok, %{
          address: address,
          sources: parse_fund_sources(response["sources"]),
          analysis_depth: depth
        }}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @doc """
  Trace fund flows across multiple blockchains.
  """
  def trace_cross_chain(address, opts \\ []) do
    chains = Keyword.get(opts, :chains, [:ethereum, :polygon, :arbitrum])
    api_post("/v2/wallet/cross-chain", %{address: address, chains: chains})
  end

  @doc """
  Batch screen multiple addresses.
  """
  def screen_batch(addresses) do
    api_post("/v2/wallet/batch-screening", %{addresses: addresses})
  end

  defp classify_risk(score) when score >= 7.0, do: :high
  defp classify_risk(score) when score >= 4.0, do: :medium
  defp classify_risk(_score), do: :low
end
```

### Dual-Provider Compliance Pipeline

```elixir
defmodule PrismaticCompliance.Crypto.DualProviderScreener do
  @moduledoc """
  Cross-validates cryptocurrency risk assessments using both
  Chainalysis and Elliptic for maximum compliance confidence.
  """

  def comprehensive_screen(address, asset) do
    tasks = [
      Task.async(fn -> Chainalysis.screen_address(address) end),
      Task.async(fn -> Elliptic.screen_wallet(address) end),
      Task.async(fn -> Ofac.check_crypto_address(address) end)
    ]

    [chainalysis, elliptic, ofac] = Task.await_many(tasks, 30_000)

    {:ok, %{
      address: address,
      asset: asset,
      chainalysis: extract_ok(chainalysis),
      elliptic: extract_ok(elliptic),
      ofac: extract_ok(ofac),
      consensus_risk: determine_consensus_risk(chainalysis, elliptic),
      disagreements: find_disagreements(chainalysis, elliptic),
      action: determine_action(chainalysis, elliptic, ofac),
      screened_at: DateTime.utc_now()
    }}
  end

  defp determine_consensus_risk(chainalysis, elliptic) do
    c_risk = extract_risk_level(chainalysis)
    e_risk = extract_risk_level(elliptic)

    case {c_risk, e_risk} do
      {:high, :high} -> :high_consensus
      {:high, _} -> :high_single_provider
      {_, :high} -> :high_single_provider
      {:medium, :medium} -> :medium_consensus
      _ -> :low
    end
  end
end
```

## Use Cases

### Cryptocurrency Compliance for Financial Institutions

Regulated entities including cryptocurrency exchanges, payment processors, and banks with cryptocurrency exposure use Elliptic for real-time transaction screening to meet AML/CFT regulatory requirements. Holistic Screening provides deeper risk visibility than direct counterparty analysis, identifying indirect exposure to illicit sources that traditional screening would miss.

### DeFi Risk Management

As decentralized finance protocols handle billions in daily volume, compliance teams need to assess the risk of DeFi interactions. Elliptic analyzes smart contract interactions to determine whether funds flowing through DeFi protocols originate from or are destined for high-risk entities. This includes screening liquidity pool deposits, decentralized exchange swaps, and lending protocol interactions.

### NFT Compliance and Provenance

The NFT market presents unique compliance challenges including wash trading, money laundering through high-value NFT transactions, and sanctions evasion. Elliptic provides NFT transaction screening, provenance tracing, and detection of wash trading patterns that may indicate market manipulation or illicit fund flows.

### Cross-Chain Investigation

Criminal actors frequently use cross-chain bridges to move funds between blockchains in an attempt to obscure transaction trails. Elliptic's cross-chain analytics capability tracks fund flows across bridge transactions, maintaining continuity of analysis even when assets move between distinct blockchain networks.

## Data Quality and Reliability

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Attribution Accuracy** | High | Verified entity labels from law enforcement and research |
| **Blockchain Coverage** | Excellent | 100+ blockchains with full transaction indexing |
| **Risk Score Consistency** | High | ML models with continuous retraining |
| **Sanctions Timeliness** | Hours | Updated within hours of regulatory list changes |
| **False Positive Rate** | Low-Moderate | Holistic screening may flag indirect exposure |
| **Cross-Chain Accuracy** | Good | Major bridges covered; newer bridges may have gaps |

## Platform Integration

Within the Prismatic Platform, Elliptic provides independent cryptocurrency risk assessment as part of the dual-provider compliance architecture. Elliptic results are automatically correlated with [Chainalysis](@/osint/chainalysis.md) assessments, with disagreements flagged for manual review. Combined risk scores feed into [Prismatic Perimeter](@/apps/prismatic-perimeter.md) security ratings for entities with cryptocurrency exposure.

## NABLA Compliance

| NABLA Axiom | Compliance | Implementation |
|-------------|------------|----------------|
| **Signal Plurality** | Compliant | Elliptic is one of two blockchain analytics providers (with Chainalysis) |
| **Contradiction Preservation** | Compliant | Disagreements between Elliptic and Chainalysis explicitly preserved |
| **Absence Informative** | Compliant | Addresses unknown to Elliptic tracked as data gaps |
| **Time Decay** | Compliant | All screenings timestamped; risk scores versioned |
| **Unknown Valid** | Compliant | Unattributed addresses reported as unknown, not clean |
| **Source Independence** | Compliant | Independent from Chainalysis with separate attribution database |
| **Provenance Mandatory** | Compliant | Full screening provenance including model version and data date |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Screening Latency** | <1 second | Real-time API response for single address |
| **Batch Throughput** | 1,000+ addresses/min | Bulk screening capability |
| **Blockchain Coverage** | 100+ chains | All major L1 and L2 networks |
| **Entity Database** | Millions of labeled addresses | Continuously updated |
| **Sanctions Update** | <24 hours | After regulatory list publication |
| **Cross-Chain Bridges** | All major bridges | Wormhole, Multichain, Stargate, etc. |
| **API Availability** | 99.9%+ | Enterprise SLA |

## Related Resources

- [Chainalysis](@/osint/chainalysis.md) - Enterprise blockchain analytics (cross-validation partner)
- [Crystal Blockchain](@/osint/crystal-blockchain.md) - Blockchain analytics and visualization
- [Blockchain.com](@/osint/blockchain-com.md) - Bitcoin blockchain raw data explorer
- [Etherscan](@/osint/etherscan.md) - Ethereum blockchain explorer and analytics
- [OFAC](@/osint/ofac.md) - US sanctions including cryptocurrency addresses
- [EU Sanctions](@/osint/eu-sanctions.md) - European sanctions compliance

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)