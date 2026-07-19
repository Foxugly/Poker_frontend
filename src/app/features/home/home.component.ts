import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { FreeCatalogue, RoomApiService } from '../../core/api/room-api.service';
import { IdentityService } from '../../core/identity/identity.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, TranslocoModule, ButtonModule, InputTextModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private api = inject(RoomApiService);
  private identity = inject(IdentityService);
  private router = inject(Router);
  private messages = inject(MessageService);
  private transloco = inject(TranslocoService);

  readonly username = signal(this.identity.username);
  readonly title = signal('');
  readonly creating = signal(false);

  // Free-room deck/back pick. With no team to hold it, the choice is made here and
  // frozen into the room at creation. Empty = the server's own free default.
  readonly catalogue = signal<FreeCatalogue | null>(null);
  readonly deckIds = signal<number[]>([]);
  readonly cardBackId = signal<number | null>(null);
  readonly submitted = signal(false);

  // Join (inline on the home, both actions in evidence).
  readonly joinCode = signal('');
  readonly joinName = signal(this.identity.username);
  readonly joining = signal(false);
  readonly joinSubmitted = signal(false);

  constructor() {
    // Best-effort: a failed catalogue just hides the pickers, it must never block
    // creating a room.
    this.api.freeCatalogue().subscribe({
      next: (cat) => {
        this.catalogue.set(cat);
        if (cat.decks.length) this.deckIds.set([cat.decks[0].id]);
      },
      error: () => this.catalogue.set(null),
    });
  }

  isDeckPicked(id: number): boolean {
    return this.deckIds().includes(id);
  }

  toggleDeck(id: number): void {
    const next = this.isDeckPicked(id)
      ? this.deckIds().filter((x) => x !== id)
      : [...this.deckIds(), id];
    // Never end up with nothing: the last one stays selected.
    if (next.length) this.deckIds.set(next);
  }

  createRoom(): void {
    this.submitted.set(true);
    const name = this.username().trim();
    if (!name) return;
    this.identity.username = name;
    this.creating.set(true);
    this.api
      .createRoom(name, this.title().trim(), undefined, {
        deckIds: this.deckIds(),
        cardBackId: this.cardBackId(),
      })
      .subscribe({
      next: (res) => {
        this.identity.saveSession({ code: res.code, token: res.participantToken, role: res.role });
        this.router.navigate(['/room', res.code]);
      },
      error: () => {
        this.creating.set(false);
        this.messages.add({ severity: 'error', summary: this.transloco.translate('errors.create_room') });
      },
    });
  }

  onJoinCode(value: string): void {
    this.joinCode.set(value.toUpperCase());
  }

  joinRoom(): void {
    this.joinSubmitted.set(true);
    const name = this.joinName().trim();
    const code = this.joinCode().trim().toUpperCase();
    if (!name || !code) return;
    this.identity.username = name;
    this.joining.set(true);
    this.api.joinRoom(code, name).subscribe({
      next: (res) => {
        this.identity.saveSession({ code: res.code, token: res.participantToken, role: res.role });
        this.router.navigate(['/room', res.code]);
      },
      error: (err) => {
        this.joining.set(false);
        const key = err?.error?.code === 'room_full' ? 'errors.room_full' : 'errors.room_not_found';
        this.messages.add({ severity: 'error', summary: this.transloco.translate(key) });
      },
    });
  }
}
