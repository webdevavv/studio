import { test, expect } from '@playwright/test';
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
 await page.getByRole('button',{name:'Меню'}).click(); await page.getByRole('navigation').getByRole('link',{name:'Услуги',exact:true}).click();
 await expect(page.getByRole('button',{name:'Меню'})).toHaveAttribute('aria-expanded','false');
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
 await expect(page.locator('#services')).toContainText('7');
 await expect(page.locator('#contacts')).toContainText('Контакты студии ещё не подключены');
 await page.getByRole('tab',{name:'Кофейня',exact:true}).focus();await page.keyboard.press('Home');
 await expect(page.getByRole('tab',{name:'Кофейня',exact:true})).toHaveAttribute('aria-selected','true');
});
