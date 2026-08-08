import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CardIconName } from './card-icon-keys';

/**
 * Les neuf pictogrammes des decks muets, en SVG inline.
 *
 * Traces originaux — s'inspirer d'un style est libre, reprendre les traces d'un
 * jeu sous licence ne l'est pas, et ces decks sont l'offre payante.
 *
 * **Deux traitements assumes.** Les mains du Fist of Five sont dessinees AU TRAIT
 * (contour d'epaisseur 5, bouts arrondis) ; les pouces du vote romain sont en
 * APLAT. Ce n'est pas un oubli : chaque traitement est le meilleur pour son deck,
 * et une salle ne joue qu'un deck a la fois — les deux jeux ne se croisent qu'au
 * selecteur de decks d'une equipe. Les attributs de rendu sont donc portes par
 * chaque <svg>, et non par une regle CSS commune.
 *
 * **Fist of Five.** Une paume ouverte, quatre doigts en U inverse poses sur son
 * bord haut. Un doigt non leve reste present, replie en phalange — c'est ce qui
 * fait lire une main plutot que des barres poussant d'un bloc, et ce qui donne au
 * `fist-0` un vrai poing plutot qu'une main mutilee. Les doigts se levent dans
 * l'ordre index, majeur, annulaire, auriculaire, donc aucune combinaison ne
 * produit de geste malencontreux. `fist-5` sort le pouce a l'horizontale :
 * l'orientation qui encombre le moins la paume et distingue le mieux le 5 du 4.
 *
 * **Vote romain.** Un pouce dresse plus trois doigts replies : c'est cette
 * silhouette qu'on reconnait, la composition « paume + barre » essayee d'abord ne
 * se lisant que comme un L. Neutre = la meme main pivotee d'un quart de tour (on
 * tourne le poignet) ; contre = son miroir vertical, et non une rotation, sinon
 * les doigts passent du mauvais cote.
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
        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M22 63Q9 71 22 79" />
          <path d="M30 56V52A6 6 0 0 1 42 52V56" />
          <path d="M44 56V52A6 6 0 0 1 56 52V56" />
          <path d="M58 56V52A6 6 0 0 1 70 52V56" />
          <path d="M72 56V52A5 5 0 0 1 82 52V56" />
        </svg>
      }
      @case ('fist-1') {
        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M22 63Q9 71 22 79" />
          <path d="M30 56V26A6 6 0 0 1 42 26V56" />
          <path d="M44 56V52A6 6 0 0 1 56 52V56" />
          <path d="M58 56V52A6 6 0 0 1 70 52V56" />
          <path d="M72 56V52A5 5 0 0 1 82 52V56" />
        </svg>
      }
      @case ('fist-2') {
        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M22 63Q9 71 22 79" />
          <path d="M30 56V26A6 6 0 0 1 42 26V56" />
          <path d="M44 56V20A6 6 0 0 1 56 20V56" />
          <path d="M58 56V52A6 6 0 0 1 70 52V56" />
          <path d="M72 56V52A5 5 0 0 1 82 52V56" />
        </svg>
      }
      @case ('fist-3') {
        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M22 63Q9 71 22 79" />
          <path d="M30 56V26A6 6 0 0 1 42 26V56" />
          <path d="M44 56V20A6 6 0 0 1 56 20V56" />
          <path d="M58 56V24A6 6 0 0 1 70 24V56" />
          <path d="M72 56V52A5 5 0 0 1 82 52V56" />
        </svg>
      }
      @case ('fist-4') {
        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M22 63Q9 71 22 79" />
          <path d="M30 56V26A6 6 0 0 1 42 26V56" />
          <path d="M44 56V20A6 6 0 0 1 56 20V56" />
          <path d="M58 56V24A6 6 0 0 1 70 24V56" />
          <path d="M72 56V33A5 5 0 0 1 82 33V56" />
        </svg>
      }
      @case ('fist-5') {
        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M22 56V72Q22 88 42 88L62 88Q82 88 82 72V56" />
          <path d="M23 68L8 62A6 6 0 0 1 10 50L28 55" />
          <path d="M30 56V26A6 6 0 0 1 42 26V56" />
          <path d="M44 56V20A6 6 0 0 1 56 20V56" />
          <path d="M58 56V24A6 6 0 0 1 70 24V56" />
          <path d="M72 56V33A5 5 0 0 1 82 33V56" />
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
