+++
title = "GraphQL"
weight = 71
[extra]
category = "protocol"
description = "Query language for APIs providing a complete type system and runtime for fulfilling client-specified queries"
url = "https://graphql.org"
version = "Oct 2021"
icon = "graphql"
color = "pink"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1251
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["GraphQL", "Query", "APIs", "technologies", "protocol", "Prismatic Platform", "Dataloader"]
tags = ["technologies", "protocol", "graphql", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "GraphQL - Prismatic Platform"
+++

## Overview

GraphQL is the API query language used in the Prismatic Platform for flexible, client-driven data fetching. Unlike REST APIs where the server determines the response structure, GraphQL lets clients specify exactly which fields they need, eliminating over-fetching and under-fetching problems that are common in traditional API designs. This client-specified query model is particularly valuable for the Prismatic Platform, which serves diverse clients with vastly different data requirements -- from lightweight mobile dashboards to full-featured desktop security operations interfaces.

The Prismatic Platform exposes a GraphQL endpoint through [Absinthe](@/technologies/absinthe.md) that provides access to agents, security ratings, compliance assessments, OSINT intelligence, and system metrics. This enables diverse clients -- [Phoenix LiveView](@/technologies/phoenix-liveview.md) dashboards, mobile apps, CLI tools, and external integrations -- to each request precisely the data they need in a single query. For example, a mobile client can request only agent names and statuses, while the full desktop dashboard fetches the complete agent profile including activity history and domain assignments. Both clients use the same endpoint, the same schema, and the same authentication, but receive only the data they requested.

GraphQL's type system provides self-documenting APIs with introspection, enabling tools like GraphiQL to offer autocomplete, validation, and documentation automatically. The platform serves GraphiQL at `/graphiql` for interactive schema exploration during development. This introspection capability means the API documentation is always in sync with the actual implementation -- there is no separate documentation system to maintain.

## Key Features

- **Type System**: Strong typing with scalars, objects, enums, unions, and interfaces -- mapped from [Elixir](@/technologies/elixir.md) types via Absinthe macros
- **Client-Specified Queries**: Request exactly the data needed, reducing payload size and eliminating waterfall requests
- **Single Endpoint**: One URL (`/graphql`) serves all data needs, simplifying client configuration and authentication
- **Subscriptions**: Real-time data pushes through [WebSocket](@/technologies/websockets.md) connections for live dashboard updates
- **Introspection**: Self-documenting API with full schema exploration via GraphiQL playground
- **Fragments**: Reusable query components for DRY client code when fetching overlapping data sets
- **Batching**: Multiple queries in a single request, reducing round-trip overhead for dashboard initialization
- **Input Validation**: Schema-level validation of all inputs before resolver execution

## Platform Integration

GraphQL provides flexible data access across the platform. The schema exposes the core domains: agents, security, compliance, and intelligence.

```graphql
# Query agent status with security context
query AgentDashboard($domain: String!) {
  agents(status: ACTIVE) {
    name
    domain
    status
    lastActivity
    healthScore
  }

  securityRating(domain: $domain) {
    grade
    score
    industryPercentile
    breakdown {
      ssl
      headers
      vulnerabilities
      compliance
    }
  }

  complianceStatus(domain: $domain, frameworks: [NIS2, ZKB]) {
    framework
    score
    requirements {
      name
      status
      evidence
    }
  }
}
```

Subscriptions power real-time dashboard updates without polling. When a security rating changes or a new vulnerability is discovered, subscribed clients receive the update immediately through the WebSocket connection.

```graphql
# Real-time security event subscription
subscription SecurityEvents($domain: String!) {
  securityRatingChanged(domain: $domain) {
    domain
    oldGrade
    newGrade
    changedAt
    triggeredBy
  }
}
```

## Architecture

GraphQL occupies the API layer between client applications and the platform's domain logic, with Absinthe providing the [Elixir](@/technologies/elixir.md)-native implementation.

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| Transport | [Phoenix](@/technologies/phoenix.md) Router | HTTP endpoint and WebSocket connections |
| Schema | Absinthe Schema | Type definitions, query/mutation/subscription roots |
| Resolution | Absinthe Resolvers | Data fetching from domain services |
| Data Loading | Dataloader | Batch loading to prevent N+1 queries |
| Persistence | [Ecto](@/technologies/ecto.md) / [ETS](@/technologies/ets.md) | Database queries and cache lookups |
| Real-time | Absinthe Subscriptions | PubSub-triggered subscription delivery |
| Authentication | Plug Pipeline | Token verification before resolver access |

The schema is organized by domain to manage complexity across the platform's extensive data model.

```elixir
defmodule PrismaticWeb.Schema do
  use Absinthe.Schema

  import_types PrismaticWeb.Schema.AgentTypes
  import_types PrismaticWeb.Schema.SecurityTypes
  import_types PrismaticWeb.Schema.ComplianceTypes
  import_types PrismaticWeb.Schema.IntelligenceTypes

  query do
    import_fields :agent_queries
    import_fields :security_queries
    import_fields :compliance_queries
    import_fields :intelligence_queries
  end

  mutation do
    import_fields :agent_mutations
    import_fields :security_mutations
  end

  subscription do
    import_fields :security_subscriptions
    import_fields :agent_subscriptions
  end

  def context(ctx) do
    loader =
      Dataloader.new()
      |> Dataloader.add_source(:db, Dataloader.Ecto.new(Prismatic.Repo))

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader] ++ Absinthe.Plugin.defaults()
  end
end
```

## Query Resolution and Dataloader

The Dataloader integration is central to the platform's GraphQL performance strategy. Without Dataloader, a query fetching 100 agents with their domains would execute 101 database queries (one for the agent list, one for each agent's domain). With Dataloader, it executes exactly 2 queries: one for agents and one batch query for all referenced domains. This N+1 prevention operates transparently -- resolvers declare their data sources, and Dataloader batches all pending loads at the end of each resolution cycle.

