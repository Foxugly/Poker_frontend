import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslocoModule, ButtonModule, InputTextModule],
  styleUrl: './auth.scss',
  template: `
    <section class="auth">
      <i class="pi pi-sign-in auth__icon" aria-hidden="true"></i>
      <h1>{{ 'auth.login.title' | transloco }}</h1>
      <p class="lead">{{ 'auth.login.lead' | transloco }}</p>

      <div class="field">
        <label>{{ 'auth.email' | transloco }}</label>
        <input pInputText type="email" [(ngModel)]="email" autocomplete="email" />
      </div>
      <div class="field">
        <label>{{ 'auth.password' | transloco }}</label>
        <input pInputText type="password" [(ngModel)]="password" autocomplete="current-password" (keyup.enter)="submit()" />
      </div>

      @if (error()) { <p class="err">{{ error()! | transloco }}</p> }
      @if (needsConfirm()) {
        <p class="err">
          {{ 'auth.login.not_confirmed' | transloco }}
          <a (click)="resend()">{{ 'auth.login.resend' | transloco }}</a>
        </p>
      }

      <div class="actions">
        <p-button [label]="'auth.login.cta' | transloco" [loading]="busy()" (onClick)="submit()" styleClass="w-full" />
      </div>

      <div class="links">
        <a routerLink="/forgot-password">{{ 'auth.login.forgot' | transloco }}</a>
        <a routerLink="/auth/magic-link">{{ 'auth.login.magic' | transloco }}</a>
        <span>{{ 'auth.login.no_account' | transloco }} <a routerLink="/register">{{ 'auth.register.title' | transloco }}</a></span>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly needsConfirm = signal(false);

  async submit(): Promise<void> {
    this.error.set(null);
    this.needsConfirm.set(false);
    if (!this.email.trim() || !this.password) return;
    this.busy.set(true);
    try {
      await this.auth.login(this.email.trim().toLowerCase(), this.password);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
      this.router.navigateByUrl(returnUrl);
    } catch (e: unknown) {
      const status = (e as { status?: number }).status;
      const code = (e as { error?: { code?: string } }).error?.code;
      if (status === 403 && code === 'email_not_verified') this.needsConfirm.set(true);
      else this.error.set('auth.errors.invalid_credentials');
    } finally {
      this.busy.set(false);
    }
  }

  async resend(): Promise<void> {
    if (this.email.trim()) await this.auth.resendConfirmation(this.email.trim().toLowerCase());
    this.needsConfirm.set(false);
    this.error.set('auth.login.resent');
  }
}
