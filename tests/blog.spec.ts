import { test, expect } from '@playwright/test';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

test('blog search, topic filter, article content and TOC work without JavaScript', async ({ browser, request }) => {
 const context = await browser.newContext({ javaScriptEnabled: false });
 const page = await context.newPage();
 await page.goto('/blog');
 await expect(page.locator('h1')).toContainText('О сайтах');
 await page.getByLabel('Тема', { exact: true }).selectOption('Подготовка');
 await page.getByRole('button', { name: 'Найти статью' }).click();
 await expect(page.locator('.blog-entry')).toHaveCount(1);
 await page.getByRole('link', { name: 'Читать: Что подготовить для сайта' }).click();
 await expect(page.locator('h1')).toHaveText('Что подготовить для сайта');
 await expect(page.locator('.article-body input[type=checkbox]')).toHaveCount(7);
 for (const href of await page.getByRole('navigation', { name: 'Содержание статьи' }).locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')!))) {
  expect(await page.locator(`[id="${decodeURIComponent(href.slice(1))}"]`).count()).toBe(1);
 }
 await page.goto('/blog?q=нет-такой-статьи');
 await expect(page.getByRole('heading', { name: 'Статей пока не найдено' })).toBeVisible();
 await page.getByRole('link', { name: 'Сбросить фильтры' }).click();
 await expect(page.locator('.blog-entry')).toHaveCount(3);
 await context.close();
 expect((await request.get('/blog/no-such-post')).status()).toBe(404);
});

test('a batch of new files appears on the running production server with pagination', async ({ page }) => {
 const id = `qa-${Date.now()}`;
 const root = path.resolve('content/blog');
 const directory = path.join(root, id);
 await mkdir(directory);
 try {
  await Promise.all(Array.from({ length: 14 }, (_, index) => writeFile(path.join(directory, `post-${index}.md`), `---\ntitle: "Пакет ${id} статья ${index}"\ndate: "2026-01-01"\nslug: "${id}-${index}"\ncategory: "${id}"\n---\n\nПроверяем пакетное добавление статьи.`)));
  await expect.poll(async () => (await page.request.get(`/blog?category=${id}&q=${id}`)).text(), { timeout: 20000 }).toContain(`Пакет ${id}`);
  await page.goto(`/blog?category=${id}&q=${id}`);
  await expect(page.locator('.blog-entry')).toHaveCount(12);
  await page.getByRole('link', { name: 'Следующая →' }).click();
  await expect(page.locator('.blog-entry')).toHaveCount(2);
  await expect(page.getByLabel('Тема', { exact: true })).toHaveValue(id);
  await page.locator('.blog-entry-main>.text-link').first().click();
  await expect(page.locator('.article-body')).toContainText('пакетное добавление');
 } finally {
  expect(path.dirname(directory)).toBe(root);
  await rm(directory, { recursive: true, force: true });
 }
});

test('blog and the persistent mobile request button fit all viewports', async ({ page }) => {
 await page.emulateMedia({ reducedMotion: 'reduce' });
 for (const width of [320, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 844 });
  for (const route of ['/blog', '/blog/gotovyy-maket-ili-svoy-dizayn']) {
   await page.goto(route);
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
   await expect(page.locator('h1')).toHaveCount(1);
  }
  if (width <= 1100) {
   await page.evaluate(() => scrollTo(0, 1200));
   const cta = page.getByRole('link', { name: 'Оставить заявку', exact: true });
   await expect(cta).toBeVisible();
   const box = await cta.boundingBox();
   expect(box!.y).toBeGreaterThanOrEqual(0);
   expect(box!.y + box!.height).toBeLessThanOrEqual(90);
   await expect(cta).toHaveAttribute('href', '/#contacts');
  }
 }
 await page.setViewportSize({ width: 320, height: 844 });
 await page.goto('/catalog/coffee');
 const cta = page.getByRole('link', { name: 'Оставить заявку', exact: true });
 await expect(cta).toHaveAttribute('href', '#request');
 await cta.click();
 await expect(page).toHaveURL(/#request$/);
 await page.getByRole('button', { name: 'Меню', exact: true }).click();
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
 await expect(cta).toBeVisible();
 await expect(page.getByRole('button', { name: 'Закрыть ×', exact: true })).toBeVisible();
});
