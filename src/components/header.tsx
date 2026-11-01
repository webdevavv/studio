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
  if (!menuOpen) return;
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const background = Array.from(document.querySelectorAll<HTMLElement>('.shell > main,.shell > footer'));
  const previousInert = background.map(element => element.inert);
  background.forEach(element => { element.inert = true; });
  const media = window.matchMedia('(max-width: 1100px)');
  const resize = () => { if (!media.matches) setMenuOpen(false); };
  media.addEventListener('change', resize);
  const trap = (event: KeyboardEvent) => {
   if (event.key !== 'Tab') return;
   const items = Array.from(document.querySelectorAll<HTMLElement>('.header a,.header button')).filter(element => element.getClientRects().length > 0);
   const first = items[0], last = items[items.length - 1];
   if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
   else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  document.addEventListener('keydown', trap);
  return () => { document.body.style.overflow = previousOverflow; background.forEach((element, index) => { element.inert = previousInert[index]; }); media.removeEventListener('change', resize); document.removeEventListener('keydown', trap); };
 }, [menuOpen]);
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
 return <header className={`header${menuOpen ? ' menu-is-open' : ''}`}><Link href={home ? '#top' : '/'} className="logo" aria-label={`${site.name} — главная`}>{site.name}</Link>
  <button id="site-menu-toggle" className="site-menu-toggle" type="button" aria-controls="site-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span className="sr-only">{menuOpen ? 'Закрыть меню' : 'Меню'}</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path className="menu-line menu-line-top" d="M3 6h18"/><path className="menu-line menu-line-middle" d="M3 12h18"/><path className="menu-line menu-line-bottom" d="M3 18h18"/></svg></button>
  <nav id="site-navigation" className={`site-navigation${menuOpen ? ' is-open' : ''}`} aria-label="Основная навигация"><Link className="mobile-menu-catalog" href="/catalog" aria-current={pathname.startsWith('/catalog') ? 'page' : undefined} onClick={() => setMenuOpen(false)}>Каталог сайтов<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></Link>{[['/services', 'Услуги'], ['/prices', 'Цены'], ['/portfolio', 'Работы'], ['/blog', 'Блог']].map(([href, label]) => <Link href={href} key={href} aria-current={pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{label}</Link>)}</nav>
  <div className="header-actions"><Link href="/catalog" className="button header-catalog">Каталог</Link><Link href={requestLink} className="button header-order" onClick={() => setMenuOpen(false)}>Заказать сайт</Link></div></header>;
}
