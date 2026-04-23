+++
title = "Cyber Threat Intelligence"
weight = 56
[extra]
category = "intelligence"
description = "Evidence-based knowledge about threats enabling informed defensive decisions"
related_terms = ["threat-intelligence", "osint", "vulnerability-assessment", "easm", "red-team"]
author = "Tomas Korcak (korczis)"
reading_time = "7 min"
word_count = 1370
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Cyber", "Threat", "Intelligence", "Evidence-based", "glossary", "Prismatic Platform", "IOCs", "TTPs", "Medium"]
tags = ["glossary", "intelligence", "cyber-threat-intelligence", "prismatic"]
quality_score = 72
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Cyber Threat Intelligence - Prismatic Platform"
+++

## Definition and Overview

Cyber Threat Intelligence (CTI) is the systematic collection, processing, analysis, and dissemination of evidence-based knowledge about existing or emerging threats to information systems. CTI encompasses information about threat actors (their identities, motivations, capabilities, and organizational structures), their tactics, techniques, and procedures (TTPs), indicators of compromise (IOCs), and the vulnerabilities they exploit. The distinguishing characteristic of CTI is its transformation of raw security data into contextualized, actionable intelligence that enables informed defensive decisions, proactive threat hunting, and strategic risk management.

CTI operates across four distinct levels, each serving different organizational roles and decision timescales:

| Level | Audience | Focus | Timescale | Example |
|-------|----------|-------|-----------|---------|
| **Strategic** | Executives, Board | Threat landscape trends, geopolitical risk | Months to years | "Nation-state actors are increasingly targeting supply chains" |
| **Operational** | Security leadership | Campaign tracking, threat actor profiles | Weeks to months | "APT28 is conducting phishing campaigns against energy sector" |
| **Tactical** | SOC analysts, IR teams | TTPs, attack methodologies | Days to weeks | "Attackers use spearphishing with .iso attachments to bypass Mark-of-the-Web" |
| **Technical** | Security tools, automation | IOCs, signatures, rules | Minutes to days | "Block IP 198.51.100.42, hash a1b2c3..., domain evil.example.com" |

The intelligence cycle -- a structured process of direction, collection, processing, analysis, dissemination, and feedback -- ensures that CTI production is systematic rather than ad hoc. Each phase builds on the previous, with feedback loops enabling continuous refinement of collection requirements and analytical models.

The value of CTI increases dramatically when multiple intelligence sources are fused. A single indicator (e.g., a suspicious IP address) has limited utility in isolation. When correlated with infrastructure registration data, historical activity patterns, malware analysis results, and geopolitical context, that same indicator becomes part of a comprehensive threat picture that enables proactive defense.

## Technical Deep Dive

### The Diamond Model of Intrusion Analysis

The Diamond Model provides a structured framework for analyzing cyber intrusions through four core features:

```
           Adversary
              |
              |
    Infrastructure --- Capability
              |
              |
            Victim
```

Each intrusion event connects an adversary to a victim through infrastructure (C2 servers, domains, IPs) and capability (malware, exploits, tools). CTI analysts use this model to pivot across features -- discovering new infrastructure from known adversary TTPs, or attributing unknown intrusions by matching capability signatures to known threat actors.

### MITRE ATT&CK Framework

The MITRE ATT&CK (Adversarial Tactics, Techniques, and Common Knowledge) framework provides a comprehensive taxonomy of adversary behavior organized by tactics (the "why") and techniques (the "how"):

| Tactic | Description | Example Techniques |
|--------|-------------|-------------------|
| **Reconnaissance** | Gathering target information | Active scanning, phishing for information |
| **Resource Development** | Establishing attack infrastructure | Acquiring domains, developing exploits |
| **Initial Access** | Gaining foothold | Spearphishing, exploit public-facing app |
| **Execution** | Running malicious code | PowerShell, scripting, WMI |
| **Persistence** | Maintaining access | Registry run keys, scheduled tasks |
| **Privilege Escalation** | Gaining higher permissions | Token manipulation, exploit vulnerability |
| **Defense Evasion** | Avoiding detection | Obfuscation, disabling security tools |
| **Credential Access** | Stealing credentials | Brute force, credential dumping |
| **Discovery** | Understanding the environment | Network scanning, account discovery |
| **Lateral Movement** | Moving through the network | RDP, SMB, pass-the-hash |
| **Collection** | Gathering target data | Data from local system, email collection |
| **Exfiltration** | Stealing data | Exfil over C2, encrypted channel |
| **Impact** | Disrupting operations | Ransomware, data destruction |

