import { test, expect, type Page } from '@playwright/test';

const demoUrl = 'https://beauty-she.vercel.app/';
async function mockDemo(page: Page) {
 await page.route('https://beauty-she.vercel.app/**', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;height:6000px;background:#fff"><h1>Test demo</h1><button onclick="this.textContent=\'Clicked\'">Demo button</button><p style="margin-top:1000px">Scroll destination</p></body></html>' }));
 await page.goto('/catalog/beauty-she');
 await expect(page.locator('.demo-screen iframe')).toBeVisible();
}

test('device tabs resize one viewport without navigation and scroll works immediately', async ({ page }) => {
 await page.setViewportSize({ width: 1440, height: 900 });
 await mockDemo(page);
 const iframe = page.locator('.demo-screen iframe');
 const frame = page.frame({ url: demoUrl })!;
 await frame.evaluate(() => { (window as Window & { previewTest?: string }).previewTest = 'same document'; });
 for (const [name, width] of [['Монитор',1440],['Ноутбук',1280],['Смартфон',390]] as const) {
  await page.getByRole('tab', { name, exact: true }).click();
  await expect.poll(() => frame.evaluate(() => innerWidth)).toBe(width);
  await expect(iframe).not.toHaveAttribute('inert','');
  await expect(page.locator('.demo-interaction-guard')).toHaveCount(0);
  await frame.evaluate(() => scrollTo(0,0));
  await iframe.scrollIntoViewIfNeeded();
  const box = (await iframe.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const parentScroll = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0,260);
  await expect.poll(() => frame.evaluate(() => scrollY)).toBeGreaterThan(50);
  expect(Math.abs(await page.evaluate(() => scrollY) - parentScroll)).toBeLessThan(2);
 }
 expect(await frame.evaluate(() => (window as Window & { previewTest?: string }).previewTest)).toBe('same document');
 await expect(iframe).toHaveCount(1);
 await expect(iframe).toHaveAttribute('sandbox', 'allow-scripts allow-same-origin');
});

test('all complete device images fit both stage axes at small and large screen sizes', async ({ page }) => {
 await mockDemo(page);
 for (const [width,height] of [[320,640],[375,667],[430,844],[768,900],[1024,768],[1440,900],[1920,1080]]) {
  await page.setViewportSize({ width,height });
  for (const name of ['Монитор','Ноутбук','Смартфон']) {
   await page.getByRole('tab', { name, exact: true }).click();
   await expect.poll(async () => {
    const stage = (await page.locator('.demo-stage').boundingBox())!;
    const device = (await page.locator('.demo-device').boundingBox())!;
    return device.width > 50 && device.width <= stage.width + 1 && device.height <= stage.height + 1 && device.y >= stage.y - 1 && device.y + device.height <= stage.y + stage.height + 1;
   }).toBe(true);
   await expect.poll(() => page.locator('.demo-device-image').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
   expect((await page.locator('.demo-stage').boundingBox())!.height).toBeLessThan(height * .6);
   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
 }
});

test('expanded preview preserves iframe scroll, fits viewport and restores focus', async ({ page }) => {
 await mockDemo(page);
 const frame = page.frame({ url: demoUrl })!;
 await frame.evaluate(() => scrollTo(0,240));
 const expand = page.getByRole('button', { name: 'Развернуть', exact: true });
 await expand.click();
 await expect(page.getByRole('dialog')).toBeVisible();
 expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
 await expect(page.getByRole('button', { name: 'Закрыть просмотр' })).toBeFocused();
 const bounds = (await page.locator('.demo-device').boundingBox())!;
 expect(bounds.y).toBeGreaterThanOrEqual(0);
 expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize()!.height);
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(expand).toBeFocused();
 expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
 expect(await frame.evaluate(() => scrollY)).toBe(240);
 await expect(page.locator('iframe')).toHaveCount(1);
});

test('keyboard tabs and fallback work without a scroll mode switch', async ({ page }) => {
 await page.setViewportSize({ width: 390,height: 844 });
 await mockDemo(page);
 await page.getByRole('tab', { name: 'Монитор', exact: true }).focus();
 await page.keyboard.press('End');
 await expect(page.getByRole('tab', { name: 'Смартфон', exact: true })).toBeFocused();
 await expect(page.getByRole('button', { name: 'Листать страницу', exact: true })).toHaveCount(0);
 await expect(page.locator('.demo-screen iframe')).not.toHaveAttribute('inert','');
 await page.getByRole('button', { name: 'Не видно сайт?' }).click();
 await expect(page.locator('.demo-help')).toContainText('не можем проверить содержимое');
 await expect(page.locator('.demo-fallback a')).toHaveAttribute('href',demoUrl);
});

test('mobile touch swipe scrolls the live iframe without an activation overlay', async ({ browser }) => {
 const context = await browser.newContext({ viewport: { width:390,height:844 }, isMobile:true,hasTouch:true });
 const page = await context.newPage();
 await mockDemo(page);
 await page.getByRole('tab', { name:'Смартфон',exact:true }).click();
 const iframe = page.locator('.demo-screen iframe');
 await iframe.scrollIntoViewIfNeeded();
 const box = (await iframe.boundingBox())!;
 const x = box.x + box.width / 2;
 const from = box.y + box.height * .8;
 const session = await context.newCDPSession(page);
 await session.send('Input.dispatchTouchEvent',{ type:'touchStart',touchPoints:[{x,y:from}] });
 for (let step=1;step<=8;step++) {
  await session.send('Input.dispatchTouchEvent',{ type:'touchMove',touchPoints:[{x,y:from-step*12}] });
  await page.waitForTimeout(20);
 }
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const frame = page.frame({url:demoUrl})!;
 await expect.poll(() => frame.evaluate(() => scrollY)).toBeGreaterThan(50);
 await context.close();
});
