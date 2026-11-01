import { test, expect } from '@playwright/test';

test('contact form validates phone and never pretends disabled integration sent it', async ({ page }) => {
 await page.goto('/'); const form = page.getByRole('form', { name: 'Заявка на сайт' });
 const phone = form.getByLabel('Номер телефона'); const submit = form.getByRole('button', { name: 'Отправить заявку' });
 for (const [value, error] of [['', 'Укажите номер'], ['123', 'слишком короткий'], ['+7 номер 999', 'слишком короткий']]) {
  await phone.fill(value); await submit.click(); await expect(phone).toBeFocused(); await expect(phone).toHaveAttribute('aria-invalid', 'true'); await expect(form.getByRole('alert')).toContainText(error);
 }
 await phone.fill('+7 999 123 45 67'); await submit.click();
 await expect(phone).not.toHaveAttribute('aria-invalid', 'true');
 await expect(phone).toHaveValue('+7 (999) 123-45-67');
 if (!process.env.TEST_REQUESTS_ENABLED) await expect(form.getByRole('status')).toContainText('Заявка не отправлена');
});

test('all twelve sections, responsive geometry, working anchors and no browser errors', async ({ page }) => {
 const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
 for (const width of [320,375,430,768,1024,1440,1920]) {
  await page.setViewportSize({ width, height: 900 }); await page.goto('/'); await page.evaluate(async () => { await document.fonts.ready; });
  await expect(page.locator('h1')).toHaveCount(1);
  if (width === 320) { const logo = await page.locator('.header .logo').boundingBox(); const action = await page.locator('.header .header-order').boundingBox(); expect(Math.abs(logo!.y + logo!.height / 2 - action!.y - action!.height / 2)).toBeLessThan(2); }
  await expect(page.locator('main>section')).toHaveCount(12);
  expect(await page.locator('main>section').evaluateAll(els => els.map(el => el.id))).toEqual(['','why','services','projects','pricing','approach','included','process','payment','about','faq','contacts']);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const href of await page.locator('a[href^="#"]').evaluateAll(els => els.map(el => el.getAttribute('href')!))) expect(await page.locator(href).count()).toBe(1);
  const overflowing = await page.locator('main :is(h1,h2,h3,p,button,input,select,textarea)').evaluateAll(els => els.filter(el => { const r = el.getBoundingClientRect(); return r.width > 2 && (r.left < -1 || r.right > innerWidth + 1); }).map(el => el.textContent?.slice(0,80)));
  expect(overflowing).toEqual([]);
  if ([320,768,1440].includes(width)) await page.locator('#contacts').screenshot({ path: `.taste-skill/home-refresh/form-${width}.png`, animations: 'disabled' });
  await page.locator('.hero').screenshot({ path: `.taste-skill/home-refresh/hero-${width}.png`, animations: 'disabled' });
 }
 expect(errors).toEqual([]);
 await page.screenshot({ path: '.taste-skill/home-refresh/full-desktop.png', fullPage: true, animations: 'disabled' });
});

test('tabs, mobile navigation and FAQ work with the keyboard', async ({ page }) => {
 await page.setViewportSize({ width: 375, height: 812 }); await page.goto('/');
 await page.getByRole('tab', { name: 'Кофейня', exact: true }).focus(); await page.keyboard.press('ArrowRight'); await expect(page.getByRole('tab', { name: 'Салон красоты' })).toBeFocused();
 await page.keyboard.press('End'); await expect(page.getByRole('tabpanel')).toContainText('Дерево. Руки.');
 await expect(page.locator('.header').getByRole('link', { name: 'Каталог', exact: true })).toBeVisible();
 await page.locator('.header').getByRole('link', { name: 'Заказать сайт', exact: true }).click(); await expect(page).toHaveURL(/#contacts$/);
 const summary = page.locator('.faq summary').first(); await summary.focus(); await page.keyboard.press('Enter'); await expect(page.locator('.faq details').first()).toHaveAttribute('open', '');
 await page.screenshot({ path: '.taste-skill/home-refresh/full-mobile.png', fullPage: true, animations: 'disabled' });
});

test('SSR, metadata, demo indexing and 404 stay correct', async ({ browser, request }) => {
 const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage(); await page.goto('/');
 await expect(page.getByRole('heading', { level: 1, name: 'Создадим современный сайт для вашего бизнеса за 2 дня', exact: true })).toBeVisible(); await expect(page.getByRole('tabpanel')).toContainText('Хороший день');
 await expect(page.locator('main>section')).toHaveCount(12); await expect(page).toHaveTitle('Создание сайтов под ключ за 10 000 ₽ — за 2 дня');
 expect(await page.locator('meta[name=description]').getAttribute('content')).toContain('Создадим лендинг');
 expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toContain('Создание сайтов под ключ');
 await expect(page.getByRole('form', { name: 'Заявка на сайт' }).getByRole('button')).toBeDisabled();
 await context.close(); expect(await (await request.get('/robots.txt')).text()).toContain(process.env.TEST_INDEXABLE ? 'Allow: /' : 'Disallow: /'); expect((await request.get('/missing-page')).status()).toBe(404);
});

test('project images, demo labels and honest pricing remain visible', async ({ page }) => {
 await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/');
 await expect(page.locator('.brief-question,.brief-frame')).toHaveCount(0);
 for (const name of ['Кофейня','Салон красоты','Частный мастер']) {
  await page.getByRole('tab', { name, exact: true }).click(); const image = page.getByRole('tabpanel').locator('img');
  await expect.poll(() => image.evaluate(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBe(true);
 }
 await expect(page.locator('#projects')).toContainText('Демо-проект'); await expect(page.locator('#pricing .price-value').first()).toHaveText('2 000 ₽');
 await expect(page.locator('#pricing .price-value').last()).toHaveText('10 000 ₽'); await expect(page.locator('.faq details')).toHaveCount(10);
});