ATT&CK provides a common vocabulary for describing adversary behavior, enabling CTI producers and consumers to communicate precisely about threats. Each technique includes detection opportunities, enabling defenders to validate their coverage against known adversary methods.

### Indicators of Compromise (IOCs)

IOCs are forensic artifacts that indicate malicious activity. They are organized in a hierarchy of specificity and longevity:

| IOC Type | Specificity | Longevity | Example | Detection Difficulty |
|----------|-------------|-----------|---------|---------------------|
| **Hash values** | Very high | Very short (easily changed) | MD5/SHA256 of malware binary | Trivial |
| **IP addresses** | High | Short (days-weeks) | C2 server IP | Easy |
| **Domain names** | High | Medium (weeks-months) | C2 domain | Easy |
| **Network signatures** | Medium | Medium | Specific HTTP headers, JA3 hashes | Moderate |
| **Host artifacts** | Medium | Medium-Long | Registry keys, file paths, mutex names | Moderate |
| **Tools** | Low | Long | Use of specific malware families | Difficult |
| **TTPs** | Very low | Very long | Behavioral patterns | Very difficult |

The Pyramid of Pain (David Bianco, 2013) illustrates that higher-specificity IOCs are easier to detect but also easier for adversaries to change. TTPs, while hardest to detect, represent the adversary's fundamental operational methodology and are the most difficult and expensive for them to modify.

### Threat Intelligence Platforms (TIPs)

TIPs are specialized systems for aggregating, correlating, and operationalizing CTI:

```
Intelligence Sources              TIP Core                    Consumers
┌──────────────────┐            ┌──────────────┐            ┌──────────────┐
│ OSINT feeds      │──────>     │ Ingest       │──────>     │ SIEM         │
│ Commercial feeds │──────>     │ Normalize    │──────>     │ Firewall     │
│ ISAC sharing     │──────>     │ Correlate    │──────>     │ EDR          │
│ Internal sources │──────>     │ Enrich       │──────>     │ SOC Analysts │
│ Dark web monitor │──────>     │ Score        │──────>     │ IR Teams     │
└──────────────────┘            │ Disseminate  │            │ Management   │
                                └──────────────┘            └──────────────┘
```

## Architecture and Implementation

### Intelligence Fusion Architecture

Production CTI systems implement a multi-source fusion architecture that combines diverse intelligence feeds into a unified threat picture:

```elixir
defmodule PrismaticIntelligence.FusionEngine do
  @moduledoc """
  Multi-source intelligence fusion engine implementing the intelligence cycle.
  Correlates signals from OSINT providers, threat feeds, and internal telemetry.
  """

  @source_weights %{
    shodan: 0.8,
    censys: 0.8,
    greynoise: 0.7,
    certificate_transparency: 0.9,
    dns_enumeration: 0.85,
    whois: 0.6,
    internal_telemetry: 0.95
  }

  @spec fuse(list(map())) :: {:ok, map()} | {:error, term()}
  def fuse(signals) do
    with {:ok, normalized} <- normalize_signals(signals),
         {:ok, correlated} <- correlate_signals(normalized),
         {:ok, scored} <- score_intelligence(correlated),
         {:ok, validated} <- validate_against_nabla(scored) do
      {:ok, %{
        findings: scored.findings,
        confidence: scored.aggregate_confidence,
        sources: scored.source_count,
        contradictions: validated.contradictions,
        timestamp: DateTime.utc_now()
      }}
    end
  end

  defp normalize_signals(signals) do
    normalized =
      signals
      |> Enum.map(&normalize_signal/1)
      |> Enum.reject(&is_nil/1)

    {:ok, normalized}
  end

  defp correlate_signals(signals) do
    grouped = Enum.group_by(signals, & &1.entity_key)

    correlated =
      Enum.map(grouped, fn {entity, entity_signals} ->
        %{
          entity: entity,
          signal_count: length(entity_signals),
          sources: Enum.map(entity_signals, & &1.source) |> Enum.uniq(),
          weight: calculate_fusion_weight(entity_signals),
          first_seen: entity_signals |> Enum.map(& &1.timestamp) |> Enum.min(DateTime),
          last_seen: entity_signals |> Enum.map(& &1.timestamp) |> Enum.max(DateTime)
        }
      end)

    {:ok, %{findings: correlated}}
  end

  defp calculate_fusion_weight(signals) do
    signals
    |> Enum.map(fn signal -> Map.get(@source_weights, signal.source, 0.5) end)
    |> Enum.sum()
    |> min(1.0)
  end
end
```

