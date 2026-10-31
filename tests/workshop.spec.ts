import { test, expect } from '@playwright/test';
test('existing device preview preserves geometry when switching demo projects', async ({ page }) => {
 for (const width of [320,390,768,1440]) {
  await page.setViewportSize({ width, height: 900 }); await page.goto('/'); await page.evaluate(async () => { await document.fonts.ready; });
  const preview = page.locator('.workshop-stage'); const before = await preview.evaluate(el => (el as HTMLElement).offsetHeight);
  await page.getByRole('tab', { name: 'Салон красоты', exact: true }).click();
  expect(Math.abs(await preview.evaluate(el => (el as HTMLElement).offsetHeight) - before)).toBeLessThan(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 }
});
