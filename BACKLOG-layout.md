# Backlog — harmonisation layout · Poker_frontend

> **Cible :** `STANDARD-frontend-layout.md` (repo `foxugly-ops`).
> Bon socle (thème + Transloco déjà là) ; écart = **emplacements/API + retrait Tailwind + About + noms de tokens**.
> **Statut :** standard **VALIDÉ 2026-07-11** (réf complète : `FoxRunner_frontend`). Travailler sur
> branche **`feat/scss-standard`** — **jamais `main`** (auto-deploy prod). `_breakpoints.scss` de la
> flotte ajouté (inutilisé pour l'instant).

## ✅ Déjà conforme
- `app-topmenu` · BEM `topbar__*` ; **toggle thème + `ThemeService`** ; **Transloco 5 langues**.
- `app-page-header` présent (`shared/ui/`).

## Phase 1 — structurel
- [ ] **Emplacements** : déplacer `shared/ui/topmenu`, `shared/ui/footer`, `shared/ui/page-header` → **`core/layout/`** (topmenu/footer) et `shared/` page-header.
- [ ] **Topmenu** : sortir le **template + styles inline** dans des **fichiers séparés**.
- [ ] **User** : bouton **logout direct** → **`app-user-menu` dropdown** (Profil / … / Déconnexion).
- [ ] **Login** : ancre `.signin` séparée → **intégrer dans `app-user-menu`** (« Se connecter »).
- [ ] **Langue** : `p-select` brut → **`app-language-switcher`** (popup a11y, réf TM).
- [ ] **Thème** : clé `poker.theme` → **`theme`** ; ajouter **anti-FOUC** inline.
- [ ] **Topmenu** : drawer 960 → **1024**.
- [ ] **Shell** : `public-layout` → ajouter **skip-link** + `main-container` + `<p-toast>` unique + tokens largeur `--content-max/--content-pad`.
- [ ] **Footer** : `shared/ui/footer` → `core/layout/footer` + version runtime + dark.
- [ ] **About** : about simple → **`p-tabs` Company / Legal / Technical** (Company+Legal = texte Foxugly standard).
- [ ] **Empty-state** : **créer `app-empty-state`** (absent).
- [ ] **Skeletons** : **ajouter** (absents).
- [ ] **Breakpoints** : échelle standard.

## Phase 2 — CSS
- [ ] **Retirer Tailwind** → SCSS/BEM + CSS moderne (Features en Tailwind → grille CSS-grid native).
- [ ] **Aligner les noms de tokens sur le standard** : `_tokens.scss` de poker utilise `--text` /
  `--surface-soft` / … → migrer vers les noms canoniques (`--ink`, `--surface`, `--surface-2`,
  `--accent`, `--muted`, `--border`, `--content-max`, `--content-pad`, `--radius`…) du bloc
  `foxugly-ops/STANDARD-frontend-layout.md` (§ Design tokens). Renommer les usages en conséquence.

## i18n
- [ ] ✅ Déjà Transloco — juste aligner l'UI du switcher.
