+++
title = "/deploy-meilisearch"
weight = 940
[extra]
category = "Operations"
description = "Meilisearch instance deployment and configuration"
syntax = "/deploy-meilisearch [options]"
authority = "L3"
agent = "meilisearch-deployment-agent"
status = "Production"
usage = "low"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 849
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["deploy-meilisearch", "Meilisearch", "commands", "Operations", "Prismatic Platform", "Docker", "Elixir", "Production"]
tags = ["commands", "operations", "deploy-meilisearch", "prismatic"]
quality_score = 80
see_also = ["agents", "glossary", "capabilities"]
image = "/images/sections/commands.png"
image_alt = "/deploy-meilisearch - Prismatic Platform"
+++

## Overview

The **/deploy-meilisearch** command manages the complete lifecycle of [Meilisearch](/glossary/meilisearch/) search engine instances across the Prismatic Platform's deployment environments. Meilisearch provides the platform's full-text search capabilities, powering real-time search across business entities, OSINT intelligence data, agent registries, and documentation indexes. This command handles installation, configuration, index creation, health validation, and integration with the platform's storage adapter layer.

Meilisearch serves as the search backbone for several critical platform capabilities. The Czech Autocrawler indexes business entities in real-time for instant search across thousands of corporate records. The agent registry enables rapid lookup across 400+ agents by name, capability, or domain. The documentation system provides full-text search across 11,000+ documentation files. Without a properly configured Meilisearch instance, these capabilities degrade to sequential scanning, reducing search performance by orders of magnitude.

This command operates under the **L3** authority level and is executed by the `meilisearch-deployment-agent` agent. It is part of the platform's 216-command slash command [registry](/glossary/registry-otp/), built on the [AIAD](/glossary/aiad/) (Autonomous Intelligence Agent Design) standard. The L3 authority level reflects the infrastructure-level impact of search engine deployment -- misconfiguration can affect multiple platform subsystems simultaneously.

The deployment process follows a five-phase protocol: prerequisites verification (Docker availability, port allocation, key management), instance deployment (container or native service), configuration (index creation, search settings, filterable/sortable attributes), validation (health checks, connectivity tests, search functionality verification), and integration (runtime configuration update, storage adapter registration, platform connectivity confirmation). Each phase includes rollback procedures in case of failure.

## Architecture

### Deployment Architecture

```
MEILISEARCH DEPLOYMENT
=======================

PREREQUISITES
    +-- Docker engine availability check
    +-- Port 7700 allocation verification
    +-- Master key generation/validation
    +-- Data volume preparation
    |
    v
DEPLOYMENT
    +-- Docker image pull (getmeili/meilisearch)
    +-- Container configuration
    +-- Volume mounting (meili_data)
    +-- Environment variable injection
    |
    v
CONFIGURATION
    +-- Index creation (czech_business_entities, agents, docs)
    +-- Filterable attributes setup
    +-- Sortable attributes setup
    +-- Search ranking rules configuration
    +-- Synonyms and stop words
    |
    v
VALIDATION
    +-- Health endpoint check (/health)
    +-- Search functionality test
    +-- Index status verification
    +-- Performance benchmark
    |
    v
INTEGRATION
    +-- Runtime config update (config/runtime.exs)
    +-- PrismaticStorageMeilisearch adapter registration
    +-- Platform connectivity confirmation
    +-- Telemetry event registration
```

### Environment Configuration

| Environment | App Name | Port | Data Persistence | Master Key |
|-------------|----------|------|-----------------|------------|
| **Development** | meilisearch-dev | 7700 | Local volume | Auto-generated |
| **Staging** | meilisearch-staging | 7700 | Persistent volume | Environment variable |
| **Production** | meilisearch-prod | 7700 | Persistent volume (backed up) | Secrets manager |

## Usage

### Basic Deployment

```bash
# Deploy to development environment (Docker, default settings)
/deploy-meilisearch development

# Deploy to staging with master key
/deploy-meilisearch staging --master-key=$MEILI_MASTER_KEY

# Deploy specific version to production
/deploy-meilisearch production --version=1.6.0
```

### Custom Configuration

```bash
# Deploy on custom port
/deploy-meilisearch development --port=7701

# Deploy without Docker (native binary)
/deploy-meilisearch development --docker=false

# Deploy latest version
/deploy-meilisearch development --version=latest
```

