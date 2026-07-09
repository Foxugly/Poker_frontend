import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';

import { AuthService } from '../../../core/auth/auth.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

/**
 * Public topbar, mirroring the QuizOnline layout (§3.15): a 3-column grid
 * (brand · centered pill nav · right actions) over a dark gradient. Nav items are
 * pill links with icons; "Support" is an accent pill; "About" links to the single
 * tabbed page. Collapses to a hamburger menu on narrow screens.
 */
@Component({
  selector: 'app-topmenu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule, ButtonModule, LanguageSwitcherComponent, ThemeToggleComponent],
  host: { '(document:click)': 'closeMobile($event)' },
  template: `
    <header class="topbar" #root>
      <div class="topbar__inner" [class.open]="mobileOpen()">
        <a routerLink="/" class="brand">
          <span class="brand__mark"><i class="pi pi-th-large"></i></span>
          <span class="brand__name">{{ 'app.title' | transloco }}</span>
        </a>

        <button class="topbar__toggle" type="button" [attr.aria-expanded]="mobileOpen()"
                aria-label="Menu" (click)="toggleMobile($event)">
          <i class="pi" [class.pi-bars]="!mobileOpen()" [class.pi-times]="mobileOpen()"></i>
        </button>

        <nav class="nav">
          <a class="nav__link" routerLink="/" routerLinkActive="nav__link--active" [routerLinkActiveOptions]="{ exact: true }">
            <i class="pi pi-home"></i>{{ 'nav.home' | transloco }}
          </a>
          <a class="nav__link" routerLink="/features" routerLinkActive="nav__link--active">
            <i class="pi pi-star"></i>{{ 'nav.features' | transloco }}
          </a>
          <a class="nav__link nav__link--accent" routerLink="/support" routerLinkActive="nav__link--active">
            <i class="pi pi-heart"></i>{{ 'nav.support' | transloco }}
          </a>
          <a class="nav__link" routerLink="/about" routerLinkActive="nav__link--active">
            <i class="pi pi-info-circle"></i>{{ 'nav.about' | transloco }}
          </a>
          @if (auth.isAuthenticated()) {
            <a class="nav__link" routerLink="/teams" routerLinkActive="nav__link--active">
              <i class="pi pi-users"></i>{{ 'nav.teams' | transloco }}
            </a>
          }
        </nav>

        <div class="topbar__actions">
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
      </div>
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
        position: sticky;
        top: 0;
        z-index: 50;
      }
      .topbar {
        background: linear-gradient(135deg, rgba(8, 47, 73, 0.98), rgba(15, 23, 42, 0.98)),
          linear-gradient(90deg, rgba(56, 189, 248, 0.18), rgba(16, 185, 129, 0.12));
        border-bottom: 1px solid rgba(148, 163, 184, 0.22);
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
        color: #f8fafc;
      }
      .topbar__inner {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 0 0.85rem;
        max-width: 1440px;
        margin: 0 auto;
        min-height: 60px;
        padding: 0.45rem 1.1rem;
        box-sizing: border-box;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 0.7rem;
        color: #fff;
        text-decoration: none;
      }
      .brand__mark {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .brand__mark i {
        color: var(--fox-primary);
        font-size: 1.1rem;
      }
      .brand__name {
        font-size: 1.1rem;
        font-weight: 700;
        letter-spacing: 0.02em;
      }
      .topbar__toggle {
        display: none;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #f8fafc;
        cursor: pointer;
      }
      .nav {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 0.1rem;
      }
      .nav__link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid transparent;
        border-radius: 999px;
        color: rgba(226, 232, 240, 0.88);
        font-size: 0.9rem;
        font-weight: 600;
        padding: 0.45rem 0.75rem;
        text-decoration: none;
        transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;
      }
      .nav__link i {
        font-size: 0.82rem;
      }
      .nav__link:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.14);
        color: #fff;
        transform: translateY(-1px);
      }
      .nav__link--active {
        background: rgba(255, 255, 255, 0.14);
        border-color: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
      .nav__link--accent {
        background: linear-gradient(135deg, #22c55e, #14b8a6);
        border-color: transparent;
        color: #052e16;
      }
      .nav__link--accent:hover,
      .nav__link--accent.nav__link--active {
        background: linear-gradient(135deg, #4ade80, #2dd4bf);
        color: #052e16;
      }
      .topbar__actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.6rem;
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
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #fff;
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 600;
        padding: 0.45rem 0.9rem;
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

      @media (max-width: 960px) {
        .topbar__inner {
          grid-template-columns: 1fr auto;
        }
        .topbar__toggle {
          display: inline-flex;
        }
        .nav,
        .topbar__actions {
          display: none;
          grid-column: 1 / -1;
        }
        .topbar__inner.open {
          row-gap: 0.85rem;
        }
        .topbar__inner.open .nav {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 0.25rem;
          background: rgba(15, 23, 42, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          padding: 0.75rem;
        }
        .topbar__inner.open .nav__link {
          justify-content: flex-start;
        }
        .topbar__inner.open .topbar__actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-start;
          gap: 0.55rem;
          padding: 0 0.25rem 0.5rem;
        }
      }
    `,
  ],
})
export class TopmenuComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  @ViewChild('root') private root?: ElementRef<HTMLElement>;
  readonly mobileOpen = signal(false);

  toggleMobile(event: MouseEvent): void {
    event.stopPropagation();
    this.mobileOpen.update((v) => !v);
  }

  closeMobile(event: Event): void {
    if (this.root && !this.root.nativeElement.contains(event.target as Node)) {
      this.mobileOpen.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigateByUrl('/');
    this.mobileOpen.set(false);
  }
}
