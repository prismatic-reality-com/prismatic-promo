+++
title = "Graph Database Patterns with KuzuDB for Entity Analysis"
date = 2026-03-15
description = "Using KuzuDB as an embedded graph database for entity relationship traversal, ownership chain analysis, Cypher-like queries, and visualization data generation."

[extra]
author = "Tomas Korcak (korczis)"
category = "engineering"
tags = ["kuzudb", "graph-database", "cypher", "entity-resolution", "visualization"]
reading_time = "9 min"
keywords = ["kuzudb elixir", "graph database", "entity relationships", "ownership chain", "cypher queries"]
image = "/images/blog/kuzudb-graph-database-patterns.png"
word_count = 1080
date_created = "2026-03-15"
date_modified = "2026-03-15"
quality_score = 85
see_also = ["architecture", "developers"]
image_alt = "Graph Database Patterns with KuzuDB for Entity Analysis - Prismatic Platform"
+++

Intelligence analysis is fundamentally about relationships. Who owns what, who knows whom, which entities share addresses, directors, or financial flows. Relational databases handle entity storage well, but traversing multi-hop relationships efficiently requires a graph database. The Prismatic Platform uses KuzuDB, an embedded graph database with a Cypher-compatible query language, for entity relationship analysis.

## Why KuzuDB

KuzuDB is an embedded, columnar graph database optimized for analytical workloads. Unlike Neo4j, it runs in-process without a separate server, which simplifies deployment in an umbrella application:

| Feature | KuzuDB | Neo4j | PostgreSQL (recursive CTE) |
|---------|--------|-------|---------------------------|
| Deployment | Embedded (NIF) | Server | Server |
| Query language | Cypher-compatible | Cypher | SQL |
| Multi-hop traversal | Native, optimized | Native, optimized | Recursive CTE (slow) |
| Memory model | Columnar, disk-backed | Heap-based | Row-based |
| Concurrency | Single-writer, multi-reader | Full MVCC | Full MVCC |
| Operational overhead | Zero | High | Medium |

## Integration Architecture

The KuzuDB integration is isolated in the `prismatic_storage_kuzudb` umbrella app. It provides a GenServer-based connection manager and a query builder:

```elixir
defmodule PrismaticStorageKuzudb.Connection do
  @moduledoc """
  KuzuDB connection manager.

  Maintains a persistent connection to the KuzuDB database
  file and provides query execution with structured results.
  Single-writer serialization through GenServer.
  """

  use GenServer
  require Logger

  @type query_result :: {:ok, [map()]} | {:error, term()}

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec query(String.t(), map()) :: query_result()
  def query(cypher, params \\ %{}) do
    GenServer.call(__MODULE__, {:query, cypher, params}, 30_000)
  end

  @spec write(String.t(), map()) :: :ok | {:error, term()}
  def write(cypher, params \\ %{}) do
    GenServer.call(__MODULE__, {:write, cypher, params}, 30_000)
  end

  @impl GenServer
  def init(opts) do
    db_path = Keyword.fetch!(opts, :path)
    {:ok, db} = Kuzu.Database.new(db_path)
    {:ok, conn} = Kuzu.Connection.new(db)
    {:ok, %{db: db, conn: conn}}
  end

  @impl GenServer
  def handle_call({:query, cypher, params}, _from, %{conn: conn} = state) do
    result = execute_query(conn, cypher, params)
    {:reply, result, state}
  end

  @impl GenServer
  def handle_call({:write, cypher, params}, _from, %{conn: conn} = state) do
    result = execute_write(conn, cypher, params)
    {:reply, result, state}
  end

  defp execute_query(conn, cypher, params) do
    case Kuzu.Connection.query(conn, cypher, params) do
      {:ok, result} -> {:ok, Kuzu.Result.to_maps(result)}
      {:error, reason} -> {:error, reason}
    end
  rescue
    e in RuntimeError -> {:error, Exception.message(e)}
  end

  defp execute_write(conn, cypher, params) do
    case Kuzu.Connection.query(conn, cypher, params) do
      {:ok, _result} -> :ok
      {:error, reason} -> {:error, reason}
    end
  rescue
    e in RuntimeError -> {:error, Exception.message(e)}
  end
end
```

## Schema Definition

Graph schemas define node tables (entities) and relationship tables (edges). The schema is created during application startup:

```elixir
defmodule PrismaticStorageKuzudb.Schema do
  @moduledoc """
  Graph schema definition for entity relationship analysis.

  Defines node tables for entities (companies, persons, addresses)
  and relationship tables for ownership, directorship, and
  address connections.
  """

  alias PrismaticStorageKuzudb.Connection

  @spec create_schema() :: :ok
  def create_schema do
    # Node tables
    Connection.write("""
    CREATE NODE TABLE IF NOT EXISTS Company (
      id STRING, name STRING, ico STRING, country STRING,
      risk_score DOUBLE, status STRING, PRIMARY KEY (id)
    )
    """)

    Connection.write("""
    CREATE NODE TABLE IF NOT EXISTS Person (
      id STRING, name STRING, birth_date DATE, country STRING,
      risk_score DOUBLE, PRIMARY KEY (id)
    )
    """)

    Connection.write("""
    CREATE NODE TABLE IF NOT EXISTS Address (
      id STRING, street STRING, city STRING, postal_code STRING,
      country STRING, PRIMARY KEY (id)
    )
    """)

    # Relationship tables
    Connection.write("""
    CREATE REL TABLE IF NOT EXISTS OWNS (
      FROM Person TO Company,
      share_pct DOUBLE, since DATE, verified BOOLEAN
    )
    """)

    Connection.write("""
    CREATE REL TABLE IF NOT EXISTS DIRECTS (
      FROM Person TO Company,
      role STRING, since DATE, until DATE
    )
    """)

    Connection.write("""
    CREATE REL TABLE IF NOT EXISTS REGISTERED_AT (
      FROM Company TO Address, since DATE
    )
    """)

    Connection.write("""
    CREATE REL TABLE IF NOT EXISTS SUBSIDIARY_OF (
      FROM Company TO Company,
      share_pct DOUBLE, since DATE
    )
    """)

    :ok
  end
end
```

