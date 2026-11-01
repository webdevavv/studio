'use client';

import { useEffect, useRef, useState } from 'react';

const defaultPhrases = ['за 2 дня', 'под ключ', 'под вашу задачу'];

export function HeroTypewriter({ phrases = defaultPhrases, className = '' }: { phrases?: readonly string[]; className?: string }) {
 const [text, setText] = useState(phrases[0]);
 const element = useRef<HTMLSpanElement>(null);
 useEffect(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer: ReturnType<typeof setTimeout> | undefined;
  let index = 0, length = phrases[0].length;
  let deleting = true, visible = false;
  const cancel = () => { clearTimeout(timer); timer = undefined; };
  const tick = () => {
   timer = undefined;
   if (motion.matches || !visible || document.hidden) return;
   if (deleting) {
    length--;
    setText(phrases[index].slice(0, Math.max(0, length)));
    if (length <= 0) { index = (index + 1) % phrases.length; deleting = false; timer = setTimeout(tick, 300); }
    else timer = setTimeout(tick, 45);
   } else {
    length++;
    setText(phrases[index].slice(0, length));
    if (length >= phrases[index].length) { deleting = true; timer = setTimeout(tick, 2200); }
    else timer = setTimeout(tick, 90);
   }
  };
  const resume = () => {
   cancel();
   if (motion.matches) { index = 0; length = phrases[0].length; deleting = true; setText(phrases[0]); return; }
   if (visible && !document.hidden) timer = setTimeout(tick, 1800);
  };
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); });
  if (element.current) observer.observe(element.current);
  motion.addEventListener('change', resume);
  document.addEventListener('visibilitychange', resume);
  return () => { cancel(); observer.disconnect(); motion.removeEventListener('change', resume); document.removeEventListener('visibilitychange', resume); };
 }, [phrases]);
 return <span className={`hero-timing hero-typewriter ${className}`} ref={element}><span aria-hidden="true">{text}</span><span className="sr-only">{phrases[0]}</span></span>;
}
