+++
title = "Crystal Blockchain"
weight = 53
[extra]
category = "global"
type = "crypto"
module = "CrystalBlockchain"
description = "Blockchain analytics platform providing transaction monitoring, visualization, and compliance for cryptocurrency investigations"
has_api = true
url = "https://crystalblockchain.com"
rate_limit = "Plan-dependent enterprise contracts"
capabilities = ["Transaction Tracing", "Wallet Analysis", "Risk Scoring", "AML Compliance", "Cluster Analysis", "Cross-Chain Tracking", "Visual Graph Explorer", "Real-Time Monitoring"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1456
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Crystal", "Blockchain", "osint", "global", "Prismatic Platform", "Chainalysis", "Elliptic", "Enterprise"]
tags = ["osint", "global", "crystal-blockchain", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Crystal Blockchain - Prismatic Platform"
+++

## Overview

Crystal Blockchain, developed by Bitfury Group, provides blockchain analytics for cryptocurrency transaction monitoring, compliance, and investigation. The platform covers Bitcoin, Ethereum, and multiple other blockchains, offering risk scoring, entity attribution, transaction tracing, and a powerful visual graph explorer that enables investigators to follow fund flows across the blockchain with interactive drill-down capabilities.

Crystal distinguishes itself through its visual investigation interface and detailed entity reports. The Crystal graph explorer allows investigators to interactively expand transaction graphs, filter by time period and amount, identify clusters of related addresses, and trace fund paths through complex transaction chains. The visual approach makes Crystal particularly effective for producing investigation reports and court evidence that communicate complex fund flows to non-technical audiences such as judges, juries, and regulatory panels.

The platform's risk scoring considers both direct and indirect exposure to categories including darknet markets, ransomware, mixers, stolen funds, sanctioned entities, gambling services, and high-risk exchanges. Risk scores are computed on a 0-100 scale with category-level breakdown, enabling analysts to understand not just the overall risk level but the specific nature of the risk exposure.

For the Prismatic platform, Crystal serves as a third-party validation source alongside [Chainalysis](@/osint/chainalysis.md) and [Elliptic](@/osint/elliptic.md). In high-stakes compliance scenarios, having multiple independent analytics providers is essential for demonstrating comprehensive due diligence and meeting the evidentiary standards required by regulators and courts. Crystal's visual capabilities are particularly valuable for producing investigation deliverables that effectively communicate findings to stakeholders.

## Data Sources and Coverage

Crystal Blockchain builds its intelligence from blockchain data analysis, entity research, law enforcement collaboration, and community-contributed labels.

| Data Type | Description | Coverage |
|-----------|-------------|---------|
| **[Risk Score](@/glossary/risk-score.md)s** | Address and transaction risk ratings (0-100 scale) | All supported chains |
| **Entity Attribution** | Address labels for known entities (exchanges, services, etc.) | Growing database |
| **Cluster Data** | Address groupings by common ownership patterns | Heuristic-based |
| **Transaction Graphs** | Interactive visual fund flow exploration | Unlimited depth |
| **[Sanctions Screening](@/glossary/sanctions-screening.md)** | OFAC, EU, UN sanctions list matching | Global lists |
| **Entity Reports** | Detailed profiles of known cryptocurrency entities | Major entities |
| **Cross-Chain Data** | Bitcoin, Ethereum, Litecoin, and additional chains | Multi-chain |
| **Real-Time Alerts** | Configurable monitoring for address activity | Webhook-based |
| **Historical Data** | Full blockchain history from genesis blocks | Complete |

### Risk Scoring Model

Crystal's risk assessment combines three analytical dimensions. Direct Risk evaluates the immediate counterparty category of transactions, classifying them as exchange (low), mining (low), merchant (low), gambling (medium), mixer (medium-high), darknet market (high), ransomware (high), or sanctioned entity (critical). Indirect Risk measures exposure through intermediaries up to a configurable number of hops, weighted by distance and proportion of funds flowing through each intermediary. Behavioral Risk analyzes transaction patterns including structuring (splitting transactions to avoid thresholds), rapid fund movement suggesting layering, unusual transaction timing patterns, and peeling chain detection (sequential small withdrawals from a larger amount).

These three dimensions are combined into a composite risk score on a 0-100 scale with a detailed category breakdown showing which risk categories contribute most to the overall score.

## Technical Architecture

Crystal Blockchain operates a multi-layered architecture designed for both automated compliance screening and interactive investigation.

The blockchain data layer runs full nodes for all supported blockchains, ingesting every block and transaction in real time. Raw transaction data is enriched through parsing, normalization, and storage in a graph database optimized for relationship queries and path traversal.

The clustering engine groups addresses into entity clusters using blockchain-specific heuristics. For Bitcoin, common-input-ownership analysis identifies addresses controlled by the same wallet. For Ethereum, contract creation patterns and internal transaction analysis reveal address relationships. Clustering is continuously refined as new transactions provide additional evidence.

The attribution layer maps clusters to real-world entities using intelligence from multiple sources including public data, law enforcement partnerships, community contributions, and Crystal's own research team. Attribution confidence levels distinguish between verified entities, probable identifications, and estimated classifications.

The graph visualization engine renders transaction relationships as interactive directed graphs, supporting node expansion (click to explore connected transactions), temporal filtering (show transactions within a date range), amount filtering (hide transactions below a threshold), cluster collapsing (group related addresses into a single visual node), and path finding (highlight shortest paths between two addresses). The visualization is optimized for both web browser rendering and export to PDF/image formats for report generation.

## API Integration

Crystal Blockchain provides enterprise APIs for programmatic risk assessment, monitoring, and investigation support.

```elixir
defmodule PrismaticOsint.Adapters.CrystalBlockchain do
  @moduledoc """
  Crystal Blockchain analytics adapter for cryptocurrency compliance
  and investigation within the Prismatic OSINT pipeline.
  """

  @base_url "https://api.crystalblockchain.com/v1"

  # Analyze a cryptocurrency address
  def analyze_address(address, opts \\ []) do
    currency = Keyword.get(opts, :currency, "btc")

    with {:ok, response} <- api_get("/#{currency}/addresses/#{address}") do
      {:ok, %{
        address: address,
        risk_score: response["risk_score"],
        risk_level: parse_risk_level(response["risk_score"]),
        entity: response["entity"],
        cluster_size: response["cluster_size"],
        first_seen: parse_datetime(response["first_seen"]),
        last_seen: parse_datetime(response["last_seen"]),
        total_received: response["total_received"],
        total_sent: response["total_sent"],
        exposure: parse_exposure(response["exposure"])
      }}
    end
  end

  # Trace transaction flow
  def trace_flow(address, opts \\ []) do
    direction = Keyword.get(opts, :direction, :incoming)
    depth = Keyword.get(opts, :depth, 5)
    params = %{direction: direction, depth: depth}

    with {:ok, response} <- api_get("/addresses/#{address}/flows", params) do
      {:ok, parse_flow_graph(response)}
    end
  end

  # Get entity report
  def entity_report(entity_name) do
    with {:ok, response} <- api_get("/entities/#{URI.encode(entity_name)}") do
      {:ok, parse_entity_report(response)}
    end
  end

  # Screen against sanctions
  def sanctions_screen(address) do
    with {:ok, response} <- api_get("/addresses/#{address}/sanctions") do
      {:ok, %{
        address: address,
        sanctioned: response["match"],
        lists: response["matched_lists"] || [],
        checked_at: DateTime.utc_now()
      }}
    end
  end

  # Monitor address for new transactions
  def create_monitor(opts) do
    body = %{
      address: Keyword.fetch!(opts, :address),
      threshold: Keyword.get(opts, :alert_threshold_btc, 0.1),
      webhook: Keyword.get(opts, :webhook_url)
    }

    api_post("/monitors", body)
  end

  # Batch risk assessment
  def batch_assess(addresses) when is_list(addresses) do
    body = %{addresses: addresses}

    with {:ok, response} <- api_post("/batch/risk", body) do
      {:ok, Enum.map(response["results"], &parse_batch_result/1)}
    end
  end
end
```

### Triple-Provider Compliance Pipeline

```elixir
defmodule PrismaticCompliance.Crypto.TripleProviderScreener do
  @moduledoc """
  Maximum-confidence cryptocurrency compliance using three independent
  analytics providers for critical screening decisions. Achieves
  consensus-based risk assessment for high-stakes compliance scenarios.
  """

  alias PrismaticOsint.Adapters.{Chainalysis, Elliptic, CrystalBlockchain, Ofac}

  def critical_screen(address, _asset) do
    tasks = [
      Task.async(fn -> Chainalysis.screen_address(address) end),
      Task.async(fn -> Elliptic.screen_wallet(address) end),
      Task.async(fn -> CrystalBlockchain.analyze_address(address) end),
      Task.async(fn -> Ofac.check_crypto_address(address) end)
    ]

    [chainalysis, elliptic, crystal, ofac] = Task.await_many(tasks, 30_000)

    {:ok, %{
      address: address,
      providers: %{
        chainalysis: extract_ok(chainalysis),
        elliptic: extract_ok(elliptic),
        crystal: extract_ok(crystal)
      },
      ofac: extract_ok(ofac),
      consensus: calculate_three_way_consensus(chainalysis, elliptic, crystal),
      confidence: provider_agreement_score(chainalysis, elliptic, crystal),
      action: determine_critical_action(chainalysis, elliptic, crystal, ofac),
      screened_at: DateTime.utc_now()
    }}
  end

  defp provider_agreement_score(c, e, cr) do
    risk_levels = [extract_risk(c), extract_risk(e), extract_risk(cr)]
    |> Enum.reject(&is_nil/1)

    case Enum.uniq(risk_levels) do
      [_] -> 1.0        # All providers agree
      [_, _] -> 0.66    # Two agree, one differs
      _ -> 0.33         # All disagree
    end
  end
end
```

## Use Cases

### Visual Investigation and Evidence Production

Crystal's graph explorer is designed for interactive investigation workflows that produce court-ready evidence. Applications include interactive graph exploration of cryptocurrency fund flows with drill-down capability, generating visual evidence packages for court proceedings and regulatory submissions, mapping complex money laundering networks through cluster analysis and path finding, producing investigation reports that communicate blockchain analysis to non-technical audiences, and documenting the analytical process for audit and quality assurance purposes.

### Compliance Automation

Crystal provides automated compliance screening capabilities for VASPs and financial institutions. Key workflows include automated screening of incoming cryptocurrency deposits against risk thresholds, [real-time monitoring](@/capabilities/real-time-monitoring.md) of high-risk addresses with webhook-based alerting, batch processing for customer portfolio screening during periodic reviews, sanctions list matching with automatic escalation for positive matches, and configurable risk policies that map risk scores to compliance actions.

### Multi-Provider Validation and Due Diligence

Crystal's independent risk assessment methodology makes it valuable for cross-validation in high-stakes compliance decisions. Specific applications include cross-validating risk assessments from [Chainalysis](@/osint/chainalysis.md) and [Elliptic](@/osint/elliptic.md) to identify false positives and false negatives, demonstrating comprehensive due diligence to regulators through multi-provider screening, resolving disagreements between primary screening providers using Crystal as a tie-breaker, and supporting regulatory examinations with evidence from multiple independent sources.

### Ransomware and Financial Crime Analysis

Crystal's tracing capabilities support financial crime investigation workflows including tracing ransom payments through multiple transaction hops to identify cash-out points, identifying mixer and tumbler usage in laundering chains, mapping darknet marketplace transaction patterns, and analyzing DeFi protocol interactions for compliance risk assessment.

## Data Quality and Validation

Crystal Blockchain maintains data quality through continuous blockchain monitoring, regular attribution database updates, and cross-validation of risk assessments against known outcomes.

Risk score accuracy is validated through comparison with confirmed law enforcement intelligence and public case outcomes. Attribution data is updated as new evidence becomes available, and historical risk scores are recalculated when attribution changes affect previously assessed addresses.

Clustering accuracy is monitored through false positive detection. When clustering heuristics incorrectly merge addresses from different entities, the error is corrected and dependent analyses are recalculated. The platform publishes clustering methodology updates that document significant changes to heuristic algorithms.

Cross-chain tracing accuracy is lower than single-chain analysis due to the complexity of bridge transaction identification. Crystal documents confidence levels for cross-chain attributions and distinguishes them from single-chain analysis in risk reports.

## Platform Integration

Within the Prismatic ecosystem, Crystal Blockchain provides visual investigation capabilities and independent risk assessment for the cryptocurrency compliance pipeline. Crystal data is used alongside [Chainalysis](@/osint/chainalysis.md) as the primary provider and [Elliptic](@/osint/elliptic.md) as a secondary provider, with Crystal serving as a third independent validation source for critical screening decisions.

The triple-provider consensus mechanism requires agreement from at least two of three providers before risk classifications are assigned, reducing false positive rates while maintaining high detection sensitivity for genuine risks.

The [Prismatic Perimeter](@/apps/prismatic-perimeter.md) security rating engine incorporates Crystal risk data as part of the cryptocurrency compliance factor in organizational security ratings.

## NABLA Compliance

**Signal Plurality**: Crystal is explicitly designed as one of three independent blockchain analytics providers in the Prismatic pipeline. No cryptocurrency risk decision is based on Crystal data alone.

**Contradiction Preservation**: When Crystal's risk assessment disagrees with Chainalysis or Elliptic, all three assessments are preserved with their respective confidence levels and category breakdowns. Contradictions trigger manual review.

**Time Decay**: Crystal risk scores include temporal metadata. Addresses with recent activity receive higher confidence scores than dormant addresses, and risk assessments are recalculated when new transaction activity is detected.

**Provenance Mandatory**: All Crystal data includes API response timestamps, risk score version, attribution confidence levels, and cluster identifiers. Visual evidence exports include analysis parameters and data snapshot timestamps.

**Source Independence**: Crystal is treated as fully independent from Chainalysis and Elliptic, with its own proprietary clustering algorithms, attribution database, and risk scoring model.

## Performance and Rate Limits

| Product | Access | Features | Response Time |
|---------|--------|----------|---------------|
| **Crystal Expert** | Enterprise | Full investigation, graph explorer | Interactive |
| **Crystal Compliance** | Enterprise | Automated screening, monitoring | < 1s API |
| **Crystal API** | Enterprise | Programmatic risk scoring | < 500ms |
| **Crystal Reports** | Per-report | Individual entity reports | Generated |

### Authentication

API key required for all programmatic access. Enterprise contracts with tiered access levels based on query volume and feature requirements. The Prismatic adapter implements response caching with 5-minute TTL for risk scores and circuit breaker patterns for API reliability.

## Related Resources

- [Chainalysis](@/osint/chainalysis.md) - Enterprise blockchain analytics leader
- [Elliptic](@/osint/elliptic.md) - Crypto compliance with holistic screening
- [Blockchain.com](@/osint/blockchain-com.md) - Bitcoin blockchain raw data
- [Etherscan](@/osint/etherscan.md) - Ethereum blockchain explorer
- [OFAC](@/osint/ofac.md) - US sanctions including cryptocurrency addresses
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Cryptocurrency risk in security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)