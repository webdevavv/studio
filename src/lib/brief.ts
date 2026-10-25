import { concepts, money, services, site } from './site';
import { phoneError } from './phone';

export type Answers = Record<string, string | string[]>;
type Field = { id: string; label: string; type?: 'text' | 'textarea' | 'select' | 'multi' | 'date' | 'tel'; options?: string[]; placeholder?: string; hint?: string; when?: (a: Answers) => boolean };
export type BriefStep = { id: string; title: string; hint: string; fields: Field[]; when?: (a: Answers) => boolean };
export const value = (a: Answers, id: string) => typeof a[id] === 'string' ? a[id] as string : '';
const has = (a: Answers, id: string, item: string) => Array.isArray(a[id]) && a[id].includes(item);
const custom = (a: Answers) => value(a, 'route') !== 'Готовый макет';
export const isShop = (a: Answers) => value(a, 'format') === 'Интернет-магазин';
export const isCatalog = (a: Answers) => isShop(a) || value(a, 'format') === 'Каталог' || has(a, 'features', 'Каталог') || value(a, 'goal') === 'Продавать товары';
export const briefSteps: BriefStep[] = [
 { id: 'route', title: 'С чего начнём ваш сайт?', hint: 'Около 2–4 минут. Любой вопрос можно пропустить. Если пока не знаете ответ — разберёмся вместе.', fields: [
  { id: 'route', label: 'Какой подход вам ближе?', type: 'select', options: ['Готовый макет', 'Индивидуальный сайт', 'Помогите выбрать'] },
 ] },
 { id: 'business', title: 'Расскажите немного о вашем деле', hint: 'Достаточно названия и пары слов. Подробности можно обсудить позже.', fields: [
  { id: 'company', label: 'Название компании или проекта', placeholder: 'Как вас знают клиенты?' },
  { id: 'niche', label: 'Сфера бизнеса', type: 'select', options: ['Красота и здоровье', 'Кафе и еда', 'Услуги и ремонт', 'Магазин', 'Обучение', 'Производство', 'Другая сфера'] },
  { id: 'business', label: 'Что предлагаете и кому?', type: 'textarea', placeholder: 'Например, мебель на заказ для квартир и небольших кафе' },
  { id: 'region', label: 'Где работают ваши клиенты?', type: 'select', options: ['Один город', 'Несколько городов', 'Вся Россия', 'Онлайн'] },
  { id: 'cities', label: 'Какой город или города?', when: a => ['Один город', 'Несколько городов'].includes(value(a, 'region')) },
 ] },
 { id: 'template', title: 'Какой макет возьмём за основу?', hint: `Адаптация — ${money(site.catalogPrice)}: замена текстов, фотографий, логотипа и контактов. Структура сохраняется. Новые функции и переработка дизайна оцениваются отдельно.`, when: a => !custom(a), fields: [
  { id: 'template', label: 'Готовый дизайн', type: 'select', options: [...concepts.map(c => `${c.name} — ${c.label}`), 'Ещё выбираю'] },
 ] },
 { id: 'goal', title: 'Что сайт должен делать для бизнеса?', hint: 'Выберите главную задачу. Она поможет предложить формат без лишних функций.', when: custom, fields: [
  { id: 'goal', label: 'Главная цель', type: 'select', options: ['Получать заявки', 'Продавать товары', 'Показывать услуги и работы', 'Рассказывать о компании', 'Публиковать статьи', 'Пока не знаю'] },
  { id: 'action', label: 'Что должен сделать посетитель?', type: 'select', options: ['Позвонить', 'Написать в мессенджер', 'Оставить заявку', 'Оформить заказ', 'Записаться', 'Посмотреть информацию'] },
  { id: 'format', label: 'Предполагаемый формат', type: 'select', options: ['Лендинг', 'Сайт-визитка', 'Корпоративный сайт', 'Портфолио', 'Каталог', 'Интернет-магазин', 'Нужен совет'] },
 ] },
 { id: 'scope', title: 'Что важно разместить на сайте?', hint: 'Можно выбрать несколько вариантов. Отметьте только то, что действительно нужно к запуску.', when: custom, fields: [
  { id: 'sections', label: 'Разделы', type: 'multi', options: ['О компании', 'Услуги', 'Цены', 'Работы', 'Отзывы', 'Каталог', 'Блог', 'Контакты', 'Частые вопросы'] },
  { id: 'features', label: 'Дополнительные возможности', type: 'multi', options: ['Онлайн-запись', 'Каталог', 'Калькулятор', 'Личный кабинет', 'Поиск', 'Онлайн-чат'] },
  { id: 'other', label: 'Особая задача или преимущество', type: 'textarea', placeholder: 'Например, расчёт доставки или бесплатная консультация' },
 ] },
 { id: 'commerce', title: 'Уточним детали каталога', hint: 'Магазин, оплата и интеграции требуют индивидуальной оценки. Стоимость и срок подтвердим после разбора задачи.', when: a => custom(a) && (isCatalog(a) || has(a, 'sections', 'Каталог')), fields: [
  { id: 'count', label: 'Сколько товаров или услуг?', type: 'select', options: ['1–5', '6–20', '21–100', 'Более 100', 'Пока не знаю'] },
  { id: 'catalogFeatures', label: 'Как устроить каталог?', type: 'multi', options: ['Категории', 'Фильтры', 'Сортировка', 'Отдельные страницы товаров', 'Самостоятельное редактирование'] },
  { id: 'shopFeatures', label: 'Что нужно для покупки?', type: 'multi', options: ['Корзина', 'Онлайн-оплата', 'Доставка', 'Личный кабинет'], when: isShop },
  { id: 'productMaterials', label: 'Фотографии и описания товаров', type: 'select', options: ['Всё готово', 'Готова часть', 'Нужна помощь'] },
 ] },
 { id: 'design', title: 'Какое впечатление должен создавать сайт?', hint: 'Если есть пример — одной ссылки достаточно. Можно оставить решение студии.', when: custom, fields: [
  { id: 'style', label: 'Характер дизайна', type: 'select', options: ['Минималистичный', 'Деловой', 'Яркий', 'Премиальный', 'Дружелюбный', 'На усмотрение студии'] },
  { id: 'references', label: 'Примеры и пожелания', type: 'textarea', placeholder: 'До трёх ссылок: что нравится или точно не подходит' },
 ] },
 { id: 'materials', title: 'Что уже есть для старта?', hint: 'Файлы сейчас загружать не нужно. Можно дать ссылку на папку с материалами без пароля или передать её позже.', fields: [
  { id: 'logo', label: 'Логотип и фирменный стиль', type: 'select', options: ['Логотип и цвета готовы', 'Есть только логотип', 'Есть только цвета', 'Нужна помощь', 'Нет, обсудим позже'] },
  { id: 'texts', label: 'Тексты', type: 'select', options: ['Готовы', 'Есть часть', 'Возьмём из соцсетей', 'Нужна помощь'] },
  { id: 'photos', label: 'Фотографии', type: 'select', options: ['Готовы', 'Есть часть', 'Нужна помощь'] },
  { id: 'materialsLink', label: 'Ссылка на материалы или соцсети', placeholder: 'https://…', hint: 'Укажите только материалы, которые разрешаете использовать для проекта.' },
 ] },
 { id: 'technical', title: 'Есть ли технические пожелания?', hint: 'Этот шаг можно целиком пропустить. Редактирование блога и каталога зависит от тарифа; остальные возможности оцениваются отдельно.', fields: [
  { id: 'existing', label: 'Действующий сайт или домен', placeholder: 'https://… или example.ru' },
  { id: 'domain', label: 'Домен и размещение', type: 'select', options: ['Домен и хостинг есть', 'Есть только домен', 'Нужна помощь', 'Обсудим позже'] },
  { id: 'editing', label: 'Что хотите редактировать сами?', type: 'select', options: ['Блог', 'Каталог', 'Блог и каталог', 'Поручу студии', 'Пока не знаю'], when: custom },
  { id: 'integrations', label: 'Связи с другими сервисами', type: 'multi', options: ['CRM', 'Карты', 'Аналитика', 'Онлайн-запись', 'Другое'], when: custom },
  { id: 'technical', label: 'Другие требования', type: 'textarea', placeholder: 'Языки, продвижение, доставка, название CRM или другая важная деталь', when: custom },
 ] },
 { id: 'terms', title: 'На какой запуск ориентируемся?', hint: 'Это ваши пожелания, не обещание срока. Подтвердим объём, стоимость и дату после обсуждения.', fields: [
  { id: 'timing', label: 'Когда нужен сайт?', type: 'select', options: ['Как можно скорее', 'В течение недели', 'В течение месяца', 'К определённой дате', 'Без спешки'] },
  { id: 'date', label: 'Желаемая дата запуска', type: 'date', when: a => value(a, 'timing') === 'К определённой дате' },
  { id: 'budget', label: 'Ориентир по бюджету', type: 'select', options: [`Адаптация макета — ${money(site.catalogPrice)}`, `Лендинг — от ${money(services[1].price)}`, `Несколько страниц — от ${money(services[2].price)}`, 'Обсудим индивидуально', 'Нужен совет'], when: custom },
  { id: 'priority', label: 'Что важнее всего?', type: 'select', options: ['Стоимость', 'Скорость', 'Индивидуальный дизайн', 'Функции', 'Развитие сайта'] },
 ] },
 { id: 'contact', title: 'Как продолжим разговор?', hint: 'Можно пропустить контакты и сохранить бриф себе. Для отправки менеджеру понадобится телефон и отдельное согласие.', fields: [
  { id: 'name', label: 'Как к вам обращаться?', placeholder: 'Ваше имя' },
  { id: 'phone', label: 'Телефон', type: 'tel', placeholder: '+7 (999) 123-45-67' },
  { id: 'channel', label: 'Как удобнее связаться?', type: 'select', options: ['Telegram', 'MAX', 'Телефонный звонок'] },
  { id: 'handle', label: 'Имя пользователя или ссылка для связи', when: a => ['Telegram', 'MAX'].includes(value(a, 'channel')), hint: 'Если вас нельзя найти по номеру телефона.' },
  { id: 'comment', label: 'Когда удобно поговорить? Что ещё учесть?', type: 'textarea', placeholder: 'Время и часовой пояс, дополнительные пожелания' },
 ] },
];
export const getSteps = (a: Answers) => briefSteps.filter(step => !step.when || step.when(a));
export const getFields = (step: BriefStep, a: Answers) => step.fields.filter(field => !field.when || field.when(a));
export function cleanAnswers(input: Answers): Answers {
 const clean: Answers = {};
 for (const step of getSteps(input)) for (const field of getFields(step, input)) {
  const v = input[field.id];
  if (field.type === 'multi') { if (Array.isArray(v)) clean[field.id] = [...new Set(v.filter(item => field.options?.includes(item)))]; }
  else if (typeof v === 'string' && (!field.options || field.options.includes(v))) clean[field.id] = v.trim().slice(0, field.type === 'textarea' ? 1500 : 300);
 }
 return clean;
}
export function answerError(id: string, a: Answers) {
 const v = value(a, id).trim();
 if (!v) return '';
 if (id === 'phone') return phoneError(v);
 if (id === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString().slice(0, 10) !== v)) return 'Выберите корректную дату.';
 if (id === 'materialsLink' && !/^https?:\/\/[^\s]+$/i.test(v)) return 'Укажите полную ссылку, начиная с https://.';
 return '';
}
export function suggest(a: Answers) {
 const selected = value(a, 'format');
 const format = !custom(a) ? 'Адаптация готового макета' : selected && selected !== 'Нужен совет' ? selected : value(a, 'goal') === 'Продавать товары' ? 'Каталог или интернет-магазин' : value(a, 'goal') === 'Получать заявки' ? 'Лендинг' : 'Формат уточним на консультации';
 const complex = isShop(a) || ['Личный кабинет', 'Калькулятор'].some(f => has(a, 'features', f)) || has(a, 'integrations', 'CRM');
 const missing = ['company', 'business', 'phone'].filter(k => !value(a, k)).map(k => ({ company: 'название проекта', business: 'описание бизнеса', phone: 'контактный телефон' })[k]);
 for (const [id, label] of [['logo', 'логотип и стиль'], ['photos', 'фотографии'], ['texts', 'тексты']]) if (!value(a, id) || /помощь|часть|позже/.test(value(a, id))) missing.push(label);
 if (isShop(a) && !(a.shopFeatures as string[] | undefined)?.length) missing.push('сценарий заказа, оплаты и доставки');
 if (value(a, 'budget').startsWith('Адаптация') && custom(a)) missing.push('бюджет адаптации выбран для индивидуального проекта');
 const blocks = Array.isArray(a.sections) && a.sections.length ? ['Первый экран с предложением', ...a.sections] : !custom(a) ? ['Сохраняем блоки выбранного макета'] : ['Первый экран с предложением', isCatalog(a) ? 'Каталог и карточки' : 'Услуги или предложение', 'Подтверждение качества — при наличии материалов', 'Контакты и целевое действие'];
 const complexity = complex ? 'Сложный' : isCatalog(a) || selected === 'Корпоративный сайт' || (a.integrations as string[] | undefined)?.length ? 'Средней сложности' : !custom(a) || selected === 'Лендинг' || selected === 'Сайт-визитка' ? 'Простой' : 'Недостаточно данных';
 return { format, blocks, complexity, reason: !custom(a) ? 'Вы выбрали сохранение структуры готового дизайна.' : selected && selected !== 'Нужен совет' ? 'Вы указали этот формат в ответах.' : value(a, 'goal') ? `Основание: главная цель — «${value(a, 'goal')}».` : 'Данных для рекомендации пока недостаточно.', assessment: complex ? 'Индивидуальная оценка: нужны уточнения по функциям и интеграциям.' : 'Объём, срок и стоимость нужно подтвердить после обсуждения.', missing };
}
export function summary(a: Answers) {
 const clean = cleanAnswers(a); const advice = suggest(clean);
 return [`Предварительный бриф: ${value(clean, 'company') || 'Название не указано'}`, `Формат: ${advice.format}`, advice.reason, advice.assessment, `Предложение структуры (требует согласования):\n${advice.blocks.join('\n')}`, `Предварительная сложность: ${advice.complexity}.\nОбязательный сценарий: ${value(clean, 'action') || 'нужно уточнить'}.\nДополнительные функции: ${Array.isArray(clean.features) && clean.features.length ? clean.features.join(', ') : 'не указаны'}. Приоритеты функций подтвердить с клиентом.`, ...getSteps(clean).map(step => `${step.title}\n${getFields(step, clean).map(f => `${f.label}: ${Array.isArray(clean[f.id]) ? (clean[f.id] as string[]).join(', ') || 'Не указано' : clean[f.id] || 'Не указано'}`).join('\n')}`), `Уточнить: ${advice.missing.join(', ') || 'состав работ, материалы и условия запуска'}`, 'Следующее действие: связаться с клиентом, проверить требования и согласовать оценку.'].join('\n\n');
}
export function yougileTask(a: Answers, id: string, createdAt: string, columnId: string, consentUrl: string, assigned?: string) {
 const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
 return { title: `Бриф: ${value(a, 'company') || 'Новый проект'} · ${id.slice(0, 8)}`.slice(0, 200), columnId, description: `<p>${escape(summary(a)).replace(/\n/g, '<br>')}</p><p>${escape(`ID: ${id}\nСоздана: ${createdAt}\nИсточник: главная /#brief\nСтатус: новая заявка\nСогласие: получено при отправке\nПолитика: ${consentUrl}`).replace(/\n/g, '<br>')}</p>`, ...(assigned ? { assigned: [assigned] } : {}), completed: false, archived: false };
}
