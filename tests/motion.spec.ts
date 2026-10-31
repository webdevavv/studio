import { test, expect } from '@playwright/test';
test('device motion and scroll entrances respect reduced motion', async ({ page }) => {
 await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto('/');
 await page.locator('.workshop-stage').hover();
 await expect.poll(() => page.locator('.workshop-desktop').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).b)).toBeLessThan(0);
 const target = page.locator('.pricing-options article').first(); await target.scrollIntoViewIfNeeded(); await expect(target).toHaveClass(/reveal-in/);
 await page.emulateMedia({ reducedMotion: 'reduce' }); await expect(target).not.toHaveClass(/reveal-in/);
 expect(await page.locator('.workshop-phone').evaluate(el => getComputedStyle(el).transform)).toBe('none');
 await expect(page.locator('h1')).toContainText('за 2 дня');
 await page.getByRole('navigation', { name: 'Навигация в подвале' }).getByRole('link', { name: /Каталог сайтов/ }).click();
 await expect(page.locator('.catalog-intro h1')).toBeVisible(); expect(await page.locator('.catalog-intro h1').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});
