import { defineConfig } from '@playwright/test';

const baseURL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

export default defineConfig({
 testDir: './tests',
 testMatch: '**/*.spec.ts',
 workers: 2,
 use: {
  baseURL,
  ...(process.platform === 'darwin' && !process.env.CHROMIUM_PATH ? { channel: 'chrome' } : {}),
  launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
 },
 webServer: process.env.TEST_BASE_URL ? undefined : {
  command: 'npm run dev',
  url: baseURL,
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
 },
});
