import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Prismatic Promo Site
 *
 * Comprehensive browser-based regression testing covering:
 * - HTML structure validity (no <p> wrapping block elements)
 * - Content duplication prevention
 * - Alpine.js interactive functionality
 * - Cross-browser rendering consistency
 * - Mobile responsive grid layouts
 * - Performance baseline enforcement
 *
 * Serves the built Zola output from ./public/ on a local HTTP server.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }], ['list']],
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL: 'http://localhost:8787',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],

  webServer: {
    // In CI, the test build (public-test/) is pre-built by the workflow.
    // Locally, rebuild Zola output with localhost base URL so asset paths
    // resolve correctly. Production builds use prismatic-reality.com but
    // tests need all CSS/JS/font URLs to point to the local server.
    command: process.env.CI
      ? 'npx serve public-test -l 8787 --no-clipboard'
      : 'zola build --base-url http://localhost:8787 --output-dir public-test --force && npx serve public-test -l 8787 --no-clipboard',
    port: 8787,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
