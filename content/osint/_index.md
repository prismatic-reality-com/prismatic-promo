+++
title = "OSINT Sources"
description = "Comprehensive catalog of 127 self-registering Open Source Intelligence providers spanning Czech registries, global infrastructure reconnaissance, threat intelligence feeds, social graph analysis, email verification, domain enumeration, and financial sanctions screening -- all unified through the revolutionary Self-Registering Tool System with automatic UI generation."
sort_by = "weight"
template = "osint/list.html"
page_template = "osint/detail.html"

[extra]
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
word_count = 2800
difficulty = "intermediate"
image = "/images/sections/osint.png"
image_alt = "Prismatic Platform OSINT intelligence sources architecture"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "whitepaper"
content_version = "2.0.0"
last_enhanced = "2026-02-06"
quality_score = 95
related_articles = ["prismatic-osint-core", "prismatic-osint-sources"]
glossary_terms = ["OSINT", "HUMINT", "adapter", "rate-limiting", "NABLA"]
keywords = ["open source intelligence providers", "OSINT data sources catalog", "threat intelligence feeds", "Czech registry OSINT", "domain intelligence gathering", "email intelligence verification", "OSINT adapter architecture", "intelligence source integration"]
tags = ["osint", "intelligence", "security", "reconnaissance", "data-sources"]
see_also = ["agents", "capabilities", "architecture"]
total_sources = 127
categories_count = 7
date_modified = "2026-02-23"
+++

## Abstract

The Prismatic Platform integrates 127 self-registering Open Source Intelligence ([OSINT](@/glossary/osint.md)) providers through a revolutionary metaprogramming architecture where each tool automatically registers its own UI, API endpoints, and execution logic via compile-time hooks. Organized across seven distinct intelligence categories -- Czech Registries, Global Infrastructure, [Threat Intelligence](@/glossary/threat-intelligence.md), Social Intelligence, Email Intelligence, Domain Intelligence, and Financial Intelligence -- these sources provide investigators, compliance officers, and [security analysts](@/glossary/security-analyst.md) with comprehensive situational awareness from a single programmatic interface.

Each source is implemented as a standardized [adapter](@/glossary/adapter-pattern.md) conforming to the `PrismaticOsintCore.Behaviours.Source` [behaviour](@/glossary/behaviour-pattern.md), ensuring consistent [error handling](@/glossary/error-handling.md), [rate limiting](@/glossary/rate-limiting.md), [health monitoring](@/glossary/health-monitoring.md), and [telemetry](@/glossary/telemetry.md) across all providers. Intelligence findings from disparate sources are normalized into typed `Finding` structs with [confidence scores](@/glossary/confidence-scoring.md) ranging from 0.0 to 1.0, enabling downstream epistemic analysis through the [NABLA Infinity](@/glossary/nabla-infinity.md) framework and its [Trinity Gate](@/glossary/trinity-gate.md) verification pipeline.

This document presents the technical [architecture](@/glossary/software-architecture.md), catalogues all seven intelligence categories with their constituent sources, describes the [rate limiting](@/glossary/rate-limiting.md) and [credential management](@/glossary/credential-management.md) infrastructure, and outlines the epistemic verification framework that transforms raw [OSINT](@/glossary/osint.md) data into evidence-grade intelligence suitable for [due diligence](@/glossary/due-diligence.md), [threat assessment](@/glossary/threat-assessment.md), and regulatory [compliance](@/glossary/compliance-framework.md) workflows.

## Introduction

Open Source Intelligence gathering has evolved from manual web searches and database queries into a sophisticated discipline requiring automated collection, normalization, cross-referencing, and epistemic evaluation of data from hundreds of heterogeneous sources. Modern OSINT operations face several fundamental challenges: source APIs differ wildly in authentication mechanisms, response formats, rate limits, and data models; individual sources provide partial views that must be correlated to form actionable intelligence; and the reliability of information varies dramatically across providers, necessitating rigorous confidence assessment.

The Prismatic Platform addresses these challenges through a revolutionary **Self-Registering Tool System** built on Elixir metaprogramming, where each of the 127 intelligence tools automatically registers its own metadata, UI components, API endpoints, and execution logic at compile time. This eliminates hardcoded tool lists and enables true plug-and-play intelligence architecture where new sources integrate seamlessly without manual configuration.

### Legal and Ethical Framework

