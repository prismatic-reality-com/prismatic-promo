+++
title = "BuiltWith"
weight = 36
[extra]
icon = "globe"
color = "cyan"
category = "global"
type = "domain"
module = "BuiltWith"
source_type = "domain"
description = "Technology profiling for websites - detect CMS, frameworks, analytics, CDN, and hosting technologies"
has_api = true
url = "https://builtwith.com"
rate_limit = "Free: limited lookups, Basic: $246/mo, Pro: $495/mo"
capabilities = ["Technology Detection", "CMS Identification", "Analytics Tracking", "CDN Detection", "Hosting Provider", "Technology Trends"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1575
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["BuiltWith", "Technology", "osint", "global", "Prismatic Platform", "JavaScript"]
tags = ["osint", "global", "builtwith", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "BuiltWith - Prismatic Platform"
+++

## Overview

BuiltWith is the leading technology profiling platform that identifies the software, frameworks, plugins, analytics tools, CDN providers, and hosting infrastructure used by any website. Founded in 2007 by Gary Brewer in Australia, BuiltWith has grown to track over 100,000 distinct web technologies across 673 million websites, maintaining historical data on technology adoption and changes spanning more than 15 years. The platform's database is continuously updated through automated web crawling, JavaScript analysis, HTTP header inspection, DNS record examination, and SSL certificate parsing.

The technology detection engine operates through multiple analysis layers. First-pass detection examines HTTP response headers for server identification (Apache, Nginx, IIS), framework signatures (X-Powered-By), and security headers. Second-pass analysis downloads and parses HTML content, identifying CMS fingerprints, JavaScript library includes, meta tags, and link elements that reveal technology choices. Third-pass JavaScript execution detects dynamically loaded resources, analytics snippets, advertising networks, and client-side frameworks. Finally, infrastructure analysis examines DNS records, IP geolocation, SSL certificates, and CDN signatures to identify hosting and content delivery providers.

For [OSINT](/glossary/osint/) investigations, BuiltWith reveals the technical infrastructure decisions of target organizations, intelligence that supports multiple analytical objectives. [Vulnerability assessment](/glossary/vulnerability-assessment/) benefits from identifying outdated software versions -- a WordPress site running version 5.2 when the current release is 6.4 indicates poor patch management. Competitive intelligence analysts use BuiltWith to understand competitor technology investments, migration patterns, and vendor relationships. Supply chain risk assessment leverages technology profiles to identify third-party dependencies that could introduce vulnerabilities or compliance obligations. And for red team operations, understanding the target's technology stack enables targeted reconnaissance and attack vector selection.

BuiltWith's historical tracking capability adds a temporal dimension to technology intelligence. Analysts can observe when an organization adopted or abandoned specific technologies, tracking migrations from on-premises to cloud, legacy CMS to modern frameworks, or changes in analytics and advertising partnerships that may signal strategic shifts.

## Data Sources and Coverage

### Detection Methodology

BuiltWith collects technology data through several complementary methods, each contributing different detection capabilities.

| Detection Method | Technologies Detected | Coverage |
|-----------------|----------------------|----------|
| **HTTP Headers** | Web servers, frameworks, caching, security | ~95% of sites |
| **HTML Analysis** | CMS, JavaScript libraries, meta generators | ~90% of sites |
| **JavaScript Execution** | Analytics, ads, A/B testing, chat widgets | ~80% of sites |
| **DNS Analysis** | Email providers, CDN, DDoS protection | ~95% of sites |
| **SSL/TLS Analysis** | Certificate authorities, CDN providers | ~85% of sites |
| **Resource Loading** | Third-party services, fonts, tag managers | ~75% of sites |

### Technology Categories

| Category | Examples | Tracked Technologies |
|----------|----------|---------------------|
| **CMS/Framework** | WordPress, Shopify, Wix, Squarespace, Drupal | 2,000+ |
| **JavaScript Frameworks** | React, Angular, Vue.js, Next.js, jQuery | 1,500+ |
| **Analytics** | Google Analytics, Mixpanel, Hotjar, Amplitude | 800+ |
| **Advertising** | Google Ads, Facebook Pixel, LinkedIn Insight | 1,200+ |
| **CDN/Performance** | Cloudflare, Akamai, Fastly, AWS CloudFront | 300+ |
| **Hosting** | AWS, Azure, GCP, DigitalOcean, Vercel | 500+ |
| **Payment** | Stripe, PayPal, Square, Braintree, Adyen | 200+ |
| **Security** | WAF, SSL providers, bot protection, CAPTCHA | 400+ |
| **Email/Marketing** | Mailchimp, SendGrid, HubSpot, Marketo | 600+ |
| **E-commerce** | Shopify, WooCommerce, Magento, BigCommerce | 500+ |

### Coverage Statistics

| Metric | Value |
|--------|-------|
| **Total Websites Tracked** | 673,000,000+ |
| **Active Websites (monthly scan)** | 100,000,000+ |
| **Technology Categories** | 400+ |
| **Individual Technologies** | 100,000+ |
| **Historical Data Depth** | 15+ years |
| **Daily Crawl Volume** | 10,000,000+ pages |
| **Geographic Coverage** | Global (all TLDs) |

## API Integration

### Authentication

BuiltWith API uses API key authentication passed as a query parameter. Keys are tied to subscription plans with different access levels.

**Base URL**: `https://api.builtwith.com/`

### API Endpoints

| Endpoint | Method | Description | Plan |
|----------|--------|-------------|------|
| `/free1/api.json` | GET | Basic free lookup (limited fields) | Free |
| `/v21/api.json` | GET | Full technology profile | Basic+ |
| `/dlv1/api.json` | GET | Domain list by technology | Pro+ |
| `/rv1/api.json` | GET | Relationship/redirect data | Pro+ |
| `/kw1/api.json` | GET | Keyword/meta technology search | Pro+ |
| `/tv1/api.json` | GET | Technology trend data | Pro+ |
| `/cv1/api.json` | GET | Company profile with technographics | Enterprise |

### Pricing

| Plan | Price | Lookups | Features |
|------|-------|---------|----------|
| **Free** | $0 | 5 lookups/page | Basic web interface, limited fields |
| **Basic** | $246/mo | 500 API calls/day | Full technology profile, current data |
| **Pro** | $495/mo | 5,000 API calls/day | Historical data, lead lists, relationships |
| **Enterprise** | Custom | Unlimited | Bulk data, custom integrations, SLA |

### curl Examples

```bash
# Basic technology lookup (free tier)
curl "https://api.builtwith.com/free1/api.json?KEY=YOUR_API_KEY&LOOKUP=example.com"

# Full technology profile
curl "https://api.builtwith.com/v21/api.json?KEY=YOUR_API_KEY&LOOKUP=example.com"

# Find all sites using a specific technology
curl "https://api.builtwith.com/dlv1/api.json?KEY=YOUR_API_KEY&TECH=Shopify&COUNTRY=cz"

# Technology trend data
curl "https://api.builtwith.com/tv1/api.json?KEY=YOUR_API_KEY&TECH=React"

# Get relationship and redirect data
curl "https://api.builtwith.com/rv1/api.json?KEY=YOUR_API_KEY&LOOKUP=example.com"
```

## Query Examples

```elixir
# Full technology profile for a domain
{:ok, profile} = BuiltWith.lookup("example.com")
# => %{
#   domain: "example.com",
#   technologies: [
#     %{name: "Nginx", category: "Web Server", version: "1.21.6",
#       first_detected: ~D[2020-03-15], last_detected: ~D[2025-06-15]},
#     %{name: "React", category: "JavaScript Framework", version: "18.2.0",
#       first_detected: ~D[2023-01-10], last_detected: ~D[2025-06-15]},
#     %{name: "Cloudflare", category: "CDN", version: nil,
#       first_detected: ~D[2019-06-01], last_detected: ~D[2025-06-15]},
#     %{name: "Google Analytics 4", category: "Analytics", version: nil,
#       first_detected: ~D[2023-06-01], last_detected: ~D[2025-06-15]}
#   ],
#   meta: %{
#     last_crawled: ~U[2025-06-15 12:00:00Z],
#     first_indexed: ~D[2018-01-01],
#     vertical: "Technology"
#   }
# }

# Search for organizations using a specific technology
{:ok, users} = BuiltWith.technology_users("Shopify", country: "CZ", limit: 100)
# => %{total: 2_341, domains: ["shop1.cz", "shop2.cz", ...]}

# Get technology adoption trends
{:ok, trends} = BuiltWith.technology_trends("React")
# => %{current_sites: 14_500_000, growth_30d: "+2.3%", ...}

# Historical technology profile showing changes over time
{:ok, history} = BuiltWith.history("example.com")
# => %{changes: [
#   %{date: ~D[2023-01-10], added: ["React"], removed: ["jQuery"]},
#   %{date: ~D[2022-06-01], added: ["Next.js"], removed: ["Express"]},
#   ...
# ]}

# Detect vulnerable technologies by cross-referencing with NVD
{:ok, vulns} = BuiltWith.vulnerable_technologies("example.com")
# => %{vulnerable: [
#   %{tech: "jQuery 3.3.1", cves: ["CVE-2020-11022", "CVE-2020-11023"],
#     severity: "medium", recommendation: "Upgrade to 3.7.1+"}
# ]}

# Competitive technology comparison
{:ok, comparison} = BuiltWith.compare(["competitor1.com", "competitor2.com", "example.com"])
```

## Data Schema

### Technology Profile Response

```elixir
%BuiltWith.TechProfile{
  domain: "example.com",
  result: %{
    paths: [
      %{
        url: "https://example.com",
        domain: "example.com",
        technologies: [
          %{
            name: "Nginx",
            tag: "Web Server",
            categories: ["Web Servers"],
            description: "Nginx is an HTTP and reverse proxy server",
            link: "https://nginx.org",
            first_detected: 1584230400,
            last_detected: 1718409600,
            is_premium: false
          }
        ]
      }
    ],
    meta: %{
      vertical: "Technology",
      social: ["twitter.com/example", "linkedin.com/company/example"],
      company_name: "Example Inc.",
      telephones: ["+1-555-0123"],
      emails: ["info@example.com"],
      city: "San Francisco",
      state: "CA",
      country: "US"
    },
    spend: %{
      per_month: %{min: 500, max: 2000}
    }
  }
}
```

## Use Cases

### Vulnerability Assessment Through Technology Profiling

Security teams use BuiltWith to identify software versions running on target websites, then cross-reference detected versions with vulnerability databases (NVD, Exploit-DB). A WordPress 5.2 installation, an outdated jQuery version, or an unpatched Apache server immediately indicates potential attack vectors. This passive reconnaissance approach identifies vulnerabilities without touching the target's infrastructure, making it legal and undetectable.

### Competitive Technology Intelligence

Product teams and market analysts use BuiltWith to understand competitor technology stacks, identifying framework choices, analytics investments, and infrastructure providers. Technology adoption and abandonment patterns reveal strategic direction -- a competitor migrating from self-hosted infrastructure to cloud services may indicate scaling plans, while a switch from enterprise analytics to simpler tools may suggest budget constraints.

### Technology-Based Lead Generation

Sales teams use BuiltWith to identify organizations using specific technologies, enabling targeted outreach. For example, finding all companies in the Czech Republic using an outdated e-commerce platform creates a qualified lead list for migration services. Technology spend estimates provide additional qualification signals.

### Supply Chain Risk Assessment

Organizations assess their digital supply chain by profiling the technologies used across their vendor ecosystem. Third-party JavaScript libraries, analytics services, and CDN providers all represent potential supply chain attack vectors. BuiltWith's historical data reveals changes in third-party dependencies that may require security review.

### Web Application Firewall and Security Posture Assessment

BuiltWith detects the presence (or absence) of security technologies including WAFs, bot protection, CAPTCHA services, and security headers. This intelligence feeds into [security rating](/glossary/security-rating/) calculations and helps organizations benchmark their security technology adoption against industry peers.

## Limitations

**Detection Accuracy**: Technology detection relies on signatures and patterns that may produce false positives (detecting a technology that is not actually in use) or false negatives (missing technologies that obscure their fingerprints). Server-side technologies without HTTP-visible signatures are particularly difficult to detect accurately.

**Version Detection Gaps**: While BuiltWith detects many technology versions, version information is not always available, particularly for technologies that do not expose version numbers in client-visible responses. Version accuracy should be verified through direct assessment for critical security decisions.

**Pricing Barrier**: The $246/month minimum for API access places BuiltWith beyond the budget of many individual researchers and small organizations. The free tier provides very limited data suitable only for occasional manual lookups.

**Crawl Frequency**: Not all websites are crawled at the same frequency. Less popular or newer websites may have stale technology profiles. High-traffic sites are updated more frequently than niche properties.

**Single-Page Application Challenges**: Modern SPAs that load content dynamically may not be fully analyzed by BuiltWith's crawlers, potentially missing client-side technologies that require JavaScript execution and user interaction to reveal.

## Legal and Ethical Considerations

BuiltWith collects publicly visible information from websites through standard web crawling, which is generally considered legal under most jurisdictions. The platform does not bypass authentication, access restricted content, or perform any testing that could be construed as unauthorized access. All data is derived from information that websites voluntarily expose through HTTP responses, HTML content, and DNS records.

Organizations using BuiltWith for competitive intelligence should be aware that compiling detailed technology profiles of competitors may intersect with trade secret considerations in some jurisdictions, particularly if combined with non-public information obtained through other means.

When using BuiltWith data for vulnerability assessment, organizations should ensure they have authorization to investigate the target domains. While BuiltWith's passive detection does not constitute scanning or testing, acting on identified vulnerabilities without authorization would violate computer fraud laws.

Data from BuiltWith's meta fields (emails, phone numbers, social media profiles) is subject to [GDPR](/glossary/gdpr/) and privacy regulations when it pertains to identifiable individuals. Automated processing of this personal data requires a lawful basis and appropriate data protection measures.

## Integration with Prismatic Platform

Prismatic Platform integrates BuiltWith as a technology intelligence source in the [Prismatic Perimeter](/glossary/prismatic-perimeter/) [EASM](/glossary/easm/) module, providing passive technology profiling that complements active scanning data from Shodan, Censys, and BinaryEdge.

### Vulnerability Cross-Reference Pipeline

```elixir
defmodule Prismatic.Perimeter.TechVulnAnalysis do
  @moduledoc """
  Cross-references BuiltWith technology profiles with vulnerability
  databases to identify potential security weaknesses without active scanning.
  """

  def analyze(domain) do
    with {:ok, profile} <- BuiltWith.lookup(domain),
         technologies <- extract_versioned_technologies(profile),
         vulns <- cross_reference_nvd(technologies) do
      {:ok, %TechVulnReport{
        domain: domain,
        technologies: length(technologies),
        vulnerable_technologies: length(vulns),
        critical_cves: filter_critical(vulns),
        recommendations: generate_recommendations(vulns),
        security_rating_impact: calculate_rating_impact(vulns)
      }}
    end
  end
end
```

### Security Rating Contribution

Technology profiles contribute to the overall security rating by evaluating technology currency (are versions current?), security technology adoption (is a WAF present?), and known vulnerability exposure (do detected versions have CVEs?). These factors are weighted and combined with network-level scan data to produce the composite A-F security grade.

### Technology Change Monitoring

The platform periodically re-profiles monitored domains, comparing current technology stacks against historical baselines. Technology changes trigger automated security assessments -- a new JavaScript library may introduce vulnerabilities, a CDN change may affect DDoS resilience, and removal of a WAF degrades the security posture.

## Best Practices

**Verify Critical Findings**: BuiltWith detection is probabilistic. Before making security decisions based on detected technology versions, verify findings through direct observation (view-source, HTTP header inspection) or active scanning with authorization.

**Track Technology Changes Over Time**: Use historical data to establish baselines and detect meaningful changes. Technology migrations, new third-party integrations, and security tool additions or removals are all significant intelligence signals.

**Combine With Active Scanning**: BuiltWith provides passive technology detection that complements active scanner findings from Shodan and Censys. Active scanners detect open ports and services; BuiltWith adds application-layer technology context.

**Assess Supply Chain Risk**: Use technology profiles to identify all third-party JavaScript, analytics, and service dependencies. Each external dependency is a potential supply chain attack vector and should be evaluated for security and privacy implications.

**Benchmark Against Peers**: Compare technology profiles across organizations in the same industry to identify security posture outliers. Organizations lagging in security technology adoption relative to peers may represent higher risk.

## Related Providers

- [SecurityTrails](/osint/securitytrails/) - DNS and domain infrastructure intelligence for hosting analysis
- [Shodan](/osint/shodan/) - Service detection from the network perspective
- [NVD](/osint/nvd/) - Vulnerability data for detected software versions
- [Exploit-DB](/osint/exploit-db/) - Exploits for identified technologies
- [Censys](/osint/censys/) - Certificate and service data for cross-validation
- [FullHunt](/osint/fullhunt/) - Attack surface discovery with technology detection
- Wappalyzer - Alternative technology detection platform

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)