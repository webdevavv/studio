import { test, expect } from '@playwright/test';
import { cleanAnswers, getSteps, summary, yougileTask } from '../src/lib/brief';
import { POST } from '../src/app/api/brief/route';

test('branches remove irrelevant data and escape the manager description', () => {
 const a = { route: 'Готовый макет', company: '<script>alert(1)</script>', format: 'Интернет-магазин', shopFeatures: ['Онлайн-оплата'], style: 'Яркий', texts: 'Готовы' };
 expect(getSteps(a).map(s => s.id)).not.toContain('commerce');
 const clean = cleanAnswers(a);
 expect(clean.format).toBeUndefined(); expect(clean.style).toBeUndefined(); expect(clean.shopFeatures).toBeUndefined();
 const payload = yougileTask(clean, 'test-id', '2026-10-25', 'column', 'https://example.com/privacy');
 expect(payload.description).not.toContain('<script>'); expect(payload.description).toContain('&lt;script&gt;');
 expect(summary({})).toContain('Данных для рекомендации пока недостаточно');
});

test('YouGile adapter validates and deduplicates simultaneous submissions', async () => {
 const names = ['BRIEF_ENABLED', 'BRIEF_POLICY_URL', 'YOUGILE_API_KEY', 'YOUGILE_COLUMN_ID'];
 const before = Object.fromEntries(names.map(n => [n, process.env[n]])); const fetchBefore = global.fetch;
 const request = (body: unknown, origin = 'https://studio.example') => new Request('https://studio.example/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) });
 try {
  process.env.BRIEF_ENABLED = 'false';
  expect((await POST(request({}))).status).toBe(503);
  process.env.BRIEF_ENABLED = 'true'; process.env.BRIEF_POLICY_URL = 'https://studio.example/privacy'; process.env.YOUGILE_API_KEY = 'test-only'; process.env.YOUGILE_COLUMN_ID = 'test-column';
  let sends = 0; let sentBody: Record<string, unknown> = {};
  global.fetch = async (_url, init) => { sends++; sentBody = JSON.parse(init?.body as string); return new Response(JSON.stringify({ id: 'created-task' }), { status: 201 }); };
  const data = { id: crypto.randomUUID(), consent: true, answers: { phone: '+7 912 345 67 89', company: 'Test', route: 'Готовый макет' } };
  expect((await POST(request({ ...data, consent: false }))).status).toBe(400);
  expect((await POST(request(data, 'https://other.example'))).status).toBe(403);
  expect((await POST(request({ ...data, answers: { phone: '123' } }))).status).toBe(400);
  const responses = await Promise.all([POST(request(data)), POST(request(data))]);
  expect(responses.map(r => r.status)).toEqual([201, 201]); expect(sends).toBe(1);
  expect(sentBody.columnId).toBe('test-column'); expect(sentBody.description).toContain('Согласие: получено');
  expect((await POST(request({ ...data, answers: { ...data.answers, company: 'Changed' } }))).status).toBe(409);
  global.fetch = async () => { throw new Error('timeout'); };
  const uncertain = await POST(request({ ...data, id: crypto.randomUUID() }));
  expect(uncertain.status).toBe(502); expect((await uncertain.json()).uncertain).toBe(true);
 } finally { global.fetch = fetchBefore; for (const name of names) { if (before[name] === undefined) delete process.env[name]; else process.env[name] = before[name]; } }
});

test('chat supports template path, keyboard, skip and local download', async ({ page }) => {
 await page.goto('/#brief'); const chat = page.locator('#brief');
 await chat.getByRole('radio', { name: 'Готовый макет', exact: true }).check();
 await chat.getByRole('button', { name: 'Продолжить →', exact: true }).click();
 await chat.getByLabel('Название компании или проекта').fill('Мастерская света');
 await chat.getByLabel('Название компании или проекта').press('Control+Enter');
 await expect(chat.getByRole('heading', { name: 'Какой макет возьмём за основу?' })).toBeFocused();
 await chat.getByRole('radio', { name: 'ФОРМА — Частный мастер' }).check();
 await chat.getByRole('button', { name: 'Продолжить →', exact: true }).click();
 await expect(chat.getByRole('heading', { name: 'Что уже есть для старта?' })).toBeVisible();
 await chat.getByRole('button', { name: 'Сразу к контактам' }).click();
 await chat.getByLabel('Телефон', { exact: true }).fill('123');
 await chat.getByRole('button', { name: 'Посмотреть мой бриф' }).click();
 await expect(chat.getByRole('alert')).toContainText('короткий');
 await chat.getByLabel('Телефон', { exact: true }).fill('+7 912 345 67 89');
 await chat.getByRole('button', { name: 'Посмотреть мой бриф' }).click();
 await expect(chat.getByText('Адаптация готового макета', { exact: true })).toBeVisible();
 await expect(chat.getByText(/ответы не отправлены/)).toBeVisible();
 const download = page.waitForEvent('download'); await chat.getByRole('button', { name: 'Скачать бриф' }).click();
 expect((await download).suggestedFilename()).toBe('brief-sayta.txt');
});

test('shop questions, backtracking and skip work on a phone', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/#brief'); const chat = page.locator('#brief');
 await chat.getByRole('radio', { name: 'Индивидуальный сайт', exact: true }).check();
 await chat.getByRole('button', { name: 'Продолжить →', exact: true }).click();
 await chat.getByRole('button', { name: 'Пропустить шаг', exact: true }).click();
 await chat.getByRole('radio', { name: 'Интернет-магазин', exact: true }).check();
 await chat.getByRole('button', { name: 'Продолжить →', exact: true }).click();
 await chat.getByRole('button', { name: 'Пропустить шаг', exact: true }).click();
 await expect(chat.getByRole('heading', { name: 'Уточним детали каталога' })).toBeVisible();
 await chat.getByRole('checkbox', { name: 'Онлайн-оплата', exact: true }).check();
 await chat.getByRole('button', { name: 'Продолжить →', exact: true }).click();
 await chat.getByRole('button', { name: /С чего начнём ваш сайт/ }).click();
 await chat.getByRole('radio', { name: 'Готовый макет', exact: true }).check();
 await chat.getByRole('button', { name: 'Сохранить и закончить' }).click();
 await chat.getByText('Все ответы и описание проекта', { exact: true }).click();
 await expect(chat.locator('.brief-summary')).not.toContainText('Онлайн-оплата');
 await expect(chat.locator('.brief-summary')).not.toContainText('Интернет-магазин');
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('brief stays readable at narrow widths and reduced motion', async ({ page }) => {
 await page.emulateMedia({ reducedMotion: 'reduce' });
 for (const width of [320, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 }); await page.goto('/#brief');
  await expect(page.locator('#brief .brief-question')).toBeVisible();
  expect(await page.locator('.brief-question').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
 }
});
