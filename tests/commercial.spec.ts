import { expect, test } from '@playwright/test';
import { portfolioProjects } from '../src/lib/portfolio';

const pages = [
 ['/services', 'Создаём сайты, которые помогают вашему бизнесу', 'Создание сайтов для бизнеса — услуги веб-студии'],
 ['/prices', 'Сколько стоит создать сайт?', 'Цены на создание сайтов — стоимость лендинга и сайта-визитки'],
 ['/services/landing-page', 'Создадим лендинг для вашего бизнеса за 2 дня', 'Создание лендинга под ключ за 10 000 ₽ — разработка за 2 дня'],
 ['/services/business-card', 'Создадим сайт-визитку для вашей компании', 'Создание сайта-визитки для бизнеса — заказать под ключ'],
 ['/portfolio', 'Наши работы — сайты, которые можно посмотреть вживую', 'Портфолио веб-студии — примеры разработанных сайтов'],
 ...portfolioProjects.map(project => [`/portfolio/${project.slug}`, project.title, project.seoTitle]),
];

test('new routes have unique SEO, breadcrumbs, working internal links, direct reload and proper 404', async ({ page, request }) => {
 test.setTimeout(90000);
 const descriptions = new Set<string>();
 const paths = new Set<string>();
 for (const [path, heading, title] of pages) {
  const response = await page.goto(path);
  expect(response?.status(), path).toBe(200);
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(2);
  await expect(page.locator('h1')).toHaveText(heading);
  await expect(page).toHaveTitle(title);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(new URL(canonical!).pathname).toBe(path);
  expect(await page.locator('meta[property="og:url"]').getAttribute('content')).toBe(canonical);
  descriptions.add((await page.locator('meta[name="description"]').getAttribute('content'))!);
  const schema = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(schema['@type']).toBe('BreadcrumbList');
  expect(schema.itemListElement.map((item: { position: number }) => item.position)).toEqual(schema.itemListElement.map((_: unknown, i: number) => i + 1));
  await expect(page.getByRole('navigation', { name: 'Хлебные крошки' }).locator('[aria-current="page"]')).toHaveCount(1);
  await expect(page.getByRole('form', { name: 'Заявка на сайт' })).toHaveCount(1);
  await expect(page.locator('iframe,.brief-frame,.brief-question')).toHaveCount(0);
  for (const href of await page.locator('main a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')!))) {
   if (href.startsWith('#')) expect(await page.locator(href).count(), `${path} ${href}`).toBe(1);
   else if (href.startsWith('/')) paths.add(href.split('#')[0]);
  }
  expect((await page.reload())?.status()).toBe(200);
 }
 expect(descriptions.size).toBe(pages.length);
 const font = await request.get('/fonts/golos-text-v5.3.0/golos-text-cyrillic-wght-normal.woff2');
 expect(font.status()).toBe(200);
 expect(font.headers()['cache-control']).toContain('immutable');
 for (const path of paths) expect((await request.get(path)).status(), path).toBe(200);
 for (const path of ['/services/unknown', '/portfolio/unknown', '/prices/unknown']) expect((await request.get(path)).status()).toBe(404);
 if (process.env.TEST_INDEXABLE) {
  const xml = await (await request.get('/sitemap.xml')).text();
  for (const [path] of pages) expect(xml).toContain(`https://studio.example${path}</loc>`);
  expect(await (await request.get('/robots.txt')).text()).toContain('Allow: /');
  expect(await page.locator('meta[name="robots"]').getAttribute('content')).not.toContain('noindex');
 }
});

