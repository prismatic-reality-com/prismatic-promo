+++
title = "Rate Limiting & Throttling"
weight = 12
[extra]
description = "Per-endpoint rate limits, burst policies, backoff strategies, and throttling headers"
category = "infrastructure"
method = "N/A"
path = "/api/v1/*"
status = "stable"
auth_required = false
glossary_terms = ["no-mercy", "quality-dna", "aiad"]
technologies = ["elixir", "phoenix", "openapi"]
author = "Tomas Korcak (korczis)"
reading_time = "3 min"
word_count = 681
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Rate", "Limiting", "Throttling", "Per-endpoint", "api", "infrastructure", "Prismatic Platform", "Standard"]
tags = ["api", "infrastructure", "rate-limiting--throttling", "prismatic"]
quality_score = 70
see_also = ["apps", "technologies", "agents"]
image = "/images/sections/api.png"
image_alt = "Rate Limiting & Throttling - Prismatic Platform"
+++

## Overview

The Prismatic API enforces rate limiting on all endpoints to ensure fair usage, prevent abuse, and protect platform stability. Rate limits are implemented as a Phoenix plug that executes before request dispatch, using a token bucket algorithm backed by ETS for high-performance, low-latency enforcement.

Rate limits operate at multiple levels: per IP address (for unauthenticated endpoints), per API token (for authenticated endpoints), per endpoint (to protect resource-intensive operations), and globally (to prevent platform saturation). These limits are enforced independently, meaning a request must satisfy all applicable limits to proceed.

The system communicates rate limit status through standard HTTP headers on every response, allowing clients to implement proactive throttling rather than reactive retry loops. When a limit is exceeded, the API returns a 429 status with a `Retry-After` header indicating when the client may retry.

Rate limit configuration is per-endpoint and can be discovered through the [Endpoint Discovery](/api/endpoints/) API. Resource-intensive endpoints like [Attack Surface Discovery](/api/perimeter-discover/) have stricter limits than lightweight read operations like the [Health Check](/api/health/).

## Rate Limit Headers

Every API response includes rate limit information in the response headers:

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Maximum requests allowed in the current window | `60` |
| `X-RateLimit-Remaining` | Requests remaining in the current window | `47` |
| `X-RateLimit-Reset` | Unix timestamp when the window resets | `1739347260` |
| `X-RateLimit-Policy` | Human-readable policy description | `60;w=60` (60 per 60 seconds) |
| `Retry-After` | Seconds to wait before retrying (only on 429) | `12` |

### Example Response Headers

```
HTTP/1.1 200 OK
Content-Type: application/json
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1739347260
X-RateLimit-Policy: 60;w=60
```

### Example 429 Response Headers

```
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1739347260
Retry-After: 12
```

## Rate Limit Tiers

### Default Limits (Per Authenticated Token)

| Tier | Limit | Window | Burst | Applies To |
|------|-------|--------|-------|------------|
| **Standard** | 60 requests | 1 minute | 10/second | Most read endpoints |
| **Extended** | 120 requests | 1 minute | 20/second | Registry and listing endpoints |
| **Restricted** | 30 requests | 1 minute | 3/second | Resource-intensive operations |
| **Minimal** | 10 requests | 1 minute | 2/second | Write operations |

### Per-Endpoint Limits

| Endpoint | Limit | Window | Burst | Tier |
|----------|-------|--------|-------|------|
| `GET /api/v1/health` | 60/IP | 1 min | 10/s | Standard |
| `GET /api/v1/endpoints` | 120/token | 1 min | 20/s | Extended |
| `GET /api/v1/agents/list` | 120/token | 1 min | 20/s | Extended |
| `GET /api/v1/agents/status` | 120/token | 1 min | 20/s | Extended |
| `GET /api/v1/perimeter/rating` | 60/token | 1 min | 5/s | Standard |
| `POST /api/v1/perimeter/discover` | 30/token | 1 min | 3/s | Restricted |
| `POST /api/v1/perimeter/compliance` | 30/token | 1 min | 3/s | Restricted |
| `POST /api/v1/auth/tokens` | 10/token | 1 min | 2/s | Minimal |
| `GET /api/openapi` | 30/IP | 1 min | 5/s | Standard |
| `GET /api/swaggerui` | 30/IP | 1 min | 5/s | Standard |

### Global Limits

In addition to per-token limits, global limits protect the platform from aggregate overload:

| Limit | Value | Description |
|-------|-------|-------------|
| Global requests | 10,000/min | Total requests across all clients |
| Global writes | 1,000/min | Total write operations across all clients |
| Global discovery | 300/min | Total discovery scans across all clients |

## Token Bucket Algorithm

The rate limiter uses a token bucket algorithm with the following characteristics:

- **Bucket capacity** equals the burst limit (maximum concurrent requests)
- **Refill rate** is the steady-state limit (e.g., 60 tokens per 60 seconds = 1 token/second)
- **Tokens are consumed** one per request
- **Empty bucket** triggers a 429 response
- **Bucket state** is stored in ETS for sub-microsecond access time

```
Bucket State:
  tokens: 47          (requests remaining)
  capacity: 60        (max burst capacity)
  refill_rate: 1.0    (tokens per second)
  last_refill: 1739347248  (unix timestamp)
```

