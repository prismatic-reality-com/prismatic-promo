+++
title = "GDELT Project"
weight = 55
[extra]
category = "global"
type = "media"
module = "Gdelt"
description = "Global Database of Events, Language, and Tone monitoring worldwide news media in 100+ languages every 15 minutes"
has_api = true
url = "https://www.gdeltproject.org"
rate_limit = "BigQuery-based, generous free tier"
capabilities = ["Global Event Monitoring", "Media Analysis", "Sentiment Analysis", "Entity Extraction", "Geographic Analysis", "Temporal Trend Detection", "Image Analysis", "Theme Classification"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1022
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["GDELT", "Project", "Global", "Database", "Events", "Language", "Tone", "osint", "Prismatic Platform", "CAMEO"]
tags = ["osint", "global", "gdelt-project", "prismatic"]
quality_score = 75
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "GDELT Project - Prismatic Platform"
+++

## Overview

The GDELT Project (Global Database of Events, Language, and Tone) is the largest, most comprehensive, and highest-resolution open dataset of global human society ever created. Updated every 15 minutes, GDELT monitors broadcast, print, and web news from virtually every country in over 100 languages, translating and processing each article to identify events, entities, themes, emotions, and relationships. The project is supported by Google Jigsaw and hosted on Google Cloud Platform, leveraging BigQuery for analytical access to the full dataset.

GDELT maintains three primary datasets: the **Event Database** (structured records of who-did-what-to-whom events coded using the CAMEO taxonomy), the **Global [Knowledge Graph](/glossary/knowledge-graph/)** (people, organizations, locations, themes, emotions, and their interconnections), and the **Global Entity Graph** (entity-level analysis of news content with sentiment and context). Together, these datasets represent over a quarter-billion event records and billions of entity and theme references spanning decades of global media coverage.

For [OSINT](/glossary/osint/) practitioners, GDELT provides unmatched media intelligence at a global scale. It enables [real-time monitoring](/capabilities/real-time-monitoring/) of geopolitical events, tracking of entities across news coverage, sentiment analysis around organizations and individuals, and early warning of emerging crises. The platform's 15-minute update cycle means analysts can detect breaking events nearly as quickly as newsrooms. When combined with targeted source intelligence from [NewsAPI](/osint/newsapi/) and social media monitoring via [Social Searcher](/osint/social-searcher/), GDELT provides the broadest possible media intelligence coverage.

The scale of GDELT is difficult to overstate: it processes hundreds of thousands of articles daily across virtually all countries, in all major languages, from news outlets ranging from global wire services to local newspapers. This breadth makes it uniquely suited for detecting weak signals that might appear only in regional media before escalating to international attention.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **Events** | Structured who-did-what-to-whom records with CAMEO coding |
| **Entities** | People, organizations, locations extracted from articles |
| **Themes** | Hundreds of thematic categories (conflict, economics, health, etc.) |
| **Sentiment** | Tone scores (-100 to +100) per article and entity |
| **Geolocation** | Latitude/longitude for events and entities |
| **Source URLs** | Original article URLs for each processed story |
| **Languages** | 100+ languages with machine translation |
| **Imagery** | Satellite, news photos analyzed via Google Cloud Vision |
| **Counts** | Aggregate mention counts for entities and themes |
| **Relationships** | Entity co-occurrence and relationship extraction |

### CAMEO Event Coding System

GDELT encodes events using the Conflict and Mediation Event Observations (CAMEO) taxonomy, which classifies actions into a hierarchical coding system:

| CAMEO Root Code | Category | Examples |
|----------------|----------|---------|
| **01** | Make Public Statement | Press conferences, official statements |
| **02** | Appeal | Requests for cooperation, mediation |
| **03** | Express Intent to Cooperate | Trade agreements, diplomatic overtures |
| **04** | Consult | Meetings, negotiations, summits |
| **05** | Engage in Diplomatic Cooperation | Treaties, alliances, joint operations |
| **06** | Engage in Material Cooperation | Aid, loans, humanitarian assistance |
| **10** | Demand | Ultimatums, conditions, requirements |
| **14** | Protest | Demonstrations, strikes, boycotts |
| **17** | Coerce | Sanctions, embargoes, blockades |
| **18** | Assault | Armed attacks, bombings, occupations |
| **19** | Fight | Armed conflicts, military engagement |
| **20** | Engage in Mass Violence | Mass killings, ethnic cleansing |

### GDELT Processing Pipeline

```
Global News Sources (broadcast, print, web) in 100+ languages
    |
    v
Machine Translation --> English canonical text
    |
    v
NLP: Entity extraction, event coding, sentiment, themes
    |
    v
GDELT Event Database + Global Knowledge Graph + Entity Graph
    |
    v
BigQuery / REST API --> Prismatic OSINT Pipeline
```

### Tone Scoring Model

GDELT's tone score measures the overall sentiment of an article on a scale from -100 (extremely negative) to +100 (extremely positive):

| Tone Range | Interpretation | Typical Content |
|-----------|----------------|----------------|
| **+10 to +100** | Positive | Business growth, cooperation, achievements |
| **+1 to +9** | Slightly positive | Neutral-positive reporting |
| **0** | Neutral | Factual reporting without sentiment |
| **-1 to -9** | Slightly negative | Cautionary, concern-oriented |
| **-10 to -100** | Negative | Conflict, crisis, disaster, criticism |

## Integration with Prismatic

GDELT provides global media intelligence for the Prismatic platform's geopolitical risk assessment, brand monitoring, and entity tracking capabilities.

```elixir
# Search for articles about an entity
{:ok, articles} = Gdelt.search_articles("Prismatic cybersecurity",
  mode: :article_list,
  max_records: 50,
  start_date: ~D[2025-01-01]
)
# => %{
#   total: 156,
#   articles: [
#     %{url: "https://example.com/article1",
#       title: "Czech Cybersecurity Startup Raises...",
#       source_country: "CZ", language: "English",
#       tone: 4.2, themes: ["CYBER_SECURITY", "BUSINESS"],
#       persons: ["John Doe"], organizations: ["Prismatic"],
#       locations: [%{name: "Prague", lat: 50.08, lon: 14.44}],
#       published: ~U[2025-06-15 10:00:00Z]}
#   ]
# }

# Get event records (CAMEO coded)
{:ok, events} = Gdelt.search_events(
  actor1: "CZE",
  event_type: "PROTEST",
  date_range: {~D[2025-01-01], ~D[2025-12-31]}
)

# Monitor entity mentions over time (tone timeline)
{:ok, timeline} = Gdelt.tone_timeline("Example Corp",
  resolution: :day,
  start_date: ~D[2025-01-01]
)

# Geographic analysis of events
{:ok, geo_events} = Gdelt.geo_search(
  latitude: 50.08,
  longitude: 14.44,
  radius_km: 100,
  theme: "CYBER_SECURITY"
)

# Theme search across all global media
{:ok, themed} = Gdelt.search_theme("TAX_FNCACT_SANCTIONS",
  source_country: "RU",
  start_date: ~D[2025-06-01]
)

# BigQuery direct query for complex analysis
{:ok, result} = Gdelt.bigquery("""
  SELECT SQLDATE, Actor1Name, Actor2Name, EventCode, AvgTone
  FROM `gdeltv2.events`
  WHERE Actor1CountryCode = 'CZE'
  AND SQLDATE >= 20250101
  ORDER BY SQLDATE DESC
  LIMIT 100
""")

# Volume timeline for entity media coverage
{:ok, volume} = Gdelt.volume_timeline("Example Corp",
  resolution: :week,
  start_date: ~D[2025-01-01]
)
```

### Geopolitical Risk Monitor

The geopolitical risk monitor combines GDELT media intelligence with targeted news sources and social media signals for comprehensive entity risk assessment:

```elixir
defmodule PrismaticIntelligence.GeoRisk.MediaMonitor do
  @moduledoc """
  Monitors global media for geopolitical risk signals affecting
  entities and regions relevant to Prismatic investigations.
  """

  def assess_entity_media_risk(entity_name) do
    tasks = [
      Task.async(fn -> Gdelt.search_articles(entity_name, mode: :article_list, max_records: 100) end),
      Task.async(fn -> Gdelt.tone_timeline(entity_name, resolution: :week) end),
      Task.async(fn -> NewsApi.search(entity_name, sort_by: :relevancy) end),
      Task.async(fn -> SocialSearcher.search(entity_name) end)
    ]

    [articles, tone, news, social] = Task.await_many(tasks, 30_000)

    {:ok, %{
      entity: entity_name,
      gdelt_articles: extract_count(articles),
      average_tone: extract_tone(tone),
      tone_trend: calculate_trend(tone),
      news_coverage: extract_count(news),
      social_sentiment: extract_sentiment(social),
      risk_signals: identify_media_risk_signals(articles, tone, news),
      country_exposure: extract_country_distribution(articles),
      theme_distribution: extract_themes(articles),
      monitored_at: DateTime.utc_now()
    }}
  end

  defp identify_media_risk_signals(articles, tone, news) do
    signals = []
    signals = if negative_tone_spike?(tone), do: [:negative_tone_spike | signals], else: signals
    signals = if coverage_volume_spike?(articles), do: [:coverage_spike | signals], else: signals
    signals = if sanctions_themes?(articles), do: [:sanctions_mentioned | signals], else: signals
    signals = if conflict_themes?(articles), do: [:conflict_context | signals], else: signals
    signals = if legal_themes?(articles), do: [:legal_proceedings | signals], else: signals
    signals
  end
end
```

### Adverse Media Screening

For compliance-driven adverse media screening, GDELT provides the broadest global coverage of any single source:

```elixir
defmodule PrismaticCompliance.Screening.AdverseMediaScreener do
  @moduledoc """
  Screens entities for adverse media coverage using GDELT
  global news analysis for KYC/AML compliance workflows.
  """

  @adverse_themes [
    "TAX_FNCACT_SANCTIONS", "CRISISLEX_CRISISLEXREC",
    "TAX_FNCACT_FRAUD", "KILL", "TAX_FNCACT_BRIBERY",
    "TAX_FNCACT_MONEY_LAUNDERING", "TERROR"
  ]

  def screen_entity(entity_name) do
    with {:ok, articles} <- Gdelt.search_articles(entity_name,
           mode: :article_list, max_records: 200),
         adverse <- filter_adverse_articles(articles) do
      {:ok, %{
        entity: entity_name,
        total_coverage: length(articles.articles),
        adverse_articles: length(adverse),
        adverse_themes: extract_adverse_themes(adverse),
        adverse_countries: extract_countries(adverse),
        risk_level: classify_adverse_risk(adverse),
        screening_date: DateTime.utc_now()
      }}
    end
  end

  defp filter_adverse_articles(articles) do
    Enum.filter(articles.articles, fn article ->
      Enum.any?(@adverse_themes, &(&1 in (article.themes || []))) or
      article.tone < -5.0
    end)
  end
end
```

## Rate Limits and Access

| Access Method | Rate/Cost | Features |
|--------------|-----------|----------|
| **DOC API** | Free, rate-limited | Article search, tone timeline, geo |
| **GKG API** | Free, rate-limited | Knowledge graph search |
| **BigQuery** | 1TB/month free | Full dataset SQL queries |
| **Raw Files** | Free download | CSV/JSON master files every 15 min |

### Data Access Methods

| Method | Description | Best For |
|--------|-------------|----------|
| **GDELT DOC 2.0 API** | [REST API](/glossary/rest-api/) for article and event search | Quick searches, integration |
| **Google BigQuery** | Full SQL access to all GDELT tables | Complex analysis, aggregation |
| **Raw Data Files** | Updated every 15 minutes as downloadable CSVs | Offline analysis, data lake |
| **GDELT Analysis Service** | Pre-built visualizations and dashboards | Quick visualization |

### BigQuery Tables

| Table | Description | Update Frequency |
|-------|-------------|-----------------|
| `gdeltv2.events` | CAMEO-coded event records | Every 15 minutes |
| `gdeltv2.gkg` | Global Knowledge Graph records | Every 15 minutes |
| `gdeltv2.gkg_partitioned` | Partitioned GKG for efficient queries | Every 15 minutes |
| `gdeltv2.eventmentions` | Event mention details with source context | Every 15 minutes |

## Use Cases

### Geopolitical Risk Assessment
- Monitor political instability signals in target countries using CAMEO event codes
- Track sanctions-related media coverage for compliance intelligence
- Early warning system for crises affecting business operations
- Country risk scoring based on conflict event density and sentiment trends

### Entity Monitoring
- Track global media coverage of investigation targets across 100+ languages
- Detect sentiment shifts around companies and individuals before they become trends
- Monitor for negative coverage that may indicate emerging risks
- Build media exposure timelines for due diligence reports

### Due Diligence Enhancement
- Assess media reputation of companies during M&A review with adverse media screening
- Identify adverse media coverage for KYC/AML compliance requirements
- Cross-reference with [ARES](/osint/ares/) entity data for Czech companies
- Verify claims against global media record for consistency

### Supply Chain Intelligence
- Monitor media coverage of key suppliers across all operating geographies
- Detect regional instability that may disrupt supply chains
- Track regulatory changes and compliance events in supplier jurisdictions
- Feed media risk signals into [NIS2](/glossary/nis2/) supply chain assessments

### Market Intelligence
- Track industry trends through theme and entity co-occurrence analysis
- Monitor competitor media footprint and sentiment trajectory
- Identify emerging markets through geographic event density analysis
- Correlate media sentiment with market movements for financial intelligence

## Related Sources

- [NewsAPI](/osint/newsapi/) - Targeted news article aggregation from 80K+ sources
- [Social Searcher](/osint/social-searcher/) - Social media monitoring across platforms
- [EU Sanctions](/osint/eu-sanctions/) - European sanctions for correlation with media signals
- [OFAC](/osint/ofac/) - US sanctions for correlation with media intelligence
- [Crunchbase](/osint/crunchbase/) - Company intelligence to enrich media findings
- [UN Sanctions](/osint/un-sanctions/) - Global sanctions for adverse media correlation

## Related Platform Components

- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - Media intelligence in [security rating](/glossary/security-rating/)s

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)