'use client';
import Image from 'next/image';
import { useState } from 'react';
import { concepts } from '@/lib/site';
export function Preview() {
 const [selected, setSelected] = useState(0); const project = concepts[selected];
 return <div className="preview-workshop"><div className="preview-toolbar"><span>Сайт под характер вашего дела</span><span>Демонстрация</span></div><div className="preview-tabs" role="tablist" aria-label="Сфера демонстрационного сайта">{concepts.map((item,i) => <button key={item.id} role="tab" id={`tab-${item.id}`} aria-controls="site-preview" aria-selected={selected === i} tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={e => {let next = i; if(e.key === 'ArrowRight') next = (i+1)%concepts.length; else if(e.key === 'ArrowLeft') next=(i+concepts.length-1)%concepts.length; else if(e.key === 'Home') next=0; else if(e.key === 'End') next=concepts.length-1; else return; e.preventDefault(); setSelected(next); document.getElementById(`tab-${concepts[next].id}`)?.focus(); }}>{item.label}</button>)}</div><div className="preview-window" role="tabpanel" id="site-preview" aria-labelledby={`tab-${project.id}`} tabIndex={0}><Image key={project.id} className="preview-image" src={`/projects/${project.id}.png`} alt={`${project.category} «${project.name}». ${project.heading}`} width={1440} height={960} priority sizes="(max-width: 760px) 100vw, 70vw"/><span className="sr-only">{project.heading}</span></div><p className="preview-caption">Демонстрационный концепт «{project.name}». {project.note}</p></div>;
}
