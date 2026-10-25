'use client';

import { useEffect, useRef, useState } from 'react';
import { phoneError } from '@/lib/phone';
import { money, site } from '@/lib/site';

type Errors = { phone: string; preference: string };
const preferenceError = (value: string) => value.trim().length < 3 ? 'Укажите соцсеть или мессенджер, где вам удобно общаться.' : '';

export function TemplateRequestForm({ templateId, templateName }: { templateId: string; templateName: string }) {
 const [ready, setReady] = useState(false);
 const [errors, setErrors] = useState<Errors>({ phone: '', preference: '' });
 const [touched, setTouched] = useState({ phone: false, preference: false });
 const [message, setMessage] = useState('');
 const phone = useRef<HTMLInputElement>(null);
 const preference = useRef<HTMLTextAreaElement>(null);
 useEffect(() => setReady(true), []);
 const validate = (field: keyof Errors, value: string) => {
  const error = field === 'phone' ? phoneError(value) : preferenceError(value);
  setErrors(previous => ({ ...previous, [field]: error }));
 };

 return <form className="template-request-form" aria-label={`Заявка на макет «${templateName}»`} data-template-id={templateId} noValidate onSubmit={event => {
  event.preventDefault();
  const nextErrors = { phone: phoneError(phone.current!.value), preference: preferenceError(preference.current!.value) };
  setTouched({ phone: true, preference: true });
  setErrors(nextErrors);
  setMessage('');
  if (nextErrors.phone) return phone.current!.focus();
  if (nextErrors.preference) return preference.current!.focus();
  setMessage(`Заявка на макет «${templateName}» за ${money(site.catalogPrice)} не отправлена: приём заявок пока не подключён.`);
 }}>
  <div className="request-field"><label htmlFor="request-phone">Ваш телефон</label><input ref={phone} id="request-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (999) 123-45-67" required maxLength={40} disabled={!ready} aria-invalid={!!errors.phone} aria-describedby="request-phone-error" onBlur={event => { setTouched(previous => ({ ...previous, phone: true })); validate('phone', event.currentTarget.value); }} onInput={event => { if (touched.phone) validate('phone', event.currentTarget.value); setMessage(''); }}/><p id="request-phone-error" className="request-error" role={errors.phone ? 'alert' : undefined}>{errors.phone}</p></div>
  <div className="request-field"><label htmlFor="request-preference">Где вам удобнее написать?</label><textarea ref={preference} id="request-preference" placeholder="Например: Telegram, @ваше_имя. Или ВКонтакте — ссылка на профиль." rows={3} required maxLength={300} disabled={!ready} aria-invalid={!!errors.preference} aria-describedby="request-preference-error" onBlur={event => { setTouched(previous => ({ ...previous, preference: true })); validate('preference', event.currentTarget.value); }} onInput={event => { if (touched.preference) validate('preference', event.currentTarget.value); setMessage(''); }}/><p id="request-preference-error" className="request-error" role={errors.preference ? 'alert' : undefined}>{errors.preference}</p></div>
  <div className="request-total"><span>Адаптация «{templateName}»</span><strong>{money(site.catalogPrice)}</strong></div>
  <button className="button" type="submit" disabled={!ready}>Дать сайту старт</button>
  <p className="request-consent">Отправляя форму, вы даёте согласие на обработку персональных данных.</p>
  <p className="request-status" role="status">{message}</p>
  <noscript><p className="request-consent">Для заполнения формы включите JavaScript.</p></noscript>
 </form>;
}