This approach allows clients to burst up to the capacity limit and then settle into a steady request rate. A client can send 10 rapid requests, then sustain 1 request per second indefinitely without hitting limits.

## Backoff Strategies

### Recommended Client Implementation

When receiving a 429 response, clients should implement exponential backoff with jitter:

```python
import time
import random

def request_with_backoff(url, max_retries=5):
    for attempt in range(max_retries):
        response = requests.get(url, headers=headers)

        if response.status_code != 429:
            return response

        retry_after = int(response.headers.get("Retry-After", 1))
        jitter = random.uniform(0, retry_after * 0.1)
        wait_time = retry_after + jitter

        print(f"Rate limited. Waiting {wait_time:.1f}s (attempt {attempt + 1})")
        time.sleep(wait_time)

    raise Exception("Max retries exceeded")
```

### Proactive Throttling

Better than reactive backoff is proactive throttling based on the rate limit headers:

```python
import time

def throttled_request(url, session):
    response = session.get(url)

    remaining = int(response.headers.get("X-RateLimit-Remaining", 100))
    reset_at = int(response.headers.get("X-RateLimit-Reset", 0))

    if remaining < 5:
        wait_until = reset_at - time.time()
        if wait_until > 0:
            print(f"Approaching limit ({remaining} remaining). Pausing {wait_until:.1f}s")
            time.sleep(wait_until)

    return response
```

## Code Examples

### curl -- Checking Rate Limit Headers

```bash
# Check current rate limit status
curl -s -D - -o /dev/null -H "Authorization: Bearer $API_TOKEN" \
  http://localhost:4004/api/v1/agents/list 2>&1 | grep -i ratelimit

# Trigger a 429 with rapid requests (for testing)
for i in $(seq 1 100); do
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $API_TOKEN" \
    http://localhost:4004/api/v1/agents/list)
  echo "Request $i: $status"
  if [ "$status" = "429" ]; then
    echo "Rate limited at request $i"
    break
  fi
done
```

### Elixir -- Rate Limit Aware Client

```elixir
defmodule PrismaticClient do
  @max_retries 5

  def request(url, headers, retries \\ 0) do
    case HTTPoison.get(url, headers) do
      {:ok, %{status_code: 429} = response} when retries < @max_retries ->
        retry_after =
          response.headers
          |> Enum.find(fn {k, _} -> String.downcase(k) == "retry-after" end)
          |> elem(1)
          |> String.to_integer()

        jitter = :rand.uniform() * retry_after * 0.1
        wait_ms = round((retry_after + jitter) * 1000)

        Process.sleep(wait_ms)
        request(url, headers, retries + 1)

      {:ok, response} ->
        {:ok, response}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

### Python -- Full Rate Limit Handler

```python
import requests
import time
import random

class PrismaticClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {token}",
            "Accept": "application/json"
        })

    def get(self, path, params=None, max_retries=5):
        url = f"{self.base_url}{path}"
        for attempt in range(max_retries):
            response = self.session.get(url, params=params)

            if response.status_code != 429:
                return response

            retry_after = int(response.headers.get("Retry-After", 1))
            jitter = random.uniform(0, retry_after * 0.1)
            time.sleep(retry_after + jitter)

        raise Exception(f"Rate limited after {max_retries} retries")

    def post(self, path, json=None, max_retries=5):
        url = f"{self.base_url}{path}"
        for attempt in range(max_retries):
            response = self.session.post(url, json=json)

            if response.status_code != 429:
                return response

            retry_after = int(response.headers.get("Retry-After", 1))
            jitter = random.uniform(0, retry_after * 0.1)
            time.sleep(retry_after + jitter)

        raise Exception(f"Rate limited after {max_retries} retries")

# Usage
client = PrismaticClient("http://localhost:4004", api_token)
rating = client.get("/api/v1/perimeter/rating", params={"domain": "example.com"})
```

## Error Responses

### 429 Too Many Requests

```json
{
  "ok": false,
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded. Try again in 12 seconds.",
    "details": {
      "limit": 60,
      "window_seconds": 60,
      "retry_after_seconds": 12,
      "limit_type": "per_token"
    }
  }
}
```

See [Error Handling](/api/error-handling/) for the complete error taxonomy.

## Rate Limits

This page documents rate limits for all endpoints. Each endpoint's individual documentation page also includes its specific limits.

## Related Endpoints

- [Health Check](/api/health/) -- Rate limits for the health endpoint
- [Attack Surface Discovery](/api/perimeter-discover/) -- Restricted rate limits for discovery
- [Authentication](/api/authentication/) -- Rate limits for auth endpoints
- [Error Handling](/api/error-handling/) -- 429 error response format
- [Batch Operations](/api/batch-operations/) -- Reduce rate limit consumption through batching

## Implementation Notes

The rate limiter is implemented as an ETS-backed GenServer that maintains per-key token buckets. The design prioritizes low latency (sub-microsecond bucket lookups) and correctness under concurrent access. The ETS table uses `:public` access with `:write_concurrency` enabled, allowing parallel rate limit checks without GenServer bottlenecks.

Rate limit configuration is loaded from the [Endpoint Discovery](/api/endpoints/) registry, ensuring that limits stay synchronized with endpoint definitions. The [Quality DNA](/glossary/quality-dna/) system monitors rate limit hit rates to identify clients that consistently exceed limits, which may indicate misconfiguration or abuse.

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)