All intelligence gathering conducted through the Prismatic Platform operates exclusively within the bounds of publicly available information. The platform does not perform unauthorized access, credential stuffing, social engineering, or any form of active intrusion. Sources are limited to:

- **Public registries** maintained by government agencies for the purpose of transparency
- **Open APIs** provided by commercial intelligence vendors under their terms of service
- **Publicly accessible records** such as WHOIS data, DNS records, and certificate transparency logs
- **Voluntarily published information** on social media platforms and professional networks
- **Regulatory filings** required by law to be publicly accessible

The platform enforces [GDPR](@/glossary/gdpr.md) [compliance](@/glossary/compliance-framework.md) at the infrastructure level, with [data minimization](@/glossary/data-minimization.md) principles applied to all collection operations, configurable retention policies, and full [audit trails](@/glossary/audit-logging.md) documenting the [provenance](@/glossary/data-provenance.md) of every finding.

## Self-Registering Tool System

The revolutionary architecture powering Prismatic's 127 OSINT sources eliminates traditional hardcoded tool catalogs through a sophisticated metaprogramming system where each intelligence adapter becomes completely self-contained and automatically registers all necessary metadata at compile time.

### Metaprogramming Architecture

Each OSINT adapter uses the `PrismaticOsintCore.Tool` [behaviour](@/glossary/behaviour-pattern.md) with a simple `register_tool/1` macro that captures comprehensive tool metadata:

```elixir
defmodule MyOSINTAdapter do
  use PrismaticOsintCore.Tool

  register_tool(%{
    slug: "my-intelligence-source",
    name: "My Intelligence Source",
    description: "Custom OSINT provider",
    category: :global,
    api_style: :provider,
    input_fields: [
      %{name: :query, type: :text, label: "Search Query", required: true},
      %{name: :limit, type: :number, label: "Max Results", required: false}
    ],
    requires_auth: true,
    auth_env_var: "MY_API_KEY",
    tags: ["custom", "intelligence"]
  })

  # Standard Source/Provider behaviour implementation
  def init(opts), do: {:ok, %{api_key: opts[:api_key]}}
  def run(query, state), do: perform_intelligence_gathering(query, state)
end
```

### Compile-Time Registration

The system leverages Elixir's `@after_compile` hooks combined with `:beam_lib.chunks/2` introspection to extract tool configurations from compiled bytecode and automatically register them in a high-performance [ETS](@/glossary/ets.md) registry during application startup.

This approach provides **sub-millisecond tool lookup** while ensuring **zero runtime overhead** for the registration system itself—all metaprogramming costs are paid at compile time, not during intelligence operations.

### Automatic UI Generation

Every registered tool automatically gains a fully functional [LiveView](@/glossary/phoenix-liveview.md) interface at `/osint/tools/{slug}` with:

- **Dynamic Forms**: Input fields generated from the tool's `input_fields` configuration
- **Real-time Execution**: [PubSub](@/glossary/phoenix-pubsub.md) streaming of execution progress
- **Run History**: PostgreSQL-backed audit trail of all tool executions
- **Result Visualization**: Structured display of intelligence findings with confidence scores

### REST API Auto-Exposure

All registered tools are automatically exposed through the [PrismaticAPI](@/glossary/prismatic-api.md) gateway at `/api/v1/osint/*` endpoints, with full [OpenAPI 3.0](@/glossary/openapi.md) documentation generated from the tool configurations and Elixir typespecs.

### Dual-Layer Storage

The system maintains two complementary storage layers:

- **ETS Hot Path**: Sub-millisecond tool metadata access for UI rendering and API dispatch
- **PostgreSQL Persistence**: Complete audit trail of all tool executions with full result history

This architecture provides the performance characteristics of an in-memory database with the durability guarantees required for [compliance](@/glossary/compliance-framework.md) and forensic analysis.

## Source Architecture

The Prismatic OSINT architecture is organized into two complementary OTP applications: `prismatic_osint_core`, which defines the foundational behaviours, schemas, and infrastructure services; and `prismatic_osint_sources`, which provides the concrete adapter implementations for each intelligence provider.

### The Adapter Pattern

Every [OSINT](@/glossary/osint.md) source in the Prismatic Platform implements one of two core [behaviours](@/glossary/behaviour-pattern.md). The `Source` [behaviour](@/glossary/behaviour-pattern.md) provides a query-oriented interface suitable for search-and-retrieve operations, while the `Provider` [behaviour](@/glossary/behaviour-pattern.md) supports stateful investigation workflows where findings are accumulated over the course of an orchestrated inquiry.

