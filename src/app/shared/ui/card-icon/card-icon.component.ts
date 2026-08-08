import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CardIconName } from './card-icon-keys';

/**
 * Les neuf pictogrammes des decks muets.
 *
 * Ce sont les **images fournies** (`public/card-icons/<cle>.png`), affichees comme
 * **masque CSS rempli en `currentColor`** — jamais comme <img>. Le dessin d'origine est
 * noir sur fond transparent : pose tel quel il serait insensible au theme d'equipe, et
 * invisible sur un fond sombre. Le masque resout les deux d'un coup : la forme vient de
 * l'image via son canal alpha, la couleur vient de la couche.
 *
 * Le vote romain prend le **poing ferme** pour le neutre — ni pour, ni contre — et non un
 * pouce a l'horizontale ; c'est la meme image que `fist-0`, dupliquee pour que les deux
 * decks restent independants l'un de l'autre.
 *
 * Une classe statique par cle plutot qu'un `mask-image` calcule : la valeur ne vient
 * jamais d'une donnee, donc aucune URL ne peut etre injectee depuis un snapshot.
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
        <span class="mask mask--thumb-up" aria-hidden="true"></span>
      }
      @case ('thumb-neutral') {
        <span class="mask mask--thumb-neutral" aria-hidden="true"></span>
      }
      @case ('thumb-down') {
        <span class="mask mask--thumb-down" aria-hidden="true"></span>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
        line-height: 0;
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
      .mask--thumb-up {
        -webkit-mask-image: url('/card-icons/thumb-up.png');
        mask-image: url('/card-icons/thumb-up.png');
      }
      .mask--thumb-neutral {
        -webkit-mask-image: url('/card-icons/thumb-neutral.png');
        mask-image: url('/card-icons/thumb-neutral.png');
      }
      .mask--thumb-down {
        -webkit-mask-image: url('/card-icons/thumb-down.png');
        mask-image: url('/card-icons/thumb-down.png');
      }
    `,
  ],
})
export class CardIconComponent {
  readonly name = input.required<CardIconName>();
}
