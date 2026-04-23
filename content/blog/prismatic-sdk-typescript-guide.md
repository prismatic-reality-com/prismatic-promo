+++
title = "Getting Started with the Prismatic TypeScript SDK"
date = 2026-03-09
description = "Complete guide to using the Prismatic TypeScript SDK for OSINT queries, DD case management, and type-safe API interactions with async/await patterns."

[extra]
author = "Tomas Korcak (korczis)"
category = "tutorial"
tags = ["typescript", "sdk", "api", "osint", "due-diligence"]
reading_time = "8 min"
keywords = ["prismatic sdk", "typescript api client", "osint typescript", "due diligence api", "type-safe api"]
image = "/images/blog/prismatic-sdk-typescript-guide.png"
word_count = 1050
date_created = "2026-03-09"
date_modified = "2026-03-09"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "Getting Started with the Prismatic TypeScript SDK - Prismatic Platform"
+++

The Prismatic TypeScript SDK provides a fully typed interface to the platform's REST API, covering OSINT intelligence gathering, due diligence case management, and real-time event subscriptions. This guide walks through installation, authentication, and practical usage patterns.

## Installation and Setup

Install the SDK from npm along with its peer dependencies:

```bash
npm install @prismatic/sdk
# or with yarn
yarn add @prismatic/sdk
```

The SDK requires Node.js 18+ for native fetch support. For older runtimes, install `undici` as a polyfill.

## Authentication Configuration

The SDK supports three authentication strategies: API key, JWT bearer token, and OAuth2 client credentials. Configure your client instance at application startup:

```typescript
import { PrismaticClient, AuthStrategy } from '@prismatic/sdk';

const client = new PrismaticClient({
  baseUrl: process.env.PRISMATIC_API_URL ?? 'https://api.prismatic.local',
  auth: {
    strategy: AuthStrategy.ApiKey,
    apiKey: process.env.PRISMATIC_API_KEY!,
  },
  timeout: 30_000,
  retries: 3,
});
```

The corresponding Elixir endpoint that validates these tokens uses Guardian with configurable TTL:

```elixir
defmodule PrismaticWeb.Auth.Pipeline do
  @moduledoc """
  Authentication pipeline for API token validation.

  Supports API key lookup via ETS-backed registry and JWT
  verification through Guardian with configurable TTL.
  """

  use Guardian.Plug.Pipeline,
    otp_app: :prismatic_web,
    module: PrismaticWeb.Auth.Guardian,
    error_handler: PrismaticWeb.Auth.ErrorHandler

  plug Guardian.Plug.VerifyHeader, scheme: "Bearer"
  plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource
end
```

## OSINT Query Patterns

The SDK exposes typed query builders for every OSINT adapter registered in the platform. Queries return paginated, envelope-wrapped responses with full type inference.

### Entity Search

```typescript
import { OsintQuery, EntityType } from '@prismatic/sdk';

async function searchEntity(name: string) {
  const results = await client.osint.search({
    query: name,
    entityTypes: [EntityType.Company, EntityType.Person],
    sources: ['czech_business_registry', 'sanctions_lists'],
    limit: 25,
    offset: 0,
  });

  for (const entity of results.data) {
    console.log(`${entity.name} (${entity.type}) — confidence: ${entity.confidence}`);
    for (const source of entity.sources) {
      console.log(`  Source: ${source.adapter} — ${source.url}`);
    }
  }

  return results;
}
```

### Batch Operations

For high-volume screening, use the batch API to submit multiple queries in a single request. The platform processes these concurrently using Broadway pipelines on the server side:

```typescript
const batchResults = await client.osint.batchSearch({
  queries: entityNames.map((name) => ({
    query: name,
    entityTypes: [EntityType.Company],
    sources: ['all'],
  })),
  concurrency: 10,
  onProgress: (completed, total) => {
    console.log(`Progress: ${completed}/${total}`);
  },
});
```

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| `osint.search` | `GET /api/v1/osint/search` | 100/min | Single entity search |
| `osint.batchSearch` | `POST /api/v1/osint/batch` | 10/min | Batch entity screening |
| `osint.getEntity` | `GET /api/v1/osint/entities/:id` | 200/min | Fetch entity details |
| `osint.getRelationships` | `GET /api/v1/osint/entities/:id/relationships` | 100/min | Entity graph traversal |
| `osint.getSources` | `GET /api/v1/osint/sources` | 50/min | List available adapters |

