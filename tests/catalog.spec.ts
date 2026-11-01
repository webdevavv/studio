import { test, expect } from '@playwright/test';

const entries = [
 ['beauty-she', 'BEAUTY SHE', 'https://beauty-she.vercel.app/'],
 ['golden-hands', 'Золотые ручки', 'https://goldenhands38.vercel.app/'],
 ['notimo', 'Notimo', 'https://notimo-three.vercel.app/'],
];
test.beforeEach(async ({ page }) => {
 await page.route(/https:\/\/(beauty-she|goldenhands38|notimo-three)\.vercel\.app\//, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body style="height:3000px">Демо</body></html>' }));
});

test('catalog real cards, search, combined filters, reset and history', async ({ page }) => {
 await page.goto('/catalog');
 await expect(page.locator('h1')).toContainText('Готовые сайты для вашего бизнеса');
 await expect(page.locator('.catalog-item')).toHaveCount(3);
 await expect(page.locator('iframe')).toHaveCount(0);
 for (const [slug, title, url] of entries) {
  const card = page.locator('.catalog-item').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
  await expect(card.getByRole('link', { name: 'Подробнее', exact: true })).toHaveAttribute('href', `/catalog/${slug}`);
  await expect(card.getByRole('link', { name: /Открыть демо/ })).toHaveAttribute('href', url);
  await expect.poll(() => card.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
 }
 await page.getByRole('combobox', { name: /Сфера бизнеса/ }).click();
 await page.getByRole('option', { name: 'Красота и здоровье', exact: true }).click();
 await page.getByRole('button', { name: 'Показать сайты' }).click();
 await expect(page.locator('.catalog-item')).toHaveCount(2);
 await page.getByRole('combobox', { name: /Характер дизайна/ }).click();
 await page.getByRole('option', { name: 'Продуктовый', exact: true }).click();
 await page.getByRole('button', { name: 'Показать сайты' }).click();
 await expect(page.getByRole('heading', { name: 'Пока нет совпадений' })).toBeVisible();
 await page.getByRole('link', { name: 'Сбросить фильтры' }).click();
 await expect(page.locator('.catalog-item')).toHaveCount(3);
 await expect(page.getByRole('combobox', { name: /Сфера бизнеса/ })).toContainText('Все сайты');
 await page.getByLabel('Найти шаблон').fill('notimo');
 await page.getByRole('button', { name: 'Показать сайты' }).click();
 await expect(page.locator('.catalog-item h3')).toHaveText(['Notimo']);
 await page.getByRole('link', { name: 'Подробнее', exact: true }).click();
 await expect(page).toHaveURL(/\/catalog\/notimo$/);
 await page.goBack();
 await expect(page.getByLabel('Найти шаблон')).toHaveValue('notimo');
});

test('detail pages use correct data, unique SEO, breadcrumbs and selected request', async ({ page }) => {
 const titles = new Set<string>(); const descriptions = new Set<string>();
 for (const [slug, title, demoUrl] of entries) {
  await page.goto(`/catalog/${slug}`);
  await expect(page.locator('h1')).toContainText(title);
  titles.add(await page.title()); descriptions.add((await page.locator('meta[name=description]').getAttribute('content'))!);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', new RegExp(`/catalog/${slug}$`));
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', new RegExp(`/catalog/${slug}$`));
  await expect(page.getByRole('navigation', { name: 'Хлебные крошки' })).toContainText(title);
  const schema = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(schema!).itemListElement.at(-1).name).toBe(title);
  await expect(page.locator('iframe')).toHaveAttribute('src', demoUrl);
  await page.locator('.template-purchase').getByRole('link', { name: 'Хочу такой сайт' }).click();
  await expect(page).toHaveURL(new RegExp(`/catalog/${slug}#request$`));
  const form = page.getByRole('form', { name: `Заявка на макет «${title}»` });
  await expect(form).toHaveAttribute('data-template-id', slug);
  await expect(form.getByRole('button')).toBeDisabled();
  await expect(form).toContainText('Приём заявок пока не подключён');
 }
 expect(titles.size).toBe(3); expect(descriptions.size).toBe(3);
});

test('requested viewport widths fit catalog and all details; columns and navigation adapt', async ({ page }) => {
 test.setTimeout(90000);
 await page.emulateMedia({ reducedMotion: 'reduce' });
 const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
 for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of ['/catalog', ...entries.map(([slug]) => `/catalog/${slug}`)]) {
   await page.goto(route);
   await expect(page.locator('h1')).toHaveCount(1);
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${route} @${width}`).toBe(true);
   if (route === '/catalog') expect(await page.locator('.catalog-list').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(width > 1100 ? 3 : width > 640 ? 2 : 1);
  }
 }
 await page.setViewportSize({ width: 375, height: 844 });
 await expect(page.locator('.header').getByRole('link', { name: 'Каталог', exact: true })).toBeVisible();
 await expect(page.locator('.header').getByRole('link', { name: 'Заказать сайт', exact: true })).toHaveAttribute('href', '#request');
 expect(errors).toEqual([]);
});

test('filtering and product text work without JavaScript; unknown template is 404', async ({ browser, request }) => {
 const context = await browser.newContext({ javaScriptEnabled: false });
 const page = await context.newPage();
 await page.route(/https:\/\/(beauty-she|goldenhands38|notimo-three)\.vercel\.app\//, route => route.fulfill({ body: '<html>Демо</html>', contentType: 'text/html' }));
 await page.goto('/catalog');
 await page.getByLabel('Сфера бизнеса').selectOption('technology');
 await page.getByRole('button', { name: 'Показать сайты' }).click();
 await expect(page.locator('.catalog-item h3')).toHaveText('Notimo');
 await page.getByRole('link', { name: 'Подробнее', exact: true }).click();
 await expect(page.locator('h1')).toContainText('Notimo');
 await expect(page.getByRole('heading', { name: 'Что оплачивается отдельно' })).toBeVisible();
 await expect(page.locator('.template-selection')).toContainText('2 000 ₽');
 await expect(page.getByRole('button', { name: 'Дать сайту старт' })).toBeDisabled();
 await context.close();
 expect((await request.get('/catalog/non-existent-template')).status()).toBe(404);
});
