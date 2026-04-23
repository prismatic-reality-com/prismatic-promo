+++
title = "GraphQL API"
weight = 12
date = 2026-02-12
[extra]
icon = "lightning"
color = "rose"
description = "Type-safe API with Absinthe, DataLoader, and real-time subscriptions"
date_created = "2025-07-20"
reading_time = "14 min"
difficulty = "advanced"
tags = ["graphql", "absinthe", "api", "type-safety", "subscriptions", "dataloader", "elixir"]
related_articles = ["pubsub", "phoenix-liveview", "storage-adapters", "telemetry"]
authors = ["Tomáš Korcak (korczis)"]
author = "Tomas Korcak (korczis)"
word_count = 1373
date_modified = "2026-02-23"
keywords = ["GraphQL", "API", "Type-safe", "Absinthe", "DataLoader", "architecture", "Prismatic Platform", "REST"]
quality_score = 80
see_also = ["capabilities", "technologies", "glossary"]
image = "/images/sections/architecture.png"
image_alt = "GraphQL API - Prismatic Platform"
+++

## Overview

The Prismatic Platform exposes a [GraphQL](/glossary/graphql/) API built on Absinthe, the premier GraphQL implementation for the [Elixir](/glossary/elixir/) ecosystem. The choice of GraphQL over a pure REST approach was driven by three concrete requirements: the platform serves diverse clients ([LiveView](/glossary/liveview/) dashboards, CLI tools, external integrations, mobile applications) that each need different subsets of the same data; the domain model contains deeply nested relationships (assets have vulnerabilities which have ratings which have historical trends) where REST would require either over-fetching or multiple round-trips; and real-time subscriptions for security events must be first-class API citizens rather than bolted-on afterthoughts.

Absinthe was selected over alternatives like GraphQL-Yoga (Node.js), Strawberry (Python), or graphql-java because it leverages the [BEAM](/glossary/beam/) runtime's native strengths: each GraphQL subscription maps to a lightweight process, subscription delivery piggybacks on [Phoenix PubSub](/architecture/pubsub/) without additional infrastructure, and the Absinthe middleware pipeline integrates naturally with [OTP](/glossary/otp/) patterns for authentication, authorization, and [telemetry](/glossary/telemetry/).

The [Prismatic API application](/apps/prismatic-api/) also provides a REST gateway that auto-discovers facade modules, but the GraphQL layer remains the preferred interface for complex queries, nested data traversal, and real-time event streams where clients need fine-grained control over the response shape.

## Schema Architecture

The GraphQL schema follows a modular, type-first design where each domain concept maps to a dedicated type module. This architecture prevents the monolithic schema problem that plagues many GraphQL deployments, where a single schema file grows to thousands of lines and becomes unmaintainable.

```
Client Request
      |
      v
  Phoenix Router (/api/graphql)
      |
      v
  Absinthe.Plug (parse + validate)
      |
      v
  Context Plug (authentication, metadata)
      |
      v
  Schema (root types: query, mutation, subscription)
      |
      +---> Type Modules (Asset, Agent, Security, Compliance)
      |         |
      |         v
      |     Resolvers (business logic delegation)
      |         |
      |         v
      |     DataLoader (batched data access)
      |         |
      |         +---> Storage Protocol (ETS, Ecto, Redis, KuzuDB)
      |
      v
  Middleware Pipeline (auth, logging, error handling)
      |
      v
  Response Serialization (JSON)
```

The key design decision is that resolvers never contain business logic directly. They delegate to domain modules (such as `PrismaticPerimeter` or `PrismaticAgents`), which keeps the GraphQL layer thin and testable independently of the API transport. This also means the same business logic is reachable from LiveView dashboards, background jobs, and the [REST API](/glossary/rest-api/) without duplication.

## Schema Definition and Type System

### Root Schema Module

The root schema aggregates type definitions from domain-specific modules and defines the three GraphQL root types: queries (read operations), mutations (write operations), and subscriptions (real-time event streams):

