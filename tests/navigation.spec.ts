import { test, expect } from '@playwright/test';

test('hero actions lead to form and work, tabs use keyboard without moving controls', async ({ page }) => {
 for (const width of [320, 390, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto('/');
  const actions = page.locator('.hero .actions a');
  await expect(actions).toHaveCount(2);
  await expect(actions.nth(0)).toHaveAttribute('href', '#contacts');
  await expect(actions.nth(1)).toHaveAttribute('href', '#projects');
  const a = (await actions.nth(0).boundingBox())!;
  const b = (await actions.nth(1).boundingBox())!;
  expect(a.width).toBeGreaterThan(100); expect(b.width).toBeGreaterThan(100);
  await actions.nth(0).hover();
  expect(await actions.nth(0).evaluate(el => getComputedStyle(el).transform)).toBe('none');
  await page.getByRole('tab', { name: 'Кофейня', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Салон красоты', exact: true })).toHaveAttribute('aria-selected', 'true');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.keyboard.press('ArrowLeft');
  await page.mouse.move(0, 0);
  await page.locator('.hero').screenshot({path: `.taste-skill/hero-refresh/hero-actions-${width}.png`, animations: 'disabled'});
 }
});

test('internal pages and filters preserve the browser document', async ({ page }) => {
 await page.goto('/');
 await expect(page.getByRole('form', { name: 'Заявка на сайт' })).toBeVisible();
 await page.evaluate(() => { (window as Window & { navigationMarker?: string }).navigationMarker = 'same-document'; });
 const sameDocument = async () => expect(await page.evaluate(() => (window as Window & { navigationMarker?: string }).navigationMarker)).toBe('same-document');
 await page.getByRole('navigation', { name: 'Навигация в подвале' }).getByRole('link', { name: /Каталог сайтов/ }).click();
 await expect(page).toHaveURL(/\/catalog$/); await sameDocument();
 await page.getByLabel('Найти шаблон', { exact: true }).fill('BEAUTY SHE');
 await page.getByRole('button', { name: 'Показать сайты' }).click();
 await expect(page.locator('.catalog-results')).toContainText('Найдено сайтов: 1'); await sameDocument();
 await page.locator('.catalog-image').first().click();
 await expect(page).toHaveURL(/\/catalog\/beauty-she$/); await sameDocument();
 await page.goBack();
 await expect(page.getByLabel('Найти шаблон', { exact: true })).toHaveValue('BEAUTY SHE'); await sameDocument();
 await page.getByRole('link', { name: 'Сбросить фильтры' }).click();
 await expect(page.getByLabel('Найти шаблон', { exact: true })).toHaveValue(''); await sameDocument();
 await page.getByRole('navigation', { name: 'Навигация в подвале' }).getByRole('link', { name: /Блог/ }).click();
 await expect(page).toHaveURL(/\/blog$/); await sameDocument();
 await page.getByRole('button', { name: 'Найти статью' }).click();
 await expect(page).toHaveURL(/\/blog\?/); await sameDocument();
 await page.locator('.blog-entry h3 a').first().click();
 await expect(page.locator('.article-body')).toBeVisible(); await sameDocument();
 await page.getByRole('link', { name: 'Сайтика — главная' }).click();
 await expect(page.locator('.hero')).toBeVisible(); await sameDocument();
});
