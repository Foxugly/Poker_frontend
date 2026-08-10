import { describe, expect, it } from 'vitest';

import { joinUrl } from './join-url';

describe('joinUrl', () => {
  it('pointe sur la page de jointure, pas sur la salle', () => {
    expect(joinUrl('https://poker.foxugly.com', '45TPFZ')).toBe('https://poker.foxugly.com/join/45TPFZ');
  });

  it('ne double pas la barre quand l origine en porte une', () => {
    expect(joinUrl('https://poker.foxugly.com/', '45TPFZ')).toBe('https://poker.foxugly.com/join/45TPFZ');
  });
});
