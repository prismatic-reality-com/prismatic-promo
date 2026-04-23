+++
title = "Socket.IO"
weight = 20
[extra]
category = "technology"
description = "Real-time bidirectional event-based communication library providing automatic transport fallback, reconnection, and room-based broadcasting across client and server."
related_terms = ["websocket", "channel", "phoenix", "pubsub", "server-sent-events", "endpoint", "liveview"]
acronym = ""
technical_domain = "Real-Time Communication"
complexity_level = "Intermediate"
platform_relevance = "Comparative - Phoenix Channels used instead"
elixir_equivalent = "Phoenix Channels"
node_js_library = true
beam_specific = false
prismatic_modules = ["PrismaticWeb.MonitoringChannel", "PrismaticWeb.UserSocket", "PrismaticWeb.Endpoint"]
transport_protocols = ["HTTP long-polling", "WebSocket", "WebTransport"]
protocol_layers = ["Engine.IO", "Socket.IO"]
max_connections_node = "~10K practical"
max_connections_beam = "~2M demonstrated"
creator = "Guillermo Rauch"
year_created = 2010
industry_standard = "Node.js real-time ecosystem"
first_introduced = "Reference only"
last_updated = "2026-02-22"
tags = ["socket-io", "real-time", "websocket", "node-js", "phoenix-channels", "bidirectional", "event-driven", "transport"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1651
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["SocketIO", "Real-time", "glossary", "technology", "Prismatic Platform", "Socket", "WebSocket", "BEAM", "Phoenix Channels", "Node"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Socket.IO - Prismatic Platform"
+++

## Definition

Socket.IO is a JavaScript library that enables real-time, bidirectional, event-based communication between web clients and servers. Originally created by Guillermo Rauch in 2010 as a companion to the Express.js framework, Socket.IO abstracts over multiple transport mechanisms -- beginning with HTTP long-polling and upgrading to [WebSocket](/glossary/websocket/) when available -- providing reliable real-time connectivity even in environments where raw WebSocket connections are blocked by corporate proxies, firewalls, or load balancers that do not support the WebSocket upgrade handshake. The library implements its own protocol layer on top of Engine.IO (its transport abstraction) and adds features absent from the WebSocket specification: automatic reconnection with exponential backoff, packet buffering during disconnection, multiplexing through namespaces, room-based broadcasting, and acknowledgement callbacks for request-response patterns over the bidirectional channel.

Socket.IO operates on an event-driven model where both client and server can emit named events with arbitrary payloads, receiving acknowledgement callbacks for confirmation or response data. The server component runs on Node.js, while client libraries exist for JavaScript (browser and React Native), Swift (iOS), Java/Kotlin (Android), C++, Dart (Flutter), and Python. A critical architectural distinction that developers frequently misunderstand is that Socket.IO is not a WebSocket implementation -- it is a higher-level protocol that uses WebSocket as one of its transports. A plain WebSocket client cannot connect to a Socket.IO server without implementing the Engine.IO handshake, session ID management, and Socket.IO packet framing protocol. This distinction has practical consequences for interoperability and debugging.

The library's adoption peaked in the 2013-2018 Node.js ecosystem before alternatives like [Phoenix Channels](/glossary/channel/), gRPC streaming, native WebSocket APIs with improved browser support, and Server-Sent Events reduced its dominance. However, Socket.IO remains widely deployed in production systems requiring broad browser compatibility, transport fallback guarantees, and the convenience of its room-based broadcasting model. As of 2026, Socket.IO v4.x continues active development with added support for WebTransport, connection state recovery, and improved TypeScript typing.

## Implementation in Prismatic Platform

The Prismatic Platform does not use Socket.IO directly. Instead, it leverages [Phoenix Channels](/glossary/channel/), which provide equivalent real-time bidirectional communication with superior performance characteristics on the [BEAM](/glossary/beam/) virtual machine. Phoenix Channels handle each connection as an isolated BEAM process, enabling millions of concurrent connections without the single-threaded bottleneck inherent in Node.js Socket.IO servers. The platform's real-time dashboards, agent status feeds, quality monitoring updates, [OSINT](/glossary/osint/) scan progress, and [LiveView](/glossary/liveview/) interfaces all operate through Phoenix's native socket infrastructure configured at the [Endpoint](/glossary/endpoint/) level.

```elixir
defmodule PrismaticWeb.UserSocket do
  @moduledoc """
  Socket handler for the Prismatic Platform.
  Authenticates connections and routes to topic-specific channels.
  Equivalent to Socket.IO's namespace and authentication middleware.
  """

  use Phoenix.Socket

  channel "monitoring:*", PrismaticWeb.MonitoringChannel
  channel "agents:*", PrismaticWeb.AgentChannel
  channel "quality:*", PrismaticWeb.QualityChannel
  channel "osint:*", PrismaticWeb.OsintChannel

  @impl true
  @spec connect(map(), Phoenix.Socket.t(), map()) :: {:ok, Phoenix.Socket.t()} | :error
  def connect(%{"token" => token}, socket, _connect_info) do
    case PrismaticAuth.verify_token(token) do
      {:ok, user} ->
        {:ok, assign(socket, :current_user, user)}

      {:error, _reason} ->
        :error
    end
  end

  def connect(_params, _socket, _connect_info), do: :error

  @impl true
  @spec id(Phoenix.Socket.t()) :: String.t() | nil
  def id(socket), do: "user_socket:#{socket.assigns.current_user.id}"
end
```

Understanding Socket.IO remains relevant for the platform because many external systems and third-party integrations use Socket.IO for their real-time APIs. The Prismatic intelligence pipeline may need to consume Socket.IO event streams from monitored targets during [EASM](/glossary/easm/) reconnaissance, and the OSINT toolbox may encounter Socket.IO-based services during web application fingerprinting.

## Protocol Architecture

Socket.IO's protocol consists of two layers working in concert. Engine.IO handles transport negotiation and connection lifecycle at the lower level, while Socket.IO handles event routing, namespaces, rooms, and acknowledgements at the application level:

| Layer | Responsibility | Transport Options |
|-------|---------------|-------------------|
| **Engine.IO** | Transport abstraction, handshake, heartbeat, session management | HTTP long-polling, WebSocket, WebTransport |
| **Socket.IO** | Event routing, namespaces, rooms, acknowledgements, binary handling | Runs over Engine.IO transport |
| **Application** | Business logic event handlers, room management, broadcasting | Emits/listens to named events |

The connection lifecycle proceeds through distinct phases:

1. **Handshake**: Client sends HTTP GET to `/socket.io/?EIO=4&transport=polling` endpoint; server responds with JSON containing session ID (`sid`), available upgrades, ping interval, and ping timeout
2. **Polling**: Initial communication uses HTTP long-polling for maximum compatibility; client polls for messages while sending events as POST requests
3. **Upgrade Probe**: If WebSocket is listed in available upgrades, client opens a WebSocket connection and sends a probe packet
4. **Transport Switch**: Upon successful probe, all communication switches to WebSocket transparently; polling transport is closed
5. **Heartbeat**: Periodic ping/pong frames detect connection health; the server sends ping, the client responds with pong within the configured timeout
6. **Disconnect**: Graceful (client sends disconnect packet) or timeout-based (missed heartbeats) disconnection; client auto-reconnects based on configuration

```
Client                              Server
  |                                    |
  |  GET /socket.io/?transport=polling |
  |----------------------------------->|
  |  {"sid":"abc","upgrades":["ws"]}   |
  |<-----------------------------------|
  |                                    |
  |  [Polling: POST events, GET msgs]  |
  |<=================================>|
  |                                    |
  |  WebSocket Upgrade Request         |
  |----------------------------------->|
  |  101 Switching Protocols           |
  |<-----------------------------------|
  |                                    |
  |  Probe: "2probe"                   |
  |----------------------------------->|
  |  Probe ACK: "3probe"              |
  |<-----------------------------------|
  |                                    |
  |  Upgrade: "5"                      |
  |----------------------------------->|
  |  [Close polling transport]         |
  |                                    |
  |  [WebSocket: bidirectional]        |
  |<=================================>|
  |                                    |
  |  Ping: "2" (every pingInterval)   |
  |<-----------------------------------|
  |  Pong: "3"                         |
  |----------------------------------->|
```

## Comparison with Phoenix Channels

For systems built on the [BEAM](/glossary/beam/), [Phoenix Channels](/glossary/channel/) provide a more natural and significantly more performant alternative to Socket.IO. The architectural differences stem from the fundamental concurrency model difference between Node.js and the BEAM:

| Feature | Socket.IO (Node.js) | Phoenix Channels (Elixir) |
|---------|---------------------|--------------------------|
| **Concurrency Model** | Single-threaded event loop with worker threads | Per-connection BEAM process (preemptive scheduling) |
| **Connection Limit** | ~10K per instance (practical) | ~2M per instance (demonstrated by Phoenix team) |
| **Memory per Connection** | ~30KB (JS object + closure state) | ~2-3KB (BEAM process heap) |
| **Transport** | Engine.IO (polling + WebSocket + WebTransport) | WebSocket with longpoll fallback |
| **Broadcasting** | In-memory, Redis adapter, or PostgreSQL adapter | [PubSub](/glossary/pubsub/) with distributed node support |
| **Fault Isolation** | One crash can affect entire event loop | Process crash isolated to single connection |
| **State Management** | Server-side session maps (shared mutable) | Per-process GenServer state (isolated immutable) |
| **Scaling** | Requires Redis/sticky sessions for multi-instance | Native BEAM distribution across [cluster](/glossary/cluster/) nodes |
| **Protocol** | Custom Engine.IO + Socket.IO framing | Phoenix Socket protocol (simpler, WebSocket-native) |
| **Hot Code Reload** | Restart required | BEAM supports hot code loading |
| **Backpressure** | Manual implementation | BEAM process mailbox provides natural backpressure |
| **Supervision** | Process manager (PM2) | OTP [Supervisor](/glossary/supervisor/) trees |

Phoenix Channels achieve higher connection density because each connection is a lightweight BEAM process (approximately 2KB initial heap) rather than a JavaScript object sharing the Node.js event loop. Broadcasting leverages [PubSub](/glossary/pubsub/) with optional distributed backends (`:pg2`, Phoenix.PubSub.PG2, Phoenix.PubSub.Redis), avoiding the Redis dependency that Socket.IO requires for multi-instance deployments. The BEAM's preemptive scheduler ensures that no single connection can monopolize CPU time, unlike Node.js where a compute-heavy event handler blocks all other connections until it yields.

## Core Features

Socket.IO provides several features that distinguish it from raw WebSocket usage:

**Automatic Reconnection**: When a connection drops, the client automatically attempts to reconnect with configurable exponential backoff (default: 1s, 2s, 4s, 8s... up to 30s). During disconnection, events are buffered in a client-side queue and delivered upon reconnection, preventing data loss during transient network failures. Connection state recovery (v4.6+) can restore room memberships and missed events without application-level logic.

**Namespaces**: A single physical connection can be multiplexed into multiple logical channels (namespaces), each with independent event handlers, middleware, and authentication. The default namespace is `/`, and additional namespaces are created by convention (e.g., `/admin`, `/monitoring`). Each namespace maintains its own connection state, meaning authentication can vary across namespaces on the same physical connection.

**Rooms**: Within a namespace, sockets can join and leave named rooms, enabling targeted broadcasting to subsets of connected clients. A chat application might use rooms for individual conversations; a monitoring dashboard might use rooms for different metric categories. Room membership is server-side only -- clients cannot join rooms directly, preventing unauthorized access to broadcast groups.

**Acknowledgements**: Events can include callback functions that the receiver invokes to confirm receipt or return response data, implementing request-response semantics over the bidirectional channel. This eliminates the need for correlation IDs and manual response matching.

**Binary Support**: Socket.IO handles binary data (ArrayBuffer, Blob, Buffer) transparently, encoding it alongside JSON payloads using a placeholder-based serialization protocol. Binary attachments are sent as separate WebSocket frames and reassembled on receipt.

**Middleware**: Server-side middleware functions can intercept events before they reach handlers, enabling cross-cutting concerns like authentication, rate limiting, and logging without modifying individual event handlers.

## Scaling Patterns

Socket.IO's single-threaded nature requires horizontal scaling strategies for production deployments. The primary challenge is that broadcasting must reach clients connected to different server instances:

```javascript
// Socket.IO with Redis adapter for multi-instance scaling
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const io = new Server(3000, {
  cors: { origin: "*" },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000  // 2 minutes
  }
});

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});

// Events broadcast across all instances via Redis pub/sub
io.on("connection", (socket) => {
  socket.join("monitoring");

  socket.on("metric", (data, callback) => {
    io.to("monitoring").emit("metric:update", data);
    callback({ status: "received" });  // Acknowledgement
  });

  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${reason}`);
  });
});
```

In contrast, Phoenix Channels scale through native BEAM distribution without external dependencies:

```elixir
defmodule PrismaticWeb.MonitoringChannel do
  @moduledoc """
  Real-time monitoring channel for the Prismatic Platform.
  Handles metric updates, quality alerts, and agent status.
  Scales natively across cluster nodes via PubSub.
  """

  use Phoenix.Channel

  @impl true
  @spec join(String.t(), map(), Phoenix.Socket.t()) ::
    {:ok, Phoenix.Socket.t()} | {:error, map()}
  def join("monitoring:" <> scope, _params, socket) do
    case authorize_scope(socket.assigns.current_user, scope) do
      :ok ->
        send(self(), :after_join)
        {:ok, assign(socket, :scope, scope)}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  @impl true
  def handle_info(:after_join, socket) do
    case PrismaticSafety.QualityFloorGuardian.current_score() do
      {:ok, score} ->
        push(socket, "quality:current", %{score: score})

      {:error, _} ->
        :ok
    end

    {:noreply, socket}
  end

  @impl true
  @spec handle_in(String.t(), map(), Phoenix.Socket.t()) ::
    {:noreply, Phoenix.Socket.t()} | {:reply, {:ok, map()}, Phoenix.Socket.t()}
  def handle_in("metric", payload, socket) do
    broadcast!(socket, "metric:update", payload)
    {:reply, {:ok, %{status: "broadcast_sent"}}, socket}
  end

  def handle_in("subscribe_agent", %{"agent_id" => agent_id}, socket) do
    Phoenix.PubSub.subscribe(Prismatic.PubSub, "agent:#{agent_id}")
    {:reply, {:ok, %{subscribed: agent_id}}, socket}
  end

  defp authorize_scope(user, "admin"), do: if(user.admin?, do: :ok, else: {:error, "forbidden"})
  defp authorize_scope(_user, _scope), do: :ok
