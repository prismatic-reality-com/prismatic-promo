+++
title = "WebSocket"
weight = 21
[extra]
category = "technology"
description = "Full-duplex communication protocol enabling persistent bidirectional connections between client and server over TCP"
related_terms = ["phoenix", "liveview", "channel", "pubsub", "server-sent-events", "tls", "rate-limiting", "cluster"]
tags = ["real-time", "protocol", "networking", "bidirectional", "persistent-connection", "rfc-6455"]
difficulty = "intermediate"
importance = "critical"
ecosystem = "web"
use_cases = ["real-time-dashboards", "live-updates", "collaborative-editing", "streaming-data", "chat"]
prerequisites = ["http", "tcp"]
reading_time_minutes = 14
version = "2.0.0"
last_updated = "2026-02-22"
author = "Tomas Korcak"
platform_relevance = "core"
beam_specific = false
otp_pattern = false
production_tested = true
prismatic_usage = "extensive"
rfc = "6455"
default_port = 80
secure_port = 443
protocol_prefix = "ws://"
secure_prefix = "wss://"
reading_time = "7 min"
word_count = 1430
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["WebSocket", "Full-duplex", "glossary", "technology", "Prismatic Platform", "HTTP", "Server", "Phoenix", "Client"]
quality_score = 80
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "WebSocket - Prismatic Platform"
+++

## Definition

WebSocket is a communication protocol standardized as RFC 6455 that provides full-duplex, persistent, bidirectional message exchange between a client and server over a single TCP connection. Unlike HTTP's request-response model where each interaction requires a new connection (or reuses one through keep-alive with strict request-then-response ordering), WebSocket establishes a long-lived connection through which either party can send messages at any time, independently and simultaneously. This architectural shift from pull-based polling to push-based messaging enables real-time applications -- live dashboards, collaborative editors, chat systems, streaming data feeds, and interactive gaming -- that would be impractical or inefficient with traditional HTTP.

The WebSocket protocol was designed to be complementary to HTTP rather than a replacement. It reuses HTTP's infrastructure (ports 80 and 443, proxy traversal, TLS support) by starting every WebSocket connection as a standard HTTP request that is then "upgraded" to the WebSocket protocol through a handshake mechanism. This design ensures compatibility with existing web infrastructure -- firewalls, load balancers, and CDNs that understand HTTP can typically pass through WebSocket upgrade requests without modification. Once upgraded, the connection operates over raw TCP with minimal framing overhead (as little as 2 bytes per frame), providing dramatically lower latency than HTTP polling or long-polling approaches.

The protocol supports both text and binary message types, enabling applications to transmit structured data (JSON, MessagePack, Protocol Buffers) alongside raw binary payloads (images, audio, video) over the same connection. Built-in ping/pong frames provide connection health monitoring, and close frames enable graceful connection teardown with status codes and reason phrases.

In the Elixir ecosystem, WebSocket is the foundational transport layer for [Phoenix Channels](/glossary/channel/) and [LiveView](/glossary/liveview/), enabling the real-time features that distinguish Phoenix applications from traditional request-response web frameworks.

## Handshake Process

Every WebSocket connection begins with an HTTP upgrade handshake that transitions the connection from HTTP to the WebSocket protocol:

```
Client Request:
GET /socket/websocket HTTP/1.1
Host: prismatic.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Sec-WebSocket-Protocol: phoenix

Server Response:
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: phoenix
```

| Step | Description | Protocol |
|------|-------------|----------|
| **1. HTTP Request** | Client sends GET with `Upgrade: websocket` header | HTTP/1.1 |
| **2. Server Validation** | Server verifies `Sec-WebSocket-Key` and capabilities | HTTP/1.1 |
| **3. 101 Response** | Server responds with `101 Switching Protocols` | HTTP/1.1 |
| **4. Protocol Switch** | Connection upgrades from HTTP to WebSocket | WebSocket |
| **5. Bidirectional** | Both parties can send messages independently | WebSocket |

