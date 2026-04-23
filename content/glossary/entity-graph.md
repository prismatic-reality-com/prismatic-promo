+++
title = "Entity Graph"
weight = 50
[extra]
tags = ["glossary", "core", "graph-database", "knowledge-representation", "osint", "due-diligence", "data-modeling"]
description = "A graph data structure representing entities (people, organizations, assets) and their relationships, used for OSINT intelligence, due diligence, beneficial ownership analysis, and knowledge representation"
category = "core"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "12 min"
difficulty = "advanced"
quality_score = 95
technical_level = "advanced"
domain_category = "data-architecture"
related_concepts = ["knowledge-graph", "graph-database", "entity-resolution", "beneficial-ownership", "kuzudb", "due-diligence"]
implementation_status = "production"
authority_level = "supreme"
difficulty_rating = 8
prerequisites = ["graph-database", "entity-resolution", "ecto", "data-pipeline"]
learning_path = ["ecto -> entity-resolution -> entity-graph -> knowledge-graph -> belief-graph"]
interactive_demos = ["/labs/glossary/entity-graph"]
code_examples = ["KuzuDB entity graph operations", "Entity node and relationship modeling", "Graph traversal for ownership chains"]
external_resources = ["https://kuzudb.com/", "https://en.wikipedia.org/wiki/Knowledge_graph", "https://neo4j.com/developer/graph-database/"]
version_introduced = "gen-8"
stability_level = "stable"
testing_scenarios = ["entity creation and linking", "ownership chain traversal", "entity deduplication", "graph consistency validation", "temporal relationship tracking"]
keywords = ["entity graph", "knowledge graph", "graph database", "KuzuDB", "OSINT", "due diligence", "beneficial ownership", "entity resolution", "relationship mapping"]
related_terms = ["knowledge-graph", "graph-database", "entity-resolution", "due-diligence", "belief-graph", "ecto", "data-pipeline", "embedding", "cosine-similarity", "epistemic-pipeline"]
word_count = 1692
date_created = "2026-02-23"
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Entity Graph - Prismatic Platform"
+++

## Definition

An **entity graph** is a directed, labeled graph data structure in which nodes represent real-world entities (people, organizations, assets, addresses, digital identifiers) and edges represent typed relationships between those entities (ownership, employment, directorship, transaction, communication). Unlike flat relational tables, entity graphs natively model the multi-hop, many-to-many, and recursive relationships that characterize real-world intelligence data -- making them the natural substrate for [OSINT](@/glossary/due-diligence.md) analysis, [due diligence](@/glossary/due-diligence.md) investigations, anti-money laundering (AML) compliance, and beneficial ownership mapping.

In the [Prismatic Platform](@/glossary/application.md), entity graphs are stored and queried through [KuzuDB](@/glossary/duckdb.md), an embedded graph database that provides Cypher-compatible query language, ACID transactions, and columnar storage optimized for analytical workloads. The platform's entity graph layer bridges OSINT data collection (120+ adapters across Czech, EU, and global sources) with analytical capabilities like [entity resolution](@/glossary/entity-resolution.md), ownership chain analysis, and risk scoring, creating a unified intelligence fabric that transforms raw data into actionable knowledge.

## Overview

The fundamental insight behind entity graphs is that **relationships are data**, not just foreign keys. In a traditional relational database, the relationship between a person and a company is a row in a junction table -- a structural artifact that requires JOINs to traverse. In an entity graph, that relationship is a first-class citizen with its own properties (role, start date, ownership percentage, confidence score), traversable in constant time per hop.

This distinction becomes critical at scale. Consider a beneficial ownership investigation that must trace ownership through a chain of shell companies across multiple jurisdictions. In SQL, this requires recursive CTEs with depth limits and exponential JOIN complexity. In a graph database, it is a simple variable-length path traversal:

```cypher
MATCH (person:Person)-[:OWNS*1..5]->(target:Company {name: 'TargetCorp'})
RETURN person.name, length(path) AS chain_depth
```

Entity graphs in the Prismatic Platform serve three primary functions:

1. **Intelligence Aggregation**: Raw data from 120+ OSINT sources is ingested, normalized, and linked into a unified entity graph. A single company entity might have nodes from ARES (Czech business register), Censys (digital footprint), certificate transparency logs, and Shodan (exposed services), all connected through resolved entity relationships.

2. **Analytical Traversal**: Investigators can traverse the graph to discover non-obvious connections, ownership chains, and risk indicators. Graph algorithms (centrality, community detection, shortest path) surface patterns invisible in tabular data.

