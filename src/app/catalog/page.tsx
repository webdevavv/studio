import Form from 'next/form';
import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Reveal } from '@/components/reveal';
import { CatalogFooter } from '@/components/catalog-footer';
import { catalogCategories, catalogStyles, filterTemplates } from '@/lib/catalog';
import { money, site } from '@/lib/site';

export const metadata: Metadata = {
 title: `Каталог готовых сайтов — ${site.name}`,
 description: `Выберите готовый дизайн сайта. Адаптация названия, текстов и контактов под ваш бизнес за ${money(site.catalogPrice)}.`,
};

type Query = Record<string, string | string[] | undefined>;
const value = (entry: Query[string]) => typeof entry === 'string' ? entry.trim().slice(0, 80) : '';

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Query> }) {
 const params = await searchParams;
 const query = value(params.q);
 const category = catalogCategories.find(item => item.id === value(params.category))?.id || '';
 const style = catalogStyles.find(item => item.id === value(params.style))?.id || '';
 const templates = filterTemplates(query, category, style);
 const filtered = !!(query || category || style);

 return <>
  <Link className="skip-link" href="#main">К содержимому</Link>
  <div className="shell" id="top">
   <Header home={false}/>
   <main id="main" className="catalog-page">
    <section className="catalog-intro" aria-labelledby="catalog-title">
     <div><h1 id="catalog-title">Готовый дизайн.<br/>Ваш бизнес.</h1><p>Выберите макет. Мы сохраним его дизайн и структуру, а название, тексты и контакты заменим на ваши.</p></div>
     <div className="catalog-price"><strong>{money(site.catalogPrice)}</strong><p>Фиксированная цена адаптации.<br/>Ваши тексты и контакты в выбранном дизайне.</p><Link href="#templates" className="text-link">Выбрать свой дизайн ↓</Link></div>
    </section>

    <section className="catalog-collection" id="templates" aria-labelledby="templates-title">
     <div className="catalog-section-heading"><h2 id="templates-title">Найдите свой характер</h2><p>Выберите дизайн для своего бизнеса.<br/>Тексты и контакты заменим на ваши.</p></div>
     <Form key={JSON.stringify(params)} className="catalog-filters" action="/catalog#templates" role="search" aria-label="Фильтры каталога">
      <div className="catalog-field catalog-search"><label htmlFor="catalog-query">Найти макет</label><input id="catalog-query" type="search" name="q" placeholder="Название или сфера бизнеса" defaultValue={query} maxLength={80}/></div>
      <div className="catalog-field"><label htmlFor="catalog-category">Сфера бизнеса</label><select id="catalog-category" name="category" defaultValue={category}><option value="">Все сферы</option>{catalogCategories.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <div className="catalog-field"><label htmlFor="catalog-style">Характер дизайна</label><select id="catalog-style" name="style" defaultValue={style}><option value="">Все стили</option>{catalogStyles.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
      <button className="button" type="submit">Показать макеты</button>
     </Form>
     <div className="catalog-results"><p>Найдено макетов: {templates.length}</p>{filtered && <Link className="text-link" href="/catalog#templates">Сбросить фильтры</Link>}</div>

     <div className="catalog-list">
      {templates.map((template, index) => <article key={template.id} className="catalog-item" aria-labelledby={`template-${template.id}`}>
       <Link className="catalog-image" href={`/catalog/${template.id}`} aria-label={`Посмотреть макет «${template.name}»`}><Image src={template.image} alt={`Макет «${template.name}» — ${template.category}`} width={1440} height={960} sizes="(max-width: 760px) 100vw, 65vw" priority={index === 0}/></Link>
       <div className="catalog-item-body">
        <h3 id={`template-${template.id}`}><Link href={`/catalog/${template.id}`}>{template.name}</Link></h3>
        <div className="catalog-item-type"><span>{template.category}</span><span>{catalogStyles.find(item => item.id === template.styleId)?.label}</span></div>
        <p>{template.description}</p>
        <Link href={`/catalog/${template.id}`} className="text-link">Рассмотреть макет</Link>
        <div className="catalog-item-order"><p><strong>{money(site.catalogPrice)}</strong><span>Адаптация включена</span></p><Link href={`/catalog/${template.id}#request`} className="button">Хочу такой сайт</Link></div>
       </div>
      </article>)}
      {!templates.length && <div className="catalog-empty"><h3>Пока нет совпадений</h3><p>Попробуйте другую сферу, смените стиль или уберите часть условий.</p><Link className="button" href="/catalog#templates">Посмотреть все макеты</Link></div>}
     </div>
    </section>

    <section className="catalog-process" aria-labelledby="catalog-process-title">
     <h2 id="catalog-process-title">От выбора до запуска</h2>
     <ol><li><h3>Вы выбираете</h3><p>Открываете макет и оставляете телефон и удобную соцсеть. Название выбранного дизайна уже будет в заявке.</p></li><li><h3>Мы согласовываем</h3><p>Менеджер связывается с вами, уточняет название, тексты и контакты. После согласования передаёт задачу в работу.</p></li><li><h3>Сайт становится вашим</h3><p>Адаптируем выбранный дизайн и передаём готовые материалы. Размещение на хостинге обсуждаем отдельно.</p></li></ol>
     <p className="catalog-timing">{site.timing}</p>
    </section>
   </main>
   <CatalogFooter/>
   <Reveal selector=".catalog-intro h1,.catalog-intro>div>p,.catalog-price,.catalog-section-heading,.catalog-image,.catalog-item-body,.catalog-process h2,.catalog-process li"/>
  </div>
 </>;
}
