import type { Metadata } from 'next';
import { publishedTemplates } from './catalog';
import { money, site } from './site';

export function commercialMetadata(title: string, description: string, path: string, image = '/projects/beauty-she.webp'): Metadata {
 return { title, description, alternates: { canonical: path },
  openGraph: { title, description, url: path, type: 'website', locale: 'ru_RU', images: [{ url: image, width: 2880, height: 1920, alt: 'Пример интерфейса сайта из работ Сайтики' }] },
  twitter: { card: 'summary_large_image', title, description, images: [image] },
 };
}
export const landingPriceLabel = money(site.landingPrice);
export const catalogPriceSummary = () => {
 const prices = publishedTemplates.map(item => item.price).filter((price): price is number => price !== null);
 return prices.length ? `от ${money(Math.min(...prices))}` : 'Уточнить стоимость';
};
export const serviceOffers = [
 { title: 'Лендинг под ключ', href: '/services/landing-page', description: 'Одна услуга, продукт или предложение. Ведём посетителя от знакомства к обращению.', price: landingPriceLabel, points: ['Структура под одну задачу', 'Индивидуальное оформление', 'Адаптация для телефона'] },
 { title: 'Сайт-визитка', href: '/services/business-card', description: 'Место, где можно узнать о компании, разобраться в услугах и найти контакты.', price: 'Индивидуальный расчёт', points: ['Представление бизнеса', 'Согласованный состав страниц', 'Удобная навигация по разделам'] },
 { title: 'Готовый сайт', href: '/catalog', description: 'Выберите существующий дизайн. Заменим материалы, сохранив его структуру.', price: catalogPriceSummary(), points: ['Работающее демо до заказа', 'Тексты, фотографии и логотип', 'Цена на странице шаблона'] },
];
