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
 * Les trois pouces sont UNE SEULE main — pouce dresse + trois doigts replies —
 * declinee en trois orientations : c'est ce qui fait qu'on la reconnait, la
 * composition « paume + barre » essayee d'abord ne se lisant que comme un L.
 * Neutre = la meme main pivotee d'un quart de tour (on tourne le poignet) ;
 * contre = son miroir vertical, et non une rotation, sinon les doigts passent
 * du mauvais cote.
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
          <g>
            <rect x="18" y="10" width="25" height="46" rx="12.5" />
            <rect x="18" y="50" width="27" height="41" rx="10" />
            <rect x="42" y="49" width="42" height="14" rx="7" />
            <rect x="42" y="64" width="38" height="14" rx="7" />
            <rect x="42" y="79" width="34" height="14" rx="7" />
          </g>
        </svg>
      }
      @case ('thumb-side') {
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">
          <g transform="rotate(90 50 50)">
            <rect x="18" y="10" width="25" height="46" rx="12.5" />
            <rect x="18" y="50" width="27" height="41" rx="10" />
            <rect x="42" y="49" width="42" height="14" rx="7" />
            <rect x="42" y="64" width="38" height="14" rx="7" />
            <rect x="42" y="79" width="34" height="14" rx="7" />
          </g>
        </svg>
      }
      @case ('thumb-down') {
        <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" focusable="false">
          <g transform="translate(0,100) scale(1,-1)">
            <rect x="18" y="10" width="25" height="46" rx="12.5" />
            <rect x="18" y="50" width="27" height="41" rx="10" />
            <rect x="42" y="49" width="42" height="14" rx="7" />
            <rect x="42" y="64" width="38" height="14" rx="7" />
            <rect x="42" y="79" width="34" height="14" rx="7" />
          </g>
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
