+++
title = "Attack Surface Discovery"
weight = 4
[extra]
description = "Domain enumeration, subdomain scanning, and asset fingerprinting for external attack surface mapping"
category = "perimeter"
method = "POST"
path = "/api/v1/perimeter/discover"
status = "stable"
auth_required = true
glossary_terms = ["easm", "aiad", "no-mercy", "color-teams"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 663
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Attack", "Surface", "Discovery", "Domain", "api", "perimeter", "Prismatic Platform", "Type", "Description", "Whether"]
tags = ["api", "perimeter", "attack-surface-discovery", "prismatic"]
quality_score = 70
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Attack Surface Discovery - Prismatic Platform"
+++

## Overview

The Attack Surface Discovery endpoint is the primary entry point for the Prismatic Perimeter [EASM](@/glossary/easm.md) (External Attack Surface Management) system. Given a target domain, it performs comprehensive enumeration of the organization's externally visible digital assets: subdomains, IP addresses, SSL/TLS certificates, cloud resources, open services, and technology fingerprints.

Discovery operates in layers. The first pass performs passive reconnaissance using DNS records, certificate transparency logs, and WHOIS data. Subsequent passes perform active probing of discovered assets to identify open ports, running services, HTTP headers, and technology stacks. The entire process is orchestrated by the Perimeter domain's agent pipeline, which coordinates multiple specialized discovery agents working in parallel.

The endpoint returns structured asset data that feeds into the [Security Rating](@/api/perimeter-rating.md) and [Compliance Assessment](@/api/perimeter-compliance.md) systems. Every discovered asset is assigned a risk score based on its exposure characteristics, known vulnerabilities, and configuration quality.

This endpoint competes directly with commercial EASM platforms like BitSight, Black Kite, and SecurityScorecard, providing equivalent functionality within the Prismatic Platform ecosystem.

## Endpoint

```
POST /api/v1/perimeter/discover
```

Initiates an attack surface discovery scan for the specified domain. The scan may take several seconds to complete depending on the size of the target's attack surface and the configured scan depth.

**Port**: 4004
**Content-Type**: `application/json`

## Authentication

Requires a valid API token with `perimeter:read` scope. Discovery operations are resource-intensive and are restricted to authenticated users with appropriate permissions.

```
Authorization: Bearer <api_token>
```

See [Authentication](@/api/authentication.md) for scope management.

## Request

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token with `perimeter:read` scope |
| `Content-Type` | Yes | Must be `application/json` |
| `X-Request-ID` | No | Client-provided correlation ID for tracing |

### Body Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `domain` | string | Yes | -- | Target domain for discovery (e.g., `example.com`) |
| `options.include_subdomains` | boolean | No | true | Whether to enumerate subdomains |
| `options.max_depth` | integer | No | 3 | Maximum subdomain depth (e.g., depth 2 = `sub.sub.example.com`) |
| `options.scan_ports` | boolean | No | true | Whether to scan common ports on discovered hosts |
| `options.fingerprint` | boolean | No | true | Whether to fingerprint technologies on discovered services |
| `options.certificate_transparency` | boolean | No | true | Whether to query CT logs |
| `options.passive_only` | boolean | No | false | If true, skip active scanning (DNS/CT/WHOIS only) |
| `options.timeout_seconds` | integer | No | 120 | Maximum scan duration before returning partial results |

### Example Request Body

```json
{
  "domain": "example.com",
  "options": {
    "include_subdomains": true,
    "max_depth": 3,
    "scan_ports": true,
    "fingerprint": true,
    "certificate_transparency": true,
    "passive_only": false,
    "timeout_seconds": 120
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
    "scan_id": "scan_2026021210300001",
    "started_at": "2026-02-12T10:30:00.000Z",
    "completed_at": "2026-02-12T10:30:47.231Z",
    "scan_duration_ms": 47231,
    "summary": {
      "total_assets": 23,
      "subdomains": 12,
      "ip_addresses": 8,
      "certificates": 5,
      "services": 31,
      "risk_score": 72.4,
      "critical_findings": 2,
      "high_findings": 5,
      "medium_findings": 8,
      "low_findings": 12
    },
    "assets": [
      {
        "type": "subdomain",
        "value": "www.example.com",
        "ip_addresses": ["93.184.216.34"],
        "discovered_via": "dns_a_record",
        "discovered_at": "2026-02-12T10:30:02.100Z",
        "services": [
          {
            "port": 443,
            "protocol": "https",
            "technology": "nginx/1.24.0",
            "tls_version": "TLSv1.3",
            "certificate": {
              "issuer": "Let's Encrypt Authority X3",
              "valid_from": "2026-01-15T00:00:00Z",
              "valid_to": "2026-04-15T00:00:00Z",
              "days_until_expiry": 62
            }
          },
          {
            "port": 80,
            "protocol": "http",
            "redirect_to": "https://www.example.com/"
          }
        ],
        "risk_factors": [],
        "risk_score": 15.0
      },
      {
        "type": "subdomain",
        "value": "api.example.com",
        "ip_addresses": ["93.184.216.35"],
        "discovered_via": "dns_a_record",
        "discovered_at": "2026-02-12T10:30:03.200Z",
        "services": [
          {
            "port": 443,
            "protocol": "https",
            "technology": "Phoenix/1.7.14",
            "tls_version": "TLSv1.3",
            "headers": {
              "x-powered-by": "Elixir",
              "strict-transport-security": "max-age=31536000"
            }
          }
        ],
        "risk_factors": [],
        "risk_score": 10.0
      },
      {
        "type": "subdomain",
        "value": "staging.example.com",
        "ip_addresses": ["93.184.216.40"],
        "discovered_via": "certificate_transparency",
        "discovered_at": "2026-02-12T10:30:15.800Z",
        "services": [
          {
            "port": 443,
            "protocol": "https",
            "technology": "nginx/1.22.0",
            "tls_version": "TLSv1.2"
          }
        ],
        "risk_factors": [
          {
            "id": "staging_exposed",
            "severity": "high",
            "description": "Staging environment is publicly accessible",
            "remediation": "Restrict access to staging.example.com via IP allowlist or VPN"
          },
          {
            "id": "outdated_tls",
            "severity": "medium",
            "description": "TLSv1.2 in use, TLSv1.3 recommended",
            "remediation": "Upgrade TLS configuration to prefer TLSv1.3"
          }
        ],
        "risk_score": 78.5
      }
    ],
    "certificates": [
      {
        "subject": "*.example.com",
        "issuer": "Let's Encrypt Authority X3",
        "serial": "04:AB:CD:EF:12:34:56:78",
        "valid_from": "2026-01-15T00:00:00Z",
        "valid_to": "2026-04-15T00:00:00Z",
        "san": ["*.example.com", "example.com"],
        "key_algorithm": "ECDSA P-256",
        "discovered_via": "certificate_transparency"
      }
    ],
    "metadata": {
      "dns_queries": 47,
      "ct_log_entries": 156,
      "ports_scanned": 248,
      "scan_options": {
        "include_subdomains": true,
        "max_depth": 3,
        "scan_ports": true,
        "fingerprint": true,
        "passive_only": false
      }
    }
  },
  "meta": {
    "request_id": "req_abc123",
    "dispatched_to": "PrismaticPerimeter.discover/1",
    "execution_time_ms": 47253
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `data.domain` | string | The scanned domain |
| `data.scan_id` | string | Unique identifier for this scan |
| `data.summary` | object | Aggregate statistics for the discovered attack surface |
| `data.summary.risk_score` | number | Overall risk score (0-100, higher = more risk) |
| `data.assets` | array | Detailed list of all discovered assets |
| `data.assets[].type` | string | Asset type: `subdomain`, `ip_address`, `cloud_resource`, `certificate` |
| `data.assets[].risk_factors` | array | Security issues found on this asset |
| `data.assets[].risk_score` | number | Per-asset risk score (0-100) |
| `data.certificates` | array | All SSL/TLS certificates discovered |
| `data.metadata` | object | Scan execution metadata |

## Code Examples

### curl

```bash
# Basic discovery
curl -s -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}' \
  http://localhost:4004/api/v1/perimeter/discover | jq '.data.summary'

