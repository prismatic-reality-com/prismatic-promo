+++
title = "IPQualityScore"
weight = 31
[extra]
category = "global"
type = "ip"
module = "Ipqualityscore"
description = "Fraud prevention platform with IP reputation, email validation, phone verification, and proxy detection"
has_api = true
url = "https://www.ipqualityscore.com"
rate_limit = "5000 req/mo (free), 100000 req/mo (starter), unlimited (enterprise)"
capabilities = ["IP Fraud Score", "Proxy/VPN Detection", "Email Validation", "Phone Validation", "URL Scanning", "Device Fingerprinting", "Leaked Data Check", "Transaction Scoring"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 1003
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["IPQualityScore", "Fraud", "osint", "global", "Prismatic Platform", "IPQS", "Description"]
tags = ["osint", "global", "ipqualityscore", "prismatic"]
quality_score = 75
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "IPQualityScore - Prismatic Platform"
+++

## Overview

IPQualityScore (IPQS) is a comprehensive fraud prevention and threat detection platform that provides real-time risk scoring for IP addresses, email addresses, phone numbers, and URLs. IPQS processes over 3 billion API requests monthly, analyzing signals from proxy/VPN detection, behavioral analysis, device fingerprinting, and machine learning models to produce a 0-100 fraud score that represents the likelihood of malicious or fraudulent activity.

What makes IPQS particularly valuable for [OSINT](@/glossary/osint.md) is its multi-dimensional approach: rather than just scoring IPs, it provides a unified fraud assessment across email, phone, device, and network layers. This allows investigators to build a comprehensive risk profile from any starting identifier. The platform maintains a proprietary threat intelligence network that tracks over 1 billion malicious indicators, updated continuously from honeypots, partner feeds, and user-reported abuse data.

IPQS distinguishes between different types of anonymization services with high precision. While basic VPN detection is available from many providers, IPQS identifies specific VPN services, differentiates between commercial VPNs and residential proxies, detects Tor exit nodes in real-time, and identifies sophisticated evasion techniques like residential proxy networks that route traffic through compromised consumer devices.

Within the Prismatic Platform, IPQualityScore provides fraud scoring and validation capabilities for the [HAWKEYE](@/apps/prismatic-hawkeye.md) visitor intelligence system and feeds risk signals into the [Prismatic Perimeter](@/apps/prismatic-perimeter.md) [security rating](@/glossary/security-rating.md) engine.

## Data Coverage

| Data Type | Description |
|-----------|-------------|
| **IP Fraud Score** | 0-100 [risk score](@/glossary/risk-score.md) based on behavioral and network analysis |
| **Proxy Detection** | VPN, proxy, Tor, residential proxy identification |
| **Bot Detection** | Automated traffic and crawler identification |
| **Email Validation** | Deliverability, disposable detection, fraud scoring |
| **Phone Validation** | Active status, carrier, line type, fraud risk |
| **URL Scanning** | Phishing, malware, and parking domain detection |
| **Device Fingerprint** | Browser, OS, hardware analysis for fraud detection |
| **Leaked Credentials** | Email and password exposure from breaches |
| **Connection Type** | Residential, mobile, corporate, data center |
| **Abuse Velocity** | Rate of abuse reports for an IP over time |

### Fraud Score Interpretation

The fraud score is calibrated against millions of confirmed fraud cases, ensuring that scores above 75 have a very high true positive rate while maintaining low false positive rates below score 25:

| Score Range | Classification | Recommended Action | False Positive Rate |
|-------------|---------------|-------------------|-------------------|
| **0-25** | Low Risk | Allow transaction | < 0.1% |
| **26-50** | Moderate Risk | Additional verification | < 1% |
| **51-75** | High Risk | Manual review required | < 5% |
| **76-100** | Critical Risk | Block or escalate | < 10% |

### Proxy and VPN Detection Granularity

IPQS provides granular detection that goes beyond simple VPN/proxy binary flags:

| Detection Type | Description | Evasion Difficulty |
|---------------|-------------|-------------------|
| **Commercial VPN** | NordVPN, ExpressVPN, Surfshark, etc. | Low |
| **Corporate VPN** | Enterprise VPN gateways | Medium |
| **Public Proxy** | Open HTTP/SOCKS proxies | Low |
| **Residential Proxy** | Traffic routed through consumer devices | High |
| **Tor Exit Node** | Tor network exit points | Low |
| **Data Center** | Cloud/hosting provider IPs | Low |
| **iCloud Relay** | Apple iCloud Private Relay | Medium |
| **Cloudflare WARP** | Cloudflare WARP/1.1.1.1 | Medium |

## Integration with Prismatic

IPQualityScore feeds fraud intelligence into the Prismatic Platform, complementing [IPinfo](@/osint/ipinfo.md) geolocation and [AbuseIPDB](@/osint/abuseipdb.md) reputation data.

```elixir
# Score an IP address
{:ok, score} = IpQualityScore.check_ip("1.2.3.4")
# => %{
#   success: true,
#   fraud_score: 85,
#   country_code: "RU",
#   city: "Moscow",
#   isp: "DataLine Ltd",
#   organization: "DataLine",
#   is_crawler: false,
#   timezone: "Europe/Moscow",
#   mobile: false,
#   proxy: true,
#   vpn: true,
#   tor: false,
#   active_vpn: true,
#   active_tor: false,
#   recent_abuse: true,
#   bot_status: false,
#   abuse_velocity: "high",
#   connection_type: "Premium required",
#   operating_system: "Linux",
#   browser: "Chrome"
# }

# Validate an email address
{:ok, email_result} = IpQualityScore.validate_email("user@example.com")
# => %{
#   valid: true,
#   disposable: false,
#   smtp_score: 3,
#   overall_score: 1,
#   dns_valid: true,
#   honeypot: false,
#   deliverability: "high",
#   spam_trap_score: "none",
#   leaked: true,
#   fraud_score: 15,
#   frequent_complainer: false,
#   suspect: false
# }

# Validate a phone number
{:ok, phone_result} = IpQualityScore.validate_phone("+14155550123")
# => %{valid: true, active: true, carrier: "T-Mobile", line_type: "Wireless",
#       fraud_score: 10, risky: false, prepaid: false, do_not_call: false}

# Scan a URL for threats
{:ok, url_result} = IpQualityScore.scan_url("https://suspicious-site.com/login")
# => %{unsafe: true, domain_rank: 0, phishing: true, malware: false,
#       parking: false, spamming: false, fraud_score: 95, risk_score: 90}

# Check for leaked credentials
{:ok, leak_check} = IpQualityScore.leaked_check("user@example.com")

# Transaction scoring with device context
{:ok, transaction} = IpQualityScore.transaction_scoring(%{
  ip: "1.2.3.4",
  email: "user@example.com",
  billing_phone: "+14155550123",
  order_amount: 500.00,
  billing_country: "US"
})
```

### Multi-Layer Fraud Detection Pipeline

The multi-layer fraud detection pipeline combines IPQualityScore with other Prismatic intelligence sources for comprehensive risk assessment:

```elixir
defmodule PrismaticHawkeye.FraudDetection.MultiLayerScorer do
  @moduledoc """
  Multi-layer fraud detection combining IPQualityScore with
  IPInfo, AbuseIPDB, and EmailRep for comprehensive risk assessment.
  """

  def assess_visitor(ip, email, _user_agent) do
    tasks = [
      Task.async(fn -> IpQualityScore.check_ip(ip) end),
      Task.async(fn -> IpQualityScore.validate_email(email) end),
      Task.async(fn -> IpInfo.lookup(ip) end),
      Task.async(fn -> EmailRep.query(email) end)
    ]

    [ip_score, email_score, ip_info, email_rep] = Task.await_many(tasks, 10_000)

    {:ok, %{
      ip: ip,
      email: email,
      ip_fraud_score: ip_score[:fraud_score],
      email_fraud_score: email_score[:fraud_score],
      is_proxy: ip_score[:proxy] || ip_score[:vpn],
      is_disposable: email_score[:disposable],
      geolocation: %{country: ip_info[:country], city: ip_info[:city]},
      email_reputation: email_rep[:reputation],
      composite_risk: calculate_composite_risk(ip_score, email_score, email_rep),
      action: determine_action(ip_score, email_score)
    }}
  end

  defp calculate_composite_risk(ip_score, email_score, email_rep) do
    weights = %{ip: 0.40, email: 0.30, reputation: 0.30}

    ip_risk = (ip_score[:fraud_score] || 0) * weights.ip
    email_risk = (email_score[:fraud_score] || 0) * weights.email
    rep_risk = reputation_to_score(email_rep[:reputation]) * weights.reputation

    round(ip_risk + email_risk + rep_risk)
  end
end
```

### Real-Time Visitor Scoring

For the [HAWKEYE](@/apps/prismatic-hawkeye.md) visitor intelligence system, IPQS provides sub-100ms IP scoring that enables real-time access control decisions:

```elixir
defmodule PrismaticHawkeye.RealTime.VisitorGate do
  @moduledoc """
  Real-time visitor gate using IPQualityScore for
  immediate fraud scoring and access control.
  """

  def gate_visitor(conn) do
    ip = get_client_ip(conn)

    case IpQualityScore.check_ip(ip, strictness: 1) do
      {:ok, %{fraud_score: score}} when score >= 85 ->
        {:block, "High fraud risk: #{score}"}

      {:ok, %{fraud_score: score, vpn: true}} when score >= 50 ->
        {:challenge, "VPN with elevated risk: #{score}"}

      {:ok, %{tor: true}} ->
        {:challenge, "Tor exit node detected"}

      {:ok, %{fraud_score: score}} ->
        {:allow, "Risk score: #{score}"}

      {:error, reason} ->
        {:allow, "Fallback: scoring unavailable (#{reason})"}
    end
  end
end
```

## Scoring Methodology

IPQS employs a multi-signal approach to generate fraud scores, combining real-time behavioral analysis with historical reputation data:

| Signal Category | Weight | Description |
|----------------|--------|-------------|
| **Network Reputation** | 25% | Historical abuse reports and blacklist presence |
| **Behavioral Analysis** | 20% | Request patterns, timing, and volume anomalies |
| **Infrastructure Type** | 15% | Data center, residential, mobile classification |
| **Anonymization** | 15% | VPN, proxy, Tor detection signals |
| **Geographic Risk** | 10% | Country and region risk assessment |
| **Device Fingerprint** | 10% | Browser, OS, and hardware anomalies |
| **Velocity** | 5% | Rate of activity from the IP over time |

### Strictness Levels

The API supports configurable strictness levels that adjust the scoring sensitivity:

| Level | Description | Use Case |
|-------|-------------|----------|
| **0 (Low)** | Fewer false positives, may miss some fraud | General traffic scoring |
| **1 (Medium)** | Balanced detection and false positive rate | Default recommendation |
| **2 (High)** | Aggressive detection, higher false positives | High-security applications |
| **3 (Maximum)** | Maximum sensitivity | Financial transactions |

## Rate Limits and Access

| Tier | Requests/Month | Features | Price |
|------|---------------|----------|-------|
| **Free** | 5,000 | IP scoring, basic email validation | Free |
| **Starter** | 100,000 | All endpoints, phone validation | $19.99/mo |
| **Business** | 1,000,000 | Device fingerprinting, webhooks | Custom |
| **Enterprise** | Unlimited | Custom models, dedicated support | Custom |

### Authentication

API key passed as URL parameter (`key=`). Free tier available with registration. All endpoints support both GET and POST methods.

### API Endpoints

| Endpoint | Description | Key Parameters |
|----------|-------------|----------------|
| `/api/json/ip/{ip}` | IP fraud scoring | strictness, allow_public_access_points |
| `/api/json/email/{email}` | Email validation | abuse_strictness, timeout |
| `/api/json/phone/{phone}` | Phone validation | country, strictness |
| `/api/json/url/{url}` | URL malware/phishing scan | strictness |
| `/api/json/leaked/check` | Leaked credential check | type (email/username) |
| `/api/json/postback` | Transaction scoring | Multiple fields |

## Use Cases

### Fraud Prevention
- Score visitor IPs in real-time for the [HAWKEYE](@/apps/prismatic-hawkeye.md) system
- Validate email addresses during registration workflows to block disposable addresses
- Detect VPN/proxy usage for access control policies and risk assessment
- Score transactions combining IP, email, and phone risk signals

### Phishing Detection
- Scan suspicious URLs for phishing indicators with domain age and reputation analysis
- Validate email sender reputation in security workflows
- Cross-reference with [PhishTank](@/osint/phishtank.md) for community verification
- Feed URL risk scores into email gateway filtering decisions

### Identity Verification
- Multi-factor validation (IP + email + phone) for KYC workflows
- Detect disposable emails and virtual phone numbers used in synthetic identity fraud
- Correlate with [EmailRep](@/osint/emailrep.md) for email reputation context
- Verify phone number validity and carrier information for contact verification

### Account Security
- Detect credential stuffing attacks through IP fraud scoring patterns
- Identify account takeover attempts from anomalous IP locations or anonymization
- Monitor login attempts for suspicious patterns using abuse velocity metrics
- Cross-reference with [Have I Been Pwned](@/osint/haveibeenpwned.md) for credential exposure

### Supply Chain Risk
- Validate vendor contact information authenticity during onboarding
- Score IP addresses used in business communications for fraud indicators
- Verify email domain legitimacy for new business relationships
- Feed risk data into [NIS2](@/glossary/nis2.md) supply chain compliance assessments

## Related Sources

- [IPinfo](@/osint/ipinfo.md) - IP geolocation and ASN intelligence
- [AbuseIPDB](@/osint/abuseipdb.md) - Community IP abuse reporting
- [EmailRep](@/osint/emailrep.md) - Email reputation scoring
- [GreyNoise](@/osint/greynoise.md) - Internet scanner identification
- [PhishTank](@/osint/phishtank.md) - Community phishing URL verification
- [MaxMind](@/osint/maxmind.md) - GeoIP and fraud detection databases
- [Have I Been Pwned](@/osint/haveibeenpwned.md) - Credential exposure checks

## Related Platform Components

- [OSINT Core](@/apps/prismatic-osint-core.md) - Core OSINT framework and adapter layer
- [Prismatic Perimeter](@/apps/prismatic-perimeter.md) - Fraud scoring in [EASM](@/glossary/easm.md) ratings
- [HAWKEYE](@/apps/prismatic-hawkeye.md) - Visitor intelligence with fraud detection

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)