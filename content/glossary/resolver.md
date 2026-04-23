+++
title = "Resolver"
weight = 50

[extra]
description = "A function that determines how to fetch or compute data for a specific field in a GraphQL schema or API endpoint, bridging the gap between client requests and data sources."
category = "api"
domain = "api-architecture"
complexity = "intermediate-advanced"
stability = "stable"
beam_related = true
related_terms = ["query", "schema", "scope", "storage-adapter", "server", "api-gateway", "genserver", "ets", "pubsub", "process", "backpressure", "latency"]
tags = ["resolver", "graphql", "api", "data-fetching", "absinthe", "elixir", "dataloader", "n-plus-one", "batch-resolution", "middleware", "authorization", "dispatch", "osint"]
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "18 min"
difficulty = "intermediate"
quality_score = 95
platforms = ["Prismatic Platform", "BEAM/OTP"]
key_takeaway = "Resolvers map API field requests to data source operations, with Prismatic Platform's auto-introspecting API using module introspection as an implicit resolver mechanism."
date_created = "2026-02-24"
date_modified = "2026-04-02"
keywords = ["Resolver", "GraphQL", "API", "data fetching", "Absinthe", "Dataloader", "N+1", "batch resolution", "middleware", "glossary", "Prismatic Platform"]
image = "/images/sections/glossary.png"
image_alt = "Resolver - Prismatic Platform"
word_count = 3200
see_also = ["capabilities", "architecture", "api-gateway", "performance-testing"]
+++

## Definition

A **resolver** is a function responsible for returning the data for a specific field in an API response. In GraphQL, every field in the schema has a corresponding resolver function that knows how to fetch or compute the field's value. Resolvers form the execution layer between the schema definition (what data is available) and the data sources (where the data lives). They are the fundamental unit of work in any API system -- the point where an abstract request becomes a concrete data retrieval operation.

The resolver pattern extends beyond GraphQL. In any API system, something must translate a client's request into actual data retrieval operations. REST controllers, GenServer handlers, and the Prismatic API's dispatch controller all serve as resolvers in this broader sense -- they receive a request specification and return the corresponding data. The key distinction is that GraphQL resolvers are fine-grained (one per field), while REST resolvers are coarse-grained (one per endpoint).