## Entity Relationship Traversal

The core analytical queries traverse the graph to discover ownership chains, shared directors, and address co-location patterns:

```elixir
defmodule PrismaticStorageKuzudb.Analysis do
  @moduledoc """
  Graph analysis queries for entity relationship traversal.

  Provides ownership chain discovery, shared director detection,
  co-location analysis, and shortest path computation between
  entities in the graph.
  """

  alias PrismaticStorageKuzudb.Connection

  @doc """
  Discover the full ownership chain for a company, traversing
  up through parent companies and ultimate beneficial owners.
  """
  @spec ownership_chain(String.t(), non_neg_integer()) :: {:ok, [map()]} | {:error, term()}
  def ownership_chain(company_id, max_depth \\ 5) do
    Connection.query("""
    MATCH path = (c:Company {id: $company_id})<-[:SUBSIDIARY_OF*1..#{max_depth}]-(parent:Company)
    RETURN
      nodes(path) AS chain,
      [r IN relationships(path) | r.share_pct] AS share_percentages,
      length(path) AS depth
    ORDER BY depth ASC
    """, %{company_id: company_id})
  end

  @doc """
  Find persons who direct multiple companies (shared directors).
  Useful for detecting undisclosed relationships between entities.
  """
  @spec shared_directors(non_neg_integer()) :: {:ok, [map()]} | {:error, term()}
  def shared_directors(min_companies \\ 2) do
    Connection.query("""
    MATCH (p:Person)-[:DIRECTS]->(c:Company)
    WITH p, collect(c) AS companies, count(c) AS company_count
    WHERE company_count >= $min_companies
    RETURN p.name AS director, p.id AS person_id,
           company_count,
           [comp IN companies | comp.name] AS company_names
    ORDER BY company_count DESC
    LIMIT 100
    """, %{min_companies: min_companies})
  end

  @doc """
  Find companies registered at the same address.
  Shell company detection heuristic.
  """
  @spec address_colocation(String.t()) :: {:ok, [map()]} | {:error, term()}
  def address_colocation(address_id) do
    Connection.query("""
    MATCH (c:Company)-[:REGISTERED_AT]->(a:Address {id: $address_id})
    RETURN c.id AS company_id, c.name AS company_name,
           c.risk_score AS risk_score, c.status AS status,
           a.street AS street, a.city AS city
    ORDER BY c.risk_score DESC
    LIMIT 100
    """, %{address_id: address_id})
  end

  @doc """
  Shortest path between two entities of any type.
  Useful for discovering indirect connections.
  """
  @spec shortest_path(String.t(), String.t()) :: {:ok, [map()]} | {:error, term()}
  def shortest_path(source_id, target_id) do
    Connection.query("""
    MATCH path = shortestPath(
      (source {id: $source_id})-[*1..6]-(target {id: $target_id})
    )
    RETURN nodes(path) AS entities,
           relationships(path) AS connections,
           length(path) AS distance
    """, %{source_id: source_id, target_id: target_id})
  end
end
```

## Visualization Data Generation

Graph query results are transformed into visualization-ready data structures compatible with D3.js force-directed graphs and Chart.js:

```elixir
defmodule PrismaticStorageKuzudb.Visualization do
  @moduledoc """
  Transforms graph query results into visualization-ready
  data structures for D3.js and Chart.js rendering.
  """

  @type graph_data :: %{
    nodes: [%{id: String.t(), label: String.t(), type: String.t(), risk: float()}],
    edges: [%{source: String.t(), target: String.t(), label: String.t(), weight: float()}]
  }

  @spec entity_network(String.t(), non_neg_integer()) :: {:ok, graph_data()} | {:error, term()}
  def entity_network(entity_id, depth \\ 2) do
    case Connection.query(network_query(depth), %{entity_id: entity_id}) do
      {:ok, results} -> {:ok, transform_to_graph(results)}
      {:error, reason} -> {:error, reason}
    end
  end

  defp transform_to_graph(results) do
    nodes =
      results
      |> Enum.flat_map(fn row -> row["entities"] end)
      |> Enum.uniq_by(& &1["id"])
      |> Enum.map(fn entity ->
        %{
          id: entity["id"],
          label: entity["name"],
          type: entity["_label"],
          risk: entity["risk_score"] || 0.0
        }
      end)

    edges =
      results
      |> Enum.flat_map(fn row -> row["connections"] end)
      |> Enum.map(fn rel ->
        %{
          source: rel["_src"],
          target: rel["_dst"],
          label: rel["_label"],
          weight: rel["share_pct"] || 1.0
        }
      end)

    %{nodes: nodes, edges: edges}
  end
end
```

| Query Type | Avg Latency | Max Depth | Typical Result Size |
|-----------|-------------|-----------|-------------------|
| Ownership chain | 5-15ms | 5 hops | 10-50 nodes |
| Shared directors | 10-30ms | 1 hop | 50-200 persons |
| Address co-location | 3-8ms | 1 hop | 5-50 companies |
| Shortest path | 15-50ms | 6 hops | 2-12 nodes |
| Entity network | 20-80ms | 2 hops | 20-200 nodes |

KuzuDB's embedded architecture eliminates network round-trips and deployment complexity. For an intelligence platform where relationship traversal is a core analytical capability, the performance characteristics of an in-process columnar graph database provide significant advantages over both relational recursive CTEs and client-server graph databases.
