import { Injectable, signal } from '@angular/core';

import { getRuntimeConfig } from '../runtime-config';
import {
  DeckSnapshot,
  Envelope,
  Participation,
  ParticipantView,
  PROTOCOL_VERSION,
  RevealedVote,
  Role,
  RoomError,
  RoundState,
  StateSync,
} from './protocol';

/**
 * Encapsulates the WebSocket connection to a room (contract §2-§8) and exposes the
 * server-authoritative state as signals. Clients emit intentions; the UI reacts to
 * the server's rebroadcast facts — no optimistic state except the caster's own vote
 * (which is never secret from itself).
 */
@Injectable({ providedIn: 'root' })
export class RoomSocketService {
  private ws: WebSocket | null = null;
  private code = '';
  private token = '';
  private manualClose = false;
  private reconnectAttempts = 0;
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  readonly connected = signal(false);
  readonly roomTitle = signal('');
  readonly roundState = signal<RoundState>('idle');
  readonly subject = signal('');
  readonly deckSnapshot = signal<DeckSnapshot | null>(null);
  readonly participants = signal<ParticipantView[]>([]);
  readonly participation = signal<Participation>({ voted: 0, total: 0, votedIds: [] });
  readonly myVote = signal<string | null>(null);
  readonly revealedVotes = signal<RevealedVote[]>([]);
  readonly spread = signal<{ min: number | null; max: number | null }>({ min: null, max: null });
  readonly result = signal<string | null>(null);
  readonly facilitatorPresent = signal(true);
  readonly myRole = signal<Role>('voter');
  readonly lastError = signal<RoomError | null>(null);

  connect(code: string, token: string, role: Role): void {
    this.code = code.toUpperCase();
    this.token = token;
    this.myRole.set(role);
    this.manualClose = false;
    this.open();
  }

  private open(): void {
    const { wsBaseUrl } = getRuntimeConfig();
    const ws = new WebSocket(`${wsBaseUrl}/ws/rooms/${this.code}/`);
    this.ws = ws;

    ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.connected.set(true);
      this.send('session.join', { participantToken: this.token });
      this.startHeartbeat();
    };
    ws.onmessage = (ev) => this.onMessage(JSON.parse(ev.data) as Envelope);
    ws.onclose = () => {
      this.connected.set(false);
      this.stopHeartbeat();
      if (!this.manualClose) this.scheduleReconnect();
    };
    ws.onerror = () => ws.close();
  }

  private scheduleReconnect(): void {
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 15000);
    this.reconnectAttempts += 1;
    setTimeout(() => {
      if (!this.manualClose) this.open();
    }, delay);
  }

  disconnect(): void {
    this.manualClose = true;
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
  }

  // --- intentions (contract §4) ---
  setSubject(text: string) { this.send('subject.set', { text }); }
  openVote() { this.send('vote.open', {}); }
  castVote(cardValue: string) {
    // The caster may see its own choice immediately (not a secret from itself, §6.a).
    this.myVote.set(cardValue);
    this.send('vote.cast', { cardValue });
  }
  reveal() { this.send('vote.reveal', {}); }
  actResult(chosenValue: string) { this.send('result.act', { chosenValue }); }
  reset() { this.send('vote.reset', {}); }
  claimFacilitator() { this.send('facilitator.claim', {}); }

  private send(type: string, payload: unknown): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const cid = `c-${Math.floor(performance.now())}-${type}`;
    this.ws.send(JSON.stringify({ v: PROTOCOL_VERSION, type, payload, cid }));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => this.send('ping', {}), 20000);
  }
  private stopHeartbeat(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = null;
  }

  private onMessage(msg: Envelope): void {
    switch (msg.type) {
      case 'state.sync': return this.applyStateSync(msg.payload as StateSync);
      case 'participant.joined': {
        const p = msg.payload as ParticipantView;
        this.participants.update((list) =>
          list.some((x) => x.participantId === p.participantId) ? list : [...list, { ...p, hasVoted: false }],
        );
        return;
      }
      case 'participant.left': {
        const id = (msg.payload as { participantId: string }).participantId;
        this.participants.update((list) => list.filter((x) => x.participantId !== id));
        return;
      }
      case 'participation.update': return this.participation.set(msg.payload as Participation);
      case 'subject.updated':
        this.subject.set((msg.payload as { text: string }).text);
        return;
      case 'vote.opened':
        this.roundState.set('open');
        this.revealedVotes.set([]);
        this.result.set(null);
        this.myVote.set(null);
        return;
      case 'vote.revealed': {
        const p = msg.payload as { votes: RevealedVote[]; spread: { min: number | null; max: number | null } };
        this.roundState.set('revealed');
        this.revealedVotes.set(p.votes);
        this.spread.set(p.spread);
        return;
      }
      case 'result.acted':
        this.roundState.set('acted');
        this.result.set((msg.payload as { chosenValue: string }).chosenValue);
        return;
      case 'vote.wasReset': {
        const next = (msg.payload as { nextState: RoundState }).nextState;
        this.roundState.set(next);
        this.revealedVotes.set([]);
        this.result.set(null);
        this.myVote.set(null);
        return;
      }
      case 'facilitator.changed':
        this.facilitatorPresent.set(true);
        return;
      case 'error':
        this.lastError.set(msg.payload as RoomError);
        return;
      case 'pong':
        return;
    }
  }

  private applyStateSync(s: StateSync): void {
    this.roomTitle.set(s.room.title);
    this.roundState.set(s.roundState);
    this.subject.set(s.subject);
    this.deckSnapshot.set(s.deckSnapshot);
    this.participants.set(s.participants);
    this.myVote.set(s.myVote);
    this.result.set(s.result);
    this.facilitatorPresent.set(s.facilitatorPresent);
    this.revealedVotes.set(s.votes ?? []);
  }
}
