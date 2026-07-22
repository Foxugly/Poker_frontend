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
    <div class="deck">
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
      /* Fixed, compact card width (close to the table's seat cards) instead of
         stretching a few columns across the whole hand; wraps and stays centred. */
      .deck {
        display: grid;
        grid-template-columns: repeat(auto-fit, 60px);
        justify-content: center;
        gap: var(--s-3);
      }
      @media (max-width: 640px) {
        .deck {
          grid-template-columns: repeat(auto-fit, 52px);
        }
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
