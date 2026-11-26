import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5189',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    },
  },
  webServer: {
    command: 'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5189',
    url: 'http://127.0.0.1:5189',
    reuseExistingServer: false,
    timeout: 120_000,
    env: { VITE_USE_MOCKS: 'true', VITE_DEMO_MODE: 'true' },
  },
});