The `Source` behaviour defines four mandatory callbacks:

```elixir
defmodule PrismaticOsintCore.Behaviours.Source do
  @callback search(query(), options()) ::
    {:ok, [search_result()]} | {:error, error_reason()}

  @callback get_details(source_id(), options()) ::
    {:ok, details()} | {:error, error_reason()}

  @callback health_check() :: :ok | {:error, error_reason()}

  @callback rate_limit_info() :: RateLimitStatus.t()
end
```

A concrete adapter implementation follows this pattern:

```elixir
defmodule PrismaticOsintSources.Adapters.Czech.Justice do
  @behaviour PrismaticOsintCore.Behaviours.Source

  @impl true
  def search(query, opts \\ []) do
    with :ok <- RateLimiter.check_rate_limit("justice_cz"),
         {:ok, raw} <- fetch_from_registry(query, opts) do
      {:ok, normalize_results(raw)}
    end
  end

  @impl true
  def get_details(ico, opts \\ []) do
    case fetch_company_detail(ico, opts) do
      {:ok, detail} -> {:ok, format_detail(detail)}
      {:error, :not_found} -> {:error, :not_found}
      {:error, reason} -> {:error, reason}
    end
  end

  @impl true
  def health_check do
    case HTTPClient.head("https://or.justice.cz/ias/ui/rejstrik") do
      {:ok, %{status: 200}} -> :ok
      _ -> {:error, :api_unavailable}
    end
  end

  @impl true
  def rate_limit_info do
    %RateLimitStatus{
      limit: 10,
      remaining: get_remaining_quota(),
      reset_at: next_window_reset(),
      current_usage: current_utilization()
    }
  end
end
```

### Response Normalization

All source [adapters](@/glossary/adapter-pattern.md) transform their provider-specific response formats into a standardized result structure containing the originating source identifier, a human-readable title, the raw data payload, a [confidence score](@/glossary/confidence-scoring.md), a UTC timestamp, and arbitrary [metadata](@/glossary/metadata-management.md). This normalization enables downstream consumers -- whether [LiveView](@/glossary/liveview.md) dashboards, investigation orchestrators, or epistemic evaluation pipelines -- to process results from any source without knowledge of the underlying provider.

```elixir
%{
  source: :justice_cz,
  source_id: "ico_24138819",
  title: "Upvest s.r.o. - Active Commercial Entity",
  url: "https://or.justice.cz/ias/ui/rejstrik-firma?ico=24138819",
  data: %{
    ico: "24138819",
    dic: "CZ24138819",
    legal_form: "s.r.o.",
    status: :active,
    registered: ~D[2012-03-15]
  },
  confidence: 0.98,
  timestamp: ~U[2026-02-06 10:30:00Z],
  metadata: %{registry: "commercial", court: "Praha"}
}
```

### The Provider Behaviour

For stateful investigation workflows where a source must be initialized with credentials and maintain internal state across multiple queries, the `Provider` behaviour offers a more comprehensive contract:

```elixir
defmodule PrismaticOsintCore.Behaviours.Provider do
  @callback init(opts :: keyword()) :: {:ok, state()} | {:error, term()}
  @callback run(subject(), state()) :: {:ok, findings()} | {:error, error_reason()}
  @callback name() :: atom()
end
```

Providers produce `Finding` structs -- typed intelligence artifacts with risk levels (`:low`, `:medium`, `:high`, `:critical`), categorization (`:identity`, `:legal`, `:financial`, `:reputation`, `:technical`, `:relationships`, `:activity`), and source type classification (`:registry`, `:news`, `:social`, `:tech_analysis`, `:court`, `:financial_records`). These findings carry their own confidence scores and provenance metadata, enabling full traceability from raw API response to final intelligence assessment.

## Intelligence Categories

The 121+ OSINT sources are organized into seven categories, each addressing a distinct intelligence domain. Within each category, adapters are further classified by geographic scope (Czech, EU, Global) and data access pattern (public API, web scraping, bulk data).

### Czech Registries

The Czech Republic maintains an unusually comprehensive network of public registries, making it one of the most transparent jurisdictions in the European Union for corporate due diligence. The Prismatic Platform provides deep integration with the following Czech government data sources:

| Source | Registry | Key Data |
|--------|----------|----------|
| **ARES** | Administrative Register of Economic Subjects | Company search, ICO/DIC lookup, business activities |
| **Justice.cz** | Commercial Register (Obchodni rejstrik) | Company filings, statutory bodies, ownership structure |
| **RZP** | Trade Licensing Register (Zivnostensky rejstrik) | Trade licenses, business permits, authorized activities |
| **ISIR** | Insolvency Register (Insolvencni rejstrik) | Insolvency proceedings, creditor claims, resolution status |
| **CEDR** | Central Register of Subsidies | Government grants, EU funding, subsidy recipients |
| **CUZK** | Czech Office for Surveying and Cadastre | Property ownership, land records, encumbrances |
| **CNB** | Czech National Bank Registry | Licensed financial entities, regulated institutions |
| **DPH** | VAT Payer Registry | VAT registration status, unreliable payer flags |
| **RES** | Statistical Business Register | Statistical classification, employee counts, NACE codes |
| **Hlidac Statu** | Watchdog State | Public procurement contracts, political donations |
| **Registr Smluv** | Contract Register | Public sector contracts above CZK 50,000 |
| **Datove Schranky** | Data Mailboxes | Official electronic communication addresses |
| **SZIF** | State Agricultural Intervention Fund | Agricultural subsidies and payments |
| **Nespolehlivy Platce** | Unreliable VAT Payer List | Tax fraud flagging, unreliable payer status |

The Czech adapter suite includes a `SmartRouter` that automatically selects the optimal combination of registries for a given query, and an `MLIntelligence` module that applies pattern recognition to detect anomalies across multiple registry responses.

### Global Infrastructure Intelligence

Infrastructure intelligence sources provide visibility into the technical attack surface of organizations, including their network assets, exposed services, and cryptographic posture.

| Source | Capability | Data Type |
|--------|-----------|-----------|
| **Shodan** | Internet-wide scanning | Exposed services, banners, vulnerabilities |
| **Censys** | Certificate and host search | TLS certificates, hosts, services |
| **GreyNoise** | Internet background noise | Benign scanners vs. targeted activity |
| **ONYPHE** | Cyber defense search engine | Geolocation, threat context, CVEs |
| **BinaryEdge** | Internet scanning platform | Open ports, services, vulnerabilities |
| **IPInfo** | IP address intelligence | Geolocation, ASN, company, privacy detection |
| **MaxMind** | GeoIP databases | IP geolocation, anonymizer detection |
| **RIPEstat** | Regional Internet Registry data | BGP routing, IP allocations, abuse contacts |
| **ViewDNS** | DNS intelligence | Reverse IP, DNS history, port scanning |
| **BuiltWith** | Technology profiling | Web technology stack identification |
| **crt.sh** | Certificate Transparency | SSL/TLS certificate issuance logs |
| **SSLMate** | Certificate monitoring | Certificate inventory, expiry tracking |
| **URLScan** | URL analysis | Website screenshots, DOM analysis, indicators |

These sources are particularly valuable for the Prismatic Perimeter EASM (External Attack Surface Management) module, where they feed into automated security rating calculations.

### Threat Intelligence

Threat intelligence sources aggregate indicators of compromise (IOCs), malware samples, phishing campaigns, and vulnerability disclosures from the global security research community.

| Source | Focus | Data Type |
|--------|-------|-----------|
| **VirusTotal** | Multi-engine malware analysis | File hashes, URL scanning, domain reputation |
| **AbuseIPDB** | IP abuse reporting | Abuse reports, confidence scores, categories |
| **PhishTank** | Phishing URL database | Verified phishing sites, submission tracking |
| **ThreatFox** | IOC sharing platform (abuse.ch) | Malware IOCs, botnet C2 infrastructure |
| **URLhaus** | Malware distribution URLs (abuse.ch) | Active malware URLs, payload hosting |
| **Spamhaus** | Spam and threat blocklists | IP/domain reputation, botnet tracking |
| **AlienVault OTX** | Open Threat Exchange | Pulses, IOCs, threat actor profiles |
| **Pulsedive** | Threat intelligence platform | Indicators, threats, feeds |
| **NVD** | National Vulnerability Database | CVE records, CVSS scores, CPE matching |
| **Exploit-DB** | Exploit archive | Public exploits, vulnerability proofs |
| **Malware Bazaar** | Malware sample sharing (abuse.ch) | Malware samples, YARA rules, tags |
| **Google Safe Browsing** | Web threat detection | Unsafe site warnings, social engineering |

