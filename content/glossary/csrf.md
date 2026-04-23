+++
title = "CSRF"
description = "Cross-Site Request Forgery -- a web security vulnerability where an attacker tricks a user's browser into making unintended requests to a trusted application."
weight = 50

[extra]
category = "security"
tags = ["csrf", "xsrf", "web-security", "vulnerability", "token", "phoenix", "plug", "session", "forgery", "owasp"]
date_created = "2026-02-23"
date_updated = "2026-02-23"
difficulty = "intermediate"
audience = ["developers", "security-engineers", "web-developers", "architects"]
related_terms = ["csprng", "xss", "session", "token", "owasp", "same-origin-policy", "cors"]
key_concepts = ["token-validation", "same-origin-policy", "state-changing-requests", "double-submit-cookie", "synchronizer-token"]
platforms = ["phoenix", "plug", "beam", "elixir"]
prerequisites = ["http-fundamentals", "web-security-basics", "session-management"]
use_cases = ["form-protection", "api-security", "session-integrity", "state-mutation-safety"]
complexity = "medium"
stability = "mature"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1200
date_modified = "2026-02-23"
keywords = ["CSRF", "Cross-Site Request Forgery", "web security", "glossary", "Phoenix", "Prismatic Platform"]
quality_score = 85
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "CSRF - Prismatic Platform"
+++

## Definition and Overview

Cross-Site Request Forgery (CSRF, also written as XSRF) is a class of web application vulnerability in which an attacker causes a victim's browser to send a forged HTTP request -- including the victim's session cookie and other authentication credentials -- to a vulnerable web application. Because the browser automatically includes session cookies with every request to a domain, the target application cannot distinguish between a legitimate request initiated by the user and a forged request crafted by the attacker.

CSRF attacks exploit the trust that a web application has in the user's browser. Unlike Cross-Site Scripting (XSS), which exploits the trust a user has in a website, CSRF exploits the trust a website has in the user's browser. The attack does not require the attacker to read the response -- it only needs the browser to send the request. This makes CSRF particularly dangerous for state-changing operations such as transferring funds, changing passwords, modifying account settings, or deleting resources.

The vulnerability has been consistently ranked in the OWASP Top 10 and remains relevant despite modern browser security mechanisms. While the SameSite cookie attribute has significantly reduced the attack surface, CSRF protection remains essential for applications that support cross-origin requests, use cookie-based authentication, or must defend against sophisticated attack scenarios involving subdomain takeover or DNS rebinding.

## Technical Deep Dive

A CSRF attack follows a predictable sequence: the victim authenticates with the target application, establishing a session cookie. The attacker then lures the victim to a malicious page (via phishing, social engineering, or compromised advertising) that contains a hidden form or script triggering a request to the target application. The victim's browser automatically attaches the session cookie, and the target application processes the request as legitimate.

### Attack Vectors

| Vector | Mechanism | Stealth Level |
|--------|-----------|--------------|
| **Hidden form + auto-submit** | `<form>` with JavaScript `submit()` | High -- no user interaction needed |
| **Image tag** | `<img src="https://target.com/action?param=value">` | High -- works for GET requests |
| **XMLHttpRequest** | JavaScript AJAX request from attacker's page | Medium -- blocked by CORS for non-simple requests |
| **Link click** | Social engineering to click crafted URL | Low -- requires user action |
| **iframe** | Hidden iframe loads target page | Medium -- modern browsers restrict |

### Defense Mechanisms

| Defense | Mechanism | Strength |
|--------|-----------|----------|
| **Synchronizer Token** | Server generates unique token per session/request, validates on submission | Strong -- industry standard |
| **Double-Submit Cookie** | Random value in both cookie and request parameter | Strong -- stateless variant |
| **SameSite Cookie** | Browser restricts cross-origin cookie sending | Strong -- defense in depth |
| **Origin/Referer Header** | Server validates request origin | Moderate -- headers can be stripped |
| **Custom Request Headers** | Require custom header (e.g., `X-Requested-With`) | Moderate -- CORS preflight protects |
| **Re-authentication** | Require password/2FA for sensitive operations | Very strong -- last resort |

### Token Generation Requirements

CSRF tokens must be generated using a [CSPRNG](/glossary/csprng/) to prevent prediction attacks. The token must have sufficient entropy (at least 128 bits) and must be bound to the user's session to prevent token fixation.

