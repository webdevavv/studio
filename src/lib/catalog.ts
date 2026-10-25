import { concepts } from './site';

export const catalogCategories = [
 { id: 'food', label: 'Кафе и еда' },
 { id: 'beauty', label: 'Красота и уход' },
 { id: 'craft', label: 'Мастерские' },
] as const;

export const catalogStyles = [
 { id: 'warm', label: 'Тёплый' },
 { id: 'calm', label: 'Спокойный' },
 { id: 'bold', label: 'Выразительный' },
] as const;

const details = {
 coffee: { categoryId: 'food', styleId: 'warm', description: 'Мягкие оттенки, крупная типографика и иллюстрация чашки. Для кофейни, пекарни или небольшого кафе.', keywords: 'кофе кафе кофейня пекарня еда ресторан выпечка', audience: 'Кофейни, пекарни, небольшие кафе' },
 beauty: { categoryId: 'beauty', styleId: 'calm', description: 'Приглушённый зелёный, свободная композиция и акцент на заботе. Для салона, студии ухода или частного мастера.', keywords: 'салон красота уход спа spa косметолог парикмахер', audience: 'Салоны красоты и студии ухода' },
 craft: { categoryId: 'craft', styleId: 'bold', description: 'Землистые оттенки, уверенный шрифт и предмет в центре внимания. Для мастерской и вещей ручной работы.', keywords: 'мебель дерево мастерская столяр ручная работа ремесло', audience: 'Мастерские и частные мастера' },
} as const;

export const catalogTemplates = concepts.map(concept => ({
 ...concept,
 ...details[concept.id as keyof typeof details],
 image: `/projects/${concept.id}.png`,
}));

export type CatalogTemplate = (typeof catalogTemplates)[number];
export const findTemplate = (id: string) => catalogTemplates.find(template => template.id === id);

export function filterTemplates(query: string, category: string, style: string) {
 const words = query.toLocaleLowerCase('ru').split(/\s+/).filter(Boolean);
 return catalogTemplates.filter(template => {
  const haystack = `${template.name} ${template.category} ${template.description} ${template.keywords}`.toLocaleLowerCase('ru');
  return (!category || template.categoryId === category)
   && (!style || template.styleId === style)
   && words.every(word => haystack.includes(word));
 });
}
