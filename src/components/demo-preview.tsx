'use client';

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import './demo-preview.css';

// Screen rectangles from pixelsign/html5-device-mockups. The outer frame keeps
// the original image ratio; the iframe always keeps the selected CSS viewport.
const devices = [
 { id: 'monitor', label: 'Монитор', width: 1440, height: 810, image: '/devices/imac.png', imageWidth: 1843, imageHeight: 1483, screen: { left: .040694519805, top: .050573162508, width: .918610960391 } },
 { id: 'laptop', label: 'Ноутбук', width: 1280, height: 800, image: '/devices/macbook-pro.png', imageWidth: 1208, imageHeight: 700, screen: { left: .118377483444, top: .067142857143, width: .764072847682 } },
 { id: 'phone', label: 'Смартфон', width: 390, height: 846, image: '/devices/iphone-x.png', imageWidth: 726, imageHeight: 1444, screen: { left: .07162534435, top: .03254847645, width: .8567493113 } },
] as const;

type Props = { demoUrl: string; title: string; embedAllowed?: boolean };
export function DemoPreview({ demoUrl, title, embedAllowed = true }: Props) {
 const id = useId();
 const [selected, setSelected] = useState(0);
 const [expanded, setExpanded] = useState(false);
 const [status, setStatus] = useState<'loading' | 'loaded' | 'timeout' | 'error'>('loading');
 const [help, setHelp] = useState(false);
 const [available, setAvailable] = useState({ width: 0, height: 0 });
 const [reload, setReload] = useState(0);
 const frame = useRef<HTMLIFrameElement>(null);
 const stage = useRef<HTMLDivElement>(null);
 const panel = useRef<HTMLDivElement>(null);
 const expandButton = useRef<HTMLButtonElement>(null);
 const tabs = useRef<(HTMLButtonElement | null)[]>([]);
 const device = devices[selected];
 useEffect(() => {
  if (!stage.current) return;
  const observer = new ResizeObserver(([entry]) => setAvailable({ width: entry.contentRect.width, height: entry.contentRect.height }));
  observer.observe(stage.current);
  return () => observer.disconnect();
 }, [embedAllowed]);
 useEffect(() => {
  if (!embedAllowed || status !== 'loading') return;
  const timeout = window.setTimeout(() => setStatus('timeout'), 15000);
  return () => window.clearTimeout(timeout);
 }, [embedAllowed, status, reload]);
 useEffect(() => {
  if (!expanded) return;
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  // Make siblings inert all the way to body without moving or remounting the iframe.
  const siblings: { element: HTMLElement; inert: boolean }[] = [];
  let ancestor: HTMLElement | null = panel.current;
  while (ancestor?.parentElement) {
   for (const sibling of ancestor.parentElement.children) {
    if (sibling !== ancestor && sibling instanceof HTMLElement) { siblings.push({ element: sibling, inert: sibling.inert }); sibling.inert = true; }
   }
   ancestor = ancestor.parentElement;
   if (ancestor === document.body) break;
  }
  panel.current?.querySelector<HTMLButtonElement>('[data-close-preview]')?.focus();
  const onKey = (event: globalThis.KeyboardEvent) => {
   if (event.key === 'Escape') { event.preventDefault(); setExpanded(false); }
   if (event.key !== 'Tab' || !panel.current) return;
   const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],iframe[tabindex="0"]'));
   const first = focusable[0]; const last = focusable.at(-1);
   if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
   if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  document.addEventListener('keydown', onKey);
  return () => {
   document.body.style.overflow = previousOverflow;
   siblings.forEach(({ element, inert }) => { element.inert = inert; });
   document.removeEventListener('keydown', onKey);
   expandButton.current?.focus();
  };
 }, [expanded]);
 function select(index: number) { setSelected(index); }
 function tabKey(event: KeyboardEvent<HTMLButtonElement>) {
  let next = selected;
  if (event.key === 'ArrowRight') next = (selected + 1) % devices.length;
  else if (event.key === 'ArrowLeft') next = (selected + devices.length - 1) % devices.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = devices.length - 1;
  else return;
  event.preventDefault(); select(next); tabs.current[next]?.focus();
 }
 const outerWidth = device.width / device.screen.width;
 const outerHeight = outerWidth * device.imageHeight / device.imageWidth;
 // Fit BOTH axes, including in the normal inline view, so no device exceeds the stage.
 const scale = available.width && available.height ? Math.min(1, available.width / outerWidth, available.height / outerHeight) : 0;
 const style = {
  '--demo-width': `${device.width}px`, '--demo-height': `${device.height}px`, '--demo-scale': scale,
  '--demo-outer-width': `${outerWidth}px`, '--demo-outer-height': `${outerHeight}px`,
  '--demo-screen-left': `${outerWidth * device.screen.left}px`, '--demo-screen-top': `${outerHeight * device.screen.top}px`,
 } as CSSProperties;
 return <section className="demo-preview" aria-label={`Демо макета «${title}»`}>
  <div className={`demo-panel${expanded ? ' is-expanded' : ''}`} ref={panel} role={expanded ? 'dialog' : undefined} aria-modal={expanded ? true : undefined} aria-label={expanded ? `Просмотр демо «${title}»` : undefined} style={style} data-ui="live-device-preview">
   <div className="demo-toolbar">
    <div className="demo-tabs" role="tablist" aria-label="Устройство для просмотра">{devices.map((item, index) => <button type="button" key={item.id} ref={element => { tabs.current[index] = element; }} id={`${id}-${item.id}`} role="tab" aria-selected={selected === index} aria-controls={`${id}-screen`} tabIndex={selected === index ? 0 : -1} onKeyDown={tabKey} onClick={() => select(index)}><DeviceIcon kind={item.id}/>{item.label}</button>)}</div>
    <div className="demo-actions">
     {embedAllowed && <button type="button" aria-label="Перезагрузить предпросмотр" title="Перезагрузить" onClick={() => { setStatus('loading'); setReload(value => value + 1); if (frame.current) frame.current.src = demoUrl; }}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7"/></svg></button>}
     <button ref={expandButton} type="button" data-close-preview={expanded ? '' : undefined} onClick={() => setExpanded(value => !value)}>{expanded ? 'Закрыть просмотр' : 'Развернуть'}<svg viewBox="0 0 24 24" aria-hidden="true"><path d={expanded ? 'M9 3v6H3m18 0h-6V3M3 15h6v6m6 0v-6h6' : 'M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5'}/></svg></button>
    </div>
   </div>
   {embedAllowed ? <>
    <div className="demo-stage" ref={stage}>
     <div className="demo-footprint" style={{ width: outerWidth * scale, height: outerHeight * scale }}>
      <div className={`demo-device demo-device-${device.id}`}>
       {/* Original transparent device artwork stays behind the live screen. */}
       {/* eslint-disable-next-line @next/next/no-img-element */}
       <img className="demo-device-image" src={device.image} alt="" width={device.imageWidth} height={device.imageHeight} draggable={false}/>
       <div id={`${id}-screen`} role="tabpanel" aria-labelledby={`${id}-${device.id}`} className="demo-screen">
        <iframe ref={frame} src={demoUrl} title={`Сайт «${title}» — интерактивное демо`} width={device.width} height={device.height} sandbox="allow-scripts allow-same-origin" allow="camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'; fullscreen 'none'" referrerPolicy="no-referrer" tabIndex={0} onLoad={() => setStatus('loaded')} onError={() => setStatus('error')}/>
       </div>
      </div>
     </div>
    </div>
    <div className="demo-caption"><p className="demo-status" role="status">{status === 'loading' ? 'Загружаем демо…' : status === 'timeout' ? 'Демо загружается дольше обычного. Откройте его отдельно.' : status === 'error' ? 'Не удалось загрузить демо. Откройте сайт отдельно.' : 'Листайте сайт прямо внутри устройства'}</p></div>
   </> : <p id={`${id}-screen`} role="tabpanel" aria-labelledby={`${id}-${device.id}`} className="demo-unavailable">Сайт не разрешает встроенный просмотр. Откройте демо в отдельной вкладке.</p>}
   <div className="demo-fallback"><a href={demoUrl} target="_blank" rel="noopener noreferrer">Открыть сайт в новой вкладке ↗</a><button type="button" aria-expanded={help} aria-controls={`${id}-help`} onClick={() => setHelp(value => !value)}>Не видно сайт?</button></div>
   {help && <p id={`${id}-help`} className="demo-help">Браузер или сайт могут ограничивать встроенный просмотр. Из-за ограничений доступа мы не можем проверить содержимое чужого сайта из этого окна. Попробуйте перезагрузить демо или открыть его отдельно.</p>}
   <p className="demo-preview-notice">Демонстрация дизайна. Не вводите личные данные и не оформляйте запись.</p>
  </div>
  <noscript><p>Для интерактивного просмотра нужен JavaScript. <a href={demoUrl} target="_blank" rel="noopener noreferrer">Открыть демо отдельно</a>.</p></noscript>
 </section>;
}
function DeviceIcon({ kind }: { kind: 'monitor' | 'laptop' | 'phone' }) {
 return <svg viewBox="0 0 24 24" aria-hidden="true">{kind === 'monitor' ? <><rect x="3" y="3" width="18" height="13" rx="2"/><path d="M12 16v5m-4 0h8"/></> : kind === 'laptop' ? <><rect x="4" y="4" width="16" height="12" rx="2"/><path d="m4 16-2 4h20l-2-4M9 20h6"/></> : <><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-4 14h4"/></>}</svg>;
}
