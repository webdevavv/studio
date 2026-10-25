import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { BlogFooter } from '@/components/blog-footer';
import { Reveal } from '@/components/reveal';
import { BLOG_PAGE_SIZE, formatPostDate, getPosts } from '@/lib/blog';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const metadata: Metadata = { title: `Блог — ${site.name}`, description: 'Как выбрать дизайн, подготовить материалы и запустить сайт для своего дела.' };

type Query = Record<string, string | string[] | undefined>;
const text = (value: Query[string]) => typeof value === 'string' ? value.trim().slice(0, 100) : '';

export default async function BlogPage({ searchParams }: { searchParams: Promise<Query> }) {
 const params = await searchParams;
 const posts = await getPosts();
 const categories = [...new Set(posts.map(post => post.category))].sort((a, b) => a.localeCompare(b, 'ru'));
 const query = text(params.q);
 const category = categories.includes(text(params.category)) ? text(params.category) : '';
 const words = query.toLocaleLowerCase('ru').split(/\s+/).filter(Boolean);
 const filtered = posts.filter(post => (!category || post.category === category) && words.every(word => `${post.title} ${post.description} ${post.tags.join(' ')}`.toLocaleLowerCase('ru').includes(word)));
 const pages = Math.max(1, Math.ceil(filtered.length / BLOG_PAGE_SIZE));
 const requestedPage = /^\d+$/.test(text(params.page)) ? Number(text(params.page)) : 1;
 const page = Math.max(1, Math.min(pages, Number.isSafeInteger(requestedPage) ? requestedPage : 1));
 const visible = filtered.slice((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE);
 const pageLink = (number: number) => { const search = new URLSearchParams(); if (query) search.set('q', query); if (category) search.set('category', category); search.set('page', String(number)); return `/blog?${search}#articles`; };

 return <><a className="skip-link" href="#main">К содержимому</a><div className="shell" id="top"><Header home={false} section="blog"/>
  <main id="main" className="blog-page">
   <section className="blog-intro" aria-labelledby="blog-title"><h1 id="blog-title">О сайтах<br/>и вашем деле</h1><div><p>Разбираемся в дизайне, текстах и запуске. Чтобы заказывать сайт было проще, а результат — понятнее.</p><a className="text-link" href="#articles">Найти полезную статью ↓</a></div></section>
   <section id="articles" className="blog-collection" aria-labelledby="articles-title">
    <div className="blog-section-heading"><h2 id="articles-title">Полезно перед стартом</h2><p>От первого вопроса до готового сайта.</p></div>
    <form className="blog-filters" action="/blog#articles" method="get" role="search" aria-label="Поиск по блогу"><div><label htmlFor="blog-query">Что хотите узнать?</label><input id="blog-query" type="search" name="q" defaultValue={query} placeholder="Например, тексты или готовый макет" maxLength={100}/></div><div><label htmlFor="blog-category">Тема</label><select id="blog-category" name="category" defaultValue={category}><option value="">Все темы</option>{categories.map(item => <option key={item} value={item}>{item}</option>)}</select></div><button className="button" type="submit">Найти статью</button></form>
    <div className="blog-results"><p>Найдено статей: {filtered.length}</p>{(query || category) && <a className="text-link" href="/blog#articles">Сбросить фильтры</a>}</div>
    <div className="blog-list">{visible.map((post, index) => <article className={`blog-entry${index === 0 && page === 1 && !query && !category ? ' blog-entry-featured' : ''}`} key={post.slug}>
     <div className="blog-entry-main"><h3><a href={`/blog/${post.slug}`}>{post.title}</a></h3><p>{post.description}</p><a className="text-link" href={`/blog/${post.slug}`} aria-label={`Читать: ${post.title}`}>Читать статью ↗</a></div><div className="blog-entry-meta"><span>{post.category}</span><time dateTime={post.date}>{formatPostDate(post.date)}</time><span>{post.readingMinutes} мин. чтения</span></div>
    </article>)}</div>
    {!visible.length && <div className="blog-empty"><h3>{posts.length ? 'Статей пока не найдено' : 'Скоро здесь будут статьи'}</h3><p>{posts.length ? 'Попробуйте другую тему или более короткий запрос.' : 'Мы готовим материалы о дизайне, текстах и запуске сайта.'}</p>{posts.length > 0 && <a className="text-link" href="/blog#articles">Показать все статьи</a>}</div>}
    {pages > 1 && <nav className="blog-pagination" aria-label="Страницы блога">{page > 1 ? <a className="text-link" href={pageLink(page - 1)}>← Предыдущая</a> : <span/>}<span>Страница {page} из {pages}</span>{page < pages ? <a className="text-link" href={pageLink(page + 1)}>Следующая →</a> : <span/>}</nav>}
   </section>
   <aside className="blog-catalog-callout"><div><h2>От идеи к своему сайту</h2><p>Выберите готовый дизайн, а мы адаптируем его под ваше дело.</p></div><a className="button" href="/catalog">Посмотреть макеты</a></aside>
  </main><BlogFooter/><Reveal selector=".blog-intro h1,.blog-intro>div,.blog-section-heading,.blog-entry-main,.blog-entry-meta,.blog-catalog-callout"/>
 </div></>;
}
