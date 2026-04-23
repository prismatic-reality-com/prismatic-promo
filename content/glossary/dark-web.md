+++
title = "Dark Web"
weight = 50

[extra]
description = "Encrypted overlay networks accessible only through specialized software like Tor, hosting hidden services that require dedicated OSINT tradecraft for intelligence collection and threat monitoring."
category = "osint"
domain = "threat-intelligence"
complexity = "advanced"
stability = "evolving"
beam_related = true
related_terms = ["tor", "onion-routing", "threat-intelligence", "osint", "deep-web", "threat-hunting", "intelligence-fusion", "data-breach", "indicator-of-compromise", "dark-web-monitor", "pubsub", "genserver", "ets"]
tags = ["glossary", "osint", "dark-web", "threat-intelligence", "tor", "hidden-services", "cybersecurity"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "25 min"
difficulty = "advanced"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Dark web monitoring is essential for proactive threat intelligence, enabling organizations to detect compromised credentials, leaked data, and emerging threats before they impact production systems."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Dark Web", "Tor", "OSINT", "hidden services", "threat intelligence", "dark web monitoring", "onion routing", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Dark Web - Prismatic Platform"
word_count = 3500
see_also = ["osint", "capabilities", "architecture"]
+++

## Definition

The dark web refers to encrypted overlay networks that exist on top of the public internet but require specialized software, configurations, or authorization to access. The most well-known dark web network is Tor (The Onion Router), which routes traffic through multiple relay nodes with layered encryption, providing anonymity for both users and service operators. Unlike the surface web (indexed by search engines) or the deep web (unindexed but accessible via standard browsers), dark web content is intentionally hidden and accessible only through protocol-specific clients.

Dark web services use `.onion` addresses (Tor) or `.i2p` addresses (I2P) that resolve only within their respective overlay networks. These hidden services do not reveal their IP addresses, making attribution and takedown efforts significantly more difficult than for surface web infrastructure. This property makes the dark web a critical domain for OSINT practitioners who must monitor for organizational threats including credential leaks, data breaches, ransomware negotiations, and emerging attack tooling.

For intelligence platforms, the dark web represents both a collection challenge and a high-value intelligence source. The ephemeral nature of dark web services (average uptime measured in weeks to months), the absence of conventional indexing, and the operational security requirements for collection make automated, resilient monitoring systems essential. The Prismatic Platform integrates dark web monitoring through its OSINT tool registry, enabling structured collection, analysis, and alerting workflows.

The distinction between the surface web, deep web, and dark web is fundamental to understanding collection requirements:

| Layer | Accessibility | Indexing | Size Estimate | OSINT Relevance |
|-------|--------------|----------|---------------|-----------------|
| **Surface Web** | Standard browsers, no authentication | Fully indexed by search engines | ~5% of total web | Baseline intelligence, public records |
| **Deep Web** | Standard browsers, authentication required | Not indexed (databases, intranets, paywalls) | ~90% of total web | Account data, proprietary databases |
| **Dark Web** | Specialized software (Tor, I2P) | Not indexed by conventional engines | ~5% of total web | Threat intelligence, leaked data, adversary comms |

## Core Concepts

| Concept | Description | Intelligence Value |
|---------|-------------|-------------------|
| **Onion Routing** | Multi-layer encryption through relay nodes providing sender/receiver anonymity | Understanding routing enables traffic analysis and de-anonymization research |
| **Hidden Services** | Services accessible only within the overlay network via .onion/.i2p addresses | Primary targets for dark web OSINT collection |
| **Rendezvous Protocol** | Both client and server build circuits to a shared meeting point | Protocol analysis enables service fingerprinting |
| **Entry Guard** | First hop in Tor circuit, knows client IP but not destination | Guard node analysis can reveal access patterns |
| **Exit Node** | Final hop to clearnet (not used for hidden services) | Exit node monitoring for data exfiltration |
| **Credential Markets** | Marketplaces trading stolen credentials, databases, and access | Early warning for organizational compromise |
| **Paste Sites** | Anonymous text sharing services often hosting leaked data | Rapid indicator extraction for threat detection |
| **Underground Forums** | Discussion boards for threat actors, tool sharing, and collaboration | Adversary TTP (Tactics, Techniques, Procedures) intelligence |
| **Ransomware Leak Sites** | Extortion sites where ransomware groups publish stolen data | Victim identification and impact assessment |
| **Dark Web Crawlers** | Automated systems that index dark web content for searchability | Foundation for dark web monitoring platforms |
| **Operational Security (OPSEC)** | Practices preventing attribution of collection activities | Mandatory for sustainable dark web monitoring |
| **Time Decay** | Intelligence value diminishes rapidly for ephemeral dark web content | Prioritization framework for collection and analysis |

### Network Architecture

| Component | Function | OSINT Relevance | Collection Challenge |
|-----------|----------|-----------------|---------------------|
| **Entry Guard** | First hop, knows client IP | Guard node analysis can reveal access patterns | Guard rotation periods, limited guard sets |
| **Middle Relay** | Intermediate hop | Traffic correlation resistance | No direct intelligence value |
| **Exit Node** | Final hop to clearnet | Exit node monitoring for data exfiltration | Only relevant for clearnet-bound traffic |
| **Hidden Service** | .onion endpoint | Primary target for dark web OSINT collection | Ephemeral, requires discovery mechanisms |
| **Rendezvous Point** | Meeting node for hidden service connections | Protocol analysis for service fingerprinting | Transient, different per connection |
| **Directory Authority** | Consensus mechanism for relay information | Network topology intelligence | Publicly available, well-monitored |
| **Bridge Relay** | Unlisted entry point for censorship circumvention | Adversary infrastructure identification | Intentionally hidden from public listing |

### Threat Categories Monitored

| Category | Description | Detection Method | Urgency |
|----------|-------------|-----------------|---------|
| **Credential Leak** | Stolen usernames, passwords, API keys, tokens | Keyword monitoring, regex matching | Critical -- immediate action required |
| **Data Breach** | Bulk organizational data (databases, documents, PII) | Organization name monitoring, domain matching | Critical -- containment and notification |
| **Ransomware Leak** | Data published by ransomware groups as extortion leverage | Leak site monitoring, victim name matching | High -- impact assessment required |
| **Threat Actor TTPs** | Forum discussions about techniques, tools, and procedures | Topic monitoring, adversary tracking | Medium -- defensive posture updates |
| **Exploit Trading** | Zero-day and N-day exploit sales and advertisements | Vulnerability keyword monitoring | High -- patching prioritization |
| **Infrastructure Sales** | Compromised server access, botnet rental, proxy services | Infrastructure keyword monitoring | Medium -- network defense updates |
| **Insider Threat** | Employees offering internal access or data | Organization-specific monitoring | Critical -- HR and legal escalation |

## Technical Deep Dive

### Tor Network Architecture

The Tor network implements onion routing through a three-hop circuit: the entry guard (knows the client but not the destination), the middle relay (knows neither), and the exit node (knows the destination but not the client). Hidden services add a rendezvous protocol where both client and server build circuits to a shared rendezvous point, meaning neither party reveals their network location.

The hidden service protocol involves six steps: the service generates a long-term key pair, selects introduction points, publishes a service descriptor to the distributed hash table, the client retrieves the descriptor, both parties build circuits to a rendezvous point, and the connection is established through layered encryption. This protocol provides mutual anonymity but introduces latency (typically 2-10 seconds for initial connection) and reliability challenges (circuit failures require full re-establishment).

### Collection Architecture

Dark web intelligence collection requires a layered architecture that handles discovery, access, collection, normalization, and analysis:

| Layer | Function | Technology | Platform Integration |
|-------|----------|-----------|---------------------|
| **Discovery** | Finding new hidden services and content sources | Crawlers, DHT scanning, forum scraping | OSINT tool registry auto-discovery |
| **Access** | Maintaining reliable connectivity to dark web networks | Tor client pools, circuit management, retry logic | Isolated collection environment |
| **Collection** | Extracting content from discovered sources | HTML parsing, API integration, screenshot capture | OSINT adapter framework |
| **Normalization** | Converting raw content to structured intelligence | NLP, regex extraction, entity recognition | PrismaticOsintCore processing pipeline |
| **Analysis** | Evaluating relevance and assessing threat level | Scoring models, pattern matching, analyst review | Ensemble scoring engine |
| **Alerting** | Notifying relevant stakeholders of findings | PubSub, email, webhook, dashboard updates | Real-time LiveView dashboards |

### Operational Security Requirements

| Requirement | Implementation | Consequence of Violation |
|-------------|---------------|------------------------|
| **Network Isolation** | Dedicated collection infrastructure separate from production | Attribution of collection activities to organization |
| **Identity Separation** | Unique personas per source, no cross-contamination | Compromise of one identity exposes all collection |
| **Rate Limiting** | Throttled requests mimicking human browsing patterns | Detection and blocking by service operators |
| **Session Rotation** | Regular Tor circuit rotation and credential cycling | Pattern-based identification of automated collection |
| **Data Sanitization** | Strip metadata from collected artifacts before analysis | Leaked operational details in stored intelligence |
| **Access Logging** | Immutable audit trail of all collection activities | Compliance violations, legal liability |

## Usage in Prismatic Platform

The Prismatic Platform integrates dark web monitoring through its OSINT tool registry, providing automated collection and analysis of dark web intelligence sources. The platform's 157 self-registering OSINT tools include adapters for dark web data aggregation services that index Tor hidden services, paste sites, and underground forums.

### Integration Architecture

The platform does not connect directly to Tor hidden services from production infrastructure. Instead, it integrates with dark web aggregation APIs that maintain their own collection infrastructure. These aggregation services crawl dark web sources, normalize the data, and expose it through REST APIs that the platform's OSINT adapters consume safely from standard network environments.

| Integration Point | Service Type | Data Provided | Update Frequency |
|-------------------|-------------|---------------|-----------------|
| **Credential Monitoring** | Aggregation API | Leaked credentials matching monitored domains | Near real-time |
| **Paste Monitoring** | Aggregation API | Paste site content matching keywords/domains | Minutes |
| **Forum Monitoring** | Aggregation API | Forum posts matching adversary tracking queries | Hours |
| **Leak Site Monitoring** | Aggregation API | Ransomware leak site victim listings | Hours |
| **Market Monitoring** | Aggregation API | Marketplace listings for organizational data | Daily |

### Alert Pipeline

Dark web findings flow through a multi-stage alert pipeline: raw findings are collected by OSINT adapters, scored by the relevance engine, deduplicated against known findings, and dispatched to appropriate channels based on severity and category.

## Code Examples

```elixir
defmodule PrismaticOsintCore.Tools.DarkWebMonitor do
  @moduledoc """
  Dark web monitoring adapter for the Prismatic OSINT tool registry.
  Queries aggregation services for mentions of specified domains,
  email addresses, and organizational identifiers.

  This adapter does not connect to Tor directly -- it integrates with
  dark web aggregation APIs that maintain their own collection
  infrastructure, ensuring production network isolation.
  """

  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "dark-web-monitor",
    name: "Dark Web Monitor",
    category: :global,
    api_style: :provider,
    input_fields: [
      %{name: :query, type: :text, label: "Search Query (domain, email, keyword)", required: true},
      %{name: :time_range, type: :select, label: "Time Range",
        options: ["24h", "7d", "30d", "90d"], required: false},
      %{name: :categories, type: :multi_select, label: "Categories",
        options: ["credentials", "paste", "forum", "leak_site", "market"], required: false}
    ],
    requires_auth: true,
    description: "Monitor dark web sources for organizational threats"
  })
end
```

```elixir
defmodule Prismatic.DarkWeb.AlertEngine do
  @moduledoc """
  Processes dark web intelligence findings and generates
  prioritized alerts based on organizational relevance scoring.
  Implements time decay on findings and deduplication against
  previously seen indicators.

  Subscribes to the "osint:dark_web" PubSub topic and publishes
  high-relevance findings to "alerts:security" for dashboard
  display and notification dispatch.
  """

  use GenServer

  require Logger

  @type finding :: %{
    source: String.t(),
    content: String.t(),
    timestamp: DateTime.t(),
    relevance_score: float(),
    category: :credential_leak | :data_breach | :threat_actor | :vulnerability | :ransomware | :insider_threat,
    indicators: list(String.t()),
    source_reliability: float()
  }

  @type alert :: %{
    finding: finding(),
    priority: :critical | :high | :medium | :low,
    timestamp: DateTime.t(),
    deduplicated: boolean()
  }

  @type state :: %{
    domains: list(String.t()),
    findings: list(finding()),
    alert_count: non_neg_integer(),
    seen_indicators: MapSet.t(),
    last_cleanup: DateTime.t()
  }

  @alert_threshold 0.7
  @max_findings 10_000
  @cleanup_interval_ms 300_000

  @doc """
  Starts the dark web alert engine with a list of monitored domains.

  ## Examples

      iex> {:ok, pid} = Prismatic.DarkWeb.AlertEngine.start_link(domains: ["example.com"])
      iex> is_pid(pid)
      true

  """
  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Returns the current alert statistics including total findings
  processed, alerts generated, and unique indicators seen.
  """
  @spec stats() :: map()
  def stats do
    GenServer.call(__MODULE__, :stats)
  end

  @impl GenServer
  def init(opts) do
    monitored_domains = Keyword.fetch!(opts, :domains)
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "osint:dark_web")
    schedule_cleanup()

    Logger.info("Dark web alert engine started",
      domain_count: length(monitored_domains)
    )

    {:ok, %{
      domains: monitored_domains,
      findings: [],
      alert_count: 0,
      seen_indicators: MapSet.new(),
      last_cleanup: DateTime.utc_now()
    }}
  end

  @impl GenServer
  def handle_call(:stats, _from, state) do
    stats = %{
      monitored_domains: length(state.domains),
      total_findings: length(state.findings),
      total_alerts: state.alert_count,
      unique_indicators: MapSet.size(state.seen_indicators)
    }

    {:reply, stats, state}
  end

  @impl GenServer
  def handle_info({:dark_web_finding, finding}, state) do
    relevance = calculate_relevance(finding, state.domains)
    deduplicated = any_indicator_seen?(finding.indicators, state.seen_indicators)

    enriched_finding = %{finding | relevance_score: relevance}

    state =
      if relevance > @alert_threshold and not deduplicated do
        priority = categorize_priority(finding.category, relevance)

        alert = %{
          finding: enriched_finding,
          priority: priority,
          timestamp: DateTime.utc_now(),
          deduplicated: false
        }

        Phoenix.PubSub.broadcast(
          Prismatic.PubSub,
          "alerts:security",
          {:dark_web_alert, alert}
        )

        Logger.warning("Dark web alert generated",
          category: finding.category,
          priority: priority,
          relevance: relevance
        )

        %{state |
          alert_count: state.alert_count + 1,
          seen_indicators: add_indicators(state.seen_indicators, finding.indicators)
        }
      else
        state
      end

    findings = [enriched_finding | Enum.take(state.findings, @max_findings - 1)]
    {:noreply, %{state | findings: findings}}
  end

  @impl GenServer
  def handle_info(:cleanup, state) do
    now = DateTime.utc_now()
    cutoff = DateTime.add(now, -86_400, :second)

    fresh_findings = Enum.filter(state.findings, fn f ->
      DateTime.compare(f.timestamp, cutoff) == :gt
    end)

    Logger.info("Dark web alert engine cleanup",
      removed: length(state.findings) - length(fresh_findings),
      remaining: length(fresh_findings)
    )

    schedule_cleanup()
    {:noreply, %{state | findings: fresh_findings, last_cleanup: now}}
  end

  @spec calculate_relevance(finding(), list(String.t())) :: float()
  defp calculate_relevance(finding, domains) do
    domain_score = Enum.count(domains, &String.contains?(finding.content, &1))
    domain_ratio = domain_score / max(length(domains), 1)

    category_weight = case finding.category do
      :credential_leak -> 1.0
      :insider_threat -> 1.0
      :data_breach -> 0.9
      :ransomware -> 0.85
      :vulnerability -> 0.7
      :threat_actor -> 0.6
    end

    time_decay = calculate_time_decay(finding.timestamp)
    source_weight = finding.source_reliability

    (domain_ratio * 0.4 + category_weight * 0.3 + source_weight * 0.2 + time_decay * 0.1)
    |> min(1.0)
    |> max(0.0)
  end

  @spec calculate_time_decay(DateTime.t()) :: float()
  defp calculate_time_decay(timestamp) do
    age_hours = DateTime.diff(DateTime.utc_now(), timestamp, :second) / 3600.0
    max(1.0 - age_hours / 168.0, 0.0)
  end

  @spec categorize_priority(atom(), float()) :: :critical | :high | :medium | :low
  defp categorize_priority(category, relevance) do
    cond do
      category in [:credential_leak, :insider_threat] and relevance > 0.8 -> :critical
      category in [:data_breach, :ransomware] and relevance > 0.7 -> :high
      relevance > 0.8 -> :high
      relevance > 0.6 -> :medium
      true -> :low
    end
  end

  @spec any_indicator_seen?(list(String.t()), MapSet.t()) :: boolean()
  defp any_indicator_seen?(indicators, seen) do
    Enum.any?(indicators, &MapSet.member?(seen, &1))
  end

  @spec add_indicators(MapSet.t(), list(String.t())) :: MapSet.t()
  defp add_indicators(seen, indicators) do
    Enum.reduce(indicators, seen, &MapSet.put(&2, &1))
  end

  @spec schedule_cleanup() :: reference()
  defp schedule_cleanup do
    Process.send_after(self(), :cleanup, @cleanup_interval_ms)
  end
end
```

```elixir
defmodule Prismatic.DarkWeb.IndicatorExtractor do
  @moduledoc """
  Extracts structured indicators of compromise (IOCs) from raw
  dark web findings. Supports extraction of email addresses, domains,
  IP addresses, hashes, and cryptocurrency wallet addresses.

  Each extracted indicator is tagged with its type, confidence level,
  and source context for downstream correlation and alerting.
  """

  @type indicator_type :: :email | :domain | :ipv4 | :hash_md5 | :hash_sha256 | :crypto_wallet | :url
  @type indicator :: %{
    type: indicator_type(),
    value: String.t(),
    confidence: float(),
    context: String.t()
  }

  @doc """
  Extracts all recognized indicator types from raw text content.
  Returns a deduplicated list of indicators with confidence scores.

  ## Examples

      iex> text = "leaked: admin@example.com password123"
      iex> indicators = Prismatic.DarkWeb.IndicatorExtractor.extract(text)
      iex> Enum.any?(indicators, & &1.type == :email)
      true

  """
  @spec extract(String.t()) :: list(indicator())
  def extract(text) when is_binary(text) do
    [
      extract_emails(text),
      extract_domains(text),
      extract_ipv4(text),
      extract_hashes(text)
    ]
    |> List.flatten()
    |> Enum.uniq_by(& &1.value)
  end

  @spec extract_emails(String.t()) :: list(indicator())
  defp extract_emails(text) do
    ~r/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    |> Regex.scan(text)
    |> List.flatten()
    |> Enum.map(fn email ->
      %{type: :email, value: email, confidence: 0.9, context: "email_pattern"}
    end)
  end

  @spec extract_domains(String.t()) :: list(indicator())
  defp extract_domains(text) do
    ~r/\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/
    |> Regex.scan(text)
    |> List.flatten()
    |> Enum.reject(&String.contains?(&1, "@"))
    |> Enum.map(fn domain ->
      %{type: :domain, value: domain, confidence: 0.7, context: "domain_pattern"}
    end)
  end

  @spec extract_ipv4(String.t()) :: list(indicator())
  defp extract_ipv4(text) do
    ~r/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
    |> Regex.scan(text)
    |> List.flatten()
    |> Enum.map(fn ip ->
      %{type: :ipv4, value: ip, confidence: 0.8, context: "ipv4_pattern"}
    end)
  end

  @spec extract_hashes(String.t()) :: list(indicator())
  defp extract_hashes(text) do
    md5 = ~r/\b[a-fA-F0-9]{32}\b/
    sha256 = ~r/\b[a-fA-F0-9]{64}\b/

    md5_matches = Regex.scan(md5, text) |> List.flatten() |> Enum.map(fn h ->
      %{type: :hash_md5, value: h, confidence: 0.6, context: "md5_pattern"}
    end)

    sha256_matches = Regex.scan(sha256, text) |> List.flatten() |> Enum.map(fn h ->
      %{type: :hash_sha256, value: h, confidence: 0.8, context: "sha256_pattern"}
    end)

    md5_matches ++ sha256_matches
  end
end
```

## Common Pitfalls

| Pitfall | Description | Consequence | Prevention |
|---------|-------------|-------------|------------|
| **Direct Tor Access from Production** | Connecting to .onion services from production infrastructure | Attribution of collection to organization, network compromise | Use aggregation APIs, isolated collection environments |
| **Ignoring Time Decay** | Treating stale dark web findings as equally relevant to fresh ones | Resource waste on expired threats, false prioritization | Implement time-decay scoring, auto-expire old findings |
| **Single-Source Reliance** | Depending on one aggregation API for all dark web intelligence | Blind spots when that source has coverage gaps | Multi-source collection with cross-reference validation |
| **Over-Alerting** | Generating alerts for every dark web mention regardless of relevance | Alert fatigue, critical findings lost in noise | Relevance scoring with configurable thresholds |
| **Missing Deduplication** | Alerting on the same finding multiple times across sources | Wasted analyst time, inflated threat metrics | Indicator-based deduplication with seen-set tracking |
| **Credential Validation** | Attempting to validate leaked credentials against production systems | Legal liability, audit violations, potential lockouts | Never validate -- treat all leaked credentials as compromised |
| **OPSEC Violations** | Using organizational email/credentials for dark web research | Exposure of intelligence requirements to adversaries | Dedicated personas, isolated infrastructure |
| **Ignoring Context** | Extracting indicators without source context | Inability to assess reliability or prioritize response | Always store source metadata with extracted indicators |
| **Unbounded Collection** | Collecting all dark web content without scope limits | Storage bloat, processing bottlenecks, legal risk | Define collection scope, implement data retention policies |
| **Missing Legal Review** | Operating dark web monitoring without legal counsel review | Compliance violations in certain jurisdictions | Legal review of monitoring scope and data handling |

## Best Practices

1. **Never access dark web services directly from production infrastructure** -- use isolated collection environments with dedicated network paths to prevent attribution. The Prismatic Platform integrates with aggregation APIs exclusively.

2. **Implement multi-layer relevance scoring** -- combine domain matching, category weighting, source reliability, and time decay into a composite relevance score. Only alert on findings exceeding a configurable threshold.

3. **Deduplicate findings at the indicator level** -- track seen indicators (emails, domains, hashes) in a persistent set and suppress duplicate alerts. New context for known indicators may warrant re-alerting at reduced priority.

4. **Apply time decay aggressively** -- dark web intelligence has a half-life measured in hours to days. Findings older than 7 days should carry significantly reduced relevance scores, and findings older than 90 days should be archived.

5. **Cross-reference findings with surface web intelligence** -- dark web intelligence gains value when correlated with other OSINT sources through the platform's interconnection engine. A credential leak correlated with a known breach is higher confidence than an isolated finding.

6. **Implement rate limiting and session rotation** -- dark web services and aggregation APIs actively detect and block automated crawlers. Respect rate limits and rotate sessions to maintain sustainable collection.

7. **Validate and sanitize all collected data** -- dark web content frequently contains malicious payloads, deceptive information, and planted disinformation. Never execute downloaded content; treat all findings as potentially adversary-crafted.

8. **Maintain operational security (OPSEC)** -- collection activities should not reveal organizational identity or intelligence requirements. Use dedicated personas, isolated infrastructure, and compartmented access.

9. **Categorize findings by response urgency** -- credential leaks and insider threats require immediate response; threat actor TTP intelligence can be processed during regular analysis cycles. Match alerting cadence to category urgency.

10. **Implement comprehensive audit logging** -- all dark web monitoring activities must be logged in an immutable audit trail for compliance, legal review, and operational accountability. Log what was collected, when, from where, and by whom.

## Related Terms

- [OSINT](@/glossary/osint.md) -- Open source intelligence methodology encompassing dark web collection
- [Threat Intelligence](@/glossary/threat-intelligence.md) -- Strategic and tactical intelligence derived from dark web monitoring
- [Data Breach](@/glossary/data-breach.md) -- Unauthorized data exposure often traded on dark web marketplaces
- [IOC](@/glossary/ioc.md) -- Indicators of compromise discovered through dark web monitoring
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) -- Combining dark web findings with other intelligence sources
- [Tor](/glossary/tor/) -- The Onion Router network providing dark web infrastructure
- [Deep Web](/glossary/deep-web/) -- Unindexed web content distinct from encrypted dark web
- [Threat Hunting](/glossary/threat-hunting/) -- Proactive threat detection incorporating dark web intelligence
- [PubSub](@/glossary/pubsub.md) -- Event system for real-time dark web alert distribution
- [GenServer](@/glossary/genserver.md) -- Process model for alert engine and monitoring services
- [ETS](@/glossary/ets.md) -- In-memory storage for indicator deduplication sets
- [Ensemble](@/glossary/ensemble.md) -- Multi-source scoring methods applied to dark web findings

## See Also

- [OSINT Tools](@/osint/_index.md) -- Platform OSINT tool registry including dark web adapters
- [Capabilities](@/capabilities/_index.md) -- Intelligence collection capabilities overview
- [Architecture](@/architecture/_index.md) -- Platform architecture supporting real-time intelligence
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Security](/security/) -- Security architecture and operations

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
