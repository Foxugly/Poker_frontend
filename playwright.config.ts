import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

// Same defaults as e2e/auth-cookie.spec.ts; CI points both at its own checkout.
const SERVER_DIR = process.env['POKER_SERVER_DIR'] ?? path.resolve('../../PycharmProjects/Poker_server');
const PYTHON =
  process.env['POKER_PYTHON'] ??
  path.join(SERVER_DIR, process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');

// e2e for Delegation Poker Phase 1. Needs BOTH the Angular SPA and the Django
// (ASGI) backend running. reuseExistingServer lets you start them yourself (the
// fast local loop); otherwise Playwright boots them via the webServer entries.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:4200',
    locale: 'en-US',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // Django ASGI backend (daphne via runserver) + a seeded standard deck.
      // cwd + quoted absolute path: `cd x && .venv/Scripts/python.exe` broke under
      // cmd.exe (the shell npx uses on Windows), which reads `.venv/...` as a switch.
      command: [
        `"${PYTHON}" manage.py migrate --noinput`,
        `"${PYTHON}" manage.py seed_delegation_deck`,
        `"${PYTHON}" manage.py runserver 127.0.0.1:8000 --noreload`,
      ].join(' && '),
      cwd: SERVER_DIR,
      url: 'http://127.0.0.1:8000/health/',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'npm start',
      url: 'http://localhost:4200',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
