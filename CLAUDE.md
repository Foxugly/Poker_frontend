# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Delegation Poker** (poker.foxugly.com) — Angular SPA for shared decision-making in real time
(Delegation Poker, Poker Planning, custom decks). Backend = `Poker_server`
(`D:\Projects\PycharmProjects\Poker_server`, Django + Channels/daphne, API at
`poker-api.foxugly.com`). The SPA talks to it over REST (`/api/v1/`) **and** a WebSocket
(`/ws/`) for the room. Fleet/deploy facts live in the user-level `~/.claude/CLAUDE.md`.

## Commands

- **Dev server:** `npm start` (`ng serve`, http://localhost:4200). No proxy: the API defaults
  to `http://localhost:8000` (`core/runtime-config.ts`), so start the backend with
  `.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000` in `Poker_server`.
- **Build:** `npm run build` (production by default).
- **Unit tests:** `npx ng test --watch=false` (Vitest via `@angular/build:unit-test`;
  `npm test` watches). CI runs `npm test` then `npm run build`.
- **E2E:** `npm run e2e` (Playwright, Chromium only, `e2e/`) against the **real** backend.
  `playwright.config.ts` boots both servers (`reuseExistingServer: true`); `POKER_SERVER_DIR` /
  `POKER_PYTHON` point at another backend checkout (CI uses them).
  - **Piège :** ports **4200 and 8000 must be free**. With `reuseExistingServer`, any other app
    already listening there (e.g. another Foxugly project's `ng serve`) is silently reused and
    the tests run against the wrong app — symptom: `auth-cookie.spec.ts` times out on `/me`.
  - `auth-cookie.spec.ts` creates users through `manage.py shell` in the backend checkout and
    is never retried (security test: a failure is a finding, not a flake).
- No lint script in this repo.

## Architecture

- Angular 21, standalone components only, signals for state, **Optimus UI 1**
  (`@openng/optimus-ui`, MIT community fork of PrimeNG 21: same components, selectors and Aura
  theme via `@openng/optimus-ui-themes`, `pi pi-*` icons via `@openng/icons`, `provideOptimus`;
  **PrimeNG >= 22 is banned in the fleet**, commercial licence key, see foxugly-ops
  `STANDARD-frontend-layout.md` « Bibliothèque UI »; `darkModeSelector: '.dark-mode'` set by `core/theme`), SCSS with fleet tokens in
  `src/styles/_tokens.scss` (layout standard §3.15 of `OPERATIONS.md`).
- Files keep the `.component.ts` suffix (`room.component.ts`, …), unlike PushIT_frontend.
- `src/app/core/` — one folder per domain: `api/` (`RoomApiService`), `auth/` (session,
  interceptor, guards, cookie mode — see README « Auth: HttpOnly refresh cookie »), `realtime/`
  (WebSocket), `rooms/`, `teams/`, `boards/`, `history/`, `billing/` (`gating.ts`: subscription
  needed / quota reached), `staff/`, `layout/` (topmenu, footer, user-menu, theme toggle, public layout),
  `i18n/`, `theme/`, `title/`, `app-update/`, `runtime-config.ts`, `sentry-scrub.ts`.
- `src/app/features/` — lazy routes: public pages (home, features, pricing, support, about,
  privacy), auth, `me`/`subscription` (account), `teams` (+ join by token, history, board),
  `join`, `room/:code`, `staff/users`.

### Room and realtime

- `features/room/room.component.*` is the heart of the app (table, seats, hand, outcome band,
  facilitator panel). Round states: `idle → open → revealed → acted`
  (`core/realtime/protocol.ts`).
- `RoomSocketService` speaks the versioned envelope protocol (`{v, type, payload, cid}`) defined
  in **`Poker_server/docs/superpowers/specs/delegation-poker-realtime-contract.md`** — change
  both sides together. A participant token (`session.join`) authenticates the socket, not the
  JWT; a guest can join a room without an account.
- The hand is shown only while the vote is `open` (the facilitator may still change the deck
  before); at reveal the outcome band takes its place.
- Table sizing is height-driven: the felt width (`--felt-w`) is derived from the viewport height
  minus `--chrome-h` and the card reserve, so table + hand + footer fit without scrolling. Seats
  are placed in JS for a given aspect ratio — size the felt with `max-width`, **never `height`**.
- Cards are rendered from deck snapshots (background + text/i18n/icon layers); icon-only decks
  (Fist of Five, vote romain) are paid-team features served by the backend.

### i18n

Transloco, 5 catalogues in `public/i18n/{fr,en,nl,it,es}.json`. **fr is the source of truth**;
`src/app/i18n-parity.spec.ts` fails if any catalogue misses or adds a key — add every new key in
all five languages.

## Runtime config, Sentry, deploy

- Prod config is **public and read at runtime**: SSM `/poker-frontend/prod/*` (String only) →
  `deploy/fetch-frontend-runtime-from-ssm.sh` → nginx injects `window.__POKER__` into
  `index.html` → `core/runtime-config.ts` (`apiBaseUrl`, `wsBaseUrl`, Sentry…). Dev uses the
  inline defaults.
- Sentry project `poker-frontend` (org `foxugly-srl`, `de.sentry.io`); URLs carrying tokens are
  scrubbed in `core/sentry-scrub.ts`.
- `.github/workflows/deploy.yml` (« Test & Deploy »): `test` (Vitest + build) and `e2e`
  (Playwright against `Poker_server` `main` + PostgreSQL 16 from the cached ECR image) are
  required checks on PRs; on `main`, `deploy` waits for `test` only: build → tarball → S3 →
  OIDC → SSM; root installs vhost/unit/fetch script from the
  committed git blob. Details and one-time setup: `deploy/DEPLOY.md`.
- Push to `main` = production deploy. Dependabot non-major PRs auto-merge once green.