3. **Temporal Modeling**: Entity relationships change over time. A person may serve as director of a company from 2020-2023, then resign. The entity graph maintains temporal edges with validity periods, enabling point-in-time analysis and change detection.

## Technical Details

### Node Types

The Prismatic entity graph defines a taxonomy of node types based on real-world entity categories:

| Node Type | Description | Key Properties | Source Examples |
|-----------|-------------|----------------|-----------------|
| **Person** | Individual human entity | name, date_of_birth, nationality, identifiers | ARES, Justice, LinkedIn |
| **Organization** | Company, NGO, government body | name, registration_number, jurisdiction, status | ARES, Commercial Register, SEC EDGAR |
| **Address** | Physical or postal address | street, city, country, coordinates | ARES, Google Maps, postal databases |
| **Asset** | Digital or physical asset | type, value, identifiers | Certificate transparency, DNS, Shodan |
| **Domain** | Internet domain name | name, registrar, creation_date, nameservers | DNS enumeration, WHOIS |
| **IPAddress** | Network address | address, asn, geolocation, services | Censys, Shodan, VirusTotal |
| **Certificate** | TLS/SSL certificate | subject, issuer, validity, SANs | Certificate transparency logs |
| **Document** | Legal or regulatory document | type, filing_date, reference_number | Justice, ISIR, Commercial Register |

### Edge Types

Relationships are typed and carry metadata:

| Edge Type | From | To | Properties |
|-----------|------|----|------------|
| **OWNS** | Person/Org | Organization | percentage, start_date, end_date, source |
| **DIRECTS** | Person | Organization | role, start_date, end_date, source |
| **EMPLOYS** | Organization | Person | position, department, start_date |
| **LOCATED_AT** | Person/Org | Address | type (registered, operational), since |
| **HOSTS** | IPAddress | Domain | first_seen, last_seen, protocol |
| **ISSUED_TO** | Certificate | Domain | valid_from, valid_to, issuer |
| **RELATED_TO** | Any | Any | relationship_type, confidence, source |
| **SANCTIONED_BY** | Person/Org | Document | list_name, designation_date, reason |

### Graph Schema in KuzuDB

```cypher
CREATE NODE TABLE Person(
  id STRING PRIMARY KEY,
  name STRING,
  date_of_birth DATE,
  nationality STRING,
  identifiers MAP(STRING, STRING),
  confidence FLOAT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE NODE TABLE Organization(
  id STRING PRIMARY KEY,
  name STRING,
  registration_number STRING,
  jurisdiction STRING,
  status STRING,
  founded_date DATE,
  confidence FLOAT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE REL TABLE OWNS(
  FROM Person TO Organization,
  FROM Organization TO Organization,
  percentage FLOAT,
  start_date DATE,
  end_date DATE,
  source STRING,
  confidence FLOAT
);

CREATE REL TABLE DIRECTS(
  FROM Person TO Organization,
  role STRING,
  start_date DATE,
  end_date DATE,
  source STRING,
  confidence FLOAT
);
```

## Interactive Entity Graph Visualization

