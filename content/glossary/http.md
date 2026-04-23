+++
title = "HTTP"
description = "Hypertext Transfer Protocol -- the foundational request-response protocol of the World Wide Web, used for transferring web pages, API data, and all web-based communications."
weight = 50

[extra]
category = "networking"
tags = ["http", "protocol", "web", "rest", "api", "request-response", "status-codes", "headers", "https", "http2"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "beginner"
audience = ["developers", "web-developers", "architects", "security-engineers"]
related_terms = ["rest", "api", "gateway", "csrf", "cors", "websocket", "plug", "phoenix"]
key_concepts = ["request-response", "stateless", "methods", "status-codes", "headers", "content-negotiation", "connection-management"]
platforms = ["phoenix", "plug", "tesla", "mint", "beam"]
prerequisites = ["networking-basics", "tcp-ip"]
use_cases = ["web-applications", "rest-apis", "webhooks", "file-transfer", "streaming"]
complexity = "low"
stability = "mature"
pioneer = "Tim Berners-Lee"
year_introduced = "1991"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1100
date_modified = "2026-02-23"
keywords = ["HTTP", "Hypertext Transfer Protocol", "web", "glossary", "Prismatic Platform"]
quality_score = 80
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "HTTP - Prismatic Platform"
+++

## Definition and Overview

HTTP (Hypertext Transfer Protocol) is an application-layer protocol that forms the foundation of data communication on the World Wide Web. Originally designed by Tim Berners-Lee at CERN in 1989-1991 for transferring HTML documents, HTTP has evolved into the universal protocol for web applications, REST APIs, microservice communication, file transfers, and streaming media. The protocol operates on a request-response model: a client sends a request message to a server, and the server returns a response message containing the requested resource or an error indication.

HTTP is stateless by design -- each request-response pair is independent, and the server retains no information about previous requests from the same client. This statelessness simplifies server implementation and enables horizontal scaling (any server in a cluster can handle any request), but it means that application-level state management (sessions, authentication tokens, shopping carts) must be implemented through cookies, tokens, or server-side session stores.

The protocol has evolved through several major versions: HTTP/1.0 (1996, one request per connection), HTTP/1.1 (1997, persistent connections, pipelining, chunked transfer), HTTP/2 (2015, multiplexed streams, header compression, server push), and HTTP/3 (2022, QUIC transport, UDP-based, reduced latency). The Prismatic Platform serves all web traffic and API requests over HTTP/1.1 and HTTP/2 via Phoenix's Cowboy/Bandit web server, with HTTPS enforced in production through TLS termination.

## Technical Deep Dive

### HTTP Methods

| Method | Semantics | Idempotent | Safe | Use Case |
|--------|-----------|-----------|------|----------|
| **GET** | Retrieve resource | Yes | Yes | Read data, search queries |
| **POST** | Create resource / submit data | No | No | Form submissions, API creation |
| **PUT** | Replace entire resource | Yes | No | Full resource update |
| **PATCH** | Partial resource update | No* | No | Partial resource modification |
| **DELETE** | Remove resource | Yes | No | Resource deletion |
| **HEAD** | GET without body | Yes | Yes | Check existence, caching |
| **OPTIONS** | Describe communication options | Yes | Yes | CORS preflight |

### Status Code Categories

| Range | Category | Common Codes |
|-------|----------|-------------|
| **1xx** | Informational | 100 Continue, 101 Switching Protocols |
| **2xx** | Success | 200 OK, 201 Created, 204 No Content |
| **3xx** | Redirection | 301 Moved, 302 Found, 304 Not Modified |
| **4xx** | Client Error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable, 429 Too Many Requests |
| **5xx** | Server Error | 500 Internal Error, 502 Bad Gateway, 503 Unavailable, 504 Timeout |

### HTTP Version Comparison

| Feature | HTTP/1.1 | HTTP/2 | HTTP/3 |
|---------|----------|--------|--------|
| **Transport** | TCP | TCP | QUIC (UDP) |
| **Multiplexing** | No (head-of-line blocking) | Yes (streams) | Yes (streams, no HoL) |
| **Header compression** | No | HPACK | QPACK |
| **Server push** | No | Yes | Yes |
| **Connection setup** | TCP handshake + TLS | TCP + TLS (ALPN) | 0-RTT or 1-RTT |
| **Binary framing** | No (text-based) | Yes | Yes |

### Key Headers

| Header | Direction | Purpose | Example |
|--------|-----------|---------|---------|
| `Content-Type` | Both | Media type of body | `application/json; charset=utf-8` |
| `Authorization` | Request | Authentication credentials | `Bearer eyJhbGciOiJIUzI1...` |
| `Accept` | Request | Preferred response format | `application/json` |
| `Cache-Control` | Both | Caching directives | `max-age=3600, public` |
| `ETag` | Response | Resource version identifier | `"33a64df5"` |
| `X-Request-ID` | Both | Request correlation | `req_abc123` |
| `Set-Cookie` | Response | Session/state management | `session_id=xyz; HttpOnly; Secure` |

## Architecture and Implementation

HTTP processing in the Prismatic Platform follows the Plug pipeline architecture. Every HTTP request passes through a series of composable plugs that handle parsing, authentication, routing, and response generation. Phoenix builds on this foundation, adding routing, controller dispatch, and LiveView WebSocket upgrades.

The request lifecycle begins when the web server (Bandit or Cowboy) accepts a TCP/TLS connection and parses the HTTP request into a `Plug.Conn` struct. This struct flows through the plug pipeline, where each plug can read request data, modify the connection, or halt processing. The router plug matches the request URL against defined routes and dispatches to the appropriate controller or LiveView.

For external HTTP requests (OSINT tool API calls, webhook delivery, health check probes), the platform uses Tesla HTTP client with Mint adapter. Tesla provides a middleware-based HTTP client architecture that mirrors Phoenix's plug pipeline on the client side. Middleware handles logging, retry logic, rate limiting, and authentication for outgoing HTTP requests.

## Usage in Prismatic Platform

The Prismatic Platform handles HTTP at multiple layers: serving web pages and LiveView connections (port 4000), exposing the REST API (port 4004), and making outgoing HTTP requests to OSINT tool providers.

```elixir
defmodule PrismaticWeb.Endpoint do
  @moduledoc """
  HTTP endpoint configuration for the Prismatic web application.
  Handles all incoming HTTP requests on port 4000 including
  static files, LiveView WebSocket upgrades, and API routes.
  """

  use Phoenix.Endpoint, otp_app: :prismatic_web

  @session_options [
    store: :cookie,
    key: "_prismatic_key",
    signing_salt: "prismatic_signing",
    same_site: "Lax"
  ]

  socket "/live", Phoenix.LiveView.Socket,
    websocket: [connect_info: [session: @session_options]]

  plug Plug.Static,
    at: "/",
    from: :prismatic_web,
    gzip: true

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug PrismaticWeb.Router
end

defmodule Prismatic.HTTP.Client do
  @moduledoc """
  HTTP client for outgoing requests to OSINT tool
  providers, webhooks, and external APIs. Built on
  Tesla with middleware for logging, retry, and auth.
  """

  use Tesla

  plug Tesla.Middleware.BaseUrl, ""
  plug Tesla.Middleware.JSON
  plug Tesla.Middleware.Retry, delay: 1_000, max_retries: 3
  plug Tesla.Middleware.Timeout, timeout: 30_000
  plug Tesla.Middleware.Logger

  @spec get_json(String.t(), keyword()) :: {:ok, map()} | {:error, term()}
  def get_json(url, opts \\ []) do
    headers = Keyword.get(opts, :headers, [])

    case get(url, headers: headers) do
      {:ok, %Tesla.Env{status: status, body: body}} when status in 200..299 ->
        {:ok, body}

      {:ok, %Tesla.Env{status: status}} ->
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @spec post_json(String.t(), map(), keyword()) :: {:ok, map()} | {:error, term()}
  def post_json(url, payload, opts \\ []) do
    headers = Keyword.get(opts, :headers, [])

    case post(url, payload, headers: headers) do
      {:ok, %Tesla.Env{status: status, body: body}} when status in 200..299 ->
        {:ok, body}

      {:ok, %Tesla.Env{status: status}} ->
        {:error, {:http_error, status}}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
```

## Cross-References

- [REST](/glossary/rest/) -- Architectural style built on HTTP
- [Gateway](/glossary/gateway/) -- API gateway handling HTTP traffic
- [CSRF](/glossary/csrf/) -- HTTP-based security vulnerability
- [Health Check](/glossary/health-check/) -- HTTP endpoint for service health
- [Execution Time](/glossary/execution-time/) -- HTTP request timing measurement
- **Livebooks**: `api_integration/` notebooks demonstrate HTTP client usage
- **Academy**: APISecurityAnalysis topic covers HTTP security

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
