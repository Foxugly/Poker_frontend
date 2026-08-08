/**
 * Les cles d'icone servies par le backend dans les couches de type `icon`
 * (voir `decks/seed.py`). L'ordre suit celui des cartes dans chaque deck.
 */
export const CARD_ICON_KEYS = [
  'fist-0',
  'fist-1',
  'fist-2',
  'fist-3',
  'fist-4',
  'fist-5',
  'thumb-up',
  'thumb-neutral',
  'thumb-down',
] as const;

export type CardIconName = (typeof CARD_ICON_KEYS)[number];

/** Une cle inconnue ne doit jamais tenter d'etre dessinee. */
export function isCardIconName(value: string): value is CardIconName {
  return (CARD_ICON_KEYS as readonly string[]).includes(value);
}
