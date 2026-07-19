import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../../core/auth/auth.service';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

/**
 * The signed-in user's account page: identity, display name, and the entry points
 * to the things attached to the account (subscription, teams).
 */
@Component({
  selector: 'app-me',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslocoModule, ButtonModule, InputTextModule, TagModule, PageHeaderComponent],
  styleUrl: './account.scss',
  template: `
    <section class="page page--narrow">
      <app-page-header [icon]="'pi-user'" [title]="'me.title' | transloco" />

      @if (auth.currentUser(); as user) {
        <div class="section">
          <h3>{{ 'me.identity' | transloco }}</h3>
          <dl class="kv">
            <dt>{{ 'auth.email' | transloco }}</dt>
            <dd>
              <span class="mono">{{ user.email }}</span>
              @if (user.email_confirmed) {
                <p-tag severity="success" [value]="'me.email_confirmed' | transloco" />
              } @else {
                <p-tag severity="warn" [value]="'me.email_unconfirmed' | transloco" />
              }
            </dd>
            @if (user.is_staff) {
              <dt>{{ 'me.role' | transloco }}</dt>
              <dd><p-tag severity="info" [value]="'me.staff' | transloco" /></dd>
            }
          </dl>
          <!-- The email is the account identifier: changing it is a re-verification
               flow, not a field edit, so it stays read-only here. -->
          <p class="meta-hint">{{ 'me.email_readonly' | transloco }}</p>
        </div>

        <div class="section">
          <h3>{{ 'me.display_name' | transloco }}</h3>
          <p class="meta-hint">{{ 'me.display_name_hint' | transloco }}</p>
          <div class="row">
            <input pInputText [ngModel]="displayName()" (ngModelChange)="displayName.set($event)" style="min-width:240px" (keyup.enter)="save()" />
            <p-button [label]="'action.save' | transloco" icon="pi pi-save"
                      [loading]="saving()" [disabled]="!dirty()" (onClick)="save()" />
          </div>
        </div>

        <div class="section">
          <h3>{{ 'me.account' | transloco }}</h3>
          <div class="row">
            <p-button [label]="'me.subscription_link' | transloco" icon="pi pi-credit-card"
                      [outlined]="true" severity="secondary" routerLink="/subscription" />
            <p-button [label]="'teams.title' | transloco" icon="pi pi-users"
                      [outlined]="true" severity="secondary" routerLink="/teams" />
          </div>
        </div>

        <div class="section">
          <p-button [label]="'auth.logout' | transloco" icon="pi pi-sign-out"
                    severity="danger" [outlined]="true" (onClick)="logout()" />
        </div>
      }
    </section>
  `,
})
export class MeComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);
  private messages = inject(MessageService);
  private transloco = inject(TranslocoService);

  readonly displayName = signal(this.auth.currentUser()?.display_name ?? '');
  readonly saving = signal(false);
  /** Only offer to save when the value actually changed. */
  readonly dirty = computed(() => {
    const v = this.displayName().trim();
    return v.length > 0 && v !== (this.auth.currentUser()?.display_name ?? '');
  });

  async save(): Promise<void> {
    const name = this.displayName().trim();
    if (!name) return;
    this.saving.set(true);
    try {
      await this.auth.updateProfile(name);
      this.messages.add({ severity: 'success', summary: this.transloco.translate('me.saved') });
    } catch {
      this.messages.add({ severity: 'error', summary: this.transloco.translate('auth.errors.generic') });
    } finally {
      this.saving.set(false);
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/home']);
  }
}
