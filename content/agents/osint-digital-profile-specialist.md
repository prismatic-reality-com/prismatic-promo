+++
title = "osint-digital-profile-specialist"
weight = 282
[extra]
domain = "osint"
level = "L3"
description = "5 Core Lean4 theorems guaranteeing safe evolution"
category = "agent"
status = "Active"
agent_count = 1
academic_tier = "overview"
glossary_terms = ["osint", "easm", "entity-resolution", "nabla-infinity", "trinity-gate", "aiad", "garden", "kuzudb", "attack-surface", "no-doubts"]
domain_normalized = "osint"
content_version = "2.0.0"
last_enhanced = "2026-02-16"
word_count = 2100
quality_score = 85
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["osint-digital-profile-specialist", "Core", "Lean4", "agents", "agent", "Prismatic Platform", "LinkedIn", "GitHub", "WHOIS"]
tags = ["agents", "agent", "osint-digital-profile-specialist", "prismatic"]
see_also = ["commands", "apps", "glossary", "capabilities"]
image = "/images/sections/agents.png"
image_alt = "osint-digital-profile-specialist - Prismatic Platform"
+++

## Overview

The osint-digital-profile-specialist operates as an L3 [Strategic Command](/glossary/strategic-command/) authority within the Prismatic Platform's [OSINT](/glossary/osint/) domain, responsible for constructing comprehensive digital profiles of target entities by aggregating, correlating, and analyzing publicly available digital footprints across internet platforms, social media, professional networks, domain registrations, and code repositories. This agent builds multi-dimensional entity profiles that reveal online presence patterns, communication behaviors, technical capabilities, and relationship networks -- all from publicly accessible sources.

Built on the [AIAD](/glossary/aiad/) standard and integrated with the platform's [entity resolution](/glossary/entity-resolution/) engine, the digital profile specialist links disparate online identities to resolved entities through username correlation, email pivoting, profile image matching, and behavioral fingerprinting. All profile constructions comply with [NABLA Infinity](/glossary/nabla-infinity/) axioms: every identity linkage requires evidence from at least two independent sources, and all attributions carry quantified confidence scores that pass [Trinity Gate](/glossary/trinity-gate/) validation.

## Operational Domain

The digital profiling domain spans all publicly accessible internet platforms where entities maintain digital presences. The agent collects and correlates data from social media platforms, professional networks, code hosting services, domain registration records, certificate transparency logs, public forums, and blog platforms. Profile construction follows a structured methodology that begins with seed identifiers (names, emails, usernames) and expands outward through platform-specific search APIs and cross-reference techniques.

| Profile Dimension | Sources | Intelligence Value |
|------------------|---------|-------------------|
| Professional Identity | LinkedIn, company websites, conferences | Career trajectory, affiliations |
| Technical Footprint | GitHub, GitLab, Stack Overflow | Technical capabilities, projects |
| Social Presence | Twitter/X, Facebook, Instagram | Communication patterns, interests |
| Domain Ownership | WHOIS, DNS records, certificate logs | Infrastructure ownership, hosting |
| Communication | Email headers, forum posts, mailing lists | Contact patterns, community ties |
| Geographic Indicators | Geotagged content, timezone analysis | Location history, travel patterns |

## Key Capabilities

- **Username correlation** -- Cross-references usernames across platforms to identify accounts likely belonging to the same entity, using string similarity, registration timing, and profile content correlation
- **Email pivot analysis** -- Traces email addresses through breach databases, WHOIS records, and platform registrations to discover linked accounts and alternate identities
- **Profile image matching** -- Compares profile images across platforms using perceptual hashing to identify accounts sharing the same or similar photographs
- **Behavioral fingerprinting** -- Analyzes posting patterns, writing style, timezone activity, and language use to correlate anonymous accounts with known identities
- **[Autonomous operation](/capabilities/autonomous-self-healing/)** with self-directed profile expansion cycles that discover new linked accounts
- **[Telemetry integration](/capabilities/telemetry-integration/)** publishing profile completeness scores, source coverage metrics, and entity resolution confidence

## Digital Profile Construction

```elixir
defmodule Prismatic.OSINT.DigitalProfiler do
  @moduledoc """
  Constructs comprehensive digital profiles by aggregating and
  correlating publicly available digital footprints across platforms.
  """

  alias Prismatic.OSINT.{PlatformAdapter, EntityMatcher, ProfileAggregator}

  @platforms [:linkedin, :github, :twitter, :whois, :certificate_logs,
              :stackoverflow, :forum_search, :blog_search]

  @type profile :: %{
    entity_id: String.t(),
    identities: [identity()],
    platforms: map(),
    confidence: float(),
    completeness: float(),
    last_updated: DateTime.t()
  }

  @spec build_profile(seed_identifiers :: map()) :: {:ok, profile()} | {:error, term()}
  def build_profile(seeds) do
    initial_identities = extract_seed_identities(seeds)

    discovered =
      @platforms
      |> Task.async_stream(fn platform ->
        PlatformAdapter.search(platform, initial_identities)
      end, timeout: 30_000)
      |> Enum.flat_map(fn
        {:ok, {:ok, results}} -> results
        _ -> []
      end)

    with {:ok, resolved} <- EntityMatcher.resolve(initial_identities, discovered),
         {:ok, profile} <- ProfileAggregator.build(resolved) do
      emit_profile_telemetry(profile)
      {:ok, profile}
    end
  end

  @spec expand_profile(profile(), keyword()) :: {:ok, profile()} | {:error, term()}
  def expand_profile(existing_profile, opts \\ []) do
    new_seeds = extract_expansion_seeds(existing_profile)
    depth = Keyword.get(opts, :depth, 1)

    if depth > 0 do
      case build_profile(new_seeds) do
        {:ok, expanded} ->
          merged = ProfileAggregator.merge(existing_profile, expanded)
          expand_profile(merged, depth: depth - 1)

        error -> error
      end
    else
      {:ok, existing_profile}
    end
  end

  defp emit_profile_telemetry(profile) do
    :telemetry.execute(
      [:prismatic, :osint, :digital_profile, :built],
      %{platforms: map_size(profile.platforms),
        identities: length(profile.identities),
        confidence: profile.confidence},
      %{entity_id: profile.entity_id}
    )
  end
end
```

