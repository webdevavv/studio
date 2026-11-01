import { NextResponse } from 'next/server';
import { answerError, cleanAnswers, value, yougileTask } from '@/lib/brief';
import { findTemplate } from '@/lib/catalog';
import { briefConfig } from '@/lib/brief-config';

export const runtime = 'nodejs';
type Result = { status: number; body: Record<string, unknown> };
// Single-process safeguards. Use shared durable storage before scaling to multiple instances.
const deliveries = new Map<string, { signature: string; expires: number; result: Promise<Result> }>();
const attempts = new Map<string, { count: number; expires: number }>();
const reply = (result: Result) => NextResponse.json(result.body, { status: result.status, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: Request) {
 const config = briefConfig();
 if (!config.enabled) return reply({ status: 503, body: { message: 'Приём заявок пока не подключён. Попробуйте позже.' } });
 if (request.headers.get('origin') !== new URL(request.url).origin) return reply({ status: 403, body: { message: 'Отправьте заявку со страницы сайта.' } });
 if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ status: 415, body: { message: 'Некорректный формат запроса.' } });
 const tooLarge = () => reply({ status: 413, body: { message: 'Слишком большая заявка. Сократите дополнительные комментарии.' } });
 if (Number(request.headers.get('content-length')) > 40000) return tooLarge();
 let raw: unknown;
 try {
  const reader = request.body?.getReader(); if (!reader) throw new Error('empty');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 40000) { await reader.cancel(); return tooLarge(); } chunks.push(part.value); }
  raw = JSON.parse(Buffer.concat(chunks).toString('utf8'));
 } catch { return reply({ status: 400, body: { message: 'Не удалось прочитать заявку.' } }); }
 if (!raw || typeof raw !== 'object') return reply({ status: 400, body: { message: 'Некорректная заявка.' } });
 const data = raw as Record<string, unknown>;
 if (typeof data.id !== 'string' || !/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(data.id) || data.consent !== true || !data.answers || typeof data.answers !== 'object' || Array.isArray(data.answers)) return reply({ status: 400, body: { message: 'Проверьте ответы и согласие на обработку данных.' } });
 if (typeof data.website === 'string' && data.website.trim()) return reply({ status: 400, body: { message: 'Не удалось отправить заявку.' } });
 const answers = cleanAnswers(data.answers);
 const templateId = value(answers, 'templateId');
 const template = templateId ? findTemplate(templateId) : undefined;
 if ((Object.hasOwn(data.answers, 'templateId') && (!template || !template.isPublished)) || (template && value(answers, 'route') !== 'Готовый шаблон')) return reply({ status: 400, body: { message: 'Выберите опубликованный шаблон из каталога.' } });
 const invalid = ['route', 'channel', 'phone'].map(id => answerError(id, answers)).find(Boolean);
 if (invalid || !value(answers, 'phone')) return reply({ status: 400, body: { message: invalid || 'Укажите телефон для связи.' } });
 const now = Date.now();
 for (const [id, entry] of deliveries) if (entry.expires < now) deliveries.delete(id);
 for (const [id, entry] of attempts) if (entry.expires < now) attempts.delete(id);
 const signature = JSON.stringify(answers);
 const existing = deliveries.get(data.id);
 if (existing) return existing.signature === signature ? reply(await existing.result) : reply({ status: 409, body: { message: 'Данные заявки изменились. Обновите заявку перед отправкой.' } });
 // Phone-based limit does not trust arbitrary forwarded IP headers.
 const phone = value(answers, 'phone').replace(/\D/g, '');
 const attempt = attempts.get(phone) || { count: 0, expires: now + 10 * 60 * 1000 };
 if (attempt.count >= 3 || deliveries.size >= 500) return reply({ status: 429, body: { message: 'Слишком много отправок. Попробуйте позже.' } });
 attempts.set(phone, { ...attempt, count: attempt.count + 1 });
 const id = data.id;
 const task = yougileTask(answers, id, new Date(now).toISOString(), config.columnId, config.policyUrl, config.assigned, template ? { id: template.id, title: template.title, demoUrl: template.demoUrl, price: template.price } : undefined);
 const result = (async (): Promise<Result> => {
  try {
   const response = await fetch(`${config.baseUrl}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.key}` }, body: JSON.stringify(task), signal: AbortSignal.timeout(15000), redirect: 'error', cache: 'no-store' });
   if (!response.ok) return { status: 502, body: { uncertain: response.status >= 500, message: response.status >= 500 ? 'Не удалось подтвердить получение. Уточните получение у студии перед повторной отправкой.' : 'Сервис не принял заявку. Подключение требует проверки.' } };
   const created = await response.json();
   if (typeof created.id !== 'string' || !created.id) throw new Error('No task id');
   return { status: 201, body: { id, taskId: created.id } };
  } catch { return { status: 502, body: { uncertain: true, message: 'Не удалось подтвердить получение. Уточните получение у студии перед повторной отправкой.' } }; }
 })();
 deliveries.set(id, { signature, expires: now + 30 * 60 * 1000, result });
 const outcome = await result;
 // A definitive upstream rejection is safe to retry; uncertain delivery keeps its ID locked.
 if (outcome.status >= 400 && outcome.body.uncertain === false) deliveries.delete(id);
 return reply(outcome);
}
