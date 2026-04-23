+++
title = "Threat Intelligence"
weight = 30
[extra]
description = "Structured, evidence-based knowledge about cyber threats, threat actors, their tactics, techniques, procedures, and indicators of compromise"
category = "osint"
related_terms = ["osint", "intelligence-fusion", "easm", "color-teams", "hawkeye", "nabla-infinity", "red-team", "blue-team", "attack-surface"]
domain = "cybersecurity"
complexity = "advanced"
maturity = "production"
platform_adoption = "core"
intelligence_levels = ["strategic", "tactical", "operational"]
data_standards = ["STIX", "TAXII", "MITRE-ATT&CK"]
source_types = ["osint", "commercial", "government", "internal", "community"]
collection_sources = ["OTX", "AbuseIPDB", "CertStream", "MISP", "NVD"]
indicator_types = ["ipv4", "ipv6", "domain", "url", "file_hash", "email", "certificate"]
elixir_modules = ["PrismaticIntelligence.ThreatIntel", "PrismaticIntelligence.Collector", "PrismaticIntelligence.Analyzer", "PrismaticIntelligence.ColorTeamIntegration"]
otp_patterns = ["GenServer", "Task.async_stream", "telemetry"]
nabla_compliance = "mandatory"
collection_interval = "15 minutes"
confidence_decay = true
enforcement_level = "mandatory"
documentation_quality = "academic"
last_updated = "2026-02-22"
version = "2.0.0"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1572
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Threat", "Intelligence", "Structured", "glossary", "osint", "Prismatic Platform", "EASM", "Blue Team", "Source", "IOCs"]
tags = ["glossary", "osint", "threat-intelligence", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Threat Intelligence - Prismatic Platform"
+++

## Definition and Overview

Threat Intelligence is evidence-based knowledge about existing or emerging cyber threats, encompassing information about threat actors, their tactics, techniques, and procedures (TTPs), indicators of compromise (IOCs), and attack infrastructure. It transforms raw threat data -- IP addresses, domain names, file hashes, vulnerability reports, dark web chatter -- into structured, actionable intelligence that informs defensive decisions, prioritizes security investments, and enables proactive threat mitigation.

The intelligence lifecycle follows a structured process: collection (gathering raw data from diverse sources), processing (normalizing, deduplicating, and structuring raw data), analysis (correlating data points to produce assessments), dissemination (distributing intelligence to consumers), and feedback (measuring intelligence effectiveness and adjusting collection priorities). Each stage adds value by transforming data into increasingly actionable forms -- a raw IP address becomes an indicator, which becomes part of a campaign attribution, which informs a defensive strategy.

Threat intelligence operates at three distinct levels. Strategic intelligence provides high-level assessments for executive decision-making -- industry threat trends, geopolitical risk factors, regulatory implications. Tactical intelligence describes specific TTPs used by threat actors, enabling defenders to configure detection rules and develop countermeasures. Operational intelligence provides real-time IOCs -- specific IP addresses, domains, file hashes, and behavioral signatures -- that can be directly consumed by security tools for automated detection and blocking.

Within the Prismatic Platform, threat intelligence feeds into multiple systems simultaneously. The [Color Teams](@/glossary/color-teams.md) use threat intelligence to inform [Red Team](@/glossary/red-team.md) adversarial scenarios and [Blue Team](@/glossary/blue-team.md) defensive postures. [Prismatic Perimeter](@/glossary/easm.md) incorporates threat intelligence into EASM assessments and security ratings. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework governs how threat intelligence is evaluated, requiring source independence, provenance tracking, and time decay awareness for all threat indicators. [HAWKEYE](@/glossary/hawkeye.md) (Visitor Intelligence) correlates visitor behavior with known threat actor patterns.

## Historical Context and Evolution

The discipline of threat intelligence in cybersecurity emerged from the military and intelligence community traditions of intelligence analysis. The US intelligence community's "intelligence cycle" -- direction, collection, processing, analysis, dissemination -- was adapted for cybersecurity applications in the early 2000s as organizations recognized that reactive incident response was insufficient against sophisticated adversaries.

The publication of Mandiant's APT1 report in 2013 marked a watershed moment, publicly attributing a sustained cyber espionage campaign to a specific Chinese military unit. This report demonstrated that threat intelligence could move beyond anonymous indicators to attribute campaigns to specific actors, understand their motivations, and predict their future behavior. The report established the model for threat intelligence reports that combine technical indicators with strategic analysis.

MITRE's ATT&CK framework, first published in 2013 and expanded significantly since, provided the industry's first comprehensive taxonomy of adversary behavior. By organizing observed techniques into a matrix of tactics (the adversary's goal) and techniques (how they achieve it), ATT&CK created a common language for describing threats that bridged the gap between strategic understanding and operational detection.

The STIX (Structured Threat Information Expression) and TAXII (Trusted Automated Exchange of Indicator Information) standards, developed by OASIS, provided the dominant data format and transport mechanism for sharing threat intelligence between organizations. STIX defines a JSON-based schema for representing threat objects (threat actors, campaigns, attack patterns, indicators, malware, tools), while TAXII defines the API protocol for exchanging STIX objects between producers and consumers.

The Prismatic Platform's approach to threat intelligence is distinguished by its integration with the NABLA Infinity epistemic framework, which applies formal rigor to intelligence analysis. Rather than accepting indicators at face value, the platform requires signal plurality (multiple independent sources), tracks provenance (source chain for every indicator), applies time decay (confidence diminishes with age), and preserves contradictions (conflicting assessments are maintained, not resolved prematurely).

## Technical Deep Dive

### Threat Intelligence Data Model

The platform models threat intelligence using STIX-aligned structures with additional NABLA compliance fields:

```elixir
defmodule PrismaticIntelligence.ThreatIntel do
  @moduledoc """
  Core threat intelligence data model.
  STIX-aligned structures for threat representation
  with NABLA Infinity compliance fields for epistemic
  rigor in intelligence analysis.
  """

  @type threat_actor :: %{
    id: String.t(),
    name: String.t(),
    aliases: [String.t()],
    type: :nation_state | :criminal | :hacktivist | :insider | :unknown,
    sophistication: :minimal | :intermediate | :advanced | :expert | :strategic,
    primary_motivation: atom(),
    target_sectors: [atom()],
    ttps: [ttp()],
    first_seen: DateTime.t(),
    last_seen: DateTime.t(),
    confidence: float(),
    sources: [source()]
  }

  @type ttp :: %{
    tactic: String.t(),
    technique: String.t(),
    procedure: String.t(),
    mitre_id: String.t(),
    platforms: [atom()],
    detection_coverage: float()
  }

  @type indicator :: %{
    id: String.t(),
    type: :ipv4 | :ipv6 | :domain | :url | :file_hash | :email | :certificate,
    value: String.t(),
    confidence: float(),
    severity: :critical | :high | :medium | :low,
    first_seen: DateTime.t(),
    last_seen: DateTime.t(),
    expiry: DateTime.t(),
    sources: [source()],
    related_actors: [String.t()],
    tags: [String.t()]
  }

  @type source :: %{
    name: String.t(),
    reliability: :a_reliable | :b_usually_reliable | :c_fairly_reliable |
                 :d_not_usually_reliable | :e_unreliable | :f_unknown,
    type: :osint | :commercial | :government | :internal | :community
  }
end
```

### Intelligence Collection Pipeline

The collection pipeline gathers indicators from multiple sources concurrently, normalizes them into the internal format, and enriches them with contextual metadata:

```elixir
defmodule PrismaticIntelligence.Collector do
  @moduledoc """
  Collects threat intelligence from multiple sources concurrently.
  Normalizes data into STIX-aligned internal format with NABLA
  provenance tracking. Each source operates on its own schedule
  with independent failure isolation.
  """

  use GenServer

  @collection_interval :timer.minutes(15)

  @sources [
    {PrismaticIntelligence.Sources.OTX, :osint, :timer.minutes(30)},
    {PrismaticIntelligence.Sources.AbuseIPDB, :community, :timer.hours(1)},
    {PrismaticIntelligence.Sources.CertStream, :osint, :timer.minutes(5)},
    {PrismaticIntelligence.Sources.MISPFeed, :community, :timer.hours(2)},
    {PrismaticIntelligence.Sources.NVD, :government, :timer.hours(6)}
  ]

  @impl true
  def init(_opts) do
    schedule_collection()
    {:ok, %{last_collection: nil, indicators_count: 0, sources_healthy: MapSet.new()}}
  end

  @impl true
  def handle_info(:collect, state) do
    results =
      @sources
      |> Task.async_stream(
        fn {module, type, _interval} ->
          {module, collect_from_source(module, type)}
        end,
        max_concurrency: 4,
        timeout: 120_000
      )
      |> Enum.map(fn {:ok, result} -> result end)

    processed = process_results(results)

    :telemetry.execute(
      [:prismatic, :intelligence, :collection, :complete],
      %{
        indicators_new: processed.new_count,
        indicators_updated: processed.updated_count,
        sources_queried: length(@sources)
      },
      %{status: processed.status}
    )

    schedule_collection()

    {:noreply,
     %{
       state
       | last_collection: DateTime.utc_now(),
         indicators_count: state.indicators_count + processed.new_count
     }}
  end

  @spec collect_from_source(module(), atom()) :: {:ok, list(map())} | {:error, term()}
  defp collect_from_source(module, type) do
    case module.fetch_latest() do
      {:ok, raw_data} ->
        normalized = module.normalize(raw_data)
        enriched = enrich_indicators(normalized, type)
        {:ok, enriched}

      {:error, reason} ->
        Logger.warning("Intelligence collection failed",
          source: module,
          reason: inspect(reason)
        )

        {:error, reason}
    end
  end

  defp schedule_collection do
    Process.send_after(self(), :collect, @collection_interval)
  end

  defp process_results(_results), do: %{new_count: 0, updated_count: 0, status: :ok}
  defp enrich_indicators(indicators, _type), do: indicators
end
```

### NABLA-Governed Intelligence Analysis

All threat intelligence analysis within the Prismatic Platform must comply with [NABLA Infinity](@/glossary/nabla-infinity.md) axioms. This is not optional -- the platform blocks intelligence assessments that violate epistemic requirements:

```elixir
defmodule PrismaticIntelligence.Analyzer do
  @moduledoc """
  Analyzes threat intelligence with NABLA axiom compliance.
  Ensures signal plurality, provenance tracking, time decay,
  and contradiction preservation. Assessments that violate
  axioms are blocked, not degraded.
  """

  @type analysis_result :: %{
    assessment: String.t(),
    confidence: float(),
    sources: [map()],
    contradictions: [contradiction()],
    time_decay_applied: boolean(),
    nabla_compliance: compliance_status()
  }

  @type contradiction :: %{
    claim_a: String.t(),
    claim_b: String.t(),
    source_a: map(),
    source_b: map(),
    resolution: :unresolved | :a_preferred | :b_preferred | :synthesized
  }

  @type compliance_status :: %{
    signal_plurality: boolean(),
    contradiction_preserved: boolean(),
    provenance_tracked: boolean(),
    time_decay_applied: boolean(),
    source_independence: boolean()
  }

  @spec analyze_threat(String.t(), [map()]) :: {:ok, analysis_result()} | {:error, term()}
  def analyze_threat(threat_id, indicators) do
    sources = extract_unique_sources(indicators)

    if length(sources) < 2 do
      {:error,
       {:nabla_violation, :signal_plurality,
        "Threat #{threat_id} has only #{length(sources)} source(s), minimum 2 required"}}
    else
      contradictions = identify_contradictions(indicators)
      decayed_indicators = apply_time_decay(indicators)

      with :ok <- verify_provenance(decayed_indicators) do
        assessment = synthesize_assessment(decayed_indicators, contradictions)

        {:ok,
         %{
           assessment: assessment.summary,
           confidence: assessment.confidence,
           sources: sources,
           contradictions: contradictions,
           time_decay_applied: true,
           nabla_compliance: %{
             signal_plurality: true,
             contradiction_preserved: length(contradictions) > 0,
             provenance_tracked: true,
             time_decay_applied: true,
             source_independence: verify_independence(sources)
           }
         }}
      end
    end
  end

  @spec apply_time_decay([map()]) :: [map()]
  defp apply_time_decay(indicators) do
    now = DateTime.utc_now()

    Enum.map(indicators, fn indicator ->
      age_hours = DateTime.diff(now, indicator.last_seen, :hour)

      decay_factor =
        cond do
          age_hours < 1 -> 1.0
          age_hours < 24 -> 0.95
          age_hours < 168 -> 0.80
          age_hours < 720 -> 0.50
          age_hours < 2160 -> 0.25
          true -> 0.10
        end

      %{indicator | confidence: indicator.confidence * decay_factor}
    end)
  end

  defp extract_unique_sources(indicators) do
    indicators |> Enum.flat_map(& &1.sources) |> Enum.uniq_by(& &1.name)
  end

  defp identify_contradictions(_indicators), do: []
  defp verify_provenance(_indicators), do: :ok
  defp synthesize_assessment(_indicators, _contradictions), do: %{summary: "", confidence: 0.0}

  defp verify_independence(sources) do
    source_types = Enum.map(sources, & &1.type) |> Enum.uniq()
    length(source_types) >= 2
  end
end
```

## Architecture and Implementation

### Intelligence Pipeline Architecture

```
Collection Sources                    Processing Pipeline
    |                                      |
    +-- OSINT Feeds ----+                  +-- Normalization
    +-- Commercial TI ---+-- Collector --> +-- Deduplication
    +-- Community Feeds -+                 +-- Enrichment
    +-- Government (NVD)+                  +-- NABLA Validation
    +-- Internal Sensors+                  +-- Time Decay
                                           |
                                           v
                                    Intelligence Store
                                           |
                         +-----------------+-----------------+
                         |                 |                 |
                    Color Teams      EASM/Perimeter     HAWKEYE
                    (scenarios)      (ratings)       (correlation)
```

### Intelligence Levels and Consumers

| Level | Audience | Update Frequency | Format | Platform Consumer |
|-------|----------|-----------------|--------|-------------------|
| Strategic | Executive, Board | Monthly/Quarterly | Reports, briefings | Compliance dashboard |
| Tactical | Security teams | Weekly/Daily | TTP descriptions, playbooks | Color Team commanders |
| Operational | Security tools | Real-time/Hourly | IOCs, rules, signatures | EASM, HAWKEYE, Blue Team |

### MITRE ATT&CK Integration

The platform maps all observed techniques to the MITRE ATT&CK framework, tracking detection coverage across tactics:

| Tactic | Techniques Tracked | Detection Coverage | Platform Coverage |
|--------|-------------------|-------------------|-------------------|
| Initial Access | Phishing, exploit public-facing | 85% | Blue Team + EASM |
| Execution | Command-line, scripting | 78% | Blue drift detection |
| Persistence | Registry run keys, scheduled tasks | 72% | Blue auth sentinel |
| Credential Access | Brute force, credential dumping | 90% | HAWKEYE + Blue Team |
| Discovery | Network scanning, system info | 80% | EASM + perimeter scanning |
| Exfiltration | Over C2 channel, alternative protocol | 65% | Network monitoring |

### Color Team Integration

```elixir
defmodule PrismaticIntelligence.ColorTeamIntegration do
  @moduledoc """
  Integrates threat intelligence with Color Team operations.
  Routes relevant intelligence to appropriate teams based
  on severity, confidence, and team mandate. Ensures all
  teams receive relevant indicators without information
  overload.
  """

  @spec route_intelligence(map()) :: :ok
  def route_intelligence(indicator) do
    if indicator.severity in [:critical, :high] do
      PrismaticDark.Red.Commander.ingest_indicator(indicator)
    end

    PrismaticDark.Blue.Commander.update_indicator_set(indicator)
    PrismaticDark.Purple.Coordinator.check_indicator_impact(indicator)

    if indicator.confidence >= 0.85 do
      PrismaticDark.White.Commander.verify_threat_model(indicator)
    end

    :ok
  end

  @spec generate_red_team_scenario(map()) :: {:ok, map()} | {:error, term()}
  def generate_red_team_scenario(actor) do
    ttps =
      actor.ttps
      |> Enum.filter(&(&1.detection_coverage < 0.80))
      |> Enum.sort_by(& &1.detection_coverage)

    scenario = %{
      name: "Simulated #{actor.name} campaign",
      actor_profile: actor,
      techniques: Enum.map(ttps, & &1.mitre_id),
      objectives: derive_objectives(actor),
      constraints: [:sandbox_only, :synthetic_data, :no_network]
    }

    {:ok, scenario}
  end

  defp derive_objectives(_actor), do: []
end
```

## Time Decay Model

One of the most critical aspects of threat intelligence management is the systematic application of time decay to indicator confidence scores. An IP address identified as malicious six months ago may have been reassigned to a legitimate user. A domain associated with a phishing campaign may have been seized and sinkholed. The platform implements a multi-tier decay model:

| Age | Decay Factor | Rationale |
|-----|-------------|-----------|
| < 1 hour | 1.00 | Fresh indicator, maximum confidence |
| 1-24 hours | 0.95 | Very recent, minimal decay |
| 1-7 days | 0.80 | Recent, slight decay for infrastructure changes |
| 7-30 days | 0.50 | Moderate age, significant infrastructure churn |
| 30-90 days | 0.25 | Old indicator, high probability of reassignment |
| > 90 days | 0.10 | Very old, retained only for historical correlation |

These thresholds are calibrated against observed infrastructure churn rates. IP addresses typically change hands faster than domain names, and file hashes remain stable indefinitely. A production system should apply type-specific decay curves rather than a single universal model.

## Source Reliability Assessment

The platform uses the Admiralty Code (NATO standard) for source reliability assessment, providing a structured vocabulary for expressing confidence in intelligence sources:

| Code | Reliability | Description |
|------|------------|-------------|
| **A** | Reliable | Established source with consistent track record |
| **B** | Usually Reliable | Source has provided valid information in most cases |
| **C** | Fairly Reliable | Source has provided valid information in some cases |
| **D** | Not Usually Reliable | Source has limited or inconsistent track record |
| **E** | Unreliable | Source has failed to provide valid information |
| **F** | Unknown | Source reliability cannot be assessed |

## Usage in Prismatic Platform

### Querying Threat Intelligence

```elixir
# Search for indicators related to a domain
{:ok, indicators} =
  PrismaticIntelligence.search(%{
    type: :domain,
    related_to: "suspicious-domain.com",
    min_confidence: 0.70,
    max_age_hours: 720
  })

# Get threat actor profile
{:ok, actor} = PrismaticIntelligence.get_actor("APT-XYZ")

# Generate Red Team scenario from actor profile
{:ok, scenario} =
  PrismaticIntelligence.ColorTeamIntegration.generate_red_team_scenario(actor)

# Assess threat landscape for a target
{:ok, landscape} = PrismaticIntelligence.assess_threat_landscape("target-org.com")
```

### Dashboard Access

The threat intelligence dashboard at `/perimeter/intelligence` provides real-time visualization of the threat landscape, including indicator timelines, actor activity maps, and TTP coverage heatmaps. The dashboard integrates with the [EASM](@/glossary/easm.md) assessment view to show how threat intelligence informs security ratings.

## Best Practices

1. **Apply NABLA axioms to all intelligence assessments.** Signal plurality (minimum 2 independent sources), provenance tracking (every indicator traceable to its source), and time decay (older indicators weighted less) prevent intelligence failures caused by single-source reliance or stale data.

2. **Distinguish between intelligence levels.** Strategic, tactical, and operational intelligence serve different audiences with different timeliness requirements. Mixing levels produces intelligence that is too detailed for executives and too abstract for security tools.

3. **Implement time decay systematically.** Threat indicators lose relevance over time. An IP address associated with a campaign six months ago may have been reassigned. Apply decay functions that reduce confidence scores based on indicator age and type.

4. **Preserve contradictions rather than resolving them prematurely.** Two credible sources may disagree about a threat actor's capabilities or intentions. Preserving both assessments with their respective evidence is more valuable than prematurely choosing one.

5. **Automate operational intelligence consumption.** IOCs should flow automatically into detection tools, firewalls, and monitoring systems. Manual IOC processing is too slow for operational response and introduces human error.

6. **Track detection coverage against ATT&CK.** Map your detection capabilities to the MITRE ATT&CK matrix. Identify gaps where techniques have low detection coverage and prioritize intelligence collection for those areas.

7. **Validate source independence.** Two sources that both consume the same upstream feed are not independent. Verify that signal plurality reflects genuinely independent observation, not repeated reporting of the same data.

## Common Pitfalls

- **Single-source intelligence**: Relying on a single threat feed creates a false sense of comprehensive coverage. Different sources have different collection biases and coverage gaps. The NABLA signal plurality axiom requires minimum two independent sources for any belief.

- **Ignoring time decay**: Treating a six-month-old IOC with the same confidence as a fresh one leads to false positives and alert fatigue. All indicators must have expiry dates and confidence decay functions.

- **Volume over quality**: Ingesting massive indicator feeds without quality filtering creates noise that drowns out genuine signals. Focus on high-confidence, high-relevance indicators rather than maximizing volume.

- **Attribution overconfidence**: Attributing attacks to specific threat actors is inherently uncertain. False flag operations, shared tooling, and infrastructure reuse make definitive attribution difficult. Express attribution as a confidence range, not a certainty.

- **Disconnected intelligence and operations**: Intelligence that does not reach the security tools and teams that can act on it provides no value. The intelligence pipeline must have automated dissemination to operational consumers.

- **Stale threat models**: Threat actor profiles and TTPs must be regularly updated. An adversary's capabilities, targeting, and infrastructure evolve over time. Outdated models produce ineffective adversarial simulations.

## Related Concepts

- [OSINT](@/glossary/osint.md) -- Collection methodology for publicly available threat data
- [Intelligence Fusion](@/glossary/intelligence-fusion.md) -- Processing raw threat data into actionable intelligence
- [EASM](@/glossary/easm.md) -- Attack surface management enriched with threat intelligence
- [Red Team](@/glossary/red-team.md) -- Uses threat intelligence for adversarial scenario generation
- [Blue Team](@/glossary/blue-team.md) -- Defensive team consuming operational threat intelligence
- [HAWKEYE](@/glossary/hawkeye.md) -- Visitor intelligence correlating with threat indicators
- [NABLA Infinity](@/glossary/nabla-infinity.md) -- Epistemic framework governing intelligence analysis
- [Color Teams](@/glossary/color-teams.md) -- Security operations consuming threat intelligence
- [Attack Surface](@/glossary/attack-surface.md) -- External surface assessed using threat intelligence
- [Trinity Gate](@/glossary/trinity-gate.md) -- Verification gate that intelligence assessments must pass

## See Also

- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Technologies](@/technologies/_index.md) -- Technology stack details
- [Apps](@/apps/_index.md) -- Application directory including intelligence subsystems

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
