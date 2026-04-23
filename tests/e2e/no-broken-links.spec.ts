/**
 * no-broken-links.spec.ts — e2e regression for subpath-deploy link integrity.
 *
 * The promo site lives under /prismatic-promo/ on GitHub Pages. Templates
 * historically shipped with bare `href="/blog/"` style links that resolve
 * to the host root and 404 in production. Also: inline `.src = "/js/..."`
 * assignments in the base.html lazy-loader silently failed for the same
 * reason, breaking every Chart.js / p5.js / three.js visualization on
 * subpath deploys.
 *
 * The fix rule: every root-relative internal path must be prefixed with
 * `{{ config.base_url | safe }}` so Zola emits absolute URLs that include
 * the GitHub Pages subpath.
 *
 * This spec asserts those rules end-to-end against a local Zola build
 * served under `http://localhost:8787` — see playwright.config.ts
 * `webServer.command`. When Playwright builds with base-url localhost,
 * all internal links SHOULD start with `http://localhost:8787/...`, never
 * bare `/path/`. And every JS resource the lazy-loader tries to fetch
 * MUST return 200.
 */
import { test, expect, Page, Response } from '@playwright/test';

const INTERNAL_PATHS = [
  '/',
  '/blog/',
  '/dd/',
  '/osint/',
  '/lab/',
  '/agents/',
  '/apps/',
  '/developers/',
  '/api/',
  '/commands/',
  '/capabilities/',
  '/architecture/',
  '/technologies/',
  '/glossary/',
  '/registry/',
  '/about/',
];

/**
 * Collect every response for the page and return those with non-2xx status.
 * Used to catch 404s for lazy-loaded JS + CSS assets.
 */
function collectBadResponses(page: Page): { bad: Response[] } {
  const bad: Response[] = [];
  page.on('response', (resp) => {
    // Only flag same-origin; CDN requests (fonts, three.js, p5.js) are
    // independent and can genuinely 5xx without being the site's fault.
    const url = resp.url();
    if (!url.startsWith('http://localhost:8787')) return;
    if (resp.status() >= 400) bad.push(resp);
  });
  return { bad };
}

test.describe('subpath-safe link integrity', () => {
  test('homepage loads with no 404 on any same-origin resource', async ({ page }) => {
    const { bad } = collectBadResponses(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    // Trigger lazy-loader by waiting a moment for the inline script
    // detection + dynamic script load to complete.
    await page.waitForTimeout(500);

    const failures = bad.map((r) => `${r.status()} ${r.url()}`).join('\n  ');
    expect(bad, `broken resources:\n  ${failures}`).toHaveLength(0);
  });

  test('every navbar link navigates to 200 OK (no 404)', async ({ page }) => {
    await page.goto('/');

    // Grab every anchor whose href starts with the test base URL. Filter
    // to internal section roots only — external and hash-only links are
    // out of scope for this check.
    const hrefs = await page.locator('a[href]').evaluateAll((els) =>
      els
        .map((a) => (a as HTMLAnchorElement).href)
        .filter((h) => h.startsWith('http://localhost:8787/'))
        // Skip hash-only, mailto, javascript: and obvious dynamic trap URLs
        .filter((h) => !h.includes('#') || h.split('#')[1] === '')
        // Deduplicate
        .filter((h, i, arr) => arr.indexOf(h) === i)
        .slice(0, 30),
    );

    expect(hrefs.length).toBeGreaterThan(5);

    const failures: string[] = [];
    for (const href of hrefs) {
      const resp = await page.request.get(href);
      if (resp.status() >= 400) {
        failures.push(`${resp.status()} ${href}`);
      }
    }
    expect(failures, `broken nav links:\n  ${failures.join('\n  ')}`).toHaveLength(0);
  });

  test('no bare root-relative href in rendered HTML', async ({ page }) => {
    await page.goto('/');

    // Bare = starts with "/" but not "//" (protocol-relative) and has an
    // ASCII letter immediately after. Hash fragments / query strings /
    // mailto: / javascript: are fine. When the page is built with
    // base-url=http://localhost:8787, Zola emits absolute URLs. So any
    // remaining bare `/x/` href means a template hardcoded it — the bug.
    const bareHrefs = await page
      .locator('a[href], img[src], link[href], script[src]')
      .evaluateAll((els) =>
        els
          .map((el) => {
            const tag = el.tagName.toLowerCase();
            const attr = tag === 'a' || tag === 'link' ? 'href' : 'src';
            const val = (el as Element).getAttribute(attr) || '';
            return { tag, attr, val };
          })
          .filter(({ val }) => /^\/[a-zA-Z]/.test(val))
          .map(({ tag, attr, val }) => `<${tag} ${attr}="${val}">`),
      );

    expect(
      bareHrefs,
      `bare root-relative refs in rendered HTML (will 404 on subpath deploy):\n  ${bareHrefs
        .slice(0, 10)
        .join('\n  ')}`,
    ).toHaveLength(0);
  });

  test.describe('deep link sampling', () => {
    for (const path of INTERNAL_PATHS) {
      test(`${path} loads without 4xx`, async ({ page }) => {
        const { bad } = collectBadResponses(page);
        const resp = await page.goto(path);
        expect(resp?.status()).toBeLessThan(400);
        await page.waitForLoadState('networkidle');

        const failures = bad.map((r) => `${r.status()} ${r.url()}`).join('\n  ');
        expect(bad, `broken resources on ${path}:\n  ${failures}`).toHaveLength(0);
      });
    }
  });
});

test.describe('lazy-loader JS resources resolve on subpath deploys', () => {
  /**
   * Every path the base.html lazy-loader tries to fetch when a matching
   * selector is present. These MUST exist on the server; a 404 here means
   * the lazy-loader would silently skip the integration in production.
   */
  const LAZY_LOADED_ASSETS = [
    '/js/p5-creative-manager.js',
    '/js/vendor/chart.umd.min.js',
    '/js/chart-data-manager.js',
    '/js/prismatic-chart-manager.js',
    '/js/mermaid-init.js',
    '/js/code-copy.js',
    '/js/cross-link-navigator.js',
    '/css/glossary-hover-liveview.css',
    '/css/glossary-optimized.css',
  ];

  for (const asset of LAZY_LOADED_ASSETS) {
    test(`${asset} returns 200`, async ({ page }) => {
      const resp = await page.request.get(asset);
      expect(resp.status(), `${asset} returned ${resp.status()}`).toBe(200);
    });
  }
});
