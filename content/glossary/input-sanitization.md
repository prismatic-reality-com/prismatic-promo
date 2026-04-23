+++
title = "Input Sanitization"
description = "Comprehensive guide to input sanitization -- the process of cleaning, validating, and transforming untrusted user input to prevent injection attacks, data corruption, and security vulnerabilities in software systems."
weight = 50

[extra]
category = "security"
tags = ["input-sanitization", "security", "validation", "injection-prevention", "xss", "sql-injection", "owasp", "elixir", "defensive-programming"]
status = "active"
author = "Tomas Korcak (korczis)"
date_created = "2026-02-22"
date_updated = "2026-02-22"
reading_time = "20 min"
difficulty = "intermediate"
quality_score = 95
key_takeaway = "Input sanitization is the systematic process of validating, cleaning, and transforming untrusted data at system boundaries to prevent injection attacks, cross-site scripting, data corruption, and other security vulnerabilities before the data enters application logic."
related_terms = ["security", "validation", "injection-vulnerability", "owasp", "authentication", "authorization", "encryption", "xss", "sql-injection", "data-protection"]
aliases = ["input-validation", "data-sanitization", "input-cleansing"]
prerequisites = ["security", "validation", "error-handling"]
see_also = ["injection-vulnerability", "owasp", "authentication", "authorization"]
word_count = 1949
date_modified = "2026-02-23"
keywords = ["Input", "Sanitization", "Comprehensive", "glossary", "security", "Prismatic Platform", "HTML", "Ecto", "Validation", "Phoenix"]
image = "/images/sections/glossary.png"
image_alt = "Input Sanitization - Prismatic Platform"
+++

## Definition

Input sanitization is the disciplined practice of inspecting, validating, cleaning, and transforming all data that enters a software system from untrusted sources before that data is processed, stored, or rendered. Untrusted sources include user form submissions, API request bodies, URL parameters, HTTP headers, file uploads, database query results from external systems, messages from third-party integrations, and any other data that originates outside the trust boundary of the application. The goal of input sanitization is to ensure that only well-formed, expected, and safe data reaches application logic, thereby eliminating entire classes of vulnerabilities including SQL injection, cross-site scripting (XSS), command injection, path traversal, and buffer overflow attacks.

## Overview

Input sanitization sits at the intersection of security engineering and software correctness. Every security breach that exploits user input -- from the 2017 Equifax SQL injection to everyday XSS attacks on web applications -- traces back to a failure to properly sanitize input at system boundaries. The principle is deceptively simple: never trust data from outside your system. The implementation, however, requires rigorous discipline, comprehensive coverage, and defense-in-depth strategies.

There are three complementary approaches to handling untrusted input:

**Validation** checks whether input conforms to expected formats, lengths, types, and ranges. Validation answers the question "Is this input acceptable?" and rejects data that does not meet criteria. For example, an email field must match a well-defined pattern, an age must be a positive integer within a reasonable range, and a country code must exist in a known enumeration. Validation is the first line of defense and should reject malformed input as early as possible.

**Sanitization** (in the narrow sense) transforms input to remove or neutralize dangerous content while preserving the intended meaning. HTML sanitization strips or escapes tags and attributes that could execute scripts. SQL sanitization escapes special characters that could alter query structure. Path sanitization removes directory traversal sequences. Sanitization answers the question "How do I make this input safe?" and is used when the application must accept rich or complex input.

**Encoding** transforms data into a format safe for its destination context. HTML encoding converts `<` to `&lt;` for display in web pages. URL encoding converts spaces to `%20` for use in URLs. JSON encoding escapes special characters for inclusion in JSON strings. Encoding is context-specific: the same data may need different encoding for HTML output, SQL queries, shell commands, and log entries.

The Prismatic Platform enforces input sanitization at multiple layers: Phoenix controller parameter validation, Ecto changeset constraints, custom validation modules, and pre-commit quality gates that detect unsafe input handling patterns.

In Elixir and the BEAM ecosystem, several language features provide natural protection against common injection vectors. Pattern matching enables precise input shape validation. Immutable data structures prevent in-place buffer modifications. Ecto's parameterized queries make SQL injection structurally impossible when used correctly. Phoenix's template engine auto-escapes HTML output by default. These built-in protections do not eliminate the need for explicit sanitization, but they reduce the attack surface significantly compared to languages with mutable strings, implicit type coercion, and string-interpolated queries.

## Technical Details

### Structured Input Validation with Ecto Changesets