## Profile Confidence Scoring

| Confidence Level | Score Range | Evidence Required |
|-----------------|-------------|-------------------|
| Confirmed | 0.90 - 1.00 | 3+ independent sources with matching unique identifiers |
| High Confidence | 0.75 - 0.89 | 2+ independent sources with strong correlation |
| Moderate Confidence | 0.50 - 0.74 | 2 sources with partial correlation or 1 source with unique ID |
| Low Confidence | 0.25 - 0.49 | Single source with non-unique identifiers |
| Unverified | 0.00 - 0.24 | Speculative linkage, requires further investigation |

## Authority Level

**L3** - [Strategic Command](/glossary/strategic-command/) - Multi-domain coordination with authority to orchestrate cross-platform digital profile collection and publish entity intelligence products.

## Command Interface

| Command | Description | Authority |
|---------|-------------|-----------|
| `/digital-profile build` | Construct digital profile from seed identifiers | L3+ |
| `/digital-profile expand` | Expand existing profile with deeper platform searches | L3+ |
| `/digital-profile monitor` | Set up continuous monitoring for profile changes | L3+ |

## Coordination

| Agent | Relationship |
|-------|-------------|
| [linkedin-intelligence-specialist](/agents/linkedin-intelligence-specialist/) | Provides professional network intelligence for profile enrichment |
| [reddit-intelligence-specialist](/agents/reddit-intelligence-specialist/) | Supplies community engagement patterns and interest mapping |
| [risk-intelligence-commander](/agents/risk-intelligence-commander/) | Digital profiles feed into entity risk assessment models |
| [reputation-risk-specialist](/agents/reputation-risk-specialist/) | Online presence patterns inform reputation risk analysis |

## KuzuDB Graph Storage

Digital profiles are stored in [KuzuDB](/glossary/kuzudb/) graph database structures, with entities as nodes and platform relationships as edges. This enables efficient traversal queries such as "find all entities connected to target X through shared GitHub organizations" or "identify entities with overlapping digital footprints across 3+ platforms." The graph model naturally represents the multi-hop relationship networks that digital profiling reveals.

## Identity Correlation Techniques

The digital profile specialist employs several analytical techniques to link online identities to resolved entities. Each technique has different strengths and produces different confidence levels.

### Username Correlation

Username correlation exploits the tendency for individuals to reuse similar usernames across platforms. The specialist computes string similarity scores between known usernames and discovered accounts using Levenshtein distance, Jaro-Winkler similarity, and substring containment. Usernames that share a common root pattern (e.g., "jsmith", "j.smith", "jsmith42") receive elevated correlation scores. The specialist also considers username creation timing -- accounts created within similar time periods across platforms receive higher correlation weight than accounts with years of separation.

### Email Pivot Analysis

Email addresses serve as powerful pivoting points because they frequently connect otherwise unrelated online presences. The specialist traces email addresses through domain registration WHOIS records, platform account recovery hints, breach databases (which may reveal email-username associations), and public-facing profile pages that display email contacts. An email address confirmed as associated with a target entity can unlock multiple platform accounts through password reset page probing (observing partial email confirmation) and cross-referencing.

### Behavioral Fingerprinting

When direct identifier correlation is insufficient, the specialist applies behavioral fingerprinting techniques. These include writing style analysis (vocabulary, sentence structure, punctuation patterns), activity timing analysis (posting hours that indicate timezone and daily routine), topical interest patterns (consistent engagement with specific subjects across platforms), and interaction network analysis (communication with the same set of contacts across platforms). Behavioral fingerprinting produces lower confidence scores than identifier-based correlation but can establish connections that are invisible to purely identifier-based methods.

### Profile Image Matching

The specialist uses perceptual image hashing to identify accounts sharing the same or similar profile photographs. Unlike cryptographic hashes that change completely with any modification, perceptual hashes produce similar values for visually similar images. This enables matching even when profile photos have been cropped, resized, or subjected to minor editing. Image matching is combined with reverse image search to identify all platforms where a specific photograph appears.

## Operational Security Considerations

Digital profiling operations must be conducted with awareness of operational signatures. Excessive querying of a single platform's search API may trigger rate limiting or account suspension. Sequential queries that follow an obvious investigative pattern may alert the target if they monitor their profile views (LinkedIn's "Who Viewed Your Profile" feature, for example). The specialist implements query distribution across time windows, uses multiple access vectors to avoid concentrating requests, and avoids features that leave visible traces of investigative interest.

## Enforcement

All digital profiling operations comply with the [NO MERCY](/glossary/no-mercy/) doctrine: no identity linkage is published without meeting minimum confidence thresholds, all profile attributions carry provenance chains to source platforms, and speculative connections are clearly labeled as unverified. The [NO DOUBTS](/glossary/no-doubts/) principle requires that entity resolution decisions are deterministic and reproducible. The [Trinity Gate](/glossary/trinity-gate/) validates that profile conclusions maintain structural consistency across all linked identities.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)