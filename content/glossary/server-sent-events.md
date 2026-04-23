+++
title = "Server-Sent Events"
weight = 22
[extra]
category = "technology"
description = "HTTP-based protocol for unidirectional real-time server-to-client event streaming"
related_terms = ["websocket", "phoenix", "liveview", "pubsub", "stream-processing", "rest-api", "channel"]
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1281
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Server-Sent", "Events", "HTTP-based", "glossary", "technology", "Prismatic Platform", "HTTP", "Server"]
tags = ["glossary", "technology", "server-sent-events", "prismatic"]
quality_score = 77
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Server-Sent Events - Prismatic Platform"
+++

## Definition

Server-Sent Events (SSE) is a W3C standardized web technology that enables servers to push real-time updates to clients over a persistent HTTP connection. Unlike [WebSockets](/glossary/websocket/), which establish a full-duplex bidirectional channel, SSE is unidirectional: data flows exclusively from server to client. The protocol is built on top of standard HTTP, using the `text/event-stream` content type and a simple text-based wire format, making it compatible with existing HTTP infrastructure including proxies, load balancers, CDNs, and firewalls without special configuration.

The SSE specification defines the `EventSource` browser API, which provides automatic reconnection with exponential backoff, event ID tracking for seamless resumption after disconnection, and named event types for multiplexing different data streams over a single connection. These built-in capabilities eliminate significant client-side complexity that developers would otherwise need to implement manually with WebSockets. The simplicity of the protocol -- it is essentially a long-lived HTTP response with a structured text body -- makes it remarkably robust and easy to debug, as standard HTTP tools (curl, browser developer tools, HTTP proxies) work without modification.

SSE occupies a specific niche in the real-time communication spectrum: it is the optimal choice when the primary data flow is server-to-client, when HTTP compatibility is important, and when the simplicity of implementation and debugging outweighs the need for client-to-server streaming. Common use cases include live feeds, progress notifications, dashboard updates, log tailing, and any scenario where the server is the primary source of new information.

## Protocol Specification

The SSE wire format is deliberately simple, consisting of UTF-8 text lines with field-name/value pairs separated by colons.

### Wire Format

```
event: security-rating\n
id: evt-2026-0214-001\n
retry: 5000\n
data: {"domain":"example.com","grade":"B","score":780}\n
\n
event: asset-discovered\n
id: evt-2026-0214-002\n
data: {"type":"subdomain","value":"api.example.com"}\n
\n
: this is a comment, used as a keepalive\n
\n
```

Each message is terminated by a blank line (`\n\n`). The protocol defines four field types:

| Field | Purpose | Example |
|-------|---------|---------|
| `data` | Event payload (required) | `data: {"score": 780}` |
| `event` | Named event type for client-side dispatch | `event: rating-update` |
| `id` | Event identifier for reconnection resumption | `id: evt-001` |
| `retry` | Client reconnection delay in milliseconds | `retry: 5000` |

Multi-line data is supported by repeating the `data` field. Comment lines (prefixed with `:`) serve as keepalives to prevent proxy timeout disconnections.

### HTTP Headers

The server response uses specific headers to establish the SSE connection:

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
```

The `X-Accel-Buffering: no` header is important for Nginx reverse proxies, preventing response buffering that would delay event delivery. Similarly, `Cache-Control: no-cache` ensures intermediaries do not cache the event stream.

## EventSource Browser API

The client-side `EventSource` API provides a high-level interface for consuming SSE streams with built-in reliability features.

```javascript
// Basic SSE consumption
const source = new EventSource('/api/v1/stream/security-events');

// Default message handler
source.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateDashboard(data);
};

// Named event handlers
source.addEventListener('rating-update', (event) => {
  const rating = JSON.parse(event.data);
  updateSecurityRating(rating.domain, rating.grade, rating.score);
});

source.addEventListener('asset-discovered', (event) => {
  const asset = JSON.parse(event.data);
  addAssetToInventory(asset);
});

// Connection lifecycle
source.onopen = () => console.log('SSE connection established');
source.onerror = (event) => {
  if (source.readyState === EventSource.CONNECTING) {
    console.log('Reconnecting...');
  }
};
```

### Automatic Reconnection

The EventSource API automatically reconnects when the connection drops, using the `retry` interval specified by the server (default 3 seconds). On reconnection, it sends a `Last-Event-ID` header containing the `id` of the last received event, enabling the server to resume the stream from where it left off.

```
Initial connection:
  Client → GET /stream HTTP/1.1
  Server → 200 OK (begins streaming)
  Server → id: 42\ndata: event-42\n\n
  Server → id: 43\ndata: event-43\n\n
  [connection drops]

