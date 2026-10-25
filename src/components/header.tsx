'use client';
import { useEffect, useState } from 'react';
import { site } from '@/lib/site';
const links = [['services', 'Услуги'], ['projects', 'Работы'], ['process', 'Процесс'], ['about', 'О студии']];
export function Header({ home = true, section = 'catalog', requestHref }: { home?: boolean; section?: 'catalog' | 'blog'; requestHref?: string }) {
 const [open, setOpen] = useState(false); const [active, setActive] = useState('');
 const requestLink = requestHref || `${home ? '' : '/'}#contacts`;
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
 useEffect(() => { if (!home) return; const observer = new IntersectionObserver(entries => { for (const e of entries) if (e.isIntersecting) setActive(e.target.id); }, { rootMargin: '-15% 0px -50% 0px' }); links.forEach(([id]) => { const el = document.getElementById(id); if(el) observer.observe(el); }); return () => observer.disconnect(); }, [home]);
 return <header className="header"><a href={home ? '#top' : '/'} className="logo" aria-label={`${site.name} — главная`}>{site.name}</a><a className="mobile-header-cta" href={requestLink} aria-label="Оставить заявку" onClick={() => setOpen(false)}>Заявка</a><button className="menu-toggle" aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}>{open ? 'Закрыть ×' : 'Меню'}</button><nav id="navigation" aria-label="Основная навигация" className={open ? 'nav open' : 'nav'} onKeyDown={e => { if(e.key === 'Escape') {setOpen(false); document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();} }} ><a href="/catalog" aria-current={!home && section === 'catalog' ? 'page' : undefined} onClick={() => setOpen(false)}>Каталог</a><a href="/blog" aria-current={!home && section === 'blog' ? 'page' : undefined} onClick={() => setOpen(false)}>Блог</a>{links.map(([id,label]) => <a key={id} href={`${home ? '' : '/'}#${id}`} aria-current={home && active === id ? 'location' : undefined} onClick={() => setOpen(false)}>{label}</a>)}<a href={requestLink} className="header-cta" onClick={() => setOpen(false)}>Обсудить проект</a></nav></header>;
}