```elixir
defmodule PrismaticGraphQL.Schema do
  use Absinthe.Schema

  import_types(Absinthe.Type.Custom)
  import_types(PrismaticGraphQL.Types.Asset)
  import_types(PrismaticGraphQL.Types.Agent)
  import_types(PrismaticGraphQL.Types.Security)
  import_types(PrismaticGraphQL.Types.Compliance)
  import_types(PrismaticGraphQL.Types.Pagination)

  query do
    @desc "List assets with filtering, sorting, and pagination"
    field :assets, :asset_connection do
      arg(:filter, :asset_filter)
      arg(:sort_by, :asset_sort_field, default_value: :discovered_at)
      arg(:sort_dir, :sort_direction, default_value: :desc)
      arg(:first, :integer, default_value: 20)
      arg(:after, :string)
      middleware(PrismaticGraphQL.Middleware.Authenticate)
      resolve(&PrismaticGraphQL.Resolvers.Asset.list/3)
    end

    @desc "Retrieve a single asset by its unique identifier"
    field :asset, :asset do
      arg(:id, non_null(:id))
      middleware(PrismaticGraphQL.Middleware.Authenticate)
      resolve(&PrismaticGraphQL.Resolvers.Asset.get/3)
    end

    @desc "Current security rating for a domain"
    field :security_rating, :security_rating do
      arg(:domain, non_null(:string))
      middleware(PrismaticGraphQL.Middleware.Authenticate)
      resolve(&PrismaticGraphQL.Resolvers.Security.rating/3)
    end
  end

  mutation do
    @desc "Initiate asset discovery for a domain"
    field :discover_assets, :discovery_result do
      arg(:domain, non_null(:string))
      arg(:depth, :integer, default_value: 2)
      arg(:include_subdomains, :boolean, default_value: true)
      middleware(PrismaticGraphQL.Middleware.Authenticate)
      middleware(PrismaticGraphQL.Middleware.Authorize, permission: :discover_assets)
      resolve(&PrismaticGraphQL.Resolvers.Asset.discover/3)
    end
  end

  subscription do
    @desc "Real-time stream of newly discovered assets"
    field :asset_discovered, :asset do
      arg(:domain_filter, :string)

      config(fn args, _resolution ->
        topic =
          case args[:domain_filter] do
            nil -> "assets:discovered"
            domain -> "assets:discovered:#{domain}"
          end

        {:ok, topic: topic}
      end)

      trigger(:discover_assets,
        topic: fn result ->
          ["assets:discovered", "assets:discovered:#{result.domain}"]
        end
      )
    end

    @desc "Real-time security rating changes"
    field :rating_changed, :security_rating do
      arg(:domain, non_null(:string))

      config(fn %{domain: domain}, _resolution ->
        {:ok, topic: "ratings:#{domain}"}
      end)
    end
  end

  def context(ctx) do
    loader = PrismaticGraphQL.DataSource.data()
    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader | Absinthe.Plugin.defaults()]
  end
end
```

### Object Types with DataLoader Integration

Each object type defines its fields with explicit descriptions and uses DataLoader references for associated data, preventing the N+1 query problem at the schema level rather than relying on resolver discipline:

```elixir
defmodule PrismaticGraphQL.Types.Asset do
  use Absinthe.Schema.Notation
  import Absinthe.Resolution.Helpers, only: [dataloader: 1, dataloader: 2]

  @desc "An external-facing asset discovered during attack surface analysis"
  object :asset do
    field :id, non_null(:id)
    field :domain, non_null(:string), description: "Fully qualified domain name"
    field :ip_addresses, list_of(:string), description: "Resolved IP addresses"
    field :asset_type, non_null(:asset_type), description: "Classification: domain, ip, certificate, cloud_resource"
    field :discovered_at, non_null(:datetime)
    field :last_seen_at, :datetime

    field :security_rating, :security_rating,
      resolve: dataloader(:ratings),
      description: "Most recent security rating for this asset"

    field :vulnerabilities, list_of(:vulnerability),
      resolve: dataloader(:vulns, args: %{status: :open}),
      description: "Open vulnerabilities associated with this asset"

    field :compliance_findings, list_of(:compliance_finding),
      resolve: dataloader(:compliance),
      description: "NIS2 and ZKB compliance findings"

    field :related_assets, list_of(:asset),
      resolve: &PrismaticGraphQL.Resolvers.Asset.related/3,
      description: "Assets sharing infrastructure or certificate chain"
  end

  @desc "Security rating on the A-F scale (300-900 numeric)"
  object :security_rating do
    field :grade, non_null(:string), description: "Letter grade: A, B, C, D, or F"
    field :score, non_null(:integer), description: "Numeric score from 300 to 900"
    field :industry_percentile, :integer, description: "Percentile rank within industry"
    field :calculated_at, non_null(:datetime)
    field :factors, list_of(:rating_factor), description: "Contributing factors to the rating"
  end

  @desc "Filter criteria for asset queries"
  input_object :asset_filter do
    field :domain_contains, :string, description: "Substring match on domain name"
    field :security_grade, :string, description: "Exact grade match (A, B, C, D, F)"
    field :min_score, :integer, description: "Minimum numeric security score"
    field :asset_type, :asset_type, description: "Filter by asset classification"
    field :discovered_after, :datetime, description: "Assets discovered after this timestamp"
    field :discovered_before, :datetime, description: "Assets discovered before this timestamp"
  end

  enum :asset_type do
    value(:domain, description: "DNS domain or subdomain")
    value(:ip, description: "IP address (v4 or v6)")
    value(:certificate, description: "TLS/SSL certificate")
    value(:cloud_resource, description: "Cloud infrastructure resource")
    value(:service, description: "Network service or open port")
  end

  enum :asset_sort_field do
    value(:discovered_at)
    value(:domain)
    value(:security_score)
    value(:last_seen_at)
  end
end
```