The `Sec-WebSocket-Key` / `Sec-WebSocket-Accept` exchange prevents caching proxies from mistaking WebSocket traffic for cacheable HTTP responses. The key is a random base64 value, and the accept is its SHA-1 hash concatenated with a magic GUID (`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`), proving the server understands the WebSocket protocol.

### Subprotocol Negotiation

WebSocket supports subprotocol negotiation through the `Sec-WebSocket-Protocol` header. Phoenix uses this to establish the Phoenix-specific messaging format over the raw WebSocket connection:

| Subprotocol | Description | Used By |
|-------------|-------------|---------|
| `phoenix` | Phoenix Channel protocol (JSON-encoded) | Phoenix Channels, LiveView |
| `graphql-ws` | GraphQL over WebSocket | Absinthe Subscriptions |
| `mqtt` | MQTT over WebSocket | IoT device communication |
| `stomp` | Simple Text Oriented Messaging | Message brokers |

## Frame Format

WebSocket messages are transmitted as frames with a lightweight binary header:

| Field | Size | Description |
|-------|------|-------------|
| **FIN** | 1 bit | Final fragment flag (1 = last frame of message) |
| **RSV1-3** | 3 bits | Reserved for extensions (compression) |
| **Opcode** | 4 bits | Frame type (text, binary, close, ping, pong) |
| **MASK** | 1 bit | Masking flag (required for client-to-server) |
| **Payload Length** | 7/16/64 bits | Message size (7-bit, 16-bit extended, or 64-bit extended) |
| **Masking Key** | 0 or 32 bits | XOR mask for payload (client-to-server only) |
| **Payload** | Variable | Application data |

Frame opcodes define the message type:

| Opcode | Type | Purpose |
|--------|------|---------|
| `0x0` | Continuation | Fragment of a multi-frame message |
| `0x1` | Text | UTF-8 encoded text data |
| `0x2` | Binary | Raw binary data |
| `0x8` | Close | Connection close with status code |
| `0x9` | Ping | Connection health check (client or server) |
| `0xA` | Pong | Response to ping |

The minimal frame overhead (2-14 bytes depending on payload size and masking) is a significant advantage over HTTP, where headers alone typically consume 200-800 bytes per request. For applications sending many small messages (real-time updates, telemetry, keystrokes), this overhead reduction translates directly into higher throughput and lower latency.

### Close Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 1000 | Normal | Clean close initiated by either party |
| 1001 | Going Away | Server shutting down or client navigating away |
| 1002 | Protocol Error | Malformed frame or protocol violation |
| 1003 | Unsupported | Received data type the endpoint cannot process |
| 1006 | Abnormal | No close frame received (connection dropped) |
| 1008 | Policy Violation | Message violates server policy |
| 1009 | Too Large | Message exceeds size limit |
| 1011 | Internal Error | Server encountered an unexpected condition |
| 4001 | Auth Expired | Custom: authentication token expired (Phoenix) |

## Connection Lifecycle Management

Production WebSocket deployments require robust lifecycle management to handle network instability, server restarts, and client disconnections:

```elixir
defmodule PrismaticWeb.UserSocket do
  @moduledoc """
  WebSocket handler for authenticated real-time connections.
  Manages channel multiplexing, authentication verification,
  and connection lifecycle for all real-time features.
  """

  use Phoenix.Socket

  # Channel topic routing
  channel "security:*", PrismaticWeb.SecurityChannel
  channel "assets:*", PrismaticWeb.AssetChannel
  channel "quality:*", PrismaticWeb.QualityChannel
  channel "perimeter:*", PrismaticWeb.PerimeterChannel

  @impl true
  @spec connect(map(), Phoenix.Socket.t(), map()) :: {:ok, Phoenix.Socket.t()} | :error
  def connect(%{"token" => token}, socket, _connect_info) do
    case Phoenix.Token.verify(PrismaticWeb.Endpoint, "user", token, max_age: 86_400) do
      {:ok, user_id} ->
        {:ok, assign(socket, :user_id, user_id)}
      {:error, _reason} ->
        :error
    end
  end

  def connect(_params, _socket, _connect_info), do: :error

  @impl true
  @spec id(Phoenix.Socket.t()) :: String.t()
  def id(socket), do: "user_socket:#{socket.assigns.user_id}"
end
```

