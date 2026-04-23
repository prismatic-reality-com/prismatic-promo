+++
title = "Fly.io"
weight = 12
[extra]
category = "infrastructure"
description = "Edge deployment platform hosting Prismatic production and staging environments with global distribution and automatic scaling."
related_terms = ["docker", "cluster", "release", "gitlab-ci"]
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
word_count = 997
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Flyio", "Edge", "Prismatic", "glossary", "infrastructure", "Prismatic Platform", "BEAM", "Erlang", "WireGuard"]
tags = ["glossary", "infrastructure", "flyio", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Fly.io - Prismatic Platform"
+++

## Definition

Fly.io is a platform-as-a-service that runs applications in lightweight Firecracker microVMs at edge locations worldwide. Unlike traditional cloud platforms that deploy to a single data center region, Fly.io distributes application instances across a global network of 30+ regions, running each instance in a dedicated microVM rather than a shared container environment. This architecture provides the security isolation of virtual machines with startup times measured in milliseconds, combining the best properties of containers and VMs.

Fly.io is particularly well-suited for Elixir and Erlang applications because it provides native support for Erlang distribution -- the built-in clustering protocol that allows [BEAM](/glossary/beam/) nodes to form a mesh and communicate transparently. Fly.io's WireGuard-based private network (6PN) creates encrypted point-to-point tunnels between all instances in an organization, which Erlang distribution uses as its transport layer. This means that Phoenix [PubSub](/glossary/pubsub/) messages, distributed process registries (like Horde), and [BEAM](/glossary/beam/) process migration all work across Fly.io instances without any custom networking configuration.

Applications deploy to Fly.io via the `flyctl` CLI, which builds the [Docker](/glossary/docker/) image (or uses a pre-built image), distributes it to the specified regions, and manages the rollout strategy. Fly.io provides automatic TLS certificate provisioning, global [load balancing](/glossary/load-balancing/), persistent volumes, managed [PostgreSQL](/glossary/postgresql/), and secrets management as built-in platform features.

## Prismatic Deployment Architecture

The Prismatic Platform deploys to Fly.io with two separate environments:

| Environment | Hostname | Regions | Deploy Trigger | Approval |
|-------------|----------|---------|---------------|----------|
| **Staging** | `prismatic-staging.fly.dev` | Primary: `fra` (Frankfurt) | Automatic on merge to main | None (automatic) |
| **Production** | `prismatic-prod.fly.dev` | Primary: `fra`, Secondary: `cdg` (Paris) | Manual trigger from CI | Required (manual gate) |

### Deployment Flow

```
Developer pushes to main
        |
        v
GitLab CI Pipeline
  |-- Build Docker image (multi-stage)
  |-- Run tests inside image
  |-- Push to GitLab Container Registry
  |
  v
Deploy to Staging (automatic)
  |-- flyctl deploy --app prismatic-staging
  |-- Health check validation
  |-- Smoke tests against staging
  |
  v (manual approval gate)
Deploy to Production
  |-- flyctl deploy --app prismatic
  |-- Rolling deployment (zero downtime)
  |-- Health check validation
  |-- Post-deploy verification
```

## Erlang Clustering on Fly.io

Fly.io's 6PN (IPv6 private network) provides the foundation for BEAM [clustering](/glossary/cluster/). Each Fly.io instance receives a unique IPv6 address on the private network, and instances within the same application can discover each other through DNS:

```elixir
# config/runtime.exs -- Fly.io cluster configuration
if config_env() == :prod do
  # Fly.io provides these environment variables automatically
  app_name = System.fetch_env!("FLY_APP_NAME")
  region = System.fetch_env!("FLY_REGION")

  config :prismatic, PrismaticCluster,
    topologies: [
      fly6pn: [
        strategy: Cluster.Strategy.DNSPoll,
        config: [
          polling_interval: 5_000,
          query: "#{app_name}.internal",
          node_basename: app_name
        ]
      ]
    ]
end
```

### Clustering Capabilities

| Capability | Mechanism | Prismatic Usage |
|-----------|-----------|-----------------|
| **Node Discovery** | DNS polling on `<app>.internal` | Automatic cluster formation on deploy |
| **Phoenix PubSub** | Erlang distribution via 6PN | Real-time dashboard updates across all nodes |
| **Distributed Registry** | Horde (CRDT-based) | Agent process registration across nodes |
| **Process Migration** | BEAM distribution protocol | Agent failover between nodes |
| **Session Affinity** | Fly.io `fly-replay` header | Sticky sessions for [LiveView](/glossary/liveview/) WebSocket connections |

When a new instance starts (during scaling or rolling deployment), it polls DNS to discover existing instances, connects via Erlang distribution over WireGuard, and joins the cluster. [PubSub](/glossary/pubsub/) topics, process registries, and supervision trees then automatically account for the new node.

## Secrets Management

Fly.io provides encrypted secrets management, injecting secrets as environment variables at runtime. Secrets are encrypted at rest and only decrypted inside the running microVM:

```bash
# Set secrets (encrypted, not visible in logs or config)
flyctl secrets set DATABASE_URL="postgresql://..." --app prismatic
flyctl secrets set SECRET_KEY_BASE="$(mix phx.gen.secret)" --app prismatic
flyctl secrets set GITLAB_TOKEN="glpat-..." --app prismatic

# List secrets (values are never displayed)
flyctl secrets list --app prismatic
# NAME              DIGEST                  CREATED AT
# DATABASE_URL      a1b2c3d4e5f6...        2026-01-15
# SECRET_KEY_BASE   f6e5d4c3b2a1...        2026-01-15

# Secrets are available as environment variables in config/runtime.exs
config :prismatic_web, PrismaticWeb.Endpoint,
  secret_key_base: System.fetch_env!("SECRET_KEY_BASE")
```

This approach ensures that secrets never appear in [Docker](/glossary/docker/) images, CI/CD logs, or configuration files.

## Health Checks and Monitoring

Fly.io monitors application health through configurable health checks:

```toml
# fly.toml -- Fly.io application configuration

[http_service]
  internal_port = 4000
  force_https = true

  [[http_service.checks]]
    interval = "10s"
    timeout = "2s"
    grace_period = "30s"
    method = "GET"
    path = "/api/v1/health"

  [http_service.concurrency]
    type = "connections"
    hard_limit = 25000
    soft_limit = 20000
```

| Check Type | Configuration | Purpose |
|-----------|--------------|---------|
| **HTTP health check** | `GET /api/v1/health` every 10s | Verify application is responding |
| **Grace period** | 30s after start | Allow time for BEAM startup and cluster joining |
| **Connection limits** | 25K hard, 20K soft | Trigger scaling before connection saturation |
| **TCP health check** | Port 4000 connectivity | Basic reachability verification |

When health checks fail, Fly.io automatically restarts the instance. If the failure persists, traffic is routed away from the unhealthy instance to healthy ones.

## Scaling and Resource Management

Fly.io provides both vertical scaling (machine size) and horizontal scaling (instance count):

```bash
# Vertical scaling: change machine resources
flyctl machine update --vm-size performance-2x --app prismatic
# performance-2x: 2 vCPU, 4GB RAM

# Horizontal scaling: set instance count per region
flyctl scale count 3 --region fra --app prismatic
flyctl scale count 2 --region cdg --app prismatic

# Auto-scaling configuration
flyctl autoscale set min=2 max=10 --app prismatic
```

| Machine Size | vCPU | RAM | Use Case |
|-------------|------|-----|----------|
| **shared-cpu-1x** | 1 (shared) | 256MB | Development, staging |
| **performance-1x** | 1 (dedicated) | 2GB | Light production |
| **performance-2x** | 2 (dedicated) | 4GB | Standard production |
| **performance-4x** | 4 (dedicated) | 8GB | High-throughput production |

The Prismatic Platform typically runs `performance-2x` instances for production, providing enough memory for the BEAM runtime, all 90 umbrella applications, and the in-memory ETS tables used by the agent system.

## Managed PostgreSQL

Fly.io offers managed PostgreSQL (Fly Postgres) with automatic failover, streaming replication, and point-in-time recovery:

```bash
# Create a PostgreSQL cluster
flyctl postgres create --name prismatic-db --region fra --vm-size performance-2x

# Attach to the application (sets DATABASE_URL secret automatically)
flyctl postgres attach prismatic-db --app prismatic

# Connect for debugging
flyctl postgres connect -a prismatic-db
```

Fly Postgres runs as a separate Fly.io application with its own instances, providing dedicated resources and network isolation from the application tier. The platform uses [TimescaleDB](/glossary/timescaledb/) extensions for time-series data when available.

## Multi-Region Deployment

Fly.io's global edge network enables deploying the Prismatic Platform to multiple regions for reduced latency and geographic redundancy:

```toml
# fly.toml -- Multi-region configuration
[deploy]
  strategy = "rolling"

[[regions]]
  name = "fra"    # Frankfurt (primary)
  count = 3

[[regions]]
  name = "cdg"    # Paris (secondary)
  count = 2
```

| Region | Role | Purpose |
|--------|------|---------|
| **fra** (Frankfurt) | Primary | Main compute, primary database, BEAM cluster leader |
| **cdg** (Paris) | Secondary | Failover, reduced latency for Western Europe |

In a multi-region setup, Fly.io routes requests to the nearest healthy instance using Anycast. For database-dependent requests, the `fly-replay` header can redirect requests to the primary region where the writable database replica lives. Read replicas in secondary regions serve read-heavy workloads with reduced latency.

## Zero-Downtime Deployments

Fly.io implements rolling deployments by default, ensuring zero downtime during releases:

1. New instances start with the updated image
2. Health checks must pass before receiving traffic
3. Traffic is gradually shifted from old to new instances
4. Old instances receive a SIGTERM and begin graceful shutdown
5. [BEAM](/glossary/beam/) processes complete in-flight work during shutdown grace period
6. Old instances terminate after all connections drain

The BEAM's graceful shutdown behavior integrates seamlessly with this process: [Broadway](/glossary/broadway/) pipelines drain their message queues, [LiveView](/glossary/liveview/) connections are cleanly terminated (clients reconnect to new instances automatically), and [Ecto](/glossary/ecto/) database connections are returned to the pool.

## Context in Prismatic

Fly.io is the production hosting platform for the entire Prismatic Platform. Key deployment characteristics:

- **Staging** deploys automatically on every merge to main
- **Production** requires manual approval through GitLab CI/CD
- **Erlang clustering** works out of the box via WireGuard 6PN
- **Secrets** are managed through `flyctl secrets` (never in code or images)
- **Health monitoring** via HTTP checks every 10 seconds
- **Rolling deployments** ensure zero downtime for all releases

## Related Terms

- [Docker](/glossary/docker/) - Container format deployed to Fly.io microVMs
- [Cluster](/glossary/cluster/) - Distributed Erlang cluster enabled by Fly.io 6PN networking
- [Release](/glossary/release/) - OTP release running inside Fly.io instances
- [BEAM](/glossary/beam/) - Virtual machine leveraging Fly.io's clustering support
- [PubSub](/glossary/pubsub/) - Distributed messaging across Fly.io nodes
- [LiveView](/glossary/liveview/) - Real-time UI with session affinity on Fly.io
- [PostgreSQL](/glossary/postgresql/) - Managed database service on Fly.io
- [Load Balancing](/glossary/load-balancing/) - Anycast routing to nearest Fly.io instance
- [TLS](/glossary/tls/) - Automatic certificate provisioning by Fly.io
- [Phoenix](/glossary/phoenix/) - Web framework deployed to Fly.io
- [Distributed System](/glossary/distributed-system/) - Multi-region distributed architecture
- [Broadway](/glossary/broadway/) - Data pipelines with graceful shutdown on deploy

## See Also

- [Architecture](/architecture/) - Platform architecture
- [Technologies](/technologies/) - Technology stack
- [Fault Tolerance](/glossary/fault-tolerance/) - Multi-region resilience through Fly.io
- [Observability](/glossary/observability/) - Monitoring Fly.io deployments

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)