import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CardIconName } from './card-icon-keys';

/**
 * Les neuf pictogrammes des decks muets, dessines au trait.
 *
 * Style : contour d'epaisseur uniforme (5), bouts et angles arrondis, aucune
 * surface pleine. Traces originaux — s'inspirer d'un style est libre, reprendre
 * les traces d'un jeu sous licence ne l'est pas, et ces decks sont l'offre payante.
 *
 * Construction : une paume ouverte en bas, et quatre doigts dessines chacun comme
 * un U inverse pose sur le bord haut de la paume. Un doigt non leve reste present,
 * replie en phalange — c'est ce qui fait lire une main plutot que des barres
 * poussant d'un bloc, et c'est ce qui donne au `fist-0` un vrai poing. Les doigts
 * se levent dans l'ordre index, majeur, annulaire, auriculaire.
 *
 * `fist-5` sort le pouce a l'horizontale : c'est l'orientation qui encombre le
 * moins la paume et qui distingue le mieux le 5 du 4, y compris en petit.
 *
 * Le vote romain reprend le meme poing, pouce sorti — court et large, faute de
 * quoi il se lit comme un index qui pointe. Neutre = quart de tour ; contre =
 * miroir vertical et non rotation, sinon les phalanges partent du mauvais cote.
 *
 * Chaque cas porte son propre <svg> complet : c'est ce qui garantit le namespace
 * SVG, qu'un @switch place *a l'interieur* d'un <svg> ne garantirait pas.
 * Le tout est statique : aucun innerHTML, donc aucune surface d'injection.
 */
@Component({
  selector: 'app-card-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (name()) {
      @case ('fist-0') {
        <svg viewBox="0 0 100 100" [attr.stroke-width]="W" aria-hidden="true" focusable="false">
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M22 63Q9 71 22 79" />
          <path d="M30 56V52A6 6 0 0 1 42 52V56" />
          <path d="M44 56V52A6 6 0 0 1 56 52V56" />
          <path d="M58 56V52A6 6 0 0 1 70 52V56" />
          <path d="M72 56V52A5 5 0 0 1 82 52V56" />
        </svg>
      }
      @case ('fist-1') {
        <svg viewBox="0 0 100 100" [attr.stroke-width]="W" aria-hidden="true" focusable="false">
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M22 63Q9 71 22 79" />
          <path d="M30 56V26A6 6 0 0 1 42 26V56" />
          <path d="M44 56V52A6 6 0 0 1 56 52V56" />
          <path d="M58 56V52A6 6 0 0 1 70 52V56" />
          <path d="M72 56V52A5 5 0 0 1 82 52V56" />
        </svg>
      }
      @case ('fist-2') {
        <svg viewBox="0 0 100 100" [attr.stroke-width]="W" aria-hidden="true" focusable="false">
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M22 63Q9 71 22 79" />
          <path d="M30 56V26A6 6 0 0 1 42 26V56" />
          <path d="M44 56V20A6 6 0 0 1 56 20V56" />
          <path d="M58 56V52A6 6 0 0 1 70 52V56" />
          <path d="M72 56V52A5 5 0 0 1 82 52V56" />
        </svg>
      }
      @case ('fist-3') {
        <svg viewBox="0 0 100 100" [attr.stroke-width]="W" aria-hidden="true" focusable="false">
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M22 63Q9 71 22 79" />
          <path d="M30 56V26A6 6 0 0 1 42 26V56" />
          <path d="M44 56V20A6 6 0 0 1 56 20V56" />
          <path d="M58 56V24A6 6 0 0 1 70 24V56" />
          <path d="M72 56V52A5 5 0 0 1 82 52V56" />
        </svg>
      }
      @case ('fist-4') {
        <svg viewBox="0 0 100 100" [attr.stroke-width]="W" aria-hidden="true" focusable="false">
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M22 63Q9 71 22 79" />
          <path d="M30 56V26A6 6 0 0 1 42 26V56" />
          <path d="M44 56V20A6 6 0 0 1 56 20V56" />
          <path d="M58 56V24A6 6 0 0 1 70 24V56" />
          <path d="M72 56V33A5 5 0 0 1 82 33V56" />
        </svg>
      }
      @case ('fist-5') {
        <svg viewBox="0 0 100 100" [attr.stroke-width]="W" aria-hidden="true" focusable="false">
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M23 68L8 62A6 6 0 0 1 10 50L28 55" />
          <path d="M30 56V26A6 6 0 0 1 42 26V56" />
          <path d="M44 56V20A6 6 0 0 1 56 20V56" />
          <path d="M58 56V24A6 6 0 0 1 70 24V56" />
          <path d="M72 56V33A5 5 0 0 1 82 33V56" />
        </svg>
      }
      @case ('thumb-up') {
        <svg viewBox="0 0 100 100" [attr.stroke-width]="W" aria-hidden="true" focusable="false">
          <path d="M38 56V72Q38 88 56 88L70 88Q88 88 88 72V56" />
          <path d="M46 56V52A6 6 0 0 1 58 52V56" />
          <path d="M60 56V52A6 6 0 0 1 72 52V56" />
          <path d="M74 56V52A6 6 0 0 1 86 52V56" />
          <path d="M20 56V38A10 10 0 0 1 40 38V56" />
        </svg>
      }
      @case ('thumb-side') {
        <svg viewBox="0 0 100 100" [attr.stroke-width]="W" aria-hidden="true" focusable="false">
          <g transform="rotate(-90 50 50)">
            <path d="M38 56V72Q38 88 56 88L70 88Q88 88 88 72V56" />
            <path d="M46 56V52A6 6 0 0 1 58 52V56" />
            <path d="M60 56V52A6 6 0 0 1 72 52V56" />
            <path d="M74 56V52A6 6 0 0 1 86 52V56" />
            <path d="M20 56V38A10 10 0 0 1 40 38V56" />
          </g>
        </svg>
      }
      @case ('thumb-down') {
        <svg viewBox="0 0 100 100" [attr.stroke-width]="W" aria-hidden="true" focusable="false">
          <g transform="translate(0,100) scale(1,-1)">
            <path d="M38 56V72Q38 88 56 88L70 88Q88 88 88 72V56" />
            <path d="M46 56V52A6 6 0 0 1 58 52V56" />
            <path d="M60 56V52A6 6 0 0 1 72 52V56" />
            <path d="M74 56V52A6 6 0 0 1 86 52V56" />
            <path d="M20 56V38A10 10 0 0 1 40 38V56" />
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
        /* Le trait porte tout le dessin : aucune surface pleine, et la couleur
           vient de la couche via currentColor (personnalisation par equipe). */
        fill: none;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    `,
  ],
})
export class CardIconComponent {
  readonly name = input.required<CardIconName>();

  /** Epaisseur du trait, dans le repere 0-100 du viewBox. */
  protected readonly W = 5;
}
