import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { RoomApiService } from '../../core/api/room-api.service';
import { IdentityService } from '../../core/identity/identity.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, TranslocoModule, ButtonModule, InputTextModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private api = inject(RoomApiService);
  private identity = inject(IdentityService);
  private router = inject(Router);
  private messages = inject(MessageService);

  readonly username = signal(this.identity.username);
  readonly title = signal('');
  readonly creating = signal(false);
  readonly submitted = signal(false);

  createRoom(): void {
    this.submitted.set(true);
    const name = this.username().trim();
    if (!name) return;
    this.identity.username = name;
    this.creating.set(true);
    this.api.createRoom(name, this.title().trim()).subscribe({
      next: (res) => {
        this.identity.saveSession({ code: res.code, token: res.participantToken, role: res.role });
        this.router.navigate(['/room', res.code]);
      },
      error: () => {
        this.creating.set(false);
        this.messages.add({ severity: 'error', summary: 'errors.create_room' });
      },
    });
  }

  goJoin(): void {
    this.router.navigate(['/join']);
  }
}
