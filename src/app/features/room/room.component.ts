import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { LanguageService } from '../../core/i18n/language.service';
import { IdentityService } from '../../core/identity/identity.service';
import { RoomSocketService } from '../../core/realtime/room-socket.service';
import { RoundState, SnapshotCard } from '../../core/realtime/protocol';
import { DelegationCardComponent } from '../../shared/ui/delegation-card/delegation-card.component';
import { DelegationDeckComponent } from '../../shared/ui/delegation-deck/delegation-deck.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

const BADGE_SEVERITY: Record<RoundState, 'secondary' | 'success' | 'warn' | 'info'> = {
  idle: 'secondary',
  open: 'success',
  revealed: 'warn',
  acted: 'info',
};

interface Seat {
  participantId: string;
  username: string;
  role: string;
  x: number; // % position around the table
  y: number;
  card: SnapshotCard | null; // the card to render (face when revealed, any card for the back)
  revealed: boolean;
  show: boolean; // whether the seat has a card (voted) at all
}

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    FormsModule, TranslocoModule, ButtonModule, InputTextModule, SelectModule, TagModule,
    PageHeaderComponent, DelegationDeckComponent, DelegationCardComponent,
  ],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss',
})
export class RoomComponent implements OnInit, OnDestroy {
  readonly socket = inject(RoomSocketService);
  private identity = inject(IdentityService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messages = inject(MessageService);
  private language = inject(LanguageService);
  private transloco = inject(TranslocoService);

  readonly code = signal('');
  readonly subjectDraft = signal('');
  readonly chosenValue = signal<string | null>(null);
  readonly lang = this.language.active;

  readonly isFacilitator = computed(() => this.socket.myRole() === 'facilitator');
  readonly state = this.socket.roundState;
  readonly badgeSeverity = computed(() => BADGE_SEVERITY[this.state()]);
  readonly canOpen = computed(() => this.state() === 'idle' && this.socket.subject().trim().length > 0);
  readonly canReveal = computed(() => this.state() === 'open' && this.socket.participation().voted >= 1);
  readonly votable = computed(() => this.state() === 'open');

  readonly cardValues = computed(() => this.socket.deckSnapshot()?.cards.map((c) => c.value) ?? []);
  /** Act/globalise on the level NAME, not the number. Options + the acted result
   * resolve the card's translated name (from the snapshot) in the current language. */
  readonly cardOptions = computed(() =>
    (this.socket.deckSnapshot()?.cards ?? []).map((c) => ({ value: c.value, label: this.cardName(c) })),
  );
  readonly resultName = computed(() => {
    const v = this.socket.result();
    return v ? this.cardName(this.cardByValue(v)) || v : '';
  });

  cardName(card: SnapshotCard | null): string {
    if (!card) return '';
    const layer = card.layers.find((l) => l.kind === 'i18n');
    if (!layer) return card.value;
    const t = layer.text;
    if (typeof t === 'string') return t;
    return t[this.lang()] ?? t['en'] ?? Object.values(t)[0] ?? card.value;
  }

  // --- Imposed avatar (free): deterministic initials + colour. Custom upload = Phase 2 (paid).
  private readonly AVATAR_COLORS = [
    '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#14b8a6', '#6366f1',
  ];
  initials(name: string): string {
    const parts = (name || '?').trim().split(/\s+/);
    const a = parts[0]?.[0] ?? '?';
    const b = parts.length > 1 ? parts[1][0] : parts[0]?.[1] ?? '';
    return (a + b).toUpperCase();
  }
  avatarColor(seed: string): string {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return this.AVATAR_COLORS[h % this.AVATAR_COLORS.length];
  }
  readonly revealedByParticipant = computed(() => {
    const map = new Map<string, string>();
    for (const v of this.socket.revealedVotes()) map.set(v.participantId, v.cardValue);
    return map;
  });

  /** Seats laid out around the table (ellipse), each carrying its card state:
   * empty (not voted) → back (voted, hidden) → face (revealed). */
  readonly seats = computed<Seat[]>(() => {
    const participants = this.socket.participants();
    const deck = this.socket.deckSnapshot();
    const revealed = this.state() === 'revealed' || this.state() === 'acted';
    const revealedMap = this.revealedByParticipant();
    const votedIds = new Set(this.socket.participation().votedIds);
    const n = participants.length;
    return participants.map((p, i) => {
      const angle = -Math.PI / 2 + (i / Math.max(n, 1)) * 2 * Math.PI;
      const faceValue = revealed ? revealedMap.get(p.participantId) : undefined;
      const hasVoted = p.hasVoted || votedIds.has(p.participantId) || faceValue !== undefined;
      let card: SnapshotCard | null = null;
      if (faceValue !== undefined) card = this.cardByValue(faceValue);
      else if (hasVoted && deck) card = deck.cards[0]; // back placeholder
      return {
        participantId: p.participantId,
        username: p.username,
        role: p.role,
        x: 50 + 39 * Math.cos(angle),
        y: 50 + 42 * Math.sin(angle),
        card,
        revealed: faceValue !== undefined,
        show: hasVoted,
      };
    });
  });

  cardByValue(value: string): SnapshotCard | null {
    return this.socket.deckSnapshot()?.cards.find((c) => c.value === value) ?? null;
  }

  constructor() {
    // Surface server rejections / connection errors as toasts (pattern flotte).
    effect(() => {
      const err = this.socket.lastError();
      if (err) this.messages.add({ severity: 'warn', summary: err.code, detail: err.message });
    });
    // Propose the mode of revealed votes as the default acted value (design §4).
    effect(() => {
      if (this.state() === 'revealed' && this.chosenValue() === null) {
        this.chosenValue.set(this.modeValue());
      }
    });
  }

  ngOnInit(): void {
    const code = (this.route.snapshot.paramMap.get('code') ?? '').toUpperCase();
    this.code.set(code);
    const session = this.identity.sessionFor(code);
    if (!session) {
      // Arrived by URL without joining → go through the join screen (asks username).
      this.router.navigate(['/join', code]);
      return;
    }
    this.socket.connect(session.code, session.token, session.role);
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }

  saveSubject(): void {
    const text = this.subjectDraft().trim();
    if (text) this.socket.setSubject(text);
  }

  act(): void {
    const value = this.chosenValue();
    if (value) this.socket.actResult(value);
  }

  copyCode(): void {
    navigator.clipboard?.writeText(this.code());
    this.messages.add({ severity: 'success', summary: this.transloco.translate('room.code_copied') });
  }

  shareLink(): void {
    const url = `${location.origin}/join/${this.code()}`;
    navigator.clipboard?.writeText(url);
    this.messages.add({ severity: 'success', summary: this.transloco.translate('room.link_copied') });
  }

  quit(): void {
    this.socket.disconnect();
    this.router.navigate(['/']);
  }

  private modeValue(): string | null {
    const counts = new Map<string, number>();
    for (const v of this.socket.revealedVotes()) counts.set(v.cardValue, (counts.get(v.cardValue) ?? 0) + 1);
    let best: string | null = null;
    let bestCount = -1;
    for (const [value, count] of counts) {
      if (count > bestCount) {
        best = value;
        bestCount = count;
      }
    }
    return best;
  }
}
