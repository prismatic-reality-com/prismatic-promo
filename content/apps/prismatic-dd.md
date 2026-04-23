+++
title = "Prismatic DD"
weight = 8
[extra]
icon = "document-magnifying-glass"
color = "amber"
description = "Entity-centric due diligence investigation platform with graph-based relationship exploration"
category = "Intelligence"
files = "1561"
status = "MVP"
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1884
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Entity-centric", "apps", "Intelligence", "Prismatic Platform", "Case", "Entity", "Graph"]
tags = ["apps", "intelligence", "prismatic-dd", "prismatic"]
quality_score = 90
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic DD - Prismatic Platform"
+++

## Abstract

Prismatic DD is the entity-centric due diligence investigation platform within the Prismatic ecosystem. It provides a structured environment for creating, managing, and exploring investigable subjects -- persons, companies, domains, assets, and documents -- along with the directional relationships that connect them. The platform implements a graph-based data model with breadth-first traversal for multi-level relationship exploration, a case management system with full lifecycle tracking (draft through archived), and dual-layer persistence combining [ETS](/glossary/ets/) in-memory caching with file-backed JSON storage for durability without external database dependencies. The architecture is intentionally minimal: three supervised [GenServer](/glossary/genserver/) processes, zero external service requirements, and a clean facade API that exposes all operations through a single module. Five [Phoenix LiveView](/glossary/phoenix-liveview/) dashboards provide real-time interactive interfaces for case management, entity exploration, graph visualization, and investigation coordination. With 1,561 lines of production [Elixir](/glossary/elixir/) code, 16 relationship types, 5 entity categories, and comprehensive test coverage, Prismatic DD delivers the investigation infrastructure required for corporate due diligence, compliance screening, and intelligence analysis workflows.

## 1. Introduction

### 1.1 Problem Statement

Due diligence investigations require analysts to track complex webs of relationships between entities -- persons who direct companies, companies that own subsidiaries, investors who fund ventures, and the documents and domains that connect them. Traditional investigation tools either force analysts into flat spreadsheets that lose structural context, or require heavyweight database deployments that create operational friction for time-sensitive investigations.

The core challenge is graph complexity. A single corporate investigation can involve dozens of entities connected by hundreds of relationships spanning ownership, directorship, shareholding, employment, investment, and family ties. Analysts need to traverse these relationship graphs at variable depth, scope investigations to specific cases, and attach analysis results and documents to individual entities -- all while maintaining a clear [audit trail](/glossary/audit-trail/) of what was investigated and when.

Commercial due diligence platforms address this with SaaS offerings that require network connectivity, data residency compromises, and per-seat licensing that scales poorly for organizations running frequent investigations. Prismatic DD takes a different approach: an embedded [OTP](/glossary/otp/) application that runs within the [BEAM](/glossary/beam/) runtime, stores data locally, and provides sub-millisecond graph traversal through ETS-backed caching.

### 1.2 Design Goals

1. **Entity-centric data model** -- model all investigable subjects as typed entities with identifiers, attributes, documents, and analysis results, connected by directional relationships.
2. **Graph-first exploration** -- provide breadth-first graph traversal with configurable depth, enabling analysts to explore relationship networks at any scale.
3. **Zero external dependencies** -- run entirely within the BEAM runtime using ETS for speed and file-backed JSON for persistence, requiring no database server.
4. **Case-scoped investigations** -- group entities into named cases with lifecycle tracking, risk assessment, and investigation notes.
5. **Real-time dashboards** -- deliver interactive LiveView interfaces for all investigation workflows without JavaScript framework complexity.
6. **Clean API surface** -- expose all operations through a single facade module with consistent `{:ok, result}` / `{:error, reason}` return patterns.

### 1.3 Scope

Prismatic DD covers entity management, relationship modeling, graph traversal, and case lifecycle tracking. [OSINT](/glossary/osint/) data collection is handled by upstream applications ([prismatic_osint_sources](/apps/prismatic-osint-sources/), [prismatic_hawkeye](/apps/prismatic-hawkeye/)) which feed investigation results into DD entities via the analysis API. [Sanctions screening](/glossary/sanctions-screening/), risk scoring algorithms, and compliance assessment are provided by the broader Prismatic platform -- DD provides the structural foundation on which these capabilities operate.