| Lifecycle Event | Phoenix Handling | Client Recovery |
|----------------|-----------------|-----------------|
| **Connection Loss** | Process terminates, resources freed | Automatic reconnection with backoff |
| **Server Restart** | Graceful close frames sent to clients | Client detects close, reconnects |
| **Heartbeat Timeout** | Server closes inactive connections | Client sends periodic heartbeats |
| **Authentication Expiry** | Server closes with 4001 status | Client refreshes token, reconnects |
| **Topic Leave** | Channel process terminates | Client can rejoin topic |
| **Deployment** | Graceful drain during [blue-green](/glossary/blue-green-deployment/) switch | Client reconnects to new environment |

Phoenix's WebSocket transport includes built-in heartbeat management (default 30-second intervals), automatic reconnection with exponential backoff in the JavaScript client, and topic rejoin on reconnection. This means temporary network disruptions are handled transparently without application-level reconnection logic.

## Phoenix Channel Implementation

Phoenix provides a high-level abstraction over raw WebSocket connections through [Channels](/glossary/channel/), which multiplex multiple topic subscriptions over a single WebSocket connection:

```elixir
defmodule PrismaticWeb.SecurityChannel do
  @moduledoc """
  Channel for real-time security intelligence delivery.
  Handles subscription to security alerts, rating changes,
  and compliance updates within the Perimeter bounded context.
  """

  use PrismaticWeb, :channel

  @impl true
  @spec join(String.t(), map(), Phoenix.Socket.t()) ::
          {:ok, Phoenix.Socket.t()} | {:error, map()}
  def join("security:" <> domain, _params, socket) do
    if authorized?(socket.assigns.user_id, domain) do
      send(self(), :after_join)
      {:ok, assign(socket, :domain, domain)}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    # Push current state to newly joined client
    case PrismaticPerimeter.security_rating(socket.assigns.domain) do
      {:ok, rating} ->
        push(socket, "rating:current", %{
          grade: rating.grade,
          score: rating.score,
          measured_at: rating.measured_at
        })
      {:error, _} ->
        :ok
    end
    {:noreply, socket}
  end

  @impl true
  def handle_in("scan:request", %{"type" => scan_type}, socket) do
    case PrismaticPerimeter.request_scan(socket.assigns.domain, scan_type) do
      {:ok, scan_id} ->
        {:reply, {:ok, %{scan_id: scan_id}}, socket}
      {:error, reason} ->
        {:reply, {:error, %{reason: reason}}, socket}
    end
  end

  defp authorized?(_user_id, _domain), do: true
end
```

## WebSocket vs Alternatives

| Technology | Direction | Latency | Complexity | Connection | Use Case |
|-----------|-----------|---------|------------|------------|----------|
| **WebSocket** | Bidirectional | Lowest | Medium | Persistent | Real-time interactive apps |
| **[SSE](/glossary/server-sent-events/)** | Server-to-client only | Low | Low | Persistent | Live feeds, notifications |
| **HTTP Polling** | Client-initiated | High (interval) | Low | Per-request | Simple status checks |
| **HTTP Long-Polling** | Server-held | Medium | Medium | Held open | Fallback for WebSocket |
| **gRPC Streaming** | Bidirectional | Low | High | Persistent | Microservice communication |
| **HTTP/2 Server Push** | Server-initiated | Low | Medium | Multiplexed | Asset preloading |

[Server-Sent Events](/glossary/server-sent-events/) (SSE) are a simpler alternative when only server-to-client push is needed, using standard HTTP with automatic reconnection and event IDs. WebSocket is necessary when the client also needs to send messages to the server (interactive dashboards, collaborative editing, bidirectional command channels).

