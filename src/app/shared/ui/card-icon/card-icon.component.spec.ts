import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { CARD_ICON_KEYS, CardIconName } from './card-icon-keys';
import { CardIconComponent } from './card-icon.component';

/**
 * Garde-fou de completude : toute cle servie par le backend doit dessiner quelque chose.
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

  const SHAPES = 'path, rect, circle';

  /**
   * Ce que la cle dessine, mis a plat. Le jeu emploie deux techniques : les mains du
   * Fist of Five sont des masques CSS (un <span> par cle), les pouces du vote romain
   * du SVG inline porte par un <g> transforme. La signature couvre les deux.
   */
  function drawingOf(name: CardIconName): string {
    const root = render(name);
    const mask = root.querySelector('span.mask');
    if (mask) return `mask::${mask.getAttribute('class')}`;

    const svg = root.querySelector('svg')!;
    const transform = svg.querySelector('g')?.getAttribute('transform') ?? '';
    const shapes = [...svg.querySelectorAll(SHAPES)]
      .map((el) =>
        [...el.attributes]
          .map((a) => `${a.name}=${a.value}`)
          .sort()
          .join(','),
      )
      .join('|');
    return `svg::${transform}::${shapes}`;
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
    it(`draws something for "${key}"`, () => {
      const root = render(key);
      const mask = root.querySelector('span.mask');
      if (mask) {
        // Le masque n'a de forme que par sa classe : sans elle, un carre plein.
        expect(mask.getAttribute('class')).toContain(`mask--${key}`);
        return;
      }
      const svg = root.querySelector('svg');
      expect(svg).not.toBeNull();
      // Le namespace SVG doit etre correct, sinon rien ne s'affiche a l'ecran.
      expect(svg!.namespaceURI).toBe('http://www.w3.org/2000/svg');
      expect(svg!.querySelectorAll(SHAPES).length).toBeGreaterThan(0);
    });
  }

  it('gives every icon a distinct drawing', () => {
    // Attrape le copier-coller rate : deux cles qui dessinent la meme chose. Les trois
    // pouces partagent leurs formes et ne different que par le transform de leur <g>.
    expect(new Set(CARD_ICON_KEYS.map(drawingOf)).size).toBe(CARD_ICON_KEYS.length);
  });

  it('paints the masked hands with currentColor, never with the image itself', () => {
    // Les images d'origine sont noires sur fond transparent : affichees telles quelles
    // elles seraient invisibles sur une carte sombre, et insensibles au theme d'equipe.
    // Seul le masque rempli en currentColor tient les deux promesses.
    const root = render('fist-3');
    expect(root.querySelector('img')).toBeNull();
    expect(root.querySelector('span.mask')).not.toBeNull();
  });

  it('paints the thumbs with a fill and no stroke', () => {
    const thumb = render('thumb-up').querySelector('svg')!;
    expect(thumb.getAttribute('fill')).toBe('currentColor');
    expect(thumb.getAttribute('stroke')).toBeNull();
  });
});
