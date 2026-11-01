import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { BlogFooter } from '@/components/blog-footer';
import { formatPostDate, getPost, getPosts } from '@/lib/blog';
import { site } from '@/lib/site';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const post = await getPost((await params).slug);
 if (!post) return { title: 'Статья не найдена' };
 return { title: `${post.title} — ${site.name}`, description: post.description,
  ...(site.url ? { alternates: { canonical: `${site.url.replace(/\/$/, '')}/blog/${post.slug}` } } : {}),
  openGraph: { title: post.title, description: post.description, type: 'article', publishedTime: `${post.date}T00:00:00Z`, tags: post.tags },
 };
}

export default async function ArticlePage({ params }: Props) {
 const post = await getPost((await params).slug);
 if (!post) notFound();
 const others = (await getPosts()).filter(item => item.slug !== post.slug).slice(0, 2);
 const relevantService = post.slug === 'gotovyy-maket-ili-svoy-dizayn' ? { href: '/services', label: 'Выбрать формат сайта' } : post.slug === 'chto-podgotovit-dlya-sayta' ? { href: '/services/business-card', label: 'Обсудить сайт компании' } : { href: '/services/landing-page', label: 'Разработка лендинга' };
 return <><Link className="skip-link" href="#main">К содержимому</Link><div className="shell" id="top"><Header home={false} section="blog"/>
  <main id="main" className="article-page">
   <nav className="blog-back" aria-label="Навигация по блогу"><Link className="text-link" href="/blog#articles">Все статьи</Link></nav>
   <article>
    <header className="article-heading"><h1>{post.title}</h1><p className="article-description">{post.description}</p><div className="article-meta"><span>{post.category}</span><time dateTime={post.date}>{formatPostDate(post.date)}</time><span>{post.readingMinutes} мин. чтения</span></div></header>
    <div className="article-layout">
     {post.toc.length > 0 && <aside className="article-sidebar"><nav aria-label="Содержание статьи"><details open><summary>В этой статье <span aria-hidden="true">↕</span></summary><ol>{post.toc.map(item => <li key={item.id} className={item.level === 3 ? 'toc-subheading' : undefined}><Link href={`#${item.id}`}>{item.text}</Link></li>)}</ol></details></nav><Link className="text-link" href="/catalog">Выбрать дизайн сайта</Link></aside>}
     <div className="article-body" dangerouslySetInnerHTML={{ __html: post.html }}/>
    </div>
   </article>
   <aside className="blog-service-link"><Link className="text-link" href={relevantService.href}>{relevantService.label}</Link></aside>
   {others.length > 0 && <section className="blog-related" aria-labelledby="related-title"><h2 id="related-title">Ещё по делу</h2><div>{others.map(item => <article key={item.slug}><h3><Link href={`/blog/${item.slug}`}>{item.title}</Link></h3><p>{item.description}</p><Link href={`/blog/${item.slug}`} className="text-link" aria-label={`Читать: ${item.title}`}>Читать статью</Link></article>)}</div></section>}
  </main><BlogFooter/>
 </div></>;
}