### Broadway Pipeline Integration

CTI data flows through Broadway pipelines for high-throughput, fault-tolerant processing:

```elixir
defmodule PrismaticIntelligence.CTIPipeline do
  @moduledoc """
  Broadway pipeline for processing CTI data streams at scale.
  Handles batched ingestion, enrichment, and storage.
  """
  use Broadway

  def start_link(_opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [
        module: {PrismaticIntelligence.CTIProducer, []},
        concurrency: 2
      ],
      processors: [
        default: [concurrency: 8]
      ],
      batchers: [
        storage: [concurrency: 4, batch_size: 100, batch_timeout: 5_000],
        alerting: [concurrency: 2, batch_size: 10, batch_timeout: 1_000]
      ]
    )
  end

  @impl Broadway
  def handle_message(_processor, message, _context) do
    enriched =
      message.data
      |> enrich_with_cvss()
      |> enrich_with_geolocation()
      |> enrich_with_reputation()
      |> classify_severity()

    batcher = if enriched.severity in [:critical, :high], do: :alerting, else: :storage

    message
    |> Message.update_data(fn _ -> enriched end)
    |> Message.put_batcher(batcher)
  end

  @impl Broadway
  def handle_batch(:storage, messages, _batch_info, _context) do
    records = Enum.map(messages, & &1.data)
    PrismaticStorage.bulk_insert(:threat_intelligence, records)
    messages
  end

  @impl Broadway
  def handle_batch(:alerting, messages, _batch_info, _context) do
    Enum.each(messages, fn msg ->
      PrismaticIntelligence.AlertDispatcher.dispatch(msg.data)
    end)

    records = Enum.map(messages, & &1.data)
    PrismaticStorage.bulk_insert(:threat_intelligence, records)
    messages
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform integrates CTI through its multi-source intelligence fusion architecture, with CTI capabilities distributed across several platform components.

### OSINT-CTI Integration

The [OSINT](@/glossary/osint.md) subsystem provides the primary collection layer for CTI, with providers including Shodan, Censys, GreyNoise, Certificate Transparency logs, and DNS enumeration tools. Raw OSINT data flows through Broadway pipelines where it is enriched, correlated, and scored into CTI products.

### Perimeter Threat Contextualization

[Prismatic Perimeter](@/glossary/prismatic-perimeter.md) uses CTI to contextualize discovered assets against known threat landscapes. When the discovery pipeline identifies an exposed service, CTI correlation checks whether that service's technology fingerprint matches current threat actor targeting patterns.

### Color Team Operations

The [Color Team](@/glossary/color-teams.md) security operations leverage CTI at multiple levels:

| Team | CTI Usage |
|------|-----------|
| **Red Team** | Uses CTI-derived TTPs to create realistic adversarial scenarios |
| **Blue Team** | Consumes CTI for defensive posture assessment and detection engineering |
| **Purple Team** | Synthesizes Red CTI attacks with Blue CTI defenses for closure analysis |
| **Gray Team** | Explores boundary conditions in CTI data quality and coverage |

### NABLA Compliance

All CTI findings must comply with the [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework:

```elixir
defmodule PrismaticIntelligence.NABLAValidator do
  @moduledoc """
  Validates CTI findings against NABLA axioms before dissemination.
  """

  @spec validate(map()) :: {:ok, map()} | {:error, list(atom())}
  def validate(finding) do
    violations =
      []
      |> check_signal_plurality(finding)
      |> check_provenance(finding)
      |> check_time_decay(finding)
      |> check_source_independence(finding)

    case violations do
      [] -> {:ok, finding}
      errors -> {:error, errors}
    end
  end

  defp check_signal_plurality(violations, %{sources: sources}) when length(sources) < 2 do
    [:signal_plurality_violation | violations]
  end
  defp check_signal_plurality(violations, _finding), do: violations

  defp check_provenance(violations, %{provenance: nil}), do: [:provenance_missing | violations]
  defp check_provenance(violations, _finding), do: violations

  defp check_time_decay(violations, %{timestamp: nil}), do: [:time_decay_missing | violations]
  defp check_time_decay(violations, _finding), do: violations

  defp check_source_independence(violations, %{sources: sources}) do
    independent_count = sources |> Enum.map(& &1.organization) |> Enum.uniq() |> length()
    if independent_count < 2, do: [:source_independence_weak | violations], else: violations
  end
