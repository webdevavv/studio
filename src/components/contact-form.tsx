'use client';

import { useEffect, useRef, useState } from 'react';
import './contact-form.css';
import { RequestSelect } from './request-select';
import { phoneError } from '@/lib/phone';
import { contactChannels, requestKinds } from '@/lib/brief';
import type { RequestContext } from '@/lib/request-context';

export function ContactForm({ enabled = false, policyUrl = '', context, defaultKind }: { enabled?: boolean; policyUrl?: string; context?: RequestContext; defaultKind?: string }) {
 const [ready, setReady] = useState(false);
 useEffect(() => setReady(true), []);
 const [error, setError] = useState('');
 const [message, setMessage] = useState('');
 const [state, setState] = useState<'idle' | 'pending' | 'success' | 'uncertain'>('idle');
 const phoneRef = useRef<HTMLInputElement>(null);
 const consentRef = useRef<HTMLInputElement>(null);
 const sending = useRef(false);
 const request = useRef<{ id: string; signature: string } | null>(null);
 const validPolicy = /^https:\/\//.test(policyUrl);
 const locked = !ready || state === 'pending' || state === 'success' || state === 'uncertain';
 const validatePhone = (input: HTMLInputElement) => {
  const next = phoneError(input.value);
  input.setCustomValidity(next); setError(next); return !next;
 };
 return <form className="contact-form" aria-label="Заявка на сайт" aria-busy={state === 'pending'} noValidate onSubmit={async event => {
  event.preventDefault();
  if (sending.current || locked) return;
  setMessage('');
  if (!validatePhone(phoneRef.current!)) { phoneRef.current!.focus(); return; }
  if (!enabled || !validPolicy) { setMessage('Заявка не отправлена: приём заявок пока не подключён.'); return; }
  if (!consentRef.current?.checked) { setMessage('Подтвердите согласие на обработку персональных данных.'); consentRef.current?.focus(); return; }
  const form = new FormData(event.currentTarget);
  const answers = { route: String(form.get('route')), channel: String(form.get('channel')), phone: String(form.get('phone')), comment: String(form.get('comment')), ...(context ? { ...context, pageUrl: window.location.origin + window.location.pathname } : {}) };
  const signature = JSON.stringify(answers);
  if (request.current?.signature !== signature) request.current = { id: crypto.randomUUID(), signature };
  sending.current = true; setState('pending');
  try {
   const response = await fetch('/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: request.current!.id, answers, consent: true, website: form.get('website') }), signal: AbortSignal.timeout(20000) });
   const result = await response.json();
   if (!response.ok || !result.taskId) {
    setState(result.uncertain || response.ok ? 'uncertain' : 'idle');
    setMessage(result.message || 'Не удалось подтвердить получение заявки. Уточните у студии, прежде чем отправлять её снова.');
    return;
   }
   setState('success'); setMessage('Заявка отправлена. Менеджер свяжется с вами выбранным способом.');
  } catch {
   setState('uncertain'); setMessage('Не удалось подтвердить получение заявки. Проверьте связь и уточните получение у студии, прежде чем отправлять её снова.');
  } finally { sending.current = false; }
 }}>
  <fieldset disabled={locked}><legend className="sr-only">Данные заявки</legend>
   <RequestSelect id="contact-kind" name="route" label="Какой сайт нужен?" options={requestKinds} defaultValue={defaultKind}/>
   <RequestSelect id="contact-channel" name="channel" label="Как удобнее связаться?" options={contactChannels}/>
   <div className="form-field"><label htmlFor="contact-phone">Номер телефона <span aria-hidden="true">*</span></label><input ref={phoneRef} id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (999) 123-45-67" required maxLength={40} aria-invalid={error ? true : undefined} aria-describedby="contact-phone-feedback" onKeyDown={event => {
    const input = event.currentTarget;
    const caret = input.selectionStart ?? 0;
    if (input.selectionEnd !== caret) return;
    if (event.key === 'Backspace' && caret > 0 && /\D/.test(input.value[caret - 1])) {
     let start = caret - 1; while (start > 0 && /\D/.test(input.value[start])) start--;
     input.setSelectionRange(start, caret);
    }
    if (event.key === 'Delete' && caret < input.value.length && /\D/.test(input.value[caret])) {
     let end = caret; while (end < input.value.length && /\D/.test(input.value[end])) end++;
     input.setSelectionRange(caret, Math.min(end + 1, input.value.length));
    }
   }} onInput={event => {
    const input = event.currentTarget;
    const raw = input.value;
    const caret = input.selectionStart ?? raw.length;
    let digits = raw.replace(/\D/g, '');
    let before = raw.slice(0, caret).replace(/\D/g, '').length;
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (digits && !digits.startsWith('7')) { digits = '7' + digits; before++; }
    digits = digits.slice(0, 11);
    const local = digits.slice(1);
    input.value = !digits ? '' : '+7' + (local ? ' (' + local.slice(0, 3) : '') + (local.length >= 3 ? ')' : '') + (local.length > 3 ? ' ' + local.slice(3, 6) : '') + (local.length > 6 ? '-' + local.slice(6, 8) : '') + (local.length > 8 ? '-' + local.slice(8, 10) : '');
    let position = 0, seen = 0;
    while (position < input.value.length && seen < before) { if (/\d/.test(input.value[position])) seen++; position++; }
    if (caret === raw.length) position = input.value.length;
    input.setSelectionRange(position, position);
    if (error) validatePhone(input); setMessage('');
   }}/><p id="contact-phone-feedback" className="contact-form-error" role={error ? 'alert' : undefined}>{error}</p></div>
   <div className="form-field"><label htmlFor="contact-comment">Комментарий о проекте <span>(необязательно)</span></label><textarea id="contact-comment" name="comment" rows={3} maxLength={1500} placeholder="Чем занимаетесь и что хотите рассказать на сайте?"/></div>
   <div className="form-trap" aria-hidden="true"><label htmlFor="contact-website">Ваш сайт</label><input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off"/></div>
   {validPolicy ? <label className="consent-label"><input ref={consentRef} type="checkbox" name="consent" required/><span>Даю согласие на обработку персональных данных в соответствии с <a href={policyUrl} target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a>.</span></label> : <p className="contact-form-note">Приём заявок пока не подключён. Данные из этой формы сейчас не отправляются.</p>}
   <button className="button" type="submit" disabled={locked}>{state === 'pending' ? 'Отправляем…' : state === 'success' ? 'Заявка отправлена' : 'Отправить заявку'}</button>
  </fieldset><p className="contact-form-status" role="status" aria-live="polite">{message}</p>
  <noscript><p>Для отправки заявки включите JavaScript.</p></noscript>
 </form>;
}