Ecto changesets provide a powerful, composable mechanism for validating and sanitizing input in Elixir applications:

```elixir
defmodule Prismatic.Input.UserRegistration do
  @moduledoc """
  Input sanitization and validation for user registration data.
  Demonstrates defense-in-depth input handling using Ecto changesets.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @type t :: %__MODULE__{
          email: String.t(),
          username: String.t(),
          display_name: String.t(),
          organization: String.t() | nil
        }

  @email_regex ~r/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  @username_regex ~r/^[a-zA-Z][a-zA-Z0-9_-]{2,29}$/
  @max_display_name_length 100
  @max_organization_length 200
  @reserved_usernames ~w(admin root system api null undefined prismatic)

  embedded_schema do
    field :email, :string
    field :username, :string
    field :display_name, :string
    field :organization, :string
  end

  @spec validate(map()) :: {:ok, t()} | {:error, Ecto.Changeset.t()}
  def validate(params) when is_map(params) do
    changeset =
      %__MODULE__{}
      |> cast(sanitize_params(params), [:email, :username, :display_name, :organization])
      |> validate_required([:email, :username, :display_name])
      |> validate_email()
      |> validate_username()
      |> validate_display_name()
      |> validate_organization()

    case changeset.valid? do
      true -> {:ok, apply_changes(changeset)}
      false -> {:error, changeset}
    end
  end

  def validate(_params), do: {:error, :invalid_input_type}

  @spec sanitize_params(map()) :: map()
  defp sanitize_params(params) do
    params
    |> Enum.map(fn {key, value} -> {to_string(key), sanitize_value(value)} end)
    |> Map.new()
  end

  defp sanitize_value(value) when is_binary(value) do
    value
    |> String.trim()
    |> strip_null_bytes()
    |> normalize_unicode()
    |> truncate_excessive_length(10_000)
  end

  defp sanitize_value(value), do: value

  defp strip_null_bytes(string) do
    String.replace(string, <<0>>, "")
  end

  defp normalize_unicode(string) do
    :unicode.characters_to_nfc_binary(string)
  end

  defp truncate_excessive_length(string, max_length) do
    String.slice(string, 0, max_length)
  end

  defp validate_email(changeset) do
    changeset
    |> validate_format(:email, @email_regex, message: "must be a valid email address")
    |> validate_length(:email, max: 254)
    |> update_change(:email, &String.downcase/1)
  end

  defp validate_username(changeset) do
    changeset
    |> validate_format(:username, @username_regex,
      message: "must start with a letter and contain only letters, numbers, hyphens, underscores"
    )
    |> validate_length(:username, min: 3, max: 30)
    |> update_change(:username, &String.downcase/1)
    |> validate_exclusion(:username, @reserved_usernames,
      message: "is reserved and cannot be used"
    )
  end

  defp validate_display_name(changeset) do
    changeset
    |> validate_length(:display_name, min: 1, max: @max_display_name_length)
    |> update_change(:display_name, &sanitize_display_text/1)
  end

  defp validate_organization(changeset) do
    changeset
    |> validate_length(:organization, max: @max_organization_length)
    |> update_change(:organization, fn
      nil -> nil
      org -> sanitize_display_text(org)
    end)
  end

  defp sanitize_display_text(text) do
    text
    |> HtmlSanitizeEx.strip_tags()
    |> String.replace(~r/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/, "")
    |> String.trim()
  end
end
```

### HTML Sanitization for Rich Content

When applications must accept rich HTML input (such as Markdown-rendered content or WYSIWYG editors), sanitization must permit safe elements while neutralizing dangerous ones:

