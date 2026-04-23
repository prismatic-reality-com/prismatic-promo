+++
title = "Absinthe"
weight = 14
[extra]
category = "web-framework"
description = "Full-featured GraphQL implementation for Elixir with subscription support and dataloader integration"
url = "https://hexdocs.pm/absinthe/"
version = "1.7+"
icon = "absinthe"
color = "pink"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1192
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Absinthe", "Full-featured", "GraphQL", "Elixir", "technologies", "web framework", "Prismatic Platform", "Dataloader", "WebSocket"]
tags = ["technologies", "web-framework", "absinthe", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Absinthe - Prismatic Platform"
+++

## Overview

Absinthe is the GraphQL toolkit used in the Prismatic Platform for building flexible, type-safe APIs. It provides a complete GraphQL implementation including queries, mutations, subscriptions, and middleware -- all integrated with [Elixir](/technologies/elixir/)'s type system and [Erlang/OTP](/technologies/erlang-otp/)'s concurrency model. As the most mature and feature-complete GraphQL implementation for the [BEAM](/technologies/beam/) ecosystem, Absinthe transforms complex data requirements into clean, declarative schema definitions that are validated at compile time.

The Prismatic Platform uses Absinthe to expose complex intelligence data through a unified GraphQL endpoint at `/graphql`. This enables clients to request exactly the data they need -- whether that is a simple agent status check or a deeply nested query combining security ratings, compliance assessments, and asset inventories -- in a single request. Absinthe's Elixir-native schema DSL means GraphQL types are defined using familiar Elixir syntax with compile-time validation, catching schema errors before deployment rather than discovering them at runtime.

Absinthe's subscription system, built on [Phoenix](/technologies/phoenix/) channels and PubSub, powers real-time data feeds where clients receive instant updates when security ratings change, new vulnerabilities are discovered, or agent statuses shift. This is critical for the platform's security operations dashboards where stale data is unacceptable. The combination of Absinthe's subscription mechanism with the BEAM's lightweight process model means the platform can support thousands of concurrent subscription connections without degrading query performance.

## Key Features

Absinthe delivers a comprehensive GraphQL implementation that goes well beyond basic query resolution, providing enterprise-grade capabilities for building production APIs.

- **Schema DSL**: Elixir-native schema definition with compile-time type safety and validation, catching errors before deployment
- **Subscriptions**: Real-time data pushes through Phoenix channels, integrated with PubSub for cluster-wide delivery across distributed nodes
- **Dataloader**: Efficient batched data loading that prevents N+1 queries across all resolvers automatically through demand-driven batching
- **Middleware**: Request pipeline customization for authentication, authorization, logging, error formatting, and telemetry integration
- **Relay Support**: Cursor-based pagination and global node identification for Relay-compatible clients with automatic connection wrapping
- **Introspection**: Full GraphQL introspection enabling GraphiQL playground, client SDK generation, and automated documentation
- **Complexity Analysis**: Query complexity limiting to prevent abusive deeply-nested queries from overloading the server
- **Custom Scalars**: Define platform-specific scalar types (DateTime, UUID, JSON) with serialization and parsing logic
- **Union Types**: Model polymorphic responses where different agent types or asset categories return domain-specific fields

| Feature | Description | Platform Usage |
|---------|-------------|----------------|
| Schema DSL | Compile-time validated types | All API type definitions |
| Subscriptions | Real-time push via WebSocket | Security rating changes, agent status |
| Dataloader | Batched association loading | N+1 prevention across resolvers |
| Middleware | Request pipeline hooks | Auth, logging, error formatting |
| Complexity Analysis | Query cost limiting | DoS protection on public endpoints |
| Custom Scalars | Domain-specific types | DateTime, UUID, SecurityGrade |
| Introspection | Schema self-documentation | GraphiQL playground, SDK generation |

## Platform Integration

Absinthe provides the GraphQL API layer for the platform. The schema is organized by domain, with separate type modules for agents, security, compliance, and intelligence. This modular approach keeps schemas maintainable as the platform grows and ensures type definitions stay close to the domain logic they represent.

```elixir
defmodule PrismaticWeb.Schema do
  use Absinthe.Schema

  import_types PrismaticWeb.Schema.AgentTypes
  import_types PrismaticWeb.Schema.SecurityTypes
  import_types PrismaticWeb.Schema.ComplianceTypes

  query do
    field :agents, list_of(:agent) do
      arg :status, :agent_status
      arg :domain, :string
      middleware Middleware.Authentication
      resolve &PrismaticWeb.Resolvers.Agents.list/3
    end

    field :security_rating, :rating do
      arg :domain, non_null(:string)
      middleware Middleware.Authentication
      resolve &PrismaticWeb.Resolvers.Security.rating/3
    end

    field :compliance_assessment, :assessment do
      arg :domain, non_null(:string)
      arg :frameworks, list_of(:compliance_framework)
      resolve &PrismaticWeb.Resolvers.Compliance.assess/3
    end
  end

  subscription do
    field :agent_status_changed, :agent do
      arg :domain, :string

      config fn args, _resolution ->
        topic = if args[:domain], do: "agents:#{args.domain}", else: "agents:all"
        {:ok, topic: topic}
      end
    end

    field :security_rating_changed, :rating_change do
      arg :domain, non_null(:string)

      config fn args, _resolution ->
        {:ok, topic: "perimeter:#{args.domain}"}
      end
    end
  end
end
```

Custom types map Elixir domain concepts to GraphQL types with documentation that appears in the GraphiQL playground and generated client SDKs:

```elixir
defmodule PrismaticWeb.Schema.SecurityTypes do
  use Absinthe.Schema.Notation

  @desc "Security rating for a domain's external attack surface"
  object :rating do
    field :grade, non_null(:string)
    field :score, non_null(:integer)
    field :industry_percentile, :integer
    field :assessed_at, :datetime
    field :breakdown, :rating_breakdown
  end

  @desc "Detailed scoring breakdown by security category"
  object :rating_breakdown do
    field :ssl, :integer
    field :headers, :integer
    field :dns, :integer
    field :vulnerabilities, :integer
    field :compliance, :integer
  end

  enum :compliance_framework do
    value :nis2, description: "EU NIS2 Directive (2022/2555)"
    value :zkb, description: "Czech ZKB 264/2025 Sb."
  end
end
```

## Architecture

Absinthe fits into the Prismatic Platform's layered architecture as the API presentation layer, sitting between the Phoenix HTTP/WebSocket transport and the domain logic in the business layer. The architecture follows a clear separation of concerns where each layer has a distinct responsibility.

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| Transport | Phoenix Router + Endpoint | HTTP request handling, WebSocket connections |
| Presentation | Absinthe Schema + Types | GraphQL type definitions, field resolution mapping |
| Middleware | Auth, Logging, Complexity | Cross-cutting concerns applied to every resolution |
| Resolution | Resolver Modules | Data fetching and transformation logic |
| Data Access | [Ecto](/technologies/ecto/) + Dataloader | Database queries, batched association loading |
| Storage | [PostgreSQL](/technologies/postgresql/) + [ETS](/technologies/ets/) | Persistent and in-memory data storage |

Dataloader integration prevents N+1 queries when resolving nested associations, batching all database access within a single request into the minimum number of queries:

```elixir
defmodule PrismaticWeb.Schema.Middleware.Dataloader do
  def plugins do
    [Absinthe.Middleware.Dataloader | Absinthe.Plugin.defaults()]
  end

  def dataloader do
    Dataloader.new()
    |> Dataloader.add_source(:db, Dataloader.Ecto.new(PrismaticStorage.Repo))
  end
end
```

## Performance Characteristics

Absinthe's performance in the Prismatic Platform is tuned for high-throughput API operations. The BEAM's preemptive scheduler ensures that expensive GraphQL queries do not block other requests, and Dataloader's batching strategy minimizes database round-trips.

| Metric | Target | Typical Value |
|--------|--------|---------------|
| Simple query resolution | < 10ms | 3-5ms |
| Complex nested query | < 100ms | 40-80ms |
| Subscription delivery | < 50ms | 10-20ms |
| Concurrent subscriptions | 10,000+ | Limited by BEAM process capacity |
| Dataloader batch efficiency | > 90% reduction in queries | Typically 95%+ |

Query complexity analysis prevents resource exhaustion by assigning a cost to each field and rejecting queries that exceed the configured maximum. This protects the platform from malicious or accidentally expensive queries without requiring manual query review.

## Configuration

Absinthe endpoints are configured in the Phoenix router with separate paths for the API, the playground, and WebSocket subscriptions. Each path applies appropriate authentication and rate-limiting middleware.

```elixir
# Absinthe configuration in router.ex
scope "/api" do
  pipe_through [:api, :authenticated]

  forward "/graphql", Absinthe.Plug, schema: PrismaticWeb.Schema
  forward "/graphiql", Absinthe.Plug.GraphiQL,
    schema: PrismaticWeb.Schema,
    interface: :playground,
    socket: PrismaticWeb.UserSocket
end

# Subscription socket in endpoint.ex
socket "/socket", PrismaticWeb.UserSocket,
  websocket: true,
  longpoll: false
```

## Best Practices

The Prismatic Platform enforces strict conventions for Absinthe usage to maintain schema quality, prevent performance regressions, and ensure security across all GraphQL endpoints.

- **Organize types by domain** -- keep `AgentTypes`, `SecurityTypes`, and `ComplianceTypes` in separate modules for maintainability and clear ownership
- **Use Dataloader for all associations** -- manual resolver queries lead to N+1 problems; Dataloader batches automatically across the entire query tree
- **Add authentication middleware** -- every query and mutation should pass through the authentication middleware before resolving, enforcing the platform's security posture
- **Limit query complexity** -- set `max_complexity` on the schema to prevent malicious queries from consuming excessive resources on public-facing endpoints
- **Test resolvers independently** -- write unit tests for resolver functions with [ExUnit](/technologies/exunit/) and integration tests for the full GraphQL endpoint to catch schema regressions
- **Use `@desc` annotations** -- document every type, field, and argument; these descriptions appear in GraphiQL and generated docs, serving as the API's primary documentation
- **Version schema changes carefully** -- GraphQL's type system means field removal is a breaking change; deprecate fields before removing them
- **Monitor resolver performance** -- integrate Telemetry events to track resolution times and identify slow resolvers before they impact users

## Comparison

The platform evaluated several API approaches before selecting Absinthe as the primary API layer. GraphQL through Absinthe was chosen for its flexibility in handling complex, nested data structures common in intelligence and security domains.

| Criterion | Absinthe (GraphQL) | Phoenix REST | gRPC |
|-----------|-------------------|--------------|------|
| Client flexibility | Clients request exact fields | Fixed response shapes | Fixed message definitions |
| Real-time support | Native subscriptions | Requires separate WebSocket | Server streaming |
| Type safety | Schema-level + compile-time | Runtime validation | Protobuf compile-time |
| N+1 prevention | Dataloader automatic batching | Manual eager loading | N/A (no nesting) |
| Documentation | Auto-generated from schema | Requires OpenAPI spec | Protobuf self-documenting |
| Elixir ecosystem | Native, first-class | Native, first-class | Third-party library |
| Learning curve | Moderate (GraphQL + Absinthe) | Low (REST conventions) | Moderate (protobuf + gRPC) |

The platform also exposes a REST API through the auto-introspecting [Prismatic API](/apps/prismatic-api/) gateway for simpler integration scenarios, but Absinthe remains the primary choice for complex data queries.

## Related Technologies

- [Phoenix Framework](/technologies/phoenix/) - Web framework providing the HTTP and WebSocket transport layer
- [Ecto](/technologies/ecto/) - Data layer powering Dataloader and resolver queries
- [Phoenix LiveView](/technologies/phoenix-liveview/) - Server-rendered UI that complements the GraphQL API
- [PostgreSQL](/technologies/postgresql/) - Primary database backend for Ecto queries
- [ETS](/technologies/ets/) - In-memory caching for frequently accessed resolver data
- [ExUnit](/technologies/exunit/) - Testing framework for resolver and schema tests
- [Credo](/technologies/credo/) - Code quality enforcement for schema module organization

## Related Apps

- [prismatic_web](/apps/prismatic-web/) - Hosts the GraphQL endpoint, GraphiQL playground, and subscription WebSocket
- [prismatic_api](/apps/prismatic-api/) - REST API gateway that complements the GraphQL interface for simpler integrations
- [prismatic_perimeter](/apps/prismatic-perimeter/) - Security and EASM data exposed through GraphQL queries and real-time subscriptions
- [prismatic_agents](/apps/prismatic-agents/) - Agent status and control operations available through GraphQL mutations
- [prismatic_storage_ecto](/apps/prismatic-storage-ecto/) - Ecto adapter that Dataloader uses for batched database access

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)