## 2. Architecture

### 2.1 System Design

Prismatic DD follows a three-store architecture where each domain concern -- entities, relationships, and cases -- is managed by an independent GenServer with its own ETS table and file-backed persistence:

```
PrismaticDd.Application (Supervisor, :one_for_one)
|
+-- PrismaticDd.Entity.Store (GenServer)
|   +-- ETS: :prismatic_dd_entities
|   +-- Files: priv/data/entities/{type}/{id}.json
|
+-- PrismaticDd.Graph.Store (GenServer)
|   +-- ETS: :prismatic_dd_relationships
|   +-- Index: {entity_id, relationship_id} pairs
|   +-- Files: priv/data/relationships/{id}.json
|   +-- Aggregate: priv/data/graph.json
|
+-- PrismaticDd.Case.Store (GenServer)
    +-- ETS: :prismatic_dd_cases
    +-- Files: priv/data/cases/{id}/case.json
    +-- Markdown: README.md, AGENTS.md, CLAUDE.md per case
```

The `:one_for_one` supervision strategy ensures that a failure in one store (e.g., a file I/O error in the Case Store) does not cascade to other stores. Each GenServer loads its data from disk into ETS on startup and writes through to both ETS and disk on every mutation, providing crash recovery without transaction logs.

### 2.2 Core Components

| Module | LOC | Responsibility |
|--------|-----|----------------|
| `PrismaticDd` | 429 | Public facade: entity CRUD, relationships, graph traversal, case management |
| `PrismaticDd.Entity` | 205 | Entity schema: 5 types, identifiers, attributes, documents, analysis |
| `PrismaticDd.Entity.Store` | 211 | GenServer: ETS cache + file persistence for entities |
| `PrismaticDd.Case` | 216 | Case schema: lifecycle states, risk levels, entity scoping |
| `PrismaticDd.Case.Store` | 361 | GenServer: case persistence + markdown document management |
| `PrismaticDd.Graph.Relationship` | 218 | Relationship schema: 16 directional types with inverse mapping |
| `PrismaticDd.Graph.Store` | 310 | GenServer: relationship storage + BFS graph traversal engine |

### 2.3 Data Model

#### Entity Types

| Type | Purpose | Common Identifiers |
|------|---------|-------------------|
| `:person` | Individual under investigation | `birth_date`, `ssn`, `passport`, `ico` |
| `:company` | Corporate entity | `ico`, `vat_id`, `trade_registry_id` |
| `:domain` | Internet domain or IP | `domain`, `ip_address`, `asn` |
| `:asset` | Physical or digital asset | `serial_number`, `mac_address`, `vin` |
| `:document` | Reference document or evidence | `doc_type`, `file_hash`, `isbn` |

#### Relationship Types (16 total)

| Relationship | Inverse | Use Case |
|-------------|---------|----------|
| `:owns` | `:owned_by` | Ownership chains |
| `:director_of` | `:has_director` | Corporate governance |
| `:shareholder_of` | `:has_shareholder` | Equity holdings (with percentage) |
| `:partner_with` | (bidirectional) | Business partnerships |
| `:employee_of` | `:employs` | Employment relationships |
| `:invested_in` | `:has_investor` | Investment flows |
| `:founded` | `:founded_by` | Company founding |
| `:family_of` | (bidirectional) | Family connections |
| `:related_to` | (generic) | Uncategorized associations |
| `:associated_with` | (generic) | Loose associations |

#### Case Lifecycle

```
:draft --> :active --> :review --> :closed --> :archived
```

#### Risk Levels

```
:unknown < :low < :medium < :high < :critical
```

## 3. Implementation

### 3.1 Facade API

All operations are accessed through the `PrismaticDd` facade module. The API follows consistent patterns: creation functions return `{:ok, struct}` or `{:error, reason}`, queries return lists or `{:ok, struct}` / `{:error, :not_found}`.

