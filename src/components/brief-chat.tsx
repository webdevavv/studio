'use client';

import { useEffect, useRef, useState } from 'react';
import { answerError, cleanAnswers, getFields, getSteps, stepLabels, summary, suggest, value, type Answers } from '@/lib/brief';

export function BriefChat({ enabled = false, policyUrl = '' }: { enabled?: boolean; policyUrl?: string }) {
 const [answers, setAnswers] = useState<Answers>({});
 const [current, setCurrent] = useState('route');
 const [started, setStarted] = useState(false);
 const [ready, setReady] = useState(false);
 const [consent, setConsent] = useState(false);
 const [error, setError] = useState('');
 const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'uncertain'>('idle');
 const [notice, setNotice] = useState('');
 const [receipt, setReceipt] = useState('');

 const [editing, setEditing] = useState<{ returnTo: string; original: Answers } | null>(null);
 const heading = useRef<HTMLHeadingElement>(null);
 const panel = useRef<HTMLDivElement>(null);
 const project = useRef<HTMLDetailsElement>(null);
 const requestId = useRef('');
 const locked = useRef(false);
 const steps = getSteps(answers);
 const index = steps.findIndex(s => s.id === current);
 const step = steps[index];
 const review = current === 'review';
 const progress = review ? 100 : Math.round(Math.max(0, index) / steps.length * 100);
 const cleaned = cleanAnswers(answers);
 const advice = suggest(cleaned);
 const answeredSteps = steps.filter(s => getFields(s, cleaned).some(f => Array.isArray(cleaned[f.id]) ? cleaned[f.id].length > 0 : !!cleaned[f.id]));

 useEffect(() => setReady(true), []);
 useEffect(() => {
  if (!started) return;
  heading.current?.focus({ preventScroll: true });
  const rect = heading.current?.getBoundingClientRect();
  if (rect && (rect.top < 100 || rect.top > window.innerHeight - 180)) heading.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
 }, [current, started, editing]);

 function change(id: string, next: string | string[]) {
  setAnswers(old => ({ ...old, [id]: next })); setError(''); setNotice(''); requestId.current = ''; setConsent(false);
 }
 function go(id: string) { setCurrent(id); setStarted(true); setError(''); setNotice(''); }
 function edit(id: string) { setEditing({ returnTo: current, original: answers }); if (project.current) project.current.open = false; go(id); }
 function next(skip = false) {
  if (!step) return;
  if (!skip) {
   for (const field of getFields(step, answers)) { const problem = answerError(field.id, answers); if (problem) { setError(problem); document.getElementById(`brief-${field.id}`)?.focus(); return; } }
  }
  const nextAnswers = skip ? Object.fromEntries(Object.entries(answers).filter(([key]) => !step.fields.some(f => f.id === key))) : answers;
  if (skip) { setAnswers(nextAnswers); requestId.current = ''; }
  const nextSteps = getSteps(nextAnswers); const position = nextSteps.findIndex(s => s.id === current);

  if (editing) { const target = editing.returnTo; setEditing(null); go(nextSteps.some(s => s.id === target) ? target : 'review'); }
  else go(nextSteps[position + 1]?.id || 'review');
 }
 function download() {
  const blob = new Blob([summary(cleaned)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'brief-sayta.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  setNotice('Бриф сохранён в файл. Менеджеру он не отправлен.');
 }
 async function send() {
  if (locked.current || status === 'uncertain' || status === 'sent') return;
  const phoneProblem = answerError('phone', cleaned);
  if (!value(cleaned, 'phone') || phoneProblem) { setError(phoneProblem || 'Укажите телефон для связи или скачайте бриф без отправки.'); return; }
  if (!consent) { setError('Для отправки подтвердите согласие на обработку персональных данных.'); return; }
  locked.current = true; setStatus('sending'); setError('');
  requestId.current ||= crypto.randomUUID();
  try {
   const response = await fetch('/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers: cleaned, consent, id: requestId.current }), signal: AbortSignal.timeout(25000) });
   const data = await response.json();
   if (!response.ok) { setStatus(data.uncertain ? 'uncertain' : 'idle'); setError(data.message || 'Не удалось отправить. Сохраните бриф, чтобы не потерять ответы.'); return; }
   setReceipt(data.id); setStatus('sent');
  } catch { setStatus('uncertain'); setError('Не удалось подтвердить получение заявки. Чтобы не создать повтор, сохраните бриф и уточните получение у студии.'); }
  finally { locked.current = false; }
 }

 return <section id="brief" className="section brief-section" aria-labelledby="brief-title">
  <div className="brief-intro"><h2 id="brief-title">Давайте соберём<br/>ваш сайт</h2><p>Несколько ответов — и вместо чистого листа у вас понятный бриф. Выбирайте варианты, пишите своими словами или пропускайте.</p><a className="text-link" href="#contacts">Нужен только звонок? Оставить телефон ↗</a></div>
  <div className="brief-frame" data-ui="brief" ref={panel}>
   <div className="brief-top"><strong>Бриф в диалоге</strong><span>{review ? 'Проверка ответов' : `Шаг ${index + 1} из ${steps.length}`}</span></div>
   <progress className="brief-progress" value={progress} max={100} aria-label="Прогресс брифа"/>
   <div className="brief-layout">
    <aside className="brief-history" aria-label="Ваши ответы"><details className="brief-project" ref={project}><summary><span>Ваш проект<small>{answeredSteps.length ? `Заполнено разделов: ${answeredSteps.length}` : 'Пока нет ответов'}</small></span><span className="brief-project-toggle" aria-hidden="true">+</span></summary><div className="brief-project-content">{answeredSteps.length === 0 ? <p className="brief-muted">Выбранные ответы появятся здесь. Их можно будет изменить.</p> : <ul>{answeredSteps.map(s => <li key={s.id}><div className="brief-project-row"><strong>{stepLabels[s.id]}</strong><button type="button" aria-label={`Изменить: ${stepLabels[s.id]}`} disabled={status !== 'idle' || !!editing} onClick={() => edit(s.id)}>Изменить</button></div><dl>{getFields(s, cleaned).filter(f => Array.isArray(cleaned[f.id]) ? cleaned[f.id].length > 0 : !!cleaned[f.id]).map(f => <div key={f.id}><dt>{f.label}</dt><dd>{Array.isArray(cleaned[f.id]) ? (cleaned[f.id] as string[]).join(', ') : cleaned[f.id]}</dd></div>)}</dl></li>)}</ul>}<p className="brief-muted">Перед закрытием вкладки скачайте бриф, чтобы сохранить ответы.</p></div></details></aside>
    <div className="brief-sheet">
     {status === 'sent' ? <div className="brief-result" role="status"><h3 ref={heading} tabIndex={-1}>Бриф у нас</h3><p>Заявка создана. Менеджер свяжется с вами выбранным способом.</p><p>Номер заявки: {receipt}</p><button className="button" onClick={download}>Сохранить копию</button></div> : review ? <div className="brief-review">
      <h3 ref={heading} tabIndex={-1}>Вот что получилось</h3><p>Проверьте ответы. Это предварительное описание, а не окончательная оценка.</p>
      <div className="brief-advice"><strong>{advice.format}</strong><p>{advice.reason}</p><p>{advice.assessment}</p>{advice.missing.length > 0 && <p>Ещё уточним: {advice.missing.join(', ')}.</p>}</div>
      <details><summary>Все ответы и описание проекта</summary><pre className="brief-summary">{summary(cleaned)}</pre></details>
      <div className="brief-actions"><button type="button" className="brief-secondary" disabled={status !== 'idle'} onClick={() => edit('contact')}>Изменить контакты</button><button type="button" className="brief-secondary" onClick={download}>Скачать бриф</button></div>
      {enabled ? <><label className="brief-consent"><input type="checkbox" checked={consent} disabled={status !== 'idle'} onChange={e => setConsent(e.target.checked)}/><span>Я даю согласие на обработку указанных персональных данных для рассмотрения заявки и связи со мной. <a href={policyUrl} target="_blank" rel="noopener noreferrer">Политика обработки персональных данных</a></span></label><button type="button" className="button" disabled={status !== 'idle'} onClick={send}>{status === 'sending' ? 'Передаём бриф…' : status === 'uncertain' ? 'Получение требует проверки' : 'Передать мой проект'}</button></> : <p className="brief-muted">Бриф готов к сохранению. Приём заявок пока не подключён — ответы не отправлены.</p>}
     </div> : <form key={current} className="brief-question" noValidate onSubmit={e => { e.preventDefault(); next(); }} onKeyDown={e => {
      if (e.nativeEvent.isComposing) return;
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); next(); }
      else if (e.key === 'Enter' && e.target instanceof HTMLInputElement && !['radio', 'checkbox'].includes(e.target.type)) { e.preventDefault(); next(); }
     }}>
      <div className="brief-speaker">Помощник студии</div><h3 ref={heading} tabIndex={-1}>{step.title}</h3><p className="brief-question-hint">{step.hint}</p>
      {step.id === 'template' && <a href="/catalog" target="_blank" rel="noopener noreferrer" className="text-link">Посмотреть макеты в новой вкладке ↗</a>}
      <fieldset className="brief-fields" disabled={!ready || status !== 'idle'}><legend className="sr-only">{step.title}</legend>
       {getFields(step, answers).map(field => <div className="brief-field" key={field.id}>
        {field.options ? <fieldset><legend>{field.label}</legend><div className="brief-choices">{field.options.map(option => {
         const checked = field.type === 'multi' ? Array.isArray(answers[field.id]) && answers[field.id].includes(option) : value(answers, field.id) === option;
         return <label key={option} className={checked ? 'brief-choice selected' : 'brief-choice'}><input type={field.type === 'multi' ? 'checkbox' : 'radio'} name={`brief-${field.id}`} value={option} checked={checked} onChange={() => {
          if (field.type === 'multi') { const old = Array.isArray(answers[field.id]) ? answers[field.id] as string[] : []; change(field.id, checked ? old.filter(v => v !== option) : [...old, option]); } else change(field.id, option);
         }}/><span>{option}</span></label>;
        })}</div></fieldset> : <><label htmlFor={`brief-${field.id}`}>{field.label}</label>{field.type === 'textarea' ? <textarea id={`brief-${field.id}`} rows={3} maxLength={1500} placeholder={field.placeholder} value={value(answers, field.id)} onChange={e => change(field.id, e.target.value)}/> : <input id={`brief-${field.id}`} type={field.type === 'date' ? 'date' : field.type === 'tel' ? 'tel' : 'text'} inputMode={field.type === 'tel' ? 'tel' : undefined} autoComplete={field.id === 'phone' ? 'tel' : field.id === 'name' ? 'given-name' : 'off'} maxLength={300} placeholder={field.placeholder} value={value(answers, field.id)} onChange={e => change(field.id, e.target.value)}/>}</>}
        {field.hint && <p className="brief-muted">{field.hint}</p>}
       </div>)}
      </fieldset>
      <div className="brief-actions"><button type="submit" className="button" disabled={!ready}>{editing ? 'Сохранить изменения' : step.id === 'contact' ? 'Посмотреть мой бриф' : 'Продолжить →'}</button><button type="button" className="brief-secondary" disabled={!ready} onClick={() => next(true)}>{editing ? 'Очистить ответы' : 'Пропустить шаг'}</button></div>
      {editing ? <div className="brief-navigation"><button type="button" onClick={() => { const saved = editing; setAnswers(saved.original); setEditing(null); go(saved.returnTo); }}>Отменить изменения</button></div> : <div className="brief-navigation">{index > 0 && <button type="button" onClick={() => go(steps[index - 1].id)}>← Назад</button>}{step.id !== 'contact' && <button type="button" onClick={() => go('contact')}>Сразу к контактам</button>}<button type="button" onClick={() => go('review')}>Сохранить и закончить</button></div>}
      <p className="brief-keyboard">Tab — переход · стрелки — выбор · Ctrl / ⌘ + Enter — дальше. Enter в тексте — новая строка.</p>
     </form>}
     {error && <p className="brief-error" role="alert">{error}</p>}<p className="brief-notice" role="status">{notice}</p>
     <noscript><p>Для диалога включите JavaScript. Можно также обсудить задачу через контакты ниже.</p></noscript>
    </div>
   </div>
  </div>
 </section>;
}