### Validation Only

```bash
# Run health check on existing instance
curl http://localhost:7700/health
# Expected: {"status":"available"}

# Verify index configuration
curl http://localhost:7700/indexes --header "Authorization: Bearer $MEILI_MASTER_KEY"
```

## Options & Parameters

| Parameter | Position/Flag | Required | Type | Default | Description |
|-----------|---------------|----------|------|---------|-------------|
| **environment** | $1 | No | enum | `development` | Target: development, staging, production |
| **--version** | flag | No | string | `latest` | Meilisearch version to deploy |
| **--master-key** | flag | No | string | auto-generated | Master API key for authentication |
| **--port** | flag | No | integer | 7700 | Service port for Meilisearch |
| **--docker** | flag | No | boolean | true | Deploy using Docker container |

## Execution Flow

```
/deploy-meilisearch [environment] [options]
    |
    v
PHASE 1: PREREQUISITES (< 5s)
    +-- Verify Docker availability (if --docker)
    +-- Check port availability (netstat/lsof)
    +-- Generate or validate master key
    +-- Prepare data volume directory
    |
    v
PHASE 2: DEPLOYMENT (< 30s)
    +-- Pull Meilisearch Docker image
    +-- Configure container environment
    +-- Start container with volume mount
    +-- Wait for startup completion
    |
    v
PHASE 3: CONFIGURATION (< 10s)
    +-- Create platform indexes
    +-- Configure filterable attributes
    +-- Set sortable attributes
    +-- Apply search ranking rules
    |
    v
PHASE 4: VALIDATION (< 5s)
    +-- Health check (/health endpoint)
    +-- Test search functionality
    +-- Verify index creation
    +-- Run performance benchmark
    |
    v
PHASE 5: INTEGRATION (< 5s)
    +-- Update runtime.exs configuration
    +-- Register with PrismaticStorageMeilisearch
    +-- Test adapter connectivity
    +-- Emit deployment telemetry event
```

### Docker Command

```bash
docker run -d \
  --name meilisearch \
  -p 7700:7700 \
  -v $(pwd)/meili_data:/meili_data \
  -e MEILI_MASTER_KEY=$MEILI_MASTER_KEY \
  -e MEILI_ENV=production \
  getmeili/meilisearch:latest
```

### Platform Configuration

```elixir
# config/runtime.exs
config :prismatic_storage_meilisearch,
  url: System.get_env("MEILISEARCH_URL", "http://localhost:7700"),
  api_key: System.get_env("MEILISEARCH_API_KEY"),
  timeout: 10_000,
  pool_size: 10
```

## Integration Points

| Component | Relationship | Details |
|-----------|-------------|---------|
| [Prismatic Agents](/glossary/prismatic-agents/) | Executed by `meilisearch-deployment-agent` | Agent manages full deployment lifecycle |
| [AIAD](/glossary/aiad/) Registry | Command specification and discovery | Operations category registration |
| [Quality Gates](/glossary/quality-gates/) | Post-deployment validation | Health checks gate deployment success |
| [Telemetry](/glossary/telemetry/) | Deployment [metrics](/glossary/metrics/) | Deployment time, health status, index counts |
| PrismaticStorageMeilisearch | Storage adapter | Elixir adapter for Meilisearch operations |
| [Czech Autocrawler](/commands/czech-autocrawler-supreme/) | Entity indexing | Real-time entity search index |
| Docker Engine | Container runtime | Container lifecycle management |

### Index Configuration

| Index | Purpose | Filterable | Sortable |
|-------|---------|-----------|----------|
| `czech_business_entities` | Business entity search | region, industry, legal_form, status | name, created_at, revenue |
| `agents` | Agent registry search | domain, authority, status, category | name, priority |
| `documentation` | Documentation search | section, type, app | title, updated_at |
| `osint_intelligence` | OSINT data search | source, confidence, type | timestamp, relevance |

## Best Practices

1. **Always use master keys in non-development environments** -- Auto-generated keys are acceptable for local development, but staging and production must use environment-managed keys stored in secrets managers.

2. **Back up data volumes before upgrades** -- Meilisearch data volumes contain all indexed data. Back up `meili_data/` before deploying new versions to enable quick recovery.

3. **Monitor index sizes** -- Large indexes (100K+ documents) require more memory. Monitor Meilisearch memory usage and scale resources accordingly.

