[38;2;248;248;242m# Prismatic Platform — Promo Site[0m

[38;2;248;248;242mPure static site for [prismatic-reality.com](https://prismatic-reality.com), built with [Zola](https://www.getzola.org/).[0m

[38;2;248;248;242m## Stack[0m

[38;2;248;248;242m- **SSG**: Zola 0.22.1 (Rust)[0m
[38;2;248;248;242m- **CSS**: Tailwind + [Flowbite](https://flowbite.com/) (design system parity with the main platform)[0m
[38;2;248;248;242m- **JS**: Alpine.js (declarative UI), Chart.js (visualizations), p5.js (creative sketches), three.js (3D), Mermaid (diagrams)[0m
[38;2;248;248;242m- **Loading**: libraries are imported on-demand from CDN in `templates/base.html` — no node build step[0m

[38;2;248;248;242m## Local development[0m

[38;2;248;248;242m```bash[0m
[38;2;248;248;242mzola serve[0m
[38;2;248;248;242m```[0m

[38;2;248;248;242m## Deploy[0m

[38;2;248;248;242mPushing to `main` triggers `.github/workflows/pages.yml`, which builds with Zola and publishes to GitHub Pages.[0m

[38;2;248;248;242mCustom domain: `prismatic-reality.com` (see `static/CNAME`).[0m

[38;2;248;248;242m## Content source[0m

[38;2;248;248;242mMarkdown content lives under `content/`. The source of truth is mirrored from the private [prismatic-platform](https://github.com/korczis/prismatic-platform) umbrella at `apps/prismatic_web/priv/content/` — keep the two in sync when editing.[0m

[38;2;248;248;242m## License[0m

[38;2;248;248;242mGeneral Honest License — see upstream repository for the full text.[0m
