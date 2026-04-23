+++
title = "twitter-x-intelligence-specialist"
weight = 404
[extra]
domain = "twitter/x"
level = "L3"
description = "Specialized intelligence gathering and analysis"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "garden", "kuzudb", "no-doubts", "seadf", "telemetry"]
domain_normalized = "social"
content_version = "1.0.0"
last_enhanced = "2026-02-01"
word_count = 134
quality_score = 31
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["twitter-x-intelligence-specialist", "Specialized", "agents", "agent", "Prismatic Platform", "Twitter", "High", "Intelligence Specialist", "Very High", "Graph"]
tags = ["agents", "agent", "twitter-x-intelligence-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "twitter-x-intelligence-specialist - Prismatic Platform"
+++

## Overview

The Twitter/X Intelligence Specialist is an L3 agent operating in the **Twitter/X** platform domain of the Prismatic Platform. This agent specializes in intelligence gathering and analysis from the Twitter/X social media platform, extracting actionable intelligence from tweets, reply chains, quote tweets, user networks, trending topics, and the platform's unique real-time information ecosystem. Twitter/X remains one of the most valuable open-source intelligence platforms due to its predominantly public content model, real-time nature, and the breadth of participants ranging from individual users to government officials and corporate accounts.

Unlike platforms with algorithm-driven content curation (such as TikTok), Twitter/X provides a more transparent information flow where content propagation can be directly traced through retweets, quotes, and reply chains. This transparency makes Twitter/X particularly valuable for network analysis, influence mapping, and narrative tracking. The Twitter/X Intelligence Specialist exploits these characteristics with specialized analysis techniques optimized for the platform's unique data structures.

This agent operates as part of the social intelligence domain within the platform's 434-strong autonomous agent ecosystem, feeding intelligence products to the [Social Media Network Analyst](@/agents/social-media-network-analyst.md) for cross-platform synthesis under [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic standards.

## Intelligence Collection Capabilities

| Capability | Description | Data Type | Volume |
|-----------|-------------|-----------|--------|
| **Tweet Analysis** | Content text, media, metadata, engagement | Text + Structured | Very High |
| **Follower/Following Networks** | Social graph structure and evolution | Graph | High |
| **Reply Chain Analysis** | Conversation thread structure and sentiment | Text + Graph | High |
| **Retweet Cascades** | Information propagation patterns | Time-series + Graph | Very High |
| **Hashtag Tracking** | Topic networks, co-occurrence, trending | Graph | Very High |
| **List Membership** | Curated account groupings by topic | Structured | Medium |
| **Space Participation** | Audio space attendance and speaker patterns | Structured | Low |

## Twitter/X-Specific Analysis Techniques

### Network Topology Analysis

Twitter/X's follower-following relationship creates a directed graph that reveals influence flows, community structures, and coordination patterns.

```elixir
defmodule PrismaticAgents.TwitterXIntelligenceSpecialist do
  @moduledoc """
  L3 Twitter/X Intelligence Specialist agent.
  Specialized intelligence gathering from Twitter/X platform.
  """

  use GenServer
  require Logger

  @collection_interval_ms :timer.minutes(30)

  defstruct [
    :active_collections,
    :follower_graph,
    :tweet_stream,
    :hashtag_networks,
    :last_collection_at,
    status: :collecting
  ]

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @impl true
  def init(_opts) do
    schedule_collection()
    {:ok, %__MODULE__{follower_graph: %{}, hashtag_networks: %{}, tweet_stream: []}}
  end

  @impl true
  def handle_info(:collect, state) do
    tweets = collect_targeted_tweets(state.active_collections)
    networks = update_follower_networks(tweets, state.follower_graph)
    hashtags = analyze_hashtag_co_occurrence(tweets)

    :telemetry.execute(
      [:prismatic, :agents, :twitter_x, :collection_cycle],
      %{tweets_collected: length(tweets), networks_updated: map_size(networks)},
      %{hashtags_tracked: map_size(hashtags)}
    )

    schedule_collection()

    {:noreply, %{state |
      follower_graph: networks,
      hashtag_networks: Map.merge(state.hashtag_networks, hashtags),
      tweet_stream: tweets ++ Enum.take(state.tweet_stream, 999),
      last_collection_at: DateTime.utc_now()
    }}
  end

  defp analyze_hashtag_co_occurrence(tweets) do
    tweets
    |> Enum.flat_map(fn tweet ->
      hashtags = extract_hashtags(tweet.text)
      for h1 <- hashtags, h2 <- hashtags, h1 < h2, do: {h1, h2}
    end)
    |> Enum.frequencies()
  end
end
```

### Influence Propagation Tracking

Twitter/X's retweet and quote mechanisms create traceable information propagation chains that reveal how narratives spread through networks.

| Propagation Type | Mechanism | Analysis Value |
|-----------------|-----------|---------------|
| **Retweet** | Direct content amplification | Reach measurement |
| **Quote Tweet** | Commentary-augmented sharing | Narrative evolution |
| **Reply Chain** | Conversational engagement | Sentiment analysis |
| **Mention** | Direct account reference | Network connection |
| **Bookmark** | Private content saving | (Not publicly visible) |

### Bot and Coordination Detection

| Detection Signal | Indicator | Confidence |
|-----------------|-----------|------------|
| **Posting frequency** | > 100 tweets/day sustained | High |
| **Temporal regularity** | Exact interval posting patterns | High |
| **Content similarity** | Near-identical text across accounts | Very High |
| **Synchronized following** | Mass follow/unfollow coordination | High |
| **API signature** | Non-standard client identifiers | Medium |
| **Account age vs activity** | New accounts with high activity | Medium |

## Intelligence Product Types

| Product | Description | Frequency | Consumers |
|---------|-------------|-----------|-----------|
| **Network Influence Map** | Directed graph of influence relationships | Daily | Investigators |
| **Narrative Tracking Report** | Hashtag and topic propagation analysis | Hourly | Analysts |
| **Bot Detection Alert** | Identified automated account clusters | Real-time | Security teams |
| **Account Profile** | Comprehensive account behavioral analysis | On-demand | Case officers |
| **Sentiment Report** | Topic-level sentiment aggregation | Hourly | Strategic command |
| **Coordination Alert** | Detected coordinated inauthentic behavior | Real-time | Security teams |

## Graph Storage

Twitter/X intelligence data is stored in [KuzuDB](@/glossary/kuzudb.md) for efficient social graph analysis, enabling complex queries such as shortest path analysis between accounts and community detection.

| Node Type | Attributes | Connections |
|-----------|------------|-------------|
| **Account** | ID, username, bio, follower count, created date | Follows, mentions, replies to |
| **Tweet** | ID, text, timestamp, engagement metrics | Created by, replies to, quotes, retweets |
| **Hashtag** | Tag text, first seen, usage count | Tagged in, co-occurs with |
| **List** | Name, owner, member count | Contains, owned by |

## API Rate Limit Management

Twitter/X's API rate limits require careful management to maximize intelligence collection within quota constraints. The Twitter/X Intelligence Specialist implements a sophisticated rate limit management system that dynamically allocates API quota across different collection priorities.

| API Endpoint | Rate Limit | Strategy | Priority Allocation |
|-------------|-----------|----------|---------------------|
| **Search** | 450/15 min | Priority-based queuing | 60% active investigations, 40% monitoring |
| **User Lookup** | 300/15 min | Batch requests | On-demand with caching |
| **Followers** | 15/15 min | Staggered collection | Round-robin across targets |
| **Timeline** | 1500/15 min | Continuous monitoring | High-priority accounts first |
| **Spaces** | 300/15 min | Event-driven polling | Active spaces only |

### Rate Limit Optimization Strategy

```elixir
defmodule PrismaticAgents.TwitterXIntelligenceSpecialist.RateLimiter do
  @moduledoc """
  Adaptive rate limit manager for Twitter/X API.
  Dynamically allocates quota across collection priorities.
  """

  @spec request_with_quota(atom(), fun()) :: {:ok, term()} | {:rate_limited, non_neg_integer()}
  def request_with_quota(endpoint, request_fn) do
    case check_remaining_quota(endpoint) do
      {:ok, remaining} when remaining > 0 ->
        result = request_fn.()
        decrement_quota(endpoint)
        {:ok, result}

      {:ok, 0} ->
        reset_time = get_reset_time(endpoint)
        {:rate_limited, reset_time}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp check_remaining_quota(endpoint) do
    case :ets.lookup(:twitter_rate_limits, endpoint) do
      [{^endpoint, remaining, _reset}] -> {:ok, remaining}
      [] -> {:ok, default_limit(endpoint)}
    end
  end

  defp default_limit(:search), do: 450
  defp default_limit(:user_lookup), do: 300
  defp default_limit(:followers), do: 15
  defp default_limit(:timeline), do: 1500
  defp default_limit(_), do: 100
end
```

## Narrative Tracking Methodology

Beyond individual tweet and account analysis, the Twitter/X Intelligence Specialist tracks narrative evolution -- how stories, claims, and talking points develop, spread, and mutate as they propagate through the platform. Narrative tracking provides strategic intelligence about information campaigns, organic discourse evolution, and the emergence of new themes.

| Narrative Metric | Measurement | Intelligence Application |
|-----------------|-------------|--------------------------|
| **Narrative Origin** | First observed tweet containing key phrases | Source attribution |
| **Propagation Speed** | Rate of narrative adoption over time | Amplification assessment |
| **Mutation Rate** | Semantic drift from original framing | Organic vs coordinated evolution |
| **Cross-Community Spread** | Number of distinct communities reached | Narrative penetration depth |
| **Counter-Narrative Emergence** | Detection of opposing narratives | Discourse dynamics analysis |
| **Narrative Decay** | Time from peak engagement to baseline | Staying power assessment |

## NABLA Infinity Compliance

| Axiom | Twitter/X-Specific Application | Enforcement |
|-------|-------------------------------|-------------|
| **Signal Plurality** | Cross-reference with other platforms before attributing | HARD |
| **Time Decay** | Tweet relevance decays; 48-hour primary window | HARD |
| **Provenance Mandatory** | Every data point traced to specific tweet ID and timestamp | HARD |
| **Contradiction Preservation** | Conflicting account signals preserved with context | HARD |
| **Source Independence** | Distinguish organic vs amplified content signals | SOFT |

## Operational Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| **Collection cycle** | Every 30 minutes | Data gathering frequency |
| **Tweets analyzed/cycle** | 1,000+ | Analysis throughput |
| **Account graph size** | 25,000+ nodes | Network coverage |
| **Bot detection accuracy** | >92% | Automated account identification |
| **Alert latency** | < 15 minutes | Time to coordination alert |

## Integration Points

- [**Intelligence Synthesis**](@/capabilities/intelligence-synthesis.md) -- Feeds Twitter/X intelligence to cross-platform analysis
- [**Telemetry Integration**](@/capabilities/telemetry-integration.md) -- Collection performance metrics
- [**AIAD Standard**](@/capabilities/aiad-standard.md) -- Full agent specification compliance

## Related Agents

- [**Social Media Network Analyst**](@/agents/social-media-network-analyst.md) -- Cross-platform intelligence synthesis hub
- [**TikTok Intelligence Specialist**](@/agents/tiktok-intelligence-specialist.md) -- Parallel social platform intelligence
- [**Siege Master Specialist**](@/agents/siege-master-specialist.md) -- Long-term persistent operations

## AIAD Specification Compliance

| AIAD Component | Status |
|----------------|--------|
| Agent specification file | Compliant |
| Behavioral rules | 14 rules defined |
| [Telemetry](@/glossary/telemetry.md) integration | Full coverage |
| [NM/ND doctrine](@/glossary/no-mercy.md) enforcement | Active |
| [SEADF](@/glossary/seadf.md) integration | Registered |

## Authority Level

**L3** - [Strategic Command](@/glossary/strategic-command.md) - Multi-domain coordination with authority over Twitter/X-specific intelligence collection and analysis operations.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)