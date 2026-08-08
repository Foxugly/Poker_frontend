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

  /** La geometrie dessinee, mise a plat : ce qui distingue reellement deux icones. */
  function geometryOf(name: CardIconName): string {
    return [...render(name).querySelectorAll('svg path')]
      .map((p) => p.getAttribute('d'))
      .join('|');
  }

  for (const key of CARD_ICON_KEYS) {
    it(`draws a non-empty svg for "${key}"`, () => {
      const svg = render(key).querySelector('svg');
      expect(svg).not.toBeNull();
      // Le namespace SVG doit etre correct, sinon rien ne s'affiche a l'ecran.
      expect(svg!.namespaceURI).toBe('http://www.w3.org/2000/svg');
      expect(svg!.querySelectorAll('path').length).toBeGreaterThan(0);
    });
  }

  it('gives every icon a distinct geometry', () => {
    // Attrape le copier-coller rate : deux cles qui dessinent la meme chose.
    // Les trois pouces partagent leurs traces mais different par leur transform,
    // pris en compte ici via le <g> qui les porte.
    const drawings = CARD_ICON_KEYS.map((k) => {
      const g = render(k).querySelector('svg g');
      return `${g?.getAttribute('transform') ?? ''}::${geometryOf(k)}`;
    });
    expect(new Set(drawings).size).toBe(CARD_ICON_KEYS.length);
  });

  it('raises the ring finger between fist-2 and fist-3', () => {
    // Le repli de l'annulaire (sommet a 52) devient un doigt leve (sommet a 24).
    expect(geometryOf('fist-2')).toContain('M58 56V52');
    expect(geometryOf('fist-3')).toContain('M58 56V24');
  });
});