end
```

## Best Practices

**Implement the intelligence cycle formally.** CTI is not just data collection -- it requires structured direction (what questions need answers), collection (gathering relevant data), processing (normalizing formats), analysis (deriving meaning), dissemination (distributing to consumers), and feedback (refining requirements). Skip any phase and intelligence quality degrades.

**Prioritize TTP-level intelligence over IOCs.** IOCs are ephemeral -- an adversary changes an IP address trivially. TTPs represent operational methodology that is expensive to change. Invest in behavioral detection (detection engineering against ATT&CK techniques) rather than solely relying on IOC matching.

**Validate intelligence quality.** Not all CTI sources are equal. Establish a source reliability framework (e.g., A through F ratings) and assess each source's accuracy, timeliness, and relevance. Unreliable sources introduce noise that degrades analytical accuracy.

**Automate tactical CTI, invest human analysts in strategic CTI.** Technical IOCs can be automatically ingested, validated, and operationalized. Strategic and operational intelligence requires human analytical judgment. Allocate analyst time to the intelligence levels where human cognition adds the most value.

**Share intelligence bidirectionally.** CTI has a network effect -- the more organizations share, the more complete the collective threat picture. Participate in ISACs (Information Sharing and Analysis Centers) and use STIX/TAXII standards for automated sharing.

## Common Pitfalls

**Collecting without analyzing.** Many organizations accumulate vast quantities of threat data without the analytical capacity to derive intelligence from it. Raw IOC feeds without correlation, enrichment, and context are data, not intelligence. Ensure analytical capacity matches collection volume.

**Single-source dependence.** Relying on a single CTI vendor or feed creates blind spots and removes the ability to cross-validate findings. The NABLA signal plurality axiom directly addresses this -- require minimum 2 independent sources for any intelligence assertion.

**Alert fatigue from uncontextualized IOCs.** Pushing every IOC to security tools without relevance filtering generates massive false positive volumes that desensitize analysts. Match IOCs against your actual asset inventory and technology stack before operationalizing.

**Ignoring intelligence feedback loops.** Without feedback from intelligence consumers (analysts, incident responders, management), the collection and analysis cycle cannot improve. Implement formal feedback mechanisms that capture which intelligence products were useful and which were not.

**Confusing information with intelligence.** Information is raw data; intelligence is analyzed, contextualized, and actionable. Publishing a list of malicious IPs is information sharing. Explaining which threat actor uses those IPs, what their motivation is, and what defenses are effective against their methods is intelligence production.

## Related Concepts

- [Threat Intelligence](@/glossary/threat-intelligence.md) -- Broader intelligence discipline encompassing CTI
- [OSINT](@/glossary/osint.md) -- Open-source intelligence feeding CTI analysis
- [CVE](@/glossary/cve.md) -- Standardized vulnerability identifiers used in CTI
- [Vulnerability Assessment](@/glossary/vulnerability-assessment.md) -- CTI-informed evaluation of system weaknesses
- [EASM](@/glossary/easm.md) -- External attack surface mapped against CTI threat data
- [Prismatic Perimeter](@/glossary/prismatic-perimeter.md) -- Platform component consuming CTI for security assessment
- [Gray Team](@/glossary/gray-team.md) -- Boundary exploration team exploring CTI data quality gaps

## See Also

- [Architecture](@/architecture/_index.md) -- Intelligence architecture
- [Technologies](@/technologies/_index.md) -- Intelligence processing stack
- [Agents](@/agents/_index.md) -- AIAD agents involved in CTI processing

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)