Each threat intelligence adapter normalizes IOC data into the platform's finding schema, with risk levels automatically mapped from source-specific severity ratings (CVSS scores, abuse confidence percentages, community votes) to the platform's four-tier risk classification.

### Social Intelligence

Social intelligence sources enable investigation of individuals and organizations through their public digital footprint across professional networks, code repositories, and social media platforms.

| Source | Platform | Intelligence Type |
|--------|----------|-------------------|
| **LinkedIn Sales Navigator** | LinkedIn | Professional profiles, company data, connections |
| **GitHub OSINT** | GitHub | Code contributions, organizational membership, activity |
| **GitLab Code** | GitLab | Repository analysis, contribution patterns |
| **Social Searcher** | Multi-platform | Cross-platform social media monitoring |
| **FullContact** | Identity resolution | Person/company enrichment from email/domain |
| **ZoomInfo** | B2B intelligence | Company data, org charts, technographics |
| **Pipl** | People search | Identity resolution, digital footprint aggregation |
| **GDELT** | Global event database | News monitoring, event coding, sentiment analysis |
| **NewsAPI** | News aggregation | Real-time news from 150,000+ sources |

Social intelligence adapters implement additional privacy safeguards, including automatic PII redaction in logs and configurable data retention windows that default to 30 days.

### Email Intelligence

Email intelligence sources verify email addresses, detect breaches, assess sender reputation, and map organizational email infrastructure.

| Source | Capability | Output |
|--------|-----------|--------|
| **HaveIBeenPwned** | Breach detection | Breach history, paste appearances, password exposure |
| **Hunter.io** | Email finding and verification | Domain email patterns, deliverability scores |
| **EmailRep** | Email reputation | Risk scoring, breach history, domain age |
| **Dehashed** | Breach search engine | Leaked credentials, database dumps |
| **IPQualityScore** | Fraud detection | Email risk scoring, disposable detection |
| **IntelligenceX** | Historical data search | Archived email appearances, dark web mentions |

The platform includes a specialized `EmailIntelligence` universal adapter that orchestrates queries across multiple email sources simultaneously, deduplicates results, and produces a composite reputation score with confidence intervals.

### Domain Intelligence

Domain intelligence sources provide comprehensive DNS, WHOIS, and hosting infrastructure analysis for investigating the digital presence of target organizations.

| Source | Capability | Data Type |
|--------|-----------|-----------|
| **SecurityTrails** | Historical DNS and WHOIS | DNS history, WHOIS changes, subdomains |
| **DNSdumpster** | DNS reconnaissance | DNS records, host mapping, MX analysis |
| **DomainTools** | WHOIS and DNS analytics | Registration history, reverse WHOIS, hosting |
| **PassiveTotal** | Passive DNS and WHOIS | Historical resolutions, WHOIS, SSL certificates |
| **WhoisXML** | WHOIS API | Registration details, domain availability |
| **Netlas** | Internet intelligence | DNS, WHOIS, response bodies, certificates |
| **FullHunt** | Attack surface discovery | Exposed assets, subdomains, technologies |
| **DomainBigData** | Domain analytics | Registration details, linked domains, hosting |
| **SpyOnWeb** | Web analytics intelligence | Shared analytics IDs, AdSense relationships |
| **PublicWWW** | Source code search | HTML/JS snippet search across the web |

Domain intelligence is critical for mapping the full attack surface of an organization during external assessment engagements. The Prismatic Perimeter module consumes domain intelligence findings directly to populate its asset inventory.

### Financial Intelligence

Financial intelligence sources support sanctions screening, beneficial ownership investigation, and regulatory compliance verification across multiple jurisdictions.

| Source | Scope | Data Type |
|--------|-------|-----------|
| **OFAC** | US sanctions | SDN list, entity screening, sanctions programs |
| **EU Sanctions** | European Union | Consolidated sanctions list, restrictive measures |
| **UN Sanctions** | United Nations | Security Council sanctions committees |
| **OpenCorporates** | Global corporate data | 200M+ company records across jurisdictions |
| **SEC EDGAR** | US securities filings | 10-K, 10-Q, proxy statements, insider trading |
| **Crunchbase** | Startup ecosystem | Funding rounds, investors, acquisitions |
| **Blockchain.com** | Bitcoin analytics | Transaction tracing, address clustering |
| **Etherscan** | Ethereum analytics | Smart contracts, token transfers, address activity |
| **Elliptic** | Crypto compliance | Risk scoring, transaction monitoring |
| **Crystal Blockchain** | Crypto analytics | Transaction flow analysis, entity attribution |
| **Chainalysis** | Blockchain analytics | KYT compliance, entity identification |
| **Beneficial Ownership Registry** | Global UBO | Ultimate beneficial owner identification |

