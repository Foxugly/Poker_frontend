import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../../core/auth/auth.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

/**
 * Public topbar (§3.15), aligned on the QuizOnline layout: brand left → iconed nav
 * (with an accent "Support" link and an "About" dropdown) → actions right
 * (theme, 2-letter language, login/user).
 */
@Component({
  selector: 'app-topmenu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule, ButtonModule, LanguageSwitcherComponent, ThemeToggleComponent],
  host: { '(document:click)': 'closeMenus()' },
  template: `
    <header class="topbar">
      <a routerLink="/" class="brand">
        <i class="pi pi-th-large"></i>
        <span>{{ 'app.title' | transloco }}</span>
      </a>
      <nav class="nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          <i class="pi pi-home"></i>{{ 'nav.home' | transloco }}
        </a>
        <a routerLink="/features" routerLinkActive="active">
          <i class="pi pi-star"></i>{{ 'nav.features' | transloco }}
        </a>
        <a routerLink="/support" routerLinkActive="active" class="accent">
          <i class="pi pi-heart"></i>{{ 'nav.support' | transloco }}
        </a>
        <div class="menu" #aboutRoot>
          <button type="button" class="nav-btn" (click)="toggleAbout($event)" [attr.aria-expanded]="aboutOpen()">
            <i class="pi pi-info-circle"></i>{{ 'nav.about' | transloco }}<i class="pi pi-angle-down caret"></i>
          </button>
          @if (aboutOpen()) {
            <div class="dropdown" (click)="$event.stopPropagation()">
              <a class="dropdown-item" routerLink="/about/company" (click)="closeMenus()">
                <i class="pi pi-building"></i>{{ 'about.tab_company' | transloco }}
              </a>
              <a class="dropdown-item" routerLink="/about/legal" (click)="closeMenus()">
                <i class="pi pi-file"></i>{{ 'about.tab_legal' | transloco }}
              </a>
              <a class="dropdown-item" routerLink="/about/technical" (click)="closeMenus()">
                <i class="pi pi-cog"></i>{{ 'about.tab_technical' | transloco }}
              </a>
            </div>
          }
        </div>
        @if (auth.isAuthenticated()) {
          <a routerLink="/teams" routerLinkActive="active">
            <i class="pi pi-users"></i>{{ 'nav.teams' | transloco }}
          </a>
        }
      </nav>
      <div class="actions">
        <app-theme-toggle />
        <app-language-switcher />
        @if (auth.isAuthenticated()) {
          <span class="user"><i class="pi pi-user"></i>{{ auth.currentUser()?.display_name || auth.currentUser()?.email }}</span>
          <p-button icon="pi pi-sign-out" [text]="true" [rounded]="true" severity="secondary"
                    [ariaLabel]="'auth.logout' | transloco" (onClick)="logout()" />
        } @else {
          <a routerLink="/login" class="signin"><i class="pi pi-sign-in"></i>{{ 'auth.login.cta' | transloco }}</a>
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
        align-items: center;
        gap: var(--s-4);
        flex: 1;
      }
      .nav a,
      .nav-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #cbd5e1;
        text-decoration: none;
        font-size: 0.95rem;
        background: transparent;
        border: 0;
        cursor: pointer;
        padding: 0;
        font-family: inherit;
      }
      .nav a i,
      .nav-btn i {
        font-size: 0.85rem;
      }
      .nav a.active,
      .nav a:hover,
      .nav-btn:hover {
        color: var(--fox-primary);
      }
      .nav a.accent {
        color: var(--fox-primary);
        font-weight: 600;
      }
      .nav a.accent:hover {
        filter: brightness(1.15);
      }
      .menu {
        position: relative;
        display: flex;
      }
      .caret {
        font-size: 0.7rem !important;
      }
      .dropdown {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        min-width: 190px;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        padding: 6px;
        z-index: 40;
        display: flex;
        flex-direction: column;
      }
      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        color: #e2e8f0;
        text-decoration: none;
        font-size: 0.9rem;
      }
      .dropdown-item i {
        color: var(--fox-primary);
        font-size: 0.85rem;
      }
      .dropdown-item:hover {
        background: #334155;
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
        display: flex;
        align-items: center;
        gap: 6px;
        color: #fff;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 600;
        padding: 6px 14px;
        border: 1px solid var(--fox-primary);
        border-radius: 999px;
      }
      .signin i {
        color: var(--fox-primary);
        font-size: 0.8rem;
      }
      .signin:hover {
        background: var(--fox-primary);
        color: #05261c;
      }
      .signin:hover i {
        color: #05261c;
      }
      @media (max-width: 720px) {
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

  @ViewChild('aboutRoot') private aboutRoot?: ElementRef<HTMLElement>;
  readonly aboutOpen = signal(false);

  toggleAbout(event: MouseEvent): void {
    event.stopPropagation();
    this.aboutOpen.update((v) => !v);
  }

  closeMenus(): void {
    this.aboutOpen.set(false);
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
