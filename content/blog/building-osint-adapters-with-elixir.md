+++
title = "Building OSINT Adapters with Elixir: A Practical Guide"
date = 2026-02-20
description = "Step-by-step guide to building production-grade OSINT adapters using Elixir, OTP supervision, and the Prismatic Plugin Kit. Covers rate limiting, error recovery, and confidence scoring."

[extra]
author = "Tomáš Korcak (korczis)"
category = "tutorial"
tags = ["elixir", "osint", "adapters", "plugin-kit", "otp", "tutorial"]
reading_time = "10 min"
keywords = ["Elixir OSINT adapter", "build OSINT tool", "Elixir OTP adapter pattern", "intelligence adapter tutorial", "Prismatic Plugin Kit guide", "OSINT data collection Elixir"]
image = "/images/blog/osint-adapter-guide.png"
word_count = 298
date_created = "2026-02-23"
date_modified = "2026-02-23"
quality_score = 32
see_also = ["osint", "confidence-score", "genserver", "otp", "telemetry"]
image_alt = "Building OSINT Adapters with Elixir: A Practical Guide - Prismatic Platform"
+++

Intelligence gathering at scale requires adapters that are reliable, rate-limited, and recoverable. In this guide, we walk through building a production-grade OSINT adapter using Elixir and the Prismatic Plugin Kit.

## The Adapter Contract

Every OSINT adapter in Prismatic implements the `PrismaticOsintCore.Adapter` behaviour:

```elixir
@callback search(query :: String.t(), opts :: keyword()) ::
  {:ok, list(map())} | {:error, term()}

@callback metadata() :: %{
  name: String.t(),
  category: atom(),
  rate_limit_rpm: pos_integer(),
  confidence_tier: atom()
}
```

This contract guarantees that every adapter -- whether it queries the Czech ARES registry or Shodan's global index -- provides a consistent interface for the pipeline.

## Scaffolding with Plugin Kit

The [Plugin Kit](/developers/plugins/) provides a scaffold command:

```bash
mix prismatic.gen.adapter --name my_custom_source --category global
```

This generates:
- `lib/adapters/my_custom_source.ex` -- Adapter implementation
- `test/adapters/my_custom_source_test.exs` -- Contract tests
- `config/my_custom_source.exs` -- Configuration template

## Implementing the Adapter

Here is a minimal adapter that queries a hypothetical threat intelligence API:

```elixir
defmodule PrismaticOsintSources.Adapters.Global.ThreatFeed do
  @behaviour PrismaticOsintCore.Adapter

  @impl true
  def metadata do
    %{
      name: "ThreatFeed Intelligence",
      category: :global,
      rate_limit_rpm: 30,
      confidence_tier: :commercial_database
    }
  end

  @impl true
  def search(query, opts \\ []) do
    with {:ok, response} <- fetch_data(query, opts),
         {:ok, parsed} <- parse_response(response) do
      {:ok, parsed}
    end
  end

  defp fetch_data(query, _opts) do
    # HTTP client call with timeout
    {:ok, %{status: 200, body: %{"results" => []}}}
  end

  defp parse_response(%{status: 200, body: body}) do
    results = Map.get(body, "results", [])
    {:ok, Enum.map(results, &normalize/1)}
  end

  defp parse_response(%{status: status}) do
    {:error, {:http_error, status}}
  end

  defp normalize(record) do
    %{
      name: Map.get(record, "name", "unknown"),
      type: :domain,
      identifiers: %{domain: Map.get(record, "domain")},
      raw_data: record
    }
  end
end
```

## Rate Limiting and Backpressure

Prismatic Hydra's pipeline automatically enforces rate limits declared in `metadata/0`. But for adapters making HTTP calls, you should also implement client-side throttling:

```elixir
# The pipeline's circuit breaker will open after 5 consecutive failures
# and automatically retry after 30 seconds in half-open state
```

The circuit breaker states:
- **Closed** (normal) -- requests flow freely
- **Open** (stopped) -- 5 consecutive failures trigger a 30-second pause
- **Half-open** (testing) -- one test request; success resumes, failure re-opens

## Confidence Scoring

Every adapter result flows through the evidence chain, where confidence is assigned based on the source category:

| Category | Confidence | Example Sources |
|----------|-----------|-----------------|
| Official Registry | 0.95-1.00 | ARES, Justice Registry |
| Commercial Database | 0.80-0.94 | Shodan, VirusTotal |
| Web Scraping | 0.60-0.79 | Social media, web |
| Derived | 0.40-0.59 | Computed data |
| Unverified | 0.00-0.39 | Raw feeds |

## Testing Your Adapter

The Plugin Kit includes contract tests that verify your adapter conforms to the expected interface:

```elixir
defmodule PrismaticOsintSources.Adapters.Global.ThreatFeedTest do
  use PrismaticOsintCore.AdapterContractTest,
    adapter_module: PrismaticOsintSources.Adapters.Global.ThreatFeed
end
```

This automatically runs 15+ contract assertions covering metadata validation, return type compliance, error handling, and idempotency.

## Next Steps

- **[SDK Documentation](/developers/sdk/)** -- Use the SDK to call your adapter from TypeScript or Python
- **[Interactive Labs](/lab/)** -- Test your adapter in a sandboxed environment
- **[Academy](/academy/)** -- Deeper courses on OSINT adapter patterns and OTP supervision
- **[OSINT Sources](/osint/)** -- Browse all 121+ existing adapters for reference

---

*The Prismatic Plugin Kit is MIT licensed. Build adapters, contribute back, and join the intelligence community.*
