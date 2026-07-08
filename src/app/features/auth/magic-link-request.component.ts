import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-magic-link-request',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslocoModule, ButtonModule, InputTextModule],
  styleUrl: './auth.scss',
  template: `
    <section class="auth">
      <h1>{{ 'auth.magic.title' | transloco }}</h1>
      @if (sent()) {
        <p class="lead ok">{{ 'auth.magic.sent' | transloco }}</p>
        <div class="links"><a routerLink="/login">{{ 'auth.back_to_login' | transloco }}</a></div>
      } @else {
        <p class="lead">{{ 'auth.magic.lead' | transloco }}</p>
        <div class="field">
          <label>{{ 'auth.email' | transloco }}</label>
          <input pInputText type="email" [(ngModel)]="email" autocomplete="email" (keyup.enter)="submit()" />
        </div>
        <div class="actions">
          <p-button [label]="'auth.magic.cta' | transloco" [loading]="busy()" (onClick)="submit()" styleClass="w-full" />
        </div>
        <div class="links"><a routerLink="/login">{{ 'auth.back_to_login' | transloco }}</a></div>
      }
    </section>
  `,
})
export class MagicLinkRequestComponent {
  private auth = inject(AuthService);
  email = '';
  readonly busy = signal(false);
  readonly sent = signal(false);

  async submit(): Promise<void> {
    if (!this.email.trim()) return;
    this.busy.set(true);
    try {
      await this.auth.requestMagicLink(this.email.trim().toLowerCase());
      this.sent.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
