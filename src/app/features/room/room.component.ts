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
import { RoundState } from '../../core/realtime/protocol';
import { DelegationDeckComponent } from '../../shared/ui/delegation-deck/delegation-deck.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

const BADGE_SEVERITY: Record<RoundState, 'secondary' | 'success' | 'warn' | 'info'> = {
  idle: 'secondary',
  open: 'success',
  revealed: 'warn',
  acted: 'info',
};

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    FormsModule, TranslocoModule, ButtonModule, InputTextModule, SelectModule, TagModule,
    PageHeaderComponent, DelegationDeckComponent,
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
  readonly revealedByParticipant = computed(() => {
    const map = new Map<string, string>();
    for (const v of this.socket.revealedVotes()) map.set(v.participantId, v.cardValue);
    return map;
  });

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
