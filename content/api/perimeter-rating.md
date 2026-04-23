+++
title = "Security Rating"
weight = 5
[extra]
description = "A-F security grades with numeric scores from 300-900 based on external attack surface analysis"
category = "perimeter"
method = "GET"
path = "/api/v1/perimeter/rating"
status = "stable"
auth_required = true
glossary_terms = ["easm", "trinity-gate", "quality-dna", "no-mercy"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 659
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Security", "Rating", "300-900", "api", "perimeter", "Prismatic Platform", "Description", "Type", "Category"]
tags = ["api", "perimeter", "security-rating", "prismatic"]
quality_score = 67
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Security Rating - Prismatic Platform"
+++

## Overview

The Security Rating endpoint delivers a quantified security assessment for any domain, expressed as both a letter grade (A through F) and a numeric score (300-900). This rating aggregates evidence from the [Attack Surface Discovery](@/api/perimeter-discover.md) system across multiple security dimensions: network security, application security, DNS health, email security, certificate management, and vulnerability exposure.

The rating methodology is designed to be comparable to commercial security rating platforms such as BitSight (250-900 scale), SecurityScorecard (0-100 per factor), and Black Kite (technical grade). The Prismatic rating uses a 300-900 numeric scale with letter grade mapping that corresponds to industry expectations.

Ratings are evidence-based and fully traceable. Every point deduction is linked to a specific finding with remediation guidance. This transparency allows organizations to understand exactly why they received a particular grade and what actions would improve their score. The [Trinity Gate](@/glossary/trinity-gate.md) verification ensures that no rating is issued without structural, logical, and formal consistency in the underlying evidence.

## Endpoint

```
GET /api/v1/perimeter/rating
```

Returns the security rating for a specified domain. If a recent discovery scan exists (within the configured cache window), the rating is computed from cached data. Otherwise, a lightweight scan is triggered automatically.

**Port**: 4004
**Content-Type**: `application/json`

## Authentication

Requires a valid API token with `perimeter:read` scope.

```
Authorization: Bearer <api_token>
```

## Request

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `domain` | string | Yes | -- | Domain to rate (e.g., `example.com`) |
| `include_breakdown` | boolean | No | true | Include per-category score breakdown |
| `include_findings` | boolean | No | false | Include individual findings that affect the score |
| `industry` | string | No | none | Industry vertical for percentile calculation (e.g., `finance`, `healthcare`, `technology`) |

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token with `perimeter:read` scope |
| `Accept` | No | Defaults to `application/json` |

### Example Request

```
GET /api/v1/perimeter/rating?domain=example.com&include_breakdown=true&industry=technology HTTP/1.1
Host: localhost:4004
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Response

### Success Response (200 OK)

```json
{
  "ok": true,
  "data": {
    "domain": "example.com",
    "rating": {
      "grade": "B",
      "score": 780,
      "label": "Good",
      "percentile": 72,
      "industry_percentile": 68,
      "trend": "improving",
      "trend_delta": +15,
      "last_updated": "2026-02-12T10:30:00.000Z"
    },
    "breakdown": {
      "network_security": {
        "score": 85,
        "weight": 0.25,
        "grade": "B+",
        "findings_count": 3,
        "factors": [
          "TLS configuration is strong on primary domains",
          "2 hosts running outdated TLS versions",
          "No open database ports detected"
        ]
      },
      "application_security": {
        "score": 72,
        "weight": 0.20,
        "grade": "B-",
        "findings_count": 5,
        "factors": [
          "Security headers present on main site",
          "Missing Content-Security-Policy on 3 subdomains",
          "Staging environment publicly accessible"
        ]
      },
      "dns_health": {
        "score": 90,
        "weight": 0.15,
        "grade": "A-",
        "findings_count": 1,
        "factors": [
          "DNSSEC enabled",
          "SPF, DKIM, DMARC properly configured",
          "CAA records present"
        ]
      },
      "email_security": {
        "score": 88,
        "weight": 0.15,
        "grade": "A-",
        "findings_count": 1,
        "factors": [
          "DMARC policy set to reject",
          "DKIM signing active",
          "MTA-STS enabled"
        ]
      },
      "certificate_management": {
        "score": 65,
        "weight": 0.15,
        "grade": "C+",
        "findings_count": 4,
        "factors": [
          "2 certificates expiring within 30 days",
          "1 certificate using RSA-2048 (ECDSA recommended)",
          "Wildcard certificate covers primary domains"
        ]
      },
      "vulnerability_exposure": {
        "score": 78,
        "weight": 0.10,
        "grade": "B",
        "findings_count": 2,
        "factors": [
          "No known critical CVEs on exposed services",
          "2 services running versions with medium-severity patches available"
        ]
      }
    },
    "grade_scale": {
      "A": { "min": 850, "max": 900, "label": "Excellent" },
      "B": { "min": 700, "max": 849, "label": "Good" },
      "C": { "min": 550, "max": 699, "label": "Fair" },
      "D": { "min": 400, "max": 549, "label": "Poor" },
      "F": { "min": 300, "max": 399, "label": "Critical" }
    },
    "scan_basis": {
      "scan_id": "scan_2026021210300001",
      "scan_date": "2026-02-12T10:30:00.000Z",
      "assets_evaluated": 23,
      "data_freshness": "fresh"
    }
  },
  "meta": {
    "request_id": "req_rating_001",
    "dispatched_to": "PrismaticPerimeter.security_rating/1",
    "execution_time_ms": 234
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data.rating.grade` | string | Letter grade: A, B, C, D, or F |
| `data.rating.score` | integer | Numeric score from 300 to 900 |
| `data.rating.label` | string | Human-readable label (Excellent, Good, Fair, Poor, Critical) |
| `data.rating.percentile` | integer | Percentile rank across all rated domains (0-100) |
| `data.rating.industry_percentile` | integer | Percentile within the specified industry vertical |
| `data.rating.trend` | string | Score trend: `improving`, `stable`, `declining` |
| `data.rating.trend_delta` | integer | Score change since last rating |
| `data.breakdown` | object | Per-category score breakdown (when `include_breakdown=true`) |
| `data.breakdown.*.score` | integer | Category score (0-100) |
| `data.breakdown.*.weight` | number | Category weight in overall score calculation |
| `data.breakdown.*.grade` | string | Category letter grade with +/- modifier |
| `data.scan_basis` | object | Information about the underlying discovery scan |

### Grade Scale

| Grade | Score Range | Label | Description |
|-------|------------|-------|-------------|
| A | 850-900 | Excellent | Industry-leading security posture |
| B | 700-849 | Good | Strong security with minor improvement areas |
| C | 550-699 | Fair | Adequate security with notable gaps |
| D | 400-549 | Poor | Significant security concerns requiring attention |
| F | 300-399 | Critical | Severe security deficiencies requiring immediate action |

## Code Examples

### curl

```bash
# Get security rating
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/perimeter/rating?domain=example.com" | jq '.data.rating'

# Get rating with full breakdown
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/perimeter/rating?domain=example.com&include_breakdown=true" | \
  jq '.data.breakdown | to_entries[] | {category: .key, score: .value.score, grade: .value.grade}'

# Compare against industry
curl -s -H "Authorization: Bearer $API_TOKEN" \
  "http://localhost:4004/api/v1/perimeter/rating?domain=example.com&industry=technology" | \
  jq '{grade: .data.rating.grade, score: .data.rating.score, industry_percentile: .data.rating.industry_percentile}'
```

### Elixir

```elixir
# Direct function call
{:ok, rating} = PrismaticPerimeter.security_rating("example.com")

IO.puts("Grade: #{rating.grade} (#{rating.score}/900)")
IO.puts("Percentile: #{rating.percentile}th")

# With industry context
{:ok, rating} = PrismaticPerimeter.security_rating("example.com", industry: :technology)

# Check for poor ratings
if rating.score < 550 do
  Logger.error("Domain #{rating.domain} has a poor security rating: #{rating.grade}")
end
```

### Python

```python
import requests

headers = {"Authorization": f"Bearer {api_token}"}
params = {
    "domain": "example.com",
    "include_breakdown": True,
    "industry": "technology"
}

response = requests.get(
    "http://localhost:4004/api/v1/perimeter/rating",
    headers=headers,
    params=params
)

data = response.json()["data"]
rating = data["rating"]

print(f"Security Rating: {rating['grade']} ({rating['score']}/900)")
print(f"Industry Percentile: {rating['industry_percentile']}th")
print(f"Trend: {rating['trend']} ({rating['trend_delta']:+d})")

if "breakdown" in data:
    print("\nCategory Breakdown:")
    for category, details in data["breakdown"].items():
        print(f"  {category}: {details['grade']} ({details['score']}/100)")
```

## Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_domain` | Domain format is invalid |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `insufficient_scope` | Token lacks `perimeter:read` scope |
| 404 | `no_scan_data` | No discovery data available for this domain (run a scan first) |
| 422 | `invalid_industry` | Unrecognized industry vertical |
| 429 | `rate_limited` | Rating request rate limit exceeded |

## Rate Limits

| Limit Type | Value | Window |
|------------|-------|--------|
| Per token | 60 requests | 1 minute |
| Per domain | 30 requests | 1 hour |
| Burst | 5 requests | 1 second |

Ratings are computed from cached discovery data and are computationally lightweight. The per-domain limit prevents excessive re-rating of the same domain.

## Related Endpoints

- [Attack Surface Discovery](@/api/perimeter-discover.md) -- Run a discovery scan to generate rating data
- [Compliance Assessment](@/api/perimeter-compliance.md) -- Assess compliance using the same underlying data
- [Webhooks](@/api/webhooks.md) -- Get notified when a domain's rating changes
- [Batch Operations](@/api/batch-operations.md) -- Rate multiple domains in a single request

## Methodology

The rating algorithm is transparent and reproducible. The overall score is a weighted sum of category scores, where each category evaluates specific security controls:

1. **Network Security** (25%) -- TLS configuration, open ports, firewall effectiveness, protocol versions
2. **Application Security** (20%) -- Security headers, exposed endpoints, staging/dev environments, WAF presence
3. **DNS Health** (15%) -- DNSSEC, CAA records, zone configuration, dangling records
4. **Email Security** (15%) -- SPF, DKIM, DMARC, MTA-STS, DANE
5. **Certificate Management** (15%) -- Expiry dates, key strength, chain completeness, revocation status
6. **Vulnerability Exposure** (10%) -- Known CVEs on exposed services, patch currency, end-of-life software

Every finding includes a severity classification (critical, high, medium, low, informational) and specific remediation guidance. The [Quality DNA](@/glossary/quality-dna.md) system tracks rating methodology changes across platform versions to ensure scoring consistency.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)