+++
title = "XSS"
weight = 50
[extra]
description = "Cross-Site Scripting vulnerability where malicious scripts are injected into trusted web pages viewed by other users"
category = "security"
related_terms = ["security", "owasp", "sanitization", "csp"]
complexity_level = "intermediate"
platform_integration = "core"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["XSS", "cross-site scripting", "injection", "web security", "OWASP", "glossary", "Prismatic Platform"]
tags = ["glossary", "security"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "XSS - Prismatic Platform"
+++

## Definition & Overview

Cross-Site Scripting (XSS) is a web security vulnerability that allows attackers to inject malicious client-side scripts into web pages viewed by other users. When a web application includes untrusted data in its output without proper validation or escaping, an attacker can craft input that, when rendered by other users' browsers, executes arbitrary JavaScript in the context of the vulnerable application. This enables session hijacking, credential theft, defacement, and redirection to malicious sites.

XSS is consistently ranked among the OWASP Top 10 web application security risks due to its prevalence and impact. There are three primary types: **Stored XSS** where the malicious script is permanently stored on the target server (in a database, comment field, or user profile), **Reflected XSS** where the script is reflected off a web server in error messages or search results, and **DOM-based XSS** where the vulnerability exists in client-side JavaScript that processes user input without proper sanitization.

The Prismatic Platform takes a defense-in-depth approach to XSS prevention. Phoenix's templating engine automatically HTML-escapes all dynamic content by default, neutralizing the most common injection vectors. LiveView's server-rendered approach further reduces the attack surface by minimizing client-side JavaScript execution. Content Security Policy (CSP) headers provide an additional layer of protection by restricting which scripts the browser is allowed to execute.

## Technical Deep Dive

Phoenix templates provide automatic XSS protection through HTML escaping:

```elixir
defmodule PrismaticWeb.SecurityComponents do
  @moduledoc """
  Security-aware components that demonstrate XSS prevention
  patterns in Phoenix LiveView templates.
  """

  use Phoenix.Component

  @doc """
  Safe text display - Phoenix auto-escapes by default.
  The `<%= @user_input %>` syntax escapes HTML entities.

  SAFE:   <%= @user_input %> -> &lt;script&gt;alert(1)&lt;/script&gt;
  UNSAFE: <%= raw(@user_input) %> -> <script>alert(1)</script>
  """
  attr :content, :string, required: true

  def safe_text(assigns) do
    ~H"""
    <div class="text-gray-200">
      <%= @content %>
    </div>
    """
  end

  @doc """
  When raw HTML is necessary (e.g., rendered Markdown),
  sanitize BEFORE rendering to remove dangerous elements.
  """
  attr :html_content, :string, required: true

  def sanitized_html(assigns) do
    sanitized = PrismaticSecurity.Sanitizer.sanitize(assigns.html_content)
    assigns = assign(assigns, :sanitized, sanitized)

    ~H"""
    <div class="prose prose-invert">
      <%= raw(@sanitized) %>
    </div>
    """
  end
end
```

The platform's HTML sanitizer strips dangerous elements and attributes:

```elixir
defmodule PrismaticSecurity.Sanitizer do
  @moduledoc """
  HTML sanitizer that removes XSS vectors while preserving
  safe formatting elements for rendered content.
  """

  @allowed_tags ~w(p br h1 h2 h3 h4 h5 h6 ul ol li a em strong code pre
                    blockquote table thead tbody tr th td span div img)

  @allowed_attributes %{
    "a" => ~w(href title class),
    "img" => ~w(src alt title width height class),
    "code" => ~w(class),
    "pre" => ~w(class),
    "div" => ~w(class),
    "span" => ~w(class),
    "table" => ~w(class),
    "th" => ~w(class colspan rowspan),
    "td" => ~w(class colspan rowspan)
  }

  @dangerous_protocols ~w(javascript: data: vbscript:)

  @spec sanitize(String.t()) :: String.t()
  def sanitize(html) when is_binary(html) do
    html
    |> HtmlSanitizeEx.strip_tags(
      tags: @allowed_tags,
      attributes: @allowed_attributes
    )
    |> remove_dangerous_protocols()
    |> remove_event_handlers()
  end

  defp remove_dangerous_protocols(html) do
    Enum.reduce(@dangerous_protocols, html, fn protocol, acc ->
      String.replace(acc, ~r/#{Regex.escape(protocol)}/i, "")
    end)
  end

  defp remove_event_handlers(html) do
    String.replace(html, ~r/\son\w+\s*=/i, " data-removed=")
  end
end
```

Content Security Policy configuration:

```elixir
defmodule PrismaticWeb.Plugs.ContentSecurityPolicy do
  @moduledoc """
  Sets Content-Security-Policy headers to prevent
  XSS exploitation even if injection occurs.
  """

  @behaviour Plug

  @csp_directives [
    "default-src 'self'",
    "script-src 'self' 'nonce-{nonce}'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ]

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    nonce = generate_nonce()

    csp =
      @csp_directives
      |> Enum.join("; ")
      |> String.replace("{nonce}", nonce)

    conn
    |> Plug.Conn.put_resp_header("content-security-policy", csp)
    |> Plug.Conn.put_resp_header("x-content-type-options", "nosniff")
    |> Plug.Conn.put_resp_header("x-frame-options", "DENY")
    |> Plug.Conn.put_resp_header("x-xss-protection", "1; mode=block")
    |> Plug.Conn.assign(:csp_nonce, nonce)
  end

  defp generate_nonce do
    :crypto.strong_rand_bytes(16) |> Base.url_encode64(padding: false)
  end
end
```

## Architecture & Implementation

The platform's XSS defense operates through multiple complementary layers:

**Template Auto-Escaping**: Phoenix's EEx templates and HEEx (LiveView) templates automatically HTML-escape all `<%= %>` interpolations. This is the primary defense and handles the vast majority of XSS vectors. The `raw/1` function is required to bypass escaping, and its usage is restricted to sanitized content only.

**Input Validation**: All user inputs are validated at the boundary (controller/LiveView event handlers) before processing. String inputs are trimmed, length-limited, and pattern-validated. The platform's OSINT toolbox validates tool input parameters against their declared schemas, rejecting inputs that contain HTML or JavaScript.

**Output Sanitization**: When rendering user-generated or external content that may contain HTML (Markdown-rendered text, imported data), the sanitizer strips all elements and attributes not on the allowlist. This ensures that even if malicious content enters the database, it cannot execute in users' browsers.

**Content Security Policy**: CSP headers restrict script execution to same-origin scripts with valid nonces. Even if an XSS payload bypasses template escaping and sanitization, the browser's CSP enforcement blocks the injected script from executing. The nonce-based approach allows legitimate inline scripts while blocking injected ones.

**LiveView Architecture**: Phoenix LiveView's server-rendered model inherently reduces XSS risk. User interactions are handled server-side, and the DOM is updated through a controlled diffing mechanism rather than client-side JavaScript string interpolation. This eliminates entire categories of DOM-based XSS.

## Usage in Prismatic Platform

The OSINT toolbox, which accepts user input for intelligence queries, demonstrates defense-in-depth XSS prevention:

```elixir
defmodule PrismaticWeb.OsintToolboxLive do
  use PrismaticWeb, :live_view

  @impl true
  def handle_event("execute_tool", %{"query" => query} = params, socket) do
    sanitized_query = sanitize_input(query)

    case validate_tool_input(socket.assigns.current_tool, params) do
      {:ok, validated_params} ->
        {:ok, result} = PrismaticOsintCore.execute(
          socket.assigns.current_tool.slug,
          validated_params
        )

        {:noreply, assign(socket, result: result, query: sanitized_query)}

      {:error, errors} ->
        {:noreply, assign(socket, errors: errors)}
    end
  end

  defp sanitize_input(input) when is_binary(input) do
    input
    |> String.trim()
    |> String.slice(0, 1_000)
    |> HtmlSanitizeEx.strip_tags()
  end

  defp validate_tool_input(tool, params) do
    tool.input_fields
    |> Enum.reduce_while({:ok, %{}}, fn field, {:ok, acc} ->
      value = Map.get(params, to_string(field.name), "")

      if field.required and value == "" do
        {:halt, {:error, [{field.name, "is required"}]}}
      else
        {:cont, {:ok, Map.put(acc, field.name, sanitize_input(value))}}
      end
    end)
  end
end
```

The promo site's use of `{{ section.content | safe }}` in Zola templates requires particular care. The `safe` filter bypasses Zola's auto-escaping, which is necessary for Markdown-rendered HTML content. Since promo content is authored internally (not user-submitted), this is acceptable, but the boundary between trusted and untrusted content must remain clear.

## Cross-References

- [Security](/glossary/security/) - Broader security concepts
- [OWASP](/glossary/owasp/) - Web security standards body
- **CSP** - Content Security Policy
- **Sanitization** - Input/output cleaning
- [Token](/glossary/token/) - Authentication protected by XSS prevention

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
