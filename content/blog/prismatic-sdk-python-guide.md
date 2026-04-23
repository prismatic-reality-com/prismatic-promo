+++
title = "Getting Started with the Prismatic Python SDK"
date = 2026-03-10
description = "Complete guide to the Prismatic Python SDK covering async queries, pandas integration for data analysis, Jupyter notebook workflows, and batch operations."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["python", "sdk", "api", "pandas", "jupyter"]
reading_time = "8 min"
keywords = ["prismatic python sdk", "osint python", "pandas data analysis", "jupyter notebooks", "async python api"]
image = "/images/blog/prismatic-sdk-python-guide.png"
word_count = 1020
date_created = "2026-03-10"
date_modified = "2026-03-10"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "Getting Started with the Prismatic Python SDK - Prismatic Platform"
+++

The Prismatic Python SDK offers an async-first interface to the platform API, with native pandas DataFrame integration for analytical workflows. Whether you are screening entities in a Jupyter notebook or building automated pipelines, the SDK handles authentication, pagination, and type validation.

## Installation

Install from PyPI with optional extras for data analysis:

```bash
pip install prismatic-sdk
# With pandas and Jupyter integration
pip install prismatic-sdk[analysis]
```

The SDK requires Python 3.11+ and uses `httpx` for async HTTP with connection pooling.

## Client Configuration

The client supports both synchronous and asynchronous usage. The async client is recommended for production workloads:

```python
import os
from prismatic import PrismaticClient, AsyncPrismaticClient

# Synchronous client (scripts, notebooks)
client = PrismaticClient(
    base_url=os.environ.get("PRISMATIC_API_URL", "https://api.prismatic.local"),
    api_key=os.environ["PRISMATIC_API_KEY"],
    timeout=30.0,
)

# Async client (production services)
async_client = AsyncPrismaticClient(
    base_url=os.environ["PRISMATIC_API_URL"],
    api_key=os.environ["PRISMATIC_API_KEY"],
    max_connections=20,
)
```

On the server side, the API key validation uses an ETS-backed registry for sub-millisecond lookups:

```elixir
defmodule PrismaticWeb.Auth.ApiKeyRegistry do
  @moduledoc """
  ETS-backed API key registry for O(1) key validation.

  Keys are loaded at startup and refreshed every 60 seconds
  from the database to handle revocations.
  """

  use GenServer
  require Logger

  @table :api_key_registry
  @refresh_interval :timer.seconds(60)

  @spec validate(String.t()) :: {:ok, User.t()} | {:error, :invalid_key}
  def validate(api_key) do
    case :ets.lookup(@table, hash_key(api_key)) do
      [{_key, user_id, _scopes}] -> {:ok, Users.get!(user_id)}
      [] -> {:error, :invalid_key}
    end
  end

  defp hash_key(key), do: :crypto.hash(:sha256, key)
end
```

## Async Query Patterns

The async client uses Python's `asyncio` for concurrent operations. This is particularly effective for multi-source intelligence gathering:

```python
import asyncio
from prismatic import AsyncPrismaticClient, EntityType

async def multi_source_search(names: list[str]) -> list[dict]:
    async with AsyncPrismaticClient() as client:
        tasks = [
            client.osint.search(
                query=name,
                entity_types=[EntityType.COMPANY],
                sources=["czech_business_registry", "sanctions_eu", "sanctions_us"],
            )
            for name in names
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    successful = [r for r in results if not isinstance(r, Exception)]
    failed = [r for r in results if isinstance(r, Exception)]

    if failed:
        print(f"Warning: {len(failed)} queries failed")

    return successful
```

| Client Type | Use Case | Concurrency | Connection Pool |
|-------------|----------|-------------|-----------------|
| `PrismaticClient` | Scripts, notebooks, simple tools | Sequential | 10 connections |
| `AsyncPrismaticClient` | Production services, batch ops | Full async | 20 connections |
| `PrismaticClient.batch` | Bulk screening | Server-side | 10 connections |

## Pandas Integration

The SDK provides built-in DataFrame conversion for analytical workflows. Every response object has a `.to_dataframe()` method:

```python
import pandas as pd
from prismatic import PrismaticClient

client = PrismaticClient()

# Search returns a typed response with .to_dataframe()
results = client.osint.search(
    query="Progresus",
    entity_types=["company"],
    sources=["all"],
    limit=100,
)

# Convert to DataFrame for analysis
df = results.to_dataframe()
print(df.columns.tolist())
# ['id', 'name', 'type', 'confidence', 'risk_score', 'sources', 'created_at']

# Filter high-risk entities
high_risk = df[df["risk_score"] > 0.7].sort_values("risk_score", ascending=False)
print(f"High-risk entities: {len(high_risk)}")

# Group by source for coverage analysis
source_coverage = df.explode("sources").groupby("sources").size()
print(source_coverage)
```

