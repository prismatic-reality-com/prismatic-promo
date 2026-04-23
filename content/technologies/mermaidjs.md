+++
title = "Mermaid.js"
weight = 25
[extra]
category = "frontend"
description = "Markdown-driven diagramming and charting tool for generating diagrams from text definitions"
url = "https://mermaid.js.org"
version = "10+"
icon = "mermaid"
color = "pink"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1026
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Mermaidjs", "Markdown-driven", "technologies", "frontend", "Prismatic Platform", "Mermaid", "Architecture", "LiveView"]
tags = ["technologies", "frontend", "mermaidjs", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Mermaid.js - Prismatic Platform"
+++

## Overview

Mermaid.js is the diagramming library used throughout the Prismatic Platform for generating architecture diagrams, flowcharts, sequence diagrams, and entity relationship diagrams directly from markdown-style text definitions. It enables developers and documentation systems to create and maintain diagrams as code, ensuring they stay synchronized with the actual system architecture. This diagrams-as-code approach is essential for a platform with 90 applications and 404 agents, where manually maintained visual diagrams would become stale within days.

The Prismatic Platform uses Mermaid.js extensively in its documentation, CLAUDE.md files, and promotional site to visualize supervision trees, data flow architectures, agent interaction patterns, and deployment topologies. By defining diagrams as text, they can be version-controlled alongside code in [Git](@/technologies/git.md) and automatically rendered on the platform's web interfaces. When a supervision tree changes, the corresponding Mermaid diagram in the app's CLAUDE.md is updated in the same commit, maintaining documentation accuracy as a natural part of the development workflow.

Mermaid's support for multiple diagram types -- flowcharts, sequence diagrams, class diagrams, state diagrams, Gantt charts, and git graphs -- covers all the visualization needs of the platform's comprehensive documentation system spanning 90 applications and 404 agents. The library renders diagrams client-side in the browser, requiring no server-side image generation infrastructure.

## Key Features

- **Text-Based**: Define diagrams using intuitive markdown-like syntax that diffs cleanly in version control
- **Multiple Types**: Flowchart, sequence, class, state, ER, Gantt, pie, mindmap, timeline, and git graph
- **Theming**: Dark and light themes with customizable styles, matching the platform's dark-mode-first design
- **Auto-Layout**: Automatic node positioning with the Dagre layout engine, no manual coordinate placement
- **Interactive**: Click events and link support for navigable diagrams that link to platform documentation
- **SSR Support**: Server-side rendering capability for static site generation with [Zola](@/technologies/zola.md)
- **Security**: Strict security level prevents script injection through diagram definitions
- **Responsive**: Diagrams scale to container width, adapting to different viewport sizes

## Platform Integration

Mermaid.js renders architecture and data flow diagrams throughout the platform's documentation and dashboards. The following examples show the diagram types most commonly used in the platform.

Architecture diagrams visualize the relationships between platform applications.

```markdown
graph TD
    A[prismatic_web] -->|LiveView| B[Phoenix PubSub]
    B --> C[prismatic_agents]
    B --> D[prismatic_perimeter]
    C --> E[prismatic_storage_ecto]
    D --> E
    E --> F[(PostgreSQL)]
    C --> G[prismatic_storage_ets]
    G --> H[ETS Tables]
    D --> I[prismatic_storage_meilisearch]
    I --> J[(Meilisearch)]
```

Sequence diagrams document the interaction flow for complex operations like the EASM security rating pipeline.

```markdown
sequenceDiagram
    participant C as Client
    participant W as PrismaticWeb
    participant P as Perimeter
    participant S as Scanner
    participant DB as PostgreSQL

    C->>W: Request security rating
    W->>P: assess(domain)
    P->>S: scan_ssl(domain)
    P->>S: scan_headers(domain)
    P->>S: scan_dns(domain)
    S-->>P: scan results
    P->>P: calculate_rating()
    P->>DB: store_assessment()
    P-->>W: {:ok, rating}
    W-->>C: Rating dashboard
```

State diagrams visualize GenServer process lifecycles and agent state machines.

```markdown
stateDiagram-v2
    [*] --> Initializing: start_link/1
    Initializing --> Ready: init/1 success
    Initializing --> [*]: init/1 failure
    Ready --> Processing: handle_call/3
    Processing --> Ready: {:reply, ...}
    Ready --> Hibernated: hibernate_after timeout
    Hibernated --> Ready: incoming message
    Ready --> [*]: terminate/2
```

## Architecture

Mermaid.js operates at the documentation and visualization layer of the platform, rendering diagrams from text definitions embedded in markdown files and LiveView templates.

| Usage Context | Diagram Types | Rendering Method |
|---------------|--------------|------------------|
| CLAUDE.md files | Flowchart, sequence | Browser-side rendering on promo site |
| App documentation | Architecture, ER, state | Browser-side in documentation viewer |
| [Phoenix LiveView](@/technologies/phoenix-liveview.md) dashboards | Flowchart, sequence | Client-side with re-init hook |
| Promo site | All types | Zola build + browser rendering |
| Agent specifications | State, sequence | Static documentation |
| Architecture docs | Flowchart, class, ER | Version-controlled markdown |

The diagram rendering pipeline integrates with the platform's existing frontend stack.

| Component | Role |
|-----------|------|
| Mermaid.js library | Text-to-SVG rendering engine |
| [TailwindCSS](@/technologies/tailwindcss.md) | Styling containers around diagrams |
| [Flowbite](@/technologies/flowbite.md) | Card and panel components holding diagrams |
| Dark theme | `theme: 'dark'` matching platform colors |
| LiveView hooks | Re-render diagrams after DOM patches |

## Diagram Type Reference

The platform standardizes on specific Mermaid diagram types for each documentation purpose.

| Diagram Type | Platform Convention | When to Use |
|-------------|-------------------|-------------|
| `graph TD` | Architecture diagrams | Supervision trees, data flow, application relationships |
| `graph LR` | Pipeline diagrams | Data processing pipelines, CI/CD stages |
| `sequenceDiagram` | Interaction flows | API call sequences, multi-service operations |
| `stateDiagram-v2` | Process lifecycles | GenServer states, agent state machines |
| `erDiagram` | Data models | Database schema, entity relationships |
| `classDiagram` | Module structure | Behaviour implementations, protocol hierarchies |
| `gantt` | Project timelines | Milestone planning, sprint tracking |
| `pie` | Distribution charts | Resource allocation, category breakdown |

## Performance Characteristics

Mermaid.js rendering performance is important for dashboards that display multiple diagrams simultaneously.

| Metric | Value | Notes |
|--------|-------|-------|
| Simple flowchart render | < 50ms | 5-10 nodes |
| Complex architecture diagram | < 200ms | 20-50 nodes |
| Sequence diagram (10 messages) | < 100ms | Standard interaction flow |
| State diagram | < 50ms | Typical GenServer lifecycle |
| Bundle size (minified) | ~1.5 MB | Full Mermaid library |
| Bundle size (tree-shaken) | ~500 KB | Only used diagram types |
| Re-render after LiveView patch | < 100ms | Full Mermaid.run() call |
| Memory per diagram | < 5 MB | SVG DOM elements |

For pages displaying multiple diagrams, rendering is deferred using `startOnLoad: false` and triggered explicitly with `mermaid.run()` to control the rendering sequence and avoid layout thrashing.

## Configuration

Mermaid is initialized after page load with theme detection to match the platform's dark mode setting. The `strict` security level prevents any embedded scripts from executing within diagram definitions.

```javascript
// Mermaid initialization in Prismatic base template
document.addEventListener('DOMContentLoaded', function() {
    mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'strict',
        flowchart: { curve: 'basis', padding: 15 },
        sequence: { actorMargin: 50, messageMargin: 40 },
        themeVariables: {
            darkMode: true,
            primaryColor: '#3B82F6',
            primaryTextColor: '#F9FAFB',
            primaryBorderColor: '#6B7280',
            lineColor: '#9CA3AF',
            secondaryColor: '#1F2937',
            tertiaryColor: '#374151'
        }
    });
    mermaid.run();
});
```

For [Phoenix LiveView](@/technologies/phoenix-liveview.md) pages where the DOM is dynamically updated, Mermaid is re-run via a Phoenix hook to render diagrams inserted after the initial page load.

```javascript
// LiveView hook for Mermaid re-rendering
Hooks.MermaidDiagram = {
  mounted() {
    mermaid.run({ nodes: [this.el] });
  },
  updated() {
    mermaid.run({ nodes: [this.el] });
  }
};
```

## Best Practices

- **Use `graph TD` for architecture** -- top-down layout matches how developers think about supervision trees and data flow
- **Use `sequenceDiagram` for workflows** -- sequence diagrams clearly show the order of operations across services
- **Keep diagrams focused** -- one diagram per concept; do not combine unrelated flows into a single diagram
- **Version diagrams with code** -- when a module's structure changes, update its Mermaid diagram in the same commit
- **Use strict security level** -- always set `securityLevel: 'strict'` to prevent diagram-based injection
- **Apply dark theme consistently** -- all diagrams should use `theme: 'dark'` to match the platform's forced dark mode
- **Limit node count** -- diagrams with more than 50 nodes become difficult to read; split into sub-diagrams
- **Use meaningful node labels** -- nodes should display the actual module or service name, not abbreviations

## Comparison with Alternatives

| Feature | Mermaid.js | D2 | PlantUML | Graphviz | Draw.io |
|---------|-----------|-----|----------|----------|---------|
| Text-based | Yes | Yes | Yes | Yes | No (visual) |
| Browser rendering | Yes | No (CLI) | No (Java) | No (CLI) | Yes |
| Version control friendly | Yes | Yes | Yes | Yes | Partial (XML) |
| Dark theme | Yes | Yes | No | No | Yes |
| Interactive | Click events | No | No | No | Yes (editing) |
| LiveView compatible | Yes (hooks) | N/A | N/A | N/A | Iframe |
| Diagram types | 12+ | 8+ | 15+ | Graphs only | All |
| Learning curve | Low | Low | Medium | High | Low |

Mermaid.js was chosen for its browser-native rendering (no server dependencies), dark theme support, and ease of integration with [Phoenix LiveView](@/technologies/phoenix-liveview.md) through JavaScript hooks.

## Related Technologies

- [TailwindCSS](@/technologies/tailwindcss.md) - Styling for diagram container elements and responsive layout
- [Flowbite](@/technologies/flowbite.md) - Card and panel components that hold diagram visualizations
- [Zola](@/technologies/zola.md) - Static site generator that renders pages containing Mermaid diagrams
- [Alpine.js](@/technologies/alpinejs.md) - Client-side interactivity for diagram toggle controls
- [Phoenix LiveView](@/technologies/phoenix-liveview.md) - Server-rendered pages requiring Mermaid re-initialization

## Related Apps

- Documentation across all 90 Prismatic Platform applications uses Mermaid diagrams
- [prismatic_web](@/apps/prismatic-web.md) - LiveView dashboards with embedded Mermaid architecture diagrams
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - EASM pipeline visualization using sequence diagrams

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)