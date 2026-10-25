'use client';
import { useEffect, useState } from 'react';
import { site } from '@/lib/site';
const links = [['services', 'Услуги'], ['projects', 'Работы'], ['process', 'Процесс'], ['about', 'О студии']];
export function Header() {
 const [open, setOpen] = useState(false); const [active, setActive] = useState('');
 useEffect(() => { const observer = new IntersectionObserver(entries => { for (const e of entries) if (e.isIntersecting) setActive(e.target.id); }, { rootMargin: '-15% 0px -50% 0px' }); links.forEach(([id]) => { const el = document.getElementById(id); if(el) observer.observe(el); }); return () => observer.disconnect(); }, []);
 return <header className="header"><a href="#top" className="logo" aria-label={`${site.name} — главная`}>{site.name}</a><button className="menu-toggle" aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}>{open ? 'Закрыть ×' : 'Меню'}</button><nav id="navigation" aria-label="Основная навигация" className={open ? 'nav open' : 'nav'} onKeyDown={e => { if(e.key === 'Escape') {setOpen(false); document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();} }} >{links.map(([id,label]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setOpen(false)}>{label}</a>)}<a href="#contacts" className="header-cta" onClick={() => setOpen(false)}>Обсудить проект</a></nav></header>;
}
