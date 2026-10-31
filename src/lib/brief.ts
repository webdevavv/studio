import { phoneError } from './phone';

// Public request contract shared by the form and the existing YouGile adapter.
export const requestKinds = ['Новый сайт под ключ', 'Готовый шаблон', 'Пока не знаю, нужна помощь'] as const;
export const contactChannels = ['Telegram', 'MAX', 'Телефонный звонок'] as const;
export type Answers = Record<string, string>;
export const value = (a: Answers, id: string) => typeof a[id] === 'string' ? a[id] : '';
export function cleanAnswers(input: unknown): Answers {
 if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
 const raw = input as Record<string, unknown>;
 const clean: Answers = {};
 for (const [id, limit] of [['route', 100], ['channel', 100], ['phone', 40], ['comment', 1500]] as const) {
  if (typeof raw[id] === 'string') clean[id] = raw[id].trim().slice(0, limit);
 }
 return clean;
}
export function answerError(id: string, a: Answers) {
 const input = value(a, id);
 if (id === 'phone') return phoneError(input);
 if (id === 'route' && !requestKinds.some(kind => kind === input)) return 'Выберите, какой сайт нужен.';
 if (id === 'channel' && !contactChannels.some(channel => channel === input)) return 'Выберите способ связи.';
 return '';
}
export function yougileTask(a: Answers, id: string, createdAt: string, columnId: string, consentUrl: string, assigned?: string) {
 const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
 const description = [
  `Какой сайт нужен: ${value(a, 'route')}`, `Способ связи: ${value(a, 'channel')}`,
  `Телефон: ${value(a, 'phone')}`, `Комментарий: ${value(a, 'comment') || 'Не указан'}`,
  `ID: ${id}`, `Создана: ${createdAt}`, 'Источник: главная /#contacts',
  'Статус: новая заявка', 'Согласие: получено при отправке', `Политика: ${consentUrl}`,
  'Следующее действие: менеджеру связаться с клиентом и согласовать предложение.',
 ].join('\n');
 return { title: `Заявка на сайт · ${id.slice(0, 8)}`, columnId, description: `<p>${escape(description).replace(/\n/g, '<br>')}</p>`, ...(assigned ? { assigned: [assigned] } : {}), completed: false, archived: false };
}