<div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden my-8">
    <div class="p-6">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span class="font-semibold text-white text-lg">Entity Relationship Network</span>
            </div>
            <div class="flex gap-2">
                <button @click="selectedEntity = 'person_john_doe'"
                        :class="selectedEntity === 'person_john_doe' ? 'bg-indigo-600' : 'bg-gray-700'"
                        class="px-3 py-1 text-xs text-white rounded-md hover:bg-indigo-500 transition-colors">
                    John Doe
                </button>
                <button @click="selectedEntity = 'org_acme_corp'"
                        :class="selectedEntity === 'org_acme_corp' ? 'bg-indigo-600' : 'bg-gray-700'"
                        class="px-3 py-1 text-xs text-white rounded-md hover:bg-indigo-500 transition-colors">
                    ACME Corp
                </button>
                <button @click="selectedEntity = 'full_network'"
                        :class="selectedEntity === 'full_network' ? 'bg-indigo-600' : 'bg-gray-700'"
                        class="px-3 py-1 text-xs text-white rounded-md hover:bg-indigo-500 transition-colors">
                    Full Network
                </button>
            </div>
        </div>

        <div class="relative h-96" x-data="entityNetworkChart()" x-init="initChart()">
            <canvas id="entityChart"></canvas>
        </div>

        <!-- Entity Information Panel -->
        <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4" x-show="selectedEntityInfo">
            <div class="lg:col-span-2 bg-gray-750 rounded-lg p-4">
                <h4 class="font-semibold text-white mb-3" x-text="selectedEntityInfo?.name"></h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-gray-400">Type:</span>
                        <span class="text-white ml-2" x-text="selectedEntityInfo?.type"></span>
                    </div>
                    <div>
                        <span class="text-gray-400">Confidence:</span>
                        <span class="text-white ml-2" x-text="selectedEntityInfo?.confidence + '%'"></span>
                    </div>
                    <div>
                        <span class="text-gray-400">Connections:</span>
                        <span class="text-white ml-2" x-text="selectedEntityInfo?.connections"></span>
                    </div>
                    <div>
                        <span class="text-gray-400">Sources:</span>
                        <span class="text-white ml-2" x-text="selectedEntityInfo?.sources?.join(', ')"></span>
                    </div>
                </div>
            </div>

            <!-- Relationship Summary -->
            <div class="bg-gray-750 rounded-lg p-4">
                <h5 class="font-medium text-white mb-3">Relationship Types</h5>
                <div class="space-y-2" x-show="selectedEntityInfo?.relationships">
                    <template x-for="rel in selectedEntityInfo?.relationships" :key="rel.type">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400" x-text="rel.type"></span>
                            <span class="text-white" x-text="rel.count"></span>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- Live Data Status Indicator -->
        <div class="mt-6 flex items-center justify-between text-sm border-t border-gray-600 pt-4">
            <div class="text-gray-400" x-show="!isLoading && !error">
                <span class="font-medium">KuzuDB:</span>
                <span x-text="getConnectionStatus().icon" class="ml-1"></span>
                <span x-text="getConnectionStatus().status" :class="getConnectionStatus().color" class="ml-1 capitalize"></span>
                <span x-show="lastUpdated" class="ml-2 text-gray-500">
                    Last updated: <span x-text="lastUpdated"></span>
                </span>
            </div>
            <div x-show="!isLoading && !error" class="flex gap-3">
                <button @click="refreshData()"
                        class="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Refresh Graph
                </button>
                <span class="text-xs text-gray-500">
                    WebSocket: <span x-text="getMetrics().activeWebSockets || 0"></span> connections
                </span>
            </div>
        </div>

        <div x-show="isLoading" class="mt-6 flex items-center justify-center text-yellow-400 border-t border-gray-600 pt-4">
            <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Connecting to KuzuDB graph database...
        </div>

        <div x-show="error" class="mt-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div class="flex items-center text-red-400">
                <span class="mr-2">🕸️</span>
                <span class="font-medium">KuzuDB Error:</span>
                <span x-text="error" class="ml-2 text-red-300"></span>
            </div>
        </div>

        <!-- Network Statistics -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4" x-show="!isLoading && !error">
            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-indigo-400">Live</div>
                <div class="text-xs text-gray-400">Total Entities</div>
            </div>
            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-yellow-400">Live</div>
                <div class="text-xs text-gray-400">Relationships</div>
            </div>
            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-400">Live</div>
                <div class="text-xs text-gray-400">Avg Degree</div>
            </div>
            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-purple-400">Live</div>
                <div class="text-xs text-gray-400">Resolution Rate</div>
            </div>
        </div>
    </div>
</div>

<script>
// Initialize Prismatic Chart Manager if not already done
if (typeof window.prismaticCharts === 'undefined') {
    window.prismaticCharts = new PrismaticChartManager({
        apiBaseUrl: window.location.protocol + '//' + window.location.host + '/api/v1',
        cacheTimeout: 30000,
        retryAttempts: 3
    });
}

