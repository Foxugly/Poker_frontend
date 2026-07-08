import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { getRuntimeConfig } from '../runtime-config';
import { AuthUser, TokenPair } from './auth.models';

const ACCESS_KEY = 'poker.access';
const REFRESH_KEY = 'poker.refresh';

/**
 * Email-only authentication (Phase 2). Tokens live in localStorage; the rotated
 * refresh token MUST be persisted on every refresh (the backend blacklists the
 * old one — fleet JWT-rotation rule). `currentUser` is a signal the UI reacts to.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = getRuntimeConfig().apiBaseUrl + '/api/auth';

  readonly currentUser = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  get accessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }
  get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  private storeTokens(access: string, refresh: string): void {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }
  private clearTokens(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
  private adopt(pair: TokenPair): AuthUser {
    this.storeTokens(pair.access, pair.refresh);
    this.currentUser.set(pair.user);
    return pair.user;
  }

  // --- flows ---
  register(email: string, password: string, displayName: string, turnstileToken?: string) {
    return firstValueFrom(
      this.http.post<{ code: string; detail: string; email: string }>(`${this.base}/register/`, {
        email, password, display_name: displayName, turnstile_token: turnstileToken ?? '',
      }),
    );
  }

  async login(email: string, password: string): Promise<AuthUser> {
    return this.adopt(await firstValueFrom(this.http.post<TokenPair>(`${this.base}/login/`, { email, password })));
  }

  async confirmEmail(uid: string, token: string): Promise<AuthUser> {
    return this.adopt(await firstValueFrom(this.http.post<TokenPair>(`${this.base}/email/confirm/`, { uid, token })));
  }

  resendConfirmation(email: string) {
    return firstValueFrom(this.http.post(`${this.base}/email/resend/`, { email }));
  }

  forgotPassword(email: string, turnstileToken?: string) {
    return firstValueFrom(this.http.post(`${this.base}/forgot-password/`, { email, turnstile_token: turnstileToken ?? '' }));
  }

  resetPassword(uid: string, token: string, password: string) {
    return firstValueFrom(this.http.post(`${this.base}/reset-password/`, { uid, token, password }));
  }

  requestMagicLink(email: string, turnstileToken?: string) {
    return firstValueFrom(this.http.post(`${this.base}/magic-link/`, { email, turnstile_token: turnstileToken ?? '' }));
  }

  async verifyMagicLink(token: string): Promise<AuthUser> {
    return this.adopt(await firstValueFrom(this.http.post<TokenPair>(`${this.base}/magic-link/verify/`, { token })));
  }

  async logout(): Promise<void> {
    const refresh = this.refreshToken;
    if (refresh) {
      try {
        await firstValueFrom(this.http.post(`${this.base}/logout/`, { refresh }));
      } catch {
        /* blacklist best-effort */
      }
    }
    this.clearTokens();
    this.currentUser.set(null);
  }

  /** Refresh the access token, persisting the rotated refresh token. Returns the
   * new access token, or null if the refresh is invalid (session ended). */
  async refresh(): Promise<string | null> {
    const refresh = this.refreshToken;
    if (!refresh) return null;
    try {
      const res = await firstValueFrom(
        this.http.post<{ access: string; refresh: string }>(`${this.base}/token/refresh/`, { refresh }),
      );
      this.storeTokens(res.access, res.refresh); // persist the ROTATED refresh
      return res.access;
    } catch {
      this.clearTokens();
      this.currentUser.set(null);
      return null;
    }
  }

  private async me(): Promise<AuthUser> {
    return firstValueFrom(this.http.get<AuthUser>(`${this.base}/me/`));
  }

  /** Restore the session at app startup (called from an app initializer). */
  async bootstrap(): Promise<void> {
    if (!this.refreshToken) return;
    try {
      this.currentUser.set(await this.me());
    } catch {
      // access likely expired → try one refresh, then re-fetch
      if (await this.refresh()) {
        try {
          this.currentUser.set(await this.me());
        } catch {
          this.clearTokens();
        }
      }
    }
  }
}
