import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { FALLBACK_LANG } from '../../../core/i18n/available-languages';
import { SnapshotCard, TextLayer } from '../../../core/realtime/protocol';

interface PositionedLayer {
  style: Record<string, string>;
  text: string;
}

/**
 * Renders ONE delegation card: background image + N text layers overlaid in CSS
 * (no server-side engraving, scope §8). Text follows the viewer's language with an
 * EN fallback. The card back is shown when face-down (before reveal).
 */
@Component({
  selector: 'app-delegation-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="card-face"
      [class.selected]="selected()"
      [class.disabled]="disabled()"
      [disabled]="disabled()"
      [style.background-image]="backgroundUrl()"
    >
      @if (faceUp()) {
        @for (layer of layers(); track layer.style['top'] + layer.text) {
          <span class="layer" [style]="layer.style">{{ layer.text }}</span>
        }
      }
    </button>
  `,
  styles: [
    `
      .card-face {
        position: relative;
        width: 100%;
        aspect-ratio: 5 / 7;
        border-radius: var(--radius);
        border: 2px solid var(--border);
        background-size: cover;
        background-position: center;
        background-color: var(--surface);
        box-shadow: var(--shadow-card);
        cursor: pointer;
        transition: transform 0.12s ease, border-color 0.12s ease;
        overflow: hidden;
        /* Establish a size container so layer font-size (cqh) scales with the card. */
        container-type: size;
      }
      .card-face:hover:not(.disabled) {
        transform: translateY(-4px);
      }
      .card-face.selected {
        border-color: var(--fox-primary);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--fox-primary) 40%, transparent);
      }
      .card-face.disabled {
        opacity: 0.65;
        cursor: default;
      }
      .layer {
        position: absolute;
        transform: translate(-50%, -50%);
        white-space: nowrap;
        line-height: 1;
      }
    `,
  ],
})
export class DelegationCardComponent {
  readonly card = input.required<SnapshotCard>();
  readonly selected = input(false);
  readonly revealed = input(true);
  readonly disabled = input(false);
  readonly lang = input(FALLBACK_LANG as string);
  readonly cardBack = input<string | null>(null);

  readonly faceUp = computed(() => this.revealed());

  readonly backgroundUrl = computed(() => {
    const url = this.faceUp() ? this.card().background.image : this.cardBack();
    return url ? `url('${url}')` : 'none';
  });

  readonly layers = computed<PositionedLayer[]>(() =>
    [...this.card().layers]
      .sort((a, b) => a.order - b.order)
      .map((layer) => ({ text: this.resolveText(layer), style: this.styleFor(layer) })),
  );

  private resolveText(layer: TextLayer): string {
    if (typeof layer.text === 'string') return layer.text;
    return layer.text[this.lang()] ?? layer.text[FALLBACK_LANG] ?? Object.values(layer.text)[0] ?? '';
  }

  private styleFor(layer: TextLayer): Record<string, string> {
    return {
      left: `${layer.x}%`,
      top: `${layer.y}%`,
      // font-size in % of card height (cqh); container-query unit keeps it responsive.
      'font-size': `${layer.size}cqh`,
      'font-family': layer.font,
      'font-weight': String(layer.weight),
      color: layer.color,
      'text-align': layer.align,
    };
  }
}