Reconnection (automatic):
  Client → GET /stream HTTP/1.1
           Last-Event-ID: 43
  Server → 200 OK (resumes from event 44)
  Server → id: 44\ndata: event-44\n\n
```

This built-in resumption mechanism is one of SSE's strongest advantages over raw WebSockets, where reconnection and state recovery must be implemented entirely by the application.

## SSE vs WebSocket Comparison

The choice between SSE and [WebSockets](/glossary/websocket/) depends on the communication pattern, infrastructure constraints, and complexity budget.

| Dimension | Server-Sent Events | WebSocket |
|-----------|-------------------|-----------|
| **Direction** | Server to client only | Bidirectional |
| **Protocol** | HTTP (text/event-stream) | WebSocket protocol (ws://) |
| **Transport** | HTTP/1.1 or HTTP/2 | TCP with HTTP upgrade |
| **Data format** | UTF-8 text only | Text or binary frames |
| **Auto-reconnect** | Built-in with Last-Event-ID | Manual implementation required |
| **Proxy compatibility** | Excellent (standard HTTP) | Variable (requires upgrade support) |
| **Browser support** | All modern browsers | All modern browsers |
| **Max connections** | 6 per domain (HTTP/1.1), unlimited (HTTP/2) | Unlimited |
| **Compression** | HTTP compression (gzip, br) | Per-message deflate extension |
| **Authentication** | Standard HTTP headers, cookies | Custom (often token in URL or first message) |
| **Debugging** | Standard HTTP tools | Specialized WebSocket inspectors |
| **Complexity** | Low | Moderate to high |

### When to Choose SSE

- Server is the primary data source (dashboards, feeds, notifications)
- HTTP infrastructure must be preserved (corporate proxies, CDNs)
- Automatic reconnection with state resumption is needed
- Simplicity of implementation and debugging is valued
- HTTP/2 is available (eliminates connection limit)

### When to Choose WebSocket

- Bidirectional communication required (chat, collaborative editing)
- Binary data transfer needed (file uploads, media streaming)
- Very high message frequency in both directions
- Custom subprotocols required

## SSE over HTTP/2

HTTP/2 significantly improves SSE's capabilities by multiplexing multiple streams over a single TCP connection. The HTTP/1.1 limitation of 6 connections per domain (shared across all SSE streams and regular requests) is eliminated entirely.

| Feature | SSE + HTTP/1.1 | SSE + HTTP/2 |
|---------|----------------|--------------|
| Connections per domain | 6 (shared) | 1 (multiplexed) |
| Head-of-line blocking | Per connection | Per stream (independent) |
| Header compression | None | HPACK |
| Server push | Not available | Available |
| Concurrent streams | Limited by connections | Hundreds per connection |

For the Prismatic Platform, HTTP/2 support means that a single browser tab displaying the Perimeter dashboard at `/perimeter` can simultaneously consume separate SSE streams for security ratings, asset discovery, compliance status, and quality metrics without exhausting connection limits.

## Phoenix SSE Implementation

The Prismatic Platform implements SSE endpoints in the [Phoenix](/glossary/phoenix/) framework using Plug's chunked response mechanism.

```elixir
defmodule PrismaticApi.SSEController do
  use PrismaticApi, :controller

  def stream(conn, %{"topic" => topic}) do
    conn =
      conn
      |> put_resp_content_type("text/event-stream")
      |> put_resp_header("cache-control", "no-cache")
      |> put_resp_header("x-accel-buffering", "no")
      |> send_chunked(200)

    # Subscribe to PubSub topic
    Phoenix.PubSub.subscribe(PrismaticWeb.PubSub, topic)

    # Enter receive loop
    stream_loop(conn, topic)
  end

  defp stream_loop(conn, topic) do
    receive do
      {:event, event_type, data, id} ->
        case send_sse_event(conn, event_type, data, id) do
          {:ok, conn} -> stream_loop(conn, topic)
          {:error, _reason} -> conn  # Client disconnected
        end

      :keepalive ->
        case chunk(conn, ": keepalive\n\n") do
          {:ok, conn} -> stream_loop(conn, topic)
          {:error, _reason} -> conn
        end
    after
      30_000 ->
        # Send keepalive every 30 seconds
        case chunk(conn, ": keepalive\n\n") do
          {:ok, conn} -> stream_loop(conn, topic)
          {:error, _reason} -> conn
        end
    end
  end

  defp send_sse_event(conn, event_type, data, id) do
    payload =
      "event: #{event_type}\n" <>
      "id: #{id}\n" <>
      "data: #{Jason.encode!(data)}\n\n"

    chunk(conn, payload)
  end