```
Token Properties:
  - Length: >= 128 bits (32 hex characters or 22 base64 characters)
  - Source: CSPRNG (never Math.random or similar)
  - Binding: Tied to user session, invalidated on logout
  - Scope: Per-session (minimum) or per-request (maximum security)
  - Transmission: Hidden form field or custom HTTP header
  - Storage: Server-side session or signed cookie (never URL parameter)
```

## Architecture and Implementation

CSRF protection in modern web frameworks operates at the middleware/plug level, intercepting all state-changing requests (POST, PUT, PATCH, DELETE) and validating the presence and correctness of a CSRF token before allowing the request to proceed.

The protection architecture consists of three components: token generation (creating unpredictable tokens and associating them with sessions), token embedding (including tokens in forms and page metadata), and token validation (comparing submitted tokens against expected values). The validation step must use constant-time comparison to prevent timing side-channel attacks that could allow an attacker to incrementally guess the token.

Phoenix Framework implements CSRF protection through the `Plug.CSRFProtection` plug, which is included by default in all generated applications. The token is automatically embedded in all forms generated by `Phoenix.HTML.Form` functions and validated on every non-GET request.

## Usage in Prismatic Platform

The Prismatic Platform enforces CSRF protection across all web endpoints through Phoenix's built-in plug pipeline. The platform extends the default protection with additional safeguards for the API gateway and LiveView connections.

```elixir
defmodule PrismaticWeb.Router do
  @moduledoc """
  Router configuration demonstrating CSRF protection layers.
  All browser pipelines include CSRF protection by default.
  API pipelines use token-based authentication instead.
  """

  use PrismaticWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {PrismaticWeb.Layouts, :root}
    # CSRF protection -- validates token on all non-GET requests
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
    # API uses Bearer token auth, not session cookies
    # CSRF not applicable for token-authenticated APIs
    plug PrismaticWeb.Plugs.APIAuth
  end
end
```

```elixir
defmodule PrismaticWeb.CSRFEnhancement do
  @moduledoc """
  Enhanced CSRF protection for sensitive operations.
  Implements per-request tokens for critical state changes
  and double-submit cookie validation for API endpoints
  that support both cookie and token authentication.
  """

  import Plug.Conn

  @spec validate_sensitive_operation(Plug.Conn.t(), keyword()) :: Plug.Conn.t()
  def validate_sensitive_operation(conn, _opts) do
    csrf_token = get_session(conn, :csrf_token)
    submitted_token = get_req_header(conn, "x-csrf-token") |> List.first()

    case constant_time_compare(csrf_token, submitted_token) do
      true ->
        # Rotate token after use for sensitive operations
        new_token = generate_csrf_token()
        conn |> put_session(:csrf_token, new_token)

      false ->
        conn
        |> put_status(:forbidden)
        |> Phoenix.Controller.json(%{error: "Invalid CSRF token"})
        |> halt()
    end
  end

  defp generate_csrf_token do
    :crypto.strong_rand_bytes(24)
    |> Base.url_encode64(padding: false)
  end

  defp constant_time_compare(nil, _), do: false
  defp constant_time_compare(_, nil), do: false

  defp constant_time_compare(a, b) when byte_size(a) != byte_size(b), do: false

  defp constant_time_compare(a, b) do
    Plug.Crypto.secure_compare(a, b)
  end
end
```

### LiveView CSRF Considerations

Phoenix LiveView connections use a different CSRF model than traditional form submissions. The initial HTTP request that mounts the LiveView validates CSRF normally. Subsequent WebSocket messages are authenticated by the LiveView session token, which is cryptographically signed and includes the CSRF token. This means LiveView `handle_event` callbacks are inherently CSRF-protected without additional token passing.

| Request Type | CSRF Mechanism | Validation Point |
|-------------|---------------|-----------------|
| **Form POST** | Hidden `_csrf_token` field | `Plug.CSRFProtection` |
| **LiveView mount** | Standard HTTP CSRF | Router pipeline |
| **LiveView event** | Signed session token | LiveView framework |
| **API request** | Bearer token (not cookie-based) | `APIAuth` plug |
| **WebSocket** | Connection token | Channel join |

## Cross-References

- [CSPRNG](/glossary/csprng/) -- Secure random generation for CSRF tokens
- **XSS** -- Complementary web vulnerability class
- [Session](/glossary/session/) -- Session management CSRF relies on
- [OWASP](/glossary/owasp/) -- Security standards defining CSRF prevention
- **HTTP** -- Protocol carrying CSRF-vulnerable requests
- **Livebooks**: `security_compliance/` notebooks cover CSRF testing and validation
- **Academy**: APISecurityAnalysis topic includes CSRF prevention patterns

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)