```elixir
# Create entities
{:ok, person} = PrismaticDd.create_person("Jan Novak", %{role: "CEO"})
{:ok, company} = PrismaticDd.create_company("Acme s.r.o.")

# Add identifiers
{:ok, _} = PrismaticDd.add_identifier(company.id, "ico", "12345678")
{:ok, _} = PrismaticDd.add_identifier(person.id, "birth_date", "1975-03-15")

# Create directional relationships
{:ok, _} = PrismaticDd.create_relationship(person.id, company.id, :director_of)
{:ok, _} = PrismaticDd.create_relationship(person.id, company.id, :shareholder_of,
  %{"percentage" => 51.0})

# Attach analysis results from OSINT agents
{:ok, _} = PrismaticDd.add_analysis(person.id, "sanctions_screening", %{
  result: :clear,
  sources: ["OFAC SDN", "EU Consolidated"],
  checked_at: DateTime.utc_now()
})
```

### 3.2 Graph Traversal

The Graph Store implements breadth-first search (BFS) for relationship exploration. Starting from any entity, the traversal expands outward level by level, returning a map of discovered entities with their distance from the origin:

```elixir
# Traverse from person, 3 levels deep
traversal = PrismaticDd.traverse(person.id, depth: 3)
# => %{"person-jan-novak-1234" => 0, "company-acme-5678" => 1,
#       "person-eva-novakova-9012" => 2, "company-beta-3456" => 3}

# Full exploration with entity data and relationships
result = PrismaticDd.explore(person.id, depth: 2)
# => %{
#   center: %Entity{name: "Jan Novak", type: :person, ...},
#   related: [
#     %{entity: %Entity{name: "Acme s.r.o.", type: :company}, level: 1},
#     %{entity: %Entity{name: "Eva Novakova", type: :person}, level: 2}
#   ],
#   relationships: [%Relationship{type: :director_of, ...}, ...]
# }
```

### 3.3 Case Management

Cases provide investigation scoping -- grouping entities and their relationships into named investigations with lifecycle tracking:

```elixir
# Create investigation case
{:ok, investigation} = PrismaticDd.create_case("Acme Corporate Structure", %{
  description: "Full corporate structure investigation for Acme group",
  tags: ["corporate", "czech-registry"]
})

# Add entities to case
:ok = PrismaticDd.add_entity_to_case(investigation.id, person.id)
:ok = PrismaticDd.add_entity_to_case(investigation.id, company.id)

# Update case status and risk assessment
{:ok, _} = PrismaticDd.set_case_status(investigation.id, :active)
{:ok, _} = PrismaticDd.set_case_risk(investigation.id, :medium)

# Get case-scoped graph (only entities within this case)
graph = PrismaticDd.case_graph(investigation.id)

# Manage investigation documentation
:ok = PrismaticDd.put_case_readme(investigation.id, "# Acme Investigation\n\n...")
:ok = PrismaticDd.put_case_agents(investigation.id, "# Agent Notes\n\n...")
```

### 3.4 Dual-Layer Persistence

Every mutation writes to both ETS (for microsecond read performance) and the filesystem (for crash recovery):

```elixir
# Entity storage path pattern:
# priv/data/entities/person/person-jan-novak-1234.json
# priv/data/entities/company/company-acme-5678.json

# Case storage with markdown documents:
# priv/data/cases/2026-02-06-acme-investigation/
#   case.json      - Case metadata and entity IDs
#   README.md      - Investigation notes
#   AGENTS.md      - Agent coordination notes
#   CLAUDE.md      - Session context
```

On GenServer startup, all JSON files are read from disk and loaded into ETS tables. This eliminates the need for a database server while providing sub-millisecond read latency for graph traversal operations.

## 4. LiveView Integration

Prismatic DD exposes five LiveView dashboards through the [Prismatic Web](/glossary/prismatic-web/) application, all accessible under the `/dd` route prefix:

### 4.1 Route Map

| Route | Module | Purpose |
|-------|--------|---------|
| `/dd` | `DD.DashboardLive` | Overview with stats grid and quick actions |
| `/dd/cases` | `DD.CasesLiveNew` | Case listing with status filtering |
| `/dd/cases/new` | `DD.CasesLiveNew` | Case creation form |
| `/dd/cases/:id` | `DD.CasesLiveNew` | Case detail with tabs (overview, entities, graph, notes) |
| `/dd/entities` | `DD.EntitiesLive` | Entity listing with type filtering and search |
| `/dd/entities/new` | `DD.EntitiesLive` | Entity creation with type selection |
| `/dd/entities/:id` | `DD.EntitiesLive` | Entity detail with identifiers, documents, analysis |
| `/dd/graph` | `DD.GraphLive` | Interactive graph exploration with depth control |

