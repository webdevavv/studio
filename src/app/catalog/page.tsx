import Form from 'next/form';
import { HeroTypewriter } from '@/components/hero-typewriter';
import { RequestSelect } from '@/components/request-select';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Reveal } from '@/components/reveal';
import { CatalogFooter } from '@/components/catalog-footer';
import { CatalogCard } from '@/components/catalog-card';
import { catalogCategories, catalogStyles, filterTemplates, standardSetup, extraServices } from '@/lib/catalog';
import { money, site } from '@/lib/site';

const title = 'Готовые сайты для бизнеса — каталог шаблонов';
const description = 'Выберите готовый дизайн сайта для бизнеса. Настроим тексты, изображения, логотип и контакты под вашу компанию. Посмотрите шаблоны на компьютере и телефоне.';
export const metadata: Metadata = { title, description, alternates: { canonical: '/catalog' }, openGraph: { title, description, url: '/catalog', type: 'website', locale: 'ru_RU', images: ['/projects/beauty-she.webp'] } };
type Query = Record<string, string | string[] | undefined>;
const value = (entry: Query[string]) => typeof entry === 'string' ? entry.trim().slice(0, 80) : '';
export default async function CatalogPage({ searchParams }: { searchParams: Promise<Query> }) {
 const params = await searchParams;
 const query = value(params.q);
 const category = catalogCategories.find(item => item.id === value(params.category))?.id || '';
 const style = catalogStyles.find(item => item.id === value(params.style))?.id || '';
 const templates = filterTemplates(query, category, style);
 return <><Link className="skip-link" href="#main">К содержимому</Link><div className="shell" id="top"><Header home={false}/><main id="main" className="catalog-page">
  <section className="catalog-intro" aria-labelledby="catalog-title"><div><h1 id="catalog-title">Готовые сайты <br/>для <span>вашего бизнеса</span><HeroTypewriter className="catalog-typewriter" phrases={['Готовые дизайны', 'Настройка под ваш бизнес', 'Понятная фиксированная стоимость']}/></h1><p>Выберите понравившийся дизайн, а мы адаптируем его под ваш бизнес: заменим тексты, фотографии и логотип. Без долгой разработки с нуля.</p></div><div className="catalog-price"><strong>от {money(site.catalogPrice)}</strong><p>Стандартная настройка в существующей структуре. Дополнительные работы согласуем отдельно.</p><div className="catalog-intro-actions"><Link href="#templates" className="button">Выбрать сайт</Link><Link href="/#contacts" className="button catalog-custom-button">Уникальный дизайн</Link></div></div></section>
  <section className="catalog-collection" id="templates" aria-labelledby="templates-title"><div className="catalog-section-heading"><h2 id="templates-title">Выберите <span className="catalog-accent">свой сайт</span></h2><p>Рассмотрите дизайн и откройте работающую демоверсию на странице шаблона.</p></div>
   <Form key={JSON.stringify(params)} className="catalog-filters" action="/catalog#templates" role="search" aria-label="Фильтры каталога"><div className="catalog-field catalog-search"><label htmlFor="catalog-query">Найти шаблон</label><input id="catalog-query" type="search" name="q" placeholder="Название или сфера бизнеса" defaultValue={query} maxLength={80}/></div><div className="catalog-field"><RequestSelect id="catalog-category" name="category" label="Сфера бизнеса" options={['Все сайты', ...catalogCategories.map(item => item.label)]} optionValues={['', ...catalogCategories.map(item => item.id)]} defaultValue={category} nativeFallback/></div><div className="catalog-field"><RequestSelect id="catalog-style" name="style" label="Характер дизайна" options={['Все стили', ...catalogStyles.map(item => item.label)]} optionValues={['', ...catalogStyles.map(item => item.id)]} defaultValue={style} nativeFallback/></div><button className="button" type="submit">Показать сайты</button></Form>
   <div className="catalog-results"><p role="status">Найдено сайтов: {templates.length}</p>{!!(query || category || style) && <Link className="text-link" href="/catalog#templates">Сбросить фильтры</Link>}</div><div className="catalog-list">{templates.map((template, i) => <CatalogCard key={template.id} template={template} priority={i === 0}/>)}{!templates.length && <div className="catalog-empty"><h3>Пока нет совпадений</h3><p>Смените категорию, стиль или поисковый запрос.</p><Link className="button" href="/catalog#templates">Все сайты</Link></div>}</div>
  </section>
  <section className="catalog-setup" id="setup" aria-labelledby="setup-title"><div><h2 id="setup-title">Настроим сайт <span className="setup-accent">под ваш бизнес</span></h2><p>Вы выбираете понравившийся дизайн, а мы заменяем <strong>тексты, фотографии и логотип</strong> на ваши. В результате вы получаете сайт с собственным оформлением и содержанием без необходимости разрабатывать его с нуля.</p><p><strong>Структура и состав страниц сохраняются.</strong> <strong>Стоимость и сроки фиксируем</strong> после согласования материалов и объёма работ.</p></div><div className="catalog-setup-columns"><div className="setup-included"><h3>Стандартная настройка</h3><ul>{standardSetup.map(text => <li key={text}>{text}</li>)}</ul></div><div className="setup-extra"><h3>Оплачивается отдельно</h3><ul>{extraServices.map(text => <li key={text}>{text}</li>)}</ul></div></div></section>
 </main><CatalogFooter/><Reveal selector=".catalog-intro h1,.catalog-intro>div>p,.catalog-price,.catalog-section-heading,.catalog-item,.catalog-setup h2"/></div></>;
}