end
```

## Security Considerations

Socket.IO connections require careful security configuration, particularly in intelligence platforms where data sensitivity is high:

| Concern | Socket.IO Approach | Phoenix Equivalent |
|---------|-------------------|-------------------|
| **Authentication** | Middleware on connection handshake (`io.use()`) | `connect/3` callback in Socket module |
| **Authorization** | Namespace middleware (`namespace.use()`) | `join/3` callback in Channel module |
| **CORS** | `cors` option in server config | [Endpoint](/glossary/endpoint/) CORS [Plug](/glossary/plug/) configuration |
| **Rate Limiting** | Custom middleware or `socket.io-ratelimit` | [Rate Limiting](/glossary/rate-limiting/) plugs or channel-level throttling |
| **TLS** | Reverse proxy or Node.js `https` | [TLS](/glossary/tls/) at Endpoint or load balancer |
| **Input Validation** | Manual event payload validation | Pattern matching on `handle_in/3` |
| **Room Authorization** | Server-side room join logic | `join/3` callback with authorization check |
| **Event Injection** | Event name allowlisting | Pattern matching limits valid events |

A critical security difference: Phoenix Channels' pattern matching on `handle_in/3` provides compile-time guarantees that only explicitly defined event names are handled, while Socket.IO's dynamic event registration (`socket.on(eventName, ...)`) makes it easier to accidentally expose internal events to clients.

## Performance Characteristics

Socket.IO's performance profile differs substantially from raw WebSocket and Phoenix Channel implementations:

| Metric | Socket.IO | Raw WebSocket | Phoenix Channels |
|--------|-----------|---------------|-----------------|
| **Handshake Overhead** | 2-3 HTTP requests + upgrade | Single HTTP upgrade | Single HTTP upgrade |
| **Latency (median)** | ~5ms (after upgrade) | ~1ms | ~1-2ms |
| **Latency (polling)** | ~50-100ms | N/A | ~50ms (fallback only) |
| **Memory per Connection** | ~30KB (Node.js object) | ~10KB | ~2-3KB (BEAM process) |
| **Max Connections (single)** | ~10K practical | ~50K practical | ~2M demonstrated |
| **CPU per Broadcast** | O(n) with adapter overhead | O(n) | O(n) with PubSub optimization |
| **Reconnection Time** | 1-30s (exponential backoff) | Manual | Phoenix auto-rejoin |
| **Binary Overhead** | Placeholder encoding | Native | Native |

The initial HTTP polling phase adds 50-100ms latency to Socket.IO connections that raw WebSocket and Phoenix Channel connections avoid. Once upgraded to WebSocket transport, the per-message latency difference is minimal (~3-5ms overhead from Socket.IO framing), but the per-connection memory overhead remains 10-15x higher in Node.js compared to BEAM processes.

## Migration Patterns

Organizations migrating from Socket.IO to Phoenix Channels follow common patterns:

| Socket.IO Concept | Phoenix Equivalent | Migration Notes |
|-------------------|-------------------|-----------------|
| `io.on("connection")` | `connect/3` in Socket | Move auth logic to `connect/3` |
| `socket.on("event")` | `handle_in/3` in Channel | Pattern match event names |
| `socket.emit("event")` | `push/3` | Server-to-client message |
| `io.to("room").emit()` | `broadcast!/3` | Room-level broadcast |
| `socket.join("room")` | `join/3` callback | Server authorizes, client subscribes via topic |
| `socket.rooms` | Channel topic subscriptions | Implicit via topic joining |
| Namespace (`/admin`) | Channel topic prefix (`admin:*`) | Topic-based routing |
| Redis adapter | Phoenix.PubSub | No external dependency needed |
| `io.use(middleware)` | Plug pipeline on socket endpoint | Compose plugs before socket |

## Related Terms

- [WebSocket](/glossary/websocket/) - Transport protocol used by Socket.IO after upgrade
- [Channel](/glossary/channel/) - Phoenix's native real-time communication abstraction
- [PubSub](/glossary/pubsub/) - Distributed broadcasting mechanism used by Phoenix Channels
- [LiveView](/glossary/liveview/) - Server-rendered real-time UI built on Phoenix sockets
- [Endpoint](/glossary/endpoint/) - Phoenix entry point configuring socket connections
- [Server-Sent Events](/glossary/server-sent-events/) - Alternative unidirectional real-time transport
- [Phoenix](/glossary/phoenix/) - Framework providing Channel-based real-time communication
- [Cluster](/glossary/cluster/) - BEAM distribution enabling multi-node Channel scaling
- [Rate Limiting](/glossary/rate-limiting/) - Protection mechanism for real-time connections
- [TLS](/glossary/tls/) - Transport encryption for socket connections
- [BEAM](/glossary/beam/) - Virtual machine enabling per-connection process isolation
- [Plug](/glossary/plug/) - Middleware used in socket endpoint configuration

## See Also

- [Architecture](/architecture/) - Platform real-time communication architecture
- [Technologies](/technologies/) - Full technology stack comparison

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