# Passive-only scan (faster, no active probing)
curl -s -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com", "options": {"passive_only": true}}' \
  http://localhost:4004/api/v1/perimeter/discover | jq '.data.assets[].value'

# Extract high-risk assets
curl -s -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain": "example.com"}' \
  http://localhost:4004/api/v1/perimeter/discover | \
  jq '[.data.assets[] | select(.risk_score > 50)]'
```

### Elixir

```elixir
# Direct function call (within the platform)
{:ok, surface} = PrismaticPerimeter.discover("example.com")

# With options
{:ok, surface} = PrismaticPerimeter.discover("example.com",
  include_subdomains: true,
  max_depth: 5,
  passive_only: true
)

# Process results
Enum.each(surface.assets, fn asset ->
  if asset.risk_score > 50 do
    Logger.warning("High-risk asset: #{asset.value} (score: #{asset.risk_score})")
  end
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
    "options": {
        "include_subdomains": True,
        "max_depth": 3,
        "scan_ports": True
    }
}

response = requests.post(
    "http://localhost:4004/api/v1/perimeter/discover",
    headers=headers,
    json=payload
)

data = response.json()["data"]
print(f"Found {data['summary']['total_assets']} assets")
print(f"Risk score: {data['summary']['risk_score']}/100")

for asset in data["assets"]:
    if asset["risk_factors"]:
        print(f"  {asset['value']}: {len(asset['risk_factors'])} findings")
```

## Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_domain` | Domain format is invalid or cannot be resolved |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `insufficient_scope` | Token lacks `perimeter:read` scope |
| 408 | `scan_timeout` | Scan exceeded the configured timeout (partial results may be returned) |
| 422 | `invalid_options` | Invalid scan option value (e.g., max_depth > 10) |
| 429 | `rate_limited` | Discovery rate limit exceeded |

See [Error Handling](@/api/error-handling.md) for the standard error response format.

## Rate Limits

Discovery scans are resource-intensive. Rate limits are stricter than standard endpoints.

| Limit Type | Value | Window |
|------------|-------|--------|
| Per token | 30 requests | 1 minute |
| Per domain | 5 scans | 1 hour |
| Burst | 3 requests | 10 seconds |

Repeated scans of the same domain within the rate window return cached results. Use the `scan_id` from previous responses to retrieve cached scan data.

## Related Endpoints

- [Security Rating](@/api/perimeter-rating.md) -- Get the A-F grade derived from discovery results
- [Compliance Assessment](@/api/perimeter-compliance.md) -- Assess compliance against NIS2 and ZKB frameworks
- [Endpoint Discovery](@/api/endpoints.md) -- Find all available Perimeter endpoints
- [Batch Operations](@/api/batch-operations.md) -- Scan multiple domains in a single request
- [Webhooks](@/api/webhooks.md) -- Get notified when scan results change

## Security and Ethics

Discovery scans are limited to assets that are publicly observable from the internet. The platform does not perform vulnerability exploitation, credential testing, or any form of active intrusion. All scanning follows responsible disclosure principles and complies with applicable laws.

The [Color Teams](@/glossary/color-teams.md) security framework reviews discovery methodologies to ensure they remain within ethical boundaries. The Red Team validates that discovery techniques are comprehensive, while the Blue Team verifies that the platform's own assets are properly defended against the same techniques.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)