### 4.2 Dashboard Components

The **Dashboard** (`/dd`) displays a stats grid showing total cases, active cases, entity counts by type, and relationship totals. Quick action cards link to case creation, entity management, and graph exploration.

The **Cases** interface provides a tabbed detail view with five tabs: Overview (metadata, status, risk badges), Entities (scoped entity list), Graph (case-scoped relationship visualization), Notes (README.md editor), and Agents (AGENTS.md editor). Case creation includes name, description, risk level, and tag assignment.

The **Graph** explorer (`/dd/graph`) offers entity search, configurable traversal depth (1-5 levels), and interactive relationship visualization showing entity nodes connected by typed relationship edges.

## 5. Performance

### 5.1 Storage Characteristics

| Operation | Latency | Backend |
|-----------|---------|---------|
| Entity lookup by ID | ~1 microsecond | ETS `:set` table |
| Entity search by name | ~10-100 microseconds | ETS scan with filter |
| Relationship lookup | ~1 microsecond | ETS with indexed lookups |
| Graph traversal (depth 1) | ~10 microseconds | ETS BFS |
| Graph traversal (depth 3) | ~100-500 microseconds | ETS BFS, depends on graph density |
| Entity save (write-through) | ~1-5 milliseconds | ETS insert + JSON file write |
| Case save with markdown | ~2-10 milliseconds | ETS insert + multiple file writes |

### 5.2 Scalability

The current architecture is optimized for investigation-scale datasets (hundreds to low thousands of entities). ETS provides O(1) key lookups and O(n) scans, making entity and relationship operations efficient for datasets up to approximately 100,000 records. File-backed persistence creates one JSON file per entity/relationship, which works well for datasets under 50,000 files but would benefit from aggregated storage for larger deployments.

Graph traversal performance depends on graph density. A BFS traversal at depth 3 in a sparsely connected graph (average 2-3 connections per entity) completes in under 100 microseconds. Dense graphs (10+ connections per entity) may take 1-5 milliseconds at depth 3.

### 5.3 Resource Requirements

- **Memory**: ~50KB base (3 GenServers) + ~200 bytes per entity in ETS + ~150 bytes per relationship
- **Disk**: ~500 bytes per entity JSON file + ~300 bytes per relationship JSON file
- **CPU**: Negligible for CRUD operations; BFS traversal is CPU-bound but microsecond-scale

## 6. Testing

### 6.1 Test Coverage

| Test Module | Tests | Focus |
|-------------|-------|-------|
| `prismatic_dd_test.exs` | Facade API | Entity CRUD, relationships, graph traversal, case operations |
| `entity/entity_test.exs` | Schema | Entity creation, identifiers, attributes, serialization |
| `entity/store_test.exs` | Persistence | ETS cache, file I/O, search, concurrent access |
| `case/case_test.exs` | Schema | Case lifecycle, risk levels, entity scoping, tags |
| `case/store_test.exs` | Persistence | Case persistence, markdown documents, status filtering |
| `graph/relationship_test.exs` | Schema | Relationship types, inverse mapping, serialization |
| `graph/store_test.exs` | Persistence | Graph storage, traversal correctness, index consistency |

### 6.2 LiveView Tests

The web interface is tested through 17 LiveView test cases covering:

- Empty state rendering and initial page load
- Case list rendering with filtering
- Case creation modal and form submission
- Case detail view with tab switching (Overview, Entities, Graph, Notes, Agents)
- Breadcrumb navigation and 404 handling
- Status and risk badge display
- Tag rendering and case deletion

### 6.3 Running Tests

```bash
# Unit tests for DD domain logic
mix test apps/prismatic_dd/test/

# LiveView integration tests
mix test apps/prismatic_web/test/prismatic_web/live/dd/
```

## 7. Security

### 7.1 Investigation Isolation

