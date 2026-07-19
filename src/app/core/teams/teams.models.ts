export type TeamRole = 'owner' | 'admin' | 'member';

export interface Team {
  id: number;
  name: string;
  owner_email: string;
  created_at: string;
  my_role: TeamRole;
  member_count: number;
  card_back_color: string;
  felt_color: string;
  deck_ids: number[];
  card_back_id: number | null;
  is_paid: boolean;
  billing_enabled: boolean;
  subscription_status: string;
}

export interface Membership {
  id: number;
  user: { id: number; email: string; display_name: string };
  role: TeamRole;
  joined_at: string;
}

export interface Invitation {
  id: number;
  email: string;
  role: TeamRole;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export interface DeckCardPreview {
  value: string;
  slug: string;
  order: number;
  image: string;
}

export interface Deck {
  id: number;
  name: string;
  vote_type_code: string;
  vote_type_name: string;
  is_standard: boolean;
  is_custom: boolean;
  card_back_image: string;
  cards: DeckCardPreview[];
}

export interface CardBack {
  id: number;
  name: string;
  is_standard: boolean;
  is_custom: boolean;
  image: string;
}

export interface TeamDecks {
  decks: Deck[];
  selected_deck_ids: number[];
  card_backs: CardBack[];
  selected_card_back_id: number | null;
  can_customize: boolean;
}
