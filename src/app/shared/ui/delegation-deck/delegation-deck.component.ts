import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { FALLBACK_LANG } from '../../../core/i18n/available-languages';
import { DeckSnapshot } from '../../../core/realtime/protocol';
import { DelegationCardComponent } from '../delegation-card/delegation-card.component';

/**
 * Lays out the deck's cards (7 across on desktop, wrapping on mobile). Reads the
 * immutable snapshot, emits (vote) with the chosen card value.
 */
@Component({
  selector: 'app-delegation-deck',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DelegationCardComponent],
  template: `
    <div class="deck" [style.--n]="deck().cards.length">
      @for (card of deck().cards; track card.value) {
        <app-delegation-card
          [card]="card"
          [lang]="lang()"
          [revealed]="true"
          [selected]="card.value === myVote()"
          [disabled]="!votable()"
          [cardBack]="deck().cardBack.image"
          (click)="votable() && vote.emit(card.value)"
        />
      }
    </div>
  `,
  styles: [
    `
      /* Les cartes prennent toute la largeur disponible, entre deux bornes.
         Elles etaient auparavant figees a 60px : la main occupait moins de la
         moitie de sa place sur un grand ecran, et les libelles y etaient illisibles.

         Le PLAFOND evite qu'un deck de trois cartes (vote romain) ne les etale de
         maniere absurde, et borne la hauteur que la main prend a la table — la
         salle le resserre en plein ecran, ou le debordement est masque.

         Le PLANCHER est ce qui fait passer a la ligne : auto-fit place autant de
         colonnes que la largeur en accepte, donc des que la part de chacune tombe
         sous ce seuil, la main se replie sur plusieurs rangees plutot que de reduire
         les cartes indefiniment. Sans lui, dix cartes sur un telephone feraient 28px. */
      .deck {
        --gap: var(--s-3);
        --card: clamp(
          var(--hand-card-min, 52px),
          calc((100% - (var(--n) - 1) * var(--gap)) / var(--n)),
          var(--hand-card-max, 140px)
        );
        display: grid;
        grid-template-columns: repeat(auto-fit, var(--card));
        justify-content: center;
        gap: var(--gap);
      }
    `,
  ],
})
export class DelegationDeckComponent {
  readonly deck = input.required<DeckSnapshot>();
  readonly myVote = input<string | null>(null);
  readonly votable = input(false);
  readonly lang = input(FALLBACK_LANG as string);
  readonly vote = output<string>();
}
