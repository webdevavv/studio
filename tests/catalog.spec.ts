import { test, expect } from '@playwright/test';

const entries = [
 ['beauty-she', 'BEAUTY SHE', 'https://beauty-she.vercel.app/'],
 ['golden-hands', 'Золотые ручки', 'https://goldenhands38.vercel.app/'],
 ['notimo', 'Notimo', 'https://notimo-three.vercel.app/'],
];
const newEntries = [
 ['mirelle', 'Mirelle', 'https://beauty-salon-template-kappa.vercel.app/'],
 ['osnova', 'Основа', 'https://beauty-salon-template-gyqp.vercel.app/'],
 ['tork-one', 'ТОРК', 'https://tork-one.vercel.app/'],
 ['pulse-eight', 'Пульс', 'https://pulse-eight-peach-20.vercel.app/'],
 ['myata', 'Мята', 'https://pulse-1qno.vercel.app/'],

 ['autoservice', 'АвтоПрофи', 'https://autoservice-five-coral.vercel.app/'],
 ['autotork', 'АвтоТорк', 'https://autotork-ten.vercel.app/'],
 ['avtoservis', 'АвтоМастер', 'https://avtoservis-ten.vercel.app/'],
 ['beauty-jade', 'Lumière', 'https://beauty-jade-eight.vercel.app/'],
 ['beauty-salon', 'Аврора', 'https://beauty-salon-sm8c.vercel.app/'],
 ['construction', 'СтройМастер', 'https://construction-xi-eight.vercel.app/'],
 ['stroitelstvo', 'СтройДом', 'https://stroitelstvo-orcin.vercel.app/'],
 ['nexus-avto', 'NEXUS Авто', 'https://nexus-avto.vercel.app/'],
 ['green-wood', 'GreenWood', 'https://grenn-wood.vercel.app/'],
 ['neo-beauty', 'AURA Neo-Beauty', 'https://neo-beauty-eight.vercel.app/'],
];
test.beforeEach(async ({ page }) => {
 await page.route(/https:\/\/[^/]+\.vercel\.app\//, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body style="height:3000px">Демо</body></html>' }));
});

test('catalog real cards, search, combined filters, reset and history', async ({ page }) => {
 await page.goto('/catalog');
 await expect(page.locator('h1')).toContainText('Готовые сайты для вашего бизнеса');
 await expect(page.locator('.catalog-item')).toHaveCount(18);
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
 await expect(page.locator('.catalog-item')).toHaveCount(7);
 await page.getByRole('combobox', { name: /Характер дизайна/ }).click();
 await page.getByRole('option', { name: 'Продуктовый', exact: true }).click();
 await page.getByRole('button', { name: 'Показать сайты' }).click();
 await expect(page.getByRole('heading', { name: 'Пока нет совпадений' })).toBeVisible();
 await page.getByRole('link', { name: 'Сбросить фильтры' }).click();
 await expect(page.locator('.catalog-item')).toHaveCount(18);
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
  await expect(form.getByRole('button', { name: 'Отправить заявку', exact: true })).toBeEnabled();
  if (process.env.TEST_REQUESTS_ENABLED) await expect(form.getByRole('checkbox')).toBeVisible();
  else await expect(form).toContainText('Приём заявок пока не подключён');
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
 await page.route(/https:\/\/[^/]+\.vercel\.app\//, route => route.fulfill({ body: '<html>Демо</html>', contentType: 'text/html' }));
 await page.goto('/catalog');
 await page.getByLabel('Сфера бизнеса').selectOption('technology');
 await page.getByRole('button', { name: 'Показать сайты' }).click();
 await expect(page.locator('.catalog-item h3')).toHaveText('Notimo');
 await page.getByRole('link', { name: 'Подробнее', exact: true }).click();
 await expect(page.locator('h1')).toContainText('Notimo');
 await expect(page.getByRole('heading', { name: 'Что оплачивается отдельно' })).toBeVisible();
 await expect(page.locator('.template-selection')).toContainText('2 000 ₽');
 await expect(page.getByRole('button', { name: 'Отправить заявку' })).toBeDisabled();
 await context.close();
 expect((await request.get('/catalog/non-existent-template')).status()).toBe(404);
});


test('new templates have their own cards, previews, demo links and 2222 ruble detail pages', async ({ page }) => {
 test.setTimeout(90000);
 await page.emulateMedia({ reducedMotion: 'reduce' });
 await page.goto('/catalog');
 for (const [slug, title, demoUrl] of newEntries) {
  const card = page.locator('.catalog-item').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
  await expect(card).toContainText('2 222 ₽');
  await expect(card.getByRole('link', { name: 'Подробнее', exact: true })).toHaveAttribute('href', `/catalog/${slug}`);
  await expect(card.getByRole('link', { name: /Открыть демо/ })).toHaveAttribute('href', demoUrl);
  await card.scrollIntoViewIfNeeded();
  await expect.poll(() => card.locator('img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
 }
 const titles = new Set<string>();
 for (const [slug, title, demoUrl] of newEntries) {
  const response = await page.goto(`/catalog/${slug}`);
  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText(title);
  await expect(page.locator('.template-purchase strong')).toHaveText('2 222 ₽');
  await expect(page.locator('.template-selection')).toContainText('2 222 ₽');
  await expect(page.locator('iframe')).toHaveAttribute('src', demoUrl);
  await expect(page.locator('form[data-template-id]')).toHaveAttribute('data-template-id', slug);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', new RegExp(`/catalog/${slug}$`));
  titles.add(await page.title());
  for (const width of [320, 375, 768, 1440]) {
   await page.setViewportSize({ width, height: 900 });
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${slug} @${width}`).toBe(true);
  }
 }
 expect(titles.size).toBe(newEntries.length);
 for (const [category, count] of [['auto', 5], ['construction', 4], ['beauty', 7], ['fitness', 1]] as const) {
  await page.goto(`/catalog?category=${category}`);
  await expect(page.locator('.catalog-item')).toHaveCount(count);
 }
});