## Security Considerations

| Concern | Mitigation | Implementation |
|---------|------------|----------------|
| **Authentication** | Validate tokens during handshake (`connect/3` callback) | `Phoenix.Token.verify/4` |
| **Authorization** | Check permissions per-channel in `join/3` callback | RBAC checks per topic |
| **Origin Validation** | Verify `Origin` header to prevent cross-site hijacking | Endpoint configuration |
| **[TLS](/glossary/tls/)** | Use `wss://` (WebSocket Secure) for encryption | Mandatory in production |
| **Rate Limiting** | Apply [rate limits](/glossary/rate-limiting/) per-connection and per-message | Custom Channel middleware |
| **Message Size** | Configure maximum frame size to prevent memory exhaustion | Cowboy transport options |
| **CSRF** | WebSocket handshake is not subject to CORS; use token-based auth | Token in connect params |
| **Connection Limits** | Cap maximum concurrent connections per user | Socket `connect/3` callback |

### Rate Limiting WebSocket Messages

```elixir
defmodule PrismaticWeb.RateLimitedChannel do
  @moduledoc """
  Channel with per-user rate limiting on incoming messages.
  Prevents individual clients from overwhelming the server
  with excessive requests through the WebSocket connection.
  """

  use PrismaticWeb, :channel

  @max_messages_per_second 10
  @window_ms 1_000

  @impl true
  def handle_in(event, payload, socket) do
    user_id = socket.assigns.user_id
    now = System.monotonic_time(:millisecond)

    window_start = now - @window_ms
    messages = socket.assigns[:rate_limit_messages] || []
    recent = Enum.filter(messages, fn t -> t > window_start end)

    if length(recent) >= @max_messages_per_second do
      {:reply, {:error, %{reason: "rate_limited"}}, socket}
    else
      socket = assign(socket, :rate_limit_messages, [now | recent])
      dispatch_message(event, payload, socket)
    end
  end

  defp dispatch_message("scan:request", payload, socket) do
    # Handle scan request
    {:reply, {:ok, %{status: "queued"}}, socket}
  end

  defp dispatch_message(_event, _payload, socket) do
    {:noreply, socket}
  end
end
```

## Context in Prismatic

The Prismatic Platform leverages WebSockets extensively through [Phoenix Channels](/glossary/channel/) and [LiveView](/glossary/liveview/), making WebSocket the foundational transport for all real-time features.

**Phoenix Channel Transport**: Phoenix manages WebSocket connections as the primary transport for its [Channel](/glossary/channel/) abstraction. Each WebSocket connection can multiplex multiple topic subscriptions, allowing a single connection to simultaneously receive security alerts, asset discovery updates, and quality metric changes. The Phoenix JavaScript client handles connection lifecycle (heartbeats, reconnection, topic rejoin) automatically.

**LiveView Real-Time UI**: [LiveView](/glossary/liveview/) dashboards at `/perimeter`, `/perimeter/assets`, `/perimeter/compliance`, and `/perimeter/easm` use WebSocket connections to push server-rendered HTML diffs to the browser in real-time. When a security rating changes, an asset is discovered, or a compliance score updates, the server pushes only the changed DOM fragments over the existing WebSocket connection, providing real-time updates without page reloads or client-side state management.

**Distributed Broadcasting**: WebSocket connections on individual nodes receive events through [PubSub](/glossary/pubsub/), which propagates messages across [cluster](/glossary/cluster/) nodes. A security alert generated on one node reaches all connected WebSocket clients across all nodes through PubSub-backed broadcasting.

**Connection Architecture**:

```
Browser --- wss:// ---> Phoenix Endpoint
                          |
                    WebSocket Transport (Cowboy/Bandit)
                          |
                    Socket Handler (auth + assign)
                          |
                  +-------+-------+-------+
                  |       |       |       |
            Channel A  Channel B  Channel C  Channel D
            (security) (assets)  (quality)  (perimeter)
                  |       |       |       |
                PubSub (distributed across cluster nodes)
                  |
            +-----+-----+
            |     |     |
          Node1  Node2  Node3
```

