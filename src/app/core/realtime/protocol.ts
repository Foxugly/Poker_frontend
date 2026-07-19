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

/** How a surface is rendered. Both representations are always carried, so a team
 * switching style needs no new room; `style` alone decides which one to draw. */
export interface Surface {
  style: 'color' | 'image';
  image: string | null;
  color: string;
}

export interface DeckSnapshot {
  voteType: string;
  resolutionStrategy: string;
  deckId: number;
  cardBack: Surface;
  felt: Surface;
  /** Legacy, pre-Surface. Kept only until every deployed client reads the above. */
  theme?: { cardBackColor: string; feltColor: string };
  cards: SnapshotCard[];
}

export interface ParticipantView {
  participantId: string;
  username: string;
  role: Role;
  hasVoted: boolean;
}

/** Per-value vote count. Always emitted, in both reveal modes. */
export interface VoteTally {
  cardValue: string;
  count: number;
}

/** Who voted what. Emitted ONLY for a nominative round — an anonymous one omits
 * the key entirely rather than expecting the client to hide it. */
export interface NominativeVote {
  participantId: string;
  cardValue: string;
}

/** Reveal mode of the current round, announced to every participant (not just the
 * facilitator) so a voter knows whether their card will carry their name. */
export interface RevealMode {
  anonymous: boolean;
  canAnonymise: boolean;
}

/** One line of the facilitator's scenario (agenda): a subject with its round status. */
export interface AgendaItem {
  id: number;
  text: string;
  status: 'current' | 'done' | 'pending';
  result: string | null;
}

/** Facilitator-controlled round timer (contract §timer): purely advisory to the UI —
 * the server alone decides when a deadline actually causes a reveal. */
export interface TimerSettings {
  enabled: boolean;
  seconds: number;
}

/** A room's frozen deck catalogue entry — enough to pick, without the cards. */
export interface AvailableDeck {
  deckId: number;
  voteType: string;
  cardBack: { image: string | null };
}

export interface StateSync {
  room: { code: string; title: string };
  protocolVersion: number;
  roundState: RoundState;
  subject: string;
  deckSnapshot: DeckSnapshot;
  availableDecks: AvailableDeck[];
  participants: ParticipantView[];
  myVote: string | null;
  result: string | null;
  facilitatorPresent: boolean;
  agenda: AgendaItem[];
  tally?: VoteTally[];
  votes?: NominativeVote[];
  reveal: RevealMode;
  deadline: string | null;
  timer: TimerSettings;
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
