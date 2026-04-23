+++
title = "NewsAPI"
weight = 56
[extra]
category = "global"
type = "social"
module = "Newsapi"
description = "Global news aggregation API providing structured access to articles from 80,000+ sources worldwide"
has_api = true
url = "https://newsapi.org"
rate_limit = "Free: 100 req/day, Developer: 250/day, Business: 1000/day"
capabilities = ["Headline Search", "Full-Text Article Search", "Source Filtering", "Language Filtering", "Date Range Queries", "Keyword Monitoring", "Category Filtering", "Country-Specific News"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1347
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["NewsAPI", "Global", "80000", "osint", "Prismatic Platform", "Prismatic", "GDELT"]
tags = ["osint", "global", "newsapi", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "NewsAPI - Prismatic Platform"
+++

## Overview

NewsAPI is a [REST API](@/glossary/rest-api.md) that provides structured access to live and historical news articles from over 80,000 news sources and blogs worldwide. The API aggregates content from major publications (BBC, CNN, Reuters, Bloomberg), regional outlets, industry publications, and technology blogs, returning structured JSON responses with article metadata, descriptions, and source information. Founded in 2017, NewsAPI has become a cornerstone of programmatic news intelligence, serving developers and analysts who need machine-readable access to the global news landscape.

For [OSINT](@/glossary/osint.md) practitioners, NewsAPI provides what web search engines cannot: structured, filterable, API-accessible news intelligence. Instead of scraping search results, investigators can programmatically query news content by keyword, source, language, country, and date range. This structured approach enables automated news monitoring pipelines that continuously scan for mentions of investigation targets, companies, or topics of interest. The ability to filter by specific trusted sources eliminates the noise that plagues general web searches, while the structured JSON response format enables automated processing, sentiment analysis, and trend detection.

NewsAPI complements the broader media intelligence provided by [GDELT](@/osint/gdelt.md) by offering more targeted, source-specific queries. While GDELT processes the entire global media landscape with event coding and tone analysis, NewsAPI provides precise queries against specific publications and categories. Together, they form a comprehensive media intelligence capability: GDELT for breadth and trend analysis, NewsAPI for depth and targeted monitoring. For Czech-specific news monitoring, NewsAPI coverage can be supplemented with direct Czech media monitoring through specialized adapters.

## Data Sources and Coverage

NewsAPI aggregates content from a vast network of news sources spanning every major media market globally. Sources are categorized by country, language, and content category, enabling precise filtering for intelligence collection.

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **Articles** | Title, description, content snippet, URL, image | 80,000+ sources |
| **Sources** | News source metadata and categorization | 54 countries |
| **Authors** | Article author names when available | Variable by source |
| **Publication Date** | ISO 8601 timestamps | Precise temporal filtering |
| **Categories** | Business, entertainment, health, science, sports, technology | 7 categories |
| **Languages** | Supported language filtering | 14 languages |
| **Countries** | Country-specific source filtering | 54 countries |
| **Domains** | Filter by specific publication domains | Any indexed domain |

### API Endpoints

| Endpoint | Purpose | Best For |
|----------|---------|----------|
| `/top-headlines` | Breaking news by country and category | [Real-time monitoring](@/capabilities/real-time-monitoring.md) |
| `/everything` | Historical search with full-text matching | Investigation research |
| `/sources` | Source metadata and availability | Source analysis and selection |

### Source Quality Tiers

NewsAPI sources vary significantly in editorial standards, factual accuracy, and relevance for intelligence work. The Prismatic Platform maintains an internal source quality classification that weights articles from established news agencies (Reuters, AP, AFP) higher than content from blogs or opinion sites. This classification feeds into confidence scoring for news-derived intelligence signals.

## Technical Architecture

The Prismatic Platform integrates NewsAPI through an asynchronous adapter architecture designed for both real-time monitoring and batch investigation workflows. The adapter implements request queuing with rate limit awareness, automatically distributing queries across the available daily quota based on priority levels.

The monitoring pipeline uses a configurable polling interval (default: 15 minutes for standard monitoring, 5 minutes for high-priority entities) to check for new articles matching monitored search terms. Deduplication logic prevents the same article from triggering multiple alerts when it matches overlapping search criteria.

For investigation workflows, the adapter supports temporal windowing that automatically segments long date range queries into API-compatible chunks, aggregating results across multiple API calls transparently. This enables analysts to search across months of historical articles without manual pagination management.

Article content is normalized into the Prismatic entity schema, with named entity recognition (NER) applied to extract mentioned organizations, persons, and locations. Extracted entities are automatically linked to existing Prismatic entity records, creating a news intelligence graph that connects articles to investigation subjects.

## API Integration

NewsAPI provides targeted news intelligence for the Prismatic platform's entity monitoring and adverse media screening pipelines.

```elixir
# Search for articles by keyword
{:ok, articles} = NewsApi.search("Prismatic cybersecurity",
  sort_by: :relevancy,
  language: :en,
  from: ~D[2025-01-01]
)
# => %{
#   total_results: 42,
#   articles: [
#     %{title: "Czech Startup Prismatic Launches AI OSINT Platform",
#       description: "New platform combines 121 intelligence sources...",
#       source: %{id: "techcrunch", name: "TechCrunch"},
#       author: "John Reporter",
#       url: "https://techcrunch.com/2025/06/15/prismatic-launch",
#       published_at: ~U[2025-06-15 10:00:00Z],
#       content: "Prague-based Prismatic today announced..."}
#   ]
# }

# Get top headlines by category and country
{:ok, headlines} = NewsApi.top_headlines(
  country: :cz,
  category: :technology
)

# Search specific sources
{:ok, reuters} = NewsApi.search("sanctions Russia",
  sources: ["reuters", "bbc-news", "bloomberg"],
  sort_by: :published_at
)

# Monitor for entity mentions
{:ok, mentions} = NewsApi.search("\"Example Corp\" OR \"Example Corporation\"",
  language: :en,
  from: Date.add(Date.utc_today(), -7),
  sort_by: :published_at
)

# Get available sources for a country
{:ok, sources} = NewsApi.sources(country: :cz, language: :en)

# Search by domain
{:ok, domain_news} = NewsApi.search("cybersecurity",
  domains: ["wired.com", "arstechnica.com", "therecord.media"]
)
```

### Adverse Media Screening Pipeline

```elixir
defmodule PrismaticCompliance.AdverseMedia.NewsScreener do
  @moduledoc """
  Screens entities against global news sources for adverse media
  as part of KYC/AML compliance workflows.
  """

  def screen_entity(entity_name) do
    adverse_keywords = [
      "fraud", "investigation", "indicted", "sanctions", "money laundering",
      "corruption", "arrested", "charged", "fined", "violation"
    ]

    queries = Enum.map(adverse_keywords, fn keyword ->
      Task.async(fn ->
        NewsApi.search("\"#{entity_name}\" #{keyword}",
          sort_by: :relevancy,
          language: :en,
          from: Date.add(Date.utc_today(), -365)
        )
      end)
    end)

    results = Task.await_many(queries, 30_000)

    adverse_articles =
      results
      |> Enum.zip(adverse_keywords)
      |> Enum.flat_map(fn {{:ok, data}, keyword} ->
        Enum.map(data.articles, &Map.put(&1, :adverse_keyword, keyword))
      end)
      |> Enum.uniq_by(& &1.url)

    {:ok, %{
      entity: entity_name,
      adverse_articles: length(adverse_articles),
      articles: Enum.take(adverse_articles, 20),
      risk_level: classify_risk(adverse_articles),
      screened_at: DateTime.utc_now()
    }}
  end

  defp classify_risk(articles) do
    cond do
      length(articles) > 10 -> :high
      length(articles) > 3 -> :medium
      length(articles) > 0 -> :low
      true -> :clear
    end
  end
end
```

## Use Cases

### Adverse Media Screening
- Automated scanning of news sources for negative entity coverage as part of compliance workflows
- KYC/AML compliance requiring structured media background checks with audit trail generation
- Cross-reference news findings with [OFAC](@/osint/ofac.md) and [EU Sanctions](@/osint/eu-sanctions.md) for comprehensive risk assessment
- Regulatory compliance with AML directives requiring adverse media monitoring

### Brand and Reputation Monitoring
- Track company and product mentions across global news sources with real-time alerting
- Compare coverage volume and sentiment against competitors for market intelligence
- Alert on breaking news mentions of monitored entities with configurable priority levels
- Historical trend analysis of media coverage patterns for strategic communications

### Investigative Research
- Build news dossiers on investigation targets from structured data with temporal context
- Track event timelines through chronological article search across multiple sources
- Combine with [GDELT](@/osint/gdelt.md) for comprehensive media intelligence covering both depth and breadth
- Source triangulation by analyzing how different outlets report the same events

### Sector Intelligence
- Monitor industry-specific news for emerging trends and regulatory developments
- Track competitor activities through systematic news collection and analysis
- Identify market-moving events in specific sectors for investment intelligence

## Data Quality

NewsAPI data quality varies by source, making source-level quality assessment essential for intelligence applications. The structured API response format ensures consistent data handling, but the underlying content quality depends entirely on the originating news source.

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Source Breadth** | Excellent -- 80,000+ sources worldwide | Comprehensive global coverage |
| **Structured Access** | Excellent -- consistent JSON API responses | Machine-readable format |
| **Content Depth** | Variable -- content snippets, not full articles | Full content on Business tier |
| **Timeliness** | High -- articles indexed within minutes of publication | Near real-time |
| **Source Authority** | Variable -- ranges from major wire services to blogs | Prismatic source classification applied |
| **Historical Depth** | Limited on free tier (1 month); extended on paid tiers | Plan-dependent |

### Rate Limits and Access

| Tier | Requests/Day | Features |
|------|-------------|----------|
| **Free** | 100 | Headlines + everything, 1 month history |
| **Developer** | 250 | Extended history, no watermark |
| **Business** | 1,000 | Full content, webhooks, commercial use |
| **Enterprise** | Custom | Custom sources, dedicated support |

Authentication requires an API key for all requests, passed via `apiKey` query parameter or `X-Api-Key` header.

## Platform Integration

Within the Prismatic Platform, NewsAPI serves as a primary structured news intelligence source. The adapter normalizes article data into the Prismatic entity schema, enabling automatic correlation between news mentions and existing entity records. Named entity recognition (NER) extracts organizations, persons, and locations from article content, creating linkages in the entity graph.

NewsAPI data feeds into multiple platform workflows: adverse media screening for compliance, brand monitoring for reputation management, and investigative research for intelligence production. Each workflow applies different processing pipelines to the raw article data, extracting domain-specific signals and generating appropriate risk indicators.

The news intelligence pipeline integrates with [Social Searcher](@/osint/social-searcher.md) for complementary social media coverage, creating a unified media intelligence layer that spans both traditional news and social platforms.

## NABLA Compliance

NewsAPI integration adheres to NABLA epistemic framework requirements with particular attention to the Source Independence and Signal Plurality axioms. The platform's internal source quality classification ensures that intelligence derived from multiple independent news sources receives higher confidence than signals based on single-source reporting. Articles from wire services (Reuters, AP, AFP) are weighted as more authoritative than blog posts or opinion pieces.

The Provenance Mandatory axiom is satisfied through full attribution of every news-derived signal to its source article, including publication, author, URL, and timestamp. Time Decay is naturally handled by the temporal nature of news data, with recency weighting applied to ensure that current reporting has greater influence on risk assessments than historical coverage.

Contradiction Preservation is maintained when different news sources provide conflicting accounts of the same event, with both perspectives preserved in the intelligence record and flagged for analyst review.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| **Single search query** | < 1s | 300-700ms |
| **Adverse media screen (10 keywords)** | < 30s | 10-20s |
| **Headline fetch** | < 500ms | 200-400ms |
| **Source list retrieval** | < 500ms | 100-300ms |
| **Monitoring cycle (50 entities)** | < 5min | 2-3min |
| **Daily quota utilization** | < 90% | 60-80% |

The adapter implements intelligent quota management, prioritizing high-priority entity monitoring over routine background scanning. Rate limit awareness prevents quota exhaustion by queuing lower-priority requests when daily limits approach.

## Related Resources

- [GDELT](@/osint/gdelt.md) - Global-scale media monitoring and event analysis
- [Social Searcher](@/osint/social-searcher.md) - Social media monitoring for complementary coverage
- [Crunchbase](@/osint/crunchbase.md) - Company intelligence to contextualize news
- [OFAC](@/osint/ofac.md) - Sanctions correlation with news signals
- [EU Sanctions](@/osint/eu-sanctions.md) - European sanctions for compliance context
- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Adverse media in [security rating](@/glossary/security-rating.md)s

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)