In the Prismatic Platform, the resolver concept manifests in three distinct layers: the auto-introspecting API dispatch system (which discovers resolvers at boot time), the OSINT tool execution layer (where each tool's `search/2` or `run/2` function acts as a resolver), and the LiveView data layer (where mount and handle_params callbacks resolve page-level data).

## Core Concepts

### Resolver Anatomy

Every resolver, regardless of framework, shares four fundamental components:

| Component | Purpose | GraphQL (Absinthe) | REST (Phoenix) | Prismatic Auto-API |
|-----------|---------|--------------------|-----------------|--------------------|
| **Input** | Request parameters | Field arguments + context | Conn params | `{app, action, params}` tuple |
| **Authorization** | Access control | Resolution context (current_user) | Plug pipeline | ETS-cached endpoint ACL |
| **Data Fetching** | Retrieve/compute | Resolver function body | Controller action | `apply(module, function, args)` |
| **Output** | Formatted response | `{:ok, value}` / `{:error, msg}` | `json(conn, data)` | Serialized JSON envelope |

### Resolution Strategies

Resolvers employ different strategies depending on the data source and access pattern:

| Strategy | When to Use | Latency Profile | Complexity |
|----------|-------------|-----------------|------------|
| **Direct** | Single record lookup | O(1) - index hit | Low |
| **Batched** | Related records (N+1 prevention) | O(1) amortized | Medium |
| **Deferred** | Expensive computation | Async, non-blocking | Medium |
| **Cached** | Frequently accessed, rarely changing | Sub-ms (ETS/Cachex) | Low |
| **Streamed** | Large result sets | Progressive delivery | High |
| **Computed** | Derived/aggregated data | Depends on source | Variable |

### GraphQL vs REST Resolution

| Aspect | GraphQL Resolver | REST Controller |
|--------|-----------------|-----------------|
| Granularity | Per-field | Per-endpoint |
| N+1 Risk | High (nested fields) | Low (single response) |
| Over-fetching | None (client specifies fields) | Common (fixed response shape) |
| Under-fetching | None | Common (multiple requests needed) |
| Batching | Dataloader / middleware | Manual (preload) |
| Caching | Per-field, complex | Per-endpoint, simple |
| Error handling | Per-field errors in response | HTTP status codes |

## Technical Deep Dive

### Absinthe Resolver Patterns

In Absinthe (Elixir's GraphQL library), resolvers are defined as functions that receive three arguments: the parent object, the field arguments, and the resolution context (which includes the current user, request metadata, and data loaders). Resolvers return `{:ok, value}` or `{:error, message}` tuples following Elixir conventions.

```elixir
# Basic Absinthe resolver pattern
object :user do
  field :name, :string
  field :email, :string

  field :investigations, list_of(:investigation) do
    resolve fn user, _args, %{context: %{loader: loader}} ->
      loader
      |> Dataloader.load(:db, :investigations, user)
      |> on_load(fn loader ->
        {:ok, Dataloader.get(loader, :db, :investigations, user)}
      end)
    end
  end
end
```

### The N+1 Problem Deep Dive

The N+1 problem is the primary performance challenge with resolvers. When a list query resolves N items, and each item has a field that requires a separate database query, the total becomes 1 + N queries.

**Concrete example in Prismatic context:**

```
Query: { ddCases { entities { name riskScore } } }

Without batching:
  1. SELECT * FROM dd_cases LIMIT 50           -- 1 query
  2. SELECT * FROM entities WHERE case_id = 1   -- +1
  3. SELECT * FROM entities WHERE case_id = 2   -- +1
  ... (48 more)
  Total: 51 queries, ~500ms

With Dataloader batching:
  1. SELECT * FROM dd_cases LIMIT 50           -- 1 query
  2. SELECT * FROM entities WHERE case_id IN (1,2,...,50)  -- 1 query
  Total: 2 queries, ~15ms
```

**Dataloader** (a batching library) solves this by collecting field resolution requests during the first pass, then executing them in batches during the second pass. It operates on a two-phase cycle:

1. **Collection phase**: Each resolver registers what it needs (source, key, parent)
2. **Execution phase**: Dataloader groups requests by source, executes batch queries, and distributes results

### Resolver Middleware

Absinthe supports middleware -- functions that wrap resolver execution to provide cross-cutting concerns:

| Middleware | Purpose | Example |
|-----------|---------|---------|
| **Authentication** | Verify identity | Check JWT token validity |
| **Authorization** | Verify permissions | Role-based field access |
| **Logging** | Audit trail | Track resolver execution time |
| **Rate Limiting** | Prevent abuse | Per-user query complexity budget |
| **Error Handling** | Normalize errors | Convert exceptions to GraphQL errors |
| **Caching** | Performance | Cache resolved values in ETS |
| **Telemetry** | Observability | Emit `:telemetry` events per resolver |

### Authorization in Resolvers

Authorization can be applied at three levels, each with different trade-offs:

1. **Schema-level**: Middleware that checks permissions before any resolver runs. Coarse but fast.
2. **Resolver-level**: Authorization logic inside individual resolvers. Fine-grained but repetitive.
3. **Data-level**: The data source itself enforces access (e.g., Ecto query scopes). Most secure but hardest to debug.

### Auto-Introspecting API Dispatch

Prismatic API's auto-introspecting system takes a fundamentally different approach to resolution. Instead of explicit resolver definitions, it discovers public functions on Prismatic facade modules at boot time and generates resolver-like dispatch logic automatically. The `DispatchController` acts as a universal resolver that maps `{app, action}` tuples to `module.function(args)` calls.

The discovery process:
1. At application startup, scan all modules matching `Prismatic*` namespace
2. Extract public functions with `@doc` and `@spec` annotations
3. Build an ETS-backed endpoint registry mapping `{app_name, action_name}` to `{module, function, param_specs}`
4. On each request, look up the registry, validate params against specs, and `apply/3`

### Error Handling Patterns

Resolver error handling must balance informativeness with security:

| Error Type | Internal Representation | Client Response | Log Level |
|-----------|------------------------|-----------------|-----------|
| Validation error | `{:error, changeset}` | Field-level errors | `:debug` |
| Not found | `{:error, :not_found}` | `"Resource not found"` | `:info` |
| Unauthorized | `{:error, :unauthorized}` | `"Not authorized"` | `:warning` |
| Rate limited | `{:error, :rate_limited}` | `"Too many requests"` | `:warning` |
| Internal error | `{:error, exception}` | `"Internal server error"` | `:error` |
| Timeout | `{:error, :timeout}` | `"Request timed out"` | `:error` |

## Advanced Topics

### OSINT Tool Execution as Resolvers

Each OSINT tool in Prismatic Platform implements a resolver-like contract. The `search/2` and `run/2` functions accept structured input and return structured output, making them composable resolution units:

```elixir
# OSINT tools follow the resolver contract:
# Input: {tool_slug, params} -> Output: {:ok, results} | {:error, reason}

# This maps directly to the dispatch pattern:
# /api/v1/osint/execute_tool {slug: "czech-ares", input: {query: "Navigara"}}
#   -> PrismaticOsintSources.CzechAres.search(%{query: "Navigara"})
#   -> {:ok, %{entities: [...], metadata: %{source: "ARES", timestamp: ...}}}
```

### Batch Resolution Strategies

Beyond Dataloader, several batch resolution patterns exist:

| Pattern | Mechanism | Best For |
|---------|-----------|----------|
| **Dataloader** | Two-phase collect-then-execute | Ecto associations |
| **Absinthe.Middleware.Batch** | Manual batch function | Non-Ecto sources |
| **Async middleware** | Task.async per field | Independent expensive computations |
| **ETS pre-loading** | Warm cache before resolution | Read-heavy, stable data |
| **Stream resolution** | Lazy enumeration | Large result sets |

### Query Complexity Analysis

Unbounded queries through resolvers can cause denial-of-service. Complexity analysis assigns a cost to each field and rejects queries exceeding a budget:

```elixir
# Field complexity scoring
field :entities, list_of(:entity) do
  complexity fn _args, child_complexity ->
    # Each entity adds child_complexity to total
    50 * child_complexity
  end
end

# Query-level budget
max_complexity: 5000  # Reject queries exceeding this score
```

### Resolver Performance Profiling

Key metrics for resolver health:

| Metric | Target | Alert Threshold | Measurement |
|--------|--------|-----------------|-------------|
| Resolution time (P50) | < 10ms | > 50ms | `:telemetry` span |
| Resolution time (P95) | < 50ms | > 200ms | `:telemetry` span |
| Batch efficiency | > 80% hit rate | < 50% | Dataloader stats |
| Error rate | < 0.1% | > 1% | Error count / total |
| N+1 detection | 0 occurrences | Any | Query count per request |

## Usage in Prismatic Platform

The API gateway's dispatch mechanism functions as an auto-generated resolver layer. When a request arrives at `/api/v1/:app/:action`, the controller looks up the registered module and function in the ETS-cached endpoint registry, validates parameters against the discovered typespec, and calls the function. The function return value is serialized to JSON and returned to the client.

For OSINT tool execution via the API, each tool's `search/2` or `run/2` function acts as a resolver that translates tool-specific parameters into external API calls and returns structured results. The 157 self-registering OSINT adapters are all exposed through this uniform resolution interface.

The DD (Due Diligence) pipeline uses resolver-like patterns for entity enrichment. When investigating an entity, multiple OSINT tools are invoked in parallel, each resolving a different facet of the entity's profile (business registry, court records, financial data). The results are merged into a unified entity view -- essentially a parallel fan-out resolution pattern.

LiveView mount callbacks serve as page-level resolvers, fetching all data needed for initial render. The `handle_params/3` callback acts as a re-resolver when URL parameters change, enabling URL-driven state that can be bookmarked and shared.

## Code Examples

```elixir
defmodule PrismaticApi.Resolver do
  @moduledoc """
  Generic resolver that dispatches API requests to discovered modules.
  Auto-discovered from Prismatic* facade modules at boot time.

  The resolver implements a three-phase pipeline:
  1. Lookup: Find the target module/function in the ETS registry
  2. Validate: Check parameters against discovered typespecs
  3. Execute: Apply the function and wrap the result

  ## Architecture

  This module is the core of Prismatic Platform's auto-introspecting
  API. Instead of manually defining routes and controllers for each
  endpoint, the system discovers available functions at startup and
  generates dispatch logic automatically.
  """

  alias PrismaticApi.EndpointRegistry

  require Logger

  @doc """
  Resolve an API request by dispatching to the registered module.

  ## Parameters

    - `app` - The application namespace (e.g., "osint", "dd")
    - `action` - The action to invoke (e.g., "search_tools", "list_cases")
    - `params` - Request parameters as a string-keyed map

  ## Examples

      iex> PrismaticApi.Resolver.resolve("osint", "list_tools", %{})
      {:ok, [%{slug: "czech-ares", name: "ARES Business Registry"}, ...]}

      iex> PrismaticApi.Resolver.resolve("dd", "get_case", %{"id" => "123"})
      {:ok, %{id: "123", status: :active, entities: [...]}}

  """
  @spec resolve(String.t(), String.t(), map()) :: {:ok, term()} | {:error, term()}
  def resolve(app, action, params) do
    start_time = System.monotonic_time(:microsecond)

    result =
      with {:ok, endpoint} <- EndpointRegistry.lookup(app, action),
           {:ok, args} <- validate_params(endpoint, params),
           {:ok, result} <- safe_apply(endpoint.module, endpoint.function, args) do
        {:ok, result}
      end

    duration = System.monotonic_time(:microsecond) - start_time

    :telemetry.execute(
      [:prismatic, :api, :resolve],
      %{duration: duration},
      %{app: app, action: action, status: elem(result, 0)}
    )

    result
  end

  @doc """
  Resolve multiple API requests in parallel with bounded concurrency.

  Useful for dashboard pages that need data from multiple sources.
  Uses Task.async_stream with a concurrency limit to prevent overload.
  """
  @spec resolve_batch([{String.t(), String.t(), map()}], keyword()) ::
          [{:ok, term()} | {:error, term()}]
  def resolve_batch(requests, opts \\ []) do
    max_concurrency = Keyword.get(opts, :max_concurrency, 10)
    timeout = Keyword.get(opts, :timeout, 15_000)

    requests
    |> Task.async_stream(
      fn {app, action, params} -> resolve(app, action, params) end,
      max_concurrency: max_concurrency,
      timeout: timeout,
      on_timeout: :kill_task
    )
    |> Enum.map(fn
      {:ok, result} -> result
      {:exit, :timeout} -> {:error, :timeout}
    end)
  end

  defp validate_params(%{param_specs: specs}, params) do
    validated =
      Enum.reduce_while(specs, {:ok, []}, fn {name, type}, {:ok, acc} ->
        case Map.fetch(params, to_string(name)) do
          {:ok, value} -> {:cont, {:ok, acc ++ [cast(value, type)]}}
          :error -> {:halt, {:error, {:missing_param, name}}}
        end
      end)

    validated
  end

  defp safe_apply(module, function, args) do
    try do
      result = apply(module, function, args)
      {:ok, result}
    rescue
      e in [ArgumentError, FunctionClauseError] ->
        Logger.warning("Resolver dispatch failed",
          module: module,
          function: function,
          error: Exception.message(e)
        )
        {:error, {:invalid_arguments, Exception.message(e)}}

      e in [RuntimeError] ->
        Logger.error("Resolver execution error",
          module: module,
          function: function,
          error: Exception.message(e)
        )
        {:error, {:execution_error, Exception.message(e)}}
    end
  end

  defp cast(value, :string), do: to_string(value)
  defp cast(value, :integer), do: String.to_integer(value)
  defp cast(value, :boolean) when value in ["true", "1"], do: true
  defp cast(value, :boolean), do: value == true
  defp cast(value, _), do: value
end
```

```elixir
defmodule PrismaticApi.ResolverMiddleware.Authorization do
  @moduledoc """
  Authorization middleware for API resolvers.

  Checks whether the current user has permission to invoke
  the requested endpoint before dispatching to the resolver.
  Uses the platform's role-based access control system.
  """

  @behaviour Absinthe.Middleware

  require Logger

  @doc """
  Execute authorization check before resolver runs.

  Returns `{:error, :unauthorized}` if the user lacks
  the required permission for the resolved field.
  """
  @spec call(Absinthe.Resolution.t(), keyword()) :: Absinthe.Resolution.t()
  def call(%{context: %{current_user: user}} = resolution, required_role: role) do
    if has_role?(user, role) do
      resolution
    else
      Logger.warning("Unauthorized resolver access",
        user_id: user.id,
        required_role: role,
        field: resolution.definition.name
      )

      Absinthe.Resolution.put_result(resolution, {:error, "Not authorized"})
    end
  end

  def call(resolution, _config) do
    Absinthe.Resolution.put_result(resolution, {:error, "Authentication required"})
  end

  defp has_role?(%{roles: roles}, required), do: required in roles
  defp has_role?(_, _), do: false
end
```

## Common Pitfalls

| Pitfall | Problem | Solution |
|---------|---------|----------|
| N+1 queries in nested fields | Each parent triggers a separate query for children | Use Dataloader or `Absinthe.Middleware.Batch` for all association fields |
| Fat resolvers with business logic | Resolvers become untestable, violate single responsibility | Keep resolvers thin; delegate to context modules |
| Missing error normalization | Raw exceptions leak to clients, exposing internals | Catch specific exceptions, return sanitized error tuples |
| Unbounded list resolution | `Repo.all` without limit returns millions of rows | Always apply `limit` and pagination in list resolvers |
| Blocking in async resolvers | Synchronous I/O in async resolution blocks the scheduler | Use Task.async or Dataloader for I/O-bound resolution |
| Cache invalidation gaps | Stale cached resolver results after mutations | Publish cache invalidation events via PubSub on writes |
| Missing telemetry | Cannot identify slow resolvers in production | Emit `:telemetry` events with field name and duration |
| Over-permissive authorization | All authenticated users can access all fields | Apply field-level authorization middleware |
| String.to_atom in param casting | User input creates atoms, exhausting atom table | Use `String.to_existing_atom/1` or maintain a fixed allowlist |
| No query complexity budget | Deeply nested queries cause server overload | Set `max_complexity` in Absinthe schema configuration |

## Best Practices

1. **Keep resolvers thin** -- resolvers should delegate to business logic modules, not contain domain logic themselves. A resolver is a translation layer, not a business layer.
2. **Use batching for related data** -- Dataloader or manual batching prevents N+1 query patterns in nested field resolution. Every association field should use batched resolution.
3. **Return typed results** -- `{:ok, value}` and `{:error, reason}` tuples provide consistent error handling across all resolver types.
4. **Validate inputs early** -- parameter validation in the resolver prevents invalid data from reaching business logic. Use Ecto embedded schemas for complex validation.
5. **Log resolution metrics** -- track resolver execution time to identify slow fields and optimization opportunities. Use `:telemetry` for structured observability.
6. **Apply authorization at the right level** -- use middleware for role-based checks, resolver-level for data-dependent checks, and query scopes for row-level security.
7. **Set query complexity budgets** -- prevent abuse by assigning complexity scores to fields and rejecting queries that exceed the budget.
8. **Handle timeouts explicitly** -- external data sources (OSINT tools, third-party APIs) can be slow; set timeouts and return partial results or errors gracefully.
9. **Cache stable data in ETS** -- for data that changes infrequently (tool registry, schema metadata), resolve from ETS rather than hitting the database on every request.
10. **Test resolvers in isolation** -- mock data sources and verify resolver logic independently from the GraphQL schema and HTTP layer.

## Related Terms

- [Query](@/glossary/query.md) -- the request specification that resolvers process
- [Schema](@/glossary/schema.md) -- the type definitions that resolvers implement
- [Scope](@/glossary/scope.md) -- authorization context available to resolvers
- [API Gateway](@/glossary/api-gateway.md) -- the entry point that routes to resolvers
- [GenServer](@/glossary/genserver.md) -- OTP abstraction used for stateful resolver caching
- [ETS](@/glossary/ets.md) -- in-memory storage for endpoint registry and resolver caching
- [PubSub](@/glossary/pubsub.md) -- event distribution for cache invalidation after mutations
- [Latency](@/glossary/latency.md) -- key metric for resolver performance monitoring
- [Backpressure](@/glossary/backpressure.md) -- flow control preventing resolver overload
- [Process](@/glossary/process.md) -- BEAM processes that execute resolver functions
- [Server](@/glossary/server.md) -- HTTP server hosting the resolver infrastructure
- [Token](@/glossary/token.md) -- JWT tokens providing resolver authorization context

## See Also

- [Prismatic API Architecture](@/architecture/_index.md) -- auto-introspecting resolver system
- [OSINT Toolbox](/hub/osint/tools) -- 157 OSINT tools as resolver endpoints
- [API Documentation](/api/swaggerui) -- OpenAPI specs for all resolved endpoints
- [Absinthe Documentation](https://hexdocs.pm/absinthe/) -- Elixir GraphQL framework

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