Financial intelligence adapters are subject to the strictest rate limiting and audit logging requirements, given the regulatory sensitivity of sanctions screening and anti-money laundering (AML) operations.

## Integration Framework

The OSINT source layer does not operate in isolation. Sources feed into a multi-stage pipeline that transforms raw API responses into evidence-grade intelligence through orchestration, enrichment, and verification.

### Investigation Orchestrator

The `PrismaticOsintSources.Orchestrator` coordinates parallel queries across multiple sources for a given investigation subject. It manages source selection based on the investigation type (company due diligence, person screening, threat assessment), executes queries concurrently using OTP Task supervisors, and aggregates results with deduplication.

```elixir
# Orchestrated multi-source investigation
{:ok, findings} = PrismaticOsintSources.Orchestrator.investigate(
  subject: %{name: "Example s.r.o.", ico: "12345678", country: "CZ"},
  categories: [:czech_registries, :financial, :threat],
  options: [
    timeout: 30_000,
    max_concurrent: 10,
    dedup_strategy: :source_priority
  ]
)

# Returns aggregated findings from all matching sources
# with duplicates removed and confidence scores normalized
```

### Broadway Pipeline

For high-throughput batch operations -- such as screening a portfolio of companies against sanctions lists or monitoring a set of domains for infrastructure changes -- the platform employs Broadway pipelines with built-in backpressure management:

```elixir
defmodule PrismaticOsintSources.Pipeline.OsintBroadway do
  use Broadway

  def handle_message(_processor, message, _context) do
    case process_osint_query(message.data) do
      {:ok, findings} ->
        Message.update_data(message, fn _ -> findings end)
      {:error, _reason} ->
        Message.failed(message, "source_unavailable")
    end
  end
end
```

### Agent Integration

OSINT findings are consumed by the platform's 400+ AIAD agents, which apply domain-specific reasoning to raw intelligence. For example, the Due Diligence agent combines Czech registry data with financial intelligence and threat indicators to produce comprehensive risk assessments, while the Perimeter Security agent feeds infrastructure intelligence into attack surface scoring algorithms.

## Confidence and Verification

Raw [OSINT](@/glossary/osint.md) data varies dramatically in reliability. A record from an official government registry (ARES, Justice.cz) carries near-certain accuracy for the data it contains, while a social media mention or an unverified breach database entry may be speculative or fraudulent. The Prismatic Platform addresses this through a layered [confidence](@/glossary/confidence-scoring.md) and [verification](@/glossary/verification.md) framework rooted in the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic doctrine.

### Confidence Scoring

Every finding produced by an OSINT adapter carries a confidence score between 0.0 and 1.0, assigned based on the source's historical reliability, the specificity of the match, and the freshness of the data:

| Source Type | Typical Confidence Range | Rationale |
|-------------|-------------------------|-----------|
| Government registries | 0.90 -- 0.99 | Official records, legally mandated accuracy |
| Commercial APIs (Shodan, Censys) | 0.80 -- 0.95 | Automated scanning, high but not perfect accuracy |
| Threat intelligence feeds | 0.70 -- 0.90 | Community-verified, some false positives |
| Social media sources | 0.50 -- 0.80 | User-generated content, identity uncertainty |
| Breach databases | 0.40 -- 0.75 | Unverified provenance, potential contamination |

### Multi-Source Corroboration

The [NABLA Infinity](@/glossary/nabla-infinity.md) framework enforces a **[Signal Plurality](@/glossary/signal-plurality.md)** axiom: no belief should rest on a single source. When multiple independent sources corroborate a finding, the composite [confidence](@/glossary/confidence-scoring.md) increases according to a [Bayesian](@/glossary/bayesian-reasoning.md) update model. Conversely, contradictions between sources trigger the **[Contradiction Preservation](@/glossary/contradiction-preservation.md)** axiom, which requires both signals to be preserved rather than discarded, and may escalate the finding for human review.

### Trinity Gate Verification

Critical findings pass through the [Trinity Gate](@/glossary/trinity-gate.md) -- a three-layer [verification](@/glossary/verification.md) pipeline that evaluates hypotheses from structural, logical, and formal perspectives:

1. **[Kuzu](@/glossary/kuzu-db.md) Layer** (Structural) -- Validates that the finding is consistent with the known [entity graph](@/glossary/entity-graph.md). A company claimed to be headquartered in Prague should have Czech registry entries.
2. **[Prolog](@/glossary/prolog.md) Layer** (Logical) -- Applies [rule-based inference](@/glossary/rule-based-reasoning.md) to detect logical inconsistencies. A company cannot simultaneously be dissolved in one registry and active in another without explanation.
3. **[Lean](@/glossary/lean4.md) Layer** (Formal) -- Provides mathematical proof [verification](@/glossary/formal-verification.md) for high-stakes assessments where formal guarantees are required.

The Trinity Gate never "approves" a finding. It can only **hold** (retain for further investigation), **drop** (falsified), or **escalate** (requires human judgment). This conservative design prevents false certainty from propagating through the intelligence pipeline.

## Rate Limiting and Credential Management

Operating 121+ external sources at scale requires sophisticated rate limiting to maintain compliance with provider terms of service, avoid IP blocking, and ensure fair usage across concurrent investigations.

### Rate Limiter Architecture

The `PrismaticOsintCore.RateLimiter` is a production-grade [GenServer](@/glossary/genserver.md) implementing [token bucket](@/glossary/token-bucket.md) [rate limiting](@/glossary/rate-limiting.md) with the following capabilities:

- **Per-source configuration** -- Each source has independently configurable limits (requests per window), burst allowances, and [backoff](@/glossary/exponential-backoff.md) parameters
- **[Exponential backoff](@/glossary/exponential-backoff.md) with jitter** -- Failed or rate-limited requests trigger exponential delays with random jitter to prevent thundering herd scenarios
- **[Circuit breaker](@/glossary/circuit-breaker.md) integration** -- Sources that consistently fail are temporarily removed from the query pool, with automatic recovery testing
- **Broadway/GenStage backpressure** -- High-throughput pipelines automatically slow down when downstream sources approach their [rate limits](@/glossary/rate-limiting.md)
- **[Telemetry](@/glossary/telemetry.md) emission** -- Every rate limit event emits [telemetry](@/glossary/telemetry.md) for real-time monitoring dashboards

```elixir
# Per-source rate limit configuration examples
%{
  "czech_ares"     => %{limit: 10, period: 60_000, burst: 3},
  "shodan"         => %{limit: 100, period: 60_000, burst: 20},
  "virustotal"     => %{limit: 4, period: 60_000, burst: 1},
  "haveibeenpwned" => %{limit: 10, period: 60_000, burst: 2},
  "hunter_io"      => %{limit: 50, period: 60_000, burst: 10},
  "securitytrails" => %{limit: 50, period: 60_000, burst: 10}
}
```

### Credential Management

API credentials for authenticated sources are managed through environment variables and application configuration, never committed to source control. The platform supports multiple credential tiers (free, professional, enterprise) per source, with automatic fallback to lower tiers when primary quotas are exhausted.

Credential health is continuously monitored: the `health_check/0` callback on each adapter validates that stored credentials remain valid, and failed authentication events trigger alerts through the platform's notification infrastructure.

## Performance Metrics

The Prismatic OSINT infrastructure is benchmarked across 419 test scenarios spanning all eight intelligence categories (the seven documented categories plus an IP Intelligence category used internally for infrastructure analysis).

### Benchmark Summary

| Category | Adapters | Suites | Scenarios | P95 Latency |
|----------|----------|--------|-----------|-------------|
| Czech Intelligence | 8 | 9 | 72 | < 800ms |
| Threat Intelligence | 7 | 8 | 56 | < 1,200ms |
| Domain Intelligence | 7 | 8 | 56 | < 1,500ms |
| Email Intelligence | 6 | 7 | 42 | < 1,000ms |
| Social Intelligence | 7 | 7 | 49 | < 2,000ms |
| IP Intelligence | 6 | 8 | 48 | < 1,000ms |
| Crypto Intelligence | 6 | 8 | 48 | < 1,800ms |
| Breach Intelligence | 6 | 8 | 48 | < 1,500ms |

### Operational Targets

- **Concurrent queries**: 1,000+ simultaneous source queries via OTP Task supervision
- **Connection pooling**: Finch HTTP client with per-host connection reuse
- **Cache hit rate**: 60--80% for repeated entity lookups within 24-hour windows
- **Source availability**: 95%+ uptime across the source portfolio (measured weekly)
- **Result normalization**: < 5ms overhead per response transformation
- **Rate limit compliance**: Zero provider bans across all operational deployments

