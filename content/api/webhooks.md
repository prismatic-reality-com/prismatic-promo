+++
title = "Webhook Events"
weight = 14
[extra]
description = "Real-time event notifications for security findings, quality changes, agent activities, and compliance alerts"
category = "infrastructure"
method = "POST"
path = "/api/v1/webhooks"
status = "beta"
auth_required = true
glossary_terms = ["easm", "aiad", "quality-dna", "color-teams", "no-mercy"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 752
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Webhook", "Events", "Real-time", "api", "infrastructure", "Prismatic Platform", "Event", "Agent", "Trigger", "Payload Contains"]
tags = ["api", "infrastructure", "webhook-events", "prismatic"]
quality_score = 67
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Webhook Events - Prismatic Platform"
+++

## Overview

The Webhook Events system enables real-time push notifications for platform events. Instead of polling API endpoints for changes, consumers register webhook URLs that receive HTTP POST callbacks when specific events occur. This is particularly valuable for security operations where timely notification of new findings, rating changes, or compliance status shifts can trigger automated response workflows.

Webhooks are organized into event categories that correspond to the platform's operational domains: perimeter events for [EASM](/glossary/easm/) changes, agent events for fleet status changes, quality events for platform health shifts, and compliance events for regulatory assessment updates. Consumers subscribe to specific event types and receive only the notifications they care about.

Each webhook delivery includes a cryptographic signature that allows the receiver to verify the payload authenticity. Failed deliveries are retried with exponential backoff for up to 24 hours. The delivery status for each webhook is tracked and queryable through the management API.

## Webhook Management Endpoints

### Create a Webhook

```
POST /api/v1/webhooks
```

Register a new webhook endpoint to receive event notifications.

**Request Body:**

```json
{
  "url": "https://ops.example.com/hooks/prismatic",
  "events": [
    "perimeter.rating_changed",
    "perimeter.critical_finding",
    "agents.health_changed",
    "compliance.status_changed"
  ],
  "secret": "whsec_your_signing_secret_here",
  "metadata": {
    "name": "Security Operations Webhook",
    "environment": "production"
  },
  "options": {
    "active": true,
    "retry_policy": "exponential",
    "max_retries": 10
  }
}
```

**Response (201 Created):**

```json
{
  "ok": true,
  "data": {
    "webhook_id": "wh_abc123",
    "url": "https://ops.example.com/hooks/prismatic",
    "events": [
      "perimeter.rating_changed",
      "perimeter.critical_finding",
      "agents.health_changed",
      "compliance.status_changed"
    ],
    "active": true,
    "created_at": "2026-02-12T10:00:00.000Z"
  }
}
```

### List Webhooks

```
GET /api/v1/webhooks
```

Returns all registered webhooks for the authenticated token.

### Update a Webhook

```
PUT /api/v1/webhooks/:webhook_id
```

Modify webhook configuration (URL, events, active status).

### Delete a Webhook

```
DELETE /api/v1/webhooks/:webhook_id
```

Remove a webhook and stop all deliveries.

### Webhook Delivery History

```
GET /api/v1/webhooks/:webhook_id/deliveries
```

Returns the delivery history for a webhook, including status, response codes, and retry information.

## Event Types

### Perimeter Events

| Event | Trigger | Payload Contains |
|-------|---------|-----------------|
| `perimeter.scan_completed` | Discovery scan finishes | Scan summary, asset count, risk score |
| `perimeter.rating_changed` | Domain security rating changes | Previous grade, new grade, delta, factors |
| `perimeter.critical_finding` | Critical severity finding discovered | Finding details, affected asset, remediation |
| `perimeter.asset_discovered` | New asset found on subsequent scan | Asset type, value, discovery method |
| `perimeter.asset_removed` | Previously discovered asset no longer found | Asset details, last seen date |
| `perimeter.certificate_expiring` | Certificate expires within 30 days | Certificate details, days until expiry |

### Agent Events

| Event | Trigger | Payload Contains |
|-------|---------|-----------------|
| `agents.health_changed` | Agent health status changes | Agent ID, previous status, new status, reason |
| `agents.fleet_degraded` | Multiple agents degraded simultaneously | Affected agents, degradation summary |
| `agents.error_spike` | Agent error rate exceeds threshold | Agent ID, error rate, threshold, sample errors |
| `agents.process_crash` | Agent process crashes and restarts | Agent ID, crash reason, restart count |

### Quality Events

| Event | Trigger | Payload Contains |
|-------|---------|-----------------|
| `quality.score_changed` | Platform quality score changes | Previous score, new score, affected domains |
| `quality.gate_failed` | Quality gate check fails | Gate name, failure reason, affected files |
| `quality.regression_detected` | Quality regression detected | Regression type, affected metric, severity |

### Compliance Events

| Event | Trigger | Payload Contains |
|-------|---------|-----------------|
| `compliance.status_changed` | Compliance status changes for a domain | Framework, previous status, new status, requirements |
| `compliance.new_gap` | New compliance gap identified | Framework, requirement ID, gap description |
| `compliance.gap_resolved` | Previously identified gap is resolved | Framework, requirement ID, resolution evidence |

## Webhook Payload Format

Every webhook delivery follows this format:

```json
{
  "webhook_id": "wh_abc123",
  "event_id": "evt_def456",
  "event_type": "perimeter.rating_changed",
  "timestamp": "2026-02-12T10:30:00.000Z",
  "data": {
    "domain": "example.com",
    "previous_rating": {
      "grade": "B",
      "score": 780
    },
    "current_rating": {
      "grade": "C",
      "score": 680
    },
    "delta": -100,
    "factors": [
      {
        "category": "certificate_management",
        "change": "Certificate expired on api.example.com",
        "impact": -80
      },
      {
        "category": "application_security",
        "change": "New staging environment exposed",
        "impact": -20
      }
    ]
  }
}
```

### Payload Fields

| Field | Type | Description |
|-------|------|-------------|
| `webhook_id` | string | Registered webhook identifier |
| `event_id` | string | Unique event identifier (for deduplication) |
| `event_type` | string | Event type string |
| `timestamp` | string | ISO 8601 timestamp when the event occurred |
| `data` | object | Event-specific payload (varies by event type) |

## Signature Verification

Every webhook delivery includes a signature header for payload authenticity verification:

```
X-Prismatic-Signature: sha256=abc123def456...
X-Prismatic-Timestamp: 1739347800
```

### Verification Algorithm

1. Concatenate the timestamp and raw request body: `{timestamp}.{body}`
2. Compute HMAC-SHA256 using the webhook secret as the key
3. Compare the result with the signature from the header

### Verification Examples

**Python:**

```python
import hmac
import hashlib

def verify_signature(payload_body, signature_header, timestamp_header, secret):
    expected = hmac.new(
        secret.encode("utf-8"),
        f"{timestamp_header}.{payload_body}".encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    provided = signature_header.replace("sha256=", "")
    return hmac.compare_digest(expected, provided)
```

**Elixir:**

```elixir
def verify_signature(body, signature, timestamp, secret) do
  expected =
    :crypto.mac(:hmac, :sha256, secret, "#{timestamp}.#{body}")
    |> Base.encode16(case: :lower)

  provided = String.replace(signature, "sha256=", "")
  Plug.Crypto.secure_compare(expected, provided)
end
```

## Authentication

Webhook management endpoints require a valid API token with `webhooks:write` scope for creation, modification, and deletion, and `webhooks:read` for listing and delivery history.

```
Authorization: Bearer <api_token>
```

## Code Examples

### curl -- Webhook Management

```bash
# Create a webhook
curl -s -X POST \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://ops.example.com/hooks/prismatic",
    "events": ["perimeter.rating_changed", "perimeter.critical_finding"],
    "secret": "whsec_my_secret"
  }' \
  http://localhost:4004/api/v1/webhooks | jq .

# List webhooks
curl -s -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/webhooks | jq '.data.webhooks[]'

# Check delivery history
curl -s -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/webhooks/wh_abc123/deliveries | jq '.data.deliveries[:5]'

# Delete a webhook
curl -s -X DELETE \
  -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/webhooks/wh_abc123
```

### Python -- Webhook Receiver

```python
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)
WEBHOOK_SECRET = "whsec_my_secret"

@app.route("/hooks/prismatic", methods=["POST"])
def handle_webhook():
    # Verify signature
    signature = request.headers.get("X-Prismatic-Signature", "")
    timestamp = request.headers.get("X-Prismatic-Timestamp", "")
    body = request.get_data(as_text=True)

    if not verify_signature(body, signature, timestamp, WEBHOOK_SECRET):
        return jsonify({"error": "Invalid signature"}), 401

    event = request.json
    event_type = event["event_type"]

    if event_type == "perimeter.rating_changed":
        data = event["data"]
        print(f"Rating changed for {data['domain']}: "
              f"{data['previous_rating']['grade']} -> {data['current_rating']['grade']}")

    elif event_type == "perimeter.critical_finding":
        print(f"CRITICAL: {event['data']['description']}")

    return jsonify({"received": True}), 200
```

## Retry Policy

Failed webhook deliveries are retried with exponential backoff:

| Attempt | Delay | Cumulative Time |
|---------|-------|----------------|
| 1 | Immediate | 0 |
| 2 | 30 seconds | 30 seconds |
| 3 | 2 minutes | 2.5 minutes |
| 4 | 10 minutes | 12.5 minutes |
| 5 | 30 minutes | 42.5 minutes |
| 6 | 1 hour | 1h 42m |
| 7 | 2 hours | 3h 42m |
| 8 | 4 hours | 7h 42m |
| 9 | 8 hours | 15h 42m |
| 10 | 8 hours | 23h 42m |

After 10 failed attempts (approximately 24 hours), the webhook is automatically deactivated. Reactivate it through the update endpoint after resolving the delivery issue.

A delivery is considered failed when the receiver returns a non-2xx status code or when the connection times out (10 second timeout per delivery attempt).

## Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_url` | Webhook URL is not a valid HTTPS URL |
| 400 | `invalid_events` | One or more event types are not recognized |
| 401 | `unauthorized` | Missing or invalid authentication token |
| 403 | `insufficient_scope` | Token lacks `webhooks:write` scope |
| 404 | `webhook_not_found` | Specified webhook_id does not exist |
| 409 | `duplicate_url` | A webhook with this URL already exists |
| 429 | `rate_limited` | Webhook management rate limit exceeded |

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /webhooks` | 10 | 1 minute |
| `GET /webhooks` | 60 | 1 minute |
| `PUT /webhooks/:id` | 30 | 1 minute |
| `DELETE /webhooks/:id` | 30 | 1 minute |
| `GET /webhooks/:id/deliveries` | 60 | 1 minute |

## Related Endpoints

- [Attack Surface Discovery](/api/perimeter-discover/) -- Source of perimeter events
- [Security Rating](/api/perimeter-rating/) -- Source of rating change events
- [Agent Status](/api/agents-status/) -- Source of agent health events
- [Compliance Assessment](/api/perimeter-compliance/) -- Source of compliance events
- [Authentication](/api/authentication/) -- Scope management for webhook access
- [Error Handling](/api/error-handling/) -- Standard error response format

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)