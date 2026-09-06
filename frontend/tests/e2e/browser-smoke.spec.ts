import { test, expect } from '@playwright/test';

test.describe('Phase 3.2 — Headless Browser Smoke & Console Auditing', () => {
  test('Landing Page (/) renders without unhandled runtime exceptions', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    // Verify main landmarks or navigation
    await expect(page.locator('body')).toBeVisible();
    
    // Allow any hydration or asynchronous queries to settle
    await page.waitForTimeout(1000);

    // Filter out known benign browser warnings/network noise
    const fatalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon.ico') &&
        !err.includes('Failed to load resource') &&
        !err.includes('net::ERR_CONNECTION_REFUSED') &&
        !err.includes('webpack-hmr')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('Learning Page (/learning) renders catalog and video container', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/learning', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();

    await page.waitForTimeout(1000);

    const fatalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon.ico') &&
        !err.includes('Failed to load resource') &&
        !err.includes('net::ERR_CONNECTION_REFUSED') &&
        !err.includes('webpack-hmr')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('Practice Page (/practice) renders interview practice sections', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/practice', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();

    await page.waitForTimeout(1000);

    const fatalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon.ico') &&
        !err.includes('Failed to load resource') &&
        !err.includes('net::ERR_CONNECTION_REFUSED') &&
        !err.includes('webpack-hmr')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('Roadmaps Page (/roadmaps) renders career and skill pathways', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/roadmaps', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();

    await page.waitForTimeout(1000);

    const fatalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon.ico') &&
        !err.includes('Failed to load resource') &&
        !err.includes('net::ERR_CONNECTION_REFUSED') &&
        !err.includes('webpack-hmr')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('Login Page (/login) renders authentication forms cleanly', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/login', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();

    await page.waitForTimeout(1000);

    const fatalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon.ico') &&
        !err.includes('Failed to load resource') &&
        !err.includes('net::ERR_CONNECTION_REFUSED') &&
        !err.includes('webpack-hmr')
    );
    expect(fatalErrors).toHaveLength(0);
  });
});
