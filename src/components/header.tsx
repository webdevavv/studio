'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { site } from '@/lib/site';
export function Header({ home = true, requestHref }: { home?: boolean; section?: 'catalog' | 'blog'; requestHref?: string }) {
 const requestLink = requestHref || `${home ? '' : '/'}#brief`;
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
 return <header className="header"><Link href={home ? '#top' : '/'} className="logo" aria-label={`${site.name} — главная`}>{site.name}</Link><Link href={requestLink} className="button header-order">Заказать сайт</Link></header>;
}
