+++
title = "WebSockets"
weight = 72
[extra]
category = "protocol"
description = "Full-duplex communication protocol enabling persistent real-time data exchange between client and server"
url = "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API"
version = "RFC 6455"
icon = "websocket"
color = "blue"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 979
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["WebSockets", "Full-duplex", "technologies", "protocol", "Prismatic Platform", "WebSocket", "LiveView", "Phoenix", "HTTP"]
tags = ["technologies", "protocol", "websockets", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "WebSockets - Prismatic Platform"
+++

## Overview

WebSockets provide the real-time communication backbone for the Prismatic Platform, enabling persistent bidirectional connections between browsers and the [Phoenix](/technologies/phoenix/) server. Every [Phoenix LiveView](/technologies/phoenix-liveview/) dashboard, real-time agent status display, and security monitoring interface relies on WebSocket connections to receive instant updates without polling. The protocol's persistent connection model eliminates the overhead of repeated HTTP handshakes, enabling sub-millisecond message delivery after the initial connection is established.

The Prismatic Platform leverages Phoenix Channels atop WebSockets for structured real-time messaging with topic-based routing. When a security scan discovers a new vulnerability, when an agent changes status, or when a compliance score updates, the information is pushed to all connected clients through WebSocket channels in milliseconds. This push-based architecture means dashboards always display current data without the latency and bandwidth waste of periodic polling.

The [BEAM](/technologies/beam/)'s lightweight process model means each WebSocket connection is handled by a dedicated process consuming only ~2KB of memory, enabling the platform to maintain tens of thousands of concurrent real-time connections on modest hardware. This process-per-connection model also provides natural isolation: a slow or crashed client connection cannot affect other connections, and the [Supervisor](/technologies/supervisor/) automatically cleans up resources when connections terminate.

## Key Features

- **Full-Duplex**: Simultaneous bidirectional data transmission -- both client and server can send messages at any time without waiting for the other
- **Persistent Connection**: Single TCP connection maintained for the entire session, eliminating per-message connection overhead
- **Low Latency**: Sub-millisecond message delivery after connection establishment, with no HTTP header overhead per message
- **Binary and Text Frames**: Support for both text (JSON) and binary (Protocol Buffers, MessagePack) message formats
- **HTTP Upgrade**: Initial HTTP handshake with protocol upgrade ensures compatibility with existing infrastructure (proxies, load balancers)
- **Heartbeat**: Keep-alive mechanism with configurable interval for connection health monitoring and automatic dead connection cleanup
- **Multiplexing**: Multiple logical channels over a single WebSocket connection through Phoenix's topic-based routing
- **Compression**: Per-message deflate extension (RFC 7692) for reducing bandwidth on text-heavy messages

## Platform Integration

WebSockets power all real-time features through Phoenix Channels and LiveView. The security channel demonstrates the pattern for domain-specific real-time communication:

```elixir
defmodule PrismaticWeb.SecurityChannel do
  use PrismaticWeb, :channel

  @doc "Join a domain-specific security channel"
  def join("security:" <> domain, _params, socket) do
    send(self(), :send_initial_state)
    {:ok, assign(socket, :domain, domain)}
  end

  @doc "Push initial state to newly connected clients"
  def handle_info(:send_initial_state, socket) do
    rating = PrismaticPerimeter.current_rating(socket.assigns.domain)
    assets = PrismaticPerimeter.list_assets(socket.assigns.domain)

    push(socket, "security_update", %{
      rating: rating,
      asset_count: length(assets),
      last_scan: PrismaticPerimeter.last_scan_time(socket.assigns.domain)
    })
    {:noreply, socket}
  end

  @doc "Handle real-time vulnerability discoveries"
  def handle_info({:vulnerability_found, vuln}, socket) do
    push(socket, "new_vulnerability", %{
      id: vuln.id,
      severity: vuln.severity,
      title: vuln.title,
      cvss_score: vuln.cvss_score,
      discovered_at: vuln.discovered_at
    })
    {:noreply, socket}
  end

  @doc "Handle client-initiated scan requests"
  def handle_in("request_scan", %{"domain" => domain}, socket) do
    case PrismaticPerimeter.request_scan(domain) do
      {:ok, scan_id} -> {:reply, {:ok, %{scan_id: scan_id}}, socket}
      {:error, reason} -> {:reply, {:error, %{reason: reason}}, socket}
    end
  end
end
```

LiveView uses WebSockets transparently through the LiveView socket configuration:

```elixir
defmodule PrismaticWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :prismatic_web

  # LiveView WebSocket endpoint
  socket "/live", Phoenix.LiveView.Socket,
    websocket: [
      connect_info: [:peer_data, :uri, :x_headers],
      timeout: 45_000,
      compress: true
    ]

  # Custom channel WebSocket endpoint
  socket "/socket", PrismaticWeb.UserSocket,
    websocket: [
      timeout: 45_000,
      check_origin: ["https://prismatic-prod.fly.dev"]
    ],
    longpoll: false
end
```

Client-side connection with automatic reconnection and error handling:

```javascript
// Phoenix Socket client configuration
const socket = new Socket("/live", {
    params: { _csrf_token: csrfToken },
    longPollFallbackMs: 2500,
    heartbeatIntervalMs: 30000
});

socket.onOpen(() => console.log("WebSocket connected"));
socket.onClose(() => console.log("WebSocket disconnected"));
socket.onError((err) => console.error("WebSocket error:", err));
socket.connect();
```

## Architecture

WebSockets operate at the transport layer of the platform's real-time stack, connecting browser clients to the server-side event system.

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| **Browser** | Phoenix.js Socket client | Connection management, reconnection, heartbeat |
| **Network** | TCP + WebSocket upgrade | Persistent bidirectional connection |
| **HTTP Server** | Bandit adapter | WebSocket upgrade handling, frame parsing |
| **Endpoint** | `PrismaticWeb.Endpoint` | Socket routing, authentication |
| **Channels** | Topic-based handlers | Message routing, state management |
| **LiveView** | `Phoenix.LiveView.Socket` | Server-rendered UI updates |
| **PubSub** | [Phoenix PubSub](/technologies/pubsub/) | Cross-process event distribution |
| **Processes** | BEAM processes | One process per connection (~2KB) |

Connection lifecycle:

```
Browser -> HTTP GET /live/websocket -> 101 Upgrade -> WebSocket established
     |                                                        |
     |<-- heartbeat (30s interval) --->|<-- heartbeat ------->|
     |                                                        |
     |<----- push: DOM patches, events, channel messages ---->|
     |                                                        |
     |-- close/disconnect ------> process cleanup, unsubscribe
```

## Performance Characteristics

WebSocket performance on the BEAM is exceptionally efficient due to the lightweight process model.

| Metric | Value | Notes |
|--------|-------|-------|
| Connection memory | ~2KB | Per WebSocket process (BEAM process overhead) |
| LiveView connection memory | ~50KB | Process + assigns + template state |
| Message latency (server to client) | <1ms | After connection established |
| Message latency (cross-node) | <5ms | Via PubSub + Distributed Erlang |
| Concurrent connections | 50,000+ | Per node, 4GB RAM |
| Heartbeat interval | 30 seconds | Configurable per socket |
| Reconnection time | ~500ms | Automatic with exponential backoff |
| Connection upgrade latency | <10ms | HTTP to WebSocket upgrade |
| Message throughput | 100,000+ msg/s | Per node, small messages |

## Configuration

```elixir
# WebSocket endpoint configuration
config :prismatic_web, PrismaticWeb.Endpoint,
  url: [host: "localhost"],
  check_origin: ["https://prismatic-prod.fly.dev", "https://prismatic-reality.com"]

# Socket-level configuration in Endpoint module
socket "/live", Phoenix.LiveView.Socket,
  websocket: [
    connect_info: [:peer_data, :uri, :x_headers],
    timeout: 45_000,
    compress: true,
    fullsweep_after: 20  # GC optimization for long-lived connections
  ]

socket "/socket", PrismaticWeb.UserSocket,
  websocket: [timeout: 45_000],
  longpoll: false
```

Nginx proxy configuration for WebSocket pass-through:

```nginx
location /live/websocket {
    proxy_pass http://phoenix_upstream;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 300s;
}
```

## Best Practices

- **Enable compression for text messages** -- `compress: true` reduces bandwidth for JSON-heavy LiveView patches and channel messages
- **Set appropriate timeouts** -- 45-second timeout with 30-second heartbeat catches dead connections without false positives from brief network interruptions
- **Check origin in production** -- `check_origin` prevents WebSocket hijacking from malicious sites by whitelisting allowed connection origins
- **Use `fullsweep_after`** -- setting a low `fullsweep_after` value triggers garbage collection more aggressively on long-lived WebSocket processes, preventing memory bloat
- **Prefer LiveView over raw channels** -- LiveView provides a higher-level abstraction with automatic DOM patching; use raw channels only for non-UI real-time features
- **Handle reconnection gracefully** -- design client-side code to re-subscribe to channels and refresh state after reconnection, as the server process state is lost
- **Monitor connection counts** -- track concurrent WebSocket connections per node to anticipate scaling needs and detect connection leaks

## Comparison with Alternatives

| Feature | WebSockets | Server-Sent Events (SSE) | HTTP Long Polling | gRPC Streaming |
|---------|-----------|--------------------------|-------------------|---------------|
| Direction | Bidirectional | Server to client only | Simulated bidirectional | Bidirectional |
| Connection | Persistent TCP | Persistent HTTP | Repeated HTTP requests | Persistent HTTP/2 |
| Overhead | Low (2-byte frame header) | Low (event format) | High (HTTP headers per poll) | Low (HTTP/2 frames) |
| Browser support | Universal | Universal | Universal | Requires grpc-web proxy |
| Binary support | Yes (binary frames) | No (text only) | No (HTTP response) | Yes (Protocol Buffers) |
| Phoenix integration | Native (Channels + LiveView) | Via Plug | Built-in fallback | Via library |
| Platform usage | Primary real-time transport | Not used | Fallback for WebSocket | Not used |

WebSockets are the platform's primary real-time transport because they provide bidirectional communication with minimal per-message overhead, and Phoenix provides native WebSocket support through Channels and LiveView with no additional dependencies.

The BEAM's process-per-connection model provides natural backpressure and resource isolation for WebSocket connections. If a particular client's connection becomes slow due to network conditions, the associated BEAM process mailbox accumulates messages without affecting other connections. The platform can monitor mailbox sizes and selectively drop non-critical updates for slow clients while maintaining real-time delivery for healthy connections. This graceful degradation under load is a significant advantage over event-loop-based WebSocket implementations, where a single slow connection can impact all other connections sharing the same event loop. The platform also leverages WebSocket compression for LiveView patches, reducing bandwidth consumption by up to 80% for text-heavy dashboard updates.

## Related Technologies

- [Phoenix LiveView](/technologies/phoenix-liveview/) - Uses WebSockets for real-time server-rendered UI
- [Phoenix PubSub](/technologies/pubsub/) - Message distribution to WebSocket-connected processes
- [Phoenix Framework](/technologies/phoenix/) - Channel implementation and WebSocket endpoint management
- [BEAM VM](/technologies/beam/) - Process-per-connection model enabling massive concurrency
- [Supervisor](/technologies/supervisor/) - Fault tolerance for WebSocket connection processes
- [Nginx](/technologies/nginx/) - WebSocket proxy support for reverse proxy deployments

## Related Apps

- [prismatic_web](/apps/prismatic-web/) - All real-time interfaces using LiveView and Channels over WebSockets
- [prismatic_perimeter](/apps/prismatic-perimeter/) - Security monitoring dashboards with real-time updates
- [prismatic_agents](/apps/prismatic-agents/) - Agent status broadcasting through WebSocket channels

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)