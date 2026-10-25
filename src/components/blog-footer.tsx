import { site } from '@/lib/site';

export function BlogFooter() {
 return <footer className="blog-footer"><a className="logo" href="/">{site.name}</a><p>Понятно о сайтах для своего дела.</p><a className="text-link" href="/catalog">Выбрать готовый дизайн ↗</a></footer>;
}