test('all commercial pages fit seven widths, load images and have no browser errors', async ({ page }) => {
 test.setTimeout(180000);
 await page.emulateMedia({ reducedMotion: 'reduce' });
 const errors: string[] = [];
 page.on('pageerror', error => errors.push(error.message));
 page.on('console', message => { if (message.type() === 'error') errors.push(`${message.text()} ${message.location().url}`); });
 for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
  await page.setViewportSize({ width, height: 1000 });
  for (const [path] of pages) {
   await page.goto(path);
   await page.evaluate(async () => { await document.fonts.ready; });
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} @${width}`).toBe(true);
   const overflow = await page.locator('main :is(h1,h2,h3,p,button,input,select,textarea)').evaluateAll(elements => elements.filter(element => {
    const box = element.getBoundingClientRect();
    return box.width > 2 && (box.left < -1 || box.right > innerWidth + 1 || element.scrollWidth > element.clientWidth + 2);
   }).map(element => element.textContent?.slice(0, 90)));
   expect(overflow, `${path} @${width}`).toEqual([]);
   if ([375, 768, 1440].includes(width)) {
    for (const image of await page.locator('main img').all()) {
     await image.scrollIntoViewIfNeeded();
     await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `.taste-skill/commercial/qa/${path.replaceAll('/', '-')}-${width}.png`, fullPage: true, animations: 'disabled' });
   }
  }
 }
 for (const [path] of pages) {
  await page.goto(path);
  for (const image of await page.locator('main img').all()) {
   await image.scrollIntoViewIfNeeded();
   await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
 }
 expect(errors).toEqual([]);
});

test('portfolio filters and all content work without JavaScript', async ({ browser, baseURL }) => {
 const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
 const page = await context.newPage();
 for (const [path, heading] of pages) {
  await page.goto(path);
  await expect(page.locator('h1')).toHaveText(heading);
  await expect(page.getByRole('form', { name: 'Заявка на сайт' }).getByRole('button')).toBeDisabled();
 }
 await page.goto('/portfolio');
 await page.getByLabel('Сфера бизнеса').selectOption('technology');
 await page.getByLabel('Тип сайта').selectOption('landing-page');
 await page.getByRole('button', { name: 'Показать проекты' }).click();
 await expect(page.locator('.portfolio-collection h3')).toHaveText('Notimo');
 await page.getByLabel('Тип сайта').selectOption('business-card');
 await page.getByRole('button', { name: 'Показать проекты' }).click();
 await expect(page.getByRole('heading', { name: 'Пока нет такого примера' })).toBeVisible();
 await page.getByRole('link', { name: 'Сбросить фильтры' }).click();
 await expect(page.locator('.portfolio-card')).toHaveCount(3);
 await context.close();
});

test('mobile navigation and FAQ are keyboard accessible and context survives client navigation', async ({ page }) => {
 await page.setViewportSize({ width: 320, height: 900 });
 await page.goto('/services');
 const toggle = page.getByRole('button', { name: 'Меню', exact: true });
 await toggle.focus(); await page.keyboard.press('Enter');
 await expect(toggle).toHaveAttribute('aria-expanded', 'true');
 const navigation = page.getByRole('navigation', { name: 'Основная навигация' });
 await expect(navigation.getByRole('link', { name: 'Цены', exact: true })).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(toggle).toHaveAttribute('aria-expanded', 'false');
 await expect(toggle).toBeFocused();
 await toggle.click();
 await navigation.getByRole('link', { name: 'Цены', exact: true }).click();
 await expect(page).toHaveURL(/\/prices$/);
 await expect(navigation).toBeHidden();
 const faq = page.locator('.commercial-faq details').first();
 await faq.locator('summary').focus(); await page.keyboard.press('Enter');
 await expect(faq).toHaveAttribute('open', '');
});

test('every commercial source submits correct context through the existing form', async ({ page }) => {
 test.skip(!process.env.TEST_REQUESTS_ENABLED, 'Requires mock enabled request configuration.');
 const bodies: { answers: Record<string, string> }[] = [];
 await page.route('**/api/brief', route => {
  bodies.push(route.request().postDataJSON());
  return route.fulfill({ status: 201, json: { taskId: 'mock-commercial' } });
 });
 for (const [path] of pages) {
  await page.goto(`${path}?private=removed#request`);
  const form = page.getByRole('form', { name: 'Заявка на сайт' });
  await form.getByLabel('Номер телефона').fill('+7 917 123 45 67');
  await form.getByRole('checkbox').check();
  await form.getByRole('button', { name: 'Отправить заявку', exact: true }).click();
  await expect(form.getByRole('status')).toContainText('Заявка отправлена');
  const answers = bodies.at(-1)!.answers;
  expect(answers.pageUrl).toBe(new URL(path, page.url()).href);
  expect(answers.source).toBe(path === '/prices' ? 'prices' : path.startsWith('/portfolio') ? 'portfolio' : 'services');
  const project = portfolioProjects.find(project => path === `/portfolio/${project.slug}`);
  expect(answers.projectSlug).toBe(project?.slug);
  expect(answers.service).toBe(project?.siteType || (path.startsWith('/services/') ? path.split('/').at(-1) : undefined));
 }
 expect(bodies).toHaveLength(pages.length);
});
