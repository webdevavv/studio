import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3005';
const dir = '.taste-skill/brief';
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
 for (const width of [320, 390, 768, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(`${base}/#brief`); await page.locator('#brief .button').first().waitFor();
  await page.locator('#brief').screenshot({ path: `${dir}/${width}-start.png` });
  if (width === 390) {
   await page.locator('#brief').getByRole('button', { name: 'Продолжить →', exact: true }).click();
   await page.locator('.brief-sheet').screenshot({ path: `${dir}/390-business.png` });
   await page.getByLabel('Название компании или проекта').fill('Мастерская света');
   await page.getByRole('button', { name: 'Сохранить и закончить', exact: true }).click();
   await page.locator('.brief-sheet').screenshot({ path: `${dir}/390-review.png` });
  }
  if (width === 1440) {
   // Static extract of the rendered interface for the skill's app-specific measurements.
   let html = await page.evaluate(() => {
    const section = document.querySelector('.brief-frame').outerHTML.replace('data-ui="brief"', '').replace('<strong>Бриф в диалоге</strong>', '<h1 style="font:inherit;font-weight:650">Бриф в диалоге</h1>');
    return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${location.origin}/">${[...document.querySelectorAll('link[rel=stylesheet],style')].map(el => el.outerHTML).join('')}</head><body><main class="shell">${section}</main></body></html>`;
   });
   for (const link of [...html.matchAll(/<link[^>]*href="([^\"]+\.css)"[^>]*>/g)]) {
    const cssPath = new URL(link[1], base).pathname.replace('/_next/', '.next/');
    let css = await readFile(cssPath, 'utf8');
    for (const asset of [...css.matchAll(/url\(([^)]*\.woff2)\)/g)]) {
     const media = asset[1].replaceAll('"', '').replaceAll("'", '').split('/').pop();
     const bytes = await readFile(`.next/static/media/${media}`);
     css = css.replace(asset[0], `url(data:font/woff2;base64,${bytes.toString('base64')})`);
    }
    html = html.replace(link[0], `<style>${css}</style>`);
   }
   await writeFile(`${dir}/preview.html`, html);
  }
  await page.close();
 }
} finally { await browser.close(); }
