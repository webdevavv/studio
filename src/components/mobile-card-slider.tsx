'use client';

import { Children, useRef, useState, type ReactNode } from 'react';

export function MobileCardSlider({ children, className, label }: { children: ReactNode; className: string; label: string }) {
 const track = useRef<HTMLDivElement>(null);
 const [active, setActive] = useState(0);
 const slides = Children.toArray(children);
 return <div className="mobile-card-slider" role="region" aria-label={label}>
  <div ref={track} className={`${className} mobile-slider-track`} onScroll={() => {
   const element = track.current;
   if (!element || !window.matchMedia('(max-width: 760px)').matches) return;
   const positions = Array.from(element.children).map(child => Math.abs(child.getBoundingClientRect().left - element.getBoundingClientRect().left));
   setActive(positions.indexOf(Math.min(...positions)));
  }}>{slides}</div>
  <div className="mobile-slider-pagination" aria-label="Выбор карточки">{slides.map((_, index) => <button key={index} type="button" aria-label={`Карточка ${index + 1} из ${slides.length}`} aria-current={index === active ? 'true' : undefined} onClick={() => {
   const element = track.current, slide = element?.children[index];
   if (!element || !slide) return;
   element.scrollTo({ left: element.scrollLeft + slide.getBoundingClientRect().left - element.getBoundingClientRect().left - (parseFloat(getComputedStyle(element).scrollPaddingLeft) || 0), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }}><span/></button>)}</div>
 </div>;
}
