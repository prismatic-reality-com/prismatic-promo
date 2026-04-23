+++
title = "Compliance Assessment"
weight = 6
[extra]
description = "NIS2 Directive and ZKB 264/2025 Sb. compliance assessment from external attack surface data"
category = "perimeter"
method = "POST"
path = "/api/v1/perimeter/compliance"
status = "stable"
auth_required = true
glossary_terms = ["easm", "trinity-gate", "no-mercy", "nabla-infinity"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 515
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Compliance", "Assessment", "NIS2", "Directive", "2642025", "api", "perimeter", "Prismatic Platform", "Type", "Description"]
tags = ["api", "perimeter", "compliance-assessment", "prismatic"]
quality_score = 67
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Compliance Assessment - Prismatic Platform"
+++

## Overview

The Compliance Assessment endpoint evaluates an organization's externally observable security posture against regulatory compliance frameworks. Currently supported frameworks are the **NIS2 Directive** (EU 2022/2555) and the **ZKB 264/2025 Sb.** (Czech cybersecurity regulation). The assessment maps findings from the [Attack Surface Discovery](@/api/perimeter-discover.md) system to specific regulatory requirements and produces a structured compliance report with gap analysis.

Unlike internal compliance tools that require agent installation and access to internal systems, this endpoint assesses compliance purely from external observations. It answers the question: "Based on what is visible from the internet, does this organization appear to meet the externally observable requirements of the specified frameworks?"

Each compliance check maps to a specific article and paragraph of the regulatory text. The assessment produces a per-requirement status (compliant, partially compliant, non-compliant, or indeterminate) along with evidence citations and remediation guidance. The [NABLA Infinity](@/glossary/nabla-infinity.md) epistemic framework ensures that indeterminate findings are preserved as valid states rather than being collapsed into false certainty.

This capability positions the Prismatic Platform alongside dedicated GRC (Governance, Risk, and Compliance) tools while integrating directly with the EASM workflow.

## Endpoint

```
POST /api/v1/perimeter/compliance
```

Performs a compliance assessment against one or more regulatory frameworks using attack surface discovery data.

**Port**: 4004
**Content-Type**: `application/json`

## Authentication

Requires a valid API token with `perimeter:read` scope and `compliance:assess` permission.

```
Authorization: Bearer <api_token>
```

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token with appropriate scopes |
| `Content-Type` | Yes | Must be `application/json` |

### Body Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `domain` | string | Yes | -- | Domain to assess |
| `frameworks` | array | Yes | -- | Frameworks to assess against: `["nis2"]`, `["zkb"]`, or `["nis2", "zkb"]` |
| `options.include_evidence` | boolean | No | true | Include evidence citations for each finding |
| `options.include_remediation` | boolean | No | true | Include remediation guidance |
| `options.entity_type` | string | No | `essential` | NIS2 entity classification: `essential` or `important` |
| `options.sector` | string | No | none | Industry sector for NIS2 threshold determination |
| `options.scan_id` | string | No | latest | Use a specific scan's data instead of the latest |

### Example Request Body

```json
{
  "domain": "example.com",
  "frameworks": ["nis2", "zkb"],
  "options": {
    "include_evidence": true,
    "include_remediation": true,
    "entity_type": "essential",
    "sector": "digital_infrastructure"
  }
}
```

## Response

### Success Response (200 OK)

```json
{
  "ok": true,
  "data": {
    "domain": "example.com",
    "assessment_id": "assess_2026021210450001",
    "assessed_at": "2026-02-12T10:45:00.000Z",
    "overall_compliance": {
      "status": "partially_compliant",
      "score": 74,
      "compliant_requirements": 28,
      "partially_compliant": 8,
      "non_compliant": 3,
      "indeterminate": 5
    },
    "frameworks": {
      "nis2": {
        "full_name": "Directive (EU) 2022/2555 (NIS2)",
        "status": "partially_compliant",
        "score": 76,
        "entity_type": "essential",
        "requirements": [
          {
            "id": "NIS2-Art21-2a",
            "article": "Article 21(2)(a)",
            "title": "Policies on risk analysis and information system security",
            "status": "compliant",
            "confidence": 0.87,
            "evidence": [
              "HTTPS enforced on all discovered endpoints",
              "TLSv1.3 deployed on 10/12 services",
              "Security headers present on primary domains"
            ],
            "findings": []
          },
          {
            "id": "NIS2-Art21-2d",
            "article": "Article 21(2)(d)",
            "title": "Supply chain security",
            "status": "indeterminate",
            "confidence": 0.35,
            "evidence": [
              "Third-party CDN detected (Cloudflare)",
              "External JavaScript from 3 domains loaded"
            ],
            "findings": [
              {
                "severity": "medium",
                "description": "Supply chain security cannot be fully assessed from external observation",
                "recommendation": "Internal assessment recommended for complete evaluation"
              }
            ]
          },
          {
            "id": "NIS2-Art21-2j",
            "article": "Article 21(2)(j)",
            "title": "Use of cryptography and encryption",
            "status": "partially_compliant",
            "confidence": 0.72,
            "evidence": [
              "TLS encryption on all HTTPS services",
              "2 services still accepting TLSv1.2 (1.3 recommended)",
              "HSTS headers deployed on main domain"
            ],
            "findings": [
              {
                "severity": "medium",
                "description": "TLSv1.2 still accepted on staging.example.com and mail.example.com",
                "recommendation": "Disable TLSv1.2, enforce TLSv1.3 minimum on all endpoints"
              }
            ],
            "remediation": {
              "priority": "medium",
              "effort": "low",
              "description": "Update TLS configuration to require TLSv1.3 minimum",
              "steps": [
                "Update nginx/Apache TLS configuration on staging.example.com",
                "Update mail server TLS configuration on mail.example.com",
                "Test with SSL Labs or similar to verify TLSv1.3 enforcement"
              ]
            }
          }
        ]
      },
      "zkb": {
        "full_name": "Vyhlaska 264/2025 Sb. (ZKB - Czech Cybersecurity Regulation)",
        "status": "partially_compliant",
        "score": 71,
        "requirements": [
          {
            "id": "ZKB-S4",
            "section": "Section 4",
            "title": "Rizeni pristupu (Access Management)",
            "status": "compliant",
            "confidence": 0.81,
            "evidence": [
              "No open administrative interfaces detected",
              "Authentication required on all API endpoints",
              "No default credentials detected"
            ],
            "findings": []
          },
          {
            "id": "ZKB-S8",
            "section": "Section 8",
            "title": "Bezpecnost siti (Network Security)",
            "status": "non_compliant",
            "confidence": 0.90,
            "evidence": [
              "Staging environment publicly accessible without access controls",
              "Internal service names leak through HTTP headers"
            ],
            "findings": [
              {
                "severity": "high",
                "description": "Staging environment at staging.example.com is publicly accessible",
                "recommendation": "Implement IP allowlisting or VPN requirement for staging access"
              }
            ],
            "remediation": {
              "priority": "high",
              "effort": "medium",
              "description": "Restrict staging environment access and sanitize HTTP response headers",
              "steps": [
                "Configure firewall rules to restrict staging.example.com access",
                "Remove server version headers from all HTTP responses",
                "Implement VPN or IP allowlist for non-production environments"
              ]
            }
          }
        ]
      }
    },
    "scan_basis": {
      "scan_id": "scan_2026021210300001",
      "scan_date": "2026-02-12T10:30:00.000Z",
      "assets_evaluated": 23
    }
  },
  "meta": {
    "request_id": "req_compliance_001",
    "dispatched_to": "PrismaticPerimeter.assess_compliance/2",
    "execution_time_ms": 1847
  }
}
```

### Compliance Status Values

| Status | Meaning |
|--------|---------|
| `compliant` | All externally observable requirements met |
| `partially_compliant` | Some requirements met, gaps identified |
| `non_compliant` | Significant gaps that clearly violate the requirement |
| `indeterminate` | Cannot be assessed from external observation alone |

### Confidence Levels

Each requirement includes a confidence score (0.0 to 1.0) indicating how reliably the compliance status can be determined from external observation. The [NABLA Infinity](@/glossary/nabla-infinity.md) framework mandates that low-confidence assessments are flagged rather than presented as certain.

| Confidence | Interpretation |
|------------|---------------|
| 0.80-1.00 | High confidence -- strong external evidence |
| 0.60-0.79 | Moderate confidence -- partial external evidence |
| 0.40-0.59 | Low confidence -- limited external evidence |
| 0.00-0.39 | Indeterminate -- requires internal assessment |

## Code Examples

### curl

```bash
# Assess NIS2 compliance
curl -s -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com", "frameworks": ["nis2"]}' \
  http://localhost:4004/api/v1/perimeter/compliance | jq '.data.overall_compliance'

# Assess both frameworks with full evidence
curl -s -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com", "frameworks": ["nis2", "zkb"], "options": {"include_evidence": true}}' \
  http://localhost:4004/api/v1/perimeter/compliance | \
  jq '.data.frameworks | to_entries[] | {framework: .key, status: .value.status, score: .value.score}'

# Extract non-compliant requirements only
curl -s -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com", "frameworks": ["nis2", "zkb"]}' \
  http://localhost:4004/api/v1/perimeter/compliance | \
  jq '[.data.frameworks[].requirements[] | select(.status == "non_compliant")]'
```

### Elixir

```elixir
# Assess compliance
{:ok, assessment} = PrismaticPerimeter.assess_compliance("example.com", [:nis2, :zkb])

# Check overall status
IO.puts("Compliance: #{assessment.overall_compliance.status} (#{assessment.overall_compliance.score}%)")

# Find non-compliant requirements
non_compliant =
  assessment.frameworks
  |> Enum.flat_map(fn {_fw, data} -> data.requirements end)
  |> Enum.filter(&(&1.status == :non_compliant))

Enum.each(non_compliant, fn req ->
  IO.puts("NON-COMPLIANT: #{req.id} - #{req.title}")
end)
```

### Python

```python
import requests

headers = {
    "Authorization": f"Bearer {api_token}",
    "Content-Type": "application/json"
}

payload = {
    "domain": "example.com",
    "frameworks": ["nis2", "zkb"],
    "options": {
        "entity_type": "essential",
        "sector": "digital_infrastructure"
    }
}

response = requests.post(
    "http://localhost:4004/api/v1/perimeter/compliance",
    headers=headers,
    json=payload
)

data = response.json()["data"]
print(f"Overall: {data['overall_compliance']['status']} ({data['overall_compliance']['score']}%)")

for fw_name, fw_data in data["frameworks"].items():
    print(f"\n{fw_data['full_name']}: {fw_data['status']} ({fw_data['score']}%)")
    for req in fw_data["requirements"]:
        if req["status"] in ("non_compliant", "partially_compliant"):
            print(f"  [{req['status'].upper()}] {req['id']}: {req['title']}")
```

## Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_domain` | Domain format is invalid |
| 400 | `invalid_framework` | Unrecognized compliance framework |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `insufficient_scope` | Token lacks required scopes |
| 404 | `no_scan_data` | No discovery data available (run a discovery scan first) |
| 429 | `rate_limited` | Assessment rate limit exceeded |

## Rate Limits

| Limit Type | Value | Window |
|------------|-------|--------|
| Per token | 30 requests | 1 minute |
| Per domain | 10 assessments | 1 hour |
| Burst | 3 requests | 10 seconds |

## Related Endpoints

- [Attack Surface Discovery](@/api/perimeter-discover.md) -- Generate the discovery data that compliance assessment uses
- [Security Rating](@/api/perimeter-rating.md) -- Complementary security score from the same underlying data
- [Webhooks](@/api/webhooks.md) -- Get notified when compliance status changes
- [Error Handling](@/api/error-handling.md) -- Standard error response format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)