## DataLoader: Solving the N+1 Problem

The N+1 query problem is the most common performance pitfall in GraphQL implementations. When a client queries a list of assets and requests the [security rating](/glossary/security-rating/) for each, a naive resolver implementation executes one database query for the asset list, then one additional query per asset to fetch its rating. For 100 assets, this produces 101 queries.

DataLoader solves this by collecting all requested keys during resolution and executing a single batched query. The Prismatic Platform's DataLoader configuration demonstrates how this works across multiple [storage backends](/architecture/storage-adapters/):

```elixir
defmodule PrismaticGraphQL.DataSource do
  @moduledoc """
  Configures DataLoader sources for batched data access across
  multiple storage backends. Each source maps to a specific storage
  adapter and query strategy.
  """

  def data do
    Dataloader.new(get_policy: :tuples)
    |> Dataloader.add_source(:ratings, ratings_source())
    |> Dataloader.add_source(:vulns, vulns_source())
    |> Dataloader.add_source(:compliance, compliance_source())
  end

  defp ratings_source do
    Dataloader.Ecto.new(PrismaticStorage.Repo,
      query: fn
        PrismaticPerimeter.SecurityRating, _args ->
          from(r in PrismaticPerimeter.SecurityRating,
            order_by: [desc: r.calculated_at],
            distinct: r.asset_id
          )

        queryable, _args ->
          queryable
      end
    )
  end

  defp vulns_source do
    Dataloader.Ecto.new(PrismaticStorage.Repo,
      query: fn PrismaticPerimeter.Vulnerability, %{status: status} ->
        from(v in PrismaticPerimeter.Vulnerability,
          where: v.status == ^status,
          order_by: [desc: v.severity, desc: v.discovered_at]
        )
      end
    )
  end

  defp compliance_source do
    Dataloader.Ecto.new(PrismaticStorage.Repo,
      query: fn queryable, _args ->
        from(c in queryable,
          order_by: [desc: c.assessed_at]
        )
      end
    )
  end
end
```

### Performance Impact of DataLoader

The query reduction is dramatic and measurable:

| Scenario | Without DataLoader | With DataLoader | Reduction |
|----------|-------------------|-----------------|-----------|
| 50 assets + ratings | 51 queries, ~55ms | 2 queries, ~3ms | 96% |
| 50 assets + ratings + vulns | 101 queries, ~110ms | 3 queries, ~5ms | 97% |
| 100 assets + all associations | 301 queries, ~350ms | 4 queries, ~8ms | 99% |

These benchmarks were measured using [Ecto](/glossary/ecto/) telemetry events against the platform's [PostgreSQL](/glossary/postgresql/) instance. The DataLoader approach also reduces database connection pool pressure, which is critical when the same pool serves [LiveView](/architecture/phoenix-liveview/) dashboards, background jobs, and API requests simultaneously.

## Middleware Pipeline

Absinthe's middleware system provides a composable pipeline for cross-cutting concerns. Unlike REST frameworks where authentication, authorization, and logging are configured at the router level, GraphQL middleware attaches to individual fields, enabling fine-grained control:

```elixir
defmodule PrismaticGraphQL.Middleware.Authenticate do
  @behaviour Absinthe.Middleware

  @impl true
  def call(%{context: %{current_user: %{} = _user}} = resolution, _config) do
    resolution
  end

  def call(resolution, _config) do
    resolution
    |> Absinthe.Resolution.put_result({:error, "Authentication required"})
  end
end

defmodule PrismaticGraphQL.Middleware.Authorize do
  @behaviour Absinthe.Middleware

  @impl true
  def call(%{context: %{current_user: user}} = resolution, permission: permission) do
    if PrismaticAuth.Permissions.can?(user, permission) do
      resolution
    else
      resolution
      |> Absinthe.Resolution.put_result(
        {:error, "Insufficient permissions: #{permission} required"}
      )
    end
  end

  def call(resolution, _config) do
    resolution
    |> Absinthe.Resolution.put_result({:error, "Authentication required"})
  end
end

defmodule PrismaticGraphQL.Middleware.Timing do
  @behaviour Absinthe.Middleware

  @impl true
  def call(resolution, _config) do
    start = System.monotonic_time(:microsecond)

    %{resolution | middleware: resolution.middleware ++ [{__MODULE__, {:stop, start}}]}
  end

  def call(resolution, {:stop, start}) do
    duration = System.monotonic_time(:microsecond) - start

    :telemetry.execute(
      [:prismatic, :graphql, :resolve],
      %{duration: duration},
      %{
        field: resolution.definition.name,
        parent: resolution.parent_type.name
      }
    )

    resolution
  end
end
```

The middleware approach composes cleanly. A mutation field might stack `Authenticate -> Authorize -> Timing -> resolve`, while a public query might only use `Timing -> resolve`. This composability is a significant advantage over REST's route-level middleware, where applying different policies to different fields within the same endpoint is awkward.

## Resolver Design Patterns

### Delegation Pattern

Resolvers in the Prismatic Platform follow a strict delegation pattern: they translate GraphQL arguments into domain function calls and translate domain results into GraphQL responses. They never contain business logic:

```elixir
defmodule PrismaticGraphQL.Resolvers.Asset do
  @moduledoc """
  Resolvers for asset-related queries and mutations.
  All business logic delegates to PrismaticPerimeter domain modules.
  """

  def list(_parent, args, %{context: context}) do
    opts =
      args
      |> Map.take([:filter, :sort_by, :sort_dir, :first, :after])
      |> Map.put(:tenant_id, context.current_user.tenant_id)

    case PrismaticPerimeter.Assets.list(opts) do
      {:ok, page} ->
        {:ok, %{
          edges: Enum.map(page.entries, &%{node: &1, cursor: encode_cursor(&1)}),
          page_info: %{
            has_next_page: page.has_next,
            end_cursor: page.entries |> List.last() |> encode_cursor()
          }
        }}

      {:error, reason} ->
        {:error, "Failed to list assets: #{reason}"}
    end
  end

  def get(_parent, %{id: id}, %{context: context}) do
    case PrismaticPerimeter.Assets.get(id, tenant_id: context.current_user.tenant_id) do
      {:ok, asset} -> {:ok, asset}
      {:error, :not_found} -> {:error, message: "Asset not found", code: "NOT_FOUND"}
    end
  end

  def discover(_parent, %{domain: domain} = args, %{context: context}) do
    opts = %{
      depth: args[:depth] || 2,
      include_subdomains: args[:include_subdomains] || true,
      initiated_by: context.current_user.id
    }

    case PrismaticPerimeter.discover(domain, opts) do
      {:ok, result} -> {:ok, result}
      {:error, :rate_limited} -> {:error, message: "Rate limit exceeded", code: "RATE_LIMITED"}
      {:error, reason} -> {:error, "Discovery failed: #{inspect(reason)}"}
    end
  end

  def related(%{id: asset_id}, _args, _resolution) do
    PrismaticPerimeter.Assets.related(asset_id)
  end

  defp encode_cursor(nil), do: nil
  defp encode_cursor(asset), do: Base.url_encode64("#{asset.id}:#{asset.discovered_at}")
end
```

### Error Handling Strategy

The platform uses structured error tuples that translate cleanly to GraphQL error extensions, providing machine-readable error codes alongside human-readable messages:

```elixir
defmodule PrismaticGraphQL.Middleware.ErrorHandler do
  @behaviour Absinthe.Middleware

  @impl true
  def call(resolution, _config) do
    %{resolution | errors: Enum.flat_map(resolution.errors, &transform_error/1)}
  end

  defp transform_error(%{code: code, message: message}) do
    [%{message: message, extensions: %{code: code}}]
  end

  defp transform_error(message) when is_binary(message) do
    [%{message: message, extensions: %{code: "INTERNAL_ERROR"}}]
  end

  defp transform_error(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
    |> Enum.map(fn {field, messages} ->
      %{
        message: "#{field}: #{Enum.join(messages, ", ")}",
        extensions: %{code: "VALIDATION_ERROR", field: field}
      }
    end)
  end
end
```

