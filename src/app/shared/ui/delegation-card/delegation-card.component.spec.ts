import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { SnapshotCard } from '../../../core/realtime/protocol';
import { DelegationCardComponent } from './delegation-card.component';

@Component({
  standalone: true,
  imports: [DelegationCardComponent],
  template: `<app-delegation-card [card]="card" [revealed]="true" lang="fr" />`,
})
class HostComponent {
  card!: SnapshotCard;
}

function cardWith(layers: SnapshotCard['layers']): SnapshotCard {
  return { value: '3', slug: 's', order: 1, background: { image: null }, layers };
}

const BASE = {
  order: 1,
  x: 50,
  y: 50,
  font: 'Inter',
  size: 55,
  weight: 400,
  color: '#ffffff',
  align: 'center' as const,
};

describe('DelegationCardComponent', () => {
  function render(card: SnapshotCard): HTMLElement {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.card = card;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('draws the icon for an icon layer, and no text span', () => {
    const el = render(cardWith([{ ...BASE, kind: 'icon', text: 'fist-3' }]));
    // Le pictogramme peut etre un SVG inline ou un masque CSS selon le deck ; ce qui
    // regarde la carte, c'est qu'elle delegue bien au composant d'icone.
    expect(el.querySelector('app-card-icon')).not.toBeNull();
    expect(el.querySelector('span.layer')).toBeNull();
  });

  it('still draws a span for a text layer', () => {
    const el = render(
      cardWith([{ ...BASE, kind: 'i18n', text: { fr: 'Consulter', en: 'Consult' } }]),
    );
    expect(el.querySelector('span.layer')?.textContent?.trim()).toBe('Consulter');
    expect(el.querySelector('app-card-icon')).toBeNull();
  });

  it('ignores an unknown icon key rather than drawing a broken card', () => {
    const el = render(cardWith([{ ...BASE, kind: 'icon', text: 'not-a-real-icon' }]));
    expect(el.querySelector('app-card-icon')).toBeNull();
  });
});
