'use client';

import { useEffect, useRef, useState } from 'react';
import { phoneError } from '@/lib/phone';

export function ContactForm() {
 const [ready, setReady] = useState(false);
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 const [touched, setTouched] = useState(false);
 const phoneRef = useRef<HTMLInputElement>(null);
 useEffect(() => setReady(true), []);
 const validate = (input: HTMLInputElement) => {
  const nextError = phoneError(input.value);
  input.setCustomValidity(nextError);
  setError(nextError);
  return !nextError;
 };

 return <form className="contact-form" aria-label="Обсудить сайт" noValidate onSubmit={event => {
  event.preventDefault();
  const input = phoneRef.current!;
  setTouched(true);
  setMessage('');
  if (!validate(input)) {
   input.focus();
   return;
  }
  setMessage('Это демонстрационная форма. Номер не отправлен: приём заявок ещё не подключён.');
 }}>
  <label htmlFor="contact-phone">Ваш телефон</label>
  <div className="contact-form-row">
   <input ref={phoneRef} id="contact-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (999) 123-45-67" required maxLength={40} aria-invalid={error ? true : undefined} aria-describedby="contact-phone-feedback contact-form-consent" disabled={!ready} onBlur={event => {
    setTouched(true);
    validate(event.currentTarget);
   }} onInput={event => {
    if (touched) validate(event.currentTarget);
    setMessage('');
   }}/>
   <button className="button" type="submit" disabled={!ready}>Дать сайту старт</button>
  </div>
  <p id="contact-phone-feedback" className={error ? 'contact-form-feedback contact-form-error' : undefined} role={error ? 'alert' : undefined}>{error}</p>
  <p className="contact-form-note" id="contact-form-consent">Отправляя форму, вы даёте согласие на обработку персональных данных.</p>
  <p className="contact-form-status" role="status">{message}</p>
  <noscript><p className="contact-form-note">Для проверки формы включите JavaScript.</p></noscript>
 </form>;
}
