# Backlog — layout · Poker_frontend (A21)

> **Cible :** `STANDARD-frontend-layout.md` (repo `foxugly-ops`) ; réf = `FoxRunner_frontend`.
> **Statut : ✅ ~100 % CONFORME — DÉPLOYÉ** (audit 2026-07-11).

**Layout : conforme + déployé.**
- Phase 2 (tokens sémantiques + retrait Tailwind) : fait, déployé.
- Phase 1 structurel (chrome `core/layout`/`core/i18n`, `app-user-menu`, `app-language-switcher` a11y,
  thème+anti-FOUC, shell+skip-link, drawer 1024, footer version runtime, empty-state, skeletons,
  About p-tabs) : fait, déployé.
- Fixes audit (page-header 3-col+slots, grille `auto-fit`, largeur `.page`→`--content-max`) : fait, déployé.
- Audit auth : `.auth` en carte (bord/fond/ombre) + titre centré ; hex `#dc2626`→`var(--danger)` : fait.

## Reste — sécurité auth (nécessite config backend, hors layout)
- [ ] **Turnstile (Cloudflare)** sur **`register`** et **`forgot-password`** (convention flotte, cf.
  `Pages d'authentification` du standard) — aujourd'hui **absent**. Réf composant : `PushIT_frontend/src/app/shared/turnstile/`
  + clés `TURNSTILE_*` en SSM.
- [ ] (Raffinement) **icône** dans l'en-tête des cartes auth (le standard veut « icône + titre centrés » ;
  le titre est centré, l'icône par-page reste à ajouter).
