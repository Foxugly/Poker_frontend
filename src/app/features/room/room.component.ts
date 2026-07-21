import { Component, computed, DestroyRef, effect, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { RoomApiService } from '../../core/api/room-api.service';
import { LanguageService } from '../../core/i18n/language.service';
import { IdentityService } from '../../core/identity/identity.service';
import { secondsLeft } from '../../core/realtime/countdown';
import { RoomSocketService } from '../../core/realtime/room-socket.service';
import { RoundState, SnapshotCard } from '../../core/realtime/protocol';
import { DelegationCardComponent } from '../../shared/ui/delegation-card/delegation-card.component';
import { DelegationDeckComponent } from '../../shared/ui/delegation-deck/delegation-deck.component';

const BADGE_SEVERITY: Record<RoundState, 'secondary' | 'success' | 'warn' | 'info'> = {
  idle: 'secondary',
  open: 'success',
  revealed: 'warn',
  acted: 'info',
};

/** Admissible round-timer durations (contract §timer): 10-60s, step 5 — a discrete
 * picker so the UI can never compose an off-grid value (the server normalises anyway). */
const TIMER_DURATIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

/** Angles (from the top, clockwise) for `n` seats spaced by equal ARC LENGTH on an
 * ellipse of radii (rx, ry). Equal angle steps would crowd the wide sides; equal
 * arc keeps neighbours a uniform distance apart so their cards never overlap. */
function arcEvenAngles(n: number, rx: number, ry: number): number[] {
  if (n <= 0) return [];
  const STEPS = 1440;
  const start = -Math.PI / 2;
  const cum: number[] = [0];
  let prevX = rx * Math.cos(start);
  let prevY = ry * Math.sin(start);
  for (let s = 1; s <= STEPS; s++) {
    const t = start + (s / STEPS) * 2 * Math.PI;
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);
    cum.push(cum[s - 1] + Math.hypot(x - prevX, y - prevY));
    prevX = x;
    prevY = y;
  }
  const total = cum[STEPS];
  const angles: number[] = [];
  for (let i = 0; i < n; i++) {
    const target = (i / n) * total;
    let k = 1;
    while (k < cum.length && cum[k] < target) k++;
    const a = cum[k - 1];
    const b = cum[k] ?? a;
    const f = b > a ? (target - a) / (b - a) : 0;
    angles.push(start + ((k - 1 + f) / STEPS) * 2 * Math.PI);
  }
  return angles;
}

