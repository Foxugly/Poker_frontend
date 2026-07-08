import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslocoModule, ButtonModule, InputTextModule],
  styleUrl: './auth.scss',
  template: `
    <section class="auth">
      <h1>{{ 'auth.reset.title' | transloco }}</h1>
      @if (done()) {
        <p class="lead ok">{{ 'auth.reset.done' | transloco }}</p>
        <div class="links"><a routerLink="/login">{{ 'auth.login.cta' | transloco }}</a></div>
      } @else {
        <div class="field">
          <label>{{ 'auth.new_password' | transloco }}</label>
          <input pInputText type="password" [(ngModel)]="password" autocomplete="new-password" (keyup.enter)="submit()" />
          @if (submitted() && password.length < 8) { <p class="err">{{ 'auth.errors.password_short' | transloco }}</p> }
        </div>
        @if (error()) { <p class="err">{{ error()! | transloco }}</p> }
        <div class="actions">
          <p-button [label]="'auth.reset.cta' | transloco" [loading]="busy()" (onClick)="submit()" styleClass="w-full" />
        </div>
      }
    </section>
  `,
})
export class ResetPasswordComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private uid = '';
  private token = '';
  password = '';
  readonly busy = signal(false);
  readonly submitted = signal(false);
  readonly done = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.uid = this.route.snapshot.paramMap.get('uid') ?? '';
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    this.error.set(null);
    if (this.password.length < 8) return;
    this.busy.set(true);
    try {
      await this.auth.resetPassword(this.uid, this.token, this.password);
      this.done.set(true);
    } catch {
      this.error.set('auth.errors.reset_invalid');
    } finally {
      this.busy.set(false);
    }
  }
}
