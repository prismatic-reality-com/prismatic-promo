+++
title = "Prismatic OSINT Social Media"
weight = 34
[extra]
icon = "chat-bubble-left-right"
color = "pink"
description = "Social media OSINT adapters - profile discovery, sentiment analysis, and monitoring"
category = "OSINT"
files = "190"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1006
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "OSINT", "Social", "Media", "apps", "Prismatic Platform", "HARD", "Prismatic OSINT"]
tags = ["apps", "osint", "prismatic-osint-social-media", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic OSINT Social Media - Prismatic Platform"
+++

## Overview

Prismatic [OSINT](/glossary/osint/) Social Media provides adapters for social media intelligence collection and analysis across major platforms. The module supports profile discovery from identifiers (email, username, phone), content monitoring with real-time keyword alerting, sentiment analysis on public posts, and network mapping of connections and follower relationships. Social media intelligence occupies a unique position in the intelligence landscape because it captures both structured metadata (profile attributes, connection graphs, activity timestamps) and unstructured content (posts, comments, opinions) that reveal behavioral patterns invisible to purely technical intelligence sources.

All collection respects platform terms of service, rate limits, and applicable privacy regulations including [GDPR](/glossary/gdpr/). The module operates exclusively on publicly accessible data and implements configurable data minimization policies to collect only what is necessary for the intelligence objective. Source attribution is maintained throughout the pipeline so that every piece of intelligence can be traced back to its origin for [provenance verification](/glossary/provenance-mandatory/). The [NABLA](/glossary/nabla-infinity/) framework's source independence axiom is enforced by weighting intelligence from multiple independent platforms higher than conclusions drawn from a single platform, reducing the risk of manipulation through platform-specific disinformation campaigns.

The social media adapters integrate with the broader OSINT pipeline through the [Prismatic OSINT Core](/apps/prismatic-osint-core/) adapter [protocol](/glossary/protocol/), enabling social media signals to be correlated with technical intelligence from sources like [Shodan](/glossary/shodan/), [Censys](/glossary/censys/), and DNS records. When a social media profile mentions a server IP that also appears in infrastructure scans, the cross-domain correlation strengthens the intelligence picture with evidence from fundamentally independent source categories.

## Architecture

```
PrismaticOsintSocialMedia.Application
+-- PrismaticOsintSocialMedia.Supervisor (:one_for_one)
    +-- Platform Router (GenServer)
    |   +-- Query type classification
    |   +-- Platform selection and dispatch
    |   +-- Capability-based routing
    |
    +-- Platform Adapters (per-platform GenServers)
    |   +-- Twitter/X Adapter
    |   |   +-- OAuth2 authentication
    |   |   +-- Rate limit management (per-endpoint)
    |   |   +-- Streaming API integration
    |   |
    |   +-- LinkedIn Adapter
    |   |   +-- Public profile extraction
    |   |   +-- Professional network mapping
    |   |
    |   +-- GitHub Adapter
    |   |   +-- Repository activity analysis
    |   |   +-- Contribution network mapping
    |   |   +-- Technical skill profiling
    |   |
    |   +-- Custom Platform Adapter (extensible)
    |
    +-- Normalization Layer (Module)
    |   +-- Profile schema normalization
    |   +-- Content format standardization
    |   +-- Network graph unification
    |
    +-- Analysis Subsystem
        +-- Profile Resolver (cross-platform identity)
        +-- Content Analyzer (NLP + sentiment)
        +-- Network Mapper (graph construction)
```

```
Query Interface
       |
  Platform Router
       |
  +----+----+----+----+
  |         |         |         |
Twitter  LinkedIn  GitHub   Custom
Adapter  Adapter   Adapter  Adapter
  |         |         |         |
  +----+----+----+----+
       |
  Normalization Layer
       |
  +----+----+----+
  |         |         |
Profile   Content   Network
Resolver  Analyzer  Mapper
  |         |         |
  +----+----+----+
       |
  Intelligence Output
```

Each social platform has a dedicated adapter that handles authentication, [rate limiting](/glossary/rate-limiting/), pagination, and response normalization. The Platform Router dispatches queries to the appropriate adapters based on the requested platforms and query type. Results pass through a normalization layer that produces uniform data structures regardless of source platform. All adapters implement the platform's OSINT provider [protocol](/glossary/protocol/) for consistent error handling, retry behavior, and credential management.

## Key Modules

| Module | Purpose |
|--------|---------|
| `PrismaticOsintSocialMedia` | Main API facade for social media intelligence operations |
| `PrismaticOsintSocialMedia.Application` | [OTP](/glossary/otp/) application entry point with supervision tree |

## Key Features

### Profile Intelligence

Profile discovery begins with a single identifier -- an email address, username, or phone number -- and systematically searches across configured platforms to build a unified cross-platform identity profile. Each platform adapter extracts available metadata (display name, bio, location, creation date, follower counts, activity frequency) and normalizes it to a common schema. The Profile Resolver then correlates results across platforms using deterministic matching (shared identifiers) and probabilistic matching (name similarity, shared connections, temporal activity patterns) to produce a consolidated entity profile with [confidence scoring](/glossary/confidence-scoring/).

- Cross-platform profile discovery from email addresses, usernames, or phone numbers
- Profile metadata extraction and normalization to a unified schema
- Activity pattern analysis -- posting frequency, active hours, content themes
- Connection and follower network mapping with relationship strength scoring

### Content Analysis

Content analysis applies NLP pipelines to public posts, comments, and replies collected from monitored platforms. The analysis extracts sentiment (positive, negative, neutral with intensity scoring), identifies named entities mentioned in content, detects language and provides translation for multilingual intelligence, and classifies content by topic categories relevant to the intelligence objective.

- Sentiment analysis on posts, comments, and replies using configurable NLP pipelines
- Topic extraction and trending analysis within monitored entity contexts
- Language detection with automatic translation for multilingual intelligence
- Temporal activity pattern detection for behavioral profiling

### Monitoring

Continuous monitoring tracks entity mentions, brand references, and keyword appearances across configured platforms in near-real-time. The monitoring engine supports configurable alert thresholds for sentiment shifts, unusual activity spikes, and specific threat keywords. Geolocation-based content filtering enables region-specific intelligence collection for investigations with geographic constraints.

- Real-time keyword and entity mention monitoring across configured platforms
- Brand reputation tracking with sentiment trend visualization
- Threat and risk signal detection (leaked credentials, insider threats, targeting)
- Geolocation-based content filtering for region-specific intelligence

### Network Mapping

Network mapping constructs social relationship graphs by traversing follower and following lists, extracting interaction patterns (mentions, replies, retweets), and computing relationship strength scores based on interaction frequency and reciprocity. The resulting graphs are stored in [KuzuDB](/apps/prismatic-storage-kuzudb/) as social relationship edges that complement corporate ownership and infrastructure topology from other intelligence domains.

## Configuration

```elixir
config :prismatic_osint_social_media,
  # Platform configuration
  active_platforms: [:twitter, :linkedin, :github],

  # Rate limiting (per platform)
  rate_limits: %{
    twitter: %{requests_per_15min: 450, search_per_15min: 180},
    linkedin: %{requests_per_day: 100},
    github: %{requests_per_hour: 5000}
  },

  # Content analysis
  sentiment_engine: :nlp_pipeline,
  language_detection: true,
  auto_translate: false,

  # Monitoring
  monitoring_interval: :timer.minutes(5),
  alert_channels: [:pubsub, :webhook],

  # GDPR compliance
  data_minimization: true,
  retention_days: 90,
  pii_redaction: true
```

## API Reference

```elixir
# Cross-platform profile search from an email address
{:ok, profiles} = PrismaticOsintSocialMedia.find_profiles(
  email: "user@example.com"
)
# => {:ok, [%Profile{platform: :twitter, handle: "@user", ...}, ...]}

# Monitor entity mentions across platforms
{:ok, monitor} = PrismaticOsintSocialMedia.monitor(
  entity: "Example Corp",
  platforms: [:twitter, :linkedin],
  keywords: ["breach", "vulnerability", "lawsuit"],
  callback: &process_mention/1
)

# Sentiment analysis on collected posts
{:ok, sentiment} = PrismaticOsintSocialMedia.analyze_sentiment(posts)
# => {:ok, %{overall: :negative, score: -0.62, distribution: %{positive: 12, neutral: 8, negative: 30}}}

# Network mapping for a discovered profile
{:ok, network} = PrismaticOsintSocialMedia.map_network("@target_user",
  platform: :twitter,
  depth: 2,
  limit: 500
)
# => {:ok, %Network{nodes: 342, edges: 1_205, communities: 5}}

# GitHub technical skill profiling
{:ok, skills} = PrismaticOsintSocialMedia.github_profile("username")
# => {:ok, %{languages: %{"Elixir" => 45, "Python" => 30}, repos: 23, contributions: 1247}}
```

## Testing

```bash
# Run all social media OSINT tests
cd apps/prismatic_osint_social_media && mix test

# Run with coverage
mix test --cover

# Run platform adapter tests
mix test test/prismatic_osint_social_media/adapters

# Run profile resolution tests
mix test test/prismatic_osint_social_media/profile_resolver_test.exs

# Run sentiment analysis tests
mix test test/prismatic_osint_social_media/content_analyzer_test.exs
```

Testing covers platform adapter authentication and rate limit compliance, profile normalization accuracy across platform-specific schemas, cross-platform identity resolution with both deterministic and probabilistic matching, sentiment analysis accuracy against labeled datasets, and network graph construction correctness. Mock adapters simulate platform API responses for deterministic testing without external dependencies.

## Integration Points

| Integrates With | Purpose |
|----------------|---------|
| [Prismatic OSINT Core](/apps/prismatic-osint-core/) | Adapter protocol and source registry integration |
| [Prismatic Tracking](/apps/prismatic-tracking/) | Continuous entity monitoring with social media activity correlation |
| [Prismatic Storage KuzuDB](/apps/prismatic-storage-kuzudb/) | Social network graph storage as relationship edges |
| [Prismatic Storage Meilisearch](/apps/prismatic-storage-meilisearch/) | Full-text search across historical social media intelligence |
| [Prismatic Modalities](/apps/prismatic-modalities/) | Verbal and cognitive modality analysis from social media content |
| [Prismatic Manipulation](/apps/prismatic-manipulation/) | Social engineering detection using social media behavioral baselines |

## NABLA Compliance

| NABLA Axiom | Enforcement | Implementation |
|-------------|------------|----------------|
| Signal Plurality | HARD -- cross-platform confirmation required for profile identity claims | Minimum 2 platform matches before cross-platform identity established |
| Source Independence | HARD -- per-platform intelligence weighted independently | Platform-specific manipulation does not contaminate cross-platform conclusions |
| Provenance Mandatory | HARD -- every intelligence item traced to specific platform and content ID | Source URL, platform API response ID, and collection timestamp per item |
| Contradiction Preservation | SOFT -- conflicting profiles across platforms preserved | Platform-specific discrepancies surfaced as intelligence findings |
| Time Decay | HARD -- social media content carries temporal relevance | Post age and account activity recency factor into confidence scoring |

## Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Profile search (single platform) | 200-500ms | Including API call and normalization |
| Cross-platform profile resolution | 1-3s | Parallel platform queries + correlation |
| Sentiment analysis (batch) | < 100ms | Per 50 posts |
| Network mapping (depth 1) | 2-5s | Single-level follower traversal |
| Network mapping (depth 2) | 15-30s | Two-level traversal with rate limiting |
| Monitoring check cycle | 5 min | Configurable per entity |

## Related Resources

- [Prismatic OSINT Core](/apps/prismatic-osint-core/) -- Adapter protocol and source registry
- [Prismatic Modalities](/apps/prismatic-modalities/) -- Multi-modal intelligence fusion from social content
- [Prismatic Storage KuzuDB](/apps/prismatic-storage-kuzudb/) -- Social network graph storage
- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Cross-platform social intelligence fusion
- [Real-Time Monitoring](/capabilities/real-time-monitoring/) -- Continuous social media monitoring
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Source independence weighting for multi-platform intelligence

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)