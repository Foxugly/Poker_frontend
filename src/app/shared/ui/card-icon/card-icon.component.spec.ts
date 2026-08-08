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

  const SHAPES = 'path, rect, circle';

  /**
   * La geometrie dessinee, mise a plat. Couvre les deux traitements du jeu : les
   * mains du Fist of Five sont des `path` au trait, les pouces du vote romain des
   * `rect` en aplat portes par un `<g>` transforme.
   */
  function geometryOf(name: CardIconName): string {
    const svg = render(name).querySelector('svg')!;
    const transform = svg.querySelector('g')?.getAttribute('transform') ?? '';
    const shapes = [...svg.querySelectorAll(SHAPES)]
      .map((el) =>
        [...el.attributes]
          .map((a) => `${a.name}=${a.value}`)
          .sort()
          .join(','),
      )
      .join('|');
    return `${transform}::${shapes}`;
  }

  for (const key of CARD_ICON_KEYS) {
    it(`draws a non-empty svg for "${key}"`, () => {
      const svg = render(key).querySelector('svg');
      expect(svg).not.toBeNull();
      // Le namespace SVG doit etre correct, sinon rien ne s'affiche a l'ecran.
      expect(svg!.namespaceURI).toBe('http://www.w3.org/2000/svg');
      expect(svg!.querySelectorAll(SHAPES).length).toBeGreaterThan(0);
    });
  }

  it('gives every icon a distinct geometry', () => {
    // Attrape le copier-coller rate : deux cles qui dessinent la meme chose.
    // Les trois pouces partagent leurs formes et ne different que par le transform
    // du <g> qui les porte — d'ou sa presence dans la signature.
    const drawings = CARD_ICON_KEYS.map(geometryOf);
    expect(new Set(drawings).size).toBe(CARD_ICON_KEYS.length);
  });

  it('paints the fists with a stroke and the thumbs with a fill', () => {
    // Le jeu est volontairement mixte ; un copier-coller d'attributs entre les deux
    // familles donnerait une icone invisible (trait sans remplissage, ou l'inverse).
    const fist = render('fist-3').querySelector('svg')!;
    expect(fist.getAttribute('fill')).toBe('none');
    expect(fist.getAttribute('stroke')).toBe('currentColor');

    const thumb = render('thumb-up').querySelector('svg')!;
    expect(thumb.getAttribute('fill')).toBe('currentColor');
    expect(thumb.getAttribute('stroke')).toBeNull();
  });

  it('raises the ring finger between fist-2 and fist-3', () => {
    // Le repli de l'annulaire (sommet a 52) devient un doigt leve (sommet a 24).
    expect(geometryOf('fist-2')).toContain('M58 56V52');
    expect(geometryOf('fist-3')).toContain('M58 56V24');
  });
});
