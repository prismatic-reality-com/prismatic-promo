# Prismatic Platform — Promo Site

Pure static site for [prismatic-reality.com](https://prismatic-reality.com), built with [Zola](https://www.getzola.org/).

## Stack

- **SSG**: Zola 0.22.1 (Rust)
- **CSS**: Tailwind + [Flowbite](https://flowbite.com/) (design system parity with the main platform)
- **JS**: Alpine.js (declarative UI), Chart.js (visualizations), p5.js (creative sketches), three.js (3D), Mermaid (diagrams)
- **Loading**: libraries are imported on-demand from CDN in `templates/base.html` — no node build step

## Local development

```bash
zola serve
```

## Deploy

Pushing to `main` triggers `.github/workflows/pages.yml`, which builds with Zola and publishes to GitHub Pages.

Custom domain: `prismatic-reality.com` (see `static/CNAME`).

## Content source

Markdown content lives under `content/`. The source of truth is mirrored from the private [prismatic-platform](https://github.com/korczis/prismatic-platform) umbrella at `apps/prismatic_web/priv/content/` — keep the two in sync when editing.

## License

General Honest License — see upstream repository for the full text.
