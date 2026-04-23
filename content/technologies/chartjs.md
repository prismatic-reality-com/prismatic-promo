+++
title = "Chart.js"
weight = 23
[extra]
category = "frontend"
description = "Simple yet flexible charting library for creating beautiful data visualizations in the browser"
url = "https://www.chartjs.org"
version = "4.4+"
icon = "chartjs"
color = "pink"
status = "active"
reading_time = "8 min"
author = "Tomas Korcak (korczis)"
word_count = 1104
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Chartjs", "Simple", "technologies", "frontend", "Prismatic Platform", "Chart", "LiveView", "Canvas", "Good"]
tags = ["technologies", "frontend", "chartjs", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Chart.js - Prismatic Platform"
+++

## Overview

Chart.js is the primary data visualization library used in the Prismatic Platform for rendering charts, graphs, and visual analytics across all dashboard interfaces. It provides a comprehensive set of chart types -- bar, line, doughnut, radar, scatter, and more -- that power the platform's security dashboards, performance metrics, and intelligence analysis displays. Chart.js strikes the optimal balance between rendering capability and bundle size, delivering publication-quality visualizations without the overhead of full-featured charting frameworks.

The Prismatic Platform uses Chart.js for visualizing security rating distributions, agent activity timelines, OSINT source coverage breakdowns, compliance score comparisons, and real-time performance metrics. Chart.js's responsive design and animation capabilities create polished visualizations that update in real-time through [Phoenix LiveView](@/technologies/phoenix-liveview.md) hooks -- when a security rating changes or a new agent comes online, the chart animates smoothly to reflect the updated data without full page reloads or jarring visual transitions.

Chart.js's dark mode compatibility and extensive customization options allow it to integrate seamlessly with the platform's [TailwindCSS](@/technologies/tailwindcss.md)-based design system, maintaining visual consistency across all dashboard views. Every chart uses the platform's standard color palette and typography, configured through a shared Chart.js defaults object that ensures all visualizations feel like a cohesive part of the interface rather than embedded third-party widgets.

## Key Features

Chart.js provides a focused set of charting capabilities that cover the platform's visualization needs with minimal configuration overhead.

- **8 Chart Types**: Bar, line, doughnut, pie, radar, scatter, bubble, and polar area charts covering all standard visualization patterns
- **Responsive**: Automatic resizing to fit container dimensions on any screen size, from mobile to ultra-wide monitors
- **Animations**: Smooth transitions and enter/exit animations when data changes, configurable per-dataset and per-chart
- **Plugins**: Extensible through a plugin system (annotations, zoom, datalabels, streaming) for specialized visualization needs
- **Tooltip System**: Rich, customizable hover tooltips with HTML rendering support for detailed data exploration
- **Accessibility**: Built-in ARIA support and keyboard navigation for screen reader compatibility
- **Mixed Charts**: Combine multiple chart types on a single canvas for multi-metric views (e.g., bar + line overlays)
- **Scales**: Multiple scale types (linear, logarithmic, time, category) with full customization of axis appearance
- **Tree Shaking**: Register only the chart types and components used to minimize bundle size in production

| Chart Type | Platform Usage | LiveView Integration |
|------------|---------------|---------------------|
| Doughnut | Security rating distribution (A-F grades) | Real-time rating updates |
| Radar | Security breakdown by category (SSL, DNS, etc.) | Per-domain assessment changes |
| Line | Agent activity over time, performance trends | Streaming time-series data |
| Bar | Compliance score comparison across frameworks | Batch assessment results |
| Scatter | Risk score vs. confidence level correlation | Interactive drill-down |
| Polar Area | OSINT source coverage by domain | Collection status updates |

## Platform Integration

Chart.js renders analytics visualizations across platform dashboards. LiveView hooks manage the chart lifecycle, creating instances on mount and updating data when the server pushes new assigns. This pattern ensures charts remain synchronized with the platform's real-time data without manual polling.

```javascript
// LiveView hook for real-time Chart.js updates
Hooks.SecurityRatingChart = {
    mounted() {
        const ctx = this.el.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['A', 'B', 'C', 'D', 'F'],
                datasets: [{
                    data: JSON.parse(this.el.dataset.ratings),
                    backgroundColor: [
                        '#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#9ca3af', font: { size: 11 } }
                    }
                }
            }
        });

        this.handleEvent("rating_updated", ({ratings}) => {
            this.chart.data.datasets[0].data = ratings;
            this.chart.update('active');
        });
    },

    destroyed() {
        if (this.chart) this.chart.destroy();
    }
};
```

The Perimeter EASM dashboard uses a radar chart to visualize security rating breakdowns across categories, providing an at-a-glance view of a domain's security posture:

```javascript
// Security breakdown radar chart
new Chart(radarCtx, {
    type: 'radar',
    data: {
        labels: ['SSL/TLS', 'Headers', 'DNS', 'Vulnerabilities', 'Compliance', 'Reputation'],
        datasets: [{
            label: 'Current Score',
            data: [92, 85, 78, 95, 88, 72],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            pointBackgroundColor: '#3b82f6'
        }]
    },
    options: {
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                grid: { color: '#374151' },
                pointLabels: { color: '#9ca3af' },
                ticks: { display: false }
            }
        }
    }
});
```

## Architecture

Chart.js integrates into the platform's frontend architecture through LiveView hooks, forming a bridge between server-side data management and client-side rendering. The data flow is unidirectional: the server pushes data updates through LiveView events, and the client-side hooks translate those into Chart.js update calls.

| Layer | Component | Responsibility |
|-------|-----------|----------------|
| Server | LiveView assigns | Data preparation and event emission |
| Transport | WebSocket | Real-time data push to connected clients |
| Client Hook | LiveView Hook | Chart lifecycle management (create, update, destroy) |
| Rendering | Chart.js Canvas | Pixel-level chart rendering with animations |
| Styling | Platform Defaults | Consistent colors, fonts, and theme compliance |

The LiveView hook pattern ensures proper memory management. Charts are created in `mounted()`, updated via `handleEvent()`, and destroyed in `destroyed()`. This lifecycle alignment prevents the canvas memory leaks that commonly occur when chart instances outlive their DOM containers.

## Performance Characteristics

Chart.js was selected for its optimal balance between rendering capability and performance overhead. The platform's 250ms page load requirement necessitates lightweight client-side libraries.

| Metric | Value | Notes |
|--------|-------|-------|
| Bundle size (min+gzip) | ~65KB (full) / ~30KB (tree-shaken) | Includes all chart types |
| Canvas render time | < 16ms (60fps) | Smooth animations at standard frame rate |
| Data point limit | ~10,000 per dataset | Beyond this, decimation plugin recommended |
| Animation duration | 400ms default | Configurable per chart and per dataset |
| Memory per chart | ~2-5MB | Depends on canvas size and data density |
| Update latency | < 5ms | Data update + animation trigger |

For dashboards displaying multiple charts simultaneously, the platform uses `requestAnimationFrame`-aligned updates to batch chart redraws and avoid layout thrashing. Charts that are not currently visible (scrolled off-screen or in collapsed panels) have their animations paused to reduce CPU usage.

## Configuration

Chart.js is loaded via CDN and configured with platform-wide defaults that enforce the dark theme and consistent styling across all dashboards.

```html
<!-- Chart.js loaded via CDN -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

<script>
// Platform-wide Chart.js defaults
Chart.defaults.color = '#9ca3af';
Chart.defaults.borderColor = '#374151';
Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.animation.duration = 400;
Chart.defaults.responsive = true;
Chart.defaults.maintainAspectRatio = false;
</script>
```

The platform defines a standard color palette for consistent chart appearances:

```javascript
// Standard platform chart colors
const PrismaticColors = {
    grades: {
        A: '#22c55e',  // Green
        B: '#3b82f6',  // Blue
        C: '#eab308',  // Yellow
        D: '#f97316',  // Orange
        F: '#ef4444'   // Red
    },
    series: [
        '#3b82f6', '#8b5cf6', '#06b6d4',
        '#10b981', '#f59e0b', '#ef4444'
    ],
    grid: '#374151',
    text: '#9ca3af'
};
```

## Best Practices

The platform enforces Chart.js usage conventions to prevent common issues and maintain visual consistency across all dashboard views.

- **Always destroy charts in LiveView `destroyed` hooks** -- orphaned Chart.js instances cause memory leaks in single-page applications
- **Use `update('active')` for smooth transitions** -- calling `update()` without a mode causes jarring full redraws
- **Set `maintainAspectRatio: false`** and control sizing through the container element rather than chart options
- **Use the platform color palette** -- maintain visual consistency by referencing the shared `PrismaticColors` constants
- **Debounce rapid updates** -- when PubSub events arrive faster than the animation duration, batch them to avoid visual stutter
- **Register only needed components** -- use Chart.js tree-shaking to reduce bundle size when only a subset of chart types is used
- **Add `aria-label` to canvas elements** -- ensure charts are accessible to screen readers with descriptive labels
- **Use decimation for large datasets** -- enable the decimation plugin when datasets exceed 1,000 points to maintain rendering performance

## Comparison

Chart.js was chosen over more complex charting libraries for its simplicity, dark mode support, and excellent LiveView integration characteristics.

| Criterion | Chart.js | D3.js | ECharts | Recharts |
|-----------|---------|-------|---------|----------|
| Bundle size | ~65KB | ~250KB | ~400KB | ~200KB (React dep) |
| Learning curve | Low | High | Moderate | Moderate |
| Chart types | 8 built-in | Unlimited (custom) | 20+ built-in | 10+ built-in |
| Canvas-based | Yes | SVG (typically) | Canvas + SVG | SVG (React) |
| LiveView compatibility | Excellent (hooks) | Good (manual DOM) | Good (hooks) | Poor (React required) |
| Dark mode support | Native defaults | Manual theming | Native options | Manual theming |
| Animation quality | Good | Excellent | Excellent | Good |

## Related Technologies

- [Phoenix LiveView](@/technologies/phoenix-liveview.md) - Server-driven real-time chart data updates through LiveView hooks
- [Alpine.js](@/technologies/alpinejs.md) - Client-side interaction handling alongside chart controls and filters
- [TailwindCSS](@/technologies/tailwindcss.md) - CSS framework providing the design system that charts integrate with
- [Flowbite](@/technologies/flowbite.md) - UI component library used alongside chart containers and dashboard layouts
- [Phoenix Framework](@/technologies/phoenix.md) - Web framework providing the WebSocket transport for real-time updates

## Related Apps

- [prismatic_web](@/apps/prismatic-web.md) - Dashboard chart rendering across all platform modules and views
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - Security analytics radar and distribution charts for EASM monitoring
- [prismatic_agents](@/apps/prismatic-agents.md) - Agent activity and performance visualization dashboards

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)