Alpine.data('entityNetworkChart', () => ({
    selectedEntity: 'full_network',
    selectedEntityInfo: null,
    chart: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    liveData: null,

    async initChart() {
        this.isLoading = true;
        this.error = null;

        try {
            await this.$nextTick();

            const ctx = document.getElementById('entityChart');
            if (!ctx) {
                throw new Error('Chart canvas not found');
            }

            console.log('🕸️ Initializing live entity graph with KuzuDB...');

            // Create chart with real-time KuzuDB data
            this.chart = await window.prismaticCharts.createEntityGraphChart('entityChart', {
                realTime: true,
                selectedEntity: this.selectedEntity
            });

            this.lastUpdated = new Date().toLocaleTimeString();
            this.isLoading = false;

            console.log('✅ Live entity graph initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize entity graph:', error);
            this.error = error.message;
            this.isLoading = false;
            this.createFallbackMessage();
        }

        // Watch for entity selection changes
        this.$watch('selectedEntity', async () => {
            if (this.chart && !this.isLoading && window.prismaticCharts) {
                try {
                    // Update chart based on selected entity
                    const graphData = await window.prismaticCharts.apiCall(`dd/entities_graph_live?filter=${this.selectedEntity}`);
                    this.updateSelectedEntityInfo(graphData);
                    this.lastUpdated = new Date().toLocaleTimeString();
                } catch (error) {
                    console.error('Failed to update entity selection:', error);
                }
            }
        });

        // Set up periodic status updates
        setInterval(() => {
            if (this.chart && !this.error) {
                this.lastUpdated = new Date().toLocaleTimeString();
            }
        }, 30000);
    },

    updateSelectedEntityInfo(graphData) {
        if (!graphData || !graphData.entities) return;

        const entity = graphData.entities.find(e =>
            e.id === this.selectedEntity || e.name === this.selectedEntity
        ) || graphData.entities[0];

        if (entity) {
            this.selectedEntityInfo = {
                name: entity.name || entity.id,
                type: this.capitalizeFirst(entity.type),
                confidence: Math.round((entity.confidence || 0.8) * 100),
                connections: entity.relationships?.length || 0,
                sources: entity.sources || ['KuzuDB'],
                relationships: this.groupRelationships(entity.relationships || [])
            };
        }
    },

    groupRelationships(relationships) {
        const grouped = {};
        relationships.forEach(rel => {
            const type = rel.type || 'RELATED_TO';
            grouped[type] = (grouped[type] || 0) + 1;
        });

        return Object.entries(grouped).map(([type, count]) => ({ type, count }));
    },

    capitalizeFirst(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
    },

    createFallbackMessage() {
        const container = document.querySelector('#entityChart')?.parentElement;
        if (container) {
            const fallback = document.createElement('div');
            fallback.className = 'flex items-center justify-center h-96 bg-gray-750 rounded-lg border border-red-500/30';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'text-center p-6';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'text-red-400 text-lg font-semibold mb-2';
            titleDiv.textContent = '🕸️ KuzuDB Connection Unavailable';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-gray-400 text-sm mb-4';
            errorDiv.textContent = `Entity graph data: ${this.error}`;

            const button = document.createElement('button');
            button.className = 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors';
            button.textContent = 'Retry KuzuDB Connection';
            button.onclick = () => location.reload();

            contentDiv.appendChild(titleDiv);
            contentDiv.appendChild(errorDiv);
            contentDiv.appendChild(button);
            fallback.appendChild(contentDiv);
            container.appendChild(fallback);
        }
    },

    async refreshData() {
        if (this.chart && window.prismaticCharts) {
            try {
                await window.prismaticCharts.refreshAllCharts();
                this.lastUpdated = new Date().toLocaleTimeString();
                this.error = null;
            } catch (error) {
                console.error('Failed to refresh entity graph:', error);
                this.error = error.message;
            }
        }
    },

    getConnectionStatus() {
        if (this.error) return { status: 'KuzuDB offline', color: 'text-red-400', icon: '❌' };
        if (this.isLoading) return { status: 'connecting to KuzuDB', color: 'text-yellow-400', icon: '🔄' };
        return { status: 'KuzuDB live', color: 'text-green-400', icon: '✅' };
    },

    getMetrics() {
        return window.prismaticCharts?.getMetrics() || {};
    }
}));
</script>

## Implementation in Prismatic Platform

### Entity Graph Manager

The platform's entity graph operations are coordinated through a dedicated OTP process:

