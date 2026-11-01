import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Local lab diagnostics, not field Core Web Vitals or a Lighthouse score.
const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3014';
const browser = await chromium.launch({ ...(process.platform === 'darwin' ? { channel: 'chrome' } : {}) });
const results = [];
try {
 for (const path of ['/services', '/prices', '/services/landing-page', '/services/business-card', '/portfolio', '/portfolio/notimo']) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
   window.__commercialPerf = { lcp: 0, shifts: [], events: [] };
   new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__commercialPerf.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
   new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__commercialPerf.shifts.push({ value: entry.value, start: entry.startTime }); }).observe({ type: 'layout-shift', buffered: true });
   new PerformanceObserver(list => { for (const entry of list.getEntries()) if (entry.interactionId) window.__commercialPerf.events.push(entry.duration); }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  });
  await page.goto(`${baseURL}${path}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Exercise a real UI control, then read Event Timing as an interaction diagnostic.
  const control = path.startsWith('/portfolio') ? page.getByRole('button', { name: 'Меню', exact: true }) : page.locator('.commercial-faq summary').first();
  await control.click();
  await page.waitForTimeout(300);
  const data = await page.evaluate(() => {
   const perf = window.__commercialPerf;
   let cls = 0, session = 0, first = 0, last = 0;
   for (const shift of perf.shifts) {
    if (shift.start - last > 1000 || shift.start - first > 5000) { session = 0; first = shift.start; }
    session += shift.value; last = shift.start; cls = Math.max(cls, session);
   }
   return { lcpMs: Math.round(perf.lcp), cls: +cls.toFixed(4), maxObservedInteractionMs: Math.max(0, ...perf.events), transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + entry.transferSize, 0) };
  });
  results.push({ path, ...data });
  await context.close();
 }
 const report = { measuredAt: new Date().toISOString(), profile: 'Chrome, 375×812, CPU 4×, 1.6 Mbps download, 150 ms latency, browser cache disabled; localhost server with warm image cache; one sample per route', limitation: 'Lab LCP/CLS and one observed interaction. maxObservedInteractionMs is not field INP; zero means no event exceeded the observation threshold.', results };
 await mkdir('.taste-skill/commercial', { recursive: true });
 await writeFile('.taste-skill/commercial/performance.json', JSON.stringify(report, null, 2) + '\n');
 console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
