'use client';

import { useEffect, useRef, useState } from 'react';

export function RequestSelect({ id, name, label, options }: { id: string; name: string; label: string; options: readonly string[] }) {
 const [value, setValue] = useState(options[0]);
 const [open, setOpen] = useState(false);
 const [active, setActive] = useState(0);
 const root = useRef<HTMLDivElement>(null);
 const button = useRef<HTMLButtonElement>(null);
 useEffect(() => {
  const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
  document.addEventListener('pointerdown', close);
  return () => document.removeEventListener('pointerdown', close);
 }, []);
 const choose = (index: number) => { setValue(options[index]); setActive(index); setOpen(false); button.current?.focus(); };
 return <div className="form-field request-select" ref={root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
  <label id={`${id}-label`} htmlFor={id}>{label}</label>
  <input type="hidden" name={name} value={value}/>
  <button ref={button} id={id} className="request-select-trigger" type="button" role="combobox" aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `${id}-list` : undefined} aria-activedescendant={open ? `${id}-option-${active}` : undefined} onClick={() => { setActive(options.indexOf(value)); setOpen(!open); }} onKeyDown={event => {
   if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
    event.preventDefault(); setOpen(true);
    setActive(previous => event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : !open ? options.indexOf(value) : (previous + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
   } else if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
   else if ((event.key === 'Enter' || event.key === ' ') && open) { event.preventDefault(); choose(active); }
   else if (event.key === 'Tab') setOpen(false);
  }}><span id={`${id}-value`}>{value}</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></button>
  {open && <ul id={`${id}-list`} className="request-select-list" role="listbox" aria-labelledby={`${id}-label`}>{options.map((option,index) => <li id={`${id}-option-${index}`} key={option} role="option" aria-selected={value === option} className={active === index ? 'active' : undefined} onPointerMove={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}><span>{option}</span>{value === option && <svg className="request-select-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg>}</li>)}</ul>}
 </div>;
}
