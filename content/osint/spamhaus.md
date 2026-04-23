+++
title = "Spamhaus"
weight = 39
[extra]
category = "global"
type = "ip"
module = "Spamhaus"
description = "World's leading IP and domain blocklist provider for spam, malware, and botnet protection"
has_api = true
url = "https://www.spamhaus.org"
rate_limit = "DNSBL: 300k queries/day (free); Data Query Service: plan-dependent"
capabilities = ["IP Blocklists (SBL/XBL/PBL)", "Domain Blocklists (DBL)", "Botnet C2 Detection", "Malware Distribution Tracking", "Exploited IP Detection", "Policy Blocklists", "Hash Blocklist (HBL)", "DROP/EDROP Lists"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1070
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Spamhaus", "Worlds", "osint", "global", "Prismatic Platform", "DROP", "List"]
tags = ["osint", "global", "spamhaus", "prismatic"]
quality_score = 80
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "Spamhaus - Prismatic Platform"
+++

## Overview

Spamhaus is the world's most trusted provider of IP and domain reputation data, protecting an estimated 3 billion email users worldwide. Founded in 1998 by Steve Linford, Spamhaus maintains a suite of real-time blocklists (DNSBLs) that identify IP addresses and domains involved in spam, malware distribution, botnet command-and-control, and other abusive activities. The organization's blocklists are used by the majority of the world's email providers, ISPs, and security companies as a fundamental layer of Internet protection.

Spamhaus operates a global network of threat researchers who identify and track malicious infrastructure using a combination of automated detection systems, spam trap networks, honeypots, and human intelligence. This multi-layered detection methodology produces highly reliable reputation data with industry-leading accuracy. The organization's reputation is built on decades of consistent, evidence-based threat identification that has earned the trust of the global Internet community.

Within the Prismatic Platform, Spamhaus provides foundational threat reputation data for the [Prismatic Perimeter](/apps/prismatic-perimeter/) [security rating](/glossary/security-rating/) engine and the [OSINT Core](/apps/prismatic-osint-core/) IP/domain assessment pipeline. Spamhaus blocklist status is a key input to IP and domain reputation scoring, with listings on Spamhaus blocklists serving as high-confidence indicators of malicious or compromised infrastructure.

## Data Sources and Coverage

Spamhaus maintains multiple specialized blocklists, each targeting a specific category of abusive activity. The blocklists are designed to be used individually or in combination, with the ZEN composite list providing the most common configuration for email filtering.

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **SBL (Spamhaus Block List)** | IPs of verified spammers and spam operations | Known spam sources |
| **XBL (Exploits Block List)** | IPs of compromised hosts (bots, proxies, worms) | Exploited endpoints |
| **PBL (Policy Block List)** | Dynamic/residential IPs not authorized for email | Policy-based |
| **DBL (Domain Block List)** | Domains found in spam, phishing, and malware | Malicious domains |
| **CSS (Composite Snowshoe)** | Distributed spam infrastructure detection | Snowshoe spam |
| **HBL (Hash Block List)** | Cryptographic hashes of malware and spam content | Content-based |
| **DROP/EDROP** | Hijacked/stolen IP ranges (do not route or peer) | Hijacked networks |
| **Botnet C2** | Active botnet command-and-control infrastructure | C2 infrastructure |

### Blocklist Hierarchy

| List | Scope | Recommended Use |
|------|-------|----------------|
| **ZEN** | SBL + XBL + PBL combined | Email filtering (most common) |
| **SBL** | Known spam sources | Strict email policy |
| **XBL** | Exploited endpoints | Bot/malware detection |
| **DBL** | Malicious domains | URL filtering |
| **DROP** | Hijacked IP ranges | Network-level blocking |

## Technical Architecture

The Prismatic Platform integrates Spamhaus through DNS-based lookups for high-performance real-time checks and the Data Query Service (DQS) for enriched context. The DNSBL lookup mechanism is inherently fast and scalable, using standard DNS protocol to check IP and domain reputation with sub-millisecond local resolution when DNS caching is active.

The adapter implements parallel DNSBL queries across multiple Spamhaus lists simultaneously, combining results into a unified reputation assessment. A dedicated DNS resolver with a local cache is used for Spamhaus queries to maximize performance and minimize external DNS dependencies.

For the DROP/EDROP lists, the adapter maintains a local copy of hijacked IP ranges in a prefix tree (trie) data structure, enabling O(log n) prefix matching for any IP address. The DROP list is refreshed hourly from Spamhaus, with the prefix tree rebuilt atomically to avoid query disruption during updates.

The DQS integration provides richer context beyond simple listed/not-listed responses, including specific listing reasons, associated SBL references, and remediation guidance. This enhanced data supports more nuanced reputation scoring that accounts for the severity and nature of the listing.

## API Integration

Spamhaus blocklists are queried via DNS for high-performance real-time lookups, with the Data Query Service providing richer context.

```elixir
# Check IP against Spamhaus ZEN (SBL + XBL + PBL)
{:ok, result} = Spamhaus.check_ip("1.2.3.4")
# => %{
#   ip: "1.2.3.4",
#   listed: true,
#   lists: [
#     %{list: "SBL", code: "127.0.0.2",
#       description: "Spamhaus SBL - Verified spam source"},
#     %{list: "XBL", code: "127.0.0.4",
#       description: "Exploits Block List - Compromised host"}
#   ],
#   sbl_ref: "SBL123456"
# }

# Check domain against DBL
{:ok, result} = Spamhaus.check_domain("malicious-example.com")

# Check if IP is in DROP list (hijacked ranges)
{:ok, result} = Spamhaus.check_drop("1.2.3.4")

# Get the current DROP list (hijacked IP ranges to block)
{:ok, drop_list} = Spamhaus.get_drop_list()

# Batch IP check
{:ok, results} = Spamhaus.batch_check(["1.2.3.4", "5.6.7.8", "9.10.11.12"])

# Check content hash against HBL
{:ok, result} = Spamhaus.check_hash("d41d8cd98f00b204e9800998ecf8427e")
```

### Threat Reputation Pipeline

```elixir
defmodule PrismaticPerimeter.Assessment.ThreatReputation do
  @moduledoc """
  Comprehensive threat reputation scoring using Spamhaus blocklists
  combined with AbuseIPDB and GreyNoise for multi-source validation.
  """

  def assess_ip_reputation(ip_address) do
    tasks = [
      Task.async(fn -> Spamhaus.check_ip(ip_address) end),
      Task.async(fn -> AbuseIpdb.check(ip_address) end),
      Task.async(fn -> GreyNoise.context(ip_address) end)
    ]

    [spamhaus, abuse, greynoise] = Task.await_many(tasks, 10_000)

    {:ok, %{
      ip: ip_address,
      spamhaus_listed: spamhaus[:listed],
      spamhaus_lists: spamhaus[:lists],
      abuse_score: abuse[:abuse_confidence_score],
      greynoise_class: greynoise[:classification],
      combined_reputation: calculate_reputation(spamhaus, abuse, greynoise),
      threat_category: categorize_threat(spamhaus, abuse, greynoise),
      recommended_action: determine_action(spamhaus, abuse, greynoise)
    }}
  end
end
```

## Use Cases

### Email Security
- Filter incoming email using ZEN blocklist for comprehensive spam, malware, and bot detection
- Block domains in email bodies using DBL to prevent phishing and malware delivery
- Detect compromised endpoints sending spam via XBL for endpoint security alerting
- Implement outbound email reputation monitoring to protect sender reputation

### Network Security
- Block hijacked IP ranges at network border using DROP lists for BGP-level protection
- Identify botnet C2 infrastructure connected to organizational networks
- Feed reputation into [Perimeter](/apps/prismatic-perimeter/) security ratings for external assessment
- Monitor organizational IP space for unexpected Spamhaus listings indicating compromise

### Threat Intelligence
- Correlate with [AbuseIPDB](/osint/abuseipdb/) for comprehensive IP reputation from multiple sources
- Cross-reference with [GreyNoise](/osint/greynoise/) to distinguish spam from legitimate scanning activity
- Feed blocklist data into [AlienVault OTX](/osint/alienvault-otx/) threat pulses for community sharing
- Track IP and domain reputation changes over time for threat landscape analysis

## Data Quality

Spamhaus data quality is among the highest in the threat reputation domain, built on 25+ years of evidence-based threat identification with rigorous listing criteria and delisting procedures.

| Quality Dimension | Assessment | Notes |
|-------------------|------------|-------|
| **Listing Accuracy** | Excellent -- evidence-based with human review | Very low false positive rate |
| **Coverage** | Comprehensive -- global threat infrastructure monitoring | 3B+ users protected |
| **Timeliness** | Excellent -- near real-time listing updates | Automated + human analysis |
| **False Positive Rate** | Very low -- rigorous listing criteria | Established delisting process |
| **Historical Reputation** | Strong -- 25+ years of threat data | Industry standard |
| **DROP List Authority** | Excellent -- confirmed hijacked ranges | BGP-level blocking recommended |

### Access Methods

| Access Method | Rate Limit | Features |
|--------------|-----------|----------|
| **DNSBL (Free)** | 300,000 queries/day | IP/domain blocklist checks |
| **DNSBL (DQS)** | Unlimited | Enhanced data, commercial use |
| **Data Feeds** | Per subscription | Bulk data, research access |
| **DROP/EDROP** | Unlimited | BGP-level blocklists (free) |

Free DNSBL access uses public DNS servers. Commercial use requires a Data Query Service (DQS) key.

## Platform Integration

Within the Prismatic Platform, Spamhaus serves as a primary IP and domain reputation source. Blocklist status is a key input to the Perimeter security rating algorithm, where Spamhaus listings on SBL or XBL contribute significant negative scoring to the infrastructure reputation component.

The integration supports real-time reputation checks during EASM assessments, continuous monitoring for reputation changes on organizational IP space, and threat intelligence correlation with other reputation sources.

## NABLA Compliance

Spamhaus integration satisfies NABLA requirements through its evidence-based listing methodology. The Provenance Mandatory axiom is met through SBL reference numbers that link listings to specific evidence. Signal Plurality is enforced by combining Spamhaus data with AbuseIPDB and GreyNoise for multi-source reputation assessment. Time Decay is addressed through listing age tracking, with recent listings weighted more heavily than historical ones.

## Performance

| Metric | Target | Typical |
|--------|--------|---------|
| **DNSBL lookup (cached)** | < 1ms | 0.1-0.5ms |
| **DNSBL lookup (uncached)** | < 50ms | 10-30ms |
| **DROP prefix match** | < 1ms | 0.01-0.1ms |
| **Batch check (1,000 IPs)** | < 10s | 3-5s |
| **DROP list refresh** | < 30s | 5-15s |

## Related Resources

- [AbuseIPDB](/osint/abuseipdb/) - Community-driven IP abuse reporting
- [GreyNoise](/osint/greynoise/) - Internet noise and scanner classification
- [PhishTank](/osint/phishtank/) - Community phishing URL verification
- [Pulsedive](/osint/pulsedive/) - [Threat intelligence](/glossary/threat-intelligence/) aggregation with risk scoring
- [ThreatFox](/osint/threatfox/) - Malware IOC sharing platform
- [OSINT Core](/apps/prismatic-osint-core/) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](/apps/prismatic-perimeter/) - IP/domain reputation in security ratings

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)