## Security and Compliance

### GDPR Compliance

The platform implements [data protection](@/glossary/data-protection.md) by design and by default, in accordance with EU General Data Protection Regulation ([GDPR](@/glossary/gdpr.md)) requirements:

- **[Data minimization](@/glossary/data-minimization.md)**: [Adapters](@/glossary/adapter-pattern.md) collect only the fields required for the investigation type. Source responses are filtered before storage, discarding irrelevant personal data.
- **Purpose limitation**: Collected data is tagged with the investigation identifier and purpose code. Data cannot be repurposed without explicit [authorization](@/glossary/authorization.md).
- **Storage limitation**: Configurable retention policies automatically purge [OSINT](@/glossary/osint.md) findings after their defined TTL (default: 90 days for standard investigations, 7 years for regulatory [compliance](@/glossary/compliance-framework.md) records).
- **Right of access and erasure**: The platform supports data subject access requests and deletion requests, with cascading removal across all storage backends (PostgreSQL, ETS, Meilisearch).

### Audit Trail

Every [OSINT](@/glossary/osint.md) query generates an immutable [audit record](@/glossary/audit-logging.md) containing: the requesting user or [agent](@/glossary/agent.md) identity, the queried source, the input parameters, the response status, and the timestamp. These [audit records](@/glossary/audit-logging.md) are stored separately from investigation data and are retained for the legally required period (typically 5 years for financial investigations).

```elixir
# Audit event emitted for every source query
:telemetry.execute(
  [:prismatic, :osint, :source, :search],
  %{duration: duration_ms},
  %{
    source: :ares,
    result: :success,
    query_hash: hash(query),
    user_id: current_user_id,
    investigation_id: investigation_id,
    timestamp: DateTime.utc_now()
  }
)
```

### Security Hardening

- **[Credential isolation](@/glossary/credential-management.md)**: API keys are stored in environment variables and loaded at runtime. No credentials exist in source control, configuration files, or ETS tables.
- **[TLS](@/glossary/tls.md) enforcement**: All external API calls use HTTPS with certificate verification enabled. Downgrade attacks are rejected at the HTTP client level.
- **[Input sanitization](@/glossary/input-sanitization.md)**: All user-provided query parameters are sanitized before being passed to external APIs to prevent [injection attacks](@/glossary/injection-vulnerability.md) against third-party services.
- **Output filtering**: Source responses are scanned for sensitive data patterns (credit card numbers, social security numbers) and flagged for review before inclusion in investigation reports.

## Conclusion and Future Expansion

The Prismatic OSINT framework provides a production-grade foundation for multi-source intelligence gathering at scale. By standardizing the adapter interface, normalizing response formats, and integrating epistemic verification through NABLA and the Trinity Gate, the platform transforms the inherently noisy and unreliable landscape of open source intelligence into a structured, confidence-scored evidence base suitable for critical decision-making.

### Expansion Roadmap

Near-term development priorities include:

- **AI-powered source selection** -- Machine learning models that predict the most informative sources for a given query, reducing unnecessary API calls and improving investigation efficiency
- **Real-time monitoring pipelines** -- Continuous surveillance of registered entities using WebSocket and Server-Sent Events for live dashboard updates when source data changes
- **Cross-source correlation engine** -- Automatic detection of non-obvious relationships between findings from different sources, leveraging the KuzuDB graph database for entity resolution
- **Source reliability scoring** -- Historical accuracy tracking for each source, with automatic confidence adjustment based on measured false positive and false negative rates
- **Privacy-preserving queries** -- Anonymized query proxying through Tor and VPN infrastructure for sensitive investigations where query metadata itself constitutes an intelligence signal
- **Custom adapter SDK** -- A streamlined toolkit for organizations to implement proprietary source adapters that integrate seamlessly with the Prismatic pipeline

The intelligence landscape evolves continuously as new data sources emerge, existing APIs change, and regulatory requirements shift. The adapter architecture ensures that Prismatic can absorb these changes incrementally -- adding, updating, or retiring individual sources without disrupting the broader investigation infrastructure. With 121+ sources operational today and a clear expansion path, the platform is positioned to serve as the definitive OSINT integration layer for security, compliance, and due diligence operations across European and global jurisdictions.

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