## Jupyter Notebook Workflows

The SDK includes rich display formatters for Jupyter environments. Entities, cases, and search results render as interactive HTML tables:

```python
# In a Jupyter notebook cell
from prismatic import PrismaticClient
from prismatic.display import configure_notebook

# Enable rich display formatting
configure_notebook()

client = PrismaticClient()

# This renders as an interactive table in Jupyter
case_details = client.dd.get_case("case-123", include=["entities", "findings"])
case_details  # Rich HTML display with expandable sections
```

### Analytical Pipeline Example

Build a complete screening pipeline in a notebook:

```python
import pandas as pd
from prismatic import PrismaticClient

client = PrismaticClient()

# Step 1: Load entity list from CSV
entities_df = pd.read_csv("screening_list.csv")
names = entities_df["company_name"].tolist()

# Step 2: Batch screening
screening = client.osint.batch_search(
    queries=[{"query": n, "sources": ["all"]} for n in names],
    concurrency=5,
)

# Step 3: Aggregate results into DataFrame
results_df = screening.to_dataframe()
results_df["original_name"] = names

# Step 4: Risk classification
results_df["risk_category"] = pd.cut(
    results_df["risk_score"],
    bins=[0, 0.3, 0.6, 0.85, 1.0],
    labels=["low", "medium", "high", "critical"],
)

# Step 5: Summary statistics
summary = results_df.groupby("risk_category").agg(
    count=("id", "size"),
    avg_confidence=("confidence", "mean"),
    avg_risk=("risk_score", "mean"),
).round(3)

print(summary)
```

## Batch Operations

For large-scale screening jobs, the batch API processes entities server-side using Broadway pipelines. The Python SDK handles chunking and progress tracking:

```python
from prismatic import PrismaticClient

client = PrismaticClient()

# Screen 1000+ entities with progress tracking
with client.osint.batch_context(concurrency=10) as batch:
    for company in large_company_list:
        batch.add(query=company["name"], sources=["all"])

    results = batch.execute(
        on_progress=lambda done, total: print(f"{done}/{total}"),
        on_error=lambda name, err: print(f"Failed: {name}: {err}"),
    )

print(f"Screened {results.total} entities")
print(f"Flagged: {results.flagged_count}")
```

The server-side Broadway pipeline that processes these batches:

```elixir
defmodule PrismaticOsint.BatchPipeline do
  @moduledoc """
  Broadway pipeline for concurrent batch OSINT screening.

  Processes entity batches with configurable concurrency,
  rate limiting per source, and result aggregation.
  """

  use Broadway

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [
        module: {Broadway.DummyProducer, []},
        concurrency: 1
      ],
      processors: [
        default: [concurrency: Keyword.get(opts, :concurrency, 10)]
      ],
      batchers: [
        default: [batch_size: 50, batch_timeout: 5_000]
      ]
    )
  end

  @impl Broadway
  def handle_message(_, message, _context) do
    case OsintMesh.search(message.data.query, message.data.sources) do
      {:ok, results} -> Message.put_data(message, results)
      {:error, reason} -> Message.failed(message, reason)
    end
  end
end
```

## Error Handling

The SDK raises typed exceptions with structured error details:

```python
from prismatic.exceptions import (
    PrismaticApiError,
    RateLimitError,
    ValidationError,
    AuthenticationError,
)

try:
    result = client.osint.search(query="test")
except RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after}s")
except ValidationError as e:
    print(f"Invalid params: {e.details}")
except AuthenticationError:
    print("API key invalid or expired")
except PrismaticApiError as e:
    print(f"API error {e.status_code}: {e.message}")
```

| Exception Type | HTTP Status | Retry Strategy |
|---------------|-------------|----------------|
| `RateLimitError` | 429 | Wait `retry_after` seconds |
| `ValidationError` | 422 | Fix parameters, do not retry |
| `AuthenticationError` | 401 | Refresh credentials |
| `NotFoundError` | 404 | Do not retry |
| `ServerError` | 500-503 | Exponential backoff (3 retries) |

## Configuration Reference

Environment variables supported by the SDK:

```bash
PRISMATIC_API_URL=https://api.prismatic.local
PRISMATIC_API_KEY=psk_live_...
PRISMATIC_TIMEOUT=30
PRISMATIC_MAX_RETRIES=3
PRISMATIC_LOG_LEVEL=WARNING
```

The Python SDK is designed for both interactive exploration in Jupyter and production automation pipelines. Combined with pandas, it provides a powerful analytical layer over the platform's intelligence capabilities.
