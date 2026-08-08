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
  function maskOf(name: CardIconName): Element | null {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.name = name;
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('span.mask');
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
      'thumb-neutral',
      'thumb-down',
    ]);
  });

  for (const key of CARD_ICON_KEYS) {
    it(`draws a masked shape for "${key}"`, () => {
      const mask = maskOf(key);
      expect(mask).not.toBeNull();
      // Sans sa classe propre, le masque n'a aucune forme : un carre plein.
      expect(mask!.getAttribute('class')).toContain(`mask--${key}`);
    });
  }

  it('gives every icon its own class', () => {
    // Attrape le copier-coller rate : deux cles pointant sur la meme image.
    const classes = CARD_ICON_KEYS.map((k) => maskOf(k)!.getAttribute('class'));
    expect(new Set(classes).size).toBe(CARD_ICON_KEYS.length);
  });

  it('never renders the image directly', () => {
    // Les dessins d'origine sont noirs sur fond transparent : affiches tels quels ils
    // seraient invisibles sur un fond sombre et insensibles au theme d'equipe. Seul le
    // masque rempli en currentColor tient les deux promesses.
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.name = 'thumb-up';
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('img')).toBeNull();
  });
});
