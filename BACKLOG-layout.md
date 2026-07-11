# Backlog — harmonisation layout · Poker_frontend

> **Cible :** `STANDARD-frontend-layout.md` (repo `foxugly-ops`).
> Bon socle (thème + Transloco déjà là) ; écart = **emplacements/API + retrait Tailwind + About + noms de tokens**.
> **Statut :** standard **VALIDÉ 2026-07-11** (réf complète : `FoxRunner_frontend`). Travailler sur
> branche **`feat/scss-standard`** — **jamais `main`** (auto-deploy prod). `_breakpoints.scss` de la
> flotte ajouté (inutilisé pour l'instant).

## ✅ Déjà conforme
- `app-topmenu` · BEM `topbar__*` ; **toggle thème + `ThemeService`** ; **Transloco 5 langues**.
- `app-page-header` présent (`shared/ui/`).

## Phase 1 — structurel — ✅ FAIT (branche `feat/layout-phase1`, 2026-07-11)
- [x] **Emplacements** : `topmenu`, `footer`, `theme-toggle` → **`core/layout/`** ; `language-switcher` → **`core/i18n/`** ; `page-header` reste `shared/ui/`.
- [x] **Topmenu** : template + styles inline extraits en **fichiers `.html`/`.scss`** séparés.
- [x] **User** : logout direct → **`app-user-menu`** (dropdown ancré-droite nom + Déconnexion ; pas de page Profil/mdp côté poker).
- [x] **Login** : ancre `.signin` → **intégrée dans `app-user-menu`** (« Se connecter » outlined).
- [x] **Langue** : `p-select` brut → **`app-language-switcher`** popup a11y clavier (↓↑/Home/End/Enter/Échap, `pi-check` actif).
- [x] **Thème** : clé `poker.theme` → **`theme`** ; **anti-FOUC** inline dans `index.html` ; toggle en `<button>` rectangulaire.
- [x] **Topmenu** : drawer 960 → **1024** (breakpoint `lg`).
- [x] **Shell** : `_shell.scss` (`fox-shell`/`main-container`/`fox-skip-link`) ; `public-layout` **skip-link** + `<main id>` + `<p-toast>` unique. (largeur : pages auto-contraintes, unification `--content-max` en suivi.)
- [x] **Footer** : `core/layout/footer` + **version runtime** (`window.__POKER_VERSION`) + dark via tokens.
- [x] **About** : **déjà** en `p-tabs` Company / Legal / Technical (identité Foxugly + `about.i18n`) — conforme.
- [x] **Empty-state** : **`app-empty-state`** créé (`shared/ui/`) + câblé (teams / history).
- [x] **Skeletons** : `p-skeleton` ajoutés aux vues liste (teams / history). *board/room temps-réel = suivi.*
- [x] **Breakpoints** : `@media 1024px` (`lg`) sur le topmenu, aligné à l'échelle flotte.

## Phase 2 — CSS — ✅ FAIT (PR #1, branche `feat/scss-standard`, 2026-07-11)
- [x] **Retirer Tailwind** → utilitaires résiduels (flex/grid/gap/justify-end/w-full) déplacés en
  primitives locales `_layout.scss` ; `@import "tailwindcss"`, `@tailwindcss/postcss` et les 2 deps retirés.
- [x] **Aligner les noms de tokens sur le standard** : `_tokens.scss` remplacé par le set canonique
  (`--accent*`/`--ink*`/`--surface-2`/`--chrome-*`/`--success|warn|danger`/`--content-max`/`--content-pad`),
  extras app gardés (`--s-N`, `--shadow-card`). Usages renommés (15 fichiers) :
  `--fox-primary→--accent`, `--text/--text-strong→--ink`, `--surface-soft→--surface-2`.

## i18n
- [ ] ✅ Déjà Transloco — juste aligner l'UI du switcher.
