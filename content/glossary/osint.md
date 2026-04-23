+++
title = "OSINT"
weight = 27
[extra]
description = "Open Source Intelligence gathering and analysis from publicly available sources"
category = "osint"
abbreviation = "OSINT"
related_terms = ["intelligence-fusion", "threat-intelligence", "easm", "hawkeye", "entity-resolution", "garden", "sanctions-screening"]
keywords = ["open source intelligence definition", "OSINT methodology guide", "intelligence gathering techniques", "OSINT source taxonomy", "public records intelligence", "digital forensics OSINT", "threat intelligence collection", "OSINT analysis framework"]
tags = ["osint", "intelligence", "security", "reconnaissance"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1689
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "OSINT - Prismatic Platform"
+++

## Definition and Overview

Open Source Intelligence (OSINT) is the discipline of collecting, processing, analyzing, and disseminating information from publicly available sources to produce actionable intelligence. Unlike signals intelligence (SIGINT) or human intelligence (HUMINT), OSINT relies exclusively on information that is legally accessible to the public: government records, social media profiles, domain registrations, certificate transparency logs, DNS records, web content, academic publications, financial filings, patent databases, and commercial data services. OSINT emphasizes structured analysis workflows, source verification, and ethical collection methods that respect privacy laws, terms of service, and jurisdictional regulations.

The history of OSINT predates the digital age. Intelligence analysts have always studied newspapers, radio broadcasts, academic journals, and public records. What has changed is the scale: the digital revolution has created an unprecedented volume of publicly available information. An estimated 2.5 exabytes of data are produced daily, and a significant fraction is publicly accessible. The challenge has shifted from information scarcity to information overload. Modern OSINT practice focuses on automated collection, structured analysis, entity resolution across disparate sources, and confidence-calibrated assessment that acknowledges uncertainty.

OSINT is distinguished from other intelligence disciplines not just by its sources but by its methodology. Traditional intelligence operates on the assumption that important information is hidden and must be obtained through covert means. OSINT operates on the complementary assumption that important information is often already publicly available, but is buried in the noise of massive datasets. The analyst's skill lies not in obtaining access but in identifying relevance, correlating signals across sources, and producing assessments that decision-makers can act upon.

The intelligence cycle for OSINT follows the standard intelligence process: planning and direction (what questions need answering), collection (gathering data from sources), processing (converting raw data into usable format), analysis (interpreting processed data to produce intelligence), and dissemination (delivering intelligence to consumers). Within the Prismatic Platform, each stage of this cycle is supported by specialized tools, agents, and pipelines that automate routine operations while preserving analyst oversight for critical judgments.

## Historical Context

The formalization of OSINT as a recognized intelligence discipline traces to the late Cold War period, when the Central Intelligence Agency established the Foreign Broadcast Information Service (FBIS) to monitor and translate foreign media. During the 1990s, the rise of the internet exponentially expanded the volume of publicly available information, and by the early 2000s, intelligence agencies worldwide recognized OSINT as a co-equal discipline alongside SIGINT, HUMINT, GEOINT, and MASINT.

The 2004 publication of the US 9/11 Commission Report highlighted the intelligence community's failure to synthesize publicly available information that could have provided warning of the attacks. This catalyzed institutional investment in OSINT capabilities. The creation of the Open Source Center (OSC) in 2005 and its successor, the Open Source Enterprise (OSE), formalized OSINT's role within the US intelligence community.

In the private sector, OSINT techniques gained prominence through cybersecurity research, competitive intelligence, and due diligence investigations. The Prismatic Platform's OSINT capabilities draw from over 20 years of practical intelligence work captured in the [GARDEN](/glossary/garden/) knowledge base, particularly the `sig` repository containing 250+ OSINT provider integrations.

## Technical Deep Dive

### OSINT Source Taxonomy

OSINT sources are categorized by type, reliability, and access method:

| Category | Sources | Reliability | Access Method |
|----------|---------|-------------|---------------|
| **Domain Intelligence** | DNS records, WHOIS, subdomain enumeration | High | Direct query (DNS protocol) |
| **Certificate Intelligence** | Certificate Transparency logs, issuer records | Very High | CT log APIs (crt.sh, Censys) |
| **Network Intelligence** | IP ranges, ASN mappings, port scans | High | Shodan, Censys, passive DNS |
| **Web Intelligence** | Website content, robots.txt, headers | Medium | HTTP requests, web crawling |
| **Registry Intelligence** | Business registrations, court records, filings | Very High | Government APIs, web scraping |
| **Social Intelligence** | Social media profiles, public posts | Low-Medium | Platform APIs, public pages |
| **Financial Intelligence** | SEC filings, annual reports, patent databases | Very High | EDGAR, patent office APIs |
| **Academic Intelligence** | Research papers, conference proceedings | High | Academic databases, preprint servers |
| **Geospatial Intelligence** | Satellite imagery, mapping data, check-ins | Medium | Public mapping APIs, imagery services |

### Collection Architecture

The Prismatic Platform implements OSINT collection through a multi-adapter architecture:

```elixir
defmodule PrismaticOSINT.Collector do
  @moduledoc """
  Multi-source OSINT collector with adapter-based backend selection.
  Coordinates collection across DNS, certificate, registry, and web sources.
  """

  @type collection_target :: %{
    domain: String.t() | nil,
    email: String.t() | nil,
    person: String.t() | nil,
    organization: String.t() | nil,
    ip_address: String.t() | nil
  }

  @type collection_result :: %{
    target: collection_target(),
    findings: list(map()),
    sources_queried: list(String.t()),
    collection_time_ms: non_neg_integer(),
    confidence: float()
  }

  @spec collect(collection_target(), keyword()) :: {:ok, collection_result()} | {:error, term()}
  def collect(target, opts \\ []) do
    adapters = select_adapters(target, opts)
    timeout = Keyword.get(opts, :timeout, 30_000)

    tasks =
      Enum.map(adapters, fn adapter ->
        Task.async(fn ->
          start = System.monotonic_time(:millisecond)
          result = adapter.collect(target)
          duration = System.monotonic_time(:millisecond) - start

          :telemetry.execute(
            [:prismatic, :osint, :collection],
            %{duration_ms: duration},
            %{adapter: adapter.name(), target_type: target_type(target)}
          )

          {adapter.name(), result, duration}
        end)
      end)

    results = Task.await_many(tasks, timeout)

    findings =
      results
      |> Enum.flat_map(fn
        {_adapter, {:ok, data}, _duration} -> data
        {_adapter, {:error, _reason}, _duration} -> []
      end)

    {:ok, %{
      target: target,
      findings: findings,
      sources_queried: Enum.map(results, fn {adapter, _, _} -> adapter end),
      collection_time_ms: Enum.max_by(results, fn {_, _, d} -> d end) |> elem(2),
      confidence: calculate_confidence(results)
    }}
  end

  defp select_adapters(%{domain: domain}, _opts) when is_binary(domain) do
    [
      PrismaticOSINT.Adapters.DNS,
      PrismaticOSINT.Adapters.CertificateTransparency,
      PrismaticOSINT.Adapters.WHOIS,
      PrismaticOSINT.Adapters.WebContent,
      PrismaticOSINT.Adapters.Shodan
    ]
  end

  defp select_adapters(%{email: email}, _opts) when is_binary(email) do
    [
      PrismaticOSINT.Adapters.EmailVerification,
      PrismaticOSINT.Adapters.BreachDatabase,
      PrismaticOSINT.Adapters.SocialMedia,
      PrismaticOSINT.Adapters.DomainFromEmail
    ]
  end

  defp select_adapters(%{organization: org}, _opts) when is_binary(org) do
    [
      PrismaticOSINT.Adapters.BusinessRegistry,
      PrismaticOSINT.Adapters.ARES,
      PrismaticOSINT.Adapters.CommercialRegister,
      PrismaticOSINT.Adapters.FinancialFilings
    ]
  end

  defp calculate_confidence(results) do
    successful = Enum.count(results, fn {_, result, _} -> match?({:ok, _}, result) end)
    total = length(results)
    if total > 0, do: successful / total, else: 0.0
  end
end
```

### Entity Resolution

A core challenge in OSINT is [entity resolution](/glossary/entity-resolution/) -- determining whether references from different sources refer to the same real-world entity. Names vary (John Smith, J. Smith, John R. Smith), addresses change, organizations use multiple names, and individuals appear in different contexts:

```elixir
defmodule PrismaticOSINT.EntityResolution do
  @moduledoc """
  Fuzzy entity resolution across OSINT sources.
  Uses multiple similarity metrics with configurable thresholds.
  """

  @type entity :: %{
    name: String.t(),
    aliases: list(String.t()),
    identifiers: map(),
    sources: list(String.t()),
    confidence: float()
  }

  @similarity_threshold 0.85

  @spec resolve(list(map())) :: list(entity())
  def resolve(raw_entities) do
    raw_entities
    |> Enum.sort_by(&(-length(&1.sources)))
    |> Enum.reduce([], fn entity, resolved ->
      case find_match(entity, resolved) do
        {:match, existing, score} ->
          merged = merge_entities(existing, entity, score)
          replace_entity(resolved, existing, merged)

        :no_match ->
          [entity_to_resolved(entity) | resolved]
      end
    end)
  end

  defp find_match(entity, resolved) do
    resolved
    |> Enum.map(fn existing ->
      score = calculate_similarity(entity, existing)
      {existing, score}
    end)
    |> Enum.filter(fn {_, score} -> score >= @similarity_threshold end)
    |> Enum.max_by(fn {_, score} -> score end, fn -> nil end)
    |> case do
      nil -> :no_match
      {existing, score} -> {:match, existing, score}
    end
  end

  defp calculate_similarity(a, b) do
    name_sim = PrismaticOSINT.Similarity.jaro_winkler(a.name, b.name)
    alias_sim = max_alias_similarity(a, b)
    id_sim = identifier_overlap(a, b)

    # Weighted combination
    name_sim * 0.4 + alias_sim * 0.3 + id_sim * 0.3
  end
end
```

### Czech Legal Intelligence

The Prismatic Platform has specialized OSINT capabilities for Czech legal and business intelligence:

| Source | API/Method | Data Provided |
|--------|-----------|---------------|
| **ARES** (Ministry of Finance) | REST API | Company registration, ICO, tax IDs, addresses |
| **Commercial Register** (Justice.cz) | Web scraping + API | Company officers, shareholders, filings |
| **Insolvency Register** | REST API | Bankruptcy proceedings, creditor claims |
| **Trade Register** | Web scraping | Trade licenses, authorized representatives |
| **Land Registry** (CUZK) | REST API | Property ownership, encumbrances, mortgages |
| **Court Records** | Web scraping | Judgments, proceedings, enforcement orders |

```elixir
defmodule PrismaticOSINT.Adapters.ARES do
  @moduledoc """
  ARES (Administrative Register of Economic Subjects) adapter.
  Queries Czech Ministry of Finance for company registration data.
  """

  @behaviour PrismaticOSINT.Adapter

  @ares_api "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest"

  @impl PrismaticOSINT.Adapter
  def name, do: "ares_czech"

  @impl PrismaticOSINT.Adapter
  def collect(%{organization: org_name}) when is_binary(org_name) do
    with {:ok, response} <- search_by_name(org_name),
         {:ok, entities} <- parse_response(response) do
      {:ok, Enum.map(entities, &normalize_entity/1)}
    end
  end

  def collect(%{identifiers: %{ico: ico}}) when is_binary(ico) do
    with {:ok, response} <- lookup_by_ico(ico),
         {:ok, entity} <- parse_single_response(response) do
      {:ok, [normalize_entity(entity)]}
    end
  end

  defp search_by_name(name) do
    url = "#{@ares_api}/ekonomicke-subjekty/vyhledat"
    params = %{obchodniJmeno: name, start: 0, pocet: 20}
    HTTPClient.get(url, [], params: params)
  end

  defp normalize_entity(raw) do
    %{
      name: raw["obchodniJmeno"],
      ico: raw["ico"],
      dic: raw["dic"],
      address: format_address(raw["sidlo"]),
      legal_form: raw["pravniForma"],
      registration_date: raw["datumVzniku"],
      source: "ares_czech",
      retrieved_at: DateTime.utc_now()
    }
  end
end
```

## NABLA Compliance for OSINT

All OSINT findings in the Prismatic Platform must comply with [NABLA Infinity](/glossary/nabla-infinity/) epistemic axioms:

| Axiom | OSINT Application | Enforcement |
|-------|-------------------|-------------|
| **Signal Plurality** | Minimum 2 independent sources for any claim | HARD -- single-source findings marked "unverified" |
| **[Contradiction Preservation](/glossary/contradiction-preservation/)** | Conflicting records preserved, not resolved | HARD -- both versions stored with provenance |
| **[Provenance Mandatory](/glossary/provenance-mandatory/)** | Every finding traces to its source | HARD -- source URL, timestamp, and method recorded |
| **Time Decay** | Findings have freshness timestamps | HARD -- stale findings downgraded automatically |
| **Source Independence** | Cross-verify across independent providers | SOFT -- independent corroboration weighted higher |

## Architecture and Implementation

### Intelligence Pipeline

The OSINT intelligence pipeline follows the standard intelligence cycle with Prismatic-specific automation:

```
Planning           Collection          Processing         Analysis           Dissemination
+-----------+     +-----------+       +-----------+      +-----------+      +-----------+
| Define    |---->| Multi-    |------>| Normalize |----->| Entity    |----->| Reports   |
| collection|     | adapter   |       | deduplicate      | resolution|      | alerts    |
| requirements    | parallel  |       | validate  |      | correlation      | feeds     |
|           |     | collection|       |           |      | assessment|      |           |
+-----------+     +-----------+       +-----------+      +-----------+      +-----------+
```

### Rate Limiting and Ethical Collection

OSINT collection respects source rate limits and ethical boundaries:

```elixir
defmodule PrismaticOSINT.RateLimiter do
  @moduledoc """
  Token bucket rate limiter for OSINT collection adapters.
  Ensures compliance with API terms of service and ethical collection limits.
  """
  use GenServer

  @type config :: %{
    requests_per_second: float(),
    requests_per_minute: non_neg_integer(),
    burst_limit: non_neg_integer()
  }

  @default_config %{
    requests_per_second: 5.0,
    requests_per_minute: 100,
    burst_limit: 10
  }

  def start_link(adapter, config \\ @default_config) do
    GenServer.start_link(__MODULE__, {adapter, config}, name: via(adapter))
  end

  @spec acquire(atom()) :: :ok | {:error, :rate_limited}
  def acquire(adapter) do
    GenServer.call(via(adapter), :acquire)
  end

  @impl GenServer
  def handle_call(:acquire, _from, state) do
    now = System.monotonic_time(:millisecond)

    if tokens_available?(state, now) do
      {:reply, :ok, consume_token(state, now)}
    else
      {:reply, {:error, :rate_limited}, state}
    end
  end
end
```

## OSINT Toolbox UI

The Prismatic Platform exposes 120 OSINT tools through a [LiveView](/glossary/phoenix-liveview/) interface at `/osint/toolbox`, organized into 7 categories:

| Category | Tools | Key Sources |
|----------|-------|-------------|
| **Czech** | 28 adapters | ARES, Justice, ISIR, Commercial Register, Trade Register |
| **Global** | 84 adapters | Shodan, VirusTotal, Censys, Hunter.io, SecurityTrails |
| **Sanctions** | 3 | EU Sanctions, OFAC SDN, UN Consolidated |
| **EU** | 1 | European Business Register |
| **UK** | 1 | Companies House |
| **US** | 1 | SEC EDGAR |
| **Universal** | 2 | EmailIntelligence, EmailIntelligenceRateLimited |

Each tool exposes a consistent interface through the LiveView dashboard: input parameters, execution control, results display, and export capabilities. The UI integrates with the platform's [telemetry](/glossary/telemetry/) infrastructure for performance monitoring and rate limit visibility.

## Usage in Prismatic Platform

The Prismatic Platform has deep OSINT roots extending back to the GARDEN knowledge base's `sig` repository, which contains 250+ OSINT providers accumulated over 20+ years of intelligence work.

### Platform OSINT Capabilities

| Capability | Application | Integration |
|-----------|-------------|-------------|
| **Attack Surface Discovery** | `prismatic_perimeter` | DNS, certificates, services, cloud resources |
| **Visitor Intelligence** | `prismatic_hawkeye` | IP geolocation, organization mapping, threat correlation |
| **Sanctions Screening** | `prismatic_osint` | EU/US/UN sanctions lists, PEP databases |
| **Business Intelligence** | `prismatic_osint` | Czech registry, ARES, commercial register |
| **[Threat Intelligence](/glossary/threat-intelligence/)** | `prismatic_osint` | IOC feeds, malware databases, vulnerability correlation |

### GARDEN OSINT Heritage

The GARDEN knowledge base contributes 250+ OSINT provider integrations from the legacy `sig` repository, organized by domain:

| Domain | Providers | Key Sources |
|--------|----------|-------------|
| **Domain/DNS** | 45+ | PassiveDNS, SecurityTrails, VirusTotal, Shodan |
| **Email** | 30+ | Hunter.io, Have I Been Pwned, EmailRep |
| **Social** | 25+ | Social media platforms, username enumeration |
| **Business** | 40+ | OpenCorporates, company registries, SEC/EDGAR |
| **Threat** | 35+ | AlienVault OTX, abuse.ch, Maltiverse |
| **Geospatial** | 20+ | MaxMind, IP2Location, Google Maps |
| **Certificate** | 15+ | crt.sh, Censys, SSL Labs |
| **Infrastructure** | 40+ | Shodan, Censys, ZoomEye, BinaryEdge |

## Comparison with Other Intelligence Disciplines

| Discipline | Sources | Legal Constraints | Automation Potential | Prismatic Coverage |
|------------|---------|-------------------|---------------------|-------------------|
| **OSINT** | Public data | Minimal (TOS, privacy) | High | Full (120 tools) |
| **SIGINT** | Communications | Heavy (warrants) | Medium | Not applicable |
| **HUMINT** | Human contacts | Heavy (legal/ethical) | Low | Not applicable |
| **GEOINT** | Imagery/geospatial | Moderate | High | Partial (IP geolocation) |
| **MASINT** | Measurements/signatures | Heavy | High | Not applicable |
| **CYBINT** | Cyber operations | Moderate | High | Partial (threat intelligence) |

## Best Practices

**Verify through multiple independent sources.** Never rely on a single OSINT source for critical intelligence. Cross-reference findings across at least two independent sources. A domain registration record corroborated by certificate transparency logs and DNS records provides much higher confidence than any single source alone.

**Track provenance meticulously.** Every finding must include its source URL, retrieval timestamp, and collection method. [Provenance](/glossary/provenance-mandatory/) enables verification, freshness assessment, and legal defensibility. Without provenance, intelligence is indistinguishable from rumor.

**Respect rate limits and terms of service.** Aggressive scraping or API abuse damages the OSINT community by causing providers to restrict access. Implement proper rate limiting, honor robots.txt, and comply with API terms of service. Sustainable collection ensures long-term access.

**Implement time decay on findings.** OSINT data has a shelf life. DNS records change, certificates expire, companies merge, and people move. Implement automatic freshness tracking and re-collection schedules to prevent stale intelligence from contaminating analysis.

**Preserve contradictory information.** When sources disagree, preserve both versions with their respective provenance rather than choosing one. Contradictions are informative -- they may indicate data currency differences, deliberate deception, or legitimate ambiguity.

## Common Pitfalls

**Confirmation bias in collection.** The temptation to search only for information supporting a hypothesis is strong. Structure collection plans to include sources that could disconfirm the hypothesis. NABLA's signal plurality axiom requires actively seeking contradictory evidence.

**Conflating data volume with intelligence quality.** Collecting more data does not automatically produce better intelligence. The analysis phase -- where raw data is interpreted, correlated, and assessed -- is where intelligence value is created. Investing in collection without corresponding investment in analysis produces data swamps.

**Ignoring legal and ethical boundaries.** OSINT uses public sources, but "public" has legal nuances. Scraping data behind login walls, accessing cached personal data after deletion requests, or collecting data in jurisdictions with strict privacy laws can create legal exposure. Understand the legal framework of each source.

**Single-language bias.** OSINT analysis that operates only in English misses intelligence available in other languages. For Czech business intelligence, the most authoritative sources are in Czech. Implement multi-language collection and analysis capabilities.

**Treating automated collection as final.** Automated OSINT tools are excellent at data gathering but poor at contextual interpretation. Automated findings should be treated as raw input requiring analyst review, not as finished intelligence products.

## Related Concepts

- [Intelligence Fusion](/glossary/intelligence-fusion/) -- Multi-source correlation methodology for OSINT data
- [Threat Intelligence](/glossary/threat-intelligence/) -- Structured threat information derived from OSINT sources
- [EASM](/glossary/easm/) -- OSINT-powered external attack surface management
- [Entity Resolution](/glossary/entity-resolution/) -- Fuzzy matching across OSINT source variations
- [GARDEN](/glossary/garden/) -- Legacy knowledge base with 250+ OSINT providers
- [Sanctions Screening](/glossary/sanctions-screening/) -- Regulatory compliance using OSINT data sources
- [Prismatic Perimeter](/glossary/prismatic-perimeter/) -- EASM application consuming OSINT intelligence
- [DNS Enumeration](/glossary/dns-enumeration/) -- Domain intelligence collection technique
- [Vulnerability Assessment](/glossary/vulnerability-assessment/) -- Security assessment powered by OSINT data

## See Also

- [Architecture](/architecture/) -- Platform architecture overview
- [Agents](/agents/) -- OSINT-specialized AIAD agents
- [Technologies](/technologies/) -- Technology stack details
- [Apps](/apps/) -- OSINT applications in the umbrella

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
