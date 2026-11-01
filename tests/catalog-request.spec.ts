import { test, expect } from '@playwright/test';

test.beforeEach(() => {
 test.skip(!process.env.TEST_REQUESTS_ENABLED, 'Requires a local server with mock request configuration.');
});

test('catalog form validates phone and consent and sends selected template once', async ({ page }) => {
 let sends = 0; let body: Record<string, unknown> = {};
 await page.route('**/api/brief', async route => { sends++; body = route.request().postDataJSON(); await route.fulfill({ status: 201, json: { taskId: 'mock-only' } }); });
 await page.goto('/catalog/beauty-she');
 const form = page.getByRole('form', { name: /Заявка на макет/ });
 const submit = form.getByRole('button', { name: 'Дать сайту старт' });
 await expect(submit).toBeEnabled();
 await form.getByLabel('Ваш телефон').fill('123'); await submit.click();
 await expect(form.getByLabel('Ваш телефон')).toHaveAttribute('aria-invalid', 'true');
 await expect(form.locator('#request-phone-error')).not.toBeEmpty(); expect(sends).toBe(0);
 await form.getByLabel('Ваш телефон').fill('+7 914 345 67 89');
 await form.getByLabel('Ваше имя').fill('Анна');
 await form.getByLabel('Как удобнее связаться?').selectOption('MAX');
 await submit.click(); await expect(form.getByRole('checkbox')).toBeFocused(); expect(sends).toBe(0);
 await form.getByRole('checkbox').check(); await submit.click();
 await expect(form.getByRole('status')).toContainText('Заявка отправлена');
 await expect(form.getByRole('button', { name: 'Заявка отправлена' })).toBeDisabled(); expect(sends).toBe(1);
 expect(body.answers).toEqual({ route: 'Готовый шаблон', templateId: 'beauty-she', name: 'Анна', channel: 'MAX', phone: '+7 914 345 67 89', comment: '' });
 expect(body.consent).toBe(true); expect(body.website).toBe('');
});

test('catalog form preserves rejected request ID and locks uncertain delivery', async ({ page }) => {
 const ids: string[] = [];
 await page.route('**/api/brief', async route => {
  ids.push(route.request().postDataJSON().id);
  await route.fulfill({ status: 502, json: ids.length === 1 ? { uncertain: false, message: 'Сервис не принял заявку.' } : { uncertain: true, message: 'Уточните получение у студии.' } });
 });
 await page.goto('/catalog/beauty-she');
 const form = page.getByRole('form', { name: /Заявка на макет/ });
 await form.getByLabel('Ваш телефон').fill('+7 914 345 67 89');
 await form.getByRole('checkbox').check();
 const submit = form.getByRole('button', { name: 'Дать сайту старт' });
 await submit.click(); await expect(form.getByRole('status')).toContainText('Сервис не принял');
 await expect(form.getByLabel('Ваш телефон')).toHaveValue('+7 914 345 67 89');
 await submit.click(); await expect(form.getByRole('status')).toContainText('Уточните получение');
 await expect(submit).toBeDisabled(); expect(ids).toHaveLength(2); expect(ids[0]).toBe(ids[1]);
});
