+++
title = "Prismatic Browser"
weight = 28
[extra]
icon = "globe-alt"
color = "sky"
description = "Headless browser automation for web scraping, screenshots, and JavaScript rendering"
category = "Collection"
files = "170"
status = "Production"
author = "Tomas Korcak (korczis)"
reading_time = "4 min"
word_count = 834
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Browser", "Headless", "JavaScript", "apps", "Collection", "Prismatic Platform", "PrismaticBrowser", "OSINT"]
tags = ["apps", "collection", "prismatic-browser", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Browser - Prismatic Platform"
+++

## Overview

Prismatic Browser provides headless browser automation capabilities for web content collection that requires JavaScript rendering, managing a supervised pool of Chromium instances for parallel page loading, screenshot capture, DOM extraction, and interaction automation. The system is essential for [OSINT](@/glossary/osint.md) collection from modern JavaScript-heavy web applications where HTTP-only crawling returns empty or incomplete content.

Modern web applications render content dynamically through JavaScript execution. A standard HTTP client retrieving the HTML source of such applications receives only the application shell without rendered content. Government portals, financial services, and corporate websites increasingly use single-page application architectures that load data asynchronously after initial page load. OSINT collection from these sources requires a full browser environment that executes JavaScript, waits for content rendering, and then extracts the final DOM state.

The architecture implements a pool manager that maintains configurable browser instances with automatic recycling, health monitoring, and memory-aware scaling. Anti-detection features include user-agent rotation, fingerprint management, proxy rotation with health checking, and request timing randomization to avoid triggering anti-bot protections on target sites. Each browser instance runs as an isolated supervised process, ensuring that a crash or memory leak in one instance does not affect the pool or other rendering operations. After each request, instances are recycled by clearing cookies, local storage, and navigation history, with full restarts after a configurable number of requests to prevent JavaScript heap accumulation.

## Architecture

The architecture follows a pool-based design with priority-ordered request queuing, managed instance allocation, and health monitoring.

```
Request Queue (priority-based)
       |
  Pool Manager
  (instance allocation, health monitoring)
       |
  +----+----+----+----+----+
  |    |    |    |    |    |
  Browser Browser Browser Browser Browser
  Instance Instance Instance Instance Instance
       |
  Page Load --> JavaScript Execution --> Wait for Selector
       |
  Content Extraction (CSS/XPath selectors)
  Screenshot Capture (full page/element)
  PDF Generation
       |
  Result Return --> Instance Recycle
```

The process topology uses three supervised GenServers managing the pool, request queue, and health monitoring:

```
PrismaticBrowser.Application (Supervisor, :one_for_one)
+-- PrismaticBrowser.PoolManager (GenServer)
|     Manages browser instance pool, allocation, recycling
+-- PrismaticBrowser.RequestQueue (GenServer)
|     Priority queue for pending browser requests
+-- PrismaticBrowser.HealthMonitor (GenServer)
      Periodic instance health checks and memory monitoring
```

Requests enter the RequestQueue with priority ordering. The PoolManager allocates an available browser instance or queues the request if all instances are busy. The instance navigates to the target URL, executes JavaScript, waits for the specified selector or timeout, and performs the requested operation. Results are returned to the caller, and the instance is recycled for reuse.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticBrowser` | Public facade: `render/2`, `screenshot/2`, `extract/2` |
| `PrismaticBrowser.PoolManager` | Browser instance pool lifecycle management and allocation |
| `PrismaticBrowser.Instance` | Individual browser instance wrapper with health monitoring |
| `PrismaticBrowser.Extractor` | CSS selector and XPath-based DOM data extraction |
| `PrismaticBrowser.Screenshot` | Screenshot capture at configurable resolutions and formats |
| `PrismaticBrowser.AntiDetection` | User-agent rotation, fingerprint management, proxy support |
| `PrismaticBrowser.RequestQueue` | Priority-based request queuing with timeout management |

```elixir
defmodule PrismaticBrowser.RenderResult do
  @type t :: %__MODULE__{
    url: String.t(),
    status: pos_integer(),
    content: String.t(),
    extracted_data: map() | nil,
    screenshot: binary() | nil,
    render_time_ms: pos_integer(),
    javascript_errors: [String.t()]
  }
end
```

## Configuration

```elixir
config :prismatic_browser,
  pool_size: 5,
  max_requests_per_instance: 100,
  request_timeout: 30_000,
  page_load_timeout: 15_000,
  memory_limit_mb: 512,
  user_agent_pool_size: 50,
  proxy_rotation: true,
  anti_detection: true
```

Pool size determines concurrent rendering capacity with each instance consuming approximately 100-200MB of memory. The max requests per instance setting controls how many pages an instance renders before a full restart to prevent memory leaks. Request and page load timeouts protect against unresponsive target sites. The memory limit triggers instance recycling when heap usage exceeds the threshold.

## API Reference

```elixir
# Render page and extract content
@spec render(String.t(), keyword()) :: {:ok, RenderResult.t()} | {:error, term()}
PrismaticBrowser.render("https://example.com",
  wait_for: "#main-content", extract: :text)

# Capture screenshot at specified resolution
@spec screenshot(String.t(), keyword()) :: {:ok, binary()} | {:error, term()}
PrismaticBrowser.screenshot("https://example.com",
  width: 1920, height: 1080, format: :png)

# Extract structured data using selector map
@spec extract(String.t(), map()) :: {:ok, map()} | {:error, term()}
PrismaticBrowser.extract("https://example.com", %{
  title: "h1", items: "ul.results li", links: "a[href]"})
```

## Testing

Extractor tests verify CSS selector and XPath extraction against known HTML structures. Anti-detection tests verify user-agent rotation and fingerprint randomization produce expected distributions. Full rendering pipeline integration tests load known web pages and verify content extraction, screenshot capture, and error handling.

Property-based tests use StreamData generators to produce random CSS selectors and URLs, verifying that the browser pool handles all inputs without crashing or leaking instances. Pool management tests verify correct allocation, recycling, and exhaustion handling under concurrent load.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic Cache](@/apps/prismatic-cache.md) | Rendered content caching for repeated access |
| [Prismatic Resilience](@/apps/prismatic-resilience.md) | [Circuit breaker](@/glossary/circuit-breaker.md) patterns for failing target sites |
| [Prismatic Crawler](@/apps/prismatic-crawler.md) | JavaScript-rendered page collection integration |
| [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) | OSINT source content extraction |
| [Prismatic Perimeter](@/apps/prismatic-perimeter.md) | Target website analysis during attack surface discovery |

External dependency: Chromium browser binary (headless mode) with Chrome DevTools [Protocol](@/glossary/protocol.md) for browser control. No cloud rendering services are used.

## NABLA Compliance

| NABLA Axiom | Browser Enforcement | Implementation |
|-------------|-------------------|----------------|
| Provenance Mandatory | Every render result carries source URL and timestamp | RenderResult struct includes URL, status, and timing metadata |
| Time Decay | Cached renders expire based on configurable TTL | Integration with Prismatic Cache for time-aware content freshness |
| Unknown Valid | JavaScript errors and partial renders flagged as uncertain | RenderResult includes javascript_errors field for transparency |

Malicious web pages could attempt to exploit browser vulnerabilities. Sandboxed Chromium execution with restricted permissions mitigates this risk. No file system access or network access beyond the target page is permitted from the browser context.

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Page render (simple) | 1-3s | Including JavaScript execution |
| Page render (complex SPA) | 3-10s | Multiple async data loads |
| Screenshot capture | 500ms-2s | After page render |
| DOM extraction | < 100ms | After page render |
| Instance recycling | 200-500ms | Clear state + verify health |

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 1 GB (2 instances) | 4 GB (10 instances) |
| CPU | 2 cores | 4 cores |

[Telemetry](@/glossary/telemetry.md) events: `[:prismatic, :browser, :render]`, `[:prismatic, :browser, :instance_recycled]`, `[:prismatic, :browser, :pool_exhausted]`. Key [metrics](@/glossary/metrics.md) include render latency, pool utilization, and memory consumption per instance.

## Related Resources

- [Prismatic Crawler](@/apps/prismatic-crawler.md) -- HTTP-based crawling infrastructure
- [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) -- Intelligence source layer
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) -- Browser automation protocol
- [Adapter Pattern Specialist](@/agents/adapter-pattern-specialist.md) -- Designs adapter interfaces for browser pool management and content extraction
- [Alert Management Specialist](@/agents/alert-management-specialist.md) -- Configures alerting for pool exhaustion and instance health degradation
- [Competitor Researcher](@/agents/competitor-researcher.md) -- Leverages browser automation for competitive intelligence collection
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Combines browser-rendered content with other OSINT sources
- [Real-Time Monitoring](@/capabilities/real-time-monitoring.md) -- Monitors browser pool utilization and render latency in real time
- [Quality Gates](@/capabilities/quality-gates.md) -- Validates content extraction accuracy and pool management reliability

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)