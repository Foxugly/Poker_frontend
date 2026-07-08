import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../../core/auth/auth.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

/**
 * Public topbar (§3.15): dark, brand left → nav center → actions right.
 * Action order is fixed: theme → language (→ user, authenticated-only = Phase 2).
 */
@Component({
  selector: 'app-topmenu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule, ButtonModule, LanguageSwitcherComponent, ThemeToggleComponent],
  template: `
    <header class="topbar">
      <a routerLink="/" class="brand">
        <i class="pi pi-th-large"></i>
        <span>{{ 'app.title' | transloco }}</span>
      </a>
      <nav class="nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          {{ 'nav.home' | transloco }}
        </a>
        <a routerLink="/features" routerLinkActive="active">{{ 'nav.features' | transloco }}</a>
      </nav>
      <div class="actions">
        <app-theme-toggle />
        <app-language-switcher />
        @if (auth.isAuthenticated()) {
          <span class="user"><i class="pi pi-user"></i>{{ auth.currentUser()?.display_name || auth.currentUser()?.email }}</span>
          <p-button icon="pi pi-sign-out" [text]="true" [rounded]="true" severity="secondary"
                    [ariaLabel]="'auth.logout' | transloco" (onClick)="logout()" />
        } @else {
          <a routerLink="/login" class="signin">{{ 'auth.login.cta' | transloco }}</a>
        }
      </div>
    </header>
  `,
  styles: [
    `
      .topbar {
        display: flex;
        align-items: center;
        gap: var(--s-6);
        padding: var(--s-3) var(--s-4);
        background: #0f172a;
        color: #e2e8f0;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: var(--s-2);
        font-weight: 700;
        color: #fff;
        text-decoration: none;
      }
      .brand i {
        color: var(--fox-primary);
      }
      .nav {
        display: flex;
        gap: var(--s-4);
        flex: 1;
      }
      .nav a {
        color: #cbd5e1;
        text-decoration: none;
        font-size: 0.95rem;
      }
      .nav a.active,
      .nav a:hover {
        color: var(--fox-primary);
      }
      .actions {
        display: flex;
        align-items: center;
        gap: var(--s-2);
      }
      .user {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #cbd5e1;
        font-size: 0.9rem;
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .user i {
        color: var(--fox-primary);
      }
      .signin {
        color: var(--fox-primary);
        text-decoration: none;
        font-size: 0.95rem;
      }
      .signin:hover {
        text-decoration: underline;
      }
      @media (max-width: 640px) {
        .nav {
          display: none;
        }
      }
    `,
  ],
})
export class TopmenuComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
