import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CardIconName } from './card-icon-keys';

/**
 * Les neuf pictogrammes des decks muets, en SVG inline.
 *
 * Volontairement schematiques (paume et doigts en rectangles arrondis) : sur une
 * carte sans texte, un compte de doigts doit se lire instantanement, et `fist-3`
 * doit se distinguer de `fist-4` sans effort. `fist-0` reprend la paume des autres
 * sans doigt leve — ce deck est une gradation d'adhesion, pas un droit de veto,
 * donc surtout pas un poing brandi qui se lirait « stop ».
 *
 * Chaque cas porte son propre <svg> complet : c'est ce qui garantit le namespace
 * SVG, qu'un @switch place *a l'interieur* d'un <svg> ne garantirait pas.
 *
 * Le tout est statique : aucun innerHTML, donc aucune surface d'injection.
 */
@Component({
  selector: 'app-card-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (name()) {
      @case ('fist-0') {
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="26" y="44" width="48" height="42" rx="13" />
          <rect x="14" y="52" width="16" height="12" rx="6" />
        </svg>
      }
      @case ('fist-1') {
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="26" y="44" width="48" height="42" rx="13" />
          <rect x="14" y="52" width="16" height="12" rx="6" />
          <rect x="28" y="16" width="10" height="36" rx="5" />
        </svg>
      }
      @case ('fist-2') {
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="26" y="44" width="48" height="42" rx="13" />
          <rect x="14" y="52" width="16" height="12" rx="6" />
          <rect x="28" y="16" width="10" height="36" rx="5" />
          <rect x="40" y="16" width="10" height="36" rx="5" />
        </svg>
      }
      @case ('fist-3') {
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="26" y="44" width="48" height="42" rx="13" />
          <rect x="14" y="52" width="16" height="12" rx="6" />
          <rect x="28" y="16" width="10" height="36" rx="5" />
          <rect x="40" y="16" width="10" height="36" rx="5" />
          <rect x="52" y="16" width="10" height="36" rx="5" />
        </svg>
      }
      @case ('fist-4') {
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="26" y="44" width="48" height="42" rx="13" />
          <rect x="14" y="52" width="16" height="12" rx="6" />
          <rect x="28" y="16" width="10" height="36" rx="5" />
          <rect x="40" y="16" width="10" height="36" rx="5" />
          <rect x="52" y="16" width="10" height="36" rx="5" />
          <rect x="64" y="16" width="10" height="36" rx="5" />
        </svg>
      }
      @case ('fist-5') {
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="26" y="44" width="48" height="42" rx="13" />
          <rect x="28" y="16" width="10" height="36" rx="5" />
          <rect x="40" y="16" width="10" height="36" rx="5" />
          <rect x="52" y="16" width="10" height="36" rx="5" />
          <rect x="64" y="16" width="10" height="36" rx="5" />
          <rect x="8" y="28" width="12" height="32" rx="6" transform="rotate(-20 14 44)" />
        </svg>
      }
      @case ('thumb-up') {
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="30" y="44" width="46" height="40" rx="13" />
          <rect x="14" y="14" width="16" height="40" rx="8" />
        </svg>
      }
      @case ('thumb-side') {
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="16" y="26" width="40" height="46" rx="13" />
          <rect x="46" y="42" width="40" height="16" rx="8" />
        </svg>
      }
      @case ('thumb-down') {
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">
          <rect x="30" y="16" width="46" height="40" rx="13" />
          <rect x="14" y="46" width="16" height="40" rx="8" />
        </svg>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
        line-height: 0;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class CardIconComponent {
  readonly name = input.required<CardIconName>();
}