The resolver pattern used across the platform separates authorization from data fetching, ensuring that access control is enforced consistently regardless of which fields a client requests:

```elixir
defmodule PrismaticWeb.Schema.SecurityResolvers do
  alias PrismaticPerimeter.SecurityRating

  def get_rating(_parent, %{domain: domain}, %{context: %{current_user: user}}) do
    with :ok <- authorize(user, :view_ratings, domain),
         {:ok, rating} <- SecurityRating.get_current(domain) do
      {:ok, rating}
    end
  end

  def rating_breakdown(rating, _args, _resolution) do
    {:ok, SecurityRating.calculate_breakdown(rating)}
  end

  defp authorize(user, permission, resource) do
    if PrismaticAuth.authorized?(user, permission, resource),
      do: :ok,
      else: {:error, "Not authorized to access #{resource}"}
  end
end
```

## Performance Characteristics

GraphQL performance in the Prismatic Platform is optimized through Dataloader batching, query complexity limits, and caching.

| Metric | Target | Measured | Notes |
|--------|--------|----------|-------|
| Simple query response | < 50ms | ~15ms | Single-type queries with few fields |
| Complex dashboard query | < 200ms | ~80ms | Multi-type queries with nested fields |
| Subscription delivery | < 100ms | ~30ms | PubSub event to client delivery |
| Schema introspection | < 500ms | ~200ms | Full schema query (development only) |
| Dataloader batch | < 50ms | ~20ms | Batched database query per source |
| Query depth limit | 10 levels | Enforced | Prevents abusive deeply-nested queries |
| Query complexity limit | 1000 points | Enforced | Cost-based query analysis |

Query complexity analysis assigns costs to individual fields, preventing clients from constructing resource-intensive queries that could degrade platform performance. Fields that trigger expensive computations, such as on-demand security score calculations, carry higher complexity costs than simple data retrieval fields.

## Configuration

The GraphQL endpoint is configured in the [Phoenix](@/technologies/phoenix.md) router with separate paths for the API endpoint and the interactive playground.

```elixir
# GraphQL endpoint configuration in router.ex
scope "/api" do
  pipe_through [:api, :authenticated]

  forward "/graphql", Absinthe.Plug,
    schema: PrismaticWeb.Schema

  forward "/graphiql", Absinthe.Plug.GraphiQL,
    schema: PrismaticWeb.Schema,
    interface: :playground,
    socket: PrismaticWeb.UserSocket
end
```

Query complexity and depth limits protect the endpoint from abusive queries.

```elixir
# Query complexity and depth configuration
config :prismatic_web, :graphql,
  max_complexity: 1000,
  max_depth: 10,
  default_page_size: 20,
  max_page_size: 100,
  subscription_ttl: :timer.hours(1)
```

