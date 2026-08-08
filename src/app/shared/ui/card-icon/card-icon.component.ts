import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CardIconName } from './card-icon-keys';

/**
 * Les neuf pictogrammes des decks muets.
 *
 * **Deux techniques, assumees.**
 *
 * - *Fist of Five* : les six mains sont des **images** (`public/card-icons/fist-N.png`),
 *   affichees comme **masque CSS** rempli en `currentColor`, et non comme <img>. Le dessin
 *   d'origine est noir sur fond transparent : pose tel quel sur une carte sombre il serait
 *   invisible, et un raster ne sait pas heriter d'une couleur. Le masque resout les deux
 *   d'un coup — la forme vient de l'image, la couleur de la couche, donc la personnalisation
 *   par equipe continue de fonctionner comme avec un SVG.
 * - *Vote romain* : les trois pouces sont les traces **PrimeIcons** (`thumbs-up`,
 *   `thumbs-down`), repris depuis `primeicons/raw-svg` — deja une dependance du projet,
 *   donc aucun paquet a ajouter, et sous licence MIT. Ils sont au trait comme les mains,
 *   la ou les pouces en aplat dessines auparavant detonnaient a cote d'elles.
 *   PrimeIcons n'ayant pas de pouce horizontal, le **neutre** est le pouce leve pivote
 *   d'un quart de tour : c'est le meme dessin, donc le style reste homogene.
 *
 * Les deux jeux ne se croisent qu'au selecteur de decks d'une equipe : une salle ne joue
 * qu'un deck a la fois, donc la difference de technique ne se voit pas en partie.
 *
 * Chaque cas SVG porte son propre <svg> complet : c'est ce qui garantit le namespace SVG,
 * qu'un @switch place *a l'interieur* d'un <svg> ne garantirait pas. Le tout est statique :
 * aucun innerHTML, donc aucune surface d'injection.
 */
@Component({
  selector: 'app-card-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (name()) {
      @case ('fist-0') {
        <span class="mask mask--fist-0" aria-hidden="true"></span>
      }
      @case ('fist-1') {
        <span class="mask mask--fist-1" aria-hidden="true"></span>
      }
      @case ('fist-2') {
        <span class="mask mask--fist-2" aria-hidden="true"></span>
      }
      @case ('fist-3') {
        <span class="mask mask--fist-3" aria-hidden="true"></span>
      }
      @case ('fist-4') {
        <span class="mask mask--fist-4" aria-hidden="true"></span>
      }
      @case ('fist-5') {
        <span class="mask mask--fist-5" aria-hidden="true"></span>
      }
      @case ('thumb-up') {
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path
            d="M20.22,9.55c-.43-.51-1.05-.8-1.72-.8h-4.03v-2.75c0-1.52-1.23-2.75-2.83-2.75-.7,0-1.33,.42-1.61,1.07l-2.54,5.93h-1.87c-1.31,0-2.37,1.06-2.37,2.37v5.77c0,1.3,1.07,2.36,2.37,2.36h11.56c1.09,0,2.02-.78,2.21-1.86l1.32-7.5h0c.11-.66-.07-1.33-.5-1.84ZM5.62,19.25c-.48,0-.87-.39-.87-.86v-5.77c0-.48,.39-.87,.87-.87h1.61v7.5h-1.61Zm12.3-.62c-.06,.36-.37,.62-.74,.62H8.74V11.15l2.67-6.25c.04-.09,.13-.16,.32-.16,.69,0,1.24,.56,1.24,1.25v4.25h5.53c.23,0,.43,.09,.57,.26,.14,.17,.2,.39,.16,.62l-1.32,7.5Z"
          />
        </svg>
      }
      @case ('thumb-side') {
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <g transform="rotate(90 12 12)">
            <path
              d="M20.22,9.55c-.43-.51-1.05-.8-1.72-.8h-4.03v-2.75c0-1.52-1.23-2.75-2.83-2.75-.7,0-1.33,.42-1.61,1.07l-2.54,5.93h-1.87c-1.31,0-2.37,1.06-2.37,2.37v5.77c0,1.3,1.07,2.36,2.37,2.36h11.56c1.09,0,2.02-.78,2.21-1.86l1.32-7.5h0c.11-.66-.07-1.33-.5-1.84ZM5.62,19.25c-.48,0-.87-.39-.87-.86v-5.77c0-.48,.39-.87,.87-.87h1.61v7.5h-1.61Zm12.3-.62c-.06,.36-.37,.62-.74,.62H8.74V11.15l2.67-6.25c.04-.09,.13-.16,.32-.16,.69,0,1.24,.56,1.24,1.25v4.25h5.53c.23,0,.43,.09,.57,.26,.14,.17,.2,.39,.16,.62l-1.32,7.5Z"
            />
          </g>
        </svg>
      }
      @case ('thumb-down') {
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path
            d="M18.38,3.25H6.81c-1.09,0-2.02,.78-2.21,1.86l-1.31,7.5h0c-.11,.66,.07,1.33,.49,1.84,.43,.51,1.05,.8,1.72,.8h4.03v2.75c0,1.52,1.23,2.75,2.83,2.75,.7,0,1.33-.42,1.61-1.07l2.54-5.93h1.88c1.31,0,2.37-1.06,2.37-2.37V5.61c0-1.3-1.06-2.36-2.37-2.36Zm-3.12,9.6l-2.67,6.25c-.04,.09-.13,.16-.32,.16-.69,0-1.24-.56-1.24-1.25v-4.25H5.5c-.23,0-.43-.09-.57-.26-.15-.17-.2-.39-.16-.62l1.31-7.5c.06-.36,.37-.62,.74-.62H15.26V12.85Zm3.99-1.47c0,.48-.39,.87-.87,.87h-1.61V4.75h1.61c.48,0,.87,.39,.87,.86v5.77Z"
          />
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
      .mask {
        display: block;
        width: 100%;
        height: 100%;
        /* La couleur vient de la couche via currentColor ; l'image ne fournit que
           la forme, via son canal alpha. C'est ce qui rend le raster theme-able. */
        background-color: currentColor;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-position: center;
        mask-position: center;
        -webkit-mask-size: contain;
        mask-size: contain;
      }
      .mask--fist-0 {
        -webkit-mask-image: url('/card-icons/fist-0.png');
        mask-image: url('/card-icons/fist-0.png');
      }
      .mask--fist-1 {
        -webkit-mask-image: url('/card-icons/fist-1.png');
        mask-image: url('/card-icons/fist-1.png');
      }
      .mask--fist-2 {
        -webkit-mask-image: url('/card-icons/fist-2.png');
        mask-image: url('/card-icons/fist-2.png');
      }
      .mask--fist-3 {
        -webkit-mask-image: url('/card-icons/fist-3.png');
        mask-image: url('/card-icons/fist-3.png');
      }
      .mask--fist-4 {
        -webkit-mask-image: url('/card-icons/fist-4.png');
        mask-image: url('/card-icons/fist-4.png');
      }
      .mask--fist-5 {
        -webkit-mask-image: url('/card-icons/fist-5.png');
        mask-image: url('/card-icons/fist-5.png');
      }
    `,
  ],
})
export class CardIconComponent {
  readonly name = input.required<CardIconName>();
}