**Performance Characteristics**:

| Metric | Value | Notes |
|--------|-------|-------|
| **Connections per node** | 100,000+ | Limited by BEAM process count and memory |
| **Message latency** | <1ms (local), <5ms (cross-node) | Via PubSub distribution |
| **Heartbeat interval** | 30 seconds | Configurable per socket |
| **Reconnect backoff** | 1s, 2s, 5s, 10s (max) | Exponential with cap |
| **Frame overhead** | 2-14 bytes | Minimal vs HTTP's 200-800 bytes |
| **Memory per connection** | ~10-50 KB | Depends on assigns and channel count |

## WebSocket Extensions

### Per-Message Compression (RFC 7692)

The `permessage-deflate` extension compresses WebSocket messages using zlib, reducing bandwidth for text-heavy payloads:

| Content Type | Uncompressed | Compressed | Savings |
|-------------|-------------|------------|---------|
| JSON (small) | 200 bytes | 150 bytes | 25% |
| JSON (large) | 10 KB | 2 KB | 80% |
| HTML diff | 5 KB | 500 bytes | 90% |
| Binary data | Variable | Variable | 10-50% |

Phoenix enables compression through Cowboy transport configuration:

```elixir
# config/config.exs
config :prismatic_web, PrismaticWeb.Endpoint,
  http: [
    port: 4000,
    transport_options: [
      socket_opts: [
        # Enable WebSocket compression
        compress: true
      ]
    ]
  ]
```

## Testing WebSocket Connections

```elixir
defmodule PrismaticWeb.SecurityChannelTest do
  use PrismaticWeb.ChannelCase

  setup do
    user = create_test_user()
    token = Phoenix.Token.sign(PrismaticWeb.Endpoint, "user", user.id)
    {:ok, socket} = connect(PrismaticWeb.UserSocket, %{"token" => token})
    {:ok, socket: socket, user: user}
  end

  describe "join/3" do
    test "joins security channel for authorized domain", %{socket: socket} do
      {:ok, _reply, _socket} = subscribe_and_join(socket, "security:example.com")
    end

    test "rejects unauthorized domain", %{socket: socket} do
      {:error, %{reason: "unauthorized"}} =
        subscribe_and_join(socket, "security:restricted.com")
    end
  end

  describe "handle_in/3" do
    test "processes scan request", %{socket: socket} do
      {:ok, _, socket} = subscribe_and_join(socket, "security:example.com")
      ref = push(socket, "scan:request", %{"type" => "dns"})
      assert_reply ref, :ok, %{scan_id: _}
    end
  end
end
```

## Related Terms

- [Phoenix](/glossary/phoenix/) - Web framework managing WebSocket connections and transport layer
- [LiveView](/glossary/liveview/) - Server-rendered UI using WebSocket for real-time DOM updates
- [Channel](/glossary/channel/) - Phoenix abstraction for multiplexed topic-based communication over WebSocket
- [PubSub](/glossary/pubsub/) - Distributed message broadcasting powering WebSocket event delivery
- [Server-Sent Events](/glossary/server-sent-events/) - Simpler unidirectional alternative to WebSocket
- [TLS](/glossary/tls/) - Encryption layer for secure WebSocket connections (wss://)
- [Rate Limiting](/glossary/rate-limiting/) - Traffic control applied to WebSocket messages
- [Cluster](/glossary/cluster/) - Multi-node deployment with distributed WebSocket broadcasting
- [GraphQL](/glossary/graphql/) - API layer using WebSocket for subscription delivery
- [Blue-Green Deployment](/glossary/blue-green-deployment/) - Deployment strategy requiring graceful WebSocket connection handling

## See Also

- [Architecture](/architecture/) - Platform real-time communication architecture
- [Technologies](/technologies/) - Communication technology stack
- [Apps](/apps/) - Applications using WebSocket for real-time features

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