end
```

This implementation leverages Phoenix's [PubSub](/glossary/pubsub/) system as the bridge between backend [stream processing](/glossary/stream-processing/) pipelines and SSE delivery. When a Broadway pipeline processes a security event, it publishes to a PubSub topic. The SSE controller, subscribed to that topic, receives the event and pushes it to the client as an SSE message.

## Use Cases in Prismatic

The Prismatic Platform uses SSE for several categories of real-time data delivery, primarily through the [Prismatic API](/glossary/rest-api/) for external consumers.

| Use Case | Event Type | Typical Frequency | Example Payload |
|----------|------------|-------------------|-----------------|
| EASM scan progress | `scan-progress` | Every 1-5 seconds | `{"domain":"example.com","progress":72,"found":15}` |
| Security rating updates | `rating-update` | Per domain assessed | `{"domain":"example.com","grade":"B","score":780}` |
| Asset discovery | `asset-discovered` | Per asset found | `{"type":"subdomain","value":"api.example.com"}` |
| Compliance check results | `compliance-result` | Per check completed | `{"framework":"nis2","control":"5.1","status":"pass"}` |
| Quality telemetry | `quality-metric` | Every 30 seconds | `{"domain":"compilation","score":100}` |
| Long-running operation status | `operation-status` | Per status change | `{"operation_id":"op-123","status":"analyzing"}` |

SSE is preferred over WebSockets for API consumers because it integrates naturally with the [REST API](/glossary/rest-api/) paradigm: clients make a standard HTTP GET request and receive a streaming response. No protocol upgrade, no special client libraries, and standard HTTP authentication (Bearer tokens, cookies) works without modification.

## SSE vs Phoenix LiveView

Within the Prismatic Platform, [LiveView](/glossary/liveview/) and SSE serve different audiences and use cases.

| Aspect | LiveView | SSE |
|--------|----------|-----|
| **Audience** | Browser users (dashboards) | API consumers (integrations) |
| **Transport** | WebSocket (Phoenix Channel) | HTTP (text/event-stream) |
| **Rendering** | Server-rendered HTML diffs | Raw JSON data |
| **Interactivity** | Full bidirectional (clicks, forms) | Unidirectional (server push only) |
| **State management** | Server-side (assigns) | Client-side (consumer responsibility) |
| **Client library** | Phoenix LiveView JS | Native EventSource API |

LiveView powers the interactive Perimeter dashboard at `/perimeter` where users click, filter, and interact with security data. SSE powers the API streaming endpoints at `/api/v1/stream/*` where automated systems consume real-time security events for integration into external SIEM, SOAR, or dashboarding tools.

## Error Handling and Resilience

Robust SSE implementations must handle several failure modes gracefully.

| Failure Mode | Server Behavior | Client Behavior |
|-------------|-----------------|-----------------|
| Client disconnect | Detect via chunk error, clean up | Automatic reconnect with Last-Event-ID |
| Server restart | N/A (connection lost) | Reconnect, resume from last ID |
| Proxy timeout | Send keepalive comments every 15-30s | Transparent (keepalive prevents timeout) |
| Invalid event format | Log error, skip malformed event | onmessage not fired, connection preserved |
| Authentication expiry | Send 401 or close stream | onerror fires, manual re-auth needed |
| Backpressure (slow client) | Buffer up to limit, then drop oldest | May miss events (use IDs for gap detection) |

The keepalive mechanism (comment lines sent at regular intervals) is particularly important in production environments where reverse proxies like Nginx impose idle connection timeouts. Without keepalives, an SSE connection with infrequent events would be terminated by the proxy, forcing unnecessary reconnections.

## Related Terms

- [WebSocket](/glossary/websocket/) - Bidirectional alternative for interactive communication patterns
- [Channel](/glossary/channel/) - Phoenix Channel abstraction over WebSocket transport
- [REST API](/glossary/rest-api/) - HTTP API pattern complemented by SSE for streaming responses
- [Phoenix](/glossary/phoenix/) - Framework supporting both SSE and WebSocket transports
- [LiveView](/glossary/liveview/) - Server-rendered real-time UI using WebSocket (complementary to SSE)
- [PubSub](/glossary/pubsub/) - Internal message distribution feeding SSE streams from backend pipelines
- [Stream Processing](/glossary/stream-processing/) - Backend pipeline producing events for SSE delivery
- [Backpressure](/glossary/backpressure/) - Flow control relevant to SSE when clients consume slowly
- [Load Balancing](/glossary/load-balancing/) - Infrastructure concern for distributing long-lived SSE connections
- [Observability](/glossary/observability/) - Monitoring SSE connection health and event delivery metrics

## See Also

- [Technologies](/technologies/) - Communication protocol options and technology stack
- [Architecture](/architecture/) - Real-time data delivery patterns in the platform architecture
- [Apps](/apps/) - Applications implementing SSE endpoints for external consumers

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)