```elixir
defmodule Prismatic.Input.HtmlSanitizer do
  @moduledoc """
  Context-aware HTML sanitization with configurable allowlists.
  Supports multiple security profiles for different input contexts.
  """

  @type profile :: :strict | :basic | :rich | :markdown
  @type sanitize_result :: {:ok, String.t()} | {:error, :content_too_large}

  @max_content_size 100_000

  @profiles %{
    strict: %{
      allowed_tags: [],
      allowed_attributes: %{}
    },
    basic: %{
      allowed_tags: ~w(p br strong em b i u),
      allowed_attributes: %{}
    },
    rich: %{
      allowed_tags: ~w(p br strong em b i u a ul ol li h2 h3 h4 blockquote code pre),
      allowed_attributes: %{
        "a" => ["href", "title"],
        "code" => ["class"]
      }
    },
    markdown: %{
      allowed_tags:
        ~w(p br strong em b i u a ul ol li h1 h2 h3 h4 h5 h6 blockquote code pre table thead tbody tr th td img),
      allowed_attributes: %{
        "a" => ["href", "title"],
        "img" => ["src", "alt", "width", "height"],
        "code" => ["class"],
        "td" => ["align"],
        "th" => ["align"]
      }
    }
  }

  @spec sanitize(String.t(), profile()) :: sanitize_result()
  def sanitize(html, profile \\ :basic) when is_binary(html) do
    if byte_size(html) > @max_content_size do
      {:error, :content_too_large}
    else
      config = Map.fetch!(@profiles, profile)

      sanitized =
        html
        |> strip_null_bytes()
        |> remove_script_content()
        |> remove_event_handlers()
        |> filter_tags(config.allowed_tags)
        |> filter_attributes(config.allowed_attributes)
        |> sanitize_urls()
        |> normalize_whitespace()

      {:ok, sanitized}
    end
  end

  defp strip_null_bytes(html), do: String.replace(html, <<0>>, "")

  defp remove_script_content(html) do
    Regex.replace(~r/<script[^>]*>.*?<\/script>/is, html, "")
  end

  defp remove_event_handlers(html) do
    Regex.replace(~r/\s+on\w+\s*=\s*["'][^"']*["']/i, html, "")
  end

  defp sanitize_urls(html) do
    Regex.replace(~r/(?:href|src)\s*=\s*["']javascript:[^"']*["']/i, html, "")
  end

  defp normalize_whitespace(html) do
    html
    |> String.replace(~r/\s+/, " ")
    |> String.trim()
  end
end
```

### API Request Sanitization Plug

A Phoenix Plug that sanitizes all incoming API requests at the controller boundary:

```elixir
defmodule PrismaticWeb.Plugs.InputSanitization do
  @moduledoc """
  Phoenix Plug for systematic input sanitization at API boundaries.
  Strips dangerous characters, enforces size limits, and normalizes encoding.
  """

  @behaviour Plug

  import Plug.Conn

  @max_param_size 50_000
  @max_params_count 100

  @impl true
  def init(opts), do: opts

  @impl true
  def call(conn, _opts) do
    with :ok <- check_params_count(conn.params),
         {:ok, sanitized} <- sanitize_params(conn.params) do
      %{conn | params: sanitized}
    else
      {:error, :too_many_params} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(400, Jason.encode!(%{error: "Too many parameters"}))
        |> halt()

      {:error, :param_too_large} ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(413, Jason.encode!(%{error: "Parameter value too large"}))
        |> halt()
    end
  end

  defp check_params_count(params) when map_size(params) > @max_params_count,
    do: {:error, :too_many_params}

  defp check_params_count(_params), do: :ok

  defp sanitize_params(params) when is_map(params) do
    result =
      Enum.reduce_while(params, {:ok, %{}}, fn {key, value}, {:ok, acc} ->
        case sanitize_param(value) do
          {:ok, sanitized} -> {:cont, {:ok, Map.put(acc, sanitize_key(key), sanitized)}}
          {:error, _} = error -> {:halt, error}
        end
      end)

    result
  end

  defp sanitize_param(value) when is_binary(value) do
    if byte_size(value) > @max_param_size do
      {:error, :param_too_large}
    else
      sanitized =
        value
        |> String.replace(<<0>>, "")
        |> String.trim()

      {:ok, sanitized}
    end
  end

  defp sanitize_param(value) when is_list(value) do
    results = Enum.map(value, &sanitize_param/1)

    if Enum.all?(results, &match?({:ok, _}, &1)) do
      {:ok, Enum.map(results, fn {:ok, v} -> v end)}
    else
      {:error, :param_too_large}
    end
  end

  defp sanitize_param(value) when is_map(value), do: sanitize_params(value)
  defp sanitize_param(value), do: {:ok, value}

  defp sanitize_key(key) when is_binary(key) do
    key
    |> String.replace(<<0>>, "")
    |> String.trim()
  end

  defp sanitize_key(key), do: key
end
```

## Implementation

Implementing comprehensive input sanitization requires a defense-in-depth strategy that operates at multiple layers of the application stack.

**Layer 1 -- Transport Validation**: Before input reaches application code, the web server and framework should enforce transport-level constraints. Phoenix automatically handles request size limits, content-type validation, and parameter parsing. Custom Plugs add application-specific constraints such as parameter count limits, encoding normalization, and null byte stripping.

