+++
title = "Etherscan"
weight = 50
[extra]
category = "global"
type = "crypto"
module = "Etherscan"
description = "Ethereum blockchain explorer and analytics platform for smart contract, token, and transaction intelligence"
has_api = true
url = "https://etherscan.io"
rate_limit = "5 calls/sec (free), 10 calls/sec (pro)"
capabilities = ["Transaction Lookup", "Address Analytics", "Smart Contract Verification", "Token Tracking", "Gas Analytics", "Event Log Search", "Internal Transaction Tracing"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1404
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Etherscan", "Ethereum", "osint", "global", "Prismatic Platform", "DeFi"]
tags = ["osint", "global", "etherscan", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Etherscan - Prismatic Platform"
+++

## Overview

Etherscan is the dominant blockchain explorer for the Ethereum network, providing comprehensive access to all Ethereum transactions, smart contracts, tokens, and decentralized application (dApp) activity. As the most widely used Ethereum explorer with over 5 billion API calls per day, Etherscan is the standard reference for Ethereum blockchain intelligence. The platform indexes every transaction, contract deployment, token transfer, and internal call on the Ethereum mainnet, providing both a web interface for interactive exploration and a comprehensive API for programmatic access.

Unlike Bitcoin's relatively simple UTXO transaction model, Ethereum's smart contract platform creates a far more complex analytical surface. Every token transfer (ERC-20), NFT transaction (ERC-721/ERC-1155), DeFi interaction (swaps, lending, staking), and smart contract execution is recorded on-chain and indexed by Etherscan. This complexity means that Ethereum address analysis reveals not just fund flows but programmatic interactions: which smart contracts an address has interacted with, what tokens it holds, which DeFi protocols it has used, and what NFTs it owns.

For [OSINT](@/glossary/osint.md) investigators, Etherscan provides a rich behavioral profile that goes beyond simple value transfers. The platform's smart contract source code verification feature allows investigators to understand the logic of contracts involved in scams, hacks, or money laundering operations. Token holder analysis reveals ownership distribution and whale activity. Event log search enables detection of specific on-chain events across the entire Ethereum network.

Etherscan also operates explorers for major EVM-compatible chains including Polygon (Polygonscan), BNB Chain (BscScan), Arbitrum (Arbiscan), and Optimism, providing a unified interface paradigm across the broader Ethereum ecosystem. For the Prismatic platform, Etherscan complements Bitcoin analysis from [Blockchain.com](@/osint/blockchain-com.md) with Ethereum-specific intelligence and feeds into the cryptocurrency compliance pipeline alongside [Chainalysis](@/osint/chainalysis.md) risk assessments.

## Data Sources and Coverage

Etherscan indexes all data from the Ethereum blockchain, providing complete coverage from the genesis block (July 2015) to the present.

| Data Type | Description | Coverage |
|-----------|-------------|---------|
| **Transactions** | Standard ETH transfers with full details (from, to, value, gas) | Complete |
| **Internal Transactions** | Contract-to-contract calls and value transfers | Complete |
| **Token Transfers** | ERC-20, ERC-721, ERC-1155 token movements | All token standards |
| **Smart Contracts** | Verified source code, ABI, creation transaction | Verified contracts |
| **Address Profiles** | Balance, transaction count, token holdings, labels | All addresses |
| **Gas Analytics** | Gas prices, gas used, transaction costs, priority fees | Real-time and historical |
| **Event Logs** | Smart contract event emissions with decoded parameters | All emitted events |
| **Block Data** | Block details, validator, rewards, MEV data | All blocks |
| **ENS Names** | Ethereum Name Service resolution and reverse lookups | All registered names |
| **Beacon Chain** | Validator data, staking information, withdrawals | Post-merge data |

### Ethereum Transaction Complexity

Ethereum address analysis reveals multiple layers of activity. Standard ETH transfers show direct value movement between addresses. ERC-20 token transfers reveal stablecoin activity (USDT, USDC, DAI), utility token holdings, and DeFi governance participation. ERC-721 and ERC-1155 NFT transfers indicate digital collectible ownership and trading patterns. Smart contract interactions reveal DeFi protocol usage (Uniswap, Aave, Compound), bridge operations, and automated strategy execution. Internal transactions expose contract-to-contract calls that are invisible in standard transaction lists but critical for understanding fund flows through DeFi protocols.

## Technical Architecture

Etherscan operates a sophisticated indexing infrastructure that processes the Ethereum blockchain in real time.

The blockchain ingestion layer runs multiple Ethereum execution clients (Geth, Erigon) and consensus clients to maintain full blockchain state. Transaction processing includes receipt parsing for event log extraction, trace execution for internal transaction capture, and state diff analysis for balance change tracking.

The indexing pipeline processes raw blockchain data into searchable indexes optimized for different query patterns. Address-based indexes support balance lookups and transaction history. Contract-based indexes support ABI decoding and event log filtering. Token-based indexes support holder analysis and transfer tracking. Time-based indexes support temporal queries and analytics.

The API layer provides RESTful endpoints organized into modules (Account, Contract, Transaction, Block, Token, Gas, Stats) with JSON responses. Rate limiting is implemented per API key with configurable tiers. The web interface adds additional capabilities including verified contract source code browsing, transaction decoder, and visual analytics dashboards.

Smart contract verification is a unique Etherscan feature where contract deployers can submit their Solidity source code, which Etherscan compiles and compares against the deployed bytecode. Verified contracts have their source code, ABI, and compiler settings publicly viewable, enabling security analysis and interaction transparency.

## API Integration

Etherscan provides a comprehensive API for programmatic Ethereum blockchain intelligence.

```elixir
defmodule PrismaticOsint.Adapters.Etherscan do
  @moduledoc """
  Etherscan Ethereum blockchain adapter for the Prismatic OSINT pipeline.
  Provides address analysis, token tracking, and smart contract intelligence.
  """

  @base_url "https://api.etherscan.io/api"

  # Get address balance
  def get_balance(address) do
    params = %{module: "account", action: "balance", address: address, tag: "latest"}

    with {:ok, response} <- api_get(params) do
      wei = String.to_integer(response["result"])
      {:ok, %{
        address: address,
        balance_wei: response["result"],
        balance_eth: wei / 1.0e18
      }}
    end
  end

  # Get transaction list for an address
  def transactions(address, opts \\ []) do
    params = %{
      module: "account", action: "txlist", address: address,
      startblock: Keyword.get(opts, :start_block, 0),
      endblock: Keyword.get(opts, :end_block, 99999999),
      sort: Keyword.get(opts, :sort, :desc)
    }

    with {:ok, response} <- api_get(params) do
      {:ok, Enum.map(response["result"], &parse_transaction/1)}
    end
  end

  # Get ERC-20 token transfers
  def token_transfers(address, opts \\ []) do
    params = %{module: "account", action: "tokentx", address: address}
    params = if ca = Keyword.get(opts, :contract_address), do: Map.put(params, :contractaddress, ca), else: params

    with {:ok, response} <- api_get(params) do
      {:ok, Enum.map(response["result"], &parse_token_transfer/1)}
    end
  end

  # Get internal transactions (contract calls)
  def internal_transactions(address) do
    params = %{module: "account", action: "txlistinternal", address: address}

    with {:ok, response} <- api_get(params) do
      {:ok, Enum.map(response["result"], &parse_internal_tx/1)}
    end
  end

  # Get token holdings for an address
  def token_holdings(address) do
    params = %{module: "account", action: "tokenbalance", address: address}

    with {:ok, response} <- api_get(params) do
      {:ok, parse_token_holdings(response["result"])}
    end
  end

  # Get smart contract source code
  def contract_source(address) do
    params = %{module: "contract", action: "getsourcecode", address: address}

    with {:ok, response} <- api_get(params) do
      {:ok, parse_contract_source(response["result"])}
    end
  end

  # Get gas price oracle
  def gas_oracle do
    params = %{module: "gastracker", action: "gasoracle"}

    with {:ok, response} <- api_get(params) do
      {:ok, %{
        safe_gas_price: response["result"]["SafeGasPrice"],
        propose_gas_price: response["result"]["ProposeGasPrice"],
        fast_gas_price: response["result"]["FastGasPrice"]
      }}
    end
  end

  # Get contract event logs
  def get_logs(opts) do
    params = %{
      module: "logs", action: "getLogs",
      address: Keyword.fetch!(opts, :address),
      topic0: Keyword.get(opts, :topic0),
      fromBlock: Keyword.get(opts, :from_block, 0),
      toBlock: Keyword.get(opts, :to_block, "latest")
    }

    with {:ok, response} <- api_get(params) do
      {:ok, Enum.map(response["result"], &parse_log/1)}
    end
  end

  defp api_get(params) do
    api_key = Application.get_env(:prismatic_osint, :etherscan_api_key)
    full_params = Map.put(params, :apikey, api_key)
    PrismaticOsint.Http.get(@base_url, full_params)
  end
end
```

### Ethereum Investigation Pipeline

```elixir
defmodule PrismaticIntelligence.Crypto.EthereumAnalyzer do
  @moduledoc """
  Analyzes Ethereum addresses for compliance screening and
  financial crime investigation across ETH, tokens, and DeFi activity.
  """

  alias PrismaticOsint.Adapters.{Etherscan, Ofac}

  def analyze_address(address) do
    tasks = [
      Task.async(fn -> Etherscan.get_balance(address) end),
      Task.async(fn -> Etherscan.transactions(address, sort: :desc) end),
      Task.async(fn -> Etherscan.token_transfers(address) end),
      Task.async(fn -> Etherscan.internal_transactions(address) end),
      Task.async(fn -> Ofac.check_crypto_address(address) end)
    ]

    [balance, txs, tokens, internal, ofac] = Task.await_many(tasks, 30_000)

    {:ok, %{
      address: address,
      balance: extract_ok(balance),
      transaction_summary: summarize_transactions(txs),
      token_activity: summarize_token_activity(tokens),
      contract_interactions: summarize_internal(internal),
      ofac_status: extract_ok(ofac),
      risk_score: calculate_ethereum_risk(txs, tokens, internal, ofac),
      defi_exposure: detect_defi_interactions(internal),
      analyzed_at: DateTime.utc_now()
    }}
  end

  defp detect_defi_interactions(internal) do
    case internal do
      {:ok, txs} ->
        txs
        |> Enum.map(& &1.contract_address)
        |> Enum.uniq()
        |> Enum.filter(&known_defi_contract?/1)
      _ -> []
    end
  end
end
```

## Use Cases

### DeFi Investigation and Compliance

Ethereum's DeFi ecosystem creates complex fund flows that require specialized analysis. Key capabilities include tracing token flows through decentralized exchanges (Uniswap, SushiSwap, Curve), analyzing lending protocol interactions (Aave, Compound) for collateral and borrowing patterns, identifying smart contract interactions revealing financial behavior and risk exposure, detecting rug pulls and scam token patterns through contract analysis and holder distribution, and tracking bridge operations that move funds to Layer 2 networks or other chains.

### Cryptocurrency Compliance and Sanctions Screening

Etherscan data supports Ethereum-specific compliance workflows. Applications include screening Ethereum addresses against [OFAC](@/osint/ofac.md) sanctioned addresses including Tornado Cash-related addresses, monitoring stablecoin (USDT, USDC, DAI) transfers for suspicious activity and large movements, tracking funds through privacy protocols and mixers for potential sanctions violations, analyzing token holder distributions to identify concentration risk, and monitoring newly deployed contracts for known malicious patterns.

### Smart Contract Security Analysis

Etherscan's contract verification feature supports security analysis workflows. Investigators can verify smart contract source code for security auditing and vulnerability assessment, detect known-malicious contract patterns including honeypots, reentrancy vulnerabilities, and admin backdoors, monitor newly deployed contracts for threat indicators based on bytecode similarity, and analyze contract interactions to understand the execution flow of complex DeFi operations.

### NFT and Digital Asset Investigation

The growing importance of NFTs in financial crime creates investigation requirements that Etherscan supports. Capabilities include tracking NFT ownership transfers for provenance verification, identifying wash trading patterns through transaction analysis, analyzing NFT marketplace activity for price manipulation, and tracing proceeds from NFT-related fraud schemes.

## Data Quality and Validation

Etherscan data quality is inherently high as it derives directly from the Ethereum blockchain, which provides cryptographic guarantees of data integrity. All transactions are verified by Ethereum's proof-of-stake consensus mechanism, ensuring that indexed data accurately reflects the canonical blockchain state.

However, several considerations apply to OSINT usage. Smart contract verification is voluntary, and many contracts remain unverified with only bytecode available. Token names and symbols are self-declared in smart contracts and may be misleading (scam tokens impersonating legitimate projects). Address labels (exchange, known entity) are maintained by Etherscan and may not be comprehensive. Internal transactions require trace execution and may have gaps for very old blocks.

## Platform Integration

Within the Prismatic ecosystem, Etherscan provides Ethereum-specific blockchain intelligence that complements Bitcoin analysis from [Blockchain.com](@/osint/blockchain-com.md). Etherscan data feeds into the cryptocurrency compliance pipeline alongside enterprise analytics from [Chainalysis](@/osint/chainalysis.md), [Elliptic](@/osint/elliptic.md), and [Crystal Blockchain](@/osint/crystal-blockchain.md).

The [Prismatic Perimeter](@/apps/prismatic-perimeter.md) security rating engine uses Etherscan data to assess cryptocurrency-related risk factors for organizations with Ethereum exposure.

## NABLA Compliance

**Signal Plurality**: Etherscan blockchain data is cross-validated with enterprise analytics providers for risk assessment. Raw transaction data provides ground truth that is supplemented by attribution and risk scoring from independent providers.

**Contradiction Preservation**: When Etherscan transaction data suggests different risk levels than enterprise analytics providers, both assessments are preserved. Raw blockchain data serves as the factual foundation while analytics providers contribute interpretation.

**Time Decay**: Transaction timestamps from the blockchain are immutable and authoritative. Address risk assessments are time-weighted to reflect recent activity patterns more heavily than historical transactions.

**Provenance Mandatory**: All Etherscan data includes transaction hashes, block numbers, and timestamps that serve as cryptographic provenance. API query parameters and response timestamps are recorded for audit trails.

**Source Independence**: Etherscan is treated as an independent raw data source distinct from analytics providers. Its blockchain data carries the highest factual authority while analytics providers contribute risk interpretation.

## Performance and Rate Limits

| Tier | Rate Limit | Features |
|------|-----------|----------|
| **Free** | 5 calls/sec, 100K calls/day | Basic API, standard endpoints |
| **Standard** | 10 calls/sec, 200K calls/day | All endpoints, higher limits |
| **Advanced** | 20 calls/sec, 500K calls/day | Premium endpoints, priority |
| **Pro** | 30 calls/sec, Unlimited | Bulk data, [WebSocket](@/glossary/websocket.md), archive access |

### Authentication

API key required for all requests. Free tier available with email registration. The Prismatic adapter implements request queuing with rate limit awareness, response caching with 5-minute TTL for balance queries and 24-hour TTL for historical transactions, and circuit breaker patterns for API reliability.

## Related Resources

- [Blockchain.com](@/osint/blockchain-com.md) - Bitcoin blockchain explorer
- [Chainalysis](@/osint/chainalysis.md) - Enterprise cryptocurrency compliance
- [Elliptic](@/osint/elliptic.md) - Crypto risk management and screening
- [Crystal Blockchain](@/osint/crystal-blockchain.md) - Blockchain analytics platform
- [OFAC](@/osint/ofac.md) - US sanctions including cryptocurrency addresses
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Cryptocurrency risk assessment

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)