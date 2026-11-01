import { expect, test } from '@playwright/test';
import { verifyRequestContext } from '../src/lib/request-context';
import { portfolioProjects } from '../src/lib/portfolio';
import { POST } from '../src/app/api/brief/route';

const origin = 'https://studio.example';
const requestUrl = `${origin}/api/brief`;

test('context requires matching source, service, published project and a clean same-origin URL', () => {
 const check = (input: Record<string, unknown>) => verifyRequestContext(input, requestUrl);
 expect(check({})).toEqual({});
 for (const source of ['services', 'prices', 'portfolio']) {
  expect(check({ source, pageUrl: `${origin}/${source}/` }).context?.source).toBe(source);
 }
 const service = { source: 'services', service: 'landing-page', pageUrl: `${origin}/services/landing-page` };
 expect(check(service).context?.service).toBe('landing-page');
 const invalid = [
  { ...service, source: 'catalog' }, { ...service, service: 'shop' },
  { ...service, service: 1 }, { ...service, pageUrl: `${origin}/services/business-card` },
  { ...service, pageUrl: 'https://other.example/services/landing-page' },
  { ...service, pageUrl: `${origin}/services/landing-page?private=1` },
  { ...service, pageUrl: `${origin}/services/landing-page#contacts` },
  { ...service, pageUrl: `${origin}/services/landing-page?` },
  { ...service, pageUrl: `${origin}/services/../services/landing-page` },
  { ...service, pageUrl: `${origin}/services/%6canding-page` },
  { ...service, templateId: 'beauty-she' }, { ...service, projectSlug: 'made-up' },
  { service: 'landing-page' }, { pageUrl: `${origin}/prices` },
  { source: 'prices', pageUrl: `${origin}/prices`, service: 'landing-page' },
  { source: 'portfolio', projectSlug: 'missing-project', pageUrl: `${origin}/portfolio/missing-project` },
  { source: 'portfolio', projectSlug: '', pageUrl: `${origin}/portfolio` },
 ];
 for (const input of invalid) expect(check(input), JSON.stringify(input)).toHaveProperty('error');
 const project = portfolioProjects[0];
 expect(project).toBeDefined();
 const projectContext = { source: 'portfolio', projectSlug: project.slug, service: project.siteType, pageUrl: `${origin}/portfolio/${project.slug}` };
 expect(check(projectContext).context?.projectTitle).toBe(project.title);
 expect(check({ ...projectContext, pageUrl: `${origin}/portfolio` })).toHaveProperty('error');
 expect(check({ ...projectContext, service: project.siteType === 'landing-page' ? 'business-card' : 'landing-page' })).toHaveProperty('error');
});

test('mock CRM receives trusted context; validation and context-aware idempotency precede delivery', async () => {
 const names = ['BRIEF_ENABLED', 'BRIEF_POLICY_URL', 'YOUGILE_API_KEY', 'YOUGILE_COLUMN_ID'];
 const before = Object.fromEntries(names.map(name => [name, process.env[name]]));
 const originalFetch = global.fetch;
 try {
  process.env.BRIEF_ENABLED = 'true'; process.env.BRIEF_POLICY_URL = `${origin}/privacy`;
  process.env.YOUGILE_API_KEY = 'mock-only'; process.env.YOUGILE_COLUMN_ID = 'mock-column';
  const tasks: { description: string }[] = [];
  global.fetch = async (_url, init) => {
   tasks.push(JSON.parse(String(init?.body)));
   return new Response(JSON.stringify({ id: 'mock-context-task' }), { status: 201 });
  };
  const base = { route: 'Новый сайт под ключ', channel: 'MAX', phone: '+7 916 111 22 33', comment: '<Заявка>' };
  const send = (answers: Record<string, unknown>, id = crypto.randomUUID(), consent = true) => POST(new Request(requestUrl, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ id, consent, answers }) }));
  const answers = { ...base, source: 'services', service: 'business-card', pageUrl: `${origin}/services/business-card` };
  expect((await send({ ...answers, service: 'unknown' })).status).toBe(400);
  expect((await send(answers, crypto.randomUUID(), false)).status).toBe(400);
  expect(tasks).toHaveLength(0);
  const id = crypto.randomUUID();
  expect((await Promise.all([send(answers, id), send(answers, id)])).map(response => response.status)).toEqual([201, 201]);
  expect(tasks).toHaveLength(1);
  expect(tasks[0].description).toContain('Источник: услуги');
  expect(tasks[0].description).toContain('Услуга: Сайт-визитка');
  expect(tasks[0].description).toContain(answers.pageUrl);
  expect(tasks[0].description).toContain('&lt;Заявка&gt;');
  expect((await send({ ...answers, service: 'landing-page', pageUrl: `${origin}/services/landing-page` }, id)).status).toBe(409);
  const project = portfolioProjects[0];
  expect((await send({ ...base, source: 'portfolio', projectSlug: project.slug, pageUrl: `${origin}/portfolio/${project.slug}`, projectTitle: 'forged-project-title' })).status).toBe(201);
  expect(tasks[1].description).toContain(`Проект: ${project.title}`);
  expect(tasks[1].description).not.toContain('forged-project-title');
  expect((await send({ ...base, source: 'prices', pageUrl: `${origin}/prices` })).status).toBe(201);
  expect((await send(answers)).status).toBe(429);
  expect(tasks).toHaveLength(3);
 } finally {
  global.fetch = originalFetch;
  for (const name of names) { if (before[name] === undefined) delete process.env[name]; else process.env[name] = before[name]; }
 }
});

test('commercial form sends page context without query or hash and keeps consent mandatory', async ({ page }) => {
 test.skip(!process.env.TEST_REQUESTS_ENABLED, 'Requires enabled mock request configuration.');
 const bodies: { answers: Record<string, string> }[] = [];
 await page.route('**/api/brief', async route => {
  bodies.push(route.request().postDataJSON());
  await route.fulfill({ status: 201, json: { taskId: 'mock-page-task' } });
 });
 await page.goto('/services/landing-page?private=ignore#request');
 const form = page.getByRole('form', { name: 'Заявка на сайт' });
 await form.getByLabel('Номер телефона').fill('+7 917 111 22 33');
 await form.getByRole('button', { name: 'Отправить заявку', exact: true }).click();
 expect(bodies).toHaveLength(0);
 await expect(form.getByRole('checkbox')).toBeFocused();
 await form.getByRole('checkbox').check();
 await form.getByRole('button', { name: 'Отправить заявку', exact: true }).click();
 await expect(form.getByRole('status')).toContainText('Заявка отправлена');
 expect(bodies).toHaveLength(1);
 expect(bodies[0].answers).toMatchObject({ source: 'services', service: 'landing-page', pageUrl: new URL('/services/landing-page', page.url()).href, route: 'Новый сайт под ключ' });
 await expect(form.getByRole('button', { name: 'Заявка отправлена' })).toBeDisabled();
});