## Error Handling and Partial Responses

GraphQL's error handling model provides significant advantages for the platform's security-sensitive operations. Unlike REST, where a partially failed request returns either success or failure, GraphQL can return partial data alongside granular error information for specific fields. This means a dashboard query that successfully retrieves agent data but fails to resolve a compliance score returns the available data with a structured error for the missing field, rather than failing entirely.

This resilience is particularly valuable for the Prismatic Platform's composite dashboard views, where data is aggregated from multiple domain services that may have different availability characteristics. The type system also enables precise authorization at the field level -- certain sensitive fields like vulnerability details can require elevated permissions while the rest of the query resolves normally.

The platform implements custom error middleware that transforms internal Elixir error tuples into structured GraphQL errors with standardized codes and human-readable messages:

```elixir
defmodule PrismaticWeb.Schema.ErrorMiddleware do
  @behaviour Absinthe.Middleware

  def call(resolution, _config) do
    %{resolution | errors: Enum.flat_map(resolution.errors, &handle_error/1)}
  end

  defp handle_error(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
    |> Enum.map(fn {field, messages} ->
      %{message: "#{field}: #{Enum.join(messages, ", ")}", extensions: %{code: "VALIDATION_ERROR"}}
    end)
  end

  defp handle_error(error), do: [error]
end
```

## Best Practices

- **Use Dataloader** for all resolver data fetching to prevent N+1 query problems -- Absinthe's Dataloader batches database calls automatically
- **Define input types** for mutations rather than accepting raw arguments, ensuring validation at the schema level
- **Limit query depth** to prevent abusive deeply-nested queries that could overwhelm the server; the platform enforces a depth limit of 10
- **Version through schema evolution** -- add new fields freely, deprecate old ones with `deprecate: "reason"`, never remove without migration
- **Use subscriptions** for real-time data instead of polling the query endpoint
- **Implement pagination** with cursor-based connections (Relay specification) for all list fields to prevent unbounded result sets
- **Add query complexity costs** to expensive fields (e.g., computed security scores) to prevent resource-intensive queries
- **Use middleware** for cross-cutting concerns like authentication, authorization, and error handling rather than repeating logic in resolvers

## Comparison with Alternatives

| Feature | GraphQL | REST (OpenAPI) | gRPC | JSON-RPC |
|---------|---------|---------------|------|----------|
| Client-specified fields | Yes | No | No | No |
| Type system | Strong | Weak (schema optional) | Strong (protobuf) | None |
| Real-time | Subscriptions | SSE/Polling | Streaming | Polling |
| Introspection | Built-in | Swagger UI | Reflection | None |
| Batching | Single request | Multiple endpoints | Stream | Batch array |
| Caching | Complex (POST) | Simple (HTTP cache) | N/A | N/A |
| Platform Role | Flexible client API | Auto-introspecting gateway | Not used | Not used |

The Prismatic Platform uses both GraphQL (for flexible client queries) and REST via [OpenAPI](@/technologies/openapi.md) (for the auto-introspecting API gateway), choosing the appropriate protocol for each use case. GraphQL excels when clients have varying data requirements and when real-time subscriptions are needed, while the REST API gateway provides a simpler integration point for external automation tools that benefit from standard HTTP caching and straightforward URL-based resource identification.

## Related Technologies

- [Absinthe](@/technologies/absinthe.md) - Elixir GraphQL implementation powering the endpoint
- [OpenAPI](@/technologies/openapi.md) - REST API alternative exposed via the auto-introspecting API gateway
- [WebSockets](@/technologies/websockets.md) - Transport layer for GraphQL subscriptions
- [Ecto](@/technologies/ecto.md) - Database layer backing GraphQL resolvers
- [Phoenix](@/technologies/phoenix.md) - Web framework hosting the GraphQL endpoint
- [ETS](@/technologies/ets.md) - In-memory cache for frequently queried data in resolvers

## Related Apps

- [prismatic_web](@/apps/prismatic-web.md) - Hosts the GraphQL endpoint and GraphiQL playground
- [prismatic_api](@/apps/prismatic-api.md) - REST API gateway that complements the GraphQL interface
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - Security data exposed through GraphQL queries
- [prismatic_agents](@/apps/prismatic-agents.md) - Agent data and subscriptions available through GraphQL

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)