interface Seat {
  participantId: string;
  username: string;
  role: string;
  // Radial layout (same angle from the table centre): the card sits near the table,
  // the person (avatar + name) further out. All in % of the felt container.
  cardX: number;
  cardY: number;
  personX: number;
  personY: number;
  card: SnapshotCard | null; // back placeholder, or the actual card once revealed nominatively
  show: boolean; // whether the seat has a card (voted) at all
  revealed: boolean; // face up — nominative reveal only
}

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    FormsModule, TranslocoModule, ButtonModule, InputNumberModule, InputTextModule, SelectModule, TagModule, ToggleSwitchModule,
    DelegationDeckComponent, DelegationCardComponent,
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
  private roomApi = inject(RoomApiService);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('roomEl') private roomEl?: ElementRef<HTMLElement>;
  readonly code = signal('');
  readonly isFullscreen = signal(false);
  readonly subjectDraft = signal('');
  readonly chosenValue = signal<string | null>(null);
  readonly lang = this.language.active;

  // --- Round timer (contract §timer): the countdown is purely cosmetic, the
  // interval only runs while a deadline exists and stops on reveal/destroy.
  readonly remainingSeconds = signal<number | null>(null);
  readonly timerEnabledDraft = signal(false);
  readonly timerSecondsDraft = signal(TIMER_DURATIONS[0]);
  private countdownHandle: ReturnType<typeof setInterval> | null = null;

  // Two-step round flow. The panel is a *form*: while idle the facilitator composes
  // the round (subject + deck + reveal mode + timer) as local drafts, then step 1
  // ("Préparer") announces it atomically, and step 2 ("Lancer") opens it. Nothing
  // hits the server per-keystroke, so a setting can't be rejected out of order (that
  // was the "toggle nominative → error" bug).
  readonly deckDraft = signal<number | null>(null);
  readonly anonymousDraft = signal(false);
  /** Forces the compose step back on for an already-announced round ("Modifier"). */
  readonly editing = signal(false);

  readonly isFacilitator = computed(() => this.socket.myRole() === 'facilitator');
  readonly state = this.socket.roundState;
  readonly badgeSeverity = computed(() => BADGE_SEVERITY[this.state()]);
  readonly canOpen = computed(() => this.state() === 'idle' && this.socket.subject().trim().length > 0);
  readonly canReveal = computed(() => this.state() === 'open' && this.socket.participation().voted >= 1);
  readonly votable = computed(() => this.state() === 'open');

  // Team appearance (P2.6): felt recolours the table, card-back colours the face-down cards.
  // Appearance: each surface says whether it renders a colour or an image. The
  // legacy theme.* is the fallback while older snapshots are still around.
  readonly feltColor = computed(
    () => this.socket.deckSnapshot()?.felt?.color ?? this.socket.deckSnapshot()?.theme?.feltColor ?? null,
  );
  readonly feltImage = computed(() => {
    const felt = this.socket.deckSnapshot()?.felt;
    return felt?.style === 'image' && felt.image ? `url(${felt.image})` : null;
  });
  readonly cardBackColor = computed(
    () => this.socket.deckSnapshot()?.cardBack?.color ?? this.socket.deckSnapshot()?.theme?.cardBackColor ?? null,
  );
  /** Null when the team chose a flat colour: the card then shows the colour alone. */
  readonly cardBackImage = computed(() => {
    const back = this.socket.deckSnapshot()?.cardBack;
    return back?.style === 'image' ? back.image : null;
  });

  // Multi-deck rooms: the room freezes every poker type the team enabled and the
  // facilitator switches between rounds. The server refuses a switch while a round
  // is in flight (cast votes reference the current deck's values); the control
  // mirrors that rather than letting the user hit an error.
  readonly availableDecks = computed(() => this.socket.availableDecks());
  readonly currentDeckId = computed(() => this.socket.deckSnapshot()?.deckId ?? null);
  readonly canSwitchDeck = computed(() => this.state() === 'idle' || this.state() === 'acted');
  readonly deckOptions = computed(() =>
    this.availableDecks().map((d) => ({
      value: d.deckId,
      label: this.transloco.translate(`room.deck.type.${d.voteType}`),
    })),
  );

  // Reveal mode: composed in the form (a local draft), applied atomically at prepare.
  // Voters are told the mode before they play (it's announced when the round is
  // prepared), so it never flips under cast votes.
  readonly canSetRevealMode = computed(() => this.state() === 'idle');
  /** While a vote is open the whole facilitator panel is frozen: settings mustn't
   * change under people who are voting. */
  readonly panelFrozen = computed(() => this.state() === 'open');

  // Two-step panel: idle shows the compose form until a round is announced, then the
  // launch step. A fresh room (no subject yet) always starts on the compose form.
  readonly showComposeForm = computed(
    () => this.state() === 'idle' && (this.editing() || this.socket.subject().trim().length === 0),
  );
  readonly showPrepared = computed(() => this.state() === 'idle' && !this.showComposeForm());
  readonly canPrepare = computed(() => this.subjectDraft().trim().length > 0);

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

  /** Localized unit shown inside the timer input (e.g. " sec"). Depends on lang()
   * so it re-resolves when the language switches. */
  readonly timerSuffix = computed(() => {
    this.lang();
    return this.transloco.translate('room.timer.sec_suffix');
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
  /** Seats laid out around the table (ellipse), each carrying its card state:
   * empty (not voted) → back (voted, hidden) → face up, but ONLY once the round is
   * revealed in nominative mode. In anonymous mode the seat stays face-down forever:
   * the server sends no participant -> card link, so there is nothing to flip, and
   * the per-value decompte (`socket.voteTally`) is what surfaces the values. */
  readonly seats = computed<Seat[]>(() => {
    const participants = this.socket.participants();
    const deck = this.socket.deckSnapshot();
    const votedIds = new Set(this.socket.participation().votedIds);
    const nominative = !this.socket.revealMode().anonymous;
    const revealedRound = this.state() === 'revealed' || this.state() === 'acted';
    const voteByParticipant = new Map(
      this.socket.nominativeVotes().map((v) => [v.participantId, v.cardValue]),
    );
    const n = participants.length;
    // Positions are in % of a wide box, so equal % radii give unequal pixel gaps
    // (side seats end up far, top/bottom seats close). Derive the card radii from
    // a single target gap in % of table HEIGHT, dividing the horizontal one by the
    // table's aspect — so the avatar→card gap is uniform whatever the angle.
    // NB: keep this aspect formula in sync with feltAspect() — the geometry here
    // must match the shape the felt is actually drawn at. The table is kept fairly
    // round (cap 2.3): a flatter table leaves too little vertical room and the two
    // stacked side cards collide. gap 24 + a slightly smaller card keep a clear gap
    // between neighbouring cards AND between an avatar and its card for 3–20 seats
    // (verified: card→card ≥ 6.8px, avatar→card ≥ 13px across that range).
    const aspect = Math.min(2.3, 1.6 + n * 0.05);
    const personR = 49;
    const gap = 24;
    const cardRx = personR - gap / aspect;
    const cardRy = personR - gap;
    // Even angle steps bunch seats on the wide sides (where the ellipse turns
    // fast), so cards there overlap. Space them by equal ARC LENGTH instead — a
    // uniform visual gap between neighbours. Angles are measured on the avatar
    // ellipse (x-radius scaled by the aspect to work in a square metric).
    const seatAngles = arcEvenAngles(n, personR * aspect, personR);
    return participants.map((p, i) => {
      const angle = seatAngles[i];
      const hasVoted = p.hasVoted || votedIds.has(p.participantId);
      const ownVote = voteByParticipant.get(p.participantId);
      const faceUp = revealedRound && nominative && ownVote !== undefined;
      const card = faceUp
        ? this.cardByValue(ownVote!)
        : hasVoted && deck
          ? deck.cards[0] // back placeholder only
          : null;
      const cx = Math.cos(angle);
      const sy = Math.sin(angle);
      return {
        participantId: p.participantId,
        username: p.username,
        role: p.role,
        // Card a uniform pixel gap inside the avatar, along the same radial.
        cardX: 50 + cardRx * cx,
        cardY: 50 + cardRy * sy,
        personX: 50 + personR * cx,
        personY: 50 + personR * sy,
        card,
        show: hasVoted,
        revealed: faceUp,
      };
    });
  });

  /** The table grows wider with more players (kept short via a rising aspect ratio),
   * bounded for up to 20 participants; seat cards shrink as the table fills. */
  readonly feltWidth = computed(() => Math.min(760, 380 + this.socket.participants().length * 22));
  // Must match the `aspect` in seats() so the seat geometry lands on the real felt shape.
  readonly feltAspect = computed(() => Math.min(2.3, 1.6 + this.socket.participants().length * 0.05).toFixed(2));
  readonly seatCardWidth = computed(() => Math.round(Math.max(24, 46 - this.socket.participants().length * 1.1)));

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
    // Countdown display: (re)start the 1s ticker only while a deadline exists.
    // Purely cosmetic — it never triggers a reveal, the server does (reason
    // "timeout" or "facilitator", both just followed via vote.revealed).
    effect(() => {
      const deadline = this.socket.deadline();
      this.stopCountdown();
      if (deadline) {
        this.remainingSeconds.set(secondsLeft(deadline));
        this.countdownHandle = setInterval(() => this.remainingSeconds.set(secondsLeft(this.socket.deadline())), 1000);
      } else {
        this.remainingSeconds.set(null);
      }
    });
    // Keep the facilitator's draft controls in sync with the server-authoritative
    // timer setting (also reflects another facilitator's change, or normalisation).
    effect(() => {
      const t = this.socket.timer();
      this.timerEnabledDraft.set(t.enabled);
      this.timerSecondsDraft.set(t.seconds);
    });
    this.destroyRef.onDestroy(() => this.stopCountdown());
  }

  private stopCountdown(): void {
    if (this.countdownHandle) {
      clearInterval(this.countdownHandle);
      this.countdownHandle = null;
    }
  }

  /** Display names of the voters who picked a value — nominative rounds only. */
  votersFor(cardValue: string): string {
    const byId = new Map(this.socket.participants().map((p) => [p.participantId, p.username]));
    return this.socket
      .nominativeVotes()
      .filter((v) => v.cardValue === cardValue)
      .map((v) => byId.get(v.participantId) ?? '?')
      .join(', ');
  }

  // The compose controls only touch local drafts now; nothing is sent until prepare().
  onRevealModeChange(anonymous: boolean): void {
    this.anonymousDraft.set(anonymous);
  }

  onDeckChange(deckId: number): void {
    this.deckDraft.set(deckId);
  }

  onTimerEnabledChange(enabled: boolean): void {
    this.timerEnabledDraft.set(enabled);
  }

  onTimerSecondsChange(seconds: number | null): void {
    if (seconds == null || Number.isNaN(seconds)) return;
    this.timerSecondsDraft.set(seconds);
  }

  /** The detail drafts, as a prepareRound payload fragment. */
  private roundDetails() {
    return {
      deckId: (this.deckDraft() ?? this.currentDeckId()) ?? undefined,
      anonymous: this.socket.revealMode().canAnonymise ? this.anonymousDraft() : undefined,
      timerEnabled: this.timerEnabledDraft(),
      timerSeconds: this.timerSecondsDraft(),
    };
  }

  /** Step 1: announce the composed round (subject + details) — stays idle. */
  prepare(): void {
    const text = this.subjectDraft().trim();
    if (!text) return;
    this.socket.prepareRound({ subjectText: text, ...this.roundDetails() });
    this.editing.set(false);
  }

  /** Pick a queued agenda subject and announce it with the current details. */
  selectAgenda(subjectId: number): void {
    this.socket.prepareRound({ subjectId, ...this.roundDetails() });
    this.editing.set(false);
  }

  /** Step 2: open the announced round for voting. */
  launch(): void {
    this.socket.openVote();
  }

  /** Re-open the compose step for an announced round, pre-filled from what's live. */
  enterCompose(): void {
    this.subjectDraft.set(this.socket.subject());
    this.deckDraft.set(this.currentDeckId());
    this.anonymousDraft.set(this.socket.revealMode().anonymous);
    this.editing.set(true);
  }

  /** Queue the typed subject onto the agenda without opening it (multi-subject prep). */
  queueSubject(): void {
    const text = this.subjectDraft().trim();
    if (!text) return;
    this.socket.addSubject(text);
    this.subjectDraft.set('');
  }

  async ngOnInit(): Promise<void> {
    document.addEventListener('fullscreenchange', this.onFsChange);
    const code = (this.route.snapshot.paramMap.get('code') ?? '').toUpperCase();
    this.code.set(code);
    const session = this.identity.sessionFor(code);
    if (session) {
      this.socket.connect(session.code, session.token, session.role);
      return;
    }
    // No local session: resolve the room. A team room auto-joins an authenticated
    // member (no username prompt); an anonymous room goes through /join.
    try {
      const info = await firstValueFrom(this.roomApi.roomExists(code));
      if (!info.exists) return this.router.navigate(['/join', code]) as unknown as void;
      if (info.isTeam) {
        if (!this.auth.isAuthenticated()) {
          this.router.navigate(['/login'], { queryParams: { returnUrl: `/room/${code}` } });
          return;
        }
        const res = await firstValueFrom(this.roomApi.joinRoom(code, ''));
        this.identity.saveSession({ code: res.code, token: res.participantToken, role: res.role });
        this.socket.connect(res.code, res.participantToken, res.role);
      } else {
        this.router.navigate(['/join', code]);
      }
    } catch {
      this.router.navigate(['/join', code]);
    }
  }

  transfer(participantId: string): void {
    this.socket.transferFacilitator(participantId);
  }

  private readonly onFsChange = () => this.isFullscreen.set(!!document.fullscreenElement);

  async toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      // Fullscreen the room only (no top menu / footer) so nothing scrolls.
      else await this.roomEl?.nativeElement.requestFullscreen();
    } catch {
      /* fullscreen may be blocked; ignore */
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.onFsChange);
    this.socket.disconnect();
  }

  /** Resolve an agenda item's retained value to its translated level name (not the number). */
  agendaResultName(value: string): string {
    return this.cardName(this.cardByValue(value)) || value;
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
    let best: string | null = null;
    let bestCount = -1;
    for (const { cardValue, count } of this.socket.voteTally()) {
      if (count > bestCount) {
        best = cardValue;
        bestCount = count;
      }
    }
    return best;
  }
}
