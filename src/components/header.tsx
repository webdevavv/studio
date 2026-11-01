'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { site } from '@/lib/site';
import './site-navigation.css';
export function Header({ home = true, requestHref }: { home?: boolean; section?: 'catalog' | 'blog'; requestHref?: string }) {
 const [menuOpen, setMenuOpen] = useState(false);
 const pathname = usePathname();
 const requestLink = requestHref || `${home ? '' : '/'}#contacts`;
 useEffect(() => {
  const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); document.getElementById('site-menu-toggle')?.focus(); } };
  document.addEventListener('keydown', close);
  return () => document.removeEventListener('keydown', close);
 }, [menuOpen]);
 useEffect(() => {
  let compact = false;
  const update = () => {
   const next = compact ? window.scrollY > 24 : window.scrollY > 96;
   if (next === compact) return;
   compact = next;
   document.documentElement.toggleAttribute('data-header-compact', compact);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  return () => {
   window.removeEventListener('scroll', update);
   document.documentElement.removeAttribute('data-header-compact');
  };
 }, []);
 return <header className="header"><Link href={home ? '#top' : '/'} className="logo" aria-label={`${site.name} — главная`}>{site.name}</Link>
  <button id="site-menu-toggle" className="site-menu-toggle" type="button" aria-controls="site-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span className="sr-only">Меню</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>
  <nav id="site-navigation" className={`site-navigation${menuOpen ? ' is-open' : ''}`} aria-label="Основная навигация">{[['/services', 'Услуги'], ['/prices', 'Цены'], ['/portfolio', 'Работы'], ['/blog', 'Блог']].map(([href, label]) => <Link href={href} key={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{label}</Link>)}</nav>
  <div className="header-actions"><Link href="/catalog" className="button header-catalog">Каталог</Link><Link href={requestLink} className="button header-order" onClick={() => setMenuOpen(false)}>Заказать сайт</Link></div></header>;
}