```elixir
defmodule PrismaticGraph.EntityManager do
  @moduledoc """
  Manages entity graph operations including node creation,
  relationship linking, entity resolution, and graph traversal.

  Uses KuzuDB as the underlying graph storage engine with
  Cypher-compatible query execution.
  """

  use GenServer

  alias PrismaticGraph.{KuzuClient, EntityResolver, SchemaRegistry}

  @type entity_type :: :person | :organization | :address | :asset | :domain | :ip_address
  @type relationship_type :: :owns | :directs | :employs | :located_at | :hosts | :related_to
  @type entity_id :: String.t()
  @type confidence :: float()

  @type entity :: %{
          id: entity_id(),
          type: entity_type(),
          properties: map(),
          confidence: confidence(),
          sources: list(String.t())
        }

  @type relationship :: %{
          from_id: entity_id(),
          to_id: entity_id(),
          type: relationship_type(),
          properties: map(),
          confidence: confidence()
        }

  @type traversal_result :: %{
          paths: list(list(entity())),
          depth: non_neg_integer(),
          total_nodes: non_neg_integer()
        }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @spec create_entity(entity_type(), map()) :: {:ok, entity()} | {:error, String.t()}
  def create_entity(type, properties) do
    GenServer.call(__MODULE__, {:create_entity, type, properties})
  end

  @spec create_relationship(entity_id(), entity_id(), relationship_type(), map()) ::
          {:ok, relationship()} | {:error, String.t()}
  def create_relationship(from_id, to_id, type, properties \\ %{}) do
    GenServer.call(__MODULE__, {:create_relationship, from_id, to_id, type, properties})
  end

  @spec find_entity(entity_id()) :: {:ok, entity()} | {:error, :not_found}
  def find_entity(entity_id) do
    GenServer.call(__MODULE__, {:find_entity, entity_id})
  end

  @spec traverse_ownership(entity_id(), non_neg_integer()) :: {:ok, traversal_result()}
  def traverse_ownership(entity_id, max_depth \\ 5) do
    GenServer.call(__MODULE__, {:traverse_ownership, entity_id, max_depth})
  end

  @spec resolve_entities(list(map())) :: {:ok, list(entity())}
  def resolve_entities(candidate_entities) do
    GenServer.call(__MODULE__, {:resolve_entities, candidate_entities})
  end

  @spec graph_statistics() :: map()
  def graph_statistics do
    GenServer.call(__MODULE__, :graph_statistics)
  end

  @impl true
  @spec init(keyword()) :: {:ok, map()}
  def init(opts) do
    kuzu_path = Keyword.get(opts, :database_path, "priv/power_graph_kuzu")

    state = %{
      kuzu_path: kuzu_path,
      schema_version: SchemaRegistry.current_version(),
      entity_count: 0,
      relationship_count: 0,
      started_at: DateTime.utc_now()
    }

    {:ok, state}
  end

  @impl true
  def handle_call({:create_entity, type, properties}, _from, state) do
    entity_id = generate_entity_id(type, properties)

    entity = %{
      id: entity_id,
      type: type,
      properties: sanitize_properties(properties),
      confidence: calculate_initial_confidence(properties),
      sources: extract_sources(properties),
      created_at: DateTime.utc_now()
    }

    case execute_create_node(type, entity, state) do
      :ok ->
        emit_entity_event(:created, entity)
        {:reply, {:ok, entity}, %{state | entity_count: state.entity_count + 1}}

      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  @impl true
  def handle_call({:create_relationship, from_id, to_id, type, properties}, _from, state) do
    relationship = %{
      from_id: from_id,
      to_id: to_id,
      type: type,
      properties: sanitize_properties(properties),
      confidence: Map.get(properties, :confidence, 0.8),
      created_at: DateTime.utc_now()
    }

    case execute_create_relationship(relationship, state) do
      :ok ->
        emit_relationship_event(:created, relationship)
        new_state = %{state | relationship_count: state.relationship_count + 1}
        {:reply, {:ok, relationship}, new_state}

      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  @impl true
  def handle_call({:find_entity, entity_id}, _from, state) do
    result = execute_find_node(entity_id, state)
    {:reply, result, state}
  end

  @impl true
  def handle_call({:traverse_ownership, entity_id, max_depth}, _from, state) do
    query = """
    MATCH path = (start)-[:OWNS*1..#{max_depth}]->(target {id: $target_id})
    RETURN path, length(path) AS depth
    ORDER BY depth ASC
    """

    case KuzuClient.execute(state.kuzu_path, query, %{target_id: entity_id}) do
      {:ok, results} ->
        traversal = %{
          paths: format_paths(results),
          depth: max_result_depth(results),
          total_nodes: count_unique_nodes(results)
        }

        {:reply, {:ok, traversal}, state}

      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  @impl true
  def handle_call({:resolve_entities, candidates}, _from, state) do
    resolved = EntityResolver.resolve(candidates)
    {:reply, {:ok, resolved}, state}
  end

  @impl true
  def handle_call(:graph_statistics, _from, state) do
    stats = %{
      entity_count: state.entity_count,
      relationship_count: state.relationship_count,
      schema_version: state.schema_version,
      uptime_seconds: DateTime.diff(DateTime.utc_now(), state.started_at, :second)
    }

    {:reply, stats, state}
  end

  @spec generate_entity_id(entity_type(), map()) :: entity_id()
  defp generate_entity_id(type, properties) do
    fingerprint =
      properties
      |> Map.take([:name, :registration_number, :identifier])
      |> :erlang.term_to_binary()
      |> then(&:crypto.hash(:sha256, &1))
      |> Base.encode16(case: :lower)
      |> binary_part(0, 16)

    "#{type}_#{fingerprint}"
  end

  @spec sanitize_properties(map()) :: map()
  defp sanitize_properties(properties) do
    properties
    |> Map.drop([:__struct__, :__meta__])
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Map.new()
  end

  @spec calculate_initial_confidence(map()) :: confidence()
  defp calculate_initial_confidence(properties) do
    source_count = properties |> Map.get(:sources, []) |> length()

    cond do
      source_count >= 3 -> 0.95
      source_count == 2 -> 0.80
      source_count == 1 -> 0.60
      true -> 0.40
    end
  end

  @spec extract_sources(map()) :: list(String.t())
  defp extract_sources(properties) do
    Map.get(properties, :sources, ["manual"])
  end

  @spec execute_create_node(entity_type(), entity(), map()) :: :ok | {:error, String.t()}
  defp execute_create_node(type, entity, state) do
    table_name = entity_type_to_table(type)

    query = """
    CREATE (n:#{table_name} {id: $id, confidence: $confidence, created_at: $created_at})
    """

    case KuzuClient.execute(state.kuzu_path, query, entity) do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, "Failed to create node: #{reason}"}
    end
  end

  @spec execute_create_relationship(relationship(), map()) :: :ok | {:error, String.t()}
  defp execute_create_relationship(relationship, state) do
    table_name = relationship_type_to_table(relationship.type)

    query = """
    MATCH (from {id: $from_id}), (to {id: $to_id})
    CREATE (from)-[:#{table_name} {confidence: $confidence}]->(to)
    """

    case KuzuClient.execute(state.kuzu_path, query, relationship) do
      {:ok, _} -> :ok
      {:error, reason} -> {:error, "Failed to create relationship: #{reason}"}
    end
  end

  @spec execute_find_node(entity_id(), map()) :: {:ok, entity()} | {:error, :not_found}
  defp execute_find_node(entity_id, state) do
    query = "MATCH (n {id: $id}) RETURN n"

    case KuzuClient.execute(state.kuzu_path, query, %{id: entity_id}) do
      {:ok, [result | _]} -> {:ok, result}
      {:ok, []} -> {:error, :not_found}
      {:error, _} -> {:error, :not_found}
    end
  end

  @spec entity_type_to_table(entity_type()) :: String.t()
  defp entity_type_to_table(:person), do: "Person"
  defp entity_type_to_table(:organization), do: "Organization"
  defp entity_type_to_table(:address), do: "Address"
  defp entity_type_to_table(:asset), do: "Asset"
  defp entity_type_to_table(:domain), do: "Domain"
  defp entity_type_to_table(:ip_address), do: "IPAddress"

  @spec relationship_type_to_table(relationship_type()) :: String.t()
  defp relationship_type_to_table(:owns), do: "OWNS"
  defp relationship_type_to_table(:directs), do: "DIRECTS"
  defp relationship_type_to_table(:employs), do: "EMPLOYS"
  defp relationship_type_to_table(:located_at), do: "LOCATED_AT"
  defp relationship_type_to_table(:hosts), do: "HOSTS"
  defp relationship_type_to_table(:related_to), do: "RELATED_TO"

  @spec format_paths(list()) :: list(list(entity()))
  defp format_paths(results), do: Enum.map(results, & &1[:path])

  @spec max_result_depth(list()) :: non_neg_integer()
  defp max_result_depth([]), do: 0
  defp max_result_depth(results), do: results |> Enum.map(& &1[:depth]) |> Enum.max()

  @spec count_unique_nodes(list()) :: non_neg_integer()
  defp count_unique_nodes(results) do
    results
    |> Enum.flat_map(& &1[:nodes])
    |> Enum.uniq_by(& &1[:id])
    |> length()
  end

  @spec emit_entity_event(atom(), entity()) :: :ok
  defp emit_entity_event(event, entity) do
    :telemetry.execute(
      [:prismatic_graph, :entity, event],
      %{timestamp: System.monotonic_time()},
      %{type: entity.type, id: entity.id, confidence: entity.confidence}
    )
  end

  @spec emit_relationship_event(atom(), relationship()) :: :ok
  defp emit_relationship_event(event, relationship) do
    :telemetry.execute(
      [:prismatic_graph, :relationship, event],
      %{timestamp: System.monotonic_time()},
      %{type: relationship.type, from: relationship.from_id, to: relationship.to_id}
    )
  end
end
```