## Subscriptions and Real-Time Events

GraphQL subscriptions in Absinthe leverage [Phoenix PubSub](/architecture/pubsub/) for event delivery. Each subscription creates a lightweight BEAM process that listens on a PubSub topic and pushes data to the client over a [WebSocket](/glossary/websocket/) connection. This is where Absinthe's BEAM-native design truly differentiates it from Node.js or Java GraphQL implementations that require external message brokers for subscription support.

```elixir
defmodule PrismaticGraphQL.Subscriptions.Publisher do
  @moduledoc """
  Publishes domain events to GraphQL subscription topics.
  Called from domain modules when significant state changes occur.
  """

  def asset_discovered(asset) do
    Absinthe.Subscription.publish(
      PrismaticWeb.Endpoint,
      asset,
      asset_discovered: "assets:discovered",
      asset_discovered: "assets:discovered:#{asset.domain}"
    )
  end

  def rating_changed(rating) do
    Absinthe.Subscription.publish(
      PrismaticWeb.Endpoint,
      rating,
      rating_changed: "ratings:#{rating.domain}"
    )
  end
end
```

### Subscription Scaling Characteristics

| Metric | Value | Notes |
|--------|-------|-------|
| Concurrent subscriptions per node | 10,000+ | Each is a ~2KB BEAM process |
| Event delivery latency | <50ms | PubSub broadcast + serialization |
| Memory per subscription | ~3KB | Process heap + topic metadata |
| Reconnection handling | Automatic | Phoenix [Channel](/glossary/channel/) reconnection [protocol](/glossary/protocol/) |
| Subscription parsing | <1ms | Cached after first parse |

## Authentication and Authorization

The authentication context is established at the [plug](/glossary/plug/) level before Absinthe processes the request. This separation ensures that the GraphQL layer never handles raw tokens or credentials:

```elixir
defmodule PrismaticGraphQL.ContextPlug do
  @behaviour Plug
  import Plug.Conn

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    context = build_context(conn)
    Absinthe.Plug.put_options(conn, context: context)
  end

  defp build_context(conn) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, claims} <- PrismaticAuth.Token.verify(token),
         {:ok, user} <- PrismaticAuth.Users.get(claims["sub"]) do
      %{
        current_user: user,
        permissions: PrismaticAuth.Permissions.for_user(user),
        request_id: get_req_header(conn, "x-request-id") |> List.first(),
        ip: conn.remote_ip |> :inet.ntoa() |> to_string()
      }
    else
      _ -> %{}
    end
  end
end
```

Authorization is then enforced at the field level through middleware, as shown in the middleware section above. This field-level granularity means a single query can contain both public and protected fields, with unauthorized fields returning null rather than failing the entire request.

## Performance Characteristics and Optimization

### Query Complexity Analysis

To prevent resource exhaustion from deeply nested or excessively broad queries, the platform implements query complexity analysis:

```elixir
defmodule PrismaticGraphQL.Schema do
  # ... (schema definition above)

  def middleware(middleware, field, %{identifier: :query}) do
    [{PrismaticGraphQL.Middleware.QueryComplexity, max: 500} | middleware]
  end

  def middleware(middleware, _field, _object) do
    middleware
  end
end
```

### Measured Performance

Benchmarks against the Prismatic Platform GraphQL endpoint (single node, 8-core, 32GB RAM):

| Operation | Latency (p50) | Latency (p99) | Notes |
|-----------|--------------|--------------|-------|
| Simple query (1 field) | 0.8ms | 2ms | Cached schema resolution |
| List query (20 items, 5 fields) | 3ms | 8ms | DataLoader batching |
| Nested query (20 items, associations) | 5ms | 15ms | 3-4 batched DB queries |
| Mutation (discover) | 12ms | 45ms | Async discovery initiation |
| Subscription setup | 1ms | 3ms | Process spawn + topic register |
| Subscription event delivery | 2ms | 8ms | PubSub + serialization |
| Introspection query | 5ms | 12ms | Full schema traversal |

## Comparison with REST and Alternative Approaches

### GraphQL vs REST for the Prismatic Domain

