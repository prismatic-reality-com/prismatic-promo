+++
title = "Blockchain.com"
weight = 42
[extra]
icon = "currency"
color = "cyan"
category = "global"
type = "crypto"
module = "BlockchainCom"
source_type = "crypto"
description = "Blockchain explorer and analytics - Bitcoin and Ethereum transaction tracing and wallet analysis"
has_api = true
url = "https://www.blockchain.com/explorer"
rate_limit = "Free: rate limited, API key available"
capabilities = ["Transaction Lookup", "Address Balance", "Block Explorer", "Wallet Clustering", "Payment Verification", "Network Statistics"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1470
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Blockchaincom", "Blockchain", "Bitcoin", "Ethereum", "osint", "global", "Prismatic Platform", "None"]
tags = ["osint", "global", "blockchaincom", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Blockchain.com - Prismatic Platform"
+++

## Overview

Blockchain.com is one of the oldest and most widely used blockchain explorer platforms in the cryptocurrency ecosystem. Founded in 2011 by Ben Reeves in York, England, the platform has grown from a simple Bitcoin block explorer into a comprehensive cryptocurrency services provider with over 80 million wallets created on its platform. The explorer component remains freely accessible and provides real-time access to Bitcoin and Ethereum transaction data, making it an indispensable tool for cryptocurrency investigations, financial intelligence, and compliance operations.

At its core, Blockchain.com's explorer provides transparent visibility into the public ledger of cryptocurrency transactions. Every Bitcoin or Ethereum transaction ever executed is recorded on its respective blockchain and can be queried, traced, and analyzed through the explorer interface and API. For a single Bitcoin address, the explorer reveals the complete transaction history, current balance, total received and sent amounts, and the relationship to other addresses through transaction inputs and outputs. This raw blockchain data forms the foundation upon which more sophisticated analytics tools build their intelligence.

For [OSINT](@/glossary/osint.md) and financial crime investigations, blockchain explorers are essential infrastructure. Cryptocurrency has become a significant medium for ransomware payments, fraud proceeds, sanctions evasion, darknet marketplace transactions, and money laundering. The ability to trace the flow of funds from a known address through intermediate wallets to eventual cash-out points at exchanges or services is a fundamental investigative technique. Blockchain.com provides the raw transaction data that feeds this analysis, while more advanced analytics platforms like [Chainalysis](@/osint/chainalysis.md) and [Crystal Blockchain](@/osint/crystal-blockchain.md) layer attribution and risk intelligence on top.

Within the Prismatic Platform, Blockchain.com serves as the primary source for raw blockchain data, providing the transaction-level detail that underpins cryptocurrency compliance screening and financial investigation workflows.

## Data Sources and Coverage

Blockchain.com derives its data directly from the Bitcoin and Ethereum blockchain networks by operating full nodes that synchronize the complete transaction history. This provides authoritative, first-party data that does not depend on third-party aggregation or interpretation.

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **Transactions** | Sender, recipient, amount, fee, confirmations, timestamp | All Bitcoin and Ethereum transactions since genesis |
| **Address Data** | Balance, total received, total sent, transaction count | Every address with transaction history |
| **Block Information** | Block height, hash, miner, size, transaction count, reward | Every block from genesis to current |
| **Network Statistics** | Hash rate, difficulty, mempool size, average fees | Real-time and historical |
| **Unspent Outputs** | UTXO data for Bitcoin addresses | Current UTXO set |
| **Token Transfers** | ERC-20 and ERC-721 token movements on Ethereum | All token transfer events |
| **Mempool Data** | Unconfirmed transactions awaiting mining | Real-time |
| **Market Data** | Exchange rates, trading volumes, market capitalization | Aggregated from exchanges |

### Bitcoin UTXO Model

Bitcoin transactions use the Unspent Transaction Output (UTXO) model where each transaction consumes previous outputs and creates new ones. This creates a directed acyclic graph of fund flows that can be traced from origin to destination. Understanding the UTXO model is essential for accurate Bitcoin investigation, as a single transaction may combine inputs from multiple addresses (suggesting common ownership through the common-input-ownership heuristic) and produce outputs to multiple recipients (including change addresses controlled by the sender).

### Ethereum Account Model

Ethereum uses an account-based model where each address maintains a balance that is directly debited and credited by transactions. This simpler model makes balance queries straightforward but introduces complexity in tracing through smart contract interactions, internal transactions, and token transfers that may not appear in standard transaction listings. The Ethereum explorer must additionally track ERC-20 token transfers, ERC-721 NFT movements, and contract creation events.

## Technical Architecture

Blockchain.com provides a [REST API](@/glossary/rest-api.md) with multiple base endpoints for different data types. The primary Bitcoin API operates at `https://blockchain.info/` with JSON response format by default.

### API Endpoints

| Endpoint | Description | Authentication |
|----------|-------------|----------------|
| `/rawblock/{hash}` | Get block data by block hash | None required |
| `/rawtx/{hash}` | Get transaction data by transaction hash | None required |
| `/rawaddr/{address}` | Get address data with transaction history | None required |
| `/balance?active={addresses}` | Multi-address balance query (pipe-delimited) | None required |
| `/unspent?active={address}` | Get unspent outputs for a Bitcoin address | None required |
| `/multiaddr?active={addresses}` | Multi-address data with summary statistics | None required |
| `/q/getblockcount` | Current blockchain height | None required |
| `/q/hashrate` | Current network hash rate in GH/s | None required |
| `/q/getdifficulty` | Current mining difficulty | None required |
| `/ticker` | Current exchange rates in multiple currencies | None required |
| `/charts/{type}?format=json` | Network statistics time series | None required |

The API returns JSON by default. [WebSocket](@/glossary/websocket.md) feeds are available at `wss://ws.blockchain.info/inv` for real-time transaction and block monitoring. Subscription messages use a simple JSON protocol: `{"op":"addr_sub","addr":"1A1zP1..."}` to subscribe to address activity, `{"op":"unconfirmed_sub"}` for all unconfirmed transactions, and `{"op":"blocks_sub"}` for new blocks. Rate limiting applies to free access; API keys are available for higher quotas through the developer portal.

## API Integration

```elixir
defmodule PrismaticOsint.Providers.BlockchainCom do
  @moduledoc """
  Blockchain.com explorer integration for Bitcoin and Ethereum
  transaction intelligence. Provides raw blockchain data for
  cryptocurrency investigation and compliance workflows.
  """

  @behaviour PrismaticOsint.Provider

  @base_url "https://blockchain.info"

  @spec get_address(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  @doc "Get comprehensive address data including transaction history."
  def get_address(address, opts \\ []) do
    params = %{
      limit: Keyword.get(opts, :limit, 50),
      offset: Keyword.get(opts, :offset, 0)
    }

    get("/rawaddr/#{address}", params)
  end

  @spec get_transaction(String.t()) :: {:ok, map()} | {:error, term()}
  @doc "Get full transaction details by transaction hash."
  def get_transaction(tx_hash) do
    get("/rawtx/#{tx_hash}")
  end

  @spec get_balance(list(String.t())) :: {:ok, map()} | {:error, term()}
  @doc "Get balances for multiple addresses in a single request."
  def get_balance(addresses) when is_list(addresses) do
    active = Enum.join(addresses, "|")
    get("/balance", %{active: active})
  end

  @spec get_unspent(String.t()) :: {:ok, list(map())} | {:error, term()}
  @doc "Get unspent transaction outputs for a Bitcoin address."
  def get_unspent(address) do
    get("/unspent", %{active: address})
  end

  @spec get_block(String.t()) :: {:ok, map()} | {:error, term()}
  @doc "Get block data by block hash."
  def get_block(block_hash) do
    get("/rawblock/#{block_hash}")
  end

  @spec subscribe_address(String.t(), function()) :: {:ok, pid()} | {:error, term()}
  @doc "Subscribe to real-time transactions for an address via WebSocket."
  def subscribe_address(address, callback) do
    WebSocket.subscribe("wss://ws.blockchain.info/inv",
      message: Jason.encode!(%{op: "addr_sub", addr: address}),
      callback: callback
    )
  end
end
```

### Financial Intelligence Pipeline

```elixir
defmodule PrismaticCompliance.Crypto.TransactionTracer do
  @moduledoc """
  Traces cryptocurrency fund flows using raw blockchain data
  from Blockchain.com, enriched with attribution data from
  Chainalysis for compliance and investigation purposes.
  """

  @spec trace_funds(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def trace_funds(address, opts \\ []) do
    depth = Keyword.get(opts, :depth, 3)
    min_value = Keyword.get(opts, :min_value_btc, 0.001)

    with {:ok, addr_data} <- BlockchainCom.get_address(address),
         {:ok, attribution} <- Chainalysis.screen_address(address),
         {:ok, flow_graph} <- build_flow_graph(addr_data, depth, min_value) do
      {:ok, %{
        address: address,
        balance_btc: addr_data.final_balance / 100_000_000,
        total_received_btc: addr_data.total_received / 100_000_000,
        transaction_count: addr_data.n_tx,
        attribution: attribution,
        flow_graph: flow_graph,
        risk_indicators: assess_flow_risk(flow_graph, attribution),
        traced_at: DateTime.utc_now()
      }}
    end
  end
end
```

## Use Cases

### Ransomware Payment Tracing

When organizations pay ransomware demands or law enforcement investigates ransom payments, Blockchain.com provides the raw transaction data needed to trace where funds flow after the initial payment. By following the chain of transactions from the ransom payment address through intermediate wallets, investigators can identify the cash-out points where cryptocurrency is converted to fiat currency -- typically at exchanges subject to KYC/AML regulations. The immutable nature of blockchain records means this evidence is inherently tamper-resistant.

### Sanctions Compliance Verification

Financial institutions and Virtual Asset Service Providers (VASPs) must screen cryptocurrency addresses against sanctions lists. Blockchain.com provides the transaction history needed to determine whether an address has received funds from or sent funds to sanctioned addresses listed by [OFAC](@/osint/ofac.md) or [EU Sanctions](@/osint/eu-sanctions.md). The WebSocket API enables real-time monitoring of watched addresses for immediate alerting on new activity.

### Fraud Investigation and Asset Recovery

In fraud cases involving cryptocurrency, Blockchain.com enables investigators to document the movement of stolen funds, establish transaction timelines, and identify accounts where assets may be frozen for recovery. Courts in multiple jurisdictions have accepted blockchain explorer data as evidence, given its derivation from cryptographically verified public ledger records.

### Due Diligence and Risk Assessment

During counterparty onboarding for cryptocurrency-related business relationships, compliance teams assess address histories to identify exposure to high-risk activities. Blockchain.com provides the foundational transaction data for this analysis, revealing patterns, counterparty addresses, and flow volumes that feed into automated risk scoring systems provided by [Chainalysis](@/osint/chainalysis.md) or [Crystal Blockchain](@/osint/crystal-blockchain.md).

### Network Health Monitoring

Blockchain.com's network statistics endpoints provide real-time visibility into blockchain health metrics: hash rate trends indicate mining security, mempool sizes signal network congestion, and fee market data informs transaction cost expectations. These metrics are relevant for organizations that accept or process cryptocurrency payments.

## Data Quality and Reliability

**Strengths**: Blockchain.com provides authoritative, first-party blockchain data derived directly from full node synchronization. The data is inherently accurate because it reflects the consensus state of the blockchain network. Transaction records are immutable and cryptographically verifiable, providing the highest possible data integrity for financial records. The platform has operated continuously since 2011, demonstrating exceptional reliability and availability.

**Limitations**: Raw blockchain data provides transaction-level detail but lacks attribution -- it shows addresses and amounts but not the real-world identities behind them. Bitcoin's UTXO model creates complexity in determining the true sender and recipient without address clustering analysis. The API's rate limiting on the free tier constrains high-volume automated analysis. Ethereum internal transactions (calls between contracts) and some token transfer events may not be fully captured by all standard API endpoints.

**Mitigation**: Within the Prismatic Platform, Blockchain.com's raw data is always enriched with attribution intelligence from [Chainalysis](@/osint/chainalysis.md), [Crystal Blockchain](@/osint/crystal-blockchain.md), or [Elliptic](@/osint/elliptic.md) before making compliance decisions. Raw blockchain data provides the evidence layer; analytics platforms provide the intelligence layer. This separation ensures that evidence integrity is maintained while analytical interpretation can be updated as attribution databases improve.

## Platform Integration

| Integration Point | Description | Component |
|-------------------|-------------|-----------|
| **Crypto Compliance** | Raw transaction data for address screening and fund tracing | `PrismaticCompliance.Crypto` |
| **Financial Intelligence** | Fund flow analysis for investigation workflows | `PrismaticOsint.Financial` |
| **Real-Time Monitoring** | WebSocket alerts for watched address activity | `PrismaticOsint.Monitoring` |
| **Evidence Collection** | Immutable transaction records for legal proceedings | `PrismaticOsint.Evidence` |
| **Risk Scoring** | Transaction pattern analysis for address risk assessment | `PrismaticPerimeter.Rating` |

## NABLA Compliance

| Axiom | Implementation |
|-------|----------------|
| **Signal Plurality** | Blockchain data correlated with Chainalysis attribution and sanctions lists before decisions |
| **Contradiction Preservation** | Discrepancies between explorer data and analytics platform findings are preserved and flagged |
| **Time Decay** | Transaction timestamps provide inherent temporal context; recent activity weighted higher |
| **Source Independence** | Blockchain data is first-party from network consensus, independent from analytics interpretations |
| **Provenance Mandatory** | Every data point includes block height, transaction hash, and confirmation count |
| **Unknown Valid** | Addresses without analytics attribution are classified as "unattributed" rather than "clean" |

## Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **API Response Time** | 100-500ms | Single address or transaction query |
| **WebSocket Latency** | Sub-second | Real-time transaction notifications |
| **Data Freshness** | Real-time | Mempool data available pre-confirmation |
| **Bitcoin Coverage** | Complete | Every transaction since January 3, 2009 |
| **Ethereum Coverage** | Complete | Every transaction since July 30, 2015 |
| **Historical Depth** | Full genesis | Complete blockchain history for supported chains |
| **Uptime** | 99.9%+ | Enterprise-grade infrastructure since 2011 |

## Related Resources

- [Chainalysis](@/osint/chainalysis.md) - Enterprise cryptocurrency analytics with address attribution intelligence
- [Crystal Blockchain](@/osint/crystal-blockchain.md) - Blockchain analytics with visual graph exploration tools
- [Etherscan](@/osint/etherscan.md) - Ethereum-focused blockchain explorer with token analytics
- [OFAC](@/osint/ofac.md) - US sanctions list with designated cryptocurrency addresses
- [EU Sanctions](@/osint/eu-sanctions.md) - European Union sanctions for compliance screening
- [Elliptic](@/osint/elliptic.md) - Crypto risk management and holistic compliance platform

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)