### Beneficial Ownership Analyzer

A specialized module for tracing ownership through complex corporate structures:

```elixir
defmodule PrismaticGraph.BeneficialOwnership do
  @moduledoc """
  Analyzes entity graphs to determine ultimate beneficial
  ownership (UBO) through multi-hop corporate structures.

  Implements EU Anti-Money Laundering Directive thresholds
  (25% direct or indirect ownership).
  """

  alias PrismaticGraph.EntityManager

  @ubo_threshold 0.25

  @type ownership_chain :: %{
          ultimate_owner: EntityManager.entity(),
          chain: list(ownership_hop()),
          effective_percentage: float(),
          confidence: float()
        }

  @type ownership_hop :: %{
          entity: EntityManager.entity(),
          percentage: float(),
          relationship_type: atom()
        }

  @spec find_beneficial_owners(EntityManager.entity_id()) :: {:ok, list(ownership_chain())}
  def find_beneficial_owners(company_id) do
    with {:ok, traversal} <- EntityManager.traverse_ownership(company_id, 10) do
      chains =
        traversal.paths
        |> Enum.map(&calculate_effective_ownership/1)
        |> Enum.filter(&(&1.effective_percentage >= @ubo_threshold))
        |> Enum.sort_by(& &1.effective_percentage, :desc)

      {:ok, chains}
    end
  end

  @spec calculate_effective_ownership(list(map())) :: ownership_chain()
  defp calculate_effective_ownership(path) do
    hops = Enum.map(path, fn node ->
      %{
        entity: node,
        percentage: Map.get(node, :ownership_percentage, 1.0),
        relationship_type: Map.get(node, :relationship_type, :owns)
      }
    end)

    effective = Enum.reduce(hops, 1.0, fn hop, acc -> acc * hop.percentage end)
    confidence = Enum.reduce(hops, 1.0, fn hop, acc -> acc * Map.get(hop.entity, :confidence, 0.8) end)

    %{
      ultimate_owner: List.first(hops).entity,
      chain: hops,
      effective_percentage: effective,
      confidence: confidence
    }
  end
end
```

