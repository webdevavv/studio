import { test, expect } from '@playwright/test';

test('catalog filters combine, reset and preserve selection through navigation', async ({ page }) => {
 await page.goto('/catalog');
 await expect(page.locator('.catalog-item')).toHaveCount(3);
 await page.getByLabel('Сфера бизнеса').selectOption('food');
 await page.getByRole('button', { name: 'Показать макеты' }).click();
 await expect(page.locator('.catalog-item')).toHaveCount(1);
 await expect(page.locator('.catalog-item h3')).toHaveText('Крошка');
 await page.getByLabel('Характер дизайна').selectOption('calm');
 await page.getByRole('button', { name: 'Показать макеты' }).click();
 await expect(page.getByRole('heading', { name: 'Пока нет совпадений' })).toBeVisible();
 await page.getByRole('link', { name: 'Сбросить фильтры' }).click();
 await expect(page.locator('.catalog-item')).toHaveCount(3);
 await page.getByLabel('Найти макет').fill('тише');
 await page.getByRole('button', { name: 'Показать макеты' }).click();
 await expect(page.locator('.catalog-item h3')).toHaveText(['ТИШЕ']);
 await page.getByRole('link', { name: 'Рассмотреть макет' }).click();
 await expect(page).toHaveURL(/\/catalog\/beauty$/);
 await expect(page.locator('h1')).toHaveText('ТИШЕ');
 await page.goBack();
 await expect(page.getByLabel('Найти макет')).toHaveValue('тише');
 await expect(page.locator('.catalog-item')).toHaveCount(1);
});

test('request keeps the chosen template and price, validates contact fields and never fakes delivery', async ({ page }) => {
 const submissions: string[] = [];
 page.on('request', request => { if (request.method() === 'POST') submissions.push(request.url()); });
 await page.goto('/catalog');
 await page.locator('.catalog-item').filter({ has: page.getByRole('heading', { name: 'ФОРМА', exact: true }) }).getByRole('link', { name: 'Хочу такой сайт' }).click();
 await expect(page).toHaveURL(/\/catalog\/craft#request$/);
 const form = page.getByRole('form', { name: 'Заявка на макет «ФОРМА»' });
 await expect(form).toHaveAttribute('data-template-id', 'craft');
 await expect(form.locator('.request-total')).toHaveText('Адаптация «ФОРМА»2 000 ₽');
 const phone = form.getByLabel('Ваш телефон');
 const preference = form.getByLabel('Где вам удобнее написать?');
 const submit = form.getByRole('button', { name: 'Дать сайту старт' });
 await submit.click();
 await expect(phone).toBeFocused();
 await expect(phone).toHaveAttribute('aria-invalid', 'true');
 await phone.fill('123');
 await expect(form.locator('#request-phone-error')).toContainText('слишком короткий');
 await phone.fill('+7 (999) 123-45-67');
 await submit.click();
 await expect(preference).toBeFocused();
 await expect(preference).toHaveAttribute('aria-invalid', 'true');
 await preference.fill('Telegram, @test_client');
 await expect(preference).toHaveAttribute('aria-invalid', 'false');
 await submit.click();
 await expect(form.getByRole('status')).toContainText('«ФОРМА» за 2 000 ₽ не отправлена');
 await expect(phone).toHaveValue('+7 (999) 123-45-67');
 await expect(preference).toHaveValue('Telegram, @test_client');
 expect(submissions).toEqual([]);
});

test('catalog and template pages fit phones and desktops with working mobile navigation', async ({ page }) => {
 const errors: string[] = [];
 page.on('pageerror', error => errors.push(error.message));
 for (const width of [320, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of ['/catalog', '/catalog/coffee']) {
   await page.goto(route);
   await expect(page.locator('h1')).toHaveCount(1);
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
 }
 await page.setViewportSize({ width: 390, height: 844 });
 await page.getByRole('button', { name: 'Меню', exact: true }).click();
 await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toBeVisible();
 await expect(page.locator('.header').getByRole('link', { name: 'Заказать сайт', exact: true })).toHaveAttribute('href', '#request');
 expect(errors).toEqual([]);
});

test('catalog filtering and template content render without JavaScript, unknown templates return 404', async ({ browser, request }) => {
 const context = await browser.newContext({ javaScriptEnabled: false });
 const page = await context.newPage();
 await page.goto('/catalog');
 await page.getByLabel('Сфера бизнеса').selectOption('craft');
 await page.getByRole('button', { name: 'Показать макеты' }).click();
 await expect(page.locator('.catalog-item')).toHaveCount(1);
 await expect(page.locator('.catalog-item h3')).toHaveText('ФОРМА');
 await page.getByRole('link', { name: 'Хочу такой сайт' }).click();
 await expect(page.locator('h1')).toHaveText('ФОРМА');
 await expect(page.getByRole('button', { name: 'Дать сайту старт' })).toBeDisabled();
 await expect(page.locator('.template-selection')).toContainText('2 000 ₽');
 await context.close();
 expect((await request.get('/catalog/non-existent-template')).status()).toBe(404);
});