Cases provide logical isolation for investigations. Entities can belong to multiple cases, but case-scoped queries (`case_entities/1`, `case_graph/1`) only return data within the investigation boundary. This prevents cross-contamination between unrelated investigations.

### 7.2 Data Residency

All investigation data is stored locally on the filesystem -- no external API calls, no cloud storage, no third-party data processors. This is by design for investigations involving sensitive PII, corporate intelligence, or regulatory compliance data where data residency requirements prohibit external transmission.

### 7.3 Access Control

DD inherits the platform's [RBAC](/glossary/rbac/) system through the Prismatic Web authentication layer. All LiveView routes under `/dd/*` require authenticated sessions. API-level access control is enforced through the platform's [plug](/glossary/plug/) pipeline.

## 8. Operational Considerations

### 8.1 Deployment

Prismatic DD deploys as part of the Prismatic [umbrella application](/glossary/umbrella-application/). No additional infrastructure is required -- the application uses only ETS (in-memory) and the local filesystem. The `priv/data/` directory must be writable and should be included in backup procedures.

### 8.2 Monitoring

[Supervision tree](/glossary/supervision-tree/) health is monitored through standard OTP mechanisms. Each GenServer emits [telemetry](/glossary/telemetry/) events for CRUD operations, enabling dashboards to track entity creation rates, relationship density, and case lifecycle transitions.

### 8.3 Troubleshooting

| Symptom | Cause | Resolution |
|---------|-------|------------|
| Empty entity list after restart | `priv/data/entities/` directory missing or unreadable | Verify directory permissions; check GenServer logs for file I/O errors |
| Graph traversal returns empty | Entity has no relationships | Verify relationships exist with `PrismaticDd.relationships_for(entity_id)` |
| Case entities not showing | Entities not added to case | Use `PrismaticDd.add_entity_to_case/2` to associate entities |
| Slow search operations | Large entity count with full-text scan | Consider adding [Meilisearch](/glossary/meilisearch/) integration for text search offloading |

## 9. Future Work

Planned enhancements include Meilisearch integration for full-text entity search across large datasets, graph visualization using D3.js force-directed layouts in the LiveView graph explorer, integration with the OSINT pipeline for automated entity enrichment, and timeline views showing investigation progress and entity modification history. The storage layer may be extended with optional [PostgreSQL](/glossary/postgresql/) backing for multi-node deployments requiring shared state.

## 10. References

### Related Applications

- [Prismatic Web](/apps/prismatic-web/) -- LiveView dashboard host for DD interfaces
- [Prismatic OSINT Sources](/apps/prismatic-osint-sources/) -- Intelligence sources feeding DD entity analysis
- [Prismatic Hawkeye](/apps/prismatic-hawkeye/) -- Visitor intelligence complementing DD investigations
- [Prismatic Perimeter](/apps/prismatic-perimeter/) -- [EASM](/glossary/easm/) [security rating](/glossary/security-rating/)s using DD entity data
- [Prismatic Agents](/apps/prismatic-agents/) -- Agent orchestration for automated investigation workflows

### Related Sections

- [Architecture](/architecture/) -- Platform-wide architectural patterns
- [OSINT Sources](/osint/) -- Intelligence source catalog
- [Glossary](/glossary/) -- Platform terminology reference

## Related Agents

- [Competitor Researcher](/agents/competitor-researcher/) -- Leverages due diligence investigation capabilities for competitive intelligence gathering and corporate structure analysis
- [Evidence Enforcement Agent](/agents/evidence-enforcement-agent/) -- Ensures investigation entities carry proper provenance, analysis attribution, and evidence chain integrity
- [Alert Management Specialist](/agents/alert-management-specialist/) -- Configures alerting for case lifecycle transitions, risk level escalations, and investigation deadline management

## Related Capabilities

- [Intelligence Synthesis](/capabilities/intelligence-synthesis/) -- Combines multi-source entity analysis from OSINT agents into comprehensive due diligence investigation profiles
- [NABLA Axioms](/capabilities/nabla-axioms/) -- Enforces signal plurality and contradiction preservation for investigation findings across multiple intelligence sources
- [Trinity Gate](/capabilities/trinity-gate/) -- Verifies structural and logical consistency of relationship graphs and entity attribution claims in investigations

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)