## Comparison with Alternatives

### Entity Graph vs. Relational Database

Relational databases excel at structured, tabular data with fixed schemas. Entity graphs excel at relationship-heavy data with variable schemas. For a simple CRM (customer has orders), a relational database is more efficient. For an OSINT investigation (person owns company A, which owns company B, which owns company C, which transacts with sanctioned entity D), an entity graph is orders of magnitude more efficient due to index-free adjacency.

### Entity Graph vs. Knowledge Graph

A knowledge graph is a broader concept that includes semantic meaning (ontologies, RDF triples, reasoning). An entity graph is a pragmatic subset focused on real-world entities and typed relationships without the full semantic overhead. The Prismatic Platform uses entity graphs for operational intelligence and [belief graphs](@/glossary/belief-graph.md) for epistemic reasoning.

### Entity Graph vs. Document Store

Document stores (MongoDB, Elasticsearch) embed relationships within documents. This works for shallow nesting but fails for deep, recursive relationships. Entity graphs maintain relationships as external edges, enabling unlimited traversal depth without document bloat.

### Entity Graph vs. Property Graph (Neo4j)

Neo4j's property graph model is conceptually similar to entity graphs. The distinction is architectural: Neo4j is a client-server database requiring network communication, while KuzuDB is an embedded database running in-process with the Elixir application. This eliminates network latency and simplifies deployment.

| Aspect | Entity Graph (KuzuDB) | Relational (PostgreSQL) | Knowledge Graph (RDF) | Property Graph (Neo4j) |
|--------|----------------------|------------------------|----------------------|----------------------|
| Relationship traversal | O(1) per hop | O(n) JOIN | O(1) per hop | O(1) per hop |
| Schema flexibility | High | Low | Very high | High |
| Deployment | Embedded | Client-server | Client-server | Client-server |
| Analytical queries | Columnar-optimized | Good (with indexes) | Variable | Moderate |
| Semantic reasoning | No | No | Yes (OWL/RDFS) | No |
| ACID transactions | Yes | Yes | Varies | Yes |

## Best Practices

1. **Model entities by real-world identity, not data source**: A person should have one node in the graph regardless of how many OSINT sources mention them. Use [entity resolution](@/glossary/entity-resolution.md) to merge duplicate mentions into canonical entities.

2. **Carry confidence scores on every node and edge**: Intelligence data varies in reliability. A government registry entry (confidence 0.95) should be weighted differently from an unverified web scrape (confidence 0.40). Propagate confidence through traversals to produce calibrated result confidence.

3. **Model time explicitly on relationships**: Ownership, directorship, and employment relationships have start and end dates. Always include temporal properties to enable point-in-time analysis and change detection.

4. **Use typed edges, not generic relationships**: Prefer `OWNS`, `DIRECTS`, `EMPLOYS` over generic `RELATED_TO`. Typed edges enable precise queries and reduce false positives in traversals.

5. **Index frequently traversed properties**: Entity IDs, names, and registration numbers should be indexed in KuzuDB for fast lookups. Graph traversal is fast, but the initial node lookup benefits from indexing.

6. **Validate graph consistency periodically**: Run consistency checks to ensure all relationships reference existing nodes, ownership percentages are valid (0-100%), and temporal properties are logically consistent (start_date < end_date).