4. **Use version pinning in production** -- Always specify explicit versions for production deployments (`--version=1.6.0`) rather than using `latest` to prevent unexpected behavior changes.

5. **Test search quality after deployment** -- Run representative search queries after deployment to verify that search ranking, filtering, and sorting behave as expected.

6. **Configure appropriate timeouts** -- The default 10-second timeout in the Elixir adapter is suitable for most queries. Increase for complex faceted searches or large result sets.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `DOCKER_NOT_FOUND` | Docker engine not installed or not running | Install Docker or start Docker daemon |
| `PORT_IN_USE` | Port 7700 already allocated | Use `--port` to specify alternative port, or stop existing service |
| `IMAGE_PULL_FAILED` | Cannot pull Meilisearch Docker image | Check network connectivity; verify image name and version |
| `HEALTH_CHECK_FAILED` | Instance started but not responding | Check container logs; verify port mapping; check master key |
| `INDEX_CREATION_FAILED` | Cannot create required indexes | Check API key permissions; verify Meilisearch version compatibility |
| `ADAPTER_CONNECTION_FAILED` | Elixir adapter cannot connect | Verify URL and API key in runtime.exs; check network connectivity |

### Troubleshooting

```bash
# Check container status
docker ps -a | grep meilisearch

# View container logs
docker logs meilisearch

# Test direct connectivity
curl -v http://localhost:7700/health

# Test authenticated access
curl http://localhost:7700/indexes \
  --header "Authorization: Bearer $MEILI_MASTER_KEY"

# Restart container
docker restart meilisearch
```

## Advanced Usage

### Multi-Index Management

```elixir
# Create a custom index programmatically
{:ok, _} = PrismaticStorageMeilisearch.create_index("custom_index", %{
  primary_key: "id",
  filterable_attributes: ["category", "status"],
  sortable_attributes: ["created_at", "score"],
  ranking_rules: ["words", "typo", "proximity", "attribute", "sort", "exactness"]
})

# Bulk index documents
documents = [%{id: 1, title: "Doc 1"}, %{id: 2, title: "Doc 2"}]
{:ok, task} = PrismaticStorageMeilisearch.add_documents("custom_index", documents)

# Search with filters
{:ok, results} = PrismaticStorageMeilisearch.search("custom_index", "query",
  filter: "category = 'intelligence'",
  sort: ["created_at:desc"],
  limit: 20
)
```

### Production Deployment Checklist

```
[ ] Master key configured via secrets manager
[ ] Data volume mounted on persistent storage
[ ] Backup procedure verified
[ ] Health monitoring configured
[ ] Memory limits set (--memory flag)
[ ] Version pinned to specific release
[ ] Indexes created and verified
[ ] Search quality validated
[ ] Adapter connectivity confirmed
[ ] Telemetry events flowing
```

### Performance Tuning

| Setting | Development | Staging | Production |
|---------|------------|---------|------------|
| Max indexing memory | 200MB | 500MB | 2GB |
| Max indexing threads | 2 | 4 | 8 |
| Log level | debug | info | warn |
| Snapshot interval | disabled | 24h | 6h |

## Doctrine Compliance

All commands operate under the **[NO MERCY, NO DOUBTS](/glossary/no-mercy-no-doubts/)** doctrine:

- **NO MERCY**: Zero tolerance for unhealthy Meilisearch instances. Every deployment must pass health validation before being declared successful. No partial deployments. No skipped configuration steps.
- **NO DOUBTS**: Full health verification through active probing. Search functionality tested with real queries. Index creation confirmed through API verification. Integration validated end-to-end from Elixir adapter through to search results.

## Related Commands

- [/deploy](/commands/deploy/) - Deployment to staging environment via [GitLab CI](/glossary/gitlab-ci/)/CD
- [/deploy-unified](/commands/deploy-unified/) - Safe validated traceable deployment for all environments
- [/deploy-production](/commands/deploy-production/) - Production deployment to [Fly.io](/glossary/fly-io/) with safety checks
- [/czech-autocrawler-supreme](/commands/czech-autocrawler-supreme/) - Czech Registry intelligence (uses Meilisearch indexes)
- [/connect](/commands/connect/) - MCP server connection management across 14+ servers
- [/agents](/commands/agents/) - List and manage agent ecosystem with status monitoring

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)