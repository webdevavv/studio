import { test, expect } from '@playwright/test';
test('adaptation changes content without changing the layout and fits phones', async ({ page }) => {
 for (const width of [320, 390, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 }); await page.goto('/');
  const sample = page.locator('.sample-site');
  const before = await sample.boundingBox();
  await page.getByRole('button', { name: 'Для вашего бизнеса', exact: true }).click();
  await expect(sample).toContainText('Тёплый угол'); await expect(sample).toContainText('Солнечная, 8');
  const after = await sample.boundingBox(); expect(Math.abs(after!.height - before!.height)).toBeLessThan(2);
  await page.getByRole('button', { name: 'Исходный макет', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(sample).toContainText('Крошка');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.hero').screenshot({ path: `.taste-skill/hero-refresh/hero-${width}.png` });
  await page.locator('#adaptation').screenshot({ path: `.taste-skill/hero-refresh/adaptation-${width}.png` });
 }
 await page.emulateMedia({ reducedMotion: 'reduce' });
 expect(await page.locator('.coffee-steam').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});
