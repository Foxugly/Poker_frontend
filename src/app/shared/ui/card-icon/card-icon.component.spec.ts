import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { CARD_ICON_KEYS, CardIconName } from './card-icon-keys';
import { CardIconComponent } from './card-icon.component';

/**
 * Garde-fou de completude : toute cle servie par le backend doit avoir un trace.
 * Un oubli doit echouer en integration continue, pas en salle devant une equipe.
 */
@Component({
  standalone: true,
  imports: [CardIconComponent],
  template: `<app-card-icon [name]="name" />`,
})
class HostComponent {
  name: CardIconName = 'fist-0';
}

describe('CardIconComponent', () => {
  function render(name: CardIconName): HTMLElement {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.name = name;
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('covers exactly the nine keys seeded by the backend', () => {
    expect([...CARD_ICON_KEYS]).toEqual([
      'fist-0',
      'fist-1',
      'fist-2',
      'fist-3',
      'fist-4',
      'fist-5',
      'thumb-up',
      'thumb-side',
      'thumb-down',
    ]);
  });

  for (const key of CARD_ICON_KEYS) {
    it(`draws a non-empty svg for "${key}"`, () => {
      const svg = render(key).querySelector('svg');
      expect(svg).not.toBeNull();
      // Le namespace SVG doit etre correct, sinon rien ne s'affiche a l'ecran.
      expect(svg!.namespaceURI).toBe('http://www.w3.org/2000/svg');
      expect(svg!.querySelectorAll('rect').length).toBeGreaterThan(0);
    });
  }

  it('raises one more finger from fist-3 to fist-4', () => {
    const three = render('fist-3').querySelectorAll('svg rect').length;
    const four = render('fist-4').querySelectorAll('svg rect').length;
    expect(four).toBe(three + 1);
  });
});
