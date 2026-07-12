# Backlog — layout · Poker_frontend (A21)

> **Cible :** `STANDARD-frontend-layout.md` (repo `foxugly-ops`) ; réf = `FoxRunner_frontend`
> (+ app runnable `foxugly-ops/frontend-reference/foo-app`).
> **Statut : ✅ conforme — DÉPLOYÉ** (poker.foxugly.com). Reste 1 item sécurité (Turnstile, besoin config).

## ✅ Fait + déployé
- Tokens sémantiques + retrait Tailwind ; chrome `core/layout` (`app-topmenu` BEM `[mode]`, `app-user-menu`,
  `app-footer`) ; `app-language-switcher` (Transloco 5 langues) ; shell + skip-link ; empty-state + skeletons.
- **Conformité 2026-07-12 (déployé)** :
  - **Chrome** : triggers thème + langue **borderless** (plus de boîte outlined) ; **icône globe retirée**
    du switcher (code langue seul).
  - **`app-auth-card`** créé + **les 7 pages auth migrées** ; icône + titre centrés.
  - **Login au gabarit de réf** : `p-password`, rangée **« Se souvenir » + « Oublié ? »** sur une ligne,
    bouton emerald, **séparateur « ou » + bouton lien magique inline**, « Créer un compte » sous la carte.
    `remember` → persistance du refresh token (localStorage/sessionStorage) dans `AuthService`.
  - **Footer complet** : logo/lien Foxugly → foxugly.com, **Privacy**, rights, séparateurs `·` (+ logo asset).
  - **Page `/privacy`** ajoutée (le footer y pointe).

## Reste — sécurité auth (config backend/SSM, hors layout)
- [ ] **Turnstile (Cloudflare)** sur **`register`** et **`forgot-password`** (convention flotte, standard
  §Pages d'auth) — **absent** (aucun widget rendu). Réf composant : `PushIT_frontend/src/app/shared/turnstile/`
  + clés `TURNSTILE_*` en SSM. Valider aussi le flux d'activation email du register.
