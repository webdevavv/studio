import { test, expect } from '@playwright/test';
test('contact form validates a phone and honestly reports demo submission', async ({ page }) => {
 await page.goto('/');
 const form = page.getByRole('form', { name: 'Обсудить сайт' });
 const phone = form.getByRole('textbox', { name: 'Ваш телефон' });
 const submit = form.getByRole('button', { name: 'Дать сайту старт' });
 await expect(submit).toBeEnabled();
 for (const [value, error] of [
  ['', 'Укажите номер'],
  ['123', 'слишком короткий'],
  ['+7 номер 999', 'Используйте цифры'],
  ['7999+1234567', 'Плюс допустим только в начале'],
  ['1234567890123456', 'слишком длинный'],
  ['00000000000', 'повторяющейся цифры'],
 ]) {
  await phone.fill(value);
  await submit.click();
  await expect(phone).toBeFocused();
  await expect(phone).toHaveAttribute('aria-invalid', 'true');
  await expect(form.getByRole('alert')).toContainText(error);
  expect(await phone.evaluate(el => (el as HTMLInputElement).validity.valid)).toBe(false);
  await expect(form.getByRole('status')).toBeEmpty();
 }
 for (const value of ['+7 (999) 123-45-67', '8 999 123 45 67', '9991234567', '+44 20 7946 0958']) {
  await phone.fill(value);
  await expect(phone).not.toHaveAttribute('aria-invalid', 'true');
  await phone.press('Enter');
  await expect(form.getByRole('status')).toContainText('Номер не отправлен');
 }
 await expect(page).toHaveURL('/');
 await phone.fill('+7 999 123 45 68');
 await expect(form.getByRole('status')).toBeEmpty();
});
test('responsive homepage, working anchors and no browser errors', async ({ page }) => {
 const errors: string[]=[]; page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,375,768,1440]) {
  await page.setViewportSize({width,height:900}); await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for(const href of await page.locator('a[href^="#"]').evaluateAll(els=>els.map(el=>el.getAttribute('href')!))) expect(await page.locator(href).count()).toBe(1);
 }
 expect(errors).toEqual([]);
 await page.screenshot({path:'/tmp/studio-desktop.png',fullPage:true});
});
test('keyboard tabs, mobile navigation and FAQ',async({page})=>{
 await page.setViewportSize({width:375,height:812}); await page.goto('/');
 await page.getByRole('tab',{name:'Кофейня',exact:true}).focus(); await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('tab',{name:'Салон красоты'})).toBeFocused();
 await expect(page.getByRole('tabpanel')).toContainText('Время, которое');
 await page.keyboard.press('End'); await expect(page.getByRole('tabpanel')).toContainText('Дерево. Руки.');
 await page.locator('.header').getByRole('link',{name:'Заказать сайт',exact:true}).click();
 await expect(page).toHaveURL(/#brief$/);
 await expect(page.locator('.header nav,.header button')).toHaveCount(0);
 await page.locator('summary').first().click(); await expect(page.locator('details').first()).toHaveAttribute('open','');
 await page.screenshot({path:'/tmp/studio-mobile.png',fullPage:true});
});
test('SSR content, demo indexing and real 404',async({browser,request})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('/');
 await expect(page.locator('h1')).toContainText('За 2 дня.');await expect(page.getByRole('tabpanel')).toContainText('Хороший день'); await context.close();
 expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /');
 expect((await request.get('/missing-page')).status()).toBe(404);
});
test('concept images load, reduced motion preserves content and pricing stays visible',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 for(const name of ['Кофейня','Салон красоты','Частный мастер']){
  await page.getByRole('tab',{name,exact:true}).click();
  const image=page.getByRole('tabpanel').locator('img');
  await expect(image).toBeVisible();
  await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth>0)).toBe(true);
 }
 await expect(page.locator('#services .service-price').first()).toHaveText('2 000 ₽');
 await expect(page.locator('#contacts')).toContainText('Отправляя форму, вы даёте согласие на обработку персональных данных.');
 await expect(page.locator('#contacts')).not.toContainText('Контакты студии ещё не подключены');
 await page.getByRole('tab',{name:'Кофейня',exact:true}).focus();await page.keyboard.press('Home');
 await expect(page.getByRole('tab',{name:'Кофейня',exact:true})).toHaveAttribute('aria-selected','true');
});
