import { test, expect } from '@playwright/test';

test('hero types phrases without shifting layout and devices turn in opposite directions', async ({ page }) => {
 await page.setViewportSize({ width: 1440, height: 1000 });
 await page.goto('/');
 const typing = page.locator('.hero-typewriter>span').first();
 const heading = page.locator('.hero h1');
 const before = (await heading.boundingBox())!;
 await expect(typing).toHaveText('Под задачу.', { timeout: 10000 });
 expect(Math.abs((await heading.boundingBox())!.height - before.height)).toBeLessThan(1);
 await page.locator('.workshop-stage').hover();
 await expect.poll(() => page.locator('.workshop-desktop').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).b)).toBeLessThan(0);
 await expect.poll(() => page.locator('.workshop-phone').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).b)).toBeGreaterThan(0);
 await page.emulateMedia({ reducedMotion: 'reduce' });
 await expect(typing).toHaveText('За 2 дня.');
 expect(await page.locator('.workshop-phone').evaluate(el => getComputedStyle(el).transform)).toBe('none');
 for (const width of [320,390]) {
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
 }
});

test('scroll entrances run once and preview hover respects reduced motion', async ({ page }) => {
 await page.goto('/');
 const frame = page.locator('.brief-frame');
 await frame.scrollIntoViewIfNeeded();
 await expect(frame).toHaveClass(/reveal-in/);
 expect(await frame.evaluate(el => getComputedStyle(el).animationName)).toBe('studio-arrive');
 await page.locator('.workshop-stage').hover();
 const desktop = page.locator('.workshop-desktop');
 await expect.poll(() => desktop.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
 await page.emulateMedia({ reducedMotion: 'reduce' });
 await expect.poll(() => desktop.evaluate(el => getComputedStyle(el).transform)).toBe('none');
 await expect.poll(() => frame.evaluate(el => getComputedStyle(el).animationName)).toBe('none');
 await expect(frame).not.toHaveClass(/reveal-in/);
 await page.getByRole('navigation', { name: 'Навигация в подвале' }).getByRole('link', { name: /Каталог сайтов/ }).click();
 await expect(page.locator('.catalog-intro h1')).toBeVisible();
 expect(await page.locator('.catalog-intro h1').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});