| Criterion | REST | GraphQL | Prismatic Decision |
|-----------|------|---------|-------------------|
| Client diversity | Fixed response shape | Client-specified fields | GraphQL: serves diverse clients |
| Nested data | Multiple requests or includes | Single query with depth | GraphQL: fewer round-trips |
| Over-fetching | Returns full resource | Returns requested fields only | GraphQL: bandwidth efficiency |
| Discoverability | Requires separate docs ([OpenAPI](/glossary/openapi/)) | Built-in introspection | GraphQL: self-documenting |
| Caching | HTTP caching built-in | Requires custom strategy | REST: simpler caching |
| File uploads | Multipart native | Requires extensions | REST: simpler uploads |
| Real-time | Separate WebSocket layer | Native subscriptions | GraphQL: unified API |

The Prismatic Platform maintains both a [REST API](/apps/prismatic-api/) (for simple CRUD operations and external integrations that expect REST) and the GraphQL API (for complex queries, subscriptions, and internal tooling). This dual approach avoids forcing GraphQL on consumers who do not benefit from it while providing its advantages where they matter.

### Absinthe vs Other GraphQL Libraries

Absinthe was chosen over Apollo Server (Node.js), Sangria (Scala), and graphql-ruby for the following reasons:

1. **Process-per-subscription**: Each subscription is a BEAM process, not a shared thread pool entry. This provides natural [backpressure](/glossary/backpressure/) and fault isolation.
2. **PubSub integration**: Subscription delivery uses [Phoenix PubSub](/architecture/pubsub/) directly, with no additional message broker required for single-cluster deployments.
3. **Middleware composability**: Absinthe's middleware system is more granular (field-level) than most alternatives (resolver-level).
4. **DataLoader integration**: Built specifically for Absinthe, with [Ecto](/glossary/ecto/) support that understands changesets, schemas, and query composition.

## Introspection and Developer Experience

The GraphQL API is self-documenting through introspection. The platform exposes a GraphiQL interface in development and staging environments for interactive query exploration:

```elixir
# Router configuration
scope "/api" do
  pipe_through(:graphql_context)

  forward("/graphql", Absinthe.Plug, schema: PrismaticGraphQL.Schema)

  if Mix.env() in [:dev, :staging] do
    forward("/graphiql", Absinthe.Plug.GraphiQL,
      schema: PrismaticGraphQL.Schema,
      interface: :playground,
      socket: PrismaticWeb.UserSocket
    )
  end
end
```

Every field, type, and argument carries `@desc` annotations that appear in the introspection response, ensuring that API documentation stays synchronized with the implementation. This eliminates the documentation drift common in REST APIs where OpenAPI specs diverge from actual behavior.

## Testing Strategy

GraphQL tests in the Prismatic Platform operate at two levels: unit tests for individual resolvers (fast, isolated) and integration tests that exercise the full Absinthe pipeline (slower, comprehensive):

```elixir
defmodule PrismaticGraphQL.Resolvers.AssetTest do
  use PrismaticStorage.DataCase, async: true

  @list_query """
  query ListAssets($filter: AssetFilter, $first: Int) {
    assets(filter: $filter, first: $first) {
      edges {
        node {
          id
          domain
          securityRating {
            grade
            score
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
  """

  test "lists assets with security rating" do
    asset = insert(:asset, domain: "example.com")
    insert(:security_rating, asset: asset, grade: "B", score: 780)

    result =
      PrismaticGraphQL.Schema
      |> Absinthe.run(@list_query,
        variables: %{"first" => 10},
        context: %{current_user: build(:user)}
      )

    assert {:ok, %{data: %{"assets" => %{"edges" => [edge]}}}} = result
    assert edge["node"]["domain"] == "example.com"
    assert edge["node"]["securityRating"]["grade"] == "B"
  end
end
```

## Summary

The GraphQL API serves as the platform's primary programmatic interface for complex data access patterns. By leveraging Absinthe's BEAM-native architecture, the [Prismatic Platform](/apps/prismatic-api/) achieves type-safe, self-documenting, real-time capable API access with performance characteristics that would require significantly more infrastructure in other language ecosystems. The DataLoader integration eliminates N+1 queries structurally, the middleware pipeline provides field-level security controls, and the subscription system delivers real-time events to thousands of concurrent clients using the same [PubSub infrastructure](/architecture/pubsub/) that powers [LiveView dashboards](/architecture/phoenix-liveview/) and [agent coordination](/apps/prismatic-agents/). The result is a unified, high-performance API layer that adapts to each client's needs without sacrificing type safety or [observability](/glossary/observability/).

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
