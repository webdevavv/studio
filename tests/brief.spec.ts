import { test, expect } from '@playwright/test';
import { cleanAnswers, yougileTask } from '../src/lib/brief';
import { findTemplate } from '../src/lib/catalog';
import { POST } from '../src/app/api/brief/route';

test('request contract removes unrelated fields and escapes CRM content', () => {
 const clean = cleanAnswers({ route: 'Готовый шаблон', channel: 'MAX', phone: '+7 912 345 67 89', comment: '<script>alert(1)</script>', company: 'legacy', features: ['CRM'] });
 expect(Object.keys(clean)).toEqual(['route', 'channel', 'phone', 'comment']);
 const task = yougileTask(clean, 'test-id', '2026-10-31', 'column', 'https://example.com/privacy');
 expect(task.description).not.toContain('<script>'); expect(task.description).toContain('&lt;script&gt;');
 expect(task.description).toContain('Способ связи: MAX');
 expect(cleanAnswers(null)).toEqual({});
});

test('YouGile adapter validates, protects against spam and deduplicates delivery', async () => {
 const names = ['BRIEF_ENABLED', 'BRIEF_POLICY_URL', 'YOUGILE_API_KEY', 'YOUGILE_COLUMN_ID'];
 const before = Object.fromEntries(names.map(n => [n, process.env[n]])); const fetchBefore = global.fetch;
 const request = (body: unknown, origin = 'https://studio.example') => new Request('https://studio.example/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) });
 try {
  let sends = 0; let sentBody: Record<string, unknown> = {};
  global.fetch = async (_url, init) => { sends++; sentBody = JSON.parse(init?.body as string); return new Response(JSON.stringify({ id: 'created-task' }), { status: 201 }); };
  process.env.BRIEF_ENABLED = 'false';
  expect((await POST(request({}))).status).toBe(503); expect(sends).toBe(0);
  process.env.BRIEF_ENABLED = 'true'; process.env.BRIEF_POLICY_URL = 'https://studio.example/privacy'; process.env.YOUGILE_API_KEY = 'test-only'; process.env.YOUGILE_COLUMN_ID = 'test-column';
  const data = { id: crypto.randomUUID(), consent: true, answers: { phone: '+7 912 345 67 89', route: 'Готовый шаблон', channel: 'Telegram', comment: 'Тест' } };
  expect((await POST(request({ ...data, consent: false }))).status).toBe(400);
  expect((await POST(request(data, 'https://other.example'))).status).toBe(403);
  expect((await POST(request({ ...data, answers: { ...data.answers, phone: '123' } }))).status).toBe(400);
  expect((await POST(request({ ...data, answers: { ...data.answers, channel: 'Email' } }))).status).toBe(400);
  expect((await POST(request({ ...data, answers: { phone: data.answers.phone } }))).status).toBe(400);
  expect((await POST(request({ ...data, website: 'spam' }))).status).toBe(400);
  expect((await POST(request({ ...data, extra: 'x'.repeat(41000) }))).status).toBe(413);
  const responses = await Promise.all([POST(request(data)), POST(request(data))]);
  expect(responses.map(r => r.status)).toEqual([201, 201]); expect(sends).toBe(1);
  expect(sentBody.columnId).toBe('test-column'); expect(sentBody.description).toContain('Согласие: получено');
  expect((await POST(request({ ...data, answers: { ...data.answers, comment: 'Changed' } }))).status).toBe(409);
  global.fetch = async () => { throw new Error('timeout'); };
  const uncertain = await POST(request({ ...data, id: crypto.randomUUID() }));
  expect(uncertain.status).toBe(502); expect((await uncertain.json()).uncertain).toBe(true);
  global.fetch = async () => new Response('{}', { status: 400 });
  const rejected = await POST(request({ ...data, id: crypto.randomUUID() }));
  expect(rejected.status).toBe(502); expect((await rejected.json()).uncertain).toBe(false);
  expect((await POST(request({ ...data, id: crypto.randomUUID() }))).status).toBe(429);
 } finally { global.fetch = fetchBefore; for (const name of names) { if (before[name] === undefined) delete process.env[name]; else process.env[name] = before[name]; } }
});

test('enabled form requires consent, sends selected values once and shows success', async ({ page }) => {
 test.skip(!process.env.TEST_REQUESTS_ENABLED, 'Run against a build with the request adapter enabled and a test policy URL.');
 let sends = 0; let body: Record<string, unknown> = {};
 await page.route('**/api/brief', async route => { sends++; body = route.request().postDataJSON(); await new Promise(resolve => setTimeout(resolve, 200)); await route.fulfill({ status: 201, json: { taskId: 'mock-task' } }); });
 await page.goto('/#contacts');
 const form = page.getByRole('form', { name: 'Заявка на сайт' });
 await form.getByLabel('Номер телефона').fill('+7 913 456 78 90');
 await form.getByRole('combobox', { name: /Какой сайт нужен/ }).click();
 await form.getByRole('option', { name: 'Готовый шаблон', exact: true }).click();
 await form.getByRole('combobox', { name: /Как удобнее связаться/ }).click();
 await form.getByRole('option', { name: 'MAX', exact: true }).click();
 await form.getByLabel('Комментарий о проекте').fill('Столярная мастерская');
 const submit = form.getByRole('button', { name: 'Отправить заявку', exact: true });
 await submit.click(); await expect(form.getByRole('checkbox')).toBeFocused(); expect(sends).toBe(0);
 await form.getByRole('checkbox').check(); await submit.click();
 await expect(form.getByRole('button')).toBeDisabled();
 await expect(form.getByRole('status')).toContainText('Заявка отправлена'); expect(sends).toBe(1);
 expect(body.answers).toEqual({ route: 'Готовый шаблон', channel: 'MAX', phone: '+7 (913) 456-78-90', comment: 'Столярная мастерская' });
});

test('enabled form retains values on rejection and prevents uncertain retries', async ({ page }) => {
 test.skip(!process.env.TEST_REQUESTS_ENABLED, 'Requires enabled test configuration.');
 let sends = 0; const ids: string[] = [];
 await page.route('**/api/brief', async route => { sends++; ids.push(route.request().postDataJSON().id); await route.fulfill({ status: 502, json: sends === 1 ? { message: 'Сервис не принял заявку.', uncertain: false } : { message: 'Уточните получение у студии.', uncertain: true } }); });
 await page.goto('/#contacts'); const form = page.getByRole('form', { name: 'Заявка на сайт' });
 await form.getByLabel('Номер телефона').fill('+7 913 456 78 90'); await form.getByRole('checkbox').check();
 await form.getByRole('button').click(); await expect(form.getByRole('status')).toContainText('Сервис не принял');
 await expect(form.getByLabel('Номер телефона')).toHaveValue('+7 (913) 456-78-90');
 await form.getByRole('button').click(); await expect(form.getByRole('status')).toContainText('Уточните получение');
 await expect(form.getByRole('button')).toBeDisabled(); expect(ids[0]).toBe(ids[1]); expect(sends).toBe(2);
});

test('catalog request resolves trusted template details and rejects unpublished IDs', async () => {
 const names = ['BRIEF_ENABLED', 'BRIEF_POLICY_URL', 'YOUGILE_API_KEY', 'YOUGILE_COLUMN_ID'];
 const before = Object.fromEntries(names.map(name => [name, process.env[name]]));
 const fetchBefore = global.fetch;
 try {
  process.env.BRIEF_ENABLED = 'true'; process.env.BRIEF_POLICY_URL = 'https://studio.example/privacy'; process.env.YOUGILE_API_KEY = 'mock-only'; process.env.YOUGILE_COLUMN_ID = 'mock-column';
  let sends = 0; let sentBody = '';
  global.fetch = async (_url, init) => { sends++; sentBody = String(init?.body); return new Response(JSON.stringify({ id: 'mock-catalog-task' }), { status: 201 }); };
  const answers = { route: 'Готовый шаблон', channel: 'MAX', phone: '+7 914 321 98 76', templateId: 'beauty-she', name: '<Анна>', templateTitle: 'forged-title', price: 1, demoUrl: 'https://forged.example' };
  const send = (input: unknown, id = crypto.randomUUID()) => POST(new Request('https://studio.example/api/brief', { method: 'POST', headers: { Origin: 'https://studio.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ id, consent: true, website: '', answers: input }) }));
  expect((await send({ ...answers, templateId: 'not-published' })).status).toBe(400);
  expect((await send({ ...answers, templateId: '' })).status).toBe(400);
  expect(sends).toBe(0);
  const id = crypto.randomUUID();
  expect((await send(answers, id)).status).toBe(201);
  expect((await send(answers, id)).status).toBe(201);
  expect(sends).toBe(1);
  expect(sentBody).toContain('beauty-she'); expect(sentBody).toContain('&lt;Анна&gt;');
  const template = findTemplate('beauty-she')!;
  expect(sentBody).toContain(template.title); expect(sentBody).toContain(template.demoUrl);
  expect(sentBody).not.toContain('forged-title'); expect(sentBody).not.toContain('forged.example');
  expect((await send({ ...answers, templateId: 'golden-hands' }, id)).status).toBe(409);
 } finally {
  global.fetch = fetchBefore;
  for (const name of names) { if (before[name] === undefined) delete process.env[name]; else process.env[name] = before[name]; }
 }
});
