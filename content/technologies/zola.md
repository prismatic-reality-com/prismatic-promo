+++
title = "Zola"
weight = 90
[extra]
category = "tools"
description = "Fast static site generator written in Rust with built-in Sass compilation and search index generation"
url = "https://www.getzola.org"
version = "0.19+"
icon = "zola"
color = "teal"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 951
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Zola", "Fast", "Rust", "Sass", "technologies", "tools", "Prismatic Platform", "Markdown", "Built", "TOML"]
tags = ["technologies", "tools", "zola", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Zola - Prismatic Platform"
+++

## Overview

Zola is the static site generator that powers the Prismatic Platform's promotional website and documentation site. Written in Rust, Zola compiles Markdown content with TOML frontmatter into a complete static website in seconds, supporting custom templates, Sass compilation, syntax highlighting for 100+ programming languages, and search index generation. The platform's promotional site contains over 1,050 Markdown files across 12 content sections, and Zola builds the entire site in under 10 seconds.

The Prismatic Platform's promotional site uses Zola with a custom template system built on [TailwindCSS](@/technologies/tailwindcss.md), [Flowbite](@/technologies/flowbite.md), and [Alpine.js](@/technologies/alpinejs.md). Zola's section/page model maps naturally to the platform's content organization -- each technology, agent, command, and OSINT source has its own Markdown page with structured frontmatter metadata that drives both page rendering and section-level filtering, search, and navigation.

Zola's single-binary architecture and zero runtime dependencies make it ideal for CI/CD pipelines -- the GitLab CI and GitHub Actions pipelines build and deploy the promotional site in seconds without managing Node.js, Ruby, or other runtime dependencies. The binary runs on Linux, macOS, and Windows, enabling local development on any platform without environment configuration.

## Key Features

- **Rust Performance**: Sub-second incremental builds and full site builds in under 10 seconds for 1,050+ pages, with no JIT warmup or interpreter overhead
- **Single Binary**: No runtime dependencies (no Node.js, Ruby, or Python required), simple CI/CD integration with a single binary download
- **Tera Templates**: Jinja2-like template engine with inheritance, blocks, macros, and filters for sophisticated template logic
- **TOML Frontmatter**: Structured metadata for content pages with typed fields, `[extra]` sections for custom data, and taxonomies
- **Taxonomies**: Built-in category and tag system with automatically generated taxonomy pages and term listings
- **Shortcodes**: Custom content macros for reusable elements like code blocks, callouts, and component previews
- **Syntax Highlighting**: Built-in server-side code highlighting with 100+ languages using Sublime Text syntax definitions
- **Search Index**: Automatic JSON search index generation for client-side full-text search without external services
- **Live Reload**: Development server with automatic page reload on content or template changes for rapid iteration

## Platform Integration

Zola generates the platform's promotional site from structured Markdown content. Each content page includes TOML frontmatter that defines metadata used for rendering, filtering, and navigation.

```toml
# config.toml - Prismatic promo site configuration
base_url = "https://prismatic-reality.com"
title = "Prismatic Platform"
description = "Enterprise-Grade AI-Orchestrated Development & Intelligence Platform"
compile_sass = false
generate_feeds = false
build_search_index = true

[search]
include_title = true
include_description = true
include_path = true
include_content = true

[extra]
flowbite_version = "2.3.0"
alpine_js_version = "3.13.5"
tailwind_version = "3.4"
```

Content pages follow a consistent pattern with typed frontmatter:

```markdown
+++
title = "Elixir"
weight = 1
[extra]
category = "language"
description = "Dynamic, functional language for scalable applications"
url = "https://elixir-lang.org"
version = "1.19+"
icon = "elixir"
color = "purple"
status = "active"
reading_time = "8 min"
+++

## Overview
Content here with cross-references like [Phoenix](@/technologies/phoenix.md)...
```

Templates use Tera's template inheritance for consistent layout across all 1,050+ pages:

```html
<!-- templates/technologies/page.html -->
{% extends "base.html" %}

{% block content %}
<article class="max-w-4xl mx-auto px-4 py-12">
    <h1 class="text-4xl font-black text-white mb-4">{{ page.title }}</h1>
    {% if page.extra.description %}
    <p class="text-lg text-gray-400 mb-8">{{ page.extra.description }}</p>
    {% endif %}

    <div class="prose prose-invert prose-lg max-w-none">
        {{ page.content | safe }}
    </div>
</article>
{% endblock content %}
```

## Architecture

Zola's build pipeline transforms Markdown content into a static website through a defined series of stages.

| Stage | Input | Output | Purpose |
|-------|-------|--------|---------|
| **Parse** | Markdown + TOML frontmatter | Structured content AST | Extract metadata and body content |
| **Template** | Tera templates + content | HTML pages | Apply layout and section templates |
| **Sass** | `.scss` files | Compiled CSS | Style compilation (optional) |
| **Syntax** | Code blocks in content | Highlighted HTML | Server-side syntax highlighting |
| **Search** | All page content | `search_index.en.json` | Full-text search index |
| **Copy** | `static/` directory | `public/static/` | Static asset deployment |
| **Sitemap** | All generated pages | `sitemap.xml` | SEO sitemap generation |

Content organization follows Zola's section model:

```
content/
  _index.md              # Site root section
  technologies/
    _index.md            # Section index (list template)
    elixir.md            # Individual page
    phoenix.md           # Individual page
    ...45 technology pages
  agents/
    _index.md            # Section index
    ...427 agent pages
  apps/
    _index.md            # Section index
    ...88 app pages
  glossary/
    _index.md            # Section index
    ...127 glossary pages
```

## Performance Characteristics

Zola's Rust implementation delivers build performance that scales linearly with content volume, making it suitable for large documentation sites.

| Metric | Value | Notes |
|--------|-------|-------|
| Full site build (1,050 pages) | ~6-10 seconds | All pages, templates, and static assets |
| Incremental rebuild | <500ms | Single page change |
| Dev server startup | <1 second | Including initial build |
| Live reload latency | <200ms | From file save to browser refresh |
| Memory usage (build) | ~50MB | For 1,050 page site |
| Output size (HTML) | ~15MB | Uncompressed HTML pages |
| Search index size | ~2MB | JSON full-text search index |
| Binary size | ~15MB | Single static binary, no dependencies |

## Configuration

```bash
# Zola development workflow
zola serve          # Dev server with live reload at http://127.0.0.1:1111
zola build          # Production build to public/ directory
zola check          # Validate internal links and content

# Full build pipeline with TailwindCSS
cd sites/promo
npm install
npx tailwindcss -i static/css/tailwind-input.css -o static/css/tailwind.css --minify
zola build
```

Deployment configuration for GitHub Pages:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Zola
        run: |
          wget -q https://github.com/getzola/zola/releases/download/v0.19.2/zola-v0.19.2-x86_64-unknown-linux-gnu.tar.gz
          tar xzf zola-*.tar.gz
      - name: Build site
        run: ./zola build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

## Best Practices

- **Use `[extra]` for custom metadata** -- section `_index.md` files must NOT use `[taxonomies]` or root-level `date` fields; use `[extra]` for all custom data
- **Validate internal links** -- all `/path/file/` cross-references must point to existing files; run `zola check` or `zola build` to catch broken links
- **Use section templates for lists** -- create `templates/section_name/list.html` for section index pages and `templates/section_name/page.html` for individual pages
- **Keep frontmatter consistent** -- use the same `[extra]` fields across pages in a section to enable reliable template rendering and filtering
- **Rebuild TailwindCSS after template changes** -- Zola does not rebuild Tailwind; run the TailwindCSS build command after modifying template class usage
- **Use shortcodes for reusable patterns** -- define shortcodes in `templates/shortcodes/` for callouts, badges, and other repeated content elements
- **Wrap section content in `<div>` not `<p>`** -- `{{ section.content | safe }}` containing block-level HTML inside `<p>` tags breaks rendering

## Comparison with Alternatives

| Feature | Zola | Hugo | Jekyll | Gatsby | Astro |
|---------|------|------|--------|--------|-------|
| Language | Rust | Go | Ruby | JavaScript | JavaScript |
| Build speed (1000 pages) | ~6-10s | ~5-8s | ~30-60s | ~60-120s | ~20-40s |
| Runtime dependencies | None (single binary) | None (single binary) | Ruby + gems | Node.js + npm | Node.js + npm |
| Template engine | Tera (Jinja2-like) | Go templates | Liquid | React/JSX | Astro/JSX |
| Content format | Markdown + TOML | Markdown + YAML/TOML | Markdown + YAML | Markdown + frontmatter | Markdown + frontmatter |
| Search index | Built-in JSON | Built-in JSON | Via plugin | Via plugin | Via plugin |
| Syntax highlighting | Built-in (100+ langs) | Built-in (Chroma) | Via Rouge gem | Via plugin | Via Shiki |
| Learning curve | Low | Medium | Low | High | Medium |

Zola was chosen because it provides the fastest build times for large sites (1,050+ pages) with zero runtime dependencies, making CI/CD deployment trivial and local development instant.

## Zola Frontmatter Constraints

Understanding the distinction between section indexes and regular pages is critical for avoiding build failures.

| Rule | `_index.md` (Section) | Regular pages |
|------|----------------------|---------------|
| `[taxonomies]` | Forbidden | Allowed |
| `date` field | Forbidden (use `[extra].date_created`) | Allowed |
| `updated` field | Forbidden | Allowed |
| `[extra]` section | Required for custom data | Required for custom data |
| `weight` | Controls section ordering | Controls page ordering within section |
| `/path/file/` links | Must point to existing files | Must point to existing files |

## Related Technologies

- [TailwindCSS](@/technologies/tailwindcss.md) - Site styling through utility classes in Zola templates
- [Alpine.js](@/technologies/alpinejs.md) - Client-side interactivity for filtering, search, and navigation
- [Flowbite](@/technologies/flowbite.md) - UI component library used in Zola templates
- [Git](@/technologies/git.md) - Version control for content and templates
- [Docker](@/technologies/docker.md) - Container-based CI/CD build environment

## Related Apps

- This promotional site is built with Zola and deployed to GitHub Pages and GitLab Pages
- Content is maintained separately from the main Prismatic Platform codebase for security isolation

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)