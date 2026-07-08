import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslocoModule, ButtonModule, InputTextModule],
  styleUrl: './auth.scss',
  template: `
    <section class="auth">
      @if (done()) {
        <h1>{{ 'auth.register.done_title' | transloco }}</h1>
        <p class="lead">{{ 'auth.register.done_lead' | transloco }}</p>
        <div class="links"><a routerLink="/login">{{ 'auth.login.cta' | transloco }}</a></div>
      } @else {
        <h1>{{ 'auth.register.title' | transloco }}</h1>
        <p class="lead">{{ 'auth.register.lead' | transloco }}</p>
        <div class="field">
          <label>{{ 'auth.display_name' | transloco }}</label>
          <input pInputText [(ngModel)]="displayName" autocomplete="nickname" />
        </div>
        <div class="field">
          <label>{{ 'auth.email' | transloco }}</label>
          <input pInputText type="email" [(ngModel)]="email" autocomplete="email" />
        </div>
        <div class="field">
          <label>{{ 'auth.password' | transloco }}</label>
          <input pInputText type="password" [(ngModel)]="password" autocomplete="new-password" />
          @if (submitted() && password.length < 8) { <p class="err">{{ 'auth.errors.password_short' | transloco }}</p> }
        </div>
        @if (error()) { <p class="err">{{ error()! | transloco }}</p> }
        <div class="actions">
          <p-button [label]="'auth.register.cta' | transloco" severity="success" [loading]="busy()" (onClick)="submit()" styleClass="w-full" />
        </div>
        <div class="links"><span>{{ 'auth.register.have_account' | transloco }} <a routerLink="/login">{{ 'auth.login.cta' | transloco }}</a></span></div>
      }
    </section>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  displayName = '';
  email = '';
  password = '';
  readonly busy = signal(false);
  readonly submitted = signal(false);
  readonly done = signal(false);
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.submitted.set(true);
    this.error.set(null);
    if (!this.email.trim() || this.password.length < 8) return;
    this.busy.set(true);
    try {
      await this.auth.register(this.email.trim().toLowerCase(), this.password, this.displayName.trim());
      this.done.set(true);
    } catch {
      this.error.set('auth.errors.generic');
    } finally {
      this.busy.set(false);
    }
  }
}