## DD Case Management

The due diligence module provides full lifecycle management for investigation cases. Every operation returns typed response envelopes with metadata.

```typescript
import { DDCase, CaseStatus, RiskLevel } from '@prismatic/sdk';

// Create a new DD case
const newCase = await client.dd.createCase({
  title: 'Acme Corp Acquisition Review',
  description: 'Pre-acquisition due diligence for Acme Corp',
  entityIds: ['entity-123', 'entity-456'],
  assignee: 'analyst@company.com',
  priority: RiskLevel.High,
});

// Update case status with notes
await client.dd.updateCase(newCase.data.id, {
  status: CaseStatus.InProgress,
  notes: 'Initial document collection complete. Proceeding to financial analysis.',
});

// Fetch case with full entity graph
const fullCase = await client.dd.getCase(newCase.data.id, {
  include: ['entities', 'documents', 'findings', 'timeline'],
});
```

The server-side case creation is handled by the `DecisionEngine` facade which orchestrates scoring, hypothesis generation, and recommendation pipelines:

```elixir
defmodule PrismaticDD.DecisionEngine do
  @moduledoc """
  Facade for the DD decision pipeline.

  Coordinates scoring, hypothesis, and recommendation engines
  through a unified interface with PubSub notifications.
  """

  alias PrismaticDD.Decision.{ScoringEngine, HypothesisEngine, RecommendationEngine}

  @spec create_case(map()) :: {:ok, Case.t()} | {:error, Ecto.Changeset.t()}
  def create_case(attrs) do
    with {:ok, dd_case} <- Cases.create(attrs),
         :ok <- ScoringEngine.initial_score(dd_case),
         :ok <- broadcast_case_created(dd_case) do
      {:ok, dd_case}
    end
  end
end
```

## Type-Safe Response Handling

Every SDK method returns a typed `ApiResponse<T>` envelope. The envelope includes pagination metadata, request timing, and API version information:

```typescript
interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
    duration_ms: number;
    apiVersion: string;
  };
  pagination?: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}
```

## Error Handling with Discriminated Unions

The SDK uses discriminated unions for error types, enabling exhaustive pattern matching in TypeScript:

```typescript
try {
  const result = await client.osint.search({ query: 'test' });
  // result is ApiResponse<SearchResult[]>
} catch (error) {
  if (error instanceof PrismaticApiError) {
    switch (error.code) {
      case 'RATE_LIMITED':
        await delay(error.retryAfter);
        break;
      case 'UNAUTHORIZED':
        await refreshToken();
        break;
      case 'VALIDATION_ERROR':
        console.error('Invalid params:', error.details);
        break;
    }
  }
}
```

## Real-Time Event Subscriptions

Subscribe to platform events via Server-Sent Events for live updates on case status changes, new findings, and alert triggers:

```typescript
const subscription = client.events.subscribe({
  topics: ['dd.case.updated', 'osint.entity.found', 'alert.triggered'],
  filter: { caseId: 'case-123' },
});

subscription.on('dd.case.updated', (event) => {
  console.log(`Case ${event.caseId} moved to ${event.newStatus}`);
});

subscription.on('error', (error) => {
  console.error('Event stream error:', error);
});
```

## Performance Considerations

| Scenario | Recommended Pattern | Typical Latency |
|----------|-------------------|-----------------|
| Single entity lookup | Direct `getEntity` call | 15-50ms |
| Bulk screening (100+ entities) | `batchSearch` with concurrency 10 | 2-5s total |
| Real-time monitoring | SSE subscription | ~100ms event delivery |
| Large result pagination | Cursor-based with `limit: 50` | 20-80ms per page |
| Document upload (DD) | Multipart with progress callback | Varies by size |

The TypeScript SDK handles connection pooling, automatic retries with exponential backoff, and request deduplication internally. For production deployments, configure the client with appropriate timeout and retry settings based on your latency requirements.

The SDK source is available on the platform's developer portal, and TypeDoc-generated API reference covers every exported type and method.
