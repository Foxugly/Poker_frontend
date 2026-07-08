// WebSocket protocol types (delegation-poker-realtime-contract.md).
export const PROTOCOL_VERSION = 1;

export type RoundState = 'idle' | 'open' | 'revealed' | 'acted';
export type Role = 'facilitator' | 'voter';

export interface Envelope<T = unknown> {
  v: number;
  type: string;
  payload: T;
  cid?: string;
  ts?: number;
}

export interface TextLayer {
  kind: 'static' | 'i18n';
  order: number;
  x: number;
  y: number;
  font: string;
  size: number;
  weight: number;
  color: string;
  align: 'left' | 'center' | 'right';
  text: string | Record<string, string>;
}

export interface SnapshotCard {
  value: string;
  slug: string;
  order: number;
  background: { image: string | null };
  layers: TextLayer[];
}

export interface DeckSnapshot {
  voteType: string;
  resolutionStrategy: string;
  deckId: number;
  cardBack: { image: string | null };
  cards: SnapshotCard[];
}

export interface ParticipantView {
  participantId: string;
  username: string;
  role: Role;
  hasVoted: boolean;
}

export interface RevealedVote {
  participantId: string;
  cardValue: string;
}

export interface StateSync {
  room: { code: string; title: string };
  protocolVersion: number;
  roundState: RoundState;
  subject: string;
  deckSnapshot: DeckSnapshot;
  participants: ParticipantView[];
  myVote: string | null;
  result: string | null;
  facilitatorPresent: boolean;
  votes?: RevealedVote[];
}

export interface Participation {
  voted: number;
  total: number;
  votedIds: string[];
}

export interface RoomError {
  code: string;
  message: string;
  rejectedType: string;
  cid: string | null;
}
