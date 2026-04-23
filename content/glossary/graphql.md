+++
title = "GraphQL"
weight = 12
[extra]
category = "api"
subcategory = "query-language"
description = "Query language for APIs enabling clients to request exactly the data they need with a strongly-typed schema and real-time subscriptions"
keywords = ["graphql", "api", "query-language", "schema", "subscriptions", "resolvers", "absinthe", "dataloader", "real-time"]
related_terms = ["openapi", "phoenix", "pubsub", "channel", "rest", "websocket", "absinthe"]
complexity = "advanced"
implementation_guide = "yes"
code_examples = "yes"
best_practices = "yes"
use_cases = ["flexible-data-fetching", "real-time-dashboards", "client-driven-apis", "data-aggregation"]
prerequisites = ["rest-apis", "phoenix", "elixir-basics", "database-design"]
learning_path = ["rest-apis", "schema-design", "resolver-implementation", "subscriptions"]
difficulty = "intermediate-advanced"
time_to_learn = "2-3 weeks"
industry_usage = "high"
pattern_type = "api-design"
architecture_layer = "api"
quality_gates = ["schema-validation", "query-complexity", "performance", "security"]
testing_approach = ["schema-testing", "resolver-testing", "integration-testing"]
monitoring = ["query-performance", "resolver-errors", "subscription-health"]
scalability = "high"
graphql_features = ["queries", "mutations", "subscriptions", "schema-introspection", "type-system"]
performance_considerations = ["n-plus-one", "dataloader", "query-complexity", "caching"]
security_aspects = ["query-depth-limiting", "rate-limiting", "field-level-auth", "introspection-control"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1188
date_created = "2026-02-23"
date_modified = "2026-02-23"
tags = ["glossary", "api", "graphql", "prismatic"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "GraphQL - Prismatic Platform"
+++

## Definition

GraphQL is a query language for APIs and a server-side runtime for executing those queries, developed internally at Facebook in 2012 and released as an open-source specification in 2015. Unlike [REST APIs](/glossary/rest-api/) where the server defines fixed endpoint-specific response shapes, GraphQL inverts the control by allowing clients to declare exactly which fields they need in a single request, and the server returns precisely that data---no more, no less. This client-driven data fetching eliminates the two most common inefficiencies of REST: over-fetching (receiving unnecessary fields) and under-fetching (requiring multiple sequential requests to assemble the needed data).

The GraphQL specification defines three operation types: queries (read operations), mutations (write operations), and subscriptions (real-time streaming operations). All operations are validated against a strongly-typed schema that serves as the contract between client and server. The schema defines every type, field, relationship, and argument available in the API, and the runtime ensures that queries are syntactically and semantically valid before execution. This type system enables powerful tooling---autocompletion in IDEs, automatic documentation generation, compile-time query validation, and type-safe client code generation.

A fundamental architectural distinction between GraphQL and REST is the endpoint model. REST distributes resources across many URL endpoints (`/api/assets`, `/api/assets/123/ratings`, `/api/compliance/nis2`), each returning a fixed structure. GraphQL exposes a single endpoint (typically `/graphql`) through which all operations are submitted as structured query documents. The server resolves each field in the query by calling resolver functions that can fetch data from databases, other APIs, caches, or any data source, composing the response incrementally.

## Schema-First Design

GraphQL uses a Schema Definition Language (SDL) to describe the API's type system. The schema is both the documentation and the contract:

```graphql
# GraphQL schema for security intelligence
type Query {
  asset(id: ID!): Asset
  assets(filter: AssetFilter, first: Int, after: String): AssetConnection!
  securityRating(domain: String!): SecurityRating
  complianceAssessment(domain: String!, frameworks: [Framework!]!): ComplianceReport
}

type Mutation {
  discoverAttackSurface(domain: String!): DiscoveryResult!
  updateAssetMetadata(id: ID!, metadata: JSON!): Asset!
}

type Subscription {
  securityAlerts(severity: Severity): SecurityAlert!
  assetDiscoveryProgress(domain: String!): DiscoveryProgress!
}

type Asset {
  id: ID!
  domain: String!
  type: AssetType!
  rating: SecurityRating
  compliance: [ComplianceScore!]!
  lastSeen: DateTime!
  metadata: JSON
}

type SecurityRating {
  grade: Grade!
  score: Int!
  factors: [RatingFactor!]!
  measuredAt: DateTime!
  industryPercentile: Int
}

enum Grade { A B C D E F }
enum Severity { CRITICAL HIGH MEDIUM LOW INFO }
enum Framework { NIS2 ZKB OWASP GDPR }

input AssetFilter {
  domain: String
  type: AssetType
  minScore: Int
  maxScore: Int
  grade: Grade
}
```

The schema-first approach means the API contract is designed before implementation, enabling frontend and backend teams to work in parallel once the schema is agreed upon.

## Resolver Architecture

Resolvers are functions that populate each field in a GraphQL response. They form a tree structure matching the query shape, with each resolver responsible for fetching data for its specific field:

```elixir
# Absinthe resolvers in Elixir
defmodule PrismaticApi.Resolvers.Asset do
  alias PrismaticPerimeter.Assets

  def get_asset(_parent, %{id: id}, _resolution) do
    case Assets.get(id) do
      {:ok, asset} -> {:ok, asset}
      {:error, :not_found} -> {:error, "Asset not found"}
    end
  end

  def list_assets(_parent, args, _resolution) do
    filter = Map.get(args, :filter, %{})
    pagination = Map.take(args, [:first, :after])

    case Assets.list(filter, pagination) do
      {:ok, connection} -> {:ok, connection}
      {:error, reason} -> {:error, reason}
    end
  end

  # Nested resolver: Asset -> SecurityRating
  def security_rating(%{id: asset_id}, _args, _resolution) do
    PrismaticPerimeter.Ratings.latest_for_asset(asset_id)
  end
end
```

Resolvers execute lazily---only fields requested by the client trigger their corresponding resolver functions. This means a query requesting only `{ asset(id: "123") { domain, type } }` will never execute the `security_rating` resolver, even though it is defined on the `Asset` type.

## N+1 Problem and DataLoader

The most significant performance challenge in GraphQL is the N+1 query problem: when a list of N parent records each trigger an individual database query to fetch a related child record, producing N+1 total queries instead of 2 (one for parents, one batch for children).

```graphql
# This query could trigger N+1 without DataLoader
{
  assets(first: 50) {
    edges {
      node {
        domain
        rating { grade, score }    # Without batching: 50 individual queries
        compliance { framework, score }  # Without batching: 50 more queries
      }
    }
  }
}
```

The solution is DataLoader, a batching and caching utility that collects all field-level data requests during a single execution tick and resolves them in batches:

```elixir
# Absinthe DataLoader configuration
defmodule PrismaticApi.Schema do
  use Absinthe.Schema

  def context(ctx) do
    loader =
      Dataloader.new()
      |> Dataloader.add_source(:ratings, Dataloader.Ecto.new(Repo))
      |> Dataloader.add_source(:compliance, Dataloader.Ecto.new(Repo))

    Map.put(ctx, :loader, loader)
  end

  def plugins do
    [Absinthe.Middleware.Dataloader | Absinthe.Plugin.defaults()]
  end
end
```

| Without DataLoader | With DataLoader |
|-------------------|-----------------|
| 1 query for 50 assets | 1 query for 50 assets |
| 50 queries for ratings | 1 batch query for 50 ratings |
| 50 queries for compliance | 1 batch query for 50 compliance records |
| **101 total queries** | **3 total queries** |

## Subscriptions for Real-Time Data

GraphQL subscriptions provide a declarative mechanism for real-time data delivery, where the server pushes updates to connected clients whenever specified events occur. In Elixir, Absinthe integrates subscriptions with [Phoenix Channels](/glossary/channel/) and [PubSub](/glossary/pubsub/):

```elixir
# Subscription definition
subscription do
  field :security_alert, :security_alert do
    arg :severity, :severity

    config fn args, _resolution ->
      topic = case args[:severity] do
        nil -> "security:alerts:*"
        severity -> "security:alerts:#{severity}"
      end
      {:ok, topic: topic}
    end

    trigger :create_alert, topic: fn alert ->
      ["security:alerts:*", "security:alerts:#{alert.severity}"]
    end
  end
end
```

Subscriptions use [WebSocket](/glossary/websocket/) connections (through Phoenix Channels) for persistent bidirectional communication, enabling real-time dashboards that update automatically when security events occur, asset discoveries complete, or compliance scores change.

## GraphQL vs REST Comparison

| Aspect | GraphQL | REST |
|--------|---------|------|
| **Endpoints** | Single (`/graphql`) | Multiple (`/api/resources/:id`) |
| **Data Fetching** | Client specifies fields | Server defines response shape |
| **Over-fetching** | Eliminated | Common (fixed responses) |
| **Under-fetching** | Eliminated (nested queries) | Common (multiple requests) |
| **Versioning** | Schema evolution (deprecation) | URL versioning (`/v1/`, `/v2/`) |
| **Caching** | Complex (POST requests, query-level) | Simple (HTTP caching, ETags) |
| **Error Handling** | Partial responses with errors | HTTP status codes |
| **Real-Time** | Built-in subscriptions | Requires separate WebSocket setup |
| **Tooling** | Schema-driven (introspection) | Spec-driven ([OpenAPI](/glossary/openapi/)) |
| **Learning Curve** | Higher (query language, schema) | Lower (HTTP conventions) |
| **File Uploads** | Not natively supported | Standard multipart/form-data |

## Absinthe - Elixir GraphQL

Absinthe is the premier GraphQL toolkit for Elixir, providing a complete implementation of the GraphQL specification with deep [Phoenix](/glossary/phoenix/) integration:

| Feature | Description |
|---------|-------------|
| **Schema DSL** | Elixir-native schema definition macros |
| **Middleware** | Composable request processing pipeline |
| **DataLoader** | Batch loading to prevent N+1 queries |
| **Subscriptions** | Real-time via Phoenix Channels |
| **Relay Support** | Connection-based pagination (cursor) |
| **Introspection** | Full schema introspection for tooling |
| **Complexity Analysis** | Query cost estimation to prevent abuse |

Absinthe's middleware system enables cross-cutting concerns like authentication, authorization, error formatting, and telemetry to be applied consistently across all resolvers without repetitive code.

## Context in Prismatic

The Prismatic Platform primarily uses REST via [OpenAPI](/glossary/openapi/) for its API layer (`prismatic_api` on port 4004), but GraphQL through Absinthe is positioned for client-facing query interfaces where flexible data retrieval is essential.

**Current Architecture**: The auto-introspecting REST API provides broad coverage of all `Prismatic*` facade modules through automatic endpoint discovery. This approach is optimal for server-to-server communication and simple CRUD operations where response shapes are predictable.

**GraphQL Use Cases**: GraphQL becomes advantageous for dashboard interfaces that need to compose data from multiple domains (security ratings + compliance scores + asset metadata) in a single request, reducing round-trips and enabling the frontend to request exactly the data needed for each view.

**Subscription Alignment**: GraphQL's subscription model integrates naturally with the platform's existing [PubSub](/glossary/pubsub/) and [Channel](/glossary/channel/) infrastructure. Security alerts, asset discovery progress, and quality metric updates can be delivered through GraphQL subscriptions using the same Phoenix PubSub backbone that powers [LiveView](/glossary/liveview/) real-time updates.

**Complementary Approach**: Rather than replacing REST, GraphQL complements it---REST handles server-to-server integration and simple queries, while GraphQL serves complex client-facing data needs where the flexibility of client-specified queries reduces frontend complexity.

## Advanced GraphQL Implementation Patterns

### Schema Design Best Practices

Effective GraphQL schema design requires careful consideration of type relationships, field naming, and evolution strategy:

```elixir
defmodule PrismaticApi.Schema.Types.EASM do
  @moduledoc """
  GraphQL types for External Attack Surface Management (EASM) domain.

  Demonstrates advanced schema design patterns:
  - Interface types for polymorphic assets
  - Union types for search results
  - Connection patterns for pagination
  - Custom scalars for domain-specific data
  """

  use Absinthe.Schema.Notation
  import Absinthe.Resolution.Helpers

  # Custom scalar for security grades
  scalar :security_grade do
    description "Security rating grade (A, B, C, D, E, F)"
    serialize fn grade -> Atom.to_string(grade) end
    parse fn
      %{value: value} when value in ["A", "B", "C", "D", "E", "F"] ->
        {:ok, String.to_atom(value)}
      _ ->
        :error
    end
  end

  # Custom scalar for datetime with timezone
  scalar :datetime_tz do
    description "DateTime with timezone information"
    serialize &DateTime.to_iso8601/1
    parse fn
      %{value: value} ->
        case DateTime.from_iso8601(value) do
          {:ok, datetime, _} -> {:ok, datetime}
          _ -> :error
        end
    end
  end

  # Interface for polymorphic asset types
  interface :asset do
    description "Base interface for all discoverable assets"

    field :id, non_null(:id)
    field :domain, non_null(:string)
    field :first_discovered, non_null(:datetime_tz)
    field :last_seen, non_null(:datetime_tz)
    field :confidence, non_null(:float)
    field :risk_score, :float

    resolve_type fn
      %{type: :domain}, _ -> :domain_asset
      %{type: :ip_address}, _ -> :ip_asset
      %{type: :certificate}, _ -> :certificate_asset
      %{type: :service}, _ -> :service_asset
      _, _ -> nil
    end
  end

  # Concrete asset types implementing the interface
  object :domain_asset do
    description "A domain name asset"
    interface :asset

    field :id, non_null(:id)
    field :domain, non_null(:string)
    field :first_discovered, non_null(:datetime_tz)
    field :last_seen, non_null(:datetime_tz)
    field :confidence, non_null(:float)
    field :risk_score, :float

    # Domain-specific fields
    field :tld, non_null(:string)
    field :subdomain_count, :integer
    field :whois_data, :whois_info

    # Relationships
    field :ip_addresses, list_of(:ip_asset) do
      resolve dataloader(:easm, :ip_addresses)
    end

    field :certificates, list_of(:certificate_asset) do
      resolve dataloader(:easm, :certificates)
    end

    field :security_rating, :security_rating do
      resolve &PrismaticApi.Resolvers.EASM.get_security_rating/3
    end
  end

  object :ip_asset do
    description "An IP address asset"
    interface :asset

    field :id, non_null(:id)
    field :domain, non_null(:string)
    field :first_discovered, non_null(:datetime_tz)
    field :last_seen, non_null(:datetime_tz)
    field :confidence, non_null(:float)
    field :risk_score, :float

    # IP-specific fields
    field :ip_address, non_null(:string)
    field :asn, :integer
    field :country, :string
    field :organization, :string

    # Relationships
    field :services, list_of(:service_asset) do
      resolve dataloader(:easm, :services)
    end

    field :geolocation, :geolocation do
      resolve &PrismaticApi.Resolvers.EASM.get_geolocation/3
    end
  end

  # Union type for search results
  union :search_result do
    description "Union of all searchable asset types"
    types [:domain_asset, :ip_asset, :certificate_asset, :service_asset]

    resolve_type &__MODULE__.resolve_search_result_type/2
  end

  # Connection types for pagination
  connection :asset_connection, node_type: :asset do
    field :total_count, :integer do
      resolve fn
        _, %{source: %{total_count: count}} -> {:ok, count}
        _, _ -> {:ok, nil}
      end
    end

    edge do
      field :cursor, non_null(:string)
      field :node, non_null(:asset)
    end
  end

  # Input types for complex filters
  input_object :asset_search_filter do
    description "Filter criteria for asset search"

    field :query, :string, description: "Text search query"
    field :asset_types, list_of(:asset_type_enum), description: "Filter by asset types"
    field :risk_score_range, :risk_score_range, description: "Risk score range filter"
    field :discovery_date_range, :date_range, description: "Discovery date range"
    field :country_codes, list_of(:string), description: "Country code filter"
    field :organizations, list_of(:string), description: "Organization filter"
  end

  input_object :risk_score_range do
    field :min, :float
    field :max, :float
  end

  input_object :date_range do
    field :from, :datetime_tz
    field :to, :datetime_tz
  end

  # Enums for type-safe options
  enum :asset_type_enum do
    description "Types of discoverable assets"
    value :domain, description: "Domain name"
    value :ip_address, description: "IP address"
    value :certificate, description: "TLS/SSL certificate"
    value :service, description: "Network service"
  end

  enum :sort_order do
    value :asc, description: "Ascending order"
    value :desc, description: "Descending order"
  end

  enum :asset_sort_field do
    value :discovered_at, description: "Sort by discovery date"
    value :last_seen, description: "Sort by last seen date"
    value :risk_score, description: "Sort by risk score"
    value :confidence, description: "Sort by confidence score"
  end

  def resolve_search_result_type(%{type: :domain}, _), do: :domain_asset
  def resolve_search_result_type(%{type: :ip_address}, _), do: :ip_asset
  def resolve_search_result_type(%{type: :certificate}, _), do: :certificate_asset
  def resolve_search_result_type(%{type: :service}, _), do: :service_asset
  def resolve_search_result_type(_, _), do: nil
end
```

### Advanced Resolver Patterns

Sophisticated resolver implementations handling complex business logic and performance optimization:

```elixir
defmodule PrismaticApi.Resolvers.EASM do
  @moduledoc """
  Advanced GraphQL resolvers for EASM domain with comprehensive error handling,
  performance optimization, and authorization.
  """

  alias PrismaticPerimeter.{Assets, Ratings, Compliance, Discovery}
  alias PrismaticApi.Middleware.{Authorization, RateLimit}

  # Resolver with field-level authorization
  def get_asset(_, %{id: id}, %{context: %{current_user: user}}) do
    with :ok <- Authorization.check_asset_access(user, id),
         {:ok, asset} <- Assets.get(id),
         {:ok, enriched} <- enrich_asset_data(asset, user) do
      {:ok, enriched}
    else
      {:error, :unauthorized} -> {:error, "Access denied"}
      {:error, :not_found} -> {:error, "Asset not found"}
      {:error, reason} -> {:error, "Failed to load asset: #{inspect(reason)}"}
    end
  end

  # Complex search resolver with multiple data sources
  def search_assets(_, args, %{context: context}) do
    with :ok <- RateLimit.check_limit(context.current_user, :asset_search),
         {:ok, filter} <- build_search_filter(args),
         {:ok, results} <- execute_federated_search(filter, args),
         {:ok, connection} <- paginate_results(results, args) do
      {:ok, connection}
    else
      {:error, :rate_limit_exceeded} ->
        {:error, "Search rate limit exceeded"}
      {:error, :invalid_filter} ->
        {:error, "Invalid search filter parameters"}
      error ->
        {:error, "Search failed: #{inspect(error)}"}
    end
  end

  # Subscription resolver for real-time updates
  def asset_discovery_updates(_, %{domain: domain}, %{context: context}) do
    with :ok <- Authorization.check_domain_access(context.current_user, domain),
         :ok <- Discovery.start_monitoring(domain) do
      {:ok, topic: "asset_discovery:#{domain}"}
    else
      {:error, :unauthorized} -> {:error, "Access denied"}
      error -> {:error, "Failed to start monitoring: #{inspect(error)}"}
    end
  end

  # Batch resolver using DataLoader for N+1 prevention
  def get_security_ratings(assets, _, %{context: %{loader: loader}}) do
    asset_ids = Enum.map(assets, & &1.id)

    loader
    |> Dataloader.load_many(:ratings, :by_asset_id, asset_ids)
    |> then(fn loaded_loader ->
      Enum.map(assets, fn asset ->
        case Dataloader.get(loaded_loader, :ratings, :by_asset_id, asset.id) do
          nil -> {:ok, nil}
          rating -> {:ok, rating}
        end
      end)
    end)
  end

  # Complex aggregation resolver
  def get_security_dashboard(_, %{domain: domain, timeframe: timeframe}, context) do
    with :ok <- Authorization.check_dashboard_access(context.current_user, domain),
         {:ok, metrics} <- gather_dashboard_metrics(domain, timeframe),
         {:ok, trends} <- calculate_security_trends(domain, timeframe),
         {:ok, alerts} <- get_recent_alerts(domain, timeframe) do

      dashboard = %{
        domain: domain,
        timeframe: timeframe,
        generated_at: DateTime.utc_now(),
        metrics: metrics,
        trends: trends,
        alerts: alerts,
        recommendations: generate_recommendations(metrics, trends, alerts)
      }

      {:ok, dashboard}
    else
      error -> {:error, "Dashboard generation failed: #{inspect(error)}"}
    end
  end

  # Helper functions
  defp enrich_asset_data(asset, user) do
    # Add computed fields and user-specific data
    enriched = %{asset |
      user_bookmarked: user_has_bookmarked?(user, asset.id),
      computed_risk_level: compute_risk_level(asset.risk_score),
      related_assets_count: count_related_assets(asset.id)
    }

    {:ok, enriched}
  end

  defp execute_federated_search(filter, args) do
    # Execute search across multiple data sources in parallel
    search_tasks = [
      Task.async(fn -> Assets.search_by_domain(filter.domain_query, args) end),
      Task.async(fn -> Assets.search_by_ip(filter.ip_query, args) end),
      Task.async(fn -> Assets.search_by_certificate(filter.cert_query, args) end)
    ]

    search_results = Task.await_many(search_tasks, 30_000)

    # Merge and deduplicate results
    all_results = search_results
    |> Enum.filter(&match?({:ok, _}, &1))
    |> Enum.flat_map(fn {:ok, results} -> results end)
    |> deduplicate_assets()
    |> sort_by_relevance(filter)

    {:ok, all_results}
  end

  defp gather_dashboard_metrics(domain, timeframe) do
    # Parallel data gathering for dashboard metrics
    metric_tasks = [
      Task.async(fn -> {"asset_count", Assets.count_for_domain(domain, timeframe)} end),
      Task.async(fn -> {"avg_risk_score", Ratings.average_risk_score(domain, timeframe)} end),
      Task.async(fn -> {"compliance_score", Compliance.overall_score(domain)} end),
      Task.async(fn -> {"vulnerability_count", Assets.vulnerability_count(domain, timeframe)} end)
    ]

    Task.await_many(metric_tasks, 15_000)
    |> Enum.into(%{}, fn {key, {:ok, value}} -> {key, value} end)
    |> then(&{:ok, &1})
  end
end
```

### Subscription Implementation

Real-time GraphQL subscriptions integrated with Phoenix PubSub:

```elixir
defmodule PrismaticApi.Schema.Subscriptions do
  @moduledoc """
  GraphQL subscription definitions for real-time data streaming.
  """

  use Absinthe.Schema.Notation
  alias PrismaticApi.Resolvers.Subscriptions

  object :subscription do
    # Real-time security alerts
    field :security_alerts, :security_alert do
      arg :severity_filter, list_of(:severity_level)
      arg :domain_filter, :string

      config fn args, %{context: context} ->
        with :ok <- authorize_alerts_subscription(context.current_user, args) do
          topic = build_alerts_topic(args)
          {:ok, topic: topic}
        else
          error -> error
        end
      end

      trigger [:create_security_alert, :update_security_alert], topic: fn
        %{domain: domain, severity: severity} ->
          [
            "security_alerts:all",
            "security_alerts:domain:#{domain}",
            "security_alerts:severity:#{severity}",
            "security_alerts:domain:#{domain}:severity:#{severity}"
          ]
      end

      resolve &Subscriptions.handle_security_alert/3
    end

    # Asset discovery progress
    field :asset_discovery_progress, :discovery_progress do
      arg :domain, non_null(:string)

      config fn %{domain: domain}, %{context: context} ->
        with :ok <- authorize_discovery_subscription(context.current_user, domain) do
          {:ok, topic: "discovery_progress:#{domain}"}
        end
      end

      trigger :update_discovery_progress, topic: fn progress ->
        ["discovery_progress:#{progress.domain}"]
      end

      resolve &Subscriptions.handle_discovery_progress/3
    end

    # Live security metrics
    field :security_metrics_stream, :security_metrics do
      arg :domain, non_null(:string)
      arg :metric_types, list_of(:metric_type)
      arg :update_interval, :integer, default_value: 30

      config fn args, %{context: context} ->
        with :ok <- authorize_metrics_subscription(context.current_user, args.domain) do
          topic = "security_metrics:#{args.domain}"
          # Start periodic metric updates
          start_metrics_stream(args.domain, args.update_interval)
          {:ok, topic: topic}
        end
      end

      trigger :update_security_metrics, topic: fn metrics ->
        ["security_metrics:#{metrics.domain}"]
      end

      resolve &Subscriptions.handle_metrics_update/3
    end

    # Compliance status changes
    field :compliance_status_updates, :compliance_update do
      arg :framework, :compliance_framework
      arg :organization_filter, :string

      config fn args, %{context: context} ->
        with :ok <- authorize_compliance_subscription(context.current_user, args) do
          topics = build_compliance_topics(args)
          {:ok, topic: topics}
        end
      end

      trigger [:compliance_assessment_complete, :compliance_violation_detected], topic: fn update ->
        [
          "compliance:all",
          "compliance:framework:#{update.framework}",
          "compliance:organization:#{update.organization}"
        ]
      end
    end
  end

  # Helper types for subscriptions
  object :discovery_progress do
    field :domain, non_null(:string)
    field :stage, non_null(:discovery_stage)
    field :progress_percentage, non_null(:integer)
    field :assets_discovered, non_null(:integer)
    field :estimated_completion, :datetime_tz
    field :current_operation, :string
    field :errors, list_of(:discovery_error)
  end

  object :security_metrics do
    field :domain, non_null(:string)
    field :timestamp, non_null(:datetime_tz)
    field :overall_score, non_null(:float)
    field :risk_distribution, non_null(:risk_distribution)
    field :trend_direction, non_null(:trend_direction)
    field :metric_deltas, list_of(:metric_delta)
  end

  object :compliance_update do
    field :organization, non_null(:string)
    field :framework, non_null(:compliance_framework)
    field :update_type, non_null(:compliance_update_type)
    field :affected_requirements, list_of(:string)
    field :new_score, :float
    field :previous_score, :float
    field :timestamp, non_null(:datetime_tz)
  end

  enum :discovery_stage do
    value :initializing
    value :dns_resolution
    value :certificate_discovery
    value :service_enumeration
    value :vulnerability_scanning
    value :analysis
    value :complete
    value :failed
  end

  enum :trend_direction do
    value :improving
    value :stable
    value :degrading
    value :unknown
  end

  enum :compliance_update_type do
    value :score_changed
    value :violation_detected
    value :violation_resolved
    value :requirement_added
    value :assessment_complete
  end

  # Subscription authorization helpers
  defp authorize_alerts_subscription(user, args) do
    # Check if user has permission to subscribe to alerts for specified domains/severity
    case args do
      %{domain_filter: domain} ->
        Authorization.check_domain_access(user, domain)
      _ ->
        Authorization.check_global_alerts_access(user)
    end
  end

  defp start_metrics_stream(domain, interval_seconds) do
    # Start a background process to periodically publish metrics updates
    PrismaticApi.MetricsStreamer.start_stream(domain, interval_seconds * 1000)
  end

  defp build_alerts_topic(args) do
    base_topics = ["security_alerts:all"]

    topics = case args do
      %{domain_filter: domain, severity_filter: severities} ->
        domain_topics = ["security_alerts:domain:#{domain}"]
        severity_topics = Enum.map(severities, &"security_alerts:severity:#{&1}")
        combined_topics = for domain_topic <- domain_topics,
                             severity_topic <- severity_topics do
          "#{domain_topic}:#{String.replace(severity_topic, "security_alerts:severity:", "severity:")}"
        end
        base_topics ++ domain_topics ++ severity_topics ++ combined_topics

      %{domain_filter: domain} ->
        base_topics ++ ["security_alerts:domain:#{domain}"]

      %{severity_filter: severities} ->
        severity_topics = Enum.map(severities, &"security_alerts:severity:#{&1}")
        base_topics ++ severity_topics

      _ ->
        base_topics
    end

    topics
  end
end
```

### Query Complexity and Security

Advanced security measures for GraphQL APIs including query complexity analysis and rate limiting:

```elixir
defmodule PrismaticApi.Security do
  @moduledoc """
  Security middleware and utilities for GraphQL API protection.
  """

  defmodule ComplexityAnalyzer do
    @moduledoc """
    Query complexity analysis to prevent resource exhaustion attacks.
    """

    @max_query_complexity 1000
    @max_query_depth 15

    def analyze_complexity(query_doc) do
      complexity = calculate_complexity(query_doc)
      depth = calculate_depth(query_doc)

      cond do
        complexity > @max_query_complexity ->
          {:error, "Query complexity #{complexity} exceeds maximum #{@max_query_complexity}"}
        depth > @max_query_depth ->
          {:error, "Query depth #{depth} exceeds maximum #{@max_query_depth}"}
        true ->
          {:ok, %{complexity: complexity, depth: depth}}
      end
    end

    defp calculate_complexity(%Absinthe.Language.Document{definitions: definitions}) do
      Enum.reduce(definitions, 0, &calculate_operation_complexity/2)
    end

    defp calculate_operation_complexity(%Absinthe.Language.OperationDefinition{} = op, acc) do
      selection_complexity = calculate_selection_set_complexity(op.selection_set)
      acc + selection_complexity
    end
    defp calculate_operation_complexity(_, acc), do: acc

    defp calculate_selection_set_complexity(%Absinthe.Language.SelectionSet{selections: selections}) do
      Enum.reduce(selections, 0, fn
        %Absinthe.Language.Field{selection_set: nil}, acc ->
          acc + 1

        %Absinthe.Language.Field{selection_set: selection_set, arguments: arguments}, acc ->
          field_complexity = 1
          args_multiplier = calculate_arguments_multiplier(arguments)
          nested_complexity = calculate_selection_set_complexity(selection_set)

          acc + (field_complexity + nested_complexity) * args_multiplier

        %Absinthe.Language.InlineFragment{selection_set: selection_set}, acc ->
          acc + calculate_selection_set_complexity(selection_set)

        _, acc -> acc
      end)
    end

    defp calculate_arguments_multiplier(arguments) do
      # Arguments like "first: 100" multiply the complexity
      Enum.reduce(arguments, 1, fn
        %Absinthe.Language.Argument{name: "first", value: %{value: n}}, acc when is_integer(n) ->
          acc * min(n, 100) # Cap the multiplier

        %Absinthe.Language.Argument{name: "last", value: %{value: n}}, acc when is_integer(n) ->
          acc * min(n, 100)

        _, acc -> acc
      end)
    end

    defp calculate_depth(%Absinthe.Language.Document{definitions: definitions}) do
      definitions
      |> Enum.map(&calculate_operation_depth/1)
      |> Enum.max()
    end

    defp calculate_operation_depth(%Absinthe.Language.OperationDefinition{selection_set: selection_set}) do
      calculate_selection_set_depth(selection_set)
    end
    defp calculate_operation_depth(_), do: 0

    defp calculate_selection_set_depth(%Absinthe.Language.SelectionSet{selections: selections}) do
      depths = Enum.map(selections, fn
        %Absinthe.Language.Field{selection_set: nil} -> 1
        %Absinthe.Language.Field{selection_set: selection_set} ->
          1 + calculate_selection_set_depth(selection_set)
        %Absinthe.Language.InlineFragment{selection_set: selection_set} ->
          calculate_selection_set_depth(selection_set)
        _ -> 0
      end)

      case depths do
        [] -> 0
        _ -> Enum.max(depths)
      end
    end
  end

  defmodule RateLimiter do
    @moduledoc """
    Rate limiting for GraphQL operations based on user and operation type.
    """

    use GenServer

    @ets_table :graphql_rate_limits

    def start_link(_opts) do
      GenServer.start_link(__MODULE__, [], name: __MODULE__)
    end

    def init(_) do
      :ets.new(@ets_table, [:set, :public, :named_table])
      {:ok, %{}}
    end

    @spec check_rate_limit(String.t(), atom(), integer()) :: :ok | {:error, :rate_limit_exceeded}
    def check_rate_limit(user_id, operation_type, limit_per_minute \\ 60) do
      current_time = System.system_time(:second)
      window_start = current_time - 60 # 1-minute window
      key = {user_id, operation_type}

      case :ets.lookup(@ets_table, key) do
        [] ->
          :ets.insert(@ets_table, {key, [current_time]})
          :ok

        [{^key, timestamps}] ->
          # Remove timestamps older than the window
          recent_timestamps = Enum.filter(timestamps, &(&1 >= window_start))

          if length(recent_timestamps) >= limit_per_minute do
            {:error, :rate_limit_exceeded}
          else
            updated_timestamps = [current_time | recent_timestamps]
            :ets.insert(@ets_table, {key, updated_timestamps})
            :ok
          end
      end
    end

    def get_rate_limit_status(user_id, operation_type) do
      current_time = System.system_time(:second)
      window_start = current_time - 60
      key = {user_id, operation_type}

      case :ets.lookup(@ets_table, key) do
        [] -> %{requests_in_window: 0, window_reset: current_time + 60}
        [{^key, timestamps}] ->
          recent_count = timestamps |> Enum.count(&(&1 >= window_start))
          %{requests_in_window: recent_count, window_reset: current_time + 60}
      end
    end
  end

  defmodule AuthorizationMiddleware do
    @moduledoc """
    Field-level authorization middleware for GraphQL resolvers.
    """

    @behaviour Absinthe.Middleware

    def call(%{context: %{current_user: %{role: :admin}}} = resolution, _config) do
      # Admins have access to everything
      resolution
    end

    def call(%{context: %{current_user: user}} = resolution, config) do
      case check_field_authorization(user, resolution.definition.schema_node, config) do
        :ok -> resolution
        {:error, reason} -> Absinthe.Resolution.put_result(resolution, {:error, reason})
      end
    end

    def call(resolution, _config) do
      # No authenticated user
      Absinthe.Resolution.put_result(resolution, {:error, "Authentication required"})
    end

    defp check_field_authorization(user, field, config) do
      required_permissions = Keyword.get(config, :permissions, [])
      required_clearance = Keyword.get(config, :clearance_level)

      cond do
        required_clearance && user.clearance_level < required_clearance ->
          {:error, "Insufficient clearance level"}

        not Enum.all?(required_permissions, &user_has_permission?(user, &1)) ->
          {:error, "Insufficient permissions"}

        true -> :ok
      end
    end

    defp user_has_permission?(user, permission) do
      permission in user.permissions
    end
  end
end
```

## Related Terms

- [REST API](/glossary/rest-api/) - Alternative API architectural style with fixed endpoint responses
- [OpenAPI](/glossary/openapi/) - REST API specification standard, complementary to GraphQL's introspection
- [Phoenix](/glossary/phoenix/) - Framework providing GraphQL hosting via Absinthe library
- [PubSub](/glossary/pubsub/) - Messaging backbone powering GraphQL subscriptions
- [Channel](/glossary/channel/) - WebSocket transport layer for GraphQL subscription delivery
- [WebSocket](/glossary/websocket/) - Protocol enabling persistent connections for subscriptions
- [API Gateway](/glossary/api-gateway/) - Entry point routing requests to GraphQL and REST endpoints
- [Ecto](/glossary/ecto/) - Database layer accessed by GraphQL resolvers through DataLoader
- [LiveView](/glossary/liveview/) - Server-rendered alternative for real-time UI that shares PubSub infrastructure
- [Connection Pooling](/glossary/connection-pooling/) - Database pool management for resolver data fetching
- [Phoenix](/glossary/phoenix/) - Elixir web framework with built-in GraphQL support via Absinthe
- [Ecto](/glossary/ecto/) - Database wrapper providing query composition for GraphQL resolvers
- [Schema](/glossary/schema/) - Best practices for GraphQL schema architecture and design

## Related Terms

- [REST API](/glossary/rest-api/) - Alternative API architectural style with fixed endpoint responses
- [OpenAPI](/glossary/openapi/) - REST API specification standard, complementary to GraphQL's introspection
- [Phoenix](/glossary/phoenix/) - Framework providing GraphQL hosting via Absinthe library
- [PubSub](/glossary/pubsub/) - Messaging backbone powering GraphQL subscriptions
- [Channel](/glossary/channel/) - WebSocket transport layer for GraphQL subscription delivery
- [WebSocket](/glossary/websocket/) - Protocol enabling persistent connections for subscriptions
- [API Gateway](/glossary/api-gateway/) - Entry point routing requests to GraphQL and REST endpoints
- [Ecto](/glossary/ecto/) - Database layer accessed by GraphQL resolvers through DataLoader
- [LiveView](/glossary/liveview/) - Server-rendered alternative for real-time UI that shares PubSub infrastructure
- [Connection Pooling](/glossary/connection-pooling/) - Database pool management for resolver data fetching

## See Also

- [Architecture](/architecture/) - Platform API architecture and data access patterns
- [Technologies](/technologies/) - Technology stack including API layer
- [Apps](/apps/) - Applications exposing GraphQL interfaces

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)