7. **Separate ingestion from analysis**: Use a [data pipeline](@/glossary/data-pipeline.md) to ingest and normalize OSINT data into the entity graph, and a separate query layer for analytical traversals. This prevents long-running analysis from blocking ingestion.

## Common Pitfalls

1. **Entity duplication**: Failing to resolve entities across sources, creating multiple nodes for the same real-world entity. "ACME Corp" from ARES and "ACME Corporation" from SEC EDGAR should resolve to one node, not two. Invest in robust [entity resolution](@/glossary/entity-resolution.md).

2. **Ignoring confidence propagation**: Treating all relationships as equally reliable. A multi-hop ownership chain where one hop has low confidence should not produce a high-confidence conclusion. Multiply confidence scores through the chain.

3. **Unbounded traversals**: Executing variable-length path queries without depth limits in production. A query like `MATCH path = (a)-[*]->(b)` can explode combinatorially on dense graphs. Always set explicit depth limits.

4. **Schema over-engineering**: Creating too many fine-grained node and edge types that fragment the graph and complicate queries. Start with a minimal schema (Person, Organization, Address, Domain) and extend only when specific analytical needs demand it.

5. **Neglecting temporal consistency**: Querying the graph without time context, mixing current and historical relationships. An ownership chain valid in 2020 may not be valid in 2025. Always scope queries to a specific temporal window.

6. **Treating the graph as a data lake**: Dumping raw OSINT data into graph nodes without normalization. Entity graphs should contain clean, resolved, structured data. Raw data belongs in the [ETL](@/glossary/etl.md) staging layer.

## Use Cases

### OSINT Intelligence Aggregation

The platform's 120+ [OSINT adapters](@/glossary/due-diligence.md) produce raw data about entities across Czech registries (ARES, Justice, ISIR), global sources (Shodan, Censys, VirusTotal), and sanctions lists (EU, OFAC, UN). The entity graph aggregates this data into a unified intelligence picture, enabling analysts to see connections that are invisible in isolated data sources.

### Beneficial Ownership Mapping

For compliance with EU Anti-Money Laundering Directives, the entity graph traces ownership chains through complex corporate structures to identify ultimate beneficial owners (UBOs). This is essential for KYC (Know Your Customer) processes and sanctions screening.

### Attack Surface Discovery

In [EASM](@/glossary/easm.md) operations, the entity graph maps the relationship between domains, IP addresses, certificates, and services to build a complete picture of an organization's external attack surface. Graph traversal reveals infrastructure dependencies and hidden exposure points.

### Due Diligence Investigation

For M&A transactions and business partnerships, the entity graph provides comprehensive background information on target entities, including corporate structure, key personnel, litigation history, sanctions exposure, and financial indicators.

### Risk Scoring

The entity graph enables graph-based risk scoring where an entity's risk is influenced by its relationships. A company directed by a sanctioned individual inherits risk through the graph, even if the company itself is not directly sanctioned.

## Related Concepts

- [Knowledge Graph](@/glossary/belief-graph.md) -- broader concept encompassing semantic reasoning and ontologies beyond entity relationships
- [Entity Resolution](@/glossary/entity-resolution.md) -- the process of determining when two entity references denote the same real-world entity
- [Due Diligence](@/glossary/due-diligence.md) -- investigative process that heavily relies on entity graph traversal
- [Data Pipeline](@/glossary/data-pipeline.md) -- the ingestion and normalization layer that feeds data into the entity graph
- [EASM](@/glossary/easm.md) -- external attack surface management that uses entity graphs to map infrastructure
- [Belief Graph](@/glossary/belief-graph.md) -- epistemic graph used for reasoning about the reliability of entity graph data
- [Ecto](@/glossary/ecto.md) -- the relational data layer that complements graph storage for structured entity metadata
- [Embedding](@/glossary/embedding.md) -- vector representations used for entity similarity and fuzzy matching
- [Cosine Similarity](@/glossary/cosine-similarity.md) -- similarity metric used in entity resolution within the graph
- [Epistemic Pipeline](@/glossary/epistemic-pipeline.md) -- the processing chain that transforms raw OSINT data into graph-ready entities

## See Also

- [Distributed System](@/glossary/distributed-system.md) -- architecture patterns for scaling entity graphs across nodes
- [ETS](@/glossary/ets.md) -- in-memory storage used for caching frequently accessed graph query results
- [Event Sourcing](@/glossary/event-sourcing.md) -- pattern for tracking all changes to the entity graph over time
- [GraphQL](@/glossary/graphql.md) -- query language that can expose entity graph data to external consumers
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- the scoring system applied to entity graph nodes and edges

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