**Layer 2 -- Schema Validation**: Ecto changesets or dedicated validation modules verify that input conforms to expected schemas. This includes type checking (strings, integers, booleans), format validation (email addresses, URLs, phone numbers), range constraints (minimum/maximum values, string lengths), and enumeration membership (valid country codes, status values, role names).

**Layer 3 -- Business Logic Validation**: Domain-specific rules that go beyond structural validation. For example, a transfer amount must not exceed account balance, an appointment date must be in the future, or a username must not be already taken. These validations require database queries or external service calls and operate after schema validation has already verified the structural integrity of the input.

**Layer 4 -- Output Encoding**: Even after input has been validated and sanitized on ingestion, it must be properly encoded when rendered in different contexts. Phoenix templates auto-escape HTML by default. JSON encoders handle special characters. SQL parameterization prevents injection at the query level. Log formatters strip control characters that could corrupt log files or enable log injection attacks.

**Layer 5 -- Storage Constraints**: Database-level constraints (CHECK constraints, NOT NULL constraints, UNIQUE constraints, foreign key constraints) serve as the final validation layer. If a bug in application-level validation allows invalid data through, database constraints catch it before it corrupts persistent state.

## Comparison

| Approach | Strengths | Weaknesses | Best For |
|----------|-----------|------------|----------|
| **Allowlist (Whitelist)** | Maximum security, rejects unknown patterns | Restrictive, may reject valid input | Security-critical fields |
| **Denylist (Blacklist)** | Permissive, easy to implement | Incomplete, bypassable, arms race | Quick protections (NOT recommended as sole defense) |
| **Schema Validation** | Precise, composable, self-documenting | Requires upfront schema definition | Structured API input |
| **Ecto Changesets** | Type-safe, composable, Elixir-native | Tied to Ecto ecosystem | Phoenix/Ecto applications |
| **Regular Expressions** | Powerful pattern matching | Complex, error-prone, ReDoS risk | Format validation |
| **Parameterized Queries** | Structural SQL injection prevention | Only covers SQL context | All database queries |
| **Template Auto-Escaping** | Transparent XSS prevention | Context-specific, can be bypassed with `raw` | HTML output |

The Prismatic Platform favors allowlisting combined with Ecto changesets for structured input and parameterized queries for all database operations. Template auto-escaping is enabled by default in all Phoenix views.

## Best Practices

1. **Validate Early, Sanitize at Boundaries**: Perform input validation as early as possible in the request lifecycle. Reject invalid input at the controller level before it reaches business logic or database layers. This reduces the attack surface and simplifies downstream code.

2. **Use Allowlists Over Denylists**: Define what is allowed rather than trying to enumerate what is forbidden. Denylists are inherently incomplete because attackers continuously discover new bypass techniques. Allowlists are future-proof: unknown input is rejected by default.

3. **Context-Specific Encoding**: The same data may be safe in one context but dangerous in another. Apply encoding appropriate to the destination: HTML-encode for web pages, URL-encode for query strings, parameterize for SQL, shell-escape for system commands. Never assume a single sanitization pass handles all contexts.

4. **Never Trust Client-Side Validation**: Client-side validation improves user experience but provides zero security. Every validation performed in the browser must be replicated on the server. Attackers can bypass client-side validation trivially using developer tools, proxy tools, or custom HTTP clients.

5. **Limit Input Size and Complexity**: Enforce maximum lengths, parameter counts, nesting depths, and file sizes. Unbounded input enables denial-of-service attacks through memory exhaustion, CPU exhaustion (via Regular Expression Denial of Service / ReDoS), and storage exhaustion.

6. **Normalize Before Validation**: Unicode normalization, whitespace trimming, case normalization, and null byte removal should occur before validation rules are applied. Without normalization, visually identical inputs may pass or fail validation inconsistently.

7. **Log Sanitization Failures**: Record all input validation failures with enough context to detect attack patterns. Include the source IP, the rejected field, the violation type, and a sanitized version of the rejected value. Never log raw unsanitized input that could enable log injection.

8. **Test Adversarial Input**: Include fuzzing, property-based testing, and known attack payload testing in your test suite. Test with null bytes, Unicode edge cases, extremely long strings, nested structures, and OWASP payloads.

## Pitfalls

**Double Encoding**: Applying HTML encoding twice produces visible escape artifacts (`&amp;lt;` instead of `<`). Track where encoding occurs in the pipeline and ensure it happens exactly once, at the output boundary.

