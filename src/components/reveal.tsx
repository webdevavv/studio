'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const defaultSelector = '.section-heading,.brief-intro,.brief-frame,.principles>h2,.principle-sheets article,.adaptation-copy,.adaptation-demo,.service,.project-heading,.project-picture,.process-intro,.steps li,.about-story,.about-perspective,.faq>h2,.faq-list details,.contact>h2,.contact-body,.footer-navigation>a';

export function Reveal({ selector = defaultSelector }: { selector?: string }) {
 const pathname = usePathname();
 useEffect(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;
  const seen = new WeakSet<Element>();
  const targets = new Set<HTMLElement>();
  const observer = new IntersectionObserver(entries => {
   for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('reveal-in');
    observer.unobserve(entry.target);
   }
  }, { threshold: .06, rootMargin: '0px 0px -24px 0px' });
  const register = () => {
   document.querySelectorAll<HTMLElement>(selector).forEach(el => {
    if (seen.has(el)) return;
    seen.add(el); targets.add(el);
    el.dataset.reveal = el.matches('.project-picture,.catalog-image,.adaptation-demo,.template-preview>img,.about-perspective') ? 'media' : 'content';
    const siblings = [...(el.parentElement?.children || [])].filter(item => item.matches(selector));
    el.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(el), 3) * 65}ms`);
    observer.observe(el);
   });
  };
  register();
  // Client-side filters and route updates can introduce new blocks.
  const mutations = new MutationObserver(register);
  mutations.observe(document.querySelector('main') || document.body, { childList: true, subtree: true });
  const stop = () => {
   observer.disconnect(); mutations.disconnect();
   for (const el of targets) { el.classList.remove('reveal-in'); delete el.dataset.reveal; el.style.removeProperty('--reveal-delay'); }
  };
  const changed = () => { if (motion.matches) stop(); };
  motion.addEventListener('change', changed);
  return () => { stop(); motion.removeEventListener('change', changed); };
 }, [selector, pathname]);
 return null;
}
