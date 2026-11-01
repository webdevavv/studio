import Form from 'next/form';
import { RequestSelect } from '@/components/request-select';
import '@/components/contact-form.css';
import Link from 'next/link';
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

 return <><Link className="skip-link" href="#main">К содержимому</Link><div className="shell" id="top"><Header home={false} section="blog"/>
  <main id="main" className="blog-page">
   <section className="blog-intro" aria-labelledby="blog-title"><h1 id="blog-title">О сайтах<br/>и <span className="blog-intro-accent">вашем деле</span></h1><div><p>Разбираемся в дизайне, текстах и запуске. Чтобы заказывать сайт было проще, а результат — понятнее.</p><Link className="text-link" href="#articles">Найти полезную статью</Link></div></section>
   <section id="articles" className="blog-collection" aria-labelledby="articles-title">
    <div className="blog-section-heading"><h2 id="articles-title">Все статьи</h2><p>Выберите тему или найдите ответ через поиск.</p></div>
    <Form key={JSON.stringify(params)} className="blog-filters" action="/blog#articles" role="search" aria-label="Поиск по блогу"><div><label htmlFor="blog-query">Что хотите узнать?</label><input id="blog-query" type="search" name="q" defaultValue={query} placeholder="Например, тексты или готовый макет" maxLength={100}/></div><RequestSelect id="blog-category" name="category" label="Тема" options={['Все темы', ...categories]} optionValues={['', ...categories]} defaultValue={category} nativeFallback /><button className="button" type="submit">Найти статью</button></Form>
    <div className="blog-results"><p role="status">Найдено статей: {filtered.length}{filtered.length > 0 && <> · Показаны {(page - 1) * BLOG_PAGE_SIZE + 1}–{Math.min(page * BLOG_PAGE_SIZE, filtered.length)}</>}</p>{(query || category) && <Link className="text-link" href="/blog#articles">Сбросить фильтры</Link>}</div>
    <div className="blog-list">{visible.map(post => <article className="blog-entry" key={post.slug}>
     <div className="blog-entry-main"><h3><Link className="blog-card-link" href={`/blog/${post.slug}`}>{post.title}</Link></h3><p>{post.description}</p><span className="blog-card-read" aria-hidden="true">Читать статью<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></span></div><div className="blog-entry-meta"><span>{post.category}</span><time dateTime={post.date}>{formatPostDate(post.date)}</time><span>{post.readingMinutes} мин. чтения</span></div>
    </article>)}</div>
    {!visible.length && <div className="blog-empty"><h3>{posts.length ? 'Статей пока не найдено' : 'Скоро здесь будут статьи'}</h3><p>{posts.length ? 'Попробуйте другую тему или более короткий запрос.' : 'Мы готовим материалы о дизайне, текстах и запуске сайта.'}</p>{posts.length > 0 && <Link className="text-link" href="/blog#articles">Показать все статьи</Link>}</div>}
    {pages > 1 && <nav className="blog-pagination" aria-label="Страницы блога">{page > 1 ? <Link className="text-link" href={pageLink(page - 1)}>Предыдущая</Link> : <span/>}<div className="blog-page-numbers">{Array.from(new Set([1, page - 1, page, page + 1, pages].filter(number => number >= 1 && number <= pages))).sort((a, b) => a - b).map((number, index, numbers) => <span key={number}>{index > 0 && number - numbers[index - 1] > 1 && <span className="blog-page-gap" aria-hidden="true">…</span>}<Link href={pageLink(number)} aria-current={number === page ? 'page' : undefined} aria-label={`Страница ${number}`}>{number}</Link></span>)}</div>{page < pages ? <Link className="text-link" href={pageLink(page + 1)}>Следующая</Link> : <span/>}</nav>}
   </section>
   <aside className="blog-catalog-callout"><div><h2>От идеи к своему сайту</h2><p>Выберите готовый дизайн, а мы адаптируем его под ваше дело.</p></div><Link className="button" href="/catalog">Посмотреть макеты</Link></aside>
  </main><BlogFooter/><Reveal selector=".blog-intro h1,.blog-intro>div,.blog-section-heading,.blog-entry,.blog-catalog-callout"/>
 </div></>;
}
