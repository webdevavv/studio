'use client';

import { useEffect, useRef, useState } from 'react';
import { RequestSelect } from './request-select';
import './contact-form.css';
import { phoneError } from '@/lib/phone';
import { contactChannels } from '@/lib/brief';
import { money, site } from '@/lib/site';

export function TemplateRequestForm({ templateId, templateName, enabled = false, policyUrl = '', price = site.catalogPrice, templateUrl }: { templateId: string; templateName: string; enabled?: boolean; policyUrl?: string; price?: number | null; templateUrl?: string }) {
 const [ready, setReady] = useState(false);
 const [error, setError] = useState('');
 const [message, setMessage] = useState('');
 const [state, setState] = useState<'idle' | 'pending' | 'success' | 'uncertain'>('idle');
 const phone = useRef<HTMLInputElement>(null);
 const consent = useRef<HTMLInputElement>(null);
 const sending = useRef(false);
 const request = useRef<{ id: string; signature: string } | null>(null);
 useEffect(() => setReady(true), []);
 const configured = enabled && /^https:\/\//.test(policyUrl);
 const locked = !ready || state !== 'idle';
 const validatePhone = (input: HTMLInputElement) => { const next = phoneError(input.value); input.setCustomValidity(next); setError(next); return !next; };
 return <form className="template-request-form contact-form" aria-label={`Заявка на макет «${templateName}»`} data-template-id={templateId} aria-busy={state === 'pending'} noValidate onSubmit={async event => {
  event.preventDefault();
  if (sending.current || locked) return;
  setMessage('');
  const nextError = phoneError(phone.current!.value);
  setError(nextError);
  if (nextError) { phone.current!.focus(); return; }
  if (!configured) { setMessage('Заявка не отправлена: приём заявок пока не подключён.'); return; }
  if (!consent.current?.checked) { setMessage('Подтвердите согласие на обработку персональных данных.'); consent.current?.focus(); return; }
  const form = new FormData(event.currentTarget);
  const answers = { route: 'Готовый шаблон', templateId, name: String(form.get('name') || ''), channel: String(form.get('channel')), phone: String(form.get('phone')), comment: String(form.get('comment') || '') };
  const signature = JSON.stringify(answers);
  if (request.current?.signature !== signature) request.current = { id: crypto.randomUUID(), signature };
  sending.current = true; setState('pending');
  try {
   const response = await fetch('/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: request.current!.id, answers, consent: true, website: form.get('website') }), signal: AbortSignal.timeout(20000) });
   const result = await response.json();
   if (!response.ok || !result.taskId) {
    setState(result.uncertain || response.ok ? 'uncertain' : 'idle');
    setMessage(result.message || 'Не удалось подтвердить получение заявки. Уточните получение у студии перед повторной отправкой.');
    return;
   }
   setState('success'); setMessage('Заявка отправлена. Менеджер свяжется с вами выбранным способом.');
  } catch {
   setState('uncertain'); setMessage('Не удалось подтвердить получение заявки. Уточните получение у студии перед повторной отправкой.');
  } finally { sending.current = false; }
 }}>
  <div className="request-field"><label htmlFor="request-name">Ваше имя (необязательно)</label><input id="request-name" name="name" autoComplete="name" maxLength={100} disabled={locked}/></div>
  <div className="request-field"><label htmlFor="request-phone">Ваш телефон</label><input ref={phone} id="request-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (999) 123-45-67" required maxLength={40} disabled={locked} aria-invalid={!!error} aria-describedby="request-phone-error" onBlur={event => setError(phoneError(event.currentTarget.value))} onKeyDown={event => {
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
   }}/><p id="request-phone-error" className="request-error" role={error ? 'alert' : undefined}>{error}</p></div>
  <fieldset disabled={locked} className="request-channel-field"><RequestSelect id="request-channel" name="channel" label="Как удобнее связаться?" options={contactChannels}/></fieldset>
  <div className="request-field"><label htmlFor="request-comment">Комментарий (необязательно)</label><textarea id="request-comment" name="comment" rows={3} maxLength={1500} disabled={locked}/></div>
  <div className="form-trap" aria-hidden="true"><label htmlFor="request-website">Ваш сайт</label><input id="request-website" name="website" type="text" tabIndex={-1} autoComplete="off" disabled={locked}/></div>
  <div className="request-total"><span>Адаптация «{templateName}»{templateUrl && <> · <a href={templateUrl} target="_blank" rel="noopener noreferrer">Демо выбранного шаблона</a></>}</span><strong>{price === null ? 'Уточнить стоимость' : money(price)}</strong></div>
  {configured ? <label className="consent-label"><input ref={consent} name="consent" type="checkbox" required disabled={locked}/><span>Даю согласие на обработку персональных данных в соответствии с <a href={policyUrl} target="_blank" rel="noopener noreferrer">политикой конфиденциальности</a>.</span></label> : <p className="request-consent">Приём заявок пока не подключён. Данные из этой формы сейчас не отправляются.</p>}
  <button className="button" type="submit" disabled={locked}>{state === 'pending' ? 'Отправляем…' : state === 'success' ? 'Заявка отправлена' : 'Отправить заявку'}</button>
  <p className="request-status" role="status" aria-live="polite">{message}</p>
  <noscript><p className="request-consent">Для заполнения формы включите JavaScript.</p></noscript>
 </form>;
}
