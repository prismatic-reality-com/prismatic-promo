+++
title = "Nginx"
weight = 53
[extra]
category = "infrastructure"
description = "High-performance reverse proxy, load balancer, and HTTP cache for production traffic management"
url = "https://nginx.org"
version = "1.25+"
icon = "nginx"
color = "green"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 1202
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Nginx", "High-performance", "HTTP", "technologies", "infrastructure", "Prismatic Platform", "Phoenix", "Full", "WebSocket"]
tags = ["technologies", "infrastructure", "nginx", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Nginx - Prismatic Platform"
+++

## Overview

Nginx serves as the reverse proxy and load balancer in the Prismatic Platform's production infrastructure. It handles TLS termination, HTTP/2 multiplexing, WebSocket upgrade, static asset serving, and request routing to the platform's [Phoenix](@/technologies/phoenix.md) application servers running behind it. Nginx is the first point of contact for every external request to the platform, making its configuration critical for both performance and security.

The Prismatic Platform uses Nginx for its ability to handle tens of thousands of concurrent connections with minimal resource usage. Nginx efficiently serves static assets (CSS, JavaScript, images) directly while proxying dynamic requests to the Phoenix application, reducing load on the [BEAM](@/technologies/beam.md) VM for non-application traffic. In production on [Fly.io](@/technologies/flyio.md), Nginx sits at the edge and distributes requests across multiple application instances, providing a layer of request buffering and connection management that protects the application from traffic spikes.

Nginx's WebSocket proxy support is critical for the platform's [Phoenix LiveView](@/technologies/phoenix-liveview.md) and Channel connections, which require long-lived bidirectional connections between the browser and server. Without proper WebSocket upgrade handling, real-time dashboards and agent coordination would fail silently. The platform's LiveView connections can persist for hours during security monitoring sessions, and Nginx must maintain these connections without timeout interruption.

## Key Features

- **Reverse Proxy**: Route requests to upstream application servers with health checking and automatic failover
- **Load Balancing**: Round-robin, least-connections, and IP-hash strategies for multi-instance deployments
- **TLS Termination**: SSL/TLS handling with HTTP/2 support, offloading encryption from the application
- **WebSocket Proxy**: Bidirectional WebSocket connection forwarding with proper upgrade headers and long timeouts
- **Static File Serving**: Efficient direct serving with cache headers, gzip, and brotli compression
- **Rate Limiting**: Request rate limiting and connection throttling to protect the application from abuse
- **Caching**: Response caching for API endpoints that change infrequently
- **Security Headers**: Content-Security-Policy, X-Frame-Options, and other security headers injected at the proxy level

## Platform Integration

Nginx proxies traffic to the Phoenix application servers with separate handling for standard HTTP, WebSocket connections, and the API gateway.

```nginx
upstream prismatic_web {
    least_conn;
    server 127.0.0.1:4000;
    server 127.0.0.1:4001;
    keepalive 32;
}

upstream prismatic_api {
    server 127.0.0.1:4004;
    keepalive 16;
}

server {
    listen 443 ssl http2;
    server_name prismatic-prod.fly.dev;

    ssl_certificate /etc/ssl/certs/prismatic.pem;
    ssl_certificate_key /etc/ssl/private/prismatic.key;
    ssl_protocols TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Static assets with aggressive caching
    location /assets/ {
        root /app/priv/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }

    # LiveView WebSocket connections
    location /live {
        proxy_pass http://prismatic_web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
    }

    # API gateway with rate limiting
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://prismatic_api;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
    }

    # Default application proxy
    location / {
        proxy_pass http://prismatic_web;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-Id $request_id;
    }
}
```

## Architecture

Nginx operates at the edge of the platform's infrastructure, sitting between external clients and the Phoenix application servers.

| Traffic Type | Nginx Handling | Upstream | Timeout |
|-------------|---------------|----------|---------|
| Static assets | Served directly from disk | None (direct) | N/A |
| HTML pages | Proxied to Phoenix | prismatic_web (4000) | 60s |
| LiveView WebSocket | Proxied with upgrade | prismatic_web (4000) | 86400s (24h) |
| REST API | Proxied with caching | prismatic_api (4004) | 30s |
| GraphQL | Proxied | prismatic_web (4000) | 60s |
| Health checks | Direct response or proxy | prismatic_web (4000) | 5s |

The request flow through Nginx follows a deterministic routing pattern.

| Step | Action | Configuration |
|------|--------|---------------|
| 1 | TLS termination | `ssl_protocols TLSv1.3` |
| 2 | HTTP/2 demultiplexing | `listen 443 ssl http2` |
| 3 | Rate limit check | `limit_req zone=api` |
| 4 | Location matching | `location /api/`, `/live`, `/assets/`, `/` |
| 5 | Static file check | `try_files $uri @proxy` (for static assets) |
| 6 | Upstream proxy | `proxy_pass http://upstream` |
| 7 | Response caching | `proxy_cache api_cache` |
| 8 | Response delivery | Compressed if supported |

## Request Buffering and Slow-Client Protection

Nginx's request buffering capability plays an important role in protecting the Phoenix application from slow-client attacks. By fully buffering incoming request bodies before forwarding them to the upstream, Nginx prevents slow POST requests from tying up Phoenix handler processes for extended periods. This is especially valuable for the API gateway, where large payloads from automated integrations could otherwise exhaust the connection pool.

The platform configures Nginx to buffer both request bodies and response bodies, ensuring that the connection between Nginx and the Phoenix upstream is held open only for the duration of actual request processing. The upstream connection is released immediately after the response is received, even if the client is downloading the response slowly over a low-bandwidth connection. This buffering strategy effectively multiplexes many slow client connections through a small pool of fast upstream connections.

```nginx
# Request and response buffering for upstream protection
proxy_request_buffering on;
proxy_buffering on;
proxy_buffer_size 16k;
proxy_buffers 8 16k;
proxy_busy_buffers_size 32k;
client_body_buffer_size 128k;
```

## Health Checking and Failover

In the platform's multi-instance deployment, Nginx performs passive health checking on upstream servers. When an upstream server fails to respond or returns an error, Nginx temporarily removes it from the load balancing rotation and redirects traffic to healthy instances. This failover mechanism is transparent to clients, who experience at most a brief increase in latency while the request is retried on a healthy backend.

The health check configuration works in conjunction with Fly.io's own health monitoring, providing a layered health checking strategy that catches both application-level failures (detected by Nginx) and infrastructure-level failures (detected by Fly.io).

## Performance Characteristics

Nginx's performance characteristics directly impact the platform's ability to meet the 250ms page load requirement defined by the [quality gates](@/capabilities/quality-gates.md).

| Metric | Value | Notes |
|--------|-------|-------|
| Concurrent connections | 10,000+ | Per worker process |
| Static asset response | < 5ms | From disk with sendfile |
| Proxy overhead | < 2ms | Added latency per proxied request |
| TLS handshake | < 30ms | TLSv1.3 with session resumption |
| WebSocket upgrade | < 5ms | HTTP upgrade to WebSocket |
| Gzip compression ratio | 5-10x | For text/html, text/css, application/json |
| Memory per connection | ~8 KB | Nginx event-driven architecture |
| Worker processes | Auto (CPU count) | `worker_processes auto` |

The low proxy overhead (~2ms) is critical because it is added to every request. With the platform's 100ms server-side render target, the Nginx proxy layer consumes less than 2% of the total latency budget.

## Configuration

Performance tuning is critical for handling the platform's concurrent WebSocket connections alongside standard HTTP traffic.

```nginx
# /etc/nginx/nginx.conf - performance tuning
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    multi_accept on;
    use epoll;
}

http {
    keepalive_timeout 65;
    client_max_body_size 10m;
    server_tokens off;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml image/svg+xml;
    gzip_min_length 1000;
    gzip_vary on;
    gzip_proxied any;

    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/s;

    # Cache zones
    proxy_cache_path /var/cache/nginx/api levels=1:2
                     keys_zone=api_cache:10m max_size=1g
                     inactive=60m use_temp_path=off;

    # Logging
    log_format json escape=json '{'
        '"time": "$time_iso8601",'
        '"remote_addr": "$remote_addr",'
        '"request": "$request",'
        '"status": $status,'
        '"body_bytes_sent": $body_bytes_sent,'
        '"request_time": $request_time,'
        '"upstream_response_time": "$upstream_response_time"'
    '}';

    access_log /var/log/nginx/access.log json;
}
```

## Security Hardening

The Nginx configuration includes several security hardening measures beyond basic TLS:

| Measure | Configuration | Purpose |
|---------|--------------|---------|
| Version hiding | `server_tokens off` | Prevent version disclosure in headers |
| HSTS | `Strict-Transport-Security` header | Force HTTPS for all subsequent requests |
| Content sniffing | `X-Content-Type-Options: nosniff` | Prevent MIME-type sniffing attacks |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` | Prevent embedding in foreign iframes |
| Referrer control | `Referrer-Policy: strict-origin-when-cross-origin` | Limit referrer information leakage |
| Body size limit | `client_max_body_size 10m` | Prevent large-payload DoS attacks |
| Login rate limit | `limit_req zone=login rate=5r/s` | Prevent brute-force authentication attacks |

## Best Practices

- **Use `least_conn` for upstream balancing** -- distributes load more evenly than round-robin when request processing times vary
- **Set long `proxy_read_timeout` for WebSockets** -- LiveView connections are long-lived and should not be terminated by default timeouts; use 86400s (24 hours)
- **Enable `gzip_static`** -- serve pre-compressed assets from the Phoenix digest pipeline without CPU overhead
- **Configure proper `X-Forwarded` headers** -- Phoenix needs these to generate correct URLs and enforce HTTPS redirects
- **Rate limit API endpoints** -- protect the platform from abuse with `limit_req` zones; use separate zones for different endpoint sensitivity levels
- **Use JSON logging** -- structured JSON logs integrate with the platform's monitoring stack for request tracing
- **Set `server_tokens off`** -- do not expose the Nginx version in response headers for security
- **Enable TLSv1.3 only** -- older TLS versions have known vulnerabilities; the platform enforces TLSv1.3 exclusively

## Comparison with Alternatives

| Feature | Nginx | Caddy | HAProxy | Envoy | Traefik |
|---------|-------|-------|---------|-------|---------|
| Static File Serving | Excellent | Good | None | None | None |
| WebSocket Support | Full | Full | Full | Full | Full |
| Configuration | Static files | Caddyfile | Static files | YAML/xDS | YAML/labels |
| Auto TLS | Module | Built-in | No | No | Built-in |
| HTTP/2 | Full | Full | Full | Full | Full |
| Load Balancing | Multiple strategies | Round-robin | Advanced | Advanced | Multiple |
| Performance | Excellent | Good | Excellent | Good | Good |
| Memory Usage | Very low | Low | Very low | Moderate | Low |
| Elixir Community | Standard | Growing | Used | Kubernetes-focused | Docker-focused |

Nginx was chosen for its combination of proven reliability, minimal resource usage, excellent static file serving, and broad community knowledge. Its static configuration model is simpler to reason about than dynamic service discovery systems for the platform's deployment scale.

## Related Technologies

- [Phoenix](@/technologies/phoenix.md) - Application server behind Nginx
- [Fly.io](@/technologies/flyio.md) - Deployment platform hosting the Nginx instances
- [Docker](@/technologies/docker.md) - Nginx container in the production stack
- [Phoenix LiveView](@/technologies/phoenix-liveview.md) - WebSocket connections proxied through Nginx
- [TailwindCSS](@/technologies/tailwindcss.md) - Static CSS assets served by Nginx
- [SSL/TLS](@/technologies/ssl-tls.md) - TLS termination handled at the Nginx layer

## Related Apps

- Infrastructure layer serving all Prismatic Platform web applications
- [prismatic_web](@/apps/prismatic-web.md) - Primary upstream application receiving proxied requests
- [prismatic_api](@/apps/prismatic-api.md) - API gateway upstream with rate limiting and caching

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)