**Overly Aggressive Sanitization**: Stripping too much from input degrades user experience. Users with apostrophes in names (O'Brien), special characters in passwords, or Unicode characters in display names may find their input silently corrupted. Balance security with usability by using the narrowest sanitization profile appropriate for each field.

**Regular Expression Denial of Service (ReDoS)**: Poorly written regular expressions with nested quantifiers can cause catastrophic backtracking on adversarial input, consuming CPU for seconds or minutes on a single validation check. Use linear-time regex engines or carefully review patterns for backtracking vulnerabilities.

**Inconsistent Validation**: Applying different validation rules for the same field across different endpoints creates inconsistency that attackers exploit. Centralize validation logic in shared modules (like Ecto embedded schemas) so that all entry points enforce identical constraints.

**Trusting Internal Data**: Data from internal services, databases, or message queues may have been stored before sanitization was implemented, or may have been inserted by a compromised component. Apply appropriate encoding when rendering any data, regardless of its source.

**Forgetting Non-String Input**: Input sanitization is not limited to strings. Integer overflow, negative values in quantity fields, NaN in float calculations, excessively large arrays, and deeply nested JSON objects all represent unsanitized input that can cause application failures.

## Use Cases

**User Registration**: A web application accepts email, username, and profile information. Input sanitization validates email format, restricts usernames to safe characters, strips HTML from display names, enforces length limits, normalizes Unicode, and rejects reserved words. This prevents stored XSS, username spoofing, and data corruption.

**API Gateway**: A REST API receives JSON payloads from external clients. The gateway validates Content-Type headers, enforces request body size limits, validates JSON schema conformance, sanitizes string values, and rejects unexpected fields. This prevents injection attacks, oversized payload DoS, and schema violation errors.

**Search Functionality**: A full-text search feature accepts user queries that are forwarded to Meilisearch. Input sanitization limits query length, strips control characters, escapes special search operators when not intended, and rate-limits requests per IP. This prevents search injection, resource exhaustion, and enumeration attacks.

**File Upload Processing**: An application accepts file uploads for processing. Input sanitization validates file size limits, checks MIME types against allowlists (not just file extensions), scans for embedded scripts in image metadata, generates new filenames to prevent path traversal, and stores files outside the web root. This prevents arbitrary file upload, path traversal, and stored XSS via uploaded HTML files.

**OSINT Data Ingestion**: The Prismatic Platform ingests data from 120+ external OSINT sources. Each source produces differently formatted data that must be validated, normalized, and sanitized before entering the internal knowledge graph. Input sanitization ensures that maliciously crafted external data cannot inject graph queries, corrupt entity relationships, or trigger application errors.

## Related Concepts

Input sanitization connects to many security and software quality concepts:

- [Security](@/glossary/security.md) -- the overarching discipline of protecting systems from unauthorized access, data breaches, and operational disruption
- [Validation](@/glossary/validation.md) -- verifying that data conforms to expected formats, types, and constraints before processing
- [Injection Vulnerability](@/glossary/injection-vulnerability.md) -- a class of attacks that exploit insufficient input sanitization to execute unauthorized commands
- [OWASP](@/glossary/owasp.md) -- the Open Web Application Security Project that maintains the authoritative list of web application security risks
- [Authentication](@/glossary/authentication.md) -- verifying user identity, which itself requires careful input handling for credentials
- [Authorization](@/glossary/authorization.md) -- controlling access to resources based on authenticated identity and permissions
- [Encryption](@/glossary/encryption.md) -- protecting data confidentiality, complementing sanitization's focus on data integrity
- [Data Protection](@/glossary/data-protection.md) -- regulatory and technical measures for safeguarding personal and sensitive data
- [Error Handling](@/glossary/error-handling.md) -- gracefully handling validation failures without leaking internal system details
- [Ecto](@/glossary/ecto.md) -- the Elixir database library providing changeset-based input validation and parameterized queries

## See Also

- [Phoenix](@/glossary/phoenix.md) -- the web framework providing Plug-based request pipeline and auto-escaping templates
- [Rate Limiting](@/glossary/rate-limiting.md) -- throttling request volume to prevent abuse and denial-of-service attacks
- [RBAC](@/glossary/rbac.md) -- role-based access control complementing input sanitization for defense-in-depth
- [Credential Management](@/glossary/credential-management.md) -- securely handling authentication tokens and secrets
- [Compliance Framework](@/glossary/compliance-framework.md) -- regulatory requirements that mandate input validation and data protection

---

**Connect & Contribute**: Created by [Tomas Korcak (korczis)](https://github.com/korczis) | Part of the Prismatic Platform Glossary | Licensed under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)
